# ZCODE-GAP-34-KARTLAGGNING — v4/command fakta-typer (qft-setet)

**Status:** KARTLAGT 2026-09-19 (förstudie våg 188, registerpost 34) · **Ägare:** forskningsagent AK1A
**Registerpost 34** (data/forskning/ZCODE-GAP-REGISTER.md:51): "v4/command fakta-typer qft
(§11.2 — applyFileRewind/forkAssistant/editUserQuery/retryTurn/setAssistantFeedback) ·
Bygger på v4/command_fact-persistens (§5/§11.3) — fakta-lagret först."
**Regel:** inga kodändringar — detta dokument är förstudien; varje väsentligt påstående
bär källhänvisning (fil:rad för dokument/kod, @offset för bundeln).

---

## 0. Sammanfattning (TL;DR)

1. **"qft" är en minifierad variabel i bundeln** — en `Set` med 15
   CAS-kommandotyper som kräver `baseRevision` i envelopen
   (zcode.cjs @10530770). De fem registrets typer är delmängden **Vft**
   (@10531043) som ÄVEN kräver `baseLogEpoch`. Registrets etikett
   "fakta-typer qft" = Vft-mängden; gemensam nämnare: de fem är EXAKT de
   **radmålade** kommandotyperna (`QBi` "rowTargetActionForCommand"
   @12323977 returnerar dem fem — och null för allt annat).
2. **Alla fem payload-scheman är BEVISADE** ur bundelns KLr-karta
   (@10529063–10529314) — se §3. Inga hypotetiska signaturer behövs för
   inskickningssidan.
3. **Fakta-lagret (v4/command_fact)**: acks/kvitton persisteras som
   session-poster via `saveSessionEntry` i app-serverns SQLite-sessionstore,
   id `v4_command_fact:<source>:<commandId>`, typ `"v4/command_fact"`, data
   `{source, ack, metadata?}` (@12446716). Läsning går via
   `v4/commands/query` (inbox) — efter omstart återfuktas inboxen ur fakta
   (@12444933). Studion HAR redan läs-ytan: `lasV4KommandoFakta`
   (studio-transport.ts:5855).
4. **Nyckeldelta mot våg 181–187:** faktatyperna är CAS-kommandon — envelopen
   MÅSTE bära `baseRevision` + `baseLogEpoch` som matchar serverns
   sessionsrevision/epoch, annars avvisas kommandot FÖRE exekvering
   (`proto.missingBaseRevision` / `proto.staleLogEpoch` / `proto.staleRevision`).
   Dagens transport-metoder (våg 175–187) skickar INGEN av fälten — detta är
   den nya byggstenen, se §5.
5. **Semantikfynd (viktigt):** `editUserQuery` i bundel 3.11.2-24 gör
   rewind-på-plats + omskickning av newText (preemptar aktiv tur + pausar
   målet) — INTE fork-före-input så som M5-FORK.md (baseline 3.11.2-22)
   beskrev v4:s "edit". Versionsnyansen dokumenteras i §3.2.

---

## 1. Källor och sökning

| Källa | Vad den bevisar |
|---|---|
| **Bundeln** `/home/ak1a/.npm-global/lib/node_modules/zcode-app-cli/vendor/zcode.cjs` (12 632 872 B, zcode-app-cli 3.11.2-24) | Alla signaturer/offset i §2–4: qft/Vft-mängderna, payload-scheman, CAS-grind, validateRowTarget, exekverings-handlers, fact-persistens/återfuktning |
| **V4-LAGRET.md** (`data/forskning/zcode-kallkod/V4-LAGRET.md`, våg 180/9x) | §5 interna fakta-typer (rad 89–95), §11.1 envelope (rad 208–224), §11.2 typlista (rad 226–244), §11.3 ko-semantik (rad 246–254), §11.5 ack-schema + reasonCode-uppräkning (rad 263–311) |
| **M5-FORK.md** (`data/forskning/zcode-kallkod/M5-FORK.md`, baseline 3.11.2-22) | Fork-mekaniken: `commitForkBundle`, `v4_command_fact:child:*`-idempotens (rad 167–189), fork-kvittoformat (rad 179–183), `fork_start_failure` (rad 210–229), studions befintliga `session/fork`-väg (rad 244–252) |
| **ZCODE-GAP-REGISTER.md** (`data/forskning/`, rad 45–52) | Post 28–34+35–36: mönster och leveransbevis för våg 181–187 |
| **studio-transport.ts** (`src/lib/studio/`) | Befintlig kommandobuss: interface (rad 1720–1860), AppServerTransport-grenar (rad 5883–6174), MockTransport-spegel (rad 8832–9030), v4Revision/v4LogEpoch-spårning (rad 6208–6234) |
| **kommando-rutten** (`src/app/api/studio/tjanster/kommando/route.ts`) | Typgrends-mönstret: 401-härdad POST, 400 endast ogiltig kropp, ack-domslut som 200 (rad 93–300) |

