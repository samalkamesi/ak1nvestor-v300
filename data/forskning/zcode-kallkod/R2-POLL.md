# R2 — POLL-ARKITEKTUREN: hur officiella TUI:n håller sig färsk (1 s/5 s)

Expedition R2, våg 152. Källor: `packages/zcode-tui/src/runtime-poll.ts`,
`context-status-view.ts`, `index.ts` (poll-loopen), `runtime-projection.ts`
(projektionen) och `scripts/sync-runtime.ts` (transportbryggan) i
`/home/ak1a/forskning/zcode-cli/` — plus vår studio
(`src/app/api/studio/stream/route.ts`, `studio-chat.tsx`). ALL fakta nedan är
läst ur källkoden, radreferenser angivna. INGEN kodändring gjordes i src/.

## 1. TUI:ns poll-modell — två lager (event först, poll som skydd)

Det viktigaste fyndet: officiella TUI:n har INTE "en poll på 1 sekund". Den har
**två kompletterande mekanismer**, och pollern är den långsamma säkerhetsnäten
— inte den som ger känslan av "live":

### Lager A — event-driven refresh (den snabba vägen)

- Varje stream-event som INTE är en presentations-delta triggar en omläsning
  av runtime-tillståndet, **avdebouncerad till 80 ms**
  (`index.ts:5413-5421`, `scheduleRuntimeRefresh(delay = 80)`).
- Trigg-filtret `runtimeRefreshNeeded` (`runtime-poll.ts:34-41`): `part.delta`,
  `text_delta`, `reasoning_delta` och `tool_input_delta` ignoreras — de är ren
  presentation (tokenströmmar i textvyn) och ändrar inte projektionen. Däremot
  triggar `part.started`, `progress`, `result` m.fl. Testet
  (`test/runtime-poll.test.ts:56-72`) bevisar: 10 000 presentations-deltan ⇒
  0 refresh. Med andra ord: **strömmens deltas driver UI:t, icke-delta-eventen
  driver tillståndsprojektionen.**

### Lager B — adaptiv säkerhetspoll (1 s aktiv / 5 s vilande)

- Intervallerna (`runtime-poll.ts:12-13`):
  `ACTIVE_RUNTIME_POLL_INTERVAL_MS = 1_000`,
  `IDLE_RUNTIME_POLL_INTERVAL_MS = 5_000`.
- "Aktiv" (`index.ts:5424`, `runtime-poll.ts:21-24`) = **pågående turn**
  (`turnStartedAt !== undefined`) **ELLER** projektionen har tool calls med
  status `pending`/`running` (`isActiveRuntimeTool`) **ELLER** bakgrundsjobb
  med status `running` (`isActiveBackgroundJob`). Allt annat — inklusive
  misslyckade/avslutade jobb — är vilande.
- Pollern är en **självomplanerande setTimeout, inte setInterval**
  (`index.ts:5428-5432`): `refreshRuntimeState().finally(() =>
  this.scheduleRuntimePoll())` — nästa poll planeras FÖRST när föregående är
  klar, så överlappande frågor är omöjliga. Timern är `unref()`-ad (stänger
  aldrig av sig processen). Vid aktivitetsväxling kastas timern om
  (`rescheduleRuntimePoll`, `index.ts:5435-5441`) så 1s-läget slår in direkt.
- **Ingen exponentiell backoff finns** — fasta 1/5 s hela vägen; felskyddet
  är i stället koalescering + ändringsdetektering (nedan).

## 2. Vad som pollas (och hur billigt det är)

`refreshRuntimeState` (`index.ts:5505-5559`) gör TRE läsningar parallellt
(`Promise.allSettled` — en kraschad läsning dödar inte de andra):

1. `readRuntimeProjection()` — runtime-projektionen: sessionId, status, turn- och
   tokencount, **aktiva tool calls**, **bakgrundsjobb** (agentId,
   childSessionId, prompt, outputPath, stdout/stderr-svansar…), contextUsage
   (used/size + cache-statistik + prompt-komposition i tecken) och lastError
   (`runtime-projection.ts:107-125`).
2. `readTodos()` — todo-listan/grupperna.
3. `loadSessionContextMessages()` — ENDAST för cache-trenden; persistenta
   meddelanden sammanfogas in i projektionen
   (`mergeProjectionContextCache`, `runtime-projection.ts:380-409`) utan att
   röra runtime-interna.

