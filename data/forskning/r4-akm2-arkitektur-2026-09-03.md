# R4 — AKM2-ARKITEKTUREN: "AK-Model 2" — från statisk poängmodell till dynamisk analyshelhet

**Forskare:** R4 (chefsarkitekt) · **Datum:** 2026-09-03 · **Status:** Arkitekturförslag awaiting R1/R2/R3
**Kundfråga:** *"Om vi ska skapa nästa nivå — vad ska AKM1 förvandlas till, AKM2?"*
**Kundägarens namngivningsbeslut:** modellen heter **AK-Model 1** men förkortas **AKM1** → nästa nivå heter
**AK-Model 2**, förkortning **AKM2**.

**Leveranskännetecken:** Detta dokument definierar PLATSERNA (struktur, gränssnitt, namn, filvägar)
där R1 (nya nyckeltal), R2 (vikter) och R3 (våg-matching) stoppar in sina resultat. Det förutsätter
INTE deras exakta innehåll — alla tre slotarna har neutrala defaultvärden som gör att AKM2 utan
forskningsinput degraderar elegant till exakt AKM1. Systembygge sker först i fas R2 (enligt
PROTOKOLL.md) — detta dokument rörs inte av pågående P1–P4-byggagenter.

---

## 0. Sammanfattning (SIDAN)

**AKM2 är inte en ersättare till AKM1 — det är en skalär runt den.** AKM1 (20 variabler, 0–5,
max 100) förblir den pedagogiska kärnan och det publika kontraktet. AKM2 är en sexlagers
helhet som (a) räknar AKM1 oförändrat i botten, (b) lägger till branschmoduler med nya
variabler (V21+, max 10), (c) modulerar poängen med fundamental/teknisk vågdynamik bakom en
konfluens-gate, (d) omviktas av statiska och bransch-adaptiva viktprofiler, och (e) syntetiserar
en AKM2-komposit (0–100) där varje poäng kan förklaras i kurs-termer.

**Den viktigaste designregeln — Projektionsinvarianten:**

> För ALLTID och för ALLA indata gäller: `projiceraAKM1(raknaAKM2(k, {moduler: [], viktprofil: "akm1-klassisk"}))`
> är **byte-identisk** med `raknaAKM1(k)` — samma variabelpoäng, samma total, samma motivering.
> AKM1 är en *projektion/avläsning* av AKM2, aldrig ett fristående system.

Detta gör bakåtkompatibiliteten matematisk i stället för önskad: kalkylatorn, de 8 211
quizfrågorna, kurserna, XP-systemet och portföljforskningens `AKM1Bedomning` kan aldrig brytas,
eftersom AKM2:s kärnlager _är_ deras beräkning.

---

## 1. Identitet & namngivning — modellfamiljen

### 1.1 Kanoniska namn (obrytbara)

| Namn | Fullständigt | Roll | Status |
|---|---|---|---|
| **AKM1** | AK-Model 1 | Kärnan: 20 V (V01–V20), 0–5 p, max 100. Pedagogisk grund. | Behålls i utbildningen (Fas 1, gratis) **och** som "lägesläge" av AKM2 |
| **AKM2** | AK-Model 2 | Den dynamiska helheten: AKM1-kärna + moduler + dynamik + vikter + syntes | Ny |
| **AK1TS** | (oförändrat) | Teknisk partner: 5 teorier × 5 horisonter × 4 dimensioner = 100 datapunkter | Oförändrad — AKM2 konsument, ej ägare |
| **Vågfundamentet** | (P2-motorn) | Fundamental vågdetektion per variabel × horisont | Oförändrad — levererar till AKM2 lager 3 |
| **Konfluensmotorn** | (befintlig) | "Värde garanterat före vågorna", 5 dimensioner | Oförändrad — gate-leverantör till lager 3 |
| **Portföljforskningen** | P1–P9 | Prenumerationsprodukten | Konsument av AKM2-kompositen |

### 1.2 Identitetsprincipen: AKM1 = en avläsning av AKM2

Metaforen är fysikens: samma verklighet, två mätinstrument. AKM2 är den fulla
tillståndsbeskrivningen (fundament + moduler + vågläge + viktprofil); AKM1 är den klassiska
**avläsningen** — som en vågkod som alltid kan dekompileras fram ur helheten. Konsekvenser:

1. `AKM1Bedomning` (i `src/lib/portfolj-forskning/typer.ts`) är och förblir det publika
   delresultatet — AKM2-resultatet bär det som fältet `lager1` (se §5).
2. Kalkylatorns två lägen heter **"AKM1-läge"** (default, alltid tillgängligt, gratis) och
   **"AKM2-läge"** (gated, se §6). AKM1-läget är bokstavligen en projicering av samma
   beräkning — inte en kopia av gammal kod.
3. I all text, all UI, alla kurser: modellfamiljen heter **AK-Model 1 / AK-Model 2**,
   förkortat AKM1/AKM2. Aldrig "AKM v2", "AKM1+", "AK-Model2".

### 1.3 Termlista (ny kanonisk terminologi)

| Term | Betydelse |
|---|---|
| **AKM2-komposit** | Syntespoängen 0–100 från lager 5 |
| **AKM1-skugga** | Den alltid medföljande projicerade AKM1-poängen i varje AKM2-resultat |
| **Modul** | Fristående variabelpaket (V21+) för en bransch/fenomen — t.ex. SaaS-modulen |
| **Viktprofil** | Namngiven viktsamling (statisk eller bransch-adaptiv) i lager 4 |
| **Vågfas-modulering** | Lager 3:s justering av variabelpoäng efter vågklass + horisont |
| **Konfluens-gate (port)** | Öppnen/sluten/osatt — modulering får bara verka när ≥3 av 5 teorier pekar samma håll |
| **AKM2-läge** | Kalkylatorns utökade visning (gated per Fas) |
| **Prediktionsloggen** | Append-only journal där AKM2:s bedömningar döms av verkligheten (se §8) |
| **Modellversion** | Semantisk version ("AKM2.2026.11") — varje resultat och loggpost bär den |

---

## 2. Designkonstitutionen — de tio reglerna

Dessa regler är arkitekturens lag. Varje implementeringsbeslut i fas R2 testas mot dem.

1. **Projektionsinvarianten** (se §0) — AKM1 är alltid en projicering av AKM2. Bryt den aldrig.
2. **Oförändrad pedagogik i lagret under** — lager 1 rör ALDRIG AKM1:s variabeldefinitioner,
   trösklar, 0–5-skala eller summa-100. Nya variabler tillhör lager 2 och börjar på V21.
