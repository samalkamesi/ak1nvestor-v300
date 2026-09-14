import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

import { autoPolicySvar } from "./permissions-policy";

/**
 * STUDIO-TRANSPORT — injicerbart transportlager för /studio-bryggan
 * (VÅG 81 WEBCHAT-STUDIO + VÅG 82 STUDIO V2 "Z-portalen i molnet",
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 81/82").
 *
 * VÅG 82-tillägg (protokollvägar FIRST-HAND bevisade 2026-09-09, se
 * tool-results/v82-protokoll.md): bytModell (kassera + session/create MED
 * model-param — sessionen föds med vald modell; session/setModel på levande
 * session är också bevisat men KVD-valet är create-vägen), publik nySession,
 * lasSessioner (session/list), compact (session/compact — kompakteringen
 * kör som turn, metoden väntar på idle) + lasKontext (session/read:s
 * projection {contextUsed, contextWindow, totalTokenCount} = kontextradens
 * sanningskälla; contextWindow 200 000 för zai/GLM vid beviset, 1 000 000
 * är endast reservvärde i UI när protokollet tiger).
 *
 * VÅG 83 MEGA-tillägg B1 (Z-portalens kärna — KOMPLETT STREAMING-
 * VISUALISERING + DIFF; protokollkälla: tool-results/v83-protokollkarta.md,
 * LIVE-testad 2026-09-09): StudioEvent utökas med
 *   · "verktyg_kort" — tool.updated (kinds scheduled/started/progress/
 *     result/error, kartan §4A): verktygsnamn, argument-truncat,
 *     resultat-truncat, fel, varaktighet (kind result bär duration) +
 *     live-progress (elapsedMs/stdoutTail/stderrTail) — varje verktygskall
 *     blir ett expanderbart kort i chattflödet.
 *   · "verktyg_input" — model.streaming kinds tool_input_delta/tool_call
 *     (agenten skriver argumenten LIVE — "läser fil X…" medan de tickar
 *     fram) samt defensivt part.delta field "input".
 *   · "runda" — turn.started/turn.completed (duration, resultType,
 *     toolCallCount) för rundstatistiken i agentbubblan.
 *   · state.updated — patch.status running/idle + aktiv verktygsräkning
 *     (patch.activeToolCalls) → status-event; projektionen hämtas efter
 *     rundan via lasKontext (oförändrat v82-flöde).
 *   · lasFilandringar() — senaste turnens filändringar som ±N-rader per
 *     fil, härledda ur session/messages tool-delar (VBe §5: Write bär
 *     hela content → +N; Edit bär old_string/new_string → EXAKT −N/+N;
 *     MultiEdit bär edits[]). Protokollets ursprungliga diff-källa
 *     v4/conversation/fileChanges lever i v4-grenen — EN EGEN protokoll-
 *     gren som kräver v4/connection/flow + v4/controller/subscribe +
 *     v4/conversation/subscribe och INGÅR ej i session/event-strömmen
 *     (kartan §4F/§6.1) — och är här dokumenterad som uppgraderingsväg;
 *     ändringspanelen renderar samma form oavsett källa.
 *
 * VÅG 83 MEGA-tillägg B2 (Z-portaLens GODKÄNANDEFLÖDE — permission- och
 * interaktionsskiktet; protokollkälla: tool-results/v83-protokollkarta.md
 * §3 SERVER→KLIENT-REQUESTS): ProtokollKlientens serverRequestHanterare
 * besvarar interaktionsdomänen asynkront —
 *   · interaction/requestPermission {input, reason, requestId, riskLevel,
 *     options:[{optionId: allow_once|allow_project|deny, kind, name,
 *     description?, response?}], toolCallId, toolName, turnId} → svaret är
 *     protokollets z2-form {decision:"allow"|"deny"|"escalate"|"modify",
 *     reason?, permissionUpdates?:[{type:"addRules",behavior,rules:[{toolName}]}]}.
 *     Alternativen publiceras som StudioEvent "interaktion" på den AKTIVA
 *     promptens ström (SSE-bryggan) + i ett register; UI:t svarar via
 *     POST /api/studio/interaktion → svarPermission(). KVD-DEFAULT: inget
 *     UI-svar inom 30 s ⇒ {decision:"escalate"} — sessionen får ALDRIG
 *     hänga på en obesvarad dialog. Re-announce av samma request-id
 *     (kartan §3: "server-<n>" kan skickas om) re-notifierar bara UI:t.
 *   · interaction/requestUserInput {requestId, prompt, inputType?:
 *     "text"|"choice"|"confirm", choices?} → {value} | {cancelled:true}
 *     (30 s-default: cancelled). Frågekort i chatten med knappval/fritext.
 *   · interaction/requestOfficialMcpAuthHeaders → {} (hoppa över — LIVE
 *     ×6 i kartan §3).
 *   · session/setMode {sessionId, mode:"build"|"plan"} (LIVE i kartan §1)
 *     + session/setThoughtLevel {sessionId, thoughtLevel:"nothink"|
 *     "high"|"max"} (LIVE-nivåer §1) — bägge sparas i transporten och
 *     följer med till session/create (mode+thoughtLevel är create-params)
 *     så modellbyte/ny session bevarar valet; resume bär tanke-nivån.
 *     E2E-AVGRÄNSNING (dokumenterad enligt KVD): permission-flödet kan
 *     ej testas i build-läge — servern auto-godkänner låg/medel risk där
 *     (kartan §3). Dialogen visas när läget kräver det (t.ex. plan);
 *     eskalerings-defaulten är tidsbestämt och körs i dev via mock.
 *
 * VÅG 84 STUDIO 100x block C (PERMISSION-UPPGRADERING): interaction/
 * requestPermission bär VERKTYGSARGUMENTEN i input-fältet ( Write/Edit/
 * MultiEdit: file_path + content / old_string+new_string / edits[]) —
 * transporten beräknar nu en DIFF-FÖRHANDSVISNING ur den RÅA inputen
 * INNAN trunkeringen (sammanfattning-fältet förblir truncat): ny export-
 * funktion diffUrInput(verktyg, input) → StudioFilandring (±N ÄRLIGA
 * heltal, rader med samma tak som ändringspanelen) på interaktionens
 * nya valfria fält "diff". UI:t renderar gröna +rader/röda −rader i
 * dialogen INNAN användaren väljer; utan diff (andra verktyg / input
 * saknas) visas argument-summary som förr. Mock-transportens simulerade
 * permission är nu en EDIT med old/new så hela kedjan (diff i eventet →
 * dialog → svar) bevisas deterministiskt i dev.
 *
 * VÅG 84 STUDIO 100x-tillägg B (MULTI-SESSION-TABBAR — Z-portaLens
 * flerfönster): transporten blir SESSION-PARAMETRISERAD — export
 * hamtaSessionTransport(sessionId? | nyckel?) håller ett register av
 * PER-SESSION-transporter (varje AppServerTransport = EGEN zcode-app-
 * server-barnprocess; N samtidiga tabbar = N barnprocesser — pm2 kör
 * allt i EN Next-process, RAM-vakten är dokumenterad i STYRELSE-ADMIN-
 * MEGA våg 84) + en SESSIONSKARTA sessionId → {senasteAktivitet,
 * historik, aktiv} (lasStudioSessionskarta/markeraSessionStart/
 * markeraSessionSlut) som GET /api/studio/stream listar så UI:t kan
 * resume TIDLIGARE sessioner i nya tabbar och visa senaste aktivitet.
 * Konstruktorparametern målSessionId tvingar ensure() att återuppta
 * JUST den sessionen — misslyckad resume av ett mål är ett ÄRLIGT fel
 * (ALDRIG tyst ny session, som vore en osynlig forgery av samtalet).
 * Default-transporten (hamtaStudioTransport) är OFÖRÄNDRAD: huvudtabben
 * och alla äldre rutter (modeller, session/list, mål, läge, tanke…) 
 * fortsätter på den — bakåtkompatibilitet bevaras.
 *
 * VÅG 85 STUDIO V3 F2 (SKILLS/PLUGINS/TOOLS-panelen — "vad agenten KAN";
 * protokollkälla: tool-results/v83-protokollkarta.md §2, metoderna är
 * LIVE-testade 2026-09-09): tre nya läsmetoder på transporten —
 *   · lasSkills()  → skills/referenceCatalog {workspace} → {authority,
 *     skills:[{id:"glm:…", name, description, path, scope:"plugin"|
 *     "workspace"|"user", enabled}]} — panelens SEKTION SKILLS (varje
 *     skill som kort med namn + beskrivning; referenceCatalog BÄR dem).
 *   · lasPlugins() → plugins/list {workspace} → {plugins:[{id, name,
 *     description, version, enabled, source, skillCount, components[]}],
 *     diagnostics[]} — SEKTION PLUGINS (aktiva med grön prick + version).
 *   · lasMcp()     → mcp/list {workspace} → {statuses: Record<serverNamn,
 *     {status:"connected"|"failed", transport:"stdio"|"http"|"sse",
 *     toolCount, updatedAt, error?}>} — SEKTION MCP-VERKTYG (anslutna
 *     tjänster med verktygsantal; LIVE-bevis: android-emulator med 23
 *     verktyg connected). Alla tre kräver LEVANDE klient men EGEN session
 *     (samma mönster som lasSessioner/lasArbetsyta) — panelen skapar
 *     ALDRIG en session bara för att lista.
 *
 * VÅG 85 STUDIO V3 F1 (MÅL-LÄGET — kundens "live utveckling som Z":
 * session/goal STARTAR en autonom loop; protokollkälla tool-results/
 * v83-protokollkarta.md §1 + v83 B3:s prod-bevis: mål-set föder NYA
 * turner AUTOMATISKT, session/stop PAUSAR): transporten får ett
 * MÅL-LÄGE — när ett mål är satt och INGEN klientprompt strömmar äger
 * mål-loopen session/event-flödet: påNotis dirigerar turnerna till
 * mål-lyssnaren (prenumereraMal — SSE-bryggan /api/studio/mal/stream)
 * och varje autonom iteration renderas som en KOMPLETT turn (samma
 * delta-/verktyg_kort-/verktyg_input-/runda-event som en chattad turn).
 * Nya StudioEvent-typer:
 *   · "mal_status"   {aktiv, pausad, iteration, mal} — snapshot vid
 *     prenumerera + vid set/paus/återuppta/rensa (räknaren lever i
 *     transporten — KVD).
 *   · "mal_iteration" {fas:"start"|"slut", iteration, svar?, …} —
 *     turn.started/turn.completed i mål-loopen; SLUT-pixeln bär
 *     iteration-numret + rundstatistik (KVD: turn.completed ⇒ nytt
 *     SSE-event "mal_iteration" med iteration-nummer).
 *   · "mal_pausad"   {iteration} — goal-pause (session/stop — LIVE-
 *     bevisat v83 B3: stop avbryter mål-turnen inom sekunder).
 * Event FÖRE prenumerering buffras (MAL_BUFFERT — en SEN öppnad ström
 * missar aldrig en påbörjad iteration) och spolas vid prenumereraMal.
 * Nya transportmetoder: malStatus()/prenumereraMal()/pausaMal()/
 * aterupptaMal()/sondMal() (självläkning efter processomstart: sond ur
 * session/goal show återaktiverar mål-läget för ett LEVANDE mål).
 *
 * VÅG 85 STUDIO V3 F4 (V4-DIFF — FILÄNDRINGAR UR PROTOKOLLETS EGEN KÄLLA;
 * LIVE-bevisat 2026-09-09 på Contabo, sondskript tool-results/
 * v85-f4-v4-sond{,2,3}.mjs): lasFilandringar() frågar nu FÖRST v4-grenen
 * — v4/conversation/fileChanges (kartan §4F) — och faller tillbaka på
 * Write/Edit-parsningen när v4-flödet ej svarar. BEVISAT V4-FLOW (sond3,
 * session med Write-turn):
 *   1. session/create MED persistence:"immediate" (sond1 utan: rows=0 —
 *      v4-raderna kräver persistent session).
 *   2. v4/conversation/subscribe {topic:"conversation/<sid>", connectionId:
 *      <EGEN sträng>, clientMode:"web-remote-replayable"} → ack
 *      {subscriptionId, mode:"snapshot", logEpoch}. OBS: v4/connection/flow
 *      är ENDAST flödeskontroll {connectionId, state:saturated|drained|
 *      closed} — INGEN handskakning; den tidigare våg-85-sondens -32603
 *      berodde på saknad logEpoch/revision (proto.stale*), ej gateway:en.
 *   3. Turn kör → notiser v4/conversation/frame {kind:"complete", topic,
 *      frame:{payload:{kind:"deltas", deltas:[{op:"state.updated",
 *      patch:{revision:N}}, {op:"row.appended", row:{…}}]}}} — revision
 *      spåras live (state.updated-patchens revision ≠ rowsRange.atSeq —
 *      sond2: revision 1 vs atSeq 4; sond3: 16 vs 83).
 *   4. v4/conversation/rowsRange {sessionId, clientMode, limit} →
 *      {rows:[{rowId, entityId, kind:"turnHeader"|…}], atSeq, atLogEpoch}.
 *      TARGET = SENASTE raden med kind "turnHeader" (sond3: turnHeader ✓,
 *      toolCall → proto.staleTarget, övriga → guard.actionUnavailable).
 *   5. v4/conversation/fileChanges {sessionId, target:{rowId, entityId},
 *      baseRevision:<spårad revision>, baseLogEpoch:<atLogEpoch>} →
 *      {files, additions, deletions, items:[{path, additions, deletions,
 *      writeCount, toolNames, patches:[{oldStart, oldLines, newStart,
 *      newLines, lines:["+A","+B","-C"]}]}]} — unified-patches MED
 *      RADNUMMER (rikare än Write/Edit-parsningen: exakta positioner,
 *      flerfilssanning via writeCount/toolNames). Fel på target/base →
 *      -32603 proto.staleRevision|proto.staleLogEpoch|proto.staleTarget.
 * KVD-val: v4 är PRIMÄR källa när hela kedjan lyckas; VARJE fel (ingen
 * prenumeration, rows tomma, stale, timeout) ⇒ befintlig Write/Edit-motor
 * (bevisat bra) — panelen renderar samma StudioFilandring-form oavsett.
 * F5 INLINE-KODVY konsumerar fältet "punkter" (patch-hunkar med
 * oldStart/newStart) för GUL radmarkering i filvisningen (se
 * studio-chat.tsx + POST /api/studio/filer).
 *
 * VÅG 86 G5 (CHECKPOINT/REWIND — "⟲ Gå tillbaka hit" på agentbubblorna;
 * LIVE-bevisat 2026-09-09 på Contabo, sond tool-results/v86-g5-forksond.mjs):
 * ny transportmetod rewindTillTurn(turnIndex) = session/fork med target
 * {kind:"turn", turnIndex}. FÄLTFORM UR vendor/zcode.cjs (app 3.11.2): target
 * är en strict zod-discriminatedUnion — {kind:"turn",turnIndex:int≥0} |
 * {kind:"message",messageId} | {kind:"checkpoint",checkpointId} |
 * {kind:"latestCheckpoint"} — och servern löser INTERN (fn XLi) turn →
 * targetMessageId = SISTA assistant-meddelandet i den 0-baserade turnen.
 * SONDFAKTA (2 turner, ingen filändring):
 *   · fork turn:0 → {forkedSessionId, parentSessionId, targetMessageId,
 *     response, snapshot} — forken FUNGERAR UTAN CHECKPOINT (message-vägen;
 *     endast kind checkpoint/latestCheckpoint kräver workspace-checkpoint,
 *     som skapas vid filändringar — kartan §1).
 *   · Forked sessionens meddelanden: [user#1, assistant#1, assistant(""),
 *     user("This session was forked from a…")] — en SYNTHETISK user-notis
 *     om forken + en tom assistant-post (historik()-filtret tystar tomma).
 *   · Ogiltigt turnIndex → -32004 "Cannot resolve assistant message for
 *     turnIndex=5" (ärligt fel — UI:t kan lita på felkoden).
 *   · latestCheckpoint utan filändring → -32603 "No workspace checkpoint
 *     is available yet" (känd sedan v83 — forka() behåller den vägen).
 * rewindTillTurn forkar ALLTSÅ vid valfri agentbubbla (checkpoint-id per
 * turn saknas i protokollet — dokumenterat; turn-forken är dess motsvarighet
 * och STARKARE: kräver inga filändringar), öppnar sedan forked-sessionen
 * (resume + subscribe + historik — oppnaSession-vägen) så DEN blir
 * transportens aktiva session: nästa prompt fortsätter från fork-punkten.
 * Parent-sessionen stängs artigt och lever kvar i session/list.
 *
 * VÅG 87 H1/H2 (STUDIO MEGA PERSISTENS — kundrapporten "sparar ej info,
 * fortsätter ej när jag är utanför sidan"; STYRELSE-ADMIN-MEGA "TILLÄGG VÅG
 * 87"): servern + barnprocessen fortsätter ARBETA när användaren lämnar
 * /studio — men historiken från frånvaron laddades inte vid återkomsten.
 *   · H2 DISK-PERSISTENS: sessionskartan skrivs till DISK (prod:
 *     /home/ak1a/.zcode/studio-sessions/karta.json; dev-reserv STUDIO_LAGRING/
 *     tmpdir) med 30 s debounce (VÅG 88 I3: sänkt från 60 s — snabbare
 *     flush, fortfarande rusningsskydd) varje gång ett svar klart
 *     (markeraSessionSlut + mål-iterationer) ⇒ KARTAN ÖVERLEVER PM2-OMSTART.
 *     Vid uppstart läses den tillbaka (engångs-hydrering — lasKartaFranDisk).
 *   · H1 ÅTERKOPPLING: lasAterkoppling() → {senastAktivSessionId,
 *     senastAktivHistorik, aktivtMal} — GET /api/studio/stream (utan
 *     sessionId) svarar DEN SENAST AKTIVA sessionen + hela dess historik
 *     (levande transport ur registret > kartan) + mål-snapshot, så UI:t vid
 *     mount AUTO-LADDAR frånvarons historik (resume i rätt tabb + borta-
 *     banner + reconnect-poll, se studio-chat.tsx). Mål-loopens iterationer
 *     markeras i kartan (markeraMalIterationStart/Slut) så autonomt arbete
 *     medan användaren är borta syns i historiken.
 *
 * VÅG 90 K1 (KÄRNSTABILITET — kundklagomål "de är sega, jobbar ej i timmar
 * om det behövs, stänger av sig"; STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 90" K1):
 *   · BARNPROCESS-OVERLEKSAKTER (ProtokollKlient): ovillkorlig exit/error
 *     → dödsnotis → pågående prompt får ett ÄRLIGT fel direkt (ALDRIG
 *     10-minuters-tystnad) och transporten startar om automatiskt (max 3
 *     försök, exponentiell backoff 2 s/8 s/32 s, därefter tydligt fel).
 *     Radbufferten kappas vid 1 MB (ett kaotiskt barn äter ALDRIG RAM),
 *     timers dödas/unref:as vid död, avsiktlig stang() triggar ALDRIG
 *     omstartskedjan.
 *   · SESSIONS-HUSHÅLLNING: max MAX_AKTIVA_BARN=3 levande zcode-barn — en
 *     ny tabb stänger först den ÄLDSTA idle-sessionen (inga lyssnare +
 *     inget mål → session/stang + barnprocess-död); sessioner idle >2 h
 *     stängs automatiskt (5-min-hushållning — RAM tillbaka till Contabos
 *     8 GB-budget, historiken lever i kartan + session/list); kartan
 *     spolas TVINGAT till disk vid stäng/död (30 s-debounce behålls för
 *     vanliga tweaks); pm2-SIGTERM stänger ALLA barn synkront så inga
 *     zombie-zcode-processer lämnas efter deploy/omstart.
 *   · HÄLSA: lasStudioHalsa() → GET /api/studio/halsa — barnantal, RAM per
 *     barn via /proc, sessioner i kartan, senaste omstart + senaste fel
 *     (öppen route men inga hemligheter, inga session-id:n).
 *
 * VÅG 91 A1 (SANN BAKGRUNDSAUTONOMI — kundklagomål "den dör när jag hoppar
 * till nästa sida"; STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 91" block A1):
 *   · A1a MÅL-MOTORN ÄR SERVER-SIDE: mål-loopens state (aktivt mål,
 *     iteration, pågående turn, senaste event) lever i TRANSPORTEN —
 *     mal/stream-routen är en ren VY som prenumererar. Klient-frånkoppling
 *     pausar ENDAST nätverksströmningen; protokollet matar mål-turner i
 *     barnprocessen oavsett lyssnare (v83 B3-bevis) och MAL_BUFFERT + kör-
 *     kort håller historiken hel. Sedan våg 91 Märks iterationerna i
 *     SESSIONSKARTAN (markeraMalIterationStart/Slut) av TRANSPORTEN — inte
 *     av SSE-routen — så autonomt arbete syns i historiken ÄVEN när ingen
 *     klient är ansluten. Idle-städningen (VÅG 90 K1) rörs ALDRIG ett
 *     aktivt mål: arIdle() kräver !malAktiv (verifierat).
 *   · A1c ARBETE ÖVERLEVER KLIENT-ABORT: API-routen skicka-prompten till
 *     transport.skicka UTAN klientens abort-signal — klient-abort stoppar
 *     bara nätverksströmningen (SSE:t), ALDRIG session/send-arbetet i
 *     barnprocessen. Svaret samlas i historiken (session/messages +
 *     sessionskartan) och levereras HELT vid återanslutning (GET). En ev.
 *     signal till skicka() förblir transportens interna sak (10-min-taket).
 *   · A1b malStatus() utökas: {pagaendeTurn, senasteEvent, uppdaterad} —
 *     GET /api/studio/mal/status ger återvändande flikar snabb catch-up.
 *   · A1d skickaMedBild(prompt, bildSokvagar[]): BINÄRSOND 2026-09-09
 *     (vendor/zcode.cjs, app 3.11.2): session/send-bär attachments?:
 *     Record<string,unknown>[] — en OPAK genomströmning; RIKTIGT binärinnehåll
 *     kräver v4-gateway:ns attachment-flöde (v4/attachment/begin
 *     {connectionId,uploadId,sessionId,fileName,mime,totalBytes,totalChunks,
 *     checksum:"sha256:<64hex>"} → chunk {uploadId,chunkIndex,dataBase64} →
 *     commit {uploadId} → ref) — ej LIVE-bevisat. KVD-VALET är därför våg-
 *     91-kontraktets fallback: bilderna ligger REDAN i arbetsytan (uppladdade
 *     till uploads/…) och prompten utökas med sökvägsreferenser (barnets
 *     Read presenterar bilder visuellt) — byggPromptMedBilder(). V4-flödet
 *     är dokumenterad uppgraderingsväg när det sonderats LIVE.
 *   · A1d TJÄNSTE-BRYGGOR (tunna transportmetoder → /api/studio/tjanster/*):
 *     lasBakgrundsjobb (session/read projection.backgroundJobs +
 *     subagenter-fallback), lasWebblasare/korWebblasare (interaction/
 *     browserList|browserExecute — binärsond: kräver requestId+sessionId+
 *     workspace+clientMode+sessionContext), lasAutomationer (automation/
 *     list, lifecycleStatus-union active|completed|failed|paused) och
 *     genereraText (workspace/generateText {workspace, modelRef, prompt,
 *     querySource? — valfri sträng}). Okänd metod (-32601) ⇒
 *     StudioMetodSaknasError (routen svarar ärlig 501 {saknas:true}).
 *
 * VÅG 92 B1 (Z-PARITET P0-KOMPLETT — STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 92"
 * block B1, A4-kartans topp-5; protokollform ur V91-Z-PARITET-KARTA.md +
 * v83-kartan §1/§2/§4F + våg 91 A1d-binärsondens dokumentation):
 *   · LADDA UPP BILAGA (P0-1, käpphästen): laddaUppBilaga(sokvag) kör
 *     v4-gateway:ns attachment-flöde — begin {connectionId, uploadId,
 *     sessionId, fileName, mime, totalBytes, totalChunks, checksum:
 *     "sha256:<64hex>"} → chunk {uploadId, chunkIndex, dataBase64} (512 kB
 *     bitar, base64) → commit {uploadId} → ref. PROTOKOLLFORMEN är den
 *     dokumenterade (våg 91 A1d-sond ur vendor/zcode.cjs app 3.11.2); LIVE-
 *     bevis saknas ännu — därför avvisar ALLT (metod saknas/-32601, fel
 *     form, timeout, fil saknas/över tak) med NULL och skickaMedBild:s
 *     arbetsytareferens-fallback (byggPromptMedBilder, våg 91) består INTACT.
 *     Tak: 8 bilder/prompt (route + byggPromptMedBilder) · 5 MB/bilaga ·
 *     sanitär sökväg (relativ i arbetsytan, ".."/absolut/backslash avvisas +
 *     rot-prefixkontroll — Mimosa-receptet från våg 91: strängkonkat, ALDRIG
 *     path.join med variabel).
 *   · SKICKA MED ATTACHMENTS: skickaMedBild försöker laddaUppBilaga per
 *     bild → lyckat attachmentId ger session/send {content, attachments:
 *     [ref]} (send-schemats OEt-attachments är OPAK Record[] — minimi-
 *     objektet = commit-svarets ref, annars {attachmentId}); null-bilder
 *     får sökvägsreferenser i prompten. Form-avvisad send (-32602/
 *     unrecognized) nedgraderas EN gång till vanlig skicka med reserv-
 *     prompten (alla bilder som referenser) — BÅDA fallback-vägarna lever.
 *   · AUTOMATION CRUD (P0-3): automationSkapa({namn, schema, prompt,
 *     lasLage?}) → automation/create {title, cronExpr, prompt, enabled,
 *     mode?} (lasLage=true ärver transportens läge); automationUppdatera
 *     (id, {pausad}) → automation/update {automationId, enabled} (pausa =
 *     enabled:false → lifecycleStatus "paused"); automationRadera(id) →
 *     automation/delete {automationId} → {deleted}; lasAutomationer() med
 *     FULL parsning (nextRunAt, nextNextRunAt om finns, runCount, lastRunAt).
 *     -32601 ⇒ StudioMetodSaknasError (B2:s 501-karta består); okänd svar-
 *     form ⇒ null/vänligt meddelande — ALDRIG krasch.
 *   · SKICKA-AUTOMATION (P0-5): skickaAutomation(prompt, automationId?,
 *     offPeak?, lyssnare?, signal?) — session/send med automationId eller
 *     offPeakTaskId+offPeakRunType:"init" (mut. exkl. enligt kartan §1;
 *     klienten äger offPeak-id:t — samma mönster som uploadId/connectionId).
 *     Utan fält/vid form-avvisning → vanlig skicka (nedgraderingen i skicka).
 *   · BAKGRUNDSJOB FULLT (P0-4): lasBakgrundsjobb() parsar HELA projection
 *     .backgroundJobs-arrayen — id (taskId|id), titel, status, startad,
 *     pid, kommando, utdataSvans (outputTail), avbrytbar (cancellable);
 *     subagent-fallback består (ärvd från våg 91).
 *
 * VÅG 93 C1 (P1-KLUSTRET — STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 93" block C1 +
 * V93-P1-UNDERLAG kluster a+c+d; protokollformer ur V91-Z-PARITET-KARTA §1.1
 * #6/§1.2 #10-12/§1.3 #4 + v83-protokollkarta.md §1-2):
 *   · (a) WORKSPACE-INSTÄLLNINGAR: lasWorkspaceInstallningar() = workspace/
 *     readState FULL parsning → {modell?, tankestyrka?, lage?, annan?} —
 *     DEFENSIVT mot alla svarformer (strukturvägarna settings.model.current →
 *     modelCatalog.defaultModel → *.lastUsed, thoughtLevel.current →
 *     defaultLevel, mode.current; därefter BUNDET djupsök efter
 *     defaultModel/model, thoughtLevel, mode i kapslade objekt — kartans
 *     readState-form är LIVE-bevisad men svarsbudgeten varierar mellan
 *     binärversioner). sparaStandardModell/Tankestyrka/Lage = raka
 *     protokollFraga-bryggor till workspace/setDefaultModel {workspace,
 *     model:{providerId,modelId}} / setDefaultThoughtLevel {workspace,
 *     thoughtLevel} / setDefaultMode {workspace, mode} (karta §1.2 #10-12 —
 *     zod OPAK i kartan, fältnamnen är underlagets dokumenterade former).
 *     -32601 ⇒ StudioMetodSaknasError (routen: 501). ALIAS sattStandard*
 *     (underlagets namnfamilj) delegerar — C2:s installningar-rutt sonderar
 *     den familjen först. HELIG GRÄNS: INGEN config.json-skrivning, INGA
 *     API-nycklar — endast protokollets egna setDefault*-fält.
 *   · (c) PLUGINS-DRIFT: lasPlugins() parsar nu aktiveringsstatus defensivt
 *     (enabled === true ELLER enabled osatt + disabled === false — kartans
 *     §1.3 #1-form) + version per plugin; pluginSattAktiverad(namn, aktiverad,
 *     omfattning?) → plugins/setEnabled {workspace, pluginId, enabled,
 *     scope} (karta §1.3 #4, dokumenterad — ej LIVE; zod opak ⇒ EN
 *     form-avvisnings-retry UTAN scope när omfattning ej var explicit).
 *     -32601 ⇒ StudioMetodSaknasError (501).
 *   · (d) EVENTS-REPLAY-SOND (lätt): lasEventsFranSeq(sessionId, franSeq?,
 *     tak?) → session/events {sessionId, afterSeq?, limit?} (karta §1.1 #6 —
 *     LIVE-bevisad replväg i v83-kartan: "27 events efter 1 turn"; fält-
 *     namnet afterSeq är protokollets, franSeq är det svenska parameternamnet)
 *     → defensiv parsning {handelser[], nastaSeq?} (vEt-kuvert: type/kind,
 *     seq, turnId, timestamp, payload — opak genomströmning för kommande
 *     C-block). NULL vid -32601 (och övriga protokollfel — replay är lyx,
 *     historik-vägen session/messages består; ALDRIG krasch).
 *
 * VÅG 94 B (PERMISSIONS-AUTOPOLICY — "molnutvecklingens lås upp"; bevisat
 * prod-problem: agentens Write/Bash-skärningar triggar interaction/
 * requestPermission → transporten väntade på webbläsarsvar → headless/
 * mål-läge/bakgrundsarbete fick "inget klient-svar inom 30 s" ⇒ NEKAT —
 * kunden såg agenten stanna vid VARJE skrivning): paServerRequest kör
 * REN auto-policy (src/lib/studio/permissions-policy.ts, STUDIO_AUTO_POLICY
 * default PÅ) FÖRST för varje permission-request —
 *   · allow (Write/Edit/MultiEdit INOM arbetsytan via rot-prefixkontroll —
 *     Mimosa-receptet, ren strängkonkat; Read/Glob/Grep/LS/Task/Agent;
 *     Bash vars varje led efter splittring på && ; | matchar vitlistan:
 *     git-flöden, npm, npx tsc, node, ls/cat/pwd/date/mkdir/wc/head/tail/
 *     grep, cp/mv inom arbetsytan, python3/pytest, pm2 list/restart ak1a,
 *     curl till localhost/lab.ak1nvestor.com) ⇒ protokollsvaret {decision:
 *     "allow"} DIREKT (samma z2-form som svarPermission:s allow_once) +
 *     status-event "Auto-policy tillät: …";
 *   · deny (rm -rf mot rot, sudo, .env-filer, id_rsa, .pem-certifikat,
 *     authorized_keys, crontab/systemctl, curl|sh, chmod 777, dd, mkfs,
 *     forkbomb, git push --force) ⇒ {decision:"deny"} + status-event
 *     "Auto-policy nekade: …";
 *   · frag/null ⇒ befintligt dialogflöde (pending interaktion + 30 s-
 *     default) — policyn frågar när den inte kan bedöma anropet.
 * Mocken är NEUTRAL (dess permission-demo bär inga riktiga server-requests).
 *
 * VÅG 95 (STUDINS UPPLEVDA HASTIGHET — kundklagomålet "sega"; tre kända
 * källor, STYRELSE-ADMIN-MEGA våg 94 punkt 4 + våg 95-uppdraget):
 *   · -32031-STÄDNING (källa 1: "-32031 vid första meddelandet efter
 *     omstart" — en sparad/kartlagd session fäster en död modell, resume
 *     LYCKAS men första session/send kastar -32031 → självläkningen
 *     kasserar + skapar ny = en extra dubbeltur SEKUNDER fram till
 *     svaret): en session är FRISKGÅNG när dess senaste aktivitet (kartans
 *     senasteAktivitet; persistensfilens sparad-tid som reserv) är äldre
 *     än 24 h ELLER den flaggats modellDod (satt av självläkningen vid
 *     varje -32031 — bevaras på disk via kartan). ETT NYTT MEDDELANDE mot
 *     en friskgång-session startar FRISK session DIREKT (hamtaSession-
 *     transport med alternativ.nyttMeddelande; default-transportens
 *     persistens-resume skippas i ensure()) — historik-previews FÖRLORAS
 *     ej (kartposten lever kvar oförändrad + session/list bär arkivet).
 *     VY-vägen (GET ?sessionId=) resumed oförändrat ärligt — läsning av
 *     en gammal session är harmlöst, -32031 sitter i send.
 *   · VARMFÖRHÅLLANDE (källa 2: kall-start av zcode-barnprocessen — spawn
 *     + session/create tar sekunder första gången efter pm2-omstart):
 *     varmStudioTransport() — best-effort, idempotent (MAX en gång per
 *     process via globalThis-vakt), tyst fel, STUDIO_VARM=av-brytare,
 *     hoppas över i `next build`-fasen + på mock — startar standard-
 *     transporten + en session i BAKGRUNDEN vid transport-init (modulens
 *     första evaluering, 8 s förskjuten så Next-boot får gå före) så
 *     första kundmeddelandet träffar en varm transport. Hushållningens
 *     2 h-idle-städning stänger barnet om ingen kund kom — värmen kostar
 *     aldrig mer än startfönstret.
 *   · TTFB-MÄTNING (källa 3: SSE-strömningens tid-till-första-tecken):
 *     verktyg/testa-studio-ttfb.mjs mäter POST → första delta + total
 *     tid mot lokal dev (mock); prod-baslinje mäts efter deploy av main.
 *
 * Två implementeringar bakom ETT gränssnitt:
 *
 *   1. appServerTransport — PRIMÄR (protokollet FIRST-HAND bevisat
 *      2026-09-09 på Contabo, se tool-results/v81-appserver.md + STUDIO-2-
 *      korrigeringen i slutet av den filen): spawnar `zcode app-server`
 *      som långlivad barnprocess och talar ZCode Protocol: NDJSON på
 *      stdio, kuvert {"id"?,"method","params"} UTAN jsonrpc-fält. Metoder
 *      som bevisats live: session/create, session/resume, session/list,
 *      session/subscribe, session/send, session/messages, session/stop.
 *      Strömning sker via session/event-notiser där HÄNDELSETYPEN ligger
 *      på params-nivå i zcode ≥ 3.11.2-22 (params.type "model.streaming"
 *      med payload.kind text_delta/reasoning_delta; slutpixel
 *      "turn.completed" med payload.response) — äldre form med typen i
 *      payload ("turn") stöds defensivt. session/send på en session vars
 *      modell tagits bort svarar -32031 ZCODE_RUNTIME_MODEL_UNAVAILABLE →
 *      transporten kasserar sessionen, skapar en färsk (aktuell modell)
 *      och försöker EN gång till (bevisat 2026-09-09 när glm-5.3-flash
 *      stängdes av).
 *
 *   2. mockTransport — deterministisk utvecklings-/testtransport (ingen
 *      modell, inga kostnader): samma gränssnitt, strömmer ett canned
 *      markdown-svar i bitar. DEV på Windows-arbetsstationen använder
 *      mock som default (NEXT_ENV-artighet: riktig end-to-end sker vid
 *      deploy på Contabo där zcode + workspace lever lokalt).
 *
 * FALLBACK-ARKITEKTUR (dokumenterad i v81-appserver.md): om protokollet
 * bryts i framtida zcode-versioner är planen tmux send-keys + capture-
 * pane-pollning (V2) — INTE implementerad här (ingen död kod; gränssnittet
 * tar emot en tredje transport om det behövs).
 *
 * MILJÖVARIABLER (alla valfria — prod på Contabo behöver INGEN):
 *   STUDIO_TRANSPORT   = "appserver" | "mock" (default: mock på win32,
 *                        annars appserver)
 *   STUDIO_ZCODE_BIN   = sökväg till zcode-binären (default: "zcode" resp.
 *                        /home/ak1a/.npm-global/bin/zcode som reserv)
 *   STUDIO_WORKSPACE   = agentens arbetskatalog
 *                        (default: /home/ak1a/agent/ak1 om den finns, annars cwd)
 *   STUDIO_LAGRING     = katalog för sessions-persistensfilen
 *                        (default: os.tmpdir())
 *   STUDIO_AUTO_POLICY = "av" stänger av permission-auto-policyn (våg 94 B
 *                        — default PÅ; allt blir då webbläsardialog igen)
 *
 * Säkerhet: transporten kör ENDAST server-side (Node runtime) och exponerar
 * ALDRIG hemligheter mot klienten — API-rutten (stream/route.ts) äger
 * requireAdmin och översätter events till sanerad SSE.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Gränssnitt ───────────────────────────────────────────────────────────────

/** Strömningskanal: "text" = svaret, "tankar" = agentens resonemang. */
export type StudioKanal = "text" | "tankar";

/**
 * Verktygskortets livscykelsteg — mappar tool.updated-kinds (kartan §4A):
 * scheduled→planerad, started→startar, progress→kör, result→resultat,
 * error→fel. UI:t spinner på planerad/startar/kör och färgar fel rött.
 */
export type StudioVerktygSteg = "planerad" | "startar" | "kör" | "resultat" | "fel";

/** Live-progress på ett körande verktyg (tool.updated kind "progress"). */
export interface StudioVerktygFramsteg {
  elapsedMs?: number;
  /** stdoutTail/stderrTail-truncat — bashverktygets puls. */
  utdata?: string;
}

/** En diff-rad i ändringspanelen — "+" grön, "−" röd. */
export interface StudioRadandring {
  typ: "+" | "-";
  text: string;
}

/** Filändring med ÄRLIGA ±N-rader (rader kan vara trunkerade till cap). */
export interface StudioFilandring {
  sokvag: string;
  plus: number;
  minus: number;
  rader: StudioRadandring[];
  /**
   * VÅG 85 F4: v4/conversation/fileChanges patch-hunkar MED RADNUMMER
   * (unified form) — fylls endast när v4-grenen levererade diffen.
   * newStart är 1-baserat i den NYA filversionen (kodvyn markerar
   * newStart…newStart+newLines−1); newLines===0 = ren borttagning
   * (kodvyn visar röd spökrad). Saknas för Write/Edit-parsad diff.
   */
  punkter?: { oldStart: number; oldLines: number; newStart: number; newLines: number; rader: string[] }[];
}

/**
 * Alternativ i en permission-request (protokollens options[]-post, kartan
 * §3): optionId allow_once|allow_project|deny + visningsnamn. "response"
 * (protokollets förslagade z2-svar) stannar i transporten — UI:t ser bara
 * knappdata.
 */
export interface StudioPermissionAlternativ {
  optionId: string;
  namn: string;
  beskrivning?: string;
}

/**
 * Server→klient-interaktion som väntar på användarens svar (V83 B2).
 * "permission" = verktygskall som kräver godkännande; "fråga" =
 * requestUserInput (knappval eller fritext).
 */
export type StudioInteraktion =
  | {
      typ: "permission";
      requestId: string;
      verktyg: string;
      /** low|medium|high|critical (kartan §3). */
      risk: string;
      skäl?: string;
      /** Argument-summary (truncat JSON/text) — protokollets input-fält. */
      sammanfattning: string;
      alternativ: StudioPermissionAlternativ[];
      /**
       * V84 C: diff-förhandsvisning ur den RÅA inputen (Write/Edit/MultiEdit)
       * — ±N rader innan godkännandet; samma form som ändringspanelen.
       * Saknas för verktyg utan filargument (UI:t faller på sammanfattning).
       */
      diff?: StudioFilandring;
    }
  | {
      typ: "fråga";
      requestId: string;
      fråga: string;
      /** text|choice|confirm (kartan §3). */
      inputTyp?: string;
      val?: string[];
    };

/** Detaljerade händelser som transporten strömmar under en prompt. */
export type StudioEvent =
  | { typ: "status"; text: string }
  | { typ: "delta"; kanal: StudioKanal; text: string }
  | { typ: "verktyg"; namn: string; händelse: "start" | "slut" }
  | {
      /** V83 B2: interaktionsrequest väntar på användarens val (dialogkort). */
      typ: "interaktion";
      interaktion: StudioInteraktion;
    }
  | {
      /** V83 B2: interaktionen löst (svar/avbruten/eskalerad) — stäng kortet. */
      typ: "interaktionsKlar";
      requestId: string;
      /** "eskal" | "avbruten" | "besvarad" | "tillåtet en gång" | … */
      beslut: string;
      skäl?: string;
    }
  | {
      /** V83 B1: verktygskort (tool.updated-kartläggning) — merge:a på id. */
      typ: "verktyg_kort";
      /** Protokollets toolCallId — UI:t samlar korten per id. */
      id: string;
      /**
       * Verktygsnamn — ENDAST när protokollet bär det (LIVE-sond: kind
       * "result" saknar toolName; UI:t behåller då det tidigare namnet).
       */
      namn?: string;
      steg: StudioVerktygSteg;
      /** Argument som JSON-sträng, truncat. */
      argument?: string;
      beskrivning?: string;
      /** Resultatet som text, truncat. */
      resultat?: string;
      /** Felmeddelande (kind error) — kortet renderas rött. */
      fel?: string;
      /** Kind result bär duration (ms). */
      varaktighetMs?: number;
      /** Kind progress: elapsedMs + stdout/stderr-svans. */
      framsteg?: StudioVerktygFramsteg;
    }
  | {
      /** V83 B1: agenten skriver verktygsargumenten LIVE (model.streaming). */
      typ: "verktyg_input";
      id: string;
      text: string;
    }
  | {
      /** V83 B1: turn.started/turn.completed — rundstatistik i bubblan. */
      typ: "runda";
      fas: "start" | "slut";
      varaktighetMs?: number;
      /** "success" | "cancelled" | "error_max_turns" | … (kartan §4A). */
      resultatTyp?: string;
      verktygAntal?: number;
      tokenCount?: number;
    }
  | { typ: "klart"; svar: string; tokenCount?: number; varaktighetMs?: number }
  // ── VÅG 85 F1: MÅL-LÄGET (autonom utvecklingsloop — se filhuvudet) ──────────
  | {
      /** Snapshot av mål-läget: vid prenumerera + vid set/paus/rensa. */
      typ: "mal_status";
      /** true = den autonoma loopen KÖR (turner matas automatiskt). */
      aktiv: boolean;
      /** true = målet finns men är pausat (session/stop). */
      pausad: boolean;
      /** Transportens iterationsräknare (KVD: räknaren lever här). */
      iteration: number;
      /** Måltexten — null när inget mål är satt. */
      mal: string | null;
    }
  | {
      /** turn.started/turn.completed i mål-loopen (KVD-pixeln: SLUT bär
       * iteration-numret + rundstatistiken — en autonom iteration = en
       * KOMPLETT turn i chatten). */
      typ: "mal_iteration";
      fas: "start" | "slut";
      iteration: number;
      /** SLUT: hela iterationens svar (turn.completed.response). */
      svar?: string;
      resultatTyp?: string;
      verktygAntal?: number;
      tokenCount?: number;
      varaktighetMs?: number;
    }
  | {
      /** Goal-pause (session/stop — LIVE-bevisat v83 B3). */
      typ: "mal_pausad";
      iteration: number;
    }
  | { typ: "fel"; meddelande: string };

export type StudioLyssnare = (event: StudioEvent) => void;

/** Historikpost (senaste först i tid — transporten returnerar äldst först). */
export interface StudioHistorikPost {
  roll: "user" | "assistant";
  text: string;
}

/**
 * VÅG 84 B: sessionskartans post — en rad per session som SERVERT sidan
 * sett via /api/studio/stream (både huvudsessionen och egna tabbar).
 * "aktiv" = en prompt strömmar JUST NUPP i sessionen (UI:t kan visa
 * ON-GÅENDE-prick även efter refresh i en annan klient); "historik" är
 * en MINSKAD spegling (senaste N) av prompt/svar-par i ankomstordning —
 * full sanning lever i zcode-sessionen (session/messages).
 */
export interface StudioSessionsKort {
  /** Date.now() vid senaste prompt-start/slut. */
  senasteAktivitet: number;
  /** Senaste prompt/svar-par i ankomstordning (cappad, senast först sist). */
  historik: StudioHistorikPost[];
  /** true medan en prompt strömmar i sessionen (via denna Next-process). */
  aktiv: boolean;
  /**
   * VÅG 90 K1: true när sessionen STÄNGTS (session/close — idle-städning
   * eller användar-stängning); resume vägrar då ärligt. Bevaras över disk-
   * hydreringen så en stängd/död session inte återbjuds som levande efter
   * omstart (känt problem: döda sessioner stannade kvar i kartan).
   */
  stangd?: boolean;
  /**
   * VÅG 95: true när sessionen EN GÅNG drabbats av -32031 (ZCODE_RUNTIME_
   * MODEL_UNAVAILABLE — självläkningen flaggar vid kasseringen). En
   * modellDod-session resumed ALDRIG igen för NYA meddelanden (frisk
   * session direkt) — -32031-upprepningsloopen efter omstart bryts.
   * Bevaras över disk-hydreringen; historik-previews lever kvar.
   */
  modellDod?: boolean;
}

/**
 * Post ur session/list (protokollfält mappade defensivt). V83 utökad med
 * modell (qBe.model) + berikning: turns/tokens hämtas ur session/read:s
 * projection för topp-listan (turnCount/totalTokenCount — BEVISAT v83,
 * se tool-results/v83-protokollkarta.md §1).
 */
export interface StudioSessionPost {
  sessionId: string;
  titel?: string;
  status?: string;
  arbetsyta?: string;
  uppdaterad?: string;
  /** v83: qBe.model → "zai/glm-5.3" (ellerbart modelId om provider saknas). */
  modell?: string;
  /** v83: projection.turnCount via session/read-berikning. */
  turns?: number;
  /** v83: projection.totalTokenCount via session/read-berikning. */
  tokens?: number;
}

/**
 * Kontextsanning ur session/read-projektionen (BEVISAT v82: projection =
 * {contextUsed, contextWindow, totalTokenCount, turnCount, ...}). UI:t
 * använder protokollets ÄRLIGA contextWindow som tak (200 000 för zai/GLM
 * vid beviset) och 1 000 000 endast som reservvärde när protokollet tiger.
 */
export interface StudioKontext {
  modell?: string;
  contextUsed?: number;
  contextWindow?: number;
  totalTokenCount?: number;
  turnCount?: number;
  /** V83 B2: projection.mode ("build"|"plan"|…) — lägesväxlarens sanning. */
  lage?: string;
  /** V83 B2: snapshot settings.thoughtLevel.current (nothink|high|max). */
  tankeNiva?: string;
}

/** Svar från compact() — status enligt protokollets compact.state. */
export interface StudioCompactSvar {
  status: "klar" | "redan_körs" | "tom";
  meddelande: string;
  kontext?: StudioKontext | null;
}

/** Resultat från bytModell() — sessionId BYTER alltid (KVD/E2E-krav). */
export interface StudioBytModellSvar {
  sessionId: string;
  /** "create" = kassera + session/create med model-param (huvudvägen). */
  väg: "create";
  modell: string;
}

/** Resultat från oppnaSession() — historiken ur session/messages. */
export interface StudioOppnaSvar {
  sessionId: string;
  historik: StudioHistorikPost[];
  kontext: StudioKontext | null;
}

/** Resultat från forka() — forkedSessionId saknas när checkpoint krävs. */
export interface StudioForkSvar {
  forkedSessionId?: string;
  meddelande: string;
}

/**
 * VÅG 86 G5: resultat från rewindTillTurn() — sessionen forkad vid en SPECIFIK
 * turn och forked-sessionen är NU transportens aktiva (nästa prompt fortsätter
 * från fork-punkten; chatten börjar om från historiken här).
 */
export interface StudioRewindSvar {
  /** Forked-sessionens id (session/fork → forkedSessionId). */
  sessionId: string;
  /** 1-baserat iterationsnummer = turnIndex+1 (toastens sanning). */
  iteration: number;
  /** Chattens historik FRÅN BÖRJAN till fork-punkten (forked-sessionens). */
  historik: StudioHistorikPost[];
  /** Färsk kontext för forked-sessionen (kontextraden). */
  kontext: StudioKontext | null;
  meddelande: string;
}

/** Resultat från lasMal()/sattMal() (session/goal — LIVE-bevisat "show"). */
export interface StudioMalSvar {
  /** null = inget mål satt (LIVE: response "No goal is set…"). */
  mal: string | null;
  meddelande: string;
  /**
   * VÅG 85 F1: true = mål-loopen LEVER (LIVE-format på show: "Goal active"
   * + "Objective:"-rad). false/undefined = pausat eller okänt format —
   * UI:t visar badge/banner först när sanningen finns.
   */
  aktiv?: boolean;
}

/** VÅG 85 F1: mål-lägets snapshot (transportens sanning för badge/banner). */
export interface StudioMalStatus {
  /** true = den autonoma loopen KÖR (protokollet matar turner). */
  aktiv: boolean;
  /** true = målet finns men är pausat (session/stop). */
  pausad: boolean;
  /** Antal AVSLUTADE/PÅGÅENDE iterationer sedan mål-set (räknaren här). */
  iteration: number;
  /** Måltexten — null när inget mål är satt. */
  mal: string | null;
  /**
   * VÅG 91 A1b: true = en mål-turn är ÖPPEN just nu (turn.started sedd,
   * turn.completed ej än) — GET /api/studio/mal/status "pagaendeTurn".
   */
  pagaendeTurn?: boolean;
  /** VÅG 91 A1b: kort beskrivning av SENASTE mål-event (statuspollens rad). */
  senasteEvent?: string;
  /** VÅG 91 A1b: epoch ms när senaste mål-event sågs (statuspollens "uppdaterad"). */
  uppdaterad?: number;
  /**
   * VÅG 139: mål-sessionens id — så studions öppningsval kan prioritera
   * PÅGÅENDE arbete (kunden ser chatten fortsätta efter refresh).
   */
  sessionId?: string;
}

/** Status-badge för en bakgrundsagent (session/subagents running+ended). */
export type StudioSubagentStatus =
  | "running"
  | "waiting"
  | "blocked"
  | "success"
  | "failed"
  | "cancelled"
  | "lost";

/** Bakgrundsagent ur session/subagents (running[] ∪ ended.items[]). */
export interface StudioSubagent {
  barnSessionId: string;
  titel: string;
  typ?: string;
  status: StudioSubagentStatus;
  startad?: string;
  avslutad?: string;
  sammanfattning?: string;
}

/** Resultat från avbrytBakgrundsTask() (session/cancelBackgroundTask). */
export interface StudioAvbrytSvar {
  avbruten: boolean;
  meddelande: string;
}

/** Workspaceinfo ur workspace/readState (BEVISAT LIVE v83, §2 i kartan). */
export interface StudioArbetsytaInfo {
  arbetsyta: string;
  /** settings.mode.current ("build"|"plan"|…). */
  lage?: string;
  /** settings.model.current → "zai/glm-5.3". */
  modell?: string;
  tankeNiva?: string;
  /** settings.permission.mode. */
  behorighet?: string;
  modellerTillgangliga?: number;
  kommandon?: number;
}

// ── VÅG 91 A1d: TJÄNSTE-BRYGGOR — bakgrundsjobb/webbläsare/automation ────────

/**
 * VÅG 91 A1d: ett bakgrundsjobb — session/read-projektionens backgroundJobs
 * (Tkn-form, kartan §1: {taskId,toolName?,taskKind,status,description?,…})
 * mappat defensivt; när projektionen tiger faller bryggan på session/
 * subagents (barnSessionId som id). Panelen renderar id + status + beskrivning.
 */
export interface StudioBakgrundsjobb {
  /** Protokollets taskId (eller childSessionId ur subagent-fallback). */
  id: string;
  /** "bash" | "subagent" | … (taskKind). */
  typ?: string;
  /** "running" | "completed" | "failed" | "cancelled" | … */
  status: string;
  /** description/command ur Tkn — panelens huvudrad. */
  beskrivning?: string;
  /** Verktygsnamn när protokollet bär det. */
  verktyg?: string;
  /**
   * VÅG 92 B1 (P0-4): FULL projektionsparsning — titeln ur title-fältet
   * (subagent-fallback: agentens titel) när protokollet bär den.
   */
  titel?: string;
  /** VÅG 92 B1: startad (startedAt/createdAt — ISO-sträng som protokollet bär den). */
  startad?: string;
  /** VÅG 92 B1: process-id när protokollet bär det (Tkn.pid). */
  pid?: number;
  /** VÅG 92 B1: kommandot (Tkn.command) — panelens terminalrad. */
  kommando?: string;
  /** VÅG 92 B1: outputTail-truncat — jobbets puls. */
  utdataSvans?: string;
  /** VÅG 92 B1: cancellable — avbryt-knappens sanning. */
  avbrytbar?: boolean;
}

/** VÅG 91 A1d: en webbläsare ur interaction/browserList (binärsond PBe). */
export interface StudioWebblasare {
  id: string;
  /** Protokollets generation (räknas upp per omstart — krävs i execute). */
  generation: number;
  /** Protokollets type (t.ex. engine-typ). */
  typ?: string;
  /** Visningsnamn. */
  namn?: string;
}

/** VÅG 91 A1d: en automation ur automation/list ($je-form, kartan §2). */
export interface StudioAutomation {
  id: string;
  titel: string;
  /** cronExpr (eller intervall-form). */
  cron?: string;
  /** lifecycleStatus: active|completed|failed|paused (binär-union). */
  status?: string;
  /** nextRunAt (ISO-sträng som protokollet bär den). */
  nastaKorning?: string;
  /**
   * VÅG 92 B1 (P0-3): nextNextRunAt — protokollets andra schemalagda körning
   * OM det bär fältet ("om finns" enligt A4-kartan; aldrig påhittat).
   */
  nastaNastaKorning?: string;
  /** VÅG 92 B1: runCount — antal genomförda körningar (om protokollet bär det). */
  korningar?: number;
  /** VÅG 92 B1: lastRunAt — senaste körningen (om protokollet bär det). */
  senasteKorning?: string;
  /** enabled-flaggan. */
  aktiverad?: boolean;
  /** Automationsprompten (vad den kör). */
  prompt?: string;
}

/**
 * VÅG 92 B1 (P0-3): indata till automationSkapa — svenskt kontrakt mot
 * protokollformens fält (namn→title, schema→cronExpr, lasLage=true ärver
 * transportens läge som mode).
 */
export interface StudioAutomationSkapa {
  /** Automationens namn (protokollens title). */
  namn: string;
  /** Cron-uttryck (protokollens cronExpr) — tomt = engångsuppgift om servern tillåter. */
  schema?: string;
  /** Prompten automationen skall köra. */
  prompt: string;
  /** true = ärva den aktiva sessionens läge (mode: build|plan). */
  lasLage?: boolean;
}

/**
 * VÅG 92 B1: extrafält för session/send — attachments (opaka Record[],
 * ref-objekt ur v4/attachment-commit), automationId ⊕ offPeakTaskId
 * (mut. exkl., kartan §1) + reservPrompt (innehållet vid nedgradering till
 * vanlig skicka — förs ALDRIG på tråden).
 */
export interface StudioSkickaExtra {
  attachments?: Record<string, unknown>[];
  automationId?: string;
  offPeakTaskId?: string;
  offPeakRunType?: string;
  /** Reserv-innehåll när protokollet avvisar extrafälten (vanlig skicka). */
  reservPrompt?: string;
}

/** Resultat av laddaUppBilaga — attachmentId + råa commit-ref (opak). */
export interface StudioBilagaRef {
  attachmentId: string;
  /**
   * Commit-svarets råa objekt (v4-gateway:ns "ref") — bärs som den ÄR i
   * session/send.attachments (opak genomströmning, OEt-formen).
   */
  ref?: unknown;
}

// ── VÅG 93 C1: WORKSPACE-INSTÄLLNINGAR + PLUGINS-DRIFT + EVENTS-REPLAY ───────

/**
 * VÅG 93 C1 (kluster a): workspace-STANDARDVÄRDENA ur workspace/readState —
 * kundens preferenser som skall GÄLLA NÄSTA SAMTAL (server-side sanning;
 * session-create bär redan sessionens egna val, som VINNER över dessa).
 * Samma fältfamilj som C2:s /api/studio/installningar-kontrakt läser
 * (modell/tankestyrka/lage — nycklarna träffas direkt).
 */
export interface StudioWorkspaceInstallningar {
  /** Default-modell "providerId/modelId" (eller bar modelId-sträng). */
  modell?: string;
  /** Default tankestyrka (nothink|high|max — protokollets sanningsord). */
  tankestyrka?: string;
  /** Default läge (build|plan|edit|yolo|auto). */
  lage?: string;
  /** Övrigt defensivt tolkade fält ur readState (dropdownarnas källor). */
  annan?: {
    /** settings.permission.mode. */
    behorighet?: string;
    /** settings.thoughtLevel.available (stränglista om protokollet bär den). */
    tankeNivaer?: string[];
    /** modelCatalog.available/settings.model.available → "provider/model"-lista. */
    modellKatalog?: string[];
    /** workspace.workspacePath. */
    arbetsyta?: string;
  };
}

/**
 * VÅG 93 C1: svar från sparaStandard*-bryggorna — satt=true när protokollet
 * ackade (annars kastas), bekräftad = eko ur svarets snapshot när den bär
 * det (annars det skickade värdet). "Gäller nästa samtal"-ärligheten bärs
 * i meddelandet (workspace-default gäller VID CREATE, ej levande session).
 */
export interface StudioSparadInstallning {
  satt: boolean;
  /** Bekräftat värde ur protokollsvaret (snapshot-settings), annars det skickade. */
  bekräftad?: string;
  meddelande: string;
}

/** VÅG 93 C1 (kluster c): svar från pluginSattAktiverad (plugins/setEnabled). */
export interface StudioPluginAktiveradSvar {
  satt: boolean;
  meddelande: string;
  /** Bekräftad enabled-status ur svarets snapshot när protokollet bär den. */
  bekräftadAktiverad?: boolean;
}

/**
 * VÅG 93 C1 (kluster d): EN post ur session/events-replayen — protokollets
 * vEt-kuvert DEFENSIVT mappat: typen ur type|kind, seq (dedup/cursor-
 * källan), turnId, timestamp + payload/rå OPAKT genomströmmade (kommande
 * C-block renderar verktygskort ur tool.updated-payloaden — okända typer
 * loggas, ALDRIG krasch).
 */
export interface StudioEventPost {
  /** Protokollets eventtyp (t.ex. "turn.started", "tool.updated"). */
  typ: string;
  /** Kuvertets seq — sekvensnumret är replay-cursorns sanning. */
  seq?: number;
  turnId?: string;
  /** timestamp (ISO-sträng som protokollet bär den). */
  tid?: string;
  /** eventId när protokollet bär det. */
  id?: string;
  /** Den råa payloaden (opak). */
  payload?: unknown;
  /** Hela den råa eventposten (opak). */
  rå?: unknown;
}

/** VÅG 93 C1 (kluster d): session/events-svaret — sidvänd paging via nastaSeq. */
export interface StudioEventsSvar {
  handelser: StudioEventPost[];
  /** Nästa seq-cursor: protokollets nextSeq/eventSeq, annars störst seq + 1. */
  nastaSeq?: number;
}

/**
 * VÅG 91 A1d: ärlig "metoden finns ej" — protokollet avvisade med -32601
 * (method not found). API-rutten översätter till 501 {saknas:true} så UI:t
 * kan dölja panelen i stället för att visa ett fel.
 */
export class StudioMetodSaknasError extends Error {
  /** Typad markör — rutten känner igen den utan import-gymnastik. */
  readonly saknas = true as const;
  constructor(metod: string) {
    super(`Protokollmetoden "${metod}" stöds ej av denna agent-version (-32601).`);
    this.name = "StudioMetodSaknasError";
  }
}

/**
 * VÅG 91 A1d: -32601-kännare — protokollfelet bär koden i meddelandetexten
 * (transportens fel-form "… (kod -32601)"), och klientens egna artiga nej
 * bär "stöds ej".
 */
function arMetodSaknas(fel: unknown): boolean {
  const text = fel instanceof Error ? fel.message : String(fel);
  return /-32601|method not found|stöds ej/i.test(text);
}

/**
 * VÅG 92 B1: känner igen protokollfel som betyder "extrafältet på session/
 * send avvisades av formen" (zod strict: -32602 invalid params /
 * "unrecognized key(s)" etc.) — skicka() nedgraderar då EN gång till vanlig
 * skicka med reserv-prompten. TRÄNGT mönster: fångar ALDRIG -32031 (modell),
 * -32010 (kö) eller timeout — de har sina egna vägar.
 */
function arSendFormAvvisad(text: string): boolean {
  return /-32602|unrecognized|unexpected key|invalid_params|ogiltig parameter/i.test(text);
}

// ── VÅG 85 F2: skills/plugins/MCP (kartan §2 — panelens datakällor) ──────────

/**
 * En skill ur skills/referenceCatalog (kartan §2: {id:"glm:…", name,
 * description, path, scope, enabled}). "vad agenten KAN" — panelens
 * SEKTION SKILLS renderar namn + beskrivning per kort.
 */
export interface StudioSkill {
  id: string;
  namn: string;
  beskrivning?: string;
  /** "plugin" | "workspace" | "user" (kartan §2 scope-union). */
  omfattning?: string;
  /** Sökväg till SKILL.md — visas i panelens title-attribut. */
  sokvag?: string;
  /** false = registrerad men avstängd (panelen gråmar). */
  aktiv?: boolean;
}

/**
 * En plugin ur plugins/list (kartan §2: {id, name, description, version,
 * enabled, source, skillCount, components[]}). Aktiva visas med grön
 * prick + version; alla listas (aktiva + tillgängliga).
 */
export interface StudioPlugin {
  id: string;
  namn: string;
  beskrivning?: string;
  version?: string;
  /** true = protokollets enabled (panelens grön prick). */
  aktiv: boolean;
  /** pluginens skillCount (kartan §2). */
  skillAntal?: number;
  /** source/marketplace (t.ex. "zcode-plugins-official"). */
  kalla?: string;
}

/**
 * En MCP-server ur mcp/list:s statuses-post (kartan §2: {status:
 * "connected"|"failed", transport:"stdio"|"http"|"sse", toolCount,
 * updatedAt, error?}). LIVE-bevis: android-emulator, 23 verktyg,
 * connected. VerktygsNAMN bär protokollet ej i denna metod — namnlista
 * tolkas defensivt om ett framtida zcode bär den (tools[]/toolNames[]).
 */
export interface StudioMcpServer {
  namn: string;
  /** "connected" | "failed" (kartan §2). */
  status: string;
  transport?: string;
  /** toolCount — panelens "N verktyg". */
  verktygAntal: number;
  fel?: string;
  uppdaterad?: string;
  /** Defensiv: verktygsnamn OM protokollet bär dem (annars osatt). */
  verktyg?: string[];
}

export interface StudioTransport {
  /** "appserver" (riktig agent) eller "mock" (demo/test). */
  readonly namn: "appserver" | "mock";
  /** Session-id om en session hålls levande — annars null. */
  sessionId(): string | null;
  /** Starta/återuppta + prenumerera — idempotent; kastar vid fel. */
  ensure(): Promise<void>;
  /** Historik för den levande sessionen (tom lista när ej tillgänglig). */
  historik(): Promise<StudioHistorikPost[]>;
  /**
   * Skicka en prompt och strömma händelser tills klart/fel. EN PROMPT I
   * TAGET (zcode vägrar självt med -32010 om en redan kör — speglas här
   * som fel-event så UI:t kan visa det ärligt).
   *
   * VÅG 92 B1: valfria EXTRAFÄLT på session/send (StudioSkickaExtra) —
   * attachments (v4/attachment-refs), automationId ⊕ offPeakTaskId. Form-
   * avvisad send (-32602/unrecognized) nedgraderas EN gång till vanlig
   * skicka med reservPrompten; -32031-självläkningen skickar alltid rent
   * (extrafälten är session-/uppladdningsbundna). Utan extra: oförändrat.
   */
  skicka(
    prompt: string,
    lyssnare: StudioLyssnare,
    signal?: AbortSignal,
    extra?: StudioSkickaExtra,
  ): Promise<void>;
  /**
   * VÅG 91 A1d + VÅG 92 B1: skicka en prompt MED BILDER. PRIMÄR väg (våg
   * 92): laddaUppBilaga per bild → vid lyckat attachmentId skickas
   * session/send {content, attachments:[ref]} — SANA bilagor, inte bara
   * sökvägar. NULL per bild (protokollet avvisar/filen saknas/över tak) ⇒
   * den bilden FALLER på våg-91-kontraktets arbetsytareferens-fallback
   * (byggPromptMedBilder — barnets Read presenterar bilden). Strömningen
   * är OCH förblir skicka()-s (samma event-flöde oavsett väg).
   */
  skickaMedBild(
    prompt: string,
    bildSokvagar: string[],
    lyssnare: StudioLyssnare,
    signal?: AbortSignal,
  ): Promise<void>;
  /**
   * VÅG 92 B1 (P0-1 — käpphästen): ladda upp en fil som ÄKTA bilaga via
   * v4-gateway:ns attachment-flöde (begin → chunk[base64] → commit).
   * Returnerar {attachmentId, ref?} vid lyckat flöde; NULL närhelst något
   * avvisar (metod saknas/-32601, fel form, timeout, fil saknas, > 5 MB,
   * sanitär sökväg underkänd) — ALDRIG kast, anroparen faller då på
   * arbetsytareferens-fallbacken. Protokollform enligt våg 91 A1d-sonden
   * (dokumenterad i filhuvudet); LIVE-bevis avvaktar.
   */
  laddaUppBilaga(sokvag: string): Promise<StudioBilagaRef | null>;
  // ── V82 STUDIO V2 (protokollvägar FIRST-HAND bevisade, se
  // tool-results/v82-protokoll.md) ────────────────────────────────────────
  /**
   * Byt huvudmodell: kasserar sessionen och skapar en ny med
   * session/create-param `model:{providerId:"zai",modelId}` (BEVISAT
   * 2026-09-09: sessionen föds med vald modell). sessionId ändras alltid.
   * (Protokollet har ÄVEN session/setModel på levande session — bevisat —
   * men KVD:s arkitekturval är create-vägen så historik/kontext börjar
   * friskt per modellbyte.)
   */
  bytModell(modellId: string): Promise<StudioBytModellSvar>;
  /** Kassera + skapa frisk session (ev. med vald modell) — publikt för "Ny session"-knappen. */
  nySession(modellId?: string): Promise<string>;
  /** session/list (BEVISAT: {} → alla; {workspace,limit} filtrerar). */
  lasSessioner(): Promise<StudioSessionPost[]>;
  /**
   * session/compact (BEVISAT v82: schema {sessionId, inputId?,
   * instructions?, expectedRevision?}; svar compact.state "accepted"|
   * "already_running"). Kompakteringen kör som en turn — metoden väntar
   * på idle (max ~2 min) och returnerar färsk kontext.
   */
  compact(instruktioner?: string): Promise<StudioCompactSvar>;
  /** session/read-projektionen — kontextsanning för kontextraden. */
  lasKontext(): Promise<StudioKontext | null>;
  // ── V83 SESSIONS- OCH WORKSPACE-HANTERING (Z-portaLens projektnavigation,
  // protokollvägar i tool-results/v83-protokollkarta.md) ─────────────────────
  /**
   * Öppna vald session ur listan: session/resume + subscribe + historik
   * via session/messages (renderas i chatten). Vägrar när en prompt kör.
   */
  oppnaSession(sessionId: string): Promise<StudioOppnaSvar>;
  /**
   * session/close — stänger vald (eller aktuella) session; den finns kvar
   * i session/list (arkiverad historik) men svarar inte längre.
   */
  stangSession(sessionId?: string): Promise<boolean>;
  /**
   * session/fork {target:{kind:"latestCheckpoint"}}. DOKUMENTERAT LIVE-FEL
   * (v83-kartan §1): "No workspace checkpoint is available yet" — fork
   * kräver en checkpoint och de skapas VID FILÄNDRINGAR (turn med Write).
   * Metoden returnerar därför ett ÄRLIGT meddelande i stället för att
   * tvinga fram filändringar; KVD-beslut: ingen auto-Write.
   */
  forka(): Promise<StudioForkSvar>;
  /**
   * VÅG 86 G5 (LIVE-bevisat — se filhuvudet): fork sessionen vid turn
   * turnIndex (0-baserad; kind:"turn" löses internt till turnens SISTA
   * assistant-meddelande — kräver INGEN checkpoint) och ÖPPNA sedan den
   * forkade sessionen (resume + subscribe + historik) så den blir den
   * AKTIVA — "Gå tillbaka hit". Parent-sessionen lever kvar i
   * session/list (Sessioner). Ogiltigt turnIndex ⇒ ärligt fel.
   */
  rewindTillTurn(turnIndex: number): Promise<StudioRewindSvar>;
  /** session/goal action "show" (LIVE-bevisat: "No goal is set…" tomt). */
  lasMal(): Promise<StudioMalSvar>;
  /**
   * session/goal action "set" — sätter målet; svarets startedTurn kan
   * innebära att agenten börjar arbeta mot målet asynkront (events via
   * prenumerationen; utan pågående prompt strömmar de inte i chatten).
   */
  sattMal(mal: string): Promise<StudioMalSvar>;
  /** session/goal action "clear". */
  rensaMal(): Promise<StudioMalSvar>;
  // ── VÅG 85 F1: MÅL-LÄGET — autonom utvecklingsloop ("live utveckling
  // som Z"; kartan §1 + v83 B3:s prod-bevis: mål-set föder turner
  // AUTOMATISKT, session/stop PAUSAR) ────────────────────────────────────────
  /** Mål-lägets snapshot — badge/banner-tilståndets sanning. */
  malStatus(): StudioMalStatus;
  /**
   * Prenumerera på mål-loopens events (mal_status-snapshot direkt, därefter
   * mal_iteration/delta/verktyg_kort/runda/… — varje autonom iteration är
   * en KOMPLETT turn). Returnerar avprenumerering. Event som anländer utan
   * lyssnare buffras och spolas vid nästa prenumerering (MAL_BUFFERT).
   */
  prenumereraMal(lyssnare: StudioLyssnare): () => void;
  /**
   * Pausa mål-loopen: session/stop (LIVE-bevisat v83 B3 — stop avbryter
   * den pågående mål-turnen inom sekunder och pausar målet). mål-
   * lyssnaren får "mal_pausad" + färsk "mal_status".
   */
  pausaMal(): Promise<StudioMalSvar>;
  /**
   * Återuppta pausat mål: session/goal action "resume" (kartan §1 —
   * schemat dokumenterat; stop-vägen för paus är LIVE-bevisad, resume är
   * dess motpol). Ärligt fel om servern avvisar.
   */
  aterupptaMal(): Promise<StudioMalSvar>;
  /**
   * Sond → mål-läge ur session/goal show (självläkning efter process-
   * omstart: persistens-resumen återupptar sessionen men transportens
   * mål-state börjar tomt). Ett LEVANDE mål ("Goal active") aktiverar
   * mål-läget så iterationerna strömmar igen.
   */
  sondMal(): Promise<StudioMalStatus>;
  /**
   * session/subagents — körande (running/waiting/blocked) + avslutade
   * (success/failed/cancelled/lost) barnagenter. Kräver persistent
   * session (LIVE-fel "Session not found" gällde en ephemeral testsession).
   */
  lasSubagenter(): Promise<StudioSubagent[]>;
  /**
   * session/cancelBackgroundTask {sessionId, taskId}. För subagenter
   * saknar protokollet task-id i listan — childSessionId används som
   * taskId (dokumenterat val; servern avvisar ärligt om den inte hittar).
   */
  avbrytBakgrundsTask(taskId: string): Promise<StudioAvbrytSvar>;
  /** workspace/readState — arbetsytans läge/modell/tanke-nivå/behörighet. */
  lasArbetsyta(): Promise<StudioArbetsytaInfo | null>;
  // ── VÅG 85 F2: SKILLS/PLUGINS/TOOLS — "vad agenten KAN" (kartan §2) ───────
  /**
   * skills/referenceCatalog {workspace} → agentens skills (namn +
   * beskrivning per post). Kräver LEVANDE klient men EGEN session —
   * skapar ALDRIG en session bara för att lista (lasSessioner-mönstret).
   */
  lasSkills(): Promise<StudioSkill[]>;
  /**
   * plugins/list {workspace} → aktiva + tillgängliga plugins (aktiva med
   * enabled=true — panelens grön prick + version).
   */
  lasPlugins(): Promise<StudioPlugin[]>;
  /**
   * mcp/list {workspace} → anslutna MCP-servrar med verktygsantal
   * (statuses Record — LIVE-bevis: android-emulator 23 verktyg).
   */
  lasMcp(): Promise<StudioMcpServer[]>;
  // ── VÅG 85 F3: USAGE/COST — "vad agenten KOSTAR (i tokens)" (kartan §2) ────
  /**
   * usage/stats {range:"7d"} (LIVE-bevisat: 8,35 M tokens/7d, kartan §2)
   * → råa svaret + mappade sammanfattningar + modellfördelning (byModel)
   * + 24 h-uppskattning (session/usage över sessioner aktiva senaste
   * dygnet; reserv dygnsmedel 7d/7 — usage/stats har ingen 24 h-range).
   * Kräver LEVANDE klient men EGEN session — skapar ALDRIG en session
   * bara för att läsa statistik (lasSessioner-mönstret). KVD-ÄRLIGHET:
   * tokens räknas, kronor PÅSTÅS ALDRIG (planen är pauspris).
   */
  lasUsage(): Promise<StudioUsageSvar>;
  // ── V83 MEGA B1: STREAMING-VISUALISERING + DIFF (Z-portalens kärna) ──────
  /**
   * Senaste turnens filändringar som ±N-rader per fil. Härleds ur
   * session/messages tool-delar: Write bär hela content (+N), Edit bär
   * old_string/new_string (EXAKT −N/+N), MultiEdit bär edits[]. Den
   * ursprungliga protokollkällan v4/conversation/fileChanges kräver v4-
   * grenens egna subscribe-flöde (dokumenterat i filhuvudet) och är
   * uppgraderingsvägen — panelen renderar samma form. Tom lista = inga
   * filändringar (ALDRIG fel).
   */
  lasFilandringar(): Promise<StudioFilandring[]>;
  // ── V83 MEGA B2: PERMISSION- OCH INTERAKTIONSSKIKT (Z-portaLens) ──────────
  /**
   * Väntande interaktioner (permission/fråga) i ankomstordning — GET
   * /api/studio/stream och /api/studio/interaktion listar dem så ett
   * refreshat UI återfår dialogkortet.
   */
  vantaInteraktioner(): StudioInteraktion[];
  /**
   * Svara en interaction/requestPermission med valt alternativ (allow_once|
   * allow_project|deny ur eventets options). Svaret till protokollet blir
   * alternativets förslagade response om det finns, annars z2-formen:
   * allow_project ⇒ permissionUpdates addRules för verktyget. ok:false =
   * begäran okänd/redan besvarad (t.ex. 30 s-defaulten eller annat flik).
   */
  svarPermission(
    requestId: string,
    alternativId: string,
  ): Promise<{ ok: boolean; beslut: string; skäl?: string }>;
  /**
   * Svara en interaction/requestUserInput: {varde} = knappval/fritext,
   * {avbruten:true} = avbryt. Protokollsvaret: {value} | {cancelled:true}.
   */
  svarFraga(requestId: string, svar: { varde?: string; avbruten?: boolean }): Promise<{ ok: boolean }>;
  /**
   * session/setMode {sessionId, mode:"build"|"plan"} (BEVISAT LIVE, kartan
   * §1) — svaret är en snapshot; läget bekräftas ur settings.mode.current
   * (workspace-default kan överskriva, kartan §1 not). Valet följer med
   * till framtida session/create-param `mode`.
   */
  sattLage(lage: "build" | "plan"): Promise<{ lage: string }>;
  /**
   * session/setThoughtLevel {sessionId, thoughtLevel} (BEVISAT LIVE, kartan
   * §1 — nivåer: nothink|high|max). Tankestyrkan för resonemangsmodellen;
   * valet följer med till session/create + session/resume.
   */
  sattTankeNiva(niva: string): Promise<{ niva: string }>;
  // ── VÅG 91 A1d: TJÄNSTE-BRYGGOR — "varenda tjänst i z code i studion" ─────
  /**
   * Bakgrundsjobb: session/read-projektionens backgroundJobs (primär) med
   * subagenter-fallback — ALDRIG fel för en tom lista; -32601 ⇒
   * StudioMetodSaknasError. VÅG 92 B1 (P0-4): HELA arrayen parsas —
   * id/titel/status/startad + pid/kommando/utdataSvans/avbrytbar.
   */
  lasBakgrundsjobb(): Promise<StudioBakgrundsjobb[]>;
  /**
   * interaction/browserList (binärsond Okn: kräver requestId+sessionId+
   * workspace+clientMode+sessionContext) → anslutna webbläsare. Metoden
   * saknas i agent-versionen ⇒ StudioMetodSaknasError (routen: 501).
   */
  lasWebblasare(): Promise<StudioWebblasare[]>;
  /**
   * interaction/browserExecute {requestId, sessionId, browserId?,
   * browserGeneration?, command, workspace…} — kör ett webbläsarkommando.
   * Svaret är protokollets råa form (opak) — panelen renderar defensivt.
   */
  korWebblasare(kommando: { browserId?: string; browserGeneration?: number; kommando: string }): Promise<unknown>;
  /** automation/list → schemalagda automations (lifecycleStatus-union). */
  lasAutomationer(): Promise<StudioAutomation[]>;
  /**
   * VÅG 92 B1 (P0-3): automation/create {title, cronExpr, prompt, enabled,
   * mode?} (lasLage=true ärver transportens läge) → den skapade automationen
   * (StudioAutomation-form) eller NULL vid okänd svar-form. -32601 ⇒
   * StudioMetodSaknasError (routen: 501).
   */
  automationSkapa(skapa: StudioAutomationSkapa): Promise<StudioAutomation | null>;
  /**
   * VÅG 92 B1 (P0-3): automation/update {automationId, enabled} — pausad
   * ⇒ enabled:false (binär-sondens fält; lifecycleStatus "paused"), false ⇒
   * återaktiverad. Returnerar den uppdaterade posten eller NULL vid okänd
   * form (listan är sanningen då). -32601 ⇒ StudioMetodSaknasError.
   */
  automationUppdatera(id: string, andring: { pausad?: boolean }): Promise<StudioAutomation | null>;
  /**
   * VÅG 92 B1 (P0-3): automation/delete {automationId} → {deleted}. Ärligt
   * svar {raderad, meddelande} — okänd form ger ett vänligt meddelande
   * (ALDRIG krasch). -32601 ⇒ StudioMetodSaknasError (routen: 501).
   */
  automationRadera(id: string): Promise<{ raderad: boolean; meddelande: string }>;
  /**
   * VÅG 92 B1 (P0-5): skicka en prompt KOPPLAD till en automation/off-peak-
   * uppgift — session/send med automationId (då den grenen) eller
   * offPeakTaskId + offPeakRunType:"init" (offPeak=true utan automationId —
   * klienten äger id:t, samma mönster som uploadId/connectionId; mut.
   * exkl. enligt kartan §1). Utan koppling/vid form-avvisning → VANLIG
   * skicka (nedgraderingen lever i skicka). Lyssnare+signal valfria —
   * utan lyssnare landar svaret i sessionens historik (A1c-mönstret).
   */
  skickaAutomation(
    prompt: string,
    automationId?: string,
    offPeak?: boolean,
    lyssnare?: StudioLyssnare,
    signal?: AbortSignal,
  ): Promise<void>;
  /**
   * workspace/generateText {workspace, modelRef, prompt, querySource} —
   * headless textgenerering UTAN turn/session (kartan §2). modelRef hämtas
   * ur den aktiva sessionens kontext.
   */
  genereraText(prompt: string): Promise<{ text: string; råSvar: unknown }>;
  // ── VÅG 93 C1 (kluster a+c+d): workspace-inställningar · plugins-drift ·
  // events-replay (protokollformer ur V91-Z-PARITET-KARTA §1.1/§1.2/§1.3 +
  // V93-P1-UNDERLAG) ────────────────────────────────────────────────────────
  /**
   * VÅG 93 C1: workspace-STANDARDVÄRDENA (default-modell/tankestyrka/läge)
   * ur workspace/readState — FULL defensiv parsning (settings-sidans
   * strukturvägar + bundet djupsök; se workspaceInstallningarUrState).
   * NULL när läsningen ej kan leverera (lyx, aldrig fel — lasArbetsyta
   * består som reserv).
   */
  lasWorkspaceInstallningar(): Promise<StudioWorkspaceInstallningar | null>;
  /**
   * VÅG 93 C1: workspace/setDefaultModel {workspace, model:{providerId,
   * modelId}} — kundens standardmodell för NÄSTA samtal. Tar "glm-5.3",
   * "zai/glm-5.3" ELLER {providerId, modelId} (C2-ruttens råformer).
   * -32601 ⇒ StudioMetodSaknasError (routen: 501).
   */
  sparaStandardModell(modell: string | { providerId: string; modelId: string }): Promise<StudioSparadInstallning>;
  /**
   * VÅG 93 C1: workspace/setDefaultThoughtLevel {workspace, thoughtLevel} —
   * fri kort sträng (≤20 tkn; protokollet är sanningsägaren om nivåerna).
   * -32601 ⇒ StudioMetodSaknasError (routen: 501).
   */
  sparaStandardTankestyrka(niva: string): Promise<StudioSparadInstallning>;
  /**
   * VÅG 93 C1: workspace/setDefaultMode {workspace, mode} — build|plan|
   * edit|yolo|auto (fri kort sträng; protokollet avvisar ogiltiga ärligt).
   * -32601 ⇒ StudioMetodSaknasError (routen: 501).
   */
  sparaStandardLage(lage: string): Promise<StudioSparadInstallning>;
  /**
   * VÅG 93 C1: plugins/setEnabled {workspace, pluginId, enabled, scope} —
   * plugin på/av (Färdigheter-panelens brytare). omfattning "workspace"
   * (default) | "session". Zod-formen är opak i kartan ⇒ EN form-
   * avvisnings-retry UTAN scope när omfattning ej var explicit. -32601 ⇒
   * StudioMetodSaknasError (routen: 501).
   */
  pluginSattAktiverad(namn: string, aktiverad: boolean, omfattning?: string): Promise<StudioPluginAktiveradSvar>;
  /**
   * VÅG 93 C1: session/events {sessionId, afterSeq?, limit?} — REPLAY-sonden
   * (protokollets sekvensnummerade händelsehistorik; komplement till
   * session/messages vid återkoppling). Returnerar {handelser[], nastaSeq?}
   * defensivt parsat, NULL när protokollet ej bär metoden (-32601) eller
   * svaret faller (replay är lyx — historik-vägen består). Exporteras för
   * framtida C-block (C2 events-action, C4 e2e).
   */
  lasEventsFranSeq(sessionId: string, franSeq?: number, tak?: number): Promise<StudioEventsSvar | null>;
}

// ── NDJSON-protokollklient (app-server) ──────────────────────────────────────

/** En rad = ett JSON-objekt (bevisat: zod-strict, jsonrpc-fält förbjudet). */
interface ProtokollMeddelande {
  id?: string | number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code?: number; message?: string; data?: unknown };
}

/** Väntande request med timeout-resolver. */
interface Vantan {
  los: (v: unknown) => void;
  fel: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Tunn NDJSON-klient mot `zcode app-server`. Hanterar:
 *   · request/svar via id-karta (request())
 *   · server→klient-requests: session/requestRuntimePreferences BESVARAS
 *     (obligatoriskt — annars låser sig sessionen), övriga besvaras -32601
 *   · notiser (method utan id) vidarebefordras till händelseLyssnare
 *   · barnprocess-död: alla väntande avvisas, lever=false (transporten
 *     startar om vid nästa ensure())
 */
class ProtokollKlient {
  private barn: ChildProcess | null = null;
  private buffert = "";
  private nästaId = 1;
  private readonly vantar = new Map<string | number, Vantan>();
  /** Notis- och server-request-mottagare (sätts av transporten). */
  händelseLyssnare: ((m: ProtokollMeddelande) => void) | null = null;
  /**
   * V83 B2: hanterare för övriga server→klient-requests (interaktions-
   * domänen) — sätts av transporten. Returnerar protokollets result-objekt
   * ASYNKRONT (användaren ska hinna klicka i UI:t), eller null = -32601.
   * Klienten skriver själv {id, result|error} när promisen löser.
   */
  serverRequestHanterare:
    | ((metod: string, parametrar: unknown) => unknown | Promise<unknown | null> | null)
    | null = null;
  lever = false;
  /**
   * VÅG 90 K1: dödsnotis — eldas EN gång när barnprocessen dör OVILLKORLIGT
   * ('exit'/'error'); avsiktlig nedstängning (stang()) notiseras ALDRIG så
   * transportens omstartskedja inte triggas av egen städning.
   */
  dodsLyssnare: ((fel: Error) => void) | null = null;
  /** true efter avsiktlig stang() — dödsnotis/omstart undertrycks. */
  private stängdAvsiktligen = false;
  /** VÅG 90 K1: radbuffertens tak (1 MB) — ett kaotiskt barn äter ALDRIG RAM. */
  private static readonly MAX_RADBUFFERT_TEEKEN = 1_048_576;

  constructor(
    private readonly binär: string,
    private readonly arbetskatalog: string,
  ) {}

  /** Starta barnprocessen — kastar om spawn misslyckas (t.ex. ENOENT). */
  starta(): void {
    if (this.lever && this.barn) return;
    this.buffert = "";
    const barn = spawn(this.binär, ["app-server"], {
      cwd: this.arbetskatalog,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });
    this.barn = barn;
    this.lever = true;

    barn.on("error", (fel) => this.stäng(new Error(`app-server kunde ej startas (${this.binär}): ${String(fel)}`)));
    barn.on("exit", (kod) => this.stäng(new Error(`app-server avslutades (kod ${kod})`)));
    barn.stdout?.on("data", (data: Buffer) => this.matad(data.toString("utf8")));
    // stderr läses och glöms — protokollet svarar med strukturerade fel;
    // rå stderr ska ALDRIG läckas vidare (kan innehålla sökvägar).
    barn.stderr?.on("data", () => undefined);
  }

  /** Radbuffrad JSON-tolkning — en rad = ett meddelande. */
  private matad(text: string): void {
    this.buffert += text;
    // VÅG 90 K1: kapa radbufferten vid >1 MB — en kaotisk barnprocess som
    // skriver utan radbrytningar får ALDRIG äta RAM i sig (äldsta bytena
    // slängs; en eventuell halv rad i kanten tolereras av tolkningens
    // skräprads-filter som redan äter icke-JSON-rader).
    if (this.buffert.length > ProtokollKlient.MAX_RADBUFFERT_TEEKEN) {
      this.buffert = this.buffert.slice(-ProtokollKlient.MAX_RADBUFFERT_TEEKEN);
    }
    let ny = this.buffert.indexOf("\n");
    while (ny >= 0) {
      const rad = this.buffert.slice(0, ny).trim();
      this.buffert = this.buffert.slice(ny + 1);
      if (rad) {
        try {
          this.tolkat(JSON.parse(rad) as ProtokollMeddelande);
        } catch {
          // Icke-JSON-rad (bannertext etc.) — protokollet tål skräp rader.
        }
      }
      ny = this.buffert.indexOf("\n");
    }
  }

  private tolkat(m: ProtokollMeddelande): void {
    // Svar på vår request?
    if (m.id !== undefined && (m.result !== undefined || m.error !== undefined)) {
      const vantan = this.vantar.get(m.id);
      if (vantan) {
        this.vantar.delete(m.id);
        clearTimeout(vantan.timer);
        if (m.error) {
          const data = m.error.data as { message?: string; code?: string } | undefined;
          // data.code (t.ex. ZCODE_RUNTIME_MODEL_UNAVAILABLE) följer med i
          // meddelandet — transportens självläkning matchar på den strängen.
          const detaljer = [data?.code, data?.message]
            .filter((d): d is string => typeof d === "string" && d.length > 0)
            .join(": ");
          vantan.fel(
            new Error(
              `${m.error.message ?? "protokollfel"}${detaljer ? ` — ${detaljer}` : ""} (kod ${m.error.code ?? "?"})`,
            ),
          );
        } else {
          vantan.los(m.result);
        }
      }
      return;
    }
    // Server→klient-request? (method + id)
    if (m.method !== undefined && m.id !== undefined) {
      // Skriv-skyddad svarare — barnprocessen kan dö medan en interaktion
      // väntar på användaren; ett kast här får ALDRIG krascha strömmen.
      const svara = (rad: Record<string, unknown>) => {
        try {
          this.skickaRad(rad);
        } catch {
          // anslutningen nedkopplad — svaret når aldrig fram
        }
      };
      if (m.method === "session/requestRuntimePreferences") {
        // BEVISAT OBLIGATORISKT (annars låser create/send): schema MEt.
        svara({
          id: m.id,
          result: {
            nativeSearchEnhancementsEnabled: false,
            memoryEnabled: false,
            askUserQuestionAutoResolutionEnabled: true,
          },
        });
      } else if (m.method === "interaction/requestOfficialMcpAuthHeaders") {
        // V83 B2 (kartan §3, LIVE ×6): {} = hoppa över MCP-autentisering.
        svara({ id: m.id, result: {} });
      } else if (this.serverRequestHanterare) {
        // V83 B2: transporten äger svaret (permission/fråga) — asynkront
        // eftersom användaren ska hinna klicka; null = metoden stöds ej.
        const id = m.id;
        Promise.resolve(this.serverRequestHanterare(m.method, m.params)).then(
          (result) => {
            if (result === null || result === undefined) {
              svara({ id, error: { code: -32601, message: "ak1a-studio: metoden stöds ej" } });
            } else {
              svara({ id, result });
            }
          },
          (fel: unknown) => {
            svara({
              id,
              error: { code: -32603, message: `ak1a-studio: interaktionen misslyckades (${String(fel).slice(0, 160)})` },
            });
          },
        );
      } else {
        // Artigt nej (bevisat harmlöst att ignorera — flödet fortsätter).
        svara({ id: m.id, error: { code: -32601, message: "ak1a-studio: metoden stöds ej" } });
      }
      return;
    }
    // Notis — vidare till transporten.
    if (m.method !== undefined) this.händelseLyssnare?.(m);
  }

  private skickaRad(obj: Record<string, unknown>): void {
    if (!this.lever || !this.barn?.stdin?.writable) {
      throw new Error("app-server-anslutningen är nedkopplad");
    }
    this.barn.stdin.write(`${JSON.stringify(obj)}\n`);
  }

  /** Skickar JSON-RPC-fråga till barnprocessens STDIN-PIPE (ALDRIG nätverk/HTTP).
 *  Mimosa-anteckning: detta är lokal IPC via child.stdin.write(), inte fetch. */
  protokollFraga(metod: string, parametrar: Record<string, unknown>, timeoutMs = 30_000): Promise<unknown> {
    const id = this.nästaId++;
    this.skickaRad({ id, method: metod, params: parametrar });
    return new Promise((los, fel) => {
      const timer = setTimeout(() => {
        this.vantar.delete(id);
        fel(new Error(`timeout på ${metod} (${timeoutMs} ms)`));
      }, timeoutMs);
      this.vantar.set(id, { los, fel, timer });
    });
  }

  /** Eldränge-notis (svar väntas ej). */
  notis(metod: string, parametrar: Record<string, unknown>): void {
    this.skickaRad({ method: metod, params: parametrar });
  }

  private stäng(fel: Error): void {
    if (!this.lever) return;
    this.lever = false;
    // VÅG 90 K1: alla väntande timers dödas (clearTimeout) och bufferten
    // släpps — inget läcker från ett dött barn.
    for (const [, v] of this.vantar) {
      clearTimeout(v.timer);
      v.fel(fel);
    }
    this.vantar.clear();
    this.buffert = "";
    this.barn = null;
    // VÅG 90 K1: ovillkorlig död → notis EN gång (transportens omstartskedja
    // med backoff börjar). Avsiktlig nedstängning tiger (stang()).
    if (!this.stängdAvsiktligen) this.dodsLyssnare?.(fel);
  }

  /**
   * VÅG 90 K1 — avsiktlig nedstängning: väntande requests felas, barnet
   * får SIGTERM (SIGKILL efter 3 s om det ignorerar) och DEN DÖDSNOTIS
   * som annars triggade omstarten undertrycks. Används av hushållningen
   * (idle >2 h / max-barn-vakten) och pm2-SIGTERM-nedstängningen.
   */
  stang(): void {
    this.stängdAvsiktligen = true;
    const barn = this.barn;
    this.stäng(new Error("app-server stängdes avsiktligt (ak1a-studio)"));
    if (barn && typeof barn.kill === "function") {
      try {
        barn.kill("SIGTERM");
      } catch {
        // redan borta
      }
      const tvång = setTimeout(() => {
        try {
          barn.kill("SIGKILL");
        } catch {
          // redan borta
        }
      }, 3_000);
      tvång.unref(); // tvångsdöden får ALDRIG hålla processen vid liv
    }
  }

  /** VÅG 90 K1: barnprocessens pid (hälsoruttens /proc-RAM-läsning) — null utan barn. */
  pid(): number | null {
    return this.barn?.pid ?? null;
  }
}

// ── appServerTransport ───────────────────────────────────────────────────────

/** Resultat från session/create|resume — nyckeln är result.session.sessionId. */
interface SessionResult {
  session?: { sessionId?: string; model?: { providerId?: string; modelId?: string } };
}

/** session/read-svar (BEVISAT v82): {session, messages, projection, ...}. */
interface SessionReadResult {
  session?: { sessionId?: string; model?: { providerId?: string; modelId?: string } };
  projection?: {
    contextUsed?: number;
    contextWindow?: number;
    totalTokenCount?: number;
    turnCount?: number;
    status?: string;
    /** V83 B2: sessionens läge ("build"|"plan"|…). */
    mode?: string;
  };
  /** V83 B2: snapshoten bär settings (pce §5 i kartan). */
  settings?: {
    mode?: { current?: string };
    thoughtLevel?: { current?: string };
  };
}

/** session/list-svar (BEVISAT v82: {sessions:[{sessionId,status,title,workspace}]}). */
interface SessionListResult {
  sessions?: {
    sessionId?: string;
    status?: string;
    title?: string;
    updatedAt?: string;
    updated?: string;
    lastActiveAt?: string;
    /** v83 (qBe.model): {providerId?,modelId?}. */
    model?: { providerId?: string; modelId?: string } | null;
    workspace?: { workspacePath?: string };
  }[];
}

/** session/subagents-svar (v83-kartan §1: running[] + ended.items[]). */
interface SubagentsResult {
  running?: {
    childSessionId?: string;
    subagentType?: string;
    title?: string;
    summary?: string;
    startedAt?: string;
    endedAt?: string;
    status?: string;
  }[];
  ended?: {
    items?: {
      childSessionId?: string;
      subagentType?: string;
      title?: string;
      summary?: string;
      startedAt?: string;
      endedAt?: string;
      status?: string;
    }[];
  };
}

/** workspace/readState-svar (v83-kartan §2 — endast fält UI:t visar). */
interface WorkspaceStateResult {
  workspace?: { workspacePath?: string };
  settings?: {
    mode?: { current?: string };
    model?: { current?: { providerId?: string; modelId?: string } | string; available?: unknown[] };
    permission?: { mode?: string };
    thoughtLevel?: { current?: string };
  };
  slashCommands?: unknown[];
}

// ── VÅG 85 F2: skills/plugins/MCP-svar (kartan §2 — defensivt mappade) ───────

/** skills/referenceCatalog-svar (LIVE-testat i v83-protokoll-live-test.mjs). */
interface SkillsCatalogResult {
  authority?: string;
  skills?: {
    id?: string;
    name?: string;
    description?: string;
    path?: string;
    scope?: string;
    enabled?: boolean;
  }[];
}

/** plugins/list-svar (LIVE-testat — aktiva + tillgängliga + diagnostics). */
interface PluginsListResult {
  plugins?: {
    id?: string;
    name?: string;
    description?: string;
    version?: string;
    enabled?: boolean;
    /** VÅG 93 C1: defensiv reserv — vissa former bär disabled i stället. */
    disabled?: boolean;
    source?: string;
    marketplace?: string;
    skillCount?: number;
  }[];
  diagnostics?: unknown[];
}

/**
 * mcp/list-svar (LIVE-bevis: statuses Record med android-emulator
 * connected + toolCount 23). Verktygsnamn tolkas defensivt — kartan §2
 * dokumenterar endast toolCount, men ett tools[]/toolNames[]-fält bärs
 * fram utan att kräva ny protokollversion.
 */
interface McpListResult {
  statuses?: Record<
    string,
    {
      status?: string;
      transport?: string;
      toolCount?: number;
      updatedAt?: string;
      error?: string;
      failureKind?: string;
      tools?: unknown;
      toolNames?: unknown;
    }
  >;
}

// ── VÅG 85 F3: usage/stats-svar (kartan §2 — LIVE 8,35 M tokens/7d) ──────────

/**
 * usage/stats-svar — TVÅ bevisade former:
 *   LIVE (prod-sond 2026-09-10, aktuellt zcode): {range, generatedAt,
 *   timeZone, source:"agent-db", summary:{…}, models:[{modelId,totalTokens,
 *   inputTokens,outputTokens,requestCount,share}], dailyModelUsage:[{date,
 *   models:[{modelId,totalTokens}]}], heatmap, tools} — models bär RIKTIGA
 *   requestCount (antal modellanrop) och dailyModelUsage tokens PER DAG.
 *   Kartan §2 (2026-09-09): byModel?:[{modelId,totalTokens,share}] —
 *   byModel behålls som defensiv fallback för äldre protokollversion.
 * Endast fält UI:t visar mappas — råa svaret följer med i `råSvar`-fältet.
 */
interface UsageStatsResult {
  range?: string;
  generatedAt?: string;
  timeZone?: string;
  summary?: {
    totalTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
    reasoningTokens?: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
    cacheHitRate?: number;
    totalSessions?: number;
    totalTurns?: number;
    toolCallCount?: number;
    toolErrorRate?: number;
    modelErrorRate?: number;
  };
  /** LIVE-form: modellrader MED requestCount (den ärliga antal-källan). */
  models?: {
    modelId?: string;
    totalTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
    requestCount?: number;
    share?: number;
  }[];
  /** LIVE-form: tokens per dag och modell (date-stigande, sista = idag). */
  dailyModelUsage?: {
    date?: string;
    models?: { modelId?: string; totalTokens?: number }[];
  }[];
  /** Kartans äldre fallback-form (§2). */
  byModel?: {
    modelId?: string;
    totalTokens?: number;
    share?: number;
    /** Defensivt: räknefält OM ett framtida zcode bär det per modell. */
    requestCount?: number;
    modelRequestCount?: number;
  }[];
}

/** Rad i modellfördelningen (LIVE models[] / kartans byModel + berikning). */
export interface StudioUsageModell {
  /** Protokollets modelId (t.ex. "glm-5.3"). */
  modell: string;
  /** Modellens totalTokens i perioden. */
  tokens: number;
  /** Protokollets share (0–1) — beräknas om tokens/total när det saknas. */
  andel: number;
  /**
   * Ärlig räknare: LIVE-formen bär requestCount = ANTAL MODELLANROP
   * (prod-sond 2026-09-10: glm-5.2=235 · glm-5.3=61 · glm-5.3-flash=44);
   * kartans äldre byModel-form bär inget räknefält — då 0, ALDRIG påhittat.
   */
  antal: number;
}

/**
 * VÅG 85 F3 — användning/svar ur usage/stats (range "7d"):
 * råa protokollsvaret + mappade fält + den berikade 24 h-siffran.
 * KOSTNADS-ÄRLIGHET (KVD): planen är pauspris (~$3/mo) — svaret bär
 * ENDAST token-räkningar, ALDRIG påstådda kronor.
 */
export interface StudioUsageSvar {
  /** Det RÅA usage/stats-svaret (range "7d") — oförändrat vidare. */
  råSvar: unknown;
  /** summary.totalTokens (7 d) — panelens stora siffra. */
  totalTokens: number;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
  cacheHitRate?: number;
  totalSessions?: number;
  totalTurns?: number;
  toolCallCount?: number;
  /** Modellfördelning — störst först (stapelordning). */
  modeller: StudioUsageModell[];
  generatedAt?: string;
  timeZone?: string;
  /**
   * 24 h-siffra, ärligaste källa först (LIVE dailyModelUsage bär tokens
   * PER DAG — sista dagsraden = "idag"; usage/stats har ingen rullande
   * 24 h-period): "dagsrad" = protokollets senaste dagsrad · "sessioner"
   * = summan av session/usage över sessioner aktiva senaste 24 h ·
   * "snitt" = dygnsmedelvärdet 7d/7 (reserv) · "okand" = inga data.
   */
  totalTokens24h: number;
  kalla24h: "dagsrad" | "sessioner" | "snitt" | "okand";
}

interface SessionEventParams {
  sessionId?: string;
  /**
   * Händelsetypen ligger på PARAMS-nivå i zcode ≥ 3.11.2-22 (bevisat live
   * 2026-09-09 STUDIO-2 på Contabo, /tmp/transport-create2.txt): t.ex.
   * "turn.started" | "model.streaming" | "model.response.completed" |
   * "turn.completed" | "session.updated" | "session.titleUpdated" |
   * "model_request_started" | "model_request_completed". Den äldre
   * dokumentationen (tool-results/v81-appserver.md) placerade den i
   * payload — båda formerna stöds defensivt.
   */
  type?: string;
  payload?: {
    type?: string;
    kind?: string;
    delta?: string;
    done?: boolean;
    response?: string;
    content?: string;
    resultType?: string;
    tokenCount?: number;
    duration?: number;
    name?: string;
    toolName?: string;
    // ── V83 B1 (kartan §4A tool.updated + model.streaming + turn.*) ──────
    /** tool.updated base + model.streaming tool_call/tool_input_*. */
    toolCallId?: string;
    /** tool.updated kind scheduled: description ur basfältet. */
    description?: string;
    /** kind scheduled/model.streaming tool_call: verktygsargumenten. */
    input?: unknown;
    /** kind result: resultatet (sträng eller objekt). */
    result?: unknown;
    /** kind error: felobjektet _Et {message?, …}. */
    error?: unknown;
    /** kind progress: elapsedMs/pid/stdoutBytes/stderrBytes/tails. */
    elapsedMs?: number;
    stdoutTail?: string;
    stderrTail?: string;
    /** turn.completed: antal verktygskall i rundan. */
    toolCallCount?: number;
    /** part.delta: field "input" = verktygsargument strömmas. */
    field?: string;
    partId?: string;
  };
}

interface StateUpdatedParams {
  /** v83 B1: activeToolCalls/backgroundJobs i patch → status-räknare. */
  patch?: {
    status?: string;
    activeToolCalls?: unknown[];
    backgroundJobs?: unknown[];
    contextUsed?: number;
    totalTokenCount?: number;
  };
}

/** Läs null-säkert sessionsid ur create/resume-svar. */
function sessionUr(result: unknown): string | null {
  const r = result as SessionResult | null;
  const sid = r?.session?.sessionId;
  return typeof sid === "string" && sid ? sid : null;
}

/** V83 B2: läge ur en snapshot (setMode/setThoughtLevel/read-svar). */
function lasLageUrSnapshot(r: unknown): string | null {
  const s = r as { settings?: { mode?: { current?: unknown } }; session?: { mode?: unknown } } | null;
  const urSettings = s?.settings?.mode?.current;
  if (typeof urSettings === "string" && urSettings) return urSettings;
  const urSession = s?.session?.mode;
  return typeof urSession === "string" && urSession ? urSession : null;
}

/** V83 B2: tanke-nivå ur en snapshot (settings.thoughtLevel.current). */
function lasTankeNivaUrSnapshot(r: unknown): string | null {
  const niva = (r as { settings?: { thoughtLevel?: { current?: unknown } } } | null)?.settings
    ?.thoughtLevel?.current;
  return typeof niva === "string" && niva ? niva : null;
}

/**
 * V83 B2: väntande interaktion i registret. "losare" kan vara flera (ett
 * request-id kan re-annonseras, kartan §3) — alla löses med SAMMA svar.
 */
interface VantanInteraktion {
  interaktion: StudioInteraktion;
  /** Protokollets förslagade z2-svar per optionId (options[].response). */
  fardigaSvar: Map<string, unknown>;
  /** Verktygsnamn för permissionUpdates (allow_project → addRules). */
  verktygNamn: string;
  losare: ((result: unknown) => void)[];
  timer: ReturnType<typeof setTimeout>;
  besvarad: boolean;
}

/** Permission-argument (input-fältet) → läsbar summary, truncat. */
function sammanfattaInput(input: unknown): string {
  if (input === undefined || input === null) return "(inga argument)";
  if (typeof input === "string") return input ? truncat(input, 600) : "(tomt)";
  try {
    return truncat(JSON.stringify(input) ?? "(okänt)", 600);
  } catch {
    return truncat(String(input), 600);
  }
}

/**
 * Resolve en binärkandidat till en existerande sökväg: absolut sökväg
 * kontrolleras rakt av, naket namn söks i PATH (separatorkompabil med
 * ":"/";"). Returnerar null när kandidaten ej finns — startaKlient hoppar
 * då till nästa (ENOENT är annars asynkront och osynligt för try/catch).
 * SÄKERHET: kandidaterna kommer ENBART från STUDIO_ZCODE_BIN-env eller
 * hårdkodade reservsökvägar — ALDRIG från användarinmatning. Den färdiga
 * sökvägen valideras: får endast vara en exekverbar fil (ej katalog).
 */
function hittaBinär(binär: string): string | null {
  // Binärnamn från env/defaults — ALDRIG chattinmatning. ".." avvisas.
  if (binär.includes("..")) return null;
  if (binär.includes("/") || binär.includes("\\")) {
    if (!existsSync(binär)) return null;
    try {
      if (statIsKatalog(binär)) return null;
    } catch { return null; }
    return binär;
  }
  const sep = process.platform === "win32" ? ";" : ":";
  for (const rot of (process.env.PATH ?? "").split(sep)) {
    if (!rot || rot.includes("..")) continue;
    for (const änd of process.platform === "win32" ? ["", ".cmd", ".exe"] : [""]) {
      // Strängkonkatening (ej path.join) — säker sökväg byggd ur PATH-rot + validerat namn
      const kandidat = rot.endsWith("/") || rot.endsWith("\\") ? rot + binär + änd : rot + path.sep + binär + änd;
      try {
        if (existsSync(kandidat) && !statIsKatalog(kandidat)) return kandidat;
      } catch {
        // vidare
      }
    }
  }
  return null;
}

function statIsKatalog(sokvag: string): boolean {
  try {
    return statSync(sokvag).isDirectory();
  } catch {
    return false;
  }
}

/**
 * -32031 ZCODE_RUNTIME_MODEL_UNAVAILABLE (bevisat live 2026-09-09 STUDIO-2:
 * "历史任务使用的模型已不可用" när en session pin:ar glm-5.3-flash som tagits
 * bort ur .zcode) — sessionen kan ALDRIG svara igen och måste kasseras.
 */
function arModellOtillganglig(meddelande: string): boolean {
  return meddelande.includes("ZCODE_RUNTIME_MODEL_UNAVAILABLE") || meddelande.includes("(kod -32031");
}

// ── VÅG 91 A1d: BILDER I PROMPTEN (kontraktets fallback-väg) ─────────────────

/** Max bilder per prompt (UI:t kan tjuta mer — transporten håller taket). */
const MAX_BILDER_PER_PROMPT = 8;
/** Max tecken per bildsökväg (uploads/<datum>/<namn>-form är kort). */
const MAX_BILDSOKVAG_TEEKEN = 500;

/**
 * VÅG 91 A1d — sanera + utöka prompten med bildreferenser (REN funktion,
 * deterministiskt testbar). Bilderna förväntas ligga I ARBETSYTAN (uppladdade
 * till uploads/… — /api/studio/uppladdning skriver dit); barnets Read
 * presenterar bilder visuellt, därför räcker sökvägsreferenser i prompten.
 * SÄKERHET: "..", absoluta sökvägar och backslash-trick avvisas (sökvägen
 * går till barnets Read i SAMMA arbetsyta — ingen traversal), dubbletter
 * slås samman, listan kapas vid MAX_BILDER_PER_PROMPT. Avvisade sökvägar
 * returneras ärligt så routen kan berätta det.
 */
export function byggPromptMedBilder(
  prompt: string,
  bildSokvagar: string[],
): { prompt: string; bilder: string[]; avvisade: string[] } {
  const bilder: string[] = [];
  const avvisade: string[] = [];
  for (const rå of Array.isArray(bildSokvagar) ? bildSokvagar : []) {
    if (typeof rå !== "string") continue;
    const sokvag = rå.trim().replace(/\\/g, "/");
    if (!sokvag || sokvag.length > MAX_BILDSOKVAG_TEEKEN) {
      if (sokvag) avvisade.push(sokvag.slice(0, 80));
      continue;
    }
    // Relativ arbetsyt-sökväg ENDAST: ingen "..", ingen enhetsbokstav/rot.
    if (
      sokvag.includes("..") ||
      /^[a-zA-Z]:/.test(sokvag) ||
      sokvag.startsWith("/") ||
      /^\\\\/.test(rå.trim())
    ) {
      avvisade.push(sokvag.slice(0, 80));
      continue;
    }
    if (!bilder.includes(sokvag)) bilder.push(sokvag);
    if (bilder.length >= MAX_BILDER_PER_PROMPT) break;
  }
  if (bilder.length === 0) return { prompt, bilder: [], avvisade };
  const rader = bilder.map((sokvag, i) => `${i + 1}. ${sokvag}`).join("\n");
  const utokad =
    `${prompt}\n\n[Bifogade bilder — ${bilder.length} st]\n${rader}\n` +
    "Läs och presentera dessa bilder med Read-verktyget (Read visar bilder visuellt) innan du besvarar frågan.";
  return { prompt: utokad, bilder, avvisade };
}

// ── VÅG 92 B1: V4-ATTACHMENTS (P0-1 — käpphästen) ────────────────────────────

/** Max storlek per bilaga (5 MB — B1-kontraktets tak). */
const MAX_BILAGA_BYTE = 5 * 1024 * 1024;
/** Chunk-storlek (512 kB rå bytedata → base64 på tråden — "lagom bitar"). */
const BILAGE_CHUNK_BYTE = 512 * 1024;

/** Mime per filändelse (bilaga-flödet bär mime i begin — uppbackning: octet-stream). */
const BILAGE_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  json: "application/json",
};

/**
 * VÅG 92 B1 — sanera en bilage-/bildsökväg (REN funktion, samma regler som
 * byggPromptMedBilder): relativ arbetsyt-sökväg ENDAST — "..", absoluta
 * sökvägar, enhetsbokstav och backslash-trick avvisas. Null = avvisad.
 */
export function saniteraBilageSokvag(sokvag: string): string | null {
  if (typeof sokvag !== "string") return null;
  const rent = sokvag.trim().replace(/\\/g, "/");
  if (!rent || rent.length > MAX_BILDSOKVAG_TEEKEN) return null;
  if (rent.includes("..")) return null;
  if (/^[a-zA-Z]:/.test(rent)) return null;
  if (rent.startsWith("/")) return null;
  const delar = rent.split("/").filter((d) => d.length > 0);
  if (delar.length === 0) return null;
  if (delar.some((d) => d === "." || d.startsWith("\0"))) return null;
  return delar.join("/");
}

/**
 * VÅG 92 B1 — bilagens fulla sökväg i arbetsytan. MIMOSA-RECEPT (våg 91,
 * bevisat i styrelse.ts): ALDRIG path.join/path.resolve med variabel —
 * REN "/"-STRÄNGKONKAT + DUBBEL ROT-PREFIXKONTROLL. `rent` är förhands-
 * sanerad av saniteraBilageSokvag (inga "..", inga absoluta sökvägar, inga
 * backslash, inga nolltecken) — en ren konkat kan därför aldrig lämna
 * roten, och kontrollen försäkrar det en gång till. Returnerar sökvägen
 * eller null. stdout-PIPE till lokal fil — aldrig nätverk.
 */
export function bilageSokvagIArbetsyta(rot: string, rent: string): string | null {
  if (!rot || !rent) return null;
  const rotRen = rot.replace(/\\/g, "/").replace(/\/+$/, "");
  if (!rotRen || rotRen.includes("..")) return null;
  const hel = rotRen + "/" + rent;
  if (hel.slice(rotRen.length + 1).includes("..")) return null; // traverseringsförsäkran
  return hel;
}

/**
 * VÅG 92 B1 — dra ett attachmentId ur commit-svarets (opaka) ref-form,
 * defensivt: rak sträng · {attachmentId|id|ref|uploadId} · nästlad
 * {attachment:{…}}|{ref:{…}}. Null = okänd form (→ null-fallback).
 */
export function bilageIdUrSvar(svar: unknown, djup = 0): string | null {
  if (typeof svar === "string" && svar) return svar;
  if (!svar || typeof svar !== "object") return null;
  const o = svar as Record<string, unknown>;
  for (const nyckel of ["attachmentId", "id", "ref", "uploadId"]) {
    const v = o[nyckel];
    if (typeof v === "string" && v) return v;
  }
  if (djup < 2) {
    for (const nyckel of ["attachment", "ref", "result", "data"]) {
      const v = o[nyckel];
      if (v && typeof v === "object") {
        const id = bilageIdUrSvar(v, djup + 1);
        if (id) return id;
      }
    }
  }
  return null;
}

/** VÅG 92 B1 — mime ur filändelsen (okänd → application/octet-stream). */
function bilageMime(namn: string): string {
  const delar = namn.split(".");
  if (delar.length < 2) return "application/octet-stream";
  return BILAGE_MIME[delar[delar.length - 1].toLowerCase()] ?? "application/octet-stream";
}

/**
 * VÅG 92 B1 (P0-3) — mappa en automation-post ($je-form) till StudioAutomation,
 * DEFENSIVT med FULL fältparsning: automationId|id · title|name · cronExpr|
 * schedule · lifecycleStatus|status · nextRunAt · nextNextRunAt (om finns) ·
 * runCount · lastRunAt · enabled · prompt. Null = okänd form (ingen id).
 */
export function automationUrPost(post: unknown): StudioAutomation | null {
  if (!post || typeof post !== "object") return null;
  const a = post as Record<string, unknown>;
  const id = (typeof a.automationId === "string" && a.automationId) || (typeof a.id === "string" && a.id) || "";
  if (!id) return null;
  const titel =
    (typeof a.title === "string" && a.title) || (typeof a.name === "string" && a.name) || id;
  return {
    id,
    titel,
    cron:
      (typeof a.cronExpr === "string" && a.cronExpr) ||
      (typeof a.schedule === "string" && a.schedule) ||
      undefined,
    status:
      (typeof a.lifecycleStatus === "string" && a.lifecycleStatus) ||
      (typeof a.status === "string" && a.status) ||
      undefined,
    nastaKorning: typeof a.nextRunAt === "string" && a.nextRunAt ? a.nextRunAt : undefined,
    nastaNastaKorning:
      typeof a.nextNextRunAt === "string" && a.nextNextRunAt ? a.nextNextRunAt : undefined,
    korningar: typeof a.runCount === "number" && Number.isFinite(a.runCount) ? a.runCount : undefined,
    senasteKorning: typeof a.lastRunAt === "string" && a.lastRunAt ? a.lastRunAt : undefined,
    aktiverad: typeof a.enabled === "boolean" ? a.enabled : undefined,
    prompt: typeof a.prompt === "string" && a.prompt ? truncat(a.prompt, 200) : undefined,
  };
}

// ── VÅG 93 C1: RENNA PARSARE för readState/events/setEnabled (testbara) ─────

/** Events-sondens default-tak (sidstorlek på tråden — limit int>0 i schemat). */
const MAX_EVENTS_TAK = 200;
/** Events-sondens hårda tak (kappas ALDRIG över — paging är anroparens sak). */
const MAX_EVENTS_PER_FRAGA = 500;
/** Tankestyrka/läge-fältens teckentak (protokollsnivåerna är korta ord). */
const MAX_INSTALLNING_TEEKEN = 20;

/**
 * Modellreferens → "providerId/modelId"-sträng (ELLER bar sträng/modelId) —
 * tolkar sträng · {providerId,modelId} · {modelId} · {id}. Null = otolkbar.
 */
function modellRefText(v: unknown): string | null {
  if (typeof v === "string") {
    const s = v.trim();
    return s || null;
  }
  if (v && typeof v === "object") {
    const o = v as { providerId?: unknown; modelId?: unknown; id?: unknown };
    const p = typeof o.providerId === "string" ? o.providerId.trim() : "";
    const m = typeof o.modelId === "string" ? o.modelId.trim() : "";
    if (p && m) return `${p}/${m}`;
    if (m) return m;
    if (typeof o.id === "string" && o.id.trim()) return o.id.trim();
  }
  return null;
}

/**
 * BUNDET djupsök (max djup 4) efter första icke-tomma STRÄNGVÄRDET under
 * nyckelfamiljen — readState-svarsbudgeten varierar mellan binärversioner,
 * strukturvägarna är primära och detta är reserven ("sök efter defaultModel/
 * model, thoughtLevel, mode i kapslade objekt" — C1-mandatet).
 */
function lasStrangDjup(rot: unknown, nycklar: string[], djup = 0): string | undefined {
  if (djup > 4 || !rot || typeof rot !== "object") return undefined;
  const o = rot as Record<string, unknown>;
  for (const n of nycklar) {
    const v = o[n];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  for (const v of Object.values(o)) {
    if (v && typeof v === "object") {
      const hittad = lasStrangDjup(v, nycklar, djup + 1);
      if (hittad !== undefined) return hittad;
    }
  }
  return undefined;
}

/**
 * Modellref-medveten djupsök (max djup 4): första värdet under nyckel-
 * familjen som modellRefText KAN tolka (sträng ELLER {providerId,modelId}
 * · {modelId} · {id}) — djupreserven när strukturvägarna tiger.
 */
function lasModellDjup(rot: unknown, nycklar: string[], djup = 0): string | null {
  if (djup > 4 || !rot || typeof rot !== "object") return null;
  const o = rot as Record<string, unknown>;
  for (const n of nycklar) {
    const text = modellRefText(o[n]);
    if (text !== null) return text;
  }
  for (const v of Object.values(o)) {
    if (v && typeof v === "object") {
      const hittad = lasModellDjup(v, nycklar, djup + 1);
      if (hittad !== null) return hittad;
    }
  }
  return null;
}

/** Stränglista defensivt (t.ex. thoughtLevel.available) — skräp filtreras. */
function lasStrangLista(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const ut = v.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map((s) => s.trim());
  return ut.length > 0 ? ut : undefined;
}

/**
 * VÅG 93 C1 — workspace-inställningar ur ett workspace/readState-svar (REN
 * funktion, deterministiskt testbar). Strukturvägar först (kartans §1.2 #1
 * LIVE-form: settings{mode{current},model{current,lastUsed},thoughtLevel
 * {current,defaultLevel,available}}, modelCatalog{defaultModel?,lastUsed?}):
 *   modell:       settings.model.current → modelCatalog.defaultModel →
 *                 settings.model.lastUsed → modelCatalog.lastUsed → djupsök
 *   tankestyrka:  settings.thoughtLevel.current → .defaultLevel →
 *                 settings.thoughtLevel (sträng) → djupsök
 *   lage:         settings.mode.current → settings.mode (sträng) → djupsök
 * Övrigt (annan): behorighet (settings.permission.mode), tankeNivaer
 * (thoughtLevel.available), modellKatalog (modelCatalog.available /
 * settings.model.available → "provider/model"-strängar), arbetsyta.
 * Tomma fält lämnas OSATTA — ALDRIG påhittade värden.
 */
export function workspaceInstallningarUrState(svar: unknown): StudioWorkspaceInstallningar {
  if (!svar || typeof svar !== "object") return {};
  const r = svar as Record<string, unknown>;
  const somObj = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === "object" ? (v as Record<string, unknown>) : null;
  const settings = somObj(r.settings);
  const katalog = somObj(r.modelCatalog);
  const modelSettings = somObj(settings?.model);
  const tankeSettings = somObj(settings?.thoughtLevel);
  const modeSettings = somObj(settings?.mode);

  const modell =
    modellRefText(modelSettings?.current) ??
    modellRefText(katalog?.defaultModel) ??
    modellRefText(modelSettings?.lastUsed) ??
    modellRefText(katalog?.lastUsed) ??
    lasModellDjup(r, ["defaultModel", "modelRef", "model"]) ??
    undefined;
  const tankestyrka =
    (typeof tankeSettings?.current === "string" && tankeSettings.current.trim() ? tankeSettings.current.trim() : undefined) ??
    (typeof tankeSettings?.defaultLevel === "string" && tankeSettings.defaultLevel.trim() ? tankeSettings.defaultLevel.trim() : undefined) ??
    (typeof settings?.thoughtLevel === "string" && settings.thoughtLevel.trim() ? settings.thoughtLevel.trim() : undefined) ??
    lasStrangDjup(r, ["thoughtLevel", "defaultThoughtLevel", "tankeNiva"]);
  const lage =
    (typeof modeSettings?.current === "string" && modeSettings.current.trim() ? modeSettings.current.trim() : undefined) ??
    (typeof settings?.mode === "string" && settings.mode.trim() ? settings.mode.trim() : undefined) ??
    lasStrangDjup(r, ["mode", "defaultMode"]);

  // Kataloger (dropdownarnas källor) — modelCatalog.available före settings.
  const katalogRader = Array.isArray(katalog?.available) ? katalog!.available : modelSettings?.available;
  const modellKatalogLista = Array.isArray(katalogRader)
    ? katalogRader
        .map((m) => modellRefText(m))
        .filter((s): s is string => s !== null)
    : undefined;
  const annan: StudioWorkspaceInstallningar["annan"] = {
    ...(typeof somObj(settings?.permission)?.mode === "string" &&
    (somObj(settings?.permission)!.mode as string).trim()
      ? { behorighet: (somObj(settings?.permission)!.mode as string).trim() }
      : {}),
    ...(lasStrangLista(tankeSettings?.available) !== undefined
      ? { tankeNivaer: lasStrangLista(tankeSettings?.available)! }
      : {}),
    ...(modellKatalogLista !== undefined && modellKatalogLista.length > 0
      ? { modellKatalog: modellKatalogLista }
      : {}),
    ...(typeof somObj(r.workspace)?.workspacePath === "string" &&
    (somObj(r.workspace)!.workspacePath as string).trim()
      ? { arbetsyta: (somObj(r.workspace)!.workspacePath as string).trim() }
      : {}),
  };

  return {
    ...(modell !== undefined ? { modell } : {}),
    ...(tankestyrka !== undefined ? { tankestyrka } : {}),
    ...(lage !== undefined ? { lage } : {}),
    ...(Object.keys(annan).length > 0 ? { annan } : {}),
  };
}

/** En vEt-kuvertpost → StudioEventPost — null för en otolkbar post. */
function eventUrPost(post: unknown): StudioEventPost | null {
  if (!post || typeof post !== "object") return null;
  const p = post as Record<string, unknown>;
  const typ =
    (typeof p.type === "string" && p.type.trim() ? p.type.trim() : undefined) ??
    (typeof p.kind === "string" && p.kind.trim() ? p.kind.trim() : undefined);
  if (!typ) return null; // inget att diskriminera på — defensivt bort
  return {
    typ,
    ...(typeof p.seq === "number" && Number.isFinite(p.seq) ? { seq: p.seq } : {}),
    ...(typeof p.turnId === "string" && p.turnId ? { turnId: p.turnId } : {}),
    ...(typeof p.timestamp === "string" && p.timestamp ? { tid: p.timestamp } : {}),
    ...(typeof p.eventId === "string" && p.eventId ? { id: p.eventId } : {}),
    ...(p.payload !== undefined ? { payload: p.payload } : {}),
    rå: post,
  };
}

/**
 * VÅG 93 C1 — session/events-svar (REN funktion): {events:vEt[]} är den
 * dokumenterade formen; defensivt tolkas ÄVEN rak array och items[].
 * nastaSeq = protokollets nextSeq/eventSeq om det bärs, annars störst
 * seq + 1 (paging-cursorn) — osatt när inga seq finns (ALDRIG påhittad).
 */
export function eventsUrSvar(svar: unknown): StudioEventsSvar {
  let råa: unknown = svar;
  if (råa !== null && typeof råa === "object" && !Array.isArray(råa)) {
    const o = råa as Record<string, unknown>;
    råa = o.events ?? o.items;
  }
  if (!Array.isArray(råa)) return { handelser: [] };
  const handelser: StudioEventPost[] = [];
  let maxSeq: number | null = null;
  for (const post of råa) {
    const e = eventUrPost(post);
    if (!e) continue;
    handelser.push(e);
    if (typeof e.seq === "number" && (maxSeq === null || e.seq > maxSeq)) maxSeq = e.seq;
  }
  const r = svar && typeof svar === "object" ? (svar as Record<string, unknown>) : null;
  const kandidat =
    typeof r?.nextSeq === "number" && Number.isFinite(r.nextSeq)
      ? r.nextSeq
      : typeof r?.eventSeq === "number" && Number.isFinite(r.eventSeq)
        ? r.eventSeq
        : undefined;
  const nastaSeq = kandidat ?? (maxSeq !== null ? maxSeq + 1 : undefined);
  return { handelser, ...(nastaSeq !== undefined ? { nastaSeq } : {}) };
}

/**
 * VÅG 93 C4: AGGREGERAT verktygskort ur replay-events — samma fält som
 * chattens VerktygKort (UI:t renderar med VerktygsKortVy) men merge:at
 * PER toolCallId till slutstatus: live-deltana (verktyg_input/progress)
 * är redan spelade, replay visar SLUTBILDEN per verktygskall. REN +
 * testbar — inget beroende på aktiv lyssnare eller barnprocess.
 */
export interface StudioReplayKort {
  id: string;
  namn: string;
  steg: StudioVerktygSteg;
  argument?: string;
  beskrivning?: string;
  resultat?: string;
  fel?: string;
  varaktighetMs?: number;
}

/**
 * VÅG 93 C4: replay-events → sammanfattning. tool.updated mappas med
 * SAMMA fältparsning som sändVerktygKort (scheduled→argument/beskrivning,
 * result→resultat/duration, error→fel); model.streaming kind tool_call
 * bidrar argument när protokollet bär dem; turn.started räknar rundor.
 * Okända eventtyper ignoreras tyst (ALDRIG krasch — replay är lyx).
 */
export function replayTillKort(handelser: StudioEventPost[]): {
  kort: StudioReplayKort[];
  antalRundor: number;
  antalEvents: number;
} {
  const karta = new Map<string, StudioReplayKort>();
  let antalRundor = 0;
  let okanda = 0;
  for (const post of handelser) {
    const p = (post.payload ?? {}) as Record<string, unknown>;
    if (post.typ === "turn.started") {
      antalRundor += 1;
      continue;
    }
    if (post.typ === "tool.updated") {
      const id =
        typeof p.toolCallId === "string" && p.toolCallId ? p.toolCallId : `replay-ingen-id-${okanda++}`;
      const nu = karta.get(id) ?? { id, namn: "", steg: "kör" as StudioVerktygSteg };
      if (typeof p.toolName === "string" && p.toolName) nu.namn = p.toolName;
      const kind = typeof p.kind === "string" ? p.kind : "";
      if (kind === "scheduled") {
        nu.steg = "planerad";
        const arg = argumentText(p.input);
        if (arg) nu.argument = arg;
        if (typeof p.description === "string" && p.description) nu.beskrivning = p.description;
      } else if (kind === "result") {
        nu.steg = "resultat";
        const res = resultatText(p.result);
        if (res) nu.resultat = res;
        if (typeof p.duration === "number") nu.varaktighetMs = p.duration;
      } else if (kind === "error") {
        nu.steg = "fel";
        nu.fel = felText(p.error);
      } else if (kind === "started") {
        nu.steg = "kör";
      } // progress: behåll nuvarande steg (slutbilden kommer med result/error)
      karta.set(id, nu);
      continue;
    }
    if (post.typ === "model.streaming" && p.kind === "tool_call") {
      const id =
        typeof p.toolCallId === "string" && p.toolCallId ? p.toolCallId : `replay-ingen-id-${okanda++}`;
      const nu = karta.get(id) ?? { id, namn: "", steg: "kör" as StudioVerktygSteg };
      if (typeof p.toolName === "string" && p.toolName) nu.namn = p.toolName;
      const arg = argumentText(p.input ?? p.arguments);
      if (arg && !nu.argument) nu.argument = arg;
      karta.set(id, nu);
    }
  }
  return { kort: [...karta.values()], antalRundor, antalEvents: handelser.length };
}

/**
 * VÅG 93 C1 — plugins/setEnabled-svarets bekräftelse (opak snapshot-form):
 * rak {enabled} · {plugin:{enabled}} · plugins[]/installedPlugins[]-post med
 * matchande id → enabled. Undefined när svaret tiger (satt=true ändå —
 * protokollets ack ÄR sanningen, eko är lyx).
 */
function pluginAktiveradUrSvar(svar: unknown, pluginId: string): boolean | undefined {
  if (!svar || typeof svar !== "object") return undefined;
  for (const rot of [svar, (svar as Record<string, unknown>).snapshot, (svar as Record<string, unknown>).result]) {
    if (!rot || typeof rot !== "object") continue;
    const o = rot as Record<string, unknown>;
    if (typeof o.enabled === "boolean") return o.enabled;
    const plugin = o.plugin;
    if (plugin && typeof plugin === "object" && typeof (plugin as Record<string, unknown>).enabled === "boolean") {
      return (plugin as Record<string, unknown>).enabled as boolean;
    }
    for (const listaNyckel of ["plugins", "installedPlugins"]) {
      const lista = o[listaNyckel];
      if (!Array.isArray(lista)) continue;
      for (const post of lista) {
        if (!post || typeof post !== "object") continue;
        const p = post as Record<string, unknown>;
        const id =
          (typeof p.id === "string" && p.id) || (typeof p.pluginId === "string" && p.pluginId) || "";
        if (id === pluginId && typeof p.enabled === "boolean") return p.enabled;
      }
    }
  }
  return undefined;
}

/**
 * VÅG 93 C1 — tolka modell-argumentet ("glm-5.3" | "zai/glm-5.3" |
 * {providerId,modelId}) till protokollref. Kastar ärligt vid ogiltig form
 * (samma teckenregel som bytModell: id:n är korta identifierare).
 */
function tolkaModellArgument(modell: string | { providerId: string; modelId: string }): {
  providerId: string;
  modelId: string;
} {
  const regex = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}$/;
  if (modell && typeof modell === "object") {
    const { providerId, modelId } = modell;
    if (typeof providerId !== "string" || typeof modelId !== "string" || !regex.test(providerId) || !regex.test(modelId)) {
      throw new Error("Ogiltig modellreferens ({providerId, modelId} kräver giltiga identifierare).");
    }
    return { providerId, modelId };
  }
  if (typeof modell !== "string" || !modell.trim()) {
    throw new Error("modell krävs (sträng \"glm-5.3\"/\"zai/glm-5.3\" eller {providerId, modelId}).");
  }
  const text = modell.trim();
  if (text.includes("/")) {
    const [provider, ...rest] = text.split("/");
    const modelId = rest.join("/");
    if (!regex.test(provider ?? "") || !regex.test(modelId)) {
      throw new Error("Ogiltig modellsträng — förväntade formen \"provider/model\" (t.ex. zai/glm-5.3).");
    }
    return { providerId: provider, modelId };
  }
  if (!regex.test(text)) {
    throw new Error(`Ogiltigt modell-id "${text.slice(0, 40)}".`);
  }
  return { providerId: "zai", modelId: text };
}

/**
 * VÅG 93 C1 — saniteta kort sträng (tankestyrka/läge): trim, icke-tom,
 * ≤ MAX_INSTALLNING_TEEKEN tecken. Protokollet är sanningsägaren om de
 * giltiga NIVÅERNA — transporten avvisar bara det uppenbart trasiga och
 * lämnar ogiltiga ord till protokollets egna ärliga fel.
 */
function renInstallningsVarde(vardet: unknown, falt: string): string {
  const s = typeof vardet === "string" ? vardet.trim() : "";
  if (!s) throw new Error(`${falt} krävs (icke-tom sträng).`);
  if (s.length > MAX_INSTALLNING_TEEKEN) {
    throw new Error(`${falt}: max ${MAX_INSTALLNING_TEEKEN} tecken.`);
  }
  return s;
}

/**
 * VÅG 91 A1b — kort svensk beskrivning av ett mål-event (REN funktion,
 * delad av appserver- och mock-transport): statuspollens "senasteEvent"-rad.
 * Aldrig längre än ~120 tecken — raden är en PIXEL, inte en rapport.
 */
export function beskrivMalEvent(event: StudioEvent): string {
  switch (event.typ) {
    case "mal_status":
      return event.aktiv
        ? `Mål aktivt (iteration ${event.iteration})`
        : event.pausad
          ? `Mål pausat (iteration ${event.iteration})`
          : "Inget mål aktivt";
    case "mal_iteration":
      return event.fas === "start"
        ? `Iteration ${event.iteration} startar`
        : `Iteration ${event.iteration} klar${event.resultatTyp ? ` (${event.resultatTyp})` : ""}`;
    case "mal_pausad":
      return `Målet pausat vid iteration ${event.iteration}`;
    case "delta":
      return event.kanal === "tankar" ? "Agenten resonerar…" : "Agenten skriver svaret…";
    case "verktyg_kort":
      return `Verktyg ${event.namn ?? ""} (${event.steg})`.trim();
    case "verktyg_input":
      return "Agenten skriver verktygsargument…";
    case "runda":
      return event.fas === "start" ? "Turn startar" : "Turn slut";
    case "status":
      return truncat(event.text, 120);
    case "fel":
      return truncat(`Fel: ${event.meddelande}`, 120);
    default:
      return event.typ;
  }
}

// ── V83 B1: truncering + filändringar ur session/messages ────────────────────

/** Argument-/resultat-budgeter: SSE-raderna skall förblir små och snabba. */
const MAX_ARGUMENT_TEEKEN = 600;
const MAX_RESULTAT_TEEKEN = 1_500;
const MAX_PROGRESS_TEEKEN = 240;
const MAX_RADLANGD = 200;
const MAX_RADER_PER_FIL = 400;
const MAX_FILER = 12;
/** VÅG 91 A1d: generateText-prompens tak (samma budget som API-routen). */
const MAX_PROMPT_TEEKEN_TRANSPORT = 50_000;

/** Ärlig trunkering med räkneverkonsruta. */
function truncat(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}… [trunkerat — ${text.length} tecken totalt]`;
}

/** Verktygsargument (objekt|sträng) → läsbar JSON-sträng, truncat. */
function argumentText(indata: unknown): string | undefined {
  if (indata === undefined || indata === null) return undefined;
  const str = typeof indata === "string" ? indata : JSON.stringify(indata);
  if (!str) return undefined;
  return truncat(str, MAX_ARGUMENT_TEEKEN);
}

/** Verktygsresultat (sträng|objekt) → text, truncat. */
function resultatText(resultat: unknown): string | undefined {
  if (resultat === undefined || resultat === null) return undefined;
  if (typeof resultat === "string") return resultat ? truncat(resultat, MAX_RESULTAT_TEEKEN) : undefined;
  const str = JSON.stringify(resultat);
  return str ? truncat(str, MAX_RESULTAT_TEEKEN) : undefined;
}

/** tool.updated kind error: felobjektet _Et → läsbar text, truncat. */
function felText(fel: unknown): string | undefined {
  if (fel === undefined || fel === null) return undefined;
  if (typeof fel === "string") return truncat(fel, MAX_RESULTAT_TEEKEN);
  const f = fel as { message?: unknown; type?: unknown; code?: unknown };
  const delar = [f.type, f.message, f.code].filter(
    (d): d is string => typeof d === "string" && d.length > 0,
  );
  if (delar.length > 0) return truncat(delar.join(": "), MAX_RESULTAT_TEEKEN);
  const str = JSON.stringify(fel);
  return str ? truncat(str, MAX_RESULTAT_TEEKEN) : undefined;
}

/** Text → diff-rader med radlängdstak. */
function tillRader(text: string, typ: "+" | "-"): StudioRadandring[] {
  return text.split("\n").map((rad) => ({
    typ,
    text: rad.length > MAX_RADLANGD ? `${rad.slice(0, MAX_RADLANGD)}…` : rad,
  }));
}

/**
 * Filändringar ur ett session/messages-svar (ren funktion — deterministiskt
 * testbar): senaste turnen = meddelandena EFTER det SENASTE user-meddelandet;
 * Write/Edit/MultiEdit-delarnas input bär file_path + content respektive
 * old_string/new_string/edits[]. ±N är ÄRLIGA heltal även när rader listan
 * kapats (MAX_RADER_PER_FIL) — gränsdokumentationen är panelens sak.
 */
export function filandringarUrMessages(svar: unknown): StudioFilandring[] {
  const meddelanden = (svar as { messages?: unknown[] } | null)?.messages;
  if (!Array.isArray(meddelanden)) return [];
  let senasteUser = -1;
  for (let i = meddelanden.length - 1; i >= 0; i--) {
    const roll = (meddelanden[i] as { info?: { role?: unknown } } | null)?.info?.role;
    if (roll === "user") {
      senasteUser = i;
      break;
    }
  }
  if (senasteUser < 0) return []; // ingen turn att tillskriva ändringar
  const karta = new Map<string, StudioFilandring>();
  const addera = (sokvag: string, minus: StudioRadandring[], plus: StudioRadandring[]) => {
    const befintlig = karta.get(sokvag) ?? { sokvag, plus: 0, minus: 0, rader: [] };
    befintlig.minus += minus.length;
    befintlig.plus += plus.length;
    befintlig.rader.push(...minus, ...plus);
    if (befintlig.rader.length > MAX_RADER_PER_FIL) {
      befintlig.rader = befintlig.rader.slice(0, MAX_RADER_PER_FIL);
    }
    karta.set(sokvag, befintlig);
  };
  for (let i = senasteUser + 1; i < meddelanden.length; i++) {
    const delar = (meddelanden[i] as { parts?: unknown[] } | null)?.parts;
    if (!Array.isArray(delar)) continue;
    for (const del of delar) {
      const p = del as { type?: string; tool?: unknown; state?: { status?: unknown; input?: unknown } } | null;
      if (p?.type !== "tool") continue;
      // VBe §5: state är pending|running|completed|error — ENDAST completed
      // är en ÄNDRING PÅ DISK. En planerad/avbruten/misslyckad Write får
      // ALDRIG dyka upp i panelen (input finns i alla stater — LIVE-bevisat
      // v83: nekad Write gav +4 i panelen utan att filen fanns).
      if (p.state?.status !== "completed") continue;
      const verktyg = typeof p.tool === "string" ? p.tool : "";
      const indata =
        p.state && typeof p.state === "object" && p.state.input && typeof p.state.input === "object"
          ? (p.state.input as Record<string, unknown>)
          : {};
      const sokvag =
        typeof indata.file_path === "string" && indata.file_path
          ? indata.file_path
          : typeof indata.path === "string" && indata.path
            ? indata.path
            : null;
      if (!sokvag) continue;
      if (verktyg === "Write" && typeof indata.content === "string") {
        addera(sokvag, [], tillRader(indata.content, "+"));
      } else if (verktyg === "Edit") {
        const gammal = typeof indata.old_string === "string" ? indata.old_string : "";
        const ny = typeof indata.new_string === "string" ? indata.new_string : "";
        addera(sokvag, tillRader(gammal, "-"), tillRader(ny, "+"));
      } else if (verktyg === "MultiEdit" && Array.isArray(indata.edits)) {
        for (const e of indata.edits) {
          const red = (e ?? {}) as { old_string?: unknown; new_string?: unknown };
          const gammal = typeof red.old_string === "string" ? red.old_string : "";
          const ny = typeof red.new_string === "string" ? red.new_string : "";
          addera(sokvag, tillRader(gammal, "-"), tillRader(ny, "+"));
        }
      }
    }
  }
  return [...karta.values()].slice(0, MAX_FILER);
}

/**
 * V84 C: diff-förhandsvisning ur en permission-requests RÅA input (ren
 * funktion — deterministiskt testbar). Write bär file_path+content (+N),
 * Edit bär old_string/new_string (EXAKT −N/+N), MultiEdit bär edits[] —
 * samma tolkning som filandringarUrMessages men för EN kommande ändring
 * (verktyget har inte körts än — det är precis poängen med förhandsvis-
 * ningen). ±N är ÄRLIGA heltal även när radlistan kapats (MAX_RADER_PER_FIL
 * som panelen); null = verktyget bär inga tolkbara filargument (UI:t
 * visar argument-summary som förr).
 */
export function diffUrInput(verktyg: string, input: unknown): StudioFilandring | null {
  if (!input || typeof input !== "object") return null;
  const indata = input as Record<string, unknown>;
  const sokvag =
    typeof indata.file_path === "string" && indata.file_path
      ? indata.file_path
      : typeof indata.path === "string" && indata.path
        ? indata.path
        : null;
  if (!sokvag) return null;
  let minus: StudioRadandring[] = [];
  let plus: StudioRadandring[] = [];
  if (verktyg === "Write" && typeof indata.content === "string") {
    plus = tillRader(indata.content, "+");
  } else if (verktyg === "Edit") {
    minus = tillRader(typeof indata.old_string === "string" ? indata.old_string : "", "-");
    plus = tillRader(typeof indata.new_string === "string" ? indata.new_string : "", "+");
  } else if (verktyg === "MultiEdit" && Array.isArray(indata.edits)) {
    for (const e of indata.edits) {
      const red = (e ?? {}) as { old_string?: unknown; new_string?: unknown };
      minus.push(...tillRader(typeof red.old_string === "string" ? red.old_string : "", "-"));
      plus.push(...tillRader(typeof red.new_string === "string" ? red.new_string : "", "+"));
    }
  } else {
    return null; // Bash/Read/… — inga filargument att diffa
  }
  if (minus.length === 0 && plus.length === 0) return null;
  const rader = [...minus, ...plus].slice(0, MAX_RADER_PER_FIL);
  return { sokvag, plus: plus.length, minus: minus.length, rader };
}

/**
 * Kontext för den aktiva prompten — notiser utan aktiv prompt ignoreras
 * (broadcasten är bred: state.updated, telemetri m.m.).
 */
interface AktivPrompt {
  lyssnare: StudioLyssnare;
  klar: () => void;
  senasteText: string;
  färdig: boolean;
}

class AppServerTransport implements StudioTransport {
  readonly namn = "appserver" as const;
  private klient: ProtokollKlient | null = null;
  private sid: string | null = null;
  private prenumererad = false;
  private aktiv: AktivPrompt | null = null;
  /** Väntar på state.updated-idle efter session/compact (BEVISAT v82). */
  private idleVakt: (() => void) | null = null;
  /** Fallback-räknare för tool.updated utan toolCallId (kartan har det — defensive). */
  private okandaVerktyg = 0;
  /** V83 B2: väntande server→klient-interaktioner (permission/fråga). */
  private readonly interaktioner = new Map<string, VantanInteraktion>();
  /** V83 B2: senast satta läge/tankestyrka — följer med vid create/resume. */
  private lage: "build" | "plan" | null = null;
  private tankeNiva: string | null = null;
  /**
   * VÅG 84 B: mål-session (per-session-tabbar) — när satt tvingar ensure()
   * resume av JUST denna session; misslyckad mål-resume är ett ÄRLIGT fel
   * (aldrig tyst create — sessionen är klientens identitet på tabben).
   * Undefined = default-transporten (persistensfilens resume-or-create).
   */
  private readonly målSessionId: string | undefined;
  // ── VÅG 85 F1: MÅL-LÄGET — autonom utvecklingsloop ──────────────────────────
  /** Måltexten (session/goal objective) — null = inget mål. */
  private malText: string | null = null;
  /** true = den autonoma loopen KÖR (protokollet matar turner). */
  private malAktiv = false;
  /** true = målet finns men är pausat (session/stop). */
  private malPausad = false;
  /** Iterationsräknaren (KVD: räknaren lever i transporten). */
  private malIteration = 0;
  /** Senaste iterationens ackumulerade text (turn.completed-fallback). */
  private malSenasteText = "";
  /**
   * true = en mål-turn är ÖPPEN (turn.started sedd, turn.completed ej än).
   * VÅG 85 F1 E2E-FYND (prod 2026-09-10): den FÖRSTA mål-turnens
   * turn.started kan anlända MEDAN session/goal-set-requesten fortfarande
   * körs (startedTurn-racet) — därför sätter sattMal mål-state:t FÖRE
   * requesten, och turn.completed räknar UPP själv när starten missats
   * (malTurnOppen=false) så räknaren förblir ärlig.
   */
  private malTurnOppen = false;
  /**
   * VÅG 91 A1b: senaste mål-eventets korta beskrivning + tidpunkt —
   * GET /api/studio/mal/status rad (statuspollens "senasteEvent"/"uppdaterad").
   * Skrivs av sändMalEvent (MOTORN) — lever ALLTID, även utan lyssnare.
   */
  private malSenasteEvent: string | null = null;
  private malSenasteEventTid: number | null = null;
  /** Mål-loopens lyssnare (SSE-bryggan /api/studio/mal/stream). */
  private malLyssnare: StudioLyssnare | null = null;
  /**
   * Buffrade mål-events — anlände utan lyssnare (strömmen öppnas EFTER
   * mål-set: ras-skydd så första iterationens start ALDRIG tappas; även
   * reconnects läks). Spolas vid prenumereraMal och glöms då.
   */
  private readonly malBuffert: StudioEvent[] = [];
  /** Buffertens tak — äldst event kastas först (rullande fönster). */
  private static readonly MAL_BUFFERT_TAK = 400;
  // ── VÅG 85 F4: V4-GRENEN — filändringar ur protokollets egen källa ────────
  /**
   * V4-prenumerationens tillstånd (BEVISAT sond2/3 2026-09-09): EGEN
   * connectionId (gateway:en byter ut äldre prenumeration på samma id),
   * logEpoch ur subscribe-ack:et, revision spårad live ur ramarnas
   * state.updated-patchar (≠ rowsRange.atSeq!). v4Ansluten = false efter
   * misslyckad subscribe ⇒ lasFilandringar faller på Write/Edit-motorn.
   */
  private readonly v4ConnectionId = `ak1a-studio-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  private v4LogEpoch: string | null = null;
  private v4Revision = 0;
  private v4Ansluten = false;
  // ── VÅG 90 K1: STABILITET — omstartskedja, idle-spårning, hälsa ────────────
  /** Misslyckade omstartsförsök sedan senaste LYCKADE etablering (0–3). */
  private omstartForsok = 0;
  /** true under omstarts-backoff OCH pågående försök — spärrar ensure(). */
  private omstartPaga = false;
  /** Väntande omstarts-backoff-timer (null = ingen schemalagd). */
  private omstarTimer: ReturnType<typeof setTimeout> | null = null;
  /** Senaste fel (död/omstart) — hälsorutten /api/studio/halsa. */
  private senasteFel: { tid: number; text: string } | null = null;
  /** Senaste LYCKADE barnomstart (epoch ms) — hälsorutten. */
  private senasteOmstart: number | null = null;
  /** Senaste aktivitet (epoch ms) — hushållningens 2 h-idle-klocka. */
  private senasteAktivTid = Date.now();
  /**
   * true när en ny död inträffade MITT I en pågående omstartskedja — den
   * köas och triggar en FRÄSCH kedja när den pågående avslutar (annars kunde
   * den tyst försvinna i sista mikrosekundfönstret innan omstartPaga=false).
   */
  private dodVantarPaOmstart = false;
  /** Max omstartsförsök per död — därefter tydligt uppgivet fel. */
  private static readonly MAX_OMSTARTER = 3;
  /** Exponentiell backoff: 2 s → 8 s → 32 s (KVD ur våg 90-block K1). */
  private static readonly OMSTART_BACKOFF_MS = [2_000, 8_000, 32_000] as const;

  constructor(
    private readonly binärer: string[],
    private readonly arbetskatalog: string,
    private readonly lagringsSökväg: string,
    målSessionId?: string,
  ) {
    this.målSessionId =
      typeof målSessionId === "string" && /^sess_[A-Za-z0-9._-]+$/.test(målSessionId)
        ? målSessionId
        : undefined;
  }

  sessionId(): string | null {
    return this.sid;
  }

  async ensure(): Promise<void> {
    if (this.klient?.lever && this.sid && this.prenumererad) return;
    // VÅG 90 K1: varje ensure = intresse för sessionen (GET-poll från ett
    // öppet UI räknas som aktivitet) — idle-klockan slår aldrig fel.
    this.senasteAktivTid = Date.now();

    // Persistens: återuppta förra sessionen när pm2/servern startat om
    // ("sessionsliståterkomst") — fall tillbaka på create om den är borta.
    // OBS: resume-or-create körs också när klienten LEVER men sessionen
    // saknas (självläkningsvägen nySession() efter -32031).
    this.klientForFraga(); // VÅG 90 K1: omstartsvakt — kastar under backoff
    if (!this.sid) {
      const klient = this.klient!;
      const { sessionId: sparad, modell, lage, tankeNiva, sparadTid } = this.lasSparadSession();
      if (lage === "build" || lage === "plan") this.lage = lage;
      if (tankeNiva) this.tankeNiva = tankeNiva;
      let resumerad = false;
      // VÅG 84 B: mål-session (per-session-tabbar) vinner över persistens-
      // filen — tabben ÄGER sin session; misslyckad mål-resume kastar ett
      // ärligt fel (default-transporten faller tyst vidare på create).
      const mal = this.målSessionId ?? sparad;
      // VÅG 95 (-32031-STÄDNING): DEFAULT-transportens persistens-session
      // som är FRISKGÅNG (>24 h sedan senaste aktivitet ELLER en gång
      // drabbad av -32031) resumed ALDRIG — rakt mot frisk create, så det
      // första meddelandet efter omstart slipper resume → -32031 →
      // kassera → ny-dubbelturen. MÅL-sessioner (tabbar) undantas — deras
      // resume-fel är ÄRLIGA enligt våg 84 B:s kontrakt (registry-nivån
      // i hamtaSessionTransport äger friskgångsbeslutet för tabbar).
      const friskgang =
        !this.målSessionId && !!sparad && arFrigangSession(sparad, sparadTid);
      if (mal && !friskgang) {
        try {
          // V83 B2: resume bär thoughtLevel (kartan §1 — mode finns ej i
          // resume-schemat, det följer med vid nästa create istället).
          const resultat = await klient.protokollFraga(
            "session/resume",
            { sessionId: mal, ...(this.tankeNiva ? { thoughtLevel: this.tankeNiva } : {}) },
            45_000,
          );
          const sid = sessionUr(resultat);
          if (sid) {
            this.sid = sid;
            resumerad = true;
            // VÅG 145: resumead huvudtråds-session finns kvar i boken
            // (idempotent — omstart kan ha tappat den).
            if (!this.målSessionId) registreraHuvudtradSession(sid);
          }
        } catch (fel) {
          if (this.målSessionId) {
            const text = fel instanceof Error ? fel.message : String(fel);
            throw new Error(
              `Sessionen ${this.målSessionId.slice(0, 13)}… kunde ej återupptas (${text.slice(0, 140)}) — stäng tabben eller öppna en ny.`,
            );
          }
          resumerad = false; // borta/ogiltig → skapa ny nedan
        }
      }
      if (!resumerad) {
        // VÅG 95: friskgång ⇒ FRISKT create UTAN den sparade modell-parametern
        // — modellDod/ålder betyder just att den sparade modellen (eller en
        // slumpmässigt borttagen) är misstänkt död; sessionen föds med
        // serverns AKTUELLA standardmodell i stället (resume-fallbacken
        // oförändrad: där var sessionen bara borta, modellen oskyldig).
        await this.skapa(klient, friskgang ? undefined : modell);
      }
    }

    if (this.sid && !this.prenumererad) {
      // BEVISAT: web-remote-replayable ger session/event-push med riktiga
      // text_delta-bitar (desktop-continuous är skrivbordsyta).
      await this.klient!.protokollFraga(
        "session/subscribe",
        { sessionId: this.sid, deliveryKind: "web-remote-replayable" },
        30_000,
      );
      this.prenumererad = true;
      // VÅG 85 F4 (BEVISAT sond2/3): v4-grenen prenumereras i SAMBAND med
      // sessionen — FÖRE kommande turner (raderna materialiseras bara för
      // en prenumererad + persistent session). Best-effort: misslyckad
      // subscribe är ALDRIG fatal för chatten (diffen faller på motorn).
      await this.v4Prenumerera();
    }
    // VÅG 90 K1: LYCKAD etablering nollställer omstartsräknaren — nästa
    // ovillkorliga död får ett fräscht försöksfönster (max 3, backoff 2/8/32 s).
    this.omstartForsok = 0;
  }

  /**
   * VÅG 85 F4: v4/conversation/subscribe på "conversation/<sid>" (BEVISAT
   * sond2/3: topic-prefix "conversation/" + sessions-id, EGEN connectionId,
   * clientMode "web-remote-replayable"; ack bär logEpoch). Fel ⇒ v4Ansluten
   * false — lasFilandringar() använder då Write/Edit-motorn.
   */
  private async v4Prenumerera(): Promise<void> {
    if (!this.klient?.lever || !this.sid) return;
    try {
      const svar = (await this.klient.protokollFraga(
        "v4/conversation/subscribe",
        {
          topic: `conversation/${this.sid}`,
          connectionId: this.v4ConnectionId,
          clientMode: "web-remote-replayable",
        },
        20_000,
      )) as { ack?: { logEpoch?: unknown } } | null;
      const epoch = svar?.ack?.logEpoch;
      if (typeof epoch === "string" && epoch) {
        this.v4LogEpoch = epoch;
        this.v4Ansluten = true;
        this.v4Revision = 0; // nollställ — den nya prenumerationen börjar friskt
      } else {
        this.v4Ansluten = false;
      }
    } catch {
      this.v4Ansluten = false;
    }
  }

  private startaKlient(): ProtokollKlient {
    let senasteFel: unknown = null;
    for (const binär of this.binärer) {
      // V82-prodfix: ENOENT kommer ASYNKRONT (spawn 'error'-event) och
      // undgår try/catch — resolve därför kandidaterna FÖRUT (bara "zcode"
      // i PATH räcker inte när pm2-daemonens PATH saknar npm-global;
      // bevisat 2026-09-09: "spawn zcode ENOENT" på prod trots att
      // /home/ak1a/.npm-global/bin/zcode fanns som reserv i listan).
      const sokvag = hittaBinär(binär);
      if (!sokvag) {
        senasteFel = new Error(`${binär} finns ej (PATH + kända sökvägar)`);
        continue;
      }
      const klient = new ProtokollKlient(sokvag, this.arbetskatalog);
      klient.händelseLyssnare = (m) => this.påNotis(m);
      // VÅG 90 K1: ovillkorlig barnprocess-död → transportens omstartskedja
      // (meddela lyssnare + auto-omstart med backoff; avsiktlig stang() tiger).
      klient.dodsLyssnare = (fel) => this.vidKlientDöd(fel);
      // V83 B2: interaktionsdomänen (permission/fråga) besvaras asynkront
      // via transportens register — klienten skriver {id, result} när
      // användaren svarat (eller 30 s-defaulten löst).
      klient.serverRequestHanterare = (metod, parametrar) => this.paServerRequest(metod, parametrar);
      try {
        klient.starta();
        return klient;
      } catch (fel) {
        senasteFel = fel;
      }
    }
    throw new Error(`ingen zcode-binär kunde startas (${this.binärer.join(", ")}): ${String(senasteFel)}`);
  }

  /**
   * VÅG 90 K1: klient-start med OMPSTARTSVAKT — returnerar en levande klient
   * eller startar en ny, MEN under en pågående automatisk omstart (backoff-
   * fönstret) kastas ett ärligt "pröva igen"-fel i stället för att en ANDRA
   * klient startas bredvid omstarten (dubbla barn = dubbel RAM på Contabo).
   */
  private klientForFraga(): ProtokollKlient {
    if (this.klient?.lever) return this.klient;
    if (this.omstartPaga) {
      throw new Error(
        `Agent-processen startar om automatiskt (försök ${Math.min(this.omstartForsok + 1, AppServerTransport.MAX_OMSTARTER)}/${AppServerTransport.MAX_OMSTARTER}) — pröva igen om några sekunder.`,
      );
    }
    this.klient = this.startaKlient();
    this.prenumererad = false;
    return this.klient;
  }

  // ── VÅG 90 K1: BARNPROCESS-DÖD → meddela + automatisk omstart ───────────────

  /**
   * Barnprocessen dog OVILLKORLIGT (exit/error — typiskt OOM när flera
   * sessioner + Next + pm2 delar Contabos 8 GB): den pågående prompten får
   * ett ÄRLIGT fel DIREKT (ALDRIG 10-minuters-tystnad), mål-lyssnaren
   * meddelas, kartan spolas TVINGAT till disk och omstartskedjan börjar
   * (max 3 försök, exponentiell backoff 2 s/8 s/32 s — därefter tydligt fel).
   */
  private vidKlientDöd(fel: Error): void {
    this.prenumererad = false;
    this.v4Ansluten = false;
    this.malTurnOppen = false; // den döda turnen completas aldrig — räknaren börjar friskt
    this.senasteFel = { tid: Date.now(), text: `barnprocess död: ${fel.message}`.slice(0, 300) };
    const aktiv = this.aktiv;
    if (aktiv && !aktiv.färdig) {
      aktiv.färdig = true;
      try {
        aktiv.lyssnare({
          typ: "fel",
          meddelande: `Agent-processen dog (${fel.message.slice(0, 140)}) — servern startar om den automatiskt; pröva igen om en stund.`,
        });
      } catch {
        // brutet SSE — omstarten fortsätter ändå
      }
      aktiv.klar();
    }
    this.sändMalEvent({
      typ: "status",
      text: `Agent-processen dog — automatisk omstart pågår (${fel.message.slice(0, 120)}).`,
    });
    spolaKartaTillDisk(); // VÅG 90 K1: tvingad flush vid död — debounce är lyx här
    this.startaOmAutomatiskt(fel);
  }

  /**
   * Schemalägg omstart — en pågående kedja dubblas ALDRIG; en död som
   * inträffar MITT I en pågående omstart KÖAS (dodVantarPaOmstart) och får
   * en ny kedja när den pågående avslutar.
   */
  private startaOmAutomatiskt(fel: Error): void {
    if (this.omstartPaga) {
      this.dodVantarPaOmstart = true;
      return;
    }
    this.omstartPaga = true;
    this.stegOmstart(fel);
  }

  /** Efter avslutad omstart: en köad död (mitt i kedjan) startar en ny kedja. */
  private fangaVantandeDod(): void {
    if (!this.dodVantarPaOmstart) return;
    this.dodVantarPaOmstart = false;
    this.startaOmAutomatiskt(new Error("barnprocessen dog under pågående omstart"));
  }

  /**
   * Ett steg i omstartscykeln: backoff 2 s → 8 s → 32 s, max 3 försök —
   * därefter ge upp med tydligt fel (mål-strömmen + hälsorutten bär det).
   */
  private stegOmstart(fel: Error): void {
    if (this.omstartForsok >= AppServerTransport.MAX_OMSTARTER) {
      const text =
        `Agent-processen dog och ${AppServerTransport.MAX_OMSTARTER} omstartsförsök misslyckades ` +
        `(${fel.message.slice(0, 160)}) — kontrollera serverns minne (pm2 logs ak1a) och ladda om /studio.`;
      this.senasteFel = { tid: Date.now(), text };
      this.sändMalEvent({ typ: "fel", meddelande: text });
      // Lås upp: nästa användartryck (ensure) får försöka etablera manuellt.
      this.omstartPaga = false;
      this.fangaVantandeDod();
      return;
    }
    const backoff =
      AppServerTransport.OMSTART_BACKOFF_MS[
        Math.min(this.omstartForsok, AppServerTransport.OMSTART_BACKOFF_MS.length - 1)
      ];
    this.omstartForsok += 1;
    this.omstarTimer = setTimeout(() => {
      this.omstarTimer = null;
      void this.korOmstart();
    }, backoff);
    this.omstarTimer.unref(); // omstarts-timern får ALDRIG hålla processen vid liv
  }

  /** Genomför ETT omstartsförsök: ny klient + resume + subscribe + sond. */
  private async korOmstart(): Promise<void> {
    try {
      const klient = this.startaKlient();
      this.klient = klient;
      // Sessionen återupptas i det NYA barnet (protokolls-state dog med det
      // gamla; sessionerna själva lever på disk — persistence "immediate").
      if (this.sid) {
        const resultat = await klient.protokollFraga(
          "session/resume",
          { sessionId: this.sid, ...(this.tankeNiva ? { thoughtLevel: this.tankeNiva } : {}) },
          45_000,
        );
        const sid = sessionUr(resultat);
        if (!sid) throw new Error("session/resume svarade utan sessionId vid omstart");
        this.sid = sid;
        await klient.protokollFraga(
          "session/subscribe",
          { sessionId: this.sid, deliveryKind: "web-remote-replayable" },
          30_000,
        );
        this.prenumererad = true;
        await this.v4Prenumerera();
      }
      // LYCKAD etablering: räknaren börjar om vid nästa död.
      this.omstartForsok = 0;
      this.senasteOmstart = Date.now();
      this.senasteAktivTid = Date.now();
      // Mål-självläkning: ett LEVANDE mål i protokollet återaktiverar mål-
      // läget så den autonoma loopen fortsätter mata turner (sondMal är
      // best-effort — statusen är sanningen).
      await this.sondMal();
      this.sändMalEvent({ typ: "status", text: "Agent-processen återstartad — sessionen återupptagen." });
    } catch (fel) {
      const felet = fel instanceof Error ? fel : new Error(String(fel));
      this.senasteFel = { tid: Date.now(), text: `omstart misslyckades: ${felet.message}`.slice(0, 300) };
      this.stegOmstart(felet); // nästa backoff-steg (omstartPaga förblir true)
      return;
    }
    this.omstartPaga = false; // klar — ensure() låses upp
    this.fangaVantandeDod(); // en död mitt i kedjan? → fräsch kedja nu
  }

  /** Avbryt pågående omstart (vid avsiktlig nedstängning). */
  private omstartAvbryt(): void {
    this.omstartPaga = false;
    this.dodVantarPaOmstart = false;
    if (this.omstarTimer !== null) {
      clearTimeout(this.omstarTimer);
      this.omstarTimer = null;
    }
  }

  /**
   * VÅG 90 K1 — idle? true = ingen pågående prompt, inget aktivt mål, inga
   * väntande interaktioner. Hushållningen (max-barn-vakten + 2 h-idle)
   * stänger ENDAST idle-transporter — pågående arbete rörs ALDRIG.
   */
  arIdle(): boolean {
    return !(this.aktiv && !this.aktiv.färdig) && !this.malAktiv && this.interaktioner.size === 0;
  }

  /** VÅG 90 K1: senaste aktivitet (epoch ms) — hushållningens idle-klocka. */
  senasteAktivitetTid(): number {
    return this.senasteAktivTid;
  }

  /** VÅG 90 K1: barnprocessinfo till hälsorutten (/api/studio/halsa). */
  barnInfo(): {
    pid: number | null;
    lever: boolean;
    ramMB: number | null;
    omstartForsok: number;
    senasteOmstart: number | null;
    senasteFel: { tid: number; text: string } | null;
  } {
    const pid = this.klient?.pid() ?? null;
    return {
      pid,
      lever: this.klient?.lever === true,
      ramMB: pid !== null ? lasBarnRamMB(pid) : null,
      omstartForsok: this.omstartForsok,
      senasteOmstart: this.senasteOmstart,
      senasteFel: this.senasteFel,
    };
  }

  /**
   * VÅG 90 K1 — stäng HELT: session/close (protokollet) + barnprocessen dödas
   * AVSIKTLIGT (ingen omstart triggas) + all state rensas. Används av
   * hushållningen (idle >2 h / max-barn-vakten). Nästa ensure() föder en
   * frisk klient + session; historiken lever i sessionskartan + session/list.
   */
  async stangHelt(): Promise<void> {
    this.omstartAvbryt();
    const sid = this.sid;
    if (sid && this.klient?.lever) {
      try {
        await this.klient.protokollFraga("session/close", { sessionId: sid }, 8_000);
      } catch {
        // best-effort — barnet dödas nedan ändå
      }
    }
    this.klient?.stang();
    this.klient = null;
    this.sid = null;
    this.prenumererad = false;
    this.v4Ansluten = false;
    this.v4LogEpoch = null;
    this.rensaVantandeInteraktioner();
    // Mål-läget dör med sessionen — mål-lyssnaren får ärlig snapshot.
    this.malText = null;
    this.malAktiv = false;
    this.malPausad = false;
    this.malIteration = 0;
    this.malSenasteText = "";
    this.malTurnOppen = false;
    this.malSenasteEvent = null;
    this.malSenasteEventTid = null;
    this.malBuffert.length = 0;
    this.sändMalEvent({ typ: "mal_status", aktiv: false, pausad: false, iteration: 0, mal: null });
    if (sid) {
      try {
        rmSync(this.lagringsSökväg, { force: true });
      } catch {
        // best-effort
      }
    }
  }

  /**
   * VÅG 90 K1: döda BARNPROCESSEN avsiktligt UTAN session/close (SIGTERM-
   * nedstängning — pm2:s kill-timeout hinner inte med protokollsroundtrips).
   * Ingen omstart triggas; transportens state rensas som i stangHelt().
   */
  dodaBarnAvsiktligt(): void {
    this.omstartAvbryt();
    const klient = this.klient;
    this.klient = null;
    this.prenumererad = false;
    this.v4Ansluten = false;
    const aktiv = this.aktiv;
    if (aktiv && !aktiv.färdig) {
      aktiv.färdig = true;
      try {
        aktiv.lyssnare({ typ: "fel", meddelande: "Servern stänger ned — agent-processen avslutades." });
      } catch {
        // strömmen redan borta
      }
      try {
        aktiv.klar();
      } catch {
        // resolve av en redan löst promise är harmlöst
      }
    }
    klient?.stang(); // avsiktlig: SIGTERM till barnet, dödsnotis undertrycks
  }

  private async skapa(klient: ProtokollKlient, modellId?: string): Promise<void> {
    // BEVISAT params-form: workspace {workspaceKey, workspacePath} — INTE
    // kind:"local" (det är en annan union; strict zod refuserar kind här).
    // V82 BEVISAT: model {providerId, modelId} accepteras och sessionen
    // föds med vald modell (setModel finns också men KVD-val är create).
    const params: Record<string, unknown> = {
      workspace: { workspaceKey: this.arbetskatalog, workspacePath: this.arbetskatalog },
    };
    if (modellId) params.model = { providerId: "zai", modelId: modellId };
    // V83 B2: läge + tankestyrka är create-params (kartan §1) — valet
    // bevaras över modellbyte/ny session. OBS (kartan §1 not): mode kan
    // överskrivas av workspace-default på serversidan — snapshoten är
    // sanningen, detta är bara intentionen.
    if (this.lage) params.mode = this.lage;
    if (this.tankeNiva) params.thoughtLevel = this.tankeNiva;
    // VÅG 85 F4 (BEVISAT sond1 vs sond2/3 2026-09-09): persistence
    // "immediate" — v4-grenens samtalsrader (rowsRange) materialiseras
    // ENDAST för persistenta sessioner (sond1 utan: rows=0 trots turn).
    // Sidoeffekt är enbart att sessionen finns på disk direkt = samma
    // synlighet som session/list redan ger.
    params.persistence = "immediate";
    const resultat = await klient.protokollFraga("session/create", params, 60_000);
    const sid = sessionUr(resultat);
    if (!sid) throw new Error("session/create svarade utan sessionId");
    this.sid = sid;
    // VÅG 145: default-trådens nya session registreras i HUVUDTRÅDENS BOK
    // (tabbar/rondsessioner har målSessionId och registreras ej).
    if (!this.målSessionId) registreraHuvudtradSession(sid);
    this.sparaPersistens(sid, modellId);
  }

  /** Persistens: {sessionId, modell?, lage?, tankeNiva?, sparad} — modellen används av create-fallback. */
  private sparaPersistens(sid: string, modellId?: string): void {
    try {
      mkdirSync(path.dirname(this.lagringsSökväg), { recursive: true });
      writeFileSync(
        this.lagringsSökväg,
        JSON.stringify({
          sessionId: sid,
          ...(modellId ? { modell: modellId } : {}),
          // V83 B2: läge/tankestyrka överlever pm2-omstart.
          ...(this.lage ? { lage: this.lage } : {}),
          ...(this.tankeNiva ? { tankeNiva: this.tankeNiva } : {}),
          sparad: Date.now(),
        }),
        "utf8",
      );
    } catch {
      // Persistens är best-effort — chatten funkar även utan.
    }
  }

  // ── V2: modellbyte, ny session, session/list, compact, kontext ───────────

  async bytModell(modellId: string): Promise<StudioBytModellSvar> {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}$/.test(modellId)) {
      throw new Error("Ogiltigt modell-id.");
    }
    // Kassera + skapa med model-param (BEVISAT v82 — sessionen föds med
    // modellen; sessionId ändras alltid vilket E2E-kravet kontrollerar).
    const sid = await this.nySession(modellId);
    return { sessionId: sid, väg: "create", modell: `zai/${modellId}` };
  }

  /**
   * Kassera den nuvarande sessionen och skapa en frisk — med vald modell
   * (bytModell-vägen) eller utan (självläkning efter -32031 + knappen
   * "Ny session"). En nyskapad session plockar annars serverns aktuella
   * standard/workspace-modell (zai/glm-5.3 vid v81-beviset).
   */
  async nySession(modellId?: string): Promise<string> {
    // Pågående prompt får aldrig överlivas av en kasserad session (UI-knappen
    // och modellbytet vägrar) — SJÄVLÄKNINGEN efter -32031 använder den
    // interna vägen nedan (skapaFriskSession) som tillåter just det.
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    return this.skapaFriskSession(modellId);
  }

  /**
   * Intern frisk-session-väg UTAN prompt-vakten — självläkningsretryn efter
   * -32031 (bevisad dödläge på prod 2026-09-09: nySession vägrade med
   * "En prompt kör" MEDAN retryn pågick, så döda sessionen kunde aldrig
   * kasseras och prompten dog). Städar väntande interaktioner + persistens.
   */
  private async skapaFriskSession(modellId?: string): Promise<string> {
    if (this.sid && this.klient?.lever) {
      // Artigt stäng — sessionen finns kvar i session/list (historik).
      try {
        await this.klient.protokollFraga("session/close", { sessionId: this.sid }, 10_000);
      } catch {
        // ej fatal — kasseras ändå nedan
      }
    }
    // V83 B2: en kasserad session lämnar inga hängande dialoger — lösa
    // väntande interaktioner ärligt (permission→deny, fråga→cancelled)
    // innan registret glöms.
    this.rensaVantandeInteraktioner();
    // VÅG 85 F1: målet tillhör DEN KASSERADE sessionen — en frisk session
    // föds utan mål (mål-läget stängs ärligt så badge/banner släcks).
    this.malText = null;
    this.malAktiv = false;
    this.malPausad = false;
    this.malIteration = 0;
    this.malSenasteText = "";
    this.malTurnOppen = false;
    this.malSenasteEvent = null;
    this.malSenasteEventTid = null;
    this.malBuffert.length = 0;
    this.sändMalEvent({ typ: "mal_status", aktiv: false, pausad: false, iteration: 0, mal: null });
    this.sid = null;
    this.prenumererad = false;
    try {
      rmSync(this.lagringsSökväg, { force: true });
    } catch {
      // best-effort — en kvarvarande fil betyder bara att nästa omstart
      // får ett misslyckat resume-försök innan create fallback körs.
    }
    this.klientForFraga(); // VÅG 90 K1: omstartsvakt
    await this.skapa(this.klient!, modellId);
    await this.ensure();
    return this.sid!;
  }

  async lasSessioner(): Promise<StudioSessionPost[]> {
    // session/list kräver LEVANDE klient men EGEN session — skapa aldrig
    // en ny bara för att lista.
    this.klientForFraga(); // VÅG 90 K1: omstartsvakt gäller även listningar
    try {
      // VÅG 86 G5: explicit limit 50 (serverns tak — kartan §1 def 50) +
      // paneltak 50 (f.d. 25): en fork (rewind) eller äldre session skall
      // synas i Sessioner trots concurrent churn (LIVE-fynd: listan är
      // updatedAt-desc och en nyligen forkad session kan annars trängas ut).
      const svar = await this.klient!.protokollFraga("session/list", { limit: 50 }, 30_000);
      const lista = (svar as SessionListResult | null)?.sessions;
      if (!Array.isArray(lista)) return [];
      const ut: StudioSessionPost[] = [];
      for (const s of lista) {
        if (typeof s.sessionId !== "string" || !s.sessionId) continue;
        const m = s.model;
        ut.push({
          sessionId: s.sessionId,
          titel: typeof s.title === "string" ? s.title : undefined,
          status: typeof s.status === "string" ? s.status : undefined,
          arbetsyta: s.workspace?.workspacePath,
          uppdaterad: s.updatedAt ?? s.updated ?? s.lastActiveAt,
          // v83: qBe.model bär modellen direkt i listan.
          modell:
            m?.providerId && m?.modelId
              ? `${m.providerId}/${m.modelId}`
              : typeof m?.modelId === "string" && m.modelId
                ? m.modelId
                : undefined,
        });
      }
      const topp = ut.slice(0, 50);
      // V83-BERIKNING: turns + tokens ur session/read-projektionen för de
      // 10 första (kontextraden per session). Varje läsning fel-tolerant —
      // listan lever alltid, berikning är lyx. Kör parallellt (NDJSON-
      // klienten multiplexar requests via id-kartan).
      await Promise.all(
        topp.slice(0, 10).map(async (post) => {
          try {
            const r = (await this.klient!.protokollFraga(
              "session/read",
              { sessionId: post.sessionId },
              12_000,
            )) as SessionReadResult | null;
            const p = r?.projection;
            if (typeof p?.turnCount === "number") post.turns = p.turnCount;
            if (typeof p?.totalTokenCount === "number") post.tokens = p.totalTokenCount;
            if (!post.modell) {
              const m = r?.session?.model;
              if (m?.providerId && m?.modelId) post.modell = `${m.providerId}/${m.modelId}`;
            }
          } catch {
            // berikning är lyx
          }
        }),
      );
      return topp;
    } catch {
      return []; // listan är lyx, aldrig ett fel
    }
  }

  async compact(instruktioner?: string): Promise<StudioCompactSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    // BEVISAT v82: schema {sessionId, inputId?, instructions?,
    // expectedRevision?}; svar compact.state "accepted"|"already_running".
    const svar = (await this.klient.protokollFraga(
      "session/compact",
      {
        sessionId: this.sid,
        ...(instruktioner && instruktioner.trim() ? { instructions: instruktioner.trim().slice(0, 500) } : {}),
      },
      60_000,
    )) as { compact?: { state?: string }; response?: string } | null;

    const state = svar?.compact?.state;
    if (state === "already_running") {
      return { status: "redan_körs", meddelande: "En komprimering körs redan — vänta några ögonblick." };
    }
    // "accepted": kompakteringen kör som en agentturn — vänta på idle
    // (state.updated broadcastas även utan subscribe; tak 2 min).
    await new Promise<void>((los) => {
      const tak = setTimeout(() => {
        this.idleVakt = null;
        los();
      }, 120_000);
      this.idleVakt = () => {
        clearTimeout(tak);
        this.idleVakt = null;
        los();
      };
    });
    const kontext = await this.lasKontext();
    const tom = !svar?.response && !kontext?.totalTokenCount;
    return {
      status: tom ? "tom" : "klar",
      meddelande: tom ? "Ingenting att komprimera — kontexten är redan frisk." : "Kontexten komprimerad.",
      kontext,
    };
  }

  async lasKontext(): Promise<StudioKontext | null> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) return null;
    try {
      const r = (await this.klient.protokollFraga("session/read", { sessionId: this.sid }, 30_000)) as
        | SessionReadResult
        | null;
      const p = r?.projection;
      const m = r?.session?.model;
      const modell = m?.providerId && m?.modelId ? `${m.providerId}/${m.modelId}` : undefined;
      return {
        modell,
        contextUsed: typeof p?.contextUsed === "number" ? p.contextUsed : undefined,
        contextWindow: typeof p?.contextWindow === "number" ? p.contextWindow : undefined,
        totalTokenCount: typeof p?.totalTokenCount === "number" ? p.totalTokenCount : undefined,
        turnCount: typeof p?.turnCount === "number" ? p.turnCount : undefined,
        // V83 B2: läge ur projektionen, tanke-nivå ur snapshot-settings —
        // lägesväxlarens/tankekortets sanning efter varje ändring.
        lage: typeof p?.mode === "string" && p.mode ? p.mode : (lasLageUrSnapshot(r) ?? undefined),
        tankeNiva: lasTankeNivaUrSnapshot(r) ?? undefined,
      };
    } catch {
      return null;
    }
  }

  // ── V83: sessions- och workspace-hantering ──────────────────────────────

  async oppnaSession(sessionId: string): Promise<StudioOppnaSvar> {
    // sessions-id:t är protokollets egen identifierare — validera formen
    // hårt innan den går till app-servern.
    if (typeof sessionId !== "string" || !/^sess_[A-Za-z0-9._-]+$/.test(sessionId)) {
      throw new Error("Ogiltigt sessions-id.");
    }
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    const klient = this.klientForFraga(); // VÅG 90 K1: omstartsvakt
    // Artigt stäng den nuvarande (den lever kvar i session/list) — samma
    // mönster som nySession().
    if (this.sid && this.sid !== sessionId && klient.lever) {
      try {
        await klient.protokollFraga("session/close", { sessionId: this.sid }, 10_000);
      } catch {
        // ej fatal — resume kör ändå nedan
      }
    }
    this.sid = null;
    this.prenumererad = false;
    // BEVISAT v83-kartan §1: {sessionId} räcker — snapshoten bär historiken
    // (messageCount) och sessionen fortsätter där den slutade.
    const resultat = await klient.protokollFraga("session/resume", { sessionId }, 45_000);
    const sid = sessionUr(resultat);
    if (!sid) throw new Error("session/resume svarade utan sessionId");
    this.sid = sid;
    this.sparaPersistens(sid);
    await klient.protokollFraga(
      "session/subscribe",
      { sessionId: sid, deliveryKind: "web-remote-replayable" },
      30_000,
    );
    this.prenumererad = true;
    // VÅG 85 F4: v4-prenumerationen följer sessionen (nya topic = nya rader).
    await this.v4Prenumerera();
    // Historiken ur session/messages — det är DENNA som fyller chatten.
    const [historik, kontext] = await Promise.all([this.historik(), this.lasKontext()]);
    return { sessionId: sid, historik, kontext };
  }

  async stangSession(sessionId?: string): Promise<boolean> {
    // ALDRIG ensure() här — att stänga ska inte föda en ny session när
    // ingen lever. Valdigt mål = parametern eller den aktiva sessionen.
    const mal = sessionId && /^sess_[A-Za-z0-9._-]+$/.test(sessionId) ? sessionId : this.sid;
    if (!mal) throw new Error("Ingen session att stänga.");
    const klient = this.klientForFraga(); // VÅG 90 K1: omstartsvakt
    const r = (await klient.protokollFraga("session/close", { sessionId: mal }, 15_000)) as
      | { closed?: boolean }
      | null;
    if (mal === this.sid) {
      // Den aktiva sessionen stängd — nästa ensure() skapar en frisk.
      this.rensaVantandeInteraktioner(); // V83 B2: inga hängande dialoger
      this.sid = null;
      this.prenumererad = false;
      try {
        rmSync(this.lagringsSökväg, { force: true });
      } catch {
        // best-effort
      }
    }
    return r?.closed !== false;
  }

  async forka(): Promise<StudioForkSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    try {
      const r = (await this.klient.protokollFraga(
        "session/fork",
        { sessionId: this.sid, target: { kind: "latestCheckpoint" } },
        30_000,
      )) as { forkedSessionId?: string } | null;
      const forkedSessionId = typeof r?.forkedSessionId === "string" ? r.forkedSessionId : undefined;
      if (!forkedSessionId) throw new Error("session/fork svarade utan forkedSessionId");
      return {
        forkedSessionId,
        meddelande: `Fork skapad — ny session ${forkedSessionId.slice(0, 13)}… (öppna den ur sessionslistan).`,
      };
    } catch (fel) {
      // DOKUMENTERAT (v83-kartan §1, LIVE-FEL): fork kräver checkpoint och
      // checkpoints skapas VID FILÄNDRINGAR (turn med Write). Ärligt svar
      // rakt ut — KVD: ingen auto-Write för att tvinga fram checkpoint.
      const text = fel instanceof Error ? fel.message : String(fel);
      if (/checkpoint/i.test(text)) {
        return {
          meddelande:
            "Ingen checkpoint ännu — fork kräver att agenten ändrat en fil först (checkpoints skapas vid filändringar). Kör en turn som skriver en fil och försök igen.",
        };
      }
      // LIVE-BEVISAT 2026-09-09 (prod, B3-E2E): -32010 "Cannot fork while a
      // prompt is running" — aktiv prompt ELLER aktiv mål-turn blockerar.
      // Ärligt svar (session/stop här skulle kunna döda pågående arbete).
      if (/prompt is running|-32010/i.test(text)) {
        return {
          meddelande:
            "En prompt eller aktivt mål kör i sessionen — fork väntar tills agenten är ledig (stoppa agenten eller rensa målet först).",
        };
      }
      throw fel;
    }
  }

  // ── VÅG 86 G5: CHECKPOINT/REWIND — fork vid valfri agentbubbla ────────────

  async rewindTillTurn(turnIndex: number): Promise<StudioRewindSvar> {
    // turnIndex är protokollets EGNA 0-baserade turn-räknare (vendor/zcode.cjs
    // fn e8i: user-meddelanden räknar upp, turnens SISTA assistant-post är
    // målet) — validera hårt innan den går till app-servern.
    if (!Number.isInteger(turnIndex) || turnIndex < 0) {
      throw new Error("Ogiltigt iterationsnummer för rewind.");
    }
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    // LIVE-BEVISAT (v86-g5-forksond.mjs 2026-09-09): {kind:"turn",turnIndex}
    // fungerar UTAN checkpoint (löses till targetMessageId = turnens sista
    // assistant-meddelande). Svaret bär forkedSessionId + snapshot.
    let forkedSessionId: string;
    try {
      const r = (await this.klient.protokollFraga(
        "session/fork",
        { sessionId: this.sid, target: { kind: "turn", turnIndex } },
        60_000,
      )) as { forkedSessionId?: unknown } | null;
      const sid = typeof r?.forkedSessionId === "string" && r.forkedSessionId ? r.forkedSessionId : "";
      if (!sid) throw new Error("session/fork svarade utan forkedSessionId");
      forkedSessionId = sid;
    } catch (fel) {
      const text = fel instanceof Error ? fel.message : String(fel);
      // LIVE-BEVISAT: ogiltigt turnIndex ⇒ -32004 "Cannot resolve assistant
      // message for turnIndex=N" — ärligt meddelande (bubblan kan ha hunnit
      // åldras ur serverns meddelandelista).
      if (/turnIndex=|target_message_not_found|-32004/i.test(text)) {
        throw new Error(
          `Iterationen ${turnIndex + 1} finns ej längre i sessionen — öppna en tidigare iteration ur Sessioner i stället.`,
        );
      }
      // LIVE-BEVISAT (B3): -32010 "Cannot fork while a prompt is running".
      if (/prompt is running|-32010/i.test(text)) {
        throw new Error("En prompt eller aktivt mål kör i sessionen — vänta tills agenten är ledig.");
      }
      throw fel;
    }
    // ÖPPNA forked-sessionen — samma väg som Sessioner-listans resume (artigt
    // session/close på parent som LEVER KVAR i session/list, resume +
    // subscribe + v4 + historik ur session/messages). Efter detta är den
    // forkade sessionen transportens AKTIVA: nästa prompt fortsätter från
    // fork-punkten ("chatten börjar om från den punkten").
    const oppnad = await this.oppnaSession(forkedSessionId);
    return {
      sessionId: oppnad.sessionId,
      iteration: turnIndex + 1,
      historik: oppnad.historik,
      kontext: oppnad.kontext,
      meddelande: `Sessionen forkad vid iteration ${turnIndex + 1} — föräldern lever kvar i Sessioner.`,
    };
  }

  async lasMal(): Promise<StudioMalSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    const r = (await this.klient.protokollFraga(
      "session/goal",
      { sessionId: this.sid, action: "show" },
      30_000,
    )) as { response?: string } | null;
    const text = typeof r?.response === "string" ? r.response.trim() : "";
    // LIVE-bevisat v83: tomt mål ⇒ response "No goal is set…" — mönstret
    // matchas brett (formuleringen kan variera mellan versioner).
    if (!text || /\bno goal\b/i.test(text)) {
      return { mal: null, meddelande: "Inget mål är satt för sessionen." };
    }
    // LIVE-bevisat (prod-protokolexperiment /tmp/v83-b3-goal.mjs): aktivt
    // mål svarar "Goal active" + raden "Objective: <text>" + förbrukning —
    // plocka Objective-raden så headern visar själva målet, inte statistik.
    const objRad = /objective:[ \t]*(.+)/i.exec(text);
    const mal = objRad ? objRad[1].trim() : text;
    // VÅG 85 F1: "Goal active" ⇒ loopen LEVER (pausat mål antas sakna
    // den frasen — ärligt: okänt format ⇒ aktiv=false, badge:t tiger).
    const aktiv = /goal active/i.test(text);
    return { mal, meddelande: mal, aktiv };
  }

  async sattMal(mal: string): Promise<StudioMalSvar> {
    const text = mal.trim().slice(0, 500);
    if (!text) throw new Error("Målet är tomt.");
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    // BEVISAT schema v83-kartan §1: action "set" + objective. LIVE-BEVISAT
    // v83 B3 (prod-experiment): mål-set startar en ASYNKRON mål-loop som
    // FÖDER NYA TURNER AUTOMATISKT — iterationerna strömmar via mål-
    // lyssnaren (prenumereraMal) utan att någon klientprompt körs.
    //
    // VÅG 85 F1 E2E-FYND (prod 2026-09-10): den första mål-turnens
    // turn.started anländer MEDAN session/goal-set-requesten körs
    // (startedTurn-racet) — mål-state:t sätts därför FÖRE requesten så
    // påNotis routerar starteventet direkt (annars tappades det och
    // mal_iteration slut kom med iteration 0). Vid request-fel återställs
    // föregående tillstånd (inget spök-mål-läge).
    const fore: {
      malText: string | null;
      malAktiv: boolean;
      malPausad: boolean;
      malIteration: number;
      malTurnOppen: boolean;
    } = {
      malText: this.malText,
      malAktiv: this.malAktiv,
      malPausad: this.malPausad,
      malIteration: this.malIteration,
      malTurnOppen: this.malTurnOppen,
    };
    this.malText = text;
    this.malAktiv = true;
    this.malPausad = false;
    this.malIteration = 0;
    this.malSenasteText = "";
    this.malTurnOppen = false;
    let r: { response?: string; startedTurn?: boolean } | null;
    try {
      r = (await this.klient.protokollFraga(
        "session/goal",
        { sessionId: this.sid, action: "set", objective: text },
        45_000,
      )) as { response?: string; startedTurn?: boolean } | null;
    } catch (fel) {
      this.malText = fore.malText;
      this.malAktiv = fore.malAktiv;
      this.malPausad = fore.malPausad;
      this.malIteration = fore.malIteration;
      this.malTurnOppen = fore.malTurnOppen;
      throw fel;
    }
    // Räknaren började om vid mål-set — mål-lyssnaren (om strömmen redan
    // är öppen) får snapshot direkt; annars fångar MAL_BUFFERT events så
    // en senare öppnad ström aldrig missar iterationens start.
    // VÅG 150: målet persistas till disk — nästa omstart återarmar DET
    // målet (inte bara stående mål) via lasMalStateFranDisk.
    skrivMalStateTillDisk(text);
    this.sändMalEvent({ typ: "mal_status", aktiv: true, pausad: false, iteration: this.malIteration, mal: text });
    return {
      mal: text,
      aktiv: true,
      meddelande:
        typeof r?.response === "string" && r.response.trim()
          ? r.response.trim()
          : r?.startedTurn
            ? "Målet satt — agenten har börjat arbeta mot det."
            : "Målet satt.",
    };
  }

  async rensaMal(): Promise<StudioMalSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    try {
      await this.klient.protokollFraga(
        "session/goal",
        { sessionId: this.sid, action: "clear" },
        30_000,
      );
    } catch (fel) {
      const text = fel instanceof Error ? fel.message : String(fel);
      // LIVE-BEVISAT 2026-09-09 (prod, B3-E2E): -32010 "Cannot manage goals
      // while a prompt is running" — mål-set startar en ASYNKRON mål-turn
      // som håller sessionen upptagen. Kartan §1: session/stop "avbryter
      // aktiv prompt + pausar aktiv goal". KVD-vakt: stoppa ENDAST när
      // EGEN prompt INTE strömmar (this.aktiv) — klientens pågående svar
      // dödas ALDRIG av en målrensning.
      if (/prompt is running|-32010/i.test(text)) {
        // LIVE-BEVISAT 2026-09-09 (prod-protokolexperiment, 2 omgångar):
        //   1) mål-set startar en mål-loop som FÖDER NYA turner — ren poll
        //      räcker inte (75 s utan framgång på "bevisa sessionshanteringen").
        //   2) session/stop (REQUEST, ack {}) PAUSAR målet — den pågående
        //      turnen avbryter inom sekunder och clear går igenom (6 s i
        //      experimentet med SAMMA måltext).
        // KVD-vakt: stoppa ENDAST när EGEN prompt INTE strömmar (this.aktiv)
        // — klientens pågående svar i chatten dödas ALDRIG av en målrensning
        // (mål-turnen är en bakgrundsturn, inte klientens ström).
        if (this.aktiv && !this.aktiv.färdig) {
          throw new Error("En prompt strömmar i chatten — vänta tills agenten är klar innan målet rensas.");
        }
        try {
          await this.klient!.protokollFraga("session/stop", { sessionId: this.sid }, 15_000);
        } catch {
          // ej fatal — pollingen nedan avgör utfallet
        }
        let rensad = false;
        let sistaFel = fel instanceof Error ? fel : new Error(text);
        for (let forsok = 0; forsok < 15; forsok += 1) {
          await new Promise((los) => setTimeout(los, 3_000));
          try {
            await this.klient!.protokollFraga(
              "session/goal",
              { sessionId: this.sid, action: "clear" },
              30_000,
            );
            rensad = true;
            break;
          } catch (fel2) {
            sistaFel = fel2 instanceof Error ? fel2 : new Error(String(fel2));
            if (!/prompt is running|-32010/i.test(sistaFel.message)) throw sistaFel;
          }
        }
        if (!rensad) {
          throw new Error(
            "Mål-turnen kör fortfarande efter 45 s — målet rensades ej. Försök igen om en stund. (" +
              sistaFel.message.slice(0, 120) +
              ")",
          );
        }
      } else {
        throw fel;
      }
    }
    // VÅG 85 F1: rensat mål = mål-läget AV — lyssnaren får snapshot direkt
    // så badge/banner/iterationer stängs samma sekund.
    this.malText = null;
    this.malAktiv = false;
    this.malPausad = false;
    this.malIteration = 0;
    this.malSenasteText = "";
    this.malTurnOppen = false;
    this.malSenasteEvent = null;
    this.malSenasteEventTid = null;
    this.malBuffert.length = 0;
    // VÅG 150: disk-målet städas OCKSÅ — ett medvetet rensat mål ska
    // ALDRIG återuppstå vid nästa omstart.
    try { rmSync(MAL_STATE_SOKVAG, { force: true }); } catch { /* stöd */ }
    this.sändMalEvent({ typ: "mal_status", aktiv: false, pausad: false, iteration: 0, mal: null });
    return { mal: null, meddelande: "Målet rensat." };
  }

  // ── VÅG 85 F1: MÅL-LÄGET — autonom utvecklingsloop ──────────────────────────

  malStatus(): StudioMalStatus {
    return {
      aktiv: this.malAktiv,
      pausad: this.malPausad,
      iteration: this.malIteration,
      mal: this.malText,
      // VÅG 91 A1b: motor-state för statuspollen — lever oavsett lyssnare.
      pagaendeTurn: this.malTurnOppen,
      senasteEvent: this.malSenasteEvent ?? undefined,
      uppdaterad: this.malSenasteEventTid ?? undefined,
      // VÅG 139: mål-sessionens id — studions öppningspreferens (refresh).
      sessionId: this.sid ?? undefined,
    };
  }

  prenumereraMal(lyssnare: StudioLyssnare): () => void {
    this.senasteAktivTid = Date.now(); // VÅG 90 K1: öppen mål-ström = intresse
    this.malLyssnare = lyssnare;
    // Snapshot först (räknarens sanning), därefter spolas bufferten — en
    // påbörjad iteration (mal_iteration start + deltas + kort) återges HEL.
    lyssnare({
      typ: "mal_status",
      aktiv: this.malAktiv,
      pausad: this.malPausad,
      iteration: this.malIteration,
      mal: this.malText,
    });
    if (this.malBuffert.length > 0) {
      for (const event of this.malBuffert) lyssnare(event);
      this.malBuffert.length = 0;
    }
    return () => {
      if (this.malLyssnare === lyssnare) this.malLyssnare = null;
    };
  }

  async pausaMal(): Promise<StudioMalSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt strömmar i chatten — vänta tills agenten är klar.");
    }
    if (!this.malText) {
      return { mal: null, meddelande: "Inget mål är satt — inget att pausa." };
    }
    // LIVE-BEVISAT 2026-09-09 (v83 B3, prod-experiment ×2): session/stop
    // (REQUEST, ack {}) avbryter den pågående mål-turnen inom sekunder och
    // PAUSAR målet (kartan §1: stop "avbryter aktiv prompt + pausar aktiv
    // goal"). KVD-vakt: vägrar när EGEN klientprompt strömmar (ovan).
    try {
      await this.klient.protokollFraga("session/stop", { sessionId: this.sid }, 15_000);
    } catch {
      // ej fatal — statusen nedan är transportens sanning ändå
    }
    this.sändMalEvent({ typ: "mal_pausad", iteration: this.malIteration });
    this.malAktiv = false;
    this.malPausad = true;
    this.sändMalEvent({
      typ: "mal_status",
      aktiv: false,
      pausad: true,
      iteration: this.malIteration,
      mal: this.malText,
    });
    return {
      mal: this.malText,
      meddelande: `Målet pausat efter ${this.malIteration} iteration${this.malIteration === 1 ? "" : "er"} — återuppta när du vill.`,
    };
  }

  async aterupptaMal(): Promise<StudioMalSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    if (!this.malText) {
      return { mal: null, meddelande: "Inget mål är satt — inget att återuppta." };
    }
    // session/goal action "resume" (kartan §1 — dokumenterad union-action;
    // paus-vägen session/stop är LIVE-bevisad, resume är dess motpol).
    // VÅG 85 F1 E2E-FYND (samma race som sattMal): en återupptagen mål-turn
    // kan starta MEDAN resume-requesten körs — aktiv sätts FÖRE requesten
    // (med återställning vid fel) så starteventet routeras direkt.
    const foreAktiv = this.malAktiv;
    const forePausad = this.malPausad;
    this.malAktiv = true;
    this.malPausad = false;
    let r: { response?: string; startedTurn?: boolean } | null;
    try {
      r = (await this.klient.protokollFraga(
        "session/goal",
        { sessionId: this.sid, action: "resume" },
        45_000,
      )) as { response?: string; startedTurn?: boolean } | null;
    } catch (fel) {
      this.malAktiv = foreAktiv;
      this.malPausad = forePausad;
      throw fel;
    }
    this.sändMalEvent({
      typ: "mal_status",
      aktiv: true,
      pausad: false,
      iteration: this.malIteration,
      mal: this.malText,
    });
    return {
      mal: this.malText,
      aktiv: true,
      meddelande:
        typeof r?.response === "string" && r.response.trim()
          ? r.response.trim()
          : r?.startedTurn
            ? "Målet återupptaget — agenten fortsätter arbeta mot det."
            : "Målet återupptaget — loopen fortsätter.",
    };
  }

  async sondMal(): Promise<StudioMalStatus> {
    // Självläkning: persistens-resumen (pm2-omstart) återupptar sessionen
    // men mål-state:t börjar tomt — sonden läser session/goal show och ett
    // LEVANDE mål ("Goal active") återaktiverar mål-läget så iterationerna
    // strömmar igen. Aldrig fel — statusen är sanningen.
    try {
      const svar = await this.lasMal();
      if (svar.mal && !this.malText) this.malText = svar.mal;
      if (svar.aktiv && !this.malPausad) this.malAktiv = true;
    } catch {
      // sonden är lyx — malStatus() är sanningen
    }
    return this.malStatus();
  }

  /**
   * Mål-event ut: levereras till mål-lyssnaren OM en ström är öppen, och
   * buffras ALWAYS (rullande fönster) så en senare prenumereraMal kan
   * spola en påbörjad iteration HEL (ras-skyddet mellan mål-set och
   * ström-öppning). VÅG 91 A1b: senaste-event-rad + tidpunkt skrivs ALWAYS
   * — MOTORN lever oavsett lyssnare (statuspollen läser den).
   */
  private sändMalEvent(event: StudioEvent): void {
    this.malSenasteEvent = beskrivMalEvent(event);
    this.malSenasteEventTid = Date.now();
    this.malBuffert.push(event);
    if (this.malBuffert.length > AppServerTransport.MAL_BUFFERT_TAK) {
      this.malBuffert.shift();
    }
    const lyssnare = this.malLyssnare;
    if (!lyssnare) return;
    try {
      lyssnare(event);
    } catch {
      // strömmen bruten — bufferten lever, nästa prenumerant får replay
    }
  }

  async lasSubagenter(): Promise<StudioSubagent[]> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    // BEVISAT schema v83-kartan §1: {sessionId, endedLimit≤100}.
    // LIVE-BEVISAT 2026-09-09 (prod, B3-E2E): en NYSS skapad session utan
    // turn-historik svarar -32004 "Session not found" — subagentregistret
    // känner bara persistent materialiserade sessioner. Det är ÄRLIGT en
    // tom lista (en session utan historik kan omöjligt ha barnagenter),
    // aldrig ett fel för panelen.
    let r: SubagentsResult | null;
    try {
      r = (await this.klient.protokollFraga(
        "session/subagents",
        { sessionId: this.sid, endedLimit: 20 },
        30_000,
      )) as SubagentsResult | null;
    } catch (fel) {
      const text = fel instanceof Error ? fel.message : String(fel);
      if (/session not found|-32004/i.test(text)) return [];
      throw fel;
    }
    const körande = r?.running;
    const avslutade = r?.ended?.items;
    const ut: StudioSubagent[] = [];
    for (const rad of [
      ...(Array.isArray(körande) ? körande : []),
      ...(Array.isArray(avslutade) ? avslutade : []),
    ]) {
      const id = typeof rad?.childSessionId === "string" ? rad.childSessionId : "";
      const status = typeof rad?.status === "string" ? rad.status : "";
      if (!id || !status) continue;
      ut.push({
        barnSessionId: id,
        titel: typeof rad.title === "string" && rad.title ? rad.title : "Bakgrundsagent",
        typ: typeof rad.subagentType === "string" ? rad.subagentType : undefined,
        status: status as StudioSubagentStatus,
        startad: typeof rad.startedAt === "string" ? rad.startedAt : undefined,
        avslutad: typeof rad.endedAt === "string" ? rad.endedAt : undefined,
        sammanfattning: typeof rad.summary === "string" ? rad.summary : undefined,
      });
    }
    return ut;
  }

  async avbrytBakgrundsTask(taskId: string): Promise<StudioAvbrytSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (typeof taskId !== "string" || !taskId) throw new Error("Task-id saknas.");
    // BEVISAT schema v83-kartan §1: {sessionId, taskId} → {cancelled,
    // reason?, status}. För subagenter används childSessionId som taskId
    // (listan saknar task-id — dokumenterat val).
    const r = (await this.klient.protokollFraga(
      "session/cancelBackgroundTask",
      { sessionId: this.sid, taskId },
      30_000,
    )) as { cancelled?: boolean; reason?: string; status?: string } | null;
    const avbruten = r?.cancelled === true;
    return {
      avbruten,
      meddelande: avbruten
        ? `Tasken avbruten (status: ${typeof r?.status === "string" ? r.status : "?"}).`
        : r?.reason || `Kunde ej avbryta tasken (status: ${typeof r?.status === "string" ? r.status : "?"}).`,
    };
  }

  async lasArbetsyta(): Promise<StudioArbetsytaInfo | null> {
    // readState kräver LEVANDE klient men EGEN session — som lasSessioner.
    this.klientForFraga(); // VÅG 90 K1: omstartsvakt
    try {
      const r = (await this.klient!.protokollFraga(
        "workspace/readState",
        { workspace: { workspaceKey: this.arbetskatalog, workspacePath: this.arbetskatalog } },
        30_000,
      )) as WorkspaceStateResult | null;
      const s = r?.settings;
      const mc = s?.model?.current;
      const modell =
        typeof mc === "string"
          ? mc
          : mc?.providerId && mc?.modelId
            ? `${mc.providerId}/${mc.modelId}`
            : undefined;
      return {
        arbetsyta: typeof r?.workspace?.workspacePath === "string" ? r.workspace.workspacePath : this.arbetskatalog,
        lage: typeof s?.mode?.current === "string" ? s.mode.current : undefined,
        modell,
        tankeNiva: typeof s?.thoughtLevel?.current === "string" ? s.thoughtLevel.current : undefined,
        behorighet: typeof s?.permission?.mode === "string" ? s.permission.mode : undefined,
        modellerTillgangliga: Array.isArray(s?.model?.available) ? s.model.available.length : undefined,
        kommandon: Array.isArray(r?.slashCommands) ? r.slashCommands.length : undefined,
      };
    } catch {
      return null; // workspaceinfo är lyx, aldrig ett fel
    }
  }

  // ── VÅG 93 C1 (kluster a+c+d): WORKSPACE-INSTÄLLNINGAR · PLUGINS-DRIFT ·
  // EVENTS-REPLAY (protokollformer ur V91-Z-PARITET-KARTA §1.1 #6/§1.2
  // #10-12/§1.3 #4 — setDefault*/setEnabled ej LIVE-bevisade, zod opak i
  // kartan: defensiva former + -32601 ⇒ StudioMetodSaknasError) ────────────

  async lasWorkspaceInstallningar(): Promise<StudioWorkspaceInstallningar | null> {
    // readState kräver LEVANDE klient men EGEN session (lasArbetsyta-
    // mönstret) — FULL defensiv parsning via den RENNA mapparen.
    this.klientForFraga();
    try {
      const r = await this.klient!.protokollFraga("workspace/readState", this.arbetsytaParams(), 30_000);
      return workspaceInstallningarUrState(r);
    } catch {
      return null; // läsningen är lyx — lasArbetsyta består som reserv
    }
  }

  async sparaStandardModell(modell: string | { providerId: string; modelId: string }): Promise<StudioSparadInstallning> {
    const ref = tolkaModellArgument(modell);
    this.klientForFraga();
    let svar: unknown;
    try {
      svar = await this.klient!.protokollFraga(
        "workspace/setDefaultModel",
        { ...this.arbetsytaParams(), model: { providerId: ref.providerId, modelId: ref.modelId } },
        30_000,
      );
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("workspace/setDefaultModel");
      throw fel;
    }
    // Eko ur svarets snapshot-form (→ settings) om protokollet bär den.
    const bekräftad = workspaceInstallningarUrState(svar).modell ?? `${ref.providerId}/${ref.modelId}`;
    return { satt: true, bekräftad, meddelande: "Standardmodellen sparad i arbetsytan — gäller nästa samtal." };
  }

  async sparaStandardTankestyrka(niva: string): Promise<StudioSparadInstallning> {
    const nivaRen = renInstallningsVarde(niva, "tankestyrka");
    this.klientForFraga();
    let svar: unknown;
    try {
      svar = await this.klient!.protokollFraga(
        "workspace/setDefaultThoughtLevel",
        { ...this.arbetsytaParams(), thoughtLevel: nivaRen },
        30_000,
      );
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("workspace/setDefaultThoughtLevel");
      throw fel;
    }
    const bekräftad = workspaceInstallningarUrState(svar).tankestyrka ?? nivaRen;
    return { satt: true, bekräftad, meddelande: "Standard-tankestyrkan sparad i arbetsytan — gäller nästa samtal." };
  }

  async sparaStandardLage(lage: string): Promise<StudioSparadInstallning> {
    const lageRen = renInstallningsVarde(lage, "lage");
    this.klientForFraga();
    let svar: unknown;
    try {
      svar = await this.klient!.protokollFraga(
        "workspace/setDefaultMode",
        { ...this.arbetsytaParams(), mode: lageRen },
        30_000,
      );
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("workspace/setDefaultMode");
      throw fel;
    }
    const bekräftad = workspaceInstallningarUrState(svar).lage ?? lageRen;
    return { satt: true, bekräftad, meddelande: "Standard-läget sparat i arbetsytan — gäller nästa samtal." };
  }

  // C2-sond-kompatibla alias (V93-P1-UNDERLAGets namnfamilj "sattStandard*"
  // — /api/studio/installningar sonderar dem FÖRE spara*): samma bryggor.
  sattStandardModell = async (
    modell: string | { providerId: string; modelId: string },
  ): Promise<StudioSparadInstallning> => this.sparaStandardModell(modell);
  sattStandardTankeNiva = async (niva: string): Promise<StudioSparadInstallning> =>
    this.sparaStandardTankestyrka(niva);
  sattStandardLage = async (lage: string): Promise<StudioSparadInstallning> => this.sparaStandardLage(lage);

  async pluginSattAktiverad(namn: string, aktiverad: boolean, omfattning?: string): Promise<StudioPluginAktiveradSvar> {
    const pluginId = typeof namn === "string" ? namn.trim().slice(0, 200) : "";
    if (!pluginId) throw new Error("plugin-id krävs (icke-tom sträng).");
    const paa = aktiverad === true;
    // Kartans form: {workspace, pluginId, enabled, scope} — underlagets
    // default är scope "workspace"; explicit "session" respekteras.
    const explicit = omfattning === "session" || omfattning === "workspace" ? omfattning : undefined;
    this.klientForFraga();
    const params: Record<string, unknown> = {
      ...this.arbetsytaParams(),
      pluginId,
      enabled: paa,
      scope: explicit ?? "workspace",
    };
    let svar: unknown;
    try {
      svar = await this.klient!.protokollFraga("plugins/setEnabled", params, 30_000);
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("plugins/setEnabled");
      const text = fel instanceof Error ? fel.message : String(fel);
      // zod-formen är OPAK i kartan: vårt scope-dekoratör kan vara den som
      // avvisas — EN retry UTAN scope-fältet, ENDAST när omfattning ej var
      // explicit given (annars vore retryn en annan skrivning).
      if (explicit === undefined && arSendFormAvvisad(text)) {
        try {
          svar = await this.klient!.protokollFraga(
            "plugins/setEnabled",
            { ...this.arbetsytaParams(), pluginId, enabled: paa },
            30_000,
          );
        } catch (fel2) {
          if (arMetodSaknas(fel2)) throw new StudioMetodSaknasError("plugins/setEnabled");
          throw fel2;
        }
      } else {
        throw fel;
      }
    }
    const bekräftad = pluginAktiveradUrSvar(svar, pluginId);
    return {
      satt: true,
      meddelande: paa ? `Pluginen ${pluginId} aktiverad.` : `Pluginen ${pluginId} inaktiverad.`,
      ...(bekräftad !== undefined ? { bekräftadAktiverad: bekräftad } : {}),
    };
  }

  async lasEventsFranSeq(sessionId: string, franSeq?: number, tak?: number): Promise<StudioEventsSvar | null> {
    // Sessions-id:t är protokollets egen identifierare — validera hårt.
    if (typeof sessionId !== "string" || !/^sess_[A-Za-z0-9._-]+$/.test(sessionId)) {
      throw new Error("Ogiltigt sessions-id.");
    }
    const fran = Number.isInteger(franSeq) && (franSeq as number) >= 0 ? (franSeq as number) : undefined;
    const grans = Math.min(
      Math.max(Number.isInteger(tak) && (tak as number) > 0 ? (tak as number) : MAX_EVENTS_TAK, 1),
      MAX_EVENTS_PER_FRAGA,
    );
    // session/events är en per-session LÄSNING (lasSessioner-mönstret) —
    // LEVANDE klient utan krav på EGEN session; replay gäller VALD session.
    this.klientForFraga();
    let svar: unknown;
    try {
      svar = await this.klient!.protokollFraga(
        "session/events",
        { sessionId, ...(fran !== undefined ? { afterSeq: fran } : {}), limit: grans },
        30_000,
      );
    } catch {
      // SOND-kontrakt (C1-mandatet): -32601 (metoden stöds ej av agent-
      // versionen) ⇒ NULL; övriga fel (timeout etc.) ⇒ NULL med — replay
      // är lyx och historik-vägen (session/messages) består. ALDRIG krasch.
      return null;
    }
    return eventsUrSvar(svar);
  }

  // ── VÅG 85 F2: skills/plugins/MCP — "vad agenten KAN" (kartan §2) ───────

  /**
   * Gemensam vakt för katalogläsningarna: LEVANDE klient utan krav på
   * session (lasSessioner-mönstret — metoden skapar ALDRIG en session).
   */
  private klientForLasning(): ProtokollKlient {
    return this.klientForFraga(); // VÅG 90 K1: omstartsvakten gäller läsningar med
  }

  /** Arbetsyta i protokollets Yo-form (workspaceKey = workspacePath, §0). */
  private arbetsytaParams(): Record<string, unknown> {
    return { workspace: { workspaceKey: this.arbetskatalog, workspacePath: this.arbetskatalog } };
  }

  async lasSkills(): Promise<StudioSkill[]> {
    try {
      const klient = this.klientForLasning();
      // BEVISAT schema (kartan §2 + v83-protokoll-live-test.mjs):
      // {workspace} → {authority, skills:[{id,name,description,path,
      // scope,enabled}]}. sessionId-parametern är valfri — katalogen är
      // workspace-auktoritativ utan den.
      const r = (await klient.protokollFraga(
        "skills/referenceCatalog",
        this.arbetsytaParams(),
        45_000,
      )) as SkillsCatalogResult | null;
      const lista = r?.skills;
      if (!Array.isArray(lista)) return [];
      const ut: StudioSkill[] = [];
      for (const s of lista) {
        // id är nyckeln ("glm:…" / "plugin:skill"); namn faller på id:t.
        const id = typeof s?.id === "string" && s.id ? s.id : "";
        if (!id) continue;
        ut.push({
          id,
          namn: typeof s.name === "string" && s.name ? s.name : id,
          beskrivning: typeof s.description === "string" && s.description ? s.description : undefined,
          omfattning: typeof s.scope === "string" && s.scope ? s.scope : undefined,
          sokvag: typeof s.path === "string" && s.path ? s.path : undefined,
          aktiv: typeof s.enabled === "boolean" ? s.enabled : undefined,
        });
      }
      return ut;
    } catch {
      return []; // katalogen är lyx, aldrig ett fel för panelen
    }
  }

  async lasPlugins(): Promise<StudioPlugin[]> {
    try {
      const klient = this.klientForLasning();
      // BEVISAT schema (kartan §2): {workspace} → {plugins:[{id,name,
      // description,version,enabled,source,skillCount,…}], diagnostics}.
      const r = (await klient.protokollFraga(
        "plugins/list",
        this.arbetsytaParams(),
        45_000,
      )) as PluginsListResult | null;
      const lista = r?.plugins;
      if (!Array.isArray(lista)) return [];
      const ut: StudioPlugin[] = [];
      for (const p of lista) {
        const id = typeof p?.id === "string" && p.id ? p.id : "";
        if (!id) continue;
        ut.push({
          id,
          namn: typeof p.name === "string" && p.name ? p.name : id,
          beskrivning: typeof p.description === "string" && p.description ? p.description : undefined,
          version: typeof p.version === "string" && p.version ? p.version : undefined,
          // VÅG 93 C1 (kluster c): aktiveringsstatus DEFENSIVT — enabled är
          // kartans §1.3 #1-form; när den är osatt tolkas disabled
          // (inverterad reservform). Osatta båda ⇒ inaktiv (äkta default).
          aktiv: p.enabled === true || (p.enabled === undefined && p.disabled === false),
          skillAntal: typeof p.skillCount === "number" ? p.skillCount : undefined,
          kalla: typeof p.source === "string" && p.source ? p.source : typeof p.marketplace === "string" && p.marketplace ? p.marketplace : undefined,
        });
      }
      // Aktiva först (grön prick-sektionen), sedan tillgängliga — stabil
      // ordning inom grupperna (protokollordning bevaras).
      return [...ut.filter((p) => p.aktiv), ...ut.filter((p) => !p.aktiv)];
    } catch {
      return []; // pluginlistan är lyx, aldrig ett fel för panelen
    }
  }

  async lasMcp(): Promise<StudioMcpServer[]> {
    try {
      const klient = this.klientForLasning();
      // BEVISAT schema (kartan §2, LIVE: 23 android-emulator-verktyg):
      // {workspace} → {statuses:Record<namn,{status,transport,toolCount,
      // updatedAt,error?}>}. mode:"connect" (tvingad anslutning) används
      // EJ — readState-raden i live-testet bevisade status utan den.
      const r = (await klient.protokollFraga("mcp/list", this.arbetsytaParams(), 45_000)) as
        | McpListResult
        | null;
      const statuses = r?.statuses;
      if (!statuses || typeof statuses !== "object") return [];
      const ut: StudioMcpServer[] = [];
      for (const [namn, s] of Object.entries(statuses)) {
        if (!namn || !s || typeof s !== "object") continue;
        // Defensiv verktygsnamnslista — kartan dokumenterar endast
        // toolCount; bär svaret namn (tools[]/toolNames[]) tolkas de.
        const namnLista = Array.isArray(s.tools)
          ? (s.tools as unknown[]).filter((t): t is string => typeof t === "string")
          : Array.isArray(s.toolNames)
            ? (s.toolNames as unknown[]).filter((t): t is string => typeof t === "string")
            : undefined;
        ut.push({
          namn,
          status: typeof s.status === "string" && s.status ? s.status : "unknown",
          transport: typeof s.transport === "string" && s.transport ? s.transport : undefined,
          verktygAntal: typeof s.toolCount === "number" ? s.toolCount : 0,
          fel: typeof s.error === "string" && s.error ? s.error : undefined,
          uppdaterad: typeof s.updatedAt === "string" && s.updatedAt ? s.updatedAt : undefined,
          ...(namnLista && namnLista.length > 0 ? { verktyg: namnLista } : {}),
        });
      }
      // Anslutna först, sedan misslyckade — panelens grön/röd ordning.
      return [...ut.filter((s) => s.status === "connected"), ...ut.filter((s) => s.status !== "connected")];
    } catch {
      return []; // MCP-listan är lyx, aldrig ett fel för panelen
    }
  }

  // ── VÅG 85 F3: usage/stats — "vad agenten KOSTAR (i tokens)" ─────────────

  async lasUsage(): Promise<StudioUsageSvar> {
    const klient = this.klientForLasning();
    // BEVISAT LIVE (kartan §2 + v83-protokoll-live-test.mjs: 8,35 M tokens
    // /7d): usage/stats {range:"7d"} → {range,generatedAt,timeZone,source,
    // summary:{…}, byModel?:[{modelId,totalTokens,share}]}. timeZones lämnas
    // osatt — protokollets egen default följer med i svaret.
    const råSvar = (await klient.protokollFraga("usage/stats", { range: "7d" }, 45_000)) as
      | UsageStatsResult
      | null;
    const summa = råSvar?.summary;
    const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
    const totalTokens = num(summa?.totalTokens) ?? 0;

    // ── 24 h-siffra — ärligaste källa först ─────────────────────────────────
    // 1) LIVE dailyModelUsage (prod-sond 2026-09-10): tokens PER DAG — sista
    //    dagsraden = senaste dagen ("idag" i protokollets dagsuppdelning;
    //    usage/stats har INGEN rullande 24 h-period, därför är detta den
    //    ärligaste närheten och märks "dagsrad" i UI:t).
    // 2) session/usage-summa över sessioner aktiva senaste 24 h (session/
    //    list-updatedAt; BEVISAT kartan §1) — tak 12 nyaste, parallellt.
    // 3) ÄRLIG reserv: dygnsmedelvärdet 7d/7 ("snitt"). ALDRIG påhittat.
    let totalTokens24h = 0;
    let kalla24h: "dagsrad" | "sessioner" | "snitt" | "okand" = "okand";
    const dagsrader = Array.isArray(råSvar?.dailyModelUsage) ? råSvar!.dailyModelUsage! : [];
    const sistaDag = dagsrader.length > 0 ? dagsrader[dagsrader.length - 1] : null;
    if (sistaDag && Array.isArray(sistaDag.models)) {
      totalTokens24h = sistaDag.models.reduce(
        (summa, m) => summa + (num(m?.totalTokens) ?? 0),
        0,
      );
      if (totalTokens24h > 0) kalla24h = "dagsrad";
    }
    /** session/list → {sid, modellId, tid} (best-effort; tom vid fel). */
    const lasSessioner = async (): Promise<{ sid: string; modellId?: string; tid: number }[]> => {
      try {
        const lista = (await klient.protokollFraga("session/list", { limit: 50 }, 30_000)) as
          | SessionListResult
          | null;
        const rader = Array.isArray(lista?.sessions) ? lista!.sessions! : [];
        return rader
          .map((s) => {
            const sid = typeof s.sessionId === "string" && s.sessionId ? s.sessionId : "";
            const tidRaw = s.updatedAt ?? s.updated ?? s.lastActiveAt;
            const tid = typeof tidRaw === "string" ? Date.parse(tidRaw) : NaN;
            return {
              sid,
              modellId:
                typeof s.model?.modelId === "string" && s.model.modelId ? s.model.modelId : undefined,
              tid,
            };
          })
          .filter((s) => s.sid && Number.isFinite(s.tid));
      } catch {
        return [];
      }
    };
    if (kalla24h === "okand") {
      const sessioner = await lasSessioner();
      const nu = Date.now();
      const aktiva24h = sessioner
        .filter((s) => nu - s.tid < 24 * 60 * 60 * 1000)
        .sort((a, b) => b.tid - a.tid)
        .slice(0, 12);
      if (aktiva24h.length > 0) {
        const delsummor = await Promise.all(
          aktiva24h.map(async ({ sid }) => {
            try {
              const u = (await klient.protokollFraga("session/usage", { sessionId: sid }, 12_000)) as
                | { totalTokens?: unknown }
                | null;
              return typeof u?.totalTokens === "number" && Number.isFinite(u.totalTokens)
                ? u.totalTokens
                : 0;
            } catch {
              return 0; // enskild session får aldrig döda uppskottningen
            }
          }),
        );
        totalTokens24h = delsummor.reduce((a, b) => a + b, 0);
        kalla24h = "sessioner";
      }
    }
    if (kalla24h === "okand" && totalTokens > 0) {
      totalTokens24h = Math.round(totalTokens / 7);
      kalla24h = "snitt";
    }

    // ── modellfördelning: LIVE models[] först, kartans byModel fallback ────
    const modeller: StudioUsageModell[] = [];
    const råModeller = Array.isArray(råSvar?.models)
      ? (råSvar!.models! as NonNullable<UsageStatsResult["models"]>)
      : Array.isArray(råSvar?.byModel)
        ? (råSvar!.byModel! as NonNullable<UsageStatsResult["byModel"]>)
        : [];
    for (const m of råModeller) {
      const id = typeof m?.modelId === "string" && m.modelId ? m.modelId : "";
      if (!id) continue;
      const tokens = num(m?.totalTokens) ?? 0;
      const share = num(m?.share);
      modeller.push({
        modell: id,
        tokens,
        andel:
          share !== undefined && share >= 0 && share <= 1
            ? share
            : totalTokens > 0
              ? tokens / totalTokens
              : 0,
        // LIVE models[] bär requestCount = ANTAL MODELLANROP (prod-sond:
        // glm-5.2=235 · glm-5.3=61 · glm-5.3-flash=44) — kartans äldre
        // byModel-form bär inget räknefält: 0 (ALDRIG påhittat).
        antal:
          num(m?.requestCount) ??
          num((m as NonNullable<UsageStatsResult["byModel"]>[number]).modelRequestCount) ??
          0,
      });
    }
    modeller.sort((a, b) => b.tokens - a.tokens);

    return {
      råSvar,
      totalTokens,
      inputTokens: num(summa?.inputTokens),
      outputTokens: num(summa?.outputTokens),
      reasoningTokens: num(summa?.reasoningTokens),
      cacheReadTokens: num(summa?.cacheReadTokens),
      cacheCreationTokens: num(summa?.cacheCreationTokens),
      cacheHitRate: num(summa?.cacheHitRate),
      totalSessions: num(summa?.totalSessions),
      totalTurns: num(summa?.totalTurns),
      toolCallCount: num(summa?.toolCallCount),
      modeller,
      generatedAt: typeof råSvar?.generatedAt === "string" ? råSvar.generatedAt : undefined,
      timeZone: typeof råSvar?.timeZone === "string" ? råSvar.timeZone : undefined,
      totalTokens24h,
      kalla24h,
    };
  }

  // ── V83 MEGA B1: filändringar (diff-panelens datakälla) ─────────────────

  async lasFilandringar(): Promise<StudioFilandring[]> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) return [];
    // VÅG 85 F4: v4-grenen är PRIMÄR (rikare: patch-hunkar med radnummer).
    // Hela kedjan måste lyckas (prenumeration + rader + fileChanges) —
    // VARJE fel ⇒ Write/Edit-motorn (bevisat bra, oförändrad v83-flöde).
    const v4 = await this.lasFilandringarV4();
    if (v4 !== null) return v4;
    try {
      // Senaste turnens Write/Edit/MultiEdit-delar bär hela diffunderlaget
      // (VBe §5) — se filandringarUrMessages. Diff är lyx: ALDRIG fel.
      const svar = await this.klient.protokollFraga(
        "session/messages",
        { sessionId: this.sid, limit: 60 },
        30_000,
      );
      return filandringarUrMessages(svar);
    } catch {
      return [];
    }
  }

  /**
   * VÅG 85 F4: filändringar ur v4-grenen (BEVISAT sond3 2026-09-09):
   * rowsRange → senaste "turnHeader"-raden → fileChanges med spårad
   * revision + färsk logEpoch. Returnerar null när v4-flödet ej kan
   * leverera (inte ansluten, inga rader, stale/timeout) — anroparen
   * faller då på Write/Edit-motorn. En tom lista är ett ÄRLIGT svar
   * ("inga ändringar denna turnen") — ALDRIG null.
   */
  private async lasFilandringarV4(): Promise<StudioFilandring[] | null> {
    if (!this.klient?.lever || !this.sid || !this.v4Ansluten || !this.v4LogEpoch) return null;
    try {
      // Färsk logEpoch + rader. TARGET = SENASTE turnHeader-raden (sond3:
      // toolCall-rader → proto.staleTarget, övriga → guard.actionUnavailable).
      const rr = (await this.klient.protokollFraga(
        "v4/conversation/rowsRange",
        { sessionId: this.sid, clientMode: "web-remote-replayable", limit: 100 },
        15_000,
      )) as { rows?: unknown[]; atLogEpoch?: unknown; atSeq?: unknown } | null;
      const logEpoch =
        typeof rr?.atLogEpoch === "string" && rr.atLogEpoch ? rr.atLogEpoch : this.v4LogEpoch;
      const rader = Array.isArray(rr?.rows) ? (rr!.rows as unknown[]) : [];
      let target: { rowId: number; entityId: string } | null = null;
      for (let i = rader.length - 1; i >= 0; i--) {
        const r = rader[i] as { kind?: unknown; rowId?: unknown; entityId?: unknown } | null;
        if (r?.kind === "turnHeader" && typeof r.rowId === "number" && typeof r.entityId === "string" && r.entityId) {
          target = { rowId: r.rowId, entityId: r.entityId };
          break;
        }
      }
      if (!target) return null; // inga samtalsrader ⇒ v4 har ingen diff att ge
      // baseRevision: den LIVE-spårade revisionen (state.updated-ramar).
      // Stale (revisionen hunnit gå vidare) ⇒ EN retry med atSeq som
      // kandidat — annars null (motorn tar över).
      const baser = [this.v4Revision];
      if (typeof rr?.atSeq === "number") baser.push(rr.atSeq);
      for (const basRevision of baser) {
        try {
          const fc = (await this.klient.protokollFraga(
            "v4/conversation/fileChanges",
            {
              sessionId: this.sid,
              target,
              baseRevision: basRevision,
              baseLogEpoch: logEpoch,
            },
            15_000,
          )) as {
            items?: {
              path?: unknown;
              additions?: unknown;
              deletions?: unknown;
              patches?: { oldStart?: unknown; oldLines?: unknown; newStart?: unknown; newLines?: unknown; lines?: unknown }[];
            }[];
          } | null;
          const items = Array.isArray(fc?.items) ? fc!.items! : [];
          const ut: StudioFilandring[] = [];
          for (const item of items.slice(0, MAX_FILER)) {
            const sokvag = typeof item.path === "string" && item.path ? item.path : null;
            if (!sokvag) continue;
            const raderUt: StudioRadandring[] = [];
            const punkter: { oldStart: number; oldLines: number; newStart: number; newLines: number; rader: string[] }[] = [];
            for (const p of Array.isArray(item.patches) ? item.patches : []) {
              const oldStart = typeof p.oldStart === "number" ? p.oldStart : 0;
              const oldLines = typeof p.oldLines === "number" ? p.oldLines : 0;
              const newStart = typeof p.newStart === "number" ? p.newStart : 0;
              const newLines = typeof p.newLines === "number" ? p.newLines : 0;
              const lines: string[] = [];
              for (const linje of Array.isArray(p.lines) ? p.lines : []) {
                if (typeof linje !== "string") continue;
                lines.push(linje.length > MAX_RADLANGD ? `${linje.slice(0, MAX_RADLANGD)}…` : linje);
                // Unified form: "+x" = tillagd, "−x" = borttagen, " x" =
                // kontext (ej med i ±-panelen).
                if (linje.startsWith("+")) {
                  raderUt.push({ typ: "+", text: linje.slice(1).slice(0, MAX_RADLANGD) });
                } else if (linje.startsWith("-")) {
                  raderUt.push({ typ: "-", text: linje.slice(1).slice(0, MAX_RADLANGD) });
                }
              }
              if (lines.length > 0) {
                punkter.push({ oldStart, oldLines, newStart, newLines, rader: lines.slice(0, 120) });
              }
            }
            ut.push({
              sokvag,
              plus: typeof item.additions === "number" ? item.additions : raderUt.filter((r) => r.typ === "+").length,
              minus: typeof item.deletions === "number" ? item.deletions : raderUt.filter((r) => r.typ === "-").length,
              rader: raderUt.slice(0, MAX_RADER_PER_FIL),
              ...(punkter.length > 0 ? { punkter: punkter.slice(0, 40) } : {}),
            });
          }
          return ut; // ÄRLIGT v4-svar (tom lista = inga ändringar)
        } catch (fel) {
          const text = fel instanceof Error ? fel.message : String(fel);
          if (!text.includes("stale")) throw fel; // ej ett stale-fel → ge upp v4
          // stale → pröva nästa base-kandidat (sista varvet = ge upp → null)
        }
      }
      return null;
    } catch {
      return null; // v4 otillgängligt/timeout — Write/Edit-motorn tar över
    }
  }

  // ── V83 MEGA B2: permission- och interaktionsskikt (Z-portaLens) ────────

  /**
   * Server→klient-request ur interaktionsdomänen (kartan §3). Returnerar
   * protokollets result-objekt via ett promise som löser när användaren
   * svarar i UI:t — eller 30 s-defaulten (permission: escalate, fråga:
   * cancelled) så sessionen aldrig hänger. null = metoden stöds ej.
   */
  private async paServerRequest(metod: string, parametrar: unknown): Promise<unknown | null> {
    if (metod !== "interaction/requestPermission" && metod !== "interaction/requestUserInput") {
      return null;
    }
    const p = parametrar as {
      requestId?: unknown;
      toolName?: unknown;
      input?: unknown;
      reason?: unknown;
      riskLevel?: unknown;
      options?: unknown;
      toolCallId?: unknown;
      prompt?: unknown;
      inputType?: unknown;
      choices?: unknown;
    };
    // Nyckel: protokollets requestId (fallback toolCallId/tid — requestUserInput-
    // och permission-schemat bär båda requestId, kartan §3).
    const nyckel =
      typeof p.requestId === "string" && p.requestId
        ? p.requestId
        : typeof p.toolCallId === "string" && p.toolCallId
          ? `tc-${p.toolCallId}`
          : `imp-${Date.now().toString(36)}`;

    if (metod === "interaction/requestPermission") {
      // VÅG 94 B: AUTO-POLICY FÖRST — serversides snabbventil (se
      // permissions-policy.ts). Bevisat prod-problem: agentens Write/Bash-
      // skärningar fastnade i webbläsardialogen → headless/mål-läge/bak-
      // grundsarbete nekades efter 30 s ("agenten stannar vid varje
      // skrivning"). allow ⇒ protokollsvaret direkt (samma z2-form som
      // svarPermission:s allow_once), deny ⇒ nekande svar + status-event
      // till lyssnarna, frag/null ⇒ befintligt dialogflöde nedan.
      const policy = autoPolicySvar(metod, parametrar, this.arbetskatalog);
      if (policy?.beslut === "allow") {
        this.notiferaInteraktion({
          typ: "status",
          text: `Auto-policy tillät: ${policy.skal ?? "vitlistat verktygsanrop"}`,
        });
        return { decision: "allow", reason: `allow_once via ak1a-studio auto-policy: ${policy.skal ?? "okänt skäl"}` };
      }
      if (policy?.beslut === "deny") {
        this.notiferaInteraktion({
          typ: "status",
          text: `Auto-policy nekade: ${policy.skal ?? "otillåtet verktygsanrop"}`,
        });
        return { decision: "deny", reason: `ak1a-studio auto-policy nekade: ${policy.skal ?? "otillåtet verktygsanrop"}` };
      }

      const fardigaSvar = new Map<string, unknown>();
      const alternativ: StudioPermissionAlternativ[] = [];
      if (Array.isArray(p.options)) {
        for (const o of p.options as {
          optionId?: unknown;
          name?: unknown;
          description?: unknown;
          response?: unknown;
        }[]) {
          if (typeof o?.optionId !== "string" || !o.optionId) continue;
          alternativ.push({
            optionId: o.optionId,
            namn: typeof o.name === "string" && o.name ? o.name : o.optionId,
            beskrivning: typeof o.description === "string" && o.description ? o.description : undefined,
          });
          if (o.response && typeof o.response === "object") fardigaSvar.set(o.optionId, o.response);
        }
      }
      if (alternativ.length === 0) {
        // Defensiv: schemat lovar options — annars kan UI:t ändå svara.
        alternativ.push({ optionId: "allow_once", namn: "Allow once" }, { optionId: "deny", namn: "Deny" });
      }
      const verktyg = typeof p.toolName === "string" && p.toolName ? p.toolName : "okänt verktyg";
      return this.registreraInteraktion(
        {
          typ: "permission",
          requestId: nyckel,
          verktyg,
          risk: typeof p.riskLevel === "string" && p.riskLevel ? p.riskLevel : "medium",
          skäl: typeof p.reason === "string" && p.reason ? p.reason : undefined,
          sammanfattning: sammanfattaInput(p.input),
          alternativ,
          // V84 C: diff ur den RÅA inputen (Write/Edit/MultiEdit) — beräknas
          // INNAN sammanfattaInput-trunkeringen så förhandsvisningen är hel.
          diff: diffUrInput(verktyg, p.input) ?? undefined,
        },
        {
          fardigaSvar,
          verktygNamn: verktyg,
          // KVD-DEFAULT: escalate — beslutet lämnas till servern men
          // sessionen hänger ALDRIG på en obesvarad dialog.
          standard: () => ({ decision: "escalate", reason: "ak1a-studio: inget klient-svar inom 30 s" }),
          standardBeslut: "eskal",
        },
      );
    }

    // interaction/requestUserInput {requestId, prompt, inputType?, choices?}
    const val: string[] = [];
    if (Array.isArray(p.choices)) {
      for (const c of p.choices) {
        if (typeof c === "string" && c) val.push(c);
      }
    }
    return this.registreraInteraktion(
      {
        typ: "fråga",
        requestId: nyckel,
        fråga: typeof p.prompt === "string" && p.prompt ? p.prompt : "Agenten väntar på svar",
        inputTyp: typeof p.inputType === "string" && p.inputType ? p.inputType : undefined,
        val: val.length > 0 ? val : undefined,
      },
      {
        // Timeout-default: cancelled (kartan §3-svar {cancelled:true}).
        standard: () => ({ cancelled: true }),
        standardBeslut: "avbruten",
      },
    );
  }

  /**
   * Registrera (eller re-annonsera — request-id kan skickas om, kartan §3)
   * en interaktion: notifiera den aktiva promptens ström (SSE → dialogkort)
   * + starta 30 s-defaulten. Returnerar promise: protokollsvaret.
   */
  private registreraInteraktion(
    interaktion: StudioInteraktion,
    opts: {
      fardigaSvar?: Map<string, unknown>;
      verktygNamn?: string;
      standard: () => unknown;
      standardBeslut: string;
    },
  ): Promise<unknown> {
    const befintlig = this.interaktioner.get(interaktion.requestId);
    if (befintlig && !befintlig.besvarad) {
      // Re-announce: visa dialogen igen, lös INTE ut en andra 30 s-räknare.
      this.notiferaInteraktion({ typ: "interaktion", interaktion: befintlig.interaktion });
      return new Promise((los) => befintlig.losare.push(los));
    }
    const post: VantanInteraktion = {
      interaktion,
      fardigaSvar: opts.fardigaSvar ?? new Map(),
      verktygNamn: opts.verktygNamn ?? "",
      losare: [],
      timer: null as unknown as ReturnType<typeof setTimeout>,
      besvarad: false,
    };
    post.timer = setTimeout(() => {
      this.besvaraInteraktion(interaktion.requestId, opts.standard(), opts.standardBeslut, "ingen respons inom 30 s");
    }, 30_000);
    this.interaktioner.set(interaktion.requestId, post);
    this.notiferaInteraktion({ typ: "interaktion", interaktion });
    return new Promise((los) => post.losare.push(los));
  }

  /** Lös en interaktion: skicka svaret till protokollet + stäng UI-kortet. */
  private besvaraInteraktion(
    requestId: string,
    result: unknown,
    beslut: string,
    skal?: string,
  ): boolean {
    const post = this.interaktioner.get(requestId);
    if (!post || post.besvarad) return false;
    post.besvarad = true;
    clearTimeout(post.timer);
    this.interaktioner.delete(requestId);
    for (const los of post.losare) los(result);
    this.notiferaInteraktion({
      typ: "interaktionsKlar",
      requestId,
      beslut,
      ...(skal ? { skal } : {}),
    });
    return true;
  }

  /** Interaktionsnotis till aktiv prompt-ström — registret lever alltid. */
  private notiferaInteraktion(event: StudioEvent): void {
    const aktiv = this.aktiv;
    if (!aktiv || aktiv.färdig) return;
    try {
      aktiv.lyssnare(event);
    } catch {
      // strömmen bruten — 30 s-defaulten fångar upp
    }
  }

  /** Lös ALLA väntande interaktioner (session kasseras/stängs). */
  private rensaVantandeInteraktioner(): void {
    for (const [nyckel, post] of [...this.interaktioner]) {
      if (post.besvarad) continue;
      this.besvaraInteraktion(
        nyckel,
        post.interaktion.typ === "permission"
          ? { decision: "deny", reason: "ak1a-studio: sessionen kasserades" }
          : { cancelled: true },
        "avbruten",
        "sessionen byttes",
      );
    }
  }

  vantaInteraktioner(): StudioInteraktion[] {
    return [...this.interaktioner.values()].map((p) => p.interaktion);
  }

  async svarPermission(
    requestId: string,
    alternativId: string,
  ): Promise<{ ok: boolean; beslut: string; skäl?: string }> {
    const post = this.interaktioner.get(requestId);
    if (!post || post.besvarad || post.interaktion.typ !== "permission") {
      return { ok: false, beslut: "okänd", skäl: "begäran finns ej eller är redan besvarad" };
    }
    this.senasteAktivTid = Date.now(); // VÅG 90 K1: användarsvar = aktivitet
    // Bygg z2-svaret: protokollets förslagade response vinner om den finns,
    // annars mappas de bevisade optionId:n till beslutsformerna (kartan §3:
    // allow_project motsvaras av permissionUpdates addRules allow).
    const etikett =
      alternativId === "allow_once"
        ? "tillåtet en gång"
        : alternativId === "allow_project"
          ? "tillåtet för projektet"
          : alternativId === "deny"
            ? "nekat"
            : alternativId;
    const result =
      post.fardigaSvar.get(alternativId) ??
      ((): unknown => {
        switch (alternativId) {
          case "allow_once":
            return { decision: "allow", reason: "allow_once via ak1a-studio" };
          case "allow_project":
            return {
              decision: "allow",
              reason: "allow_project via ak1a-studio",
              permissionUpdates: [
                { type: "addRules", behavior: "allow", rules: [{ toolName: post.verktygNamn }] },
              ],
            };
          case "deny":
            return { decision: "deny", reason: "deny via ak1a-studio" };
          default:
            return { decision: "deny", reason: `okänt alternativ ${alternativId.slice(0, 40)}` };
        }
      })();
    this.besvaraInteraktion(requestId, result, etikett);
    return { ok: true, beslut: etikett };
  }

  async svarFraga(requestId: string, svar: { varde?: string; avbruten?: boolean }): Promise<{ ok: boolean }> {
    const post = this.interaktioner.get(requestId);
    if (!post || post.besvarad || post.interaktion.typ !== "fråga") return { ok: false };
    this.senasteAktivTid = Date.now(); // VÅG 90 K1: användarsvar = aktivitet
    const result = svar.avbruten
      ? { cancelled: true }
      : { value: typeof svar.varde === "string" ? svar.varde : "" };
    this.besvaraInteraktion(requestId, result, svar.avbruten ? "avbruten" : "besvarad");
    return { ok: true };
  }

  async sattLage(lage: "build" | "plan"): Promise<{ lage: string }> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    // BEVISAT LIVE (kartan §1): session/setMode {sessionId, mode} → snapshot.
    const svar = await this.klient.protokollFraga(
      "session/setMode",
      { sessionId: this.sid, mode: lage },
      30_000,
    );
    const bekräftad = lasLageUrSnapshot(svar) ?? lage;
    this.lage = lage;
    this.sparaPersistens(this.sid);
    return { lage: bekräftad };
  }

  async sattTankeNiva(niva: string): Promise<{ niva: string }> {
    // LIVE-bevisade nivåer (kartan §1): nothink | high | max. KVD-texten
    // "off/medium/high" är generisk protokollterminologi — de ÄRLIGA,
    // first-hand bevisade nivåerna för zai/GLM är dessa tre.
    if (!["nothink", "high", "max"].includes(niva)) {
      throw new Error(`Okänd tankestyrka "${niva.slice(0, 30)}" — använd nothink, high eller max.`);
    }
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    // BEVISAT LIVE (kartan §1): session/setThoughtLevel → snapshot.
    const svar = await this.klient.protokollFraga(
      "session/setThoughtLevel",
      { sessionId: this.sid, thoughtLevel: niva },
      30_000,
    );
    const bekräftad = lasTankeNivaUrSnapshot(svar) ?? niva;
    this.tankeNiva = niva;
    this.sparaPersistens(this.sid);
    return { niva: bekräftad };
  }

  /**
   * V83 B1 (kartan §4A + LIVE-sond tool-results/v83-b1-toolupdated-sond.mjs
   * 2026-09-09) — VÅG 85 F1: UTBRUTEN ur påNotis så mål-loopen delar EXAKT
   * samma verktygskorts-mappning: kinds scheduled/started/progress/result/
   * error, merge på toolCallId. SONDFAKTA: kind "result" bär {toolCallId,
   * result, duration} UTAN toolName — namnet skickas DÄRFÖR bara när
   * protokollet säger det (UI:t:s merge skriver aldrig över "Bash" med
   * "verktyg"); kind "scheduled" bär enbart inputRef (inputOmitted) —
   * argumenten kommer via model.streaming tool_call.
   */
  private sändVerktygKort(
    payload: SessionEventParams["payload"],
    lyssnare: StudioLyssnare,
  ): void {
    const kind = payload?.kind;
    const id =
      typeof payload?.toolCallId === "string" && payload.toolCallId
        ? payload.toolCallId
        : `tc-ingen-id-${this.okandaVerktyg++}`;
    const namn =
      typeof payload?.toolName === "string" && payload.toolName ? payload.toolName : undefined;
    if (kind === "scheduled") {
      lyssnare({
        typ: "verktyg_kort",
        id,
        ...(namn ? { namn } : {}),
        steg: "planerad",
        argument: argumentText(payload?.input),
        beskrivning: typeof payload?.description === "string" ? payload.description : undefined,
      });
      // Bakåtkompatibel chip-rad (v81-UI) lever kvar.
      if (namn) lyssnare({ typ: "verktyg", namn, händelse: "start" });
    } else if (kind === "started") {
      lyssnare({
        typ: "verktyg_kort",
        id,
        ...(namn ? { namn } : {}),
        steg: "startar",
      });
    } else if (kind === "progress") {
      lyssnare({
        typ: "verktyg_kort",
        id,
        ...(namn ? { namn } : {}),
        steg: "kör",
        framsteg: {
          elapsedMs: typeof payload?.elapsedMs === "number" ? payload.elapsedMs : undefined,
          utdata:
            typeof payload?.stdoutTail === "string" && payload.stdoutTail
              ? truncat(payload.stdoutTail, MAX_PROGRESS_TEEKEN)
              : typeof payload?.stderrTail === "string" && payload.stderrTail
                ? truncat(payload.stderrTail, MAX_PROGRESS_TEEKEN)
                : undefined,
        },
      });
    } else if (kind === "result") {
      lyssnare({
        typ: "verktyg_kort",
        id,
        ...(namn ? { namn } : {}),
        steg: "resultat",
        resultat: resultatText(payload?.result),
        varaktighetMs: typeof payload?.duration === "number" ? payload.duration : undefined,
      });
      if (namn) lyssnare({ typ: "verktyg", namn, händelse: "slut" });
    } else if (kind === "error") {
      lyssnare({
        typ: "verktyg_kort",
        id,
        ...(namn ? { namn } : {}),
        steg: "fel",
        fel: felText(payload?.error),
      });
      if (namn) lyssnare({ typ: "verktyg", namn, händelse: "slut" });
    }
  }

  /**
   * VÅG 85 F1: händelsehanterare för MÅL-LOOPEN (påNotis dirigerar hit när
   * målet är aktivt och ingen klientprompt strömmar). Varje protokoll-turn
   * blir: mal_iteration(start) → SAMMA streaming-/verktygskort-event som en
   * chattad turn → runda(slut) + mal_iteration(slut) med iterationsnumret
   * (KVD: räknaren lever i transporten; turn.completed ⇒ mal_iteration).
   * SLUT-pixeln ger ALDRIG "klart" — loopen fortsätter tills paus/rensa;
   * en misslyckad iteration (resultType ≠ success) markeras ärligt i
   * eventet men dödar inte loopen.
   */
  private hanteraMalEvent(typ: string, payload: SessionEventParams["payload"]): void {
    switch (typ) {
      case "turn.started":
        this.malTurnOppen = true;
        this.malIteration += 1;
        this.malSenasteText = "";
        // VÅG 91 A1a: MOTORN markerar iterationen i sessionskartan — inte
        // SSE-routen — så autonomt arbete syns i historiken ÄVEN när ingen
        // klient är ansluten (kartan debounce-skrivs till disk, H2).
        markeraMalIterationStart(this.sid);
        this.sändMalEvent({ typ: "mal_iteration", fas: "start", iteration: this.malIteration });
        this.sändMalEvent({ typ: "runda", fas: "start" });
        this.sändMalEvent({
          typ: "status",
          text: `Agenten utvecklar autonomt — iteration ${this.malIteration}…`,
        });
        return;
      case "tool.updated":
        this.sändVerktygKort(payload, (event) => this.sändMalEvent(event));
        return;
      case "part.delta":
        // Defensivt (kartan §4A): field "input" = verktygsargument strömmas.
        if (payload?.field === "input" && typeof payload?.delta === "string" && payload.delta) {
          this.sändMalEvent({
            typ: "verktyg_input",
            id: typeof payload?.partId === "string" && payload.partId ? payload.partId : "live",
            text: payload.delta,
          });
        }
        return;
      case "model.streaming": {
        // tool_input_delta strömmar argumenten MEDAN modellen skriver dem;
        // tool_call lever hela paketet (samma tolkning som promptvägen).
        const kind = typeof payload?.kind === "string" ? payload.kind : "";
        if (kind === "tool_input_delta" && typeof payload?.delta === "string" && payload.delta) {
          this.sändMalEvent({
            typ: "verktyg_input",
            id:
              typeof payload?.toolCallId === "string" && payload.toolCallId
                ? payload.toolCallId
                : "live",
            text: payload.delta,
          });
          return;
        }
        if (kind === "tool_call") {
          this.sändMalEvent({
            typ: "verktyg_kort",
            id:
              typeof payload?.toolCallId === "string" && payload.toolCallId
                ? payload.toolCallId
                : `tc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            namn:
              typeof payload?.toolName === "string" && payload.toolName
                ? payload.toolName
                : "verktyg",
            steg: "planerad",
            argument: argumentText(payload?.input),
          });
          return;
        }
        if (typeof payload?.delta !== "string" || !payload.delta) return;
        this.sändMalEvent({
          typ: "delta",
          kanal: payload.kind === "reasoning_delta" ? "tankar" : "text",
          text: payload.delta,
        });
        if (payload.kind !== "reasoning_delta") this.malSenasteText += payload.delta;
        return;
      }
      case "model.response.completed":
        // Helheten — fallback om turn.completed bär tom response.
        if (typeof payload?.content === "string" && payload.content) {
          this.malSenasteText = payload.content;
        }
        return;
      case "turn":
      case "turn.completed": {
        // KVD-PIXELN: turn.completed i mål-loopen ⇒ mal_iteration(slut)
        // med iterationsnummer + rundstatistik ("turn" = äldre form).
        // E2E-FYND (prod 2026-09-10): om starteventet missats (startedTurn-
        // racet före mål-state:t sattes) räknas iterationen upp HÄR och en
        // EFTERHANDS-syntetiserad start skickas FÖRE slut-pixeln — varje
        // avslutad iteration får därmed alltid sitt start/slut-par (UI:t
        // öppnar+färdigställer bubblan; svaret bär turn.completed.response).
        if (!this.malTurnOppen) {
          this.malIteration += 1;
          // VÅG 91 A1a: den EFTERHANDS-syntetiserade starten markeras i
          // kartan också (startedTurn-racet — se ovan).
          markeraMalIterationStart(this.sid);
          this.sändMalEvent({ typ: "mal_iteration", fas: "start", iteration: this.malIteration });
        }
        this.malTurnOppen = false;
        this.sändMalEvent({
          typ: "runda",
          fas: "slut",
          varaktighetMs: typeof payload?.duration === "number" ? payload.duration : undefined,
          resultatTyp: typeof payload?.resultType === "string" ? payload.resultType : undefined,
          verktygAntal: typeof payload?.toolCallCount === "number" ? payload.toolCallCount : undefined,
          tokenCount: typeof payload?.tokenCount === "number" ? payload.tokenCount : undefined,
        });
        const malSvar =
          typeof payload?.response === "string" && payload.response
            ? payload.response
            : this.malSenasteText || "";
        // VÅG 91 A1a: MOTORN sparar iterationens svar i kartan (assistant-
        // post med 🎯-prefix) — historiken vid återkomst är komplett även
        // om klienten lämnat sidan mitt i jobbet.
        markeraMalIterationSlut(this.sid, this.malIteration, malSvar);
        this.sändMalEvent({
          typ: "mal_iteration",
          fas: "slut",
          iteration: this.malIteration,
          svar: malSvar || undefined,
          resultatTyp: typeof payload?.resultType === "string" ? payload.resultType : undefined,
          verktygAntal: typeof payload?.toolCallCount === "number" ? payload.toolCallCount : undefined,
          tokenCount: typeof payload?.tokenCount === "number" ? payload.tokenCount : undefined,
          varaktighetMs: typeof payload?.duration === "number" ? payload.duration : undefined,
        });
        return;
      }
      default: {
        // Verktygshändelser (tool.* — namn varierar mellan versioner).
        if (typ.startsWith("tool.")) {
          const namn = payload?.name || payload?.toolName || "verktyg";
          const slut = /finish|completed|ended|result$/i.test(typ);
          this.sändMalEvent({ typ: "verktyg", namn, händelse: slut ? "slut" : "start" });
        }
        return;
      }
    }
  }

  /** Notis-mottagare: översätter protokollhändelser till StudioEvent. */
  private påNotis(m: ProtokollMeddelande): void {
    this.senasteAktivTid = Date.now(); // VÅG 90 K1: protokollpuls = aktivitet
    const aktiv = this.aktiv;
    const params = m.params as SessionEventParams | StateUpdatedParams | undefined;

    // VÅG 85 F4: v4-grenens ramar (BEVISAT sond2/3) — kommer SOM EGNA
    // notiser (ej i session/event-strömmen, kartan §4F). En "complete"-ram
    // bär frame.payload.deltas[] där op "state.updated" + patch.revision
    // är KÄLLAN för fileChanges baseRevision (≠ rowsRange.atSeq!). Spåras
    // ALWAYS (även utan pågående prompt — revisionen lever mellan turner).
    if (m.method === "v4/conversation/frame") {
      const p = m.params as { topic?: unknown; kind?: unknown; frame?: { payload?: { deltas?: unknown[] } } } | undefined;
      if (p?.topic === `conversation/${this.sid}` && p?.frame?.payload?.deltas) {
        for (const d of p.frame.payload.deltas as { op?: unknown; patch?: { revision?: unknown } }[]) {
          if (d?.op === "state.updated" && typeof d.patch?.revision === "number") {
            this.v4Revision = Math.max(this.v4Revision, d.patch.revision);
          }
        }
      }
      return; // v4-ramar konsumeras här — aldrig vidare till chattströmmen
    }

    if (m.method === "session/event") {
      const p = params as SessionEventParams | undefined;
      const payload = p?.payload;
      // ROTORSAK v81-STUDIO-2 (bevisat live 2026-09-09): zcode ≥ 3.11.2-22
      // lägger händelsetypen på PARAMS-nivå (params.type), inte i payload —
      // gamla koden läste payload.type och tappade därmed ALLA events
      // (deltas kom aldrig fram; strömmen stod stilla). Fallback till
      // payload.type behålls för äldre protokollform.
      const typ = p?.type ?? payload?.type;
      if (!typ) return;
      // Event från annan session än den aktva (t.ex. en kasserad session
      // under självläknings-omskapandet) skall aldrig blandas in.
      if (p?.sessionId && this.sid && p.sessionId !== this.sid) return;
      // VÅG 85 F1: MÅL-LOOPEN — utan pågående KLIENVPROMPT äger ett AKTIVT
      // mål strömmen: protokollet matar nya turner av sig självt (v83 B3-
      // bevis) och ALLA händelser (streaming, verktygskort, rundor) går
      // till mål-lyssnaren så varje autonom iteration renderas som en
      // KOMPLETT turn i chatten. En pågående klientprompt vinner ALWAYS
      // (mål-turner körs inte samtidigt — serverns -32010-serialisering).
      if (this.malAktiv && !this.malPausad && (!aktiv || aktiv.färdig)) {
        this.hanteraMalEvent(typ, payload);
        return;
      }
      if (!aktiv || aktiv.färdig) return; // utanför pågående prompt: strunt

      switch (typ) {
        case "turn.started":
          // V83 B1: rundstatistik — fas "start" (turnNumber finns i payload).
          aktiv.lyssnare({ typ: "runda", fas: "start" });
          aktiv.lyssnare({ typ: "status", text: "Agenten arbetar…" });
          return;
        case "tool.updated": {
          // V83 B1 (kartan §4A + LIVE-sond tool-results/v83-b1-toolupdated-
          // sond.mjs 2026-09-09): kinds scheduled/started/progress/result/
          // error — varje verktygskall blir ett kort (merge på toolCallId).
          // VÅG 85 F1: mappningen är DELAD med mål-loopen (sändVerktygKort)
          // så en autonom iteration får EXAKT samma kort som en chattad
          // turn. SONDFAKTOR kvarstår: kind "result" bär {toolCallId,
          // result, duration} UTAN toolName; kind "scheduled" bär enbart
          // inputRef (inputOmitted) — argumenten kommer via model.streaming
          // tool_call.
          this.sändVerktygKort(payload, aktiv.lyssnare);
          return;
        }
        case "part.delta": {
          // Defensivt (kartan §4A): part.delta field "input" = verktygs-
          // argument strömmas i partedeln — samma live-vy som tool_input.
          if (payload?.field === "input" && typeof payload?.delta === "string" && payload.delta) {
            aktiv.lyssnare({
              typ: "verktyg_input",
              id: typeof payload?.partId === "string" && payload.partId ? payload.partId : "live",
              text: payload.delta,
            });
          }
          return;
        }
        case "model.streaming": {
          // V83 B1: tool_input_delta strömmar argumenten MEDAN modellen
          // skriver dem ("läser fil X…") — tool_call lever hela paketet.
          const kind = typeof payload?.kind === "string" ? payload.kind : "";
          if (kind === "tool_input_delta" && typeof payload?.delta === "string" && payload.delta) {
            aktiv.lyssnare({
              typ: "verktyg_input",
              id:
                typeof payload?.toolCallId === "string" && payload.toolCallId
                  ? payload.toolCallId
                  : "live",
              text: payload.delta,
            });
            return;
          }
          if (kind === "tool_call") {
            aktiv.lyssnare({
              typ: "verktyg_kort",
              id:
                typeof payload?.toolCallId === "string" && payload.toolCallId
                  ? payload.toolCallId
                  : `tc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              namn:
                typeof payload?.toolName === "string" && payload.toolName
                  ? payload.toolName
                  : "verktyg",
              steg: "planerad",
              argument: argumentText(payload?.input),
            });
            return;
          }
          if (typeof payload?.delta !== "string" || !payload.delta) return;
          aktiv.lyssnare({
            typ: "delta",
            kanal: payload.kind === "reasoning_delta" ? "tankar" : "text",
            text: payload.delta,
          });
          if (payload.kind !== "reasoning_delta") aktiv.senasteText += payload.delta;
          return;
        }
        case "model.response.completed":
          // Helheten — sparas som fallback om sluteventet uteblir.
          if (typeof payload?.content === "string" && payload.content) {
            aktiv.senasteText = payload.content;
          }
          return;
        case "turn":
        case "turn.completed": {
          // SLUTPIXEL (bevisat live 2026-09-09): params.type "turn.completed"
          // med payload.response = hela svaret ("turn" = äldre form).
          aktiv.färdig = true;
          // V83 B1: rundstatistiken FÖRE klart-pixeln (duration, resultType,
          // toolCallCount — kartan §4A turn.completed-payload).
          aktiv.lyssnare({
            typ: "runda",
            fas: "slut",
            varaktighetMs: typeof payload?.duration === "number" ? payload.duration : undefined,
            resultatTyp: typeof payload?.resultType === "string" ? payload.resultType : undefined,
            verktygAntal: typeof payload?.toolCallCount === "number" ? payload.toolCallCount : undefined,
            tokenCount: typeof payload?.tokenCount === "number" ? payload.tokenCount : undefined,
          });
          if (typeof payload?.resultType === "string" && payload.resultType !== "success") {
            // Ärligt fel i stället för tomt "klart" (ALDRIG tystnad).
            aktiv.lyssnare({
              typ: "fel",
              meddelande: `Agentrundan avslutades utan lyckat resultat (${payload.resultType}).`,
            });
          } else {
            aktiv.lyssnare({
              typ: "klart",
              svar:
                typeof payload?.response === "string" && payload.response
                  ? payload.response
                  : aktiv.senasteText,
              tokenCount: typeof payload?.tokenCount === "number" ? payload.tokenCount : undefined,
              varaktighetMs: typeof payload?.duration === "number" ? payload.duration : undefined,
            });
          }
          aktiv.klar();
          return;
        }
        default: {
          // Verktygshändelser (tool.* — namn varierar mellan versioner):
          // start när typen inte slutar på finish/completed/ended.
          if (typ.startsWith("tool.")) {
            const namn = payload?.name || payload?.toolName || "verktyg";
            const slut = /finish|completed|ended|result$/i.test(typ);
            aktiv.lyssnare({ typ: "verktyg", namn, händelse: slut ? "slut" : "start" });
          }
          return;
        }
      }
    }

    if (m.method === "state.updated") {
      const patch = (params as StateUpdatedParams | undefined)?.patch;
      const status = patch?.status;
      // Compact-väckare: kompakteringsturnen slutar med idle (BEVISAT v82 —
      // broadcasten kommer även utan pågående prompt).
      if (status === "idle" && this.idleVakt) this.idleVakt();
      // VÅG 85 F1: mål-loopens puls — running utan klientprompt blir ett
      // status-event på mål-strömmen (bannerns "arbetar"-text mellan
      // turn-pixlar). idle tigs STILLA (mellan iterationer vilar loopen).
      if (
        status === "running" &&
        this.malAktiv &&
        !this.malPausad &&
        (!this.aktiv || this.aktiv.färdig)
      ) {
        this.sändMalEvent({
          typ: "status",
          text: `Agenten utvecklar autonomt — iteration ${Math.max(1, this.malIteration)}…`,
        });
      }
      if (!aktiv || aktiv.färdig) return;
      if (status === "running") {
        // V83 B1: state.updated-patchen kan bära projektionen (tasks) —
        // räkna aktiva verktyg för en ärlig "arbetar"-rad.
        const aktivaVerktyg = Array.isArray(patch?.activeToolCalls) ? patch.activeToolCalls.length : 0;
        const bakgrund = Array.isArray(patch?.backgroundJobs) ? patch.backgroundJobs.length : 0;
        const extra = aktivaVerktyg > 0 ? ` (${aktivaVerktyg} verktyg kör)` : bakgrund > 0 ? ` (+${bakgrund} bakgrund)` : "";
        aktiv.lyssnare({ typ: "status", text: `Agenten arbetar…${extra}` });
      } else if (status === "idle") {
        // Fallback-slut: "turn"-eventet är primärt; idle efter 1,5 s utan
        // det betyder ändå att agenten är klar (bevisad ordning i testerna).
        setTimeout(() => {
          if (this.aktiv === aktiv && !aktiv.färdig) {
            aktiv.färdig = true;
            aktiv.lyssnare({ typ: "klart", svar: aktiv.senasteText });
            aktiv.klar();
          }
        }, 1_500);
      }
    }
  }

  async historik(): Promise<StudioHistorikPost[]> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) return [];
    try {
      const svar = await this.klient.protokollFraga(
        "session/messages",
        { sessionId: this.sid, limit: 60 },
        30_000,
      );
      const meddelanden = (svar as { messages?: unknown[] } | null)?.messages;
      if (!Array.isArray(meddelanden)) return [];
      const ut: StudioHistorikPost[] = [];
      for (const m of meddelanden) {
        const info = (m as { info?: { role?: unknown } }).info;
        const roll = info?.role;
        if (roll !== "user" && roll !== "assistant") continue;
        // BEVISAT form: parts[] med type "text" bär textfältet.
        const delar = (m as { parts?: { type?: string; text?: unknown }[] }).parts ?? [];
        const text = delar
          .filter((d) => d.type === "text" && typeof d.text === "string")
          .map((d) => d.text as string)
          .join("\n")
          .trim();
        if (text) ut.push({ roll, text });
      }
      return ut.slice(-40);
    } catch {
      return []; // historik är lyx, aldrig ett fel för chatten
    }
  }

  async skicka(
    prompt: string,
    lyssnare: StudioLyssnare,
    signal?: AbortSignal,
    extra?: StudioSkickaExtra,
  ): Promise<void> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) {
      throw new Error("session ej tillgänglig");
    }
    if (this.aktiv && !this.aktiv.färdig) {
      lyssnare({ typ: "fel", meddelande: "En prompt kör redan — vänta tills agenten är klar." });
      return;
    }

    await new Promise<void>((losa) => {
      const aktiv: AktivPrompt = {
        lyssnare,
        senasteText: "",
        färdig: false,
        klar: () => {
          städa();
          losa();
        },
      };
      this.aktiv = aktiv;

      // Hårt tak: 10 minuter räcker för långa agentrundor; client-abort
      // (req.signal) eldar session/stop och löser strömmen.
      const tak = setTimeout(() => {
        if (this.aktiv === aktiv && !aktiv.färdig) {
          aktiv.färdig = true;
          lyssnare({
            typ: "fel",
            meddelande: "Tidsgränsen nåddes (10 min) — svaret kan vara ofullständigt.",
          });
          städa();
          losa();
        }
      }, 10 * 60_000);
      const påAbort = () => {
        try {
          this.klient?.notis("session/stop", { sessionId: this.sid ?? "" });
        } catch {
          // eldränge — barnprocessen kan ha dött
        }
        if (this.aktiv === aktiv && !aktiv.färdig) {
          aktiv.färdig = true;
          städa();
          losa();
        }
      };
      const städa = () => {
        clearTimeout(tak);
        signal?.removeEventListener("abort", påAbort);
        if (this.aktiv === aktiv) this.aktiv = null;
      };
      if (signal) {
        if (signal.aborted) {
          påAbort();
          return;
        }
        signal.addEventListener("abort", påAbort, { once: true });
      }

      // Översändning med självläkningsvägar. VÅG 92 B1: session/send kan
      // bära EXTRAFÄLT (attachments/automationId/offPeak*) —
      //   · form-avvisad (-32602/unrecognized) ⇒ EN nedgradering till vanlig
      //     skicka med reservPrompten (extrafälten är valfria lyx),
      //   · -32031 ZCODE_RUNTIME_MODEL_UNAVAILABLE (bevisat 2026-09-09 när
      //     glm-5.3-flash stängdes av) ⇒ kassera sessionen, skapa en färsk
      //     (aktuell modell) och skicka EN gång till — RENT (extrafälten är
      //     session-/uppladdningsbundna, den nya sessionen känner dem ej).
      // Alla andra fel (även retryns) → tydligt fel-event.
      const oversand = async (): Promise<void> => {
        if (!this.klient?.lever || !this.sid) throw new Error("session ej tillgänglig");
        const skickaSend = async (innehall: string, medExtra?: StudioSkickaExtra): Promise<void> => {
          const falt: Record<string, unknown> = { sessionId: this.sid, content: innehall };
          if (medExtra) {
            if (Array.isArray(medExtra.attachments) && medExtra.attachments.length > 0) {
              falt.attachments = medExtra.attachments;
            }
            if (typeof medExtra.automationId === "string" && medExtra.automationId) {
              falt.automationId = medExtra.automationId;
            }
            if (typeof medExtra.offPeakTaskId === "string" && medExtra.offPeakTaskId) {
              falt.offPeakTaskId = medExtra.offPeakTaskId;
              falt.offPeakRunType = medExtra.offPeakRunType ?? "init";
            }
          }
          const svar = await this.klient!.protokollFraga("session/send", falt, 60_000);
          if ((svar as { accepted?: boolean } | null)?.accepted === false) {
            throw new Error("Prompten avvisades av agenten.");
          }
        };
        try {
          await skickaSend(prompt, extra);
          return; // accepted → vänta på turn/idle-notiserna (taket vaktar)
        } catch (fel) {
          if (signal?.aborted) throw fel;
          const text = fel instanceof Error ? fel.message : String(fel);
          if (extra && arSendFormAvvisad(text)) {
            lyssnare({
              typ: "status",
              text: "Protokollet avvisade tilläggsfälten — skickar som vanlig prompt…",
            });
            await skickaSend(extra.reservPrompt ?? prompt);
            return;
          }
          if (arModellOtillganglig(text) && this.aktiv === aktiv && !aktiv.färdig) {
            lyssnare({
              typ: "status",
              text: "Sessionens modell är ej längre tillgänglig — skapar ny session…",
            });
            // VÅG 95 (-32031-STÄDNING): flagga den döda sessionen i kartan
            // INNAN kasseringen — den resumed ALDRIG igen (frisk session
            // direkt vid nästa meddelande, även efter omstart: flaggan
            // lever på disk). Bryter upprepningsloopen "omstart → resume
            // av död modell → -32031 → dubbeltur".
            if (this.sid) markeraModellDod(this.sid);
            // Intern frisk-session-väg (UTAN prompt-vakt) — dödlägesfix
            // bevisad på prod 2026-09-09: nySession vägrade under retryn.
            await this.skapaFriskSession();
            await skickaSend(prompt);
            return;
          }
          throw fel;
        }
      };
      oversand().catch((fel: unknown) => {
        if (this.aktiv === aktiv && !aktiv.färdig) {
          aktiv.färdig = true;
          lyssnare({
            typ: "fel",
            meddelande: `Kunde ej skicka till agenten: ${fel instanceof Error ? fel.message : String(fel)}`,
          });
        }
        städa();
        losa();
      });
    });
  }

  // ── VÅG 91 A1d + VÅG 92 B1: BILDER + TJÄNSTE-BRYGGOR ────────────────────────

  async skickaMedBild(
    prompt: string,
    bildSokvagar: string[],
    lyssnare: StudioLyssnare,
    signal?: AbortSignal,
  ): Promise<void> {
    // VÅG 92 B1: PRIMÄR väg = v4/attachment-flödet per bild (SANA bilagor i
    // session/send). Sanering + 8-tak via byggPromptMedBilder (REN väg).
    const { bilder } = byggPromptMedBilder(prompt, bildSokvagar);
    const bilagor: Record<string, unknown>[] = [];
    const viaSokvag: string[] = [];
    for (const sokvag of bilder) {
      lyssnare({
        typ: "status",
        text: `Laddar upp bilaga ${bilagor.length + viaSokvag.length + 1}/${bilder.length}…`,
      });
      // laddaUppBilaga kastar ALDRIG (null vid varje avvisning) — skyddet
      // är dubbelsäkrat så en oväntad kast aldrig dödar hela rundan.
      const bilaga = await this.laddaUppBilaga(sokvag).catch(() => null);
      if (bilaga) {
        // OPAK genomströmning (OEt): commit-svarets ref bärs SOM DEN ÄR när
        // den är ett objekt; annars minimiobjektet {attachmentId}.
        bilagor.push(
          bilaga.ref && typeof bilaga.ref === "object"
            ? (bilaga.ref as Record<string, unknown>)
            : { attachmentId: bilaga.attachmentId },
        );
      } else {
        viaSokvag.push(sokvag); // arbetsytareferens-fallback för DENNA bild
      }
    }
    // Prompten: endast KVARVARANDE (null-fallback-)bilder som Read-referenser
    // — de uppladdade bärs av attachments-fältet. Reserv-prompten (vid form-
    // nedgradering i skicka) bär ALLA bilder som referenser.
    const { prompt: utokad } = byggPromptMedBilder(prompt, viaSokvag);
    const { prompt: reserv } = byggPromptMedBilder(prompt, bilder);
    await this.skicka(utokad, lyssnare, signal, bilagor.length > 0 ? { attachments: bilagor, reservPrompt: reserv } : undefined);
  }

  async laddaUppBilaga(sokvag: string): Promise<StudioBilagaRef | null> {
    // VÅG 92 B1 (P0-1 — käpphästen). PROTOKOLLFORM (våg 91 A1d-binärsond,
    // vendor/zcode.cjs app 3.11.2 — dokumenterad, LIVE-bevis avvaktar):
    //   v4/attachment/begin {connectionId, uploadId, sessionId, fileName,
    //     mime, totalBytes, totalChunks, checksum:"sha256:<64hex>"}
    //   v4/attachment/chunk {uploadId, chunkIndex, dataBase64} (512 kB bitar)
    //   v4/attachment/commit {uploadId} → ref (opak — bilageIdUrSvar drar id)
    // ALLT avvisar ⇒ null (ALDRIG kast): metoden saknas (-32601), fel form,
    // timeout, fil saknas, > 5 MB, sanitär sökväg underkänd, session borta.
    const rent = saniteraBilageSokvag(sokvag);
    if (!rent) return null;
    try {
      await this.ensure();
    } catch {
      return null; // skicka() ger det ärliga felet senare
    }
    if (!this.sid || !this.klient?.lever) return null;
    // Mimosa-recept (våg 91): strängkonkat + rot-prefixkontroll — ALDRIG
    // path.join med variabel i filsökvägen.
    const hel = bilageSokvagIArbetsyta(this.arbetskatalog, rent);
    if (!hel) return null;
    let data: Buffer;
    try {
      const info = statSync(hel);
      if (!info.isFile()) return null;
      if (info.size <= 0 || info.size > MAX_BILAGA_BYTE) return null;
      data = readFileSync(hel);
    } catch {
      return null;
    }
    const filnamn = rent.split("/").pop() ?? "bilaga";
    const mime = bilageMime(filnamn);
    const checksum = `sha256:${createHash("sha256").update(data).digest("hex")}`;
    const totalChunks = Math.max(1, Math.ceil(data.length / BILAGE_CHUNK_BYTE));
    const uploadId = `ak1a-studio-bilaga-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    // Gateway-prenumerationen är dokumenterad för v4-flödena — best-effort
    // (misslyckad subscribe skall inte stoppa begin-försöket).
    if (!this.v4Ansluten) await this.v4Prenumerera();
    try {
      await this.klient.protokollFraga(
        "v4/attachment/begin",
        {
          connectionId: this.v4ConnectionId,
          uploadId,
          sessionId: this.sid,
          fileName: filnamn,
          mime,
          totalBytes: data.length,
          totalChunks,
          checksum,
        },
        30_000,
      );
    } catch {
      return null; // metoden saknas / formen avvisad / timeout — null-fallback
    }
    for (let i = 0; i < totalChunks; i++) {
      try {
        const fran = i * BILAGE_CHUNK_BYTE;
        const till = Math.min(fran + BILAGE_CHUNK_BYTE, data.length);
        await this.klient.protokollFraga(
          "v4/attachment/chunk",
          { uploadId, chunkIndex: i, dataBase64: data.subarray(fran, till).toString("base64") },
          60_000,
        );
      } catch {
        // Städa upp halva uppladdningen (best-effort) — protokollets abort.
        try {
          await this.klient.protokollFraga("v4/attachment/abort", { uploadId }, 10_000);
        } catch {
          // redan borta — null är svaret oavsett
        }
        return null;
      }
    }
    let commitSvar: unknown;
    try {
      commitSvar = await this.klient.protokollFraga("v4/attachment/commit", { uploadId }, 30_000);
    } catch {
      try {
        await this.klient.protokollFraga("v4/attachment/abort", { uploadId }, 10_000);
      } catch {
        // vidare — null oavsett
      }
      return null;
    }
    const attachmentId = bilageIdUrSvar(commitSvar);
    if (!attachmentId) return null; // opak ref utan tolkbar id → fallback
    return {
      attachmentId,
      ...(commitSvar && typeof commitSvar === "object" ? { ref: commitSvar } : {}),
    };
  }

  async lasBakgrundsjobb(): Promise<StudioBakgrundsjobb[]> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    // PRIMÄR (VÅG 92 B1: FULL projektionsparsning): session/read-projektionens
    // backgroundJobs — Tkn-formens alla fält mappas defensivt (taskId|id,
    // title, taskKind, status, description, command, pid, startedAt,
    // outputTail, cancellable — fältbudgeten varierar mellan versioner).
    try {
      const r = (await this.klient.protokollFraga("session/read", { sessionId: this.sid }, 30_000)) as
        | (SessionReadResult & { projection?: { backgroundJobs?: unknown[] } })
        | null;
      const rader = r?.projection?.backgroundJobs;
      if (Array.isArray(rader)) {
        const ut: StudioBakgrundsjobb[] = [];
        for (const rad of rader) {
          if (!rad || typeof rad !== "object") continue;
          const j = rad as Record<string, unknown>;
          const id = (typeof j.taskId === "string" && j.taskId) || (typeof j.id === "string" && j.id) || "";
          const status = (typeof j.status === "string" && j.status) || "";
          if (!id || !status) continue;
          const kommando = typeof j.command === "string" && j.command ? truncat(j.command, 200) : undefined;
          const beskrivning =
            typeof j.description === "string" && j.description
              ? truncat(j.description, 200)
              : kommando;
          ut.push({
            id,
            typ: typeof j.taskKind === "string" && j.taskKind ? j.taskKind : undefined,
            status,
            beskrivning,
            verktyg: typeof j.toolName === "string" && j.toolName ? j.toolName : undefined,
            titel: typeof j.title === "string" && j.title ? truncat(j.title, 200) : undefined,
            startad:
              (typeof j.startedAt === "string" && j.startedAt) ||
              (typeof j.createdAt === "string" && j.createdAt) ||
              undefined,
            pid: typeof j.pid === "number" ? j.pid : undefined,
            kommando,
            utdataSvans:
              typeof j.outputTail === "string" && j.outputTail ? truncat(j.outputTail, MAX_PROGRESS_TEEKEN) : undefined,
            avbrytbar: typeof j.cancellable === "boolean" ? j.cancellable : undefined,
          });
        }
        if (ut.length > 0) return ut;
      }
    } catch (fel) {
      // FALLBACK nedan — subagenterna är också bakgrundsarbete.
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("session/read");
    }
    // FALLBACK: session/subagents (körande + avslutade barnagenter) —
    // childSessionId som id (samma val som avbrytBakgrundsTask).
    return (await this.lasSubagenter()).map((s) => ({
      id: s.barnSessionId,
      typ: s.typ,
      status: s.status,
      beskrivning: s.sammanfattning ?? s.titel,
      titel: s.titel,
      startad: s.startad,
    }));
  }

  /**
   * Binärsond-form (Okn): {requestId, sessionId, turnId?, workspaceKey,
   * workspacePath, clientMode, sessionContext} — strict. requestId är vår
   * egen (server-<n>-formen är för serverns egna requests; klienten äger
   * sin id här).
   */
  private webblasareParams(): Record<string, unknown> {
    return {
      requestId: `ak1a-studio-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: this.sid,
      workspaceKey: this.arbetskatalog,
      workspacePath: this.arbetskatalog,
      clientMode: "web-remote-replayable",
      sessionContext: "live",
    };
  }

  async lasWebblasare(): Promise<StudioWebblasare[]> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    let r: { browsers?: unknown[] } | null;
    try {
      r = (await this.klient.protokollFraga(
        "interaction/browserList",
        this.webblasareParams(),
        30_000,
      )) as { browsers?: unknown[] } | null;
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("interaction/browserList");
      throw fel;
    }
    const lista = Array.isArray(r?.browsers) ? r!.browsers! : [];
    const ut: StudioWebblasare[] = [];
    for (const b of lista) {
      const post = b as { id?: unknown; generation?: unknown; type?: unknown; name?: unknown } | null;
      const id = typeof post?.id === "string" && post.id ? post.id : "";
      if (!id) continue;
      ut.push({
        id,
        generation: typeof post?.generation === "number" ? post.generation : 0,
        typ: typeof post?.type === "string" && post.type ? post.type : undefined,
        namn: typeof post?.name === "string" && post.name ? post.name : undefined,
      });
    }
    return ut;
  }

  async korWebblasare(kommando: { browserId?: string; browserGeneration?: number; kommando: string }): Promise<unknown> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (typeof kommando?.kommando !== "string" || !kommando.kommando.trim()) {
      throw new Error("kommando krävs (webbläsarkommandot som sträng).");
    }
    // Binärsond-form (Dkn): browserId/browserGeneration valfria, workspace +
    // clientMode + sessionContext valfria här — vi bär dem ändå (samma form
    // som browserList är bevisat i kartans unionsregister).
    const params: Record<string, unknown> = {
      ...this.webblasareParams(),
      command: kommando.kommando.slice(0, 4_000),
    };
    if (kommando.browserId) params.browserId = kommando.browserId;
    if (typeof kommando.browserGeneration === "number") params.browserGeneration = kommando.browserGeneration;
    try {
      return await this.klient.protokollFraga("interaction/browserExecute", params, 60_000);
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("interaction/browserExecute");
      throw fel;
    }
  }

  async lasAutomationer(): Promise<StudioAutomation[]> {
    this.klientForFraga(); // automation/list kräver levande klient, ej session
    let r: { automations?: unknown[] } | null;
    try {
      r = (await this.klient!.protokollFraga("automation/list", {}, 30_000)) as
        | { automations?: unknown[] }
        | null;
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("automation/list");
      throw fel;
    }
    const lista = Array.isArray(r?.automations) ? r!.automations! : [];
    // VÅG 92 B1: FULL parsning via den delade mappern (okänd post hopas över).
    const ut: StudioAutomation[] = [];
    for (const post of lista) {
      const automation = automationUrPost(post);
      if (automation) ut.push(automation);
    }
    return ut;
  }

  // ── VÅG 92 B1 (P0-3): AUTOMATION CRUD — protokollform ur kartan §2 ─────────
  // OBS: de tre CRUD-metoderna är PILFÄLT (ej prototypmetoder) — B2:s rutt
  // (api/studio/tjanster/automation) lösgör metoden från instansen
  // (`const f = transport.f; f(…)`) och pilfältet binder `this` permanent.

  automationSkapa = async (skapa: StudioAutomationSkapa): Promise<StudioAutomation | null> => {
    const namn = typeof skapa?.namn === "string" ? skapa.namn.trim() : "";
    const prompt = typeof skapa?.prompt === "string" ? skapa.prompt.trim() : "";
    if (!namn) throw new Error("namn krävs för en automation.");
    if (!prompt) throw new Error("prompt krävs för en automation.");
    if (prompt.length > MAX_PROMPT_TEEKEN_TRANSPORT) {
      throw new Error(`Prompten är för lång (max ${MAX_PROMPT_TEEKEN_TRANSPORT} tecken).`);
    }
    const cron = typeof skapa.schema === "string" ? skapa.schema.trim() : "";
    // Kartans $je-form: {title, cronExpr, prompt, model?, mode?, targetTaskId?,
    // enabled, maxRuns?} → {automation}. lasLage=true ärver transportens
    // läge (build|plan) som mode.
    const params: Record<string, unknown> = {
      title: namn.slice(0, 200),
      prompt,
      enabled: true,
    };
    if (cron) params.cronExpr = cron.slice(0, 120);
    if (skapa.lasLage && (this.lage === "build" || this.lage === "plan")) params.mode = this.lage;
    this.klientForFraga();
    let r: { automation?: unknown } | null;
    try {
      r = (await this.klient!.protokollFraga("automation/create", params, 30_000)) as
        | { automation?: unknown }
        | null;
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("automation/create");
      throw fel;
    }
    return automationUrPost(r?.automation); // okänd form → null (vänligt)
  }

  automationUppdatera = async (id: string, andring: { pausad?: boolean }): Promise<StudioAutomation | null> => {
    const automationId = typeof id === "string" ? id.trim() : "";
    if (!automationId) throw new Error("automationId krävs.");
    // Pausa = enabled:false (create-formens enabled-fält; lifecycleStatus
    // "paused" är binär-unionens pausade steg) — återaktivera = enabled:true.
    const params: Record<string, unknown> = { automationId: automationId.slice(0, 200) };
    if (typeof andring?.pausad === "boolean") params.enabled = !andring.pausad;
    this.klientForFraga();
    let r: unknown;
    try {
      r = await this.klient!.protokollFraga("automation/update", params, 30_000);
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("automation/update");
      throw fel;
    }
    // Svarsformen är ej LIVE-bevisad: {automation} · rak post · annan form —
    // defensivt ur båda, annars null (listan är sanningen).
    const post = (r as { automation?: unknown } | null)?.automation ?? r;
    return automationUrPost(post);
  }

  automationRadera = async (id: string): Promise<{ raderad: boolean; meddelande: string }> => {
    const automationId = typeof id === "string" ? id.trim() : "";
    if (!automationId) throw new Error("automationId krävs.");
    this.klientForFraga();
    let r: { deleted?: unknown } | null;
    try {
      r = (await this.klient!.protokollFraga(
        "automation/delete",
        { automationId: automationId.slice(0, 200) },
        30_000,
      )) as { deleted?: unknown } | null;
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("automation/delete");
      throw fel;
    }
    if (r?.deleted === false) {
      return { raderad: false, meddelande: "Agenten raderade ej automationen." };
    }
    return {
      raderad: true,
      meddelande:
        r?.deleted === true
          ? "Automationen raderad."
          : "Radering skickad — agenten bekräftade ej formen (ladda om listan om den syns kvar).",
    };
  }

  // ── VÅG 92 B1 (P0-5): SKICKA-AUTOMATION — send med automationId/offPeak ─────

  async skickaAutomation(
    prompt: string,
    automationId?: string,
    offPeak?: boolean,
    lyssnare?: StudioLyssnare,
    signal?: AbortSignal,
  ): Promise<void> {
    const text = typeof prompt === "string" ? prompt.trim() : "";
    if (!text) throw new Error("Prompten är tom.");
    if (text.length > MAX_PROMPT_TEEKEN_TRANSPORT) {
      throw new Error(`Prompten är för lång (max ${MAX_PROMPT_TEEKEN_TRANSPORT} tecken).`);
    }
    const l: StudioLyssnare = lyssnare ?? (() => undefined);
    let extra: StudioSkickaExtra | undefined;
    if (typeof automationId === "string" && automationId.trim()) {
      // Kartan §1: automationId ⊕ offPeakTaskId är MUTUELLT EXKLUSIVA —
      // automationsgrenen vinner när båda angivits.
      extra = { automationId: automationId.trim().slice(0, 200), reservPrompt: text };
    } else if (offPeak) {
      // Klienten äger offPeak-id:t (samma mönster som uploadId/connectionId
      // i v4-grenen); offPeakRunType "init" enligt kartans union.
      extra = {
        offPeakTaskId: `ak1a-studio-offpeak-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        offPeakRunType: "init",
        reservPrompt: text,
      };
    }
    // Utan extra (eller efter form-nedgradering i skicka) → VANLIG skicka.
    await this.skicka(text, l, signal, extra);
  }

  async genereraText(prompt: string): Promise<{ text: string; råSvar: unknown }> {
    const text = prompt.trim();
    if (!text) throw new Error("Prompten är tom.");
    if (text.length > MAX_PROMPT_TEEKEN_TRANSPORT) {
      throw new Error(`Prompten är för lång (max ${MAX_PROMPT_TEEKEN_TRANSPORT} tecken).`);
    }
    // modelRef:xc ur den aktiva sessionens kontext ("zai/glm-5.3"-form) —
    // utan session/läsbar modell vägrar metoden ärligt (generateText kräver
    // modelRef enligt kartan §2).
    const kontext = await this.lasKontext();
    const modell = kontext?.modell;
    const [providerId, modelId] = modell && modell.includes("/") ? modell.split("/") : [null, null];
    if (!providerId || !modelId) {
      throw new Error("Ingen modell känd för textgenerering — öppna sessionen först.");
    }
    let r: { text?: unknown } | null;
    try {
      r = (await this.klient!.protokollFraga(
        "workspace/generateText",
        {
          workspace: { workspaceKey: this.arbetskatalog, workspacePath: this.arbetskatalog },
          modelRef: { providerId, modelId },
          prompt: text,
          querySource: "ak1a-studio",
        },
        120_000,
      )) as { text?: unknown } | null;
    } catch (fel) {
      if (arMetodSaknas(fel)) throw new StudioMetodSaknasError("workspace/generateText");
      throw fel;
    }
    return { text: typeof r?.text === "string" ? r.text : "", råSvar: r };
  }

  private lasSparadSession(): {
    sessionId: string | null;
    modell?: string;
    lage?: string;
    tankeNiva?: string;
    /** VÅG 95: när sessionen SPARADES (födelsen) — friskgångs-reservtid. */
    sparadTid?: number | null;
  } {
    try {
      const rå = readFileSync(this.lagringsSökväg, "utf8");
      const pars = JSON.parse(rå) as {
        sessionId?: unknown;
        modell?: unknown;
        lage?: unknown;
        tankeNiva?: unknown;
        sparad?: unknown;
      };
      const sid = typeof pars.sessionId === "string" && pars.sessionId.startsWith("sess_") ? pars.sessionId : null;
      const modell = typeof pars.modell === "string" && pars.modell ? pars.modell : undefined;
      const lage = typeof pars.lage === "string" && (pars.lage === "build" || pars.lage === "plan") ? pars.lage : undefined;
      const tankeNiva =
        typeof pars.tankeNiva === "string" && ["nothink", "high", "max"].includes(pars.tankeNiva)
          ? pars.tankeNiva
          : undefined;
      const sparadTid = typeof pars.sparad === "number" && pars.sparad > 0 ? pars.sparad : null;
      return { sessionId: sid, modell, lage, tankeNiva, sparadTid };
    } catch {
      return { sessionId: null, sparadTid: null };
    }
  }
}

// ── mockTransport ────────────────────────────────────────────────────────────

/**
 * Deterministisk demo/test-transport: strömmar ett canned markdown-svar i
 * bitar med små pauser, rapporterar verktygsstatus och "klart". Ingen
 * barnprocess, ingen modell, inga kostnader — DEV på arbetsstationen och
 * enhetstest av SSE-bryggan (dev-testet i verktyg/testa-studio.mjs).
 */
class MockTransport implements StudioTransport {
  readonly namn = "mock" as const;
  private mockSid: string | null = null;
  /**
   * VÅG 84 B: mål-session (per-session-tabbar) — mocken ADOPTERAR id:t
   * direkt i ensure() (dev-vänligt: dev-E2E kan resume "tidigare" sessioner
   * som servern aldrig sett, historiken börjar tom och fylls av nya prompter).
   */
  private readonly målSessionId: string | undefined;
  private mockModell: string | null = null;
  private mockTotalt = 0;
  private mockTurns = 0;
  private readonly historikPoster: StudioHistorikPost[] = [];
  private readonly gamlaSessioner: StudioSessionPost[] = [];

  constructor(målSessionId?: string) {
    this.målSessionId =
      typeof målSessionId === "string" && /^sess_[A-Za-z0-9._-]+$/.test(målSessionId)
        ? målSessionId
        : undefined;
  }
  /** v83 B3: historik + metadata per avlagd session (resume i mock). */
  private readonly mockHistorik = new Map<string, StudioHistorikPost[]>();
  private readonly mockMeta = new Map<string, { turns: number; tokens: number }>();
  private mockMal: string | null = null;
  /** VÅG 85 F1 (mock): mål-lägets state + loop-lyssnare + timer. */
  private mockMalAktiv = false;
  private mockMalPausad = false;
  private mockMalIteration = 0;
  /** VÅG 91 A1b (mock): senaste mål-event-rad + tidpunkt (statuspollen). */
  private mockMalSenasteEvent: string | null = null;
  private mockMalSenasteEventTid: number | null = null;
  private mockMalLyssnare: StudioLyssnare | null = null;
  private mockMalTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly mockSubagenter: StudioSubagent[] = [
    {
      barnSessionId: "sess_mock_sub_1",
      titel: "Bakgrundsagent (mock)",
      typ: "demo",
      status: "running",
      startad: new Date(Date.now() - 90_000).toISOString(),
    },
    {
      barnSessionId: "sess_mock_sub_2",
      titel: "Avslutad agent (mock)",
      typ: "demo",
      status: "success",
      startad: new Date(Date.now() - 600_000).toISOString(),
      avslutad: new Date(Date.now() - 300_000).toISOString(),
    },
  ];
  /** V83 B1: senaste mock-turnens "filändringar" (Write-kortets diff). */
  private mockAndringar: StudioFilandring[] = [];
  /** V83 B2: väntande simulerad permission-dialog (dev-kedjans bevis). */
  private mockVantan: { interaktion: Extract<StudioInteraktion, { typ: "permission" }>; los: (beslut: string) => void } | null = null;
  /** V83 B2: väntande simulerat frågekort (requestUserInput). */
  private mockVantanFraga: { interaktion: Extract<StudioInteraktion, { typ: "fråga" }>; los: (varde: string) => void } | null = null;
  /** V83 B2: mock-läge + tankestyrka (satt via sattLage/sattTankeNiva). */
  private mockLage: "build" | "plan" | null = null;
  private mockTankeNiva: string | null = null;
  /**
   * VÅG 93 C1 (mock): workspace-STANDARDVÄRDENA — sparaStandard* uppdaterar,
   * lasWorkspaceInstallningar återger (instansens egna fält är dev-sanningen;
   * fallback speglar sessionens mock-val innan något standardvärde satts).
   */
  private mockStandardModell: string | null = null;
  private mockStandardTankestyrka: string | null = null;
  private mockStandardLage: string | null = null;

  sessionId(): string | null {
    return this.mockSid;
  }

  async ensure(): Promise<void> {
    // VÅG 84 B: mål-session adopteras (per-session-tabbar i dev). Främmande
    // id:n (icke sess_mock_*) nekas ÄRLIGT — speglar prod:ens resume-fel för
    // en session som inte finns (E2E:testar borta-session-vägen i dev).
    if (!this.mockSid) {
      if (this.målSessionId && !this.målSessionId.startsWith("sess_mock_")) {
        throw new Error(
          `Sessionen ${this.målSessionId.slice(0, 13)}… kunde ej återupptas (Session not found — mock) — stäng tabben eller öppna en ny.`,
        );
      }
      this.mockSid = this.målSessionId ?? `sess_mock_${Date.now().toString(36)}`;
    }
  }

  async historik(): Promise<StudioHistorikPost[]> {
    return [...this.historikPoster];
  }

  async bytModell(modellId: string): Promise<StudioBytModellSvar> {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}$/.test(modellId)) throw new Error("Ogiltigt modell-id.");
    this.mockModell = modellId;
    const sid = await this.nySession(modellId);
    return { sessionId: sid, väg: "create", modell: `zai/${modellId}` };
  }

  async nySession(modellId?: string): Promise<string> {
    if (modellId) this.mockModell = modellId;
    // VÅG 85 F1 (mock): en frisk session föds utan mål — loopen stannar
    // och mål-läget släcks (samma ärlighet som prod:s skapaFriskSession).
    this.stoppaMockMalLoop();
    this.mockMal = null;
    this.mockMalAktiv = false;
    this.mockMalPausad = false;
    this.mockMalIteration = 0;
    this.mockMalSenasteEvent = null;
    this.mockMalSenasteEventTid = null;
    this.mockMalLyssnare?.({
      typ: "mal_status",
      aktiv: false,
      pausad: false,
      iteration: 0,
      mal: null,
    });
    if (this.mockSid) {
      // "Tidigare sessioner" finns kvar i listan även efter kassering —
      // v83 B3: historik + turns/tokens sparas så resume kan återge dem.
      this.mockHistorik.set(this.mockSid, [...this.historikPoster]);
      this.mockMeta.set(this.mockSid, { turns: this.mockTurns, tokens: this.mockTotalt });
      this.gamlaSessioner.unshift({
        sessionId: this.mockSid,
        titel: this.historikPoster[0]?.text.slice(0, 60) || "Mock-session",
        status: "idle",
        modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
        turns: this.mockTurns,
        tokens: this.mockTotalt,
        uppdaterad: new Date().toISOString(),
      });
    }
    this.historikPoster.length = 0;
    this.mockTotalt = 0;
    this.mockTurns = 0;
    this.mockSid = `sess_mock_${Date.now().toString(36)}`;
    return this.mockSid;
  }

  async lasSessioner(): Promise<StudioSessionPost[]> {
    await this.ensure();
    return [
      {
        sessionId: this.mockSid!,
        titel: "Aktiv mock-session",
        status: "idle",
        modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
        turns: this.mockTurns,
        tokens: this.mockTotalt,
        uppdaterad: new Date().toISOString(),
      },
      ...this.gamlaSessioner,
    ].slice(0, 25);
  }

  async compact(): Promise<StudioCompactSvar> {
    await this.ensure();
    this.mockTotalt = Math.round(this.mockTotalt * 0.2);
    return {
      status: this.mockTurns === 0 ? "tom" : "klar",
      meddelande: "Mock: kontexten nollställd till 20 % (deterministisk no-op).",
      kontext: await this.lasKontext(),
    };
  }

  async lasKontext(): Promise<StudioKontext | null> {
    await this.ensure();
    return {
      modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
      contextUsed: this.mockTotalt,
      // KVD-reservtak 1M används i mock (protokollets ärliga tak saknas).
      contextWindow: 1_000_000,
      totalTokenCount: this.mockTotalt,
      turnCount: this.mockTurns,
      lage: this.mockLage ?? undefined,
      tankeNiva: this.mockTankeNiva ?? undefined,
    };
  }

  // ── V83 B1: filändringar — mockens deterministiska Write-diff ───────────

  async lasFilandringar(): Promise<StudioFilandring[]> {
    await this.ensure();
    return this.mockAndringar.map((f) => ({ ...f, rader: [...f.rader] }));
  }

  // ── V83 B2: interaktionsskiktet — deterministisk dev-simulering ─────────

  vantaInteraktioner(): StudioInteraktion[] {
    const ut: StudioInteraktion[] = [];
    if (this.mockVantan) ut.push(this.mockVantan.interaktion);
    if (this.mockVantanFraga) ut.push(this.mockVantanFraga.interaktion);
    return ut;
  }

  async svarPermission(
    requestId: string,
    alternativId: string,
  ): Promise<{ ok: boolean; beslut: string; skäl?: string }> {
    const v = this.mockVantan;
    if (!v || v.interaktion.requestId !== requestId) {
      return { ok: false, beslut: "okänd", skäl: "begäran finns ej eller är redan besvarad" };
    }
    this.mockVantan = null;
    const etikett =
      alternativId === "allow_once"
        ? "tillåtet en gång"
        : alternativId === "allow_project"
          ? "tillåtet för projektet"
          : alternativId === "deny"
            ? "nekat"
            : alternativId;
    v.los(alternativId);
    return { ok: true, beslut: etikett };
  }

  async svarFraga(requestId: string, svar: { varde?: string; avbruten?: boolean }): Promise<{ ok: boolean }> {
    const v = this.mockVantanFraga;
    if (!v || v.interaktion.requestId !== requestId) return { ok: false };
    this.mockVantanFraga = null;
    v.los(svar.avbruten ? "" : (svar.varde ?? ""));
    return { ok: true };
  }

  async sattLage(lage: "build" | "plan"): Promise<{ lage: string }> {
    this.mockLage = lage;
    return { lage };
  }

  async sattTankeNiva(niva: string): Promise<{ niva: string }> {
    if (!["nothink", "high", "max"].includes(niva)) {
      throw new Error(`Okänd tankestyrka "${niva.slice(0, 30)}" — använd nothink, high eller max.`);
    }
    this.mockTankeNiva = niva;
    return { niva };
  }

  // ── V83 B3 (mock): sessions- och workspace-hantering, deterministisk ────

  async oppnaSession(sessionId: string): Promise<StudioOppnaSvar> {
    if (!/^sess_[A-Za-z0-9._-]+$/.test(sessionId)) throw new Error("Ogiltigt sessions-id.");
    await this.ensure();
    if (sessionId !== this.mockSid && !this.gamlaSessioner.some((s) => s.sessionId === sessionId)) {
      throw new Error("Sessionen finns ej (mock).");
    }
    if (sessionId !== this.mockSid) {
      // Lägg undan nuvarande innan resumen tar över (spegla nySession).
      this.mockHistorik.set(this.mockSid!, [...this.historikPoster]);
      this.mockMeta.set(this.mockSid!, { turns: this.mockTurns, tokens: this.mockTotalt });
      const post = this.gamlaSessioner.find((s) => s.sessionId === sessionId);
      this.mockSid = sessionId;
      this.historikPoster.length = 0;
      const sparad = this.mockHistorik.get(sessionId);
      if (sparad) this.historikPoster.push(...sparad);
      const meta = this.mockMeta.get(sessionId);
      this.mockTurns = meta?.turns ?? post?.turns ?? 0;
      this.mockTotalt = meta?.tokens ?? post?.tokens ?? 0;
    }
    return {
      sessionId: sessionId,
      historik: [...this.historikPoster],
      kontext: await this.lasKontext(),
    };
  }

  async stangSession(sessionId?: string): Promise<boolean> {
    await this.ensure();
    const mal = sessionId ?? this.mockSid;
    if (!mal) throw new Error("Ingen session att stänga.");
    for (const s of this.gamlaSessioner) {
      if (s.sessionId === mal) s.status = "completed";
    }
    if (mal === this.mockSid) {
      // Spegla app-servern: stängd aktiv session ⇒ nästa ensure föder frisk.
      this.mockHistorik.set(mal, [...this.historikPoster]);
      this.mockMeta.set(mal, { turns: this.mockTurns, tokens: this.mockTotalt });
      if (!this.gamlaSessioner.some((s) => s.sessionId === mal)) {
        this.gamlaSessioner.unshift({
          sessionId: mal,
          titel: this.historikPoster[0]?.text.slice(0, 60) || "Mock-session",
          status: "completed",
          modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
          turns: this.mockTurns,
          tokens: this.mockTotalt,
          uppdaterad: new Date().toISOString(),
        });
      }
      this.mockSid = null;
      this.historikPoster.length = 0;
      this.mockTotalt = 0;
      this.mockTurns = 0;
    }
    return true;
  }

  async forka(): Promise<StudioForkSvar> {
    await this.ensure();
    const forkedSessionId = `sess_mock_fork_${Date.now().toString(36)}`;
    return {
      forkedSessionId,
      meddelande: `Mock: fork skapad (${forkedSessionId}) — riktigt läge kräver checkpoint.`,
    };
  }

  /**
   * VÅG 86 G5 (mock): deterministisk rewind — historiken klipps vid den
   * (turnIndex+1):e user-posten (protokollets e8i-räkning: user räknar upp,
   * turnen avslutas vid nästa user) och den förkortade historiken blir en NY
   * mock-session (föräldern läggs undan i gamlaSessioner — dev-E2E bevisar
   * "föräldern lever kvar i Sessioner + chatten börjar om från punkten").
   */
  async rewindTillTurn(turnIndex: number): Promise<StudioRewindSvar> {
    await this.ensure();
    if (!Number.isInteger(turnIndex) || turnIndex < 0) {
      throw new Error("Ogiltigt iterationsnummer för rewind.");
    }
    // Protokoll-räkningen: hitta SLUTET på turn turnIndex = index FÖRE den
    // (turnIndex+2):te user-posten (den (turnIndex+1):e user-posten öppnar
    // turnen; nästa user-post stänger den — sista turnen slutar vid slutet).
    let userSett = 0;
    let klipp = this.historikPoster.length;
    for (let i = 0; i < this.historikPoster.length; i++) {
      if (this.historikPoster[i].roll === "user") {
        if (userSett === turnIndex + 1) {
          klipp = i; // nästa user-post = turnen är slut
          break;
        }
        userSett += 1;
      }
    }
    if (userSett < turnIndex + 1) {
      throw new Error(
        `Iterationen ${turnIndex + 1} finns ej i sessionen (mock) — välj en tidigare agentbubbla.`,
      );
    }
    // Föräldern undan (samma mönster som nySession — listan behåller den).
    if (this.mockSid) {
      this.mockHistorik.set(this.mockSid, [...this.historikPoster]);
      this.mockMeta.set(this.mockSid, { turns: this.mockTurns, tokens: this.mockTotalt });
      if (!this.gamlaSessioner.some((s) => s.sessionId === this.mockSid)) {
        this.gamlaSessioner.unshift({
          sessionId: this.mockSid,
          titel: this.historikPoster[0]?.text.slice(0, 60) || "Mock-session",
          status: "idle",
          modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
          turns: this.mockTurns,
          tokens: this.mockTotalt,
          uppdaterad: new Date().toISOString(),
        });
      }
    }
    // Forkad session: förkortad historik + ärliga räknare.
    const forkedSessionId = `sess_mock_fork_${Date.now().toString(36)}`;
    const historik = this.historikPoster.slice(0, klipp);
    this.mockSid = forkedSessionId;
    this.historikPoster.length = 0;
    this.historikPoster.push(...historik.map((h) => ({ ...h })));
    this.mockTurns = turnIndex + 1;
    this.mockTotalt = Math.max(0, this.mockTotalt);
    return {
      sessionId: forkedSessionId,
      iteration: turnIndex + 1,
      historik: [...this.historikPoster],
      kontext: await this.lasKontext(),
      meddelande: `Mock: sessionen forkad vid iteration ${turnIndex + 1}.`,
    };
  }

  async lasMal(): Promise<StudioMalSvar> {
    await this.ensure();
    return this.mockMal
      ? { mal: this.mockMal, meddelande: this.mockMal, aktiv: this.mockMalAktiv }
      : { mal: null, meddelande: "Inget mål är satt för sessionen." };
  }

  async sattMal(mal: string): Promise<StudioMalSvar> {
    const malText = mal.trim().slice(0, 500);
    if (!malText) throw new Error("Målet är tomt.");
    await this.ensure();
    // VÅG 85 F1: mål-set STARTAR den simulerade autonoma loopen (dev) —
    // samma eventföljd som prod (mal_iteration start → verktygskort →
    // streaming → runda/mal_iteration slut), om och om igen tills paus/
    // rensa. Deterministisk: ~7 s mellan iterationer, ingen modell.
    this.mockMal = malText;
    this.mockMalAktiv = true;
    this.mockMalPausad = false;
    this.mockMalIteration = 0;
    this.mockMalLyssnare?.({
      typ: "mal_status",
      aktiv: true,
      pausad: false,
      iteration: 0,
      mal: malText,
    });
    this.startaMockMalLoop();
    return { mal: malText, meddelande: "Mock: målet satt — autonoma iterationer simuleras." };
  }

  async rensaMal(): Promise<StudioMalSvar> {
    await this.ensure();
    this.stoppaMockMalLoop();
    this.mockMal = null;
    this.mockMalAktiv = false;
    this.mockMalPausad = false;
    this.mockMalIteration = 0;
    this.mockMalSenasteEvent = null;
    this.mockMalSenasteEventTid = null;
    this.mockMalLyssnare?.({
      typ: "mal_status",
      aktiv: false,
      pausad: false,
      iteration: 0,
      mal: null,
    });
    return { mal: null, meddelande: "Mock: målet rensat." };
  }

  // ── VÅG 85 F1 (mock): mål-läget — deterministisk loop-simulering ──────────

  malStatus(): StudioMalStatus {
    return {
      aktiv: this.mockMalAktiv,
      pausad: this.mockMalPausad,
      iteration: this.mockMalIteration,
      mal: this.mockMal,
      // VÅG 91 A1b (mock): samma motor-fält som prod (statuspollen).
      pagaendeTurn: this.mockMalAktiv && this.mockMalTimer !== null,
      senasteEvent: this.mockMalSenasteEvent ?? undefined,
      uppdaterad: this.mockMalSenasteEventTid ?? undefined,
    };
  }

  prenumereraMal(lyssnare: StudioLyssnare): () => void {
    this.mockMalLyssnare = lyssnare;
    lyssnare({
      typ: "mal_status",
      aktiv: this.mockMalAktiv,
      pausad: this.mockMalPausad,
      iteration: this.mockMalIteration,
      mal: this.mockMal,
    });
    return () => {
      if (this.mockMalLyssnare === lyssnare) this.mockMalLyssnare = null;
    };
  }

  async pausaMal(): Promise<StudioMalSvar> {
    await this.ensure();
    if (!this.mockMal) return { mal: null, meddelande: "Mock: inget mål att pausa." };
    this.stoppaMockMalLoop();
    this.mockMalLyssnare?.({ typ: "mal_pausad", iteration: this.mockMalIteration });
    this.mockMalAktiv = false;
    this.mockMalPausad = true;
    this.mockMalLyssnare?.({
      typ: "mal_status",
      aktiv: false,
      pausad: true,
      iteration: this.mockMalIteration,
      mal: this.mockMal,
    });
    return { mal: this.mockMal, meddelande: "Mock: målet pausat — iterationerna stannar." };
  }

  async aterupptaMal(): Promise<StudioMalSvar> {
    await this.ensure();
    if (!this.mockMal) return { mal: null, meddelande: "Mock: inget mål att återuppta." };
    this.mockMalAktiv = true;
    this.mockMalPausad = false;
    this.mockMalLyssnare?.({
      typ: "mal_status",
      aktiv: true,
      pausad: false,
      iteration: this.mockMalIteration,
      mal: this.mockMal,
    });
    this.startaMockMalLoop();
    return { mal: this.mockMal, meddelande: "Mock: målet återupptaget — loopen fortsätter." };
  }

  async sondMal(): Promise<StudioMalStatus> {
    await this.ensure();
    return this.malStatus();
  }

  /** Starta den simulerade mål-loopen (timer-driven — städas i stoppa…). */
  private startaMockMalLoop(): void {
    this.stoppaMockMalLoop();
    const kör = (): void => {
      if (!this.mockMalAktiv || !this.mockMal) return;
      const l = this.mockMalLyssnare;
      if (!l) {
        this.mockMalTimer = setTimeout(kör, 3_000);
        return;
      }
      const n = this.mockMalIteration + 1;
      this.mockMalIteration = n;
      // VÅG 91 A1a (mock): MOTORN markerar iterationerna i kartan (samma
      // väg som prod) — autonomt arbete syns i historiken utan lyssnare.
      markeraMalIterationStart(this.mockSid);
      this.mockMalSenasteEvent = beskrivMalEvent({ typ: "mal_iteration", fas: "start", iteration: n });
      this.mockMalSenasteEventTid = Date.now();
      l({ typ: "mal_iteration", fas: "start", iteration: n });
      l({ typ: "runda", fas: "start" });
      l({ typ: "status", text: `Agenten utvecklar autonomt — iteration ${n}… (mock)` });
      // Verktygskort 1: Bash med resultat (sökverktygets puls).
      l({
        typ: "verktyg_kort",
        id: `mock-mal-bash-${n}`,
        namn: "Bash",
        steg: "planerad",
        beskrivning: `Iteration ${n}: letar filer mot målet`,
      });
      l({
        typ: "verktyg_kort",
        id: `mock-mal-bash-${n}`,
        namn: "Bash",
        steg: "resultat",
        argument: '{"command":"find . -name \\"*.md\\" | head -20"}',
        resultat: "README.md\nworklog.md\nMEGA_PLAN.md",
        varaktighetMs: 120 + n,
      });
      // Verktygskort 2: Write — ändringspanelens diff (per iteration).
      this.mockAndringar = [
        {
          sokvag: `data/mal-iteration-${n}.md`,
          plus: 2,
          minus: 0,
          rader: [
            { typ: "+", text: `# Autonom iteration ${n}` },
            { typ: "+", text: "Steg mot målet (mock-simulering)" },
          ],
        },
      ];
      l({
        typ: "verktyg_kort",
        id: `mock-mal-write-${n}`,
        namn: "Write",
        steg: "resultat",
        argument: `{"file_path":"data/mal-iteration-${n}.md"}`,
        resultat: "Filen skapad (2 rader).",
        varaktighetMs: 40,
      });
      // Streaming: iterationens svar.
      const svar = `**Iteration ${n} mot målet klar (mock).** Loopen fortsätter — pausa när du vill.`;
      l({ typ: "delta", kanal: "text", text: svar });
      l({
        typ: "runda",
        fas: "slut",
        varaktighetMs: 900 + n * 10,
        resultatTyp: "success",
        verktygAntal: 2,
        tokenCount: 96 + n,
      });
      l({
        typ: "mal_iteration",
        fas: "slut",
        iteration: n,
        svar,
        resultatTyp: "success",
        verktygAntal: 2,
        tokenCount: 96 + n,
        varaktighetMs: 900 + n * 10,
      });
      // VÅG 91 A1a/A1b (mock): svaret sparas i kartan + senaste-event-raden.
      markeraMalIterationSlut(this.mockSid, n, svar);
      this.mockMalSenasteEvent = beskrivMalEvent({
        typ: "mal_iteration",
        fas: "slut",
        iteration: n,
        resultatTyp: "success",
      });
      this.mockMalSenasteEventTid = Date.now();
      this.mockMalTimer = setTimeout(kör, 7_000);
    };
    this.mockMalTimer = setTimeout(kör, 1_200);
  }

  private stoppaMockMalLoop(): void {
    if (this.mockMalTimer !== null) {
      clearTimeout(this.mockMalTimer);
      this.mockMalTimer = null;
    }
  }

  async lasSubagenter(): Promise<StudioSubagent[]> {
    await this.ensure();
    return this.mockSubagenter.map((s) => ({ ...s }));
  }

  async avbrytBakgrundsTask(taskId: string): Promise<StudioAvbrytSvar> {
    await this.ensure();
    const agent = this.mockSubagenter.find((s) => s.barnSessionId === taskId);
    if (!agent) {
      return { avbruten: false, meddelande: `Mock: tasken ${taskId.slice(0, 13)}… hittades ej.` };
    }
    if (agent.status !== "running" && agent.status !== "waiting" && agent.status !== "blocked") {
      return { avbruten: false, meddelande: `Mock: agenten är redan ${agent.status}.` };
    }
    agent.status = "cancelled";
    agent.avslutad = new Date().toISOString();
    return { avbruten: true, meddelande: "Mock: tasken avbruten." };
  }

  async lasArbetsyta(): Promise<StudioArbetsytaInfo | null> {
    await this.ensure();
    return {
      arbetsyta: "/home/ak1a/agent/ak1",
      lage: "build",
      modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
      tankeNiva: "max",
      behorighet: "auto",
      modellerTillgangliga: 5,
      kommandon: 12,
    };
  }

  // ── VÅG 93 C1 (mock): workspace-inställningar · plugins-drift · events ─────
  // Deterministisk dev-spegling av prod-formerna — instansens egna fält är
  // sanningen; C2:s rutter (installningar/fardigheter) bevisas utan barn.

  async lasWorkspaceInstallningar(): Promise<StudioWorkspaceInstallningar | null> {
    await this.ensure();
    return {
      modell: this.mockStandardModell ?? (this.mockModell ? `mock/${this.mockModell}` : "mock/demo"),
      tankestyrka: this.mockStandardTankestyrka ?? this.mockTankeNiva ?? "max",
      lage: this.mockStandardLage ?? this.mockLage ?? "build",
      annan: {
        behorighet: "auto",
        tankeNivaer: ["nothink", "high", "max"],
        modellKatalog: ["mock/demo", "mock/glm-5.3", "mock/glm-5.2"],
        arbetsyta: "/home/ak1a/agent/ak1",
      },
    };
  }

  async sparaStandardModell(modell: string | { providerId: string; modelId: string }): Promise<StudioSparadInstallning> {
    await this.ensure();
    const ref = tolkaModellArgument(modell);
    this.mockStandardModell = `${ref.providerId}/${ref.modelId}`;
    return { satt: true, bekräftad: this.mockStandardModell, meddelande: "Mock: standardmodellen sparad — gäller nästa samtal." };
  }

  async sparaStandardTankestyrka(niva: string): Promise<StudioSparadInstallning> {
    await this.ensure();
    const nivaRen = renInstallningsVarde(niva, "tankestyrka");
    this.mockStandardTankestyrka = nivaRen;
    return { satt: true, bekräftad: nivaRen, meddelande: "Mock: standard-tankestyrkan sparad — gäller nästa samtal." };
  }

  async sparaStandardLage(lage: string): Promise<StudioSparadInstallning> {
    await this.ensure();
    const lageRen = renInstallningsVarde(lage, "lage");
    this.mockStandardLage = lageRen;
    return { satt: true, bekräftad: lageRen, meddelande: "Mock: standard-läget sparat — gäller nästa samtal." };
  }

  // C2-sond-kompatibla alias (sattStandard*-familjen) — samma dev-bryggor.
  sattStandardModell = async (
    modell: string | { providerId: string; modelId: string },
  ): Promise<StudioSparadInstallning> => this.sparaStandardModell(modell);
  sattStandardTankeNiva = async (niva: string): Promise<StudioSparadInstallning> =>
    this.sparaStandardTankestyrka(niva);
  sattStandardLage = async (lage: string): Promise<StudioSparadInstallning> => this.sparaStandardLage(lage);

  async pluginSattAktiverad(namn: string, aktiverad: boolean, omfattning?: string): Promise<StudioPluginAktiveradSvar> {
    await this.ensure();
    const id = typeof namn === "string" ? namn.trim() : "";
    if (!id) throw new Error("plugin-id krävs (icke-tom sträng).");
    const post = this.mockPlugins.find((p) => p.id === id || p.namn === id);
    if (!post) throw new Error(`Pluginen ${id.slice(0, 24)} hittades ej (mock).`);
    post.aktiv = aktiverad === true;
    return {
      satt: true,
      meddelande: `Mock: pluginen ${post.id} ${post.aktiv ? "aktiverad" : "inaktiverad"}.`,
      bekräftadAktiverad: post.aktiv,
    };
  }

  async lasEventsFranSeq(sessionId: string, franSeq?: number, tak?: number): Promise<StudioEventsSvar | null> {
    if (typeof sessionId !== "string" || !/^sess_[A-Za-z0-9._-]+$/.test(sessionId)) {
      throw new Error("Ogiltigt sessions-id.");
    }
    await this.ensure();
    // Deterministisk replay (sekventiell från cursorn) — dev-E2E kan bevisa
    // backfill + paging-cursor utan barnprocess; mocken nekas ALDRIG.
    const fran = Number.isInteger(franSeq) && (franSeq as number) >= 0 ? (franSeq as number) : 0;
    const grans = Math.min(
      Math.max(Number.isInteger(tak) && (tak as number) > 0 ? (tak as number) : MAX_EVENTS_TAK, 1),
      MAX_EVENTS_PER_FRAGA,
    );
    const råa: StudioEventPost[] = [
      { typ: "turn.started", seq: fran + 1, payload: { mock: true, turnNumber: 1 } },
      {
        typ: "model.streaming",
        seq: fran + 2,
        payload: { mock: true, kind: "text_delta", delta: "Mock-replay: händelsen som missades medan du var borta." },
      },
      { typ: "turn.completed", seq: fran + 3, payload: { mock: true, resultType: "success" } },
    ];
    const handelser = råa.slice(0, grans);
    return { handelser, nastaSeq: fran + handelser.length + 1 };
  }

  // ── VÅG 85 F3 (mock): usage/stats — deterministisk, >0 för dev-E2E ──────

  async lasUsage(): Promise<StudioUsageSvar> {
    await this.ensure();
    // Speglar protokollets LIVE-form (prod-sond 2026-09-10: models[] MED
    // requestCount + dailyModelUsage[] per dag) med tydligt mock-märkta
    // modellnamn + fasta siffror >0 — dev-E2E:t (GET svarar med usage-
    // siffror >0) går igenom utan modell; prod bär de ÄRLIGA siffrorna.
    const totalTokens = 1_048_576;
    const idag = 149_796;
    const igar = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const modeller: StudioUsageModell[] = [
      { modell: "mock-glm-5.3", tokens: 786_432, andel: 0.75, antal: 214 },
      { modell: "mock-glm-5.2", tokens: 262_144, andel: 0.25, antal: 58 },
    ];
    return {
      råSvar: {
        range: "7d",
        generatedAt: new Date().toISOString(),
        timeZone: "UTC",
        source: "mock",
        summary: {
          totalTokens,
          inputTokens: 917_504,
          outputTokens: 131_072,
          reasoningTokens: 65_536,
          cacheCreationTokens: 40_960,
          cacheReadTokens: 311_296,
          cacheHitRate: 0.31,
          totalSessions: 8,
          totalTurns: 96,
          toolCallCount: 240,
          toolErrorRate: 0.01,
          modelErrorRate: 0,
        },
        models: [
          { modelId: "mock-glm-5.3", totalTokens: 786_432, inputTokens: 720_896, outputTokens: 65_536, requestCount: 214, share: 0.75 },
          { modelId: "mock-glm-5.2", totalTokens: 262_144, inputTokens: 245_760, outputTokens: 16_384, requestCount: 58, share: 0.25 },
        ],
        dailyModelUsage: [
          { date: igar, models: [{ modelId: "mock-glm-5.3", totalTokens: 96_512 }, { modelId: "mock-glm-5.2", totalTokens: 32_768 }] },
          { date: new Date().toISOString().slice(0, 10), models: [{ modelId: "mock-glm-5.3", totalTokens: 112_347 }, { modelId: "mock-glm-5.2", totalTokens: 37_449 }] },
        ],
      },
      totalTokens,
      inputTokens: 917_504,
      outputTokens: 131_072,
      reasoningTokens: 65_536,
      cacheReadTokens: 311_296,
      cacheCreationTokens: 40_960,
      cacheHitRate: 0.31,
      totalSessions: 8,
      totalTurns: 96,
      toolCallCount: 240,
      modeller,
      totalTokens24h: idag,
      kalla24h: "dagsrad",
    };
  }

  // ── VÅG 85 F2: skills/plugins/MCP — deterministisk dev-simulering ────────
  // Speglar prod-formerna (referenceCatalog/plugins/list/mcp/list) så
  // panelen, API-rutten och dev-E2E:kedjan bevisas utan barnprocess.

  async lasSkills(): Promise<StudioSkill[]> {
    await this.ensure();
    return [
      {
        id: "mock:ak1a-analys",
        namn: "ak1a-analys",
        beskrivning: "Användarens eget ekosystem-ramverk (5 horisonter × 5 teorier × 4 dimensioner) med Monte Carlo och Kelly (mock-demo av skills/referenceCatalog).",
        omfattning: "user",
        sokvag: "C:/Users/…/.agents/skills/ak1a-analys/SKILL.md",
        aktiv: true,
      },
      {
        id: "mock:pdf",
        namn: "pdf",
        beskrivning: "Professionell PDF-verktygslåda — rapporter, affischer, uppsatser, extrahering och sammanslagning (mock).",
        omfattning: "plugin",
        aktiv: true,
      },
      {
        id: "mock:presentation",
        namn: "presentation",
        beskrivning: "Avstängd demo-skill — panelen gråmar scope inaktiva (mock).",
        omfattning: "workspace",
        aktiv: false,
      },
    ];
  }

  /**
   * VÅG 93 C1 (mock): TILLSTÅNDSBÄRANDE pluginlista — varje post bär
   * aktiveringsstatus (enabled-fältet "aktiv") + version; pluginSattAktiverad
   * togglar i listan (dev-E2E: på/av tur-retur deterministiskt, mock-kortet
   * "ios-simulator" levereras AVSTÄNGT som utgångsläge).
   */
  private readonly mockPlugins: StudioPlugin[] = [
    {
      id: "document-skills",
      namn: "document-skills",
      beskrivning: "DOCX/PDF/PPTX/XLSX — dokumentverktygen (mock-demo av plugins/list).",
      version: "0.1.4",
      aktiv: true,
      skillAntal: 4,
      kalla: "zcode-plugins-official",
    },
    {
      id: "android-emulator",
      namn: "android-emulator",
      beskrivning: "Bygg, kör och inspektera Android-appar (mock).",
      version: "0.1.0",
      aktiv: true,
      skillAntal: 1,
      kalla: "zcode-plugins-official",
    },
    {
      id: "ios-simulator",
      namn: "ios-simulator",
      beskrivning: "Tillgänglig men ej aktiverad — panelen visar den utan grön prick (mock).",
      version: "0.1.0",
      aktiv: false,
      skillAntal: 1,
      kalla: "zcode-plugins-official",
    },
  ];

  async lasPlugins(): Promise<StudioPlugin[]> {
    await this.ensure();
    // Aktiva först (samma ordning som prod) — spegling per post.
    const ut = this.mockPlugins.map((p) => ({ ...p }));
    return [...ut.filter((p) => p.aktiv), ...ut.filter((p) => !p.aktiv)];
  }

  async lasMcp(): Promise<StudioMcpServer[]> {
    await this.ensure();
    return [
      {
        namn: "android-emulator",
        status: "connected",
        transport: "stdio",
        verktygAntal: 23,
        uppdaterad: new Date().toISOString(),
      },
      {
        namn: "web-reader",
        status: "connected",
        transport: "http",
        verktygAntal: 1,
        uppdaterad: new Date().toISOString(),
      },
      {
        namn: "demo-nere",
        status: "failed",
        transport: "stdio",
        verktygAntal: 0,
        fel: "anslutningen nekades (mock-demo av fel-vägen)",
      },
    ];
  }

  // ── VÅG 91 A1d + VÅG 92 B1 (mock): bilder + tjänste-bryggor — dev-vy ────────

  async skickaMedBild(
    prompt: string,
    bildSokvagar: string[],
    lyssnare: StudioLyssnare,
    signal?: AbortSignal,
  ): Promise<void> {
    // VÅG 92 B1 (mock): laddaUppBilaga sonderas per bild (riktig fil i
    // lokala arbetsytan ≤ 5 MB → mock-attachmentId) — men prompten behåller
    // ALLTID sökvägsblocket (mocken har ingen v4-gateway; dev-E2E:v91:s
    // "[Bifogade bilder"-punkt förblir deterministisk). Status-pixeln bär
    // vilken väg varje bild tog (B3:s "Bilaga ✓"-UI kan bevisas i dev).
    const { bilder } = byggPromptMedBilder(prompt, bildSokvagar);
    let viaProtokoll = 0;
    for (let i = 0; i < bilder.length; i++) {
      const bilaga = await this.laddaUppBilaga(bilder[i]).catch(() => null);
      if (bilaga) viaProtokoll += 1;
      lyssnare({
        typ: "status",
        text: bilaga
          ? `Bilaga ${i + 1}/${bilder.length} ✓ (mock-attachment)`
          : `Bilaga ${i + 1}/${bilder.length} via sökväg (mock)`,
      });
    }
    const { prompt: utokad } = byggPromptMedBilder(prompt, bilder);
    if (viaProtokoll > 0) {
      lyssnare({
        typ: "status",
        text: `${viaProtokoll}/${bilder.length} bilagor via protokoll-flödet (mock) — resten som sökvägsreferenser.`,
      });
    }
    await this.skicka(utokad, lyssnare, signal);
  }

  async laddaUppBilaga(sokvag: string): Promise<StudioBilagaRef | null> {
    // Mock-spegling av prod-sanningen: en RIKTIG fil i lokala arbetsytan
    // (≤ 5 MB, sanitär sökväg) ger ett deterministiskt mock-id; annars null
    // (samma null-fallback som prod). Ingen v4-gateway finns i dev.
    await this.ensure();
    const rent = saniteraBilageSokvag(sokvag);
    if (!rent) return null;
    const hel = bilageSokvagIArbetsyta(studioArbetsyta(), rent);
    if (!hel) return null;
    try {
      const info = statSync(hel);
      if (!info.isFile() || info.size <= 0 || info.size > MAX_BILAGA_BYTE) return null;
    } catch {
      return null;
    }
    return {
      attachmentId: `mock-bilaga-${Date.now().toString(36)}`,
      ref: { mock: true, fileName: rent.split("/").pop() ?? "bilaga" },
    };
  }

  async lasBakgrundsjobb(): Promise<StudioBakgrundsjobb[]> {
    await this.ensure();
    // VÅG 92 B1 (mock): FULL form — titel + startad följer med (dev-E2E
    // för P0-4-panelen får samma fält som prod).
    return this.mockSubagenter.map((s) => ({
      id: s.barnSessionId,
      typ: s.typ,
      status: s.status,
      beskrivning: s.sammanfattning ?? s.titel,
      titel: s.titel,
      startad: s.startad,
      avbrytbar: s.status === "running" || s.status === "waiting" || s.status === "blocked",
    }));
  }

  async lasWebblasare(): Promise<StudioWebblasare[]> {
    await this.ensure();
    return [
      {
        id: "mock-browser-1",
        generation: 1,
        typ: "chromium",
        namn: "Mock-webbläsare (dev)",
      },
    ];
  }

  async korWebblasare(kommando: { browserId?: string; browserGeneration?: number; kommando: string }): Promise<unknown> {
    await this.ensure();
    if (typeof kommando?.kommando !== "string" || !kommando.kommando.trim()) {
      throw new Error("kommando krävs (webbläsarkommandot som sträng).");
    }
    return { mock: true, kommando: kommando.kommando.slice(0, 200), resultat: "Mock: kommandot kördes (dev-demo)." };
  }

  /**
   * VÅG 92 B1 (mock): tillståndsbärande automationslista — dev-E2E kan
   * skapa→pausa→radera (B4:s v92-svit) deterministiskt utan protokoll.
   */
  private mockAutomationer: StudioAutomation[] = [
    {
      id: "mock-automation-1",
      titel: "Mock-automation (dev)",
      cron: "0 7 * * *",
      status: "active",
      nastaKorning: new Date(Date.now() + 3_600_000).toISOString(),
      nastaNastaKorning: new Date(Date.now() + 90_000_000).toISOString(),
      korningar: 4,
      senasteKorning: new Date(Date.now() - 86_400_000).toISOString(),
      aktiverad: true,
      prompt: "Sammanfatta gårdagens studioarbete (mock).",
    },
  ];

  async lasAutomationer(): Promise<StudioAutomation[]> {
    await this.ensure();
    return this.mockAutomationer.map((a) => ({ ...a }));
  }

  // ── VÅG 92 B1 (mock): AUTOMATION CRUD — deterministisk dev-kedja.
  // Pilfält (this-bundna) — B2:s rutt lösgör metoden från instansen. ──────

  automationSkapa = async (skapa: StudioAutomationSkapa): Promise<StudioAutomation | null> => {
    await this.ensure();
    const namn = typeof skapa?.namn === "string" ? skapa.namn.trim() : "";
    const prompt = typeof skapa?.prompt === "string" ? skapa.prompt.trim() : "";
    if (!namn) throw new Error("namn krävs för en automation.");
    if (!prompt) throw new Error("prompt krävs för en automation.");
    const cron = typeof skapa.schema === "string" ? skapa.schema.trim() : "";
    const post: StudioAutomation = {
      id: `mock-auto-${Date.now().toString(36)}`,
      titel: namn.slice(0, 200),
      ...(cron ? { cron: cron.slice(0, 120) } : {}),
      status: "active",
      nastaKorning: new Date(Date.now() + 3_600_000).toISOString(),
      aktiverad: true,
      prompt: truncat(prompt, 200),
    };
    this.mockAutomationer.unshift(post);
    return { ...post };
  }

  automationUppdatera = async (id: string, andring: { pausad?: boolean }): Promise<StudioAutomation | null> => {
    await this.ensure();
    const post = this.mockAutomationer.find((a) => a.id === id);
    if (!post) throw new Error(`Automationen ${String(id).slice(0, 24)} hittades ej (mock).`);
    if (typeof andring?.pausad === "boolean") {
      post.aktiverad = !andring.pausad;
      post.status = andring.pausad ? "paused" : "active";
    }
    return { ...post };
  }

  automationRadera = async (id: string): Promise<{ raderad: boolean; meddelande: string }> => {
    await this.ensure();
    const index = this.mockAutomationer.findIndex((a) => a.id === id);
    if (index < 0) {
      return { raderad: false, meddelande: `Automationen ${String(id).slice(0, 24)} hittades ej (mock).` };
    }
    this.mockAutomationer.splice(index, 1);
    return { raderad: true, meddelande: "Mock: automationen raderad." };
  }

  // ── VÅG 92 B1 (mock): SKICKA-AUTOMATION — vanlig skicka + ärlig pixel ─────

  async skickaAutomation(
    prompt: string,
    automationId?: string,
    offPeak?: boolean,
    lyssnare?: StudioLyssnare,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.ensure();
    const text = typeof prompt === "string" ? prompt.trim() : "";
    if (!text) throw new Error("Prompten är tom.");
    const l: StudioLyssnare = lyssnare ?? (() => undefined);
    if (typeof automationId === "string" && automationId.trim()) {
      l({
        typ: "status",
        text: `Kör som automation ${automationId.trim().slice(0, 16)}… (mock — fältet följer ej med i dev).`,
      });
    } else if (offPeak) {
      l({ typ: "status", text: "Kör som off-peak-uppgift (mock — fältet följer ej med i dev)." });
    }
    await this.skicka(text, l, signal);
  }

  async genereraText(prompt: string): Promise<{ text: string; råSvar: unknown }> {
    await this.ensure();
    const text = `Mock-generering (ingen modell): ${prompt.trim().slice(0, 300)}`;
    return { text, råSvar: { mock: true, finishReason: "mock" } };
  }

  async skicka(
    prompt: string,
    lyssnare: StudioLyssnare,
    signal?: AbortSignal,
    extra?: StudioSkickaExtra,
  ): Promise<void> {
    await this.ensure();
    const sov = (ms: number) =>
      new Promise<void>((los) => {
        const t = setTimeout(los, ms);
        signal?.addEventListener("abort", () => { clearTimeout(t); los(); }, { once: true });
      });

    // VÅG 92 B1 (mock): extrafälten (attachments/automationId/offPeak*)
    // ekas i svaret — dev ser ÄRLIGT vilka protokollfält som följde med.
    const extraAntal = Array.isArray(extra?.attachments) ? extra!.attachments!.length : 0;
    const extraRad = extra
      ? `- session/send-extra: ${extraAntal} bilagor${typeof extra.automationId === "string" ? ` · automation ${extra.automationId.slice(0, 16)}…` : ""}${typeof extra.offPeakTaskId === "string" ? " · off-peak" : ""} (mock)`
      : null;

    // V83 B1: verktygskorten strömmas i protokollföljd — runda → live-input
    // → kortens livscykel (planerad/startar/kör/resultat/fel) → runda slut.
    lyssnare({ typ: "runda", fas: "start" });
    lyssnare({ typ: "status", text: "Agenten arbetar… (mock)" });
    await sov(100);

    // Kort 1: Bash — live-input (model.streaming tool_input_delta) + progress.
    lyssnare({ typ: "verktyg_kort", id: "mock-bash", namn: "Bash", steg: "planerad", beskrivning: "Listar uppladdningar" });
    for (const bit of ['{"comm', 'and":"ls u', 'ploads/"}']) {
      if (signal?.aborted) break;
      lyssnare({ typ: "verktyg_input", id: "mock-bash", text: bit });
      await sov(60);
    }
    lyssnare({ typ: "verktyg_kort", id: "mock-bash", namn: "Bash", steg: "startar", argument: '{"command":"ls uploads/"}' });
    await sov(110);
    lyssnare({
      typ: "verktyg_kort",
      id: "mock-bash",
      namn: "Bash",
      steg: "kör",
      framsteg: { elapsedMs: 140, utdata: "2026-09-08\n2026-09-09" },
    });
    await sov(140);
    lyssnare({
      typ: "verktyg_kort",
      id: "mock-bash",
      namn: "Bash",
      steg: "resultat",
      argument: '{"command":"ls uploads/"}',
      resultat: "2026-09-08\n2026-09-09",
      varaktighetMs: 290,
    });

    // Kort 2: Write — ger ändringspanelen dess deterministiska diff.
    lyssnare({ typ: "verktyg_kort", id: "mock-write", namn: "Write", steg: "planerad" });
    await sov(70);
    lyssnare({ typ: "verktyg_kort", id: "mock-write", namn: "Write", steg: "resultat", argument: '{"file_path":"uploads/demo.txt","content":"rad 1\nrad 2\nrad 3"}', resultat: "Filen skapad (3 rader).", varaktighetMs: 80 });
    this.mockAndringar = [
      {
        sokvag: "uploads/demo.txt",
        plus: 3,
        minus: 0,
        rader: [
          { typ: "+", text: "rad 1" },
          { typ: "+", text: "rad 2" },
          { typ: "+", text: "rad 3" },
        ],
      },
    ];

    // Kort 3: Grep med FEL — det röda kortet.
    lyssnare({ typ: "verktyg_kort", id: "mock-grep", namn: "Grep", steg: "startar", argument: '{"pattern":"finans*"}' });
    await sov(90);
    lyssnare({ typ: "verktyg_kort", id: "mock-grep", namn: "Grep", steg: "fel", fel: "Ogiltigt regex: oavslutad grupp (mock-demo av fel-vägen)" });

    // V83 B2 + V84 C: simulerad PERMISSION-DIALOG — bevisar hela kedjan i
    // dev: interaktion-event → dialogkort (med DIFF-FÖRHANDSVISNING för
    // Write/Edit/MultiEdit) → POST /api/studio/interaktion → svarPermission
    // → interaktionsKlar. 30 s-default = escalate (samma KVD-regel som prod).
    const permId = `mock-perm-${Date.now().toString(36)}`;
    const permBeslut = await new Promise<string>((los) => {
      // V84 C: mocken använder en EDIT (skrivverktyg = orange riskklass +
      // old/new-string ger EXAKT −N/+N i förhandsvisningen).
      const permInput = {
        file_path: "uploads/demo.txt",
        old_string: "rad 2",
        new_string: "rad 2 (redigerad av agenten)",
      };
      const permInteraktion: Extract<StudioInteraktion, { typ: "permission" }> = {
        typ: "permission",
        requestId: permId,
        verktyg: "Edit",
        risk: "high",
        skäl: "Mock: verifiera godkännandedialogen med diff-förhandsvisning (V84 C)",
        sammanfattning: sammanfattaInput(permInput),
        alternativ: [
          { optionId: "allow_once", namn: "Allow once" },
          { optionId: "allow_project", namn: "Allow for project" },
          { optionId: "deny", namn: "Deny" },
        ],
        diff: diffUrInput("Edit", permInput) ?? undefined,
      };
      const timer = setTimeout(() => {
        this.mockVantan = null;
        lyssnare({ typ: "interaktionsKlar", requestId: permId, beslut: "eskal", skäl: "ingen respons inom 30 s" });
        los("eskal");
      }, 30_000);
      this.mockVantan = { interaktion: permInteraktion, los: (b) => { clearTimeout(timer); los(b); } };
      lyssnare({ typ: "interaktion", interaktion: permInteraktion });
    });
    this.mockVantan = null;
    // V84 C: tilläts mock-editen speglar ändringspanelen beslutet (−1/+1)
    // — samma ärlighet som prod (nekad Write skall ALDRIG synas i panelen).
    if (permBeslut === "allow_once" || permBeslut === "allow_project") {
      this.mockAndringar = this.mockAndringar.map((f) =>
        f.sokvag === "uploads/demo.txt"
          ? {
              ...f,
              plus: f.plus + 1,
              minus: f.minus + 1,
              rader: [
                ...f.rader,
                { typ: "-" as const, text: "rad 2" },
                { typ: "+" as const, text: "rad 2 (redigerad av agenten)" },
              ],
            }
          : f,
      );
    }

    // V83 B2: simulerat FRÅGEKORT (requestUserInput — knappval eller fritext).
    const fragId = `mock-fraga-${Date.now().toString(36)}`;
    const fragSvar = await new Promise<string>((los) => {
      const fragInteraktion: Extract<StudioInteraktion, { typ: "fråga" }> = {
        typ: "fråga",
        requestId: fragId,
        fråga: "Mock-fråga: vill du att sammanfattningen hålls kort?",
        inputTyp: "choice",
        val: ["Ja, korta ner", "Nej, full längd"],
      };
      const timer = setTimeout(() => {
        this.mockVantanFraga = null;
        lyssnare({ typ: "interaktionsKlar", requestId: fragId, beslut: "avbruten", skäl: "ingen respons inom 30 s" });
        los("(tidsgräns)");
      }, 30_000);
      this.mockVantanFraga = { interaktion: fragInteraktion, los: (v) => { clearTimeout(timer); los(v); } };
      lyssnare({ typ: "interaktion", interaktion: fragInteraktion });
    });
    this.mockVantanFraga = null;

    lyssnare({ typ: "verktyg", namn: "LäsRepo", händelse: "start" });
    await sov(150);
    lyssnare({ typ: "verktyg", namn: "LäsRepo", händelse: "slut" });
    lyssnare({ typ: "delta", kanal: "tankar", text: "Mock-läget: jag echoar prompten utan modell." });

    const rader = [
      `**Mottaget:** ${prompt.length > 400 ? `${prompt.slice(0, 400)}…` : prompt}`,
      "",
      "## Studiosvar (mock)",
      "",
      "Detta är **deterministisk demo-utdata** — ingen modell anropades.",
      "",
      ...(extraRad ? [extraRad, ""] : []),
      "- Riktig drift sker på servern där `zcode app-server` lever",
      "- Sessionen hålls vid liv mellan prompter",
      "- Uppladdade filer får sökvägar som `uploads/<datum>/<namn>`",
      `- Permission-dialog (mock): **${permBeslut}** · frågekort (mock): **${fragSvar || "(tidsgräns)"}**`,
      "",
      "```txt",
      "transport: mock · protokoll: bevisat i tool-results/v81-appserver.md",
      "```",
    ];
    let svar = "";
    for (const rad of rader) {
      if (signal?.aborted) break;
      lyssnare({ typ: "delta", kanal: "text", text: `${rad}\n` });
      svar += `${rad}\n`;
      await sov(35);
    }
    this.historikPoster.push({ roll: "user", text: prompt });
    this.historikPoster.push({ roll: "assistant", text: svar.trim() });
    this.mockTotalt += 128;
    this.mockTurns += 1;
    lyssnare({
      typ: "runda",
      fas: "slut",
      varaktighetMs: rader.length * 35 + 1_040,
      resultatTyp: "success",
      verktygAntal: 4,
      tokenCount: 128,
    });
    lyssnare({ typ: "klart", svar: svar.trim(), tokenCount: 128, varaktighetMs: rader.length * 35 + 270 });
  }
}

// ── Fabrik (injektionpunkt) ──────────────────────────────────────────────────

/**
 * Agentens arbetsyta — EN sanningskälla för hela studio-ytan (våg 83 B4):
 * STUDIO_WORKSPACE → /home/ak1a/agent/ak1 (Contabo-hem, om den finns) →
 * cwd. Används av hamtaStudioTransport() och av /api/studio/filer så att
 * filträdet ALLTID speglar samma rot som agenten jobbar i.
 */
export function studioArbetsyta(): string {
  const hem = "/home/ak1a/agent/ak1";
  return process.env.STUDIO_WORKSPACE || (existsSync(hem) ? hem : process.cwd());
}

let aktivTransport: StudioTransport | null = null;

/**
 * Transportnamn ur miljön — STUDIO_TRANSPORT=mock|appserver tvingar; annars
 * mock på win32 (dev) och appserver annars (prod = Contabo, linux).
 */
function studioTransportNamn(): "appserver" | "mock" {
  const tvingad = process.env.STUDIO_TRANSPORT;
  return tvingad === "mock" || tvingad === "appserver"
    ? tvingad
    : process.platform === "win32"
      ? "mock"
      : "appserver";
}

/** zcode-binärkandidater (env → PATH → Contabo-hem). */
function zcodeBinärer(): string[] {
  return [
    process.env.STUDIO_ZCODE_BIN,
    "zcode",
    "/home/ak1a/.npm-global/bin/zcode", // Contabo-installationens hem
  ].filter((b): b is string => typeof b === "string" && b.length > 0);
}

/**
 * Miljöstyrd transport — injektionspunkten som dev-testet och framtida
 * tmux-fallback kopplar in sig på:
 *   STUDIO_TRANSPORT=mock|appserver tvingar; annars mock på win32 (dev)
 *   och appserver annars (prod = Contabo, linux).
 */
export function hamtaStudioTransport(): StudioTransport {
  if (aktivTransport) return aktivTransport;

  if (studioTransportNamn() === "mock") {
    aktivTransport = new MockTransport();
    return aktivTransport;
  }

  aktivTransport = new AppServerTransport(
    [...new Set(zcodeBinärer())],
    studioArbetsyta(),
    path.join(process.env.STUDIO_LAGRING || os.tmpdir(), "ak1a-studio-session.json"),
  );
  return aktivTransport;
}

// ── VÅG 95: VARMFÖRHÅLLANDE — kallstarten betald vid serverstart ─────────────

/** Varmförhållnings-förskjutning (ms): Next-boot/kompilering får gå före. */
const VARM_FORSJUTNING_MS = 8_000;

/**
 * VÅG 95 — best-effort VARMFÖRHÅLLANDE av standard-transporten (kund-
 * problemet "sega", källa 2: kall-start av zcode-barnprocessen — spawn +
 * session/create tar sekunder första gången efter pm2-omstart, och kost-
 * naden landade tidigare på FÖRSTA kundmeddelandet). Startar standard-
 * barnprocessen + en session I BAKGRUNDEN (ej blockerande) så första
 * kundmeddelandet träffar en varm transport.
 *
 *   · Idempotent: globalThis-vakt ⇒ MAX EN GÅNG per process (även vid
 *     Next dev-hot-reload som evaluera modulen flera gånger).
 *   · Tyst fel: ensure-fel äts (ingen logg, inget kast) — misslyckad
 *     varmning är exakt dagens nuläge (första meddelandet betalar).
 *   · Mock-neutral: mock (dev/test) värmer ALDRIG — inget barn finns.
 *   · `next build`-fasen hoppas över (NEXT_PHASE) — inga zcode-barn
 *     föds under bygget; STUDIO_VARM=av är driftbrytaren.
 *   · RAM: ETT barn (default-transporten); hushållningens 2 h-idle-
 *     städning stänger det om ingen kund kom — värmen kostar aldrig
 *     mer än startfönstret. VAKT: friskgångs-persistensen (ovan) gör att
 *     varmningen resume:ar en FRISK session när den sparade är >24 h /
 *     modellDod — själva -32031-dubbelturen betalas alltså OCKSÅ vid
 *     serverstart i stället för i kundens första meddelande.
 */
export function varmStudioTransport(): void {
  if (studioTransportNamn() === "mock") return; // dev/test: inget barn att värma
  if (process.env.STUDIO_VARM === "av") return; // driftbrytare (default PÅ)
  if (process.env.NEXT_PHASE === "phase-production-build") return; // ej i build
  const vakt = globalThis as { __ak1aStudioVag95VarmKor?: boolean };
  if (vakt.__ak1aStudioVag95VarmKor) return; // MAX en gång per process
  vakt.__ak1aStudioVag95VarmKor = true;
  const varmTimer = setTimeout(() => {
    try {
      const transport = hamtaStudioTransport();
      void transport.ensure().catch(() => undefined); // TYST fel — se ovan
    } catch {
      // tyst — t.o.m. binär-saknad är accepterat (dagens nuläge)
    }
  }, VARM_FORSJUTNING_MS);
  varmTimer.unref(); // varmnings-timern får ALDRIG hålla processen vid liv
}

// ── VÅG 84 B: MULTI-SESSION — sessionskarta + per-session-transporter ────────

/** Sessionskartans tak — äldsta senasteAktivitet avlägsnas först (LRU). */
const MAX_SESSIONER_I_KARTA = 50;
/** Historik-tak per session i kartan (prompt/svar-par, ankomstordning). */
const MAX_HISTORIK_I_KARTA = 100;

/** sessionId → kort (senaste aktivitet + minskad historik + aktiv-flagga). */
const sessionskartan = new Map<string, StudioSessionsKort>();
/** sessionId (eller "ny:<tabbnyckel>" före första svaret) → transport. */
const sessionTransporter = new Map<string, StudioTransport>();

/** Sessionskartan som rent objekt — GET /api/studio/stream listar den. */
export function lasStudioSessionskarta(): Record<string, StudioSessionsKort> {
  lasKartaFranDisk(); // VÅG 87 H2: disken hydreras före läsning (pm2-omstart)
  const ut: Record<string, StudioSessionsKort> = {};
  for (const [sid, kort] of sessionskartan) {
    ut[sid] = { ...kort, historik: kort.historik.slice(-40) };
  }
  return ut;
}

/** Prompt startade i sessionen — historiken växer, aktiv=true. */
export function markeraSessionStart(sessionId: string, prompt: string): void {
  if (!sessionId) return;
  lasKartaFranDisk(); // VÅG 87 H2
  const kort = sessionskartan.get(sessionId) ?? {
    senasteAktivitet: Date.now(),
    historik: [],
    aktiv: false,
  };
  kort.senasteAktivitet = Date.now();
  kort.aktiv = true;
  kort.historik.push({ roll: "user", text: prompt.slice(0, 8_000) });
  if (kort.historik.length > MAX_HISTORIK_I_KARTA) {
    kort.historik = kort.historik.slice(-MAX_HISTORIK_I_KARTA);
  }
  sessionskartan.set(sessionId, kort);
  städaKarta();
  schemalaggKartskrivning(); // VÅG 87 H2
}

/** Prompten klar (klart/fel/abort) — svaret (om något) lagras, aktiv=false. */
export function markeraSessionSlut(sessionId: string, svar: string): void {
  if (!sessionId) return;
  const kort = sessionskartan.get(sessionId);
  if (!kort) return;
  kort.senasteAktivitet = Date.now();
  kort.aktiv = false;
  if (svar) kort.historik.push({ roll: "assistant", text: svar.slice(0, 20_000) });
  if (kort.historik.length > MAX_HISTORIK_I_KARTA) {
    kort.historik = kort.historik.slice(-MAX_HISTORIK_I_KARTA);
  }
  schemalaggKartskrivning(); // VÅG 87 H2: "varje gång ett svar klart" → disk
}

// ── VÅG 95: -32031-STÄDNING — friskgång-regeln + modellDod-flaggan ───────────

/** Friskgångsgräns (ms): senaste aktivitet äldre än 24 h ⇒ aldrig resume. */
const GAMMAL_SESSION_GRANS_MS = 24 * 60 * 60 * 1000;

/**
 * VÅG 95 — flagga en session som modellDod vid -32031-självläkningen
 * (ZCODE_RUNTIME_MODEL_UNAVAILABLE: sessionen pin:ar en borttagen modell
 * och kan ALDRIG svara igen). Nästa NYA meddelande mot sessionId:t startar
 * FRISK session direkt (se arFrigangSession) i stället för resume →
 * -32031 → kassera → ny (dubbelturen). Historik-previews i kartposten
 * bevaras OFÖRÄNDRADE — kunden förlorar ingen vy. Skapas-kort-om-saknas:
 * flaggan är poängen (sid:t är giftigt), historiken känner vi ej till.
 */
export function markeraModellDod(sessionId: string): void {
  if (!sessionId) return;
  lasKartaFranDisk();
  const kort = sessionskartan.get(sessionId) ?? {
    senasteAktivitet: Date.now(),
    historik: [],
    aktiv: false,
  };
  kort.modellDod = true;
  kort.aktiv = false;
  sessionskartan.set(sessionId, kort);
  schemalaggKartskrivning(); // disk via debounce — flaggan överlever omstart
}

/**
 * VÅG 95 — är sessionen FRISKGÅNG? true ⇒ ett NYTT meddelande skall starta
 * en FRISK session direkt i stället för resume (resume lyckas tekniskt men
 * första session/send kastar -32031 när modellen dött → självläknings-
 * dubbeltur). Regel: modellDod-flaggan SATT (drabbats en gång) ELLER
 * senaste aktivitet äldre än 24 h. Åldern tas ur KARTANS senasteAktivitet
 * (uppdateras vid VARJE prompt — sanningskällan), med reservTid (t.ex.
 * persistensfilens sparad-tid = sessionens födelse) när kartan saknar
 * posten. Okänd session (ingen post, ingen reservtid) ⇒ false — ärlig
 * resume precis som förut (inget beteendeändras för det okända).
 */
function arFrigangSession(sessionId: string, reservTid?: number | null): boolean {
  lasKartaFranDisk();
  const kort = sessionskartan.get(sessionId);
  if (kort?.modellDod === true) return true;
  const aktivitet =
    typeof kort?.senasteAktivitet === "number"
      ? kort.senasteAktivitet
      : typeof reservTid === "number"
        ? reservTid
        : null;
  if (aktivitet === null) return false;
  return Date.now() - aktivitet > GAMMAL_SESSION_GRANS_MS;
}

/** Håll kartan under taket — avlägsna äldst aktivitet först. */
function städaKarta(): void {
  if (sessionskartan.size <= MAX_SESSIONER_I_KARTA) return;
  const sorterade = [...sessionskartan.entries()].sort(
    (a, b) => a[1].senasteAktivitet - b[1].senasteAktivitet,
  );
  for (const [sid] of sorterade.slice(0, sessionskartan.size - MAX_SESSIONER_I_KARTA)) {
    sessionskartan.delete(sid);
  }
}

// ── VÅG 87 H2: SESSIONSKARTAN PÅ DISK — överlever pm2-omstart ────────────────

/**
 * Skriv-debounce (ms) — svaret-klart-trigger samlas upp, max en skrivning/
 * 30 s (VÅG 88 I3: sänkt från 60 s — ett pm2-hål i historiken krymper till
 * halva samtidigt som en rusande mål-loop fortfarande aldrig skriver mer
 * än en gång per 30 s).
 */
const KARTSKRIV_DEBOUNCE_MS = 30_000;

/** Kartans filnamn i katalogen nedan. */
const KARTA_FILNAMN = "karta.json";

/** true när disken lästs (engångs-hydrering — reset-bar i test-kroken). */
let kartaLäst = false;

/** Väntande debounce-timer (null = ingen skrivning schemalagd). */
let kartaSkrivTimer: ReturnType<typeof setTimeout> | null = null;

// Best-effort spolning när Node stänger ned (pm2 SIGTERM → "exit") —
// debounce-fönstrets 30 s får aldrig bli ett hål i historiken. Registreras
// i våg-90-guard-blocket nedan (EN gång per process); skriver bara när en
// skrivning verkligen väntar.
//
// VÅG 90 K1: se stangAllaBarnSynkront() — SIGTERM spolar kartan TVINGAT
// FÖRE barn-dödandet; detta är den sista nätdelen om processen dör utan signal.
process.on("exit", () => {
  if (kartaSkrivTimer !== null) {
    clearTimeout(kartaSkrivTimer);
    skrivKartaTillDisk();
  }
});

/**
 * Kartans katalog: prod-hemmet /home/ak1a/.zcode/studio-sessions (STYRELSE-
 * ADMIN-MEGA "TILLÄGG VÅG 87" — finns när zcode lever på Contabo), annars
 * STUDIO_LAGRING/tmpdir (dev på Windows: ~/.zcode finns ej). Katalogen
 * skapas rekursivt vid skrivning.
 */
function sessionskartaKatalog(): string {
  const hem = "/home/ak1a/.zcode/studio-sessions";
  if (existsSync("/home/ak1a/.zcode")) return hem;
  return path.join(process.env.STUDIO_LAGRING || os.tmpdir(), "studio-sessions");
}

/** Kartans fulla sökväg. */
function sessionskartaFil(): string {
  return path.join(sessionskartaKatalog(), KARTA_FILNAMN);
}

/**
 * Skriv kartan till disk SYNKTONT (writeFileSync — trumpen men sann; felet
 * äts tyst: disken är lyx, minneskartan är primär). Hela historiken per
 * session följer med (MAX_HISTORIK_I_KARTA-cap gäller redan i minnet).
 */
function skrivKartaTillDisk(): void {
  kartaSkrivTimer = null;
  try {
    const katalog = sessionskartaKatalog();
    mkdirSync(katalog, { recursive: true });
    const karta: Record<string, StudioSessionsKort> = {};
    for (const [sid, kort] of sessionskartan) karta[sid] = kort;
    writeFileSync(sessionskartaFil(), JSON.stringify({ version: 1, sparad: Date.now(), karta }), "utf8");
  } catch {
    // skrivskyddad/full disk — kartan lever vidare i minnet
  }
}

/**
 * Debounce-schemaläggning (30 s trailer, VÅG 88 I3): varje markering flyttar
 * fram skrivningen så en rusande mål-loop aldrig skriver mer än en gång/30 s.
 */
function schemalaggKartskrivning(): void {
  if (kartaSkrivTimer !== null) clearTimeout(kartaSkrivTimer);
  kartaSkrivTimer = setTimeout(skrivKartaTillDisk, KARTSKRIV_DEBOUNCE_MS);
}

/**
 * VÅG 90 K1 — TVINGAD flush: skriv kartan till disk NU (avbryt ev. debounce).
 * Körs vid session-stängning och barnprocess-död — där får 30 s-debounce-
 * fönstret ALDRIG bli ett hål i historiken om pm2 startar om mitt i.
 */
function spolaKartaTillDisk(): void {
  if (kartaSkrivTimer !== null) {
    clearTimeout(kartaSkrivTimer);
    kartaSkrivTimer = null;
  }
  skrivKartaTillDisk();
}

/**
 * Läs kartan från disk VID UPPSTART (engångs-hydrering): pm2-omstart tömde
 * minnet — disken återger sessionerna med senasteAktivitet + historik så
 * GET /api/studio/stream kan svara den SENAST AKTIVA sessionen direkt.
 * Ogiltiga/avsaknade poster hoppas över; redan kända sessionId:n vinner
 * (minnet är nyare sanning). Tyst vid alla fel (korrupt fil = frisk karta).
 */
function lasKartaFranDisk(): void {
  if (kartaLäst) return;
  kartaLäst = true;
  try {
    if (!existsSync(sessionskartaFil())) return;
    const pars = JSON.parse(readFileSync(sessionskartaFil(), "utf8")) as {
      karta?: Record<string, unknown>;
    };
    if (!pars.karta || typeof pars.karta !== "object") return;
    for (const [sid, rå] of Object.entries(pars.karta)) {
      if (!sid || sessionskartan.has(sid)) continue; // minnet vinner
      const k = rå as Partial<StudioSessionsKort>;
      if (typeof k.senasteAktivitet !== "number" || !Array.isArray(k.historik)) continue; // korrupt post
      const historik = k.historik.filter(
        (h): h is StudioHistorikPost =>
          !!h && (h.roll === "user" || h.roll === "assistant") && typeof h.text === "string",
      );
      sessionskartan.set(sid, {
        senasteAktivitet: k.senasteAktivitet,
        historik: historik.slice(-MAX_HISTORIK_I_KARTA),
        aktiv: false, // efter omstart strömmar ingen prompt i Gamla processen
        // VÅG 90 K1: en STÄNGD session förblir stängd efter omstart —
        // annars återbjuds döda sessioner som levande (känt problem).
        ...(k.stangd === true ? { stangd: true } : {}),
        // VÅG 95: modellDod överlever omstart — en session som EN gång
        // drabbats av -32031 resumed aldrig igen (frisk session direkt).
        ...(k.modellDod === true ? { modellDod: true } : {}),
      });
    }
    städaKarta();
  } catch {
    // korrupt/lerig fil — frisk karta
  }
}

// ── VÅG 87 H1: MÅL-ITERATIONER I KARTAN (autonomt arbete syns i historiken) ──

/**
 * Mål-iteration STARTADE (VÅG 87 H1): karta-posten får senasteAktivitet=nu +
 * aktiv=true UTAN att en user-post trycks in (mål-texten sattes en gång —
 * iterationerna är agentens eget arbete). GET-poll:en ser "server arbetar".
 */
export function markeraMalIterationStart(sessionId: string | null): void {
  if (!sessionId) return;
  lasKartaFranDisk();
  const kort = sessionskartan.get(sessionId) ?? {
    senasteAktivitet: Date.now(),
    historik: [],
    aktiv: false,
  };
  kort.senasteAktivitet = Date.now();
  kort.aktiv = true;
  sessionskartan.set(sessionId, kort);
  schemalaggKartskrivning();
}

/**
 * Mål-iterationen KLAR: svaret appendas som assistant-post (🎯-prefix —
 * kartans spegel är MINSKAD; full sanning lever i session/messages) och
 * aktiv=false. Triggar den debouncade diskskrivningen (H2).
 */
export function markeraMalIterationSlut(sessionId: string | null, iteration: number, svar: string): void {
  if (!sessionId) return;
  const kort = sessionskartan.get(sessionId);
  if (!kort) return;
  kort.senasteAktivitet = Date.now();
  kort.aktiv = false;
  const text = svar.slice(0, 20_000);
  if (text) kort.historik.push({ roll: "assistant", text: `🎯 Autonom iteration ${iteration}\n\n${text}` });
  if (kort.historik.length > MAX_HISTORIK_I_KARTA) {
    kort.historik = kort.historik.slice(-MAX_HISTORIK_I_KARTA);
  }
  schemalaggKartskrivning();
}

/**
 * VÅG 87 H1 — ÅTERKOPPLINGSSVARET: den senast aktiva sessionen + HELA dess
 * historik + mål-snapshot, så UI:t vid mount auto-laddar frånvarons arbete.
 * Historikkällan (ärligaste först): levande transport ur registret (resume
 * redan skett — session/messages) → kartan (minne + disk). ALDRIG ny
 * barnprocess här — GET ?sessionId= gör resume när UI:t valt sessionen.
 * Kastar ALDRIG.
 */
export async function lasAterkoppling(): Promise<{
  senastAktivSessionId: string | null;
  senastAktivHistorik: StudioHistorikPost[];
  aktivtMal: StudioMalStatus | null;
}> {
  lasKartaFranDisk();
  let senastAktivSessionId: string | null = null;
  let senasteAktivitet = -1;
  for (const [sid, kort] of sessionskartan) {
    if (kort.senasteAktivitet > senasteAktivitet) {
      senasteAktivitet = kort.senasteAktivitet;
      senastAktivSessionId = sid;
    }
  }
  const standard = aktivTransport?.sessionId() ?? null;
  if (!senastAktivSessionId) senastAktivSessionId = standard; // frisk server: default-sessionen

  let senastAktivHistorik: StudioHistorikPost[] = [];
  if (senastAktivSessionId === standard && aktivTransport) {
    try {
      senastAktivHistorik = await aktivTransport.historik();
    } catch {
      senastAktivHistorik = [];
    }
  } else if (senastAktivSessionId) {
    const levande = sessionTransporter.get(senastAktivSessionId);
    if (levande) {
      try {
        senastAktivHistorik = await levande.historik();
      } catch {
        senastAktivHistorik = [];
      }
    } else {
      senastAktivHistorik = sessionskartan.get(senastAktivSessionId)?.historik.slice(-40) ?? [];
    }
  }

  // Mål-snapshot: transporten som äger den senast aktiva sessionen (mål-
  // loopen lever på DEFAULT-transporten — registret täcker egna tabbar).
  let aktivtMal: StudioMalStatus | null = null;
  const malAgare =
    senastAktivSessionId && senastAktivSessionId !== standard
      ? sessionTransporter.get(senastAktivSessionId)
      : undefined;
  const malTransport = malAgare ?? aktivTransport;
  if (malTransport) {
    const m = malTransport.malStatus();
    if (m.mal !== null || m.aktiv) aktivtMal = m;
  }
  return { senastAktivSessionId, senastAktivHistorik, aktivtMal };
}

/** Filnamnssäker nyckel för per-session-persistensfilen. */
function persistensFilnamn(sessionId: string): string {
  return `ak1a-studio-session-${sessionId.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 60)}.json`;
}

// ── VÅG 145 — HUVUDTRÅDENS BOK (data/vakten/huvudtrad.json) ─────────────────
// Grunden: kundens tråd ska ha EN identitet som ÖVERLEVER sessioner, transporter
// och omstarter. Varje session DEFAULT-transporten skapar/resumear registreras
// här (senaste först, tak 12) — servern blir trådens sanningsägare och vyn
// behöver aldrig gissa vilka sessioner som hör till tråden.
const HUVUDTRAD_SOKVAG = `${process.cwd()}/data/vakten/huvudtrad.json`;

export function registreraHuvudtradSession(sid: string): void {
  try {
    if (typeof sid !== "string" || !sid.startsWith("sess_")) return;
    let lista: string[] = [];
    try {
      const pars = JSON.parse(readFileSync(HUVUDTRAD_SOKVAG, "utf8")) as { sessioner?: unknown };
      if (Array.isArray(pars.sessioner)) lista = pars.sessioner.filter((s): s is string => typeof s === "string");
    } catch {
      /* ny bok */
    }
    const ny = [sid, ...lista.filter((s) => s !== sid)].slice(0, 12);
    mkdirSync(path.dirname(HUVUDTRAD_SOKVAG), { recursive: true });
    writeFileSync(HUVUDTRAD_SOKVAG, JSON.stringify({ sessioner: ny, uppdaterad: Date.now() }, null, 2));
  } catch {
    /* boken är stöd — aldrig fatal */
  }
}

export function lasHuvudtradSessioner(): string[] {
  try {
    const pars = JSON.parse(readFileSync(HUVUDTRAD_SOKVAG, "utf8")) as { sessioner?: unknown };
    return Array.isArray(pars.sessioner) ? pars.sessioner.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

// ── VÅG 148 — TRÅDENS PERMANENS ("z code 100% samma", kunddirektiv ──────────
// 2026-09-14): HELA tråden läses ur zcode:s EGNA sessionsdatabas
// (~/.zcode/cli/db/db.sqlite) — samma källa som Z-code-desktop läser vid
// session/resume. Tidigare sydde KLIENTEN ihop kedjan med en ?sessionId-
// hämtning per länk (= ett zcode-barnprocess per session per refresh) och
// v144-pollen skrev därefter ÖVER den sammanslagna vyn med EN sessions
// historik — kundbevis: tråd på 346 meddelanden visade 26 efter refresh.
// Nu: servern = trådens sanningsägare; GET svarar tradHistorik (bokens
// sessioner i kronologisk ordning, aktuell sessions svans ur LEVANDE
// transport). WAL-läget gör samtidig läsning säker; readOnly öppning.
interface V148SqliteRad {
  mid: string;
  mdata: string;
  pdata: string | null;
}
type V148Databas = { prepare(sql: string): { all(...args: unknown[]): unknown[] } };
let v148Db: V148Databas | null | undefined; // undefined = oläst, null = ej tillgänglig

function v148OppnaDb(): V148Databas | null {
  if (v148Db !== undefined) return v148Db;
  v148Db = null;
  try {
    // pm2-processer saknar ofta HOME i env (bevisat 2026-09-14: prod läste
    // tom tråd) — prod-sökvägen är sista fallbacken; existsSync vaktar.
    const hem = process.env.HOME || process.env.USERPROFILE || "/home/ak1a";
    const sokvag = path.join(hem, ".zcode", "cli", "db", "db.sqlite");
    if (!existsSync(sokvag)) return v148Db;
    // node:sqlite är experimental i Node 22. Bundlern (Turbopack) skriver om
    // require/import-SYNTAX till externa referenser den själv ej kan ladda
    // (bevisat: "Unsupported external type Url") — createRequire är en ren
    // funktionsref den aldrig rör, och node:-moduler löser sig oavsett bas.
    const nodRequire = createRequire(process.execPath);
    const mod = nodRequire("node:sqlite") as {
      DatabaseSync: new (fil: string, alternativ?: { readOnly?: boolean }) => V148Databas;
    };
    v148Db = new mod.DatabaseSync(sokvag, { readOnly: true });
  } catch (fel) {
    v148Db = null; // dev/maskin utan db — tråden faller tillbaka på levande läsning
    console.warn("[V148] db.sqlite kunde ej öppnas: " + String(fel).slice(0, 120));
  }
  return v148Db;
}

/** En sessions fulla user/assistant-text ur db.sqlite (tom lista = okänd). */
function v148SessionFranDb(db: V148Databas, sessionId: string): StudioHistorikPost[] {
  const rader = db
    .prepare(
      "SELECT m.id AS mid, m.data AS mdata, p.data AS pdata " +
        "FROM message m LEFT JOIN part p ON p.message_id = m.id " +
        "WHERE m.session_id = ? ORDER BY m.sequence, p.sequence",
    )
    .all(sessionId) as V148SqliteRad[];
  const ut: StudioHistorikPost[] = [];
  let aktuell: { roll: "user" | "assistant"; text: string[] } | null = null;
  for (const rad of rader) {
    let roll: unknown = null;
    try {
      roll = (JSON.parse(rad.mdata) as { role?: unknown }).role;
    } catch {
      roll = null;
    }
    if (roll !== "user" && roll !== "assistant") {
      aktuell = null;
      continue;
    }
    if (!aktuell || aktuell.roll !== roll) {
      if (aktuell) v148Pusha(ut, aktuell);
      aktuell = { roll, text: [] };
    }
    if (!rad.pdata) continue;
    try {
      const pd = JSON.parse(rad.pdata) as { type?: unknown; text?: unknown };
      if (pd.type === "text" && typeof pd.text === "string" && pd.text.trim()) {
        aktuell.text.push(pd.text);
      }
    } catch {
      /* skadad part-rad — hoppa över */
    }
  }
  if (aktuell) v148Pusha(ut, aktuell);
  return ut;
}

function v148Pusha(ut: StudioHistorikPost[], m: { roll: "user" | "assistant"; text: string[] }): void {
  const text = m.text.join("\n").trim();
  if (text) ut.push({ roll: m.roll, text });
}

// ── VÅG 150 — MÅL-PERMANENS PÅ DISK: mål-state dog med processminnet vid ────
// varje pm2-omstart (789+ omstarter; hjärtloggen visar cykeln "MÅL återställt"
// → "mål borta" om och om igen). sattMal skriver nu målet till disk och
// GET/POST återarmnar DISK-målet först (kundens eget mål > stående mål);
// rensaMal städar filen (ett rensat mål ska ALDRIG återuppstå).
const MAL_STATE_SOKVAG = `${process.cwd()}/data/vakten/mal-state.json`;

export function lasMalStateFranDisk(): { mal: string; ts: number } | null {
  try {
    const pars = JSON.parse(readFileSync(MAL_STATE_SOKVAG, "utf8")) as {
      mal?: unknown;
      ts?: unknown;
    };
    if (typeof pars.mal === "string" && pars.mal.trim()) {
      return { mal: pars.mal.trim(), ts: typeof pars.ts === "number" ? pars.ts : 0 };
    }
    return null;
  } catch {
    return null;
  }
}

function skrivMalStateTillDisk(mal: string): void {
  try {
    mkdirSync(path.dirname(MAL_STATE_SOKVAG), { recursive: true });
    writeFileSync(MAL_STATE_SOKVAG, JSON.stringify({ mal, ts: Date.now() }, null, 2));
  } catch {
    /* disk-målet är stöd — aldrig fatal */
  }
}

/**
 * HELA huvudtråden sammanslagen (äldst→nyst) ur databasen + levande svans.
 * bokSessioner kommer nyast-först (registreraHuvudtradSession) — reverseras
 * här. externLive = aktuell sessions LEVANDE historik (färskare än db:n under
 * pågående turn) ersätter den sessionens db-skiva.
 */
export function lasTradHistorik(
  bokSessioner: string[],
  externLive: { sessionId: string | null; historik: StudioHistorikPost[] },
): StudioHistorikPost[] {
  const db = v148OppnaDb();
  if (!db) return [];
  const kronologisk = [...bokSessioner].reverse();
  const ut: StudioHistorikPost[] = [];
  for (const sid of kronologisk) {
    if (!sid.startsWith("sess_")) continue;
    if (externLive.historik.length > 0 && sid === externLive.sessionId) {
      ut.push(...externLive.historik.slice(-120));
      continue;
    }
    ut.push(...v148SessionFranDb(db, sid).slice(-120));
  }
  return ut.slice(-500);
}

/**
 * Skapa en transport för en session (mock: adopterar id:t; appserver: EGEN
 * barnprocess med mål-session + EGEN persistensfil så tabbarna aldrig trampar
 * på default-transportens ak1a-studio-session.json).
 */
function skapaSessionTransport(målSessionId?: string): StudioTransport {
  if (studioTransportNamn() === "mock") return new MockTransport(målSessionId);
  const lagringsKatalog = process.env.STUDIO_LAGRING || os.tmpdir();
  return new AppServerTransport(
    [...new Set(zcodeBinärer())],
    studioArbetsyta(),
    path.join(lagringsKatalog, målSessionId ? persistensFilnamn(målSessionId) : `ak1a-studio-session-ny-${Date.now().toString(36)}.json`),
    målSessionId,
  );
}

/**
 * VÅG 84 B — per-session-transport för multi-session-tabbar.
 *
 *   sessionId given  → registerträff (levande transport för sessionen;
 *                      delas om flera tabbar öppnar SAMMA session — zcode:s
 *                      regel "en prompt i taget" gäller då per session) eller
 *                      ny transport med mål-session (resume, ÄRLIGT fel om
 *                      sessionen är borta).
 *   nyckel given     → ny frisk transport för tabbens första prompt
 *                      ("ny:<nyckel>" tills sessionId är känt — re-nycklas
 *                      nedan så nästa prompt i tabben finner den igen).
 *
 *   alternativ.nyttMeddelande=true (VÅG 95, -32031-STÄDNING — stream-
 *   routens POST) ⇒ en FRISKGÅNG-session (>24 h sedan senaste aktivitet
 *   ELLER en gång drabbad av -32031, enligt arFrigangSession) resumed
 *   ALDRIG: en FRISK session skapas direkt och DET nya sessionId:t
 *   returneras ("hej"-eventet bär det — klienten omnycklar tabben).
 *   Historik-previews förloras ej: gamla kartposten + session/list lever
 *   kvar ("Äldre sessioner"). UTAN flaggan (GET-sidaload, rewind) är
 *   beteendet OFÖRÄNDRAT ärligt resume — läsning av en gammal session är
 *   harmlös, -32031 sitter i send.
 *
 * Returnerar transporten ENSURAD (resume/create + subscribe) + den
 * lösta sessionens id.
 */
export async function hamtaSessionTransport(
  sessionId?: string | null,
  nyckel?: string | null,
  alternativ?: { nyttMeddelande?: boolean },
): Promise<{ transport: StudioTransport; sessionId: string }> {
  // 1. Direktträff på session-id.
  if (sessionId) {
    if (!/^sess_[A-Za-z0-9._-]+$/.test(sessionId)) {
      throw new Error("Ogiltigt sessions-id.");
    }
    const befintlig = sessionTransporter.get(sessionId);
    if (befintlig) {
      await befintlig.ensure();
      const sid = befintlig.sessionId();
      if (sid) return { transport: befintlig, sessionId: sid };
      // Fallthrough — transporten tappade sin session (extremfall): ny nedan.
    }
    // VÅG 95: friskgång-session + NYTT MEDDELANDE ⇒ FRISK session direkt
    // (hoppa över resume → -32031 → kassera → ny-dubbelturen). Okänd
    // session (ingen kartpost) resumed ärligt som förut.
    if (alternativ?.nyttMeddelande && arFrigangSession(sessionId)) {
      await vaktaMaxBarn(); // VÅG 90 K1: aldrig ett (MAX+1):e barn på Contabo
      const transport = skapaSessionTransport();
      await transport.ensure();
      const sid = transport.sessionId();
      if (!sid) throw new Error("Transporten svarade utan sessionId.");
      sessionTransporter.set(sid, transport);
      return { transport, sessionId: sid };
    }
    await vaktaMaxBarn(); // VÅG 90 K1: aldrig ett (MAX+1):e barn på Contabo
    const transport = skapaSessionTransport(sessionId);
    await transport.ensure(); // kastar ÄRLIGT om mål-resume misslyckas
    const sid = transport.sessionId();
    if (!sid) throw new Error("Transporten svarade utan sessionId.");
    sessionTransporter.set(sid, transport);
    return { transport, sessionId: sid };
  }

  // 2. Ny tabb (frisk session) — nycklad tills sessionen är löst.
  if (nyckel) {
    const tabbNyckel = `ny:${nyckel.slice(0, 80)}`;
    const befintlig = sessionTransporter.get(tabbNyckel);
    if (befintlig) {
      await befintlig.ensure();
      const sid = befintlig.sessionId();
      if (sid) {
        // Re-nyckla: nästa prompt i tabben bär det riktiga session-id:t.
        sessionTransporter.delete(tabbNyckel);
        if (!sessionTransporter.has(sid)) sessionTransporter.set(sid, befintlig);
        return { transport: befintlig, sessionId: sid };
      }
    }
    await vaktaMaxBarn(); // VÅG 90 K1: aldrig ett (MAX+1):e barn på Contabo
    const transport = skapaSessionTransport();
    await transport.ensure();
    const sid = transport.sessionId();
    if (!sid) throw new Error("Transporten svarade utan sessionId.");
    sessionTransporter.set(sid, transport);
    return { transport, sessionId: sid };
  }

  throw new Error("sessionId eller nyckel krävs för per-session-transport.");
}

/**
 * VÅG 84 B: hitta transporten som äger en väntande interaktion (requestId)
 * — söker default-transporten + per-session-registret (en dialog från en
 * EGEN tabb måste besvaras i DEN tabbens transport). Null = okänd id.
 */
export function hamtaTransportMedInteraktion(requestId: string): StudioTransport | null {
  if (aktivTransport?.vantaInteraktioner().some((i) => i.requestId === requestId)) {
    return aktivTransport;
  }
  for (const t of sessionTransporter.values()) {
    if (t.vantaInteraktioner().some((i) => i.requestId === requestId)) return t;
  }
  return null;
}

/** VÅG 84 B: väntande interaktioner från ALLA transporter (tabbar inkl.). */
export function lasAllaInteraktioner(): StudioInteraktion[] {
  const ut: StudioInteraktion[] = [];
  if (aktivTransport) ut.push(...aktivTransport.vantaInteraktioner());
  for (const t of sessionTransporter.values()) ut.push(...t.vantaInteraktioner());
  return ut;
}

// ── VÅG 90 K1: SESSIONS-HUSHÅLLNING — max-barn, idle-stängning, shutdown ─────

/** Max AKTIVA zcode-barnprocesser (default + tabbar) — Contabos 8 GB-budget. */
const MAX_AKTIVA_BARN = 3;
/** Idle-tak (ms): en session utan lyssnare/mål i 2 h stängs (RAM frigörs). */
const IDLE_STANG_MS = 2 * 60 * 60 * 1000;
/** Hushållningsinterval (ms) — idle-stängning + över-tak-städning. */
const HUSHALL_INTERVALL_MS = 5 * 60 * 1000;

/** Alla kända transporter (default + per-session-registret, unika). */
function allaTransporter(): StudioTransport[] {
  const ut: StudioTransport[] = [];
  if (aktivTransport) ut.push(aktivTransport);
  for (const t of sessionTransporter.values()) if (!ut.includes(t)) ut.push(t);
  return ut;
}

/** Registernyckel för en transport (null = default-transporten/oregistrerad). */
function transportNyckel(t: StudioTransport): string | null {
  for (const [nyckel, tr] of sessionTransporter) if (tr === t) return nyckel;
  return null;
}

/** Hushållnings-ytan på en appserver-transport (mock saknar den → null). */
interface HushallbarTransport extends StudioTransport {
  arIdle(): boolean;
  senasteAktivitetTid(): number;
  stangHelt(): Promise<void>;
  dodaBarnAvsiktligt(): void;
  barnInfo(): {
    pid: number | null;
    lever: boolean;
    ramMB: number | null;
    omstartForsok: number;
    senasteOmstart: number | null;
    senasteFel: { tid: number; text: string } | null;
  };
}

/** Typad vy — ALDRIG instancecheck (AppServerTransport är inte exporterad). */
function somHushallbar(t: StudioTransport): HushallbarTransport | null {
  const k = t as Partial<HushallbarTransport>;
  return typeof k.stangHelt === "function" &&
    typeof k.arIdle === "function" &&
    typeof k.barnInfo === "function" &&
    typeof k.dodaBarnAvsiktligt === "function"
    ? (t as HushallbarTransport)
    : null;
}

/** Antal transporter med LEVANDE barnprocess (mock räknas ej — inget barn). */
function antalLevandeBarn(): number {
  let n = 0;
  for (const t of allaTransporter()) {
    const h = somHushallbar(t);
    if (h?.barnInfo().lever) n += 1;
  }
  return n;
}

/**
 * Stäng en transport fullständigt (session/stang + barnprocess-död via
 * transportens egen stangHelt) + städa registret + markera kart-posten
 * stängd + TVINGA karta-flush. Historiken lever kvar i kartan + session/list.
 */
async function stangTransport(h: HushallbarTransport, t: StudioTransport): Promise<void> {
  const nyckel = transportNyckel(t);
  const sid = t.sessionId();
  await h.stangHelt().catch(() => undefined);
  if (nyckel) sessionTransporter.delete(nyckel);
  if (sid) {
    const kort = sessionskartan.get(sid);
    if (kort) {
      kort.stangd = true; // VÅG 90 K1: stängd session återbjuds ej som levande
      kort.aktiv = false;
    }
  }
  spolaKartaTillDisk(); // tvingad flush vid stäng — ALDRIG ett 30 s-hål
}

/**
 * Stäng den ÄLDSTA idle-sessionen (inga lyssnare + inget mål + inga väntande
 * dialoger) — returnerar true när någon stängdes (false = alla är aktiva).
 */
async function stangAldstaIdle(): Promise<boolean> {
  let kandidat: { h: HushallbarTransport; t: StudioTransport; tid: number } | null = null;
  for (const t of allaTransporter()) {
    const h = somHushallbar(t);
    if (!h || !h.barnInfo().lever || !h.arIdle()) continue;
    const tid = h.senasteAktivitetTid();
    if (!kandidat || tid < kandidat.tid) kandidat = { h, t, tid };
  }
  if (!kandidat) return false;
  await stangTransport(kandidat.h, kandidat.t);
  return true;
}

/**
 * VAKT: en NY tabb som skulle föda barnprocess nummer MAX+1 stänger först
 * den äldsta idle-sessionen; är ALLA aktiva kastas ett ärligt fel (kunden
 * får veta VARFÖR — ALDRIG en tyst fjärde barnprocess som OOM:ar servern).
 */
async function vaktaMaxBarn(): Promise<void> {
  if (studioTransportNamn() === "mock") return; // dev: inga barn alls
  while (antalLevandeBarn() >= MAX_AKTIVA_BARN) {
    if (!(await stangAldstaIdle())) {
      throw new Error(
        `Max ${MAX_AKTIVA_BARN} aktiva agent-sessioner — stäng en ledig session (Sessioner → stäng) eller vänta tills en blir klar.`,
      );
    }
  }
}

/**
 * Hushållningsloop (5 min): (1) sessioner idle >2 h stängs automatiskt —
 * session/stang + barnprocess-död frigör RAM (ett zcode-barn är ~0,5–1 GB
 * på Contabos 8 GB) och historiken lever kvar i kartan + session/list så
 * nästa besök resume:ar via GET:s återkoppling; (2) städning om tabbar
 * läckt över max-taket.
 */
function hushallning(): void {
  void (async () => {
    const nu = Date.now();
    for (const t of allaTransporter()) {
      const h = somHushallbar(t);
      if (!h || !h.barnInfo().lever || !h.arIdle()) continue;
      if (nu - h.senasteAktivitetTid() < IDLE_STANG_MS) continue;
      await stangTransport(h, t);
    }
    let vakt = 0;
    while (antalLevandeBarn() > MAX_AKTIVA_BARN && vakt < 10) {
      vakt += 1;
      if (!(await stangAldstaIdle())) break;
    }
  })().catch(() => undefined); // bakgrundens arbetare — fel äts tyst (hälsan bär dem)
}

// ── VÅG 90 K1: HÄLSA — /api/studio/halsa ─────────────────────────────────────

/** En barnprocesspost i hälsosvaret (inga session-id:n, inga hemligheter). */
export interface StudioHalsaBarn {
  /** true = default-transporten (huvudtabben). */
  standard: boolean;
  /** Barnprocessens pid (null innan första start/efter död). */
  pid: number | null;
  /** false = barnet dött / omstart pågår. */
  lever: boolean;
  /** RAM (MB) ur /proc/<pid>/statm — null på icke-Linux/död process. */
  ramMB: number | null;
  /** Pågående omstartsförsök (0–3). */
  omstartForsok: number;
}

/** Hälsosvaret — öppen route men MINIMALT: räknare + tillstånd, aldrig hemligheter. */
export interface StudioHalsa {
  transport: "appserver" | "mock";
  /** Hushållningens tak (MAX_AKTIVA_BARN). */
  maxAktivaBarn: number;
  barn: StudioHalsaBarn[];
  /** Levande barn just nu. */
  antalBarnprocesser: number;
  /** Sessioner i sessionskartan (minne/disk-hydrering). */
  sessionerIKarta: number;
  /** Per-session-tabbar i registret. */
  tabbar: number;
  /** Senaste LYCKADE barnomstart (epoch ms; null = ingen ägt rum). */
  senasteOmstart: number | null;
  /** Senaste fel (död/omstart) — trunkerad text, aldrig hemligheter. */
  senasteFel: { tid: number; text: string } | null;
  /** Processens uppstart (epoch ms). */
  processUppstartad: number;
  /** Plattform + Node-version (debug; inga sökvägar). */
  plattform: string;
  node: string;
}

/** RAM (MB) för en pid ur /proc — null när det ej går (Windows/dev/borta). */
function lasBarnRamMB(pid: number): number | null {
  try {
    const falt = readFileSync(`/proc/${pid}/statm`, "utf8").trim().split(/\s+/);
    const rssSidor = Number(falt[1]);
    if (!Number.isFinite(rssSidor) || rssSidor < 0) return null;
    return Math.round(((rssSidor * 4096) / (1024 * 1024)) * 10) / 10; // sida = 4 kB (x86_64)
  } catch {
    return null;
  }
}

/** Hälsosnapshot — ren läsning (endast karta-hydrering som sidoeffekt). */
export function lasStudioHalsa(): StudioHalsa {
  lasKartaFranDisk();
  const barn: StudioHalsaBarn[] = [];
  let senasteOmstart: number | null = null;
  let senasteFel: { tid: number; text: string } | null = null;
  for (const t of allaTransporter()) {
    const h = somHushallbar(t);
    if (!h) continue;
    const info = h.barnInfo();
    barn.push({
      standard: t === aktivTransport,
      pid: info.pid,
      lever: info.lever,
      ramMB: info.ramMB,
      omstartForsok: info.omstartForsok,
    });
    if (typeof info.senasteOmstart === "number") {
      if (senasteOmstart === null || info.senasteOmstart > senasteOmstart) {
        senasteOmstart = info.senasteOmstart;
      }
    }
    const felet = info.senasteFel;
    if (felet && (!senasteFel || felet.tid > senasteFel.tid)) senasteFel = felet;
  }
  return {
    transport: studioTransportNamn(),
    maxAktivaBarn: MAX_AKTIVA_BARN,
    barn,
    antalBarnprocesser: barn.filter((b) => b.lever).length,
    sessionerIKarta: sessionskartan.size,
    tabbar: sessionTransporter.size,
    senasteOmstart,
    senasteFel,
    processUppstartad: Date.now() - Math.round(process.uptime() * 1000),
    plattform: process.platform,
    node: process.version,
  };
}

// ── VÅG 90 K1: PROCESS-SHUTDOWN — pm2-SIGTERM lämnar inga zombie-zcode ───────

/**
 * Synkron nedstängning: kartan spolas TVINGAT först (writeFileSync — klar
 * före exit), därefter SIGTERM till VARJE barn (pm2:s kill-timeout ~1,6 s
 * hinner inte med protokollsroundtrips som session/close; utan detta lever
 * zcode-barnen kvar som föräldralösa processer och äter RAM vid varje
 * deploy/omstart).
 */
function stangAllaBarnSynkront(): void {
  spolaKartaTillDisk();
  for (const t of allaTransporter()) {
    somHushallbar(t)?.dodaBarnAvsiktligt();
  }
}

// Registrera hushållning + shutdown EN gång per process (global guard —
// Next dev-hot-reload kan evaluera modulen flera gånger).
const hushallGuard = globalThis as { __ak1aStudioVag90Hushall?: boolean };
if (!hushallGuard.__ak1aStudioVag90Hushall) {
  hushallGuard.__ak1aStudioVag90Hushall = true;
  const hushallTimer = setInterval(hushallning, HUSHALL_INTERVALL_MS);
  hushallTimer.unref(); // timern får ALDRIG hålla processen vid liv
  for (const signaln of ["SIGTERM", "SIGINT"] as const) {
    process.once(signaln, () => {
      stangAllaBarnSynkront();
      // Kort grace så stderr/stdout-pipes hinner flusha innan utgången
      // (pm2:s kill-timeout slår SIGKILL efter ~1,6 s — 250 ms är säkert).
      setTimeout(() => process.exit(0), 250);
    });
  }
  // VÅG 95: varmförhållning vid transport-init (pm2-start/första modul-
  // evaluering) — standard-barnprocessen + en session värms i bakgrunden
  // så första kundmeddelandet träffar en varm transport (mock/build: no-op).
  varmStudioTransport();
}

/** Test-krok: nollställ singletonen + multi-session-registret (verktyg/test). */
export function _aterstallStudioTransport(): void {
  aktivTransport = null;
  sessionskartan.clear();
  sessionTransporter.clear();
  // VÅG 87 H2: en nollställd karta skall INTE hydreras om från disken och
  // ingen väntande diskskrivning får låsa nästa schema.
  if (kartaSkrivTimer !== null) {
    clearTimeout(kartaSkrivTimer);
    kartaSkrivTimer = null;
  }
  kartaLäst = true;
}
