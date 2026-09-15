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
        description="The founding chapter is planning mentorship, education, service, culture, and health-professions programming for Georgia Tech students. Details will be shared as programs are confirmed."
      />
      <Section
        eyebrow="2026–2027 roadmap"
        title="Chapter programs and collaboration"
        description="Cards marked planned are not yet scheduled; available programs are ready to explore."
        className="bg-gt-cream"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.title} program={program} />
          ))}
        </div>
      </Section>
    </SitePage>
  );
}
