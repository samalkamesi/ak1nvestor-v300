# M4 — MINNESMOTORN: när konsoliderar runtimen automatiskt?

> Fabriksuppdrag m4 i SKAPAREN-DJUPET-manifestet (skaparen-motorerna).
> Uppdragets fråga: "samma bundle: 'memory' + autoConsolidate + summaryMaxBytes —
> när konsoliderar runtimen automatiskt?" samt hur studions minpanel ska visa
> konsolideringar. Källa: den INSTALLERADE runtimen
> `/home/ak1a/.npm-global/lib/node_modules/zcode-app-cli/vendor/zcode.cjs`
> (12 632 838 byte, cli 0.16.5, app 3.11.2-24) + config-mallarna i samma paket
> + den levande loggen/minna på servern. Alla offsetar = exakta byte-positioner
> i zcode.cjs om inget annat anges. Syskondokument: R7-MINNE.md (minnessystemets
> hela karta — rot, index, recall, panel-läge), M2 (kompakteringen), M1 (målet).

## TL;DR

1. **Svaret på frågan: runtimen konsoliderar EFTER VARJE LYCKAD TUR — inte på
   timer, inte på storlek.** Enda anropsstället är i turmetodens succé-gren,
   direkt efter loggraden `event:"turn.completed"` (offset 11060163):
   `Uqr(this,{traceContext:u})` = `scheduleProjectMemoryExtraction`. Fel- och
   avbrutna turer triggar ALDRIG. Sedan gallrar en kedja av grindar (§2) som
   i praktiken gör de flesta turer till tysta skippar.
2. **`autoConsolidate`, `summaryMaxBytes` och `write` är DÖDA NYCKLAR i denna
   build** — 0 träffar i hela zcode.cjs (bevis §1). De finns bara i
   config-mallarna (bin/zcode.js, config.example.json, TUI:ns inbäddade
   default). Config-översättaren läser av hela memory-blocket ENDAST `use`.
   Reglaget som STYR är `features.memory` + `memory.use` + det interna
   `memory.extractionEnabled`.
3. **HEADLESS-LÄGET (`zcode -p`) KONSOLIDERAR ALDRIG**: startvägen `gkt`
   hårdkodar `runtimeConfig:{memory:{extractionEnabled:!1}}` (12571213).
   **Agentfabrikens barn körs exakt så** (`spawn(zcode,["-p",…])`,
   verktyg/agentfabrik.mjs:131) — bevisat i loggen: 64 bootstrap-rader med
   `memoryExtractionEnabled:false` idag, repots minnesrot fortfarande TOM.
4. **Konsolideringsnotisen `memory_update` är VILANDE** (3 träffar:
   deklaration/läsning/nollställning — ingen tilldelning) och
   **`session_memory`-triggern finns i schema+switchar men har INGEN
   anropsplats** — två vilande vägar, se §3.
5. **Levande bevis**: extraktioner kördes senast 2026-09-10 22:36–22:38
   (6 modellanrop, querySource `project_memory_extract`); därefter 0 styck
   trots 251 avslutade turer i extraktionskapabla studio-sessioner
   (09-11→14). Mest trolig orsak: prosa-grinden — autonoma mål-turars input
   är `model-only` syntetisk och korta kundbekräftelser under 3 ord hoppar
   tyst över (§5). Skippen LOGGAS ALDRIG — panelfix i §6.

---

## §1 Konfigurationens sanning — autoConsolidate/summaryMaxBytes är döda nycklar

### 1.1 Träffarnas geografi (uppmätt 2026-09-14, exakta tal)

| Fil | `memory` (förekomster/rader) | `autoConsolidate` | `summaryMaxBytes` |
|---|---|---|---|
| `vendor/zcode.cjs` (runtimen, 12,6 MB) | **586** / 457 | **0** | **0** |
| `bin/zcode.js` (CLI-start, default-config) | 2 / 2 | 1 | 1 |
| `config.example.json` | 2 / 2 | 1 | 1 |
| `vendor/node_modules/@zcode/tui/dist/index.js` | 18+15 (flera är syntaxordliste-brus: `memoryBarrier*`, `SystemMemory` …) | 1 | 1 |

Manifestets "'memory' (14 träffar)" var en uppskattning; rätt bild ovan.
Nyckelparet i mallarna är ALWAYS samma JSON-block (TUI-offset 2383):

