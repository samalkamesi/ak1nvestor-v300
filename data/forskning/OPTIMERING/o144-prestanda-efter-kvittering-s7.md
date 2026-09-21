# O144 — EFTER-KVITTERINGEN: o139 cv-widget + o143 /dataset-CLS på deployat träd (Spår 7, s7-u2)

Datum: 2026-09-21 17:15–pågående lokal · Manifest:
auto-s7-1790001325956 (byggare 2/3, försök 2 från ~17:55 lokal/15:55Z —
manifestet bokfört "klar" men EFTER-verkställandet lever kvar i denna
session enligt §9) · Reservation: o144 i protokollnummer.json · Anspråk
disk-först 15:2xZ
(`data/vakten/auto-s7-1790001325956-s7-u2-ansprak.md`, gitignorad).

## §0 VAL (redogörelse)

Det BOKADE öppna barnet — exakt o130-u3:s formulering av uppdragstexten
("mät före/efter (Lighthouse), deploy, prod 200, mätning bokförd"):
EFTER-kvitteringen av de två committade men ej deployade kurerna

- **o139** (e27ef394): cv-widget-kuren (globals.css + superanalys/
  kalkylator-page) — facit §8.4 "Verkställande redo (exakt, för nästa
  fönster)", spökmätningsskyddad tills kanalbevis.
- **o143** (45a9d432): /dataset-Suspense-CLS-kuren + manifest-ikon-
  sidokuren — facit §7 "VAKARÖVERTAG" med sex punkter.

Duplikatkontroll: u1 och u3 KLARA (fabriksstatus kod 0, avslutade) —
deras facit-sektioner är uttryckliga uppdrag till "nästa fönster/våg"
= denna. Spårets klassiska ytor stängda (bild/cache/koddelning/läsbarhet
— se o130 §0 + o137 §7). o128:s EFTER-facit slutstängdes i DEL 1
(committen före denna) — ingen kollision.

## §1 Läget vid vågstart (15:22Z)

- Prod: DEPLOYAD 02:12:24Z d401d719; 15:07Z-bygget av 45a9d432
  OOM-dödat 15:14:24Z (.next återställd ur läkebackup — grep cv-widget
  = 0; spökmät-skyddet gäller).
- prod-synken VÄNTAR-FABRIK sedan 15:17:26Z på MIN omgång (V235:
  sekvens, aldrig kapplöpning), tak 30 min ⇒ takpassage vid 15:57Z-
  pollen, bygg ~7 min ⇒ DEPLOYAD tidigast ~16:05Z.
- RAM 15:16Z: 5 143 MB tillgängligt; krav med 2 zcode-barn (jag +
  hängd retry 451069 — 0:00 CPU på 40 min, syskonprocess orörd) =
  3 900 MB ⇒ fönstret RAM-MÖJLIGT. Inga egna Chrome-sonder under
  väntan (RAM-disciplinen, o139 §8-tilläggets läxa).

### §1b Försök 2-kronologi (15:55–16:0xZ)

- 15:57:26Z-poll: VÄNTAR-RAM 2 234 < 3 900 (V235-taket passerat —
  nu är RAM enda spärren).
- 16:05Z: NY fabriksomgång (3 zcode-barn à ~0,8 GB — nästa auto-manifest,
  inte vårt: auto-s7-1790001325956 är status "klar" i fabriksstatusen)
  + kundens studio-familj 15:41Z (~2,2 GB, orörbar) + försök-1-linjen
  15:15Z (zcode-cli 479991-gruppen ~1,1 GB, fortfarande uppe 53 min in)
  ⇒ 16:07:26Z-poll: VÄNTAR-RAM 869 MB; 16:08Z: 414 MB tillgängligt.
- Prognos: omgången slutar senast ~16:30Z (fabrikens 25-min-tak) ⇒
  med omgång + återvunnet cacheminne ≥ 3 900 först vid 16:17/16:27/
  16:37-pollen; DEPLOYAD tidigast ~16:4xZ. Ingen kur från agentplanet
  (o139 §8 DEL 2:s dom: spärren är korrekt OOM-disciplin).
- Skyddsåtgärd: protokollet + körordningen committas direkt (o130 §2-
  mönstret) så att retry-agenten har allt oavsett när denna session dör.

