# R1 — PROTOKOLLET v2: den kompletta metodytan UR KÄLLKODEN

Expedition R1, våg 152 (omgång 2). Denna version ersätter grep-kartan ur
zcode.cjs: metodytan är nu verifierad i **zcode-cli:s TypeScript-källkod**
(`/home/ak1a/forskning/zcode-cli` — launcher-repot kring den officiella
runtimen) och korsad mot **AK1-studions faktiska anrop** (62 protokollFraga-
anrop i `src/lib/studio/studio-transport.ts`, 8 666 rader).

Kolumnerna **Källa** och **Studio**:
- Källa: `TS` = typad i launcher-källkod · `RT` = metodsträng i vendor-
  runtimen (zcode.cjs-grep, våg 152 omgång 1) · `ST` = dokumenterad med
  parametrar i studio-transportens protokollkommentarer (LIVE-bevisade).
- Studio: ✅ = transporten anropar metoden i dag · ❌ = saknas.

## §0 Transportprotokollet (src/app-server-client.ts)

- **Engångsklienten** (`requestAppServer`): spawnar `<node> zcode.cjs
  app-server`, skriver EN rad `{id:1, method, params}\n` på stdin, läser
  newline-separerade JSON-kuvert från stdout; svar = kuvert med `id===1` →
  `{id?, error?{code?,message?,data?}, result}`. Tak 16 MB utdata; abort =
  SIGTERM → 500 ms → SIGKILL; felklasser `AppServerRequestError` (protokoll-
  fel med code), `AppServerProcessError` (exitkod), `AppServerCancellationError`
  (130/128+signal).
- **Notiskanalen** (studio-transportens egen klient + TUI: `session/subscribe`):
  beständig barnprocess; servern skickar `session/event`-notiser (§3).
- **Kapabilitetsschema** (runtime-capabilities.ts): `{schemaVersion:1,
  cli:{globalOptions:{<namn>:{type:"boolean"|"string", multiple?}}}}` —
  launcher ↔ runtime-kontrakt vid uppstart.

## §1 session/* (21)

| Metod | Parametrar → Retur (så långt källan visar) | Källa | Studio |
|---|---|---|---|
| session/create | `{cwd?, model?, mode?, thoughtLevel?, persistence?:"immediate"}` → sessionsobjekt; v4-rader kräver immediate (ST) | ST | ✅ |
| session/resume | `{sessionId}` → session; fel -32031 när sessionen är stängd (ST) | ST | ✅ |
| session/close | `{sessionId}` (ST) | ST | ✅ |
| session/list | `{}` → `{sessions:[…]}` — BEVISAT i check-runtime.ts:187 (protokollhälsokollen) | TS | ✅ |
| session/read | `{sessionId}` → `{projection:{contextUsed, contextWindow, totalTokenCount, status, …}}` (ST; källtyp §4) | ST | ✅ |
| session/messages | `{sessionId, limit?}` → meddelanden `[{messageId, role, parts[], text}]` (TS events.ts: RestoredMessage) | TS | ✅ |
| session/events | `{sessionId, …}` → historiska event (v97 E2-replay) | RT | ✅ |
| session/subscribe | `{sessionId}` → notisström `session/event` (ST; TUI-brygga: `subscribeSessionEvents` → `runtime.subscribeEvents`) | TS+ST | ✅ |
| session/send | `{sessionId, input, delivery?:"auto"\|"start_turn"\|"steer_active_turn", queueDelivery?:"guide"\|"queue", expectedTurnId?, pendingInputId?}` → turnresultat `{kind:"started_turn", …}` (TS types.ts PromptCallOptions) | TS | ✅ |
| session/stop | `{sessionId}` → stoppar aktiv turn + pausar mål (ST) | ST | ✅ |
| session/setMode | `{sessionId, mode:"build"\|"plan"\|"edit"\|"yolo"}` → `{mode}` (ST; TUI-brygga `setMode` → `app.setMode` el. `runtime.updateConfig({mode})`) | TS+ST | ✅ |
| session/setModel | `{sessionId, model, transient?:true}` — TUI-källan bevisar `{transient:true}` = minnesläge utan config-skrivning (sync-runtime.ts:767) | TS | ✅* create-vägen |
| session/setThoughtLevel | `{sessionId, thoughtLevel:"nothink"\|"low"\|"medium"\|"high"\|"max"}` (ST) | ST | ✅ |
| session/goal | `{sessionId, goal\|show…}` → startar/visar autonom loop (ST) | ST | ✅ |
| session/compact | `{sessionId}` → kompaktering som turn, svarar vid idle (ST) | ST | ✅ |
| session/fork | `{sessionId, target}` — target = discriminatedUnion `{kind:"turn",turnIndex≥0}\|{kind:"message",messageId}\|{kind:"checkpoint",checkpointId}\|{kind:"latestCheckpoint"}` → `{forkedSessionId, parentSessionId, targetMessageId, response, snapshot}`; -32004 ogiltigt turnIndex, -32603 utan checkpoint (ST v86-sond) | ST | ✅ |
| session/subagents | `{sessionId}` → levande subagent-barn (våg 152-rutten /api/studio/subagenter) | RT | ✅ |
| session/cancelBackgroundTask | `{taskId}` — TUI-brygga `cancelBackgroundTask(taskId)` (check-runtime.ts:98) | TS | ✅ |
| session/updateRuntimeModelConfig | modellkonfig vid körning (RT) | RT | ❌ |
| session/requestRuntimePreferences | `{sessionId}` → preferenser (RT) | RT | ✅ |
| session/usage | `{sessionId}` → tokenanvändning (ST; TUI-brygga: `sessionStore.queryTaskUsage({sessionID})`) | TS+ST | ✅ |

