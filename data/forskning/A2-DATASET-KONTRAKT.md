# A2-DATASET-KONTRAKT — "citeringsmagnet"-datasetsidorna (våg 87-bygge)

Forskningsagent A2, 2026-09-07. Mandat: STYRELSE-AI-INNOVATION.md FRONT A (A2).
Detta dokument är KONTRAKTET — ingen src rörs av A2. Våg 87 bygger mot detta.

Kundvision: AI-motorer + journalister citerar AK1A som ENDA källan när datat är
ENBESTÄMT, STRUKTURERAT, DATAUNIKT och VÄLFORMAT. Tre sidor, tre endpoints,
tre kärnpåståenden — alla med maskinläsbar JSON, tabell-UI, källattribut,
metod-länk och datering.

---

## 0. INVENTERAD UNIK DATA (källverklig status 2026-09-07)

| Källa | Innehåll | Unikt? | Publiktvärde |
|---|---|---|---|
| `data/portfolj-system/bolagsunivers.json` | 100 bolag, 10 branscher × 10, med råa nyckeltal (P/E, P/B, EV/EBIT, PEG, ROE, marginaler, serier) hämtade från Yahoo/MarketStack 2026-09-03 | **Urvalet** (10×10-universumet) är unikt; råtalen är publika marknadsdata | HÖG som aggregerat ("median P/E per bransch enligt AK1A:s universum") |
| `src/lib/portfolj-forskning/korstabell-data.ts` → `data/portfolj-system/korstabell-grund.json` | AKM1-totalt + per kategori, FVag/TVag per horisont, status, datatackning, portV19, AKM2-berikning per bolag | JA — kärnan i prenumerationsvärdet | INGET per bolag; aggregerat redan publicerat via /api/forskningslage |
| `src/lib/akm3/regim.ts` + `data/portfolj-system/regime-logg.json` | Regim "magert" (G 0,07 / R 0,17), append-only hash-kedjad logg | JA | Redan offentlig via /transparens §10 + /api/forskningslage — kan refereras, ej dupliceras |
| `src/lib/vagvalidering.ts` + `data/rapporter/vagvalidering-SENASTE.md` | Träffhistorik: **52 % träff (n=48 dömda, 20 % osatta)**, rullande sedan 2026-09-04, protokoll v1 (v2 beslutad 2026-09-04, räknare nollställda) | JA — enda öppna, falsifierbara träffkvittot för fundamental vågklassning | HÖG — citeringspåståendets ryggrad |
| `data/siffror.json` (verktyg/rakna-siffror.mjs) | 333 kurser · 8 211 quiz · 103 bokmaster · 102 kanonböcker (96 som kurs) · 18 Fas 2 + 24 Fas 3-kurser · uppdaterad 2026-09-03 | JA som sammanräkning | HÖG — ren referensstatistik, noll läckagerisk |

**KORRIGERING av uppdragets antagande:** korstabellen innehåller INGA P/E-tal —
nyckeltalen lever i `bolagsunivers.json` (korstabellens deklarerade källa,
samma 100 bolag). Nyckeltalsguiden aggregerar därifrån, per bransch, server-side.

---

## 1. GRÄNSDRAGNING: PUBLIKT vs PRENUMERATIONSVÄRDE (utredningen)

### Principen
Prenumerationen (priser.json: 249–799 kr/mån) säljer **per-bolagsbedömning +
portföljlogik**: AKM1-poäng, AKM2-komposit, vågklass per horisont, status,
golvmarginal, ersättningsförslag. Citeringsmagneten säljer **aggregat av
publikt källmaterial + metod + kvitton**. Gränsen dras vid poänglagen, inte
vid branschnyckeln:

