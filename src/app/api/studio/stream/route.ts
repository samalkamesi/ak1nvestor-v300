import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";

import { requireAdmin } from "@/lib/admin-auth";
import {
  byggPromptMedBilder,
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

// ── VÅG 141 — STÅENDE MÅL + TRÅDENS ARV ──────────────────────────────────────
// Kundbevis 2026-09-14 (tre skärmbilder): panelen "Inget mål satt — agenten
// arbetar bara när du chattar" + kort historikalös tråd + agent som lovar och
// stannar. ROT: varje pm2-omstart (deploy) nollställer målet i processminnet
// — upp till 10 min innan hjärtat återställer — och en NY session föds utan
// trådens minne. KUR (mekanisk, i denna rutt): när huvudtrådens prompt kommer
// och målet är HELT borta (null, ej pausat) ⇒ (a) stående mål återaktiveras
// DIREKT, (b) prompten prefixas en gång med TRÅDENS ARV (worklog-svans +
// beslutsminne-svans) och agenten ombeds inleda med "MINNE LADDAT".
const STANDE_MAL_141 =
  "24/7-STANDBY enligt STYRELSE-REGELVERKET (data/forskning/STYRELSE-REGELVERK.md): " +
  "arbeta kontinuerligt system för system — landa minst en commit per rond taggad " +
  "[organ:X], verkställ kön (PIPELINE-KO), kör vakten till 0 fynd, rapportera i " +
  "worklog och TA NÄSTA UPPGIFT — repetera tills kunden pausar.";

function lasArvSvans(sokvag: string, antalRader: number): string {
  try {
    const rader = readFileSync(`${process.cwd()}/${sokvag}`, "utf8")
      .split("\n")
      .filter((r) => r.trim().length > 0);
    return rader.slice(-antalRader).join("\n").slice(0, 2_500);
  } catch {
    return "";
  }
}

function byggArvBlock(): string {
  const worklog = lasArvSvans("worklog.md", 6);
  const beslut = lasArvSvans("data/vakten/beslutsminne.jsonl", 3);
  return [
    "TRÅDENS MINNE (automatiskt injicerat — du har arbetat före detta; fortsätt tråden, repetera inte klart arbete):",
    worklog ? `SENASTE WORKLOG:\n${worklog}` : "",
    beslut ? `SENASTE BESLUT (beslutsminnet):\n${beslut}` : "",
    "Börja svaret med 'MINNE LADDAT' + en rad om var tråden står; verkställ sedan uppdraget.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

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
 *   GET (utan param)          → default-sessionens sidoload + ALLTID
 *        "sessionskarta" (sessionId → {senasteAktivitet, historik,
 *        aktiv}) — tabbar kan visa senaste aktivitet och en annan klient
 *        kan se pågående arbete. VÅG 91 A1c: klientens abort (fetch
 *        AbortController) stänger ENDAST SSE:n — arbetet i barnprocessen
 *        lever kvar och svaret sparas i kartan/historiken ("stäng tabb
 *        mitt i jobbet" = jobbet fortsätter, HELA svaret vid återkomst).
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
 * VÅG 91 A1 — SANN BAKGRUNDSAUTONOMI (kundklagomål "den dör när jag
 * hoppar till nästa sida"): POST-avtalen utökas/ändras —
 *   · POST {prompt, sessionId?, nyckel?, bilder?} — bilder = sökvägar I
 *     arbetsytan (uploads/…); transport.skickaMedBild utökar prompten med
 *     referenser (binärsond: session/send:s attachments är opak genom-
 *     strömning — v4/attachment-flödet är uppgraderingsväg, se transporten).
 *   · Klient-abort (fliken stängs/nätet tappas) stoppar ENDAST nätverks-
 *     strömmen — req.signal förs ALDRIG till transport.skicka, så barn-
 *     processens session/send-arbete fortsätter HELT autonomt server-side.
 *     Svaret sparas i sessionskartan (markeraSessionSlut körs i finally
 *     när rundan klart) och återges HELT vid GET (historik + återkoppling).
 *     Mål-status för återvändare: GET /api/studio/mal/status (A1b).
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
  let bilder: string[] = [];
  try {
    const kropp = (await req.json()) as {
      prompt?: unknown;
      sessionId?: unknown;
      nyckel?: unknown;
      bilder?: unknown;
    };
    if (typeof kropp.prompt === "string") prompt = kropp.prompt;
    if (typeof kropp.sessionId === "string") sessionId = kropp.sessionId.trim();
    if (typeof kropp.nyckel === "string") nyckel = kropp.nyckel.trim();
    // VÅG 91 A1d: bilder = sökvägar I arbetsytan (uploads/…) — transportens
    // skickaMedBild utökar prompten med referenser (barnets Read presenterar
    // dem visuellt; se studio-transport.ts binärsond för v4-uppgraderingsvägen).
    if (Array.isArray(kropp.bilder)) {
      bilder = kropp.bilder.filter((b): b is string => typeof b === "string" && b.trim().length > 0);
    }
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  prompt = prompt.trim();
  if (!prompt) return jsonSvar({ fel: "Prompten är tom." }, 400);
  if (prompt.length > MAX_PROMPT_TEEKEN) {
    return jsonSvar({ fel: `Prompten är för lång (max ${MAX_PROMPT_TEEKEN} tecken).` }, 400);
  }
  if (bilder.length > 8) {
    return jsonSvar({ fel: "Max 8 bilder per prompt." }, 400);
  }

  // VÅG 84 B: sessionsval — per-session-transport (resume/ny tabb) eller
  // default-transporten (huvudtabben, oförändrat våg 81-beteende).
  // VÅG 95 (-32031-STÄDNING): POST = NYTT MEDDELANDE ⇒ hamtaSession-
  // transport får nyttMeddelande:true — en FRISKGÅNG-session (>24 h sedan
  // senaste aktivitet ELLER en gång drabbad av -32031) startar FRISK
  // session direkt i stället för resume → -32031 → kassera → ny
  // (dubbelturen vid första meddelandet efter omstand försvinner). Det
  // nya sessionId:t följer "hej"-eventet så klienten omnycklar tabben;
  // den gamla sessionens historik lever kvar i sessionskartan + "Äldre
  // sessioner"-listan. GET-sidaloaden (vy) resumed oförändrat ärligt.
  let transport: StudioTransport;
  let sessionsId = "";
  try {
    if (sessionId) {
      ({ transport, sessionId: sessionsId } = await hamtaSessionTransport(sessionId, null, {
        nyttMeddelande: true,
      }));
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

  // VÅG 141 — MÅLET DÖR ALDRIG MED OMSTARTEN: prompt mot huvudtråden (ingen
  // sessionId) + målet HELT borta (null, ej pausat av kunden) ⇒ stående mål
  // aktiveras DIREKT (gapet till hjärtats :x1 stängs) och trådens arv
  // injiceras EN gång i prompten — agenten minns och fortsätter.
  try {
    const st = transport.malStatus();
    if (!sessionId && st.mal === null && !st.pausad) {
      await transport.sattMal(STANDE_MAL_141);
      const arv = byggArvBlock();
      if (arv) {
        prompt = `${arv}\n\n───\n\n${prompt}`;
      }
    }
  } catch {
    /* sattMal kan vägra vid pågående turn — hjärtat täcker då */
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

      // Heartbeat: SSE-kommentar var 15:e s (VÅG 90 K1: ": ping" — håller
      // nginx/proxy/lastbalanserare från att döda anslutningen TYST).
      const hjarta = setInterval(() => {
        try {
          kontroll.enqueue(skrivare.encode(": ping\n\n"));
        } catch {
          // tyst
        }
      }, 15_000);

      // VÅG 84 B: sessionskartan följer strömmen — aktiv under rundan,
      // historik + aktiv=false efter klart/fel/abort. Lyssnar-wrapper
      // fångar klart-svaret (kartans assistant-post) på vägen ut.
      let svaret = "";
      // Kartans user-post speglar den UTÖKADE prompten när bilder följde med
      // (samma sanning som barnet fick — byggPromptMedBilder är ren + delad).
      markeraSessionStart(sessionsId, bilder.length > 0 ? byggPromptMedBilder(prompt, bilder).prompt : prompt);
      // VÅG 90 K1 + VÅG 91 A1c: abort-medveten lyssnar-wrapper — efter
      // klient-frånkoppling (req.signal abort) SPARAS svaret för sessions-
      // kartan men SKICKAS inget (lyssnaren är i praktiken avregistrerad),
      // och polling nedan pausas.
      // VÅG 142 — PROMPT-KÖN: mål-loopen arbetar nästan alltid (24/7) på
      // huvudtrådens session — kundens prompt kan studsas med -32010 ("en
      // prompt kör redan") som FEL-EVENT (transporten kastar ej). Tidigare:
      // studsen nådde klienten som ett tyst fel och meddelandet "låg
      // obesvarat" = kundens "allt stannar när jag går ifrån". Nu: studsen
      // fångas, klienten får kö-status, och prompten skickas OM (15 s
      // intervall, tak 8 min) tills agenten är ledig — svaret kommer ALLTID.
      let upptagenStuds = false;
      const arUpptagen = (m: string) =>
        m.includes("-32010") || m.toLowerCase().includes("kör redan") || m.toLowerCase().includes("pågår redan");
      const skickaMedVakt = (event: Parameters<typeof sseRad>[0]) => {
        if (event.typ === "fel" && typeof event.meddelande === "string" && arUpptagen(event.meddelande)) {
          upptagenStuds = true;
          return; // studsen syns ej — prompt-kön tar över
        }
        if (event.typ === "klart" && typeof event.svar === "string") svaret = event.svar;
        if (req.signal.aborted) return;
        skicka(event);
      };

      try {
        skicka({ typ: "hej", transport: transport.namn, sessionId: sessionsId || null });
        // VÅG 91 A1c — SANN BAKGRUNDSAUTONOMI: klientens abort-signal förs
        // ALDRIG ned till transport.skicka. Ett request-abort (kunden lämnar
        // /studio, stänger fliken, tappar nätet) skall ENDAST stänga
        // nätverksströmningen — barnprocessens session/send-arbete fortsätter
        // HELT autonomt server-side och svaret samlas i historiken
        // (session/messages + sessionskartan) så en återvändande klient får
        // HELA svaret via GET. (Tidigare beteende: abort ⇒ session/stop =
        // arbetet dog — kundens "den dör när jag hoppar till nästa sida".)
        // Transportens EV. signal förblir dess interna sak (10-min-taket).
        const KO_TAK_MS = 8 * 60_000;
        const koStart = Date.now();
        do {
          upptagenStuds = false;
          if (bilder.length > 0) {
            await transport.skickaMedBild(prompt, bilder, skickaMedVakt);
          } else {
            await transport.skicka(prompt, skickaMedVakt);
          }
          if (upptagenStuds && Date.now() - koStart < KO_TAK_MS) {
            skickaMedVakt({
              typ: "status",
              text: "Agenten avslutar sitt pågående arbete — din prompt är köad och körs strax (automatiskt)…",
            });
            await new Promise((r) => setTimeout(r, 15_000));
          }
        } while (upptagenStuds && Date.now() - koStart < KO_TAK_MS);
        // VÅG 90 K1: polling BARA för en levande klient — efter abort ställer
        // servern inga fler protokollsfrågor (kontext/diff) i onödan.
        if (req.signal.aborted) return;
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
