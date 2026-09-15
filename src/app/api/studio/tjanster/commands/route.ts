import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport, StudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/commands — GAP-REGISTER POST 27 (V10/A6 — HÖGST
 * råvärdet): v4/commands/query — inbox-köns LIVE-STATUS (V4-LAGRET §2 #20
 * + §9 gap 4). v4/command-inskickningen själv är strategisk etapp 2
 * (lagret rad 184) — denna rutt gör KÖ-STATUS- läsningen observabel först.
 *
 * GET → transport.lasV4Kommandon() — v4/commands/query
 * {commands:[{sessionId}]} på den LEVANDE studio-sessionen →
 * {kommandon:[…]} (protokollets opaka results[] — statusfält ej
 * dekompilerade i V4-LAGRET, panelen renderar defensivt).
 *
 * POST {commandId?} → transport.lasV4KommandoFakta(commandId) — samma
 * wire-metod filtrerad {commands:[{commandId}]}: v4/command_fact är en
 * INTERN DB-faktatyp (ej wire — V4-LAGRET §5) så kommandots fakta/ack-
 * status ytas via den wire-legala query-vägen. Utan commandId: senaste
 * kommandot i sessionens kö. → {fakta, rått?} (fakta null = inget hittat).
 *
 * FEL-TOLERANT (200 med fel-fält): transportmetoderna returnerar själva
 * tomma svar vid fel — detta fångar det oväntade och svarar fortfarande
 * 200 {fel} så kö-observabiliteten aldrig blir ett fel-kort. Utan levande
 * session ⇒ 200 {kommandon: []} (ärligt: tom kö att rapportera).
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

  const transport: StudioTransport = hamtaStudioTransport();
  try {
    const { kommandon } = await transport.lasV4Kommandon();
    return jsonSvar({ kommandon, transport: transport.namn });
  } catch (fel) {
    // Fel-tolerant: 200 med fel-fält — observabilitet ska aldrig 500:a.
    return jsonSvar({
      kommandon: [],
      fel: fel instanceof Error ? fel.message.slice(0, 300) : "v4/commands/query kunde ej läsas.",
      transport: transport.namn,
    });
  }
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let commandId: string | undefined;
  try {
    const kropp = (await req.json()) as { commandId?: unknown };
    if (typeof kropp.commandId === "string" && kropp.commandId.trim()) {
      commandId = kropp.commandId.trim().slice(0, 200);
    }
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }

  const transport: StudioTransport = hamtaStudioTransport();
  try {
    const { fakta, rått } = await transport.lasV4KommandoFakta(commandId);
    return jsonSvar({ ...(rått !== undefined ? { rått } : {}), fakta, transport: transport.namn });
  } catch (fel) {
    // Fel-tolerant: 200 med fel-fält — observabilitet ska aldrig 500:a.
    return jsonSvar({
      fakta: null,
      fel: fel instanceof Error ? fel.message.slice(0, 300) : "v4/commands/query kunde ej läsas.",
      transport: transport.namn,
    });
  }
}
