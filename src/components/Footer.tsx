import Image from "next/image";
import { contactLinks, creatorCredit, navLinks } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="relative bg-gt-navy text-white">
      {/* Gold accent bar across the very top of the footer. */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gt-gold via-gt-dark-gold to-gt-gold" />

      <div className="px-6 py-14 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/lmsa-logo.png"
                alt="Latino Medical Student Association logo"
                width={56}
                height={56}
                className="rounded-full bg-white p-0.5 ring-1 ring-gt-gold/40"
              />
              <div className="leading-tight">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gt-gold">
                  Georgia Tech Chapter
                </p>
                <p className="text-xl font-black">LMSA</p>
              </div>
            </div>
            <p className="mt-5 max-w-md leading-7 text-white/70">
              The Latino Medical Student Association at Georgia Tech supports
              Latino/a/e and underrepresented pre-health students through
              mentorship, preparation, service, and community.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-gt-gold">
              Explore
            </h2>
            <div className="mt-4 grid gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="w-fit text-white/70 transition hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-gt-gold">
              Connect
            </h2>
            <div className="mt-4 grid gap-3 text-white/70">
              <a
                href={`mailto:${contactLinks.email}`}
                className="w-fit transition hover:text-white"
              >
                {contactLinks.email}
              </a>
              <a
                href={contactLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit transition hover:text-white"
              >
                Instagram {contactLinks.instagramHandle}
              </a>
              <a
                href={contactLinks.joinForm}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit transition hover:text-white"
              >
                Join our interest form
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-2 border-t border-white/15 pt-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Georgia Tech LMSA. Built by
            students, for students.
          </p>
          <p>Comunidad &middot; Mentorship &middot; Medicine</p>
        </div>

        <p className="mx-auto mt-4 max-w-6xl text-center text-xs text-white/35">
          Built by{" "}
          <a
            href={creatorCredit.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/20 underline-offset-2 transition hover:text-white/60 hover:decoration-white/50"
          >
            {creatorCredit.name}
          </a>
          <span aria-hidden="true" className="mx-1.5">
            &middot;
          </span>
          <a
            href={creatorCredit.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/20 underline-offset-2 transition hover:text-white/60 hover:decoration-white/50"
          >
            LinkedIn
          </a>
          <span aria-hidden="true" className="mx-1.5">
            &middot;
          </span>
          <a
            href={creatorCredit.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/20 underline-offset-2 transition hover:text-white/60 hover:decoration-white/50"
          >
            Instagram
          </a>
        </p>
      </div>
    </footer>
  );
}
