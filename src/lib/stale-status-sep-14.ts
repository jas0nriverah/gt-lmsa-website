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
import { contactLinks, faqs as baseFaqs, scholarships as baseScholarships, interestMeetingTiming } from "./site-data";
import { LAST_CONTENT_REVIEW } from "./source-registry";

/** October 18, 2026 Sunday deep audit (PURA Salary Spring 2027 deadline Oct 16 passed — flipped to closed; Interest Meeting Oct 15 past — retired via date checks; YPI omission unchanged; MAPS Pre-Health Fair Oct 27 added as external). */

const PAST_EVENT_IDS = new Set([
  "pre-health-fall-kickoff-2026",
  "fall-2026-student-organization-fair-day-1",
  "nc2026-houston",
]);

const PAST_ANNOUNCEMENT_IDS = new Set([
  "pre-health-fall-kickoff-2026",
  "student-org-fair-fall-2026",
  "nc2026-houston",
  "interest-meeting-fall-2026",
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
        status: "closed",
        deadline: "October 16, 2026",
        description:
          "PURA Salary Awards fund eligible undergraduate research completed with a Georgia Tech or GTRI faculty mentor. The Spring 2027 application deadline (extended to October 16, 2026) has passed. The official UROP page lists Summer 2027 and Fall 2027 deadlines as TBD — check there for the next cycle.",
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
      displayDate: interestMeetingTiming,
      description:
        "Meet the founding executive board, learn about LMSA+ at Georgia Tech, explore service and professional-development opportunities, and find ways to get involved. Scheduled for Thursday, October 15, 2026, 6:30–7:30 PM EDT in Instructional Center (IC), Room 115 (Georgia Tech Engage).",
    };
  }
  return event;
});

export const announcements: Announcement[] = refreshedAnnouncements
  .filter((announcement) => !PAST_ANNOUNCEMENT_IDS.has(announcement.id));

export const faqs: FAQ[] = baseFaqs.map((faq) => {
  if (faq.question === "When will the first meeting occur?") {
    return {
      ...faq,
      question: "When was the first chapter meeting?",
      answer:
        `The first LMSA+ Interest Meeting was scheduled for Thursday, October 15, 2026, from 6:30–7:30 PM EDT in Instructional Center (IC), Room 115. New chapter dates will appear on the Events page when announced; follow ${contactLinks.instagramHandle} on Instagram for updates.`,
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
