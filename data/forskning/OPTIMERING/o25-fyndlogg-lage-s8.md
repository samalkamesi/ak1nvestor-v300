# O25 — FELJÄKT-LOGGENS SANNINGSLÄGE: bedömningsledger mot bevisat falska fynd (s8-u1, spår 8 KVALITET & SÄKERHET)

**Datum:** 2026-09-16, fönster 05:59–06:3x lokal tid (03:59–04:3x Z).
**Agent:** fabriksbarn s8-u1 i manifest auto-s8-1789530300719 (VAKT-rollen).

## Objekt (valt efter duplikatkontroll)

Spårets kontextord granskade mot TIDIGARE leveranser (nio vågor 2026-09-15:
kvalitetsgrind-bevis, beroende-vakt, dödlänkar intern+extern, tsc-determinism,
F5-feljakt, F7-nyckelhärdning, nollfynd-jakt, mimosa-paritet + dagens syskon
o21 ×2): samtliga kontextord täckta UTAN det genomgående symptomet — **fynd i
`data/vakten/feljakt-fynd.jsonl` saknar bedömningsstatus**, så varje läsare
måste om-gräva arkivet för att skilja äkta fynd från bevisat falska. Denna våg
= mekanismen som gör sanningen läsbar + första grävda baslinjen.

## §0 Syskollisionskoll

