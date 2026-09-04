/**
 * AK1A PORTFÖLJUPPFÖLJNING — "då vs nu"-motorn (P5).
 *
 * KUNDdirektiv: "Vi ska följa portföljen, analysera exakt samma aktier på
 * mikro/kort/medellång/lång/Mega varje månad eller kvartal, berätta för
 * kunden hur allt ser ut, skicka notis och ta hen till en sida där klienten
 * kan se sin portfölj och hur analysen var då och hur den är just nu."
 *
 * ÄRLIGHETSPRINCIPER (spegling av riskportfolj.ts):
 *  - DETERMINISTISK: samma indata → samma utdata. Inga slumptal; snapshotens
 *    datum härleds ur radens senastKontrollerad ( väggklockan används ENDAST
 *    när underlaget saknar datum, och beslutaIntervall tar nuDatum som
 *    explicit parameter för testbarhet ).
 *  - ALDRIG investeringsrådgivning ( lagen 2007:528 ): jämförelsetexterna
 *    BESKRIVER läget — de dömer aldrig och uppmanar aldrig till köp/sälj.
 *  - Motorn gissar aldrig: ogiltiga vågklasser blir "osatt", saknade värden
 *    blir null — aldrig påhittade siffror.
 *  - Ton i notistexterna: omtanke-motorns värme ( se src/lib/omtanke-motor.ts
 *    designprincip 1 och 3 ) — en mentor som lyssnar, aldrig påträngande.
 */

import type {
  Horisont,
  KorstabbellRad,
  UppfoljningSnapshot,
  VagKlass,
} from "./typer";
import type { AKM3Ensemble } from "../akm3/typer";
import type { Akm3Prediktionsrad } from "../akm3/typer";

// ── Konstanter (exporterade för test och dokumentation) ──────────────────────

const HORIZONTER: Horisont[] = ["mikro", "kort", "medellang", "lang", "mega"];

const HZ_NAMN: Record<Horisont, string> = {
  mikro: "mikro",
  kort: "kort",
  medellang: "medellång",
  lang: "lång",
  mega: "mega",
};

/** Klassordning enligt typer.ts (spegling av riskportfolj.ts). */
const VAGKLASSER: VagKlass[] = ["impulsvag", "korrigering", "basbygge", "osatt"];

const VAG_TEXT: Record<VagKlass, string> = {
  impulsvag: "impulsvåg",
  korrigering: "korrigering",
  basbygge: "basbygge",
  osatt: "osatt",
};

/** Uppföljningsintervall — JSON-nycklar utan å/ä/ö enligt konvention. */
export type Intervall = "manad" | "kvartal";

/** AKM1-delta ( absolutbelopp ) som ger betydelsen "stor". */
export const AKM1_STOR_DELTA = 10;

/** Prisförändring ( absolutbelopp, decimal ) som ger betydelsen "man". */
export const PRIS_MAN_TROSKEL = 0.2;

/** Dagar mellan mätningar innan ett nytt intervall är slut: månad 30, kvartal 90. */
export const INTERVALL_DAGAR: Record<Intervall, number> = { manad: 30, kvartal: 90 };

/** Max notistexter per portfölj ( de 2 största förändringarna + sammanfattning ). */
export const MAX_NOTISTEXTER = 3;

// ── Hjälpmedel ────────────────────────────────────────────────────────────────

/** Säker vågklass — ogiltigt värde blir "osatt", aldrig gissat. */
function sakradVagKlass(k: string | undefined): VagKlass {
  return VAGKLASSER.includes(k as VagKlass) ? (k as VagKlass) : "osatt";
}

