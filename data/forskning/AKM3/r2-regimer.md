# R2 — MARKNADSREGIMER SOM AKM3-LAGER: deterministisk regimeidentifiering ur befintliga motorer

**Forskare:** R2 (regimer) · **Datum:** 2026-09-04 · **Status:** Forskningsunderlag till AKM3-beslut (före systemsbygge)
**Kundfråga:** *"Ska bolagspoängen modifieras av marknadens regime?"* — med ekosystemets
byggstenar: AK1TS 5×5×4, vågfundamentet (fundamentala vågor som regime-proxy), vågkonen
(P10–P90 ur volatilitet) och forskningsläget (grön/gul/röd över 100 bolag).

**Svar i en mening:** JA — men som ett **deskriptivt viktvalslager** ("lager 4.5") som
väljer bland namngivna viktprofiler per deterministiskt identifierad regime; regimen rör
ALDRIG variabelpoäng (lager 1–3), ALDRIG AKM1-projektionen (projektionsinvarianten) och
ger ALDRIG handelssignaler (lagen 2007:528 — "regimejusterad profil" är beskrivande
dokumentation som alltid visas sida vid sida med basprofilen, aldrig ett råd).

---

## 1. Forskningsläget: regime-switching i fundamental screening

### 1.1 Den akademiska ryggraden — Hamilton-linjen

- **Hamilton (1989)**, *"A New Approach to the Economic Analysis of Nonstationary Time
  Series and the Business Cycle"*, Econometrica — grundmodellen: konjunkturen som
  tvåtillstånds-Markovprocess (expansion/recession) med okända, estimerade övergångs-
  sannolikheter. ~15 000 citeringar. https://www.jstor.org/stable/1912559
- **Hamilton (2016)**, *"Macroeconomic Regimes and Regime Shifts"*, NBER w21863 —
  översikten av 27 års litteratur; noterar att regime-skiften är svåra att identifiera
  i realtid även med optimala metoder. https://www.nber.org/system/files/working_papers/w21863/w21863.pdf
- **Wang (2020)**, *"Regime-Switching Factor Investing with Hidden Markov Models"*
  (JRFM) — HMM-regimer i usa-aktier + faktorrotation per regime; in-sample-förbättring,
  svagare ut-sample. https://www.mdpi.com/1911-8074/13/12/311
- **Hu (2022)**, *"A Markov Regime Switching Model for Asset Allocation"*, SSRN —
  regimespecifika faktorbeteenden ger främst VOLATILITETSMINSKNING, inte alfa.
  https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4094459
- **Ehsani & Linnainmaa (2022)**, *"Factor Momentum and the Momentum Factor"*, JF —
  faktorernas EGENA momentum är bred; implicit stöd för att faktorpremier varierar i
  tid, men också en varning: man "timar" lätt bara det som redan hänt.
  https://www.jstor.org/stable/45435157

### 1.2 Vad som varierar per regime (empirin)

- **Volatilitetsregimer:** MSCI — procykliska faktorer vinner i lågvolatilitetsregimer,
  defensiva i högvolatilitetsregimer. https://www.msci.com/research-and-insights/blog-post/what-market-volatility-has-meant-for-factors
- **Kvalitet/lönsamhet i nedgångar:** Bridgeway — finansiell hälsa (RMW-lönsamhet,
  CMA-investering) håller i både recessioner och björnmarknader.
  https://bridgeway.com/perspectives/factoring-in-bear-markets/ · Russell Investments
  bekräftar: kvalitet/lönsamhet starkast i negativa recessionsscenarier.
  https://russellinvestments.com/us/blog/factor-investing-us-recessions · Novy-Marx
  *"Understanding Defensive Equity"* (NBER w20591). https://www.nber.org/system/files/working_papers/w20591/w20591.pdf
- **Värde i korrigeringar:** RAFI — värde slår kraftigt i björnmarknader som följer på
  bobbelbrust, över hela recession→recovercykeln.
  https://www.rafi.com/research/publications/articles/808-value-in-recessions-and-recoveries
  Detta är den externa bekräftelsen på R3 §5.3:s designvarning: en fallande multiple är
  Mr Market-möjligheten — modellen får INTE dubbeltbestraffa den.

### 1.3 Varningsklockan — timing-skepticismen (AKM3:s viktigaste motvikt)

- **Asness, Chandra, Ilmanen & Israel (2017)**, *"Contrarian Factor Timing is Deceptively
  Difficult"*, JPM — faktortiming på värderingsspreads har svag ut-sample-kraft;
  rekommendationen är att högst "synda lite" (små, konträra tiltar i extrema lägen).
  https://www.aqr.com/Insights/Research/Journal-Article/Contrarian-Factor-Timing-is-Deceptively-Difficult
