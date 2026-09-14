# M2 — KOMPAKTERINGSMOTORN (compaction/compact i zcode-runtimen)

Forskningsrapport M2 i källkodskartläggningen (syskon till R1–R7). Källa: den
INSTALLERADE runtimens `vendor/zcode.cjs` (12,6 MB bundle, cliVersion 0.16.5,
app 3.11.2) i `/home/ak1a/.npm-global/lib/node_modules/zcode-app-cli/`.
Metod: fulltextextraktion av alla 996 `compact`-träffar (varav 119 exakta
`compaction`) + de-minifiering av de åtta kärnfunktionerna; alla offsetar nedan
är sökbara i bunten (`node -e "…indexOf('…')"`). Syfte: förstå exakt När/Vad/
Budget i kompakteringen och ge studions Komprimera-knapp (v82, levererad) en
bevisad auto-trigger-rekommendation.

---

## 1. Sammanfattning (TL;DR)

- **Fyra verkställare, en motor.** Samma `compactActiveConversation` driver
  (1) **auto** (före varje modellanrop), (2) **reaktiv** (när leverantören
  svarar "context exceeded"), (3) **manuell** (`/compact` + RPC `session/compact`
  — studions knapp), (4) **session-memory** (sammanfattning till sessionsminne).
- **Standard i denna build är strategin `preflight-v1`** (`Cy="preflight-v1"`,
  @441445) — inte "95 %". Tröskeln är tokenbaserad:
  `tröskel = (kontextfönster − outputreserv) − buffer`, där reserven är
  `min(maxOutputTokens ?? 32 000, 21 000)` och buffern **13 000** token.
  Procentandelen 95 (`ATr`) gäller ENDAST strategin `legacy`.
  **GLM 200k/32k ut ⇒ tröskel 166 000 token = 83 %** av fönstret.
- **Auto bevarar senaste rundan ordagrant; manuell bevarar INGENTING** utöver
  sammanfattningen. Kontextprefixet (systemprompt, skills-listor,
  `<system-reminder>`-meddelanden) återställs alltid ovanpå sammanfattningen.
- **Två skyddsbrytare**: max 3 misslyckade auto-kompakteringar i följd
  (circuit breaker, `RTr=3`) och "rapid refill"-brytare (kontexten fylls igen
  inom <3 verktygsvarv, 3 gånger i rad ⇒ kompaktering pasas med
  åtgärdsråd). Plus 3 försök när själva sommarprompten är för lång (äldre
  rundor kastas tills gapet täcks).
- **Studiots API är färdigt**: `session/compact` med `instructions`-parameter,
  svar `compact.state = "accepted" | "already_running"`, vägrar under pågående
  prompt ("Cannot compact while a prompt is running"). Däremot rapporteras
  **`autoCompactThresholdTokens` ALLTID null** i snapshot i 0.16.5 — tröskeln
  finns bara i telemetrin, så studion måste RÄKNA UT den själv (formel i §8).

---

## 2. Lager ÖVER kompakteringen — tre olika mekanismer

Termen "compact" täcker tre skilda system i bunten; blanda inte ihop dem:

| Lager | Motor | Modellanrop? | Syfte |
|---|---|---|---|
| **Mikrokompaktering** | `Vke maybeLocalMicrocompactMessages` @7776477 | NEJ — ren lokalt rensning | Rensar GAMLA verktygsresultat ur kontexten |
| **Kompaktering (denna rapports ämne)** | `compactActiveConversation` + `Uke shouldAutoCompact` | JA — en summeringsvända | Ersätter samtalet med en sammanfattning |
| **Anthropic-native context edits** | `applied_edits`: `compact_20260112`, `clear_tool_uses_20250919`, `clear_thinking_20251015` (@4178963) | NEJ — leverantörssidan | Anthropic-API:ets egna kontextredigeringar; requestregeln `compact_20260112` har egen `trigger:{type:"input_tokens",value:N}`, `pauseAfterCompaction`, `instructions` |

