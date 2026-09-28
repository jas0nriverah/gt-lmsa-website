import type { Metadata } from "next";
import Link from "next/link";
import { ResourceDirectory } from "@/components/ResourceDirectory";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { resourceCategories } from "@/lib/sep-2026-refresh";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Explore official Georgia Tech advising, LMSA, medical school application, and research resources for your pre-health journey.",
};

export default function ResourcesPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Resources"
        title="Resources for your next step."
        description="Find advising, application guidance, research opportunities, and support from Georgia Tech and the LMSA network."
      />

      <Section
        eyebrow="Opportunities"
        title="Explore scholarships and enrichment"
        className="bg-gt-cream"
      >
        <div className="flex flex-col gap-5 rounded-xl border border-gt-gold/40 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="max-w-2xl leading-7 text-slate-600">
            Find scholarships, fee assistance, research funding, and summer programs on our Opportunities page.
          </p>
          <Link href="/opportunities" className="button button-primary shrink-0">
            Go to Opportunities <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>

      <Section
        eyebrow="Official resource directory"
        title="Start with sources you can trust."
        description="Search and filter official Georgia Tech, LMSA, and health-professions resources. For time-sensitive items, check current details with the source."
        className="bg-white"
      >
        <ResourceDirectory categories={resourceCategories} />
      </Section>
    </SitePage>
  );
}
