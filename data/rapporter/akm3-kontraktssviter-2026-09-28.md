# AKM3-KONTRAKTSSVITER 2026-09-28 (v213b-mönstret, spår 7-fortsättning)

**Kontext:** Motorregistret 2026-09-19 (rond 107) stängde sina 10 kända
testgap samma våg — men AKM3-familjen (`src/lib/akm3/`) tillkom EFTER
registrets kartläggning och hade endast kalibrering.ts täckt (testa-akm3-
kalibrering.mjs). Tre nya motorer var både OBEFINTLIGA i registret (105
poster, ingen akm3-ensemble/osakerhet/regim) och utan dedikerad svit.
Denna våg stänger de tre första gapen i nästa modellgeneration.

**Metod (v213b-doktrinen):** motorfilen lästes FÖRST; kontrollerna testar
FAKTISKA exporter och filhuvudenas dokumenterade kontrakt (aldrig
påhittade); deterministiska (inga klockor/slump/nät — sha256 INJICERAS i
regim-sviten); ts-import-bryggan (ren node ≥ 22.18, type stripping);
körtider 2,6–6,6 s (tak < 60 s); ärligt rött under utvecklingen:

- ensemble: NUL-fixturen läckte mätta serier/aterkop via spread — fixturen
  kurad (explicit nollade fält), motorkontraktet orört.
- osakerhet: tre TESTFEL (flyttalsprecision i D3; F3 testade inneslutning
  där filhuvudet lovar "minst lika bredd"; G6 slarvig halvbredd) —
  kurade mot filens faktiska kontrakt, motorn orörd.
- regim: grön på första körningen.

## Svit 1 — verktyg/testa-motor-akm3-ensemble.mjs (35/35 PASS, exit 0, ~4 s)

Kontrakt: konstanter (AKM3_MODELL_VERSION "AKM3.2026.09", α=1/3 LÅST,
enighetströsklar 3/7) · enighetFranSpridning-trappan inkl. NaN⇒delad ·
raknaEnsemble: kanonisk profilordning, total=round(Σ α·K) oberoende
omräknad, band/median/spridning, diagnostikdifferenserna, datum ur
k.hamtat · porten följer DATA (PORT-fixture: portAktiv ×3, K_p ≤ 45) ·
NUL: osatta ärvs per profil · determinism 2× + ren funktion ·
arAkm3Ensemble-formguard (6 negativa fall).

```
A — modulkontraktet: exporterna finns
  PASS A1 konstanter + funktioner är rätt sorter
B — konstanterna (BESLUT §4: låsta i 2026.09)
  PASS B1 AKM3_MODELL_VERSION = "AKM3.2026.09"
  PASS B2 ENSEMBLE_ALFA = 1/3 (likavikt — noll fria parametrar)
  PASS B3 enighetstrappans gränser 3 och 7
C — enighetFranSpridning: trappan (ren funktion)
  PASS C1 spridning 0 och 3 ⇒ enig (gränsen är ≤ 3)
  PASS C2 spridning 4 och 7 ⇒ delad
  PASS C3 spridning 8 och 100 ⇒ profilspanning
  PASS C4 NaN/Infinity ⇒ delad (ogiltigt tal är inget omdöme — mittfacket)
D — raknaEnsemble(HEL): det låsta aggregatet
  PASS D1 formulär: ticker/namn/datum/total/perProfil/band/spridning/enighet/alfa/diagnostik/akm1Totalt/akm2Komposit
  PASS D2 datum härleds ur k.hamtat (determinism — aldrig klocka)
  PASS D3 modellVersion på resultatet
  PASS D4 perProfil i kanonisk ordning ["akm1-klassisk","akm2-2026","superanalys-2026"]
  PASS D5 total = round(Σ α_p·K_p) med α=1/3 — oberoende omräkning
  PASS D6 band.min/max = min/max av de tre K_p
  PASS D7 band.median = mittenvärdet (summa − min − max)
  PASS D8 spridning = max − min
  PASS D9 enighet = trappan(spridning) — konsistens mellan fält
  PASS D10 alfa: alla tre profilerna 1/3 (LÅST — aggregationen tar EMOTT inga vikter)
  PASS D11 diagnostik: omfördelningseffekt = akm2−klassisk, kategoriMotVariabel = super−akm2
  PASS D12 akm2Komposit = jämförelsespåret (profilen akm2-2026:s komposit)
  PASS D13 notering nämner alla tre kompositer och att ensemblen ersätter ALDRIG
E — porten följer DATA, inte profilen (PORT-fixturen)
  PASS E1 kassa 8 mån ⇒ portAktiv=true i ALLA tre profilernas utsnitt
  PASS E2 portat komposit-tak: varje K_p ≤ 45 (V19-regeln slår igenom per profil)
  PASS E3 HEL (kassa 80 mån) ⇒ portAktiv=false överallt
F — NUL: osatta ärvs per profil (ärlighet, aldrig gissning)
  PASS F1 andelOsatta = 1 för alla tre profiler
  PASS F2 total = 0 och spridning = 0 ⇒ enig (osatta poäng är INTE profilspanning)
  PASS F3 fortfarande välformad ensemble (formguard godkänner)
G — determinism + ren funktion (P1)
  PASS G1 två körningar ⇒ JSON-identiskt resultat
  PASS G2 indata lämnas orörd (ren funktion)
H — arAkm3Ensemble formguard (läsning av cache-filer)
  PASS H1 äkta resultat ⇒ true
  PASS H2 null/{} / sträng ⇒ false
  PASS H3 fel modellVersion ⇒ false
  PASS H4 två profiler i stället för tre ⇒ false
  PASS H5 total = NaN ⇒ false
  PASS H6 perProfil-rad utan komposit-tal ⇒ false

SVIT MOTOR AKM3-ENSEMBLE: 35 PASS / 0 FAIL av 35 kontroller
RESULTAT: 35/35 PASS
```

