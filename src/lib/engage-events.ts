import type { PlatformEvent } from "./platform-contracts";

/** Official RSVP destination supplied for the Fall 2026 interest meeting. */
export const ENGAGE_INTEREST_MEETING_RSVP_URL =
  "https://gatech.campuslabs.com/engage/event/12844813/attend?Vud=10/18/2026&Vut=23:30:00&Hash=VhMRUBMTHtrRMkq_HjD0l-N_eZYFMHGJvlwTNSTWtSWs0n2soLelhkeYGLi_2-o4NmzTt_UCH0CWbZiMcqchK3LUCMoimhw334nIvKYMlhgxti-6AR6EY8kytR6AVsUvnRD_kYnDqWiCWZQKQ8Co3h0PPIjx1vdHcIn_TDACUggcs1H1rIKQeWs816EIn3tHlogBgkj0zzbgi8aULQxhPwFXu5m7vGQsZfMuhGGK6FsnJ_E5i6zCy6asLC1tRtYEsbpWt1utjKcurOhNFfRMSFbuprF_ttZXN1g0FL8iV0AMWotGpNWOE2yuTd3RF-dxrZ61fitoGI8Gq3VvEWpBvQ";

/** Keep this event's registration on Georgia Tech Engage instead of the chapter RSVP tracker. */
export function engageRsvpUrlForEvent(
  event: Pick<PlatformEvent, "title" | "startsAt">,
): string | undefined {
  const isInterestMeeting = /interest meeting/i.test(event.title);
  const isFall2026Meeting = event.startsAt?.slice(0, 10) === "2026-10-15";

  return isInterestMeeting && isFall2026Meeting
    ? ENGAGE_INTEREST_MEETING_RSVP_URL
    : undefined;
}
