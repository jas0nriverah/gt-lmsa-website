import { requireActor } from "@/server/auth";
import { getPool } from "@/server/db";
import { PlatformError } from "@/server/errors";
import { body, handle, json, privateHeaders, rateLimit, verifyOrigin } from "@/server/http";
import { createPlatform } from "@/server/platform";
import { engageRsvpUrlForEvent } from "@/lib/engage-events";
import { auditQuery, checkInInput, eventInput, eventUpdateInput, listQuery, memberInput, membershipStatus, object, uuid } from "@/server/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function dispatch(request: Request, context: Context) {
  // No URL or payload in logs: opaque ticket codes and member identities stay private.
  return handle(`platform_${request.method.toLowerCase()}`, async (requestId) => {
    const { path } = await context.params;
    const method = request.method, service = createPlatform(getPool());
    const query = () => listQuery(new URL(request.url).searchParams);
    if (method !== "GET") verifyOrigin(request);
    if (method === "GET" && path[0] === "events") {
      // Only trust Vercel's overwritten network header on Vercel, not arbitrary client IP headers.
      const network = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ?? "anonymous" : "anonymous";
      await rateLimit(`public:${network}`, 240);
      if (path.length === 1) return json(await service.listEvents(query()));
      if (path.length === 2) return json(await service.getEvent(uuid(path[1])));
    }
    const actor = { ...await requireActor(request.headers), requestId };
    await rateLimit(`member:${actor.userId}`, method === "GET" ? 180 : 60);
    if (path[0] === "me") {
      if (path.length === 1 && method === "GET") return json(await service.getMe(actor));
      if (path.length === 1 && (method === "POST" || method === "PATCH")) return json(await service.saveMember(actor, memberInput(await body(request))));
      if (path.length === 2 && path[1] === "registrations" && method === "GET") return json(await service.ownRegistrations(actor, query()));
    }
    if (path[0] === "events" && path.length === 3) {
      const id = uuid(path[1]);
      // Identity and ownership come exclusively from the verified session.
      if (request.body) object(await body(request), []);
      if (path[2] === "rsvp" && method === "POST") {
        const event = await service.getEvent(id);
        if (engageRsvpUrlForEvent(event)) {
          throw new PlatformError(
            "EXTERNAL_REGISTRATION",
            "This event's RSVP is handled by Georgia Tech Engage.",
            409,
          );
        }
        return json(await service.rsvp(actor, id));
      }
      if (path[2] === "rsvp" && method === "DELETE") return json(await service.cancelRsvp(actor, id));
      if (path[2] === "ticket" && method === "POST") return json(await service.issueTicket(actor, id));
    }
    if (path[0] === "officer") {
      if (path[1] === "audit" && path.length === 2 && method === "GET") return json(await service.listAudit(actor, auditQuery(new URL(request.url).searchParams)));
      if (path[1] === "members" && path.length === 2 && method === "GET") return json(await service.listMembers(actor, query()));
      if (path[1] === "members" && path.length === 4 && path[3] === "status" && method === "PATCH") return json(await service.setMemberStatus(actor, uuid(path[2]), membershipStatus(await body(request))));
      if (path[1] === "analytics" && path.length === 2 && method === "GET") return json(await service.analytics(actor));
      if (path[1] === "events") {
        if (path.length === 2 && method === "GET") return json(await service.listEvents(query(), actor));
        if (path.length === 2 && method === "POST") return json(await service.createEvent(actor, eventInput(await body(request))), 201);
        const id = uuid(path[2] ?? "");
        if (path.length === 3 && method === "GET") return json(await service.getEvent(id, actor));
        if (path.length === 3 && method === "PATCH") {
          const { expectedVersion, ...input } = eventUpdateInput(await body(request));
          return json(await service.updateEvent(actor, id, input, expectedVersion));
        }
        if (path.length === 4 && path[3] === "registrations" && method === "GET") return json(await service.registrations(actor, id, query()));
        if (path.length === 4 && path[3] === "check-in" && method === "POST") return json(await service.checkIn(actor, id, checkInInput(await body(request))));
        if (path.length === 4 && path[3] === "export" && method === "GET") return new Response(await service.exportAttendance(actor, id), { headers: { ...privateHeaders, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="attendance-${id}.csv"` } });
      }
    }
    throw new PlatformError("NOT_FOUND", "This action is not available.", 404);
  });
}
export const GET = dispatch;
export const POST = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;
