import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { Pool, type PoolClient } from "pg";
import { validateTestDatabaseUrl } from "../scripts/test-database";
import type { EventInput } from "../src/lib/platform-contracts";
import { createPlatform } from "../src/server/platform";
import type { Actor } from "../src/server/validation";

const testDatabaseUrl = process.env.TEST_DATABASE_URL
  ? validateTestDatabaseUrl(process.env.TEST_DATABASE_URL)
  : null;
const skipped = testDatabaseUrl ? false : "Set TEST_DATABASE_URL to a loopback PostgreSQL database ending in _test.";

const officer: Actor = { userId: "platform-test-officer", email: "officer@example.test", emailVerified: true };
const memberA: Actor = { userId: "platform-test-member-a", email: "a@example.test", emailVerified: true };
const memberB: Actor = { userId: "platform-test-member-b", email: "b@example.test", emailVerified: true };
const memberC: Actor = { userId: "platform-test-member-c", email: "c@example.test", emailVerified: true };
const unverified: Actor = { userId: "platform-test-member-a", email: "a@example.test", emailVerified: false };

let adminPool: Pool | undefined;
let platformPool: Pool | undefined;
let schemaName: string | undefined;
let platform: ReturnType<typeof createPlatform>;
let originalApprovalSetting: string | undefined;

function eventInput(options: { capacity?: number | null; dated?: boolean; startsInMinutes?: number } = {}): EventInput {
  const dated = options.dated ?? true;
  const start = new Date(Date.now() + (options.startsInMinutes ?? 30) * 60_000);
  const end = new Date(start.getTime() + 60 * 60_000);
  return {
    title: `Integration event ${randomUUID()}`,
    description: "Synthetic integration test record.",
    location: "Test venue",
    category: "Test",
    timingLabel: "Integration test",
    startsAt: dated ? start.toISOString() : null,
    endsAt: dated ? end.toISOString() : null,
    publicationStatus: "published",
    registrationStatus: dated ? "open" : "closed",
    registrationOpensAt: null,
    registrationClosesAt: null,
    capacity: options.capacity ?? null,
  };
}

function pageQuery(status?: string) {
  return { page: 1, pageSize: 50, ...(status ? { status } : {}) };
}

async function expectPlatformCode(action: Promise<unknown>, code: string): Promise<void> {
  await assert.rejects(action, error => {
    assert.equal((error as { code?: string }).code, code);
    return true;
  });
}

