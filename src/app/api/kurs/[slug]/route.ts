import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

let cache: Record<string, any> | null = null;

function loadCourses(): Record<string, any> {
  if (cache) return cache;
  try {
    const filePath = join(process.cwd(), "public", "deep-courses.json");
    const raw = readFileSync(filePath, "utf-8");
    cache = JSON.parse(raw);
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
