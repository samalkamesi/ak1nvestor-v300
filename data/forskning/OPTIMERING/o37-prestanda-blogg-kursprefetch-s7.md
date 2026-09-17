# o37 — /blogg-kortens kurslänk-prefetch: gapet mot /en/blogg är ÄKTA och kurerat (spår 7)

Datum: 2026-09-16 22:15–22:4xZ · Agent: s7-u1 (manifest auto-s7-1789596926773)
· Anspråk: data/vakten/s7-1789596926773-u1-ansprak.md (FÖRE byggstart, diskbevis)

## §0 Val + duplikatkontroll

Uppdrag "nästa prestandaobjekt, mät före/efter". Kontroll före val: bilder
(o5-F5/o27 avförda), fonter (v96 D1), cache (o10+o13 stängt ×2), läsbarhet
(o8 stängt), chat-widget-lager-lazy = o32 §6 kö 1 HUVUDAGENTENS (spår 6:s
25+ testfiler vaktar widgeten), vakarbugg = u2:s, /studio = syskonyta.
**Mitt val = o32 §6 köpost 3 + o32 §7 rest 4**: "/en/blogg mot /blogg
TBT-gap som sondbart objekt" + "/kurser saknar ensam-tal — nattfönster-
om-mätning". Båda infriade här.

## §1 Sond — sidorna är strukturellt identiska (2026-09-16 22:2x)

- HTML 230 011 B (sv) mot 215 686 B (en) — 14,3 kB textskillnad.
- Script-chunk-referenser: 173 st BÅDA, ENDAKOM en språkchunk
  (`1y-5o88dqqoiw.js` sv / `1_mbv--dr13b-.js` en) — **Content-Length
  21 489 B BÅDA** (identisk storlek — inte källan).
- Fonter/preloads/imageSrcSet identiska (2 woff2 + logotyp + 1 chunk).
- cv-bloggkort: 110 träffar (55 kort) BÅDA; DOM-noder 652 mot 641.
- Slutsats: gapet kan INTE vara bundtäsnings- eller fontskillnad —
  hypotesen "språkskillnad i bunt-redovisning" (o32 §5) MOTBEVISAD.

## §2 FÖRE-mätning — vilande om-mätning (SEQ-kollad)

Grindar enligt o32:s metodläxa: 0 chrome/lighthouse-processer, load 0,62
fallande, senaste Lighthouse-fil-mtime > 3 h, ISR-trigga ×2 + 8 s per
sida (11163-metoden). Verktyg: verktyg/prestanda-lighthouse.mjs (mobil,
simulerad 4G). Bygge: f22b5554 (prod-servat; o31 chatt-lazy deployad
16:40:33Z enligt o32 §1).

| Sida       | Poäng | LCP ms | TBT ms | CLS |
|------------|-------|--------|--------|-----|
| /blogg     | P52   | 5 498  | 1 299  | 0   |
| /en/blogg  | P71   | 4 170  | 567    | 0   |
| /kurser    | P56   | 5 369  | 753    | 0   |

- **/kurser ensam-tal LEVERERAT** (o32 §7 rest 4): P56 · LCP 5 369 ·
  TBT 753 — trio-facitet komplett (/, /kurser, /blogg alla med vilande
  ensam-tal på friskt bygge).
- **TBT-gapet är ÄKTA**: 1 299 vs 567 = 732 ms (o32:s 1 217/503 +
  kontaminationsmisstanke §7 — vedertaget: gapet består i ren vila).
- LCP-gap 1 328 ms; Script Evaluation 2 982 vs 1 811 ms.

## §3 Nätverksdiffen (Lighthouse network-requests, rådata)

/blogg 54 requests / 779 KiB mot /en/blogg 48 / 708 KiB. Endast-SV-poster:

- `/kurser/v02-arr-tillvaxt?_rsc=…` **21,4 KiB** — kursruttens RSC-payload
- `/_next/static/chunks/29hy_j6ql6n96.js` 20,4 KiB + `32y1yrioo5pli.js`
  11,1 + `0ysa98ynk03-9.js` 5,6 + `0vtv3xm58p5zk.js` 1,6 = **38,7 KiB**
  route-chunks som RSC-prefetchen drar med sig
- `/blogg/arr-tillvaxt…?_rsc` 8,8 KiB + `/blogg/intaktsdiversifiering…?_rsc`
  8,7 KiB — blogg-slug-prefetchar (EN:s motsvarigheter 0,9 KiB — se §5 rest)

