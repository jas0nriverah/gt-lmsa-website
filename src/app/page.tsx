import Image from "next/image";
import Link from "next/link";
import { BoardGrid } from "@/components/BoardGrid";
import { ThisWeekCard } from "@/components/ThisWeekCard";
import { SitePage } from "@/components/SitePage";
import { getUpcomingItems } from "@/lib/external-events";
import { chapterInfo, interestMeetingTiming } from "@/lib/site-data";
import { formatEventTime } from "@/lib/platform-dates";
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
      <section className="relative isolate overflow-hidden border-b border-gt-gold/30 bg-white px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div aria-hidden="true" className="hero-wash absolute inset-y-0 right-0 -z-10 w-full md:w-[56%]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="max-w-3xl">
            <p className="eyebrow">Georgia Tech · LMSA PLUS</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.08] text-gt-navy sm:text-5xl lg:text-6xl">
              Find your people on the path to healthcare.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {chapterInfo.description} All majors and backgrounds are welcome.
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

          <div className="hero-art relative mx-auto flex w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-gt-gold/35 bg-gt-cream px-6 py-9 sm:py-12">
            <span aria-hidden="true" className="plus-mark plus-mark-large absolute right-7 top-7 opacity-25" />
            <span aria-hidden="true" className="plus-mark absolute bottom-7 left-7 opacity-45" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <Image
                src="/lmsa-logo.png"
                alt="Latino Medical Student Association PLUS logo"
                width={240}
                height={240}
                sizes="(max-width: 767px) 176px, 224px"
                className="h-44 w-44 rounded-full bg-white object-contain p-2 ring-1 ring-gt-gold/40 sm:h-56 sm:w-56"
                priority
              />
              <p className="mt-5 max-w-xs text-sm font-semibold leading-6 text-gt-navy">
                {chapterInfo.fullName}
              </p>
            </div>
          </div>
        </div>
      </section>

      <BoardGrid
        id="executive-board"
        eyebrow="Meet the founding board"
        title="The people building this chapter."
        description="Eight student leaders bringing their perspectives and care for community to LMSA PLUS at Georgia Tech."
        className="bg-white"
      />

      <section className="section-shell bg-gt-cream" aria-labelledby="chapter-events-heading">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow">Stay connected</p>
              <h2 id="chapter-events-heading" className="mt-3 text-3xl font-bold text-gt-navy sm:text-4xl">
                Make room for what comes next.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">
                Find chapter plans alongside recommended campus and LMSA events. Details appear here as they are confirmed.
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
                        ? `Planned for ${interestMeetingTiming}. Exact date, time and location will be announced; RSVPs are not open yet.`
                        : "Check back here as plans and event details are confirmed."}
                  </p>
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
            <p className="eyebrow eyebrow-on-dark">A place to begin</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Community grows when we show up for one another.</h2>
          </div>
          <Link href="/join" className="button button-on-navy shrink-0">
            Join LMSA+ <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </SitePage>
  );
}