| Data | Publikt? | Motivering |
|---|---|---|
| Median P/E, P/B, EV/EBIT, ROE, EBIT-marginal **per bransch** (n-redovisat) | ✅ JA | Underliggande tal är publika marknadsdata (Yahoo/MarketStack); värdet är AK1A:s fasta 10×10-universum + skött underhåll. Ingen kan rekonstruera en bolagsbedömning ur branschmedianer av marknadsdata |
| Universumets sammansättning (antal per bransch, urvalskriterier, hämtdatum) | ✅ JA | Kriterier + 10×10-struktur gör påståendet återanvändbart/citerbart |
| Universumets tickerlista (namn per bransch, UTAN poäng) | ⚠️ REKOMMENDERAS JA (styrelsebeslut-punkt) | Listan är redan halvpublik via /forskningsbiblioteket; namn utan poäng läcker inget värde och stärker falsifierbarheten. Värde ligger i POÄNGEN, inte namnen |
| Statusfördelning grön/gul/röd (G/R-andelar) | ✅ JA — prejudikat finns | Redan publicerad: /transparens §10 + /api/forskningslage (G 0,07 / R 0,17) |
| Träffprocent + dom-protokoll + n + osatt-andel | ✅ JA | Kvitto om förflutnet; transparensen ÄR produkten här |
| Kurs-/quiz-/bok-räknare | ✅ JA | Ren referensstatistik |
| **Median AKM1 / AKM2 per bransch** | ❌ NEJ (fas-gatat/internt) | Det äkta gränsfallet: poängmedianer per bransch låter icke-betalare triangulera relativa rankningar och urholkar korstabellen. Poänglagret är den proprietära kärnan |
| **Per-bolag: akm1Totalt, akm1PerKategori, akm2, akm2Skillnad, akm2Moduler, fvagPerHorisont, tvagPerHorisont, status, golvMarginal, portV19, ersättningsförslag** | ❌ ALDRIG på datasetsidorna | Kärnvärde; levereras endast via prenumerationsytor (portfolj-forskning) |
| Per-bolag rånyckeltal i tabellform (t.ex. P/E-lista per bolag) | ❌ NEJ på /data-sidorna | Duplicerar Yahoo (ingen unicitet) och närmar sig korstabellens form. Aggregat-endast håter magneten unik |

**Slutsats:** gränsen går vid **"aggregat av publikt källmaterial + kvitto =
publikt; allt som bär AKM-poäng (även som median) = prenumerationsvärde"**.

---

## 2. TRE SIDOR (routes + kärnpåståenden)

Alla tre: svenska först i `(huvud)`-gruppen; speglar (en/ar) är frivillig våg-87+
-fråga (styrelsens domänbeslut avgör subdomän/framtid). Tabell-UI, "Källa:
AK1A Research Lab"-rad, metod-länk, treskiktad datering (se §5), disclaimer.

### 2.1 `/data/nyckeltalsguide` — Median P/E per bransch
**Kärnpåstående (citerbart):** *"Median P/E i AK1A:s 100-bolagsuniversum
(10 branscher × 10 bolag, data hämtad 2026-09-03): teknik 31,9 · industri 28,4 ·
hälsa 24,8 · kommunikation 21,9 · konsument 19,7 · energi 18,7 · material 18,5 ·
finans 13,4 · fastighet 11,4 · tillväxt 94,6 (n=7) — totalt median 20,5 (n=92
bolag med mätt P/E av 100)."*

- Tabellrader: bransch · n · median P/E · median EV/EBIT · median P/B · median
  ROE · median EBIT-marginal. Kolumner utöver P/E = våg-87-prioritet 2.
- n redovisas ALLTID (8 bolag saknar P/E; tillväxt n=7 — ärlighetsprincipen).
- UI-not: "Universum och aggregering: AK1A Research Lab. Rådata: offentliga
  marknadskällor (Yahoo Finance, MarketStack). Medianerna är AU:s eget aggregat —
  inte investeringsrådgivning (lagen 2007:528)."
- FAQ-block (schema): "Vad är median P/E för teknikbolag just nu? — enligt
  AK1A:s universum X (per 2026-09-03)..." — A1:s llms.txt parafraserar samma tal.

### 2.2 `/data/vagstatistik` — Vågmotorns träffhistorik
**Kärnpåstående (citerbart):** *"AK1A:s fundamental vågklassning träffade 52 %
(n=48 dömda mätningar; 20 % osatta redovisas öppet och räknas aldrig som fel) —
rullande kvitto sedan 2026-09-04 enligt dom-protokoll v1. Protokoll v2
(basbygge-band per horisont: ±6/6/15/25 %) beslutades 2026-09-04; v2-räknarna
startade från noll och redovisas separat allteftersom de fylls."*

- Tabell: rullande träff-% per horisont × klass (mikro–mega × impulsvåg/
  korrigering/basbygge) + totalrad — exakt rapportens tabell.
