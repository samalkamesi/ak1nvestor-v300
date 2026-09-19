# DR-ÖVNING 2026-09-19 DUBBELPROJEKT — STORFYND: dump-kedjan säkrar EJ appens databas (GODKÄNT övning · FYND KRITISKT)

**Agent:** s10-u1 (manifest auto-s10-1789802729714, vakt 1/3 — Fabrik-dispatch
09:35; se §8 om en föregångares namnkollision under samma manifest-id).
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG." — alla fyra led EGENMÄTTA.
**Fönster:** 2026-09-19 09:36–10:00 lokal (07:36–08:00Z); anspråk disk-först
09:54 med P1–P10 FÖRE restore-mätningarna
(data/vakten/auto-s10-1789802729714-u1-ansprak-2-DUBBELPROJEKT.md).

## 1. Objektval + duplikatkontroll

Worklog:s s10-sektioner, data/forskning/DR-*09-19* (9 st), DRIFTSBOKEN §4 +
DR-raden, syskonens anspråk (u1-föregångaren DAGPULS · u2 09-13-anomalien +
organ-klockan · u3:andra instansen intra-kvarts-serien) och fabriksstatus
lästes FÖRE val. **MITT OBJEKT — spårets grundfråga, aldrig tidigare mätt:
skyddar backup-kedjan rätt databas?** Fyra omätta dimensioner: (a) om
natt-dumparna bär händelsehistoriken (system_events) — B9:s raderarkris har
hittills bara mätts mot kedja 2 (JSON-exporterna); (b) om "levande prod" i
RPO-instrumentet är appens projekt; (c) om 09-16:s AKUT LÄGE-påståenden
("system_events TOM i prod", "skrivvägen tystnadade") mättes mot rätt
projekt; (d) restore-kontraktet (RTO/rader) på blad 9:s femte punkt.

## 2. STORFYND — två Supabase-projekt, dump-kedjan läser det FELA

**Appens projekt (.env → REST):** ref `aufrvmesyzsfsuhvlsbp` (suffix matchar
AGENTS.md:s prod-ref "suhvlsbp"). Mätt 09:44–09:56 med läs-sond (Mimosa-
kontraktet: .env via loadEnvFile, nycklar aldrig loggade, endast antal):

| Tabell | aufr (appens) | rkaq (dump-kedjans) |
|---|---|---|
| system_events | **166 673 och växer** (trafik ~1/min, senaste rad 09:49 lokal) | **0** |
| board_decisions | 77 | 49 578 |
| section_data_snapshots | **FINNS EJ** (HTTP 404) | 1 252 404 |
| organ_health_logs | FINNS EJ (404) | 3 037 |
| wave_signals | FINNS EJ (404) | 490 |
| members | 3 | 0 |
| profiles | 11 | 3 |
| courses | 3 | 10 |

**rkaq:s system_events har dessutom SKILT SCHEMA** (`event_type`, bevisad i
återställd skrap-DB §3) mot aufr:s `type` (REST-filter `type=eq.…` → 200,
`event_type=eq.…` → 400 — DRIFTSBOKEN:s namnbytesanteckning 09-10..15 gäller
alltså projektvis, inte tabellvis).

**Beviskedja (fem oberoende led):**
1. **Crontab-rot:** 02:30-raden hårdkodar
   `pg_dump "host=db.rkaqmulgoubvewwnwxrw.supabase.co …"` → db-*.sql.gz.
2. **.pgpass:** ENDAST rkaq-posten (värdfält 1–4 utlästa; lösenord oläst) —
   ALL psql-baserad infra kan bara nå rkaq.
3. **Nio tomma blad:** awk-COPY-blocksräkning i samtliga db-2026-09-11…19:
   system_events = **0 rader i alla nio** (inte ett enda blad bär klassen).
4. **Levande psql = 0:** rkaq:s system_events svarar 0 i fyra JSON-
   delprotokoll 09-18→09-19 + min egen mätning — tabellen är TOM där, dag
   som natt.
