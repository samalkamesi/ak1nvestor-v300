import { NextRequest, NextResponse } from "next/server";
import { publiceraOrganEvent } from "@/lib/organ-event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/tracer — FRIVILLIG delning av beteendeprofil (organ/tracer).
 *
 * Kontrakt: { elevId, samtycke: true, sammanfattning: { aktivTid, toppIntresse } }.
 * Samtyckeskravet är hårt: raporten publiceras ENDAST när eleven aktivt
 * valt att dela (frivillig knapp på Min Sida — knappen är ännu ej byggd,
 * spårad i MEGA_PLAN; denna endpoint ligger redo).
 *
 * Skriver EN OrganEvent-rad (system_events via publiceraOrganEvent —
 * bounded av retention-organet, fail-safe utan Supabase-konfig) med
 * matt = { elevId, aktivTid, toppIntresse }. Inga råa sökvägar eller
 * quiz-svar lämnar någonsin eleven — endast sammanfattningen.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const elevId =
      typeof body.elevId === "string" && body.elevId.trim() ? body.elevId.trim().slice(0, 64) : "";
    if (!elevId || body.samtycke !== true) {
      return NextResponse.json({ ok: false, fel: "kräver elevId och samtycke: true" }, { status: 400 });
    }

    const summa = (body.sammanfattning ?? {}) as Record<string, unknown>;
    const aktivTidSek = Math.max(0, Math.min(40_000_000, Math.round(Number(summa.aktivTid) || 0)));
    const toppIntresse =
      typeof summa.toppIntresse === "string" &&
      ["teknisk", "fundamental", "portfölj", "beteende"].includes(summa.toppIntresse)
        ? summa.toppIntresse
        : null;

    const ok = await publiceraOrganEvent({
      source: "organ/tracer",
      verb: "rapport",
      matt: {
        elevId,
        aktivTid: aktivTidSek,
        toppIntresse,
        delatFrivilligt: true,
      },
    });

    // ok=false utan Supabase-konfig är inget fel för eleven — tyst läge.
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
