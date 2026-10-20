import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/member", "/officer"],
    },
    sitemap: "https://www.gt-lmsa.com/sitemap.xml",
  };
}
