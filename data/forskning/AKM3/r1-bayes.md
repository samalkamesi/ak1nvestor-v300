# r1-bayes — Bayesiansk kalibrering av AKM2 (AKM3-lager 4: kalibrering)

**Datum:** 2026-09-04 · **Forskaragent:** r1-bayes (AKM3) · **Status:** forskning, BYGG EJ
**Fråga:** Hur kan AKM2:s modul-/dynamiksystem LÄRA av verifierade utfall — konkret: Φ-tabellen justerad ur observerad träff?

## 0. Lägesbild — vad som redan finns (kodläst, ej gissat)

| Byggsten | Var | Status |
|---|---|---|
| Vågvaliderings-kit | `src/lib/vagvalidering.ts` + `src/app/api/cron/vagvalidering/route.ts` | **LIVE 2026-09-04** (cron 05:30, `system_events type=vagvalidering`, schema `vagvalidering/1` v1) |
| Φ-tabellen (lager 3) | `src/lib/akm2/dynamik.ts` r 93–101 | STATISK design (r3 §5.2): 1,20/1,10/1,20/1,00/0,80/0,90/1,00 |
| Viktprofiler (lager 4 i AKM2) | `src/lib/akm2/vikter.ts` | Statiska; `akm1-klassisk` `las: true` — projektionsinvariantens garant |
| Markov-priorer | `dynamik.ts` MARKOV_PRIOR (r3 §8.1) | "KALIBRIERADE priors, ej uppskattade" — sanity-prior tills egna tal finns |
| Kärnans dynamikkontrakt | `src/lib/akm2/karna.ts` r 639–711 | Φ via injicerad funktion; tak ±10; port-gate; AKM1-projektion ALDRIG påverkad |
| Prediction Log | r4 §8.2 (`data/portfolj-system/akm2-prediction-log.json`, planerad) | Hash-kedjad append-only — mönster att återanvända |
| Kundkulturen | skill `ak1a-analys`: "Bayes-disciplin" + `valideringslogg.md` (Brier, träffkvot) | Samma loop, manuell — detta projekt automatiserar den |

**Förcedent som gör kalibrering till planerad väg, inte ny idé:** r3:s roadmap punkt 2 —
snapshot-historik "för att inom ~3 år ersätta Markov-priors med ekosystemets egna
uppskattade övergångstal". AKM3-lager 4 är maskineriet som uppfyller det löftet.

**Namnnotering (ärlighet):** kunddirektivet säger "AKM3-lager 4: kalibrering", men AKM2:s
r4-arkitektur har redan lager 4 = vikter (lager 0–5). I kodregister bör modulen därför heta
`akm3/kalibrering` (versionsstämplat, utan lagernummer) — namnet "lager 4" lever kvar som
projektnamn, inte som kodidentifierare.

## 1. Kalibreringsloopen — design

### 1.1 Mätobjekt vs kalibreringsobjekt (viktig distinktion)

Kitet mäter idag **TOTAL-klassens** uthållighet per (ticker, horisont) dag 1 → dag 2.
Φ-tabellen verkar på **fas per variabel** (klass EFTER inversion + G + sekvens n) vid
**kvartals-snapshot-cadens**. Loopen behöver därför två mätningsbanor:

- **Bana A (finns):** daglig total-klass-dom → kalibrerar *protokollets trösklar* (§1.4) och
  ger snabb regimevarning.
- **Bana B (saknas, bygg i AKM3):** per-variabel-dom per snapshot enligt STYRELSE-vag-exakthet
  §3.2 fas 2 (`traffPerVariabel` + tabell `vagvalidering_dom`) → kalibrerar **Φ per fas** och
  **Markov-matriserna**. Kräver snapshot-historik (r3 väg 2) — samma lagring, två konsumenter.

### 1.2 Formelkärna — beta-binomial (rekommendation, alternativ i §1.3)

Kalibreringsbarheter: 6 faser (`osatt` är per definition fri från justering — Φ 1,00/0 bidrag
är ett **ärlighetskontrakt**, inte en parameter). Prior medelvärde q(fas) tas ur de egna
Markov-priorerna — r3 §8.2(c) ger dem redan rollen "sanity-prior när egna tal uppskattas":

