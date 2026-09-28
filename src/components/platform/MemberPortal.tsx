"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type {
  Member,
  MemberHome,
  MemberInput,
  Page,
  PlatformEvent,
  Registration,
  Ticket,
} from "@/lib/platform-contracts";
import { contactLinks } from "@/lib/site-data";
import { ACADEMIC_YEARS, MEMBER_INTERESTS } from "@/lib/platform-contracts";
import { PlatformRequestError, errorMessage, platformRequest } from "./api";
import { GoogleSignInAction, SignOutAction } from "./AuthActions";
import { formatAtlantaDateTime } from "./date-time";
import {
  FieldLabel,
  InlineAlert,
  inputClassName,
  LoadingState,
  PageControls,
  Panel,
  PlatformStatus,
} from "./ui";

const pageSize = 20;
const eventPageSize = 50;

function isUnauthorized(error: unknown): boolean {
  return error instanceof PlatformRequestError && error.status === 401;
}

function queryForPage(page: number, size = pageSize): string {
  return `page=${page}&pageSize=${size}`;
}

function emptyInput(): MemberInput {
  return { name: "", academicYear: "", major: "", interests: [] };
}

export function MemberPortal({ authEnabled }: { authEnabled: boolean }) {
  const [loading, setLoading] = useState(true);
  const [home, setHome] = useState<MemberHome | null>(null);
  const [authNeeded, setAuthNeeded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Page<Registration> | null>(null);
  const [events, setEvents] = useState<Page<PlatformEvent> | null>(null);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [registrationPage, setRegistrationPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [draft, setDraft] = useState<MemberInput>(emptyInput);
  const [profileSaving, setProfileSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Record<string, Ticket>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadRegistrations = useCallback(async (page: number) => {
    const result = await platformRequest<Page<Registration>>(
      `/api/platform/me/registrations?${queryForPage(page)}`,
    );
    setRegistrations(result);
    setRegistrationPage(result.page);
    setRegistrationsError(null);
  }, []);

  const loadEvents = useCallback(async (page: number) => {
    const result = await platformRequest<Page<PlatformEvent>>(
      `/api/platform/events?${queryForPage(page, eventPageSize)}&view=upcoming`,
    );
    setEvents(result);
    setEventsPage(result.page);
    setEventsError(null);
  }, []);

  const refreshLists = useCallback(async () => {
    const [registrationResult, eventResult] = await Promise.allSettled([
      loadRegistrations(1),
      loadEvents(1),
    ]);
    setRegistrationsError(
      registrationResult.status === "rejected" ? errorMessage(registrationResult.reason) : null,
    );
    setEventsError(eventResult.status === "rejected" ? errorMessage(eventResult.reason) : null);
  }, [loadEvents, loadRegistrations]);

  useEffect(() => {
    const clearPrivateTicketState = () => {
      setTickets({});
      setCopiedId(null);
      setAuthNeeded(true);
    };
    window.addEventListener("platform:unauthorized", clearPrivateTicketState);
    return () => window.removeEventListener("platform:unauthorized", clearPrivateTicketState);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadPortal() {
      setLoading(true);
      setLoadError(null);
      setAuthNeeded(false);
      if (!authEnabled) {
        setLoading(false);
        return;
      }
      try {
        const profile = await platformRequest<MemberHome>("/api/platform/me");
        if (ignore) return;
        setHome(profile);
        if (profile.member) {
          setDraft({
            name: profile.member.name,
            academicYear: profile.member.academicYear,
            major: profile.member.major,
            interests: profile.member.interests,
          });
        }
        const [registrationResult, eventResult] = await Promise.allSettled([
          platformRequest<Page<Registration>>(`/api/platform/me/registrations?${queryForPage(1)}`),
          platformRequest<Page<PlatformEvent>>(
            `/api/platform/events?${queryForPage(1, eventPageSize)}&view=upcoming`,
          ),
        ]);
        if (ignore) return;
        if (registrationResult.status === "fulfilled") {
          setRegistrations(registrationResult.value);
        } else {
          setRegistrationsError(errorMessage(registrationResult.reason));
          if (isUnauthorized(registrationResult.reason)) setAuthNeeded(true);
        }
        if (eventResult.status === "fulfilled") {
          setEvents(eventResult.value);
        } else {
          setEventsError(errorMessage(eventResult.reason));
        }
      } catch (error) {
        if (ignore) return;
        if (isUnauthorized(error)) setAuthNeeded(true);
        else setLoadError(errorMessage(error));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void loadPortal();
    return () => {
      ignore = true;
    };
  }, [authEnabled]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setNotice(null);
    if (!draft.name.trim()) {
      setActionError("Enter your name to save your profile.");
      return;
    }
    setProfileSaving(true);
    try {
      const saved = await platformRequest<Member>("/api/platform/me", {
        method: home?.member ? "PATCH" : "POST",
        body: JSON.stringify({ ...draft, name: draft.name.trim() }),
      });
      setHome((current) => current ? { ...current, member: saved } : current);
      setDraft({
        name: saved.name,
        academicYear: saved.academicYear,
        major: saved.major,
        interests: saved.interests,
      });
      setNotice("Your profile was saved.");
    } catch (error) {
      if (isUnauthorized(error)) setAuthNeeded(true);
      setActionError(errorMessage(error));
    } finally {
      setProfileSaving(false);
    }
  }

  function toggleInterest(interest: string) {
    setDraft((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  }

  async function changeRsvp(eventId: string, registered: boolean) {
    const key = `rsvp:${eventId}`;
    setBusyKey(key);
    setActionError(null);
    setNotice(null);
    try {
      await platformRequest<Registration>(`/api/platform/events/${encodeURIComponent(eventId)}/rsvp`, {
        method: registered ? "DELETE" : "POST",
      });
      if (registered) {
        setTickets((current) => Object.fromEntries(Object.entries(current).filter(([, ticket]) => ticket.eventId !== eventId)));
        setCopiedId(null);
      }
      setNotice(registered ? "Your RSVP was cancelled." : "You’re registered for this event.");
      await refreshLists();
    } catch (error) {
      if (isUnauthorized(error)) setAuthNeeded(true);
      setActionError(errorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  async function issueTicket(registration: Registration) {
    setBusyKey(`ticket:${registration.id}`);
    setActionError(null);
    try {
      const ticket = await platformRequest<Ticket>(
        `/api/platform/events/${encodeURIComponent(registration.eventId)}/ticket`,
        { method: "POST" },
      );
      setTickets((current) => ({ ...current, [registration.id]: ticket }));
    } catch (error) {
      if (isUnauthorized(error)) setAuthNeeded(true);
      setActionError(errorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  async function copyTicket(registrationId: string, token: string) {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedId(registrationId);
      window.setTimeout(() => setCopiedId((current) => current === registrationId ? null : current), 1800);
    } catch {
      setActionError("Clipboard access was unavailable. Select and copy the ticket code manually.");
    }
  }

  if (!authEnabled) {
    return (
      <Panel>
        <div className="grid gap-4">
          <InlineAlert tone="info">
            The member portal is not configured yet. Your chapter profile and event registrations are unavailable until sign-in and the member database are configured.
          </InlineAlert>
          <a className="button button-secondary w-fit" href={`mailto:${contactLinks.email}`}>
            Contact the chapter: {contactLinks.email}
          </a>
        </div>
      </Panel>
    );
  }

  if (loading) return <LoadingState label="Checking your member access…" />;

  if (authNeeded) {
    return (
      <Panel>
        <div className="grid gap-4">
          <InlineAlert tone="info">Sign in with your Google account to view your member portal.</InlineAlert>
          <GoogleSignInAction />
        </div>
      </Panel>
    );
  }

  if (loadError) {
    return (
      <Panel>
        <div className="grid gap-4">
          <InlineAlert>{loadError}</InlineAlert>
          <button type="button" className="button button-secondary w-fit" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </Panel>
    );
  }

  const member = home?.member ?? null;
  const memberStatus = member?.status;

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Member access</p>
          <h2 className="mt-2 text-3xl font-bold text-gt-navy">{member ? `Welcome, ${member.name}` : "Your chapter profile"}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {home?.isOfficer ? <Link href="/officer" className="button button-secondary">Officer dashboard</Link> : null}
          <SignOutAction />
        </div>
      </div>

      {actionError ? <InlineAlert>{actionError}</InlineAlert> : null}
      {notice ? <InlineAlert tone="success">{notice}</InlineAlert> : null}
      {member ? (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-gt-navy">Membership status</h3>
              <p className="mt-2 leading-6 text-slate-600">
                {memberStatus === "pending" && "Your profile is saved and awaiting chapter review. Creating an account does not activate membership."}
                {memberStatus === "active" && "Your membership is active. You can RSVP for events that are accepting registrations."}
                {memberStatus === "suspended" && "Your membership is currently suspended. Contact the chapter if you have questions."}
              </p>
            </div>
            <PlatformStatus status={member.status} />
          </div>
          {memberStatus === "pending" && !home?.membershipApprovalEnabled ? (
            <p className="mt-4 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">
              Online membership approval is not enabled. For an update, contact the chapter at <a className="text-link" href={`mailto:${contactLinks.email}`}>{contactLinks.email}</a>.
            </p>
          ) : null}
        </Panel>
      ) : (
        <InlineAlert tone="info">
          Complete the profile below to request chapter membership. New profiles begin in pending status and are never activated automatically.
        </InlineAlert>
      )}

      <Panel>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gt-navy">{member ? "Edit your profile" : "Create your profile"}</h3>
          <p className="mt-2 leading-6 text-slate-600">Your verified sign-in email is managed by the account system and cannot be changed here.</p>
        </div>
        <form className="grid gap-5" onSubmit={saveProfile}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldLabel htmlFor="member-name">Name
              <input id="member-name" className={inputClassName} value={draft.name} maxLength={120} required onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </FieldLabel>
            <FieldLabel htmlFor="member-year">Academic year
              <select id="member-year" className={inputClassName} value={draft.academicYear} onChange={(event) => setDraft({ ...draft, academicYear: event.target.value })}>
                <option value="">Select an option</option>
                {ACADEMIC_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </FieldLabel>
          </div>
          <FieldLabel htmlFor="member-major">Major or area of study
            <input id="member-major" className={inputClassName} value={draft.major} maxLength={120} onChange={(event) => setDraft({ ...draft, major: event.target.value })} />
          </FieldLabel>
          <fieldset>
            <legend className="text-sm font-bold text-gt-navy">Interests</legend>
            <p className="mt-1 text-sm leading-6 text-slate-500">Choose any that fit. You can update these later.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {MEMBER_INTERESTS.map((interest) => (
                <label key={interest} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" className="h-4 w-4 accent-[#003057]" checked={draft.interests.includes(interest)} onChange={() => toggleInterest(interest)} />
                  {interest}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="text-sm leading-6 text-slate-600">
            Before submitting your profile, review our <a className="text-link font-semibold" href="/privacy">Privacy Notice</a> to understand how this information is used.
          </p>
          <button type="submit" className="button button-primary w-fit disabled:opacity-60" disabled={profileSaving}>
            {profileSaving ? "Saving profile…" : member ? "Save profile" : "Create member profile"}
          </button>
        </form>
      </Panel>

      <Panel>
        <div className="mb-6">
          <p className="eyebrow">My registrations</p>
          <h3 className="mt-2 text-2xl font-bold text-gt-navy">Your event RSVPs</h3>
          <p className="mt-2 leading-6 text-slate-600">Registration state is shown for each event. Ticket codes appear only after you request one and stay in this page until it is closed or refreshed.</p>
        </div>
        {registrationsError ? <InlineAlert>{registrationsError}</InlineAlert> : null}
        {!registrationsError && registrations && registrations.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gt-gold p-6 text-slate-600">You do not have any event registrations yet.</div>
        ) : null}
        {registrations?.items.length ? (
          <div className="grid gap-4">
            {registrations.items.map((registration) => {
              const ticket = tickets[registration.id];
              return (
                <article key={registration.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-gt-navy">{registration.event?.title ?? "Chapter event"}</h4>
                      <p className="mt-1 text-sm text-slate-600">{formatAtlantaDateTime(registration.event?.startsAt ?? null)}</p>
                    </div>
                    <PlatformStatus status={registration.status} />
                  </div>
                  {registration.checkedInAt ? <p className="mt-3 text-sm font-semibold text-emerald-800">Checked in {formatAtlantaDateTime(registration.checkedInAt)}</p> : null}
                  {registration.status === "registered" ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" className="button button-secondary text-sm disabled:opacity-60" disabled={memberStatus !== "active" || Boolean(registration.event && (registration.event.publicationStatus !== "published" || !registration.event.startsAt || !registration.event.endsAt)) || busyKey === `ticket:${registration.id}`} onClick={() => void issueTicket(registration)}>
                        {busyKey === `ticket:${registration.id}` ? "Issuing code…" : ticket ? "Issue a new ticket code" : "Get ticket code"}
                      </button>
                      <button type="button" className="button button-secondary text-sm disabled:opacity-60" disabled={busyKey === `rsvp:${registration.eventId}`} onClick={() => void changeRsvp(registration.eventId, true)}>
                        {busyKey === `rsvp:${registration.eventId}` ? "Cancelling…" : "Cancel RSVP"}
                      </button>
                    </div>
                  ) : null}
                  {ticket ? (
                    <div className="mt-4 rounded-xl bg-gt-cream p-4">
                      <label htmlFor={`ticket-${registration.id}`} className="text-sm font-bold text-gt-navy">Private ticket code</label>
                      <p className="mt-1 text-sm leading-6 text-slate-600">Show this code to an officer at check-in. It is not a webpage link.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input id={`ticket-${registration.id}`} className={`${inputClassName} mt-0 min-w-0 flex-1 font-mono`} value={ticket.token} readOnly autoComplete="off" spellCheck={false} aria-label="Opaque ticket code" />
                        <button type="button" className="button button-secondary" onClick={() => void copyTicket(registration.id, ticket.token)}>
                          {copiedId === registration.id ? "Copied" : "Copy code"}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Expires {formatAtlantaDateTime(ticket.expiresAt)}. Keep this code private.</p>
                    </div>
                  ) : null}
                </article>
              );
            })}
            <PageControls page={registrationPage} pageSize={registrations.pageSize} total={registrations.total} onChange={(page) => void loadRegistrations(page).catch((error) => setRegistrationsError(errorMessage(error)))} />
          </div>
        ) : null}
      </Panel>

      <Panel>
        <div className="mb-6">
          <p className="eyebrow">Chapter calendar</p>
          <h3 className="mt-2 text-2xl font-bold text-gt-navy">Upcoming events</h3>
          <p className="mt-2 leading-6 text-slate-600">Event times are shown in Atlanta time. Registration eligibility is enforced by the server.</p>
        </div>
        {eventsError ? <InlineAlert>{eventsError}</InlineAlert> : null}
        {!eventsError && events && events.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gt-gold p-6 text-slate-600">No upcoming chapter events are available right now.</div>
        ) : null}
        {events?.items.length ? (
          <div className="grid gap-4">
            {events.items.map((event) => {
              const current = registrations?.items.find((row) => row.eventId === event.id && row.status === "registered");
              const now = Date.now();
              const registrationNotStarted = Boolean(event.registrationOpensAt && Date.parse(event.registrationOpensAt) > now);
              const registrationEnded = Boolean(event.registrationClosesAt && Date.parse(event.registrationClosesAt) < now);
              const eventAlreadyStarted = Boolean(event.startsAt && Date.parse(event.startsAt) <= now);
              const eventFull = event.capacity !== null && event.registeredCount >= event.capacity;
              const canRegister = memberStatus === "active" && event.publicationStatus === "published" && event.registrationStatus === "open" && !registrationNotStarted && !registrationEnded && !eventAlreadyStarted && !eventFull;
              return (
                <article key={event.id} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gt-dark-gold">{event.category}</p>
                      <h4 className="mt-1 text-lg font-bold text-gt-navy">{event.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <PlatformStatus status={event.publicationStatus} />
                      <PlatformStatus status={event.registrationStatus} />
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{event.description}</p>
                  <dl className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <div><dt className="inline font-bold text-gt-navy">When: </dt><dd className="inline">{event.startsAt ? formatAtlantaDateTime(event.startsAt) : event.timingLabel || "To be announced"}</dd></div>
                    <div><dt className="inline font-bold text-gt-navy">Where: </dt><dd className="inline">{event.location}</dd></div>
                    <div><dt className="inline font-bold text-gt-navy">Registered: </dt><dd className="inline">{event.registeredCount}{event.capacity === null ? "" : ` of ${event.capacity}`}</dd></div>
                  </dl>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {current ? (
                      <>
                        <span className="text-sm font-bold text-emerald-800">You’re registered</span>
                        <button type="button" className="button button-secondary text-sm disabled:opacity-60" disabled={busyKey === `rsvp:${event.id}`} onClick={() => void changeRsvp(event.id, true)}>
                          {busyKey === `rsvp:${event.id}` ? "Cancelling…" : "Cancel RSVP"}
                        </button>
                      </>
                    ) : (
                      <button type="button" className="button button-primary text-sm disabled:cursor-not-allowed disabled:opacity-50" disabled={!canRegister || busyKey === `rsvp:${event.id}`} onClick={() => void changeRsvp(event.id, false)}>
                        {busyKey === `rsvp:${event.id}` ? "Saving RSVP…" : "RSVP"}
                      </button>
                    )}
                    {!canRegister && !current ? (
                      <span className="text-sm text-slate-500">
                        {memberStatus !== "active" ? "An active membership is required to RSVP." : event.publicationStatus !== "published" ? "This event is not currently accepting RSVPs." : event.registrationStatus !== "open" || registrationEnded ? "Registration is closed." : registrationNotStarted ? `Registration opens ${formatAtlantaDateTime(event.registrationOpensAt)}.` : eventAlreadyStarted ? "This event is already in progress." : eventFull ? "This event has reached capacity." : "Registration is unavailable."}
                      </span>
                    ) : null}
                  </div>
                </article>
              );
            })}
            <PageControls page={eventsPage} pageSize={events.pageSize} total={events.total} onChange={(page) => void loadEvents(page).catch((error) => setEventsError(errorMessage(error)))} />
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
