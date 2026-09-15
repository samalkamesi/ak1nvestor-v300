# DR-PROV 2026-09-15 — REPLIK — oberoende andra mätning + instrumentdiff + fabrikskollisionsfynd

**Utförd av:** fabriksagent s10-u3 (roll: vakt), manifest `auto-s10-1789466719858`,
2026-09-15 kl 12:05–12:20 CEST.

**Relation till huvudprotokollet:** `DR-PROV-2026-09-15.md` (s10-u2) är
huvudleveransen av kvartalsövningen och kvarstår oförändrad. Detta dokument
tillför tre saker som INTE framgår där: (1) en **oberoende andra
återställningsmätning** av samma dump, (2) förklaringen på **diffen 60 vs 68
"publika tabeller"**, och (3) protokoll över **fabrikskollisionen** under
övningen — med rotorsak och kur. Slutligen: oberoende bevis på att städningen
av lokal PG är fullständig.

---

## 1. Sammanfattning (5 rader)

1. Två **oberoende fulla återställningar** av samma natt-dump genomfördes idag:
   **14,7 s** (u3) och **17,7 s** (u2) — båda snabbare än referensbeviset
   20 s (våg 98 F3) trots att datat växt 5 %. RTO-slutsatsen är därmed
   **replikerbar**, inte ett engångsvärde.
2. Radtotalen är **identisk mellan måtten**: 1 246 728 rader i public-schemat;
   totalt **1 247 119 rader** över **95 tabeller** i alla scheman (fördelning
   nedan) — dumpens 95 CREATE TABLE = databasens 95 tabeller, exakt.
3. Diffen "60 vs 68 publika tabeller" är **förklarad och oskadlig**: 60 =
   public-schemat (exakt som v98 F3:s 60), 68 = public **+ storage** (8).
   Framtida protokoll bör redovisa måttet per schema.
4. **Fabriksfynd (viktigt):** manifestet gav alla tre spår-10-agenterna
   IDENTISK uppgiftstext; två agenter körde därför DR-flödet samtidigt mot
   samma skrap-DB och lokal PG17. Ingen data förlorades, men ett verifieringssteg
   avbröts mitt i (journal-bevis). Kur: unika uppgifter per manifest-id + en
   ägare av PG17-fönstret.
5. Städning verifierad oberoende: skrap-DB `ak1a_dr_test` existerar ej, PG17
   **down** — samma skick som före övningen.

## 2. Mina mätetal (u3, första restore-fönstret 12:07–12:09)

Källa (samma fil som u2): `data/backups/supabase/db-2026-09-15.sql.gz`
(30 812 829 byte, skapad 02:30 i natt; `gzip -t` OK på 1,4 s).

| Moment | Resultat | Tid |
|---|---|---|
| Start PG17 (`pg_ctlcluster 17 main start`) | online | ~2 s |
| Skrap-DB (`dropdb --if-exists` + `createdb ak1a_dr_test`) | skapad färsk | <1 s |
| **Full restore** (`zcat \| psql -q`) | **14 658 ms** | mätt med `date +%s%N` |
| Fellogg | **780 rader**, samtliga "role … does not exist" | — |
| Exakt count(*) per tabell (dynamisk SQL över alla scheman) | 95 tabeller, totalt **1 247 119** | ~25 s |

Rader per schema (exakt räkning i återställd DB):

| Schema | Rader | | Schema | Rader |
|---|---|---|---|---|
| **public** | **1 246 728** | | realtime | 82 |
| auth | 135 | | storage | 136 |
| supabase_migrations | 38 | | **Totalt** | **1 247 119** |

Nyckeltabeller (med jämförelse): auth.users **3** och profiles **3**
(oförändrat sedan 09-13), section_data_snapshots **1 157 484**, board_decisions
**46 274**, organ_health_logs **2 841**, courses **10**, course_modules
**122**, members **0**, system_events **0** (fyndet §5 i huvudprotokollet
bestyrks: tom, kolumnen `event_type`).

Felkategorisering (780): authenticated 208 · service_role 142 · anon 135 ·
dashboard_user 107 · supabase_admin 43 · supabase_auth_admin 41 ·
supabase_storage_admin 31 · supabase_realtime_admin 23 (=730) + ca 50 övriga
(scheman cron/net/vault, extensions). Samma kategori som v98 F3:s 768 —
**u2:s 780 och mitt 780 är oberoende bekräftade**.

## 3. Replicerbarheten (spårets starkaste resultat)

| Mått | u3 (replik) | u2 (huvud) | v98 F3 (referens) |
|---|---|---|---|
| Återställningstid | **14,7 s** | 17,7 s | 20 s |
| Dump | db-2026-09-15 (30,8 MB) | db-2026-09-15 (30,8 MB) | db-2026-09-11 (29,4 MB) |
| Rader i public | **1 246 728** | 1 246 728 | 1 187 291 |
| Restore-fel | 780 | 780 | 768 |

