# R4 — HOOKS-YTAN i zcode-cli (källkodskarta)

**Forskning R4 · 2026-09-14 · Källor:** installerad bundel
`/home/ak1a/.npm-global/lib/node_modules/zcode-app-cli/vendor/zcode.cjs`
(12,6 MB, minifierad — offset-referenser nedan är byte-offset i den filen) samt
forskningsträdet `/home/ak1a/forskning/zcode-cli` (där ENDAST
`config.example.json` nämner hooks — docs/ har inget hooks-avsnitt, bundeln är
enda sanningskällan). Metod: node-sonder (`grep -o` + kontextextraktion) runt
identifierarna `SessionStart|PostToolUse|runHooks|hookEvent` etc.

**Syskonrapport:** R1-PROTOKOLLET.md (app-serverns metodyta), R2-POLL.md,
R3-VELTATER.md, R5-PLUGINS.md, R6-PREFLIGHT.md.

---

## 1. Sammanfattning (TL;DR)

- **Hooks finns fullt implementerade i core-runtimen** — ett eget delsystem
  (`core.hooks`) med runner, tidsgränser, sandbox-attribut, sekretesanering och
  ett avancerat **förtroendesystem för arbetsyte-hooks** (sha256-digestar +
  trust store + granskningsflöde).
- **Aktivering går INTE via `config.features`** (features = compact, rewind,
  subagent, memory, skill, mcp — hooks finns inte där). Aktivering sker via
  **egen toppnyckel `hooks`** i config: `hooks.enabled: true` +hooks definierade
  under `hooks.events.<Event>`.
- **7 event, bekräftade i två oberoende scheman:** `SessionStart`,
  `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PostToolUse`,
  `PostToolUseFailure`, `Stop`.
- **Svarsformatet är Claude Code-kompatibelt**: hook-processen får JSON på
  stdin (med `session_id`, `tool_name`, `prompt`, `last_assistant_message` …),
  miljövariabler `ZCODE_SESSION_ID`/`CLAUDE_SESSION_ID` m.fl., exit 0 + valfri
  JSON på stdout; **exit 2 = blockerande**.
- **Studio-telemetri: JA, genomförbart** — lägga `SessionStart`/`Stop`-hooks i
  `~/.zcode/cli/config.json` (användarscopet) körs **direkt, utan
  förtroendegranskning** (den gäller bara projekt-hooks ur `zcode.json`/
  `.zcode/config.json`). Rekommendation: `type:"command"` + `async:true` +
  nodemanus som POSTar till localhost. Detaljer + risker i § 7–8.
- **Största fallgropen:** `Stop` fejar per **svar/turn**, INTE per session —
  telemetrivolymen blir en POST per modellsvar, inte en per session.

---

## 2. Konfigurationsytan (config.json)

### 2.1 Aktivering — `hooks`-nyckeln, inte `features`

`config.example.json` (forskningsträdet) och default-objektet i bundeln
(offset ~755400) överensstämmer:

```json
"hooks": {
  "enabled": false,            /* AKTIVERINGEN — default false */
  "timeoutMs": 60000,
  "maxOutputBytes": 32768,
  "events": {
    "SessionStart": [], "UserPromptSubmit": [], "PreToolUse": [],
    "PermissionRequest": [], "PostToolUse": [], "PostToolUseFailure": [],
    "Stop": []
  }
}
```

Default i bundeln: `hooks:{enabled:!1,events:{},maxOutputBytes:32768,timeoutMs:6e4}`.
`features`-objektet innehåller INGET hooks-flagga — frågan "config.features?"
besvaras med **nej**. (Reason-koden `workspace_hooks_feature_disabled` gäller
arbetsyte-hook-undersystemets egen gate, se § 5.)

### 2.2 Hook-deklarationer

Varje event tar en lista matchers, varje matcher en lista hooks
(Zod-schema `HAo`/`Oca`, offset ~6953000 och ~755000):

