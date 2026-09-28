# Member platform implementation contract

Original implementation scope was local-only. On September 28 the owner explicitly authorized finishing and deploying the upgrade, superseding the earlier commit/push/deployment restriction. Hosted database initialization, restricted runtime credentials, public Google sign-in, and officer access for the owner's verified account were separately confirmed. No paid provisioning is authorized. Preserve the September 27 content and all eight officers.

This is the original implementation contract. The subsequent [security expansion](SECURITY-EXPANSION-PLAN.md) adds migration `002-security-audit.sql`, event versions, private audit history, and operational safeguards. The current API reference is in [PLATFORM-GUIDE.md](PLATFORM-GUIDE.md).

## Audit

Baseline `origin/main` is 124ef6c. No backend/auth/database exists. Public pages, date-aware events, board and email preparation are implemented. Three of six original date tests fail after upstream content changes: historical assertions depend on mutable live fixtures. Lint and TypeScript were clean before implementation; production baseline is checked separately.

## Architecture

One Next.js app, node-postgres parameterized SQL, PostgreSQL, Better Auth Google verified sign-in. No passwords, Redis, separate server, or browser database credentials. Auth identity is distinct from membership and officer permission. No user is promoted automatically. New membership is pending. The owner confirmed pending membership followed by officer approval on September 27, 2026; `.env.example` therefore enables MEMBERSHIP_APPROVAL_ENABLED=true. This is not authorization to activate production. Google login does not imply Georgia Tech affiliation.

PostgreSQL owns chapter events when configured, including an undated planned launch for the second or third week of October 2026. Static national/campus/external records stay separate. Database outages are errors, never a switch to stale chapter records. Initial launch registration is closed until an officer confirms scheduling. Local synthetic test events can exercise full RSVPs without inventing public logistics.

## API contract

All application routes live below `/api/platform`. Success: `{data: T}`. Error: `{error:{code,message,requestId}}` with 400/401/403/404/409/413/415/429/503 as appropriate. Responses are no-store. Mutations require same-origin Origin and JSON, max 16 KiB. Lists use `page` (1-based), `pageSize` (1–50), `q` (max 100).

| Path | Method | Permission / data |
|---|---|---|
| me | GET | verified identity → MemberHome |
| me | POST/PATCH | verified identity → Member; MemberInput allowlist, no email/role/status/user ID input |
| me/registrations | GET | own registrations → Page<Registration> |
| events | GET | public published/cancelled events → Page<PlatformEvent>; q/category/view upcoming or past |
| events/:id | GET | public published/cancelled event |
| events/:id/rsvp | POST/DELETE | register requires own active membership; cancel requires own existing profile, even when inactive; idempotent → Registration |
| events/:id/ticket | POST | own current registration → Ticket; rotates opaque token, only hash stored |
| officer/members | GET | officer → Page<Member>; optional status |
| officer/members/:id/status | PATCH | officer + policy enabled; {status} → Member |
| officer/events | GET/POST | officer; list Page<PlatformEvent> / EventInput → event |
| officer/events/:id | GET/PATCH | officer; fetch including drafts / complete EventInput plus expectedVersion → event; stale edits return 409 |
| officer/events/:id/registrations | GET | officer → Page<Registration> with approved names/emails |
| officer/events/:id/check-in | POST | officer; exactly one of {token} or {registrationId}; explicit confirmation → Registration |
| officer/events/:id/export | GET | officer; CSV approved fields, max bounded rows; no tokens |
| officer/analytics | GET | officer → Analytics, no fabricated counts |
| officer/audit | GET | officer → paginated activity; optional allowlisted action filter |

## Database/service ownership

Shared types: src/lib/platform-contracts.ts. Main owns src/server/db.ts, errors.ts, validation.ts, auth.ts, http.ts, API routes and dependency/configuration files. Backend agent owns migrations/001-platform.sql and src/server/platform.ts plus tests/platform.integration.test.ts. Public design agent owns homepage, globals.css, Navbar/Footer, BoardGrid, resources/search and public content copy. Member UI agent owns join/member/officer/check-in pages and its own platform components. No overlaps. No agent may install, commit, push, run builds or production migrations.

Backend exports createPlatform(pool: Pool). Actor `{userId,email,emailVerified}` is supplied by server-side authentication ONLY. Service verifies actor and officer DB permission on every private operation. Exports methods getMe, saveMember, ownRegistrations, listEvents, getEvent, rsvp, cancelRsvp, issueTicket, listMembers, setMemberStatus, createEvent, updateEvent, registrations, checkIn, exportAttendance, analytics. All private methods take Actor first; no actor accepted from HTTP payloads. List methods take ListQuery (`page,pageSize,q,category,view,status`) validated centrally. `listEvents(query, actor?)`: public without actor; officer including drafts with actor. `saveMember(actor,input)`: idempotent create/update, identity cannot be changed. Event methods use UUID IDs.

Every RSVP/cancel/re-registration, event capacity/status update, ticket issuance and check-in locks the event row first in one transaction. Member status locks follow event locks where relevant. Enforce unique(member_id,event_id), FK ownership, unique attendance registration, token hash and expiry. Retry serialization/deadlock at most twice, never return success before commit. Check-in window: startsAt minus 60 minutes through endsAt plus 120 minutes; requires published event, registered row and active member. Unknown dates deny check-in. Cancelled RSVP revokes token. Duplicate check-in preserves original timestamp/officer.

## Acceptance

Real isolated PostgreSQL tests for duplicates, capacity races, cancellation/re-registration, check-in races, authorization, ownership and failure rollback. Pure tests for validation/CSV/time boundaries. Browser checks public/mobile plus authorized journeys using synthetic sessions only in isolated test DB; no test login endpoints in production. Missing database/auth config yields a truthful unavailable state. Document provider setup and production approval separately.
