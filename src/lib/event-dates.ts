import type { ChapterEvent } from "./site-types";

/** Date-only comparisons use the chapter's timezone, independent of the server. */
export function chapterToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function currentWeek(today = chapterToday()) {
  const start = new Date(`${today}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC", month: "long", day: "numeric", year: "numeric",
  });
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    label: format.formatRange(start, end),
  };
}

export function hasEnded(item: { startDate?: string; endDate?: string }, today = chapterToday()) {
  const end = item.endDate ?? item.startDate;
  return Boolean(end && end < today);
}

export function eventsAsOf(events: ChapterEvent[], today = chapterToday()): ChapterEvent[] {
  return events.map((event) => event.status === "confirmed" && hasEnded(event, today)
    ? { ...event, status: "past", featured: false }
    : event);
}
