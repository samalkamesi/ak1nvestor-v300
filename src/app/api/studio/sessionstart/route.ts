import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { forvantatLosenord } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/sessionstart — R4 FAS 1: SessionStart-telemetri (verkställning
 * av data/forskning/zcode-kallkod/R4-HOOKS.md §7–9; styrelsebeslut våg 155).
 *
 * Hook-manuset verktyg/trafiklogg-hook.mjs (deklarerat i ~/.zcode/cli/config.json,
 * user scope — kör DIREKT utan trust-granskning, se R4-HOOKS §5) POSTar hit EN
 * gång per zcode-session (guard sessionStartHookRan i core-runtimen):
 *   { session_id, source: "startup"|"resume", ts, agent: agent_type }
 *
 * SKYDD — INTE requireAdmin (hook-processen kan inte bära admin-sessionscookie
 * och vi vill inte skicka lösenordet i x-admin-password på en shell-kommandorad
 * som syns i ps): en hemlig query-param "nyckel" jämförs TIMING-SÄKERT mot
 * ADMIN_PASSWORD ur env (våg 79: prod utan ADMIN_PASSWORD ⇒ vägran, ingen
 * dev-fallback). Misslyckade försök rate-limitas 10/min (mönster från
 * admin-auth). Nyckeln loggas ALDRIG och ekoas ALDRIG i svar.
 *
 * GDPR-minimi (R4-HOOKS §7.2 + §8.6): ENDAST metadata — session_id, source,
 * ts, agent-klass. Prompter, meddelanden och sökvägar loggas ALDRIG.
 *
 * Loggen: data/vakten/sessionstart-logg.jsonl (append en rad, JSONL) —
 * serverns vårdnadsyta, gitignorad sedan våg 105. Läsning sker på servern
 * (jq/vakten), rutten har ingen GET.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Enkel in-memory rate-limit på FELAKTIGA nyckelförsök (10/minut, mönster ur admin-auth). */
const misslyckade: number[] = [];
const MAX_MISSLYCKADE_PER_MIN = 10;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function nyckelOk(req: NextRequest): boolean {
  const forvantat = forvantatLosenord();
  if (!forvantat) return false;
  const given = req.nextUrl.searchParams.get("nyckel") ?? "";
  return given.length > 0 && timingSafeEqual(given, forvantat);
}

export async function POST(req: NextRequest) {
  const forvantat = forvantatLosenord();
  if (!forvantat) {
    // Våg 79-paritet: i produktion utan ADMIN_PASSWORD finns INGEN låsuppgift —
    // telemetri-vägen är då STÄNGD, inte fallen öppen.
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD är inte satt — sessionstart-telemetri är avstängd." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!nyckelOk(req)) {
    const nu = Date.now();
    while (misslyckade.length > 0 && nu - misslyckade[0] > 60_000) misslyckade.shift();
    if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
      return NextResponse.json({ ok: false }, { status: 429, headers: { "Retry-After": "60" } });
    }
    misslyckade.push(nu);
    return NextResponse.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  // Sanering: ENDAST metadata, trunkerad (GDPR-minimi — R4-HOOKS §8.6).
  const sessionId = typeof body.session_id === "string" ? body.session_id.slice(0, 64).trim() : "";
  const source = typeof body.source === "string" ? body.source.slice(0, 16) : "okand";
  const agent = typeof body.agent === "string" ? body.agent.slice(0, 24) : "okand";
  const ts = typeof body.ts === "number" && Number.isFinite(body.ts) ? body.ts : Date.now();
  if (!sessionId) {
    return NextResponse.json({ ok: false }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const rot = path.join(process.cwd(), "data", "vakten");
    await mkdir(rot, { recursive: true });
    await appendFile(
      path.join(rot, "sessionstart-logg.jsonl"),
      `${JSON.stringify({ ts, session_id: sessionId, source, agent })}\n`,
      "utf8",
    );
  } catch {
    // Disken kan strula (deploy pågår etc.) — telemetri får aldrig låsa sessionen.
    return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
