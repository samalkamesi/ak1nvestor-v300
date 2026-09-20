# Protokoll S2-U1-BP-UTOKNING-OMG23 — Storbritannien/energi 0→1, supermajor-kvintetten komplett

**Manifest:** auto-s2-1789904706844 (byggare 1/3, omgång 23) · **Datum:** 2026-09-20 · **Agent:** s2-u1
**Universum:** 225→226 · **Objekt:** BP p.l.c. (BP.L, LSE-primär, GBX, dec-bokslut, USD-rapportvaluta)

## 1. Koordinatval (anspråk FÖRE arbetet — data/vakten/auto-s2-1789904706844-s2-u1-ansprak.md)

- **Sondering FÖRE val:** cellmatrisen (land×bransch) visade ingen cell på 3–4 ⇒ matta-födslar (
  landaspektsidor) utom räckhåll för +1; högsta värdet = ny cell 0→1 i stor ekonomi ELLER nytt land.
- **Saudiarabien/Aramco 2222.SR sonderades FÖRST** (spårets största saknade magnet, nytt land) —
  **AVVISAD: StockAnalysis saknar Tadawul** (/quote/sar/2222/ = HTTP 404) ⇒ källkonventionen
  (SA primär + Yahoo paranoid) kan ej hållas; dokumenterat här som pivot-underlag.
- **VAL: BP.L** — (a) **supermajor-kvintetten KOMPLETT**: BP · CVX · XOM · SHEL · TTE = världens fem
  klassiska supermajors, alla nu i universumet (SHEL USA-klassad enl. NYSE-primärkonventionen — BP.L
  bär den brittiska raden); (b) **Storbritannien/energi 0→1** = världens 6:e största börsekonomi fick
  energigrenen (UK 5→6 grenar; omg21-u2:s SAN.PA/BA.L-precedensens syster); (c) SA-sidan HTTP 200
  med full data (statistik+financials+balans+kassa+utdelning); (d) P/E-bärande-kriteriet uppfyllt
  (TTM-netto +5 426 M USD — Sony/Honda-fällan bedömd och passerad; FY2025-kanten 5 M dokumenterad).
- **Syskon-koordinater:** u2 (+2) och u3 (+3) dispatchade parallellt; anspråksfilen larmar BP.L +
  övriga UK-celler som mina; inga kollisioner observerade vid append (diskens sista rader var
  omg22:s CMCSA/AMT/CRWD).

## 2. Dataunderlag (källor, båda hämtade 2026-09-20)

1. **StockAnalysis** `/quote/lon/bp/` (+ /statistics/ + /financials/ + /financials/balance-sheet/ +
   /financials/cash-flow-statement/ + /dividend/) — underlag S&P Global Market Intelligence + Fiscal.ai;
   close 2026-09-18 16:30 London.
2. **Yahoo Finance chart-API** `query1.finance.yahoo.com/v8/finance/chart/BP.L` — paranoid kurskoll:
   558,70 GBp mot SA 558,70 GBX = **0,00 % band** (identisk close).

**Valuta-konvention (BA.L/HSBA.L-precedensen):** GBX-pris + GBP-mcap; FY-serier i USD (rapportvaluta).
**FX 1,3267 USD/GBP trippelbevisad** (rev 215 465/162,40 · netto 5 426/4,09 · brutto 60 985/45,96 —
tre ytor, en kurs; SA:s statistics-yta GBP-konverterad mot financials-ytans USD).

## 3. Aritmetikgrind — 18/18 GRÖNA (FÖRE skrivning; verktyg/_s2u1o23-radbyggare.mjs)

Första körningen fångade **1 eget fel** (BP3-enhetskollision mdr/M i P/B-repliken — omg16/omg18-mönstret),
rättat, omkört 18/18. Nyckelidentiteter:
- **BP1** mcap-aktiebas 5,587×15,45 = 86,32 mot 86,33 mdr GBP (0,01 %)
- **BP2** P/E-aktiebas 5,587/0,26 = 21,49 mot 21,51 (0,1 %)
- **BP3** P/B 1,50 på TTM-TOTAL-EK (≈57,6 mdr GBP; FY25-vy 74,0 mdr USD = 55,78 GBP ger 1,548;
  common-basen 53,0 USD ger 2,16 — **BAS-SPLITTRA dokumenterad**, AMT-minoritets-precedensen; BP:s
  minoritetsandel 20,9 mdr USD är oljejättens struktursignatur)
- **BP5/6** marginaler dubbelbevisade i båda valutor (brutto 28,30 % GBP-vit = USD-vit)
- **BP8** FCF-konvention 21,94−9,77 = 12,17 mdr GBP EXAKT; FY-serien 5/5 med varje års OCF−capex EXAKT
- **BP10** prognosTillväxt +166,2 % FORMELLT (fwd 8,08 på deprimerad trailing 21,51 — vändningsmultipeln)
  ⇒ **PEG null** (AMT/CRWD-konventionen; källans PEG 1,01 på 3-års-EPS +9,59 % som not)
- **BP12** resCAGR **−84,0 % formell endpoint** (7 563→5 M USD) — endpoint-fällan på FY2021-cykeltoppsbasen,
  **energigrenens gemensamma (EQNR −44,0 · Ørsted −50,9 · CVX −29,7 · SHEL −25,0)**; konventionen
  bekräftad FÖRE beslut (negativa endpoint-CAGR bär som reella tal hos grenens föregångare)
