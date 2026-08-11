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

/** GET /api/admin/bookings — hämta alla bokningar */
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ bookings: [] });
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*,members(id,email,name,phone,member_type)&order=created_at.desc`,
      { headers: HEADERS() }
    );
    const bookings = await res.json();
    return NextResponse.json({ bookings: bookings || [] });
  } catch (e: any) {
    return NextResponse.json({ bookings: [], error: e.message }, { status: 500 });
  }
}

/** PATCH /api/admin/bookings — uppdatera bokning */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, confirmedTime, meetingLink } = body;

    if (!id || !status || !SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: "Missing params or Supabase" }, { status: 400 });
    }

    const updateBody: any = { status };
    if (confirmedTime) updateBody.confirmed_time = confirmedTime;
    if (meetingLink) updateBody.meeting_link = meetingLink;

    await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${id}`, {
      method: "PATCH",
      headers: HEADERS(),
      body: JSON.stringify(updateBody),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
