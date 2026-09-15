# KONTROLL 7 — Isolerade subagent-events (z code 3.11.2-21)

Datum: 2026-09-11
Kontrollant: kontrollagent (AK1A)
Källa: ssh Contabo /home/ak1a/forskning/zcode-cli — klonad version **3.11.2-24** (gap-posten säger 3.11.2-21; mekanismerna är desamma i klonen).
Studio: C:\Users\Workstation Z G4\.zcode\workspace\default\ak1 (läsning av src — inga ändringar).

## DOM: STÄMD

Ett subagent-barns events (text/verktyg) kan **inte** läcka in i huvudtrådens
chattflöde i studion under den bevisade protokollformen. Studion replikerar
källans isolering via tre oberoende lager, och källans extra härdning
(5-nivå-sessionId-lösning) är en defensiv delta utan livt bevis — se
"Härdningsnotis" nedan.

---

## 1. Hur källan isolerar barn-events (fyra mekanismer)

### 1.1 Främmande sessions-ID slängs — index.ts:2336-2347
`onSessionEvent` normaliserar och kollar `isForeignSessionEvent` FÖRE all
hantering:

```ts
private onSessionEvent(value: unknown): void {
  const event = normalizeEvent(value);
  if (!event || this.isForeignSessionEvent(event)) return;
  this.applyBackgroundTaskEvent(event);
}
private isForeignSessionEvent(event: StreamEvent): boolean {
  return Boolean(this.sessionId && event.sessionId && event.sessionId !== this.sessionId);
}
```

Avgörande: `normalizeEvent` (events.ts:117-121) löser `sessionId` från **fem
nivåer** — `value.sessionId ?? params.sessionId ?? payload.sessionId ??
body.sessionId ?? part.sessionId`. Ett event som bär barnets sessionId på
någon nivå känns igen som främmande och slängs.

### 1.2 Typ-routing till task-register, aldrig transkriptet — background-task-events.ts:126-160
`subagent_message`, `subagent_stopped`, `background_task_completed` osv. går
till `backgroundTaskEvents.handle(event)` som `record(taskId, "assistant", …)`
+ genererar notiser ("Background agent replied") i /tasks-vyn. De skrivs
ALDRIG till förälderns transkript. `subagent_message`-texten plockas ur
`body.text` (events.ts:179) med `childSessionId` ur kuvertet eller
`subagentMessage`-posten (events.ts:156-157).

### 1.3 Livscykel fäster på FÖRÄLDERNs verktygsvy — index.ts:2962-2976
`handleSubagentLifecycle`: `subagent_spawned`/`subagent_stopped` med
`progress.parentToolCallId` uppdaterar förälderns Task-verktygsvy — inga nya
transkriptblock för barnet skapas.

### 1.4 Rått barn-transkript renderas aldrig — tool-renderers/execution.ts
- `taskOutputDisplay` (rader 215-247): dokumenterat krav — råa `output`/
  `content`-fält "can embed a full subagent transcript, so it must never be
  rendered directly"; kompakt `display`-metadata föredras.
- `agentRender` (rader 57-108): barnets `content`/`prompt` är `hiddenContent`
  — endast synligt vid explicit expandering.

Stödstruktur: `RuntimeBackgroundJob.childSessionId/parentSessionId/
parentToolCallId` (runtime-projection.ts:47, 260-261) identifierar barnet i
projektionen; `RestoredPart` för tool bär `childSessionId` (events.ts:380).

## 2. Studions motsvarande isolering (tre lager)

### 2.1 Prenumerationen är sessions-scopad
`session/subscribe {sessionId}` (R1-PROTOKOLLET.md §6 rad 41) — studion
prenumererar ENDAST på förälderns session; barnets egen eventström nås
aldrig (samma som TUI:n, som bara prenumererar på föräldern).

### 2.2 Främmande sessionId slängs — studio-transport.ts:6056
```ts
// Event från annan session än den aktiva (t.ex. en kasserad session
// under självläknings-omskapandet) skall aldrig blandas in.
if (p?.sessionId && this.sid && p.sessionId !== this.sid) return;
```
Bevisad live-form (v83 STUDIO-2 på Contabo 2026-09-09, transport-create2.txt;
även kommentar rad 6047-6052): zcode ≥ 3.11.2-22 bär typen på PARAMS-nivå —
sessionens sessionId lever i samma kuvert. Vakten körs FÖRE både
mål-loopen (6063) och prompt-grenen (6067).

