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
 * POST 30 (V8/A3 — våg 181): POST {typ: "pauseGoal" | "resumeGoal"} →
 * transport.skickaV4MalStyrning — mål-loopens paus/fortsätt på
 * protokollvägen (§11.2 rad 238, tom payload). Målpanelens pausknappar
 * speglar sin övergång hit (UI-kopplingen); mål-motorns egen rutt förblir
 * den funktionella styrvägen. Ack "noop" = app-servern bar inget mål —
 * äkta domslut, ej fel (§11.5.1).
 *
 * POST 31+32 (V5/A2 + V7/A5 — våg 182): POST {typ: "setAutoDrain",
 * autoDrain} | {typ: "sendQueuedNow"|"deleteQueueItem", queueItemId} |
 * {typ: "editQueueItem", queueItemId, newText} | {typ:
 * "reorderQueueItem", queueItemId, beforeQueueItemId?: string|null} →
 * transport.skickaV4KoStyrning — kompöttningssystemets fyra operationer
 * + köns automatiska tömning (§11.2 rad 239–242). queueItemId härleds
 * klientförutsägbart som "queue_"+commandId (§11.5.1 Cse). Ack-"noop"
 * och guard-koderna (queueItemReserved, queueItemNotEditable,
 * queuePromotionBusy — §11.5.2) är ÄKTA domslut, ej fel. UI-koppling
 * (köpanel) är feature-avvägning enligt §11.4 — API-vägen först.
 *
 * Övriga typer (resolveInteraction, switchModelConfig) senare enligt
 * §11.4:s migreringsordning. Att ersätta dagens styrväg helt är
 * feature-avvägning enligt §11.4.
 *
 * Validering: text 1–4 000 tecken (chatt-promptkultur), delivery ∈
 * {startNow, queue} ("guide" väntar A6-insatsen — flight-timeout och
 * delivery-semantikens tre lägen mot mål-loopens serialisering); typ ∈
 * {pauseGoal, resumeGoal} för styrningsgrenen; kö-grenens payload per
 * §11.2 (autoDrain boolean, queueItemId trimmad icke-tom, newText
 * 1–4 000 tecken, beforeQueueItemId string|null).
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

  let kropp: {
    text?: unknown;
    delivery?: unknown;
    typ?: unknown;
    autoDrain?: unknown;
    queueItemId?: unknown;
    newText?: unknown;
    beforeQueueItemId?: unknown;
  };
  try {
    kropp = (await req.json()) as typeof kropp;
  } catch {
    return jsonSvar({ skickat: false, fel: "Ogiltig JSON-kropp." }, 400);
  }

  // POST 30 (våg 181): styrningsgrenen — pauseGoal/resumeGoal (§11.2).
  if (kropp.typ === "pauseGoal" || kropp.typ === "resumeGoal") {
    const transport: StudioTransport = hamtaStudioTransport();
    try {
      const svar = await transport.skickaV4MalStyrning(kropp.typ);
      return jsonSvar({ ...svar, transport: transport.namn });
    } catch (fel) {
      return jsonSvar({
        skickat: false,
        commandId: null,
        ack: null,
        fel: fel instanceof Error ? fel.message.slice(0, 300) : "v4/command kunde ej skickas.",
        transport: transport.namn,
      });
    }
  }

  // POST 31+32 (våg 182): kö-grenen — setAutoDrain + köoperationer (§11.2
  // rad 239–242). 400 ENDAST ogiltig kropp; protokollets egna domslut
  // (ack-status/reasonCode) passerar som 200-svar.
  if (kropp.typ !== undefined) {
    const transport: StudioTransport = hamtaStudioTransport();
    const q = typeof kropp.queueItemId === "string" ? kropp.queueItemId.trim() : "";
    const n = typeof kropp.newText === "string" ? kropp.newText.trim() : "";
    const b = typeof kropp.beforeQueueItemId === "string" ? kropp.beforeQueueItemId.trim() : "";
    let payload: {
      autoDrain?: boolean;
      queueItemId?: string;
      newText?: string;
      beforeQueueItemId?: string | null;
    };
    if (kropp.typ === "setAutoDrain") {
      if (typeof kropp.autoDrain !== "boolean") {
        return jsonSvar({ skickat: false, fel: "setAutoDrain kräver autoDrain boolean." }, 400);
      }
      payload = { autoDrain: kropp.autoDrain };
    } else if (kropp.typ === "editQueueItem") {
      if (!q) return jsonSvar({ skickat: false, fel: "editQueueItem kräver queueItemId." }, 400);
      if (!n || n.length > 4000) {
        return jsonSvar({ skickat: false, fel: "editQueueItem kräver newText (1–4 000 tecken)." }, 400);
      }
      payload = { queueItemId: q, newText: n };
    } else if (kropp.typ === "reorderQueueItem") {
      if (!q) return jsonSvar({ skickat: false, fel: "reorderQueueItem kräver queueItemId." }, 400);
      payload = { queueItemId: q, beforeQueueItemId: b === "" ? null : b };
    } else if (kropp.typ === "sendQueuedNow" || kropp.typ === "deleteQueueItem") {
      if (!q) return jsonSvar({ skickat: false, fel: `${kropp.typ} kräver queueItemId.` }, 400);
      payload = { queueItemId: q };
    } else {
      return jsonSvar(
        {
          skickat: false,
          fel: "typ måste vara pauseGoal, resumeGoal, setAutoDrain, sendQueuedNow, editQueueItem, reorderQueueItem eller deleteQueueItem.",
        },
        400,
      );
    }
    try {
      const svar = await transport.skickaV4KoStyrning(
        kropp.typ,
        payload,
      );
      return jsonSvar({ ...svar, transport: transport.namn });
    } catch (fel) {
      return jsonSvar({
        skickat: false,
        commandId: null,
        ack: null,
        fel: fel instanceof Error ? fel.message.slice(0, 300) : "v4/command kunde ej skickas.",
        transport: transport.namn,
      });
    }
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