```json
memory: { "use": true, "write": true, "autoConsolidate": true, "summaryMaxBytes": 8192 }
```

### 1.2 Beviset: vad som korsar config→runtime-gränsen

Runtime-config-byggaren (11869926) bygger sitt memory-objekt så här — notera
att `r.config.memory` = kundens config.json-block, och att ENDAST `use` läses:

```js
memory: {
  cliStorageRoot: t,
  enabled:  n.runtimeConfig?.memory?.enabled ?? r.config.features.memory,
  ...n.runtimeConfig?.memory?.extractionEnabled === void 0 ? {}
          : { extractionEnabled: n.runtimeConfig.memory.extractionEnabled },
  ...e.storageRoot ? { storageRoot: e.storageRoot } : {},
  use:      n.runtimeConfig?.memory?.use ?? r.config.memory.use,
  workspaceIdentity: m?.trim() || void 0
}
```

`write`, `autoConsolidate`, `summaryMaxBytes` förekommer bokstavligen ingen
annanstans i bunten. Konfigurationstabellen (live på servern):

| Nyckel (config.json) | Värde på servern | Läses av runtimen? | Verkan |
|---|---|---|---|
| `features.memory` | `true` | JA → `memory.enabled` | hela projektminnet på/av |
| `memory.use` | `true` | JA | rot-porten `XL` (se §2.1) |
| `memory.write` | `true` | **NEJ** | ingen (huvudagenten får alltid skriva; `mSe` auto-tillåter Write/Edit på .md i roten) |
| `memory.autoConsolidate` | `true` | **NEJ** | **ingen** — konsolideringen styrs av `extractionEnabled`, inte denna |
| `memory.summaryMaxBytes` | `8192` | **NEJ** | **ingen** — indexets verkliga tak är hårdkodat 200 rader/25 000 tecken (`Glt=200,qre=25e3`, 7747810) |
| (intern) `memory.extractionEnabled` | sätts av startvägen | JA | **det äkta reglaget** — `true` default; `false` av headless (§1.3) |

### 1.3 Headless-undantaget — viktigt för agentfabriken

CLI:ns headless `--prompt`-startväg (`gkt`, kontext runt 12571213 — igenkänns
på `"--prompt requires non-empty text."` och json/stream-json-output) sänder
hårdkodat:

```js
runtimeConfig: { …, memory: { extractionEnabled: !1 }, modelStreaming: "on", … }
```

Konsekvens: **alla `zcode -p`-körningar (en-shot, skript, agentfabriks-barn)
kan aldrig konsolidera minne** — oavsett config. Interaktiva vägar (TUI,
app-servern som studion talar med) låter default `true` gälla. Sekundär-not:
bootstrap-loggradens `memoryRoot` räknas ur config ENBART (rln, 11871140:
`memoryRoot: e.memory?.cliStorageRoot ? ysn(...) : void 0`) — utan taskType-
porten — så en loggrad med memoryRoot + `memoryExtractionEnabled:false`
(fabriksbarnen idag) är inget motsägelse utan två olika grindar.

---

## §2 Konsolideringsflödet — exakt när och hur

### 2.1 Kedjan (alla offsetar = zcode.cjs 3.11.2-24)

