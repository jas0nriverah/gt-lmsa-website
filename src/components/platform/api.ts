type ApiSuccess<T> = { data: T };

export class PlatformRequestError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly status: number;

  constructor(message: string, code: string, requestId: string, status: number) {
    super(message);
    this.name = "PlatformRequestError";
    this.code = code;
    this.requestId = requestId;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function responseError(response: Response): Promise<PlatformRequestError> {
  let payload: unknown;
  try {
    payload = await response.clone().json();
  } catch {
    payload = null;
  }

  const error = isRecord(payload) && isRecord(payload.error) ? payload.error : null;
  if (response.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event("platform:unauthorized"));
  }
  return new PlatformRequestError(
    typeof error?.message === "string" ? error.message : `The request failed (${response.status}).`,
    typeof error?.code === "string" ? error.code : "request_failed",
    typeof error?.requestId === "string" ? error.requestId : "unavailable",
    response.status,
  );
}

export async function platformRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const bodylessMutation = ["POST", "PATCH", "DELETE"].includes(method) && init.body === undefined;
  const requestBody = bodylessMutation ? "{}" : init.body;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (requestBody !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    method,
    body: requestBody,
    headers,
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) throw await responseError(response);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PlatformRequestError(
      "The server returned an unreadable response.",
      "invalid_response",
      "unavailable",
      response.status,
    );
  }

  if (!isRecord(payload) || !Object.hasOwn(payload, "data")) {
    throw new PlatformRequestError(
      "The server response did not match the platform API contract.",
      "invalid_response",
      "unavailable",
      response.status,
    );
  }

  return (payload as ApiSuccess<T>).data;
}

export function errorMessage(error: unknown): string {
  if (error instanceof PlatformRequestError) {
    return `${error.message} (request ${error.requestId})`;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
