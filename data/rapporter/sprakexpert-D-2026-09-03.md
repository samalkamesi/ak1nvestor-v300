# Språkexpert pass 1 — Batch D (sista fjärdedelen), public/deep-courses.json

**Datum:** 2026-09-03
**Omfattning:** 81 kurser (sorterade nycklar index 252–332: `the-visual-investor` … `zero-to-one`)
**Metod:** title/summary/why + minst 3 kapitel fulltext per kurs (bokkurser), samtlig boilerplate i ts-/ud-/v-/vm-serierna, quiz (frågor/alternativ/tips), extrafält (history, lynchSection, grahamSection, ak1Section). Korpusbaserad garbledetektor (substitutioner är↔ar, ör↔or, a↔å/ä, o↔ö mot hela 333-kurskorpusen), CJK/kyrillisk-skanning, dubbelords- och engelskleckes-skanning. Kirurgiska node-replacements med förväntade antal per regel; filen skrevs endast när alla regler matchade exakt.
**Resultat:** 834 godkända ersättningar i 6 fixomgångar. Efteråt: JSON parse OK, 333 kurser, 2 916 kapitel, 8 211 quizfrågor, nyckelordning och formatering (2 indrag, avslutande radbryt) bevarad, 0 kvarvarande "approach"/"vågör"/CJK/kyrilliskt i batch D. Batch A–C orörd.

---

## 1. Rättningar

### 1.1 Maskinspår — verbdegenerering "-är"→"-ar" m.m. (regel 1)
| Fel | Rättning | Antal | Kurser |
|---|---|---|---|
| lönär | lönar | 9 | the-warren-buffett-portfolio (2), v13-patent-ip, value-investing (4), var-ekonomi, what-works-on-wall-street |
| jämfär | jämför | 1 | v04-ps |
| förvånär | förvånar | 1 | vagfundament |
| bärbär | bärbar | 1 | this-time-is-different |
| ATERKÖP | ÅTERKÖP | 1 | v19-kapitalforbranning |

### 1.2 Systematisk garble "vågör" (maskinspår, klass "-ör"→"-or")
`vågör/Vågör → vågor/Vågor` — **54 förekomster** i batch D. OBS: korrekt form "vågor" fanns **noll** gånger i hela filen; garblen är filomfattande. Kvar i 31 kurser i batch A–C (annat pass ansvar). Förekommer också i sammansättningar (elliott-vågör, impulsvågör, svallvågör).

### 1.3 Övriga garblerade ord (regler 1–2, 5)
- DJUPGT → DJUPT (this-time-is-different, why)
- värje → värde (ts-13-rsi, intro)
- vråär → vrår (you-can-be…, why)
- värderingsmultipln → värderingsmultipeln (what-works…, why)
- ettmediokert → ett mediokert (var-ekonomi, why)
- aktiorns → aktiens (ts-17, why + lynchSection)
- innebörelse → innebörd (ts-01)
- Huvu-och-skuldror → Huvud-och-skuldror (ts-18, summary — "Huvu" var avkapat; "skuldror" redan korrekt i filen)
- rishanteringen → riskhanteringen (ts-19, why)
- bottenar → bottnar (ts-13, why)
- lägändringar → lagändringar (v18, summary ×4)
- öppja → öppna (v17 ×2)
- psyologiska → psykologiska (ts-01)
- hålleverantörer → stålleverantörer (zero-to-one — Thiel-exemplets kommoditbransch)
- Coase-ägörätter → Coase-äganderätter (var-ekonomi)
- humörena → humörerna (zero-to-one)
- namna → nämna (vagfundament)
- arbod → arbete (ts-02, history.evolution)
- Garteleys → Gartleys (ts-20, history.evolution)
- skuldhävtång → skuldhävstång (v09, ak1Section)
- riskavös → riskavers (v10, v19 grahamSection)
- Metcalfes läg → Metcalfes lag (v15, 14 st)
- målprix → målpris (ts-18)
- decceleration/deccelererar… → decel… (v01 ×5, v04 ×1, v15 ×1, v16 ×5, v17 ×3)
- Enterprisesvärde → Enterprisevärde (v04 ×2, v06 ×6)
- fallor → fällor (ts-02, ts-11: "dessa fallor")
- delagare → delägare (the-visual-investor)
- Karakter → Karaktär (what-works…, tabellrubrik)
- sannolikhetsfordel → sannolikhetsfördel (what-works…, quiz-tips)
- i overskott → i överskott (winning-the-losers-game)
- behöva rattas → behöva rättas (winning-the-losers-game)
- For varje: → För varje: (this-time-is-different)
- rabatta med 50-70% → rabattera med 50-70% (v17)
- impulsa beslut → impulsiva beslut (ts-12)
- var och en KRAV av processen → var och en krävde av processen (value-investing)

