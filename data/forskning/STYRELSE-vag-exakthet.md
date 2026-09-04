# STYRELSEBEDÖMNING — VÅGEXAKTHET I AK1A

**Datum:** 2026-09-04 · **Mandat:** kundkravet "våg analys skall göras och garantera högst exakthet"
**Underlag:** genomläsning av koden i repo `ak1` (läsning, ej bygge). Alla påståenden har fil- och radhänvisning.

---

## 0. Sammanfattning för styrelsen

AK1A har **två fundamentala vågmotorer** — och det är styrelsens viktigaste bakgrundsfakta:

1. **`src/lib/portfolj-forskning/fundamental-vagmotor.ts`** (794 r) — trippelröstning (tecken/regression/delperiod) på V01–V20 × 5 fönster. Underlag: `BolagsNyckeltal.serier` (årsdata; endast 4 av 20 variabler har härledbar serie, r 365–370).
2. **`src/lib/vagfundament-motor.ts`** (1078 r) — produktionsmotorn. Drivs av Yahoo fundamentals-timeseries och matar **cron-vågkartan** (`src/app/api/cron/vagscan/route.ts` r 179), **konfluensmotorn** (`src/lib/konfluens-motor.ts` r 337–341) och **vagkurva-grafen** (`src/components/ak1a/vagkurva-graf.tsx` r 18). Klassningen här är **EN encells-momentumkoll** (±6 %, r 427–436) — ingen röstning.

All exakthetskritik nedan gäller i första hand produktionsmotorn (2), eftersom den är det kunden ser dagligen.

**Huvudslutsats:** Motorn är *deterministisk och spårbar* — det är redan starkt. Men den är *omätbar i utfall*: ingenstans lagras "vågklass vid dag X" mot "faktisk rörelse vid dag X+k", så kundkravet "högst exakthet" kan idag varken bevisas eller förbättras vetenskapligt. Fem åtgärder föreslås; den högsta prioriteringen är ett **vägvaliderings-kit** som automatiserar kundens egen Träff ✓/✗-kultur.

---

## 1. Granskning: var kan dagens vågmotor ha fel?

### 1.1 Två motorsystem med samma språk, olika matematik

Produktionsmotorn (`vagfundament-motor.ts`) klassar varje (variabel, horisont)-cell med **en enda momentumregel**: `|mom| ≤ 6 % → basbygge; > +6 % → impulsvåg; < −6 % → korrigering` (r 427–436). En "medel-bekräftelse" beräknas (`senaste ≥/≤ medel`) men **kan aldrig sänka klassen** — dokumenterat som "momentum utan medel-bekraftelse -> momentumriktningen galler" (r 424–426). Trippelröstningen (≥2 av 3 oberoende metoder) finns alltså **endast i portföljforskningsmotorn** (`fundamental-vagmotor.ts` r 191–212), som inte används av cron, konfluens eller grafer.

**Konsekvens:** en ensam kvartalsavvikelse räcker för att flippa en cell i det kunden ser. Kontra: i forskningsmotorn krävs majoritet av tre metoder.

**Extra fynd:** `vagkurva-graf.tsx` r 30–31 hävdar i sin källtext att kurvan visar "vågKLASS från fundamental **trippelröstning** (tecken+regression+delperiod på V01–V20)" — men komponenten läser `/api/vagfundament` (r 18–19), dvs. encellsmotorn. **Källtexten överdriver motorns robusthet och bör rättas oavsett allt annat** (ärlighetsprincip P8).

### 1.2 Teckentäckning: N=20 med null-hål

