import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const HEADERS = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
});

/** GET /api/admin/activity — hämta aktivitetslogg */
export async function GET(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ activities: [] });
  }

  try {
    const limit = new URL(req.url).searchParams.get("limit") || "50";
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_activities?select=*&order=created_at.desc&limit=${limit}`,
      { headers: HEADERS() }
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

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ success: true }); // Silent fail — don't block user
    }

    await fetch(`${SUPABASE_URL}/rest/v1/user_activities`, {
      method: "POST",
      headers: { ...HEADERS(), Prefer: "return=minimal" },
      body: JSON.stringify({
        session_id: sessionId || "unknown",
        activity_type: action || "unknown",
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