- **Research Affiliates**, *"Factor Timing: Keep It Simple"* — enkel
  värdering+momentum-modell slår komplexa regime-modeller ut-sample.
  https://www.rafi.com/research/publications/articles/828-factor-timing-keep-it-simple
- **Bredd-metodik (praktik):** StockCharts Percent Above MA — klassiska
  breddtrösklar (>60–70 % deltagande = hälsosamt, <30–50 % = svagt) med uttryckliga
  antidonkvant-regler: utjämning, bekräftelseperioder, hysteres.
  https://chartschool.stockcharts.com/table-of-contents/market-indicators/percent-above-moving-average

**Slutsats §1:** Evidensen säger att faktorpremier ÄR regimberoende (särskilt:
kvalitet/lönsamhet i nedgångar, värde efter multippel-korrigeringar) — men att
AVANCERADE estimerade regime-modeller (HMM/Markov) sällan överlever ut-sample. Det
büdar för AKM3:s design: **deterministiska, tröskelbaserade, breddbaserade regimer med
liten amplitud och hysteres** — inte estimerade övergångsmatriser.

---

## 2. Den deterministiska AK1A-regimeidentifieraren

### 2.1 Byggstenar — allt finns redan (ingen ny datakälla)

| Indikator | Källa (existerande fil) | Definition | Egenskap |
|---|---|---|---|
| **G** — grönandel | `src/lib/forskningslaget.ts` (`raknaForskningslage`) | `andelGrona` ur korstabellens 100 rader (grön = AKM1 ≥ 70 % av max, täckning ≥ 60 %, inget portbrott) | FUNDAMENTAL selektions-bredd; kvartalskadens; långsam → whipsaw-tålig |
| **R** — rödandel | samma | `andelRoda` (port-brott/underperformers) | FUNDAMENTAL stressmått |
| **N** — nettofundamental bredd | `src/app/api/cron/vagscan/route.ts` → `system_events (type=vagscan)`, `details.universumSammanfattning` | (impulsvåg − korrigering) / (impulsvåg + korrigering + basbygge) över universumets 20×5 fundamentalvågsmatris | Detta är "vågfundament som regime-proxy": fundamentala vågors bredd — ekosystemets EGET data, deterministiskt (±6 %-trösklar ur vagfundament-motorn) |
| **Σu** — universumvolatilitet | `src/lib/vagkon.ts` (`raknaVagkon` → σ per steg) per bolag, universumsgenomsnitt | månads-σ (log-returer), årlig = ×√12 | Volatilitetsport (GATE) — används inte som egen regime utan som bekräftare + horisontvikt-förskjutning |