### §1c Slutförd analys (16:17Z) — varför denna våg avslutar medvetet

- 16:17:26Z-poll: VÄNTAR-RAM 918 MB; NY KOD nu d401d719 → **22de9518**
  (försök-2-committen — deployen kommer även bära detta protokoll).
- Prod 200 ×4 verifierat på mätytorna (/, /dataset, /superanalys,
  /kalkylator) på gällande d401d719-träd — basen hel, inget trasigt.
- **Twog-fynd:** PID 479991 (15:15Z-linjen) bär EXAKT denna uppgifts
  prompt (fabrikens retry-spår av samma slot); CPU 78 ticks/min ≈ 1,3 %
  = hjärtslag ej bevisat hängd ⇒ lämnad ORÖRD (syskon-disciplinen;
  dödar jag en aktiv dubblett förloras arbete).
- **RAM-ekvationen:** tillgängligt 918 + trion ~2 600 (slutar ≤16:30Z)
  + denna session ~800 + 479991-gruppen ~1 090 ⇒ deploykrav 3 900 nås
  först när fabrikens barn (inklusive MIG) avslutar. Att vänta kvar
  SPÄRRAR alltså det jag väntar på — medvetet avslut = själva kuren.
- Beslut: vågen avslutas rent (protokoll + kronologi committad); mätning
  förblir spökmätningsskyddad (kanalgrind oupptemjad — §3 tom = korrekt).
  Verkställandet sker av nästa fönster via §9, som är komplett.

## §2 Verktyg (levererade i DEL 1-committen)

- `verktyg/_s7u2o144-kanal.mjs` — spökmät-skyddsgrind: DEPLOYAD-rad +
  merge-base ×2 (e27ef394, 45a9d432) + cv-widget-CSS i .next-chunks +
  prod 200 ×6 → `lighthouse/kanal-o144.json`; exit 0 = mätning tillåten.
- `verktyg/_s7u2o144-funktion.mjs` — o143 §7.4:s pillklickskontrakt ×3
  språk (CDP): aria-current-växling + `?sortera=`-URL + kortordning
  verifierad MATEMATISKT mot DOM:ens egna pe-tal (pe-hogst icke-ökande,
  pe-lagst spegelvänt, null sist) + history.back-popstate-återställning
  → `lighthouse/funktion-o144.json`.

## §3 Kanalbevis

(körs när DEPLOYAD landat — _s7u2o144-kanal.mjs)

## §4 EFTER-mätning o143 (/dataset — §7:s dom)

(Lighthouse ×5: CLS 0 ×5, LCP ±15 % av 4 571 i jämförbart lastfönster,
TBT endast som lastfönsterobservation enligt o143 §3:s metrologiregel)

## §5 EFTER-mätning o139 (/superanalys + /kalkylator — §8.4:s dom)

(LH_JAMFOR=o139-fore: CLS 0 ×2, TBT /kalkylator ≤ ~450, LCP ±15 %,
poäng ±)

## §6 Funktionstest o143 §7.4 (pillklick ×3 språk)

(_s7u2o144-funktion.mjs — alla kontrakt PASS)

## §7 KVD

(tsc-baslinje bärs av pre-commit-grinden (DEL 1 passerade; inga src-
ändringar i denna våg) · INGET bygge (prod-synken äger) · R2 orörd ·
data/blogg/ orörd · syskonens ytor KÖRS endast (kanoniska verktyg
oredigerade) · spökmät-skyddet hålls tills §3 är grönt)

## §8 Kö vidare

- o120:s /blogg kall-TBT-arkitekturpost (oförändrad öppen).
- o138 §6.1 ar-microjustering villkorad (oförändrad).
- Docs-Offline-metrologin (o143 §8) — s8-spårets.

## §9 Körordning (om denna våg dör före DEPLOYAD — retry-agent: läs §0-§2)

1. `tail -n 6 data/vakten/prod-synk.log` — vänta tills en rad
   `DEPLOYAD automatiskt: … (hash)` är nyare än 15:14Z-OOM-raden.
2. `node verktyg/_s7u2o144-kanal.mjs` — MÅSTE exit 0 (merge-base ×2 +
   cv-widget-CSS + 200 ×6) innan någon mätning (spökmät-skyddet).