/** Deterministisk strängjämförelse (kodpunkter — aldrig locale-beroende). */
function jamforStrang(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Dagens datum som YYYY-MM-DD i UTC (samma konvention som notiser.ts). */
function dagensDatum(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Giltigt ISO-datum (YYYY-MM-DD)? */
function arIsoDatum(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

/** Hela dagar mellan två YYYY-MM-DD (b − a); NaN-säker. */
function dagarMellan(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

/** Fullständig 5-horisonts-vågstatus — saknade horisonter redovisas "osatt". */
function sakradVagstatus(per: Record<Horisont, VagKlass> | undefined): Record<Horisont, VagKlass> {
  const ut = {} as Record<Horisont, VagKlass>;
  for (const hz of HORIZONTER) ut[hz] = sakradVagKlass(per?.[hz]);
  return ut;
}

/** Svensk procenttext med tecken: 0.12 → "+12 %", -0.05 → "-5 %"; osatt vid null. */
function procentText(x: number | null | undefined): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "osatt";
  const t = Math.round(Math.abs(x) * 100);
  return `${x < 0 ? "-" : "+"}${t} %`;
}

// ── 1. skapaSnapshot ──────────────────────────────────────────────────────────

/**
 * Bygger en ny uppföljningssnapshot ur en korstabellrad.
 *
 *  - datum härleds DETERMINISTISKT ur rad.senastKontrollerad; endast när
 *    underlaget saknar giltigt datum används dagens datum (sista utväg).
 *  - forandringPris / forandringAkm1 räknas mot föregående snapshot —
 *    null när ingen finns, när pris saknas, eller när föregående pris är 0
 *    (division noll är inget mätvärde).
 *  - vågstatus saniteras per horisont: ogiltiga/ogiltiga nycklar → "osatt".
 */
export function skapaSnapshot(
  rad: KorstabbellRad,
  pris: number | null,
  tidigare?: UppfoljningSnapshot
): UppfoljningSnapshot {
  const akm1 = Number.isFinite(rad?.akm1Totalt) ? (rad.akm1Totalt as number) : 0;
  const p = pris !== null && pris !== undefined && Number.isFinite(pris) ? pris : null;
  const tidPris =
    tidigare && tidigare.pris !== null && tidigare.pris !== undefined && Number.isFinite(tidigare.pris)
      ? tidigare.pris
      : null;
  const tidAkm1 = tidigare && Number.isFinite(tidigare.akm1Totalt) ? tidigare.akm1Totalt : null;

  return {
    ticker: rad.ticker,
    datum: arIsoDatum(rad?.senastKontrollerad) ? rad.senastKontrollerad : dagensDatum(),
    akm1Totalt: akm1,
    fvagPerHorisont: sakradVagstatus(rad?.fvagPerHorisont),
    tvagPerHorisont: sakradVagstatus(rad?.tvagPerHorisont),
    pris: p,
    forandringPris: p !== null && tidPris !== null && tidPris !== 0 ? (p - tidPris) / tidPris : null,
    forandringAkm1: tidAkm1 !== null ? akm1 - tidAkm1 : null,
  };
}

// ── 2. jamforDåNu ─────────────────────────────────────────────────────────────

/** Ett vågklassbyte på en horisont (fundamental eller teknisk). */
export type VagklassByte = {
  horisont: Horisont;
  typ: "fundamental" | "teknisk";
  fran: VagKlass;
  till: VagKlass;
};

/** Betydelsegrad: stor = väsentlig, man = märkbar, liten = i princip oförändrad. */
export type Betydelse = "stor" | "man" | "liten";

/** En "då vs nu"-jämförelse per ticker — beskriver, dömer aldrig. */
export type Jamforelse = {
  ticker: string;
  akm1Da: number | null;
  akm1Nu: number | null;
  /** nu − da i AKM1-poäng; null när någon sida ej är mätt. */
  akm1Delta: number | null;
  prisDa: number | null;
  prisNu: number | null;
  /** (nu − da) / da som decimal; null när något pris saknas. */
  prisForandring: number | null;
  /** Alla vågklassbyten per horisont (fundamental + teknisk), fast ordning. */
  vagbytes: VagklassByte[];
  betydelse: Betydelse;
  /** Svensk pedagogisk text — beskriver läget, uppmanar aldrig. */
  text: string;
};

/** Ranking av betydelse för sortering (stor först). */
const BETYDELSE_RANK: Record<Betydelse, number> = { stor: 0, man: 1, liten: 2 };

/** Typnamn i löptext. */
const TYP_NAMN: Record<VagklassByte["typ"], string> = {
  fundamental: "Fundamental våg",
  teknisk: "Teknisk våg",
};

/**
 * Räknar betydelsegraden enligt kunddirektivets regler:
 *  - AKM1-delta ≥ 10 poäng ( absolutbelopp ) → "stor".
 *  - Vågklassbyte på LÅNG eller MEGA horisont → "stor".
 *  - Vågklassbyte på KORT eller MEDELLÅNG horisont → "man".
 *  - Prisförändring ≥ ±20 % → "man".
 *  - Mikro-horisontens byte är i sig inte väsentligt (mikro är minst viktig
 *    enligt typer.ts direktiv) — mikro-rörelser rapporteras i texten men
 *    höjer aldrig betydelsegraden. Övriga fall → "liten".
 */
function raknaBetydelse(j: {
  akm1Delta: number | null;
  prisForandring: number | null;
  vagbytes: VagklassByte[];
}): Betydelse {
  if (j.akm1Delta !== null && Math.abs(j.akm1Delta) >= AKM1_STOR_DELTA) return "stor";
  if (j.vagbytes.some((b) => b.horisont === "lang" || b.horisont === "mega")) return "stor";
  if (j.vagbytes.some((b) => b.horisont === "kort" || b.horisont === "medellang")) return "man";
  if (j.prisForandring !== null && Math.abs(j.prisForandring) >= PRIS_MAN_TROSKEL) return "man";
  return "liten";
}

/** "82 mot 74 (+8 poäng)" — eller ärligt "ej jämförbar". */
function akm1Mening(j: { akm1Nu: number | null; akm1Da: number | null; akm1Delta: number | null }): string {
  const nu = j.akm1Nu !== null && Number.isFinite(j.akm1Nu) ? String(j.akm1Nu) : "osatt";
  if (j.akm1Delta === null || j.akm1Da === null) {
    return `AKM1 ligger på ${nu} av 100 — ingen tidigare mätning att jämföra med.`;
  }
  const d = j.akm1Delta;
  const riktning = d > 0 ? "högre" : d < 0 ? "lägre" : "oförändrat";
  const tal = `${d > 0 ? "+" : d < 0 ? "-" : ""}${Math.abs(Math.round(d * 10) / 10)}`.replace(".", ",");
  return `AKM1 ligger på ${nu} mot ${j.akm1Da} senast (${tal} poäng ${riktning}).`;
}

/** "Priset har rört sig +12 % sedan förra mätningen." */
function prisMening(j: { prisNu: number | null; prisDa: number | null; prisForandring: number | null }): string {
  if (j.prisForandring === null || j.prisNu === null || j.prisDa === null) {
    return "Priset saknar jämförbar mätning den här gången.";
  }
  const f = j.prisForandring;
  if (Math.abs(f) < 0.0005) return "Priset är i princip oförändrat sedan förra mätningen.";
  const riktning = f > 0 ? "högre" : "lägre";
  return `Priset ligger ${procentText(f)} ${riktning} än vid förra mätningen.`;
}

/** Bygger den pedagogiska jämförelsetexten — beskriver, dömer aldrig. */
function byggJamforelseText(ticker: string, delar: { akm1: ReturnType<typeof akm1Mening>; bytes: string[]; pris: string }): string {
  const byteText =
    delar.bytes.length > 0
      ? delar.bytes.join("; ") + "."
      : "Vågbilden per horisont är densamma som senast.";
  return `${ticker}: ${delar.akm1} ${byteText} ${delar.pris} Detta är en beskrivning av då mot nu — inte en uppmaning att agera.`;
}

/**
 * Jämför två snapshot-samlingar per ticker ("då vs nu").
 *
 * Itererar NY-listan (deduperat, första förekomsten gäller — samma regel som
 * riskportfolj.ts rensaKandidater); tickers som bara finns i DÅ-listan har ingen
 * ny mätning och rapporteras inte. Tickers i NU utan då-mätning får delta=null
 * och betydelse "liten" (första mätningen är utgångspunkt, inte en förändring).
 */
export function jamforDåNu(nu: UppfoljningSnapshot[], da: UppfoljningSnapshot[]): Jamforelse[] {
  const daMap = new Map<string, UppfoljningSnapshot>();
  for (const s of da ?? []) {
    if (s && typeof s.ticker === "string" && s.ticker !== "" && !daMap.has(s.ticker)) {
      daMap.set(s.ticker, s);
    }
  }

  const setta = new Set<string>();
  const ut: Jamforelse[] = [];
  for (const n of nu ?? []) {
    if (!n || typeof n.ticker !== "string" || n.ticker === "") continue;
    if (setta.has(n.ticker)) continue;
    setta.add(n.ticker);
    const d = daMap.get(n.ticker) ?? null;

    const akm1Nu = Number.isFinite(n.akm1Totalt) ? n.akm1Totalt : null;
    const akm1Da = d && Number.isFinite(d.akm1Totalt) ? d.akm1Totalt : null;
    const akm1Delta = akm1Nu !== null && akm1Da !== null ? akm1Nu - akm1Da : null;

    const prisNu = n.pris !== null && n.pris !== undefined && Number.isFinite(n.pris) ? n.pris : null;
    const prisDa =
      d && d.pris !== null && d.pris !== undefined && Number.isFinite(d.pris) ? d.pris : null;
    const prisForandring =
      prisNu !== null && prisDa !== null && prisDa !== 0 ? (prisNu - prisDa) / prisDa : null;

    const vagbytes: VagklassByte[] = [];
    if (d) {
      const fDa = sakradVagstatus(d.fvagPerHorisont);
      const fNu = sakradVagstatus(n.fvagPerHorisont);
      const tDa = sakradVagstatus(d.tvagPerHorisont);
      const tNu = sakradVagstatus(n.tvagPerHorisont);
      for (const hz of HORIZONTER) {
        if (fDa[hz] !== fNu[hz]) {
          vagbytes.push({ horisont: hz, typ: "fundamental", fran: fDa[hz], till: fNu[hz] });
        }
        if (tDa[hz] !== tNu[hz]) {
          vagbytes.push({ horisont: hz, typ: "teknisk", fran: tDa[hz], till: tNu[hz] });
        }
      }
    }

    const betydelse = raknaBetydelse({ akm1Delta, prisForandring, vagbytes });
    const bytesMeningar = vagbytes.map(
      (b) =>
        `${TYP_NAMN[b.typ]} på ${HZ_NAMN[b.horisont]} sikt har gått från ${VAG_TEXT[b.fran]} till ${VAG_TEXT[b.till]}`
    );

    ut.push({
      ticker: n.ticker,
      akm1Da,
      akm1Nu,
      akm1Delta,
      prisDa,
      prisNu,
      prisForandring,
      vagbytes,
      betydelse,
      text: byggJamforelseText(n.ticker, {
        akm1: akm1Mening({ akm1Nu, akm1Da, akm1Delta }),
        bytes: bytesMeningar,
        pris: prisMening({ prisNu, prisDa, prisForandring }),
      }),
    });
  }
  return ut;
}

// ── 3. raknaNotisTexter ───────────────────────────────────────────────────────

/** Sortering för "störst förändring först": betydelse, |AKM1-delta|, antal
 *  vågbytes, |pris-%| och slutligen ticker ( deterministisk tie-breaker ). */
function jamforForandring(a: Jamforelse, b: Jamforelse): number {
  const absDelta = (x: number | null) => (x === null ? 0 : Math.abs(x));
  return (
    BETYDELSE_RANK[a.betydelse] - BETYDELSE_RANK[b.betydelse] ||
    absDelta(b.akm1Delta) - absDelta(a.akm1Delta) ||
    b.vagbytes.length - a.vagbytes.length ||
    absDelta(b.prisForandring) - absDelta(a.prisForandring) ||
    jamforStrang(a.ticker, b.ticker)
  );
}

/**
 * Max 3 notistexter per portfölj: de 2 största VÄSENTLIGA förändringarna
 * ( betydelse "stor" eller "man" ) + en sammanfattning. Finns inga väsentliga
 * förändringar blir det bara sammanfattningen — lugnet är också ett svar.
 *
 * Ton: omtanke-motorns värme — vi har följt portföljen, här är då mot nu,
 * klienten väljer själv om hen vill titta. ALDRIG köp/sälj.
 */
export function raknaNotisTexter(jamforelser: Jamforelse[], portfoljNamn: string): string[] {
  const namn = (portfoljNamn ?? "").trim() !== "" ? portfoljNamn.trim() : "dina aktier";
  const rankade = [...(jamforelser ?? [])].sort(jamforForandring);
  const vasentliga = rankade.filter((j) => j.betydelse !== "liten");

  const detaljer = vasentliga.slice(0, 2).map((j) => j.text);
  const sammanfattning =
    vasentliga.length > 0
      ? `Din forskningsportfölj ${namn} är omanalyserad: ${vasentliga.length} ${
          vasentliga.length === 1 ? "väsentlig förändring" : "väsentliga förändringar"
        } sedan förra mätningen — här är då mot nu, i ditt tempo.`
      : `Din forskningsportfölj ${namn} är omanalyserad: inga väsentliga förändringar sedan förra mätningen — bilden är stilla, och det är också ett svar. Vi sparar din plats om du vill titta närmare.`;

  return [...detaljer, sammanfattning].slice(0, MAX_NOTISTEXTER);
}

// ── 4. beslutaIntervall ───────────────────────────────────────────────────────

/**
 * Är det dags att mäta portföljen igen?
 *
 *  - månad: true först efter 30 hela dagar ( 29 dagar → false, 31 → true ).
 *  - kvartal: true först efter 90 hela dagar ( 89 dagar → false, 92 → true ).
 *  - saknat/ogiltigt senasteDatum → true ( första mätningen, eller att
 *    underlaget inte går att åldersbestämma — motorn mäter hellre än gissar ).
 *  - nuDatum är en valfri parameter för testbarhet; utan den används dagens
 *    datum (det enda ställe där väggklockan får styra).
 */
export function beslutaIntervall(
  senasteDatum: string | null | undefined,
  intervall: Intervall,
  nuDatum?: string
): boolean {
  const grans = INTERVALL_DAGAR[intervall] ?? INTERVALL_DAGAR.manad;
  if (!arIsoDatum(senasteDatum)) return true;
  const nu = arIsoDatum(nuDatum) ? (nuDatum as string) : dagensDatum();
  const dagar = dagarMellan(senasteDatum, nu);
  if (!Number.isFinite(dagar)) return true;
  return dagar >= grans;
}

// ── 5. AKM3-prediktionsloggen (AKM3-BESLUT §3 "mätning" + §12, steg 1) ──────

/**
 * AKM3.2026.09 registreras som NYTT prediktorspår BREDAVID AKM1/AKM2 —
 * "verkligheten dömer": P5-uppföljningen ("då vs nu") fäller domen inom
 * 8–12 kvartal och publicerar den ÖPPET. Raderna här är allt domslutet
 * behöver: ensemble-totalen sida vid sida med AKM2-kompositen och
 * AKM1-projektionen per bolag och mättillfälle, versionsstämplade.
 *
 * HASH-KEDJA (append-only, tamper-vakten — BESLUT §3/§10.10): varje rads
 * hash = sha-256 över (föregående radens hash + "\n" + radens kanoniska
 * JSON utan hash-fältet). Cronen (nodejs-runtime) injicerar node:crypto:s
 * sha256 — lib:t hålls fritt från node-importer (klientsäkert) och rent
 * deterministiskt (samma rad + prev-hash ⇒ samma hash, test vaktar).
 */

/** Kanonisk JSON för en loggrad: exakt fältparamgång, utan hash-fältet. */
export function kanoniskPrediktionsJSON(rad: Akm3Prediktionsrad): string {
  const { hash: _hash, ...utan } = rad ?? ({} as Akm3Prediktionsrad);
  return JSON.stringify(utan);
}

/**
 * Bygg EN loggrad ur ett färdigt ensemble-resultat (ren funktion — inga
 * klockor). Datum defaultar till ensemble.datum (k.hamtat — datans datum);
 * cronen anger mätningens datum explicit (snapshot-datumet) eftersom det är
 * MÄTNINGSTILLFÄLLET prediktionsloggen dömer mot (§12 "då vs nu").
 * Priset bärs med som verklighetsreferens om det finns — null annars.
 */
export function byggAkm3Prediktionsrad(
  ensemble: AKM3Ensemble,
  pris: number | null | undefined,
  datum?: string
): Akm3Prediktionsrad {
  const p = pris !== null && pris !== undefined && Number.isFinite(pris) ? pris : null;
  return {
    ticker: ensemble.ticker,
    datum: arIsoDatum(datum) ? (datum as string) : ensemble.datum,
    spar: "akm3-ensemble",
    modellVersion: ensemble.modellVersion,
    ensembleTotal: ensemble.total,
    bandMin: ensemble.band.min,
    bandMedian: ensemble.band.median,
    bandMax: ensemble.band.max,
    spridning: ensemble.spridning,
    enighet: ensemble.enighet,
    akm2Komposit: ensemble.akm2Komposit,
    akm1Totalt: ensemble.akm1Totalt,
    pris: p,
  };
}

/** sha-256 som injiceras av anroparen (hex-sträng, lowercase). */
export type Sha256Funktion = (text: string) => string;

/** Genesis-värdet för kedjan (dokumenterat — rad 1 hashas mot detta). */
export const PREDIKTIONSLOGG_GENESIS = "akm3-prediktionslogg-genesis-v1";

/**
 * Räkna en rads hash givet föregående hash (ren funktion + injicerad sha256).
 * Kedjeregel: sha256(prevHash + "\n" + kanoniskJSON(rad-utan-hash)).
 */
export function raknaPrediktionshash(
  rad: Akm3Prediktionsrad,
  prevHash: string,
  sha256: Sha256Funktion
): string {
  return sha256(`${prevHash}\n${kanoniskPrediktionsJSON(rad)}`);
}

/**
 * Stämpla en rad med sin hash (ren funktion — returnerar NY rad, lämnar
 * indata orörd; determinism: samma rad + prevHash ⇒ identisk hash).
 */
export function stemplaPrediktionsrad(
  rad: Akm3Prediktionsrad,
  prevHash: string,
  sha256: Sha256Funktion
): Akm3Prediktionsrad {
  return { ...rad, hash: raknaPrediktionshash(rad, prevHash, sha256) };
}

/**
 * Verifiera hela kedjan (ren funktion): true om och endast om varje rads
 * hash stämmer mot sin prev-hash OCH kedjan hänger ihop i ordning.
 * Tom kedja är giltig. Används av cronen efter läsning (tamper-vakt) och
 * av testsviten (gyllene kedja + manipulerad rad ⇒ false).
 */
export function verifieraPrediktionskedja(
  rader: readonly Akm3Prediktionsrad[] | null | undefined,
  sha256: Sha256Funktion
): boolean {
  if (!Array.isArray(rader)) return false;
  let prev = PREDIKTIONSLOGG_GENESIS;
  for (const r of rader) {
    if (!r || typeof r !== "object" || typeof r.hash !== "string") return false;
    if (raknaPrediktionshash(r, prev, sha256) !== r.hash) return false;
    prev = r.hash;
  }
  return true;
}
