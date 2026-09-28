import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { OfficerConsole } from "@/components/platform/OfficerConsole";
import { SitePage } from "@/components/SitePage";
import { authConfigured } from "@/server/config";

export const metadata: Metadata = {
  title: "Officer Dashboard",
  description: "Private officer workspace for LMSA Plus at Georgia Tech.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function OfficerPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Officer workspace"
        title="Chapter operations."
        description="Membership, events, attendance, and chapter analytics for authorized officers."
      />
      <section className="section-shell bg-gt-cream">
        <div className="mx-auto max-w-6xl">
          <OfficerConsole authEnabled={authConfigured()} />
        </div>
      </section>
    </SitePage>
  );
}
