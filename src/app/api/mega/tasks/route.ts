import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/mega/tasks — list all mega-project tasks */
export async function GET() {
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
    const task = await db.megaTask.update({
      where: { num },
      data: { status },
    });
    return NextResponse.json({ task });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
