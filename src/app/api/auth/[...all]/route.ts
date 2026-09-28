import { getAuth } from "@/server/auth";
import { body, handle, privateHeaders, verifyOrigin } from "@/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function dispatch(request: Request) {
  return handle("authentication", async () => {
    if (request.method === "POST") {
      verifyOrigin(request);
      await body(request.clone());
    }
    const response = await getAuth().handler(request);
    for (const [key, value] of Object.entries(privateHeaders)) response.headers.set(key, value);
    return response;
  });
}
export const GET = dispatch;
export const POST = dispatch;
