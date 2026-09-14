import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport, StudioMetodSaknasError } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/generera — HEADLESS TEXTGENERERING (VÅG 91 A1d).
 *
 * POST {prompt} → transport.genereraText → workspace/upsertModelProvider
 * (m7: kurerar providern i arbetsytans register, apiKey ur serverns
 * ~/.zcode/cli/config.json) DÄREFTER workspace/generateText
 * {workspace, modelRef (ur sessionens kontext), prompt, querySource:
 * "ak1a-studio"} (kartan §2 — headless, Ingen turn/session) → {text}.
 * Modellväljaren (till skillnad från chatturner) kan INVÄNTA svaret:
 * protokollmetoden är avsett synkront (finishReason/usage i svaret).
 *
 * ÄRLIG 501: -32601 ⇒ {saknas:true} — UI:t DÖLJER panelen.
 *
 * SKYDD: requireAdmin. Pedagogisk plattform — inte investeringsråd.
 */

/** Promptens tak (tecken) — samma budget som /api/studio/stream. */
const MAX_PROMPT_TEEKEN = 50_000;

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

  let prompt = "";
  try {
    const kropp = (await req.json()) as { prompt?: unknown };
    if (typeof kropp.prompt === "string") prompt = kropp.prompt;
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  prompt = prompt.trim();
  if (!prompt) return jsonSvar({ fel: "Prompten är tom." }, 400);
  if (prompt.length > MAX_PROMPT_TEEKEN) {
    return jsonSvar({ fel: `Prompten är för lång (max ${MAX_PROMPT_TEEKEN} tecken).` }, 400);
  }

  const transport = hamtaStudioTransport();
  try {
    const svar = await transport.genereraText(prompt);
    return jsonSvar({ text: svar.text });
  } catch (fel) {
    if (fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true) {
      return jsonSvar({ saknas: true, fel: fel instanceof Error ? fel.message : "Metoden stöds ej." }, 501);
    }
    return jsonSvar({ fel: fel instanceof Error ? fel.message.slice(0, 300) : "Texten kunde ej genereras." }, 502);
  }
}
