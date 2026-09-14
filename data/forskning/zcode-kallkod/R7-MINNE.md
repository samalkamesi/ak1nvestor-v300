# R7 — MINNESSYSTEMET (persistent agent memory i zcode-runtimen)

Forskningsrapport 7 av källkodskartläggningen. Källa: den INSTALLERADE
runtimes `vendor/zcode.cjs` (13 MB bundle, cliVersion 0.16.5, app 3.11.2)
i `/home/ak1a/.npm-global/lib/node_modules/zcode-app-cli/` + den levande
strukturen under `~/.zcode/cli/memories/` + CLI-källan i
`/home/ak1a/forskning/zcode-cli`. Alla funktioner nedan är de-minifierade
och verifierade mot bunten; minifierade namn (Yre, Uqr, $pi …) anges för
spårbarhet. Syfte: förstå hur runtime konsoliderar minne automatiskt och
vad studions min-panel (p6-leveransen, våg 84 D) bör spegla.

> **VERIFIKATIONSPASS 2 (2026-09-14, oberoende omgång — rättar tre fel):**
> (1) Rot-attributionerna i §2.1/§7 var omkastade: sha256-bevis +
> runtime-logg (bootstrap `runtime_config.completed` 2026-09-12:
> workingDirectory `/home/ak1a/agent/ak1` → memoryRoot `ak1-80a87d64…`)
> visar att **`ak1-80a87d64` = STUDIOTS levande rot** och
> `ak1-b5bd22b` = repot `/home/ak1a/AK1` (fabriksagenter). (2) §5.4:
> `pendingMemoryUpdate` tilldelas ALDRIG i build 3.11.2-24 (3 träffar i
> bunten: deklaration, läsning, nollställning) — `memory_update`-notisen
> är VILANDE, se rättelsen. (3) §6: recall-grenen "semantic-recall" är
> kompilerad men AVSTÄNGD — modulkonstanten `sR=CUo(!1)` är hårdkodad
> till `"default-index"` och BÅDE prefetchen (`u7r`) och konsumenten
> (`l7r(this,sR)`) returnerar direkt om läget ≠ "semantic-recall".
> Aktiv återkallning = MEMORY.md-indexet i systemprompten (§4).

---

## 1. Sammanfattning (TL;DR)

- Minnet är en **filkatalog per projekt**: `~/.zcode/cli/memories/
  projects/<slug>-<sha256-16hex>/memory/` med `MEMORY.md`-index + faktafiler
  med frontmatter. Ingen databas, inga API:er — bara filer.
- **Två motorer**: (1) EXTRAKTION — efter varje avslutad vända (`turn.completed`)
  kör runtime en dold "memory extraction subagent" (samma modell, max 5 vändor,
  endast Write/Edit/rm i minneskatalogen) som uppdaterar minnet från det senaste
  sagda; (2) RECALL — **maskineri för "semantic-recall" är kompilerat men
  AVSTÄNGT** i build 3.11.2-24 (`sR=CUo(!1)` hårdkodat): aktiv återkallning
  sker via MEMORY.md-indexet i systemprompten + agentens egna Read-anrop
  (verifierat i pass 2; detaljer §6).
- **Konfigurationsnycklarna `write`, `autoConsolidate`, `summaryMaxBytes`
  konsumeras INTE av denna runtime-build** (strängarna finns ej i bunten).
  Verkliga reglage: `features.memory` + `memory.use` (båda `true` på servern) samt
  internt `memory.extractionEnabled`. Runtimens egna hårdkoda budgetar gäller
  (se §3.3).
- **Studiens p6-panel pinar fel projektrot** (`default-d3164043df3fd3bb`) —
  runtimes väljer katalog per arbetsyta; servern har 5 st. Panelen bör spegla
  hela projekträdet (§9).
- **Bug-risk hittad**: studio-backupper i `.minnes-backup/` ligger INUTI
  minnesroten och läcker in i runtimens manifest (ingen dotkatalogsfilter i
  fil-listningen) — de kan alltså återkallas som "minnen" (§7.3).

---

## 2. Minnesroten och projektmappningen

`resolveProjectMemoryRoot` (minifierad `Yre`, `zcode.cjs` ~offset 7 780 199):

```js
// förkortat ur bunten
function resolveProjectMemoryRoot({cliStorageRoot, workspaceIdentity, workspacePath}) {
  const identity = workspaceIdentity?.trim();
  const resolved = path.resolve(workspacePath);
  const key = identity || (process.platform === "win32" ? resolved.toLowerCase() : resolved);
  const hash = crypto.createHash("sha256").update(key).digest("hex").slice(0, 16);
  const slug  = identity ? "project" : sanitizeProjectSlug(path.basename(resolved) || "project");
  return path.join(cliStorageRoot, "memories", "projects", `${slug}-${hash}`, "memory");
}
```

