// =============================================================================
// LMSA PLUS AT GEORGIA TECH — OFFICER-EDITABLE PUBLIC CONTENT
// =============================================================================
// Routine updates belong here. Everything in this file is public in the built
// website, even if a component does not currently display it.
//
// PRIVACY: Never add personal phone numbers, private messages, student IDs,
// home addresses, unapproved personal email/social accounts, or internal forms.
// Set unfinished actions to status: "coming-soon" and omit href entirely.
// =============================================================================

import type {
  ActionLink,
  Announcement,
  BoardMember,
  ChapterEvent,
  ChapterInfo,
  CoreValue,
  FAQ,
  NavLink,
  Program,
  ResourceCategory,
  ScholarshipOpportunity,
} from "./site-types";
import { LAST_CONTENT_REVIEW } from "./source-registry";

export const chapterInfo: ChapterInfo = {
  shortName: "LMSA Plus at Georgia Tech",
  fullName: "Latino Medical Student Association Plus Chapter at Georgia Tech",
  campusName: "Georgia Tech",
  foundingYear: "2026",
  launchLabel: "Launching Fall 2026",
  recognitionStatus: "Recognized by Georgia Tech and LMSA PLUS",
  description:
    "A student-led community for Georgia Tech students exploring medicine, health professions, mentorship, service, and Latino/Hispanic health.",
};

export const contactLinks = {
  email: "lmsaplusgatech@gmail.com",
  instagram: "https://www.instagram.com/lmsaplusgatech/",
  instagramHandle: "@lmsaplusgatech",
  interestForm: { status: "active" as const, href: "/interest" },
  newsletterForm: { status: "coming-soon" as const },
  mentorshipForm: { status: "coming-soon" as const },
  volunteerForm: { status: "coming-soon" as const },
  eventSuggestionForm: { status: "coming-soon" as const },
  partnershipForm: { status: "coming-soon" as const },
};

export const navLinks: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/resources" },
  { label: "Get Involved", href: "/get-involved" },
];

export const announcements: Announcement[] = [
  {
    id: "interest-meeting-fall-2026",
    title: "Fall 2026 Interest Meeting",
    summary:
      "Meet the founding board, learn how LMSA PLUS connects pre-health students, and help shape the chapter's first year.",
    timing: "Mid-September 2026 — exact date, time, and location coming soon",
    status: "planned",
    href: "/events",
    featured: true,
  },
  {
    id: "student-org-fair-fall-2026",
    title: "Student Organization Fair",
    summary:
      "The chapter intends to meet students at the Fall 2026 Student Organization Fair.",
    timing: "Fall 2026 — official fair details coming soon",
    status: "planned",
    href: "/events",
    featured: true,
  },
];

export const mission = {
  heading: "Community, guidance, and service for the path into healthcare.",
  paragraphs: [
    "LMSA National unites and empowers current and future physicians through service, mentorship, and education, with a commitment to improving health in Hispanic, Latino, and other historically marginalized communities.",
    "At Georgia Tech, our chapter is building an inclusive starting point for students exploring medicine and other health professions. Local programming will connect cultural community with trustworthy pre-health information, service, mentorship, and opportunities to grow.",
  ],
  sourceUrl: "https://national.lmsa.net/about/organizing-principles/",
};

export const coreValues: CoreValue[] = [
  {
    title: "Unity",
    description:
      "Build relationships across backgrounds, majors, health interests, and stages of the pre-health journey.",
  },
  {
    title: "Service",
    description:
      "Approach community engagement with humility, preparation, accountability, and respect.",
  },
  {
    title: "Mentorship",
    description:
      "Help students find guidance from peers and, as programs develop, medical students and professionals.",
  },
  {
    title: "Education",
    description:
      "Share verified resources that make academic planning and health-professions pathways easier to understand.",
  },
  {
    title: "Advocacy",
    description:
      "Promote representation, culturally responsive care, and attention to disparities affecting underserved communities.",
  },
];

export const lmsaHistory = {
  heading: "A national network with regional and local roots.",
  paragraphs: [
    "LMSA grew from regional Latino medical-student organizations formed in the 1970s and 1980s. Five regions later joined a national consortium in 1998, and the organization adopted the Latino Medical Student Association name during the 2009–2010 academic year.",
    "Today, LMSA organizes its work through the Midwest, Northeast, Southeast, Southwest, and West regions. Georgia belongs to the Southeast region.",
    "LMSA PLUS was founded in 2012 to strengthen mentorship and support at the earliest stages of the health-professions journey. PLUS helps two- and four-year colleges establish chapters and connects pre-health students with peers, medical students, mentors, and regional and national programming.",
  ],
};

