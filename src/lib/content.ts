/**
 * Server-side innehållslager — läser statisk JSON vid build/render.
 * Ingen Prisma, ingen databas: kurser, analyser, case studies och blogg
 * ligger som filer och renderas till crawlbara sidor.
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();

export type CourseChapter = {
  num: number;
  minutes: number;
  title: string;
  intro: string;
  blocks: Array<{ type: string; content: string; [k: string]: unknown }>;
};

export type Course = {
  slug: string;
  category: string;
  weight?: string;
  chapterCount: number;
  totalMinutes: number;
  title: string;
  summary: string;
  minutes: number;
  xp: number;
  level: string;
  learn: string;
  why: string;
  chapters_list: string[];
  history?: string;
  chapters: CourseChapter[];
  lynchSection?: string;
  grahamSection?: string;
  ak1Section?: string;
};

export type Analysis = {
  ticker: string;
  displayTicker?: string;
  company: string;
  exchange?: string;
  sector?: string;
  isin?: string;
  currency?: string;
  verified?: string;
  analysisDate?: string;
  source?: string;
  status?: string;
  recommendation?: string;
  motivation?: string;
  akm1?: { total?: number; [k: string]: unknown };
  waveSummary?: unknown;
  scenarios?: unknown;
  priceLevels?: unknown;
  [k: string]: unknown;
};

export type CaseStudy = {
  id: string;
  type: string;
  company: string;
  ticker?: string | null;
  title: string;
  description?: string | null;
  akm1Score?: number | null;
  decisiveVars?: string | null;
  sector?: string | null;
  year?: number | null;
  outcome?: string | null;
  lesson?: string | null;
  isIllustrative?: boolean;
  createdAt?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  pillar: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  tags: string[];
  /** Markdown-lik innehåll: ## rubriker, stycken, - listor */
  body: string;
};

// ── Kurser ──────────────────────────────────────────────────────────────────

let courseCache: Record<string, Course> | null = null;

export function getCourses(): Record<string, Course> {
  if (courseCache) return courseCache;
  try {
    const raw = readFileSync(join(ROOT, "public", "deep-courses.json"), "utf8");
    courseCache = JSON.parse(raw);
  } catch {
    courseCache = {};
  }
  return courseCache!;
}

export function getCourseList(): Course[] {
  return Object.values(getCourses()).sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getCourse(slug: string): Course | null {
  return getCourses()[slug] ?? null;
}

// ── Bokkanon ─────────────────────────────────────────────────────────────────

export type Bok = {
  id: string;
  titel: string;
  author: string;
  year: number;
  kat: string;
  niva: number;
  why: string;
  ak: string[];
  ts: string[];
  lessons: string[];
  tier: number;
  status: string;
};

let bokCache: Bok[] | null = null;

export function getBokkanon(): Bok[] {
  if (bokCache) return bokCache;
  try {
    const raw = readFileSync(join(ROOT, "data", "bokkanon.json"), "utf8");
    bokCache = JSON.parse(raw).bocker || [];
  } catch {
    bokCache = [];
  }
  return bokCache!;
}

// ── Analyser ────────────────────────────────────────────────────────────────

export function getAnalyses(): Analysis[] {
  const dirs = [join(ROOT, "data", "analyses"), join(ROOT, "data", "export", "analyses")];
  const seen = new Set<string>();
  const list: Analysis[] = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      try {
        const a = JSON.parse(readFileSync(join(dir, file), "utf8")) as Analysis;
        if (a?.ticker && !seen.has(a.ticker)) {
          seen.add(a.ticker);
          list.push(a);
        }
      } catch {}
    }
  }
  return list;
}

export function getAnalysis(ticker: string): Analysis | null {
  const norm = decodeURIComponent(ticker).toUpperCase();
  return getAnalyses().find((a) => a.ticker.toUpperCase() === norm) ?? null;
}

// ── Case studies ────────────────────────────────────────────────────────────

export function getCaseStudies(): CaseStudy[] {
  try {
    return JSON.parse(readFileSync(join(ROOT, "data", "export", "case-studies.json"), "utf8"));
  } catch {
    return [];
  }
}

export function getCaseStudy(id: string): CaseStudy | null {
  return getCaseStudies().find((c) => c.id === id) ?? null;
}

// ── Blogg ───────────────────────────────────────────────────────────────────

export function getBlogPosts(): BlogPost[] {
  const dir = join(ROOT, "data", "blogg");
  if (!existsSync(dir)) return [];
  // Per-fils felhantering (kf1): ett halvskrivet/trasigt JSON-filer eller en
  // främmande fil i data/blogg/ får ALDRIG kasta hela bloggen i 500/0-läge —
  // getAnalyses-mönstret, men med formkontroll: fälten listan + detaljsidorna
  // renderar (slug/title/description/pillar/author/publishedAt/
  // readingMinutes/tags/body) måste finnas, annars hoppar filen över med
  // larm i pm2-loggen. Ingen cache: ISR (revalidate 3600) ska läsa disken
  // färskt vid varje omrendering — nya inlägg syns inom en timme utan bygge.
  const poster: BlogPost[] = [];
  const sesattaSlugs = new Set<string>();
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    try {
      const rå = JSON.parse(readFileSync(join(dir, f), "utf8")) as unknown;
      const giltig =
        typeof rå === "object" &&
        rå !== null &&
        typeof (rå as BlogPost).slug === "string" &&
        typeof (rå as BlogPost).title === "string" &&
        typeof (rå as BlogPost).description === "string" &&
        typeof (rå as BlogPost).pillar === "string" &&
        typeof (rå as BlogPost).author === "string" &&
        typeof (rå as BlogPost).publishedAt === "string" &&
        typeof (rå as BlogPost).readingMinutes === "number" &&
        Array.isArray((rå as BlogPost).tags) &&
        typeof (rå as BlogPost).body === "string";
      if (!giltig) {
        console.warn(`[blogg] hoppar över ${f}: inte en giltig BlogPost (kf1)`);
        continue;
      }
      const post = rå as BlogPost;
      // Dublettslug: sorteringen nedan är deterministisk, men React-nycklar
      // och generateStaticParams kräver unika slug:ar — första förekomsten vinner.
      if (sesattaSlugs.has(post.slug)) {
        console.warn(`[blogg] hoppar över ${f}: dublettslug "${post.slug}" (kf1)`);
        continue;
      }
      sesattaSlugs.add(post.slug);
      poster.push(post);
    } catch (e) {
      console.warn(
        `[blogg] hoppar över ${f}: ogiltig JSON (${e instanceof Error ? e.message : String(e)}) (kf1)`,
      );
    }
  }
  return poster.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getBlogPost(slug: string): BlogPost | null {
  return getBlogPosts().find((p) => p.slug === slug) ?? null;
}
