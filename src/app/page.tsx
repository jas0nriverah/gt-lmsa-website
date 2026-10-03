import Link from "next/link";
import { BoardGrid } from "@/components/BoardGrid";
import { MedicalHero } from "@/components/MedicalHero";
import { BiomedicalBackground } from "@/components/BiomedicalBackground";
import { ThisWeekCard } from "@/components/ThisWeekCard";
import { SitePage } from "@/components/SitePage";
import { getUpcomingItems } from "@/lib/external-events";
import { interestMeetingTiming } from "@/lib/site-data";
import { formatEventTime } from "@/lib/platform-dates";
import { ENGAGE_INTEREST_MEETING_RSVP_URL } from "@/lib/engage-events";
import { getPublicChapterEvents } from "@/server/public-events";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ events: chapterEvents, availability }, recommendedItems] = await Promise.all([
    getPublicChapterEvents(),
    Promise.resolve(getUpcomingItems().filter((item) => item.sourceType !== "chapter")),
  ]);
  const featuredEvent = chapterEvents.find(
    (event) => event.publicationStatus === "published",
  );

  return (
    <SitePage>
      <section className="relative isolate overflow-hidden border-b border-gt-gold/30 bg-gt-cream px-5 py-12 sm:px-8 sm:py-16 lg:py-24" aria-labelledby="welcome-heading">
        <BiomedicalBackground />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="max-w-3xl">
            <p className="eyebrow">Georgia Tech</p>
            <h1 id="welcome-heading" className="hero-heading mt-5 max-w-3xl text-5xl font-black leading-[1.04] tracking-tight text-gt-navy sm:text-6xl lg:text-7xl">
              Welcome to<br />GT-LMSA<span className="text-gt-dark-gold">+</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Georgia Tech’s Latino Medical Student Association. Meet other pre-health students, find mentors, and give back to our community.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/join" className="button button-primary">
                Join LMSA+ <span aria-hidden="true">→</span>
              </Link>
              <Link href="/interest" className="button button-secondary">
                Express interest
              </Link>
            </div>
            <Link href="/member" className="text-link mt-5 inline-flex rounded-sm text-sm font-bold">
              My membership <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>

          <MedicalHero />
        </div>
      </section>

      <BoardGrid
        id="executive-board"
        eyebrow="Fall 2026"
        title="Meet our executive board"
        className="bg-white"
      />

      <section className="section-shell bg-gt-cream" aria-labelledby="chapter-events-heading">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow">Stay connected</p>
              <h2 id="chapter-events-heading" className="mt-3 text-3xl font-bold text-gt-navy sm:text-4xl">
                Upcoming events
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">
                Chapter meetings, campus events, and opportunities from the LMSA network.
              </p>
              <Link href="/events" className="text-link mt-6 inline-flex rounded-sm font-bold">
                Explore all events <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>

            <div className="grid gap-4">
              {featuredEvent ? (
                <Link
                  href={`/events/${featuredEvent.id}`}
                  className="event-spotlight group rounded-xl border border-gt-gold/45 bg-white p-6 sm:p-8"
                >
                  <p className="eyebrow">From LMSA PLUS at Georgia Tech</p>
                  <h3 className="mt-3 text-2xl font-bold text-gt-navy">{featuredEvent.title}</h3>
                  <p className="mt-3 font-semibold text-slate-600">{formatEventTime(featuredEvent)}</p>
                  <span className="mt-6 inline-flex font-bold text-gt-navy">
                    Event details <span aria-hidden="true" className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              ) : (
                <div className="rounded-xl border border-gt-gold/45 bg-white p-6 sm:p-8" role="status">
                  <p className="eyebrow">Chapter calendar</p>
                  <p className="mt-3 text-lg font-bold text-gt-navy">
                    {availability === "ready"
                      ? "No upcoming chapter events are currently listed."
                      : availability === "unconfigured"
                        ? "Fall 2026 Interest Meeting"
                        : "Chapter event details are temporarily unavailable."}
                  </p>
                  <p className="mt-2 leading-7 text-slate-600">
                    {availability === "unavailable"
                      ? "Please check the events page again soon for confirmed updates."
                      : availability === "unconfigured"
                        ? `Scheduled for ${interestMeetingTiming} at Instructional Center (IC), Room 115. RSVP through Georgia Tech Engage.`
                      : "Check back here as plans and event details are confirmed."}
                  </p>
                  {availability === "unconfigured" ? (
                    <a
                      href={ENGAGE_INTEREST_MEETING_RSVP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button button-primary mt-5"
                    >
                      RSVP on Georgia Tech Engage <span aria-hidden="true">↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null}
                </div>
              )}

              {recommendedItems.length ? (
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-gt-dark-gold">
                    Recommended around campus and the LMSA network
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {recommendedItems.map((item) => <ThisWeekCard key={item.id} item={item} />)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gt-navy px-5 py-10 text-white sm:px-8 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow eyebrow-on-dark">LMSA+ at Georgia Tech</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">We’d love to meet you.</h2>
          </div>
          <Link href="/join" className="button button-on-navy shrink-0">
            Join LMSA+ <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </SitePage>
  );
}
