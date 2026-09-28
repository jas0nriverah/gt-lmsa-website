"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { chapterInfo } from "@/lib/site-data";
import { memberNavLinks, navLinks } from "@/lib/nav-links";

function isCurrentPage(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

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

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-md">
          <Image
            src="/lmsa-logo.png"
            alt=""
            width={42}
            height={42}
            className="rounded-full ring-1 ring-gt-gold/40"
            priority
          />
          <span className="leading-tight">
            <span className="block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gt-dark-gold sm:text-[0.68rem]">
              Georgia Tech
            </span>
            <span className="block text-base font-black text-gt-navy sm:text-lg">LMSA PLUS</span>
            <span className="sr-only">{chapterInfo.fullName}</span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((link) => {
            const active = isCurrentPage(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-2 py-2 text-[0.78rem] font-semibold transition-colors 2xl:px-2.5 2xl:text-sm ${
                  active
                    ? "text-gt-navy underline decoration-gt-gold decoration-2 underline-offset-[0.65rem]"
                    : "text-slate-600 hover:text-gt-navy"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            href="/member"
            aria-current={isCurrentPage(pathname, "/member") ? "page" : undefined}
            className="rounded-md px-2 py-2 text-sm font-bold text-gt-navy underline decoration-gt-gold/70 underline-offset-4 hover:text-gt-dark-gold"
          >
            My membership
          </Link>
          <Link
            href="/join"
            aria-current={isCurrentPage(pathname, "/join") ? "page" : undefined}
            className="button button-primary min-h-10 px-4 py-2 text-sm"
          >
            Join LMSA+
          </Link>
        </div>

        <button
          ref={buttonRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={`${isOpen ? "Close" : "Open"} navigation menu`}
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-300 text-gt-navy hover:bg-gt-cream xl:hidden"
        >
          <span className="flex flex-col gap-1.5" aria-hidden="true">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
        </button>
      </nav>

      <div
        id="mobile-menu"
        hidden={!isOpen}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 sm:px-6 xl:hidden"
      >
        <div className="mx-auto grid max-w-7xl gap-1">
          {navLinks.map((link) => {
            const active = isCurrentPage(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setIsOpen(false)}
                className={`rounded-md px-4 py-3 font-semibold ${
                  active ? "bg-gt-cream text-gt-navy" : "text-slate-700 hover:bg-gt-cream hover:text-gt-navy"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-3 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-2">
            {memberNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrentPage(pathname, link.href) ? "page" : undefined}
                onClick={() => setIsOpen(false)}
                className={link.href === "/join" ? "button button-primary justify-center" : "button button-secondary justify-center"}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/interest" onClick={() => setIsOpen(false)} className="text-link rounded-sm px-4 py-3 text-center font-bold sm:col-span-2">
              Express interest
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
