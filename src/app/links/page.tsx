import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LinktreeButton } from "@/components/LinktreeButton";
import {
  chapterInfo,
  contactLinks,
  linktreeLinks,
} from "@/lib/site-data";
import type { ActionLink } from "@/lib/site-types";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Quick links for LMSA Plus at Georgia Tech — Instagram, interest form, events, and official pre-health resources.",
};

const sections: { id: string; title: string; match: (link: ActionLink) => boolean }[] = [
  {
    id: "fall",
    title: "This fall",
    match: (link) =>
      link.category === "Events" || link.category === "Leadership",
  },
  {
    id: "explore",
    title: "Explore",
    match: (link) => link.category === "Resources",
  },
  {
    id: "connect",
    title: "Connect",
    match: (link) =>
      link.category === "Social" ||
      link.category === "Contact" ||
      link.category === "Community" ||
      link.category === "Feedback",
  },
  {
    id: "lmsa",
    title: "LMSA network",
    match: (link) => link.category === "LMSA",
  },
];

export default function LinksPage() {
  const featured = linktreeLinks.filter((link) => link.featured);
  const rest = linktreeLinks.filter((link) => !link.featured);

  const used = new Set<string>();
  const grouped = sections
    .map((section) => {
      const items = rest.filter((link) => {
        if (used.has(link.label)) return false;
        if (!section.match(link)) return false;
        used.add(link.label);
        return true;
      });
      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);

  // Any leftover links that didn't match a section
  const leftover = rest.filter((link) => !used.has(link.label));
  if (leftover.length > 0) {
    grouped.push({
      id: "more",
      title: "More",
      match: () => true,
      items: leftover,
    });
  }

  return (
    <main
      id="main-content"
      className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 sm:py-14"
    >
      {/* Soft GT atmosphere — cream grid + navy glow, not a dark Linktree clone */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gt-cream"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 48, 87, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 48, 87, 0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 -z-10 h-72 w-72 rounded-full bg-gt-navy/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-40 -z-10 h-64 w-64 rounded-full bg-gt-gold/25 blur-3xl"
      />

      <section className="mx-auto max-w-md" aria-labelledby="links-title">
        <header className="overflow-hidden rounded-[1.75rem] bg-gt-navy px-6 pb-7 pt-8 text-center text-white shadow-xl shadow-gt-navy/20">
          <div className="mx-auto flex h-[7.25rem] w-[7.25rem] items-center justify-center rounded-[1.75rem] border border-gt-gold/45 bg-white/5 p-3">
            <Image
              src="/lmsa-logo.png"
              alt="Latino Medical Student Association logo"
              width={104}
              height={104}
              className="rounded-full bg-white shadow-lg"
              priority
            />
          </div>
          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-gt-gold">
            {chapterInfo.campusName} · LMSA Plus
          </p>
          <h1
            id="links-title"
            className="mt-2 font-display text-2xl font-black tracking-tight sm:text-[1.7rem]"
          >
            {chapterInfo.shortName}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/75">
            Mentorship, community, and pre-health support for Latino/Hispanic
            and underrepresented students.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <a
              href={contactLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            >
              {contactLinks.instagramHandle}
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-gt-gold/40 bg-gt-gold/15 px-3.5 py-2 text-sm font-bold text-gt-gold transition hover:bg-gt-gold/25"
            >
              Full website
            </Link>
          </div>
        </header>

        {featured.length > 0 ? (
          <div className="mt-7 grid gap-3">
            {featured.map((action) => (
              <LinktreeButton
                key={action.label}
                action={action}
                variant="featured"
              />
            ))}
          </div>
        ) : null}

        <div className="mt-8 space-y-7">
          {grouped.map((section) => (
            <section key={section.id} aria-labelledby={`links-${section.id}`}>
              <h2
                id={`links-${section.id}`}
                className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-gt-dark-gold"
              >
                {section.title}
              </h2>
              <div className="grid gap-2.5">
                {section.items.map((action) => (
                  <LinktreeButton key={action.label} action={action} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-600">
          Questions?{" "}
          <a
            href={`mailto:${contactLinks.email}`}
            className="font-bold text-gt-navy underline decoration-gt-gold/50 underline-offset-4 hover:text-gt-dark-gold"
          >
            {contactLinks.email}
          </a>
        </p>
      </section>
    </main>
  );
}
