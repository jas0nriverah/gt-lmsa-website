import Link from "next/link";
import { notFound } from "next/navigation";
import { EventRsvp } from "@/components/EventRsvp";
import { SitePage } from "@/components/SitePage";
import type { PlatformEvent } from "@/lib/platform-contracts";
import { engageRsvpUrlForEvent } from "@/lib/engage-events";
import { formatEventTime, registrationState } from "@/lib/platform-dates";
import { PlatformError } from "@/server/errors";
import { getPool } from "@/server/db";
import { createPlatform } from "@/server/platform";
import { uuid } from "@/server/validation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chapter event" };

export default async function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    uuid(id);
  } catch {
    notFound();
  }

  let event: PlatformEvent;
  try {
    event = await createPlatform(getPool()).getEvent(id);
  } catch (error) {
    if (error instanceof PlatformError && error.status === 404) notFound();
    throw error;
  }

  const state = registrationState(event);
  const engageRsvpUrl =
    event.publicationStatus === "published"
      ? engageRsvpUrlForEvent(event)
      : undefined;

  return (
    <SitePage>
      <section className="section-shell bg-white">
        <div className="mx-auto max-w-6xl">
          <Link href="/events" className="text-link font-bold">← All events</Link>
          <p className="eyebrow mt-8">{event.category} · Chapter event</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold text-gt-navy sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-6 text-xl font-semibold">{formatEventTime(event)}</p>
          <p className="mt-2 text-slate-600">
            {event.location || "Location to be confirmed"}
          </p>

          {event.publicationStatus === "cancelled" ? (
            <p className="mt-4 font-bold text-red-800">This event has been cancelled.</p>
          ) : null}

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
            <p className="whitespace-pre-line leading-8 text-slate-700">
              {event.description}
            </p>
            {engageRsvpUrl ? (
              <aside className="card p-7">
                <h2 className="text-2xl font-bold text-gt-navy">RSVP on Georgia Tech Engage</h2>
                <p className="mt-3 leading-7 text-slate-600">
                  Use Georgia Tech Engage for your official registration. The chapter website’s RSVP form is disabled for this event.
                </p>
                <a
                  className="button button-primary mt-5"
                  href={engageRsvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Continue to Engage <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </aside>
            ) : (
              <EventRsvp key={id} event={event} initialState={state} />
            )}
          </div>
        </div>
      </section>
    </SitePage>
  );
}
