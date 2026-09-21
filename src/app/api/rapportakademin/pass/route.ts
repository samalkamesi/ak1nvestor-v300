import { NextRequest, NextResponse } from "next/server";
import { lasMedlemSession } from "@/lib/medlem-auth";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { lasPass, passSkal, korrigeraSektion, passMaxPoang } from "@/lib/rapportakademin/pass";
import { ART13_INFO, harArt13Kvitto } from "@/lib/rapportakademin/art13";
import { RA_BEDOMNING_EVENT } from "@/lib/rapportakademin/gallring";
import { minimeradBedomningRad } from "@/lib/rapportakademin/minimering";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/rapportakademin/pass — DET VERTIKALA SNITTETS端 (styrelse-muacmgtw-
 * qizth0 åtgärd 1+2): ett bolags A-Ö-pass med "eleven bedömer först" som
 * MEEKANISK API-grind.
 *
 *   GET  ?slug=…  → passets SKAL (råtal + frågor). INGA facit, INGA
 *                  expertläsningar — de exponeras aldrig före en bedömning.
 *   POST {slug, sektionIndex, elevensSvar}
 *                → korrigera server-side → LAGRA bedömningen (minimerings-
 *                  listan + art 13-kvitto, samma grindar som /api/rapport-
 *                  akademin) → FÖRST DÄREFTER expertläsningen i svaret.
 *                  Misslyckas lagringen (502) exponeras ingenting — ordningen
 *                  är mekanisk, inte ett UX-löfte.
 *
 * SERVER-SIDE Fas 2-GRIND (styrelsens åtgärden): passet är premium-innehåll.
 * Grindordning: medlem-kaka → members.member_type (fas2|fas3|premium|pro) →
 * art 13-kvitto → validering → lagring → exponering.
 *
 * Juridik: utbildning i att läsa en årsredovisning (2007:528 2 kap 5 §) —
 * expertläsningarna formulerar metod, ALDRIG köp/sälj.
 */

/** Medlemsnivåer som öppnar Fas 2-ytan (samma union som kurs-access.ts). */
const FAS2_TYPER: ReadonlySet<string> = new Set(["fas2", "fas3", "premium", "pro"]);

/** Enkel per-process rate-limit: max 30 bedömningar/min per konto (rappdags-skydd). */
const rateRaknare = new Map<string, number[]>();
const MAX_PER_MIN = 30;

function rateOk(authId: string): boolean {
  const nu = Date.now();
  const tidigare: number[] = rateRaknare.get(authId) ?? [];
  const farska = tidigare.filter((t) => nu - t < 60_000);
  if (farska.length >= MAX_PER_MIN) {
    rateRaknare.set(authId, farska);
    return false;
  }
  farska.push(nu);
  rateRaknare.set(authId, farska);
  return true;
}

function fv(s: string): string {
  return encodeURIComponent(s);
}

