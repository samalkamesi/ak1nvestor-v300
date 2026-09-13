/**
 * SÖK-SERVERN — server-sidig sajtsökning för GET /api/sok (våg 122E).
 *
 * Källor (EGET innehåll, i prioritetsordning — varje källa faller graceful):
 *   1. Statiska sidor  — MENY_REGISTER (gäst-punkter: publik "gast"; medlem-
 *      /fas/admin-ytor läcks ALDRIG från ett oautentiserat API).
 *   2. Kurser          — public/sok-index.json (våg 63-byggets destillat,
 *      ~75 kB); saknas/ogiltig den destilleras direkt ur
 *      public/deep-courses.json (kor-sokindex-mönstret, endast sökfält).
 *   3. Bloggposter     — data/blogg/*.json (samma källa som content.ts).
 *   4. Aktieanalyser   — data/analyses + data/export/analyses (getAnalyses-
 *      mönstret ur src/lib/content.ts).
 *
 * CACHE (datacache.ts-andan): indexet byggs EN gång per process och lever i
 * module-scope; revalidering tidigast varje timme (tidsstämpel-jämförelse).
 * Cachen är en ACCELERATOR, aldrig ett beroende — varje läsning är
 * try/catch-ad och ett totalt källbortfall faller på RESERVEN nedan.
 *
 * RESERVLÖSNING: saknas/ogiltig ALL indexdata serveras den inbakade listan
 * av huvudsidor — söken svarar ALLTID 200 med JSON (datacache.ts-kontraktet:
 * 500 är förbjudet; tomt resultat är OK vid tom data). Miljöflaggan
 * AK1A_SOK_TVINGA_RESERV=1 tvingar reservvägen (testbarhet — verktyg/
 * testa-sok.mjs test d).
 *
 * SERVER-SIDE ONLY: synkron fs-åtkomst — får ALDRIG importeras av klient-
 * komponenter (kommandopaletten behåller sin egen sokindex.ts-klient).
 *
 * Pedagogisk utbildning — ALDRIG investeringsråd (lagen 2007:528).
 */
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { MENY_REGISTER } from "@/lib/meny-register";
import { b2bAktiv } from "@/lib/b2b-status";

// ── Typer ────────────────────────────────────────────────────────────────────

/** API-svarets träffrad — exakt fältuppsättningen /api/sok lovar. */
export type SokTräff = {
  titel: string;
  url: string;
  typ: string;
  utdrag: string;
};

/** Intern indexpost. `bas` = svensk URL; `speglad` = en/ar-spegel finns. */
type IndexPost = {
  titel: string;
  bas: string;
  typ: string;
  utdrag: string;
  /** extra sökbara ord (kategori, ticker, taggar …) */
  nycklar: string;
  speglad: boolean;
};

/** Max tecken av utdraget som följer med i svaret. */
const UTDARG_MAX = 110;

/** Statiska sidor med bevisade speglar (kollat mot src/app/(en)/en och (ar)/ar). */
const SPEGLADE_STATISKA = new Set([
  "/",
  "/blogg",
  "/certifikat",
  "/dagens-pass",
  "/dataset",
  "/fas2-ansok",
  "/fas3",
  "/kurser",
  "/laroplan",
  "/logga-in",
  "/manifest",
  "/medlemskap",
  "/om-oss",
  "/prenumeration",
  "/transparens",
]);

// ── Reserv — inbakade huvudsidor (söken svarar även utan alla datafiler) ─────

const RESERV: IndexPost[] = [
  { titel: "Hem", bas: "/", typ: "Sida", utdrag: "AK1A Research Lab — finansiell utbildning", nycklar: "start framsida utbildning", speglad: true },
  { titel: "Alla kurser", bas: "/kurser", typ: "Kurs", utdrag: "Hela kursbiblioteket med quiz", nycklar: "bibliotek kurs bokmaster", speglad: true },
  { titel: "Läroplanen", bas: "/laroplan", typ: "Sida", utdrag: "5 nivåer → oberoende analytiker", nycklar: "nivåer struktur", speglad: true },
  { titel: "Biblioteket", bas: "/bibliotek", typ: "Sida", utdrag: "Bokkanon — böcker mappade mot AKM1/AK1TS", nycklar: "bokkanon böcker läsning", speglad: false },
  { titel: "Labbar", bas: "/labb", typ: "Sida", utdrag: "Forskningsärenden & case", nycklar: "forskning labb case", speglad: false },
  { titel: "Analyser", bas: "/analyser", typ: "Verktyg", utdrag: "AKM1-analyser av svenska aktier — så fungerar metoden", nycklar: "aktie analys akm1", speglad: false },
  { titel: "Bloggen", bas: "/blogg", typ: "Sida", utdrag: "Forskning och pedagogik från labbet", nycklar: "blogg artiklar", speglad: true },
  { titel: "Manifestet", bas: "/manifest", typ: "Sida", utdrag: "Vår undervisningsfilosofi", nycklar: "manifest filosofi", speglad: true },
  { titel: "Medlemskap", bas: "/medlemskap", typ: "Sida", utdrag: "Fas 1 gratis · Fas 2 · Fas 3", nycklar: "medlem pris fas", speglad: true },
  { titel: "Om oss", bas: "/om-oss", typ: "Sida", utdrag: "AK1A — vem vi är och hur vi arbetar", nycklar: "om kontakt", speglad: true },
  { titel: "Prenumeration", bas: "/prenumeration", typ: "Sida", utdrag: "Nyhetsbrev och notifieringar", nycklar: "nyhetsbrev prenumerera", speglad: true },
  { titel: "Transparens", bas: "/transparens", typ: "Sida", utdrag: "Källor, metod och öppenhet", nycklar: "källor metod öppenhet", speglad: true },
];

