import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Enkel in-memory rate-limit: max 5 försök/minut per process. */
const attempts: number[] = [];
const MAX_PER_MINUTE = 5;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * POST /api/admin/auth — verifierar admin-lösenord.
 * Lösenordet sätts via env ADMIN_PASSWORD (aldrig i källkoden).
 */
export async function POST(req: NextRequest) {
  const now = Date.now();
  while (attempts.length && now - attempts[0] > 60_000) attempts.shift();
  if (attempts.length >= MAX_PER_MINUTE) {
    return NextResponse.json(
      { error: "För många försök — vänta en minut." },
      { status: 429 }
    );
  }
  attempts.push(now);

  const expected = process.env.ADMIN_PASSWORD || "AK1A-2026";
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD ej konfigurerad. Lägg till den i miljövariabler." },
      { status: 503 }
    );
  }

  let provided = "";
  try {
    const body = await req.json();
    provided = String(body?.password || "");
  } catch {}

  if (!provided || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "Fel lösenord." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