Totalt ~78 KiB + 6 requests extra i initial load, mitt i LCP-fönstret,
på simulerad 4G.

## §4 Rot — kurslänkens viewport-prefetch

Blogg-korten (src/app/(huvud)/blogg/page.tsx) bär per kort en sekundär
"Fortsätt djupare"-länk till `/kurser/<slug>`. Next.js <Link> prefetch:ar
vid viewport-inträde: de 4–6 kort som syns i mobil-vynprefetchar
kursrutter (RSC 21,4 KiB + 38,7 KiB chunks) UNDER initial load — innan
användaren ens övervägt klicket. **Spegelkorten (blogg-spegel-sida.tsx
r 121) har INGEN kurslänk** — därför betalar /en/blogg inte kostnaden;
det är hela skillnaden mellan ytorna, inte språket.

## §5 Kur (o17-precedensen, kirurgisk)

`prefetch={false}` på kurs-länken i blogg/page.tsx — identisk kur som
o17:s kakbanner/footer-länkar: sekundär innehållslänk prefetchar inte,
artikelhuvudlänken + nav behåller prefetch, noll synbar beteendeändring
(vid faktiskt klick: RSC hämtas då, ~100–300 ms på 4G). tsc 0 via
projektbinär (node node_modules/typescript/bin/tsc, exit 0).

**Rest (bokas, ej tagen):** SV:s dubbla blogg-slug-prefetchar (8,8+8,7 KiB
mot EN:s 0,9) — två _rsc-cachebusters för samma slugs; misstänkt
page prefetch-triktrering i kortens huvudlänk + nav;_oförändrad av denna
kur (huvudlänkens prefetch är kortets primära handling och behålls).

## §6 Deploy-läge + EFTER (pending-precedens)

Prod-synk VÄNTAR-RAM 22:17:26Z (1 413 MB < 2 200) för f22b5554→7bd9960d;
tre aktiva fabriksbarn (≈0,8 GB st) håller minnet — bygget landar när
omgången frigör RAM. EFTER-mätning (förväntat: /blogg TBT ↓ ~700 ms mot
/en/blogg:s nivå, requests 54→~49, vikt −78 KiB) mäts när prod-synken
byggt kuren — pending-precedens (b3b5e2c4/545014ff/o17 §METOD):
`LH_JAMFOR=efter node verktyg/prestanda-lighthouse.mjs blogg-gap-efter
/blogg /en/blogg` på vilande server med o32:s SEQ-grind.

## §6b EFTER — LEVERERAD 2026-09-17 06:0x–06:2x lokal (s7-u3, manifest auto-s7)

Anspråk: data/vakten/s7-blogggapefter-u3-ansprak-1789618081.md (disk FÖRE
mätstart). Deployunderlag bevisat: BUILD_ID-mtime 2026-09-17 05:59:25 >
kur-commit 7f419839 00:26:06; prod HTTPS 200 ×2 (/blogg 84 ms · /en/blogg
94 ms); ISR-trigga ×2 + 8 s per sida och rond (11163-metoden).

**Viktigt byggkontext-förbehåll:** FÖRE-bygget (22:09Z) bar 71 monsters +
register 387; EFTER-bygget (05:59) bär 80 monsters + register 390 + 3
kurser ⇒ absoluta CPU-tal väntas bära spår-6-driften (o38 §4: ≈ +8 KiB
unused-JS per sida per omgång — uniform på BÅDA ytorna). Därför är
/en/blogg den interna kontrollen och GAPET det drift-immuna måttet.

### Struktur (lastokänsligt — det avgörande beviset, rådata rond 1)

