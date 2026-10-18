import assert from "node:assert/strict";
import test from "node:test";
import { scholarships } from "./stale-status-sep-14";

test("PURA Salary overlay is closed after the Oct 16 2026 Spring 2027 deadline passed", () => {
  const puraSalary = scholarships.find(
    (opportunity) =>
      opportunity.name === "President's Undergraduate Research Award \u2014 Salary",
  );
  assert.ok(puraSalary, "PURA Salary overlay entry exists");
  assert.equal(puraSalary.status, "closed");
  assert.doesNotMatch(puraSalary.description, /now open|applications open/i);
});
