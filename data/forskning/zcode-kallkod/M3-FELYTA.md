# M3 — Fel- och återställningsytan (felkoder, retry-policy, sessionsdöd)

> Fabriksuppdrag m3 i SKAPAREN-DJUPET-manifestet (skaparen-motorerna).
> Källa: officiell runtime `vendor/zcode.cjs` (zcode-app-cli 3.11.2-22,
> 12,6 MB bundle) — minifierade namn bevarade för återhittning.
> Systerdokument: R6-PREFLIGHT.md (−32010-forskningen), M2 (komprimering),
> M5 (fork), M1 (målmotorn).

## TL;DR

1. **Retry-policyn är EN kärna med TRE budgetar**: normala försök
   (max **11** attempt, exponentiell 2 s→60 s med jitter), stream-recovery
   (max **10** återhämtningsförsök för stalls/timeouts/rate limits under
   EN pågående ström) och start-plan-busy-admission (2 snabba försök,
   1 s + 2 s). En misslyckad modellförfrågan dödar **turnen** — aldrig
   sessionen.
2. **Sessionen "dör" bara när processen dör**: protokollfelet **−32004
   sessionUnavailable** kastas när sessionen varken finns i app-serverns
   minne ELLER kan återfuktas (cold resume) ur sessionStore/db.sqlite.
   Återfuktningsvägen finns och är automatisk ("cold resume flight",
   `reusePersistedMessages:!0`) — exakt det våg 148 byggde trådens
   permanens på.
3. **Leverantörens affärskoder (GLM/zai) är hårt kodmapperade** i en
   Map (`iee`, ~40 koder): vissa 429-liknande koder (3008/3009/3010
   "start-plan busy", 1304/1308/1310/1313, kvotkoderna 1316–1321/2056)
   är **retryable:!1** — de återförsökts ALDRIG automatiskt; 1302/1303/
   1305/3002/1312/1120/1230/1234/2007/500 är retryable:!0.
4. **Stream-vakthunden**: ingen ström-händelse på **10 min** (default
   `modelStream.idleTimeoutMs = 600 000`) ⇒ `model_stream_stalled`-event
   + `ModelStreamIdleTimeoutError` (kod `MODEL_STREAM_IDLE_TIMEOUT`) ⇒
   stream-recovery försöker fortsätta från senaste meddelande-ankare.

---

## 1. Livscykeln: fem händelser per modellanrop

Schemat `model.request.status` (requestId + status-enum) publiceras på
statusSink/telemetrin — detta är vad en klient (studion) KAN visa:

| Händelsetyp           | status     | Nyckelfält                                                        |
|-----------------------|------------|-------------------------------------------------------------------|
| `model_request_started` | kör      | attempt, transport, streamRecovery (visa endast om attempt>1)     |
| `model_request_completed` | completed | finishReason, durationMs                                        |
| `model_request_failed` | failed/cancelled | reason, retryable, statusCode, errorCode, errorPhase (prepare/response/stream/connect), streamOutputCommitted |
| `model_retry_scheduled` | waiting | delayMs, nextAttempt, reason, retryAfterMs, errorCode            |
| `model_stream_stalled` | waiting  | idleMs, timeoutMs                                                 |

UI-tillståndsmaskinen (`model.network.*`): `pendingRetryDelayMs` sätts
vid retry_scheduled och nollställs vid nästa started; en recovery-start
märks `kind:"api_retry"` med texten *"Model stream recovery retry
started"* (funkt. `fFe`). Cancelled (AbortError i fas "stream") rapporteras
som `model_request_cancelled`.

## 2. Retry-policyn (talfakta ur bunten)

**Default** (`GX` i `resolveAiSdkModelRetryOptions`):
`{ backoffFactor: 2, baseDelayMs: 2000, jitter: true, maxAttempts: 11, maxDelayMs: 60000 }`

Formel (`_N`): `delay = min(base × 2^(attempt−1), max)` ⇒ 2, 4, 8, 16,
32, 60, 60 … s. **Jitter**: multiplicera med slump 0,5–1,0 (aldrig kortare
än hälften). **Serverns `retry-after-ms`/`retry-after`-headers ÖVERRIDER**
den beräknade fördröjningen (även `x-should-retry`-headern loggas).

