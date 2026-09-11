---
name: ak1a-analys
description: AK1A-analys i molnet — kundens egen metodik (5 tidshorisonter × 5 teorier × 4 dimensioner) med SAM-viktning, Monte Carlo, bayesiansk omviktning, Kelly, scenarier, riskmatris, körd mot repots riktiga data (data/analyses, akm1/akm2-cacher, bolagsunivers). Använd när kunden ber om "kör en AK1A-analys", aktieanalys, bolagsanalys, kursanalys, "analysera [bolag]", prismål, scenarier, eller uppföljning av tidigare analys. Output är ALLTID pedagogisk utbildning — aldrig investeringsråd (2007:528). Nyckelord: AK1A-analys, analys, bolag, aktie, horizonter, teorier, SAM, scenarier, risk.
---

# AK1A-analys (moln) — ekosystem-ramverket 5 × 5 × 4

**Version:** moln-v1 (våg 103, 2026-09-11). Källa: kundens lokala skill
`~/.agents/skills/ak1a-analys/` — ALL metodsubstans är bevarad; skillen här
är anpassad för molnagentens arbetsyta: data läses ur REPOt (se § Data),
output är utbildning (juridikgrinden), publicering går via m9/kvartals-
fabrikerna. Djupdetaljer: `references/` i denna mapp.

Kundens vision: "rätt system som förstår naturen så som när jag analyserar
tack vare våra system." När kunden säger "kör en AK1A-analys på X" ska
svaret bära metodikens DJUP — inte en generisk aktiesammanfattning.

## Ramverket

Korsa **5 tidshorisonter** (Mikro, Kort, Medellång, Lång, Mega) med
**5 teorier** (Elliott Wave, Fibonacci, GANN, Lucas/Intermarket, Volym)
och utvärdera varje cell i **4 dimensioner** (Våg, Pris, Tid, Brytpunkt).
25 teoriceller + 5 horisontsammanvägningar (SAM) destilleras till en
klassificerad rekommendation med definierad storleksram.

Formalism: varje par (teori t, horisont h) ger signal s(t,h) ∈ {−1…+1}
med styrka w(t,h) ∈ [0,1]. Horisontsignalen:

  SAM(h) = Σ w(t,h)·s(t,h) / Σ w(t,h)

Ingen teori får dominera: maxvikt 25 % per teori. Metodikens kärna:
**teorier är mätinstrument med egen mätnoggrannhet — ingen är sann, några
är användbara.** Besluten bärs av händelsekalender + Bayes + riskbudget,
aldrig av enskilda tekniska signaler.

### Viktmatriser (deklarera i Del I FÖRE resultaten)

- Mikro: VOL 30 · FIB 25 · EW 20 · GANN 15 · LUC 10
- Kort/Medellång: VOL 25 · EW 25 · FIB 25 · GANN 15 · LUC 10
- Lång/Mega: EW 30 · VOL 25 · FIB 20 · GANN 15 · LUC 10
- Horisontvikter mot total-SAM: Mikro 15 / Kort 20 / Medellång 30 / Lång 20 / Mega 15 (%)

Motivering: strukturteorier skalar med horisonten; kalenderteorier inte.
På Kort-nivån (storbolag) ersätts Lucas av **Intermarket** (valuta, räntor,
konjunktur). Tidscykler är uppmärksamhetsfilter — aldrig fristående signal.

### De fyra dimensionerna (per teorisida)

- **Våg** — namngiven position + alternativ räkning vid tvetydighet.
- **Pris** — 2–4 operativa nivåer med källa (fib/GANN/MA/sväng), exakta tal.
- **Tid** — horisontens fönster + närmaste tidsankare, DATUM (aldrig "snart").
- **Brytpunkt** — observationen som falsifierar tesen + agerandekoppling
  ("veckostängning < X → aktivera defensiv plan"). Brytpunkterna, inte
  prognoserna, är det som exekveras. Fält utan konkret värde = cellen ej klar.

## Hårda regler — bryt aldrig dessa

1. **Pedagogisk kvantitativ analys, ALDRIG investeringsråd** (lagen
   2007:528; utbildning tillåtet enligt 2 kap 5 § — se juridikgrind-skillen).
   Formuleringar: "så fungerar metoden", "så kan en AK1A-analys se ut",
   "metodens röst blir X". ALDRIG "köp denna aktie" eller "min
   rekommendation är". Rekommendationsskalan (nedan) är ett KLASSIFICERAT
   UTTRYCK med villkor och storleksram — aldrig en uppmaning. Varje rapport
   har ansvars- och riskdeklarationssida först.
