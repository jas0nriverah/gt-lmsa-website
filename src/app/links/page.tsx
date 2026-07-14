import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ActionLink } from "@/components/ActionLink";
import { chapterInfo, contactLinks, linktreeLinks } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Quick Links",
  description:
    "Verified LMSA Plus at Georgia Tech chapter links, official pre-health resources, and honest coming-soon states.",
};

export default function LinksPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gt-cream px-5 py-10 text-ink sm:px-6">
      <section className="mx-auto max-w-xl" aria-labelledby="links-title">
        <div className="rounded-[2rem] border border-gt-gold/30 bg-white p-6 text-center shadow-xl shadow-gt-navy/10 sm:p-8">
          <Image
            src="/lmsa-logo.png"
            alt="Latino Medical Student Association logo"
            width={112}
            height={112}
            className="mx-auto rounded-full bg-white ring-1 ring-gt-gold/40"
            priority
          />
          <p className="eyebrow mt-5">Georgia Tech</p>
          <h1 id="links-title" className="mt-2 text-3xl font-black text-gt-navy">
            LMSA Plus Links
          </h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
            Verified chapter contact points, launch updates, and official pre-health resources.
          </p>
          <p className="mt-3 text-sm font-semibold text-gt-dark-gold">
            Founded {chapterInfo.foundingYear} · {chapterInfo.launchLabel}
          </p>
        </div>

        <h2 className="sr-only">Chapter and official resource links</h2>
        <div className="mt-6 grid gap-3">
          {linktreeLinks.map((action) => (
            <ActionLink key={action.label} action={action} />
          ))}
        </div>

        <p className="mt-7 text-center text-sm text-slate-600">
          Questions? Email{" "}
          <a href={`mailto:${contactLinks.email}`} className="text-link font-bold">
            {contactLinks.email}
          </a>
          .
        </p>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-link font-bold">Return to the main website</Link>
        </p>
      </section>
    </main>
  );
}
