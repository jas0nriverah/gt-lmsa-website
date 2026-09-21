import type {
  ActionLink,
  Announcement,
  ChapterEvent,
  Resource,
  ResourceCategory,
} from "./site-types";
import {
  announcements as baseAnnouncements,
  events as baseEvents,
  linktreeLinks as baseLinktreeLinks,
  resourceCategories as baseResourceCategories,
} from "./site-data";

/** Mid–late September 2026 content refresh overlays (NC2026 archived after Sep 20; regional context). */

export const nc2026Announcement: Announcement = {
  id: "nc2026-houston",
  title: "LMSA National Conference NC2026",
  summary:
    "The 21st Annual LMSA National Conference concluded in Houston (September 17–20, 2026) under the theme “Cultura Cura: Healing Through Heritage.” Online registration closed September 10, 2026. See the official NC2026 page for conference archives and related national programming.",
  timing: "September 17–20, 2026 · Houston, Texas (concluded)",
  status: "confirmed",
  href: "https://national.lmsa.net/programming/nc2026/",
  featured: false,
  endDate: "2026-09-20",
};

export const nc2026Event: ChapterEvent = {
  id: "nc2026-houston",
  title: "LMSA National Conference NC2026",
  category: "National conference",
  status: "past",
  displayDate: "September 17–20, 2026",
  startDate: "2026-09-17",
  endDate: "2026-09-20",
  scope: "national",
  location: "Houston, Texas (Royal Sonesta Houston Galleria)",
  description:
    "National LMSA conference themed “Cultura Cura: Healing Through Heritage.” This was national programming, not a Georgia Tech chapter event. Online registration closed September 10, 2026; the conference ran September 17–20, 2026 in Houston. Visit the official NC2026 page for archives and related national programming.",
  detailsUrl: "https://national.lmsa.net/programming/nc2026/",
  registrationStatus: "closed",
  featured: false,
};

export const nc2026Resource: Resource = {
  title: "LMSA National Conference NC2026",
  description:
    "Official page for the September 17–20, 2026 national conference in Houston (theme: Cultura Cura: Healing Through Heritage). The conference concluded September 20, 2026; online registration closed September 10, 2026.",
  organization: "LMSA National",
  href: "https://national.lmsa.net/programming/nc2026/",
  category: "National events",
  timeSensitive: true,
};

export const georgiaMedChaptersResource: Resource = {
  title: "Georgia LMSA medical-school chapters",
  description:
    "LMSA Southeast lists nearby medical-student chapters—including Emory, Morehouse, Medical College of Georgia, Mercer (Columbus, Macon, Savannah), and PCOM Georgia / South Georgia—for students seeking regional networking and peer connections.",
  organization: "LMSA Southeast",
  href: "https://southeast.lmsa.net/already-a-chapter/",
  category: "Regional network",
  timeSensitive: true,
};

export const nc2026LinktreeLink: ActionLink = {
  label: "LMSA NC2026 (Houston)",
  description: "Sep 17–20 · Cultura Cura — concluded · national conference archive",
  href: "https://national.lmsa.net/programming/nc2026/",
  status: "active",
  category: "Events",
  endDate: "2026-09-20",
};

export const announcements: Announcement[] = [
  nc2026Announcement,
  ...baseAnnouncements,
];

export const events: ChapterEvent[] = [nc2026Event, ...baseEvents];

export const resourceCategories: ResourceCategory[] = (() => {
  const categories = [...baseResourceCategories];
  const lmsaIdx = categories.findIndex((c) => c.category === "LMSA network");
  if (lmsaIdx >= 0) {
    const lmsa = categories[lmsaIdx];
    const items = [...lmsa.items, nc2026Resource, georgiaMedChaptersResource];
    categories[lmsaIdx] = { ...lmsa, items };
  }
  return categories;
})();

export const linktreeLinks: ActionLink[] = (() => {
  const links = [...baseLinktreeLinks];
  const fairIdx = links.findIndex(
    (l) => l.label === "Fall Student Organizations Fair",
  );
  const insertAt = fairIdx >= 0 ? fairIdx + 1 : 6;
  links.splice(insertAt, 0, nc2026LinktreeLink);
  return links;
})();
