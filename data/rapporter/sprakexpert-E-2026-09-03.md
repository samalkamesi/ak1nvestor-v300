# Språkexpert E — manuell granskning + rättningar (pass 1 av 2)

**Datum:** 2026-09-03 (uppdrag daterat 2026-09-01)
**Omfattning:** ALLT UTOM kurserna — bokkanon, case, blogg, llms.txt-texter, synliga UI-strängar i ak1a-komponenter.
**Metod:** 100 % manuell genomläsning av bokkanon.json (102 böcker), case-studies.json (201 case), llms.txt (fulltext), samtliga 35 blogg-JSON:ers metadata + mönstersökning och riktad läsning av bloggkroppar; komponenterna huvudmeny, sidfooter, social-proof, dela-kort, vecko-plan, assistent-panel, dashfraga-kort (manifest-*.tsx finns inte i kodbasen). Rättningar kirurgiska: data/*.json + public via node, src/*.tsx via Edit-verktyget (endast stränginnehåll, ingen kod/logik/klassnamn).

**Sammanfattning: 356 strängrättningar fördelade på 46 filer. Alla JSON-filer validerade efteråt.**

---

## 1. Rättningar per yta

### data/bokkanon.json — 53 rättningar (varför + lärdomar, 102 böcker)
- **Maskinspår/garbleringar (7):** "Skråpstrategin"→Skivstångsstrategin (bk-076, barbell-strategin), "Lång segerville"→En lång vinstsvit (bk-071), "Gör tillräckligt bra beskap"→Gör det tillräckligt bra (bk-033), "pytsas upp"→piffas upp (bk-044), "kostnadsrekenomen"→kostnadsaritmetiken (bk-052), "långa överkast"→långa staplar (bk-023), "mikrosekundstrukturer"→mikrosekundsfördelar (bk-089).
- **Fel ord/termer (8):** "trendkanler"→trendkanaler + "huvud-axel-skuldra"→huvud-axlar (bk-022, svensk term för head and shoulders), "spinnoffs"→spinoffs (bk-012, bk-017), "halvhögre volym"→femtio procent högre volym (bk-025), "ombyteskostnad"→omställningskostnad (bk-048, switching cost), "räntemarginal"→avkastningsmarginal (bk-009), "superstiget"→superhausset (bk-086), "skalning"→skalförstoring (bk-095).
- **Norska/danska spår (2):** "lete stabilitet"→leta (bk-048), "skuldquotan"→skuldkvoten (bk-080).
- **Engelska läckor (6):** "en konstruerad narrative"→berättelse (bk-037), "regime"→regim (bk-077), "feedbackslingor"→återkopplingsslingor (bk-035, bk-073), "compounda"→växa med ränta på ränta + "EPS-tillväxt OCH multipel-expansion"→ EPS-tillväxt och multipelexpansion (bk-101), metadataläckan "(V20)" borttagen ur lärdomstext.
- **Grammatik/kongruens (12):** genusfelet "tidslig ram"→tidsram (bk-026), "blodigt konkurrensstrider"→blodiga (bk-030), "var borgenären"→där (bk-046), "enda försvaret"→det enda försvaret (bk-049), "av inneboende värde"→av det inneboende värdet (bk-050), "bubbels bränsle"→bubblans (bk-073), "de 365 aktier"→aktierna (bk-101), "tvingar dig definiera"→att definiera (bk-063), "setup du förstår"→setups (bk-070), "Förlusten gör dubbelt så ont som vinsten känns bra"→En förlust gör dubbelt så ont som en lika stor vinst känns bra (bk-075), "aldrig punktformade säkerheter"→aldrig säkra punktprognoser (bk-078), "sannolikhets spel"→sannolikhetsspel (bk-066).
- **Meningsreparationer (6):** bk-033 "Skilj på att gå bra och att gå i kris"→"Skilj på att bli rik och att förbli rik" (Housels faktiska läxa), bk-034 verbform, bk-043 dubbla kolon, bk-081 "svaret låg"→fanns, bk-099 "slår stort på"→har stor effekt på, bk-097 "sök kombinerade moats"→flera kombinerade moats.
- **Övrigt (12):** "i usa"→i USA (bk-082), "Effektiva marknads-hypotesens"→marknadshypotesens (bk-031), "pris mål"→prismål (bk-027), "sjufakters-modellen"→sjufaktorsmodellen (bk-061), "Squeezen"→Squeeze (bk-068), tankstreck i "sju-åtta procent" (bk-025), 1962–2014 (bk-101), kommatecken i bk-001/bk-002/bk-048/bk-066.

### data/export/case-studies.json — 143 rättningar (201 case)
- **Systematisk enhetsförväxling MUSD/M€ = miljarder (18):** SVB -1,8/42, Archegos 36/10, Terra 60, Wirecard 24/1,9, Luckin 12/2,2, WeWork 47/5,8/8, Nokia 150, BlackBerry 80, Kodak 30, Credit Suisse 5,5 → "mdr USD/euro". NOT: Blockbuster 50 MUSD, Tyco 600 MUSD, Yahoo 1 MUSD, MySpace 580/35 MUSD, Barclays 290 MUSD är verkliga miljoner och lämnades orörda.
- **Engelska läckor (55+):** "Early warning"→Tidig varning i alla 19 titlar + outcomes + lessons; "fraud"→bedrägeri i 8 titlar/lärdomar (bl.a. "Kinesisk fraud", "Telekom-fraud", "möbel-fraud", "skog-fraud"); "bank run"→bankrush (4); "systar-företag"→systerbolag (4); "competition"→konkurrens; "profit"→lönsamhet (4); "opportunity"; "biased"; "business"→företagskunder; "Swedish tech-darling"→Svensk techfavorit; "Cisco's"→Ciscos; "SVT's"→SVT:s; "1990s"→1990-talet (2).
- **Norska spår:** "grönn omställning/grönn katalysator"→grön (6 förekomster), "Medlemsägt"→Medlemsägd (Södra).
- **Garbleringar (12):** "patentklipp"→patentbrant (4, korrekt svensk farmacterm), "Galengång ledning"→Galen ledning, "VD-galengång"→galen VD, "galen corporate governance"→allvarliga brister i bolagsstyrningen, "Spansk fastitet"→fastighetskris, "Rescuerad"→Räddad, "enhetsförlost"→enhetsförlust, "Tillray-konsument"→Tilray, "fraud-misstänkte/buyback-misstänkte"→misstanke, "Marknadsandel-fall + produkten-ej-innovativ"→Fallande marknadsandelar + produkt utan förnyelse.
- **Grammatik/termer (12):** genusfelet "Långsiktig tänkande"→Långsiktigt tänkande, "en av Norden mest"→Nordens, "vacuum"→vakuum, "skogskooperation"→skogsägarkooperativ, "Nobel-pris-vinnare"→Nobelpristagare, "Största bolån-utlåning"→bolåneutlånaren, "FDA-granskning"→FAA (Boeing granskas av FAA, inte FDA), "737 MAX krävde 2 krascher"→två krascher, "öppja"→öppna, "FDA"/"SPV"-klass fel, "i trappor"→i omgångar, "Starkt subjekt"→Starkt bolag, "(spanien)"→(Spanien).

### data/blogg/*.json — 41 rättningar (35 filer)
- **Beskrivningar (8):** "Rikningen"→Riktningen (skuldsättningsgraden), "dyrt volymmande"→dyr volymtillväxt (ROIC), "bias-dommen"→bias-domen (portföljrapport ×2), 5 stycken hårt avkapade descriptions ("…fällor och hur Lynch,") kapade rena till "…definition, uträkning och fällor." (V12–V15, V17).
- **Kroppar (33):** "uppstår av accident"→av en slump, "mot varje ett konkret motmedel"→med ett konkret motmedel mot varje, "inget ram"→ingen ram (nybörjarmisstag), "öppja"→öppna (V17), "utspäddar"→utspäder (V19 ×3), "riskavös"→riskavert, "arbetarkapital"→arbetskapital (V19 ×3 — rätt svensk term är arbetskapital/rörelsekapital), "komplett guiden"→den kompletta guiden, "en av de 20 variabler"→variablerna (20 filer).

### public/llms.txt — 112 rättningar (textavsnitt, ej URL-listor)
- **Egna texter (27):** "analyspipelina"→analyspipeline, "nivåer som matter"→spelar roll, "Huvu-och-skuldror"→Huvud-och-axlar, "panik eller opportunity"→möjlighet, "sälj låg, köj hög"→sälj hög, köp låg (stavfel OCH inverterad rebalanseringslogik), "Dorseyfyra"→Dorseys fyra, "biased"→snedvridna, "Leonardo of Pisa"→från Pisa, "spelarbok"→spelbok, "Kostnads-determinismens"→särskrivning borta, "real avkastning"→realavkastning, "procentsband felar"→misslyckar, "'Averaging down' fara"→Faran med 'averaging down', "mentalmodeller"→mentala modeller, "den fina ledarskapets paradox"→ledarskapets fina paradox, "utspäddar"→utspäder (×3), "den nio steg"→de nio stegen, "regulation"→reglering, "skärma fram"→sålla fram, "regering-kund"→regeringen som kund, "Simon Ramo"→Simon Ramos (namnet Ramo), "Richard Dennis påstående"→tes, "även när det borde göra det inte"→korrekt ordföljd, "Rikningen"/"volymmande"/"bias-dommen" i speglad bloggtext.
- **Labb-case-spegling (85):** samtliga case-rättningar ovan applicerade även på llms.txt:s spegelade case-beskrivningar (samma källdata).

### src/components/ak1a/*.tsx — 7 rättningar (ENDAST synliga strängar, via Edit)
- **huvudmeny.tsx (3):** menyavdelaren "Grundänkning"→"Grundtänkande" (icke-ord), "nyheter rangerade"→rangordnade, "Grahams cigar-butts"→cigarettfimpar.
- **social-proof.tsx (2):** "redan översatt till svenska steg"→"steg för steg på svenska" (garblering i statist-etikett), "Quiz:en tvingar mig"→"Quizfrågorna tvingar mig" (fel kolon-användning; svenska regeln kräver inte kolon efter helt ord).
- **dela-kort.tsx (2):** "Dela det var du vill"→där du vill, "Klistra in var du vill"→där du vill (var/där-förväxling i två toast-texter).
- **sidfooter.tsx, vecko-plan.tsx, assistent-panel.tsx, dashfraga-kort.tsx:** felfria — inga ändringar.

---

## 2. Tre värsta fynd

1. **Systematisk enhetsförväxling i case-databasen: "MUSD"/"M€" används om miljarder.** SVB:s förlust "-1,8 MUSD" (=$1,8 mdr), Archegos "36 MUSD exponering" (=$36 mdr), WeWork "värd 47 MUSD", Wirecard "1,9 M€ falsk kassa" — alla var i verkligheten miljarder, men MUSD betyder miljoner. En användare som lär sig av dessa case får fel storleksordning på allt. Rättat till "mdr USD/euro" i 18 fall (case + llms-spegel). Kvarvarande MUSD är verifierat äkta miljoner (Yahoo 1 MUSD 1998, Blockbuster 50 MUSD m.fl.).

2. **Norska/danska överlagringsspår i maskinöversatt batch:** "grönn omställning" (grön), "lete stabilitet" (leta), "skuldquotan" (skuldkvoten), "bias-dommen" (domen), "Medlemsägt" (medlemsägd) — samma felklass i tre olika dataytor, tydligt spår av nordiskt grannspråk i genereringspipelinen. Rättat överallt.

3. **"Köj hög" + inverterad rebalanseringslogik i llms.txt:** kursraden löd "Uppdatera AKM1, sälj låg, köj hög" — dels stavfelet "köj", dels den exakt omvända principen mot sidans egen rebalanseringskurs ("Sälj vinnare, köp förlorare"). Ett språkfel som samtidigt förmedlar felaktig investeringspedagogik; rättat till "sälj hög, köp låg". Samma felklass: "FDA-granskning" av Boeing 737 MAX (skall vara FAA — livsmyndighet vs. livsmedelsmyndighet).

---

## 3. Anmärkningar till pass 2 / övriga experter

- **Antalsdiskrepans i llms.txt-rubriken:** "318 kurser, 87 böcker" vs huvudmenyns "82 böcker" vs bokkanon.json:s 102 böcker — inte ett språkfel, men bör synkas av innehållsansvarig.
- Medvetet lämnade (stilnivå, ej fel): telegraferande case-stil ("X = Y"), etablerade finanslån ("moat", "compounder", "edge", "bias", "switching costs"), "narrativ/narrativdriven", "idag/i dag".
- Comment-fel i kod (t.ex. "Planen räks på klienten" i vecko-plan.tsx) lämnade orörda — utanför mandatet (endast synliga strängar).
- Känd men orörd faktaosäkerhet: case C103 anger "Saud-al-Rajhi" som kapitalvägrare vid Credit Suisse (var SNB:s Ammar Al Khudairy) — innehåll, inte språk; flaggas för case-ansvarig.
