// =============================================================================
// LMSA PLUS WEBSITE CONTENT — THIS IS THE MAIN FILE STACY/OFFICERS SHOULD EDIT
// =============================================================================
//
// Most website updates happen in this file. You do not need to understand React
// to update events, links, officers, resources, or chapter wording.
//
// HOW TO MAKE A CHANGE:
//   1. Find the clearly labeled section below.
//   2. Edit the words inside quotation marks.
//   3. Save the file.
//   4. Commit and push to GitHub.
//   5. Vercel automatically updates the live website online.
//
// IMPORTANT:
//   - Keep quotation marks " " and commas , in place.
//   - To add an event/officer/resource, copy an existing { ... } block.
//   - To hide a link that is not ready, set comingSoon: true.
//
// =============================================================================


// -----------------------------------------------------------------------------
// 1. CHAPTER IDENTITY  ←  EDIT CHAPTER NAME, YEAR, AND STATUS HERE
// -----------------------------------------------------------------------------
export const chapterInfo = {
  shortName: "LMSA Plus Chapter at Georgia Tech",
  fullName: "Latino Medical Student Association Plus Chapter at Georgia Tech",
  campusName: "Georgia Tech",
  foundingYear: "2026",
  recognitionStatus: "Officially recognized student organization",
  preferredCommunityWording: "Latino/Hispanic",
  heroHeadline: "Latino/Hispanic pre-health students, supported together.",
  heroSubheadline:
    "An officially recognized Georgia Tech student organization building community, mentorship, service, and medical school preparation for future health professionals.",
};


// -----------------------------------------------------------------------------
// 2. CONTACT LINKS  ←  EDIT EMAIL, INSTAGRAM, GOOGLE FORMS, NEWSLETTER HERE
// -----------------------------------------------------------------------------
// membershipForm, mentorshipForm, and newsletterForm are placeholders for now.
// When the real Google Form URLs are ready, replace "#" with the full URL and
// change the related comingSoon value below from true to false.
export const contactLinks = {
  email: "lmsaplusgatech@gmail.com",
  instagram: "https://www.instagram.com/lmsaplusgatech/",
  instagramHandle: "@lmsaplusgatech",

  membershipForm: "#contact",
  membershipLabel: "Membership form coming soon",
  membershipComingSoon: true,

  mentorshipForm: "#contact",
  mentorshipLabel: "Mentorship form coming soon",
  mentorshipComingSoon: true,

  newsletterForm: "#newsletter",
  newsletterLabel: "Newsletter signup coming soon",
  newsletterComingSoon: true,
};


// -----------------------------------------------------------------------------
// 3. NAVIGATION LINKS  ←  TOP MENU LINKS
// -----------------------------------------------------------------------------
export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "What We Do", href: "#what-we-do" },
  { label: "Events", href: "#events" },
  { label: "Board", href: "#board" },
  { label: "Resources", href: "#resources" },
  { label: "Contact", href: "#contact" },
];


// -----------------------------------------------------------------------------
// 4. HERO QUICK FACTS  ←  SMALL FACT CARDS NEAR THE TOP
// -----------------------------------------------------------------------------
export const heroStats = [
  { value: "2026", label: "Founded at Georgia Tech" },
  { value: "Official", label: "Recognized student organization" },
  { value: "Latino/Hispanic", label: "Pre-health community" },
];


// -----------------------------------------------------------------------------
// 5. MISSION / ABOUT TEXT  ←  EDIT MAIN CHAPTER DESCRIPTION HERE
// -----------------------------------------------------------------------------
export const mission = {
  eyebrow: "About the Chapter",
  heading: "An official home for Latino/Hispanic pre-health students at Georgia Tech.",
  paragraphs: [
    "The Latino Medical Student Association Plus Chapter at Georgia Tech is an officially recognized student organization founded in 2026 to support Latino/Hispanic and underrepresented students pursuing medicine and the health professions.",
    "Our chapter exists to make the pre-health journey more connected, informed, and welcoming through mentorship, service, professional development, medical school preparation, physician and medical student panels, and a strong cultural community.",
  ],
};


// -----------------------------------------------------------------------------
// 6. WHY LMSA PLUS MATTERS  ←  ABOUT/IMPACT CARDS
// -----------------------------------------------------------------------------
export const whyItMatters = [
  {
    title: "Representation in medicine",
    description:
      "We help strengthen the pathway for Latino/Hispanic and underrepresented students who want to become physicians and health leaders.",
  },
  {
    title: "Guidance before the application",
    description:
      "Members can learn from peers, mentors, physicians, and medical students before facing the process alone.",
  },
  {
    title: "Community at Georgia Tech",
    description:
      "The chapter creates a warm, culturally aware space for students to study, ask questions, and support one another.",
  },
  {
    title: "Service with purpose",
    description:
      "We plan volunteer and outreach opportunities that connect pre-health preparation with community impact.",
  },
];


