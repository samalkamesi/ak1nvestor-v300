# O165 — SPÅR 7 PRESTANDA: o159 §9:S EFTER-VAKARÖVERTAG SOM STÅENDE INSTRUMENT (s7-u2 omdispatch, 2026-09-24)

Fabriksagent s7-u2 (byggare 2/3, ursprungsmanifest auto-s7-1790249713381,
ny dispatch av samma uppgiftstext: "mät före/efter (Lighthouse), deploy,
prod 200, mätning bokförd"). Anspråk disk-först FÖRE all ändring
(`data/vakten/s7-o159efter-vakarotag-u2-o165-ansprak-2026-09-24.md`,
15:5x lokal); nummerreservation o165 i protokollnummer.json under flock
(poolens högsta var o164).

## §0 Val (duplikatkontroll klar)

Spårets stängda ytor oförändrade sedan o160 §1. ÖPPNA poster vid valet:
o159 §9 (EFTER-kvitteringen av cv-kuren 21e67000 — bolagsfamiljens tre
sidor) · o158 §6 (natt-cronens TBT-slutdom 03:27 — u1:s cron-yta, orörd) ·
o160 §7 (strukturkvitto av KOMMANDE deploy för superanalys/kalkylator/
konfluens/kurser — skilt objekt, orört). **Valt objekt = o159 §9**, med
motivet: den är spårets äldsta bokade men overifierade leverans (kuren är
committad i trädet men aldrig mätbar i prod), och deployen är just nu
RAM-blockerad — exakt läget där spårets eget vakarövertagsmönster (o130,
o131, o144) gäller, fast nu med full automatkedja.

## §1 Läget som fanns (bevis)

- Prod-synk.loggen: deployad är fortfarande a2c9d663 (09:41:47Z). Byggförsök
  OOM-dödade 12:24:37Z och 13:41:32Z ("Creating an optimized production
  build"-fasen); däremellan och efteråt VÄNTAR-RAM (senast 13:47:14Z:
  1 543 MB < 3 050 krav; fabriksbarn + chrome-cron håller minnet).
- `git merge-base --is-ancestor`: 21e67000 (o159:s kur) är INTE anfader till
  a2c9d663 (exit 1, korrekt) men ÄR anfader till HEAD c6cbccd3 (exit 0) —
  nästa lyckade synk-bygget bär kuren, och DÅ är EFTER-mätningen dom-bar.
- Förra rundans §9.4-instrument `verktyg/_s7u2o159-skrollcls.mjs` låg
  SKRIVET men OCOMMITTAT på disk (mtime 14:20, efter deras commit 21e67000
  ~14:3x lokal) — tas om hand här under dokumenterat vakarövertag.

## §2 Kuren — EFTER-vakten som fristående organism

`verktyg/_s7u2o165-eftervakt.mjs` (startad med setsid nohup, överlever
agentronden; 6 h tak; logg → data/vakten/o165-eftervakt/drift.log):

1. **vanta-deploy** — poll 60 s av prod-synk.loggens "DEPLOYAD automatiskt:
   N commits (hash)"-rader; krav: `merge-base --is-ancestor 21e67000 hash`.
2. **prod-200** — loopback ×3 (/data/nyckeltalsguide, /bolag,
   /bolag/eqnr-ol) måste svara 200.
3. **kanalbevis** (o159 §9.2) — serverad /bolag-HTML bär `cv-bolagsektion`
   + `--cv-h`, och deployad CSS-chunk bär `.cv-bolagsektion`-regeln.
   Brott ⇒ dom RÖD (kanalbrott) + exit 1 — kuren nådde inte ytan trots
   anfaderskap (då: byggkontroll, ALDRIG egen build).
4. **vanta-ram** — tillgängligt RAM ≥ 1 500 MB (spårets tak) före VARJE
   Chrome-fas; Chrome får aldrig riskera prod-processer.
5. **mät** — kanoniska verktyget OFÖRÄNDRAT: `node verktyg/
   prestanda-lighthouse.mjs o159-efter /data/nyckeltalsguide /bolag
   /bolag/eqnr-ol` (o152-kontraktet, mobil).
6. **skroll** — `node verktyg/_s7u2o159-skrollcls.mjs` (o144-mönstret,
   post-load-observatör, bottenrullning ×2, mäter även verkliga sektions-
   höjder = levande cv-kanalbevis).
7. **dom** → `data/forskning/OPTIMERING/lighthouse/o165-eftervakt-dom.json`:
   - STRUKTUR (dom-bar alltid): kanalbevis HEL · CLS 0 ×3 (o100 heligt;
     brott ⇒ RÖD) · skroll-CLS-summa < 0,01/omgång (stavhopp-fribrott ⇒
     GUL: justera --cv-h-formeln 68,6·rader−300 mot uppmätt median).
   - /bolag TBT < 3 000 ⇒ GRÖN (väsentligt under FÖRE 4 324; A/B-span
     −47…−81 %). TBT ≥ 3 000 DAGTID ⇒ GUL laststämplad referens —
     metrologiregeln o143 §3: natt-cronen 03:27 (o158 §6) äger TBT-slutdomen.
   - LCP ±15 % och poäng mot baslinjen bokförs som fakta med avvikelse-not.
   - Idempotent (färdig dom ⇒ exit 0 direkt); single-instans (O_EXCL-lås
     med stöld av >7 h gammalt lås); tidsgräns utan deploy ⇒ status
     "tidsgrans-utan-deploy" + exit 2 — vakarövertaget består (§6).

## §3 Verifiering (ärligt bokförd)

- `node --check`: GRÖNT.
- **Två kortbudgetskörningar** (O165_TAK_TIMMAR=0,003 ≈ 11 s): båda läste
  senaste DEPLOYAD (a2c9d663), körde anfaderkontrollen korrekt (exit 1 ⇒
  "bär EJ — fortsätter vänta"), skrev status-fas och avslutade med
  tidsgräns-exit 2. Den falska sidan (ej anfader) alltså BEVISAD; den
  sanna sidan är bevisad direkt i git (21e67000 anfader till c6cbccd3).
- **Läxfällan funnen och kurerad**: första testkörningen avslöjade att
  O_EXCL-låset lämnades kvar vid exit (andra körningen hade vägrat) —
  exit-handler städar nu låset; omtest: lås borta efter körning, körning 2
  startar utan vägran.
- Runtime-ytorna (status/driftlogg i data/vakten/o165-eftervakt/) är
  gitignorerade (rad 71) — trädet hålls rent medan organismen lever;
  dom-filen och mätfilerna landar i lighthouse/ (commit-yta, §6).
- tsc: src/ orörd — baslinjen bärs av pre-commit-grinden.

## §4 KVD

- R2 orörd (priser/tier/publicering) · data/blogg/ (live) orörd ·
  data/blogg-utkast/ orörd · src/ orörd (kuren redan i 21e67000).
- INGET bygge (prod-synken äger deployen; ALDRIG npm ci/install/build).
- Syskonytor orörda: SYSTEMKARTAN.md-modifikation på disk är s9-syskonens
  (dokumentationsspåret) — lämnad orörd, committen bär explicit pathspec;
  u1:o158:s cron-instrument och o160:s ytor enbart lästa.
- Kanoniska instrumentet (prestanda-lighthouse.mjs) KÖRT ej ändrat;
  _s7u2o159-skrollcls.mjs committas OFÖRÄNDRAT (förra rundans verktyg).
- Mätning vid feletäge mot loopback (middleware-whitelistat); RAM-tak 1 500
  före varje Chrome-fas.

## §5 Kö vidare

1. **När vakten domar** (dom-fil + status "klar"): boka facit i detta
   protokolls efterspel + worklog; committa mätfilerna (o159-efter-*.json,
   skrollcls-o159-*.json, o165-eftervakt-dom.json). GRÖN ⇒ o159 SLUTSTÄNGT.
2. **Tidsgräns utan deploy** (6 h): omstarta vakten (samma kommando) eller
   låt nästa våg göra det — alla kontrakt består i verktyget.
3. RÖD (kanalbrott eller CLS>0): o159:s formeljust-loop §9.5 + styrelse-
   larm enligt spårets eskaleringsmönster; ALDRIG egen build.
4. o160 §7:s strukturkvitto av nästa deploy (superanalys/kalkylator/
   konfluens/kurser) förblir ÖPPEN som skilt objekt — inte denna vågs yta.
5. Natt-cronen 03:27 (o158 §6) äger TBT-slutdomen — vakten levererar dag-
   tidsfakta, aldrig TBT-RÖD.

## Verktyg och rådata

- verktyg/_s7u2o165-eftervakt.mjs (organismen) · verktyg/_s7u2o165-
  reservera.mjs (poolreservation under flock) · verktyg/_s7u2o159-
  skrollcls.mjs (förra rundans §9.4-sond, nu committad).
- Runtime: data/vakten/o165-eftervakt/{status.json,drift.log} (gitignorade).
- Väntade mätdata: lighthouse/{data_nyckeltalsguide,bolag,bolag_eqnr-ol}-
  o159-efter.json + o159-efter-sammanfattning.json +
  skrollcls-o159-bolag-mobil.json + o165-eftervakt-dom.json.
- FÖRE-referens: o159-fore-sammanfattning.json (P56/P42/P55 · LCP 4434/
  6105/4691 · TBT 1424/4324/1231 · CLS 0 ×3).
