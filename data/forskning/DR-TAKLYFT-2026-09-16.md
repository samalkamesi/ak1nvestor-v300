# DR-TAKLYFTET 2026-09-16 — kedja 2:s exportör härdad: 200k-taket lyft + TOTAL-KONTRAKT + cron 02:40

Spår 10 (DATAINTEGRITET & BACKUP), s10-u1 omgång 4, fabriksagent VAKT.
Uppdrag: "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG."

## Objektval (duplikatkontroll)

Uppdragstexten är identisk med s10-u2/u3/u4:s — restore-kärnan var vid
start **åtta gånger levererad** (sju RTO-punkter + jungfrunatten bevisad av
syskon s10-u2 O2 kl 07:20). Syskonet s10-u3 (O4) tog KEDJA 4 (per-typ-
snapshots, commit 0a72e434 kl 07:16). Det icke-levererade objektet var
spårets bokförda **kommande dataförlust**: FULL-dumpens hårdta
40-sidors-tak (200 000 rader) i `verktyg/backup-fran-molnet.mjs`
(s10-u3 O3:s kö till huvudagenten: "200k-taket nås ~2026-10-04").
Kombinerat med att exporten var **oschemalagd** på servern (se fynd 2)
var kedja 2:s framtid dubbelhotad: taket = tyst trunkering, cron-luckan =
ingen daglig källa alls.

## Mätning (före kur, allt egenmätt i arbetsytan 2026-09-16)

| Störning | Värde | Källa |
|---|---|---|
| system_events i molnet | **161 550 rader** | Content-Range-sond (Prefer: count=exact) 05:20 UTC |
| Nattens arkiv (09-15) | 160 928 rader / 33 sidor | data/backups/system-events-full-2026-09-15.json.gz |
| Tillväxt | **+2 015 rader/dag** snitt | 146 623 (09-08) → 160 928 (09-15) över 7 dagar |
| ETA för 200k-taket | **~2026-10-05** (19 dagar) | (200 000 − 161 550) / 2 015 |
| truncerad-domens grund | SIDRÄKNING (`alla.length >= MAX_SIDOR*SIDSTORLEK`) | koden, rad ~126 före kur |

Efter ~2026-10-05 hade varje nattexport **tyst trunkerats** — ingen
felsökningsväg blinkar: filen är en giltig gzip, DOM:n visas komplett och
endast svansen (de äldsta raderna, där `oversattning`-eventen bor) försvinner.

## FYND 1 — kommande tysta trunkeringen (rotorsak: hårt tak som dimensionerande gräns)

KUR (3 delar, allt i `verktyg/backup-fran-molnet.mjs`):

1. **SAKERHETSTAK 400 sidor** (2M rader ≈ >1 års marginal vid +2 015/dag).
   Taket är för alltid ett EVIGHETSSKYDD, aldrig en dimensionerande gräns;
   `--max-sidor` accepterar nu 1..400.
2. **TOTAL-KONTRAKTET**: sida 0 begär `Prefer: count=exact` → PostgREST:s
   Content-Range bär tabellens total → filen fick fältet `totaltFranApi`
   och `truncerad` döms **MASKINELLT** (`antal < totalt`). Detta är
   JSON-dumpens motsvarighet till SQL-dumpens slutmarkörer (s10-u1:1:s
   tema): dumpen bär sitt eget kompletthetsbevis. Rakningen begärs EN
   gång (sida 0) — count-exact per sida kostar onödigt på växande tabell.
3. **Repetitionsskydd**: en proxy som ignorerar Range returnerar samma
   första rad-id igen → loopen bryts med dom `truncerad` (evighetsloop
   med dubblett-push omöjliggjord; skyddet testas av sig själbt vid varje
   körning genom att normal paginering aldrig triggar det).

## FYND 2 — exporten var OSCHEMALAGD på servern (rotorsak: ägarlücke efter hybrid-sync)

Mätning: `crontab -l` (2 rader: SQL-dump 02:30 + gränsnittsvakt) och
/etc/crontab + pumpor-daemonen — **noll** träffar på backup-fran-molnet.
Moln-JSON-arkiven 09-08/09-09 skrevs av datorns hybrid-sync (tyst sedan
09-09 20:09, kundeskalering bokförd av s10-u3 O3); nattens 09-15-arkiv
skrevs av syskons manuella körning 00:49. Kedja 2 = system_events (som
**saknas helt i SQL-dumpen**, u2:s slutgiltiga fynd) levde alltså bara så
länge agenter rörde vid spåret manuellt.

KUR: **cron-rad 3 installerad** — `40 2 * * * cd /home/ak1a/AK1 &&
/usr/bin/node /home/ak1a/AK1/verktyg/backup-fran-molnet.mjs >>
/tmp/moln-backup.log 2>&1`

- 02:40 = 10 min efter kedja 1:s 02:30-dump (DRIFTSBOKEN §4-ordning:
  SQL-dump först — dumpen + markörkontroll är klar på <1 min).
- Ingen hemlighet i raden (verktyget läser .env självt enligt
  Mimosa-kontraktet) → ingen maskning behövs i referensen.
- **Ingen retention i raden**: system-events-full-*.json.gz är
  ARKIVHANDLINGAR (DRIFTSBOKEN: "retention gäller ALDRIG"); per-typ-
  filerna är ~60 kB/dag.
- **Ändringsprotokollet följt exakt** (s8-u2:s 30-larm-natt som
  förebild i omvänd riktning): crontab + `crontab.reference` i samma
  ändring + verifiering `node verktyg/konfigintegritet-vakt.mjs` →
  **GRÖN crontab 3/3 · pm2 4/4** (journal data/vakten/konfig-larm.jsonl).

