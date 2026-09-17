# Granskning: ravarubolag-materialbranschens-cykel.json (branschguide, rotkön)

**Objekt:** `data/blogg-utkast/ravarubolag-materialbranschens-cykel.json` — UTKAST v1, skapat 2026-09-15 07:02, 9 870 byte, 1 234 ord.
**Granskare:** agentfabrik auto-s1-1789625727468 u1 (spår 1, 2026-09-17). Klagskydd: `data/vakten/auto-s1-1789625727468-u1-ansprak.md` (skriven före arbetet).
**Uppdragets ordagrätta objekt** (m9-utkast #1 boerspsykologi-fallstugor) är levererat sedan 09-14 (v151) + 09-16 (s1-u1, 02224ea4) — hela m9-serien 6/6 granskningsklar (8448ef77). Duplikatregeln tvingade pivot (fjärde s1-u1-pivoten i spåret: Volvo Car → Ericsson → energiaktier → detta). **Val:** ravarubolag = rotkönens äldsta olevererade branschguide enligt senaste köanteckning (telekom-granskaren 09-16 21:17), utan granskningsfil, utan klaim vid kontrollen.

## Metod

Sond `.zcode/granskning-ravarubolag-verify.mjs` (66 maskinella kontroller i släktstandard) + juridikgrind-vakt `--json` + HTTP-kontroll mot localhost:3000 + hypotesjakt på källbasen (sex baslägen testade). Medianmetod: medel av två mittersta vid jämnt n, null exkluderas med n-redovisning — seriens etablerade metod (materialbolagens-tillvaxt-precedenten).

## Källbas

Utkastet deklarerar självt sin bas på tre ställen: **100 bolag, tio per bransch, nyckeltal hämtade 2026-09-03** (Yahoo Finance + MarketStack). Den basen är maskinellt ren ur dagens `bolagsuniversum.json`: exakt 100 bolag med `hamtat=2026-09-03`, tio branscher × tio bolag; identisk med den committade f3f56268-versionen (09-03). Materialbranschens tio = utkastets namnlista exakt (Boliden, Newmont, SSAB, Norsk Hydro, SCA, Holmen, Billerud, Stora Enso, UPM, Yara — 10/10 tickermatch).

## Bevis: gröna kontroller

**Materialmedianerna 7/7 EXAKTA** (guidens kärntal, egna omräkningar ur 100-basen): P/B 1,309→"1,3" · P/E 18,491 (n=9, Billeruds null korrekt exkluderad)→"18,5" · EV/EBIT 17,728 (n=9)→"17,7" · rörelsemarginal 9,74 %→"9,7" · bruttomarginal 33,52 %→"33,5" · ROE 7,17 %→"7,2" · omsättningstillväxt 5 år −2,19 %→"−2,2".

**Detaljpåståenden 4/4 gröna:** Billerud P/E=null med ebitMarginal −0,65 % <0 — utkastets pedagogik ("division med negativt E ger ingen meningsfull multipel") är korrekt mot data · Yara P/E 8,29 = **lägst** av de tio → "8,3" rätt · Yara prognosTillvaxt-fält −0,2092 (decimalfält) = −20,9 % ≈ "−21 procent" rätt — *min sonds första tolkning läste fältet som procenttal och dömde fel; korrigerad formel före dom (indu-läxan: verifiera verktyget innan verktyget får döma)* · P/B<1 för **exakt** skogsfyran (BILL 0,72 · STERV 0,74 · SCA 0,80 · HOLM 0,91) och inga andra av de tio — "fyra av de tio… hela skogsgruppen" sant · "Ungefär halva värderingen": P/B-kvot 0,49 ✓.

**Juridik (2007:528) REN:** juridikgrind-vakt `--json`: `grund: true`, `fynd: 0` på filen (positiv dom; `flyttklar: false` beror endast på att ingen kontrollgranskningspost fanns — denna rapport är den) · rådverbsond: 1 träff "och **säljer** vidare till ett pris" = FALSK POSITIV (verksamhetsinfinitiv — råvarubolaget säljer produkten, inget råd; energiaktier-precedenten "sälja energi" samma bedömning, bokförd för vaktdataläggen) · inga konsument-/kakor-/GDPR-lagrum åberopade → ingen lagrumsblandningsrisk · disclaimer negerad sist: "_Detta är pedagogisk finansanalys, inte investeringsråd._" · varumärkesgrind 0/26 förbjudna fraser · genomgående metod-/kontrollram ("Tre kontroller när du läser", "Så fungerar metoden").

**911-kontroll:** 0 träffar på 6 mönster (911 · 9/11 · 11 september · september 11 · nine-eleven · 9-1-1), hel filen.

**Länkar 14/14 gröna:** 14 unika interna länkar alla HTTP 200 mot localhost:3000; 6/6 bloggmål konfirmerade som LIVE-filer i data/blogg/ (0 mot outgivna utkast — seriestandarden håller); 8/8 kursmål (km-009-pe, km-010-evebit, km-011-relativ-vardering, km-012-sum-of-the-parts-sotp, km-014-korrelation-diversifiering, km-029-scenarioanalys, km-030-margin-of-safety, km-045-materialsektorn) finns i deep-courses-data.ts.

**Struktur:** 1 234 ord (span 800–1400 ✓) · title 49 tkn (≤63 ✓) · description 151 tkn (≤161 ✓) · disclaimer sist · publishedAt 2026-09-15 = skapelsedatum (R2-not vid flytt).

## FYND

### B-serien — sifferbyt i universum-kolumnen (6 tal, 8 strängar)

Universummedianerna ("mot börsen som helhet") avviker från den deklarerade 100-basen på sex av sju fält — P/B 2,7 är rätt (2,676), resten inte:

| Fält | Utkastet | 100-basens median (n) | Diff |
|---|---|---|---|
| P/E | 20,4 | 20,52 (92) | −0,12 |
| EV/EBIT | 19,5 | 19,81 (95) | −0,31 |
| Rörelsemarginal | 21,2 % | 21,98 % (100) | −0,78 pp |
| Bruttomarginal | 47,8 % | 47,97 % (100) | −0,17 pp |
| ROE | 14,9 % | 15,02 % (97) | −0,12 pp |
| OmsCAGR 5 år | +3,5 % | +4,06 % (91) | −0,56 pp |

**Källjakt (honest bookkeeping):** sex baslägen testade utan att något reproducerar talen — 100-basen i dagens fil · committade f3f56268 (identiska medianer; originalens data oförändrad sedan 09-03) · 116-läget (100 + dagens 09-15-rader) · hela 144 · median-av-branschmedianer · bara-Sverige. Mönstret: material-kolumnen 7/7 exakt, universum-kolumnen systematiskt strax lägre. Mest sannolika förklaring: byggarens körning på ett ocommittat mellanläge av universumfilen (arbetsytan bar ocommittade rader under 09-14→09-15; BAS.DE hämtades 09-15 men committades först senare). **Konsekvensbedömning:** riktningsmässigt oskadliga (konturen "halva värderingen, halva marginalen" består: 9,7/22,0 = 0,44, "ungefär hälften" håller), men källraden deklarerar "100 bolag … 2026-09-03" på tre ställen — talen ska vara 100-basens. Åtgärd: åtta verkställbara byt (S1, S2, S3a–c, S5a–b, S6 i diff.json; rörelsetalet står på tre ställen, ROE på två).

### C1 — skadad sträng i kundtexten (verkställbart)

"den negativa femårstillväxten på intäktssidan är råvaruprisets eget**グラ**f" — två japanska katakana (U+30B0 グ, U+30E9 ラ) mitt i en svensk mening. Uppgift: sannolikt input-metod-olycka i byggsteget. Byt → "råvaruprisets egen graf" (strängen unik i filen).

### C2 — readingMinutes 3 → 2 (kontraktet)

1 234 ord ÷ 600 = 2,06 → 2. Seriens systematiska 3-slip, nu maskinellt bevisad för ravarubolag (teknikaktier-granskningen listade den redan bland bärarna; kur hör hemma i byggarverktyget — upprepad flagga åt fabriksägaren).

### C3 — "tio svenska och nordiska bolag" är falskt för ett av tio (verkställbart)

Newmont (NEM) har land=**USA** (lägen: 5 Sverige · 2 Norge · 2 Finland · 1 USA). "svenska och nordiska" exkluderar just det bolag som texten själv lyfter i nästa mening. Byt → "Universumets tio materialbolag".

### F-serien — förslag (beslut krävs)

**F1a/F1b — "enstensbilden"/"stenbilden".** Brödtexten "Den andra fällan är **en­stensbilden**" är inget svenskt ord (uppenbart skadad), och kopplingen till rubrikens "Cykelns två fällor: P/E och **stenbilden**" är dunkel — läsaren kan inte koppla samman. Trolig avsedd term: **stillsbilden** (ett fruset ögonblick av en rörelse — exakt vad definitionen säger: "att läsa ett år som läget"). Förslag: F1a byt brödtexten → "är stillsbilden"; F1b rubriken → "P/E och stillsbilden" (endast tillsammans med F1a). Om byggaren avsåg ett ordspel (cykel + sten) ska i stället termen definieras vid första användning — men någon definition saknas idag.

**F2 — publishedAt-konvention.** Värdet 2026-09-15 är skapelsedatum; vid flytt till data/blogg/ ska det stämplas till faktisk publiceringsdag (publicering = kundens beslut, R2). Seriekonvention sedan teknikaktier-D3.

## Noter (ej rättning i utkastet)

- **Aktualisering åt fabriksägaren:** universumet har vuxit 100→144 (material 10→14: BASF 09-15, BHP 09-16, Rio Tinto 09-16, Holcim 09-17). Utkastet förblir korrekt mot sitt kvitto-underlag (100-basen) — regenererings-cadans-frågan är samma flagga som utdelningar-101/KONTROLL-familjen.
- **Tumregel utan källa:** "en marginal 40 procent över sin egen historiska median har historiskt oftare varit en topp än ett nytt normaltillstånd" — försiktigt formulerad metodregel i utbildningsramen, godkänd; noteras för transparens.
- **Vaktdatalägg:** "säljer vidare" som falsk positiv föreslås additionsfall i juridikgrindens negationslista (samma familj som energiaktiers "sälja energi").
- **Sammanställningsägaren:** GRANSKNINGSKO-SAMMANSTALLNING.md saknar fortfarande ravarubolag-raden ("granskad 2026-09-17, flyttklar efter B-serien + C1–C3").

## Dom

**Bedömning: FLYTTKLAR EFTER RÄTTNING** — guidens kärna (materialmedianerna 7/7, detaljpåståendena 4/4, juridiken, 911, länkarna 14/14) är grön; rättningarna är arton exakta teckenbyten i universum-kolumnen, en skadad sträng, readingMinutes, Newmont-formuleringen. Publicering förblir kundens beslut (R2).

*Granskaren skriver inte om andras filer — alla ändringar går via diff-filen `ravarubolag-materialbranschens-cykel-diff.json` (11 byt + 3 förslag, samtliga söksträngar maskinellt verifierade unika i källfilen).*
