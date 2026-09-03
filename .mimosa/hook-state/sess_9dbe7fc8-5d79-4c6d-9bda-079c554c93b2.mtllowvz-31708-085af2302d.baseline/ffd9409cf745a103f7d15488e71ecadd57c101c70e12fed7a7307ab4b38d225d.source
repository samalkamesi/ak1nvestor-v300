import { NextResponse, NextRequest } from "next/server";
import { körVagfundament, type MotorSvar } from "@/lib/vagfundament-motor";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { publiceraVagkartaSignal } from "@/lib/signal-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/vagscan — den autonoma vågkartan.
 * AKM1-kopplat: mäter vågor i fundamentalanalytiska indikatorer (V01–V20 ×
 * 5 horisonter) för ett fast universum av 12 svenska tickers via Yahoo
 * fundamentals (primärt), med MarketStack-stöd för senaste EOD-kurs.
 * Körs av Vercel Cron; EN vågskans-skrivning per körning (system_events,
 * type=vagscan) + dagens vågkarta-signal på signal-bussen (publiceraVagkartaSignal).
 */

// AKM1-universum — 12 tickers (motorns tak per anrop)
const UNIVERSUM = [
  "VOLV-B.ST", "SAAB-B.ST", "ATCO-A.ST", "SAND.ST", "SWED-A.ST", "ESSITY-B.ST",
  "ERIC-B.ST", "AZN.ST", "NDA-SE.ST", "SKF-B.ST", "ALFA.ST", "SHB-B.ST",
];

const HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"] as const;
const FORALDRING_DAGAR = 7;

/** Senaste MarketStack-kurs per ticker (null-fält om key/data saknas). */
export type MarketstackPris = {
  pris: number;
  datum: string;
  kalla: "marketstack";
  foraldrad?: boolean;
  notering?: string;
};

type TickerPost = MotorSvar["tickers"][number] & { marketstackPris: MarketstackPris | null };

type Rorelse = { variabel: string; namn: string; antalBolag: number; text: string };

type VagscanSammanstallning = {
  genererad: string;
  universum: string[];
  tickers: TickerPost[];
  universumSammanfattning: { impulsvag: number; korrigering: number; basbygge: number; osatt: number };
  topRorelse: Rorelse[];
  botRorelse: Rorelse[];
};

/** lokal kalenderdag som YYYY-MM-DD ( samma semantik som analys-motorn ). */
function lokalDagIso(d = new Date()): string {
  return (
    d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
  );
}

/** kalenderdagsskillnad a − b i dagar */
function dagarMellan(isoA: string, isoB: string): number {
  return Math.round((Date.parse(isoA + "T00:00:00Z") - Date.parse(isoB + "T00:00:00Z")) / 86400000);
}

/**
 * Senaste EOD per ticker via MarketStack (endast om MARKETSTACK_KEY finns).
 * Färskhetsanalys enligt analys-motorns mönster men icke-dödande: stängelse
 * äldre än 7 dagar markeras "MarketStack-data föråldrad, pris ej bekräftat" —
 * data behålls i svaret (markering, inte fel).
 */