- `sanitizeProjectSlug` (`WUo`): gemener, `[^a-z0-9._-]` → `-`, max 48 tecken,
  fallback `"project"`.
- Utan workspaceIdentity = katalognamnet på arbetsytan + hash av hela sökvägen;
  med identity = bokstavligt `project-<hash-av-identity>` (desktop-/app-server-läge).

**Aktiveringsporten** `resolveEnabledProjectMemoryRoot` (`XL`): minnet är PÅ bara
om `memory.enabled !== false && memory.use !== false && memory.cliStorageRoot`
finns OCH tasktypen är huvudspåret (`interactive | fork | selection_side_chat |
workflow_parent | undefined`) OCH workspacet inte är remote. Subagenter och
bakgrunds-executors får alltså INTE eget projektminne via denna väg.

### 2.1 Serverns levande träd (verifierat 2026-09-14, hash-bevisade attributioner)

```
~/.zcode/cli/memories/projects/
├── ak1-80a87d64ac98991b/memory/        ← /home/ak1a/agent/ak1 = STUDIOTS
│   arbetsyta (studioArbetsyta()) — LEVANDE studio-minne
│   MEMORY.md + kundprofil.md + projektstatus.md + juridik.md + styrelseregler.md
│   (sha256("/home/ak1a/agent/ak1")[0:16] = 80a87d64ac98991b ✓; loggbevis §7.1)
├── ak1-b5bd22b38c8cc801/memory/        ← /home/ak1a/AK1 = repot (fabriks-
│   agenter); skapat 2026-09-14 03:45 vid sessionsinit, TOMT ännu
│   (sha256("/home/ak1a/AK1")[0:16] = b5bd22b38c8cc801 ✓)
├── ak1nvestor.com-6a904021b3b74c30/memory/   (äldre yta, 6 filer)
├── default-d3164043df3fd3bb/memory/    ← p6-panelens hårdkodade rot —
│   FRÄMMANDE äldre rot (engelska minnen 2026-09-09/10)
│   MEMORY.md + 7 faktafiler + .minnes-backup/ (studio-backupper, våg 84)
└── project-8a5edab282632443/memory/    (workspaceIdentity-läget)
```

Exempel på index (`ak1-…/MEMORY.md`, handskrivet av agent):

```
# Memory Index

- [Kundprofil](kundprofil.md) — svensk, telefon-forst, full autonomi, alltid svenska svar
- [Projektstatus](projektstatus.md) — Contabo ar datorn, vag 90-93 lever, /studio = huvudyta
- [Juridik](juridik.md) — ALDRIG investeringsrad (2007:528), lagrum att halla isar
- [Styrelseregler](styrelseregler.md) — R1-R4 permanenta, PIPELINE-KO = dispatchlista
```

Exempel på faktafil (`kundprofil.md`): frontmatter `name`/`description`/
`metadata.type: user`, kropp med [[wikilänkar]] till syskonminnen — exakt det
format minnesinstruktionerna kräver (types user/feedback/project/reference,
`**Why:**`/`**How to apply:**` för feedback, indexrad ≤ ~150 tecken, aldrig
minnesinnehåll i MEMORY.md).

---

## 3. Konfiguration — vad som styrs (och vad som INTE styrs)

### 3.1 Config-flödet

`~/.zcode/cli/config.json` (skriven av CLI:s mall `config.example.json`) →
runtime läser den och synkar in i sin settings-store. Mapping (ur bunten,
`MemoryUse: "memory.use"`, `FeatureMemory: "features.memory"`):

| config.json-nyckel | runtime-settings | Default i bunten | På servern |
|---|---|---|---|
| `features.memory` | `FeatureMemory` | `true` | `true` |
| `memory.use` | `MemoryUse` | `true` | `true` |
| `memory.write` | — **läses ej** | `true` (mall) | `true` |
| `memory.autoConsolidate` | — **läses ej** | `true` (mall) | `true` |
| `memory.summaryMaxBytes` | — **läses ej** | `8192` (mall) | `8192` |

Internt (app-server-protokollet/runtimeConfig) finns dessutom
`memory.{enabled, extractionEnabled, use, cliStorageRoot, workspaceIdentity}`
— `extractionEnabled === false` stänger av extraktionen men behåller
systemprompt-minnet (porten i `Uqr`, se §5.1). Nätverks-testet i CLI-repot
(`test/runtime/network-retry.test.ts`) bekräftar schemat.

