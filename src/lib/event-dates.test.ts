import assert from "node:assert/strict";
import test from "node:test";
import { chapterToday, currentWeek, eventsAsOf, hasEnded } from "./event-dates";
import { events, announcements } from "./stale-status-sep-14";
import { externalEvents, getThisWeekItems, getVerifiedExternalEvents, getUpcomingItems } from "./external-events";
import { linktreeLinks } from "./opportunities-linktree";
import type { ChapterEvent, ExternalEvent } from "./site-types";

// Synthetic historical fixtures: editorial changes to live events must not change date semantics.
const conferenceFixture: ChapterEvent = { id: "test-conference", title: "Test conference", category: "National conference", scope: "national", status: "confirmed", displayDate: "September 17–20, 2026", startDate: "2026-09-17", endDate: "2026-09-20", description: "Synthetic event", detailsUrl: "https://example.com/conference", registrationStatus: "closed" };
const externalFixtures: ExternalEvent[] = [15,16].map(day=>({ id:`test-external-${day}`,title:"Synthetic session",organization:"Test host",category:"Education",description:"Synthetic event",displayDate:`September ${day}, 2026`,startDate:`2026-09-${day}`,sourceUrl:"https://example.com/session",verificationLevel:"official-calendar" as const,sourceType:"external" as const,lastCheckedAt:"September 14, 2026",relevanceScore:100 }));
const eventFixtures = [conferenceFixture];

test("chapter date respects New York midnight and daylight saving time", () => {
  assert.equal(chapterToday(new Date("2026-09-21T03:59:59Z")), "2026-09-20");
  assert.equal(chapterToday(new Date("2026-09-21T04:00:00Z")), "2026-09-21");
  assert.equal(chapterToday(new Date("2026-12-01T04:30:00Z")), "2026-11-30");
});

test("homepage previews contain each event once and expire after the event", () => {
  const preview = getUpcomingItems("2026-09-14", eventFixtures, externalFixtures);
  assert.equal(preview.length, 3);
  assert.equal(new Set(preview.map((item) => item.id)).size, preview.length);
  assert.equal(preview.filter((item) => item.sourceType === "national").length, 1);
  assert.equal(getUpcomingItems("2026-09-21", eventFixtures, externalFixtures).length, 0);
});

test("weeks start Monday and span month/year and DST boundaries", () => {
  assert.equal(currentWeek("2026-09-20").start, "2026-09-14");
  assert.equal(currentWeek("2026-09-21").start, "2026-09-21");
  assert.equal(currentWeek("2027-01-01").start, "2026-12-28");
  assert.equal(currentWeek("2027-01-01").end, "2027-01-03");
  assert.equal(currentWeek("2026-11-01").end, "2026-11-01");
});

test("conference remains current through its last day and archives the next day", () => {
  const conference = conferenceFixture;
  assert.equal(conference.scope, "national");
  assert.equal(conference.registrationStatus, "closed");
  assert.ok(conference.detailsUrl);
  assert.equal(conference.registrationUrl, undefined);
  assert.equal(eventsAsOf([conference], "2026-09-20")[0].status, "confirmed");
  assert.equal(eventsAsOf([conference], "2026-09-21")[0].status, "past");
  assert.equal(conference.status, "confirmed");
});

test("this week retires completed events without hiding ongoing multi-day events", () => {
  assert.equal(getThisWeekItems(eventFixtures, externalFixtures, "2026-09-14").length, 3);
  assert.equal(getThisWeekItems(eventFixtures, externalFixtures, "2026-09-16").length, 2);
  const sunday = getThisWeekItems(eventFixtures, externalFixtures, "2026-09-20");
  assert.equal(sunday.length, 1);
  assert.equal(sunday[0].badgeLabel, "National event");
  assert.equal(getThisWeekItems(eventFixtures, externalFixtures, "2026-09-21").length, 0);
  assert.equal(getVerifiedExternalEvents(externalFixtures, "2026-09-17").length, 0);
  const spanning = { ...conferenceFixture, startDate: "2026-09-20", endDate: "2026-09-22" };
  assert.equal(getThisWeekItems([spanning], [], "2026-09-21").length, 1);
});

test("Would You Rather external listing is verified before Oct 20 and expires after it ends", () => {
  const id = "ext-maps-would-you-rather-2026-10-20";
  assert.ok(getVerifiedExternalEvents(externalEvents, "2026-10-08").some((event) => event.id === id));
  assert.ok(getVerifiedExternalEvents(externalEvents, "2026-10-20").some((event) => event.id === id));
  assert.equal(getVerifiedExternalEvents(externalEvents, "2026-10-21").some((event) => event.id === id), false);
});

test("MAPS Pre-Health Fair external listing is verified through Oct 27 and expires after it ends", () => {
  const id = "ext-maps-pre-health-fair-2026-10-27";
  assert.ok(getVerifiedExternalEvents(externalEvents, "2026-10-18").some((event) => event.id === id));
  assert.ok(getVerifiedExternalEvents(externalEvents, "2026-10-27").some((event) => event.id === id));
  assert.equal(getVerifiedExternalEvents(externalEvents, "2026-10-28").some((event) => event.id === id), false);
});