```
p(fas) ~ Beta(α₀, β₀),   α₀ = m·q(fas),  β₀ = m·(1 − q(fas)),  m = 10  (priorstyrka)

q(impulsvåg_bekraftad) = 0,65   (T_trög P(imp→imp); snabb: 0,50 — se 1.5)
q(impulsvåg_obekraftad) = 0,50  (n=1 vilar på tillit, inte bevis)
q(impulsvåg_mogen)      = 0,45  (designens Daniel–Moskowitz-varning: fallande)
q(korrigering_hog_g)    = 0,46  (T_snabb P(korr→korr))
q(korrigering_lag_g)    = 0,40  (reversion snabbare under medel — Fama–French 2000)
q(basbygge)             = 0,34  (T_snabb P(bas→bas) — övergångsläge, aldrig hem)

POSTERIOR per ronde:  α = α₀ + T,  β = β₀ + M    (T = träff, M = miss; osatt döms ALDRIG)
p̂ = α/(α+β)   ·   90 %-kredibelt intervall ur Beta-kvantiler

Φ-kalibrerad(fas) = clamp( 1 + κ_fas · (2·p̂ − 1), 0,80, 1,20 )
  κ = 0,20 för bekräftad/mogen impuls och korrigering_hog_g · κ = 0,10 för obekräftad/korr_lag_g
```

**Egenskaper (varför just denna mapping):**
- p̂ = 0,50 (myntverk) → Φ = 1,00: fasen tystnar av sig själv när den saknar kant.
- "Klass X med låg träff → lägre Φ-aggressivitet" uppfylls monotont: p̂ = 0,35 → Φ = 0,91
  (bekräftad impuls med sämre än slantsingling *dämpas* i stället för att förstärkas).
- Designtabellen är specialfallet p̂ = q med full tilt: t.ex. bekräftad impuls, q = 0,65 →
  Φ = 1 + 0,20·0,30 = 1,06. Ärlig slutsats: **design-Φ 1,20 implikerar p ≈ 1,0 — det var
  aldrig en sannolikhetskalering utan en amplitud.** Kalibreringen gör amplituden sannolikhetsburen.
- Determinismen (P6) bevaras: kalibreringen körs OFFLINE av cron, fryser en versionerad
  Φ-tabell, och analyserna läser tabellen som konstant — samma indata + tabellversion → samma utdata.

**Handlingsgrind (uppdatera ≠ agera):** posteriorn uppdateras vid varje rond (billigt), men Φ
ändras endast när BOTH: (i) n_eff ≥ 20 (§2), (ii) kredibelt intervall helt på ena sidan 0,50,
(iii) rate-limit: max ±0,05 per fas och månad. Mellan grindarna rapporteras "okalibrerad
(n=7/20)" — aldrig en fejkad siffra.

### 1.3 Alternativ: enkel frekventistisk med shrinkage

