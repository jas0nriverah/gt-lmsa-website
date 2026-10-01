"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EventInput, Page, PlatformEvent, Registration } from "@/lib/platform-contracts";
import { PlatformRequestError, errorMessage, platformRequest, responseError } from "./api";
import { formatAtlantaDateTime } from "./date-time";
import { formatEventTime } from "@/lib/platform-dates";
import { OfficerEventForm } from "./OfficerEventForm";
import { InlineAlert, LoadingState, PageControls, Panel, PlatformStatus } from "./ui";

const pageSize = 20;
const registrationPageSize = 20;

export function OfficerEvents() {
  const [events, setEvents] = useState<Page<PlatformEvent> | null>(null);
  const [eventOptions, setEventOptions] = useState<PlatformEvent[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<PlatformEvent | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [reloadingLatest, setReloadingLatest] = useState(false);
  const [staleEdit, setStaleEdit] = useState(false);
  const saveInFlight = useRef(false);
  const reloadInFlight = useRef(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrationPage, setRegistrationPage] = useState(1);
  const [registrations, setRegistrations] = useState<Page<Registration> | null>(null);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadEvents = useCallback(async (requestedPage: number) => {
    setLoading(true);
    setError(null);
    setEvents(null);
    try {
      const data = await platformRequest<Page<PlatformEvent>>(
        `/api/platform/officer/events?page=${requestedPage}&pageSize=${pageSize}`,
      );
      setEvents(data);
      setEventOptions((current) => {
        const merged = new Map(current.map((event) => [event.id, event]));
        for (const event of data.items) merged.set(event.id, event);
        return [...merged.values()];
      });
      setPage(data.page);
      setSelectedEventId((current) => current || data.items[0]?.id || "");
    } catch (cause) {
      setEvents(null);
      setEventOptions([]);
      setSelectedEventId("");
      setRegistrations(null);
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadEvents(1); }, [loadEvents]);

  useEffect(() => {
    let ignore = false;
    if (!selectedEventId) {
      setRegistrations(null);
      return () => { ignore = true; };
    }
    setRegistrationsLoading(true);
    setRegistrationsError(null);
    setRegistrations(null);
    platformRequest<Page<Registration>>(
      `/api/platform/officer/events/${encodeURIComponent(selectedEventId)}/registrations?page=${registrationPage}&pageSize=${registrationPageSize}`,
    )
      .then((data) => {
        if (!ignore) setRegistrations(data);
      })
      .catch((cause: unknown) => { if (!ignore) setRegistrationsError(errorMessage(cause)); })
      .finally(() => { if (!ignore) setRegistrationsLoading(false); });
    return () => { ignore = true; };
  }, [registrationPage, selectedEventId]);

  async function saveEvent(input: EventInput) {
    if (saveInFlight.current) return;
    saveInFlight.current = true;
    setSaving(true);
    setActionError(null);
    setNotice(null);
    setStaleEdit(false);
    try {
      const isEdit = editing !== null && editing !== "new";
      const saved = await platformRequest<PlatformEvent>(
        isEdit
          ? `/api/platform/officer/events/${encodeURIComponent(editing.id)}`
          : "/api/platform/officer/events",
        {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify(isEdit ? { ...input, expectedVersion: editing.version } : input),
        },
      );
      setEventOptions((current) => [...new Map([...current, saved].map((event) => [event.id, event])).values()]);
      setSelectedEventId(saved.id);
      setEditing(null);
      setNotice(isEdit ? "Event changes were saved." : "Event was created.");
      await loadEvents(page);
    } catch (cause) {
      if (cause instanceof PlatformRequestError && cause.code === "STALE_EVENT") {
        setStaleEdit(true);
        setActionError("This event changed after you opened it. Your unsaved changes are still here. Reload the latest version only if you want to discard them.");
      } else {
        setActionError(errorMessage(cause));
      }
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  async function reloadLatestEvent() {
    if (!editing || editing === "new" || reloadInFlight.current) return;
    reloadInFlight.current = true;
    setReloadingLatest(true);
    const eventId = editing.id;
    try {
      const latest = await platformRequest<PlatformEvent>(
        `/api/platform/officer/events/${encodeURIComponent(eventId)}`,
      );
      setEventOptions((current) => current.map((event) => event.id === latest.id ? latest : event));
      setEvents((current) => current
        ? { ...current, items: current.items.map((event) => event.id === latest.id ? latest : event) }
        : current);
      setEditing((current) => current && current !== "new" && current.id === eventId ? latest : current);
      setStaleEdit(false);
      setActionError(null);
      setNotice("Loaded the latest event. Your unsaved changes were discarded.");
    } catch (cause) {
      setActionError(`Could not load the latest event. Your unsaved changes are still here. ${errorMessage(cause)}`);
    } finally {
      reloadInFlight.current = false;
      setReloadingLatest(false);
    }
  }

  async function exportAttendance() {
    if (!selectedEventId) return;
    setExporting(true);
    setActionError(null);
    try {
      const response = await fetch(
        `/api/platform/officer/events/${encodeURIComponent(selectedEventId)}/export`,
        { cache: "no-store", credentials: "same-origin", headers: { Accept: "text/csv" } },
      );
      if (!response.ok) throw await responseError(response);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "lmsa-event-attendance.csv";
      link.hidden = true;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (cause) {
      if (cause instanceof PlatformRequestError && cause.status === 401) setError("Your officer session expired. Please sign in again.");
      else setActionError(errorMessage(cause));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-6">
      {actionError ? (
        <div className="grid justify-items-start gap-3">
          <InlineAlert>{actionError}</InlineAlert>
          {staleEdit && editing !== null && editing !== "new" ? (
            <button
              type="button"
              className="button button-secondary disabled:opacity-50"
              disabled={saving || reloadingLatest}
              onClick={() => void reloadLatestEvent()}
            >
              {reloadingLatest ? "Loading latest event…" : "Reload latest event (discard unsaved changes)"}
            </button>
          ) : null}
        </div>
      ) : null}
      {notice ? <InlineAlert tone="success">{notice}</InlineAlert> : null}

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gt-navy">Chapter events</h3>
            <p className="mt-2 leading-6 text-slate-600">Create and edit the complete event record. All event date and time values are entered in Atlanta time.</p>
          </div>
          <button type="button" className="button button-primary disabled:opacity-50" disabled={saving || reloadingLatest} onClick={() => { setActionError(null); setStaleEdit(false); setEditing("new"); }}>Create event</button>
        </div>
        {loading ? <div className="mt-5"><LoadingState label="Loading events…" /></div> : null}
        {error ? <div className="mt-5"><InlineAlert>{error}</InlineAlert></div> : null}
        {!loading && !error && events?.items.length === 0 ? <p className="mt-5 rounded-xl bg-gt-cream p-4 text-slate-600">No chapter events have been created.</p> : null}
        {!loading && !error && events?.items.length ? (
          <div className="mt-5 grid gap-3">
            {events.items.map((event) => (
              <article key={event.id} className={`rounded-2xl border p-4 ${event.id === selectedEventId ? "border-gt-gold bg-gt-cream/60" : "border-slate-200"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-gt-navy">{event.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{formatEventTime(event)} · {event.location}</p>
                    <p className="mt-2 text-sm text-slate-600">{event.registeredCount} registered{event.attendanceCount === undefined ? "" : ` · ${event.attendanceCount} checked in`}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PlatformStatus status={event.publicationStatus} />
                    <PlatformStatus status={event.registrationStatus} />
                    <button type="button" className="button button-secondary text-sm disabled:opacity-50" disabled={saving || reloadingLatest} onClick={() => { setActionError(null); setStaleEdit(false); setEditing(event); }}>Edit</button>
                  </div>
                </div>
              </article>
            ))}
            <PageControls page={events.page} pageSize={events.pageSize} total={events.total} onChange={(nextPage) => void loadEvents(nextPage)} />
          </div>
        ) : null}
      </Panel>

      {editing !== null ? (
        <Panel>
          <OfficerEventForm
            key={editing === "new" ? "new-event" : `${editing.id}:${editing.version}`}
            event={editing === "new" ? null : editing}
            saving={saving}
            onCancel={() => { setEditing(null); setActionError(null); setStaleEdit(false); }}
            onSubmit={saveEvent}
          />
        </Panel>
      ) : null}

      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gt-navy">Event registrations</h3>
            <p className="mt-2 leading-6 text-slate-600">Attendee names and emails are shown only in this officer view. CSV export contains approved attendance fields and no ticket tokens.</p>
          </div>
          <button type="button" className="button button-secondary disabled:opacity-50" disabled={!selectedEventId || exporting} onClick={() => void exportAttendance()}>
            {exporting ? "Preparing CSV…" : "Download attendance CSV"}
          </button>
        </div>
        <label htmlFor="attendance-event-select" className="mt-5 grid max-w-xl gap-1.5 text-sm font-bold text-gt-navy">
          Select event
          <select id="attendance-event-select" className={inputSelectClass} value={selectedEventId} disabled={!eventOptions.length} onChange={(event) => { setSelectedEventId(event.target.value); setRegistrationPage(1); }}>
            {eventOptions.length ? eventOptions.map((event) => <option key={event.id} value={event.id}>{event.title}</option>) : <option value="">No events available</option>}
          </select>
        </label>
        {registrationsLoading ? <div className="mt-5"><LoadingState label="Loading event registrations…" /></div> : null}
        {registrationsError ? <div className="mt-5"><InlineAlert>{registrationsError}</InlineAlert></div> : null}
        {!registrationsLoading && !registrationsError && registrations?.items.length === 0 ? <p className="mt-5 rounded-xl bg-gt-cream p-4 text-slate-600">No registrations for this event.</p> : null}
        {!registrationsLoading && !registrationsError && registrations?.items.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead><tr className="border-b border-slate-200 text-slate-500"><th className="pb-3 pr-4">Member</th><th className="pb-3 pr-4">Email</th><th className="pb-3 pr-4">RSVP</th><th className="pb-3">Check-in</th></tr></thead>
              <tbody>
                {registrations.items.map((registration) => (
                  <tr key={registration.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-gt-navy">{registration.member?.name ?? "Member"}</td>
                    <td className="py-3 pr-4">{registration.member?.email ?? "—"}</td>
                    <td className="py-3 pr-4"><PlatformStatus status={registration.status} /></td>
                    <td className="py-3">{registration.checkedInAt ? formatAtlantaDateTime(registration.checkedInAt) : "Not checked in"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4"><PageControls page={registrations.page} pageSize={registrations.pageSize} total={registrations.total} onChange={setRegistrationPage} /></div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}

const inputSelectClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-base font-normal text-slate-900 shadow-sm focus:border-gt-navy focus:outline-none";
