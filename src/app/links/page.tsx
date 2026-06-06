import type { Metadata } from "next";
import Image from "next/image";
import { chapterInfo, contactLinks, linktreeLinks } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Quick links for the LMSA Plus Chapter at Georgia Tech, including Instagram, email, resources, and coming-soon forms.",
};

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-gt-cream px-5 py-10 text-ink sm:px-6">
      <section className="mx-auto max-w-xl">
        <div className="rounded-[2rem] border border-gt-gold/25 bg-white p-6 text-center shadow-xl shadow-gt-navy/10 sm:p-8">
          <Image
            src="/lmsa-logo.png"
            alt="Latino Medical Student Association logo"
            width={112}
            height={112}
            className="mx-auto rounded-full ring-1 ring-gt-gold/40"
            priority
          />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-gt-dark-gold">
            Georgia Tech
          </p>
          <h1 className="mt-2 text-3xl font-black text-gt-navy">
            LMSA Plus Links
          </h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
            Quick access to {chapterInfo.shortName} contact links, chapter
            updates, and official pre-health resources.
          </p>
          <p className="mt-3 text-sm font-semibold text-gt-dark-gold">
            Founded in {chapterInfo.foundingYear} ·{" "}
            {chapterInfo.recognitionStatus}
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          {linktreeLinks.map((link) => {
            const isExternal =
              link.href.startsWith("http") || link.href.startsWith("mailto:");
            const isComingSoon = Boolean(link.comingSoon);

            return (
              <a
                key={link.label}
                href={link.href}
                target={isExternal && !isComingSoon ? "_blank" : undefined}
                rel={isExternal && !isComingSoon ? "noopener noreferrer" : undefined}
                aria-disabled={isComingSoon}
                className={`rounded-2xl border p-5 shadow-sm transition ${
                  isComingSoon
                    ? "border-slate-200 bg-white/70 text-slate-500"
                    : "border-slate-200 bg-white text-gt-navy hover:-translate-y-0.5 hover:border-gt-gold hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold">{link.label}</span>
                  {isComingSoon ? (
                    <span className="rounded-full bg-gt-cream px-3 py-1 text-xs font-bold uppercase tracking-wide text-gt-dark-gold">
                      Coming soon
                    </span>
                  ) : (
                    <span aria-hidden="true" className="font-bold text-gt-dark-gold">
                      &rarr;
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {link.description}
                </p>
              </a>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Questions? Email{" "}
          <a
            href={`mailto:${contactLinks.email}`}
            className="font-bold text-gt-dark-gold underline decoration-gt-gold/40 underline-offset-4 hover:text-gt-navy"
          >
            {contactLinks.email}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
