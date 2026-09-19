# VÅG 212 — KVALITETSSYSTEMET: aggregatorn + vaktrapports-stoppet + motorregistret (2026-09-19, rond 107 [organ:Φ])

**Kontrakt (PIPELINE-KO):** E35:s tre bärande restgap — "kvalitetsvaktens
aggregator växer utan motorregister-arkitektur; huvudagentens kodvåg:
arkitekturen, motorregistrets dag 16+-skuld, vaktrapports-stoppet —
KVD: tsc 0 + sviter + live-bevis." SAMTLIGA TRE LEVERERADE denna rond.

## 1. AGGREGATORN — verktyg/kor-alla-tester.mjs (E35 gap 1: "123 sviter utan kör-alla")

Mekaniken: upptäcker ALLA verktyg/testa-*.mjs (124 st), kör SEKVENTIELLT
(RAM-delning med pm2/fabrik/chrome-cron), RAM-vakt 900 MB före varje svit
(vänta-tak 20 min; fabrikens mönster), timeout 900 s/svit (SIGTERM⇒SIGKILL —
hängande barn fryser aldrig svepet), klassning exit 0=GRÖN / ≠0=RÖD /
timeout=RÖD, kvitto-rad ur svitens EGEN utdata (aggregatorn hittar aldrig
på tal), RESULTAT_JSON-summa (kvalitetsvaktens konvention), rapport +
rådata till data/vakten/testaggregator-SENASTE.{md,json}, --fortsatt =
återupptagning (fabrikens idempotens), --mönster/--tak för avgränsning.

**FÖRSTA HELSVEPET (svep 1, "före"-beviset): 124/124 mätta — 71 GRÖNA /
53 RÖDA.** Aggregatorns Existensberättigande på ett enda svep:

| Fyndklass | Antal | Rot | Kur (samma rond) | Bevis |
|---|---|---|---|---|
| AI-Mentorn-lagersviter L01 | 42 | v210 wireade svaraLokaltValutamekanik UTAN syskon-svitharmonisering (provtagning: bara valutamekanik- + kedja-sviterna kördes vid leveransen) | harmonisering: komponenten in i 41 sviters kedjekopior (37 skriptade + case manuellt + 3 v1-reparerade) | tidsaxel 31→32/32 · kedja 236/236 · samtliga 38+3 körverifierade GRÖNA · svit-rad med dokumentationsplikt |
| Mimosa-arbetsyta-fynd | 6+1 | gitignorerad sessionsskräp (.zcode/commita-*, v119/v134, data/backups/dr-*) med EXEC_INTERP-mönster — prod-trädet saknar dem (därav gröna 07:02-rapporter) medan ARBETSYTANS vaktkörning rödnade | härdning enligt o59-doktrinen (execFileSync-array) i 7 filer | mimosa-svit 9/3→12/12 · tsc-svit 10/1→11/11 |
| Stal artefakt-mätning | 1 | testa-rsc-skann fall 10 mätte arbetsytans 7 dagar gamla .next (4 719 rsc < 6 000) som vore den levande (prod samma kväll: 7 379) | färskhetsgrind: BUILD_ID äldre än 48 h ⇒ ärlig PASS-hoppad | 13/14→13/13 |
| Transient under samtidighet | 1 | schema-kurser UNDERKÄNT i svepet (fabriksbarn commitade i trädet mitt i), grön vid isolerad omkörning | ingen — klassad transient | sond: exit 0 "Kontroller FAIL: 0" |
| Miljöberoende (dev/prod) | 6 | tradspermanens+rewind (.env.production.local = prod-trädets fil, STOPP-regeln: .env rörs aldrig) · studio-ttfb+tabbar (dev-server) · prod-synk-tidsstampel (prod-logg) · dataset-aspekter (@/-alias-import i src/lib/dataset-medianer.ts — KÄNT, bokfört v209-u3, src-yta) | bokas: V213 delar sviterna i arbetsyta-/prodklasser (ärlig klassning, aldrig vitlista-nivåsänkning) | se sond-loggar |
| Tillståndsdrift | 1 | styrelse-sviten K4/K5 förväntar sig icke-existentiellt senaste beslut + aktuellt mötes-id i PIPELINE — världen drivit | bokas V213 (tillståndslösa förväntningar) | sondutdata |

**Svep 2 ("efter"-mätningen) dispatchad fristående (pid 3218071) —
förväntad bild: ~118 gröna, återstående röda = miljöklassen (ärligt RÖDA,
aldrig tysta).** Läses tillbaka nästa rond; SENASTE-rapporten lever i
data/vakten/testaggregator-SENASTE.md.

## 2. VAKTRAPPORTS-STOPPET — prod-synk.mjs (E35 gap 3:sista halvan)