2. **Falsifierbarhet.** Varje tes/cell/scenarie får explicit brytpunkt.
   Teori utan brytpunkt får inte rösta i SAM.
3. **Deklarera före resultat.** Vikter och poängsättningstabell publiceras
   innan resultaträkningen — rekommendationen följer tabellen, aldrig tvärtom.
4. **Statistisk ärlighet.** Konfluens kräver ≥3 metodologiskt oberoende
   källor (täthetsfällan: i ett tätt nivåband träffar slumpen ofta — är
   avståndet mellan nivåer < ~2× ATR degraderas zonen). Tidscykler vikt
   10 %. Konfluenszoner passeras utan volymreaktion degraderas.
5. **Deklarerad data.** Data-t.o.m.-datum (ur källfilernas egna fält),
   källa per siffra, beräknade storheter markeras, uppskattningar `[est.]`,
   kända dataluckor listas. Molnagenten hämtar INTE live-data — allt ur
   repo-filerna nedan. Saknas bolaget: säg det ärligt (motorn gissar
   aldrig — samma princip som src/lib/analysfabrik.ts).
6. **Bayes-disciplin.** Sannolikheter uppdateras endast på fördefinierade
   bevis med explicita likelihoods — aldrig på känsla. Trösklar för
   mekaniska åtgärder förskrivs i rapporten.
7. **Uppföljning före ny analys.** Läs tidigare analys + valideringsdata
   först, poängsätta träffar/missar, låt kalibreringseftersläpningen synas.

## Data i repot — läs HÄR (exakta sökvägar)

| Källa | Sökväg | Innehåll |
|---|---|---|
| Motorns analyser | `data/analyses/{TICKER}.json` (11 st) | 25-cellsmatris `waveSummary.matris25` (`{teori.horisont: −1/0/+1}`), vågklass per horisont, `priceLevels` (fib/MA/52v), `risk` (sigmaAr, atr14, voltrend, pos52), data-t.o.m. i `verified` |
| Forskningsbiblioteket | `data/forskningsbiblioteket/{TICKER}.json` (22 st, `analysfabrik-v1`) | AKM1-poäng, AKM2-profil, vågläge per horisont, risker, falsifiering — samma data som sajten (src/lib/analysfabrik.ts) |
| Fundamental-cacher | `data/cache/akm1-{TICKER}.json` (100 st) | AKM1:s 20 variabler V01–V20 med poäng + motiveringar |
| AKM2-cacher | `data/cache/akm2-{TICKER}.json` (100 st) | AKM2-profil (akm2-2026), moduler, band |
| F-våg-cacher | `data/cache/fvag-{TICKER}.json` (100 st) | Fundamental vågmotor per horisont |
| Bolagsuniverset | `data/portfolj-system/bolagsunivers.json` | 100 bolags fundamentals (kontrakt: src/lib/portfolj-forskning/typer.ts) |
| Korstabell | `data/portfolj-system/korstabell-grund.json` | AKM1 + FVag sammanvägt |
| Regim (AKM3) | `data/portfolj-system/regime-logg.json` + `data/forskning/AKM3/` | Regimindikatorer + AKM3:s sju rön (r1-bayes.md, r2-regimer.md, r5-ensemble.md …) |
| Vågvalidering | `data/rapporter/vagvalidering-SENASTE.json`/`.md` | Motorns träff-% per horisont × klass (rullande kvitto) — källa till kalibreringseftersläpning |
| Uppföljning | `data/portfolj-system/uppfoljning/` | Format för portföljföljning (cron läser) |
| Urval & branscher | `data/portfolj-system/manifest.json` | Branschurval, verktygskedja, motiveringar |

Ticker-normalisering: cachefiler byter `.`→`_` (`ABB.ST` ↔ `ABB_ST`,
`NOVO-B.CO` ↔ `NOVO-B_CO`) — kontrollera båda stavningarna. nya analysfiler
i data/analyses/ saknar suffix (`VOLVAR-B.json`). Börja med `ls` på
katalogerna för att se vad som FINNS just nu — filerna ovan är verifierade
2026-09-11 men tillväxer.

## Arbetsflödet — åtta steg

### 0. Föranalys
Läs tidigare analys för bolaget (data/analyses/, data/forskningsbiblioteket/)
+ vagvalidering-SENASTE. Poängsätta gamla brytpunkter. Detta är metodikens
självläkande loop — redovisa "märkt historik" i Del I.