Fundamental bredd (N) är medvetet vald framför pris-momentum-bredd: den är långsammare
(per kvartal/år, inte per dag), ekosystemets egen definition och därmed pedagogiskt
förklarbar för eleven ("20 variabler × 5 horisonter per bolag — hur många fundamentala
impulsvågor finns i universumet just nu?").

### 2.2 Fyra regimer med fasta trösklar + hysteres (3+1)

Trösklarna ÅTERANVÄNDER forskningslaget.ts:s egna kanoniska tal (0.10/0.08/0.35) —
en källa till sanning, inga nya magiska tal för G/R; N och Σu får nya, dokumenterade tal:

| Regime | Inträde (ALLA villkor gäller 2 konsekutiva snapshots) | Utträde (hysteres — kräver också 2 snapshots) | Kännetecknande text |
|---|---|---|---|
| **balanserad** (default) | inget annat villkor uppfyllt | — | "Forskningstätheten är mittemellan — basprofilen gäller" |
| **expansiv** | G ≥ 0,10 OCH N ≥ +0,20 | G < 0,10 ELLER N < +0,10 | "Många bolag klarar de strikta kraven och fundamentala impulsvågar dominerar" |
| **magert** | G < 0,08 ELLER R > 0,35 | G ≥ 0,10 OCH R ≤ 0,30 | "Få bolag klarar de strikta kraven — selektionen bär helheten" |
| **korrigering** ("ubb"-läget: multipler faller) | N ≤ −0,20 | N ≥ −0,10 | "Korrigeringar dominerar de fundamentala vågorna — multiplerna rör sig nedåt" |

- **Kombinationsfall:** magert + korrigering samtidigt ⇒ sammansatt regime
  **"magert-korrigering"** (vikt-tabell §3.2 rad 5).
- **Osatt-ärlighet (P2-arvet):** antal mätta vågbolag < 30 ⇒ N = "osatt" (regimen
  degraderar till G/R-only; alla indikatorer saknas ⇒ regime "osatt" ⇒ basprofilen).
- **Σu-gate:** års-Σu > 25 % ⇒ (a) regimebyte kräver **3** snapshots i stället för 2,
  (b) horisontvikterna förskjuts mot det långsamma (§3.2). Års-Σu < 15 % ⇒ ingen åtgärd.
- **Kadens:** kvartal (följer korstabellens manuella leverans + fundamentalt cadens) —
  aldrig daglig; regimen är en beskrivning av underlagets läge, daterad med
  `senastKontrollerad` (forskningslaget.ts:s princip: "aldrig 'just nu på börsen'").
- **Verifierat mot dagens data (2026-09-03):** 100 rader, 7 gröna (G=0,07), 17 röda
  (R=0,17) ⇒ regime **magert** — notera att G ligger precis under 0,08-tröskeln; UTAN
  hysteres skulle ett enda nytt grönt bolag (G=0,08) vippa regimen — hysteresen
  (utträde först vid G ≥ 0,10) är inte dekorativ utan nödvändig (§4.2 risk 1).

### 2.3 Varför deterministiskt och inte Markov-estimerat

Hamilton-linjen estimerar övergångsprobabiliteter ur data — mäktigt men: (i) inte
reproducerbar för eleven ("varför blev det recession? modellen sa det"), (ii) ut-sample-
svagt (§1.1), (iii) bryter ekosystemets determinismregel (MEGA_PLAN_V3 §Regler).
AK1A:s regime är en REN FUNKTION av daterade snapshots: samma korstabell + samma
vagscan + samma priser ⇒ samma regime, alltid, testbart (samma mönster som
`raknaForskningslage` och `raknaVagkon`). Markov-ANDAN lever kvar i R3:s redan byggda
våg-till-våg-ledning (2-snapshots-bekräftelse = diskret övergångsmatris med hysteres) —
vi återanvänder det mönstret, inte estimeringen.

---

## 3. Regime→AKM3-kopplingen: viktprofiler per regime

### 3.1 Huvudprincipen — regimen väljer PROFIL, ändrar aldrig POÄNG

```
lager 1 (AKM1)      ── orörs            (projektionsinvarianten, kalkylator, 8 211 quiz)
lager 2 (moduler)   ── orörs
lager 3 (dynamik)   ── orörs            (vågfas-modulering ±1 p, tak ±10 — R3/BESLUT §6)
lager 4 (vikter)    ── HÄR: regimen väljer bland namngivna ViktProfil-varianter
lager 5 (syntes)    ── visar BAS + REGIMEJUSTERAD komposit SIDA VID SIDA
```

Lager 3 modulerar POÄNG efter vågfas; regime-lagret (4.5) modulerar VIKTER efter
universumets läge. Rena separata ansvarsområden — annars dubbeltbestraffas en
multippel-korrigering (lager 3 "value appearing" × regime "fly från korrigeringar").
Regimen FÅR aldrig röra det lager 3 redan gör — den kompletterar på Vikt-nivån.

### 3.2 Regimejusterade kategorivikter (bas: superanalys-2026, BESLUT §3)

| Kategori | Bas | expansiv | magert | korrigering | magert-korrigering |
|---|---|---|---|---|---|
| Lönsamhet | 24 | 24 | 24 | 24 | 24 |
| **Värdering** | 20 | 20 | 20 | **26** (+6) | **24** (+4) |
| **Risk** | 10 | 10 | **13** (+3) | 10 | **12** (+2) |
| **Stabilitet** | 10 | 10 | **13** (+3) | 10 | **12** (+2) |
| **Tillväxt** | 16 | 16 | **12** (−4) | **13** (−3) | **10** (−6) |
| Moat | 10 | 10 | 10 | 10 | 10 |
| **Katalysator** | 6 | 6 | **4** (−2) | **3** (−3) | **4** (−2) |
| Kapitalstruktur | 4 | 4 | 4 | 4 | 4 |
| **Summa** | 100 | 100 | 100 | 100 | 100 |

- **Motivering magert** (kvalitet upp): Bridgeway/Russell/Novy-Marx (§1.2) — finansiell
  hälsa bär i stress; Tillväxt/Katalysator tappar informativitet när få bolag levererar.
- **Motivering korrigering** (värde upp — kundens "ubb-regime: värde-variabler
  upp-viktade"): RAFI (§1.2) + R3 §5.3 — fallande multipler är möjligheten; V06/V28/V22
  (EV/EBITDA, EBIT/EV, FCF-avkastning) får mer röst när multiplerna faktiskt faller.
  Värdevariablernas POÄNGKURVOR (R2 §4: konvexa för V06 — lägre multiple = bättre)
  gör resten; viktökningen förstärker bara det som redan mäts.
- **Motivering expansiv = basprofil oförändrad:** MSCI (§1.2) — basprofilen akm2-2026
  är redan lätt procyklisk (Tillväxt 16 + Lönsamhet 24); en extra tilt vore dubbel-lutning
  och maximal toppad-risk. Ärligast design: regimer kan SENKA riskaptit, inte höja den.
- **Amplitude-tak (Asness "synda lite"):** max ±6 kategoripoäng per kategori, total
  profilavvikelse ≤ 12 poäng; horisontvikter max förskjuts enligt Σu-gaten nedan.
- **Σu-gatens horisontvikter** (vid års-Σu > 25 %): mikro 0,05→0,02, kort 0,20→0,15,
  medellång 0,25→0,23, lång 0,30→0,35, mega 0,20→0,25 (summa 1,00) — högt prisbrus ⇒
  lyssna mer på det långsamma fundamentet (samma logik som kunddirektivet "mikro minst
  viktat").

### 3.3 Juridik-gränsen (2007:528) — de fem formuleringslagarna

1. **Namngivning:** alltid "regimejusterad profil" — aldrig "försvarsläge",
   "riskav-ställning", "byt till värde". Regimen beskriver UNDERLAGET (korstabell +
   vagscan), aldrig vad eleven bör göra.
2. **Sida vid sida:** varje resultatyta visar basprofilens komposit OCH den
   regimejusterade — skillnaden är transparent pedagogik, inte en dold omräkning.
3. **Aldrig signalformuleringar:** förbjudna verb i koppling till regime: köp, sälj,
   öka, minska, undvik, passa på. Tillåtna: "lyfter", "viktar om", "beskriver",
   "redovisar". Banden (aktor/studera/skjut/osatt) berörs aldrig av regimen.
4. **Datering:** regimen bär `senastKontrollerad` — "läget i underlaget per 2026-09-03",
   aldrig "marknaden just nu".
5. **/transparens:** metodblad ("Hur AK1A räknar regimer") + regimehistorik publicerad —
   samma öppenhet som prediktionsloggen (R4 §8.2).

---

## 4. Implementeringsskiss (BYGG EJ — platser, inte kod) + ärliga risker

### 4.1 Filer (nya — inga befintliga filer rörs i AKM2-domänen)

| Fil | Innehåll | Not |
|---|---|---|
| `src/lib/akm3/typer.ts` | `RegimeTyp = "balanserad"\|"expansiv"\|"magert"\|"korrigering"\|"magertKorrigering"\|"osatt"`, `RegimeIndikatorer {G, R, N, sigmaArs, antalVagbolag, senastKontrollerad}`, `RegimeResult` (typ, indikatorer, in-/utträdesdatum, motiveringstext) | typkontrakt, JSON-nycklar utan åäö (typkontraktets konvention) |
| `src/lib/akm3/regim.ts` | REN FUNKTION `raknaRegime(historik: RegimeIndikatorer[])` — trösklar §2.2 som namngivna konstanter (mönster: forsningslaget.ts), hysteres + snapshot-persistens (2, alt 3 vid Σu > 25 %) | inget nät/fs/Date-now; testbar |
| `src/lib/akm3/regimprofiler.ts` | `REGIMPROFILER: Record<RegimeTyp, {kategorivikter, horisontvikter?}>` enligt §3.2 + `serverSide: true` | återanvänder ViktProfil-mekaniken i akm2/vikter.ts; "akm1-klassisk" låses förbi (regime gäller den aldrig) |
| `src/lib/akm3/koppla.ts` | tunn adapter: läser korstabell-grund.json + system_events(vagscan) + vagkon-σ per ticker; bygger `RegimeIndikatorer` | konsumerar befintliga motorer, äger ingen data |
| `src/app/api/akm3/regim/route.ts` | GET — aktuell regime + historik (server-side, P8) | |
| `verktyg/testa-akm3-regim.mjs` | (i) determinism: samma indata ⇒ bitidentisk regime; (ii) hysteres: G-vippning 0,07↔0,08 byter ALDRIG regime; (iii) invariater: regimen ändrar aldrig lager1/lager3; (iv) summa-100-test per profil; (v) osatt-degradering | |
| `data/portfolj-system/regime-logg.json` | append-only regimehistorik (datum, indikatorer, regime, profil-hash) | P5/prediktionsloggens mönster; dömbar |

### 4.2 Ärliga risker (rankade)

1. **Regime-whipsaw (störst).** Dagens G = 0,07 ligger en enda bolags-poäng från
   0,08-tröskeln; utan hysteres byter regimen vid varje korstabell-uppdatering och
   vikterna studsar. Motmedel (alla §2.2): kvartalskadens, 2–3 snapshots-bekräftelse,
   in-/ut-trösklar åtskilda (0,08/0,10), amplitudtak ±6. Rest-risk: kvarvarande
   vippning vid N-tröskeln −0,20/−0,10 — övervakas i regime-loggen (om > 1 byte/kvartal
   i snitt: bredda bandet).
2. **Dubbelräkning mot lager 3.** Båda lagren läser vågdata; en korrigering som ger
   "value appearing" (BESLUT §6) SAMTIDIGT som regime-korrigeringen lyfter Värde +6
   kan överdriva värde-tilten. Motmedel: hård separering (poäng vs vikter, §3.1) +
   totaltak: kompositens avstånd till basprofilen ≤ 12 poäng över alla lager.
3. **Estimations-narrativ / in-sample-tyngd evidens.** Faktorrotationslitteraturen är
   till stor del in-sample; Asness 2017 varnar att timing är "deceptively difficult"
   ut-sample. Motmedel: deskriptiv inramning, liten amplitud, OCH prediktions-loggen
   dömer: om den regimejusterade profilen inte slår basprofilen på 8–12 kvartal dras
   den tillbaka öppet (R4 §8.2:s princip).
4. **Litet våg-universum.** vagscan mäter 12 tickers — bredd på 12 bolag är stökigt
   (ett bolag = 8 %-enheter). Motmedel: n ≥ 30-vakten (annars N = osatt), långsiktigt:
   utöka N till korstabellens 100 bolag via befintliga fvag-cacher (data finns redan).
5. **Endogen datatackning.** G beror delvis av täckningsgrad, inte bara marknadsläge;
   en täckningskris kan maskerad som "magert". Motmedel: statusReglerna kräver redan
   täckning ≥ 60 % för grön (D1-skalningen) — G är täckningsnormaliserad per
   konstruktion; vakta ändå att täckningsandelen loggas i regime-loggen.
6. **Juridisk drift.** Regime-namn bjuder in till rådgivningsspråk ("försvar!").
   Motmedel: de fem formuleringslagarna (§3.3) + Kvalitetsvakten-sektion som skannar
   ytor mot verblistan.

---

## Rekommendation till AKM3 (3, ranked)

1. **ANTA "lager 4.5"-designen: regimen väljer viktprofil, ändrar aldrig poäng.**
   Deterministisk identifiering ur G (forskningsläget), R, N (vagscans fundamentala
   vågbredd) med Σu (vagkon-volatilitet) som gate — fyra regimer + sammansatt fall +
   osatt-degradering enligt §2.2–§3.2. Projektionsinvarianten och lager 1–3 förblir
   orörda; allt är en ren funktion av daterade snapshots. *Motivering: fångar den
   välbelagda regime-beroensen (kvalitet i stress, värde i multippel-korrigeringar)
   utan att introducera estimering, gissning eller ny datainfrastruktur.*
2. **HÅLL amplituden liten och bytena tröga (hysteres + 2–3 snapshots + kvartalskadens).**
   Kategorivikter max ±6 poäng, total avvikelse ≤ 12 poäng, expansiv-regimen =
   basprofilen oförändrad (regimer kan senka riskaptit, aldrig höja den).
   *Motivering: whipsaw är den främsta praktiska risken (dagens G=0,07 sitter på
   tröskeln); "synda lite" (Asness 2017) är evidensens tydliga röst för små tiltar.*
3. **LOGGA regimehistoriken append-only från dag 1 och låt verkligheten döma.**
   `regime-logg.json` + publicerad träffstatistik på /transparens: regimejusterad vs
   basprofil-komposit per kvartal; 8–12 kvartal utan övertäckning ⇒ profilbytet dras
   tillbaka öppet. *Motivering: regime-lagret är den mest timing-nära komponent AKM3
   hittills föreslår — dess egen bokföring måste vara lika hård som
   prediktionsloggens, annars är det narrative-forskning, inte AK1A-forskning.*

---

*R2 (regimer), AK1A Research Lab. Pedagogisk forskningsredovisning — ALDRIG
investeringsråd (lagen 2007:528). Bygger på: forsningslaget.ts, vagkon.ts,
vagfundament-motor.ts, vagscan-cron, akm2/vikter.ts, AKM2-BESLUT §2–§3,
r2-vikter-2026-09-03.md, r3-dynamisering-2026-09-03.md, r4-akm2-arkitektur-2026-09-03.md.*
