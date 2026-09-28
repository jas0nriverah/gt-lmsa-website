"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PlatformEvent } from "@/lib/platform-contracts";
import { registrationState } from "@/lib/platform-dates";

type RegistrationState =
  | "RSVPs open"
  | "Event full"
  | "Registration closed"
  | "Registration opens soon"
  | "Cancelled"
  | "Planned · schedule to be confirmed"
  | "Checking registration availability…"
  | "Availability unconfirmed"
  | "Event unavailable";

type ApiResponse<T> = {
  data?: T;
  error?: { code?: string; message?: string };
};

function describeAvailability(state: RegistrationState): string {
  switch (state) {
    case "RSVPs open":
      return "Registration is open. Your place is reserved only after your RSVP is confirmed.";
    case "Event full":
      return "This event has reached capacity. Registration is unavailable unless a place opens.";
    case "Registration closed":
      return "Registration is closed for this event.";
    case "Registration opens soon":
      return "Registration has not opened yet.";
    case "Cancelled":
      return "This event has been cancelled. RSVPs are unavailable.";
    case "Planned · schedule to be confirmed":
      return "The schedule is still being confirmed. RSVPs will be available after event details are published.";
    case "Checking registration availability…":
      return "Checking the current registration status…";
    case "Availability unconfirmed":
      return "We couldn’t confirm availability. Check again before submitting an RSVP.";
    case "Event unavailable":
      return "This event is no longer available.";
  }
}

function buttonLabel(state: RegistrationState): string {
  switch (state) {
    case "RSVPs open":
      return "Reserve my place";
    case "Event full":
      return "Event full";
    case "Registration closed":
      return "Registration closed";
    case "Registration opens soon":
      return "Registration opens soon";
    case "Cancelled":
      return "Event cancelled";
    case "Planned · schedule to be confirmed":
      return "Schedule to be confirmed";
    case "Checking registration availability…":
      return "Checking availability…";
    case "Availability unconfirmed":
      return "Check availability";
    case "Event unavailable":
      return "Event unavailable";
  }
}

export function EventRsvp({
  event,
  initialState,
}: {
  event: PlatformEvent;
  initialState: string;
}) {
  const [eventSnapshot, setEventSnapshot] = useState(event);
  const [state, setState] = useState<RegistrationState>(initialState as RegistrationState);
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const refreshTimeBasedState = () => {
      setState((current) => {
        if (current === "Availability unconfirmed" || current === "Event unavailable") {
          return current;
        }
        return registrationState(eventSnapshot) as RegistrationState;
      });
    };

    refreshTimeBasedState();
    const timer = window.setInterval(refreshTimeBasedState, 15_000);
    return () => window.clearInterval(timer);
  }, [eventSnapshot]);

  async function refreshAvailability(): Promise<boolean> {
    setChecking(true);
    setState("Checking registration availability…");

    try {
      const response = await fetch(`/api/platform/events/${event.id}`, { cache: "no-store" });
      if (response.status === 404) {
        setState("Event unavailable");
        return false;
      }

      const payload = await response.json() as ApiResponse<PlatformEvent>;
      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Could not check event availability.");
      }

      setEventSnapshot(payload.data);
      setState(registrationState(payload.data) as RegistrationState);
      setError("");
      return true;
    } catch {
      setState("Availability unconfirmed");
      return false;
    } finally {
      setChecking(false);
    }
  }

  async function register() {
    setPending(true);
    setError("");
    setResult("");

    try {
      const response = await fetch(`/api/platform/events/${event.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const payload = await response.json() as ApiResponse<unknown>;

      if (!response.ok) {
        setError(payload.error?.message ?? "Could not save your RSVP. Please try again.");
        if (response.status === 409) await refreshAvailability();
        return;
      }

      setResult("Your RSVP is saved. View your registration in My membership.");
      void refreshAvailability();
    } catch {
      setError("We couldn’t reach the RSVP service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const canRsvp = state === "RSVPs open";
  const canRefresh = state === "Availability unconfirmed";

  return (
    <div className="card p-7">
      <h2 className="text-2xl font-bold text-gt-navy">Join us</h2>
      <p className="mt-3 leading-7 text-slate-600">
        RSVP with an approved chapter membership. Your place is only reserved once you see confirmation.
      </p>

      <p role="status" aria-live="polite" className="mt-5 font-semibold text-gt-navy">
        {describeAvailability(state)}
      </p>

      <button
        type="button"
        className="button button-primary mt-5"
        disabled={pending || checking || (!canRsvp && !canRefresh)}
        onClick={() => {
          if (canRefresh) void refreshAvailability();
          else if (canRsvp) void register();
        }}
      >
        {pending ? "Saving RSVP…" : checking ? "Checking availability…" : buttonLabel(state)}
      </button>

      {result ? <p role="status" className="mt-4 text-gt-navy">{result}</p> : null}
      {error ? <p role="alert" className="mt-3 text-red-800">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-4">
        <Link className="text-link font-bold" href="/join">Sign in or join</Link>
        <Link className="text-link font-bold" href="/member">My RSVPs</Link>
      </div>
    </div>
  );
}