- **9 av 20 variabler är per definition osatta** i produktionen: `OSATTA_VARIABLER = {V02,V03,V06,V13..V18}` (`vagfundament-motor.ts` r 66) — ARR, segment, EV/EBITDA och alla kvalitativa moat/katalysatorer saknar serie i Yahoo-källan.
- **Teckenvakten slår ut serier som passerar noll:** `_momentum` returnerar null om `nu ≤ 0 || forr ≤ 0` (r 415–419). ROE, FCF och resultat som går genom noll blir "osatt" — korrekt ur ärlighetssynpunkt, men det tömmer celler i just de cykliska lägen där vågläget är mest intressant.
- **Empiriskt bevis:** i `data/rapporter/motorervalidering-2026-09-02.md` (2026-09-02-körningen) redovisas VOLV-B.ST `{impulsvag:16, korrigering:8, basbygge:17, osatt:59}` och SAAB-B.ST `{...osatt:60}` — **59–60 % av de 100 cellerna är osatta**, och `total.lang = null` för båda bolagen (Yahoo levererar ~4 års årsdata; "lång" kräver 6 år, se r 465–469 och noteringen r 883–884).
- I portföljforskningsmotorn är läget ännu glesare: endast **V01, V09, V12, V19** har serier ur `BolagsNyckeltal.serier` (`fundamental-vagmotor.ts` r 365–370); `serier`-typen bär bara omsättning/resultat/ekvitet/FCF (`typer.ts` r 122–129). Skuld (V10), bruttomarginal (V07), aktieantal (V20) nämns uttryckligen som framtida fält (r 368–369).

**Tolkning:** "20 × 5-matrisen" är i praktiken en "11 × 4-matris med hål". Det är inte ohederligt — men exaktheten i *aggregaten* (kategorirader, total, vågkarta-signal) vilar på tunn grund och bör redovisas med täckningstal i varje vy.

### 1.3 Fönsterlängder och historikdjup

- **Produktion:** mikro = qoq (senaste vs föregående kvartal, r 448–450) — **ingen säsongsjustering**. Ett Q4-tungt bolag får systematiskt "korrigering" varje Q1 och "impulsvåg" varje Q2. Det är den enskilt vanligaste källan till falska signaler i encellsmotorn.
- **Mega-cellen** = `ar[sista] vs ar[0]` (r 471–474) — med ~4 punkter blir mega ett punkt-till-punkt-mått över hela historiken, känsligt för startårets val.
- **Portföljforskning:** fönster 3/4/5/6/hela (`fundamental-vagmotor.ts` r 69–75). Fönstren är **nästlade**: mikro(3) ⊂ kort(4) ⊂ medellang(5) — med en 5-punktig årsserie är medellång och mega **identiska fönster** (båda = hela serien), vilka tillsammans väger 0,45 av `HORIZONTER_VIKT` (`typer.ts` r 21–27). De fem horisonternas "röster" är alltså långt ifrån oberoende.
- **Null-hålen kollapsar:** `fonsterFor` filtrerar icke-ändliga tal och tar sedan `slice(-ta)` (r 217–227) — två icke-angränsande år kan hamna intill varandra och `diffar()` behandlar dem som grannar. Mellanliggande förlorad period försvårar klassen osynligt.

### 1.4 Röstningsvikter och beslutsregler

- **2–1 räknas som 3–0:** trippelröstningen sätter klass vid "minst 2 av 3" (`fundamental-vagmotor.ts` r 203–210) men redovisar ingen skillnad i säkerhet — enighetsscore saknas helt i båda motorerna.
- **Vågkartans rörelserankning:** `raknaRorelser` i cron-rutten kräver bara *strikt flest horisonter* per variabel (r 140–147). När 3 av 5 horisonter är osatta kan **2 impulsvågar av 2 bedömda** definiera en "topprörelse" i dagens signal till kunden.
- **`viktadKlass`** (`fundamental-vagmotor.ts` r 610–624): en ensam kort-horisont (vikt 0,2 ≥ `MIN_CAST_VIKT` 0,1, r 92) kan sätta variabelns hela klass — rimligt dokumenterat men inte synligt i UI.
- **Statisk tröskel för alla variabler:** ±6 % gäller lika för omsättning (kalm) och kvartalsresultat (vilt). En bruttomarginal som rör sig +5,5 % räknas som basbygge även om det är dramatiskt *för den variabeln*. Produktionmotorn saknar den variabelanpassade brusnormalisering (MAD) som forskningsmotorn har i metod C (r 181, `BRUS_FAKTOR`).

### 1.5 Konerna (`vagkon.ts`) och konfluens

