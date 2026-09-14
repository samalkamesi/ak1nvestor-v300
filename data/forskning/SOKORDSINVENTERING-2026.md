# SÖKORDSINVENTERINGEN 2026 — syntes (våg 138)

**Ägare:** huvudagenten (syntes av S1–S9) · **Datum:** 2026-09-14
**Källor:** nio subagentleveranser i `data/forskning/sokord/` (S1 kurser-sv,
S2 kurser-en, S3 kurser-ar, S4 analysbibliotek, S5 blogg, S6 index-inventory,
S7 bransch/dataset, S8 frågemönster, S9 externa signaler) — alla LEVERERADE
och committade (se PIPELINE-KO.md våg 138-tabellen).
**Syfte:** täckningsmatris + prioriterad plan för programmatiska
long-tail-landningssidor och innehållsserier. **Allt är utbildningsformulerat**
(lagen 2007:528, 2 kap 5 §) — juridikgrindens trafikljus (S8 §1) gäller
varje beslut nedan: GRÖN = målfras, GUL = omskriv enligt mall, RÖD = besvara
med GRÖN sida.

---

## 1. HUVUDSLUTSATSER (fyra)

1. **Varumärket kan inte sökas — metoden är svaret, inte frågan.** S9 bevisar:
   noll träffar på "AKM2"; S1/S2/S4 betygar samma för AKM1/AK1TS. All SEO
   måste ranka på allmänna pedagogiska termer ("hur räknar man X",
   "skillnaden mellan X och Y") och länka in AKM1/AKM2 som metodexempel.
2. **Svenska ytan: bankarna äger definitionerna, ingen äger djupet.** S9:
   Reddit rankar på sida 1 för "fundamental analys" (= utbudet räcker ej),
   2014-bloggar rankar fortfarande. S8:s mönster P4 (hur räknar man) och
   P8 (skillnaden mellan) har systematiskt låg svensk konkurrens.
3. **Arabiska ytan är det största strukturella glappet.** S9: YouTube +
   mäklare + stat dominerar, strukturerad textutbildning saknas — AK1A:s
   100 % översatta katalog (333 kurser) är en ovanlig tillgång. S3:s
   mönsterbevis: ما هو (1 501), كيف (3 702), الفرق بين (595) redan i
   korpusen; لكن للمبتدئين ("för nybörjare") endast 7 träffar trots hög
   volym — systematisk lucka. Kodväxlingen "ما هو EV/EBITDA" (latinsk
   term + arabisk kontext) är det starkaste single-formatet.
4. **Indexeringen har tre gratisvinst-glapp som inte kräver nytt innehåll:**
   S6 glapp 3 (6 färdiga spegel-URL:er saknas i sitemap — minuter), S5:s
   FAQ-upptäckt (10 posters en/ar-speglar är noindex pga oöversatta
   FAQ-block, ~74–79 översättningsenheter återställer indexeringen), samt
   S6 glapp 5 (sitemap listar noindex-speglar — bevakas i Search Console).

## 2. TÄCKNINGSMATRIS — mönster × språk × status

| Mönster (S8) | sv idag | en idag | ar idag | Starkaste åtgärd |
|---|---|---|---|---|
| P1 vad är X | 3–4 exakta sidor | GLAPP (struktur) | GLAPP (struktur) | Direktavkastning, goodwill, P/E (sv); ما هو-mall på ar-meta |
| P4 hur räknar man X | 4–5 sidor av 20 möjliga | GLAPP | GLAPP | 15 v-variabler saknar räknesida (sv-serie); "how to calculate" på en |
| P5 hur analyserar man X | STARKT (v01–v20) | GLAPP | GLAPP | Replikera v-serien för sektorer + bokmaster |
| P6 så läser man X | 4 exakta | GLAPP | GLAPP | Kassaflödesanalys, kvartalsrapport |
| P7 X för nybörjare | INGEN hub | GLAPP | GLAPP (للمبتدئين) | Nybörjar-hub som samlar 43 kurser (sv) = högst enskilda lyftet |
| P8 skillnaden mellan X och Y | 1–2 | GLAPP | GLAPP | "Skillnaden mellan"-serien (S9 A4-bevis: IPO/direktlistning tunt) |
| P9 är X hög/farlig (GUL) | 1 bevisad | — | — | Branschmedian-svarsmekaniken (redan publicerad) |
| P2/P10–P12 | delvis | GLAPP | GLAPP | شرح مبسط-mall (ar), DCF-misstag, utdelningskriterier |

