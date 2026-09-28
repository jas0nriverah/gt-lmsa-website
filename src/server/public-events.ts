import type { PlatformEvent } from "../lib/platform-contracts";
import { createPlatform } from "./platform";
import { getPool } from "./db";

const PUBLIC_CALENDAR_EVENT_LIMIT = 50;

export type PublicEventsResult = {
  events: PlatformEvent[];
  availability: "ready" | "unconfigured" | "unavailable";
};

export async function getPublicChapterEvents(): Promise<PublicEventsResult> {
  if (!process.env.DATABASE_URL) {
    return { events: [], availability: "unconfigured" };
  }

  try {
    const page = await createPlatform(getPool()).listEvents({
      page: 1,
      pageSize: PUBLIC_CALENDAR_EVENT_LIMIT,
      view: "upcoming",
    });
    return { events: page.items, availability: "ready" };
  } catch {
    // Public pages show a neutral availability notice; database details stay server-side.
    return { events: [], availability: "unavailable" };
  }
}
