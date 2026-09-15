import type { Metadata } from "next";
import { InterestForm } from "@/components/InterestForm";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SitePage } from "@/components/SitePage";
import { contactLinks } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Express Interest",
  description:
    "Prepare an email to express interest in LMSA Plus at Georgia Tech. Nothing is sent or saved until you choose to send it.",
};

export default function InterestPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Express interest"
        title="Tell us you’re interested."
        description="Complete this short form to prepare an email to the chapter. Nothing is sent or saved until you choose to send it."
      />
      <Section
        eyebrow="Email the chapter"
        title="Prepare your interest email"
        description="Review the message, then open your email app or copy it into webmail. Your information is not saved on this site."
        className="bg-gt-cream"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.5fr)] lg:items-start">
          <InterestForm />
          <aside className="card p-6" aria-labelledby="before-you-submit">
            <h3 id="before-you-submit" className="text-xl font-bold text-gt-navy">
              What to expect
            </h3>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
              <li>• Meeting announcements and chapter opportunities.</li>
              <li>• Optional interests help the board plan useful programs.</li>
              <li>• Joining this list does not confirm chapter membership.</li>
            </ul>
            <p className="mt-5 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">
              Questions? Email{" "}
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