/** Läs medlemmens member_type ur Supabase (server-side Fas 2-källan). */
async function lasMemberType(rest: { origin: string; headers: Record<string, string> }, epost: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/members?email=eq.${fv(epost)}&select=member_type`,
      { headers: rest.headers, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const rader = (await res.json()) as { member_type?: unknown }[];
    const rad = Array.isArray(rader) && rader.length > 0 ? rader[0] : null;
    return rad && typeof rad.member_type === "string" ? rad.member_type : null;
  } catch {
    return null;
  }
}

/** De grindar GET och POST delar: session + Fas 2. Returnerar session-data
 *  eller ett färdigt fel-svar. */
async function grindar(
  req: NextRequest
): Promise<{ authId: string; epost: string } | NextResponse> {
  const session = await lasMedlemSession(req);
  if (session === null) {
    return NextResponse.json(
      { fel: "Logga in som medlem för att öva i Rapportakademin.", kod: "inloggning" },
      { status: 401 }
    );
  }
  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ fel: "Tjänsten är inte konfigurerad." }, { status: 503 });
  }
  const memberType = await lasMemberType(rest, session.epost);
  if (memberType === null || !FAS2_TYPER.has(memberType)) {
    // Pedagogiken (kurs-access.ts): en Fas är en INBJUDAN, aldrig ett stopp.
    return NextResponse.json(
      {
        fel: "Rapportakademin är en del av Fas 2 — den snabba fundamentala vägen till oberoende analytiker.",
        kod: "fas2",
      },
      { status: 403 }
    );
  }
  return { authId: session.authId, epost: session.epost };
}

// ── GET — passets skal (aldrig facit, aldrig expertläsning) ──────────────────

export async function GET(req: NextRequest) {
  const g = await grindar(req);
  if (g instanceof NextResponse) return g;

  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const pass = lasPass(slug);
  if (pass === null) {
    return NextResponse.json({ fel: "Okänt pass." }, { status: 404 });
  }

  // Art 13-läget följer med så klienten kan visa informationen FÖRE första
  // bedömningen (LAGBESLUT: mekanisk yta, inte bara policytext).
  const art13Kvitto = await harArt13Kvitto(g.authId);

  return NextResponse.json({
    ok: true,
    pass: passSkal(pass),
    antalSektioner: pass.sektioner.length,
    maxPoang: passMaxPoang(pass),
    art13Kvitto,
    ...(art13Kvitto ? {} : { art13Info: ART13_INFO }),
  });
}

// ── POST — bedöm → LAGRA → först därefter expertläsningen ───────────────────

export async function POST(req: NextRequest) {
  const g = await grindar(req);
  if (g instanceof NextResponse) return g;

  if (!rateOk(g.authId)) {
    return NextResponse.json(
      { fel: "För många inlämningar på en minut — andas en stund och försök igen." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ fel: "Ogiltig förfrågan." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug : "";
  const pass = lasPass(slug);
  if (pass === null) {
    return NextResponse.json({ fel: "Okänt pass." }, { status: 404 });
  }

  const sektionIndex = typeof body.sektionIndex === "number" ? Math.trunc(body.sektionIndex) : -1;
  const sektion = pass.sektioner.find((s) => s.index === sektionIndex) ?? null;
  if (sektion === null) {
    return NextResponse.json({ fel: "Okänd sektion." }, { status: 400 });
  }

  const elevensSvar = typeof body.elevensSvar === "number" ? body.elevensSvar : Number.NaN;
  if (!Number.isFinite(elevensSvar)) {
    return NextResponse.json({ fel: "Svaret måste vara ett tal." }, { status: 400 });
  }

  // Art 13-kvitto är en förutsättning för att NÅGOT skall lagras.
  if (!(await harArt13Kvitto(g.authId))) {
    return NextResponse.json(
      { fel: "Informationen om dina data måste visas och kvitteras före den första övningen (GDPR art 13).", kod: "art13_saknas" },
      { status: 409 }
    );
  }

  const korrigering = korrigeraSektion(sektion, elevensSvar);

  // Minimeringsraden (art 5.1 c): exakt fem fält, inget annat lagras.
  const rad = minimeradBedomningRad({
    ovningsId: `${pass.slug}:s${sektion.index + 1}`,
    elevensSvar,
    ratt: korrigering.ratt,
    ts: new Date().toISOString(),
    authId: g.authId,
  });

  // MEKANISKA GRINDEN: expertläsningen returneras ENDAST om lagringen
  // lyckades — misslyckas den här exponeras ingenting (502, ingen expert).
  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ fel: "Tjänsten är inte konfigurerad." }, { status: 503 });
  }
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: RA_BEDOMNING_EVENT,
        severity: "info",
        message: `[ra] bedömning ${rad.ovningsId.slice(0, 40)}: ${rad.ratt ? "rätt" : "fel"}`,
        details: { ...rad, authId: g.authId.toLowerCase() },
        source: "rapportakademin",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json({ fel: "Bedömningen kunde inte sparas." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ fel: "Bedömningen kunde inte sparas." }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    ratt: korrigering.ratt,
    poang: korrigering.poang,
    rattSvar: korrigering.rattSvar,
    felMarginal: korrigering.felMarginal,
    expertlasning: sektion.expertlasning,
  });
}
