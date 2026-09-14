# R3 — FEL- OCH PERMISSION-VAKTER: zcode-tui ↔ studio-transport

**Uppdrag:** R3 (Agentfabriken, 2026-09-14). Dokumentera zcode-tui:s två
vaktmoduler exakt (timeout/retry/köhantering), mappa mot
`src/lib/studio/studio-transport.ts` och lista vad studion saknar mot
hängande strömmar och väntande verktyg.

**Källor (första hand):**
- `~/forskning/zcode-cli/packages/zcode-tui/src/stream-error-guard.ts` (19 rader)
- `~/forskning/zcode-cli/packages/zcode-tui/src/permission-request-queue.ts` (14 rader)
- `~/forskning/zcode-cli/packages/zcode-tui/src/index.ts` (användningskontext: rader 919–937, 3273–3300)
- `AK1/src/lib/studio/studio-transport.ts` (app-server-klienten rader 1492–1749; transportens vaktskikt se radreferenser nedan)

---

## 1. zcode-tui:s två vakter — exakta strategier

### 1.1 stream-error-guard.ts — aggregerad strömfels-observatör

**Kod (hela filen):** `watchStreamErrors(sources, onError)` prenumererar på
`"error"`-eventet på varje källa (deduplicerad via `new Set(sources)`), och
returnerar en **idempotent dispose-funktion** (`active`-flaggan gör att ett
andra anropet är no-op och att off aldrig kan kallas dubbel).

**Strategi per dimension:**
- **Timeout: INGEN.** Ren observatör — den triggar endast på faktiska
  `error`-event från strömmarna.
- **Retry: INGEN.** Ett fel är terminalt för terminalen; strategin är
  kontrollerad nedstängning, inte återhämtning.
- **Köhantering: INGEN kö.** En delad `onError` för alla källor; det är
  anroparens jobb att reagera.

**Varför den finns (index.ts:919–937, `installStreamErrorGuards`):**
Node **kastar om ett stream-`error`-event saknar lyssnare** — processen dör.
Terminalströmmar (`process.stdout`/`stderr`) får ASYNKRONA fel (EIO när ptyn
dött, EPIPE när läsaren kopplat ifrån) som en synkron try/catch kring varje
skrivning aldrig ser. Vakten: absorbera felet → `markTerminalUnavailable()`
(stoppa framtida notisskrivningar = **graceful degradation**) → `exitCode=1`
→ normal `stop()`-upprullning. Kraschprevention + ärlig exit, alltså.

### 1.2 permission-request-queue.ts — FIFO-kö med giftimmunitet

**Kod (hela filen):** klass med en enda `tail: Promise<void>`. `run(request)`
kedjar `request` på svansen och returnerar DEN ursprungliga promisen (ej
svansen).

**Strategi per dimension:**
- **Timeout: INGEN på kön.** Timeouts/avbrott ägs av den enskilda
  permission-hanteraren via **AbortSignal** (index.ts:3273–3281:
  `context.abortSignal ?? this.turnAbortController?.signal` förs in i varje
  dialog — när användaren avbryter turnen löses pågående dialog cancellerat).
- **Retry: INGEN.** En misslyckad dialog köras aldrig om; nästa request i
  ordningen är det som spelar roll.
- **Köhantering: strikt FIFO via promise-svans** — dialoger **överlappar
  aldrig** (en i taget, i ankomstordning). **Giftimmun:** svansen sväljer
  både resolve och reject (`result.then(() => undefined, () => undefined)`)
  — en kastande request kan aldrig blockera senare permissions.

**Nyckelinsikt:** TUI:s "timeout-strategi" är egentligen *avbrotts-
propagering* (AbortSignal) + *köns okränkbarhet* (svans-sväljning), inte
timrar. Studion har i stället timrar (30 s-defaulter) eftersom en webb-
klient kan försvinna utan att ens avbryta — se paritetsanalysen.

---

## 2. Studio-transportens befintliga vaktverk (lägesbild)

