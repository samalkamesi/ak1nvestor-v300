# V91 Z-PARITETSKARTA — A4-granskning (READ-ONLY mot src/)

**Uppdrag** (STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 91" block A4): "Inventera
BOKSTAVLIGEN varenda tjänst i zcode-binären (v83-kartan + live-sond mot
app-servern): session/\*, workspace/\*, interaction/\*, plugins/skills/mcp,
automation, usage, v4-grenen — jämför med studion, ranka luckor (P0
kundnära / P1 kraft / P2 sen), dokumentera protokollform för varje lucka =
underlag för våg 92+."

**Källor:** `tool-results/v83-protokollkarta.md` (LAGEN — komplett metodkarta,
LIVE-testad 2026-09-09) · `src/lib/studio/studio-transport.ts` (6 004 r,
faktiska wire-anrop) · `src/components/ak1a/studio-chat.tsx` (7 536 r, UI-ytor)
· `src/lib/studio/kommandon.ts` · samtliga 12 rutter under
`src/app/api/studio/`. **Mätmetod:** deterministiskt skript
`tool-results/v91-paritetskontroll.mjs` (grep:ar varje wire-metod i
transporten) + manuell kodläsning av UI-ytor. Inget i src/ ändrades.
**ÖGONBLICKSBILD:** mätningen är tagen MITT I våg 91 — block A1/A2/A3
byggs parallellt av andra agenter (transporten/chat-filerna ändras under
granskningen); A1d/A1b/A2-ytor som landar efter detta tillfälle syns
alltså som SAKNAS ovan och skall mätas om med skriptet före våg 92.

**Lägesord:** ✓ = IMPLEMENTERAD (transportmetod + API-rutt + UI-yta) ·
~ = DELVIS (metod finnes men parameter-/täckningsgap, eller ersatt av annan
väg) · ✗ = SAKNAS.Statuskolumnen är grundad i kod, inte gissning.

**MÅTTBAT RESULTAT: 91 tjänster totalt (85 wire-metoder + 6 notiskanaler) —
31 ✓ (34 %) · 3 ~ · 57 ✗ (63 %).** Detaljer per domän nedan.

---

## 1. TJÄNSTEINVENTERING + PARITETSMÄTNING

### 1.1 session/* — 21 tjänster (kartan §1 + handskakningen)

| # | Tjänst | Gör (1 rad) | Protokollform (ur kartan) | Status | Var i studion |
|---|--------|-------------|---------------------------|--------|----------------|
| 1 | session/create | Skapar session med modell/läge/tanke/persistens | {workspace, model?:xc, mode?, persistence?, thoughtLevel?, mcpServers?, toolAllow/Denylist?, importedHistory?} → snapshot `pce` | ✓ (param-gap, se §2) | transport `skapa()`; UI: "+ Nytt samtal", modellbytare, Inställningar-drawer |
| 2 | session/resume | Återupptar persistent session | {sessionId, workspace?, runtimeModel?…} → snapshot | ✓ | transport `oppnaSession()`; UI: sidebar-klick på session (v84 B) |
| 3 | session/list | Listar sessioner (+arkiv, limit) | {workspace?, includeArchived?, limit?} → {sessions:qBe[]} | ✓ | transport `lasSessioner()`; UI: sidebar-listan (v90 K3) |
| 4 | session/read | Snapshot + projektion (kontext, pending, bakgrundsjobb) | {sessionId, messageLimit?, afterSeq?} → snapshot {projection:{contextUsed, backgroundJobs[], …}} | ✓ (bakgrundsjobbs-listan = bara räknare, se P0-4) | transport `lasKontext()`; UI: LIVE-raden/kontextrad i höger panel |
| 5 | session/messages | Meddelandehistorik med delar (text/tool/file) | {sessionId, afterMessageId?, limit?} → {messages:[{info,parts:VBe}]} | ✓ | transport `historik()`; UI: chattflödet + återkoppling H1 (frånvarons historik) |
| 6 | session/events | Händelsehistorik efter sekvensnummer | {sessionId, afterSeq?, limit?} → {events:vEt[]} | ✗ (P1) | — (ersatt av messages+subscribe-afterSeq; replay-vägen saknas) |
| 7 | session/subscribe | Aktiverar live-flödet av session/event | {sessionId, deliveryKind:"desktop-continuous"\|"web-remote-replayable", afterSeq?, includeSnapshot?} | ✓ | transport `ensure()/oppnaSession()`; SSE-bryggan /api/studio/stream |
| 8 | session/send | Skickar prompt (ASYNKRON — svar = turn.completed) | {sessionId, content, attachments?, browserAmbientContext?, expectedRevision?, automationId? ⊕ offPeakTaskId?…} → {accepted, stateRevision} | ✓ (param-gap, se §2) | transport `skicka()`; UI: composer (Enter), POST /api/studio/stream |
| 9 | session/stop | Avbryter prompt + pausar mål | {sessionId} → {} | ✓ | transport `pausaMal()`/stäng ström; UI: "Pausa målet"-knappen |
| 10 | session/cancelBackgroundTask | Avbryter bakgrundsjobb/subagent-task | {sessionId, taskId} → {cancelled, status, snapshot?} (Tkn-form i kartan) | ✓ | transport `avbrytBakgrundsTask()`; UI: Bakgrundsagenter-listans avbryt-knapp |
| 11 | session/fork | Forkar vid turn/message/checkpoint | {sessionId, target:{kind…}, expectedRevision?} → {forkedSessionId, snapshot} | ✓ | transport `forka()`+`rewindTillTurn()` (v86 G5); UI: "⟲ Gå tillbaka hit" |
| 12 | session/compact | Komprimerar kontext (kör som turn) | {sessionId, inputId?, instructions?, expectedRevision?} → {compact:{state}} | ✓ | transport `compact()`; UI: /komprimera + kontextknapp |
| 13 | session/goal | Autonom mål-loop: show/set/replace/pause/resume/clear | {sessionId, action, objective?…} → {response, snapshot, startedTurn?} | ✓ | transport `lasMal/sattMal/rensaMal/pausaMal/aterupptaMal` (v85 F1); UI: mål-dialog, mål-panel, autonom banner |
| 14 | session/close | Stänger session | {sessionId, expectedPersistence?} → {closed} | ✓ | transport `stangSession()`; UI: "Stäng samtal" + hushållning (v90 K1) |
| 15 | session/setModel | Byter modell på LEVANDE session | {sessionId, model:xc, expectedRevision?…} → snapshot | ~ (P1) | metoden anropas EJ — `bytModell()` kasserar+skapar (create-väg, KVD-val v82); modellbyte = nytt sessionId, historiken lämnas |
| 16 | session/setThoughtLevel | Tankestyrka (nothink/high/max bevisat) | {sessionId, thoughtLevel?, expectedRevision?…} → snapshot | ✓ | transport `sattTankeNiva()`; UI: Inställningar-drawer ⚙ |
| 17 | session/setMode | Läge (protokollet: plan/build/edit/yolo/auto) | {sessionId, mode, expectedRevision?} → snapshot | ~ (P2) | transport `sattLage()` — typning "build"\|"plan" ENDAST; edit/yolo/auto exponeras ej |
| 18 | session/updateRuntimeModelConfig | Byter runtime-modellkonfig levande | {sessionId, runtimeModel:$f, applyModelSelection?} → {changed} | ✗ (P2) | — |
| 19 | session/subagents | Listar underagenter (kräver persistent session) | {sessionId, endedCursor?, endedLimit?} → {running[], ended{items[],nextCursor}} | ✓ | transport `lasSubagenter()` (ärlig tom-lista vid -32004); UI: Bakgrundsagenter-panelen |
| 20 | session/usage | Tokenräkning per session | {sessionId} → {totalTokens, input/output/reasoning/cache…} | ✓ | transport `lasUsage()` (slås samman med usage/stats); UI: kontext/token-ytor + admin Utveckling |
| 21 | session/requestRuntimePreferences | SERVER→KLIENT handskakning (MÅSTE svaras, 15 s) | {sessionId, scope} → {nativeSearchEnhancementsEnabled:false, memoryEnabled:false, askUserQuestionAutoResolutionEnabled:true, …} | ✓ | transport ProtokollKlientens autosvar (rad ~1058) |

### 1.2 workspace/* — 12 tjänster (kartan §2)

| # | Tjänst | Gör | Protokollform | Status | Var i studion |
|---|--------|-----|---------------|--------|----------------|
| 1 | workspace/readState | Läges/modell/permission/tanke-inställningar + katalog + slash-kommandon | {workspace, runtimeModel?, preferWorkspaceDefaults?} → {settings, modelCatalog, slashCommands[]} | ✓ | transport `lasArbetsyta()`; UI: GET /api/studio/session (arbetsyta-info), modellrullistan (config.json + "vald" via session/read) |
| 2 | workspace/generateText | Headless textgenerering UTAN session (ABORT-bara) | {workspace, modelRef, prompt ⊕ messages, tools?, maxOutputTokens?, operationId?} → {text, toolCalls?, usage?} | ✗ (P1) | — (A1d-lovat i våg 91; ej i kodbasen vid granskningstillfället) |
| 3 | workspace/cancelGenerateText | Avbryter generateText-operation | {operationId} → {operationId, cancelled} | ✗ (P1) | — |
| 4 | workspace/hooks/trustGrant | Godkänner workspace-hooks-bundle (digest-låst) | {workspace, bundleDigest:64hex, hookDeclarationDigest} → {accepted, reasonCode?} | ✗ (P1) | — |
| 5 | workspace/updateProviderRegistry | Uppdaterar providerregistret | {workspace, registry:{revision, providers[]}} → {appliedProviderRevision, status} | ✗ (P2) | — |
| 6 | workspace/updateInteractionPreferences | Interaktionsinställningar | (zod @~465k i källan) → snapshot | ✗ (P2) | — |
| 7 | workspace/updateModelIoPreferences | Modell-IO-inställningar | — " — | ✗ (P2) | — |
| 8 | workspace/upsertModelProvider | Lägg/uppdatera provider | — " — | ✗ (P2, begränsad se §5) | — |
| 9 | workspace/removeModelProvider | Ta bort provider | — " — | ✗ (P2) | — |
| 10 | workspace/setDefaultModel | Default-modell för workspacet | — " — | ✗ (P2) | — |
| 11 | workspace/setDefaultThoughtLevel | Default-tankestyrka | — " — | ✗ (P2) | — |
| 12 | workspace/setDefaultMode | Default-läge | — " — | ✗ (P2) | — |

### 1.3 plugins/* — 17 tjänster (kartan §2)

| # | Tjänst | Gör | Protokollform | Status | Var i studion |
|---|--------|-----|---------------|--------|----------------|
| 1 | plugins/list | Installerade plugins + komponenter + diagnostik | {workspace, configScope?} → {plugins:[{id,version,enabled,skillCount,components[]}], diagnostics[]} | ✓ | transport `lasPlugins()` (v85 F2); UI: Färdigheter ⚡-panelen, /fardigheter |
| 2 | plugins/overview | Marknadsplatser, tillgängliga/aktuella/återställbara | {workspace, configScope?} → {marketplaces[], available/installed/restorableBuiltins[], capability} | ✗ (P2) | — |
| 3 | plugins/referenceCatalog | Full referenskatalog plugins (authority session/workspace) | {workspace, sessionId?} → {authority, plugins[]} | ✗ (P2) | — |
| 4 | plugins/setEnabled | Toggla plugin på/av | {workspace, pluginId, enabled, scope} → snapshot | ✗ (P1 — v85 F2-lovade toggling) | — |
| 5 | plugins/marketplace/add | Lägg till marknadsplats | (zod kring `rr`) → driftresultat | ✗ (P2, begränsad se §5) | — |
| 6 | plugins/marketplace/remove | Ta bort marknadsplats | — " — | ✗ (P2) | — |
| 7 | plugins/marketplace/update | Uppdatera marknadsplats | — " — | ✗ (P2) | — |
| 8 | plugins/install | Installera plugin | — " — | ✗ (P1) | — |
| 9 | plugins/uninstall | Avinstallera | — " — | ✗ (P1) | — |
| 10 | plugins/update | Uppdatera plugin | — " — | ✗ (P2) | — |
| 11 | plugins/restoreBuiltin | Återställ inbyggt plugin | — " — | ✗ (P2) | — |
| 12 | plugins/configure | Konfigurera plugin | — " — | ✗ (P2) | — |
| 13 | plugins/resetConfig | Nollställ konfig | — " — | ✗ (P2) | — |
| 14 | plugins/validate | Validera konfig | — " — | ✗ (P2) | — |
| 15 | plugins/describe | Beskriv konfig-yta | — " — | ✗ (P2) | — |
| 16 | plugins/cancelOperation | Avbryt pågående driftoperation | {operationId} → — | ✗ (P2) | — |
| 17 | plugins/resolveSuggestedReference | Lös referens → plugin/skill | — " — | ✗ (P2) | — |

### 1.4 skills + mcp + usage — 3 tjänster (kartan §2)

| # | Tjänst | Gör | Protokollform | Status | Var i studion |
|---|--------|-----|---------------|--------|----------------|
| 1 | skills/referenceCatalog | Agentens alla skills (id "glm:…", scope, enabled) | {workspace, sessionId?} → {authority, skills[]} | ✓ | transport `lasSkills()`; UI: Färdigheter ⚡ (v85 F2) |
| 2 | mcp/list | MCP-serverstatus + verktygsantal | {workspace, mcpServers?, mode?} → {statuses:Record<namn,{status,transport,toolCount…}>} | ✓ | transport `lasMcp()`; UI: Färdigheter-MCP-sektion |
| 3 | usage/stats | Förbrukning per range (bevisat 8,35 M tkn/7d) | {range:"all"\|"7d"\|"30d", timeZone?} → {summary{totalTokens, toolCallCount…}, byModel?} | ✓ | transport `lasUsage()` (merge med session/usage); UI: /api/studio/anvandning → admin Utveckling-panelen |

### 1.5 automation/* — 5 tjänster (kartan §2) — ALLA SAKNAS

| # | Tjänst | Gör | Protokollform | Status |
|---|--------|-----|---------------|--------|
| 1 | automation/create | Skapa cron-styrd autonom uppgift ($je: title, cronExpr, prompt, model?, mode?, targetTaskId?, enabled, maxRuns?) | → {automation} | ✗ (P0) |
| 2 | automation/update | Uppdatera (t.ex. targetTaskId-bindning) | {…automationfält, targetTaskId} → — | ✗ (P0) |
| 3 | automation/checkTaskBinding | Är uppgiften bunden? | → {bound:bool} | ✗ (P0) |
| 4 | automation/list | Lista automatons (nextRunAt, runCount, lifecycleStatus) | → {automations[]} | ✗ (P0) |
| 5 | automation/delete | Ta bort automation | {automationId} → {deleted} | ✗ (P0) |

### 1.6 interaction/* — server→klient-requests, 6 tjänster utöver handskakningen (kartan §3)

| # | Tjänst | Gör | Svar-form (result) | Status | Var i studion |
|---|--------|-----|--------------------|--------|----------------|
| 1 | interaction/requestPermission | Verktygsgodkännande (riskgraded, options färdiga) | z2: {decision:"allow"\|"deny"\|"escalate"\|"modify", reason?, modifiedInput?, permissionUpdates?} | ✓ | transport `svarPermission()` + 30 s-eskalationsdefault; UI: godkännandedialog MED diff-förhandsvisning (v84 C), POST /api/studio/interaktion |
| 2 | interaction/requestUserInput | Fråga användaren (text/choice/confirm) | {value?} \| {cancelled:true} | ✓ | transport `svarFraga()`; UI: frågekort i chatten |
| 3 | interaction/requestProviderRuntimeHeaders | Provider-relay-headers | {headers} | ✗ (P1 robusthet — obesvarad request kan hänga) | transporten svarar EJ idag (endast MCP-varianten besvaras) |
| 4 | interaction/requestOfficialMcpAuthHeaders | OAuth-headers för officiell MCP | {} = hoppa över | ✓ | transportens autosvar {} (LIVE ×6 i kartan) |
| 5 | interaction/browserList | Lista agentens webbläsarflikar | {sessionId?} → {browsers[]} | ✗ (P0) | — |
| 6 | interaction/browserExecute | Kör kommando i webbläsaren | {browserId, browserGeneration, command, sessionId?} → _Z | ✗ (P0) | — |

### 1.7 Notiskanaler — 6 st (kartan §4)

| # | Kanal | Gör | Status | Var i studion |
|---|-------|-----|--------|----------------|
| 1 | session/event (24 eventtyper) | Helhet: turner, delar, streaming, verktyg, permission… | ✓ (live-konsumtion av ~8 typer: turn.started/completed, tool.updated, model.streaming, part.delta + tool.*/model.response.completed-legacy; permission/userInput hanteras på server-request-vägen i stället; titleUpdated/steer*/checkpoint/rewind/streamRecovery/message-part-upsert konsumeras ej — historik hämtas via session/messages efter turn) | transport `påNotis()`-switch (rad ~4042); UI: verktygskort, streaming, rundstatistik (v83 B1) |
| 2 | state.updated | Revision/patch (status, activeToolCalls, backgroundJobs-räknare) | ✓ | transport status-mappning (rad ~4131); UI: statusraden |
| 3 | computer-use/operation-event | Computer-use-operationer | ✗ (P2, se §5 — kanalen finns ej i deploymenten) | — |
| 4 | process/mcpTelemetry | MCP-processtelemetri | ✗ (P2) | — |
| 5 | v4/telemetry/event | Detaljerad telemetri (kommer ÄVEN i legacy-läge) | ✗ (P2) | — |
| 6 | v4/conversation/frame (server-push) | Ops row.appended/upserted/removed/delta/state.updated | ~ | mottas; op "state.updated" spåras för v4-revision (v85 F4); rader hämtas via rowsRange i stället för att renderas ur frame-op |

### 1.8 v4-grenen — 21 klientmetoder (kartan §4F)

| # | Tjänst | Gör | Status | Var i studion |
|---|--------|-----|--------|----------------|
| 1 | v4/connection/flow | Flödeskontroll (saturated/drained/closed) — INTE handskakning | ✗ (P2) | — (dokumenterad i transportens header v85 F4) |
| 2 | v4/controller/subscribe | Prenumerera styrenhet | ✗ (P2) | — |
| 3 | v4/controller/resync | Synka om styrenhet | ✗ (P2) | — |
| 4 | v4/controller/unsubscribe | Avsluta prenumeration | ✗ (P2) | — |
| 5 | v4/conversation/subscribe | Prenumerera samtalsrader (kräver persistent session) | ✓ | transport v4-kedjan (v85 F4, LIVE-bevisad) |
| 6 | v4/conversation/resync | Synka om konversation | ✗ (P2) | — |
| 7 | v4/conversation/unsubscribe | Avsluta samtalsprenumeration | ✗ (P2) | — |
| 8 | v4/conversation/rowsRange | Samtalsrader (turnHeader-target) | ✓ | transport `lasFilandringar()` steg 4 |
| 9 | v4/conversation/plans | Plandata (plan-lägets struktur) | ✗ (P2) | — |
| 10 | v4/conversation/fileChanges | Filändringar MED unified-patches/radnummer | ✓ (PRIMÄR med Write/Edit-fallback) | transport `lasFilandringar()`; UI: Ändringspanel + F5 inline-kodvy |
| 11 | v4/conversation/fileRewindPreview | Förhandsvisning före fil-rewind | ✗ (P1) | — |
| 12 | v4/usage/stats | Förbrukning (v4-form) | ✗ (P2) | — |
| 13 | v4/conversation/usage | Förbrukning per konversation | ✗ (P2) | — |
| 14 | v4/attachment/begin | Påbörja bilagauppladdning | ✗ (P0) | — |
| 15 | v4/attachment/chunk | Strömma bilagebyten | ✗ (P0) | — |
| 16 | v4/attachment/commit | Slutför bilaga | ✗ (P0) | — |
| 17 | v4/attachment/abort | Avbryt bilaga | ✗ (P0) | — |
| 18 | v4/attachment/read | Läs bilaga | ✗ (P0) | — |
| 19 | v4/attachment/previewSource | Förhandsgranska bilagkälla | ✗ (P0) | — |
| 20 | v4/command | Kör kommando (v4-väg) | ✗ (P2) | — |
| 21 | v4/commands/query | Fråga kommandon | ✗ (P2) | — |

**Kartan §4G (övriga strängar: todo.read/write, task.upserted, compact.\*,
hook.run.failed, agent.message.send m.fl.)** = interna/telemetri-strängar utan
wire-garanti enligt kartans egen not — räknas INTE som tjänster här. Fakta §6.1
bekräftad i kod: ingen task/*- eller memory/*-domän finns; "minne" i studion
är filesystem-läsning av ~/.zcode/cli/memories (se §3).

---

## 2. PARAMETARNIVÅ-GAP PÅ IMPLEMENTERADE METODER (fynd ur kodläsning)

Följande protokollfält finns i kartan men används EJ av transporten (grep:
förekommer bara i kommentarer eller inte alls):

- **session/send**: `attachments`, `browserAmbientContext`, `automationId`,
  `offPeakTaskId`/`offPeakRunType`, `expectedRevision` (optimistisk
  låsning), `botDeliveryTarget` — transporten skickar {sessionId, content}
  ENDAST (studio-transport.ts rad ~4273).
- **session/create**: `importedHistory` (claudeCode-import), `mcpServers`,
  `toolAllowlist`/`toolDenylist`, `titleGenerationEnabled`, `parentSessionId`
  — create anropas med workspace/model/mode/thoughtLevel/persistence endast.
- **session/compact**: `expectedRevision` saknas i anropet.
- **session/setMode**: UI/typning bär "build"|"plan" — protokollets
  edit/yolo/auto går ej att välja.

## 3. STUDIO-STÖDTJÄNSTER (icke-protokoll — komplett lägesbild)

Byggda och levande (stödjer ovan): `/api/studio/session` (GET + 15 POST-actions
inkl. malSatt/malPausa/subagenter/avbrytTask/arbetsyta/läge/tankestyrka),
`/api/studio/stream` (SSE + historik + H1-återkoppling), `/modeller`,
`/interaktion`, `/fardigheter`, `/minne` (memories-filer: lista/läs/skriv/
radera med backup — EJ protokoll, fs-väg), `/filer` (filträd + bildserving +
nedladdning + tömning), `/uppladdning` (multipart, 30 MB-tak, 7 d rensning),
`/andringar` (GET senaste turnens ±N), `/anvandning`, `/halsa` (v90 K1),
`/mal/stream` (mål-SSE). Kommandon: /help /ny /modell /komprimera /filer
/fardigheter /sparad (kommandon.ts).

**Pågående våg 91 (annat block — SAKNAS i kodbasen vid detta
granskningstillfälle):** `/api/studio/tjanster/*` (A1d: bakgrundsjobb,
webbläsare, automation, generateText-bryggor), `/api/studio/mal/status` (A1b),
`/api/studio/styrelse` (A2). OBS: `src/app/api/styrelse/*` (agendas/autonom/
beslut/djup/kommunikation) är det ÄLDRE AI-organ-API:et — skilt från A2:s
studio-styrelsemotor.

---

## 4. GAP-RANKNING — saknade tjänster med implementeringsskiss (våg 92+)

### P0 — kundvärde direkt (bilder, bakgrundsjobb, webbläsare, automation)

**P0-1. BILDER I PROTOKOLLET — v4/attachment/{begin,chunk,commit,abort,read,
previewSource} (6 st) + session/send.attachments.**
Transport: `skickaBilaga(sokvag)`: läs fil → begin → chunk-a (bas64, t.ex.
512 kB) → commit → attachmentId; `skicka()` utökas med attachments[] när
dylikt id finns (A1d:s fs-fallback-sökvägsreferens blir reserv).
Endpoint: POST /api/studio/tjanster/bilaga {sokvag} → {attachmentId};
UI: composerens 📎-knapp + drag/paste går först protokollvägen, miniatyrer
visar källa "protokoll|fs" (same thumbnail-rendering som today).

**P0-2. WEBBLÄSARE — interaction/browserList + browserExecute (+ send.
browserAmbientContext {tabCount,currentUrl}).**
Transport: hantera de bägge server-requesterna i serverRequestHanteraren
(svara mot en intern kö) + egna anrop för list/exec; browserGeneration-cache.
Endpoint: GET /api/studio/tjanster/webblasare (list), POST …/webblasare/
kör {browserId, command}; UI: "Webbläsare"-drawer i höger panelen (fliklist,
kommandofält, resultattruncat) — dold om 501 (A3c-kontraktet).

**P0-3. AUTOMATION — automation/{create,update,checkTaskBinding,list,delete} (5 st).**
Transport: `lasAutomationer()`, `skapaAutomation({title,cronExpr,prompt,
model?,mode?})`, `uppdateraAutomation`, `raderaAutomation` — raka
protokollFraga-bryggor; kräver LEVANDE klient men egen session (samma mönster
som lasSkills).
Endpoint: GET/POST/PATCH/DELETE /api/studio/tjanster/automation;
UI: "Automation"-drawer: lista (nextRunAt, runCount, lifecycleStatus),
skapa-formulär med cron-förklaring, enable/disable-toggle, ta bort.

**P0-4. BAKGRUNDSJOBB-FULLVY — projection.backgroundJobs (Tkn-listan:
taskId, command, pid, status, outputTail, cancellable…).**
Transport: `lasBakgrundsjobb()` ur session/read-projektionen (fältet finns
redan i patch-hanteraren som räknare rad ~4156) + poll vid tool.updated
progress; avbryt via befintlig cancelBackgroundTask.
Endpoint: GET /api/studio/tjanster/bakgrundsjobb {sessionId?};
UI: "Bakgrundsjobb"-drawer: kort per jobb (PID/kommando/outputTail/
stderrTail), avbryt-knapp, fästa i höger panelens terminal-vy.

**P0-5. AUTONOMI-KOPLING — session/send {automationId ⊕ offPeakTaskId,
offPeakRunType} (param-gap på implementerad metod).**
Transport: `skicka(prompt, {automationId?, offPeak?})` — mutual-exclusive-
validering enligt kartan §1; kopplas till P0-3:s execution-spår.
Endpoint: POST /api/studio/stream {prompt, automationId?};
UI: automatons körningar syns i sessionslistan (badge "auto"), A1b-status
visar vilken automation som äger pågående turn.

### P1 — kraft (hooks/trust, generateText, events-replay m.m.)

**P1-1. workspace/generateText + cancelGenerateText.** Transport:
`genereraText({prompt|messages, modelRef, tools?, maxOutputTokens?})` med
operationId + `avbrytGenerering(operationId)`; Endpoint: POST /api/studio/
tjanster/textgen (+ DELETE ?operationId); UI: styrelsemotorn A2 anropar
intern väg; panel "Snartext" för engångssammanfattningar utan session.

**P1-2. workspace/hooks/trustGrant.** Transport: `litaHooks(bundleDigest,
hookDeclarationDigest)` — digesterna måste hämtas ur aktuellt fel/diagnostik;
Endpoint: POST /api/studio/tjanster/hooks-trust; UI: godkännandekort i
interaktionsflödet ("Förtroende för workspace-hooks: [digest-förkort]")
med reasonCode-mappning till svenska förklaringar.

**P1-3. session/events (replay).** Transport: `lasEvents(afterSeq, limit)` —
kompletterar messages vid reconnect (H1-förbättring: exakta tool.updated/
streaming-händelser från frånvaron, inte bara färdiga delar); Endpoint: GET
/api/studio/session?action=events&afterSeq=; UI: återkopplingens
"frånvaro-banner" bygger på events i stället för enbart historik-rader.

**P1-4. plugins/setEnabled + install + uninstall.** Transport:
`sattPluginAktig(pluginId, enabled, scope)`, `installeraPlugin`,
`avinstalleraPlugin` (driftsvar kommer som operation/snapshot); Endpoint:
POST /api/studio/tjanster/plugins {action}; UI: Färdigheter-panelens plugin-
kort får på/av-switch + installera-knapp (v85 F2:s lösta löfte).

**P1-5. interaction/requestProviderRuntimeHeaders — svara (robusthet).**
Transport: autosvar {} (samma mönster som MCP-varianten) tills äkta headers
finns; Endpoint: ingen (transport-intern); UI: ingen — hindrar 15 s-häng
när servern frågar.

**P1-6. session/setModel på levande session + mode edit/yolo/auto.**
Transport: `bytModellLevande(model)` (behåll sessionId+historik) + bredda
`sattLage`-typningen; Endpoint: POST /api/studio/modeller {levande:true};
UI: Inställningar-drawern: "byt utan att tappa historiken"-läge + lägesval
edit/yolo/auto med varningstext för yolo.

**P1-7. v4/conversation/fileRewindPreview.** Transport: `forhandsvisningRewind
(target)` före fork; Endpoint: ingår i /api/studio/session action=rewind som
?option=preview; UI: "⟲ Gå tillbaka hit"-dialogen visar ±diff-förhands-
granskningen INNAN fork (natural par till v84 C:s permission-diff).

### P2 — sen (telemetri, inställningar, övrigt)

- **Workspace-inställningar (8 st):** setDefaultModel/setDefaultThoughtLevel/
  setDefaultMode/updateProviderRegistry/upsertModelProvider/removeModelProvider/
  updateInteractionPreferences/updateModelIoPreferences. Skiss: transport-
  bryggor + POST /api/studio/tjanster/installningar; UI: "Standardvärden"-
  sektion i Inställningar-drawern (gäller NEXT session; create bär redan
  valen).
- **Plugins-drift övrigt (13 st):** marketplace/add|remove|update, update,
  restoreBuiltin, configure, resetConfig, validate, describe, cancelOperation,
  resolveSuggestedReference, overview, referenceCatalog. Skiss: en gemensam
  POST /api/studio/tjanster/plugins {action} dispatch + "Marknadsplatser"-
  flik i Färdigheter (overview-källa), cancelOperation kopplas till en
  global avbryt-knapp.
- **v4-övrigt (14 st):** command, commands/query, plans, usage/stats,
  conversation/usage, controller/subscribe|resync|unsubscribe, connection/
  flow, conversation/resync|unsubscribe, attachment/read (läs-sidan av P0-1).
  Skiss: när v4-grenen gått i produktion stabilt: v4/command-brygga till
  kommandon.ts (server-side validering), plans → plan-lägets trädvy i höger
  panelen.
- **Telemetrikanaler (3 st):** computer-use/operation-event, process/
  mcpTelemetry, v4/telemetry/event. Skiss: påNotis-loggning + GET /api/
  studio/halsa?telemetry=1 (sista N händelser) — observability-utökning av
  v90 K1; ingen egen UI nödvändig (diagnostik-yta).
- **session/updateRuntimeModelConfig:** skiss: ersättningsväg när provider-
  revision ändrats (kopplas till P2-providerregistret ovan).

---

## 5. TJÄNSTER SOM INTE (fullt) KAN BYGGAS — ärlig lista med orsak

1. **plugins/marketplace/add för autentiserade källor + OAuth-MCP-servrar**
   (t.ex. anslutning av gmail/slack-MCP:er via ZCode-konto): kräver ZCode-
   relay-autentisering — autentiseringsheadrarna produceras av Z:s konto-
   upplevelse (requestProviderRuntimeHeaders/requestOfficialMcpAuthHeaders
   bär äkta tokens). Studion svarar {} = "hoppa över" ( rätt default):
   publika källor (zcode-plugins-official) fungerar, auth-krävande kan EJ
   aktiveras härifrån.
2. **workspace/upsertModelProvider för icke-zai-providers**: protokollvägen
   finns men relayer utan API-nycklar är oanvändbara; nycklar ägs av ZCode-
   kontot/leverantören. zai är förkonfigurerat på servern (5 GLM-modeller) —
   därav fungerar modellbytandet. Att lägga tredjepartsproviders kräver
   kundägda nycklar + säker hantering = styrelsebeslut (R2: API-nycklar =
   existentiellt, VÄNTAR KUND).
3. **computer-use/operation-event**: kräver computer-use-backend aktiv i
   ZCode-klienten (fjärrstyrningssession). I app-server-läge på Contabo
   finns ingen sådan session — kanalen förblir tyst oavsett vad studion
   lyssnar efter. Kan bara passivt loggas om den dyker upp.
4. **Kostnad i valuta (SEK/USD) ur usage-stats**: protokollet ger tokens/
   räknare, ALDRIG priser. En kostnadsrad = egen pristabell i studion
   (uppskattning, tydligt märkt) — byggbar approximativt, inte protokoll-
   sanning.
5. **importedHistory (claudeCode-import)**: metoden är byggbar men kräver
   exportfiler från kundens claudeCode-installation — datan ägs utanför
   systemet; en engångsimportväg, inte en tjänst studion kan självständigt
   fylla.
6. **Off-peak-schemaläggning på ZCode Cloud**: automation/körning sker i
   app-server-processen på Contabo (fungerar lokalt där barnet lever), men
   molnside-funktioner (t.ex. nextRunAt-beräkning om servern sover, ev.
   Z-kontobundna off-peak-kvoter) kan avvika — hanteras med ärlig status-
   visning i P0-3 snarare än löftestext.

---

## EXECUTIVE SUMMARY

**MÅTTBAT (skript tool-results/v91-paritetskontroll.mjs + kodläsning):**
- **Tjänster totalt: 91** (85 wire-metoder ur v83-kartan + 6 notiskanaler).
- **IMPLEMENTERADE: 31 (34 %)** — session-kärnan (create/resume/list/read/
  messages/subscribe/send/stop/fork/compact/goal/close/subagents/usage/
  setThoughtLevel/cancelBackgroundTask + handskakningen), readState,
  skills/plugins/mcp-listor, usage/stats, permission+fråga+MCP-auth-svar,
  session/event + state.updated-kanalerna, samt v4-trion subscribe/rowsRange/
  fileChanges.
- **DELVIS: 3** (setModel = create-väg, setMode = endast build/plan,
  v4-frame = mottagen men rader hämtas via rowsRange).
- **SAKNAS: 57 (63 %)** — tyngst: hela automation-domänen (5), hela
  v4-attachmentgrenen (6), webbläsarparet (2), generateText-paret (2),
  hooks/trustGrant, plugins-drift (16 av 17), workspace-inställningar (11 av
  12), v4-styre/telemetri (14) + 3 param-gap-kanaler.

**DE 5 HÖGSTA P0-ÅTGÄRDERNA (våg 92-underlag):**
1. **Bilder i protokollet** — v4/attachment/* ×6 + send.attachments (kundens
   "visa dig bilder": sanna bilagor, inte bara fs-sökvägsreferens).
2. **Webbläsare** — interaction/browserList + browserExecute + send.
   browserAmbientContext (kundens "allt möjligt": agentens webbläsarsession
   synlig/styrbar från studion).
3. **Automation** — automation/* ×5 (kundens "gör jobbet helt autonomt":
   schemalagda cron-uppgifter utan närvaro, nextRunAt/runCount synligt).
4. **Bakgrundsjobb-fullvy** — projection.backgroundJobs Tkn-lista (PID/
   kommando/outputTail + avbryt — avbryt-metoden finns redan, listan är bara
   en räknare idag).
5. **Autonomi-koppling** — send {automationId ⊕ offPeakTaskId} + offPeak-
   RunType (automationernas turner märks och spåras i sessionlistan).

**Insikt för våg 92:** studion är stark på SAMTALS-kärnan (chatt, strömning,
verktyg, mål-loop, persistens — 100 % av de LIVE-bevisade kärnmetoderna) men
har inte rört SYSTEM-familjerna (automation, attachments, browser, plugins-
drift, workspace-inställningar). Samtliga P0-gap har färdig protokollform i
v83-kartan (parametrar + svar dokumenterade) och färdiga byggmönster i
kodbasen (lasSkills-mönstret för lästjänster, interaktionshanteraren för
server-requests) — ingen våg-92-byggare behöver göra ny protokollforskning
för P0/P1; endast attachment-chunking och browserExecute-svaret (_Z-formen)
behöver live-sonder för exakta fält.

— Granskningsagent A4, våg 91, 2026-09-09. READ-ONLY mot src/ har respekterats;
enda skrivningar: denna fil + tool-results/v91-paritetskontroll.mjs.
