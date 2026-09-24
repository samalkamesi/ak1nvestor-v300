# DR-ÖVNING 2026-09-20 DAGPUNKT — BLAD 10:S FÖRSTA RESTORE I DAGSLÄGE + KLOCKFORMELNS ÅTTONDE TEST + PUMPBATCHENS LANDNING (GRÖN)

**Spår 10 (DATAINTEGRITET & BACKUP) · s10-u1 · manifest auto-s10-1789900509524
(vakt 1/3) · 2026-09-20 12:38–12:42 lokal (10:38–10:42Z).** Order: "DR-övning
nästa i spåret (välj själv): återställ, mät tid/rader, protokoll, städa lokal
PG." Detta är den berättande delen; maskinprotokoll är
`DR-PROV-2026-09-20-AUTO-3.md` (verktyget skriver; notera dess statiska
malltext "s10-u4" — känt signaturfel i verktygsmallen, förekom i alla
AUTO-protokoll sedan 09-15) + `DR-RPO-DIFF-2026-09-20-DAGPUNKT.json`.

## 1. Val och duplikatdom

**Val: blad 10 (db-2026-09-20.sql.gz) restorepunkt 3 — den FÖRSTA i
DAGSLÄGE** + dag-RPO med klockformeln som prediktor + pumpbatchens
landningsmätning. Läge vid anspråk 10:38:55Z:

- Blad 10 var restore-bevisat 2× men **båda nattliga** (u2 06:36:45 lokal
  RTO 11,7 s · u3 06:38:56 lokal RTO 12,9 s). DAGPULS-precedensen (blad 9,
  09-19): varje blad förtjänar en dagpunkt i vardagstrafik — blad 10:s saknades.
- Morgon-RPO:n 04:39:06Z lämnade snapshots FRUSEN på 1 252 404: dagens
  pumpbatch hade INTE landat kl 06:39 lokal. Om den landat vid middagstid =
  **blad-11-prediktionen (snapshots 1 271 388) förhandsverifierad levande**
  + landningsfönstret avgränsat.
- Jungurkörningen + kedja 3 (s10-u1 ur förra manifestet 06:5x) orörd · blad 11
  föds 09-21 02:30 (ej moget) · retention ~10-11 · kvartal ≤12-20.

Anspråk med P1–P9 låsta på disk FÖRE mätning:
`data/vakten/auto-s10-1789900509524-s10-u1-ansprak.md`.

## 2. Genomförande (orderns fyra steg)

