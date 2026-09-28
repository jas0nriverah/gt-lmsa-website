# Local synthetic PostgreSQL recovery drill

Executed September 27, 2026. This is evidence that the current local schema can be dumped and restored, not evidence of production backup configuration, encryption, point-in-time recovery, retention, or an achieved recovery-time objective.

## Inputs and isolation

- PostgreSQL 17.11 at `127.0.0.1:55432`, task-isolated cluster.
- Source `lmsa_dev` contained **0 identities, 0 members, 2 planned events, 3 applied migrations, 0 audit records** in the final drill. It had no real member data.
- A unique temporary directory and new database `lmsa_security_restore_ktkpy9_test` were used for the final drill. The source database was not overwritten or reset.
- The final snapshot includes migrations `000`, `001`, and `002`, including event versions and private officer audit history. An earlier pre-002 snapshot is separately retained as `synthetic-seed.dump`.

## Commands actually executed

```bash
pg_dump -h 127.0.0.1 -p 55432 -U jasonrivera -d lmsa_dev -Fc \
  -f /Users/jasonrivera/Documents/Codex/2026-09-14/clo/work/lmsa-restore.ktKPY9/security-seed.dump
createdb -h 127.0.0.1 -p 55432 -U jasonrivera lmsa_security_restore_ktkpy9_test
pg_restore -h 127.0.0.1 -p 55432 -U jasonrivera \
  -d lmsa_security_restore_ktkpy9_test --exit-on-error \
  /Users/jasonrivera/Documents/Codex/2026-09-14/clo/work/lmsa-restore.ktKPY9/security-seed.dump
TEST_DATABASE_URL=postgresql://jasonrivera@127.0.0.1:55432/lmsa_security_restore_ktkpy9_test \
  npm run test:integration
```

The PostgreSQL binaries came from `/opt/homebrew/opt/postgresql@17/bin/`; the abbreviated names above require that directory on PATH.

## Results and cleanup

The restored counts matched: 0 identities, 0 members, 2 events, 3 migration records, 0 audit records. All **18 integration tests passed** against the restored database, including the HTTP session workflow, last-seat concurrency, version conflicts, private audit history and rollback. Synthetic records created by those tests were cleaned up by the tests. The migration runner also verified the restored checksums without applying another migration.

The disposable restore database was then dropped by its exact name. The custom-format dump remains at the explicit path above and can recreate that test snapshot. No production database, source record, or user file was deleted.

## Before a real release

Repeat after material schema changes in a separate non-production database; confirm migration checksums, application invariants and authorized user flows. This seed-only drill does not establish recovery of a production-sized dataset or preservation of existing ticket/session/audit records. Decide encrypted off-site storage, access restrictions, scheduling, retention, monitoring, restore authority and acceptable data loss. Never restore over production as an unreviewed test.
