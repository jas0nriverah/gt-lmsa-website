"use client";
import Link from "next/link";
export default function EventError({reset}:{reset:()=>void}) { return <main id="main-content" className="mx-auto max-w-3xl px-6 py-24"><h1 className="text-3xl font-bold text-gt-navy">We couldn’t load this event.</h1><p className="my-5">Event services may be temporarily unavailable. No registration has been made.</p><button className="button button-primary" onClick={reset}>Try again</button><Link className="text-link ml-5" href="/events">Back to events</Link></main>; }
