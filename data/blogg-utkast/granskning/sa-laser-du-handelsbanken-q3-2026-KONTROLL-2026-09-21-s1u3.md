# KONTROLL 2026-09-21 — Handelsbanken Q3-2026-läspaket (oberoende granskning, s1-u3)

**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-handelsbanken-q3-2026.json` (byggd 2026-09-16 02:44, kvartalsfamiljen — seriens andra bankpaket)
**Granskare:** agentfabrik s1-u3 omgång auto-s1-1789980325227 (granskare 3/3). Val enligt kvartalspaketens rappdags-FIFO (NP3-presedensen): SHB 10-01 = tidigaste rapportdagen bland i granskning/-mappen ogranskade sa-laser-du-paket (61 saknade kontroller vid start; jpmorgan granskat under äldre namnkonvention `kvartal-2026-q3-jpmorgan.md`). Anspråk disk-först `data/vakten/auto-s1-1789980325227-s1-u3-ansprak.md` (skrivet före arbetet för forskningslaget-pivoten; HB-vallet dokumenteras här och i worklog).
**Metod:** samtliga tal EGENOMRÄKNADE ur källor på disk; medianer replikerade mot **byggvintagen** (se B1) med projektets konvention (`median()` i src/lib/dataset-nyckeltal.ts: udda → mittersta, jämnt → medel av de två mittersta; null exkluderas, aldrig som noll). Sond: `verktyg/_s1u3-hb-q3-kontroll.mjs` — **49 OK · 7 FEL (= fynd B1+B2:s maskinella belägg) · 5 NOT**. Utkast-JSON:en orörd.

## Dom

**FLYTTKLAR EFTER RÄTTNINGAR.** Källraden, vågvalideringsdomarna, kalendern, identitetskontrollen, PEG-matchningen, scenariorutan (9/9 celler), rättesatserna och hela den juridiska ytan är gröna. Två fynd kräver åtgärd: **B1** — åtta medianvärden i branschjämförelsen är oreproducerbara med projektets median()-konvention (de motsvarar exakt nedre-mittersta-konventionen; troligen en hybrid vid bygget 02:44 mellan två commit-lägen 01:44/08:30) — och **B2** — readingMinutes 6 matchar ingen av seriens konventioner (ord/600 ger 3, ord/200 ger 10). Publicering förblir kundens beslut (R2).

## Kontrollblock

**Källor och aktualitet — seriens renaste bankfall:** SHB-A.ST-raden i `data/portfolj-system/bolagsunivers.json` är **identisk mellan byggvintagen 9839c530 (120 rader, 09-16 01:44) och dagens fil (242 rader)** — universum-driften (spår 2:s +122 bolag) har inte rört raden: pris 148,6 · mcap 297,908 mdr · P/E 12,414 · P/B 1,596 · EV/EBIT 47,358 · PEG 18,54 · ROE 12,75 % · EBIT-marginal 50,09 % · netto 42,58 % · brutto 0 · CAGR 4,17/3,39 % · TTM −3,8 % · prognos 5,32 % · insider 0 · stabilitet null ×5 · serier 2022–2025 (50 249/62 249/62 345/56 796 mdr; resultat 21 468→…→23 7xx Mkr) · källor Yahoo 09-03 + MarketStack "ingen färsk data". Vågvalidering-SENASTE.md md5 oförändrad (b7194627…); domprotkoll-raden SHB-B.ST ordagrant: mikro basbygge miss (−11,3 %) · kort basbygge miss (22 %) · medellång impulsvåg träff (13,1 %) · lång osatt · mega impulsvåg träff (13,1 %); basbyggetröskeln ±6 % är domprotokollets egen formulering. Kalender-finans.json: rappdag **2026-10-21 (onsdag — datumaritmetik verifierad) kl 07:00 CET**, fastslaget av bolaget i Q2-rapporten 2026-07-15, pre-close call 2026-09-30, källor handelsbanken IR (officiell) + MarketScreener.

**Medianer 10/18 EXAKTA med projektets konvention** mot byggvintagen 9839c530: finans P/E 14,08→14,1 (n=12) · P/B ~2,01 (n=10 efter exkludering av Nordeas 21,537 — textens "21,5" är korrekt avrundning — och Berkshires 0,001) · ROE 14,55 % · EBIT 50,39→50,4 % · prognos 5,94 % · PEG 2,12; universum P/E 20,52→20,5 · ROE 15,34 % (n=117 med värde — exakt) · EBIT 21,11→21,1 % · oms-CAGR 3,32 % · PEG 1,73. SEB (14,37→14,4/1,945→1,95/14,08→14,1 %) och Swedbank (13,79→13,8/2,066→2,07/15,02→15,0 %) exakta. De övriga åtta: se B1.

**Aritmetik 9/9 gröna:** identiteten P/E = P/B ÷ ROE: 1,596 ÷ 0,1275 = 12,5176 → 12,5 mot källans 12,414 = avvikelse 0,8 % (textens tal exakt; kontrasten till Nordea ×10 och ABB ×9 bärs av källorna). PEG-matchningen: 12,414 ÷ 18,54 = 0,67 %/år implicit; med prognos 5,32 → PEG 2,33; med CAGR 3,39 → 3,66. Scenariorutan 9/9 celler exakta (25 943/27 596/29 248 · 26 745/28 449/30 153 · 27 548/29 303/31 058 mkr). Rättesatser: 1 pp marginal = 568 mkr · 3 % volym = 853 mkr (vägd med marginalen 50,09 %) · 3 pp marginal = 1 704 mkr; vikterna 1,50× och 2,00× exakta ("drygt 1,5" och "dubbelt" sanna). Övning 2: 1,60 ÷ 0,1455 = 10,997 → 11,0. Serie-stegen 2025: omsättning −8,90 % (text −8,9) · resultat −13,57 % (text −13,6) — ur seriens exakta Mkr-värden.

**Juridik — REN enligt 2007:528.** kontrolleraText-spegel (26 fraser, RegExp "giu") på HELA ytan (title+description+tags+body): **0 FEL · 0 VARNINGAR**. Rådgivningsglossor 0. "rekommendation" exakt 1 gång — negerad i ingressen ("inte en rekommendation att köpa, sälja eller behålla"). "råd" endast i negerad mening ("inte råd om att köpa, sälja eller behålla något värdepapper"). Exakt en lagrumsfamilj: 2007:528 + 2 kap 5 § (disclaimern) — 2022:260/2022:261/1985:716/2005:59/2022:482 alla frånvarande. Utbildningsgrunden bärande genomgående ("utbildningspaket", "Detta är utbildningsmaterial i en metod", "övning i mekanik, inte en avläsning"). Träffprocentens inramning korrekt ("aldrig en garanti om framtiden, och aldrig ett mått på värde"). PEG-notisen redovisar ohärledbar siffra "utan tolkning" — den ärliga formen.

**911: 0 träffar** på sex mönster i textytan — sondens enda råträff var siffersekvensen i MarketScreener-URL:ens bolags-ID (…SVENSKA-HANDELSBANKEN-AB-**6491123**/calendar…), maskinellt exkluderad som URL-id (sondbuggklassen dokumenterad; text-ytan ren).

**Länkar.** 15 unika interna: **15/15 HTTP 200** mot localhost:3000 (/bolag/shb-a-st · 11 dataset/finans-aspekter · /kurser · /transparens · /kallor). Deploylåset FRITT vid länkdom (medie-lärdomen följd). Externa: handelsbanken IR **200**; MarketScreener **403** (bot-skydd — servern svarar; källan dokumenterad i kalenderunderlaget med hämtdatum 09-15).

**Struktur.** H2 = 8 (familjestilen) · title 123 tkn (tak 314) · description 414 tkn · tags 7 sökordsbärande · Källor-sektionen sist med 5 poster. publishedAt 2026-10-19 — se C1.

## Fynd

**B1 (VÄSENTLIGT — medianernas konventionsblandning; sondens sex rödmarkerade bärare):** åtta medianvärden kan inte reproduceras med projektets `median()`-konvention mot NÅGOT av de två commit-lägen som omger bygget (9839c530 120 rader kl 01:44 — bygget 02:44 — 37aecd55 125 rader kl 08:30). De motsvarar EXAKT nedre-mittersta-värdet på 120-läget, medan de övriga tio kräver medel-konventionen: finans nettomarginal 37,8 (medel 39,19) · finans oms-CAGR 7,13 (7,35) · finans res-CAGR 10,42 (12,07) · universum P/B 2,77 (2,79) · universum netto 14,1 (14,31) · universum res-CAGR 1,40 (1,57) · universum prognos 9,67 (9,94). Ingen enskild (fil, konvention)-kombination ger textens hela medianuppsättning — sannolikt en hybrid född i arbeträdet mellan commitpunkterna. Inget tal är vilseledande (varje värde är ett verkligt mätvärde i mängden; avvikelserna är 0,02–1,7 pp), men jämförelsen mot aspektsidorna (som använder projektets konvention) blir skev, och vintage-låsningen ("n=120") förlorar sin beviskraft när konventionen är odefinierad. Kur (kirurgiska byten i diff-filen): räkna om de åtta med projektets median() på 120-vintagen — 39,2 · 7,35 · 12,1 · 2,79 · 14,3 · 1,6 · 9,9 (prognosraden) — eller lås konventionsvalet explicit i Källor-sektionen om ägaren föredrar nedre-mittersta. Verkställs av paketets ägare (s4/byggaren) eller nästa våg.

**B2 (VÄSENTLIGT — paketkonventionen; Kinnevik-B3:s släkting):** readingMinutes 6 vid 1 955 ord matchar ingen av seriens konventioner — kvartalsfamiljens round(ord/600) ger **3** (Kinnevik: 2 946 ord → 5 = round/600), bloggens ord/200-ceil ger 10. Kur: 6 → 3.

**C1 (notis — publishedAt-konventionen):** 2026-10-19 är två dagar FÖRE rappdagen; Kinnevik-konventionen är rappdagen (10-15). Pre-rapport-logiken är meningsfull för ett läspaket (läsas FÖRE rapporten) men avviker från familjen — ägarens beslut; om 10-19 står kvar bör det vara ett medvetet val.

**C2 (notis — kalenderfilens lydelse):** kalender-finans.json skriver "Pre-close call för Q3 **hölls** per kalender 2026-09-30" — preteritum om ett då framtida datum. HB-textens neutrala "tidsplanerad till 30 september" är den rimliga formen; kalenderfilen ägs av byggaren.

**C3 (notis — vintage-drift, Nordea-vintage-metoden):** dagens universumfil 242 rader (spår 2 fortsätter växa). Textens medianer rättas EJ mot dagens fil — de är daterade ("omräknade 2026-09-16, n=120") och låser sig via dateringen; aspektsidorna speglar nya medianer automatiskt. Vid B1-kurens omräkning används 120-vintagen (9839c530), inte dagens fil.

**C4 (notis — extern länk):** MarketScreener 403 vid livekontroll (bot-skydd, servern svarar); handelsbanken IR 200.

## Kö-notiser (till ägare/nästa våg)

1. **Medianuträkningen behöver en enda kodväg:** B1 är det tredje fallet i släktet där paketbyggarens medianer avviker från projektets (NP3- och Kinnevik-kontrollernas vintage-spår). Byggprompten bör kräva `median()` ur src/lib/dataset-nyckeltal.ts (eller en deklarerad avvikelse) + commit-hash i Källor-sektionen — inte bara radantal.
2. **rm-konventionen fortfarande öppen:** tre konventioner dokumenterade i släktet (/200-ceil för bloggen, /600 för kvartalsfamiljen, manuell för detta paket) — seriebeslut börs bokföras en gång för alla.
3. Kvartals-FIFO-kön efter detta: wihlborgs 10-13 → fabege/getinge 10-20 → 10-21-klustret (alphabet/att/boston-scientific/castellum/catena/coloplast/electrolux + flera).

## KVD

Endast nya filer (KONTROLL + diff + sond + anspråk + worklog-rader). Utkast-JSON:en orörd (granskaren skriver ej om andras filer — B1/B2-kurerna verkställs av paketets ägare eller nästa våg via diff-filen). src/ orörd = INGET bygge. R2 orörd (publicering = kundens klick; data/blogg/ orörd). Syskonytor orörda (u1:s forskningslaget- och u2:s vagkartan-paket lästa och korskonfirmerade/reparkerade — se separat konfirmations-KONTROLL). Commit med explicit pathspec + -F-meddelandefil.
