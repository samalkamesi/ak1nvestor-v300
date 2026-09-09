/**
 * STUDIO-KOMMANDON — snabbkommandon för /studio-skrivfältet (VÅG 83 MEGA
 * byggblock B4, STUDIO=Z). Ren parser + register — INGEN React, INGEN fs:
 * samma logik kan köras av UI:t (studio-chat.tsx) och av deterministiska
 * tester (tool-results/v83-b4-kommandon-test.mjs).
 *
 * Kontrakt: ett kommando är en rad som BÖRJAR med "/" — allt annat är en
 * vanlig prompt till agenten och skickas aldrig hit. Kommandot parsas
 * LOKALT i UI:t FÖRE sändning (kunddirektiv B4 §3): kommandon med API-väg
 * (/ny → POST /api/studio/session, /modell → POST /api/studio/modeller,
 * /komprimera → POST /api/studio/session) anropar bryggan; resten
 * (/help, /filer) är lokal hjälp/UI-händelse och lämnar ALDRIG browsern.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Ett registrerat snabbkommando. */
export interface StudioKommando {
  /** Kommandonamn utan skrå — "help", "ny", "modell", … */
  namn: string;
  /** Syntax som visas i /help — "/modell <id>". */
  syntax: string;
  /** Kort beskrivning (svenska, ingen jargong). */
  beskrivning: string;
  /** "api" = anropar en studio-rutt; "lokal" = hanteras helt i UI:t. */
  kalla: "lokal" | "api";
}

/** Registret — /help renderar detta i registering-ordning. */
export const STUDIO_KOMMANDON: readonly StudioKommando[] = [
  {
    namn: "help",
    syntax: "/help",
    beskrivning: "Visa alla snabbkommandon",
    kalla: "lokal",
  },
  {
    namn: "ny",
    syntax: "/ny",
    beskrivning: "Ny session — frisk kontext (fönstret börjar om; gamla sessioner finns kvar i listan)",
    kalla: "api",
  },
  {
    namn: "modell",
    syntax: "/modell <id>",
    beskrivning: "Byt huvudmodell — ny session skapas med modellen (listan finns i rullistan)",
    kalla: "api",
  },
  {
    namn: "komprimera",
    syntax: "/komprimera",
    beskrivning: "Komprimera kontexten (agenten sammanfattar och fönstret frias)",
    kalla: "api",
  },
  {
    namn: "filer",
    syntax: "/filer",
    beskrivning: "Öppna filträdet över agentens arbetsyta (förhandsgranska filer och bilder)",
    kalla: "lokal",
  },
];

/** Resultat av parsaKommando — kommando utan skrå + resten som argument. */
export interface ParsedKommando {
  kommando: string;
  argument: string;
}

/**
 * Parsa en rad som Eventuellt kommando. Returnerar null när raden INTE är
 * ett kommando (vanlig prompt — skickas till agenten som vanligt). En rad
 * som BÖRJAR med "/" men inte matchar registret parsas ändå (kommando =
 * det första ordet) så UI:t kan svara "okänt kommando" LOKALT i stället
 * för att skicka skräpet till agenten.
 */
export function parsaKommando(text: string): ParsedKommando | null {
  const trimmad = text.trim();
  if (!trimmad.startsWith("/")) return null;
  const efter = trimmad.slice(1);
  // Tom skrå eller "/ " är inte ett kommando — men heller inte en prompt
  // värd att skicka; UI:t avfärdar den via null-argument nedan.
  const ord = efter.split(/\s+/)[0] ?? "";
  if (ord === "") return { kommando: "", argument: "" };
  // Bara bokstäver i kommandonamnet (a-z, åäö tål lower-casing) — "/modell",
  // "/help". "/x1" blir "okänt kommando" lokalt, aldrig en agentprompt.
  if (!/^[a-zA-ZåäöÅÄÖ]+$/.test(ord)) return { kommando: ord.toLowerCase(), argument: "" };
  return {
    kommando: ord.toLowerCase(),
    argument: trimmad.slice(1 + ord.length).trim(),
  };
}

/**
 * Markdown-svar för /help — renderas av chattens egen StudioMarkdown
 * (## rubrik + lista + fetstil). Källan är ALWAYS registret ovan — lägg
 * ett kommando i STUDIO_KOMMANDON så dyker det upp här automatiskt.
 */
export function kommandoHjalp(): string {
  const rader = STUDIO_KOMMANDON.map(
    (k) => `- **${k.syntax}** — ${k.beskrivning}${k.kalla === "api" ? " _(anropar bryggan)_" : ""}`,
  );
  return [
    "## Snabbkommandon",
    "",
    "Skriv kommandot direkt i fältet — det körs lokalt innan något skickas till agenten.",
    "",
    ...rader,
  ].join("\n");
}
