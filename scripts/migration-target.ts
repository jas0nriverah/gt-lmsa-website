const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);
const SSL_MODES = new Set([
  "disable",
  "allow",
  "prefer",
  "require",
  "verify-ca",
  "verify-full",
]);

export interface MigrationTarget {
  connectionString: string;
  isRemote: boolean;
}

export interface MigrationTargetOptions {
  approvedRemote?: boolean;
}

/**
 * Validate a PostgreSQL URL before passing it to `pg`.
 *
 * `pg` accepts connection options in the URL query string, including options
 * that can replace the authority or database path. Only the non-routing
 * `sslmode` option is supported here; encoded parameter names are decoded by
 * URLSearchParams before they are checked.
 */
export function validateMigrationTarget(
  connectionString: string,
  options: MigrationTargetOptions = {},
): MigrationTarget {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL.");
  }

  if (!POSTGRES_PROTOCOLS.has(url.protocol)) {
    throw new Error("DATABASE_URL must use the postgres or postgresql protocol.");
  }
  if (!url.hostname) {
    throw new Error("DATABASE_URL must include an explicit database host.");
  }

  let databaseName: string;
  try {
    databaseName = decodeURIComponent(url.pathname.slice(1));
  } catch {
    throw new Error("DATABASE_URL must include a valid database path.");
  }
  if (!databaseName || databaseName.includes("\0")) {
    throw new Error("DATABASE_URL must include an explicit database name.");
  }
  if (url.hash) {
    throw new Error("DATABASE_URL must not include a fragment.");
  }

  const queryParameters = [...url.searchParams.entries()];
  if (queryParameters.some(([key]) => key !== "sslmode")) {
    throw new Error("DATABASE_URL query parameters may only contain sslmode.");
  }
  if (queryParameters.length > 1) {
    throw new Error("DATABASE_URL may contain sslmode at most once.");
  }
  if (queryParameters.length === 1 && !SSL_MODES.has(queryParameters[0][1])) {
    throw new Error("DATABASE_URL contains an unsupported sslmode value.");
  }

  const isRemote = !LOCAL_HOSTS.has(url.hostname.toLowerCase());
  if (isRemote && !options.approvedRemote) {
    throw new Error(
      "Remote migrations require owner approval and --approved-remote-migration.",
    );
  }

  return { connectionString, isRemote };
}
