import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";
import { morgonMejl, veckoRapport, fas2Nudge, NYHETSBREV_MALL } from "@/lib/email-mallar";
import { lasLeverantor, skickaMejl, type SkickaResultat } from "@/lib/email-sandare";

/**
 * POST /api/email — köa (och, om leverantör finns, SKICKA) ett mejl.
 * (MEGA_PLAN_V3 våg #9 + VÅG 50: leverantörsadapter — se src/lib/email-sandare.ts.)
 *
 * Body: { email, typ: "morgon"|"vecka"|"fas2nudge"|"prenumeration-intention", data: {...} }
 *   morgon                  → data { namn, vagText, dagensAktie, streak }
 *   vecka                   → data { namn, klaraKurser, xp, topRorelse }
 *   fas2nudge               → data { namn, niva }        (nivå 25 → Fas 2-inbjudan)
 *   prenumeration-intention → data { namn, nivaNamn, period, pris }
 *                             (frivillig nyhetsbrevscheck i aktivera-panelen —
 *                              köar en intention + välkomstbrev till eleven)
 *
 * Köhantering: varje anrop mallar HTML:en (src/lib/email-mallar.ts — AK1A-DNA,
 * tabellbaserad, disclaimer alltid) och lägger EN rad i system_events:
 *   type     = "email_kö"
 *   details  = { email, typ, "mallad-html": <färdigt brev> }
 *
 * LEVERANTÖR (VÅG 50): är EMAIL_LEVERANTOR + EMAIL_API_KEY satta (eller äldre
 * RESEND_API_KEY/SENDGRID_API_KEY) skickas brevet PÅ RIKTIGT direkt efter
 * kön skrivits — host-allowlistad fetch via src/lib/email-sandare.ts.
 * Annars stannar brevet i kön och svaret bär statusen
 * "köad (leverantör saknas)". Se email-sandare.ts för kundsetup.
 *
 * SVAR: { ok:true, köad:true, skickat, status, typ, email } · 400 ogiltig
 * indata · 429 rate-limit · 503 Supabase ej konfigurerat · 502 köskrivning
 * misslyckades. (Leverantörsfel vid direktutskick är INTE 502 — brevet ligger
 * tryggt i kön och statusen förklarar läget.)
 *
 * Pedagogisk analys — inte investeringsråd.
 */

/** De mejltyper som får köas (samma uppräkning som cron/email bygger på). */
const TYPER = ["morgon", "vecka", "fas2nudge", "prenumeration-intention"] as const;
type MejlTyp = (typeof TYPER)[number];

/** Ämnesrad per typ — samma röst som mallarna. */
function amneFor(typ: MejlTyp): string {
  switch (typ) {
    case "morgon":
      return "AK1A — Morgon-briefingen";
    case "vecka":
      return "AK1A — Veckorapporten";
    case "fas2nudge":
      return "AK1A — Fas 2 väntar";
    case "prenumeration-intention":
      return "AK1A — din plats i morgon-briefingen";
  }
}

/** Enkel e-postvalidering — tillräcklig för kö-validering (leverantören validerar igen). */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

/** Gränser som håller kön och meddelandefältet BOUNDED (system_events-retentionen). */
const MAX_EMAIL_LANGD = 254;
const MAX_NAMN = 80;
const MAX_TEXT = 300;
const MAX_AKTIE = 40;

/** Enkel in-memory rate-limit per IP (10/min) — skyddar kön mot flooding. */
const senasteAnrop: number[] = [];
const MAX_ANROP_PER_MIN = 10;

