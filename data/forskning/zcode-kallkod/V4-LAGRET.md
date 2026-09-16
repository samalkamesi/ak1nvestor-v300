# V4-LAGRET — komplett kartläggning av v4-protokollskiktet

**Status:** KARTLAGT 2026-09-15 (våg 9x, R1-följupp) · **Ägare:** forskningsagent AK1A
**Källor:** bundle `/home/ak1a/.npm-global/lib/node_modules/zcode-app-cli/vendor/zcode.cjs` (grep),
källklon `/home/ak1a/forskning/zcode-cli/packages/zcode-tui/src/`, samt
`src/lib/studio/studio-transport.ts` (endast läsning, 28 v4-referenser).
**Regel:** inga kodkopior — enbart protokollfakta (metodnamn, enums, fältnamn).

---

## Sammanfattning (LEVERANS)

| Mått | Värde |
|---|---|
| v4 wire-ytor hittade | **24** (21 klient→server-metoder + 3 server→klient-notiser) |
| Interna v4-fakta-typer | 2 (`v4/command_fact`, `v4/fork_start_failure`) — ej wire |
| Subscription-topic-familjer | **3** (`conversation/`, `sessions-index/`, `workspace-config/`) |
| Studion använder redan | **8 av 24 (33 %)** — 7 anrop + 1 notis |
| Topp-3 gap (V/A) | 1) usage-endpoints, 2) resync, 3) sessions-index-topic |

---

## 1. Arkitekturen i ett stycke

v4 är EGET protokollskikt vid sidan av session/event-strömmen (R1-kapitlet hade rätt: `v4/command`
och `v4/command_fact` nämndes men ej kartlagts). I bundeln dispatchas alla v4-metoder via ett
**V4Gateway** (`requireV4Gateway()` i routern) — request/response med zod-validerade scheman
+ notiser. Tre särdrag:

1. **ConnectionId + clientMode är grundläggande.** Varje prenumerant registrerar `connectionId`
   och `clientMode` med exakt två lägen: `"desktop-continuous"` | `"web-remote-replayable"`.
   Studion använder redan `web-remote-replayable` (korrekt för webbklient).
2. **LogEpoch/revision-versionerad replikering.** Subscribe-ack bär `logEpoch`; frames bär
   deltas med `op:"state.updated"` + `patch.revision`; queries (`rowsRange`, `fileChanges`,
   `fileRewindPreview`) tar `baseRevision` + `baseLogEpoch` och svarar med `atSeq`/`atLogEpoch`.
3. **Inbox/kö för kommandon.** `v4/command` går genom en inbox med queue-items
   (`queueItemId`), readyFlights per session, och ger **ack** — inte svar. Status hämtas
   separat med `v4/commands/query`. Acks persistreras som `v4/command_fact` i DB och är
   grundvalen för fork-logiken (källkod: `sourceCommandId`/`parentSessionId`-uppslag).

---

## 2. Komplett metodkarta (klient → server, 21 st)

