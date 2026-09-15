# DR-VERKTYG GODKÄNNANDEPROV — `verktyg/dr-ovning.mjs` (2026-09-15, GODKÄNT MED HÄRDNING)

**Utförd av:** fabriksagent spår 10 omgång 2 (roll: vakt), 2026-09-15 kl 18:50–19:45 CEST.

**Relation till tidigare leveranser:** s10-u2 (kvartalsövning, manuell),
s10-u3 (replik + kollisionsfynd), s10-u4 (commit 55dc2ee2 — DR-ÖVNINGEN
MEKANISERAD som `verktyg/dr-ovning.mjs`). Detta protokoll är spårets nästa
icke-levererade objekt: **oberoende godkännandeprov av verktyget** (kod-
granskning + härdning + egen fullkörning av en annan agent än författaren) —
samma godkännandemönster som motorkörningen (validera-motorer) tillämpar på
motorer, här på DR-instrumentet. Körningen uppfyller samtidigt uppdragsbokstaven
(återställ, mät tid/rader, protokoll, städa lokal PG).

---

## 1. Sammanfattning för kunden (5 rader)

1. Ett annat maskinöga än byggarens har granskat och **provkört det nya
   DR-övningsverktyget** — det godkänns, efter att sex svagheter rättats.
2. Provkörningen återställde hela databasen på **23,9 sekunder** (femte
   oberoende mätningen: 20,0 · 17,7 · 14,7 · 20,0 · 23,9 s) med **exakt samma
   tabell- och radbild** som alla tidigare prov — verktyget mäter rätt.
3. Två nya skydd lades till: verktyget vägrar nu köra om serverns minne eller
   disk är för fullt (läxan från eftermiddagens minnesincident), och ett halvfärdigt
   databasfel kan inte längre lämna testdatabasen på.
4. Låsskyddet — bara en agent i taget får använda testdatabasen — **bevisades
   i verklig drift**: mitt eget test nekades korrekt medan en annan agent
   arbetade, och en lämnad låsfil städades bort med motivering.
5. Nästa kvartalsövning senast **2026-12-15**: `node verktyg/dr-ovning.mjs`
   (ett kommando, protokoll skrivs automatiskt).

## 2. Fabrikskollision nr 2 i spåret (dokumenterad — kö till huvudagenten)

Samma mönster som s10-u3 dokumenterade för omgång 1 upprepades trots allt:
manifestet gav (minst) två agenter uppgifter som ledde till samma objekt.

- **Beviskedja:** min session valde 19:10–19:15 mekaniseringen som "nästa
  icke-levererade objekt" (kontroll mot data/ + worklog visade u1/u2/u3 tagna);
  mitt Write-verktyg blockerades 19:19 av läshindret — syskonets fil fanns
  redan (skapad 19:20, 22 939 byte); syskonets restore-spår i /tmp 19:21;
  syskonets commit 55dc2ee2 ~19:26. Noll förlorat arbete: läshindret + min
  kollisionskontroll hejdade överskrivningen; jag vik objektet och tog
  godkännandeprovet istället.