3. **Modulärt, inte monolitiskt** — utökningar aktiveras per bransch/analys, var för sig.
   Målbild ≤ 10 nya variabler TOTALT (kunddirektiv), fördelade över moduler.
4. **Neutrala defaults** — varje forskningsslot (R1/R2/R3) har ett identitets-default:
   `moduler = []`, `viktprofil = "akm1-klassisk"`, `justering = 0`. AKM2 utan forskningsinput
   = AKM1. Arkitekturen är landbar DAG 1.
5. **Dynamiken nyanserar, konsumerar aldrig** — vågmoduleringen är bunden (±1 poäng per
   variabel, sammanlagt tak ±10 kompositpoäng) och gate:ad. Fundamental bild kan aldrig
   vändas av teknisk vågläsning.
6. **"Osatt" är ett hedervärt svar** (P2-arvet) — motorn gissar aldrig. Osäkerhet propageras
   upp och syns i resultatet (`osakerhet`), den fejkas inte bort.
7. **Determinism** — samma indata → samma utdata, ingen klocka, inget slumpmoment i
   poängsättningen. Server-side only där vikter/hemlig know-how ingår (konfluens-motorns
   P8-precedent).
8. **Varje poäng förklarbar i kurs-termer** — varje bidrag till kompositen ska kunna peka på
   en kurs/kapitel (V:s slug) och en motivering. `forklaraPoang` är förstaklassmedborgare,
   inte eftertanke.
9. **Append-only mot existerande data** — quiz (8 211 frågor V01–V20), XP, badges, kurser:
   nya läggs till, existerande ändras aldrig/ tas aldrig bort.
10. **Pedagogisk finansanalys — ALDRIG rådgivning** (lagen 2007:528). AKM2-läget använder
    superanalysens pedagogiska band ("Studera vidare / Skjut inte / Aktör att följa");
    kalkylatorns AKM1-läge behåller sina historiska band oförändrade (se §8.3).

---

## 3. Lagerarkitekturen (0–5)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAGER 5 — SYNTES & RAPPORT                                                 │
│  AKM2-komposit 0–100 · AKM1-skugga · då-vs-nu-spår · forklaraPoang          │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAGER 4 — VIKT-MOTORN                                                      │
│  Viktprofiler: "akm1-klassisk" (låst) + statiska + bransch-adaptiva  [R2]   │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAGER 3 — DYNAMIKMODULEN                                                   │
│  Vågfas-modulering (±1 p, tak ±10) · AK1TS-koppling · konfluens-gate  [R3]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAGER 2 — UTÖKNINGSMODULER "AKM2-plus"                                     │
│  V21+ per branschmodul (SaaS, bank, gruvor, …) — var för sig aktiverbara [R1]│
├─────────────────────────────────────────────────────────────────────────────┤
│  LAGER 1 — KÄRNMODUL "AKM1-kärnan"                                          │
│  20 V, 0–5, klassisk poäng — OFÖRÄNRAD PEDAGOGIK (publika kontraktet)       │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAGER 0 — DATAFUNDAMENT                                                    │
│  BolagsNyckeltal (P1:s datakontrakt) + serier + FVagAnalys + TVagStatus     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### LAGER 0 — Datafundamentet

- **Ansvar:** leverera sanningen om bolaget. Inget åsiktslager.
- **Kontrakt:** `BolagsNyckeltal` (P1-agentens datakontrakt i
  `src/lib/portfolj-forskning/typer.ts`) — inklusive `serier` (5-åriga tidsserier för
  vågdetektion), `stabilitet.kassaManaderBurnRate`, `aterkop`, `golv`. Vidare:
  `FVagAnalys` (från P2/vågfundament-motorn) och `TVagStatus` (från analys-motorn, AK1TS).
- **Föreslagen fil:** `src/lib/akm2/lager0-fundament.ts` — tunn adapter som validerar och
  normaliserar (t.ex. saknad seriedata → horisonten markeras `osatt`, aldrig gissad).
- **Regel:** AKM2 hämtar ALDRIG data själv — den konsumerar P1:s cache
  (`data/cache/fundamental-{T}.json`) och P2/P3:s produkter. Dubbelkällor (`kallor`,
  minst 2 oberoende) följer med hela vägen upp till förklaringen.

### LAGER 1 — Kärnmodulen "AKM1-kärnan"

- **Ansvar:** räkna AKM1 exakt som idag: V01–V20, 0–5, total = Σ poäng (max 100), med
  motivering per variabel (reproducerbarhet).
- **Kontrakt:** `AKM1Bedomning` — oförändrad typ ur portfolj-forskning/typer.ts.
- **Föreslagen fil:** `src/lib/akm2/lager1-karna.ts` med den kanoniska funktionen
  `raknaAKM1(k)`. P6:s AKM1-bedömare (Python/TS, `data/portfolj-system/akm1-{T}.json`)
  blir konsument/producent-partner: samma logik, en sanning.
- **Obs — tre vikttaxonomier finns redan i kodbasen** och AKM2 deklarerar dem öppet i stället
  för att dölja dem (se §7.5 Risker):
  1. **Kalkylatorn** (`akm1-calculator.tsx`): enkel summa, "KRITISK" är pedagogisk etikett.
  2. **Superanalysen** (`superanalys.ts`): kategorivikter 15/20/20/15/15/5/10 %.
  3. **PROTOKOLL.md:s vikttabell** (utgångsläge för R2).
  AKM2:s **publika AKM1-kontrakt = kalkylatorsumman** (den eleven ser). Superanalysens
  kategorivikter blir en viktprofil "superanalys-2026" i lager 4. Ingenting skrivs om.

### LAGER 2 — Utökningsmodulerna "AKM2-plus"

- **Ansvar:** R1:s nya variabler (V21+, målbild ≤ 10 stycken) som **avgränsade
  branschmoduler** — SaaS-modulen, bankmodulen, gruvmodulen osv. En modul = ett paket av
  2–5 variabler + aktiveringsregel + källtillägg.
- **Kontrakt:** `AKM2Modul`, `ModulAktivering`, `ModulVariabel` (se §5). Variabel-ID:n är
  globalt unika över alla moduler (modulregistret validerar kollisioner, t.ex. V21 får bara
  finnas i EN modul).
- **Föreslagna filer:** `src/lib/akm2/lager2-moduler.ts` (registret) +
  `src/lib/akm2/moduler/{modul-id}.ts` per modul (t.ex. `moduler/saas.ts`,
  `moduler/bank.ts`). Varje modulfil bär sin forskningskälla (länk till R1:s rapport).