Mikron är billig men ytlig (§6); Anthropic-skiktet berör bara
Anthropic-leverantören; **huvudspåret för studion är lager 2.**

## 3. Triggarmatematiken (kärnan)

Konstanter (modul `MTr` @7776137):

```
Fq  = 200 000   kontextfönster-standard (om modellen inte anger)
Fke = 32 000    outputreserv-standard (summaryReserveTokens)
jUo = 21 000    outputreserv-TAK under preflight-v1
ETr = 13 000    bufferTokens-standard
ATr = 95        tröskelprocent ENDAST för strategin "legacy"
RTr = 3         max consecutive failures (circuit breaker)
```

De fyra funktionerna (alla i samma modul):

```js
// uct @7774168 — outputreserven
getAutoCompactOutputReserveTokens(cfg) =
  strategy === "preflight-v1"
    ? min(cfg.maxOutputTokens ?? 32_000, 21_000)
    : cfg.maxOutputTokens ?? min(cfg.summaryReserveTokens ?? 32_000, 32_000)

// sct @7774075 — effektivt fönster
getEffectiveContextWindowSize(cfg) = contextWindow ?? 200_000 − outputreserv

// PTr @7775815 — tröskelprocenten
getAutoCompactThresholdPercent(cfg) =
  strategy === "preflight-v1" ? 100
  : giltig(cfg.thresholdPercentOverride) ? cfg.thresholdPercentOverride : 95

// Jre @7774353 — SLUTTRÖSKELN i token
getAutoCompactThreshold(cfg) =
  strategy === "preflight-v1"
    ? max(0, effektivtFönster − 13_000)
    : min(floor(effektivtFönster × procent/100), effektivtFönster − 13_000)
```

**Beslutet** (`Uke shouldAutoCompact` @7774561, anropas före varje
modellsteg via `lqr` @10996142):

1. `enabled === false` ⇒ avstyr ("disabled" — finns inget UI-reglage i 0.16.5,
   nycklarna `thresholdPercentOverride`/`bufferTokens`/`summaryReserveTokens`
   är interna runtime-config, exponerade inte i inställningsschemat).
2. `jq hasEnoughMessagesToCompact` (jke-modulen @7773530): minst **2
   "rundor"** (grupper som börjar med assistant-meddelande) och minst ett
   assistant-meddelande — annars "not_enough_messages".
3. `consecutiveFailures ≥ 3` ⇒ "circuit_breaker" (avstannad efter 3 fallerade
   auto-kompakteringar).
4. `tokenCount < tröskel` ⇒ "below_threshold", annars **"above_threshold"**.

**Tokenräkningen**: föredrar LEVERANTÖRENS riktiga siffror (`tokenOverride` från
senaste svaret: input/cache/incremental), reserv är lokal estimat
`gf estimateMessageTokens` — teckenlängd ÷ **3** (`ZB=3`) inklusive
verktygsanropens JSON-input. Kontextfönstret hämtas från modellkatalogen
(`model.properties.contextWindow ?? turnExecutionModel.contextWindow ?? config`).

**Konkret exempel — zai/GLM 200 000-fönster, preflight-v1 (buildens standard):**

| maxOutputTokens | reserv | effektivt fönster | tröskel | i % av 200k |
|---:|---:|---:|---:|---:|
| 32 000 | 21 000 | 179 000 | **166 000** | **83 %** |
| 8 000 | 8 000 | 192 000 | **179 000** | **89,5 %** |
| oangivet | 21 000 | 179 000 | **166 000** | **83 %** |

**Reaktiv utlöskant** (`mqr recoverModelStepAfterContextExceeded`
@11012451): när leverantören ändå svarar context-exceeded mitt i en vända
kompakteras och vändan kör om — men bara en gång per modellsteg
(`reactiveCompactAttemptedInCurrentModelStep`).

