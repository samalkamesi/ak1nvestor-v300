import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * /api/admin/bookings — bokningsadministration.
 *
 * SKYDD (VÅG 63 bygg-1, O4-robusthet §5): requireAdmin på ALLA metoder —
 * x-admin-password (timing-säkert, fas2-access-mönstret). Tidigare var
 * rutten helt öppen: PATCH kastade dessutom ReferenceError (SUPABASE_URL/
 * SUPABASE_KEY/rest fanns inte i scopet) → bokningsbekräftelsen var död.
 *
 * PUT finns som alias för AdminAnalysisManager som anropar PUT { bookingId,
 * status, meetingLink } — samma skrivväg som PATCH { id, ... }.
 */

/** GET /api/admin/bookings — hämta alla bokningar */
export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ bookings: [] });
  }

  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/bookings?select=*,members(id,email,name,phone,member_type)&order=created_at.desc`,
      { headers: rest.headers }
    );
    const bookings = await res.json();
    return NextResponse.json({ bookings: bookings || [] });
  } catch (e: any) {
    return NextResponse.json({ bookings: [], error: e.message }, { status: 500 });
  }
}

/** PATCH /api/admin/bookings — uppdatera bokning { id, status, confirmedTime?, meetingLink? } */
export async function PATCH(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  try {
    const body = await req.json();
    const { id, status, confirmedTime, meetingLink } = body;

    const rest = getSupabaseRest();
    if (!id || !status) {
      return NextResponse.json({ error: "id och status krävs" }, { status: 400 });
    }
    if (!rest) {
      return NextResponse.json({ error: "Supabase ej konfigurerad" }, { status: 503 });
    }

    const updateBody: any = { status };
    if (confirmedTime) updateBody.confirmed_time = confirmedTime;
    if (meetingLink) updateBody.meeting_link = meetingLink;

    const res = await fetch(`${rest.origin}/rest/v1/bookings?id=eq.${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(updateBody),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Supabase ${res.status}` }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** PUT /api/admin/bookings — alias: { bookingId, status, meetingLink? } → PATCH-vägen */
export async function PUT(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  try {
    const body = await req.json();
    const { bookingId, id, status, confirmedTime, meetingLink } = body;
    const riktigId = id ?? bookingId; // klienten (AdminAnalysisManager) skickar bookingId

    const rest = getSupabaseRest();
    if (!riktigId || !status) {
      return NextResponse.json({ error: "bookingId och status krävs" }, { status: 400 });
    }
    if (!rest) {
      return NextResponse.json({ error: "Supabase ej konfigurerad" }, { status: 503 });
    }

    const updateBody: any = { status };
    if (confirmedTime) updateBody.confirmed_time = confirmedTime;
    if (meetingLink) updateBody.meeting_link = meetingLink;

    const res = await fetch(`${rest.origin}/rest/v1/bookings?id=eq.${encodeURIComponent(String(riktigId))}`, {
      method: "PATCH",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(updateBody),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Supabase ${res.status}` }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
