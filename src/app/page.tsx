import Image from "next/image";
import { BoardCard, EventCard, ImpactCard, ResourceCard } from "@/components/Cards";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Section } from "@/components/Section";
import {
  boardMembers,
  contactLinks,
  events,
  heroStats,
  impactAreas,
  mission,
  resourceCategories,
  whyItMatters,
} from "@/lib/site-data";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* ------------------------------------------------------------------ */}
        {/* HERO                                                                */}
        {/* ------------------------------------------------------------------ */}
        <section
          id="home"
          className="relative overflow-hidden px-6 pb-20 pt-16 sm:px-8 lg:pb-28 lg:pt-24"
        >
          {/* Decorative brand glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-gt-gold/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 top-40 -z-10 h-96 w-96 rounded-full bg-gt-navy/10 blur-3xl"
          />

          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-gt-gold/40 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gt-dark-gold shadow-sm">
                <span className="h-2 w-2 rounded-full bg-gt-gold" />
                Latino Medical Student Association
              </p>

              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-gt-navy sm:text-5xl lg:text-6xl">
                Latinos in medicine,
                <span className="block text-gt-dark-gold">rising together.</span>
              </h1>

              <p className="mt-5 text-lg font-semibold text-gt-navy/80">
                The Georgia Tech Chapter
              </p>

              <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600 lg:mx-0">
                We support Latino/a/e and underrepresented pre-health students
                with mentorship, medical school preparation, service, and a
                community that feels like home on the road to medicine.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href={contactLinks.joinForm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gt-navy px-8 py-4 text-center font-bold text-white shadow-lg shadow-gt-navy/25 transition hover:bg-gt-navy-deep"
                >
                  Join the Chapter
                </a>
                <a
                  href="#events"
                  className="rounded-full border-2 border-gt-navy/15 bg-white px-8 py-4 text-center font-bold text-gt-navy shadow-sm transition hover:border-gt-gold hover:bg-gt-cream"
                >
                  Explore Events
                </a>
              </div>

              {/* Quick facts */}
              <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 lg:mx-0">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-4 text-center shadow-sm"
                  >
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="text-2xl font-black text-gt-navy">
                      {stat.value}
                    </dd>
                    <p className="mt-1 text-xs font-semibold leading-tight text-slate-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </dl>
            </div>

            {/* Logo showcase */}
            <div className="relative mx-auto w-full max-w-md">
              <div
                aria-hidden="true"
                className="absolute inset-6 -z-10 rounded-full bg-gt-gold/20 blur-2xl"
              />
              <div className="rounded-[2.25rem] border border-gt-gold/30 bg-white/90 p-8 shadow-2xl shadow-gt-navy/15">
                <Image
                  src="/lmsa-logo.png"
                  alt="Latino Medical Student Association logo"
                  width={720}
                  height={720}
                  className="h-auto w-full"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-gt-navy p-5 text-white shadow-xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-gt-gold">
                  Comunidad &middot; Mentorship &middot; Medicine
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Open to all majors and all stages of the pre-health journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* ABOUT / MISSION + WHY LMSA MATTERS                                  */}
        {/* ------------------------------------------------------------------ */}
        <Section
          id="about"
          eyebrow={mission.eyebrow}
          title={mission.heading}
          align="center"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-gt-navy to-gt-navy-deep p-8 text-white shadow-xl sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-gt-gold">
                Our Mission
              </p>
              {mission.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={`leading-8 text-white/85 ${
                    index === 0 ? "mt-5 text-lg" : "mt-4"
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {whyItMatters.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 h-1.5 w-12 rounded-full bg-gt-gold" />
                  <h3 className="text-lg font-bold text-gt-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* WHAT WE DO                                                          */}
        {/* ------------------------------------------------------------------ */}
        <Section
          id="what-we-do"
          eyebrow="What We Do"
          title="How we support our members."
          description="From your first pre-med question to your medical school interviews, our programs meet you at every step of the journey."
          className="bg-gt-cream"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {impactAreas.map((area, index) => (
              <ImpactCard
                key={area.title}
                index={index + 1}
                title={area.title}
                description={area.description}
              />
            ))}
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* EVENTS                                                              */}
        {/* ------------------------------------------------------------------ */}
        <Section
          id="events"
          eyebrow="Events"
          title="What's coming up."
          description="Meetings, study nights, panels, and service days. Dates and details are easy to update each semester."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {events.map((event) => (
              <EventCard key={`${event.date}-${event.title}`} {...event} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Want the latest schedule? Follow us on Instagram{" "}
            <a
              href={contactLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gt-dark-gold hover:text-gt-navy"
            >
              {contactLinks.instagramHandle}
            </a>
            .
          </p>
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* EXECUTIVE BOARD                                                     */}
        {/* ------------------------------------------------------------------ */}
        <Section
          id="board"
          eyebrow="Executive Board"
          title="Meet the team leading the chapter."
          description="Our student officers plan programming, build partnerships, and support members all year long."
          className="bg-gt-cream"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {boardMembers.map((member) => (
              <BoardCard key={member.role} {...member} />
            ))}
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* RESOURCES                                                           */}
        {/* ------------------------------------------------------------------ */}
        <Section
          id="resources"
          eyebrow="Resources"
          title="Tools for your pre-health journey."
          description="Curated starting points for medical school prep, advising, experience, and mentorship."
        >
          <div className="space-y-12">
            {resourceCategories.map((group) => (
              <div key={group.category}>
                <div className="mb-5 flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gt-navy">
                    {group.category}
                  </h3>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <ResourceCard key={item.title} {...item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* CONTACT / JOIN                                                      */}
        {/* ------------------------------------------------------------------ */}
        <section id="contact" className="px-6 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-gt-navy to-gt-navy-deep shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 text-white sm:p-12">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-gt-gold">
                <span className="h-px w-8 bg-gt-gold" />
                Get Involved
              </p>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Ready to find your community in medicine?
              </h2>
              <p className="mt-5 max-w-xl leading-8 text-white/80">
                Whether you&apos;re just starting to explore the health
                professions or deep into applications, there&apos;s a place for
                you here. Join the interest list, reach out, or follow along.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={contactLinks.joinForm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gt-gold px-8 py-4 text-center font-bold text-gt-navy shadow-lg transition hover:bg-gt-dark-gold hover:text-white"
                >
                  Join LMSA
                </a>
                <a
                  href={`mailto:${contactLinks.email}`}
                  className="rounded-full border border-white/30 px-8 py-4 text-center font-bold text-white transition hover:bg-white/10"
                >
                  Email the Chapter
                </a>
              </div>
            </div>

            <div className="bg-white p-8 sm:p-12">
              <h3 className="text-xl font-bold text-gt-navy">
                Chapter Contact
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                We&apos;d love to hear from you.
              </p>
              <div className="mt-6 grid gap-3">
                <a
                  href={`mailto:${contactLinks.email}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-gt-cream/60 p-4 font-semibold text-gt-navy transition hover:border-gt-gold hover:bg-gt-cream"
                >
                  <span>Email</span>
                  <span className="text-sm font-bold text-gt-dark-gold">
                    {contactLinks.email}
                  </span>
                </a>
                <a
                  href={contactLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-gt-cream/60 p-4 font-semibold text-gt-navy transition hover:border-gt-gold hover:bg-gt-cream"
                >
                  <span>Instagram</span>
                  <span className="text-sm font-bold text-gt-dark-gold">
                    {contactLinks.instagramHandle}
                  </span>
                </a>
                <a
                  href={contactLinks.joinForm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-gt-cream/60 p-4 font-semibold text-gt-navy transition hover:border-gt-gold hover:bg-gt-cream"
                >
                  <span>Interest Form</span>
                  <span className="text-sm font-bold text-gt-dark-gold">
                    Sign up &rarr;
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