- **Aktivering:** per analys — antingen automatiskt via branschmatchning
  (`modul.branscher` inkluderar bolagets `Bransch`) eller manuellt i kalkylatorns
  AKM2-läge. En analys kan köra noll, en eller flera moduler.
- **Regel:** en modul får ALDRIG ändra en V01–V20-variabels poäng — bara lägga till.

### LAGER 3 — Dynamikmodulen

- **Ansvar:** kundens kärbeslut — *"AKM1 ska analyseras med hjälp av Vågor och AK1TS;
  fundamentalanalys är inte statisk, alla indikatorer rör sig dynamiskt."* Lagret
  modulerar varje variabels poäng med vågfas + horisont + konfluens.
- **Kontrakt:** `DynamikLagerSvar` med `perVariabel: Record<Vxx, DynamikJustering>` där
  `justering ∈ [−1, +1]` (kontinuerlig, avrundas deterministiskt), `riktning: Dynamik`
  (befintlig typ: `forbattras|stabilt|forsvamras|osatt`), `port: KonfluensPort`.
- **Konfluens-gaten:** modulering får ENDAST verka när port = `oppen` — dvs minst 3 av 5
  teorier pekar samma håll (ekosystemets konfluensprincip). `sluten` eller `osatt` ⇒
  `justering = 0` och AKM2 degraderar till AKM1 för den variabeln. Detta är
  säkerhetsventilen som hindrar teknisk analys från att köra över fundamentet.
- **AK1TS-koppling:** lagret konsumerar `TVagStatus.perHorisont` (teknisk vågklass per
  horisont) och `FVagAnalys.perVariabel` (fundamental vågstatus). Horisontviktningen
  styrs av `HORIZONTER_VIKT` (mikro 0.05 … lång 0.30, mega 0.20) — överridbar med
  `horisontprofiler`-parametern (t.ex. riskprofilens egna vikter ur `RiskProfil`).
- **Föreslagen fil:** `src/lib/akm2/lager3-dynamik.ts`. **[SLOT R3]** — matchningsreglerna
  (vågklass × horisont → justering) definieras av R3, se §9.3.
- **Regler:** moduleringen är **unktional, inte additiv-kvantitativ**: den flyttar en
  variabel högst ±1 steg (0–5-skalan respekteras via clamp), total kompositpåverkan takas
  till ±10 p (skalning ner proportionerligt om taket slås an).

### LAGER 4 — VIKT-motorn

- **Ansvar:** R2:s fråga — *"Har AKM1 rätt viktfördelning?"* — som en motor av namngivna
  **viktprofiler** i stället för en enda sanning.
- **Kontrakt:** `ViktProfil` (se §5) med `viktPerVariabel: Record<Vxx, number>` (normaliseras
  internt till summa 1 över aktiva variabler) och ev. `branschAdaptiv` (en viktsamling per
  `Bransch`).
- **Låst profil:** `"akm1-klassisk"` — uniform vikt över V01–V20, exakt kalkylatorsumman.
  `las: true`. Den profilen är projektionsinvariantens garant och får ALDRIG redigeras.
- **Föreslagna profiler från dag ett:** `"akm1-klassisk"` (låst), `"superanalys-2026"`
  (superanalysens kategorivikter), därefter R2:s statiska och bransch-adaptiva profiler
  **[SLOT R2]**, se §9.2.
- **Föreslagen fil:** `src/lib/akm2/lager4-vikter.ts`. Vikter som är AK1A-hemlig know-how
  hålls server-side (konfluens-motorns P8-precedent); publika profiler kan ligga i paketet.

### LAGER 5 — Syntes & rapport

- **Ansvar:** slå ihop allt till `AKM2Resultat`: kompositpoäng 0–100, per-kategori,
  AKM1-skugga, då-vs-nu-spår, pedagogisk förklaring.
- **Formel (deklarerad före resultat — metoden styr, aldrig tvärtom):**

  ```
  p̂(v)  = clamp( p(v) + δ(v),  0, 5 )        // p = lager1+2-poäng, δ = lager3 (0 om port ≠ oppen)
  w      = normalisera( viktprofilens vikter över AKTIVA variabler )
  K      = 20 · Σ_v w(v) · p̂(v)               // 0–100
  K      = clamp( K,  K_utanDynamik − 10,  K_utanDynamik + 10 )   // dynamiktak
  komposit = round( K )                        // deterministisk avrundning
  ```

  **Reducering:** med `moduler = []`, `viktprofil = "akm1-klassisk"` (w = 1/20 per variabel)
  och δ = 0 blir `komposit = Σ p(v)` = AKM1-totalen. Exakt. Invarianten håller matematiskt.
- **Band (pedagogiska, ärver superanalysen):** komposit ≥ 75 → "Aktör att följa";
  ≥ 45 → "Studera vidare"; < 45 → "Skjut inte"; hög osäkerhet (t.ex. `andelOsatta > 0,5`
  eller samtliga portar `osatt`) → "Osatt". Aldrig köp/sälj i AKM2-läget.
- **Då-vs-nu-spår:** varje resultat bär `spar: DaNuSpar[]` (datum, komposit, akm1, notis) —
  samma anda som P5:s `UppfoljningSnapshot`, och P5:s snapshot typ utökas additivt med
  `akm2Totalt?`, `kompositBand?`, `modellVersion?` (frivilliga fält, bakåtkompatibelt).
- **forklaraPoang:** förklaringsmotorn — se §5. Varje rad pekar på variabelns kurs-slug
  (V01–V20 har kurser idag; V21+ får mikro-lektioner i migrationssteg 4).
- **Föreslagen fil:** `src/lib/akm2/lager5-syntes.ts` + `src/lib/akm2/forklaring.ts`.

---

## 4. Beräkningsflödet (pipeline)

```
BolagsNyckeltal (P1-cache)
  │
  ├─► LAGER 1  raknaAKM1 ──► AKM1Bedomning ──────────────────────────┐
  │      (P2 FVagAnalys, TVagStatus går PARALLELLT in i lager 3)     │
  ├─► LAGER 2  aktiva moduler ──► ModulPoäng (V21+)                  │
  ├─► LAGER 3  vågmatchning + gate ──► DynamikLagerSvar (δ per V)    │
  ├─► LAGER 4  viktprofil (+ bransch) ──► normaliserade vikter       │
  ▼                                                                  │
LAGER 5  syntes ◄────────────────────────────────────────────────────┘
  │
  ├─► AKM2Resultat { komposit, band, perKategori, AKM1-skugga, spår, osäkerhet, version }
  ├─► projiceraAKM1(akm2) ──► AKM1Bedomning  (=== lager1, alltid)
  └─► forklaraPoang(akm2)  ──► pedagogisk text + kurslänkar + källor
```