export const organizationLevels = [
  {
    title: "LMSA National",
    description:
      "Sets the national mission and connects members to national programming, leadership, scholarships, conferences, advocacy, and a five-region network.",
    href: "https://national.lmsa.net/",
  },
  {
    title: "LMSA Southeast",
    description:
      "Connects chapters across Georgia and ten other states plus Puerto Rico and the Caribbean through regional programs, mentorship, service, and events.",
    href: "https://southeast.lmsa.net/about-us/",
  },
  {
    title: "LMSA PLUS",
    description:
      "Creates a chapter and programming framework for undergraduate and other pre-health students before medical school.",
    href: "https://national.lmsa.net/about-lmsa-plus/",
  },
  {
    title: "Georgia Tech chapter",
    description:
      "Builds local community and programming for Georgia Tech students. Fall 2026 events and forms remain planned until the board confirms details.",
    href: "/programs",
  },
];

export const programs: Program[] = [
  {
    title: "Peer mentorship",
    description:
      "A planned peer network for sharing campus knowledge, encouragement, study strategies, and responsible referrals to official advising.",
    status: "planned",
    category: "Mentorship",
  },
  {
    title: "Medical-student mentorship",
    description:
      "A planned bridge to medical students who can discuss training, applications, identity, and lessons from their own paths.",
    status: "planned",
    category: "Mentorship",
  },
  {
    title: "Physician and health-professional panels",
    description:
      "Planned conversations about specialties, patient care, representation, professional identity, and varied healthcare careers.",
    status: "planned",
    category: "Professional development",
  },
  {
    title: "Pre-health planning workshops",
    description:
      "Planned sessions that point students to Georgia Tech Pre-Health Advising for prerequisites, timelines, workshops, and application guidance.",
    status: "planned",
    category: "Education",
  },
  {
    title: "MCAT and application resource sessions",
    description:
      "Planned walkthroughs of official AAMC, AMCAS, AACOMAS, TMDSAS, fee-assistance, and preparation resources.",
    status: "planned",
    category: "Education",
  },
  {
    title: "Medical Spanish programming",
    description:
      "Planned educational programming focused on language, communication, cultural humility, and the limits of student clinical roles.",
    status: "planned",
    category: "Culture and health",
  },
  {
    title: "Latino/Hispanic health education",
    description:
      "Planned discussions about health disparities, culturally responsive care, representation, and community-informed advocacy.",
    status: "planned",
    category: "Culture and health",
  },
  {
    title: "Community service",
    description:
      "Planned volunteer opportunities developed with attention to community priorities, appropriate training, safety, and Georgia Tech policies.",
    status: "planned",
    category: "Service",
  },
  {
    title: "Culture and community",
    description:
      "Planned gatherings that create belonging, celebrate the breadth of Latino/Hispanic cultures, and welcome students and allies.",
    status: "planned",
    category: "Community",
  },
  {
    title: "Research and clinical-exposure information",
    description:
      "Planned resource sessions highlighting official Georgia Tech research programs and responsible ways to explore clinical environments.",
    status: "planned",
    category: "Exploration",
  },
  {
    title: "Scholarship and opportunity updates",
    description:
      "A planned rhythm of sharing time-sensitive opportunities while directing students to the official source for current requirements.",
    status: "planned",
    category: "Opportunities",
  },
  {
    title: "Campus and community collaboration",
    description:
      "Planned collaboration with Georgia Tech groups, medical schools, and community organizations when a shared activity is formally confirmed.",
    status: "planned",
    category: "Partnerships",
  },
];

