/**
 * DEMOKLIENT-DATA — /pro/klienter:s server-side underlag (VÅG 61 bygg-4).
 *
 * B2B-BESLUT §4(c) + §7 steg 4: klientvyn visas på DEMOKLIENTEN i MVP:n —
 * "demoklienten = medföljande forskningsportfölj (icke-person)". Ingen
 * personuppgift existerar i detta lager (P3/FORBUD 1): portföljen är 6
 * innehav ur forskningsbibliotekets topp (korstabell-grund.json, sortering
 * AKM2 fallande med ticker som deterministisk tie-breaker), likaviktad —
 * METODOLOGISKT valt, aldrig "en klients faktiska depå".
 *
 * Arv (P5 — ärv hellre än bygg):
 *   - lasKorstabellGrund (korstabell-data.ts) — normaliserade, peer-berikade
 *     rader (VÅG 59-läslaget följer med).
 *   - data/cache/akm2-{TICKER}.json → `.resultat` — FULLA AKM2Resultat som
 *     driver Akm2Radar + ProfilJamforelse (prop-drivna ur akm2-dashboard.tsx
 *     — importeras, ändras ALDRIG). Samma cache som akm2-onsdemand läser;
 *     här utan getAnalys-kravet eftersom demoklientens tickers inte kräver
 *     en publicerad analys i data/analyses.
 *   - skapaSnapshot + jamforDåNu (uppfoljning.ts) — "då vs nu"-raden. Är
 *     ingen tidigare snapshotserie_FUNDERAD_ för portfölj-id:t blir utfallet
 *     ärligt "första mätningen" (jamforDåNu är anropbar — den döljer aldrig
 *     att då-sidan saknas; motorn gissar aldrig).
 *
 * DETERMINISM (P1/FORBUD 11): inga klockor, inget slump — nästa uppföljning
 * härleds ur senastKontrollerad + 30 dagar (INTERVALL_DAGAR.manad) med ren
 * datumaritmetik. Samma underlagsfiler ⇒ JSON-identisk demoklient.
 *
 * Server-side (fs) — anropas endast från serverkomponenter/build, aldrig
 * klienten. Pedagogisk forskning — ALDRIG investeringsrådgivning (2007:528).
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { AKM2Resultat } from "@/lib/akm2/typer";
import { lasKorstabellGrund } from "@/lib/portfolj-forskning/korstabell-data";
import {
  INTERVALL_DAGAR,
  jamforDåNu,
  skapaSnapshot,
  type Jamforelse,
} from "@/lib/portfolj-forskning/uppfoljning";
import type { PeerInfo } from "@/lib/portfolj-forskning/peer";
import type {
  Bransch,
  Dynamik,
  Horisont,
  KorstabbellRad,
  UppfoljningSnapshot,
  VagKlass,
} from "@/lib/portfolj-forskning/typer";

// ── Konstanter ───────────────────────────────────────────────────────────────

/** Demoklientens alias — icke-person, tydligt märkt i varje vy. */
export const DEMOKLIENT_ALIAS = 'Demoklient "Tillväxtportfölj"';

/** Portfölj-id — matchar uppföljningsfilerna data/portfolj-system/uppfoljning/. */
export const DEMOKLIENT_PORTFOLJ_ID = "demo-tillvaxt";

/** Antal innehav ur forskningsbibliotekets topp (BESLUT §3(2): "6 innehav"). */
export const DEMOKLIENT_ANTAL_INNEHAV = 6;

const HORIZONTER: Horisont[] = ["mikro", "kort", "medellang", "lang", "mega"];

/** Klassordning för deterministisk tie-breaker i den aggregerade profilen. */
const VAGKLASS_ORDNING: VagKlass[] = ["impulsvag", "korrigering", "basbygge", "osatt"];

// ── Typer (serialiserbara — förs vidare som props till klientvyer) ───────────

export type DemoklientInnehav = {
  ticker: string;
  namn: string;
  bransch: Bransch;
  /** 0–1; likaviktad i MVP — summerar till 1. */
  vikt: number;
  akm1Totalt: number;
  akm1MaxMojligt: number | null;
  datatackning: number | null;
  akm2: number | null;
  akm2Skillnad: number | null;
  status: KorstabbellRad["status"];
  fvagPerHorisont: Record<Horisont, VagKlass>;
  tvagPerHorisont: Record<Horisont, VagKlass>;
  fvagDynamik: Dynamik;
  golvMarginal: number | null;
  senastKontrollerad: string;
  /** Peer-läslaget (VÅG 59) — null när raden inte berikats. */
  peer: PeerInfo | null;
};

export type DemoklientVagsammansattning = {
  horisont: Horisont;
  /** Vikttungaste klassen (tie-breaker: klassordningen ovan). */
  klass: VagKlass;
  /** Andel av vikten som är osatt på horisonten, 0–1. */
  osattAndel: number;
};

