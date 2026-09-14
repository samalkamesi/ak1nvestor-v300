# M5 — Fork-mekaniken (session_fork + fork_start_failure)

> Fabriksuppdrag m5 i SKAPAREN-DJUPET-manifestet (skaparen-motorerna).
> Källa: officiell runtime `vendor/zcode.cjs` (zcode-app-cli 3.11.2-22,
> 12,6 MB bundle) — minifierade namn bevarade för återhittning.
> Systerdokument: M1 (målmotorn), M2 (komprimering), M3 (felytan),
> R6 (preflight/−32010). 'session_fork' (16) i uppdragstexten = timeline-
> typen i M1:s schema (index i manifestförfattarens lista); EVENT-typen
> heter `session_forked` (enum V).

## TL;DR

1. **Fork kopierar MEDDELANDEN, inte turns eller events.** Varje meddelande
   + del får FRESHA ID:er via en identitetskarta (messageIdMap, turnIdMap,
   productTurnIdMap, targetIdMap, toolCallIdMap …), alla interna referenser
   skrivas om, och varje kopia stämplas `metadata.forkOrigin =
   {sessionId, messageId}` (ursprunget spåras ALLTID). Eventhistoriken
   (TurnStarted osv.) kopieras ALDRID — barnet börjar med tom eventkedja.
2. **Filerna följer med — via checkpoints.** Fork på ett meddelande läser
   alla checkpoints EFTER fork-punkten (per filmuterande verktygskedja:
   `{path, beforeContent, existedBefore, afterContent, structuredPatch}`),
   tar tidigaste läge per fil och skriver tillbaka `beforeContent` (eller
   RADERAR filen om den inte fanns). Fork på checkpoint återställer den
   checkpointens snapshot direkt. Finns inga efterföljande checkpoints →
   ren konversationsfork (inga filer rörs).
3. **Revision = två olika saker**: (a) RPC-parametern `expectedRevision`
   = optimistisk samtidighet på app-serverns sessionspost — mismatch ⇒
   **−32009**; (b) `revisionAtDecision` i v4-flödet = bevisning i
   commandFact för exakt-en-gång. Barnet får en FRESH stateRevision.
4. **Atomicitet + idempotens**: den moderna vägen (`commitAtomicConversationFork`
   = j_t) commitar ALLT (barnsession, meddelanden, delar, mål+verifieringar,
   modellval, kö-initialInput, kvitto) i EN SQLite-transaktion. Nyckeln
   `v4_command_fact:child:<förälder>:<sourceCommandId>` gör omstarten
   idempotent — samma kommando returnerar SAMMA barn.
5. **fork_start_failure** = NÄR barnet inte kan STARTA efter att forken
   redan commitats hållbart: posten `v4/fork_start_failure:<commandId>` +
   TurnError i barnet (`turnPhase:"fork_child_start"`,
   `fault.command.childStartFailed`, **retryable:!0**). Forskningen
   rullas ALDRIG tillbaka — barnet finns i databasen och återfuktas.
6. **Studions rewind-knappar behöver INTE bytas** — de kör REDAN äkta
   `session/fork` (våg 86 G5: `{kind:"turn", turnIndex}`). Förbättringar
   som M5 möjliggör: expectedRevision, visa restoredFileCount, rendera
   fork-separatoren, samt återhämtning när registreringen misslyckats
   men barnet ändå lever i databasen (se §9).

---

## 1. Fem ytor in i samma motor

| Yta | Ingång | Väg i bunten |
|-----|--------|--------------|
| **RPC `session/fork`** (appen/studion) | `{sessionId, target, expectedRevision?}` | `Qpn` → `app.forkFromCheckpoint` → runtime `forkWorkspaceFromCheckpoint` (NVr) → `registerForkedSession` (Nwt) |
| **TUI `/fork [checkpointId]`** | turn-kommando action "fork" | `cVr` (executeRewindCommand) → NVr |
| **TUI `/rewind …`** | status \| fork \| apply\<checkpointId\> \| message \<scope\> \<msgId\> \| cascade … | `cVr` → rewind-familjen (hVr/gVr/vVr/_Vr/pVr) |
| **v4-kommandon** (command executor) | forkStableConversation / forkConversationBeforeInput / createSelectionSideSession | `y.app.runtime.forkStableConversationAtMessage` (TVr) / `CVr` / `SVr` → j_t + `D1t` |
| **Selection side chat** | "prata om urval utan att påverka tråden" | `SVr` → j_t med kind `selection_side_chat` |

