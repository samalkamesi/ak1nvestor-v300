import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport, StudioMetodSaknasError } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/webblasare — WEBBLÄSAR-PANEL (VÅG 91 A1d).
 *
 * GET  → {blasare:[{id,generation,typ?,namn?}]} — interaction/browserList
 *        (binärsond 2026-09-09: kräver requestId+sessionId+workspace+
 *        clientMode+sessionContext; svaret {browsers:[{id,generation,
 *        type,name,capabilities,…}]}).
 * POST {kommando, browserId?, browserGeneration?} → interaction/
 *        browserExecute — kör ett webbläsarkommando; svaret är protokollets
 *        råa form (opak) i fältet "resultat" (UI:t renderar defensivt).
 *
 * ÄRLIG 501: -32601 ⇒ {saknas:true} — UI:t DÖLJER panelen (zcode-versionen
 * saknar interaktionsdomänens webbläsarmetoder).
 *
 * SKYDD: requireAdmin. kommando trunkeras (4 000 tecken) — inga hemligheter.
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
    const blasare = await transport.lasWebblasare();
    return jsonSvar({ blasare });
  } catch (fel) {
    if (fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true) {
      return jsonSvar({ saknas: true, fel: fel instanceof Error ? fel.message : "Metoden stöds ej." }, 501);
    }
    return jsonSvar({ fel: fel instanceof Error ? fel.message.slice(0, 300) : "Webbläsarna kunde ej listas." }, 502);
  }
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let kommando = "";
  let browserId = "";
  let browserGeneration: number | undefined;
  try {
    const kropp = (await req.json()) as {
      kommando?: unknown;
      browserId?: unknown;
      browserGeneration?: unknown;
    };
    if (typeof kropp.kommando === "string") kommando = kropp.kommando.trim();
    if (typeof kropp.browserId === "string") browserId = kropp.browserId.trim();
    if (typeof kropp.browserGeneration === "number" && Number.isInteger(kropp.browserGeneration) && kropp.browserGeneration >= 0) {
      browserGeneration = kropp.browserGeneration;
    }
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  if (!kommando) return jsonSvar({ fel: "kommando krävs." }, 400);

  const transport = hamtaStudioTransport();
  try {
    const resultat = await transport.korWebblasare({
      kommando,
      ...(browserId ? { browserId } : {}),
      ...(browserGeneration !== undefined ? { browserGeneration } : {}),
    });
    return jsonSvar({ resultat });
  } catch (fel) {
    if (fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true) {
      return jsonSvar({ saknas: true, fel: fel instanceof Error ? fel.message : "Metoden stöds ej." }, 501);
    }
    return jsonSvar({ fel: fel instanceof Error ? fel.message.slice(0, 300) : "Kommandot kunde ej köras." }, 502);
  }
}
