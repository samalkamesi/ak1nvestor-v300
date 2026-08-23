import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";

/** GET /api/admin/activity — hämta aktivitetslogg */
export async function GET(req: NextRequest) {
  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ activities: [] });
  }

  try {
    const limit = new URL(req.url).searchParams.get("limit") || "50";
    const res = await fetch(
      `${rest.origin}/rest/v1/user_activities?select=*&order=created_at.desc&limit=${limit}`,
      { headers: rest.headers }
    );
    const activities = await res.json();
    return NextResponse.json({ activities: activities || [] });
  } catch (e: any) {
    return NextResponse.json({ activities: [], error: e.message }, { status: 500 });
  }
}

/** POST /api/admin/activity — logga aktivitet */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, action, section, targetType, targetId, metadata, userAgent, ipHash } = body;

    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ success: true }); // Silent fail — don't block user
    }

    await fetch(`${rest.origin}/rest/v1/user_activities`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        session_id: sessionId || "unknown",
        action: action || "unknown",
        section: section || null,
        target_type: targetType || null,
        target_id: targetId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        user_agent: userAgent || null,
        ip_hash: ipHash || null,
      }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // Silent fail
  }
}
