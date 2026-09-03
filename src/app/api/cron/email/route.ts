import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { getSupabaseRest } from "@/lib/supabase-rest";
import { publiceraOrganEvent } from "@/lib/organ-event";
import { morgonMejl } from "@/lib/email-mallar";

/**
 * GET /api/cron/email — den dagliga mejl-rondan (MEGA_PLAN_V3 våg #9).
 * Körs av Vercel Cron 06:30 UTC (= 08:30 svensk sommartid) — se vercel.json.
 *
 * Rondan:
 *   (a) hämta alla members med email (Supabase REST,äldst först — stabilt)
 *   (b) för varje medlem: bygg morgon-briefingen som brev — senaste vågkartan
 *       (system_events type=vagscan, samma läsning som /api/vagscan/senaste)
 *       + dagens pass-aktie (samma deterministiska rotation som
 *       /api/dagens-pass) — och KÖA morgonMejl i system_events
 *       (type=email_kö, details={email, typ, "mallad-html"}) — EN batchad
 *       skrivning för hela rondan.
 *   (c) publiceraOrganEvent({ source:"organ/email", verb:"atgard",
 *       matt:{ skickade:N } }) — nervsystemsspåret, samma konvention som
 *       övriga organ.
 *
 * DAGENS LÄGE — UTAN FAKTISK UTSKICK: ingen extern mejl-leverantör
 * (SendGrid/Resend) är konfigurerad, så breven KÖAS bara (type=email_kö).
 * När en leverantör konfigureras tömmer en framtida utskickare kön — raderna
 * är leveransklara med färdigmallad HTML (src/lib/email-mallar.ts).
 *
 * Skydd: CRON_SECRET (om satt) krävs via ?secret= eller
 * Authorization: Bearer — samma mönster som /api/cron/vagscan.
 *
 * Streak-läge: memberns streak/XP/klara kurser lever i localStorage på
 * klienten (member-local.ts) och är inte läsbar server-side — därför skickar
 * rondan med streak=0 och mallen formulerar noll-läget uppmuntrande, aldrig
 * dömande (pedagogik.ts). Personlig statistik får komma med när den finns
 * server-side.
 *
 * BOUNDED: högst MAX_KO_PER_KORNING mejl per rond (system_events retentionas
 * av organet — 500 rader/30d — så kön hålls inom taket).
 *
 * Pedagogisk analys — inte investeringsråd.
 */

/** samma rotation + hash som /api/dagens-pass (FNV-1a, salt 1) — dagens aktie blir identisk med appens pass */
const ROTATION: readonly string[] = [
  "VOLV-B.ST",
  "SAAB-B.ST",
  "ATCO-A.ST",
  "SAND.ST",
  "SHB-B.ST",
  "SWED-A.ST",
  "ESSITY-B.ST",
  "ERIC-B.ST",
  "AZN.ST",
  "NDA-SE.ST",
  "SKF-B.ST",
  "ALFA.ST",
];

