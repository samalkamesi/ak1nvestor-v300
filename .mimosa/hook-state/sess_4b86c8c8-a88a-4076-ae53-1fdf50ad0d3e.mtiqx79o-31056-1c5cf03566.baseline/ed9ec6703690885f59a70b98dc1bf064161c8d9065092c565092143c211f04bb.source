import type { MetadataRoute } from "next";

/** /robots.txt — tillåt crawlers på publikt innehåll, skydda admin och API */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/kurser/", "/analyser/", "/labb/", "/blogg/", "/medlemskap/"],
        disallow: [
          "/admin",
          "/api/admin/",
          "/api/member/",
          "/api/booking",
          "/api/styrelse/",
          "/api/ai-analys/",
          "/api/cron/",
          "/api/migrate-to-supabase",
        ],
      },
    ],
    sitemap: "https://lab.ak1nvestor.com/sitemap.xml",
  };
}