export const events: ChapterEvent[] = [
  {
    id: "fall-2026-interest-meeting",
    title: "Fall 2026 Interest Meeting",
    category: "Chapter launch",
    status: "planned",
    displayDate: "Mid-September 2026",
    description:
      "Meet the founding executive board, learn what LMSA PLUS is, explore planned programming, and share what would make the chapter useful to you.",
    registrationStatus: "coming-soon",
    featured: true,
  },
  {
    id: "fall-2026-student-organization-fair-day-1",
    title: "Fall Student Organizations Fair: Day 1",
    category: "Campus outreach",
    status: "planned",
    displayDate: "Tuesday, September 1, 2026",
    startDate: "2026-09-01",
    time: "11:00 AM - 1:00 PM",
    location: "Tech Green and Surrounding Walkways",
    description:
      "Day 1 of Georgia Tech's Fall Student Organizations Fair, hosted by the Center for Student Engagement. Stop by the LMSA Plus table — we will be handing out brochures and some goodies! Meet organization leaders from a select group of 550+ RSOs and kick-start your involvement on campus. Each day features different RSO categories. RSOs that want to table must register on Engage. Contact: Engage@gatech.edu.",
    registrationStatus: "coming-soon",
    featured: true,
  },
  {
    id: "fall-2026-student-organization-fair-day-2",
    title: "Fall Student Organizations Fair: Day 2",
    category: "Campus outreach",
    status: "planned",
    displayDate: "Wednesday, September 2, 2026",
    startDate: "2026-09-02",
    time: "11:00 AM - 1:00 PM",
    location: "Tech Green and Surrounding Walkways",
    description:
      "Day 2 of Georgia Tech's Fall Student Organizations Fair, hosted by the Center for Student Engagement. Stop by the LMSA Plus table — we will be handing out brochures and some goodies! Meet organization leaders from a select group of 550+ RSOs and kick-start your involvement on campus. RSOs that want to table must register on Engage. Contact: Engage@gatech.edu.",
    registrationStatus: "coming-soon",
    featured: true,
  },
  {
    id: "first-general-body-meeting",
    title: "First General Body Meeting",
    category: "Chapter meeting",
    status: "planned",
    displayDate: "Fall 2026 — date to be confirmed",
    description:
      "A planned first meeting for members to connect, review the semester direction, and learn how to participate in early chapter projects.",
    registrationStatus: "coming-soon",
  },
  {
    id: "pre-health-resource-night",
    title: "Pre-Health Resource Night",
    category: "Education",
    status: "planned",
    displayDate: "Concept for 2026–2027",
    description:
      "A planned guided tour of official Georgia Tech advising, academic support, application, research, and opportunity resources.",
    registrationStatus: "coming-soon",
  },
];

export const boardMembers: BoardMember[] = [
  {
    name: "Stacy Lomeli",
    role: "President",
    initials: "SL",
    description:
      "Leads the Georgia Tech chapter's vision, launch timeline, campus presence, and coordination with LMSA National and Southeast leadership.",
    image: {
      src: "/board/stacy-lomeli.png",
      alt: "Headshot of Stacy Lomeli, President of LMSA Plus at Georgia Tech",
    },
  },
  {
    name: "Amanda Ubera-Corona",
    role: "Vice President",
    initials: "AU",
    description:
      "Supports day-to-day chapter operations, helps coordinate programming, and strengthens member engagement as the founding organization takes shape.",
    image: {
      src: "/board/amanda-ubera-corona.jpg",
      alt: "Headshot of Amanda Ubera-Corona, Vice President of LMSA Plus at Georgia Tech",
    },
  },
  {
    name: "Ashley Diaz Duenas",
    role: "Service Chair",
    initials: "AD",
    description:
      "Plans and supports community service and outreach that aligns with LMSA's mission, including volunteer projects and partnerships that serve Hispanic/Latino and underserved communities.",
  },
  {
    name: "Position open",
    role: "Events/Programming Chair",
    initials: "EP",
    openingNote: "Applications open August 3",
    description:
      "Designs and runs chapter programming such as meetings, Q&A panels, workshops, networking nights, and social events that build community and professional development.",
  },
  {
    name: "Position open",
    role: "Marketing/Communications Chair",
    initials: "MC",
    openingNote: "Applications open August 3",
    description:
      "Manages Instagram and chapter messaging—announcements, visuals, and branding—so students stay informed about events, opportunities, and ways to get involved.",
  },
  {
    name: "Position open",
    role: "Outreach/Partnerships Chair",
    initials: "OP",
    openingNote: "Applications open August 3",
    description:
      "Builds collaborations with campus groups, medical schools, community partners, and other LMSA chapters to expand mentorship, outreach, and shared programming.",
  },
];

