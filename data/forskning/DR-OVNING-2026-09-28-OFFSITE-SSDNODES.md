# DR-ÖVNING 2026-09-28 KVÄLL — OFFSITE-KEDJAN PÅ SSD NODES (s10-u3)

**Körd av:** fabriksagent s10-u3 (manifest auto-s10-1790634304502, vakt 3/3)
**Objekt:** offsite-arkivets återställningskedja (3-2-1:led 3) + lokal-PG-viloläge.
**Utfall:** övningen hittade ETT AKTUELLT DR-FEL (arkivruin + trasig kärna),
kurerade rotorsaken och bevisade sedan hela kedjan GRÖN på det nya arkivet.

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi testade att återställa serverns **offsite-backup** (trådens alla
   meddelanden, all forskning, alla utkast) — och upptäckte att **dagens
   enda arkiv var trasigt**: fyra misslyckade försök under dagen hade
   skrivit en halvfärdig fil **över** dagens fungerande backup.
2. Vi hittade också att **databaskopian inuti backuppen var skadad**
   (den togs på fel sätt från en databas som skrivs samtidigt).
3. Båda felen är **fixade i grunden**: backupen skrivs nu färdig under
   ett tillfälligt namn och kontrolleras INNAN den får ersätta den
   föregående; databaskopian tas med databasens egen säkra metod och
   kontrolleras före arkiveringen. Ny backup skapad och verifierad.
4. **Återställningsbevis:** hela arkivet packades upp (177 s), databasen
   öppnades och gav **integrity_check "ok"** på 2,27 GiB — tråden kan
   återfödas från offsite-kopian.
5. Testdatabasen på servern (PG18) verifierades i viloläge efteråt;
   produktionen rördes aldrig (prod 200 hela kvällen).

## 2. Fynden (rotorsakade, med bevis)

### FYND A — arkivruiner skrev över fungerande arkiv
- Symptom: `tar -tzf` → "Unexpected EOF in archive"; `gzip -t` → OK
  (den dödade tar-processens gzip-barn hann skriva sin slutmarkör —
  därför döljer gzip-provet felet; tar-listningen avslöjar det).
- Logg: **fyra ETIMEDOUT samma dag** (02:57:42, 08:55:09, 14:54:45,
  20:55:14 — alla exakt 120 s efter snapshotraden = `timeout: 120_000`).
- Konsekvens: ruinerna hette samma som dagens fungerande arkiv
  (00:53:57, 775 MB) → skrev över det. **Enda arkivet på disk var
  obrukbart.** (Retentionen hade rensat äldre dagar — noll reserv.)
- Kur: **atomiskt kontrakt** — tar skriver till `.part.tar.gz`, hela
  strömmen läsverifieras (`arArkivLasbart`), rename till slutgiltigt
  namn sker FÖRST vid grönt. En misslyckad körning kan aldrig mer
  förstöra föregångaren.

### FYND B — db-snapshoten var en trasig kärna
- Symptom: `PRAGMA integrity_check` på diskens db-snapshot.sqlite
  (2,4 GB, 20:53) → "*** in database main ***" med invalid page
  numbers + out-of-order rowids.
- Rot: `fs.copyFileSync` på zcode:s **levande** db.sqlite (POSIX har
  inget fillås — kopieringen fångar ett pågående skriviläge).
- Kur: snapshot via **SQLite:s backup-API** (python3 `src.backup(dst)`)
  + **PRAGMA quick_check-grind** innan kopian får in i arkivet. Skarp
  körning: 57–68 s, quick_check ok. (u1:s öppna köpost
  "sqlite-djupverifiering" stängd: FULL integrity_check "ok" på den
  återställda kopian.)

### FYND C — kapacitetsdelen (varför 120 s räckte inte längre)
- db.sqlite har vuxit (2,4 GB) → källan ~2,6 GB → gzip -6 (default) är
  CPU-bunden: mätning på 256 MB verklig data gav ~8,4 MB/s in (-6) mot
  ~13,9 MB/s in (-1, +17 % arkivstorlek). 600 s-timeout räckte ej heller
  (part 705 MB/600 s vid första skarpkörningen).
- Kur v2: `GZIP=-1` via ren env-option (argv-formen ["-czf", mål, …delar]
  oförändrad — härdningen från o93 består) + timeout 1 200 s (~6×
  marginal) + **BACKUP-FEL ger nu exit 1** (första rundan loggade felet
  men lämnade exit 0 — pumporna kunde inte larma).