## 4. Vad som bevaras — och vad som kastas

Urval (`lie selectCompactEntries` @10712995 + `Ght
splitRuntimeEntriesForCompactSelection` @10715607):

1. **Kontextprefixet släpps aldrig in i summeringen och återskapas alltid**:
   systemmeddelanden, `context_prefix`- och `skills_listing`-poster, user-
   meddelanden som börjar med `<system-reminder>` (`Jjr isRuntimeContextPrefixEntry`).
2. Resten grupperas i **rundor** (assistant-startade grupper, `Oke
   groupByAssistantStartedRounds`).
3. `shouldPreserveRecent = (trigger === Auto || Reactive)`:
   - **Auto/reaktiv: SENASTE rundan bevaras ORDAGRANT** (i=1), allt äldre
     summeras. Vid retry kan fler rundor bevaras (`minimumGroupsToPreserve`,
     räknat baklänges tills tokengapet täcks; aldrig mer än alla−1; vid
     övertäckning bevaras halva).
   - **Manuell (`/compact`, studions knapp): i=0 — INGA rundor bevaras.**
     Hela samtalet (utom prefix) blir sammanfattning.
4. **Nya kontexten** (`Qjr buildPostCompactRuntimeEntries` @10719341) =
   prefix + sammanfattningen + bevarade rundor + post-kompakterings-påminnelser.
5. **Gränsdokumentet** `compactBoundary` (@636874-schema): `boundaryId`
   (`compact_<uuid>`), `trigger`, `phase`, `preCompactTokenCount`,
   `postCompactTokenCount`, `truePostCompactTokenCount`, `autoCompactThreshold`,
   `willRetriggerNextTurn`, `summarizedMessageCount`, `keptMessageCount`,
   `lastSummarizedMessageId`, `preservedSegment {headMessageId, tailMessageId,
   anchorMessageId}`, `summaryMessageIds`, `customInstructions`. Timeline-
   part `type:"compaction"` med `tail_start_id` valideras i bundle-grinden
   (@936411) — så återupptagna sessioner kan sy ihop tråden korrekt över
   kompakteringen (relevant för studions tradHistorik-vy).
6. **Medier projiceras bort i sommarrequestet** (`Jht
   projectCompactMediaForRetry` @10721149): bilder/video/dokument ersätts med
   textplatshållarna `[image]`/`[video]`/`[document]` — summeringsmodellen ser
   ALDRIG media.

## 5. Summeringsprompten och fortsättningsmeddelandet

**Sommarprompten** (`Pke buildCompactPrompt` @7766060; blocken `PUo` @7765530,
`OUo` @7766105, `MUo`):

- Ram: "CRITICAL: Respond with TEXT ONLY. Do NOT call any tools" — verktygsanrop
  i svaret är HÅRT AVVISADE (`Jpi "Tool use is not allowed during compaction"`,
  beteende "deny"); tomt svar ⇒ retrybart fel "Failed to generate compact
  summary".
- Format: `<analysis>`-block följt av `<summary>`-block.
- **Nio fastslagna sektioner** i sammanfattningen: 1 Primary Request and
  Intent · 2 Key Technical Concepts · 3 Files and Code Sections (med kodsnuttar)
  · 4 Errors and fixes (med kundfeedback!) · 5 Problem Solving · 6 **All user
  messages** (ALLA icke-verktygsanvändarmeddelanden) · 7 Pending Tasks ·
  8 Current Work · 9 Optional Next Step (krav: citera senaste uppgiften
  ordagrant — "so there's no drift in task interpretation").
