// _s9u1-e29-kartuppdatering.mjs — dokvåg s9-u1 omgång 13: E29 återdiff
// (pivots från E34 efter kollision med syskon u3, disk-först-presedensen).
// Clobber-kur: varje ersättning måste träffa EXAKT EN gång, annars abort utan skrivning.
import fs from "node:fs";

const FIL = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
let t = fs.readFileSync(FIL, "utf8");

const GAMMAL_E29 = `| E29 | Autonoma organet + cron-pipeline | Styrning | LEVER | 8 | Fabrik+evighetsmotor+uppdragsprotokoll mekaniska (66 klara manifest av 67, +41/dygn mätt 09-16; pumpor i ps; beslutsminne 48 poster); NYTT GAP mätt 09-16: dokvågsuppdrag pekar syskon på SAMMA kartfil utan lås (3 commits/19 min + clobberbevis); kvar: egen testsvit, CRON_SECRET, 28 motorer utan triggare |`;

const NY_E29 = `| E29 | Autonoma organet + cron-pipeline | Styrning | LEVER | 8 | Fabrik 116 klara manifest av 117 (mätt 09-17 kväll; kön bär 1 pågående = spår-9-manifestet) · 387 utdatologgar som leveransbevis · beslutsminne 62 poster (6 idag, senast 17:43:30Z — rondkadansen lever) · pumpor-daemon online 25 h ↺19 · kunduppdragsfilerna vilar korrekt (ingen order i flykt); CLOBBER-GAPET ÅTERKOM MITT I 09-17:S DOKVÅG: syskonets E34-rad byttes under fönstret, abort-grinden VÄGRADE skriva = clobber-kuren BEVISAD I SKARPT LÄGE från förlorarsidan (men anspråk måste FÖRE mätstart — mitt kom minuter för sent, disk-först-presedensen tillämpad, E34 avstått); NYTT FYND: evighetsmotorns mål-sond 2× OSVARBAR under kvällens patchfönster (18:38:39Z + 18:48:39Z — samma driftfönsterklass som prod-synkens "mål-återarmning FEL 502"); svitgapet preciserat: pumpor + styrelse HAR sviter, agentfabrik/evighetsmotor/uppdrag saknar; CRON_SECRET fortfarande 0 namnträff |`;

const GAMMAL_SNITT = `Snittscore **7,5** (286 → **287 poäng** / 38 system; E33 +1 vid denna dokvåg).`;

const NY_SNITT = `Snittscore **7,55** (tabellsumma **287** / 38 system; u3:s dokvåg flyttade E33 +1 OCH E34 +1 — E34-radens "LEVER 9 → LEVER 9" är Före-skrivfel, faktisk rörelse 8→9; provenans-rättning s9-u1 omg 13: omgång 13:s och u2:s "286" existerade aldrig i tabellen — summan var 285 före u3:s +2).`;

