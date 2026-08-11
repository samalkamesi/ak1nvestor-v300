import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** POST /api/member/register — registrera eller logga in medlem via Supabase */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, memberType = "free", sessionId } = body;

    if (!email) {
      return NextResponse.json({ error: "email krävs" }, { status: 400 });
    }

    // Try Supabase
    if (SUPABASE_URL && SUPABASE_KEY) {
      // Check if member exists
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(email)}&select=*`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const existing = await checkRes.json();

      if (existing && existing.length > 0) {
        // Update lastLogin
        const member = existing[0];
        await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${member.id}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            last_login_at: new Date().toISOString(),
            ...(name && { name }),
            ...(phone && { phone }),
            ...(sessionId && { session_id: sessionId }),
          }),
        });
        return NextResponse.json({ member: { ...member, last_login_at: new Date().toISOString() }, isNew: false });
      }

      // Create new member
      const createRes = await fetch(`${SUPABASE_URL}/rest/v1/members`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          email,
          name: name || null,
          phone: phone || null,
          member_type: memberType,
          session_id: sessionId || null,
        }),
      });
      const newMember = await createRes.json();
      return NextResponse.json({ member: newMember[0] || newMember, isNew: true });
    }

    return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** GET /api/member/register?email=xxx — hämta medlem */
export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email krävs" }, { status: 400 });
    }

    if (SUPABASE_URL && SUPABASE_KEY) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return NextResponse.json({ member: data[0] });
      }
      return NextResponse.json({ member: null });
    }

    return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