### 1.4 Icke-svenska tecken (CJK/kyrilliskt) — 5 st, alla i batch D
| Original | Rättning | Kurs |
|---|---|---|
| ett tillfälligt**噪音** eller | ett tillfälligt brus eller | ts-17-trendlinjer |
| Ett exempel:**瑞典** biometrik-bransch | Ett exempel: den svenska biometrik-branschen | v01-försäljningstillväxt |
| 'En**无用** metrik | 'En värdelös metrik | v08-ebitda-marginal |
| Föredrag**友好** acquisitions | Föredrar friendly acquisitions | v17-avtal-partnerskap |
| Spotify och**沃尔沃** | Spotify och Volvo | ts-11-candlestickmonster |
| Backlog av **подпис**tions | Backlog av prenumerationsavtal | v02-arr-tillväxt (kyrilliskt) |

### 1.5 Engelska läckor i svenska meningar (regel 4; titlar/termer orörda)
- En systematisk approach till → Ett systematiskt angreppssätt för (**138 mallinstanser**, hela ud-/vm-/ts-serien)
- övriga approach-läckor → ansats/angreppssätt (9 st): 'top-down'-approach (ts-01), geometriska (ts-05), metodisk (ts-11, ts-14, ts-17), strukturerad, data-driven → strukturerad, datadriven ansats (ts-12), disciplinerad (ts-13), värdebaserad och försiktig (ts-14 grahamSection), synergistiska (ts-20)
- en metodisk approach → en metodisk ansats (ts-01)
- vilka nivåer som matter → vilka nivåer som spelar roll (ts-03 ×2) + detta matters → detta spelar roll (**46 kapiteltitlar**, 23 kurser)
- medfounded av TRW → medgrundare av TRW (winning…)
- största controllable kostnaden → största kontrollerbara kostnaden (winning…)
- drabbade many tech-bolag → många tech-bolag (v01)
- Graham's/Buffett's → Grahams/Buffetts (vm-01 titel, vm-07 ×2, vm-10 ×2, v09 ×4, v15 "Sverige's" → Sveriges)
- "sustained" i svenska meningar → i längden / i N år / varaktigt (v09: 23 st; v05 ×1; v13 ×1)
- diversified → diversifierad (v12 ×3)
- köpa i periods av → köpa under perioder av (ts-15 lynchSection)
- ROE > 15% sustained → ROE > 15% i längden (v09)

### 1.6 Mallgarbler "…bidrog till vår förståelse" (kapitelblock + history.origin)
Maskinplacerade fraser utan grammatiskt subjekt, t.ex. "modern koncept 2000-tal bidrog till…". Rättade (×6 kurser resp. ×1 i history): ts-24 ("Ett modernt koncept från 2000-talet bidrog…", + tidslogiskt omöjligt "under 1900-talet" borttaget), vm-07, ud-04 ("Det klassiska value trap-konceptet…"), ud-08, ud-06 ("En svensk tradition sedan 1980-talet…"), kapitalisering: ud-07, vm-03, vm-08, vm-09; ud-02/ud-05 ("DRIP-/US-konceptet från 1970-/1960-talet…"), ts-25 (history.origin samma fel).

### 1.7 Grammatik: genus, kongruens, sin/sitt (regel 3)
- AK1A:s eget ståndpunkt → egna ståndpunkt (buffett-portfolio)
- ett intern ramverk → ett internt ramverk; det tidigare toppen → den tidigare toppen; stark momentum → starkt momentum (ts-01, ts-13 ×2)
- en bioteknikbolag → ett bioteknikbolag (ts-13)
- ett stigande volym → en stigande volym; en potential formation → en potentiell formation; sin fokus → sitt fokus (ts-18)
- När ett köpare och en mål-bolag → När en köpare och ett målbolag (v17)
- Falskt signal → Falsk signal (ts-13)
- denna marknadssentiment → detta marknadssentiment (ts-17)
- plural + "relevant" → "relevanta" i mallen "I svensk kontext är X särskilt relevant": ud-04, ud-06, ud-08, vm-05, vm-11 (×6 per kurs) + vm-11 history
- är svårast typ av M&A → den svåraste typen av M&A (v17)
- Kelly full insats → full Kelly-insats (buffett-portfolio ×2)
- kort-siktiga → kortsiktiga (v16); utdelnings-fällor/utdelnings-aktier → sammansatta i quiz (ud-04, ud-06)

