import { randomUUID, createHash } from "node:crypto";
import { PlatformError } from "./errors";
import { getPool } from "./db";

export const privateHeaders = { "Cache-Control": "no-store, private", "Vary": "Cookie", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };
export function json(data: unknown, status = 200) { return Response.json({ data }, { status, headers: privateHeaders }); }
export function errorResponse(error: unknown, requestId: string) {
  const known = error instanceof PlatformError;
  const status = known ? error.status : 503;
  const response = Response.json({ error: { code: known ? error.code : "SERVICE_UNAVAILABLE", message: known ? error.message : "The service is temporarily unavailable. Please try again.", requestId } }, { status, headers: privateHeaders });
  if (status === 429) response.headers.set("Retry-After", "60");
  return response;
}
export function verifyOrigin(request: Request) {
  const expected = process.env.BETTER_AUTH_URL;
  if (!expected || request.headers.get("origin") !== new URL(expected).origin) throw new PlatformError("INVALID_ORIGIN", "Please submit this action from the chapter website.", 403);
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new PlatformError("INVALID_ORIGIN", "Cross-site requests are not allowed.", 403);
}
export async function body(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new PlatformError("CONTENT_TYPE", "Send JSON content.", 415);
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > 16384) throw new PlatformError("TOO_LARGE", "Request is too large.", 413);
  if (!request.body) throw new PlatformError("INVALID_JSON", "Request body is required.");
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength;
    if (bytes > 16384) { await reader.cancel(); throw new PlatformError("TOO_LARGE", "Request is too large.", 413); } chunks.push(value); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new PlatformError("INVALID_JSON", "Request is not valid JSON."); }
}
export async function rateLimit(key: string, max = 120) {
  const bucket = createHash("sha256").update(key).digest("hex");
  const result = await getPool().query<{ count: number }>(`INSERT INTO app_rate_limits(bucket_key,count,expires_at) VALUES($1,1,now()+interval '1 minute')
    ON CONFLICT(bucket_key) DO UPDATE SET count=CASE WHEN app_rate_limits.expires_at <= now() THEN 1 ELSE app_rate_limits.count+1 END,
    expires_at=CASE WHEN app_rate_limits.expires_at <= now() THEN now()+interval '1 minute' ELSE app_rate_limits.expires_at END RETURNING count`, [bucket]);
  if (result.rows[0].count > max) throw new PlatformError("RATE_LIMITED", "Too many requests. Please wait a minute and try again.", 429);
}
export async function handle(action: string, fn: (requestId: string) => Promise<Response>): Promise<Response> {
  const requestId = randomUUID(), start = Date.now(); let response: Response;
  try { response = await fn(requestId); } catch (error) { response = errorResponse(error, requestId); }
  response.headers.set("X-Request-ID", requestId);
  console.info(JSON.stringify({ requestId, action, result: response.status, latencyMs: Date.now()-start }));
  return response;
}
