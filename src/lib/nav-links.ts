import type { NavLink } from "./site-types";

/**
 * Primary site navigation.
 * Kept separate from site-data.ts so nav updates can ship without rewriting the large content file.
 */
export const navLinks: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/resources" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Links", href: "/links" },
];
