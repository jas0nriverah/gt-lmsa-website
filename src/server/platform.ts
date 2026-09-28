import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import type {
  AuditAction,
  AuditEntry,
  Analytics,
  EventInput,
  Member,
  MemberHome,
  MemberInput,
  MembershipStatus,
  Page,
  PlatformEvent,
  Registration,
  Ticket,
} from "../lib/platform-contracts";
import { AUDIT_ACTIONS } from "../lib/platform-contracts";
import { PlatformError } from "./errors";
import type { Actor, ListQuery } from "./validation";
import { normalizeEmail, requireVerified, uuid } from "./validation";

type DbRow = { [column: string]: unknown };
type Database = Pool | PoolClient;
type RegistrationInput = { token?: string; registrationId?: string };

const MAX_EXPORT_ROWS = 10_000;
const MAX_TRANSACTION_ATTEMPTS = 3;
const EVENT_STATUSES = ["draft", "published", "cancelled"] as const;
const MEMBERSHIP_STATUSES = ["pending", "active", "suspended"] as const;

function fail(code: string, message: string, status = 400): never {
  throw new PlatformError(code, message, status);
}

function verifyActor(actor: Actor): void {
  requireVerified(actor);
  if (typeof actor.userId !== "string" || !actor.userId.trim() ||
      typeof actor.email !== "string" || !normalizeEmail(actor.email).includes("@")) {
    fail("UNVERIFIED", "Sign in with a verified account to continue.", 401);
  }
}

function isRetryableTransactionError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  return (error as { code?: unknown }).code === "40001" || (error as { code?: unknown }).code === "40P01";
}

function normalizeDatabaseError(error: unknown): never {
  if (error instanceof PlatformError) throw error;
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: unknown }).code ?? "");
    if (code === "23505") fail("CONFLICT", "That record already exists.", 409);
    if (code === "23503") fail("CONFLICT", "The requested record is no longer available.", 409);
    if (code === "23514" || code === "22P02" || code === "22007") fail("INVALID_INPUT", "The submitted data is invalid.", 400);
    if (code.startsWith("08") || ["ECONNREFUSED", "ECONNRESET", "ENOTFOUND", "ETIMEDOUT", "57P01"].includes(code)) {
      fail("DATABASE_UNAVAILABLE", "Member services are temporarily unavailable.", 503);
    }
    if (/^[0-9A-Z]{5}$/.test(code)) fail("DATABASE_UNAVAILABLE", "Member services are temporarily unavailable.", 503);
  }
  throw error;
}

async function safely<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    return normalizeDatabaseError(error);
  }
}

