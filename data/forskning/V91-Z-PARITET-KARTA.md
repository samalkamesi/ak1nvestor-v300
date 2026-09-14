# V91 Z-PARITETSKARTA — A4-granskning + LEVANDE RE-MÄTNING 2026-09-14

**Uppdrag** (STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 91" block A4): "Inventera
BOGSTAVLIGEN varenda tjänst i zcode-binären … jämför med studion, ranka
luckor (P0 kundnära / P1 kraft / P2 sen), dokumentera protokollform."

**DOKUMENTETS TVÅ LÄGEN:** §1–§5 är våg 91-granskningen (2026-09-09,
oförändrad grund) där varje rad nu bär kolumnen **läge 2026-09-14** =
re-mätning mot FAKTISK kod i repet (10X p1, "paritetsmatrisen levande").
Protokollform-kolumnen från originalet är borttrimmad här — den lever
oförändrad i `tool-results/v83-protokollkarta.md` (LAGEN) och i gamla
revisionen av denna fil (git-historik).

**Källor 2026-09-14:** `src/app/api/studio/**` (23 route-filer, räkning
nedan) · `src/lib/studio/studio-transport.ts` (8 663 rader, StudioTransport
= 51 publika metoder + 1 egenskap) · `src/components/ak1a/studio-chat.tsx`
(10 502 rader) · `src/lib/studio/kommandon.ts` (10 kommandon). Metod:
direkt kodläsning + grep-verifiering av varje wire-koppling (transportmetod
↔ rutt ↔ UI). Inget i src/ ändrades (READ-ONLY).

**Lägesord:** ✓ = IMPLEMENTERAD (transport + rutt + UI) · ~ = DELVIS
(brygga/byggd del lever, men gap kvar) · ✗ = SAKNAS.

**MÅTTBAT RESULTAT 2026-09-14: 91 tjänster — 43 ✓ (47 %) · 6 ~ (7 %) ·
42 ✗ (46 %).** (Våg 91:s egen mätning: 31 ✓ / 3 ~ / 57 ✗ — netto +12
implementerade sedan dess; vinnarna: hela v4-attachmentsgrenen, hela
automation-trion create/list/delete, workspace-standardvärdena ×3,
generateText, plugins/setEnabled, session/events-replay.)

---

## 0. FAKTISK KODINVENTERING 2026-09-14 (ny — sanningsägaren)

### 0.1 Alla rutter under src/app/api/studio/ (23 st)

| Rutt | Metoder | Gör | Landad i |
|------|---------|-----|----------|
| /api/studio/andringar | GET | Senaste turnens filändringar ±N | v83 |
| /api/studio/anvandning | GET | usage/stats + session/usage (admin) | v85 F3 |
| /api/studio/fardigheter | GET, POST | Skills/plugins/MCP-listor; POST = plugins/setEnabled | v85 F2 + v93 C1 |
| /api/studio/filer | GET, POST, DELETE | Filträd + bildserving + nedladdning + tömning | v83 |
| /api/studio/halsa | GET | Studions hälsa (KVD-yta) | v90 K1 |
| /api/studio/installningar | GET, POST | Workspace-standardvärden (modell/tankestyrka/läge) | v93 C2 |
| /api/studio/interaktion | GET, POST | Väntande interaktioner; svar permission/fråga | v83 B2 |
| /api/studio/mal/status | GET | Mål-lägets snapshot (badge-sanning) | v91 A1b |
| /api/studio/mal/stream | POST | Mål-loopens SSE (autonoma iterationer) | v85 F1 |
| /api/studio/minne | GET, PUT, DELETE | Memories-filer (fs-väg, EJ protokoll) | v84 |
| /api/studio/modeller | GET, POST | Modellkatalog; POST = bytModell (create-väg) | v82 |
| /api/studio/session | GET, POST | Sessionsvy + 16 actions (ny/resume/stang/fork/rewind/compact/malSatt/malPausa/malRensa/malAteruppta/subagenter/avbrytTask/arbetsyta/lage/tankeniva …) | v82+ |
| /api/studio/session/events | GET | session/events-replay (afterSeq) | v93 C2 |
| /api/studio/sessions/disk | GET | tradHistorik — HELA huvudtråden ur zcodes egna sessions-DB | v148 |
| /api/studio/stream | GET, POST | SSE-bryggan + prompt-sändning + bilder (skickaMedBild) | v81+ |
| /api/studio/styrelse | GET, POST | AI-styrelsen som lag (motorn) | v91 A2 |
| /api/studio/tjanster/automation | GET, POST, DELETE | automation/list + create + delete | v92 B1 |
| /api/studio/tjanster/automation/pausa | POST | automation/update {enabled:false/true} | v92 B2 |
| /api/studio/tjanster/bakgrund | GET | projection.backgroundJobs — HELA listan | v92 B1 |
| /api/studio/tjanster/bakgrund/avbryt | POST | session/cancelBackgroundTask | v92 B1 |
| /api/studio/tjanster/generera | POST | workspace/generateText (headless) | v91 A1d |
| /api/studio/tjanster/webblasare | GET, POST | interaction/browserList + browserExecute | v91 A1d |
| /api/studio/uppladdning | POST, GET | Multipart-uppladdning (30 MB-tak, 7 d rensning) | v91 |

### 0.2 StudioTransport-interfacet — alla publika metoder (51 + 1 egenskap)

`namn` ("appserver"|"mock") · sessionId · ensure · historik · skicka
(extra: attachments/automationId/offPeak — StudioSkickaExtra) ·
skickaMedBild · laddaUppBilaga (v4 begin→chunk→commit) · bytModell ·
nySession · lasSessioner · compact · lasKontext · oppnaSession ·
stangSession · forka · rewindTillTurn · lasMal · sattMal · rensaMal ·
malStatus · prenumereraMal · pausaMal · aterupptaMal · sondMal ·
lasSubagenter · avbrytBakgrundsTask · lasArbetsyta · lasSkills ·
lasPlugins · lasMcp · lasUsage · lasFilandringar · vantaInteraktioner ·
svarPermission · svarFraga · sattLage ("build"|"plan") · sattTankeNiva ·
lasBakgrundsjobb (hela arrayen) · lasWebblasare · korWebblasare ·
lasAutomationer · automationSkapa · automationUppdatera ·
automationRadera · skickaAutomation · genereraText ·
lasWorkspaceInstallningar · sparaStandardModell ·
sparaStandardTankestyrka · sparaStandardLage · pluginSattAktiverad ·
lasEventsFranSeq.

---

## 1. TJÄNSTEINVENTERING + PARITETSMÄTNING

### 1.1 session/* — 21 tjänster (18 ✓ · 2 ~ · 1 ✗)

| # | Tjänst | Gör (1 rad) | våg 91 | läge 2026-09-14 | Notering |
|---|--------|-------------|--------|------------------|----------|
| 1 | session/create | Skapar session med modell/läge/tanke/persistens | ✓ | ✓ | param-gap kvar (se §2) |
| 2 | session/resume | Återupptar persistent session | ✓ | ✓ | oppnaSession; + v148: tråd-permanens återarmar mål |
| 3 | session/list | Listar sessioner | ✓ | ✓ | + v148 sessions/disk (tradHistorik ur zcodes egen DB) |
| 4 | session/read | Snapshot + projektion | ✓ | ✓ | P0-4 LÖST: hela backgroundJobs-arrayen parsas (lasBakgrundsjobb) |
| 5 | session/messages | Meddelandehistorik med delar | ✓ | ✓ | även källa till lasFilandringar-fallback |
| 6 | session/events | Händelsehistorik efter sekvensnummer | ✗ | ✓ | v93 C1/C2: lasEventsFranSeq + GET /session/events + replayTillKort i återkopplingen |
| 7 | session/subscribe | Aktiverar live-flödet | ✓ | ✓ | SSE-brytgan /stream |
| 8 | session/send | Skickar prompt asynkront | ✓ | ✓ | v92 B1: StudioSkickaExtra — attachments[] + automationId ⊕ offPeakTaskId lever; kvar: browserAmbientContext/expectedRevision/botDeliveryTarget |
| 9 | session/stop | Avbryter prompt + pausar mål | ✓ | ✓ | |
| 10 | session/cancelBackgroundTask | Avbryter bakgrundsjobb | ✓ | ✓ | nu även egen rutt: POST /tjanster/bakgrund/avbryt |
| 11 | session/fork | Forkar vid turn/checkpoint | ✓ | ✓ | forka + rewindTillTurn (v86 G5) |
| 12 | session/compact | Komprimerar kontext | ✓ | ✓ | expectedRevision fortfarande ej med (§2) |
| 13 | session/goal | Autonom mål-loop (5 actions) | ✓ | ✓ | alla actions + sondMal (självläkning) + /mal/status + /mal/stream |
| 14 | session/close | Stänger session | ✓ | ✓ | |
| 15 | session/setModel | Byter modell på LEVANDE session | ~ | ~ | fortfarande create-väg (bytModell kasserar) — se P0-2 |
| 16 | session/setThoughtLevel | Tankestyrka | ✓ | ✓ | + v93: sparaStandardTankestyrka (workspace-default) |
| 17 | session/setMode | Läge build/plan/edit/yolo/auto | ~ | ~ | sattLage bär fortfarande endast "build"\|"plan"; men setDefaultMode (workspace) bär alla 5 via v93 C1 |
| 18 | session/updateRuntimeModelConfig | Byter runtime-modellkonfig levande | ✗ | ✗ (P2) | orörd |
| 19 | session/subagents | Listar underagenter | ✓ | ✓ | |
| 20 | session/usage | Tokenräkning per session | ✓ | ✓ | |
| 21 | session/requestRuntimePreferences | Handsskakning (måste svaras) | ✓ | ✓ | ProtokollKlientens autosvar |

### 1.2 workspace/* — 12 tjänster (5 ✓ · 0 ~ · 7 ✗)

| # | Tjänst | Gör | våg 91 | läge 2026-09-14 | Notering |
|---|--------|-----|--------|------------------|----------|
| 1 | workspace/readState | Läges-/modell-/behörighetsinställningar | ✓ | ✓ | + v93 C1: lasWorkspaceInstallningar (standardvärden, defensiv parsning) |
| 2 | workspace/generateText | Headless textgenerering | ✗ | ✓ | v91 A1d + v92: genereraText + POST /tjanster/generera (styrelsemotorn använder) |
| 3 | workspace/cancelGenerateText | Avbryter generateText-operation | ✗ | ✗ (P2) | nedgraderad — genereringen körs kort/synkront, operationId-behov ej påvisat |
| 4 | workspace/hooks/trustGrant | Godkänner workspace-hooks-bundle | ✗ | ✗ (P1) | se P1-1 |
| 5 | workspace/updateProviderRegistry | Uppdaterar providerregistret | ✗ | ✗ (P2) | orörd |
| 6 | workspace/updateInteractionPreferences | Interaktionsinställningar | ✗ | ✗ (P2) | orörd |
| 7 | workspace/updateModelIoPreferences | Modell-IO-inställningar | ✗ | ✗ (P2) | orörd |
| 8 | workspace/upsertModelProvider | Lägg/uppdatera provider | ✗ | ✗ (P2, R2) | nycklar = kundens veto (se §5.2) |
| 9 | workspace/removeModelProvider | Ta bort provider | ✗ | ✗ (P2) | orörd |
| 10 | workspace/setDefaultModel | Default-modell | ✗ | ✓ | v93 C1/C2: sparaStandardModell + POST /installningar |
| 11 | workspace/setDefaultThoughtLevel | Default-tankestyrka | ✗ | ✓ | v93 C1/C2: sparaStandardTankestyrka |
| 12 | workspace/setDefaultMode | Default-läge | ✗ | ✓ | v93 C1/C2: sparaStandardLage — bär alla 5 lägen (build/plan/edit/yolo/auto) |

### 1.3 plugins/* — 17 tjänster (2 ✓ · 0 ~ · 15 ✗)

| # | Tjänst | Gör | våg 91 | läge 2026-09-14 | Notering |
|---|--------|-----|--------|------------------|----------|
| 1 | plugins/list | Installerade plugins + diagnostik | ✓ | ✓ | Färdigheter-panelen |
| 2 | plugins/overview | Marknadsplatser + tillgängliga | ✗ | ✗ (P2; källa för P0-3) | behövs som "tillgängliga"-källa vid install |
| 3 | plugins/referenceCatalog | Full referenskatalog | ✗ | ✗ (P2) | orörd |
| 4 | plugins/setEnabled | Toggla plugin på/av | ✗ | ✓ | v93 C1: pluginSattAktiverad + POST /fardigheter (form-retry utan scope) |
| 5 | plugins/marketplace/add | Lägg till marknadsplats | ✗ | ✗ (P2) | orörd |
| 6 | plugins/marketplace/remove | Ta bort marknadsplats | ✗ | ✗ (P2) | orörd |
| 7 | plugins/marketplace/update | Uppdatera marknadsplats | ✗ | ✗ (P2) | orörd |
| 8 | plugins/install | Installera plugin | ✗ | ✗ (P1) | se P0-3 |
| 9 | plugins/uninstall | Avinstallera | ✗ | ✗ (P1) | se P0-3 |
| 10 | plugins/update | Uppdatera plugin | ✗ | ✗ (P2) | orörd |
| 11 | plugins/restoreBuiltin | Återställ inbyggt plugin | ✗ | ✗ (P2) | orörd |
| 12 | plugins/configure | Konfigurera plugin | ✗ | ✗ (P2) | orörd |
| 13 | plugins/resetConfig | Nollställ konfig | ✗ | ✗ (P2) | orörd |
| 14 | plugins/validate | Validera konfig | ✗ | ✗ (P2) | orörd |
| 15 | plugins/describe | Beskriv konfig-yta | ✗ | ✗ (P2) | orörd |
| 16 | plugins/cancelOperation | Avbryt driftoperation | ✗ | ✗ (P2) | orörd |
| 17 | plugins/resolveSuggestedReference | Lös referens | ✗ | ✗ (P2) | orörd |

### 1.4 skills + mcp + usage — 3 tjänster (3 ✓)

| # | Tjänst | våg 91 | läge 2026-09-14 | Notering |
|---|--------|--------|------------------|----------|
| 1 | skills/referenceCatalog | ✓ | ✓ | lasSkills (Färdigheter ⚡) |
| 2 | mcp/list | ✓ | ✓ | lasMcp |
| 3 | usage/stats | ✓ | ✓ | lasUsage → /anvandning (admin) |

### 1.5 automation/* — 5 tjänster (3 ✓ · 1 ~ · 1 ✗)

| # | Tjänst | Gör | våg 91 | läge 2026-09-14 | Notering |
|---|--------|-----|--------|------------------|----------|
| 1 | automation/create | Skapa cron-styrd autonom uppgift | ✗ | ✓ | v92 B1: automationSkapa + POST /tjanster/automation; -32601 ⇒ ärlig 501 |
| 2 | automation/update | Uppdatera (targetTaskId m.fl.) | ✗ | ~ | endast enabled-paus/återaktivering (/tjanster/automation/pausa); övriga fält ej exponerade — se P1-4 |
| 3 | automation/checkTaskBinding | Är uppgiften bunden? | ✗ | ✗ (P2) | hjälptjänst; listans lifecycleStatus täcker kundvärdet |
| 4 | automation/list | Lista automatons (nextRunAt, runCount) | ✗ | ✓ | lasAutomationer + GET; UI-panel lever (92 träffar i studio-chat.tsx) |
| 5 | automation/delete | Ta bort automation | ✗ | ✓ | automationRadera + DELETE ?id= |

### 1.6 interaction/* — 6 tjänster (3 ✓ · 2 ~ · 1 ✗)

| # | Tjänst | våg 91 | läge 2026-09-14 | Notering |
|---|--------|--------|------------------|----------|
| 1 | interaction/requestPermission | ✓ | ✓ | svarPermission + dialog med diff (v84 C) |
| 2 | interaction/requestUserInput | ✓ | ✓ | svarFraga + frågekort |
| 3 | interaction/requestProviderRuntimeHeaders | ✗ | ✗ (P0) | fortfarande 0 träffar i transporten (grep 2026-09-14) — obesvarad request riskerar 15 s-häng — se P0-1 |
| 4 | interaction/requestOfficialMcpAuthHeaders | ✓ | ✓ | autosvar {} |
| 5 | interaction/browserList | ✗ | ~ | bryggan BYGGD (lasWebblasare + GET /tjanster/webblasare + UI), men aktuell agent-binär saknar metoden ⇒ 501 i drift (A3c-kontraktet: UI dold) — se P1-5 |
| 6 | interaction/browserExecute | ✗ | ~ | samma: korWebblasare + POST lever, binären svarar -32601 ⇒ 501 |

### 1.7 Notiskanaler — 6 st (2 ✓ · 1 ~ · 3 ✗)

| # | Kanal | våg 91 | läge 2026-09-14 | Notering |
|---|-------|--------|------------------|----------|
| 1 | session/event (24 typer) | ✓ | ✓ | bredare nu: mål-loopens mal_iteration/verktyg_kort/runda via prenumereraMal (v85 F1) + streaming (v83 B1); titleUpdated/steer*/checkpoint fortfarande okonsumerade |
| 2 | state.updated | ✓ | ✓ | + v4-revisionsspårning (v85 F4) |
| 3 | computer-use/operation-event | ✗ | ✗ (P2) | kanalen finns ej i deploymenten (§5.3) |
| 4 | process/mcpTelemetry | ✗ | ✗ (P2) | orörd |
| 5 | v4/telemetry/event | ✗ | ✗ (P2) | orörd |
| 6 | v4/conversation/frame | ~ | ~ | mottas; state.updated-op spåras; rader hämtas via rowsRange |

### 1.8 v4-grenen — 21 klientmetoder (7 ✓ · 0 ~ · 14 ✗)

| # | Tjänst | våg 91 | läge 2026-09-14 | Notering |
|---|--------|--------|------------------|----------|
| 1 | v4/connection/flow | ✗ | ✗ (P2) | orörd |
| 2 | v4/controller/subscribe | ✗ | ✗ (P2) | orörd |
| 3 | v4/controller/resync | ✗ | ✗ (P2) | orörd |
| 4 | v4/controller/unsubscribe | ✗ | ✗ (P2) | orörd |
| 5 | v4/conversation/subscribe | ✓ | ✓ | v4-kedjan (v85 F4) |
| 6 | v4/conversation/resync | ✗ | ✗ (P2) | orörd |
| 7 | v4/conversation/unsubscribe | ✗ | ✗ (P2) | orörd |
| 8 | v4/conversation/rowsRange | ✓ | ✓ | target = senaste turnHeader-raden (sond3-bevisat) |
| 9 | v4/conversation/plans | ✗ | ✗ (P2) | orörd |
| 10 | v4/conversation/fileChanges | ✓ | ✓ | lasFilandringarV4 = PRIMÄR väg (revision + logEpoch + retry) med Write/Edit-fallback-motor |
| 11 | v4/conversation/fileRewindPreview | ✗ | ✗ (P1) | se P1-2 |
| 12 | v4/usage/stats | ✗ | ✗ (P2) | orörd |
| 13 | v4/conversation/usage | ✗ | ✗ (P2) | orörd |
| 14 | v4/attachment/begin | ✗ | ✓ | v92 B1 (P0-1 LÖST): laddaUppBilaga — bilder ÄKTA bilagor, E2E-bevisade (våg 92) |
| 15 | v4/attachment/chunk | ✗ | ✓ | 512 kB base64-bitar i samma flöde |
| 16 | v4/attachment/commit | ✗ | ✓ | svar → bilageIdUrSvar → session/send attachments[] |
| 17 | v4/attachment/abort | ✗ | ✓ | anropas vid chunk-fel (transport rad ~5887) |
| 18 | v4/attachment/read | ✗ | ✗ (P2) | läs-sidan; barnets Read täcker kundvärdet |
| 19 | v4/attachment/previewSource | ✗ | ✗ (P2) | orörd |
| 20 | v4/command | ✗ | ✗ (P2) | orörd |
| 21 | v4/commands/query | ✗ | ✗ (P2) | orörd |

**Kartan §4G** (interna/telemetri-strängar utan wire-garanti) räknas
fortfarande INTE som tjänster. Fakta oförändrad: ingen task/*- eller
memory/*-domän finns; "minne" i studion är filesystem-läsning av
~/.zcode/cli/memories (rutt /api/studio/minne).

---

## 2. PARAMETARNIVÅ-GAP PÅ IMPLEMENTERADE METODER (re-mätt 2026-09-14)

- **session/send** — ✅ LÖST till största delen (v92 B1): `attachments[]`
  (v4-refs) samt `automationId ⊕ offPeakTaskId + offPeakRunType` bärs via
  StudioSkickaExtra, med form-avvisnings-nedgradering (-32602 → vanlig
  skicka en gång). **Kvar:** `browserAmbientContext`, `expectedRevision`,
  `botDeliveryTarget`.
- **session/create** — oförändrat gap: `importedHistory`, `mcpServers`,
  `toolAllowlist`/`toolDenylist`, `titleGenerationEnabled`,
  `parentSessionId` används ej (create bär workspace/model/mode/
  thoughtLevel/persistence).
- **session/compact** — `expectedRevision` saknas fortfarande i anropet.
- **session/setMode** — `sattLage` bär fortfarande endast "build"|"plan"
  (protokollets edit/yolo/auto går endast via workspace/setDefaultMode).

---

## 3. STUDIO-STÖDTJÄNSTER (icke-protokoll — komplett lägesbild 2026-09-14)

Alla lever: `/session` (GET + 16 POST-actions), `/stream` (SSE + historik +
bilder), `/modeller`, `/interaktion`, `/fardigheter` (GET+POST-toggle),
`/minne` (fs-väg), `/filer`, `/uppladdning`, `/andringar`, `/anvandning`,
`/halsa`, `/mal/stream`, `/mal/status` (v91 A1b), `/session/events`
(v93 C2), `/installningar` (v93 C2), `/sessions/disk` (v148 —
tradHistorik, trådens permanens), `/styrelse` (v91 A2), `/tjanster/*`
(automation + pausa, bakgrund + avbryt, generera, webblasare).
Kommandon (kommandon.ts, 10 st): /help /ny /modell /komprimera /filer
/fardigheter /sparad /installningar /automation /styrelsen.
Våg 91:s "pågående block"-varning är HISTORIK — samtliga A1b/A1d/A2-ytor
landade och lever.

---

## 4. GAP-RANKNING 2026-09-14 — kvarvarande luckor med skiss (3 rader per tjänst)

### P0 — kundvärde/robusthet direkt (3 st)

**P0-1. interaction/requestProviderRuntimeHeaders — autosvar.**
Transport: serverRequestHanteraren svarar {} (identiskt mönster med
requestOfficialMcpAuthHeaders — LIVE ×6 i v83-kartan); ingen egen endpoint
(transport-intern); ingen UI — vinsten är att en provider-fråga aldrig
låser sessionen i 15 s.

**P0-2. session/setModel på LEVANDE session + lägesbredd i sattLage.**
Transport: `bytModellLevande(model)` → session/setModel {sessionId, model,
expectedRevision?} + bredda sattLage till protokollets 5 lägen; Endpoint:
POST /api/studio/modeller {levande:true} (bytModell create-vägen kvar som
default); UI: "behåll sessionen"-kryss i modellbytaren + lägesväljare
edit/yolo/auto med yolo-varning. Motivering: med v148:s trådens permanens
är sessionId-hoppen (bytModell kasserar) onaturliga — historiken skall
fortsätta i SAMMA session.

**P0-3. plugins/install + plugins/uninstall (+ overview som källa).**
Transport: installeraPlugin(pluginId)/avinstalleraPlugin via protokollFraga
(driftsvar = operation/snapshot) + lasPluginsOverview för "tillgängliga";
Endpoint: POST /api/studio/fardigheter {action:"installera"|"avinstallera",
pluginId}; UI: installera-knapp per tillgängligt kort + avinstallera på
installerade. Motivering: studion kan lista+togglare men inte FÖRBOKA
nya förmågor — "vad agenten kan" växer via installationer.

### P1 — kraft (5 st)

**P1-1. workspace/hooks/trustGrant.** Transport: litaHooks(bundleDigest,
hookDeclarationDigest) — digesterna hämtas ur aktuellt diagnostikfel;
Endpoint: POST /api/studio/tjanster/hooks-trust; UI: godkännandekort med
digest-förkortning + svenska reasonCode-förklaringar.

**P1-2. v4/conversation/fileRewindPreview.** Transport:
forhandsvisningRewind(target) före fork; Endpoint: /api/studio/session
action=rewind?option=preview; UI: ±diff-dialog INNAN "Gå tillbaka hit"
(naturlig par till v84 C:s permission-diff).

**P1-3. Exponera skickaAutomation (P0-5-resten).** Transportmetoden lever
men har 0 rutt-/UI-konsumenter (grep 2026-09-14); Endpoint: POST
/api/studio/tjanster/automation {action:"kor", id} → skickaAutomation;
UI: "Kör nu"-knapp per automation (manuell trigger, turnen märks
automationId i historiken).

**P1-4. automation/update-full + checkTaskBinding.** Transport:
automationUppdatera bär hela uppdateringsformen (cronExpr, prompt,
targetTaskId) + lasTaskbindning(id); Endpoint: PATCH
/api/studio/tjanster/automation; UI: redigera-formulär per automation +
bindningsstatus-badge.

**P1-5. Webbläsarparet i DRIFT (binäruppgradering — ej kodgap).** Bryggor
lever (lasWebblasare/korWebblasare + rutt + UI) men aktuell agent-binär
svarar -32601 ⇒ 501. Åtgärd: uppgradera zcode-app-server till version med
interaction/browser*; verifiera GET /tjanster/webblasare ≠ 501; UI:n döljer
redan ärligt vid 501 (A3c-kontraktet).

### P2 — sen (oförändrad grund, omräknad)

- **Workspace-inställningar övrigt (6 st):** updateProviderRegistry,
  updateInteractionPreferences, updateModelIoPreferences,
  upsertModelProvider/removeModelProvider (R2-gräns kvar), +
  session/updateRuntimeModelConfig. Skiss: transport-bryggor + POST
  /api/studio/installningar {fält}; UI: "Standardvärden"-sektion —
  create bär redan valen till nästa session.
- **Plugins-drift övrigt (13 st):** overview, referenceCatalog,
  marketplace/add|remove|update, update, restoreBuiltin, configure,
  resetConfig, validate, describe, cancelOperation,
  resolveSuggestedReference. Skiss: gemensam dispatch POST /fardigheter
  {action} + "Marknadsplatser"-flik; cancelOperation → global avbryt-knapp.
- **v4-övrigt (14 st):** command, commands/query, plans, v4/usage/stats,
  conversation/usage, controller/subscribe|resync|unsubscribe,
  connection/flow, conversation/resync|unsubscribe, attachment/read,
  previewSource, + workspace/cancelGenerateText. Skiss: när v4-grenen
  stabiliserats: v4/command-brygga till kommandon.ts; plans → plan-trädvy
  i höger panelen.
- **Telemetrikanaler (3 st):** computer-use/operation-event (tyst i denna
  deploymenten, §5.3), process/mcpTelemetry, v4/telemetry/event. Skiss:
  påNotis-loggning + GET /halsa?telemetry=1 (sista N händelser).

---

## 5. TJÄNSTER SOM INTE (fullt) KAN BYGGAS — oförändrat giltig (våg 91)

1. **plugins/marketplace/add för autentiserade källor + OAuth-MCP:**
   kräver ZCode-relay-autentisering (äkta tokens produceras av Z:s
   konto-upplevelse). Studion svarar {} = hoppa över — publika källor
   fungerar, auth-krävande kan ej aktiveras härifrån.
2. **workspace/upsertModelProvider för icke-zai-providers:** relayer utan
   API-nycklar är oanvändbara; kundägda nycklar + säker hantering =
   R2 (VÄNTAR KUND).
3. **computer-use/operation-event:** kräver computer-use-backend i
   ZCode-klienten — finns ej i app-server-läge på Contabo.
4. **Kostnad i valuta ur usage-stats:** protokollet ger tokens, aldrig
   priser — egen pristabell = approximation, aldrig protokollsanning.
5. **importedHistory (claudeCode-import):** kräver exportfiler utanför
   systemet — engångsimportväg, inte en tjänst studion fyller själv.
6. **Off-peak-schemaläggning på ZCode Cloud:** automation kör i
   app-server-processen lokalt; molnside-funktioner kan avvika — ärlig
   statusvisning i UI:t.

---

## EXECUTIVE SUMMARY (2026-09-14)

- **Tjänster totalt: 91** — **43 ✓ (47 %) · 6 ~ (7 %) · 42 ✗ (46 %)**
  (våg 91: 31 ✓ / 3 ~ / 57 ✗ — netto +12 implementerade).
- **Våg 91:s samtliga fem P0 är levererade eller brolagda:** bilder
  (v4/attachment ×4 + send.attachments — våg 92 E2E-bevisat), automation
  (create/list/delete + paus), bakgrundsjobb-fullvy (hela
  projection-listan), webbläsare (bryggor + UI; väntar agent-binär),
  autonomi-koppling (StudioSkickaExtra lever i skicka).
- **Också lösta sedan våg 91:** workspace-standardvärden ×3 (v93 C1/C2 +
  /installningar), plugins/setEnabled (v93 C1), workspace/generateText,
  session/events-replay (v93 C1/C2).
- **Nya topp-3 (P0):** providerRuntimeHeaders-autosvar (hängrisk),
  setModel på levande session + full lägesbredd (trådens permanens gör
  sessionId-hop onaturliga), plugins/install+uninstall (växa förmågor).
- **Insikt:** samtals-kärnan OCH system-familjernas första våning
  (automation/bilagor/bakgrund/inställningar) är nu paritetstäckta; det
  som återstår är drifts-djupet (plugins-marknadsplatser,
  provider-inställningar, v4-styre/telemetri) — inga P0 kräver ny
  protokollforskning; alla former står i v83-kartan.

— Re-mätning 10X p1 ("paritetsmatrisen levande"), 2026-09-14.
READ-ONLY mot src/ respekterat; enda skrivningen: denna fil.
