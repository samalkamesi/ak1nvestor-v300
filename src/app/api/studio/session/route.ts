import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/session — SESSIONSHANTERING för /studio (VÅG 82 STUDIO V2,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 82").
 *
 * GET  → {sessioner:[{sessionId,titel,status,arbetsyta,uppdaterad}]} via
 *        transport.lasSessioner (protokollmetod session/list — BEVISAT
 *        v82: {} listar alla arbetsytans sessioner med titel/status).
 *        "Sessionsliståterkomst": gamla sessioner syns även efter att en
 *        ny skapats — historiken går aldrig förlorad, bara kontexten
 *        börjar om.
 * POST → {action:"ny"} → transport.nySession() → {sessionId} (frisk
 *        kontext — 1M-fönstret börjar om; bevarad session ligger kvar
 *        i listan ovan).
 *        {action:"compact"} → transport.compact() (protokollmetod
 *        session/compact — BEVISAT v82, kompakteringen kör som en
 *        agentturn) → {status:"klar"|"redan_körs"|"tom", meddelande,
 *        kontext:{contextUsed,contextWindow,totalTokenCount,...}}.
 *
 * SKYDD: requireAdmin på båda metoderna. Svaret bär ALDRIG hemligheter —
 * sessionId är en offentlig zcode-identifierare.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

// ── GET — tidigare sessioner ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  try {
    const sessioner = await hamtaStudioTransport().lasSessioner();
    return jsonSvar({ sessioner, aktiv: hamtaStudioTransport().sessionId() });
  } catch (fel) {
    return jsonSvar({
      sessioner: [],
      fel: fel instanceof Error ? fel.message.slice(0, 300) : "Sessionerna kunde ej listas.",
    });
  }
}

// ── POST — ny session | komprimera kontext ──────────────────────────────────

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let action = "";
  let instruktioner: string | undefined;
  try {
    const kropp = (await req.json()) as { action?: unknown; instruktioner?: unknown };
    if (typeof kropp.action === "string") action = kropp.action.trim();
    if (typeof kropp.instruktioner === "string" && kropp.instruktioner.trim()) {
      instruktioner = kropp.instruktioner;
    }
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }

  const transport = hamtaStudioTransport();

  try {
    if (action === "ny") {
      const sessionId = await transport.nySession();
      const kontext = await transport.lasKontext();
      return jsonSvar({ sessionId, kontext });
    }
    if (action === "compact") {
      const svar = await transport.compact(instruktioner);
      return jsonSvar(svar);
    }
    return jsonSvar({ fel: 'Okänd action — använd {"action":"ny"} eller {"action":"compact"}.' }, 400);
  } catch (fel) {
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 300) : "Ogiltig åtgärd." },
      502,
    );
  }
}
