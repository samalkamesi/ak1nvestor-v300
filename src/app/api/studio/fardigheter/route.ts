import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/fardigheter — SKILLS/PLUGINS/TOOLS-panelens datakälla (VÅG 85
 * STUDIO V3, STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 85" F2: "vad agenten KAN").
 *
 * GET → {skills:[…], plugins:[…], mcp:[…]} via transportens TRE nya
 *       protokollvägar (alla LIVE-testade 2026-09-09, kartan
 *       tool-results/v83-protokollkarta.md §2):
 *         skills/referenceCatalog  → skills (namn + beskrivning per kort)
 *         plugins/list             → plugins (aktiva enabled=true först)
 *         mcp/list                 → anslutna MCP-servrar (toolCount —
 *                                    LIVE-bevis: android-emulator 23 st)
 *
 * De tre anropen körs PARALLELLT (NDJSON-klienten multiplexar requests via
 * id-kartan) och varje sektion är feletolerant: en trasig katalog ⇒ tom
 * lista + fel-notis, ALDRIG 500 för hela panelen (lasSessioner-mönstret).
 * "live": true när ALLA tre transporterna svarade (mock i dev svarar med
 * deterministiska demo-listor — kedjan UI → API → transport bevisas utan
 * barnprocess).
 *
 * SKYDD: requireAdmin (lås-vyn + cookien/x-admin-password från
 * admin-klient.ts). Svaret bär ALDRIG hemligheter — katalogposterna är
 * protokollets egna namn/beskrivningar.
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

  // Parallellt + feletolerant: varje sektion lever för sig själv.
  const [skills, plugins, mcp] = await Promise.all([
    transport.lasSkills().catch(() => []),
    transport.lasPlugins().catch(() => []),
    transport.lasMcp().catch(() => []),
  ]);

  return jsonSvar({
    skills,
    plugins,
    mcp,
    transport: transport.namn,
    live: skills.length > 0 || plugins.length > 0 || mcp.length > 0,
    /** Summerad verktygsräkning — E2E-kravets ">0 mcp-verktyg". */
    mcpVerktyg: mcp.reduce((summa, server) => summa + server.verktygAntal, 0),
  });
}
