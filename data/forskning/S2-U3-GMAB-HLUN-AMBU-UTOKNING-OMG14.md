# Protokoll S2-U3 — GMAB + HLUN.B + AMBU.B-utökning (omgång 14, manifest auto-s2-1789715100341)

Fabriksagent s2-u3 (spår 2 byggare 3/3), 2026-09-18. Anspråk FÖRE arbetet:
`data/vakten/auto-s2-1789715100341-s2-u3-ansprak.md` (07:15 UTC / 09:15 lokal,
E29-lärdomen — u1:s och u2:s anspråk landade 09:08/09:14 lokal, noll
koordinatkollision: u1 = USA/material, u2 = Sverige/tillväxt).

## Objekt och val

Manifestets "+3 bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200".
Uppgiften är omgångens enda +3 = den enda som kan ta en 2-mätbar-cell till 5.
Mattan mätt maskinellt på 171-läget: åtta celler på exakt 2 P/E-mätbara, INGA på
3–4 (⇒ u1/u2 kunde inte öppna celler — deras val blev FCX resp. KLAR+BOOZT).

VAL: **Danmark/halso — Genmab (GMAB) + H. Lundbeck (HLUN.B) + Ambu (AMBU.B)**
⇒ cellen 2→5 P/E-mätbara (Novo 11,795 · Coloplast 38,653 + GMAB 26,13 ·
HLUN 10,75 · AMBU 34,12) = **median 26,13, kvartiler P25–P75 11,8–34,1**
(kontraktets percentilkonvention) — cellens interna spridning 2,9× = kvartil-
pedagogikens levande material: CNS-farma (10,8) mot tillväxtbiotek (26,1) mot
medtech (34,1) mot kontinensvård (38,7).

**NY LANDASPEKTSIDA /dataset/halso/danmark föds** — och leveransen bär själva
kodvägen: land.ts utökad med en **danmark-modul** (spårets FÖRSTA landmodul
utanför sverige/usa, omg11:s "/dataset/energi/norge"-miss-tags omöjliggjorda:
generationen kräver modulen). Kontraktstestet bevisade födelsen direkt:
177→178 sidkontroller (0 fel); sitemap plockar sidan automatiskt via
aspektParametrar (data-drivet, ingen sitemapfil rörd). Publicering vid nästa
prod-bygge (Vonovia-precedensen; 404 på prod tills dess — verifierat).

ÄRLIGHETSFIX i samma modul: ingressens åldrade parentes "(10 branscher × 10)"
borttagen — rader.length är 177 och texten sa 100-bolagsdesignen; s1-granskningens
"universumglidning"-flagga delvis kurerad på landsidorna.

## Källor

StockAnalysis (S&P Global Market Intelligence + Fiscal.ai-underlag):
- GMAB: /stocks/gmab/ + /statistics/ + /financials/ + /financials/cash-flow-statement/
  (close 2026-09-17 16:00 EDT 34,54 $; sidor "updated aug 6 / checked sep 13").
- HLUN.B: /quote/cph/HLUN.B/ + /statistics/ + /dividend/ + A-aktiens översikt
  (intraday 2026-09-18 09:22 CET 42,92 DKK; data-uppdaterad 2026-09-17).
- AMBU.B: /quote/cph/AMBU.B/ + /statistics/ + /financials/ (intraday 09:13 CET
  65,65 DKK; financials "updated aug 25 / checked sep 16").

**CACHE-FYNDET (VIT-B-klassen, utvidgad till CPH-panelerna)**: web_reader-kanalen
servade ÅLDRIGA HLUN-paneler — statistics daterad "Dec 12, 2025" (pris 35,15,
P/E 10,85) och financials med senaste kolumn "TTM Sep '24" — även med no_cache.
WebFetch-kanalen levererade färskt (pris 40,00/42,92 DKK matchar Yahoo-close
39,45 + intraday; källans "+11,93 %"-tillväxt korskollar FY2024-härledningen).
Stämpelkontroll är OBLIGATORISK för CPH-hämtningar; de åldriga sidornas fasta
historiska årsfigurer (FY2019–2023 brutto, FY2021–2023 oms/vinst) användes endast
till moat-serien/serier med vintage-notis i radens paranoid.

## Signaturtal (pedagogiken)

