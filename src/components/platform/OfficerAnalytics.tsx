"use client";

import { useEffect, useState } from "react";
import type { Analytics } from "@/lib/platform-contracts";
import { errorMessage, platformRequest } from "./api";
import { InlineAlert, LoadingState, Panel } from "./ui";

function CountBars({
  rows,
  label,
}: {
  rows: { label: string; count: number }[];
  label: string;
}) {
  if (!rows.length) return <p className="text-sm leading-6 text-slate-500">No {label.toLowerCase()} data is available yet.</p>;
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <ul className="grid gap-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="font-semibold text-slate-700">{row.label}</span>
            <span className="tabular-nums text-slate-600">{row.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`${row.label}: ${row.count}`}>
            <div className="h-full rounded-full bg-gt-gold" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OfficerAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    platformRequest<Analytics>("/api/platform/officer/analytics")
      .then((result) => { if (!ignore) setData(result); })
      .catch((cause: unknown) => {
        if (!ignore) setError(errorMessage(cause));
      })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  if (loading) return <LoadingState label="Loading chapter analytics…" />;
  if (error) return <InlineAlert>{error}</InlineAlert>;
  if (!data) return <InlineAlert>Analytics were not returned by the server.</InlineAlert>;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total members", value: data.totalMembers },
          { label: "Pending", value: data.pendingMembers },
          { label: "Active", value: data.activeMembers },
        ].map((stat) => (
          <Panel key={stat.label} className="p-5">
            <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
            <p className="mt-2 text-4xl font-black tabular-nums text-gt-navy">{stat.value}</p>
          </Panel>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-5 text-xl font-bold text-gt-navy">Membership growth</h3>
          <CountBars label="membership growth" rows={data.growth.map((row) => ({ label: row.month, count: row.count }))} />
        </Panel>
        <Panel>
          <h3 className="mb-5 text-xl font-bold text-gt-navy">Member interests</h3>
          <CountBars label="member interests" rows={data.interests.map((row) => ({ label: row.interest, count: row.count }))} />
        </Panel>
      </div>
      <Panel>
        <h3 className="mb-5 text-xl font-bold text-gt-navy">Event participation</h3>
        {data.events.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead><tr className="border-b border-slate-200 text-slate-500"><th className="pb-3 pr-4">Event</th><th className="pb-3 pr-4">Registered</th><th className="pb-3 pr-4">Attended</th><th className="pb-3">Attendance rate</th></tr></thead>
              <tbody>
                {data.events.map((event) => (
                  <tr key={event.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-gt-navy">{event.title}</td>
                    <td className="py-3 pr-4 tabular-nums">{event.registered}</td>
                    <td className="py-3 pr-4 tabular-nums">{event.attended}</td>
                    <td className="py-3 tabular-nums">{Number.isFinite(event.attendanceRate) ? `${event.attendanceRate}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-500">No event participation data is available yet.</p>
        )}
      </Panel>
    </div>
  );
}