### 1. Datainsamling (ur repot)
Läs tabellen ovan per ticker: matris25 + vågklasser + nivåer + σ/ATR/52v-
position (motoranalysen), AKM1/AKM2 + fundamentals (cacher + universet),
regim (AKM3). Deklarera data-t.o.m. ur filernas egna fält (`verified`,
`versionsdatum`, `skapad`). Kända luckor listas öppet — molnversionen
kompilerar befintliga mätningar; den hittar inte på nya.

### 2. Kalibrering — tillgångens DNA
Årlig σ, ATR i % av kurs, max drawdown, likviditet — ur motoranalysens
`risk`-block + historik i universet. Klassa regim (trend / utspädningsspiral
/ re-rating / händelsedriven) mot AKM3:s regimlogg. Bestäm processkaraktär:
diffusion eller *händelseprocess med diffusion emellan* — det avgör vilka
verktyg som får bära besluten (tvålager-modellen: händelsekalender primär,
teknisk struktur sekundär, GBM endast referensfördelning).

### 3. Nivåval
- **Avancerad (99 sidor)** — när minst ett gäller: σ > 60 %, börsvärde
  < 500 MSEK, pågående/nära emission eller binär händelse inom 90 dagar,
  fusion/special situation. Struktur: `references/rapportstruktur-avancerad.md`.
- **Kort (13 sidor)** — storbolag med kontinuitet (σ < 40 %, mcap > ~10 mdr,
  ingen binär händelse < 90 dagar). Femte teorin = Intermarket. Pedagogisk
  ton, beginner-boxar. Struktur: `references/rapportstruktur-kort.md`.

### 4. Matrisen (Del II–VI)
Per horisont: översikt (statusrad, händelsekalender) → fem teorisidor →
SAM-sida. Motoranalysens matris25 är STARTLÄGE — agenten fördjupar varje
cell mot nivåerna i priceLevels och deklarerar var motorns signal
förstärks/dämpas. Bygg konfluensmatrisen (Zon | Metoder | Konfluensgrad |
Roll) med ≥3-regeln. Teori som missat sin egen nivå två gånger nedvärderas
i SAM (bevis: vagvalidering).

### 5. Fundamenta & värdering (Del VII)
AKM1/AKM2-poängen + universets tal bär fundamenta: multipelband mot peer
(branschmedianer finns i universet/korstabellen), DCF som golvdiskussion
med känslighetsmatris, emissions-/TERP-matematik om tillämpligt. Markera
vilket scenario varje värdering tjänar. Proformajustera vid strukturella
händelser (regim A/B-delning).

### 6. Scenarier & sannolikheter (Del VIII)
Tre scenarier (Bull/Base/Bear), varje med: steg-för-steg-kedja (✓ på
realiserade steg), kedjematematik (P = produkten av motiverade dellänkar),
värderingsmatematik (intäkt → marginal → multipel → SEK/aktie på fullt
utspädd stock), sannolikhet, prismål knutet till teknisk referensnivå,
ogiltigförklaringsvillkor. Kör sedan skripten (se nedan): Monte Carlo-
referensfördelning, Bayes-posterior, Kelly-storlek. Bygg trigger-matrisen:
varje kommande händelse med "om X → posterior Y → åtgärd Z" förskriven.

### 7. Risk & rekommendation (Del IX–X)
6–7 risker med sannolikhet/påverkan, poäng 0–10, vikter (strukturella
20–25 %, operativa 15–20 %, andra ordningen 5 %), vägd total — +
OBLIGATORISK korrelationsvarning (kedjerisker är EN risk med fyra masker).
Konsensusröst: teknik-SAM 30 % + fundamenta 30 % + scenarier 20 % + risk
20 %, vardera röst −1…+1.

Översättningstabell (deklareras i Del I):

| Vägt SAM | Fundamental position | Riskpoäng | Klassificering |
|---|---|---|---|
| > +0,40 | pris < golv | < 5 | STARKT KÖP |
| +0,25…+0,40 | pris < mål | < 6 | KÖP |
| +0,05…+0,25 | mellan golv och mål | ≥ 6 | FÖRSIKTIGT KÖP |
| −0,05…+0,05 | — | — | BEHÅLL |
| < −0,05 | pris > mål / bruten struktur | ≥ 7 | FÖRSIKTIGT SÄLJ / SÄLJ |

