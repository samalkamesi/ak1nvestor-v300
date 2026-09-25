# V173 dataset-djup — U22: AROUNDTOWN SA AT1.DE (Tyskland/fastighet, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 218 · **Föregångare:** U1–U21
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo — Tyskland/fastighet-cellens **två hyresvärdmodeller**:
Vonovia (VNA.DE, bostadsjätte ~490k lägenheter) + Aroundtown (AT1.DE, kommersiell
diversifierad: kontor/hotell/logistik/bostad). **P/E-bärarkontroll FÖRE leverans:
TTM-netto 403,4 M EUR > 0 — GRÖN.** Kollisionskontroll exakt-match GRÖN.

## KÄLLDATA (StockAnalysis ETR AT1, hämtat 2026-09-25 + TRE kompletterande panelhämtningar)

ETR-primär i EUR. Pris 1,70 EUR (intradag; föregående close 1,710); mcap 1,90 mdr på
1,13 mdr aktier. Land=Tyskland på **ABB-precedensen** (schweiziskt bolag Stockholm-noterat
= Sverige i universumet): notering/verksamhetsprincipen — Lux-SA med Frankfurt-notering
(MDAX) och tysk portfäljkärna.

**Räntechockens tvillingkurvor:** netto [−645,1 · −1 988 · 52,9 · 665] — SAMMA förlustår
2022–2023 som Vonovia i samma cell (värderingsskrivningarna) och vändning 2024–2025
(Vonovia: −643,8/−6 285/−896/+3 723). **resultatCAGR NULL på negativ bas** — Vonovia-
precedensen i samma cell: vändningsåren döms ALDRIG med CAGR. Rak 3-årig oms-CAGR −1,21 %.

**Sex replikeringslås (starkaste i vågen):** P/B 0,13 EXAKT (1,90/14,65 totalt-EK-bas) ·
PS 1,22 EXAKT · netto-M 25,89 % EXAKT mot finanspanelens TTM-rad · FCF-yield 0,86 % DUBBELT
LÅS (16,3/1 900 mot källrad OCH 1/P·FCF 1/116,82) · FCF-M 1,05 % EXAKT · D/E 1,04
(15,17/14,65) + mcap 1,1 %. P/E 4,57 källans rad EPS-låst (1,70/0,37 = 4,59); GAAP-repliken
4,71 och EPS×aktier-avrundningsfönstret (3,7 %) noterade öppet.

**Tre fönsterdokumentationer:** (1) **FCF-DUBBELBAS** — kapex-dragen TTM 16,3 M (OCF 795,6 −
capex 779,3, fastighetsförvärv i posten) mot källans FCF-SERIE som är ett OCF-dubbelt
(788/772/820/808 = OCF-raderna) ⇒ serier.fcf lämnas TOM på VNA-konventionen (samma cell).
(2) **EV-DEKOMPOSITIONEN** — källans EV 15,48 mdr = mcap 1,90 + skuld 15,17 − kassa 3,80 +
preferensaktier ≈ 2,21 mdr (2023-emittensen — kapitalstrukturposten; EV/EBIT 16,59 replik ·
EV/EBITDA 16,26 källrad). (3) **netto-M-baserna** — 25,89 % attributable (403,4) mot
statistics-sidans 38,48 % total-netto (599,6 inkl. minoriteter; cash-flow-panelens netto-rad
= samma fönster). BVPS-raden 7,54 (mot totalt EK/aktie 12,97) noterad som annat fönster.

**Modellnoter:** ROIC 3,10 % > WACC 2,54 % (källans båda rader — WACC låg pga
kapitalstrukturens preferens/eget-andel) · Debt/EBITDA 15,93 + räntetäckning 3,42 =
fastighetsbelåningens balans (datafakta) · Altman n/a i källan · Piotroski 4 · beta 1,31 ·
**dividendseriens brott FY2022–FY2024** (paus efter räntechocken) med återupptagning FY2025
0,08 EUR (4,75 %) på EPS-payout 21,6 % (FCF-payout 554 % — kapex-basens bidrag dokumenterat) ·
aktieantalet oförändrat YoY (−0,01 %) ⇒ nyemissioner 0; QoQ −3,74 % = återköpsfönster;
insiderägande 13,67 % · 52-veckorsförändring −47,25 % — fastighetstvätten som datafakta.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 283→284 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T · två enhetsbuggar i skriptet fångade av grindsystemet FÖRE append (mcap mdr/M + PS-bas — rättade innan diskröring) |
| llms HELREGEN (diskdrivet, tjugonde körningen) | GRÖN 284-läget · K2 round-trip · fastighet-raden n=18 (median P/E 12,9) · totalt n 271→272 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 284 bolag · 511 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (AT1.DE), kirurgisk append 283+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 284-läget
- `verktyg/_r218-u22-*.mjs` — sond/inlägg/avslut + llms-regen/lackagevakt (systuga-mallarna)
- `data/forskning/V173-U22-AT1-AROUNDTOWN-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 218-rad

## KÖ

1. Tysklands sista 1-gren: material (BAS + kandidatkartläggning nästa rond).
2. Omprövningar: Astellas 4503.T + Kirin 2503.T (TTM-vändningsvillkor dokumenterade).
3. Rappdagarna 10-20→11-04 → v172-kön (AT1 nästa Q3 est. november med vid kalenderberöring).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; räntechockens förlustår och vändning dokumenteras
som mönster (annars feltolkas P/B 0,13 och direktavkastningen som signal utan kontext);
FCF-dubbelbasen, EV-preferensposten och dividendbrottet är ärlighetsprincipen — källans
egna rader redovisas med sina fönster, aldrig gallrade. Analytikermål/rekommendationer
syndikeras aldrig (S7-regeln).
