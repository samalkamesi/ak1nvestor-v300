# S2-U2 — kommunikation +2 bolag: Telenor + Deutsche Telekom

Fabriksagent spår 2 (dataset-djup), uppgift u2, 2026-09-15. Följer S2-U3:s
energi-mönster (7e1ce335): publika nyckeltal ur stockanalysis.com (underlag
S&P Global Market Intelligence), konventioner per TTE.PA-radens noteringar.

## Val-motivering (och Ericsson-fyndet)

Uppdraget: "+2 bolag, kvartiler + universumjämförelse". Duplikatkontroll
FÖRE val räddade arbetet en gång: förstavalet Ericsson (uppenbar svensk
telecom-lucka) visade sig FINNAS redan — `ERIC-B.ST` ligger i branschen
**teknik** (inte kommunikation). Slutligt val i stället:

- **Telenor ASA (TEL.OL)** — nordisk teleoperatör, saknades, komplett data.
- **Deutsche Telekom AG (DTE.DE)** — Europas största teleoperatör, saknades.

Motivering för kommunikation: tunnaste P/E-täckningen bland branscherna
(n=8 av 10 vid start; bara urvalskategorin tillväxt var tunnare med n=7) och
två stora europeiska operatörer stärker citeringsmagneten ("AK1A:s universum
inkluderar Telenor och Deutsche Telekom").

## Leverans 1 — två bolagsrader i bolagsunivers.json

Node read-modify-write med idempotensguard (båda tickers verifierade saknade
före skrivning), append sist i arrayen (s2-u3:s mönster), filens indrag och
slutnyrad bevarade. Ren diff vid mitt skrivögonblick: exakt +170 rader, 0
borttagningar.

| Fält | Telenor | Deutsche Telekom |
|---|---|---|
| Pris / börsvärde | 135,20 NOK / 185,25 mdr | 28,90 EUR / 138,81 mdr |
| P/E · P/B · EV/EBIT | 11,59 · 2,72 · 12,76 | 16,20 · 1,56 · 11,95 |
| PEG | null (se metodnotering) | 0,47 |
| ROE · ROIC | 25,0 % · 11,1 % | 15,1 % · 8,5 % |
| Brutto- · EBIT- · netto- · FCF-marginal | 64,9 · 23,5 · 15,7 · 24,0 % | 44,9 · 21,1 · 7,0 · 23,5 % |
| Skuld/EK | 1,28 | 1,65 |
| Omsättningstillväxt TTM | +2,3 % | +2,2 % |
| Serier 2022–2025 (omsättning, mdr) | 76,9 → 80,5 → 75,5 → 76,5 NOK | 117,1 → 114,7 → 118,4 → 121,8 EUR |

Metodnoteringar (även i JSON-noteringsfältet per rad):
- prognosTillvaxt härledd ur trailing/forward-P/E (TTE-konventionen): Telenor
  11,59/14,86 ⇒ **-22,0 %** implicit EPS-förändring; DTE 16,20/12,04 ⇒ +34,6 %.
- **Telenor peg osatt** (ORSTED-konventionen): negativ implicit tillväxt ger
  meningslöst P/E/(-g); källans egen PEG 1,52 bygger på 3-årsprognos +7,0 %
  (dokumenterat i noteringen). DTE peg 0,47 enligt egen formel (källans 0,85
  bygger på 3-årsprognos +11,5 % — dokumenterat).
- resultatCAGR är endpoint-CAGR över 4 räkenskapsår (2022–2025): Telenors
  -46,1 % speglar 2022-resultatet uppblåst av asiatiska avyttringar; DTE:s
  +6,3 % speglar 2023 förstärkt av engångsposter. Inte driftstrend — står i
  noteringen.
- DTE:s fcfYield 20,9 % inkluderar T-Mobile USA-konsolidering (källans tal).
- aterkop/moat-fält null (plattformskonventionen), golv osatt.

## Leverans 2 — llms.txt dataset-sektion omräknad med lasBranschMedianer

`public/llms.txt`: hela "## Dataset"-blocket (16 rader) regenererat med
projektets EGEN `lasBranschMedianer` + EXAKT mall ur src/lib/seo.tsx (samma
kodväg som API-routen /api/llms-txt — statisk spegel kan inte skilja sig från
dynamisk). Skriptet körde tre gånger (efter varje filändring) — deterministiskt,
idempotent.

## Medianeffekt

Mitt isolerade bidrag (103 → 105-läget, verifierat med FÖRE-simulering som
reproducerade befintliga llms-tal exakt — replik-algoritmen dubbelverifierad):

- kommunikation: P/E 21,8 → **19,0** (kvartiler 12,8–28 → 12,2–24,5, n=8→10)
- totalt universum: P/E 20,4 → **20,2** (n=94→96)

Slutläge i arbetsytan EFTER syskonens parallella skrivningar (109 bolag,
kommunikation 13 — se koordinering): kommunikation P/E 21,8 (12,5–28, n=11),
totalt **19,9 (n=100 av 109)**. Ärligt utfall: mina två lågt värderade
operatörer sänkte medianen, men syskonet u3:s Spotify i samma bransch tog
tillbaka den — NETTO oförändrad P/E-median men bredare underlag (n 8→11),
FCF-marginal 11→18 %, tillväxt 3,5→2,3 %.

## Koordinering (parallell omgång — våg 104-reglerna)

Syskonen u1 (+1) och u3 (+3) skrev samma fil under mitt fönster. Sekvens
verifierad med två avläsningar 25 s isär (stabil: 109 bolag): u1 lade HSBA.L
(finans), u3 lade SPOT (kommunikation), SKA-B.ST (industri), EVO.ST
(konsument). Read-modify-write kedjade korrekt — inga bolag förlorades, mina
2 kvar (kontrollerat vid varje steg). Min `git add` av bolagsunivers.json
inkluderar syskonens 4 rader (s2-u3:s självbärande-commit-mönster); llms.txt
räknad på slutläget 109 så samtliga syskontal är med.

## KVD-bevis

- `npx tsc --noEmit` = **0 fel** (hela repet).
- Vit-test `npx tsx verktyg/testa-dataset-aspekter.mjs` = **GRÖNT, 0 fel,
  161 sidkontroller** (läckagevakt: 0 bolagsnamn/tickers i dataset-utdata;
  juridikgrinden hel; 30 kända textvarningar, ej fel).
- `aspektParametrar()` = **171 URL:er** (170→171: kommunikation passerade
  gränsregeln för en modul till vid n=11) — sitemap/registret automatiskt.
- Prod `https://lab.ak1nvestor.com/` = **200**.
- FÖRE-simuleringen reproduceade befintliga prod-tal exakt (P/E 21,8/12,8–28/
  n=8; totalt 20,4/n=94) innan någon skrivning — algoritmkopia verifierad.

## Driftnotis till huvudagenten: tsc-kur vid avklippt node_modules

Under uppdraget var repots node_modules AVKLIPPEN (`node_modules/.bin/`
saknades helt; typescript/lib utan lib-filer — ingen npm ci pågår, ingen
deploy aktiv; troligen en död deploy lämnat trädet). Typkontroll och
pre-commit-hookens `npx tsc` var tedy oanvändbara. KUR (ingen installation,
ingen global påverkan): symlink `node_modules/.bin/tsc` → komplett
typescript 5.9.3 i `/home/ak1a/agent/ak1` (repot kräver ^5) — exakt vad npm
själv hade länkat; katalogen är gitignorerad och skrivs över av prod-synkens
nästa npm ci. Notera: typkontrollen kördes med 5.9.3, inte repots låsta
minor — om nästa npm ci installerar äldre 5.x och hittar fel, jämför med
denna rapports gröna körning.

## Skuld till nästa våg

1. Nya/räknade sidor (kommunikations-branschsidan + aspektsidor + 171:a
   URL:en) föds vid nästa prod-bygge (SSG/ISR läser datafilerna då) —
   v98-dataset-vakten (läckagevakt mot byggda sidor) kan inte köras utan
   `next build`; vit-testet + strukturella gränsvakter täcker modulutdata.
2. s2-u3:s ärvda skuld kvarstår: "~33 '100-bolags'-formuleringar i src" —
   nu gällande tal är 109 (och växer med varje utökning); den föreslagna
   globala sweepen till dynamiska tal blir bara mer angelägen.
3. Syskonens u1/u3 leveransrapporter bokförs av dem själva.

---

# OMKÖRNING 2026-09-15 ~14:05 (fabrikens omgång 3, samma manifest)

**Varför omkörning:** ovanstående omgångs dataarbete FÖRLORADES före commit.
Beviskedja: llms.txt skriven 13:33, dokumentationsfilerna 13:34–13:35,
bolagsunivers.json 13:47:03 — och prod-synk-loggen visar exakt 11:47:03Z
(=13:47:03 lokal) "NY KOD"-synk som återställde trädet till HEAD (103
bolag, 0 syskenrader kvar; sekundmatchning fil-mtime ↔ loggrad). Fabriken
bokförde inget klart (status klara=[]) ⇒ hela manifestet kördes om 13:55.
**Driftnotis till huvudagenten:** prod-synkens trädåterställning under
pågående fabriksfönster är en strukturkollision (syskon s2-u1:s HSBC-rad
förlorades på samma sätt och har lagts till igen av omkörningen). Förslag:
prod-synken rör ALDRIG smutsiga spårade filer vid "NY KOD"-läge utan bara
vid deploy, eller fabriksbarn committar delresultat löpande.

**Omkörningens leverans (identiskt objekt + tre förbättringar):**

1. **Alla siffror verifierade LIVE mot källan vid omkörningen** (stockanalysis
   översikt+statistics+financials, sid-as-of 2026-09-15 ~13:44 CET, hämtning
   med no-cache): serier 2022–2025 exakt konfirmerade — Telenor omsättning
   76 877 → 80 452 → 75 487 → 76 548 MNOK, resultat 44 913 → 13 734 →
   18 336 → 7 034 MNOK; DTE omsättning 117 074 → 114 733 → 118 432 →
   121 816 MEUR, resultat 8 001 → 17 788 → 11 209 → 9 609 MEUR.
   Marginaler/ROE/ROIC/skuld-EK/P-E-PB-EV-EBIT samtliga konfirmerade.
2. **Korrigeringar mot omgång 2:s tabell:** Telenor pris 134,80 NOK (ej
   135,20) · Telenor fcfYield nu explicit ur källan 9,76 % · DTE pris
   28,85 EUR (ej 28,90) · DTE fcfYield 20,85 % (ej avrundat 20,9).
   Beräkningar oförändrade: Telenor prognosTillväxt −22,0 %, resultatCAGR
   −46,1 %, omsättningCAGR −0,14 %; DTE +34,6 %, +6,3 %, +1,3 %.
3. **Koordinering under omkörningen:** syskon u3 committade först
   (a9b5df17, 103→106: SPOT/SKA-B/EVO + llms för 106-läget). Mitt första
   skriv (107→109, HSBA bevarat) förlorades av prod-synkens checkout under
   u3:s deploy + en stale-återskrivning; u1 committade sedan sin HSBC-
   leverans själv (63130f5a 14:13, 107-läget) med explicit notis att mina
   TEL.OL/DTE.DE-rader "återställs av dem" — denna commit är den
   återställningen: 107 → 109, alla fyra syskonraderna verifierade i filen
   vid mitt andra skriv.

**Slutläge (konvergens med omgång 2:s dokumenterade mål — exakt match):**
universum 109 · totalt median P/E 19,9 (n=100 av 109) · kommunikation
13 bolag: P/E 21,8, kvartiler 12,5–28 (n=11), P/B 2,7, EBIT-marginal
21,1 %, FCF-marginal 18 %, omsättningstillväxt 2,3 %.

**KVD omkörningen:** kontraktstest `npx tsx verktyg/testa-dataset-aspekter.mjs`
GRÖNT (161 sidkontroller, 0 fel, 30 kända varningar) · läckagevakt
`node verktyg/v98-dataset-vakt.mjs` GRÖN — 109 tickers + 109 namn, 0
träffar i 1 412 utdatafiler · prod 200 · tsc tillgängligt igen (node_modules
helt efter 11:51-deployn — omgång 2:s symlink-kur behövs ej) · llms
regenererad via projektets EGEN `lasBranschMedianer` i färsk tsx-process
(samma kodväg som /api/llms-txt — ingen algoritmreplikering).

**MALLFÄLLAN (tredje dokumenterade fallet — varning till nästa våg):** en
mall-regeneration av Dataset-blocket (enbart seo.tsx-mallen) raderar
tyst ALLA manuellt tillagda aspektrader — u1:s TTM-rader (omgång 2,
dokumenterat) och u1:s `/dataset/finans/resultat-cagr-5ar`-rad (min
commit ea7ad8bd, upptäckt i efterhand) föll båda för detta. Återställt i
63e230cc med omräknat universumtal (median resultat-CAGR 1,4 %, n=78 av
109 — var 2,2 %/76). KUR för nästa: efter varje block-regeneration,
diffa aspektraderna (`grep "dataset/" public/llms.txt` före/efter) mot
föregående version och klistra tillbaka födda aspektrader med 109-tal.
