# R6 — Prompt-preflight + modelAnomalyGuard (−32010/studs-forskning)

> Fabriksuppdrag R6 i superexpert-programmet (ZCODE-INSIDE-OUT.md).
> Källor: `/home/ak1a/forskning/zcode-cli` (öppen källkod, launcher+TUI) +
> officiell runtime `vendor/zcode.cjs` v3.11.2-24 (12,6 MB, dekompilerad
> funktionslogik nedan med minifierade namn bevarade för återhittning).

## TL;DR

1. **Prompt-preflight är ett CLIENT-side-grind** som kör FÖRE varje ny
   prompt (ej `/`-kommandon, ej medan en tur är aktiv). Den kontrollerar
   EN sak: "är detta en entydigt nyckellös Coding Plan-konfig?" — i så
   fall skickas INGEN modellförfrågan alls, texten bevaras och en
   varning visas. **Den kan INTE förklara −32010** — den når aldrig
   servern. Däremot är det TUI-mönstret RUNT preflight (input-kö +
   steers + autoSend) som är det bevisade −32010-förebyggandet.
2. **−32010 har FYRA källor** i runtimen, alla samma vakt
   (`activeAbortController` lever): `session/send` ("A prompt is
   already running"), `compact`, `goal/manage` (ej pause), `fork`.
3. **modelAnomalyGuard varnar på två kanaler**: (a) event
   `model_anomaly_warning` (kategori `repeated_tool_call` eller
   `tool_call_budget`) till UI/telemetri, och (b) en attachment med
   `source: "model_anomaly"` injiceras i NÄSTA modellförfrågan — en
   tillsagd-påminnelse till modellen. Max **3 injektioner per tur**
   (`maxBudgetWarningsPerTurn`), tröskel **3 identiska anrop i rad**
   (`repeatedToolCallWarningThreshold`). Default: PÅ (repeated) / AV
   (budget).

---

## Del A — Vad preflight gör före en prompt

### A1. Två lager + en launcher-krok

| Lager | Fil | Funktion |
|---|---|---|
| Diagnos | `src/prompt-preflight.ts:23` | `missingCodingPlanKey()` — själva kontrollen |
| Grindflöde | `packages/zcode-tui/src/prompt-preflight.ts:4` | `preflightSubmission()` — race-säktan application |
| Print-läge | `src/launcher.ts:257` | `promptPreflight()` — samma diagnos för agent-invocationer (ej resume/passthrough) |

### A2. `missingCodingPlanKey` — diagnostiken (src/prompt-preflight.ts:23–69)

Funktionen letar efter **ett enda, entydigt fel**: en zai/bigmodel
Coding Plan-konfiguration utan API-nyckel. Den är medvetet snäv —
"Diagnose only unambiguous keyless Coding Plan configs":

1. **Env-utväg**: finns NÅGON relevant miljövariabel
   (`ZCODE|ZAI|BIGMODEL|ZHIPU|ANTHROPIC_*KEY|TOKEN|MODEL|CONFIG|PROVIDER|BASE_URL`
   med värde, utom base-URL/retry/telemetri) ⇒ annullerad undersökning
   (konfigen kan komma annat håll — inget entydigt fel).
2. **Projekt-utväg**: finns `zcode.json`, `.zcode/config.json` eller
   `.env` i arbetskatalogen eller NÅGON förälder (även upp till roten)
   ⇒ annullerad. Notera finessen `prompt-preflight.ts:12`–19: en
   oläsbar fil (`EACCES`) räknas som "finns" — en trasig override ska
   också skjuta frågan vidare till runtimen, inte fastna klienten.
3. **Användarconfig** (`userConfigPath`) läsas: gäller ENDAST om
   modellens provider är `zai/...` eller `bigmodel/...`, `kind:
   "anthropic"`, baseURL exakt `https://api.z.ai/api/anthropic`
   (resp. `https://open.bigmodel.cn/api/anthropic`),
   `apiKeyRequired: true`, apiKey tom/strängrad saknas, och inga
   custom headers. Allt annat ⇒ inget fel (annan leverantör, egen
   baseURL eller headers = "inte en ren Coding Plan-konfig").
4. **Retur**: antingen `undefined` (skicka vidare) eller en färdig
   mening: *"Model access is not configured for {provider}. Run /login
   or /setup … **No model request was sent.**"*

Poängen: klienten kan avgöra detta deterministiskt utan nät — och
sparar då en onödig felrunda mot API:t.

### A3. `preflightSubmission` — race-säkerheten (zcode-tui, hela filen 25 rader)

Kärnproblem: valideringen är `await` — under den millisekunderna kan
användaren (a) trycka Esc/stoppa, (b) börja skriva en ny draft. Lösning:

```ts
const diagnostic = await options.validate();
if (options.isStopped()) return false;   // användaren hann avbryta → gör inget
if (!diagnostic) return true;            // grönt → skicka

// Avslaget: MATA ALDRIG BORT TEXTEN
if (options.queued || options.editor.getText() !== "") {
  options.inputQueue.restoreFollowUp(options.submission);  // köa först i kön
} else {
  options.editor.setText(options.submission.input);        // lägg TILLBAKA i redigeraren
  options.inputQueue.autoSend = false;                     // studsar ej om automatiskt
}
options.warn(diagnostic);   // addNotice(message, "warning") i TUI
return false;
```

- `restoreFollowUp` (input-queue.ts:65) gör `unshift` + **`autoSend =
  false`** — ett avslaget köat meddelande ligger kvar och skickas inte
  om automatiskt när tur slutar (användaren bestämmer).
- `autoSend`-flaggan (input-queue.ts:91–103) reset:as bara av
  `resetAutoSend()` vid lyckad tur-dränering (index.ts:1918) — samma
  skydd görors studions dubbel-sändning omöjlig.
- Testfixturen `test/fixtures/tui-preflight-races.ts` bevisar att detta
  testas: check 1 hänger (väntar på filen `release`) medan check 2–3
  hinner köras — parallellvalidering får ALDRIG tappa eller dublett-
  sända inmatning.

### A4. När körs den? (zcode-tui/src/index.ts:1543)

```ts
if (!input.startsWith("/") && !this.primaryTurnActive) {
  const allowed = await preflightSubmission({ validate: () =>
    missingCodingPlanKey({ model, workingDirectory }), … });
  if (!allowed) return false;
}
```

- **Ej `/`-kommandon** (de kräver ingen modell) och **ej när en tur
  redan körs** (`primaryTurnActive`) — då går inmatningen till
  steer-/kö-vägen istället (se Del B).

---

## Del B — Kan preflight förklara −32010-studsar? (Nej — men grannen kan)

### B1. −32010:s fyra exakta källor i runtimen (zcode.cjs)

| Metod | Meddelande | Position i zcode.cjs |
|---|---|---|
| `session/send` | "A prompt is already running for this session" | 12 096 974 |
| `compact` | "Cannot compact while a prompt is running" (`Lwt`) | 12 112 235 |
| `goal/manage` (action ≠ pause) | "Cannot manage goals while a prompt is running" | `Lwt`-anrop |
| `fork` | "Cannot fork while a prompt is running" | `Lwt`-anrop |

Allihop samma vakt: sessionens `activeAbortController` finns kvar ⇒ kasta
`qa(-32010, …)`. Runtimen vägrar alltså ALL session-muterande drift under
pågående prompt — detta är R3-fyndet "mål-rensning retry" i större
sammanhang, och förklarar worklog v142 ("−32010-studsen: en prompt körs").

**Slutsats: preflight ≠ −32010.** Preflight kör JU bara när INGEN tur är
aktiv och skickar aldrig något. −32010 är en SERVER-vägran vid aktiv
prompt. De två systemen delar bara placering "före runtimen".

### B2. Det verkliga −32010-förebyggandet: TUI:ns inmatningsarkitektur

(index.ts:1693–1922 + input-queue.ts) — mönstret v142 byggde studions
prompt-kö på:

1. **`steering = primaryTurnActive`** (1693): medan tur kör blir ny
   inmatning en **steer** (`trackSteer`, 1741) — runtimen QUEUEAR den
   själv och sänder events `turn_steer_queued / steer_drained /
   steer_discarded` (input-queue.ts:214–236). Användarens text blir
   aldrig ett `session/send` ⇒ aldrig −32010.
2. **Follow-up-kö**: när steer inte är möjligt hamnar inmatningen i
   `queueFollowUp` (flera ställen 1695–1718) och skickas av
   **dräneraren** vid turslut: `primaryTurnActive = false` (1901) →
   om `autoSend` (1922) → `takeNextFollowUp()`.
3. **autoSend-bromsen** (1817/1833/1844): vid avbrott/fel sätts
   `autoSend = false` — kön ligger kvar tills användaren trycker.
   Kvarhållen steer-text återköas (1813, 1854).

---

## Del C — modelAnomalyGuard: hur anomali-vakten varnar

### C1. Konfiguration (config.example.json:114–117 + zod-schema `VAo` i zcode.cjs)

```json
"modelAnomalyGuard": {
  "repeatedToolCallWarningThreshold": 3,
  "maxBudgetWarningsPerTurn": 3
}
```

- `repeatedToolCallWarningThreshold` — antal **identiska
  verktygsanrop i rad** innan varning. Default 3. `<= 0` stänger av.
- `maxBudgetWarningsPerTurn` — tak på **injicerade** varningar per
  tur. Default 3. (Detekterade events fortsätter strömma — bara
  injektionen slutar.)
- `toolCallWarningThreshold` — finns i schemat men UTAN default ⇒
  budget-vakten är AV tills kunden sätter den (opt-in).

### C2. Detektorerna (zcode.cjs @ 10 731 822, dekompilerat)

**`pFr` = `detectRepeatedToolCallWarnings(toolCalls, state, config)`** —
körs per modellrond via **`U7r` = `handleToolCallAnomalyWarnings`**
(@ 10 969 800) efter att verktygsresultat landat:

- Signatur per anrop: `gui(name, input)` = `JSON.stringify(name) +
  ":" + stableJson(input)` där `stableJson` (`rgt`) rekursivt **sorterar
  objektnycklar** — `{a:1,b:2}` och `{b:2,a:1}` är SAMMA anrop.
- Streak räknas i `state.repeatedToolCallSignature /
  repeatedToolCallStreakCount`; ny signatur ⇒ streak = 1.
- Vid **streak === threshold** (exakt 3): budgettest
  `anomalyWarningsInjected < maxBudgetWarningsPerTurn` ⇒ poppa
  `{observedCount, threshold, toolCallId, toolName, warningInjected}`.
- **Reset per ny user-request**: `drainInlineGuideForNextRequest`
  (@ 10 969 800: `repeatedToolCallSignature=void 0,
  repeatedToolCallStreakCount=0`) — streaken dör med turen, inte vid
  tillfälliga nyckelfels-variationer.

**`mFr` = `detectToolCallBudgetWarning(totalCount, roundCount, state,
config)`** — varnar när totala verktygsanrop **korsar**
`toolCallWarningThreshold` inom en rond (`o <= e < o + roundCount`),
samma budgetlogik.

### C3. Två varningskanaler (U7r, exakt flöde)

1. **Event → UI/telemetri**: `createEvent(V.ModelAnomalyWarning, …)` +
   `appendEvent` ⇒ strömmar som `"model_anomaly_warning"` (event-enum
   bevisad i V-tabellen) med
   `{category: "repeated_tool_call"|"tool_call_budget",
     severity: "warning", observedCount, threshold, toolCallId?,
     toolName?, warningInjected: boolean}` — `warningInjected: false`
   = "vakten såg det men injektionstaket är fullt".
2. **Attachment → modellen**: om `warningInjected` ⇒ `Dd(e,
   turnRequestState, [Js("model_anomaly", body)])` där `Js` bygger
   `{kind: "attachment", content: body, metadata:
   {source: "model_anomaly"}}` som läggs i `messageHistory` +
   nästa request. Samma attachment-mekanism som todo_reminder.

### C4. Varningstexterna (ordagrant ur runtimen)

Repeated (`fFr` = buildRepeatedToolCallReminderBody):
> "You have called {toolName} with the same input {count} times in a
> row. Do not repeat the exact same tool call again unless the user
> explicitly asked you to retry it unchanged. Use the existing result
> to take a different next step, explain the blocker, or ask the user
> for guidance."

Budget (`hFr` = buildToolCallBudgetReminderBody):
> "This turn has already made {count} tool calls. Do not keep calling
> tools reflexively. Use the gathered results to choose a different
> next step, summarize the blocker, or ask the user for guidance if
> you are stuck."

Vakten stoppar alltså ALDRIG något — den tillsäger modellen i
kontexten (max 3 ggr/tur) och rapporterar uppåt. Motorslump-loopar
kostar token tills budgeten tar slut.

---

## Tre konkreta studion-förbättringar

### 1. Anomali-telemetri i studions tråd (synlig vakten)

Studio-transporten lyssnar redan på eventströmmen — lägg till
`model_anomaly_warning`: räkna per tur (kategori, toolName,
observedCount) och rendera en varnings-chips i konversationen
("Modellen anropade X 3× identiskt — vakten tillsade omväg") samt
persistens i db (t.ex. `anomaly_events`-tabell eller JSON-fält på
turn). Vetefältet `warningInjected: false` är dessutom en tidig
loop-varnare för evighetsmotorns vaktprompt. **Paritetsgap: officiell
TUI får detta gratis via events — studien visar ingenting idag.**

### 2. Preflight-grind i studions POST-gren (tappa aldrig kundens text)

Portera `preflightSubmission`-mönstret till `/api/studio/stream`:
(a) klientgrind FÖRE `session/send` som kan avvisa utan nät
(config/autent-status), (b) vid avslag: texten åter i UI:ts
inmatningsruta + `autoSend=false`-mönstret (aldrig automatisk
omsändning av avslaget), (c) race-skyddet `isStopped()` (Esc under
validering). R3: s ämnade `restoreFollowUp`-unshift exakt hur en köad
men avslagen inmatning bevaras främst i kön. Särskilt värdefullt i
studion där kunden telefon-skriver långa texter.

### 3. −32010-meddelandekarta + automatisk återkö (fyra varianter)

Studions felhantering känner idag "-32010 = prompt körs". Kartlägg
alla fyra: "A prompt is already running" / "Cannot compact…" /
"Cannot manage goals…" / "Cannot fork…" ⇒ svenska kundvänliga
meddelanden + FA-schema: `session/stop` → vänta → retry (R3 bevisade
15 × 3 s för mål-rensning; generalisera till kompakt/fork-studion).
Idag studsar kompakt/fork-knappar med rå JSON-RPC-kod — det är den
typ av "häng"-upplevelse våg 148-skalkvoten visar.

---

## Källor & positioner (för omverifiering)

| Faktum | Källa |
|---|---|
| missingCodingPlanKey full logik | `forskning/zcode-cli/src/prompt-preflight.ts:23–69` |
| preflightSubmission + race-skydd | `forskning/zcode-cli/packages/zcode-tui/src/prompt-preflight.ts:4–25` |
| Race-testning | `forskning/zcode-cli/test/fixtures/tui-preflight-races.ts` |
| Preflight-anrop i TUI | `forskning/zcode-cli/packages/zcode-tui/src/index.ts:1543–1560` |
| Steer/kö/autoSend-arkitektur | `packages/zcode-tui/src/index.ts:1693–1922` + `input-queue.ts:65,91–103,214–236` |
| Launcher-preflight (print-läge) | `forskning/zcode-cli/src/launcher.ts:257–267` |
| modelAnomalyGuard-konfig | `forskning/zcode-cli/config.example.json:114–117` |
| pFr/mFr/fFr/hFr/gui/rgt (detektorer + texter) | `~/.npm-global/…/vendor/zcode.cjs` @ byte 10 731 822 |
| U7r handleToolCallAnomalyWarnings + reset | `zcode.cjs` @ byte 10 969 800 |
| −32010 send + Lwt (compact/goal/fork) | `zcode.cjs` @ byte 12 096 974 / 12 112 235 |
| Event-typ "model_anomaly_warning" | V-enum i `zcode.cjs` (ström-tabelldata) |

*Författat av fabriksagent R6 (preflight + anomali-vakt), 2026-09-14.
R1 (protokoll), R2 (poll), R3 (veltater) finns i samma mapp.*