`p̂_shrunk = (T + m·q)/(T + M + m)` — matematiskt samma punkt skattning som Beta-posteriorns
medelvärde; förlorar kredibla intervall och kundkulturens språk (skill ak1a-analys: "sannolikheter
uppdateras endast på fördefinierade bevis med explicita likelihoods"). **Används endast som
fallback om Beta-kvantiler inte får plats i runtime** (de behöver inte det — tabellen fryses).

### 1.4 Markov-matriserna — samma loop, Dirichlet

Per (matris, rad) ≈ rad-övergångar ~ Dirichlet(prior = 5·T_design-rad):
`T̂(imp→·) ~ Dirichlet(5·[0,50; 0,35; 0,13] + räknade övergångar)` vid varje snapshot-steg.
Detta ersätter MARKOV_PRIOR med "ekosystemets egna uppskattade övergångstal" (r3 väg 2 exakt),
matar "förväntad kvarvarande längd"-texten med tal vi själva mätt, och ger q(fas)-priorer
öppna vägen till iterativ hierarki (posteriors blir priors) — dokumenterat per protokollversion.

### 1.5 Hierarkisk poolning (nödvändigt, inte lyx)

20 celler (5 horisonter × 4 klasser) på 12 tickers fylls ojämt — första rondden bevisar det:
`korrigering n=0 överallt`, `lång n=0`. Faserna är också parets uppdelade i snabb/trög
(r3 §8.1). Struktur:

```
nivå 1  global träff per fas               (alltid rapporterad)
nivå 2  fas × {snabb, trög}                (kalibrerar när n_eff ≥ 20 per gren)
nivå 3  fas × horisont                     (endast rapportering; n når aldrig 20 i praktiken)
```

Kalibrera Φ på nivå 1, dela på nivå 2 när data bär, visa nivå 3 rått. Detta är exakt
kundens egen kultur: skill ak1a-analys degraderar teorier "som missat sin nivå två gånger" —
inte per dag, utan per episod.

## 2. Datakrav, overfitting-skydd, rollbacks

### 2.1 Det farligaste mätfelvet: dagar är inte observationer

Dagliga domar är autokorrelerade — en impulsvåg-episod varar veckor och avger 20 "träffar"
som är ≈ EN observation. **Räkna episoder, inte dagar:** en episod avgränsas av klassbyte
(osatt avgränsar också). Vidare: 12 svenska large caps rör sig makrokorrelerat — samma dags
tvärsnitt är ≈ 1–3 effektiva observationer. Konkret: `n_eff = episoder, diskonterade med
√(1/ρ̄) där ρ̄ = medelkorrelation mellan universumets momentumserier` (skatta ur vagscan-historiken;
förvänta ρ̄ ≈ 0,3–0,6 → faktor ~1,4–1,8). Beta-posteriorn matas med (T, M) **per episod**, aldrig per dag.

### 2.2 När räcker det? ( konkreta tal ur kitets första rond )

- **Bana A (protokoll/trösklar, daglig):** 48 dömda/dag → tröskel-diagnostik meningsfull inom
  ~4–8 veckor (n_eff-justerat), beslut vid n_eff ≥ 30 (STYRELSE-konvention: varning vid 45 %, n ≥ 30).
- **Bana B (Φ per fas, kvartals):** realistiskt 10–40 variabel-celler per fas och snapshot →
  **första grundliga Φ-kalibreringen efter ~8–12 kvartal (2–3 år)** — i linje med r3:s "~3 år".
  impulsvåg-faserna (vanligast) först; korrigering-faserna senare (n=0 idag — lovar inget).
- **Min 20 per cell:** ja som handlingsgrind — men på n_eff, aldrig nominellt n. En cell med
  n = 60 dagar men 2 episoder är okalibrerad, och ska säga det.

### 2.3 Overfitting-skydd

1. **Clean by construction:** Φ designades 2026-09-03; kitet började mäta 2026-09-04 →
   all framtida träffdata är out-of-sample mot designen. Bevara detta: kalibrera ALDRIG på
   data från före tabellens tillkomst (skulle kräva retroaktiv klassningslogik = backtest-historiksmördare).
2. **Walk-forward:** varje Φ-version främjas endast om expanderande-fönster-backtest
   (STYRELSE Rang 3-mönstret på `type=vagscan`-historik) visar nettoförbättring av träff
   mot sittende tabell — inte bara att posteriorn rörde sig.
3. **Ett steg i taget** (STYRELSE §5:5 samma regel): aldrig ändra Φ + trösklar + Markov
   samtidigt; varje ändring = ny protokollversion + nollställda räknare + deklarerad orsak.
4. **Självreferensrisk:** domen mäter motorn mot samma data motorn läser — träffförbättring
   kan vara inlärning av datasetets brus, inte struktur. Krysskontroll: Bana B:s per-variabel-träff
   mot Bana A:s total-träff ska röra sig samman; gör de inte det är det brus, inte signal.
5. **Ickestationaritet:** dokumenterad regimepause (t.ex. räntoch) fryser kalibreringen
   (ΔΦ = 0 tills vidare) i stället för att japa efter en regimeväxling.

### 2.4 Rollbacks

- Φ-tabellen lever som versionerade rader (`giltig_från/giltig_till`, hash-kedjad append-only
  i r4 §8.2:s mönster — retroaktiva ändringar detekterbara).
- **Automatisk återkallning:** om 90 dagar efter främjandet ligger träffen för de faser som
  fick ny Φ mer än 5 procentenheter LÄGRE än gamla tabellens (n_eff ≥ 30) → rulla tillbaka
  och publicera "version X återkallad öppet" (r4 §8.2:s formulering är kontraktet).
- Gamla Φ är alltid återskapbar ur loggen — determinismen kräver att en analys med
  `modellVersion` kan rekonstrueras exakt.

## 3. Ärlighet — vad som INTE kan kalibreras

1. **AKM1-kärnan och projektionsinvarianten — heliga, punkt.** `projiceraAKM1(raknaAKM2(k,
   {moduler: [], viktprofil: "akm1-klassisk"})) === raknaAKM1(k)` ALLTID (AKM2-BESLUT §0).
   Kalibreringen får röra ENASTE lager 3:s Φ-utdata och valideringsprotokollets trösklar —
   aldrig grundpoäng, variabeltrösklar, 0–5-skalan, eller `akm1-klassisk` (`las: true`).
2. **Vikterna (AKM2 lager 4).** R2:s vikter är litteraturburna (Novy-Marx, Loughran–Wellman
   m.fl.); att omviktka dem på 12 tickers interna träffdata vore att byta ut extern evidens
   mot 3 års brus. Viktkalibrering är ett separat AKM3-beslut som kräver UF-data och bör
   vänta — kundens bayesianska omviktning får först sin Φ-lärjunge.
3. **"Osatt"-ärligheten.** Kalibrering får aldrig pressa en tunn cell till att se säker ut:
   handlingsgrinden (n_eff ≥ 20 + kredibelt intervall) gör tystnad till standardutdata.
   `osatt`-fasen kalibreras aldrig — "osatt är information, inte fel" är kontrakt, inte parameter.
4. **Vad träff-% överhuvudtaget inte mäter.** Dom-protokollet mäter vågklassens *fortbestånd i
   fundamentalserien* — inte aktiekursprognos, inte vinst. Kalibrering kan göra modellen mer
   självkonsistent (kalibrerade osäkerhetspåståenden träffar så ofta de påstår, STYRELSE §4:3);
   den kan inte och skall inte omvandla AKM2 till en kursprognos. All kundkommunikation behåller
   formuleringen "öppet kvitto om det förflutna — aldrig garanti om framtiden".
5. **Determinism + konstanternas helighet.** Kalibreringen lever helt i offline-cron; analys-
   körningen får aldrig läsa "levande" posteriorer — bara frusna, versionsstämplade tabeller.
6. **Konfidensintervallens gräns.** Med ρ̄ ≈ 0,5 och 12 tickers är den effektiva stickprovs-
   basen för "hela universumet" per kvartal ≈ en handfull. Vissa celler (korrigering på lång
   horisont) kommer ALDRIG nå n_eff = 20 — det är inte ett misslyckande utan en sann
   rapportering av vad ett 12-bolagsuniversum kan bära. Utöka universumet = separat beslut.

## 4. Första leveransen är redan här: protokollfynd ur rond 1 (2026-09-04)

| Fynd | Bevis | Åtgärd (protokoll, ej Φ) |
|---|---|---|
| Basbygge 0 % på medellång & mega (n=6 var), 30 % på kort | vagvalidering-SENASTE.md | ±6 %-tröskeln är horisontinvariant men momentum skalar med horisont → tröskel per horisont (förslag: mikro/kort ±6 %, medellång ±15 %, lång/mega ±25 %) = `vagvalidering/1` v2, räknare nollställs, deklarerat |
| Korrigering n=0 överallt | samma | inte ett fel: 2026-regimen har ingen negativ total-klass — hierarkisk poolning (§1.5) hanterar det |
| 52 % totalträff, n=48 dag 1 | samma | startvärde att gå på — publiceras på /transparens |

Detta är loopens existensbevis: innan kalibreringslagret byggs har mätningen redan hittat en
kalibrerbar orättvisa (tröskeln) som ingen mängd fil läsning hade avslöjat.

## 5. Implementeringsskiss — BYGG EJ (endast skiss)

**Filer (nya, fil-domäner enligt AKM2-BESLUT byggregler):**
- `src/lib/akm3/kalibrering.ts` — RENA funktioner: `betaPosterior`, `phiFranPosterior`,
  `episodRaknare`, `dirichletMarkov`, `byggKalibreradPhiTabell`. Importerar endast `import type`.
- `src/app/api/cron/kalibrering/route.ts` — månadsrond, schema `"45 5 1 * *"` (efter 05:30-kitet,
  ledig slot i vercel.json), samma CRON_SECRET-mönster. Läser `vagvalidering`-events +
  (fas 2) `vagvalidering_dom`, fryser ny Φ-version, skriver event, publicerar OrganEvent.
- `verktyg/testa-kalibrering.mjs` — 100%-svitens mönster (determinism, idempotens, grindvakt).

**Tabell (Supabase, fas 1 i system_events, fas 2 dedikerad):**
```jsonc
// system_events type=kalibrering, details.schema "kalibrering/1":
{
  "protokollVersion": 1,
  "phiVersion": "phi-2026-12-01",          // giltig_från; föregångare i giltig_till
  "faser": {
    "impulsvag_bekraftad": { "alpha": 12.5, "beta": 6.3, "nEff": 14,
      "phiNy": 1.20, "phiGammal": 1.20, "status": "oforandrad|justerad|okalibrerad",
      "kredibeltIntervall90": [0.52, 0.78] }
  },
  "markov": { "trog": { "impulsvag": [/* Dirichlet-posterior + räknade */] } },
  "rollbackRegel": "traff -5pp / n_eff>=30 inom 90 dagar => aterkalla oppet",
  "hash": "<sha256 kedjad>"
}
// fas 2-tabell: vagvalidering_dom(ticker, variabel, horisont, domat_datum, traff_datum,
//   klass, utfall_momentum, traff bool, episod_id, protokoll_version)  — STYRELSE §3.2 exakt
```

**Inkoppling i dynamik.ts (minimal, kontraktet bevarat):** `DynamikInput` får valfritt fält
`kalibreradPhi?: Partial<Record<Vagfas, number>>` — saknas fältet gäller designtabellen
(PHI oförändrad, bakåtkompatibelt; alla befintliga tester kvar gröna). Kärnan märker ingen
skillnad (den ser bara justering via injicerad funktion). `akm1-klassisk`-projetionen berörs
aldrig — invarianttestet körs i samma svit som kalibreringstesterna.

**Snapshot-historik (förutsättning för Bana B och sekvens-n):** lagras som
`vagklass_snapshot(ticker, variabel, horisont, snapshot_datum, klass, protokoll_version)` —
r3 väg 2; skrivs av vagscan-cronen (redan dagligen 05:00), dedupliceras per kvartalssnapshot.

**Publiceringsytor:** /transparens ("Kalibreringens historik: Φ per version, varför ändrad,
träff före/efter"), kvalitetsrapportens åttonde kontroll utökas med kalibreringsstatus,
admin-signal vid rollback (befintlig signal-buss).

## 6. Rekommendationer — tre

1. **Bygg Bana B (per-variabel-dom + snapshot-historik) INNAN någon Φ ändras.** Utan
   per-variabel- och episoddata kalibrerar loopen total-klassens dagspersistence — fel mätobjekt
   för Φ. Snapshot-historiken är dessutom redan betald design (r3 väg 2) med två konsumenter
   (sekvens-n ESKALERING + kalibrering). Tröskelversionen `vagvalidering/1` v2 (§4) kan beslutas
   redan nu — den kräver bara protokollbeslut, ingen ny data.
2. **Kör beta-binomial med episodräkning och handlingsgrind (n_eff ≥ 20, kredibelt intervall,
   ±0,05/månad, walk-forward, hash-kedjad versionslogg med automatisk öppen återkallning).**
   Det är kundkulturens exakta formalisering (Bayes-disciplin + valideringslogg), det håller
   determinismen (P6) intakt via frusna tabeller, och det gör tystnad — "okalibrerad n=7/20" —
   till standardutdata i stället för en gissad siffra. Räkna EPISODER, aldrig dagar; diskontera
   tvärsnittet för makrokorrelation.
3. **Deklarera immunförklarat område i beslutet: AKM1-kärnan, projektionsinvarianten, den låsta
   profilen, osatt-kontraktet och (tills vidare) vikterna.** Kalibreringens mandat begränsas
   till lager 3:s Φ, Markov-matriser och protokolltrösklar — allt versionsstämplat och
   reversibelt. Det skyddar det publika kontraktet, håller "osatt är information" heligt, och
   gör kalibreringslagret till en lärjunge till evidensen i stället för herre över modellen.

---
*Källor: src/lib/vagvalidering.ts · src/app/api/cron/vagvalidering/route.ts · src/lib/akm2/{dynamik,vikter,karna,typer}.ts · data/forskning/{AKM2-BESLUT, r3-dynamisering-2026-09-03 §8+§10, r4-akm2-arkitektur-2026-09-03 §8, STYRELSE-vag-exakthet §3–§5}.md · data/rapporter/vagvalidering-SENASTE.md (rond 1, 2026-09-04) · vercel.json crons · skill ak1a-analys (Bayes-disciplin, valideringslogg). Pedagogisk forskning — ALDRIG investeringsråd.*
