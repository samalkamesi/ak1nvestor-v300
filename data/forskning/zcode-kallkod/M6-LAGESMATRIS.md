# M6 — LÄGESMATRISEN: build/edit/yolo/plan → auto-godkännande UR KÄLLKODEN

Expedition M6 (agentfabrikens läges-/permission-uppdrag). Källa: vendor-
runtimen `/home/ak1a/.npm-global/lib/node_modules/zcode-app-cli/vendor/
zcode.cjs` (12,6 MB bundle; alla fynd = exakta strängar med byte-offset i
parentes). Korsad mot studions permission-yta (`src/lib/studio/
permissions-policy.ts` våg 94 B + `src/lib/studio/studio-transport.ts`
v83 B2/v153 R1 + `src/app/api/studio/session/route.ts`).

TL;DR: Runtimen har **fem kanoniska lägen** — `plan, build, edit, yolo,
auto` (konfig-enum (6950492), sessions-schema (358589)) — plus tio äldre
alias (`default, acceptEdits, bypassPermissions, dontAsk, autoEdit, …`,
enum `JB` (409245)) som normaliseras ned till de fem. Beslutet fattas av
klassen **`ny` = PermissionService** (10672315): en ren funktion
`checkPermission(request, metadata, projektregler)` som slår ihop
**läget** med varje verktygs **capability-metadata** (riskLevel ×
sideEffectScope × needsApproval × readOnly × destructive ×
permissionName) och returnerar `{decision: allow|ask|deny, ruleId,
reason}`. Matrisen i §4 är exakt: **plan nekar hårt allt utom läsning,
build frågar vid sidoeffekter/hög risk, edit = build + filredigeringar
auto-godkänns, yolo godkänner ALLT utom användardialoger, auto nekar
ALLT** ("Auto mode is reserved but not implemented yet", 10673033).
Studions auto-policy ligger O VANPÅ runtimens "ask"-beslut — den ser
ALDRIG runtime-godkända anrop — och gör därmed build-läget ~edit-läge
inom arbetsytan (avvikelse 1, §5).

---

## §1 Lägessystemet — enums, UI, normalisering, persistens

### Tre lager av lägesnamn

| Lager | Värden | Bevis |
|---|---|---|
| Konfig/runtime (`permission.mode`) | `plan, build, edit, yolo, auto` | zod-enum (6950492); default `mode:"build"` i `Va` (755550); validator `O6t` (886136) |
| Äldre alias-enum (`JB`/`Kkn`) | `default, yolo, plan, edit, acceptEdits, auto, dontAsk, bypassPermissions, autoEdit, build` | (409245)/(469415) — agentprofiler + import |
| UI-väljaren (`z5t`) | `build`="Ask before changes", `edit`="Edit automatically", `plan`="Plan mode", `yolo`="Full access" | (543310–543556) — UI:n visar FYRA (auto finns ej i väljaren) |

Ytor med smalare enum: automation create = `[build, edit, plan, yolo]`
(818778); `switchCollaborationMode` = `[build, edit, plan, yolo]`
(10530502); ExitPlanMode:s efter-läge = `[build, edit, yolo, auto]`
(820511 — man kan inte "avsluta" plan till plan).

### Normaliseringen alias → kanoniskt (`Tci`, (10892390))

```js
function Tci(e, t, r) {           // e = config.mode, t = permissionMode, r = flagga
  switch (t) {
    case "bypassPermissions":
    case "dontAsk":        return "yolo";
    case "acceptEdits":    return "edit";
    case "auto":           return "auto";
    case "plan":           return "plan";
    case "default":
    case undefined:        return r ? "yolo" : e;
    default:               return e;
  }
}
```

**Enda anropssidan** (10885877) är `runExploreAgent`:
`P = Tci(this.config.mode, t.permissionMode, isBuiltInExploreAgentProfile)`
— dvs. tredje argumentet är "är detta den inbyggda Explore-profilen".
Konsekvenser: (a) `bypassPermissions`/`dontAsk` är IDAG bara alias för
yolo; (b) **den inbyggda Explore-agenten utan explicit permissionMode
körs i YOLO** (r sant + "default" ⇒ "yolo") — dess verktygsuppsättning
är läs-begränsad, men permission-mässigt är den fri; (c) en profil som
sänder ett okänt värde (t.ex. "yolo" rakt av) hamnar i `default:`-grenen
⇒ returnerar CONFIG-läget, inte det begärda.