Felfall (arv från konfluens-motorn): en källas fel dödar aldrig raden — dimensionen blir
`osatt`/null och `osakerhet.andelOsatta` stiger. Bolag utan serier → lagret 3 svarar
`osatt` överallt → komposit = AKM1-skuggan. **Degradering är alltid downward-mot-AKM1,
aldrig mot gissning.**

---

## 5. Gränssnitt — TS-signaturer (namn exakta)

Föreslagen ny fil: `src/lib/akm2/typer.ts` + `src/lib/akm2/index.ts`. Ärver och återanvänder
`src/lib/portfolj-forskning/typer.ts` (Horisont, VagKlass, Dynamik, Bransch,
BolagsNyckeltal, AKM1Bedomning, FVagAnalys, TVagStatus, HORIZONTER_VIKT). JSON-nycklar utan
åäö — samma konvention som typkontraktet.

```ts
/**
 * AKM2 — "AK-Model 2" — TYPKONTRAKT.
 * Ärver src/lib/portfolj-forskning/typer.ts. JSON-nycklar utan åäö.
 * Projektionsinvarianten: projiceraAKM1(raknaAKM2(k, minimal)) === raknaAKM1(k).
 */

// ── Lager 2: utökningsmoduler ────────────────────────────────────────────────

export type AKM2ModulId = string; // t.ex. "saas" | "bank" | "gruvor" | "kvalitet"

export type ModulVariabel = {
  id: string;            // "V21"… globalt unika över alla moduler (registret validerar)
  namn: string;
  kategori: string;      // följer AKM1:s kategorier (eller ny, deklarerad av modulen)
  formel: string;
  trosklar: { t1: string; t3: string; t5: string }; // pedagogiska trösklar som V01–V20
  kursSlug?: string;     // mikro-lektion (fylls i migrationssteg 4), t.ex. "v21-net-retention"
  kalla: string;         // var i årsredovisningen/börsdatan siffran finns
};

export type AKM2Modul = {
  id: AKM2ModulId;
  namn: string;
  beskrivning: string;
  branscher: Bransch[];  // var modulen är relevant (aktiveringsgrund)
  variabler: ModulVariabel[];
  forskningsKalla: string; // länk till R1-rapporten (reproducerbarhet)
  version: string;
};

export type ModulAktivering = {
  modulId: AKM2ModulId;
  aktiv: boolean;
  automatisk?: boolean;  // true om branschmatchning triggade, false om användarval
  orsak?: string;        // varför — pedagogisk spårbarhet
};

// ── Lager 3: dynamik ─────────────────────────────────────────────────────────

export type KonfluensPort = "oppen" | "sluten" | "osatt"; // ≥3 av 5 teorier => "oppen"

export type DynamikJustering = {
  variabel: string;      // "V01"…"V30"
  riktning: Dynamik;     // forbattras | stabilt | forsvamras | osatt (befintlig typ)
  justering: number;     // −1 … +1  (0 när port ≠ "oppen")  [SLOT R3]
  port: KonfluensPort;
  motivering: string;    // varför — källa till slutsatsen
};

export type DynamikLagerSvar = {
  ticker: string;
  perVariabel: Record<string, DynamikJustering>;
  perHorisont: Record<Horisont, VagKlass>;          // fundamental våg (ur FVagAnalys)
  tekniskPerHorisont?: Record<Horisont, VagKlass>;  // AK1TS (ur TVagStatus)
  konfluens: {
    raknadeTeorier: number;   // av 5
    sammaRiktning: number;    // t.ex. 4 => port "oppen"
    port: KonfluensPort;
    text: string;             // "4 av 5 teorier pekar uppåt"
  };
  horisontVikter: Record<Horisont, number>; // vilka vikter som faktiskt användes
  datum: string;
};

// ── Lager 4: vikter ──────────────────────────────────────────────────────────

export type ViktProfilId = "akm1-klassisk" | (string & {}); // "akm1-klassisk" är reserverad+låst

export type ViktProfil = {
  id: ViktProfilId;
  namn: string;
  beskrivning: string;
  forskningsKalla: string; // länk till R2-rapporten + litteratur
  /** Vxx → råvikt; normaliseras internt till summa 1 över AKTIVA variabler. */
  viktPerVariabel: Record<string, number>;
  /** Bransch-adaptiv variant: per bransch en egen viktsamling. [SLOT R2] */
  branschAdaptiv?: Partial<Record<Bransch, Record<string, number>>>;
  las?: boolean;           // true för "akm1-klassisk" — ALDRIG redigerbar
  serverSide?: boolean;    // true = hemlig know-how, exponeras ej till klienten
};

/** Overrid av HORIZONTER_VIKT för en analys (t.ex. RiskProfilens egna vikter). */
export type Horisontprofiler = Partial<Record<Horisont, number>>; // normaliseras till summa 1

// ── Lager 5: syntes & rapport ────────────────────────────────────────────────

export type AKM2Band = "aktor" | "studera" | "skjut" | "osatt";
// Ärv etiketter/texter från superanalys.ts bedomning() — en källa till sanning.

export type DaNuSpar = {
  datum: string;        // ISO
  komposit: number;
  akm1: number;         // AKM1-skuggan samma datum — alltid jämförbar
  notis?: string;       // när något väsentligt förändrats
};

export type AKM2Resultat = {
  ticker: string;
  namn: string;
  bransch: Bransch;
  datum: string;                // ISO
  modellVersion: string;        // t.ex. "AKM2.2026.11" — följer med i prediktionsloggen

  lager1: AKM1Bedomning;        // OFÖRÄNRAD AKM1 — projektionsgarantin (ALDRIG påverkad av 2–4)
  lager2: {
    aktiveradeModuler: ModulAktivering[];
    poang: Record<string, number>;   // V21+ → 0–5 (tomt om inga moduler)
    notering?: string;
  };
  lager3: DynamikLagerSvar;
  lager4: {
    viktprofil: ViktProfilId;
    viktPerVariabel: Record<string, number>; // de NORMALISERADE vikter som användes
    bransch?: Bransch;                       // om bransch-adaptiv profil lösts ut
  };

  komposit: number;                   // 0–100 (formeln i §3, lager 5)
  perKategori: Record<string, number>;
  band: AKM2Band;                     // pedagogiskt band — aldrig köp/sälj
  projiceradAKM1: AKM1Bedomning;      // SKA vara === lager1 (golden test vaktar)

  spar: DaNuSpar[];                   // då-vs-nu (senaste först)
  osakerhet: { andelOsatta: number; andelarKallor: number; note: string };
};

// ── Förklaringen (förstaklassmedborgare) ─────────────────────────────────────

export type ForklaringsRad = {
  variabel: string;          // "V07"
  namn: string;              // "Bruttomarginal"
  poang: number;             // rå poäng 0–5
  effektivPoang: number;     // efter dynamik (p̂)
  vikt: number;              // normaliserad
  bidrag: number;            // vikt × p̂ × 20 = poäng i kompositen
  text: string;              // varför — i kurs-termer, med siffror från nyckeltalen
  kursSlug?: string;         // t.ex. "v07-bruttomarginal" (V21+ i steg 4)
  kalla?: string;            // årsredovisningsplats (V:s "var hittar jag siffrorna?")
};

export type Forklaring = {
  rubrik: string;            // t.ex. "Varför 72/100 — de fem tyngsta skälen"
  sammanfattning: string;    // 2–3 meningar, pedagogiska, dömer aldrig
  rader: ForklaringsRad[];   // sorterade efter |bidrag|
  dynamikText: string;       // vad vågorna/gaten gjorde, i klartext
  modulText: string;         // vilka moduler som var aktiva och varför
  varningar: string[];       // osatta andelar, sluten port, takad modulering osv.
  kallor: string[];          // R1/R2/R3-rapporter + bolagskällor + litteratur
};

// ── Det publika API:et (index.ts) ────────────────────────────────────────────

/** Klassisk AKM1 — kanonisk implementering (publika kontraktet). */
export function raknaAKM1(k: BolagsNyckeltal, manuellaPoang?: AKM1Poang): AKM1Bedomning;

/** Fullständig AKM2. Neutrala defaults => identiskt med raknaAKM1. */
export function raknaAKM2(
  k: BolagsNyckeltal,
  opts: {
    moduler: ModulAktivering[];              // [] = inga moduler
    viktprofil: ViktProfilId | ViktProfil;   // "akm1-klassisk" = AKM1-summan
    horisontprofiler?: Horisontprofiler;     // override av HORIZONTER_VIKT
    fvag?: FVagAnalys;                       // från vågfundamentet (P2)
    tvag?: TVagStatus;                       // från analys-motorn (AK1TS)
    akm1Manuell?: AKM1Bedomning;             // kalkylator-läge: människans poäng respekteras
    modellVersion?: string;
  },
): AKM2Resultat;

/** Projektion/avläsning — returnerar ALLTID lager1, byte-identisk med raknaAKM1. */
export function projiceraAKM1(akm2: AKM2Resultat): AKM1Bedomning;

/** Pedagogisk förklaring av varje poäng — länkar till kurser/kapitel. */
export function forklaraPoang(
  akm2: AKM2Resultat,
  k?: BolagsNyckeltal,
  opts?: { niva?: "nyborjare" | "avancerad"; maxRader?: number },
): Forklaring;
```

