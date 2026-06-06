"use client";

import Image from "next/image";
import { useState } from "react";
import { contactLinks, navLinks } from "@/lib/site-data";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/90 backdrop-blur">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8"
        aria-label="Main navigation"
      >
        <a href="#home" className="flex items-center gap-3">
          <Image
            src="/lmsa-logo.png"
            alt="Latino Medical Student Association logo"
            width={44}
            height={44}
            className="rounded-full"
            priority
          />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gt-dark-gold">
              Georgia Tech
            </p>
            <p className="text-lg font-black leading-none text-gt-navy">LMSA</p>
          </div>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-700 transition hover:text-gt-navy"
            >
              {link.label}
            </a>
          ))}
          <a
            href={contactLinks.joinForm}
            className="rounded-full bg-gt-navy px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-900"
          >
            Join LMSA
          </a>
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-gt-navy lg:hidden"
        >
          <span className="sr-only">Open menu</span>
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
        </button>
      </nav>

      {isOpen ? (
        <div id="mobile-menu" className="border-t border-slate-100 bg-white px-6 py-4 lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-gt-cream hover:text-gt-navy"
              >
                {link.label}
              </a>
            ))}
            <a
              href={contactLinks.joinForm}
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-2xl bg-gt-navy px-4 py-3 text-center font-bold text-white"
            >
              Join LMSA
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
