import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport, StudioMetodSaknasError } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/bakgrund — BAKGRUNDSJOBBS-PANEL (VÅG 91 A1d,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 91" block A1d tjänste-bryggor).
 *
 * GET → {jobb:[{id,typ,status,beskrivning?,verktyg?}]} — transport.
 * lasBakgrundsjobb: session/read-projektionens backgroundJobs (Tkn-form,
 * kartan §1) med subagenter-fallback (session/subagents). Avbrytning sker
 * via POST /api/studio/tjanster/bakgrund/avbryt {id} → session/
 * cancelBackgroundTask.
 *
 * ÄRLIG 501: protokollmetoden saknas i agent-versionen (-32601) ⇒
 * {saknas:true} med status 501 — UI:t DÖLJER panelen (aldrig ett fel-kort).
 *
 * SKYDD: requireAdmin. Pedagogisk plattform — inte investeringsråd.
 */

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const transport = hamtaStudioTransport();
  try {
    const jobb = await transport.lasBakgrundsjobb();
    return jsonSvar({ jobb });
  } catch (fel) {
    if (fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true) {
      return jsonSvar({ saknas: true, fel: fel instanceof Error ? fel.message : "Metoden stöds ej." }, 501);
    }
    return jsonSvar({ fel: fel instanceof Error ? fel.message.slice(0, 300) : "Bakgrundsjobben kunde ej listas." }, 502);
  }
}
