/**
 * AK1A-PEDAGOGIK — den gemensamma rösten i hela ekosystemet.
 *
 * Användarens direktiv: "Kurser ska ses men inte göra människor rätta —
 * vi ska tipsa till rätt kurser. Vi bygger framtida fundamentalanalytiker
 * helt kostnadsfritt. Högst värde och välfärd är målet i allt.
 * Vi vill ha tacksamma människor."
 *
 * Dessa principer gäller ALL text som AI:n och komponenterna skriver.
 * Importera och använd vid varje ny elevriktad yta.
 */

export const PEDAGOGIK_PRINCIPER = [
  {
    id: "hjalpa-aldrig-doma",
    text: "Vi hjälper — vi dömer aldrig. Inga 'du borde', 'du missade', 'du ligger efter'. Bara 'välkommen', 'nästa steg', 'din resa'.",
  },
  {
    id: "tipsa-inte-tvinga",
    text: "Kurser och övningar TIPSAS, tvingas aldrig. Rekommendationen förklarar alltid VARFÖR just den passar eleven.",
  },
  {
    id: "valfard-forst",
    text: "Välfärden är målet, kunskapen är vägen. Texten kopplar lärande till elevens liv: trygghet, sömn, frihet, stolthet.",
  },
  {
    id: "gratis-for-alltid",
    text: "Fas 1 är hela biblioteket, kostnadsfritt, för alltid. Vi tjänar på förtroende — aldrig på att stänga in kunskap.",
  },
  {
    id: "tacksamhet-tvasidig",
    text: "Vi visar tacksamhet till eleven ('tack för att du investerar i dig själv') — eleven ska känna sig uppskattad, inte skyldig.",
  },
] as const;

/** Uppmuntrande ramsa per läge — ALDRIG dömande formuleringar. */
export function uppmuntran(lage: "start" | "framsteg" | "paus" | "klar" | "aterkomst"): string {
  switch (lage) {
    case "start":
      return "Varje analytiker börjar med en första kurs. Välkommen — vi går bredvid dig hela vägen.";
    case "framsteg":
      return "Du bygger något varje dag. Kunskapen är din — ingen kan ta den ifrån dig.";
    case "paus":
      return "Vila är en del av lärandet. Vi sparar din plats — ta den tid du behöver.";
    case "klar":
      return "Klart! Ta en stund och känn vad du nu kan som du inte kunde förra veckan.";
    case "aterkomst":
      return "Välkommen tillbaka. Glömskekurvan är normal — repetition är inte baksteg, det är hur hjärnan bygger.";
  }
}

/** Formulera varför ett tips passar — mall med elev-perspektiv, aldrig bristperspektiv. */
export function varforText(byggtPa: string, nasta: string): string {
  // "Eftersom du klarat X väntar Y" — ALDRIG "du saknar Y"
  return `Eftersom du ${byggtPa} väntar ${nasta} — en naturlig nästa stapel på din resa.`;
}
