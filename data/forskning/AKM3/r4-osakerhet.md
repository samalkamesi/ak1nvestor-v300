# r4-osakerhet — Konfidens och osäkerhetsintervall på AKM2-totalen (AKM3)

**Datum:** 2026-09-04 · **Forskaragent:** r4-osakerhet (AKM3) · **Status:** forskning + design, **BYGG EJ**
**Fråga:** Hur redovisas osäkerheten i AKM-poängen när 28,9 % av vikten är strukturellt osatt — utan att någonsin dölja den?

## 0. Lägesbild — vad koden gör idag (kodläst, ej gissat)

| Faktum | Var | Konsekvens |
|---|---|---|
| D1-fyndet: 28,0 av 97 viktenheter alltid osatta (V02,V03,V11,V13,V15–V18,V20) | `data/rapporter/d1-datatackning-2026-09-03.md` §1, §7 | Teoretiskt tak ≈ 71,1 p för alla bolag; täckningsspann 41,2–71,1 % |
| `datatackning` + `akm1MaxMojligt` = t × 100 levereras redan per rad | samma rapport §2; `KorstabbellRad` via `korstabell-data.ts` | Konfidensmåttet t FINNS — men används bara till status + chip |
| AKM1-chip visar "poäng/max", taket "döljs ALDRIG" | `vag-stil.tsx` r 154–187 (Akm1Chip) | Halva intervallformeln (övre gräns för *dagen* data) finns i UI:t |
| Täckningschip ≥80/50 % | `vag-stil.tsx` r 274–286 (TackningChip) | t visas — men aldrig kopplat till poängen som intervall |
| AKM2-kärnan: osatta ⇒ 0 p + `osakerhet: { andelOsatta, andelarKallor, note }` | `akm2/karna.ts` r 743–747, 779–783 | Osäkerheten är en TEXT, inte ett intervall — ingen "±" |
| Band "osatt" när andelOsatta > 0,5 | `akm2/karna.ts` r 714–716 | Enda poängnära konfidenslogiken — binär, grov |
| Visningsdata injicerar ALDRIG osatta modulpoäng | `akm2-visningsdata.ts` r 72 (`if (!svar.osatt) poang[v] = …`) | Rätt — men kompositen visas då utan spann |
| **Enighetsscore 0–100 finns — men bara för VÅGOR** | `src/lib/vagvalidering.ts` r 46–90 (live 2026-09-04) | Asymmetrin: vågklassen får "enighet 72/100", AKM-poenget får ingenting |
| `andelAvMax` = poäng/maxMöjligt (utnyttjande) | `forskningslaget.ts` r 100 | Släkt med t men ≠ t (t = maxMöjligt/100 = täckning) |
| Kalkylatorn visar kompositen som "X / 100" utan intervall | `akm1-calculator.tsx` r 1104–1111 | Naturlig hemvist för "vad händer vid full data?"-reglaget |
| Detaljsidan visar Akm1Chip UTAN max | `portfolj-forskning/portfolj-djupvy.tsx` r 159 | Första reparationen: skicka med `max` + intervall |

**Slutsats:** Samtliga byggstenar (t, max, poäng, portregler, chip-kultur) finns. Det som saknas är
EN ren funktion poäng×täckning → intervall och tre UI-ytor som visar den. Vågsidans enighetsscore
(`vagvalidering.ts`) är förcedentet: deterministisk formel, synlig i UI — samma medicin för poängen.

## 1. Forskning — intervall vid partiell data (WebSearch, 2026-09-04)

