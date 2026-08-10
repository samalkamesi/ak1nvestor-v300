/** Type definitions for deep courses. Data is loaded via /api/kurs/[slug]. */

export interface DeepChapterBlock {
  type: "text" | "insight" | "definition";
  content: string;
}

export interface DeepChapter {
  num: number;
  minutes: number;
  title: string;
  intro: string;
  blocks: DeepChapterBlock[];
}

export interface DeepCourse {
  slug: string;
  variableId: string;
  category: string;
  weight: string;
  chapterCount: number;
  totalMinutes: number;
  title: string;
  summary: string;
  minutes: number;
  xp: number;
  level: string;
  learn: string;
  why: string;
  chapters_list: { num: number; title: string; minutes: number }[];
  history?: {
    origin: string;
    evolution: string;
    modern: string;
  };
  chapters: DeepChapter[];
}

/** Map slug → variableId (e.g. "v01-forsaljningstillvaxt" → "V01") */
export function slugToVariableId(slug: string): string {
  const match = slug.match(/^v(\d+)/);
  return match ? `V${match[1].padStart(2, "0")}` : slug.toUpperCase();
}

/** All 20 course slugs (lightweight — no data import). */
export const allCourseSlugs = [
  "v01-forsaljningstillvaxt",
  "v02-arr-tillvaxt",
  "v03-intaktsdiversifiering",
  "v04-ps",
  "v05-pb",
  "v06-ev-ebitda",
  "v07-bruttomarginal",
  "v08-ebitda-marginal",
  "v09-roe",
  "v10-skuldsattningsgrad",
  "v11-likviditet",
  "v12-intaktsstabilitet",
  "v13-patent-ip",
  "v14-varumarke",
  "v15-natverkseffekter",
  "v16-produktlanseringar",
  "v17-avtal-partnerskap",
  "v18-regulatoriska",
  "v19-kapitalforbranning",
  "v20-aterekop-egna-aktier",
];

/** Check if a slug is a valid deep course slug. */
export function isDeepCourseSlug(slug: string): boolean {
  return allCourseSlugs.includes(slug);
}

/** Fetch a deep course by slug from the API. */
export async function fetchDeepCourse(slug: string): Promise<DeepCourse | null> {
  try {
    const res = await fetch(`/api/kurs/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    return { ...data, variableId: slugToVariableId(slug) };
  } catch {
    return null;
  }
}
