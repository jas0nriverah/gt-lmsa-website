export interface OpenOpportunity {
  id: string;
  title: string;
  organization: string;
  category: string;
  audience: string;
  summary: string;
  eligibility: string[];
  applicationChecklist: string[];
  deadline: string;
  /** Full timestamp with an explicit timezone; omit for rolling opportunities. */
  deadlineAt?: string;
  sourceUrl: string;
  secondarySourceUrl?: string;
  featuredOnHome?: boolean;
}

export const OPEN_OPPORTUNITIES_REVIEWED = "October 19, 2026";

/**
 * Curated opportunities whose current application window is open. The home
 * page and the top of /opportunities use this same list. Dated listings are
 * hidden automatically after their published deadline.
 */
export const openOpportunities: OpenOpportunity[] = [
  {
    id: "goldwater-summer-research-internship-2027",
    title: "Goldwater Summer Research Internship, 2027",
    organization: "Barry Goldwater Scholarship and Excellence in Education Foundation",
    category: "Paid summer research",
    audience: "Undergraduate freshmen and sophomores at U.S. colleges",
    summary:
      "New summer research placements in chemistry, computing, engineering, life sciences, and physics. The program lists $10,500 to cover the internship and related expenses.",
    eligibility: [
      "Currently an undergraduate freshman or sophomore at an accredited two-year or four-year U.S. institution.",
      "U.S. citizen or permanent resident.",
      "Project-specific schedules, prior-experience expectations, housing, and costs vary; read each project description.",
    ],
    applicationChecklist: [
      "Submit the online application and choose up to two projects.",
      "Review the selected projects for any additional materials and logistics.",
    ],
    deadline: "November 2, 2026",
    deadlineAt: "2026-11-02T23:59:59-05:00",
    sourceUrl: "https://www.goldwaterinternship.gov/",
    featuredOnHome: true,
  },
  {
    id: "georgia-tech-first-year-merit-scholarships-2027",
    title: "Georgia Tech first-year merit scholarships",
    organization: "Georgia Tech Undergraduate Admission",
    category: "Scholarship consideration",
    audience: "High school seniors applying as first-year students from outside Georgia",
    summary:
      "Apply through Early Action 2 to be considered for merit awards, including the Stamps President’s Scholars Program and Georgia Tech Gold Scholarship. There is no separate scholarship application.",
    eligibility: [
      "Must be applying to Georgia Tech as a first-year student; Early Action 2 is for non-Georgia applicants.",
      "Complete a Common Application, transcript, SAT/ACT score submission, and any other materials requested in the admission portal.",
      "The admissions page lists November 2, 2026 as the Early Action 2 application deadline; all deadlines are 11:59 p.m. in the applicant’s time zone.",
    ],
    applicationChecklist: [
      "Submit the Common Application and required admission materials by the Early Action 2 deadline.",
      "Submit any remaining documents by the separate document deadline shown on the admissions page.",
    ],
    deadline: "November 2, 2026 · Early Action 2 application",
    deadlineAt: "2026-11-02T23:59:59-05:00",
    sourceUrl: "https://admission.gatech.edu/first-year/deadlines",
    secondarySourceUrl: "https://goldscholars.em.gatech.edu/apply/selection-process",
    featuredOnHome: true,
  },
  {
    id: "doe-suli-summer-2027",
    title: "DOE Science Undergraduate Laboratory Internships (SULI)",
    organization: "U.S. Department of Energy Office of Science",
    category: "Paid summer research",
    audience: "Full-time undergraduates and eligible recent graduates",
    summary:
      "Paid 10-week research internships at participating Department of Energy laboratories and facilities.",
    eligibility: [
      "Full-time enrollment at an accredited undergraduate institution, or meet the DOE definition for an eligible recent graduate.",
      "By the application deadline: at least one matriculated semester, 12 total undergraduate credits including 6 STEM credits, and a cumulative college GPA of at least 3.0.",
      "At least 18 years old when the internship begins; U.S. citizen or lawful permanent resident.",
    ],
    applicationChecklist: [
      "Complete the online application, including laboratory choices, research interests, and essays.",
      "Upload current and applicable prior undergraduate transcripts with personal information redacted.",
      "Request two letters of support through the online system.",
    ],
    deadline: "January 6, 2027 at 5:00 p.m. ET",
    deadlineAt: "2027-01-06T17:00:00-05:00",
    sourceUrl: "https://science.osti.gov/wdts/suli/how-to-apply",
    secondarySourceUrl: "https://science.osti.gov/wdts/suli/Eligibility",
    featuredOnHome: true,
  },
  {
    id: "georgia-tech-aid-2027-28",
    title: "Georgia Tech 2027–28 financial aid and scholarship application",
    organization: "Georgia Tech Office of Scholarships and Financial Aid",
    category: "Scholarships and financial aid",
    audience: "Returning Georgia Tech undergraduate students applying for 2027–28 aid",
    summary:
      "The 2027–28 Georgia Tech aid application and FAFSA are open. Returning students must reapply each year to be considered for aid and renewal of previous scholarships.",
    eligibility: [
      "Complete the 2027–28 Georgia Tech Application for Scholarships and Financial Aid (GT App) in OSCAR using a GT account.",
      "Complete the 2027–28 FAFSA for federal aid or need-based institutional funds; the FAFSA uses 2025 tax information.",
      "Georgia residents seeking only HOPE or Zell Miller may submit GSFAPPS instead of FAFSA, but still need the GT App.",
    ],
    applicationChecklist: [
      "Submit all forms and requested documents by January 31, 2027 for on-time consideration for need-based institutional aid and renewal of prior scholarships.",
      "Check the OSFA instructions for your student type and any requested documents.",
    ],
    deadline: "January 31, 2027",
    deadlineAt: "2027-01-31T23:59:59-05:00",
    sourceUrl: "https://finaid.gatech.edu/apply/returning-undergraduate/",
    secondarySourceUrl: "https://studentaid.gov/announcements-events/fafsa-support",
    featuredOnHome: true,
  },
  {
    id: "georgia-tech-sure-2027",
    title: "Georgia Tech SURE 2027",
    organization: "Georgia Tech College of Engineering",
    category: "Summer research",
    audience: "Rising juniors and seniors in computing, engineering, science, or technology",
    summary:
      "A summer research experience at Georgia Tech. Program dates are May 23–July 30, 2027; prior research experience is helpful but not required.",
    eligibility: [
      "Rising junior or senior at a U.S. college or university; must not have graduated by May 2027.",
      "Computing, engineering, science, or other technology major; cumulative GPA of at least 2.75.",
      "U.S. citizen or permanent resident; interested in attending graduate school.",
    ],
    applicationChecklist: [
      "Submit a statement of interest and unofficial transcript through Georgia Tech’s InfoReady portal.",
      "Request one recommendation letter from a faculty member; all materials are due by February 15, 2027.",
    ],
    deadline: "February 15, 2027",
    deadlineAt: "2027-02-15T23:59:59-05:00",
    sourceUrl: "https://sure.gatech.edu/apply",
    secondarySourceUrl: "https://sure.gatech.edu/frequently-asked-questions",
    featuredOnHome: true,
  },
  {
    id: "goldwater-scholarship-2027",
    title: "Barry Goldwater Scholarship, 2027 competition",
    organization: "Barry Goldwater Scholarship and Excellence in Education Foundation",
    category: "Research scholarship",
    audience: "Sophomores and juniors pursuing research careers in science, math, or engineering",
    summary:
      "The 2027 nomination cycle is open. Georgia Tech students must first contact the campus fellowship adviser because the institution sets an earlier internal selection deadline.",
    eligibility: [
      "Sophomore or junior at an accredited U.S. two-year or four-year institution and full-time during funded terms.",
      "Cumulative college GPA of at least 3.0 and a research career goal in natural science, mathematics, or engineering; medicine qualifies when research is central to the career plan.",
      "U.S. citizen, U.S. national, or U.S. permanent resident.",
    ],
    applicationChecklist: [
      "Start with the Goldwater Student Interest Form and contact Georgia Tech Prestigious Fellowships Advising about the campus deadline.",
      "If selected for nomination, prepare the questionnaire, research essay, three recommendation letters, and transcripts.",
    ],
    deadline: "Campus deadline varies; national nomination deadline January 29, 2027 at 5:00 p.m. CT",
    deadlineAt: "2027-01-29T18:00:00-05:00",
    sourceUrl: "https://goldwaterscholarship.gov/students/nomination/",
    secondarySourceUrl: "https://www.success.gatech.edu/prestigious-fellowships/",
  },
  {
    id: "truman-scholarship-2027",
    title: "Harry S. Truman Scholarship, 2027 competition",
    organization: "Harry S. Truman Scholarship Foundation",
    category: "Leadership and public-service scholarship",
    audience: "Full-time undergraduate juniors planning a career in public service",
    summary:
      "The 2027 competition is underway and offers up to $30,000 for graduate or professional study. Students must be nominated by their institution.",
    eligibility: [
      "Full-time junior-level student at a four-year institution during 2026–27; expected graduation generally December 2027–August 2028.",
      "U.S. citizen or U.S. national from American Samoa, nominated by the institution, and in the upper quarter of the class.",
      "Strong public/community service and leadership record, with plans for a career in government or another public-service field.",
    ],
    applicationChecklist: [
      "Contact Georgia Tech Prestigious Fellowships Advising now for the campus nomination process and internal deadline.",
      "Nominees complete the application and supporting materials through the Foundation’s system.",
    ],
    deadline: "February 2, 2027 · national nominee deadline",
    deadlineAt: "2027-02-02T23:59:59-05:00",
    sourceUrl: "https://www.truman.gov/apply/applying/2026-announcements",
    secondarySourceUrl: "https://www.truman.gov/apply/applying/bulletin-information",
  },
  {
    id: "gt-lead-fellows-2026-27",
    title: "Georgia Tech LEAD Fellows (coaches)",
    organization: "Georgia Tech Leadership Education and Development",
    category: "Leadership",
    audience: "Upper-level Georgia Tech undergraduate and graduate students",
    summary:
      "Coach Georgia Tech students developing their leadership skills. AY 2026–27 student applications are open on a rolling basis.",
    eligibility: [
      "Upper-level Georgia Tech undergraduate or graduate student.",
      "Demonstrated leadership experience and a commitment to coaching and developing others.",
      "Plan for weekly coaching, training, and program activities; the page lists about 1–2 hours per week and up to 2–3 hours during some activities.",
    ],
    applicationChecklist: [
      "Use the student application linked from the official LEAD Fellows page.",
      "Applications are reviewed on a rolling basis; the program describes a fall training and fall-to-spring commitment.",
    ],
    deadline: "Rolling application · AY 2026–27",
    sourceUrl: "https://leadership.gatech.edu/programs/lead-fellows-coaches",
  },
];

function nowHasPassed(deadlineAt: string) {
  return Date.now() > new Date(deadlineAt).getTime();
}

export function getOpenNowOpportunities() {
  return openOpportunities.filter(
    (opportunity) => !opportunity.deadlineAt || !nowHasPassed(opportunity.deadlineAt),
  );
}

export function getHomeOpenOpportunities() {
  return getOpenNowOpportunities().filter((opportunity) => opportunity.featuredOnHome);
}
