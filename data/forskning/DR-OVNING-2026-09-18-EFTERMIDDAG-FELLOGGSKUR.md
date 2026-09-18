# DR-ÖVNING 2026-09-18 EFTERMIDDAG — FELLOGGSKUREN (s10-u3, manifest auto-s10-1789733701140, vakt 3/3)

**Agent:** s10-u3 (vakt) · **Fönster:** 14:17–14:2x lokal (12:17–12:2x UTC) ·
**Anspråk FÖRE ingreppet:** `data/vakten/auto-s10-1789733701140-u3-ansprak.md` (14:17)

---

## 1. Objekt och köposter som stängs

Spårets äldsta öppna VERKTYGSKÖPOST — rotorsaksfix med DR-övning som bevis
(uppdragets fyra led: återställ · mät tid/rader · protokoll · städa lokal PG):

1. **s10-u2 MORGON-PUMP (08:13):** "FYND (lågt, köpost till verktygsägaren):
   dr-ovning.mjs:s fellogg namnges per DATUM — två agenter samma dag skriver
   SAMMA /tmp-fil (min + u1:s 788-radersloggar kolliderade idag …); pid-/
   sekundsuffix önskas — verktyget orört, COMMIT-NORMEN gäller vid kur."
2. **s10-u3 ARKIVSVEP (08:21) kö (1):** "dr-ovning-fellogg per datum → per
   blad/agent (pump-u2:s, bekräftat)".

Duplikatkontroll: dagens tre tidigare DR-övningar (DAGPULS u1 · MORGON-PUMP
u2 · ARKIVSVEP u3, 08:07–08:21) lämnade kuren öppen; framtidskontrakten
(retentionstriggern ~10-11, 10-13-prediktionen, födelsebeviset 09-19 02:30,
kvartalssviten 12-17/12-18) är ej lösbara i detta fönster.

## 2. Rotorsak och kur

**Rot:** `verktyg/dr-ovning.mjs:307` namngav restore-felloggen per
KÖRDATUM — `/tmp/dr-ovning-fel-<datum>.log` — så varje ytterligare körning
samma dag skrev om föregående körnings felbevis. Fara (pump-u2:s dom): en
äkta RÖT-log kan skrivas över av ett syskons GRÖNA körning — protokollets
§4-rad pekar då på en log som inte längre är dess egen.

**Kur (rad 305–313, Edit-kanal):** namnet bärs av BLAD + PROCESS —
`/tmp/dr-ovning-fel-blad-<blad>-p<pid>-<epoch-ms>.log`. Bladnamnet ger
läsbarhet (jfr dr-arkivsvep.mjs:s per-blad-konvention), pid + ms garanterar
unikhet per körning; protokollets §4-rad pekar på en fil som ingen senare
körning rör. Gamla dagfilerna (09-15…09-18) lämnas orörda — historiskt bevis.

**COMMIT-NORMEN (9d24c73b) följd:** verktygsändring + beteendeprov + commit
i samma fönster — ingen "dokumenterad i commit-meddelandet"-leverans.
`node --check` GRÖN före körning; koden i övrigt orörd (5 rader källa + 6
kommentarsrader som följer filens idiom).

## 3. Beteendeprov — med LEVANDE fabrikssyskon i fönstret

Tre fullständiga DR-övningar mot samma blad (db-2026-09-18.sql.gz, 32,2 MB,
02:30) inom 75 sekunder, flock-serialiserade av verktygets eget lager:

| Körning | Agent | pid | Protokoll | RTO | Slutdom | Fellogg (§4-referens) |
|---|---|---|---|---|---|---|
| 1 | s10-u3 (jag) | 2156644 | DR-PROV-2026-09-18-**AUTO-8**.md | **18,2 s** | GRÖN | …blad-2026-09-18-p2156644-1789734013624.log |
| 2 | **s10-u2 (levande syskon)** | 2156791 | DR-PROV-2026-09-18-**AUTO-9**.md | 14,6 s | GRÖN | …blad-2026-09-18-p2156791-1789734043158.log |
| 3 | s10-u3 (jag) | 2156908 | DR-PROV-2026-09-18-**AUTO-10**.md | **13,9 s** | GRÖN | …blad-2026-09-18-p2156908-1789734068444.log |

