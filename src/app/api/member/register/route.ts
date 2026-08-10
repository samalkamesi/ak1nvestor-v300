import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** POST /api/member/register — registrera ny medlem (eller logga in om email finns). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, memberType = "free", sessionId } = body;

    if (!email) {
      return NextResponse.json({ error: "email krävs" }, { status: 400 });
    }

    // Check if member exists
    let member = await db.member.findUnique({ where: { email } });

    if (member) {
      // Update lastLogin
      member = await db.member.update({
        where: { id: member.id },
        data: {
          lastLoginAt: new Date(),
          ...(sessionId && { sessionId }),
          ...(name && { name }),
          ...(phone && { phone }),
        },
      });
      return NextResponse.json({ member, isNew: false });
    }

    // Create new member
    member = await db.member.create({
      data: {
        email,
        name: name || null,
        phone: phone || null,
        memberType,
        sessionId: sessionId || null,
        lastLoginAt: new Date(),
      },
    });

    // Log activity
    try {
      await db.userActivity.create({
        data: {
          sessionId: sessionId || email,
          action: "member_registered",
          section: "member",
          targetType: "member",
          targetId: member.id,
          metadata: JSON.stringify({ email, memberType }),
        },
      });
    } catch {}

    return NextResponse.json({ member, isNew: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** GET /api/member/register?email=xxx — hämta medlem. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email krävs" }, { status: 400 });
    }

    const member = await db.member.findUnique({
      where: { email },
      include: {
        portfolios: { include: { holdings: true }, orderBy: { createdAt: "desc" } },
        analyses: { where: { isPublished: true }, orderBy: { createdAt: "desc" } },
        bookings: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Medlem hittades inte" }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
