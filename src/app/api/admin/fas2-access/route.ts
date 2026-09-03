import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { publiceraOrganEvent } from "@/lib/organ-event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/fas2-access — Fas 2-behörighet (medlemsnivån "fas2").
 *
 * POST { memberId, ge, adminPassword? }  → PATCH members.member_type till
 *   "fas2" (ge=true) eller "free" (ge=false) via Supabase REST. Efter
 *   verkställighet publiceras ett OrganEvent-beslut (source
 *   "organ/pro-admin", verb "beslut") — samma nervsystemsspår som
 *   POST /api/pro/admin.
 *
 * GET ?memberId=<id>  → läser medlemmens aktuella member_type.
 *
 * SKYDD: till skillnad från de äldre läs-routerna under /api/admin kräver
 * denna skrivväg ADMIN_PASSWORD på servern — samma lösenord som
 * POST /api/admin/auth verifierar (env ADMIN_PASSWORD). Lösenordet lämnas
 * i headern "x-admin-password" (alternativt "Authorization: Bearer <pwd>"
 * eller body-fältet adminPassword) och jämförs timing-säkert. Endast
 * misslyckade försök rate-limitas (10/min per process).
 *
 * Pedagogisk analys — inte investeringsråd.
 */

/** members.id — UUID-liknande; aldrig fritext mot REST-filtret. */
const MEMBER_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

/** Enkel in-memory rate-limit på FELAKTIGA lösenordsförsök (10/minut). */
const misslyckade: number[] = [];
const MAX_MISSLYCKADE_PER_MIN = 10;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Lösenord ur header (x-admin-password | Authorization: Bearer) eller body. */
function utdragLosenord(req: NextRequest, body: Record<string, unknown>): string {
  const urHeader = req.headers.get("x-admin-password");
  if (urHeader) return urHeader;
  const bearer = req.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) return bearer.slice(7);
  const urBody = body.adminPassword;
  return typeof urBody === "string" ? urBody : "";
}

/** true = fortsätt; annars returneras ett 401/429-svar. */
function kontrolleraAdmin(req: NextRequest, body: Record<string, unknown>): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD || "AK1A-2026";
  const provided = utdragLosenord(req, body);

  const now = Date.now();
  while (misslyckade.length && now - misslyckade[0] > 60_000) misslyckade.shift();
  if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
    return NextResponse.json(
      { error: "För många felaktiga försök — vänta en minut." },
      { status: 429 },
    );
  }

  if (!provided || !timingSafeEqual(provided, expected)) {
    misslyckade.push(now);
    return NextResponse.json(
      { error: "Admin-lösenord krävs (x-admin-password)." },
      { status: 401 },
    );
  }
  return null;
}

function plockaObjekt(rå: unknown): Record<string, unknown> {
  return rå && typeof rå === "object" && !Array.isArray(rå)
    ? (rå as Record<string, unknown>)
    : {};
}

// ── POST — GE / ÅTERKALLA FAS 2 ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body = plockaObjekt(kropp);

  const skyddSvar = kontrolleraAdmin(req, body);
  if (skyddSvar) return skyddSvar;

  const memberId = typeof body.memberId === "string" ? body.memberId.trim() : "";
  const ge = body.ge === true; // allt utom true räknas som återkalla

  if (!MEMBER_ID_RE.test(memberId)) {
    return NextResponse.json(
      { error: "memberId krävs (1–64 tecken: a-z, 0-9, -, _)." },
      { status: 400 },
    );
  }

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ error: "Supabase ej konfigurerad" }, { status: 503 });
  }

  try {
    // return=representation → raden tillbaka för OrganEvent-namn + svaret
    const res = await fetch(
      `${rest.origin}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=name,email,member_type`,
      {
        method: "PATCH",
        headers: {
          ...rest.headers,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ member_type: ge ? "fas2" : "free" }),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Supabase ${res.status}` },
        { status: 502 },
      );
    }

    const rader = (await res.json()) as unknown[];
    if (!Array.isArray(rader) || rader.length === 0) {
      return NextResponse.json({ error: "Medlemmen hittades inte." }, { status: 404 });
    }

    const rad = plockaObjekt(rader[0]);
    const namn =
      (typeof rad.name === "string" && rad.name.trim()) ||
      (typeof rad.email === "string" && rad.email.trim()) ||
      memberId;
    const memberType = typeof rad.member_type === "string" ? rad.member_type : ge ? "fas2" : "free";

    // Nervsystemet — OrganEvent-beslut (fail-safe: false stoppar aldrigsvaret)
    const organEvent = await publiceraOrganEvent({
      source: "organ/pro-admin",
      verb: "beslut",
      matt: { action: "fas2-access", memberId, namn, ge },
    });

    return NextResponse.json({ ok: true, memberType, namn, organEvent });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Okänt fel" },
      { status: 500 },
    );
  }
}

// ── GET — LÄS AKTUELL NIVÅ ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skyddSvar = kontrolleraAdmin(req, {});
  if (skyddSvar) return skyddSvar;

  const memberId = (req.nextUrl.searchParams.get("memberId") || "").trim();
  if (!MEMBER_ID_RE.test(memberId)) {
    return NextResponse.json(
      { error: "memberId krävs (1–64 tecken: a-z, 0-9, -, _)." },
      { status: 400 },
    );
  }

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ error: "Supabase ej konfigurerad" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=member_type`,
      { headers: rest.headers, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) {
      return NextResponse.json({ error: `Supabase ${res.status}` }, { status: 502 });
    }
    const rader = (await res.json()) as unknown[];
    const rad = Array.isArray(rader) && rader.length > 0 ? plockaObjekt(rader[0]) : null;
    return NextResponse.json({
      memberId,
      memberType: rad && typeof rad.member_type === "string" ? rad.member_type : null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Okänt fel" },
      { status: 500 },
    );
  }
}
