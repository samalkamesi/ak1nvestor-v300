import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaSessionTransport,
  replayTillKort,
  type StudioReplayKort,
  type StudioTransport,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/session/events — EVENTS-REPLAY VID ÅTERKOPPLING (VÅG 93 C4,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 93": nästa steg efter binärutredningen;
 * V93-P1-UNDERLAG kluster d). Kundvärdet: "vad gjorde agenten MEDAN JAG VAR
 * BORTA?" — historik-GET:en (våg 87 H1) ger svaren, denna rutt ger
 * VERKTYGSAKTIVITETEN ur protokollets session/events-replay (LIVE-bevisad
 * replväg i v83-kartan: "27 events efter 1 turn").
 *
 * GET ?sessionId=sess_x[&franSeq=N] → {sessionId, kort, antalRundor,
 *        antalEvents, nastaSeq}. Korten är AGGREGERADE per toolCallId till
 *        slutstatus (transportens RENA replayTillKort — samma fältparsning
 *        som live-korten) och renderas av UI:t med VerktygsKortVy.
 *        franSeq = paging-cursor (efterfrage: efterSeq) — utan den ges
 *        svansen (tak 100 events). nastaSeq bärs vidare för framtida
 *        cursor-bookkeeping (dokumenterad uppgraderingsväg).
 *
 * SVAR-FORMER: lasEventsFranSeq (C1) returnerar NULL när protokollet
 * avvisar (-32601/timeout) ⇒ 501 {saknas:true} — UI:t döljer replay-raden
 * graciellt (replay är LYX; historik-vägen består ALWAYS). Ogiltigt
 * sessions-id ⇒ 400. Sessionen kan ej öppnas (borta ur registret +
 * resume misslyckas) ⇒ 502 med ärlig feltext.
 *
 * KOSTNAD: hamtaSessionTransport återanvänder LEVANDE transport ur
 * registret; ENDAST en död session resume:ar (samma väg som stream-GET:s
 * sideload — ingen ny mekanik).
 *
 * SKYDD: requireAdmin. Sessions-id:t är protokollets offentliga
 * identifierare; korten bär truncaterade strängar (transportens budgeter).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Tak per fråga — svansen räcker för "vad hände medan jag var borta". */
const MAX_EVENTS_PER_FRAGA = 100;

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

// ── GET — replay-kort för en session ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const sessionId = req.nextUrl.searchParams.get("sessionId")?.trim() ?? "";
  if (!/^sess_[A-Za-z0-9._-]+$/.test(sessionId)) {
    return jsonSvar({ fel: "Ogiltigt sessions-id (kräver formen sess_…)." }, 400);
  }
  const franSeqRå = req.nextUrl.searchParams.get("franSeq");
  const franSeq =
    franSeqRå !== null && /^\d+$/.test(franSeqRå) ? Number(franSeqRå) : undefined;

  let transport: StudioTransport;
  try {
    ({ transport } = await hamtaSessionTransport(sessionId));
  } catch (fel) {
    return jsonSvar(
      {
        fel: `Sessionen kunde ej öppnas för replay: ${fel instanceof Error ? fel.message.slice(0, 200) : "okänt fel"}`,
      },
      502,
    );
  }

  let svar;
  try {
    svar = await transport.lasEventsFranSeq(sessionId, franSeq, MAX_EVENTS_PER_FRAGA);
  } catch (fel) {
    return jsonSvar(
      {
        fel: `Replay-läsningen misslyckades: ${fel instanceof Error ? fel.message.slice(0, 200) : "okänt fel"}`,
      },
      502,
    );
  }
  if (!svar) {
    // C1-sondens kontrakt: -32601/timeout ⇒ null ⇒ 501 {saknas} (graceful).
    return jsonSvar(
      { saknas: true, meddelande: "session/events stöds ej av denna agent-version." },
      501,
    );
  }

  const { kort, antalRundor, antalEvents } = replayTillKort(svar.handelser);
  const kortUtsnitt: StudioReplayKort[] = kort.slice(-30); // UI-budget: svansen
  return jsonSvar({
    sessionId,
    kort: kortUtsnitt,
    antalKortTotalt: kort.length,
    antalRundor,
    antalEvents,
    ...(svar.nastaSeq !== undefined ? { nastaSeq: svar.nastaSeq } : {}),
  });
}