```json
"SessionStart": [
  {
    "matcher": "startup",              /* valfri — se § 4.3 */
    "hooks": [
      {
        "type": "command",             /* "command" (shell) | "process" (argv) */
        "command": "node /path/till/hook.mjs",
        "enabled": true,               /* valfri per-hook-brytare */
        "async": true,                 /* true = kör i bakgrunden, kan ej blockera */
        "shell": "/bin/bash",          /* valfri annan shell (endast type:command) */
        "timeoutMs": 10000,            /* per-hook; "timeout" i sekund finns också */
        "statusMessage": "Trafiklogg"  /* valfri UI-etikett */
      }
    ]
  }
]
```

`type:"process"` tar `args: [...]` och kör utan shell (säkrast mot injection);
`type:"command"` kör kommandosträngen i shell med stöd för mallvariabler
(`${ZCODE_SESSION_ID}`, `${CLAUDE_PROJECT_DIR}` m.fl. — whitelist i
`expandPluginVariables`, offset ~10467000).

### 2.3 Merger över scopes

Scopes: System < User (`~/.zcode/cli/config.json`) < Project (`zcode.json`,
`.zcode/config.json` i projektträdet) < Session < Env < Cli (funktion
`mergeHooksConfig`, offset ~6956000):

- **`enabled` OR:as** — `true` i NÅGON scope aktiverar hela ytan.
- **Event-listorna KONKATENERAS** — hooks från flera scope adderas, de
  högre prioriterade scope (projekt) sorterar FÖRE användar-hooks per event
  (`insertWorkspaceHooks`, offset ~10485893: projekt-hooks skjuts in före
  första non-user-config-hooken per event).
- `timeoutMs`/`maxOutputBytes`: sista värdet (högst prioriterade scope) vinner
  som default; per-hook `timeoutMs` överstyr.

### 2.4 Läge på servern just nu

`~/.zcode/cli/config.json` (läst 2026-09-14): `hooks` finns, `enabled:false`,
sju tomma event-listor — ytan är orörd. `/home/ak1a/AK1` har INGA
`zcode.json`/`.zcode/config.json` → inga projekt-hooks, inget trust-läge aktivt.

---

## 3. De 7 eventen — var de avfyras och vad nyttolasten innehåller

Anropsställen verifierade i bundeln (agentloop offset ~10955000–11055000,
verktygsexekutor ~7834000–7850000). Hook-processen får ALLTID en
Claude-kompatibel JSON på stdin (`createClaudeCompatibleHookStdin`,
offset ~10466600): `agent_type`, `hook_event_name`, `permission_mode`,
`session_id`, `transcript_path` (tempfil med sista meddelandet), plus
eventfälten nedan ( snake_case-alias + camelCase passerar med).

| Event | Avfyras | Extra fält på stdin | Matcher matchar |
|---|---|---|---|
| `SessionStart` | EN gång per session (guard `sessionStartHookRan`), vid startup OCH resume | `source` ("startup"/"resume"), `model`, `cwd` | **source-värdet**, inte verktyg |
| `UserPromptSubmit` | vid varje användarprompt | `prompt`, `attachments_summary` | (ingen matchValue → matcher ignoreras) |
| `PreToolUse` | före varje verktygskörning | `tool_name`, `tool_input`, `tool_use_id`, `risk_level` | verktygsnamnet |
| `PermissionRequest` | när ett verktyg kräver godkännande (kapar lopp med broker: först-kommen vinner) | `tool_name`, `tool_input`, `permission_suggestions`, `request_id` | verktygsnamnet |
| `PostToolUse` | efter lyckad verktygskörning | `tool_name`, `tool_response`, `tool_result_preview` | verktygsnamnet |
| `PostToolUseFailure` | efter misslyckad/avbruten verktygskörning | `error`, `error_details`, `is_interrupt` | verktygsnamnet |
| `Stop` | **efter varje modellsvar** (per turn!) — med continuation-loop om hooken svarar `continue:true` | `last_assistant_message`, `stop_hook_active`, `tool_call_count` | (ingen matchValue → matcher ignoreras) |

