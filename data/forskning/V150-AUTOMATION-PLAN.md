# V150 AUTOMATION-PLAN — 100 % paritet för automation-familjen (10X p10)

**Uppdrag** (STUDIO-10X-PROGRAM fas 1, fabriksuppgift p10): V91-kartan
§1.5 listar 5 automation-tjänster. Denna plan mäter hela automation-
familjen — automation/* ×5, webbläsarparet, bakgrundsjobb-listan + avbryt,
autonomi-kopplingen — mot FAKTISK kod och svarar på: VAD SAKNAS FÖR 100 %?
Per gap: 3-raders API-skiss (Transport/Endpoint/UI) + prioritet. INGEN
kod skrevs — plan endast.

**Källor 2026-09-14:** `src/app/api/studio/tjanster/*` (6 rutter lästa i
helhet: automation + automation/pausa + bakgrund + bakgrund/avbryt +
webblasare + generera) · `src/lib/studio/studio-transport.ts` (rader
~5915–6183: lasBakgrundsjobb, lasWebblasare, korWebblasare, lasAutomationer,
automationSkapa/Uppdatera/Radera, skickaAutomation, genereraText; rad
~4248: avbrytBakgrundsTask) · `src/components/ak1a/studio-chat.tsx`
(tjänstpanelen: 92 automationsträffar, avbryt-knapp rad ~2993, webblasare-
form rad ~3033) · V91-Z-PARITET-KARTA.md §1.5/§1.6/§2/§4 (re-mätning 10X
p1, samma dag) · protokollformerna ur våg 91-revisionen (git 660cc440 —
v83-kartan är borta från disk, historiken är källan). READ-ONLY mot src/.

---

## 1. NULÄGE — 10 ytor mot 100 %

| # | Yta | Tjänst | Läge | Vad saknas till 100 % |
|---|-----|--------|------|----------------------|
| 1 | automation/create | Skapa cron-styrd autonom uppgift | ✓ | param-djup: model?, targetTaskId?, maxRuns? bärs ej (GAP F) |
| 2 | automation/update | Uppdatera automation | ~ | endast enabled-paus/återaktivering; övriga fält saknas (GAP A) |
| 3 | automation/checkTaskBinding | Är uppgiften bunden? | ✗ | hela tjänsten (GAP D) |
| 4 | automation/list | Lista (nextRunAt, runCount, status) | ✓ | inget |
| 5 | automation/delete | Ta bort automation | ✓ | inget |
| 6 | interaction/browserList | Lista agentens webbläsarflikar | ~ | brygga+UI lever men binären svarar -32601 ⇒ 501 i drift (GAP C) |
| 7 | interaction/browserExecute | Kör kommando i webbläsaren | ~ | samma binärgap (GAP C) + send.browserAmbientContext (GAP E) |
| 8 | Bakgrundsjobb-lista | projection.backgroundJobs fullvy | ✓ | polish: stderrTail + snapshot-fält (GAP G) |
| 9 | Avbryt bakgrundsjobb | session/cancelBackgroundTask | ✓ | inget (egen rutt + UI-knapp + normaliserat svar) |
| 10 | Autonomi-koppling | skicka med automationId/offPeak | ~ | protokollet ✓ (StudioSkickaExtra lever) men 0 rutt-/UI-konsumenter (GAP B) |

**Mått: 6 ✓ (60 %) · 3 ~ (30 %) · 1 ✗ (10 %) — med bryggor 9/10 (90 %).
Vägen till 100 % = 7 gap: 6 kodgaps + 1 binärgap.**

---

## 2. GAP-REGISTER — 3-raders skiss per gap

### GAP A — automation/update-FULL (prioritet P1)

- **Transport:** `automationUppdatera(id, andring)` utökas från endast
  `{pausad}` till create-formens uppdateringsbara fält: `{titel?, schema?,
  prompt?, lasLage?, targetTaskId?, maxRuns?, aktiverad?}` → protokollform
  `{automationId, title?, cronExpr?, prompt?, mode?, targetTaskId?,
  maxRuns?, enabled?}` (svars-tolkningen är redan defensiv: {automation} ·
  rak post · annan → null).
- **Endpoint:** `PATCH /api/studio/tjanster/automation {id, titel?,
  schema?, prompt?, lasLage?, targetTaskId?, maxRuns?, aktiverad?}` →
  `{ok, post}` — pausa-rutten (`/automation/pausa`) kvar som tunn, bakåt-
  kompatibel alias (den enda åtgärd dagens UI använder).
- **UI:** expanderbart "Redigera"-läge per automationskort med samma fält
  som skapa-formuläret (+ targetTaskId när GAP D badge:ar), spara → PATCH →
  listan läses om; paus-knappen blir ett specialfall av samma anrop.

### GAP B — skickaAutomation EXPONERAD, "Kör nu" (prioritet P1)

- **Transport:** `skickaAutomation(prompt, automationId?, offPeak?)` LEVER
  redan (våg 92 B1, skicka bär automationId ⊕ offPeakTaskId med form-
  nedgradering) — men har 0 rutt-/UI-konsumenter (grep 2026-09-14: endast
  transporten själv nämner metoden).
- **Endpoint:** `POST /api/studio/tjanster/automation {action:"kor", id}`
  → transporten hämtar prompten ur listposten och kör skickaAutomation —
  turnen märks automationId i historiken (fältet bärs redan i skicka).
- **UI:** "▶ Kör nu"-knapp per aktivt automationskort (brevid pausa/radera)
  med bekräftelserad + länk till turnen; offPeak-grenen ("starta vid
  låglast") väntar tills kundvärde är påvisat — knappen döljs då.

### GAP C — webbläsarparet I DRIFT (prioritet P1 — binärgap, ej kodgap)

- **Transport:** KLAR — lasWebblasare/korWebblasare bär binärsond-formen
  (requestId+sessionId+workspace+clientMode+sessionContext, execute med
  browserId/browserGeneration); ärlig 501 via -32601.
- **Endpoint:** rutterna finns och är färdiga (GET+POST
  `/tjanster/webblasare`) — åtgärden är att UPPGRADERA zcode-app-server
  till version med interaktionsdomänens webbläsarmetoder, därefter
  verifiera `GET /tjanster/webblasare` ≠ 501 (loopback, admin).
- **UI:** finns (sidlista, navigeringsform med strikt URL-validering,
  resultatkort titel/url/utdrag) och döljs automatiskt vid 501 (A3c-
  kontraktet) — ingen UI-kod behövs efter uppgraderingen.

### GAP D — automation/checkTaskBinding (prioritet P2)

- **Transport:** `lasTaskbindning(id)` → protokollFraga
  `automation/checkTaskBinding {automationId}` → sondera `{bound:bool}`
  defensivt (okänd form → obunden, aldrig fel-kort).
- **Endpoint:** `GET /api/studio/tjanster/automation/bindning?id=…` →
  `{bound, meddelande}` med samma ärliga 501-mönster som övriga.
- **UI:** bindnings-badge per kort ("bundet"/"obundet") — visas FÖRST
  tillsammans med GAP A:s targetTaskId-fält (badge utan åtgärd = buller);
  listans lifecycleStatus täcker redan det mesta av kundvärdet.

### GAP E — send.browserAmbientContext (prioritet P2)

- **Transport:** skicka bär vid behov `browserAmbientContext
  {tabCount, currentUrl}` ur senaste browserList-svar (StudioSkickaExtra
  utökas; -32602-formavvisning nedgraderar till vanlig skicka, exakt som
  attachments-grenen redan gör).
- **Endpoint:** ingen egen — GET /tjanster/webblasare-svaret hålls
  transport-internt och injiceras i nästa skicka (samma arvsmönster som
  lasLage i automationSkapa).
- **UI:** ingen (osynlig kontextförbättring: agentens svar blir medvetna
  om öppna flikar); beroende av GAP C — därför P2 trots enkelhet.

### GAP F — automation/create PARAM-DJUP (prioritet P2)

- **Transport:** StudioAutomationSkapa utökas `{modell?, targetTaskId?,
  maxRuns?}` → create-bäraren kompletteras (protokollform $je dokumenterar
  alla fält redan: title, cronExpr, prompt, model?, mode?, targetTaskId?,
  enabled, maxRuns?).
- **Endpoint:** POST /tjanster/automation utökas med VALFRIA fält
  modell/maxRuns/targetTaskId — samma valideringsstil (trim + tak +
  typkontroll), bakåtkompatibel (gamla anrop oförändrade).
- **UI:** skapa-formulärets "Avancerat"-vikt: modellväljare (ur /modeller),
  maxRuns-tal, targetTaskId-fält (synligt först när GAP D lever).

### GAP G — bakgrundsjobbs-POLISH (prioritet P2)

- **Transport:** lasBakgrundsjobb mappar även stderrTail (fanns i våg 91:s
  P0-4-skiss, parsas ej idag) + avbrytBakgrundsTask ekoar protokollets
  ev. snapshot-fält (v83-formen: {cancelled, status, reason?, snapshot?}).
- **Endpoint:** GET /tjanster/bakgrund bär `felSvans?` per post; avbryt-
  svaret oförändrat ({avbruten, meddelande} räcker för knappen).
- **UI:** jobbkortet visar fel-svans (röd monospace-rad) endast när fältet
  finns — tyst bortfall annars.

---

## 3. PRIORITERINGSORDNING (till 100 %)

1. **GAP C (P1, binär)** — enda DRIFT-blocket: två färdiga tjänster står
   oanvändbara bakom 501. Åtgärd kräver INGEN kod — bara uppgradering av
   zcode-app-server + verifiering. Kustodiell risk: låg (UI döljer ärligt).
2. **GAP A (P1, kod)** — update-full gör automation-familjen fullt
   CRUD-bar; svarsformen är redan defensivt tolkad (risken sitter i
   protokollformen, som sonderas vid implementering).
3. **GAP B (P1, kod)** — "Kör nu" är kopplingen mellan automation-listan
   och den levande tråden (kundens "gör jobbet helt autonomt"); minsta
   ytan av de tre P1 (rutt + knapp, transporten klar).
4. **GAP D–G (P2, kod)** — djup och polish; D och F hör ihop (targetTaskId),
   E hör ihop med C, G är fristående smallest-effort.

**Rekommation till nästa våg:** P1-trion (C+A+B) i ETT manifest — C är
sond/uppgradering (data-/driftagent), A+B är src/-arbete (en agent, exklusiv
ägarskap av automation-rutten + tjänstpanelen). P2-kvartetten bokas som
efterföljande våg när P1 är bevisat i prod.

---

## 4. NOTERINGAR

- **Juridik:** automation-prompter är utbildningsinnehåll — planen röjer
  inga R2-ytor (priser/tier/publicering/nycklar orörs). checkTaskBinding
  och browserExecute rör inga avgöranden.
- **Binäruppgraderingen (GAP C)** är den enda leveransen som berör
  infrastrukturen, inte repot: zcode-app-server-versionen på Contabo
  avgör om interaktionsdomänens webbläsarmetoder finns. Verifieringen
  (GET ≠ 501) skall bokföras som bevis i worklog.
- **offPeak-grenen** i skickaAutomation lever transport-internt men har
  inget påvisat kundvärde ännu (ZCode Cloud-avvikelser, karta §5.6) —
  medvetet lämnad ur P1/P2 tills kunden ber om den.

— Fabriksagent p10 (automation-paritet), 2026-09-14. READ-ONLY mot src/
respekterat; enda skrivningen: denna fil. INGEN kod levererades — plan endast.