| # | Metod | Gateway-handler | Semantik (parametrar → svar) |
|---|---|---|---|
| 1 | `v4/connection/flow` | setConnectionFlowState | `{connectionId, state}` där state ∈ `saturated`\|`drained`\|`closed` → `{}`. Baktrycksreglering: klienten signalerar när den drunknar. |
| 2 | `v4/controller/subscribe` | (controller-kanal) | Prenumeration på controller-nivå (globala händelser utanför enskild konversation). Reserverad handler. |
| 3 | `v4/controller/resync` | (controller-kanal) | Gap-återhämtning för controller-prenumeration. |
| 4 | `v4/controller/unsubscribe` | (controller-kanal) | Avslutar controller-prenumeration. |
| 5 | `v4/conversation/subscribe` | subscribeReserved / subscribeSessionsIndexReserved / subscribeWorkspaceConfigReserved | `{topic, connectionId, clientMode, workspace?, base?}` → `{ack, snapshot-frames}`. Topic avgör handler (se §4). |
| 6 | `v4/conversation/resync` | resyncReserved | Gap-återhämtning: returnerar `initialWires` som postas via response-outbox + `commit`. |
| 7 | `v4/conversation/unsubscribe` | unsubscribe | `{connectionId/topic}` → `{}`. Prenumerationshygien. |
| 8 | `v4/conversation/rowsRange` | rowsRange | `{sessionId, clientMode, limit}` → `{rows[], atSeq, atLogEpoch}`. Rader har `kind` (t.ex. `turnHeader`, `toolCall`) + `rowId` + `entityId`. |
| 9 | `v4/conversation/plans` | plans | `{sessionId}` → `{plans[], atSeq, atLogEpoch}`. Plan-rader är `kind:"toolCall"` med `status` ∈ `inputStreaming`\|`pendingApproval`\|`running`\|… (verktygs-/plan-godkännanden). |
| 10 | `v4/conversation/fileChanges` | fileChanges | `{sessionId, target:{rowId, entityId}, baseRevision, baseLogEpoch}` → fil-diff (studion VÅG 85 F4 använder denna). |
| 11 | `v4/conversation/fileRewindPreview` | fileRewindPreview | `{sessionId, target, baseRevision, baseLogEpoch}` → `{action: restore\|delete, operationCount, …}`. Förhandsvisning av rewind innan utförande. |
| 12 | `v4/usage/stats` | Dwt | `{range?, timeZone?}` (default 30 dagar, `all` = allt) → aggregerad användningsstatistik med `since/until/generatedAt`. |
| 13 | `v4/conversation/usage` | Bwt | `{sessionId}` → `{totalTokens, inputTokens, outputTokens, reasoningTokens, cacheCreationTokens, cacheReadTokens, modelRequestCount, …}`. Per-session token-räkning. |
| 14 | `v4/attachment/begin` | attachmentBegin | `{connectionId, uploadId, sessionId, fileName, …}` → påbörjar uppladdning. |
| 15 | `v4/attachment/chunk` | attachmentChunk | `{uploadId, chunkIndex, dataBase64}` (512 kB-bitar i studion). |
| 16 | `v4/attachment/commit` | attachmentCommit | `{uploadId}` → opak ref (bilage-id dras ur svaret). |
| 17 | `v4/attachment/abort` | attachmentAbort | `{uploadId}` → avbryter uppladdning. |
| 18 | `v4/attachment/read` | attachmentRead | `{sessionId, …}` → läser tillbaka sessionsbilagor (kräver host-stöd, fel `fault.attachment.readUnsupported` annars). |
| 19 | `v4/attachment/previewSource` | attachmentPreviewSource | `{sessionId, …}` → förhandsgranskar källan till en bilaga. |
| 20 | `v4/commands/query` | queryCommands | `{commands:[{commandId?, sessionId?}, …]}` → `{results[]}` — live status för inskickade kommandon ur inbox-kön. |
| 21 | `v4/command` | handleCommand | Kanonisk kommandoinskickning → **ack** (köat i inbox). Envelope bär sessionId; hanterar readyFlights + kö. |

## 3. Notiser (server → klient, 3 st)

| Metod | Emitternamn | Bär |
|---|---|---|
| `v4/conversation/frame` | emitWireFrame | `{topic, kind, frame:{payload:{deltas[]}}}` — deltas bl.a. `op:"state.updated"` med `patch.revision`. |
| `v4/telemetry/event` | emitConversationTelemetryFact | Telemetri-fakta per konversation. |
| `v4/cua/permission-observation` | emitCuaPermissionObservation | Permission-observationer (CUA = datoranvändnings-agent; interaktions-typer `permission`/`userInput`/`workspaceHookReview`). |

## 4. Subscription-kanaler (topic-familjer, 3 st)

Topic-prefixet i `v4/conversation/subscribe` styr handler via två matcherare:

| Topic | Handler | Innehåll |
|---|---|---|
| `conversation/<sessionId>` | subscribeReserved | Konversationens wire-ström (frames/deltas/revisioner). |
| `sessions-index/<filter>` | subscribeSessionsIndexReserved | **Live-index över sessioner** — multi-session-medvetande utan polling av sessionList. |
| `workspace-config/<namn>` | subscribeWorkspaceConfigReserved | **Live workspace-konfiguration** — poster med `{value, name, description?, origin: native\|injected, modelProviderId?}`. |

Fel topic-prefix → explicit fel ("Not a sessions-index topic" etc.).

## 5. Interna fakta-typer (ej wire)

- `v4/command_fact` — persistent DB-faktatyp för kommando-acks. Används av fork-logiken:
  child-fakta id:sätts `v4_command_fact:child:<parentSessionId>:<sourceCommandId>`; lookup
  sker i `begin immediate`-transaktion och gör fork-idempotent (kräver att parent-ensamhet
  hålls). Källor: `source:"child"` vs förälder, med `ack` + `metadata`.