Miljövariabler till hook-processen: `ZCODE_SESSION_ID`,
`ZCODE_PROJECT_DIR`, `CLAUDE_SESSION_ID`, `CLAUDE_CODE_SESSION_ID`,
`CLAUDE_PROJECT_DIR` (+ `*_PLUGIN_*` för plugin-hooks).

### 3.1 Svarsformat (stdout, exit 0)

Valfri JSON (`k3t`-schemat): `continue` (false = blockera; på Stop true =
fortsätt), `decision` ("approve"/"block"), `reason`/`stopReason`,
`systemMessage`, `suppressOutput`, `additionalContext` (injekteras i
meddelandehistoriken som `hook_context`-post), samt `hookSpecificOutput` per
event: PreToolUse `permissionDecision: allow|ask|deny` + `updatedInput`;
PermissionRequest `decision.behavior: allow|deny` + `permissionUpdates`
(addRules allow/deny/ask). **Exit 2 = blockerande genväg** (PreToolUse→deny,
PermissionRequest→deny, Stop→block). Övriga exit-koder = hook-fel (recoverable,
loggas + `hook_run_failed`-event).

### 3.2 Matcherns syntax

`matchesHookMatcher` (offset ~10475000): tomt/`*` = allt; `A|B` = exakta
alternativ (endast bokstäver/siffror/`_|`); annars tolkas strängen som
**RegExp** mot verktygsnamnet.

---

## 4. Exekveringsmotorn

`InMemoryHookRunner` (offset ~10477000) + fabriken
`createConfiguredHookRunner` (offset ~10483800):

1. **Runner skapas** i sessionskonstruktionen (offset ~11192366) OM
   `config.hooks.enabled === true` ELLER en workspace-hook-snapshot finns —
   annars blir `hookRunner` odefinierad och ALLA hook-anrop returnerar tomt
   (noll kostnad när ytan är av).
2. **Registrering:** config-hooks byggs ur sammanslagen konfig (källa
   `config.<Event>.<i>.<j>`, sourceKind "config"/"user"); projekt-hooks ur
   snapshot (källa `project.<reviewItemId>`) med varsin **admission-gate**.
3. **Körning per event:** synkrona hooks awaited i sekvens med timeout
   (default 60 s, `timeoutMs` per hook); `async:true`-hooks körs
   fire-and-forget i bakgrunden — **deras stdout tolkas inte, de kan inte
   blockera**.
4. **Output-skydd:** stdout/stderr kapas av `maxOutputBytes`; ALL
   visningstext saneras mot sekretesmönster (URL-uppgifter,
   `authorization`, `api_key`, `password`, `secret`, `token` … → `••••`,
   `sanitizeHookDisplayText` offset ~10469000).
5. **Livscykel-UI:** varje hookkörning emitterar sessionsevent
   `hook_run_started|progress|completed|failed|blocked` (payload: kommando,
   duration, outcome, felpreviews) — synliga i klientens händelseström, dvs
   **studion kan visa hook-körningar utan egen polling**.
6. **Internt bruk:** runtimen använder själv hooks för styrbarhet
   (mailbox-drain på PostToolUse/Stop, offset ~10486400) — ytan är
   produktionsmogen, inte experimentell.

---

## 5. Förtroendesystemet för ARBETSYTE-hooks (project scope)

Projekt-hooks (`zcode.json` + `.zcode/config.json`, upptäckta från
arbetskatalogen upp till `.git`-roten, deduplicerade) går igenom ett eget
säkerhetsskikt (offset ~755500–767000, ~10489000–10500000, ~11895000):

- **Snapshot + digestar:** varje hook-deklaration får sha256
  (`hookDeclarationDigest`), hela bunten en `bundleDigest`. Ändrad deklaration
  → `stale_digest` → förtroende återkallas.
- **Trust States:** `not_applicable`, `pending_trust` (default, kör EJ),
  `trusted_persistent`, `blocked_untrusted`, `blocked_policy`, `revoked`,
  `stale_digest`. Trust lagras i en trust store; beslut tas via ett
  **granskningsflöde** (interaktioner `workspace_hook_review_settled` etc.).
