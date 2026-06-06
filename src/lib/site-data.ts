// =============================================================================
// LMSA WEBSITE CONTENT — THIS IS THE MAIN FILE OFFICERS SHOULD EDIT
// =============================================================================
//
// You do NOT need coding experience to update the website. Almost all of the
// text and links you see on the site live in this one file.
//
// HOW TO MAKE A CHANGE:
//   1. Find the section below you want to update (events, board, etc.).
//   2. Change the words inside the quotation marks "like this".
//   3. Save the file, then commit and push to GitHub.
//   4. Vercel automatically rebuilds and publishes the live site in ~1 minute.
//
// TIPS:
//   - Keep the quotation marks " " and commas , exactly where they are.
//   - To add a new item, copy an existing { ... } block and edit it.
//   - To remove an item, delete its full { ... } block (and the trailing comma).
//
// =============================================================================


// -----------------------------------------------------------------------------
// 1. CONTACT LINKS  ←  EDIT YOUR EMAIL, INSTAGRAM, AND JOIN FORM HERE
// -----------------------------------------------------------------------------
// These links are used by the navbar button, the hero buttons, the contact
// section, and the footer. Update them in one place and they change everywhere.
export const contactLinks = {
  // Chapter email address (shown and used for "Email Us" buttons).
  email: "lmsa@example.edu",

  // Full Instagram URL (where the Instagram links/buttons point to).
  instagram: "https://instagram.com/placeholder",

  // The handle shown as text on the page, e.g. "@gtlmsa".
  instagramHandle: "@placeholder",

  // Google Form (or other) link for the membership / interest form.
  joinForm: "https://forms.gle/placeholder",

  // Optional: a separate mentorship sign-up form. If you don't have one,
  // you can leave it pointing to the same joinForm link above.
  mentorshipForm: "https://forms.gle/placeholder",
};


// -----------------------------------------------------------------------------
// 2. NAVIGATION LINKS  ←  THE MENU AT THE TOP OF THE PAGE
// -----------------------------------------------------------------------------
// Each link jumps to a section on the page. The "href" must match a section id
// (the "#about", "#events", etc.). You usually won't need to change these.
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
// 3. CHAPTER QUICK FACTS  ←  SMALL STATS SHOWN IN THE HERO
// -----------------------------------------------------------------------------
// These are short, eye-catching numbers near the top of the page. Update them
// to reflect your chapter. If you are a new chapter, you can use words like
// "New" or "2025" instead of numbers.
export const heroStats = [
  { value: "2025", label: "Chapter founded" },
  { value: "6+", label: "Events each semester" },
  { value: "100%", label: "Open to all majors" },
];


// -----------------------------------------------------------------------------
// 4. MISSION STATEMENT  ←  THE "ABOUT" SECTION TEXT
// -----------------------------------------------------------------------------
export const mission = {
  // Short label above the mission heading.
  eyebrow: "About the Chapter",

  // The main heading for the About section.
  heading: "A home for Latino/a/e students pursuing careers in medicine.",

  // 1–2 paragraphs describing the chapter. Keep it warm and specific.
  paragraphs: [
    "The Latino Medical Student Association (LMSA) at Georgia Tech is a student-led community dedicated to supporting Latino/a/e and underrepresented students on the path to medicine and the health professions.",
    "Through mentorship, medical school preparation, service, and cultural community, we help members grow into confident, well-prepared, and connected future physicians and health leaders who reflect the communities they hope to serve.",
  ],
};


// -----------------------------------------------------------------------------
// 5. WHY LMSA MATTERS  ←  "WHO WE SERVE" IMPACT POINTS
// -----------------------------------------------------------------------------
// Short statements that explain the chapter's purpose and impact.
export const whyItMatters = [
  {
    title: "Representation in medicine",
    description:
      "Latino/a/e physicians remain underrepresented in the U.S. We help build the pipeline of future doctors who reflect their communities.",
  },
  {
    title: "Guidance that's hard to find alone",
    description:
      "From the MCAT to applications, we share honest advice and lived experience so no member has to navigate the journey by themselves.",
  },
  {
    title: "Community and belonging",
    description:
      "We create a space where culture is celebrated and students feel seen, supported, and encouraged to keep going.",
  },
  {
    title: "Service to our communities",
    description:
      "We connect members with volunteering and outreach that puts culturally responsive care into practice.",
  },
];


// -----------------------------------------------------------------------------
// 6. WHAT WE DO  ←  THE PROGRAM / FOCUS-AREA CARDS
// -----------------------------------------------------------------------------
// Each card has a title and a description. Keep descriptions to 1–2 sentences.
export const impactAreas = [
  {
    title: "Mentorship",
    description:
      "Near-peer and professional mentorship that pairs members with upperclassmen, medical students, and physicians who understand the journey.",
  },
  {
    title: "Community Building",
    description:
      "Socials, study groups, and cultural celebrations that create lasting friendships and a strong sense of belonging.",
  },
  {
    title: "Service & Outreach",
    description:
      "Volunteering, health fairs, and community partnerships that serve Atlanta's Latino and underserved communities.",
  },
  {
    title: "Professional Development",
    description:
      "Physician panels, workshops, and networking that expose members to careers across medicine and the health professions.",
  },
  {
    title: "Medical School Preparation",
    description:
      "MCAT support, application guidance, mock interviews, and personal statement feedback to help members apply with confidence.",
  },
  {
    title: "Cultural Advocacy",
    description:
      "Conversations and programming that advance health equity, Latino health, and culturally responsive patient care.",
  },
];


