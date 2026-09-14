# R5 — PLUGINS: den kompletta plugin-ytan UR KÄLLKODEN

Expedition R5, våg 152 (omgång 3). Uppdrag: Plugin-ytan (CUA m.fl.).
Källor: `/home/ak1a/.npm-global/lib/node_modules/zcode-app-cli/vendor/packages/`
(8 plugin-kataloger) — varje plugins `.zcode-plugin/plugin.json`, `package.json`,
README, `.mcp.json`, `hooks/`, `commands/`, `skills/`, `agents/` samt (för
MCP-bärande plugin) verktygsnamn extraherade ur `dist/mcp/server.js`-bundlar
(1,2–7,4 MB; `name:`-fält + README-verktygslistor). Korsat mot drift-cachen
`~/.zcode/cli/plugins/cache/zcode-plugins-official/` (alla 8 bekräftade) och
mot studions transport (`src/lib/studio/studio-transport.ts`, rutter under
`src/app/api/studio/`).

## §0 Plugin-systemets anatomi (saxat ur manifesten)

- **Rotmanifest** `.zcode-plugin/plugin.json`: fält `name`, `version`,
  `description` (+ `description_i18n`), `author`, `license`, samt DE TRE
  exponeringsytorna `skills` (katalog), `commands` (katalog), `mcpServers`
  (objekt) + `userConfig` (per-plugin-inställningar) och (document-skills)
  en `agents/`-katalog — plugins kan alltså exponera **färdigheter,
  slash-kommandon, MCP-servrar, subagent-typer Och inställningar**.
- **Två manifestformer**: `.zcode-plugin/plugin.json` (ZCode-form, variabler
  `${ZCODE_PLUGIN_ROOT}`, `${ZCODE_PROJECT_DIR}`, `${ZCODE_PLUGIN_DATA}`,
  `${user_config.<fält>}`) och `.mcp.json` (Claude-kompatibel form, samma
  server men variabler `${CLAUDE_PLUGIN_ROOT}` etc.). android, ios och
  document-skills bär båda; resten bara plugin.json.
- **Namnmappning**: servernamnet normaliseras → modellen ser verktyget som
  `mcp__<server_normaliserad>__<tool>` (t.ex. `android-emulator` ⇒
  `mcp__android_emulator__android_preflight`); servern implementerar det råa
  namnet (`android_preflight`). **Våg-152-fynd**: i AK1-studions app-server
  (3.11.2-22) är den LIVE-form som fabriksagenten faktiskt ser
  `mcp__plugin_<plugin>_<server>__<tool>` (t.ex.
  `mcp__plugin_android-emulator_android-emulator__android_build_app`) —
  prefixet bär pluginnamnet + servernamnet. Båda formerna är sanna; den
  senare gäller i vår kanal.
- **Driftläge**: vid start kopierar zcode paketet till
  `~/.zcode/cli/plugins/cache/zcode-plugins-official/<namn>/<version>/` och
  kör MCP-servern DÄRIFRÅN. SEA-byggen skriver om manifestet så servern körs
  via zcode:s interna plugin-host med inbäddad Node-runtime. Aktivering styrs
  i `~/.zcode/cli/config.json` under `plugins.enabledPlugins` +
  `plugins.options` (per-plugin userConfig-värden).
- **MCP-transporter**: stdio (`command: "node", args: [dist/mcp/server.js]`)
  för android/ios/cua; HTTP-typ för document-skills `image_search`
  (`${ZCODE_BASE_URL}/api/v1/mcp/server/image_search`, auth `zcode_official`
  jwt_token, timeout 90 s). SDK: `@modelcontextprotocol/server` 2.0.0 + zod 4.
- **Hooks**: android + ios har `hooks/hooks.json` = `{"hooks": {}}` (tom —
  ytan finns, används ej ännu).

## §1 De åtta pluginen — exponeringsyta per plugin

### 1. android-emulator 0.1.0 (`@zcode/android-emulator-plugin`)

Android-utveckling: Kotlin/Jetpack Compose-appar i emulator.

