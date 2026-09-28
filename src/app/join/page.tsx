import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { JoinSignIn } from "@/components/platform/JoinSignIn";
import { SitePage } from "@/components/SitePage";
import { contactLinks } from "@/lib/site-data";
import { authConfigured } from "@/server/config";

export const metadata: Metadata = {
  title: "Join the Chapter",
  description: "Create a member profile for LMSA Plus at Georgia Tech.",
};

export const dynamic = "force-dynamic";

export default function JoinPage() {
  const enabled = authConfigured();
  return (
    <SitePage>
      <PageHero
        eyebrow="Join LMSA Plus"
        title="Start with a chapter profile."
        description="Students interested in health professions and community are welcome. Local chapter participation is separate from paid LMSA National membership."
      />
      <Section
        eyebrow="Member access"
        title="Create your member profile"
        description="Membership activation is handled by chapter leadership. Signing in does not automatically approve or promote an account."
        className="bg-gt-cream"
      >
        <div className="card max-w-3xl p-6 sm:p-8">
          <JoinSignIn authEnabled={enabled} chapterEmail={contactLinks.email} />
        </div>
      </Section>
    </SitePage>
  );
}
