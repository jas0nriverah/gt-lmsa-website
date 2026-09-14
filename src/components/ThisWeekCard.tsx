import type { ThisWeekItem } from "@/lib/site-types";

export function ThisWeekCard({ item }: { item: ThisWeekItem }) {
  const isExternal = item.sourceType === "external";
  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="eyebrow">{item.category}</span>
        <span
          className={
            isExternal
              ? "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
              : "rounded-full bg-gt-cream px-2.5 py-1 text-xs font-bold text-gt-dark-gold ring-1 ring-gt-gold/40"
          }
        >
          {item.badgeLabel}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-bold text-gt-navy">{item.title}</h3>
      <p className="mt-2 text-sm font-semibold text-slate-500">{item.organization}</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-bold text-gt-navy">Date:</dt>
          <dd className="text-slate-600">{item.displayDate}</dd>
        </div>
        {item.time ? (
          <div className="flex gap-2">
            <dt className="font-bold text-gt-navy">Time:</dt>
            <dd className="text-slate-600">{item.time}</dd>
          </div>
        ) : null}
        {item.location ? (
          <div className="flex gap-2">
            <dt className="font-bold text-gt-navy">Location:</dt>
            <dd className="text-slate-600">{item.location}</dd>
          </div>
        ) : null}
      </dl>
      <a
        href={item.href}
        className="button button-secondary mt-6 w-fit"
        {...(item.href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {isExternal ? (
          <>
            Details / register <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </>
        ) : (
          <>View details</>
        )}
      </a>
    </article>
  );
}
