"use client";

import { GoogleSignInAction } from "./AuthActions";
import { InlineAlert } from "./ui";

function PrivacyNoticeLink() {
  return (
    <p className="text-sm leading-6 text-slate-600">
      Before continuing, review our <a className="text-link font-semibold" href="/privacy">Privacy Notice</a> to understand how account and profile information is handled.
    </p>
  );
}

export function JoinSignIn({
  authEnabled,
  chapterEmail,
}: {
  authEnabled: boolean;
  chapterEmail: string;
}) {
  if (!authEnabled) {
    return (
      <div className="grid gap-4">
        <InlineAlert tone="info">
          Member sign-in is not configured yet, so applications are not being accepted through this page.
          Email the chapter and we’ll share the next step when the member portal is ready.
        </InlineAlert>
        <PrivacyNoticeLink />
        <a className="button button-secondary w-fit" href={`mailto:${chapterEmail}`}>
          Email {chapterEmail}
        </a>
      </div>
    );
  }

  return (
    <div className="grid justify-items-start gap-4">
      <p className="leading-7 text-slate-600">
        Sign in with Google to create a chapter profile. Google sign-in confirms your account identity; it does not confirm Georgia Tech affiliation or activate membership.
      </p>
      <PrivacyNoticeLink />
      <GoogleSignInAction label="Continue with Google" />
    </div>
  );
}
