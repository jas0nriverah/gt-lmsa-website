# Hosted setup status — September 28, 2026

The owner approved connecting the newly created Neon database to Vercel and initializing its schema. Subsequently the owner explicitly requested finishing and deploying the upgrade, and confirmed restricted runtime credentials stored in Vercel Production, public Google sign-in, and officer access for their verified account. These approvals supersede the earlier local-only restriction. Paid plans remain out of scope.

- Vercel project: `gt-lmsa/gt-lmsa-website`.
- Neon resource: `neon-chestnut-paddle`, project `lucky-shape-53387684`.
- Vercel showed **Free** plan and **Available** status.
- The integration reported successful connection to `gt-lmsa-website`. Only **Production** was selected; Preview and Development were excluded. Sensitive environment-variable handling remained enabled.
- The owner activated the Neon account. Preflight confirmed database `neondb`, role `neondb_owner`, no public application tables, and nine existing tables in Neon's separate `neon_auth` schema.
- Initialized the application `public` schema through Neon's SQL Editor in one explicit transaction with an advisory transaction lock. Submitted DDL corresponding to migrations `000`, `001`, and `002`, and recorded their source SHA-256 checksums. This was a console initialization, not execution of the CLI migration runner. The console reported `COMMIT`.
- Read-only verification afterward returned **13 public tables, 3 migration records, 0 identities, 0 members, 2 planned closed-registration events at version 1, and 0 audit records**. Recorded checksums matched the local migration files. No local synthetic identities were imported.
- Neon managed Better Auth was already enabled during provisioning. Its separate schema was left untouched; the application still uses its own Better Auth integration in `public`.
- No database credentials were copied into this repository or conversation.
- The owner enabled two-step verification; Google Cloud access is restored.
- Created dedicated Google Cloud project `lmsa-plus-georgia-tech` (LMSA Plus Georgia Tech) under the signed-in owner account with **No organization**, without selecting/attaching a billing account. The pre-existing My First Project was left unchanged.
- The owner approved using their personal email for OAuth support for now, with a possible later contact change or chapter administrator grant. Filled the approved address as support/developer contact and selected External audience (initial Testing mode). No chapter administrator has been granted access.
- After the owner's confirmation, accepted the Google API Services User Data Policy and created the web client `LMSA GT Production Website`. Its only JavaScript origin is `https://www.gt-lmsa.com`; its only redirect URI is `https://www.gt-lmsa.com/api/auth/callback/google`. The OAuth application remains External / Testing, not publicly launched.
- Saved `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `MEMBERSHIP_APPROVAL_ENABLED` as Vercel **Secret** variables scoped to **Production only**. The auth URL uses the canonical www domain; membership approval is enabled. Vercel confirmed successful addition and listed all five variables. No credential values are recorded here. Cleared the setup clipboard afterward.
- Runtime least-privilege database access, OAuth launch/testing, and deployment remain unfinished. The portal is not ready for real member data. No real-provider login or deployed application-to-database connection has been verified. Saving environment variables does not update an existing deployment or the unconfigured local preview.

## Release preparation update

- Google OAuth audience now shows **In production**. Branding links point to the canonical homepage and `/privacy`; no sensitive/restricted Google scopes were added.
- Created `lmsa_app` through SQL with no elevated role attributes or inherited memberships. Applied the minimal table grants in one console transaction and verified COMMIT, no schema-creation access, no migration-table access, no officer-grant rights, and no audit update/delete access. Events have the required read/write privileges.
- Neon's UI-created `lmsa_runtime` role had administrator-like provider defaults. Attempts to remove its provider membership/disable login were rejected. With explicit owner confirmation, the unused role was deleted through Neon and its removal verified. It owned no application objects; the restricted `lmsa_app` role and all tables remain intact.
- Removed the automatic Neon project connection to eliminate all injected owner credentials, without deleting the Neon database. Saved only the restricted `lmsa_app` connection as the Production Secret `DATABASE_URL`. Vercel now lists exactly six application variables, all Production Secrets; no owner credential remains in that project configuration.
- Re-ran 31 unit tests, 18 PostgreSQL integration tests, lint, type checks, and optimized build successfully. Production dependency audit reports zero known vulnerabilities. Luna reviewed auth/API boundaries and prepared a transactional runtime grant script; the coordinator reviewed those outputs. The script's success and rollback behavior were tested on isolated local PostgreSQL.

Next: push the reviewed release candidate, verify hosted CI, deploy, and test the actual Google sign-in and deployed database paths. Configuration success alone is not a working member-portal claim.