**Transporten är in-process, inte HTTP.** Bryggan syns i
`scripts/sync-runtime.ts:692`: `readRuntimeProjection = async () => { … await
runtime.getProjection() … runtimeTaskRegistry.all() … }` — ett awaitat
metodanrop på runtime-objektet i samma process, berikat med bakgrunds-
jobbregistret. Svaret normaliseras defensivt
(`normalizeRuntimeProjection` — okända fält tappas tyst, aldrig krasch).

### Kostnadskontroll — tre knep som gör 1 s möjligt

1. **Koalescering** (`index.ts:5507-5515`): pågående läsning ⇒ kommande
   anrop sätter bara `runtimeRefreshPending`; do-while-loopen tömmer dem i
   samma svep. En fråga i taget, oavsett hur många events som smattrar.
2. **Ändringsdetektering** (`runtime-poll.ts:30-32`): `isDeepStrictEqual`
   mot föregående snapshot — **endast verkliga förändringar appliceras och
   renderas**. Pollern kan alltså fråga varje sekund gratis så länge inget
   händer; arbete sker bara på diff.
3. **Delta-filtrering** (lager A): den högfrekventa strömmen (text-/argument-
   deltan) triggar aldrig tillståndsläsningar.

## 3. context-status-view.ts — vyn ovanpå projektionen

- `ContextDetailView` visar tre sidor (översikt / cache-trend / komposition),
  växlas med 1/2/v, och har **manuell refresh på "r"** med egen
  in-flight-låsning (`context-status-view.ts:120-142`) — en supplementary
  läsning som ALDRIG får avbryta pågående turn (fel sväljs tyst, senaste
  goda snapshot behålls).
- Kontextvarningens trösklar (`context-status-view.ts:164`): ≥70 % gul,
  ≥90 % röd — samma tal vår kontextrad bör använda.
- Kompositionssidan visar **teckenuppskattningar, inte provider-tokens**
  (uttryckligen förklarat i vyn), och cache-trenden ritar per request:
  `█` cache-hit, `░` uncached, blank = data saknas — ingen interpolering,
  omstarter "smoothas" aldrig.

## 4. Studions nuvarande läge (läst ur vår kod)

| Kanal | Idag | Källa |
|---|---|---|
| POST /api/studio/stream | **SSE-push** under aktiva rundor; `verktyg_kort`/`verktyg_input` streamar live; heartbeat `: ping` var 15:e s; kontext + filändringar pushas EFTER klart | `stream/route.ts:377-383, 449-457` |
| Reconnect-poll (GET) | **15 s vid aktivt mål, annars 30 s**; pausar dolda flikar; hämtar HELA svaret: historik + `tradHistorik` (hela tråden ur db.sqlite) + kontext + interaktioner + sessionskarta + mål | `studio-chat.tsx:4798-4981` |
| mal/status (autonomi-badge) | 20 s, endast synlig flik | `studio-chat.tsx:6571-6578` |
| Tjänste-sektioner | 30 s, endast öppna sektioner + synlig flik | `studio-chat.tsx:6539-6549` |
| Styrelsemöte (pågående) | 3 s medan mötet kör | `studio-chat.tsx:6303` |
| Organ/förbrukning | 60 s | `studio-chat.tsx:3714, 3743` |
| UI-klocka | 1 s, ren lokal timer (ingen trafik) | `studio-chat.tsx:789` |

Formen är redan TUI-lik: **event-push när det händer något + poll som
säkerhetsnät, synlighetsstyrd**. Skillnaden är att TUI:ns poll är billig
in-process medan vår GET är tung.

## 5. Analys: SSE-push vs snabbpoll för studion

**TUI:ns 1 s får ALDRIG kopieras rakt av som HTTP-intervall.** Skälen:

- TUI:ns poll = ett awaitat metodanrop + `isDeepStrictEqual`. Vår
  reconnect-GET kör per anrop: transport-historik + kontext-läsning (frågar
  barnprocessen) + `lasTradHistorik` (läser HELA huvudtråden ur db.sqlite —
  växer för varje session) + interaktioner + sessionskarta. På 1 s-intervall
  blir det en IO-/CPU-slägga på Next-eventloopen, och pm2-processen som
  också bär alla SSE-hjärtan och agentfabriks-lasten tvingas köa.
- TUI:n betalar aldrig nätverk/proxy; en 1s-HTTP-poll från telefonen
  dessutom drar batteri och data i onödan när inget händer.

**SSE-push är redan rätt primärkanal** — den är exakt TUI:ns lager A
(event-driven, deltas streamas, icke-delta-event ger tillståndet). Det som
saknas är inte mer push utan TUI:ns **lager-B-egenskaper i reconnect-pollen**:
adaptivt intervall + ändringsdetektering + koalescering.

