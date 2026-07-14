import type { Metadata } from "next";
import { OpportunityCard, ResourceCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import {
  resourceCategories,
  scholarshipDisclaimer,
  scholarships,
} from "@/lib/site-data";
import { LAST_CONTENT_REVIEW } from "@/lib/source-registry";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Official Georgia Tech, LMSA, AAMC, AACOM, TMDSAS, research, scholarship, and pre-health resources with status and verification notes.",
};

export default function ResourcesPage() {
  const preHealthOpportunities = scholarships.filter((item) => item.preMedRelevant);
  const futureOpportunities = scholarships.filter((item) => !item.preMedRelevant);

  return (
    <SitePage>
      <PageHero
        eyebrow="Resources"
        title="Start with official sources, then verify what has changed."
        description={`This directory was last content-reviewed ${LAST_CONTENT_REVIEW}. Time-sensitive pages, deadlines, prices, and eligibility can change without notice.`}
      />

      <Section
        eyebrow="Opportunities"
        title="Scholarships, fee assistance, research funding, and enrichment"
        description={scholarshipDisclaimer}
        className="bg-gt-cream"
      >
        <div className="mb-8 rounded-3xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
          <h3 className="font-bold">Verify before you act</h3>
          <p className="mt-2 leading-7">
            A status reflects the last review date—not a guarantee. Use each official source to confirm current availability, eligibility, deadlines, award terms, and required memberships before spending money or submitting personal information.
          </p>
        </div>
        <h3 className="text-2xl font-bold text-gt-navy">Relevant before professional-school matriculation</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {preHealthOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.name} opportunity={opportunity} />
          ))}
        </div>
        <h3 className="mt-12 text-2xl font-bold text-gt-navy">Future opportunities after acceptance or matriculation</h3>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          These are included for long-term planning and are not current undergraduate funding options.
        </p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {futureOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.name} opportunity={opportunity} />
          ))}
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
