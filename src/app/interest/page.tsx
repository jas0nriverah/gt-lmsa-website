import type { Metadata } from "next";
import { InterestForm } from "@/components/InterestForm";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { contactLinks } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Chapter Interest Form",
  description:
    "Express interest in LMSA Plus at Georgia Tech membership, mentorship, service, events, resources, and chapter-building.",
};

export default function InterestPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Chapter interest form"
        title="Stay connected as the founding year takes shape."
        description="Tell the board what would be useful to you. This privacy-minimal form does not save responses on the website or send information to a third-party form provider."
      />
      <Section
        eyebrow="Express interest"
        title="Prepare a message to the chapter"
        description="Submitting opens your email app with a message addressed to the approved chapter account. Review the message and press Send to complete the process."
        className="bg-gt-cream"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.5fr)] lg:items-start">
          <InterestForm />
          <aside className="card p-6" aria-labelledby="before-you-submit">
            <h3 id="before-you-submit" className="text-xl font-bold text-gt-navy">
              Before you submit
            </h3>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
              <li>• This is an expression of interest, not confirmed membership.</li>
              <li>• No dues or local benefits have been announced.</li>
              <li>• Program and event details remain planned until confirmed.</li>
              <li>• Do not include medical, financial, identification, or other sensitive records.</li>
            </ul>
            <p className="mt-5 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">
              If your email app does not open, contact{" "}
              <a href={`mailto:${contactLinks.email}`} className="text-link font-bold">
                {contactLinks.email}
              </a>
              .
            </p>
          </aside>
        </div>
      </Section>
    </SitePage>
  );
}