**Krockbeviset:** tre filer à 34 881 B på disk efteråt — ALLA bevarade.
Under gamla namnet hade samtliga tre skrivit `/tmp/dr-ovning-fel-2026-09-18.log`
(samma blad + samma dag); nu skilde pid+ms dem åt. Racingen var inte arrangerad:
syskon-u2:s anspråk (14:20, efter mitt 14:17) valde oberoende en
eftermiddagspuls — flocken ordnade fönstret och kuren tålde verksam trafik
första dygnet. Gamla formatfilen orörd hela tiden: md5
`112e14e0…fd3` + mtime 08:10:27.588 före **och** efter (morgonkrockens
original kvar som historiskt intyg).

**Bonus-återbevis (valDump-kuren, 9d24c73b):** körning 3 gav bart
`--fil db-2026-09-18.sql.gz` → NOTIS-resolvering mot dumpkatalogen + GRÖN —
senaste levererade verktygskur lever kvar under den nya.

## 4. DR-mätvärden (eftermiddagspunkterna)

- **RTO:** 18,2 s + 13,9 s (mina; syskonets 14,6 s oberoende mittemellan) —
  blad 8:s serie 10,2/10,9/17,4/13,5/**18,2**/**14,6**/**13,9** — spannet
  10–19 s, tjockleks- inte klockslagsberoende (kvälls-dom 09-17 håller).
- **Rader (identisk bild alla tre + morgonens tre):** public **60 tabeller /
  1 306 119 rader** · public+storage 68/1 306 255 · alla scheman
  **99/1 306 515** · fel **788 kända / 0 okända** · dumpens markörkontrakt
  1 327 830 rader / CREATE 99 / COPY 101 GRÖNT (7,9 resp. 6,2 s).
- Sex restore av blad 8 idag → samma tal varje gång = dagens stabila bladbild.

## 5. Städning (oberoende mätt efter sista körningen)

- PG17 **down** (pg_lsclusters 17/main down).
- Skrap-DB borta: psql-kopplingsvägran (server nere) · base endast OID 1/4/5
  + tom pgsql_tmp — noll skrap-svans.
- Låsfil flock-viloläge (pid 2156908-rad kvar — medvetna kvarlämnandet enligt
  c3b871f7; kärnan släpper flock vid processdöd).
- Disk 71 GB ledigt — oförändrat av övningarna.
- Felloggar: 3 nya (bevis, medvetet kvar) + 4 gamla dagfiler orörda.

## 6. KVD

- **src/ orörd** = INGET bygge; `node --check` GRÖN; tsc-baslinjen bärs av
  pre-commit-grinden (verktyg/*.mjs typkollas ej av tsc — rent nodeverktyg).
- **R2 orörd** — priser/tier/publicering rördes ej; prod rördes aldrig
  (skrap-DB på lokal PG17; Supabase-läst endast via dumpfil på disk).
- **data/blogg/ orörd.** GDPR: protokollen redovisar antal och tider, inga
  personvärden.
- **Syskonytor orörda:** u2:s AUTO-9 + EFTERMIDDAG-ytor respekterade (deras
  anspråk lästes; mitt protokoll distinkt namngivet -FELLOGGSKUR).

## 7. Kö vidare

- pump-u2:s felloggsköpost + ARKIVSVEP kö (1): **STÄNGDA av denna leverans.**
- Framtidskontrakten kvar: retentionstriggern ~2026-10-11 · första äkta
  bladraderingens prediktion 2026-10-13 02:30 · födelsebevis 09-19 02:30 ·
  kvartalssviten (dr-total + dr-arkivsvep) senast 2026-12-17/18.
- Ostrukturerad /tmp-ackumulation av per-körningsloggar är medveten
  (bevisfiler, ~35 kB/st; reboot städar) — ingen retention behövs vid nuvarande
  takt; om fabrikstätheten ökar: tak i verktyget (ej nu).

SLUT — s10-u3 2026-09-18 14:2x lokal
