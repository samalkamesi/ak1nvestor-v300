import { NextRequest, NextResponse } from "next/server";
import { hamtaNyhetsFlode, STANDARD_AMNESKANALER, type Nyhet } from "@/lib/nyhets-motor";
import { publiceraSignal } from "@/lib/signal-bus";
import { publiceraOrganEvent } from "@/lib/organ-event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/nyheter/scan — Nyhetscentralens dagliga morgon-andning.
 *
 * Skannar UNIVERSUM-flödet (12 svenska tickers + motorns standardämneskanaler,
 * UTAN elev-specifik konfig) och publicerar signaler på signal-bussen för
 * hög-påverkansnyheter (paverkan ≥ 70), max 5 per scan — mottagare fas2.
 * Avslutar med en OrganEvent-rapport (organ/nyheter) till nervsystemet.
 * Körs av Vercel Cron (08:00 UTC — se vercel.json); samma CRON_SECRET-skydd
 * som cron/vagscan: om CRON_SECRET är satt krävs matchning via ?secret=
 * (query) eller Authorization: Bearer (Vercel Cron). ALDRIG krascha.
 */

// AKM1-universum — 12 tickers (samma lista som cron/vagscan och cron/datacache)
const UNIVERSUM = [
  "VOLV-B.ST", "SAAB-B.ST", "ATCO-A.ST", "SAND.ST", "SWED-A.ST", "ESSITY-B.ST",
  "ERIC-B.ST", "AZN.ST", "NDA-SE.ST", "SKF-B.ST", "ALFA.ST", "SHB-B.ST",
];

/** Påverkans-tröskel för att en nyhet ska bli en signal. */
const PAVERKAN_TROSKEL = 70;

/** Max signaler per scan — bussen är bounded, morgonen ska inte svämma över. */
const MAX_SIGNALER = 5;

/** Påverkan som tal — 0 när fältet mot förmodan är ogiltigt. */
function paverkanAv(n: Nyhet): number {
  return typeof n.paverkan === "number" && Number.isFinite(n.paverkan) ? n.paverkan : 0;
}

/** AK1A-notens tanke om nyheten — fallback till fast pedagogisk text. */
function lasTanke(n: Nyhet): string {
  const tanke = n.ak1aNot?.tanke;
  return typeof tanke === "string" && tanke.trim().length > 0
    ? tanke
    : "Värdefull marknadsinformation — läs i Nyhetscentralen";
}

export async function GET(req: NextRequest) {
  // samma skydd som cron/vagscan: om CRON_SECRET är satt krävs matchning —
  // via ?secret= (query) eller Authorization: Bearer (Vercel Cron).
  // utan satt secret är rutten öppen (dev).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const qs = req.nextUrl.searchParams.get("secret");
    const auth = req.headers.get("authorization");
    if (qs !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    // 1) universumflödet — 12 standard-tickers + standardämneskanalernas
    //    id:n (samma uppslag som nyhetskanaler.ts), ingen elevkonfig
    //    (morgonens gemensamma bild av marknaden). Motorn kastar aldrig
    //    (P8-graceful, tom array vid motstånd).
    const nyheter = await hamtaNyhetsFlode({
      tickers: UNIVERSUM,
      amnen: STANDARD_AMNESKANALER.map((k) => k.id),
    });

    // 2) ranka på påverkan — hög överst; träffar över tröskeln
    const rankade = nyheter.slice().sort((a, b) => paverkanAv(b) - paverkanAv(a));
    const hoga = rankade.filter((n) => paverkanAv(n) >= PAVERKAN_TROSKEL);

    // 3) signaler — max 5 per scan till fas2 (publiceraSignal kastar aldrig;
    //    utan Supabase-konfig är den en no-op)
    let signaler = 0;
    for (const nyhet of hoga.slice(0, MAX_SIGNALER)) {
      await publiceraSignal({
        kalla: "nyhetsscan",
        typ: "info", // Signal-bussens fackliga typer: info/varning/mojlighet/beslut
        rubrik: (nyhet.rubrik ?? "").slice(0, 90),
        text: lasTanke(nyhet),
        ikon: "📰",
        mottagare: "fas2",
        lank: "/nyheter",
      });
      signaler += 1;
    }

    // 4) organrapport — nervsystemets kvitto på morgonens andning
    await publiceraOrganEvent({
      source: "organ/nyheter",
      verb: "rapport",
      matt: {
        antal: nyheter.length,
        hogPaverkan: hoga.length,
        status: nyheter.length > 0 ? "GRÖN" : "GUL",
      },
    });

    return NextResponse.json({
      ok: true,
      antal: nyheter.length,
      hogPaverkan: hoga.length,
      signaler,
    });
  } catch (e: unknown) {
    // ALDRIG krascha — cron-andningen försöker igen imorgon.
    return NextResponse.json(
      { ok: false, fel: e instanceof Error ? e.message : "Nyhetsskanningen misslyckades" },
      { status: 500 },
    );
  }
}
