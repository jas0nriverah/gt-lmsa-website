"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function HelpButton() {
  const pathname = usePathname();
  if (pathname === "/help") return null;

  return (
    <Link
      href="/help"
      aria-label="Get help and send feedback"
      className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full border border-gt-gold/50 bg-gt-navy px-4 py-2.5 font-bold text-white shadow-lg shadow-gt-navy/20 transition hover:bg-gt-navy-deep focus-visible:outline-offset-4 sm:bottom-7 sm:right-7 sm:px-5"
    >
      <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 text-lg leading-none">?</span>
      <span>Need help?</span>
    </Link>
  );
}