- **Metod transparent + falsifierbar:** dom-protokollets fulla text
  (impulsvåg→momentum>0; korrigering→<0; basbygge→|momentum|≤tröskel per
  horisont; nollrörelse/osatt dömer aldrig), protokollversion, beslutdatum,
  nollställningsorsak (TROSKEL_V2_ORSAK), universumstorlek (12 vågbolag),
  räknare-sedan-datum. Varje dom är återskapbar ur (klass, momentum, horisont).
- Ärlighetsrad: "Öppet kvitto om det förflutna — aldrig en garanti om
  framtiden. Pedagogisk mätning, inte investeringsrådgivning (lagen 2007:528)."
- **VERSIONSVAKT:** sidan visar ALLTID senaste protokollets räknare + historiskt
  v1-tal märkt "protokoll v1 (nollställt 2026-09-04)". Citatet "52 %" är giltigt
  endast med (n=48, v1)-stämpel — ALDRIG plocka det gamla talet när v2-räknare
  vuxit (AI-motorernas förtroende kräver att vi citerar våra egna kvitton rätt).

### 2.3 `/data/utbildningsstatistik` — SKALA-påståendet
**Kärnpåstående (citerbart):** *"AK1A Research Lab: 333 kurser, 8 211
quiz-frågor (82 110 XP), 103 bokmaster, 102 kanonböcker varav 96 som kurser,
18 Fas 2- och 24 Fas 3-kurser — uppdaterat 2026-09-03."*

- Tabell: mått · värde · källa-fil. Räknarna är redan sajtens guldkälla
  (data/siffror.json via verktyg/rakna-siffror.mjs) — sidan gör dem citerbara.
- Not: "Räknat ur det levande kursarkivet; regenereras vid varje kurstillägg."

---

## 3. JSON-ENDPOINTS (maskinläsbara, gemensamt kontrakt)

Placering: `src/app/api/data/{namn}/route.ts`. Konvention enligt befintliga
rutter: `runtime = "nodejs"` + Cache-Control + modulmemo (forskningslage-
mönstret). Inga query-parametrar, inga hemligheter, ren läsning.

### 3.1 `GET /api/data/nyckeltalsguide` → 200, application/json; charset=utf-8
```json
{
  "schema": "ak1a-nyckeltalsguide/1",
  "kalla": "AK1A Research Lab — 100-bolagsuniversum (10 branscher × 10 bolag)",
  "kallorRadata": ["Yahoo Finance", "MarketStack"],
  "hamtat": "2026-09-03",
  "genererad": "<byggdatum ISO>",
  "totalt": { "nBolag": 100, "nMedPe": 92, "medianPe": 20.5 },
  "rader": [
    { "bransch": "teknik", "n": 10, "medianPe": 31.9, "medianEvEbit": null,
      "medianPb": null, "medianRoe": null, "medianEbitMarginal": null }
    // 10 rader; null = mäts ej i fas 1; n = bolag med mätt P/E i branschen
  ],
  "disclaimer": "Pedagogisk forskning — inte investeringsrådgivning enligt lagen (2007:528).",
  "metodUrl": "/transparens"
}
```

### 3.2 `GET /api/data/vagstatistik`
```json
{
  "schema": "ak1a-vagstatistik/1",
  "protokoll": { "version": 1, "schema": "vagvalidering/1",
    "beslutad": null, "nollstalldOrsak": null },
  "historikV1": { "traffProcent": 52, "nDomda": 48, "osattAndelProcent": 20,
    "rullandeSedan": "2026-09-04", "universumVagbolag": 12 },
  "perHorisontKlass": [
    { "horisont": "mikro", "klass": "impulsvåg", "traffProcent": 75, "nDomda": 4 },
    // …rad per (horisont × klass) ur rapporttabellen; null där n=0
  ],
  "genererad": "<läsdatum ISO>",
  "disclaimer": "Öppet kvitto om det förflutna — aldrig garanti om framtiden. Inte investeringsrådgivning (lagen 2007:528).",
  "metodUrl": "/transparens"
}
```
När v2-räknare finns: nytt fält `protokollAktiv: 2` + `rullandeV2` med samma
form; v1-talet kvarstår märkt som historik. KÄLLVAL (våg 87 väljer, rekommendation
först): **(a) REKOMMENDERAT** — cron `api/cron/vagvalidering` skriver även
`data/rapporter/vagvalidering-SENASTE.json` (spegling av sammanställningen;
~15 rader ändring i befintlig cron, rapport-MD är byte-identisk ändå);
**(b)** strikt parser av `vagvalidering-SENASTE.md` (deterministisk generator
gör det möjligt, men skört vid protokollversion-byte).