- `v4/fork_start_failure` — fel/tagg vid misslyckad fork-start.

## 6. Protokollens taksonomier (enums ur zod-scheman)

- **Frame-item-kinds (11):** `user_prompt`, `slash_command`, `system_reminder`,
  `background_notification`, `subagent_notification`, `todo_reminder`, `rewind_notice`,
  `fork_notice`, `timeline_event`, `compact_summary`, `assistant_response`.
- **Aktörer:** `real_user` | `agent_runtime` | `system` | `migration`.
- **Turn-primary-kinds:** `primaryTurn`, `foregroundSubagent`, `compact`, `goalVerifier`,
  `goalContinuation`, `turnSteer`.
- **Interaktioner:** `permission` | `userInput` (v3-variant) samt
  `permission` | `userInput` | `workspaceHookReview` (v4-variant).
- **Plan/toolCall-status:** `inputStreaming`, `pendingApproval`, `running`, …
- **Rewind-svar:** `action: restore | delete` + `operationCount`.
- **Anslutningstillstånd:** `saturated` | `drained` | `closed`.
- **Konfigurationsursprung:** `native` | `injected`.
- **Runtime-typer (gränssnitt):** `ssh` | `wsl` | `docker` | `server`; styrmeddelanden:
  `sendText` | `sendGoalCommand` | `compact`.

## 7. TUI:s förhållande till v4 (källklonen)

Viktigt arkitekturfynd: **packages/zcode-tui rör aldrig v4 direkt** (noll träffar på `v4/`).
Kopplingen sker via två abstraktioner:

1. **Events/RestoredPart.** `events.ts` definierar `RestoredPart`-unionen — **12 part-typer**:
   `text`, `thought`, `tool` (med toolCallId/status/agentId/childSessionId m.fl.),
   `file` (filename/mime/url), `step-start`, `step-finish` (reason/snapshot/cost/tokens),
   `snapshot`, `patch` (hash/files), `retry` (attempt/error), `compaction`
   (reason/summaryMessageId), `subagent` (agent/prompt/model/command), `agent` (name).
   `RestoredMessage = {messageId?, role: user|assistant|system, parts[]}`.
2. **Injektade prenumerations-hookar.** `types.ts`: `subscribeSessionEvents?` och
   `subscribeWorkflowEvents?` — värden/omvända anrop som den bärande appen (zcode-app-cli)
   matar in efter att ha översatt v4-wire → TUI-events.

**protocol-part-view.ts (107 rader):** ren renderingskomponent för *synliga* protokoll-partar.
`visiblePartTypes` = `{file, retry, compaction, subagent, agent}` (text/thought/tool/patch etc.
rendras av andra vyer). Stöder expandering (`setExpanded`), söktext (`getSearchText` slår ihop
partens textfält), och renderar: fil → "Attachment"-rad med mime/url; retry → "Retrying model
request"; compaction; subagent (prompt/command/model som dold innehåll); agent. Allt sanitiserat
via `sanitizeTerminalText`.

**Slutsats för studion:** vår direkta v4-klient är arkitektoniskt närmare zcode-app-cli:ns
lager än TUI:ns — vi översätter själva wire → UI-modeller. TUI:n bevisar att en tunn
projektion (RestoredPart) räcker för full rendering.

## 8. Gap-analys mot studion (studio-transport.ts, 28 v4-referenser)

### Använder redan (8 av 24)

| Metod/notis | Rad | Användning |
|---|---|---|
| `v4/conversation/subscribe` | 3533 | topic `conversation/<sid>`, egen connectionId, clientMode `web-remote-replayable`; ack → logEpoch (BEVISAT våg 85). |
| `v4/conversation/rowsRange` | 5379 | limit 100; hittar senaste `turnHeader`-rad som target. |
| `v4/conversation/fileChanges` | 5403 | filandringar mot target + baseRevision/baseLogEpoch, retry med atSeq. |
| `v4/conversation/frame` (notis) | 6032 | endast revisionsskörd ur `state.updated`-deltas. |
| `v4/attachment/begin` | 6583 | bilduppladdning (våg 92 B1). |
| `v4/attachment/chunk` | 6604 | 512 kB-bitar. |
| `v4/attachment/commit` | 6620 | opak ref. |
| `v4/attachment/abort` | 6611/6623 | felrensning. |

