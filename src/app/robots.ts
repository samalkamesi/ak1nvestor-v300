import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/admin/", "/api/member/", "/api/booking", "/api/styrelse/", "/api/cron/", "/api/migrate-to-supabase"],
    },
    sitemap: "https://lab.ak1nvestor.com/sitemap.xml",
  };
}
