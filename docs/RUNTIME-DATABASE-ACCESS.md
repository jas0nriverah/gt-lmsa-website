# Runtime database access

The deployed application should connect with the dedicated PostgreSQL login role `lmsa_app`. Keep it separate from migration and operator roles. It must not own the database, `public` schema, tables, or other objects; have elevated role attributes; or belong to another role. The application role receives no DDL rights and no access to `public.schema_migrations`.

Create `lmsa_app` through SQL with explicitly limited attributes:

```sql
CREATE ROLE lmsa_app LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
```

Neon UI-created convenience roles may come with `CREATEDB`, `CREATEROLE`, `BYPASSRLS`, or membership in `neon_superuser`; those roles are unsuitable for application traffic. Do not try to fix a provider-managed superuser membership by revoking it from an owner role. The SQL grant script rejects elevated attributes and role memberships, so it fails closed if the target is not a dedicated application role. The grant script does not create or set a password on the role; provision the generated credential separately.

## Provision and grant

1. Apply the checked-in migrations using the migration process and its privileged connection. The migration process creates and updates `schema_migrations`; do not run migrations with the application credential.
2. Create `lmsa_app` as a dedicated login role with a strong credential and explicitly without `SUPERUSER`, `CREATEDB`, `CREATEROLE`, `REPLICATION`, or `BYPASSRLS`; do not grant it membership in another role. Use the provider's supported SQL path for this limited role. Do not put its password in this repository, a SQL file, shell history, or deployment logs. Store it in the application's secret manager as part of `DATABASE_URL`.
3. Using a database owner or administrator connection to the target database, run the grant script with `psql`:

   ```sh
   psql "$DATABASE_ADMIN_URL" -X -v ON_ERROR_STOP=1 -f scripts/runtime-role.sql
   ```

   The script runs in an explicit transaction, normalizes direct grants for this role in the current database, grants `CONNECT`, `USAGE` on `public`, and only the table DML used by Better Auth and the platform. It never creates or changes the login credential. It expects migrations to have run and `public.schema_migrations` to exist. Any failed verification aborts the transaction, so the grant changes are rolled back. Run it once per database, and rerun it after schema changes or changes to application database operations.

4. Configure the deployed runtime's `DATABASE_URL` with the `lmsa_app` username and the credential held in the secret manager. Keep `DATABASE_URL` out of build logs and diagnostic output. Migration and operator tools must continue to use their separate privileged connection.

If `psql` reports that the role can create objects in `public`, inspect effective grants on that schema. The script does not revoke a grant from `PUBLIC`, because that would affect every database user; have the database administrator correct the shared schema policy, then rerun the script.

## Granted access

| Tables | Runtime privileges | Reason |
| --- | --- | --- |
| `user`, `session`, `account`, `verification`, `rateLimit` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Better Auth identity, OAuth account, session, verification, and database rate limit lifecycle |
| `members`, `events`, `registrations` | `SELECT`, `INSERT`, `UPDATE` | Platform reads, membership intake and approval, event management, and registration lifecycle |
| `attendance` | `SELECT`, `INSERT` | Check in attendees and read attendance for the platform |
| `officers` | `SELECT` | Check the officer flag; granting officers remains an operator action |
| `officer_audit` | `SELECT`, `INSERT` | Record and inspect officer actions |
| `app_rate_limits` | `SELECT`, `INSERT`, `UPDATE` | Platform request rate limiting with `ON CONFLICT` |

The role receives no platform-table `DELETE`, no `TRUNCATE`, `REFERENCES`, or `TRIGGER` privileges, and no sequence privileges are needed by the current UUID/text-keyed schema. Platform authorization checks remain in server code; PostgreSQL table grants do not distinguish public, member, and officer rows.

## Verification

The grant script checks the target role's attributes and memberships, confirms required tables exist and are not owned by the runtime, checks that the role cannot create in `public` or the database, verifies Better Auth DML, and fails if the runtime has any effective privilege on `schema_migrations` or excess table DML. A successful run commits only after all checks pass; with `psql`, require exit code 0. Database `TEMP` is not required to be absent: PostgreSQL may grant it to `PUBLIC` by default, it is not persistent DDL, and this script does not change the shared `PUBLIC` grant.

You can also check the effective state from an administrator session, substituting the role name if needed:

```sql
SELECT
  r.rolname,
  r.rolsuper,
  r.rolcreatedb,
  r.rolcreaterole,
  r.rolbypassrls,
  has_database_privilege(r.rolname, current_database(), 'CREATE') AS database_create,
  has_schema_privilege(r.rolname, 'public', 'USAGE') AS public_usage,
  has_schema_privilege(r.rolname, 'public', 'CREATE') AS public_create,
  has_table_privilege(r.rolname, 'public.schema_migrations', 'SELECT') AS can_read_migrations,
  has_table_privilege(r.rolname, 'public.events', 'SELECT') AS can_read_events,
  has_table_privilege(r.rolname, 'public.events', 'UPDATE') AS can_update_events,
  has_table_privilege(r.rolname, 'public.events', 'DELETE') AS can_delete_events
FROM pg_roles AS r
  WHERE r.rolname = 'lmsa_app';
```

Expected values: `rolsuper`, `rolcreatedb`, `rolcreaterole`, `database_create`, `public_create`, `can_read_migrations`, and `can_delete_events` are false; `public_usage`, `can_read_events`, and `can_update_events` are true. `rolbypassrls` should also be false. Review ownership separately if desired:

```sql
SELECT n.nspname, c.relname, pg_get_userbyid(c.relowner) AS owner
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
  AND pg_get_userbyid(c.relowner) = 'lmsa_app';
```

This query should return no rows. The runtime grants are safe to reapply; the script does not alter existing migrations or execute them.
