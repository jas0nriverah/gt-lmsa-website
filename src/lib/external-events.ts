import type {
  ChapterEvent,
  ExternalEvent,
  ThisWeekItem,
} from "./site-types";
import { events as chapterEventsFromRefresh } from "./stale-status-sep-14";
import { chapterToday, currentWeek, hasEnded } from "./event-dates";

/**
 * P0.3 — verified external / recommended pre-health events.
 * Rechecked October 1, 2026 (weekday daily) against official GT Campus Calendar,
 * Pre-Health Advising, Explore LLC, LMSA National, and LMSA Southeast sources.
 * Window Oct 1–Oct 15: Young Physicians Initiative (Oct 15, Montag) listed (≥80).
 * NC2026 (Sep 17–20 Houston) concluded — archived via overlays / eventsAsOf.
 * LMSA SE 17th Regional Conference (Feb 27–Mar 1 2026) is past — not listed as upcoming.
 * SCENE College of Sciences event Oct 7 deliberately not listed (below relevance threshold).
 * Listings are recommendations only — not LMSA Plus partnerships or chapter programming.
 */

export const EXTERNAL_EVENTS_CHECKED_AT = "October 1, 2026";

export const externalEvents: ExternalEvent[] = [
  {
    id: "ext-ypi-montag-2026-10-15",
    title: "Young Physicians Initiative — Interactive Medical Case",
    organization:
      "Young Physicians Initiative (via Explore LLC / Georgia Tech College of Sciences)",
    displayDate: "Thursday, October 15, 2026",
    startDate: "2026-10-15",
    time: "6:30 PM – 7:30 PM",
    location: "Montag Learning Center",
    description:
      "Interactive medical case with current medical students from the Young Physicians Initiative. Attendees work through patient history, labs, and differential diagnosis and ask questions about clinical reasoning. Listed by Explore Living Learning Community. Recommendation only — not LMSA Plus chapter programming or a partnership.",
    sourceUrl:
      "https://explorellc.cos.gatech.edu/2026/09/15/young-physicians-initiative/",
    category: "Pre-health clinical exposure",
    verificationLevel: "official-page",
    lastCheckedAt: EXTERNAL_EVENTS_CHECKED_AT,
    relevanceScore: 92,
    sourceType: "external",
  },
];

/** Minimum relevance score for public listing (~80+). */
export const EXTERNAL_RELEVANCE_THRESHOLD = 80;

export function getVerifiedExternalEvents(
  events: ExternalEvent[] = externalEvents,
  today = chapterToday(),
): ExternalEvent[] {
  return events
    .filter(
      (event) =>
        event.relevanceScore >= EXTERNAL_RELEVANCE_THRESHOLD &&
        Boolean(event.sourceUrl) &&
        Boolean(event.lastCheckedAt) && !hasEnded(event, today),
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function chapterToThisWeekItem(event: ChapterEvent): ThisWeekItem {
  const href =
    event.detailsUrl ??
    (event.registrationStatus === "active" ? event.registrationUrl : undefined) ??
    event.calendarUrl ??
    `/events#${event.id}`;
  return {
    id: `chapter-${event.id}`,
    title: event.title,
    displayDate: event.displayDate,
    time: event.time,
    location: event.location,
    organization: event.scope === "national" ? "LMSA National" : event.scope === "campus" ? "Georgia Tech" : "LMSA Plus at Georgia Tech",
    href,
    category: event.category,
    sourceType: event.scope ?? "chapter",
    badgeLabel: event.scope === "national" ? "National event" : event.scope === "campus" ? "Campus event" : "Chapter event",
  };
}

function externalToThisWeekItem(event: ExternalEvent): ThisWeekItem {
  return {
    id: event.id,
    title: event.title,
    displayDate: event.displayDate,
    time: event.time,
    location: event.location,
    organization: event.organization,
    href: event.registrationUrl ?? event.sourceUrl,
    category: event.category,
    sourceType: "external",
    badgeLabel: "Recommended \u00b7 external",
  };
}

/**
 * Homepage “This Week”: confirmed chapter/national items in-window plus verified externals.
 * Rebuild from data only — no invented logistics.
 */
export function getThisWeekItems(
  chapterEvents: ChapterEvent[] = chapterEventsFromRefresh,
  externals: ExternalEvent[] = externalEvents,
  today = chapterToday(),
): ThisWeekItem[] {
  const week = currentWeek(today);
  const inWindow = (event: { startDate?: string; endDate?: string }) =>
    Boolean(event.startDate && event.startDate <= week.end &&
      (event.endDate ?? event.startDate) >= week.start && !hasEnded(event, today));
  const chapterItems = chapterEvents
    .filter(
      (event) =>
        event.status === "confirmed" && inWindow(event),
    )
    .map(chapterToThisWeekItem);

  const externalItems = getVerifiedExternalEvents(externals, today)
    .filter(inWindow)
    .map(externalToThisWeekItem);

  return [...chapterItems, ...externalItems]
    .sort((a, b) => {
      const aDate =
        chapterEvents.find((e) => `chapter-${e.id}` === a.id)?.startDate ??
        externals.find((e) => e.id === a.id)?.startDate ??
        "";
      const bDate =
        chapterEvents.find((e) => `chapter-${e.id}` === b.id)?.startDate ??
        externals.find((e) => e.id === b.id)?.startDate ??
        "";
      return aDate.localeCompare(bDate) || a.title.localeCompare(b.title);
    })
    .slice(0, 5);
}

/** One chronological homepage preview, including events beyond this week. */
export function getUpcomingItems(today = chapterToday(), chapterEvents: ChapterEvent[] = chapterEventsFromRefresh.filter(e => e.scope === "national" || e.scope === "campus"), externals: ExternalEvent[] = externalEvents): ThisWeekItem[] {
  const items = [
    ...chapterEvents
      .filter((event) => event.status === "confirmed" && event.startDate && !hasEnded(event, today))
      .map((event) => ({ date: event.startDate!, item: chapterToThisWeekItem(event) })),
    ...getVerifiedExternalEvents(externals, today)
      .map((event) => ({ date: event.startDate, item: externalToThisWeekItem(event) })),
  ];
  return items.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map(({ item }) => item);
}
