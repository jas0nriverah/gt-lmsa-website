import type {
  ChapterEvent,
  ExternalEvent,
  ThisWeekItem,
} from "./site-types";
import { events as chapterEventsFromRefresh } from "./stale-status-sep-14";
import { chapterToday, currentWeek, hasEnded } from "./event-dates";

/**
 * P0.3 — verified external / recommended pre-health events.
 * Rechecked October 27, 2026 (weekday daily maintenance) against official GT Campus Calendar,
 * Pre-Health Advising, Explore LLC, LMSA National, and LMSA Southeast sources.
 * Rolling window: October 27 – November 10, 2026.
 * MAPS Would You Rather? Pre-Health Edition (Oct 20) ended — retired automatically via hasEnded from Oct 21 (object kept for history).
 * MAPS Pre-Health Fair (Oct 27) kept from GT Campus Calendar (re-verified Oct 27; it is today and date logic retires it tomorrow).
 * Ethics and Healthcare (Nov 6, GT Ethics Week) added from the GT Campus Calendar listing.
 * Young Physicians Initiative (Oct 15) is past and was never listed — it conflicted with
 * the LMSA Plus Interest Meeting at the same time.
 * The LMSA Plus Interest Meeting (Oct 15) is past — retired from upcoming surfaces via date checks.
 * NC2026 (Sep 17–20 Houston) concluded — archived via overlays / eventsAsOf.
 * LMSA SE 17th Regional Conference (Feb 27–Mar 1 2026) is past — no 2027 dates announced as of Oct 27.
 * No other ≥80 official-calendar dedicated pre-health events verified for the window.
 * SCENE College of Sciences event Oct 7 is past; it was deliberately not listed (generic career expo, not dedicated pre-health).
 * Listings are recommendations only — not LMSA Plus partnerships or chapter programming.
 */

export const EXTERNAL_EVENTS_CHECKED_AT = "October 27, 2026";

export const externalEvents: ExternalEvent[] = [
  {
    id: "ext-maps-would-you-rather-2026-10-20",
    title: "Would You Rather? Pre-Health Edition",
    organization: "MAPS at Georgia Tech (student organization, @maps.gt)",
    displayDate: "Tuesday, October 20, 2026",
    startDate: "2026-10-20",
    time: "6:00 PM – 7:00 PM ET",
    location: "Location TBA (check the GT Campus Calendar listing)",
    description:
      "Student-sponsored game of would-you-rather based on pre-health topics; the GT Campus Calendar listing says all Georgia Tech students are welcome. Updates are shared via Instagram @maps.gt. Recommendation only — not LMSA Plus chapter programming or a partnership.",
    sourceUrl:
      "https://calendar.gatech.edu/event/2026/10/20/would-you-rather-pre-health-edition",
    category: "Community",
    verificationLevel: "official-calendar",
    lastCheckedAt: EXTERNAL_EVENTS_CHECKED_AT,
    relevanceScore: 82,
    sourceType: "external",
  },
  {
    id: "ext-maps-pre-health-fair-2026-10-27",
    title: "MAPS Pre-Health Fair",
    organization: "MAPS at Georgia Tech (Minority Association of Pre-Medical Students, @maps.gt)",
    displayDate: "Tuesday, October 27, 2026",
    startDate: "2026-10-27",
    time: "1:00 PM – 5:00 PM ET",
    location: "Atrium, Klaus Advanced Computing Building",
    description:
      "Annual student-organized pre-health fair. The GT Campus Calendar listing says several pre-health schools will attend, offering a chance to speak with admissions representatives, and that all students are welcome; more details will be shared via Instagram @maps.gt. Recommendation only — not LMSA Plus chapter programming or a partnership.",
    sourceUrl: "https://calendar.gatech.edu/event/2026/10/27/maps-pre-health-fair",
    category: "Pre-health fair",
    verificationLevel: "official-calendar",
    lastCheckedAt: EXTERNAL_EVENTS_CHECKED_AT,
    relevanceScore: 90,
    sourceType: "external",
  },
  {
    id: "ext-ethics-and-healthcare-2026-11-06",
    title: "Ethics and Healthcare (GT Ethics Week)",
    organization: "Georgia Tech Ethics Week (Office of General Counsel, Ethics & Compliance)",
    displayDate: "Friday, November 6, 2026",
    startDate: "2026-11-06",
    time: "2:00 PM – 3:00 PM ET",
    location: "Kendeda Building Auditorium (Room 152)",
    description:
      "Ethics Week session hosted by Dr. Jason Lesandrini (PUBP 4630: Law, Medicine, and Ethics) on ethical considerations in healthcare, including decisions that balance patient needs, professional responsibilities, and institutional policies. The GT Campus Calendar lists undergraduates as invited; RSVP via the listing. Recommendation only — not LMSA Plus chapter programming or a partnership.",
    sourceUrl: "https://calendar.gatech.edu/event/2026/11/06/ethics-and-healthcare",
    category: "Talk",
    verificationLevel: "official-calendar",
    lastCheckedAt: EXTERNAL_EVENTS_CHECKED_AT,
    relevanceScore: 82,
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
