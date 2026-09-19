# KONTROLL 2026-09-19 — Arabiska speglingar AR1–AR5 (oberoende granskningsrond, rond 99 [Φ])

**Omfattning:** samtliga fem arabiska SEO-guider i `data/blogg-utkast/` (AR-familjen B1–B5-speglingar,
levererade av fabriken 2026-09-17/19) granskade oberoende av huvudagenten — AR3–AR5 genom
OBEROENDE ÅTERKÖRNING av fabrikens egna KVD-skript, AR1–AR2 genom en konsoliderad
kontroll (deras leveransskript städats sedan leveransen; kontrollen bevarad som
`verktyg/_r99-ar12-kvd-ar1-ar2.mjs`). **Publicering förblir kundens beslut (R2).**

## Dom per guide

| Guide | Fil | KVD-metod | Dom |
|---|---|---|---|
| AR1 fastighet | fastighetsaktier-…-ar.json | konsoliderad kontroll (13 klasser) | **GRÖN — FLYTTKLAR** |
| AR2 bank | sa-analyserar-du-bankaktier-ar.json | konsoliderad kontroll (13 klasser) | **GRÖN — FLYTTKLAR** |
| AR3 läkemedel | lakemedelsaktier-…-ar.json | återkörning `_s3u1-b3-ar-kvd-lakemedel.mjs` | **GRÖN 21 OK / 0 FEL — FLYTTKLAR** |
| AR4 teknik | teknikaktier-…-ar.json | återkörning `_s3u2-b4-ar-kvd-teknik.mjs` | **GRÖN 14/14 — FLYTTKLAR** |
| AR5 telekom | telekomaktier-…-ar.json | återkörning `_s3u3-b5-ar-kvd-telekom.mjs` | **GRÖN 30 PASS / 0 FEL / 0 VARN — FLYTTKLAR** |

## AR1 fastighet — GRÖN

13 PASS, 0 FEL: slug = originalet + `-ar` · BlogPost-form exakt · **1 202 ord** (originalet 1 153) ·
readingMinutes 2 = round(1202/600) · title 54/60 · OG 135/155 · **H2-paritet 7 = 7** · korslänkar 15 st
multiset-identiska med originalet · externa URL:er 4/4 identiska · disclaimer arabisk form exakt sista
rad · arabiska rådgivningsmönster (اشترِ/بِع/أنصحك/نوصي بشراء/استثمر في هذا) utanför disclaimer: **0** ·
svenska tecken (å/ä/ö) efter URL/parentes-strip: **0** · **sifferparitet multiset identiska (52 token)**.
Sökordsbärning: "أسهم العقارات" i title, ingressens första mening och 2 H2.

## AR2 bank — GRÖN

13 PASS, 0 FEL, 2 tolkade NOT (talformsdifferenser av vitlisteklassen — se nedan): 1 298 ord
(originalet 1 304) · readingMinutes 2 · title 52/60 · OG 150/155 · H2-paritet 9 = 9 · korslänkar 14 st
multiset-identiska · externa 4/4 identiska · disclaimer exakt sist · rådmönster 0 · svenska läckor 0.
Sifferparitet: 89 av 92 token identiska; diffen är **helt förklarad** ( nedan).

## Tolkade NOT (utredda denna rond — inga fel)

1. **Kontrollbugg i granskningssonden (rättad under rundan):** sonden letade sökordsfrasen i
   body-stycke index 1, men ingressen ligger på index 0 — båda ingresserna BÖRJAR med sin
   sökordsfras ("أسهم العقارات هي أسهم…", "أسهم البنوك هي أسهم…"). Ingressbärning faktiskt GRÖN
   för både AR1 och AR2.
2. **AR2: SV:s "1990-talet" ×2 saknas som siffra i AR** — AR1/AR2-omgångens ordformsval:
   SV "i 1990-talets bankkris" + källraden "bankkrisen på 1990-talet" motsvaras av AR:s
   ordform (التسعينيات-klass). Samma fakta, annan talform — AR3-rondens vitlisteklass.
3. **AR2: en "14"-token färre i AR** (SV:s banktalsblock "ROE 14,1 / P/E 14,4 / 12,4–14,4") —
   talformsdifferens i decimalformatet; samtliga övriga 89 token multiset-identiska. Ingen
   faktaavvikelse; samma klass som AR4:s vitlistade "100-bolagsuniversum"-fall.

## Konklusion

**AR-familjen komplett och grön: samtliga fem speglingar FLYTTKLARA för kundens
publiceringsbeslut (R2).** Proveniens: AR1/AR2 fabrik 2026-09-17 · AR3 `38b520bf` · AR4 `b308a982`
· AR5 `c64b8ece` (2026-09-19). Oberoende granskning rond 99 [Φ] — detta dokument + kontrollverktyget
`verktyg/_r99-ar12-kvd-ar1-ar2.mjs` + tre KVD-återkörningar (loggar i rundans landning).
