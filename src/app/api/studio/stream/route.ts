import { readFileSync, writeFileSync } from "node:fs";

import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  byggPromptMedBilder,
  hamtaSessionTransport,
  hamtaStudioTransport,
  lasAllaInteraktioner,
  lasAterkoppling,
  lasHuvudtradSessioner,
  lasMalStateFranDisk,
  lasStudioSessionskarta,
  lasTradHistorik,
  markeraSessionSlut,
  markeraSessionStart,
  type StudioEvent,
  type StudioFilandring,
  type StudioKontext,
  type StudioSessionsKort,
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
 * R6 (fabriksverkställning 2026-09-14, ZCODE-INSIDE-OUT) — PREFLIGHT-GRIND
 * I POST (tappa aldrig kundens text): varje prompt journalförs på DISK
 * (data/vakten/prompt-journal.json) FÖRE första session/send, och varje
 * avslag — validering, klient-abort under preflight, transportdöd före/
 * under sändningen, köns tak — svarar/larmar med texten bevarad: avslag:
 * true + HELA prompten i svaret, journalstatus med orsak på servern.
 * Omsändning sker ALDRIG automatiskt (autoSend-mönstret) — se R6-blocket.
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

// ── VÅG 215.1 — GET-PAYLOAD-TAK (kontrakt 200 kB) ─────────────────────────────
// Mätning 2026-09-20: 256,5 kB — trådens innehåll bars TRE gånger: sessionens
// fulltext-historik (71 kB) + sessionskartans per-session-historik (23,4 kB)
// + tradHistorik-vyn (153,6 kB). tradHistorik (kanonvyn, kontraktets "aldrig
// krympa") är ORÖRD; dubbellagringen kapas: kartan bär antalPoster (klienten
// läser endast aktiv/stangd/modellDod — studio-chat.tsx:s karttyp) och
// historiken håller fulltext endast för de senaste svaren (v148F:s löfte
// "fulltext i sessionens egna vy" lever för det kunden just läser).
const V215_HIST_TAK_TKN = 2_000;
const V215_HIST_HELA = 3;

function v215KapaHistorik<T extends { text: string }>(historik: T[]): T[] {
  if (historik.length <= V215_HIST_HELA) return historik;
  const kapadFran = historik.length - V215_HIST_HELA;
  return historik.map((p, i) =>
    i < kapadFran && p.text.length > V215_HIST_TAK_TKN
      ? {
          ...p,
          text:
            p.text.slice(0, V215_HIST_TAK_TKN) +
            `\n\n… [kapad i transporten — de ${V215_HIST_HELA} senaste svaren är hela]`,
        }
      : p,
  );
}