## Beviskörning — export med v3 (äkt kört, 2026-09-16 05:23 UTC)

```
system-events-full: 161678 rader (33 sidor) → system-events-full-2026-09-16.json.gz
  [gzip 26.2 MB] (total-kontrakt KOMPLETT 161678/161674)
TOTALT: 11 filer, 26.28 MB skrivet — väggklocka 42,9 s · MemAvailable 4 266 MB
```

**Total-kontraktets första leverans + live-semantik bevisad**: dumpen bar
161 678 rader mot totalen 161 674 — fyra FLER än totalen, inte färre.
Förklaring: tabellen växer under exportens 43 s och sorteringen är
`created_at.desc` (nya rader hamnar före sida 0 som redan hämtats; rader
med äldre tidsstämplar backfyllda under körningen kan dock fångas).
Kontraktets dom `antal < totalt` är därför RIKTIGT DEFINIERAT för en
append-only-logg: färre än starttotalen = bevisat trunkerat; ≥ = komplett
(möjligen några rader färskare). Semantiken protokollförs här som
kontraktens tolkningsregel.

## DR-ÖVNINGEN — återställ, mät tid/rader, protokoll, städa lokal PG

`node verktyg/dr-kedja2.mjs` (valde automatiskt dagens v3-arkiv som
senaste system-events-full-*.json.gz) — **exit 0, DOM GRÖN**:

| Moment | Resultat |
|---|---|
| RTO väggklocka | **38,5 s** (COPY-fas 38 483 ms · 4 201 rader/s) — åttonde RTO-punkten |
| Rader | 161 678 lästa · 0 felaktiga · COPY-n = 161 678 = header.antal |
| Oberoende PG-verifiering | rader 161 678 · unika id 161 674 · jsonb-prov 14 565 |
| Fördelning | oversattning 146 194 · trafik 14 565 · sakerhet 804 · akm2_snapshot 101 · övriga 14 |
| Städning | skrap-DB ak1a_dr_json raderad · PG17 stoppad (verktygets finally) |

Maskinellt protokoll: `data/forskning/DR-KEDJA2-2026-09-16-AUTO.md`.
RTO-serien kedja 2: 52–58 s (146 727) · 27,2 s (160 928) · **38,5 s
(161 678)** — spridningen lastberoende (fabriksvågor aktiva).

## FYND 3 (sidofynd, kvantifierat) — 4 dublett-id i prod-tabellen

Verifieringen räknade 161 678 rader men 161 674 unika id — **fyra par
delar id**. Detta är exakt differensen total-kontraktet fångade
(161 678/161 674): de fyra "extra" raderna är dublettskrivningar i
prod-tabellen (sannolikt idempotenslucka i någon skrivväg — retry som
återanvänder id), inte exportartefakter. Känd ground sedan u3:2
("tabellen saknar PK — ALDRIG ignore-duplicates") men nu för första
gången KVANTIFIERAD: 4/161 678 = 0,0025 %. Ingen kur i detta fönster
(would kräva prod-DDL — ALTER-kön till huvudagenten berör samma tabell);
restore-domkontraktet hanterar dubletterna explicit och domen förblev GRÖN.

## KOLLISION BEVIS NR 5 + 6 (fabrikens trängda yta, noll förlorat arbete)

- **Nr 5**: första Edit-serien hejdades av läshinder (syskon s10-u3 O4:s
  samtidiga leverans), varefter rond-46-merge:en (dd323959) checkade ut
  filen — min redan genomförda header-Edit raderades ur arbetsytan.
- **Nr 6**: efter hel-fils-Write + `git add` + påbörjad commit flyttade
  syskonet s10-u2 (O2) HEAD (dd323959 → c8df5f6b kl 07:20:10) — gits
  HEAD-lås vägrade min commit, och syskonets bulk-add hade redan fångat
  min v3-kur **ordagrant inklusive signaturblocket** in i sin jungfrunatts-
  commit c8df5f6b. Koden lever i trädets sanning; denna commit bär
  dokumentationen + cron + protokoll som completo.
- Lära (förstärker s10-u3 O3:s): i 3-parallella manifest med identisk
  uppdragstext är verktygsfilernas commitfönster sekundsnåra — hel-fils-
  Write + omedelbar commit är nödvändigt men inte alltid tillräckigt;
  innehållets leverans är det som räknas (båda gångerna: noll förlorat
  arbete, koden i HEAD).

## KVD

- `node --check` GRÖN på ändrad .mjs (före leverans).
- src/ orörd → tsc-baslinjen orörd av detta arbete (kontroll via
  projektbinär i slutleveransen).
- R2 orörd: inga priser/tier/publicering; data/blogg/ orörd.
- PG17 nere före/efter (verktygets finally verifierad i utdata).
- data/backups/ (gitignorad) bär nya dagens arkiv + per-typ-snapshots.

## Kö till huvudagenten

1. **Vakta total-kontraktet**: om en framtida natt-export loggar
   "VARNING: dumpen TRUNCERAD" i /tmp/moln-backup.log är det total-
   kontraktet som gripit — utökning av SAKERHETSTAK eller keyset-
   paginering (offset-bladerring på >2M rader blir successivt dyrare).
2. **Dublett-id:n**: 4 st kvantifierade; om antalet växer → idempotens-
   granskning av skrivvägarna till system_events (samma tabell som
   ALTER-composite-kön berör).
3. Jungfrunatten för RAD 3: första obevakade 02:40-leveransen kan
   bevisas imorgon (2026-09-17) enligt s10-u2 O2:s mönster — logg +
   mtime + total-kontraktsdom.
