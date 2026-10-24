import type { ResourceCategory } from "./site-types";

export const OPPORTUNITY_LINKS_REVIEWED = "October 19, 2026";

/** Directories and recurring opportunities that complement the open-now list. */
export const nearTermOpportunityCategories: ResourceCategory[] = [
  {
    category: "Summer 2027 internships and research",
    description:
      "Use these directories and program pages to find current positions and watch for upcoming Summer 2027 application windows. Programs set their own eligibility and deadlines.",
    items: [
      {
        title: "Georgia Tech CareerBuzz internships and co-ops",
        description:
          "Search Georgia Tech internship, co-op, and employer postings. GT students need to complete the Experiential Learning Application before applying to eligible co-op and internship postings; access CareerBuzz with GT credentials. Openings and requirements vary by position.",
        organization: "Georgia Tech Career Center",
        href: "https://career.gatech.edu/careerbuzz/",
        category: "Internships",
        timeSensitive: true,
      },
      {
        title: "Fred Hutch Summer Undergraduate Research Program, 2027",
        description:
          "A nine-week biomedical research internship for undergraduates entering the summer before their final year. The 2027 application is expected on the program site in mid-to-late November; review eligibility and dates when it opens.",
        organization: "Fred Hutch Cancer Center",
        href: "https://www.fredhutch.org/en/education-training/undergraduate-students/summer-undergraduate-research-program.html",
        category: "Biomedical research",
        timeSensitive: true,
      },
      {
        title: "AAMC Summer Undergraduate Research Programs directory",
        description:
          "Browse summer biomedical and medical research programs around the country. Each program sets its own eligibility and application schedule, so contact programs and check their official pages for Summer 2027 details.",
        organization: "Association of American Medical Colleges",
        href: "https://students-residents.aamc.org/phd-biomedical-science/summer-undergraduate-research-programs",
        category: "Research directory",
        timeSensitive: true,
      },
      {
        title: "Georgia Tech Undergraduate Research Opportunities Program",
        description:
          "Find faculty-mentored research at Georgia Tech and check UROP for research credit, PURA awards, and upcoming funding cycles. The Spring 2027 PURA Salary deadline (extended to October 16) has passed; UROP lists Summer 2027 and Fall 2027 deadlines as TBD.",
        organization: "Georgia Tech UROP",
        href: "https://experiential.learning.gatech.edu/urop/",
        category: "Undergraduate research",
        timeSensitive: true,
      },
    ],
  },
  {
    category: "Leadership and community service",
    description:
      "Build leadership through campus programs and find local service projects; openings and commitments depend on the organizer.",
    items: [
      {
        title: "Georgia Tech MOVE service opportunities",
        description:
          "Georgia Tech’s volunteer umbrella connects students with service organizations and committees, including Medical Assistance. Explore current groups and ways to participate or take on a leadership role.",
        organization: "Georgia Tech Civic Engagement",
        href: "https://civic-engagement.gatech.edu/service-organizations/mobilizing-opportunities-volunteer-experiences",
        category: "Community service",
        timeSensitive: true,
      },
      {
        title: "Hands On Atlanta volunteer calendar",
        description:
          "Find Atlanta-area service projects by date, location, and impact area. Check each organizer’s age, schedule, and registration requirements.",
        organization: "Hands On Atlanta",
        href: "https://www.handsonatlanta.org/",
        category: "Community service",
        timeSensitive: true,
      },
      {
        title: "Georgia Tech Engage student organizations",
        description:
          "Browse registered student organizations and public events, then contact groups about current member, committee, and officer opportunities.",
        organization: "Georgia Tech Engage",
        href: "https://gatech.campuslabs.com/engage/organizations",
        category: "Student leadership",
        timeSensitive: true,
      },
    ],
  },
  {
    category: "Hospital and clinic volunteering",
    description:
      "These programs offer hospital or clinic service and patient-support experience. They are nonclinical volunteer roles, not clinical internships; check age, screening, and time commitments.",
    items: [
      {
        title: "Grady Health volunteer program",
        description:
          "Apply for a service-based role supporting patients, families, and staff. Grady requires an application and interview, health screening, background check, orientation, and at least one year of service for a minimum of three hours each week. Grady says volunteering is not an internship or pathway to employment.",
        organization: "Grady Health",
        href: "https://www.gradyhealth.org/volunteer/",
        category: "Hospital volunteering",
        timeSensitive: true,
      },
      {
        title: "Emory University Hospital College Volunteer Program",
        description:
          "The official page describes nonclinical service for enrolled college students age 18+, September–April, four hours weekly and at least 80 hours. Rechecked October 24: its application links still lead to a program at capacity and a different program whose October 9 deadline passed. Confirm the correct college application with Emory Volunteer Services before applying; no open college application was verified.",
        organization: "Emory Healthcare",
        href: "https://www.emoryhealthcare.org/locations/hospitals/emory-university-hospital/volunteer",
        category: "Clinic and hospital volunteering",
        timeSensitive: true,
      },
    ],
  },
  {
    category: "Scholarship searches for 2027–28",
    description:
      "Start with Georgia Tech’s current aid applications and matching tool, then check national award cycles and their specific eligibility rules.",
    items: [
      {
        title: "Scholarship Universe",
        description:
          "Search external scholarship matches based on your profile, interests, and experience. Georgia Tech says the tool is available to currently enrolled students and admitted prospective students with a GTID; sign in with GT credentials.",
        organization: "Georgia Tech Office of Scholarships and Financial Aid",
        href: "https://gatech.scholarshipuniverse.com/",
        category: "External scholarships",
        timeSensitive: true,
      },
      {
        title: "LMSA National scholarships",
        description:
          "LMSA National describes Fall, Winter, and Spring scholarship cycles. Award eligibility varies; many awards on the current page are for medical students, so check each cycle before applying. Watch for updated 2026–27 cycle details.",
        organization: "Latino Medical Student Association National",
        href: "https://national.lmsa.net/resources/awards/scholarships/",
        category: "LMSA scholarships",
        timeSensitive: true,
      },
    ],
  },
];
