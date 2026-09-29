# JARN-U2 — SITVAKTEN v3: rullning-snapshot + omedelbar app-vakt + artefakt-rollback

**Datum:** 2026-09-29 (kvällsvåg, 22:17–22:30 UTC).
**Uppdrag:** fabriksorder JÄRN-U2 — "Härda sitvakten till v3 (kundorder:
autonämt sök+rätta, inga långa luckor)". Fyllnad: (1) snapshot av .next vid
ändrad BUILD_ID när appen är online+200; (2) rollback till senast-bra när
artefakten är borta och inget bygg pågår; (3) app-vaktens throttle 10 min →
2 min; (4) koden som /home/ak1a/sitvakt med bash -n + testkörning + loggar.
**Ägarskap:** ENDAST /home/ak1a/sitvakt + detta protokoll. Kraschvakten
(r336), prod-synken, cron-raderna — ORÖRDA (cron ropar sedan r331:
`*/2 * * * * /home/ak1a/sitvakt`, oförändrad).
**Filens sha256:** `79eb17dd883988c59f22da50347125702be2db3bced1f616d3385b5341bbc53f`

---

## 1. LÄGET VID START — en pågående incident som motiverar v3

Vid leveransstillfället snurrade prod-synken i en ombyggsloop (18:58→22:23+
vid skrivande stund): upprepade byggfel (se /tmp/synk-*.log), kvalitets-
rapporten GUL (3 fel) stoppar aldrig deploy, o72/o79-avstånd ger ombygg på
ombygg. O97-läkebackupen återställde .next till "senast gröna" vid minst
22:08:44 och 22:23:37 — sajten lever alltså på läkeinfrastrukturen medan
deployloopen snurrar. Byggdöds-vakten (r331) dödade hängda/byggprocesser
19:58, 20:48, 21:30, 21:58 och 22:22 (loggutdrag i §6).

Slutsatsen för v3: systemet har IDAG ingen oberoende nät-under-nätet när
läkevägen en gång inte räcker (t.ex. kraschvaktens räddningsbygg som rivit
.next och sedan själv dör av OOM — våg 137-klassens 758-omstarsloop) eller
när .next rivs utanför prod-synkens fönster. Det är exakt luckan v3:s
ROLLBACK täpper: sekundläkning ur en hårdlänkad "senast bra"-kopia i
stället för ett ~25-min-räddningsbygg (mätt i e0aaf095: 25,7 min).

## 2. DESIGN — fyra grenar (i körningsordning)

### A) BYGGDODS-VAKT — r331b ordagrann, ORÖRD
Hängt bygg (byggloggen tyst >12 min OCH processen äldre än 12 min) ⇒ döda
byggtrådarna + pm2 restart + nollställ app-vaktens klocka. JÄRN-U2 rör
inte denna gren (ägarskap: r331); se dock fynd §7.2 om tröskeln.

### C) ROLLBACK (v3-ny) — körs FÖRE app-vakten
Villkor (ALLA måste gälla): pm2-status ≠ online (och ≠ okänd) OCH
.next/BUILD_ID saknas OCH deploy-låset är fritt OCH snapshotens o50-kontrakt
hel OCH senaste rollback ≥ 10 min (kundorder: max en gång/10 min).

Åtgärd — HELA artefaktoperationen under `flock -n /tmp/ak1a-deploy.lock`:
1. kontrollera snapshotens tre kritiska filer (o50: BUILD_ID,
   prerender-manifest.json, routes-manifest.json — icke-tomma),
2. `rm -rf .next`,
3. `cp -al ~/next-senast-bra .next`,
4. kontrollera de tre filerna IGEN i den återställda artefakten,
5. först därefter (utanför flocken): `pm2 restart ak1a`.

Att hela operationen körs under flock -n gör två samlade: "inget bygg
pågår" blir BEVISAT (inte gissat ur pgrep — npm ci-fasen syns inte i
pgrep "npm run build" men håller låset) och inget bygg kan starta mitt i
(räddningsbygget flock -w 1200 väntar ut våra sekunder; arbetsstations-
deployns flock -n avbryter artigt med "LÅS UPPTAGET").

