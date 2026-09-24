# DR-OFFSITE-ÅTERSTÄLLNING 2026-09-19 KVALL — 3-2-1-kedjans SISTA led första gången bevisat (s10-u2, manifest auto-s10-1789849506241)

**Datum/fönster:** 2026-09-19 22:29–22:3x lokal (20:29–20:3xZ) · **Agent:** fabriksagent s10-u2 (vakt 2/3)
**Objekt-val:** duplikatkontroll mot data/forskning/, worklog och git log visade: blad-9-PG-restore
levererad 12× (AUTO-1…AUTO-12), kvartalsövning levererad (022ebeb1), KEDJA-0 app-DB-levererad
(90a58f89), offsite-VERKTYGET härdat skalfritt (o93/6e5c1bc1) — men **INGEN återställning UR
offsite-arkivet har någonsin övats**. 3-2-1-kedjans led 3 (bortom servern) var obevisat.
Anspråk disk-först 22:30 lokal: `data/vakten/auto-s10-1789849506241-s10-u2-ansprak.md`
(prediktioner P1–P7 låsta FÖRE mätning).

## 1. Arkivet och kontraktet

| Egenskap | Värde |
|---|---|
| Arkiv | `data/backups/offsite/ak1a-offsite-2026-09-19.tar.gz.tar.gz` |
| Storlek | 479 554 465 B (468 315 kB i loggen) · mtime 2026-09-19 20:52 lokal (18:52:13Z-snapshotten) |
| sha256 | `377e2c4134142a16d1b42bd9608e54780dd538e5761ed8cd91f635726ef110a7` |
| Innehåll | 1 284 tar-rader · **10/10 kontrakterade delar FINNS** (P1 EXAKT) |
| Okomprimerat | 1 503,9 MB (kompressionsförhållande 3,14:1) |

Kontrakterade delar enligt `verktyg/backup-offsite.mjs` `delar`: huvudtrad.json, mal-state.json,
trad-kontext.json, audit-logg.jsonl, uppdragslogg.jsonl, juridik-larm.json, forskning/,
blogg-utkast/, kurser-tillagg/, **db-snapshot.sqlite** — alla på plats i arkivet.

## 2. Återställningsövningen (allt EGENMÄTT, node-kanalen)

- **Extraktion till skrap-yta /tmp:** exit 0 · **RTO 23,8 s** (P2 ✅, band < 120 s)
- **Den ÅTERSTÄLLDA db-snapshot.sqlite:** 1 379 422 208 B — `PRAGMA integrity_check` = **"ok"**
  på 40,4 s (python3-sqlite3, läsande öppning AV SKRAP-KOPIAN; levande db.sqlite RÖRDES ALDRIG)
  (P3 EXAKT)
- **Byte-paritet:** `cmp` återställd arkiv-DB == serverns snapshot-kopia = **IDENTISKA** (9,1 s)
- **Katastrof-RTO till verifierbar tråd-DB:** ≈ 64 s (extraktion 23,8 + integritet 40,4)
- **Steg1 totalt** (inventering+extraktion+integritet+räkning+jämförelser): 83,0 s

### 2.1 Trådens permanentens återfödsel — radtal i återställd session-DB (P4)

19 tabeller, alla räknade. Tyngsta: **part 222 960 · message 53 089 · tool_usage 56 737 ·
model_usage 46 523 · session_entry 12 033 · session 1 234 · todo 3 980** (övriga:
session_input 102, input_history 100, session_target 128, local_setting 2, schema_migration 18,
permission 0, session_task_link 0, workflow_* 0). **Slutsats: HELA kundens trådhistorik kan
återfödas från offsite-kopian** — kundens största dokumenterade smärta ("allt försvinner") har
ett bevisat motmedel i led 3.

### 2.2 Snapshot-semantik mot levande ytor (sanity: arkiv ≤ levande)

