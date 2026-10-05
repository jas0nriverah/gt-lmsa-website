import type { Metadata } from "next";
import { EventCard } from "@/components/Cards";
import { ExternalEventCard } from "@/components/ExternalEventCard";
import { EventCalendar } from "@/components/EventCalendar";
import { ChapterEventBrowser } from "@/components/ChapterEventBrowser";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { campusCalendarDates } from "@/lib/site-data";
import { events } from "@/lib/stale-status-sep-14";
import { chapterToday, eventsAsOf } from "@/lib/event-dates";
import { getVerifiedExternalEvents } from "@/lib/external-events";
import { getPublicChapterEvents } from "@/server/public-events";
import type { ChapterEvent } from "@/lib/site-types";
import { formatEventTime } from "@/lib/platform-dates";

export const metadata: Metadata = {
  title: "Events",
  description: "Find your next connection: chapter gatherings, service, mentorship, and pre-health events.",
};
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const today = chapterToday();
  const chapter = await getPublicChapterEvents();
  // Static overlays ONLY own national/campus events, never database-backed chapter events.
  const network = eventsAsOf(
    events.filter(event => event.scope === "national" || event.scope === "campus"),
    today,
  );
  const confirmedNetwork = network.filter(event => event.status === "confirmed");
  const pastNetwork = network.filter(event => event.status === "past");
  const chapterCalendar: ChapterEvent[] = chapter.events
    .filter(event => event.startsAt && event.endsAt && event.publicationStatus === "published")
    .map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      scope: "chapter",
      status: "confirmed",
      displayDate: formatEventTime(event),
      location: event.location,
      startDate: chapterToday(new Date(event.startsAt!)),
      // Midnight is an exclusive event end, not another occupied calendar day.
      endDate: chapterToday(new Date(new Date(event.endsAt!).getTime() - 1)),
      detailsUrl: `/events/${event.id}`,
      registrationStatus: "not-required",
    }));
  const external = getVerifiedExternalEvents(undefined, today);

  return (
    <SitePage>
      <PageHero
        eyebrow="Find your people"
        title="Make room for what’s next."
        description="A conversation, a new connection, a chance to serve. Explore what’s happening with LMSA+ at Georgia Tech."
      />
      <Section
        id="chapter-events"
        eyebrow="LMSA+ at Georgia Tech"
        title="Chapter gatherings"
        description="Browse chapter gatherings and follow each event’s RSVP link. Our first meeting uses Georgia Tech Engage."
        className="bg-gt-cream"
      >
        <ChapterEventBrowser configured={Boolean(process.env.DATABASE_URL)} />
      </Section>
      <Section
        eyebrow="Plan ahead"
        title="Your chapter and campus calendar"
        description="All dates are shown in Atlanta time. Undated plans stay in the event list until their schedule is confirmed."
        className="bg-white"
      >
        {chapter.availability === "unavailable" ? (
          <p role="status" className="mb-6 rounded-xl bg-amber-50 p-4 text-amber-900">
            Chapter dates could not be loaded. The calendar below currently shows campus and national dates only.
          </p>
        ) : null}
        <EventCalendar
          events={[...chapterCalendar, ...confirmedNetwork]}
          campusDates={campusCalendarDates}
          today={today}
        />
      </Section>
      {external.length > 0 || confirmedNetwork.length > 0 ? (
        <Section eyebrow="Beyond our chapter" title="Around Georgia Tech & LMSA" className="bg-gt-cream">
          <div className="grid gap-5 md:grid-cols-2">
            {external.map(event => <ExternalEventCard key={event.id} event={event} />)}
            {confirmedNetwork.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </Section>
      ) : null}
      <Section eyebrow="Community history" title="Past campus & national events" className="bg-white">
        {pastNetwork.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {pastNetwork.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <p className="text-slate-600">Completed campus and national events will appear here.</p>
        )}
      </Section>
    </SitePage>
  );
}