### 3.2 Slutsats om config

I runtime 0.16.5 är `write/autoConsolidate/summaryMaxBytes` **reserverade
nycklar** — de finns i CLI-mallen (bin/zcode.js + @zcode/tui/dist/index.js,
rad ~75) men ingen kodsträng i `zcode.cjs` läser dem. Man SKA alltså inte
tro att `summaryMaxBytes: 8192` styr indexstorleken — det gör det inte i
denna build. De verkliga budgetarna är hårdkodade (nedan). (Möjlig förklaring:
nycklarna tillhör ett nyare/desktop-schema; lås filen `zcode-runtime.lock.json`
→ 3.11.2/linux-x64.)

### 3.3 Runtimes verkliga budgetar (ur bunten)

| Konstant | Värde | Betydelse |
|---|---|---|
| `Glt` | 200 | MEMORY.md-index max 200 RADER vid inläsning |
| `qre` | 25 000 | index max 25 000 TECKEN vid inläsning |
| `pdi` | 61 440 | recall max ~60 kB innehåll per SESSION (`recalledContentCharacters`) |
| (selector) | 5 | max antal minnesfiler per recall ("up to 5") |
| (selector) | 256 | selector-modellens `maxOutputTokens` |
| `edi` | 30 | rader per fil som läses in i MANIFESTET (frontmatter/preview) |
| (läsning) | 200 rader / 4 096 byte | trunkering per återkallad minnesfil (`ldi`/`cdi`) |
| `Xci` | 200 | max filer i manifestet (nyaste först, mtime-sorterat) |
| `zpi` | 5 | extraktionsagentens max antal vändor |
| `Upi` | 60 000 ms | drain-timeout vid avstängning (`drainMemoryExtractions(6e4)`) |
| `Rpi` | 3 ord | minsta "genuin användarprosa" för att extraktion ska köras |

---

## 4. Minnet i systemprompten (inläsning vid sessionstart)

`buildPersistentAgentMemoryPrompt` (`FUr`): sektionen `# Persistent Agent
Memory` injiceras i systemprompten med `<MEMORY_ROOT>/` ersatt till den
verkliga sökvägen + `<SCOPE_GUIDANCE>` per scope (`mci`):

- user: "keep learnings general since they apply across all projects"
- project: "shared with your team via version control, tailor to this project"
- local: "not checked into version control, tailor to this project and machine"

**Verifikationspass 2-precisering**: `# Persistent Agent Memory` (FUr) är
prompten för NAMNGIVNA AGENTPROFILERS egna minnen (scopes ovan; rötter
`<storageRoot>/agent-memory/<agent>`, `<ws>/.zcode/agent-memory/<agent>`,
`<ws>/.zcode/agent-memory-local/<agent>` — aktiveras av
`memory.enabled && memory.use && storageRoot` via `UUr`/`_ci`). HUVUDAGENTENS
projektminne får i stället sektionen **`# Memory`** (`Klt`/`TUo`): rot-sökvägen
("This directory already exists — write to it directly"), frontmattermallen
(name/description/metadata.type), [[wikilänk]]-regeln,
typdefinitionerna user/feedback/project/reference, "uppdatera före dubblett /
radera fel minnen / spara inte det repot vet"-reglerna och (default-index-läget)
påminnelsen att `MEMORY.md` är indexet som laddas varje session.

Därpå följer `## MEMORY.md` + indexets innehåll. Indexet passerar
`formatProjectMemoryIndexContent` (`Ike`→`Hlt`): frontmatter strippas
(regex `^---\s*\n…---\s*\n`), HTML-kommentarer bort, trunkeras vid 200 rader
/25 000 tecken och får då en inbäddad varning i själva texten:

> `> WARNING: MEMORY.md is 25.0KB (limit: 24.4KB) — index entries are too
> long. Only part of it was loaded. Keep index entries to one line under
> ~200 chars; move detail into topic files.`

Huvudagenten kan ALLTID skriva minnet direkt (Write/Edit med sökväg i
minnesroten — det är så denna rapports session sparar minnen), och
instruktionerna säger: uppdatera befintlig fil hellre än dubblett, radera
minnen som visade sig fel, spara inte det repot redan registrerar.

---

## 5. Automatisk konsolidering — EXTRAKTIONSFLÖDET

Så här hamnar minne i katalogen "av sig självt" (allt ur bunten):

### 5.1 Triggern

