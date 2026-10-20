import type { MetadataRoute } from "next";

const baseUrl = "https://www.gt-lmsa.com";
const routes = [
  "",
  "/board",
  "/about",
  "/events",
  "/resources",
  "/opportunities",
  "/get-involved",
  "/interest",
  "/join",
  "/help",
  "/privacy",
  "/links",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route): MetadataRoute.Sitemap[number] => ({
    url: `${baseUrl}${route}`,
    changeFrequency:
      route === "/events" || route === "/resources" || route === "/opportunities"
        ? "weekly"
        : "monthly",
    priority: route === "" ? 1 : route === "/links" ? 0.6 : 0.8,
  }));
}
