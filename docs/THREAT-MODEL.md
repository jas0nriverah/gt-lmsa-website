# Security model and remaining release risks

This is a small student-organization application, not a medical-record system. Do not collect diagnoses, clinical notes, student IDs, payment information, or sensitive uploads. The chapter's medicine-related mission does not make those fields necessary.

## Trust boundaries

- **Anonymous browser:** may read published/cancelled chapter events and public content. No member directory, roster, ticket lookup, or activity log.
- **Verified account:** may create/update its own allowed profile fields. Email and identity come from Better Auth; a Google account does not establish Georgia Tech affiliation or membership.
- **Active member:** may RSVP and request its own ticket. Pending/suspended members cannot reserve places but can withdraw unchecked-in registrations.
- **Officer:** explicit database grant, checked server-side for each privileged operation. May manage chapter events/statuses and read member/roster/activity data. Officers are trusted with these records; a role alone cannot prevent an authorized officer from misusing an export.
- **Server/database operators:** trusted administrators. They control secrets, migrations, backups, and database permissions. Application audit history is not tamper-proof against them.
- **Identity provider/hosting:** external services with their own configuration, logs, and access. A local synthetic session is not evidence that a production Google OAuth client is configured correctly.

## Threats and controls

| Threat | Implemented control | Verification/evidence |
|---|---|---|
| Claim another member's email or elevate role | Session-derived actor; body field allowlists; normalized-email and identity uniqueness; no first-user officer grant | HTTP integration rejects unverified/expired/tampered sessions and mass assignment |
| Read another member or roster anonymously | Own-record lookup uses actor ID; each officer service checks grant; public event contract excludes identities | HTTP public-field allowlist, ownership and officer-denial assertions |
| Cross-site mutation | Exact trusted origin and cross-site rejection for platform mutations; Better Auth owns OAuth state/session handling | Origin rejection tests; real Google callback remains a release test |
| Oversized/malformed request | Streaming 16 KiB JSON limit, string/array bounds, enums, strict dates, UUIDs, bounded paging | Validation and HTTP tests |
| SQL injection | Parameterized values; no request-controlled SQL identifiers; fixed sort/action allowlists | Service review and malformed input tests; not a formal penetration test |
| Concurrent last-seat overbooking | Event-row lock, transaction, membership recheck and unique member/event pair; consistent lock order | Independent PostgreSQL last-seat, capacity-edit and cancellation races |
| Lost officer event edits | Expected version compared and incremented under lock; stale edit returns 409 and UI does not silently overwrite | Security expansion integration tests and stale-edit browser review |
| Inconsistent or misleading audit | Successful mutation and audit write share a transaction; fixed metadata, server request IDs; first check-in only | Audit atomicity/privacy/duplicate tests; no application update/delete endpoints |
| Reused/forged check-in token | 32 random bytes, hash-only persistence, expiry and rotation/revocation, selected-event validation, officer confirmation | Wrong-event, invalid, expired and cancelled token cases; duplicate scan race |
| Spreadsheet formula execution | Quoted CSV and formula-leading value neutralization; officer-only bounded export | CSV fixtures and HTTP export authorization |
| Private cache/log disclosure | No-store responses; no payload/URL/driver-error logs; OAuth token encryption enabled; private pages noindex | Header/log tests; production host access-log policy still needs review |
| Request abuse | Database-backed rate buckets, Retry-After, bounded SQL/pool timeouts, preflight authorization before event lock | HTTP throttle/reset tests; lock-held rejection test |
| Test or migration targets production by mistake | Explicit target; test-only loopback and `_test` name; URL routing overrides rejected; separate remote migration flag | Pure guard tests, including encoded query keys; flag is not authorization |
| Database loss or failed migration | Ordered checksums, per-migration transaction and advisory lock; restore into a new local DB | Local synthetic dump/restore and integration rerun; production backups remain unconfigured |

## Deliberate limitations

1. **Not yet deployed:** no production database/OAuth credentials, real-user tests, or verified production secret rotation. Do not enable membership until the release checklist is satisfied.
2. **Trusted officers and administrators:** a compromised officer can access records permitted to that role. Decide officer onboarding/offboarding, device/account protection, and export handling. Evaluate provider-enforced MFA before real operation.
3. **Audit minimization, not anonymity:** actor/target IDs and timestamps can be linked back to people by authorized operators. Do not publish the log. Retention and deletion of audit records require an approved policy. No cryptographic integrity or immutable external storage is claimed.
4. **Rate limits are modest abuse protection:** they are not DDoS protection. Outside Vercel, anonymous public reads share one bucket rather than trusting arbitrary forwarded-IP headers. Review trusted-proxy configuration and edge protections for the actual host.
5. **No completed retention workflow:** no automatic member/account deletion, backup expiration policy, or sensitive-data incident process is claimed. Existing schema constraints alone do not satisfy those policies.
6. **Database privileges must be split for production:** use a migration/owner identity separately from the runtime app identity. Runtime should have only required table/sequence privileges and no DDL; grant audit insert/select, not update/delete. Local development uses a privileged synthetic-data role for schema tests, not a production least-privilege demonstration.
7. **Hosting controls remain a release task:** enforce HTTPS, confirm secure cookie behavior with the real provider, validate TLS to the database, review framework/provider logs and CSP, configure alerts, and rehearse restoring an encrypted backup. Headers alone are not a security guarantee.
8. **Testing is bounded:** automated checks and local browser review are not a comprehensive accessibility audit, load test, third-party penetration test, or evidence of real-user adoption.

## What a reviewer can reproduce locally

Use the setup guide with synthetic data only. Run unit tests, migrated PostgreSQL integration tests, lint, types, and build. Read the lock-held authorization test, last-seat race, same-version event-edit race, audit rollback test, and the HTTP negative cases. Each demonstrates a concrete invariant rather than a screenshot-only feature.

For production, resolve the remaining policies and infrastructure explicitly; do not remove guards or enable a fake sign-in path to make a demo appear live.
