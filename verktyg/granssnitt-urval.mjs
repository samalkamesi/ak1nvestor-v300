#!/usr/bin/env node
// granssnitt-urval.mjs — ren sidvalslogik för gränsnittsvakten (spår 8,
// s8-u2 omgång 6, 2026-09-18) — ingen IO: journalen passas in, så sviten
// (verktyg/testa-granssnitt-urval.mjs) kan köra DEN RIKTIGA koden offline
// (granssnitt-konsol.mjs-precedensen — vakten själv är ett toppnivåskript
// som sveper hela sajten vid import).
//
// ROTORSAKA (bevis: sond mot sitemap+journal 2026-09-18, protokoll
// data/forskning/OPTIMERING/o68-vakt-rotationsblindhet-s8.md): våg 157:s
// urval sorterade PRIORITERADE_SEKTIONER FÖRE mätålder. Sektionen /dataset
// (141 sidor > 21 rotationsplatser) höll SAMTLIGA platser varje körning —
// även efter att sektionens journaltäckning var 100 % komplett (09-15) —
// varvid 1 679 av 1 943 sitemap-sidor (86 %) blev PERMANENT mätblinda:
// /en 410 + /ar 410 (kundens tre-språkslöfte), /kurser 334, /labb 202,
// /bolag 101, /blogg 56 samt verktygssidorna /superanalys + /kalkylator
// (s9-u2:s bokade köpost). Rotkuren: sektionsprioritering får ENDAST
// gälla bland ALDRIG-MÄTTA sidor (kö-hoppning för nya täckningsvågor, som
// v157-kommentarens ursprungsavsikt) — en sektion med fler sidor än
// rotationsplatser kan aldrig igen låsa rotationen, listan får stanna
// kvar ofarlig när en våg glömer städa bort den.
//
// Sorteringsordning (doktrin "mät det kunden ser först"):
//   1. bas (/, /studio, /admin) — mäts varje körning.
//   2. Aldrig-mätta FÖRST — bland dem: vågprioriterade sektioner, därefter
//      grunda sökvägar (rotnivåsidor = unika mallar/verktygsytor, t.ex.
//      /superanalys och /kalkylator) före djupa sökvägar (mallkloner).
//   3. Därefter ÄLDST-mätt-först — GLOBAL round-robin, ingen sektion
//      företräde.

export const SIDOR_MAX = 24;
export const FALLBACK_SIDOR = [
  "/",
  "/kurser",
  "/labb",
  "/blogg",
  "/dataset",
  "/superanalys",
  "/kalkylator",
  "/om-oss",
];
// Utbyggbar (v157): nästa täckningsvåg lägger sitt prefix här. Ofarlig att
// lämna kvar — prioriteringen gäller bara aldrig-mätta sidor (se ovan).
export const PRIORITERADE_SEKTIONER = ["/dataset"];

export function sektionAv(p) {
  return "/" + (p.split("/")[1] || "");
}

const grunda = (p) => p.split("/").filter(Boolean).length;

export function urvalMedJournal(unika, journal) {
  const bas = ["/", "/studio", "/admin"];
  const prio = (p) => (PRIORITERADE_SEKTIONER.includes(sektionAv(p)) ? 0 : 1);
  const ordnade = unika
    .filter((p) => !bas.includes(p))
    .sort((a, b) => {
      const am = journal[a] ? 1 : 0;
      const bm = journal[b] ? 1 : 0;
      if (am !== bm) return am - bm; // aldrig-mätta före allt annat
      if (am === 0) {
        return (
          prio(a) - prio(b) || // våg-prioriterade sektioner först
          grunda(a) - grunda(b) || // unika mallar före mallkloner
          a.localeCompare(b)
        );
      }
      return journal[a] - journal[b] || a.localeCompare(b); // global äldst-först
    });
  const urval = [...new Set([...bas, ...ordnade])].slice(0, SIDOR_MAX);
  const aldrigMatte = unika.filter((p) => !journal[p]).length;
  return { urval, aldrigMatte };
}
