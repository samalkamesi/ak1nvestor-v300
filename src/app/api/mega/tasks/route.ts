import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabaseAdmin, isSupabaseConfigured, TABLES } from "@/lib/supabase";

export const runtime = "nodejs";

/** GET /api/mega/tasks — list all mega-project tasks (from Supabase or local DB) */
export async function GET() {
  // Try Supabase first (works on Vercel)
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.TASKS)
        .select("*")
        .order("num", { ascending: true });

      if (!error && data && data.length > 0) {
        // Transform Supabase format to app format
        const tasks = data.map((t: any) => ({
          id: t.id,
          num: t.num,
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority,
          status: t.status,
          organOwner: t.organ_owner,
          estimatedXp: t.estimated_xp,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }));
        return NextResponse.json({ tasks });
      }
    } catch {
      // Fall through to local DB
    }
  }

  // Fall back to local DB (works on sandbox)
  try {
    const tasks = await db.megaTask.findMany({ orderBy: { num: "asc" } });
    return NextResponse.json({ tasks });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

/** POST /api/mega/tasks — create or update a task */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { num, title, description, category, priority, status, organOwner, estimatedXp } = body;
    if (!num || !title) {
      return NextResponse.json({ error: "num, title required" }, { status: 400 });
    }

    // Try Supabase first
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from(TABLES.TASKS)
        .upsert({
          num,
          title,
          description,
          category,
          priority: priority || "MEDEL",
          status: status || "pending",
          organ_owner: organOwner,
          estimated_xp: estimatedXp,
        }, { onConflict: "num" })
        .select()
        .single();

      if (!error) {
        return NextResponse.json({ task: data });
      }
    }

    // Fall back to local DB
    const task = await db.megaTask.upsert({
      where: { num },
      create: { num, title, description, category, priority: priority || "MEDEL", status: status || "pending", organOwner, estimatedXp },
      update: { title, description, category, priority, status, organOwner, estimatedXp },
    });
    return NextResponse.json({ task });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

/** PATCH /api/mega/tasks — update task status */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { num, status } = body;
    if (!num || !status) {
      return NextResponse.json({ error: "num, status required" }, { status: 400 });
    }

    // Try Supabase first
    if (isSupabaseConfigured && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from(TABLES.TASKS)
        .update({ status })
        .eq("num", num);

      if (!error) {
        return NextResponse.json({ success: true });
      }
    }

    // Fall back to local DB
    const task = await db.megaTask.update({
      where: { num },
      data: { status },
    });
    return NextResponse.json({ task });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
