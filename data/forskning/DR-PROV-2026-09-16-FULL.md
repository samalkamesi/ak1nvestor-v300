# DR-PROV 2026-09-16 — FULL KVARTALSÖVNING: BÅDA KEDJORNA I EN SEKVENS (GODKÄNT)

**Körd av:** fabriksagent s10-u1 (omgång 3), spår 10 DATAINTEGRITET & BACKUP,
natten till 2026-09-16 lokal (UTC-stämplar 2026-09-15T22:4x — verktygens
AUTO-protokoll bär därför 09-15 i filnamnen).

**Val-motivering:** uppdragstexten ("DR-övning: återställ, mät tid/rader,
protokoll, städa lokal PG") var IDENTISK med s10-u2/u3/u4:s — manuella restore-
övningar på 15-sep-dumpen var redan 4× levererade och mekaniserade. Det icke-
levererade objektet: kvartalsmallen (sedan u3:2 definierad som BÅDA kedjorna)
har ALDRIG körts END-TILL-END av en agent i en sekvens — detta protokoll bevisar
mallen som helhet, plus tre verkliga fynd som bara en äkta körning avslöjar
(nedan F1–F3). Nytt verktyg levererat: `verktyg/dr-kedja2.mjs` (kedja 2 som
kommando, mönster från u4:s kedja-1-mekanisering).

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi bevisade ikväll att **hela plattformen kan byggas upp igen från backup
   på ungefär 40 sekunder** — och att provet numera är två färdiga kommandon.
2. Kedja 1 (hela databasen): **11,2 sekunder · 60 publika tabeller ·
   1 266 455 rader** — sjätte oberoende mätningen, snabbaste hittills.
3. Kedja 2 (händelseloggen, som inte finns i databas-dumpen): **27,2 sekunder ·
   160 928 rader**, verifierad in i detalj i en avskild testdatabas — som
   sedan raderades. Produktionen påverkades aldrig.
4. Bägge backup-kedjorna bar **dagens** data vid provet — skyddet är färskt,
   inte en vecka gammalt.
5. Tre fynd togs på vägen ( Trasig lås-instruktion som aldrig fungerat — nu
   lagad inuti verktyget; en backup som skrevs medan vi läste — skyddet
   stoppade oss korrekt; regelverk för nästa gång dokumenterat).

## 2. Kedja 1 — SQL-nattdumpen (dr-ovning.mjs)

Körning 00:42:13 lokal, GRÖN exit 0. Maskinellt protokoll:
`data/forskning/DR-PROV-2026-09-15-AUTO-4.md` (UTC-datum).

| Mått | Värde |
|---|---|
| Dump | **db-2026-09-16.sql.gz** (29,8 MB · 1 287 960 rader enligt markörkontroll) |
| RTO | **11,2 s** |
| public | 60 tabeller / **1 266 455 rader** |
| public+storage | 68 / 1 266 591 |
| alla scheman | **99** / 1 266 851 (F6: +4 tabeller mot 15 sep — basen växer) |
| Felloggrader | 788 — samtliga kända kategorier (Supabase-roller/scheman/extensions), 0 okända |
| Städning | skrap-DB raderad · PG17 stoppad · exit 0 |

Dumpens ursprung: skapad 00:41:34 lokal av samtidigt syskonarbete (se F2) —
övnningen återställde alltså DAGENS data, inte gårdagens.

RTO-historik (sju punkter, lastberoende spridning):
20,0 (v98) · 17,7 (u2) · 14,7 (u3) · 20,0 (u4) · 23,9 (godkännandeprov) ·
**11,2 s (denna)**.

## 3. Kedja 2 — system_events ur moln-JSON (dr-kedja2.mjs, NYTT VERKTYG)

Fyra fullkörningar denna natt + en RÖD race-fångst (F3):

| Körning | Arkiv | RTO | Rader | Dom |
|---|---|---|---|---|
| 1 (fönster-wrapper) | 09-09 | 30,7 s | 146 727 | GRÖN |
| 2 (fönster-wrapper) | 09-09 | 27,0 s | 146 727 | GRÖN |
| 3 (fönster-wrapper) | 09-09 | 24,6 s | 146 727 | GRÖN + full verifiering |
| 4 (dr-kedja2.mjs) | **09-15 (nytt)** | — | 97 557 av 160 928 | **RÖD — pågående export** (F3) |
| 5 (dr-kedja2.mjs) | **09-15 (nytt)** | **27,2 s** | **160 928** | **GRÖN + full verifiering** |

Maskinella protokoll: `data/forskning/DR-KEDJA2-2026-09-15-AUTO.md` (RÖD race)
+ `…-AUTO-2.md` (GRÖN). Kedja-2-historik: u3:2:s 51,6/57,6 s → nu 24,6–30,7 s
(5 300–6 000 rader/s).

Oberoende PG-verifiering av körning 5 (ej verktygets egna tal):
rader 160 928 · unika id 160 928 (**0 dubbletter** — bättre än 09-09-arkivets 6)
· 11 event_type (oversattning 146 190 · trafik 13 824 · sakerhet 775 ·
akm2_snapshot 101 · organ 15 · blogg_utkast 7 · signal 7 · email_kö 3 ·
medlem 3 · vagvalidering 1 · styrelse_beslut 1) · severity info 160 230 /
warning 698 · tidsfönster 2026-09-03 22:43:12 … **2026-09-16 00:40:02 lokal**
· jsonb-prov: 13 824 rader med läsbar `details->>'dag'`.

**Total DR, båda kedjorna: ~38–40 s** (11,2 + 27,2) — attestperiodens
RTO-mål (v98-mönstret) fortsatt giltigt med marginal.

## 4. Fynd (F1–F6)

**F1 — DRIFTSBOKEN:s flock-rekommendation var DUBBELDEFEKT (kurerad i verktyget).**
Rekommendationen `flock -w 900 /tmp/ak1a-dr-prov.lock -- node verktyg/dr-ovning.mjs`
(godkännandeprovets notis) testades empiriskt: (a) `--`-separatorn stöds ej av
util-linux flock 2.39.3 → "failed to execute --", exit 69; (b) även med korrekt
syntax (`flock -n <låsfil> node …`) skapar flock den tomma låsfilen som
dr-ovning.mjs:s `taLas()` då tolkar som "låset upptaget" → exit 3 vägran.
Rekommendationen kunde aldrig ha fungerat — skyddet mellan kedja 1 och kedja 2
har hela tiden vilar på tur, inte mekanik (precis u3:2:s fynd 6). **KUR
LEVERERAD:** dr-ovning.mjs startar nu om sig självt under flock(1) på samma
låsfil (re-exec, väntar ≤ 900 s; filprotokollets pid-rad kvar som information;
låsfilen städas ej i flock-läge — flock äger dess inod). **BEVISAT I PRAKTIKEN:**
övnningen startades medan ett konstruerat syskon höll flock i 10 s — verktyget
väntade in fönstret (första loggrad 00:42:23, 10 s efter start) och körde sedan
GRÖNT. `dr-kedja2.mjs` (nytt) bär samma flock-lager. u3:2:s kö till
huvudagenten är härmed LÖST.

**F2 — crontab-ombygget observerat och verifierat (syskonets leverans, inte min).**
Under övningen bytte ett samtidigt syskon (sannolikt s10-u1 omgång 2) användar-
crontabens 02:30-backup-rad (spool-mtime 00:40:52): `PGPASSFILE=/home/ak1a/.pgpass`
— **Supabase-lösenordet är borta ur kommandoraden** (s10-u1:s säkerhetsfynd,
värdet återges aldrig här) — plus `&& node verktyg/kolla-dump-markorer.mjs --natt
>> /tmp/supabase-backup.log 2>&1` (markörvakts-appenden) och retentionen
(`find -mtime +30 -delete`) på plats. ~/.pgpass chmod 600, 5 fält. Funktion
bevisad: db-2026-09-16 dumpad 00:41:34 + MARKÖRKOLL GRÖN i loggen 00:41:35.
OBS (självkorrigering enligt rond 34:s lag): min första kontroll grepade
`/etc/crontab` (orörd sedan 09-08) och drog fel slutsats att raden försvunnit —
dump-cronen lever i ANVÄNDAR-crontaben (`crontab -l`). Alla tre köpunkterna i
s10-u1:s ursprungliga kö är därmed levererade.

**F3 — RACE: läsning mitt i pågående export → RÖT (skyddet verkade på äkta data).**
Körning 4 ovan träffade `system-events-full-2026-09-15.json.gz` 18 s efter att
filen skapats (ett syskon fyllde RPO-gapet genom att köra moln-exporten på
servern — hela data/backups/ fylls med 09-15-snapshots + server-repo-
2026-09-16.tar.gz). Verktyget dömde korrekt RÖT (trunkerad ström, radmismatch)
och PG städades. Omkörning 30 s senare: GRÖN, alla 160 928 rader. **Regel:**
RÖT mot ett färskt arkiv = kontrollera om en exportör-process lever/mtime rör
på sig och kör om; ALDRIG tolka RÖT under pågående export som dålig backup —
och ALDRIG mjuka upp domslutet (det var just detta skydd u3:2:s sabotagebevis
byggde). Kompletterande observation: syskonet körde exporten på SERVERN, vilket
är nytt (tidigare: datorns hybrid-sync) — om det blir rutin är det ett RPO-läge
att dokumentera i DRIFTSBOKEN vid nästa övning.

**F4 — DDL-kur för kedja 2 dokumenterad och inbyggd.** Dumpens
`CREATE TABLE public.system_events` bär `DEFAULT (extensions.uuid_generate_v4())::text`
— schemat `extensions` är Supabase-molnspecifikt (samma kategori som de 788
kända restore-felen). dr-kedja2.mjs byter kirurgiskt till inbyggda
`gen_random_uuid()` (semantiskt likvärdigt uuid v4; DEFAULT saknar betydelse
för COPY då varje arkivrad bär eget id). u3:2 löste detta ad hoc; nu är kur
en del av verktyget.

**F5 — RPO-gapet STÄNGT ikväll.** Fram till 00:41 lokal var senaste JSON-arkiv
09-09 (7 dagar) och senaste dump 09-15 02:30 (u3:2:s fynd 3 lever kvar som
observation: hybrid-sync från datorn tyst sedan 09-09 — MEN ikväll fyllde
syskonet på manuellt på servern: nya snapshots + arkiv 09-15 med loggen komplett
t.o.m. 00:40:02). Vid övningens slut: SQL-dump = 00:41:34, JSON-arkiv = 00:49:22
— **båda kedjorna bär samma dags data, bevisat återställningsbara**. Gamla
system-events-arkiv förblir arkivhandlingar (retention ALDRIG — historik före
2026-09-03 finns endast i 09-08-arkivet).

**F6 — Tillväxtmönster.** Dumpen växer ~10–20 k rader/dag (1 267 803 → 1 287 960
markup-markörrader på en dag); alla scheman 95 → **99 tabeller** på ett dygn;
restore-felloggen 780 → 788 (samma kända kategorier — nya moln-objekt ger nya
GRANT-rader). Ingen åtgärd — trenden är väntad (databasen lever).

## 5. Kvartalsmallen (nästa övning: senast 2026-12-15)

Ett kommando per kedja, båda flock-skyddade mot varandra och mot syskon:

```
node verktyg/dr-ovning.mjs          # kedja 1: hela databasen ur SQL-nattdumpen
node verktyg/dr-kedja2.mjs          # kedja 2: system_events ur moln-JSON-arkivet
```

Notiser: (a) dr-ovning.mjs räknar "nästa övning" från LOKAL dag — skrev
2026-12-16; DRIFTSBOKEN:s gräns 2026-12-15 gäller (UTC-marginell — lågt
prioriterad kosmetika i verktyget, ägs av u4:s arv). (b) dr-kedja2.mjs väljer
senaste arkiv — se F3-regeln om RÖT mot färska arkiv. (c) Fabriksbarnets sudo
krävs (PG17 start/stop).

## 6. Städning + KVD

Skrap-DB:er (ak1a_dr_test, ak1a_dr_json) raderade efter VARJE körning ·
PG17 `down` verifierad · låsfilen lämnad med pid-rad (flock-kontraktet —
oskyldig, kärnan släpper vid processdöd) · tmp-utvecklingsfiler rensade
(`/tmp/s10u1v3-dr-fonster.mjs`, flocktest) · disk 76–77 GB ledigt oförändrat ·
prod aldrig rörd (skrap-DB:er på lokal PG17; prod lever i Supabase-molnet).
src/ orörd — tsc-kvitto via projektbinär vid commit. Inga nycklar lästa eller
återgivna (crontab-citering med lösenordsfält maskerat). R2-ytor orörda.

SLUT — DR-PROV 2026-09-16-FULL, s10-u1 omgång 3, 2026-09-16 00:5x lokal.
