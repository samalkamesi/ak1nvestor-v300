# KONTROLL 2026-09-19 — lyxaktier-sa-analyserar-du-lyxbolag.json (B20)

**Granskare:** agentfabrik auto-s1-1789829700743 s1-u3 · **Sond:** `verktyg/_s1u3-lyxaktier-verify.mjs` (40 PASS · 0 äkta FEL · 0 VARN — sondens 2 FEL-rader var egna artefakter, se §8) · **Objekt:** data/blogg-utkast/, byggd 2026-09-17 03:26 av s3-u1 omgång 7 (byggarens KVD grön — detta är den OBEROENDE granskningen) · **Engelsk spegel:** `…-en.json` (Ö20, s3-… 2026-09-18, bär systerfynd, se §7)

## VAL och duplikatkontroll

Uppdragstitelns "m9-utkast #3" (forskningslaget-grona-av-100) är levererat TVÅ gånger
(09-14 huvudgranskning + 09-16 KONTROLL, FLYTTKLAR); m9-serien 6/6 sedan 09-16 14:35
(8448ef77) — trettonde pivot-fallet för malltexten. Syskonläge i SAMMA parallella omgång:
u1:s anspråk (16:56, läst före mitt val) = medieaktier; u2 anspråklös vid mitt val — jag
lämnade worklog-flaggade objekt (medie+livsmedel, rad 14650; kvartalsklassens SHB/SKF,
rad 14196) och valde tredje-slotten i FIFO: **lyx (09-17 03:26)** före e-handel (03:28),
logistik (22:58), krypto (09-18). 0 lyx-granskningsartefakter i granskning/-mappen.
Klaim skriven FÖRE arbetet: `data/vakten/auto-s1-1789829700743-s1-u3-ansprak.md`
(data/vakten är gitignorerad — bokförs här).

## Kontrollen (sond + egen genomläsning, allt EGENMÄTT 2026-09-19)

1. **KÄLLTALSPARITET 11/11 + serierna gröna** mot `data/portfolj-system/bolagsunivers.json`
   (LVMH MC.PA, källvintage 2026-09-03): brutto 66,4 (66,36) · ROE 16,6 (16,59) · ROIC 17,0
   (17,04) · skuld/EK 0,53 (0,5331) · P/E 19,7 (19,713) · EV/EBIT 13,5 (13,549) · PEG 1,59 ·
   FCF-yield 5,5 (5,49) · prognos +12,3 (12,32) · omsättningsserien 79,2/86,2/84,7/80,8 mdr €
   EXAKT (79 184/86 153/84 683/80 807 M) · resultattalen 15,2/12,6/10,9 exakta (15 174/
   12 550/10 878 M).
2. **MEDIANER MED VINTAGE-JÄMFÖRELSE** (kärnan i fynd B3): byggvintagen 795fe396 (09-17
   03:04, sista universum-commit före bygget): konsumentgrenen **n=16, median brutto 48,28 %**
   — textens "sexton konsumentbolag … 48,3" är SANT mot byggtiden. **Dagens universum (201
   poster): n=29, median 50,87 %** — konsumentgrenen nästan fördubblad sedan 09-17 (Ferrari
   09-19 m.fl.); presensmeningarna förfallna (flygaktier-B2:s klass, seriens kraftigaste
   glidning: +13 bolag och +2,6 pp). Superlativen "endast Evolution högre (100 %)" är SANT
   i BÅDE vintagen och dagens fil (Evolution 100,0 ensam över 66,4; KO 61,9 under) —
   superlativfällan (bilaktier-B1, JPM-C1) kontrollerad och GRÖN här.
3. **ARITMETIK 9/9 gröna** (egna omräkningar): prishöjningen 1,06×1,00 = +6,0 % och
   1,06×0,92 = 0,9752 → "minus 2,5" ✓ · forward-P/E 19,713÷1,1232 = 17,55 → textens
   "≈ 17,6" ✓ (avrundning bar) · omsättningsstegen −1,74 % ("minus 1,7") och −4,60 %
   ("minus 4,6") ✓ · **nettofallet 10 878/12 550 = −13,32 % → textens "minus 13,3" EXAKT**
   (räknat på råserien; de avrundade talen ger −13,5 — texten bär rådataprecision, GRÖNT) ·
   **CAGR −8,2 ✓ på två vägar**: källfältet resultatCAGR5ar = −8,25 OCH egen omräkning
   (10 878/14 084)^(1/3)−1 = −8,22 % — men se fynd B2: starttalet syns ej i texten ·
   officiella rörelsemarginalen 17,8/80,8 = 22,03 % → "22 procent" ✓.