describe("platform PostgreSQL integration", { skip: skipped, concurrency: false }, () => {
  before(async () => {
    if (!testDatabaseUrl) throw new Error("A safe TEST_DATABASE_URL is required.");
    originalApprovalSetting = process.env.MEMBERSHIP_APPROVAL_ENABLED;
    process.env.MEMBERSHIP_APPROVAL_ENABLED = "true";
    adminPool = new Pool({ connectionString: testDatabaseUrl, max: 1 });
    schemaName = `platform_test_${randomUUID().replaceAll("-", "")}`;
    await adminPool.query(`CREATE SCHEMA "${schemaName}"`);
    platformPool = new Pool({
      connectionString: testDatabaseUrl,
      max: 4,
      options: `-c search_path=${schemaName}`,
    });
    await platformPool.query('CREATE TABLE "user" (id text PRIMARY KEY)');
    const migration = await readFile(resolve(process.cwd(), "migrations/001-platform.sql"), "utf8");
    await platformPool.query(migration);
    const securityMigration = await readFile(resolve(process.cwd(), "migrations/002-security-audit.sql"), "utf8");
    await platformPool.query(securityMigration);

    const grants = await platformPool.query<{ count: string }>("SELECT count(*)::text AS count FROM officers");
    assert.equal(Number(grants.rows[0].count), 0, "the migration must not create a first officer");

    await platformPool.query(
      'INSERT INTO "user" (id) VALUES ($1), ($2), ($3), ($4)',
      [officer.userId, memberA.userId, memberB.userId, memberC.userId],
    );
    await platformPool.query("INSERT INTO officers (user_id) VALUES ($1)", [officer.userId]);
    platform = createPlatform(platformPool);
    for (const actor of [memberA, memberB, memberC]) {
      const member = await platform.saveMember(actor, {
        name: `Test member ${actor.userId.slice(-1)}`,
        academicYear: "",
        major: "",
        interests: ["Mentorship"],
      });
      await platform.setMemberStatus(officer, member.id, "active");
    }
  });

  after(async () => {
    await platformPool?.end();
    if (adminPool && schemaName) {
      await adminPool.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }
    await adminPool?.end();
    if (originalApprovalSetting === undefined) delete process.env.MEMBERSHIP_APPROVAL_ENABLED;
    else process.env.MEMBERSHIP_APPROVAL_ENABLED = originalApprovalSetting;
  });

  it("seeds the confirmed interest meeting and keeps the unconfirmed first general body meeting hidden", async () => {
    const result = await platformPool!.query<{
      id: string; title: string; location: string; starts_at: Date | null; ends_at: Date | null;
      publication_status: string; registration_status: string;
    }>(
      `SELECT id, title, location, starts_at, ends_at, publication_status, registration_status
         FROM events WHERE id IN ($1, $2) ORDER BY id`,
      ["b978ce11-0e75-4e1d-91cb-5fb6fd327001", "b978ce11-0e75-4e1d-91cb-5fb6fd327002"],
    );
    assert.equal(result.rows.length, 2);
    assert.deepEqual(new Set(result.rows.map(row => row.title)), new Set(["Fall 2026 Interest Meeting", "First General Body Meeting"]));
    const interestMeeting = result.rows.find(row => row.id === "b978ce11-0e75-4e1d-91cb-5fb6fd327001")!;
    assert.equal(interestMeeting.starts_at?.toISOString(), "2026-10-15T22:30:00.000Z");
    assert.equal(interestMeeting.ends_at?.toISOString(), "2026-10-15T23:30:00.000Z");
    assert.equal(interestMeeting.location, "Instructional Center (IC), Room 115");
    assert.equal(interestMeeting.publication_status, "published");
    assert.equal(interestMeeting.registration_status, "closed");
    const generalBodyMeeting = result.rows.find(row => row.id === "b978ce11-0e75-4e1d-91cb-5fb6fd327002")!;
    assert.equal(generalBodyMeeting.starts_at, null);
    assert.equal(generalBodyMeeting.ends_at, null);
    assert.equal(generalBodyMeeting.publication_status, "draft");
    assert.equal(generalBodyMeeting.registration_status, "closed");
  });

  it("preflights member and officer eligibility before waiting on an event row lock", async () => {
    const event = await platform.createEvent(officer, eventInput());
    const memberRow = await platformPool!.query<{ id: string }>(
      "SELECT id FROM members WHERE user_id = $1",
      [memberA.userId],
    );
    assert.ok(memberRow.rows[0]);
    const noProfile: Actor = {
      userId: `platform-test-no-profile-${randomUUID()}`,
      email: "no-profile@example.test",
      emailVerified: true,
    };
    let preflightPool: Pool | undefined;
    let lockClient: PoolClient | undefined;
    let transactionOpen = false;

    try {
      await platform.setMemberStatus(officer, memberRow.rows[0].id, "suspended");
      preflightPool = new Pool({
        connectionString: testDatabaseUrl!,
        max: 3,
        options: `-c search_path=${schemaName} -c statement_timeout=750`,
      });
      const preflightPlatform = createPlatform(preflightPool);
      lockClient = await platformPool!.connect();
      await lockClient.query("BEGIN");
      transactionOpen = true;
      await lockClient.query("SELECT id FROM events WHERE id = $1 FOR UPDATE", [event.id]);

      await expectPlatformCode(preflightPlatform.rsvp(memberA, event.id), "MEMBERSHIP_INACTIVE");
      await expectPlatformCode(preflightPlatform.issueTicket(memberA, event.id), "MEMBERSHIP_INACTIVE");
      await expectPlatformCode(preflightPlatform.cancelRsvp(noProfile, event.id), "MEMBERSHIP_REQUIRED");
      await expectPlatformCode(preflightPlatform.updateEvent(memberB, event.id, eventInput(), event.version), "FORBIDDEN");
      await expectPlatformCode(
        preflightPlatform.checkIn(memberB, event.id, { registrationId: randomUUID() }),
        "FORBIDDEN",
      );

      await lockClient.query("ROLLBACK");
      transactionOpen = false;
      lockClient.release();
      lockClient = undefined;
      await preflightPool.end();
      preflightPool = undefined;

      const cancelled = await platform.cancelRsvp(memberA, event.id);
      assert.equal(cancelled.status, "cancelled", "suspended members may still cancel registrations");
    } finally {
      if (lockClient) {
        if (transactionOpen) await lockClient.query("ROLLBACK").catch(() => undefined);
        lockClient.release();
      }
      await preflightPool?.end().catch(() => undefined);
      await platform.setMemberStatus(officer, memberRow.rows[0].id, "active");
    }
  });

  it("serializes competing event edits by expected version and preserves no-op versions", async () => {
    const input = eventInput();
    const event = await platform.createEvent(officer, input);
    assert.equal(event.version, 1);

    const unchanged = await platform.updateEvent(officer, event.id, input, event.version);
    assert.equal(unchanged.version, event.version);
    await expectPlatformCode(platform.updateEvent(officer, event.id, input, 0), "INVALID_INPUT");

    const edits = [
      { ...input, title: `${input.title} first edit` },
      { ...input, title: `${input.title} competing edit` },
    ];
    const race = await Promise.allSettled(edits.map(edit => platform.updateEvent(officer, event.id, edit, event.version)));
    assert.equal(race.filter(result => result.status === "fulfilled").length, 1);
    const rejected = race.find(result => result.status === "rejected");
    assert.ok(rejected && rejected.status === "rejected");
    assert.equal((rejected.reason as { code?: string }).code, "STALE_EVENT");

    const current = await platform.getEvent(event.id, officer);
    assert.equal(current.version, event.version + 1);
    await expectPlatformCode(platform.updateEvent(officer, event.id, input, event.version), "STALE_EVENT");
    const auditCount = await platformPool!.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM officer_audit WHERE action = 'event.updated' AND target_id = $1",
      [event.id],
    );
    assert.equal(Number(auditCount.rows[0].count), 1);
  });

  it("makes duplicate RSVPs idempotent and serializes independent last-seat races", async () => {
    const duplicateEvent = await platform.createEvent(officer, eventInput({ capacity: 2 }));
    const duplicate = await Promise.all([
      platform.rsvp(memberA, duplicateEvent.id),
      platform.rsvp(memberA, duplicateEvent.id),
    ]);
    assert.equal(duplicate[0].id, duplicate[1].id);
    assert.equal((await platform.registrations(officer, duplicateEvent.id, pageQuery())).total, 1);

    const lastSeatEvent = await platform.createEvent(officer, eventInput({ capacity: 1 }));
    const race = await Promise.allSettled([
      platform.rsvp(memberB, lastSeatEvent.id),
      platform.rsvp(memberC, lastSeatEvent.id),
    ]);
    assert.equal(race.filter(result => result.status === "fulfilled").length, 1);
    assert.equal(race.filter(result => result.status === "rejected").length, 1);
    assert.equal((await platform.registrations(officer, lastSeatEvent.id, pageQuery("registered"))).total, 1);
  });

  it("supports repeat cancellation and re-registration on the same registration", async () => {
    const event = await platform.createEvent(officer, eventInput({ capacity: 2 }));
    const first = await platform.rsvp(memberA, event.id);
    const cancelled = await platform.cancelRsvp(memberA, event.id);
    assert.equal(cancelled.id, first.id);
    assert.equal(cancelled.status, "cancelled");
    const repeatedCancel = await platform.cancelRsvp(memberA, event.id);
    assert.equal(repeatedCancel.id, first.id);
    assert.equal(repeatedCancel.status, "cancelled");
    const restored = await platform.rsvp(memberA, event.id);
    assert.equal(restored.id, first.id);
    assert.equal(restored.status, "registered");
    assert.equal((await platform.registrations(officer, event.id, pageQuery("registered"))).total, 1);
  });

  it("allows an independent registration close time without an opening time", async () => {
    const event = await platform.createEvent(officer, {
      ...eventInput({ dated: false }),
      registrationClosesAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    });
    assert.equal(event.registrationClosesAt !== null, true);
    assert.equal(event.registrationOpensAt, null);
    assert.equal(event.registrationStatus, "closed");
  });

  it("rejects fresh RSVPs after an event starts but preserves an existing idempotent retry", async () => {
    const event = await platform.createEvent(officer, eventInput({ startsInMinutes: 30 }));
    const first = await platform.rsvp(memberA, event.id);
    const input = eventInput({ startsInMinutes: 30 });
    const changedToStarted = {
      ...input,
      title: event.title,
      startsAt: new Date(Date.now() - 5 * 60_000).toISOString(),
      endsAt: new Date(Date.now() + 55 * 60_000).toISOString(),
    };
    await platform.updateEvent(officer, event.id, changedToStarted, event.version);
    const retry = await platform.rsvp(memberA, event.id);
    assert.equal(retry.id, first.id);
    assert.equal(retry.status, "registered");
    await expectPlatformCode(platform.rsvp(memberB, event.id), "REGISTRATION_CLOSED");
  });

  it("serializes capacity edits against reservations and cancellations against last-seat RSVPs", async () => {
    const editRaceEvent = await platform.createEvent(officer, eventInput({ capacity: 2 }));
    await platform.rsvp(memberA, editRaceEvent.id);
    const narrowed = { ...eventInput({ capacity: 1 }), title: editRaceEvent.title };
    const editRace = await Promise.allSettled([
      platform.updateEvent(officer, editRaceEvent.id, narrowed, editRaceEvent.version),
      platform.rsvp(memberB, editRaceEvent.id),
    ]);
    assert.equal(editRace.filter(result => result.status === "rejected").length, 1);
    const editedEvent = await platform.getEvent(editRaceEvent.id);
    assert.ok(editedEvent.capacity === null || editedEvent.capacity >= editedEvent.registeredCount);

    const cancelRaceEvent = await platform.createEvent(officer, eventInput({ capacity: 1 }));
    await platform.rsvp(memberA, cancelRaceEvent.id);
    const cancelRace = await Promise.allSettled([
      platform.cancelRsvp(memberA, cancelRaceEvent.id),
      platform.rsvp(memberB, cancelRaceEvent.id),
    ]);
    assert.equal(cancelRace[0].status, "fulfilled");
    assert.ok(cancelRace[1].status === "fulfilled" || cancelRace[1].status === "rejected");
    const remaining = await platform.registrations(officer, cancelRaceEvent.id, pageQuery("registered"));
    assert.ok(remaining.total <= 1);
  });

  it("serializes duplicate ticket scans and retains the original check-in record", async () => {
    const event = await platform.createEvent(officer, eventInput({ startsInMinutes: 30 }));
    await platform.rsvp(memberA, event.id);
    const ticket = await platform.issueTicket(memberA, event.id);
    assert.match(ticket.token, /^[A-Za-z0-9_-]{43}$/);
    const stored = await platformPool!.query<{ ticket_token_hash: string; ticket_expires_at: Date }>(
      "SELECT ticket_token_hash, ticket_expires_at FROM registrations WHERE id = $1",
      [ticket.registrationId],
    );
    assert.match(stored.rows[0].ticket_token_hash, /^[0-9a-f]{64}$/);
    assert.notEqual(stored.rows[0].ticket_token_hash, ticket.token);
    assert.equal(stored.rows[0].ticket_expires_at.toISOString(), ticket.expiresAt);

    const scans = await Promise.all([
      platform.checkIn(officer, event.id, { token: ticket.token }),
      platform.checkIn(officer, event.id, { token: ticket.token }),
    ]);
    assert.ok(scans[0].checkedInAt);
    assert.equal(scans[0].checkedInAt, scans[1].checkedInAt);
    const attendance = await platformPool!.query<{ count: string; officer_user_id: string }>(
      `SELECT count(*)::text AS count, min(a.officer_user_id) AS officer_user_id
         FROM attendance a WHERE a.registration_id = $1 GROUP BY a.registration_id`,
      [ticket.registrationId],
    );
    assert.equal(Number(attendance.rows[0].count), 1);
    assert.equal(attendance.rows[0].officer_user_id, officer.userId);
    const audit = await platformPool!.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM officer_audit WHERE action = 'attendance.recorded' AND target_id = $1",
      [ticket.registrationId],
    );
    assert.equal(Number(audit.rows[0].count), 1, "parallel duplicate scans record only the first attendance audit");
  });

  it("enforces private access, registration ownership, unknown times, and cancelled or unknown tickets", async () => {
    await expectPlatformCode(platform.getMe(unverified), "UNVERIFIED");
    await expectPlatformCode(platform.listMembers(memberA, pageQuery()), "FORBIDDEN");

    const event = await platform.createEvent(officer, eventInput());
    await platform.rsvp(memberA, event.id);
    const ownA = await platform.ownRegistrations(memberA, pageQuery());
    const ownB = await platform.ownRegistrations(memberB, pageQuery());
    assert.ok(ownA.items.some(registration => registration.eventId === event.id));
    assert.ok(!ownB.items.some(registration => registration.eventId === event.id));
    await expectPlatformCode(platform.checkIn(officer, event.id, { token: "unknown-ticket-token" }), "INVALID_TICKET");

    const ticket = await platform.issueTicket(memberA, event.id);
    const otherEvent = await platform.createEvent(officer, eventInput());
    await expectPlatformCode(platform.checkIn(officer, otherEvent.id, { token: ticket.token }), "INVALID_TICKET");
    const originalEventCheckIn = await platform.checkIn(officer, event.id, { token: ticket.token });
    assert.ok(originalEventCheckIn.checkedInAt);

    const cancelledTicketEvent = await platform.createEvent(officer, eventInput());
    await platform.rsvp(memberA, cancelledTicketEvent.id);
    const cancelledTicket = await platform.issueTicket(memberA, cancelledTicketEvent.id);
    await platform.cancelRsvp(memberA, cancelledTicketEvent.id);
    await expectPlatformCode(
      platform.checkIn(officer, cancelledTicketEvent.id, { token: cancelledTicket.token }),
      "INVALID_TICKET",
    );

    const expiresSoonEvent = await platform.createEvent(officer, eventInput());
    await platform.rsvp(memberC, expiresSoonEvent.id);
    const expiresSoon = await platform.issueTicket(memberC, expiresSoonEvent.id);
    await platformPool!.query(
      "UPDATE registrations SET ticket_expires_at = clock_timestamp() - interval '1 second' WHERE id = $1",
      [expiresSoon.registrationId],
    );
    await expectPlatformCode(platform.checkIn(officer, expiresSoonEvent.id, { token: expiresSoon.token }), "INVALID_TICKET");

    const farFutureEvent = await platform.createEvent(officer, eventInput({ startsInMinutes: 120 }));
    await platform.rsvp(memberB, farFutureEvent.id);
    const farFutureTicket = await platform.issueTicket(memberB, farFutureEvent.id);
    await expectPlatformCode(
      platform.checkIn(officer, farFutureEvent.id, { token: farFutureTicket.token }),
      "CHECKIN_CLOSED",
    );

    const undated = await platform.createEvent(officer, eventInput({ dated: false }));
    await expectPlatformCode(
      platform.checkIn(officer, undated.id, { registrationId: randomUUID() }),
      "EVENT_TIME_UNCONFIRMED",
    );

    const closed = await platform.createEvent(officer, { ...eventInput(), registrationStatus: "closed" });
    await expectPlatformCode(platform.rsvp(memberB, closed.id), "REGISTRATION_CLOSED");
    const cancelled = await platform.createEvent(officer, {
      ...eventInput(), publicationStatus: "cancelled", registrationStatus: "closed",
    });
    await expectPlatformCode(platform.rsvp(memberB, cancelled.id), "EVENT_UNAVAILABLE");
    const missingId = randomUUID();
    await expectPlatformCode(platform.getEvent(missingId), "NOT_FOUND");
    await expectPlatformCode(platform.rsvp(memberB, missingId), "NOT_FOUND");
  });

  it("reports zero attendance safely and excludes cancelled registrations from attendance rates", async () => {
    const zeroEvent = await platform.createEvent(officer, eventInput());
    const measuredEvent = await platform.createEvent(officer, eventInput({ capacity: 5 }));
    await platform.rsvp(memberA, measuredEvent.id);
    const attended = await platform.rsvp(memberB, measuredEvent.id);
    await platform.rsvp(memberC, measuredEvent.id);
    assert.equal((await platform.cancelRsvp(memberA, measuredEvent.id)).status, "cancelled");
    assert.equal((await platform.cancelRsvp(memberC, measuredEvent.id)).status, "cancelled");
    await platform.checkIn(officer, measuredEvent.id, { registrationId: attended.id });

    const analytics = await platform.analytics(officer);
    const zero = analytics.events.find(event => event.id === zeroEvent.id);
    const measured = analytics.events.find(event => event.id === measuredEvent.id);
    assert.deepEqual(zero && [zero.registered, zero.attended, zero.attendanceRate], [0, 0, 0]);
    assert.deepEqual(measured && [measured.registered, measured.attended, measured.attendanceRate], [1, 1, 100]);
    assert.equal((await platform.getEvent(measuredEvent.id, officer)).attendanceCount, 1);
  });

  it("groups member growth by the chapter month across a UTC month boundary", async () => {
    const userId = `analytics-boundary-${randomUUID()}`;
    const fixture = await platformPool!.query<{
      created_at: Date;
      expected_month: string;
      current_month: string;
    }>(
      `WITH boundary AS (
         SELECT ((date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York') + interval '30 minutes')
                  AT TIME ZONE 'UTC') AS created_at
       )
       SELECT created_at,
              to_char(date_trunc('month', created_at AT TIME ZONE 'America/New_York'), 'YYYY-MM') AS expected_month,
              to_char(date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/New_York'), 'YYYY-MM') AS current_month
         FROM boundary`,
    );
    const { created_at: createdAt, expected_month: expectedMonth, current_month: currentMonth } = fixture.rows[0];
    assert.notEqual(expectedMonth, currentMonth, "00:30 UTC on the first belongs to the prior New York month");

    const before = await platform.analytics(officer);
    const previousBucketBefore = before.growth.find(bucket => bucket.month === expectedMonth)?.count ?? 0;
    const currentBucketBefore = before.growth.find(bucket => bucket.month === currentMonth)?.count ?? 0;
    await platformPool!.query('INSERT INTO "user" (id) VALUES ($1)', [userId]);
    await platformPool!.query(
      `INSERT INTO members (id, user_id, name, email, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $5)`,
      [randomUUID(), userId, `Boundary fixture ${userId}`, `${userId}@example.test`, createdAt],
    );

    const after = await platform.analytics(officer);
    assert.equal(after.growth.find(bucket => bucket.month === expectedMonth)?.count, previousBucketBefore + 1);
    assert.equal(after.growth.find(bucket => bucket.month === currentMonth)?.count, currentBucketBefore);
  });

  it("restricts audit history, bounds its pages, filters by action, and skips no-op audits", async () => {
    await expectPlatformCode(platform.listAudit(memberA, { page: 1, pageSize: 10 }), "FORBIDDEN");
    await expectPlatformCode(platform.listAudit(officer, { page: 1, pageSize: 51 }), "INVALID_INPUT");
    await expectPlatformCode(
      platform.listAudit(officer, { page: 1, pageSize: 10, action: "not-an-action" as never }),
      "INVALID_INPUT",
    );

    const requestId = randomUUID();
    const correlatedEvent = await platform.createEvent({ ...officer, requestId }, eventInput());
    const fallbackEvent = await platform.createEvent(officer, eventInput());
    const correlated = await platformPool!.query<{ request_id: string; details: Record<string, unknown> }>(
      "SELECT request_id, details FROM officer_audit WHERE action = 'event.created' AND target_id = $1",
      [correlatedEvent.id],
    );
    assert.equal(correlated.rows[0].request_id, requestId);
    assert.deepEqual(correlated.rows[0].details, {
      version: 1,
      publicationStatus: correlatedEvent.publicationStatus,
      registrationStatus: correlatedEvent.registrationStatus,
    });
    const fallbackAudit = await platformPool!.query<{ request_id: string }>(
      "SELECT request_id FROM officer_audit WHERE action = 'event.created' AND target_id = $1",
      [fallbackEvent.id],
    );
    assert.match(fallbackAudit.rows[0].request_id, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    const pageOne = await platform.listAudit(officer, { page: 1, pageSize: 1, action: "event.created" });
    const pageTwo = await platform.listAudit(officer, { page: 2, pageSize: 1, action: "event.created" });
    assert.equal(pageOne.items.length, 1);
    assert.equal(pageOne.pageSize, 1);
    assert.ok(pageOne.total >= 2);
    assert.equal(pageTwo.items.length, 1);
    assert.notEqual(pageOne.items[0].id, pageTwo.items[0].id);
    assert.equal(pageOne.items[0].action, "event.created");

    const member = await platformPool!.query<{ id: string }>("SELECT id FROM members WHERE user_id = $1", [memberA.userId]);
    const before = await platform.listAudit(officer, { page: 1, pageSize: 1, action: "member.status_changed" });
    await platform.setMemberStatus(officer, member.rows[0].id, "active");
    const after = await platform.listAudit(officer, { page: 1, pageSize: 1, action: "member.status_changed" });
    assert.equal(after.total, before.total, "setting the existing status is not a status change");
    await platform.setMemberStatus(officer, member.rows[0].id, "suspended");
    const changedStatus = await platformPool!.query<{ details: Record<string, unknown> }>(
      `SELECT details FROM officer_audit
        WHERE action = 'member.status_changed' AND target_id = $1
        ORDER BY created_at DESC, id DESC LIMIT 1`,
      [member.rows[0].id],
    );
    assert.deepEqual(changedStatus.rows[0].details, { previousStatus: "active", status: "suspended" });
    await platform.setMemberStatus(officer, member.rows[0].id, "active");
  });

  it("keeps event text, member details, email addresses, and tickets out of audit metadata", async () => {
    const marker = randomUUID();
    const privateTitle = `private-title-${marker}`;
    const privateDescription = `private-description-${marker}`;
    const privateName = `private-name-${marker}`;
    const privateEmail = `private-${marker}@example.test`;
    const input = {
      ...eventInput(),
      title: privateTitle,
      description: privateDescription,
    };
    const event = await platform.createEvent(officer, input);
    const registration = await platform.rsvp(memberC, event.id);
    const ticket = await platform.issueTicket(memberC, event.id);
    await platformPool!.query(
      "UPDATE members SET name = $1, email = $2 WHERE user_id = $3",
      [privateName, privateEmail, memberC.userId],
    );
    await platform.checkIn(officer, event.id, { token: ticket.token });
    const csv = await platform.exportAttendance(officer, event.id);
    assert.ok(csv.includes(privateName));
    assert.ok(csv.includes(privateEmail));

    const rows = await platformPool!.query(
      `SELECT actor_user_id, action, target_id, request_id, details::text AS details
         FROM officer_audit WHERE target_id IN ($1, $2)`,
      [event.id, registration.id],
    );
    const serializedAudit = JSON.stringify(rows.rows);
    for (const privateValue of [privateTitle, privateDescription, privateName, privateEmail, ticket.token]) {
      assert.ok(!serializedAudit.includes(privateValue), `audit must not contain ${privateValue}`);
    }
    assert.deepEqual(new Set(rows.rows.map(row => row.action)), new Set([
      "event.created", "attendance.recorded", "attendance.exported",
    ]));
  });

  it("rolls an event edit back when its audit insert fails", async () => {
    const input = eventInput();
    const event = await platform.createEvent(officer, input);
    await platformPool!.query(`
      CREATE FUNCTION reject_event_update_audit() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.action = 'event.updated' THEN
          RAISE EXCEPTION 'synthetic audit failure' USING ERRCODE = 'P0001';
        END IF;
        RETURN NEW;
      END $$;
    `);
    await platformPool!.query(`
      CREATE TRIGGER reject_event_update_audit_trigger
      BEFORE INSERT ON officer_audit FOR EACH ROW EXECUTE FUNCTION reject_event_update_audit()
    `);
    try {
      await assert.rejects(platform.updateEvent(
        officer,
        event.id,
        { ...input, title: `${input.title} should roll back` },
        event.version,
      ));
      const afterFailure = await platform.getEvent(event.id, officer);
      assert.equal(afterFailure.title, event.title);
      assert.equal(afterFailure.version, event.version);
      const audits = await platformPool!.query<{ count: string }>(
        "SELECT count(*)::text AS count FROM officer_audit WHERE action = 'event.updated' AND target_id = $1",
        [event.id],
      );
      assert.equal(Number(audits.rows[0].count), 0);
    } finally {
      await platformPool!.query("DROP TRIGGER IF EXISTS reject_event_update_audit_trigger ON officer_audit");
      await platformPool!.query("DROP FUNCTION IF EXISTS reject_event_update_audit()");
    }
  });

  it("exports quoted CSV and neutralizes formula-leading member data", async () => {
    const event = await platform.createEvent(officer, eventInput());
    await platform.rsvp(memberC, event.id);
    await platformPool!.query(
      "UPDATE members SET name = $1 WHERE user_id = $2",
      [" \t=2+2, Test", memberC.userId],
    );
    const csv = await platform.exportAttendance(officer, event.id);
    assert.ok(csv.startsWith('"registration_id","event_id","event_title"'));
    assert.ok(csv.includes("\"' \t=2+2, Test\""));
    assert.doesNotMatch(csv, /ticket_token_hash|ticket_expires_at|token/i);
  });

  it("shows drafts only to officers and rolls back a failed RSVP transaction", async () => {
    const draft = await platform.createEvent(officer, {
      ...eventInput(), publicationStatus: "draft", registrationStatus: "closed",
    });
    const publicEvents = await platform.listEvents(pageQuery());
    assert.ok(!publicEvents.items.some(event => event.id === draft.id));
    const officerEvents = await platform.listEvents(pageQuery(), officer);
    assert.ok(officerEvents.items.some(event => event.id === draft.id));
    await expectPlatformCode(platform.getEvent(draft.id), "NOT_FOUND");
    const officerDraft = await platform.getEvent(draft.id, officer);
    assert.equal(officerDraft.version, draft.version);
    assert.equal(officerDraft.attendanceCount, 0);
    await expectPlatformCode(platform.getEvent(draft.id, memberA), "FORBIDDEN");
    await expectPlatformCode(platform.getEvent(draft.id, unverified), "UNVERIFIED");

    const rollbackEvent = await platform.createEvent(officer, eventInput());
    await platformPool!.query(`
      CREATE FUNCTION reject_test_registration() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.status = 'registered' THEN
          RAISE EXCEPTION 'synthetic registration failure' USING ERRCODE = 'P0001';
        END IF;
        RETURN NEW;
      END $$;
    `);
    await platformPool!.query(`
      CREATE TRIGGER reject_test_registration_trigger
      BEFORE INSERT ON registrations FOR EACH ROW EXECUTE FUNCTION reject_test_registration()
    `);
    await assert.rejects(platform.rsvp(memberB, rollbackEvent.id));
    const registrations = await platformPool!.query<{ count: string }>(
      "SELECT count(*)::text AS count FROM registrations WHERE event_id = $1",
      [rollbackEvent.id],
    );
    assert.equal(Number(registrations.rows[0].count), 0);
  });
});
