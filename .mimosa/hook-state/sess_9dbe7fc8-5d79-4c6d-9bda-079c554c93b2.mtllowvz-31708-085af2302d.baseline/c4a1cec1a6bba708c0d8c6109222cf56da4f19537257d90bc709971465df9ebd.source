import { NextRequest, NextResponse } from "next/server";
import { getCourses, getAnalyses, getCaseStudies, getBlogPosts } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = "https://lab.ak1nvestor.com";

/**
 * GET /api/cron/seo-refresh — var 6h via Vercel cron.
 * Räknar crawlbara URL:er och rapporterar sitemap-hälsa.
 * Not: Google /ping?sitemap= är avvecklat — Search Console plockar
 * upp sitemap automatiskt när den är registrerad.
 */
export async function GET(req: NextRequest) {
  // Vercel cron skickar Authorization: Bearer CRON_SECRET (om satt)
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const urlCount =
    8 + // statiska sidor
    Object.keys(getCourses()).length +
    getAnalyses().length +
    getCaseStudies().length +
    getBlogPosts().length;

  return NextResponse.json({
    ok: true,
    sitemapUrl: `${SITE_URL}/sitemap.xml`,
    urlCount,
    note: "Registrera sitemap i Google Search Console för automatisk uppdatering",
    refreshedAt: new Date().toISOString(),
  });
}