I `turn.completed`-hanteraren (runtime-kärnan) anropas
`scheduleProjectMemoryExtraction` (`Uqr`) efter VARJE avslutad vända:

```js
// förkortat
function scheduleProjectMemoryExtraction(e, t) {
  if (e.shuttingDown || e.config.memory?.extractionEnabled === false) return;
  const root = resolveEnabledProjectMemoryRoot(e.config, e.workspaceRoot);
  if (!root || e.isRemoteWorkspace() || !e.sessionStore || …) return;
  // läs hela sessionen ur sessionStore, respektera rewind/branch:
  //   branchCutAfterMessageId, rewindCreatedMessageId, rewindKeptMessageIds, rewindTargetMessageId
  // klipp durable messages vid senaste conversationMessageId (= extraktionsgränsen)
  … e.memoryExtractionScheduler ??= createMemoryExtractionScheduler(l => executeProjectMemoryExtraction(e, l));
  … scheduler.schedule(snapshot);
}
```

Viktig detalj: **rewind/branch respekteras** — tillbakadragna meddelanden
extraheras inte (sessionens `revert`-fält matas in före snittet).

### 5.2 Schemaläggaren (debounce + cursor)

`createMemoryExtractionScheduler` (`jqr`) håller en **cursor**
(`boundaryMessageId` = senast bearbetade meddelande):

1. Ny snapshot köar; pågår redan en körning ersätts kön med den SENASTE
   (coalescing — ingen back-logg byggs).
2. Portfunktionen `evaluateMemoryExtraction` (`Ppi`) avgör per snapshot:

```js
function evaluateMemoryExtraction(e, cursor) {
  const messageCount = countMessagesAfterCursor(e.durableMessages, cursor);
  return containsDirectMemoryWrite(e, cursor)     // Npi
    ? { decision: "skip", reason: "direct-memory-write" }
    : containsEligibleUserProse(e.durableMessages, cursor)   // Lpi
      ? { decision: "run", messageCount }
      : { decision: "skip", reason: "no-user-prose" };
}
```

- `containsDirectMemoryWrite` (`Npi`): har AGENTEN efter cursorn gjort
  Write/Edit vars `file_path` ligger i minnesroten (path-check `hR`; kataloger
  som `.git`, `node_modules`, `.vscode` m.fl. räknas aldrig som minne) →
  **SKIP**: huvudagenten skötte minnet själv den vändan, ingen dubbelkörning.
- `containsEligibleUserProse` (`Lpi`): bland meddelanden efter cursorn finns
  en GENUIN användarpost (`role=user`, inte `synthetic`, inte `model-only`)
  med en textdel om ≥ 3 ord (`Rpi=3`) → kör. Korta "ok"/"fortsätt" triggar
  alltså ingen extraktion.
- Skip flyttar fram cursorn; först vid `success`/`no-op` från arbetaren
  flyttas cursern efter en körning.

### 5.3 Arbetaren — "memory extraction subagent"

`executeProjectMemoryExtraction` (`$pi`), telemetri
`operation: "project_memory_extract", executionKind: "background",
trigger: "scheduler"`:

1. **Manifest** (`EAe`): rekursiv listning av minnesroten; tar `.md`-filer
   (ej `MEMORY.md`), läser första 30 raderna per fil för frontmatter
   (`description`, `type`), sorterar mtime nyast först, max 200 filer.
2. **Prompt** (`buildMemoryExtractionPrompt`, `Bqr`) — kärncitat ur bunten:

   > "You are now acting as the memory extraction subagent. Analyze the most
   > recent ~N messages above and use them to update your persistent memory
   > systems."
   >
   > "Available tools: Read, Grep, Glob, read-only Bash (ls/find/cat/stat/wc/
   > head/tail and similar), and Edit/Write for paths inside the memory
   > directory only, and Bash rm with paths inside the memory directory only.
   > All other tools — MCP, Agent, write-capable Bash, etc — will be denied."
   >
   > "You have a limited turn budget. … the efficient strategy is: turn 1 —
   > issue all Read calls in parallel for every file you might update; turn 2 —
   > issue all Write/Edit calls in parallel."
   >
   > "You MUST only use content from the last ~N messages … no grepping source
   > files, no reading code to confirm a pattern exists, no git commands."
   >
   > "If nothing is worth saving, output only 'Nothing to save.'"
   >
   > "If the user explicitly asks you to remember something, save it
   > immediately … If they ask you to forget something, find and remove the
   > relevant entry."

   + manifestlistan (`- [type] filnamn (ISO-tid): description`) med
   "Check this list before writing — update an existing file rather than
   creating a duplicate."