- **MCP-server** `android-emulator` (stdio, `dist/mcp/server.js`; bin
  `android-emulator-mcp`). **23 verktyg** (README §MCP Tools, exakt lista):
  `android_preflight`, `android_discover_project`, `android_create_app`,
  `android_build_app`, `android_build_and_run`, `android_list_devices`,
  `android_list_avds`, `android_start_emulator`, `android_stop_emulator`,
  `android_create_avd`, `android_install_app`, `android_launch_app`,
  `android_terminate_app`, `android_open_url`, `android_screenshot`,
  `android_logs`, `android_ui_status`, `android_ui_describe`,
  `android_ui_resolve`, `android_ui_tap`, `android_ui_swipe`,
  `android_ui_type_text`, `android_ui_keyevent`.
  Providers i dist: app, avd, build, config, device, logs, preflight,
  project, project-template, screenshot, sdk, ui.
- **Skill**: `android-dev` (+ `INSTALL_ENVIRONMENT.md` för fast setup).
- **Kommando**: `/android-dev [mål]` — frontmatter `skills: android-dev`,
  loop: preflight → install → discover/create → build → launch → screenshot.
- **userConfig** (8): `sdk_path` (default "", fallback ANDROID_HOME),
  `default_avd` ("medium_phone"), `api_level` ("35"),
  `build_tools_version` ("35.0.0"), `system_image_variant` ("default"),
  `system_image_abi` ("" → arm64/ARM else x86_64), `jdk_major` ("17").
- **Krav**: macOS/Windows — **Linux är medvetet ostött i P0**
  (`android_preflight` rapporterar unsupported host). Android SDK/adb +
  emulator + ≥1 AVD; Node 24.

### 2. browser-use 0.4.2 (`@zcode/browser-use-plugin`)

Webbläsarautomation (desktop-IAB eller CLI-hanterad headless CDP).

- **MCP-server** `node_repl` (stateless; `dist/mcp/server.js`, main i
  package.json). **3 verktyg** (README + namnfält i bundeln): `js`,
  `js_reset`, `js_add_node_module_dir` — modellen ser `mcp__node_repl__*`.
  Kontinuiteten ligger INTE i JS-globala utan i BrowserControl-flikar:
  varje färsk `js`-kernel bootstrappar `agent.browsers` via
  `scripts/browser-client.mjs`.
- **Skills**: `control-browser` (main-agent-ONLY — subagenter får INTE läsa
  den; bootstrappa backend → läs `browser.documentation()` → Playwright
  DOM-snapshot→locator→act → flikregister → screenshot endast som bevis)
  och `web-gui-tester` (ren GUI black-box-test ovanpå control-browser).
- **Docs-katalog** (14 filer): api.json, overview, workflow, safety,
  screenshot, recording (WebM-inspelning i arbetsytan), playwright,
  viewport, visibility, tab-claiming/tab-cleanup (IAB), troubleshooting.
- **Runtime**: IAB-runtime ges av desktop-hosten; headless CDP-runtime ges
  ENDAST av en explicit opta-in CLI-process. Manifest-interpreteren tar
  bort ostöttade medlemmar ur runtime-objektgrafen i stället för att fallera
  vid anrop.

### 3. document-skills 0.1.4 (`@zcode/document-skills-plugin`)

Dokumentproduktion: docx/pdf/pptx/xlsx.

- **Skills**: `docx` (routes create/edit/read/format/comment; scenes
  academic/contract/copywriting/exam/official-doc/report/resume; python-
  skript `document.py`, `postcheck.py` m.fl.), `pdf` (briefs report/poster/
  resume/creative/process; typesetting-kunskap; skript `pdf.py`,
  `design_engine.py`, `html2pdf-next.js` m.fl.), `pptx` (pptxgenjs/
  python-pptx), `xlsx` (scenes create/edit/analyze/convert/finance/vba;
  engines chart/design/vba-templates; `xlsx.py` + templates).
- **Agent** `judge` (`agents/judge.md`, tools [Read, Bash]): DEN visuella
  acceptansgrinden för renderade leveranser (pptx/docx/xlsx/pdf/poster/
  chart) — läser endast förrenderade sid-PNG:er, dömer pass/fail per sida
  med evidens, redigerar aldrig. **Enda plugin med agents/-katalogen** —
  bevisar att plugins kan exponera subagent-typer (syns som
  `document-skills:judge` i Agent-tool-listan).