RPC-target (schema `DEt`, discriminated union): `{kind:"turn", turnIndex}`
(löses till turnens sista assistant-meddelande via `e8i`; ogiltigt ⇒ −32004),
`{kind:"message", messageId}`, `{kind:"checkpoint", checkpointId}`,
`{kind:"latestCheckpoint"}` (**default** — vagnretur = forka vid senaste
checkpoint). Svar (gKi): `{forkedSessionId, parentSessionId, targetMessageId?,
targetCheckpointId?, response, snapshot}`.

**Meddelanderedigering = fork**: v4-kommandot `forkConversationBeforeInput`
validerar att målet är ett USER-meddelande (`guard.latestQueryEditOnly`),
forkar historiken FÖRE det meddelandet (`EVr`: slice EXKLUDERAR målet) och
lägger den redigerade texten som barnets `initialInput` (köad input som
promotas när barnet börjar köra). Så implementeras "ändra en skickad fråga".

## 2. Vad kopieras exakt? (konversationsdelen)

**Källan = synlig historik efter revert**: `m5` (forkSourceMessagesForSession)
läser alla meddelanden och tillämpar sessionens `revert`-fält
(`branchCutAfterMessageID`, `createdMessageID`, `keptMessageIDs`,
`targetMessageID`) — en på plats rewind:ad konversation ger alltså en
fork av det NU SYNLIGA läget, inte det historiska.

**Slicingen (tre medvetenheter):**
- `Zie` (resolveForkHistoryEndIndex): är målet ett assistant-meddelande
  utökas slutet till ALLA på varandra följande assistant-meddelanden med
  samma parentID — parallellsvar inom ETT user-turn kopieras som block.
- `Kie` (buildForkHistoryMessages): är målet en komprimeringsgräns
  (del av typ compaction) letas det ursprungliga RIKTIGA user-meddelandet
  fram (`zmi`/`Fmi`: ej syntetiskt, ej model-only, ej summary) och
  prependeras — kunden tappar aldrig frågan bakom komprimeringen.
- `EVr` (fork-before-input): målet MÅSTE vara user; slice(0, index)
  exkluderar det — barnet börjar före frågan som ska ersättas.

