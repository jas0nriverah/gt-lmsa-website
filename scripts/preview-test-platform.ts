// Synthetic browser fixtures only. This is never imported by the application.
// Runs a loopback Next dev server and a separate short-lived session fixture server.
import { spawn } from "node:child_process";
import { once } from "node:events";
import { randomBytes, randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { Pool } from "pg";
import { serializeSignedCookie } from "better-call";
import { validateTestDatabaseUrl } from "./test-database";

const NEXT_PORT = 3100;
const FIXTURE_PORT = 3111;
const LOOPBACK = "127.0.0.1";
const roles = ["member", "officer"] as const;
type FixtureRole = (typeof roles)[number];

async function createSyntheticIdentities(
  pool: Pool,
  userIds: string[],
  cookies: Record<FixtureRole, string>,
  secret: string,
): Promise<void> {
  const client = await pool.connect();
  let inTransaction = false;
  let transactionFailed = false;

  try {
    await client.query("BEGIN");
    inTransaction = true;

    for (const role of roles) {
      const id = randomUUID();
      const token = randomBytes(32).toString("hex");
      userIds.push(id);
      await client.query(
        'INSERT INTO "user" (id,name,email,"emailVerified","createdAt","updatedAt") VALUES($1,$2,$3,true,now(),now())',
        [id, `Synthetic ${role}`, `${id}@example.test`],
      );
      await client.query(
        'INSERT INTO "session" (id,token,"userId","expiresAt","createdAt","updatedAt") VALUES($1,$2,$3,now()+interval \'2 hours\',now(),now())',
        [randomUUID(), token, id],
      );
      if (role === "officer") {
        await client.query("INSERT INTO officers(user_id) VALUES($1)", [id]);
      }
      cookies[role] = await serializeSignedCookie("better-auth.session_token", token, secret, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 7200,
      });
    }

    await client.query("COMMIT");
    inTransaction = false;
  } catch (error) {
    transactionFailed = true;
    if (inTransaction) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // The outer cleanup also covers a connection loss during the transaction.
      }
    }
    throw error;
  } finally {
    client.release(transactionFailed ? new Error("Synthetic identity setup transaction failed.") : undefined);
  }
}

function listenOnLoopback(server: Server, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    const onError = (error: Error) => {
      server.off("listening", onListening);
      reject(error);
    };

    server.once("listening", onListening);
    server.once("error", onError);
    server.listen(port, LOOPBACK);
  });
}

async function closeServer(server: Server): Promise<void> {
  if (!server.listening) return;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

async function stopChild(
  child: ReturnType<typeof spawn>,
  isClosed: () => boolean,
  closed: Promise<void>,
): Promise<void> {
  if (isClosed()) return;

  try {
    child.kill("SIGTERM");
  } catch {
    // Continue waiting; the process may already be exiting.
  }

  const forceKill = setTimeout(() => {
    if (!isClosed()) {
      try {
        child.kill("SIGKILL");
      } catch {
        // The close event remains the source of truth for shutdown completion.
      }
    }
  }, 5_000);
  forceKill.unref();

  try {
    await closed;
  } finally {
    clearTimeout(forceKill);
  }
}

async function deleteSyntheticIdentities(pool: Pool, userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;

  const client = await pool.connect();
  let inTransaction = false;
  let transactionFailed = false;
  try {
    await client.query("BEGIN");
    inTransaction = true;
    await client.query("DELETE FROM attendance WHERE officer_user_id=ANY($1::text[])", [userIds]);
    const auditTable = await client.query<{ present: boolean }>(
      "SELECT to_regclass('officer_audit') IS NOT NULL AS present",
    );
    if (auditTable.rows[0]?.present) {
      await client.query("DELETE FROM officer_audit WHERE actor_user_id=ANY($1::text[])", [userIds]);
    }
    await client.query('DELETE FROM "user" WHERE id=ANY($1::text[])', [userIds]);
    await client.query("COMMIT");
    inTransaction = false;
  } catch (error) {
    transactionFailed = true;
    if (inTransaction) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original cleanup failure for the caller.
      }
    }
    throw error;
  } finally {
    client.release(transactionFailed ? new Error("Synthetic identity cleanup transaction failed.") : undefined);
  }
}

