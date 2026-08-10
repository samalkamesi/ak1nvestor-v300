import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** POST /api/booking — klient bokar 15-30 min genomgång. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, analysisId, type = "review_30", requestedTime, notes } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId krävs" }, { status: 400 });
    }

    const member = await db.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return NextResponse.json({ error: "Medlem hittades inte" }, { status: 404 });
    }

    // Verify member has premium/pro
    if (member.memberType === "free") {
      return NextResponse.json({
        error: "Bokning kräver premium-medlemskap. Uppgradera för att boka 15-30 min genomgång.",
        upgradeRequired: true,
      }, { status: 403 });
    }

    const booking = await db.booking.create({
      data: {
        memberId,
        analysisId: analysisId || null,
        type,
        requestedTime: requestedTime ? new Date(requestedTime) : null,
        notes: notes || null,
        status: "requested",
      },
    });

    // Log system event for admin
    try {
      await db.systemEvent.create({
        data: {
          type: "booking_requested",
          severity: "info",
          message: `Ny bokningsförfrågan: ${member.email} — ${type}`,
          details: JSON.stringify({ bookingId: booking.id, memberId }),
          source: "member",
        },
      });
    } catch {}

    return NextResponse.json({ booking, member });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** GET /api/booking?memberId=xxx — hämta medlemmens bokningar. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const memberId = url.searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "memberId krävs" }, { status: 400 });
    }

    const bookings = await db.booking.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
