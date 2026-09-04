/**
 * MÖS MOTOR-ADAPTER — AI är exceptionallitetslagret, aldrig grundbulten
 * (Våg 52, MEGA ÖVERSÄTTNINGSSYSTEMET; kundens arkitekturprincip).
 *
 *   OM ZAI_API_KEY finns (zaiAktiv-kontraktet i src/lib/zai.ts):
 *     översätt via Z.ai (GLM) med termbanken påtvingad i systempromten.
 *   ANNARS:
 *     status "vantar-motor" — deterministisk ärlighet. Motorn LÅTSAS ALDRIG:
 *     ingen nyckel ⇒ ingen översättning, objektet köas (cron-ronden plockar
 *     upp det igen nästa dag eller när nyckeln aktiverats).
 *
 * ALDRIG utan kontroller: varje motorsvar genomgår ./kontroller.ts innan
 * status sätts. Poäng < 90 (KVALITETSTRASKEL) ⇒ "maskinutkast-behovar-
 * granskning" OAVSETT motor — kontrollerna sitter EFTER motorn i kedjan och
 * kan inte förhandlas bort av den.
 *
 * Statusflöde (bestamStatus):
 *   100            → "publicerad"          (alla 4 kontroller gröna — auto)
 *   90–99          → "utkast"              (godkänt maskinutkast, väntar
 *                                            mänsklig granskning → "granskad")
 *   < 90           → "maskinutkast-behovar-granskning"
 *   (motor borta)  → "vantar-motor"
 *   (källa ändrad) → "inaktuell"           (sätts av cron-ronden, inte här)
 *
 * Importen av @/lib/zai är MEDVETET dynamisk (inuti oversatt()): modulen
 * markerar sig "server-only" och ska aldrig dras in i tsx-testernas värld
 * när motorn ändå är inaktiv. motorAktiv() läser samma env-nyckel som
 * zaiAktiv() — samma kontrakt, utan importen.
 */

import { MALSPRAK, type MalSprak } from "./kalla";
import { korKontroller, KVALITETSTRASKEL, type Kontrollrapport } from "./kontroller";
import { hittaTermerIKalla, latinskaTermer, type TermRad } from "./termbank";

// ── Status ───────────────────────────────────────────────────────────────────

/** Livscykeln för ett översättningsobjekt (lagras i tabellen oversattningar). */
export type OversattningStatus =
  | "utkast"
  | "granskad"
  | "publicerad"
  | "vantar-motor"
  | "inaktuell"
  | "maskinutkast-behovar-granskning";

/** Kanonisk lista — SQL-checken i data/sql/oversattningar.sql speglar denna. */
export const OVERSATTNING_STATUS: readonly OversattningStatus[] = [
  "utkast",
  "granskad",
  "publicerad",
  "vantar-motor",
  "inaktuell",
  "maskinutkast-behovar-granskning",
];

/** Är motorn (ZAI) konfigurerad? Samma kontrakt som zaiAktiv() i src/lib/zai.ts. */
export function motorAktiv(): boolean {
  return Boolean(process.env.ZAI_API_KEY);
}

/** Status från kvalitetspoäng — deterministisk tröskellogik. */
export function bestamStatus(poang: number): OversattningStatus {
  if (!Number.isFinite(poang)) return "maskinutkast-behovar-granskning";
  if (poang >= 100) return "publicerad";
  if (poang >= KVALITETSTRASKEL) return "utkast";
  return "maskinutkast-behovar-granskning";
}

// ── Promptbygge ──────────────────────────────────────────────────────────────

/** Max antal termbanksrader i en prompt (begränsar tokenkosten). */
const MAX_TERMER_I_PROMPT = 60;

/** Rubriktermerna per språknamn som motorn ser. */
const SPRARNAMN: Record<MalSprak, string> = { en: "English", ar: "Arabic (العربية)" };

/**
 * Systemprompt: professionell finansiell översättare. Termbanken bifogas som
 * HARÄRDE regler — exakt de termer som kontroller.ts kommer att kontrollera
 * (samma detektering: hittaTermerIKalla). Latinska termer listas explicit.
 */