### Saknas helt (16 av 24 + båda extra-topic-familjerna)

`v4/command`, `v4/commands/query`, `v4/connection/flow`, `v4/controller/{subscribe,resync,unsubscribe}`,
`v4/conversation/{resync,unsubscribe,plans,fileRewindPreview,usage}`, `v4/usage/stats`,
`v4/attachment/{read,previewSource}`, `v4/telemetry/event`, `v4/cua/permission-observation`,
samt topics `sessions-index/*` och `workspace-config/*`.

Noterbart: studion skickar aldrig `v4/conversation/unsubscribe` vid nedstängning (läckage-risk
serverside om inte connection-städning sker automatiskt), och aldrig `v4/connection/flow`
(ingen baktrycksreglering — ok vid vår låga volym men outnyttjad skyddsmekanism).

## 9. Topp-3 saknade v4-funktioner (V/A-rankning)

Rangordning av samtliga gap (V = värde för studion 1–10, A = ansträngning 1–10):

| Gap | V | A | V/A | Motivering |
|---|---|---|---|---|
| **1. `v4/conversation/usage` + `v4/usage/stats`** | 8 | 2 | **4,0** | Ren läsa-endast-aggregation med triviala scheman (token-räknare per session; 30-dagars/global statistik med tidszon). Ger studion kostnads-/tokenobservabilitet utan egna mätare. |
| **2. `v4/conversation/resync` (+ unsubscribe-hygien)** | 9 | 3 | **3,0** | Returnerar `initialWires` + commit — korrekt gap-återhämtning efter gateway-omstart/missade frames. Idag faller studion tillbaka på Write/Edit-motorn när revision tappas; resync gör fileChanges-spåret hållbart långsiktigt. Vi har redan logEpoch/revision/byggnadsställning. |
| **3. `sessions-index/<filter>`-topic** | 7 | 3 | **2,3** | Live-index över sessioner via befintlig subscribe-mekanism (samma connectionId/clientMode). Kan ersätta delar av R2-poll-lagret (sessionList-polling) och ger multi-session-medvetande i realtid. |
| 4. `v4/command` + `v4/commands/query` | **10** | 6 | 1,7 | **Högsta råvärdet**: kanonisk turn-inskickning med inbox-kö, ack och statusquery — v4:ts kärna. Men kräver full ko-semantik (readyFlights, command_fact, felkoder) = största insatsen. Strategisk etapp 2. |
| 5. `v4/conversation/plans` | 7 | 4 | 1,75 | Plan-/verktygsgodkännanden (pendingApproval m.m.) — ger UI för väntande godkännanden. |
| 6. `v4/conversation/fileRewindPreview` | 6 | 4 | 1,5 | Säker rewind-förhandsvisning (restore/delete + operationCount) innan destruktiv åtgärd. |
| 7. `v4/attachment/read` + `previewSource` | 5 | 3 | 1,7 | Läsa tillbaka/ förhandsgranska bilagor — kompletterar vårt uppladdningsflöde. |
| 8. `workspace-config/<namn>`-topic | 4 | 3 | 1,3 | Live-konfigsynk; värde först om studion ska visa/styra modell-provider-val m.m. |
| 9. `v4/connection/flow` | 3 | 1 | 3,0* | Två rader att skicka men lågt akut värde (*ej topp-3 trots kvot — värde taket). |
| 10. Controller-kanal + notiser (telemetry/cua) | 3–5 | 3–5 | ~1 | Beroende av vad controller bär (ej fullt dekompilerad); telemetri-notiser kräver egen aggregering. |

**Rekommenderad ordning:** usage (snabb vinst) → resync (robusthet) → sessions-index (arkitektur)
→ därefter strategisk utredning av `v4/command` som långsiktig ersättare av studions nuvarande
styrväg.

---

## 10. Öppna frågor / nästa steg

1. Controller-kanalens exakta innehåll (dispatch-case hittades ej i bundeln — ligger möjligen
   bakom requireV4Gateway-reservation med annan namngivning). Sond: prenumerera på
   `v4/controller/subscribe` i sandbox och logga notiser.
2. Exakta scheman för `v4/command`-parametrar (prompt/attachments/mode?) — kräver djupare
   dekompilering av inbox-ensamheten än denna kartläggning.