- Konen är ren referens: `S_p(t) = S₀·exp(z_p·σ·√t)`, μ=0, P10/P90 (r 10–14, 51–54, 143–149). σ = hela historikens log-returvolatilitet utan vikning mot nuläget (r 112–125). **P10–P90-bandet är ett 80 %-påstående som aldrig kalibrerats mot utfall** — ingen logg kollar om realisationerna hamnade inom bandet.
- Konfluensmotorn återanvänder encellsmatrisen: `fundamentalVagstart` = andel impulsvågar på mikro+kort med `MIN_VAGSTART_CELLER = 6` (`konfluens-motor.ts` r 125–126, 235–240). Konfluenspoängens "exakthet" ärvs alltså rakt av 1.1–1.4:s svagheter.
- Uppföljningsmotorn (`src/lib/portfolj-forskning/uppfoljning.ts` r 246–312) jämför klass *då mot nu* men beräknar **aldrig träff mot utfall** — den beskriver förändring, inte rätt/fel.

### 1.6 Sammanfattande riskbild

| Risk | Var | Bevis |
|---|---|---|
| Encellsklassning i produktion | vagfundament-motor r 427–436 | jämför fundamental-vagmotor r 191–212 |
| 59–60 % osatta celler | rapport 2026-09-02 | VOLV/SAAB-sammanfattningar |
| Säsongsblinda mikro-fönster | _cell r 448–450 | qoq utan säsongsjustering |
| Ingen träffmätning alls | hela repot | uppfoljning.ts beskriver, dömer inte |
| Överdriven källtext i UI | vagkurva-graf r 30–31 | säger "trippelröstning", använder encellen |
| Okalibrerade konband | vagkon.ts r 143–149 | P10/P90 aldrig testade mot utfall |

---

## 2. Fem förbättringar, rankade efter exakthetsvinst/kostnad

### Rang 1 — (b) Vågvaliderings-kit: automatisk träff-% per vågklass och horisont

**Vinst/kostnad: HÖGST.** Utan mätning av utfall kan ingen annan förbättring på denna lista *bevisas* öka exaktheten — vi skulle bara byta en osynlig felkälla mot en annan. Kitet (specifikation i §3) kräver ingen ny motor, bara en cron-rond som läser redan sparad data (`system_events type=vagscan` innehåller hela per-variabel-matrisen i `details`, se vagscan-rutten r 214–224).

Kundkulturen finns redan som förcedent i AKM2-arkitekturen: dom-protokollet `bekraftad | motsagd | osatt` med "träffsäkerheten per modellversion publiceras … dåliga versioner dras tillbaka öppet" (`data/forskning/r4-akm2-arkitektur-2026-09-03.md`, §8.2). Vågvalideringen är samma loop, tidigare i kedjan.

### Rang 2 — (e) Enighetsscore 0–100 per mätning, synlig i alla våg-UI

**Vinst/kostnad: HÖG / LÅG.** All information finns redan:

- I encellsmotorn: `medelBekraftad` (bool, r 100), momentummarginalen mot ±6 %-tröskeln, och antalet bedömda celler bakom varje aggregat.
- I trippelröstningen: 3–0 vs 2–1 (`fundamental-vagmotor.ts` r 198–211), plus fönsterpunkter.

Förslag på formel (deterministisk, dokumenterad konstant): `score = 40·(medelBekraftad) + 30·(marginal/6 %, tak 1) + 30·(bedömda celler/totalt)`. 2–1-trippelröstning motsvarar ~67 poäng, 3–0 ~100. Visas som "enighet 72/100" intill varje vågklass i vågkarta, vagkurva-graf och korstabell. **Direkt ärlighetsvinst: en tunn mätning ser tunn ut.** Kalibreras senare mot Rang 1:s data.

### Rang 3 — (d) Backtest-läge i `verktyg/validera-motorer.mjs` (frusen historik ur cacher)

**Vinst/kostnad: HÖG / MEDEL.** `system_events type=vagscan` har (sedan driftsättningen) en rad per dag med full matris. En backtest-fas (Fas F i 100%-väktaren, `verktyg/validera-motorer.mjs` — se struktur r 21–48) kan: hämta scan från dag T, beräkna klass, hämta scan från dag T+90 (kvartal) / T+365 (år), läsa variabelns faktiska nivåförändring ur `indikatorer[vid].nuvarde`, och döma Träff enligt samma protokoll som Rang 1. **Detta ger månaders träffdata direkt, i stället för att vänta på realtid** — och gör 100%-sviten till en *prediktiv* validator, inte bara en strukturell. Notera gränsen: backtesten mäter historiskt dataflöde, inte live-leverans; båda behövs.

