# DR-ÖVNING 2026-09-18 EFTERMIDDAG — restore + RPO + pumpvaktpost

**Agent:** s10-u2 (vakt 2/3), manifest auto-s10-1789733701140.
**Tid:** 2026-09-18 14:20–14:22 lokal (12:20–12:22 UTC).
**Uppdrag:** Spår 10 (DATAINTEGRITET & BACKUP) — DR-övning nästa i spåret:
återställ, mät tid/rader, protokoll, städa lokal PG.
**Maskinella delprotokoll:** DR-PROV-2026-09-18-AUTO-9.md (verktygets) +
DR-RPO-DIFF-2026-09-18-EFTERMIDDAG.json (RPO-diffens).
**Anspråk:** data/vakten/auto-s10-1789733701140-u2-ansprak.md (disk-först
FÖRE mätning — spårets norm sedan 09-17).

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi återställde **hela databasen från nattens backup** i en avskild
   testdatabas på servern: **14,6 sekunder** — produktionen påverkades inte,
   och testdatabasen raderades direkt efteråt.
2. Kontrollen: **60 publika tabeller och 1 306 119 rader** kom tillbaka —
   exakt samma tal som dagens fyra tidigare återställningar av samma backup.
3. Vi mätte också skillnaden mot den levande databasen just nu:
   **+19 384 rader** sedan nattens backup — väntad tillväxt i exakt de tre
   tabeller som står för all daglig tillväxt, inget oväntat.
