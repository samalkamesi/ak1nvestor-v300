# INTEGRATIONSAUDIT — 2026-09-15

**Uppdrag** (kunddirektiv "integrera allt"): verifiera att ALLA levererade system
FAKTISKT fungerar TILLSAMMANS, inte bara var för sig. Granskningen är gjord genom
att LÄSA koden — inga ändringar i src/ har gjorts.

**Domsläge per granskningspunkt:**

| # | Integrationspunkt | Dom | Kort |
|---|---|---|---|
| 1 | TRÅD + MÅL (iteration → tradHistorik vid refresh) | **STÄMD** | malStatus() + lasTradHistorik() samverkar i GET /api/studio/stream; iterationen flödar via session/messages + db.sqlite |
| 2 | UPPDRAGSMOTOR + MÅL (order → mål → trådsminne) | **STÄMD** | hjärtat POSTar malSatt; rutten kör sattMal + injiceraTradminneIBakgrunden() direkt efter |
| 3 | AUDIT + FABRIK (fabriksbarn skriver audit-rader) | **STÄMD** | skrivAudit körs per uppgift (uppgift_start + uppgift_klar med LEVERANS-kvitto) |
| 4 | GODKÄNNANDE + JURIDIKGRIND (Publicera → sista kontroll) | **GAP** | rutten kör våg 66-grinden (varumärkes-FEL-fraser), MEN den mekaniska juridikgrind-vakten (r1–r5 rådsförbud + tvärfall) körs EJ i rutten och juridik-larm.json läses aldrig |
| 5 | FELJÄGAREN + HJÄRTAT ([FELJÄGT] → målsession) | **BRISTANDE** | feljakt-fynd.jsonl har NOLL konsumenter — hjärtat läser den ej, ingen push till sessionen |
| 6 | KOMPRIMERING + TRÅDMINNE (tier-3 → ny session bevarar minne) | **STÄMD** | tier-3 ⇒ markeraModellDod ⇒ nästa send går frisk create (nyFoddTrad) ⇒ konsumeraTradsminne prefixar |
| 7 | MASKINPULS + ALLA PUMPOR (/api/studio/maskin) | **GAP** | mal/fabrik/hjärta/audit/uppdrag/juridik-tid/synk/scenario visas — men feljägaren, konfigintegritetsvakten och automation-motorn saknas helt |

---

## 1. TRÅD + MÅL — STÄMD

**Fråga:** När en mål-iteration avslutas och kunden refreshar — flödar iterationen
in i tradHistorik korrekt?

**Kedja (radbevis):**

1. **Iterationen blir en riktig turn i sessionen.** Mål-loopen lever på
   DEFAULT-transportens session; transportens händelsehanterare
   `hanteraMalEvent()` (src/lib/studio/studio-transport.ts:5868) räknar upp
   `malIteration` vid `turn.started` (rad 5872) och bokför svaret vid
   `turn.completed` via `markeraMalIterationSlut(this.sid, this.malIteration, malSvar)`
   (rad 5976) — assistant-post med 🎯-prefix in i sessionskartan (rad 8765–8777),
   som debounce-skrivs till disk (karta.json). Själva turnen persistas av zcode
   självt (skapa() sätter `persistence: "immediate"`, rad 3866) — db.sqlite får
   raderna direkt.
2. **malStatus() samverkar i GET-rutten på tre sätt**
   (src/app/api/studio/stream/route.ts):
   - Rad 249–252: `transport.malStatus()` — om målet är helt borta (null, ej
     pausat, ingen turn) återarmnas disk-målet/stående mål INNAN svaret byggs
     (VÅG 148C) — kundens refresh ser aldrig ett spök-löst mål.
   - Rad 271–279: mål-sanningen (`aktivtMal`) läses ur den LEVANDE
     transportens `malStatus()` med `sessionId` (VÅG 145-källfixen) — mål-
     sessionens id är studions öppningspreferens vid refresh.
   - Rad 297–298: svaret bär `aktivtMal` + `tradSessioner` (huvudtrådens bok).
