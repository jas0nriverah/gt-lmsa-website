# Backend engineering tour

This is a locally implemented chapter membership and event platform, not a claim of production usage. The public marketing site is live; this backend upgrade is not deployed. See [verification](VERIFICATION.md) for checks actually executed and remaining release gates.

## Five-minute recruiter walkthrough

1. **Identity is not authorization.** Start in `src/server/auth.ts` and the platform route. Better Auth supplies a verified identity; PostgreSQL separately controls membership and officer permission. New profiles are pending. A browser cannot choose its user ID, email, membership status, or officer role. Demonstrate a member receiving 403 from an officer endpoint.
2. **Two people want the last seat.** In `src/server/platform.ts`, follow `rsvp`: eligibility preflight, transaction, event row lock, eligibility recheck, capacity check and registration write. A database uniqueness constraint prevents duplicate registrations. Show the competing-request integration test: one seat cannot produce two successful new reservations.
3. **Two officers edit the same event.** `updateEvent` compares the submitted version under the same event lock. The winner increments the version; a stale save returns 409. `OfficerEvents.tsx` preserves unsaved work until the officer explicitly reloads. This prevents silent overwrites without holding a transaction while someone fills out a form.
4. **Accountability without copying private content.** `recordAudit` writes minimal action metadata in the business transaction. A failed audit insert rolls back an event edit. Repeated check-in records no duplicate attendance/audit. The private Activity view filters/paginates IDs and status/version details, never names, emails or ticket codes. Request IDs connect HTTP outcomes to recorded actions.
5. **Prove failure behavior.** Open `tests/platform.integration.test.ts`, `tests/http.integration.test.ts` and [the recovery drill](LOCAL-RECOVERY-DRILL.md). These exercise PostgreSQL, signed synthetic sessions, capacity races, rollback, permissions, rate limits and restore behavior. Explain what remains untested: real Google OAuth, hosted CI, and production operations.

## Deliberate tradeoffs

| Choice | Why / limitation |
|---|---|
| One Next.js app + PostgreSQL | Fewer moving parts for a chapter-sized service. No distributed-system or high-scale claims. |
| Explicit parameterized SQL | Makes constraints, lock ordering and transaction boundaries inspectable. Query changes need integration tests. |
| Event-level serialization | Straightforward correctness for seat inventory, cancellation and check-in. Popular events become contention points; measure before changing this design. |
| Opaque expiring ticket, stored as a hash | A database ticket hash is not itself a usable ticket. Tickets remain sensitive bearer data; never log or publish them. |
| Optimistic editor versions | Prevents lost updates while keeping user interactions outside transactions. Conflicts require a deliberate reload/re-edit. |
| Same-transaction audit | Business action and audit commit together. A database administrator can still alter history; this is not cryptographically tamper-evident storage. |
| Bounded CSV and database rate limits | Limits memory/abuse exposure without extra services. Not a replacement for an edge firewall, DDoS protection or authorized export handling. |

## Demo safely

Follow the local fixture instructions in [PLATFORM-GUIDE.md](PLATFORM-GUIDE.md). Use a loopback PostgreSQL database ending in `_test` and synthetic identities only. The fixture sign-in helper is a separate local development script, not a deployed application endpoint. Do not screen-share tickets, cookies, secrets, or real member rosters. Do not expose the fixture ports publicly.

Use the actual passing test counts from `VERIFICATION.md`, not invented users, throughput, latency, uptime, security certification, or deployment claims. Before interviews, practice explaining one SQL transaction and one regression test in your own words. See [REQUEST-WALKTHROUGH.md](REQUEST-WALKTHROUGH.md) for the longer UI-to-database traces and [THREAT-MODEL.md](THREAT-MODEL.md) for security boundaries.
