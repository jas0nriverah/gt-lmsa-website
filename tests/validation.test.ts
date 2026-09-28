import test from "node:test";
import assert from "node:assert/strict";
import { auditQuery, eventUpdateInput, memberInput, eventInput, listQuery, checkInInput, normalizeEmail, requireVerified } from "../src/server/validation";
import { body, errorResponse, handle, verifyOrigin } from "../src/server/http";
import { createPlatform } from "../src/server/platform";
import { PlatformError } from "../src/server/errors";
import { Pool } from "pg";
import { formatEventTime } from "../src/lib/platform-dates";
const profile = { name:" Student ",academicYear:"First year",major:"Biology",interests:["Mentorship"] };
test("profile allowlists reject role/email/identity escalation and normalize email consistently", () => {
  assert.equal(normalizeEmail(" Student@Example.COM "), "student@example.com");
  assert.equal(memberInput(profile).name,"Student");
  for(const field of ["role","status","userId","email"]) assert.throws(()=>memberInput({...profile,[field]:"officer"}));
  assert.throws(()=>memberInput({...profile,name:"  "}));
  assert.throws(()=>memberInput({...profile,interests:["unrecognized"]}));
  assert.throws(()=>requireVerified({userId:"x",email:"a@example.com",emailVerified:false}));
});
const event = { title:"Synthetic event", description:"Testing", location:"", category:"Community", timingLabel:"", startsAt:"2026-10-15T18:00:00-04:00",endsAt:"2026-10-15T19:00:00-04:00",publicationStatus:"published",registrationStatus:"open",registrationOpensAt:null,registrationClosesAt:null,capacity:1 };
test("event input requires explicit instants and a coherent registration schedule",()=>{
  assert.equal(eventInput(event).startsAt,"2026-10-15T22:00:00.000Z");
  assert.equal(eventInput({...event,startsAt:"2026-10-15T18:00-04:00",endsAt:"2026-10-15T19:00-04:00"}).startsAt,"2026-10-15T22:00:00.000Z");
  assert.throws(()=>eventInput({...event,startsAt:"2026-10-15T18:00"}));
  assert.throws(()=>eventInput({...event,startsAt:"2026-02-30T18:00:00Z"}));
  assert.throws(()=>eventInput({...event,startsAt:"2026-10-15T24:00:00Z"}));
  assert.throws(()=>eventInput({...event,startsAt:null,endsAt:null}));
  assert.throws(()=>eventInput({...event,capacity:0}));
  assert.throws(()=>eventInput({...event,endsAt:event.startsAt}));
  assert.equal(eventInput({...event,startsAt:null,endsAt:null,registrationStatus:"closed"}).startsAt,null);
});
test("pagination/check-in inputs are bounded and unambiguous",()=>{
  assert.equal(listQuery(new URLSearchParams()).pageSize,20);
  for(const q of ["page=0","pageSize=999","page=1.2","view=secret"]) assert.throws(()=>listQuery(new URLSearchParams(q)));
  assert.throws(()=>checkInInput({token:"test",registrationId:"test"}));
  assert.throws(()=>checkInInput({}));
  assert.throws(()=>checkInInput({registrationId:"not-a-uuid"}));
});
test("event edits require a positive version and audit filters reject unsupported input", () => {
  assert.equal(eventUpdateInput({ ...event, expectedVersion: 1 }).expectedVersion, 1);
  for (const expectedVersion of [undefined, null, 0, -1, 1.5, "1", Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => eventUpdateInput({ ...event, expectedVersion }));
  }
  assert.throws(() => eventUpdateInput({ ...event, expectedVersion: 1, actorUserId: "spoof" }));
  assert.equal(auditQuery(new URLSearchParams("action=event.updated")).action, "event.updated");
  for (const params of ["action=unknown", "pageSize=999", "actorUserId=spoof", "q=private"]) {
    assert.throws(() => auditQuery(new URLSearchParams(params)));
  }
});
test("CSRF origin rejection, bounded JSON, and safe error responses",async()=>{
  const previous=process.env.BETTER_AUTH_URL;process.env.BETTER_AUTH_URL="http://localhost:3000";
  try {
    assert.throws(()=>verifyOrigin(new Request("http://localhost:3000",{headers:{origin:"https://other.example"}})));
    verifyOrigin(new Request("http://localhost:3000",{headers:{origin:"http://localhost:3000"}}));
    await assert.rejects(()=>body(new Request("http://localhost:3000",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:"a".repeat(17000)})})));
    await assert.rejects(()=>body(new Request("http://localhost:3000",{method:"POST",headers:{"Content-Type":"application/json"},body:"invalid"})));
    const error=errorResponse(new Error("secret-email@example.com database password"),"test-request");
    assert.equal(error.status,503);assert.ok(!JSON.stringify(await error.json()).includes("secret-email"));
    assert.match(error.headers.get("cache-control")!, /no-store/);
  } finally { if(previous===undefined)delete process.env.BETTER_AUTH_URL;else process.env.BETTER_AUTH_URL=previous; }
});
test("HTTP request logging contains metadata only",async()=>{
  const originalInfo=console.info;
  let logged="";
  console.info=(message?: unknown)=>{logged=String(message);};
  try {
    const response=await handle("platform_get",async()=>new Response(null,{status:200}));
    assert.equal(response.status,200);
    const entry=JSON.parse(logged);
    assert.deepEqual(Object.keys(entry).sort(),["action","latencyMs","requestId","result"].sort());
    assert.equal(entry.action,"platform_get");
    assert.equal(entry.result,200);
  } finally { console.info=originalInfo; }
});
test("database connection failures become a service-unavailable error",async()=>{
  const pool=new Pool({host:"127.0.0.1",port:1,user:"unreachable",database:"unreachable",connectionTimeoutMillis:500,max:1});
  try {
    await assert.rejects(
      createPlatform(pool).listEvents({page:1,pageSize:20}),
      error=>error instanceof PlatformError && error.status===503,
    );
  } finally { await pool.end(); }
});
test("event display uses Atlanta rather than the server or viewer timezone",()=>{
  assert.match(formatEventTime({startsAt:"2026-10-16T00:30:00Z",endsAt:null,timingLabel:""}),/Oct 15/);
  assert.match(formatEventTime({startsAt:"2026-12-01T00:30:00Z",endsAt:null,timingLabel:""}),/Nov 30/);
  assert.equal(formatEventTime({startsAt:null,endsAt:null,timingLabel:"Second or third week of October"}),"Second or third week of October");
});