async function main(): Promise<void> {
  const databaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
  const pool = new Pool({ connectionString: databaseUrl });
  const secret = randomBytes(48).toString("base64url");
  const userIds: string[] = [];
  const cookies: Record<FixtureRole, string> = { member: "", officer: "" };

  let fixtures: Server | undefined;
  let child: ReturnType<typeof spawn> | undefined;
  let childClosed = false;
  let childClosedPromise: Promise<void> = Promise.resolve();
  let shutdownRequested = false;
  let exitCode = 0;
  let cleanupPromise: Promise<void> | undefined;
  let resolveLifecycle!: () => void;
  const lifecycle = new Promise<void>((resolve) => {
    resolveLifecycle = resolve;
  });

  const requestShutdown = (failed = false) => {
    if (failed) exitCode = 1;
    if (!shutdownRequested) {
      shutdownRequested = true;
      resolveLifecycle();
    }
  };
  const onSignal = () => requestShutdown();

  const cleanup = (): Promise<void> => {
    if (cleanupPromise) return cleanupPromise;

    cleanupPromise = (async () => {
      let failed = false;
      if (child) {
        try {
          await stopChild(child, () => childClosed, childClosedPromise);
        } catch {
          failed = true;
        }
      }
      if (fixtures) {
        try {
          await closeServer(fixtures);
        } catch {
          failed = true;
        }
      }
      try {
        await deleteSyntheticIdentities(pool, userIds);
      } catch {
        failed = true;
      }
      try {
        await pool.end();
      } catch {
        failed = true;
      }

      if (failed) {
        exitCode = 1;
        console.error("Synthetic preview cleanup was incomplete.");
      }
    })();
    return cleanupPromise;
  };

  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  try {
    if (!shutdownRequested) {
      await createSyntheticIdentities(pool, userIds, cookies, secret);
    }

    if (!shutdownRequested) {
      fixtures = createServer((request, response) => {
        const role = request.url === "/member" ? "member" :
          request.url === "/officer" ? "officer" : undefined;
        if (request.method !== "GET" || !role || !cookies[role]) {
          response.writeHead(404);
          response.end("Synthetic member or officer fixture only.");
          return;
        }

        response.writeHead(302, {
          "Set-Cookie": cookies[role],
          Location: `http://${LOOPBACK}:${NEXT_PORT}/${role}`,
          "Cache-Control": "no-store",
        });
        response.end();
      });
      fixtures.on("error", () => {
        if (!shutdownRequested) {
          console.error("Synthetic fixture server failed; shutting down.");
          requestShutdown(true);
        }
      });
      await listenOnLoopback(fixtures, FIXTURE_PORT);
    }

    if (!shutdownRequested) {
      child = spawn(
        process.execPath,
        ["node_modules/next/dist/bin/next", "dev", "--hostname", LOOPBACK, "--port", String(NEXT_PORT)],
        {
          stdio: "inherit",
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
            BETTER_AUTH_URL: `http://${LOOPBACK}:${NEXT_PORT}`,
            BETTER_AUTH_SECRET: secret,
            GOOGLE_CLIENT_ID: "synthetic-not-a-real-google-client",
            GOOGLE_CLIENT_SECRET: "synthetic-no-provider-access",
            MEMBERSHIP_APPROVAL_ENABLED: "true",
          },
        },
      );
      childClosedPromise = new Promise<void>((resolve) => {
        child?.once("close", () => {
          childClosed = true;
          resolve();
        });
      });
      child.on("error", () => {
        if (!shutdownRequested) requestShutdown(true);
      });
      child.on("exit", () => {
        if (!shutdownRequested) {
          console.error("Synthetic Next server exited unexpectedly; cleaning up.");
          requestShutdown(true);
        }
      });

      await once(child, "spawn");
    }

    if (!shutdownRequested) {
      console.info(`Synthetic browser preview: http://${LOOPBACK}:${NEXT_PORT} — fixtures on loopback port ${FIXTURE_PORT}. Google OAuth is not connected.`);
      await lifecycle;
    }
  } catch {
    requestShutdown(true);
    console.error("Synthetic preview could not start. Check the local test database and ports.");
  } finally {
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
    await cleanup();
  }

  process.exitCode = exitCode;
}

main().catch(() => {
  console.error("Synthetic preview could not start. Check the local test database and ports.");
  process.exitCode = 1;
});
