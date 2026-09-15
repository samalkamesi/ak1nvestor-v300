import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/sessions-index — REALTIME MULTI-SESSION-INDEX (GAP-REGISTER
 * POST 26, V7/A3 — V4-LAGRET §4, topp-3 gap #3).
 *
 * GET (requireAdmin) → prenumereraSessionsIndex() på "sessions-index/*":
 *   {
 *     hamtat, transport, live,
 *     prenumererad:          true när v4-prenumerationen äckades,
 *     topic:                 "sessions-index/<filter>" (default "*"),
 *     rått:                  <det opaka v4/subscribe-svaret>,
 *     fel?:                  felmeddelande vid transportfel
 *   }
 *
 * Live-index över sessioner via den befintliga subscribe-mekanismen —
 * multi-session-medvetande UTAN polling av sessionList (kan ersätta delar
 * av R2-poll-lagret). Fel-tolerant 200: transportfel ⇒ {live:false, fel} —
 * ALDRIG krasch (index-prenumeration är en förbättring, inte ett krav).
 *
 * SKYDD: requireAdmin — admin-only. Inga nycklar, inga sökvägar ur svaret.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

interface SessionsIndexSvar {
  hamtat: string;
  transport: string;
  live: boolean;
  prenumererad: boolean;
  topic: string;
  rått: unknown | null;
  fel?: string;
}

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  try {
    const transport = hamtaStudioTransport();
    const svar = await transport.prenumereraSessionsIndex();
    return Response.json(
      {
        hamtat: new Date().toISOString(),
        transport: transport.namn,
        live: svar.prenumererad,
        prenumererad: svar.prenumererad,
        topic: svar.topic ?? "sessions-index/*",
        rått: svar.rått ?? null,
      } satisfies SessionsIndexSvar,
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (fel) {
    return Response.json(
      {
        hamtat: new Date().toISOString(),
        transport: hamtaStudioTransport().namn,
        live: false,
        prenumererad: false,
        topic: "sessions-index/*",
        rått: null,
        fel:
          fel instanceof Error
            ? `sessions-index kunde ej prenumereras: ${fel.message.slice(0, 300)}`
            : "sessions-index kunde ej prenumereras (okänt fel).",
      } satisfies SessionsIndexSvar,
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
