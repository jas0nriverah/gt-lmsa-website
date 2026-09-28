import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/member", "/officer"],
    },
    sitemap: "https://gt-lmsa-website.vercel.app/sitemap.xml",
  };
}
