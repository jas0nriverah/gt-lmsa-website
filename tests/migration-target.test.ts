import assert from "node:assert/strict";
import test from "node:test";
import { validateMigrationTarget } from "../scripts/migration-target";

test("accepts explicit local PostgreSQL targets, including sslmode=require", () => {
  const target = validateMigrationTarget(
    "postgresql://migration:secret@localhost:5432/gt_lmsa?sslmode=require",
  );

  assert.equal(target.isRemote, false);
  assert.equal(target.connectionString, "postgresql://migration:secret@localhost:5432/gt_lmsa?sslmode=require");
});

test("rejects query parameters that could override PostgreSQL routing", () => {
  const urls = [
    "postgres://migration:secret@localhost/gt_lmsa?host=remote.example",
    "postgres://migration:secret@localhost/gt_lmsa?%68ost=remote.example",
    "postgres://migration:secret@localhost/gt_lmsa?port=5433",
    "postgres://migration:secret@localhost/gt_lmsa?database=other_db",
    "postgres://migration:secret@localhost/gt_lmsa?service=production",
    "postgres://migration:secret@localhost/gt_lmsa?connectionString=postgres://remote.example/other_db",
    "postgres://migration:secret@localhost/gt_lmsa?sslmode=require&%64atabase=other_db",
  ];

  for (const connectionString of urls) {
    assert.throws(() => validateMigrationTarget(connectionString));
  }
});

test("rejects invalid protocols and missing explicit database names", () => {
  assert.throws(() => validateMigrationTarget("mysql://localhost/gt_lmsa"), /postgres/);
  assert.throws(() => validateMigrationTarget("postgresql://localhost/"), /explicit database name/);
});

test("requires explicit approval for remote targets", () => {
  const connectionString = "postgres://migration:secret@db.example/gt_lmsa?sslmode=require";

  assert.throws(
    () => validateMigrationTarget(connectionString),
    /--approved-remote-migration/,
  );
  assert.equal(
    validateMigrationTarget(connectionString, { approvedRemote: true }).isRemote,
    true,
  );
});

test("validation errors do not expose URL credentials", () => {
  const connectionString = "mysql://private-user:private-password@localhost/gt_lmsa";

  assert.throws(() => validateMigrationTarget(connectionString), error => {
    assert.ok(error instanceof Error);
    assert.ok(!error.message.includes("private-user"));
    assert.ok(!error.message.includes("private-password"));
    return true;
  });
});