Kontrakt: **RÖD kvalitetsrapport ⇒ deploy-stopp** (SYSTEMKARTAN 2026-09-16:
".next-skadan nådde prod utan att någon grind stoppade vägen"). Levererat:

- `lasVaktrapportStatus(filvag)` — tolkar SENASTE-rapportens ANTAL FEL/STATUS-rad
  (sista-raden-vinner, motorsektionens append-regel), ålder ur mtime
  (Math.max 0 — färsk rapport är aldrig −1 h, kantfynd ur sviten)
- `bedomVaktrapportStopp(rapport)` — RÖD färsk ⇒ STOPP · GUL ⇒ varning
  (GUL stoppar aldrig) · saknas/otolkbar ⇒ fail-open + VARNING (OMÄTT loggas
  ärligt) · >48 h ⇒ fail-open (vaktpumpornas död ägs av pulsvakten — en död
  vakt får ALDRIG frysa prod-koden i evighet; ålder vägs FÖRE status)
- placering i korSynk steg 1c, FÖRE byggstart: HEAD/DEPLOYAD/.next orörda
  (bygget river .next — att inte bygga alls är den skonsammaste stoppen)
- **DEADLOCK-SKYDDet:** varje stopp triggar OMMÄTNING (detached
  kvalitetsvakt under lås, data/vakten/.vakt-ommatning.lock, stal >15 min) —
  rapporten mätte 07:02-trädet och de nya committerna kan bära själva fixen;
  nästa poll (10 min) läser FÄRSK rapport. Fortfarande RÖD ⇒ stopp igen.
- audit `deploy_stoppad_vaktrapport` + prod-synk.logg.
- **Svit 16/16 GRÖN** (verktyg/testa-prod-synk-vaktrapport.mjs) + regression
  nextläke 29/0 (prod-synk-ytan rördes). Live: pumporna kör :x7 — grinden
  aktiv i skarp deployväg från nästa synk; aktuell rapport GRÖN 0/0 19:36Z ⇒
  passform bevisad, RÖD-grenens skarpa stopp bevisas av sviten + audit vid
  första äkta tillfället (regel 2-kulturen: stängs på live-bevis).

## 3. MOTORREGISTRET — data/motorregister.json (E35 gap 2, "dag 16+-skulden")

Regenererat 42 → **102 motorer** (57 AI-Mentorn-frågelager + portfölj-
forskningsmoduler; v210:s eget språkbruk kallar lagren motorer). Befintliga
42 poster BEVARADE (mänsklig kunskap orörd); mekaniskt tillagda kolumner
`testad` + `testverktygAlla`; kompositsökvägar normaliserade (de två "döda"
posterna var parentessuffix som bröt exists-testet). Fullständig metod +
tabell: **data/rapporter/motorregister-2026-09-19.md**.

**NY FYNDLISTA — registrets testtäckningskolumner avslöjar 10 otestade
motorer** (nästa kvalitetsvågs backlog): nyhets-motorn · datacache ·
signal-bus · organ-bus · elevkarna · klientkontext · navigationsminne ·
eko-koppling · shortseller-bank · dynamic-catalog.

## KVD

- tsc 0 (src/ orörd — inget bygge; data-/verktyg-leverans)
- Svitkontrakt: vaktrapport 16/16 · nextläke 29/0 · mimosa 12/12 · tsc 11/11 ·
  rsc-skann 13/13 · tidsaxel 32/32 · kedja 236/236 · case 18/18 · b2b 33/0
- Gränssnittsvakten: src orörd sedan 17:39-bygget ⇒ gällande kvitto
  granssnitt-2026-09-19T1803.json 0 fynd/176 täcker aktuella ytan
- R2 orörd · data/blogg/ orörd (v211-fabrikens utkast lever i
  data/blogg-utkast/) · juridikgrinden: inga råd-ytor rördа (2007:528)
- Fabriken v211 KLAR 3/3 samma fönster (B18/B20-en + industri-ar +
  tillväxt-ar; granskning enligt m9/AR-mönstret = nästa steg, publicering
  förblir kundens R2)

## Bokning (evighetsmotorn ≥3 framåt)

- **V213 (kvalitetsspåret fortsättning):** (a) sviternas miljöklasser —
  prod-/dev-beroenden ärligt åtskiljda (aldrig nivåsänkande vitlista);
  (b) 10 otestade motorer får minimala kontraktssviter; (c) dataset-aspekter-
  svantens @/-alias-brott (src-yta, bokfört sedan v209-u3) kuras; (d) styrelse-
  svitens tillståndslösa förväntningar.
- **V211-granskning:** fabrikens 3 leveranser granskas enligt AR/KONTROLL-
  mönstret (tal-paritet, juridikgrind) innan kö-status FLYTTKLAR.
- **V212-svep 2:** läs tillbaka testaggregator-SENASTE efter pid 3218071.
