import type { Metadata } from "next";
import Link from "next/link";
import { HelpRequestForm } from "@/components/HelpRequestForm";
import { PageHero } from "@/components/PageHero";
import { SitePage } from "@/components/SitePage";
import { contactLinks } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Help & feedback",
  description: "Get help with joining LMSA+ at Georgia Tech, event information, or the chapter website.",
};

export default function HelpPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Help & feedback"
        title="How can we help?"
        description="Questions about joining, an event, or the website? Send a note to the chapter."
      />
      <section className="section-shell bg-gt-cream">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <aside className="card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gt-navy">Quick links</h2>
            <div className="mt-5 grid gap-4">
              <Link className="text-link font-bold" href="/events">Event details and RSVP →</Link>
              <Link className="text-link font-bold" href="/join">Join the chapter →</Link>
              <a className="text-link break-all font-bold" href={`mailto:${contactLinks.email}`}>
                Email {contactLinks.email}
              </a>
            </div>
          </aside>
          <HelpRequestForm />
        </div>
      </section>
    </SitePage>
  );
}
