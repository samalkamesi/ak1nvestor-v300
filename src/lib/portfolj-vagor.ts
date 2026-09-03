/**
 * AK1A PORTFÖLJENS VÅGMATRIS — hela portföljens samlade vågprofil.
 *
 * Användarens kärn-vision: "portföljens rörelse i vågor på mikro, kort,
 * medellång, lång och mega". Varje aktie klassas per tidshorisont av
 * analys-motorn (körAnalysMotor — ger vager + matris25); denna motor
 * viktar samman aktierna till ETT portföljsvar per horisont: andelen av
 * portföljvikten som ligger i impulsvåg / korrigering / basbygge / osatt.
 * Spegling av portfölj-aggregeringen i /api/member/portfolio/djupanalys.
 *
 * Aggregeringsregler (P8 — ärlig utdata, motorn gissar aldrig):
 *  - max 10 tickers per anrop (samma motorgräns som portfölj-routerna)
 *  - saknad/ogiltig vikt => medel av angivna vikter (eller 1.0) — samma
 *    normalisering som vagfundament-motorn
 *  - aktie utan data => ärlig "osatt"-profil i perAktie, men exkluderas ur
 *    det viktade portföljsgenomsnittet (vikterna renormaliseras)
 *  - sammanfattning = summan per vågklass över de fem horisonterna
 *    (≈ antal horisonter i varje klass; summan är 5 vid full täckning)
 *  - totalText i pedagogik.ts-ton: beskriver rytm, dömer aldrig
 *
 * SERVER-SIDA ONLY: importerar analys-motorn (Node-dns för SSRF-kontroll)
 * och får ALDRIG importeras som värde från klientkomponenter. Typ-import
 * är säker (raderas vid kompileringen):
 *   import type { PortfoljVagSvar } from "@/lib/portfolj-vagor";
 */

import { körAnalysMotor, type Horisont, type TickerAnalys } from "./analys-motor";

// ── Typer ────────────────────────────────────────────────────────────────────

/** Andel per vågklass 0–1 (nycklarna utan å — JSON-vänliga, enligt spec). */
export type VagKlassAndel = {
  impulsvag: number;
  korrigering: number;
  basbygge: number;
  osatt: number;
};

/** Vågprofil per tidshorisont: { mikro: {...}, kort: {...}, ... }. */
export type VagProfil = Record<string, VagKlassAndel>;

/** Hela svaret från raknaPortfoljVagor. */
export type PortfoljVagSvar = {
  /** Per aktie: indikatorprofil per horisont (en klass = 1, övriga = 0). */
  perAktie: Record<string, VagProfil>;
  /** Viktat genomsnitt per horisont — andel av portföljvikten per klass. */
  portfolj: VagProfil;
  /** Portföljens sammanfattande vågbild i text (pedagogisk ton). */
  totalText: string;
  /** Summa per klass över alla fem horisonter (≈ antal horisonter; max 5). */
  sammanfattning: VagKlassAndel;
};

// ── Konstanter ───────────────────────────────────────────────────────────────

const HORIZONTER: Horisont[] = ["mikro", "kort", "medellang", "lang", "mega"];

const HZ_NAMN: Record<string, string> = {
  mikro: "mikro",
  kort: "kort",
  medellang: "medellång",
  lang: "lång",
  mega: "mega",
};

/** Profilnyckel i fast ordning — deterministisk tie-break vid argmax. */
const KLASSER: Array<keyof VagKlassAndel> = ["impulsvag", "korrigering", "basbygge", "osatt"];

/** Klasstext med å (samma stavning som analys-motorns vager). */
const KLASS_TEXT: Record<keyof VagKlassAndel, string> = {
  impulsvag: "impulsvåg",
  korrigering: "korrigering",
  basbygge: "basbygge",
  osatt: "osatt",
};

/** Analys-motorns vågklass (med å) -> profilnyckel (utan å). */
const KLASS_NYCKEL: Record<string, keyof VagKlassAndel | undefined> = {
  "impulsvåg": "impulsvag",
  korrigering: "korrigering",
  basbygge: "basbygge",
  osatt: "osatt",
};

const MAX_TICKERS = 10;

// ── Hjälpmedel ───────────────────────────────────────────────────────────────

function r3(x: number): number {
  const v = Math.round(x * 1000) / 1000;
  return v === 0 ? 0 : v; // normalisera -0
}

function r1(x: number): number {
  const v = Math.round(x * 10) / 10;
  return v === 0 ? 0 : v;
}

/** Svenskt tal utandecimaler: 3 -> "3", 2.5 -> "2,5". */
function talText(x: number): string {
  return String(r1(x)).replace(".", ",");
}

function nollRad(): VagKlassAndel {
  return { impulsvag: 0, korrigering: 0, basbygge: 0, osatt: 0 };
}

function nollProfil(): VagProfil {
  const p: VagProfil = {};
  for (const hz of HORIZONTER) p[hz] = nollRad();
  return p;
}

/** Ärlig osatt-profil (aktie utan data — motorn gissar aldrig). */
function osattProfil(): VagProfil {
  const p = nollProfil();
  for (const hz of HORIZONTER) p[hz].osatt = 1;
  return p;
}

/** Indikatorprofil per horisont ur motorns vager (en klass = 1 per horisont). */
function profilFranVager(vager: Record<Horisont, string> | undefined): VagProfil {
  const p = nollProfil();
  for (const hz of HORIZONTER) {
    const nyckel = vager ? KLASS_NYCKEL[vager[hz]] : undefined;
    p[hz][nyckel ?? "osatt"] = 1;
  }
  return p;
}

/** Dominerande klass i en andelsrad (fast ordning => deterministiskt).
 *  Rad utan täckning (alla värden 0) => osatt — aldrig impulsvåg på bara 0. */