## Svit 2 — verktyg/testa-motor-akm3-osakerhet.mjs (34/34 PASS, exit 0, ~2,6 s)

Kontrakt: PORT_TAK=45 · raknaIntervall: Manski-bounds [K, min(100,
K+100(1−t))], halvbredd, t-clamp [0,1], null-ärlighet (5 fall) ·
porttaket endast när naiv övre > 45 (noten avslöjar) ·
raknaFullviktsIntervall [K·t, …] — primären minst lika bred ·
visningsformaten exakt ur filhuvudet ("58 [58–91] (täckning 67 %)",
"58 ± 16,5 (täckning 67 %)", "[58–91]", "—") · determinism.

```
A — modulkontraktet: exporterna finns
  PASS A1 PORT_TAK tal + fem funktioner
B — konstanten
  PASS B1 PORT_TAK = 45
C — raknaIntervall: Manski-bounds ur (K, t)
  PASS C1 filhuvudets exempel: K=58, t=0,67 ⇒ nedre 58, ovre 91, halvbredd 16,5
  PASS C2 full täckning (t=1) ⇒ punkt: ovre = K, halvbredd 0
  PASS C3 noll täckning (t=0) ⇒ ovre = min(100, K+100)
  PASS C4 hundrataket: K=90, t=0,5 ⇒ ovre = 100 (aldrig över 100)
  PASS C5 t clampas överifrån: t=1,5 ⇒ samma som t=1
  PASS C6 t clampas underifrån: t=−0,5 ⇒ samma som t=0
  PASS C7 resultatet bär det clampade t:et (konfidensen aldrig dold)
  PASS C8 poäng-fältet ekar in-K (spannet läser poängen)
D — porttaket (V19: porten slår igenom — kärnans regel följer DATA)
  PASS D1 portAktiv + naiv övre 91 > 45 ⇒ ovre = 45 och portTakad = true
  PASS D2 halvbredden räknas på det TAKADE spannet: (45−58)/2 = −6,5
  PASS D3 portAktiv men naiv övre ≤ 45 ⇒ orörd, ej takad
  PASS D4 utan port lämnas naiva gränsen orörd även över 45
  PASS D5 noten avslöjar porttaket endast när det verkställts
E — null-ärligheten (P3: osatt är osatt, modellen gissar aldrig)
  PASS E1 K = null ⇒ null
  PASS E2 K = undefined ⇒ null
  PASS E3 t = null ⇒ null
  PASS E4 K = NaN ⇒ null
  PASS E5 t = NaN ⇒ null
  PASS E6 fullviktsraden tiger likadant: null-K ⇒ null
F — raknaFullviktsIntervall: profilen behållen vid full data
  PASS F1 [K·t, min(100, K·t + 100·(1−t))] — 58/0,67 ⇒ [38,86, 71,54]
  PASS F2 fulltäckning ⇒ punkten [K, K]
  PASS F3 primärspannet är MINST LIKA BRETT som fullviktsspannet (filhuvudets löfte — bredd, ej inneslutning)
G — visningsformaten (detaljsida · chipp · spann — dokumenterade exempel)
  PASS G1 intervallText(null) och undefined ⇒ "—"
  PASS G2 intervallText(58/0,67) = "58 [58–91] (täckning 67 %)" — filhuvudets exempel exakt
  PASS G3 intervallPlusText(58/0,67) = "58 ± 16,5 (täckning 67 %)" — svenskt komma
  PASS G4 spannText(58/0,67) = "[58–91]"
  PASS G5 spannText(null) ⇒ "—"
  PASS G6 decimaler utan trailingnollor: K=0, t=0,33 ⇒ halvbredd 33,5 (aldrig 33,50)
  PASS G7 heltalspoäng skrivs utan decimaler (58 — aldrig 58,0)
H — determinism (P1: inga klockor, inga lokaler — hydrationssäkra)
  PASS H1 två beräkningar ⇒ JSON-identiskt span
  PASS H2 formateringarna deterministiska (2× samma sträng)
  PASS H3 noten bär spannet och ärlighetslöftet (aldrig det enda kunden ser — men alltid med)

SVIT MOTOR AKM3-OSAKERHET: 34 PASS / 0 FAIL av 34 kontroller
RESULTAT: 34/34 PASS
```