\* Studio föder modellen via create-param (KVD-val, dokumenterat i transporten);
setModel på levande session är dokumenterad reserv.

## §2 workspace/* (11)

| Metod | Parametrar → Retur | Källa | Studio |
|---|---|---|---|
| workspace/readState | `{workspace}` → `{mode, model, thoughtLevel, …}` | ST | ✅ |
| workspace/generateText | `{workspace, prompt, …}` → text utan sessionskostnad | RT | ✅ |
| workspace/cancelGenerateText | (avbryt pågående generateText) | RT | ❌ |
| workspace/setDefaultMode | `{workspace, mode}` → persistent default | RT | ✅ |
| workspace/setDefaultModel | `{workspace, model}` → persistent default | RT | ✅ |
| workspace/setDefaultThoughtLevel | `{workspace, thoughtLevel}` → persistent default | RT | ✅ |
| workspace/updateInteractionPreferences | interaktionspreferenser (auto-policy) | RT | ❌ |
| workspace/updateModelIoPreferences | modell-I/O-preferenser | RT | ❌ |
| workspace/updateProviderRegistry | provider-register | RT | ❌ |
| workspace/upsertModelProvider | egen provider | RT | ❌ |
| workspace/removeModelProvider | `{providerId}` | RT | ❌ |

## §3 interaction/* (6) — ÄVEN server→klient-requests

| Metod | Parametrar → Retur | Källa | Studio |
|---|---|---|---|
| interaction/requestPermission | SERVER→KLIENT: `{input, reason, requestId, riskLevel, options:[{optionId:"allow_once"\|"allow_project"\|"deny", kind, name, response?}], toolCallId, toolName, turnId}` → klient svarar `{decision:"allow"\|"deny"\|"escalate"\|"modify", reason?, permissionUpdates?:[{type:"addRules",behavior,rules:[{toolName}]}]}` (ST §3) | ST | ✅ |
| interaction/requestUserInput | SERVER→KLIENT: `{requestId, prompt, inputType?:"text"\|"choice"\|"confirm", choices?}` → `{value}\|{cancelled:true}` (ST §3) | ST | ✅ |
| interaction/browserExecute | `{…}` → webbläsarkommando | RT | ✅ |
| interaction/browserList | `{}` → tillgängliga webbläsare | RT | ✅ |
| interaction/requestProviderRuntimeHeaders | provider-rubriker | RT | ❌ |
| interaction/requestOfficialMcpAuthHeaders | `{}` → auth-rubriker (ST: "hoppa över"-svar {}) | ST | ✅ |

## §4 automation/* (5)