export const resourceCategories: ResourceCategory[] = [
  {
    category: "Georgia Tech pre-health essentials",
    description:
      "Start with Georgia Tech's own advisors and planning tools before relying on general advice elsewhere.",
    items: [
      {
        title: "Pre-Health Advising",
        description:
          "Overview of professional and peer advising, workshops, Canvas resources, application preparation, and health-professions support.",
        organization: "Georgia Tech Academic Success & Advising",
        href: "https://www.success.gatech.edu/pre-health/",
        category: "Advising",
        timeSensitive: true,
      },
      {
        title: "Schedule a Pre-Health appointment",
        description:
          "Use Navigate360 and choose Non-Major Specific Advising to request an appointment with a Pre-Health advisor.",
        organization: "Georgia Tech",
        href: "https://gatech.navigate.eab.com/",
        category: "Advising",
        timeSensitive: true,
      },
      {
        title: "Join the Pre-Health Canvas site",
        description:
          "Register for the official Canvas resource with advising updates, self-guided materials, and current opportunities.",
        organization: "Georgia Tech Pre-Health Advising",
        href: "https://gatech.co1.qualtrics.com/jfe/form/SV_4NQyFrQ3lUv5vAF",
        category: "Advising",
        timeSensitive: true,
      },
      {
        title: "Pre-health prerequisite guidance",
        description:
          "Review Georgia Tech's current common prerequisite guide, then confirm school-specific policies with advisors and individual programs.",
        organization: "Georgia Tech Pre-Health Advising",
        href: "https://www.success.gatech.edu/files/2025/06/Pre-Health-Prerequisites.pdf",
        category: "Academic planning",
        timeSensitive: true,
      },
      {
        title: "Find your academic advisor",
        description:
          "Locate major-specific advising for degree planning alongside specialized pre-health guidance.",
        organization: "Georgia Tech Advising",
        href: "https://advising.gatech.edu/find-your-advisor",
        category: "Academic planning",
      },
      {
        title: "Tutoring and academic support",
        description:
          "Explore one-to-one tutoring, drop-in help, learning assistants, and other academic support options.",
        organization: "Georgia Tech Academic Success & Advising",
        href: "https://www.success.gatech.edu/tutoring/",
        category: "Academic support",
        timeSensitive: true,
      },
    ],
  },
  {
    category: "Georgia Tech exploration and involvement",
    description:
      "Use official campus programs to explore research, service, organizations, careers, and events.",
    items: [
      {
        title: "Undergraduate Research Opportunities",
        description:
          "Learn how to find faculty-mentored research, register for research credit, and explore PURA funding.",
        organization: "Georgia Tech UROP",
        href: "https://experiential.learning.gatech.edu/urop/",
        category: "Research",
        timeSensitive: true,
      },
      {
        title: "Career Center",
        description:
          "Access career advising, workshops, CareerBuzz, writing guides, and professional-development resources.",
        organization: "Georgia Tech Career Center",
        href: "https://career.gatech.edu/",
        category: "Career development",
        timeSensitive: true,
      },
      {
        title: "Center for Student Engagement",
        description:
          "Find Georgia Tech's official hub for registered organizations, civic engagement, leadership, and involvement resources.",
        organization: "Georgia Tech Student Engagement",
        href: "https://studentengagement.gatech.edu/",
        category: "Campus involvement",
        timeSensitive: true,
      },
      {
        title: "Student Organizations Directory",
        description:
          "Browse Georgia Tech's official Engage directory for registered student organizations and public campus events.",
        organization: "Georgia Tech Engage",
        href: "https://gatech.campuslabs.com/engage/organizations",
        category: "Campus involvement",
        timeSensitive: true,
      },
      {
        title: "Georgia Tech events calendar",
        description:
          "Check current public lectures, workshops, campus programs, and other Institute events.",
        organization: "Georgia Tech",
        href: "https://calendar.gatech.edu/",
        category: "Campus events",
        timeSensitive: true,
      },
    ],
  },
  {
    category: "LMSA network",
    description:
      "Understand the national, regional, and pre-health network beyond the Georgia Tech chapter.",
    items: [
      {
        title: "LMSA National",
        description:
          "Explore the national mission, five regions, programs, leadership, scholarships, and events.",
        organization: "LMSA National",
        href: "https://national.lmsa.net/",
        category: "LMSA",
      },
      {
        title: "About LMSA PLUS",
        description:
          "Learn how the undergraduate society supports pre-health chapter development, programming, community, and networking.",
        organization: "LMSA National",
        href: "https://national.lmsa.net/about-lmsa-plus/",
        category: "LMSA PLUS",
      },
      {
        title: "LMSA National membership",
        description:
          "Review current membership categories, prices, and benefits directly with LMSA before deciding whether to join nationally.",
        organization: "LMSA National",
        href: "https://national.lmsa.net/join/",
        category: "Membership",
        timeSensitive: true,
      },
      {
        title: "LMSA pre-med resources",
        description:
          "Browse LMSA's evolving collection of research, enrichment, MCAT, clinical-exposure, and financial-literacy resources.",
        organization: "LMSA National",
        href: "https://national.lmsa.net/premed-resources/",
        category: "Pre-health resources",
        timeSensitive: true,
      },
      {
        title: "LMSA Southeast",
        description:
          "Visit the regional hub serving Georgia and the broader Southeast network.",
        organization: "LMSA Southeast",
        href: "https://southeast.lmsa.net/",
        category: "Regional network",
        timeSensitive: true,
      },
      {
        title: "Southeast mentorship",
        description:
          "Review the regional mentorship page; confirm the current cycle before using any linked application form.",
        organization: "LMSA Southeast",
        href: "https://southeast.lmsa.net/mentor-program/",
        category: "Mentorship",
        timeSensitive: true,
      },
      {
        title: "Southeast service programming",
        description:
          "Learn about the region's service focus, but verify the current award year and submission forms before participating.",
        organization: "LMSA Southeast",
        href: "https://southeast.lmsa.net/events/southeast-service/",
        category: "Service",
        timeSensitive: true,
      },
      {
        title: "Southeast newsletter and events",
        description:
          "Use the regional newsletter page as a starting point for current announcements; older event listings may remain visible.",
        organization: "LMSA Southeast",
        href: "https://southeast.lmsa.net/events/",
        category: "Regional events",
        timeSensitive: true,
      },
    ],
  },
  {
    category: "Medical-school applications",
    description:
      "Use the application services and associations themselves for current instructions and requirements.",
    items: [
      {
        title: "AAMC pre-med resources",
        description:
          "Explore official guidance for choosing medicine, gaining experience, preparing, applying, and paying for medical school.",
        organization: "Association of American Medical Colleges",
        href: "https://students-residents.aamc.org/",
        category: "MD pathway",
        timeSensitive: true,
      },
      {
        title: "AMCAS",
        description:
          "Read current instructions for the centralized application used by most U.S. MD-granting medical schools.",
        organization: "AAMC",
        href: "https://students-residents.aamc.org/applying-medical-school-amcas/about-amcas-program",
        category: "Application service",
        timeSensitive: true,
      },
      {
        title: "Medical School Admission Requirements (MSAR)",
        description:
          "Compare official school profiles and admissions information; some features require a paid subscription.",
        organization: "AAMC",
        href: "https://students-residents.aamc.org/medical-school-admission-requirements/medical-school-admission-requirements",
        category: "School research",
        timeSensitive: true,
      },
      {
        title: "MCAT information and free study resources",
        description:
          "Review exam content, registration guidance, practice tools, study plans, and other official preparation materials.",
        organization: "AAMC",
        href: "https://students-residents.aamc.org/prepare-mcat-exam/free-planning-and-study-resources",
        category: "MCAT",
        timeSensitive: true,
      },
      {
        title: "Explore osteopathic medicine",
        description:
          "Learn about the DO pathway, admissions expectations, accredited colleges, timelines, and osteopathic medical education.",
        organization: "AACOM",
        href: "https://www.aacom.org/become-a-doctor",
        category: "DO pathway",
        timeSensitive: true,
      },
      {
        title: "AACOMAS",
        description:
          "Use the official centralized application information for U.S. osteopathic medical schools.",
        organization: "AACOM",
        href: "https://www.aacom.org/become-a-doctor/apply-to-medical-school",
        category: "Application service",
        timeSensitive: true,
      },
      {
        title: "TMDSAS",
        description:
          "Review the official application service for participating public medical, dental, and veterinary schools in Texas.",
        organization: "Texas Medical and Dental Schools Application Service",
        href: "https://www.tmdsas.com/",
        category: "Application service",
        timeSensitive: true,
      },
    ],
  },
  {
    category: "Research and enrichment",
    description:
      "Explore structured programs, then confirm each program's current dates and eligibility before applying.",
    items: [
      {
        title: "AAMC summer undergraduate research programs",
        description:
          "Search AAMC's official collection of summer research opportunities for students interested in medicine and biomedical research.",
        organization: "AAMC",
        href: "https://students-residents.aamc.org/getting-experience/summer-undergraduate-research-programs",
        category: "Research",
        timeSensitive: true,
      },
      {
        title: "MD-PhD summer research programs",
        description:
          "Explore research-intensive summer opportunities for students considering combined physician-scientist training.",
        organization: "AAMC",
        href: "https://students-residents.aamc.org/applying-mdphd-programs/md-phd-summer-undergraduate-research-programs",
        category: "Physician-scientist",
        timeSensitive: true,
      },
      {
        title: "Summer Health Professions Education Program",
        description:
          "Learn about SHPEP's free multi-profession summer enrichment model and read its current notice about programming after the 2026 cohort.",
        organization: "SHPEP",
        href: "https://www.shpep.org/",
        category: "Summer enrichment",
        timeSensitive: true,
      },
    ],
  },
];

