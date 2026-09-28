import { isIP } from "node:net";

/** Validate and return a PostgreSQL URL that is safe for disposable test data. */
export function validateTestDatabaseUrl(raw: string | undefined): string {
  if (!raw || raw.trim() !== raw || /[\u0000-\u001f\u007f]/.test(raw)) {
    throw new Error("Set TEST_DATABASE_URL to a loopback PostgreSQL database ending in _test.");
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    throw new Error("TEST_DATABASE_URL must be a PostgreSQL URL for a loopback _test database.");
  }

  const hostname = target.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const isLoopback = hostname === "localhost" || hostname === "::1" ||
    (isIP(hostname) === 4 && hostname.startsWith("127."));
  const queryIndex = raw.indexOf("?");
  const fragmentIndex = raw.indexOf("#");
  const hasQuery = queryIndex !== -1 && (fragmentIndex === -1 || queryIndex < fragmentIndex);
  const hasFragment = fragmentIndex !== -1;
  const encodedDatabase = target.pathname.startsWith("/") ? target.pathname.slice(1) : "";
  let invalidDatabasePath = !encodedDatabase || encodedDatabase.includes("/");

  let database = "";
  try {
    database = decodeURIComponent(encodedDatabase);
  } catch {
    invalidDatabasePath = true;
  }
  if (!database || database.includes("\0") || database.includes("/")) invalidDatabasePath = true;

  if (!(target.protocol === "postgres:" || target.protocol === "postgresql:") ||
      !isLoopback || invalidDatabasePath || !database.endsWith("_test") || hasQuery || hasFragment) {
    throw new Error("Refusing test database URL: use a loopback PostgreSQL database ending in _test without query parameters or fragments.");
  }

  return raw;
}