function v215TunnaKarta(
  karta: Record<string, StudioSessionsKort>,
): Record<string, Omit<StudioSessionsKort, "historik"> & { antalPoster: number }> {
  const ut: Record<string, Omit<StudioSessionsKort, "historik"> & { antalPoster: number }> = {};
  for (const [sid, kort] of Object.entries(karta ?? {})) {
    const { historik, ...vila } = kort;
    ut[sid] = { ...vila, antalPoster: Array.isArray(historik) ? historik.length : 0 };
  }
  return ut;
}

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
      // VÅG 148: även sidoloaden bär HELA tråden (boken + denna sessions
      // levande svans) — klientens poll kan ersätta flikens vy med tradHistorik
      // utan att någonsin radera kedjan ("tråden är helig").
      const tradHistorik = lasTradHistorik(lasHuvudtradSessioner(), {
        sessionId,
        historik,
      });
      return jsonSvar({
        transport: transport.namn,
        sessionId,
        historik: v215KapaHistorik(historik),
        tradHistorik,
        kontext,
        interaktioner: lasAllaInteraktioner(),
        live: true,
        sessionskarta: v215TunnaKarta(lasStudioSessionskarta()),
      });
    } catch (fel) {
      return jsonSvar({
        transport: hamtaStudioTransport().namn,
        sessionId: sidPar,
        historik: [],
        live: false,
        sessionskarta: v215TunnaKarta(lasStudioSessionskarta()),
        fel: fel instanceof Error ? fel.message.slice(0, 300) : "Sessionen kunde ej öppnas.",
      });
    }
  }

  const transport = hamtaStudioTransport();
  // VÅG 154 — TRÅDEN FÖRST, VÄRMEN I BAKGRUNDEN ("samma som z code"): en
  // kall agent (efter omstart/deploy) får ALDRIG hänga kundens refresh i
  // spawn-tiden (~15-20 s). ensure kapas vid 6 s; under tiden svarar GET
  // med HELA tråden ur zcode:s db (lever utan barnprocess) + live:false +
  // "värms"-status — klienten (u2-beteende) renderar tråden DIREKT och
  // pollen tar den live när värmen landat. Spawnen fortsätter orörd i
  // bakgrunden (lovet lever — inget avbrott, ingen dubbelstart: ensure:s
  // samtalsvakt delar samma löfte).
  const VARM_TAK_MS = 6_000;
  let varmar = false;
  try {
    await Promise.race([
      transport.ensure(),
      new Promise<never>((_, avvisa) =>
        setTimeout(() => avvisa(new Error("__varmar__")), VARM_TAK_MS).unref?.(),
      ),
    ]);
  } catch (fel) {
    const text = fel instanceof Error ? fel.message : String(fel);
    if (text !== "__varmar__") throw fel;
    varmar = true;
  }
  if (varmar) {
    // VÅG 170 — KONTEXT ÄVEN UNDER VÄRMNING: kunden ser "0 %" i 15-30 s
    // efter refresh = "den kommer ej ihåg"-känslan. Kur: läs sticky-
    // baseline (trad-kontext.json) eller skatta ur boken så kontextraden
    // visar trådens tyngd direkt, INNAN agenten är redo.
    let varmKontext: { contextUsed?: number; contextWindow?: number; totalTokenCount?: number } | undefined;
    try {
      const { readFileSync: lasFil } = await import("node:fs");
      const sticky = JSON.parse(
        lasFil(`${process.cwd()}/data/vakten/trad-kontext.json`, "utf8"),
      ) as { maxContextUsed?: number };
      if (typeof sticky.maxContextUsed === "number" && sticky.maxContextUsed > 0) {
        varmKontext = {
          contextUsed: sticky.maxContextUsed,
          contextWindow: 1_000_000,
          totalTokenCount: sticky.maxContextUsed,
        };
      }
    } catch {
      /* sticky får saknas */
    }
    if (!varmKontext) {
      const bok = lasHuvudtradSessioner();
      if (bok.length > 1) {
        const skattning = bok.length * 12_000;
        varmKontext = { contextUsed: skattning, contextWindow: 1_000_000, totalTokenCount: skattning };
      } else {
        varmKontext = { contextUsed: 42_000, contextWindow: 1_000_000, totalTokenCount: 42_000 };
      }
    }
    return jsonSvar({
      transport: transport.namn,
      sessionId: transport.sessionId(),
      historik: [],
      kontext: varmKontext,
      interaktioner: lasAllaInteraktioner(),
      live: false,
      sessionskarta: v215TunnaKarta(lasStudioSessionskarta()),
      ...(await lasAterkoppling()),
      tradHistorik: lasTradHistorik(lasHuvudtradSessioner(), { sessionId: null, historik: [] }),
      fel: "Agenten värms efter omstart — tråden är hel; chatten går live automatiskt inom cirka en halv minut.",
    });
  }
  try {
    await transport.ensure();
    // VÅG 148C — MÅLET FÖDS OM VID FÖRSTA ANROPET (refresh/poll): pm2-
    // omstarter raderar mål-state ur processminnet (hjärtloggen bevisar
    // cykeln "MÅL återställt" → "mål borta" × 789 omstarter); hjärtat
    // återställer inom 10 min men kundens refresh skall inte vänta —
    // mal=null (ej pausat, ingen pågående turn) ⇒ målet återarmas direkt.
    // VÅG 150: DISK-målet (kundens eget) har prioritet över stående mål.
    // POST-grenen (v141) och hjärtat (v112) kvarstår som skydd.
    try {
      const m0 = transport.malStatus();
      if (m0.mal === null && !m0.pausad && !m0.pagaendeTurn) {
        const diskMal = lasMalStateFranDisk();
        await transport.sattMal(diskMal?.mal || STANDE_MAL_141);
      }
    } catch {
      /* pågående turn vägrar sattMal — hjärtat/POST täcker */
    }
    // VÅG 155 — OFFLINE-MINNET: nyfödd session (omstart) internaliserar
    // TRÅDMINNET i bakgrunden — de autonoma iterationerna minns även utan
    // att någon kund-prompt kommer (kunddirektivet: online OCH offline).
    transport.injiceraTradminneIBakgrunden();
    const [historik, kontext, aterkoppling] = await Promise.all([
      transport.historik(),
      transport.lasKontext(),
      lasAterkoppling(), // VÅG 87 H1: senast aktiva session + historik + mål
    ]);
    // VÅG 145 — KÄLLFIX: aktivtMal lästes ur KART-transports (som dör vid
    // omstarter) medan mål-loopen lever på DEFAULT-transporten — kundbevis:
    // GET svarade aktivtMal=null samtidigt som /mal/status var grön, vilket
    // dödade både tråd-preferensen och live-pollen. Sanningen läses nu från
    // den LEVANDE transporten (bär sessionId sedan våg 139).
    let aktivtMalSanning = aterkoppling.aktivtMal;
    try {
      const m = transport.malStatus();
      if (m.mal !== null || m.aktiv) {
        aktivtMalSanning = { ...m, sessionId: transport.sessionId() ?? undefined };
      }
    } catch {
      /* kart-värdet kvarstår */
    }
    return jsonSvar({
      transport: transport.namn,
      sessionId: transport.sessionId(),
      historik: v215KapaHistorik(historik),
      kontext,
      // V83 B2 + V84 B: väntande interaktioner från ALLA transporter
      // (permission/fråga — även egna tabbars dialoger återkommer här).
      interaktioner: lasAllaInteraktioner(),
      live: true,
      // VÅG 84 B: sessionskartan — alla sessioner denna process sett.
      sessionskarta: v215TunnaKarta(lasStudioSessionskarta()),
      // VÅG 87 H1: återkopplingen — den senast aktiva sessionen + HELA
      // dess historik (levande transport > kartan/disk) + mål-snapshot.
      senastAktivSessionId: aterkoppling.senastAktivSessionId,
      senastAktivHistorik: aterkoppling.senastAktivHistorik,
      // VÅG 145: mål-sanningen ur levande transport + HUVUDTRÅDENS BOK —
      // serverns sanna sessionlista för tråden (klienten behöver inte gissa).
      aktivtMal: aktivtMalSanning,
      tradSessioner: lasHuvudtradSessioner(),
      // VÅG 148 — TRÅDENS PERMANENS: HELA huvudtråden sammanslagen (äldst→
      // nyast) ur zcode:s egna sessionsdatabas + default-sessionens levande
      // svans. Klienten renderar detta ETT fält — kedje-sysandet på klientsidan
      // (ett barnprocess-anrop per länk) och poll-utraderingen av kedjan är
      // därmed historia: "z code 100% samma" — tråden kan aldrig försvinna.
      tradHistorik: lasTradHistorik(lasHuvudtradSessioner(), {
        sessionId: transport.sessionId(),
        historik,
      }),
    });
  } catch (fel) {
    return jsonSvar({
      transport: transport.namn,
      sessionId: transport.sessionId(),
      historik: [],
      interaktioner: transport.vantaInteraktioner(),
      live: false,
      sessionskarta: v215TunnaKarta(lasStudioSessionskarta()),
      // VÅG 87 H1: även när agenten är nede svarar kartan (disken!) —
      // historiken från frånvaron förloras inte bara för att barnprocessen
      // är nere; lasAterkoppling kastar aldrig.
      ...(await lasAterkoppling()),
      // VÅG 148: tråden lever ÄVEN med agenten nere — db.sqlite kräver ingen
      // barnprocess (svansen saknas men historien står kvar = aldrig tomt).
      tradHistorik: lasTradHistorik(lasHuvudtradSessioner(), { sessionId: null, historik: [] }),
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
  // R6 (a)+(b): kroppsvalideringen ÄR preflight-grinden — den beslutar UTAN
  // nät och varje avslag bär texten TILLBAKA + journalförs på disk ("avvisad"
  // är terminal — omsänds ALDRIG automatiskt; kundens ord raderas aldrig).
  if (!prompt) return avslagSvar("Prompten är tom.", { prompt, bilder });
  if (prompt.length > MAX_PROMPT_TEEKEN) {
    journalForPrompt({
      id: crypto.randomUUID(),
      tid: Date.now(),
      // absurd stora kroppar trunkeras I JOURNALEN (ekot i svaret bär ändå
      // hela texten tillbaka — journalen är sekundärt skydd)
      prompt: prompt.slice(0, MAX_PROMPT_TEEKEN) + " …[trunkerad vid journalföring]",
      sessionId,
      nyckel,
      bilder,
      status: "avvisad",
      fel: `för lång (${prompt.length} > ${MAX_PROMPT_TEEKEN} tecken)`,
    });
    return avslagSvar(`Prompten är för lång (max ${MAX_PROMPT_TEEKEN} tecken).`, { prompt, bilder });
  }
  if (bilder.length > 8) {
    journalForPrompt({
      id: crypto.randomUUID(),
      tid: Date.now(),
      prompt,
      sessionId,
      nyckel,
      bilder,
      status: "avvisad",
      fel: `för många bilder (${bilder.length} > 8)`,
    });
    return avslagSvar("Max 8 bilder per prompt.", { prompt, bilder });
  }

  // R6 — JOURNAL FÖRE SÄNDNING ("förloras ALDRIG"): texten står på DISK innan
  // någon transport börjar arbeta. Dör något mitt i (barnprocess, sessionens
  // öppnande, köns tak) markeras posten nedan med status + orsak.
  const journalId = crypto.randomUUID();
  journalForPrompt({ id: journalId, tid: Date.now(), prompt, sessionId, nyckel, bilder, status: "skickas" });

  // R6 (c) — race-skyddet isStopped(): hängde klienten på under valideringen
  // (Esc/stängd flik under läsning av kroppen) skickas INGENTING — zcode-
  // mönstret "gör inget, mata aldrig bort texten"; posten blir återhämtningsbar.
  if (req.signal.aborted) {
    journalUppdatera(journalId, "avbruten", "klienten avbröt under preflight");
    return avslagSvar("Anropet avbröts innan sändning — din text är sparad och skickades ej.", { prompt, bilder });
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
    // R6: transporten dog FÖRE första session/send — prompten kom aldrig fram
    // men FÖRLORAS inte: journalstatus "tappad" + avslag med hela texten.
    const text = fel instanceof Error ? fel.message.slice(0, 300) : "Sessionen kunde ej öppnas.";
    journalUppdatera(journalId, "tappad", text);
    return avslagSvar(text, { prompt, bilder }, 502);
  }

  // VÅG 141+150 — MÅLET DÖR ALDRIG: mal=null (ej pausat) ⇒ DISK-målet först
  // (kundens eget, sattMal persistar det), stående mål som skydd. TRÅDMINNET
  // (v150A) injiceras av TRANSPORTEN vid sessionsfödelsen — inte här (rot-
  // orsak bevisad E2E: rotationen sker ofta mitt i sändningen, efter ruttens
  // detektion; transporten är den enda punkten som täcker ALLA födelser).
  try {
    const st = transport.malStatus();
    if (!sessionId && st.mal === null && !st.pausad) {
      const diskMal = lasMalStateFranDisk();
      await transport.sattMal(diskMal?.mal || STANDE_MAL_141);
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
      // VÅG 156 — TIDSGRÄNSEN BLIR FORTSÄTTNING: transportens hårtak (10 min)
      // dödade långa arbeten mitt i med "svaret kan vara ofullständigt" —
      // kundens ord: "får den order då ska den jobba tills den är helt klar".
      // Nu: tidsgräns-fel => AUTOMATISK FORTSÄTT-prompt (samma uppdrag,
      // max 3 fortsättningar) — arbetet rullar tills klart eller taket.
      let tidsgransStuds = false;
      let fortsattningar = 0;
      const arUpptagen = (m: string) =>
        m.includes("-32010") || m.toLowerCase().includes("kör redan") || m.toLowerCase().includes("pågår redan");
      const arTidsgrans = (m: string) => m.includes("Tidsgränsen nåddes");
      const skickaMedVakt = (event: Parameters<typeof sseRad>[0]) => {
        if (event.typ === "fel" && typeof event.meddelande === "string" && arUpptagen(event.meddelande)) {
          upptagenStuds = true;
          return; // studsen syns ej — prompt-kön tar över
        }
        if (event.typ === "fel" && typeof event.meddelande === "string" && arTidsgrans(event.meddelande)) {
          tidsgransStuds = true;
          return; // talets död syns ej — fortsättning tar över
        }
        if (event.typ === "klart" && typeof event.svar === "string") svaret = event.svar;
        // R6: svaret LANDADE ⇒ journalposten löses (även efter klient-abort —
        // v91:s autonomi: arbetet lever kvar och svaret sparas i historiken).
        if (event.typ === "klart") journalUppdatera(journalId, "svarad");
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
        let aktivPrompt = prompt;
        do {
          upptagenStuds = false;
          tidsgransStuds = false;
          if (bilder.length > 0 && aktivPrompt === prompt) {
            await transport.skickaMedBild(aktivPrompt, bilder, skickaMedVakt);
          } else {
            await transport.skicka(aktivPrompt, skickaMedVakt);
          }
          if (
            tidsgransStuds &&
            fortsattningar < 3 &&
            Date.now() - koStart < KO_TAK_MS + 3 * 11 * 60_000
          ) {
            fortsattningar += 1;
            aktivPrompt =
              "FORTSÄTT (automatisk fortsättning efter tidsgränsen): arbetet bröts mitt i — " +
              "fortsätt EXAKT där du slutade, samma uppdrag, repetera inget klart arbete, " +
              "tills uppdraget är helt klart eller du behöver kundens beslut.";
            skickaMedVakt({
              typ: "status",
              text: `Rundan nådde tidsgränsen — fortsätter automatiskt (fortsättning ${fortsattningar}/3)…`,
            });
            continue;
          }
          if (upptagenStuds && Date.now() - koStart < KO_TAK_MS) {
            skickaMedVakt({
              typ: "status",
              text: "Agenten avslutar sitt pågående arbete — din prompt är köad och körs strax (automatiskt)…",
            });
            await new Promise((r) => setTimeout(r, 15_000));
          }
        } while (
          (upptagenStuds && Date.now() - koStart < KO_TAK_MS) ||
          (tidsgransStuds && fortsattningar < 3 && Date.now() - koStart < KO_TAK_MS + 3 * 11 * 60_000)
        );
        // R6 — köns tak: agenten upptagen i 8 minuter ⇒ prompten kom ALDRIG
        // fram. Tidigare tystnade strömmen helt (inget klart/fel). Nu: ett
        // ÄRLIGT fel-event + journalstatus "tappad". Omsändning sker ALDRIG
        // automatiskt (autoSend=av) — kunden trycker igen när agenten är ledig.
        if (upptagenStuds) {
          journalUppdatera(journalId, "tappad", "köns tak — agent upptagen hela 8 minuter");
          skickaMedVakt({
            typ: "fel",
            meddelande:
              "Agenten har varit upptagen längre än köns tak (8 minuter) — din prompt kom inte fram. " +
              "Texten är sparad i prompt-journalen på servern (data/vakten) och omsänds aldrig automatiskt. " +
              "Skicka igen om en liten stund.",
          });
          return; // finally städar hjärtat + stänger strömmen
        }
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
        // R6: transporten dog MITT I sändningen — kundens text står kvar i
        // journalen (status "tappad" + orsak) och fel-eventet SÄGER det:
        // telefon-skrivna långa texter får aldrig försvinna i det tysta.
        const text = fel instanceof Error ? fel.message.slice(0, 300) : "Okänt bryggfel.";
        journalUppdatera(journalId, "tappad", text);
        skicka({
          typ: "fel",
          meddelande: `${text} — din text är sparad i prompt-journalen på servern och förlorad ej; den omsänds inte automatiskt.`,
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

// ── R6 — PREFLIGHT-GRIND I POST-GRENEN (tappa aldrig kundens text) ────────────
// Kapitelverkställning: data/forskning/zcode-kallkod/R6-PREFLIGHT.md (Del A3
// "preflightSubmission" — zcode-TUI:ns grind FÖRE varje prompt). Tre ben:
//   (a) grind FÖRE session/send som kan avvisa UTAN nät — här: kroppsbegärens
//       kontroller (tom/för lång/bilder) + klientens abort-status. Ingen
//       transport kontaktas före beslutet. Medvetet INGEN hälsobaserad
//       avvisning: ett givet upp barn (omstartForsok≥3) låser upp för MANUELL
//       ensure vid nästa tryck (transporten stegOmstart) — en sådan grind
//       skulle blockera just återupplivningen och därmed friska sändningar
//       (samma snävhet som zcode:s missingCodingPlanKey: bara entydiga fel).
//   (b) ett avslag äter ALDRIG texten: svaret bär avslag:true + HELA prompten
//       (mottagaren kan lägga den tillbaka i inmatningsrutan) och journalen
//       sparar den på disk med terminal status "avvisad" — servern omsänder
//       ALDRIG automatiskt (autoSend-mönstret: kunden bestämmer).
//   (c) race-skyddet isStopped(): hängde klienten på under valideringen
//       skickas INGENTING — posten markeras "avbruten", texten överlever.
// PROMPT-JOURNALEN (data/vakten/prompt-journal.json — gitignorerad runtime-
// data, överlever pm2-omstart) är rot-garanteringen "förloras ALDRIG": varje
// godkänd prompt journalförs FÖRE första session/send; dör transporten mitt
// i (barnprocessdöd, sessionen kan ej öppnas, köns tak) markeras posten
// "tappad" med orsak och texten står kvar på disk för återhämtning.
const PROMPT_JOURNAL_SOKVAG = `${process.cwd()}/data/vakten/prompt-journal.json`;
const PROMPT_JOURNAL_MAX = 50;

type PromptJournalStatus = "skickas" | "svarad" | "tappad" | "avvisad" | "avbruten";

interface PromptJournalPost {
  id: string;
  /** Journalföringstid (epoch ms). */
  tid: number;
  /** Kundens text ORDAGRANN — journalens hela syfte är att den överlever. */
  prompt: string;
  /** Målsession ("" = huvudtabben/default-transport). */
  sessionId: string;
  /** Tabnyckel (första meddelandet i ny session). */
  nyckel: string;
  /** Bilagda bildsökvägar (uploads/…). */
  bilder: string[];
  status: PromptJournalStatus;
  /** Kort orsak vid tappad/avvisad/avbruten. */
  fel?: string;
}

/** Läs journalen — fel ger tom lista; journalen är en bonus, aldrig ett hinder. */
function lasPromptJournal(): PromptJournalPost[] {
  try {
    const pars = JSON.parse(readFileSync(PROMPT_JOURNAL_SOKVAG, "utf8")) as { poster?: unknown };
    if (!Array.isArray(pars.poster)) return [];
    return pars.poster.filter(
      (p): p is PromptJournalPost =>
        !!p && typeof (p as PromptJournalPost).id === "string" && typeof (p as PromptJournalPost).prompt === "string",
    );
  } catch {
    return [];
  }
}

/** Skriv journalen SYNKTONT (trumpen men sann — samma mönster som sessionskartan). */
function skrivPromptJournal(poster: PromptJournalPost[]): void {
  try {
    writeFileSync(
      PROMPT_JOURNAL_SOKVAG,
      JSON.stringify({ version: 1, uppdaterad: Date.now(), poster: poster.slice(-PROMPT_JOURNAL_MAX) }, null, 2),
      "utf8",
    );
  } catch {
    // disken får ALDRIG döda en sändning — avslagsekot + klientens egen
    // utkastlagning (localStorage per tabb) är kvarvarande skydd
  }
}

/** Journalför en prompt (läggs sist; tak PROMPT_JOURNAL_MAX behålls). */
function journalForPrompt(post: PromptJournalPost): void {
  const poster = lasPromptJournal();
  poster.push(post);
  skrivPromptJournal(poster);
}

/** Uppdatera en posts status — läs-ändra-skriv är SYNKRON (ingen await
 * emellan) ⇒ säker mot interleaving i nodens enda händelseloop. */
function journalUppdatera(id: string, status: PromptJournalStatus, fel?: string): void {
  const poster = lasPromptJournal();
  const i = poster.findIndex((p) => p.id === id);
  if (i < 0) return;
  poster[i] = { ...poster[i], status, ...(fel ? { fel: fel.slice(0, 200) } : {}) };
  skrivPromptJournal(poster);
}

/**
 * R6 (b) — avslagssvaret: texten FÖLJER MED TILLBAKA (hela prompten + bilder)
 * och `avslag:true` skiljer "avvisad utan sändning" från andra fel, så att
 * en klient kan lägga texten i inmatningsrutan igen. Protokollets själva
 * poäng (autoSend=av): mottagaren omsänder ALDRIG ett avslaget meddelande.
 */
function avslagSvar(fel: string, kropp: { prompt: string; bilder: string[] }, status = 400): Response {
  return jsonSvar(
    { fel, avslag: true, prompt: kropp.prompt, ...(kropp.bilder.length > 0 ? { bilder: kropp.bilder } : {}) },
    status,
  );
}