// -----------------------------------------------------------------------------
// 7. WHAT WE DO  ←  PROGRAM / FOCUS-AREA CARDS
// -----------------------------------------------------------------------------
export const impactAreas = [
  {
    title: "Mentorship",
    description:
      "Build relationships with peers, upperclassmen, alumni, medical students, and physicians who can help clarify the path ahead.",
  },
  {
    title: "Community Building",
    description:
      "Create a welcoming Latino/Hispanic pre-health community through meetings, study sessions, socials, and cultural connection.",
  },
  {
    title: "Service & Outreach",
    description:
      "Organize volunteer opportunities and service partnerships that reflect the chapter's commitment to underserved communities.",
  },
  {
    title: "Professional Development",
    description:
      "Host physician talks, medical student panels, workshops, and networking opportunities for future health professionals.",
  },
  {
    title: "Medical School Preparation",
    description:
      "Support students as they learn about prerequisite planning, clinical exposure, applications, interviews, and readiness.",
  },
  {
    title: "Cultural Advocacy",
    description:
      "Elevate conversations about Latino/Hispanic health, culturally responsive care, and representation in medicine.",
  },
];


// -----------------------------------------------------------------------------
// 8. EVENTS  ←  EDIT EVENT TEMPLATES, DATES, TIMES, AND LOCATIONS HERE
// -----------------------------------------------------------------------------
// These are templates for now. Replace TBD details when real events are planned.
export const events = [
  {
    date: "TBD",
    tag: "Meeting",
    title: "General Body Meeting",
    time: "Time TBD",
    location: "Location TBD",
    description:
      "Meet the chapter, learn about LMSA Plus at Georgia Tech, and hear how to get involved this semester.",
  },
  {
    date: "TBD",
    tag: "Resources",
    title: "Pre-Health Resource Night",
    time: "Time TBD",
    location: "Location TBD",
    description:
      "A guided introduction to Georgia Tech pre-health advising, campus resources, and next steps for new pre-health students.",
  },
  {
    date: "TBD",
    tag: "Panel",
    title: "Physician / Medical Student Panel",
    time: "Time TBD",
    location: "Location TBD",
    description:
      "A conversation with physicians and medical students about mentorship, identity, service, and preparing for medicine.",
  },
  {
    date: "TBD",
    tag: "Service",
    title: "Volunteer Opportunity",
    time: "Time TBD",
    location: "Community partner TBD",
    description:
      "A service event template for future volunteer opportunities with Atlanta or Georgia Tech community partners.",
  },
  {
    date: "TBD",
    tag: "Mentorship",
    title: "Mentorship Mixer",
    time: "Time TBD",
    location: "Location TBD",
    description:
      "A casual event to help members meet mentors, peers, and other students navigating the pre-health path.",
  },
];


// -----------------------------------------------------------------------------
// 9. EXECUTIVE BOARD  ←  EDIT OFFICERS, BIOS, SOCIAL LINKS, HEADSHOTS HERE
// -----------------------------------------------------------------------------
// Add future officers here when roles are confirmed. Headshots can be added
// later under public/board/ and referenced with image: "/board/file-name.jpg".
export const boardMembers = [
  {
    name: "Stacy Lomeli",
    role: "President & Founder",
    focus:
      "Founded LMSA Plus at Georgia Tech and leads the chapter's vision, recognition, community-building, and early programming.",
    email: "",
    linkedin: "https://www.linkedin.com/in/stacylomeli/?skipRedirect=true",
    instagram: "https://www.instagram.com/sta.acyy_/",
    image: "",
  },
  {
    name: "Coming Soon",
    role: "Additional Executive Board",
    focus:
      "More officer names, roles, bios, emails, and headshots will be added as the chapter leadership team is finalized.",
    email: "",
    linkedin: "",
    instagram: "",
    image: "",
  },
  {
    name: "Role to be Announced",
    role: "Future Officer Position",
    focus:
      "This placeholder keeps the board layout ready for vice president, secretary, treasurer, outreach, events, or mentorship roles.",
    email: "",
    linkedin: "",
    instagram: "",
    image: "",
  },
];