| Yta | Arkiv (18:52Z) | Levande (22:3x lokal) | Dom |
|---|---|---|---|
| huvudtrad.json | 642 tecken | 642 tecken | identisk ✅ |
| audit-logg.jsonl | 1 851 rader | 1 880 rader | +29 väntat (tiden går) ✅ |
| uppdragslogg.jsonl | 3 rader | 3 rader | identisk ✅ |
| mal-state.json | 368 tecken | 368 tecken | identisk ✅ |
| forskning/ | 855 filer | 873 filer | +18 väntat (kvällsvågornas protokoll) ✅ |
| blogg-utkast/ | 285 filer | 285 filer | identisk ✅ |
| kurser-tillagg/ | 119 filer | 119 filer | identisk ✅ |
| db.sqlite | 1 379 422 208 B | 1 407 389 696 B (22:28) | levande ≥ snapshot ✅ |

0 negativa skillnader — snapshotkontraktet (18:52Z-frysning) håller på samtliga åtta ytor.

## 3. Säkerhetsverifikation (P5) + docstring-kur

Säkerhetsscan av tar-listan (1 284 namn) mot `.env*`/`id_ed25519`/`id_rsa`/`.pgpass`/
`authorized_keys`/`*.pem`: **0 träffar — arkivet RENT på hemligheter.**

**Dokumentationsrutna motbevisad och KURERAD:** verktygets header påstod sedan våg 172 att
`.env.production.local (HEMLIGHETER — chmod 600)` ingår i arkivet — koden inkluderar den ALDRIG
och scanen bevisar att den inte finns där. Ett headerpåstående om att hemligheter lagras i ett
arkiv som kunden hämtar till sin dator/OneDrive är säkerhetsrelevant desinformation. KUR
(Endast Edit i verktyg/backup-offsite.mjs, noll beteendeförändring): header talar nu sanning —
tar.gz (ej "ZIP"), .env*/nyckelfiler ingår ALDRIG, med hänvisning till denna övning som bevis.
Bevis: `node --check` OK + befintlig svit `testa-backup-offsite.mjs` **12 PASS 0 FAIL** efter kur.

## 4. ROTFYND: GitHub-push-benet (3-2-1:s led 3) NERE — Permission denied (publickey)

- Loggen: `GitHub: push OK` senast **12:53:23Z**; första `push väntar (SSH-nyckel ej aktiv än)` **18:53:21Z**.
- Diagnos (ENDAST läsande — `git ls-remote --heads origin develop`, en gång, 30 s-timeout):
  **`git@github.com: Permission denied (publickey)` exit 128** — serverns SSH-nyckel accepteras
  ej av GitHub. Lokal origin/develop-referens: 5ecd6650 (senaste lyckade speglingsläge).
- **Påverkan:** arkivet skapas fortfarande var 6:e timme på servern (led 1 levande; kundens egen
  hämtningsväg levande = deras yta), men GitHub-kopian (led 3) **fryser på 12:53Z-läget** tills
  nyckeln återregistreras — vid total serverförlust före dess är det 12:53Z som gäller.
- **Ägarskap/stoppregel:** nyckelfiler rör jag ALDRIG (AGENTS.md-stoppregel); GitHub-spegling
  ägs av kundens arbetsstation (AGENTS.md). **KÖPOST/R2 ÅT KUNDEN: återregistrera serverns
  publika nyckel (~/.ssh/id_ed25519.pub, förnyad 09-18 20:07 lokal) hos GitHub-kontot
  NewUserAK/AK1.** Verktygets felgren fångar felet tyst (design "tyst fortsätt") — driftmässigt
  syns det ENDAST i loggen; vakt-notis bokförd i DRIFTSBOKEN.

## 5. Städning (P7) + syskonfönster-notis