| Metod | Källa | Studio |
|---|---|---|
| automation/create | RT | ✅ |
| automation/list | RT | ✅ |
| automation/update | RT | ✅ |
| automation/delete | RT | ✅ (transport; UI-panel = V91-gap) |
| automation/checkTaskBinding | RT | ❌ |

## §5 plugins/* (13) + skills + mcp + usage

Hela plugin-familjen är TYPAD i `src/plugin-protocol.ts` + `src/plugin-cli.ts`
(samma `workspace:{workspaceKey,workspacePath}`-parameter på alla).

| Metod | Parametrar → Retur | Källa | Studio |
|---|---|---|---|
| plugins/list | `{workspace}` → `{plugins:[{id,name,description,version,enabled,source,skillCount,components[]}], diagnostics[]}` (ST) | ST | ✅ |
| plugins/setEnabled | `{workspace, pluginId, enabled}` | RT | ✅ |
| plugins/overview | `{workspace}` → katalogöversikt (marketplaces+plugins+diagnostics) | TS | ❌ |
| plugins/describe | `{pluginName, marketplace}` → beskrivning/plan | TS | ❌ |
| plugins/install | `{pluginName, marketplace, scope?:"user"\|"workspace", dryRun?}` → plan/resultat | TS | ❌ |
| plugins/validate | `{pluginName, marketplace}` ELLER `{source}` | TS | ❌ |
| plugins/update | `{pluginId?, marketplace?}` | TS | ❌ |
| plugins/configure | `{pluginId, options:<JSON>, dryRun?}` | TS | ❌ |
| plugins/restoreBuiltin | `{pluginId}` | TS | ❌ |
| plugins/referenceCatalog | `{workspace}` → `{authority:"session"\|"workspace", plugins:[{pluginId,name,marketplace,enabled,icon?,skillQualifiedNames[],mcpServerNames[],subagentNames[],conflictingPluginIds[]}]}` — TYPAD i plugin-protocol.ts:39 + normalisering i plugin-references.ts | TS | ❌ |
| plugins/marketplace/add | `{source, dryRun?}` (tvekatalogs-flöde: alltid dryRun-först) | TS | ❌ |
| plugins/marketplace/remove | `{marketplace}` | TS | ❌ |
| plugins/marketplace/update | `{marketplace?}` | TS | ❌ |
| skills/referenceCatalog | `{workspace}` → `{authority, skills:[{id:"glm:…", name, description, path, scope:"plugin"\|"workspace"\|"user", enabled}]}` (ST) | ST | ✅ |
| mcp/list | `{workspace}` → `{statuses: Record<serverNamn, {status:"connected"\|"failed", transport:"stdio"\|"http"\|"sse", toolCount, updatedAt, error?}>}` (ST) | ST | ✅ |
| usage/stats | → plattformsstatistik | RT | ✅ |

## §6 v4/* (10) — persistenta sessionens datagren

Bevisad kedja i studio-transportens F4-dokumentation (sond v85-f4):

| Metod | Parametrar → Retur | Studio |
|---|---|---|
| v4/attachment/begin | `{sessionId?, filename, mime?}` → bildbilaga påbörjas | ✅ |
| v4/attachment/chunk | `{id, data}` → base64-del | ✅ |
| v4/attachment/commit | `{id}` → bilaga klar | ✅ |
| v4/attachment/abort | `{id}` | ✅ |
| v4/conversation/subscribe | `{topic:"conversation/<sid>", connectionId:<egen sträng>, clientMode:"web-remote-replayable"}` → `{subscriptionId, mode:"snapshot", logEpoch}` | ✅ |
| v4/conversation/rowsRange | `{sessionId, clientMode, limit}` → `{rows:[{rowId, entityId, kind:"turnHeader"\|…}], atSeq, atLogEpoch}` | ✅ |
| v4/conversation/fileChanges | `{sessionId, target:{rowId, entityId}, baseRevision, baseLogEpoch}` → `{files, additions, deletions, items:[{path, additions, deletions, writeCount, toolNames, patches:[{oldStart,oldLines,newStart,newLines,lines[]}]}]}`; fel -32603 proto.staleRevision\|staleLogEpoch\|staleTarget | ✅ |
| v4/conversation/frame | NOTIS: `{kind:"complete", topic, frame:{payload:{kind:"deltas", deltas:[{op:"state.updated",patch:{revision:N}}, {op:"row.appended"}…]}}}` | ✅ (notis) |
| v4/connection/flow | flödeskontroll `{connectionId, state:"saturated"\|"drained"\|"closed"}` — EJ handskakning | dokumenterad |
| v4/controller/subscribe | controllernotiser (dokumenterad i v4-kartan §6.1) | dokumenterad |

