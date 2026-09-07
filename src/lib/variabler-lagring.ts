/**
 * VARIABELLAGRING — priser live från Supabase, filen = dev-fallback
 * (VÅG 79, ADMIN-MEGA steg 1 — STYRELSE-ADMIN-MEGA.md "BYGGKONTRAKT STEG 1").
 *
 * ── KONTRAKTET (alternativ B, ordförandebeslut våg 78) ─────────────────────
 * Supabase är SANNING LIVE; data/portfolj-system/priser.json är SEED +
 * dev-fallback (variabler.ts PRISER förblir fil-default + byggvärde och
 * FÅR INTE brytas). Vercel-fs är read-only — panelen kan inte skriva filen
 * i prod, därför bor gällande värden i system_events (INGEN ny tabell/DDL —
 * kunden har inte kört SQL) och läses SENASTE-VINNER per nyckel, exakt
 * m10/oversattning-mönstret (src/lib/referral.ts + oversattning/lager.ts).
 *
 * Event-radernas kontrakt:
 *   Värde-rad:   type="variabel"        severity="info"
 *                message="[variabel] <nyckel> = <värde>"
 *                details={nyckel, varde, gammalt, av, kalla}
 *   Ändringslogg: type="variabel-andring" severity="info"
 *                message="[variabel-andring] <nyckel>: <gammalt> → <nytt>"
 *                details={nyckel, gammalt, nytt, av, kalla}  (revisbarhet —
 *                raderas ALDRIG av skrivvägen; värde-raderens föregångare
 *                raderas däremot best-effort så lagret sväller inte)
 *
 * Rollback = radera en nyckels värde-rad(er) → fil-defaults gäller igen.
 *
 * ── LÄS-REGLER ──────────────────────────────────────────────────────────────
 * order=created_at.desc,id.desc (id.desc = total ordning bland ties — samma
 * transaktions-batch delar created_at, se lager.ts våg 67), RÅA filtervärden
 * %-kodade (citerade värden är verifierat icke-träffande för details->>-
 * filter, lager.ts våg 55), Range-paginering 1 000 rader/sida, tak 10 sidor.
 * Modul-cache 5 min (mönstret från /api/forskningslage memo).
 *
 * GRACEFUL NEDBRYTNING: Supabase ej konfigurerat, svarar fel eller tomt ⇒
 * TOM override-karta ⇒ filvärdena gäller (prod får ALDRIG bli utan priser —
 * tyst fall-back, inga kast ur läsvägarna).
 *
 * Supabase-nycklar läses ENBART via supabase-rest.ts (https *.supabase.co,
 * service-role först) och hamnar ALDRIG i kod, loggar eller felmeddelanden.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { getSupabaseRest } from "./supabase-rest";
import { PRISER } from "./variabler";

// ── Event-typer (exporteras för admin-ruttens loggläsning) ──────────────────

export const VARIABEL_EVENT_TYP = "variabel";
export const VARIABEL_ANDRING_EVENT_TYP = "variabel-andring";
const VARIABEL_KALLA = "variabler";

// ── Kontraktets nycklar → PRISER-fält (VITLISTAN — våg 79) ──────────────────

/**
 * Kanonisk nyckel → fält i PRISER (fil-defaults ur src/lib/variabler.ts).
 * Panelen kan ENDAST ändra värden på dessa nycklar — aldrig skapa nya
 * nivåer, aldrig nollställa gratis-konceptet (gratis-Fas-1 ligger UTANFÖR
 * priser.json och förblir hårdkodad helighet — P3).
 */
export const NYCKEL_TILL_PRIS_FALT: Readonly<Record<string, keyof typeof PRISER>> = {
  "pris.forskning.manad": "forskningManad",
  "pris.forskning.ar": "forskningAr",
  "pris.forskning-plus.manad": "plusManad",
  "pris.forskning-plus.ar": "plusAr",
  "pris.portfolj-hyra.manad": "hyraManad",
  "pris.portfolj-hyra.ar": "hyraAr",
  "pris.pro-analytiker.manad": "b2bAnalytiker",
  "pris.pro-studio.manad": "b2bStudio",
  "pris.pro-institution.manad": "b2bInstitution",
  "pris.b2b-onboarding.engang": "b2bOnboarding",
  "pris.fas2.engang": "fas2EnGang",
  "pris.fas3.engang": "fas3EnGang",
  "pris.fas3-intro.manad": "fas3IntroManad",
};

