/**
 * MÖS KÄLLREGISTER — allt som ska kunna översättas, med versionshash
 * (Våg 52, MEGA ÖVERSÄTTNINGSSYSTEMET).
 *
 * Kunddirektiv: "att allt sker dynamiskt speciellt när vi har nytt innehåll".
 * Därför: varje översättningsobjekt har ett scope {typ, nyckel} och källtexten
 * hashas med SHA-256 (12 hex). När källan ändras ändras hashen → cron-ronden
 * (/api/cron/oversatt) ser att översättningen blivit inaktuell och köar om den.
 * Allt deterministiskt: samma källtext ⇒ samma hash, alltid.
 *
 * KÄLLOR (listaKallor):
 *   - public/deep-courses.json — varje blocks-innehåll. Scope-nyckel:
 *     "<kurs-slug>:kap<kapitelnummer>:block<blockindex, 1-baserat>", t.ex.
 *     "the-intelligent-investor:kap5:block3". (Följer kundens exempelformat.)
 *     OBS: de 10 premium-handskapade spegelsidorna (/en, /ar) ingår INTE — de
 *     är redan professionellt översatta och ska inte röras av maskinronden.
 *   - src/lib/ordlista.ts — varje ui-nyckel (sv-texten är källan; en/ar där är
 *     fas 1:s handgjorda gränssnittsöversättningar — här deklareras de som
 *     källor så att termbanks-/kvalitetsgarantin täcker även dem).
 *
 * Läsning av deep-courses.json följer mönstret i src/app/api/kurs/[slug]/route.ts
 * (readFileSync från process.cwd()/public — Vercel-bundeln innehåller public/).
 *
 * Modulen är fs/crypto-beroende och får bara importeras från server-sammanhang
 * (cron-rutter, serverkomponenter, verktygsskript) — aldrig från klientkod.
 * Inga imports av server-only-moduler här: verktyg/validera-motorer.mjs kör
 * filen direkt via tsx.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { ORDLISTA } from "../ordlista";

// ── Typer ────────────────────────────────────────────────────────────────────

/** Vad slags objekt översätts. "sida"/"kurs"/"blogg" reserverade för framtiden. */
export type ScopeTyp = "ui" | "sida" | "kurs" | "kursblock" | "blogg";

/** Varje översättningsobjekt identifieras entydigt av typ + nyckel + språk. */
export type KallaScope = { typ: ScopeTyp; nyckel: string };

/** En översättningskälla: svensk text + sitt scope. */
export type KallaPost = {
  scope: KallaScope;
  /** Källtexten (svenska) som ska översättas. */
  text: string;
  /** SHA-256 av källtexten — 12 hex-tecken. */
  hash: string;
};

/** Målspråken (svenska är källa, inte mål). */
export const MALSPRAK = ["en", "ar"] as const;
export type MalSprak = (typeof MALSPRAK)[number];

/** "kursblock:v01-forsaljningstillvaxt:kap2:block1" — lagernyckel. */
export function kallaIdent(scope: KallaScope): string {
  return scope.typ + ":" + scope.nyckel;
}

/**
 * Versionshash: SHA-256 av källtexten (utf-8), förkortad till 12 hex-tecken.
 * 48 bitar ≈ 2,8×10¹⁴ värden — kollisionsrisken för ~32 000 källor är ~10⁻⁵
 * per ny källa (födelsedagsproblemet), och det är en DAGLIG omhashning av
 * oförändrade texter som skyddar mot just oavsiktlig dublett — räcker gott
 * för ändringsdetektering; identiteten garanteras ändå av (typ, nyckel, språk).
 */
export function raknaHash(kalltext: string): string {
  return createHash("sha256").update(kalltext, "utf8").digest("hex").slice(0, 12);
}

// ── deep-courses.json ────────────────────────────────────────────────────────

/** Minimal form av blocket i public/deep-courses.json (vi bryr oss om content). */
type DeepBlock = { type?: string; content?: unknown };
type DeepChapter = { num?: number; blocks?: DeepBlock[] };
type DeepCourse = { chapters?: DeepChapter[] };
type DeepCourses = Record<string, DeepCourse>;

let kursCache: readonly KallaPost[] | null = null;

/** Läs + tolka deep-courses.json en gång (cachas — 17 MB ska bara parsas en gång per process). */
function lasKursblock(): readonly KallaPost[] {
  if (kursCache) return kursCache;
  const fil = path.join(process.cwd(), "public", "deep-courses.json");
  const raa = readFileSync(fil, "utf8");
  const data = JSON.parse(raa) as DeepCourses;

  const poster: KallaPost[] = [];
  // Kursordning = JSON-nyckelordning (insättningsordning — deterministisk i
  // filen); inom kurs: kapitel i arrayordning, block 1-baserat index.
  for (const slug of Object.keys(data)) {
    const kurs = data[slug];
    if (!kurs || !Array.isArray(kurs.chapters)) continue;
    for (const kap of kurs.chapters) {
      if (!kap || !Array.isArray(kap.blocks)) continue;
      const kapNum = typeof kap.num === "number" ? kap.num : 0;
      kap.blocks.forEach((block, i) => {
        const text = typeof block?.content === "string" ? block.content : "";
        if (!text) return; // tomma block är inga översättningsobjekt
        poster.push({
          scope: { typ: "kursblock", nyckel: slug + ":kap" + String(kapNum) + ":block" + String(i + 1) },
          text,
          hash: raknaHash(text),
        });
      });
    }
  }
  kursCache = poster;
  return poster;
}

// ── ordlistans ui-nycklar ────────────────────────────────────────────────────

let uiCache: readonly KallaPost[] | null = null;

/** En källa per ORDLISTA-nyckel: sv-värdet är källtexten. */
function lasUiKallor(): readonly KallaPost[] {
  if (uiCache) return uiCache;
  const poster: KallaPost[] = Object.keys(ORDLISTA)
    .slice()
    .sort() // stabil ordning oavsett framtida omordning i ordlista.ts
    .map((nyckel) => {
      const text = ORDLISTA[nyckel as keyof typeof ORDLISTA].sv;
      return { scope: { typ: "ui" as const, nyckel }, text, hash: raknaHash(text) };
    });
  uiCache = poster;
  return poster;
}

// ── Registret ────────────────────────────────────────────────────────────────

let alltCache: readonly KallaPost[] | null = null;

/**
 * ALLA översättningskällor, deterministisk ordning: ui först (små, hög
 * användarnytta per rond), därefter kursblock i filordning. Cron-ronden
 * konsumerar listan uppifrån — därför är ordningen en del av kontraktet.
 *
 * Kastar vid oläslig/ogiltig deep-courses.json — anroparen (cron) fångar och
 * rapporterar; ett trasigt källregister ska ALDRIG ge tyst halvkörning.
 */
export function listaKallor(): readonly KallaPost[] {
  if (alltCache) return alltCache;
  alltCache = [...lasUiKallor(), ...lasKursblock()];
  return alltCache;
}

/** Nollställ interna cachar (testbarhet/utveckling). */
export function resetKallCache(): void {
  kursCache = null;
  uiCache = null;
  alltCache = null;
}

/** Målspråkets kod (validering av indata vid systemgränsen). */
export function arMalSprak(s: string): s is MalSprak {
  return s === "en" || s === "ar";
}
