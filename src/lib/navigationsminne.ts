/**
 * NAVIGATIONSMINNE — mönsterigenkänning för varje elev.
 * Spårar besökta sidor/kurser i localStorage och ger personliga
 * nästa-steg-förslag. Ren klient-logik: inga SSR-anrop.
 */

export type Besok = {
  sida: string;        // t.ex. "/kurser" eller "/kurser/mera-for-miljarder"
  titel: string;       // läsbar titel
  tid: number;         // Date.now()
};

const NYCKEL = "ak1a:navigationsminne";
const MAX_BESOK = 24;

function las(): Besok[] {
  if (typeof window === "undefined") return [];
  try {
    const rå = window.localStorage.getItem(NYCKEL);
    if (!rå) return [];
    // Kontraktet Besok[] gäller alltid: sådd av "null"/icke-array (trasig
    // annan flik, migreringsrester) bryter ALDRIG ut till anroparen.
    const parsad: unknown = JSON.parse(rå);
    return Array.isArray(parsad) ? (parsad as Besok[]) : [];
  } catch {
    return [];
  }
}

function spara(besok: Besok[]) {
  try {
    window.localStorage.setItem(NYCKEL, JSON.stringify(besok.slice(0, MAX_BESOK)));
  } catch {
    /* privat läge etc. */
  }
}

/** Registrera ett besök — senast först, dubbletter flyttas upp. */
export function registreraBesok(sida: string, titel?: string) {
  if (!sida || sida === besok()[0]?.sida) return;
  const renTitel = titel || titelFranSida(sida);
  spara([{ sida, titel: renTitel, tid: Date.now() }, ...las().filter((b) => b.sida !== sida)]);
}

/** Senaste besök, nyast först. */
export function besok(): Besok[] {
  return las();
}

/** decodeURIComponent med fallgrop: ogiltig %-kodning ("/kurser/100%")
 *  kastar URIError — P8-andan: ogiltig indata ger rå sträng, aldrig kast. */
function lasbarDel(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/** Mänsklig titel för en sökväg när ingen anges. */
export function titelFranSida(sida: string): string {
  const kända: Record<string, string> = {
    "/": "Startsidan",
    "/manifest": "Manifestet",
    "/laroplan": "Läroplanen",
    "/kurser": "Alla kurser",
    "/bibliotek": "Biblioteket",
    "/certifikat": "Certifikat",
    "/kalkylator": "AKM1-kalkylatorn",
    "/superanalys": "Superanalysen",
    "/min-portfolj": "Min portfölj",
    "/analyser": "Analyser",
    "/diagnos": "AI-Diagnos",
    "/labb": "Labbar",
    "/min-sida": "Min Sida",
    "/dagens-pass": "Dagens Pass",
    "/topplista": "Topplistan",
    "/badges": "Badges & meriter",
    "/fas2-ansok": "Fas 2-ansökan",
    "/medlemskap": "Medlemskap",
    "/blogg": "Bloggen",
    "/om-oss": "Om oss",
    "/logga-in": "Logga in",
    "/profil": "Kognitiv profil",
  };
  if (kända[sida]) return kända[sida];
  if (sida.startsWith("/kurser/")) {
    return lasbarDel(sida.replace("/kurser/", "").replace(/-/g, " "));
  }
  if (sida.startsWith("/blogg/")) {
    return "Blogg: " + lasbarDel(sida.replace("/blogg/", "").replace(/-/g, " "));
  }
  return sida;
}
