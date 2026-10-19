import type { Metadata } from "next";
import { OpportunityCard, ResourceCard } from "@/components/Cards";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { scholarships } from "@/lib/stale-status-sep-14";
import {
  nearTermOpportunityCategories,
  OPPORTUNITY_LINKS_REVIEWED,
} from "@/lib/near-term-opportunities";
import type { OpportunityStatus, ScholarshipOpportunity } from "@/lib/site-types";
import { LAST_CONTENT_REVIEW } from "@/lib/source-registry";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Scholarships, Summer 2027 internships and research, leadership, community service, and hospital volunteering for Georgia Tech pre-health students.",
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
        description="Explore scholarships, Summer 2027 research and internships, leadership, community service, and hospital volunteering."
      />

      <Section
        eyebrow="Funding and enrichment"
        title="Find opportunities that fit you"
        description={`Most scholarship listings were last reviewed ${LAST_CONTENT_REVIEW}; PURA Salary was rechecked October 19. Confirm current eligibility and deadlines on each official program page before applying.`}
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

      <Section
        eyebrow="Summer 2027 and beyond"
        title="Find your next opportunity"
        description={`These links were checked ${OPPORTUNITY_LINKS_REVIEWED}. Some Summer 2027 applications are open now; others open soon. Confirm eligibility, deadlines, and availability with each official program.`}
        className="bg-white"
      >
        <div className="space-y-14">
          {nearTermOpportunityCategories.map((group) => (
            <section
              key={group.category}
              aria-labelledby={opportunityGroupId(group.category)}
            >
              <div className="mb-6 max-w-3xl">
                <h3
                  id={opportunityGroupId(group.category)}
                  className="text-2xl font-bold text-gt-navy"
                >
                  {group.category}
                </h3>
                <p className="mt-2 leading-7 text-slate-600">{group.description}</p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {group.items.map((resource) => (
                  <ResourceCard key={resource.href} resource={resource} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>
    </SitePage>
  );
}

function opportunityGroupId(value: string) {
  const slug = value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `opportunity-group-${slug}`;
}
