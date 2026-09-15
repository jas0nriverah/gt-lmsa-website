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
        description="The founding chapter is designing programming that helps students build community, find guidance, serve, and explore health professions. Campus and community collaboration is available now; other programs are being planned."
      />
      <Section
        eyebrow="2026–2027 roadmap"
        title="Chapter programs and collaboration"
        description="Check each card for availability. Planned programs will open for participation after their details are confirmed."
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