3. **Meddelanden** (`S_t`): sessionens **providerEntries** (den riktiga
   konversationen, med cache-control) + prompten som user-roll. Minnesagenten
   ser alltså HELA den avslutade vändan i sitt kontextfönster.
4. **Executor** (`I_t`): full verktygsexecutor i **"yolo"-läge**
   (`getMode: () => "yolo"` — auto-godkännande, lämpligt eftersom
   verktygen ändå är sandlådade till minneskatalogen), `runtimeScope: "main"`,
   samma modellfabrik/anslutning som sessionen, `readFileState` klonas från
   snapshot (Edit kräver sparad Read-state — därav "Read först"-strategin).
5. **Loop** (`b_t`): max **5 vändor** (`zpi`), samma modell som huvudsessionen
   (`snapshot.model`). Returvärde: `"success" | "aborted" | "error"`.

### 5.4 Konsolideringsnotisen — `memory_update` (VILANDE i 3.11.2-24)

**Verifikationspass 2 (rättelse):** originalrapporten hävdade att
filändringar "upptäcks (watchers/paths) och sätts som pendingMemoryUpdate".
Det stämmer INTE i denna build: `pendingMemoryUpdate` har exakt 3 träffar i
bunten — fältdeklarationen, läsningen i `consumePendingProjectMemoryUpdate`
(`xqr`) och nollställningen. **Ingen kod tilldelar fältet**, så notisen
emitteras aldrig. Maskineriet är dock helt byggt och anropas vid varje
turbörjan (`p = t ? void 0 : xqr(this)`); formatet (`rpi`) är:

> "Background memory consolidation updated your memory directory: <summary>
> Files changed: <paths>
> Your loaded copy of <inContextPaths> is now stale relative to disk — Read
> it again if you need current contents.
> This is ambient context — do not narrate it to the user unless they ask or
> it is directly relevant to their request."

`memory_update` tillhör protokollets **ambienta event-klass** (system-
reminder-typ, visas ej som chattflöde) — notisen riktar sig till AGENTEN,
inte till användaren. Konsekvens för studion: i DAGENS build är
**max(mtime) i minnesroten** den enda "senast konsoliderade"-signalen (se
§9.2); event-kortet blir aktuellt först när en framtida runtime börjar
tilldela `pendingMemoryUpdate`.

---

## 6. Återkallning — RECALL-FLÖDET (maskineri beskrivet; grenen är AVSTÄNGD i 3.11.2-24)