- **MCP-server** `image_search` (HTTP, `${ZCODE_BASE_URL}/api/v1/mcp/
  server/image_search`, auth zcode_official/jwt_token) — molnbildsökning
  till dokumentens bilder.

### 4. ios-simulator 0.1.0 (`@zcode/ios-simulator-plugin`)

iOS-utveckling: SwiftUI-appar i macOS Simulator.

- **MCP-server** `ios-simulator` (stdio; bin `ios-simulator-mcp`).
  **20 verktyg**: `ios_preflight`, `ios_list_simulators`,
  `ios_boot_simulator`, `ios_show_simulator`, `ios_discover_project`,
  `ios_create_app`, `ios_build_app`, `ios_build_and_run`,
  `ios_install_app`, `ios_launch_app`, `ios_terminate_app`,
  `ios_open_url`, `ios_screenshot`, `ios_logs`, `ios_ui_status`,
  `ios_ui_tap`, `ios_ui_swipe`, `ios_ui_type_text`, `ios_ui_button`,
  `ios_ui_describe`. Providers: build, logs, preflight, project,
  screenshot, sim, ui.
- **Skill** `ios-dev` + **kommando** `/ios-dev [mål]` (preflight → discover/
  create → build → launch → screenshot-verifikation).
- **userConfig** (2): `default_device` ("iPhone 16"), `ui_backend`
  ("auto" | idb | xcodebuildmcp | none).
- **Krav**: **macOS** + full Xcode + simulator-runtime; Node 24; valfritt
  idb/idb-companion för UI-automation (P0-backend = idb).

### 5. restore-legacy-sessions 0.1.0 (`@zcode/restore-legacy-sessions-plugin`)

Migrering av ACP-era sessioner till nutida butik. **Avstängd som default**
(aktiveras: `zcode plugins enable restore-legacy-sessions` eller
`/plugins enable …` i session; gäller NYA sessioner).

- **Skill** + **kommando** `/restore-legacy-sessions [filter]` — INGEN
  MCP-server, INGET bygge. Två skript i skillen:
  `scan-legacy-sessions.mjs` (lista gamla agenter/workspace/konversationer)
  och `restore-conversation.mjs` (tidsstämplade DB-backupper före skriv;
  torrkörning före applicering).
- **Datagränser**: källa `~/.zcode/v2/sessions` → mål
  `~/.zcode/v2/tasks-index.sqlite` + `~/.zcode/cli/db/db.sqlite` (samma
  sessions-DB som trådens permans läser, våg 148). Återställda samtal
  persistens som normal `glm`-historik (skriver ej `migration_source`).

### 6. skill-creator 0.1.0 (`@zcode/skill-creator-plugin`)

- **Skill** `skill-creator`: skapa/iterera SKILL.md från grunden, förbättra
  befintliga, justera beskrivningar för triggertillförlitlighet. Ren
  färdighetsplugin (ingen MCP, inga kommandon).

### 7. computer-use 0.5.14 (`@zcode/zcode-cua-plugin`)

CUA: skrivbordsautomation med mus/tangentbord/UI-element.

- **MCP-server** `computer-use` (stdio, timeout 90 s). versionen följer
  uppströms zcode-cua-MCP-servern (tvång av `check-version-coherence.mjs`
  mot pnpm-katalogpinnen). **Verktyg extraherade ur bundeln** (`name:`-fält;
  kärnan bekräftad av SKILL.md): `request_access`, `list_apps`,
  `open_application`, `get_app_state`, `perform_action`,
  `stop_computer_control`, `screenshot`, `type`, `mouse_move`, `left_click`,
  `double_click`, `triple_click`, `middle_click`, `right_click`,
  `left_click_drag`, `left_mouse_down`, `left_mouse_up`, `scroll`,
  `select_text`, `set_value`, `hold_key`, `wait`, `zoom`,
  `cursor_position`, `list_windows`, `list_displays`, `switch_display`,
  `read_clipboard`, `write_clipboard` (29 namnfält; vissa kan vara parameter-
  snarare än toppverktyg — kärnloopen i SKILL.md är request_access →
  list_apps/open_application → get_app_state → perform_action).
