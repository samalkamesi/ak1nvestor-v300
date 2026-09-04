# r6-horisontvyer — Horisontvyer (r5B) + kalkylatorreglaget (r4): aktiveringsvillkor + byggfärdig design

**Forskare:** r6 (AKM3, omgång 11) · **Datum:** 2026-09-04 · **Status:** forskning + design, BYGG EJ
**Fråga (AKM3-BESLUT §11 steg 9):** Vad kräver beslutet EXAKT för att aktivera
"VILLKORAD: horisontvyer + kalkylatorreglage" — och hur ser den färdiga designen ut?

Kort svar: **Tre mätbara villkor + en låst trippel.** (1) Prediktionsloggen måste visa att
ensemble-spåret bär information (P5-dom, tidigast 8–12 kvartal — loggen är live sedan VÅG 59
men har ännu 0 mätta rader), (2) katalysator-/kvalitativ datatackning (V16–V18) måste ha
växt, (3) distanskurvan m(0/1/2+) låses som EN dokumenterad trippel — aldrig per-horisont
fria tal. Reglaget (r4 §3.3) är INTE villkorat av samma dom — det väntar enbart på att
osäkerhetsintervallet (steg 3, byggt) rullat ut i UI; se §6.

---

## 0. Vad beslutet faktiskt säger (kodläst ur AKM3-BESLUT)

| Källa | Text | Konsekvens för denna rapport |
|---|---|---|
| §2 tabell | r5 Design B: horisontprofiler — **VILLKORAD (steg 9)**: "HEMMHORISONT-härledningen elegant MEN distanskurvan (2,0/1,25/0,5) är en fri trippel; mikro-vyn vilar på strukturellt osatta V16–V18" | Två separata problem att lösa: frihetsgraderna (lås trippeln) och datagapet (V16–V18) |
| §11 steg 9 | Acceptanskriterier: "ensemble-spåret visar information (P5-dom) OCH katalysator-/kvalitativ datatackning växt; distanskurvan låst som EN dokumenterad trippel — ALDRIG per-horisont fria tal" | Aktiveringsvillkoren ska vara MÄTBARA — se §3 |
| §9.2 | Avslagsskäl: mikro-vyn blir "ärligt men nästan alltid osatt" | Vyn får INTE aktiveras som rankinggrund — växlingsvy över samma poänggrund |
| §11 steg 9 bygger | `src/lib/akm3/horisontprofiler.ts` | Fil-domän definierad; inget annat får ägas |
| §12 | "AKM3-ensemble-totalen inte visar nettofördel mot AKM2-kompositen ⇒ publiceras ÖPPET … ensemblen förblir presentationsvy" | Horisontvyerna är presentationsvy FÖR ALLTID i denna version — de kan aldrig "vinna" sig en rankingroll |
| r4 §3.3 (införlivat i steg 9) | Kalkylatorns reglage "Vad händer vid full data?" — "reglaget sist, efter att vågsidans enighetsscore rullat ut" | Reglagets aktiveringsvillkor är mjukare — se §6 |

## 1. Nulägeskarta (kod, 2026-09-04 — VÅG 59 + parallellsteg byggda)