test("both MAPS externals remain verified as of Oct 19 daily maintenance", () => {
  const ids = getVerifiedExternalEvents(externalEvents, "2026-10-19").map((event) => event.id);
  assert.ok(ids.includes("ext-maps-would-you-rather-2026-10-20"));
  assert.ok(ids.includes("ext-maps-pre-health-fair-2026-10-27"));
});

test("Oct 20 daily maintenance keeps same-day Would You Rather listed and retires it Oct 21 while the fair stays", () => {
  const todayIds = getVerifiedExternalEvents(externalEvents, "2026-10-20").map((event) => event.id);
  assert.ok(todayIds.includes("ext-maps-would-you-rather-2026-10-20"));
  const tomorrowIds = getVerifiedExternalEvents(externalEvents, "2026-10-21").map((event) => event.id);
  assert.equal(tomorrowIds.includes("ext-maps-would-you-rather-2026-10-20"), false);
  assert.ok(tomorrowIds.includes("ext-maps-pre-health-fair-2026-10-27"));
});

test("Oct 21 daily maintenance: Would You Rather stays retired while the fair remains listed same-day Oct 27 and retires Oct 28", () => {
  assert.equal(getVerifiedExternalEvents(externalEvents, "2026-10-21").some((event) => event.id === "ext-maps-would-you-rather-2026-10-20"), false);
  assert.ok(getVerifiedExternalEvents(externalEvents, "2026-10-27").some((event) => event.id === "ext-maps-pre-health-fair-2026-10-27"));
  assert.equal(getVerifiedExternalEvents(externalEvents, "2026-10-28").some((event) => event.id === "ext-maps-pre-health-fair-2026-10-27"), false);
});

test("Oct 22 daily maintenance: MAPS Pre-Health Fair remains listed", () => {
  assert.ok(getVerifiedExternalEvents(externalEvents, "2026-10-22").some((event) => event.id === "ext-maps-pre-health-fair-2026-10-27"));
});

test("Oct 23 daily maintenance: MAPS Pre-Health Fair remains listed", () => {
  assert.ok(getVerifiedExternalEvents(externalEvents, "2026-10-23").some((event) => event.id === "ext-maps-pre-health-fair-2026-10-27"));
});

test("Oct 25 Sunday deep audit: MAPS Pre-Health Fair remains listed and Would You Rather stays retired", () => {
  const ids = getVerifiedExternalEvents(externalEvents, "2026-10-25").map((event) => event.id);
  assert.ok(ids.includes("ext-maps-pre-health-fair-2026-10-27"));
  assert.equal(ids.includes("ext-maps-would-you-rather-2026-10-20"), false);
});

test("Oct 26 daily maintenance: MAPS Pre-Health Fair remains listed", () => {
  assert.ok(getVerifiedExternalEvents(externalEvents, "2026-10-26").some((event) => event.id === "ext-maps-pre-health-fair-2026-10-27"));
});

test("Oct 27 daily maintenance: same-day MAPS Pre-Health Fair and new Ethics and Healthcare listing are both verified", () => {
  const ids = getVerifiedExternalEvents(externalEvents, "2026-10-27").map((event) => event.id);
  assert.ok(ids.includes("ext-maps-pre-health-fair-2026-10-27"));
  assert.ok(ids.includes("ext-ethics-and-healthcare-2026-11-06"));
});

test("Oct 28 daily maintenance: MAPS Pre-Health Fair is past and hidden while Ethics and Healthcare remains listed", () => {
  const ids = getVerifiedExternalEvents(externalEvents, "2026-10-28").map((event) => event.id);
  assert.equal(ids.includes("ext-maps-pre-health-fair-2026-10-27"), false);
  assert.ok(ids.includes("ext-ethics-and-healthcare-2026-11-06"));
});

test("Ethics and Healthcare external listing stays verified same-day Nov 6 and retires Nov 7", () => {
  const id = "ext-ethics-and-healthcare-2026-11-06";
  assert.ok(getVerifiedExternalEvents(externalEvents, "2026-11-06").some((event) => event.id === id));
  assert.equal(getVerifiedExternalEvents(externalEvents, "2026-11-07").some((event) => event.id === id), false);
});

test("expired promotions disappear, while undated plans and contact links remain", () => {
  const current = linktreeLinks.filter((item) => !hasEnded(item, "2026-09-14"));
  assert.equal(current.some((item) => item.label === "2026 Pre-Health Fall Kickoff"), false);
  assert.equal(current.some((item) => item.label === "Fall Student Organizations Fair"), false);
  assert.ok(current.some((item) => item.label === "Medical Student Networking Night"));
  assert.equal(linktreeLinks.some((item) => item.label === "Medical Student Networking Night" && !hasEnded(item, "2026-11-05")), false);
  assert.ok(current.some((item) => item.status === "active" && item.href === "/interest"));
  assert.ok(announcements.filter((item) => !hasEnded(item, "2026-09-21"))
    .every((item) => item.id !== "nc2026-houston"));
  assert.equal(eventsAsOf(events, "2026-10-01").find((item) => item.id === "fall-2026-interest-meeting")?.status, "confirmed");
});
