import type { OpenOpportunity } from "@/lib/open-opportunities";

export function OpenOpportunityCard({
  opportunity,
  compact = false,
}: {
  opportunity: OpenOpportunity;
  compact?: boolean;
}) {
  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${opportunity.requiresCampusConfirmation ? "bg-amber-50 text-amber-900 ring-amber-200" : "bg-emerald-50 text-emerald-800 ring-emerald-200"}`}>
          {opportunity.requiresCampusConfirmation ? "Verify campus nomination" : "Open now"}
        </span>
        <span className="eyebrow">{opportunity.category}</span>
      </div>
      <h3 className="mt-4 text-xl font-bold text-gt-navy">{opportunity.title}</h3>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        {opportunity.organization}
      </p>
      <p className="mt-4 text-sm font-semibold text-gt-navy">
        Who it’s for: <span className="font-normal text-slate-600">{opportunity.audience}</span>
      </p>
      <p className="mt-3 leading-7 text-slate-600">{opportunity.summary}</p>
      <p className="mt-4 rounded-lg bg-gt-cream px-4 py-3 text-sm font-bold text-gt-navy">
        Deadline: <span className="font-semibold">{opportunity.deadline}</span>
      </p>
      <div className="mt-5">
        <h4 className="font-bold text-gt-navy">Requirements</h4>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
          {(compact ? opportunity.eligibility.slice(0, 2) : opportunity.eligibility).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      {!compact ? (
        <div className="mt-5">
          <h4 className="font-bold text-gt-navy">What to prepare</h4>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            {opportunity.applicationChecklist.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="mt-auto pt-6">
        <a
          href={opportunity.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="button button-secondary w-fit"
        >
          Check official details <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        {opportunity.secondarySourceUrl ? (
          <a
            href={opportunity.secondarySourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link mt-4 block w-fit text-sm font-bold"
          >
            More eligibility and application info <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
