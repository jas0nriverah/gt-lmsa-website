import type { PlatformEvent } from "./platform-contracts";
export const CHAPTER_TIME_ZONE = "America/New_York";
export function registrationState(event: PlatformEvent, now = Date.now()): string {
  if (event.publicationStatus === "cancelled") return "Cancelled";
  if (!event.startsAt) return "Planned · schedule to be confirmed";
  if (event.publicationStatus !== "published" || event.registrationStatus === "closed" || now >= Date.parse(event.startsAt) || (event.registrationClosesAt && now >= Date.parse(event.registrationClosesAt))) return "Registration closed";
  if (event.registrationOpensAt && now < Date.parse(event.registrationOpensAt)) return "Registration opens soon";
  if (event.capacity !== null && event.registeredCount >= event.capacity) return "Event full";
  return "RSVPs open";
}
export function formatEventTime(event: Pick<PlatformEvent, "startsAt" | "endsAt" | "timingLabel">) {
  if (!event.startsAt) return event.timingLabel || "Date and time to be confirmed";
  const start = new Date(event.startsAt);
  if (Number.isNaN(start.getTime())) return "Date and time unavailable";
  const fullDateTime = new Intl.DateTimeFormat("en-US", { timeZone: CHAPTER_TIME_ZONE, weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  if (!event.endsAt) return fullDateTime.format(start);

  const end = new Date(event.endsAt);
  if (Number.isNaN(end.getTime())) return "Date and time unavailable";
  const dateOnly = new Intl.DateTimeFormat("en-US", { timeZone: CHAPTER_TIME_ZONE, weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const timeOnly = new Intl.DateTimeFormat("en-US", { timeZone: CHAPTER_TIME_ZONE, hour: "numeric", minute: "2-digit" });
  const zoneName = (date: Date) => new Intl.DateTimeFormat("en-US", { timeZone: CHAPTER_TIME_ZONE, timeZoneName: "short" }).formatToParts(date).find(part => part.type === "timeZoneName")?.value;
  if (dateOnly.format(start) === dateOnly.format(end) && zoneName(start) === zoneName(end)) {
    return `${dateOnly.format(start)} · ${timeOnly.format(start)}–${timeOnly.format(end)} ${zoneName(start)}`;
  }
  return `${fullDateTime.format(start)} – ${fullDateTime.format(end)}`;
}
