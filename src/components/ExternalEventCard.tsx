import type { ExternalEvent } from "@/lib/site-types";

const verificationLabels: Record<ExternalEvent["verificationLevel"], string> = {
  "official-calendar": "Official campus calendar",
  "official-page": "Official page",
  "verified-secondary": "Verified listing",
};

export function ExternalEventCard({ event }: { event: ExternalEvent }) {
  return (
    <article id={event.id} className="card flex h-full flex-col p-6 scroll-mt-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="eyebrow">{event.category}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
          Recommended · external
        </span>
      </div>
      <h3 className="mt-4 text-xl font-bold text-gt-navy">{event.title}</h3>
      <p className="mt-2 text-sm font-semibold text-slate-500">{event.organization}</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-bold text-gt-navy">Date:</dt>
          <dd className="text-slate-600">{event.displayDate}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-bold text-gt-navy">Time:</dt>
          <dd className="text-slate-600">{event.time ?? "See official source"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-bold text-gt-navy">Location:</dt>
          <dd className="text-slate-600">
            {event.location ?? "See official source"}
          </dd>
        </div>
      </dl>
      <p className="mt-4 flex-1 leading-7 text-slate-600">{event.description}</p>
      <p className="mt-4 text-xs font-semibold text-slate-500">
        {verificationLabels[event.verificationLevel]} · Last checked{" "}
        {event.lastCheckedAt}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        {event.registrationUrl ? (
          <a
            className="button button-primary"
            href={event.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Register <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
        <a
          className="button button-secondary"
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Official source <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