Automations-normaliseringen (`UNi`, (12058720)): `dontAsk/
bypassPermissions → yolo`; `default/auto/acceptEdits/autoEdit → build`;
`plan/edit/yolo/build` passera. Notera skillnaden mot `Tci`: för
automation coerces "auto" → **build** (Tci behåller "auto").

### Agentprofiler

- Frontmatter-fält `permissionMode` i profil-markdown (10388150),
  giltiga värden = `Lti` = `{acceptEdits, auto, bypassPermissions,
  default, dontAsk, plan}` (10390750) — alltså ALDRIG yolo/edit/build
  rakt av; profilerna talar alias-språket och normaliseras.
- Barn-sessioner ärvr profiler: dispatchen skickar
  `permissionMode: r.profile.permissionMode` (10582430).
- **Projekt-källade profiler strippas på permissionMode** (`VOi`,
  (11943980)): `if (e.source!=="project" || e.permissionMode===void 0)
  return e; …` — en projektfil i repo kan ALDRIG PINNA läget; bara
  användar-/inbyggda profiler får. (Säkerhetsgrepp mot
  repo-injekterad yolo.)
- Subagenters permission-requests mäklas till föräldrasessionen
  (`DUr` = createSubagentInteractionBroker (10863500): varje
  `requestPermission` vidarebefordras med `parentSessionId`).

### Persistens

`session/setMode`-handlern (11860450): `u = runtime.getMode()` →
`runtime.updateConfig({mode: s})` → `localSettingStore.
saveProjectPermissionMode({mode: s, projectID})` — läget sparas PER
PROJEKT i runtimens SQLite (`j6t`/`F6t` (944100)) och läses tillbaka
vid start (`bsn` (11784500) med validering). Loggrad: `"Session mode
updated"` `event:"session.mode.updated"`. Sker en setMode med "yolo"
överlever alltså läget omstarten i RUNTIMENS databas — poäng som
studiens egna persistens missar (avvikelse 7, §5).

---

## §2 Beslutsmotorn — `ny` = PermissionService ((10672315))

Konfigurerbar med `{allowedTools: Set, disallowedTools: Set,
autoApproveHighRisk: bool, allowMediumRiskInAutoMode: bool}` (default
`HI`, (10678450)). Instansieras vid varje sessionstart ur konfigen
(11954700). Konfig-nycklar (754050): `permission.mode`,
`permission.allowedTools`, `permission.disallowedTools`,
`permission.autoApproveHighRisk` (default `false`),
`permission.allowMediumRiskInAuto` (default `false`).

### `checkPermission(t, r, n, o)` — EXAKT bedömningsordning (10672360→)

`t` = anropet `{toolName, mode, …}`, `r` = verktygets metadata (§3),
`n` = projektregler, `o` = regelutvärderare. `i = resolveCapability`
(10677400) slår ihop metadata med default. I ordning — första träff
vinner:

1. **Plan-övergångar** (`ZBr` (10672315)): `EnterPlanMode` ⇒ **allow**
   `"tool.plan.enter"` ("switches to plan mode without a permission
   prompt") i ALLA lägen; `ExitPlanMode` när mode ≠ plan ⇒ **deny**
   `"mode.plan.exitOnly"`.
2. **`requiresUserInteraction`** (t.ex. AskUserQuestion, ExitPlanMode
   i plan-läge): `disallowedTools` ⇒ deny `"rule.disallowedTools"`,
   annars **ask** `"tool.userInteraction"` — detta FRÅGAR ÄVEN I YOLO
   och till och med före auto-grenen.
3. `mode === "yolo"` ⇒ **allow** `"mode.yolo"` ("Yolo mode bypasses
   permission prompts") — ALLT godkänns (utom steg 1–2 ovan).
4. `mode === "auto"` ⇒ **deny** `"mode.auto.unimplemented"` ("Auto
   mode is reserved but not implemented yet") — ALLT nekas. Enda
   flyktväg: EnterPlanMode (steg 1 ligger före).
5. `disallowedTools.has(toolName)` ⇒ deny `"rule.disallowedTools"`.
6. Projektregel deny ⇒ deny `"rule.project.deny"`.
7. Projektregel ask ⇒ ask `"rule.project.ask"`.
8. `mode === "plan"` ⇒ `checkPlanMode` (nedan) — resten av kedjan
   nås EJ i plan.
9. Projektregel allow ⇒ allow `"rule.project.allow"`.
10. Förhands-godkänd WebFetch-URL ⇒ allow `"tool.webfetch.preapproved"`.
11. `allowedTools.has(toolName)` ⇒ allow `"rule.allowedTools"` —
    explicit vitlistad = godkänd i ALLA lägen utom plan/auto.
12. `mode === "edit"` ⇒ `checkEditMode`; annars `checkBuildMode`.

Notera ordningen: **yolo-grenen ligger FÖRE disallowedTools-kontrollen**
— i motorn struntar yolo i förbudet. Skyddet finns i stället på
verktygslistan (`Cci` (10892450)): disallowed verktyg plockas BORT ur
modellens verktygsuppsättning (`toolDisallowlist` + requestens
`disallowedTools`) innan motorn ens ser dem.

### Grenarna — ordagranna regler

**`checkPlanMode` (10675387):**
1. `readOnly && !destructive` ⇒ allow `"mode.plan.readOnly"`
2. MCP-capability (`permissionName==="mcp"`) `&& !destructive` ⇒
   allow `"mode.plan.mcp"`
3. `allowedInPlanMode && sideEffectScope==="session" && !destructive
   && !needsApproval` ⇒ allow `"mode.plan.explicitSessionCapability"`
   — i registret är detta ENDAST `RespondToCoordinator` (10437141)
4. annars ⇒ **deny** `"mode.plan.nonReadOnly"` — plan NEKAR, frågar
   inte. (TodoWrite nekas alltså i plan-läge — den saknar
   allowedInPlanMode.)

**`checkBuildMode` (10676032):**
1. `readOnly && !destructive && !needsApproval` ⇒ allow
   `"mode.build.readOnly"`
2. `riskLevel === "critical"` ⇒ ask `"mode.build.criticalRisk"`
3. `riskLevel === "high" && !autoApproveHighRisk` ⇒ ask
   `"mode.build.highRisk"`
4. `sideEffectScope === "session" && riskLevel === "low" &&
   !destructive && !needsApproval` ⇒ allow `"mode.build.sessionState"`
5. `needsApproval || destructive || sideEffectScope !== "none"` ⇒ ask
   `"mode.build.sideEffect"`
6. annars ⇒ allow `"mode.build.lowRisk"`

**`checkEditMode` (10676847):**
1. `permissionName === "edit" && sideEffectScope === "workspace"` ⇒
   allow `"mode.edit.fileEdit"` ("Edit mode allows file edit tools")
2. annars ⇒ `checkBuildMode` — edit = build + filredigeringar.

**Anomalier:**
- `autoApproveHighRisk: true` förbi bara steg 3 — verktyget fastnar ändå
  i steg 5 om det har sidoeffekter (Bash/js har `sideEffectScope:
  "system"` ⇒ ask ändå). Flaggan är i praktiken verkningslös för
  hela registret i §3; den gynnar bara hypotetiska high-risk-verktyg
  UTAN sidoeffekt och UTAN needsApproval.
- `allowMediumRiskInAutoMode` läses INGENSTANS i motorn (endast
  definition (10678509) + instansiering (11954998)) — död kod, eftersom
  auto-läget nekar allt före varje riskbedömning.
- `"critical"` finns i motorn men INGET verktyg i registret bär
  `riskLevel:"critical"` — gränsen är reserverad.

### Resultat-formen (`result`, (10678220))

`{decision, allowed: decision==="allow", escalated: decision==="ask",
mode, reason, riskLevel, ruleId, sideEffectScope}` — `escalated`-fältet
är det som triggar `interaction/requestPermission` mot klienten
(studions transport fångar det, se §5). Hooks kan dessutom påverka
PreToolUse med `permissionDecision: "allow"|"ask"|"deny"` +
`permissionDecisionReason` (764583) — hook-lagret ligger runt motorn.

### Bash-snabbspåret (runtime-egenvitlista)

`VYo` (10104000): om Bash-kommandot kan extraheras och passerar `wV`
(10078764) — helhetsparsning utan parse-fel/dynamiska ord/subshell,
varje kommando klassat säkert (`hmt`) — OMKLASSAS anropet till
`{destructive:!1, needsApproval:!1, readOnly:!0, riskLevel:"low",
sideEffectScope:"none"}` ⇒ auto-godkänd i build/edit. Detta är
runtimens motsvarighet till studions Bash-vitlista (men kräver
READ-ONLY-klassning — se avvikelse 3). `ExitPlanMode` kan dessutom
godkänna framtida Bash-yttringar semantiskt: `allowedPrompts:[{tool:
"Bash", prompt:"run tests"}]` i exit-svaret (819607+820250).

---

## §3 Verktygsriskregistret (metadata ur verktygsdefinitionerna)

| Verktyg | permissionName | riskLevel | sideEffectScope | needsApproval | Övrigt |
|---|---|---|---|---|---|
| Read | `read` | low | none | nej | (9883144) |
| Glob | `read` | low | none | nej | (10334471) |
| Grep | `read` | low | none | nej | (10338723) |
| WebSearch | – | low | network | nej | (832788) |
| TodoRead | `todo.read` | low | none | nej | (10403192) |
| TodoWrite | `todo.write` | low | session | nej | (10404553) |
| Agent | – | low | session | nej | "child tool calls are separately constrained" (10397250) |
| Skill | `skill` | low | session | nej | (10401222) |
| SendMessage | `agent.message.send` | low | session | nej | (10434503) |
| RespondToCoordinator | `agent.message.respond` | low | session | nej | **allowedInPlanMode:!0** (10437141/10437536) |
| TaskOutput | `taskOutput` | low | none | nej | (10445194) |
| TaskStop | `backgroundTask.stop` | low | session | nej | (10448475) |
| ReadSessionContext | – | low | session | nej | (10463743) |
| EnterPlanMode | – | low | session | nej | (10426690), ZBr allow alltid |
| ExitPlanMode | – | low | session | **ja** | requiresUserInteraction:!0 (10427400) |
| AskUserQuestion | `question.askQuestion` | low | **userInteraction** | **ja** | requiresUserInteraction:!0 (10431615) |
| Write | `edit` | medium | workspace | ja | (10010032) |
| Edit | `edit` | medium | workspace | ja | (10024670) |
| WebFetch | `webfetch` | medium | network | ja | preapproved-URL-väg i motorn (10369890) |
| CronCreate | automation | medium | workspace | ja | (10411019) |
| CronUpdate | automation | medium | workspace | ja | (10414417) |
| CronDelete | automation | medium | workspace | ja | **destructive:!0** (10415195) |
| Bash | – | **high** | **system** | ja | "may affect workspace, git, network, or system state" (10110350); snabbspår §2 |
| js (Node-REPL "Code-Act") | – | **high** | **system** | ja | **denyPriority:"beforeAsk"** (10330105/10330580) |

Default-klassning när metadata saknas (`resolveCapability`/
`getRiskLevel`, (10676690)): läs-uppsättningen `{Read, Glob, Grep,
WebSearch, WebFetch, TodoRead, TodoWrite, AskUserQuestion, Agent,
Task, Skill}` ⇒ low/none; `{Write, Edit, ApplyPatch, Bash}` ⇒ medium
el. high; `isDestructiveTool` = **`{Bash}`** (10677400) — Bash räknas
som destruktiv per default. `needsApproval` default = `!readOnly`.
MultiEdit och LS finns INTE i runtimen (0 träffar för `MultiEdit`,
`name:"LS"`) — se §5.

---

## §4 MATRISEN — läge × verktygsrisk → GODKÄND / FRÅGAD / NEKAD

GODKÄND = motorn allow (auto-godkännande, ingen request till studion).
FRÅGAD = motorn ask ⇒ `interaction/requestPermission` till klienten
(studion kan då auto-tillåta/neka, §5). NEKAD = motorn deny.
Grundmatrisen (utan projektregler/allow-disallow-listor):

| Verktygsrisk-klass (exempel) | plan | build | edit | yolo | auto |
|---|---|---|---|---|---|
| Läsverktyg (low/none, Read/Glob/Grep/WebSearch/TodoRead) | **GODKÄND** `mode.plan.readOnly` | **GODKÄND** `mode.build.readOnly` | **GODKÄND** | **GODKÄND** | NEKAD `mode.auto.unimplemented` |
| Session-låg utan plan-flagga (TodoWrite/Agent/Skill/SendMessage/TaskStop/ReadSessionContext) | **NEKAD** `mode.plan.nonReadOnly` | **GODKÄND** `mode.build.sessionState` | **GODKÄND** | **GODKÄND** | NEKAD |
| Session med allowedInPlanMode (RespondToCoordinator) | **GODKÄND** `mode.plan.explicitSessionCapability` | **GODKÄND** | **GODKÄND** | **GODKÄND** | NEKAD |
| Användardialog (AskUserQuestion; ExitPlanMode i plan) | **FRÅGAD** `tool.userInteraction` | **FRÅGAD** | **FRÅGAD** | **FRÅGAD** (även yolo!) | **FRÅGAD** (före auto-grenen) |
| Filskrivning, permissionName "edit" (Write/Edit) | **NEKAD** | **FRÅGAD** `mode.build.sideEffect` | **GODKÄND** `mode.edit.fileEdit` | **GODKÄND** | NEKAD |
| Nätverk medium (WebFetch) | **NEKAD**¹ | **FRÅGAD** | **FRÅGAD** (build-regler) | **GODKÄND** | NEKAD |
| Workspace medium (CronCreate/Update/Delete) | **NEKAD** | **FRÅGAD** | **FRÅGAD** | **GODKÄND** | NEKAD |
| System-hög (Bash, js-REPL) | **NEKAD** | **FRÅGAD** `mode.build.highRisk`² | **FRÅGAD** | **GODKÄND** | NEKAD |
| Bash snabbspår (runtime-läsklassat kommando) | **NEKAD**³ | **GODKÄND** (omklassat low/none) | **GODKÄND** | **GODKÄND** | NEKAD |
| riskLevel "critical" (inget verktyg idag) | NEKAD | **FRÅGAD** `mode.build.criticalRisk` | **FRÅGAD** | **GODKÄND** | NEKAD |
| EnterPlanMode (övergångsverktyg) | **GODKÄND** `tool.plan.enter` | **GODKÄND** | **GODKÄND** | **GODKÄND** | **GODKÄND** (steg 1 före auto) |
| ExitPlanMode utanför plan | **NEKAD** `mode.plan.exitOnly` | **NEKAD** | **NEKAD** | **NEKAD** | **NEKAD** |

¹ WebFetch i plan: varken readOnly (metadata readOnly:!1) eller MCP ⇒
regel 4 nekar. ² Med `autoApproveHighRisk:true` förbi steg 3 men steg 5
fångar `sideEffectScope:"system"` ⇒ FRÅGAD kvar. ³ Snabbspåret sänker
riskklassen men plan-grenen kräver readOnly **capability** (dvs
verktygsdefinitionens readOnly-flagga), inte bara omklassad metadata —
Bash förblir nekat i plan.

**Tvärgående försteg (alla lägen, före matrisen):** projektregler
deny/ask/allow (steg 6/7/9), `permission.allowedTools` (steg 11 —
godkänner i alla lägen utom plan/auto), förhandsgodkända WebFetch-URL:er
(steg 10), `permission.disallowedTools` (steg 5 + verktygslistefiltret
`Cci`). Hooks kan vända beslutet (`permissionDecision` i PreToolUse).

**Sammanfattningsvis:** plan = läs-fästning (deny-default),
build = fråga-på-sidoeffekter (allow-default för lågrisk), edit =
build med filskrivningsfribrev, yolo = allt-fribrev utom dialoger,
auto = totalt lås (endast EnterPlanMode slipper in).

---

## §5 Studions permissions-policy — korskontroll och AVVIKELSER

### Lagren i studion

1. **Route** (`src/app/api/studio/session/route.ts:244`): läge-aktion
   accepterar `{build, edit, yolo, plan}` (våg 153 R1) — "auto" är
   korrekt uteslutet (runtime nekar allt).
2. **Transport** (`sattLage` studio-transport.ts:5190): sänder
   `session/setMode {sessionId, mode}` med alla fyra; svaret bekräftas
   ur snapshot. Nya sessioner bär `params.mode` endast om `this.lage`
   är satt (3479).
3. **Auto-policyn** (`permissions-policy.ts` våg 94 B): besvarar
   `interaction/requestPermission` serversides — allow
   (Write/Edit/MultiEdit inom arbetsytan; läsverktyg; vitlistat Bash),
   deny (sudo/.env/nycklar/rm-rf-rot/curl|sh/…), frag (dialog).
4. **Webbläsardialog** med 30 s-default `{decision:"escalate"}`
   (transport 5018) — sessionen hänger aldrig.
5. **Automationer**: `lasLage=true` ärver ENDAST build|plan (6161).

### Kritiska semantiska fakta

- **Studins policy ligger O VANPÅ runtime-ASK.** Runtime-godkända
  anrop (yolo, edit-lägets filredigeringar, build-lågrisk) genererar
  ALDRIG en `interaction/requestPermission` — studion ser dem inte och
  kan inte strypa dem efteråt. Runtime-NEKADE anrop (plan-lägets
  skrivverktyg) når likaså aldrig studion. Policyn träffar ENDAST
  runtime-FRÅGADE anrop.
- **Effekten av våg 94 B**: i build-läge frågar runtimen om Write/
  Edit/Bash ⇒ autopolicyn tillåter Write/Edit inom arbetsytan och
  vitlistat Bash ⇒ **studion gör build-läget approximativt till
  edit-läge + Bash-vitlista**. Det var hela poängen (agenten slutade
  fastna), men det är en äkta semantikförskjutning mot källan.

### AVVIKELSER (studio ↔ runtime-källan)

1. **Lägesblind policy.** `autoPolicySvar(metod, parametrar, rot)` har
   inget lägesargument (permissions-policy.ts:312). Den tillåter
   Write/Edit inom arbetsytan OAVSETT läge. I plan-läge spelar det
   ingen roll (runtimen nekar innan frågan), i yolo är den överflödig
   (runtimen godkänner), men i **build** upphäver den källans
   "Ask before changes"-löfte. Konsekvens: lägesväljaren build vs
   edit är i praktiken UTPLÅNAD i studion så länge STUDIO_AUTO_POLICY
   är på (default).
2. **Känsliga filer: runtime-lucka policyn inte når.** Read är low/
   none/needsApproval:!1 ⇒ auto-godkänd i ALLA lägen (även plan).
   En `.env`-läsning via Read verktyget passerar runtimen UTAN fråga —
   studions deny (`Read mot känslig fil`) träffar ALDRIG, eftersom
   requesten inte existerar. Skyddet gäller bara Bash-led (`cat .env`)
   och Write/Edit. Vid härdning: lägg `.env*` i runtimens
   `permission.disallowedTools` (verkar på verktygslistan) eller
   projektregler — då nekas Read av källan själv.
3. **Bash-vitlistan är bredare än källans.** Runtimens snabbspår
   (§2) kräver READ-ONLY-klassning av hela kommandot. Studions
   GRUND_KOMMANDON (permissions-policy.ts:77) auto-tillåter `node`,
   `python3`, `pytest` (godtycklig kodexekvering) och `mkdir`
   (sidoeffekt) — källan skulle fråga om alla. Medveten studiedesign
   (deploy-flödet), men en verklig breddning av attackytan mot
   källsemantiken; `node -e`/`python3 -c` med inline-kod går rakt
   igenom studions tokenanalys (som bara kollar första token +
   känsliga mönster).
4. **Döda verktygsposter.** `multiedit` och `ls` i policyns verktygs-
   uppsättningar finns inte i runtimen (MultiEdit: 0 träffar; LS:
   inget verktyg) — Claude-ärvda namn, harmlösa men vilseledande vid
   läsning. `websearch` i LAS_VERKTYG är död kod av motsatt skäl:
   WebSearch är low/no-approval i källan ⇒ requesten når aldrig
   policyn. WebFetch däremot: källan FRÅGAR (medium/network) och
   policyn saknar den i LAS_VERKTYG ⇒ dialog — konsekvent.
5. **Studiens deny-härd är striktare än källans.** sudo/systemctl/
   crontab/dd/mkfs/chmod/chown/rm-rf-rot/git-push-force/nycklar/
   curl|sh/forkbomb nekas HÅRT av studion; källan skulle bara FRÅGA
   (motorn har inga sådana deny-mönster — endast disallowedTools-
   konfig och projektregler). Rätt riktning (R2-andan), men notera
   att den bara gäller runtime-frågade anrop: i yolo-läge godkänner
   källan `sudo …` UTAN att studion ser det (avvikelse 6).
6. **Yolo runtine-perspektiv.** I yolo nekar/styr studion INGENTING
   (inga asks utom dialoger). `disallowedTools` ignoreras av motorn
   i yolo (ordning steg 3<5) — skyddet finns endast om verktygslistan
   filtrerats i förväg (Cci). Om studions kund väljer yolo bör
   STUDIO_AUTO_POLICY betraktas som ur spel och känsliga filer i
   stället läggas i runtimens disallowedTools.
7. **Persistens-asymmetrin.** Runtimen sparar läget PER PROJEKT
   (setMode → saveProjectPermissionMode, §1) — en gång "yolo" ⇒ nya
   sessioner utan explicit params.mode kan starta i yolo efter
   omstart. Studions egna persistens sparar alla fyra lägen
   (sparaPersistens 3560) men `ensureKarna` återställer ENDAST
   build|plan (3070) och sänder params.mode bara då. Risiko: UI:t
   visar "byggeläge" medan runtimen kör yolo ur sin databas. Kur:
   läs tillbaka läget ur snapshot vid resume (`lasLageUrSnapshot`
   finns, 3767) eller sänd alltid params.mode vid create.
8. **Automation-arv.** Studion ärver endast build|plan till
   automationer; källans automation-schema tar `[build, edit, plan,
   yolo]` (818778). Medveten åtgärd (ingen headless yolo) — behåll.

### Rekommenderade speglingsjusteringar (framtida våg)

- Bära `lage` i autopolicy-anropet och låta policyn passa i plan/
  yolo-kunskapen (vid plan: aldrig allow på skrivverktyg — död kod
  idag men självdokumenterande; vid yolo: kortsluten logg).
- Återställ läge ur snapshot vid resume (avvikelse 7) — `settings.
  mode.current` finns redan i protokollets kontext.
- Flytta känslig-fils-skyddet för READ till runtimens
  `disallowedTools`-konfig (avvikelse 2) — det är den enda platsen
  som verkar FÖRE runtime-auto-godkännandet.
- Peta bort `multiedit`/`ls` ur policyns uppsättningar (avvikelse 4)
  när nästa beröring av filen sker ändå.

---

## §6 Metod & reproducerbarhet

Bundle: `zcode.cjs` 12 632 872 byte (2026-09-13, samma som M1–M3).
Sonder: `grep -ob -F '<term>'` för offsets (`autoApprove` 11,
`permissionMode` 8, `"yolo"` 30, `riskLevel:""` 58, `bypassPermissions`
5, `acceptEdits` 5, `permissionDecision` 11, `requestPermission` 13);
kontext via `tail -c +<offset> | head -c <längd>` (minnesvänligt).
Namnkarta (minifierade symboler → semantik, bevisade via
`a(namn,"…")`-aliasen): `ny` = PermissionService, `HI` =
defaultPermissionConfig, `ZBr` = resolvePlanModeTransitionPermission,
`Tci` = normalizePermissionMode (config, permissionMode,
isBuiltInExploreAgentProfile), `UNi` = normalizeAutomationMode, `Lti`
= profil-permissionMode-mängden, `z5t` = UI-lägeslistan, `Va` =
default-konfigen, `Cci` = allowedTools/disallowedTools-sammanslagning,
`VYo`/`wV` = Bash-snabbspår/vitlista, `DUr` =
createSubagentInteractionBroker, `j6t`/`F6t`/`bsn` =
projektläge läs/spara/återställ. ruleId-lexikonet (motorns egna
namn): `tool.plan.enter`, `mode.plan.exitOnly`, `tool.userInteraction`,
`mode.yolo`, `mode.auto.unimplemented`, `rule.disallowedTools`,
`rule.project.deny|ask|allow`, `mode.plan.readOnly|mcp|
explicitSessionCapability|nonReadOnly`, `mode.build.readOnly|
criticalRisk|highRisk|sessionState|sideEffect|lowRisk`,
`mode.edit.fileEdit`, `rule.allowedTools`, `tool.webfetch.preapproved`.

*Pedagogisk plattform — inte investeringsråd.*
