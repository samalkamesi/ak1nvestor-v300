import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaStudioTransport,
  StudioMetodSaknasError,
  StudioTransport,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/automation/pausa — PAUSA/AKTIVERA AUTOMATION
 * (VÅG 92 B2) — automation/update via transport.automationUppdatera
 * (MEGA våg 92 B1: "automationSkapa/Uppdatera(pausa)/Radera").
 *
 * POST {id, pausad: boolean} → pausad=true pausar (enabled:false →
 * lifecycleStatus "paused"), pausad=false återaktiverar ("active").
 *
 * B1-KONTRAKT VÅG 92 (landat): automationUppdatera(id, {pausad}) —
 * anropet är TYPAT mot B1:s signatur. typeof-vakten skyddar runtime-
 * fallet "transportINSTANSEN saknar metoden" (t.ex. dev-mock under
 * uppbyggnad) ⇒ 501 {saknas:true}; -32601 fångas av catchen (samma 501).
 *
 * SKYDD: requireAdmin. Pedagogisk plattform — inte investeringsråd.
 */

/** id-tak (tecken) — protokoll-id är korta GUID:er. */
const MAX_ID_TEEKEN = 200;

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** 501/502-vakt: transportmetoden saknas (-32601) ⇒ ärlig {saknas:true}. */
function svarVidTransportFel(fel: unknown, standard: string): Response {
  if (fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true) {
    return jsonSvar(
      { saknas: true, fel: fel instanceof Error ? fel.message : "Metoden stöds ej." },
      501,
    );
  }
  return jsonSvar(
    { fel: fel instanceof Error ? fel.message.slice(0, 300) : standard },
    502,
  );
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let id = "";
  let pausad: boolean | undefined;
  try {
    const kropp = (await req.json()) as { id?: unknown; pausad?: unknown };
    if (typeof kropp.id === "string") id = kropp.id.trim();
    if (typeof kropp.pausad === "boolean") pausad = kropp.pausad;
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  if (!id) return jsonSvar({ fel: "id krävs." }, 400);
  if (id.length > MAX_ID_TEEKEN) return jsonSvar({ fel: "id är för långt." }, 400);
  if (pausad === undefined) {
    return jsonSvar({ fel: "pausad krävs (true = pausa, false = återaktivera)." }, 400);
  }

  const transport: StudioTransport = hamtaStudioTransport();
  const automationUppdatera = transport.automationUppdatera;
  if (typeof automationUppdatera !== "function") {
    return jsonSvar(
      {
        saknas: true,
        fel: "automationUppdatera finns ej på transportinstansen.",
      },
      501,
    );
  }
  try {
    await automationUppdatera(id, { pausad });
    return jsonSvar({ ok: true, id, pausad });
  } catch (fel) {
    return svarVidTransportFel(fel, "Automationen kunde ej uppdateras.");
  }
}
