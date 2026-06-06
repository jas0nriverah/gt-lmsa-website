import Image from "next/image";
import { BoardCard, EventCard, ImpactCard, ResourceCard } from "@/components/Cards";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Section } from "@/components/Section";
import {
  boardMembers,
  contactLinks,
  events,
  impactAreas,
  resources,
} from "@/lib/site-data";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section id="home" className="px-6 pb-20 pt-14 sm:px-8 lg:pt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-gt-gold/40 bg-white px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-gt-dark-gold shadow-sm">
                Georgia Tech Chapter
              </p>
              <h1 className="max-w-4xl text-5xl font-black tracking-tight text-gt-navy sm:text-6xl lg:text-7xl">
                Latino Medical Student Association
              </h1>
              <p className="mt-5 text-2xl font-bold text-gt-dark-gold">
                Georgia Tech Chapter
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                A warm, mission-driven community for Latino/a/e and
                underrepresented pre-health students pursuing medicine, service,
                mentorship, and health equity.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={contactLinks.joinForm}
                  className="rounded-full bg-gt-navy px-7 py-3.5 text-center font-bold text-white shadow-lg shadow-gt-navy/20 transition hover:bg-slate-900"
                >
                  Join Us
                </a>
                <a
                  href="#events"
                  className="rounded-full border border-gt-navy/20 bg-white px-7 py-3.5 text-center font-bold text-gt-navy shadow-sm transition hover:border-gt-gold hover:bg-gt-cream"
                >
                  View Events
                </a>
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {["Mentorship", "Service", "Health Equity"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white bg-white/75 px-4 py-3 text-center text-sm font-bold text-gt-navy shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-0 -z-10 rounded-full bg-gt-gold/20 blur-3xl" />
              <div className="rounded-[2rem] border border-gt-gold/35 bg-white p-6 shadow-2xl shadow-gt-navy/10">
                <Image
                  src="/lmsa-logo.png"
                  alt="Latino Medical Student Association logo"
                  width={720}
                  height={720}
                  className="h-auto w-full rounded-[1.5rem]"
                  priority
                />
              </div>
              <div className="absolute -bottom-7 left-6 right-6 rounded-3xl bg-gt-navy p-5 text-white shadow-xl">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-gt-gold">
                  Built for pre-health students
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Mentorship, preparation, community, and service in one chapter.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Section
          id="about"
          eyebrow="About and Mission"
          title="A supportive path toward medicine and health care."
          description="LMSA at Georgia Tech supports Latino/a/e and underrepresented pre-health students through mentorship, community, service, and professional development."
        >
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl bg-gt-navy p-8 text-white shadow-xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-gt-gold">
                Our Mission
              </p>
              <h3 className="mt-4 text-3xl font-bold">
                Make the pre-health journey more connected, informed, and
                welcoming.
              </h3>
              <p className="mt-5 leading-8 text-white/80">
                We create space for students to ask honest questions, find
                mentors, develop leadership skills, and serve communities with a
                focus on culturally responsive care.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Peer and professional mentorship",
                "Health equity and cultural advocacy",
                "Clinical, service, and volunteer pathways",
                "Medical school and MCAT preparation",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 h-1.5 w-14 rounded-full bg-gt-gold" />
                  <p className="text-lg font-bold text-gt-navy">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          id="what-we-do"
          eyebrow="What We Do"
          title="Programs with purpose and community at the center."
          description="Our chapter combines academic support, professional exposure, cultural connection, and service opportunities for future health professionals."
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

        <Section
          id="events"
          eyebrow="Events"
          title="Upcoming chapter events."
          description="Use these placeholder cards as a starting point for general body meetings, study nights, speaker panels, and service opportunities."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {events.map((event) => (
              <EventCard key={`${event.date}-${event.title}`} {...event} />
            ))}
          </div>
        </Section>

        <Section
          id="board"
          eyebrow="Executive Board"
          title="Meet the student leaders."
          description="Update these placeholders with the chapter's current officers, photos, bios, or contact links whenever they are ready."
          className="bg-white"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {boardMembers.map((member) => (
              <BoardCard key={member.role} {...member} />
            ))}
          </div>
        </Section>

        <Section
          id="resources"
          eyebrow="Resources"
          title="Helpful starting points for pre-health students."
          description="A simple resource hub for MCAT prep, advising, clinical experience, mentorship, and the medical school application process."
          className="bg-gt-cream"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.title} {...resource} />
            ))}
          </div>
        </Section>

        <section id="contact" className="px-6 py-20 sm:px-8">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-gt-navy shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 text-white sm:p-12">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gt-gold">
                Contact and Join
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Interested in joining LMSA?
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-white/80">
                Join the interest list, follow the chapter online, or reach out
                by email. We welcome students exploring medicine, public health,
                research, allied health, and other health professions.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={contactLinks.joinForm}
                  className="rounded-full bg-white px-7 py-3.5 text-center font-bold text-gt-navy transition hover:bg-gt-cream"
                >
                  Join LMSA
                </a>
                <a
                  href={`mailto:${contactLinks.email}`}
                  className="rounded-full border border-white/30 px-7 py-3.5 text-center font-bold text-white transition hover:bg-white/10"
                >
                  Email Us
                </a>
              </div>
            </div>
            <div className="bg-white p-8 sm:p-12">
              <div className="rounded-3xl border border-slate-200 bg-gt-cream p-6">
                <h3 className="text-2xl font-bold text-gt-navy">
                  Chapter Contact
                </h3>
                <div className="mt-6 grid gap-4">
                  <a
                    href={`mailto:${contactLinks.email}`}
                    className="rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm hover:text-gt-navy"
                  >
                    Email: {contactLinks.email}
                  </a>
                  <a
                    href={contactLinks.instagram}
                    className="rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm hover:text-gt-navy"
                  >
                    Instagram: {contactLinks.instagramHandle}
                  </a>
                  <a
                    href={contactLinks.joinForm}
                    className="rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm hover:text-gt-navy"
                  >
                    Google Form: membership interest
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
