import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yscapital.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/blog",
          "/login",
          "/terms",
          "/privacy-policy",
          "/refund-policy",
          "/showcase_dashboard.png",
          "/ys_logo.png",
          "/favicon.png",
        ],
        disallow: [
          "/api/",
          "/dashboard",
          "/portfolio",
          "/mutual-funds",
          "/fii-dii-tracker",
          "/cashbook",
          "/settings",
          "/users",
          "/history",
          "/loans",
          "/other-investments",
          "/ai-insights",
          "/search",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
