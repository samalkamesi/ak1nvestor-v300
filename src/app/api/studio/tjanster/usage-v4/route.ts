import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport, StudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/usage-v4 — GAP-REGISTER POST 24 (V8/A2): GRATIS
 * kostnadsobservabilitet via v4-gateway:ns eget usage-anrop.
 *
 * GET → transport.lasV4Anvandning() — v4/conversation/usage {sessionId} på
 * den LEVANDE studio-sessionen (V4-LAGRET §2 #13: per-session token-räkning
 * {totalTokens, inputTokens, outputTokens, reasoningTokens,
 * cacheCreationTokens, cacheReadTokens, modelRequestCount, …}). Svaret bär
 * mappningen totalTokensIn ← inputTokens, totalTokensOut ← outputTokens,
 * requestCount ← modelRequestCount + det opaka svaret under "rått".
 *
 * FEL-TOLERANT (200 med fel-fält): transportmetoden returnerar själv ett
 * tomt objekt vid fel — detta fångar det oväntade och svarar fortfarande
 * 200 {fel} så kostnadspanelen aldrig blir ett fel-kort. Utan levande
 * session ⇒ 200 med tomt objekt (ärligt: inget att rapportera).
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
    const anvandning = await transport.lasV4Anvandning();
    return jsonSvar({ ...anvandning, transport: transport.namn });
  } catch (fel) {
    // Fel-tolerant: 200 med fel-fält — observabilitet ska aldrig 500:a.
    return jsonSvar({
      fel: fel instanceof Error ? fel.message.slice(0, 300) : "v4/conversation/usage kunde ej läsas.",
      transport: transport.namn,
    });
  }
}
