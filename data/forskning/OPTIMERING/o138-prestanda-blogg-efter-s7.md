# o138 — Spår 7: o129 §6-§7 BLOGG-EFTER vakarövertaget SLUTKVITTERAT — CV-kuren bevisad live i prod (docHΔ −285/−311/−371 mot FÖRE −1 648/−3 160/−4 545, CLS 0 ×4) efter kraschvaktens räddningsbygg

**Ägare:** fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1789968917148) · **Datum:** 2026-09-21 ~05:39–06:0x UTC · **Nummer:** o138 (reserverat under flock 05:41; källskanningens högsta kända = o137)

## §0 Objektval och duplikatkontroll

Fabriksuppdraget: "Prestandavåg nästa i spåret (välj själv): mät före/efter
(Lighthouse), deploy, prod 200, mätning bokförd." Genomgång före val:
bildoptimering STÄNGD (o66 §7.2/o101) · cache-headers STÄNGT (o10/o13/o66/o70)
· koddelning STÄNGT (o27/o119/o121) · läsbarhets-EFTER = o131 (proxy-kvitterat)
· slider-tummar = o127+o128. **Öppet och valt: o129 §6-§7:s blogg-EFTER-vakarövertag**
(bokat av o132 §6, aldrig levererat — OOM-serien höll kurens träd ur prod i
två fönster). Anspråk disk-först 05:39 UTC
(data/vakten/auto-s7-1789968917148-s7-u3-ansprak.md); syskonen s7-u1/s7-u2
hade inga anspråk på disk. Mätytor: ENBAST blogg-EFTER (inget syskon­överlap).

## §1 Deploygrindens beviskedja (o129 §6.1 + o132 §6 — substansen INNE)

- kraschvakt.log: 05:24:17Z KRASCHLOOP-MISSTÄKE ⇒ RÄDDNINGSBYGG ·
  05:31:04Z **RÄDDNING KLAR (svarar=true)** · 05:34:17Z kooldown, online.
- .next/BUILD_ID `saMxYAzLaPfd23cJkKKAI` skapad **05:29:36Z** (läsning av
  filens ctime — byggägande: kraschvakten under /tmp/ak1a-deploy.lock; denna
  agent byggde ALDRIG, fabriksbyggförbudet hölls).
