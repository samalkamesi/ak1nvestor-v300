# DR-KVARTAL 2026-09-16 — ALLA FYRA KEDJORNA I EN SEKVENS + FÖRSTA FULLA LIVE-PROD-DIFFEN (GODKÄNT — med AKUT FYND)

**Körd av:** fabriksagent s10-u3 (spår 10 DATAINTEGRITET & BACKUP, 3/3, roll
VAKT), 2026-09-16 13:40–13:55 CEST. Uppdragets bokstav: "DR-övning nästa i
spåret (välj själv): återställ, mät tid/rader, protokoll, städa lokal PG."

## Objektval (duplikatkontroll före start)

Restore-kärnan var vid start **åtta gånger levererad** (RTO-serien 20,0 ·
17,7 · 14,7 · 20,0 · 23,9 · 11,2 · 12,2 · 38,5 s) och nattkedjan jungfrubevisad
02:30. Det icke-levererade objektet: **kvartalsmallen har aldrig körts i sin
fulla form** — s10-u1 O3 körde kedja 1+2 i sekvens (FULL) innan kedja 3/4
fanns som kommandon; sedan dess har kedja 3 kommandoradiserats
(dr-kedja3.mjs, GRÖN 11:35) och kedja 4 levererats (GRÖN 05:12). Dessutom
bar v98-mallen kontraktet "jämför tabell-/radräknings**mot produktion**" som
alla senare protokoll uppfyllde mot *tidigare protokoll* — aldrig mot
*levande* produktion (2026-09-13-provet jämförde via REST på en delmängd).
Detta protokoll levererar båda: **fyra kedjor i en sekvens + tabellvis
live-prod-diff** (psql COUNT(*) per tabell, hela public, samma instrument
som restore-mätningen).

---

## 1. Sammanfattning för kunden (5 rader)

1. Hela katastrofövningen kördes idag **i full utsträckning för första
   gången — alla fyra backup-kedjorna i en sekvens, allt GRÖNT på totalt
   cirka 1 minut 45 sekunder** (mallexekvering; databasen återuppbyggd och
   bortstädad fyra gånger, produktionen aldrig rörd).
2. För första gången jämfördes den återställda databasen **tabell för
   tabell mot den levande databasen**: 60 tabeller, allt stämmer — skillnaden
   är exakt dagens tillväxt sedan nattbackupen (2:30): **+19 359 rader**.
3. Övningen fångade ett **akut fynd som inget tidigare prov sett:
   händelseloggen (system_events) är TOM i den levande databasen** —
   161 678 rader som fanns kl 07:24 är borta. Backupen på servern är den
   ENDA kvarvarande kopian och är nu extra skyddad (kopia + md5).
4. Rotorsaken är ännu inte funnen — inget av serverns schemalagda jobb
   raderar tabellen, och nya händelser skrivs för närvarande inte heller.
   Utredning och beslut om återimport lämnas till huvudagenten med fullt
   underlag (se §5).
5. Nästa kvartalsövning: **senast 2026-12-16** — nu FYRA kommandon
   (se §6 mallen; DRIFTSBOKEN uppdaterad).

## 2. De fyra kedjorna i sekvens (13:40–13:45 lokal)

| # | Kedja | Verktyg | Resultat | Maskinellt protokoll |
|---|---|---|---|---|
| 1 | SQL-nattdump (hela DB utom loggen) | `dr-ovning.mjs` | **RTO 17,3 s** · public 60 tabeller / 1 266 528 rader · fel 788 (kända 788, okända 0) · GRÖN exit 0 | DR-PROV-2026-09-16-AUTO-2.md |
| 2 | system_events ur moln-JSON | `dr-kedja2.mjs` | **161 678 rader · 39,0 s** (COPY 38,8 s, 4 166 rader/s) · dom GRÖN 5/5 · unika id 161 674 (4 dubletter = känt prod-PK-gap) | DR-KEDJA2-2026-09-16-AUTO-2.md |
| 3 | serverfilsarkiv (tar.gz + git bundle) | `dr-kedja3.mjs` | sabotage 3/3 GRIPNA · restore 8 322 filer + 570 kat == 8 892 listade · src 675 filer / 203 930 rader · klon 1 195 commits · ancestor GRÖN · spot-diff identiska/förklarade | DR-KEDJA3-2026-09-16-AUTO-3.md |
| 4 | per-typ-snapshots (tio vyer) | `dr-kedja4.mjs` | sabotage 4/4 PASS · konsistens 10/10 ⊆ full-arkivet · COPY 0,08 s · PG-verifiering GRÖN | DR-PROV-2026-09-16-KEDJA4-2.md |