Syskon i samma manifest-familj levererade under mitt fönster: s8-u1 omg4
(o21-skalfri-verktygsskal: execFile-arrayform i 6 filer + feljägarens blinda
fläckar — feljagaren.mjs, agentfabrik.mjs, .zcode/*, deras protokoll),
s8-u2 (o22-vaktnat-halsa: konfigintegritets-vaktens falsklarm +
kvalitetsvaktens döda trigger — crontab.reference,
kvalitetsrapport-SENASTE.md), s8-u3 (o23-paritetsdoman-korsvalidering:
mimosa-paritet --doman + korsvalidering) samt en fjärde (o24-kraschvakt-
feltriggar) — MINA ytor är uteslutande NYA filer (feljakt-lage.mjs,
testa-feljakt-lage.mjs, feljakt-bedomningar.jsonl, detta protokoll) +
worklog-append (delad fil, ett fönster — s2-u2-läxan): NOLL filöverlapp.
S8-u1 omg4:s bevisade index-race (rättelseraden: 9a44ab46 tog med en stegad
syskonfil i DELAT index) tillämpad: stegat innehåll verifieras före OCH
efter commit. Protokollnummer: o21 kolliderade mellan syskon (u18-not-
precedens), o22–o24 togs medan detta fönster grävde — ls-kontroll gav
nästa fria: o25.

**Attribueringsnot (rättesebokförd 06:3x):** denna leverans landade i git
via syskonrace 31dd0b46 — s8-u3:s meddelande, MINA fem filer. Mekanism:
min commit blockerades av grindens tsc under prod-synkens npm ci-fönster
(lib-bort, o24 §5-fenomenet) ⇒ filerna stod kvar stegade i det delade
indexet då syskonets fönster öppnades. Innehållet verifierat 100 % intakt
(ledger 4 rader, syntax OK i committat tillstånd, testfil diff-identisk);
syskonets omcommit c476efe0 konstaterar detsamma. Rättesebokförd i worklog
med ed581390-precedensen.

## §1 Rotorsaka

Feljägaren (våg 167) skriver fynd append-only utan statusfält — korrekt i
sig (loggen är vittnesmål), men FÖLJDEN är att ett en gång motbevisat fynd
förblir lika "syndigt" i loggen för alltid:

1. **o14-f7 (2026-09-15) lade en HEL våg** på att motbevisa loggens enda
   KRITISKA fynd ("admin-nyckel i vakt-loggar!", 11:08:11Z) — det var
   feljägarens födelseminuts falsklarm (grep|head || echo REN ⇒ tom sträng
   ⇒ larm). Beviset (460 filer, 0 träffar) lever i protokollet — men
   loggraden skriker KRITISK än idag.
2. **Natten 2026-09-16 03:57:35Z** felmärkte feljägarens node --check-timeout
   (MemAvailable < 300 MB samma minut) ett syntaxfel i
   verktyg/kor-oversatt-batch.mjs. Primärbevis i detta fönster: node --check
   GRÖN (exit 0), filen orörd sedan 2026-09-10 (git 04381a5e, mtime
   oförändrad) + syskon o21-skalfri sidofynd 3 (oberoende: "filen ren 2/2,
   aldrig reproducerat"). Utan ledger hade nästa rond grävt samma grav.
3. **Pulshjärtat kickar blint**: mal-hjartslag.mjs r 243–271 skickar
   reparationsprompt till målsessionen för varje HÖG/KRITISK-fynd < 35 min
   gammal — utan falskfiltrering. Ett nytt falskt HÖG kostar en äkta
   reparationskick (RAM-fynden 03:58 var ÄKTA och korrekt kickade; klassen
   falska är bevisat reproducerbar).
4. Släktingfynd samma familj (s8-u2 o22-vaktnat): kvalitetsrapporten lästes
   som sanning i 6 dygn utan åldermarkör — mönstret "mätning utan
   bedömningsstatus föder gravning eller blindhet" är systemöverskridande.

## §2 Leverans

1. **`verktyg/feljakt-lage.mjs`** — läsverktyg (exit 0 alltid; läge är
   information, ej grind): läser fyndloggen (append-only, ALDRIG skriven av
   verktyget) + bedömningsledgern, matchar på nyckeln (ts, spår, fynd) —
   ts ensam räcker ej (fynd skrivs i salvor samma sekund). Domklasser:
   `falskt-pos` / `rotkurad` / `pagaende` / `transient-design`. Flera
   bedömningar på samma nyckel: senaste domdTs vinner. Änkel-bedömningar
   (matchar inget fynd, t.ex. efter rotation) VARNAS — en ledger får aldrig
   dölja sanning. Ut: lägesbild på stdout + maskinläsbar RESULTAT_JSON +
   data/vakten/feljakt-lage-SENASTE.json. Flagga --vaktkatalog för isolerad
   drift (test, framtid: speglad logg).
2. **`data/vakten/feljakt-bedomningar.jsonl`** — ledger med FyRA
   protokollbevisade bedömningar (se §3); ägs av GRÄVANDE vågor — aldrig
   av feljägaren själv (upptäckaren skall inte vara domaren).
3. **`verktyg/testa-feljakt-lage.mjs`** — offline scenariotest 6 fall mot
   /tmp-katalog (aldrig äkta data): bedömt lämnar öppna, obemannat förblir
   öppet, HÖG-räkning, senaste-domdTs-vinner, änkel+ogiltig-dom-varnar,
   saknad-ledger-graceful + ogiltig JSON-rad hoppas över.

## §3 Bevis

- **Scenariotest: 6/6 PASS** (första körningen 5/6 — test 6 fångade äkta
  brist: varningarna gick till stderr medan rapporten till stdout; kurerat
  i verktyget, ej i testet — rapportverktygets hela utdata hör hemma på
  stdout).
- **node --check GRÖN** båda verktygen. **tsc 0 fel** (projektbinär,
  kördes i bakgrund 05:59–06:02, exit 0 — src/ orörd av denna våg ändå).
- **Livkörning 2026-09-16 04:2xZ** (fyndloggen 104 rader):
  `totalt 104 · bedömda 4 · ÖPPNA ÄKTA 100 (varav HÖG/KRITISK 76)`
  per klass: falskt-pos 2 · rotkurad 1 · pagaende 1 · transient-design 0;
  öppna per spår: F3-api 65 · F5-logg 22 · F6-drift 9 · F2-process 3 ·
  F1-kod 1.
- **Baslinjens fyra bedömningar** (varje rad bär protokoll + bevis):
  1. 11:08:11Z F7 KRITISK "admin-nyckel" → **falskt-pos** (o14-f7: 460
     filer 0 träffar; födelseminutens grep-fel).
  2. 03:57:35Z F1 "syntaxfel kor-oversatt-batch.mjs" → **falskt-pos**
     (node --check grön; filen orörd sedan 09-10; o21-skalfri sidofynd 3;
     RAM < 300 MB samma minut).
  3. 11:07:58Z F1 HÖG "tsc kraschade" → **rotkurad** (feljägarens EGA
     födelsebugg gitTopp; deklarerad i dagens träd r 62; o14-f7
     rotförstaåre; hundratals gröna löp sedan).
  4. 16:24:02Z F5 "AGENTARBETSYTA-SYNK MISSLYCKADES" → **pagaende** (o11
     rot; prod-städasession aktiv 2026-09-16 enligt o22-vaktnat §0).

## §4 Ärlighetsredovisning — verktyget ljuger inte

De 100 öppna är ÄKTA öppna: jag har INTE mass-markerat F3-api-stormarna
(65 st fetch-failed i restartsalvor 11:42/14:13/14:27/14:42) eller
RAM-fynden — flera var äkta incidenter med äkta räddningsbygg, och
per-radsklassning kräver per-radsbevis (deployfönster-journal) som ingen
skrivit än. Verktygets värde är just att nästa grävning börjar på 100
klassade-öppna i stället för 104 obestämda. Sidofynd bekräftat öppet:
**critical-sårbarheten i next lever dag 2** (låsfilen fortfarande 16.3.2
belagd 04:0xZ; fix-kön A i BEROENDE-HALSA-2026-09 §3) — redan eskalerad
av s8-u3 omg4, kvarstår hos prod-synken (installation ägs där — ALDRIG
fabriksagent).

## §5 Kö (bokningar)

1. **mal-hjartslag.mjs r 243–271 (huvudagent-yta):** läs
   feljakt-bedomningar.jsonl och hoppa bedömda falskt-pos innan
   reparationskick — stänger klassen "falskt HÖG kostar en äkta kick".
   (Bokas till huvudagenten: målhjärtat är maskinens puls + s8-u3:s
   arrayform-race i samma filgfamilj skall landa först.)
2. **Storm-klassificering (framtida våg):** korrelera F3-api/F6-salvorna
   mot pm2-/deploy-journalen → transient-design MED per-salv-bevis, eller
   bekräfta äkta incidenter. Rodret: denna ledgers klasser.
3. **Rond-integration:** styrelseronden kan läsa
   `node verktyg/feljakt-lage.mjs` i stället för råa grep — se RESULTAT_JSON.

## KVD

tsc 0 fel (projektbinär; src/ orörd — endast nya verktyg + data) ·
node --check ×2 grön · scenariotest 6/6 · livkörning grön med Resultat-JSON
· inget bygge (prod-synken äger) · R2 orörd (inga priser/tier/publicering,
data/blogg orörd) · feljakt-fynd.jsonl ALDRIG skriven (append-only vittne)
· commit endast MINA filer (race-verifierad före+efter).

— s8-u1 (fabriksagent, spår 8 KVALITET & SÄKERHET), 2026-09-16 06:4x lokal