- **GMAB**: ROYALTY-GLIDNINGEN 100,0 → 98,6 → 95,4 → 93,6 % brutto FY2022–2025
  (moat-medel 96,9 %, spread 6,4 pp — vallgraven är licensavtalet, inte produkten);
  FY2025-förvärvet −7 215 M$ vänder kapitalbalansen till NETTOSKULD 3,76 mdr
  (EV 24,37 = 20,59 + 3,76 EXAKT); TTM-kontrast intäkt +22,3 % mot vinst −37,9 %;
  ROIC 12,07 mot WACC 7,35 = +4,7 pp; prognosTillväxt +25,1 % TTE mot källans
  3-årsprognos +20,1 % (ovanligt väl kalibrerat, RY-klassen); PEG 1,04 spår
  (källans n/a); EPS-PANELGLIDNING i källan dokumenterad (statistics "1,27" mot
  financials 12,65; aktier 59,70 M ⇒ 13,2 $ — P/E internt konsekvent 26,13).
- **HLUN.B**: TTE-GAPET +54,0 % (P/E 10,75/fwd 6,98) mot 3-års-EPS-prognos
  +2,7 % = normaliseringsgap-listans nya topp (PSA/DNO-klassen; PEG 0,20 som
  gap-mått); UTDDELNINGSTRAPPAN 0,58→0,70→0,95→1,15 DKK (+21,05 % senaste) på
  payout 29,0 % medan intäktsprognosen står stilla (+1,11 %/år); RÄNTETÄCKNING
  405,5× vid nettoskuld 7,22 mdr (EV 48,85 = 41,63 + 7,22 EXAKT); FCF 5 220 M
  TTM = fcfYield 12,54 % (ELVA HÖGSTA av 160 mätta — superlativtestad rank);
  brutto 82,06 % TTM; ROIC 13,67 mot WACC 4,64 = +9,0 pp; B-aktien 42,92 mest
  omsatt med A-aktien 40,00 som kontrollklass.
- **AMBU.B**: VÄNDNINGSTRAPPAN netto 247→93→168→235→609 M DKK FY2021–2025
  (+25,3 %/år endpoint; FY2022-botten 93 M vid EBIT 2,74 % efter COVID-testfallet);
  ROIC 9,04 UNDER WACC 11,69 = −2,7 pp (ARM-klassen — kontrast mot Lundbecks
  +9,0 pp I SAMMA CELL); NETTOKASSA 126 M (EV 16,97 under mcap 17,10 — cellens
  enda nettokassa); insiders 20,45 % (grundarfamiljen Obels krets); 52v −32,41 %
  med beta 1,39; FY slut SEPTEMBER (okt–sep, slutårsetikett — tredje
  årskonventionen); PEG 0,69 spår mot källans 0,75; prognosTillväxt +49,8 % TTE.

## Medianer + kvartiler (kodvägsreplik, exakt raknaBranschMedianer)

- **Danmark/halso-cellens landstal** (nya landsidans tabell): P/E median 26,1,
  kvartiler 11,8–34,1, matta 5 — plus P/B/EBIT/FCF/tillväxt med egna mattor.
- **Hälsa (branschraden)**: 16→19 bolag; P/E 24,8→25,5 (kv 20,4–37,4 → 19,9–35,7,
  n 15→18); P/B 4,4→3,5 (Lundbecks 1,55 drar); EBIT 27,7→26,2 %; FCF 14,1→14,3 %;
  tillväxt 4,9→5,2 %.
- **Totalt**: median P/E 20,8→21,2 (n 164→167 av 174→177 — GMAB+AMBU över,
  HLUN under medianen); aspektradens universum-resultatCAGR 3,5→4 % (n 135→138).
- llms.txt Dataset-sektionen HELREGEN ur kodvägen: diff 14+/14− KIRURGISK
  (intro+huvudrad+totalräknare+räknare i tio branschrader, hälsoradens sex tal,
  aspektradens universumtal); övriga branschvärden byte-identiska — konvergens
  med u2:s 174-regen (samma kodväg, två körningar).

## Maskinella kontroller

1. **Append-skript** `verktyg/_s2u3o14-append-gmab-hlun-ambu.mjs`: aritmetik
   42 kontroller + 3 serielängdskontrakt GRÖNA med ABORT-GRIND FÖRE skrivning
   (omg13-läxan) — TTE ×3, PEG-spårkonvention ×3, CAGR ×6, direktavkastning ×2,
   payout ×2, fcfYield/fcfMarginal ×6, EV-replik ×3, EV/EBIT-replik ×3,
   moat medel/spread ×6, HLUN FY2024-härledningar ×2, AMBU FCF-seriens 5
   derivationskontroller. **Eget fel FÅNGAT FÖRE skrivning**: FY2024-rev
   22 010 stred mot härledningen 24 630/1,1193 = 22 005 (grinden stoppade;
   korrigerat och omkört).