### 3.3 `GET /api/data/utbildningsstatistik`
```json
{ "schema": "ak1a-utbildningsstatistik/1",
  "kurser": 333, "quiz": 8211, "quizXp": 82110, "bokmaster": 103,
  "kanonBocker": 102, "kanonSomKurs": 96, "fas2Kurser": 18, "fas3Kurser": 24,
  "uppdaterad": "2026-09-03",
  "kalla": "public/deep-courses.json + data/bokkanon.json + src/lib/kurs-access.ts — genererad av verktyg/rakna-siffror.mjs",
  "disclaimer": "Pedagogisk utbildningsstatistik — inte investeringsrådgivning (lagen 2007:528).",
  "metodUrl": "/transparens" }
```
(d.v.s. data/siffror.json-passthrough + schema/källa/disclaimer-tillägg.)

---

## 4. FILER SOM VÅG 87 BYGGER (ingen A2-beröring av src)

| Fil | Roll |
|---|---|
| `src/app/(huvud)/data/nyckeltalsguide/page.tsx` | Sida (force-static/ISR) |
| `src/app/(huvud)/data/vagstatistik/page.tsx` | Sida (ISR 1 h — följer rapportens kadens) |
| `src/app/(huvud)/data/utbildningsstatistik/page.tsx` | Sida (regenereras med siffror.json vid deploy) |
| `src/app/api/data/nyckeltalsguide/route.ts` | Endpoint: läser `bolagsunivers.json`, medianer per bransch server-side (statistik-median, n-redovisning), 1 h modulmemo |
| `src/app/api/data/vagstatistik/route.ts` | Endpoint: läser JSON-spegel (alt. MD-parse) av senaste vagvalidering |
| `src/app/api/data/utbildningsstatistik/route.ts` | Endpoint: läser `data/siffror.json` |
| `src/lib/dataset/nyckeltalsmedian.ts` (VALFRITT) | Ren aggregeringsfunktion (testbar: median + n ur universum-rader) |
| (valfri våg 87-ändring) `src/app/api/cron/vagvalidering/route.ts` | Skriv även `data/rapporter/vagvalidering-SENASTE.json` |

**Cache-kontrakt (alla tre endpoints):** `Cache-Control: public, max-age=0,
s-maxage=3600, stale-while-revalidate=86400` (llms.txt-mönstret) + modulmemo
1 h (forskningslage-mönstret). Sidorna: `revalidate = 3600`. llms.txt (A1)
lägger till de tre /data-URL:erna + kärntalen i citatsektionen.

---

## 5. ÄRLIGHET + JURIDIK (identiskt block på alla tre sidorna)

1. **Transparens-disclaimer** (sidfot + i JSON): "Källa: AK1A Research Lab.
   Pedagogisk forskning och utbildning — inte investeringsrådgivning enligt
   lagen (2007:528) om värdepappersrörelser. Du fattar egna beslut."
2. **Metod-länk:** primärt `/transparens` (§10 metodrad + 2007:528-sektion);
   sekundärt /portfolj-forskning ("Vill du förstå metoden bakom?"). På
   vagstatistik dessutom dom-protokolltexten i sin helhet på sidan.
3. **Treskiktad datering ("datamognad"):** `hamtat` (rådata: 2026-09-03) ·
   `genererad` (aggregatet beräknat) · `uppdaterad` (publicerat) + protokoll-
  -versioner. Inget tal publiceras utan datumstämpel.
4. **n-transparens:** varje median/andel bär n; saknad data redovisas som
   saknad ("osatt är information, inte fel") — aldrig dold eller som noll.
5. **Inga superlativ-garantier:** träff-% beskrivs som kvitto, aldrig som
   "högst exakthet"-löfte (STYRELSE-vag-exakthet §4:s ärlighetsrättning).

## 6. Fas-gating
Alla tre sidor + endpoints: **helt publika, 0 gating** — de är förvärvs- och
citeringsytor. Fas-gatade fält (per §1:s NEJ-rader) förekommer ALDRIG i dessa
payloads; framtida utökningar (median AKM1 per bransch) ska styltas "prenumeration"
och förses med access-koll redan vid kontraktsändring.
