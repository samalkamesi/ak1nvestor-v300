import { NextRequest, NextResponse } from "next/server";
import {
  lasSignaler,
  publiceraSignal,
  SIGNAL_TYPER,
  SIGNAL_MOTTAGARE,
} from "@/lib/signal-bus";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/signal — SIGNAL-BUS-ENS publika ände.
 *
 * GET  ?mottagare=alla|fas2|admin[&kalla=…][&typ=…][&maxAntal=…]
 *      → senaste signalerna ur system_events (type="signal"), med STATISK
 *        fallback (statiskaSignaler) när Supabase saknas/flödet är tomt.
 *        mottagare = VEM SOM FRÅGAR: alla → publika, fas2 → +fas2, admin → allt.
 *
 * POST { kalla, typ, rubrik, text, ikon, lank?, mottagare? }
 *      → publiceraSignal (skriver signal-raden OCH ekar som OrganEvent).
 *        Öppet för organens "alla"/"fas2"-publicering (samma öppenhet som
 *        /api/track); mottagare/kalla "admin" kräver ADMIN_PASSWORD —
 *        admin-signaler får inte kunna smidas utifrån.
 *
 * Signaler är pedagogiska (P8/PGD): inga elevnamn, inga interna vikter.
 */

/** Standardantal i GET-svaret. */
const STANDARD_ANTAL = 30;

// ── Admin-skydd (samma mönster som /api/admin/fas2-access) ───────────────────

const misslyckade: number[] = [];
const MAX_MISSLYCKADE_PER_MIN = 10;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** true = ok; annars 401/429-svar. */
function kontrolleraAdmin(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD || "AK1A-2026";
  const header = req.headers.get("x-admin-password");
  const bearer = req.headers.get("authorization");
  const provided =
    header ?? (bearer?.startsWith("Bearer ") ? bearer.slice(7) : "");

  const nu = Date.now();
  while (misslyckade.length && nu - misslyckade[0] > 60_000) misslyckade.shift();
  if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
    return NextResponse.json(
      { error: "För många felaktiga försök — vänta en minut." },
      { status: 429 },
    );
  }
  if (!provided || !timingSafeEqual(provided, expected)) {
    misslyckade.push(nu);
    return NextResponse.json(
      { error: "Admin-lösenord krävs för admin-signaler (x-admin-password)." },
      { status: 401 },
    );
  }
  return null;
}

// ── GET: senaste signaler ────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const mottagare = p.get("mottagare") || "alla";
  if (!(SIGNAL_MOTTAGARE as readonly string[]).includes(mottagare)) {
    return NextResponse.json(
      { error: `mottagare måste vara en av ${SIGNAL_MOTTAGARE.join("|")}.` },
      { status: 400 },
    );
  }

  const typ = p.get("typ");
  if (typ && !(SIGNAL_TYPER as readonly string[]).includes(typ)) {
    return NextResponse.json(
      { error: `typ måste vara en av ${SIGNAL_TYPER.join("|")}.` },
      { status: 400 },
    );
  }

  const maxAntalRad = Number(p.get("maxAntal"));
  const maxAntal = Number.isFinite(maxAntalRad) && maxAntalRad > 0
    ? Math.min(100, Math.floor(maxAntalRad))
    : STANDARD_ANTAL;

  const kalla = p.get("kalla")?.trim().slice(0, 40) || undefined;

  const signaler = await lasSignaler({ kalla, typ: typ ?? undefined, mottagare, maxAntal });

  return NextResponse.json({
    genererad: new Date().toISOString(),
    mottagare,
    antal: signaler.length,
    // Ärlig källa-rapport: med Supabase-konfig läses flödet (annars statiskt).
    lage: getSupabaseRest() ? "supabase" : "statisk",
    signaler,
    notering:
      "Signal-bussen — systemens gemensamma andning. Pedagogiska signaler, inte investeringsråd.",
  });
}

// ── POST: publicera en signal ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let kropp: Record<string, unknown>;
  try {
    kropp = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Ogiltig JSON-kropp." }, { status: 400 });
  }
  if (!kropp || typeof kropp !== "object") {
    return NextResponse.json({ error: "Ogiltig kropp." }, { status: 400 });
  }

  const rubrik = typeof kropp.rubrik === "string" ? kropp.rubrik.trim().slice(0, 90) : "";
  const text = typeof kropp.text === "string" ? kropp.text.trim().slice(0, 400) : "";
  if (!rubrik || !text) {
    return NextResponse.json(
      { error: "rubrik och text krävs (icke-tomma strängar)." },
      { status: 400 },
    );
  }

  const typ = typeof kropp.typ === "string" ? kropp.typ : "info";
  if (!(SIGNAL_TYPER as readonly string[]).includes(typ)) {
    return NextResponse.json(
      { error: `typ måste vara en av ${SIGNAL_TYPER.join("|")}.` },
      { status: 400 },
    );
  }

  const mottagare = typeof kropp.mottagare === "string" ? kropp.mottagare : "alla";
  if (!(SIGNAL_MOTTAGARE as readonly string[]).includes(mottagare)) {
    return NextResponse.json(
      { error: `mottagare måste vara en av ${SIGNAL_MOTTAGARE.join("|")}.` },
      { status: 400 },
    );
  }

  const kalla = typeof kropp.kalla === "string" && kropp.kalla.trim()
    ? kropp.kalla.trim().slice(0, 40)
    : "system";

  // Admin-signaler är skyddade — de får inte gå att smida offentligt.
  if (mottagare === "admin" || kalla === "admin") {
    const nekad = kontrolleraAdmin(req);
    if (nekad) return nekad;
  }

  await publiceraSignal({
    kalla,
    typ: typ as (typeof SIGNAL_TYPER)[number],
    rubrik,
    text,
    ikon: typeof kropp.ikon === "string" && kropp.ikon.trim() ? kropp.ikon.trim().slice(0, 16) : "📡",
    ...(typeof kropp.lank === "string" ? { lank: kropp.lank } : {}),
    mottagare: mottagare as (typeof SIGNAL_MOTTAGARE)[number],
  });

  // publiceraSignal kastar aldrig och ekar själv som OrganEvent — svaret är
  // alltid "sänd" (utan Supabase är skrivningen en lokal no-op, fail-safe).
  return NextResponse.json({ ok: true, publicerad: true });
}
