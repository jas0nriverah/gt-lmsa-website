"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { chapterInfo, navLinks } from "@/lib/site-data";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-6 py-3 sm:px-8"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-3 rounded-xl">
          <Image
            src="/lmsa-logo.png"
            alt=""
            width={48}
            height={48}
            className="rounded-full ring-1 ring-gt-gold/40"
            priority
          />
          <span className="leading-tight">
            <span className="block text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gt-dark-gold">
              Georgia Tech
            </span>
            <span className="block text-lg font-black text-gt-navy">LMSA Plus</span>
            <span className="sr-only">{chapterInfo.fullName}</span>
          </span>
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
                  active ? "text-gt-navy underline decoration-gt-gold decoration-2 underline-offset-8" : "text-slate-600 hover:text-gt-navy"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="button button-disabled text-sm" aria-disabled="true">
            Interest list coming soon
          </span>
        </div>

        <button
          ref={buttonRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={`${isOpen ? "Close" : "Open"} navigation menu`}
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 text-gt-navy hover:bg-gt-cream lg:hidden"
        >
          <span className="flex flex-col gap-1.5" aria-hidden="true">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
        </button>
      </nav>

      {isOpen ? (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white px-6 py-5 lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-gt-cream hover:text-gt-navy"
              >
                {link.label}
              </Link>
            ))}
            <span className="button button-disabled mt-3 justify-center" aria-disabled="true">
              Interest list coming soon
            </span>
          </div>
        </div>
      ) : null}
    </header>
  );
}
