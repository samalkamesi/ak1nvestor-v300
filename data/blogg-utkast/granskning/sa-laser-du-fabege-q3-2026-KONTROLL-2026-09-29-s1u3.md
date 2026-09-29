# KONTROLL — Fabege Q3-2026 läspaket (kvartalsrapportserien)

**Granskare:** fabriksagent s1-u3 (manifest auto-s1-1790653512758, granskningskön 3/3) · 2026-09-29 ~04:0x–04:4x lokal
**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-fabege-q3-2026.json` (v1, byggare s4-u1 "Fabege" 2026-09-19 09:50 · utkast-md5 `6f057f31657bf4673f15f8b4cd06a532` — orört av denna granskning)
**Uppdrag:** källor, siffror, juridik-språk (2007:528), 911-referenser → flyttklart paket med diff-rapport.
**Pivot (öppet bokförd):** titelns "m9-utkast #3" (kassaflodesanalys-101) levererad ≥4 gånger — senaste konstaterande worklog 17305 (2026-09-24): "m9-familjen 6/6 FLYTTKLAR sedan 09-21" ⇒ FIFO enligt kö-notis 17074 (worklog s1-u3 2026-09-21): *"Kö efter denna: fabege/getinge 10-20 → 10-21-klustret"* ⇒ **fabege = FIFO-etta bland kontrolllösa** (verifierat 2026-09-29: 0 fabege-granskningsfiler bland granskning/-mappens 221 filer). Anspråk disk-först (data/vakten/auto-s1-1790653512758-s1-u3-ansprak.md); syskon u1/u2 hade inga anspråk/loggar på disk vid skrivandet.

## Dom: GRÖN GRUND — FLYTTKLAR EFTER RÄTTNINGAR (F1–F6 via diff; paketet bär alla kurer)

Sond `verktyg/_s1u3-fabege-q3-kontroll.mjs` (slutlig omkörning): **69 OK · 6 FEL (= fyndens belägg) · 10 NOT** efter fyra ärligt bokförda+rättade+omkörda sondbuggar (parentesbalans i länkextraktionen; nr()-precision 2 dec mot heltalsfacit; P/B-rangens riktning — näst lägst stigande = index 1, inte 14; flyttalsjämlikhet 72,81−72,80 samt mellanstegstoleranser). Sonden LÄSER ENDAST.

### Grönt kärnlys (utkastets bärande struktur)

- **KÄLLOR 16/16 exakta** mot FABG.ST-posten: pris 72,80 · mcap 22,901 mdr · hämtat 2026-09-03 · P/E 53,139 · P/B 0,614 · EV/EBIT 24,894 · PEG 5,07 · FCF-yield 0,077 · ROE 1,15 · ROIC 3,21 · netto 10,87 · FCF-marg 44,46 (%) · TTM 14 · prognos −5,01 · skuld/EK 0,9692 · räntetäckning null · insider 0 · golv 118,56/38,59 %/tillgångstung · serier 3 032→3 366→3 438→3 480 och +2 376→−5 518→−213→−348 · noteringens förbehåll (4 år · proxy · osatt · ingen dubbelkoll) speglas ärligt i texten.
- **MEDIANER & RANG mot byggvintage:** grenens 16 bolag; medianer exakta (P/B 0,9355 · P/E 12,909 · EV/EBIT 24,589 · ROE 8,51 · netto 44,1 · FCF-marg 31,39 · ROIC 4,56 · EBIT 58,43 · FCF 4,07 · skuld 1,090 · prognos 2,04 · PEG 4,16); universummedianerna bärs av 201-post-vintagen 48916d8c (P/E 20,80 · P/B 2,807 · ROE 15,34 · netto 14,0 · prognos 13,37 · EV/EBIT 18,085 · FCF 3,94 · PEG 1,375); rang 7/7 verifierade (P/B 2/16 med Vonovia 0,480 under · P/E 2:a med Equinix 65,98 över · FCF-yield 2:a av 15 med Unibail 9,51 · ROE lägst av 15 · netto lägst av 16 · skuld 6:e lägst · prognos 6:e lägst, ett av sju negativa med Vonovia −56,8/Simon −53,3).
- **ARITMETIK ~35 kontroller gröna**: dubbelstängningen 53,139 × 0,0115 = 0,6111 mot 0,614 (−0,47 %) · direktvägen 22 901 ÷ (0,614 × 314,6) = 118,557 mot golv 118,56 · aktietalet 314,6 · TTM-trion 431/378/−348 med svängen 779 (= 2,2 årsresultat) · PEG-trippeln 25,4/0,48/10,61 · substanserna 49,44/38,60/21,5 % · **scenarioruta 9/9 celler exakta med rabatten 49,44 %** (mittencellen 72,81 stänger mot kursen 72,80 på en öre — textens egen kalibreringsnot) · räknesatser 3,03/7,20/2,4×/0,976/−9,8 % · multipelövning 62,9/38,6/97,8 % · trappan 4×kvartalsspåren · direktavkastning 3,0 % · oms-CAGR 4,7 % · tregångsmätaren 34,4/78,1/4,1× · kapitalbasen >73 mdr · förvaltningssteget +18 % (17,66 avrundat).
- **JURIDIK 2007:528 REN på alla vägar**: kontrolleraText-spegel (26 fraser ur data/varumarke.json, RegExp giu) 0 FEL 0 VARN på hela ytan · rådglossor 0 · "rekommendation" 2 träffar, båda negerade (ingress + slutdisclaimer) · exakt en lagrumsfamilj (2007:528 2 kap 5 §), ingen blandning · utbildningsgrunden bärande ("utbildning i metod", övningsramen, "skattningar tillhör inte detta paket", "räknestorhet, aldrig som skattning").
- **911 = 0** på sex mönster (åttonde granskade serien i släktet — ren).
- **LÄNKAR**: 19 interna HTTP 200 mot localhost:3000 (deploylåset FRITT — medie-lärdomen följd) + mfn.se 200; fabege.se-länken se F5 nedan.
- **STRUKTUR**: H2 = 7 (familjestilen: Castellum/NP3/Wallenstam 7) · title 257 tkn inom taket 314 · desc 394 inom spannet · publishedAt 2026-10-21 = rappdagen (Kinnevik-konventionen) · tags 6 · Källor + disclaimer + R2-sista. Kalenderns rytmer (23/4 + 6/7 07:30) och 2026-10-21 = onsdag verifierade; rappdagen 21/10 bär MFN-utlysningen (texten) + Inderes-noten (kalenderfilen).

## FYND — F1 väsentligt (attribuering), F2–F6 rättningar; kurer i diff + paket

**F1 (VÄSENTLIGT — attribueringsfel, narrativbärande): "universumets EBIT-marginal 59,49 procent" är FALSKT.** 59,49 % är FABG:S EGET EBIT-fält (`lonksamhet.ebitMarginal = 0.5949`); universumets EBIT-median i byggvintagen är 20,71 %. Parentesen "(grenens median 58,43 — Fabege mitt i)" avslöjar att siffran avsågs som bolagets fält mot GRENENS median — men attribueringen "universumets" förleder läsaren 38 procentenheter fel. Kur (minimal, ingen ny vintage-beroende siffra): "universumets" → "fältets".

**F2 (aritmetik, 2 ytor): FCF-yieldvägens kassaflöde är 1 763 Mkr, inte 1 766.** Fältet är exakt 0,077; 0,077 × 22 901 = 1 763,4. Textens 1 766 (Test 5 + källradens ekvation "0,077 × 22,901 = 1 766 Mkr") förutsätter fältet 0,0771 som källan inte anger. Per aktie 5,60 (ej 5,61). Gapet "plus 14 procent" bär oavsett (13,96/14,2). Wihlborgs-B7-klassen: källradens ekvation stämmer inte på sina egna tal. Kur: 1 763 + 5,60 på båda ytorna.

**F3 (källkritik): hyresintäkternas två böcker, 3 480 mot 3 408, osynliggjorda.** Universumfältets 2025-intäkt = 3 480 Mkr (Yahoo) medan källradens EGNA MFN-citat säger "hyresintäkter 3 408 Mkr mot 3 438" — 72 Mkr (2,1 %) divergens inom samma utkast, utan not. Nyckeltalssektionen och Test 2 räknar på 3 480. Paketets Text 4 ("bestäm FÖRST vilken bok du mäter mot") förtjänar att hyresintäkts-divergensen själv följer sin regel. Kur: en not i Test 2 ("två böcker, båda redovisade").

**F4 (andelsangivelse): "en tredjedel" → nästan hälften.** Resultatet −348 mot substansrörelsen −711: 348/711 = 0,49. Enda vägen till "tredjedel" är 348/(711+348) = 0,33 — oklar definition som texten inte anger. Kur: "nästan hälften".

**F5 (död länk): fabege.se/om-fabege/investors = 404.** Sond-fetch 404 (även med trailing slash). Kalenderunderlagets egen käll-URL (hämtad 2026-09-15) är `/en/about-fabege/investors/` — byggaren svenskade sökvägen och tappade /en/-segmentet. Kur: /en/about-fabege/investors/ (verifierad 200; även fabege.com-varianten lever).

**F6 (konvention): readingMinutes 5 → 6.** Kvartalskonventionen round(ord/600): bodyn 3 368 ord → round(5,61) = 6. Syskonen gröna på 5 (Castellum 3 125 · NP3 3 098); Wallenstams rm 5 vid 2 634 ord är familjens tidigare avvikare — den mekaniska regeln vinner (Kinnevik/wihlborgs-AV1-precedensen). Efter kurerna 3 390 ord → 6.

## C-NOTER (utan kur — dokumenterade för ägarens nästa ratt)

- **F7 (vintage-instabilitet):** universumtabellens skuld-median 0,520 bärs av 195-vintagen (73745b24, median exakt 0,52) medan 201-vintagen som bär övriga kolumner ger 0,51 (dagens fil 0,59) — byggarens mellan-vintage inom det deklarerade intervallet "166–201 poster". Slutsatsen "vida över universumets" (FABG 0,9692) bär oavsett. Texten rättas EJ (Nordea-vintage-metoden).
- **EK-artefakten:** textens "118,57 mot 118,56 — gapet 0,01 procent" bygger på mellanstegsavrundning; direktvägen ger 118,557 (gap ~0,00 %). Kärnpåståendet "stängt under ett halvt procentsteg" bär oavsett.
- **Trunkeringar** 21,4 (21,46) och 34/78 (34,4/78,1): flyttalstrunkering — wihlborgs-D1-klassen, defensible.
- **Serienumret** "53:e"/"52 på disk": byggtidens internkonsistens — historien äger numret (idag 93 kvartalsfiler).
- **Universumdrift:** dagens fil 316 rader; FABG-fältposten identisk sedan 2026-09-03 ⇒ talen stabila.

## LEVERANS

- `granskning/sa-laser-du-fabege-q3-2026-KONTROLL-2026-09-29-s1u3.md` (denna rapport)
- `granskning/sa-laser-du-fabege-q3-2026-diff-2026-09-29-s1u3.json` (fynd + belägg + verkställningsguide + franStrangar)
- `granskning/sa-laser-du-fabege-q3-2026-FLYTTKLART-PAKET-2026-09-29-s1u3.json` (utkastet + ALLA sex kurer maskinellt tillämpade, efterverifierat: kontrolleraText 0/0 · 911 = 0 · gamla felsträngar 0 · IR-länk 200 · rm 6 · utkastet självt orört md5 6f057f31…)
- Sond `verktyg/_s1u3-fabege-q3-kontroll.mjs` + anspråksfil + KO-rad + worklog-rad.

Publicering förblir kundens beslut (R2). data/blogg/ orörd.

— s1-u3 (granskare 3/3)