- **Policy-lägen:** `deny` | `user_decides` | `allow_trusted_only`.
- **Host-krav:** värden måste vara "trust capable" (implementera
  gransknings-UI) — annars `workspace_hooks_require_trust_capable_host` och
  projekt-hooks körs ALDRIG.
- **Fail closed:** kastar admission-gaten fel → `workspace_hooks_blocked_untrusted`.

**Viktiga konsekvensen för AK1A:** användar-hooks ur
`~/.zcode/cli/config.json` registreras ** utan admission-gate** (bara
`enabled:true` + deklaration) — det är den vägen telemetrin ska ta. Skulle vi
istället lägga hooks i repots `zcode.json` hamnar de i pending_trust och kräver
granskningsflöde + kapabel host — rätt så, det är skyddet mot maliciösa
repo-hooks, men fel väg för telemetri.

---

## 6. Studio-frågan — kan studio konfigurera hooks?

**Ja, indirekt.** App-cli-paketet (`dist/`) har NOLL hook-referenser — den
app-server som studion pratar med omsluter bara core-runtimen, och runtimen
läser `~/.zcode/cli/config.json` vid varje sessionsstart. En
studiosession (eller huvudagenten) kan alltså:

1. Skriva hook-deklarationer till `~/.zcode/cli/config.json` (atomär
   läs-modifiera-skriv via node, bevara övriga nycklar — filen innehåller
   provider-API-nycklar och är serverns livsnerv).
2. NÄSTA zcode-session (ny studiosession, fabrikens barn, cron-barn) plockar
   upp dem — hook-registrering sker vid sessionskonstruktion, inte i
   efterhand.

Det finns INGET app-server-API för att sätta hooks per session live (inga
`hooks`-metoder i protokollet, jfr R1-PROTOKOLLET.md) — filvägen är den enda.

---

## 7. Telemetri-recept (SessionStart/Stop → trafiklogg)

### 7.1 Förslag på config-andring (i `~/.zcode/cli/config.json`)

```json
"hooks": {
  "enabled": true,
  "timeoutMs": 10000,
  "maxOutputBytes": 8192,
  "events": {
    "SessionStart": [
      { "hooks": [ { "type": "command",
          "command": "node /home/ak1a/AK1/verktyg/trafiklogg-hook.mjs",
          "async": true, "timeoutMs": 8000,
          "statusMessage": "Trafiklogg: session" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command",
          "command": "node /home/ak1a/AK1/verktyg/trafiklogg-hook.mjs",
          "async": true, "timeoutMs": 8000,
          "statusMessage": "Trafiklogg: svar" } ] }
    ]
  }
}
```

### 7.2 Hook-manus (skiss, `verktyg/trafiklogg-hook.mjs`)

Läser stdin-JSON, plockar MINIMALT med fält — `hook_event_name`,
`session_id`, `source` (SessionStart), `timestamp`, `agent_type` — och POSTar
till `http://localhost:3000/api/studio/trafiklogg` (loopback, whitelistad i
middleware). **Skicka INTE `prompt`/`last_assistant_message`** (GDPR-minimi,
se § 8.6). Alltid `process.exit(0)` — även vid nätverksfel (fångas, ingen
stdout, ingen blockering).

### 7.3 Varför async + user scope + node

- `async:true` → kör i bakgrunden, stdout tolkas ej, kan per design inte
  blockera en turn (motverkar § 8.2).
- User scope → ingen trust-granskning krävs (§ 5).
- `node <skript>` → skal-kvotens bevisat pålitliga kanal; dessutom är
  `type:"command"` med fast kommando utan mallvariabler injection-säkert.

---

## 8. Riskanalys

