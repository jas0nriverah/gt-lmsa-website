"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Member, MembershipStatus, Page } from "@/lib/platform-contracts";
import { PlatformRequestError, errorMessage, platformRequest } from "./api";
import { FieldLabel, InlineAlert, inputClassName, LoadingState, PageControls, Panel, PlatformStatus } from "./ui";

const pageSize = 20;
type StatusFilter = "all" | MembershipStatus;

export function OfficerMembers({ membershipApprovalEnabled }: { membershipApprovalEnabled: boolean }) {
  const [result, setResult] = useState<Page<Member> | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadMembers = useCallback(async (requestedPage: number, requestedFilter: StatusFilter, requestedQuery: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    const params = new URLSearchParams({ page: String(requestedPage), pageSize: String(pageSize) });
    if (requestedFilter !== "all") params.set("status", requestedFilter);
    if (requestedQuery) params.set("q", requestedQuery);
    try {
      const data = await platformRequest<Page<Member>>(`/api/platform/officer/members?${params.toString()}`);
      setResult(data);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers(page, filter, query);
  }, [filter, loadMembers, page, query]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setQuery(queryDraft.trim());
  }

  async function changeStatus(member: Member, status: MembershipStatus) {
    setBusyId(member.id);
    setActionError(null);
    setStatusNotice(null);
    try {
      const updated = await platformRequest<Member>(`/api/platform/officer/members/${encodeURIComponent(member.id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setStatusNotice(`${updated.name} membership is now ${updated.status}.`);
      await loadMembers(page, filter, query);
    } catch (cause) {
      if (cause instanceof PlatformRequestError && cause.status === 401) setError("Your officer session expired. Please sign in again.");
      else setActionError(errorMessage(cause));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gt-navy">Member directory</h3>
            <p className="mt-2 max-w-3xl leading-6 text-slate-600">Search member profiles and review their current membership status. Sign-in identity and officer access are managed separately.</p>
          </div>
        </div>
        {!membershipApprovalEnabled ? (
          <div className="mt-5"><InlineAlert tone="info">Member status changes are disabled by chapter policy. Ask the owner to enable membership approval before approving or suspending members.</InlineAlert></div>
        ) : null}
        {actionError ? <div className="mt-5"><InlineAlert>{actionError}</InlineAlert></div> : null}
        {statusNotice ? <div className="mt-5"><InlineAlert tone="success">{statusNotice}</InlineAlert></div> : null}
        <form className="mt-6 grid gap-4 md:grid-cols-[minmax(12rem,1fr)_14rem_auto] md:items-end" onSubmit={search}>
          <FieldLabel htmlFor="member-search">Search members
            <input id="member-search" className={inputClassName} value={queryDraft} maxLength={100} placeholder="Name, email, major, or academic year" onChange={(event) => setQueryDraft(event.target.value)} />
          </FieldLabel>
          <FieldLabel htmlFor="member-status-filter">Status
            <select id="member-status-filter" className={inputClassName} value={filter} onChange={(event) => { setFilter(event.target.value as StatusFilter); setPage(1); }}>
              <option value="all">All statuses</option><option value="pending">Pending</option><option value="active">Active</option><option value="suspended">Suspended</option>
            </select>
          </FieldLabel>
          <button type="submit" className="button button-primary">Search</button>
        </form>
      </Panel>

      {loading ? <LoadingState label="Loading member directory…" /> : null}
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {!loading && !error && result?.items.length === 0 ? (
        <Panel><p className="leading-6 text-slate-600">No members match this search.</p></Panel>
      ) : null}
      {!loading && !error && result?.items.length ? (
        <Panel>
          <div className="grid gap-4">
            {result.items.map((member) => (
              <article key={member.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="break-words text-lg font-bold text-gt-navy">{member.name}</h4>
                    <a className="text-link break-all text-sm" href={`mailto:${member.email}`}>{member.email}</a>
                    <p className="mt-2 text-sm text-slate-600">{member.academicYear || "Academic year not provided"}{member.major ? ` · ${member.major}` : ""}</p>
                    {member.interests.length ? <p className="mt-2 text-sm leading-6 text-slate-600">Interests: {member.interests.join(", ")}</p> : null}
                  </div>
                  <PlatformStatus status={member.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {member.status === "pending" ? (
                    <>
                      <button type="button" className="button button-primary text-sm disabled:opacity-50" disabled={!membershipApprovalEnabled || busyId === member.id} onClick={() => void changeStatus(member, "active")}>
                        {busyId === member.id ? "Saving…" : "Approve membership"}
                      </button>
                      <button type="button" className="button button-secondary text-sm disabled:opacity-50" disabled={!membershipApprovalEnabled || busyId === member.id} onClick={() => void changeStatus(member, "suspended")}>Suspend</button>
                    </>
                  ) : member.status === "active" ? (
                    <button type="button" className="button button-secondary text-sm disabled:opacity-50" disabled={!membershipApprovalEnabled || busyId === member.id} onClick={() => void changeStatus(member, "suspended")}>Suspend membership</button>
                  ) : (
                    <button type="button" className="button button-secondary text-sm disabled:opacity-50" disabled={!membershipApprovalEnabled || busyId === member.id} onClick={() => void changeStatus(member, "active")}>Restore membership</button>
                  )}
                </div>
              </article>
            ))}
            <PageControls page={result.page} pageSize={result.pageSize} total={result.total} onChange={setPage} />
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
