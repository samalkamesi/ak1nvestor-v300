# V93 P1-UNDERLAG — DESIGN FÖR VÅG 93 (KRAFT-KLUSTRET)

**Uppdrag** (STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 92" block B4): "P1-designunderlag
för våg 93 (hooks/trustGrant, workspace-inställningar, plugins-drift)" —
författat parallellt med våg 92:s P0-integration, READ-ONLY mot src/.

**Källor:** `data/forskning/V91-Z-PARITET-KARTA.md` (A4, komplett — §1.2
workspace, §1.3 plugins, §1.1 #6 session/events, §4 P1-skisser, §2 param-gap,
§5 ärliga gränser) · `tool-results/v83-protokollkarta.md` (protokollformerna) ·
kodläsning av `src/lib/studio/studio-transport.ts` + `src/app/api/studio/**`
(2026-09-09). **Ärlighetsnot 1:** A4 rankade workspace-inställningarna P2 —
våg 93 lyfter upp dem (kundvärde: "mina val skall gälla nästa gång") eftersom
de blir billiga när väl C1/C2-mönstren (dispatch + drawer) finns. **Ärlighetsnot
2:** zod-formerna kring setDefault*/plugins-drift är opaka i kartan ("zod
@~465k i källan") — exakta fältnamn kräver live-sond (en gång, i C1) innan
typning låses.

**Rekommenderad KVD för våg 93:** tsc-baslinjen oförändrad · build exit 0 ·
`tool-results/v93-e2e.mjs` grönt (följer v92-svitens mönster: PASS/FAIL/SKIP +
exitkod) · deploy + prodcheck.

---

## (a) WORKSPACE-INSTÄLLNINGAR — setDefault{Model,ThoughtLevel,Mode} + readState

**Vad som finns:** workspace/readState ✓ (transport `lasArbetsyta()`; bär
{settings, modelCatalog, slashCommands[]}) — men studions val av modell/läge/
tankestyrka lever bara I SESSION-create-anropet (§2: create bär model/mode/
thoughtLevel/persistence). KUNDPROBLEM: varje nytt samtal börjar på default,
inte kundens preferens.

**Protokollform (ur kartan §1.2 #10-12, opak zod — live-sondas i C1):**
- workspace/setDefaultModel `{workspace, model:xc}` → snapshot/settings
- workspace/setDefaultThoughtLevel `{workspace, thoughtLevel}` → snapshot
- workspace/setDefaultMode `{workspace, mode}` → snapshot
- Persistens-läsning: workspace/readState `{workspace, runtimeModel?,
  preferWorkspaceDefaults?}` → settings (server-side sanning; INGEN egen
  localStorage-duktion som kan hamna i konflikt med servern).

**Byggeskiss (5 rader):**
1. TRANSPORT: `sattStandardModell(model)`, `sattStandardTankeNiva(niva)`,
   `sattStandardLage(lage)` — raka protokollFraga-bryggor; `lasArbetsyta()`
   utökas att tolka settings.defaultModel/defaultThoughtLevel/defaultMode.
2. ENDPOINT: POST /api/studio/tjanster/installningar {action:
   "sattStandardModell"| "sattStandardTankeNiva"|"sattStandardLage", varde}
   → 200 {satt:true} | 501 {saknas} (ärligt, A3c-mönstret); GET samma rutt →
   aktuella defaults ur readState.
3. UI: "Standardvärden"-sektion i Inställningar-drawern (⚙) — rullista (ur
   lasArbetsyta.modelCatalog), tankestyrke-väljare, lägesval — med ÄRLIG text
   "gäller nästa samtal" (session-create bär redan valen, §2).
4. RISKER: opaka zod-fält (sond först); session-inställningar VINNER över
   workspace-default (UI:t måste visa båda: "standard: X · detta samtal: Y");
   mode yolo kräver varningstext (P1-6-synergi: bredare sattLage-typning);
   create måste skicka preferWorkspaceDefaults så servern inte dubbelstyr.
5. ESTIMAT: ≈0,5 agentblock (transport 0,25 + rutt 0,1 + UI 0,15).

## (b) HOOKS/TRUST — workspace/hooks + trustGrant

**Vad de gör:** ett workspace kan deklarera hooks-bundle (skript som körs vid
agentens verktygskall). Servern VÄGRAR köra dem tills kunden gett trust —
därför dyker arbeten i kundens workspace upp som "blocked" utan att studion
 ens visar varför. trustGrant är godkännandet (digest-låst, engång per bundle).

**Protokollform (karta §1.2 #4, noggrant dokumenterad):**
- workspace/hooks/trustGrant `{workspace, bundleDigest:64hex,
  hookDeclarationDigest}` → `{accepted, reasonCode?}` — digsterna måste
  hämtas ur AKTUELLT fel/diagnostik från servern (kan ALDRIG hittas på av
  klienten); reasonCode mappas till svenska förklaringar.

**Byggeskiss (5 rader):**
1. TRANSPORT: `litaHooks(bundleDigest, hookDeclarationDigest)` + en läs-sond
   som fångar hook-block-diagnostiken (felkroppen/-32601-texten bär digesterna
   — sonderas LIVE i C1 innan typningen låses).
2. ENDPOINT: POST /api/studio/tjanster/hooks-trust {bundleDigest,
  hookDeclarationDigest} → 200 {accepted:true} | 501 {saknas} | 409 om digest
  ej matchar väntande bundle (servern har sanningen).
3. UI: godkännandekort i interaktionsflödet (samma visningsplats som
   permission-dialogen v84 C): "Förtroende för workspace-hooks:
   [förkortad digest…] · Vad de gör: <deklarerade hooks>" + knappen
   "Godkänn (låst till denna version)".
4. RISKER: SÄKERHETSBESLUT — digest MÅSTE komma från serverns diagnostik,
   aldrig klientgissat (annars godkänner man fel bundle); engångs-per-bundle
   (ändrad hook ⇒ ny digest ⇒ nytt kort); aldrig tyst autosvar (skillnad från
   MCP-auth-autosvaret {}).
5. ESTIMAT: ≈0,5 agentblock (sond 0,2 + transport/rutt 0,15 + UI-kort 0,15).

## (c) PLUGINS-DRIFT — 16/17 saknas (enable/disable/uppdatera i första vågen)

**Vad som finns:** plugins/list ✓ (v85 F2 — Färdigheter ⚡-panelen visar
installerade + enabled-flaggan). SAKNAS: setEnabled, install, uninstall,
update, marketplace/*, restoreBuiltin, configure, resetConfig, validate,
describe, cancelOperation, resolveSuggestedReference, overview,
referenceCatalog (karta §1.3: 16 av 17 ✗).

**Protokollform (karta §1.3):**
- plugins/setEnabled `{workspace, pluginId, enabled, scope}` → snapshot
- plugins/install / plugins/uninstall / plugins/update — (zod kring rr)
  driftsvar kommer som operation/snapshot (asynkront läge — poll eller notis).
- Ärliga gränser (karta §5.1): auth-krävande marknadsplatser/OAuth-MCP kan
  EJ aktiveras härifrån (Zcode-kontot äger token) — publika källor only.

**Byggeskiss (5 rader):**
1. TRANSPORT: `sattPluginAktig(pluginId, enabled, scope)` + `uppdateraPlugin
  (pluginId)` (driftsvar-poll mot operation) — install/uninstall lägg i
  ANDRA vågen (se blockindelning) då de kräver operationshantering.
2. ENDPOINT: POST /api/studio/tjanster/plugins {action:
   "sattAktig"|"uppdatera", pluginId, enabled?, scope?} → 200 {satt:true}
   | 501 {saknas} | 502 vid driftfel; GET → befintliga lasPlugins-data.
3. UI: Färdigheter-panelens plugin-kort får på/av-switch (sparar via
   setEnabled) + "Uppdatera"-knapp med driftstatus ("Uppdaterar…") — v85 F2:s
   lösta löfte om toggling infrias.
4. RISKER: att stänga av ett plugin som panelen själv beror på (skydd:
   varning vid disable av plugin vars skills syns i listan); asynk drift —
   UI måste polla, inte anta direktverkning; scope workspace vs session
   (default workspace, visas i kortet).
5. ESTIMAT: enable/disable ≈0,3 block; update ≈0,3 block; install/uninstall
   ≈0,5 block (operationshantering) — sammanlagt ≈1,1 block om allt.

## (d) EVENTS-REPLAY — session/events + backfill vid återkoppling

**Vad som finns:** live-konsumtion av ~8 eventtyper ✓ (påNotis-switchen) +
historik via session/messages ✓ — men vid ÅTERKOPPLING (H1) hämtas bara
färdiga delar: exakta tool.updated/streaming-händelser under frånvaron går
förlorade. session/events är protokollets replay-väg (karta §1.1 #6: ✗ P1).

**Protokollform (karta §1.1 #6):**
- session/events `{sessionId, afterSeq?, limit?}` → `{events:vEt[]}` —
  sekvensnumrerad händelsehistorik; kompletteras naturligt av session/
  subscribe `{afterSeq, includeSnapshot?}` (deliveryKind
  "web-remote-replayable") för en gap-fri re-connect.

**Byggeskiss (5 rader):**
1. TRANSPORT: `lasEvents(sessionId, afterSeq, limit)` — sidvänd paging tills
   nu; client-side cursor = senast sedda seq per session (förs i
   sessionskartans tabb-post, diskpersistent).
2. ENDPOINT: GET /api/studio/session?action=events&sessionId=&afterSeq= →
   {events:[…]} (karta P1-3:s skiss); alternativt afterSeq-parameter på GET
   /api/studio/stream för engångs-backfill i sidloadsvaret.
3. UI: återkopplingsbannern ("Vad hände medan du var borta") bygger på events
   i stället för enbart historik-rader — verktygskort återges ur
   tool.updated-eventerna (samma kortrendering som live-flödet).
4. RISKER: okända eventtyper i replay (vEt-formen delvis opak — defensiv
   render, okänd typ → loggrad rad); IDEMPOTENS (samma event får inte
   dubbelrenderas: dedup på seq); lång frånvaro ⇒ paging (limit-sond i C1).
5. ESTIMAT: ≈0,6 agentblock (transport 0,2 + rutt 0,1 + backfill-UI 0,3).

---

## GRÄNSSNITT MOT BEFINTLIGA P1-PUNKTER (ej våg 93-ägs, noteras för helhet)

- **P1-1 generateText + cancel:** redan påbörjad i v91/v92
  (`/api/studio/tjanster/generera` finns i trädet) — våg 93 rör den EJ.
- **P1-5 requestProviderRuntimeHeaders-autosvar {} och P1-6 setModel/
  setMode-edit/yolo/auto samt P1-7 fileRewindPreview:** fristående småblock
  som kan läggas i C3:s marginal om budget finns — P1-6 delar UI-sektion med
  (a) och skall koordineras för att inte double-builda lägesväljaren.

## REKOMMENDERAD VÅG 93-BLOCKINDELNING (lagervis som våg 92 — krockfritt)

| Block | Ägande (ENDAST) | Innehåll | Estimat |
|-------|-----------------|----------|---------|
| **C1 TRANSPORT** | studio-transport.ts (+ api/studio/stream om events-brädda behövs) | lasEvents + cursor, litaHooks + digest-sond, sattStandard×3, sattPluginAktig/uppdateraPlugin; live-sonder för opaka zod-fält BEFORE typning | ≈1 block |
| **C2 RODDAR** | api/studio/tjanster/** ENDAST | /installningar (GET+POST), /hooks-trust (POST), /plugins {action}-dispatch (POST) + events-action på /api/studio/session — 401-vaktade, 501 {saknas}-mönstret överallt | ≈0,5 block |
| **C3 STUDIO-UI** | studio-chat.tsx + kommandon.ts ENDAST | Standardvärden-sektion (⚙), hooks-trust-kort, plugin-switchar + Uppdatera, frånvaro-backfill ur events; våg 90-språk; graceful 501 | ≈1 block |
| **C4 E2E+UNDERLAG** | tool-results/ ENDAST, read-only mot src/ | v93-e2e.mjs (inställningar satt→readState-echo, hooks-trust happy+reject, plugin-toggle tur-retur, events-backfill efter frånvaro) + om-mätning av paritetssiffran + P2-underlag våg 94 | ≈0,5 block |

**Prioriteringsordning inom vågen (om tiden tryter):** (b) hooks/trust →
(d) events-replay (karta-P1, kundmervarde vid återkoppling) → (a) workspace-
inställningar (billigt, uppflyttat P2) → (c) enable/disable → (c) update →
(c) install/uninstall (störst driftkomplexitet — kan glida till våg 94 utan
skam). Total estimerat: ≈3 agentblock (C1+C3 tunga, C2/C4 lätta).

— Byggagent B4, våg 92, 2026-09-09. READ-ONLY mot src/ har respekterats;
enda skrivningar: tool-results/v92-e2e.mjs + denna fil.
