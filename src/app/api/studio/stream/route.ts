import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaStudioTransport,
  type StudioEvent,
  type StudioFilandring,
  type StudioKontext,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/stream — BRYGGAN mellan /studio-webchatten och ZCode-agenten
 * på servern (VÅG 81 WEBCHAT-STUDIO, STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 81").
 *
 * GET  → status + historik + kontext: {transport, sessionId,
 *        historik:[{roll,text}], kontext:{modell,contextUsed,
 *        contextWindow,totalTokenCount,...}} (200 även när agenten är
 * otillgänglig — ärligt fel-fält, chatten renderar lås/vänt-läge;
 *        ALDRIG 500 för nedkopplad agent).
 * POST → {prompt} → SSE (text/event-stream): en `data:`-rad per event och
 *        strömmen avslutas efter "klart"/"fel". Heartbeat-kommentar 15:e
 *        sekund håller proxyn öppen.
 *
 * VÅG 83 MEGA B1 — KOMPLETT STREAMING-VISUALISERING + DIFF: event-typerna
 * utökade med "verktyg_kort" (tool.updated scheduled/started/progress/
 * result/error: namn + argument/resultat-truncat + varaktighet + progress-
 * svans), "verktyg_input" (model.streaming tool_input_delta — agenten
 * skriver argumenten LIVE), "runda" (turn.started/completed: duration,
 * resultType, toolCallCount) samt EFTER klart: "ändringar" (senaste
 * turnens filändringar ur transport.lasFilandringar — Write/Edit/MultiEdit-
 * härlett ±N per fil; den ursprungliga protokollkällan v4/conversation/
 * fileChanges kräver v4-grenens egna subscribe-flöde och är dokumenterad
 * som uppgraderingsväg i studio-transport.ts). Äldre typer lever kvar.
 *
 * ARKITEKTUR (protokollet FIRST-HAND bevisat 2026-09-09, se
 * tool-results/v81-appserver.md): Next körs på Contabo (pm2 'ak1a') där
 * `zcode app-server` + workspace /home/ak1a/agent/ak1 lever LOKALT —
 * barnprocess-spawning är därför CORRECT på prod, ingen nätbrygga behövs.
 * Transporten är injicerbar (STUDIO_TRANSPORT=mock för dev/test —
 * deterministisk, ingen modell). RIKTIG end-to-end mot zcode sker vid
 * deploy; dev-testet (verktyg/testa-studio.mjs) bevisar SSE-logiken mot
 * mock + protokollkommandona är enhetstestade som bevisade strängar i
 * forskningsdokumentet. nginx: INGEN ändring — :3000 går genom befintlig
 * proxy (SSE är vanlig chunked text/event-stream).
 *
 * SKYDD: requireAdmin på BÅDA metoderna (sessionscookie ak1a_admin eller
 * x-admin-password; dev-fallback endast i development; rate-limit 10 fel/min
 * i admin-auth). En prompt i taget — transporten speglar zcode:s egna
 * -32010-vägran som fel-event. INGA hemligheter lämnar servern: events är
 * sanerade strängar, sessions-id:t är en offentlig zcode-identifierare,
 * trunceringsbudgeterna (600/1 500 tecken) håller SSE-raderna små.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Tak för prompten (tecken) — rimligt stort för "max kapacitet"-känsla. */
const MAX_PROMPT_TEEKEN = 50_000;

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Tillförlitlig stringify av SSE-event (nya rader escapes automatiskt). */
function sseRad(
  event:
    | StudioEvent
    | { typ: "hej"; transport: string; sessionId: string | null }
    | { typ: "kontext"; kontext: StudioKontext | null }
    | { typ: "ändringar"; filer: StudioFilandring[] },
): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// ── GET — status + historik (sidload) ────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const transport = hamtaStudioTransport();
  try {
    await transport.ensure();
    const [historik, kontext] = await Promise.all([transport.historik(), transport.lasKontext()]);
    return jsonSvar({
      transport: transport.namn,
      sessionId: transport.sessionId(),
      historik,
      kontext,
      // V83 B2: väntande interaktioner (permission/fråga) — ett refreshat
      // UI återfår dialogkortet (samma lista som /api/studio/interaktion).
      interaktioner: transport.vantaInteraktioner(),
      live: true,
    });
  } catch (fel) {
    return jsonSvar({
      transport: transport.namn,
      sessionId: transport.sessionId(),
      historik: [],
      interaktioner: transport.vantaInteraktioner(),
      live: false,
      fel: fel instanceof Error ? fel.message.slice(0, 300) : "Agenten kunde ej nås.",
    });
  }
}

// ── POST — prompt → SSE-ström ────────────────────────────────────────────────

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

  const stream = new ReadableStream<Uint8Array>({
    async start(kontroll) {
      const skrivare = new TextEncoder();
      const skicka = (event: Parameters<typeof sseRad>[0]) => {
        try {
          kontroll.enqueue(skrivare.encode(sseRad(event)));
        } catch {
          // klienten kopplat ned — abort-signalen städar
        }
      };

      // Heartbeat: kommentar var 15:e s (håller nginx/proxy-bufferten öppen).
      const hjarta = setInterval(() => {
        try {
          kontroll.enqueue(skrivare.encode(": hjarta\n\n"));
        } catch {
          // tyst
        }
      }, 15_000);

      try {
        await transport.ensure();
        skicka({ typ: "hej", transport: transport.namn, sessionId: transport.sessionId() });
        await transport.skicka(prompt, skicka, req.signal);
        // V82: färsk kontextsanning efter rundan (session/read-projektionen)
        // — updaterar kontextraden i UI:t utan extra hämtningsrunda.
        skicka({ typ: "kontext", kontext: await transport.lasKontext() });
        // V83 B1: senaste turnens filändringar — ändringspanelen per turn.
        // lasFilandringar är internt fel-tolerant ([] vid avbrott) men en
        // extra vakt kostar inget och strömmen skall ALDRIG dö på lyx.
        try {
          skicka({ typ: "ändringar", filer: await transport.lasFilandringar() });
        } catch {
          // diff är lyx
        }
      } catch (fel) {
        skicka({
          typ: "fel",
          meddelande: fel instanceof Error ? fel.message.slice(0, 300) : "Okänt bryggfel.",
        });
      } finally {
        clearInterval(hjarta);
        try {
          kontroll.close();
        } catch {
          // redan stängd
        }
      }
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