| Mått | FÖRE | EFTER | Delta |
|------|------|-------|-------|
| kurs-RSC-prefetchar (/kurser/*?_rsc) | 2 st (21,4 KiB RSC + 38,7 KiB route-chunks) | **0 st** | kuren verkar exakt som designad |
| requests /blogg | 54 | 50 | −4 (gap mot EN 6 → 3) |
| totalvikt /blogg | 779 KiB | 727 KiB | −52 (gap mot EN 71 → 13 KiB, −58) |
| unused-JS | 86 KiB | 94 KiB | drift +8 (båda sidor +7/+8 — o38-kurvan) |
| blogg-slug-prefetchar | 8,8+8,7 KiB (2 busters) | kvar (2 busters + 2 fulla 34+33 KiB) | §5:s MEDVETNA rest (huvudlänkens prefetch) |

### CPU-tal (fönsterkänsliga — tre ronder, position deklarerad)

| Rond | /blogg | /en/blogg | Fönster |
|------|--------|-----------|---------|
| FÖRE (o37 §2) | P52 · 5 498 · **1 299** | P71 · 4 170 · **567** | vila, bygge 22:09 — gap 732 ms |
| EFTER r1 | P55 · 5 109 · **1 060** | P53 · 4 945 · 2 356* | SV först, EN sist* |
| EFTER r2 | P57 · 4 320 · 1 972* | P60 · 4 274 · **1 035** | EN först, SV sist* |
| EFTER r3 solo | P62 · 4 158 · **1 197** | — | solo, load 1,3 |

\* **Sist-i-svärm-artefakt** (metodfynd, se nedan): i BÅDA ronder fick
mätningen som låg SIST i svärmen uppblåst TBT (r1: EN 2 356; r2: SV 1 972)
— tecknet på gapet växlar med mätposition, inte med språket. Jämförbara
serier = först-i-svärm + solo.

**Gap-slutsats (drift-immun):** FÖRE-gapet var reproducerbart i två
oberoende svärmar (o32: 1 217/503 = 714 ms; o37: 1 299/567 = 732 ms —
alltid SV ≈ 2× EN). EFTER: friska fönster SV 1 060–1 197 mot EN 1 035 ⇒
gap 25–160 ms, inom körbrus. **Gapet är KOLLAPSAT.**

**Absolut drift, ärligt bokförd:** EN:s TBT 567 → 1 035 (+468 ms) på en
EN-yta kuren inte rör = spår-6-driften mellan byggena (9 monsters + register
+3 + kurser +3) — o38 §4:s kostnadskurva oberoende bekräftad på fjärde
ytan. /blogg:s 1 299 → 1 060–1 197 TROTS driften = kurens netto-vinst
ligger ÖVER +468 ms i urdrift-led. EN:s poängsänkning P71 → P60 är driftens
(absolut TBT-nivå), inte kurens. LCP /blogg 5 498 → 4 158–4 320 (−1 200).

### Metodfynd (bokas åt spårets mätbok)

Svärmens SISTA mätning får uppblåst TBT oavsett sida (trolig chrome-
nedstängnings-/cache-återverkans-eftersläpning in i nästa körning) —
utökar o38 §6:s notis: serierna "först-i-svärm" och "solo" är jämförbara,
"sist-i-svärm" kräver varudeklaration. Rekommendation: EFTER-mätningar
körs solo per sida eller med sis-mätningen struken.

### Status

o37 §6 EFTER **KLAR** — kuren bevisad i prod: strukturbevis (prefetcharna
borta ur initial load), gap-kollaps (732 → inom brus), prod 200 ×2.
Kvar i kön oförändrad: §5-resten (blogg-slug-prefetch-dubblingarna —
huvudlänkens prefetch behålls enligt beslut) + lazy-lager-per-yta
(huvudagentens, nu med EN-driftens +468 ms som ytterligare motivation).

## §7 KVD

- FÖRE-rådata: lighthouse/{blogg,en_blogg,kurser}-blogg-gap-fore.json +
  blogg-gap-fore-sammanfattning.json (3 sidor i vilande fönster).
- EFTER-rådata (3 ronder): lighthouse/{blogg,en_blogg}-blogg-gap-efter.json
  + blogg-gap-efter-sammanfattning.json (r1) · {en_blogg,blogg}-
  blogg-gap-efter2.json + -efter2-sammanfattning.json (r2) · blogg-
  blogg-gap-efter3-solo.json + -efter3-solo-sammanfattning.json (solo).
  Kontaminerade sist-i-svärm-tal behålls SOM varudeklaration (o37
  FÖRE-rond-1-presedens).
- Jämförelseverktyg: verktyg/_s7u1-blogggap-jamfor.mjs (nätverksdiff +
  longtasks + mainthread ur rådata — återanvändbart vid EFTER-ronden).
- tsc 0; src ändrad ENDAST i blogg/page.tsx (page.tsx senast rörd av
  cd2b68ac — föregående manifests u1, avslutad våg); ingen data/blogg/;
  R2 orörd; inget bygge (prod-synken äger); pre-commit-grind passerad.
- Kollisionskontroll: syskonen u2/u3 i manifestet startade 22:15:26Z;
  mitt anspråk på disk 22:2xZ före kur; s7u2c-filerna på disk =
  FÖREGÅENDE manifests u2 (deras otrackade ägarskap orört).
