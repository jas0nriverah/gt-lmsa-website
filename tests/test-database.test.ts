import assert from "node:assert/strict";
import test from "node:test";
import { validateTestDatabaseUrl } from "../scripts/test-database";

test("accepts PostgreSQL URLs for loopback _test databases", () => {
  const accepted = [
    "postgres://tester:secret@localhost:5432/lmsa_test",
    "postgresql://tester@127.0.0.1/lmsa_test",
    "postgresql://tester@[::1]:5432/lmsa_test",
    "postgres://tester@127.42.0.9/lmsa_test",
  ];

  for (const url of accepted) {
    assert.equal(validateTestDatabaseUrl(url), url);
  }
});

test("rejects unsafe test database URLs", () => {
  const rejected = [
    undefined,
    "not a URL",
    "mysql://localhost/lmsa_test",
    "postgres://tester@db.example.com/lmsa_test",
    "postgres://tester@192.168.1.10/lmsa_test",
    "postgres://tester@localhost/lmsa",
    "postgres://tester@localhost/lmsa_test_prod",
    "postgres://tester@localhost/",
    "postgres://tester@localhost/path/lmsa_test",
    "postgres://tester@localhost/lmsa%2F_test",
    "postgres://tester@localhost/lmsa%00_test",
    "postgres://tester@localhost/lmsa%2_test",
    "postgres://tester@localhost/lmsa_test#production",
    "postgres://tester@localhost/lmsa_test?host=remote.example.com",
    "postgres://tester@localhost/lmsa_test?dbname=production",
    "postgres://tester@localhost/lmsa_test?service=production",
    "postgres://tester@localhost/lmsa_test?host=%2Fvar%2Frun%2Fpostgresql",
  ];

  for (const url of rejected) {
    assert.throws(() => validateTestDatabaseUrl(url));
  }
});
