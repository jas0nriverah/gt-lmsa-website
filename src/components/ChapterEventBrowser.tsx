"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Page, PlatformEvent } from "@/lib/platform-contracts";
import { formatEventTime, registrationState } from "@/lib/platform-dates";

type EventsResponse = {
  data?: Page<PlatformEvent>;
  error?: { message?: string };
};

export function ChapterEventBrowser({ configured }: { configured: boolean }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"upcoming" | "past">("upcoming");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page<PlatformEvent> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!configured) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          q: search,
          view,
          page: String(page),
          pageSize: "12",
        });
        const response = await fetch(`/api/platform/events?${params}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const payload = await response.json() as EventsResponse;

        if (!response.ok) {
          throw new Error(payload.error?.message ?? "Unable to load events.");
        }
        if (!payload.data) {
          throw new Error("The event service returned an unexpected response.");
        }
        setResult(payload.data);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Unable to load events.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [configured, search, view, page, revision]);

  if (!configured) {
    return (
      <div className="card p-8">
        <p className="eyebrow">First chapter gathering</p>
        <h3 className="mt-3 text-2xl font-bold text-gt-navy">Fall 2026 Interest Meeting</h3>
        <p className="mt-3">
          Thursday, October 15, 2026, from 6:30–7:30 PM EDT in Instructional Center (IC), Room 115.
        </p>
        <p className="mt-3 text-slate-600">
          Online RSVPs aren’t available yet. Check back for registration details.
        </p>
        <Link href="/join" className="button button-primary mt-5">
          Membership information →
        </Link>
      </div>
    );
  }

  return (
    <div aria-busy={loading}>
      <div className="mb-7 flex flex-wrap gap-4">
        <label className="flex-1 font-semibold">
          Search chapter events
          <input
            value={search}
            maxLength={100}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3"
            placeholder="Search by title or description"
          />
        </label>
        <label className="font-semibold">
          Show
          <select
            value={view}
            onChange={(event) => {
              setView(event.target.value as "upcoming" | "past");
              setPage(1);
            }}
            className="mt-2 block rounded-xl border border-slate-300 bg-white p-3"
          >
            <option value="upcoming">Upcoming &amp; planned</option>
            <option value="past">Past events</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p role="status">Loading chapter events…</p>
      ) : error ? (
        <div role="alert" className="card p-6">
          <p>{error}</p>
          <button
            type="button"
            className="button button-secondary mt-3"
            onClick={() => setRevision((current) => current + 1)}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {result?.items.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {result.items.map((event) => (
                <article id={event.id} key={event.id} className="card flex flex-col p-6">
                  <p className="eyebrow">{event.category}</p>
                  <h3 className="mt-3 text-xl font-bold text-gt-navy">{event.title}</h3>
                  <p className="mt-3 font-semibold">{formatEventTime(event)}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {event.location || "Location to be confirmed"}
                  </p>
                  <p className="mt-4 flex-1 line-clamp-3 leading-7 text-slate-600">
                    {event.description}
                  </p>
                  <p className="mt-4 text-sm font-bold text-gt-dark-gold">
                    {registrationState(event)}
                  </p>
                  <Link className="text-link mt-5 font-bold" href={`/events/${event.id}`}>
                    Event details &amp; RSVP →
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="card p-7">
              {search
                ? "No events match your search. Try another title or description."
                : view === "past"
                  ? "Completed chapter events will appear here."
                  : "New chapter dates will appear here when announced."}
            </p>
          )}

          {result && result.total > result.pageSize ? (
            <nav aria-label="Event pages" className="mt-6 flex items-center gap-4">
              <button
                type="button"
                className="button button-secondary"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {Math.ceil(result.total / result.pageSize)}
              </span>
              <button
                type="button"
                className="button button-secondary"
                disabled={page * result.pageSize >= result.total}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