// -----------------------------------------------------------------------------
// 7. EVENTS  ←  EDIT, ADD, OR REMOVE UPCOMING EVENTS HERE
// -----------------------------------------------------------------------------
// To ADD an event: copy one { ... } block and change its details.
// To REMOVE an event: delete its { ... } block.
// "tag" is a small category label (e.g. "Meeting", "Academic", "Service").
export const events = [
  {
    date: "Sep 12",
    tag: "Meeting",
    title: "General Body Meeting",
    time: "6:30 PM",
    location: "Georgia Tech Campus",
    description:
      "Kick off the semester, meet the board, and learn about mentorship, events, and how to get involved this year.",
  },
  {
    date: "Oct 03",
    tag: "Academic",
    title: "MCAT Study Night",
    time: "7:00 PM",
    location: "Campus Study Room (TBD)",
    description:
      "A focused, collaborative study session with peers. Bring your study plan and questions — snacks provided.",
  },
  {
    date: "Oct 24",
    tag: "Speaker Panel",
    title: "Physician Speaker Panel",
    time: "6:00 PM",
    location: "Lecture Hall (TBD)",
    description:
      "Hear Latino/a/e physicians and medical students share their paths into medicine, advice, and lessons learned.",
  },
  {
    date: "Nov 09",
    tag: "Service",
    title: "Community Volunteer Day",
    time: "9:00 AM",
    location: "Atlanta Community Partner",
    description:
      "Serve alongside fellow members at a local health-focused organization supporting underserved communities.",
  },
];


// -----------------------------------------------------------------------------
// 8. EXECUTIVE BOARD  ←  EDIT OFFICER NAMES, ROLES, AND DETAILS HERE
// -----------------------------------------------------------------------------
// Replace "Your Name" with the real officer's name once elected.
// "focus" is a short description of what the role does.
// "email" is optional — leave it as "" to hide the contact link on a card.
export const boardMembers = [
  {
    name: "Your Name",
    role: "President",
    focus: "Leads chapter vision, partnerships, and overall member support.",
    email: "",
  },
  {
    name: "Your Name",
    role: "Vice President",
    focus: "Oversees programming, internal operations, and officer coordination.",
    email: "",
  },
  {
    name: "Your Name",
    role: "Secretary",
    focus: "Manages communications, meeting notes, and member newsletters.",
    email: "",
  },
  {
    name: "Your Name",
    role: "Treasurer",
    focus: "Handles budgeting, fundraising, and financial planning.",
    email: "",
  },
  {
    name: "Your Name",
    role: "Events Chair",
    focus: "Plans speaker panels, socials, workshops, and event logistics.",
    email: "",
  },
  {
    name: "Your Name",
    role: "Outreach Chair",
    focus: "Builds service partnerships, campus collaborations, and recruitment.",
    email: "",
  },
];


// -----------------------------------------------------------------------------
// 9. RESOURCES  ←  EDIT LINKS AND DESCRIPTIONS FOR PRE-HEALTH STUDENTS
// -----------------------------------------------------------------------------
// Resources are organized into categories. Each category has a title and a list
// of items. Each item has a title, description, and a link (href).
//   - Use a full URL (e.g. "https://...") to link to an outside website.
//   - Use "#contact" to point members to the contact section instead.
export const resourceCategories = [
  {
    category: "Medical School Prep",
    items: [
      {
        title: "MCAT Planning & Study Tips",
        description:
          "Sample study timelines, recommended materials, and peer accountability for the MCAT.",
        href: "#contact",
      },
      {
        title: "Application Guidance (AMCAS)",
        description:
          "Personal statements, activity descriptions, and timelines for the medical school application.",
        href: "#contact",
      },
      {
        title: "Mock Interviews",
        description:
          "Practice interviews and feedback to help members prepare for admissions interviews.",
        href: "#contact",
      },
    ],
  },
  {
    category: "Advising & Experience",
    items: [
      {
        title: "Pre-Health Advising",
        description:
          "Connect with campus advising for course planning and application readiness.",
        href: "#contact",
      },
      {
        title: "Shadowing & Clinical Hours",
        description:
          "Find clinical exposure, shadowing, and patient-facing experiences.",
        href: "#contact",
      },
      {
        title: "Volunteering & Service",
        description:
          "Community partners and service opportunities aligned with our mission.",
        href: "#contact",
      },
    ],
  },
  {
    category: "Mentorship & Community",
    items: [
      {
        title: "Mentorship Program",
        description:
          "Sign up as a mentor or mentee and get matched with someone on a similar path.",
        href: contactLinks.mentorshipForm,
      },
      {
        title: "LMSA National",
        description:
          "Scholarships, conferences, and a national network of Latino/a/e trainees.",
        href: "https://national.lmsa.net/",
      },
      {
        title: "Join the Chapter",
        description:
          "Not a member yet? Fill out our interest form to get connected.",
        href: contactLinks.joinForm,
      },
    ],
  },
];


// -----------------------------------------------------------------------------
// 10. CREATOR CREDIT  ←  SMALL LINE AT THE VERY BOTTOM OF THE FOOTER
// -----------------------------------------------------------------------------
// Personal credit for the site builder. Replace the placeholder URLs below with
// your full LinkedIn and Instagram links when ready.
export const creatorCredit = {
  name: "Jason Rivera-Hernandez",
  linkedin: "PASTE_MY_LINKEDIN_URL_HERE",
  instagram: "PASTE_MY_INSTAGRAM_URL_HERE",
};