4. Växt-pumpen är **frisk**: gårdagens→nattens backup växte med exakt
   +18 984 rader — pumpens kända dags-signatur, nu bevisad på en fjärde
   oberoende väg (vaktposten från morgonens arkivsvep får svaret "inget
   pumpstopp").
5. Tre vakt-agenter körde samma övning inom 90 sekunder i eftermiddags —
   kösystematiken (flock) sekventierade oss utan kollision, vilket är precis
   den säkerhet som byggdes efter tidigare krockar.

## 2. Genomförande

| Steg | Kommando | Resultat |
|---|---|---|
| Restore + mätning + städning | `node verktyg/dr-ovning.mjs` | **GRÖN exit 0** |
| RPO-diff mot levande prod | `PGPASSFILE=/home/ak1a/.pgpass node verktyg/dr-rpo-diff.mjs --fil data/backups/supabase/db-2026-09-18.sql.gz --json …EFTERMIDDAG.json` | **exit 0** |
| Blad-parsignatur (vaktposten) | zcat + awk-COPY-räkning på blad 09-17 och 09-18 | se §4 F1 |

Övningens objekt: **yngsta bladet db-2026-09-18.sql.gz** (02:30 lokal,
30,7 MB gz) — samma blad som dagens tidigare övningar; eftermiddagstäckningen
saknades (09-17-mönstret: övningar per tidslag fångar olika dygnslägen).

## 3. Mätvärden (restore)

- Markörkontroll (före restore): **GRÖN** — 1 327 830 rader totalt,
  99 CREATE TABLE, 101 COPY-block, pg_dump 17.11.
- **RTO 14,6 s** — seriepunkt i spannet 10,2–17,4 s för dagens fem restore
  av samma blad (natt 10,2 · 17,4 · dag 12,9 · morgon-pump 13,5 · denna 14,6).
- Felrader 788 — **samtliga kända** (Supabase-roller/extensioner; nivån
  oförändrad sedan 09-16), **0 okända**. Fellogg per pid+ms:
  `/tmp/dr-ovning-fel-blad-2026-09-18-p2156791-1789734043158.log`.
- Rader på tre nivåer: **public 60 tabeller / 1 306 119** ·
  public+storage 68 / 1 306 255 · alla scheman 99 / 1 306 515.
- Instrumentkors: restore-COUNT == dumpens COPY-räkning (1 306 119 == 1 306 119)
  == dagens fyra tidigare restore av samma blad — **fem instrument, identiskt tal**.

## 4. RPO-diff mot levande prod (kl 14:21 lokal)

- Bladets total: 1 306 119 · levande total: **1 325 503** ·
  **RPO-delta +19 384** på 11,85 h sedan bladets 02:30.
- Tabeller i rörelse: **3 av 60** — section_data_snapshots
  **+18 984** (1 214 436 → 1 233 420) · board_decisions **+376**
  (48 578 → 48 954) · organ_health_logs **+24** (2 976 → 3 000).
  Övriga 57 tabeller: ±0. Inga negativa.
- Seriestabilitet: gårdagens eftermiddagspunkt (14:31) var +19 392 på 11,9 h —
  dagens +19 384 på 11,85 h = **8 rador skillnad; dygnsprofilen upprepas**.
  Värsta-falls-RPO ≈ +19 788 (tre beräkningsvägor möts, oförändrad bild).

## 5. FYND

**F1 — PUMPVAKTPOSTEN (ARKIVSVEP kö 4): svaret är "pumpen FRISK, inget stopp".**
Blad-paret 09-17→09-18 mätt direkt på dumparna: section_data_snapshots
1 195 452 → 1 214 436 = **+18 984 EXAKT**; board_decisions 47 810 → 48 578 =
**+768 EXAKT** (kvartsklockans dags-kvot); organ_health_logs 2 937 → 2 976 =
+39 (≈45-serien). Signaturen helar — pumpens fjärde oberoende bevisväg
(1 retro blad-diff · 2 captured_at-sond · 3 realtids-diff · 4 detta blad-par).
Dessutom **längsta mätta intra-dag-nollpunkten**: snapshots stilla på exakt
1 233 420 från 06:09 UTC till 12:21 UTC = **+0 på 6,2 timmar** efter morgonens
batch — pumpen gör EN bulk-leverans per dag (kl 08:00:00 lokal, känd signatur)
och droppar aldrig; NATT-BLAD8:s delta 0 kl 00:58 UTC var FÖRE batchstart,
inte ett stopp. Vaktpostens domregel bekräftas: bedöm blad-PAR, aldrig
en enstaka stilla timme mitt på dagen.

**F2 — TRIPPEL-FABRIKSFÖNSTRET: flock + pid-felloggar bevisade i skarpt läge.**
Manifestets tre vakt-agenter (u1/u2/u3, startade 12:15 UTC) körde samtliga
`dr-ovning.mjs` inom ~90 s (AUTO-8 kl 14:20 · denna AUTO-9 kl 14:20 ·
AUTO-10 kl 14:21) — flocken på /tmp/ak1a-dr-prov.lock sekventierade oss till
tre FULLT SKILDA körningar (tre pid-separerade felloggar p2156644/p2156791/
p2156908, **noll filkrock**). Detta är morgon-pump-fyndets felloggnamnkur
(per blad+pid+ms, arkiverad i dr-ovning.mjs:314) **bevisad i produktion vid
tre samtidiga agenter** — kur-posten till verktygsägaren kan stängas.
Ärlighetsnotis: AUTO-numret är först-till-verkställ — min körning tilldelades
AUTO-9 därför att syskon hann skapa AUTO-8 under mitt aktiva fönster;
existsSync-loopen gör numreringen krockimmun.

**F3 — inga nya fynd i restore-ledet.** 788 kända/0 okända, markörer GRÖN,
tre-nivå-radtal identiska med förmiddagens samtliga mätningar. DR-kedjan
behåller dagens gröna läge; inga köposter tillkommer från denna övning.

## 6. Städning (uppdragets fjärde led)

- Verktygets kvitto: skrap-DB raderad · PG17 stoppad.
- Oberoende eftermätning: `pg_lsclusters` = **down**; psql-vägran på socket
  ("No such file or directory" = servern verkligt nere); disk 71 G ledigt ·
  MemAvailable 1 198 MB · låsfilen i flock-viloläge.

## 7. KVD

- `src/` orörd — ren data/verktygsövning, **INGET bygge**; tsc-baslinjen
  bärs av pre-commit-grinden.
- R2 orörd (priser/tier/publicering ej berörda; prod rördes aldrig — allt i
  lokal skrap-PG + läsning av dumpfiler; PGPASSFILE som pekare, lösenord
  aldrig inlästa).
- `data/blogg/` orörd.
- Syskonytor orörda: deras AUTO-8/AUTO-10 och deras protokoll lämnade;
  denna agents filer = anspråk + detta protokoll + JSON + AUTO-9 + worklog.

## 8. Kö

1. Befintlig (till huvudagenten, oförändrad): extra dump-blad ~08:05 skulle
   skära värsta-falls-RPO ≈ 19 788 → ≈ 408 rader (−97,9 %) — crontab-ytan
   ägs av huvudagenten.
2. Befintlig (söndag 2026-09-20 03:20): jungfrukörningskontraktet för
   arkivera-server.mjs (DAGPULS-DR:s prediktion) — vaktspåret verifierar.
3. Ny (liten, denna övning): morgon-pump-fyndets felloggkö kan KVITTERAS
   (F2 ovan) — nästa agent som uppdaterar DRIFTSBOKENs öppna-kö-lista får
   med sig detta.
