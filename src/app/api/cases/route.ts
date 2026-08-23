import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/cases — list all case studies from JSON */
export async function GET() {
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/export/case-studies.json"), "utf-8");
    const cases = JSON.parse(raw);
    return NextResponse.json({ cases });
  } catch {
    return NextResponse.json({ cases: [] });
  }
}

/** POST /api/cases — create (not supported on Vercel without DB) */
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Use Supabase dashboard to create case studies" }, { status: 501 });
}