2. **Superlativtest före leverans** (seriens systemläxa — 8 fynd på sex filer i
   granskningsspåret): tre prosa-påståenden i HLUN-noteringen korrigerade —
   kvartilparen "ca 11,2–36,4" → 11,8–34,1 (percentilkonventionen: n=5 ger
   P25=s[1], P75=s[3]); "bland universumets högsta" fcfYield → "elva högsta av
   160 mätta" (rank beräknad); "kvartilpedagogikens renaste exemplar" → "ett av
   … renaste exempel" + beta "bland de lugnaste" → "lugnare kvartil" (beta finns
   bara i prosa — rank inte maskinellt bevisbar).
3. **Kontraktstest** (tsx ur npx-cachen via node — ingen installation):
   178 sidkontroller / 0 fel / 30 kända varningar. 177→178 = /dataset/halso/
   danmark FÖDD data-drivet; "Ej genererade" 3→12 = danmark-modulens 9
   branschgrenar under MIN_MATTA (gränsregeln, ej fel — dubbelgrinden).
4. **Läckagevakt** v98: GRÖN 0 träffar — 177 tickers + 177 namn i 1 531
   utdatafiler.
5. **tsc** via projektbinär `node node_modules/typescript/bin/tsc --noEmit`:
   0 fel. src/ RÖRD (land.ts — Write/Edit-kanalen; Write-verktyget) = INGET
   bygge körs av mig (ALDRIG; prod-synken/kraschvakten äger byggena).
6. **prod 200 ×6**: / · /dataset · /dataset/halso · /dataset/halso/pe ·
   /api/data/nyckeltalsguide · /llms.txt — llms LIVE på 177-läget round-trip-
   bevisat ("fasta universumet på 177 bolag" + hälsoraden "19 bolag … P/E 25,5").
   /dataset/halso/danmark + /bolag/gmab = 404 = väntar prod-bygget
   (Vonovia-precedensen).

## Race (omg14 fullständigt: tre leveranser, tre koordinater)

- u1 FCX committad 7ffd73e6 (171→172, USA/material — deras meddelande såg mitt
  anspråk: "u3: Danmark/hälsa-trion … öppnar /dataset/halso/danmark hos dem").
- u2 KLAR+BOOZT committad 7b122639 (172→174, Sverige/tillväxt; deras
  landmatta-rättning "publiceringsgrind = P/E-mattan" bekräftar min celllogik).
- Jag: källfönstret 07:15–09:20 lokal på 171-läget; append körd på 174-läget
  (EFTER u2:s commit) — idempotent, 0/174 gamla rader förändrade
  (innehållsidentitets-bevis i skriptutdata); universum 174→177, llms 177.
- Slutinvariant MITT ansvar: universum == llms == HEAD == 177 (post-commit
  verifierad; BASF-precedenten tillämpas automatiskt — den som skriver äger,
  den som bär bokför).

## Notiser åt dataägaren / nästa omgång

1. **/dataset/halso/danmark publiceras vid nästa prod-bygge** — första icke-
   S/USA-landsidan; när nästa land når 5 mätbara krävs motsvarande modul
   (schweiz/tyskland/norge-mönstret danmark-modulens kusin).
2. **CPH-cache-klassen**: web_reader + HLUN = åldriga paneler även med no_cache;
   WebFetch färsk. Stämpelkontroll per sida; åldriga årsfigurer endast med
   vintage-notis.
3. **GMAB EPS-panelglidning** (källans interna 1,27/12,65) dokumenterad i raden.
4. **HLUN serier.fcf tom** (färsk FCF-flik ej nåbar via kanalen; TFM/TMM-värdet
   + EV/FCF-kors dokumenterade); FY2024-talen härledda ur tillväxtprocenter.
5. **Kvarvarande +3-öppningsbara 2-celler** (177-läget, räknat före mina rader):
   material/Norge · material/Finland · Schweiz/halso · material/Australien ·
   konsument/Tyskland · Nederländerna/teknik · Finland/energi — var och en
   behöver +3 P/E-mätbara OCH en land-modul för landsida.
6. **FIFO-rappdagar**: GMAB 2026-11-05; HLUN nästa ej listad (senaste 2026-08-19
   H1); AMBU senaste 2026-08-26 (Q3 FY25/26).
7. **u1:s koordinat lever**: +3 rena USA-materialbolag (ECL/SHW/NUE/DOW-klassen)
   öppnar /dataset/material/usa utan ny modul (usa-modulen finns) — nästa +3:s
   snabbaste landsida.