**Sökning som gjordes:** `grep` i `data/forskning/` på "11.5"/"reasonCode"/"CommandInbox"
och på de fem typnamnen → V4-LAGRET.md, M5-FORK.md, R1-PROTOKOLLET.md (rad 183:
`applyFileRewind` i TUI-bryggan); bundeln hittad på den väg V4-LAGRET §11.5 anger
(`/home/ak1a/.npm-global/.../vendor/zcode.cjs`); extraktion med enkelrads-grep
`LC_ALL=C grep -oE '.{0,N}TERM.{0,M}'` (SKAL-KVOTEN: sammansatta kommandon hänger —
en kelogn-`node -e` och en skrivning till /tmp hängde och övergicks; ALL offset
nedan är maskinverifierad ur grep-svar). Källklonen `/home/ak1a/forskning/zcode-cli`
berördes ej (V4-LAGRET rad 5–6: v4 lever bara i bundeln). INGEN källa saknas —
se §7 för vad som förblir overifierat trots källorna.

---

## 2. Vad "fakta-typer" ÄR — qft, Vft och CAS-matematiken

### 2.1 Två mängder, inte en

Ur bundeln (oförminskat innehåll, minifierade namn bevarade):

```js
// @10530770
qft = new Set(["applyFileRewind","forkAssistant","editUserQuery","retryTurn",
  "setAssistantFeedback","sendQueuedNow","editQueueItem","reorderQueueItem",
  "deleteQueueItem","setAutoDrain","switchModelConfig","switchCollaborationMode",
  "setFollowupMode","pauseGoal","resumeGoal"])
// @10531043
Vft = new Set(["applyFileRewind","forkAssistant","editUserQuery","retryTurn",
  "setAssistantFeedback"])
```

- **qft** (15 typer) = kommandon som kräver **`baseRevision`** i envelopen.
  Obs: köoperationerna + setAutoDrain + switchModelConfig + pause/resumeGoal
  (våg 181–183, redan levererade utan CAS-fält!) ligger ÄVEN i qft — se §6
  risk 4.
- **Vft** (5 typer) = registrets "fakta-typer": kräver **både `baseRevision`
  och `baseLogEpoch`**.
- De fem är dessutom exakt **radmålade**: `QBi(e)` "rowTargetActionForCommand"
  (@12323977) returnerar typen oförändrad för de fem, `null` för alla andra —
  därför passerar de `validateRowTarget`-grinden (§2.3).

### 2.2 CAS-grinden — var fakta-typen SKILJER sig från syskonen (våg 181–187)

Tre lager, alla bevisade:

1. **Envelope-validering** (`HCe` "parseCommandEnvelope" @10526761):
   `qft.has(type) && baseRevision===undefined` ELLER
   `Vft.has(type) && baseLogEpoch===undefined` ⇒ Zod-fel
   *"CAS commands require baseRevision and baseLogEpoch"* ⇒ ack
   `{status:"rejected", reasonCode:"proto.invalidPayload", revisionAtDecision:0}`
   (V4-LAGRET.md:223–224, 291–295).
2. **Inbox-avgörande** (`decide` i CommandInbox): `qft.has(type)` utan
   baseRevision ⇒ `rejected proto.missingBaseRevision`;
   `Vft.has(type) && baseLogEpoch !== host.getLogEpoch(sessionId)` ⇒
   `stale proto.staleLogEpoch`; `baseRevision !== host.getRevision(sessionId)`
   ⇒ `stale proto.staleRevision` (samma kontext som @10530770-grepen; se
   V4-LAGRET.md:286–294 för beskrivningen).
