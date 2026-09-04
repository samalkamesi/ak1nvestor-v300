/**
 * AKM2-VISNINGSDATA — ren, klientsäker hjälpmodul för AKM2-dashboarden.
 *
 * ÄGARE: dashboard-agenten (våg 57 D3). Delas mellan:
 *  - src/components/ak1a/akm2-dashboard.tsx   ("use client" — visuella komponenter)
 *  - src/lib/akm2-onsdemand.ts                (server — on-demand raknaAKM2)
 *  - src/components/ak1a/akm1-calculator.tsx  (agent D1:s AKM2-läge, via import)
 *
 * Filen är MEDVETET fri från "use client" och från fs-importer så att både
 * klientkomponenter och serverkod kan importera samma mappning.
 *
 * MODUL_IDN speglar MODULER-registrets ordning i src/lib/akm2/moduler/index.ts
 * (saas, bank, cyklisk, tillgangstung, tillvaxt, standard) — registret saknar
 * egna korta id:n (BranschModul bär bara `namn`), så dashboarden kanoniserar
 * dem här. Ändras registrets ordning måste denna spegel följa (kommenterad
 * koppling, inget test vaktar — modulregistret ägs av modul-agenten).
 *
 * ÄRLIGHET: byggModulAktiveringar injicerar ENDAST variabler med underlag —
 * modulfunktioner som svarar osatt: true lämnas utan poäng så att kärnans
 * lager 4 omfördelar deras vikt (BESLUT §2: aldrig straffa saknad data) i
 * stället för att späda kompositen med gissade nollor.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import type { BolagsNyckeltal } from "./portfolj-forskning/typer";
import type { ModulAktivering } from "./akm2/typer";
import { MODULER, aktivaModulerForBransch, KARNA_MODUL_FUNKTIONER } from "./akm2/moduler";

/** Korta modul-ID:n i MODULER-registrets ordning (kanoniska för visning). */
export const MODUL_IDN: readonly string[] = [
  "saas", "bank", "cyklisk", "tillgangstung", "tillvaxt", "allman",
];

/** Korta visningsnamn per modul-ID — okända ID:n faller tillbaka på råa id:t. */
export const MODUL_ETIKETT: Record<string, string> = {
  saas: "SaaS",
  bank: "Bank",
  cyklisk: "Cyklisk",
  tillgangstung: "Tillgångstung",
  tillvaxt: "Tillväxt",
  allman: "Allmän",
  standard: "Allmän", // MODULER-registrets interna namn på fallback-modulen
};

/** Kort visningsnamn för en ModulAktivering.modulId. */
export function modulKortNamn(modulId: string): string {
  return MODUL_ETIKETT[modulId] ?? modulId;
}

/** Svensk talsträng: 4.25 → "4,3" (default 1 decimal); NaN/Infinity → "—". */
export function svTal(x: number, decimaler = 1): string {
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(decimaler).replace(".", ",");
}

/**
 * Bygg lager 2-aktiveringar för ett BolagsNyckeltal: modulregistret matchar
 * bransch → aktiva V21+ → poäng injiceras ur modulfunktionerna. Osatta
 * variabler (VariabelSvar.osatt) lämnas BORT ur poäng-mappningen — kärnan
 * dokumenterar dem som "väger 0 + omfördelat" via lager 4 i stället.
 */
export function byggModulAktiveringar(k: BolagsNyckeltal): ModulAktivering[] {
  return aktivaModulerForBransch(k.bransch).map((m) => {
    const ix = MODULER.indexOf(m);
    const modulId = ix >= 0 && ix < MODUL_IDN.length ? MODUL_IDN[ix] : m.namn.split(" ")[0].toLowerCase();
    const poang: Record<string, number> = {};
    for (const v of m.aktivaV) {
      const f = KARNA_MODUL_FUNKTIONER[v];
      if (!f) continue;
      const svar = f(k);
      if (!svar.osatt) poang[v] = svar.poang; // ärlighet: osatt injiceras aldrig
    }
    return {
      modulId,
      aktiv: true,
      automatisk: true, // branschmatchning triggade (registrets aktiveringsgrund)
      orsak: m.namn,
      poang,
    };
  });
}