```
TUR LYCKAS (succé-grenen; catch-grenen har INGET anrop)
 └─ logg "Turn completed" {event:"turn.completed"}   @11060163
 └─ Uqr(this,{traceContext})  = scheduleProjectMemoryExtraction   @11060163 (ENDA anropet)
     ├─ Grind A (Uqr, def ~11047100, registrerad @11049509):
     │   · inte shuttingDown
     │   · config.memory.extractionEnabled !== false   (headless: false → STOPP)
     │   · XL(config, workspaceRoot) ger en rot   @10899235:
     │       memory.enabled SANN + memory.use !== false + cliStorageRoot finns
     │       + taskType ∈ {undefined, interactive, fork, selection_side_chat,
     │                       workflow_parent}   (t$r @10899323 — subagent-
     │         typer och bakgrunds-executors får INGET projektminne)
     │   · inte remote-workspace + sessionStore + fileSystemPort
     │     + (modelFactory | modelAdapter)
     │   · latestConversationMessageId finns (extraktionsgränsen)
     │   → läs HELA sessionen ur store; klipp vid rewind/branch-fält
     │     (branchCutAfterMessageId, rewindCreated/Kept/Target); gränsfel
     │     → throw "Extraction boundary is missing from the scheduled active branch"
     │   → scheduler ??= jqr(l=>$pi(e,l)); scheduler.schedule(snapshotPromise)
     │
     ├─ Grind B — schemaläggaren (jqr = createMemoryExtractionScheduler,
     │   @11046789): coalescing — pågår en körning ersätts kön med den SENASTE
     │   snapshoten (ingen back-logg); cursor = boundaryMessageId.
     │
     ├─ Grind C — beslutet (Ppi = evaluateMemoryExtraction, ~11044280):
     │   containsDirectMemoryWrite (Npi: Write/Edit mot minnesroten efter
     │   cursor, verktygsdetektor jpi @11046580)  → SKIP "direct-memory-write"
     │   else containsEligibleUserProse (Lpi: minst EN genuine user-post —
     │   role=user, synthetic!==true, visibility!=="model-only" (Bpi-testet,
     │   def ~11047060) — med ≥3 ord (Rpi=3,
     │   @11046680; ordräknare Fpi))            → RUN
     │   else                                      → SKIP "no-user-prose"
     │   SKIP flyttar fram cursorn; besluten LOGGAS EJ (Ppi har ingen
     │   telemetri) — tysta skippar.
     │
     └─ Arbetaren ($pi = executeProjectMemoryExtraction, @11048550, reg
         @11049575; telemetri {executionKind:"background", operation:
         "project_memory_extract", targetKind:"project", trigger:"scheduler"}):
           1. Manifest (EAe): rekursiv .md-listning i roten, frontmatter-preview
              30 rader/fil, mtime-sorterat, tak 200 filer (R7 §5.3).
           2. Prompt (Bqr @11042882 "memory extraction subagent"): "Analyze the
              most recent ~N messages…"; sandlådade verktyg (Read/Grep/Glob/
              read-only Bash + Write/Edit/rm ENBART i minneskatalogen);
              strategi "turn 1 — alla Read parallellt; turn 2 — alla Write/Edit
              parallellt"; "You MUST only use content from the last ~N
              messages… no grepping source files… no git commands"; "If nothing
              is worth saving, output only 'Nothing to save.'".
           3. Loop (b_t): max zpi=5 vändor (@11049488), SAMMA modell som
              sessionen, yolo-executor (auto-godkännande — verktygen är ändå
              sandlådade). Retur: "success" | "aborted" | "error".
         Modellanropet syns i loggen som querySource "project_memory_extract".
AVSTÄNGNING: close() → beginShutdown() → drainMemoryExtractions(6e4)
($qr, timeout Upi=60 000 ms) — pågående extraktion får 60 s att bli klar.
```

### 2.2 Tolkning — "automatiskt" betyder per-tur-efterhandsgranskat

- Ingen timer, ingen storlekströskel, inget cron. **Varje lyckad tur är en
  konsolideringschans** — men de tre grindarna gör att de flesta blir skip:
  autonoma turar (mål-loopens `model-only` input) failar prosa-grinden,
  sessioner där agenten precis skrev minne själv failar dubbelkravnings-grinden
  (by design — huvudagenten har företräde), headless failar grind A.
- Coalescing + cursor betyder: extraktionen bearbetar ALLT sedan senast
  lyckade genomlöpning i ETT svep — kundens kväll med 20 meddelanden ger
  typiskt 1–2 extraktionskörningar (efter sista turen + ev. en efterföljande),
  inte 20.
- Motsatsen till "consolidate"-knapp: det FINNS inget manuell-kommando
  (`/memory extract` finns ej) — enda vägen till manuell konsolidering är att
  skriva minnet själv (huvudagentens Write/Edit, som ju skippar extraktionen).

---

## §3 Vilande vägar (byggda men aldrig körda i 3.11.2-24)

