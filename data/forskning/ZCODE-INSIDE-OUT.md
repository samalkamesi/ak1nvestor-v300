# ZCODE INSIDE-OUT — superexpert-programmet (kunddirektiv 2026-09-14)

> "vi ska förstå z code koden in och ut, vi blir super experter på just den
> koden och alla tjänster så vi kan bygga denna studio på bästa sätt"

## Källorna (tre lager sanning)

| Lager | Plats | Innehåll |
|---|---|---|
| **Full källkod (launcher+TUI)** | `/home/ak1a/forskning/zcode-cli` (klon av github.com/kingsword09/zcode-cli) | 25 035 rader TypeScript: `src/` (13 filer) + `packages/zcode-tui/src/` (~20 vyer) + `docs/` + `test/` |
| **Installerad runtime** | `/home/ak1a/.npm-global/lib/node_modules/zcode-app-cli` (v3.11.2-24) | `bin/zcode.js` (65 kB launcher) + `vendor/zcode.cjs` (12,6 MB — OFFICIELLA runtime ur ZCode Desktop 3.11.2 .deb) + `vendor/packages/*` (8 inbyggda plugin: android-emulator, browser-use, document-skills, ios-simulator, restore-legacy-sessions, skill-creator, zcode-cua, zcode-guide) |
| **Vår first-hand protokollkunskap** | `tool-results/v81-appserver.md`, `v82-protokoll.md`, `v83-protokolkarta.md` + db.sqlite-schemat (v148) | Bevisade protokollsvar + tabellstruktur |

## Arkitekturen (ur README + extraktionsmetadata)

```
Node.js npm-launcher (bin/zcode.js: config/login/versionsmetadata)
  └─ officiell zcode.cjs-runtime (agent/modell/session/verktyg/plugin/MCP/credentials)
      └─ lokal @zcode/tui-adapter (packages/zcode-tui, byggd på pi-tui)
```
- Runtimen extraherad ur **ZCode-3.11.2-linux-x64.deb** (cdn-zcode.z.ai), cliVersion 0.16.5.
- **Internt protokoll = app-server JSON-RPC** — samma protokoll vår studio-transport talar.

## Konfigurationsytan (KOMPLETT ur config.example.json — studio-paritetschecklista)

- **provider**: zai = anthropic-kompatibel, baseURL `https://api.z.ai/api/anthropic`, apiKey
- **model**: main + lite (glm-5.3/5.3-flash 1M-kontext/5.2/5.1/5-turbo), modelCatalog.overrides, modelStream.idleTimeoutMs 60s
- **permission**: mode = `build|edit|yolo|plan` (4 lägen! studio har 2), allowedTools/disallowedTools, autoApproveHighRisk, allowMediumRiskInAuto
- **storage**: dir ~/.zcode, sessionDbPath db.sqlite
- **features**: compact, rewind, subagent, memory, skill, mcp (feature-flaggar!)
- **subagents.autoBackgroundMs**: 1000
- **memory**: use/write/autoConsolidate/summaryMaxBytes 8192
- **plugins**: dirs, enabledPlugins, suppressedBuiltins
- **skills**: includeInstructions, metadataBudget 20 000, roots
- **toolConcurrency.maxConcurrency**: 10
- **modelAnomalyGuard**: repeatedToolCallWarningThreshold 3, maxBudgetWarningsPerTurn 3
- **hooks** (AVSTÄNGDA default): SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, PostToolUse, PostToolUseFailure, Stop — timeout 60s, maxOutputBytes 32 768
- **ui**: locale, theme, tuiMode, copyOnSelect, notifications (method/condition unfocused)
- **network.timeout**: 180s

## Källkodskartan (vad varje fil äger)

### src/ (launcher)
| Fil | Äger |
|---|---|
| app-server-client.ts | **PROTOKOLKLIENTEN** — app-server-JSON-RPC (studions systerson; extrahera ALLA metoder härifrån) |
| launcher.ts | processstart av runtime |
| runtime-capabilities.ts | capability-schema (globalOptions per extraction.json) |
| model-access.ts + model-catalog-refresh.ts | modellaccess + kataloguppdatering |
| prompt-preflight.ts | **preflight före prompt** (okänd funktion — forskningsuppgift) |
| plugin-protocol.ts + plugin-cli.ts | pluginbrygga |
| zai-oauth.ts + darwin-oauth-callback.ts + desktop-migration.ts | login/OAuth/desktopimport |
| command.ts | kommandoyta |
| update-check.ts | versionskoll (20h-cache) |

### packages/zcode-tui/src/ (TUI = UI-paritetsblåkopia)
| Fil | Äger |
|---|---|
| runtime-poll.ts | **POLL: 1 000 ms aktiv / 5 000 ms vilande** (studio: 15-30 s = GAP) |
| runtime-projection.ts | projektionslager (vad UI läser ur runtimen) |
| permission-request-queue.ts | permission-kö (studio p7-analog) |
| stream-error-guard.ts | strömfelsskydd (mot hängande strömmar) |
| context-status-view.ts | kontextraden (vår %-visning) |
| turn-diff-store.ts + file-diff-view.ts + file-diff-budget.ts | diff-bläddring per turn |
| tool-view.ts + tool-group-view.ts + protocol-part-view.ts | verktygsrendering |
| background-task-output.ts | bakgrundsjobb-utdata |
| shortcuts.ts | tangentvägar: modes = ["build","edit","yolo","plan"] |
| selectors.ts | fallback-lägeslista |
| copy-on-select.ts, selection-command.ts, terminal-text.ts | terminaldetaljer |

## Redan bevisade paritetsgap (fynd dag 1)

1. **POLL-HASTIGHET**: officiell 1 s/5 s vs studio 15-30 s → tröghetskänsla.
2. **4 LÄGEN**: build/edit/yolo/plan vs studio 2 (build/plan) → edit+yolo saknas.
3. **HOOKS**: 7 event finns i runtimen (avslagna) — studio kan aktivera för spårning.
4. **plugins-ytan**: 8 inbyggda plugin-paket i vendor/packages (CUA! browser-use! android/ios!) — studio kör dem via runtime men utan egen UI-panel.
5. **prompt-preflight.ts**: okänd mekanism — kan vara nyckel till -32010-beteende.

## Forskningsrutter (fabriksmanifest zcode-expert)

- R1: Extrahera ALLA protokollmetoder ur src/app-server-client.ts + korrigera V91-kartan.
- R2: runtime-poll + runtime-projection → studions poll-arkitektur (kan vi köra 1 s utan att döda Contabo? SSE vs poll).
- R3: permission-request-queue + stream-error-guard → studios hängningar.
- R4: hooks-ytan → aktivera för studions telemetri (SessionStart/Stop).
- R5: vendor/packages-plugin (CUA/browser-use) → studio-tjänstepaneler.
- R6: prompt-preflight + modelAnomalyGuard → -32010/studs-prevention.
- R7: memory-konfigurationen (autoConsolidate!) → studions minne.

## Regelverk

- Källklonen lever UTANFOR repot (/home/ak1a/forskning/) — ALDRIG commit:a tredjepartskod.
- ZCode/runtime förblir uppströms egendom (README: "not affiliated with Z.ai") — vi bygger bara vår studio mot protokollet.
- Varje fynd → antingen studio-fix (leverans) eller paritetspost (V91-kartan) — forskning utan leverans är död organ.
