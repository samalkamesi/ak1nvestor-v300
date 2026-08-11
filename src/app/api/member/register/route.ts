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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, memberType = "free", sessionId } = body;

    if (!email) {
      return NextResponse.json({ error: "email krävs" }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: "Supabase inte konfigurerad. Lägg till NEXT_PUBLIC_SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY i Vercel Environment Variables." }, { status: 500 });
    }

    // Check if member exists in Supabase
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(email)}&select=*`,
      { headers: HEADERS() }
    );
    const existing = await checkRes.json();

    if (existing && existing.length > 0) {
      // Update lastLogin
      const member = existing[0];
      await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${member.id}`, {
        method: "PATCH",
        headers: HEADERS(),
        body: JSON.stringify({
          last_login_at: new Date().toISOString(),
          ...(name && { name }),
          ...(phone && { phone }),
        }),
      });
      return NextResponse.json({ member: { ...member, last_login_at: new Date().toISOString() }, isNew: false });
    }

    // Create new member in Supabase
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/members`, {
      method: "POST",
      headers: { ...HEADERS(), Prefer: "return=representation" },
      body: JSON.stringify({
        email,
        name: name || null,
        phone: phone || null,
        member_type: memberType,
        session_id: sessionId || null,
      }),
    });
    
    if (!createRes.ok) {
      const errText = await createRes.text();
      return NextResponse.json({ error: `Supabase error: ${createRes.status} ${errText.substring(0, 200)}` }, { status: 500 });
    }
    
    const newMember = await createRes.json();
    return NextResponse.json({ member: newMember[0] || newMember, isNew: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) return NextResponse.json({ error: "email krävs" }, { status: 400 });

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ member: null });
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/members?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
      { headers: HEADERS() }
    );
    const data = await res.json();
    return NextResponse.json({ member: data?.[0] || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
