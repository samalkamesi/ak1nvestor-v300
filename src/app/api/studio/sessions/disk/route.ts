import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { lasSessionerFranDisk } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/sessions/disk — SESSIONSLISTAN UR zcode:S EGNA
 * SESSIONSDATABASEN (VÅG 148F u1 — desktop-Z-paritet).
 *
 * GET → {sessioner:[{sessionId,title,timeUpdated,directory,messageCount}]}
 *       nyast först, tak 50, endast trådar (id "sess_…" — subagent-barn
 *       "sess_suba…" hålls borta). Samma källa som desktop-Z:s sessionsvy
 *       och trådhistoriken (v148): ~/.zcode/cli/db/db.sqlite via readOnly
 *       node:sqlite-handle (HOME → USERPROFILE → /home/ak1a) — listan
 *       lever ÄVEN när den levande transportens session/list är tom
 *       (omstart, okänd session), så "Äldre sessioner" aldrig står tom
 *       medan databasen minns allt.
 *
 * SKYDD: requireAdmin (samma som övriga studio-rutter — sessionscookie
 * ak1a_admin eller x-admin-password; dev-fallback endast i development).
 * Svaret cachas aldrig (studio-ytan får aldrig cachas).
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

  try {
    return jsonSvar({ sessioner: lasSessionerFranDisk() });
  } catch (fel) {
    // Databasen är stöd, aldrig fatal — ärlig tom lista + synlig orsak.
    console.warn("[V148F] sessionslistan ur db.sqlite misslyckades: " + String(fel).slice(0, 120));
    return jsonSvar({ sessioner: [] });
  }
}