- Säkerhetsinstruktioner ska bevaras ORDAGRANT ("security-relevant
  instructions … MUST be preserved verbatim so they continue to apply after
  compaction") — direkt relevant för AK1A:s juridikgrind-text.
- **Egna instruktioner stöds**: "Additional Instructions:"-block + exempeln
  `## Compact Instructions` — detta är vad RPC:ns `instructions`-parameter
  landar i.

**Fortsättningsmeddelandet** (`Mke buildCompactSummaryMessage` @7764520) —
user-rollen som ersätter det gamla samtalet:

> "This session is being continued from a previous conversation that ran out
> of context. The summary below covers the earlier portion…"

 + pekpinnar: **transcriptPath** ("read the full transcript at: …" — återställ
 detaljer ur transkriptfilen vid behov), "Recent messages are preserved
 verbatim." (endast auto/reaktiv), "Your REPL VM state has been cleared …"
 (vid rensat REPL), samt suppressFollowup-direktivet (fortsätt direkt, utan
 att bekräfta sammanfattningen).

## 6. Felhantering och budgetar

- **Sommarprompt för lång** (`Vht` @10714920 + `Jsi truncateRuntimeEntriesForCompactRetry`
  @10716177): max **3 försök** (`Bq=3`). Mellan försöken kastas ÄLDRE rundor
  ackumulerat tills deras token täcker gapet (gapet parse:as ur leverantörens
  "N tokens > M"-fel, `Wjr`), markören `"[earlier conversation truncated for
  compaction retry]"` (`Kre`) syss in. Ger retry-slingan upp ⇒ fast fel:
  **"Conversation too long to compact automatically. Try /compact again after
  narrowing the active context."** (`Dke` @7773609).
- **Rapid-refill-brytaren** (@10727260): om kontexten fylls igen inom **<3
  verktygsvarv** efter en kompaktering, **3 gånger i rad** ⇒ "Autocompact
  stopped because the context refilled within fewer than 3 tool turns after
  compaction 3 times in a row. A file or tool output may be too large. Read it
  in smaller chunks, or start a new session." (`toolTurnThreshold=3`,
  `maxConsecutiveRapidRefills=3`, hårdkodade i `DEe`-anropet). Återställningsbart
  men stoppar auto-spåret tills läget ändras.
- **Circuit breaker**: 3 consecutiva auto-fel ⇒ auto avstängt (sessionen lever
  vidare; manuell `/compact` går bra).
- **`pauseAfterCompaction`** (endast Anthropic-native-regeln): pausa efter
  leverantörskompaktering.

**Mikrokompakteringen** (§2, `Vke`/`zUo`/`UUo`; konstanter @7779328) —
kompletterar huvudspåret och körs även som försteg i komprimeringsflödet
(`Xjr maybeLocalMicrocompactRuntimeEntries` @10719500):

- **Triggers**: idle > **60 min** sedan senaste assistant-meddelande
  (`FUo=60`, `TimeBased`) ELLER `estimatedTokens ≥ thresholdTokens`
  (`TokenPressure`; standardtröskel `qke` = `min(90 % av fönstret,
  fönster − 2 000)` — konstanter `LTr=0.9`, `BTr=2000`).
- **Kandidater**: verktygsresultat från `["Read","Bash","Grep","Glob",
  "WebFetch","WebSearch","Edit","Write","ApplyPatch"]`; felresultat endast om
  `clearErrorResults=true`.
- **Bevarar**: de **5 senaste** verktygsresultatgrupperna (`DTr=5`); äldre
  ersätts med platshållaren `"[Old tool result content]"`.
- **Villkor**: besparingen måste överstiga **256 token** (`NTr`), annars
  "below_min_savings" och ingen ändring.

## 7. Protokollet — vad studion ser (och INTE ser)