### FYND D — processfynd (dokumentärt)
- Ett parallellt syskon-/synk-steg återställde ocommittade
  verktygsändringar mitt i fönstret (22:37) — kuren skrevs om och
  committades omedelbart (787e1199 + 7ed20962). Lärdom för fabriken:
  **tidig commit = skydd**; arbete pågår-aldrig-committat är en yta som
  ser smutsig ut för syskonens städningsregler.

## 3. Bevis kedjan (det nya arkivet, 23:03)

| Steg | Resultat |
|---|---|
| Arkiv | ak1a-offsite-2026-09-28.tar.gz.tar.gz · 983 030 401 B (~938 MB) · SHA256 1be286f7…cd88b |
| Skapande | snapshot 68 s (quick_check ok) → tar GZIP=-1 → läsverifierad → rename (loggen 23:06:42) |
| P1 Integritet | tar -tzf GRÖN · **2 087 poster** (ruinen dog vid ~2 075 med EOF — u1:s kvällsräkenskap läste ruinens avklippta lista) |
| P2 Extraktion | **RTO 177 s** → 2 066 filer · 2 605 MiB |
| P3 Kärnan | db-snapshot.sqlite 2 434 011 136 B (2,27 GiB) på plats |
| P4 Kärnans hälsa | **PRAGMA integrity_check = "ok"** (full) · 24 tabeller · part 366 609 · message 88 774 · session 2 514 · tool_usage 92 583 |
| P5 Huvudtråden | huvudtrad.json parselbar (dict) · mal-state/trad-kontext/juridik-larm/audit (4 663 rader)/uppdragslogg på plats |
| P6 Trädjämförelse | arkiv == live EXAKT: forskning 1 467/1 467 · blogg-utkast 425/425 · kurser-tillagg 162/162 |
| P7 Säkerhetssvep | 0 träffar (.env/pem/key/rsa/p12/pfx) på alla 2 087 poster |
| P8 Lokal PG18 | **viloläge oberoende eftermätt**: 0 postgres-processer · port 55432 fri · base/ endast OID 1/4/5 (syskonets skrap-DB 22280 städad av dem) · DR-lås i viloläge |
| P9 Arkivet orört | SHA256 + mtime byte-identiska före/efter övningen · arbetet skedde på kopia i /tmp (nu borttaget) |

## 4. Prediktioner (låsta i anspråksfilen FÖRE mätning)

P1 ✓ · P2 ✗ (177 s mot <60 s — fel modell: räknade på -6-arkiv;
nytt band ~150–200 s för ~2,6 GiB innehåll under drift) · P3 ✓ (2,27 GiB
inom [0,5, 2,5] GB) · P4 ✓ · P5 ✓ · P6 ✓ (starkare än ≤: exakt lika) ·
P7 ✓ · P8 ✓ (villkorat under syskonets PG-fönster, slutmätt efter dess
stängning) · P9 ✓. **Dom: 8/9.**

## 5. Kö

- **Natten till 09-29:** pumpornas 02:52-körning kör KUR v2 första
  gången autonomt — morgonrond läser loggen (förväntad rad: "SKAPAD …
  läsverifierad").
- GitHub-push-benet förblir R2-köpost (känt sedan 09-19: kundens
  SSH-nyckel hos NewUserAK/AK1 — "push väntar"-raden loggas tyst).
- Retentionen bygger upp 7 dagar igen från dagens datum — första veckans
  granskning 2026-10-05.
- Offsite-restore repeteras med kvartalsövningen (DRIFTSBOKEN).

## 6. KVD

- src/ orörd → INGET bygge (tsc-baslinjen bärs av pre-commit-grinden;
  verifierad: commit 7ed20962 passerade grunden).
- R2 orörd (priser/tier/publicering ej berörda; nyckelfiler ej rördа —
  .pgpass ENDAST som PGPASSFILE-pekare i läsriktning, aldrig inläst).
- data/blogg/ orörd. data/backups/ ENDAST LÄST (P9 bevisat).
- Prod aldrig rörd (200 före/efter; inga pm2-operationer).
- GDPR: endast antal/räknade rader, inget innehåll utläst.

LEVERANS-KVITTO: verktyg/backup-offsite.mjs (kur v1+v2) ·
verktyg/testa-backup-offsite.mjs (24/0) · detta protokoll ·
DRIFTSBOKEN-notis · worklog-sektion.
