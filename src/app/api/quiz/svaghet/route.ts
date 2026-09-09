import { NextRequest, NextResponse } from "next/server";

import { ipHash, klientIp, utvarderaRateLimit } from "@/lib/medlem-auth";
import { getCourses } from "@/lib/content";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/quiz/svaghet — DEN ANONYMA SIGNALKÄLLAN till lärvägens svaghetsregel
 * (våg 88, B1-LARVAG).
 *
 * POST { slug, kap } — EN del per quiz-svar (brand vid FEL svar; brand vid
 * rätt svar är poäng, inte svaghet). Skriver EXAKT EN system_events-rad:
 *   type=quiz_svaghet, severity=info, details={slug, kap}, source=quiz
 *
 * GDPR — NOLL PERSONUPPGIFTER: ingen authId, ingen e-post, ingen IP i
 * raden. IP:n hashas (sha256/16) ENDAST i minnet som rate-limit-nyckel —
 * hashen lämnar aldrig processen och skrivs aldrig ner. Läsningen
 * (/api/larvag) aggregarerar bara antal per slug: en argmax över en
 * anonym mängd kan aldrig polystra fram en enskild elev.
 *
 * Validering mot kursdata (slug finns; kapitlet med num===kap finns OCH
 * bär quiz — samma vakt som medlem-progress). Rate-limit 60/min per
 * IP-hash (in-memory per process — samma klass som progress-rutten).
 *
 * Fel är ärliga men tysta i UI:t (klienten sväljer — signalen får aldrig
 * störa ett quiz-svar). Byggfas ⇒ 503 utan nät.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Event-typen — den kanoniska nyckeln läsningen i /api/larvag filtrerar på. */
export const SVAGHET_EVENT_TYP = "quiz_svaghet";

/** Rate-limit: EN radix per fel-svar, tak 60/min per IP-hash (kontraktet). */
const svaghetAnrop = new Map<string, number[]>();
const MAX_POST_PER_MIN = 60;

type KapitelMedQuiz = { num?: unknown; quiz?: unknown };

/** Nätverksfel-namn utan hemligheter ("TimeoutError", "TypeError" …). */
function felnamn(e: unknown): string {
  return e instanceof Error ? e.name : "okänt nätverksfel";
}

export async function POST(req: NextRequest) {
  // ── Bygg-hermetik (våg 79): ALDRIG nät under next build ───────────────────
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body: Record<string, unknown> =
    kropp && typeof kropp === "object" && !Array.isArray(kropp) ? (kropp as Record<string, unknown>) : {};

  // ── Rate-limit per IP-HASH (minnet — hashen skrivs aldrig ner) ────────────
  const nyckel = ipHash(klientIp(req));
  const nu = Date.now();
  const bedomning = utvarderaRateLimit(svaghetAnrop.get(nyckel) ?? [], nu, MAX_POST_PER_MIN);
  if (bedomning.limitad) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  svaghetAnrop.set(nyckel, [...bedomning.stansade, nu]);

  // ── Validering mot kursdata (samma vakt som medlem-progress) ──────────────
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const kurs = getCourses()[slug];
  if (!slug || !kurs) {
    return NextResponse.json({ ok: false, fel: "Okänd kurs." }, { status: 400 });
  }
  const kap = body.kap;
  if (typeof kap !== "number" || !Number.isInteger(kap) || kap < 1) {
    return NextResponse.json({ ok: false, fel: "Kapitlet måste vara ett heltal ≥ 1." }, { status: 400 });
  }
  const kapitel = (kurs.chapters as unknown as KapitelMedQuiz[]).find((ch) => ch?.num === kap);
  if (!kapitel || !Array.isArray(kapitel.quiz)) {
    return NextResponse.json({ ok: false, fel: "Kapitlet finns inte eller har inget quiz." }, { status: 400 });
  }

  // ── EN anonym rad (organ-event-mönstret; noll personuppgifter) ────────────
  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  try {
    const res = await fetch(rest.origin + "/rest/v1/system_events", {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          type: SVAGHET_EVENT_TYP,
          severity: "info",
          message: "[quiz-svaghet] " + slug + " kap " + String(kap),
          details: { slug, kap }, // INTE authId, INTE IP — anonym räknare
          source: "quiz",
        },
      ]),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, fel: felnamn(e) }, { status: 502 });
  }
}
