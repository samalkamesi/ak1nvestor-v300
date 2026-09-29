# JÄRN-U1 — Prod-synkens sista mörka väg: stallning ALLTID (disk-gräns + patch-vägen)

**Status: LEVERERAD 2026-09-29 (fabriksagent BYGGARE, kundorder "noll mörker").**
**Ägda filer: `verktyg/prod-synk.mjs` + detta protokoll.** Kontraktstest följde
sitt kontrakt i samma leverans (r280-precedensen "nolldowntime 14/18 uppdaterade"):
`testa-prod-synk-npmci-stallning.mjs` (tröskel 11/12 + ny JÄRN-U1-sektion 25–33)
samt `testa-prod-synk-nolldowntime.mjs` (test 18). Övriga sviter orörda och gröna.

---

## 1. Ordern och roten

Kundordern: **noll mörker** — prod-synken hade efter r336 (kraschvaktens
`.next-ny` + atomära byte) exakt TVÅ kvarvarande pm2-stoppar, dvs. två vägar
där sajten mörkrar ~byggtid:

| # | Läge (före JÄRN-U1) | Risk-mekanik |
|---|---|---|
| a | **Patch-kön, rad ~1351**: `pm2Vakt.stoppa()` i patch-install-OK-grenen | o48: ett lock-byte (t.ex. next 16.3.2→16.3.5) byter chunknamn och tömmer `.next` — pm2:s live-ISR hinner skriva i kataloger som rmdir:as (ENOTEMPTY, bevisat 09-17 11:29+11:39). Stoppet täckte HELA byggfönstret = mörkt ~byggtid. |
| b | **npm ci, rad ~1391**: `if (npmCiBehov && !stallning) pm2Vakt.stoppa()` | stallningDiskMojlig-tröskeln 6 000 MB — servern har 1,1 TB fritt (mätt 2026-09-29) men gränsen kan träffa i framtiden; under tröskeln mörkrar npm ci-vägen ~byggtid. |

## 2. KUR (a) — patch-vägen använder STALLNINGEN

**Nytt flöde när disken tillåter (≥ 20 000 MB fritt):**

1. **Installationen i kopian** — nytt export `byggPatchInstallStallningsKommando(spec)`:
   `rm -rf .bygg-kopia && mkdir && git archive HEAD | tar -x` + `cd .bygg-kopia &&
   npm install <spec>` + tsc-grinden (o106) **i kopians** node_modules — allt i
   installationsbarnets existerande flock-fönster. Prod-ytans `node_modules`/`.next`
   rörs **ALDRIG** ⇒ pm2 lever, lazy-require-risken (våg 153-klassen) försvinner
   mekaniskt, och `.next` raderas aldrig i prod-ytan ⇒ o48-racet är borta.
2. **Bygg-steget i kopian** — nytt export `stallningsByggKommando()`:
   `cd .bygg-kopia && NEXT_DIST_DIR=.next-ny npm run build`. KorBygg installerar
   ALDRIG om (installationen är bevisat OK — samma semantik som dagens patch-väg
   där ombyggen aldrig kör npm ci på nytt). Ombyggen återanvänder kopian; next
   build rensar egen distDir och artefaktgrinden mäter kopians `.next-ny`.
3. **Dubbelbyte** — befintligt `stallningsByteKommando` (node_modules + .next i
   EN &&-kedja under deploylåset, hash-vakt först) — V183B:s bevisade mekanik,
   nu även i patch-läget. pm2:s avbrott = bytets sekunder.
4. **Gröna fönstret** — kopians `package.json` + `package-lock.json` förs över
   till prod-trädet FÖRE `git add` + commit (kopian städas strax efter; dubbel-
   bytet flyttade redan dess node_modules) ⇒ träd, lock och deployat läge är ETT.

