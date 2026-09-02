# Forskning: Organ-/kropp-arkitektur — underlag till MEGA_PLAN_V3

Datum 2026-09-01. Underlag för hur AK1A:s 8 AI-organ (Σ α Δ Ω Φ Θ Μ Ψ), motorer och UI
ska samverka som EN kropp. Källor: repo-granskning + webbforskning (länkar sist).

---

## 1. Nuläge i repot — kroppen finns, men fragmenterad

| Del | Fil | Status |
|---|---|---|
| OrganBus (makro↔mikro) | `src/lib/autonom/organ-bus.ts` | Levande. `type=organ_msg`, ~15 rader/rond |
| Organ-motor (hälsa/SEO/retention) | `src/lib/autonom/organ.ts` | Levande. `type=autonom_report`, 1 rad/körning |
| Styrelsen (deterministisk prioritering) | `src/lib/autonom/styrelse.ts` | Levande, ren funktion |
| 8 AI-organ (Σ…Ψ, LLM via ZAI) | `src/app/api/styrelse/*` | **Trasiga pådeployat läge**: skriver via `db.systemEvent` men `src/lib/db.ts` är `export const db = null` (Prisma borttaget). Panelen `autonom-organ-panel.tsx` läser döda endpoints |
| Motorer (analys, konfluens, netnet, vågfundament, superanalys) | `src/lib/*-motor.ts` | Deterministiska, anropas direkt av routes — skriver INGA events (undantag: vagscan-cron) |
| UI-prenumeration | admin-paneler | Engångs-`fetch no-store` vid knapptryck. Ingen polling, ingen kroppsvy |
| UI-eventkonvention | `window.dispatchEvent` | Finns redan!: `ak1a:oppna-sok`, `ak1a:shortseller-attacka` |
| Cron (Hobby = 1×/dag) | `vercel.json` | 4 jobb: autonom 00:00, seo 03:00, vagscan 05:00, expand 12:00 |

**Fragmenteringen**: event-typnamnen i `system_events` är ad hoc (`organ_msg`,
`autonom_report`, `xp_sync`, `fas2_ansokan`, `ai_organ_autonom_proposal`…) och två
skrivstackar (Prisma=null vs Supabase REST). Två parallella organsystem (5 mikro-organ
i organ-bus + 8 AI-organ i styrelse-routes) känner inte till varandra.

**Hårda betingningar**: bounded writes (500 rader/30d — 17,7M-kollapsen!), Vercel Hobby
(ingen WS, ingen tät cron, 60s maxDuration), Supabase REST är enda levande bussen.

---

## 2. Forskningsläge (webb)

### 2.1 Event-driven vs direkta anrop — små team
Konsensus (Fowler; Design Gurus; Azure-arkitekturguiden): **hybrid**. Direkta
funktionsanrop för synkront request/response (användaren väntar på svar); events för
asynkron bakgrund (rapportering, beslut, audit). Fowlers varning är central: *event
notification* med för lite data tvingar konsumenter att ringa tillbaka — välj **event-
carried state transfer** (hel payload i eventet). AK1A gör redan rätt: organ-bus lägger
hela `details` i raden (meddelandefältet är bara klipp på 300 tecken).

### 2.2 System of Systems (SoS)
SEBoK/ISA: ett SoS = oberoende system som samverkar mot gemensamma mål. Tre styrformer:
**directed** (central orkestrator), collaborative, virtual. Nyckelprinciper: varje del
optimerar sig själv (spänning mot helheten), samverkan endast via interfaces, och **två
beslutsnivåer**: globala arkitekturbeslut (protokoll, retention) vs lokala (organets
inre logik). AK1A är renodlat *directed SoS* — MAKRO-styrelsen orkestrerar, men dagens
"organtyp-register"-dröm (F5, tusen organ) kräver att protokollet är så billigt att ett
nytt organ bara behöver: ett id, en kadens och en event-rad.