3. **tradHistorik byggs med den levande svansen.** Rad 304–307:
   `lasTradHistorik(lasHuvudtradSessioner(), { sessionId: transport.sessionId(), historik })`
   där `historik = await transport.historik()` (rad 261) — dvs. `session/messages`
   (studio-transport.ts:6291–6329) som INNEHÅLLER mål-turnens user/assistant-
   texter. I `lasTradHistorik` (studio-transport.ts:9067–9084) ersätter den
   levande historiken db-skivan för just den aktuella sessionen (rad 9077–9079,
   `slice(-120)`, 3 000 tecken/post) — övriga bok-sessioner läses ur db.sqlite
   (v148, readOnly). Kall/varm start ändrar inte utfallet: "värms"-grenen
   (rad 226–237) och fel-grenen (rad 309–325) svarar tradHistorik ur db:n.
4. **Sessionskedjan är registrerad.** `skapa()` registrerar varje ny
   huvudtrådssession i boken (`registreraHuvudtradSession(sid)`, rad 3873) och
   ensure-resume gör om det idempotent (rad 3481).

**Slutsats:** iterationens text finns i tre oberoende källor (db.sqlite,
levande session/messages, karta-återkopplingen) och GET syr samman dem med
mål-state:t i ETT svar. Integrationen är hel.

---

## 2. UPPDRAGSMOTOR + MÅL — STÄMD

**Fråga:** När hjärtat låser en order som mål — bär TRÅDMINNET med sig till den
nya sessionen?

**Kedja (radbevis):**

1. **Hjärtat låser ordern.** verktyg/mal-hjartslag.mjs:109–146 (VÅG 156):
   läser `data/vakten/kunduppdrag.json`, formulerar KUNDUPPDRAG-måltexten och
   POSTar `{action: "malSatt", mal: malText}` till /api/studio/session
   (rad 124–128), arkiverar ordern (rad 130) och bokför i uppdragslogg.jsonl.
2. **Rutten kopplar malSatt → trådsminne.** src/app/api/studio/session/route.ts:226–233:
   `await transport.sattMal(mal)` följs OMEDELBART av
   `transport.injiceraTradminneIBakgrunden()` (rad 232) med explicit kommentar
   "mål-återarmning på nyfödd session … internaliserar TRÅDMINNET i bakgrunden".
3. **sattMal föder vid behov sessionen.** sattMal (studio-transport.ts:4511)
   anropar `this.ensure()` — efter omstart/friskgång skapas en NY session via
   `skapa()` som sätter `nyFoddTrad = true` (rad 3876, endast default-transporten).
4. **Bakgrundsinjektionen internaliserar minnet.**
   `injiceraTradminneIBakgrunden()` (studio-transport.ts:3905–3928): konsumerar
   `nyFoddTrad`, bygger prefix ur `byggTradsminnePrefix(this.sid)` (hela trådens
   svans ur db + worklog + beslutsminne, rad 9032–9057) och skickar en tyst
   MINNESINJEKTION via `this.skicka(prompt, tystLyssnare)` med retry ×3 (30 s
   mellan) om mål-turnen håller sessionen upptagen (-32010).
5. **Redundans:** samma injektionskoppling finns i GET /api/studio/stream
   (rad 260) — en refresh efter omstart täcker samma hål.

**Noterad gräns (ej dom-påverkande):** om sessionen RESUMEAR levande (normalfallet
utan omstart) är `nyFoddTrad` false och ingen injektion sker — korrekt, då bär
sessionen sitt eget samtal. Om mål-turnen håller sessionen upptagen längre än
3×30 s sjunker injektionen tyst (fire-and-forget) — dokumenterad avvägning, och
nästa kund-prompt/fresh birth täcker igen via `konsumeraTradsminne`.

**Slutsats:** kopplingen order → malSatt → ny session → trådsminne finns och är
radbevisad i båda ändar.

---

## 3. AUDIT + FABRIK — STÄMD

**Fråga:** Skriver fabriksbarn verkligen audit-rader?

**Kedja (radbevis):**

