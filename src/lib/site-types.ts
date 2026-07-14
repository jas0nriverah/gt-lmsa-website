export type LinkStatus = "active" | "coming-soon";
export type RegistrationStatus = LinkStatus | "not-required";
export type ContentStatus = "planned" | "confirmed" | "past";
export type OpportunityStatus =
  | "open"
  | "upcoming"
  | "recurring"
  | "closed"
  | "verify-current-cycle";

export interface ChapterInfo {
  shortName: string;
  fullName: string;
  campusName: string;
  foundingYear: string;
  launchLabel: string;
  recognitionStatus: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  timing: string;
  status: "planned" | "confirmed";
  href?: string;
  featured: boolean;
}

export interface Partner {
  name: string;
  shortName?: string;
  description: string;
  href: string;
  focus: string;
}

export interface CoreValue {
  title: string;
  description: string;
}

export interface Program {
  title: string;
  description: string;
  status: "planned" | "available";
  category: string;
}

export interface ChapterEvent {
  id: string;
  title: string;
  category: string;
  status: ContentStatus;
  displayDate: string;
  startDate?: string;
  time?: string;
  location?: string;
  description: string;
  registrationUrl?: string;
  registrationStatus: RegistrationStatus;
  featured?: boolean;
  image?: { src: string; alt: string };
  calendarUrl?: string;
}

export interface BoardMember {
  name: string;
  role: string;
  initials: string;
  description: string;
  /** Optional note for open roles, shown as a small label under the name. */
  openingNote?: string;
  /** Optional Google Form (or other) URL for applying to an open role. */
  applicationUrl?: string;
  image?: { src: string; alt: string };
  publicContacts?: Array<{
    label: string;
    href: string;
    approvedForPublicUse: true;
  }>;
}

export interface Resource {
  title: string;
  description: string;
  organization: string;
  href: string;
  category: string;
  timeSensitive?: boolean;
}

export interface ResourceCategory {
  category: string;
  description: string;
  items: Resource[];
}

export interface ScholarshipOpportunity {
  name: string;
  organization: string;
  audience: string;
  description: string;
  eligibility: string;
  benefit?: string;
  status: OpportunityStatus;
  deadline?: string;
  sourceUrl: string;
  category: string;
  preMedRelevant: boolean;
  lmsaMembershipRequired: boolean;
  lastVerified: string;
  timeSensitive: true;
  featured?: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ActionLink {
  label: string;
  description: string;
  href?: string;
  status: LinkStatus;
  category: string;
  featured?: boolean;
}

export interface SourceRecord {
  name: string;
  url: string;
  supports: string[];
  lastVerified: string;
  timeSensitive: boolean;
}
