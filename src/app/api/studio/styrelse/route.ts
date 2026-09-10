/**
 * /api/studio/styrelse — STYRELSEMOTORNS API-YTA (VÅG 91 BLOCK A2,
 * STYRELSE-ADMIN-MEGA.md "TILLÄGG VÅG 91").
 *
 * POST {fraga}              → startar ett möte ASYNKRONT (5 organsessioner
 *                              i vågor inom MAX_AKTIVA_BARN=3; ordföranden
 *                              syntetiserar BESLUT; R2-klassning) och svarar
 *                              {id} direkt — mötet överlever requesten.
 * GET ?id=<mötesid>         → { status: "paga"|"klart"|"fel", handelser, beslut? }
 * GET ?id=&senast=<N>       → inkrementell poll: endast händelser med i>N
 *                              (klienten håller senaste numret och pollar).
 *
 * beslut (vid status=klart): { beslut, motivering, atgarder[], existential,
 * rollSammanfattning[] } + atgardsStatus "KORS_DIREKT"|"VANTAR_KUND" +
 * pipelineRader (antal rader som skrevs till data/forskning/PIPELINE-KO.md).
 *
 * SKYDD: requireAdmin på BÅDA metoderna (sessionscookie ak1a_admin eller
 * x-admin-password — samma som övriga studio-rutter). Möten kan aldrig
 * startas eller läsas av oauktoriserade klienter; svaren bär mötets egen
 * text och ALDRIG hemligheter/session-id:n.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { FRAGA_MAX_TECKEN, lasStyrelsemote, startaStyrelsemote } from "@/lib/studio/styrelse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** POST — starta möte (asynkront; svaret är bara mötes-id:t). */
export async function POST(req: NextRequest) {
  const kropp: Record<string, unknown> = await req.json().catch(() => ({}));
  const skydd = requireAdmin(req, kropp);
  if (skydd) return skydd;

  const fraga = typeof kropp.fraga === "string" ? kropp.fraga.trim() : "";
  if (!fraga) return jsonSvar({ error: "fraga krävs (icke-tom sträng)." }, 400);
  if (fraga.length > FRAGA_MAX_TECKEN) {
    return jsonSvar({ error: `fraga är för lång (max ${String(FRAGA_MAX_TECKEN)} tecken).` }, 400);
  }

  const id = startaStyrelsemote(fraga);
  return jsonSvar({ id });
}

/** GET — mötesvy / inkrementell poll (?id= krävs; ?senast=N valfritt). */
export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const id = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!id) return jsonSvar({ error: "id krävs (GET ?id=<mötesid>)." }, 400);

  const senastRå = Number(req.nextUrl.searchParams.get("senast"));
  const senast = Number.isInteger(senastRå) && senastRå >= 0 ? senastRå : -1;

  const mote = lasStyrelsemote(id, senast);
  if (!mote) return jsonSvar({ error: "Okänt mötes-id (mötet finns ej i denna process)." }, 404);
  return jsonSvar(mote);
}
