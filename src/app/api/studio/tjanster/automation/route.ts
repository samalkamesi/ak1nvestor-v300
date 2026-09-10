import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport, StudioMetodSaknasError } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/automation — AUTOMATIONS-PANEL (VÅG 91 A1d).
 *
 * GET → {automationer:[{id,titel,cron?,status?,nastaKorning?,aktiverad?,
 * prompt?}]} — automation/list (kartan §2, $je-form: lifecycleStatus-
 * union active|completed|failed|paused; binärsond 2026-09-09). Skapande/
 * ändring/radering av automations är MEDVETET ej exponerad v91 (existensiell
 * åtgärd enligt våg-91-regeln R2 — styrelsen/kunden beslutar); panelen är
 * läsvy + status. Nästa steg (våg 92+) kan lägga POST create/update/delete
 * bakom samma ärliga 501-mönster.
 *
 * ÄRLIG 501: -32601 ⇒ {saknas:true} — UI:t DÖLJER panelen.
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
    const automationer = await transport.lasAutomationer();
    return jsonSvar({ automationer });
  } catch (fel) {
    if (fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true) {
      return jsonSvar({ saknas: true, fel: fel instanceof Error ? fel.message : "Metoden stöds ej." }, 501);
    }
    return jsonSvar({ fel: fel instanceof Error ? fel.message.slice(0, 300) : "Automationerna kunde ej listas." }, 502);
  }
}
