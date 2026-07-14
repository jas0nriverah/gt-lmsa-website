import type { Metadata } from "next";
import { EventCard } from "@/components/Cards";
import { EmptyState } from "@/components/EmptyState";
import { EventCalendar } from "@/components/EventCalendar";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { campusCalendarDates, events } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Events",
  description:
    "See confirmed LMSA Plus at Georgia Tech events on the calendar, plus planned launch activities still under development.",
};

export default function EventsPage() {
  const confirmedEvents = events.filter((event) => event.status === "confirmed");
  const plannedEvents = events.filter((event) => event.status === "planned");
  const pastEvents = events.filter((event) => event.status === "past");

  return (
    <SitePage>
      <PageHero
        eyebrow="Events"
        title="Confirmed dates appear on the calendar first."
        description="Confirmed events include verified dates, times, and locations. Planning-board ideas stay separate until the founding board confirms them."
      />
      <Section
        eyebrow="Confirmed calendar"
        title="Chapter events and Georgia Tech academic dates"
        description="Gold highlights LMSA Plus confirmed events. Navy labels show Georgia Tech academic dates such as first day of classes, breaks, and finals."
        className="bg-white"
      >
        <div className="grid gap-8">
          <EventCalendar
            events={confirmedEvents}
            campusDates={campusCalendarDates}
          />
          {confirmedEvents.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {confirmedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No LMSA Plus events have been confirmed yet"
              description="Chapter dates will appear here after the founding board verifies them. Georgia Tech academic dates still show on the calendar above."
            />
          )}
        </div>
      </Section>
      <Section
        eyebrow="Planning board"
        title="Events under development"
        description="These concepts communicate direction without representing scheduled commitments."
        className="bg-gt-cream"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {plannedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </Section>
      <Section eyebrow="Archive" title="Past chapter events" className="bg-white">
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