## §7 Eventprotokollet (packages/zcode-tui/src/events.ts — TS)

Notiskuvert: `{type:"session/event", params:{…payload}}`; TUI:n normaliserar
till StreamEvent. Eventtyper ur källan:
- **part.delta** — field `text|reasoning|input|output` + delta (live-streaming).
- **tool_call_scheduled/started/progress/result/error/closed** → kind
  scheduled/started/progress/result/error/closed; bär toolName, toolCallId,
  input, result, error, durationMs, progress (elapsedMs/stdoutTail/stderrTail/
  pid/bytes…).
- **turn.started / turn.completed** — rundstatistik (duration, resultType,
  toolCallCount).
- **state.updated** — patch.status running/idle + activeToolCalls.
- **subagent_message** — agentId, agentType, childSessionId, text.
- **model_request_started/completed/failed/retry_scheduled/stream_stalled** —
  nätverkslager; avbrott känns igen via errorCode model_request_cancelled.
- Bakgrundsuppgifter: taskId(s), taskKind, status.
- **RestoredPart-typer** (transkript/meddelanden): text, thought, tool, file,
  step-start, step-finish (cost/tokens), snapshot, patch (checkpoint),
  retry, compaction, subagent, agent.

## §8 Runtime-projektionen (packages/zcode-tui/src/runtime-projection.ts — TS)

`readRuntimeProjection()` (TUI-bryggan) = `runtime.getProjection()` berikad
med `runtimeTaskRegistry`-bakgrundsuppgifter. Källtypen
RuntimeProjectionSnapshot = sanningen bakom session/read-projektionen:

- `sessionId, status, mode, turnCount, totalTokenCount, currentTurnId`
- `activeToolCalls[] {toolCallId, toolName, status: pending|running|completed|failed|denied, startedAt}`
- `backgroundJobs[] {taskId, taskKind: local_agent|local_bash|local_workflow|monitor_mcp|unknown, agentId?, agentType?, childSessionId?, parentSessionId?, parentToolCallId?, turnId?, blocked?, cancellable?, command?, description?, prompt?, error?, status: running|completed|failed|timed_out|cancelled|killed|stopped|spawn_error|lost, pid?, startedAt?, completedAt?, outputPath?, outputBytes?, stdoutTail?, stderrTail?, terminalId?}`
- `restoredBackgroundTasks[]` (återställda vid resume)
- `contextUsage {used, size, cost:{amount,currency}?, cache:{inputTokens, cacheReadTokens, cacheWriteTokens, hitRate…}?, breakdown:[{source: system_prompt|skills|messages|tool_io|…, chars}]}`
- `lastError {type, code?, message, detail?}`

**Pollkontrakt** (runtime-poll.ts): 1 s aktiv / 5 s idle; alla event utom
text-/reasoning-/tool_input-deltan triggar omläsning.

## §9 TUI-bryggan RuntimeAdapter (24 metoder — TS, types.ts:73)

Stabla gränssnittet TUI:n får av runtimen (bevis för vilken app-fasad som
finnes bakom protokollet): loadSessionTranscript, loadSessionContextMessages,
listPluginReferences (→ plugins/referenceCatalog), listSkills, listModelOptions
(→ app.listModels), reloadModelOptions (→ setModelCatalogOverlay-overlay!),
setTransientModel (→ setModel {transient:true}), recallPreviousInput, readGoal
(→ readTarget), readTodos, readRuntimeProjection, readSessionUsage (→
queryTaskUsage), cancelBackgroundTask, sendBackgroundTaskMessage ({taskId,
message, summary, restart?} → subagentPort.sendMessage; restart → stopTask
först), previewFileRewind/applyFileRewind ([targetMessageIds] →
preview/applyWorkspaceFileRewind), interruptTurn ({pendingInputIds?, reason?,
reservationId?, waitForIdle?} → stopActiveForegroundExecution), sendInput,
promoteQueuedInput, submitPrompt, setMode, listMcpServers,
refreshWorkflowPanel/stopWorkflow ({runId}), subscribeWorkflowEvents,
subscribeSessionEvents (→ runtime.subscribeEvents).

