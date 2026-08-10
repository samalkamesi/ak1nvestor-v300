import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/admin/bookings — lista alla bokningar. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const bookings = await db.booking.findMany({
      where,
      include: { member: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** PUT /api/admin/bookings — bekräfta/avboka bokning. */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, status, confirmedTime, meetingLink, notes } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId krävs" }, { status: 400 });
    }

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: {
        ...(status && { status }),
        ...(confirmedTime && { confirmedTime: new Date(confirmedTime) }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(notes !== undefined && { notes }),
      },
      include: { member: true },
    });

    return NextResponse.json({ booking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