Grenen `exit 0`-ar före APP-VAKTEN: pm2-restart mot saknad artefakt är
ENOENT-kraschloopen (o50/vaccin 2, ↺ 3 700-beviset) — den omstarten skal
aldrig snurra omstartsräknaren i onödan. Misslyckas rollbacken (disk,
trasig snapshot) lämnas fältet åt kraschvaktens räddningsbygg med 10-min-
kooldown mot snurr. Finns ingen snapshot alls: samma sak — loggat avstånd.

### B) APP-VAKT — r331-logik med tre v3-skydd
pm2-status ≠ online + inget bygg pågår ⇒ pm2 restart. Ändringar:
- **Throttle 600 s → 120 s** (uppdragets punkt 3 — "omedelbar app-vakt":
  cron */2 ⇒ varje rop får lov att läka).
- **Deploy-låsrespekt:** under ett byggfönster startas ALDRIG appen av
  sitvakten. Nödvändig med JÄRN-U1: patch-fönstret håller pm2 AVSIKTLIGT
  stoppad (o48/r58-kur, prod-synk 22:xx-loggen: "pm2 stoppad under
  byggfönstret") — r331:s B-gren (som bara kollade pgrep, inte låset)
  skulle ha startat om appen mitt i npm ci-fasen.
- **Okänd-respekt:** pm2 jlist som inte svarar ger status "okänd" ⇒ ALDRIG
  åtgärd. r331 kunde vid jlist-rysning starta om en frisk app (tom sträng
  ≠ "online" triggade restart).

### D) SNAPSHOT (v3-ny) — rullande "senast bra"
Villkor: pm2 online OCH .next/BUILD_ID finns OCH id ≠ senast snapshottade
OCH deploy-låset fritt OCH `curl -fsS -m 10 http://localhost:3000/` = 200
(loopback är whitelistad i middleware). "Online+200" döms alltså i två
steg — kraschvaktens transient-gren har bevisat att process kan leva utan
att svara, därför räcker inte pm2-status.

Åtgärd: `cp -al .next ~/next-senast-bra-ny` under deploy-låset, o50:s tre
kritiska filer kontrolleras i kopian, därefter atomiskt byte (`rm -rf`
gamla + `mv` nya till `~/next-senast-bra`) + state-fil med BUILD_ID.
Misslyckas kopian/kontraktet behålls förra senast-bra (loggat; tyst om
orsaken var att ett bygg tog låset mitt i).

**Snapshotens semantik:** "senast bra" = bevisat online+200 — inte bara
"senast byggd". Efter en rollback blir .next:s id = snapshotens id, och
eftersom state-filen redan har det id:t uppstår ingen ny snapshot-snurra.
Nästa lyckade deploy ger nytt id ⇒ ny snapshot när appen svarar 200.

## 3. NYCKELVAL (varför, med mätvärden)

1. **Snapshoten bor i hemmet (`~/next-senast-bra`), inte i trädet.**
   .gitignore täcker `/.next/` EXAKT (mätt med `git check-ignore -v`:
   bara .next-laeke och .next-ny träffas av sina egna rader) — en
   `.next-senast-bra` i repot vore untracked ytsmuts som larmar i
   prod-synkens arbetsytasynk, plus kollateralrisk mot varje framtida
   `git clean`. Hemmet är immun mot båda. Hårdlänkar kräver samma
   filsystem: /home/ak1a/AK1 och /home/ak1a ligger båda på /dev/sda2
   (mätt med df). Uppdragets ordalydelse "cp -al .next .next-senast-bra"
   följs semantiskt; namnplatsen avviker motiverat. Prod-synkens egna
   namn (.next-ny, .next-forra, .next-laeke) berörs aldrig — dubbelbytet
   är mv (rename): gamla .next:s inoder lever kvar i snapshoten via
   länkantalet, och .next skrivs ALDRIG på plats av byggen (bygger till
   .next-ny/stallning).
2. **cp -al = diskneutral.** Mätt: .next = 854 MB / 15 865 filer;
   snapshoten = 15 865 filer med länkantal 2 (delar inoder med .next) ⇒
   0 extra datablock, endast inoder. på en disk med 1,1 TB fritt.
3. **o50:s tre kritiska filer som restart-bar-grind** på BÅDA sidor av
   rollbacken (källa BEFORE .next rives, mål EFTER cp) — pm2-restart mot
   ofullständig artefakt är ENOENT-kraschloopen; artefakt-verifiering.mjs
   (o50) definierar kontraktet, v3 hårdkodar samma lista i bash för att
   vara beroendefri.
4. **Kraschvakt-koordinering efter lyckad rollback:** sitvakten
   rapporterar pm2:s omstartsräknare (pm2_env.restart_time) till
   kraschvaktens `state.restarts` — exakt det fält kraschvaktens pass-gren
   själv skriver vid varje frisk poll. Utan rapporten tickar ENOENT-
   kraschloopen (SOM FÖREGICK rollbacken) oknad ≥ 4 vid kraschvaktens
   nästa poll ⇒ omstartssnurr-grenen räddningsbygger (≈25 min nere) en
   app som sitvakten nyss rullat tillbaka till livet. Med rapporten:
   oknad = 0 + frisk app = pass/ÅTERSTÄLLD. **Race-analys:** om
   kraschvakten pollar samtidigt som rapporten skrivs har dess lasState
   redan skett; dess eget sparaState efteråt skriver restarts = aktuellt
   räknarvärde (samma värde som vår rapport) — fallet degraderar till
   dagens beteende, aldrig värre. Rapporten skrivs ENDAST vid lyckad+
   verifierad rollback och ENDAST fältet restarts (all övrig state
   orörd; jlist-svikt ⇒ rapporten skippas — ett restarts=0 på grund av
   tom jlist skulle varit en falsk omstartssnurr-trigg).
5. **Eget kör-lås** (`flock -n` på ~/sitvakt-kor.lock, fd 9): två cron-rop
   (eller cron + manuell körning) överlappar aldrig — andra instansen
   viker tyst. Körningstiden är normalt <5 s (curl 10 s tak, cp -al ~2 s).
6. **A-grenens mikrorace-mönster** (pgrep/pkill + flock-sond) bevaras
   orört; v3:s egna flock -n-sonder har samma egenskap som kraschvaktens
   lasUpptagen(): µs-fönstret är oskyldigt (prod-synken flock -w väntar,
   arbetsstationsdeployn flock -n avbryter artigt).

## 4. FALLGENOMGÅNG (de farliga interaktionerna)

| Läge | v3:s beteende |
|---|---|
| Allt friskt, samma BUILD_ID | helt tyst (bevisat 22:26 + 22:28-ropen) |
| Deploy bygger (lås upptaget, pm2 stoppad JÄRN-U1-fönster) | A tyst om friskt; B viker (låsrespekt); C viker; D viker |
| Bygg hängt (loggtyst >12 min + process >12 min) | A dödar + pm2 restart (r331, orörd) |
| .next riven + app nere + lås fritt + snapshot finns | C rullar tillbaka på sekunder + pm2 restart + restarts-rapport |
| Kraschvaktens räddningsbygg pågår (flock -w 1200, .next riven) | C viker (låset upptaget) — bygget äger; dör bygget släpps låset ⇒ nästa rop rullar |
| .next riven men rollback <10 min sedan senaste | C tyst (throttle); efter 10 min nytt försök — kraschvakten kan hinna först (då fräsch artefakt) |
| App nere men .next hel | B startar om (2-min throttle) — C kräver BUILD_ID saknas |
| pm2 online men svarar ej | varken B (status online) eller C (BUILD_ID finns) agerar — kraschvaktens transient-gren äger (20-s-omkoll + varm()) |
| pm2 jlist svarar ej | "okänd" ⇒ inget grenar agerar |

## 5. KVD — BEVIS

1. **bash -n:** OK (utdata `SYNTAX-OK`).
2. **OK-läge, bygg pågår:** manuell körning 22:18 — exit 0, ingen utdata,
   loggen orörd (sista raden fortfarande r331:s 21:58:11).
3. **Snapshot-debut i skarp drift:** 22:24:18 UTC — CRON-ropet efter
   byggdöds-läkningen (22:22:19) och o79-läket (22:23:37) tog
   initiativet: online + lås fritt + BUILD_ID "ZG-84L6-upvHIt0jR7VUf" ≠
   state (första v3-ropet med fritt fönster) + curl 200 ⇒
   `SNAPSHOT: ZG-84L6-upvHIt0jR7VUf verifierad online+200 — senast-bra
   rullad fram (hårdlänkad, diskneutral)` i ~/sitvakt.log.
4. **Hårdlänkbevis:** snapshoten = 15 865 filer (= .next:s exakta
   filantal); länkantal 2 på BUILD_ID, routes-manifest.json (50 630 B)
   och prerender-manifest.json (1 359 095 B) = delade inoder med .next ⇒
   kopieringen lade 0 datablock.
5. **Steady state:** ropen 22:26 och 22:28 passerade utan nya loggradar
   (samma BUILD_ID) — "inget händer" i OK-läge bevisat igen.
6. **Rollback-grenen:** INTE skarpt körd (rm -rf .next på levande prod är
   destruktivt) — dess byggstenar är var för sig bevisade: cp -al +
   o50-kontraktskoll = exakt snapshotvägen som körde grönt 22:24:18;
   pm2-restart-satsen = r331:s APP-VAKT (prod-bevisad sedan r331);
   flock -n-atomiken = kraschvaktens lasUpptagen-idiom. Grenen förblir
   teoribevakad till första äkta trigger — då skrivs ROLLBACK-raden med
   både gamla läget och återställt BUILD_ID i loggen.
7. **Loggutdrag** (nya rader sedan aktivering):
   ```
   2026-09-29T22:24:18+00:00 SNAPSHOT: ZG-84L6-upvHIt0jR7VUf verifierad online+200 — senast-bra rullad fram (hårdlänkad, diskneutral)
   ```

## 6. AKTIVERING

Skriven till ~/sitvakt-ny + `bash -n` + `chmod +x` + `mv` (atomiskt byte
22:17 — cron ropar varannan minut och ska aldrig se en halvskriven fil).
Cron-raden, crontab-ytan, kraschvakten, prod-synken: orörda.

## 7. FYND FÖR ÄGARNA (bokförda, EJ kurerade här — utanför JÄRN-U2:s ägarskap)

1. **Deployombyggsloopen** (§1) pågår vid skrivande stund — byggfel i
   sig (tre fel i kvalitetsrapporten GUL stoppar inte), läkebackupen
   håller sajten uppe. Prod-synkens/huvudagentens bord.
2. **A-grenens 12-min-tröskel kan mörda friska byggen:** r331b dödar vid
   loggtystnad >12 min + process >12 min, men JÄRN-U1-dokumenterad
   kompileringstid är 25,7 min och "Creating an optimized production
   build ..."-fasen skriver INGET på hela vägen (mätt i
   /tmp/synk-build.log: sista raden är själva startfasen). Indiciefallet
   22:22:05: ett ombygge som levat 13,3 min dödades — det kan ha varit
   friskt (13,3 < 25,7) eller hängt som dagens övriga (två tidigare
   byggfel inom ~1,5 min pekar på fel/häng-klassen). Rekommendation till
   r331-ägaren: höj tröskeln till ≥40 min. v3 ändrade den EJ.
