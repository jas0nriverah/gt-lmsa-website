import assert from "node:assert/strict";
import test from "node:test";
import { firstChapterEventHasEnded } from "./first-chapter-event";
import { eventsAsOf, hasEnded } from "./event-dates";
import { events } from "./stale-status-sep-14";
import { linktreeLinks } from "./opportunities-linktree";

test("first chapter event stays current through Oct 15 and ends on Oct 16", () => {
  assert.equal(firstChapterEventHasEnded("2026-10-15"), false);
  assert.equal(firstChapterEventHasEnded("2026-10-16"), true);
});

test("interest meeting overlay archives to past as of Oct 16", () => {
  const archived = eventsAsOf(events, "2026-10-16")
    .find((event) => event.id === "fall-2026-interest-meeting");
  assert.equal(archived?.status, "past");
  assert.equal(archived?.featured, false);
});

test("linktree Interest Meeting RSVP link is filtered once the event is past", () => {
  const label = "RSVP: LMSA+ Interest Meeting";
  assert.ok(linktreeLinks.some((link) => link.label === label));
  assert.ok(linktreeLinks
    .filter((link) => !hasEnded(link, "2026-10-15"))
    .some((link) => link.label === label));
  assert.equal(linktreeLinks
    .filter((link) => !hasEnded(link, "2026-10-16"))
    .some((link) => link.label === label), false);
});