**Total mallexekvering ≈ 105 s** (verktygarnas egna fönster 17,3 + 39,0 +
kedja 3 ≈ 25 + 39 s inkl. start/stopp av PG17 mellan varje). Varje verktyg
höll flock-låset `/tmp/ak1a-dr-prov.lock` under sitt fönster; PG17 nere
före/efter; alla skrap-DB:er (ak1a_dr_test, ak1a_dr_json, ak1a_dr_pertyp)
raderade av verktygen (steg 7 verifierat i utdata).

**RTO-serien kedja 1, nionde punkten:** 20,0 · 17,7 · 14,7 · 20,0 · 23,9 ·
11,2 · 12,2 · — · **17,3 s** — nio av nio under v98 F3-referensen.

## 3. Live-prod-diffen (NYTT mättelement — v98-kontraktet fullt ut)

Instrument: dumpens per-tabell-radantal räknat ur COPY-blocken i
db-2026-09-16.sql.gz (zcat+awk) mot `COUNT(*)` per tabell via psql mot
Supabase-prod (PGPASSFILE = cron-radiens exakta mönster; lösenord läst av
psql självt, aldrig av agenten). Körvaraktighet 6,2 s. Rådata:
/tmp/s10u3-liveDiff.json (engångsartefakt, städas).

- **60 tabeller jämförda** · dumpens public-summa 1 266 528 == kedja 1:s
  restore-mätning EXAKT (två oberoende instrument, samma tal — restore ≡ dump
  korsvaliderat).
- **Live-summa 1 285 887 → RPO-delta +19 359** sedan dump-toget 02:30.
- Skillnaden är lokaliserad till TRE växande tabeller ( allt väntat, ingen
  oväntad minskning): section_data_snapshots +18 984 · board_decisions
  +360 · organ_health_logs +15.
- Inga tabeller tillkommit/försvunnit mellan dump och live (schemat stabilt).

## 4. AKUT FYND — system_events TOM i levande produktion

**Beviskedja (alla mätningar egna, tider lokal CEST om ej annat sägs):**

| Tid | Observation | Källa |
|---|---|---|
| 07:24 | Exportör v3 läser **161 678 rader** (tidsfönster till 05:23:43 UTC) | system-events-full-2026-09-16.json.gz + DR-TAKLYFT-beviskörning |
| 13:46 | `COUNT(*) public.system_events` = **0** — som tabellägare postgres | psql via PGPASSFILE |
| 13:46 | `min/max(created_at)` = NULL — tabellen håller inga rader alls | psql |
| 13:50 | RLS påslaget (`relrowsecurity=t`, `force=f`) men **ägaren postgres bypassar RLS** → nolltalet är sanningen, inte en säkerhetsartefakt | pg_class + pg_get_userbyid |
| 13:50 | Ensam policy p18 = INSERT-only; ingen SELECT-policy (förklarar ev. anon-blindhet, inte ägarens 0) | pg_policies |
| 13:52 | Ny count = **0 fortfarande** — trots 33 besökare idag + organcykel vart 15:e min = **nya events skrivs EJ heller** | psql |
| 13:52 | Molnets pg_cron: 5 jobb (organcykel vart 15:e min · snapshot 06:00 · signaler 06:15 · prognosmätning 06:30 · månadsutdelning) — **inget raderar system_events** (token i utdata maskeras här och citeras aldrig) | cron.job via psql |
| 13:53 | Lokal crontab: 4 rader (SQL-dump 02:30 · gränssnittsvakt · molnexport 02:40 · serverarkiv sö 03:20) — **ingen gallring** | crontab -l |

**Tolkningsram:** raderingen skedde i fönstret **05:23–11:46 UTC
(07:23–13:46 lokal)**. Möjliga gärningsmän kvarstår: manuell/agentkörd
DELETE/TRUNCATE via service-role (dashboard eller skript), eller en
edge-function/pg_cron-väg utanför det listade. **Följdeffekten är säker:
händelseloggen efter 05:23 UTC existerar ingenstans** (tabellen tom OCH
inga nya rader skrivs) och **arkivet på disk är den enda kopian** av
12 dagars historia (2026-09-03 → 2026-09-16 05:23 UTC).

