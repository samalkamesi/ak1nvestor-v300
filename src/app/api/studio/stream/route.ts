import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaSessionTransport,
  hamtaStudioTransport,
  lasAllaInteraktioner,
  lasAterkoppling,
  lasStudioSessionskarta,
  markeraSessionSlut,
  markeraSessionStart,
  type StudioEvent,
  type StudioFilandring,
  type StudioKontext,
  type StudioTransport,
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
 *        otillgänglig — ärligt fel-fält, chatten renderar lås/vänt-läge;
 *        ALDRIG 500 för nedkopplad agent).
 * POST → {prompt} → SSE (text/event-stream): en `data:`-rad per event och
 *        strömmen avslutas efter "klart"/"fel". Heartbeat-kommentarer var
 *        15:e sekund håller proxyn öppen.
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
 * VÅG 84 STUDIO 100x BLOCK B — MULTI-SESSION-TABBAR: hela flödet är
 * SESSION-PARAMETRISERAT.
 *   POST {prompt, sessionId}   → prompten körs i DEN sessionen via en
 *        per-session-transport (hamtaSessionTransport — egen barnprocess
 *        på prod; resume av sessionen, ÄRLIGT fel om den är borta).
 *   POST {prompt, nyckel}      → första prompten i en NY tabb: frisk
 *        transport/session skapas och nycklas till tabben ("hej"-eventet
 *        bär sessionId så nästa prompt kan bära den).
 *   POST {prompt}              → DEFAULT-transporten (huvudtabben —
 *        oförändrat våg 81/82/83-beteende inkl. persistens-resume).
 *   GET ?sessionId=X           → sideload för en tabb: den sessionens
 *        historik + kontext (per-session-transport).
 *   GET (utan param)          → default-sessionens sideload + ALLTID
 *        "sessionskarta" (sessionId → {senasteAktivitet, historik,
 *        aktiv}) — tabbar kan visa senaste aktivitet och en annan klient
 *        kan se pågående arbete. Klientens abort (fetch AbortController)
 *        eldar req.signal → transportens session/stop — "stäng tabb med
 *        pågående arbete" blir ett ÄRLIGT avbrott, aldrig överlevande.
 *
 * ARKITEKTUR (protokollet FIRST-HAND bevisat 2026-09-09, se
 * tool-results/v81-appserver.md): Next körs på Contabo (pm2 'ak1a') där
 * `zcode app-server` + workspace /home/ak1a/agent/ak1 lever LOKALT —
 * barnprocess-spawning är därför CORRECT på prod, ingen nätbrygga behövs.
 * N tabbar = N per-session-barnprocesser + default-transporten; RAM-tak
 * 8 GB på Contabo bevakas (3 parallella tabbar mäts i E2E). Transporten
 * är injikerbar (STUDIO_TRANSPORT=mock för dev/test — deterministisk,
 * ingen modell). nginx: INGEN ändring — :3000 går genom befintlig proxy
 * (SSE är vanlig chunked text/event-stream).
 *
 * VÅG 87 H1 — ÅTERKOPPLING (kundrapport: "sparar ej info, fortsätter ej
 * när jag är utanför sidan"): GET UTAN sessionId svarar utöver det gamla
 * (default-sessionens historik + sessionskarta) även {senastAktivSessionId,
 * senastAktivHistorik, aktivtMal} — den SENAST AKTIVA sessionen (kartan,
 * som nu lever på DISK och överlever pm2-omstart — H2) + HELA dess
 * historik (levande transport ur registret > kartan; ALDRIG ny
 * barnprocess här) + mål-snapshot om mål-loopen kör. UI:t auto-laddar
 * sessionen vid mount (resume via GET ?sessionId=) så användaren SER
 * vad som hände under frånvaron utan att klicka något; en reconnect-poll
 * (30 s, pausad när fliken är dold) håller vyn sann när SSE:t tappats.
 *
 * SKYDD: requireAdmin på BÅDA metoderna (sessionscookie ak1a_admin eller
 * x-admin-password; dev-fallback endast i development; rate-limit 10 fel/min
 * i admin-auth). En prompt i taget PER SESSION — varje transport speglar
 * zcode:s egna -32010-vägran som fel-event. INGA hemligheter lämnar
 * servern: events är sanerade strängar, sessions-id:t är en offentlig
 * zcode-identifierare, trunkeringsbudgeterna (600/1 500 tecken) håller
 * SSE-raderna små.
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

// ── GET — status + historik (sidload; ?sessionId= för en specifik tabb) ──────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  // VÅG 84 B: per-session-sidaload — tabbens egen historik + kontext ur
  // en per-session-transport (resume). Fel är ärliga (200 + fel-fält).
  const sidPar = req.nextUrl.searchParams.get("sessionId")?.trim() ?? "";
  if (sidPar) {
    try {
      const { transport, sessionId } = await hamtaSessionTransport(sidPar);
      const [historik, kontext] = await Promise.all([transport.historik(), transport.lasKontext()]);
      return jsonSvar({
        transport: transport.namn,
        sessionId,
        historik,
        kontext,
        interaktioner: lasAllaInteraktioner(),
        live: true,
        sessionskarta: lasStudioSessionskarta(),
      });
    } catch (fel) {
      return jsonSvar({
        transport: hamtaStudioTransport().namn,
        sessionId: sidPar,
        historik: [],
        live: false,
        sessionskarta: lasStudioSessionskarta(),
        fel: fel instanceof Error ? fel.message.slice(0, 300) : "Sessionen kunde ej öppnas.",
      });
    }
  }

  const transport = hamtaStudioTransport();
  try {
    await transport.ensure();
    const [historik, kontext, aterkoppling] = await Promise.all([
      transport.historik(),
      transport.lasKontext(),
      lasAterkoppling(), // VÅG 87 H1: senast aktiva session + historik + mål
    ]);
    return jsonSvar({
      transport: transport.namn,
      sessionId: transport.sessionId(),
      historik,
      kontext,
      // V83 B2 + V84 B: väntande interaktioner från ALLA transporter
      // (permission/fråga — även egna tabbars dialoger återkommer här).
      interaktioner: lasAllaInteraktioner(),
      live: true,
      // VÅG 84 B: sessionskartan — alla sessioner denna process sett.
      sessionskarta: lasStudioSessionskarta(),
      // VÅG 87 H1: återkopplingen — den senast aktiva sessionen + HELA
      // dess historik (levande transport > kartan/disk) + mål-snapshot.
      senastAktivSessionId: aterkoppling.senastAktivSessionId,
      senastAktivHistorik: aterkoppling.senastAktivHistorik,
      aktivtMal: aterkoppling.aktivtMal,
    });
  } catch (fel) {
    return jsonSvar({
      transport: transport.namn,
      sessionId: transport.sessionId(),
      historik: [],
      interaktioner: transport.vantaInteraktioner(),
      live: false,
      sessionskarta: lasStudioSessionskarta(),
      // VÅG 87 H1: även när agenten är nede svarar kartan (disken!) —
      // historiken från frånvaron förloras inte bara för att barnprocessen
      // är nere; lasAterkoppling kastar aldrig.
      ...(await lasAterkoppling()),
      fel: fel instanceof Error ? fel.message.slice(0, 300) : "Agenten kunde ej nås.",
    });
  }
}