- **Skill** `computer-use` — **main-agent-ONLY, aldrig delegerad till
  subagent**. Filosofi: accessibility-FÖRST (semantiska element-aktioner,
  bakgrundssäkra, stjäl ej fokus), pixel-koordinater ENDAST när
  tillgänglighetsträdet ej når målet. Målformer: `{"type":"element",
  "state_id","index"}` | `{"type":"coordinate","x","y"}`.
  request_access endast vid explicit Accessibility/Screen Recording-fel;
  `possibly_sent` ⇒ observera, aldrig spela om automatiskt.
- **Driftkontext**: MAC-centrerad (macOS-behörigheter) — på Linux-skrivbord
  begränsat av producentens behörighetsklassificerare.

### 8. zcode-guide 0.1.0 (`@zcode/zcode-guide-plugin`)

Självdiagnos-kunskap, content-only, påslagen som default.

- **6 skills**: `zcode-configuration-guide` (översikt: lägen, scopes,
  precedence, merge-regler för MCP/kommandon/skills/hooks/plugins),
  `diagnosing-mcp`, `diagnosing-skills`, `diagnosing-commands`,
  `diagnosing-hooks`, `diagnosing-plugins` — varje diagnos leder till en
  konkret åtgärd (människa: inställningsvy; agent: exakt konfigurationsfil
  + fält). Syfte: en agent skall kunna reparera sin egen konfiguration.

## §2 Studions vy — vad som LEVER redan (bevisat i källan)

Transporten (`studio-transport.ts`) + rutterna visar att studion REDAN har
plugin-panelens grund:

| Yta | Transportmetod | Protokollväg | Rutt |
|---|---|---|---|
| Skills-lista | `lasSkills` | skills/referenceCatalog | /api/studio/fardigheter GET |
| Plugin-lista (rik) | `lasPluginsFull` (sonderad) | plugins/list | /api/studio/fardigheter GET |
| Plugin-lista (bas) | `lasPlugins` | plugins/list | dto. |
| Plugin av/på | `pluginSattAktiverad` | plugins/setEnabled | /api/studio/fardigheter POST |
| MCP-servrar | `lasMcp` → `StudioMcpServer{namn,status,transport,verktygAntal,verktyg?[]}` | mcp/list | /api/studio/fardigheter GET |

`StudioPlugin` bär id/namn/beskrivning/version/aktiv/skillAntal/källa;
v93-kontraktet dubblerar `aktiv` som `aktiverad`. Tjänstebryggorna under
`/api/studio/tjanster/*` (automation+pausa, bakgrund+avbryt, generera,
webblasare) är körkanalen: **requireAdmin → hamtaStudioTransport → sondMetod
(typeof-vakt) → normalisering (opak protokollkropp sonderas på kända
nycklar, trunkeringar 300–4 000 tkn, URL-validering http/https) → ärlig 501
{saknas:true} vid StudioMetodSaknasError/-32601 → no-store**.

Våg-152-bevis: FABRIKSAGENTENS session (denna) exponerar plugin-MCP:erna
live — `mcp__plugin_android-emulator_android-emulator__*`,
`mcp__plugin_ios-simulator_ios-simulator__*` fulla verktygsuppsättningar
syns i verktygslistan, plugin-skills (docx/pdf/pptx/xlsx, judge-agenten,
skill-creator, zcode-guide ×6, browser-use ×2, android-dev, ios-dev) syns i
färdighetslistan. Plugin-driften i studiokanalen är alltså INTE teoretisk.

## §3 Hur studion kan visa/köra pluginen (tjanster-mönstret applicerat)

Prioriteradlista för kommande bryggor — per plugin: vad, hur, värde på
Contabo (Linux, 8 GB):

1. **restore-legacy-sessions → /api/studio/tjanster/tradarvand** (HÖGST
   värde, OS-neutralt): GET skanna `~/.zcode/v2/sessions` via skillens
   `scan-legacy-sessions.mjs`-logik (kör skriptet med node — skal-kvotens
   kur 1), POST {konversation, torrkörning?} → restore med backup-rad i
   svaret. Kopplar direkt till trådens permans (v148): kundens gamla ACP-
   sessioner blir återupptagningsbara i /studio. Risk: skriver db.sqlite →
   kör endast med torrkörning-default + backup-kvitto.
