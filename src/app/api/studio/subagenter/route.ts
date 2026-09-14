import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/subagenter — VÅG 152 R1 (kunddirektivet "z code in och ut"):
 * broschlägger transportens BEVISADE session/subagents + session/
 * cancelBackgroundTask till en publik studio-yta (Organismen/BAKGRUNDSJOBB).
 * R1-expeditionen bekräftade metoderna i den officiella runtimen
 * (vendor/zcode.cjs) — transporten ägt dem sedan v83; det som saknades
 * var DENNA rutt så klienten kan läsa/styra utanför SSE-flödet.
 *
 * GET  → { sessionId, antal, subagenter:[StudioSubagent], live }
 *        (fel = ärliga men icke-fatala: tom lista + fel-fält)
 * POST → { taskId } → { avbrutet, meddelande } — childSessionId används
 *        som taskId (transportens dokumenterade konvention).
 *
 * SKYDD: requireAdmin på båda metoderna. Inga hemligheter lämnar servern.
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
    await transport.ensure();
    const subagenter = await transport.lasSubagenter();
    return jsonSvar({
      sessionId: transport.sessionId(),
      antal: subagenter.length,
      subagenter: subagenter.slice(0, 50),
      live: true,
    });
  } catch (fel) {
    return jsonSvar({
      sessionId: transport.sessionId(),
      antal: 0,
      subagenter: [],
      live: false,
      fel: fel instanceof Error ? fel.message.slice(0, 200) : "Agenten kunde ej nås.",
    });
  }
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;
  let taskId = "";
  try {
    const kropp = (await req.json()) as { taskId?: unknown };
    if (typeof kropp.taskId === "string") taskId = kropp.taskId.trim();
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  if (!taskId) return jsonSvar({ fel: "taskId krävs." }, 400);
  if (taskId.length > 200) return jsonSvar({ fel: "taskId är för långt." }, 400);
  const transport = hamtaStudioTransport();
  try {
    await transport.ensure();
    const svar = await transport.avbrytBakgrundsTask(taskId);
    return jsonSvar({ avbrutet: svar.avbruten, meddelande: svar.meddelande, taskId });
  } catch (fel) {
    return jsonSvar({
      avbrutet: false,
      meddelande: fel instanceof Error ? fel.message.slice(0, 200) : "Agenten kunde ej nås.",
      taskId,
    });
  }
}