export const scholarships: ScholarshipOpportunity[] = [
  {
    name: "LMSA National Fall Scholarship Cycle",
    organization: "LMSA National",
    audience:
      "Primarily medical students; the National Conference Travel Scholarship also includes eligible pre-med applicants",
    description:
      "The current fall cycle includes medical-student awards and an NC2026 travel scholarship that lists LMSA National or LMSA PLUS members planning to apply to medical school among eligible audiences.",
    eligibility:
      "Requirements differ by award. Review the official page and application before applying.",
    benefit: "Varies by award; the listed NC2026 travel scholarship provides $500",
    status: "open",
    deadline: "August 2, 2026 at 11:59 p.m. ET",
    sourceUrl: "https://national.lmsa.net/resources/awards/scholarships/",
    category: "LMSA",
    preMedRelevant: true,
    lmsaMembershipRequired: true,
    lastVerified: LAST_CONTENT_REVIEW,
    timeSensitive: true,
    featured: true,
  },
  {
    name: "Carmen Reyes MCAT Scholarship",
    organization: "LMSA National",
    audience: "Pre-medical students preparing to apply to medical school",
    description:
      "The 2026 award supported MCAT registration or preparation expenses for eligible pre-medical students.",
    eligibility:
      "The 2026 cycle required paid LMSA National membership, MCAT registration within the listed testing window, and a service or health-equity commitment.",
    benefit: "2026 cycle: fifteen $350 awards",
    status: "closed",
    deadline: "March 31, 2026",
    sourceUrl:
      "https://national.lmsa.net/resources/awards/lmsa-plus-national-scholarships/",
    category: "MCAT",
    preMedRelevant: true,
    lmsaMembershipRequired: true,
    lastVerified: LAST_CONTENT_REVIEW,
    timeSensitive: true,
  },
  {
    name: "AAMC Fee Assistance Program",
    organization: "AAMC",
    audience: "Eligible students preparing to apply to medical school",
    description:
      "Fee assistance can reduce MCAT costs and provide official preparation products, MSAR access, and AMCAS benefits. Benefits are not retroactive.",
    eligibility:
      "The 2026 program uses address, household-income, parental-information, and application-stage requirements. Read the current Essentials before applying.",
    benefit:
      "Discounted MCAT registration, official prep products, MSAR access, and qualifying AMCAS fee benefits",
    status: "open",
    sourceUrl:
      "https://students-residents.aamc.org/fee-assistance-program/fee-assistance-program",
    category: "Application support",
    preMedRelevant: true,
    lmsaMembershipRequired: false,
    lastVerified: LAST_CONTENT_REVIEW,
    timeSensitive: true,
    featured: true,
  },
  {
    name: "Hispanic Scholarship Fund Scholar Program",
    organization: "Hispanic Scholarship Fund",
    audience: "Eligible high-school, undergraduate, and graduate students",
    description:
      "HSF Scholars receive support services and may be eligible for an award depending on available funds and need.",
    eligibility:
      "The 2026 cycle listed citizenship/status, GPA, full-time enrollment, FAFSA, and Hispanic-heritage requirements on the official page.",
    benefit: "2026 cycle: potential awards of $500–$5,000 based on relative need",
    status: "closed",
    deadline: "February 15, 2026",
    sourceUrl: "https://www.hsf.net/scholarship/",
    category: "Undergraduate scholarship",
    preMedRelevant: true,
    lmsaMembershipRequired: false,
    lastVerified: LAST_CONTENT_REVIEW,
    timeSensitive: true,
  },
  {
    name: "President's Undergraduate Research Award — Travel",
    organization: "Georgia Tech UROP",
    audience: "Georgia Tech undergraduates presenting faculty-mentored work",
    description:
      "PURA Travel Awards help reimburse eligible conference travel for undergraduates accepted to present research, scholarship, or creative work.",
    eligibility:
      "Applicants must meet current Georgia Tech undergraduate, academic-standing, faculty-mentor, presentation, and workshop requirements.",
    benefit: "Up to $1,000 in eligible travel reimbursement",
    status: "open",
    sourceUrl: "https://experiential.learning.gatech.edu/urop/pura-travel/",
    category: "Research funding",
    preMedRelevant: true,
    lmsaMembershipRequired: false,
    lastVerified: LAST_CONTENT_REVIEW,
    timeSensitive: true,
    featured: true,
  },
  {
    name: "President's Undergraduate Research Award — Salary",
    organization: "Georgia Tech UROP",
    audience: "Georgia Tech undergraduates conducting faculty-mentored research",
    description:
      "PURA Salary Awards fund eligible undergraduate research completed with a Georgia Tech or GTRI faculty mentor.",
    eligibility:
      "Current rules include undergraduate standing, a qualifying faculty mentor, research registration, and award-specific restrictions.",
    benefit: "$2,000 salary award",
    status: "closed",
    sourceUrl: "https://experiential.learning.gatech.edu/urop/pura-salary/",
    category: "Research funding",
    preMedRelevant: true,
    lmsaMembershipRequired: false,
    lastVerified: LAST_CONTENT_REVIEW,
    timeSensitive: true,
  },
  {
    name: "Summer Health Professions Education Program",
    organization: "SHPEP",
    audience:
      "Eligible college students exploring medicine, dentistry, nursing, public health, and other health professions",
    description:
      "A free summer enrichment program offering academic planning, exposure, networking, and preparation. SHPEP states that current core funding ends after the 2026 cohort and future plans are under review.",
    eligibility:
      "Review the official eligibility and program-future notices before planning a future application.",
    benefit: "Free summer health-professions enrichment",
    status: "verify-current-cycle",
    sourceUrl: "https://www.shpep.org/",
    category: "Summer program",
    preMedRelevant: true,
    lmsaMembershipRequired: false,
    lastVerified: LAST_CONTENT_REVIEW,
    timeSensitive: true,
  },
  {
    name: "National Health Service Corps Scholarship Program",
    organization: "U.S. Health Resources and Services Administration",
    audience:
      "Students accepted to or enrolled full time in eligible primary-care health-professions programs",
    description:
      "NHSC scholarships support eligible professional training in exchange for service at an approved site in a Health Professional Shortage Area.",
    eligibility:
      "Pre-professional students are not eligible. This is a future opportunity after acceptance into an eligible professional program.",
    benefit: "Tuition and other support defined in the current program guidance",
    status: "closed",
    deadline: "April 16, 2026",
    sourceUrl: "https://nhsc.hrsa.gov/scholarships/how-to-apply",
    category: "Future opportunity after matriculation",
    preMedRelevant: false,
    lmsaMembershipRequired: false,
    lastVerified: LAST_CONTENT_REVIEW,
    timeSensitive: true,
  },
];