| Faktum | Var | Status |
|---|---|---|
| Ensemble byggd: raknaEnsemble, α=1/3 låst, band/median/spridning, enighetstrappa | `src/lib/akm3/ensemble.ts` + `typer.ts` | LIVE (steg 1 klart) |
| Osäkerhetsintervallet byggt (r4-formeln) | `src/lib/akm3/osakerhet.ts` | BYGGT (steg 3, parallellagent) |
| Peer byggt (r3) | `src/lib/portfolj-forskning/peer.ts` | BYGGT (steg 4) |
| Prediktionsloggen live: spår "akm3-ensemble", hash-kedjad, rad-per-månad-dedupe | `src/lib/portfolj-forskning/uppfoljning.ts` + cron + `data/portfolj-system/prediktionslogg-akm3.json` | LIVE — men 0 aktiva portföljer ⇒ 0 rader än (hederligt) |
| HEMMHORISONT för V01–V28 finns REDAN som kod-kanon | `src/lib/akm2/dynamik.ts` r 214–243 (V16–V18: mikro; V13–V15: mega; osv.) | Finns — horisontprofilerna härleds ur denna, hittas aldrig på nytt |
| ζ (HORIZONTER_VIKT): mikro 0,05 · kort 0,20 · medellång 0,25 · lång 0,30 · mega 0,20 | `src/lib/portfolj-forskning/typer.ts` (kunddirektiv: mikro lägst) | Finns — kollaps-talet i korstabellen |
| `raknaAKM2(k, { moduler, viktprofil })` med hård port + dynamiktak per körning | `src/lib/akm2/karna.ts` | Orörd — horisontprofilen är ett nytt `viktPerVariabel`-block |
| Kalkylatorn: AKM2-panel visar komposit/band/skillnad; Slider-komponent redan importerad | `src/components/ak1a/akm1-calculator.tsx` r 5, r 1090–1160 | Reglagets naturliga hemvist |
| akm3-cache + on-demand | `data/cache/akm3-{TICKER}.json` via `akm2-onsdemand.ts`-mönstret | LIVE |
| D1-datatackningen: 28,0 av 97 viktenheter alltid osatta (V02,V03,V11,V13,V15–V18,V20) | `data/rapporter/d1-datatackning-2026-09-03.md` | Villkor 2:s baseline — V16–V18 ingår i det osatta blocket |

## 2. Forskningsgrund (rå från r5 §1 — inga nya påståenden)

