import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { isSupabaseConfigured } from "./supabase";

/**
 * Arkitektur efter Prisma-avlusningen: statisk JSON är primärkälla,
 * Supabase är molnlager för medlemsdata. Detta är den status som
 * /api/backend rapporterar.
 */
export function getBackendStatus() {
  let courses = 0;
  try {
    courses = Object.keys(
      JSON.parse(readFileSync(join(process.cwd(), "public", "deep-courses.json"), "utf8"))
    ).length;
  } catch {}

  return {
    ok: true,
    backend: isSupabaseConfigured ? "supabase+json" : "json-files",
    prisma: false,
    supabaseConfigured: isSupabaseConfigured,
    contentStats: {
      courses,
      analyses:
        countJsonEntries(join(process.cwd(), "data", "analyses")) ||
        countJsonEntries(join(process.cwd(), "data", "export", "analyses")),
      caseStudies: countJsonEntries(join(process.cwd(), "data", "export", "case-studies.json")),
    },
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