export const faqs: FAQ[] = [
  {
    question: "What is LMSA?",
    answer:
      "The Latino Medical Student Association is a national nonprofit network that supports health-professions trainees and works to improve health in Hispanic, Latino, and other historically marginalized communities through service, mentorship, education, advocacy, and community.",
  },
  {
    question: "What is LMSA PLUS?",
    answer:
      "LMSA PLUS is the pre-health and undergraduate chapter framework founded in 2012. It helps students connect earlier with peers, medical students, mentors, and regional and national programming.",
  },
  {
    question: "What is the Georgia Tech chapter?",
    answer:
      "LMSA Plus at Georgia Tech is a recognized student organization and LMSA PLUS chapter preparing to launch public programming in Fall 2026. It is student-led and is not part of Georgia Tech itself; recognition does not mean that the Institute endorses every chapter statement or activity.",
  },
  {
    question: "Who can participate?",
    answer:
      "The chapter is being built for Georgia Tech students interested in medicine, health professions, mentorship, service, and Latino/Hispanic health. The founding board is finalizing detailed participation policies; email the chapter for a situation not covered here.",
  },
  {
    question: "Do I need to identify as Latino or Hispanic?",
    answer:
      "No. LMSA National's organizing principles explicitly include Latino, underrepresented, and allied students and state a commitment to inclusion. Students who respect the mission and want to learn, serve, and contribute are welcome to express interest.",
  },
  {
    question: "Is this only for pre-med students?",
    answer:
      "No. Medicine is an important focus, but LMSA PLUS describes programming for pre-health students interested in MD, DO, and other healthcare fields.",
  },
  {
    question: "Are allied-health students welcome?",
    answer:
      "Yes. Students exploring dentistry, nursing, public health, physician-assistant practice, pharmacy, physical therapy, and other health professions may participate. Some external opportunities on this site have narrower eligibility, so always read the official requirements.",
  },
  {
    question: "Can first-year students participate?",
    answer:
      "Yes. LMSA PLUS is designed to support students early in the journey, and first-year students are encouraged to complete the chapter interest form and attend launch events once details are confirmed.",
  },
  {
    question: "Can graduate students participate?",
    answer:
      "The founding board is finalizing the local participation policy for graduate students. Email the chapter with your program and interests so the board can provide current guidance.",
  },
  {
    question: "Is local participation the same as national LMSA membership?",
    answer:
      "No. Participating in a local chapter and purchasing an individual LMSA National membership are distinct. Some national scholarships, discounts, or other benefits require paid national membership; local Fall 2026 participation details are still being finalized.",
  },
  {
    question: "Does national membership cost money?",
    answer:
      "LMSA National lists paid and free membership categories, and prices can change. Review the official Join page for the current pre-health option. The Georgia Tech chapter has not announced a local membership fee.",
  },
  {
    question: "What benefits may national membership provide?",
    answer:
      "Depending on membership category and current offerings, National may provide access to networks, mentorship, programming, event pricing, scholarships, leadership, and member opportunities. Verify current benefits directly with LMSA National before purchasing.",
  },
  {
    question: "How can students hear about scholarships?",
    answer:
      "Use the Opportunities section on the Resources page, join official Georgia Tech and LMSA communications, and check the sponsoring organization before every application. The chapter plans to share verified reminders without replacing the official source.",
  },
  {
    question: "How can students find mentors?",
    answer:
      "The chapter plans peer and medical-student mentorship pathways. Local matching is not active yet. In the meantime, explore Georgia Tech Pre-Health Advising and review current regional or national mentorship information directly with LMSA.",
  },
  {
    question: "How can students volunteer?",
    answer:
      "Local service opportunities are being developed. Follow the chapter accounts and check Get Involved for updates. Students can also explore Georgia Tech Civic Engagement resources while waiting for chapter-specific opportunities.",
  },
  {
    question:
      "How can physicians, medical students, campus groups, or community organizations collaborate?",
    answer:
      "Email the chapter with your organization, proposed topic or activity, intended audience, and preferred timeline. A message starts a conversation; it does not represent a confirmed partnership until the board approves it.",
  },
  {
    question: "What is the Fall 2026 board structure?",
    answer:
      "The founding Fall 2026 board includes President, Vice President, Service Chair, Events/Programming Chair, Marketing/Communications Chair, and Outreach/Partnerships Chair. Three roles are already filled. Applications for the remaining Fall chairs open August 3, 2026.",
  },
  {
    question: "Will more board positions open later?",
    answer:
      "Yes. In Spring 2027, once the chapter has more members, the board plans to open Secretary, Treasurer/Fundraising Chair, Mentorship Chair, and First-Year Representative. Those are new positions for later in the year—not part of the August 3 Fall application round.",
  },
  {
    question: "When will the first meeting occur?",
    answer:
      "The first Interest Meeting is intended for mid-September 2026. The exact date, time, location, and registration details have not been confirmed. Follow the chapter Instagram or email the chapter for updates.",
  },
];