4. **EXTERNA KÄLLOR KORSBELAGDA 2026-09-19** (oberoende webbsökning utöver byggarens
   live-kontroll 09-17): **LVMH FY2025: 80,8 mdr € intäkt** bekräftad av LVMH:s egen sajt +
   CNBC + Luxury Tribune + S&P Global (rappdag 27 jan 2026) · **Hermès FY2025: 16,0 mdr €,
   +9 % fasta / +5,5 % rapporterat** bekräftad av FT Markets + Yahoo + Luxury Tribune
   (netto 4 524 M€ = 28,3 %, "−1,72 %" i LT = samma underlag) · **Arnault via Agache:
   50,01 % kapital / 65,94 % röster feb 2026** bekräftad av WWD + Bloomberg + Yahoo +
   Luxury Tribune. STORFYND B1 ur detta stickprov: Hermès **recurring operating margin
   FY2025 = 41,0 %** (IR key figures: 6 569 M€ på 16 002 M€; H1-25 41,4 %; H1-26 41,0 %) —
   textens "rörelsemarginal 30,3 procent" är **IR-fotnotens JUSTERADE NETTOMARGINAL**
   ("net profit … 30.3% for full-year 2025", restaterad för fransk exceptions Skatt), inte
   rörelsemarginalen. Metrikförväxling vid byggarens live-läsning 09-17.