1. **`memory_update`-notisen** — `pendingMemoryUpdate` har exakt 3 träffar
   (11020049 läsning, 11020083 nollställning, 11201141 klassfältdeklaration).
   INGEN kod tilldelar fältet ⇒ notisen emitteras aldrig. Maskineriet är
   färdigt: `xqr` consumePendingProjectMemoryUpdate + `rpi`
   formatProjectMemoryUpdate @11020179 — runtimens EGEN text (enda
   "consolidat"-träffen i bunten):
   > "Background memory consolidation updated your memory directory: <summary>
   > Files changed: <paths> … Your loaded copy of <inContextPaths> is now
   > stale relative to disk — Read it again… This is ambient context — do not
   > narrate it to the user unless they ask…"
   Notisen är ambient (system-reminder-klass, riktad till AGENTEN). Studion
   ska INTE vänta på den (se §6).
2. **`session_memory`-triggern** — enumvärde `zo.SessionMemory="session_memory"`
   (634428) finns i kompakteringsschemat (trigger + summarySource, 636661) och
   mappas i switcharna `die`→phase StandaloneTurn / `AEe`→compactReason
   ContextLimit (10718999/10719208) — men INGEN anropsplats skickar den, och
   `Nke` buildCompactBoundary sätter alltid `summarySource:"model"` (7772190).
   Den enda tilldelaren av summarySource i bunten skriver "model". Vilande.
3. **`memoryDreamLastScanAtMs`** — klassfält init 0 (11201115), aldrig läst
   annorstädes. Reserverad framtids-hook ("minnesdröm" — konsolidering på
   idle?). Bevaka i kommande runtime-versioner.

---

## §4 Levande bevis på servern (2026-09-14)

### 4.1 Loggen (`~/.zcode/cli/log/zcode-*.jsonl`) — extraktionsanrop per dag

| Dag | turn.completed | project_memory_extract (querySource) | Bootstrap true/false |
|---|---:|---:|---|
| 09-10 | 50 | **12 rader / 6 anrop** (22:36–22:38, sess_e607cbc0, cwd "/", rot project-8a5edab) | 81/2 |
| 09-11 | 5 | 0 | 25/1 |
| 09-12 | 43 | 0 | 21/0 |
| 09-13 | 81 | 0 | 103/0 |
| 09-14 | 122 | **0** | **167/64** |

Idag (09-14) fördelade sig 9 630 model.request.completed på querySource:
`main_turn` 38 741, `subagent` 19 238, `session_title` 291,
`goal_summary_title` 64, `web_search_tool` 29 — **noll** extraktioner. De 64
`memoryExtractionEnabled:false`-bootstraparna idag är fabriksbarnen (rot
ak1-b5bd22b); de 167 `true` är studio-sessioner (cwd /home/ak1a/agent/ak1,
rot ak1-80a87d64).

### 4.2 Minnesrötterna (filer exkl. .minnes-backup)

| Rot | Filer | Senaste mtime | Tolkning |
|---|---:|---|---|
| ak1-80a87d64… (studio) | 5 | **2026-09-10 22:26:26** | fruset sedan 09-10 (R7:s kundprofil/projektstatus/juridik/styrelseregler) |
| ak1-b5bd22b… (repot/fabriken) | **0** | — | ALDRIG skrivet — barnen är headless (§1.3) |
| project-8a5edab… (workspaceIdentity-läge) | 3 | 2026-09-10 22:38:33 | matchar extraktionerna 22:36–22:38 |
| ak1nvestor.com-6a90… / default-d316… | 6 / 8 | 09-09 / 09-10 | äldre ytor (panelen läser fortfarande default-rot, R7 §7.2) |

### 4.3 Agentfabriken

`verktyg/agentfabrik.mjs:131`: `spawn(ZCODE, ["-p", …])` — ALLA fabriksbarn
är headless ⇒ **fabriksvågornas kunskap kan aldrig hamna i projektminnet av
sig självt**. Detta är ingen bug i fabriken utan runtimens design (en-shot
skall inte skriva projektminne). Fabriksvärde som ska MINNAS måste huvud-
agenten (eller fabriksmanifestens prompter via huvudspåret) skriva själv —
eller så flyttas leveransbevisen dit, som denna rapport gör i data/-trädet.

---

## §5 Varför har studion inte konsoliderat sedan 09-10? (ANALYS)

Fakta: studio-sessioner med `memoryExtractionEnabled:true` + rot + 251
avslutade turer (09-11→14) gav 0 extraktionsanrop. Inga Write/Edit mot
minnesroten loggade (direct-memory-write-grinden kan alltså inte förklara
det). Kvar — i fallen ordning — som troligaste orsaker:

1. **Prosa-grinden** (mest trolig): studion kör långa autonoma segment
   (mål-loop v91+, evighetsmotorn v147). Målfortsättnings-turar har input
   `visibility:"model-only"` + `synthetic` (M1 §2) → Bpi-testet failar →
   skip "no-user-prose". Kundens egna meddelanden mellan vågorna är ofta
   korta ("ok", "fortsätt") — under 3 ord (Rpi=3) → samma skip.
2. **Cursor + coalescing**: om en tidig snapshot med prose körde men
   resultatet blev "Nothing to save." (modellen bedömde att inget var värt
   att spara — 09-10-körningarnas finishReason var tool-calls, dvs. den
   skrev; senare kvällar kan den ha svarat Nothing) flyttas cursorn och
   efterföljande autonoma turer without prose skippar tyst.
3. Skippen loggas aldrig (Ppi saknar telemetri) — ovan är därför välgrundad
   slutledning ur kod + loggstatistik, inte direkt observation.

Konsekvens för studion: **"Minnet senast uppdaterat 09-10" är runtimens
korrekta beteende, inte ett panel-fel** — men panelen måste förklara det
(§6), annars ser kunden ett "trasigt" minne.

---

## §6 Studions min-panel — hur konsolideringar ska visas

Panelen idag (R7 §8): route `src/app/api/studio/minne/route.ts` + komponent
`studio-minne-panel.tsx`, roten HÅRDKODAD till default-d316 (R7 §9.1 fix
gäller fortfarande: beräkna roten ur studioArbetsyta()). M4 tillför
**konsolideringsvyn** med DAGENS build som mål — inga framtida event krävs:

1. **Header-rad "Senast konsoliderad".** Data: `max(mtime)` över *.md i den
   RÄTTA roten (exkl. .minnes-backup). Text: "Minnet senast uppdaterat: X"
   + smiling subrad: "Bakgrundskonsolideringen kör automatiskt efter svar
   med minnesvärt innehåll." — sänker tröskeln mot §5-misstolkningen.
2. **Konsolideringshistorik ur LOGGEN (den enda kördata som finns).**
   API:t körs på samma server: scanna `~/.zcode/cli/log/zcode-2026-*.jsonl`
   (gå baklänges, tak t.ex. 7 dagar) efter `"querySource":"project_memory_
   extract"`; gruppera per anrop: tid, modell, finishReason, toolCallCount
   + kopppla filer via mtime-batch (filer med mtime inom samma sekund =
   extraktorns "turn 2 — alla Write parallellt"-signatur, bevisad 09-10
   22:26:26 och 22:38:33). Kort per händelse: "22:38 — konsoliderade 2 filer
   (projektstatus.md, kundprofil.md)". Cap: senaste 10.
3. **Förklaringskort när historiken är tom** (fallet JUST NU): "Inga
   automatiska konsolideringar på N dagar. Det är normalt när agenten kör
   autonomt (modell-interna turar räknas inte) eller skriver minnet själv."
   Ärlig pedagogik — samma princip som M2:s tröskelmarkör.