export const involvementActions: ActionLink[] = [
  {
    label: "Join the interest list",
    description: "Prepare an email sharing the updates and programs that interest you.",
    href: contactLinks.interestForm.href,
    status: "active",
    category: "Membership",
    featured: true,
  },
  {
    label: "Follow chapter updates",
    description: `Follow ${contactLinks.instagramHandle} for public announcements.`,
    href: contactLinks.instagram,
    status: "active",
    category: "Updates",
  },
  {
    label: "Email the chapter",
    description: "Ask a question or introduce a collaboration idea.",
    href: `mailto:${contactLinks.email}`,
    status: "active",
    category: "Contact",
  },
  {
    label: "Mentorship interest",
    description: "The chapter-specific mentorship form is being developed.",
    status: "coming-soon",
    category: "Mentorship",
  },
  {
    label: "Volunteer and service interest",
    description: "The service-interest form will open after opportunities are confirmed.",
    status: "coming-soon",
    category: "Service",
  },
  {
    label: "Suggest an event",
    description: "A structured event-suggestion form is planned.",
    status: "coming-soon",
    category: "Programming",
  },
  {
    label: "Partner with the chapter",
    description: "Email the chapter now; a dedicated partnership form is planned.",
    href: `mailto:${contactLinks.email}?subject=Collaboration%20with%20LMSA%20Plus%20at%20Georgia%20Tech`,
    status: "active",
    category: "Partnerships",
  },
];

