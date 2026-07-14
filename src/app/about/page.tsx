import type { Metadata } from "next";
import { BoardCard, ValueCard } from "@/components/Cards";
import { FAQList } from "@/components/FAQList";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import {
  boardMembers,
  chapterInfo,
  coreValues,
  faqs,
  lmsaHistory,
  mission,
  organizationLevels,
} from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about LMSA, LMSA PLUS, the Georgia Tech chapter mission, founding board, values, and participation frequently asked questions.",
};

export default function AboutPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="About the chapter"
        title="A local chapter connected to a national pre-health network."
        description={`${chapterInfo.fullName} is preparing an inclusive Fall 2026 launch for students interested in medicine, health professions, service, and Latino/Hispanic health.`}
      />

      <Section eyebrow="Mission" title={mission.heading} className="bg-white">
        <div className="grid gap-6 text-lg leading-8 text-slate-600 lg:grid-cols-2">
          {mission.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <a
          href={mission.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link mt-8 inline-block font-bold"
        >
          Read LMSA National&apos;s organizing principles ↗
        </a>
      </Section>

      <Section
        eyebrow="Shared values"
        title="Five principles guide the chapter's direction"
        description="Local language reflects the themes in LMSA National's organizing principles while keeping commitments realistic for a new chapter."
        className="bg-gt-cream"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {coreValues.map((value, index) => (
            <ValueCard key={value.title} index={index + 1} {...value} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="The LMSA network"
        title={lmsaHistory.heading}
        description="The chapter's public description is grounded in LMSA's official history and organizational pages."
        className="bg-white"
      >
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card p-7">
            {lmsaHistory.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 first:mt-0 leading-8 text-slate-600">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {organizationLevels.map((level) => {
              const external = level.href.startsWith("http");
              return (
                <article key={level.title} className="card p-6">
                  <h3 className="text-xl font-bold text-gt-navy">{level.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{level.description}</p>
                  <a
                    href={level.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="text-link mt-4 inline-block font-bold"
                  >
                    Learn more {external ? "↗" : "→"}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Founding executive board"
        title="The students preparing the chapter launch"
        description="Roles and descriptions are intentionally limited to approved public chapter information."
        className="bg-gt-cream"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {boardMembers.map((member) => (
            <BoardCard key={member.name} member={member} />
          ))}
        </div>
      </Section>

      <Section
        id="frequently-asked-questions"
        eyebrow="Frequently asked questions"
        title="Clear expectations for a chapter in formation"
        description="Details that have not been finalized are labeled honestly."
        className="bg-white"
      >
        <FAQList items={faqs} />
      </Section>
    </SitePage>
  );
}
