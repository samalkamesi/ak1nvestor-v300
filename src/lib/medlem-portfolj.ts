/**
 * MEDLEM-PORTFOLJ — medlemmens utbildningsportfölj (VÅG 119 P1
 * PORTFÖLJNAVET, data/forskning/PIPELINE-KO.md). Syskonmodul till
 * medlem-bevakning.ts (v104) — samma mönster, samma gränser.
 *
 * ── KONTRAKTET ──────────────────────────────────────────────────────────────
 * Portföljen bor i system_events (INGEN DDL — MÖS-lärdomen) som rader
 * type="medlem_portfolj", skrivna exakt enligt medlem-bevakning.ts-mönstret
 * (getSupabaseRest, Prefer: return=minimal, AbortSignal.timeout(8000),
 * fail-safe — kastar ALDRIG). Läsningen är SENASTE-VINNER per nyckel och
 * REQUESTSCOPAD — ALDRIG modul-cache (§B.4: global memo läcker mellan
 * medlemmar).
 *
 * ── NYCKELFORMELN (deterministisk — ALDRIG klientskickad sträng, §B.3) ──────
 *   holding → holding:<ticker>      varde "1" (studeras) | "0" (borta),
 *                                   antal/kurs i details (membermatat
 *                                   studieunderlag — inga serverberäkningar)
 *   brygga  → legacy_import:gjord   varde "1" (e-postbryggan körts en gång)
 * Ticker på/av fastställs av SERVERN mot analysbiblioteket — en nyckel
 * för en okänd analys kan aldrig skrivas.
 *
 * ── GRÄNSER ─────────────────────────────────────────────────────────────────
 * PORTFOLJ_MAX aktiva bolag per konto (30) — räknas ur läsningen FÖRE
 * skrivning; klienten kan aldrig överskrida taket via upprepade POST:ar.
 * antal/kurs: ändligt tal > 0 och ≤ 1 000 000 000, annars null (värden
 * utanför intervallet kan inte skrivas via det validerade flödet — läs-
 * sidan tolkar dem som null, fail-safe).
 *
 * ── E-POSTBRYGGAN (engångskontrakt) ─────────────────────────────────────────
 * importeraLegacyPortfolj: members.email → senaste client_portfolios →
 * client_holdings (skrivs som holding-events, tak 30, endast tickers i
 * analysbiblioteket). Markören legacy_import:gjord=1 förhindrar omimport.
 * E-posten läses ENDAST för uppslaget — den lagras ALDRIG på event-raden.
 *
 * ── GDPR ────────────────────────────────────────────────────────────────────
 * Raden bär ENDAST authId + ticker + antal/kurs — ingen e-post, ingen
 * tredje part. Läsningen filtrerar details->>authId — en medlem ser
 * aldrig en annan medlems portfölj.
 *
 * ── JURIDIK ─────────────────────────────────────────────────────────────────
 * Utbildningsportföljen är listan över bolag medlemmen STUDERAR — aldrig
 * en handels- eller rekommendationslista (lagen 2007:528). Modulen
 * beräknar ALDRIG värden, avkastning eller vikter.
 *
 * ── VÅG 79-HERMETIK ─────────────────────────────────────────────────────────
 * NEXT_PHASE==="phase-production-build" ⇒ läsningen svarar tomt UTAN nät
 * och skrivningen/importen NEKAS — modulen FÅR ALDRIG fetcha under next
 * build.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { getSupabaseRest } from "./supabase-rest";
import { analysTickerUppstattning } from "@/lib/medlem-bevakning";

// ── Event-typ + gränser (exporteras för rutten) ─────────────────────────────

/** Event-typen för portföljen (system_events.type; INGEN ny tabell/DDL). */
export const MEDLEM_PORTFOLJ_EVENT_TYP = "medlem_portfolj";
const MEDLEM_PORTFOLJ_KALLA = "medlem";

/** Max AKTIVA (på) holdings per konto. */
export const PORTFOLJ_MAX = 30;

export type PortfoljSkrivning = { ok: true; nyckel: string } | { ok: false; fel: string; status: number };

/** Mätvärdesregeln: ändligt tal > 0 och ≤ 1 miljard (antal såväl som kurs). */
function arGiltigtMatvarde(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 && v <= 1_000_000_000;
}

/** PostgREST-text → tal: ogiltigt/avfall ⇒ null (läs-sidans fail-safe). */
function somTal(v: unknown): number | null {
  const n =
    typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : Number.NaN;
  return arGiltigtMatvarde(n) ? n : null;
}

