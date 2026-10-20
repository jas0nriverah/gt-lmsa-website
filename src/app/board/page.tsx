import type { Metadata } from "next";
import { BoardGrid } from "@/components/BoardGrid";
import { SitePage } from "@/components/SitePage";

export const metadata: Metadata = {
  title: "Executive Board",
  description: "Meet the executive board of LMSA+ at Georgia Tech.",
};

export default function BoardPage() {
  return (
    <SitePage>
      <BoardGrid
        eyebrow="LMSA+ at Georgia Tech"
        title="Executive board"
        className="bg-gt-cream"
      />
    </SitePage>
  );
}
