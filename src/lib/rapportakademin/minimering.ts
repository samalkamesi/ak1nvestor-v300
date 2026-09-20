/**
 * RAPPORTAKADEMIN — MINIMERINGSFÄLTLISTA (BESLUT 1 §§1+5, LAGBESLUT
 * STYRELSE-MUADCVYF-CG1JM2, 2026-09-21).
 *
 * LAGRUM: GDPR (EU) 2016/679 art 5.1 c (dataminimering) — personuppgifter
 * skall vara "ändamålsbegränsade, tillräckliga och relevanta samt begränsade
 * till vad som är nödvändigt för ändamålen"; jämte art 25 (dataskydd genom
 * systemutformning). Källa: laggrundade-beslut-2026-09-21.md BESLUT 1.
 *
 * MEKANIK (maskinell tvingande): elevens prestationsprofil FÅR ENBART bära
 * fälten nedan. minimeradBedomningRad() skalrar EVERYTHING else — en framtida
 * utvecklare som lägger till ett fält förlorar det tyst i denna grinder,
 * och valideraMinimeradRad() vägrar (ok:false) rader med okända fält så
 * att intagsvägen kan NEKA istället för att tappa data omärkligt.
 *
 * Ändamålet (enligt beslutet): anpassad repetition INOM tjänsten — när
 * prenumerationen upphör upphör ändamålet och gallring.ts raderar raden
 * (art 5.1 e). Fritextfält som personuppgifter är FÖRBUDDA här.
 */

export type MinimeradBedomningRad = {
  /** identifierare för övningen (fråga/pass) — ingen fritext */
  ovningsId: string;
  /** elevens val: tal eller svarsalternativ-index — aldrig fritext-personuppgift */
  elevensSvar: number | string;
  /** rätt (true) eller fel (false) — maskinell bedömning */
  ratt: boolean;
  /** tidsstämpel för bedömningen (ISO 8601) */
  ts: string;
  /** nyckling till konto (art 25: bedömningar nycklas till konto) — auth-id */
  authId: string;
};

export const MINIMERINGSFALT = ["ovningsId", "elevensSvar", "ratt", "ts", "authId"] as const;

/** Äkta fält-namn som Set för O(1)-medlemskapstest. */
const AKTA_FALT = new Set<string>(MINIMERINGSFALT);

/**
 * Skalra en inkommande rad ner till minimeringsfältlistan (art 5.1 c).
 * Okända fält kastas BORT (inte loggade — de skall aldrig ha samlats in;
 * loggning av ett förbjudet fält vore själva överträdelsen).
 */
export function minimeradBedomningRad(rad: Record<string, unknown>): MinimeradBedomningRad {
  return {
    ovningsId: String(rad.ovningsId ?? "").slice(0, 120),
    elevensSvar:
      typeof rad.elevensSvar === "number"
        ? rad.elevensSvar
        : String(rad.elevensSvar ?? "").slice(0, 40),
    ratt: rad.ratt === true,
    ts: String(rad.ts ?? new Date().toISOString()).slice(0, 40),
    authId: String(rad.authId ?? "").slice(0, 80),
  };
}

/**
 * Validera att en rad ENBART bär minimeringsfält (ok:false vid okänt fält —
 * intagsvägen NEKAR då, se beslutets "maskinell konfiguration" §1).
 */
export function valideraMinimeradRad(rad: Record<string, unknown>): { ok: boolean; okandaFalt?: string[] } {
  const okanda = Object.keys(rad).filter((k) => !AKTA_FALT.has(k));
  return okanda.length === 0 ? { ok: true } : { ok: false, okandaFalt: okanda };
}
