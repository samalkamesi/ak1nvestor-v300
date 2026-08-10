import { NextRequest, NextResponse } from "next/server";
import { readFileSync, statSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

let cache: Record<string, any> | null = null;
let cacheMtime = 0;

function loadCourses(): Record<string, any> {
  try {
    const filePath = join(process.cwd(), "public", "deep-courses.json");
    const mtime = statSync(filePath).mtimeMs;
    // Invalidate cache if file changed
    if (cache && mtime === cacheMtime) return cache;
    const raw = readFileSync(filePath, "utf-8");
    cache = JSON.parse(raw);
    cacheMtime = mtime;
    return cache!;
  } catch {
    return {};
  }
}

/** GET /api/kurs/[slug] — returns a single deep course by slug. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const courses = loadCourses();
  const course = courses[slug];
  if (!course) {
    return NextResponse.json({ error: "Kurs hittades inte" }, { status: 404 });
  }
  return NextResponse.json(course);
}
