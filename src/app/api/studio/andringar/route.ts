import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/andringar — GET SENASTE TURNENS FILÄNDRINGAR (VÅG 83 MEGA
 * byggblock B1: streaming-visualisering + DIFF, Z-portalens kärna).
 *
 * GET → {sessionId, filer:[{sokvag, plus, minus, rader:[{typ:"+"/"-",
 *        text}]}]} — ±N-rader per fil, grönt/rött i UI:t. Källan är
 *        transport.lasFilandringar(): session/messages tool-delar där
 *        Write bär hela content (+N) och Edit bär old_string/new_string
 *        (EXAKT −N/+N; MultiEdit bär edits[]).
 *
 * V4-DOKUMENTATION (KVD): protokollkartan (tool-results/v83-protokollkarta.md
 * §4F/§6.1) visar att filändringar i protokollet ENDAST lever i v4-grenen —
 * v4/conversation/fileChanges — som är en EGEN protokollgren med eget
 * handskakningsflöde (v4/connection/flow → v4/controller/subscribe →
 * v4/conversation/subscribe) och INGÅR inte i session/event-strömmen som
 * studion prenumererar på. Att koppla v4-grenen är en framtida uppgradering;
 * tills dess härleds diffen ärligt ur turnens egna Write/Edit-fakta (samma
 * sanning agenten själv rapporterar) och panelen renderar identisk form.
 *
 * Svaret bär ALDRIG hemligheter: sökvägar inom agentens arbetsyta,
 * trunkerade rader (studio-transportens budgeter). 200 även när listan är
 * tom (inga filändringar senaste turnen = sant tillstånd, inte fel).
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

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const transport = hamtaStudioTransport();
  try {
    const filer = await transport.lasFilandringar();
    return jsonSvar({ sessionId: transport.sessionId(), filer });
  } catch (fel) {
    // Diff är lyx: ärligt fel-fält, aldrig 500-krasch för panelen.
    return jsonSvar({
      sessionId: transport.sessionId(),
      filer: [],
      fel: fel instanceof Error ? fel.message.slice(0, 300) : "Filändringarna kunde ej hämtas.",
    });
  }
}
