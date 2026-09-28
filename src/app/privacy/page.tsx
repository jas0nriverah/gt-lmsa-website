import { SitePage } from "@/components/SitePage";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { contactLinks } from "@/lib/site-data";
export const metadata = { title: "Member privacy" };
export default function PrivacyPage() {
  return <SitePage><PageHero eyebrow="Member privacy" title="Your information, with a purpose." description="The chapter uses membership and event information to support your participation—not to create a public member directory."/>
    <Section title="What the member platform stores" className="bg-white"><div className="max-w-3xl space-y-6 leading-8 text-slate-700">
      <p>Google sign-in verifies your identity. We store your account identifier, verified email, name, session information, chapter membership status, and the academic year, major, or interests you choose to share. We do not request your Google password. Please do not submit medical or patient information; the platform does not need it.</p>
      <p>Event records include your RSVPs, cancellations, and attendance. Check-in records include the time and the officer who confirmed attendance. Check-in codes are temporary; the database stores only a hash of each code.</p>
      <p>A private activity history records important officer actions, including membership-status changes, event changes, check-ins, and attendance exports. It stores account and record identifiers, timestamps, and limited change details—not names, emails, or check-in codes in the activity entries. Authorized officers use it to investigate mistakes and support accountability.</p>
      <h3 className="text-xl font-bold text-gt-navy">Who can see it</h3><p>You can access your own member profile and registrations. Authorized chapter officers can review membership and event records and export attendance information for chapter administration. Public event pages do not publish member names, emails, or attendee lists.</p>
      <h3 className="text-xl font-bold text-gt-navy">Account and membership are different</h3><p>Signing in creates an account, not approved chapter membership. A membership request stays pending until an authorized officer approves it. Joining this chapter does not register you with LMSA National or Georgia Tech Engage.</p>
      <h3 className="text-xl font-bold text-gt-navy">Cookies and service providers</h3><p>Essential cookies keep you signed in and help protect sign-in requests. Vercel provides hosting, Neon provides the database, and Google provides identity sign-in; these services process information needed to run the platform. The chapter does not use this platform to publish your profile or sell your information.</p>
      <h3 className="text-xl font-bold text-gt-navy">Corrections and deletion</h3><p>You can edit your permitted profile fields in My membership. To request account or record deletion, correct account information, or ask about access and retention, email <a className="text-link" href={`mailto:${contactLinks.email}`}>{contactLinks.email}</a> from your registered address. Officers will verify your request before making changes or processing deletion. Records remain in the platform until a verified deletion request is processed; there is no automatic expiry or deletion schedule.</p>
      <p>The separate email-based interest page only prepares a message locally. If you send it, the chapter receives it in its email account; it is not automatically converted into a membership record.</p>
    </div></Section></SitePage>;
}