export type Demoklient = {
  alias: string;
  portfoljId: string;
  beskrivning: string;
  innehav: DemoklientInnehav[];
  vagsammansattning: DemoklientVagsammansattning[];
  /** Fulla AKM2Resultat per ticker (ur data/cache/akm2-*.json) — radar/jämförelse. */
  akm2Resultat: Record<string, AKM2Resultat>;
  /** "Då vs nu" via jamforDåNu — första mätningen när ingen då-serie finns. */
  jamforelser: Jamforelse[];
  /** true när en tidigare snapshotserie hittades för portfölj-id:t. */
  daFinns: boolean;
  /** Deterministiskt härledd: senaste senastKontrollerad + månadsviket. */
  nastaUppfoljning: string;
  /** Korstabellens skapad-datum — underlagets egen datering. */
  underlagsdatum: string | null;
  /** Ärlig källhänvisning till vyn. */
  kalla: string;
};

// ── Formguard (spegling av akm2-onsdemand.ts mönster — där krävs getAnalys) ──

/** Ser ut som ett AKM2Resultat (lager 1/2/4 + komposit)? */
function arAkm2Resultat(x: unknown): x is AKM2Resultat {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.ticker === "string" &&
    typeof r.komposit === "number" &&
    Number.isFinite(r.komposit) &&
    !!r.lager1 &&
    typeof r.lager1 === "object" &&
    !!(r.lager1 as Record<string, unknown>)?.poang &&
    !!r.lager2 &&
    typeof r.lager2 === "object" &&
    !!r.lager4 &&
    typeof r.lager4 === "object" &&
    !!(r.lager4 as Record<string, unknown>)?.viktPerVariabel
  );
}

/** Samma ticker-filsanering som akm2-onsdemand (".":ar → "_"). */
function tickerFil(ticker: string): string | null {
  if (!ticker || ticker.includes("..")) return null;
  const rensat = ticker.replace(/[^A-Za-z0-9._-]/g, "_").replace(/\./g, "_");
  return rensat && !rensat.startsWith(".") ? rensat : null;
}

/**
 * Läs ett fullständigt AKM2Resultat ur D2:s berikningscache — null när filen
 * saknas eller är ogiltig (radarn renderas då ej för tickern; aldrig gissat).
 */
function lasAkm2Resultat(ticker: string): AKM2Resultat | null {
  const fil = tickerFil(ticker);
  if (!fil) return null;
  const vag = join(process.cwd(), "data", "cache", `akm2-${fil}.json`);
  if (!existsSync(vag)) return null;
  try {
    const c = JSON.parse(readFileSync(vag, "utf8")) as { resultat?: unknown };
    return arAkm2Resultat(c?.resultat) ? c.resultat : null;
  } catch {
    return null; // ogiltig cache — ärlighetsprincipen gäller läsning också
  }
}

// ── Underlag: "då"-snapshots ur uppföljningskatalogen ─────────────────────────

/** Uppföljningssnapshots ur en portföljfil — tom array när filen saknas. */
function lasDaSnapshots(portfoljId: string): UppfoljningSnapshot[] {
  const fil = join(process.cwd(), "data", "portfolj-system", "uppfoljning", `${portfoljId}.json`);
  if (!existsSync(fil)) return [];
  try {
    const rå = JSON.parse(readFileSync(fil, "utf8")) as { snapshots?: unknown };
    return Array.isArray(rå?.snapshots) ? (rå.snapshots as UppfoljningSnapshot[]) : [];
  } catch {
    return [];
  }
}

// ── Datumaritmetik (ren — väggklockan används ALDRIG här) ────────────────────

/** YYYY-MM-DD + n dagar → YYYY-MM-DD (UTC-aritmetik på det givna datumet). */
function plusDagar(iso: string, dagar: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t + dagar * 86_400_000).toISOString().slice(0, 10);
}

/** Senaste senastKontrollerad i urvalet — underlagets eget "nu". */
function senasteDatum(iso: string[]): string | null {
  const giltiga = iso.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  return giltiga.length > 0 ? giltiga[giltiga.length - 1] : null;
}

// ── Aggregerad vågprofil ─────────────────────────────────────────────────────