## Svit 3 — verktyg/testa-motor-akm3-regim.mjs (48/48 PASS, exit 0, ~6,6 s)

Kontrakt: trösklarna speglar forskningslaget.ts (0,10/0,08/0,35/0,30 —
en källa) · genesis + BESLUT §8:s dokumenterade fall (G=0,07 R=0,17 ⇒
magert) · N-vakten (12 < 30 bolag ⇒ osatt med ärlig orsak) · fruset
tillstånd (samma/äldre datum ⇒ sittande + kandidat ärvd) · hysteressen:
2-snapshots-bekräftelse, kandidaten dör vid mål-tillbaka, magert-bandet
G 0,08–0,10 · Σu-gaten (30 % ⇒ 3 snapshots) · logg + hash-kedja:
kanonisk JSON utan hash, sha256(prev+"\n"+kanonisk), stämpling lämnar
indata orörd, verifiering (tom=giltig, tamper/fel-prev/utan-hash=ogiltig)
· determinism + "aldrig marknaden just nu".

```
A — modulkontraktet: exporterna finns
  PASS A1 tre konstanter + sex funktioner
B — konstanterna (r2 §2.2 — öppna tal, aldrig dolda)
  PASS B1 REGIM_MODELL_VERSION = "AKM3.2026.09"
  PASS B2 G/R-trösklarna speglar forskningslaget.ts: 0,10/0,08/0,35/0,30
  PASS B3 N-trösklar ±0,20/±0,10 · minVagbolagForN 30 · Σu-gate 0,25 · snapshots 2/3
  PASS B4 genesis-strängen är dokumenterad och icke-tom
C — genesis: första mätningen sätter regimen direkt
  PASS C1 G=0,12 R=0,10 ⇒ balanserad, byte=true, nySnapshot=true, kandidat=null
  PASS C2 BESLUT §8:s dokumenterade fall: G=0,07 R=0,17 ⇒ magert
  PASS C3 G under utträdeströskeln (0,05) ⇒ magert
  PASS C4 R över inträdeströskeln (0,40) ⇒ magert
  PASS C5 G=null ⇒ osatt (modellen tiger hellre än gissar)
  PASS C6 trosklar-fältet ekar de öppna talen i svaret (r2 §3.3.5)
D — N-indikatorn: vågbreddens vakt
  PASS D1 N=−0,30 med 35 bolag ⇒ korrigering (N ≤ −0,20 kollas först)
  PASS D2 N=+0,25 med G=0,12 och 35 bolag ⇒ expansiv
  PASS D3 N-VAKTEN: 12 mätta bolag < 30 ⇒ N osatt, regimen degraderar till G/R (balanserad)
  PASS D4 N=+0,25 men bara 12 bolag ⇒ INTE expansiv (onåbart utan mätt N)
  PASS D5 N utanför [−1,1] saneras ⇒ osatt med läsorsak
  PASS D6 antalVagbolag okänt ⇒ N osatt trots mätt bredd
  PASS D7 beskrivningen tillägger N-osattheten öppet när den gäller
E — fryst tillstånd: kvartalskadens idempotens
  PASS E1 SAMMA datum ⇒ sittande regimen sitter (data ändrad — regimen frysen ändå)
  PASS E2 kandidaten ärvs orörd i fruset tillstånd (minnet dör inte av en omräkning)
  PASS E3 ÄLDRE datum ⇒ också fruset (samma snapshot-identitet)
F — hysteressen: 2 konsekutiva snapshots innan bytet
  PASS F1 snapshot 1 mot magert ⇒ KANDIDAT {magert, 1}, inget byte
  PASS F2 snapshot 2 med samma mål ⇒ REGLERAT BYTE till magert, kandidaten nollställd
  PASS F3 målet tillbaka på sittande ⇒ kandidaten DÖR (vippningsspärren)
G — Σu-gaten: hög volatilitet kräver 3 snapshots
  PASS G1 års-Σu 30 % > 25 % ⇒ kravdaSnapshots = 3 och snapshot 1 ger endast kandidat
  PASS G2 snapshot 2 ⇒ kandidat på 2 — fortfarande inget byte
  PASS G3 snapshot 3 ⇒ REGLERAT BYTE (3-snapshots-bekräftelsen)
  PASS G4 Σu ≤ 25 % ⇒ normala 2 snapshots
H — magert-bandet: regimens hemvist mellan trösklarna
  PASS H1 sittande magert + G=0,09 (bandet 0,08–0,10) ⇒ STÅ KVAR — ingen vippning
  PASS H2 samma G=0,09 UTAN historia ⇒ balanserad (bandet är just hysteressen)
  PASS H3 utträde: G ≥ 0,10 OCH R ≤ 0,30 ⇒ målet räknas med friska ögon (kandidat balanserad)
I — saneringen (null är standardutdata, aldrig gissning)
  PASS I1 G utanför [0,1] (1,5) ⇒ null ⇒ osatt
  PASS I2 R negativ (−0,1) ⇒ null ⇒ osatt
  PASS I3 ogiltig datering ("31/12") ⇒ senastKontrollerad = "" i svaret
  PASS I4 ogiltig tidigare rad (datum ej dag-form) ⇒ genesis-väg
J — loggrad + hash-kedjan (append-only, prediktionsmönstret)
  PASS J1 byggRegimeLoggrad: rad med spar "akm3-regim", rätt version, datering och kandidatläge
  PASS J2 ogiltig datering ⇒ null (loggen tiger tills en mätning finns)
  PASS J3 G/R osatta ⇒ null
  PASS J4 kanonisk JSON är en sträng UTAN hash-fältet och deterministisk 2×
  PASS J5 raknaRegimehash = sha256(prev + "\n" + kanonisk) — kedjeregeln exakt
  PASS J6 stämplingen lämnar indata orörd och ger NY rad med hash
  PASS J7 tom kedja är giltig, null/ickerad ogiltig
  PASS J8 äkta tvåradskedja verifierar (append-only intakt)
  PASS J9 TAMPERAT rad 1 (regime bytt utan omhash) ⇒ ogiltig
  PASS J10 rad utan hash ⇒ ogiltig
  PASS J11 kedjan hänger ihop: rad 2:s hash beror på rad 1:s (korrelationsbevis)
K — determinism (P1: ren funktion)
  PASS K1 samma nu + samma förra rad ⇒ JSON-identiskt svar
  PASS K2 beskrivningen beskriver UNDERLAGET per datum — aldrig "marknaden just nu"

SVIT MOTOR AKM3-REGIM: 48 PASS / 0 FAIL av 48 kontroller
RESULTAT: 48/48 PASS
```

## Nästa testgaps i AKM3-familjen och utanför registret

Kvar utanför registret och utan svit (nästa vågars backlog):
`oversattning/motor.ts` (820 rader — ÖVERSÄTTNINGSMOTORN), `dataset-
medianer.ts`, `analysfabrik.ts`, `observatoriet.ts`,
`forskningslaget.ts`, `larvag*.ts`, `ordlista.ts`, `vagvalidering.ts`,
`siffror*.ts` m.fl. — samt registrets mekaniska uppdatering (regen)
när nästa våg körts.

*Protokoll: fabriksuppdrag KVALITET — kontraktssviter för nästa otestade
motorer; se worklog 2026-09-28.*
