import type { ActionLink as ActionLinkData } from "@/lib/site-types";

type Variant = "featured" | "default";

function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="ml-auto shrink-0 text-base font-black text-gt-gold transition group-hover:translate-x-0.5 group-hover:text-gt-navy"
    >
      →
    </span>
  );
}

export function LinktreeButton({
  action,
  variant = "default",
}: {
  action: ActionLinkData;
  variant?: Variant;
}) {
  const isComingSoon = action.status === "coming-soon" || !action.href;
  const isExternal =
    Boolean(action.href) &&
    (action.href!.startsWith("http") || action.href!.startsWith("mailto:"));
  const isFeatured = variant === "featured";

  const shell = isFeatured
    ? "group flex w-full items-start gap-4 rounded-2xl bg-gt-navy px-5 py-4 text-left text-white shadow-lg shadow-gt-navy/25 transition hover:-translate-y-0.5 hover:bg-gt-navy-deep"
    : "group flex w-full items-start gap-4 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gt-gold/50 hover:shadow-md";

  if (isComingSoon) {
    return (
      <div
        aria-disabled="true"
        className="flex w-full items-start gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3.5 text-left opacity-90"
      >
        <span className="mt-1 h-8 w-1 shrink-0 rounded-full bg-gt-gold/50" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-slate-500">{action.label}</span>
          <span className="mt-1 inline-block rounded-md bg-gt-cream-deep px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gt-dark-gold">
            Coming soon
          </span>
          {action.description ? (
            <span className="mt-1.5 block text-sm leading-5 text-slate-500">
              {action.description}
            </span>
          ) : null}
        </span>
      </div>
    );
  }

  const body = (
    <>
      <span
        className={`mt-1 h-8 w-1 shrink-0 rounded-full ${isFeatured ? "bg-gt-gold" : "bg-gt-navy"}`}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span
          className={`block font-extrabold leading-snug ${isFeatured ? "text-white" : "text-gt-navy"}`}
        >
          {action.label}
        </span>
        {action.description ? (
          <span
            className={`mt-1 block text-sm leading-5 ${isFeatured ? "text-white/75" : "text-slate-600"}`}
          >
            {action.description}
          </span>
        ) : null}
      </span>
      <Arrow />
    </>
  );

  if (isExternal) {
    return (
      <a
        href={action.href}
        target={action.href!.startsWith("http") ? "_blank" : undefined}
        rel={action.href!.startsWith("http") ? "noopener noreferrer" : undefined}
        className={shell}
      >
        {body}
      </a>
    );
  }

  return (
    <a href={action.href} className={shell}>
      {body}
    </a>
  );
}