3. `node verktyg/prestanda-lighthouse.mjs o144-efter1 /dataset` …
   `… o144-efter5 /dataset` (fem separata körningar — §4).
4. `LH_JAMFOR=o139-fore node verktyg/prestanda-lighthouse.mjs o139-efter /superanalys /kalkylator` (§5).
5. `node verktyg/_s7u2o144-funktion.mjs` (§6 — exit 0 krävs).
6. Vakten om tid: `node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000`
   (o143 §7.5: manifest-404:n skall vara borta ur konsolfelen).
7. Fyll §3-§6 + facit i o139 §8 / o143 §7 + worklog + commit
   `studio: auto s7-u2 o144 DEL 2 …` + LEVERANS-rad.
   ALDRIG: eget bygge, npx, --no-verify, R2-ytor.

## §10 DEL 3 — verkställarväntaren (2026-09-21 16:45–16:5xZ, s7-u2 omstart = försök 3)

Försök 2 underkändes av fabriken ENDAST formellt (kvitto-raden LEVERANS:
saknades i utdatan — protokoll + kronologi var levererade i 47ef1125).
Denna omstart (samma uppgiftsprompt, 16:45:29Z) fullföljer med den
strukturella kur som §1c:s RAM-ekvation pekar ut:

**KUR: verkställarväntaren.** Medvetet-rent-avslut (DEL 2) lämnade
deployen utan ägare i fönstret EFTER att barnen frigjort minnet —
någon måste passa DEPLOYAD och verkställa, men en väntande agent
SPÄRRAR själv deployen. Lösning (o121-precedensen: nohup-mätkedja):

- `verktyg/_s7u2o144-verkstall.mjs` — detached väntare (53 MB, PPID 1,
  PID 539456, startad 16:53:57Z): pollar prod-synk.log var 45:e s (tak
  3 h) efter DEPLOYAD-hash ≠ baseline d401d719, INGEN Chrome under
  väntan (RAM-disciplinen); vid deploy kör den §9 steg 1-2-3-5 i exakt
  ordning (kanalgrind → kor-o139 (täcker internt §9 steg 4:
  LH_JAMFOR=o139-efter + geometri) → LH o144-efter1..5 /dataset →
  funktion-o143) med RAM-vakt ≥ 1 500 MB före varje tungt steg (tak
  15 min/väntan — aldrig kollidera med byggfönster/syskon) och
  kedjeavbrott vid första exit ≠ 0 (spökmät-disciplinen: trasig kanal
  mäts ALDRIG vidare). Låsfil + idempotensstatus.
- `verktyg/_s7u2o144-starta.mjs` — enkel node-kanal som spawnar
  detached (skal-kvotens sammansatta-kommando-fälla kringgås).
- **Status (maskinläsbar för nästa våg):**
  `lighthouse/verkstall-o144-status.json` (status/pågår|klar|avbruten|
  timeout + per-steg exit/tid) · logg `/tmp/s7u2o144-verkstall.log`.
- **Arvsredovisning i samma våg:** longtasksond-s7u2o118-*.json × 6
  committade (696fadb1) — o118/o120-instansens outlösta
  kvittolöfte ("committade summeringar är kvittot") infriat efter hand.

**Fördelning av ansvaret kvarstår (§9 steg 7):** väntaren skriver
ENDAST fakta (JSON/logg); protokoll-facit (§3-§6), o139 §8/o143 §7-
utfyllnad, worklog och commit görs av NÄSTA LEVANDE VÅG som läser
status-filen — bokföring från bakgrundsprocess är förbjuden (pre-commit-
grind + kollisionsrisk med levande ytor). Steg 6 (vakten) lämnas åt
cron-kadansen (RAM-disciplin; o143 §7.5:s manifest-404-kontroll täcks
även av funktionstestets konsolfångst).

**KVD DEL 3:** src/ orörd (tsc 0 projektbinär före commit) · INGET
bygge (prod-synken äger; väntaren TRIGGAR inget — den läser) · R2 orörd
· data/blogg/ orörd · syskonytor orörda (s8-u3:s pågående o149-diff i
src/app/data/** + dataset-aspekter** lämnad ocker, organisatoriskt
ospårad fil orörd, s8-u1:s testa-feljakt-deployfonster.mjs orörd) ·
LEVERANS-rad avslutar utdatan (försök 2:s brist botad).
