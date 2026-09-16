import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport, StudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/kommando — GAP-REGISTER POST 27 ETAPP 2 (V10/A6 —
 * HÖGST råvärdet): v4/command-inskickningen (V4-LAGRET §11, dekompilerad
 * rond 43). POST {text, delivery?} → transport.skickaV4SendText —
 * sendText-envelope enligt §11.1 (commandId/clientId/sessionId/type/
 * payload/issuedAt; clientId = transportens v4ConnectionId) på den
 * LEVANDE sessionen; svaret är protokollets ack (§11.3) där status
 * "rejected" + reasonCode "proto.invalidPayload" är ÄKTA domslut, ej fel.
 *
 * ENDAST sendText denna etapp (§11.4:s migreringsordning —
 * resolveInteraction, switchModelConfig, pause/resumeGoal och
 * köoperationerna senare). UI-kopplingen — att ersätta dagens styrväg —
 * är feature-avvägning enligt §11.4 och MEDVETET ej denna våg: rutten är
 * den admin-skyddade transportvägen + live-bevisyta.
 *
 * Validering: text 1–4 000 tecken (chatt-promptkultur), delivery ∈
 * {startNow, queue} ("guide" väntar A6-insatsen — flight-timeout och
 * delivery-semantikens tre lägen mot mål-loopens serialisering).
 * Fel-tolerant 200 {skickat:false, fel} för transportfel
 * (observabilitetskulturen) — 400 ENDAST ogiltig kropp (klientens fel).
 * GET ej exporterad ⇒ 405 (metodkontrakt).
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

  let kropp: { text?: unknown; delivery?: unknown };
  try {
    kropp = (await req.json()) as { text?: unknown; delivery?: unknown };
  } catch {
    return jsonSvar({ skickat: false, fel: "Ogiltig JSON-kropp." }, 400);
  }

  const text = typeof kropp.text === "string" ? kropp.text.trim() : "";
  if (!text) return jsonSvar({ skickat: false, fel: "text saknas eller är tom." }, 400);
  if (text.length > 4000) return jsonSvar({ skickat: false, fel: "text överskrider 4 000 tecken." }, 400);
  const delivery: "startNow" | "queue" = kropp.delivery === "queue" ? "queue" : "startNow";

  const transport: StudioTransport = hamtaStudioTransport();
  try {
    const svar = await transport.skickaV4SendText(text, { delivery });
    return jsonSvar({ ...svar, transport: transport.namn });
  } catch (fel) {
    // Fel-tolerant: 200 med fel-fält — transportvägen ska aldrig 500:a.
    return jsonSvar({
      skickat: false,
      commandId: null,
      ack: null,
      fel: fel instanceof Error ? fel.message.slice(0, 300) : "v4/command kunde ej skickas.",
      transport: transport.namn,
    });
  }
}