/** FNV-1a-hash med salt — speglar /api/dagens-pass exakt. */
function datumHash(datum: string, salt: number): number {
  const s = `${salt}:${datum}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

const MAX_KO_PER_KORNING = 100;

/** Vågkartans läge som en rad text — "206 impulsvågor · 84 korrigeringar · 40 basbyggen". */
function vagTextFranSenaste(details: Record<string, unknown> | null): string {
  const s = details?.universumSammanfattning as
    | { impulsvag?: number; korrigering?: number; basbygge?: number; osatt?: number }
    | undefined;
  const i = Number(s?.impulsvag);
  const k = Number(s?.korrigering);
  const b = Number(s?.basbygge);
  if (![i, k, b].every(Number.isFinite) || i + k + b <= 0) {
    return "Vågkartan vilar tills dagens mätning — den autonoma mätningen körs enligt schema.";
  }
  const osatt = Number(s?.osatt);
  const osattText = Number.isFinite(osatt) && osatt > 0 ? ` · ${osatt} osatta` : "";
  return `${i} impulsvågor · ${k} korrigeringar · ${b} basbyggen${osattText}`;
}

/** En medlem-rad ur members-tabellen (endast det rondan behöver). */
type MemberRad = { id: string; email: string; name: string | null };

export async function GET(req: NextRequest) {
  // ── Skydd: CRON_SECRET via ?secret= (query) eller Bearer (Vercel Cron) ──
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const qs = req.nextUrl.searchParams.get("secret");
    const auth = req.headers.get("authorization");
    if (qs !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const rest = getSupabaseRest();
  if (!rest) {
    // Graceful utan konfiguration — cron ska inte skapa larmstormar i dev.
    return NextResponse.json({ ok: true, skickade: 0, orsak: "supabase-ej-konfigurerad" });
  }

  try {
    // ── (a) alla members med email ──
    const membersRes = await fetch(
      `${rest.origin}/rest/v1/members?select=id,email,name&order=created_at.asc`,
      { headers: rest.headers, cache: "no-store", signal: AbortSignal.timeout(10000) },
    );
    if (!membersRes.ok) {
      return NextResponse.json(
        { ok: false, error: `members-källan svarade ${membersRes.status}` },
        { status: 502 },
      );
    }
    const members = (
      (await membersRes.json()) as Array<Partial<MemberRad> | null>
    )
      .filter((m): m is Partial<MemberRad> => !!m)
      .filter((m) => typeof m.email === "string" && m.email.trim() !== "");

    // ── (b) morgon-briefing per medlem: vågkarta + dagens pass ──
    // Senaste vågkartan — samma läsning som /api/vagscan/senaste.
    let vagDetails: Record<string, unknown> | null = null;
    try {
      const vg = await fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.vagscan&select=details,created_at&order=created_at.desc&limit=1`,
        { headers: rest.headers, cache: "no-store", signal: AbortSignal.timeout(10000) },
      );
      if (vg.ok) {
        const rader = (await vg.json()) as Array<{ details: Record<string, unknown> | null }>;
        if (rader[0]?.details) vagDetails = rader[0].details;
      }
    } catch {
      // tyst — brevet faller mjukt på vilar-texten
    }
    const vagText = vagTextFranSenaste(vagDetails);

    // Dagens aktie — deterministiskt, identisk med /api/dagens-pass.
    const datum = new Date().toISOString().slice(0, 10);
    const dagensAktie = ROTATION[datumHash(datum, 1) % ROTATION.length];

    const urval = members.slice(0, MAX_KO_PER_KORNING);
    const rader = urval.map((m) => {
      const html = morgonMejl(
        typeof m.name === "string" ? m.name : "",
        vagText,
        dagensAktie,
        0, // streak lever i klientens localStorage — se filhuvudets kommentar
      );
      return {
        type: "email_kö",
        severity: "info",
        message: `[email-kö] morgon → ${m.email} (${dagensAktie})`.slice(0, 280),
        details: { email: (m.email as string).trim().toLowerCase(), typ: "morgon", "mallad-html": html },
        source: "cron/email",
      };
    });

    // EN batchad köskrivning för hela rondan (PostgREST stödjer array-POST).
    let supabaseSparad = false;
    if (rader.length > 0) {
      try {
        const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
          method: "POST",
          headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify(rader),
          signal: AbortSignal.timeout(20000),
        });
        supabaseSparad = res.ok;
      } catch {
        supabaseSparad = false;
      }
    }

    const skickade = supabaseSparad ? rader.length : 0;

    // ── (c) nervsystemsspåret — organ/email atgard (även 0 = puls) ──
    await publiceraOrganEvent({
      source: "organ/email",
      verb: "atgard",
      matt: { skickade, typ: "morgon", dagensAktie, medlemmar: members.length, overskred_tak: Math.max(0, members.length - MAX_KO_PER_KORNING) },
    });

    return NextResponse.json({
      ok: true,
      skickade,
      medlemmar: members.length,
      dagensAktie,
      vagText,
      supabaseSparad,
      leverantorKonfigurerad: Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY),
      notering:
        "KÖAT, EJ SKICKAT — ingen mejl-leverantör konfigurerad; breven ligger i system_events (type=email_kö) och skickas när leverantör finns. Pedagogisk analys — inte investeringsråd.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Mejl-rondan misslyckades (nätverk)." }, { status: 502 });
  }
}
