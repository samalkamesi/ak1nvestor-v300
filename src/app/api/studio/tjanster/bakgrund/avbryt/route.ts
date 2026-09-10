import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport, StudioMetodSaknasError } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/bakgrund/avbryt — AVBRYT BAKGRUNDSJOB (VÅG 91 A1d).
 *
 * POST {id} → transport.avbrytBakgrundsTask(id) → session/
 * cancelBackgroundTask {sessionId, taskId} (kartan §1) → {avbruten,
 * meddelande}. För subagenter används childSessionId som taskId
 * (dokumenterat val i transporten). OBS: detta är den EXPLICITA
 * användar-åtgärden — mångfaldigt skild från klient-abort (A1c: en borta
 * klient stoppar ALDRIG arbete; ENDAST denna knapp gör det).
 *
 * ÄRLIG 501: -32601 ⇒ {saknas:true} (UI:t döljer panelen).
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

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let id = "";
  try {
    const kropp = (await req.json()) as { id?: unknown };
    if (typeof kropp.id === "string") id = kropp.id.trim();
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  if (!id) return jsonSvar({ fel: "id krävs (taskId eller childSessionId)." }, 400);
  if (id.length > 200) return jsonSvar({ fel: "id är för långt." }, 400);

  const transport = hamtaStudioTransport();
  try {
    const svar = await transport.avbrytBakgrundsTask(id);
    return jsonSvar(svar);
  } catch (fel) {
    if (fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true) {
      return jsonSvar({ saknas: true, fel: fel instanceof Error ? fel.message : "Metoden stöds ej." }, 501);
    }
    return jsonSvar({ fel: fel instanceof Error ? fel.message.slice(0, 300) : "Tasken kunde ej avbrytas." }, 502);
  }
}