1. **Import:** verktyg/agentfabrik.mjs:88 — `import { skrivAudit } from "./audit-logg.mjs"`.
2. **Per uppgift, vid start:** rad 528 — `skrivAudit(\`fabriken:${manifestId}:${uppgift.id}\`, "uppgift_start", uppgift.titel, \`manifest: ${manifestId}\`)`.
3. **Per uppgift, vid slut:** rad 559–564 — `skrivAudit(..., "uppgift_klar", leverans ?? utdata/<manifest>-<uppgift>.log, "kod=N sekunder=M")` i close-handlern FÖRE resolve (ROND 25: bokföringen överlever omgångsdöd mitt i en omgång).
4. **Skrivaren:** verktyg/audit-logg.mjs (spegel av src/lib/studio/audit-logg.ts,
   identiskt fruset schema) — append-only JSONL till
   `data/vakten/audit-logg.jsonl`, hemlighetssanering, tak 5 000 rader, kastar
   ALDRIG. Läs-yta: /api/studio/audit via `lasAuditRader` (route.ts:19,29).
5. **Kedjan är sluten:** transporten skriver också audit (t.ex.
   komprimering_tier3, studio-transport.ts:4153–4158) till SAMMA fil — fabrik +
   app + kundknappen (publicera-rutten, aktor "kund") delar en spårbarhet.

**Notering:** audit-raderna skrivs av FABRIKEN (föräldern) om varje barn, inte
av barnprocessen själv — barnens prompt (prefix(), rad 495–513) instruerar
LEVERANS-kvitto, inte audit-skrivning. Detta är den designade spårbarheten
(VEM gjorde VAD mot VILKEN artefakt) och räcker för integrationskravet.

**Slutsats:** varje fabriksuppgift efterlämnar två audit-rader (start + kvitto)
i den gemensamma loggen. STÄMD.

---

## 4. GODKÄNNANDE + JURIDIKGRIND — GAP

**Fråga:** När kunden trycker Publicera — kör pub-rutten FAKTISKT juridikgrinden
som sista kontroll?

**Vad rutten GÖR** (src/app/api/studio/godkannande/publicera/route.ts):
1. requireAdmin (rad 60–61).
2. Väntelistsvakt — sökväg MÅSTE stå FLYTTKLAR i lasGodkannandePoster (rad 72–87).
3. Engångsvakt — slug får ej finnas i data/blogg/ (rad 89–94).
4. **"Vakt 4": våg 66-grinden** — BlogPost-form: `kontrolleratextRad(titel, description, body)`
   i rutten (rad 127–138), 0 FEL + 0 strukturFel krävs annars 400. m9-form:
   `exporteraKlarPost` kör SAMMA grind inuti lib (blogg-utkast.ts:520–529,
   kastar BloggValideringsFel → 400). Därpå disclaimer säkerställs som sista rad
   (`sakerstallDisclaimer`, blogg-utkast.ts:486–491) och atomär skrivning
   (tmp+rename, rad 157–161). Audit rad 175–180.

**Vad grinden FAKTISKT täcker:** `kontrolleratextRad` → `kontrolleraText`
(varumarke.ts:141) matchar data/varumarke.json forbjudnaFraser — där FEL-nivån
är explicit juridiskt motiverad (P2/2007:528: "garanterad avkastning",
"riskfri", "säker vinst", "aktietips", "köp/sälj-rekommendation", icke-negerat
"investeringsråd"; P1 share-walls; P6 pixlar) + strukturkrav (längd, rubriker).

**GAP:ET — den mekaniska JURIDIKGRIND-VAKTEN körs ej här:**
- verktyg/juridikgrind-vakt.mjs (mega g2) är den DEDIKERADE grinden: bredare
  rådsförbudslista (r1 "rekommenderar dig att köpa", r2 "min rekommendation",
  r3 "du bör köpa", r4 "köp denna aktie", r5 "sälj nu/dina aktier" …), utbildnings-
  grundskontroll och TVÄRFALL-lagrumsparning. Den körs ENBART via pumpor-daemon
  min==37 (pumpor-daemon.mjs:75), FÖRE FLYTTKLAR, och skriver larm till
  data/vakten/juridik-larm.json.
- Pub-rutten importerar EJ vakten och läser EJ juridik-larm.json (inget
  förekomster i route.ts). Inpassbiljetten är granskningsledens FLYTTKLAR-rad
  (godkannande.ts:46 parsar protokollet), inte vaktdomens status.
- **Konsekvens:** en text med en rådgivningsformulering som ENDAST vakten fångar
  (t.ex. "du bör köpa" — matchas ej av varumarke.json:s `köp/sälj-rekommendation`)
  kan publiceras om granskaren satt FLYTTKLAR innan/independent av vaktdomens
  FEL-larm. Timing-hålet: vakten kör :37 varje timme; FLYTTKLAR kan sättas
  när som helst; larmet konsulteras aldrig vid själva trycket.

