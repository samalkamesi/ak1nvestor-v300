import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport, StudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/resync — GAP-REGISTER POST 25 (V9/A3 — VÅG 172):
 * gap-ÅTERHÄMTNING via v4-gateway:ns eget resync-anrop.
 *
 * GET → transport.lasV4Resync() — v4/conversation/resync {sessionId} på
 * den LEVANDE studio-sessionen (V4-LAGRET §2 #6: returnerar initialWires
 * som postas via response-outbox + commit). Svaret bär utford + mappningen
 * wires ← initialWires, commit, atSeq, logEpoch + det opaka svaret under
 * "rått". Ramarna i initialWires uppdaterar transportens v4Revision internt
 * (state.updated-delta) — därmed hålls fileChanges-spåret vid liv efter
 * gateway-omstart/missade ramar.
 *
 * Normal väg in är lasFilandringar() när SAMTLIGA baseRevision-kandidater
 * blivit stale — denna rutt gör återhämtningen observabel/utlösbar
 * utanför diff-flödet (drift + tester).
 *
 * FEL-TOLERANT (200 med fel-fält): transportmetoden returnerar själv
 * {utford:false} vid fel — detta fångar det oväntade och svarar fortfarande
 * 200 {fel} så observabiliteten aldrig blir ett fel-kort. Utan levande
 * session ⇒ 200 {utford:false} (ärligt: inget gap att läka).
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
    const resync = await transport.lasV4Resync();
    return jsonSvar({ ...resync, transport: transport.namn });
  } catch (fel) {
    // Fel-tolerant: 200 med fel-fält — observabilitet ska aldrig 500:a.
    return jsonSvar({
      utford: false,
      fel: fel instanceof Error ? fel.message.slice(0, 300) : "v4/conversation/resync kunde ej utföras.",
      transport: transport.namn,
    });
  }
}
