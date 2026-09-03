import { NextRequest, NextResponse } from "next/server";
import { getCourses, getAnalyses, getCaseStudies, getBlogPosts } from "@/lib/content";
import { publiceraOrganEvent } from "@/lib/organ-event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = "https://lab.ak1nvestor.com";

/**
 * GET /api/cron/seo-refresh — Hud-ronden (daglig 03:00 UTC, se vercel.json —
 * Hobby-regeln: max EN körning/dag; tidigare "var 6h" i gamla planer gäller
 * INTE).
 * Räknar crawlbara URL:er och rapporterar sitemap-hälsa.
 * Not: Google /ping?sitemap= är avvecklat — Search Console plockar
 * upp sitemap automatiskt när den är registrerad.
 *
 * AUTONOMI-ARKITEKTUR (data/forskning/AUTONOMI-ARKITEKTUR.md): rondens
 * utandning är ett OrganEvent (organ/seo) så kroppsvyn ser pulsen — utan det
 * var ronden "tyst" (resultatet nådde aldrig någon vy).
 *
 * Skydd: CRON_SECRET (om satt) via ?secret= eller Authorization: Bearer —
 * samma mönster som övriga cron-rutter.
 */
export async function GET(req: NextRequest) {
  // Vercel cron skickar Authorization: Bearer CRON_SECRET (om satt);
  // ?secret= stöds för lokal/manuell körning — samma mönster som cron/vagscan.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const qs = req.nextUrl.searchParams.get("secret");
    const auth = req.headers.get("authorization");
    if (qs !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const urlCount =
    8 + // statiska sidor
    Object.keys(getCourses()).length +
    getAnalyses().length +
    getCaseStudies().length +
    getBlogPosts().length;

  // kroppspulsen — grovt tal, inga URL:er (P8)
  await publiceraOrganEvent({
    source: "organ/seo",
    verb: "rapport",
    matt: { crawlbaraUrl: urlCount },
  });

  return NextResponse.json({
    ok: true,
    sitemapUrl: `${SITE_URL}/sitemap.xml`,
    urlCount,
    note: "Registrera sitemap i Google Search Console för automatisk uppdatering",
    refreshedAt: new Date().toISOString(),
  });
}
