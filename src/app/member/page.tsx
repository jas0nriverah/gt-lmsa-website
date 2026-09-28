import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SitePage } from "@/components/SitePage";
import { MemberPortal } from "@/components/platform/MemberPortal";
import { authConfigured } from "@/server/config";

export const metadata: Metadata = {
  title: "Member Portal",
  description: "Manage your LMSA Plus at Georgia Tech chapter profile and event registrations.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function MemberPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Member portal"
        title="Your chapter profile and events."
        description="Manage your profile, see your membership status, and keep track of chapter event registrations."
      />
      <section className="section-shell bg-gt-cream">
        <div className="mx-auto max-w-6xl">
          <MemberPortal authEnabled={authConfigured()} />
        </div>
      </section>
    </SitePage>
  );
}
