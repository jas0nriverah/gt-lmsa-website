# LMSA+ member platform guide

The member platform and redesigned public pages are implemented. The owner authorized the September 28 release, hosted PostgreSQL and Google OAuth setup, restricted Production credentials, and explicit verified-account officer bootstrap. See [the provisioning report](PROVISIONING-STATUS.md) for current deployment evidence and [the verification report](VERIFICATION.md) for test results and limitations. This guide itself does not authorize future infrastructure or data changes.

For concrete request/response examples and three UI-to-database traces, read [the request walkthrough](REQUEST-WALKTHROUGH.md).

The owner approved local development dependency and database setup on September 27, 2026, then production setup, commits, pushes, and deployment on September 28. Those explicit approvals supersede the older local-only restriction. Paid services remain out of scope.

## Local development

### Prerequisites

- Node.js 22 recommended (the `package.json` engine floor is Node 20).
- PostgreSQL 17, running on loopback.
- A Google OAuth web client for a real local Google sign-in flow. This is not needed by the synthetic fixture tests. No Google account verification was performed by those fixtures.

The reviewed browser session used an isolated loopback PostgreSQL cluster on port `55432`, not a Homebrew-managed service. For a reproducible macOS setup, Homebrew is one owner-approved option:

```bash
brew install postgresql@17
brew services start postgresql@17
createdb -h localhost -p 5432 lmsa_dev
createdb -h localhost -p 5432 lmsa_test
npm ci
cp .env.example .env.local
```

The checked-in example URLs use port `55432`; Homebrew's default is commonly `5432`. Set both URLs in `.env.local` to the port actually used by your local PostgreSQL server. `.env.local` is ignored by Git. Generate a local Better Auth secret, for example with `openssl rand -base64 32`, and replace the placeholder. Never copy real secrets into `.env.example`, tests, workflow files, or screenshots.

Configure the Google OAuth web client with the local origin `http://localhost:3000` and redirect URI `http://localhost:3000/api/auth/callback/google`. Put its client ID and secret only in `.env.local`. Better Auth's [Google provider setup](https://www.better-auth.com/docs/authentication/google) documents the provider flow. Real provider configuration is separate from the browser fixtures described below.

The important local variables are:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection for the app and migration runner. |
| `TEST_DATABASE_URL` | Integration/fixture database; must be loopback and end in `_test`. |
| `BETTER_AUTH_URL` | Auth base URL; local default is `http://localhost:3000`. |
| `BETTER_AUTH_SECRET` | At least 32 characters; keep it private. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth client values for actual local provider login. |
| `MEMBERSHIP_APPROVAL_ENABLED` | Owner-confirmed `true` for the current pending-then-officer-approval policy. This enables the officer status action; it does not auto-approve members or authorize production. |

Next loads `.env.local` for `npm run dev`. The standalone `tsx` migration and test scripts do not automatically load it, so pass the intended database explicitly. For example, with the example port:

```bash
DATABASE_URL=postgresql://localhost:55432/lmsa_dev npm run db:migrate
npm run dev
```

The ordered migrations are applied to the PostgreSQL `public` schema: `000-auth.sql` creates Better Auth identity/session tables; `001-platform.sql` creates the member platform and seeds two undated, closed-registration planned chapter events; `002-security-audit.sql` adds event versions and officer activity history. The dates remain unconfirmed; do not infer or publish a meeting time or venue.

To exercise the platform locally, migrate the isolated test database first, then run the integration suite:

```bash
DATABASE_URL=postgresql://localhost:55432/lmsa_test npm run db:migrate
TEST_DATABASE_URL=postgresql://localhost:55432/lmsa_test npm run test:integration
```

The service integration suite creates and drops a unique temporary schema. The HTTP integration test instead checks Better Auth and platform tables in the test database's `public` schema, so all migrations through `002` must already have run there. Both test suites serialize execution. Never point either test variable at a database containing real member data. Test URLs reject query parameters to prevent connection-option routing overrides; migration URLs permit only one supported `sslmode` parameter.

An officer identity is granted out-of-band; there is no first-user promotion or HTTP officer-grant endpoint. `scripts/grant-officer.ts` selects an existing verified Better Auth identity. Its explicit command is:

```bash
DATABASE_URL=postgresql://localhost:55432/lmsa_dev \
  npm run db:grant-officer -- VERIFIED_USER_ID --confirm
```

Use only after explicit owner approval and only against the intended local database. The grant script itself does not enforce a loopback host. It is not a production bootstrap guide.

### Synthetic browser fixtures

