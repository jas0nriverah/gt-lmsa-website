import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import { validateMigrationTarget } from "./migration-target";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set DATABASE_URL explicitly. No default database is selected.");
  }
  const target = validateMigrationTarget(connectionString, {
    approvedRemote: process.argv.includes("--approved-remote-migration"),
  });
  const pool = new Pool({
    connectionString: target.connectionString,
    max: 1,
    connectionTimeoutMillis: 10_000,
  });
  let client: PoolClient | undefined;
  let lockAcquired = false;

  try {
    client = await pool.connect();
    await client.query("SELECT pg_advisory_lock(617291008)");
    lockAcquired = true;
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())");
    for (const name of (await readdir("migrations")).filter(f => f.endsWith(".sql")).sort()) {
      const sql = await readFile(`migrations/${name}`, "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const old = await client.query("SELECT checksum FROM schema_migrations WHERE name=$1", [name]);
      if (old.rowCount) {
        if (old.rows[0].checksum !== checksum) {
          throw new Error("Applied migration checksum changed; write a new migration instead.");
        }
        continue;
      }
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)", [name, checksum]);
        await client.query("COMMIT");
        console.info(`Applied ${name}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    try {
      if (client && lockAcquired) {
        await client.query("SELECT pg_advisory_unlock(617291008)");
      }
    } finally {
      try {
        client?.release();
      } finally {
        await pool.end();
      }
    }
  }
}

main().catch(() => {
  console.error("Migration failed. No partially applied migration was committed. Check the target schema and migration checksums.");
  process.exitCode = 1;
});