**Namnregler:** funktioner `rakna…`, `projicera…`, `forklara…` (verb i imperativ utan åäö i
identifierare där tekniskt nödvändigt — `forklaraPoang` i stället för `förklaraPoäng` för
ASCII-säkerhet i filnamn/imports; UI-text använder full svensk ortografi "Förklara poängen").
Typer i PascalCase med ÅÄÖ tillåtna i typnamn men ALDRIG i serialiserade JSON-nycklar.

---

## 6. Utbildningsintegration

### 6.1 Fas-modellen och AKM2:s synlighet

| Fas | Pris/innehåll | AKM2-synlighet | Motivering från kurs-access.ts |
|---|---|---|---|
| **Fas 1** (gratis, för alltid) | Hela grundbiblioteket, V01–V20 | Kalkylatorn i **AKM1-läge** (default och alltid). En diskret "Nivå 2 av modellen"-chipp med pedagogisk låstext — en *inbjudan vidare, aldrig ett stopp* (pedagogik.ts). Inga AKM2-data. | Gratislagret ska lära ut fundamentalt hantverk — modellen i sin klassiska form |
| **Fas 2** (9 999 kr, 18 fundamentala kurser) | Avancerad fundamental analys + chansen att bli AK1nvestor-representant | **AKM2 fundamental:** lager 0+1+2+4+5 i kalkylatorns AKM2-läge — moduler, viktprofiler, komposit, förklaring. **Lager 3 visas som låst "Fas 3-fält"** (gråat vågkort: "vågorna aktiveras i Fas 3"). | Fas 2 = "INGEN teknisk analys, INGA vågor, INGET ekosystem — det är Fas 3" |
| **Fas 3** (13 999 kr, supermängd) | Det dynamiska ekosystemet + "rätt till alla framtida utvecklingar" | **AKM2-full:** alla sex lager inklusive vågfas-modulering, AK1TS-koppling, konfluens-gate, då-vs-nu-spår, alla framtida moduler utan extra kostnad | Direkt löfte i kurs-access.ts |
| **Prenumeration** (portföljforskningen, 20 % rabatt Fas 2/3) | P1–P9-systemet | Konsumerar AKM2-kompositen i riskportföljen (se 6.3) | Forskningsprodukt ≠ utbildning |

### 6.2 Fas 2-representanten — rekommendation

Kundägarens fråga "får Fas 2-representanten AKM2-full?" — **Rekommendation: ja, som
LÄSARE i portföljforskningen.** Representanten för AK1nvestor får full visningsåtkomst till
AKM2-resultat (inklusive lager 3) i `/portfolj-forskning`-ytan, eftersom representantens roll
är att kunna föra ekosystemets talan utåt — men kalkylatorns AKM2-läge följer fas-modellen
ordagrant (representanten med bara Fas 2 ser dynamiklagsret som låst i sin egen kalkylator).
Alternativet (representant = Fas 3-ekvivalent) är enklare men urholkar Fas 3:s löfte — avråds.

### 6.3 Prenumerationsportföljen (P1–P9) konsumerar AKM2

- `RiskProfil` utökas **additivt** med `minAKM2?: number` (befintlig `minAKM1` behålls och
  tolkas som golvet på AKM1-skuggan — bakåtkompatibelt).
- `InnehavForslag.motiv` skrivs ur AKM2: komposit + band + drivkrafter + vågläge.
- `KravKontroll` kan få nya kontroller: "AKM2 ≥ 65", "Konfluensport oppen", "AKM2-trend
  stigande 3 snapshot". Befintliga kontroller orörs.