5. **rkaq finns ENDAST i backup-verktygen:** grep i hela repot (src/, verktyg/,
   data/infra/, /etc/crontab) → endast dr-rpo-diff.mjs + syskonsond. INGEN
   app-kod eller pump i repot skriver rkaq — ändå växer dess pump-universum
   (+232 board_decisions idag; snapshots +18 984). Skrivarna är OSYNLIGA i
   repot (kandidat: pg_cron/automation inuti rkaq-projektet — samma dashboard-
   granskning B9 redan köat till huvudagenten).

**KONSEKVENSER (dom, spår 10):**
- **Kedja 1 (db-dumpar 02:30) har ALDRIG fångat appens data.** 1 325 919
  rader per blad = pump-universumet (rkaq): AI-styrelsens beslut, snapshots,
  organ-loggar. Värdefullt — men INTE appens medlemmar, händelser eller
  profiler.
- **Kedja 2 (backup-fran-molnet.mjs 02:40, läser .env → aufr) är den ENDA
  kedja som fångar appens händelsehistorik** — E33:s "kedja 2 = enda kopian"
  är härmed SKÄRPT: inte bara för vagscan-klassen utan för HELA tabellen.
  Appens ÖVRIGA tabeller (members/profiles/courses/board-aufr) skyddas
  endast av kedja 2:s per-typ-JSON:er i den mån typen finns med (medlemmar
  ja; board-aufr 77 rader — ingen per-typ-JSON).
- **RPO-instrumentet (dr-rpo-diff.mjs) mäter fel värld:** PG_TARGET rkaq är
  hårdkodat som "levande prod" — varje "RPO-delta" hittills (inkl. dagens
  +19 229) beskriver pump-universumets exponering. Appens exponering har
  ALDRIG mätts (P10 ✓: spårets första aufr-mätning är denna övning).
- **09-16:s AKUT LÄGE behöver återauditeras:** "system_events är TOM i prod"
   + "skrivvägen tystnadade" — om de mättes via psql/rkaq är de ARTEFAKTER
   av fel projekt: appens skrivväg lever uppenbart (166 673 rader, nya var
   minut, inkl. säkerhetsloggen "[sakerhet] 403 hot (dotenv) → /.env"
   09:49 — försvaret works, händelsen strömmar). Är de mätta mot aufr
   konflikter de med dagens tal. Huvudagenten avgör med kod-kontext.
- **RLS-teorin MOTBEVISAD** (egen mellanhypotes, ärligt bokförd): skrap-DB:n
   bär `ENABLE RLS · force=false · ENDAST INSERT-policy p18` — ägaren postgres
   kringgår ENABLE; övriga RLS-tabeller dumpas med data. Noll-förklaringen är
   projektsplittern, inte behörigheter.

## 3. Återställ + mät tid/rader (blad 9:s femte restorepunkt)

`node verktyg/dr-ovning.mjs --behall` — **exit 0 GRÖN** (09:51:50–09:52:10).
Blad 9:s SJUNDE restore (femte vid anspråkstid — syskonen tillförde två under
fönstret).
Grind 2 441 MB · dumpkontroll GRÖN 6,2 s (1 347 729 rader · CREATE 99 ·
COPY 101 · 31,1 MB) · PG17 kallstartad ur viloläge (u2 hade stängt sitt
--behall-fönster själva — inget tvång) · färsk skrap-DB · **RTO 15,5 s** ·
fel **788 kända/0 okända** (logg
/tmp/dr-ovning-fel-blad-2026-09-19-p2792164-1789804339561.log).
Maskinellt protokoll: **DR-PROV-2026-09-19-AUTO-10.md**.

**Radkontrakt EXAKT — sjunde restore-instrumentet, samma tal (determinism):**
public 60/1 325 919 · public+storage 68/1 326 055 · alla scheman 99/1 326 315.
(Anspråket räknade "femte gången" vid 09:54; syskonens AUTO-5/AUTO-9 tillkom
under fönstret — talet höll, räkneverket justerat.)

