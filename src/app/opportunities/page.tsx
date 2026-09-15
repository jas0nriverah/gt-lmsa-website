import type { Metadata } from "next";
import { OpportunityCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { scholarships } from "@/lib/stale-status-sep-14";
import type { OpportunityStatus, ScholarshipOpportunity } from "@/lib/site-types";
import { LAST_CONTENT_REVIEW } from "@/lib/source-registry";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Time-sensitive scholarships, fee assistance, research funding, and enrichment programs for LMSA Plus at Georgia Tech members and pre-health students.",
};

const STATUS_SORT_ORDER: Record<OpportunityStatus, number> = {
  open: 0,
  upcoming: 1,
  recurring: 2,
  "verify-current-cycle": 3,
  closed: 4,
};

function sortOpportunities(items: ScholarshipOpportunity[]) {
  return [...items].sort(
    (a, b) => STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status],
  );
}

export default function OpportunitiesPage() {
  const preHealthOpportunities = sortOpportunities(
    scholarships.filter((item) => item.preMedRelevant),
  );
  const futureOpportunities = sortOpportunities(
    scholarships.filter((item) => !item.preMedRelevant),
  );

  return (
    <SitePage>
      <PageHero
        eyebrow="Opportunities"
        title="Support your pre-health journey."
        description="Explore scholarships, fee assistance, research funding, and enrichment programs for your next step."
      />

      <Section
        eyebrow="Funding and enrichment"
        title="Find opportunities that fit you"
        description={`Last reviewed ${LAST_CONTENT_REVIEW}. Confirm current eligibility and deadlines on each program’s official website before applying.`}
        className="bg-gt-cream"
      >
        <h3 className="text-2xl font-bold text-gt-navy">
          For undergraduate and pre-health students
        </h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {preHealthOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.name} opportunity={opportunity} />
          ))}
        </div>

        <h3 className="mt-12 text-2xl font-bold text-gt-navy">
          After professional-school acceptance or enrollment
        </h3>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          Keep these in mind for a later stage of your journey. They require
          professional-school acceptance or enrollment and are not current
          undergraduate funding options.
        </p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {futureOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.name} opportunity={opportunity} />
          ))}
        </div>
      </Section>
    </SitePage>
  );
}
