"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Page, PlatformEvent, Registration } from "@/lib/platform-contracts";
import { PlatformRequestError, errorMessage, platformRequest } from "./api";
import { formatAtlantaDateTime } from "./date-time";
import { formatEventTime } from "@/lib/platform-dates";
import { FieldLabel, InlineAlert, inputClassName, LoadingState, PageControls, Panel, PlatformStatus } from "./ui";

const pageSize = 20;

export function OfficerAttendance() {
  const [eventList, setEventList] = useState<Page<PlatformEvent> | null>(null);
  const [eventOptions, setEventOptions] = useState<PlatformEvent[]>([]);
  const [eventPage, setEventPage] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Page<Registration> | null>(null);
  const [registrationPage, setRegistrationPage] = useState(1);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);
  const [method, setMethod] = useState<"registrationId" | "token">("registrationId");
  const [registrationId, setRegistrationId] = useState("");
  const [token, setToken] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<Registration | null>(null);

  useEffect(() => {
    let ignore = false;
    setEventsLoading(true);
    setEventsError(null);
    platformRequest<Page<PlatformEvent>>(`/api/platform/officer/events?page=${eventPage}&pageSize=50`)
      .then((data) => {
        if (ignore) return;
        setEventList(data);
        setEventOptions((current) => {
          const merged = new Map(current.map((event) => [event.id, event]));
          for (const event of data.items) merged.set(event.id, event);
          return [...merged.values()];
        });
        setSelectedEventId((current) => current || data.items[0]?.id || "");
      })
      .catch((cause: unknown) => {
        if (ignore) return;
        setEventList(null);
        setEventOptions([]);
        setSelectedEventId("");
        setRegistrations(null);
        setEventsError(errorMessage(cause));
      })
      .finally(() => { if (!ignore) setEventsLoading(false); });
    return () => { ignore = true; };
  }, [eventPage]);

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
      `/api/platform/officer/events/${encodeURIComponent(selectedEventId)}/registrations?page=${registrationPage}&pageSize=${pageSize}`,
    )
      .then((data) => { if (!ignore) setRegistrations(data); })
      .catch((cause: unknown) => { if (!ignore) setRegistrationsError(errorMessage(cause)); })
      .finally(() => { if (!ignore) setRegistrationsLoading(false); });
    return () => { ignore = true; };
  }, [registrationPage, selectedEventId]);

  async function submitCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setCheckedIn(null);
    if (!selectedEventId) {
      setActionError("Select an event before checking in a registration.");
      return;
    }
    if (!confirmed) {
      setActionError("Confirm that the attendee presented this registration ID or ticket code.");
      return;
    }
    const value = method === "registrationId" ? registrationId.trim() : token.trim();
    if (!value) {
      setActionError(method === "registrationId" ? "Enter a registration ID." : "Paste the attendee’s ticket code.");
      return;
    }
    setCheckingIn(true);
    try {
      const registration = await platformRequest<Registration>(
        `/api/platform/officer/events/${encodeURIComponent(selectedEventId)}/check-in`,
        {
          method: "POST",
          body: JSON.stringify(method === "registrationId" ? { registrationId: value } : { token: value }),
        },
      );
      setCheckedIn(registration);
      setRegistrationId("");
      setToken("");
      setConfirmed(false);
      setRegistrationPage(1);
      setActionError(null);
      try {
        const firstPage = await platformRequest<Page<Registration>>(
          `/api/platform/officer/events/${encodeURIComponent(selectedEventId)}/registrations?page=1&pageSize=${pageSize}`,
        );
        setRegistrations(firstPage);
        setRegistrationsError(null);
      } catch (refreshError) {
        setRegistrationsError(errorMessage(refreshError));
      }
    } catch (cause) {
      if (cause instanceof PlatformRequestError && cause.status === 401) setActionError("Your officer session expired. Please sign in again.");
      else setActionError(errorMessage(cause));
    } finally {
      setCheckingIn(false);
    }
  }

  const selectedEvent = eventOptions.find((event) => event.id === selectedEventId);

  return (
    <div className="grid gap-6">
      <Panel>
        <div className="mb-5">
          <p className="eyebrow">Attendance</p>
          <h3 className="mt-2 text-2xl font-bold text-gt-navy">Check in an attendee</h3>
          <p className="mt-2 max-w-3xl leading-6 text-slate-600">Choose the event, then enter the registration ID shown in the officer list or paste the private ticket code presented by the attendee. The server validates membership, event timing, and the registration.</p>
        </div>
        {eventsLoading ? <LoadingState label="Loading events…" /> : null}
        {eventsError ? <InlineAlert>{eventsError}</InlineAlert> : null}
        {!eventsLoading && !eventsError && eventList?.total === 0 ? <InlineAlert tone="info">There are no chapter events available for check-in.</InlineAlert> : null}
        {!eventsLoading && !eventsError && eventList?.total ? (
          <>
            <label htmlFor="checkin-event" className="grid max-w-xl gap-1.5 text-sm font-bold text-gt-navy">
              Event
              <select id="checkin-event" className={inputClassName} value={selectedEventId} onChange={(event) => {
                setSelectedEventId(event.target.value);
                setRegistrationPage(1);
                setRegistrationId("");
                setToken("");
                setConfirmed(false);
                setCheckedIn(null);
                setActionError(null);
              }}>
                {eventOptions.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
              </select>
            </label>
            {eventList ? <div className="mt-3"><PageControls page={eventList.page} pageSize={eventList.pageSize} total={eventList.total} onChange={setEventPage} /></div> : null}
            {selectedEvent ? <p className="mt-3 text-sm text-slate-600">{formatEventTime(selectedEvent)} · {selectedEvent.location}</p> : null}
            <form className="mt-6 grid gap-5 border-t border-slate-200 pt-5" onSubmit={submitCheckIn}>
              <fieldset className="grid gap-3 sm:grid-cols-2">
                <legend className="mb-2 text-sm font-bold text-gt-navy">Lookup method</legend>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                  <input type="radio" name="checkin-method" checked={method === "registrationId"} onChange={() => { setMethod("registrationId"); setConfirmed(false); }} />
                  Registration ID
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                  <input type="radio" name="checkin-method" checked={method === "token"} onChange={() => { setMethod("token"); setConfirmed(false); }} />
                  Pasted ticket code
                </label>
              </fieldset>
              {method === "registrationId" ? (
                <FieldLabel htmlFor="checkin-registration-id">Registration ID
                  <input id="checkin-registration-id" className={inputClassName} value={registrationId} autoComplete="off" spellCheck={false} onChange={(event) => setRegistrationId(event.target.value)} />
                </FieldLabel>
              ) : (
                <FieldLabel htmlFor="checkin-token">Attendee ticket code
                  <input id="checkin-token" type="password" className={`${inputClassName} font-mono`} value={token} autoComplete="off" spellCheck={false} onChange={(event) => setToken(event.target.value)} />
                </FieldLabel>
              )}
              <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[#003057]" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
                <span>I confirm that the attendee presented this registration ID or ticket code for the selected event.</span>
              </label>
              {actionError ? <InlineAlert>{actionError}</InlineAlert> : null}
              {checkedIn ? (
                <InlineAlert tone="success">
                  Check-in confirmed{checkedIn.member?.name ? ` for ${checkedIn.member.name}` : ""}. Recorded time: {formatAtlantaDateTime(checkedIn.checkedInAt)}.
                </InlineAlert>
              ) : null}
              <button type="submit" className="button button-primary w-fit disabled:opacity-50" disabled={checkingIn || !confirmed}>
                {checkingIn ? "Checking in…" : "Confirm check-in"}
              </button>
            </form>
          </>
        ) : null}
      </Panel>

      <Panel>
        <h3 className="text-2xl font-bold text-gt-navy">Event registration list</h3>
        <p className="mt-2 leading-6 text-slate-600">Registration IDs are available here for manual check-in when an attendee does not have a ticket code.</p>
        {registrationsLoading ? <div className="mt-5"><LoadingState label="Loading registrations…" /></div> : null}
        {registrationsError ? <div className="mt-5"><InlineAlert>{registrationsError}</InlineAlert></div> : null}
        {!registrationsLoading && !registrationsError && registrations?.items.length === 0 ? <p className="mt-5 rounded-xl bg-gt-cream p-4 text-slate-600">No registrations for this event.</p> : null}
        {!registrationsLoading && !registrationsError && registrations?.items.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead><tr className="border-b border-slate-200 text-slate-500"><th className="pb-3 pr-4">Registration ID</th><th className="pb-3 pr-4">Member</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Check-in time</th></tr></thead>
              <tbody>
                {registrations.items.map((registration) => (
                  <tr key={registration.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{registration.id}</td>
                    <td className="py-3 pr-4"><span className="font-semibold text-gt-navy">{registration.member?.name ?? "Member"}</span>{registration.member?.email ? <span className="block text-xs text-slate-500">{registration.member.email}</span> : null}</td>
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