### 2.3 Subagent-typer har inga cases — tyst fallthrough
`påNotis` switch (studio-transport.ts:6069-6204) hanterar endast:
turn.started, tool.updated, part.delta, model.streaming,
model.response.completed, turn/turn.completed, model_request_*,
default (endast `tool.*`). `subagent_message` / `subagent_spawned` /
`subagent_stopped` / `background_task_*` matchar INGET case, är inte
`tool.*`-prefixerade → **returneras tyst utan att nå chattlyssnaren** — i
både promptvägen (default 6194-6204) och mål-loopen `hanteraMalEvent`
(default 6009-6017). Ingen läcka; barnets synlighet i studion kommer i
stället från 15 s-poll av `session/subagents` (studio-transport.ts:4828-4872,
6683-6689) som renderas ENDAST i BAKGRUNDSJOBB-panelen
(studio-chat.tsx:3223-3266, 9935-9944, 10999-11060) — aldrig i chattflödet.

### 2.4 Förälderns egna Task-kort (korrekt synliga)
`sändVerktygKort` (studio-transport.ts:5791-5856) renderar förälderns EGEN
Task-verktygskall — rätt, samma som TUI:ns föräldervy. Resultatet strängsätts
via `resultatText` (3081-3086) med tak `MAX_RESULTAT_TEEKEN = 1_500` tecken
(3058) — grövre än källans display-metadata-parsning men bundet: ingen full
barn-transkriptdump är möjlig i kortet.

## 3. Domvärdering

| Läckväg | Källan | Studion | Dom |
|---|---|---|---|
| Barnets model.streaming-deltan | Egen session + isForeignSessionEvent (5 nivåer) | Egen session + vakt 6056 (params-nivå) | Isolerad |
| subagent_message-text | Task-register + notis (background-task-events.ts:144) | Tyst fallthrough i default-grenen | Isolerad (ej ens ett spår i chatten) |
| Barnets verktygskall | Lever aldrig på förälderströmmen | Samma + vakt | Isolerad |
| Task-resultat med inbäddat transkript | taskOutputDisplay vägrar rå render (execution.ts:217) | resultatText trunkat 1 500 tecken | Isolerad (bundet) |
| Främmande session (kasserad/omskapad) | isForeignSessionEvent | Vakt 6056 — kommentaren dokumenterar självläknings-fallet | Isolerad |

## 4. Härdningsnotis (EJ gap — ingen fix krävs)

Källan löser sessionId på **fem** nivåer (events.ts:117-121: value/params/
payload/body/part); studien endast på **params** (6056), och
`SessionEventParams.payload` (studio-transport.ts:2180-2235) saknar ens ett
`sessionId`-fält. Livt bevis (v83 STUDIO-2) visar params-nivå i ≥3.11.2-22,
och prenumerationen är sessions-scopad, så inget barn-event passerar idag.
OM en framtida protokollform lägger sessionId på payload-/part-nivå skulle
vakten missa det och ett barn-delta kunde strömma in i chatten.

Frivillig härdning (om 3.11.2-2x ändrar kuvertform):
1. `studio-transport.ts:2180` — lägg till `sessionId?: string;` i
   `SessionEventParams["payload"]`-typen.
2. `studio-transport.ts:6056` — byt till
   `const sid = p?.sessionId ?? (typeof payload?.sessionId === "string" ? payload.sessionId : undefined);`
   `if (sid && this.sid && sid !== this.sid) return;`
Kostnad: två rader; paritet med källans försvar.

## 5. Källhänvisningar (exacta)

Källan (Contabo, /home/ak1a/forskning/zcode-cli, v3.11.2-24):
- packages/zcode-tui/src/index.ts:2336-2347 (onSessionEvent + isForeignSessionEvent), 2349-2376 (suppressBackgroundCoordinator*), 2962-2976 (handleSubagentLifecycle)
- packages/zcode-tui/src/events.ts:117-121 (5-nivå sessionId), 156-157+179 (childSessionId/subagent_message), 198 (progress.childSessionId), 380+453-465 (RestoredPart)
- packages/zcode-tui/src/background-task-events.ts:126-160 (typ-routing)
- packages/zcode-tui/src/tool-renderers/execution.ts:57-108 (agentRender/hiddenContent), 215-247 (taskOutputDisplay)
- packages/zcode-tui/src/runtime-projection.ts:47, 260-261 (RuntimeBackgroundJob)

Studion (C:\Users\Workstation Z G4\.zcode\workspace\default\ak1):
- src/lib/studio/studio-transport.ts:6044-6067 (session/event-gren + vakt 6056), 6069-6204 (switch, default 6194-6204), 5868-6018 (hanteraMalEvent, default 6009-6017), 5791-5856 (sändVerktygKort), 3058+3081-3086 (trunkering), 2168-2236 (SessionEventParams), 4828-4872+6683-6689 (session/subagents)
- src/components/ak1a/studio-chat.tsx:3223-3266, 9935-9944, 10999-11060 (BAKGRUNDSJOBB-panel), 3759-3760 (15 s-poll)

---

STÄMD