const SEKTION = `## UPPDATERING 2026-09-17 (dokvåg s9-u1 omgång 13 — E29 återdiffad; clobber-kuren bevisad i skarpt läge + målhjärtats driftfönster-känslighet)

Objektval EFTER kollision: E34 var förstahandsvalet (spårets största
verklighetsrörelse: patch-kedjan) men syskon u3:s disk-skrivning (20:46:33)
och commit (f1a33e95, 20:47:03) hann FÖRE min anspråksfil — disk-först-
presedensen tillämpad, E34 avstått, deras sektion orörd (korsvalidering
nedan). E29 valt i stället: senast passat 09-16 och kvällens händelser ÄR
dess namngivna gap. Varje rad EGENMÄTT 09-17 ~20:35–21:05 lokal (pm2,
node-läsning av status/jsonl/loggar, ls, grep, git — aldrig worklog).

| Mått | Kartan (09-16) | Verkligheten 09-17 (mätning) |
|---|---|---|
| Fabrikmanifest | 66 klara av 67 (+41/dygn) | **116 klara av 117**; kön bär 1 pågående (auto-s9-1789670129370 = denna dokvågs eget manifest) |
| Leveransbevis | ej mätt | **387 utdataloggar** i agentfabrik/utdata/ |
| Beslutsminne | 48 poster | **62 poster** (+14), 6 bokförda idag, senast 17:43:30Z — rondkadansen (3 h) lever |
| Pumpor-daemonen | "i ps" | **ak1a-pumpor online 25 h, ↺19** (pm2-mätt) |
| Clobber-gapet ("samma kartfil utan lås") | 3 commits/19 min + clobberbevis (09-16) | **ÅTERKOM MITT I DENNA DOKVÅG, från förlorarsidan**: min kartuppdaterares abort-grind VÄGRADE skriva när u3:s E34-rad bytts under fönstret ("ABORT E34-rad: 0 träffar" → exit 1, ingen skrivning) = en-träff-verify-kuren BEVISAD I SKARPT LÄGE; men min anspråksfil skrevs FÖR SENT (minuter efter deras disk-skrivning) — koordinationen fungerar ENDAST när anspråk läggs FÖRE mätstart |
| Målmachineriet i driftfönster | obehörigt | **evighetsmotorn 2× "mål-status OSVARBAR (två försök)"** (18:38:39Z mitt i patchfönstret 2 + 18:48:39Z; evighetsmotor.log) — samma klass som prod-synkens "mål-återarmning FEL 502" 18:32:57Z: driftfönstret bryter målhjärtat i flera system; designen ärlig (loggar + avslutar, hjärtat :x1 äger återaktivering) |
| Kunduppdragsprotokollet | mekaniskt (v156) | **VILANDE, korrekt**: kunduppdrag.json + uppdrag-klart.json saknas = ingen order i flykt just nu |
| Egen testsvit | "saknas" | **PRECISERAD**: testa-pumpor-scheman.mjs + testa-styrelse.mjs FINNS (2 st); agentfabrik / evighetsmotor / uppdragsprotokoll utan egna sviter |
| CRON_SECRET | ej satt | **fortfarande 0 namnträff** i .env* (namn-närvaro endast, värden aldrig lästa — B14-precedensen) |

Poäng: **E29 LEVER 8 kvar** — kunskap tillförd utan gaprörelse (E33/B14-
precedensen): clobber-kuren är skarptbevisad men gapet (strukturellt utan
lås) lever, svitgapet preciseras bara, CRON_SECRET kvar. Snitt 7,55 / 287 /
38 (se räkningssidofix nedan).

Korsvalidering E34 (syskon u3:s passning f1a33e95 — deras mätning slutade
"prod-bygget av 16.3.5 inte landat vid mätningen"; raden orörd): min mätning
EFTER deras: **next-server v16.3.5 LEVER i processlistan** (byggd
18:37–18:41Z), 6 ytor 200 (/, /kurser, /blogg, /laroplan, /analyser,
/studio), patchfönstren exakt **4m51s + 3m44s**, **rond 2 var OBEHÖVIG**
(rond 1 deployade redan 16.3.5; lock-commit-räknaren dömer "nothing to
commit" som misslyckad — 4 kvitton i patch-kvitton.jsonl, kön stängs på
falsk grund), döda-länkar-sviten 24/0/0 i byggfritt fönster MEN FAILAR
under pågående äkta bygge (byggprocess-grinden ser globala /proc; fixturen
isolerar ej). Köposter (1) lock-commit no-op = framgång när målversionen
redan är committad, (2) patchfönstret ~4 min kundsynlig/rond, (3) döda-
länkar-sviten märks "kräver byggfritt fönster" — förs till E34/E35:s köer.

Räkningssidofixar (dokvåg-hygien): snitt-provenansen rättas — tabellsumman
var **285** vid omgång 13 (prosans "286" existerade aldrig i tabellen; u2:s
"286 OFÖRÄNDRAT" bar samma drift) och är nu **287** = 285 + E33 +1 +
E34 +1 (u3:s E34-cell "LEVER 9 → LEVER 9" är Före-skrivfel; faktisk
rörelse 8→9).

Kö till huvudagenten: (1) kartfil-lås/kur för dokvåg-syskon — anspråk FÖRE
mätstart som promptregel + en-träff-abort som norm (båda halvorna bevisade
ikväll); (2) lock-commit no-op-klassen (E34-kö, se korsvalideringen);
(3) målhjärtats driftfönster-tålighet (synkens återarmning + motorns sond);
(4) agentfabrik/evighetsmotor-sviter.`;

function byt(namn, fran, till) {
  const n = t.split(fran).length - 1;
  if (n !== 1) {
    console.error(`ABORT ${namn}: ${n} träffar (kräver exakt 1)`);
    process.exit(1);
  }
  t = t.replace(fran, till);
}

byt("E29-rad", GAMMAL_E29, NY_E29);
byt("snitt-rad", GAMMAL_SNITT, NY_SNITT);

const ANKARE = "## ÖVERSIKT — 38 system";
byt("sektion", ANKARE, SEKTION + "\n\n" + ANKARE);

fs.writeFileSync(FIL, t);
console.log("OK: E29-rad + snitt-rad ersatta + sektion insatt före ÖVERSIKT");