Allt nedan är REDAN implementerat i `studio-transport.ts` (citerat med
radnummer, version develop 2026-09-14):

| Vakt | Var | Strategi |
|---|---|---|
| Per-request timeout | `protokollFraga` 1684–1694 | Varje JSON-RPC-anrop får timer (default 30 s; per anrop 8–120 s), `clearTimeout` vid svar/död; id-karta `vantar` |
| Barn-död → ärligt fel | `vidKlientDöd` 3195–3219 | Pågående prompt får fel-event DIREKT (aldrig 10-min-tystnad), kartan spolas tvingat till disk |
| Omstartskedja | 3226–3268, 3271–3311 | Max 3 försök, exponentiell backoff 2/8/32 s, köade dödar (`dodVantarPaOmstart`) fångas, lyckad etablering nollställer räknaren |
| Backoff-spärr | `klientForFraga` 3174–3184 | Under omstart kastas ärligt "pröva igen" (aldrig dubbla barn = dubbel RAM) |
| Radbuffert-tak | 1545, 1579–1581 | 1 MB tak på NDJSON-bufferten — kaotiskt barn äter aldrig RAM |
| Avsiktlig nedstängning | `stang` 1724–1743 | SIGTERM → SIGKILL efter 3 s, `unref()` på tvångstimern; väntande felas, dödsnotis undertrycks |
| Permission 30 s-default | `paServerRequest` 4945–4948, 4969–4971 | Ingen klick inom 30 s ⇒ `{decision:"escalate"}` (permission) / `{cancelled:true}` (fråga) — sessionen hänger ALDRIG på en obesvarad dialog |
| Auto-policy först | 4882–4904 | `permissions-policy.ts` allow/deny utan UI (headless/mål-läge) |
| Re-announce | `registreraInteraktion` 4990–4995 | Samma request-id igen ⇒ dialogen visas om men INGEN ny 30 s-timer; nya löfte kedjas på samma post |
| Idempotens | `besvaraInteraktion` 5013–5032 | `besvarad`-flag + delete ur registret; alla väntande löften får svaret |
| Dialogstädning vid sessionsslut | `rensaVantandeInteraktioner` 5046–5058 | Kassera/stäng ⇒ permission→deny, fråga→cancelled (anropas 3379, 3546, 3758) |
| Turn-tak (chatt) | `skicka` 5658–5670 | Hårt tak 10 min på den aktiva prompten + client-abort (`req.signal`) ⇒ `session/stop`-notis |
| Idle-fallback-slut | 5583–5593 | `state.updated idle` utan turn-event ⇒ klart efter 1,5 s |
| Självläkning vid sändning | 5705–5762 | Form-avvisad `-32602` ⇒ EN nedgradering; `-32031` modell död ⇒ markera i kartan + frisk session + EN åter-sändning |
| Mål-rensning retry | 4001–4015 | `-32010` under mål-turn ⇒ `session/stop` + 15 × 3 s omförsök |
| Compact idle-vakt | 3658–3668 | Väntar på idle med tak 2 min |
| Bilagor null-fallback | 5821–5913 | Varje steg avvisar ⇒ null (aldrig kast) + `v4/attachment/abort`-städning |
| Mock-paritet | 7415–7419, 7453–7457 | Mocken bär samma 30 s-defaulter (eskal/avbruten) |

**Bedömning:** på timeout- och retry-området är studion STARKARE än TUI:n
(TUI:n har inga av dessa timrar — där sitter en männikel framför skärmen;
studion är headless). Paritetsgapen ligger någon annanstans — se nästa
avsnitt.

---

## 3. GAP-ANALYS — vad saknar vi mot hängande strömmar/väntande verktyg?

### P0-1. Barnprocessens stdin/stdout/stderr saknar 'error'-lyssnare (stream-error-guard-mönstret ej portat)