## 6. RAM-kalkyl på 8 GB Contabo

- Serverbudgeten är knapp: varje zcode-barn ~0,8 GB (cli 400-470 MB + repl-mcp
  ~390 MB, bevisat våg 146), agentfabrikens RAM-vakt vägrar ny omgång under
  1 500 MB tillgängligt, och pm2 + nginx + barnprocesser delar resten.
- **Lättvikts-poll (rekommenderad fas 2):** en versionsfråga som läser
  processminne/disk-cachad karta (turnCount, senastAktivitet, mål-flagga)
  kostar mikrosekunder och INGET nytt minne — kan köras var 2-5 s utan risk.
- **Tung hel-GET som idag:** OK på 15/30 s; farlig på ≤5 s (sqlite-läsning av
  hela tråden per anrop + JSON-bygge av hela historiken — CPU + GC-pressure
  som växer med trådens längd).
- **Stående server-SSE per klient (fas 3, frivillig):** ReadableStream +
  15s-hjärta ≈ några MB heap + en timer per klient. Med kundens 1-2 klienter
  försumbart — men tillståndet FÅR inte hålla transport-lås mellan pushar,
  och varje extra kanal är ännu en sak som kan läcka vid omstart. Poll är
  billigare i server-RAM eftersom inget per-klient-tillstånd lever mellan
  anrop. Slutsats: SSE-push lönar sig först när FLERA åskådare skall se
  samma session live; för en kund räcker poll + befintlig POST-SSE.

## 7. Stegvis plan (varje fas oberoende, ingen bryter våg 148-reglerna)

### Fas 1 — klient: adaptivt poll-intervall (TUI-mönstret, rent UI)
Byt reconnect-pollens fasta `15/30 s` mot självschemaläggande setTimeout
(aldrig setInterval — se `index.ts:5428`): nästa fördröjning = aktiv ? 5 s :
30 s. "Aktiv" definieras som TUI:n (`runtimeActivityActive`): pågående turn
i VALFRI session i sessionskartan ELLER aktivt mål. Paus dold flik finns
redan. Koalescering: hoppa över tick om föregående hämtning pågår
(in-flight-flagga) — aldrig överlappande GET.

### Fas 2 — server: lättvikts-ändringssignal (TUI:ns isDeepStrictEqual)
Ny GET-parameter `?sammandrag=1` på /api/studio/stream som svarar ENDAST en
liten versionstupp ur processminnet/kartan: `{turnCount, totalTokenCount,
senastAktivitet, antalInteraktioner, malAktiv}` — INGEN sqlite-läsning, ingen
barnprocess-fråga. Klienten pollar sammandraget (2-5 s vid aktivitet, 30 s i
vila) och kör den tunga full-GET ENDAST när versionen ändras. Detta är exakt
TUI:ns "polla ofta, arbeta bara på diff".

### Fas 3 — valfri: stående GET-SSE för vyn (endast om fas 1+2 känns segt)
`GET /api/studio/stream?live=1` → stående SSE som pushar sammandrags-diffar
(samma hjärta som POST-grenen). EventSource i klienten + reconnect-pollen
kvar som fallback när SSE:t dör. Krav: ingen transport-låsning mellan push,
push-intervall ≥ projektionsförändring, och RAM-mätning före/efter mot
agentfabrikens 1 500 MB-vakt.

### Fas 4 — mätning och stoppregler
- Fel-backoff som TUI:n SAKNAR men HTTP kräver: upprepade GET-fel ⇒ förläng
  intervalt stegvis till 60-300 s (serverns `live:false`-läge skall inte
  besvaras med besätt Poll).
- Bevakning: pm2-minne + händelseloop-lag vid fas 2/3; gränssnittsvakten
  efter UI-ändringar; inga nya poller under agentfabriksomgång.

## 8. Slutsats

Officiella TUI:s "1 s" är inte en magisk siffra utan en **form**:
event-driven refresh (80 ms debounce) + självschemaläggande adaptiv poll
(1 s aktiv / 5 s vila) + koalescering + deep-equal-diff — allt in-process.
Studion har redan rätt skelett (SSE-push + säkerhetspoll); rätt next steg är
fas 1+2 (adaptivt intervall + lättvikts-sammandrag), INTE 1s-HTTP-poll och
inte fler stående SSE-kanaler än kunden har åskådare.

— R2-expeditionen, våg 152
