"use client";

import { useEffect, useState } from "react";
import { AUDIT_ACTIONS, type AuditAction, type AuditEntry, type Page } from "@/lib/platform-contracts";
import { errorMessage, platformRequest } from "./api";
import { formatAtlantaDateTime } from "./date-time";
import { FieldLabel, InlineAlert, inputClassName, LoadingState, PageControls, Panel } from "./ui";

const pageSize = 20;

const actionLabels: Record<AuditAction, string> = {
  "event.created": "Event created",
  "event.updated": "Event updated",
  "member.status_changed": "Member status changed",
  "attendance.recorded": "Attendance recorded",
  "attendance.exported": "Attendance CSV exported",
};

const safeDetailLabels: Record<string, string> = {
  eventId: "Event ID",
  memberId: "Member ID",
  registrationId: "Registration ID",
  previousStatus: "Previous status",
  newStatus: "New status",
  status: "Status",
  publicationStatus: "Publication status",
  previousPublicationStatus: "Previous publication status",
  registrationStatus: "Registration status",
  previousRegistrationStatus: "Previous registration status",
  version: "Version",
  expectedVersion: "Expected version",
  previousVersion: "Previous version",
  newVersion: "New version",
  registeredCount: "Registered count",
  attendanceCount: "Attendance count",
  count: "Count",
  exportedCount: "Exported count",
  rowCount: "Exported row count",
};

const safeStatuses = new Set([
  "pending",
  "active",
  "suspended",
  "draft",
  "published",
  "cancelled",
  "open",
  "closed",
  "registered",
]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isSafeDetailValue(key: string, value: string | number | null): boolean {
  if (value === null) return true;
  if (key.endsWith("Id")) return typeof value === "string" && uuidPattern.test(value);
  if (key.toLowerCase().endsWith("status")) {
    return typeof value === "string" && safeStatuses.has(value);
  }
  if (typeof value === "number") return Number.isSafeInteger(value) && value >= 0;
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value));
}

function safeDetails(entry: AuditEntry): [string, string | number | null][] {
  return Object.entries(entry.details)
    .filter(([key, value]) => Object.hasOwn(safeDetailLabels, key) && isSafeDetailValue(key, value))
    .sort(([left], [right]) => left.localeCompare(right));
}

export function OfficerAudit() {
  const [result, setResult] = useState<Page<AuditEntry> | null>(null);
  const [action, setAction] = useState<AuditAction | "all">("all");
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (action !== "all") params.set("action", action);
    setLoading(true);
    setError(null);
    setResult(null);

    platformRequest<Page<AuditEntry>>(`/api/platform/officer/audit?${params.toString()}`)
      .then((data) => { if (!ignore) setResult(data); })
      .catch((cause: unknown) => { if (!ignore) setError(errorMessage(cause)); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [action, page, retryCount]);

  return (
    <div className="grid gap-6">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Officer history</p>
            <h3 className="mt-2 text-2xl font-bold text-gt-navy">Activity</h3>
            <p className="mt-2 max-w-3xl leading-6 text-slate-600">Review recorded officer actions. This view contains account and record IDs, not member profile details.</p>
          </div>
          <FieldLabel htmlFor="officer-audit-action">Filter activity
            <select
              id="officer-audit-action"
              className={`${inputClassName} min-w-56`}
              value={action}
              disabled={loading}
              onChange={(event) => {
                setAction(event.target.value as AuditAction | "all");
                setPage(1);
              }}
            >
              <option value="all">All activity</option>
              {AUDIT_ACTIONS.map((actionName) => (
                <option key={actionName} value={actionName}>{actionLabels[actionName]}</option>
              ))}
            </select>
          </FieldLabel>
        </div>
      </Panel>

      {loading ? <LoadingState label="Loading officer activity…" /> : null}
      {error ? (
        <InlineAlert>
          <div className="grid justify-items-start gap-3">
            <p>{error}</p>
            <button
              type="button"
              className="button button-secondary disabled:opacity-50"
              disabled={loading}
              onClick={() => setRetryCount((current) => current + 1)}
            >
              Retry loading activity
            </button>
          </div>
        </InlineAlert>
      ) : null}
      {!loading && !error && result?.items.length === 0 ? (
        <Panel><p className="leading-6 text-slate-600">No activity matches this filter.</p></Panel>
      ) : null}
      {!loading && !error && result?.items.length ? (
        <Panel>
          <ol className="grid gap-4" aria-label="Officer activity entries">
            {result.items.map((entry) => {
              const details = safeDetails(entry);
              return (
                <li key={entry.id}>
                  <article className="grid min-w-0 gap-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h4 className="text-lg font-bold text-gt-navy">{actionLabels[entry.action]}</h4>
                      <time className="text-sm text-slate-600" dateTime={entry.createdAt}>
                        {formatAtlantaDateTime(entry.createdAt)}
                      </time>
                    </div>
                    <dl className="grid min-w-0 gap-3 text-sm sm:grid-cols-2">
                      <div className="min-w-0">
                        <dt className="font-semibold text-slate-600">Actor ID</dt>
                        <dd className="mt-1 break-all font-mono text-slate-900">{entry.actorUserId}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="font-semibold text-slate-600">Target ID</dt>
                        <dd className="mt-1 break-all font-mono text-slate-900">{entry.targetId}</dd>
                      </div>
                      <div className="min-w-0 sm:col-span-2">
                        <dt className="font-semibold text-slate-600">Request ID</dt>
                        <dd className="mt-1 break-all font-mono text-slate-900">{entry.requestId}</dd>
                      </div>
                    </dl>
                    {details.length ? (
                      <details className="border-t border-slate-100 pt-3 text-sm">
                        <summary className="w-fit cursor-pointer rounded text-gt-navy underline decoration-gt-gold decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gt-navy">
                          View change details
                        </summary>
                        <dl className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
                          {details.map(([key, value]) => (
                            <div key={key} className="min-w-0">
                              <dt className="font-semibold text-slate-600">{safeDetailLabels[key]}</dt>
                              <dd className="mt-1 break-all text-slate-900">{value === null ? "—" : String(value)}</dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>
          <div className="mt-5">
            <PageControls page={result.page} pageSize={result.pageSize} total={result.total} onChange={setPage} />
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
