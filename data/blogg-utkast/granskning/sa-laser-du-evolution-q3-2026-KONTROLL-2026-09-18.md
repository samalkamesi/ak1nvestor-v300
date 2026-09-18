# KONTROLL-GRANSKNING 2026-09-18 — Evolution Q3-2026 läspaket (mx2 #2)

**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-evolution-q3-2026.json` (mx2-serien #2, commit `09ebc188` 2026-09-15 23:59 — "3 nya kvartalsläspaket"; status utkast)
**Granskad av:** fabrik auto-s1-u3 (agentfabrik spår 1, 3/3, manifest auto-s1-1789713300301), 2026-09-18 — anspråk `data/vakten/auto-s1-1789713300301-u3-ansprak.md` FÖRE arbetet, med pivot bokförd (se nedan)
**Bedömning: FLYTTKLAR EFTER FYRA RÄTTNINGAR** (B1: seriepåståendet "den första negativa tolvmånadssiffran i seriens paket" **falskt** — NIKE-paketet 09-16 redovisar "Intäktstillväxt senaste tolvmånadersperioden: minus 1,1 procent" först, i samma branschgren; B2: superlativet "seriens högsta marginaler" **falskt på EBIT** — NP3 74,9 % ligger över EVO 57,8 (netto: även Wallenstam 80,8) — **sant endast på FCF-marginalen** 59,2, seriens högsta bland paket med fältet; B3: identitetsgraderingen "för en gångs skull håller den … nära det redovisade P/E 15,2" överdriver — gapet är drygt tio procent, över seriens egen reservationsgräns (Essity 9 %), rätt gradering är tidsmetrik inte valutabrott; B4: readingMinutes 7→4, exakt som AZN-granskningen förutsade "delat med EVO") **+ 2 förslag** (D1 publishedAt framtidsdatum; D2 kalender-aktualisering — bolaget har NU bekräftat 23/10, se §7). Innehållet i övrigt grönt hela vägen: **samtliga 19+ nyckeltalsfält ordagrant exakta** mot seriens egen vintage, 10/10 konsumentmedianer EGNA omräknade EXAKTA, universum-P/E med EXAKT n redovisad, PEG-fältet som seriens FÖRSTA fullständigt replikerade (källan dokumenterar sin konvention i noteringen: 15,15 ÷ 11,4 = 1,33), motor 5/5 vågklasser + 8/4/13-matrisen + σ och pos52, scenariorutan 9/9 celler + båda hävarmarna, juridiken ren med tvångsnekat budsammanhang, 911 ren, 15/15 interna länkar 200. Utkast-JSON:en orörd av granskningen (nya filer endast).

**Pivot-notis (köprotokollet):** uppdragets "m9-utkast #3" är auto-platshållare (m9 #3 forskningslaget levererad 09-16, hela m9-ko 6/6). Förstavalet mx1 #5 (konsumentbolagens-skuldsättning) **förlorade ett 41-sekunders-klaimrace** mot syskon u2 (deras anspråk 08:39:06, mitt 08:39:47, u1:s 08:41 tredje hand) — u2:s leverans på disk 08:47–08:48 är komplett med samma huvudfynd som mitt påbörjade material; **filen på disk äger** (Yara/SAAB-precedensen): deras leverans orörd, mitt material kasserat med 0 spår i git (Write-grinden vägrade när deras fil landade — kollisionsskyddet fungerade), u1 tog konsumentaktier-guiden parallellt. Nytt val enligt köregeln: **mx2 #2 i seriens commit-ordning** (`09ebc188`) — AZN-granskningen (09-18 03:37, s1-u3 förra omgången) lämnade uttryckligen "EVO/PREC fria"; 0 granskningsfiler för EVO/PREC; inget syskon claimat dem. PREC #3 återstår åt nästa omgång.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Rättningarna levereras som diff-poster (`sa-laser-du-evolution-q3-2026-diff.json`, samtliga söksträngar maskinverifierade unika = exakt 1 träff i filen, sond `.zcode/granskning-mx2-evo-*.mjs`).

---

## 1. Källor — rätt filversioner låsta och verifierade

| Källa i utkastet | Låst version | Dom |
|---|---|---|
| Bolagsuniversumet "datainsamling 2026-09-15 (StockAnalysis)" | `09ebc188:data/portfolj-system/bolagsunivers.json` = 115 bolag; EVO-posten: StockAnalysis hämtat 2026-09-15, sid-as-of 2026-09-14, S&P Global Market Intelligence — **ordagrant** som utkastets källrad | ✓ |
| Motordata "verifierad 2026-08-24" | `data/analyses/EVO.ST.json`: verified/analysisDate = 2026-08-24, källa Yahoo Finance | ✓ |
| Budnotisen "Candle Lake, cirka 695 kronor, augusti 2026" | EVO-postens notering: "augusti 2026: offentliggjort uppköpserbjudande (Candle Lake ~695 SEK/aktie) noterat som marknadskontext — inget värdeomdöme" | ✓ ordagrant |
| Rapportvalutan euro | EVO-postens notering: "serier i EUR (rapportvaluta; Nasdaq Stockholm-notering i SEK — CAGR opåverkad, nivåer ej i SEK)" | ✓ utkastets ärlighetsrad speglar den |
| "samtliga elva bolag i biblioteket" | `data/analyses/` = 11 filer (ABB, ATCO-A, AZN, ERIC-B, EVO, HM-B, INDU-C, PREC-ST, SAND, SKF-B, VOLCAR) | ✓ |
| Syskonpaketens rappdagar i urvalsstycket | HM 09-24 · INDU 10-07 · NDA+ERIC 10-15 · ABB 10-20 · SKF 10-21 · ATCO+SAND 10-22 · VOLCAR 10-23 — alla mot GRANSKNINGSKÖ-tabellen | ✓ 7/7 |

## 2. Siffror — oberoende omräkning (sond `.zcode/granskning-mx2-evo-medianer.mjs`)

**EVO:s egna fält mot vintage-posten (19+ kontroller, alla EXAKTA):** kurs 890,60 ✓ · börsvärde 169,86 mdr → "cirka 170 miljarder" ✓ · ROE 26,68→26,7 ✓ · ROIC 31,19→31,2 (med källans proxy-notering ordagrant) ✓ · brutto 100 % konvention + förklaring ✓ · EBIT 57,8 ✓ · netto 51,77→51,8 ✓ · FCF-marginal 59,18→59,2 ✓ · skuld/EK 0,02 ✓ · P/E 15,15 ✓ · P/B 3,62 ✓ · EV/EBIT 12,04→12,0 ✓ · PEG 1,33 ✓ · FCF-yield 8,05 % ✓ · TTM −2,21→−2,2 ✓ · CAGR oms 12,36→12,4 ✓ · CAGR res 7,99→8,0 ✓ · prognosTillväxt 11,4 % härledd ur 15,15/13,60 ✓ (källans egen notering dokumenterar härledningen) · serier 2022–2025 (1 457→1 799→2 063→2 067 M€ oms; 843→1 071→1 244→1 062 M€ res) ✓ · "1 244 till 1 062, minus 15 procent" = −14,63 ✓ · "2 063 till 2 067" plan ✓ · "fyra redovisade år" ✓.

**Medianer (peer-kontraktet, EGNA omräkningar ur vintage 09ebc188, konsumentgrenen n=13 med EVO:s StockAnalysis-post):**

| Median | Påstått | Omräknat | n | Dom |
|---|---|---|---|---|
| ROE | 24,2 | 24,19 % | 12 | ✓ EXAKT |
| ROIC | 17,0 | 17,04 % | 11 | ✓ |
| EBIT | 14,6 | 14,61 % | 13 | ✓ |
| netto | 8,4 | 8,38 % | 13 | ✓ |
| FCF-marginal | 9,3 | 9,33 % | 12 | ✓ |
| TTM-oms | +0,9 | +0,90 % | 13 | ✓ |
| P/E | 20,4 | 20,447 | 12 | ✓ |
| P/B | 3,94 | 3,940 | 12 | ✓ |
| EV/EBIT | 15,7 | 15,720 | 12 | ✓ |
| skuld/EK | 0,69 | 0,694 | 12 | ✓ |
| universum-P/E | 20,2 (n=106 av 115) | 20,25 | **106 av 115** | ✓ EXAKT med exakt n |

"nära fyra gånger branschmedianen" = 57,8/14,6 = 3,96× ✓. **PEG — seriens första HELT replikerade fält**: källans notering dokumenterar konventionen ("peg = P/E/prognostillväxt i procent") och 15,15 ÷ 11,4 = 1,329 → 1,33 EXAKT — efter tolv instabila PEG-observationer i serien det första fältet som både bär konventionsdokumentation och replikerar (Volvo Group-fyndet "fältets pålitlighet följer källan" i fullformat).

**Motorn (EVO.ST.json, 12 kontroller):** 5/5 vågklasser exakta (mikro impulsvåg · kort impulsvåg · medellång basbygge · lång korrigering · mega korrigering) · matrisen räknad cell för cell = 8▲/4▼/13— ✓ · σ 34,25 % → "34 procent per år" ✓ · pos52 0,524 → "52 procent" ✓ · nivåer 515,40/640,49/713,30/1 096,25 ✓ · "högsta mer än dubbelt lägst" = 2,13× ✓ · "över båda medelvärdena, i övre halvan" (890,60 > 713,30 > 640,49; 64,6 % av spannet) ✓ · "samlad bild blandad" = filens overallBias "Blandad bild" ✓.

**Scenariorutan (9 celler + 3 satser, alla egenräknade):** bas 2 067 × 57,8 % = 1 194,7 → "cirka 1 195" ✓ · samtliga nio celler 1 139/1 159/1 179 · 1 174/1 195/1 215 · 1 209/1 231/1 252 EXAKTA ✓ · "tre procent omsättning cirka 36 miljoner" = 35,8 ✓ · "en procentenhet marginal cirka 21" = 20,7 ✓ · "1,7 gånger hårdare" = 1,73 ✓ med Sandvik-spegeln korrekt citerad (marginalvikt 1/(3×0,578) = 0,58 — bankfickan, som Wallenstams 0,58: när marginalen redan ligger nära 60 procent väger volymen tyngst).

**Seriepåståendena — granskningens fynd (B1–B3), alla mätta mot levererade paket:**

| Påstående | Verkligheten | Dom |
|---|---|---|
| "den första negativa tolvmånadssiffran i seriens paket" | NIKE-paketet (09-16, FLYTTKLAR): "Intäktstillväxt senaste tolvmånadersperioden: **minus 1,1 procent**" — samma mått, samma formulering, tidigare leverans, samma branschgren | ✗ → B1 |
| "Evolution kombinerar seriens högsta marginaler (EBIT 57,8 …; kassaflödesmarginal 59,2 …)" | EBIT: **NP3 74,88 %** (fastighetspaketet 09-16: "2 274 mkr × 74,88 %") > 57,8 · netto: Wallenstam 80,8 och NP3 64,0 > 51,8 — superlativen håller ENDAST på FCF-marginalen: 59,2 är högst bland paket som redovisar fältet (närmast Telia 25,71, Wallenstam 29,4) | ✗ → B2 |
| identiteten "för en gångs skull håller den: … ger 13,6, nära det redovisade P/E 15,2" | 3,62 ÷ 0,2668 = 13,57 mot 15,15 = **gap 10,4–11,6 %** — över Essitys 9-procentsreservration ("godkännande med reservation"); seriens graderingslära kallar detta tidsmetrik-zon, inte rent håll | ✗ → B3 (graderingen, inte mekaniken — valutakontrasten mot ABB/AZN i nästa mening är korrekt och behålls) |
| "seriens första rapport under pågående uppköpserbjudande" | grep "uppköpserbjudande/budsituation" i seriens 39 paket: endast EVO | ✓ SANN |
| "ordningen är spegelvänd mot ABB-paketets" | ABB: kort korrigering/lång impulsvåg; EVO: kort impulsvåg/lång korrigering | ✓ |

## 3. Juridiken — 2007:528 (utbildning, aldrig rådgivning): REN — med seriens tuffaste test

Paketet behandlar en **pågående budsituation** — juridiskt känsligaste scenariot i serien hittills — och ramarna håller hela vägen:

- **Rådgivningsglossor:** samtliga träffar i TVÅNGSNEKADE kontexter — "Det är inte en rekommendation att köpa, sälja eller behålla några värdepapper" (ingress) · "Inga köp-, sälj- eller hållningsrekommendationer förekommer" (disclaimern) · "ingen handssignal" ×2 · budmekaniken genomgående som observation av marknadsprissättning ("prissätter möjligheten att den slutliga ersättningen landar högre", "mekanik, inte prognos", "inte värdeomdöme").
- **Kursens läge över budnivån (890,60 mot 695)** redovisas som läxa i marknadsprissättning med dubbla nekningsramar — utbildningens kärna, exakt som grinden kräver.
- **Juridikgrind-vakten** (`--json`): 0 fynd på filen. **Varumärkesgrind-replik** (26 mönster): 0 FEL + 0 VARNING.
- **Lagrum:** exakt ett — disclaimerns sista rad "enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning" ✓ (inga konsumentlagrum i närheten ⇒ ingen blandningsrisk).
- **Disclaimer-sista-rad:** den utbyggda kvartalsformen med negerade rekommendationer + "publiceringen av detta paket är kundens beslut" (R2-markerat i själva texten) ✓.

## 4. 911-referenser — REN

0 träffar på seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i title + description + body.

## 5. Länkar — 15/15 interna levande

13 × /dataset/konsument/* (roe, roic, netto-marginal, fcf-avkastning, omsattningstillvaxt-ttm, resultat-cagr-5ar, prognos-tillvaxt, pe, pb, ev-ebit, peg, skuldsattning, universumjamforelse) + /bolag/evo-st + /kurser — samtliga HTTP 200 mot localhost:3000. 0 externa länkar i bodyn (källorna redovisas som text med URL-fria hänvisningar i Källor-sektionen: evolution.com + MarketScreener, båda "lästa 2026-09-15"). 0 länkar till utkast.

## 6. Metadata

- **Title 86 tkn** — kvartalsfamiljens spann 77–314 ✓ grönt. **Description 354 tkn** — familjens 204–1 057 ✓ grönt.
- **readingMinutes 7 → 4 (B4):** 1 911 ord. Kvartalsfamiljens praxis ~430–470 ord/min (AZN-granskningens C3-mätning: JNJ/Novo/SAP/AT&T — samma längd — alla rm 4): 1 911/450 ≈ 4,2 → 4. AZN-granskaren förutsåg exakt detta: "rm 7 bara mx2-byggarens mönster, delat med EVO; byt" — förutsägelsen infriad.
- **publishedAt 2026-10-20** = framtidsdatum nära rappdagen → D1 (R2).

## 7. Kalendern — korrekt reserverad vid avläsningen, AKTUELLISERBAR (D2)

Utkastet (källor lästa 09-15): officiella kalendern anger månaden ("October '26 — Interim report January–September"), MarketScreener pekar på fredagen 23 oktober, "ej bolagsbekräftat vid avläsningen" — korrekt hedgat för sitt datum, med "det är alltid IR-kalendern som gäller" som skyddslinje. **Live-kontroll 2026-09-18 (evolution.com/investors):** kalendern listar NU "23 October '26 — Interim report January – September 2026" — datumet är därmed **bolagsbekräftat i dagsläget** (klockslag ej angivet; Q2-bekräftelsen "17/07/2026 07:30" på samma sida verifierar utkastets Q2-rad). Reservationen är inte fel — den är åldrad av händelser; D2 föreslår aktualisering vid verkställighet (body + description).

## 8. Könotiser

- **mx2 #3 PREC** (Precise Biometrics) = seriens sista ogranskade paket — fusionspaketet 0,28 mdr kr utan multiplar (CellaVision-radens notis); nästa granskares objekt.
- **Superlativfelklassen sprider sig uppströms:** mx1-femman (finans 2 + hälsa 3 + konsument 1) + nu mx2 (EVO 2) = åtta falska superlativer på sex granskade filer — seriens skrivprompt bör kräva superlativtest mot alla levererade paket FÖR bygg.
- **PEG-konventionen dokumenterad i källan** (StockAnalysis-fönstret): dataägaren spår 2 bör notera att nya insamlingsvindan bär konventionsmetadata — Volvo Group-fyndet generaliserar.

**KVD:** endast data/ + .zcode-/sonder (gitignorerade) + worklog = INGET bygge; src/ orörd (tsc-baslinjen orörd, pre-commit-grinden verifierar); R2 orörd (data/blogg/ orörd — publicering = kundens beslut); utkast-JSON:en orörd; syskonens ytor orörda (u2:s konsument-leverans + u1:s konsumentaktier-yta respekterade).