/** Vitlistan i kontraktets ordning (härdkodad — POST-ruttens validering). */
export const VARIABEL_NYCKLAR: readonly string[] = Object.keys(NYCKEL_TILL_PRIS_FALT);

/** Sant exakt för kontraktets nycklar (vitliste-vakten). */
export function arVariabelNyckel(nyckel: unknown): nyckel is string {
  return typeof nyckel === "string" && (VARIABEL_NYCKLAR as readonly string[]).includes(nyckel);
}

/** Det lasPriserGallande returnerar — samma form som PRISER (fil-defaults),
 *  men priset kan ha setts live i Supabase. (-readonly: PRISER är as const;
 *  kopian här SKA vara skrivbar så överriden kan slås in per fält.) */
export type PriserGallande = { -readonly [K in keyof typeof PRISER]: number };

/** En gällande override-post (senaste-vinner-radens utsnitt). */
export type VariabelPost = {
  varde: number;
  /** Radens created_at (ISO) — när värdet senast skrevs. */
  andrad: string;
  /** Skrivvägens källa ("panel" — detaljfältet kalla). */
  kalla: string;
};

// ── PostgREST-plumbing ───────────────────────────────────────────────────────

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Senaste-vinner-ordningen — id.desc som tiebreaker (lager.ts våg 67). */
const SENASTE = "order=created_at.desc,id.desc";

/** Max rader per sid-begäran — PostgREST default-sida är 1 000 rader. */
const SIDSTORLEK = 1000;
/** Tak: 10 sidor = 10 000 värde-rader (kontraktet våg 79; 13 nycklar ⇒ taket
 *  är ~770 skrivningar per nyckel — gott om marginal, och föregångare
 *  raderas best-effort vid varje skrivning så tillväxten är i praktiken 1
 *  värde-rad per nyckel). */
const MAX_Sidor = 10;

/** En värde-rad såsom PostgREST returnerar den (arrow-select ur details). */
type VariabelLasRad = {
  created_at?: string | null;
  nyckel?: string | null;
  varde?: string | number | null; // jsonb->> ger text — tolka båda former
  kalla?: string | null;
};

/** Tolka varde-fältet: heltal ≥ 0 accepteras, annat ⇒ null (tolerant läsning
 *  — en misstänkt rad hoppas över och fil-defaults gäller för nyckeln). */
function tolkaVarde(v: VariabelLasRad["varde"]): number | null {
  if (typeof v === "number") return Number.isInteger(v) && v >= 0 ? v : null;
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v.trim());
  return Number.isInteger(n) && n >= 0 ? n : null;
}

/** Läs ALLA värde-rader (nyast först, paginerat) — kastar ALDRIG; fel/tomt
 *  ⇒ tom array (fil-defaults gäller). */
