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
  const comingSoon = involvementActions.filter(
    (action) => action.status === "coming-soon" || !action.href,
  );
  const featured = availableNow.filter((action) => action.featured);
  const secondary = availableNow.filter((action) => !action.featured);

  return (
    <SitePage>
      <PageHero
        eyebrow="Get involved"
        title="There is room to help shape the founding year."
        description="Complete the chapter interest form, follow public updates, contact the board, and return as mentorship, volunteer, and event forms are approved. Unfinished forms are visibly labeled and cannot collect information."
      />

      <Section
        eyebrow="Ways to participate"
        title="Choose the next step that fits you"
        description="Start with an open action below. Coming-soon items show progress without collecting information yet."
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

          {comingSoon.length ? (
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-gt-dark-gold">
                Coming soon
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {comingSoon.map((action) => (
                  <ActionLink key={action.label} action={action} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      <Section
        eyebrow="Community partners"
        title="Organizations we are already working with"
        description="These are confirmed partners. Additional collaborations are welcome and will be added after the board approves them."
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
              {partner.contactName ? (
                <p className="mt-1 text-sm text-slate-500">
                  Contact: {partner.contactName}
                </p>
              ) : null}
              <p className="mt-3 flex-1 leading-7 text-slate-600">
                {partner.description}
              </p>
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-secondary mt-5 self-start"
              >
                Visit partner site
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Collaboration"
        title="Physicians, medical students, campus groups, and community organizations"
        description="The chapter welcomes thoughtful introductions. A message starts a review; it does not create a partnership, event, sponsorship, or speaker commitment."
        className="bg-gt-cream"
      >
        <div className="card max-w-3xl p-7 sm:p-8">
          <h3 className="text-2xl font-bold text-gt-navy">
            What to include in an introduction
          </h3>
          <ul className="mt-5 grid gap-3 leading-7 text-slate-600 sm:grid-cols-2">
            <li>• Your organization and role</li>
            <li>• The proposed topic or activity</li>
            <li>• The intended student or community audience</li>
            <li>• A preferred timeline and any constraints</li>
          </ul>
          <a
            href={`mailto:${contactLinks.email}?subject=Collaboration%20with%20LMSA%20Plus%20at%20Georgia%20Tech`}
            className="button button-primary mt-7"
          >
            Email the chapter
          </a>
        </div>
      </Section>

      <section className="bg-gt-navy px-6 py-14 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow !text-gt-gold">Privacy note</p>
          <h2 className="mt-3 text-3xl font-bold">
            Share only what the chapter needs.
          </h2>
          <p className="mt-4 max-w-3xl leading-8 text-white/75">
            Do not email medical records, patient information, student IDs,
            financial documents, passwords, or other sensitive personal data.
            The public website lists only the approved chapter email and chapter
            Instagram account.
          </p>
        </div>
      </section>
    </SitePage>
  );
}
