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
 *   - data/blogg/*.json — varje textbärande fält (våg 55, kunddirektiv "inte
 *     kurser eller annat eller BLOG, ingen översätts" ⇒ bloggen IN i MÖS).
 *     Scope-typ "blogg", nyckel "<slug>:titel" | "<slug>:ingress" (=
 *     description-fältet) | "<slug>:p<n>" (stycke n i body, 1-baserat, samma
 *     /\n\n+/-styckedelning som /blogg/[slug] och blogg-speglarna renderar).
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
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { ORDLISTA } from "../ordlista";

// ── Typer ────────────────────────────────────────────────────────────────────

/** Vad slags objekt översätts. "sida"/"kurs" reserverade för framtiden;
 *  "blogg" används av data/blogg/*.json (våg 55). */
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
type DeepQuiz = { q?: unknown; alternativ?: unknown; tips?: unknown };
type DeepChapter = { num?: number; title?: unknown; intro?: unknown; blocks?: DeepBlock[]; quiz?: DeepQuiz[] };
type DeepCourse = { chapters?: DeepChapter[] };
type DeepCourses = Record<string, DeepCourse>;

let kursCache: readonly KallaPost[] | null = null;

/** Skjut in en källa om texten är en icke-tom sträng (deterministisk nyckel). */
function pushKalla(poster: KallaPost[], slug: string, nyckelSuffix: string, text: unknown): void {
  if (typeof text !== "string" || !text) return;
  poster.push({
    scope: { typ: "kursblock", nyckel: slug + ":kap" + nyckelSuffix },
    text,
    hash: raknaHash(text),
  });
}

/** Läs + tolka deep-courses.json en gång (cachas — 17 MB ska bara parsas en gång per process).
 *
 * Per kapitel registreras: titel, intro, varje blocks-innehåll (1-baserat) och
 * quiz (q / alternativ k=0.. / tips — ratt-index är struktur och översätts aldrig).
 * Detta gör att flaggskeppsleveransernas titel/intro/quiz-poster kan importeras
 * och att motorronden täcker HELA kursinnehållet, inte bara brödtexten.
 */
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
      if (!kap) continue;
      const kapNum = typeof kap.num === "number" ? kap.num : 0;
      const n = String(kapNum);
      pushKalla(poster, slug, n + ":titel", kap.title);
      pushKalla(poster, slug, n + ":intro", kap.intro);
      if (Array.isArray(kap.blocks)) {
        kap.blocks.forEach((block, i) => {
          const text = typeof block?.content === "string" ? block.content : "";
          if (!text) return; // tomma block är inga översättningsobjekt
          // Diagramtypsnycklar ("donut", "bro"…) är REFERENSER till VIL-komponenter,
          // inte språk — översätts aldrig (annars försvinner diagram i speglarna).
          if (block?.type === "visuell") return;
          poster.push({
            scope: { typ: "kursblock", nyckel: slug + ":kap" + n + ":block" + String(i + 1) },
            text,
            hash: raknaHash(text),
          });
        });
      }
      if (Array.isArray(kap.quiz)) {
        kap.quiz.forEach((qz, j) => {
          if (!qz) return;
          pushKalla(poster, slug, n + ":quiz" + String(j + 1) + ":q", qz.q);
          if (Array.isArray(qz.alternativ)) {
            qz.alternativ.forEach((alt, k) => {
              pushKalla(poster, slug, n + ":quiz" + String(j + 1) + ":a" + String(k), alt);
            });
          }
          pushKalla(poster, slug, n + ":quiz" + String(j + 1) + ":tips", qz.tips);
        });
      }
    }
  }
  kursCache = poster;
  return poster;
}

// ── data/blogg/*.json ────────────────────────────────────────────────────────

/** Minimal form av ett blogg-inlägg i data/blogg/*.json (textbärande fält). */
type BloggFil = { slug?: unknown; title?: unknown; description?: unknown; body?: unknown };

