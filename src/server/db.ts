import { Pool } from "pg";
import { PlatformError } from "./errors";

const globalDb = globalThis as typeof globalThis & { lmsaPool?: Pool };
export function getPool(): Pool {
  if (!process.env.DATABASE_URL) throw new PlatformError("NOT_CONFIGURED", "Member services are not available yet. Please contact the chapter.", 503);
  if (!globalDb.lmsaPool) {
    globalDb.lmsaPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5,
      connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000, statement_timeout: 10000 });
    // Never log a driver error object: it can contain SQL and private values.
    globalDb.lmsaPool.on("error", () => console.error(JSON.stringify({ action: "database_pool", result: "unavailable" })));
  }
  return globalDb.lmsaPool;
}
