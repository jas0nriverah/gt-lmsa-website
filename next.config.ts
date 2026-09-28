import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  logging: { incomingRequests: false },
  async redirects() {
    // OAuth cookies and callbacks share one production origin. Local and preview
    // hosts remain untouched so isolated development never redirects to live data.
    return ["gt-lmsa.com", "gt-lmsa-website.vercel.app"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://www.gt-lmsa.com/:path*",
      permanent: true,
    }));
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};

export default nextConfig;
