import assert from "node:assert/strict";
import test from "node:test";
import type { PlatformEvent } from "../src/lib/platform-contracts";
import { registrationState } from "../src/lib/platform-dates";
import {
  formatAtlantaDateTime,
  fromAtlantaDateTimeInput,
  toAtlantaDateTimeInput,
} from "../src/components/platform/date-time";

test("converts Atlanta standard time to an explicit UTC instant", () => {
  assert.equal(
    fromAtlantaDateTimeInput("2026-01-15T10:30", "Start time"),
    "2026-01-15T15:30:00.000Z",
  );
});

test("converts Atlanta daylight time to an explicit UTC instant", () => {
  assert.equal(
    fromAtlantaDateTimeInput("2026-07-15T10:30", "Start time"),
    "2026-07-15T14:30:00.000Z",
  );
});

test("rejects a wall time skipped by Atlanta's spring daylight-saving change", () => {
  assert.throws(
    () => fromAtlantaDateTimeInput("2026-03-08T02:30", "Start time"),
    /does not exist in Atlanta/,
  );
});

test("chooses the first occurrence of the repeated fall daylight-saving hour", () => {
  assert.equal(
    fromAtlantaDateTimeInput("2026-11-01T01:30", "Start time"),
    "2026-11-01T05:30:00.000Z",
  );
});

test("formats and parses an instant using Atlanta wall time", () => {
  const instant = "2026-12-01T16:15:00.000Z";
  assert.match(formatAtlantaDateTime(instant), /EST/);
  assert.equal(toAtlantaDateTimeInput(instant), "2026-12-01T11:15");
});

test("rejects malformed and impossible calendar inputs", () => {
  assert.throws(() => fromAtlantaDateTimeInput("2026-02-30T12:00", "Start time"), /valid date and time/);
  assert.throws(() => fromAtlantaDateTimeInput("not-a-date", "Start time"), /valid date and time/);
});

test("public RSVP labels respect schedule, cancellation, windows, capacity, and exact cutoffs", () => {
  const now = Date.parse("2026-10-14T16:00:00Z");
  const event: PlatformEvent = {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Synthetic status fixture", description: "Test only", category: "Testing",
    location: "", timingLabel: "", startsAt: "2026-10-14T17:00:00Z",
    endsAt: "2026-10-14T18:00:00Z", publicationStatus: "published",
    registrationStatus: "open", registrationOpensAt: null, registrationClosesAt: null,
    capacity: 2, registeredCount: 1, version: 1,
  };
  assert.equal(registrationState(event, now), "RSVPs open");
  assert.equal(registrationState({ ...event, startsAt: null, endsAt: null }, now), "Planned · schedule to be confirmed");
  assert.equal(registrationState({ ...event, publicationStatus: "cancelled" }, now), "Cancelled");
  assert.equal(registrationState({ ...event, publicationStatus: "draft" }, now), "Registration closed");
  assert.equal(registrationState({ ...event, registrationStatus: "closed" }, now), "Registration closed");
  assert.equal(registrationState(event, Date.parse(event.startsAt!)), "Registration closed");
  assert.equal(registrationState({ ...event, registrationClosesAt: "2026-10-14T16:00:00Z" }, now), "Registration closed");
  assert.equal(registrationState({ ...event, registrationOpensAt: "2026-10-14T16:00:01Z" }, now), "Registration opens soon");
  assert.equal(registrationState({ ...event, registrationOpensAt: "2026-10-14T16:00:00Z" }, now), "RSVPs open");
  assert.equal(registrationState({ ...event, registeredCount: 2 }, now), "Event full");
  assert.equal(registrationState({ ...event, capacity: null, registeredCount: 999 }, now), "RSVPs open");
});
