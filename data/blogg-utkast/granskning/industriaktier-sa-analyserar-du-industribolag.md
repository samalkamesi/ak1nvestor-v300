# KONTROLL 2026-09-17 — industriaktier-sa-analyserar-du-industribolag.json (B6)

**Granskare:** s1-u1, agentfabrik auto-s1-1789649728193 (1/3). **Byggd:** s3-u2 2026-09-15 20:58 (rad 11078).
**Objekt:** SEO-branschguide B6 — industri, 1 250 ord (title+desc+body), 9 H2.
**Dom: FLYTTKLAR EFTER TVÅ RÄTTNINGAR (B1+B2)** — publicering väntar kunden (R2).

## PIVOT-bokföring (köregeln, femte omgången med samma mönster)

Uppdragets ordagrunda objekt "m9-utkast #1" (boerspsykologi-fallstugor) är komplett
levererat sedan 2026-09-16 (s1-u1 våg 1789537520972: KONTROLL-rapport + maskinell
diff; huvudgranskning redan 09-14). **Hela m9-serien 6/6 granskningsklar sedan
09-16 14:35** (8448ef77). Duplikatregeln tvingade pivot — syskonen i de tre
föregående omgångarna pivoterade på samma sätt (u1→energiaktier/ravarubolag,
u2→Industrivärden/Nordea, u3→NIKE/Holmen).

**Val:** industriaktier = FIFO-förstavalet bland ogranskade B-guiderna (B6, byggd
09-15 20:58 — äldsta ogranskade branschguiden; finansbolag/hälso/skuldsätt är
yngre samma kväll). Syskonens dokumenterade valmönster = kvartalspaket efter
tidigaste rappdag (NP3 10-16 förutsagt som deras troliga val) ⇒ rotguide-FIFO
minimerar kollisionsrisken. Anspråk skrivet 15:00:04 lokal FÖRE arbetet
(data/vakten/auto-s1-1789649728193-u1-ansprak.md); 0 syskonanspråk för omgången
fanns vid valet. De tre nyaste utkasten (14:41 idag) saknar worklog-bokföring och
lämnades åt byggaragentens egen omgång — ingen granskning av pågående bygge.

## Siffror mot rådata — 7/7 medianpåståenden VINTEXAKTA

Källa: `data/portfolj-system/bolagsunivers.json` git **0e399f13** (2026-09-15
20:31) = byggtidens träd (115 bolag, industri n=12: ABB, Alfa Laval, ASSA,
Atlas Copco, Eaton, GE Aerospace, Hexagon, Industrivärden, Sandvik, SKF,
Skanska, AB Volvo — utkastet nämner SAMTLIGA 12, 0 påhittade bolag).

| Utkastets tal | Sondens beräkning | Dom |
|---|---|---|
| Median-P/E 28 | 28,005 (n=12) | EXAKT |
| universumets 20,2 | 20,249 (n=106) | EXAKT — korsbekräftad av Nordea-granskningens 20,2 på samma vintage |
| EBIT-marginal 16,9 % | 16,89 % | EXAKT |
| FCF-marginal 10,8 % | 10,79 % | EXAKT |
| omsättningstillväxten 8,4 % | TTM-median 8,4 % | EXAKT (C1: mätperiod ej angiven — CAGR5-medianen är 4,1 %) |
| kvartilspridning 18,2–35,8 | 18,16–35,79 (linjär interpolation) | EXAKT |
| P/B 4,9 | 4,944 | EXAKT |

Bolagsfakta: "GE Aerospace" och "Eaton" = exakta namnfält i rådata;
Industrivärden korrekt identifierat som investmentbolag i branschen (substanskalkyl,
inte ordercykler — länkar till km-067). "Rådata 2026-09-15" angivet i texten ✓.

## Aritmetik — 6/6 gröna