function plockaStr(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function plockaTal(v: unknown, min: number, max: number, standard: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return standard;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Välkomstbrev för nyhetsbrevs-intentioner (aktivera-panelens frivilliga check). */
function prenumerationsMejl(namn: string, nivaNamn: string, period: string, pris: string): string {
  const n = namn ? `, ${namn}` : "";
  const nivaRad = nivaNamn
    ? `<p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#0a0b0d;">Du har samtidigt begärt aktivering av <strong>${nivaNamn}</strong> (${period}${pris ? `, ${pris}` : ""}) — den handläggs via mejl, precis som vanligt.</p>`
    : "";
  return NYHETSBREV_MALL(
    "Din plats i morgon-briefingen",
    `<p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#0a0b0d;">Tack${n}!</p>` +
      `<p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#6b6353;">Du har sagt ja till morgon-briefingen och forskningsuppdateringarna. Från första leveranssdag landar en kort, saklig morgonhälsning i din inkorg — vågkartan, dagens aktie och ett femminuterspass. Inget säljer, inget dömer.</p>` +
      nivaRad +
      `<p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.6;color:#0a0b0d;">Vill du någon dag avsluta prenumerationen? Svara på vilket som helst av breven — det räcker.</p>`,
  );
}

export async function POST(req: NextRequest) {
  // ── Rate-limit (per process, rullande minut) ──
  const nu = Date.now();
  while (senasteAnrop.length && nu - senasteAnrop[0] > 60_000) senasteAnrop.shift();
  if (senasteAnrop.length >= MAX_ANROP_PER_MIN) {
    return NextResponse.json(
      { ok: false, error: "För många köade mejl — vänta en minut." },
      { status: 429 },
    );
  }
  senasteAnrop.push(nu);

  // ── Indata ──
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Ogiltig JSON-body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > MAX_EMAIL_LANGD || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Ogiltig e-postadress." }, { status: 400 });
  }

  const typ = body.typ as MejlTyp;
  if (!TYPER.includes(typ)) {
    return NextResponse.json(
      { ok: false, error: `typ måste vara en av ${TYPER.join("|")}.` },
      { status: 400 },
    );
  }

  const data =
    body.data && typeof body.data === "object" && !Array.isArray(body.data)
      ? (body.data as Record<string, unknown>)
      : {};

  // ── Mallning (AK1A-DNA; all elevtext esc:as inne i mallarna) ──
  let html: string;
  switch (typ) {
    case "morgon":
      html = morgonMejl(
        plockaStr(data.namn, MAX_NAMN),
        plockaStr(data.vagText, MAX_TEXT) || "Vågkartan vilar tills dagens mätning.",
        plockaStr(data.dagensAktie, MAX_AKTIE) || "dagens aktie",
        plockaTal(data.streak, 0, 9999, 0),
      );
      break;
    case "vecka":
      html = veckoRapport(
        plockaStr(data.namn, MAX_NAMN),
        plockaTal(data.klaraKurser, 0, 9999, 0),
        plockaTal(data.xp, 0, 99_999_999, 0),
        plockaStr(data.topRorelse, MAX_TEXT) || "Vågkartan vilar — mätningen körs enligt schema.",
      );
      break;
    case "fas2nudge":
      html = fas2Nudge(plockaStr(data.namn, MAX_NAMN), plockaTal(data.niva, 1, 100, 25));
      break;
    case "prenumeration-intention":
      html = prenumerationsMejl(
        plockaStr(data.namn, MAX_NAMN),
        plockaStr(data.nivaNamn, MAX_NAMN),
        plockaStr(data.period, 20) === "ar" ? "årsvis" : "månadsvis",
        plockaStr(data.pris, 60),
      );
      break;
  }

  // ── Köskrivning: EN rad i system_events ──
  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json(
      { ok: false, error: "Supabase ej konfigurerad — mejlkön kräver NEXT_PUBLIC_SUPABASE_URL och nyckel." },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: "email_kö",
        severity: "info",
        message: `[email-kö] ${typ} → ${email}`.slice(0, 280),
        details: { email, typ, "mallad-html": html },
        source: "api/email",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Köskrivning misslyckades (Supabase ${res.status}).` },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Köskrivning misslyckades (nätverk)." }, { status: 502 });
  }

  // ── Direktutskick om leverantör finns (annars: kön är sanningen) ──
  const { konfigurerad, leverantor } = lasLeverantor();
  const resultat: SkickaResultat = konfigurerad
    ? await skickaMejl({ till: email, amne: amneFor(typ), html })
    : { skickad: false, leverantor: null, status: "köad (leverantör saknas)" };

  return NextResponse.json({
    ok: true,
    köad: true,
    skickat: resultat.skickad,
    status: resultat.status,
    leverantor: resultat.leverantor,
    typ,
    email,
  });
}