`starta()` (1553–1570) lyssnar ENDAST på `data` (stdout/stderr) och
`error`/`exit` på själva barnprocessen. **Fyra reella hål:**
1. `barn.stdin` har INGEN lyssnare alls. `skickaRad` (1675–1680) kontrollerar
   `writable` synkront, men EPIPE efter barnets död levereras ASYNKRONT som
   `error`-event på stdin-strömmen — synkronchecken är ett TOCTOU-race och
   fångar den inte.
2. En `data`-lyssnare fångar INTE `error`-event — ett pipe-fel på
   stdout/stderr är också obevakat.
3. Node kastar obevakade stream-fel som uncaught exception.
4. Konsekvensen är den TUI:n beskriver ordagrant (index.ts:919–927):
   processen dör — hos oss är processen **hela Next-appen under pm2**,
   dvs. ALLA sessioner, tabbar, mål och barnprocesser dör för ett enda
   pipe-fel, plus RequestTimeout-fönster för kunden.

**Åtgärd:** i `starta()`: `barn.stdin?.on("error", …)`,
`barn.stdout?.on("error", …)`, `barn.stderr?.on("error", …)` — dirigera till
`så`-vägen (`lever=false` + befintlig omstartskedja), exakt
`watchStreamErrors`-mönstern men med vår omstart som nedgradering i stället
för TUI:ns exit. ~10 rader.

### P0-2. Ingen global processvakt (uncaughtException/unhandledRejection)

`grep` över hela `src/`: **0 träffar**. TUI:n har sin exitCode+stop()-upprullning;
Next-appen har ingenting — en enda oväntad kast (t.ex. P0-1, eller en bugg
i en lyssnare) startar om hela sajten i onödan. Åtgärd: processhandlers som
**loggar + sväljer** (barn-fel ska aldrig döda värden), monteras en gång vid
modulinit bredvid den befintliga globala hushållningsguardsen (~8633).
Försvar i djupet tillsammans med P0-1.

### P1-1. Client-abort löser inte väntande interaktioner direkt

`påAbort` (5671–5682) skickar `session/stop` och stänger strömmen — men
lämnar interaktionsregistret orört: dialogkortet lever kvar i UI:t och
protokollsvaret dröjer till 30 s-defaulten (escalate/cancelled). TUI:n
propagerar istället AbortSignal in i dialogen (index.ts:3275–3277) så den
löser DIREKT vid turn-abort. Ingen hängning (30 s-defaulten garanterar det)
men onödig latens + vilseledande UI. Åtgärd: anropa
`rensaVantandeInteraktioner()` i `påAbort` (metoden finns redan).

### P1-2. Mål-loopen saknar in-process vakthund

`malSenasteEventTid` skrivs (4190) men bevakas ALDRIG — den visas bara
(4056). En mål-turn som fastnar med LEVANDE barn (protokollet tiger, ingen
turn.completed) upptäcks enbart av externa pumpor (evighetsmotor,
styrelseronden). Chatt-prompter har 10-min-taket; mål-loopen har inget
motsvarande in-process. Åtgärd: en `setInterval` (unref) som vid
`malAktiv && !malPausad` och >15 min sedan `malSenasteEventTid` eldar
`mal-status-fel` + anropar den redan bevisade `sondMal()` (självläkning)
eller omstartskedjan vid upprepad tystnad.

### P2-1. 10-minuterstaket är stumt (bryter aktiva turner)

Taket (5658–5670) löper oavsett aktivitet: en turn med LEVANDE delta-ström
bryts hårt vid 10 min — och på serversidan FORTSÄTTER barnet turnen (taket
löser bara SSE-strömmen; nästa prompt kan sedan möta en upptagen session).
Långa rundor (ak1a-analys med Monte Carlo, stora repo-genomgångar) kan
överstiga 10 min. TUI:n har ingen tidsgräns alls (turnAbortController är
användarstyrd). Åtgärd: glidande deadline — förnya timern vid varje notis
på strömmen (samma `städa`/omstart-mönster), eller två lägen: 10 min vid
stillsamhet, 30 min totaltak. **OBS: produktval — ta med i styrelserond,
inte snabbfix.**

### P2-2. protokollFraga har ingen retry vid timeout

