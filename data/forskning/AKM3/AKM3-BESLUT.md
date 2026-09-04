# AKM3-BESLUT — syntes av r1–r5 (normativt för byggagenter)
Skrivet av AI-styrelsens ordförande 2026-09-04 efter djupgranskning i tre rundor
av fem forskarrapporter i data/forskning/AKM3/ (r1-bayes, r2-regimer, r3-peer,
r4-osakerhet, r5-ensemble) + kodläsning av src/lib/akm2/. DETTA dokument är vad
byggagenterna följer. Version: **AKM3.2026.09**. Ärlighet framför entusiasm:
avslagna idéer dokumenteras med skäl i §9. Full evidens i respektive rapport.

## 0. Identitet
AK-Model 3 (AKM3) = ett SYNTES- och ÄRLIGHETSSKIKT ÖVER den orörda AKM2-kärnan:

| Komponent | Kod | Roll |
|---|---|---|
| Ensemble | `src/lib/akm3/ensemble.ts` | Likaviktat medel av de tre existerande viktprofilernas AKM2-kompositer + ensemble-band (r5 Design A) |
| Kalibrering | `src/lib/akm3/kalibrering.ts` + cron | Offline-cron som lär av verifierade utfall och fryser versionsstämplade Φ-tabeller (r1) |
| Regimindikator | `src/lib/akm3/regim.ts` | Deterministisk regimebeskrivning — i denna version ENBART deskriptiv + loggad (r2 steg 1) |
| Intervall | `src/lib/akm3/osakerhet.ts` | Deterministiskt osäkerhetsspann (poäng, täckning) → presentationslager (r4) |
| Peer | `src/lib/portfolj-forskning/peer.ts` | Branschjämförelse på rank/median-basis — läslager (r3) |

Namnnotering (r1 §0 antagen): AKM2:s lager 4 = vikter. Kundens "AKM3-lager 4"
är PROJEKTNAMN; kodidentifierare får inget lagernummer. Ensemblen är matematiskt
ett lager-5-aggregat ÖVER resultat. Projektionsinvarianten förblir kontrakt:

`projiceraAKM1(raknaAKM2(k, { moduler: [], viktprofil: "akm1-klassisk" })) === raknaAKM1(k)` ALLTID (AKM2-BESLUT §0).

## 1. Kundprinciperna (domskäl i samtliga rundor)
P1 **Determinism** — inga klockor, inget slump; samma indata ⇒ JSON-identiskt utdata.
P2 **Projektionsinvarianten helig** — AKM1-kärnan, låsta profilen, 0–5-skalan orörda.
P3 **Osatt=osatt** — tystnad är standardutdata; modellen gissar aldrig (null in ⇒ osatt ut).
P4 **2007:528** — ALDRIG investeringsråd; beskriv, diktera inte; daterat underlag.
P5 **Pedagogiskt värde före komplexitet** — varje ny parameter måste förtjäna sin plats.

## 2. Rond 1 — dom per förslag
| Förslag | Dom | Skäl |
|---|---|---|
| r1: Bana B (per-variabel-dom + snapshot-historik) + tröskel-protokoll v2 | **BYGG NU** (steg 2) | Ren datainsamling, noll poängpåverkan; loopens existensbevis levererat (rond 1: basbygge 0 % på medellång/mega, 30 % på kort) |
| r1: Φ-kalibrering (beta-binomial, handlingsgrind) | **VILLKORAD** (steg 6–7) | Maskineri byggs med LÅST grind (ΔΦ=0); ändring först vid n_eff ≥ 20 episoder — realistiskt 8–12 kvartal |
| r2: regimeindikator deskriptiv + logg | **BYGG NU** (steg 5) | Ren funktion av daterade snapshots ur existerande motorer (forskningslaget, vagscan, vagkon) |
| r2: regime → viktprofiler (aktivt lager 4.5) | **AVSLAGEN TILL VIDARE** (§9.1) | N-indikatorn kan inte aktivera: 12 vågbolag < n≥30 ⇒ N=osatt ⇒ "expansiv"/"korrigering" omöjliga; timing-evidens out-sample-svag (Asness 2017); dubbelräkningsrisk mot lager 3 |
| r3: peer (percentil, drag, per-variabel) | **BYGG NU** (steg 4) | All data finns (10×10-balanserad korstabell); rank/median korrekt för n=10; läslager = noll invariant-risk |
| r4: intervall + tre UI-ytor | **BYGG NU** (steg 3; reglaget sist) | Bevisbar deterministisk formel; Manski-bounds-ram; spannet gör osatt=osatt synligt |
| r5 Design A: ensemble likavikt | **BYGG NU** (steg 1) | Forecast combination puzzle — obestridlig grund; likavikt = noll fria parametrar; lager-5-aggregat |
| r5 Design B: horisontprofiler | **VILLKORAD** (steg 9) | HEMMHORISONT-härledningen elegant MEN distanskurvan (2,0/1,25/0,5) är en fri trippel; mikro-vyn vilar på strukturellt osatta V16–V18 |
| r5 A+B-kombination (15 anrop/bolag) | **AVSLAGEN** (§9.3) | Komplexitet före bevisad grund |
| r1: viktkalibrering | **AVSLAGEN tills vidare** (§9.4) | Litteraturburna vikter byts inte mot 12 tickers brus; kräver UF-data + separat beslut |