async function lasRader(): Promise<VariabelLasRad[]> {
  // VÅG 79 (konsument-fynd, KONSUMTER→KÄRNA): under `next build`
  // (phase-production-build) ska nätverksläsningen ALDRIG köras — en kall
  // no-store-fetch under statisk prerender bollar sidan till dynamisk
  // (ƒ i stället för ISR; empiriskt verifierat våg 79). Byggets initiala
  // prerender använder fil-defaults; ISR-revalidation (runtime) läser
  // live. Bonus: bygget blir nätverks-hermetiskt.
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  const rest = getSupabaseRest();
  if (!rest) return [];
  const rader: VariabelLasRad[] = [];
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    try {
      const res = await fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.${fv(VARIABEL_EVENT_TYP)}` +
          `&select=created_at,details->>nyckel,details->>varde,details->>kalla&${SENASTE}`,
        {
          headers: { ...rest.headers, Range: `${fran}-${String(fran + SIDSTORLEK - 1)}` },
          signal: AbortSignal.timeout(10_000),
          cache: "no-store",
        },
      );
      if (!res.ok) return []; // tyst fall-back — filvärdena gäller
      const sidRader = (await res.json()) as VariabelLasRad[];
      if (!Array.isArray(sidRader)) return [];
      rader.push(...sidRader);
      if (sidRader.length < SIDSTORLEK) break; // sista sidan — allt är läst
    } catch {
      return []; // nätverksfel/timeout — tyst fall-back
    }
  }
  return rader;
}

// ── Modul-cache 5 min (mönstret: /api/forskningslage memo) ──────────────────

const CACHE_MS = 5 * 60 * 1000;

let memo: { vid: number; poster: Map<string, VariabelPost> } | null = null;

/** Rensa modul-cachen (efter lyckad skrivning — nästa läsning ser nya värdet
 *  direkt istället för att vänta ut cachen). */
export function glomVariabelCache(): void {
  memo = null;
}

/**
 * Rader (nyast först) → karta nyckel → senaste-vinner-post. Ren funktion —
 * FÖREKOMST först vinner eftersom indata är sorterad nyast-först.
 */
export function senasteVinner(rader: readonly VariabelLasRad[]): Map<string, VariabelPost> {
  const karta = new Map<string, VariabelPost>();
  for (const r of rader) {
    if (typeof r.nyckel !== "string" || !r.nyckel) continue;
    if (karta.has(r.nyckel)) continue; // senaste raden har redan vunnit
    const varde = tolkaVarde(r.varde);
    if (varde === null) continue; // ogiltig rad kan inte vinna
    karta.set(r.nyckel, {
      varde,
      andrad: typeof r.created_at === "string" ? r.created_at : "",
      kalla: typeof r.kalla === "string" && r.kalla ? r.kalla : "okand",
    });
  }
  return karta;
}

/**
 * lasGallandePoster — karta nyckel → senaste-vinner-post (varde + andrad +
 * kalla). Modul-cache 5 min. Supabase-fel/tom databas ⇒ tom karta (fil-
 * defaults gäller — tyst, prod får aldrig bli utan priser).
 */
export async function lasGallandePoster(): Promise<Map<string, VariabelPost>> {
  if (memo !== null && Date.now() - memo.vid < CACHE_MS) return memo.poster;
  const poster = senasteVinner(await lasRader());
  memo = { vid: Date.now(), poster };
  return poster;
}

/**
 * lasGallande — karta nyckel → gällande VÄRDE (senaste-vinner per nyckel).
 * Läsvägen enligt kontraktet; delar modul-cachen med lasGallandePoster.
 */
export async function lasGallande(): Promise<Map<string, number>> {
  const poster = await lasGallandePoster();
  const karta = new Map<string, number>();
  for (const [nyckel, post] of poster) karta.set(nyckel, post.varde);
  return karta;
}

/**
 * lasPriserGallande — fil-defaults (PRISER) + Supabase-override senaste-
 * vinner, per kontraktets nyckel-mappning. Returnerar ALLTID ett komplett
 * pris-objekt: okända override-nycklar (utanför mappningen) ignoreras, och
 * Supabase-fel ger de rena filvärdena — ALDRIG tom/odeliverbar prisdata.
 */
export async function lasPriserGallande(): Promise<PriserGallande> {
  const overrides = await lasGallande();
  const priser = { ...PRISER } as PriserGallande;
  for (const [nyckel, falt] of Object.entries(NYCKEL_TILL_PRIS_FALT)) {
    const varde = overrides.get(nyckel);
    if (varde !== undefined) priser[falt] = varde;
  }
  return priser;
}

// ── Ändringsloggen (revisbarhet — admin-GET:ens logg-lista) ──────────────────

/** En variabel-andring-loggrad som panelen får se. */
export type VariabelAndring = {
  andrad: string;
  nyckel: string | null;
  gammalt: number | null;
  nytt: number | null;
  av: string | null;
  kalla: string | null;
};

/**
 * Läs de senaste ändringsloggs-raderna (type=variabel-andring, nyast först).
 * Kastar ALDRIG — Supabase-fel/tomt ⇒ tom lista (panelen visar då inga
 * rader, aldrig ett kraschande UI). Tak: anroparens antal (admin-GET: 20).
 */
export async function lasAndringsLogg(antal = 20): Promise<VariabelAndring[]> {
  const rest = getSupabaseRest();
  if (!rest || !Number.isInteger(antal) || antal <= 0) return [];
  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${fv(VARIABEL_ANDRING_EVENT_TYP)}` +
        `&select=created_at,details&${SENASTE}&limit=${String(Math.min(antal, 100))}`,
      { headers: rest.headers, signal: AbortSignal.timeout(10_000), cache: "no-store" },
    );
    if (!res.ok) return [];
    const rader = (await res.json()) as Array<{ created_at?: string | null; details?: Record<string, unknown> }>;
    if (!Array.isArray(rader)) return [];
    const tolkaTal = (v: unknown): number | null =>
      typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
    return rader.map((r) => ({
      andrad: typeof r.created_at === "string" ? r.created_at : "",
      nyckel: typeof r.details?.nyckel === "string" ? r.details.nyckel : null,
      gammalt: tolkaTal(r.details?.gammalt),
      nytt: tolkaTal(r.details?.nytt),
      av: typeof r.details?.av === "string" ? r.details.av : null,
      kalla: typeof r.details?.kalla === "string" ? r.details.kalla : null,
    }));
  } catch {
    return [];
  }
}