**Verifikationspass 2 (rättelse):** originalrapporten beskrev flödet nedan
som aktivt ("vid varje ny tur väljer en liten modell upp till 5
minnesfiler … läses in som `relevant_memory`"). Det är **kompilerat men
aldrig valt**: modulkonstanten `sR = CUo(!1)` är hårdkodad till
`"default-index"` (`resolveProjectMemoryRetrievalBranch`), och både
prefetchen (`u7r`: `if (r !== "semantic-recall" || …) return`) och
konsumenten (turloopen: `l7r(this, sR)` med samma guard) kortsluter.
**Inga `relevant_memory`-event och inga selector-anrop körs i denna
build.** Den AKTIVA återkallningen är default-index-grenen (§4): MEMORY.md
läses vid sessionens start in i systempromptens Memory-sektion och
huvudagenten väljer själv minnesfiler med Read-verktyget (skrivarighet
utan tillståndsdialog — `mSe` tvingar allow för Write/Edit på `.md` i
minnesroten i varje permission-läge, `ruleId: "memory.file.markdown"`).

Flödet nedan är korrekt dokumenterat för framtida builds (samt som
förklaring av varför minnesfilernas description/type måste hållas korrekt
— manifestet (`EAe`) bygs och indexeras oavsett gren):

1. **Frågeport** (`Jgt`): senaste användarfrågan måste innehålla whitespace
   (dvs vara faktisk text) — annars ingen recall.
2. **Sessionstak**: state `{recalledPaths, recalledContentCharacters}`;
   ny recall bara medan `recalledContentCharacters < 61 440` tecken; redan
   återkallade filer hoppas över (`hasRecalledEveryManifestEntry`).
3. **Prefetch i bakgrunden** i turstart (`startProjectMemoryRecallPrefetch`,
   `u7r`) — resultatet konsumeras när det hunnit settle:a
   (`consumeSettledProjectMemoryRecall`, `l7r`), annars kastas det.
4. **Selector-anropet** (`Ygt`/`r7r`): LITEN modell (`config.liteModelRef ??
   defaultModelRef` — vår config: `zai/glm-5.3`) får:
   - systemprompt `idi`: "You are selecting memories that will be useful …
     Return a list of filenames … (**up to 5**). Only include memories that
     you are certain will be helpful … If unsure, do not include … Be
     especially conservative with user-profile and project-overview memories
     ([user], [project]…)"
   - user-meddelande: manifestlistan + "Select memories relevant to:
     <frågan>"
   - **JSON-schema-svar** `selected_memories` (structured output,
     `maxOutputTokens: 256`).
5. **Urval + läsning** (`RAe` matchar filnamn mot manifest minus redan
   återkallade/färska i `readFileState`; `Qgt`/`ldi` läser filerna):
   per fil max 200 rader och 4 096 byte — trunkering markeras med
   "> This memory file was truncated (4096 byte limit / first 200 lines).
   Use the Read tool to view the complete file at: <path>".
6. **Injektion**: formatterat (`Xgt`) som
   "Retrieved for possible relevance — use only if it actually applies to
   what the user asked." + filens header + innehåll →
   **`relevant_memory`-event** i meddelandehistoriken (samma ambienta
   system-reminder-klass som `memory_update`). `readFileState` uppdateras
   så Edit-verktyget ser filen som "redan läst".
7. Vid rewind/session reset: `resetProjectMemoryRecall` (`OAe`) nollställer
   recall-state (men `recalledPaths` minns sessionen ut).

**`memoryDreamLastScanAtMs`** finns som runtime-fält (init 0) men ingen
dream-logik implementerad ännu — reserverad framtks-hook, värd att bevaka i
kommande runtime-versioner.

---

## 7. Serverobservationer (viktiga för studion)

### 7.1 Fem projektrötter = fem "hjärnor" (rättad i pass 2)

Runtime plockar katalog per arbetsyta (hash av sökväg/identity).
**Studiots sessioner (cwd `/home/ak1a/agent/ak1`) minner i
`ak1-80a87d64ac98991b`** — det BEFOLKADE minnet (kundprofil, projektstatus,
juridik, styrelseregler). Beviskedja 2026-09-10: alla 5 filer skrevs i EN
parallel batch 22:26:26 CEST (mtime-signatur: 5 skrivningar inom 18 ms —
antingen extraktorns "turn 2 — issue all Write/Edit calls in parallel"
eller huvudagentens egen Write-batch), och loggen visar därefter 6 logiska
`project_memory_extract`-modellanrop 22:36–22:38 CEST (12 rader =
generate.completed+request.completed-par) — extraktorn KÖR alltså i
studiots rot. Loggbevis för rotkopplingen: `zcode-2026-09-12.jsonl`
bootstrap-rader med `memoryRoot: …ak1-80a87d64…` +
`workingDirectory: /home/ak1a/agent/ak1` + `memoryUse: true` +
`memoryExtractionEnabled: true`.
**Repots rot `/home/ak1a/AK1` → `ak1-b5bd22b38c8cc801`** skapades
2026-09-14 03:45 av fabriksagenternas sessioner och är fortfarande TOM
(research-uppgifter har inte (än) gett extraktorn något värt att spara).

### 7.2 Panelen läser en tredje, främmande rot (rättad i pass 2)

Slutsatsen "studion glömmer det terminalen vet" byggde på omkastade
attributioner och stämmer inte: studion HAR det befolkade minnet
(`ak1-80a87d64`). Det verkliga gapet är att **min-panelen hardkodat läser
`default-d3164043df3fd3bb`** (route.ts `CONTABO_MINNE_ROT`, rad 67) — en
äldre rot med engelska minnen som varken studio- eller fabriks-agenterna
använder. Kunden ser alltså minnen agenten ALDRIG läser, och redigerar
dem utan effekt. Fix: beräkna roten ur `studioArbetsyta()` (slug +
sha16-hash) — se §9.1.

### 7.3 `.minnes-backup/` läcker in i manifestet

`X$r` (manifest-listningen) rekursiverar ALLA underkataloger utan filter för
dolda kataloger; `J$r` accepterar alla `.md`-filer utom `MEMORY.md`. Studions
p6-backupper (`…/memory/.minnes-backup/20260910-…-vag84d.md`) ligger alltså
INUTI minnesroten och kommer med i manifestet (mtime-sorterat, tak 200) —
selector-modellen kan välja en BACKUP som "relevant minne" och
extraktionsagenten ser den som befintlig fil att "uppdatera". **Rekommendation:
flytta backuppna till syslonkatalog utanför `memory/`** (t.ex.
`…/projects/<id>/minnes-backup/`) vid nästa panel-iteration.

### 7.4 Config på servern

`~/.zcode/cli/config.json`: `features.memory: true`, `memory: {use: true,
write: true, autoConsolidate: true, summaryMaxBytes: 8192}` — minnet är helt
PÅ; enbart `features.memory` + `memory.use` har effekt i denna build (§3).
(API-nycklar i samma fil berörs ej av denna rapport och SKA ej kopieras.)

---

## 8. Studions min-panel (p6-leveransen) — läge idag

Leverans våg 84 D (STUDIO 100x byggblock D), verifierad i koden:

- **API** `src/app/api/studio/minne/route.ts` (505 rader): GET (lista med
  preview ≤ 8 kB + detalj `?namn=`), PUT (skriv/skapa), DELETE (backup till
  `.minnes-backup/` FÖRST, sedan radering; MEMORY.md spärrad). Namnvalidering
  `^[a-z0-9][a-z0-9\-]*\.md$` + specialnamnen MEMORY.md/AGENTS.md.
- **Panel** `src/components/ak1a/studio-minne-panel.tsx` (572 rader): drawer i
  studio-chat, LISTA (namn + frontmatter-beskrivning + tid; MEMORY.md märkt
  INDEX, AGENTS.md märkt AGENTS.MD), DETALJ (markdown utan frontmatter +
  REDIGERA + RADERA), NY (mall med frontmatter). AGENTS.md = "arbetsytans
  stående instruktioner" med Skapa-ruta.
- **Rot: HÅRDKODAD** `default-d3164043df3fd3bb` (const `CONTABO_MINNE_ROT`
  + fallback via sökvägsmatchning) — dvs EJ den rot studio-sessionen själv
  använder (`ak1-80a87d64ac98991b`, rättat i pass 2), och de övriga
  projekten syns inte.

---

## 9. Vad panelen bör spegla (rekommendationer, sorterade)

1. **Projektväxlare + RÄTT ROT (viktigast).** Default-vyn ska vara den rot
   som studio-sessionerna faktiskt använder: `ak1-80a87d64ac98991b` =
   `studioArbetsyta()` (`/home/ak1a/agent/ak1`) — beräkna dynamiskt med
   samma hashregel som `Yre` (slug = katalognamn, sha256(sökväg)[0:16])
   i stället för hardkodad konstant. Därutöver: lista hela
   `~/.zcode/cli/memories/projects/`-trädet med human-vänliga namn
   (slug + filantal + senaste mtime + "aktiv"-markering). Utan detta
   redigerar kunden ett minne agenten inte läser — fallet är redan här:
   panelen visar `default-d316…` som ingen agent läser.
2. **"Senast uppdaterat" ur mtime (bygger i DAGENS build).**
   `memory_update`-eventet är vilande i 3.11.2-24 (§5.4) — visa i stället
   max(mtime) i roten i panelens header: "Minnet senast uppdaterat:
   X min sedan". När en framtida runtime börjar emittera `memory_update`
   kan samma yta visa filnivå-kort ("Bakgrundskonsolidering ändrade:
   kundprofil.md") — ambient-klassen är redan i protokollet.
3. **Indexbudget-mätare.** MEMORY.md rad/teckennivå mot tak 200 rader/25 000
   tecken (runtimes verkliga gränser) + Hlt-varningstexten när sprängd —
   INTE `summaryMaxBytes: 8192` som är död nyckel i denna build.
4. **Trunkeringsmärkning.** Filer > 200 rader / > 4 kB får "trunkeras vid
   återkallning"-märke i listan (de läses bara delvis in vid recall).
5. **Typfält i NY-mall.** `metadata.type: user | feedback | project |
   reference` (selector-prompten behandlar [user]/[project] särskilt
   konservativt — korrekt typ ökar träffsäkerheten) + wikilänksstöd [[namn]].
6. **Flytta `.minnes-backup/` UR `memory/`** (buggen §7.3) samtidigt som
   panelen visar senaste backup per fil (återställ-knapp).
7. **Ärliga reglage.** Visa faktiska styrparametrar: `features.memory` +
   `memory.use` (av/på) och ev. kommande `extractionEnabled`. Visa
   `write/autoConsolidate/summaryMaxBytes` som "reserverade (verksamma i
   framtida runtime)" — aldrig som aktiva.
8. **Recall-transparens (bonus — kräver framtida runtime).** I 3.11.2-24
   skickas inga `relevant_memory`-event (semantic-recall avstängd, §6), så
   en "Använd denna tur"-indikator har ingen datakälla ännu. När grenen
   aktiveras talar eventen om VILKA minnen som lämnades in i turen —
   bygg indikatorn då. I dag syns agentens minnesläsningar i stället som
   vanliga Read-verktygskort i konversationen.

---

## 10. Funktionskarta (för framtida grävning i bunten)

| Funktion (deminerat namn) | Roll | Offset i zcode.cjs (approx) |
|---|---|---|
| `Yre` resolveProjectMemoryRoot | rot + hash | 7 780 199 |
| `WUo` sanitizeProjectSlug | slug | 7 780 243 |
| `XL` resolveEnabledProjectMemoryRoot | på/av-port | 10 899 235 |
| `rln` | runtimeConfig-översättning (enabled/use/extractionEnabled) | ~11 783 879 |
| `FUr` buildPersistentAgentMemoryPrompt | systemprompt-minne | 10 864 867 |
| `Ike`/`Hlt` | index-formatering + trunkering (200/25 000) | 7 746 693 |
| `Uqr` scheduleProjectMemoryExtraction | trigg (turn.completed) | 11 047 127 / anrop 11 060 163 |
| `jqr` createMemoryExtractionScheduler | debounce + cursor | 11 042 700 |
| `Ppi` evaluateMemoryExtraction | kör/skip-port | 11 043 200 |
| `Npi`/`Lpi`/`Bpi`/`jpi`/`Fpi` | direkt-skrivning/prosa/genuin-user/Write-Edit/oräknare | 11 046 500 |
| `$pi` executeProjectMemoryExtraction | arbetaren | 11 049 000 |
| `EAe`/`X$r`/`J$r`/`rdi` | manifest (rekursiv .md, 30 rader, 200 filer) | ~10 929 000 |
| `Bqr` buildMemoryExtractionPrompt | extraktionsprompten | 11 042 658 |
| `S_t`/`I_t`/`b_t` | meddelanden/executor/loop (yolo, 5 vändor) | 11 018 660 |
| `xqr`/`rpi` | memory_update-event + format | 11 020 025 |
| `u7r`/`l7r`/`mdi` | recall prefetch/konsum/arbetare | 10 938 932+ |
| `Ygt`/`r7r`/`idi` | selector (liten modell, 5 filer, 256 tok) | 10 932 637+ |
| `ldi`/`cdi` | filläsning + trunkering (200 r/4 kB) | 10 936 594 |
| `Xgt` | relevant_memory-format | 10 936 594 |
| `hR`/`d7o`/`XCr` | memory-path-guard + förbjudna kataloger | 7 843 941 |
| `CUo`/`sR` | recall-grensval — `sR=CUo(!1)` HÅRDKODAT "default-index" | ~10 938 800 |
| `Klt`/`TUo` | systemprompt-sektionen `# Memory` (projektminnet) | ~10 936 300 |
| `Lci` | MEMORY.md-läsning vid init (endast default-index-läget) | ~10 865 000 |
| `gdi`/`hdi` | selector-modell = liteModelRef ?? defaultModelRef | ~10 939 000 |
| `mSe` | auto-tillåt Write/Edit i minnesroten ("Memory Markdown writes are allowed") | ~7 846 500 |
| `gci`/`UUr`/`_ci` | agent-memory-scopes (user/project/local) + verktygsregistrering | ~10 863 000 |

Källor: `vendor/zcode.cjs` (alla citat), `vendor/extraction.json`,
`bin/zcode.js` + `config.example.json` (configmall), `@zcode/tui/dist/
index.js` (mall), `test/runtime/network-retry.test.ts` (schema),
`~/.zcode/cli/memories/` (levande struktur), `src/app/api/studio/minne/
route.ts` + `src/components/ak1a/studio-minne-panel.tsx` (p6),
`src/lib/studio/studio-transport.ts:7534` (studioArbetsyta),
`~/.zcode/cli/log/zcode-2026-09-1*.jsonl` (bootstrap-raderna 2026-09-12
med memoryRoot ak1-80a87d64 + workingDirectory /home/ak1a/agent/ak1;
12 project_memory_extract-anrop 2026-09-10) — samt sha256-verifierade
sökvägshashar för alla rot-attributioner.

— R7 skriven av fabriksagent (uppdrag Minnessystemet), 2026-09-14.
Rättad + utökad av oberoende verifikationsomgång (pass 2) samma dag:
rot-attributioner (hash+loggbevis), vilande `memory_update` (3-träffars-
bevis), avstängd semantic-recall (`sR=CUo(!1)`-bevis), `# Memory`-sektionen
(`Klt`/`TUo`), `mSe`-auto-tillståndet och funktionskartans nya rader.