**Miljövariabler** (läses av `readRetryOptionsFromEnv`, alla valfria):
`ZCODE_MODEL_RETRY_MAX_RETRIES` (försök = värde+1), `ZCODE_MODEL_RETRY_BASE_DELAY_MS`,
`ZCODE_MODEL_RETRY_BACKOFF_FACTOR`, `ZCODE_MODEL_RETRY_MAX_DELAY_MS`.

**Retryable-avgörandet i ordning** (`e2e/getProviderBusinessCodeMapping` →
AI-SDK-defaults):
1. Leverantörens affärskod i Map `iee` (tabell §3) —.exakt träff styr.
2. Annars HTTP-status: `408 || 409 || 429 || ≥500` ⇒ retrybar (AI-SDK
   `APICallError.isRetryable`); 429 mappas till `model_rate_limited` +
   retryAfterMs.
3. Felklasser: `engine_overloaded_error`/`overloaded_error` ⇒ provider_
   overloaded retrybar; tom completion ("Model returned no text…") ⇒
   `canRetryEmptyCompletion`.

**Kö-försök kostar inte budget**: `ce?.kind==="queued" && (u-=1)` —
queued-försök (offpeak/3105) dekrementerar attempt-räknaren.

**Stream-recovery-budgeten** (`O9r`, `R9r=10`): gäller reason ∈
{stream_idle_timeout, rate_limited, server_error, network_error, timeout}
(mängd `Nli`), max **10** återhämtningsförsök per ström, ankare
`"previous-message-anchor"` (`Pli`) — strömmen fortsätter från senaste
meddelande, inte från början.