export const linktreeLinks: ActionLink[] = [
  involvementActions[0],
  {
    label: "Upcoming Interest Meeting",
    description: "Mid-September 2026; exact details coming soon.",
    href: "/events",
    status: "active",
    category: "Events",
    featured: true,
  },
  {
    label: "Student Organization Fair",
    description: "Fall 2026 fair details have not been announced here yet.",
    status: "coming-soon",
    category: "Events",
  },
  {
    label: "Main Website",
    description: "Explore the full LMSA Plus at Georgia Tech site.",
    href: "/",
    status: "active",
    category: "Chapter",
  },
  involvementActions[1],
  involvementActions[2],
  {
    label: "Newsletter and updates",
    description: "A chapter signup form is being developed.",
    status: "coming-soon",
    category: "Updates",
  },
  involvementActions[3],
  involvementActions[4],
  {
    label: "Georgia Tech Pre-Health Advising",
    description: "Official advising, appointments, workshops, and Canvas resources.",
    href: "https://www.success.gatech.edu/pre-health/",
    status: "active",
    category: "Resources",
  },
  {
    label: "LMSA National",
    description: "Mission, programs, scholarships, events, and the national network.",
    href: "https://national.lmsa.net/",
    status: "active",
    category: "LMSA",
  },
  {
    label: "LMSA Southeast",
    description: "Regional information for Georgia and the Southeast.",
    href: "https://southeast.lmsa.net/",
    status: "active",
    category: "LMSA",
  },
  {
    label: "LMSA National membership",
    description: "Verify current categories, prices, and benefits before joining.",
    href: "https://national.lmsa.net/join/",
    status: "active",
    category: "LMSA",
  },
];

export const creatorCredit = {
  name: "Jason Rivera-Hernandez",
  linkedin: "https://www.linkedin.com/in/jas0nrivera/",
};

export const scholarshipDisclaimer =
  "Scholarship availability, eligibility, award amounts, and deadlines may change. Always confirm current requirements on the official application page.";
