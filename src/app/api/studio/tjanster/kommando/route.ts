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
 * POST 28 (V8/A4 — våg 184): POST {typ: "resolveInteraction", optionId?} →
 * transport.skickaV4InteraktionSvar — dialog- och behörighetskortens
 * svarsväg (§11.2 rad 235–236, §11.4:s migreringssteg 2): payload
 * {resolvedBy: {clientId, optionId?}} där clientId härleds i transporten
 * till dess v4ConnectionId. Ack "noop" = ingen väntande interaktion —
 * äkta domslut, ej fel (§11.5.1). UI-koppling (dialog-kortens övergång)
 * är feature-avvägning enligt §11.4 — API-vägen först.
 *
 * POST 29 (V6/A4 — våg 183): POST {typ: "switchModelConfig", modellId} →
 * transport.skickaV4Modellbyte — modellbytardrawerns kommando (§11.2 rad
 * 237, §11.4:s migreringssteg 3): modellbyte på den levande sessionen
 * via kommandobussen. §11.2 bär inget explicit payload-schema för typen
 * — lasten {modelId} är vår tolkning av modellkatalogens id-kultur
 * (våg 82), protokollets egen domslutsväg (proto.invalidPayload,
 * fault.command.notImplemented/capabilityUnsupported — §11.5.2) är
 * slutdomare och passerar som 200-svar. Modell-katalogens rutt (våg
 * 85/169 → bytModell) förblir den funktionella styrvägen; drawerns
 * övergång hit är feature-avvägning enligt §11.4.
 *
 * POST 33 (V6/A6 — våg 187): POST {typ: "createSession" | "createSelectionSideSession",
 * text?, runtimeModel?} → transport.skickaV4SessionsFodelse — sessionsfödelse
 * via kommandobussen (§11.2 rad 232–234): createSession bär envelope-
 * sessionId NULL (§11.1 rad 214) med firstInput {text} + runtimeModel som
 * enda exponerade last (workspaceId/config/attachments/mcpServers utelämnas
 * — app-servern process-äger workspacen, dokumenterad tolkning);
 * createSelectionSideSession tolkas mot AKTIV session (markeringssidessionen
 * föds ur pågående samtal). readyFlights-ko (§11.3) sker app-server-sidigt.
 * Protokollets egna domslut (ack-status/reasonCode, §11.5.2 — bl.a.
 * proto.invalidPayload, fault.command.notImplemented) passerar som
 * 200-svar. Dagens sessions-rutt (våg 149+) förblir funktionell styrväg;
 * övergången är feature-avvägning enligt §11.4.
 *
 * POST 34 (V6/A6 — våg 188): POST {typ: "applyFileRewind"|"forkAssistant"|
 * "editUserQuery"|"retryTurn"|"setAssistantFeedback", rowId, entityId,
 * feedback?|newText?+workspaceMode?} → transport.skickaV4FaktaKommando —
 * fakta-typerna (Vft-mängden, ZCODE-GAP-34-KARTLAGGNING): radmålade
 * CAS-kommandon (envelope bär baseRevision + baseLogEpoch från
 * transportens live-spårning, §2.2) vars domslut persisteras i
 * v4/command_fact (§4). "stale" = läget hunnit gå vidare (ÄKTA domslut
 * — hämta färskt läge vid omtryck); guard/fault-koder (§3) passerar som
 * 200-svar. attachments (editUserQuery) väntar A6 — newText krävs.
 *
 * Övriga typer enligt §11.4:s migreringsordning följer i sina vågor.
 * Att ersätta dagens styrväg helt är feature-avvägning enligt §11.4.
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
    optionId?: unknown;
    modellId?: unknown;
    runtimeModel?: unknown;
    rowId?: unknown;
    entityId?: unknown;
    feedback?: unknown;
    workspaceMode?: unknown;
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

  // POST 28 (våg 184): interaktions-grenen — resolveInteraction (§11.2 rad
  // 235–236). optionId valfri (dialog utan alternativ skickas utan);
  // clientId härleds i transporten. 400 ENDAST ogiltig kropp; protokollets
  // eget domslut ("noop") passerar som 200-svar.
  if (kropp.typ === "resolveInteraction") {
    const o = typeof kropp.optionId === "string" ? kropp.optionId.trim() : "";
    if (kropp.optionId !== undefined && kropp.optionId !== null && o === "") {
      return jsonSvar({ skickat: false, fel: "optionId måste vara icke-tom string eller utelämnas." }, 400);
    }
    if (o.length > 200) {
      return jsonSvar({ skickat: false, fel: "optionId överskrider 200 tecken." }, 400);
    }
    const transport: StudioTransport = hamtaStudioTransport();
    try {
      const svar = await transport.skickaV4InteraktionSvar(o === "" ? null : o);
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

  // POST 29 (våg 183): modell-grenen — switchModelConfig (§11.2 rad 237).
  // modellId: katalogens id-kultur (våg 82), trimmad icke-tom. 400 ENDAST
  // ogiltig kropp; protokollets egna domslut (ack-status/reasonCode,
  // §11.5.2) passerar som 200-svar.
  if (kropp.typ === "switchModelConfig") {
    const m = typeof kropp.modellId === "string" ? kropp.modellId.trim() : "";
    if (!m) {
      return jsonSvar({ skickat: false, fel: "switchModelConfig kräver modellId." }, 400);
    }
    if (m.length > 200) {
      return jsonSvar({ skickat: false, fel: "modellId överskrider 200 tecken." }, 400);
    }
    const transport: StudioTransport = hamtaStudioTransport();
    try {
      const svar = await transport.skickaV4Modellbyte(m);
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

  // POST 33 (våg 187): sessions-grenen — createSession/createSelectionSideSession
  // (§11.2 rad 232–234). text = firstInput.text (valfri), runtimeModel valfri.
  // 400 ENDAST ogiltig kropp; protokollets egna domslut (ack-status/
  // reasonCode, §11.5.2) passerar som 200-svar.
  if (kropp.typ === "createSession" || kropp.typ === "createSelectionSideSession") {
    const t = typeof kropp.text === "string" ? kropp.text.trim() : "";
    if (kropp.text !== undefined && t === "") {
      return jsonSvar({ skickat: false, fel: "text måste vara icke-tom string eller utelämnas (firstInput.text)." }, 400);
    }
    if (t.length > 4000) {
      return jsonSvar({ skickat: false, fel: "text överskrider 4 000 tecken (firstInput.text)." }, 400);
    }
    const rm = typeof kropp.runtimeModel === "string" ? kropp.runtimeModel.trim() : "";
    if (kropp.runtimeModel !== undefined && rm === "") {
      return jsonSvar({ skickat: false, fel: "runtimeModel måste vara icke-tom string eller utelämnas." }, 400);
    }
    if (rm.length > 200) {
      return jsonSvar({ skickat: false, fel: "runtimeModel överskrider 200 tecken." }, 400);
    }
    const transport: StudioTransport = hamtaStudioTransport();
    try {
      const svar = await transport.skickaV4SessionsFodelse(
        kropp.typ,
        t === "" ? undefined : t,
        rm === "" ? undefined : rm,
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

  // POST 34 (våg 188): fakta-grenen — Vft-mängden (ZCODE-GAP-34-KARTLAGGNING
  // §2): applyFileRewind/forkAssistant/editUserQuery/retryTurn/
  // setAssistantFeedback — de radmålade CAS-kommandona vars domslut
  // persisteras i v4/command_fact (§4). target {rowId, entityId} =
  // rowsRange-identifierarna (§2.3, strict — 400 ENDAST ogiltig kropp).
  // CAS-fälten bärs av transporten (baseRevision + baseLogEpoch ur dess
  // live-spårning, §2.2) — "stale"-ack är ÄKTA domslut (läget hunnit gå
  // vidare; hämta färskt läge vid omtryck), liksom guard-koderna
  // (guard.actionUnavailable, guard.latestQueryEditOnly,
  // guard.latestAssistantRetryOnly, guard.forkTargetNotStable) och
  // fault-koderna (fault.command.assistantFeedbackUnsupported m.fl. §3)
  // — samtliga passerar som 200-svar. UI-koppling (tumme-upp/ner,
  // kör-igen, filspolning) är feature-avvägning enligt §11.4 — API-vägen
  // först.
  if (
    kropp.typ === "applyFileRewind" ||
    kropp.typ === "forkAssistant" ||
    kropp.typ === "editUserQuery" ||
    kropp.typ === "retryTurn" ||
    kropp.typ === "setAssistantFeedback"
  ) {
    if (typeof kropp.rowId !== "number" || !Number.isInteger(kropp.rowId) || kropp.rowId < 0) {
      return jsonSvar({ skickat: false, fel: "Fakta-kommandot kräver rowId (heltal ≥ 0)." }, 400);
    }
    const eid = typeof kropp.entityId === "string" ? kropp.entityId.trim() : "";
    if (!eid) {
      return jsonSvar({ skickat: false, fel: "Fakta-kommandot kräver entityId (icke-tom)." }, 400);
    }
    if (eid.length > 200) {
      return jsonSvar({ skickat: false, fel: "entityId överskrider 200 tecken." }, 400);
    }
    const extras: { newText?: string; feedback?: "like" | "dislike" | null; workspaceMode?: "preserve" | "rewind" } = {};
    if (kropp.typ === "setAssistantFeedback") {
      if (kropp.feedback !== undefined && kropp.feedback !== "like" && kropp.feedback !== "dislike" && kropp.feedback !== null) {
        return jsonSvar({ skickat: false, fel: 'setAssistantFeedback kräver feedback "like" | "dislike" | null (eller utelämnat).' }, 400);
      }
      extras.feedback = kropp.feedback === undefined ? null : kropp.feedback;
    } else if (kropp.typ === "editUserQuery") {
      const n = typeof kropp.newText === "string" ? kropp.newText.trim() : "";
      if (!n || n.length > 4000) {
        return jsonSvar({ skickat: false, fel: "editUserQuery kräver newText (1–4 000 tecken)." }, 400);
      }
      if (kropp.workspaceMode !== undefined && kropp.workspaceMode !== "preserve" && kropp.workspaceMode !== "rewind") {
        return jsonSvar({ skickat: false, fel: 'workspaceMode måste vara "preserve" eller "rewind" (eller utelämnas).' }, 400);
      }
      extras.newText = n;
      if (kropp.workspaceMode === "preserve" || kropp.workspaceMode === "rewind") {
        extras.workspaceMode = kropp.workspaceMode;
      }
    }
    const transport: StudioTransport = hamtaStudioTransport();
    try {
      const svar = await transport.skickaV4FaktaKommando(
        kropp.typ,
        { rowId: kropp.rowId, entityId: eid },
        extras,
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
          fel: "typ måste vara pauseGoal, resumeGoal, resolveInteraction, switchModelConfig, createSession, createSelectionSideSession, setAutoDrain, sendQueuedNow, editQueueItem, reorderQueueItem, deleteQueueItem, applyFileRewind, forkAssistant, editUserQuery, retryTurn eller setAssistantFeedback.",
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