/**
 * valideraPortfoljSkrivning — {ticker, pa, antal, kurs} mot biblioteket,
 * taket och mätvärdesregeln. Felkartan: 400 ogiltig kropp/okänd ticker/
 * ogiltigt antal/ogiltig kurs · 409 taket nått (endast på).
 * Värdet "1"/"0" FASTSTÄLLS HÄR — klienten skickar bara booleanen (§B.3).
 */
export function valideraPortfoljSkrivning(
  body: { ticker?: unknown; pa?: unknown; antal?: unknown; kurs?: unknown },
  uppstattning: ReadonlySet<string>,
  aktivaAntal: number,
): PortfoljSkrivning {
  const ticker = typeof body.ticker === "string" ? body.ticker.trim() : "";
  if (ticker === "" || ticker.length > 24 || ticker.includes(" ") || /[%"'\\]/.test(ticker)) {
    return { ok: false, fel: "Ogiltig ticker.", status: 400 };
  }
  if (!uppstattning.has(ticker)) {
    return { ok: false, fel: "Analysen finns inte i biblioteket.", status: 400 };
  }
  const pa = body.pa === true;
  if (pa && aktivaAntal >= PORTFOLJ_MAX) {
    return {
      ok: false,
      fel: `Portföljen är full (max ${PORTFOLJ_MAX} bolag) — ta bort ett först.`,
      status: 409,
    };
  }
  // antal/kurs är VALFRIA — men när de finns måste de vara rena mätvärden.
  // null/undefined = "ej angivet" (skrivs som null), ALDRIG strängar/NaN/0.
  const antalNarvarande = body.antal !== undefined && body.antal !== null;
  if (antalNarvarande && !arGiltigtMatvarde(body.antal)) {
    return { ok: false, fel: "Ogiltigt antal.", status: 400 };
  }
  const kursNarvarande = body.kurs !== undefined && body.kurs !== null;
  if (kursNarvarande && !arGiltigtMatvarde(body.kurs)) {
    return { ok: false, fel: "Ogiltig kurs.", status: 400 };
  }
  return { ok: true, nyckel: `holding:${ticker}` };
}

// ── PostgREST-plumbing (medlem-bevakning.ts-mönstret — REQUESTSCOPAT) ───────

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Senaste-vinner-ordningen — id.desc som tiebreaker (lager.ts våg 67). */
const SENASTE = "order=created_at.desc,id.desc";
const SIDSTORLEK = 1000;
const MAX_Sidor = 10;

/** Värderad som den lagras i raden: "1" = studeras, "0" = borta. */
const PÅ = "1";
const AV = "0";

/** Nyckelprefixet för holdings samt e-postbryggans engångsmarkör. */
const HOLDING_PREFIX = "holding:";
const LEGACY_IMPORT_NYCKEL = "legacy_import:gjord";

type PortfoljLasRad = { nyckel: string; varde: string; antal: unknown; kurs: unknown };

/**
 * lasRaderFor — läs EN medlems alla portföljsrader (nyest först, Range-
 * paginerat). Kastar ALDRIG; fel/tomt/byggfas ⇒ tom array. Filter
 * details->>authId=eq.<authId> gör läsningen requestskopad per medlem.
 */
async function lasRaderFor(authId: string): Promise<PortfoljLasRad[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  const rest = getSupabaseRest();
  if (!rest) return [];
  const rader: PortfoljLasRad[] = [];
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    try {
      const url =
        rest.origin +
        "/rest/v1/system_events?type=eq." +
        fv(MEDLEM_PORTFOLJ_EVENT_TYP) +
        "&details->>authId=eq." +
        fv(authId) +
        "&select=details->>nyckel,details->>varde,details->>antal,details->>kurs&" +
        SENASTE;
      const res = await fetch(url, {
        headers: { ...rest.headers, Range: `${fran}-${String(fran + SIDSTORLEK - 1)}` },
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (!res.ok) return []; // tyst fall-back — tom portfölj
      const sidRader = (await res.json()) as PortfoljLasRad[];
      if (!Array.isArray(sidRader)) return [];
      rader.push(...sidRader);
      if (sidRader.length < SIDSTORLEK) break;
    } catch {
      return []; // nätverksfel/timeout — tyst fall-back
    }
  }
  return rader;
}

/** En holding i utbildningsportföljen — membermatat studieunderlag. */
export type PortfoljHoldings = { ticker: string; antal: number | null; kurs: number | null };

/** Medlemmens portfölj + e-postbrygans engångsmarkör. */
export type MedlemPortfolj = { holdings: PortfoljHoldings[]; legacyImporterad: boolean };

/**
 * lasMedlemPortfolj — utbildningsportföljen (REQUESTSCOPAD: ingen
 * modul-cache, §B.4). SENASTE-VINNER per nyckel; antal/kurs läses ur
 * SENASTE raden för respektive holding. Supabase-fel/ej konfigurerat/
 * byggfas ⇒ TOM portfölj — kastar ALDRIG. Holdings alfabetiskt sorterade.
 */
export async function lasMedlemPortfolj(authId: string): Promise<MedlemPortfolj> {
  if (typeof authId !== "string" || authId === "") return { holdings: [], legacyImporterad: false };
  const senaste = new Map<string, PortfoljLasRad>();
  for (const r of await lasRaderFor(authId)) {
    if (typeof r?.nyckel !== "string") continue;
    const relevant = r.nyckel.startsWith(HOLDING_PREFIX) || r.nyckel === LEGACY_IMPORT_NYCKEL;
    if (relevant && !senaste.has(r.nyckel)) senaste.set(r.nyckel, r);
  }
  const holdings: PortfoljHoldings[] = [];
  for (const [nyckel, r] of senaste) {
    if (!nyckel.startsWith(HOLDING_PREFIX)) continue;
    if (String(r.varde ?? AV) !== PÅ) continue; // senaste värdet "0" = borttagen
    holdings.push({
      ticker: nyckel.slice(HOLDING_PREFIX.length),
      antal: somTal(r.antal),
      kurs: somTal(r.kurs),
    });
  }
  holdings.sort((a, b) => (a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0));
  const legacy = senaste.get(LEGACY_IMPORT_NYCKEL);
  return { holdings, legacyImporterad: legacy !== undefined && String(legacy.varde ?? AV) === PÅ };
}

// ── Skrivvägen (organ-event.ts-mönstret — exakt §B.4) ───────────────────────

/** Nätverksfel-namn utan hemligheter ("TimeoutError", "TypeError" …). */
function felnamn(e: unknown): string {
  return e instanceof Error ? e.name : "okänt nätverksfel";
}

/**
 * skrivMedlemPortfoljEvent — POST EN rad (type=medlem_portfolj,
 * severity=info, details={authId, ticker, nyckel, varde, antal, kurs},
 * source=medlem). antal/kurs normaliseras till tal>0 | null — ALDRIG
 * strängar/NaN i details. Byggfas ⇒ false utan nät. Returnerar ALLTID
 * {ok, fel?} — kastar aldrig.
 */
export async function skrivMedlemPortfoljEvent(
  authId: string,
  ticker: string,
  nyckel: string,
  pa: boolean,
  antal: number | null,
  kurs: number | null,
): Promise<{ ok: boolean; fel?: string }> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { ok: false, fel: "Skrivning nekas under next build (bygget är nätverks-hermetiskt)." };
  }
  const rest = getSupabaseRest();
  if (!rest) {
    return { ok: false, fel: "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)." };
  }
  const antalTal = somTal(antal);
  const kursTal = somTal(kurs);
  try {
    const res = await fetch(rest.origin + "/rest/v1/system_events", {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          type: MEDLEM_PORTFOLJ_EVENT_TYP,
          severity: "info",
          message: "[medlem] " + nyckel + " = " + (pa ? PÅ : AV),
          details: { authId, ticker, nyckel, varde: pa ? PÅ : AV, antal: antalTal, kurs: kursTal },
          source: MEDLEM_PORTFOLJ_KALLA,
        },
      ]),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, fel: "Portföljen kunde inte sparas (lagret svarade HTTP " + String(res.status) + ")." };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, fel: "Portföljen kunde inte sparas (" + felnamn(e) + ")." };
  }
}