- Faktorpremier är horisontsberoende: value/size starkare på långa horisonter, momentum
  kort och skör ([Blanchett & Stempien 2024, CFA Institute](https://rpc.cfainstitute.org/blogs/enterprising-investor/2024/revisiting-the-factor-zoo-how-time-horizon-impacts-the-efficacy-of-investment-factors);
  [Daniel & Moskowitz 2016, JFE](https://ideas.repec.org/a/eee/jfinec/v122y2016i2p221-247.html)).
- Långsamma faktorer har årsrytm ([Fama–French 2015](https://www.sciencedirect.com/science/article/abs/pii/S0304405X14002323));
  "horisont" är en faktor i sig ([Binsbergen m.fl., NBER w21234](https://www.nber.org/system/files/working_papers/w21234/w21234.pdf)).
- Signalblending (kombinera poäng FÖRE urval) är screening-standard — horisontvyer ska vara
  växlingsvyer över samma poänggrund, inte nya motorer ([S&P DJI](https://www.spglobal.com/spdji/en/documents/research/research-the-merits-and-methods-of-multi-factor-investing.pdf)).
- Faktortiming-varning: rotera inte vikter dynamiskt i tid ([RAFI](https://www.rafi.com/research/publications/articles/828-factor-timing-keep-it-simple)) —
  en STATISK horisontetiketterad vy är segmentering, inte timing.

## 3. Aktiveringsvillkoren — preciserade till mätbara grindelement

Beslutets tre krav översatta till kodmätningsbara villkor (styrelsen öppnar grinden först när
ALLA tre är sanna — ett nytt styrelsebeslut krävs, samma form som steg 7/8):

**V1 · "Ensemble-spåret visar information (P5-dom)".** Mäts i
`data/portfolj-system/prediktionslogg-akm3.json`: (a) loggen innehåller ≥ 8 kvartalsserier
med mätt pris (P5-uppföljningens "då vs nu"-fönster är 8–12 kvartal), OCH (b) AKM3-ensemble-
spåret visar nettofördel ELLER neutralitet mot AKM2-kompositen som är STABIL över minst 3
efterföljande mätronder (medianfel ≤ AKM2:s medianfel). VIKTIGT: neutralitet räcker för att
visa "information" i presentationslagret (spridningen bär diagnostik även om totalen inte
slår AKM2) — men WORSE-fall stänger grinden permanent för vyn som ranking-kollaps (ζ får
då ALDRIG ersätta AKM3_total i korstabellen). Verifiering: cron `portfolj-uppfoljning` +
`rakna/stemplaPrediktionskedja` — inga nya verktyg behövs.

**V2 · "Katalysator-/kvalitativ datatackning växt".** Mäts mot D1-baseline (2026-09-03):
andelen av V16–V18-poängen som är SATTA i `data/cache/akm1-{TICKER}.json` över det
100-bolagsuniversum. Grind: (a) ≥ 50 % av universumet har ≥ 2 av V16–V18 satta (idag ~0 —
fälten är strukturellt osatta i datakontraktet), OCH (b) mikro-vyns datatackning
t = Σvikt_satta(V16,V17,V18,V19-mikrodel)/Σvikt_mikro ≥ 0,40 för ≥ 50 % av bolagen —
annars är mikro-fliken "ärligt nästan alltid osatt" (§9.2) och ska visas avstängd/grå
redan i designen (se §5: mikro-flikens osatt-badge).

**V3 · "Distanskurvan låst som EN dokumenterad trippel".** m(0)=2,0 · m(1)=1,25 · m(≥2)=0,5
fryses som TRE kodbokstäver i `horisontprofiler.ts` med härledningskommentar (r5 §4.2) +
test som nekar per-horisontsöverskridning (inget m värde får existera per horisont). En
ändring av trippeln = NY protokollversion (FORBUD §10.6: en ändring per version, räknare
nollställs, orsak deklareras öppet).

## 4. Design — `src/lib/akm3/horisontprofiler.ts` (byggfärdig skiss)

```ts
// ── Kontrakt (till akm3/typer.ts, additivt) ─────────────────────────────
export type HorisontProfilResultat = {
  horisont: "mikro" | "kort" | "medellang" | "lang" | "mega";
  /** AKM3_h = raknaAKM2 med viktPerVariabel = normalize(vikt_h) — 0–100. */
  komposit: number;
  /** Skillnad mot AKM3_total (ensemble-medel) — visas, väger ALDRIG. */
  skillnadMotTotal: number;
  /** Σ satt vikt / Σ vikt för horisontens primära+sekundära V — V2-mätaren. */
  datatackning: number;
  band: AKM2Band; portAktiv: boolean; modellVersion: string;
};

// ── Motor (ren funktion — inga klockor, inget slump; P1) ────────────────
const DISTANS_KURVA = { m0: 2.0, m1: 1.25, m2plus: 0.5 } as const;  // V3: LÅST trippel

export function horisontVikter(
  h: Horisont,
  basprofil: ViktProfilId          // default "akm2-2026"
): Record<string, number> {
  // bas(v) ur VIKTPROFILER; dist(v,h) ur HEMMHORISONT (import type +
  // lokal spegel-tabell, samma mönster som ZETA — r5 §5.3);
  // vikt_h(v) = bas(v) · m(dist) där sekundärhorisont match räknas som dist 1
  // → normalize (losaVikter-omfördelning av osatta ÅTERANVÄNDS orörd)
}

export function raknaHorisontprofil(
  k: BolagsNyckeltal, h: Horisont, opts?: { moduler?: ... }
): HorisontProfilResultat[]   // ett anrop → 5 horisonter, kanonisk ordning
```

- **ALDRIG ensemble-inom-varje-horisont** (15 anrop/bolag — avslaget §9.3): horisontprofilen
  körs på basprofilen `akm2-2026` ENDAST; totalen förblir ensemblens. Skillnaden mot totalen
  är då en blandning av horisont- och profileffekt — deklareras i noteringen.
- **ζ-kollaps** (korstabellens expanderbara rad): `AKM3_zeta = Σ_h ζ_h · AKM3_h` med
  kundens ζ (mikro 0,05 … mega 0,20) — visas ENDAST som extra rad, ALDRIG som ersättning
  för AKM3_total (§12: presentationsvy för alltid).
- Cache: utöka `data/cache/akm3-{TICKER}.json` additivt med `horisont?: HorisontProfilResultat[]`
  (bakåtkompatibelt; befintliga fält ändras aldrig — FORBUD §10.9).
- Tester (verktyg/-mönstret): (i) vikt_h summerar 1 per horisont; (ii) mikro-familjen ger
  V16–V18 störst andel; (iii) m-trippeln låst (test nekar m per horisont); (iv) determinism
  2× JSON-identisk; (v) mikro med allt osatt ⇒ komposit enligt kärnans regler + fält
  `datatackning` ärligt lågt (ALDRIG dolt); (vi) projektionsinvarianten orörd.

## 5. UI-design — HorisontVaxlare (färdig att bygga)

Placering: `src/components/ak1a/akm2-dashboard.tsx` (ägare av highlight-state, r5 §5) — ny
sektion SIDAN OM ProfilEnsembleVy, aldrig i stället. Renderas via `akm2-onsdemand`-mönstret
på detaljsidan (`forskningsbiblioteket/[ticker]`) + korstabellens expanderbara rad.

```
┌ AKM3 per horisont — växlingsvy (beskriver, dikterar aldrig) ────────────┐
│ [Mikro][Kort][Medellång][Lång][Mega]        ← flikar i kanonisk ordning │
│ ┌────────────────────────────────────────────────────────────────────┐  │
│ │ AKM3_kort  63 /100        Skillnad mot AKM3-total: +4              │  │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░  (stapel + osatt-andel-remsa, ProfilEnsembleVy-DNA)│  │
│ │ Band: studera · Port: av · Datatackning denna horisont: 62 %       │  │
│ │ Hemma-horisontens variabler: V01 V02 V04 V05 V11 V19 (sekundära…)  │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│ ζ-rad: "Kundens horisontvikter ger AKM3_ζ = 61 — jämförelsetal, ej     │
│         ny ranking. Mikro väger lägst enligt kundens direktiv."        │
│ Mikro-flik när V2 < grind: badge "tunn data — katalysatorvariablerna   │
│         (V16–V18) saknar underlag hos de flesta bolag" + gråning       │
└─────────────────────────────────────────────────────────────────────────┘
```

- Textregel: inga signalverb (FORBUD §10.8) — fliken BESKRIVER underlaget per horisont,
  aldrig "marknaden just nu". Aria-labels bär talen (text = informationen).
- Korstabellen (`korstabell.tsx`): `KorstabbellRad` utökas med VILLKORLIGT fält
  `akm3?.perHorisont?` — bakåtkompatibelt, visas expanderbart.
- Metodblad på /transparens: "Så härleds horisontvyerna ur HEMMHORISONT" (distanskurvan,
  ζ, varför mikro är tunn) — samma transparenskultur som regim/steg 5.

## 6. Kalkylatorreglaget (r4 §3.3 — den andra halvan av steg 9)

Skillnad i villkor: reglaget kräver INTE V1/V2 — det är ren pedagogik över REDAN beräknat
intervall (steg 3 byggt: `akm3/osakerhet.ts`). R4:s ursprungliga villkor ("reglaget sist,
efter att vågsidans enighetsscore rullat ut") är uppfyllt när osäkerhets-chippet syns i
korstabellen. **Rekommenderad aktivering: samma styrelserond som horisontvyerna, men som
egen godkännandepunkt** — reglaget kan grön-markeras tidigare om styrelsen vill.

Design (färdig att bygga i `akm1-calculator.tsx` AKM2-panel, r 1090+):

- Skjutreglage **"Vad händer vid full data?"**: fyllnadsgrad x ∈ {0…5} p per osatt variabel;
  visar `K(x) = K + 20·(1−t)·x` live; förval x=0 (dagsläget); snabbknapp "full data (x=5)"
  ⇒ K(5) = intervallets övre gräns — samma tal som osakerhet.ts redan ger (källkonsistens).
- Port-interaktion: hård port aktiv ⇒ taket visas som snedstreck-markör vid 45 och K(x)
  klipps (porten följer DATA, aldrig projektionen).
- Manuellt kalkylatorläge (`akm1Manuell` ⇒ inga osatta): reglaget AVSTÄNGT med texten
  "t = 100 % — alla variabler poängsatta av dig" (r4 §3.3 ordagrant).
- Textvigilans: reglaget dokumenteras som *pedagogisk projection*, aldrig prognos; inga
  "om du fyller i data kommer poängen att"-fraser med rådgivningskaraktär.
- AC: (i) K(x) matchar osakerhet.ts-övre vid x=5 (golden-test); (ii) determinism;
  (iii) reglage avstängt i manuellt läge (test); (iv) aria-label med spannet [K, K(x)].

## 7. Vad som ALDRIG får ske (rakt ur BESLUT §10, tillämpat)

1. Horisontvyerna ERSÄTTER aldrig AKM3_total/AKM2/AKM1 — sida vid sida (§10.9, §12).
2. ζ, horisontpoäng eller reglagevärde in i prediktionsloggen som NYTT spår UTAN eget
   beslut — loggen dömer totalen; vyerna är presentation.
3. Distanskurvan per horisont, kalibrerad på 12 tickers — frihetsgradsläckage (§9.2).
4. Signalverb kopplade till en horisontvy (§10.8).
5. Imputation av V16–V18 för att "fylla" mikro-vyn (P3: osatt = osatt).

## 8. Tre rekommendationer

1. **Bygg reglaget vid nästa byggrond — horisontvyerna först vid V1+V2+V3.** Reglaget är
   beroendefritt (osakerhet.ts finns), litet (en komponent + test) och ger den största
   pedagogiska ärlighetsvinsten per kodrad: kunden ser var totalen hamnar när det osatta
   poängsätts. Horisontvyerna väntar på mätklockan — förslaget: V1-check automatiskt i
   `portfolj-uppfoljning`-cronen (var 12:e månad skrivs en V1-statusrad i rapporten), V2
   mäts i D1-rapportens årsuppdatering.
2. **Lås trippeln och mikro-gråningen NU i designen, inte vid aktivering.** Skriv
   `horisontprofiler.ts`-skissen (§4) med DISTANS_KURVA som frusen konstant + testet som
   nekar per-horisont-tal, så att framtida byggagenter inte kan "justera" kurvan per horisont
   utan protokollversionsbrott. Mikro-flikens tunn-data-badge ingår i designen från dag ett
   — den är Produktens ärlighetssvar på §9.2 även när vyn väl aktiveras.
3. **Separera domarna i protokollet.** Reglaget (r4-spåret) och horisontvyerna (r5B-spåret)
   delar steg 9 men har olika villkor — skriv dem isär i nästa BESLUT-version så att en
   framtiren rond kan godkänna reglaget utan att låsa upp horisontvyerna (och tvärtom).

**Dom: VILLKORAT (horisontvyerna — V1+V2+V3 krävs; tidigast realistiskt 2028 enligt §12:s
8–12 kvartal). Reglaget: MOGET NU (villkorat endast på att osäkerhets-chippet rullat ut i
korstabellen — verifieras mot steg 3:s byggstatus).**

---
*Källor: se §2 + r5 §1 (WebSearch-länkarna där) · data/forskning/AKM3/AKM3-BESLUT.md (§2, §9.2,
§10, §11 steg 9, §12) · r4-osakerhet §3.3 · r5-ensemble §4–§5 · src/lib/akm2/dynamik.ts
(HEMMORISONT r 214–243) · src/lib/akm3/{typer,ensemble,osakerhet}.ts · src/lib/portfolj-forskning/
{typer,uppfoljning,peer}.ts · src/components/ak1a/{akm1-calculator,akm2-dashboard}.tsx ·
data/rapporter/d1-datatackning-2026-09-03.md · worklog VÅG 59. Pedagogisk forskning — ALDRIG
investeringsråd (lagen 2007:528).*
