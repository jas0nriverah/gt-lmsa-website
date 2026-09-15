import type { Metadata } from "next";
import { EventCard } from "@/components/Cards";
import { ExternalEventCard } from "@/components/ExternalEventCard";
import { EmptyState } from "@/components/EmptyState";
import { EventCalendar } from "@/components/EventCalendar";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { campusCalendarDates } from "@/lib/site-data";
import { events } from "@/lib/stale-status-sep-14";
import { chapterToday, eventsAsOf } from "@/lib/event-dates";
import {
  EXTERNAL_EVENTS_CHECKED_AT,
  getVerifiedExternalEvents,
} from "@/lib/external-events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "See confirmed LMSA Plus at Georgia Tech events on the calendar, plus planned launch activities still under development.",
};

export const dynamic = "force-dynamic";

export default function EventsPage() {
  const today = chapterToday();
  const currentEvents = eventsAsOf(events, today);
  const confirmedEvents = currentEvents.filter((event) => event.status === "confirmed");
  const plannedEvents = currentEvents.filter((event) => event.status === "planned");
  const pastEvents = currentEvents.filter((event) => event.status === "past");
  const recommendedExternal = getVerifiedExternalEvents(undefined, today);

  return (
    <SitePage>
      <PageHero
        eyebrow="Events"
        title="Confirmed dates appear on the calendar first."
        description="Browse confirmed dates for chapter, national, and campus events. Follow each event's official source for schedules and attendance details. Plans in progress are listed separately."
      />
      <Section
        eyebrow="Confirmed calendar"
        title="Chapter, national, and campus calendar"
        description="Gold marks chapter events, purple marks national events, and navy marks Georgia Tech dates. Multi-day events appear on every day they run."
        className="bg-white"
      >
        <div className="grid gap-8">
          <EventCalendar
            events={confirmedEvents}
            campusDates={campusCalendarDates}
            today={today}
          />
          {confirmedEvents.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {confirmedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming chapter or national events are confirmed"
              description="New events will appear here after their dates are confirmed. Georgia Tech academic dates still show on the calendar above."
            />
          )}
        </div>
      </Section>
      <Section
        eyebrow="Around Georgia Tech"
        title="Recommended pre-health events"
        description="Verified campus and regional pre-health sessions from official Georgia Tech sources. These are recommendations for students — not LMSA Plus chapter events and not claims of partnership. Always confirm details on the official source."
        className="bg-gt-cream"
      >
        {recommendedExternal.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {recommendedExternal.map((event) => (
              <ExternalEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No external recommendations listed right now"
            description="High-relevance, verified campus or LMSA listings will appear here after they are checked against official sources."
          />
        )}
        <p className="mt-6 text-sm font-semibold text-slate-500">
          External listings last checked {EXTERNAL_EVENTS_CHECKED_AT}. Sources:
          Georgia Tech Campus Calendar and Applying to Grad School Week.
        </p>
      </Section>
      <Section
        eyebrow="Planning board"
        title="Events under development"
        description="These concepts communicate direction without representing scheduled commitments."
        className="bg-white"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {plannedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </Section>
      <Section eyebrow="Archive" title="Past events and campus outreach" className="bg-gt-cream">
        {pastEvents.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="The archive will begin after launch"
            description="Completed events can be added here with verified dates, summaries, and approved images."
          />
        )}
      </Section>
    </SitePage>
  );
}
