import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export const runtime = "nodejs";

/** GET /api/admin/activity — hämta klientaktivitet för admin-dashboard. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || "100"), 500);
    const action = url.searchParams.get("action");
    const section = url.searchParams.get("section");
    const since = url.searchParams.get("since");

    const where: any = {};
    if (action) where.action = action;
    if (section) where.section = section;
    if (since) where.createdAt = { gte: new Date(since) };

    const activities = await db.userActivity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ activities, count: activities.length });
  } catch (err: any) {
    return NextResponse.json({ error: "Kunde inte hämta aktivitet", detail: err.message }, { status: 500 });
  }
}

/** POST /api/admin/activity — logga klientaktivitet (anropas från klienten). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, action, section, targetType, targetId, metadata } = body;

    if (!sessionId || !action) {
      return NextResponse.json({ error: "sessionId och action krävs" }, { status: 400 });
    }

    const h = await headers();
    const userAgent = h.get("user-agent") || undefined;

    const forwarded = h.get("x-forwarded-for");
    let ipHash: string | undefined;
    if (forwarded) {
      const crypto = await import("crypto");
      ipHash = crypto.createHash("sha256").update(forwarded).digest("hex").slice(0, 16);
    }

    const activity = await db.userActivity.create({
      data: {
        sessionId,
        action,
        section: section || null,
        targetType: targetType || null,
        targetId: targetId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        userAgent,
        ipHash,
      },
    });

    return NextResponse.json({ ok: true, id: activity.id });
  } catch (err: any) {
    return NextResponse.json({ error: "Kunde inte logga", detail: err.message }, { status: 500 });
  }
}
