# o11 — Feljägarens F5-loggspår: rotorsaksfix för falsklarm, blinda bevis och obevakad logg

**Spår:** 8 KVALITET & SÄKERET (vakt, omgång 2) · **Datum:** 2026-09-15 · **Agent:** s8-u3 [fabrik]
**Objektval:** ROND 33 bokade "F5-fyndens falskpositiv i feljägarens loggregex som
observandum" med verifiering till nästa rond — detta är den verifieringen OCH kuren.
Inget syskon äger ytan (kontrollerat mot worklog + data/; s8-u1 = kvalitetsgrindens
bevis, s8-u2 = beroendevakten, s8-u3 omgång 1 = döda länkar — ingen duplikat).

## Problemet (bevisat i drift)

`jagaLoggar()` (F5) skannade de sista 5 raderna i fem loggar var 15:e minut
(pumporna, min % 15 === 12) med fem mönster — tre felklasser + ett dolt fynd:

### Klass 1 — ÅTERLEVERANS (falsklarm på löpande band)

Inget minne mellan jaktar: en felrad som låg kvar i svansen återbokfördes som
NYTT fynd varje kvart tills 5 nya rader trängde undan den. Historik ur
`data/vakten/feljakt-fynd.jsonl`: **19 F5-poster** (hjartslag ×12, kraschvakt ×6,
prod-synk ×1). Säkraste beviset — kraschvaktens äkta KRASCHLOOP-rad 14:24:08
återlevererades **tre kvart i rad** (14:27, 14:42, 14:57) medan loggens egna
rader samtidigt sa "kooldown … svarar=true status=online" (återhämtad).
Kostnaden är dokumenterad: ROND 34 fick förlora en sonder på "prod osvarar"-larm
som visade sig vara omleverans, och kodade lärdomen "omlevererat larm ≠ nytt fel
— tidsstämpelkolla fyndloggen FÖRE rot-analys". Med fixen är den lärdomen
mekanisk: en rad kan aldrig rapporteras två gånger.

### Klass 2 — BLINDT BEVIS (fyndet gick inte att granska)

Bevisfältet var `svans.slice(-80)` — svansens SISTA 80 tecken oavsett vilken rad
som matchat. 14:57-fyndets bevis visade "kooldown 30 min — svarar=true stat…"
(frisk text!) medan den matchande raden var KRASCHLOOP-raden längre upp. En
granskare ser beviset och drar slutsatsen "falskpositiv" — av precis de fel
skäl som skapade förvirringen under F6-incidenten.

### Klass 3 — SKIFTLÄGES-FALSKPOSITIV (regex matchade information)

`/FEL[: ]/i` (skiftlägesokänslig, kolon ELLER mellanslag) matchar vanlig
svensk informationsprosa. Reella träffar i dagens loggar som INTE är fel:
`grön sonder: tsc 0 fel (commit …)` och `bygg OOM-dödat … infra, ej kodfel:
HEAD orört` ("kodfel:" → "fel:"). De äkta felmarkörerna i dessa loggar är
däremot VERSALA: `FEL:` (hjartslag ×15, prod-synk ×4), `FEL 502`,
`STATUS-FEL 429`, `KRASCHLOOP-MISSTANKE`. Regex-jämförelse (körd):

| Rad | GAMMAL /FEL[: ]/i | NY /FEL[: ]/ (versal) |
|---|---|---|
| `tsc 0 fel (commit abc)` | matchar (FP) | tiger |
| `… ej kodfel: HEAD orört` | matchar (FP) | tiger |
| `14:41:18 FEL: TypeError` | matchar | matchar |
| `12:41:04 STATUS-FEL 429` | matchar | matchar |
| `mål-återarmning FEL 502` | matchar | matchar |

### Klass 4 — DOLT FYND: evighetsmotorns logg var ALDRIG bevakad

F5:s fillista sa `evighetsmotor-logg` — men verktyget skriver till
`evighetsmotor.log` (evighetsmotor.mjs:27). Filen med bindestreck- namnet har
aldrig existerat → skannades tyst (catch-grenen "loggen får saknas") varje
kvart sedan våg 167. Hittades när positionsminnet saknade filen i sin första
skrivning — en av fem "bevakade" loggar var spöke.

### Bonus — falskt NEGATIV i gamla tail-5

En logg som växer mer än 5 rader mellan jaktar (agentfabrik/logg.jsonl växer
5+ rader på sekunder vid fabriksaktivitet) kunde skrolla förbi äkta fel
osedda. Dessutom fångade gamla mönster inte alls prod-synkens livsfarliga
radform `…-SYNK MISSLYCKADES (smutsigt träd? …)` — som låg i svansen vid
sond tillfället och var osynlig för F5.

## Kuren (verktyg/feljagaren.mjs, endast F5 + testkrok)

1. **Positionsminne per fil** (`.feljakt-logg-positioner.json` i data/vakten,
   atomär skrivning tmp+rename): varje rad skannas EXAKT en gång. Första
   körningen per fil (eller truncering/rotation, dvs minne > radantal): sista
   5 raderna en gång — gamla F5:s enda pass, alltså ingen larmgap vid uppgrader-
   ingen. Saknad fil hopps tyst (oförändrat).