Två agenter, två oberoende körningar, samma dump → samma innehåll och
restaureringstid väl under 20 s. Kvartalsövingens RTO-mål (sekundnivå) är
dubbelt bevisat 2026-09-15.

## 4. Instrumentdiffen: 60 vs 68 "publika tabeller" (FÖRKLARAD)

- Dumpen innehåller exakt **95 `CREATE TABLE`**: public **60** · auth 23 ·
  storage 8 · realtime 3 · supabase_migrations 1 (noll partitioner).
- Min återställda DB: 95 bastabeller totalt — **exakt match**.
- u2 redovisade "68 publika tabeller" = **public 60 + storage 8**.
- v98 F3:s "60 publika tabeller" = public-schemat → dagens jämförbara tal är
  **60 = 60, oförändrat** (nya tabeller tillkommer inte; tillväxten sitter i
  rader, inte tabeller).

**Rekommendation till nästa kvartalsövning (senast 2026-12-15):** redovisa
tabellantalet i tre spalter — public / public+storage / alla scheman — så
undviks instrumentförväxling mellan protokollgenerationerna.

## 5. Fabrikskollisionsfyndet (rotorsak + kur)

**Händelseaxel (alla tider CEST, bevis i sudo-journal + postgres-loggen):**

- **12:05:19** — fabriken startar TRE barn (u1, u2, u3) med **identisk**
  uppgiftstext ("DR-övning … återställ, mät tid/rader, proto, städa lokal PG")
  — manifestet snatade evighetskatalogposten till alla tre (ps-utdata bevisar
  identiska prompter).
- **12:07:4x** — u3 (jag): PG17 startad, skrap-DB skapad, restore klar
  14,7 s (sista dump-satsen i postgres-loggen 12:08:44).
- **12:08:56** — ett syskon kör sina mätfrågor **mot samma skrap-DB**
  (sudo-journal: `n_live_tup`-toppen, kolumnen `type`, vy-listan — samtliga
  mot `ak1a_dr_test`).
- **12:09:13** — u3:s fulla count(*)-verifiering klar (resultaten i §2).
- **12:09:14** — "received fast shutdown request" i postgres-loggen: syskonet
  stoppar PG17 — u3:s avslutande frågor avbryts (connection refused). Därefter
  droppas skrap-DB:n (u3:s omstart ~12:11: "database ak1a_dr_test does not
  exist").
- u2:s kompletta eget prov + protokoll + commit (d29888d4) konstateras av u3.

**Konsekvens idag: noll förlorad data** (bådas huvudtal säkrade innan
krocken), men ett verifieringssteg avbröts mitt i och två agenter gjorde
samma dyra arbete (två fulla restores av 30 MB) — på en minnesknapp server
är det also onödig risk.

**Kur (till huvudagenten, fabrikens ägare — verktyg/agentfabrik.mjs berörs
EJ autonomt under pågående omgång):**
1. Manifest-generatorn ska aldrig ge två uppgifts-id samma objekt/fil-räckvidd
   ("välj själv"-uppgifter behöver disambiguering, t.ex. "u1: dump-slutmarkörer,
   u2: DR-övning, u3: retention" — kontexten listar ju tre olika objekt).
2. Driftsregel att protokollföra i DRIFTSBOKEN: **PG17 DR-fönstret ägs av EN
   agent i taget** — enkla mekanismen: låsfil `/tmp/ak1a-dr-prov.lock`
   (flock-mönstret), eller "den som startar PG17 ansvarar för stopp".
3. Worklog-kontrollen före leverans fungerar INTE mot samtidigt startade
   syskon (alla ser tom worklog vid 12:05) — därför är punkt 1-2 den riktiga
   kuren, inte "var bättre på att kolla".

## 6. Slutläge (u3:s oberoende verifiering efter allt)

- `ak1a_dr_test`: existerar ej (syskonets dropdb; bevisad vid omstart).
- PG17: **down** (stoppad av mig efter sista stickprovet; `pg_lsclusters`).
- Disk 78 GB ledigt; inga tempfiler kvar i repot (fellogg + räknefiler i
  `data/backups/` som är gitignorerat, respektive `/tmp`).
- Prod opåverkad hela övningen (skrap-DB var lokal PG17; prod-data lever i
  Supabase-molnet).
- GDPR: protokollet redovisar endast antal, fältnamn och tidsstämplar — inga
  personvärden.
- Kod berördes ej → tsc ej aktuellt; baslinjen orörd.

SLUT — detta dokument kompletterar (ersätter ej) DR-PROV-2026-09-15.md.