export function byggSystemPrompt(kalltext: string, sprak: MalSprak): string {
  const traffade = (hittaTermerIKalla(kalltext) as readonly TermRad[]).slice(0, MAX_TERMER_I_PROMPT);
  const termblock =
    traffade.length === 0
      ? "(inga termbankstermer påträffades i källan)"
      : traffade.map((r) => "- " + r.sv + " => " + r.en + " | " + r.ar).join("\n");
  const latinsk = latinskaTermer()
    .map((r) => r.sv)
    .join(", ");
  return [
    "You are a professional financial translator for AK1A Research Lab (educational finance).",
    "Translate the user's Swedish text into " + SPRARNAMN[sprak] + ".",
    "",
    "TERMBANK — MANDATORY (the source contains these terms; the translation MUST use exactly these target terms):",
    termblock,
    "",
    "HARD RULES:",
    "1. Keep ALL numbers EXACTLY as written in the source, including decimal separators (\"2,5\" stays \"2,5\" — do not convert commas to dots).",
    "2. Keep Latin-script terms/tickers/brands EXACTLY as-is: " + latinsk + ".",
    "3. Preserve the structure exactly: same paragraph count, line breaks, markdown (headings #, bullet -, numbered 1.), table rows |, and for JSON content keep all keys and array lengths identical — translate only human-readable values.",
    "4. Output ONLY the translation — no preamble, no explanations, no quotes around the result.",
  ].join("\n");
}

/**
 * maxTokens-räkning: ~2,6 tecken/token för europeisk text, arabiska är
 * token-tätare (~2) — ta det sämsta fallet och marginal. Avkapat svar är
 * meningslöst (strukturkontrollen failar det ändå).
 */
export function raknaMaxTokens(kalltextLangd: number): number {
  return Math.max(800, Math.min(8000, Math.ceil(kalltextLangd / 2) + 600));
}

/** Källor längre än detta kan inte motorn översätta i EN rond — ärligt kö-läge. */
export const MAX_KALLTEXST_LANGD = 12_000;

// ── Huvudfunktion ────────────────────────────────────────────────────────────

export type MotorResultat = {
  status: OversattningStatus;
  /** Översättningen (null när ingen producerades). */
  text: string | null;
  poang: number;
  rapport: Kontrollrapport | null;
  /** Deterministisk förklaring till statusen (kö, timeout, kontrollfall). */
  notering: string;
  /** Vilken motor som kördes ("zai" | "ingen" — determinismbarhet i rapporten). */
  motor: "zai" | "ingen";
};

/**
 * Översätt en källtext sv → sprak. ALDRIG utan kontroller när ett svar finns;
 * utan nyckel/vid fel returneras "vantar-motor" (deterministisk ärlighet).
 */
export async function oversatt(kalltext: string, sprak: MalSprak): Promise<MotorResultat> {
  if (!MALSPRAK.includes(sprak)) {
    return { status: "vantar-motor", text: null, poang: 0, rapport: null, notering: "ogiltigt målspråk: " + String(sprak), motor: "ingen" };
  }
  if (!motorAktiv()) {
    return {
      status: "vantar-motor",
      text: null,
      poang: 0,
      rapport: null,
      notering: "ZAI_API_KEY saknas — deterministisk kö, ingen låtsasöversättning",
      motor: "ingen",
    };
  }
  if (kalltext.length > MAX_KALLTEXST_LANGD) {
    return {
      status: "vantar-motor",
      text: null,
      poang: 0,
      rapport: null,
      notering: "källan " + String(kalltext.length) + " tecken > " + String(MAX_KALLTEXST_LANGD) + " — för lång för en motorrond, kräver delad körning",
      motor: "ingen",
    };
  }

  // Dynamisk import: dra bara in server-only-modulen när motorn faktiskt ska köras.
  const { zaiChat } = await import("@/lib/zai");
  const svar = await zaiChat(
    [
      { role: "system", content: byggSystemPrompt(kalltext, sprak) },
      { role: "user", content: kalltext },
    ],
    { temperatur: 0.2, maxTokens: raknaMaxTokens(kalltext.length) },
  );
  if (svar === null || svar.length === 0) {
    return {
      status: "vantar-motor",
      text: null,
      poang: 0,
      rapport: null,
      notering: "motorn svarade inte (timeout/API-fel) — köas till nästa rond",
      motor: "zai",
    };
  }

  // Kör ALDRIG utan kontroller: svaret värderas först här.
  const rapport = korKontroller(kalltext, svar, sprak);
  const status = bestamStatus(rapport.poang);
  return {
    status,
    text: svar,
    poang: rapport.poang,
    rapport,
    notering:
      status === "publicerad"
        ? "alla kontroller gröna — automatiskt publicerad"
        : status === "utkast"
          ? "poäng " + String(rapport.poang) + " ≥ " + String(KVALITETSTRASKEL) + " men < 100 — maskinutkast väntar mänsklig granskning"
          : "poäng " + String(rapport.poang) + " < " + String(KVALITETSTRASKEL) + " — kräver granskning oavsett motor",
    motor: "zai",
  };
}