3. **Radmåls-validering** (`validateRowActionTarget` i gateway-konstruktorn):
   `QBi(type)` ⇒ null eller sessionId null ⇒ allow; payload saknar `target` ⇒
   `rejected proto.invalidPayload`; sessionens publisher saknas ⇒
   `stale proto.staleTarget`; annars bärs `resolveRowActionTarget(target, action)`
   verdict allow/stale/reject med dess reasonCode (t.ex.
   `guard.actionUnavailable`).

**Tolkning (fakta vs kommandon):** "fakta" i registrets mening är INTE en egen
wire-metod — de fem är vanliga `v4/command`-typer vars **domslut och resultat
persisteras i fakta-lagret** (§4) och vars **mål är en samtalsrad** (rowId+
entityId) snarare än en kö eller ett mål. CAS-fälten gör dem
återuppspelnings-/revisions-säkra: ett kommando som når servern med fel epok är
ett STALE-domslut, aldrig en t.ex. dubbelexekvering på fel läge — detta är
protokollskiktets skydd av fakta-lagrets integritet.

### 2.3 Target-schemat `Ty` (gemensamt för alla fem) — BEVISAT

```js
// @354691
Ty = f.object({ rowId: f.number().int().nonnegative(),
                entityId: f.string().trim().min(1) }).strict()
```

`.strict()` = okända nycklar avvisas. rowId/entityId är SAMMA identifierare
som `v4/conversation/rowsRange` returnerar (V4-LAGRET.md:54 — rader bär
`kind` + `rowId` + `entityId`).

---

## 3. De fem fakta-typerna — signatur, semantik, felvägar

Alla scheman ur KLr-kartan (@10529063–10529314), handlers ur exekverings-
kartorna `afn={forkAssistant:yji, editUserQuery:gji, retryTurn:_ji}` /
`sfn={applyFileRewind:vji}` / `bfn={setAssistantFeedback:zji}`. Felkoder som
saknas här finns uppräknade i V4-LAGRET.md:296–311 (proto/guard/fault).

### 3.1 forkAssistant — {target} (@10529063) — BEVISAT

- **Syfte:** forka konversationen vid en färdig assistant-rad → ny barnsession.
- **Payload:** `{target: Ty}`.
- **Exekvering** (`yji` @12377942): resolveRowActionTarget("forkAssistant")
  → misslyckad ⇒kast `V4ForkTargetGuardError("guard.forkTargetNotStable")`;
  kräver host-kapabiliteter `resolveStableForkTarget` + `forkStableConversation`
  (annars Error "requires host … capability"); anropar
  `forkStableConversation(sessionId, {target, goalBoundary, sourceCommandId:
  commandId, revisionAtDecision: baseRevision ?? 0})`.
- **Guards (ordning, bevisade):** `guard.compactOperationLock` (pågående
  compact-lås) → `guard.forkAssistantOnly` (målraden ej `assistantText`) →
  `guard.forkTargetNotStable` (raden ej `complete`/`actions.canFork`/turnens
  turnHeader ej `completedSuccess`/ej senaste assistant-segment i turnen) →
  `guard.forkTargetAmbiguous` (inget messageId; instabla/okontiguella
  gränser i `ihn` resolveStableForkTarget).
- **Result/kvitto:** `{ack:{commandId, status:"accepted", revisionAtDecision,
  result:{type:"forkAssistant", sessionId}}, metadata:{forkOrigin:
  {parentSessionId, targetMessageId}, forkTarget}}` (M5-FORK.md:179–183).
  Misslyckad barnstart ⇒ `fault.command.childStartFailed` + post
  `v4_fork_start_failure:<commandId>` — barnet FINNS ändå i databasen
  (M5-FORK.md:210–229).
- **Studioläge:** session/fork-vägen LEVER redan via RPC (gap 12; M5-FORK.md
  §9) — v4-typen ger command_fact-idempotens + protokollkanonisk väg.

### 3.2 editUserQuery — {target, newText, attachments?, workspaceMode?} (@10529137) — BEVISAT

- **Syfte:** ändra en redan skickad användarfråga: spola tillbaka
  konversationen till frågan och skicka ny text.
- **Payload:** `{target: Ty, newText: string, attachments?: qB[],
  workspaceMode?: "preserve"|"rewind"}` (default "preserve").
