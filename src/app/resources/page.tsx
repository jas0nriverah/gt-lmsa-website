import type { Metadata } from "next";
import Link from "next/link";
import { ResourceCard } from "@/components/Cards";
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
        eyebrow="Looking for funding?"
        title="Explore scholarships and enrichment"
        className="bg-gt-cream"
      >
        <div className="rounded-3xl border border-gt-gold/40 bg-white p-6 sm:p-8">
          <p className="leading-7 text-slate-600">
            Find scholarships, fee assistance, research funding, and summer
            programs on our Opportunities page.
          </p>
          <Link href="/opportunities" className="button button-primary mt-5 inline-flex">
            Go to Opportunities
          </Link>
        </div>
      </Section>

      {resourceCategories.map((group, index) => (
        <Section
          key={group.category}
          eyebrow="Official resource directory"
          title={group.category}
          description={group.description}
          className={index % 2 === 0 ? "bg-white" : "bg-gt-cream"}
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {group.items.map((resource) => (
              <ResourceCard key={resource.href} resource={resource} />
            ))}
          </div>
        </Section>
      ))}
    </SitePage>
  );
}
