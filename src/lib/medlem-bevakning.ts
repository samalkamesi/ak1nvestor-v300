/**
 * MEDLEM-BEVAKNING — medlemmens bevakningslista (VÅG 104, STYRELSE-
 * PORTAL-MEGA.md: "Analyserna i navet — din bevakning per konto").
 *
 * ── KONTRAKTET ──────────────────────────────────────────────────────────────
 * Bevakningen bor i system_events (INGEN DDL — MÖS-lärdomen) som rader
 * type="medlem_bevakning", skrivna exakt enligt medlem-progress.ts-mönstret
 * (getSupabaseRest, Prefer: return=minimal, AbortSignal.timeout(8000),
 * fail-safe). Läsningen är SENASTE-VINNER per nyckel och REQUESTSCOPAD —
 * ALDRIG modul-cache (§B.4: global memo läcker mellan medlemmar).
 *
 * ── NYCKELFORMELN (deterministisk — ALDRIG klientskickad sträng, §B.3) ──────
 *   bevaka → bevaka:<ticker>   varde "1" (bevakas) | "0" (av)
 * Ticker på/av fastställs av SERVERN mot analysbiblioteket (getAnalyses)
 * — en nyckel för en okänd analys kan aldrig skrivas.
 *
 * ── GRÄNSER ─────────────────────────────────────────────────────────────────
 * BEVAKNING_MAX aktiva bolag per konto (20) — räknas ur läsningen FÖRE
 * skrivning; klienten kan aldrig överskrida taket via upprepade POST:ar.
 *
 * ── GDPR ────────────────────────────────────────────────────────────────────
 * Raden bär ENDAST authId + ticker + på/av — ingen e-post, ingen tredje
 * part, inga kursprestationer. Läsningen filtrerar details->>authId —
 * en medlem ser aldrig en annan medlems bevakning.
 *
 * ── VÅG 79-HERMETIK ─────────────────────────────────────────────────────────
 * NEXT_PHASE==="phase-production-build" ⇒ läsningen svarar tomt UTAN nät
 * och skrivningen NEKAS — modulen FÅR ALDRIG fetcha under next build.
 *
 * Pedagogisk plattform — inte investeringsråd. Bevakningen är en
 * läsningslista ("följ bolagets analys"), aldrig en handelslista.
 */

import { getSupabaseRest } from "./supabase-rest";
import { getAnalyses } from "@/lib/content";

// ── Event-typ + gränser (exporteras för rutten) ─────────────────────────────

/** Event-typen för bevakningen (system_events.type; INGEN ny tabell/DDL). */
export const MEDLEM_BEVAKNING_EVENT_TYP = "medlem_bevakning";
const MEDLEM_BEVAKNING_KALLA = "medlem";

/** Max AKTIVA (på) bevakade analyser per konto. */
export const BEVAKNING_MAX = 20;

/** Tickrarna i analysbiblioteket — skrivvalideringens sanningskälla. */
export function analysTickerUppstattning(): Set<string> {
  return new Set(getAnalyses().map((a) => a.ticker));
}

export type BevakningSkrivning = { ok: true; nyckel: string } | { ok: false; fel: string; status: number };

/**
 * valideraBevakningSkrivning — {ticker, pa} mot biblioteket och taket.
 * Felkartan: 400 ogiltig kropp/okänd ticker · 409 taket nått (endast på).
 * Värdet "1"/"0" FASTSTÄLLS HÄR — klienten skickar bara booleanen.
 */
