import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";

/** POST /api/booking — skapa bokning */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, type, requestedTime, notes } = body;

    if (!memberId || !type) {
      return NextResponse.json({ error: "memberId och type krävs" }, { status: 400 });
    }

    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
    }

    const res = await fetch(`${rest.origin}/rest/v1/bookings`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        member_id: memberId,
        type: type,
        requested_time: requestedTime || null,
        status: "requested",
        notes: notes || null,
      }),
    });
    const booking = await res.json();
    return NextResponse.json({ booking: booking[0] || booking });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** GET /api/booking?memberId=xxx — hämta bokningar */
export async function GET(req: NextRequest) {
  try {
    const memberId = new URL(req.url).searchParams.get("memberId");

    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ bookings: [] });
    }

    let url = `${rest.origin}/rest/v1/bookings?select=*&order=created_at.desc`;
    if (memberId) {
      url += `&member_id=eq.${memberId}`;
    }

    const res = await fetch(url, { headers: rest.headers });
    const bookings = await res.json();
    return NextResponse.json({ bookings: bookings || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, bookings: [] }, { status: 500 });
  }
}

/** PATCH /api/booking — uppdatera bokning (confirm/cancel) */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, confirmedTime, meetingLink } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id och status krävs" }, { status: 400 });
    }

    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
    }

    const updateBody: any = { status };
    if (confirmedTime) updateBody.confirmed_time = confirmedTime;
    if (meetingLink) updateBody.meeting_link = meetingLink;

    await fetch(`${rest.origin}/rest/v1/bookings?id=eq.${id}`, {
      method: "PATCH",
      headers: rest.headers,
      body: JSON.stringify(updateBody),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