**Mörker-fallback (disk < tröskeln):** dagens prod-yte-väg orörd (install i
prod-ytan + pm2-stopp) men nu **MARKERAD 'MÖRKER-VÄG'** i synkloggen + larm
till `/desk/larm.json` (se KUR b). Stoppet sker ALDRIG tyst.

**V187-paritet (bevisad nödvändighet):** `byggTradStart` (BYGGER FRÅN-hashen)
låses numera **FÖRE patch-installationen**. I stallningsläget är KOPIAN bygg-
trädet (git archive sker i installationsbarnet) — vaktades hashen först EFTER
installationen kunde ett träd som flyttar under installationen (push landar)
passera dubbelbytets hash-vakt bara för att mätningen skedde efter flytningen
= r276:s buntslagsrace-klass på nytt. Med fångsten före installationen blockeras
bytet vid varje trädflytt under hela fönstret. För övriga lägen: oförändrat
"lås vid byggstart", fönstret växer strikt säkrare.

**Ekvivalens med dagens felvägar (genomgång):**
- Install-fel / tsc-fel i kopian ⇒ prod-ytan var orörd, kvitto misslyckad,
  deploy fortsätter (striktrare än förut: förr var prod-node_modules redan
  patchad när tsc föll). `aterskapaPatchLas` blir no-op (oskadlig).
- Bygg-fel + ombygg ⇒ ombygget bygger om i kopian; hash-vakten stoppar bytet om
  trädet rört sig (revert/reset-vägar) — identiskt beteende som dagens prod-yte-
  ombygg, som OCKSÅ hash-vaktas.
- Rött HTTPS efter dubbelbyte ⇒ tillbakarullning återställer `.next` men
  node_modules stannar nytt — **samma dokumenterade V183B-begränsning som dagens
  patch-väg har** (förr: patchad node_modules kvar efter rollback); `node_modules-forra`
  ligger kvar på disk för manuell rullning. Ej förvärrat, ej ny död vinkel.

## 3. KUR (b) — ärlig tröskel + MARKERAD mörker-väg

**Tröskeln `STALLNING_DISK_KRAV_MB`: 6 000 → 20 000 MB.** Mätt 2026-09-29:
kopian ≈ tracked träd 0,5 GB + node_modules 0,9 GB + .next-ny 0,9 GB ≈ **2,4 GB**
(ordermåttet "kopian ~8-10 GB" är alltså konservativt — protokollfört ärligt),
men fönstrets TOPP bär även bytets -forra-kopior (~1,8 GB), ev. läkebackup
(~0,9 GB) och npm-cachens tillväxt. 20 000 MB = kundorderns mått + marginal:
stallningen lovar HELT fönster-plats, aldrig "nästan". Notera riktningen: tröskeln
höjs (= färre stallningsförsök på marginaldisk, fler MARKERADE mörker-fallbacker
— ärlighet framför falska nolldowntime-löften).

**Mörker-vägen (båda fallen):** stoppet behålls som ÄRLIG sista utväg men loggas
`MÖRKER-VÄG (JÄRN-U1): …` med orsak (uppmätt fritt disk / tröskel) OCH ny export
`skrivMorkerVagLarm()` skriver varning till **`/desk/larm.json`** — samma fil
vakttornet (r332) serverar till landningens larmbanner var 5:e minut:

- format `{"lag":"ALARM","t":…,"fel":[…]}`, MERGLAR med vakttornets befintliga
  felrader (bannerförlust = larmförlust), deduplicerar identisk rad (ingen
  radtillväxt per poll), skriver både `/var/www/desk/larm.json` och reserven
  `/home/ak1a/desk-web/larm.json`
- vakttornets nästa svep skriver om filen med sina egna kontroller — larmraden
  är per-design kortlivad utöver fönstret (mörkret självt syns då som
  pm2-organ ALARM)
- ALLA skrivfel sväljs: larmet får ALDRIG påverka deploy-utfallet

## 4. Diff-tabell (behavior jämförd med före)