**Indexbar bas (S6):** 1 712 URL:er idag (999 kurser, 165 blogg, 231
analys+variabel, 22 forskning, 201 labb, 33 dataset, 62 statiska). ~48 %
saknar speglar. Realistisk tillväxt: **+136–166 sidor** utan ny data
(bolagssidor +100, lexikon +30–60, speglar +6) och **+240–253** med
programmatiska dataset-teman (S7).

## 3. PRIORITERAD PLAN — tre spår

### Spår A — snabba fixar (timmar–dagar, ingen ny data)

| # | Åtgärd | Bevis | Kostnad |
|---|---|---|---|
| A1 | Sitemap: lägg in 6 saknade spegel-URL:er (/{en,ar}/laroplan, certifikat, dagens-pass) | S6 glapp 3 | ~6 rader |
| A2 | Översätt FAQ-blocken i 10 bloggposter (~74–79 enheter) → en/ar-speglar över 80 %-tröskeln → indexbara + flerspråkig FAQPage-JSON-LD | S5 §1 | Översättningsvåg |
| A3 | ar-meta-pilot: 10 kurser får arabiska SEO-titel enligt S3:s mallar (v06, v09, km-009, pf-08, ud-06, the-intelligent-investor, margin-of-safety, bf-05, ts-15, pc-12) | S3 §8 | Dataleverans |
| A4 | Blogg-FAQ-utbyggnad våg 140: 41 poster utan FAQ → 3–4 par var (12-parallell bevisvåg, dispatch-underlag klart: `sokord/v140-faq-plan.md`) | S5 §4 + kunddirektiv | Redan planerad |
| A5 | SEO-metadata en: S2 noterar att keywords-fälten är 100 % svenska — kompletterande engelska keywords i data/seo/kurser/ (beslut: genereringsledet) | S2 §7 | Dataleverans |

### Spår B — programmatiska sidor (kod + befintlig data)

| # | Yta | Antal | Källa | Not |
|---|---|---|---|---|
| B1 | `/bolag/{slug}` — nyckeltal + avvikelse mot branschmedian + länkar | +100 | S6 glapp 1 | ~70–90 bolag saknar URL idag; "ABB nyckeltal"-longtail |
| B2 | `/dataset/[bransch]/[nyckeltal]` — median + spridning + läsning | ~115–120 | S7 tema 1 | Störst yta; gränsregeln (<5 mätta ⇒ ingen sida) MÅSTE med |
| B3 | `/dataset/[bransch]/akm2` + `/[kategori]` + `/lagesbild` + `/fcf-avkastning` + `/vardering` + land×bransch | ~125–133 | S7 tema 2–7 | Bygger på samma motor som B2 |
| B4 | `/begrepp/{term}` — nyckeltalslexikon med formel + tolkning + räkneexempel | +30–60 | S6 glapp 2 | P1+P2-mönstrens kanoniska hem; juridiskt rent |

**Stoppregel B (S7 §6):** PREC.ST:s `recommendation`/`priceTarget`-fält får
ALDRIG syndikeras till programmatiska sidor (rådata innehåller
"FÖRSIKTIGT KÖP" + kursmål = rådgivning om det publiceras). Generatorerna
vitt-testas mot detta. Utdelningsdata saknas (0/100) — "utdelningsaktier
inom [bransch]" kan INTE byggas förrän data samlas in; FCF-avkastning är
det juridiskt och data-mässigt rätta temat.