export function valideraBevakningSkrivning(
  body: { ticker?: unknown; pa?: unknown },
  uppstattning: ReadonlySet<string>,
  aktivaAntal: number,
): BevakningSkrivning {
  const ticker = typeof body.ticker === "string" ? body.ticker.trim() : "";
  if (ticker === "" || ticker.length > 24 || ticker.includes(" ") || /[%"'\\]/.test(ticker)) {
    return { ok: false, fel: "Ogiltig ticker.", status: 400 };
  }
  if (!uppstattning.has(ticker)) {
    return { ok: false, fel: "Analysen finns inte i biblioteket.", status: 400 };
  }
  const pa = body.pa === true;
  if (pa && aktivaAntal >= BEVAKNING_MAX) {
    return {
      ok: false,
      fel: `Bevakningslistan är full (max ${BEVAKNING_MAX} bolag) — ta bort ett först.`,
      status: 409,
    };
  }
  return { ok: true, nyckel: `bevaka:${ticker}` };
}

// ── PostgREST-plumbing (medlem-progress.ts-mönstret — REQUESTSCOPAT) ────────

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Senaste-vinner-ordningen — id.desc som tiebreaker (lager.ts våg 67). */
const SENASTE = "order=created_at.desc,id.desc";
const SIDSTORLEK = 1000;
const MAX_Sidor = 10;

/** Värderad som den lagras i raden: "1" = bevakas, "0" = av. */
const PÅ = "1";
const AV = "0";

type BevakningLasRad = { nyckel: string; varde: string };

/**
 * lasRaderFor — läs EN medlems alla bevakningsrader (nyest först, Range-
 * paginerat). Kastar ALDRIG; fel/tomt/byggfas ⇒ tom array. Filter
 * details->>authId=eq.<authId> gör läsningen requestskopad per medlem.
 */
async function lasRaderFor(authId: string): Promise<BevakningLasRad[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  const rest = getSupabaseRest();
  if (!rest) return [];
  const rader: BevakningLasRad[] = [];
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    try {
      const url =
        rest.origin +
        "/rest/v1/system_events?type=eq." +
        fv(MEDLEM_BEVAKNING_EVENT_TYP) +
        "&details->>authId=eq." +
        fv(authId) +
        "&select=details->>nyckel,details->>varde&" +
        SENASTE;
      const res = await fetch(url, {
        headers: { ...rest.headers, Range: `${fran}-${String(fran + SIDSTORLEK - 1)}` },
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (!res.ok) return []; // tyst fall-back — tom bevakning
      const sidRader = (await res.json()) as BevakningLasRad[];
      if (!Array.isArray(sidRader)) return [];
      rader.push(...sidRader);
      if (sidRader.length < SIDSTORLEK) break;
    } catch {
      return []; // nätverksfel/timeout — tyst fall-back
    }
  }
  return rader;
}

/** Medlemmens bevakning — tickers vars senaste värde är "1", sorterat. */
export type MedlemBevakning = { tickers: string[] };

/**
 * lasMedlemBevakning — bevakningslistan (REQUESTSCOPAD: ingen modul-cache,
 * §B.4). Supabase-fel/ej konfigurerat/byggfas ⇒ TOM lista — kastar ALDRIG.
 */
export async function lasMedlemBevakning(authId: string): Promise<MedlemBevakning> {
  if (typeof authId !== "string" || authId === "") return { tickers: [] };
  const senaste = new Map<string, string>();
  for (const r of await lasRaderFor(authId)) {
    if (typeof r?.nyckel === "string" && r.nyckel.startsWith("bevaka:") && !senaste.has(r.nyckel)) {
      senaste.set(r.nyckel, String(r.varde ?? AV));
    }
  }
  const tickers: string[] = [];
  for (const [nyckel, varde] of senaste) {
    if (varde === PÅ) tickers.push(nyckel.slice("bevaka:".length));
  }
  return { tickers: tickers.sort() };
}

// ── Skrivvägen (organ-event.ts-mönstret — exakt §B.4) ───────────────────────

/** Nätverksfel-namn utan hemligheter ("TimeoutError", "TypeError" …). */
function felnamn(e: unknown): string {
  return e instanceof Error ? e.name : "okänt nätverksfel";
}

/**
 * skrivMedlemBevakningEvent — POST EN rad (type=medlem_bevakning,
 * severity=info, details={authId, ticker, nyckel, varde}, source=medlem).
 * Byggfas ⇒ false utan nät. Returnerar ALLTID {ok, fel?} — kastar aldrig.
 */
export async function skrivMedlemBevakningEvent(
  authId: string,
  ticker: string,
  nyckel: string,
  pa: boolean,
): Promise<{ ok: boolean; fel?: string }> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { ok: false, fel: "Skrivning nekas under next build (bygget är nätverks-hermetiskt)." };
  }
  const rest = getSupabaseRest();
  if (!rest) {
    return { ok: false, fel: "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)." };
  }
  try {
    const res = await fetch(rest.origin + "/rest/v1/system_events", {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          type: MEDLEM_BEVAKNING_EVENT_TYP,
          severity: "info",
          message: "[medlem] " + nyckel + " = " + (pa ? PÅ : AV),
          details: { authId, ticker, nyckel, varde: pa ? PÅ : AV },
          source: MEDLEM_BEVAKNING_KALLA,
        },
      ]),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, fel: "Bevakningen kunde inte sparas (lagret svarade HTTP " + String(res.status) + ")." };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, fel: "Bevakningen kunde inte sparas (" + felnamn(e) + ")." };
  }
}
