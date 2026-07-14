import Link from "next/link";
import type { ActionLink as ActionLinkData } from "@/lib/site-types";

export function ActionLink({ action }: { action: ActionLinkData }) {
  const classes = action.featured
    ? "button button-primary"
    : "button button-secondary";

  if (action.status === "coming-soon" || !action.href) {
    return (
      <div className="card flex h-full flex-col p-5 text-left">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-bold text-slate-600">{action.label}</h3>
          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
            Coming soon
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {action.description}
        </p>
      </div>
    );
  }

  const isExternal =
    action.href.startsWith("http") || action.href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a
        href={action.href}
        target={action.href.startsWith("http") ? "_blank" : undefined}
        rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={`${classes} justify-between`}
      >
        <span>
          <span className="block">{action.label}</span>
          <span className="mt-1 block text-sm font-normal opacity-80">
            {action.description}
          </span>
        </span>
        <span aria-hidden="true">{action.href.startsWith("http") ? "↗" : "→"}</span>
      </a>
    );
  }

  return (
    <Link href={action.href} className={`${classes} justify-between`}>
      <span>
        <span className="block">{action.label}</span>
        <span className="mt-1 block text-sm font-normal opacity-80">
          {action.description}
        </span>
      </span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