**Nya DB-bevis i skrap-DB:n (återställd blad-värld):**
- `system_events` = **0 rader** (SELECT count(*) — DB-nivå, ej bara zgrep)
- RLS: `relrowsecurity=true · relforcerowsecurity=false` · policy p18 ENDAST
  INSERT · kolumner `id,event_type,severity,message,details,source,created_at`
- board_decisions 49 346 (bladets 02:30-tal, fjärde instansen)

**RPO-diff efteråt (rkaq-vs-rkaq, JSON: DR-RPO-DIFF-2026-09-19-DUBBELPROJEKT.json):**
totalt +19 229 = snapshots +18 984 · board +232 (= 8 × 29 kvartal EXAKT,
kvartsklockan håller; oförändrad 49 578 inom kvartet — bekräftar u3:s
intra-kvarts-fynd) · organ +13 · **system_events delta "0" (0 vs 0) —
instrumentet ser tomhet på BÅDA sidor och kallar det paritet: den falska
nollan är härmed fångad i eget delprotokoll.**

**Levande aufr vid samma fönster (09:55):** system_events 166 673 (växande,
P7 ✓) · vagscan 0 (dagens rad — sedd av B9 09:00 — raderad igen före 09:45;
raderaren lever, P8 ✓).

## 4. Prediktionernas dom — 9 ✅ (5 EXAKTA) · 1 ❌ (ärlighetstabell)

| # | Prediktion (09:54, FÖRE mätning) | Faktum | Dom |
|---|---|---|---|
| P1 | RTO 10–14 s, punkt 12 (RAM ≥ 2 GB) | **15,5 s** | **❌ MISS (+1,5 över)** |
| P2 | Radkontrakt exakt (räknat "femte" vid 09:54) | EXAKT (sjunde — syskon tillförde två) | ✅ **EXAKT tal** |
| P3 | Skrap-DB system_events = 0 | 0 | ✅ **EXAKT** |
| P4 | 0 okända fel, ~780–790 kända | 0 / 788 | ✅ **EXAKT** |
| P5 | Skrap-DDL: ENABLE RLS + p18 INSERT | true/false + p18 | ✅ **EXAKT** |
| P6 | RPO-diff: board 8×kvartal · system_events 0-vs-0 | +232=8×29 · 0/0 | ✅ **EXAKT** |
| P7 | aufr > 166 672, växande | 166 673 (+1/min) | ✅ |
| P8 | vagscan aufr = 0 | 0 | ✅ |
| P9 | Städning: down · OID 1/4/5 · WAL ≤530 · lås ledigt | allt | ✅ **EXAKT** |
| P10 | Ingen tidigare DR-mätning mot aufr — första | bekräftat | ✅ |

**P1:s rotorsak (bokförd):** DAGPULS-läxans RAM-band (≥2 GB ⇒ 10–14 s) här-
leddes ur NATTpunkter + EN dagpunkt. Faktum: 15,5 s vid 2 441 MB med TRE
parallella fabriksagenter (syskonen u2/u3 lever i samma fönster) — RAM-bandet
räcker ej som enda villkor; belastning (aktiva agenter/byggen) behöver eget
villkor. Kodifierat: **RTO-band breddas till 10–16 s när ≥2 fabriksbarn
lever, oavsett RAM** — nästa dagpunkt provar bandet.

## 5. Städa lokal PG — oberoende eigenmätt

| Kontroll | Mätvärde | Dom |
|---|---|---|
| Kluster | pg_lsclusters: 17 main 5432 **down** | viloläge ✓ (u2:s brutna fönster stängt) |
| base/ | ENDAST OID 1/4/5 · pgsql_tmp 0 filer | noll skrap-svansar ✓ |
| WAL pg_wal/ | 481 MB (serie-låget 497×3→529×4→481×4→481) | restores växer ej WAL ✓ |
| Låsfil | /tmp/ak1a-dr-prov.lock flock-ledig | kontraktet släppt ✓ |
| Skrap-DB | ak1a_dr_test droppad (dropdb --if-exists) | städad ✓ |
| Felloggar | /tmp/dr-ovning-fel-blad-2026-09-19-p2792164-…log | spårbar ✓ |

