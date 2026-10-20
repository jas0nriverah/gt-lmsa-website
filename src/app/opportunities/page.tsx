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
import { OpenOpportunityCard } from "@/components/OpenOpportunityCard";
import {
  getOpenNowOpportunities,
  getNominationOpportunities,
  OPEN_OPPORTUNITIES_REVIEWED,
} from "@/lib/open-opportunities";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Scholarships, Summer 2027 internships and research, leadership, community service, and hospital volunteering for Georgia Tech pre-health students.",
};

export const dynamic = "force-dynamic";

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
  const openNow = getOpenNowOpportunities();
  const nominationChecks = getNominationOpportunities();
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
        id="open-now"
        eyebrow={`Reviewed ${OPEN_OPPORTUNITIES_REVIEWED}`}
        title={`Open now · ${openNow.length} opportunities`}
        description="Start with these currently accepting applications. Each listing includes the audience, requirements, materials to prepare, and deadline, with a link to the official program for full details."
        className="bg-white"
      >
        {openNow.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {openNow.map((opportunity) => (
              <OpenOpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-gt-gold/45 bg-gt-cream p-6 leading-7 text-slate-600">
            There are no dated opportunities currently listed as open. Browse the recurring resources and upcoming cycles below.
          </p>
        )}
        <a href="#opportunity-group-summer-2027-internships-and-research" className="text-link mt-7 inline-flex rounded-sm font-bold">
          Browse more internships, service, volunteering, and scholarship resources <span aria-hidden="true" className="ml-2">↓</span>
        </a>
      </Section>

      {nominationChecks.length > 0 ? <Section
        eyebrow={`Checked ${OPEN_OPPORTUNITIES_REVIEWED}`}
        title="Confirm Georgia Tech nomination availability"
        description="These national scholarship cycles are open, but they require institutional nomination. Georgia Tech’s current internal deadlines could not be verified, so these are excluded from the open count. Check with Prestigious Fellowships Advising before preparing an application."
        className="bg-white"
      >
        <a className="text-link mb-6 inline-flex font-bold" href="https://www.success.gatech.edu/prestigious-fellowships/" target="_blank" rel="noopener noreferrer">
          Georgia Tech Prestigious Fellowships Advising <span aria-hidden="true" className="ml-2">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <div className="grid gap-5 lg:grid-cols-2">
          {nominationChecks.map((opportunity) => (
            <OpenOpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      </Section> : null}

      <Section
        eyebrow="Funding and enrichment"
        title="Find opportunities that fit you"
        description={`Most scholarship listings were last reviewed ${LAST_CONTENT_REVIEW}; AAMC Fee Assistance and PURA Travel were rechecked October 20, and PURA Salary October 19. Confirm current eligibility and deadlines on each official program page before applying.`}
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
        description={`These directories and recurring resources were checked ${OPPORTUNITY_LINKS_REVIEWED}. Some point to applications that open later, while others help you find current positions and programs. Check the official source for availability and requirements.`}
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
