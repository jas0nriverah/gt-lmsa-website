import type { MetadataRoute } from "next";

const baseUrl = "https://gt-lmsa-website.vercel.app";
const routes = ["", "/about", "/programs", "/events", "/resources", "/get-involved", "/links"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route): MetadataRoute.Sitemap[number] => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "/events" || route === "/resources" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/links" ? 0.6 : 0.8,
  }));
}