- **Exekvering** (`gji` @12375502), bevisad sekvens:
  1. resolveRowActionTarget("editUserQuery") utan editTarget ⇒kast
     `V4EditTargetNotLatestError` — `guard.latestQueryEditOnly`
     ("…inte sista rundans real user query"); samma kod kastas även när
     målmeddelandets roll ≠ user på store-nivå.
  2. Tom newText+attachments ⇒ `proto.invalidPayload` ("input must not be empty").
  3. **Preempt:** aktiv tur avbryts (`abortMessage:"v4 editUserQuery preempts
     active turn"`) + **målet pausas automatiskt**
     (`goalPausedMutationReason:"edit_user_query_goal_paused"`).
  4. workspaceMode "rewind": `previewWorkspaceFileRewind` först; blockerad ⇒
     `cancelInputCommand` + result `{type:"editUserQuery",
     disposition:"blocked", sessionId, reasonCode, preview}` där reasonCode
     väljs: `guard.workspaceRewindUnsafeFiles` / `workspaceRewindIgnoredFiles`
     / `guard.workspaceRewindUnavailable` / `guard.workspaceRewindApplyConflict`.
     Genomförbar ⇒ `applyWorkspaceFileRewind` med `commitAfterApply`-callback.
  5. Lyckat: `submitConversationRewind` (rewind PÅ PLATS, samma session) +
     `startCanonicalIntent` med newText — d.v.s. INGEN fork i 3.11.2-24.
- **Versionsnot (ärlighet):** M5-FORK.md:65–69 (baseline 3.11.2-22) beskrev
  v4-edit som fork-före-input (`EVr`/forkConversationBeforeInput + barnets
  initialInput). 3.11.2-24:s `gji` gör rewind-på-plats + omskickning. Båda
  läsningarna är källbelagda; implementationen FÖLJER 3.11.2-24 (den körda
  app-servern), M5:noten behålls som historik.
- **editUserQuery/retryTurn är INPUT-kommandon** (`izi`-predikatet: sendText,
  sendGoalCommand, compact, editUserQuery, retryTurn) — de startar kanoniska
  intent och delar leverans-/kö-semantiken (V4-LAGRET.md:337–374).

### 3.3 retryTurn — {target} (@10529282) — BEVISAT

- **Syfte:** kör om sista assistant-svaret (samma fråga igen).
- **Payload:** `{target: Ty}`.
- **Exekvering** (`_ji` @12377616): resolveRowActionTarget("retryTurn") utan
  messageId/editTarget ⇒kast `V4RetryTargetNotLatestError` —
  `guard.latestAssistantRetryOnly`. Lyckat: `submitConversationRewind` +
  `startCanonicalIntent` med ORIGINAL-texten ur editTarget.intent.text
  (attachments via `stableAttachmentRefs`). Branchen i resolveRowActionTarget:
  kräver `actions.canRetry===true` + turnens `userInput`-rad med
  `origin:"realUser"` (annars `guard.actionUnavailable`).
- **Ack:** happy-path result-form är ej explicit bevisad i bundelkontexten
  (startCanonicalIntent:s returvärde inte fångat) — HYPOTETISK fram tills
  live-sond; felvägarna ovan + §2.2 CAS-vakterna är bevisade.

### 3.4 applyFileRewind — {target} (@10529099) — BEVISAT

- **Syfte:** återställ FILER till ett givet turn-läge (konversationen orörd).
- **Payload:** `{target: Ty}` — men målet är en **turnHeader-rad** med
  `fileChanges` + `actions.canRewindFiles===true` (resolveRowActionTarget:
  `(r==="applyFileRewind"||r==="fileRewindPreview") && (!n.fileChanges ||
  n.actions?.canRewindFiles!==!0)` ⇒ `guard.actionUnavailable`; lyckat svar
  bär `messageIds = getMessageIdsForTurnRow(rowId)` — ALLA turnens
  meddelanden inkl. output-continuation-rader).
- **Exekvering** (`vji` @12381210): `applyWorkspaceFileRewind({targetMessageIds,
  targetTurnId})` → **result `{type:"applyFileRewind", applied, preview,
  response}`** — bevisat ack-result som bär både tillämpning och förhandsvy.
- **Syskopar:** fråge-metoden `v4/conversation/fileRewindPreview` (V4-LAGRET
  rad 57: `{action: restore|delete, operationCount, …}`) och TUI-bryggans
  `previewFileRewind/applyFileRewind ([targetMessageIds])` (R1-PROTOKOLLET.md
  rad 183) — samma runtime-funktioner tre vägar in.
- **Studioläge:** rewind-knapparna kör `session/fork` (ändrar ÄVEN
  konversationen via ny session, M5-FORK.md §9) — applyFileRewind är den
  icke-destruktiva filvägen; komplement, inte ersättare.