// -----------------------------------------------------------------------------
// 10. OFFICIAL RESOURCES  ←  EDIT RESOURCE LINKS HERE
// -----------------------------------------------------------------------------
// Only official/relevant links are listed. Do not add scholarships or MCAT links
// until the chapter is ready to curate them.
export const resourceCategories = [
  {
    category: "Georgia Tech Pre-Health",
    items: [
      {
        title: "Georgia Tech Pre-Health Advising",
        description:
          "Official Georgia Tech pre-health advising home for appointments, Canvas resources, workshops, and preparation support.",
        href: "https://www.prehealth.gatech.edu/",
      },
      {
        title: "Academic Success & Advising",
        description:
          "Georgia Tech's advising hub for academic planning, major advising, and pre-professional support.",
        href: "https://www.success.gatech.edu/advising-at-tech/",
      },
      {
        title: "Find Your Advisor",
        description:
          "Official Georgia Tech directory for finding major advisors and pre-health advising contacts.",
        href: "https://advising.gatech.edu/find-your-advisor",
      },
    ],
  },
  {
    category: "LMSA National",
    items: [
      {
        title: "LMSA National",
        description:
          "Official national organization for Latino/Hispanic and allied health professions trainees.",
        href: "https://national.lmsa.net/",
      },
      {
        title: "Join LMSA National",
        description:
          "Official LMSA National membership page for students and health professions trainees.",
        href: "https://national.lmsa.net/join/",
      },
    ],
  },
  {
    category: "LMSA Southeast",
    items: [
      {
        title: "LMSA Southeast",
        description:
          "Official regional LMSA site for chapters and members in the Southeast region.",
        href: "https://southeast.lmsa.net/",
      },
      {
        title: "LMSA Southeast Events",
        description:
          "Official Southeast region events page for regional programming and announcements.",
        href: "https://southeast.lmsa.net/events/",
      },
      {
        title: "LMSA Southeast Regional Conference",
        description:
          "Official information page for the Southeast Regional Conference when details are available.",
        href: "https://southeast.lmsa.net/events/regional-conference/",
      },
    ],
  },
];


// -----------------------------------------------------------------------------
// 11. NEWSLETTER  ←  EDIT NEWSLETTER SIGNUP FORM HERE
// -----------------------------------------------------------------------------
export const newsletter = {
  heading: "Stay connected with LMSA Plus at Georgia Tech.",
  description:
    "A newsletter signup will be added here once the chapter has a final form. For now, follow Instagram or email the chapter for updates.",
  href: contactLinks.newsletterForm,
  label: contactLinks.newsletterLabel,
  comingSoon: contactLinks.newsletterComingSoon,
};


// -----------------------------------------------------------------------------
// 12. LINKTREE-STYLE /links PAGE  ←  EDIT BUTTONS ON THE LINKS PAGE HERE
// -----------------------------------------------------------------------------
// This controls the simple mobile-friendly links page at /links.
export const linktreeLinks = [
  {
    label: "Instagram",
    href: contactLinks.instagram,
    description: "Follow chapter updates and announcements.",
  },
  {
    label: "Email",
    href: `mailto:${contactLinks.email}`,
    description: contactLinks.email,
  },
  {
    label: "Main Website",
    href: "/",
    description: chapterInfo.shortName,
  },
  {
    label: "Join / Membership Form",
    href: contactLinks.membershipForm,
    description: contactLinks.membershipLabel,
    comingSoon: contactLinks.membershipComingSoon,
  },
  {
    label: "Mentorship Form",
    href: contactLinks.mentorshipForm,
    description: contactLinks.mentorshipLabel,
    comingSoon: contactLinks.mentorshipComingSoon,
  },
  {
    label: "Newsletter Signup",
    href: contactLinks.newsletterForm,
    description: contactLinks.newsletterLabel,
    comingSoon: contactLinks.newsletterComingSoon,
  },
  {
    label: "GT Pre-Health Advising",
    href: "https://www.prehealth.gatech.edu/",
    description: "Official Georgia Tech pre-health advising resources.",
  },
  {
    label: "LMSA National",
    href: "https://national.lmsa.net/",
    description: "Official LMSA National website.",
  },
  {
    label: "LMSA Southeast",
    href: "https://southeast.lmsa.net/",
    description: "Official LMSA Southeast regional website.",
  },
];


// -----------------------------------------------------------------------------
// 13. IMAGE PLACEHOLDERS  ←  FUTURE APPROVED PHOTOS CAN BE ADDED HERE
// -----------------------------------------------------------------------------
// Do not use random images from Google. Add approved chapter/event photos to
// public/images/ or officer headshots to public/board/ later.
export const photoPlaceholders = [
  {
    title: "Chapter photo coming soon",
    description: "Future approved group or event photo can go in public/images/.",
  },
  {
    title: "Officer headshots coming soon",
    description: "Future board headshots can go in public/board/.",
  },
];


// -----------------------------------------------------------------------------
// 14. CREATOR CREDIT  ←  SMALL LINE AT THE VERY BOTTOM OF THE FOOTER
// -----------------------------------------------------------------------------
export const creatorCredit = {
  name: "Jason Rivera-Hernandez",
  linkedin: "https://www.linkedin.com/in/jas0nrivera/",
  instagram: "https://www.instagram.com/jas0nrivera/",
};
