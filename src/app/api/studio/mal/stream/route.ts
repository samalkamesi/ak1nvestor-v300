import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaStudioTransport,
  markeraMalIterationSlut,
  markeraMalIterationStart,
  type StudioEvent,
  type StudioFilandring,
  type StudioKontext,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/mal/stream — MÅL-LÄGETS SSE-BRYGGA (VÅG 85 STUDIO V3 F1,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 85" block F1: kundens "live utveckling
 * som Z").
 *
 * POST → SSE (text/event-stream) av den AUTONOMA mål-loopens events på
 * DEFAULT-transporten (huvudtabben): transport.prenumereraMal levererar
 *   · "mal_status"   {aktiv, pausad, iteration, mal} — snapshot direkt +
 *     vid set/paus/återuppta/rensa (iterationräknaren lever i transporten)
 *   · "mal_iteration"{fas start|slut, iteration, svar?, statistik} —
 *     turn.started/completed i mål-loopen (KVD-pixeln)
 *   · "mal_pausad"   {iteration} — goal-pause (session/stop)
 *   · därtill ALLA streaming-event (delta/verktyg_kort/verktyg_input/
 *     runda/status) så varje autonom iteration renderas som en KOMPLETT
 *     turn i chatten — protokollet matar nya turner AV SIG SJÄLVT (v83 B3:
 *     mål-set startar loopen; session/stop pausar), INGEN prompt skickas.
 * EFTER varje avslutad iteration skickas "kontext" (session/read) +
 * "ändringar" (senaste turnens Write/Edit/MultiEdit-diff) — ändrings-
 * panelen får samma underlag som efter en chattad turn.
 *
 * Självläkning: strömmen sondernar transportens mål-läge (sondMal —
 * session/goal show) vid öppning så ett LEVANDE mål efter en pm2-omstart
 * återaktiveras och iterationerna fortsätter strömma.
 *
 * Strömmen lever TILLS klienten kopplar ned (abort ⇒ avprenumerera) —
 * heartbeats var 15:e s håller proxyn öppen (samma mönster som
 * /api/studio/stream). Events före prenumerering BUFFRAS i transporten
 * (MAL_BUFFERT) och spolas här — ras-skyddet mellan mål-set och
 * ström-öppning.
 *
 * SKYDD: requireAdmin. Strömmen sanerar ALDRIG hemligheter — events är
 * transportens trunkerade strängar (samma budgetar som chatten).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Tillförlitlig stringify av SSE-event (nya rader escapes automatiskt). */
function sseRad(
  event:
    | StudioEvent
    | { typ: "kontext"; kontext: StudioKontext | null }
    | { typ: "ändringar"; filer: StudioFilandring[] },
): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const transport = hamtaStudioTransport();

  const stream = new ReadableStream<Uint8Array>({
    start(kontroll) {
      const skrivare = new TextEncoder();
      /** Nedkopplingsvakt — enqueue på död stream kastar aldrig. */
      const skicka = (event: Parameters<typeof sseRad>[0]) => {
        try {
          kontroll.enqueue(skrivare.encode(sseRad(event)));
        } catch {
          // klienten borta — abort-signalen städar
        }
      };

      // Heartbeat var 15:e s (håller nginx/proxy-bufferten öppen).
      const hjarta = setInterval(() => {
        try {
          kontroll.enqueue(skrivare.encode(": hjarta\n\n"));
        } catch {
          // tyst
        }
      }, 15_000);

      // Efterspel per avslutad iteration: färsk kontext + diff — samma
      // underlag som /api/studio/stream skickar efter en chattad turn.
      // VÅG 87 H1/H2: varje iteration markeras I SESSIONSKARTAN (som
      // debouncat skrivs till disk) — autonomt arbete medan användaren är
      // borta syns i historiken när hen återkommer (GET:s
      // senastAktivSessionId + senastAktivHistorik + aktivtMal).
      const malSid = transport.sessionId();
      const skickaMedEfterspel = (event: Parameters<typeof sseRad>[0]) => {
        skicka(event);
        if (event.typ === "mal_iteration") {
          if (event.fas === "start") markeraMalIterationStart(malSid);
          else markeraMalIterationSlut(malSid, event.iteration, event.svar ?? "");
        }
        if (event.typ === "mal_iteration" && event.fas === "slut") {
          void transport
            .lasKontext()
            .then((kontext) => skicka({ typ: "kontext", kontext }))
            .catch(() => undefined);
          void transport
            .lasFilandringar()
            .then((filer) => skicka({ typ: "ändringar", filer }))
            .catch(() => undefined);
        }
      };

      const avprenumerera = transport.prenumereraMal(skickaMedEfterspel);

      // Självläkning: sond ur session/goal show aktiverar mål-läget för
      // ett LEVANDE mål (pm2-omstart tappade transportens in-memory-state;
      // protokollets goal lever kvar i sessionen). Sondens mal_status
      // korrigeringar skickas till klienten om läget ändrades.
      const sond = setTimeout(() => {
        void transport
          .sondMal()
          .then((status) => {
            skicka({
              typ: "mal_status",
              aktiv: status.aktiv,
              pausad: status.pausad,
              iteration: status.iteration,
              mal: status.mal,
            });
          })
          .catch(() => undefined);
      }, 1_500);

      const stada = () => {
        clearTimeout(sond);
        clearInterval(hjarta);
        avprenumerera();
        try {
          kontroll.close();
        } catch {
          // redan stängd
        }
      };
      req.signal.addEventListener("abort", stada, { once: true });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // nginx: buffra inte SSE
    },
  });
}