### Rang 4 — (c) Osäkerhetsintervall per vågklass (konfidens från rösternas enighet)

**Vinst/kostnad: MEDEL-HÖG / LÅG-MEDEL.** Två spår:

1. **Klassnivå:** varje vågklass redovisas med intervall snarare än punkt: "impulsvåg (svag, 2–1)" vs "impulsvåg (stark, 3–0)" — fallen ur enighetsscoren (Rang 2).
2. **Konerna:** `raknaVagkon` utökas med ett kalibreringsfält `bandTraff` — andel historiska steg-verifieringar där realisationen låg inom P10–P90 (beräknas ur historiken själv: för varje t, kolla var S(t+steg) hamnade relativt till konen ritad från S(t)). Om andelen systematiskt avviker från 80 % justeras z eller σ-fönstret dokumenterat. Detta gör "högst exakthet" mätbart även i graferna.

### Rang 5 — (a) Kvartettröstning i produktionmotorn (±median/MAD-robusthet)

**Vinst/kostnad: HÖG VINST / HÖGST KOSTNAD — gör sist.** Portera trippelröstningens A/B/C till `vagfundament-motor.ts` och lägg till en fjärde robust röst: **median/MAD-trend** — `sign(median(senaste tredjedelen) − median(övriga))` med krav `|Δ| > 2·MAD(diffar)` (samma grunder som `fundamental-vagmotor.ts` r 174–189). Klass sätts endast om **≥3 av 4** håller med; `medelBekraftad = false` degraderar impulsvåg/korrigering till basbygge (ändrar den idag tandlösa bekräftelsen, r 424–426, till en faktisk veto-röst).

**Viktigt:** motorändringen ska valideras mot Rang 1:s träffdata på minst ett kvartal innan den blir förval — annars vet vi inte om kvartetten faktiskt slår encellen på det här universumet (12 svenska large caps, `vagscan/route.ts` r 20–23). Dessutom: säsongsjustering (mikro = yoy i stället för qoq) hör hemma i samma våg, eftersom den sannolikt ger större enskild träffhöjning än en fjärde röst (se 1.3).

---

## 3. Vägvaliderings-kit — preciserat förslag

### 3.1 Ny cron-rond

- **Fil:** `src/app/api/cron/vagvalidering/route.ts` (samma skyddsmönster som vagscan: `CRON_SECRET` via query/Bearer, se r 169–176).
- **Schema i `vercel.json`:** `"30 5 * * *"` — efter vågskanningen (05:00) och före kvalitetsvakten (07:00), samma dagliga kadens. Kostnad: ~noll nya nätanrop (läser Supabase + dagens scan-cach).
- **Ingångsdata:** `system_events` där `type = eq.vagscan`, ordnad fallande, `select=details,created_at` — exakt den läsning som redan finns i `/api/vagscan/senaste/route.ts` (r 9) och `src/lib/dashfraga.ts`. Utöver dagens: `limit=400` rader (~13 månader) för backtidsfyllnad.

### 3.2 Tabellstruktur (system_events, ingen ny tabell i fas 1)

Dagligen skrivs **EN** rad:

```jsonc
{
  "type": "vagvalidering",
  "severity": "info",
  "message": "Vågvalidering: 61 % träff (n=412, osatta 38 %) senaste 90-dagarshorisonten",
  "source": "cron/vagvalidering",
  "details": {
    "genererad": "<ISO>",
    "protokollVersion": 1,                 // fast instans, skriven innan första domen (r4 §8.2)
    "horisontDagar": { "mikro": 90, "kort": 365, "medellang": 1095 },
    "universum": ["VOLV-B.ST", "...12 st"],
    "traffPerHorisont":  { "mikro": { "traff": 0.61, "n": 412, "osatta": 0.38 } },
    "traffPerKlass":     { "impulsvag": { "traff": 0.66, "n": 140 }, "korrigering": { "traff": 0.52, "n": 61 }, "basbygge": { "traff": 0.71, "n": 211 } },
    "traffPerVariabel":  { "V09": { "traff": 0.74, "n": 57 } },
    "nyaDomer": 14,                        // Träff ✓/✗ som avgjorts idag
    "sankningar": []                      // variabler/klasser under 45 % träff med n ≥ 30
  }
}
```

**Dom-protokoll (skrivet innan första domen — kundkulturen formaliserad):**