## 3. Rond 2 — EN arkitektur, konfliktlösning
```
lager 0–3  AKM2-kärnan, moduler, dynamik (Φ), port-gate   ── ORÖRD av AKM3
lager 4    AKM3: ensemble (statisk, 3 profiler) ──+── kalibrering (offline,
           fryser Φ-versioner; analyskörning läser ENDAST frusna tabeller)
lager 4.5  regimindikator: DESKRIPTIV + loggad i 2026.09 — väljer ALDRIG profil,
           ändrar ALDRIG poäng (aktivering = villkorat framtida beslut, §8)
lager 5/pres  intervall (r4: dataosäkerhet) + peer (r3: sällskapsläsning) +
           ensemble-band (r5A: modell-osäkerhet) — LÄSER, ändrar aldrig poäng
mätning    prediktionsloggen (append-only, hash-kedjad): AKM3.2026.09 = NYTT
           spår bredvid AKM1/AKM2 — verkligheten dömer (§12)
```
Konfliktlösningar: (i) r1 vs r5 om "lager 4" — olika objekt (Φ vs profiler);
kod-namnlösning §0. (ii) r2 vs r5: när/vä om regimprofiler aktiveras blir de
ensemble-MEDLEMMAR, aldrig profilernas herre — ensemblen förblir likavikt.
(iii) r4 vs r5: intervall = dataosäkerhet (täckning), band = profil-enighet —
två olika glasögon, visas sida vid sida. (iv) r2 vs lager 3: poäng vs vikter —
hård separering; regimen får aldrig röra det lager 3 redan gör.

## 4. Ensemble (steg 1) — normativt
```
K_p        = raknaAKM2(k, { moduler, viktprofil: p }).komposit
             p ∈ { akm1-klassisk, akm2-2026, superanalys-2026 }   (exakt 3)
AKM3_total = round( Σ_p α_p·K_p ),  α = 1/3 för alla — LÅST i 2026.09
band       = [ min_p K_p, max_p K_p ],  median = mittenvärdet
spridning  = max − min
enighet:   0–3 p "enig" · 4–7 p "delad" · ≥ 8 p "profilspanning"
modellVersion = "AKM3.2026.09"
```
- Porten slår igenom automatiskt per profil (den följer DATA, inte profilen).
  Osatta andelar ärvs per profil och visas. Okänd profil-id ⇒ ärligt fel.
- **AKM3 ersätter ALDRIG** AKM2-kompositen eller AKM1-projektionen i existerande
  ytor — alltid sida vid sida (P4). API/cache: `data/cache/akm3-{TICKER}.json`
  enligt akm2-onsdemand-mönstret; API-svar utökas additivt, befintliga fält ändras ALDRIG.
- Diagnostik-texter: `akm2-2026 − akm1-klassisk` = omfördelningseffekten;
  `superanalys-2026 − akm2-2026` = kategorivikt vs variabelvikt.