async function hamtaMarketstackSenaste(tickers: string[]): Promise<Record<string, MarketstackPris>> {
  const ut: Record<string, MarketstackPris> = {};
  const key = process.env.MARKETSTACK_KEY ?? "";
  if (!key || tickers.length === 0) return ut;

  // .ST → .XSTO — samma symbolmappning som analys-motorn
  const franSymbol = new Map<string, string>();
  const symboler: string[] = [];
  for (const t of tickers) {
    const sym = t.replace(/\.st$/i, ".XSTO");
    franSymbol.set(sym, t);
    symboler.push(sym);
  }

  try {
    const url =
      "https://api.marketstack.com/v1/eod/latest?access_key=" +
      key +
      "&symbols=" +
      encodeURIComponent(symboler.join(","));
    const r = await fetch(url, {
      headers: { "User-Agent": "AK1A-Analysis/1.0" },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return ut;
    const rader = ((JSON.parse(await r.text())["data"] ?? []) as Array<{
      symbol?: string | null;
      date?: string | null;
      close?: number | null;
    }>);
    const idag = lokalDagIso();
    for (const rad of rader) {
      const ticker = rad.symbol ? franSymbol.get(rad.symbol) : undefined;
      if (!ticker || rad.close == null || !rad.date) continue;
      const datum = String(rad.date).slice(0, 10);
      const pris = Number(rad.close);
      if (!Number.isFinite(pris)) continue;
      const foraldrad = dagarMellan(datum, idag) < -FORALDRING_DAGAR;
      ut[ticker] = foraldrad
        ? { pris, datum, kalla: "marketstack", foraldrad: true, notering: "MarketStack-data föråldrad, pris ej bekräftat" }
        : { pris, datum, kalla: "marketstack" };
    }
  } catch {
    // tyst — vågmätningen lever på Yahoo fundamentals; kursen är stöd
  }
  return ut;
}

/**
 * Per AKM1-variabel: antal bolag där variabelns EGEN våg domineras av
 * impulsvågar (resp. korrigeringar) över de fem horisonterna. Dominans =
 * strängt flest horisonter (deterministiskt; oavgjort räknas inte).
 */
function raknaRorelser(tickers: MotorSvar["tickers"], totalBolag: number): { top: Rorelse[]; bot: Rorelse[] } {
  const analysade = tickers.filter((t) => !t.fel && t.indikatorer);
  if (analysade.length === 0 || totalBolag === 0) return { top: [], bot: [] };

  const vids = Object.keys(analysade[0].indikatorer ?? {}).sort();
  const namn = new Map<string, string>();
  const impulsvag = new Map<string, number>();
  const korrigering = new Map<string, number>();

  for (const t of analysade) {
    for (const vid of vids) {
      const ind = t.indikatorer?.[vid];
      if (!ind) continue;
      namn.set(vid, ind.namn);
      let i = 0;
      let k = 0;
      let b = 0;
      for (const hz of HORIZONTER) {
        const v = ind.vager[hz];
        if (v === "impulsvåg") i += 1;
        else if (v === "korrigering") k += 1;
        else if (v === "basbygge") b += 1;
      }
      if (i > k && i > b) impulsvag.set(vid, (impulsvag.get(vid) ?? 0) + 1);
      if (k > i && k > b) korrigering.set(vid, (korrigering.get(vid) ?? 0) + 1);
    }
  }

  const bygg = (rakne: Map<string, number>): Rorelse[] =>
    vids
      .filter((vid) => (rakne.get(vid) ?? 0) > 0)
      .sort((a, b) => (rakne.get(b) as number) - (rakne.get(a) as number) || (a < b ? -1 : 1))
      .slice(0, 3)
      .map((vid) => {
        const antal = rakne.get(vid) as number;
        const n = namn.get(vid) ?? vid;
        return { variabel: vid, namn: n, antalBolag: antal, text: `${vid} ${n} (${antal} av ${totalBolag} bolag)` };
      });

  return { top: bygg(impulsvag), bot: bygg(korrigering) };
}

export async function GET(req: NextRequest) {
  // samma skydd som cron/autonom: om CRON_SECRET är satt krävs matchning —
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

  // 1) vågmätaren — Yahoo fundamentals (primärt), deterministisk
  const motorSvar = await körVagfundament({ tickers: UNIVERSUM });

  // 2) MarketStack-stöd — senaste EOD-kurs + färskhetsmarkering per ticker
  const msPriser = await hamtaMarketstackSenaste(UNIVERSUM);
  const tickers: TickerPost[] = motorSvar.tickers.map((t) => ({
    ...t,
    marketstackPris: msPriser[t.ticker] ?? null,
  }));

  // 3) universum-sammanfattning — summerat över alla bolag
  const universumSammanfattning = { impulsvag: 0, korrigering: 0, basbygge: 0, osatt: 0 };
  for (const t of motorSvar.tickers) {
    if (!t.sammanfattning) continue;
    universumSammanfattning.impulsvag += t.sammanfattning.impulsvag;
    universumSammanfattning.korrigering += t.sammanfattning.korrigering;
    universumSammanfattning.basbygge += t.sammanfattning.basbygge;
    universumSammanfattning.osatt += t.sammanfattning.osatt;
  }

  const totalBolag = motorSvar.tickers.filter((t) => !t.fel).length;
  const { top, bot } = raknaRorelser(motorSvar.tickers, totalBolag);

  const sammanstallning: VagscanSammanstallning = {
    genererad: new Date().toISOString(),
    universum: UNIVERSUM,
    tickers,
    universumSammanfattning,
    topRorelse: top,
    botRorelse: bot,
  };

  // 4) EN skrivning per körning — tyst vid fel (svaret returneras alltid)
  let supabaseSparad = false;
  const sb = getSupabaseRest();
  if (sb) {
    try {
      const res = await fetch(`${sb.origin}/rest/v1/system_events`, {
        method: "POST",
        headers: { ...sb.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          type: "vagscan",
          severity: "info",
          message: `Vågkarta: ${universumSammanfattning.impulsvag} impulsvågor, ${universumSammanfattning.korrigering} korrigeringar (${totalBolag}/${UNIVERSUM.length} bolag mätta)`,
          details: sammanstallning,
          source: "cron/vagscan",
        }),
      });
      supabaseSparad = res.ok;
    } catch {}
  }

  // 5) signal-bussen — dagens vågkarta andas ut till ALLA (fail-safe: kastar
  //    aldrig; utan Supabase-konfig är den en no-op). Skickas EFTER att
  //    skanningen och system_events-skrivningen är klar.
  const signalSand = await publiceraVagkartaSignal({ ...universumSammanfattning, totalBolag });

  return NextResponse.json({ ...sammanstallning, supabaseSparad, signalSand, disclaimer: "Pedagogisk analys — inte investeringsråd" });
}