- Book-to-bill: 11 mdr order ÷ 10 mdr fakturerat = **1,1** ✓
- Cykelexempel topp: 10 mdr × 15 % = **1,5 mdr** ✓
- Cykelexempel botten: 10 × 0,85 = **8,5 mdr** × 8 % = 0,68 ≈ **0,7 mdr** ✓ ("mer
  än hälften försvann": 0,68/1,5 = 45 % kvar — påståendet håller)
- P/E-fällan: 240 ÷ 12 = **20** ✓ och 180 ÷ 6 = **30** ✓ (ordagranna divisioner)

## Juridik (2007:528) — REN, två oberoende instrument

1. **Mekaniskt:** `verktyg/juridikgrind-vakt.mjs --json` → `grund: true, fynd: 0`
   på filen (vakten 2026-09-17 13:08, hela ytan 0 FEL).
2. **Sond D1–D5:** 0 rådgivningsverb på 8 mönster (title+desc+body); genomläsning
   av varje köp/sälj-träff = affärsbeskrivande verb ("säljer lastvagnar", "nya
   försäljningen") — 0 rådgivningskonstruktioner; bärande formler närvarande
   ("utbildning i metod, aldrig råd om enskilda aktier" + disclaimer-sista-rad
   "pedagogisk finansanalys, inte investeringsråd"); **inga andra lagrum**
   (0 risk för lagrumsblandning); 0 personnamn; varumärkesgrindens 26 FEL-fraser
   × 3 ytor = 0 träffar.

## 911-referenser — 0 träffar

0 träffar på seriens 6 mönster ("911", "11 september", "september 2001", "9/11",
"terror", "Terrordåd") i title+desc+body.

## Länkar — 11/11 unika interna GRÖNA + 3/4 externa

- **Interna:** 14 förekomster → 11 unika mål, samtliga HTTP 200 mot
  localhost:3000 (5 kurser: km-067/km-041/rk-05/km-010/km-006 — alla verifierade
  ÄVEN i `public/deep-courses.json`; 6 bloggposter inkl. branschmedianer-akm2
  som nu är publicerad → 0 utkastlänkar, SEO-planens korslänksregel håller).
- **Externa:** volvogroup.com 200 · konj.se 200 · nasdaq.com 200 ·
  **home.sandvik.com DÖD i två kanaler** (curl DNS/timeout + WebFetch ENOTFOUND)
  — se B2.

## Struktur

9 H2 (seriefomret håller), title 46/60 tkn, description 149/155 tkn, sökord
"industriaktier" i title+ingress+H2 ✓, 0 mjuka bindestreck, pillar/author/tags
enligt serien, JSON-parserbar.

## FYND

### B1 — readingMinutes 3 → 2 (BYT)
Plattformskontraktet ORD_PER_MINUT=600: 1 250 ord (title+desc+body) ÷ 600 =
2,08 → **2**. Seriens systematiska 3-slip (ravarubolag-C2 dokumenterade samma
avvikelse; NIKE 6→5, Nordea 6→4, Industrivärden 6→3 i syskongranskningarna).

### B2 — Sandvik-källänken död: home.sandvik.com → www.sandvik.com (BYT)
Utkastets källpekare `https://www.home.sandvik.com/en/investors` svarar inte i
någon kanal (curl: DNS/timeout; WebFetch: ENOTFOUND — DNS saknar värden). Den
bevisat levande värdens spegel `https://www.sandvik.com/en/investors/` = HTTP
200 med äkta IR-innehåll ("Annual report", "Investors", "Financial" i svarskroppen)
— Sandviks domän löser via www (Episerver/Cloudflare). Byt URL OCH länktext
(en post täcker hela länkbygget; strängen maskinellt unik).

### C1 — "omsättningstillväxten 8,4 procent" utan mätperiod (FÖRSLAG)
Rådata bär två tillväxtmått med olika medianer: TTM **8,4 %** (utkastets tal —
korrekt) och 5-års-CAGR **4,1 %**. Utan precisering kan läsaren tro att branschens
femårstillväxt är 8,4 %. Förslag: "och omsättningstillväxten (rullande tolv
månader) 8,4 procent".

### C2 — publishedAt (R2)
Värdet 2026-09-15 är skapandedatum; exportvägen stämplar publiceringsdagen.
Seriekonvention sedan teknikaktier-D3.

### N-notiser
- **N1 aktualisering:** dagens universumfil (n=153, industri n=17) ger median
  P/E 27,8 / universum 20,8 — utkastets 28/20,2 är vin texakta för 09-15 och
  texten bär sitt eget rådatumsdatum; vid publicering bör medianraden
  färskdatumeras (median-driften är fabriksägarens flagga F4 i syskonrapporterna).
- **N2 kvartilmetod:** sondens linjära interpolation reproducerar utkastets
  18,2–35,8 exakt — metodiken noterad för framtida sonder.
- **N3:** beskrivningen av branschens ryggrad (8 svenska + GE + Eaton) är full-
  täckande mot vintagens 12 rader med ASSA och Industrivärden korrekt behandlade
  i sina egna avsnitt.

## Protokoll

Sond: `verktyg/_s1u1-industri-verify.mjs` — 41 kontroller, 40 GRÖNA + 1 fynd
(A12 = B1). Två sondbuggar rättade FÖRE dom (varumärkesgrindens objektstruktur,
deep-courses nyckelform) — verktyget verifierat innan det fick döma
(indu-KOMPLEMENT-läxan). Diff-strängar maskinellt unika (gammalt 1 träff, nytt
0). Utkast-JSON:en orörd. Endast data/ + verktyg/ + worklog — INGET bygge,
src/ orörd (tsc-baslinjen opåverkad, pre-commit-grinden verifierar), R2 orörd
(publicering = kundens beslut), data/blogg/ (live) orörd.