**Kur (förslag):** läs juridik-larm.json för postens sökvag/slug i vakt 2–4, eller
kör RADS_FORBUD-regexarna in-process i rutten före skrivning.

---

## 5. FELJÄGAREN + HJÄRTAT — BRISTANDE

**Fråga:** Upptäcker hjärtat feljägarens fynd? Hur skulle [FELJÄGT]-larm nå
målsessionen?

**Fakta (radbevis):**
1. Feljägaren (verktyg/feljagaren.mjs, våg 167) bokför fynd i
   `data/vakten/feljakt-fynd.jsonl` (bokfor(), rad 44–52) + stdout-rader
   `[FELJÄGT HÖG|MEDEL] …`. Körs av pumpor var 15:e minut (min%15==12,
   pumpor-daemon.mjs:82) med `stdio: "inherit"` — stdout hamnar i pm2-loggen
   för ak1a-pumpor, ingen annanständare.
2. **Noll konsumenter:** genomgångsökning i hela src/ + verktyg/ efter
   "feljakt", "feljagt", "FELJÄGT" ger träffar ENDAST i feljagaren.mjs självt.
   Ingen kod läser feljakt-fynd.jsonl.
3. **Hjärtat läser den ej:** mal-hjartslag.mjs (hela filen, 344 rader) läser
   /api/studio/mal/status, kunduppdrag.json, uppdrag-klart.json och
   hjartslag-state.json — fyndfilen nämns inte.
4. **Maskinpulsen visar den ej:** /api/studio/maskin läser feljakt-fynd.jsonl
   inte (se punkt 7).
5. **Enda teoretiska väg:** mål-agenten kan själva råka läsa filen eller köra
   verktyget under en iteration (stående måltext säger "kör vakten till 0 fynd"
   — om kvalitetsvakten). Det är ingen integration, det är hopp.

**Konsekvens:** HÖG-allvarsfynd (t.ex. "pm2-process nere", "API 500") ligger i
en jsonl som ingen maskin lyssnar på — hjärtat fortsatter kicka målet mot
"nästa uppgift" utan att veta att ett systemfel ropar på just rättning.
[FELJÄGT]-larmet når ALDRIG målsessionen mekaniskt.

**Kur (förslag):** hjärtat läser svansen av feljakt-fynd.jsonl; nya HÖG-fynd ⇒
skicka dem som HJÄRTSLAG-prompt till /api/studio/stream (samma mönster som
zombie-kicken, mal-hjartslag.mjs:222–229) och/eller visa dem i /api/studio/maskin.

---

## 6. KOMPRIMERING + TRÅDMINNE — STÄMD

**Fråga:** Efter en tier-3-modelläkning — bevaras trådsminnet i den nya sessionen?

**Kedja (radbevis):**
1. **Tier-3-vägen:** compact() fångar -32031 (arModellOtillganglig), försöker
   först `lakSessionensModell()` (setModel på levande session, rad 4118–4137).
   Misslyckas det: **TIER 3** (rad 4139–4166) — `markeraModellDod(this.sid)`
   (rad 4146), audit "komprimering_tier3" (rad 4153), ärligt svar
   "modell_dod_arv": "Nästa meddelande startar automatiskt en frisk session
   MED trådens minne".
2. **Flaggan överlever:** markeraModellDod (rad 8557–8569) skriver
   `modellDod: true` i sessionskartan som debounce-skrivs till disk (karta.json)
   och hydreras vid omstart (rad 8730).
3. **Nästa meddelande går friskt:** skicka() → ensure() → ensureKarna() beräknar
   `friskgang = … arFrigangSession(sparad, sparadTid)` (rad 3452–3453);
   arFrigangSession returnerar true när `kort?.modellDod === true` (rad 8585) ⇒
   INTE resume, utan `skapa()` (rad 3499).
