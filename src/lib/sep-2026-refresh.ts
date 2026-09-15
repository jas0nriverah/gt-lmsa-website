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

/** Mid-September 2026 content refresh overlays (NC2026, campus links, regional context). */

export const nc2026Announcement: Announcement = {
  id: "nc2026-houston",
  title: "LMSA National Conference NC2026",
  summary:
    "The 21st Annual LMSA National Conference meets in Houston under the theme “Cultura Cura: Healing Through Heritage.” Online registration closed September 10, 2026; check the official NC2026 page for current conference information.",
  timing: "September 17–20, 2026 · Houston, Texas",
  status: "confirmed",
  href: "https://national.lmsa.net/programming/nc2026/",
  featured: true,
  endDate: "2026-09-20",
};

export const nc2026Event: ChapterEvent = {
  id: "nc2026-houston",
  title: "LMSA National Conference NC2026",
  category: "National conference",
  status: "confirmed",
  displayDate: "September 17–20, 2026",
  startDate: "2026-09-17",
  endDate: "2026-09-20",
  scope: "national",
  location: "Houston, Texas (Royal Sonesta Houston Galleria)",
  description:
    "National LMSA conference themed “Cultura Cura: Healing Through Heritage.” This is national programming, not a Georgia Tech chapter event. Online registration closed September 10, 2026; visit the official NC2026 page for schedules and on-site details.",
  detailsUrl: "https://national.lmsa.net/programming/nc2026/",
  registrationStatus: "closed",
  featured: true,
};

export const sePlusContactResource: Resource = {
  title: "Southeast PLUS contact",
  description:
    "Email the Southeast LMSA PLUS regional contact for pre-health chapter-development and network questions.",
  organization: "LMSA Southeast PLUS",
  href: "mailto:lmsaplus.southeast@lmsa.net",
  category: "Contact",
};

export const nc2026Resource: Resource = {
  title: "LMSA National Conference NC2026",
  description:
    "Official page for the September 17–20, 2026 national conference in Houston (theme: Cultura Cura: Healing Through Heritage). Online registration closed September 10, 2026.",
  organization: "LMSA National",
  href: "https://national.lmsa.net/programming/nc2026/",
  category: "National events",
  timeSensitive: true,
};

export const georgiaMedChaptersResource: Resource = {
  title: "Georgia LMSA medical-school chapters",
  description:
    "LMSA Southeast lists nearby medical-student chapters—including Emory, Morehouse, Medical College of Georgia, Mercer (Columbus, Macon, Savannah), and PCOM Georgia / South Georgia—that can provide networking and mentorship context for a founding undergraduate PLUS chapter. Confirm current contacts through LMSA Southeast; this listing is regional context, not a claim of formal partnerships with every school.",
  organization: "LMSA Southeast",
  href: "https://southeast.lmsa.net/already-a-chapter/",
  category: "Regional network",
  timeSensitive: true,
};

export const campusCollaboratorsCategory: ResourceCategory = {
  category: "Georgia Tech campus collaborators",
  description:
    "Public Georgia Tech organizations that may be natural collaborators for a founding PLUS chapter. Links are for discovery only—these are potential partners unless an organization appears under confirmed Partners on Get Involved.",
  items: [
    {
      title: "American Medical Student Association (AMSA) at GT",
      description:
        "Campus pre-health organization offering speakers, volunteering, networking, and Georgia Tech’s Annual Pre-Health Conference. A potential collaborator for shared outreach—not listed here as a formal partnership.",
      organization: "Georgia Tech Engage",
      href: "https://gatech.campuslabs.com/engage/organization/american-medical-student-association",
      category: "Campus organization",
      timeSensitive: true,
    },
    {
      title: "MAPS @ Georgia Tech",
      description:
        "Minority Association of Pre-Medical Students chapter focused on diverse pre-med pathways, mentoring, and professional exposure. Explore as a potential campus collaborator.",
      organization: "MAPS @ Georgia Tech",
      href: "http://mapsgt.weebly.com/",
      category: "Campus organization",
      timeSensitive: true,
    },
    {
      title: "Latin American Student Organization (LASO)",
      description:
        "Georgia Tech cultural organization building Latino/Hispanic community through social, cultural, and educational activities. A potential collaborator for cultural programming.",
      organization: "Georgia Tech Engage",
      href: "https://gatech.campuslabs.com/engage/organization/laso",
      category: "Campus organization",
      timeSensitive: true,
    },
    {
      title: "SHPE at Georgia Tech",
      description:
        "Society of Hispanic Professional Engineers chapter supporting Hispanic students in STEM through mentoring, career preparation, outreach, and cultural community. Explore as a potential collaborator.",
      organization: "Georgia Tech Engage",
      href: "https://gatech.campuslabs.com/engage/organization/society-of-hispanic-professional-engineers",
      category: "Campus organization",
      timeSensitive: true,
    },
    {
      title: "Student Hospital Connections",
      description:
        "Pre-health organization connecting Georgia Tech students with Atlanta hospital and clinical volunteering opportunities. A potential collaborator for clinical-exposure information sharing.",
      organization: "Georgia Tech Engage",
      href: "https://gatech.campuslabs.com/engage/organization/student-hospital-connections",
      category: "Campus organization",
      timeSensitive: true,
    },
  ],
};

export const nc2026LinktreeLink: ActionLink = {
  label: "LMSA NC2026 (Houston)",
  description: "Sep 17–20 · Cultura Cura — national conference page",
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
  const explorationIdx = categories.findIndex(
    (c) => c.category === "Georgia Tech exploration and involvement",
  );
  const insertAt = explorationIdx >= 0 ? explorationIdx + 1 : 2;
  categories.splice(insertAt, 0, campusCollaboratorsCategory);

  const lmsaIdx = categories.findIndex((c) => c.category === "LMSA network");
  if (lmsaIdx >= 0) {
    const lmsa = categories[lmsaIdx];
    const aboutPlusIdx = lmsa.items.findIndex((i) => i.title === "About LMSA PLUS");
    const items = [...lmsa.items];
    const contactInsertAt = aboutPlusIdx >= 0 ? aboutPlusIdx + 1 : 2;
    items.splice(contactInsertAt, 0, sePlusContactResource);
    items.push(nc2026Resource, georgiaMedChaptersResource);
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
