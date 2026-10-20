import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getHomeOpenOpportunities,
  getNominationOpportunities,
  getOpenNowOpportunities,
  openOpportunities,
} from "./open-opportunities";

test("open listings exclude unverified campus nominations and retain rolling service", (t) => {
  t.mock.method(Date, "now", () => Date.parse("2026-10-20T12:00:00Z"));
  const open = getOpenNowOpportunities();
  const pending = openOpportunities.filter((item) => item.requiresCampusConfirmation);
  assert.ok(pending.length > 0);
  for (const item of pending) {
    assert.ok(!open.some((candidate) => candidate.id === item.id));
  }
  assert.ok(open.some((item) => item.id === "grady-volunteer-program-2026"));
  assert.ok(open.some((item) => item.id === "gt-lead-fellows-2026-27"));
});

test("Soros expires from both open and homepage lists immediately after 2 p.m. ET", (t) => {
  const id = "pd-soros-fellowship-2027";
  const clock = t.mock.method(Date, "now", () => Date.parse("2026-10-29T18:00:00Z"));
  assert.ok(getOpenNowOpportunities().some((item) => item.id === id));
  assert.ok(getHomeOpenOpportunities().some((item) => item.id === id));
  clock.mock.mockImplementation(() => Date.parse("2026-10-29T18:00:00.001Z"));
  assert.ok(!getOpenNowOpportunities().some((item) => item.id === id));
  assert.ok(!getHomeOpenOpportunities().some((item) => item.id === id));
});

test("nomination notices expire after their national deadlines", (t) => {
  t.mock.method(Date, "now", () => Date.parse("2027-03-06T12:00:00Z"));
  assert.deepEqual(getNominationOpportunities(), []);
});

test("homepage features are a subset of confirmed open listings sorted by deadline", (t) => {
  t.mock.method(Date, "now", () => Date.parse("2026-10-20T12:00:00Z"));
  const open = getOpenNowOpportunities();
  const featured = getHomeOpenOpportunities();
  const deadlines = open.map((item) => item.deadlineAt ? Date.parse(item.deadlineAt) : Infinity);
  assert.ok(deadlines.every((deadline, index) => index === 0 || deadline >= deadlines[index - 1]));
  for (const item of featured) {
    assert.ok(item.featuredOnHome);
    assert.ok(open.includes(item));
    assert.ok(!item.requiresCampusConfirmation);
  }
});