### Spår C — innehållsserier (blogg/kurs, sv först)

1. **"Skillnaden mellan X och Y"** (P8; S9 A4-bevis): IPO/direktlistning,
   ISK/KF, ROE/ROIC, P/E/EV-EBITDA, direktavkastning/utdelningstillväxt,
   fundamental/teknisk analys.
2. **"Hur räknar man X"** (P4; 15 glapp enligt S8 §6.1): bruttomarginal,
   Sharpe, payout ratio, intäktsstabilitet … — v01–v20-serien kompletteras.
3. **Nybörjarhubben** (P7): "Aktier för nybörjare — nästa steg efter
   kontot" samlar 43 nybörjarkurser; ar-versionen är ytans naturliga
   förstasida (للمبتدئين).
4. **Ämnesglipor med volym** (S5 §5): P/E-guiden (korpusens mest citerade
   tal saknar egen post!), utdelning & direktavkastning, snittmetoden,
   kassaflödesanalys, substansvärde, fastighets- och banknyckeltal, RT,
   volatilitet/beta.
5. **Bokmaster-förstärkning** (S1 §17): titel + "sammanfattning svenska" —
   Torssell (svenskt standardverk) och Tänka snabbt och långsamt är
   starkast.

## 4. SPRÅKSTRATEGI (konsoliderad)

- **sv:** full SSG-bärighet — alla spår ovan.
- **en:** long tail endast (Investopedia/Fool äger head terms, S9 A9–A10).
  Vinnare: "how to calculate X"-serien + de tre svenska nischfönsterna —
  "Swedish ISK account", "Swedish dividend stocks", "[bolag] stock
  analysis" (utlandsboende svenskar + utländska investerare).
- **ar:** störst strukturella glapp = störst chans. Mönster-prioritet:
  للمبتدئين (P7) + شرح مبسط (P2) + الفرق بين (P8). Latinska termer behålls
  latinska i titlar (kodväxling, S3 §5) med arabisk förklaring efter.
  dir="rtl" + `<bdi>`-isolering i HTML-meta. Halal-grenen (S9 A11) har
   stark efterfrågan — formuleringar väntar styrelse/juridik (positionera
  ALDRIG religiöst; utbilda om hur sådana analyser går till).

## 5. VOLYMMETODENS ÄRLIGHETSGRÄNS

Alla LT-betyg i S1–S9 är **analytiska** (termens svenskhet, frågeform,
konkurrensbedömning) — INTE mätta sökvolymer. S9 mäter konkurrens (vem äger
svaret), inte volym. Kalibrering kräver Search Console (API-nyckel = R2,
väntar kund) eller sökordsdata-leverantör (styrelsebeslut). Planen ovan är
därför ordnad efter (1) bevisad lucka i index, (2) konkurrens-läge,
(3) data-beredskap — inte volymsiffror.

## 6. BESLUTSFÖRSLAG till styrelseronden

1. **Godkänn spår A omedelbart** (A1–A2 är rena indexfixar; A3–A5
   dataleveranser).
2. **Våg 140 = FAQ-bevisvågen** (A4) — kunddirektiv ligger redan: 12
   parallella subagenter, mät commits/timme + tid per leverans.
3. **Våg 141-förslag = B1 `/bolag/{slug}`** (störst sökvolym-täckning per
   kodrad: datan är leveransklar, mallen finns i dataset-sidorna) + B2 som
   våg 142.
4. **B4-lexikonet** bör vänta på våg 140-resultatet (FAQ-par kan bli
   lexikon-frömaterial — S3:s 2 133 quizfrön i "ما هو X؟"-format är redan
   en färdig Q&A-källa).
5. **Väntar kund (R2):** Search Console API-nyckel; halal-formuleringar;
   utdelningsdata-insamling (ny datakälla).

---

*Dokumentet är sanningen om sökordsläget tills nästa inventering; ägs av
huvudagenten, uppdateras vid varje implementerad våg (bokför i PIPELINE-KO).*
