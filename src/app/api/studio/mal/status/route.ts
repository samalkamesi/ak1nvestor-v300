import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/mal/status — MÅL-MOTORNS STATUSPOLL (VÅG 91 A1b,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 91" block A1b).
 *
 * GET → { aktiv, pausad, sessionId, iteration, pagaendeTurn, senasteEvent,
 *        uppdaterad, mal } — DEFAULT-transportens mål-motor-state, server-
 * processens SANNING om den autonoma loopen. En återvändande flik pollar
 * denna för SNABB catch-up (tillsammans med GET /api/studio/stream:s
 * återkoppling v87 = komplett vy): "aktiv=true" ⇒ agenten jobbar fortfarande
 * i bakgrunden, "pagaendeTurn=true" ⇒ en iteration strömmar just nu,
 * "senasteEvent" ⇒ motor-rad ("Iteration 3 klar (success)"), "uppdaterad" ⇒
 * epoch ms (stallet-detektering).
 *
 * SJÄLVLÄKNING: anropet sonderar FÖRST transportens mål-läge (sondMal —
 * session/goal show) så ett LEVANDE mål efter t.ex. pm2-omstart åter-
 * aktiveras OCH rapporteras — sonden är best-effort (fel ⇒ malStatus() är
 * sanningen, svaret är ALLTID 200 + ärliga fält).
 *
 * MOTORN ÄGER STATET (A1a): denna routen LÄSER bara — inget mål sätts,
 * pausas eller stängs här (POST /api/studio/session action malSatt/
 * malPausa/malRensa äger det) och iterationerna markeras i kartan av
 * TRANSPORTEN, inte här.
 *
 * SKYDD: requireAdmin. Svaret bär måltexten (kundens egen input) + räknare
 * — ALDRIG hemligheter.
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
  // Sond först (best-effort): ett LEVANDE mål återaktiverar mål-läget så
  // motorn rapporterar + fortsätter mata iterationer. Kastar aldrig.
  let status = transport.malStatus();
  try {
    status = await transport.sondMal();
  } catch {
    // sonden är lyx — snapshoten ovan är sanningen
  }
  return jsonSvar({
    aktiv: status.aktiv,
    pausad: status.pausad,
    sessionId: transport.sessionId(),
    iteration: status.iteration,
    pagaendeTurn: status.pagaendeTurn === true,
    senasteEvent: status.senasteEvent ?? null,
    uppdaterad: status.uppdaterad ?? null,
    mal: status.mal,
  });
}
