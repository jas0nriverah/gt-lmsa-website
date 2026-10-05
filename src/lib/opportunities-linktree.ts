import type { ActionLink } from "./site-types";
import { linktreeLinks as refreshedLinktreeLinks } from "./sep-2026-refresh";
import { FIRST_CHAPTER_EVENT } from "./first-chapter-event";

/** Opportunities page link for the /links hub (P0.2). */

export const opportunitiesLinktreeLink: ActionLink = {
  label: "Scholarships & Opportunities",
  description: "Funding, fee assistance, and enrichment programs.",
  href: "/opportunities",
  status: "active",
  category: "Resources",
};

export const firstMeetingEngageLink: ActionLink = {
  label: "RSVP: LMSA+ Interest Meeting",
  description: `${FIRST_CHAPTER_EVENT.timing} · ${FIRST_CHAPTER_EVENT.location}. RSVP through Georgia Tech Engage.`,
  href: FIRST_CHAPTER_EVENT.engageUrl,
  status: "active",
  category: "Events",
  featured: true,
  endDate: FIRST_CHAPTER_EVENT.endDate,
};

export const linktreeLinks: ActionLink[] = (() => {
  const links = [firstMeetingEngageLink, ...refreshedLinktreeLinks];
  const resourcesIdx = links.findIndex((l) => l.label === "Chapter Resources");
  if (resourcesIdx >= 0) {
    links[resourcesIdx] = {
      ...links[resourcesIdx],
      description: "Official advising, LMSA, and application links.",
    };
    links.splice(resourcesIdx + 1, 0, opportunitiesLinktreeLink);
  } else {
    links.push(opportunitiesLinktreeLink);
  }
  return links;
})();