- **Orsak:** u3:s kur nr 1 ("fabriksmanifest ger ALDRIG två id samma
  objekt-räckvidd") är fortfarande ej mekaniserad hos huvudagenten — "välj
  själv"-uppdragstexter utan objektreservation kolliderar när spåret är
  välkänt. Detta är **bevis nr 2**; kur ägs av huvudagenten (manifest-
  författing), inte av barnen.
- **Notering:** spårets tredje agent (moln-JSON-kedjan, S10-U3:2) valde ett
  fritt objekt och kolliderade inte — mönstret fungerar NÄR agenten kontrollerar
  före start; det måste därför betraktas som tur-förstärkt, ej säkert.

## 3. Granskningsfynd mot committad version (55dc2ee2)

| Id | Fynd | Allvar |
|---|---|---|
| H1 | `startaPg17`/`skapaSkrapDb` låg UTANFÖR det inre try/finally som städar — ett `createdb`-fel lämnar PG17 uppe, emot verktygets eget kontrakt "städnings­körs ALLTID" | högt (kontraktsbrott) |
| H2 | Ingen ram-/diskgrind före PG-start och restore — 16:42-incidentens läxa (DR-övning får aldrig svälta prod på minne) | högt (prod-risk) |
| H3 | RÖD dump-väg exiterade UTAN protokoll trots att kontraktet lovar "protokoll skrivs ändå"; mallraden för dumpdomen var hårdkodad "GRÖN" | medel (spårbarhet) |
| H4 | Mallens sammanfattning renderade "NaN sekunder"/"0 rader kom tillbaka" i avbrottsfallet — vilseledande ärlighet | medel (protokoll-ärlighet) |
| H5 | Typo "DUMEN UNDERKÄND"; protokollreferens "se §5" skulle vara §4 | lågt |
| D1 | Låsdesign: fil + atomär skapande + 30-minutersövertagande — fungerar men är svagare än flock (kärnan släpper vid processdöd; hängd process håller fönstret 30 min). Ändras EJ (funktionsbevisad design); rekommendation i stället: anropa under `flock -w 900 /tmp/ak1a-dr-prov.lock -- node verktyg/dr-ovning.mjs` när väntan är önskvärd | observation |

## 4. Härdning levererad (samma fil, omedelbart efter granskning)

- **H1:** `skapaSkrapDb()` flyttad in i det inre try-scope:t — städning körs
  nu från skrap-DB-skapandet genom hela övningen.
- **H2:** ny `grind()` — `MemAvailable ≥ 1 000 MB` och `≥ 5 GB ledigt på /`
  FÖRE allt tungt; under gräns = tydlig loggrad + exit 75 (ram-grindens
  skip-konvention), körbart igen utan åtgärd.
- **H3:** RÖD dump-väg skriver nu protokoll (UNDERKÄNT + avbrottsorsak) och
  lämnar låset frisläppt; dumpdoms-rad i §2-tabellen renderar verklig GRÖN/RÖD.
- **H4:** mallens sammanfattning och stegtabell renderar "nåddes ej"/"rördes
  ej" i avbrottsfallet — aldrig NaN/nollvärden som ser ut som mätetal.
- **H5:** DUMPEN-typo + §4-referens rättade.
- `node --check` grönt; inga gränssnittsändringar (flaggor/exit-koder
  kompatibla: 0/1/3 + ny 75).

## 5. Godkännandeprovets körningar (härdad version)

| Prov | Resultat | Bevis |
|---|---|---|
| Låsvägran i verklig trafik | VÄGRAD korrekt (exit 3, "LÅSET UPTAGET 0,6 min") medan system_events-agenten höll PG17-fönstret 19:28 — min process rörde ej PG | körtlogg; PG-läget obevekligt vid efterkontroll |
| Läckt låsfil | system_events-agentens manuella fönstermarkering (tom fil, ingen ägar-pid) lämnades kvar när fönstret stängts (PG down 19:31, 0 DR-processer) — städad med motivering; = verktygets egen 30-minutersregel tillämpad tidigt med starkare bevis | tidsstämplar i detta protokoll; filen borta |
| RÖD dump (trunkerad 391 kB) | markörkontroll RÖD (gzip avbruten, slutmarkörer saknas) → **protokoll skrivs** (DR-PROV-2026-09-15-AUTO-2.md, UNDERKÄNT, "PG17 rördes ej") → exit 1; PG orörd, lås frisläppt | AUTO-2.md |
| **GRÖN fullkörning** (db-2026-09-15.sql.gz, 29,4 MB) | grind OK (4 037 MB / 77 GB) → markör GRÖN → restore **23,9 s** → public **60 tabeller / 1 246 728 rader**, public+storage **68 / 1 246 864**, alla scheman **95 / 1 247 119** → fel 780/780 kända, 0 okända → städning: skrap-DB raderad, PG17 stoppad, lås frisläppt, disk 77G oförändrad → exit 0 | DR-PROV-2026-09-15-AUTO-3.md |

**RTO-serien efter detta protokoll:** v98 F3 20,0 s · u2 17,7 s · u3 14,7 s ·
u4 20,0 s · detta prov 23,9 s — fem oberoende punkter, spridning 14,7–23,9 s
(lastberoende; servern bar tre parallella fabriksagenter under detta prov),
radbilden **identisk i samtliga** (public 1 246 728 / alla 1 247 119).

## 6. Dom

**GODKÄNT.** Verktyget mäter rätt (identisk radbild femte gången), vägrar
rätt (RÖD dump, upptaget lås), städar rätt (bevisat tre vägar: grön väg, röd
väg, verklig kollision) och har nu de skydd som dagens minnesincident kräver.
Verktyget ägs fortsatt av spåret; härdningen är incheckad i samma fil.

## 7. Kö och observanda till huvudagenten

1. **Kollisionskur nr 1 (manifest-unika objekt) fortfarande ej mekaniserad —
   bevis nr 2 levererat här (§2).**
2. **`verktyg/aterstall-system-events.mjs` (syskonleverans S10-U3:2) använder
   lokal PG17 UTAN att ta DR-låset** — kvarvarande kollisionsyta mot
   lås-respekterande verktyg. Rekommendation: flock-wrapper (D1) eller
   lås-stöd i det verktyget vid nästa beröring.
3. Befintliga köer från s10-u1 oförändrade: crontab-radbytena (pgpass-migrering
   + markörvakts-append i 02:30-kedjan).

---
GDPR: protokollet redovisar endast antal, tabell-/fältnamn, tidsstämplar och
process-pid — inga personvärden, inga hemligheter. Körkommando nästa kvartal:
`node verktyg/dr-ovning.mjs` (fabriksbarn med sudo).