### 3.5 setAssistantFeedback — {target, feedback} (@10529314) — BEVISAT

- **Syfte:** tumme upp/ner på ett assistant-svar (feedback:null tar bort).
- **Payload:** `{target: Ty, feedback: "like"|"dislike"|null}`.
- **Exekvering** (`zji` @12394867): resolveRowActionTarget(
  "setAssistantFeedback") kräver `row.kind==="assistantText"` + messageId
  (annars `guard.actionUnavailable`-familjen); host utan `setAssistantFeedback`-
  kapabilitet ⇒ `fault.command.assistantFeedbackUnsupported`; annars
  `host.setAssistantFeedback(sessionId, {entityId, messageId, feedback})`.
- **Läsgenväg:** enklaste typen att implementera först — inget preempt, ingen
  CAS-bieffekt utöver revisionen, ren host-delegering. OBS: kapabilitets-
  kontrollen måste sonderas FÖRE UI (§6 risk 3).

---

## 4. Fakta-lagret: lagring, läsning, återuppspelning

### 4.1 Lagring (BEVISAT)

- **Skrivarfunktion** `fhn` "savePersistentCommandFact" (@12446716):
  ```js
  saveSessionEntry({ id: `v4_command_fact:${source}:${commandId}`,
    sessionID, type: "v4/command_fact",  // phn @12444933-området
    time: {created, updated}, data: {source, ack, ...(metadata?{metadata}:{})} })
  ```
  Kallas via host-callback **`recordPersistentCommandFact(sessionId, source,
  ack, metadata?)** (@12371182 definition; anrop @12456897 med source
  `"timeline"` efter compact-commit — warn-only vid fel: "v4 compact
  persistent command fact failed").
- **Felkoder runt lagringen** (V4-LAGRET.md:303 + bundel): utan
  `sessionStore.saveSessionEntry` ⇒ `fault.command.persistentFactStoreUnavailable`;
  session saknas ⇒ `fault.command.persistentFactSessionNotFound`; workspace-
  identitet saknas ⇒ `fault.command.persistentFactWorkspaceMissing`.
- **Fysisk plats:** app-serverns SQLite-sessionstore (samma `saveSessionEntry`/
  `begin immediate`-familj som M5-FORK.md:167–189 bevisar för
  `commitForkBundle`). EJ något studion läser direkt — läsning går via
  protokollet (§4.2).
- **Fork-barnfakta:** id `v4_command_fact:child:<parentSessionId>:<sourceCommandId>`
  med identitetskontroller (child.parentID === fact.parentSessionId;
  ack.commandId === sourceCommandId) — finns posten sedan tidigare returneras
  BEFINTLIGT barn = exakt-en-gång (M5-FORK.md:167–189; bundelkontext bevarad
  i samma grep-fönster).

### 4.2 Läsning och återuppspelning (BEVISAT)

- **`queryCommands`** (@12349054): `v4/commands/query {commands:[{commandId?,
  sessionId?}]}` → väntar readyFlights per sessionId → `inbox.query` →
  `{results[]}` (live-status ur inbox; V4-LAGRET.md:66).
- **Återfuktning efter omstart:** host-hook `loadSession` anropar
  `mhn` "loadPersistentCommandFacts(store, sessionId, {discardAdmittedOnLoad})`
  (@12444933) → läser messages + sessionEntries(typ v4/command_fact) +
  inputs(discarded/cancelled) → fyra kartor `{transcript, timeline, child,
  discarded}` — timeline-delar med `sourceCommandId` mappas till
  `{commandId, status:"accepted", revisionAtDecision:0}`. Detta är mekaniken
  bakom "acks persistras som v4/command_fact … grundvalen för queryCommands
  och fork-idempotens" (V4-LAGRET.md:38–39, 253–254).
- **Studions befintliga läs-yta:** `lasV4KommandoFakta(commandId?)`
  (interface studio-transport.ts:1720, impl :5855, mock :8832) — skickar
  redan `v4/commands/query` och dokumenterar just fact-persistensen
  (rad 5849–5851). **Slutledning: läs-halvan av post 34 LEVER redan; gapet
  är inskickningen av de fem typerna.**

### 4.3 Vad studion måste göra för att läsning skall fungera

