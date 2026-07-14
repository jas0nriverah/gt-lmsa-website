import type { Metadata } from "next";
import { EventCard } from "@/components/Cards";
import { EmptyState } from "@/components/EmptyState";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { events } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Events",
  description:
    "See planned LMSA Plus at Georgia Tech launch events and honest coming-soon states for dates, locations, and registration.",
};

export default function EventsPage() {
  const confirmedEvents = events.filter((event) => event.status === "confirmed");
  const plannedEvents = events.filter((event) => event.status === "planned");
  const pastEvents = events.filter((event) => event.status === "past");

  return (
    <SitePage>
      <PageHero
        eyebrow="Events"
        title="The first chapter calendar is being built carefully."
        description="An idea is not a confirmed event. Dates, times, locations, partners, speakers, and registration links will appear only after the board verifies them."
      />
      <Section
        eyebrow="Confirmed calendar"
        title="Upcoming confirmed events"
        className="bg-white"
      >
        {confirmedEvents.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {confirmedEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <EmptyState
            title="No events have been confirmed yet"
            description="The first public dates, locations, and registration details will be posted after the founding board verifies them."
          />
        )}
      </Section>
      <Section
        eyebrow="Planning board"
        title="Events under development"
        description="These concepts communicate direction without representing scheduled commitments."
        className="bg-gt-cream"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {plannedEvents.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </Section>
      <Section eyebrow="Archive" title="Past chapter events" className="bg-white">
        {pastEvents.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {pastEvents.map((event) => <EventCard key={event.id} event={event} />)}
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