- För varje par (scan@T, scan@T+k) och varje cell (variabel V, horisont H): klassens tecken `I=+1, K=−1, B=0` jämförs med **variabelns EGEN serieförändring** `sign(nuvarde@T+k − nuvarde@T)`:
  - **Träff ✓** — impulsvåg och `Δ > +6 %`; korrigering och `Δ < −6 %`; basbygge och `|Δ| ≤ 6 %` (samma tröskel som motorn: hedervändig symmetri).
  - **Träff ✗** — motsatt teckenförändring utöver tröskel.
  - **Osatt** — nivå saknas i någon ände, eller variabeln var osatt vid T. Osatta räknas i täckningsbråket, aldrig som fel.
- k per horisont enligt `horisontDagar` ovan. Idempotent: samma (T, k, V, H) döms aldrig två gånger — avgjorda domer cachelagras i `details` och återanvänds.

**Fas 2 (när historiken > 1 år):** dedikerad tabell `vagvalidering_dom` `(id, ticker, variabel, horisont, domat_datum, traff_datum, klass, utfall, traff bool, protokoll_version)` — för frågbarhet per ticker. System_events-raden förblir den publika sammanfattningen.

### 3.3 Publicering — tre ytor

1. **Kvalitetsrapporten:** `verktyg/kvalitetsvakt.mjs` får en åttonde kontroll ("vågträff") som läser senaste `vagvalidering`-event och skriver en sektion i `data/rapporter/kvalitetsrapport-SENASTE.md`; `cron/kvalitet/route.ts` (r 125–129) publicerar redan sammanfattningen via `publiceraOrganEvent` — lägg till `matt: { vagTraffProcent, vagTraffN, vagOsatta }`.
2. **Admin:** GUL/RÖD-gränsen utökas: träff-% under 45 % med n ≥ 30 på vald klass/horisont ger varning via befintlig signal-buss (samma mönster som r 133–143 i kvalitetsrutten, mottagare admin, länk `/admin?kvalitet=true`).
3. **/transparens:** ny sektion "Vågmotorns träffhistorik" per horisont och klass, med n, osatt-andel och protokollversion — exakt det löfte som ges i r4 §8.2 ("träffsäkerheten … publiceras … dåliga versioner dras tillbaka öppet"). Formuleringsexempel: *"Impulsvåg på kort sikt: 66 % träff (140 mätningar, 12 månader). 38 % av alla celler var osatta och räknas inte som träffar."*

---

## 4. Ärlighet: vad "exakthet" KAN betyda — och vad det aldrig får betyda

En fundamental vågmotor läser **bolagets egna historiska serier** och klassar deras rytm. Framtiden är delvis icke-deterministisk; ingen motor — hur noggrann som helst — kan *garantera* utfall. "Högst exakthet" kan därför ärligen bara innebära fyra saker, alla uppfyllbara och alla mätbara:

1. **Determinism:** samma indata → bitidentisk utdata. Redan uppfyllt och *bevisat*: validera-motorernas Fas B kör varje motor 2× och kräver identisk JSON (`validera-motorer.mjs` r 27–28, 661–718); `vagfundament-motor.ts` replikerar till och med pythons avrundning exakt (r 134–179).
2. **Spårbarhet och granskbarhet:** varje klass har källa, fönster och motivering — trippelröstningens hallbarVoting-flik (r 649–656) är föredömlig. 100%-sviten (80 `rad(`-kontroller i validera-motorer + 37 `kolla()` i `testa-fundamental-vagmotor.mjs` r 54 ff) håller strukturen sann.
3. **Kalibrering:** påståenden om osäkerhet (konens 80 %-band, enighetsscore) ska *träffa så ofta de påstår* — bara mätbart med Rang 1/3/4 ovan.
4. **Publicerad träffhistorik:** Träff ✓/✗ per klass, horisont och variabel, med osatta redovisade — kundens egen valideringskultur, automatiserad. Detta är den enda "garanti" som är ärlig: *inte en garanti om framtiden, utan ett öppet kvitto om det förflutna.*

**Gräns som ska formuleras i kundkommunikation:** motorn beskriver rytm och läge i fundamentalserier — den prognostiserar inte aktiekursen, och "osatt" är information, inte fel (P2-arvet, r4 §8.3 punkt 4). Vågkonens platta median (μ=0) är redan rätt signalbild: mittpåstående, aldrig pil.

