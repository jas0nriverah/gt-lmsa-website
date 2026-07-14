import Image from "next/image";
import Link from "next/link";
import {
  chapterInfo,
  contactLinks,
  creatorCredit,
  navLinks,
} from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="bg-gt-navy text-white">
      <div className="h-1.5 bg-gt-gold" />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/lmsa-logo.png"
              alt=""
              width={56}
              height={56}
              className="rounded-full bg-white ring-1 ring-gt-gold"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gt-gold">
                Georgia Tech
              </p>
              <p className="text-xl font-black">LMSA Plus</p>
            </div>
          </div>
          <p className="mt-5 max-w-md leading-7 text-white/75">
            {chapterInfo.description}
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
            A registered student organization at Georgia Tech and an LMSA PLUS
            chapter. Registration does not constitute Georgia Tech endorsement
            of every statement or activity.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-gt-gold">
            Explore
          </h2>
          <div className="mt-4 grid gap-3">
            <Link href="/" className="footer-link">Home</Link>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
            <Link href="/links" className="footer-link">Quick links</Link>
            <Link href="/interest" className="footer-link">Chapter interest form</Link>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-gt-gold">
            Connect
          </h2>
          <div className="mt-4 grid gap-3">
            <a href={`mailto:${contactLinks.email}`} className="footer-link">
              {contactLinks.email}
            </a>
            <a
              href={contactLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Instagram {contactLinks.instagramHandle}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href="https://national.lmsa.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              LMSA National <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://southeast.lmsa.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              LMSA Southeast <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 px-6 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LMSA Plus at Georgia Tech.</p>
          <p>
            Built by{" "}
            <a
              href={creatorCredit.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded font-semibold text-white underline decoration-gt-gold underline-offset-4"
            >
              {creatorCredit.name}
              <span className="sr-only"> on LinkedIn (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