// ── POST — prompt → SSE-ström (per session eller default) ────────────────────

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let prompt = "";
  let sessionId = "";
  let nyckel = "";
  try {
    const kropp = (await req.json()) as { prompt?: unknown; sessionId?: unknown; nyckel?: unknown };
    if (typeof kropp.prompt === "string") prompt = kropp.prompt;
    if (typeof kropp.sessionId === "string") sessionId = kropp.sessionId.trim();
    if (typeof kropp.nyckel === "string") nyckel = kropp.nyckel.trim();
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  prompt = prompt.trim();
  if (!prompt) return jsonSvar({ fel: "Prompten är tom." }, 400);
  if (prompt.length > MAX_PROMPT_TEEKEN) {
    return jsonSvar({ fel: `Prompten är för lång (max ${MAX_PROMPT_TEEKEN} tecken).` }, 400);
  }

  // VÅG 84 B: sessionsval — per-session-transport (resume/ny tabb) eller
  // default-transporten (huvudtabben, oförändrat våg 81-beteende).
  let transport: StudioTransport;
  let sessionsId = "";
  try {
    if (sessionId) {
      ({ transport, sessionId: sessionsId } = await hamtaSessionTransport(sessionId));
    } else if (nyckel) {
      ({ transport, sessionId: sessionsId } = await hamtaSessionTransport(null, nyckel));
    } else {
      transport = hamtaStudioTransport();
      await transport.ensure();
      sessionsId = transport.sessionId() ?? "";
    }
  } catch (fel) {
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 300) : "Sessionen kunde ej öppnas." },
      502,
    );
  }

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

      // VÅG 84 B: sessionskartan följer strömmen — aktiv under rundan,
      // historik + aktiv=false efter klart/fel/abort. Lyssnar-wrapper
      // fångar klart-svaret (kartans assistant-post) på vägen ut.
      let svaret = "";
      markeraSessionStart(sessionsId, prompt);
      const skickaMedVakt = (event: Parameters<typeof sseRad>[0]) => {
        if (event.typ === "klart" && typeof event.svar === "string") svaret = event.svar;
        skicka(event);
      };

      try {
        skicka({ typ: "hej", transport: transport.namn, sessionId: sessionsId || null });
        await transport.skicka(prompt, skickaMedVakt, req.signal);
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
        markeraSessionSlut(sessionsId, svaret);
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