| Scenario | Före JÄRN-U1 | Efter JÄRN-U1 |
|---|---|---|
| Patch + disk ≥ 20 GB | pm2 stoppad ~byggtid (mörkt) | **pm2 LEVER** — install+tsc+bygg i kopian, dubbelbyte i gröna läget |
| Patch + disk < 20 GB | pm2 stoppad, tyst mörker | samma stopp men **MARKERAT MÖRKER-VÄG + /desk/larm.json-larm** |
| npm ci (lock-byte/trasigt) + disk ≥ 20 GB | stallning (V183B, orörd) | samma stallning (V183B, orörd) |
| npm ci + disk < 20 GB | pm2 stoppad, tyst mörker | samma stopp men **MARKERAT MÖRKER-VÄG + larm med uppmätt disk** |
| Träd flyttas under patch-installationen | (fanns ej — hash låstes efter) | dubbelbytet blockeras av hash-vakten, ombygg nästa poll |
| Patchad lock committad | ur prod-trädets arbetsyta | förs över UR KOPIAN i gröna fönstret, samma commit-flöde |

## 5. KVD — bevis

| Kontroll | Resultat |
|---|---|
| `node --check` prod-synk.mjs + båda testfilerna | OK |
| testa-prod-synk-npmci-stallning | **33 PASS · 0 FAIL** (24 förut + JÄRN-U1 25–33) |
| testa-prod-synk-nolldowntime | **25 PASS, 0 FAIL** (test 18 uppdaterat till MÖRKER-VÄG-kontraktet) |
| testa-prod-synk-pm2vakt (strukturell: exakt 2 stopp, kontexter, före korBygg) | **36 PASS / 0 FAIL** — orörd svit, grönt mot nya källan |
| testa-prod-synk-patchko (byggPatchInstallKommando orörd) | **67 PASS / 0 FAIL** |
| testa-prod-synk-buntslagsrace | **14/14 PASS** |
| testa-prod-synk-byggram / nextlaeke / ramvakt / revertgrid / arbetsytasynk / instanslas | **19 · 29 · 22 · 35 · 34 · 16 — alla 0 FAIL** |
| tsc-baslinjen (pre-commit-grinden, mekanisk vid commit) | körd vid commit — se commit-kvittot |

**Notering om byggram-flake:** testa-prod-synk-byggram test 2+5 (sondens
mock-leverans [520,430] med 5 ms-intervall i 20 ms) är lastkänsliga — under
dagens pågående driftincident (pm2 errored, prod 502) föll de sporadiskt i
batchkörning, BÅDE mot HEAD (kontrollerat via stash) och med JÄRN-U1: endast
en timing-egenskap hos testet, inte en kodändring (startaByggRamSond är
byte-identisk; sviten importerar inget JÄRN-U1 rör). 5/5 senaste körningar grön.

## 6. Driftsättning — "nästa :x7 kvittar"

**ALDRIG körd deploy av fabriksagenten** (orderns metod-steg 4): commit på
develop ÄR driftsättningen för verktyg/-filer (pm2-appen och pumpor-daemonen
kör ur detta träd). Den REDAN LÖPANDE prod-synk-processen bär gamla koden —
**nästa prod-synk-rop vid :x7 startar en NY process som plockar JÄRN-U1**, och
kvittot syns i `data/vakten/prod-synk.log` (sök "JÄRN-U1" / "MÖRKER-VÄG").
Äkta debut för patch-stallningen sker vid nästa patch-kö-post ≥ 20 GB fritt
disk (v186-mönstret: leveransen väntar sin första äkta körning).

**Leveransfilosofi notering:** om en framtida patch-körning mörkar beror det
numera på att disken SANNLICT nekade kopian plats — och då står det i loggen
MARKERAT, i /desk/larm.json och i vakttornets rapport. Noll mörker = noll
TYSTA mörker; de ärliga sista utvägarna lever som larmade undantag.
