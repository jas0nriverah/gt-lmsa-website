import test from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { serializeSignedCookie } from "better-call";
import { getMigrations } from "better-auth/db/migration";
import { Pool } from "pg";
import { validateTestDatabaseUrl } from "../scripts/test-database";

test("real sessions, HTTP authorization, ownership, CSRF, validation and fail-closed behavior", { skip: !process.env.TEST_DATABASE_URL }, async () => {
  const connectionString = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
  process.env.DATABASE_URL = connectionString;
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  process.env.BETTER_AUTH_SECRET = randomBytes(48).toString("base64url");
  process.env.GOOGLE_CLIENT_ID = "synthetic-test-client";
  process.env.GOOGLE_CLIENT_SECRET = "synthetic-test-secret";
  process.env.MEMBERSHIP_APPROVAL_ENABLED = "true";
  const pool = new Pool({ connectionString });
  const { getPool } = await import("../src/server/db");
  const { getAuth } = await import("../src/server/auth");
  const routes = await import("../src/app/api/platform/[...path]/route");
  const authRoutes = await import("../src/app/api/auth/[...all]/route");
  const userIds: string[] = [];
  let eventId: string | undefined;
  async function identity(verified = true, expired = false) {
    const id = randomUUID(), token = randomBytes(32).toString("hex"); userIds.push(id);
    await pool.query('INSERT INTO "user" (id,name,email,"emailVerified","createdAt","updatedAt") VALUES($1,$2,$3,$4,now(),now())', [id,"Synthetic HTTP member",`${id}@example.test`,verified]);
    await pool.query('INSERT INTO "session" (id,token,"userId","expiresAt","createdAt","updatedAt") VALUES($1,$2,$3,$4,now(),now())', [randomUUID(),token,id,new Date(Date.now()+(expired ? -60000 : 3600000))]);
    const cookie = (await serializeSignedCookie("better-auth.session_token", token, process.env.BETTER_AUTH_SECRET!, { httpOnly:true, path:"/", sameSite:"lax" })).split(";")[0];
    return { id, cookie };
  }
  async function request(path: string, method: "GET"|"POST"|"PATCH"|"DELETE" = "GET", cookie = "", payload?: unknown, origin = process.env.BETTER_AUTH_URL!) {
    const headers = new Headers({ origin, cookie });
    if (payload !== undefined) headers.set("Content-Type", "application/json");
    return routes[method](new Request(`${process.env.BETTER_AUTH_URL}/api/platform/${path}`, { method, headers, body: payload === undefined ? undefined : JSON.stringify(payload) }), { params: Promise.resolve({ path: path.split("?")[0].split("/") }) });
  }
  async function data(response: Response, expected = 200) { assert.equal(response.status, expected, await response.clone().text()); assert.match(response.headers.get("cache-control")!, /no-store/); return (await response.json()).data; }
  try {
    const migration = await getMigrations(getAuth().options);
    assert.deepEqual(migration.toBeCreated, [], "Auth tables are complete");
    assert.deepEqual(migration.toBeAdded, [], "Auth columns are complete");
    assert.deepEqual(migration.schemaProblems, [], "Auth schema is compatible");
    const member = await identity(), other = await identity(), officer = await identity(), unverified = await identity(false), expired = await identity(true,true);
    await pool.query("INSERT INTO officers(user_id) VALUES($1)", [officer.id]);
    assert.equal((await request("me")).status,401);
    assert.equal((await request("me","GET",unverified.cookie)).status,401);
    assert.equal((await request("me","GET",expired.cookie)).status,401);
    assert.equal((await request("me","GET",member.cookie+"tampered")).status,401);
    const input = {name:"Synthetic member",academicYear:"First year",major:"Biology",interests:["Mentorship"]};
    assert.equal((await request("me","POST",member.cookie,input,"https://attacker.example")).status,403);
    assert.equal((await request("me","POST",member.cookie,{...input,status:"active",email:"spoof@example.test"})).status,400);
    const profile = await data(await request("me","POST",member.cookie,input));
    assert.equal(profile.status,"pending"); assert.equal(profile.email,`${member.id}@example.test`);
    const duplicate = await data(await request("me","POST",member.cookie,input)); assert.equal(duplicate.id,profile.id);
    assert.equal((await request("officer/members","GET",member.cookie)).status,403);
    assert.equal((await request("officer/analytics","GET",member.cookie)).status,403);
    assert.equal((await request(`officer/members/${profile.id}/status`,"PATCH",member.cookie,{status:"active"})).status,403);
    await data(await request(`officer/members/${profile.id}/status`,"PATCH",officer.cookie,{status:"active"}));
    const eventInput = {title:"Synthetic HTTP event",description:"Local test only",location:"Test venue",category:"Testing",timingLabel:"",startsAt:new Date(Date.now()+30*60000).toISOString(),endsAt:new Date(Date.now()+90*60000).toISOString(),registrationOpensAt:null,registrationClosesAt:null,publicationStatus:"published",registrationStatus:"open",capacity:1};
    const event = await data(await request("officer/events","POST",officer.cookie,eventInput),201); eventId=event.id;
    const registration = await data(await request(`events/${eventId}/rsvp`,"POST",member.cookie,{}));
    assert.equal((await data(await request(`events/${eventId}/rsvp`,"POST",member.cookie,{}))).id,registration.id);
    assert.equal((await request(`events/${eventId}/rsvp`,"POST",other.cookie,{memberId:profile.id})).status,400);
    assert.equal((await request(`events/${eventId}/ticket`,"POST",other.cookie,{})).status,403);
    assert.equal((await data(await request("me/registrations","GET",other.cookie))).total,0);
    const ticket = await data(await request(`events/${eventId}/ticket`,"POST",member.cookie,{}));
    const publicEvent = await data(await request(`events/${eventId}`));
    assert.deepEqual(Object.keys(publicEvent).sort(), [
      "id", "title", "description", "location", "category", "timingLabel", "startsAt", "endsAt",
      "publicationStatus", "registrationStatus", "registrationOpensAt", "registrationClosesAt",
      "capacity", "registeredCount", "version",
    ].sort(), "Anonymous event responses expose only the public event contract");
    const publicPage = await data(await request(`events?q=${encodeURIComponent(eventInput.title)}`));
    assert.ok(publicPage.items.some((item: { id: string }) => item.id === eventId));
    const publicText = JSON.stringify(publicPage);
    for (const privateValue of [profile.name, profile.email, profile.id, member.id, registration.id, ticket.token]) {
      assert.ok(!publicText.includes(privateValue), "Public listings must not contain attendee identity or tickets");
    }
    assert.equal((await request(`officer/events/${eventId}/registrations`)).status, 401);
    assert.equal((await request("officer/audit", "GET", member.cookie)).status, 403);
    assert.equal((await request("officer/audit")).status, 401);
    const updateResponse = await request(`officer/events/${eventId}`, "PATCH", officer.cookie, { ...eventInput, location: "Updated synthetic venue", expectedVersion: event.version });
    const updated = await data(updateResponse);
    assert.equal(updated.version, event.version + 1);
    const stale = await request(`officer/events/${eventId}`, "PATCH", officer.cookie, { ...eventInput, expectedVersion: event.version });
    assert.equal(stale.status, 409);
    assert.equal((await stale.json()).error.code, "STALE_EVENT");
    assert.equal((await request(`officer/events/${eventId}`, "PATCH", officer.cookie, eventInput)).status, 400);
    assert.equal((await request("officer/audit?action=unknown", "GET", officer.cookie)).status, 400);
    const audit = await data(await request("officer/audit?action=event.updated", "GET", officer.cookie));
    const change = audit.items.find((entry: { targetId: string }) => entry.targetId === eventId);
    assert.ok(change);
    assert.equal(change.requestId, updateResponse.headers.get("x-request-id"), "Audit correlation comes from the server-generated request ID");
    assert.equal(change.actorUserId, officer.id);
    const auditText = JSON.stringify(audit);
    for (const privateValue of [profile.name, profile.email, ticket.token, eventInput.description, eventInput.title]) {
      assert.ok(!auditText.includes(privateValue), "Audit records must omit free-text PII and ticket material");
    }
    assert.equal((await request(`officer/events/${eventId}/check-in`,"POST",member.cookie,{token:ticket.token})).status,403);
    const checkin = await data(await request(`officer/events/${eventId}/check-in`,"POST",officer.cookie,{token:ticket.token})); assert.ok(checkin.checkedInAt);
    const repeated = await data(await request(`officer/events/${eventId}/check-in`,"POST",officer.cookie,{registrationId:registration.id})); assert.equal(repeated.checkedInAt,checkin.checkedInAt);
    assert.equal((await request(`officer/events/${eventId}/export`,"GET",member.cookie)).status,403);
    const csv = await request(`officer/events/${eventId}/export`,"GET",officer.cookie); assert.equal(csv.status,200); assert.ok(!(await csv.text()).includes(ticket.token));
    const invalid = await request("me","PATCH",member.cookie,{...input,name:"x".repeat(17000)}); assert.equal(invalid.status,413);
    assert.equal((await request("events?pageSize=999")).status,400);
    const memberBucket = createHash("sha256").update(`member:${member.id}`).digest("hex");
    await pool.query("UPDATE app_rate_limits SET count=180, expires_at=now()+interval '1 minute' WHERE bucket_key=$1", [memberBucket]);
    const throttled = await request("me", "GET", member.cookie);
    assert.equal(throttled.status, 429);
    assert.equal(throttled.headers.get("retry-after"), "60");
    const throttleError = (await throttled.json()).error;
    assert.equal(throttleError.code, "RATE_LIMITED");
    assert.equal(throttled.headers.get("x-request-id"), throttleError.requestId);
    await pool.query("UPDATE app_rate_limits SET expires_at=now()-interval '1 second' WHERE bucket_key=$1", [memberBucket]);
    await data(await request("me", "GET", member.cookie));
    const resetBucket = await pool.query("SELECT count FROM app_rate_limits WHERE bucket_key=$1", [memberBucket]);
    assert.equal(resetBucket.rows[0].count, 1, "Expired buckets reset instead of permanently blocking members");
    await pool.query("DELETE FROM officers WHERE user_id=$1",[officer.id]);
    assert.equal((await request("officer/analytics","GET",officer.cookie)).status,403,"Permission revocation applies to an existing session");
    const signout = await authRoutes.POST(new Request("http://localhost:3000/api/auth/sign-out",{method:"POST",headers:{cookie:member.cookie,origin:"http://localhost:3000","content-type":"application/json"},body:"{}"}));
    assert.equal(signout.status,200); assert.equal((await request("me","GET",member.cookie)).status,401);
    delete process.env.GOOGLE_CLIENT_ID;
    const offline = await request("me","GET",other.cookie); assert.equal(offline.status,503); assert.ok(!(await offline.text()).includes(connectionString));
  } finally {
    await pool.query("DELETE FROM officer_audit WHERE actor_user_id=ANY($1::text[])", [userIds]);
    if (eventId) await pool.query("DELETE FROM events WHERE id=$1",[eventId]);
    const buckets = userIds.map(id => createHash("sha256").update(`member:${id}`).digest("hex"));
    await pool.query("DELETE FROM app_rate_limits WHERE bucket_key=ANY($1::text[])", [buckets]);
    await pool.query('DELETE FROM "user" WHERE id = ANY($1::text[])',[userIds]);
    await pool.end(); await getPool().end();
  }
});
