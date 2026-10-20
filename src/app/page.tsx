import Link from "next/link";
import { BoardGrid } from "@/components/BoardGrid";
import { MedicalHero } from "@/components/MedicalHero";
import { BiomedicalBackground } from "@/components/BiomedicalBackground";
import { OpenOpportunityCard } from "@/components/OpenOpportunityCard";
import { SitePage } from "@/components/SitePage";
import { chapterToday } from "@/lib/event-dates";
import { NETWORKING_NIGHT } from "@/lib/upcoming-chapter-event";
import { eventHasEnded, formatEventTime } from "@/lib/platform-dates";
import {
  getHomeOpenOpportunities,
  getOpenNowOpportunities,
  OPEN_OPPORTUNITIES_REVIEWED,
} from "@/lib/open-opportunities";
import { getPublicChapterEvents } from "@/server/public-events";

export const dynamic = "force-dynamic";

const firstMeetingInstagramUrl = "https://www.instagram.com/p/Det49GCjors/?img_index=1";

export default async function HomePage() {
  const { events: chapterEvents, availability } = await getPublicChapterEvents();
  const publishedEvents = chapterEvents.filter(
    (event) => event.publicationStatus === "published" && !eventHasEnded(event),
  );
  const featuredEvent =
    publishedEvents.find((event) => /medical student networking night/i.test(event.title)) ??
    publishedEvents[0];
  const showNetworkingFallback =
    !featuredEvent && availability !== "ready" && chapterToday() <= NETWORKING_NIGHT.endDate;
  const homeOpenOpportunities = getHomeOpenOpportunities();
  const openOpportunityCount = getOpenNowOpportunities().length;

  return (
    <SitePage>
      <section className="relative isolate overflow-hidden border-b border-gt-gold/30 bg-gt-cream px-5 py-12 sm:px-8 sm:py-16 lg:py-24" aria-labelledby="welcome-heading">
        <BiomedicalBackground />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="max-w-3xl">
            <p className="eyebrow">Georgia Tech · LMSA PLUS</p>
            <h1 id="welcome-heading" className="hero-heading mt-5 max-w-3xl text-5xl font-black leading-[1.04] tracking-tight text-gt-navy sm:text-6xl lg:text-7xl">
              Welcome to<br />GT-LMSA<span className="text-gt-dark-gold">+</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A pre-health community built on connection, service, and mentorship. All majors and backgrounds are welcome.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/join" className="button button-primary">
                Join LMSA+ <span aria-hidden="true">→</span>
              </Link>
              <Link href="/events" className="button button-secondary">
                Upcoming events
              </Link>
            </div>
          </div>
          <MedicalHero />
        </div>
      </section>

      <section className="section-shell bg-white" aria-labelledby="next-event-heading">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">On the calendar</p>
              <h2 id="next-event-heading" className="mt-2 text-3xl font-bold text-gt-navy sm:text-4xl">
                Next up
              </h2>
            </div>
            <Link href="/events" className="text-link font-bold">
              All events <span aria-hidden="true">→</span>
            </Link>
          </div>

          {featuredEvent ? (
            <Link
              href={`/events/${featuredEvent.id}`}
              className="event-spotlight group grid gap-6 rounded-xl border border-gt-gold/45 bg-gt-cream p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <p className="eyebrow">LMSA+ at Georgia Tech</p>
                <h3 className="mt-3 text-2xl font-bold text-gt-navy sm:text-3xl">{featuredEvent.title}</h3>
                <p className="mt-3 font-semibold text-slate-700">{formatEventTime(featuredEvent)}</p>
                <p className="mt-1 text-slate-600">{featuredEvent.location || "Emory University"}</p>
              </div>
              <span className="button button-primary w-fit">
                Event details <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ) : showNetworkingFallback ? (
            <Link
              href="/events"
              className="event-spotlight group grid gap-6 rounded-xl border border-gt-gold/45 bg-gt-cream p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <p className="eyebrow">LMSA+ at Georgia Tech</p>
                <h3 className="mt-3 text-2xl font-bold text-gt-navy sm:text-3xl">{NETWORKING_NIGHT.title}</h3>
                <p className="mt-3 font-semibold text-slate-700">{NETWORKING_NIGHT.date}</p>
                <p className="mt-1 text-slate-600">{NETWORKING_NIGHT.location} · Time and room details coming soon</p>
              </div>
              <span className="button button-primary w-fit">
                Event details <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ) : (
            <p className="rounded-xl border border-slate-200 p-6 text-slate-600">
              No upcoming chapter events are listed right now. Check back for the next gathering.
            </p>
          )}
        </div>
      </section>

      <BoardGrid
        id="executive-board"
        eyebrow="LMSA+ at Georgia Tech"
        title="Executive board"
        className="bg-gt-cream"
      />

      <section className="section-shell bg-white" aria-labelledby="first-meeting-heading">
        <div className="mx-auto max-w-7xl border-l-4 border-gt-gold pl-6 sm:pl-9">
          <p className="eyebrow">Our first gathering</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 id="first-meeting-heading" className="text-3xl font-bold text-gt-navy sm:text-4xl">
                First general body meeting
              </h2>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                Thanks to everyone who came out, met the board, and helped kick off LMSA+ at Georgia Tech.
              </p>
            </div>
            <a
              href={firstMeetingInstagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-secondary shrink-0"
            >
              View the Instagram recap <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens Instagram in a new tab)</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section-shell bg-gt-cream" aria-labelledby="open-opportunities-heading">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Updated {OPEN_OPPORTUNITIES_REVIEWED}</p>
              <h2 id="open-opportunities-heading" className="mt-3 text-3xl font-bold text-gt-navy sm:text-4xl">
                Open opportunities
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Verified applications, deadlines, and eligibility. Always confirm details with the official source.
              </p>
            </div>
            <Link href="/opportunities#open-now" className="button button-secondary shrink-0">
              See all {openOpportunityCount} <span aria-hidden="true">→</span>
            </Link>
          </div>

          {homeOpenOpportunities.length ? (
            <div className="mt-7 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {homeOpenOpportunities.map((opportunity) => (
                <OpenOpportunityCard key={opportunity.id} opportunity={opportunity} compact />
              ))}
            </div>
          ) : (
            <p className="mt-7 rounded-xl border border-gt-gold/45 bg-white p-6 leading-7 text-slate-600">
              No time-sensitive applications are currently listed as open. Visit Opportunities for recurring programs and upcoming cycles.
            </p>
          )}
        </div>
      </section>

      <section className="bg-gt-navy px-5 py-10 text-white sm:px-8 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow eyebrow-on-dark">Come be part of it</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Join LMSA+ at Georgia Tech.</h2>
          </div>
          <Link href="/join" className="button button-on-navy shrink-0">
            Join now <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </SitePage>
  );
}
