# LMSA+ at Georgia Tech

Public chapter website and PostgreSQL-backed member/events platform for the Latino Medical Student Association Plus chapter at Georgia Tech.

Public site: [www.gt-lmsa.com](https://www.gt-lmsa.com)

Implementation contract: [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md)

Platform setup, API, privacy and release guide: [docs/PLATFORM-GUIDE.md](docs/PLATFORM-GUIDE.md)

Feature status and actual verification results: [docs/VERIFICATION.md](docs/VERIFICATION.md)

UI-to-database walkthrough and request examples: [docs/REQUEST-WALKTHROUGH.md](docs/REQUEST-WALKTHROUGH.md)

Security boundaries and residual risks: [docs/THREAT-MODEL.md](docs/THREAT-MODEL.md)

Local backup/restore evidence: [docs/LOCAL-RECOVERY-DRILL.md](docs/LOCAL-RECOVERY-DRILL.md)

Five-minute backend demo and engineering tradeoffs: [docs/ENGINEERING-TOUR.md](docs/ENGINEERING-TOUR.md)

## Project status

**September 28 release:** the redesigned site and member platform are deployed at [www.gt-lmsa.com](https://www.gt-lmsa.com). Real Google sign-in, database-backed onboarding, and the explicitly authorized officer account were verified. Vercel Production uses a restricted application database credential rather than owner credentials; no paid services were provisioned. See [current provisioning status](docs/PROVISIONING-STATUS.md) for evidence and remaining operational work.

Release PR #16 is merged. Hosted CI passed on PostgreSQL 17 and 18: lint, type checks, 31 unit tests, 18 database integration tests, production build, and all five browser scenarios in each matrix job. Vercel's Git integration handles deployment separately from CI. See the provisioning report for live deployment and Google sign-in evidence. Synthetic-session browser tests do not substitute for real-provider sign-in verification. A production backup/restore drill remains outstanding.

The owner approved local dependency/database setup on September 27 and production setup, commit/push, and deployment on September 28. Paid services remain out of scope. These approvals supersede the older local-only instructions recorded in historical implementation documents.

## Public site content

Routine public content is maintained primarily in `src/lib/site-data.ts`, with supporting date/content overlays and sources in `src/lib/sep-2026-refresh.ts`, `src/lib/stale-status-sep-14.ts`, and `src/lib/source-registry.ts`. Board names, roles, descriptions, and images require officer approval. Publish only verified event logistics and current resource information; do not invent dates, venues, biographies, or statistics.

The public `/interest` form prepares an email for the approved chapter address; it does not transmit or store the response. This differs from the member platform, which stores profile and event participation data in PostgreSQL. Keep those data flows and privacy statements distinct.

Only approved chapter accounts are published:

- Email: `lmsaplusgatech@gmail.com`
- Instagram: `@lmsaplusgatech`

Do not publish private contact details, student IDs, schedules, messages, or unapproved photos.

## Local development

See [the platform guide](docs/PLATFORM-GUIDE.md#local-development) for the owner-approved local setup, Google OAuth callback configuration, migrations, synthetic browser fixtures, and test boundaries. In brief, use Node.js 22 (the package requires Node 20+), PostgreSQL 17, `npm ci`, and a private `.env.local`. No production credentials belong in local test fixtures.

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run test:e2e
npm run build
```

`npm test` is the explicit unit-test command; PostgreSQL integration and browser suites are separate and require a loopback database whose name ends in `_test`. The browser preview uses synthetic local sessions only. See the guide for which schema must be migrated first and which checks CI actually runs.

## Production and release boundary

The owner approved this release; the README itself does not authorize future infrastructure or data changes. Keep credentials in Vercel Production secrets, use the [restricted runtime role](docs/RUNTIME-DATABASE-ACCESS.md), and keep migration-owner credentials outside application deployments. The migration runner refuses remote targets unless an explicit bypass flag is supplied; that flag is not approval. Track outstanding operational work and observed release results in [provisioning status](docs/PROVISIONING-STATUS.md). Never run local synthetic tests against production.
