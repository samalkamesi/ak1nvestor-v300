import { NextResponse } from "next/server";

import { ADMIN_SESSION_KAKA } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/logout — SESSIONSUTLOGGNING (VÅG 83, ADMIN-MEGA steg 5 —
 * STYRELSE-VAG83-ROLLER.md §A1). ENDAST POST (ingen GET/PUT-handler finns
 * — Next svarar 405 på övriga metoder).
 *
 * POST → tömmer sessions-cookien (maxAge 0, samma attribut) och svarar
 * { ok: true }. Idempotent: kräver INTE giltig session — att logga ut utan
 * att vara inloggad är ett lyckat utloggningsläge, inget läckage.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_KAKA, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