---

## 5. Rekommendation — i prioritetsordning

1. **BYGG VÅGVALIDERINGS-KITET (§3) FÖRST.** Cron `vagvalidering` kl. 05:30 dagligen, system_events-rad, dom-protokoll v1, sektion i kvalitetsrapport + /transparens. Utan detta är övriga åtgärder omätbara. *Kostnad: dagar. Risk: ingen.*
2. **Rätta källtexten i vagkurva-graf (r 30–31) OMEDELBAR** — den talar om trippelröstning som inte körs i den vyn. En rad, noll risk, ärlighetsvinst nu.
3. **Inför enighetsscore 0–100 (Rang 2) i alla våg-UI** — deterministisk formel ur `medelBekraftad` + tröskelmarginal + celltäckning. Ger kunden synlig osäkerhet per mätning direkt.
4. **Backtest-fas i 100%-väktaren (Rang 3)** — fyll träffhistoriken retroaktivt ur 13 månader sparade vagscan-event; 100%-sviten blir prediktiv.
5. **Därefter motorändringar i ETT steg, validerat mot kitet:** (i) mikro = yoy i stället för qoq (säsongsneutralisering), (ii) kvartettröstning med medelBekräftelse som veto (Rang 5). Rulla ut först när minst ett kvartal träffdata visar nettoförbättring — annars behåll encellen.
6. **Kalibrera vågkonerna (Rang 4 spår 2)** när backtesten levererat bandträffdata; z-justering dokumenteras per protokollversion.

**Slutord till styrelsen:** kundkravet "garantera högst exakthet" uppfylls inte genom att lova högre träff — det uppfylls genom att systemet *kan visa exakt hur exakt det är*, klass för klass, och dra tillbaka det som inte håller måttet. Det kitet saknas idag; det är byggt på befintlig data och kan finnas inom en vecka.

---

### Bilaga — primära källor (fil: rader)

| Källa | Rader | Belyst punkt |
|---|---|---|
| `src/lib/portfolj-forskning/fundamental-vagmotor.ts` | 69–92, 191–212, 217–227, 365–370, 610–647 | fönster, trösklar, trippelröstning, null-hål, 4/20 serier, viktningsregler |
| `src/lib/vagfundament-motor.ts` | 66, 134–179, 415–419, 424–436, 442–485, 883–884 | osatta variabler, pyRound-determinism, teckenvakt, encellsklassning, cellfönster, historikdjup |
| `src/app/api/cron/vagscan/route.ts` | 20–23, 123–163, 169–176, 214–233 | 12-tickersuniversum, rörelserankning, skydd, system_events-skrivning |
| `src/lib/konfluens-motor.ts` | 125–126, 235–240, 312–332, 426–490 | vågstart ur encellsmatrisen, klassregler, självkontroll |
| `src/lib/vagkon.ts` | 10–14, 51–54, 103–163 | konformel, z-kvantiler, σ ur hel historik |
| `src/lib/portfolj-forskning/typer.ts` | 21–27, 122–129 | horisontvikter, seriefält |
| `src/lib/portfolj-forskning/uppfoljning.ts` | 246–312 | då-vs-nu utan träffdömning |
| `src/components/ak1a/vagkurva-graf.tsx` | 18–19, 30–31, 108–113 | UI läser encellsmotorn; överdriven källtext |
| `verktyg/validera-motorer.mjs` | 21–48, 645–718, 1561–1613 | fem faser, determinismfas, fvag-kontroller |
| `verktyg/testa-fundamental-vagmotor.mjs` | 1–54, 265 | fixtures, 37 kontroller |
| `data/rapporter/motorervalidering-2026-09-02.md` | sammanfattningstabellen | VOLV osatt 59/100, SAAB 60/100, total.lang=null |
| `data/forskning/r4-akm2-arkitektur-2026-09-03.md` | §8.2–8.3 | dom-protokoll + transparenslöfte (förcedent) |
| `vercel.json` | crons-blocket | scheman 05:00/07:00 som kitet kopplar in mellan |
| `src/app/api/cron/kvalitet/route.ts` | 82–96, 125–143 | rapportläsning, OrganEvent, RÖD-signal (publiceringsytor) |
