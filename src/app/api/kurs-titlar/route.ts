import { NextRequest, NextResponse } from "next/server";
import { readFileSync, statSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

type IndexPost = { slug?: unknown; title?: unknown };

let cache: Record<string, string> | null = null;
let cacheMtime = 0;

/** slug → titel ur public/sok-index.json (92 K — mtime-cachas som /api/kurs). */
function lasTitlar(): Record<string, string> {
  try {
    const filePath = join(process.cwd(), "public", "sok-index.json");
    const mtime = statSync(filePath).mtimeMs;
    if (cache && mtime === cacheMtime) return cache;
    const parsed = JSON.parse(readFileSync(filePath, "utf-8")) as { kurser?: IndexPost[] };
    const ut: Record<string, string> = {};
    for (const k of parsed.kurser ?? []) {
      if (typeof k.slug === "string" && typeof k.title === "string") ut[k.slug] = k.title;
    }
    cache = ut;
    cacheMtime = mtime;
    return ut;
  } catch {
    return {};
  }
}

/**
 * GET /api/kurs-titlar?slugs=a,b,c — titlar för ≤10 slugs.
 *
 * SPÅR 7 s7-u3 (flight-kuren): not-found-gränsernas KursForslag bär endast
 * slugs i RSC-flighten (förr 393 {slug,titel}-objekt ≈ 42 K på VARJE sida);
 * denna endpoint levererar titlarna löst när ett 404-förslag faktiskt visas.
 * Okända slugs utelämnas tyst (klienten behåller slug-etiketten).
 */
export async function GET(req: NextRequest) {
  const rå = req.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = rå
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 200)
    .slice(0, 10);
  const titlar = lasTitlar();
  const ut: Record<string, string> = {};
  for (const s of slugs) {
    if (titlar[s]) ut[s] = titlar[s];
  }
  return NextResponse.json(ut, { headers: { "Cache-Control": "public, max-age=3600" } });
}
