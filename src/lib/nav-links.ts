import type { NavLink } from "./site-types";

/**
 * Primary site navigation.
 * Kept separate from site-data.ts so nav updates can ship without rewriting the large content file.
 */
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Executive Board", href: "/board" },
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
];

/** Private member tools stay available without competing with public navigation. */
export const memberNavLinks: NavLink[] = [
  { label: "Member sign-in", href: "/member" },
];
