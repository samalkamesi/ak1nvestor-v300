# DR-ÖVNING 2026-09-18 DAGPULS — blad 8 i dagläge + pumpförutsägelsens dag-2-verifiering + kedja 3-källgapstelemetri (s10-u1, manifest auto-s10-1789711500221, spår 10 vakt 1/3)

Datum: 2026-09-18 · Fönster: 08:09–08:2x lokal (anspråk FÖRE ingreppet:
`data/vakten/auto-s10-1789711500221-u1-ansprak.md`) · Utförare: fabriksbarn s10-u1 (vakt).

## 0. Objektval (duplikatkontroll)

Restore-kärnan är 20+ gånger levererad; mot worklog + DRIFTSBOKEN + DR-* konstaterades
tagna: alla 8 blad (natt-/födelse-/morgon-/kväll-lägen), kedjorna 2/4/5/7, TOTAL ×3,
RPO-kurvan för 09-17 (07:43 · 12:31 · 14:40 · 21:09) + nattpunkterna 02:5x 09-18,
retentionens två beteendeprov, radräkningsformeln, TVÅ KLOCKOR, WAL-serien.

Kvar stod tre icke-duplikatvinklar som denna övning tar:

1. **DAGSLÄGES-restore av dagens blad** db-2026-09-18 — bevisat ENDAST i
   födelsetimmens nattläge (syskon-AUTO-2: 10,2 s · MORGON-PULS: 17,4 s, båda 02:5x–03:06).
2. **RPO dag 2** — gårdagens pumpförutsägelse (EN batch exakt 08:00:00,058 lokal ·
   18 984 rader) vilade på EN dags mätning; ingen dagpunkt för 09-18 fanns.
3. **Kedja 3-källgapets FÄRSKA telemetri** — gårdkvällens KÄLLCADCENSFYND
   (nyaste paket 09-16 13:40 · cron saknades · hybridkedja död sedan 09-09) behövde
   kvantifiering och omprövning mot dagens crontab-verklighet.

## 1. Restore (uppdragets bokstav — verktygets familjekontrakt)

```
node verktyg/dr-ovning.mjs --fil data/backups/supabase/db-2026-09-18.sql.gz
→ EXIT=0 (GRÖN)
```

- RAM-grind GRÖN vid start: MemAvailable 1 798 MB · 71 GB ledigt.
- [1/7] Markörkoll GRÖN: 1 327 830 rader totalt · CREATE TABLE 99 · COPY 101 ·
  pg_dump 17.11 — totalraden bekräftar MORGON-PULS:s radräkningsformel
  (1 306 515 + 6 266 + 15 049 = 1 327 830).
- [2/7] PG17 online (var stoppad — korrekt viloläge före).
- [4/7] **RTO 12,9 s (DAGSLÄGE)** · felrader 788 (kända 788, okända 0 —
  Supabase-GRANT-klassen, ofarliga enligt v98 F3).
- [5/7] public **60 tabeller / 1 306 119 rader** · public+storage 68 / 1 306 255 ·
  alla scheman 99 / 1 306 515.
- [7/7] Städning: skrap-DB raderad · PG17 stoppad (finally).

**DAGSKORSBEVIS på samma blad**: TRE oberoende restores av db-2026-09-18 med
IDENTISKA radtal (60/1 306 119) — natt 10,2 s · natt 17,4 s · dag 12,9 s.
RTO-serien: dagen hamnar mitt emellan nattlägena; spanning 10,3–23,9 s oförändrad,
alla under v98 F3:s 20,0 s-referens.

## 2. RPO dag 2 — pumpförutsägelsen VERIFIERAD EXAKT

`dr-rpo-diff.mjs --json` (mätt 08:10:47 lokal = 5,68 h efter bladets 02:30):

| Mått | Värde |
|---|---|
| Bladets total (dump-COPY) | 1 306 119 rader |
| Levande total (psql COUNT) | 1 325 291 rader |
| **RPO-delta** | **+19 172 oskyddade** |
| Tabeller i rörelse | 3 av 60 |
| section_data_snapshots | +18 984 (1 214 436 → 1 233 420) |
| board_decisions | +176 ≈ 31,0 r/h (kvartsklockan: serien 31,0–36,0) |
| organ_health_logs | +12 (episoden) |

**Läsande captured_at-sond** (doktrinerad COUNT-klass: endast antal + tidsstämplar,
inget innehåll; PGPASSFILE-pekare, .pgpass aldrig inläst):

```
idag-batch   | 18984 | 2026-09-18 06:00:00.078402+00  (= 08:00:00,078 lokal)
garden-batch | 18984 | 2026-09-17 06:00:00.058474+00  (= 08:00:00,058 lokal)
total-max    | 1233420 | max = 06:00:00.078402+00
```

**PREDIKTIONEN FRÅN 09-17 INFRIAD PÅ DAG 2**: pumpen levererar EN batch per dygn,
sekundexakt vid 06:00:00Z (20 respektive 58 ms in i minuten), med IDENTISK
batchstorlek 18 984 båda dagarna; total-max == diffens live-count 1 233 420
(korsbevis två instrument). Determinismen från EN dags mätning är nu TVÅ dagars
lag. Runbook-slutsatsen (MIDDAGS-DR 09-17) håller med förstärkt bevisning:
extra blad ~08:05 skär värsta-fallet från ≈19 788 till ≈408 rader (−97,9 %) —
och det gäller varje vardag, inte bara 09-17.