// ── Normalisering (samma mönster som src/lib/sokindex.ts) ────────────────────

/** Gemen, åä→a, ö→o, é→e, icke-ord bort — "Förvaltning" == "forvaltning". */
export function normaliseraSok(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åäàá]/g, "a")
    .replace(/[öø]/g, "o")
    .replace(/é/g, "e")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Källor (varje källa: try/catch → tomt — cachen är aldrig ett beroende) ───

/** Statiska sidor ur meny-registret — ENDAST gäst-punkter (publikt API). */
function statiskaPoster(): IndexPost[] {
  try {
    return MENY_REGISTER.flatMap((sektion) =>
      sektion.punkter
        // VÅG 122E-säkerhet: oautentiserat API visar bara gäst-innehåll.
        // B2B-grindade punkter ("AK1A PRO") syns bara när flaggan är på.
        .filter((p) => p.publik === "gast" && (!p.b2b || b2bAktiv()))
        .map((p) => ({
          titel: p.text,
          bas: p.lank,
          typ: p.typ === "verktyg" ? "Verktyg" : p.typ === "kursyta" ? "Kurs" : "Sida",
          utdrag: p.beskrivning ?? "",
          nycklar: p.nycklar ?? "",
          speglad: SPEGLADE_STATISKA.has(p.lank),
        })),
    );
  } catch {
    return [];
  }
}

/** Extrahera kursposter ur antingen sok-index- eller deep-courses-formatet. */
function kursPosterUr(arr: unknown): IndexPost[] {
  if (!Array.isArray(arr)) return [];
  const poster: IndexPost[] = [];
  for (const k of arr as Array<Record<string, unknown>>) {
    const slug = String(k?.slug ?? "");
    if (!slug) continue;
    poster.push({
      titel: String(k.title || k.titel || slug),
      bas: `/kurser/${encodeURIComponent(slug)}`,
      typ: "Kurs",
      utdrag: String(k.summary || "").slice(0, UTDARG_MAX),
      nycklar: [k.category, k.level, k.weight, slug].filter(Boolean).join(" "),
      // Alla kurser har speglar (public/speglar-slugar.json = hela kurslistan).
      speglad: true,
    });
  }
  return poster;
}

/**
 * Kurser: /sok-index.json först (75 kB), reserv deep-courses.json (17 MB —
 * destilleras självt, kor-sokindex-mönstret; sker max 1/h via cachen).
 */
function kursPoster(): IndexPost[] {
  try {
    const rå = JSON.parse(readFileSync(join(process.cwd(), "public", "sok-index.json"), "utf8"));
    const poster = kursPosterUr(rå?.kurser);
    if (poster.length > 0) return poster;
  } catch {
    // Nästa källa.
  }
  try {
    const rå = JSON.parse(readFileSync(join(process.cwd(), "public", "deep-courses.json"), "utf8"));
    const poster = kursPosterUr(Array.isArray(rå) ? rå : Object.entries(rå ?? {}).map(([slug, k]) => ({
      slug,
      ...(k as Record<string, unknown>),
    })));
    if (poster.length > 0) return poster;
  } catch {
    // Reserven tar vid i hamtaIndex.
  }
  return [];
}

/** Bloggposter ur data/blogg/*.json — samma källa som src/lib/content.ts. */
function bloggPoster(): IndexPost[] {
  try {
    const dir = join(process.cwd(), "data", "blogg");
    if (!existsSync(dir)) return [];
    const poster: IndexPost[] = [];
    for (const fil of readdirSync(dir)) {
      if (!fil.endsWith(".json")) continue;
      try {
        const p = JSON.parse(readFileSync(join(dir, fil), "utf8")) as Record<string, unknown>;
        const slug = String(p?.slug || fil.replace(/\.json$/, ""));
        poster.push({
          titel: String(p?.title || slug),
          bas: `/blogg/${encodeURIComponent(slug)}`,
          typ: "Blogg",
          utdrag: String(p?.description || "").slice(0, UTDARG_MAX),
          nycklar: [p?.pillar, ...(Array.isArray(p?.tags) ? (p.tags as unknown[]) : [])]
            .filter(Boolean)
            .join(" "),
          // Hela bloggen har speglar (speglar-slugar.json = alla blogg-slugar).
          speglad: true,
        });
      } catch {
        // Korrupt fil hopphas.
      }
    }
    return poster;
  } catch {
    return [];
  }
}