// ── Skrivväg (service-role — samma POST-mönster som lager.ts lasSparaEvents) ─

/** Tydligt fel när värdet inte kunde persistas (ärligt — aldrig tyst ok). */
export class VariabelSparningsFel extends Error {
  constructor(orsak: string) {
    super("Variabeln kunde inte sparas (" + orsak + ").");
    this.name = "VariabelSparningsFel";
  }
}

/**
 * Skriv en nyckels nya värde: (a) läs förra gällande värde (gammalt), (b)
 * best-effort DELETE av nyckelns tidigare VÄRDE-rader (mönstret från
 * lager.ts lasSparaEvents/referral.ts — lagret sväller inte; nekas DELETE
 * vinner ändå senaste raden vid läsning), (c) POST av värde-raden + en
 * ändringsloggs-rad (type=variabel-andring — revisbarhet, raderas aldrig)
 * i EN begäran, (d) rensa modul-cachen. Returnerar {gammalt, nytt}.
 *
 * Värdet MÅSTE vara validerat av anroparen (vitlistenyckel + heltal ≥ 0) —
 * rutten är vakten; här är kontraktet det inre.
 */
export async function sparaVariabel(nyckel: string, varde: number): Promise<{ gammalt: number; nytt: number }> {
  const rest = getSupabaseRest();
  if (!rest) {
    throw new VariabelSparningsFel("Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)");
  }

  // Förra gällande = override om finnes, annars fil-default (kontraktet).
  const poster = await lasGallandePoster();
  const falt = NYCKEL_TILL_PRIS_FALT[nyckel];
  const gammalt = poster.has(nyckel) ? poster.get(nyckel)!.varde : falt !== undefined ? PRISER[falt] : 0;

  // (b) best-effort radering av föregående VÄRDE-rader (ENDAST type=variabel
  //     med exakt denna nyckel — ändringsloggen rör aldrig).
  try {
    await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${fv(VARIABEL_EVENT_TYP)}` +
        `&details->>nyckel=eq.${fv(nyckel)}&select=id`,
      { method: "DELETE", headers: rest.headers, signal: AbortSignal.timeout(8_000) },
    );
  } catch {
    /* best effort — senaste-vinner-läsningen täcker kvarvarande rader */
  }

  // (c) värde-rad + ändringsloggs-rad i EN begäran.
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          type: VARIABEL_EVENT_TYP,
          severity: "info",
          message: `[variabel] ${nyckel} = ${String(varde)}`,
          details: { nyckel, varde, gammalt, av: "admin", kalla: "panel" },
          source: VARIABEL_KALLA,
        },
        {
          type: VARIABEL_ANDRING_EVENT_TYP,
          severity: "info",
          message: `[variabel-andring] ${nyckel}: ${String(gammalt)} → ${String(varde)}`,
          details: { nyckel, gammalt, nytt: varde, av: "admin", kalla: "panel" },
          source: VARIABEL_KALLA,
        },
      ]),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      throw new VariabelSparningsFel("lagret svarade HTTP " + String(res.status));
    }
  } catch (e) {
    if (e instanceof VariabelSparningsFel) throw e;
    throw new VariabelSparningsFel(e instanceof Error ? e.name : "okänt fel");
  }

  // (d) cachen måste spegla det nya läget omedelbart.
  glomVariabelCache();
  return { gammalt, nytt: varde };
}
