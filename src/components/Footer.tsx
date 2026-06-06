import Image from "next/image";
import { contactLinks, navLinks } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="bg-gt-navy px-6 py-12 text-white sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/lmsa-logo.png"
              alt="Latino Medical Student Association logo"
              width={52}
              height={52}
              className="rounded-full bg-white"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-gt-gold">
                Georgia Tech Chapter
              </p>
              <p className="text-xl font-black">LMSA</p>
            </div>
          </div>
          <p className="mt-5 max-w-md leading-7 text-white/75">
            Supporting Latino/a/e and underrepresented pre-health students
            through mentorship, community, service, and professional growth.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-gt-gold">
            Quick Links
          </h2>
          <div className="mt-4 grid gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/75 transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-gt-gold">
            Contact
          </h2>
          <div className="mt-4 grid gap-3 text-white/75">
            <a href={`mailto:${contactLinks.email}`} className="hover:text-white">
              {contactLinks.email}
            </a>
            <a href={contactLinks.instagram} className="hover:text-white">
              Instagram
            </a>
            <a href={contactLinks.joinForm} className="hover:text-white">
              Join form
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/15 pt-6 text-sm text-white/60">
        <p>
          (c) {new Date().getFullYear()} Georgia Tech LMSA. Built for student
          community, mentorship, and service.
        </p>
      </div>
    </footer>
  );
}