- Skrap-yta `/tmp/s10u2-offsite-aterstallning` (1,5 GB) **borttagen** (bevis: existsSync false).
- Bevisfiler kvar i /tmp enligt mall: `s10u2-offsite-tarlista.txt` (136 047 B) +
  `s10u2-offsite-steg1-utdata.txt` + `s10u2-offsite-steg2-utdata.txt`.
- `data/backups/` ENDAST LÄST: arkivets storlek/opåverkad SHA verifierad efteråt (479 554 465 B).
- **PG17:** min övning använder INTE PG och lämnade klustret i viloläge — bevisat i
  steg2-utdata 20:32:41Z (`pg_lsclusters: down` + psql-kopplingsvägran). Vid slutverifikationen
  22:3x lokal var PG **online = ett SYSKONS aktiva DR-fönster öppnade efter mitt bevis**
  (DAGFONSTER-REPLIK-precedensen: deras fönster, deras städningsansvar — EJ min svans; jag rör
  inte deras flock-fönster).
- Disk efteråt: 62G fri (37 % använt).

## 6. Prediktionernas dom (ärlighetstabell)

| P | Påstående (låst 22:30, FÖRE mätning) | Dom |
|---|---|---|
| P1 | 10/10 delar i arkivet | ✅ EXAKT |
| P2 | extraktion exit 0, RTO < 120 s | ✅ (23,8 s) |
| P3 | integrity_check = "ok" på återställd kopia | ✅ EXAKT |
| P4 | radtal > 0 rikligt; levande ≥ snapshot | ✅ (53 089 meddelanden; 1 407 ≥ 1 379 MB) |
| P5 | 0 hemlighetsträffar; docstringens .env-påstående falskt | ✅ (kurerad) |
| P6 | push-diagnos läsande; nycklar orörda | ✅ (rot bevisad: publickey denied) |
| P7 | PG viloläge under övningen | ✅ (bevisat 20:32Z; syskonfönster därefter, bokfört) |

## 7. KVD

- **INGET bygge** — src/ orörd; verktyg/-kur är dokumentationsrad i .mjs (node --check OK,
  svit 12/0 efter). `node node_modules/typescript/bin/tsc --noEmit` = **0 fel exit 0** (beviskörning).
- R2 orörda: priser/tier/publicering orörda; nyckelfiler orörda (stoppregel); ingen git-push
  (endast läsande ls-remote); prod RÖRDES ALDRIG.
- data/blogg/ orörd (utkast-mappen endast LÄST i arkivet och på servern).
- data/backups/ endast läsning (SHA-bevis). Syskonytor orörda (u1/u3:s pågående PG-fönster
  obevekligt lämnat ifred; gemensamma filer DRIFTSBOKEN+worklog bär mina TILLÄGG efter deras
  senaste commit — konvergens på filnivå).

## 8. Kö vidare

1. **KUND/R2:** GitHub-nyckel återregistreras (led 3 återupptas) — vakten bekräftar med nästa
   pumpkörnings "push OK"-rad.
2. Repetera offsite-restore åtföljande kvartalsövningen (nästa senast 2026-12-19) — detta
   protokoll är mallen.
3. Blad 10:s födelsebevis 09-20 02:30 + jungurkörning 03:20 (spårets bokförda kö).
4. Observationarv (ingen kur, dokumenterade): loggradens filnamn saknar dubbelsuffixet
   (".tar.gz" i loggen vs ".tar.gz.tar.gz" på disk — medvetet bevarat enligt o93, kosmetiskt);
   retentionen "senaste 7" räknar FILER (zip-varianten 09-18 äter en slot — vid en fil/dag
   gäller ändå 7 dagar).

**Instrument:** `verktyg/_s10u2-offsite-steg1.mjs` (inventering+extraktion+integritet+jämförelser)
+ `verktyg/_s10u2-offsite-steg2.mjs` (push-diagnos+paritet+PG-bevis). Rådata: /tmp-bevisfilerna
ovan + `DR-OFFSITE-2026-09-19-KVALL.json`.
