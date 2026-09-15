import assert from "node:assert/strict";
import test from "node:test";
import { chapterToday, currentWeek, eventsAsOf, hasEnded } from "./event-dates";
import { events, announcements } from "./stale-status-sep-14";
import { getThisWeekItems, getVerifiedExternalEvents, getUpcomingItems } from "./external-events";
import { linktreeLinks } from "./opportunities-linktree";

test("chapter date respects New York midnight and daylight saving time", () => {
  assert.equal(chapterToday(new Date("2026-09-21T03:59:59Z")), "2026-09-20");
  assert.equal(chapterToday(new Date("2026-09-21T04:00:00Z")), "2026-09-21");
  assert.equal(chapterToday(new Date("2026-12-01T04:30:00Z")), "2026-11-30");
});

test("homepage previews contain each event once and expire after the event", () => {
  const preview = getUpcomingItems("2026-09-14");
  assert.equal(preview.length, 3);
  assert.equal(new Set(preview.map((item) => item.id)).size, preview.length);
  assert.equal(preview.filter((item) => item.sourceType === "national").length, 1);
  assert.equal(getUpcomingItems("2026-09-21").length, 0);
});

test("weeks start Monday and span month/year and DST boundaries", () => {
  assert.equal(currentWeek("2026-09-20").start, "2026-09-14");
  assert.equal(currentWeek("2026-09-21").start, "2026-09-21");
  assert.equal(currentWeek("2027-01-01").start, "2026-12-28");
  assert.equal(currentWeek("2027-01-01").end, "2027-01-03");
  assert.equal(currentWeek("2026-11-01").end, "2026-11-01");
});

test("conference remains current through its last day and archives the next day", () => {
  const conference = events.find((event) => event.id === "nc2026-houston")!;
  assert.equal(conference.scope, "national");
  assert.equal(conference.registrationStatus, "closed");
  assert.ok(conference.detailsUrl);
  assert.equal(conference.registrationUrl, undefined);
  assert.equal(eventsAsOf([conference], "2026-09-20")[0].status, "confirmed");
  assert.equal(eventsAsOf([conference], "2026-09-21")[0].status, "past");
  assert.equal(conference.status, "confirmed");
});

test("this week retires completed events without hiding ongoing multi-day events", () => {
  assert.equal(getThisWeekItems(events, undefined, "2026-09-14").length, 3);
  assert.equal(getThisWeekItems(events, undefined, "2026-09-16").length, 2);
  const sunday = getThisWeekItems(events, undefined, "2026-09-20");
  assert.equal(sunday.length, 1);
  assert.equal(sunday[0].badgeLabel, "National event");
  assert.equal(getThisWeekItems(events, undefined, "2026-09-21").length, 0);
  assert.equal(getVerifiedExternalEvents(undefined, "2026-09-17").length, 0);
  const spanning = { ...events[0], startDate: "2026-09-20", endDate: "2026-09-22" };
  assert.equal(getThisWeekItems([spanning], [], "2026-09-21").length, 1);
});

test("expired promotions disappear, while undated plans and contact links remain", () => {
  const current = linktreeLinks.filter((item) => !hasEnded(item, "2026-09-14"));
  assert.equal(current.some((item) => item.label === "2026 Pre-Health Fall Kickoff"), false);
  assert.equal(current.some((item) => item.label === "Fall Student Organizations Fair"), false);
  assert.ok(current.some((item) => item.status === "active" && item.href === "/interest"));
  assert.ok(announcements.filter((item) => !hasEnded(item, "2026-09-21"))
    .every((item) => item.id !== "nc2026-houston"));
  assert.equal(eventsAsOf(events, "2026-10-01").find((item) => item.id === "fall-2026-interest-meeting")?.status, "planned");
});
