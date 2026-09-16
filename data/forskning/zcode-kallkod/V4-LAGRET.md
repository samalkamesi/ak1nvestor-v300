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

### 11.5 INSATS A6 LEVERERAD — felkoder, flights och delivery-triaden (rond 53, 2026-09-16)

**Status:** LEVERERAD som forskningsdokument (gap-registrets post 36; definition-of-done
= detta avsnitt med bevisade signaturer). Källa: bundeln 3.11.2-24
(`/home/ak1a/.npm-global/lib/node_modules/zcode-app-cli/vendor/zcode.cjs`, 12 632 838 B
— källklonen `/home/ak1a/forskning/zcode-cli` bär endast CLI-skalet, 13 filer; v4 lever
bara i bundeln). Alla offset-citat är maskinverifierbara (sond: kontext-extraktion per
term). Felklassernas minifierade namn bevaras som bevislänkar.

#### 11.5.1 Ackens wire-schema (Loi @ ~10 532 462)

```
{ commandId: string,
  status: "accepted" | "rejected" | "stale" | "duplicate" | "noop" | "failed",
  reasonCode?: string, message?: string,
  revisionAtDecision: number,
  result?: { type: … } }   // bl.a. {type:"inputDisposition", delivery:"startNow"|"queue"|"guide"}
```

- **result.inputDisposition** = acken rapporterar den ADMITTERADE leveransen (skillnaden
  mot requestedDelivery synlig här — triadens fallback blir mätbar på tråden).
- **retryAck** (@ ~12 186 858): `status==="failed" → återges ORDAGRAT; annars → "duplicate"`
  — ett misslyckat kommando maskeras aldrig som duplikat vid omsändning.
- **queryUnavailableAck**: `{status:"failed", reasonCode:"fault.command.queryUnavailable"}`.
- **Inbox-idempotens** (CommandInbox T3e, handle @ ~12 182 153): nyckelgrind (per
  session+commandId) → inFlight-replay → lookupExact (settled) → sessionsgrind →
  decide() → admissionSeq++ → settle() = den ack som persisteras som v4/command_fact.
  `queueItemId = "queue_" + commandId` (Cse) — deterministikt, klientförutsägbart.
- Ogiltig envelope ⇒ `{status:"rejected", reasonCode:"proto.invalidPayload",
  revisionAtDecision:0}`; radmål (editUserQuery/retryTurn) valideras via
  validateRowTarget (@ ~12 326 224): saknat mål ⇒ proto.invalidPayload, borta/ej ägd ⇒
  proto.staleTarget, sessionslös kommandotyp ⇒ allow.

#### 11.5.2 reasonCode-namespaces (fullständigt uppräknade ur bundeln)

| Namespace | Koder |
|---|---|
| `proto.*` (10) | frameAssemblyTooLarge · frameEnvelopeTooLarge · frameFragmentCountExceeded · invalidPayload · sessionNotFound · missingBaseRevision · staleLogEpoch · staleRevision · staleTarget · payloadTooLarge |
| `guard.*` (17) | actionUnavailable · compactOperationLock · forkAssistantOnly · forkTargetNotStable · forkTargetAmbiguous · stopTargetChanged · heldQueueConfirmationStale · workspaceRewindUnsafeFiles · workspaceRewindIgnoredFiles · workspaceRewindUnavailable · workspaceRewindApplyConflict · latestQueryEditOnly · latestAssistantRetryOnly · queueItemReserved · queueItemNotEditable · queuePromotionBusy · selectionSideChatRestrictedCommand |
| `fault.attachment.*` (18) | previewArtifactInvalid · previewNotMedia · previewTooLarge · beginConflict · tooManyUploads · chunkCountInsufficient · uploadNotFound · commitInProgress · chunkConflict · chunkGap · tooManyChunks · emptyChunk · totalBytesExceeded · stagingCapacityExceeded · uploadIncomplete · checksumMismatch · putUnsupported · readUnsupported (+previewRefNotAuthorized/previewRangeInvalid) |
| `fault.command.*` (19) | queryUnavailable · notImplemented · executionFailed · inputRejected · capabilityUnsupported · queuePromotionCommitFailed · assistantFeedbackUnsupported · inputDiscardedOnRestart · inputCancelled · querySessionNotFound · queryForeignWorkspace · persistentFactStoreUnavailable · persistentFactSessionNotFound · persistentFactWorkspaceMissing · stableForkStoreUnavailable · forkInputAdmissionMissing · childStartFailed |
| `fault.*` övriga | subscribe.sessionNotFound · subscribe.resumeFailed · provider.rateLimited/serverError/requestFailed · network.timeout/sseStalled/sseDisconnected/unreachable · runtime.hookBlocked/backgroundTaskFailed/unknown/toolLifecycleIncomplete/toolFailed · gateway.disposed · projectionEventCommit.{gatewayDisposed, aborted, timeout, applyFailed, disposed, rehydrated} · subscription.notOwned · fileChanges.unsupported · fileRewindPreview.unsupported |
| fristående | `heldQueueDispositionRequired` (u1t = V4HeldQueueDispositionRequiredError) |