## 5. Osäkerhetsintervall (steg 3) — normativt
```
t         = datatackning (befintligt fält; AKM1: satt vikt/100, AKM2: aktiv profilvikt)
nedre     = K                       (värsta fallet: osatta ger 0 p)
ovre      = min(100, K + 100·(1−t)) (bästa fallet: osatta ger 5 p)
porttak:  hård port aktiv ⇒ ovre = min(ovre, 45)
halvbredd = (ovre − nedre)/2        format: "K ± halvbredd p (täckning X %)"
```
- **Spannet [nedre–övre] visas ALLTID** i tooltip/aria-label och utskrivet på
  detaljsidor — en symmetrisk ±-förkortning av ett asymmetriskt spann får
  ALDRIG vara det enda kunden ser. **Siffran följer ALLTID formeln** (direktivets
  exempeltal "±12 vid 67 %" var illustrativt; formeln ger ±16,5 — P1 gäller).
- Strängare fullviktsraden för AKM2-kompositen ([K·t, K·t+100(1−t)]) redovisas
  som extra rad på detaljsidan ("med profilen behållen vid full data").
- Band-interaktion: "aktor" (≥75) kräver dessutom t ≥ 0,60; existerande regel
  osatt-band vid andelOsatta > 0,5 behålls orörd. Ingen imputation — strukturellt
  saknad data rapporteras som saknad (OECD/JRC; P3).
- Avvikelse mot r4 §4 (dokumenterad): intervallfunktionen läggs i
  `src/lib/akm3/osakerhet.ts` (ren funktion) och kopplas i VISNINGS lagret
  (korstabell/djupvy) — kärnan karna.ts rörs inte alls i AKM3.2026.09
  (fil-domän + invariant-säkerhet; semantiken låses av testsviten).

## 6. Peer (steg 4) — normativt
```
grupp        = korstabellens rader per branschfamilj (de 10 kanoniska)
peerPercentil= 100·(sämre + 0,5·lika)/(n−1)     midrank — namnbrytning ALDRIG
rank         = 1 + antal strikt bättre           visas "4/10"; delade = delade
peerDrag     = akm2 − branschmedian              (JSON-nyckel åäö-fri: "peerDrag")
hallning(Vxx)= poäng − branschmedianpoäng: > +0,5 ÖVER · |·| ≤ 0,5 I NIVÅ · < −0,5 UNDER
```
- Grupp < 5 bolag ELLER variabel osatt hos bolaget ⇒ fältet `osatt` — ALDRIG gissning.
- `peer.referens` = korstabellens `skapad` + "100-bolagsunivers" (urvalsberoendet syns).
- Peer visas ALLTID tillsammans med `akm2Moduler` (branschmedianer återspeglar
  modulviktningar — modul-konfunden deklareras i visningen).
- Peer är ett LÄSLAGER: ingår ALDRIG i raknaAKM2/kompositen. Z-score/MAD avvisas
  (n=10: MAD kan kollapsa) — rank/median endast. Fas 2 (rå nyckeltals-peer,
  kategori-peer) SENARE — poängvarianten kräver ingen ny data.

## 7. Bana B + tröskel-protokoll v2 (steg 2) — normativt
- Tabell `vagvalidering_dom` (STYRELSE-vag-exakthet §3.2 exakt): ticker, variabel,
  horisont, domat_datum, traff_datum, klass, utfall_momentum, traff, episod_id,
  protokoll_version. Episod avgränsas av klassbyte (osatt avgränsar också).
- Tabell `vagklass_snapshot` (r3 väg 2): skrivs av vagscan-cronen, dedupliceras
  per kvartalssnapshot — två konsumenter: sekvens-n ESKALERING + kalibrering.
- **Trösklar per horisont beslutas NU** som `vagvalidering/1` v2 (protokollbeslut,
  ingen ny data krävs): mikro/kort ±6 % · medellång ±15 % · lång/mega ±25 %.
  Orsak deklaras (fynd: basbygge 0 % på medellång/mega, 30 % på kort — momentum
  skalar med horisonten); räknare nollställs; version 2 dateras och motiveras.

