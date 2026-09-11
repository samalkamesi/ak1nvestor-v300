import { NextRequest, NextResponse } from "next/server";

import { fornyaMedlemSession, lasMedlemSession, sattMedlemKakor, utvarderaRateLimit } from "@/lib/medlem-auth";
import { getCourses } from "@/lib/content";
import {
  datumIdag,
  lasMedlemProgress,
  skrivMedlemProgressEvent,
  valideraImport,
  valideraProgressSkrivning,
} from "@/lib/medlem-progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/medlem/progress — XP/PROGRESS-SYNC (FAS L2, våg 87 — kontraktet i
 * data/forskning/STYRELSE/STYRELSE-V86-L2-GATING.md §B).
 *
 * GET (hydrering-egisen enda nätverksberoende utöver session, §C.4):
 *   lasMedlemSession → 200 {inloggad:false} (gäst — TYST, aldrig 401-text)
 *   eller 200 {inloggad:true, progress:{xp, stjarnor, klaraKurser,
 *   importGjord}} ur lasMedlemProgress (requestskopad läsning, ALDRIG
 *   modul-cache — §B.4). Personliga värden når ALDRIG en CDN-cache (rutten
 *   är force-dynamic; ISR-låsta kurssidor läser den ALDRIG i SSR-passet —
 *   §E kandidat 1).
 *
 * POST { typ: "quiz"|"kursklar"|"stjarna", slug, kap?, i? }:
 *   1. lasMedlemSession → 401 utan giltig session (generell text — ingen
 *      info om kontoexistens, v83-regeln).
 *   2. Rate-limit 60/min per authId — in-memory per process (samma klass
 *      som admin-auth:ts misslyckade-lista; på serverless per instans,
 *      acceptabelt nivå 1 — skulda_notera §B.5).
 *   3. Validering mot kursdata (slug i deep-courses, kap/i inom gränser,
 *      typ i vitlistan) + DETERMINISTISK nyckel + SERVERFASTSTÄLLT värde
 *      (quiz → quiz:<slug>:<kap>:<i> = 10; kursklar → kursklar:<slug> = 50
 *      + stjarna:<slug> = 1; stjarna → stjarna:<slug> = 1). Klienten kan
 *      ALDRIG förhandla nyckel eller belopp — bodyns övriga fält läses ej.
 *   4. EN system_events-POST (type=medlem_progress, organ-event-mönstret,
 *      Prefer: return=minimal, timeout 8 s, fail-safe).
 *
 * POST { typ: "import", xp, stjarnor, klaraKurser } (migreringsknappen):
 *   ENDAST aggregat (GDPR-minimering §A.3); XP takas mot teoretiskt max ur
 *   kursdata + avdrag för redan registrerat; ENGÅNG per authId (import-*
 *   i profilen ⇒ 409). Nyckel import:<authId>:<datum> (serverdatum).
 *
 * P6: inga tokens/lösenord i denna väg. Feltexter generella.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Rate-limit: alla POST per authId (fönster 60 s, tak 60 — §B.5). */
const progressAnrop = new Map<string, number[]>();
const MAX_POST_PER_MIN = 60;

/**
 * Session MED refresh-rotation (LOGIN-2.0, våg 101): läs access-kakan; är
 * den utgången (1 h) FÖRSÖK rotation med refresh-kakan (30 d) — samma
 * kontrakt som /api/medlem {action:"session"} — och sätt om kakorna på
 * svaret. Utan detta låste läs-sidorna (kurs-gate, min-sida) eleven efter
 * 1 h trots en giltig 30-dagars-refresh-kaka.
 */
async function sessionMedRotation(req: NextRequest): Promise<{
  session: { authId: string; epost: string } | null;
  fornyad?: { access: string; refresh: string };
}> {
  const session = await lasMedlemSession(req);
  if (session !== null) return { session };
  const fornyad = await fornyaMedlemSession(req);
  if (fornyad !== null) {
    return { session: fornyad.session, fornyad: { access: fornyad.access, refresh: fornyad.refresh } };
  }
  return { session: null };
}

export async function GET(req: NextRequest) {
  const { session, fornyad } = await sessionMedRotation(req);
  if (session === null) {
    return NextResponse.json({ inloggad: false });
  }
  const progress = await lasMedlemProgress(session.authId);
  const res = NextResponse.json({ inloggad: true, progress });
  if (fornyad) sattMedlemKakor(res, fornyad.access, fornyad.refresh);
  return res;
}

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body: Record<string, unknown> =
    kropp && typeof kropp === "object" && !Array.isArray(kropp) ? (kropp as Record<string, unknown>) : {};

  // ── 1. Session — utan den finns inget att skriva (401, generell text) ─────
  const { session, fornyad } = await sessionMedRotation(req);
  if (session === null) {
    return NextResponse.json({ fel: "Inloggning krävs." }, { status: 401 });
  }

  // ── 2. Rate-limit per authId (ALLA anrop räknas — inte bara fel) ──────────
  const nu = Date.now();
  const bedomning = utvarderaRateLimit(progressAnrop.get(session.authId) ?? [], nu, MAX_POST_PER_MIN);
  if (bedomning.limitad) {
    return NextResponse.json({ fel: "För många anrop — vänta en minut." }, { status: 429 });
  }
  progressAnrop.set(session.authId, [...bedomning.stansade, nu]);

  const kurser = getCourses();

  // ── Migreringsimporten — engångs + takad (§A.3) ────────────────────────────
  if (body.typ === "import") {
    const redan = await lasMedlemProgress(session.authId);
    const validering = valideraImport(
      {
        authId: session.authId,
        xp: body.xp,
        stjarnor: body.stjarnor,
        klaraKurser: body.klaraKurser,
        datum: datumIdag(),
      },
      kurser,
      redan,
    );
    if (!validering.ok) {
      return NextResponse.json({ fel: validering.fel }, { status: validering.status });
    }
    const skrivning = await skrivMedlemProgressEvent(session.authId, null, [
      { nyckel: validering.nyckel, varde: validering.varde },
    ]);
    if (!skrivning.ok) {
      return NextResponse.json({ fel: skrivning.fel }, { status: 502 });
    }
    const resImport = NextResponse.json({ ok: true, import: validering.varde });
    if (fornyad) sattMedlemKakor(resImport, fornyad.access, fornyad.refresh);
    return resImport;
  }

  // ── quiz/kursklar/stjarna — servern fastställer nyckel + värde ────────────
  const validering = valideraProgressSkrivning(
    { typ: body.typ, slug: body.slug, kap: body.kap, i: body.i },
    kurser,
  );
  if (!validering.ok) {
    return NextResponse.json({ fel: validering.fel }, { status: 400 });
  }
  const skrivning = await skrivMedlemProgressEvent(session.authId, validering.slug, validering.rader);
  if (!skrivning.ok) {
    return NextResponse.json({ fel: skrivning.fel }, { status: 502 });
  }
  const resSkrivning = NextResponse.json({ ok: true, nycklar: validering.rader.map((r) => r.nyckel) });
  if (fornyad) sattMedlemKakor(resSkrivning, fornyad.access, fornyad.refresh);
  return resSkrivning;
}
