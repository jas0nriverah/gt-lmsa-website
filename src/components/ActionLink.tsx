import Link from "next/link";
import type { ReactNode } from "react";
import type { ActionLink as ActionLinkData } from "@/lib/site-types";

function ActionCardShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full min-h-[11rem] flex-col rounded-[1.75rem] p-6 transition duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function ActionLink({ action }: { action: ActionLinkData }) {
  const isComingSoon = action.status === "coming-soon" || !action.href;
  const isExternal =
    Boolean(action.href) &&
    (action.href!.startsWith("http") || action.href!.startsWith("mailto:"));

  if (isComingSoon) {
    return (
      <ActionCardShell className="border border-slate-200/90 bg-white/70 text-left shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gt-dark-gold/80">
            {action.category}
          </p>
          <span className="shrink-0 rounded-full bg-gt-cream px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-gt-dark-gold ring-1 ring-gt-gold/30">
            Coming soon
          </span>
        </div>
        <h3 className="mt-3 text-lg font-bold text-slate-500">{action.label}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
          {action.description}
        </p>
      </ActionCardShell>
    );
  }

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-xs font-bold uppercase tracking-[0.18em] ${
            action.featured ? "text-gt-gold" : "text-gt-dark-gold"
          }`}
        >
          {action.category}
        </p>
        <span
          aria-hidden="true"
          className={`text-lg font-bold ${
            action.featured ? "text-gt-gold" : "text-gt-navy"
          }`}
        >
          {isExternal && action.href!.startsWith("http") ? "↗" : "→"}
        </span>
      </div>
      <h3
        className={`mt-3 text-lg font-bold ${
          action.featured ? "text-white" : "text-gt-navy"
        }`}
      >
        {action.label}
      </h3>
      <p
        className={`mt-2 flex-1 text-sm leading-6 ${
          action.featured ? "text-white/75" : "text-slate-600"
        }`}
      >
        {action.description}
      </p>
    </>
  );

  const interactiveClasses = action.featured
    ? "border border-gt-navy bg-gt-navy shadow-lg shadow-gt-navy/20 hover:-translate-y-0.5 hover:bg-gt-navy-deep"
    : "border border-slate-200/90 bg-white shadow-sm hover:-translate-y-0.5 hover:border-gt-gold/50 hover:shadow-md";

  if (isExternal) {
    return (
      <a
        href={action.href}
        target={action.href!.startsWith("http") ? "_blank" : undefined}
        rel={action.href!.startsWith("http") ? "noopener noreferrer" : undefined}
        className="block h-full"
      >
        <ActionCardShell className={interactiveClasses}>{content}</ActionCardShell>
      </a>
    );
  }

  return (
    <Link href={action.href!} className="block h-full">
      <ActionCardShell className={interactiveClasses}>{content}</ActionCardShell>
    </Link>
  );
}