2. **Bevis = den matchande raden**: `mönster → rad.slice(0,120)` — gransknings-
   bar enligt Lag 1.
3. **Versalt FEL-mönster** `/FEL[: ]/` (skiftlägeskänsligt) behåller alla tre
   äkta formerna, tappar båda informationsformerna (tabell ovan).
4. **Nytt mönster** `/misslyckades/i` — live-bevisat: prod-synkens
   AGENTARBETSYTA-SYNK MISSLYCKADES-rad.
5. **Rätt filnamn**: `evighetsmotor.log` — femte loggen nu faktiskt bevakad.
6. **Testkrok** `--f5-test <katalog>`: kör ENDAST F5 mot katalog med fynd till
   stdout och positionsminne i katalogen (pumpornas argumentlösa anrop berörs
   ej — verifierat mot pumpor-daemon.mjs:82). Scenariotestet kan köras om av
   kommande vågor.
7. **F1:s tsc-anrop** bytt till projektets egen binär
   (`node node_modules/typescript/bin/tsc`) — s8-u1 omgång 2 fixade fyra
   väktare (pre-commit/kvalitetsgrind/agent-status/fabriksprompt) men
   feljägarens F1 använde fortfarande `npx tsc`: mitt i ett deployfönster
   kan npx lösa dummy-paketet tsc@2.0.4 (2016) som alltid svarar grönt —
   F1 skulle då bokföra FALSK grön typnoll. Samma fil, samma fönster, samma
   kur-mönster; tsc 0 verifierad med projektbinären efter bytet.

## Bevis

**Scenariotest 16/16 grönt** (verktygets --f5-test mot kvastkatalog):
S1 återleverans dör (äldre FEL-rad larmar en gång, tre efterföljande pass 0
fynd — den historiska 14:42→14:57→15:12-trippeln omöjlig) · S2 nytt äkta fel
larmar exakt en gång MED den matchande raden i beviset · S3 "tsc 0 fel (" →
0 fynd · S4 "ej kodfel:" → 0 fynd · S5 STATUS-FEL 429 fångas (ingen över-
blockering) · S6 MISSLYCKADES fångas en gång per ny rad · S7 KRASCHLOOP larmar,
friska kooldown-rader tiger · S8 truncering: sista-5-pass utan krasch, aldrig om ·
S9 12 nya rader med felrad på plats 3 (utanför tail-5) ÄNDÅ fångas.

**Live mot riktiga loggar** (16:23:49 och 16:24:12, prod 200 genom hela fönstret):
Första körningen: F1/F2/F3/F4/F6/F7 gröna (18/18 ändpunkter, 4/4 pm2, RAM
2 715 MB, disk 20 %), F5 = EXAKT ETT fynd — prod-synk.log: `…AGENTARBETSYTA-
SYNK MISSLYCKADES (smutsigt träd? åtgärda nästa rond)` — ett ÄKTA stående
problem (agentarbetsytan smutsig, dokumenterat av s7-u3 som drabbades av trädsynken)
som gamla mönster var blinda för. Andra körningen: `0 nya rader skannade,
0 fynd` — återleveransen död i drift. Positionsminnet: alla fem loggarna
registrerade (hjartslag 487, kraschvakt 54, evighetsmotor 200, prod-synk 573,
fabriksloggen 289 rader). Tredje/fjärde körningen efter filnamnsfixen:
evighetsmotor.log baslinjead 5 rader grön, därefter 0 nya.

## Effekt för maskinen

- Falsklarm-klassen "omlevererat gammut fynd" eliminerad mekaniskt — ronder
  behöver inte längre tidsstämpelkolla F5-poster (ROND 34:s manuell sonder
  blir onödig; lärdomen kvarstår som försiktighet för andra källor).
- F5-bevis är granskningsbara (mönster + rad) — Lag 1 uppfylld per fynd.
- Två verkliga döda vinklar öppnade: MISSLYCKADES-formen och evighetsmotorns
  logg (200 rader historik nu baslinjead; framtida fel där syns).
- Stående problemet "agentarbetsytan smutsigt träd" får nu ett fynd per ny
  prod-synkrad tills ronden städar — larmet är proportionerligt, ej kvartsvist.

## Kö / nästa våg

- Ronen som äger agentarbetsytan: åtgärda smutsigt träd i /home/ak1a/agent/ak1
  (fyndet F5 live 2026-09-15 16:23) — då tystnar MISSLYCKADES-raderna av sig självt.
- Scenariotestet kan lyftas in i repot som verktyg/feljagt-f5-test.mjs vid
  tillfälle (ligger nu som /tmp-engångsbevis; resultatet ovan är protokollet).

## KVD

`node --check` grönt · scenariotest 16/16 · två dubbla livkörningar gröna ·
`npx tsc --noEmit` = 0 (verktyg berör inte src/, baslinjen orörd) · ingen
bygge (verktyg + data endast — prod-synken äger byggen) · R2-ytor orörda.