/** Vikttungaste vågklass per horisont + osatt-andel (deterministisk tie-break). */
function raknaVagsammansattning(
  innehav: DemoklientInnehav[],
): DemoklientVagsammansattning[] {
  return HORIZONTER.map((hz) => {
    const viktPerKlass = new Map<VagKlass, number>();
    let osattVikt = 0;
    for (const i of innehav) {
      const klass = i.fvagPerHorisont?.[hz] ?? "osatt";
      viktPerKlass.set(klass, (viktPerKlass.get(klass) ?? 0) + i.vikt);
      if (klass === "osatt") osattVikt += i.vikt;
    }
    // Vikt fallande, sedan klassordningen — samma underlag ⇒ samma utfall.
    const vinnare = [...viktPerKlass.entries()].sort(
      (a, b) =>
        b[1] - a[1] ||
        VAGKLASS_ORDNING.indexOf(a[0]) - VAGKLASS_ORDNING.indexOf(b[0]),
    )[0];
    return {
      horisont: hz,
      klass: vinnare ? vinnare[0] : "osatt",
      osattAndel: Math.round(osattVikt * 1000) / 1000,
    };
  });
}

// ── Huvudingången ────────────────────────────────────────────────────────────

/**
 * Bygg demoklientens underlag — ren funktion av repo-filerna (P1: samma filer
 * ⇒ JSON-identisk demoklient). Saknas korstabellen returneras null och sidan
 * visar ett ärligt tom-läge (inget påhittas).
 */
export function lasDemoklient(): Demoklient | null {
  const underlag = lasKorstabellGrund();
  if (!underlag.finns || underlag.rader.length === 0) return null;

  // Topp ur forskningsbiblioteket: AKM2 fallande, ticker stigande som
  // deterministisk tie-breaker (midrank-tanken: namn bryter ALDRIG).
  const topp = [...underlag.rader]
    .filter((r) => typeof r.akm2 === "number" && Number.isFinite(r.akm2))
    .sort(
      (a, b) =>
        (b.akm2 as number) - (a.akm2 as number) ||
        (a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0),
    )
    .slice(0, DEMOKLIENT_ANTAL_INNEHAV);

  if (topp.length === 0) return null;

  // Likavikt (metodologiskt val — demoklienten "äger" inga positioner).
  const vikt = 1 / topp.length;

  const innehav: DemoklientInnehav[] = topp.map((rad: KorstabbellRad) => ({
    ticker: rad.ticker,
    namn: rad.namn,
    bransch: rad.bransch,
    vikt: Math.round(vikt * 10000) / 10000,
    akm1Totalt: rad.akm1Totalt,
    akm1MaxMojligt: rad.akm1MaxMojligt ?? null,
    datatackning: rad.datatackning ?? null,
    akm2: rad.akm2 ?? null,
    akm2Skillnad: rad.akm2Skillnad ?? null,
    status: rad.status,
    fvagPerHorisont: rad.fvagPerHorisont,
    tvagPerHorisont: rad.tvagPerHorisont,
    fvagDynamik: rad.fvagDynamik,
    golvMarginal: rad.golvMarginal,
    senastKontrollerad: rad.senastKontrollerad,
    peer: rad.peer ?? null,
  }));

  // Fulla AKM2Resultat för radarn/jämförelsen — saknas en cache lämnas
  // tickern ute (vyn visar ärligt "radar saknar underlag", aldrig gissat).
  const akm2Resultat: Record<string, AKM2Resultat> = {};
  for (const i of innehav) {
    const r = lasAkm2Resultat(i.ticker);
    if (r) akm2Resultat[i.ticker] = r;
  }

  // "Då vs nu": nu-snapshots byggs ur korstabellraderna (pris=null —
  // korstabellen bär inget pris; motorn gissar aldrig), då-serien läses ur
  // uppföljningskatalogen om cronen hunnit mäta portfölj-id:t.
  const da = lasDaSnapshots(DEMOKLIENT_PORTFOLJ_ID);
  const nu = innehav.map((i) => skapaSnapshot(topp.find((r) => r.ticker === i.ticker) as KorstabbellRad, null));
  const jamforelser = jamforDåNu(nu, da);

  const senast = senasteDatum(innehav.map((i) => i.senastKontrollerad));

  return {
    alias: DEMOKLIENT_ALIAS,
    portfoljId: DEMOKLIENT_PORTFOLJ_ID,
    beskrivning:
      "Medföljande forskningsportfölj — sex innehav ur forskningsbibliotekets topp enligt korstabellens AKM2-komposit, likaviktade. Icke-person: inga klientuppgifter, ingen depå, ingen personuppgift (B2B-BESLUT §3.2 — rådgivarens egen CSV körs i sessionen utan persistens).",
    innehav,
    vagsammansattning: raknaVagsammansattning(innehav),
    akm2Resultat,
    jamforelser,
    daFinns: da.length > 0,
    nastaUppfoljning: senast
      ? plusDagar(senast, INTERVALL_DAGAR.manad)
      : "",
    underlagsdatum: underlag.skapad,
    kalla:
      "Korstabell-grund (P6) med peer-berikning (VÅG 59) · AKM2-cachen (våg 57 D2) · jamforDåNu (uppfoljning.ts)",
  };
}