async function transaction<T>(pool: Pool, operation: (client: PoolClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    const client = await pool.connect();
    let retry = false;
    try {
      await client.query("BEGIN");
      const result = await operation(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      if (isRetryableTransactionError(error) && attempt + 1 < MAX_TRANSACTION_ATTEMPTS) {
        retry = true;
      } else {
        return normalizeDatabaseError(error);
      }
    } finally {
      client.release();
    }
    if (!retry) break;
  }
  fail("DATABASE_UNAVAILABLE", "Member services are temporarily unavailable. Please try again.", 503);
}

function value(row: DbRow, key: string): unknown {
  return row[key];
}

function asString(input: unknown): string {
  return typeof input === "string" ? input : String(input ?? "");
}

function asNumber(input: unknown): number {
  const parsed = typeof input === "number" ? input : Number(input ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asIso(input: unknown): string {
  const date = input instanceof Date ? input : new Date(String(input));
  return date.toISOString();
}

function asDate(input: unknown): Date {
  return input instanceof Date ? input : new Date(String(input));
}

function asIsoOrNull(input: unknown): string | null {
  return input === null || input === undefined ? null : asIso(input);
}

function asStringArray(input: unknown): string[] {
  return Array.isArray(input) ? input.filter((entry): entry is string => typeof entry === "string") : [];
}

function mapMember(row: DbRow): Member {
  return {
    id: asString(value(row, "id")),
    name: asString(value(row, "name")),
    email: asString(value(row, "email")),
    status: asString(value(row, "status")) as MembershipStatus,
    academicYear: asString(value(row, "academic_year")),
    major: asString(value(row, "major")),
    interests: asStringArray(value(row, "interests")),
    createdAt: asIso(value(row, "created_at")),
  };
}

function mapEvent(row: DbRow, prefix = ""): PlatformEvent {
  const attendanceCount = value(row, `${prefix}attendance_count`);
  return {
    id: asString(value(row, `${prefix}id`)),
    title: asString(value(row, `${prefix}title`)),
    description: asString(value(row, `${prefix}description`)),
    location: asString(value(row, `${prefix}location`)),
    category: asString(value(row, `${prefix}category`)),
    timingLabel: asString(value(row, `${prefix}timing_label`)),
    startsAt: asIsoOrNull(value(row, `${prefix}starts_at`)),
    endsAt: asIsoOrNull(value(row, `${prefix}ends_at`)),
    publicationStatus: asString(value(row, `${prefix}publication_status`)) as PlatformEvent["publicationStatus"],
    registrationStatus: asString(value(row, `${prefix}registration_status`)) as PlatformEvent["registrationStatus"],
    registrationOpensAt: asIsoOrNull(value(row, `${prefix}registration_opens_at`)),
    registrationClosesAt: asIsoOrNull(value(row, `${prefix}registration_closes_at`)),
    capacity: value(row, `${prefix}capacity`) === null ? null : asNumber(value(row, `${prefix}capacity`)),
    registeredCount: asNumber(value(row, `${prefix}registered_count`)),
    version: asNumber(value(row, `${prefix}version`)),
    ...(attendanceCount === null || attendanceCount === undefined
      ? {}
      : { attendanceCount: asNumber(attendanceCount) }),
  };
}

function mapRegistration(row: DbRow): Registration {
  const registration: Registration = {
    id: asString(value(row, "id")),
    eventId: asString(value(row, "event_id")),
    memberId: asString(value(row, "member_id")),
    status: asString(value(row, "status")) as Registration["status"],
    createdAt: asIso(value(row, "created_at")),
    checkedInAt: asIsoOrNull(value(row, "checked_in_at")),
  };
  if (value(row, "ev_id") !== undefined && value(row, "ev_id") !== null) {
    registration.event = mapEvent(row, "ev_");
  }
  if (value(row, "member_name") !== undefined) {
    registration.member = {
      name: asString(value(row, "member_name")),
      email: asString(value(row, "member_email")),
    };
  }
  return registration;
}

function assertPage(query: ListQuery): void {
  if (!Number.isInteger(query.page) || query.page < 1 || query.page > 10_000 ||
      !Number.isInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 50) {
    fail("INVALID_INPUT", "Invalid pagination.");
  }
  if (query.q !== undefined && (typeof query.q !== "string" || query.q.length > 100)) {
    fail("INVALID_INPUT", "Search text is too long.");
  }
}

function offsetFor(query: ListQuery): number {
  return (query.page - 1) * query.pageSize;
}

async function officerFlag(db: Database, userId: string): Promise<boolean> {
  const result = await db.query<DbRow>("SELECT EXISTS (SELECT 1 FROM officers WHERE user_id = $1) AS is_officer", [userId]);
  return value(result.rows[0], "is_officer") === true;
}

async function requireOfficer(db: Database, actor: Actor): Promise<void> {
  if (!await officerFlag(db, actor.userId)) fail("FORBIDDEN", "Officer access is required.", 403);
}

async function requireMember(db: Database, actor: Actor, activeOnly: boolean): Promise<DbRow> {
  const result = await db.query<DbRow>(
    `SELECT id, user_id, name, email, status, academic_year, major, interests, created_at
       FROM members WHERE user_id = $1 FOR UPDATE`,
    [actor.userId],
  );
  const member = result.rows[0];
  if (!member) fail("MEMBERSHIP_REQUIRED", "Complete the membership form before continuing.", 403);
  if (activeOnly && value(member, "status") !== "active") {
    fail("MEMBERSHIP_INACTIVE", "An approved active membership is required.", 403);
  }
  return member;
}

async function preflightMemberEligibility(pool: Pool, actor: Actor, activeOnly: boolean): Promise<void> {
  // Check eligibility without taking a member lock; the transaction rechecks under lock after locking the event.
  const result = await pool.query<DbRow>(
    "SELECT status FROM members WHERE user_id = $1",
    [actor.userId],
  );
  const member = result.rows[0];
  if (!member) fail("MEMBERSHIP_REQUIRED", "Complete the membership form before continuing.", 403);
  if (activeOnly && value(member, "status") !== "active") {
    fail("MEMBERSHIP_INACTIVE", "An approved active membership is required.", 403);
  }
}

function eventSelect(attendance = false): string {
  const attendanceColumn = attendance
    ? `(SELECT count(*)::int FROM attendance a JOIN registrations ar ON ar.id = a.registration_id WHERE ar.event_id = e.id) AS attendance_count`
    : "NULL::int AS attendance_count";
  return `SELECT e.*,
    (SELECT count(*)::int FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered') AS registered_count,
    ${attendanceColumn}
    FROM events e`;
}

async function selectEvent(db: Database, eventId: string, attendance = false): Promise<PlatformEvent | null> {
  const result = await db.query<DbRow>(`${eventSelect(attendance)} WHERE e.id = $1`, [eventId]);
  return result.rows[0] ? mapEvent(result.rows[0]) : null;
}

async function lockEvent(client: PoolClient, eventId: string): Promise<DbRow> {
  const result = await client.query<DbRow>("SELECT * FROM events WHERE id = $1 FOR UPDATE", [eventId]);
  if (!result.rows[0]) fail("NOT_FOUND", "Event not found.", 404);
  return result.rows[0];
}

async function registrationRow(db: Database, registrationId: string, eventId?: string): Promise<DbRow | null> {
  const result = await db.query<DbRow>(
    `SELECT r.id, r.event_id, r.member_id, r.status, r.created_at, a.checked_in_at,
            m.name AS member_name, m.email AS member_email
       FROM registrations r
       JOIN members m ON m.id = r.member_id
       LEFT JOIN attendance a ON a.registration_id = r.id
      WHERE r.id = $1 ${eventId ? "AND r.event_id = $2" : ""}`,
    eventId ? [registrationId, eventId] : [registrationId],
  );
  return result.rows[0] ?? null;
}

function optionalInstant(input: string | null, label: string): string | null {
  if (input === null) return null;
  if (typeof input !== "string" || !Number.isFinite(Date.parse(input))) {
    fail("INVALID_INPUT", `${label} must be a valid date and time.`);
  }
  return new Date(input).toISOString();
}

function cleanEventInput(input: EventInput): EventInput {
  if (!input || typeof input !== "object") fail("INVALID_INPUT", "Provide event details.");
  if (!EVENT_STATUSES.includes(input.publicationStatus) || !["open", "closed"].includes(input.registrationStatus)) {
    fail("INVALID_INPUT", "Choose valid event and registration statuses.");
  }
  for (const [name, field] of [["Title", input.title], ["Description", input.description], ["Location", input.location], ["Category", input.category], ["Timing label", input.timingLabel]] as const) {
    if (typeof field !== "string") fail("INVALID_INPUT", `${name} must be text.`);
  }
  if (!input.title.trim() || !input.category.trim()) fail("INVALID_INPUT", "Event title and category are required.");
  if (input.capacity !== null && (!Number.isInteger(input.capacity) || input.capacity < 1 || input.capacity > 10_000)) {
    fail("INVALID_INPUT", "Capacity must be 1–10,000 or unlimited.");
  }
  const startsAt = optionalInstant(input.startsAt, "Start time");
  const endsAt = optionalInstant(input.endsAt, "End time");
  const registrationOpensAt = optionalInstant(input.registrationOpensAt, "Registration opening time");
  const registrationClosesAt = optionalInstant(input.registrationClosesAt, "Registration closing time");
  if (Boolean(startsAt) !== Boolean(endsAt) || (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt))) {
    fail("INVALID_INPUT", "Provide both event times, with the end after the start, or leave both unconfirmed.");
  }
  if (registrationOpensAt && registrationClosesAt && Date.parse(registrationClosesAt) <= Date.parse(registrationOpensAt)) {
    fail("INVALID_INPUT", "Registration must close after it opens.");
  }
  if (input.registrationStatus === "open" && (!startsAt || input.publicationStatus !== "published")) {
    fail("INVALID_INPUT", "Confirm the schedule and publish the event before opening registration.");
  }
  return { ...input, startsAt, endsAt, registrationOpensAt, registrationClosesAt };
}

function eventValues(input: EventInput): unknown[] {
  return [
    input.title.trim(), input.description, input.location, input.category.trim(), input.timingLabel,
    input.startsAt, input.endsAt, input.publicationStatus, input.registrationStatus,
    input.registrationOpensAt, input.registrationClosesAt, input.capacity,
  ];
}

function eventMatchesInput(row: DbRow, input: EventInput): boolean {
  return asString(value(row, "title")) === input.title.trim() &&
    asString(value(row, "description")) === input.description &&
    asString(value(row, "location")) === input.location &&
    asString(value(row, "category")) === input.category.trim() &&
    asString(value(row, "timing_label")) === input.timingLabel &&
    asIsoOrNull(value(row, "starts_at")) === input.startsAt &&
    asIsoOrNull(value(row, "ends_at")) === input.endsAt &&
    asString(value(row, "publication_status")) === input.publicationStatus &&
    asString(value(row, "registration_status")) === input.registrationStatus &&
    asIsoOrNull(value(row, "registration_opens_at")) === input.registrationOpensAt &&
    asIsoOrNull(value(row, "registration_closes_at")) === input.registrationClosesAt &&
    (value(row, "capacity") === null ? null : asNumber(value(row, "capacity"))) === input.capacity;
}

async function recordAudit(
  client: PoolClient,
  actor: Actor,
  action: AuditAction,
  targetId: string,
  details: Record<string, string | number | null>,
): Promise<void> {
  const requestId = actor.requestId === undefined ? randomUUID() : uuid(actor.requestId);
  await client.query(
    `INSERT INTO officer_audit (id, actor_user_id, action, target_id, request_id, details)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [randomUUID(), actor.userId, action, targetId, requestId, JSON.stringify(details)],
  );
}

function mapAudit(row: DbRow): AuditEntry {
  const rawDetails = value(row, "details");
  const details: AuditEntry["details"] = {};
  if (rawDetails && typeof rawDetails === "object" && !Array.isArray(rawDetails)) {
    for (const [key, detail] of Object.entries(rawDetails)) {
      if (detail === null || typeof detail === "string" || (typeof detail === "number" && Number.isFinite(detail))) {
        details[key] = detail;
      }
    }
  }
  return {
    id: asString(value(row, "id")),
    actorUserId: asString(value(row, "actor_user_id")),
    action: asString(value(row, "action")) as AuditAction,
    targetId: asString(value(row, "target_id")),
    requestId: asString(value(row, "request_id")),
    details,
    createdAt: asIso(value(row, "created_at")),
  };
}

function assertAuditQuery(query: { page: number; pageSize: number; action?: AuditAction }): void {
  if (!Number.isInteger(query.page) || query.page < 1 || query.page > 10_000 ||
      !Number.isInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 50) {
    fail("INVALID_INPUT", "Invalid pagination.");
  }
  if (query.action !== undefined && !(AUDIT_ACTIONS as readonly string[]).includes(query.action)) {
    fail("INVALID_INPUT", "Invalid audit action filter.");
  }
}

async function currentDatabaseTime(db: Database): Promise<Date> {
  const result = await db.query<DbRow>("SELECT clock_timestamp() AS current_time");
  const current = value(result.rows[0], "current_time");
  return asDate(current);
}

async function countRegistered(db: Database, eventId: string): Promise<number> {
  const result = await db.query<DbRow>(
    "SELECT count(*)::int AS count FROM registrations WHERE event_id = $1 AND status = 'registered'",
    [eventId],
  );
  return asNumber(value(result.rows[0], "count"));
}

function eventCanAcceptRsvp(event: DbRow, now: Date): void {
  if (value(event, "publication_status") !== "published") {
    fail("EVENT_UNAVAILABLE", "This event is not accepting registrations.", 409);
  }
  if (value(event, "registration_status") !== "open") {
    fail("REGISTRATION_CLOSED", "Registration for this event is closed.", 409);
  }
  const startsAt = value(event, "starts_at");
  const endsAt = value(event, "ends_at");
  if (startsAt === null || startsAt === undefined || endsAt === null || endsAt === undefined) {
    fail("EVENT_TIME_UNCONFIRMED", "Registration is unavailable until the event time is confirmed.", 409);
  }
  if (now.getTime() >= asDate(startsAt).getTime()) {
    fail("REGISTRATION_CLOSED", "Registration for this event has closed because the event has started.", 409);
  }
  const opensAt = value(event, "registration_opens_at");
  const closesAt = value(event, "registration_closes_at");
  if (opensAt !== null && now.getTime() < asDate(opensAt).getTime()) {
    fail("REGISTRATION_NOT_OPEN", "Registration has not opened yet.", 409);
  }
  if (closesAt !== null && now.getTime() >= asDate(closesAt).getTime()) {
    fail("REGISTRATION_CLOSED", "Registration for this event is closed.", 409);
  }
  if (now.getTime() > asDate(endsAt).getTime()) {
    fail("REGISTRATION_CLOSED", "Registration for this event is closed.", 409);
  }
}

async function pageCounts(db: Database, countSql: string, values: unknown[]): Promise<number> {
  const result = await db.query<DbRow>(countSql, values);
  return asNumber(value(result.rows[0], "total"));
}

function addFilter(filters: string[], values: unknown[], sql: (placeholder: string) => string, parameter: unknown): void {
  values.push(parameter);
  filters.push(sql(`$${values.length}`));
}

function makeEventFilters(query: ListQuery, includeDrafts: boolean): { where: string; values: unknown[] } {
  const filters: string[] = [];
  const values: unknown[] = [];
  if (!includeDrafts) filters.push("e.publication_status IN ('published', 'cancelled')");
  if (query.q) addFilter(filters, values, p => `(e.title ILIKE ${p} OR e.description ILIKE ${p} OR e.location ILIKE ${p})`, `%${query.q}%`);
  if (query.category) addFilter(filters, values, p => `e.category ILIKE ${p}`, query.category);
  if (query.status) {
    if (!EVENT_STATUSES.includes(query.status as typeof EVENT_STATUSES[number])) fail("INVALID_INPUT", "Invalid event status filter.");
    addFilter(filters, values, p => `e.publication_status = ${p}`, query.status);
  }
  if (query.view === "upcoming") filters.push("(e.ends_at IS NULL OR e.ends_at >= CURRENT_TIMESTAMP)");
  if (query.view === "past") filters.push("e.ends_at IS NOT NULL AND e.ends_at < CURRENT_TIMESTAMP");
  return { where: filters.length ? `WHERE ${filters.join(" AND ")}` : "", values };
}

function registrationEventColumns(): string {
  return `e.id AS ev_id, e.title AS ev_title, e.description AS ev_description,
    e.location AS ev_location, e.category AS ev_category, e.timing_label AS ev_timing_label,
    e.starts_at AS ev_starts_at, e.ends_at AS ev_ends_at,
    e.publication_status AS ev_publication_status, e.registration_status AS ev_registration_status,
    e.registration_opens_at AS ev_registration_opens_at, e.registration_closes_at AS ev_registration_closes_at,
    e.capacity AS ev_capacity, e.version AS ev_version,
    (SELECT count(*)::int FROM registrations er WHERE er.event_id = e.id AND er.status = 'registered') AS ev_registered_count,
    NULL::int AS ev_attendance_count`;
}

function checkRegistrationQuery(query: ListQuery): void {
  assertPage(query);
  if (query.status && query.status !== "registered" && query.status !== "cancelled") {
    fail("INVALID_INPUT", "Invalid registration status filter.");
  }
}

function checkMemberStatus(status: string | undefined): void {
  if (status && !MEMBERSHIP_STATUSES.includes(status as MembershipStatus)) {
    fail("INVALID_INPUT", "Invalid membership status filter.");
  }
}

function csvCell(valueToEncode: unknown): string {
  let text = valueToEncode === null || valueToEncode === undefined ? "" : String(valueToEncode);
  if (/^[\s\u0000-\u001f\u007f]*[=+@\-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function createPlatform(pool: Pool) {
  return {
    async getMe(actor: Actor): Promise<MemberHome> {
      verifyActor(actor);
      return safely(async () => {
        const isOfficer = await officerFlag(pool, actor.userId);
        const result = await pool.query<DbRow>(
          `SELECT id, user_id, name, email, status, academic_year, major, interests, created_at
             FROM members WHERE user_id = $1`,
          [actor.userId],
        );
        return {
          member: result.rows[0] ? mapMember(result.rows[0]) : null,
          isOfficer,
          membershipApprovalEnabled: process.env.MEMBERSHIP_APPROVAL_ENABLED === "true",
        };
      });
    },

    async saveMember(actor: Actor, input: MemberInput): Promise<Member> {
      verifyActor(actor);
      if (!input || typeof input.name !== "string" || !input.name.trim() ||
          typeof input.academicYear !== "string" || typeof input.major !== "string" ||
          !Array.isArray(input.interests) || input.interests.some(item => typeof item !== "string")) {
        fail("INVALID_INPUT", "Provide valid membership details.");
      }
      const email = normalizeEmail(actor.email);
      return safely(() => transaction(pool, async client => {
        const id = randomUUID();
        const result = await client.query<DbRow>(
          `INSERT INTO members (id, user_id, name, email, academic_year, major, interests)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id) DO UPDATE SET
             name = EXCLUDED.name, email = EXCLUDED.email,
             academic_year = EXCLUDED.academic_year, major = EXCLUDED.major,
             interests = EXCLUDED.interests, updated_at = clock_timestamp()
           RETURNING id, user_id, name, email, status, academic_year, major, interests, created_at`,
          [id, actor.userId, input.name.trim(), email, input.academicYear, input.major, input.interests],
        );
        return mapMember(result.rows[0]);
      }));
    },

    async ownRegistrations(actor: Actor, query: ListQuery): Promise<Page<Registration>> {
      verifyActor(actor);
      checkRegistrationQuery(query);
      return safely(async () => {
        const values: unknown[] = [actor.userId];
        const filters = ["m.user_id = $1"];
        if (query.status) addFilter(filters, values, p => `r.status = ${p}`, query.status);
        if (query.q) addFilter(filters, values, p => `e.title ILIKE ${p}`, `%${query.q}%`);
        if (query.category) addFilter(filters, values, p => `e.category ILIKE ${p}`, query.category);
        if (query.view === "upcoming") filters.push("(e.ends_at IS NULL OR e.ends_at >= CURRENT_TIMESTAMP)");
        if (query.view === "past") filters.push("e.ends_at IS NOT NULL AND e.ends_at < CURRENT_TIMESTAMP");
        const where = `WHERE ${filters.join(" AND ")}`;
        const total = await pageCounts(pool,
          `SELECT count(*)::int AS total FROM registrations r JOIN members m ON m.id = r.member_id JOIN events e ON e.id = r.event_id ${where}`,
          values,
        );
        const rows = await pool.query<DbRow>(
          `SELECT r.id, r.event_id, r.member_id, r.status, r.created_at, a.checked_in_at,
                  ${registrationEventColumns()}
             FROM registrations r JOIN members m ON m.id = r.member_id
             JOIN events e ON e.id = r.event_id LEFT JOIN attendance a ON a.registration_id = r.id
             ${where}
             ORDER BY e.starts_at ASC NULLS LAST, r.created_at DESC
             LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
          [...values, query.pageSize, offsetFor(query)],
        );
        return { items: rows.rows.map(mapRegistration), page: query.page, pageSize: query.pageSize, total };
      });
    },

    async listEvents(query: ListQuery, actor?: Actor): Promise<Page<PlatformEvent>> {
      assertPage(query);
      if (actor) verifyActor(actor);
      return safely(async () => {
        if (actor) await requireOfficer(pool, actor);
        const filters = makeEventFilters(query, Boolean(actor));
        const total = await pageCounts(pool, `SELECT count(*)::int AS total FROM events e ${filters.where}`, filters.values);
        const rows = await pool.query<DbRow>(
          `${eventSelect(Boolean(actor))} ${filters.where}
           ORDER BY e.starts_at ASC NULLS LAST, e.created_at ASC
           LIMIT $${filters.values.length + 1} OFFSET $${filters.values.length + 2}`,
          [...filters.values, query.pageSize, offsetFor(query)],
        );
        return { items: rows.rows.map(row => mapEvent(row)), page: query.page, pageSize: query.pageSize, total };
      });
    },

    async getEvent(id: string, actor?: Actor): Promise<PlatformEvent> {
      const eventId = uuid(id);
      if (actor) verifyActor(actor);
      return safely(async () => {
        if (actor) await requireOfficer(pool, actor);
        const result = await pool.query<DbRow>(
          `${eventSelect(Boolean(actor))} WHERE e.id = $1${actor ? "" : " AND e.publication_status IN ('published', 'cancelled')"}`,
          [eventId],
        );
        if (!result.rows[0]) fail("NOT_FOUND", "Event not found.", 404);
        return mapEvent(result.rows[0]);
      });
    },

    async rsvp(actor: Actor, eventIdInput: string): Promise<Registration> {
      verifyActor(actor);
      const eventId = uuid(eventIdInput);
      return safely(async () => {
        await preflightMemberEligibility(pool, actor, true);
        return transaction(pool, async client => {
          const event = await lockEvent(client, eventId);
          const member = await requireMember(client, actor, true);
          const existingResult = await client.query<DbRow>(
            "SELECT id, status FROM registrations WHERE member_id = $1 AND event_id = $2 FOR UPDATE",
            [value(member, "id"), eventId],
          );
          const existing = existingResult.rows[0];
          if (value(event, "publication_status") !== "published") {
            fail("EVENT_UNAVAILABLE", "This event is not accepting registrations.", 409);
          }
          if (existing && value(existing, "status") === "registered") {
            const row = await registrationRow(client, asString(value(existing, "id")), eventId);
            if (!row) fail("NOT_FOUND", "Registration not found.", 404);
            return mapRegistration(row);
          }
          if (existing) {
            const attendance = await client.query<DbRow>("SELECT 1 FROM attendance WHERE registration_id = $1", [value(existing, "id")]);
            if (attendance.rowCount) fail("ALREADY_CHECKED_IN", "A checked-in registration cannot be reactivated.", 409);
          }
          const now = await currentDatabaseTime(client);
          eventCanAcceptRsvp(event, now);
          const count = await countRegistered(client, eventId);
          const capacity = value(event, "capacity");
          if (capacity !== null && count >= asNumber(capacity)) {
            fail("EVENT_FULL", "This event has reached capacity.", 409);
          }
          const registrationId = existing ? asString(value(existing, "id")) : randomUUID();
          if (existing) {
            await client.query(
              `UPDATE registrations SET status = 'registered', created_at = clock_timestamp(),
                 updated_at = clock_timestamp(), ticket_token_hash = NULL, ticket_expires_at = NULL
               WHERE id = $1`,
              [registrationId],
            );
          } else {
            await client.query(
              "INSERT INTO registrations (id, member_id, event_id, status) VALUES ($1, $2, $3, 'registered')",
              [registrationId, value(member, "id"), eventId],
            );
          }
          const row = await registrationRow(client, registrationId, eventId);
          if (!row) fail("NOT_FOUND", "Registration not found.", 404);
          return mapRegistration(row);
        });
      });
    },

    async cancelRsvp(actor: Actor, eventIdInput: string): Promise<Registration> {
      verifyActor(actor);
      const eventId = uuid(eventIdInput);
      return safely(async () => {
        await preflightMemberEligibility(pool, actor, false);
        return transaction(pool, async client => {
          await lockEvent(client, eventId);
          const member = await requireMember(client, actor, false);
          const result = await client.query<DbRow>(
            "SELECT id, status FROM registrations WHERE member_id = $1 AND event_id = $2 FOR UPDATE",
            [value(member, "id"), eventId],
          );
          const existing = result.rows[0];
          let registrationId: string;
          if (!existing) {
            registrationId = randomUUID();
            await client.query(
              "INSERT INTO registrations (id, member_id, event_id, status) VALUES ($1, $2, $3, 'cancelled')",
              [registrationId, value(member, "id"), eventId],
            );
          } else {
            registrationId = asString(value(existing, "id"));
            if (value(existing, "status") === "registered") {
              const attendance = await client.query<DbRow>("SELECT 1 FROM attendance WHERE registration_id = $1", [registrationId]);
              if (attendance.rowCount) fail("ALREADY_CHECKED_IN", "A checked-in registration cannot be cancelled.", 409);
              await client.query(
                `UPDATE registrations SET status = 'cancelled', updated_at = clock_timestamp(),
                   ticket_token_hash = NULL, ticket_expires_at = NULL WHERE id = $1`,
                [registrationId],
              );
            }
          }
          const row = await registrationRow(client, registrationId, eventId);
          if (!row) fail("NOT_FOUND", "Registration not found.", 404);
          return mapRegistration(row);
        });
      });
    },

    async issueTicket(actor: Actor, eventIdInput: string): Promise<Ticket> {
      verifyActor(actor);
      const eventId = uuid(eventIdInput);
      return safely(async () => {
        await preflightMemberEligibility(pool, actor, true);
        return transaction(pool, async client => {
          const event = await lockEvent(client, eventId);
          if (value(event, "publication_status") !== "published") {
            fail("EVENT_UNAVAILABLE", "Tickets are unavailable for this event.", 409);
          }
          if (!value(event, "starts_at") || !value(event, "ends_at")) {
            fail("EVENT_TIME_UNCONFIRMED", "Tickets are unavailable until the event time is confirmed.", 409);
          }
          const member = await requireMember(client, actor, true);
          const now = await currentDatabaseTime(client);
          const expiresAt = new Date(String(value(event, "ends_at")));
          expiresAt.setTime(expiresAt.getTime() + 2 * 60 * 60 * 1000);
          if (expiresAt <= now) fail("TICKET_EXPIRED", "Ticket issuance has closed for this event.", 409);
          const result = await client.query<DbRow>(
            `SELECT id FROM registrations WHERE member_id = $1 AND event_id = $2 AND status = 'registered' FOR UPDATE`,
            [value(member, "id"), eventId],
          );
          if (!result.rows[0]) fail("REGISTRATION_REQUIRED", "Register for this event before requesting a ticket.", 409);
          const registrationId = asString(value(result.rows[0], "id"));
          const token = randomBytes(32).toString("base64url");
          const tokenHash = createHash("sha256").update(token).digest("hex");
          const update = await client.query<DbRow>(
            `UPDATE registrations r SET ticket_token_hash = $1,
               ticket_expires_at = e.ends_at + interval '2 hours', updated_at = clock_timestamp()
             FROM events e WHERE r.id = $2 AND e.id = r.event_id
             RETURNING r.ticket_expires_at`,
            [tokenHash, registrationId],
          );
          return {
            token,
            expiresAt: asIso(value(update.rows[0], "ticket_expires_at")),
            registrationId,
            eventId,
          };
        });
      });
    },

    async listMembers(actor: Actor, query: ListQuery): Promise<Page<Member>> {
      verifyActor(actor);
      assertPage(query);
      checkMemberStatus(query.status);
      return safely(async () => {
        await requireOfficer(pool, actor);
        const filters: string[] = [];
        const values: unknown[] = [];
        if (query.status) addFilter(filters, values, p => `m.status = ${p}`, query.status);
        if (query.q) addFilter(filters, values, p => `(m.name ILIKE ${p} OR m.email ILIKE ${p} OR m.major ILIKE ${p} OR m.academic_year ILIKE ${p})`, `%${query.q}%`);
        const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
        const total = await pageCounts(pool, `SELECT count(*)::int AS total FROM members m ${where}`, values);
        const rows = await pool.query<DbRow>(
          `SELECT m.id, m.user_id, m.name, m.email, m.status, m.academic_year, m.major, m.interests, m.created_at
             FROM members m ${where} ORDER BY m.created_at DESC
             LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
          [...values, query.pageSize, offsetFor(query)],
        );
        return { items: rows.rows.map(mapMember), page: query.page, pageSize: query.pageSize, total };
      });
    },

    async listAudit(
      actor: Actor,
      query: { page: number; pageSize: number; action?: AuditAction },
    ): Promise<Page<AuditEntry>> {
      verifyActor(actor);
      assertAuditQuery(query);
      return safely(async () => {
        await requireOfficer(pool, actor);
        const values: unknown[] = [];
        let where = "";
        if (query.action !== undefined) {
          values.push(query.action);
          where = "WHERE action = $1";
        }
        const total = await pageCounts(
          pool,
          `SELECT count(*)::int AS total FROM officer_audit ${where}`,
          values,
        );
        const rows = await pool.query<DbRow>(
          `SELECT id, actor_user_id, action, target_id, request_id, details, created_at
             FROM officer_audit ${where}
             ORDER BY created_at DESC, id DESC
             LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
          [...values, query.pageSize, offsetFor(query)],
        );
        return { items: rows.rows.map(mapAudit), page: query.page, pageSize: query.pageSize, total };
      });
    },

    async setMemberStatus(actor: Actor, idInput: string, status: MembershipStatus): Promise<Member> {
      verifyActor(actor);
      const id = uuid(idInput);
      if (!MEMBERSHIP_STATUSES.includes(status)) fail("INVALID_INPUT", "Invalid membership status.");
      return safely(() => transaction(pool, async client => {
        await requireOfficer(client, actor);
        if (process.env.MEMBERSHIP_APPROVAL_ENABLED !== "true") {
          fail("MEMBERSHIP_APPROVAL_DISABLED", "Membership approvals are not enabled.", 403);
        }
        const locked = await client.query<DbRow>(
          `SELECT id, user_id, name, email, status, academic_year, major, interests, created_at
             FROM members WHERE id = $1 FOR UPDATE`,
          [id],
        );
        if (!locked.rows[0]) fail("NOT_FOUND", "Member not found.", 404);
        const previousStatus = asString(value(locked.rows[0], "status")) as MembershipStatus;
        if (previousStatus === status) return mapMember(locked.rows[0]);
        const result = await client.query<DbRow>(
          `UPDATE members SET status = $2, updated_at = clock_timestamp()
           WHERE id = $1
           RETURNING id, user_id, name, email, status, academic_year, major, interests, created_at`,
          [id, status],
        );
        await recordAudit(client, actor, "member.status_changed", id, {
          previousStatus,
          status,
        });
        return mapMember(result.rows[0]);
      }));
    },

    async createEvent(actor: Actor, input: EventInput): Promise<PlatformEvent> {
      verifyActor(actor);
      const clean = cleanEventInput(input);
      return safely(() => transaction(pool, async client => {
        await requireOfficer(client, actor);
        const id = randomUUID();
        await client.query(
          `INSERT INTO events (
             id, title, description, location, category, timing_label, starts_at, ends_at,
             publication_status, registration_status, registration_opens_at,
             registration_closes_at, capacity
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [id, ...eventValues(clean)],
        );
        const event = await selectEvent(client, id, true);
        if (!event) fail("NOT_FOUND", "Event not found.", 404);
        await recordAudit(client, actor, "event.created", id, {
          version: event.version,
          publicationStatus: event.publicationStatus,
          registrationStatus: event.registrationStatus,
        });
        return event;
      }));
    },

    async updateEvent(actor: Actor, idInput: string, input: EventInput, expectedVersion: number): Promise<PlatformEvent> {
      verifyActor(actor);
      const id = uuid(idInput);
      if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
        fail("INVALID_INPUT", "A positive event version is required.");
      }
      const clean = cleanEventInput(input);
      return safely(async () => {
        await requireOfficer(pool, actor);
        return transaction(pool, async client => {
          const previous = await lockEvent(client, id);
          await requireOfficer(client, actor);
          const previousVersion = asNumber(value(previous, "version"));
          if (previousVersion !== expectedVersion) {
            fail("STALE_EVENT", "This event changed since it was loaded. Reload the current version before saving.", 409);
          }
          const registeredCount = await countRegistered(client, id);
          if (clean.capacity !== null && clean.capacity < registeredCount) {
            fail("CAPACITY_BELOW_REGISTRATIONS", "Capacity cannot be lower than the current number of registrations.", 409);
          }
          if (eventMatchesInput(previous, clean)) {
            const unchanged = await selectEvent(client, id, true);
            if (!unchanged) fail("NOT_FOUND", "Event not found.", 404);
            return unchanged;
          }
          const timesChanged = asIsoOrNull(value(previous, "starts_at")) !== clean.startsAt ||
            asIsoOrNull(value(previous, "ends_at")) !== clean.endsAt;
          const updated = await client.query<DbRow>(
            `UPDATE events SET
               title = $2, description = $3, location = $4, category = $5, timing_label = $6,
               starts_at = $7, ends_at = $8, publication_status = $9, registration_status = $10,
               registration_opens_at = $11, registration_closes_at = $12, capacity = $13,
               version = version + 1, updated_at = clock_timestamp()
             WHERE id = $1
             RETURNING version`,
            [id, ...eventValues(clean)],
          );
          if (timesChanged || clean.publicationStatus === "cancelled") {
            await client.query(
              `UPDATE registrations SET ticket_token_hash = NULL, ticket_expires_at = NULL,
                 updated_at = clock_timestamp() WHERE event_id = $1 AND ticket_token_hash IS NOT NULL`,
              [id],
            );
          }
          const version = asNumber(value(updated.rows[0], "version"));
          await recordAudit(client, actor, "event.updated", id, {
            previousVersion,
            version,
            previousPublicationStatus: asString(value(previous, "publication_status")),
            publicationStatus: clean.publicationStatus,
            previousRegistrationStatus: asString(value(previous, "registration_status")),
            registrationStatus: clean.registrationStatus,
          });
          const event = await selectEvent(client, id, true);
          if (!event) fail("NOT_FOUND", "Event not found.", 404);
          return event;
        });
      });
    },

    async registrations(actor: Actor, eventIdInput: string, query: ListQuery): Promise<Page<Registration>> {
      verifyActor(actor);
      const eventId = uuid(eventIdInput);
      checkRegistrationQuery(query);
      return safely(async () => {
        await requireOfficer(pool, actor);
        const eventExists = await pool.query<DbRow>("SELECT 1 FROM events WHERE id = $1", [eventId]);
        if (!eventExists.rowCount) fail("NOT_FOUND", "Event not found.", 404);
        const filters = ["r.event_id = $1"];
        const values: unknown[] = [eventId];
        if (query.status) addFilter(filters, values, p => `r.status = ${p}`, query.status);
        if (query.q) addFilter(filters, values, p => `(m.name ILIKE ${p} OR m.email ILIKE ${p})`, `%${query.q}%`);
        const where = `WHERE ${filters.join(" AND ")}`;
        const total = await pageCounts(pool,
          `SELECT count(*)::int AS total FROM registrations r JOIN members m ON m.id = r.member_id ${where}`,
          values,
        );
        const rows = await pool.query<DbRow>(
          `SELECT r.id, r.event_id, r.member_id, r.status, r.created_at,
                  a.checked_in_at, m.name AS member_name, m.email AS member_email
             FROM registrations r JOIN members m ON m.id = r.member_id
             LEFT JOIN attendance a ON a.registration_id = r.id ${where}
             ORDER BY r.created_at DESC
             LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
          [...values, query.pageSize, offsetFor(query)],
        );
        return { items: rows.rows.map(mapRegistration), page: query.page, pageSize: query.pageSize, total };
      });
    },

    async checkIn(actor: Actor, eventIdInput: string, input: RegistrationInput): Promise<Registration> {
      verifyActor(actor);
      const eventId = uuid(eventIdInput);
      const hasToken = typeof input?.token === "string" && input.token.length > 0;
      const hasRegistrationId = typeof input?.registrationId === "string" && input.registrationId.length > 0;
      if (hasToken === hasRegistrationId) fail("INVALID_INPUT", "Provide either a check-in code or a registration ID.");
      const registrationId = hasRegistrationId ? uuid(input.registrationId as string) : null;
      const tokenHash = hasToken ? createHash("sha256").update(input.token as string).digest("hex") : null;
      return safely(async () => {
        await requireOfficer(pool, actor);
        return transaction(pool, async client => {
          const event = await lockEvent(client, eventId);
          await requireOfficer(client, actor);
          if (value(event, "publication_status") !== "published") {
            fail("EVENT_UNAVAILABLE", "Check-in is unavailable for this event.", 409);
          }
          const startsAt = value(event, "starts_at");
          const endsAt = value(event, "ends_at");
          if (!startsAt || !endsAt) fail("EVENT_TIME_UNCONFIRMED", "Check-in is unavailable until the event time is confirmed.", 409);
          const now = await currentDatabaseTime(client);
          const start = asDate(startsAt);
          const end = asDate(endsAt);
          if (now.getTime() < start.getTime() - 60 * 60 * 1000 || now.getTime() > end.getTime() + 120 * 60 * 1000) {
            fail("CHECKIN_CLOSED", "Check-in is outside the event check-in window.", 409);
          }
          const target = registrationId
            ? await client.query<DbRow>(
                `SELECT r.id, r.member_id FROM registrations r
                  WHERE r.id = $1 AND r.event_id = $2`,
                [registrationId, eventId],
              )
            : await client.query<DbRow>(
                `SELECT r.id, r.member_id FROM registrations r
                  WHERE r.event_id = $1 AND r.ticket_token_hash = $2`,
                [eventId, tokenHash],
              );
          const located = target.rows[0];
          if (!located) {
            fail("INVALID_TICKET", "The registration is cancelled, inactive, or unavailable.", 409);
          }
          const lockedMember = await client.query<DbRow>(
            "SELECT status FROM members WHERE id = $1 FOR UPDATE",
            [value(located, "member_id")],
          );
          if (!lockedMember.rows[0] || value(lockedMember.rows[0], "status") !== "active") {
            fail("INVALID_TICKET", "The registration is cancelled, inactive, or unavailable.", 409);
          }
          const candidateResult = await client.query<DbRow>(
            `SELECT id, event_id, member_id, status, created_at, ticket_expires_at
               FROM registrations WHERE id = $1 AND event_id = $2 FOR UPDATE`,
            [value(located, "id"), eventId],
          );
          const candidate = candidateResult.rows[0];
          if (!candidate || value(candidate, "status") !== "registered") {
            fail("INVALID_TICKET", "The registration is cancelled, inactive, or unavailable.", 409);
          }
          if (tokenHash && (!value(candidate, "ticket_expires_at") || now.getTime() >= asDate(value(candidate, "ticket_expires_at")).getTime())) {
            fail("INVALID_TICKET", "The ticket is invalid or expired.", 409);
          }
          const resolvedRegistrationId = asString(value(candidate, "id"));
          const inserted = await client.query<DbRow>(
            `INSERT INTO attendance (registration_id, officer_user_id)
             VALUES ($1, $2) ON CONFLICT (registration_id) DO NOTHING`,
            [resolvedRegistrationId, actor.userId],
          );
          if (inserted.rowCount) {
            await recordAudit(client, actor, "attendance.recorded", resolvedRegistrationId, { eventId });
          }
          const row = await registrationRow(client, resolvedRegistrationId, eventId);
          if (!row) fail("NOT_FOUND", "Registration not found.", 404);
          return mapRegistration(row);
        });
      });
    },

    async exportAttendance(actor: Actor, eventIdInput: string): Promise<string> {
      verifyActor(actor);
      const eventId = uuid(eventIdInput);
      return safely(async () => {
        await requireOfficer(pool, actor);
        return transaction(pool, async client => {
          await requireOfficer(client, actor);
          const result = await client.query<DbRow>(
            `SELECT r.id AS registration_id, r.event_id, e.title AS event_title,
                    r.status AS registration_status, r.created_at AS registered_at,
                    a.checked_in_at, m.name, m.email
               FROM registrations r JOIN members m ON m.id = r.member_id
               JOIN events e ON e.id = r.event_id
               LEFT JOIN attendance a ON a.registration_id = r.id
              WHERE r.event_id = $1
              ORDER BY r.created_at, m.name
              LIMIT $2`,
            [eventId, MAX_EXPORT_ROWS + 1],
          );
          if (result.rows.length > MAX_EXPORT_ROWS) {
            fail("EXPORT_TOO_LARGE", `This export exceeds the ${MAX_EXPORT_ROWS.toLocaleString()} row limit.`, 413);
          }
          if (!result.rows.length) {
            const event = await client.query<DbRow>("SELECT 1 FROM events WHERE id = $1", [eventId]);
            if (!event.rowCount) fail("NOT_FOUND", "Event not found.", 404);
          }
          const lines = [["registration_id", "event_id", "event_title", "name", "email", "registration_status", "registered_at", "checked_in_at"]];
          for (const row of result.rows) {
            lines.push([
              asString(value(row, "registration_id")), asString(value(row, "event_id")),
              asString(value(row, "event_title")), asString(value(row, "name")),
              asString(value(row, "email")), asString(value(row, "registration_status")),
              asIso(value(row, "registered_at")), asIsoOrNull(value(row, "checked_in_at")) ?? "",
            ]);
          }
          const csv = lines.map(line => line.map(csvCell).join(",")).join("\r\n");
          await recordAudit(client, actor, "attendance.exported", eventId, { rowCount: result.rows.length });
          return csv;
        });
      });
    },

    async analytics(actor: Actor): Promise<Analytics> {
      verifyActor(actor);
      return safely(async () => {
        await requireOfficer(pool, actor);
        const [totals, growth, interests, events] = await Promise.all([
          pool.query<DbRow>(
            `SELECT count(*)::int AS total_members,
                    count(*) FILTER (WHERE status = 'pending')::int AS pending_members,
                    count(*) FILTER (WHERE status = 'active')::int AS active_members
               FROM members`,
          ),
          pool.query<DbRow>(
            `SELECT to_char(
                      date_trunc('month', created_at AT TIME ZONE 'America/New_York'),
                      'YYYY-MM'
                    ) AS month,
                    count(*)::int AS count
               FROM members
              WHERE created_at >= (
                date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York') - interval '11 months'
              ) AT TIME ZONE 'America/New_York'
              GROUP BY date_trunc('month', created_at AT TIME ZONE 'America/New_York')
              ORDER BY date_trunc('month', created_at AT TIME ZONE 'America/New_York')`,
          ),
          pool.query<DbRow>(
          `SELECT i.interest, count(*)::int AS count
               FROM members m CROSS JOIN LATERAL unnest(m.interests) AS i(interest)
              WHERE btrim(i.interest) <> ''
              GROUP BY i.interest ORDER BY count(*) DESC, i.interest ASC`,
          ),
          pool.query<DbRow>(
            `SELECT e.id, e.title,
                    count(r.id) FILTER (WHERE r.status = 'registered')::int AS registered,
                    count(a.registration_id)::int AS attended
               FROM events e
               LEFT JOIN registrations r ON r.event_id = e.id
               LEFT JOIN attendance a ON a.registration_id = r.id
              WHERE e.publication_status IN ('published', 'cancelled')
              GROUP BY e.id, e.title, e.starts_at
              ORDER BY e.starts_at DESC NULLS LAST, e.title`,
          ),
        ]);
        const totalsRow = totals.rows[0];
        return {
          totalMembers: asNumber(value(totalsRow, "total_members")),
          pendingMembers: asNumber(value(totalsRow, "pending_members")),
          activeMembers: asNumber(value(totalsRow, "active_members")),
          growth: growth.rows.map(row => ({ month: asString(value(row, "month")), count: asNumber(value(row, "count")) })),
          interests: interests.rows.map(row => ({ interest: asString(value(row, "interest")), count: asNumber(value(row, "count")) })),
          events: events.rows.map(row => {
            const registered = asNumber(value(row, "registered"));
            const attended = asNumber(value(row, "attended"));
            return {
              id: asString(value(row, "id")), title: asString(value(row, "title")),
              registered, attended,
              attendanceRate: registered === 0 ? 0 : Number(((attended / registered) * 100).toFixed(2)),
            };
          }),
        };
      });
    },
  };
}
