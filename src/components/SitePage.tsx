import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { HelpButton } from "./HelpButton";
import { Navbar } from "./Navbar";

export function SitePage({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <HelpButton />
    </>
  );
}