let bloggCache: readonly KallaPost[] | null = null;

/**
 * Styckedelen av ett blogg-inläggs body. /\n\n+/ — EXAKT samma delning som
 * renderBody på svenska /blogg/[slug] och som blogg-speglarna (src/lib/
 * blogg-speglar.ts) tillämpar: stycke nummer n (1-baserat) måste vara samma
 * text i källregistret och i spegeln, annars matchar inte lagret källorna.
 * Tomma/vita block är inga översättningsobjekt och numreras inte.
 */
export function bloggStycken(body: string): string[] {
  return body
    .split(/\n\n+/)
    .filter((s) => s.trim().length > 0);
}

/** Läs + tolka data/blogg/*.json en gång (cachas).
 *
 * Per inlägg registreras de textbärande fälten: titel, ingress
 * (description-fältet — det är listvyns/kortets och metadatans text) och
 * varje icke-tomt body-stycke p1..pN (rubrik-/liststycken ingår — de är
 * textblock som renderas och ska översättas). pillar/author/tags/datum är
 * struktur/etiketter och översätts inte här. Filnamnsordning (sorterad) ⇒
 * deterministisk nyckelordning oavsett filsystem.
 */
function lasBloggKallor(): readonly KallaPost[] {
  if (bloggCache) return bloggCache;
  const dir = path.join(process.cwd(), "data", "blogg");
  let filer: string[] = [];
  try {
    filer = readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort(); // deterministiskt: ren filnamnsordning (kodpunktsordning)
  } catch {
    bloggCache = [];
    return bloggCache; // ingen bloggkatalog ⇒ inga bloggkällor (ej fel)
  }

  const poster: KallaPost[] = [];
  const push = (slug: string, suffix: string, text: unknown): void => {
    if (typeof text !== "string" || text.trim().length === 0) return;
    poster.push({
      scope: { typ: "blogg", nyckel: slug + ":" + suffix },
      text,
      hash: raknaHash(text),
    });
  };

  for (const fil of filer) {
    let inlagg: BloggFil;
    try {
      inlagg = JSON.parse(readFileSync(path.join(dir, fil), "utf8")) as BloggFil;
    } catch {
      continue; // ogiltig JSON hoppas över — ett trasigt inlägg ska inte stoppa registret
    }
    if (typeof inlagg?.slug !== "string" || !inlagg.slug) continue;
    push(inlagg.slug, "titel", inlagg.title);
    push(inlagg.slug, "ingress", inlagg.description);
    if (typeof inlagg.body === "string") {
      bloggStycken(inlagg.body).forEach((stycke, i) => {
        push(inlagg.slug as string, "p" + String(i + 1), stycke);
      });
    }
  }
  bloggCache = poster;
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
 * användarnytta per rond), därefter kursblock i filordning, och sist blogg
 * i filnamnsordning (våg 55). Cron-ronden konsumerar listan uppifrån —
 * därför är ordningen en del av kontraktet: ui → kurser → blogg.
 *
 * Kastar vid oläslig/ogiltig deep-courses.json — anroparen (cron) fångar och
 * rapporterar; ett trasigt källregister ska ALDRIG ge tyst halvkörning.
 * (Bloggdelen degraderar i stället tyst till tom lista — se lasBloggKallor.)
 */
export function listaKallor(): readonly KallaPost[] {
  if (alltCache) return alltCache;
  alltCache = [...lasUiKallor(), ...lasKursblock(), ...lasBloggKallor()];
  return alltCache;
}

/** Nollställ interna cachar (testbarhet/utveckling). */
export function resetKallCache(): void {
  kursCache = null;
  bloggCache = null;
  uiCache = null;
  alltCache = null;
}

/** Målspråkets kod (validering av indata vid systemgränsen). */
export function arMalSprak(s: string): s is MalSprak {
  return s === "en" || s === "ar";
}
