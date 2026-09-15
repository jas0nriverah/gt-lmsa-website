import type { Metadata } from "next";
import Image from "next/image";
import { ActionLink } from "@/components/ActionLink";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { contactLinks, involvementActions, partners } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "Follow LMSA Plus at Georgia Tech, contact the chapter, express interest in membership, service, mentorship, and collaboration.",
};

export default function GetInvolvedPage() {
  const availableNow = involvementActions.filter(
    (action) => action.status === "active" && Boolean(action.href),
  );
  const featured = availableNow.filter((action) => action.featured);
  const secondary = availableNow.filter((action) => !action.featured);

  return (
    <SitePage>
      <PageHero
        eyebrow="Get involved"
        title="Find your place in our community."
        description="Express your interest, connect with the chapter, and help shape our founding year at Georgia Tech. Students of all backgrounds are welcome."
      />

      <Section
        eyebrow="Ways to participate"
        title="Choose the next step that fits you"
        description="Interested in joining, taking on a leadership role, or staying connected? Start here."
        className="bg-gt-cream"
      >
        <div className="grid gap-8">
          {featured.length ? (
            <div className="grid gap-5">
              {featured.map((action) => (
                <ActionLink key={action.label} action={action} />
              ))}
            </div>
          ) : null}

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-gt-dark-gold">
              Available now
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {secondary.map((action) => (
                <ActionLink key={action.label} action={action} />
              ))}
            </div>
          </div>

        </div>
      </Section>

      <Section
        eyebrow="Community partners"
        title="Our community partners"
        description="Meet the organizations working with our chapter to connect students with mentorship, service, and community."
        className="bg-white"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {partners.map((partner) => (
            <article key={partner.name} className="card flex h-full flex-col p-6">
              <p className="text-sm font-bold tracking-wide text-gt-dark-gold">
                {partner.focus}
              </p>
              <div className="mt-3 flex items-start gap-3">
                {partner.logo ? (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5">
                    <Image
                      src={partner.logo.src}
                      alt={partner.logo.alt}
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gt-navy">
                    {partner.shortName ?? partner.name}
                  </h3>
                  {partner.shortName && partner.shortName !== partner.name ? (
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {partner.name}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 flex-1 leading-7 text-slate-600">
                {partner.description}
              </p>
              {partner.href ? (
                <a
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-secondary mt-5 self-start"
                >
                  Visit partner site
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Collaboration"
        title="Connect with our chapter"
        description="We welcome physicians, medical students, campus groups, and community organizations interested in supporting our students."
        className="bg-gt-cream"
      >
        <div className="card max-w-3xl p-7 sm:p-8">
          <p className="leading-7 text-slate-600">
            Have an idea for mentorship, a workshop, or a service project?
            Introduce yourself and tell us how you would like to get involved.
          </p>
          <a
            href={`mailto:${contactLinks.email}?subject=Collaboration%20with%20LMSA%20Plus%20at%20Georgia%20Tech`}
            className="button button-primary mt-7"
          >
            Email the chapter
          </a>
        </div>
      </Section>

    </SitePage>
  );
}