- `KorstabbellRad` utökas additivt med `akm2Totalt?: number`, `akm2Band?: AKM2Band`,
  `modeller?: string[]` (vilka moduler som var aktiva) — befintliga fält orörs.
- Dataflödet (MEGA_PROJEKT §Dataflöde) får ETT nytt steg efter P6:
  `akm1-{T}.json → akm2-{T}.json (raknaAKM2 per bolag) → riskportfolj/korstabell`.

### 6.4 Gamification — AKM2 som "nivå 2 av modellen"

- **Badges (append-only i `src/lib/badges.ts` BADGER):** `akm2-nyborj` (första AKM2-analysen),
  `akm2-modulmastarn` (aktiverat alla moduler för en bransch), `akm2-forklaren` (läst 10
  förklaringar), `akm2-komposit-75` (förstaket 75+ med minst en modul aktiv),
  `akm2-prediktionsdomarn` (jämfört 5 prediktioner mot verkligheten i loggen).
- **XP-kontinuitet:** quiz XP oförändrat (+10 per rätt svar, kurs-quiz.tsx). V21+ mikro-lektioner
  ger XP i SAMMA system och SAMMA skala — ingen omprissättning, inga nivåomräkningar.
- **Progressions-narrativ:** "AKM1 är ditt förstoringsglas; AKM2 är mikroskopet" — AKM2-låset
  i Fas 1 marknadsförs som nästa nivå, aldrig som brist.

---

## 7. Migrationsplan — 4 steg, varje steg deploybart

### Steg 1 — Kärnan bakom flagga (AKM1 oförändrat publikt)

- **Bygger:** `src/lib/akm2/typer.ts`, `lager1-karna.ts` (kanonisk `raknaAKM1`),
  `lager5-syntes.ts` (minimal: komposit = AKM1-skugga), `index.ts`
  (`raknaAKM2` med neutrala defaults), API-route `src/app/api/akm2/route.ts` (server-side
  only). Flagga: `NEXT_PUBLIC_AKM2_STEG="1"` + admin-override `localStorage
  "ak1a-akm2-override"` (samma mönster som `ak1a-fas2-override`).
- **Rör INTE:** kalkylator, kurser, quiz, badges, portföljforskningens publika ytor.
- **Acceptans:** (a) golden-test: `projiceraAKM1(raknaAKM2(k, neutral))` === `raknaAKM1(k)`
  för alla fixtures (PREC, VOLCAR + P1-fixtures); (b) determinismtest (P2-principen);
  (c) quiz-regression: 8 211 frågor V01–V20 orörda; (d) tsc + build + deploy grön.

### Steg 2 — Moduler aktiverade i portföljforskningen

- **Bygger:** `lager2-moduler.ts` + `moduler/*.ts` (R1:s innehåll), `lager4-vikter.ts`
  (R2:s profiler utöver `"akm1-klassisk"`/`"superanalys-2026"`), `lager3-dynamik.ts`
  (R3:s regler). P6-extension skriver `data/portfolj-system/akm2-{T}.json` (NY fil —
  `akm1-{T}.json` orörd). Korstabellen (P4) får AKM2-kolumn additivt.
- **Acceptans:** 10 branscher × 10 bolag genomkörda; `andelOsatta` redovisad per rad;
  projektionstest fortfarande grönt mot `akm1-{T}.json`; modulregistrets kollisionsvalidering
  (V21+ unika) passerad.

### Steg 3 — Kalkylatorn får "AKM2-läge"-flik

- **Bygger:** `akm1-calculator.tsx` får en till flik (append i TabsList): "AKM2-läge",
  gated av `harFas2Access()` (fundamental del) / `harFas3Access()` (lager 3 live).
  AKM1-läget förblir default och ALLTID tillgängligt i Fas 1. AKM2-läget: modulreglage
  (V21+), viktprofilväljare, dynamiksammanfattning (Fas 3), komposit + AKM1-skugga sida
  vid sida, `forklaraPoang`-panel med kurslänkar, då-vs-nu-spår (localStorage/Supabase).
- **Acceptans:** AKM1-flikarna byte-identiska (visuellt + beräkningsmässigt); quiz/XP orörda;
  fas-gates testade (gratis ser inbjudan, Fas 2 ser fundamental, Fas 3 ser helhet).

### Steg 4 — Kurser/quiz-uppdatering (V21+ mikro-lektioner)

- **Bygger:** mikro-lektioner per ny variabel, slug-mönster `v21-{ämne}` (följer befintligt
  `v01-forsaljningstillvaxt`-mönster) med `kursSlug` ifylld i modulregistret. Quizfrågor för
  V21+ APPENDeras i `public/deep-courses.json` (en agent i taget per fil — känd serialiserings-
  risk). Badges append. Gamification enligt §6.4.
- **Acceptans:** frågor som refererar V01–V20 == 8 211 (exakt); totalfrågeantal ökar endast;
  inga befintliga fråge-ID:n ändrade/borttagna; XP-skalor oförändrade.

### 7.5 Riskregister

| Risk | Åtgärd |
|---|---|
| **Quiz-databasen (8 211 frågor refererar V01–V20)** | Append-only-lagen (designregel 9) + automatiserat regressionstest som räknar V01–V20-frågor vid varje deploy |
| **XP-kontinuitet** | Ingen omprissättning någonsin; V21+ samma +10/regel; tester på XP-summor |
| **Tre vikttaxonomier (kalkylatorsumma vs superanalys-kategorivikter vs PROTOKOLL-tabell)** | Deklareras öppet (§3 lager 1): publikt kontrakt = kalkylatorsumman i `"akm1-klassisk"`; superanalysen blir profil; R2:s tabell är forsknings-input — ingen dold omröstning |
| **Modul-ID-krock (V21 allokeras dubbelt)** | Modulregistret validerar global unikhet vid build/start; krock = halt |
| **Överfittning / modulinflation** | Kundtak ≤ 10 nya variabler; prediktionsloggen dömer (§8); varje modellversionsändring loggas med ny version |
| **Prestanda (vågdata + moduler per bolag)** | Server-side cache per (ticker, datum) — determinismen gör cachen säker |
| **Juridik (rådgivningslagen 2007:528)** | Pedagogiska band i AKM2-läget; disclaimer per yta; /transparens uppdateras med AKM2-metodblad |
| **Serialisering av deep-courses.json** | En agent i taget per fil (etablerad lärdom, MEGA_PROJEKT §Kända beslut) |