/**
 * Aktieanalyser ur data/analyses + data/export/analyses — getAnalyses-
 * mönstret (dedub per ticker). Analyser har inga en/ar-speglar ⇒ speglad
 * false (sv-URL oavsett språk — länken landar alltid på en riktig sida).
 */
function analysPoster(): IndexPost[] {
  const sett = new Set<string>();
  const poster: IndexPost[] = [];
  for (const dir of [join(process.cwd(), "data", "analyses"), join(process.cwd(), "data", "export", "analyses")]) {
    try {
      if (!existsSync(dir)) continue;
      for (const fil of readdirSync(dir)) {
        if (!fil.endsWith(".json")) continue;
        try {
          const a = JSON.parse(readFileSync(join(dir, fil), "utf8")) as Record<string, unknown>;
          const ticker = String(a?.ticker ?? "").trim();
          if (!ticker || sett.has(ticker)) continue;
          sett.add(ticker);
          poster.push({
            titel: `${String(a?.company || ticker)} (${ticker})`,
            bas: `/analyser/${encodeURIComponent(ticker)}`,
            typ: "Analys",
            utdrag: String(a?.motivation || a?.status || "").slice(0, UTDARG_MAX),
            nycklar: [ticker, a?.displayTicker, a?.sector].filter(Boolean).join(" "),
            speglad: false,
          });
        } catch {
          // Korrupt fil hopphas.
        }
      }
    } catch {
      // Katalog oläsbar — nästa katalog.
    }
  }
  return poster;
}

// ── Cachen (module-scope, EN inläsning, revalidering max varje timme) ────────

let cacheIndex: IndexPost[] | null = null;
let cacheTid = 0;
const REVALIDERA_MS = 60 * 60 * 1000;

/**
 * Indexet — cachat i minnet, revalideras tidigast varje timme. Miljöflaggan
 * AK1A_SOK_TVINGA_RESERV=1 kortsluter till reserven (testbarhet; kollas FÖRE
 * cachen så testen kan köra både vägarna i samma process).
 * Faller ALLA källor bort returneras reserven — aldrig null, aldrig kast.
 */
export function hamtaIndex(): IndexPost[] {
  if (process.env.AK1A_SOK_TVINGA_RESERV === "1") return RESERV;
  const nu = Date.now();
  if (cacheIndex !== null && nu - cacheTid < REVALIDERA_MS) return cacheIndex;
  let poster = [...statiskaPoster(), ...kursPoster(), ...bloggPoster(), ...analysPoster()];
  if (poster.length === 0) poster = RESERV; // reservlösningen — söken svarar alltid
  cacheIndex = poster;
  cacheTid = nu;
  return poster;
}

// ── Rankning ─────────────────────────────────────────────────────────────────

/** Poängsätt en post mot en normaliserad fråga. Prefix > substräng. */
function poang(post: IndexPost, fraga: string): number {
  const t = normaliseraSok(post.titel);
  const b = normaliseraSok(post.utdrag);
  const n = normaliseraSok(post.nycklar);
  if (!fraga) return 0;
  if (t === fraga) return 100;
  if (t.startsWith(fraga)) return 80;
  if (t.includes(fraga)) return 60;
  if (n.includes(fraga) || b.includes(fraga)) return 30;
  // alla orden i frågan träffar någonstans (månghit på flerordiga frågor)
  const ord = fraga.split(" ").filter(Boolean);
  if (ord.length > 1 && ord.every((o) => t.includes(o) || n.includes(o) || b.includes(o))) return 20;
  return 0;
}

/** URL för språket: speglade poster får /en- eller /ar-prefix, övriga sv. */
function urlForLang(post: IndexPost, lang: "sv" | "en" | "ar"): string {
  if (lang === "sv" || !post.speglad) return post.bas;
  return post.bas === "/" ? `/${lang}/` : `/${lang}${post.bas}`;
}

// ── Publikt API ──────────────────────────────────────────────────────────────

/**
 * Sök i det egna innehållet. Returnerar max `limit` träffar, rankade
 * (prefix > substräng > nycklar > alla ord). Kastar ALDRIG.
 */
export function sokServerSide(
  fraga: string,
  lang: "sv" | "en" | "ar" = "sv",
  limit = 20,
): SokTräff[] {
  const f = normaliseraSok(fraga).slice(0, 100);
  if (!f) return [];
  return hamtaIndex()
    .map((p) => ({ p, po: poang(p, f) }))
    .filter((x) => x.po > 0)
    .sort((a, b) => b.po - a.po || a.p.titel.localeCompare(b.p.titel))
    .slice(0, limit)
    .map(({ p }) => ({
      titel: p.titel,
      url: urlForLang(p, lang),
      typ: p.typ,
      utdrag: p.utdrag,
    }));
}