## 8. Regimindikator (steg 5) + kalibrerings-cron (steg 6) — normativt
**Regim (deskriptiv):** indikatorer G/R (forskningslaget.ts kanoniska tal
0,10/0,08/0,35), N (vagscans fundamentala vågbredd — **N=osatt tills ≥ 30 mätta
vågbolag**; idag 12), Σu (vagkon, års). Etiketter enligt r2 §2.2 (balanserad/
expansiv/magert/korrigering/magert-korrigering/osatt) med hysteres: in-/utträde
kräver 2 konsekutiva snapshots (3 vid års-Σu > 25 %), kvartalskadens, datering
`senastKontrollerad`. `data/portfolj-system/regime-logg.json` append-only från
dag 1 + metodblad på /transparens. Verifierat mot 2026-09-03: G=0,07, R=0,17 ⇒
"magert" (hysteresen är nödvändig — G sitter på tröskeln). Regimen väljer
ALDRIG profil och ändrar ALDRIG poäng i AKM3.2026.09.

**Kalibrerings-cron:** månadsrond `"45 5 1 * *"` (CRON_SECRET-mönstret), schema
`kalibrering/1`. Beta(α₀=m·q, β₀=m·(1−q)), m=10, q ur Markov-priorerna;
Φ_kalibrerad = clamp(1+κ·(2p̂−1), 0,80, 1,20); κ=0,20 för bekräftad/mogen impuls
och korrigering_hog_g, κ=0,10 för obekräftad/korr_lag_g (r1 §1.2). Dirichlet(5·T_design
+ räknade) för Markov-rader. **Handlingsgrind (ΔΦ=0 om inte ALLA):** (i) n_eff ≥ 20
EPISODER, (ii) 90 %-kredibelt intervall helt på ena sidan 0,50, (iii) max ±0,05 per
fas och månad. Status "okalibrerad (n=7/20)" är standardutdata. Posteriors uppdateras
varje rond (billigt); tabeller fryses och versioneras (hash-kedjat, giltig_från/till).
Inkoppling i dynamik.ts via valfritt fält `kalibreradPhi?` — saknas fältet gäller
designtabellen (bakåtkompatibelt; invarianttestet i samma svit).