4. **Indexbudget-mätare**: MEMORY.md mot 200 rader/25 000 tecken
   (`Glt`/`qre` — de ÄKTA taken; summaryMaxBytes 8192 är död och ska visas
   som "reserverad framtida nyckel" om den visas alls). Varningstexten finns
   färdig i bundlen ("Only part of it was loaded. Keep index entries to one
   line under ~200 chars…") — spegla den.
5. **Rot-växlaren** (R7 §9.1) + per rot: filantal, senaste mtime, och
   **aktivitetsflaggan ur loggen**: "extraktion PÅ/AV" = senaste bootstrap-
   radens `memoryExtractionEnabled` för sessioner med den roten. Repots rot
   ska märkas "fabriksbarn — headless, konsoliderar aldrig" (§1.3) så ingen
   undrar varför den är tom.
6. **Ej bygga på vilande event**: `memory_update`-kort (filnivå "ändrade: X")
   och `relevant_memory`-indikator har ingen datakälla i 3.11.2-24 (§3 +
   R7 §6) — förbered ytan men driv den av mtime+logg tills runtimen aktiverar
   fälten (känn igen `memory_update` i eventströmmen och slå om automatiskt).
7. **ALDRIG egen extraktion i studion.** Runtimen äger konsolideringen
   (samma princip som M1 §5.10: spegla, härma aldrig). Skulle studion vilja
   tvinga fram en konsolidering är den korrekta vägen en interactive session
   via app-servern med en prosa-prompt — inte ett eget subagent-bygge.

---

## §7 Funktionskarta (minifierat → funktion → offset i zcode.cjs 3.11.2-24)

| Symbol | Funktion | Offset |
|---|---|---:|
| `Uqr` | scheduleProjectMemoryExtraction — def / **ENDA anropet** (turn.completed-succé) | ~11047100 / **11060163** |
| `jqr` | createMemoryExtractionScheduler (coalescing + cursor) | 11046789 |
| `Ppi` | evaluateMemoryExtraction (run/skip) — OLOGGAD | ~11044280 |
| `Npi` | containsDirectMemoryWrite (Write/Edit i roten; reason-sträng @11044465, detektor `jpi` @11046580) | ~11046700 (reg) |
| `Lpi` | containsEligibleUserProse (genuine user ≥3 ord, `Bpi`-testet, `Rpi=3` @11046680, `Fpi` ordräknare) | ~11044500 |
| `$pi` | executeProjectMemoryExtraction (arbetaren) | 11048550 |
| `zpi`/`Upi` | 5 vändor / 60 000 ms drain-timeout | 11049488 |
| `$qr` | drainMemoryExtractions (Promise.race-timeout; anrop i close() `6e4`) | 11047650 / 11856399 |
| `Bqr` | buildMemoryExtractionPrompt ("memory extraction subagent" @11042882, "Nothing to save." @11043959) | 11042882 |
| `EAe` | manifestbyggaren (30 rader/fil, tak 200) | se R7 §10 |
| `XL`/`t$r` | resolveEnabledProjectMemoryRoot / isMainMemoryTaskType | 10899235 / 10899323 |
| `xqr`/`rpi` | consumePendingProjectMemoryUpdate / formatProjectMemoryUpdate (**vilande**) | 11019990 / 11020179 |
| (fält) | pendingMemoryUpdate ×3 / memoryDreamLastScanAtMs | 11020049+11020083+11201141 / 11201115 |
| (config) | runtimeConfig-memory-byggaren (endast enabled/extractionEnabled/use/…) | 11869926 |
| `rln` | config→flaggöversättning (loggradens memoryRoot/memoryUse/memoryExtractionEnabled) | 11871140 |
| `gkt` | headless --prompt-startvägen — `memory:{extractionEnabled:!1}` | 12571213 |
| `Glt`/`qre` | indexbudget 200 rader / 25 000 tecken | 7747810 |
| `zo.SessionMemory`/`die`/`AEe`/`Nke` | komprimeringstrigger session_memory (vilande: schema+switchar, ingen avsändare; summarySource alltid "model") | 634428 / 10718999 / 10719208 / 7772190 |
| `Yre`/`WUo`/`mSe` | rot+hash / slug / auto-tillåt Write-Edit i roten | se R7 §10 |

## §8 Metod & reproducerbarhet

Bundle `zcode.cjs` 12 632 838 byte (app 3.11.2-24, låst av
zcode-runtime.lock.json). Sonder: `node -e` med `indexOf` + skivning (minnes-
vänligt; aldrig cat hela bunten). Nyckelgrepp: träffRÄKNING per fil för att
skilja döda nycklar (0 i runtimen, 1 vardera i mallarna) från levande;
anropsplatsanalys (`Uqr(` → def + ett enda anrop i succé-grenen); live-logg-
statistik (querySource-fördelning per dag) som motbevis/högbevis. Loggkällor:
`~/.zcode/cli/log/zcode-2026-09-{10..14}.jsonl` (82 359 rader idag).
Konfigurationskällor: `bin/zcode.js`, `config.example.json`, TUI-dist,
`~/.zcode/cli/config.json` (endast minnesnycklarna läst — API-nycklar orörda,
R2). Fabriksbevis: `verktyg/agentfabrik.mjs:131`.

*Pedagogisk plattform — inte investeringsråd.*