- **BP16** FX-trippel 1,3268/1,3267/1,3269 · **BP17** aktiebas −5,94 %/år (19 641→15 377 M = −21,7 %)
- **BP18** netto>0 = P/E-bärare på TTM-basen

## 4. Append — kirurgisk (verktyg/_s2u1o23-append.mjs)

225→226, **0 befintliga rader förändrade** (bevis: bit-identisk stringify-prefix), kanonformat
indent 2 (omg20-läxan), readback GRÖN: BP.L sist, land=Storbritannien bransch=energi valuta=GBX.

## 5. Medianer + kvartiler + universumjämförelse (verktyg/_s2u1o23-medianer.mjs, raknaBranschMedianer-replik)

| Yta | FÖRE | EFTER |
|---|---|---|
| **TOTALT P/E** | 20,5 (kv 14,4–29,2, n 215) | **20,6 (kv 14,4–29,1, n 216)** |
| TOTALT P/B | 2,8 | 2,7 |
| **energi P/E** | 17 (kv 12,1–22,2, n 19) | **17,3 (kv 12,4–22, n 20)** |
| energi P/B | 2,3 (kv 1,8–3, n 20) | 2,3 (kv 1,5–2,9, n 21 — **BP 1,50 = ny P25-ände**) |
| energi FCF-marginal | 10,5 % | 9,7 % |
| energi resCAGR | −15,1 % (kv −28,6–3,5, n 18) | −16,4 % (kv −36,9–2,2, n 19) |

**BP i grenen:** P/E-trappan rank 14/20 — mellan XOM 21,153 och ENEL 21,874; över grenens median
17,3 (+4,2) och över universummedianen 20,6 (+0,9), under grenens P75 22,0. P/B 1,50 = grenens
näst lägsta (PBR 1,39 under). **Universumjämförelseraden: trailing-dyr mot framåtblickande billig —
fwd 8,08 under TTE 11,32 och SHEL 10,27 = kvintettens lägsta framåtblickande multipel.**

## 6. llms.txt HELREGEN (verktyg/_s2u1o23-llms-regen.mjs — omg22-kroppen ordagrant)

Sektionen ombyggd på 226-läget: huvudrad 225→226 + totalt 20,5→20,6 (n 215→216); energi-raden
20→21 bolag, P/E 17→17,3, kv 12,1–22,2→12,4–22 (n 19→20); finans-aspektradens universum-n 183→184
(BP:s numeriska resCAGR); samtliga övriga branschrader enbart jämförelsetal-uppdaterade (konsistent
helsektion). **Prod round-trip LIVE:** curl bär "226 bolag … totalt median P/E 20,6 (n=216)" —
disk == prod.

## 7. Läckagevakt v3 — GRÖN, 0 träffar (verktyg/_s2u1o23-lackagevakt.mjs)

401 sökningar (226 bolags namn+tickers); dataset-html-ytan 0 filer i aktuellt .next-läge (OOM-loopens
lägebackup — ärligt bokfört), llms.txt Dataset-sektionen bevakad = 0 träffar.

## 8. Prod-sond — 200 × 2 + dokumenterat infra-tillstånd

- `https://lab.ak1nvestor.com/` = **200**
- `https://lab.ak1nvestor.com/llms.txt` = **200 LIVE på 226-läget** (round-trip ovan)
- `/dataset` + `/dataset/energi` = **500 — FÖRELIGGANDE, EJ min leverans**: InvariantError "client
  reference manifest for route /dataset does not exist" (även /_not-found slår 500 = manifestproblem
  på routenivå, oberoende av datainnehåll; samma felklass dokumenterad 2026-09-14). **Rot:
  prod-synkens OOM-loop sedan 10:40-idag** (data/vakten/prod-synk.log: upprepade "bygg OOM-dödat …
  .next ÅTERSTÄLLD ur läkebackup", senast 11:57 VÄNTAR-RAM <2500 MB med zcode-barn aktiva) — byggen
  ägs ENDAV prod-synk/kraschvakten (fabriksregler + Vonovia-precedensen: jag bygger ALDRIG).
  Efterlämnat till synkens nästa poll när RAM frigjorts (fabriksbarnen som slutar ÄR frigörandet);
  worklog-notisen bär larmet vidare till rund/styrelse.

## 9. KVD-sammanfattning

GRÖN: aritmetik 18/18 i abort-grind FÖRE skrivning (1 eget fel fångat) · append kirurgisk bit-identisk
prefix · llms HELREGEN idempotent på diskens läge · läckagevakt 0 · prod 200 × 2 (/, /llms.txt LIVE
226) · R2 orörd · data/blogg/ orörd · src orörd = INGET bygge (Vonovia-precedensen; tsc ej aktuellt
— ingen kod berörd) · anspråk gitignorerad (omg14-läxan).

## 10. FIFO

BP nästa rapport **2026-10-30** (Q3), ex-dag 2026-08-13 passerad, senaste kvartalsutdelning
deklarerad; supermajor-kvintetten komplett ⇒ nästa koordinat-förslag i spåret: Saudiarabien endast om
källkonventionen kan hållas (Yahoo-endast avvikarkräver styrelsenot), annars UK-celler mot matta 5
(VOD.L kommunikation 0→1 närmast) eller nya länder med SA-täckning (Österrike vie/OMV, Irland ie/KYGA).