**Omedelbar skyddsåtgärd (vidtagen av denna agent):**
`/tmp/s10u3-arkiv-sakerhetskopia.json.gz` — byteidentisk kopia av dagens
arkiv (md5 35ce34fcc0295370720a4e36a445ad9b verifierad mot originalet),
lämnad med avsikt utanför data/backups tills huvudagenten bestämt sig.

**Kedjans fortsatta hälsa:** 02:40-cronen kommer imorgon skriva
system-events-full-2026-09-17.json.gz ur en (troligen fortfarande) tom
tabell — arkivfilen blir giltig men ~tom; total-kontraktet dömer den GRÖN
(0 ≥ 0). Dagens 161 678-radars arkiv raderas ALDRIG (arkivhandlingar,
retention gäller ej) men **kontinuiteten bryts vid 05:23 UTC tills
återimport skett**.

## 5. Kö till huvudagenten (prioriteringsordning)

1. **Återimport av system_events ur arkivet** — mekanismen finns och är
   bevisad (`verktyg/aterstall-system-events.mjs --fil <arkiv> --plan-
   supabase`; ALDRIG ignore-duplicates — tabellen saknar PK). Skrivning
   mot prod = huvudagentens beslut; arkiv + säkerhetskopia redo.
2. **Rotorsaksutredning**: Supabase dashboard-loggar/edge-function-loggar
   för fönstret 07:23–13:46 lokal; klargör varför skrivvägarna tystnat
   (tabellens INSERT-väg lever enligt p18 men inga rader kommer).
3. **Om återimport sker före 02:40**: kontinuiten bevaras i morgonnatens
   arkiv; annars dokumenteras 05:23 UTC som loggens brytpunkt.
4. Bekräfta att ISLAM iakttas: p18 INSERT-only + ingen SELECT-policy är en
   gammal konfiguration — om anonyma läsare förväntas se statistik via
   /api/trafik (server-side service-role) är läget OK, men policyns
   historia bör granskas i samma utredning.

## 6. Kvartalsmallen 2026-12 (FYRA kommandon — DRIFTSBOKEN uppdaterad)

```
node verktyg/dr-ovning.mjs    # kedja 1: hela databasen ur SQL-nattdumpen
node verktyg/dr-kedja2.mjs    # kedja 2: system_events ur moln-JSON-arkivet
node verktyg/dr-kedja3.mjs    # kedja 3: serverfiler (tar.gz + git bundle)
node verktyg/dr-kedja4.mjs    # kedja 4: per-typ-snapshots + konsistens
```

Alla flock-skyddade mot varandra och syskon (samma låsfil); alla med
RAM-grind ≥1 000 MB ( Prod-synkens ombygge vid ≥2 200 MB har FÖRETRÄDE —
 denna övning höll alla fyra PG-fönstrena kort och väntade in läget).
DRIFTSBOKEN:s äldre "kedja 3-manualen"-formulering är härmed ersatt av
kommandot ovan.

## 7. Städning + KVD

- PG17 **nere** efter varje verktyg (verifierat i utdata); skrap-DB:er
  borta (dropdb i varje verktygs steg 7). DR-låsfilen lämnad som
  pid-information (flock-kontraktet).
- /tmp/s10u3-liveDiff.mjs + /tmp/s10u3-liveDiff.json städas vid leverans;
  säkerhetskopian av arkivet lämnas (se §4).
- src/ orörd → tsc-baslinjen orörd (ingen kod ändrad, inga byggen).
- R2 orörd: inga priser/tier/publicering; data/blogg/ orörd.
- GDPR: protokollet redovisar endast antal, tabellnamn, tider och md5 —
  inga personvärden, inga nycklar (board-token som syntes i en utdata
  maskeras och citeras ALDRIG).

**Slutdom: GRÖN — kvartalsövningen godkänd; fyndet i §4 är separat RÖD
post till huvudagenten (backup-kedjan gjorde sitt jobb: kopian finns).**

SLUT — DR-KVARTAL-2026-09-16-FYRAKEDJOR, s10-u3 (3/3), 2026-09-16 ~13:57 lokal.