`scripts/preview-test-platform.ts` is a local development/test harness, not application code and not an authentication endpoint in the production app. It requires `TEST_DATABASE_URL` for a PostgreSQL loopback database ending in `_test`, creates synthetic member/officer identities and sessions, launches Next on `127.0.0.1:3100`, and serves fixture redirects on `127.0.0.1:3111`. Its fake OAuth values do not contact Google and do not verify a real Google account. The fixture server is separate from the app and must never be exposed publicly. The script cleans up only identities created for that invocation.

After migrating the test database's public schema, run `TEST_DATABASE_URL=postgresql://localhost:55432/lmsa_test npm run test:e2e`. Playwright starts this fixture script itself and refuses any non-loopback or non-`_test` database. The browser journeys use only the existing `/member` and `/officer` fixture URLs for synthetic sessions; they do not add an application test-login path.

Browser scenarios built on this harness may validate UI authorization and member flows, but cannot be described as Google OAuth end-to-end validation. The isolated fixtures and automated browser tests are not yet evidence of real-user behavior. Do not add a test-login route to the app.

## Architecture and data ownership

The platform is one Next.js application. Server-side route handlers use parameterized SQL via `pg` and PostgreSQL; Better Auth manages Google sign-in and database-backed sessions. There is no separate API server, browser database credential, password-login flow, or Redis dependency. No paid service is required for the local architecture.

Identity, membership, and officer authorization are separate:

1. Better Auth verifies the Google identity and session. Platform actors come from that server-side session, not request payloads.
2. A verified identity creates or edits its own member profile. New profiles start `pending`; Google verification does not establish Georgia Tech affiliation or membership.
3. An officer is a separately granted user ID in `officers`. Each private officer operation checks this table. Membership-status changes also require `MEMBERSHIP_APPROVAL_ENABLED=true`.

PostgreSQL owns chapter event records when configured. The static event records are reserved for national, campus, and external events; database failure is reported as unavailable rather than falling back to stale chapter events.

### Schema at a glance

| Tables | Purpose and notable relationships |
|---|---|
| `user`, `session`, `account`, `verification`, `rateLimit` | Better Auth identities, sessions, Google account records, verification state, and auth throttling. Sessions include IP address and user agent columns; account schema includes OAuth token columns, with token encryption enabled in auth configuration. |
| `members` | One profile per identity; name, normalized email, pending/active/suspended status, academic year, major, and interests. User deletion cascades to the profile. |
| `events` | Chapter event content, optional confirmed instants, publication and registration state, optional capacity, and an integer edit version. Seed events are published but undated and closed. |
| `officer_audit` | Officer action, actor/target IDs, server request ID, timestamp, and minimal status/count/version metadata. No names, emails, event free text, or ticket codes. Application exposes read-only history, not tamper-proof storage. |
| `registrations` | Unique member/event pair; registered/cancelled status; ticket SHA-256 hash and expiry, never the raw ticket. |
| `attendance` | At most one check-in per registration and the officer/time that recorded it. Officer identity is `ON DELETE RESTRICT`. |
| `officers` | Explicit officer grants keyed to Better Auth user ID. No officer is seeded by migration. |
| `app_rate_limits` | Hashed bucket key, counter, and expiry for application throttling. |
| `schema_migrations` | Migration name, SHA-256 checksum, and apply time. Applied migration contents are immutable; add a new migration instead. |

RSVP/cancel/re-registration, capacity or event-status changes, ticket issuance, and check-in lock the event row first and run transactionally. Capacity and membership are rechecked under lock. The unique member/event and attendance constraints provide additional protection. A ticket is random and opaque, its hash is stored, and its expiry is event end plus two hours. Check-in accepts a published event, active member, current registration, and the window from one hour before start through two hours after end. Unknown event times deny check-in. Duplicate check-in preserves its first timestamp and officer.

### HTTP surface

Application API routes are under `/api/platform`; Better Auth handles `/api/auth/*`. Successful platform responses use `{ "data": ... }`; errors use `{ "error": { "code", "message", "requestId" } }`. Responses are `no-store`. Mutations require same-origin `Origin` and JSON, with a 16 KiB body limit. Lists are paginated (`page` 1-based, `pageSize` 1–50); search `q` is capped at 100 characters.