## 3. Kedja 3-källgapet — färsk telemetri + REVISED DOM

Mätning kl 08:15 lokal:

- Nyaste serverpaket: **09-16 13:40** (server-repo/server-git/konfig ×3) ⇒ gap
  **≈ 42,6 h**.
- **325 commits** sedan paketets mtime (`git rev-list --count HEAD --since`) =
  exakt förlorad kod-historik vid katastrof NU. (Dataytan är tryggare: SQL-blad
  02:30 + JSON-arkiv 02:40 nattligen ⇒ data-gap max ~30 h.)
- hybrid-sync.log OFÖRÄNDRAD död: senaste körning 09-09 20:09 (hetzner_key-fel) —
  gårdkvällens fynd gäller fortfarande för DATORNS kedja.

**REVISED — den mekaniska cadensen är PÅ VÄG, inte frånvarande:**

- `verktyg/arkivera-server.mjs` FINNS, committad **d8ef3cea (09-16, s10-u1 F8)**:
  skapar server-repo-*.tar.gz + server-git-*.bundle + konfigsnapshots HELT på
  servern (*.del + namnbyte först efter verifiering; 60-dygars retention) —
  09-16 13:40-paketet är dess agenttriggade jungfrukörning.
- Levande crontab HAR rad 4: `20 3 * * 0 … arkivera-server.mjs` (söndagar 03:20).
- MEN: konfigsnapshoten server-crontab.txt (09-16 13:40) saknar raden ⇒ cron-raden
  lades till EFTER 13:40 den 09-16, och /tmp/server-arkiv.log är TOM ⇒ den har
  ALDRIG körts. Senaste söndag (09-13) föregick raden.
- **PREDIKTIONSKONTRAKT 2: jungfrukörning söndag 2026-09-20 03:20 lokal.**
  Vakten verifierar 09-20 morgon: /tmp/server-arkiv.log har rader + filerna
  server-repo-2026-09-20.tar.gz + server-git-2026-09-20.bundle finns och är
  gzip-/bundle-verifierade. Avvikelse = ny fyndklass (cron-raden tyst död —
  trolig rot: crontab-reload eller loggskrivväg) och gapet fortsätter växa.

Kvar öppet åt huvudagenten (oförändrat från gården): datorns hybridkedja
(hetzner→contabo_key i synka.cmd) — oberoende av söndags-cronen.

## 4. Städning lokal PG — oberoende egen verifiering

- `pg_lsclusters`: 17/main **down**.
- psql mot skrap-DB vägrar (socket saknas) ⇒ ak1a_dr_test kan inte finnas tillgänglig.
- Låsfil /tmp/ak1a-dr-prov.lock: endast pid-rad från denna körning (flock-viloläge —
  kärnan släpper vid processdöd).
- RAM 1 888 MB tillgängligt efteråt · disk 72 GB ledigt (26 % använt).
- Fellogg /tmp/dr-ovning-fel-2026-09-18.log: 788 kända mönster, kvar som referens.

## 5. KVD

- Ingen kod berörd: src/ orörd = **INGET bygge**; tsc-baslinjen orörd (pre-commit-
  grinden verifierar mekaniskt vid commit).
- R2 orörd: .pgpass endast PGPASSFILE-pekare till psql (aldrig inläst); prod-DB
  endast LÄST (antal + tidsstämplar — GDPR-rent); crontab endast läst (redan
  publikt citerad i DRIFTSBOKEN); inga priser/tier/publicering.
- data/blogg/ orörd. Syskonytor orörda (inga auto-s10-1789711500221-u2/u3-anspråk
  fanns vid start; inga främmande filer rörda).

## 6. Kö / prediktionskontrakt

1. **2026-09-20 03:20** — arkivera-server.mjs jungfrukörning (prediktionskontrakt 2
   ovan); därefter veckocadens mekanisk om GRÖN.
2. **2026-10-13 02:30** — första äkta bladraderingen (MORGON-PULS:s kontrakt,
   oförändrat).
3. Kedja 3-retentionen (60 dygn i arkivera-server.mjs) saknar beteendeprov —
   tidigast möjligt efter 09-20 + dummy-mekanism enligt O7-normen.
4. Nästa födelsebevis: blad 9 kl 02:30 09-19 (stående praxis).

## 7. Leveranser

- `data/forskning/DR-OVNING-2026-09-18-DAGPULS.md` (detta protokoll)
- `data/forskning/DR-PROV-2026-09-18-AUTO-5.md` (verktygets maskinella protokoll)
- `data/forskning/DR-RPO-DIFF-2026-09-18-DAGPULS.json` (JSON-delprotokoll)
- DRIFTSBOKEN: DR-radens lead + sektion S10-U1 (DAGPULS)
- worklog.md: egen sektion
- `data/vakten/auto-s10-1789711500221-u1-ansprak.md`
