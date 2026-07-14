import type { Metadata } from "next";
import { ActionLink } from "@/components/ActionLink";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { contactLinks, involvementActions } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "Follow LMSA Plus at Georgia Tech, contact the chapter, express interest in membership, service, mentorship, and collaboration.",
};

export default function GetInvolvedPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Get involved"
        title="There is room to help shape the founding year."
        description="Follow public updates, contact the chapter, and return as interest, mentorship, volunteer, and event forms are approved. Unfinished forms are visibly labeled and cannot collect information."
      />
      <Section
        eyebrow="Ways to participate"
        title="Choose the next step that fits you"
        description="Active actions work now. Coming Soon cards are intentionally not clickable."
        className="bg-gt-cream"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {involvementActions.map((action) => (
            <ActionLink key={action.label} action={action} />
          ))}
        </div>
      </Section>
      <Section
        eyebrow="Collaboration"
        title="Physicians, medical students, campus groups, and community organizations"
        description="The chapter welcomes thoughtful introductions. A message starts a review; it does not create a partnership, event, sponsorship, or speaker commitment."
        className="bg-white"
      >
        <div className="card max-w-3xl p-7 sm:p-8">
          <h3 className="text-2xl font-bold text-gt-navy">What to include in an introduction</h3>
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
          <h2 className="mt-3 text-3xl font-bold">Share only what the chapter needs.</h2>
          <p className="mt-4 max-w-3xl leading-8 text-white/75">
            Do not email medical records, patient information, student IDs, financial documents, passwords, or other sensitive personal data. The public website lists only the approved chapter email and chapter Instagram account.
          </p>
        </div>
      </section>
    </SitePage>
  );
}
