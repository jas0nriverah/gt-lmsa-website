import Image from "next/image";
import Link from "next/link";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { ProgramCard } from "@/components/Cards";
import { ThisWeekCard } from "@/components/ThisWeekCard";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { chapterInfo, programs } from "@/lib/site-data";
import { events } from "@/lib/stale-status-sep-14";
import { getUpcomingItems } from "@/lib/external-events";

export const dynamic = "force-dynamic";

const highlightedPrograms = ["Peer mentorship", "Community service", "Pre-health planning workshops"];

export default function HomePage() {
  const upcoming = getUpcomingItems();
  const meeting = events.find((event) => event.id === "fall-2026-interest-meeting" && event.status === "planned");

  return (
    <SitePage>
      <section className="relative overflow-hidden border-b border-gt-gold/25 bg-white px-6 py-12 sm:px-8 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-gt-gold/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1.5fr_1fr] md:gap-12">
          <div>
            <p className="eyebrow">{chapterInfo.launchLabel}</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-gt-navy sm:text-5xl">Your pre-health community at Georgia Tech.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              LMSA PLUS brings students together through mentorship, service, and Latino/Hispanic health. All majors and backgrounds are welcome to express interest.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/interest" className="button button-primary">Join the interest list <span aria-hidden="true">→</span></Link>
              <Link href="/events" className="button button-secondary">Explore events</Link>
            </div>
            <Link href="/about" className="text-link mt-5 inline-block text-sm font-bold">Our mission and founding board →</Link>
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-72 items-center justify-center rounded-full border border-gt-gold/40 p-5 md:flex">
            <div aria-hidden="true" className="absolute inset-2 rounded-full border border-dashed border-gt-navy/20" />
            <Image src="/lmsa-logo.png" alt="Latino Medical Student Association logo" width={280} height={280} className="relative rounded-full bg-white" priority />
          </div>
        </div>
      </section>

      <Section eyebrow="What's coming up" title="Find your next connection" description="Chapter plans, national events, and campus recommendations in one place." className="bg-gt-cream">
        {meeting ? (
          <div className="mb-6">
            <AnnouncementBanner announcement={{
              id: meeting.id,
              title: meeting.title,
              summary: "Meet the founding board, learn about LMSA PLUS, and help shape our first year.",
              timing: meeting.displayDate + " (time and location coming soon)",
              status: "planned",
              href: "/events#" + meeting.id,
              featured: true,
            }} />
          </div>
        ) : null}
        {upcoming.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((item) => <ThisWeekCard key={item.id} item={item} />)}
          </div>
        ) : (
          <p className="leading-7 text-slate-600">New dates will appear here as events are confirmed. Join the interest list to hear about chapter updates.</p>
        )}
        <Link href="/events" className="text-link mt-7 inline-block font-bold">View the full calendar →</Link>
      </Section>

      <Section eyebrow="Grow with us" title="Community for the path ahead" description="Three ways we're planning to support your pre-health journey." className="bg-white">
        <div className="grid gap-5 md:grid-cols-3">
          {highlightedPrograms.map((title) => programs.find((program) => program.title === title))
            .map((program) => program ? <ProgramCard key={program.title} program={program} /> : null)}
        </div>
        <Link href="/programs" className="text-link mt-7 inline-block font-bold">Explore all programs →</Link>
      </Section>

      <section className="bg-gt-gold px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gt-navy">Be part of the founding year.</h2>
            <p className="mt-3 max-w-xl leading-7 text-gt-navy">Get chapter updates and hear when meetings and opportunities open.</p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <Link href="/interest" className="button button-primary">Join the interest list <span aria-hidden="true">→</span></Link>
            <Link href="/about#frequently-asked-questions" className="text-link text-sm font-bold">Questions? Read the FAQ →</Link>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