**Start-plan-busy** (providerIds `builtin:bigmodel-start-plan`,
`builtin:zai-start-plan`; koder `P9r={3008,3009,3010}`): admission-retry
med delay `M9r=[1000, 2000]` ms; efter slut på stream-recovery kastas
`StartPlanBusyAutoRetryExhaustedError` (code `model_rate_limited`,
retryable:!1, providerCode default "3010", meddelande "Start Plan is busy
and automatic model stream recovery reached the m…").

**Offpeak-idle-plan** (providerId `offpeak-idle-plan`): hakparenteskoder
`3102/3001` ⇒ ticketExpired ("off-peak-ticket-expired"); `3105` eller
HTTP 429 ⇒ queued med `delayMs = min(retryAfterMs ?? 60 000, 300 000)`.

## 3. Leverantörskodskartan (`iee`) — GLM/zai-affärskoder

| Kod | code | reason | retryable | Betydelse i praktiken |
|-----|------|--------|-----------|----------------------|
| 500 | model_request_failed | server_error | **ja** | generiskt serverfel |
| 1005 | model_request_failed | invalid_request | nej | felaktig request |
| 1006 | provider_not_configured | auth_failed | nej | autentiseringen saknas/fel (R2!) |
| 1008 | model_request_failed | unknown/network | nej | leverantörsfel, kör ej om |
| 1113 | model_request_failed | unknown/network | nej | −″− |
| 1120 | model_request_failed | server_error | **ja** | serverfel, kör om |
| 1230 | model_request_failed | server_error | **ja** | serverfel, kör om |
| 1234 | model_request_failed | network_error | **ja** | interna nätverksfel (även meddelandeflöden "500 internal network error" osv.) |
| 1261 | model_context_exceeded | context_exceeded | nej | kontexten full → komprimera |
| 1302/1303/1305/3002 | model_rate_limited | rate_limited | **ja** | tillfällig hastighetsgräns |
| 1304/1308/1310/1313 | model_rate_limited | rate_limited | nej | hård gräns — vänta/planera om |
| 1309/1311 | model_request_failed | unknown | nej | nya okända koder |
| 1312 | model_request_failed | provider_overloaded | **ja** | modellen överbelastad |
| 1314/1315 | model_request_failed | unknown | nej | leverantörsfel |
| 1316–1321, 2056, 20097 + insufficient_quota, credit_balance_exhausted, *_spend/usage_limit_exceeded, exceeded_current_quota_error | model_rate_limited | rate_limited | nej | **KVOT/SALDO SLUT** — bara kunden kan fixa |
| 2007 | model_request_failed | server_error | **ja** | serverfel |
| 3001 | invalid_model_request | invalid_request | nej | ogiltig request |
| 3006 | model_not_found | invalid_request | nej | modellen finns ej |
| 3007 | invalid_model_request | auth_failed | nej | auth-problem |
| 3008/3009/3010 | model_rate_limited | rate_limited | nej | start-plan busy (särskilt flöde §2) |
| rate_limit_reached_error / rate_limit_error (typnamn) | model_rate_limited | rate_limited | **ja** | — |
| engine_overloaded_error / overloaded_error (typnamn) | model_request_failed | provider_overloaded | **ja** | — |

Övriga felkods-enum i modellskiktet (`ft`): invalid_model_ref,
model_config_missing, provider_not_found, provider_not_configured,
model_not_found, invalid_model_request, invalid_model_response,
model_request_failed, model_request_cancelled, model_request_timeout,
model_rate_limited, model_context_exceeded.
Failure-reasons (`it`) = retry-reasons (`en`: rate_limited,
provider_overloaded, server_error, network_error, timeout,
stream_idle_timeout, stale_connection, auth_refresh,
reasoning_signature_repair, offpeak_queued) + auth_failed, cancelled,
context_exceeded, invalid_request, provider_not_configured, proxy_error,
tls_error, unknown. Retry-reason `reasoning_signature_repair` = modellen
bröt signaturkedjan → automatiskt omförsök med repair.

## 4. Protokollkoder −32xxx (app-servern ↔ klient)

**ZCode-protokollet** (XB + direkta `qa`-kast, `ProtocolRequestError`):

| Kod | Meddelande (ur bunten) | När |
|-----|------------------------|-----|
| **−32004** sessionUnavailable | "Session is not active: X" / "Session not found: X" / "Cannot resolve … message" | sessionen saknas i minnet OCH i store; eller ogiltig meddelandereferens |
| −32003 | "Cannot import session history without session store" | historikimport utan store |
| −32009 | "Session state revision mismatch" | klientens state-revision är inaktuell — ladda om |
| **−32010** | "A prompt is already running for this session" | sänd-vakt (`activeAbortController` lever); se R6 |
| −32012 | "Workspace model catalog revision mismatch" | modellkatalogen ändrats under fötterna |
| −32013 | "Provider registry revision mismatch" | leverantörsregistret ändrats |
| −32014 | "Model runtime revision mismatch" | runtime bytt |
| −32031 | "Background task cancellation is not supported by this session runtime" | bakgrundsabort på runtime utan stöd |
| −32600/−32601/−32602/−32603 | JSON-RPC-standard (invalid request/method/params/internal) | t.ex. −32600 när generateText redan kör för workspace |

**MCP-protokollet** (enum `Kn`): −32700 ParseError, −32600 InvalidRequest,
−32601 MethodNotFound, −32602 InvalidParams, −32603 InternalError,
−32002 ResourceNotFound (mappas UTÅT till −32602 via `encodeErrorCode`),
−32020 HeaderMismatch (protocol-version-header vs body), −32021
MissingRequiredClientCapability, −32022 UnsupportedProtocolVersion, −32042
UrlElicitationRequired. I MCP-probningen klassas {−32001, −32020, −32021}
som **auth-seam-escape** (`SBo`, `markAuthSeamEscape`) — dvs. felet kan
bero på autentiserings-skiktet, inte verktyget.

**gRPC/connect-transportskoder** (standarduppräkning i bunten): OK,
CANCELLED, UNKNOWN, INVALID_ARGUMENT, DEADLINE_EXCEEDED, NOT_FOUND,
ALREADY_EXISTS, PERMISSION_DENIED, RESOURCE_EXHAUSTED, FAILED_PRECONDITION,
ABORTED, OUT_OF_RANGE, UNIMPLEMENTED, INTERNAL, **UNAVAILABLE**, DATA_LOSS,
UNAUTHENTICATED — leverantörsklassificeringen mappar gRPC UNAVAILABLE/
network/proxy/tls-strängar → `provider_network_error` respektive "auth".

**Agentverktygets koder (W1)**: agent_subagent_unavailable (recoverable:!0
i Agent-sammanhanget när port saknas: !1), agent_background_unavailable
(recoverable:!0), agent_unknown_type, agent_child_runtime_failed —
barnagentens runtime dog; fabrikens döda-barn-LOGGNING är rätt svar.

**CoreError-enum** (för hela runtimen): session_not_found,
session_already_exists, session_corrupted, turn_not_found, turn_in_progress,
invalid_turn_phase, turn_cancelled, model_error, model_timeout,
model_rate_limited, model_context_exceeded, tool_not_found,
tool_execution_failed, tool_timeout, tool_cancelled, tool_max_calls,
invalid_input, permission_denied, permission_escalation, permission_timeout,
invalid_state_transition, event_out_of_order, projection_corrupted,
storage_error, configuration_error, cancelled, unknown_error.

## 5. När dödas sessionen? (svar: nästan aldrig av fel)

- **Misslyckad modellförfrågan** (icke-retrybar) ⇒ `finishFailedCall` ⇒
  turnen avslutas med `TurnError` (telemetri `turn.failed`). Sessionen
  och dess historik LEVER kvar.
- **−32004** uppstår när: (a) sessionen saknas i app-serverns minnesmap
  (`sessions.size` loggas) OCH sessionStore saknar/nekad den; (b) fel-
  prenumeranten inte kan återfukta (`resumePersistedSession` saknas); (c)
  ogiltig meddelandereferens. **Cold resume**: app-servern återfuktar på
  efterfrågan — "cold resume flight created/joined/cleared" + händelsen
  `zcode_protocol.session_resume.deferred_model_adapter`; v4-varningen
  `v4.resume_persisted_missing` loggas när inget finns i databasen.
  Persistenskällan = `~/.zcode/cli/db/db.sqlite` (trådbokens sanning).
- **Processdöd**: barnprocesser/MCP-servrar städas med stege SIGTERM →
  grace (750 ms resp. 1–3 s beroende på bana) → SIGKILL på processgruppen
  (`kill(-pid)`); föräldralösa MCP-stdio-processer sveps med SIGKILL.
  När app-serverprocessen DÖR förloras minnessessionerna — men cold
  resume ur db.sqlite återställer dem vid nästa anrop.
- **Stream-stall** dödar inte: 10 min tystnad (default
  `modelStream.idleTimeoutMs = 600 000`, konfigurerbar i settings under
  nyckeln `modelStream.idleTimeoutMs`) ⇒ stall-event + recovery-försök
  (upp till 10) innan turnen misslyckas.
- Övriga watch-koder: `MODEL_REQUEST_TIMEOUT`, `MODEL_REQUEST_CANCELLED`,
  `MODEL_NETWORK_ERROR`, `MODEL_SERVER_ERROR`, `MODEL_RATE_LIMITED`
  (stream-recovery-setet), `MODEL_TLS_VALIDATION_FAILED`,
  `ZCODE_RUNTIME_MODEL_UNAVAILABLE` ("historisk uppgifts modell finns ej
  längre — välj en ny"), telemetri-flaggorna
  `ZCODE_MODEL_TELEMETRY_ENABLED`.

## 6. STUDIO-ÅTGÄRDER: kod → betydelse → åtgärd (huvudtabellen)

| Kod/tecken | Betydelse | Studio-åtgärd (webchat) |
|------------|-----------|------------------------|
| `model_retry_scheduled` (event) | omförsök om delayMs | Visa "återförsök om X s" (pendingRetryDelayMs), INTE ny POST — poll fortsätter |
| `model_stream_stalled` (event) | strömmen tyst, vakthund | "Svaret dröjer"-indikator; ingen användaråtgärd före 10-minutsgränsen |
| `model_request_failed` + retryable:!0 | tillfälligt fel, körs om automatiskt | Tyst för kunden; visa bara om sista försöket misslyckas |
| `model_request_failed` + retryable:!1 (sista) | turnen dog | Felkort + "försök igen"-knapp; historiken finns kvar (turn ≠ session) |
| 429 / model_rate_limited (1302/1303/1305/3002) | hastighetsgräns, retrybar | Vänta ut retry-after; visa köräknare vid offpeak-queued (60 s–5 min) |
| 3008/3009/3010 + StartPlanBusyAutoRetryExhausted | start-plan-uppställning full | Visa "plan-modellen är upptagen — försök om en stund"; automatik gör 2+10 försök först |
| 1304/1308/1310/1313 | hård rate limit, ej retrybar | Backa planerat anrop 5–15 min; öka inte parallellismen |
| 1316–1321/2056/20097/insufficient_quota/… | KVOT/SALDO SLUT | **MEDDELA KUNDEN** — fakturering är R2 (agenten rör aldrig) |
| 1006/3007 (auth_failed/auth_refresh) | nyckel/config fel | Eskalera till kund — R2-yta (ALDRIG röra .env/nycklar) |
| 1261 / model_context_exceeded | kontexten full | Erbjud "komprimera" (M2-motorn) eller ny tråd |
| 3006 / model_not_found / ZCODE_RUNTIME_MODEL_UNAVAILABLE | modellen borta | Välj om modell ur katalog (revision −32012 kan kräva omläsning) |
| 500/1120/1230/1234/2007/1312 | serverfel/överbelastning, retrybar | Automatiken sköter (11 försök, ~5,5 min tak); informera först vid totalmiss |
| **−32004** sessionUnavailable | session ej aktiv/hittad | Klienten: ladda om tråden via GET (tradHistorik) — cold resume återfuktar ur db.sqlite; POST medan session kall → vänta på resume |
| −32009/−32012/−32013/−32014 | state/katalog/registry-revision | Ladda om klientsidans state (våra server-sparade inställningar, våg 93) |
| **−32010** | prompt kör redan | Kö-system R6-stilen: köa meddelandet, skicka när turn är klar — ALDRIG parallell POST |
| −32031 | bakgrundsabort stöds ej | Avbryt i förgrunden istället |
| MCP −32020/−32021/−32022/−32002/−32042 | MCP-protokollfel/versionsfel | Kontrollera MCP-serverversion/headers; auth-seam-misstanke vid −32001/−32020/−32021 |
| agent_child_runtime_failed / agent_subagent_unavailable | barnagent dog/saknas | Fabriksmönstret: LOGGA döda barn, kör ALDRIG om klara uppgifter, nästa omgång tar resterna |
| turn.failed (turn_error) | turnen misslyckad | Felkort + återuppta-knapp; målet återarmas vid näste GET (M1) |
| gRPC UNAVAILABLE | transport nere mot leverantör | Klassas provider_network_error → automatisk omretry; kolla nät vid upprepning |

## 7. Rekommendationer till studion (konkret)

1. **Prenumerera på de fem status-händelserna** ovan och visa tre
   tillstånd i UI: kör / väntar (med nedräkning från delayMs) / misslyckades
   (med kod + mänsklig text ur tabell §6). Det räcker — inga egna
   gissningar om retry behövs, runtimen äger policyn.
2. **Skriv ALDRIG om en retrybar enskild Attempt** för kunden ("66 %
    misslyckade anrop" av 11 försök = EN lyckad). Räkna CALL:ar
   (started→completed/failed-final), inte attempt.
3. **−32010-förhindrandet** (R6): en input-kö i studions webchat som
   håller kundens nästa meddelande tills turn_complete/turn_error —
   samma vakt som TUI:n.
4. **Kvot- och auth-koderna är larm-värda**: skilj dem i telemetrin som
   `KRÄVER KUND` (R2) från `AUTONOMT ÅTERHÄMTAD` — då kan gränssnitts-
   vakten/ronden larma rätt väg direkt.
5. **Retry-env-variablerna** (§2) är en ventil om studion vill korta
   ner max försök för snabbare feedback i webchat (t.ex. MAX_RETRIES=4)
   — men default 11 är bevisat tåligt mot GLM:s 5xx-perioder.

## 8. Återhämtningskedjan sammanfattad

```
request → started
  ├─ ok ──────────────── completed → (turn fortsätt)
  ├─ fel retrybar ────── failed(retryable) → retry_scheduled(delayMs)
  │                        └→ started(attempt+1) … tills completed
  │                           eller attempt 11 ⇒ turn_error (session LEVER)
  ├─ ström tyst 10 min ─ stream_stalled → recovery-started
  │                        (×10 budget, previous-message-anchor)
  ├─ start-plan busy ─── admission-retry 1s, 2s … exhaustion
  │                        ⇒ StartPlanBusyAutoRetryExhausted (ej retrybar)
  └─ abort ───────────── cancelled
session dör endast: processdöd (SIGTERM→SIGKILL) utan fungerande
sessionStore ⇒ nästa anrop får −32004 tills cold resume ur db.sqlite.
```

---
*Skapad av fabriksagent (m3) 2026-09-14. Alla strängar verifierade med
grep -o-kontext i vendor/zcode.cjs; minifierade namn (GX, _N, iee, ft, it,
en, XB, Kn, W1, R9r, Nli, P9r, M9r, fSo, mSo) bevarade för återhittning.*
