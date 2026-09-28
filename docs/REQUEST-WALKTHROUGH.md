# Understand the platform

Read this alongside [the setup and API guide](PLATFORM-GUIDE.md). These examples describe the local implementation, not a deployed membership service. All examples use synthetic records. Never paste session cookies or real check-in codes into shared terminals or documentation.

## The three boundaries

```text
Browser: public pages / MemberPortal / OfficerConsole
    │ same-origin HTTPS + essential session cookie
    ▼
Next route: session → verified actor → validation → service
    │ parameterized SQL, transactions, bounded queries
    ▼
PostgreSQL: identity → member → registration → attendance
              └──── separate officer grant ────────┘
```

`src/app/api/platform/[...path]/route.ts` is the request router. `src/server/auth.ts` supplies the trusted actor; `validation.ts` allows only recognized fields; `platform.ts` owns the database operations. React cannot grant itself permission by hiding/showing a button or supplying an ID.

The `pg` library was chosen because there was no existing database layer. Explicit SQL makes the constraints and transaction locks visible without introducing an ORM or another backend. Better Auth, rather than application-written password or cookie cryptography, owns authentication.

## 1. Membership: identity is not membership

1. `/join` offers Google sign-in only when all required server configuration exists. Actual Google OAuth still needs chapter-owned provider configuration and a real-provider test.
2. After sign-in, `MemberPortal` requests `GET /api/platform/me`. Better Auth reads the session; `requireActor` rejects an absent or unverified user. The actor contains a server-derived identity ID and verified email.
3. The profile form sends the fields below. The server rejects extra fields such as `role`, `email`, `status`, or `userId`.
4. `saveMember` inserts a profile with `pending` status or updates the existing identity's allowed profile fields. Unique identity and normalized-email constraints prevent duplicate profiles. Email normalization trims and lowercases only; it does not strip dots or plus-address suffixes.
5. The UI shows the persisted result. An approved officer can then change the status through the protected dashboard. Reloading the page reads PostgreSQL again; there is no localStorage substitute.

Example request from a signed-in browser:

```http
POST /api/platform/me
Content-Type: application/json
Origin: https://chapter.example

{"name":"Synthetic Student","academicYear":"First year","major":"Biology","interests":["Mentorship"]}
```

Example response (illustrative identifiers only):

```json
{
  "data": {
    "id": "00000000-0000-4000-8000-000000000001",
    "name": "Synthetic Student",
    "email": "student@example.test",
    "status": "pending",
    "academicYear": "First year",
    "major": "Biology",
    "interests": ["Mentorship"],
    "createdAt": "2026-09-27T16:00:00.000Z"
  }
}
```

The example origin is a placeholder, not a configured site. The real origin must match `BETTER_AUTH_URL`. JavaScript uses the browser's existing session cookie; it never asks the user to copy a cookie into a form.

## 2. RSVP: reserve one place, even under a race

1. The member or event page sends `POST /api/platform/events/:id/rsvp` with JSON `{}`. It never sends a member ID.
2. The route verifies the session and request origin and applies the per-user rate limit. The service requires the caller's active membership.
3. In one PostgreSQL transaction, the service locks the event row with `FOR UPDATE`, checks membership under lock, and checks the caller's existing registration. A current registration is returned unchanged for an idempotent retry.
4. For a new/re-activated RSVP, it checks publication, registration state/window, start time, and current capacity before writing. Another request for the same event must wait on the same event lock; two callers cannot both take the last seat.
5. Commit completes before the successful response. The UI then shows confirmation and refreshes the counts. If the request fails, it shows an error rather than a reserved place.

```http
POST /api/platform/events/00000000-0000-4000-8000-000000000002/rsvp
Content-Type: application/json

{}
```

A full event returns HTTP 409, for example:

```json
{
  "error": {
    "code": "EVENT_FULL",
    "message": "This event has reached capacity.",
    "requestId": "00000000-0000-4000-8000-000000000003"
  }
}
```

Cancellation uses `DELETE` on the same path and preserves a cancelled registration record. It revokes its ticket. Re-registration reuses the unique member/event record and rechecks capacity. A suspended member can still withdraw an unchecked-in RSVP. An already checked-in registration cannot be cancelled.

## 3. Check-in: a code is not an authorization grant

1. A registered active member requests `POST /api/platform/events/:id/ticket`. The server generates 32 random bytes, returns the opaque code, and stores only its SHA-256 hash and expiry. Reissuing rotates the code. Event rescheduling/cancellation also revokes previous codes.
2. The officer chooses the event, pastes the presented code (or uses a registration ID), checks the confirmation box, and submits. Merely viewing a page or obtaining the code does not mark attendance.
3. `POST /api/platform/officer/events/:id/check-in` verifies the officer grant in PostgreSQL. It checks the event, registration ownership, active membership, ticket expiry, and check-in window: 60 minutes before start through 120 minutes after end.
4. The service inserts attendance with `ON CONFLICT (registration_id) DO NOTHING`. A second officer or duplicate scan returns the existing record without replacing its first time or officer attribution.
5. The roster and metrics reload persisted attendance. CSV export is a separate officer-only read, with bounded rows, quoted cells, and neutralized formula-leading values. Codes are never exported.

Request shapes (choose exactly one):

```json
{"token":"opaque-code-presented-by-the-attendee"}
```

```json
{"registrationId":"00000000-0000-4000-8000-000000000004"}
```

The manual fallback still requires officer authorization, the selected event, an eligible registration, and the same time window. Knowing a registration ID alone does not grant access to private profiles.

## 4. Concurrent officer edits and accountability

An officer opens an event at version 1. PATCH sends the complete event fields plus `expectedVersion: 1`. The service locks the event, checks officer permission again, compares the version, and commits the edit at version 2 together with a minimal audit record. If another officer already saved version 2, the stale request receives HTTP 409 `STALE_EVENT`; it cannot silently overwrite the first edit. The form preserves the unsaved values until the officer explicitly reloads the latest event.

An unchanged save is a no-op: it does not increment the version or manufacture a change record. A stale request is rejected even if its old payload happens to match current values. This keeps the concurrency contract explicit.

The Activity view calls `GET /api/platform/officer/audit?page=1&pageSize=20&action=event.updated`. Entries include actor/target identifiers, a server-generated correlation ID, timestamp, and selected status/version metadata. They do not copy event descriptions, member names/emails, or ticket codes. Database administrators can still alter data; this is an application audit trail, not a tamper-proof ledger.

## How to verify your understanding

Start with `tests/http.integration.test.ts` for requests through real synthetic Better Auth sessions. Then read `tests/platform.integration.test.ts` for independent PostgreSQL connections, the last-seat race, duplicate scans, and rollback after an injected failure. `tests/e2e/platform.spec.ts` describes the browser journey; its local fixture server is separate from the production application.

The five exercises and carefully scoped resume drafts are in [the platform guide](PLATFORM-GUIDE.md#five-learning-exercises). The critical distinction throughout is implemented code versus locally tested code versus a separately approved production release.
