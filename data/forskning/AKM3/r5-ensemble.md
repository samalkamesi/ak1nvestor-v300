# R5 · Ensemble-av-viktprofiler + horisontspecifika vikter i AKM3

Forskare: **r5 (ensemble-forskare)** · Datum: 2026-09-04 · MEGA-PROJEKT AKM3.
Kundfråga: *"V01–V20 vägs lika oavsett tidshorisonter — kan AKM3 vara en
ensemble av de tre viktprofilerna + ge en vy per tidshorisonter (mikro→mega)?"*

Kort svar: **Ja — två komplementära, deterministiska designlägen**:
(A) **Ensemble**: AKM3-totalen = medel av de tre profilernas kompositer, med
spridningen (profil-enigheten) som robusthetsmått — "ensemble-band".
(B) **Horisontprofiler**: fem viktfamiljer där variabler viktas efter sin
**hemmahorisont** (dynamik.ts HEMMHORISONT = kundens AK1TS-kanon), visas som
växlingsbar vy "AKM3 per horisont". Forskningsstödet är starkt för båda.

---

## 1. Forskning

### 1.1 Ensemble i faktormodeller — "forecast combination puzzle"

Klassikern [Bates & Granger 1969] visade att en enkel kombination av två
prognoser slår båda enskilda — och fyrtio års litteratur sedan dess är
"praktiskt enig: att kombinera prognoser ökar noggrannheten"
([Hyndman & Athanasopoulos, fpp3 §combination](https://otexts.com/fpp3/combinations.html)).
Det paradoxala är att **likaviktad medel** är förvånansvärt svår att slå med
inlärda vikter — "forecast combination puzzle"
([Hsiao & Wan 2014, J. Econometrics](https://www.sciencedirect.com/science/article/abs/pii/S0304407613002339);
[Can anything beat the simple average?](https://www.researchgate.net/publication/257026704_Combining_expert_forecasts_Can_anything_beat_the_simple_average)).
Inom aktieprissättning: [Gu, Kelly & Xiu 2020, RFS](https://academic.oup.com/rfs/article/33/5/2223/5758276)
—"Empirical Asset Pricing via Machine Learning"— finner att ALLA modeller
förbättras av ensemble/kombination över tid, och
[Scholz 2025, Ann. Oper. Res.](https://link.springer.com/article/10.1007/s10479-022-04880-4)
visar att prognoskombinationer sänker MSE för långsiktiga aktieavkastningar.
Översikt för portföljpraktik: [CFA Institute, Ensemble Learning in Investment (2025)](https://rpc.cfainstitute.org/research/foundation/2025/chapter-4-ensemble-learning-in-investment).

**Översättning till AKM3**: de tre viktprofilerna (akm1-klassisk / akm2-2026 /
superanalys-2026) är tre "prognoser" av samma bolagskvalitet ur olika
faktorevidens — ett medel är forskningsmässigt det mest robusta aggregatet,
och **likavikt är det mest defensibla defaultvärdet** (ingen kalibrering =
inget frihetsgradsläckage, Harvey–Liu–Zhus t ≥ 3,0-logik i R2 §1).

### 1.2 Spridning = osäkerhet — ensemble-band från prognosvetenskapen

Inom ensembleprognos är **dispersion (spridningen mellan medlemmarna) en
etablerad osäkerhetsmätare**: liten spridning ≈ liten förväntad fel
([Wilks 2006, Lorenz-96](https://rmets.onlinelibrary.wiley.com/doi/pdf/10.1017/S1350482706002192);
[Met Office, ensemble-beslut](https://www.metoffice.gov.uk/research/weather/ensemble-forecasting/decision-making)).
Tre medlemmar ger ett helt deterministiskt band [min, max] plus median — inget
slumpmoment, inga konfidensantaganden. Det är exakt AKM3:s "ensemble-band":
**låg spridning = robust poäng, hög spridning = profiltolkningen styr** —
pedagogiskt utan att vara statistiskt övermodigt (n=3).

### 1.3 Tidshorisontsberoende faktorpremier — value långsiktigt, momentum kort

- **Blanchett & Stempien 2024 ([CFA Institute](https://rpc.cfainstitute.org/blogs/enterprising-investor/2024/revisiting-the-factor-zoo-how-time-horizon-impacts-the-efficacy-of-investment-factors))**:
  60 års faktordata (1964–2023), 10 000 bootstrap-perioder + CRRA-optimering.
  **Value och size blir mer attraktiva på längre horisonter; momentum och
  lönsamhet mindre** — momentum hade högst 1-årsvolatilitet och dess optimala
  allokering krymper med horisonten (t.ex. −78,95 % för MOM under 5 år till
  2013 mot +24,81 % för SMB). Faktoravkastningar är inte IID — horisonten ändrars
  den optimala mixen.
- **Daniel & Moskowitz 2016, "Momentum Crashes" ([JFE](https://ideas.repec.org/a/eee/jfinec/v122y2016i2p221-247.html) /
  [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2371227))**: momentum
  (kort horisont-faktor) kraschar förutsägbart i "panic states" — korthorisonts-
  signalen är reell men skör. R3:s Φ-tabell citerar redan denna varning (F3).
- **Fama–French 2015 ([JFE](https://www.sciencedirect.com/science/article/abs/pii/S0304405X14002323))**:
  value/investment/lönsamhet är flodsäsong-långsamma faktorer — årstakt, inte
  kvartalstakt. **Binsbergen–Brandt–Koijen (term structure-ökningen,
  [NBER w21234](https://www.nber.org/system/files/working_papers/w21234/w21234.pdf))**:
  avkastningar på kortsiktiga vs långsiktiga anspråk har olika struktur —
  "horisont" är en faktor i sig, inte bara en sample-längd.
- **Kvalitet långsiktigt**: [MSCI, Quality Time](https://www.msci.com/documents/10199/4c5bd381-5b29-453e-ad73-6df24290a172).

### 1.4 Horisontspecifik vikning i screening

Praktiker-litteraturen skiljer **signalblending** (kombinera poäng på
bolagsnivå FÖRE urval) från portföljblending — signalblending är standard i
screening ([S&P DJI, The Merits and Methods of Multi-Factor Investing](https://www.spglobal.com/spdji/en/documents/research/research-the-merits-and-methods-of-multi-factor-investing.pdf);
[Alpha Architect](https://alphaarchitect.com/constructing-long-only-multifactor-strategies-portfolio-blending-vs-signal-blending/))
— vilket är exakt AKM:s arkitektur (poäng → vikt → komposit). Faktortiming-
varningen ([RAFI](https://www.rafi.com/research/publications/articles/828-factor-timing-keep-it-simple),
[Wharton/Jacobs Levy](https://jacobslevycenter.wharton.upenn.edu/wp-content/uploads/2017/08/The-Promises-and-Pitfalls-of-Factor-Timing-2.pdf)):
rotera inte vikter dynamiskt i tid (kalibreringsrisk) — men en **statisk,
horisontetiketterad** omviktning (olika vikter för olika kundhorisonter) är
inte timing, det är segmentering. Slutsats: horisontvyer bör vara **växlings-
vyer över samma poänggrund**, inte nya motorer.

---

## 2. Nulägeskarta (kod, 2026-09-04)

- `src/lib/akm2/vikter.ts` — registret `VIKTPROFILER` med exakt 3 profiler
  (akm1-klassisk låst uniform 5 %; akm2-2026 = BESLUT §2:s 58/42-block;
  superanalys-2026 = kategorivikter §3). En analys väljer **EN** profil.
- `src/lib/akm2/karna.ts` — `raknaAKM2(k, { viktprofil })` beräknar kompositen
  med en profil; `losaVikter` normaliserar/omfördelar; hård port + DYNAMIKTAK.
- `src/lib/portfolj-forskning/typer.ts` — `HORIZONTER_VIKT` (ζ: mikro 0,05 ·
  kort 0,20 · medellång 0,25 · lång 0,30 · mega 0,20; **kunddirektiv: mikro
  lägst**) används i DAG endast i dynamiklagrets viktdetalj — inte i lager 4.
- `src/lib/akm2/dynamik.ts` — **HEMHORISONT** (r3 §7): varje V:s hem- +
  sekundärhorisont — kundens AK1TS-kanon i kodform. Detta är nyckeln till
  design B: variablerna är REDAN horisontsladdade; bara viktningen ignorerar det.
- `src/lib/ekosystem.ts` — ekosystemkanon: AKM1 (V01–V20) × AK1TS
  (5 teorier × horisontLista ["Mikro","Kort","Medellång","Lång","Mega"] ×
  4 dimensioner); "ALLA agenter MÅSTE referera till AKM1 och AK1TS".
- **Gap**: `raknaAKM2` väger V01–V20 lika oavsett vald horisont; ζ finns bara
  som dokumentation av dynamikbidraget (DynamikLagerSvar.horisontVikter).

---

## 3. Design A — Ensemble: "AKM3-band"

### 3.1 Formel (deterministisk, inga klockor, inget slump)

```
K_p        = raknaAKM2(k, { moduler, viktprofil: p }).komposit     p ∈ P (3 st)
AKM3_total = round( Σ_p α_p · K_p / Σ α_p )                          default α = 1/3
band       = [ min_p K_p , max_p K_p ]
spridning  = max_p K_p − min_p K_p            (0–100, heltal)
median     = mittenvärdet av de tre K_p
```

Varje K_p är en HEL `raknaAKM2`-beräkning (hård port + dynamiktak gäller
redan per profil — porten slår igenom automatiskt i alla tre om V19-data
trigger, eftersom porten följer DATA, inte profilen). lager1/projektions-
invarianten berörs inte: ensemblen är ett lager-5-aggregat ÖVER resultat.

### 3.2 Profil-enighet (spridning → robusthetsetikett)

| Spridning | Etikett | Pedagogisk text |
|---|---|---|
| 0–3 p | **ENIG** | Alla tre profilvärldarna ser samma bolag — robust poäng |
| 4–7 p | **DELAD** | Profilernas faktorsyn skiljer — läs differenserna |
| ≥ 8 p | **PROFILSPÄNNING** | Poängen styrs av profilval, inte bolaget — visa per profil |

Diagnostik per differens: `akm2-2026 − akm1-klassisk` ≈ omfördelningseffekten
(osatta + moduler), `superanalys-2026 − akm2-2026` ≈ kategorivikt vs
variabelvikt. Tre K_p ger dessutom median — robust mot en avvikande profil.

### 3.3 Kontraktstillägg (typskiss, ej byggd)

```ts
type AKM3Ensemble = {
  total: number;                       // viktat medel, avrundat
  band: { min: number; max: number; median: number };
  spridning: number;                   // max − min
  enighet: "enig" | "delad" | "profilspanning";
  perProfil: Array<{ profil: ViktProfilId; komposit: number; band: string }>;
  vikter: Record<ViktProfilId, number>;  // α, dokumenterade (default 1/3)
  modellVersion: string;               // "AKM3.2026.09"
};
```

Regler: α normaliseras internt (summerar 1); okänd profil-id → ärligt fel
(samma princip som karna.ts); osatta andelar ärvs per profil och visas.

---

## 4. Design B — Horisontprofiler: "AKM3 per horisont"

### 4.1 Princip: HEMMHORISONT är kanon — viktningen följer den

Kundens AK1TS-kanon (ekosystem.ts) + r3 §7 (HEMHORISONT i dynamik.ts) anger
redan vilka V som bär information per horisont. AKM3 behöver INTE hitta på
nya indelningar — det härleds:

| Horisont | Hemma (primära V) | Sekundära | Research-anknutning |
|---|---|---|---|
| **mikro** | V16, V17, V18 (katalysatorer) | V19 (tidig varning) | Event-information = kortlivad; katalysatorpoäng är enda meningsfulla mikrosignalen (r3 §7) |
| **kort** | V01, V02, V04, V05, V11, V19 | V06, V07, V08, V20, V28 | Kvartalsrytm; momentum/revisionsliknande takt (Blanchett: kort = momentum-vänligt) |
| **medellång** | V03, V06, V07, V08, V09, V10, V20, V21, V22, V23, V25, V28 | V01, V02, V04, V05, V11, V19, V24, V26 | Årsrytm; RMW/lönsamhet + multipelvärdering (FF-2015) |
| **lång** | V12, V24, V26, V27 | V03, V09, V10, V23, V25, V28 | Hela cykler; intäktsstabilitet, räntetäckning, kapitalcykel, utdelningskontinuitet |
| **mega** | V13, V14, V15 (moat) | V12, V27 | Moat = decenniekrafter (kundens eget exempel: varumärke/nätverk); value/size starkast långsiktigt (Blanchett) |

### 4.2 Formel — härledd viktfamilj per horisont (inga fria tal)

```
bas(v)          = akm2-2026-profilens råvikt för v           (eller kategorivikter)
vikt_h(v)       = bas(v) · m( dist(v, h) )                    dist ∈ {0, 1, 2+}
m(0) = 2,0 · m(1) = 1,25 · m(≥2) = 0,5                       (dokumenterad kurva)
AKM3_h          = raknaAKM2 med viktPerVariabel = normalize( vikt_h )
```

dist = avstånd i horisontstegen mellan v:s HEMHORISONT och h (sekundärhorisont
räknas som dist 1 om den matchar). Multiplikatorerna är en **fast, dokumenterad
kurva** (inga per-horisont fria parametrar — en enda trippel att kalibrera i
BESLUT, inte 5 × 28). Hård port (V19) och omfördelningsregler (losaVikter)
återanvänds orörda — horisontprofilen är bara ett nytt `viktPerVariabel`-block.

### 4.3 Aggregat och vy

- **Växlingsbar vy** "AKM3 per horisont": fem kompositer AKM3_mikro …
  AKM3_mega + skillnad mot AKM3_total; inget av dem ERSÄTTER totalen
  (faktortiming-varningen §1.4 — horisontvyn beskriver, dikterar inte).
- Kollaps till ett tal per bolag (t.ex. korstabellen) sker via ζ
  (HORIZONTER_VIKT — kunddirektiv, mikro lägst): `AKM3_zeta = Σ_h ζ_h · AKM3_h`.
- mikro-vyn blir ärligt tunn om V16–V18 är osatta (kvalitativa) — det är ett
  FAT, inte en bugg: band "osatt" när datatackning < tröskel, samma princip
  som kärnans andelOsatta > 0,5.

### 4.4 Förenkling A+B: ensemble INOM varje horisont

Kombinera designerna deterministiskt: kör viktfamiljen per horisont på alla
tre profiler → AKM3_h = ensemble-medel, per-horisont-band + spridning. Kostnad:
5 × 3 = 15 `raknaAKM2`-anrop per bolag (ren CPU på cache-data — mätbart ok).

---

## 5. Implementeringsskiss (FILER + UI-YTOR — BYGGS EJ HÄR)

Nya filer (föreslagna, följer akm2:s byggregler med typer först):
1. `src/lib/akm3/typer.ts` — AKM3Ensemble, AKM3HorisontResultat (§3.3, §4.3).
2. `src/lib/akm3/ensemble.ts` — `raknaEnsemble(k, { moduler, α })` (§3.1) +
   enighetsetiketter (§3.2). Importerar endast karna/vikter.
3. `src/lib/akm3/horisontprofiler.ts` — `horisontVikter(h, basprofil)` (§4.2),
   härleder HEMHORISONT från dynamik.ts (import type + lokal spegel-tabell om
   importregeln kräver det, samma mönster som ZETA).
4. Tester i `tests/`: (i) ensemble av tre identiska profiler = profilens
   komposit; (ii) vikt_h summerar 1 per horisont; (iii) mikro-familj ger
   V16–V18 störst andel; (iv) determinism (JSON-identisk vid omläsning).

UI-ytor som berörs (komponenter finns redan):
- `src/components/ak1a/akm2-dashboard.tsx` — ny sektion `ProfilEnsembleVy`
  (band-stapel: min—median—max, tre profilprickar, enighetschip) och
  `HorisontVaxlare` (flikar Mikro→Mega, ζ-viktdiagram från korstabellens
  existerande horisontkolumner). Dashboarden äger redan highlight-state.
- `src/app/forskningsbiblioteket/[ticker]/page.tsx` — renderar AKM3-block via
  `src/lib/akm2-onsdemand.ts`-mönstret (ny `src/lib/akm3-onsdemand.ts` med
  cache `data/cache/akm3-{TICKER}.json`).
- `src/components/ak1a/portfolj-forskning/korstabell.tsx` — kolumn "AKM3"
  (ensemble-medel) + expanderbar horisontdel; `KorstabbellRad` utökas med
  `akm3?: { total, band, spridning, perHorisont? }` (optionellt, bakåtkompat).
- `src/app/kalkylator/page.tsx` — Akm2DemoStrip utökas med ensemble-demo.
- API: `src/app/api/vagkon/route.ts` + `akm2-koppling.ts` exponerar idag EN
  profil (AKM2_VIKTPROFIL); AKM3-blocket läggs som tilläggssvar, ALDRIG som
  ändring av befintliga fält (BESLUT §8 prediktionslogg: modellVersion
  "AKM3.2026.09" registreras som NY prediktor, gamla förblir jämförbara).

---

## 6. Tre rekommendationer

1. **Bygg Design A först, som eget lager-5-tillägg.** Ensemble-medel av de tre
   existerande profilerna med likavikt (α = 1/3) + spridningsetikett — minimal
   ny kod (en funktion + typ), obestridlig forskningsgrund (forecast combination
   puzzle), och projektionsinvarianten samt alla existerande tester består.
   Ensemble-medlet blir AKM3:s publika total; bandet visas alltid bredvid.
2. **Härled Design B ur HEMMHORISONT — hitta aldrig på per-horisontsvikter
   för hand.** Använd distanskurvan m(0/1/2+) × basprofilen (§4.2) så att
   horisontvyerna är en matematisk konsekvens av kundens AK1TS-kanon, inte 28
   nya fria parametrar (faktorzoo-försvar, Harvey–Liu–Zhu). Vyn växlar; totalen
   och ζ-kollapsen (kundens direktiv, mikro 0,05) bestämmer ranking.
3. **Behåll determinism + prediktionslogg som kontrakt.** AKM3-resultat
   cachas (`akm3-{TICKER}.json`), får `modellVersion: "AKM3.2026.09"`, inga
   klockor/slump, och skrivs in i prediktionsloggen som NYTT spår bredvid
   AKM1/AKM2 — då kan uppföljningen (P5 "då vs nu") inom ett år mäta om
   ensemble + horisontvyer faktiskt bär information, vilket är projektets
   egen replikerbarhetsprincip.

---

*Källor: se länkar i §1. Kodläsning: src/lib/akm2/{vikter,karna,dynamik,typer}.ts,
src/lib/portfolj-forskning/typer.ts, src/lib/ekosystem.ts, src/lib/akm2-onsdemand.ts,
src/components/ak1a/{akm2-dashboard.tsx, portfolj-forskning/korstabell.tsx},
data/forskning/r2-vikter-2026-09-03.md, r3-dynamisering-2026-09-03.md §7,
AKM2-BESLUT.md. Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).*