**Stable-target-valideringen** (`Dmi`): ankaret `{orderedMessageIds,
boundaryMessageId}` måste vara icke-tomt, unikt, kontiguellt ("Stable fork
target is not a contiguous active transcript segment") och sluta på ett
**färdigt assistant-meddelande utan fel** ("Stable fork boundary is not a
completed assistant message").

**Själva kopieringen — två vägar:**
- **Ärvd/vägvisarväg** (`OVr` copySessionMessagesForFork, använd av RPC- och
  checkpoint-forkarna): nytt ID per meddelande, `messageIdMap` (gammal→ny)
  skickas till `kEe`/`SEe` som skriver om parentID/ankare; ett meddelande
  i taget persisteras (EJ atomärt).
- **Atomär väg** (`j_t` commitAtomicConversationFork): `Tmi`
  (createForkIdentityMap) bygger KARTOR för alla identiteter (messageIds,
  partIds, turnIds, productTurnIds, targetIds, verificationIds,
  toolCallIds, verifierEntryIds); `kEe`/`SEe` körs med
  `strictLocalReferences:!0` — en assistant-parent eller ett ankare utanför
  kopian kastar ("Fork assistant parent is outside child transcript") i
  stället för att lämnas hängande.

`kEe`-regler i detalj: user-meddelanden behåller sitt innehåll men får nytt
ID/sessionID + forkOrigin-stämpel; assistant-meddelanden får parentID
omskrivet via kartan; ankaren skrivs om (turnId → turnIdMap,
productTurnId → productTurnIdMap); mål-ankare (`goalBoundary.kind==="snapshot"`)
får nytt targetID, **activeInputId:null, activeRunStartedAtMs:null,
activeRunLastSeenAtMs:null** — en fork ÄRVER ALDRIG en pågående målkörning.

## 3. Barnsessionen (kVr buildForkedSessionInput)

`{id: nytt, projectID: samma, workspaceID: samma, parentID: förälderns
sessionId, traceID: förälderns rootTraceContext.traceId (spårnings-
kontinuitet!), taskType: "fork"|"selection_side_chat", slug:
"<förälderslug>-<kind>-<base36-tid>" (≤120 tecken), title: "Fork of
<föräldertitel>" | "Selection side chat", titleSource: "generated",
version/permission/dirigeringsfält: samma som föräldern}`.

Vid registreringen (Nwt): barnet öppnas med kind "inherit", mode/modell/
tankestyrka från FÖRÄLDERNS NUVARANDE inställningar (setMode/setModel/
setThoughtLevel om de skiljer), followupMode ärvs om ≠ "queue", MÅLET
klonas (`$Li` → `cloneTargetForFork`) OM barnet inte redan har ett,
slutligen `app.resume()`. Den atomära vägen persisterar istället ett
modellval direkt i bunten (`kmi`: session-post `:runtime-model-selection`
med modelId/providerId/variant) och v4-flödet väljer modell från
GRÄNSMEDDELANDET (den som var i bruk VID fork-punkten), inte förälderns
nuvarande.

**Målets status vid kloning** (Bmi deriveForkedGoalStatusFromCopiedVerifications):
senaste kopierade verifiering completed+passed ⇒ "complete"; förälder var
"complete" utan ny passad verifiering ⇒ **"active"** (målet måste
verifieras OM i barnet); annars oförändrad. Verifieringsposter klonas med
omskrivna ankare (anchorAssistantMessageId mappas; anchorTurnId bevaras
som `originAnchorTurnId`).

## 4. Filerna: checkpoint-mekaniken

- **Checkpoint skapas vid VARJE filmuterande verktygsresultat**
  (emit vid writeToolResultArtifact): artifact
  `application/vnd.zcode.workspace-checkpoint+json`,
  `{kind:"workspace_file_before_change", files:[{path, beforeContent
  (null ⇒ fanns ej), existedBefore, afterContent, afterContentLength,
  structuredPatch}], toolCallId, toolName, createdAt, version:1}`;
  event `CheckpointCreated {checkpointId:"checkpoint_<uuid>", messageId,
  targetMessageId, toolMessageId, scope:"workspace", snapshotRef, diffRef,
  fileCount:1}`. En checkpoint = EN filförändring (fileCount 1).
- **Fork vid meddelande (RVr forkWorkspaceAtMessage — studions väg)**:
  samla checkpoints som täcker meddelanden EFTER fork-punkten men inte
  före (`JR`/`asi`: checkpoint matchar på messageId/targetMessageId/
  toolMessageId). **Inga** ⇒ ren konversationsfork (`IVr`). Annars läs
  deras snapshots, slå ihop per path där **tidigaste** post-fork-checkpoint
  vinner (= filens läge VID fork-punkten), och `F_t`
  (restoreWorkspaceCheckpointFiles): `!existedBefore || beforeContent===null`
  → **RADERA filen** (missingOk), annars skriv tillbaka `beforeContent`
  atomärt. Resultat: `[{action:"delete"|"restore", path}]`.
- **Fork vid checkpoint (NVr)**: läs DEN checkpointens snapshot och kör
  samma F_t. Kontroll: "Checkpoint not found" ⇒ InvalidStateTransition
  (recoverable); "Fork requires session, artifact, and file-system
  adapters" ⇒ ConfigurationError.

## 5. Atomicitet, idempotens och kvitton (SQLite)

`commitForkBundle` (SqliteSessionStore): identitetskontroller
(child.parentID === fact.parentSessionId; initialInput.sessionID ===
child.id; ack.commandId === sourceCommandId), sedan `begin immediate` →
barnsession → meddelanden+delar → mål → poster (verifieringar,
modellval) → initialInput → **commandFact sist** → commit (rollback på
fel). Fact-nyckeln `v4_command_fact:child:<parentSessionId>:
<sourceCommandId>` — finns den redan returneras BEFINTLIGT barn
(exakt-en-gång; "Fork child session is missing" om korrupt). Felsprut-
punkter (`forkCommitFaultAt` afterChild/afterMessages/…/beforeCommit)
är TEST-krokar. `createForkedSessionWithMetadata` = tidig metadata-
registrering under samma nyckel. Kvittoformat:
`{ack:{commandId, status:"accepted", revisionAtDecision,
result:{type:"forkAssistant"|"createSelectionSideSession", sessionId}},
metadata:{forkOrigin:{parentSessionId, targetMessageId}, forkTarget}}`.

Förälderns `SessionForked`-event (`"session_forked"`) appendas FÖRST
EFTER hållbar commit — misslyckas appenden loggas bara
"session.fork.parent_event.failed_after_commit" (hållbarhet > events).
Payload: `{originalSessionId, forkedSessionId, forkPoint (antal kopierade
meddelanden), targetMessageId, targetCheckpointId?, restoredSnapshotRef?,
restoredFileCount, strategy:"fork_required"}`.

## 6. Barnets synliga spår

- **Separator-timeline-del** i barnet: `timelineType:"session_fork"`,
  `display:"separator"`, anchorMessageId/anchorTurnId, parentSessionId,
  targetMessageId, targetCheckpointId?, restoredFileCount, partID
  `fork_<parent>_<msg>_timeline`. Serialiseras till klienten med just
  parentSessionId/targetMessageId/targetCheckpointId/restoredFileCount.
- **Syntetisk user-notis** (source "fork") med människotext
  (`vjr`/`xjr`/`Dht`): t.ex. "Forked session X from checkpoint C: copied
  N messages and restored M files." + metadata.forkContext.
- **v4Gateway.onSessionForked**: föräldern renderar INGET (tom patch när
  originalSessionId === snapshot.sessionId); markören `forkNotice`
  (lane turnTailBoundary) sätts bara i vyer där eventet inte är "eget".
- Selection side chat-passerar dessutom en gränstext till modellen:
  "The preceding conversation was inherited from the parent task for
  reference only. Do not continue the parent's active work automatically;
  answer only new questions… Modify the workspace only when the user
  explicitly asks…" (Rmi).

## 7. fork_start_failure (vhn) — när barnet inte startar

Kedjan: v4-kommandot kör `D1t(server, förälder, forkResult, {commandId,…})`
→ register-funktionen (default Nwt). KASTAR den (inpackning i minnet,
mode/modell, målär, resume) efter att forken REDAN commitats i databasen:

1. `settleSessionInput` → status "failed", reason `fault.command.childStartFailed`
2. `saveSessionEntry` id `v4_fork_start_failure:<commandId>` typ
   `v4/fork_start_failure`, data `{commandId, forkedSessionId,
   parentSessionId, registrationRequired:!0, retryable:!0, status:"failed",
   reasonCode:"fault.command.childStartFailed", message}`
3. TurnError-event I BARNET: `turnPhase:"fork_child_start"`, error
   `{type:"fault.command.childStartFailed", retryable:!0}`
4. Logg: "fork child registration failed after durable commit".

Ingen radering sker — återhämtning = ny registrering/öppning av barnet
(commandFact pekar ut det). OBS: **RPC-vägen (Qpn) anropar Nwt DIREKT**
— ett registreringsfel propagerar som fel till klienten UTAN
fork_start_failure-post; det hållbara barnet kan ändå finnas i
session/list (viktigt för studion, se §9).

## 8. Rewind-familjen (för avgränsning mot fork)

`/rewind` är en EGEN TUR (beginActiveTurn "rewind", TurnStarted →
TurnComplete). Scope (`Pn`): conversation | workspace | both (alias:
message→conversation, code→workspace). Strategier (`ea`): active_chain |
file_only | fork_required | unavailable. Meddelande "Message X is covered
by compact for conversation rewind; create a fork to rewind conversation
history" — på-plats-rewind backar ALDRIG bakom en komprimering; då krävs
fork. Rewind på plats skriver `revert`-fälten på sessionen (meddelanden
behålls i databasen, vyn klipps) + `RewindTriggered`-event + syntetisk
notis + `messageHistory.addAttachment("rewind_notice")`. Fork däremot =
NY session, föräldern orörd (utom sitt event).

## 9. STUDIO-BEDÖMNING: ska rewind-knapparna byta?

**Nej — de är redan äkta.** `gaTillbakaHit` (studio-chat.tsx) →
POST /api/studio/session `{action:"rewind", turnIndex}` →
`transport.rewindTillTurn` → **`session/fork {kind:"turn", turnIndex}`**
(live-bevisat v86-g5-forksond) → `oppnaSession(forkedSessionId)` byter
tabben till barnet, föräldern blir kvar i Sessioner. Felvägarna är
bevisade (−32004 "Cannot resolve assistant message for turnIndex=N",
−32010 "Cannot fork while a prompt is running") med svenska kundtexter.

**Förbättringar som M5:s mekanik möjliggör (i prioritetsordning):**
1. **expectedRevision i anropet**: skicka med snapshotens revision —
   undviker −32010/−32009-kapplöpning när server-sparade inställningar
   (våg 93) ändrat stateRevision under knapptryckningen.
2. **Visa filåterställningen**: svaret/barnets separator bär
   `restoredFileCount` — toasten kan säga "…och N filer återställda till
   denna punkt" (kunden idag osäker på huruvida koden spolas tillbaka:
   den GÖR det via RVr, se §4).
3. **Rendera fork-separatoren** i historikvyn (timeline-del session_fork
   ligger i session/messages) — visar var barnets arv börjar.
4. **Misslyckad rewind ⇒ lasSessioner()**: enligt §7 kan ett fel svar
   dölja ett LEVANDE barn i databasen; idag toastas bara felet. Uppdatera
   sessionslistan och föresl "öppna fork" i stället för blind retry.
5. **Mål-kontinuitet**: RPC-vägen klonar förälderns mål till barnet
   (inheritLatestTarget:!0) — badge/panel bör läsas om efter fork så
   målet syns i nya tabben (status kan bli "active" trots "complete"
   i föräldern enligt Bmi).
6. **Stabilare målkarta** (frivillig): turnIndex åldras ur e8i:s vy —
   lagra senaste assistant-meddelandets ID per bubbla vid strömsslut
   och kör `{kind:"message", messageId}` för robusthet på långa trådar.
7. **Ej värt nu**: på-plats `/rewind`-semantik via sendInput (samma
   session) och meddelanderedigering (forkConversationBeforeInput) —
   v4-kommandolager krävs, parkerat tills kunden önskar det.

## 10. Minifierade namn (återhittning)

| Namn | Funktion |
|------|----------|
| Qpn / Nwt / $Li | RPC forkSession / registerForkedSession / inheritForkedSessionTarget |
| XLi / e8i | target-upplösning / turnIndex→assistant-meddelande |
| NVr / RVr / IVr | forkWorkspaceFromCheckpoint / forkWorkspaceAtMessage / forkConversationFromMessage |
| TVr / SVr / CVr / EVr | forkStableConversationAtMessage / createSelectionSideConversation / forkConversationBeforeMessage / conversationHistoryBeforeInput |
| j_t / Tmi / kEe / SEe / ssi | commitAtomicConversationFork / createForkIdentityMap / remappa meddelande / del / ankare |
| kVr / Wie / kmi / wmi / bmi | buildForkedSessionInput / createForkedSession / buildModelSelectionEntry / resolveForkModelRef / modelRefFromMessage |
| m5 / jmi / Zie / Kie / zmi / Fmi / AVr | synlig historik (revert) / resolveForkHistoryEndIndex / buildForkHistoryMessages / findCompactedForkParentUserMessage / isRealVisibleUserMessage / komprimeringsgräns |
| Hie / Nmi / Lmi / Bmi / Smi / Imi / Cmi / Emi | mål- och verifieringskloningen |
| OVr / F_t / oG / JR / asi / mjr / fjr | copySessionMessagesForFork / restoreWorkspaceCheckpointFiles / checkpoint-val / kandidat + artifact-format |
| D1t / vhn | D1t: barnstart-wrapper (default Nwt) / vhn: fork_start_failure-registreraren |
| cVr / hVr / gVr / vVr / _Vr / pVr / mVr / dVr | executeRewindCommand + rewind-familjen / formatRewindStatus |
| ujr / ijr / osi / ajr | parseRewindCommand / parseMessageRewindArgs / rewindScopeFromCommand / parseForkCommandArgs |
| Pn / ea / V / kLi-skala | scope-enum / strategi-enum / event-enum (SessionForked="session_forked") |
| jNt / W4n / K9e / cpe / EK / dUe | forkChildSessionId / child-local-validering / cloneTargetForFork(SQL) / createSession / saveSessionEntry / saveSessionInput |

---
*Skapad av fabriksagent (m5) 2026-09-14. Alla strängar och flöden verifierade
med nod-skript (kontextfönster i vendor/zcode.cjs, offsets bevarade i
/tmp/m5-*.txt under sessionen); studions delar lästa i
src/lib/studio/studio-transport.ts (rewindTillTurn, rad 3882) och
src/components/ak1a/studio-chat.tsx (gaTillbakaHit, rad 5239; knappen rad 8492).*