### 1.8 Dubbelord, ordföljd, interpunktion, avkapade konstruktioner (regel 4)
- att att → att (var-ekonomi ch13; your-money ch7)
- det det ska bevisa → det som det ska bevisa (valuation-measuring-managing)
- rör sig sig → rör sig (ts-17 lynchSection)
- finns finns → finns, finns (trading-in-the-zone — kommatering)
- ser stark ut ut tre år → ser stark ut i tre år (var-ekonomi)
- Näst måste vi vänta → Därefter måste vi vänta (ts-18)
- Detta är där korta trade-vinster görs → Det är här… (v16)
- aktien steg 40% nästa 6 månader → under de följande 6 månaderna (ts-08)
- den intellektuella heder som → hedern som (your-money)
- Dessa tidiga metoden…approach → Dessa tidiga metoder…ansats (ts-12 history)
- under 2000-talet lågräntemiljö → 2000-talets lågräntemiljö (ud-05, ud-07)
- Cape / shiller p/e → CAPE / Shiller P/E (vm-04 ×2); 'intelligent investor' → 'Intelligent Investor' (vm-01 ×2); p/e, ev/ebitda → versaler (vm-03); Fcf → FCF (vm-07 ×2)
- quiz-tips "definitionen av roa." → "ROA." (146 instanser)
- "exempel från svenska börsen" → "från den svenska börsen" (138 instanser)
- biasarna → biaserna (buffett-portfolio, your-money — korpusstandarden är "biaser/biaserna")
- över hela stegen → över alla steg (what-works, quiz-tips)

**Inga tomma quiz-tips och inga trasiga quiz-strukturer hittades** (rätt index, 3–4 alternativ överallt).

---

## 2. Osäkra (markerade, ej gissade)
1. **"forskningslär"** (the-warren-buffett-way ch14.2: "koncentrationen fått ett eget forskningslär") — garble; tänkbara original "forskningsläger"/"forskningsfält" kan inte säkert avgöras. Lämnad orörd.
2. **"Nordstomen"** (ts-11 why: "en volatil marknad som Nordstomen") — okänd avsedd referens (Nasdaq OMX Stockholm?). Lämnad.
3. **"stora utländska aktier dominerar portföljerna"** (ts-15 why) — semantiskt felaktigt för svenska börsen; avsett troligen "utländska ägare/institutioner". Lämnad.
4. **"omnamngivna"** (trading-in-the-zone ×4) — konsekvent jargon, ej SAOL-ord ("omdöpta" vore standard). Lämnad.
5. **"jämförelseanalysera"** (ts-10 ch1.1) — ovanlig sammansättning, tolkbar. Lämnad.
6. **"huvud-axel-formation"** (ts-18 ch3) — avvikande term ("huvud-och-axlar" används annars i kursen). Lämnad.
7. **Boilerplate-innehåll** (ej språkfel, flaggas): ud-seriens quiz-fråga "Vad är ROA?" återfinns i alla utdelningskurser (frågorna matchar inte kursinnehållet); v-kursernas ch5-block avslutas med app-footer ("ANTI-CASINO · INGA PUSH-NOTISER"); ts-24 ch2 har titeln "Vanliga fällor" men intro/block handlar om praktisk tillämpning.
8. **"supervalörer"** (valuation-measuring-managing ×4) — konsekvent intern term, lämnad medvetet.

## 3. De tre värsta fynden
1. **Kinesiska/kyrilliska tecken i svensk löptext (6 st)** — t.ex. "Ett exempel:瑞典 biometrik-bransch växte 15% 2023" (v01) och "Föredrag友好 acquisitions" (v17), "ett tillfälligt噪音" (ts-17). Ren maskinöversättningskontamination.
2. **Systematisk garble "vågör" istället för "vågor"** — 54 instanser i batch D, filomfattande (korrekt form existerar inte alls i källan). Kvar i 31 kurser i batch A–C (plus "Metcalfes läg" i akm1-den-kontroversiella-modellen) — bör rättas i pass 2.
3. **Mallmeningen "modern koncept 2000-tal bidrog till vår förståelse"** (ts-24, vm-07 ×6+1) och syskon ("klassisk value trap-koncept", "svensk tradition sedan 1980-talet", gemena meningsstarter efter punkt) — genererad platthållarprosa med trasig grammatik i hela kapitelserien; dessutom tidslogiskt motsägelsefull ("utvecklades under 2000-talet…populärt under 1900-talet").

## 4. Verifiering
- `node -e "JSON.parse(fs.readFileSync('public/deep-courses.json'))"` — OK.
- 333 kurser, 2 916 kapitel (oförändrat), 8 211 quizfrågor (oförändrat), nyckelordning och indrag bevarade (round-trip identisk före ändringar).
- Alla 159 substitutionsregler (153 kurs-scopade + 6 batch-vida) verifierades mot exakt förväntat antal före skrivning; 0 kvarvarande instanser av något rättat mönster i batch D; CJK/kyrilliskt = 0 i batch D; batch A–C orörda.