## §10 Studio-läget i dag (2026-09-14, våg 152)

**47 metodsträngar** i studio-transport.ts — alla ✅ i tabellerna ovan.
Förra kartans TIO gap är STÄNGDA: session/fork, session/subagents,
session/cancelBackgroundTask, workspace/generateText,
workspace/setDefaultMode/Model/ThoughtLevel, interaction/browserList,
interaction/requestOfficialMcpAuthHeaders, session/requestRuntimePreferences
(+ nya namnrymder tillagda: session/subscribe, plugins/list,
skills/referenceCatalog, hela v4-grenen).

## §11 Topp 5 högst värda saknade (nya, rankade)

1. **workspace/cancelGenerateText** — generateText är levererad men kan ej
   avbrytas; allt som startas måste kunna stoppas (kundtema: kontroll).
   Par till session/stop. Liten insats, hög säkerhetsvinst.
2. **plugins-familjen** (overview, describe, install, validate, update,
   configure, restoreBuiltin, marketplace/add|remove|update — 11 metoder,
   ALLA typade i launcher-källan med parametrar) → pluginbibliotek som
   självbetjäningsyta i studion: installera/uppdatera plugins (browser-use,
   ios-simulator…) utan SSH. Största sammanhängande ytan.
3. **automation/checkTaskBinding** — automations-CRUD lever men bindningar
   kan gå sönder tyst; healthcheck per automation gör vakten ärlig.
4. **workspace/updateInteractionPreferences** — flytta studions auto-policy
   (30 s-eskalering, allow-project-regler) från transportens minne till
   serverpersistenta preferenser — samma värde som våg 93 gav för läge/modell.
5. **session/updateRuntimeModelConfig** — körningsdynamisk modellkatalog
   (TUI-källans overlay-väg: setModelCatalogOverlay) → modellbyte utan att
   döda sessionen; relevant när modellkatalogen växer.

(Nedprioriterade: provider-register-metoderna — R2-känsliga nära API-nycklar,
kundens veto; requestProviderRuntimeHeaders samma.)

## §12 Felkoder & fällor (dokumenterade i källorna)

- -32004 ogiltigt fork-turnIndex · -32010 prompt-kö (v142) · -32031 resume
  på stängd session · -32603 proto.stale* (v4-revision/target/logEpoch) och
  "No workspace checkpoint is available yet".
- FALSKA POSITIVA från cjs-grep: model/stl, model/obj m.fl. = 3D-filformat.
- plugins-fel bärs som `diagnostics[]` i svaret, ej JSON-RPC-fel.

## Källförteckning

- `/home/ak1a/forskning/zcode-cli/src/app-server-client.ts` (transport, TS)
- `…/src/plugin-protocol.ts` + `src/plugin-cli.ts` (plugins/*, parametrar, TS)
- `…/src/runtime-capabilities.ts` (kapabilitetsschema, TS)
- `…/packages/zcode-tui/src/types.ts` (RuntimeAdapter, PromptCallOptions, TS)
- `…/packages/zcode-tui/src/runtime-projection.ts` + `runtime-poll.ts` (projektion/poll, TS)
- `…/packages/zcode-tui/src/events.ts` (eventprotokoll, TS)
- `…/scripts/sync-runtime.ts` (brygginjektionerna = runtime-fasadens sanning)
- `…/scripts/check-runtime.ts` (session/list-protokollhälsokoll)
- AK1 `src/lib/studio/studio-transport.ts` (studio-användning, 47 strängar)
- Föregångaren (våg 152 omg. 1): metodsträngar ur vendor/zcode.cjs — kvar som
  källa `RT` där TS-källan tiger (runtime är ej vendored i forskningsträdet).