Kvalificerare **"(spekulativt)"** när: σ > 60 %, mcap < 500 MSEK,
omsättning < 5 MSEK/dag och ≥1 binär händelse < 90 dagar — en
storleksinstruktion (Kelly-dämpning), inte svaghet. Formulera alltid som
metodikens röst: "ramverkets klassificering blir X (spekulativt) — så
räknas den, inte en uppmaning."

Positionsstorlek från riskbudget (acceptabel portföljförlust 0,5–1 % /
avstånd till stopp), Kelly-filtret som tak. Entry-trappa, exit-plan,
bevakningsplan — som pedagogisk genomgång av metodens mekanik.

### 8. Rapport + valideringslogg + publicering
HTML-rapport: designsystem `assets/rapport.css` (AK1A guld/silver, länka
eller bädda in; ändra aldrig profilen utan kundens medgivande). Sidhuvud
`AK1A <TICKER>` + Del, sidfot nivå + `Sida X av N`. Omslag → innehåll →
ansvarssida, alltid i den ordningen. Svenska decimaler ("0,86 SEK",
"+4,9 %"). Filnamn `<BOLAG>_<NIVÅ>_<ÅÅÅÅ-MM-DD>.html`. Rapporten åldras
per händelse, inte per månad — skriv det.

**Valideringslogg** (lämna falsifierbara spår): prognostabell
(Datum | Påstående | Horisont | Brytpunkt | Förfaller | Utfall | Träff)
+ Brier-rader (Brier = Σ(pᵢ−oᵢ)²; 0,67 ≈ slump på tre utfall). Vid ny
analys fylls förfallna rader i och kalibreringsdriften redovisas.

**Publicering — ALDRIG direkt.** Maskinen publicerar aldrig själv
(våg 66:s lag, lagen 2007:528): (a) blir analysen blogginnehåll →
m9-fabriken (`verktyg/m9-fabrik.mjs`) skriver UTkast till granskningskön
i Supabase — kunden granskar och klickar publicera; utkastet hamnar då i
`data/blogg/<slug>.json` (se data/forskning/M9-GRANSKNING-2026-09.md);
(b) blir det kvartalsdata → frysta utgåvor i `data/rapporter/kvartal/`
via frys-cronen (write-once, kontrakt: data/forskning/A4-KVARTAL-KONTRAKT.md
— katalogen skapas av cron vid första frysningen, leta inte efter
befintliga utgåvor där);
(c) interna datafiler levereras enligt leverera-data-skillen. Rapport-HTML
till kunden i studion = arbetsmaterial, inte publicering.

## Skripten — körbar kvantmatematik

I `scripts/` i denna mapp (stdlib-python, inga beroenden — körbara på
servern). Reproducerbara: seed låses som standard till analysesdagen
YYYYMMDD. Kör dem och återanvänd utdata — räkna aldrig Monte Carlo/Bayes/
Kelly för hand.

```
python .zcode/skills/ak1a-analys/scripts/monte_carlo.py --S0 0.86 --sigma 0.99 --mu 0.374 --levels 0.82,1.25,1.40,2.03
python .zcode/skills/ak1a-analys/scripts/bayes.py --prior 0.20,0.50,0.30 --likelihood 0.18,0.30,0.55 --targets 2.03,1.40,0.93
python .zcode/skills/ak1a-analys/scripts/kelly.py --probs 0.10,0.45,0.45 --returns 1.36,0.63,0.08 --sigma 0.99 --mu 0.374 --stop-dist 0.10
```

Tolkningsreglorna (variance drag, terminal- vs touch-sannolikheter, µ =
ln(EV/S₀)/T, Kelly som diagnos inte gåva, verklighetsfilter ~1/10 → 1/σ →
halvering vid binärt utfall → riskbudget) står i `references/kvantmetoder.md`
— läs före använding. Full formalism, konfluensprincipen, tvålager-modellen
och TERP-matematiken: `references/ramverket.md`.

## Output-konventioner

- Svenska, rak, varm, professionell. Rekommendationsformulä:
  STARKT KÖP / KÖP / FÖRSIKTIGT KÖP / BEHÅLL / FÖRSIKTIGT SÄLJ / SÄLJ
  + kvalificerare — alltid presenterat som ramverkets klassificerade
  uttryck med villkor och storleksram, aldrig som uppmaning.
- Ansvarssida först efter omslag: pedagogiskt syfte, ej rådgivning,
  dataansvar, kända luckor.
- Deklarera data-t.o.m. och källor per siffra; uppskattningar märks [est.].
- Gamla nivåer som ogiltigförklarats märks "historik" — radera aldrig spår.