### 2.3 Bloomberg-terminalen — modul-samverkan
Bloombergs kemiska formel: (a) ett **kommandospråk** av mnemonics (~30 000 funktioner),
(b) **delad kontext** — aktuell aktie/ticker och historik persistrar över alla funktioner,
(c) moduler meddelar inte varandra — de läser/skriver samma kontext ("blackboard"),
(d) CTO:n Shawn Edwards designregel: komplexiteten döljs, inte visas. Lärdom för AK1A:
organen behöver inte adressera varandra — de läser/skriver en gemensam tavla
(`system_events` + delat UI-tillstånd), och admin får en kommandorad med mnemonics.

### 2.4 Observability — health per organ → kroppsvy
Microservices.io Health Check API + K8s-konventioner (/livez vs /readyz): liveness =
processen lever, readiness = kan betjäna. Men AK1A:s organ är inga daemoner — de är
funktioner som vaknar vid cron/anrop. Rätt mönster är därför **pulsen/heartbeat**:
ett organ är "levande" om det rapporterat inom sin kadens (à la "pulse model").
Aggregatorn (kroppsvyn) läser senaste event per organ och beräknar färskhet+severity →
samlad status. Inga nya endpoints per organ behövs — loggen ÄR pulsen.

### 2.5 Realtid i Next.js utan websockets (Vercel Hobby)
Vercel KB + SWR-doktrin: serverless kan inte hålla WS/SSE-anslutningar. Mönstret som
fungerar: **SWR med `refreshInterval` + `revalidateOnFocus`** mot ett lättvikts-
aggregat-endpoint (en enda query), ev. villkorlig hämtning (hämta full body bara när
`senaste_event_id` ändrats). För fönstret emellan: client-side CustomEvents. 30–60 s
polling av en cached aggregat-route kostar inget på Hobby och kräver noll infrastruktur.

---

## 3. Syntes — konkreta mönsterförslag för AK1A

### 3.1 VIKTIGAST: EN event-konvention — "OrganEvent v1"
Ett schema, en skrivfunktion, alla organ. Migrera stegvis (gamla type-namn läses kvar
en övergångsperiod):

```jsonc
// system_events-rad (postas via EN helper: src/lib/autonom/events.ts)
{
  "type": "organ",                       // EN typ för allt organ-beteende
  "severity": "info|warning|error",
  "message": "[analys] rapport → 5 analyser, 0 föråldrade",
  "source": "organ/analys",              // organ/<id> | motor/<id> | styrelsen
  "details": {
    "schema": "ak1a-organ-event/1",
    "organ": "analys",                   // slug ur ORGAN_REGISTRY, aldrig fritext
    "verb": "rapport|beslut|delegation|halsopuls|atgard",
    "status": "ok|varning|atgardar|av",
    "matt": { "analyser": 5, "mal": 10 }, // event-carried state transfer — HEL payload
    "korrelation_id": "ronda-2026-09-01-03",  // binder samman en rondas händelser
    "ui": { "kanal": "kroppsvy", "viktighet": 1 }  // 1=tyst, 2=badge, 3=toast
  }
}
```

`ORGAN_REGISTRY` (i samma fil): `{ organ, symbol, namn, kadensTim, agare }` — t.ex.
analys (α), data (Δ), marknad (Μ), utbildning (Ψ), styrelsen (Σ)… Slå samman de 5
mikro-organen och 8 AI-organen till ETT register där varje organ har exakt en
rapporteringskod. Retention-organet städar som idag — **loggen är nervsystemet
(rullande fönster), repo/DB är långtidsminnet**: beslut av vikt skrivs även som
beständig artefakt (protokoll/worklog), inte bara som event-rad.

### 3.2 Delad kontext i stället för adresserade meddelanden (Bloomberg)
Behåll `till: "ALLA"` som norm — organ publicerar till tavlan, bara styrelsens
`delegation` adresseras. På klientsidan: en delad kontext-store i admin (valt organ,
vald aktie, aktuell ronda — gärna URL-searchparams) som ALLA paneler läser. Admin får
en kommandorad med mnemonics: `RONDA` (kör /api/organ/runda), `HELSA` (kör organ-motor),
`SCAN <ticker>` (motor), `AKTIE <ticker>` (sätter kontexten alla paneler ser).

