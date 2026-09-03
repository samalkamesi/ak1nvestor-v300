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
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as BlogPost)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getBlogPost(slug: string): BlogPost | null {
  return getBlogPosts().find((p) => p.slug === slug) ?? null;
}
