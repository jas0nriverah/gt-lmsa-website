import assert from "node:assert/strict";
import test from "node:test";
import { PlatformRequestError, platformRequest } from "../src/components/platform/api";

test("bodyless POST, PATCH, and DELETE requests send JSON {} and unwrap data", async () => {
  const originalFetch = globalThis.fetch;
  const calls: { input: RequestInfo | URL; init?: RequestInit }[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ input, init });
    return new Response(JSON.stringify({ data: { saved: true } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    for (const method of ["POST", "PATCH", "DELETE"] as const) {
      const result = await platformRequest<{ saved: boolean }>("/api/platform/events/example/rsvp", { method });
      assert.deepEqual(result, { saved: true });
    }
    assert.equal(calls.length, 3);
    for (const { init } of calls) {
      assert.equal(init?.body, "{}");
      assert.equal(new Headers(init?.headers).get("content-type"), "application/json");
      assert.equal(init?.credentials, "same-origin");
      assert.equal(init?.cache, "no-store");
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("API error envelopes preserve code, message, request ID, and status", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({
    error: { code: "EVENT_FULL", message: "This event has reached capacity.", requestId: "req-test-123" },
  }), {
    status: 409,
    headers: { "Content-Type": "application/json" },
  })) as typeof fetch;

  try {
    await assert.rejects(
      () => platformRequest("/api/platform/events/example/rsvp", { method: "POST" }),
      (error: unknown) => {
        assert.ok(error instanceof PlatformRequestError);
        assert.equal(error.code, "EVENT_FULL");
        assert.equal(error.message, "This event has reached capacity.");
        assert.equal(error.requestId, "req-test-123");
        assert.equal(error.status, 409);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("success responses without a data envelope are rejected", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })) as typeof fetch;

  try {
    await assert.rejects(
      () => platformRequest("/api/platform/me"),
      (error: unknown) => error instanceof PlatformRequestError && error.code === "invalid_response",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