**Felklasser med reasonCode-fält:** Jh = V4InputAdmissionRejectedError · g1 =
V4CommandNoopError (→ status "noop") · Ose = V4CommandNotImplementedError ("v4 command
not implemented in M3: \<typ\>") · I1t = V4SelectionSideChatRestrictedCommandError ·
u1t/l1t = heldQueueDispositionRequired/heldQueueConfirmationStale · vT =
V4GoalCompactRejectedError · _y = ProjectionEventCommitWaitError.

#### 11.5.3 Numeriska felkoder (qa = ZCode-protokollfelet) — med bevisade meddelanden

| Kod | Meddelande (bevisat) | Vakt |
|---|---|---|
| -32003 | "Cannot import session history without session store" | importerad historik utan store |
| -32009 | "Session state revision mismatch" | hT(expectedRevision) |
| **-32010** | **"A prompt is already running for this session"** | Kpn session/send + Lwt(activeAbortController) |
| -32012 | "Workspace model catalog revision mismatch" | _se(expectedRevision) |
| -32013 | "Provider registry revision mismatch" | YLi(expectedProviderRevision) |
| -32014 | "Model runtime revision mismatch" | QLi(expectedModelRuntimeRevision) |
| -32020 | "No ZCode Protocol client is attached for \<metod\>" | requestClient utan klient |
| -32031 | "Background task cancellation is not supported…" / "Provider runtime headers were not applied…" / restoreWarning | runtime-capability-klass (tre kallsätt) |
| -32600 | "Workspace generate operation is already active: \<id\>" | genereringssignals-lås |
| -32601 | "Method not found: \<metod\>" | metodrutning |
| -32602 | "Invalid params — \<zod-fel\>" (Dn-wrapper) · "sessionId is only supported for imported history creates" · "thoughtLevel is required" | params-validering |
| -32603 | "v4 gateway is not initialized" | requireV4Gateway |

**Namnrymdsvarning:** MCP-familjen (ProtocolError-uppräkningen, @ ~7 287 456) ÅTERANVÄNDER
nummer: ParseError -32700 · InvalidRequest -32600 · MethodNotFound -32601 · InvalidParams
-32602 · InternalError -32603 · ResourceNotFound -32002 · MissingRequiredClientCapability
-32021 · UnsupportedProtocolVersion -32022 · UrlElicitationRequired -32042 (+ ras-stegen
gq=-32020 "http-method"). Samma siffra = olika felklass — studion matchar fel på
reasonCode/message, ALDRIG på enbart numret.

#### 11.5.4 Delivery-triaden — bevisad semantik per läge

sendText-schemat (KLr @ ~10 527 925): `requestedDelivery?: "startNow"|"queue"|"guide"` +
`heldQueueDisposition?: "clearQueueAndSend"|"keepQueueAndSend"` +
`expectedHeldQueueItemIds?: string[]` + turnRuntimeModel/automationId/offPeak*/toolDisallowlist
(automationId ⊻ offPeakTaskId via superRefine). Admissionsdefault (A2 @ ~12 170 093):
`admittedDelivery ?? (guide→guide, queue→queue, annars startNow)`.

- **startNow** (@ ~12 363 574): förvärvar
  `acquireForegroundPromotionLease({leaseId:"send-now:<commandId>", mode:"after-current",
  promotedInputId})` — utfall ≠ "acquired" ⇒ Jh("fault.command.inputRejected", "send now
  foreground promotion is busy"). Vid förvärv: avbryter aktiv tur med
  `abortMessage:"v4 sendText startNow preempts active turn"`, **pausar målet automatiskt**
  (`goalPausedMutationReason:"send_now_goal_paused"`) och bevarar köns auto-drain
  (`preserveQueueAutoDrainOnCancel:true`). Lease släpps i finally.
- **queue**: `steerTurn(text,{commandKind, inputId, queryId, intent, delivery:"queue"})` ⇒
  `{kind:"queued"}` | `{kind:"rejected", reason}` där reason mappas: input_too_large ⇒
  proto.payloadTooLarge · empty_input ⇒ proto.invalidPayload · övrigt ⇒
  fault.command.inputRejected. Samma mappning för compact ("/compact" tvingas alltid
  delivery:"queue") och sendGoalCommand:s köväg.
- **guide**: pendingInput på den AKTIVA turen (klassificerare xgt:
  `(delivery ?? intent.admittedDelivery)==="guide" ? "guide" : "queue"`). När turen
  slutar faller guiden TILLBAKA till kö: händelse TurnSteerDeliveryChanged
  {requestedDelivery:"guide", admittedDelivery:"queue", fallbackReasonCode, pendingInputId,
  targetTurnId} + steer.state="fellBack" (@ ~10 790 648). Steer-tillstånd (ybn):
  notRequested→submitting→steering→guided|fellBack; dispatch-tillstånd (NBe):
  admitted→queued→reserved→promoting→drained.
- **Routing-läget** (serverns beslut, yta rje @ ~383 155): `{mode:
  "startNow"|"enqueue"|"guide"|"reject"|"choice", reasonCode?}`. Vid "choice" MÅSTE klienten
  svara med heldQueueDisposition + expectedHeldQueueItemIds som matchar kön EXAKT (annars
  u1t heldQueueDispositionRequired / l1t guard.heldQueueConfirmationStale; z3e @ ~12 362 477).
  "reject"-grenens hanterare ej påträffad i skannade kontexter — värdet är schema-bevisat.
- **createSession + firstInput** (@ ~12 392 784): admission kind "queued" ⇒ delivery
  "queue", annars "startNow"; misslyckad firstInput rullas tillbaka med
  cancelInputCommand("fault.command.inputRejected").
- **sendGoalCommand startNow-väg** (Bse): heldQueueDisposition-validering →
  setTarget({objective, status:"active"}) — målet sätts aktivt i samma kommando.

#### 11.5.5 -32010-förhållandet — mål-loopens serialisering förklaras

DEN ÄLDRE styrvägen (session/send, Kpn @ ~12 096 974) AVVISAR med -32010 när
activeAbortController lever ("A prompt is already running") — därför serialiserar
studions mål-motor (våg 152/156) idag via vänta-och-försök-igen. **v4-triaden ersätter
den serialiseringen: ingen av de tre lägena kastar -32010.** startNow preemptar (lease +
abort + mål-paus "send_now_goal_paused" — notera: målet PAUSAS automatiskt, återupptas ej
implicit), queue styrs in i den pågående turen, guide styr med garanterad kö-fallback.
Revision-vakterna -32009/-32012/-32013/-32014 är den formella innebörden av envelopens
baseRevision/baseLogEpoch (brygdat våg 175): fel förväntad epok/revision ⇒ stale/rejected
INTE tyst kompatibilitet. Vid post 35 (UI-koppling) väljer studien alltså delivery-läge i
stället för retry-på--32010 — och mål-paus-bieffekten vid startNow MÅSTE synas i UI:t.

#### 11.5.6 Flights och deras tidsvakar (ärliga fynd)

- **readyFlights** (ConversationV4Gateway j3e): `ensureColdReadyPublisher` (@ ~12 354 273)
  = get-or-create av ETT löfte (coldResume.ensureResumed → hydratePublisher); städning via
  `i.then(clear, clear)` där clear endast raderar om kartan fortfarande bär SAMMA löfte —
  en gammal flight kan aldrig radera en nyare. ALLA frågevägar (subscribe/rowsRange/plans/
  fileChanges/fileRewindPreview) väntar på flighten FÖRST (§11.3 bekräftat i fem kontexter).
- **Ingen egen timeout på flight-löftet** — funnet i 3.11.2-24-skanningen. Den enda
  tidsvakten i gatewayen är **projectionEventCommit-väntarna: XBi = 25 000 ms** ⇒
  `fault.projectionEventCommit.timeout` (ProjectionEventCommitWaitError, timer unref:ad,
  avbrytbar via signal; @ ~12 330 664); dispose ⇒ gatewayDisposed. eji = 2 000 =
  telemetri-dedup-tak (inget med flights att göra).
- **Studio-konsekvens:** vår klient behåller SIN egen tidsgräns (AbortSignal-mönstret) —
  bundeln ger ingen flyg-timeout att lita på; en hängande hydration skulle annars hålla
  v4/command-obestämd.

#### 11.5.7 Studions tillämpning

Kommandorutten (våg 175, /api/studio/tjanster/kommando) konsumerar detta så: klienten
tolkar ack.status först (rejected+reasonCode ⇒ felmeddelande; duplicate ⇒ idempotent
omsändning OK; noop ⇒ meddela "ingen åtgärd"), result.inputDisposition.delivery styr
UI-etiketten, och -32010 på den äldre styrvägen blir vid post 35 ett LÄGESVAL (triaden)
i stället för ett fel. Post 36 härmed levererad ⇒ post 35 (UI-koppling) OBLOCKERAD
och fri att väljas — feature-avvägningen (växling + rollback) förblir dess villkor enligt §11.4.