2. **document-skills → redan konsumerbart**: skills + judge-agenten drivs
   av agenten själv (behöver ingen egen rutt); värdet ligger i
   studion-vy: visa `image_search`-serverns status via lasMcp (finns) och
   eventuellt en framtida /tjanster/dokument som lägger ett beställnings-
   jobb (PPTX-rapporter ur data/analyses). OS-neutralt = körbart på servern.
3. **skill-creator + zcode-guide → noll brygga**: ren kunskaps-yta; studions
   Skills-panel (fardigheter-ruten) visar dem redan. Nytta = prompta
   huvudagenten att använda dem, inte köra dem via API.
4. **browser-use → /api/studio/tjanster/webblasare (FINNS, v92)**: bryggan
   kör interaction-domänens webbläsarmetoder — pluginens node_repl är den
   underliggande kanalen i CLI-sessioner. Headless CDP kräver explicit
   opta-in CLI-process; Desktop-IAB kräver skrivbord. På Contabo: headless
   CDP är den realistiska vägen för server-sidad verifiering (t.ex.
   gränsnittsvaktens visuell del).
5. **android-emulator / ios-simulator → visa, kör EJ på Contabo**: båda
   pluginkoden lever i studions session (MCP-verktygen exponeras), MEN
   android är Linux-unsupported i P0 (preflight failar) och ios kräver
   macOS + Xcode. Studiosidan: visa i plugin-panelen med status/feltext ur
   lasMcp (connected/failed + verktygAntal) — körning sker på kundens
   arbetsstation, inte på servern. Väg fram: kundens dator öppnar /studio,
   agenten använder verktygen där sessionen har dem.
6. **computer-use (CUA) → villkorad**: kräver skrivbordsvärd med behörigheter
   (macOS Accessibility/Screen Recording; Linux begränsat). På Contabo finns
   inget GUI-skrivbord → INGEN serverkörning; relevant först om kunden kör
   studio-sessionen från sin dator (då kan agenten styra kundens skrivbord
   via pluginen i DEN sessionen). Studiosida: panelrad med lasMcp-status,
   tydlig text "kräver skrivbordsvärd".

**Brygg-mönstret (v92/v93, återanvänd rakt av):** ny rutt under
`/api/studio/tjanster/<namn>` → GET listar (normaliserat), POST kör ETT
validerat kommando (tak, whitelisting av parametrar) → svar normaliseras
opakt → 501 ärligt när transporten/method saknas → ALDRIG konfig-skrivning
förbi protokollet (plugin-av/på ENDAST via plugins/setEnabled-bryggan).

## §4 Gap-lista (nästa steg, rankad)

1. **lasPluginsFull saknar userConfig-yta**: transporten bär aktiverad/
   version men INTE plugins options (userConfig-värden) — en framtida
   protokollväg plugins/options skulle låta studion sätta default_avd/
   api_level m.m. utan config.json-edering. (Sondera först om app-servern
   bär metoden — R1-kartan är referensen.)
2. **Trådvand-bryggan (§3.1) är det enda nya som behöver BYGGAS** — allt
   annat är visa-läge på existerande metoder.
3. **MCP-status ur lasMcp kan dölja Linux-fel**: android/ios-servrarnas
   "failed"-status på Contabo bör märkas pedagogiskt ("kräver macOS/Windows-
   värd") i panelen så kunden inte ser trasigt.
4. **judge-agenten** (document-skills) är redan dispatchbar i sessioner där
   pluginen är påslagen — dokumentera i studions hjälptext att
   dokumentleveranser (pptx/pdf/docx) SKALL gå genom den visuella grinden.

## §5 Sanningsläge

- Alla 8 plugin verifierade i vendor-packages + cache; verktygslistor för
  android (23) och ios (20) ur README (författarkällan), CUA (29 namnfält)
  ur bundel-grep med osäkerhetsmarkering, browser-use (3) ur README +
  bundel-namnfält, document-skills MCP (image_search, HTTP) ur manifest.
- Studio-kolumnen i §2 är LIVE-lästa ur repots egen kod (transport + rutter)
  och verifierad mot denna sessions faktiska verktygs-/färdighetslista.
— R5-expeditionen, våg 152