1. **Worst-case bounds utan antaganden (Manski, partial identification).** När data saknas kan
   parametern inte punktidentifieras — däremot *best- och worst-case bounds* fylls av observerat
   data + utfallsrummets kanter. Vår "[osatta fylls 0, osatta fylls 5]" är exakt Manski-variansen:
   identification region = [K − w_osatt·0, K + w_osatt·5]. Källor:
   [Manski Bounds (MetricGate)](https://metricgate.com/docs/manski-bounds/) ·
   [Tudball et al. 2022 (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10183833/) ·
   [Imai, Harvard-föreläsningsanteckningar](https://imai.fas.harvard.edu/teaching/files/bounds.pdf).
2. **Multipel imputation / Rubins regler — varför vi INTE väljer den.** Klassikern ger
   T = Ū + (1+1/m)·B (within- + between-imputationsvarians) och kräver slumpdragningar — ett brott
   mot AKM2:s determinismregel (R4 regel 7: inga klockor, inget slump). Vi citerar den för att
   förklara vad "±" *skulle* betyda probabilistiskt, och avstår medvetet: vårt ± är ett
   deterministiskt spann, inte ett konfidensintervall i frekvensistisk mening.
   [van Buuren, FIMD](https://stefvanbuuren.name/fimd/sec-nutshell.html) ·
   [Heymans & Eekout, book_MI kap 9](https://bookdown.org/mwheymans/bookmi/rubins-rules.html).
3. **Strukturellt saknad data ⇒ imputation är meningslös.** MCAR/MAR/MNAR-taxonomin gäller
   stokastisk saknad data; AKM1:s hål är *struktur saknad* (fält finns inte i datakontraktet —
   ARR, segment, kvickkvot, förvaltningsberättelsevariabler). Litteraturen är entydig: värden som
   inte kan finnas ska inte imputeras utan **rapporteras som saknade** — vilket är P2-arvet
   ("osatt=osatt") i redovisningsform. [van Buuren §1.2](https://stefvanbuuren.name/fimd/sec-MCAR.html) ·
   [DK Statistical Consulting](https://dkstatisticalconsulting.com/missing-data-in-survey-research/) ·
   [Dziak et al. 2017 (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5764087/).
4. **Kompositindikatorer: osäkerheten ska visas, inte imputeras bort.** OECD/JRC-handboken
   (Nardo, Saisana, Saltelli m.fl.): imputation påverkar kompositens "accuracy and credibility";
   kap 9 rekommenderar osäkerhets-/känslighetsanalys och presentation av *intervall* snarare än
   punktvärden för rankningar. AKM2 är en kompositindikator — rådet tillämpas direkt.
   [OECD/JRC Handbook (PDF)](https://www.oecd.org/content/dam/oecd/en/publications/reports/2008/08/handbook-on-constructing-composite-indicators-methodology-and-user-guide_g1gh9301/9789264043466-en.pdf) ·
   [Saltelli et al. 2007](https://www.andreasaltelli.eu/file/repository/SIR2007.pdf).
5. **"X ± Y (n=…)" — kommunikationsmönstret är etablerat.** Undersökningsbranschen rapporterar
   alltid punktvärde + marginal + underlagstick ("32 % ±1,5, n=1200"; ONS: skattning ± 1,96·SE).
   Vårt "58 ± 17 p (täckning 67 %)" är samma grammatik: punkt + marginal + *varför* marginalen.
   [ONS, Uncertainty](https://www.ons.gov.uk/methodology/methodologytopicsandstatisticalconcepts/uncertaintyandhowwemeasureit) ·
   [Qualtrics](https://www.qualtrics.com/articles/strategy-research/calculating-sample-size/).
6. **UI: felstreck — med förbehåll.** Felstreck fungerar i kombination med andra plots men har
   perceptuella svagheter; Correll & Gleicher rekommenderar linjär/gradient-kodning för
   asymmetriska spann — vårt spann är ensidigt uppåt (nedre = poängen), vilket talar för
   **ensidigt streck/gradient åt höger**, inte klassiskt ±-streck.
   [Wilke, kap 16](https://clauswilke.com/dataviz/visualizing-uncertainty.html) ·
   [Correll & Gleicher (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6214189/).

## 2. Design — deterministiskt intervall ur (poäng, täckning)

**Definitioner.** K = visad poäng (AKM1-total eller AKM2-komposit, 0–100).
t = datatäckning = andel av modellens vikt med underlag (D1: Σvikt_satta/97, generaliserat till
aktiv profilvikt för AKM2). w_osatt = 1 − t. Allt på fulla profilvikter (pre-omfördelning).

```
nedre   = K − w_osatt × 0 × 20 = K            (värsta fyllningen: osatta ger 0 p)
ovre    = min(100, K + w_osatt × 5 × 20)      (bästa fyllningen: osatta ger 5 p)
         = min(100, K + 100·(1 − t))
porttak: om hård port aktiv (V19 < 12 mån, BESLUT §5) ⇒ ovre = min(ovre, 45)
halvbredd = (ovre − nedre)/2                  (visningsformatets "±")
konfidens = t                                 (ALDRIG dolt: täckningschippet står kvar)
```

**Egenskaper (bevisbara):** t = 1 ⇒ spannet kollapsar [K,K]. Bredden = 100·(1−t) — enbart
dataunderlag, aldrig poängens storlek. Nya data som sätter en variabel kan bara behålla eller
höja K (nedre=K är oföränderlig under fyllnad 0) — "modellen straffar aldrig saknad data" blir
matematiskt synligt. Ingen slump, ingen klocka: samma indata ⇒ JSON-identiskt spann (R4 regel 7).

**Worked examples (D1-tabellens rader):** INDU-C 58,1 p, t=0,67 ⇒ **[58, 91], ±17** ·
NEM 55,1, t=0,711 ⇒ [55, 84], ±15 · PSNY 6,6, t=0,412 ⇒ [7, 65], ±29 ·
VPLAY (portbrott) 18,6, t=0,67 ⇒ naiv övre 52 men **port takar övre till 45** ⇒ [19, 45].

**Not — omfördelande profil (akm2-2026).** Dagens komposit K renormaliserar aktiva vikter; om
osatt data faktiskt anlände och omfördelningen togs bort blir de äkta fullviktsgränserna
[K·t, K·t + 100·(1−t)] (smalare nedåt). Primärredovisningen följer direktivets förenklade formel
[K, K+100(1−t)] — den är profiloberoende, alltid minst lika bred, och korrekt för
AKM1-projektionen; den strängare varianten redovisas som extra rad på detaljsidan
("med profilen behållen vid full data").

**Presentation (direktivets format, med uppriktighetsnot):** chip: "58 ± 17 p (täckning 67 %)"
där ± = halvbredd; **spannet [58–91] visas ALLTID i tooltip/aria-label** och utskrivet på
detaljsidor — en symmetrisk ±-förkortning av ett asymmetriskt spann får aldrig bli det enda
kunden ser (annars antyds en nedre gräns 41 p som inte finns; kundkultur: osatt=osatt).
Direktivets exempeltal "±12 vid 67 %" är illustrativt — formeln ger ±16,5; **siffran följer
alltid formeln** (P1-determinism; överdriven källtext är exakt det STYRELSE §1.1 fälte i
vagkurva-grafen).

**Band-interaktion:** bandet sätts fortsatt på K, men "aktor" (≥75) kräver dessutom t ≥ 0,60 —
spegling av D1:s gröna täckningskrav; dokumenterad tröskel, inga nya frihetsgrader. Existerande
regel "osatt-band vid andelOsatta > 0,5" (karna.ts r 715) behålls orörd.

## 3. UI — tre ytor

1. **Korstabellen** (`korstabell.tsx` + `vag-stil.tsx`): Akm1Chip/Akm2Cell får valfri prop
   `intervall` och ritar ett **ensidigt felstreck/gradient ovanför chippet** (markör vid K,
   utlöpande till övre; port-tak markeras med snedstreck). Kompakt text i chippet oförändrad
   ("58/67") — spann och "±17 (täckning 67 %)" i tooltip + aria-label. Täckningskolumnen
   (TackningChip) blir klickbar förklarande popover: formeln, worked example, "osatt=osatt".
   Mobilkortet (BolagsKort) får en rad "Spann 58–91 · täckning 67 %".
2. **Detaljsidor** (`portfolj-djupvy.tsx`): (a) skicka `max` till Akm1Chip (saknas idag, r 159);
   (b) ny sektion "Osäkerhet" med utskrivet spann, konfidens t, port-status och den strängare
   fullviktsraden för AKM2-kompositen; (c) förklarande text: "Spannet visar var totalen hamnar
   när den osatta vikten poängsätts — 0 p (värsta) till 5 p (bästa). Modellen gissar aldrig."
3. **Kalkylatorn** (`akm1-calculator.tsx`, AKM2-resultatpanelen): skjutreglage
   **"Vad händer vid full data?"** — fyllnadsgrad x ∈ {0 … 5} p per osatt variabel;
   K(x) = K + 20·(1−t)·x visas live med förval vid x=0 (dagsläget) och snabbknapp "full data (x=5)"
   ⇒ K(5) = övre. Ren deterministik: inget slump, reglaget dokumenteras som *pedagogisk
   projection*, aldrig prognos. I manuellt kalkylatorläge (akm1Manuell ⇒ osatta=[]) visas
   "t = 100 % — alla variabler poängsatta av dig" och reglaget är avstängt.

## 4. Implementeringsskiss — BYGG EJ (endast skiss)

- **Ny ren modul `src/lib/akm2/osakerhet.ts`** (~60 r): typ
  `OsakerhetsIntervall { poang, nedre, ovre, halvbredd, tackning, portTakad, note }` +
  `raknaIntervall(K, t, portAktiv)` + `raknaTackning(resultat)` (andel aktiv profilvikt ur
  lager4 + omfordelning.exkluderade). Ren funktion: inga imports av UI/fs, inga globaler.
- **Typkontrakt additivt** (`akm2/typer.ts`): `AKM2Resultat.osakerhet` utökas med valfri
  `intervall?: OsakerhetsIntervall` — bakåtkompatibelt JSON; `KorststabbellRad` behöver INGA nya
  fält (intervallet = f(akm1Totalt, datatackning), båda finns) — beräknas i `akm2-koppling.ts`
  respektive direkt i chip-prop.
- **Kärnan** (`karna.ts`): beräkna intervallet i slutet av `raknaAKM2` (rapportdata — rör ALDRIG
  komposit, lager1 eller projektionsinvarianten; hård port-läget finns redan i `portAktiv`).
- **UI enligt §3** + tester: golden (INDU-C [58,91]; PSNY [7,65]; VPLAY-port övre=45; t=1 ⇒ [K,K];
  determinism 2× identisk JSON) i linje med validera-motorernas Fas B-mönster.

**Tre rekommendationer:**

1. **BYGG intervallfunktionen först** (`osakerhet.ts` + kärnkoppling + tester) — den är ren,
   liten och låser semantiken innan UI pratar om den. Konfidens = t, formatet "K ± halvbredd
   (täckning Z %)", spannet aldrig dolt.
2. **Korstabell-chippet + detaljsidans max-prop är snabbvinsten** — största ärlighetsökningen per
   kodrad (Akm1Chip har redan max-logiken; djupvyn glömmer den idag).
3. **Kalkylatorns reglage sist**, efter att vågsidans enighetsscore rullat ut — då kan samma
   komponentmönster ("score + konfidens i ett") återanvändas och kalibreras mot
   vagvalideringens data, precis som STYRELSE §5 punkt 3 föreskriver för vågarna.

*Källor kod:* d1-datatackning-2026-09-03.md · STYRELSE-vag-exakthet.md · r4-akm2-arkitektur-2026-09-03.md ·
AKM2-BESLUT.md · src/lib/akm2/{karna,typer,vikter}.ts · akm2-visningsdata.ts · vagvalidering.ts ·
forskningslaget.ts · akm2-koppling.ts · components/ak1a/{akm1-calculator,akm2-dashboard}.tsx ·
components/ak1a/portfolj-forskning/{korstabell,portfolj-djupvy,vag-stil}.tsx
*Forskning: se länkarna i §1.* — Pedagogisk forskning, ALDRIG investeringsråd (lagen 2007:528).
