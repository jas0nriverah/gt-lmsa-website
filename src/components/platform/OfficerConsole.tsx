"use client";

import { useEffect, useState } from "react";
import type { MemberHome } from "@/lib/platform-contracts";
import { contactLinks } from "@/lib/site-data";
import { PlatformRequestError, errorMessage, platformRequest } from "./api";
import { GoogleSignInAction, SignOutAction } from "./AuthActions";
import { OfficerAnalytics } from "./OfficerAnalytics";
import { OfficerAttendance } from "./OfficerAttendance";
import { OfficerAudit } from "./OfficerAudit";
import { OfficerEvents } from "./OfficerEvents";
import { OfficerMembers } from "./OfficerMembers";
import { InlineAlert, LoadingState, Panel } from "./ui";

type AccessState = "loading" | "signed-out" | "denied" | "error" | "officer";
type View = "overview" | "members" | "events" | "attendance" | "activity";

const views: { id: View; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "events", label: "Events" },
  { id: "attendance", label: "Attendance" },
  { id: "activity", label: "Activity" },
];

export function OfficerConsole({ authEnabled }: { authEnabled: boolean }) {
  const [state, setState] = useState<AccessState>(authEnabled ? "loading" : "error");
  const [home, setHome] = useState<MemberHome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("overview");

  useEffect(() => {
    const hideOfficerData = () => {
      setHome(null);
      setError(null);
      setView("overview");
      setState("signed-out");
    };
    window.addEventListener("platform:unauthorized", hideOfficerData);
    return () => window.removeEventListener("platform:unauthorized", hideOfficerData);
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!authEnabled) return () => { ignore = true; };
    platformRequest<MemberHome>("/api/platform/me")
      .then((result) => {
        if (ignore) return;
        setHome(result);
        setState(result.isOfficer ? "officer" : "denied");
      })
      .catch((cause: unknown) => {
        if (ignore) return;
        if (cause instanceof PlatformRequestError && cause.status === 401) {
          setState("signed-out");
        } else {
          setError(errorMessage(cause));
          setState("error");
        }
      });
    return () => { ignore = true; };
  }, [authEnabled]);

  if (!authEnabled) {
    return (
      <Panel>
        <div className="grid gap-4">
          <InlineAlert tone="info">Officer sign-in and the chapter database are not configured. The private dashboard is unavailable.</InlineAlert>
          <a className="button button-secondary w-fit" href={`mailto:${contactLinks.email}`}>Contact the chapter: {contactLinks.email}</a>
        </div>
      </Panel>
    );
  }

  if (state === "loading") return <LoadingState label="Checking officer access…" />;

  if (state === "signed-out") {
    return (
      <Panel>
        <div className="grid gap-4">
          <InlineAlert tone="info">Sign in to check whether your account has officer access.</InlineAlert>
          <GoogleSignInAction />
        </div>
      </Panel>
    );
  }

  if (state === "denied") {
    return (
      <Panel>
        <div className="grid gap-4">
          <InlineAlert tone="info">This signed-in account does not have officer dashboard access. Contact a chapter officer if you believe this is an error.</InlineAlert>
          <SignOutAction />
        </div>
      </Panel>
    );
  }

  if (state === "error") {
    return (
      <Panel>
        <div className="grid gap-4">
          <InlineAlert>{error ?? "Officer access could not be checked."}</InlineAlert>
          <button type="button" className="button button-secondary w-fit" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </Panel>
    );
  }

  return (
    <div className="grid gap-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Private dashboard</p>
          <h2 className="mt-2 text-3xl font-bold text-gt-navy">Officer workspace</h2>
        </div>
        <SignOutAction />
      </div>
      <nav aria-label="Officer dashboard views" className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={view === item.id}
            className={`rounded-full px-4 py-2 text-sm font-bold ${view === item.id ? "bg-gt-navy text-white" : "bg-white text-gt-navy ring-1 ring-slate-200 hover:bg-gt-cream"}`}
            onClick={() => setView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div>
        {view === "overview" ? <OfficerAnalytics /> : null}
        {view === "members" ? <OfficerMembers membershipApprovalEnabled={home?.membershipApprovalEnabled ?? false} /> : null}
        {view === "events" ? <OfficerEvents /> : null}
        {view === "attendance" ? <OfficerAttendance /> : null}
        {view === "activity" ? <OfficerAudit /> : null}
      </div>
    </div>
  );
}