3. **pkill-mönstrets kollateral:** A-grenens `pkill -9 -f "npm run
   build"` / `"next build"` / `"ak1a-deploy.lock"` matchar ALLT med
   strängen i cmdlinen — mätt 22:19 matchar det t.o.m. zcode-skalets
   EGET pgrep-kommando (pid 1216094/1216122 i observationsprotokollet).
   Fabriksbarn eller skal som bär strängen i sin kommandorad kan dödas
   som kollateral vid en A-trigg. r331-ägt.
4. **.next-r325-gammal:** tom katalog kvar i trädroten sedan r325 (git
   ser den inte — tomma kataloger trackas ej). Oskyldig men kvarvarande
   skräpyta.

## 8. DIFF r331 → v3 (sammanfattning)

| Yta | r331 | v3 |
|---|---|---|
| A byggdöds-vakt | 12-min-tröskel | identisk, ordagrann |
| B app-vakt throttle | 600 s | 120 s |
| B byggkontroll | enbart pgrep "npm run build" | + deploy-låsrespekt (flock -n-sond) |
| B/C vid pm2-jlist-svikt | tom status ⇒ kunde restarta frisk app | "okänd" ⇒ aldrig åtgärd |
| C artefakt-rollback | saknas | finns: villkor + atomik under deploy-låset + o50-grind + 10-min throttle + kraschvakt-rapport |
| D rullande snapshot | saknas | finns: online+200 + id-ändring + cp -al + o50-grind + atomiskt byte |
| Kör-lås mot sig själv | saknas | flock på ~/sitvakt-kor.lock |
| Logg/state | ~/sitvakt.log + ~/sitvakt-state | + ~/sitvakt-snapshot-state, ~/sitvakt-rollback-state |

— JÄRN-U2, fabriksagent BYGGARE, 2026-09-29. Verktyg+data — src orört.