- **RPC `session/compact`** (metodnamn @463491; hanterare `Jpn` @12098137;
  input-schema `NEt` @443461): `{sessionId, inputId?, queryId?, instructions?,
  expectedRevision?, runtimeModel?}`. Beteende: kompaktering pågår ⇒ svar
  `compact.state="already_running"`; pågående prompt ⇒ FEL "Cannot compact
  while a prompt is running"; annars byggs kommandot `instructions ?
  "/compact "+instructions : "/compact"` och körs som bakgrundsuppgift
  (`app.submitPrompt`). Eventflöde: `compact_started {status:"running"}` →
  `session_compacted` | `session_compact_cancelled` | `session_compact_failed`.
- **Snapshot-usage** (`ije` @383884): `usage.contextWindow = {usedTokens,
  maxTokens, autoCompactThresholdTokens, cache?, breakdown?}` — MEN
  `autoCompactThresholdTokens` är **hårdkodat null i ALLA fem
  tilldelningsställena i 0.16.5** (@12269144, @12270287, @12272948,
  @12447346 m.fl. — bevis: varje tilldelning är `null` eller "bevara
  föregående ?? null"). Tröskeln existerar bara i telemetrifältet
  `autoCompactThreshold: d.threshold` (@10998140). ⇒ **Studion kan inte läsa
  tröskeln — den måste beräkna den** (§8).
- **Timeline**: part `type:"compaction"` (med `summaryMessageId`,
  `tail_start_id`, `compactBoundary`) respektive timeline-event
  `context_compaction` — så här återges kompakteringar i historiken och i
  studions sammanslagna tråd (v148).
- **UI-statusar i TUI:n** (kan återanvändas som ordval): "Compressing
  context…" → "Conversation compacted." / "Context compression failed."
  (@11213842).

## 8. Rekommendation — studions Komprimera-knapp

Nuläge (v82, levererat): knapp → POST `/api/studio/session {action:"compact"}`
→ `transport.compact()` → `session/compact`; mätare visar ärlig procent ur
`projection.contextUsed/contextWindow` (studio-chat.tsx ~7596).

### 8.1 Auto-trigger: JA — men beräkna tröskeln, hårdkoda inte procent

Runtimens EGEN auto kompakterar redan vid ~83–89,5 % (§3) och bevarar då
senaste rundan. Studio-auto har därför endast ett värde: **kontrollerad
tidpunkt** (mellan vågor) i stället för mitt i. Rekommenderad design:

1. **Beräkna tröskeln lokalt** med buntdformeln (contextWindow ur projection;
   maxOutputTokens ur modellkatalogen `/api/studio/modeller`):
   `tröskel = contextWindow − min(maxOut ?? 32k, 21k) − 13k`.
   Visa den som **markör i mätaren** ("auto-gräns ~83 %") — pedagogik i
   kundens anda: syns, förklaras, överraskar inte.
2. **Studio-auto vid 80 % av contextWindow** (alltså FÖRE runtimens ~83 %),
   med hårdbegränsningar:
   - **Endast när agenten är idle** (protokollet vägrar under pågående prompt
     — annars spammar vi `already_running`/fel);
   - **max en gång per 30 min per session** (cooldown) och aldrig mer än en
     gång per våg — en kompaktering är en hel modellvända (kostnad/latens);
   - **aldrig under mål-loop** (måliterationer bygger på kontinuitet;
     evighetsmotorn rör sig — kompaktera mellan wave, inte i den);
   - vid avfyrning: toast "Kontexten komprimerades automatiskt (83 % av
     fönstret)" + tydlig post i tråden.
3. **Skicka alltid instructions** (protokollet stödjer det, §5): kundens
   standardfokus, t.ex. *"Bevara: aktuell våg + PIPELINE-KO-läge, filägarskap,
   pågående uppgifter, juridikregler. Svenska."* — promptens 9 sektioner +
   Additional Instructions gör att vågstatus överlever.
4. **Knappen behålls manuell** som kundens nödutgång — men med tooltip-
   ändringen att den (till skillnad från auto) **inte** bevarar senaste rundan
   ordagrant: bäst läge är mellan vågor.

### 8.2 Varför inte "auto vid 95 %"

95 är legacy-strategins procentsats och gäller INTE denna build (preflight-v1
⇒ 100 % minus reserv minus buffer ⇒ i praktiken 83–89,5 %). En studiotröskel
på 95 % skulle ALDRIG hinna verka — runtimens egen auto slår till först. 80 %
ger månads marginal: kunden ser kompressionen komma (gul zon ≥75 %, röd zon
≥ tröskelmarkören), och microcompact + reaktiva spåren täcker fallet "agenten
spränger fönstret mitt i ett jobb".

### 8.3 Bonusfynd att nyttja

- `truePostCompactTokenCount` + `willRetriggerNextTurn` i compactBoundary är
  färdiga mått för en "komprimeringskvalitet"-rad i studion (förra
  komprimeringen frigjorde X token / höll Y varv).
- Rapid-refill-felet (§6) har en färdig svensk åtgärdstext: "läs filen i
  mindre bitar eller ny session" — visa det översatt om brytaren slår till.

## 9. Spårbarhetstabell (minifierat → de-minifierat → offset)

| Minifierat | Funktion | Offset |
|---|---|---:|
| `Uke` | shouldAutoCompact | 7 774 561 |
| `Jre` | getAutoCompactThreshold | 7 774 353 |
| `PTr` | getAutoCompactThresholdPercent | 7 775 815 |
| `sct` | getEffectiveContextWindowSize | 7 774 075 |
| `uct` | getAutoCompactOutputReserveTokens | 7 774 168 |
| `uL` | positiveInt | 7 774 700 |
| `lie` | selectCompactEntries | 10 712 995 |
| `$ht` | selectCompactEntriesAfterPromptTooLong | 10 713 437 |
| `Ght` | splitRuntimeEntriesForCompactSelection | 10 715 607 |
| `Jsi` | truncateRuntimeEntriesForCompactRetry | 10 716 177 |
| `Vht` | truncateCompactSummaryRequestEntriesAfterPromptTooLong | 10 714 920 |
| `Qjr` | buildPostCompactRuntimeEntries | 10 719 341 |
| `Xjr` | maybeLocalMicrocompactRuntimeEntries | 10 719 500 |
| `Jht` | projectCompactMediaForRetry | 10 721 149 |
| `Vke` | maybeLocalMicrocompactMessages | 7 776 477 |
| `zUo` | resolveMicrocompactTrigger | 7 777 866 |
| `UUo` | collectCompactableToolResultGroups | 7 778 190 |
| `qke` | buildDefaultMicrocompactThreshold | 7 776 396 |
| `Pke` | buildCompactPrompt | 7 766 060 |
| `Zre` | formatCompactSummary | 7 764 300 |
| `Mke` | buildCompactSummaryMessage | 7 764 520 |
| `eVr` | formatCompactSummaryOrThrow | 11 068 000 |
| `lqr` | maybeAutoCompact (pre-request) | 10 996 142 |
| `mqr` | recoverModelStepAfterContextExceeded | 11 012 451 |
| `Jpn` | RPC-hanterare session/compact | 12 098 137 |
| `gf` | estimateMessageTokens (chars÷3) | 7 773 900 |
| `jq` | hasEnoughMessagesToCompact | 7 773 500 |
| konstanter `Fq…RTr` | MTr-modulen | 7 776 137 |
| konstanter `CTr,Bq,Kre,Dke` | jke-modulen | 7 773 530 |
| konstanter `lct,DTr,FUo,NTr,LTr,BTr,jTr` | micro-modulen | 7 779 328 |
| `Cy="preflight-v1"` | standardstrategin | 441 445 |
| `MEt` | runtime-config-schema (modelContextBudgetStrategy) | 441 502 |
| `NEt`/`_Ki` | session/compact in/out-schema | 443 461 |
| `ije` | usage.contextWindow-schema | 383 884 |

---

*Rapport M2, författad av fabriksagent (agentfabriksomgång), 2026-09-14. Alla
siffror ur `zcode.cjs` sha512 4UAMZSP9… (extraction.json 2026-09-11).*