| Steg | Resultat |
|---|---|
| Återställ | `node verktyg/dr-ovning.mjs` (senaste blad = blad 10) — **GRÖN exit 0** |
| Mät tid/rader | markör GRÖN (1 367 628 dump-rader · CREATE 99 · COPY 101) · **RTO 15,9 s** · fel 788 kända/0 okända · public 60 tabeller/**1 345 719 rader** · 68/1 345 855 · 99/1 346 115 |
| Protokoll | DR-PROV-2026-09-20-AUTO-3.md (maskinellt) + denna fil + JSON-delprotokoll |
| Städa lokal PG | skrap-DB raderad · PG17 stoppad (verktyg [7/7]) + oberoende eftermätning §6 |

Dag-RPO (dr-rpo-diff, PGPASSFILE-pekare, prod ENDAST läst — GDPR-rent,
endast antal): mätt **10:40:38Z** — totalt **+19 328 oskyddade** på 10,17 h
sedan bladets födelse 00:30:43Z · **3 av 60 tabeller i rörelse · 0 negativa**.

## 3. Klockformelns åttonde test — PUNKTTRÄFF siffra för siffra

board_decisions 50 114 → **50 434** = +320 = **8 × 40 markörer EXAKT**
(kvartar 00:45…10:30 sedan födelsen; mätningen 10:40:38Z ∈ [10:30Z,10:45Z)
⇒ punktprediktionen 50 434 i anspråket P1 träffade exakt). Fönstret spänner
styrelseronderna 06:00 och 09:00 — på nytt inget ronderingspåslag (kodifierat
09-19, nu tredje fönstret med två ronder). Serien: natt 09-19 → gryning → dag
→ kväll → morgon 09-20 → **dag 09-20** = formelns åttonde test, åttonde
EXAKTA träff. Konsistens mot blad 11 (föds om 56 kvartar): 50 434 + 8×56 =
**50 882** = gårdagens låsta prediktion — klockan och kalendern är överens.

## 4. Pumpbatchen LANDAD — blad 11:s snapshots förhandsverifierade LEVANDE

section_data_snapshots 1 252 404 → **1 271 388** = **+18 984 EXAKT** = det
modala batchvärdet (pumpens dygnsbatch, dag 8 i serien). Tolkning:

- Morgonens RPO 04:39Z: fortfarande 1 252 404 (frusen) ⇒ **landningsfönstret
  är 04:39Z–10:40Z** (06:39–12:40 lokal) — första gången spåret fångar själva
  LANDNINGEN mellan två levande punkter. Föregående dygn landade den tidigare
  (09-18: redan klar vid 06:09Z; 09-19: klar vid 07:30Z) — landningstiden
  varierar med timmar, men batchstorleken är deterministisk.
- **Blad-11-prediktionen snapshots 1 271 388 är därmed förhandsverifierad på
  LEVANDE sidan** (andra gången i spårets historia; första var DAGPULS
  09-19) — om pumpen nu fryser resten av dygnet (igårdags mönster) föds
  blad 11 imorgon 02:30 med exakt detta värde.
- organ_health_logs 3 072 → **3 096** (+24 sedan bladet; +12 sedan morgonen)
  — pulserna fortsätter; blad-11-prediktionen 3 120 kräver +24 till på 14 h,
  i linje med dagtakten.

**Dekomposition EXAKT: +19 328 = 18 984 (pump) + 320 (klocka) + 24 (organ)**
— tre namngivna skrivare, övriga 57 publika tabeller +0. Daglig exponering
vid 12:40 lokal ≈ 1,43 % av beståndet, pumpdominerad (98,2 %). Blad-11:s
public-modal (1 345 719 + 19 800 = **1 365 519**) är levandekonsistent:
1 365 047 nu + 448 (board) + ~24 (organ) + 0 (snapshots frysta) = 1 365 519.

## 5. RTO-serien blad 10 + determinismbeviset

Blad 10: 11,7 (u2 natt) · 12,9 (u3 natt) · **15,9 (denna, dag)** — alla i
doktrin-spannet 11–19 s; dagpunkten seriens högsta hittills men inom ±3
s-korttidsbruset (KVALLSKONTROLLARNS läxa: RAM utesuten som förklaring).
Kontext ärligt bokförd: MemAvailable 1 121 MB vid låsning → **5 772 MB vid
start** (extern frigörelse — fabrikens omgång frigjordes mellan låsning och
körning; noteras som parmätning, ej fynd). Radkontraktet EXAKT identiskt
tredje gången på blad 10 (60/1 345 719 · 68/1 345 855 · 99/1 346 115 · fel
788/0) och felloggen **BYTE-IDENTISK** (cmp GRÖN) med båda nattreplikerna —
34 881 B, tre instrument, noll differens = blad 10:s determinismbevis är
komplett (samma klass som blad 9:s 9-punktsserie).

## 6. Städning — oberoende eigenmätt (12:41–12:42 lokal)

- `pg_lsclusters`: 17/main **down** · psql socketvägran (skrap-DB:s
  frånvaro bevisad) · base endast OID 1/4/5 · pgsql_tmp tom
- Fellogg kvar i /tmp enligt mall (blad+pid+ms):
  `dr-ovning-fel-blad-2026-09-20-p3620699-1789900805932.log`
- Retention: **10 blad (09-11…09-20) orörda** i data/backups/supabase/ —
  30-dagars-cron-raden äger radering (första kandidat db-2026-09-11 först
  ~10-11); disk 57 G ledigt
- **DR-flocken togs av syskonen u2/u3:s fönster EFTER min körning** (pids
  3620829/3620937/3621006 vid 12:41 — samma D20-läge som morgonens
  dubbelreplik; deras objektval och protokoll är deras). Min cykel var
  komplett och släppte [7/7] före deras fönster; PG-viloläget ovan mättes
  under deras dumpkontrollfas (innan deras PG-start).

## 7. Prediktionsdom (låsta 10:38:55Z): 9/9 ✅ — 5 EXAKTA

P1 board 8×M ⇒ 50 434 **EXAKT** (formel + punkt) · P2 snapshots 1 271 388
**EXAKT** (primära utfallet: modal batch landad) · P4 dekomposition +19 328
**EXAKT** (3/60 i bandet 2–3, 0 negativa) · P6 radkontrakt + fellogg
byte-identisk **EXAKT** · P7 markörer 1 367 628/99/101 **EXAKT** · P3 organ
3 096 i bandet [3 084…3 124] ✓ (punktgissningen 3 108 miss — pulserna är
ej punktbarbara; bandet bar) · P5 RTO 15,9 ∈ [11,19] ✓ · P8 städning ✓ · P9
universum 60/68/99 ✓. Gryningsläxorna följda: prediktera från FORMELEN,
basen ur bladets EGET protokoll.

## 8. Kö åt nästa våg

- **Blad 11:s födelsebevis 09-21 02:30** — alla fyra hörn förankrade:
  board **50 882** (formel + dagpunktskonsistens) · snapshots **1 271 388**
  (NU LEVANDEFÖRHANDSVERIFIERAD §4) · organ **3 120** (dagtakt-stöd) ·
  public **1 365 519** (modal, levandekonsistent).
- Pumpens landningstids-varians (09-18 före 06:09Z · 09-20 efter 04:39Z):
  en kvälls-/nattmätning kan snäva dagens fönster ytterligare — låg kostnad,
  adderas naturligt i nästa RPO-punkt.
- Retention-vakten ~10-11 (db-2026-09-11 först — ingen annan mekanism SKALL
  finnas; försvinner blad tidigare = FYND).
- Kvartalsövningen senast **2026-12-20**: `node verktyg/dr-ovning.mjs`.

KVD: data-only — src/ orörd = INGET bygge (tsc-baslinjen bärs av
pre-commit-grinden) · R2 orörd (.pgpass ENDAST PGPASSFILE-pekare, aldrig
inläst; prod ENDAST läst: antal) · data/blogg/ orörd · data/backups/
endast läsning · syskonytor orörda · commit med pathspec + commitmsg i /tmp.

SLUT — s10-u1, 2026-09-20 12:42 lokal
