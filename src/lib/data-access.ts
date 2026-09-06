import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { isSupabaseConfigured } from "./supabase";

/**
 * Arkitektur efter Prisma-avlusningen: statisk JSON är primärkälla,
 * Supabase är molnlager för medlemsdata. Detta är den status som
 * /api/backend rapporterar.
 *
 * PRESTANDA (o1 #3b): contentStats läser + parsar 17,4 MB
 * deep-courses.json — det cacheas i en modulvariabel (samma mönster som
 * courseCache i src/lib/content.ts) så filen bara berörs en gång per
 * process. checkedAt beräknas per anrop som förr.
 */
let contentStatsCache: ReturnType<typeof raknaContentStats> | null = null;

function raknaContentStats() {
  let courses = 0;
  try {
    courses = Object.keys(
      JSON.parse(readFileSync(join(process.cwd(), "public", "deep-courses.json"), "utf8"))
    ).length;
  } catch {}

  return {
    courses,
    analyses:
      countJsonEntries(join(process.cwd(), "data", "analyses")) ||
      countJsonEntries(join(process.cwd(), "data", "export", "analyses")),
    caseStudies: countJsonEntries(join(process.cwd(), "data", "export", "case-studies.json")),
  };
}

export function getBackendStatus() {
  if (!contentStatsCache) contentStatsCache = raknaContentStats();

  return {
    ok: true,
    backend: isSupabaseConfigured ? "supabase+json" : "json-files",
    prisma: false,
    supabaseConfigured: isSupabaseConfigured,
    contentStats: contentStatsCache,
    checkedAt: new Date().toISOString(),
  };
}

function countJsonEntries(p: string): number {
  try {
    if (!existsSync(p)) return 0;
    const parsed = JSON.parse(readFileSync(p, "utf8"));
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && typeof parsed === "object") return Object.keys(parsed).length;
    return 0;
  } catch {
    return 0;
  }
}