Engångs-timeout för alla anrop: en tillfällig timeout under tung last på
`session/create`/`subscribe` failar hela `ensure()`. TUI-köns princip —
"nästa request är alltid möjlig" — finns bara delvis (omstartskedjan täcker
döda barn, inte långsamma svar). Åtgärd: EN retry med kort backoff (t.ex.
1 s) endast för läsidempotenta anrop (`session/list`, `session/read`,
`session/messages`); skrivande anrop förblir engångs (de är inte
idempotenta). Mät först i loggarna hur ofta det slår — sänk prioritet om
sällan.

### P3-1. Vaktlogiken är invävda i en 8 700-radars fil

TUI:s vakter är 14–19 rader, rena, testbara enheter. Studions motsvarigheter
(ProtokollKlient-stängningen, omstartskedjan, interaktionsregistret) är
korrekta men ostrukturerat testbara. Åtgärd: extrahera till t.ex.
`lib/studio/barn-vakt.ts` + enhetstester. Lägsta prioritet — ingen direkt
kundpåverkan, men billigt när P0/P1 ändå rör koden.

### Noterat som OK (ej åtgärd)

- **FIFO-serialisering av dialoger** saknas i studion (flera kort kan synas
  parallellt); protokollet serialiserar själva per turn och webb-UI:t
  hanterar parallella kort — bedömt som medvetet webbmönster, inte gap.
- **Interaktionsregistret är redan giftimmunt** (`besvarad`-flag + delete)
  — permission-request-queue:s svans-sväljning har sin motsvarighet.

---

## 4. Prioriterad åtgärdslista (sammanfattning)

| # | Åtgärd | Storlek | Risk om ej åtgärdad |
|---|---|---|---|
| P0-1 | 'error'-lyssnare på barnets stdin/stdout/stderr → omstartskedjan | ~10 rader i `starta()` | EPIPE ⇒ kraschad Next-app ⇒ alla sessioner dör |
| P0-2 | Globala processhandlers (logga + svälj) vid modulinit | ~15 rader | Samma som P0-1 + alla oväntade kast |
| P1-1 | `rensaVantandeInteraktioner()` i `påAbort` | 1 rad | Dialogkort lever 30 s efter avbrott |
| P1-2 | Mål-loops-vakthund (15 min tystnad ⇒ sondMal/omstart) | ~20 rader | Fastnad autonom loop tills extern pump reagerar |
| P2-1 | Glidande turn-tak (styrelsebeslut) | ~15 rader | Långa giltiga rundor bryts vid 10 min |
| P2-2 | Retry ×1 på läsidempotenta protokollFraga | ~15 rader | Tillfälliga timeouts failar hela ensure() |
| P3-1 | Extrahera vaktmoduler + tester | refactor | Underhållbarhet |

**Rekommenderad ordning:** P0-1 + P0-2 i samma våg (kod, `leverera-kod`-
protokollet med tsc 0 + bygge under flock), P1-1 direkt efter (1 rad),
P1-2 nästa stabilitetsvåg, P2 via styrelserond (P2-1 är produktval).

---

## 5. Avgränsningar (KVD-ärlighet)

- Radnummer gäller `develop` vid 2026-09-14 (commit a085fb80); filen är
  aktiv — verifiera läget vid implementation.
- EPIPE-kedjan (P0-1) är härledd ur Node-semantik + TUI:ns egna kommentar
  ("Without a listener Node rethrows them and kills the process",
  index.ts:919–927), inte ur en observerad prod-krasch. Hypotesen är stark
  men ska bekräftas mot pm2-loggar vid implementationen.
- TUI-sidan är läst i `~/forskning/zcode-cli` (speglat källträd); inga
  ändringar har gjorts i zcode-cli eller i AK1:s src/ — detta dokument är
  ren forskningsleverans. Push till prod lämnas till huvudsessionen
  (undviker race med parallella fabriksagenter).

LEVERANS: data/forskning/zcode-kallkod/R3-VELTATER.md