3. `atSeq` vs frame-revision-semantik: studion kommenterar att frame-revision ≠ rowsRange.atSeq
   som baseRevision — verifiera mot resync-schemat när gap 2 implementeras. ✓ ROND 42: verifierad
   i lasV4Resync (våg 172): resync-ramar uppdaterar v4Revision via state.updated — separat spår.

---

## 11. ETAPP 2-KARTA — v4/command dekompilerad (rond 43, 2026-09-16)

**Status:** SCHEMATA KARTLAGTA ur bundeln (grep-kontext, bevisade signaturer nedan).
**Syfte:** underlag för gap 27:s inskickningshalva (query-sidan lever sedan våg 171,
metodvägarna verifierade mot bundeln: "v4/commands/query" ✓ "v4/command" ✓).

### 11.1 Envelope (Doi — parseCommandEnvelope/HCe, wire-valideringen)

```
{
  commandId:      string,              // klient-genererat unikt id
  clientId:       string,              // klient-identitet (vår: v4ConnectionId-kandidat)
  sessionId:      string | null,       // mål-session (null för createSession)
  baseRevision?:  number,              // valfri revisionsförankring
  baseLogEpoch?:  string (trim.min1),  // valfri epoch-förankring
  type:           <typ-union, se 11.2>,
  payload:        unknown,             // typspecifik last (valideras per type)
  issuedAt:       <tidstämpel>
}
```

Ogiltig payload ⇒ ack med `{commandId, status:"rejected", reasonCode:"proto.invalidPayload",
message, revisionAtDecision:0}` (inbox.handle, bevisad signatur).

### 11.2 Kommandotyper (KLr-kartan — payload-schema per typ)

Kärntyper för studion:
- **sendText** `{text, attachments?: qB[], requestedDelivery?: "startNow"|"queue"|"guide",
  browserAmbientContext?, heldQu…}` — chatt-promptens kanoniska väg; delivery-triaden styr
  köbeteende (startNow = kör nu, queue = lägg i kö, guide = styrd).
- **createSession** `{workspaceId, firstInput?: {text, attachments?}, config?, runtimeModel?,
  mcpServers?}` — sessionsfödelse med config i samma kommando.
- **createSelectionSideSession** `{firstInput?: {text}}` — markeringssidession.
- **resolveInteraction** `{resolvedBy: {clientId, optionId?}}` — interaktions-/dialog svar
  (studions permission/dialog-kort).
- **switchModelConfig** — modellbyte (studions modellbytardrawer).
- **pauseGoal / resumeGoal** — mål-loopens paus/fortsätt.
- **setAutoDrain** `{autoDrain…}` — köns automatiska tömning.
- **Köoperationer:** sendQueuedNow `{queueItemId}`, editQueueItem `{queueItemId, newText}`,
  reorderQueueItem `{queueItemId, beforeQueueItemId: string|null}`,
  deleteQueueItem `{queueItemId}`.
- **Fakta-typer (qft-setet):** applyFileRewind, forkAssistant, editUserQuery, retryTurn,
  setAssistantFeedback `{target, feedback: "like"|"dislike"|null}`.

### 11.3 Ko-semantik (handleCommand, bevisad sekvens)

1. **readyFlights-vänt:** om `readyFlights.size > 0` och en flight är registrerad på
   envelope.sessionId ⇒ `await` den FÖRE inbox-handeringen (serialisering mot pågående
   session-födelse).
2. **inbox.handle(t):** ack (`kind:"ack"` ⇒ returnera r.ack) ELLER settle-flöde —
   svaret koalesceras via `settle(c)` och `onError`-rapportering till host.
3. **Ack persisteras som v4/command_fact** (§5) — grunden för queryCommands och
   fork-idempotens (id: `v4_command_fact:child:<parentSessionId>:<sourceCommandId>`).

### 11.4 Studions migreringsordning (förslag, ej beslut)

sendText (störst värde — ersätter dagens styrväg stegvis bakom feature-avvägning) →
resolveInteraction (dialog-korten) → switchModelConfig + pause/resumeGoal → köoperationer.
INSATS A6 kvarstår: felkoder, flight-timeout, delivery-semantikens tre lägen mot vår
mål-loops -32010-serialisering — därför förblir etapp 2 sekvenserad EFTER gap 26-stängning.