1. Hålla `commandId`-kulturen (`ak1a-cmd-<ts36>-<rand>`, transport :5890) —
   den är query-nyckel och fact-id-komponent.
2. Efter varje faktakommando: tolka ack.status först (accepted/rejected/
   stale/duplicate/noop/failed — V4-LAGRET.md:272–280); `stale` ⇒ hämta färsk
   revision+logEpoch och LÅT KUNDEN välja omtryck (CAS är ett domslut, ej fel).
3. Vid `failed` + forkAssistant: kom ihåg M5 §7 — barnet kan LEVA i databasen
   trots fel; lasSessioner() och föreslå "öppna barnet" (M5-FORK.md:254–266).

---

## 5. Mönstret från våg 181–187 — fyra kodytor + ett nytt femte

Implementationsmönstret (bevisat i våg 181–187, registerposterna 28–33):

| Kodyta | Fil/rad | Innehåll för post 34 |
|---|---|---|
| 1. Interface-metod | studio-transport.ts:1720–1860 | `skickaV4Fakta(typ, target, extras?)` med retur-ununion `{skickat, commandId, status?, ack, rått?, fel?}` |
| 2. AppServerTransport-gren | studio-transport.ts:5883–6174 (mönstret) | envelope `{commandId, clientId: v4ConnectionId, sessionId, type, payload, issuedAt}` + `protokollFraga("v4/command", envelope, 30_000)`; **NYTT (yta 5): `baseRevision` + `baseLogEpoch`** — transporten spårar redan `this.v4Revision`/`this.v4LogEpoch` (rad 6208–6234, skördade ur state.updated + subscribe-ack) |
| 3. MockTransport-spegel | studio-transport.ts:8832–9030 | samma payload-grind som AppServer-grenen; deterministisk ack UTAN påhittade reasonCodes (våg 182-kulturen, rad 8892–8898) |
| 4. Rutt-typgren | route.ts:93–300 (mönstret, ex. gren :116/:136/:163/:186/:224) | POST `{typ, rowId, entityId, …}`; 400 ENDAST ogiltig kropp; CAS/guard-domslut som 200 `{...ack, transport}`; GET ej exporterad ⇒ 405 |
| **5. CAS-förankring (ny bärare)** | transport, ny gemensam hjälpare | fakta-typ ⇒ envelope bär `baseRevision: this.v4Revision, baseLogEpoch: this.v4LogEpoch`; STALE-svar (proto.staleRevision/staleLogEpoch) mappas till ett tydligt "läget hunnit gå vidare"-svar, ej retry-tystnad |

Notera att metoder med `typ`-parameter + typad payload (som
`skickaV4KoStyrning` :5964) är närmast syskon — fakta-versionen lägger
`target: {rowId, entityId}` + CAS-fälten.

---

## 6. Rekommenderad ordning + risker (verifiering FÖRE kod)

### Ordning (motivering)

1. **CAS-sond FÖRST** (risk 1 nedan) — utan bevisad revision/epoch-källa är
   alla fem döda vid ankomst.
2. **setAssistantFeedback** — minst payload, ingen preempt, ren
   host-delegering; ger tumme-U/D-vägen (A6-listans enda "lätta").
3. **applyFileRewind** — kompletterar fil-spåret (fileChanges lever sedan
   våg 85); result bär preview; turnHeader-target = samma radtyp lasFilandringarV4
   redan hittar (:6222–6228).
4. **retryTurn** — bygger på CAS + editTarget-läsning; "kör igen"-knapp.
5. **editUserQuery** — preempt + mål-paus-bieffekt + workspaceMode-triaden;
   kräver UI-medvetenhet om `edit_user_query_goal_paused`.
6. **forkAssistant** sist — RPC-vägen (session/fork) LEVER och är
   kundbevisad; v4-typen tillför command_fact-idempotens och kan migreras
   utan kundtryck.

### Risker / verifieringar mot LEVANDE app-server FÖRE kod

1. **Vilket revisions-tal CAS:en jämför** — öppen fråga sedan V4-LAGRET
   §10.3 (rad 196–198): frame `patch.revision` vs `rowsRange.atSeq`.
   Sond: skicka (i sandbox) en faktatyp med korrekt logEpoch men
   baseRevision=0 ⇒ förvänta `proto.staleRevision` med
   `revisionAtDecision` = serverns tal; upprepa med fel logEpoch ⇒
   `proto.staleLogEpoch`. Ett svar = hela förankringsfrågan besvarad.
