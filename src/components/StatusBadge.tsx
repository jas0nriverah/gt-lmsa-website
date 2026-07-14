import type {
  ContentStatus,
  OpportunityStatus,
} from "@/lib/site-types";

const styles: Record<string, string> = {
  planned: "bg-blue-50 text-blue-800 ring-blue-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  past: "bg-slate-100 text-slate-700 ring-slate-200",
  available: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  open: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  upcoming: "bg-blue-50 text-blue-800 ring-blue-200",
  recurring: "bg-violet-50 text-violet-800 ring-violet-200",
  closed: "bg-slate-100 text-slate-700 ring-slate-200",
  "verify-current-cycle": "bg-amber-50 text-amber-800 ring-amber-200",
};

export function StatusBadge({
  status,
  label,
}: {
  status: ContentStatus | OpportunityStatus | "available";
  label?: string;
}) {
  const fallback = status.replaceAll("-", " ");
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${styles[status] ?? styles.past}`}
    >
      {label ?? fallback}
    </span>
  );
}
