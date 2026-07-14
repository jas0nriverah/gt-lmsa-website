import Image from "next/image";
import Link from "next/link";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import {
  BoardCard,
  EventCard,
  ProgramCard,
  ValueCard,
} from "@/components/Cards";
import { FAQList } from "@/components/FAQList";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import {
  announcements,
  boardMembers,
  chapterInfo,
  coreValues,
  events,
  faqs,
  mission,
  programs,
} from "@/lib/site-data";

export default function HomePage() {
  return (
    <SitePage>
      <section className="relative overflow-hidden border-b border-gt-gold/25 bg-white px-6 py-16 sm:px-8 sm:py-20 lg:py-28">
        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-gt-navy lg:block" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="eyebrow">{chapterInfo.launchLabel}</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.08] text-gt-navy sm:text-6xl">
              A new pre-health community, built to help students move forward together.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {chapterInfo.description} Public programming is planned to begin in Fall 2026.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/interest" className="button button-primary">
                Join the interest list <span aria-hidden="true">→</span>
              </Link>
              <Link href="/events" className="button button-secondary">
                View planned events
              </Link>
            </div>
            <p className="mt-5 text-sm font-semibold text-slate-500">
              {chapterInfo.recognitionStatus}
            </p>
          </div>
          <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center rounded-[3rem] bg-gt-navy p-10 shadow-2xl shadow-gt-navy/20 ring-1 ring-white/15 lg:mx-0">
            <div className="absolute inset-5 rounded-[2.3rem] border border-gt-gold/40" />
            <Image
              src="/lmsa-logo.png"
              alt="Latino Medical Student Association logo"
              width={280}
              height={280}
              className="relative rounded-full bg-white shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      <Section
        eyebrow="Launch updates"
        title="What is planned for Fall 2026"
        description="These activities are not yet confirmed calendar events. Exact logistics will be posted only after the chapter verifies them."
        className="bg-gt-cream"
      >
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <AnnouncementBanner key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Our mission"
        title={mission.heading}
        description={mission.paragraphs.join(" ")}
        className="bg-white"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {coreValues.map((value, index) => (
            <ValueCard key={value.title} index={index + 1} {...value} />
          ))}
        </div>
        <div className="mt-8">
          <Link href="/about" className="text-link font-bold">
            Learn about LMSA, PLUS, and the Georgia Tech chapter →
          </Link>
        </div>
      </Section>

      <Section
        eyebrow="Programs"
        title="Programming designed around the pre-health journey"
        description="Every local program shown here is planned. The board will mark activities active only after confirming scope, support, and logistics."
        className="bg-gt-cream"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.slice(0, 6).map((program) => (
            <ProgramCard key={program.title} program={program} />
          ))}
        </div>
        <Link href="/programs" className="button button-secondary mt-8">
          Explore all planned programs
        </Link>
      </Section>

      <Section
        eyebrow="Events"
        title="The first chapter calendar is taking shape"
        description="Dates, times, locations, and registration links remain unavailable until they are formally confirmed."
        className="bg-white"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {events.slice(0, 2).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <Link href="/events" className="button button-secondary mt-8">
          View the event roadmap
        </Link>
      </Section>

      <Section
        eyebrow="Founding board"
        title="Meet the chapter leaders preparing the launch"
        description="Only board information approved for public use is displayed."
        className="bg-gt-cream"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {boardMembers.map((member) => (
            <BoardCard key={member.name} member={member} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Questions"
        title="Start with the essentials"
        description="Find clear answers about the chapter, participation, membership, and the launch."
        className="bg-white"
      >
        <FAQList items={faqs.slice(0, 5)} />
        <Link href="/about#frequently-asked-questions" className="button button-secondary mt-8">
          Read all frequently asked questions
        </Link>
      </Section>

      <section className="bg-gt-gold px-6 py-16 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="eyebrow !text-gt-navy">Help shape the first year</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black text-gt-navy sm:text-4xl">
              Follow launch updates and bring your ideas to the founding chapter.
            </h2>
          </div>
          <Link href="/get-involved" className="button bg-gt-navy text-white hover:bg-gt-navy-deep">
            Get involved <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </SitePage>
  );
}
