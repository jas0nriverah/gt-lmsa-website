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
  /** National cycle is open, but GT's required nomination window is unverified. */
  requiresCampusConfirmation?: true;
}

export const OPEN_OPPORTUNITIES_REVIEWED = "October 24, 2026";

/**
 * Reviewed opportunities. Only confirmed open applications appear on the home
 * page and at the top of /opportunities. Campus nomination windows awaiting
 * confirmation appear separately; dated listings expire automatically.
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
      "Submit the Common Application by November 2, 2026, at 11:59 p.m. in your time zone.",
      "Additional documents are due November 16; self-reported test scores are due December 8. Follow Undergraduate Admission's deadlines; the Gold Scholars page currently lists a conflicting November 3 date.",
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
    requiresCampusConfirmation: true,
    title: "Barry Goldwater Scholarship, 2027 competition",
    organization: "Barry Goldwater Scholarship and Excellence in Education Foundation",
    category: "Research scholarship",
    audience: "Sophomores and juniors pursuing research careers in science, math, or engineering",
    summary:
      "The national 2027 nomination cycle is open, but Georgia Tech’s internal nomination deadline and current availability could not be confirmed. Contact the campus fellowship adviser before preparing an application; the national deadline does not establish that GT nominations remain open.",
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
    requiresCampusConfirmation: true,
    title: "Harry S. Truman Scholarship, 2027 competition",
    organization: "Harry S. Truman Scholarship Foundation",
    category: "Leadership and public-service scholarship",
    audience: "Undergraduates nearing graduation and planning a career in public service",
    summary:
      "The national 2027 competition is underway and offers up to $30,000 for graduate or professional study. Institutional nomination is required; Georgia Tech’s internal deadline and current nomination availability could not be confirmed.",
    eligibility: [
      "In the penultimate year of an undergraduate degree lasting four years or more, or the final year of a degree lasting three years or fewer; enrolled at an accredited U.S. institution.",
      "U.S. citizen, U.S. national resident of American Samoa, or expecting citizenship by the award date; institutional nomination is required.",
      "Strong public/community service and leadership record, with plans for a career in government or another public-service field.",
    ],
    applicationChecklist: [
      "Contact Georgia Tech Prestigious Fellowships Advising now for the campus nomination process and internal deadline.",
      "Nominees complete the application and supporting materials through the Foundation’s system.",
    ],
    deadline: "February 2, 2027 at 11:59 p.m. in your time zone · national deadline; GT deadline unverified",
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
  {
    id: "sharp-index-scholarships-2026-27",
    title: "Sharp Index Scholarships, 2026–27",
    organization: "Sharp Index",
    category: "Health scholarship",
    audience: "Undergraduate, graduate, professional, and medical students in health-related fields",
    summary:
      "Two scholarship tracks support work related to clinician well-being, healthcare workforce mental health, or health equity. The Health Equity Scholarship offers a $5,000 flexible-use educational grant and optional professional support.",
    eligibility: [
      "Pursuing a pathway related to medicine, healthcare, public health, mental health, medical education, healthcare research, or healthcare leadership.",
      "Show a meaningful connection to the scholarship’s mission through education, service, advocacy, lived experience, research, or career goals.",
      "The Health Equity track is for eligible applicants from historically underrepresented or underserved populations and identities; review both tracks’ requirements before applying.",
      "Current Sharp Index directors, officers, employees, and their immediate family or household members are ineligible.",
    ],
    applicationChecklist: [
      "Prepare educational and career goals, a résumé or CV, a short mission-alignment statement, and relevant research, advocacy, service, or community experience.",
      "Health Equity applicants also propose a topic and format for a knowledge-sharing contribution. Recommendation letters are not required for the initial application unless a track says otherwise.",
    ],
    deadline: "November 30, 2026 at 11:59 p.m. ET",
    deadlineAt: "2026-11-30T23:59:59-05:00",
    sourceUrl: "https://sharpindex.org/scholarship-extended-requirement",
    featuredOnHome: true,
  },
  {
    id: "noaa-hollings-scholarship-2027",
    title: "NOAA Ernest F. Hollings Scholarship, 2027",
    organization: "National Oceanic and Atmospheric Administration",
    category: "Scholarship and paid internship",
    audience: "Second-year undergraduates in NOAA mission-related fields",
    summary:
      "Up to $40,000 in support, including $9,500 per year for junior and senior year, a paid 10-week NOAA internship, and conference travel funding. Relevant areas include biological and social sciences as well as other NOAA mission disciplines.",
    eligibility: [
      "U.S. citizen enrolled full time as an undergraduate sophomore (or third year in a five-year program); anticipated bachelor's graduation date must be December 2028 through August 2029.",
      "At least a 3.0 GPA and a major in a NOAA mission-relevant field. Community college students transferring to a four-year college in Fall 2027 may also be eligible.",
    ],
    applicationChecklist: [
      "Submit the online application, essay responses, transcripts from every college attended, and an official document listing your anticipated graduation date.",
      "Request two references through the application system; at least one must be an academic reference. Make sure both submit their forms before the deadline.",
    ],
    deadline: "January 31, 2027 at 11:59 p.m. ET",
    deadlineAt: "2027-01-31T23:59:59-05:00",
    sourceUrl: "https://www.noaa.gov/office-education/undergraduate-scholarships",
    secondarySourceUrl: "https://www.noaa.gov/office-education/hollings-scholarship/prospective/faq",
    featuredOnHome: true,
  },
  {
    id: "nih-sip-summer-2027",
    title: "NIH Summer Internship Program (SIP), Summer 2027",
    organization: "National Institutes of Health",
    category: "Paid biomedical and health research",
    audience: "College, graduate, and professional students interested in full-time summer research",
    summary:
      "Full-time research placements across NIH biomedical, behavioral, and social-science labs. Stipends are set by education level. NIH does not provide housing, and interns must show proof of health insurance.",
    eligibility: [
      "U.S. citizen or permanent resident, at least 18 by September 30, 2027, and enrolled at least half time in college, graduate, or professional school when applying. Accepted fall graduate students may also qualify; permanent residents must attend or be accepted at a U.S. institution.",
      "Graduating high-school seniors must meet NIH’s separate age and enrollment rules. Those who are 17 on June 1 and turn 18 by September 30 must live within 40 miles of an NIH campus.",
      "Able to commit to a full-time summer research appointment; specific NIH institutes and labs may have additional requirements.",
    ],
    applicationChecklist: [
      "Apply through the NIH Application Center; provide coursework and grades, a CV or résumé, and a personal statement about research interests and goals.",
      "Enter two references, then contact NIH principal investigators whose research interests you. Reference letters are due February 2, after the application closes.",
    ],
    deadline: "January 26, 2027 at 12:00 p.m. ET · references due February 2 at noon ET",
    deadlineAt: "2027-01-26T12:00:00-05:00",
    sourceUrl: "https://www.training.nih.gov/research-training/pb/sip/",
    featuredOnHome: true,
  },
  {
    id: "mount-sinai-surp4us-2027",
    title: "Mount Sinai SURP4US, Summer 2027",
    organization: "Icahn School of Medicine at Mount Sinai",
    category: "Biomedical research · PhD and MD-PhD pathway",
    audience: "Rising juniors and seniors with limited research access who plan to pursue a biomedical PhD or MD-PhD",
    summary:
      "A 10-week mentored biomedical-research program for students who are socioeconomically disadvantaged and/or have had limited access to research. Participants receive a $5,000 stipend and housing allowance. This program is for future PhD or MD-PhD applicants, not MD-only applicants.",
    eligibility: [
      "Currently a sophomore or junior at a four-year U.S. undergraduate institution, including U.S. territories.",
      "Explain barriers to hands-on research access or relevant socioeconomic disadvantage; have a strong science background and a goal of pursuing biomedical research professionally.",
    ],
    applicationChecklist: [
      "Complete the online application and provide copies of high-school and college transcripts.",
      "Request three recommendation letters; the program recommends that at least two come from people who know your research interests or experience.",
    ],
    deadline: "January 15, 2027",
    deadlineAt: "2027-01-16T00:00:00-05:00",
    sourceUrl: "https://icahn.mssm.edu/education/non-degree/surp4us",
    secondarySourceUrl: "https://icahn.mssm.edu/education/admissions/graduate-education/summer-undergraduate",
  },
  {
    id: "bcm-smart-2027",
    title: "Baylor SMART Program, Summer 2027",
    organization: "Baylor College of Medicine",
    category: "Paid biomedical research",
    audience: "Undergraduates interested in research careers, especially PhD-oriented students",
    summary:
      "Nine weeks of mentored biomedical research and career development in Houston. The program offers about $5,400 in compensation, which may be split between salary and housing or travel support depending on funding.",
    eligibility: [
      "At least a 3.0 GPA, currently enrolled at a U.S. college or university, and returning to complete your undergraduate degree after the summer; no graduation before or during the program.",
      "Previous research is valuable but not required, except for first-year students, who need prior research experience or a national or international science-fair award. International students need U.S. work authorization.",
      "The program encourages students pursuing PhD research careers; it is not a clinical or medical-school preparation program.",
    ],
    applicationChecklist: [
      "Submit the online application, an unofficial transcript, and two recommendation letters from math, science, or engineering faculty; at least one recommender must be from your university.",
      "Commit to the full nine-week program and be ready to provide health-insurance and immunization records if selected.",
    ],
    deadline: "January 22, 2027 at 8:00 a.m. CT",
    deadlineAt: "2027-01-22T09:00:00-05:00",
    sourceUrl: "https://www.bcm.edu/education/graduate-school-of-biomedical-sciences/degree-programs-and-certificates/smart-program",
    secondarySourceUrl: "https://www.bcm.edu/education/graduate-school-of-biomedical-sciences/degree-programs-and-certificates/smart-program/admissions",
  },
  {
    id: "uic-surf-2027",
    title: "UIC Summer Undergraduate Research Fellowship (SURF), 2027",
    organization: "University of Illinois Chicago Retzky College of Pharmacy",
    category: "Paid biomedical research",
    audience: "Sophomores and juniors in biology, chemistry, biochemistry, or related fields pursuing research training",
    summary:
      "A 10-week biomedical-research fellowship with an independent mentored project, seminars, and career development. Participants receive $7,000 and travel support to and from Chicago.",
    eligibility: [
      "U.S. citizen or permanent resident, GPA of at least 3.2, and available for the full 10 weeks.",
      "Strong interest in an advanced research degree such as a PhD or PharmD/PhD; the program is not aimed at MD-only applicants. Students from groups underrepresented in health-related sciences are encouraged to apply.",
    ],
    applicationChecklist: [
      "Submit the application form, personal statement, and transcripts by January 25, 2027.",
      "Request two letters from current or former professors, instructors, or advisers. Letters must be signed, on institutional letterhead, and emailed directly to the program by the deadline.",
    ],
    deadline: "January 25, 2027",
    deadlineAt: "2027-01-26T00:00:00-06:00",
    sourceUrl: "https://surf.pharmacy.uic.edu/apply/",
    secondarySourceUrl: "https://surf.pharmacy.uic.edu/",
    featuredOnHome: true,
  },
  {
    id: "wake-forest-bme-informatics-summer-research-2027",
    title: "Wake Forest Biomedical Engineering and Informatics Summer Research Program, 2027",
    organization: "Wake Forest University School of Medicine",
    category: "Paid summer research",
    audience: "Undergraduate and master's students in biomedical engineering, computing, science, or related fields",
    summary:
      "A 10-week research program in areas such as cancer diagnostics, injury prevention, medical devices, biomedical informatics, and medical imaging. The program provides a stipend and funded shared campus housing for non-local participants.",
    eligibility: [
      "At least 18 by the start date, completed two semesters of undergraduate or master's education, GPA of at least 3.0, and actively enrolled at a U.S. institution; students graduating before May 25, 2027 are not eligible.",
      "U.S. citizens, nationals, permanent residents, and students attending a U.S. institution on an F-1 or J-1 visa may apply; international places are limited.",
    ],
    applicationChecklist: [
      "Submit the online application with a one-page personal statement, résumé or CV, transcripts, and one academic or professional reference.",
      "Commit to the May 25–July 30, 2027 program; a recommendation letter is optional but encouraged.",
    ],
    deadline: "January 29, 2027",
    deadlineAt: "2027-01-30T00:00:00-05:00",
    sourceUrl: "https://school.wakehealth.edu/departments/biomedical-engineering/center-for-injury-biomechanics/summer-research-opportunities",
    featuredOnHome: true,
  },
  {
    id: "uva-srip-2027",
    title: "UVA Summer Research Internship Program (SRIP), 2027",
    organization: "University of Virginia School of Medicine",
    category: "Paid biomedical research",
    audience: "Undergraduates considering biomedical research; rising juniors and seniors are typical applicants",
    summary:
      "A 10-week mentored research experience with a $6,000 stipend, housing, and travel support. First-year students, non-science majors transitioning to science, and pre-med students moving toward research may also apply.",
    eligibility: [
      "Undergraduate student who is a U.S. citizen or permanent resident; some limited positions may consider international students under different funding.",
      "No minimum GPA or prior research experience is required. Participants must commit full time for the 10 weeks and have health insurance.",
    ],
    applicationChecklist: [
      "Submit the online application, an unofficial transcript, and personal statements about career goals and research interests.",
      "Request two faculty or adviser recommendation letters. Applications are due February 1; recommendation letters are due within seven days after that deadline.",
    ],
    deadline: "February 1, 2027 at 11:59 p.m. ET",
    deadlineAt: "2027-02-02T00:00:00-05:00",
    sourceUrl: "https://med.virginia.edu/summer-research-internship-program/",
    secondarySourceUrl: "https://med.virginia.edu/summer-research-internship-program/how-to-apply/",
  },
  {
    id: "penn-suip-2027",
    title: "Penn Summer Undergraduate Internship Program (SUIP), 2027",
    organization: "University of Pennsylvania Perelman School of Medicine",
    category: "Paid biomedical research",
    audience: "Undergraduates aspiring to PhD or MD-PhD study in biomedical sciences",
    summary:
      "A 10-week biomedical research internship with a $5,500 stipend, campus housing, a meal plan, and one round-trip to Penn. The program is intended for doctoral research pathways rather than MD-only applicants.",
    eligibility: [
      "U.S. citizen or permanent resident enrolled in a four-year college for the fall after the program; graduating seniors and students unable to attend all 10 weeks are not eligible.",
      "No prior research experience is required; preference is given to students who have completed sophomore or junior year, especially those with limited access to research opportunities.",
    ],
    applicationChecklist: [
      "Submit a résumé or CV, unofficial transcript, two recommendation letters, a research and personal statement, and a 150–200 word community statement.",
      "Use Penn's application for Summer 2027; all materials, including letters, must arrive by the deadline. The Leadership Alliance portal's opening and closing dates remain unannounced on Penn's page.",
    ],
    deadline: "February 1, 2027 at 11:59 p.m. ET",
    deadlineAt: "2027-02-02T00:00:00-05:00",
    sourceUrl: "https://www.med.upenn.edu/research-trainee-affairs/suip/",
  },
  {
    id: "black-health-equity-scholarship-2026",
    title: "Black Health Equity Scholarship, 2026",
    organization: "Black Health",
    category: "Health equity scholarship",
    audience: "Students age 17+ in a U.S. health-related college or training program",
    summary:
      "A $1,000 scholarship for a student whose health career will improve outcomes for Black communities. There is no demographic requirement, GPA minimum, application fee, transcript, or recommendation letter.",
    eligibility: [
      "At least 17 years old and a legal U.S. resident; enrolled in or admitted to an accredited U.S. college, university, or training program in a health-related field.",
      "The program must start or continue in 2027, and applicants must show a genuine commitment to improving Black health outcomes.",
      "Provide a school-issued email address or a registrar/program contact to verify enrollment if selected.",
    ],
    applicationChecklist: [
      "Write a 500–800 word essay about one specific health gap affecting Black communities and cite a primary source such as a study, federal dataset, or published report.",
      "Write a 100–300 word response describing your next concrete career or education step and when you plan to take it.",
      "Submit your own writing; AI-written essays are prohibited. Immediate family of Black Health staff are ineligible.",
    ],
    deadline: "December 1, 2026 at 11:59 p.m. ET",
    deadlineAt: "2026-12-01T23:59:59-05:00",
    sourceUrl: "https://www.blackhealth.org/careers/scholarships/black-health-equity-scholarship/",
    secondarySourceUrl: "https://www.blackhealth.org/careers/scholarships/black-health-equity-scholarship/apply/",
    featuredOnHome: true,
  },
  {
    id: "project-ahead-2027",
    title: "Project AHEAD Community Health Internship, Summer 2027",
    organization: "Charles B. Wang Community Health Center",
    category: "Paid community health internship",
    audience: "Second-, third-, and fourth-year undergraduates at four-year colleges",
    summary:
      "A paid, 10-week, fully in-person internship in Flushing and Lower Manhattan, New York City. Interns explore primary care, social work, health education, community programming, and research.",
    eligibility: [
      "Currently attending a four-year college or university as a second-, third-, or fourth-year student; high-school, AP, and IB credits do not count toward class standing.",
      "Interested in healthcare, health equity, community health, primary care, and serving historically excluded communities, including Asian American communities.",
      "Available June 1–August 6, 2027, weekdays 9 a.m.–5 p.m., with some early mornings, evenings, and weekends; the role requires travel around New York City.",
      "The application page excludes international students and students studying temporarily in the United States who plan to return home after their studies. Housing, food, and travel expenses are not covered.",
    ],
    applicationChecklist: [
      "Submit the preliminary form, résumé, and academic transcripts by December 13, 2026 at 11:59 p.m. ET. Prepare everything first: the form has no save-and-return option.",
      "After submitting the preliminary form, follow the program's instructions for short-answer responses and one recommendation letter; both are due January 17, 2027 at 11:59 p.m. ET.",
    ],
    deadline: "December 13, 2026 at 11:59 p.m. ET · preliminary application",
    deadlineAt: "2026-12-13T23:59:59-05:00",
    sourceUrl: "https://www.cbwchc.org/chi/project-ahead-internships",
    secondarySourceUrl: "https://cbwchc.applicantstack.com/x/detail/a23gs1h9nllu?preview=1",
    featuredOnHome: true,
  },
  {
    id: "uchicago-advanced-research-internship-2027",
    title: "UChicago Advanced Research Internship, Summer 2027",
    organization: "University of Chicago Medicine Comprehensive Cancer Center",
    category: "Paid cancer research internship",
    audience: "College sophomores and juniors interested in research or medicine",
    summary:
      "A 10-week, full-time cancer research internship with a $5,000 taxable stipend, plus monthly career development, leadership, community outreach, and mentoring activities through May 2028. Housing and travel are not provided.",
    eligibility: [
      "College sophomore or junior when applying and at least 16 at the start of the Summer 2027 program.",
      "Strong interest in scientific research or medicine, a strong academic record especially in math and science, and availability for the full-time summer program and monthly activities through May 2028.",
      "Immediate family members of the program leadership team or UChicago faculty are not eligible.",
    ],
    applicationChecklist: [
      "Submit the online application with academic information, including GPA and a recent transcript, contact information, and short responses of up to 250 words each.",
      "Arrange for two recommendations, including at least one from a teacher or professor, by the application deadline.",
    ],
    deadline: "January 18, 2027 at 11:59 p.m. CT",
    deadlineAt: "2027-01-18T23:59:59-06:00",
    sourceUrl: "https://www.uchicagomedicine.org/cancer/education-outreach/student-education/high-school-undergraduate/dicr",
    secondarySourceUrl: "https://redcap.link/2027UCCCCPathwayPrograms",
    featuredOnHome: true,
  },
  {
    id: "grady-volunteer-program-2026",
    title: "Grady Health volunteer opportunities",
    organization: "Grady Health System",
    category: "Atlanta hospital community service · nonclinical",
    audience: "Students and community members interested in serving at Grady in Atlanta",
    summary:
      "Grady describes nonclinical volunteer areas such as Guest Services and campus beautification. Check the portal for current openings; Women’s Services Liaison placements are waitlist only.",
    eligibility: [
      "The volunteer program welcomes students and community members; applicants complete an interview, health screening, and background check.",
      "Volunteers must commit to at least one year of service and a minimum of three hours each week.",
    ],
    applicationChecklist: [
      "Review the current open roles and submit the application through Grady's volunteer portal.",
      "Complete the interview, health screening, background check, orientation, and training before placement.",
    ],
    deadline: "Rolling · apply for currently listed roles",
    sourceUrl: "https://www.gradyhealth.org/volunteer/",
    secondarySourceUrl: "https://www.volgistics.com/appform/1652843896",
    featuredOnHome: true,
  },
  {
    id: "udall-undergraduate-scholarship-2027",
    requiresCampusConfirmation: true,
    title: "Udall Undergraduate Scholarship, 2027",
    organization: "Morris K. Udall and Stewart L. Udall Foundation",
    category: "Public-service and environmental scholarship",
    audience: "Sophomores and juniors pursuing environmental careers, or enrolled Native/Alaska Native students pursuing health care or Tribal public policy",
    summary:
      "The national 2027 application is available, but only a faculty representative can grant access. Georgia Tech’s internal nomination deadline and current availability could not be confirmed; check with campus advising before preparing materials.",
    eligibility: [
      "For the environment category: U.S. citizen, national, or permanent resident; sophomore or junior at an accredited institution; and planning a career related to the environment.",
      "For Native health care or Tribal public policy: U.S. citizen, national, or permanent resident; an enrolled member of a federally recognized tribe; and pursuing health care or Tribal public policy.",
    ],
    applicationChecklist: [
      "Contact Georgia Tech Prestigious Fellowships Advising now about the campus nomination process, faculty representative, and internal deadline; students cannot access the application without a faculty representative.",
      "Prepare the 11-question application, an 800-word essay, college transcripts, and three recommendation letters. Additional documents apply to Native health care/Tribal public policy applicants and some permanent residents.",
      "Faculty representatives must register applicants by March 3, 2027, before the national submission deadline on March 4.",
    ],
    deadline: "March 4, 2027 at 11:59 p.m. MST · campus deadline may be earlier",
    deadlineAt: "2027-03-05T01:59:59-05:00",
    sourceUrl: "https://www.udall.gov/ourprograms/scholarship/apply",
    secondarySourceUrl: "https://www.udall.gov/OurPrograms/Scholarship/ImportantDates",
  },
  {
    id: "nyu-grossman-surp-2027",
    title: "NYU Grossman Summer Undergraduate Research Program (SURP), 2027",
    organization: "NYU Grossman School of Medicine · Vilcek Institute",
    category: "Paid biomedical research",
    audience: "Undergraduates with bench-laboratory experience pursuing biomedical research",
    summary:
      "Full-time research in New York City, June 1–July 30, 2027, with $5,000, housing, and round-trip travel reimbursement. Students cover food and other living costs.",
    eligibility: [
      "U.S. citizen or permanent resident; completed sophomore or junior year of college.",
      "At least one full semester of bench-laboratory research and commitment to the entire program.",
    ],
    applicationChecklist: [
      "Submit materials through NYU's application portal. Selection considers research experience, academic record, and recommendations from faculty advisers or research supervisors.",
      "Check the portal's full materials instructions; the public pages do not specify the number of recommendation letters.",
    ],
    deadline: "February 2, 2027 at 5:00 p.m. ET",
    deadlineAt: "2027-02-02T17:00:00-05:00",
    sourceUrl: "https://med.nyu.edu/research/vilcek-institute-graduate-biomedical-sciences/summer-undergraduate-research-program",
    secondarySourceUrl: "https://med.nyu.edu/research/vilcek-institute-graduate-biomedical-sciences/summer-undergraduate-research-program/admissions",
    featuredOnHome: true,
  },
  {
    id: "pd-soros-fellowship-2027",
    title: "Paul & Daisy Soros Fellowships for New Americans, 2027",
    organization: "Paul & Daisy Soros Fellowships for New Americans",
    category: "Graduate and professional-school fellowship",
    audience: "Eligible immigrants and children of immigrants starting or continuing graduate or professional study",
    summary:
      "The 2027 fellowship application is open for full-time U.S. graduate and professional degrees, including medicine. Students applying to graduate school may apply before admission.",
    eligibility: [
      "Age 30 or younger on October 29, 2026, and meet the program’s specific New American criteria for immigrants or children of immigrants; read the official eligibility rules for your circumstances.",
      "Have a bachelor’s degree by fall 2027 and plan full-time enrollment in an accredited U.S. graduate or professional degree during 2027–28. You must not have begun the third year of the degree being funded by the application deadline.",
      "Executive, certificate, post-baccalaureate, and joint bachelor’s/master’s programs awarding both degrees simultaneously are ineligible.",
    ],
    applicationChecklist: [
      "Submit the online application, résumé or CV, two essays, relevant transcripts, and any test scores required for admission to the degree being funded.",
      "Register three to five recommenders; at least three recommendations and all application materials must arrive by the same 2 p.m. ET deadline.",
    ],
    deadline: "October 29, 2026 at 2:00 p.m. ET",
    deadlineAt: "2026-10-29T14:00:00-04:00",
    sourceUrl: "https://pdsoros.org/application-process/",
    secondarySourceUrl: "https://pdsoros.org/eligibility/",
    featuredOnHome: true,
  },
];

function nowHasPassed(deadlineAt: string) {
  return Date.now() > new Date(deadlineAt).getTime();
}

export function getOpenNowOpportunities() {
  return openOpportunities
    .filter(
      (opportunity) => !opportunity.requiresCampusConfirmation &&
        (!opportunity.deadlineAt || !nowHasPassed(opportunity.deadlineAt)),
    )
    .sort((a, b) => {
      const aDeadline = a.deadlineAt ? new Date(a.deadlineAt).getTime() : Number.POSITIVE_INFINITY;
      const bDeadline = b.deadlineAt ? new Date(b.deadlineAt).getTime() : Number.POSITIVE_INFINITY;
      return aDeadline - bDeadline;
    });
}

export function getHomeOpenOpportunities() {
  return getOpenNowOpportunities().filter((opportunity) => opportunity.featuredOnHome);
}

export function getNominationOpportunities() {
  return openOpportunities.filter((opportunity) => opportunity.requiresCampusConfirmation &&
    (!opportunity.deadlineAt || !nowHasPassed(opportunity.deadlineAt)));
}