function dominerande(rad: VagKlassAndel): keyof VagKlassAndel {
  let basta: keyof VagKlassAndel = "osatt";
  let belopp = -1;
  for (const k of KLASSER) {
    if (rad[k] > belopp) {
      belopp = rad[k];
      basta = k;
    }
  }
  return belopp <= 0 ? "osatt" : basta;
}

/** Saknad vikt => medel av angivna vikter (eller 1.0) — som vagfundament-motorn. */
function normaliseraVikter(tickers: string[], vikter?: Record<string, number>): Record<string, number> {
  const angivna = Object.values(vikter || {}).filter((v) => typeof v === "number" && v > 0 && Number.isFinite(v));
  const standard = angivna.length > 0 ? angivna.reduce((a, b) => a + b, 0) / angivna.length : 1.0;
  const ut: Record<string, number> = {};
  for (const t of tickers) {
    const v = vikter ? vikter[t] : undefined;
    ut[t] = typeof v === "number" && v > 0 && Number.isFinite(v) ? v : standard;
  }
  return ut;
}

// ── totalText — pedagogisk formulering (pedagogik.ts-ton: beskriver, dömer aldrig) ──

function byggTotalText(portfolj: VagProfil, sammanfattning: VagKlassAndel, harData: boolean): string {
  if (!harData) {
    return (
      "Portföljens vågbild är än så länge osatt — motorn fick ingen data att läsa. " +
      "Motorn gissar aldrig; välkommen tillbaka när underlaget finns."
    );
  }

  const segment = HORIZONTER.map((hz) => {
    const k = dominerande(portfolj[hz]);
    return `${KLASS_TEXT[k]} på ${HZ_NAMN[hz]}`;
  });
  const forsta = dominerande(portfolj[HORIZONTER[0]]);
  const sista = dominerande(portfolj[HORIZONTER[HORIZONTER.length - 1]]);
  const fog = sista !== forsta ? " men " : " och ";
  const huvudtext = segment.slice(0, -1).join(", ") + fog + segment[segment.length - 1];

  const rakning = KLASSER
    .filter((k) => sammanfattning[k] > 0)
    .sort((a, b) => sammanfattning[b] - sammanfattning[a])
    .map((k) => `${talText(sammanfattning[k])} ${KLASS_TEXT[k]}`);

  return (
    `Portföljen är i genomsnitt i ${huvudtext}. ` +
    `Räknat över alla fem horisonter: ${rakning.join(", ")}. ` +
    "Vågorna beskriver portföljens rytm just nu — en bild att studera och lära av, inte en uppmaning att agera."
  );
}

// ── Ingång: räkna portföljens vågor ─────────────────────────────────────────

/**
 * Räknar hela portföljens vågprofil: kör analys-motorn per ticker (upp till
 * 10, samma gräns som portfölj-routerna) och viktar samman vågklasserna per
 * tidshorisont. Graceful: tom lista, ogiltiga tickers och misslyckade
 * hämtningar ger aldrig fel — bara ärliga osatt-värden.
 */
export async function raknaPortfoljVagor(
  tickers: string[],
  vikter?: Record<string, number>
): Promise<PortfoljVagSvar> {
  const rensade = Array.isArray(tickers)
    ? tickers.filter((t) => typeof t === "string" && t.trim() !== "").slice(0, MAX_TICKERS)
    : [];

  if (rensade.length === 0) {
    return {
      perAktie: {},
      portfolj: nollProfil(),
      totalText:
        "Portföljen är tom än så länge — lägg till innehav så börjar vågrörelsen synas på alla fem horisonterna.",
      sammanfattning: nollRad(),
    };
  }

  const viktTab = normaliseraVikter(rensade, vikter);
  const svar = await körAnalysMotor({ tickers: rensade });

  const perAktie: Record<string, VagProfil> = {};
  const ack: VagProfil = nollProfil();
  let totVikt = 0;

  for (let i = 0; i < rensade.length; i++) {
    const a: TickerAnalys | undefined = svar.tickers?.[i];
    const ticker = a?.ticker || rensade[i];
    const vager = a && !a.fel && a.vager ? (a.vager as Record<Horisont, string>) : null;
    perAktie[ticker] = vager ? profilFranVager(a?.vager) : osattProfil();
    if (!vager) continue; // exkluderas ur det viktade genomsnittet — aldrig gissa

    const vikt = viktTab[rensade[i]] ?? 1;
    totVikt += vikt;
    for (const hz of HORIZONTER) {
      const nyckel = KLASS_NYCKEL[vager[hz]] ?? "osatt";
      ack[hz][nyckel] += vikt;
    }
  }

  const portfolj: VagProfil = {};
  for (const hz of HORIZONTER) {
    portfolj[hz] = totVikt > 0
      ? {
          impulsvag: r3(ack[hz].impulsvag / totVikt),
          korrigering: r3(ack[hz].korrigering / totVikt),
          basbygge: r3(ack[hz].basbygge / totVikt),
          osatt: r3(ack[hz].osatt / totVikt),
        }
      : nollRad();
  }

  const sammanfattning: VagKlassAndel = {
    impulsvag: r1(HORIZONTER.reduce((s, hz) => s + portfolj[hz].impulsvag, 0)),
    korrigering: r1(HORIZONTER.reduce((s, hz) => s + portfolj[hz].korrigering, 0)),
    basbygge: r1(HORIZONTER.reduce((s, hz) => s + portfolj[hz].basbygge, 0)),
    osatt: r1(HORIZONTER.reduce((s, hz) => s + portfolj[hz].osatt, 0)),
  };

  return {
    perAktie,
    portfolj,
    totalText: byggTotalText(portfolj, sammanfattning, totVikt > 0),
    sammanfattning,
  };
}
