import type {
  ChapterEvent,
  ExternalEvent,
  ThisWeekItem,
} from "./site-types";
import { events as chapterEventsFromRefresh } from "./stale-status-sep-14";
import { chapterToday, currentWeek, hasEnded } from "./event-dates";

/**
 * P0.3 — verified external / recommended pre-health events.
 * Checked September 14, 2026 against official GT Calendar + Grad School Week pages.
 * Listings are recommendations only — not LMSA Plus partnerships or chapter programming.
 */

export const EXTERNAL_EVENTS_CHECKED_AT = "September 14, 2026";

export const externalEvents: ExternalEvent[] = [
  {
    id: "ext-uga-som-virtual-info-2026-09-15",
    title: "UGA School of Medicine Virtual Info Session",
    organization: "UGA School of Medicine Admissions (via Georgia Tech Campus Calendar)",
    displayDate: "Tuesday, September 15, 2026",
    startDate: "2026-09-15",
    time: "5:45 PM – 7:00 PM",
    location: "Room C340, Van Leer Building",
    description:
      "A representative from UGA’s School of Medicine Admissions team will lead an info session for pre-health students on the school’s mission and application process. Listed on the Georgia Tech Campus Calendar; register through the official form linked from that listing. This is a campus-recommended external session — not an LMSA Plus chapter event or partnership.",
    sourceUrl:
      "https://calendar.gatech.edu/event/2026/09/15/uga-school-medicine-virtual-info-session",
    registrationUrl: "https://forms.gle/3RnJqtWa1mzNK5Zw8",
    category: "Medical school info session",
    verificationLevel: "official-calendar",
    lastCheckedAt: EXTERNAL_EVENTS_CHECKED_AT,
    relevanceScore: 95,
    sourceType: "external",
  },
  {
    id: "ext-grad-school-week-prehealth-postbacc-2026-09-16",
    title:
      "Applying to Grad School Week: Pre-Health Post-Bac and Specialty Masters Programs",
    organization: "Georgia Tech Pre-Health Advising / Pre-Graduate Advising",
    displayDate: "Wednesday, September 16, 2026",
    startDate: "2026-09-16",
    time: "5:30 PM – 6:30 PM ET",
    location: "Virtual (register for meeting link)",
    description:
      "Virtual panel with Pre-Health Post-Bac and Specialty Master’s admissions representatives for students strengthening applications to health professional programs (MD, DO, PA, DDS, PharmD, and related). Hosted during Applying to Grad School Week 2026; free and open to Georgia Tech undergraduates, graduate students, employees, and alumni. Register on the official Zoom registration page linked from Grad School Week. Recommended campus programming — not an LMSA Plus partnership.",
    sourceUrl:
      "https://calendar.gatech.edu/event/2026/09/16/applying-grad-school-week-2026-virtual-event-pre-health-post-bacc-and-specialty",
    registrationUrl:
      "https://gatech.zoom.us/meeting/register/IxIksWsiSHymRw3RHQjsxQ#/registration",
    category: "Pre-health pathway panel",
    verificationLevel: "official-calendar",
    lastCheckedAt: EXTERNAL_EVENTS_CHECKED_AT,
    relevanceScore: 94,
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
    badgeLabel: "Recommended · external",
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
export function getUpcomingItems(today = chapterToday()): ThisWeekItem[] {
  const items = [
    ...chapterEventsFromRefresh
      .filter((event) => event.status === "confirmed" && event.startDate && !hasEnded(event, today))
      .map((event) => ({ date: event.startDate!, item: chapterToThisWeekItem(event) })),
    ...getVerifiedExternalEvents(externalEvents, today)
      .map((event) => ({ date: event.startDate, item: externalToThisWeekItem(event) })),
  ];
  return items.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map(({ item }) => item);
}
