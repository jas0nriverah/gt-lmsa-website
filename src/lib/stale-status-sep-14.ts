import type {
  Announcement,
  ChapterEvent,
  FAQ,
  ScholarshipOpportunity,
} from "./site-types";
import {
  announcements as refreshedAnnouncements,
  events as refreshedEvents,
} from "./sep-2026-refresh";
import { faqs as baseFaqs, scholarships as baseScholarships, interestMeetingTiming } from "./site-data";
import { LAST_CONTENT_REVIEW } from "./source-registry";

/** September 14–22, 2026 stale opportunity/event status refresh (daily 2026-09-22; NC2026 archived; PURA deadline Oct 12). */

const PAST_EVENT_IDS = new Set([
  "pre-health-fall-kickoff-2026",
  "fall-2026-student-organization-fair-day-1",
  "nc2026-houston",
]);

const PAST_ANNOUNCEMENT_IDS = new Set([
  "pre-health-fall-kickoff-2026",
  "student-org-fair-fall-2026",
  "nc2026-houston",
]);

const RECHECKED_CLOSED = new Set([
  "Carmen Reyes MCAT Scholarship",
  "Hispanic Scholarship Fund Scholar Program",
  "National Health Service Corps Scholarship Program",
]);

export const scholarships: ScholarshipOpportunity[] = baseScholarships.map(
  (opportunity) => {
    if (opportunity.name === "LMSA National Fall Scholarship Cycle") {
      return {
        ...opportunity,
        status: "closed",
        description:
          "The 2026 fall cycle included medical-student awards and an NC2026 travel scholarship that listed LMSA National or LMSA PLUS members planning to apply to medical school among eligible audiences. The listed application deadline has passed.",
        lastVerified: LAST_CONTENT_REVIEW,
      };
    }
    if (opportunity.name === "Summer Health Professions Education Program") {
      return {
        ...opportunity,
        status: "closed",
        description:
          "SHPEP concluded its final summer cohort in 2026. The official website is preserved as a historical resource celebrating more than three decades of the program; there is no new application cycle to plan around.",
        eligibility:
          "No current application cycle. Review the historical SHPEP site only for legacy program context.",
        lastVerified: LAST_CONTENT_REVIEW,
      };
    }
    if (opportunity.name === "President's Undergraduate Research Award \u2014 Salary") {
      return {
        ...opportunity,
        status: "open",
        deadline: "October 12, 2026",
        description:
          "PURA Salary Awards fund eligible undergraduate research completed with a Georgia Tech or GTRI faculty mentor. The Spring 2027 funding cycle lists an October 12 application deadline on the official UROP page (applications open).",
        sourceUrl: "https://experiential.learning.gatech.edu/urop/pura-salary/",
        lastVerified: LAST_CONTENT_REVIEW,
      };
    }
    if (RECHECKED_CLOSED.has(opportunity.name)) {
      return {
        ...opportunity,
        lastVerified: LAST_CONTENT_REVIEW,
      };
    }
    return {
      ...opportunity,
      lastVerified: LAST_CONTENT_REVIEW,
    };
  },
);

export const events: ChapterEvent[] = refreshedEvents.map((event) => {
  if (PAST_EVENT_IDS.has(event.id)) {
    return {
      ...event,
      status: "past",
      featured: false,
    };
  }
  if (event.id === "fall-2026-interest-meeting") {
    return {
      ...event,
      displayDate: `Date TBD \u2014 ${interestMeetingTiming}`,
      description:
        "Meet the founding executive board, learn what LMSA PLUS is, explore planned programming, and share what would make the chapter useful to you. Exact date, time, and location are not confirmed yet.",
    };
  }
  return event;
});

export const announcements: Announcement[] = refreshedAnnouncements
  .filter((announcement) => !PAST_ANNOUNCEMENT_IDS.has(announcement.id))
  .map((announcement) => {
    if (announcement.id === "interest-meeting-fall-2026") {
      return {
        ...announcement,
        timing:
          `Date TBD \u2014 ${interestMeetingTiming} (time and location coming soon)`,
      };
    }
    return announcement;
  });

export const faqs: FAQ[] = baseFaqs.map((faq) => {
  if (faq.question === "When will the first meeting occur?") {
    return {
      ...faq,
      answer:
        `The first Interest Meeting is planned for ${interestMeetingTiming}. Exact date, time, location, and registration details have not been confirmed. Follow the chapter Instagram or email the chapter for updates.`,
    };
  }
  if (faq.question === "How can students hear about scholarships?") {
    return {
      ...faq,
      answer:
        "Use the Opportunities page for scholarships, fee assistance, research funding, and enrichment programs; join official Georgia Tech and LMSA communications; and check the sponsoring organization before every application. The chapter plans to share verified reminders without replacing the official source.",
    };
  }
  return faq;
});