// ── E-postbryggan — legacy-import (ENGÅNGSKONTRAKT) ─────────────────────────

type LegacyMemberRad = { id: unknown };
type LegacyPortfolioRad = { id: unknown };
type LegacyHoldingRad = { ticker?: unknown; shares?: unknown; avg_cost?: unknown };

/**
 * importeraLegacyPortfolj — bärgar medlemmens gamla verktygs-portfölj
 * (members.email → senaste client_portfolios → client_holdings) till
 * utbildningsportföljen, EN gång per konto (markör-event förhindrar
 * omimport; senaste-vinner gör omkörningar idempotenta).
 *
 *   1) redan importerad ⇒ {ok:true, importerade:0}
 *   2) members?email=eq.<urlkodat>&select=id&limit=1 — ingen träff ⇒
 *      tyst {ok:true, importerade:0} (kunden kanske aldrig använt
 *      gamla verktyget — inget fel, inget larm)
 *   3) client_portfolios?member_id=…&select=id&order=created_at.desc&limit=1
 *   4) client_holdings?portfolio_id=…&select=ticker,shares,avg_cost&limit=100
 *   5) endast tickers i analysbiblioteket (analysTickerUppstattning —
 *      ÅTERANVÄND från bevakningen, aldrig duplicerad), totalt högst
 *      PORTFOLJ_MAX holding-events (varde "1", antal/kurs enligt
 *      mätvärdesregeln annars null), dublettrader hoppas över
 *   6) markör-event "legacy_import:gjord" = "1" (ticker tom — markören
 *      bär inget värdepapper)
 *
 * ALLA fel ⇒ tyst {ok:false, importerade:0} — kastar ALDRIG. Byggfas ⇒
 * {ok:false, importerade:0} utan nät. Misslyckas ett holding-event skrivs
 * markören EJ — en framtida inloggning kan försöka igen.
 */
