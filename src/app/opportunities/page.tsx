import type { Metadata } from "next";
import { OpportunityCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { scholarshipDisclaimer } from "@/lib/site-data";
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
        title="Scholarships, fee assistance, research funding, and enrichment."
        description={`Last content-reviewed ${LAST_CONTENT_REVIEW}. Statuses reflect the last review date—not a guarantee. Always confirm current availability on the official source.`}
      />

      <Section
        eyebrow="Time-sensitive"
        title="Verify before you apply"
        description={scholarshipDisclaimer}
        className="bg-gt-cream"
      >
        <div className="mb-8 rounded-3xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
          <h3 className="font-bold">Verify before you act</h3>
          <p className="mt-2 leading-7">
            A status reflects the last review date—not a guarantee. Use each official source to confirm current availability, eligibility, deadlines, award terms, and required memberships before spending money or submitting personal information.
          </p>
        </div>

        <h3 className="text-2xl font-bold text-gt-navy">
          Relevant before professional-school matriculation
        </h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {preHealthOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.name} opportunity={opportunity} />
          ))}
        </div>

        <h3 className="mt-12 text-2xl font-bold text-gt-navy">
          Future opportunities after acceptance or matriculation
        </h3>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          These are included for long-term planning and are not current undergraduate funding options.
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
