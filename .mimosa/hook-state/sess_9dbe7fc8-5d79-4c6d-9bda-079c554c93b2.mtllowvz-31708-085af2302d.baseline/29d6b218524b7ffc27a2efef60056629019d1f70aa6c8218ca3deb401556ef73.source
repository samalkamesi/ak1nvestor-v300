import { NextRequest, NextResponse } from "next/server";
import { hamtaNyhetsFlode, valideraRssUrl, type Nyhet } from "@/lib/nyhets-motor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/nyheter — Nyhetscentralens server-side flöde.
 *
 * Motorn (src/lib/nyhets-motor.ts) äger källorna (Yahoo-nyheter per ticker,
 * ämneskanaler, egna RSS-flöden); denna route äger SANERINGEN och cachen.
 * ALDRIG krascha: allt fel hanteras här → { ok: false } med 500.
 *
 * Query (alla valfria, komma-separerade):
 *   ?tickers=VOLV-B,SWED-A   max 15 (ticker-regex, samma som övriga motorer)
 *   ?bevakning=...           max 15 bevaknings-TICKERS (samma sanitizing)
 *   ?amnen=marknad,rente     max 6 ämneskanal-ids ur STANDARD_AMNESKANALER
 *   ?rss=<encodat>           max 5 URL:er (valideras via valideraRssUrl)
 *
 * Fältnamnen speglar NyhetsKanaler (src/lib/nyhetskanaler.ts): tickers,
 * bevakning, amnen (kanal-ids), rss (url:er).
 *
 * Cachning i två led: motorn cachar själva hämtningen 30 min via datacache-
 * centralen (lasEllerHamta); denna route har dessutom en liten minnescache
 * per instans (5 min TTL, 40 nycklar) som äger franCache-signalen och
 * skyddar mot pollningsburstar (accelerator, aldrig beroende).
 */

/** Ticker-format som Yahoo accepterar (samma regex som övriga motorer). */
const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/** Ämneskanal-id: bokstäver/siffror/bindestreck (t.ex. "marknad", "rente"). */
const AMNE_RE = /^[A-Za-z0-9\-]{2,24}$/;

/** Gränser enligt Nyhetscentralens API-kontrakt. */
const MAX_TICKERS = 15;
const MAX_RSS = 5;
const MAX_AMNEN = 6;

// ── Sanering ─────────────────────────────────────────────────────────────────

/** Rensa och validera en ticker-lista (versaler, regex, cap 15). */
function rensaTickers(rå: string | null): string[] {
  if (!rå) return [];
  const sett = new Set<string>();
  for (const del of rå.split(",")) {
    const t = del.trim().toUpperCase();
    if (t.length === 0 || !TICKER_RE.test(t)) continue;
    sett.add(t);
    if (sett.size >= MAX_TICKERS) break;
  }
  return [...sett];
}

/** Rensa ämneskanaler (gemener, regex, cap 6). */
function rensaAmnen(rå: string | null): string[] {
  if (!rå) return [];
  const sett = new Set<string>();
  for (const del of rå.split(",")) {
    const a = del.trim().toLowerCase();
    if (a.length === 0 || !AMNE_RE.test(a)) continue;
    sett.add(a);
    if (sett.size >= MAX_AMNEN) break;
  }
  return [...sett];
}

/** Tolerant URL-dekodning — ogiltig %-sekvens ger strängen oavkodad. */
function dekoda(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/**
 * Rensa RSS-url:er. Varje del förväntas URL-kodad; efter dekodning valideras
 * den av motorns valideraRssUrl ({ ok, fel? } — https + SSRF-validering)
 * FÖRE någon hämtning. Max 5 st.
 */
function rensaRss(rå: string | null): string[] {
  if (!rå) return [];
  const ut: string[] = [];
  for (const del of rå.split(",")) {
    const url = dekoda(del.trim());
    if (url.length === 0 || url.length > 2000) continue;
    if (!valideraRssUrl(url).ok) continue;
    ut.push(url);
    if (ut.length >= MAX_RSS) break;
  }
  return ut;
}

// ── Minnescache (per instans — accelerator, aldrig beroende) ─────────────────

type CachePost = { tid: number; nyheter: Nyhet[] };

const CACHE_TTL_MS = 5 * 60_000;
const CACHE_MAX = 40;
const MINNE = new Map<string, CachePost>();

function lasUrCache(nyckel: string): Nyhet[] | null {
  const post = MINNE.get(nyckel);
  if (!post) return null;
  if (Date.now() - post.tid > CACHE_TTL_MS) {
    MINNE.delete(nyckel); // för gammal
    return null;
  }
  return post.nyheter;
}

function sparaICache(nyckel: string, nyheter: Nyhet[]): void {
  if (MINNE.size >= CACHE_MAX) {
    const aldst = MINNE.keys().next().value; // insättningsordning = ålder
    if (aldst !== undefined) MINNE.delete(aldst);
  }
  MINNE.set(nyckel, { tid: Date.now(), nyheter });
}

// ── Routen ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;

    const tickers = rensaTickers(params.get("tickers"));
    const bevakning = rensaTickers(params.get("bevakning")); // samma ticker-sanering
    const amnen = rensaAmnen(params.get("amnen"));
    const rss = rensaRss(params.get("rss"));

    // Konfig till motorn (NyhetsFlodeKonfig) — ENDAST de fält som faktiskt
    // efterfrågades; utan parametrar tillämpar motorn sina egna standardval.
    const konfig = {
      ...(tickers.length > 0 ? { tickers } : {}),
      ...(bevakning.length > 0 ? { bevakning } : {}),
      ...(amnen.length > 0 ? { amnen } : {}),
      ...(rss.length > 0 ? { rssUrls: rss } : {}),
    };

    const nyckel = JSON.stringify(konfig);
    const cachad = lasUrCache(nyckel);
    if (cachad !== null) {
      return NextResponse.json({
        ok: true,
        nyheter: cachad,
        franCache: true,
        antal: cachad.length,
      });
    }

    // Motorn kastar aldrig (P8-graceful, tom array vid motstånd) och cachar
    // själva hämtningen 30 min via datacache-centralen — route-cachen ovan
    // äger franCache-signalen och skyddar mot pollningsburstar.
    const nyheter = await hamtaNyhetsFlode(konfig);
    sparaICache(nyckel, nyheter);
    return NextResponse.json({
      ok: true,
      nyheter,
      franCache: false,
      antal: nyheter.length,
    });
  } catch (e: unknown) {
    // ALDRIG krascha — Nyhetscentralen visar sitt viloläge i stället.
    return NextResponse.json(
      { ok: false, fel: e instanceof Error ? e.message : "Kunde inte hämta nyhetsflödet" },
      { status: 500 },
    );
  }
}
