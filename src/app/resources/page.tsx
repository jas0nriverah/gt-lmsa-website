import type { Metadata } from "next";
import Link from "next/link";
import { ResourceCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { resourceCategories } from "@/lib/sep-2026-refresh";
import { LAST_CONTENT_REVIEW } from "@/lib/source-registry";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Official Georgia Tech, LMSA, AAMC, AACOM, TMDSAS, research, and pre-health resources with status and verification notes.",
};

export default function ResourcesPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Resources"
        title="Start with official sources, then verify what has changed."
        description={`This directory was last content-reviewed ${LAST_CONTENT_REVIEW}. Time-sensitive pages, deadlines, prices, and eligibility can change without notice.`}
      />

      <Section
        eyebrow="Looking for funding?"
        title="Scholarships and enrichment live on Opportunities"
        description="Time-sensitive scholarships, fee assistance, research funding, and summer enrichment programs have moved to a dedicated page so this directory can stay focused on evergreen official links."
        className="bg-gt-cream"
      >
        <div className="rounded-3xl border border-gt-gold/40 bg-white p-6 sm:p-8">
          <p className="leading-7 text-slate-600">
            Browse open, upcoming, and recently closed cycles—and always confirm
            requirements on the official source before applying.
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