2. **Radläsningens fält** — studions rowsRange-läsare tittar idag bara på
   turnHeader (:6222); faktatyperna behöver `kind:"assistantText"`/
   `userInput`-rader + `actions` (canFork/canEdit/canRetry/canRewindFiles) +
   `fileChanges`-flaggan. Sond: läs rader och protokollfält per rad i en
   levande session.
3. **setAssistantFeedback-kapabiliteten** — sondera eller förvänta
   `fault.command.assistantFeedbackUnsupported` på ALLT (host-saknad är inte
   ett protokollfel utan en implementationsgrad).
4. **Äldre syskon utan CAS-fält:** qft innehåller ÄVEN de redan levererade
   typerna (setAutoDrain, köoperationer, switchModelConfig, pause/resumeGoal,
   våg 181–183). Dagens enveloper bär inte baseRevision — ändå levererar de
   (troligen: proto-missingBaseRevision endast när servern tillämpar CAS
   strikt; `decide` kastar `proto.missingBaseRevision` för qft-typer utan
   baseRevision). **HYPOTES: våra våg 181–183-ackar har tagit vägen via
   settle/rejected utan att vi noterat det.** Verifiera: lasV4KommandoFakta
   på ett gammalt commandId + skicka pauseGoal utan baseRevision och läs
   reasonCode. Om grinden är strikt: baka CAS-fälten i den gemensamma
   envelope-byggaren (fixar alla framtider på en gång).
5. **Happy-path-ack för retryTurn/editUserQuery** — result-formen är bevisad
   för applyFileRewind (§3.4) och editUserQuery-blocked (§3.2) men EJ för
   editUserQuery/retryTurn:s lyckade väg. Sond-utdata kompletterar vid
   implementations-tid; dokumentserien uppdateras då.
6. **UI-bieffekter:** editUserQuery/startNow-klassens mål-paus
   (`edit_user_query_goal_paused`) MÅSTE synas i målpanelen (samma klass som
   §11.5.5:s `send_now_goal_paused`, V4-LAGRET.md:375–386).
7. **timeline-faktans fel-tolerans** — misslyckad fact-persist efter compact
   är warn-only (§4.1): aldrig ett kundfel, aldrig retry-storm.

---

## 7. Ärlighets-redovisning

- **Bevisande källor:** bundeln 3.11.2-24 (ALLA scheman, mängder, handlers,
  CAS-grind, persistens/återfuktning med offset), V4-LAGRET.md (§5/§11.1–
  11.5: envelope, ack-union, reasonCode-uppräkning), M5-FORK.md
  (fork-barnfakta/idempotens/kvitto/fork_start_failure), studio-koden
  (transport + rutt-mönster, befintlig lasV4KommandoFakta).
- **Saknas/overifierat (trots full källträff):** (a) happy-path result-form
  för editUserQuery/retryTurn (§6.5); (b) vilken revisionssiffra CAS:en
  jämför (öppen sedan V4-LAGRET §10.3 — sond krävs); (c) om host i AK1A:s
  app-server implementerar setAssistantFeedback; (d) om våg 181–183:s
  icke-CAS-enveloper faktiskt avvisats tyst (§6.4-hypotesen). Ingen av
  dessa blockerar förstudien; samtliga är sonderbara på en levande session
  innan en rad transportkod skrivs.
- **Terminologirensning:** "qft" (registrets ord) är bundelns minifierade
  Set-namn för 15 CAS-typer; de fem registertyperna är mängden Vft. Nästa
  våg bör tala om "Vft/fem fakta-typerna" för att undvika sammanblandning
  med kö-typerna som ÄVEN ligger i qft.

---

LEVERANS: Post 34:s fakta-lager är fullt kartlagt — "qft" identifierat som
bundelns CAS-Set (Vft = de fem registertyperna), alla fem payload-scheman +
guards + exekveringsvägar + v4/command_fact-persistens/-återfuktning är
offset-bevisade ur bundeln 3.11.2-24 med V4-LAGRET §5/§11, M5-FORK och
studions transport/rutt som mönsterkällor; läs-halvan (lasV4KommandoFakta)
visade sig redan leva, och fyra punkter (CAS-revisionskälla,
happy-path-result för edit/retry, feedback-kapabilitet, äldre syskons
CAS-lucka) är ärligt markerade som live-verifieringar FÖR kod.
