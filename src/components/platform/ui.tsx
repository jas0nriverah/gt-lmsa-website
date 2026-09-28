import type { ReactNode } from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card p-5 sm:p-7 ${className}`}>{children}</section>;
}

export function InlineAlert({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "info" | "success";
}) {
  const styles = {
    error: "border-rose-200 bg-rose-50 text-rose-900",
    info: "border-blue-200 bg-blue-50 text-blue-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-2xl border p-4 leading-6 ${styles[tone]}`}>
      {children}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
      {label}
    </div>
  );
}

export function PlatformStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-900 ring-amber-200",
    active: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    suspended: "bg-rose-50 text-rose-900 ring-rose-200",
    registered: "bg-blue-50 text-blue-900 ring-blue-200",
    cancelled: "bg-slate-100 text-slate-700 ring-slate-200",
    published: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    draft: "bg-amber-50 text-amber-900 ring-amber-200",
    open: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    closed: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${styles[status] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function PageControls({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
      <p className="text-sm text-slate-600">
        {total === 0 ? "No records" : `Page ${page} of ${pageCount} · ${total} total`}
      </p>
      <div className="flex gap-2">
        <button type="button" className="button button-secondary text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </button>
        <button type="button" className="button button-secondary text-sm disabled:opacity-50" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export function FieldLabel({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="grid gap-1.5 text-sm font-bold text-gt-navy">
      <span>{children}</span>
      {hint ? <span className="font-normal leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

export const inputClassName = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-base font-normal text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-gt-navy focus:outline-none";
