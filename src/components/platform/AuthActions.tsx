"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { InlineAlert } from "./ui";

export function GoogleSignInAction({ label = "Sign in with Google" }: { label?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: "/member" });
      if (result?.error) throw new Error(result.error.message || "Google sign-in could not be started.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in could not be started. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="grid justify-items-start gap-3">
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <button type="button" className="button button-primary disabled:cursor-wait disabled:opacity-60" disabled={pending} onClick={signIn}>
        {pending ? "Connecting to Google…" : label}
      </button>
    </div>
  );
}

export function SignOutAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signOut();
      if (result?.error) throw new Error(result.error.message || "Sign-out could not be completed.");
      router.replace("/join");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-out could not be completed. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="grid justify-items-start gap-3">
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <button type="button" className="button button-secondary disabled:opacity-60" disabled={pending} onClick={signOut}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