---

## 8. Forsknings-/kvalitetsloopar

### 8.1 Evidensbasen: P5-uppföljningssnapshots

P5:s `UppfoljningSnapshot` utökas additivt: `akm2Totalt?: number`, `akm2Band?: string`,
`modellVersion?: string`. Därmed blir varje snapshot en mätning av båda modellerna på samma
 verklighet — AKM1 vs AKM2 kan jämföras retroaktivt utan att någon av dem skrivs om.
Förändringsdetektorn (P5) utökas med "AKM2-delta > tröskel" som notisgrund.

### 8.2 AKM2 Prediction Log — modellen loggar, verkligheten dömer

Ny fil: `data/portfolj-system/akm2-prediction-log.json` — **append-only** med
hash-kedja (varje post bär `sha256(föregåendeHash + post)`) så att retroaktiva ändringar är
detekterbara (backtest-ärlighet).

```ts
export type AKM2Prediktion = {
  id: string;
  ticker: string;
  loggDatum: string;          // tidpunkten för bedömningen — ALDRIG retroaktivt ändrad
  modellVersion: string;
  komposit: number;
  band: AKM2Band;
  akm1Skugga: number;
  drivkrafter: string[];      // top-3 bidrag ur forklaraPoang
  port: KonfluensPort;
  hash: string;               // kedjad — integritetsbevis
  dom?: {                     // fylls vid uppföljning (P5-cadang)
    domDatum: string;
    prisforandringPct: number | null;   // pedagogisk observation, ej avkastningspåstående
    akm2Ny: number | null;
    utslag: "bekraftad" | "motsagd" | "osatt";  // fördefinierat protokoll, se nedan
  };
};
```

**Dom-protokoll (fördefinierat, skrivet INNAN första dömen):** `bekraftad` om kompositens
riktning (+/−) överensstämmer med vågklassutvecklingen och AKM2-deltats tecken överensstämmer
med prisförändringens tecken på uppföljningshorisonten; `motsagd` om båda spåren felar;
`osatt` vid brutna datakällor. Träffsäkerheten per modellversion publiceras på `/transparens` —
dåliga versioner dras tillbaka öppet. **Detta är AKM2:s självrättande loop: forskningen
publicerar sin egen bokföring.**

### 8.3 Etiska regler (utökade från ekosystemets principer)

1. **ALDRIG rådgivningsformuleringar.** AKM2-läget använder superanalysens pedagogiska band
   ("Studera vidare / Skjut inte / Aktör att följa") med dess beskrivningar. Kalkylatorns
   AKM1-läge behåller sina historiska SÄLJ–STARKT KÖP-band orörda (de är en del av det
   publika AKM1-kontraktet) — men AKM2 introducerar INGA nya köp/sälj-etiketter.
2. **Backtest-ärlighet:** bedömningar loggas när de görs (med modellversion + hash-kedja);
   historik skrivs aldrig om; misslyckade versioner dokumenteras lika tydligt som framgångar.
3. **Osäkerhet syns:** `andelOsatta`, `port: "osatt"` och varningar är alltid synliga i
   resultatet — modellen får inte se mer säker ut än den är.
4. **"Osatt" är hedervärt** (P2-arvet): en tom cell är information, inte datafel.
5. **Reproducerbarhet:** varje poäng har en källa (bolagsdata, R1/R2/R3-rapport, litteratur) —
   `forklaraPoang` levererar kedjan till eleven.

---

## 9. ÖPPNA PLATSER — exakt var R1/R2/R3:s resultat stoppas in

Alla slotar har neutrala defaults (arkitekturen landar utan dem). Integration sker i
migrationssteg 2 när rapporterna landat i `data/forskning/`.

### 9.1 R1 — nya nyckeltal → LAGER 2 (`src/lib/akm2/moduler/*.ts`)

| Plattsgrepp | Typ | Innehåll från R1 |
|---|---|---|
| `data/forskning/r1-*-2026-09-03.md` | forskningsrapport | Källa — modulfilen citerar den i `forskningsKalla` |
| `src/lib/akm2/moduler/{modul-id}.ts` → `AKM2Modul` | modulfil per branschfenomen | R1:s variabler (V21+, globalt unika), trösklar, formler, källplatser i årsredovisningen, vilka branscher (`branscher`) |
| `ModulVariabel.kursSlug` | mikro-lektion | Tomt tills steg 4 fyller den |

**Valideringsregla:** ≤ 10 nya variabler TOTALT (kundtak), 2–5 per modul, ID-kollisioner
avvisas av registret. Tröskelformat MÅSTE följa V01–V20:s pedagogiska mönster
(`trosklar: {t1, t3, t5}`) så `forklaraPoang` kan förklara dem på samma sätt.

### 9.2 R2 — vikter → LAGER 4 (`src/lib/akm2/lager4-vikter.ts`)

| Plattsgrepp | Typ | Innehåll från R2 |
|---|---|---|
| `VIKTPROFILER: ViktProfil[]` | profilarray | R2:s statiska optimalfördelning som en namngiven profil (t.ex. `"r2-optimal-2026"`) med `forskningsKalla` |
| `ViktProfil.branschAdaptiv` | `Partial<Record<Bransch, Record<Vxx, number>>>` | R2:s bransch-adaptiva viktmatrix — en viktsamling per bransch |
| `ViktProfil.viktPerVariabel` | `Record<Vxx, number>` | R2:s svar på "har AKM1 rätt viktfördelning?" — som ett valbart alternativ, inte en tyst ersättning |
| Gate-förslag (ev.) | kandidat till `KravKontroll`/band-regel | Om R2 föreslår hårda gates (t.ex. V19 ≤ 1 kan aldrig ge bandet "aktor") läggs de som deklarerade regler i lager 5 med källa |

**Valideringsregla:** `"akm1-klassisk"` förblir låst; varje profil dokumenterar sina vikter
öppet (utom `serverSide: true`-profiler som bara exponeras genom resultat). PROTOKOLL:s
vikttabell (V02 8 %, V03 6 %, …, tre KRITISKA) är R2:s utgångsläge — arkitekturen tar inte
ställning till om den är optimal.

### 9.3 R3 — våg-matching → LAGER 3 (`src/lib/akm2/lager3-dynamik.ts`)

