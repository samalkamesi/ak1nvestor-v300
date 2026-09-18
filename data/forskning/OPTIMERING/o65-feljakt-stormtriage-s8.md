# o65 — FELJAKT-BACKLOGGENS SANNA LÄGE: per-salv-bevisad stormtriage (spår 8, s8-u2)

**Manifest:** auto-s8-1789707900149 · **Datum:** 2026-09-18 · **Domare:** s8-u2 (fabrik)
**Klaim:** data/vakten/auto-s8-1789707900149-u2-ansprak.md
**Nummernot:** protokollet skrevs först som o64 men syskonen s8-u1 (a20f15fa,
o64-godkannande-hardningstak) OCH s8-u3 (40a512be, SSR-livssonden "protokollnummer
o64") tog båda o64 i samma manifestfönster — dubbelkollision; detta protokoll = o65,
mina 239 ledger-rader rättades FÖRE commit (ocommittat eget material). Läxa åt
fabriksfamiljen: protokollnummer tas med ls-koll I skrivögonblicket, racet är mot
syskonen i samma fönster — inte mot gårdagens läge.

## §0 Sammanfattning — sifferkvadraten

| | FÖRE | EFTER |
|---|---|---|
| Totalt fynd i loggen | 245 | 245 |
| Bedömda | 4 | **245** |
| ÖPPNA ÄKTA | 241 | **0** |
| — varav HÖG/KRITISK | 97 | **0** |
| Änkel-bedömningar | 0 | 0 |

Dom-fördelning EFTER (per fyndrad): rotkurad 151 · transient-design 91 ·
falskt-pos 2 · pagaende 1. Mina 239 bedömningsrader (148 rotkurad +
91 transient-design) täcker 241 fyndrader — två nycklar täcker två rader
var (se §5 F1).

## §1 Objekt + duplikatkontroll

- **o25 §5 bokade** uttryckligen: "storm-klassificering transient-design med
  per-salv-bevis (framtida våg)" — worklog-sökning "stormar" = 0 träffar =
  bokningen var olevererad. Denna våg infrier den.
- **Föräldralös leverans räddad:** verktyg/feljakt-stormar.mjs (12 352 B) +
  verktyg/testa-feljakt-stormar.mjs fanns på disk (mtime 2026-09-16 19:20)
  men var ALDRIG committade (git ls-files tom) och aldrig workloggade —
  föregångarvågen dog före commit. Verifierade före antagande:
  node --check ×2 GRÖN + svit 20/20 PASS (kluster 4, kontext 2, familj 4,
  validering 5, bekrafta 5). Räddningsprecedens: o43 (färdigställande med
  fallande test) — här var testerna redan gröna, verktyget orörda av mig.
- **Ej duplikat mot syskon:** s8-u1/s8-u3 i manifestet hade inga anspråk
  vid mitt klaim (05:1xZ); spårets tidigare leveranser (o11/o14/o21/o24/
  o25/o40/o43/o50/o55/o59/o60) berör ej ledgerns tillväxt.

## §2 FÖRE-läge (färskt mätvärde, inte den 1,5 dygn gamla SENASTE-filen)

`node verktyg/feljakt-lage.mjs` 05:1xZ: 245 fynd · 4 bedömda · **241 öppna
(97 HÖG/KRIT)** — F3-api 141 · F5-logg 67 · F6-drift 28 · F2 4 · F1 1.
DokumentERAT pris (o25): pulshjärtat kickar reparationsprompt på varje
HÖG/KRIT < 35 min utan falskfiltrering, och varje rond/grävande våg måste
om-gräva arkivet för att skilja äkta från redan-kurerade klasser.

## §3 Metod — gräv, bevisa, doma (aldrig massmarkera)

1. **Kluster:** stormar-underlaget (färsk körning) grupperade de 241 öppna
   till **69 salvor** (10-min-gap) med maskinell kontext (±15 min) ur fem
   källloggar: 18 kraschvakt-trigg/räddning · 15 ram-/byggfönster ·
   24 agentträd-smutsigt · 6 deploybygg · 5 deployfönster · 1 okänd.
2. **Grävning:** varje familjs rotorsak verifierades mot primärkällor —
   kraschvakt.log (gamla trigg-radernas "omstarter +0"-fingeravtryck;
   nya trappstegs-räddningen 17:34:49→17:36→17:41 09-17), prod-synk.log
   (bygg OOM-dödat 04:23/16:30/17:30 09-16–17, VÄNTAR-RAM-grindar, patch-köns
   dokumenterade kedja 11:27–11:39 09-17), hjartslag.log (WEB-VAKT-omstarter,
   STATUS-FEL 429-era), fyndradernas EGNA bevisfält (den gamla
   svans-scannerns "progress — tyst"-rader = o11 brist 2:s fingeravtryck).
3. **Dom:** generatorn verktyg/_s8u2-feljakt-triage.mjs tillämpar 19
   dokumenterade regler (första träff vinner) — **rad utan regel ⇒ scriptet
   vägrar exit 1** (0 okända vid körning; den "okända" salven 09-17 15:13
   grävdes manuellt = deploy-omstartsfönster, regel f5-hjarta-0917).
4. **Grind:** stormarnas `--bekrafta` (allt-eller-inget) validerade varje
   rad mot ÖPPNA fynd + ledger-nycklar: torrsim 239 GRÖNA 0 FROSTNA ⇒ skarp
   append med domdTs 2026-09-18T05:20:25.704Z.

## §4 Rotorsaksfamiljerna → dom (med källprotokoll)

| Familj (salvor) | Dom | Rot-källa |
|---|---|---|
| 09-15-meltdown: F2 errored/stopping + F3/F6 osvarar (salv 1/9/10/11) | rotkurad | o24 (kraschvakten omskriven, 4 rotorsaker, svit 19/19) + v146 (fabrik max 3 + RAM-vakt) |
| Gamla svans-scannerns F5-rader 09-15 (20 rader, "i svansen") | rotkurad | o11 (positionsminne + exakt-en-gång; bevisfält bar svansens slut) |
| 429-ratebegränsning 09-15 | rotkurad | v146 (parallellism 12 → omgångar om 3) |
| Stormnatten 09-16 03:5x–04:3x: RAM HÖG 134/109/125 + F3/F6 04:27 | rotkurad | v146 + o24 §5 (bygg OOM-dödat 04:23 dokumenterat) |
| tsc 5 fel 09-15 20:27 (F1) | rotkurad | r39-vaccinet i feljagaren.mjs (TS2688 under npm ci) |
| F2 stopped 08:17 09-16 | rotkurad | o24 rotorsaka 2 (stopp utan deploylås-koll) |
| /session-timeout 09:13 09-16 | rotkurad | rond 50-omtestet (utlöst av just detta fynd) |
| Agentträd o11-klassen, 12 rader pre-o40 | rotkurad | o40 (.gitattributes union + kloningen läkt) |
| Agentträd o40-recidiven, 6 rader 00:10–02:20 09-17 | rotkurad | o43 (union-försvaret, svit 34/34) |
| Patch-kön + 502 + byggMISS 11:29–18:50 09-17 (7 rader) | rotkurad | o50 + o60 (slutleverans: next 16.3.5 i drift, prod 200, kön tom) |
| KRASCHLOOP-rader pre-09-17 | rotkurad | o24 (falska trigg: omstarter +0) |
| Hjärt-FEL-omstarter ≤ 09-16 | rotkurad | v146-stormnätters klass |
| Deploybygg-MEDEL "(deploybygg pågår)" (66 rader) | transient-design | rond 44 (app väntat nere under deploylås) |
| RAM-MEDEL 800-tröskeln (16 rader) | transient-design | VÄNTAR-RAM + fabrik-RAM-vakt = designat fönster |
| Hjärt-FEL-omstarter ≥ 09-17 (4 rader) | transient-design | deploy-/omstartsfönster (DEPLOYAD samma minut) |
| Ny kraschvaktens räddning 17:36 09-17 | transient-design | o24-beslutstabellen (PM2-restart FÖRST 17:34:49, bygg först därefter) |
| o43:s vägran "ocommittade ändringar skyddas" (8 rader 09-17/18) | transient-design | o43-kontraktet: synken skyddar ytan korrekt; läkt 03:20 09-18 |

## §5 FYND under vågen

- **F1 — NYCKELKOLLISION I LEDGERN (verktygsfynd, bokas åt verktygsägaren):**
  två fyndrader kan dela EXAKT nyckeln (ts, spår, fynd) när F5:s generiska
  fyndtext ("felmönster på ny rad") matchar två olika loggrader i samma
  millisekunds-skanning — bevisat ×2 (11:43:04.406Z + 18:43:02.674Z 09-17,
  bevisfältens olika matchrader). Konsekvenser: lage-Set:et täcker BÅDA
  raderna med en bedömning (korrekt här — samma klass), men stormar-grinden
  vägrar dublettnycklar i bedömningsfilen (rätt — tvingade fram upptäckten).
  Framtida härdning (lage/stormar-ägarens beslut): bevis-hash i
  matchnyckeln. Generatorn hanterar klassen: dedupe per nyckel + slogs
  ihop-bevis med "[2 fyndrader delar nyckeln]"-markering; KOLLISION MED
  OLIKA dom ⇒ vägran (fanns ej: båda var rotkurad).
- **F2 — stormar-leveransen var DÖD PÅ DISK:** fullständigt verktyg + svit
  20/20 aldrig committade — fabrikens utdata-loggar från 09-16 visar ingen
  leveransrad för den. Hade den förlorats hade o25-bokningen krävt
  ombygge. Räddad orörd i denna våg.
- **F3 — den "okända" salven var känd:** 09-17 15:13 = hjärtats omstartsrad
  vid deploy 15:01:36 (DEPLOYAD samma minut) — heuristiken fångade den ej
  (ingen VÄNTAR-RAM/NY KOD i fönstret), manuellt grävd före dom.

## §6 Bokningar (vidarebefordras, ej mina ytor)

1. **mal-hjartslag-falskfiltrering** (o25 §5, kvarstår): hjärtat bör läsa
   ledgern/läge före reparationskick — huvudagentens yta.
2. **Ronder läser lage-verktyget** (o25 §5, kvarstår): råa grep mot
   feljakt-fynd.jsonl ska ersättas av `node verktyg/feljakt-lage.mjs`.
3. **Nyckelhärdning** (§5 F1): bevis-hash i ledgerns matchnyckel —
   lage/stormar-ägarens beslut (kontraktsändring i ledger-formatet).
4. **R3-disciplinen** (o40/o43 §6, kvarstår): agenters push-direct —
   huvudagentens yta; klassen SYNK MISSLYCKADES är hanterad men triggroningen
   lever kvar som bokning.

## §7 KVD

- tsc 0 via projektbinär `node node_modules/typescript/bin/tsc --noEmit`
  (src/ orörd av denna våg — beviskörs ändå, resultat i worklog-raden).
- ALDRIG bygge/installation (prod-synken äger); ALDRIG --no-verify;
  pre-commit-grindens tsc passerad vid commit.
- R2 orörd (inga priser/tier/publicering); data/blogg/ orörd.
- **feljakt-fynd.jsonl orörd** (feljägarens append-only ägodata — "upptäckaren
  ej domaren", o25); ledgern utökad ENBART via stormarnas validerande
  --bekrafta-grind.
- Verktyg: node --check ×3 GRÖN (stormar + test + generator); stormar-svit
  20/20 PASS i levererat skick.

## §8 Leverans

verktyg/feljakt-stormar.mjs + verktyg/testa-feljakt-stormar.mjs (räddade,
orörda) · verktyg/_s8u2-feljakt-triage.mjs (generatorn, dokumenterar
regelverket) · data/vakten/feljakt-bedomningar.jsonl (+239 rader) ·
data/forskning/OPTIMERING/o65-feljakt-stormtriage-s8.md · anspråk +
worklog-rad. Runtime-artefakterna feljakt-{lage,stormar}-SENASTE.json är
overkade enligt konvention (läses från disk av konsumenter).
