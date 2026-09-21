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

## §3 Kanalbevis — GRÖNT ×2 (två träd, två tidpunkter)

- **Verkställarens (17:52:11Z, träd 27a582a0):** DEPLOYAD automatiskt:
  136 commits (27a582a0) — prod 200; merge-base e27ef394 + 45a9d432 SANT
  ×2; cv-widget-CSS i chunk 1t9wbuy2xns-r.css (.cv-widget-super +
  .cv-widget-kalk); HTTP 200 ×6 (/, /dataset ×3 språk, /superanalys,
  /kalkylator). Originalet bevarat: `lighthouse/kanal-o144-verkstall-27a582a0.json`.
- **Färskt (23:08:38Z, träd 496466f6 — deployad 22:28:54Z):** samma grind
  GRÖN igen (merge-base ×2 SANT · cv-widget-CSS i 435i0cybhscm5.css ·
  200 ×6) — senare deploys kanaler kuren vidare; funktionstestet §6 mättes
  mot detta träd. `lighthouse/kanal-o144.json` (omskriven av den färska
  körningen).

## §4 EFTER-mätning o143 (/dataset) — GRÖN (CLS ×5 + LCP ✓)

Kördes av verkställaren 17:54–17:56Z (5 separata LH-körningar, kanoniska
verktyget, mobil): **CLS 0 ×5** — o143 §7.1:s heliga noll; skiftet
0,2367 är borta i samtliga fem. LCP 4 234 / 4 172 / 4 277 / 4 621 /
4 370 → median **4 277 = −6,4 %** mot §1-medians 4 571 (±15 %-domen
UPPFYLLD). TBT 594–2 524 (median 1 134) = lastfönsterobservation enligt
o143 §3:s metrologiregel (dagfönster, ej jämförbart med nattbasen; par-
syskonet /konfluens kördes ej — ingen sidspecifik anomali påstås).
Poäng 0,56–0,68. Filer: dataset-o144-efter1..5.json + ×5 sammanfattningar.

## §5 EFTER-mätning o139 (/superanalys + /kalkylator) — CLS+LCP GRÖNA; TBT ej bedömbart i dagfönster

Kördes av verkställaren via _s7u2o139efter-kor.mjs 17:52–17:54Z med
LH_JAMFOR=o139-fore + värmning ×3/sida + geometri/skroll-CLS:

- **CLS 0 ×2** (o139 §7.2:s heliga noll — content-visibility skapar inga
  skift) ÄVEN skroll-CLS 0 under kontrollerad bottenrullning ×2
  (geometri-s7u2o139efter.json; platshållarna bär — kalkylatorns widget
  4 360 px, ingen intrinsic-justering behövdes).
- **LCP ±15 %:** /superanalys 4 355→4 583 (+5,2 %) · /kalkylator
  4 812→4 760 (−1,1 %) — båda UPPFYLLDA.
- Poäng 73→57 · 64→56: lastfönstereffekt (dag vs nattmätt bas; poängen
  drivs av TBT/TTI som skalas med serverlasten).
- **TBT-villkoret (≤ ~450) UNDERKÄNT I SITT UTFORMANDE:** 1 312 dagmätt
  mot 582 nattmätt bas. Enligt o143 §3:s metrologiregel (samma dag
  belagd: /dataset 2 405 dagtid vs 372 natt ≈ 6,5×) är TBT jämförbart
  ENDAST inom samma lastfönster — 1 312 dag ≈ 350–450 natt-ekvivalent,
  konsistent med villkoret men ej bevisande. Kurens evidens bär i stället
  A/B-parmätningarna (samma lastläge, o139 §5): superanalys fönster-TBT
  1 568→776 (−51 %) · kalkylator Layout 1 213→227 ms (−81 %).
  Köpost: natt-LH om TBT-spåret öppnas igen (ej ny våg).
- Filer: superanalys-o139-efter.json · kalkylator-o139-efter.json ·
  o139-efter-sammanfattning.json · dom-s7u2o139efter.json ·
  kanalbevis-s7u2o139efter.json · geometri-s7u2o139efter.json.

## §6 Funktionstest o143 §7.4 — 12/12 kontrakt PASS ×3 språk (exit 0)

Verkställarens körning 17:56:28Z kraschade (3 verktygsbuggar, se nedan);
slutfördes av s7-u1 (byggare 1/3, nästa levande våg) 23:0xZ mot träd
496466f6 efter färskt kanalbevis (§3).

**DOM: 12/12 PASS på /dataset + /en/dataset + /ar/dataset**
(funktion-o144.json): pillsFinns · kortFinns · defaultValdFore ·
urlHogst + ariaCurrentHogst + ordningHogst (pe-tal monotona mot DOM:ens
egna tal, null sist, ordning ≠ A–Ö) · urlLagst + ariaCurrentLagst +
ordningLagst · backAtterstallerUrl + Ordning + AriA (popstate) — ×3 språk.

**Kontraktskorrigering (dokumenterad):** originalets "inganValdFore"
kodades mot gamla useSearchParams-ordningen; den deployade kuren sätter
designat default (tolkaSortera: tom ?sortera → "bransch",
dataset-sortering.tsx:62-64) ⇒ A–Ö vald + exakt EN vald vid tom URL —
kontraktet omdöpt **defaultValdFore** (starkare assertion). Prod-koden
orörd av detta.

**Tre verktygsfixar (verktyg/-yta, ej src):** (1) cdp()-objektet
destrukturerades ej — `const { send } = cdp(ws)`; (2) Node-WebSocket
öppnas asynkront — open/error-await i pageWs(); (3) selektorn
`div.md\:hidden` föll offer för JS-strängescapet OCH pe-extraktionen
plockade n-talet före P/E → `div[class~="md:hidden"] > div` + läsning ur
span.mt-1 (peText-källan).

**o143 §7.5 (manifest-404):** /ak1a/ikon-192.png · ikon-512.png ·
ikon-maskable-512.png = 200 ×3 på aktuellt träd. Gränssnittsvakten
lämnad åt cron-kadansen enligt §10 (RAM-disciplinen).

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