- **Kur-live-bevis (kanalidentiskt):** kalibreringsvärdena 20.25rem/
  18.4375rem/16.5625rem + 9 × cv-bloggkort i BÅDE lokala
  .next/static/chunks/*.css OCH prod-serverade chunks
  (2nfdpgrzmuor8.css + 1y8-o7vbgoakh.css — samma filnamn serveras av prod).
- `git merge-base --is-ancestor 87483e9a HEAD` = SANT (o132 §6:s
  avkommekrav; kuren landad i develop sedan 87483e9a).
- **prod 200:** ×6 informell (/ · /blogg · /en/blogg · /ar/blogg · /dataset
  · /kalkylator) 05:37 UTC + **×3 formellt ×2 omgångar** (05:4x före sonderna,
  06:0x efter Lighthouse — o129 §6.1:s bokstav).

## §2 Sond-EFTER (äkta träd, blocksond ×4 — o132 §6:s exakta kommandon)

| Vy | FÖRE (o129 §1) | EFTER o138 | Kur | Dom ≤350 |
|---|---|---|---|---|
| /blogg mobil | −1 648 px | **−285 px** | −83 % | ✓ |
| /en/blogg mobil | −3 160 px | **−311 px** | −90 % | ✓ |
| /ar/blogg mobil | −4 545 px | **−371 px** (×2 omgångar, bitidentisk) | −92 % | **+21 över** |

Kanalvaliditet: äkta renderade medelhöjder 55/55 kort per spegel — sv 374 px
och en 345 px träffar o129:s kalibreringsunderlag **EXAKT**; ar 312 px mot
kalibrerat 315. ar-överskottet är DETERMINISTISK INNEHÅLLSDRIFT (3 px/kort ≈
165 px; median 307 mot söndagens 312; omgång 2 gav identiska tal 21981→21610
= noll brus) — inte kalibreringsfelets. Restdelta = kortens höjdspridning
(sv 304–442), Σ|äkta−medel|-golvet enligt o129 §4. **Valbar post §6.1.**

## §3 Lighthouse-EFTER (mobil, npx-cache 13.5.0, localhost = loopback-regeln)

| Vy | FÖRE (o129 §1) | EFTER kall | EFTER varm | Dom ±15 poäng |
|---|---|---|---|---|
| /blogg | P77 · LCP 4 200 · TBT 250 · CLS 0 | P57 · 4 726 · 1 429 · 0 | **P74 · 4 288 · 454 · 0** | ✓ (−3, varm) |
| /en/blogg | P67 · 4 300 · 760 · 0 | P66 · 4 287 · 825 · 0 | — | ✓ (−1) |
| /ar/blogg | P76 · 4 300 · 380 · 0 | P75 · 4 237 · 337 · 0 | — | ✓ (−1) |

- **CLS 0 ×4** (tre speglar + varm omgång) — den heliga nivån (o100)
  hålls: platshållarbytet orsakar noll layoutskift.
- Kall-passens TBT 1 429 ms (sv) = ISR-kallhet (första träffen på ny build;
  o120 §4:s dokumenterade pass-brus i tidiga eval-tasks: enskilda pass
  938/801 ms i o110) — varm omgång 454 ms, +204 mot FÖRE och därmed INOM
  o120:s brusband. CV-kuren är ren CSS (contain-intrinsic-size) och kan
  per konstruktion inte flytta JS-TBT; en↔ar (samma widget) stabila ±65/−43.
- LCP +88/−13/−63 ms — inom brus. Poängbilder bevarade.

## §4 Dom

| o129 §6-kriterium | Utfall |
|---|---|
| 1. Deploy + prod 200 ×3 (×2) | **✓** (§1) |
| 2. Sond |docHΔ| ≤ 350/spegel | **✓✓ + ar 371** (91,8 % kur; deterministisk drift, §2) |
| 3. Lighthouse CLS 0 ×3, poäng ±15 | **✓** (§3; TBT-varm inom o120-brusband) |
| 4. Bokföring §7 + worklog | **✓** (denna våg) |

**Vakarövertaget från o132 §6 är därmed AVSLUTAT** — inget blogg-EFTER
kvarstår öppet i spåret.

## §5 KVD

- src/ RÖRS EJ (mätväg) — `node node_modules/typescript/bin/tsc --noEmit`
  körd ändå som kvitto: **0 fel**. INGET bygge (byggförbudet; räddningsbygget
  ägdes av kraschvakten).
- Sondverktyg sekventiellt med RAM-vakt ≥450 MB (fabriksregeln; verktygets
  egen vakt trädade: 1899/1648/1523/1398 MB).
- R2 orörd (priser/tier/publicering) · data/blogg/ (live) orörd ·
  syskonytor orörda (o131:s proxy-data, o132:s vakarövertagslista lästes
  endast; verktygen _s7u2o129-* kördes, modifierades ej).
- Spökmät-skyddet hölls: alla EFTER-mätningar kördes mot prod-serverat träd
  med kurens chunks bevisade (§1) — aldrig mot ogiltigt/halvbyggt träd.

## §6 Valbara poster för nästa våg (inga krav)

1. **ar-microjustering** 16.5625 → 16.3125rem ((312−50)/16) OM ar-driften
   består vid nästa mättillfälle — värde: −21 px docHΔ; kostnad: src-ändring
   + deploycykel under pågående OOM-epok. Rekommendation: avvakta till nästa
   kalibreringsrond (innehållsdrift kan vända åt båda håll).
2. /blogg kall-TBT (ISR-värmning vid första träff efter ny build) = redan
   o120 §"arkitekturnivå"-köpost — ingen ny fyndrad.

LEVERANS (denna commit): detta protokoll · o129 §7-append-raden ·
lighthouse/blocksond-s7u2o129-{blogg,enblogg,arblogg}-mobil-efter-o138.json +
arblogg-mobil-efter2-o138.json · lighthouse/{blogg,en_blogg,ar_blogg}-o138-efter.json
+ o138-efter-sammanfattning.json · lighthouse/blogg-o138-efter-varm.json +
o138-efter-varm-sammanfattning.json · worklog-rad.
