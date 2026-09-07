/**
 * VARIABELREGISTRET — hela sajtens ENDA källa för siffror och priser
 * (våg 77, STYRELSE-B2B-VARIABLER.md beslut B2 — kundens "Excel-beroende").
 *
 * ── SÅ FUNGERAR BEROEDET (propageringsmodellen) ─────────────────────
 * Som en arbetsbok: ändra ETT värde i någon av guldkällorna nedan →
 * kör `npm run build` (deploy) → HELA sajten uppdaterar sig — alla
 * sidor, kort, CTA:er och beräkningar interpolerar härifrån och får
 * aldrig egna hårdkodade tal. Kvalitetsvakten bevakar att ingen
 * hårdkodar kanoniska pris-/antalssiffror i src-copy.
 *
 * ── GULDKÄLLOR (ändra HÄR, ingen annanstans) ────────────────────────
 *   data/siffror.json            — kurs-/bok-/quiz-antal
 *                                 (genereras: node verktyg/rakna-siffror.mjs)
 *   data/portfolj-system/priser.json — ALLA priser: privatnivåer
 *                                 (forskning 249 / plus 449 / hyra 799 +
 *                                 årsplaner + fas-rabatt), Fas-utbildningarna
 *                                 (fas2EnGang / fas3EnGang / fas3IntroManad)
 *                                 och B2B-nivåerna (499 / 1 499 / 4 999 +
 *                                 onboarding 9 900)
 *
 * Steg 2-kö (dokumenterad i styrelsebeslutet): kanoniska strängar
 * (mejladresser, organisationsnamn, sociala URL:er) flyttas hit.
 */
import radata from "../../data/siffror.json";
import priserData from "../../data/portfolj-system/priser.json";
import { SIFFROR, tal, type Siffror } from "@/lib/siffror";

export { SIFFROR, tal };
export type { Siffror };

/** Privat prenumerationsnivå ur priser.json (klient- och server-säker —
 *  JSON:en inlines i bunten vid build, därför blir ändringen i filen +
 *  ombyggnad = automatisk propagering till varje yta). */
export type PrivatNiva = {
  id: string;
  namn: string;
  prisManad: number;
  prisAr: number;
  beskrivning: string;
};

/** B2B-nivå ur priser.json:s "b2b"-sektion (våg 77 — flyttad ur
 *  /pro/priser/page.tsx så att kundens prisbeslut är ETT ställe). */
export type B2BNiva = {
  id: "pro-analytiker" | "pro-studio" | "pro-institution";
  prisManad: number;
  seats?: number;
  seatsMin?: number;
};

/** Läs en privatnivå ur registret — kastar ALDRIG; okänd id → null
 *  (copy som råkar fråga efter fel id syns direkt som saknad text). */
export function privatNiva(id: string): PrivatNiva | null {
  const n = (priserData.nivaer as PrivatNiva[]).find((x) => x.id === id);
  return n ?? null;
}

/** Alla privatnivåer i prisordning. */
export function privaNivaer(): PrivatNiva[] {
  return [...(priserData.nivaer as PrivatNiva[])].sort((a, b) => a.prisManad - b.prisManad);
}

/** Läs en B2B-nivå ur registret — null om B2B-sektionen saknas. */
export function b2bNiva(id: B2BNiva["id"]): B2BNiva | null {
  const sektion = (priserData as { b2b?: { nivaer: B2BNiva[] } }).b2b;
  if (!sektion) return null;
  return sektion.nivaer.find((x) => x.id === id) ?? null;
}

/** B2B-onsboarding (engång, Institution) — 0 om sektionen saknas. */
export function b2bOnboarding(): number {
  return (priserData as { b2b?: { onboardingEnGang?: number } }).b2b?.onboardingEnGang ?? 0;
}

/** Fas-rabatten (aktuell andel, t.ex. 0,2 = 20 %) — 0 om saknas. */
export function fasRabatt(): number {
  return (priserData as { rabattFas?: { fas2?: number } }).rabattFas?.fas2 ?? 0;
}

/** Rabatterat pris, avrundat till hela kronor (t.ex. 249 × 0,8 → 199). */
export function rabatterat(pris: number): number {
  return Math.round(pris * (1 - fasRabatt()));
}

/** Fas-utbildningarnas priser ur priser.json:s "fas"-sektion (våg 78 A6).
 *  Fas 2/Fas 3 = engångspris för 12 månader (inkl. moms); fas3IntroManad =
 *  introduktionspris kr/mån (exkl. moms) på Pro Analytiker för Fas
 *  3-certifierad analytiker (villkoren P3). Saknas sektionen → 0. */
export function fasPriser(): { fas2EnGang: number; fas3EnGang: number; fas3IntroManad: number } {
  const f = (priserData as { fas?: { fas2EnGang?: number; fas3EnGang?: number; fas3IntroManad?: number } }).fas;
  return {
    fas2EnGang: f?.fas2EnGang ?? 0,
    fas3EnGang: f?.fas3EnGang ?? 0,
    fas3IntroManad: f?.fas3IntroManad ?? 0,
  };
}

/** ORGANISATIONSNUMMER (våg 78 A2) — EN gemensam källa för alla juridiska
 *  dokument (transparens, villkor, privacy-policy). TOM sträng = bolaget är
 *  ännu inte registrerat: då renderas org.nr-raden INTE alls — aldrig en
 *  "[ORGANISATIONSNR]"-platshållare publikt (GDPR art. 13.1 a kräver att
 *  uppgiften är fullständig när den finns). Kunden fyller i värdet här när
 *  registreringen är klar — alla ytor uppdateras vid nästa build. */
export const ORG_NR = "";

/** ", organisationsnummer 556677-8899" resp. ", org.nr 556677-8899" —
 *  TOM sträng när ORG_NR ej är satt (rendrera då ingen rad alls). */
export const ORG_NR_LANG = ORG_NR !== "" ? `, organisationsnummer ${ORG_NR}` : "";
export const ORG_NR_KORT = ORG_NR !== "" ? `, org.nr ${ORG_NR}` : "";

/** Presentationstal med svenskt tusentalsavstånd ("2 490"). */
export const kr = (n: number) => n.toLocaleString("sv-SE");

/** Convenience: kanoniska priser direkt (interpolera i copy, ALDRIG hårdkoda). */
export const PRISER = {
  forskningManad: privatNiva("forskning")?.prisManad ?? 0,
  forskningAr: privatNiva("forskning")?.prisAr ?? 0,
  plusManad: privatNiva("forskning-plus")?.prisManad ?? 0,
  plusAr: privatNiva("forskning-plus")?.prisAr ?? 0,
  hyraManad: privatNiva("portfolj-hyra")?.prisManad ?? 0,
  hyraAr: privatNiva("portfolj-hyra")?.prisAr ?? 0,
  b2bAnalytiker: b2bNiva("pro-analytiker")?.prisManad ?? 0,
  b2bStudio: b2bNiva("pro-studio")?.prisManad ?? 0,
  b2bInstitution: b2bNiva("pro-institution")?.prisManad ?? 0,
  b2bOnboarding: b2bOnboarding(),
  fas2EnGang: fasPriser().fas2EnGang,
  fas3EnGang: fasPriser().fas3EnGang,
  fas3IntroManad: fasPriser().fas3IntroManad,
} as const;

//Referens sånt radata läses (undviker oanvänd-varning; källfilen dokumenterad ovan).
void radata;