export async function importeraLegacyPortfolj(
  authId: string,
  epost: string,
): Promise<{ ok: boolean; importerade: number }> {
  const FEL: { ok: boolean; importerade: number } = { ok: false, importerade: 0 };
  if (process.env.NEXT_PHASE === "phase-production-build") return FEL;
  if (typeof authId !== "string" || authId === "") return FEL;
  if (typeof epost !== "string" || epost.trim() === "") return FEL;
  const rest = getSupabaseRest();
  if (!rest) return FEL;
  try {
    // 1) engångsmarkören — bryggan får aldrig körra två gånger
    const nuvarande = await lasMedlemPortfolj(authId);
    if (nuvarande.legacyImporterad) return { ok: true, importerade: 0 };

    // 2) e-post → members.id (endast för uppslaget — lagras aldrig)
    const memberRes = await fetch(
      rest.origin + "/rest/v1/members?email=eq." + fv(epost) + "&select=id&limit=1",
      { headers: rest.headers, signal: AbortSignal.timeout(6_000), cache: "no-store" },
    );
    if (!memberRes.ok) return FEL;
    const members = (await memberRes.json()) as LegacyMemberRad[];
    const memberId = Array.isArray(members) ? members[0]?.id : undefined;
    if (typeof memberId !== "string" || memberId === "") {
      return { ok: true, importerade: 0 }; // okänd e-post = inget att bärga
    }

    // 3) senaste portföljen för medlemmen
    const pfRes = await fetch(
      rest.origin +
        "/rest/v1/client_portfolios?member_id=eq." +
        fv(memberId) +
        "&select=id&order=created_at.desc&limit=1",
      { headers: rest.headers, signal: AbortSignal.timeout(6_000), cache: "no-store" },
    );
    if (!pfRes.ok) return FEL;
    const portfoljer = (await pfRes.json()) as LegacyPortfolioRad[];
    const portfolioId = Array.isArray(portfoljer) ? portfoljer[0]?.id : undefined;
    if (typeof portfolioId !== "string" || portfolioId === "") {
      return { ok: true, importerade: 0 }; // ingen legacy-portfölj = inget att bärga
    }

    // 4) holdningarna i den senaste portföljen
    const holdRes = await fetch(
      rest.origin +
        "/rest/v1/client_holdings?portfolio_id=eq." +
        fv(portfolioId) +
        "&select=ticker,shares,avg_cost&limit=100",
      { headers: rest.headers, signal: AbortSignal.timeout(6_000), cache: "no-store" },
    );
    if (!holdRes.ok) return FEL;
    const holdRader = (await holdRes.json()) as LegacyHoldingRad[];
    if (!Array.isArray(holdRader)) return FEL;

    // 5) skriv holding-events — bibliotekssnitt + tak + dublettrens
    const uppstattning = analysTickerUppstattning();
    const skrivna = new Set<string>();
    let importerade = 0;
    for (const r of holdRader) {
      if (importerade >= PORTFOLJ_MAX) break; // taket gäller TOTALT, per konto
      const ticker = typeof r?.ticker === "string" ? r.ticker.trim() : "";
      if (ticker === "" || !uppstattning.has(ticker) || skrivna.has(ticker)) continue;
      const svar = await skrivMedlemPortfoljEvent(
        authId,
        ticker,
        HOLDING_PREFIX + ticker,
        true,
        somTal(r?.shares),
        somTal(r?.avg_cost),
      );
      if (!svar.ok) return FEL; // markören skrivs ej — retry möjlig vid nästa inloggning
      skrivna.add(ticker);
      importerade++;
    }

    // 6) engångsmarkören — bryggan är klar (även vid noll bärgade holdings)
    const markor = await skrivMedlemPortfoljEvent(
      authId,
      "",
      LEGACY_IMPORT_NYCKEL,
      true,
      null,
      null,
    );
    if (!markor.ok) return FEL;
    return { ok: true, importerade };
  } catch {
    return FEL; // tyst fail-safe — kastar ALDRIG
  }
}