| Plattsgrepp | Typ | Innehåll från R3 |
|---|---|---|
| `VAGMATCHNINGSREGLER: Record<VagKlass, Partial<Record<Horisont, number>>>` | matchningstabell | R3:s kärna: vågklass × horisont → `justering ∈ [−1, +1]` (viktad med `HORIZONTER_VIKT`/`horisontprofiler`) |
| `AK1TS_KOPPLING: Array<{ dimension: "Vag"\|"Pris"\|"Tid"\|"Brytpunkt"; teori: string; variabler: string[] }>` | kopplingsregister | Vilka av AK1TS 100 datapunkter som får modulera vilka V — R3:s matchningsförslag |
| `KONFLUENS_REGEL` | gatregel | R3:s tolkning av "minst 3 av 5 samma håll" → `KonfluensPort` (default ingår redan i arkitekturen) |
| `horisontprofiler`-defaults | `Horisontprofiler` | Eventuella R3-föreslagna avvikelser från `HORIZONTER_VIKT` per bransch/riskprofil |

**Valideringsregla:** `justering ∈ [−1, +1]` (registret clamprar); dynamiktak ±10
kompositpoäng förblir arkitekturens, oavsett R3:s förslag; `osatt`-indata → `justering = 0`.

---

## 10. Relation till Mega-projektet (P1–P9)

| Fas | Påverkan |
|---|---|
| P1 Datainsamling | Orörd — lager 0 konsumerar dess kontrakt. Ev. tillägg: fält som R1:s moduler behöver (nya nyckeltal i `BolagsNyckeltal` läggs TILL som valfbara fält, additivt) |
| P2 Fundamental vågmotor | Orörd — levererar `FVagAnalys` till lager 3 |
| P3 Riskportföl | Additivt: `minAKM2?`, nya `KravKontroll`-typer, motiv ur AKM2 |
| P4 Korstabell/dashboard | Additivt: AKM2-kolumn, band-chipp, modultagg |
| P5 Uppföljning | Additivt: `akm2Totalt?` i snapshots, AKM2-delta-notiser, dom-protokollet i prediktionsloggen |
| P6 AKM1-bedömare | Partner: delar `raknaAKM1`-logik; skriver även `akm2-{T}.json` (steg 2) |
| P7 Integration | Rutter + gating enligt §6; `/api/akm2` server-side |
| P8 Prenumeration | /transparens utökas med AKM2-metodblad + prediktionsstatistik |
| P9 Kvalitet | Golden-tester (projektion, determinism, quiz-regression) i testbatteriet |

---

## 11. Teoretisk förankring (urval — fullständiga källor i respektive forskarrapport)

- **Graham & Dodd (1934), *Security Analysis*** — marginal of safety som ekosystemets
  första princip (ekosystem.ts): lagret 3:s tak och gate är dess tekniska översättning.
- **Piotroski (2000), *Journal of Accounting Research*** — F-score: små, binära
  fundamentala signaler förbättrar avkastningen på värdebolag → stöd för modulära
  fundamentalvariabler (lager 2) snarare än en monolit.
- **Altman (1968), *Journal of Finance*** — Z-score: distress som sammansatt riskmått →
  stöd för riskgates runt V19 (kassatäckning).
- **Novy-Marx (2013), *Journal of Financial Economics*** — bruttomarginal som
  vinstprediktor → stöd för V07:s KRITISK-status och för att lönsamhet tål extra vikt (R2).
- **Sloan (1996), *The Accounting Review*** och **Beneish (1999)** — accruals/
  vinstmanipulation → kandidatområde för R1:s kvalitetsmodul.
- **Damodaran, *Investment Valuation*** — livscykel- och branschanpassade multiplar →
  stöd för bransch-adaptiva vikter och moduler (lager 2+4).
- **Lev & Gu (2016), *The End of Accounting*** — traditionella nyckeltal fångar inte
  immateriella tillgångar → R1:s främsta motivering för V21+.
- **Gray & Carlisle (2012), *Quantitative Value***; **Greenblatt (2006)** — bevisad
  precedens för att KOMBINERA kvalitets- och värderingsmått i en enda rangordnad poäng —
  exakt vad AKM2-kompositen gör, med pedagogisk förklarbarhet som extra krav.

---

## 12. Rekommendation till AKM2

Ranked, konkreta förslag med motivering:

1. **ANTA projektionsinvarianten som grundlag** (`projiceraAKM1 ∘ raknaAKM2 ≡ raknaAKM1`).
   Motivering: gör bakåtkompatibiliteten matematisk; skyddar kalkylator, 8 211 quizfrågor,
   XP och portföljforskning per konstruktion; låter AKM2 landas bakom flagga DAG 1 med
   neutrala defaults. *Kostnad: ingen. Nytta: allt.*
2. **BYGG de sex lagren med de exakta filplatserna i §3 och signaturerna i §5.**
   Motivering: varje lager kan deployeras och testas separat; R1/R2/R3 har definierade
   slotar med valideringsregler; determinism och server-side-hemligheter följer
   konfluens-motorns beprövade P2/P8-mönster.
3. **AKTIVERA Fas-modellen enligt §6.1** — Fas 2 = AKM2 fundamental (lager 0–2+4+5),
   Fas 3 = AKM2-full med dynamik, gratis = AKM1-läge + inbjudan. Motivering: följer
   kurs-access.ts ordagrant ("INGEN teknisk analys i Fas 2") och ger Fas 3 dess lösta
   värde ("rätt till alla framtida utvecklingar").
4. **STARTA prediktionsloggen SAMTIDIGT som steg 1** — innan modulerna ens finns.
   Motivering: varje modellversion behöver mätningar från dag ett för att kunna dömas
   ärligt; hash-kedjan är billig nu och omöjlig att återskapa retroaktivt.
5. **HÅLL kundtaket ≤ 10 nya variabler och dynamiktaket ±10 poäng.** Motivering:
   pedagogiken är produkten; en modell som ingen elev kan förklara är ingen AK1A-modell.
   Prediktionsloggen avgör vilka moduler som FÅR stanna — moduler som inte slår AKM1-
   skuggan över tid dras tillbaka öppet.
6. **UTSE Fas 2-representanten till AKM2-läsare i portföljforskningen** (ej Fas 3-
   ekvivalent). Motivering: ambassadörsrollen kräver insyn, Fas 3:s löfte kräver skillnaden.

---

*R4 — chefsarkitekt, AK1A Research Lab. Dokumentet definierar platser, inte innehåll:
R1 (nya nyckeltal) → lager 2, R2 (vikter) → lager 4, R3 (våg-matching) → lager 3.
All integration sker i fas R2 efter att forskningen landat. Pedagogisk finansanalys —
ALDRIG investeringsråd (lagen 2007:528).*
