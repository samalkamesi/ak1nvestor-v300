# KONTROLL-GRANSKNING 2026-09-18 — Goldman Sachs Q3-2026 läspaket (kvartalsserien #40, finansgrenen #5)

**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-goldman-sachs-q3-2026.json` (kvartalsrapportseriens 40:e paket, finansgrenens femte och världsbanksepokens första; commit `abafac2b` 2026-09-18 av fabrik s4-u2; status utkast; rappdag tisdag 2026-10-13)
**Granskad av:** fabrik auto-s1-u1 (agentfabrik spår 1, 1/3, manifest auto-s1-1789758924831), 2026-09-18 — anspråk `data/vakten/auto-s1-1789758924831-u1-ansprak.md` på disk FÖRE arbetet, med pivot bokförd (se nedan)
**Bedömning: FLYTTKLAR EFTER EN RÄTTNING** (B1: TTM-fältet 0,425 visas "plus 43 procent" + tabell "43 %" på två ställen men "42,5 procent" på tre — samma fält, två format; det exakta värdet är 42,5) **+ 4 noteringar utan diff** (N1 vintage-föråldring, N2 JPM-dubbelmedian, N3 fullprecisionsvisning, N4 NDA-PEG-promille — alla nedan). I övrigt **grönt hela vägen: 103 maskinella kontroller, 0 avvikelser** — universumfälten, härledningar, datavaktens fem test, medianer och rang, JPM-tvillingraden, scenariorutan, multiplövningarna, kalendern (DUBBELVERIFIERAD LIVE av granskaren), juridiken, 911-sonden, länkarna och metadata-kontrakten. Utkast-JSON:en orörd av granskningen (nya filer endast).

**Pivot-notis (köprotokollet):** uppdragets "m9-utkast #1" (boerspsykologi-fallstugor) är komplett levererat sedan 09-16 01:10 (KONTROLL + diff i granskning/) och **hela m9-ko-serien är 6/6 granskningsklar sedan 09-16 14:35** — Kö-regeln tvingade pivot (sjätte omgången i raden med samma utgångsläge; tidigare pivots har bokförts av föregångare). Val enligt seriens urvalsprecedens (NIKE-valet 09-16: *tidigaste officiellt bekräftade rappdagen bland ogranskade*): **Goldman Sachs 13 oktober** — bolagsutlyst i pressrummet sedan augusti 2025, Q1/Q2 redan infriade. Konkurrenter sorterade med motivering: LVMH (oktober-fönster utan offentliggjord dag — Wihlborgs-precedensen), Öresund (9/10 men MFN-markerad estimerad + tomt serieunderlag), SAP 15/10 och NP3 16/10 **lämnades fria åt syskonen** (meddelat i anspråksfilen), Prologis 15/10 (tomma universumserier). 0 granskningsfiler för GS vid valtillfället; inget syskonanspråk på disk för omgången.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Rättningen levereras som diff-poster (`sa-laser-du-goldman-sachs-q3-2026-diff.json`; båda söksträngarna maskinverifierade unika = exakt 1 träff i filen). Sond: `verktyg/_s1u1-gs-kontroll.mjs` (103 kontroller, körbar om).

---

## 1. Källor — rätt filversioner låsta och verifierade

| Källa i utkastet | Låst version | Dom |
|---|---|---|
| Bolagsuniversumet "datainsamling 2026-09-03 (Yahoo + MarketStack dubbelkoll)" | `abafac2b:data/portfolj-system/bolagsunivers.json` = **177 poster** (källradens eget deklarerade vintage) — GS-posten: Yahoo 2026-09-03 + MarketStack dubbelkoll (slutkurs 2026-09-02), ordagrant som utkastet redovisar | ✓ |
| GS-postens fältvärden | Dagens fil (183 poster) bär **identisk GS-rad** — paketets tal gröna mot både vintage och nuläge (fältvändning A1–A13) | ✓ |
| Rappdag + Q4-datum + tidsangivelser | **GRANSKAREN DUBBELVERIFIERADE LIVE 2026-09-18** mot pressrumsnotisen (publicerad 2025-08-18): "Third quarter 2026 – Tuesday, October 13, 2026" **ordagrant**; "approximately 7:30 am (ET)"; "9:30 am (ET)"; "Fourth quarter 2026 – Tuesday, January 19, 2027"; Q1 13 april + Q2 14 juli 2026 = paketets "två redan infriade" | ✓ **förstärkt** |
| Rapporterade kvartalssiffror (Q1/Q2 2026, FY25, Q4/Q2/Q3 2025) | Byggarens sökverifiering 2026-09-18 (pressrum + SEC-filingar); granskaren har verifierat **intern konsistens fullt ut** (se §2: H1-exakt, kvartalskedjor, restposter) — extern omverifiering av varje SEC-rad är byggarens deklarerade och kvarstående ansvar | ✓ med ärlighetsgräns |
| Medianer/rang "omräknade 2026-09-18 ur 177-postfilen" | Vintage `abafac2b` = 177 poster; finansgrenen 19 bolag **både då och nu**; universummedianerna EXAKTA mot vintage (se N1 om tillväxten 177→183) | ✓ |
| JPM-tvillingläsningen "P/E 15,269, P/B 2,678, ROE 17,79 %" | Filens JPM-rad: pe 15,269, pb 2,678, roe 0,1779 — **ordagrant sann** (se N2) | ✓ |
| Vågvalideringsnot "GS står inte i kartan (våg 152)" | Kartans tolvuniversum (ERIC-b, AZN, NDA med flera) bär ingen GS-post; Iberdrola-precedensens ärlighetsformulering använd korrekt | ✓ |

## 2. Siffror — oberoende omräkning (sond `verktyg/_s1u1-gs-kontroll.mjs`)

**GS:s egna fält mot filraden (14 kontroller, alla EXAKTA):** kurs 1 004,42 ✓ · börsvärde 292,458 mdr ✓ · P/E 15,479 ✓ · P/B 2,774 ✓ · EV/EBIT 2,061 (redovisas som artefakt med motivering — bankfamiljens doktrin) ✓ · PEG 1,24 ✓ · ROE 0,169 → 16,9 % ✓ · brutto 82,08 % ✓ · EBIT 42,18 % ✓ · netto 31,04 % ✓ · prognos 4,68 % ✓ · TTM 0,425 ✓ · insiderköp 7 ✓ · seriefält tomma med öppen luckredovisning ✓.

**Officiella kvartalstal — intern konsistens (14 kontroller):** Q1+Q2-intäkt 17 227 + 20 338 = **37 565 exakt** mot rapporterat H1 ✓ · TTM-vinstkedjan: Q3 2025 = 12,25 × 328 M = 4 018 ✓, Q1 2025-restpost 4 822 ✓, summering **20 896** → "cirka 20,9 mdr" ✓ · TTM-intäkt: Q1 2025 ur "+14 %"-jämförelsen 15 111 ✓, Q3 2025-rest 15 139 ✓, summering **66 154** → "cirka 66,2 mdr" ✓ · nettomarginaler 29,47/32,68/32,59 % → "29,5/32,7/32,6" ✓ · Q2-årsjämförelse +39,49 → "+39,5" ✓ · aktietalet 17 180/51,32 = 334,76 M och 6 628/20,98 = 315,92 M → "334,8/315,9" ✓ med minskning **5,63 %** → "5,6 procent" ✓ (textens "omkring"-formuleringar bär härledningsosäkerheten ärligt).

**Datavaktens fem test (14 kontroller, alla omräknade gröna):**
| Test | Textens tal | Omräknat | Dom |
|---|---|---|---|
| 1 identitet framåt | 2,774 ÷ 0,169 = 16,414, gap +6,0 % | 16,4142, +6,04 % | ✓ |
| 1 identitet bakåt | 15,479 × 0,169 = 2,616, gap −5,7 % | 2,61595, −5,70 % | ✓ |
| 2 implicit P/E-vinst | 18,9 mdr | 18,890 | ✓ |
| 2 implicit EK + ROE-vinst | 105,4 → 17,8 mdr | 105,414 → 17,815 | ✓ |
| 3 absolutkontroll FY | 15,479 × 17,18 = 265,9, residual +10,0 % | 265,93, +9,98 % | ✓ |
| 3 absolutkontroll TTM | 15,479 × 20,896 = 323,4, residual −9,6 % | 323,43, −9,58 % | ✓ |
| 4 PEG-konvention | 15,479 ÷ 4,68 = 3,31; implicit 12,48 %; kvot 0,37 | 3,3083; 12,483; 0,3749 | ✓ |
| 5 tillväxtfält | +14/+39,5 %; TTM 66,2 mdr; marginalfönster "mitt emellan" | 14,0/39,49; 66 154; 31,04 mellan 29,5 och 32,6 | ✓ |

**Medianer och rang (EGNA omräkningar ur filen, 21 kontroller):** finansgrenen n=19 ✓ · P/E 15,269 ✓ · P/B 2,678 ✓ · ROE 15,34 % ✓ · EBIT 47,90 % (47,895) ✓ · netto 35,19 % ✓ · prognos 9,50 % (9,495) ✓ · TTM 10,00 % ✓ · rang P/E 11/19, P/B 12/19, ROE 13/19, EBIT 7/18, netto 7/19, prognos 4/16, TTM 18/19 — **samtliga sju bekräftade** ✓ · universummedianer mot vintage: P/E 21,153 (n=167) ✓ · P/B 2,8065 → "2,807" ✓ · ROE 15,34 % ✓ · EBIT 21,165 → "21,17" ✓ · netto 14,09 % ✓ · prognos 12,31 % (n=166) ✓.

**Nordiska PEG-citat (8 kontroller):** Nordea 8,87/2,19 · Handelsbanken 18,54/2,33 (2,3335) · Swedbank 6,99/1,57 (1,5742) · SEB 2,12/1,27 (1,2651) — fältvärdena exakta ur filen, konventionstalen **troget återgivna ur syskonpaketen** (Nordea-paketet skriver själv "ger 2,19"; se N4).

**Scenariorutan (9 celler + 4 satser):** bas 58 280 × 42,18 % = 24 583 ✓ · samtliga nio celler egenräknade EXAKTA (23 280/23 845/24 410 · 24 000/24 583/25 165 · 24 720/25 320/25 920) ✓ · "1 pp ≈ 583 M" (582,8) ✓ · "3 % ≈ 737 M" (737,5) ✓ · "intäktsratten cirka 1,3 gånger" (1,265) ✓ · marginalvikt 1/(3 × 0,4218) = 0,79 ✓.

**Multiplövningarna:** 15,479/1,0468 = 14,79 ✓ · 292 458/20 896 = 13,99 → "14,0" ✓.

## 3. Juridik — 2007:528, utbildning aldrig rådgivning

Mekanisk verbsond + manuell genomläsning av varje träff med kontext: **4 kontexter, samtliga nekande eller pedagogiska** — (1) "inte en rekommendation att köpa, sälja eller behålla några värdepapper"; (2) rubrikfrågan "hur belånat är huset, och vem köper?" (insiderköps-pedagogik, deskriptiv); (3) "ett pedagogiskt verktyg, aldrig en handssignal"; (4) "Inga köp-, sälj- eller hållningsrekommendationer förekommer". Neutrala sammansättningar (insiderköp, återköp) korrekt exkluderade. **Lagrum: endast 2007:528 med 2 kap 5 § — rätt lagrum, ingen blandning.** Konsensusbegreppet bärs metodiskt ("inte en sanning och inte vår skattning"; "ett begrepp att förstå, inte en måttstock att döma utfallet med"). Scenariorutan och övningarna deklarerar sig som "ren aritmetik"/"träning i metod" — juristdoktrinen uppfylld. Finalraden "publiceringen av detta paket är kundens beslut" bär R2 korrekt.

## 4. 911-referenser

**0 träffar** på de sex mönstren (911 · 9/11 · 11 september · September 11 · eleven september · niende elva) i hela filen.

## 5. Länkar och struktur

**13/13 interna länkar HTTP 200** mot prod (localhost): nio aspektsidor under /dataset/finans/ (roe, netto-marginal, omsattningstillvaxt-ttm, prognos-tillvaxt, pe, pb, ev-ebit, vardering, universumjamforelse) + /bolag/gs + /kurser + /transparens + /kallor. Strukturkontraktet identiskt med serien (samma nio nycklar; pillar "Institutionell metodik"; author "AK1A Research Lab"; sex tags i seriens mönster; description 368 tecken inom seriens spann 204–1 057). Externa länkar: 2 st till goldmansachs.com — pressrumsnotisen omdirigerar (301) och är innehållsverifierad live av granskaren (§1); IR-sidan byggarlive-verifierad 09-18.

## 6. Metadata-kontrakt

readingMinutes 5 = 3 174 ord ÷ 600 ✓ · 2026-10-13 = **tisdag** ✓ · 2027-01-19 = **tisdag** ✓ · publishedAt = rappdagen 2026-10-13 ✓ · "svensk tid 13:30 under sommartid" = 07:30 EDT + 6 h ✓.

## 7. Noteringar utan diff (N1–N4) + fyndet B1

- **B1 (diff):** TTM-formatet — se diff-posterna B1a/B1b. Enda rättningen; fältets exakta värde 0,425 = 42,5 %.
- **N1 — vintage-föråldring, deklarerad:** universumfilen växte 177→183 poster **samma dag** som bygget (s2-vågorna: AB InBev, NUE/SHW/CF, MT/FMX). Dagens fil ger universummedianerna P/B 2,793 · ROE 15,11 · EBIT 20,96 · netto 13,66 (mot paketets 2,807/15,34/21,17/14,09). Paketets källrad deklarerar **"177 poster"** — grönt mot deklarerad vintage enligt Nordea-precedensen. **Kö-not till byggarspåret:** om publicering (R2) dröjer bör universummedianerna friskas upp eller vintage-stämpeln förstärkas i tabellrubriken.
- **N2 — JPM = dubbelmedianbolaget:** tvillingradens "P/E 15,269 och P/B 2,678" är **exakt medianerna** i samma tabell — det ser ut som copy-paste men är filens faktiska JPM-rad (pe 15,269, pb 2,678, roe 0,1779; noteras för nästa läsare av paketet och som superlativtest: sammanffallet är äkta, inte skrivfel).
- **N3 — fullprecisionsvisning:** Datavaktens test 3 skriver "15,479 × 20,90 = 323,4" — produkten 323,4 kräver fullprecisionen 20,896 (visad multiplikant ger 323,51 → 323,5). Seriens konvention (Nordea B2-precedensen) accepterar visningsavrundning när beräkningsunderlaget redovisas; ingen diff.
- **N4 — NDA-PEG-promille:** GS:citatet "Nordea 8,87 mot 2,19" är **troget mot Nordea-paketets egen text** ("ger 2,19"), men dagens fil ger konventionen 2,1845 → 2,18. Promillediffen är född i syskonpaketet (ev. dess vintage) — utanför detta objekt; noteras för Nordea-paketets nästa revision.

## 8. Leverans och kö

**Leverans:** denna KONTROLL-rapport + `sa-laser-du-goldman-sachs-q3-2026-diff.json` (1 rättning, 2 strängbyten, båda unika) — utkast-JSON:en orörd. Sond `verktyg/_s1u1-gs-kontroll.mjs` bevarad för omkörning. **KVD: data-only — src/ orörd, INGET bygge, tsc orörd (pre-commit-grinden bär baslinjen), R2 orörd, data/blogg/ orörd, syskonytor orörda.**

**Kö efter denna granskning:**
1. **B1-rättningen verkställs** av paketets ägare (s4-spåret) eller nästa våg — däreär paketet flyttklart utan reservationer.
2. **JPM-paketet saknas helt** — tvillingdatumet 13/10 bär TVÅ bolag och byggaren lämnade medvetet JPM "orörd åt syskon": bankspårets nästa byggkandidat med samma urvalsprincip (tidigaste rappdagen).
3. SAP 15/10, NP3 16/10, Tele2/ABB 20/10 — fria för syskonen i denna omgång (meddelat i anspråket).
4. N1:s vintage-friskning vid födröjd publicering; N4 till Nordea-revision.