5. **JURIDIK 2007:528 REN**: varumärkesgrindens 26 regexer × 3 ytor (title/description/
   body) = **0 träffar** · disclaimer exakt sista rad ("_Detta är pedagogisk finansanalys,
   inte investeringsråd._") · **0 lagrum** i texten = ingen blandningsrisk · 0 rådverb med
   ordgräns ("köper/inköpet" = konsumentköp av väskor, ej aktier — B8-precedensen) ·
   imperativen är metod-form ("placera varje bolag i pyramiden innan du läser multipeln" —
   utbildningsram i ingress + avgränsning mot syskonguider). Grönt.
6. **911 = 0/6 mönster** (911 · 9/11 · 11 september · september 11 · 11/9 · nine-eleven).
7. **-EN-SPEGLEN bär systerfynden** (maskinellt: "operating margin 30.3 percent" ×1 ·
   "48.3" ×3 · "15.2, 12.6" ×1 · "sixteen" ×1 · rm 2 vid 1 393 ord ⇒ 7 · desc "48") —
   speglas vid verkställning.
8. **INTERNLÄNKAR 12/12 HTTP 200 mot localhost** (kursankaret se-05-lyxsektorn lever;
   0 utkastlänkar). **Struktur grön:** 6 H2 · title 36/60 tkn · description 148/155 tkn ·
   1 215 ord textrensat (mallmål ~1 200, span 800–1 400) · 0 mjuka bindestreck · 0
   trippelradbrytningar. **Sondens 2 FEL-rader = egna artefakter, ärligt bokförda:**
   nettofallet räknades på avrundade serie-tal (−13,49) medan rådata ger −13,32 = textens
   tal; H2-förväntan 5 var fel (6 är norm). Granskaren granskar också sin sond.

## FYND — B (väsentliga, maskinella byten)

**B1 VÄSENTLIGT — Hermès rörelsemarginal är fel metrik: "30,3" är netto, "41,0" är
rörelse.** Pyramidsatsen "rörelsemarginal 30,3 procent" bygger på Hermès IR-sidas
key figures-fotnot, där 30,3 % = **justerad nettomarginal** (net profit group share,
restaterad för den exceptionella franska bolagsskatten); tabellens egna rad säger
recurring operating income 6 569 M€ = **41,0 %** av 16 002 M€. Kur: "rörelsemarginal
41,0 procent" — kontrasten mot LVMH:s 22,0 % blir 1,86× i stället för 1,38×: pyramidens
bevis STÄRKS av rättningen (JPM/Samsung-precedensens klass: rätt talet, behåll kraften).
Söksträng unik ×1 i body. Spegling -en: "operating margin 30.3 percent" → "41.0".

**B2 VÄSENTLIGT — resultatserien stryker startåret 14,1; CAGR-påståendet blir ohärleligt.**
Universumets serie är 14,1 (2022), 15,2 (2023), 12,6 (2024), 10,9 (2025) — texten listar
"15,2, 12,6 och 10,9" under en omsättningsserie som visar fyra år, utan markering att
resultatraden börjar 2023. Följder: (a) läsaren antar serien 2022–2024 och förväntar sig
ett 2025-tal som redan finns; (b) CAGR-påståendet "över de fyra räkenskapsåren −8,2 %/år"
ärmöjligt att räkna fram ur de tre listade talen (15,2→10,9 ger −10,5 %/år; källvärdet
−8,2 kräver 14,1-starten: (10,878/14,084)^(1/3)−1). Detailhandel-B1:s exakta klass:
"siffrorna rätta, rutan fel". Kur: "Resultatserien: 14,1, 15,2, 12,6 och 10,9" —
berättelsen (fall från 2023-topp, fallet −13,3 % 2025) orörd. Söksträng unik ×1.

**B3 VÄSENTLIGT — konsumentmedianen gliden 48,3 % (n=16) → 50,9 % (n=29): presensmeningarna
förfallna.** Fyra ytor bär talet: ingress ("median på 48,3 procent i AK1A:s
analysuniversum"), body ("I universumets sexton konsumentbolag är medianen 48,3
procent"), sammanfattning ("mot konsumentmedianens 48,3"), description ("mot medianens
48 %"). Sant mot byggvintagen 795fe396 (48,28 %, n=16 — rätt räknat DÅ), falskt mot
dagens 201-postfil (50,87 %, n=29). Kur huvudspår = omräkning (50,9/29/51 % — kontentan
orörd: 66,4 fortfarande 15,5 pp över medianen, endast Evolution högre förblir sant);
alternativ kur = as-of-datering ("vid guidens dataunderlag 2026-09-03: 16 bolag, 48,3")
om ägaren vill frysa vintage-läsningen. Flygaktier-B2/F2:s systematik — förslag till
dataägaren: motorisk omräkning vid flytt av B-serien.

**B4 — readingMinutes 2 → 6.** 1 215 ord textrensat; round(ord/200) = 6; samtliga 55
publicerade max 240 ord/min. NIONDE fallet i klassen (substansrabatt 09-17, halvledar-B1,
hälsa-B4, konsument-B4, försvar-B2, bil-B2, detaljhandel-B2, flyg-B5). Byggd 09-17 03:26,
före substansrabatt-domens kodifiering samma dag 15:08. Spegeln: 1 393 ord ⇒ 7.

## FYND — C (förslag, ägaren beslutar) och D (export)

**C1** "i nivå med universumets EBIT-marginal på 22,5 procent" — talet är LVMH:s EGET
fält (22,52 %) men formuleringen läses naturligt som universumets MEDIAN (20,71 %, n=200).
Kur: "i nivå med bolagets EBIT-marginal i universumet, 22,5 procent". **C2** "0,53 kronor
skuld per krona eget kapital" — EUR-bolag; kvoten är valuta-neutral, "kronor" är
genrefras. Kur: "0,53 i skuld per krona eget kapital". **D1** publishedAt = 2026-09-17 =
skapandedatum (R2 — publiceringsbeslutet är kundens; sätts vid export enligt serienorm).

## DOM

**FLYTTKLAR EFTER RÄTTNING** — B1–B4 maskinella byten (samtliga söksträngar verifierade
unika ×1), C1/C2 beslutas av ägaren, D1 vid export. B1 rättar ett externt
innehållsfel mot Hermès egen IR (det enda i serien där webbkällan aktivt motsäger
texttalet), B2/B3 universalglidnings-systematikens två ytterligheter (osynlig serie-start
+ seriens största medianglidning). Verkställs av guidens ägare (s3) eller nästa våg;
-en-spegeln speglas i samma omgång. Publicering = kundens beslut (R2).

## KVD

Endast data/ (granskning/ + worklog) + verktyg/ + gitignorerad anspråksfil = INGET
bygge; src/ orörd (tsc-baslinjen bärs av pre-commit-grinden); R2 orörd (priser/tier/
publicering; data/blogg/ orörd); utkast-JSON:en orörd (granskaren skriver ej om andras
filer); syskonytor orörda (u1:s medieaktier-arbete löper — deras objekt lämnat helt ifred).
Commit med explicit pathspec + `git commit -F`. Kö vidare i rotguide-FIFO: livsmedel
(u1:s notis pekar dit åt syskon), e-handel (09-17 03:28), logistik (22:58), krypto
(09-18) + -en-speglar + kvartalspaket; systemflagga: readingMinutes-konventionen + B3:s
vintage-glidning förtjänar plats i byggar-KVD:n (granskarlagets återkommande kurs).
