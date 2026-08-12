import { NextResponse } from "next/server";

export const dynamic = "force-static";

/** GET /robots.txt — allow all crawlers, point to sitemap */
export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /api/admin/
Disallow: /api/member/
Disallow: /api/booking
Disallow: /api/styrelse/
Disallow: /api/ai-analys/
Disallow: /api/cron/
Disallow: /api/migrate-to-supabase
Allow: /api/mega/tasks
Allow: /api/analysis/
Allow: /api/system/status
Allow: /api/supabase/status

Sitemap: https://lab.ak1nvestor.com/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