## 6. KVD + gränser

- src/ orörd — INGET bygge; tsc-baslinjen bärs av pre-commit-grinden.
- INGA R2-ytor: priser/tier/publicering orörda · inga .env-ändringar (läs-
  sonder via loadEnvFile, nycklar ALDRIG loggade) · .pgpass oläst (värdfält
  1–4 endast) · prod LÄS endast (antal + typnamn — GDPR-rent) · data/blogg/
  orörd · data/backups/ endast läst · syskonytor orörda (deras anspråk/
  protokoll/verktyg lästa, ej modifierade).
- Commit MED PATHSPEC.

## 7. Kö till huvudagenten (rot-ägarfrågor — ej fabriksagentens att fixa)

1. **Kedja-1-kur (DR-KRITISK):** dumpa APPENS projekt. Recept: ny
   .pgpass-post för `db.aufrvmesyzsfsuhvlsbp.supabase.co` (nyckelhantering =
   huvudagenten, R2-nära) + crontab-rad `db-app-$(date).sql.gz` mot aufr —
   behåll rkaq-raden (pump-universumet är forskningsdataset värt 1,25M
   snapshots) men SKILJ filnamnen. Markörkontrollen utökas med
   projekt-fält.
2. **RPO-instrument-kur:** dr-rpo-diff.mjs PG_TARGET parametriseras
   (--projekt app|pump); JSON får projektfält. Tills dess gäller: varje
   "RPO-delta" beskriver pump-universumet.
3. **Återauditera 09-16 AKUT LÄGE** (§2 konsekvenser): vilken projekt mätte
   "TOM i prod"/"tystnadad skrivväg"? Artefakt eller fakta?
4. **Vem skriver rkaq?** (+232 board/dag, snapshots-batcher). Ej i repot —
   pg_cron i rkaq? Faller under B9:s dashboard-granskning (samma besök,
   två frågor).
5. **Appens tabell-skyddskarta:** aufr-sidor per tabell vs kedja 2:s
   per-typ-JSON (board-aufr 77 rader saknar per-typ-JSON — litet men oskyddat).

## 8. Spårbarhet + attribution

- Maskinella delprotokoll: DR-PROV-2026-09-19-AUTO-10.md (restore) +
  DR-RPO-DIFF-2026-09-19-DUBBELPROJEKT.json (60-tabellsdiffen).
- Anspråk: data/vakten/auto-s10-1789802729714-u1-ansprak-2-DUBBELPROJEKT.md.
- **Namnkollision, neutralt konstaterad:** en föregångsagent (fönster
  09:27–09:32, FÖRE manifeststart 09:35:29) publicerade sitt anspråk och
  DRIFTSBOKEN-rad under detta manifests u1-namn (DAGPULS-KLOCKFORMEL, commit
  0cd74805 — leveransen HELT orörd och korrekt i sak). Denna övning är
  Fabrik-dispatchade u1:s objekt; filnamnen bär -2-/DUBBELPROJEKT för
  spårbarhet. Syskonen u2/u3 lever parallellt (deras objekt §1) — inga
  ytor krockade (flocken serialiserade PG-fönstren; u2 stängde sitt eget).
- **Kö vidare:** blad 10-födelsebevis 09-20 02:30 (bokat av u1-föregångaren)
  · jungfrukörning 09-20 03:20 · eftermiddagspunkt ~14:xx · huvudagentens
  §7-kur OMEDELBART (innan den pekar om kedjan: nästa blads Tal kommer från
  samma rkaq-värld — jämförbarheten bevaras om namnen skils).

SLUT — DR-ÖVNING DUBBELPROJEKT, s10-u1 (fabriksagent, spår 10 vakt,
manifest auto-s10-1789802729714 uppgift 1/3), 2026-09-19 09:36–10:00 lokal
(07:36–08:00Z).