## 9. Avslagna idéer — med skäl (ärlighet framför entusiasm)
1. **Regime→viktprofilkoppling NU (r2 huvudförslag).** Huvudindikatorn N kräver
   ≥ 30 vågbolag — universumet har 12 ⇒ N=osatt ⇒ regimen kan aldrig nå
   "expansiv"/"korrigering" enligt sina egna regler; det återstår G/R-only.
   Faktor-timing-evidensen är out-sample-svag (Asness 2017 "deceptively
   difficult"; RAFI keep-it-simple; Hu 2022: volatilitetsminskning, ej alfa).
   Dubbelräkning mot lager 3 (value appearing × Värde +6). Återkommer som
   villkorat steg 8: (a) N-universum ≥ 30, (b) 8–12 kvartal regime-logg med
   träff ≥ basprofil, (c) amplitudtak ±6/total ≤12 + expansiv=basprofil,
   (d) NYTT styrelsebeslut. Regimprofilerna blir då ensemble-medlemmar.
2. **Horisontprofiler som rankinggrund (r5 Design B ζ-kollaps).** Distanskurvan
   m(0/1/2+) är en fri trippel utan kalibrering; mikro-vyn vilar på V16–V18 som
   är strukturellt osatta (kvalitativa katalysatorer saknas i datakontraktet) —
   vyn blir ärligt men nästan alltid "osatt". Växlingsvy = villkorat steg 9.
3. **Ensemble-inom-varje-horisont (r5 §4.4, 15 anrop/bolag).** Komplexitet före
   bevisad grund; kostnaden försvaras först om horisontvyerna visar information.
4. **Viktkalibrering (r1 §3.2).** R2:s vikter är litteraturburna (Novy-Marx,
   Loughran–Wellman); intern träffdata på 12 tickers är brus. Kräver UF-data +
   separat beslut — kalibreringens mandat är Φ, Markov och protokolltrösklar.
5. **Frekventistisk shrinkage som huvudspår (r1 §1.3).** Förlorar kredibla
   intervall och kundkulturens bayesianska språk. Fallback endast om Beta-kvantiler
   inte får plats i runtime — de behöver inte det (tabellerna fryses).
6. **Kalibrering av osatt-fasen.** Per definition avvisad: Φ 1,00/0-bidrag är ett
   ärlighetskontrakt, inte en parameter (P3).

## 10. FORBUD — vad som ALDRIG får ske
1. AKM1-kärnan, grundpoäng, variabeltrösklar V01–V20, 0–5-skalan, hård port,
   `akm1-klassisk` (las: true) och projektionsinvarianten: ORÖRDA av AKM3 — EVER.
2. `osatt`-kontraktet: osatt kalibreras aldrig, lyfts aldrig av dynamik,
   imputeras aldrig, pressas aldrig att se säker ut. Tystnad = standardutdata.
3. Vikterna i akm2-2026/superanalys-2026 omviktas ALDRIG på intern träffdata.
4. Analyskörningen läser ALDRIG levande posteriorer — endast frusna,
   versionsstämplade tabeller; varje resultat med `modellVersion` ska kunna
   rekonstrueras EXAKT ur loggen.
5. Kalibrering på data från före 2026-09-04 är FÖRBJUDEN (clean by construction —
   design Φ är 2026-09-03; retroaktiv klassning mördar backtest-ärligheten).
6. Φ + trösklar + Markov ändras ALDRIG samtidigt — en ändring per protokollversion,
   räknare nollställs, orsak deklareras öppet.
7. Dagar räknas ALDRIG som observationer — episoder är enheten; tvärsnitt
   diskonteras för makrokorrelation (n_eff, aldrig nominellt n).
8. Signalverb (köp, sälj, öka, minska, undvik, passa på) i koppling till regim,
   ensemble, peer eller intervall är FÖRBJUDNA (2007:528). Banden
   (aktor/studera/skjut/osatt) berörs ALDRIG av regimen. Regimen beskriver
   UNDERLAGET per `senastKontrollerad` — aldrig "marknaden just nu".
9. AKM3-block ersätter ALDRIG befintliga fält: JSON-tillägg är additiva och
   valfria (bakåtkompatibelt); bas och AKM3 visas sida vid sida.
10. Slump, klocka eller Date.now i lib-funktioner: FÖRBJUDT (P1). Peer via
    z-score/MAD: förbjudet (n=10). Retroaktiva loggändringar: förbjudna —
    append-only, hash-kedjad; återkallningar sker öppet (r4 §8.2-formen:
    "version X återkallad öppet").
11. Automatisk återkallning är KONTRAKT: träff för faser med ny Φ mer än
    5 procentenheter lägre än gamla tabellens inom 90 dagar (n_eff ≥ 30) ⇒
    rulla tillbaka och publicera öppet. Dokumenterad regimepause fryser (ΔΦ=0).

## 11. Byggordning med acceptanskriterier
| # | Steg | Bygger | Acceptanskriterier (ALLA ska passera) |
|---|---|---|---|
| 1 | Ensemble (r5A) | `akm3/typer.ts`, `akm3/ensemble.ts`, loggspår | (i) tre identiska profiler ⇒ total = profilens komposit; (ii) determinism: 2 körningar JSON-identiska; (iii) invarianttest kvar grönt; (iv) prediktionsloggen har AKM3.2026.09-spår, hash-kedjat; (v) enighetsgränser 0–3/4–7/≥8 enligt §4; (vi) α=1/3 låst (test nekar custom-α) |
| 2 | Bana B + v2-trösklar (r1) | `vagvalidering_dom`, `vagklass_snapshot`, vagscan-cron | (i) schema live, domar skrivs per variabel/horisont; (ii) snapshot dedupliceras per kvartal; (iii) v2-trösklar beslutade med deklarerad orsak + nollställda räknare; (iv) episodräknare validerad: n_episoder ≤ n_dagar på rond-1-data |
| 3 | Intervall (r4) | `akm3/osakerhet.ts`, korstabell/djupvy | (i) golden: INDU-C [58,91] · PSNY [7,65] · VPLAY övre=45 · t=1 ⇒ [K,K]; (ii) determinism; (iii) spann synligt i tooltip/aria + detaljsida; (iv) kärnan karna.ts orörd (diff = 0) |
| 4 | Peer (r3) | `portfolj-forskning/peer.ts`, korstabell-kolumn, Peer-spegel | (i) midrank-test med delade värden; (ii) osatt vid grupp=4; (iii) determinism 2× identisk JSON; (iv) kompositen OFÖRÄNDRAD med/utan peer; (v) referensfält + akm2Moduler visas |
| 5 | Regimindikator (r2) | `akm3/regim.ts`, `akm3/koppla.ts`, route, regime-logg | (i) determinism: samma indikatorer ⇒ bitidentisk regime; (ii) hysteres: G 0,07↔0,08 byter ALDRIG regime; (iii) N=osatt eftersom 12<30 (test vaktar); (iv) logg append-only från dag 1; (v) metodblad på /transparens |
| 6 | Kalibrerings-cron, LÅST grind (r1) | `akm3/kalibrering.ts`, `api/cron/kalibrering` | (i) idempotens (2 körningar ⇒ samma tabellversion); (ii) ΔΦ=0 tills grinden öppnar (grind-simulering: syntetisk episoddata ⇒ öppnar exakt vid n_eff=20); (iii) inga levande posteriorer i exports; (iv) hash-kedja verifierbar; (v) rollback-regel kodad enligt §10.11 |
| 7 | VILLKORAD: Φ-ändring | ny protokollversion | n_eff ≥ 20 episoder per fas OCH kredibelt intervall helt under/över 0,50 OCH walk-forward nettoförbättring mot sittande tabell OCH ny version + nollställda räknare + deklarerad orsak |
| 8 | VILLKORAD (~2028+): regimprofiler | `akm3/regimprofiler.ts` | N-universum ≥ 30 OCH 8–12 kvartal logg med träff ≥ basprofil OCH tak ±6/≤12 OCH sida-vid-sida-visning OCH nytt styrelsebeslut |
| 9 | VILLKORAD: horisontvyer + kalkylatorreglage (r5B, r4) | `akm3/horisontprofiler.ts` | ensemble-spåret visar information (P5-dom) OCH katalysator-/kvalitativ datatackning växt; distanskurvan låst som EN dokumenterad trippel — ALDRIG per-horisont fria tal |

Steg 1–2 kan parallelliseras (olika fil-domäner); tabellordningen = prioritet vid
konkurrens. Varför ensemble först: den definierar AKM3:s identitet och startar
prediktionsloggens mätklocka — allt som ska dömas behöver tid. Varför Bana B som
tvåa: varje kvartal utan snapshot-historik är ett kvartal förlorat för kalibreringen.

## 12. Mätning — prediktionsloggen dömer
AKM3.2026.09 registreras som NYTT prediktorspår (AKM1/AKM2 förblir jämförbara).
P5-uppföljningen "då vs nu" dömer inom 8–12 kvartal: om AKM3-ensemble-totalen
inte visar nettofördel mot AKM2-kompositen publiceras det ÖPPET på /transparens
och ensemblen förblir presentationsvy — den upphöjs ALDRIG till "huvudtotal" på
grund av entusiasm. Samma dom gäller regime-etiketten (steg 5-loggen) och
tröskel-protokoll v2 (Bana A-statistiken). Formuleringen i all kundkommunikation
består: "öppet kvitto om det förflutna — aldrig garanti om framtiden."

## Byggregler (ärver AKM2-BESLUT rakt av)
- Fil-domäner (INGEN agent rör en annans filer):
  ensemble/kalibrering/regim/osakerhet: `src/lib/akm3/` · peer: `src/lib/portfolj-forskning/peer.ts`
  · AKM2:s domäner (karna/dynamik/vikter/moduler) rörs ENBART där §8:s valfria
  `kalibreradPhi?`-koppling görs — av dynamikagenten, med invarianttestet grönt.
- Importera endast `import type` från akm2/typer.ts + portfolj-forskning/typer.ts.
  `npx tsc --noEmit` = 0 nya fel. Testfil i verktyg/ per modul (100 %-mönstret).
  JSON-nycklar utan åäö (peerDrag, inte branschdrag). ALLT på svenska med korrekta
  åäö i UI-texter. ALDRIG investeringsråd-formuleringar (lagen 2007:528).

---
*Källor: data/forskning/AKM3/{r1-bayes, r2-regimer, r3-peer, r4-osakerhet, r5-ensemble}.md ·
data/forskning/AKM2-BESLUT.md · data/forskning/PROTOKOLL.md · src/lib/akm2/{karna, dynamik, vikter, typer}.ts ·
src/lib/vagvalidering.ts · data/rapporter/vagvalidering-SENASTE.md. Pedagogisk forskning — ALDRIG investeringsråd.*