| # | Risk | Allvar | Åtgärd |
|---|---|---|---|
| 1 | **`Stop` fejar per modellsvar** (turn), inte per session — POST-volym = antal svar över ALLA sessioner (studio + fabriksbarn + styrelse-cron + TUI) | HÖG (volym/dubbelräkning) | Deduplicera/räkna per session_id i trafikloggen; överväg ENBART SessionStart (sant per-session-mått) i fas 1 |
| 2 | **Blockerande svar stoppar arbetet**: exit 2 eller `decision:"block"`/`continue:false` nekar verktyg/avbryter turn | HÖG om fel config | Telemetri-hooks: `async:true` (output tolkas ej) + alltid exit 0; skicka ALDRIG JSON på stdout från telemetri |
| 3 | **Global yta**: `hooks.enabled:true` gäller ALLA zcode-processer på servern — fabrikens omgångar om 3 barn, cron-jobb, varje studiosession | MEDEL | Volymsiffror först (rond F ≈ 10-tals sessioner/dag → ok); statusMessage för synlighet; nödavstängning = `enabled:false` (verkar från nästa session) |
| 4 | **Config-filen är ömtålig**: `~/.zcode/cli/config.json` innehåller provider-nycklar; trasig JSON = ALLA sessioner dör (studio + fabrik + cron) | HÖG | Atomär läs-modifiera-skriv via node-script med JSON-validering + backup + mode 0600; ALDRIG manuellt redigering i Produktion; filen commit-as ALDRIG till repot |
| 5 | **Felbrus vid deploy/omstart**: om pm2 nere (`/api/...` svarar ej) fejar varje Stop-hook → `hook_run_failed`-event + warn-loggar i sessionerna | LÅG | Fånga fel i manus (catch → exit 0); hook failures är recoverable och påverkar ej svaret |
| 6 | **GDPR**: UserPromptSubmit bär `prompt`, Stop bär `last_assistant_message` (kundtext/analysinnehåll) — inte trafiklogg-material | MEDEL | Hook-manus filtrerar fält (endast metadata, § 7.2); logga aldrig prompt/answer-innehåll utan separat beslut |
| 7 | **Latens/resurs**: varje event spawnar en node-process (~50 MB kort tid); SessionStart är awaited före första turn om inte async | LÅG | `async:true`; per-hook `timeoutMs` 8 s; vid 100-tals Stop/dag försumbart på Contabo |
| 8 | **Matcher-förvirring**: SessionStart-matcher matchar `source` ("startup"/"resume") — `"matcher":"Bash"` hade gjort hooken död | LÅG | Utelämna matcher (matchar allt) för telemetri |
| 9 | **Felpostiv hook output kan störa agenten**: `additionalContext` från stdout injiceras i meddelandehistoriken (`hook_context`) | MEDEL | Samma som #2: telemetri skriver inget till stdout |
| 10 | **Projekt-scope-fälla**: hooks i repots `zcode.json` ser "enklare ut" men kör aldrig (pending_trust, host ej trust-capable i app-server) | LÅG | Dokumenterat här; user scope är vägen |

**Angreppsyta-/säkerhetsnotering:** hook-kommandon körs med serverns
användarrättigheter — config-filens ägarskap (ak1a, 0600) ÄR
behörighetsgränsen. Maliciös repo-hook blockeras av trust-systemet (fail
closed) — bra design, inget åtgärdsbehov från oss.

---

## 9. Nästa steg (förslag, ej verkställt)

1. Fas 1: bara `SessionStart`-hook → POST `{session_id, source, ts}` till
   befintlig logg-yta (t.ex. utvidga `/api/studio/stream`-status eller egen
   `data/infra/trafik/`-loggfil). Observera volym en vecka.
2. Fas 2 (om per-svar-mått behövs): lägg `Stop` med fältfilter, räkna per
   session_id.
3. Eventuellt UI: `hook_run_*`-eventen finns redan i sessionströmmen —
   studion kan visa "Trafiklogg: session ✓" utan nya poller.

*Utanför detta uppdrag: verktyg/trafiklogg-hook.mjs och config-andringen är
INTE skrivna — detta är kartan; verkställande beslutas i rond/styrelse.*