### 3.3 Hälsokoll per organ — pulsmodellen (noll nya endpoints)
`GET /api/kropp` (force-dynamic, 1 Supabase-query: senaste ~120 rader ur system_events):
gruppera per `source`, ta senaste raden per organ, beräkna
`status = severity + (ålder > kadens ? "av/stale" : färsk)`. Levande om rapport inom
2× kadens. Kroppsvyn = tabell med symbol, namn, pulsen (ålder), mätetal, nästa åtgärd
ur senaste delegation. Bonus: `korrelation_id` gör att en rondas hela kedja
(fragor→rapporter→beslut→delegation) kan visas som en tidslinje.

### 3.4 Realtidsflödet: SWR-poll → window-event (redan etablerad konvention)
```
/api/kropp (SWR refreshInterval 30s + revalidateOnFocus, villkorlig fullhämtning)
   └─ useKropp() jämför senaste_event_id
        └─ nytt? → window.dispatchEvent(new CustomEvent("ak1a:organ-event",
                          { detail: { organ, verb, status, matt } }))
             └─ panels prenumerar (samma mönster som ak1a:oppna-sok / shortseller)
```
En poll → broadcast → många komponenter. `ui.viktighet` styr om det blir toast (3),
badge (2) eller tyst uppdatering (1). På Hobby fylls pulsen mellan crons av **lazy
pulse**: första GET mot /api/kropp efter att ett organ gått ut sin kadens triggar
on-demand-rapport (samma skydd som /api/organ/runda) — "stale-while-revalidate för organ".

### 3.5 Direct calls vs events — brytdialogen till en regel
Synkront/användarvänt → direkt anrop (motorer i routes, som idag). Ska det synas i
kroppsvyn, överleva requesten eller driva autonomin → MÅSTE bli event-rad. Bryt
alltså alross beroenden mellan organ: varje organ läser bara tavlan, aldrig en annan
organs kod (SoS-principen: interfaces, två beslutsnivåer — globalt = events.ts + RETENTION;
lokalt = organets inre, fritt för agenter att ändra).

### 3.6 Implementationsordning (små steg, varje steg deploybart)
1. `src/lib/autonom/events.ts`: ORGAN_REGISTRY + `publisera()` (Supabase REST, bounded,
   timeout, samma SSRF-validering). Rensa Prisma-resterna i styrelse-routes (db=null).
2. Migrera organ-bus + organ.ts + vagscan till konventionen (behåll läs-stöd för gamla
   typer). Fixa de 8 AI-organ-routes att skriva via `publisera()`.
3. `GET /api/kropp`-aggregatorn + `useKropp()`-hook + `ak1a:organ-event`-broadcast.
4. Admin: kroppsv-panel (puls per organ + tidslinje per korrelations-id) + kommandorad.
5. Lazy pulse + koppla delegations-kön till byggagent-vågor (MEGA_PLAN_V2 WS-E).

---

## Källor
- Fowler, "What do you mean by Event-Driven?" — martinfowler.com/articles/201701-event-driven.html
- Event-driven vs request-driven — designgurus.substack.com/p/system-design-basics-event-driven; learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven
- SoS: isa-principles.org; sebokwiki.org (Architecting Approaches for SoS)
- Bloomberg: en.wikipedia.org/wiki/Bloomberg_Terminal; ted-merz.com/2025/03/20/bloombergs-secret-functions/; bloomberg.com/company/stories/how-bloomberg-terminal-ux-designers-conceal-complexity/; libguides.pace.edu (mnemonics)
- Health/observability: microservices.io/patterns/observability/health-check-api.html; oneuptime.com (health aggregation); vaadin.com/blog/microservices-health-monitoring
- Realtid utan WS: vercel.com/kb/guide/publish-and-subscribe-to-realtime-data-on-vercel; vercel.com/oss/swr; stackoverflow.com/questions/71520356
