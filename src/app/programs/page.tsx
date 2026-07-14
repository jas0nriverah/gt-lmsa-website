import type { Metadata } from "next";
import { ProgramCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { programs } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore planned mentorship, education, service, culture, research, and professional-development programming for LMSA Plus at Georgia Tech.",
};

export default function ProgramsPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Programs"
        title="A practical roadmap for the pre-health journey."
        description="The founding chapter is designing programming that helps students build community, find reliable guidance, serve thoughtfully, and explore health professions. Every item below remains planned until formally activated."
      />
      <Section
        eyebrow="2026–2027 roadmap"
        title="Planned chapter programming"
        description="Program status is maintained in one editable content file so officers can publish only what has been confirmed."
        className="bg-gt-cream"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.title} program={program} />
          ))}
        </div>
      </Section>
      <section className="bg-white px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-gt-gold/40 bg-gt-cream p-7 sm:p-10">
          <p className="eyebrow">Important boundaries</p>
          <h2 className="mt-3 text-3xl font-bold text-gt-navy">Education and community—not professional advice.</h2>
          <p className="mt-4 max-w-4xl leading-8 text-slate-600">
            Chapter programming does not replace Georgia Tech academic advising, medical care, legal guidance, language-interpreter certification, or the current rules of an application service. Students should verify decisions with the responsible official office or organization.
          </p>
        </div>
      </section>
    </SitePage>
  );
}
