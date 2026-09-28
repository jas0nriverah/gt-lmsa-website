import type { AuditAction, EventInput, EventUpdateInput, MemberInput, MembershipStatus } from "../lib/platform-contracts";
import { ACADEMIC_YEARS, AUDIT_ACTIONS, MEMBER_INTERESTS } from "../lib/platform-contracts";
import { PlatformError } from "./errors";

export interface Actor { userId: string; email: string; emailVerified: boolean; requestId?: string }
export interface ListQuery { page: number; pageSize: number; q?: string; category?: string; view?: "upcoming" | "past"; status?: string }
export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function requireVerified(actor: Actor) {
  if (!actor?.userId || !actor.emailVerified || !actor.email) throw new PlatformError("UNVERIFIED", "Sign in with a verified account to continue.", 401);
}
export function object(input: unknown, allowed: string[]): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new PlatformError("INVALID_INPUT", "Provide a JSON object.");
  const result = input as Record<string, unknown>;
  if (Object.keys(result).some(key => !allowed.includes(key))) throw new PlatformError("INVALID_FIELD", "The request includes a field that cannot be changed.");
  return result;
}
export function text(value: unknown, name: string, max: number, required = true): string {
  if (typeof value !== "string") throw new PlatformError("INVALID_INPUT", `${name} must be text.`);
  const result = value.trim();
  if ((required && !result) || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) throw new PlatformError("INVALID_INPUT", `${name} must be ${required ? "1" : "0"}–${max} characters.`);
  return result;
}
export function uuid(value: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new PlatformError("INVALID_ID", "Invalid record identifier.");
  return value;
}
export function memberInput(input: unknown): MemberInput {
  const r = object(input, ["name", "academicYear", "major", "interests"]);
  const academicYear = text(r.academicYear ?? "", "Academic year", 80, false);
  if (academicYear && !ACADEMIC_YEARS.includes(academicYear)) throw new PlatformError("INVALID_INPUT", "Choose a listed academic year.");
  if (!Array.isArray(r.interests) || r.interests.length > MEMBER_INTERESTS.length || r.interests.some(v => typeof v !== "string" || !MEMBER_INTERESTS.includes(v))) throw new PlatformError("INVALID_INPUT", "Choose interests from the list.");
  return { name: text(r.name, "Name", 120), academicYear, major: text(r.major ?? "", "Major", 120, false), interests: [...new Set(r.interests as string[])] };
}
function instant(value: unknown, name: string): string | null {
  if (value === null || value === "" || value === undefined) return null;
  const dateTime = typeof value === "string" ? value : null;
  const match = dateTime === null ? null : /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(Z|([+-])(\d{2}):(\d{2}))$/.exec(dateTime);
  if (dateTime === null || !match) throw new PlatformError("INVALID_INPUT", `${name} must be a valid date and time with a timezone offset.`);

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, , , , offsetHourText, offsetMinuteText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const hour = Number(hourText), minute = Number(minuteText), second = Number(secondText ?? 0);
  const offsetHour = Number(offsetHourText ?? 0), offsetMinute = Number(offsetMinuteText ?? 0);
  const calendarDate = new Date(0);
  calendarDate.setUTCHours(0, 0, 0, 0);
  calendarDate.setUTCFullYear(year, month - 1, day);
  if (year < 1 || calendarDate.getUTCFullYear() !== year || calendarDate.getUTCMonth() !== month - 1 || calendarDate.getUTCDate() !== day ||
      hour > 23 || minute > 59 || second > 59 || offsetHour > 23 || offsetMinute > 59 || !Number.isFinite(Date.parse(dateTime))) {
    throw new PlatformError("INVALID_INPUT", `${name} must be a valid date and time with a timezone offset.`);
  }
  return new Date(dateTime).toISOString();
}
export function eventInput(input: unknown): EventInput {
  const r = object(input, ["title", "description", "location", "category", "timingLabel", "startsAt", "endsAt", "publicationStatus", "registrationStatus", "registrationOpensAt", "registrationClosesAt", "capacity"]);
  const startsAt = instant(r.startsAt, "Start"), endsAt = instant(r.endsAt, "End");
  const registrationOpensAt = instant(r.registrationOpensAt, "Registration opens"), registrationClosesAt = instant(r.registrationClosesAt, "Registration closes");
  if (Boolean(startsAt) !== Boolean(endsAt) || (startsAt && endsAt && startsAt >= endsAt)) throw new PlatformError("INVALID_INPUT", "Provide both start and end, with end after start, or leave both unconfirmed.");
  if (registrationOpensAt && registrationClosesAt && registrationOpensAt >= registrationClosesAt) throw new PlatformError("INVALID_INPUT", "Registration must close after it opens.");
  if (!["draft", "published", "cancelled"].includes(String(r.publicationStatus)) || !["open", "closed"].includes(String(r.registrationStatus))) throw new PlatformError("INVALID_INPUT", "Choose valid event and registration statuses.");
  if (r.registrationStatus === "open" && (!startsAt || r.publicationStatus !== "published")) throw new PlatformError("INVALID_INPUT", "Confirm the schedule and publish the event before opening registration.");
  if (r.capacity !== null && (!Number.isInteger(r.capacity) || Number(r.capacity) < 1 || Number(r.capacity) > 10000)) throw new PlatformError("INVALID_INPUT", "Capacity must be 1–10,000 or unlimited.");
  return { title: text(r.title, "Title", 160), description: text(r.description, "Description", 5000), location: text(r.location ?? "", "Location", 300, false), category: text(r.category, "Category", 80), timingLabel: text(r.timingLabel ?? "", "Timing label", 200, false), startsAt, endsAt, registrationOpensAt, registrationClosesAt, capacity: r.capacity as number | null, publicationStatus: r.publicationStatus as EventInput["publicationStatus"], registrationStatus: r.registrationStatus as EventInput["registrationStatus"] };
}
export function membershipStatus(input: unknown): MembershipStatus {
  const r = object(input, ["status"]);
  if (!["pending", "active", "suspended"].includes(String(r.status))) throw new PlatformError("INVALID_INPUT", "Invalid membership status.");
  return r.status as MembershipStatus;
}
export function eventUpdateInput(input: unknown): EventUpdateInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new PlatformError("INVALID_INPUT", "Provide a JSON object.");
  const { expectedVersion, ...fields } = input as Record<string, unknown>;
  if (!Number.isSafeInteger(expectedVersion) || Number(expectedVersion) < 1) {
    throw new PlatformError("INVALID_INPUT", "Provide the event version you are editing.");
  }
  return { ...eventInput(fields), expectedVersion: expectedVersion as number };
}
export function auditQuery(params: URLSearchParams): { page: number; pageSize: number; action?: AuditAction } {
  if ([...params.keys()].some(key => !["page", "pageSize", "action"].includes(key))) {
    throw new PlatformError("INVALID_INPUT", "Unsupported activity filter.");
  }
  const { page, pageSize } = listQuery(params);
  const action = params.get("action");
  if (action && !(AUDIT_ACTIONS as readonly string[]).includes(action)) throw new PlatformError("INVALID_INPUT", "Choose a listed activity type.");
  return { page, pageSize, ...(action ? { action: action as AuditAction } : {}) };
}
export function checkInInput(input: unknown): { token?: string; registrationId?: string } {
  const r = object(input, ["token", "registrationId"]);
  if (Boolean(r.token) === Boolean(r.registrationId)) throw new PlatformError("INVALID_INPUT", "Provide either a check-in code or a registration ID.");
  return r.token ? { token: text(r.token, "Check-in code", 256) } : { registrationId: uuid(String(r.registrationId)) };
}
export function listQuery(params: URLSearchParams): ListQuery {
  const page = Number(params.get("page") ?? 1), pageSize = Number(params.get("pageSize") ?? 20);
  if (!Number.isInteger(page) || page < 1 || page > 10000 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) throw new PlatformError("INVALID_INPUT", "Invalid pagination.");
  const q = text(params.get("q") ?? "", "Search", 100, false), category = text(params.get("category") ?? "", "Category", 80, false);
  const view = params.get("view"), status = params.get("status");
  if (view && !["upcoming", "past"].includes(view)) throw new PlatformError("INVALID_INPUT", "Invalid event view.");
  if (status && !["pending", "active", "suspended", "registered", "cancelled", "draft", "published"].includes(status)) throw new PlatformError("INVALID_INPUT", "Invalid status filter.");
  return { page, pageSize, q: q || undefined, category: category || undefined, view: view as ListQuery["view"] ?? undefined, status: status ?? undefined };
}
