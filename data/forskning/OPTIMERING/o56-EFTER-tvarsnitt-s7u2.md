# o56-EFTER — oberoende tvärsnitt av s7-u2 (vakarövertag, Spår 7)

**2026-09-18 ~06:4x–07:0x lokal · omgång auto-s7-1789706100114 (byggare 2/3)**
**Status: o56-EFTER BOKFÖRD i detta dokument — huvudposten bevisad,
omgång 2-rot identifierad (o63). Kollisionsnotis: en första bokföring
gjordes som §5-edit i u3:s o56-protokoll men togs bort i u3:s commit-
fönster (5ed8c48a/03cd57a0) — därför detta EGET tvärsnittsdokument enligt
o54 §0b-precedensen; u3:s protokoll lämnas härefter orört.**

Anspråk: `data/vakten/s7-o61-palettvakt-u2-ansprak-2026-09-18.md`
(klaim o61 06:39:19 → PIVOT till o56-EFTER 06:53 efter förlorat race mot
s7-u3:s 06:38:03 — Ö5-precedensen; lasy-global.tsx/src lämnad orörd).

## §1 Mätning

`verktyg/prestanda-lighthouse.mjs s7u2o61-fore / /kurser /blogg` —
etiketten "o61-fore" är mitt förlorade klaim-namn; mätningen är en ren
trön-öre-mätning av aktuellt build och är här EFTER-underlag för o56
(kur deployad sedan 23:10:02Z, BYm2zh; mätning på **stE6SStz** = tre
byggen senare — kuren generationsstabil i develop). Solo-fönster load
0,53. Rådata: `lighthouse/{start,kurser,blogg}-s7u2o61-fore.json` +
`s7u2o61-fore-sammanfattning.json` (otrackade tills denna commit).

| Kriterium (o56 §5-förväntan) | FÖRE | EFTER (stE6SStz) | Dom |
|---|---|---|---|
| / `_rsc` totalt | 5 | **3** (alla `/kurser?_rsc`: 0,8 + 8,7 + 26,5 = 36,0 KiB) | ✓ delvis — `/logga-in` ×2 BORTA |
| / requests | 45 | **38** | ✓ (bättre än förväntan 40) |
| / transfer | 633,1 KiB | **590,8 KiB** (−42,3) | ✓ (bättre än ~595) |
| /kurser `_rsc` | 0 | **0** | ✓ orörd (stabilt sedan o49–o52) |
| /blogg `_rsc` | 0 | **0** | ✓ orörd |

Poäng/tal-kontext (band, ej kriterier): / P61 · LCP 5 162 · TBT 675 ·
CLS 0 · SI — /kurser P57 · LCP 5 302 · TBT 1 074 · CLS 0 — /blogg
P66 · LCP 4 979 · TBT 610 · CLS 0. (Konvergerar med u3:s o61-FÖRE
P64/56/65 — samma build, olika fönster.)

## §2 Dom + omgång 2-rot (o41-disciplinen)

**o56-kurens huvudpost är bevisad i prod**: herons två knappar ägde
`/logga-in` ×2 — borta. MEN `/kurser` ×3 (36,0 KiB) är bitidentisk med
FÖRE (s7u1o54-fore: 0,8+8,6+26,1) ⇒ den ägdes ALDRIG av knappen.
o56 §3:s attribuering var delvis fel; ägaren är herons TREDJE länk:
**textlänken i mikro-raden** (`sections/home-section.tsx` ~rad 526,
`home.slutTitta` → `/kurser`, i hero = alltid i viewport, UTAN
`prefetch={false}`). Multiomgång ×3 på en länk = o50 §2:s ISR-mönster,
oförändrad mekanism. Kvarvarande spill: 36,0 KiB + 3 requests per kall
entrévisning.

## §3 Ny köpost — o63 (namnrymd fri; o62 reserverat av s7-u1:s
läsbarhet-anspråk 06:41)

**Kurs-idé:** `prefetch={false}` + precedenskommentar på mikro-radens
`/kurser`-textlänk — identisk kirurgi som o56 §3 (o17/o41/o49/o50/o51-
familjen). **Förväntan:** / `_rsc` 3→**0** · requests 38→**35** ·
transfer 590,8→**~555 KiB**. Bonus-kontroll vid EFTER: ev. övriga
viewport-`/kurser`-länkar (stig2-kortet ~rad 205 ligger under vecket;
header-nav på datorvy).

## §4 Ärlighet

- Mätningen är 10 min äldre än bokföringen; etikett-namnet (o61-fore)
  dokumenterar sitt ursprung — inga tal har räknats om, endast lästs ur
  rådata med rätt tidsfält (`rendererStartTime`; en tidigare sond i
  mitt fönster läste icke-existerande `startTime`-fält = falska 0,00 s,
  rättat innan slutsats).
- u3:s o61-kur (PalettVakt tvåstegs) satt i ARBETSYTAN (ocommittad) vid
  min mätning men INTE i build stE6SStz — påverkar ej detta tvärsnitt;
  deras EFTER-mätning får eget fönster.
- Gåva till u3: residualvågs-kvantifieringen ur min trion (42 K på /
  vid 1,4–2,3 s · 15 K på /kurser+/blogg vid 0,9–1,3 s; chunkarna
  signaturverifierade: 3-bylxy1ipbmj palett · 3shx2ovyp1fwu streak/
  besök · 2iy81ex7whhmo badges · 0llgol0db2t3z palett-tillbehör) —
  deras FÖRE-tal konvergerar med den.
- src orörd av mig; R2 orörd; data/blogg/ orörd; inga byggen.
