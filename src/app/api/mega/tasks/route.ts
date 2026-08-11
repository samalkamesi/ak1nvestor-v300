import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** GET /api/mega/tasks — list all tasks (from Supabase REST or local JSON) */
export async function GET() {
  // Try Supabase first
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/mega_tasks?select=*&order=num.asc`, {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const tasks = data.map((t: any) => ({
            id: t.id, num: t.num, title: t.title, description: t.description,
            category: t.category, priority: t.priority, status: t.status,
            organOwner: t.organ_owner, estimatedXp: t.estimated_xp,
            createdAt: t.created_at, updatedAt: t.updated_at,
          }));
          return NextResponse.json({ tasks });
        }
      }
    } catch {
      // Fall through to JSON file
    }
  }

  // Fall back to JSON file (works everywhere)
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/export/mega-tasks.json"), "utf-8");
    const tasks = JSON.parse(raw);
    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json({ tasks: [], error: "No task data found" }, { status: 500 });
  }
}