| Endpoint | Methods | Access / behavior |
|---|---|---|
| `/me` | GET, POST, PATCH | Verified identity reads/saves its own allow-listed member profile. Caller cannot set email, identity, membership status, or role. |
| `/me/registrations` | GET | Own registrations only. |
| `/events`, `/events/:id` | GET | Public published/cancelled event data; supports filters and paging. |
| `/events/:id/rsvp` | POST | Own active membership registers idempotently. |
| `/events/:id/rsvp` | DELETE | Cancels the caller's own registration idempotently. Requires an existing profile, but not active membership, so pending/suspended members can withdraw. |
| `/events/:id/ticket` | POST | Issues/rotates the signed-in member's current check-in ticket. |
| `/officer/members` | GET | Officer-only member list. |
| `/officer/members/:id/status` | PATCH | Officer-only; additionally gated by the membership approval configuration. |
| `/officer/events` | GET | Officer-only event listing, including drafts. |
| `/officer/events` | POST | Officer-only event creation. |
| `/officer/events/:id` | GET, PATCH | Officer-only event read (including drafts); full update requires `expectedVersion`. Stale edits return HTTP 409 `STALE_EVENT`. |
| `/officer/audit` | GET | Officer-only paginated action history; optional `action` filter from the fixed allowlist. |
| `/officer/events/:id/registrations` | GET | Officer-only roster with approved member contact fields. |
| `/officer/events/:id/check-in` | POST | Officer-only; exactly one ticket token or registration ID. |
| `/officer/events/:id/export` | GET | Officer-only bounded CSV; no ticket tokens. Formula-leading spreadsheet values are escaped. |
| `/officer/analytics` | GET | Officer-only aggregates derived from stored platform records; no fabricated counts. |

Private platform routes require a verified Better Auth session. Officer membership is read from the database for each private operation, so revoking the grant affects an existing session. Public and member/officer rate limits are database-backed. The route layer logs request metadata rather than URL or payload values; auth provider/driver error-object logging is disabled to avoid leaking private values. Successful officer mutations and their audit entries commit together; duplicate check-in and unchanged status/event saves do not create duplicate change entries. CSV generation also records an activity entry before returning data.

## Privacy, retention, and release gate

The app stores more than the public interest form: member names and emails, academic year, major, interests, event registrations, attendance, officer grants, authentication/session data, and rate-limit metadata. Officers can see member contact data and event rosters; public event endpoints expose only published/cancelled event records. CSV export is officer-only and bounded to 10,000 rows.

Important unresolved production questions:

- No approved retention schedule, deletion/account-closure workflow, or cleanup job is implemented for member profiles, registrations, attendance, expired sessions, rate-limit rows, or backups. Schema cascades are not a retention policy; attendance can also restrict deleting an officer identity.
- The auth schema has OAuth access/refresh/ID token columns, and `auth.ts` sets Better Auth's `encryptOAuthTokens: true`. Before production, verify encryption/decryption with the production secret and actual provider flow, confirm which tokens/scopes are persisted, minimize scopes, and decide retention. See Better Auth's [`encryptOAuthTokens` configuration](https://www.better-auth.com/docs/reference/options).
- Decide who can access the database, backups, exports, and incident records; approve member-facing privacy language and a process for access/deletion requests; determine incident response and notification responsibilities.
- Set and approve retention periods only after the chapter decides the applicable policy. Do not invent a period in code or documentation.

Use synthetic data only in automated tests. Before real membership data is accepted, document data ownership, purpose and minimum fields, access control, retention/deletion, backup retention, incident response, and token protection; implement and test the approved policy.

## Tests and CI

The package scripts are explicit:

| Command | What it runs |
|---|---|
| `npm test` | Unit tests in `src/lib/*.test.ts`, validation/UI-date/API-helper tests, and test/migration-target guard tests; no running database required. |
| `npm run test:e2e` | Playwright journeys in `tests/e2e/platform.spec.ts`, using the local synthetic member/officer fixtures and public pages; requires a migrated loopback `_test` database and Chromium. |
| `npm run test:integration` | `tests/*.integration.test.ts`, serialized, against a loopback PostgreSQL database named with `_test`. Includes service-level isolated-schema tests and HTTP route tests using synthetic signed Better Auth sessions. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `next typegen && tsc --noEmit`. |
| `npm run build` | Next production build; this is not a deployment. |

For HTTP integration, migrate the test database's `public` schema before running tests:

```bash
DATABASE_URL=postgresql://localhost:55432/lmsa_test npm run db:migrate
TEST_DATABASE_URL=postgresql://localhost:55432/lmsa_test npm run test:integration
```

The HTTP test inserts synthetic verified/unverified/expired identities and checks authorization, ownership, CSRF, input bounds, RSVP, tickets, check-in, CSV, sign-out, and fail-closed configuration. It invokes application route handlers with a local PostgreSQL database; it does not launch a browser or contact Google. Service integration tests use a separate random schema and drop it afterward.

The CI workflow uses PostgreSQL 17 with a local `lmsa_test` service, passes both `DATABASE_URL` (for `npm run db:migrate`) and `TEST_DATABASE_URL` (for integration and browser fixtures), then runs lint, typecheck, unit tests, migration, integration, build, and Playwright. Chromium is installed in the hosted CI job. CI has no deployment job and no production credentials.

Main-controlled manual browser review on September 27, 2026 used synthetic local sessions. It verified pending profile creation and persistence after reload; officer approval and creation of an event with an explicit Atlanta-local date/time; regular-member denial at the officer page; RSVP, cancellation, re-registration, and ticket copy; officer check-in by opaque token and duplicate manual registration-ID check-in preserving the original 11:09 timestamp; analytics showing 1 active member, 1 RSVP, 1 attendee, and 100% attendance; MCAT search returning two resources and the Medical school filter returning one at a 390-pixel viewport without horizontal overflow; and HTTP 200 responses for all 14 public routes checked. These are local synthetic-data checks, not production evidence or real Google OAuth verification. The authored automated Playwright suite has not been run here; a real Google provider flow and the first GitHub CI run remain unverified.

## Release readiness (not yet approved)

Production setup is not in place. No production PostgreSQL, Better Auth URL/secret, Google OAuth client, data-retention policy, backups, restore test, monitoring, deployment, or production migration has been approved. The existing public website being live does not mean the member platform is ready to release. This guide provides no production provisioning commands.

Before a separately authorized launch:

1. Approve the data inventory, privacy language, member deletion and retention behavior, token storage/encryption, officer access process, incident response, and support ownership.
2. Choose the production host/database and security configuration; document secrets ownership, TLS, network access, least-privilege roles, rate limits, alerts, and recovery responsibilities. Reassess provider defaults before storing real student information.
3. Define recovery point/time objectives, encrypted off-site backup frequency and retention, and access controls. Take a pre-release backup and prove a restore into a non-production environment. A [local synthetic recovery drill](LOCAL-RECOVERY-DRILL.md) has been performed; there is no production backup automation or production restore evidence.
4. Review migration SQL and test results. The runner acquires a PostgreSQL advisory lock, checks checksums, and wraps each migration in a transaction. It has no down-migrations. Prefer additive, backward-compatible changes and forward fixes.
5. Obtain explicit owner approval for production setup, each remote migration, deployment, and any commit/push. The migration runner's `--approved-remote-migration` option only bypasses its loopback guard; it does not grant approval.

Rollback plan to design and rehearse before launch: if an application release fails, restore the prior compatible application version while preserving backward-compatible schema. Do not assume a code rollback can reverse data or schema changes. For a database incident, assess writes since the restore point, take an incident copy, and use the approved recovery procedure; restoring a backup can discard later writes and requires an explicit recovery decision. Record who authorizes recovery and reconcile any lost registrations/check-ins. Never run an untested destructive rollback against production.

## Five learning exercises

Use local synthetic identities and the `_test` database only.

1. Trace a Google identity through Better Auth, a pending member profile, and the separately granted officer table. Explain why verified Google email does not establish membership or officer status.
2. Apply migrations to a fresh local test database and inspect the two seeded events. Verify the event dates remain null and registration remains closed until an officer confirms logistics.
3. Add a focused validation test for an allow-listed member/event input edge case, then confirm a client cannot set its own email, identity, membership status, or role.
4. Extend a PostgreSQL integration case around a last-seat RSVP, cancellation/re-registration, ticket expiry, or duplicate check-in; assert the transaction/constraint outcome rather than only the UI response.
5. Run the synthetic member/officer browser preview and trace one request from page action through the route, server-side actor check, parameterized query, and response envelope. Verify a normal member receives 403 for officer data; distinguish this test from real Google OAuth.

## Resume bullet drafts (claim only work personally completed)

- Built a Next.js member and event platform using Better Auth and PostgreSQL, separating verified identity from pending membership and database-granted officer authorization.
- Implemented transactional event registration, capacity checks, cancellation/re-registration, expiring hashed check-in tickets, officer check-in, and bounded CSV export.
- Added checksummed PostgreSQL migrations and synthetic-session unit/integration coverage for authorization, ownership, CSRF, registration, and attendance workflows.
- Added a CI workflow for lint, typecheck, unit tests, PostgreSQL-backed integration tests, and production compilation.

These are implementation descriptions, not evidence of deployment, real Google sign-in verification, production use, traffic, adoption, or performance metrics. Add only facts you can personally substantiate.