4. **Minnet injiceras:** skapa() sätter `nyFoddTrad = true` (rad 3876) och
   skicka() konsumerar det VID SÄNDNINGEN: rad 6349–6351
   `prompt = this.konsumeraTradsminne(prompt)` (efter ensure, före send).
   konsumeraTradsminne (rad 3885–3895) prefixar en gång med
   byggTradsminnePrefix(uteslutSid=this.sid) — trådens sista 60 poster ur ALLA
   andra bok-sessioner + worklog + beslutsminne.
5. **Mid-send-varianten:** om -32031 kommer MITT I en sändning gör
   självläkningen markeraModellDod → skapaFriskSession →
   `await skickaSend(this.konsumeraTradsminne(prompt))` (rad 6462–6471) —
   rot-fixen för modellDöd-rotationer, explicit kommenterad.

**Slutsats:** tier-3-lovet i användarmeddelandet är mekaniskt infriet: flagga →
frisk create → trådsminne vid första sändningen. STÄMD.

---

## 7. MASKINPULS + ALLA PUMPOR — GAP

**Fråga:** Visar /api/studio/maskin ALLA pumpors status? Finns feljägaren,
konfigintegritetsvakten, automation-motorn där?

**Vad rutten VISAR** (src/app/api/studio/maskin/route.ts:103–158):
- `mal` — malStatus() från levande transport + `malFranDisk` (mal-state.json), incl. `arKunduppdrag` (rad 110–126) ✓
- `fabrik` — agentfabrik/status/*.json + ko/ (rad 128, lasFabrik) ✓
- `hjarta` — hjartslag.log sista 4 raderna (rad 129) ✓
- `audit` — audit-logg.jsonl sista 8 (rad 130) ✓
- `uppdrag` — uppdragslogg.jsonl sista 5 (rad 131) ✓
- `vakter.juridik` — ENDAST `senasteKorning`-tidsstämpeln ur juridik-larm.json (rad 132–134, 148) — delvis
- `synk` — prod-synk.log sista 2 (rad 135) ✓
- `vakter.scenario` — scenariotest.log sista raden (rad 136, 149) ✓

**Vad som SAKNAS (mot pumpor-daemonens schema, pumpor-daemon.mjs:68–83):**
- **FELJÄGAREN** (min%15==12): feljakt-fynd.jsonl läses EJ — HÖG-fynd syns inte i pulsen.
- **KONFIGINTEGRITETSVAKTEN** (min%10==9): konfig-larm.jsonl / konfigintegritetvakt.log läses EJ — [KONFIG-DRIFT]-larm osynliga.
- **AUTOMATION-MOTOREN** (minutvis): automation-logg.jsonl läses EJ — härdade automationer (automationId i session/send) har ingen statusyta i pulsen trots att motorn eldar varje minut.
- Ej heller: kraschvakten, evighetsmotorn, gränssnittsvakten, integritetsvakten, minnesberedaren, data-hygienen (samma mönster — okommenterat i rutten).

**Konsekvens:** kundens fråga "jobbar loopen? jag ser ej sådant" besvaras fortfarande
INCOMPLETT: tre aktiva pumpor (varav feljägaren med HÖG-larm och automation-motorn
som kör varje minut) kan ha larmat/verkat utan att maskinpulsen visar något. En
grön puls är därmed inget bevis för att hela organismen mår bra.

**Kur (förslag):** lägg till `feljagt: jsonlSvans(feljakt-fynd.jsonl, 5)`,
`konfig: jsonlSvans(konfig-larm.jsonl, 5)` och
`automation: jsonlSvans(automation-logg.jsonl, 5)` — alla tre följer redan
jsonlSvans-mönstret i rutten.

---

## Sammanfattande dom

- **STÄMD (4):** Tråd+mål, Uppdragsmotor+mål, Audit+Fabrik, Komprimering+Trådsminne.
- **GAP (2):** Godkännande+Juridikgrind (pub-rutten kör varumärkesgrinden, inte
  den mekaniska juridikgrind-vakten; juridik-larm.json konsulteras ej),
  Maskinpuls+Alla pumpor (feljägare, konfigintegritetsvakt och automation-motor
  saknas i /api/studio/maskin).
- **BRISTANDE (1):** Feljägaren+Hjärtat — fyndfilen har noll konsumenter;
  [FELJÄGT]-larm når aldrig målsessionen.

*Granskat av integrationsgranskningsagenten 2026-09-15. Endast läsning av src/;
denna fil är den enda skrivningen. Ej committad.*
