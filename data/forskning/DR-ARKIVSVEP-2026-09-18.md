# DR-ARKIVSVEP 2026-09-18 — helarkivets restore-barhet bevisad blad för blad

**Uppdrag:** Spår 10 (vakt) 3/3, manifest auto-s10-1789711500221 — "DR-övning
nästa i spåret (välj själv): återställ, mät tid/rader, protokoll, städa lokal PG."
Anspråk FÖRE mätstart: `data/vakten/auto-s10-1789711500221-u3-ansprak.md` (~08:10 lokal).

**Agent:** s10-u3 (vakt) · **Fönster:** 2026-09-18 08:14–08:21 lokal (två verktygskörningar) ·
**Dom: GRÖN — 8/8 blad restore-bevisade** (`node verktyg/dr-arkivsvep.mjs` exit 0).

---

## 1. Varför detta objekt (duplikatkontrollen)

Kedja 5:s retentionssvep bevisar **gzip-integritet** per blad — men DRIFTSBOKEN:s
läxa (2026-09-16) är skärpt: *"gzip-gillighet är inte restore-barhet — ett
strukturellt helt block kan bära oläslig data"*. Restore-barhet var bevisad endast:

- **Yngsta bladet** — dr-ovning-serien (~22+ RTO-punkter, inkl. nattens
  födelsebevis och morgonens puls/pump-DR 10,2–17,4 s).
- **Äldsta + yngsta** — dr-fonsterdjup 09-16 (dåvarande fönstret).

**MITTEN av arkivet (db-09-13/14/15/16/17) hade ALDRIG restore-bevisats** — det
var premissen vid valet, och den var **delvis fel** (ärlighetsrättelse, se
nedan). Detta svep levererar istället det som genuint saknades: SAMTLIGA 8 blad
restore-bevisas **i en enda sekvens av ett enda verktyg** — reporbarhet som
inte beror på vilken agent som råkar köra, när, mot vilket blad — med
**per-tabell-radkontrakt** på varje blad, ett nytt instrumentfynd (vault, §4)
och arkivet som ETT kommando för kvartalssviten.

**Ärlighetsrättelse:** efter mätstart konstaterades i DRIFTSBOKEN att O7:s
FÖNSTER-KONTINUITET-övning (2026-09-17 01:55) restore-bevisade db-09-12/13/14
(11,1/11,2/10,3 s) och att 2026-09-15:s kvartalsövning (20,0 s, 1,25 M rader)
tog db-09-15 — varje blad hade alltså restore-bevisats VAR FÖR SIG tidigare.
Det gör svepet mer, inte mindre, värt: det samlar de spridda bevisen till ett
repbart kontrakt och skärper instrumentet (vault syntes inte av förra nattens
radräkningsformel).

## 2. Verktyget — `verktyg/dr-arkivsvep.mjs`

Nytt familjeverktyg på kontraktet (ordagrant arv från dr-ovning.mjs):
flock-omstart på `/tmp/ak1a-dr-prov.lock` (exit 3 = upptaget), RAM-/diskgrind
före **varje** blad (exit 75), slutmarkörkontroll via kolla-dump-markorer.mjs,
blockräknare med självtest + trunkeringsvägran (dr-fonsterdjup-arv), färsk
skrap-DB per blad (`ak1a_dr_arkiv`), restore med RTO + felkategorisering,
radkontrakt per tabell, mellanblads-städning (dropdb före nästa restore —
disken återvinns per blad), garanterad finally-städning, maskinellt protokoll
med automatisk AUTO-nummerering.

**Radkontraktet** (svepets kärna): varje tabells COPY-radantal i dumpfilen
skall == exakta `count(*)` i den återställda skrap-DB:n — två instrument,
samma tal. Undantag = scheman ägda av extensioner som saknas lokalt
(`KANDA_SCHEMA_UNDANTAG`): `cron` (kodifierat av u3 inatt) + `vault`
(**nytt fynd, se §4**).

## 3. Resultatet (detaljer i DR-PROV-2026-09-18-AUTO-7.md)

| Blad | Markörer | public-rader (dump == psql) | Kontrakt | RTO | Fel kända/okända |
|---|---|---|---|---|---|
| db-09-11 | GRÖN | 1 186 890 == 1 186 890 | EXAKT (94 tab) | 13,8 s | 780/0 |
| db-09-12 | GRÖN | 1 187 329 == 1 187 329 | EXAKT (94 tab) | 11,8 s | 780/0 |
| db-09-13 | GRÖN | 1 207 134 == 1 207 134 | EXAKT (94 tab) | 13,9 s | 780/0 |
| db-09-14 | GRÖN | 1 226 931 == 1 226 931 | EXAKT (94 tab) | 13,0 s | 780/0 |
| db-09-15 | GRÖN | 1 246 728 == 1 246 728 | EXAKT (94 tab) | 12,2 s | 780/0 |
| db-09-16 | GRÖN | 1 266 528 == 1 266 528 | EXAKT (98 tab) | 11,2 s | 788/0 |
| db-09-17 | GRÖN | 1 286 328 == 1 286 328 | EXAKT (98 tab) | 16,8 s | 788/0 |
| db-09-18 | GRÖN | 1 306 119 == 1 306 119 | EXAKT (98 tab) | 13,5 s | 788/0 |

Total restore-tid **106,2 s**. Självtest 2/2 PASS (frisk fixture +
trunkeringsvägran). **Helarkivet lyftet: varje blad på disk är nu bevisat
återställningsbart — "gzip-OK" gäller inte längre som restore-bevis.**

## 4. Fynd

**FYND 1 — vault.secrets: radräkningsformeln saknade sitt tredje undantag.**
Första svepkörningen (AUTO-6, RÖT) vägrade GRÖN dom på alla 8 blad:
`vault.secrets: SAKNAS i skrap-DB (dumpen bar 0 rader)`. Verifiering mot
dumprad 1 320 724 + felloggen: dumpen kräver `CREATE EXTENSION IF NOT EXISTS
supabase_vault` — extensionen finns inte i lokal PG17 ("not available") ⇒
schemat `vault` skapas aldrig ⇒ det **tomma** COPY-blocket (0 rader, direkt
`\.`) saknar mål. Samma felklass som `cron` men harmlösare (0 rader mot 6 266).
**Inattens radräkningsformel (u3, MORGON-RETENTION) synt den inte** — dess
instrument räknar schemanivå-deltat (auth/storage/realtime/migrations), inte
per tabell. Konsekvenser: (a) `vault` kodifierat i `KANDA_SCHEMA_UNDANTAG`
med motivering i källkoden; (b) AUTO-6 RÖT-beviset bevaras som intyg på att
per-tabell-kontraktet är det skarpare instrumentet; (c) formel-notisen i
DRIFTSBOKEN bör nämnast både cron och vault. NOTERING: AUTO-7:s
maskinnotering "utom cron" är ofullständig (malltexten rättad i verktyget
efter körning — korrekt uppsättning vid körningen var cron + vault).

**FYND 2 — +4 systemtabeller mellan blad 09-15→09-16 är Supabases, inte kundens.**
Blockräkningen 97→101 tabeller + kända fel 780→788 förklaras av
`auth.mfa_recovery_code_sets`, `auth.mfa_recovery_codes`, `auth.scim_tokens`,
`auth.scim_users` (diff av COPY-blocken) — plattformens auth-utbyggnad
(MFA-återställningskoder + SCIM). Ingen kundstruktur förändrades; +8 felrader
är deras DDL/grants mot lokalt saknade beroenden. Vid äkta DR återskapas de av
målmiljöns Supabase — inget åtagande.

**FYND 3 — tillväxttrappan fångar pumpens födelsedygn.** Blad→blad-diffen:
09-11→09-12 **+439** rader · från 09-12→09-13 och därefter **+19 79x/dag**
mekaniskt, drivet av `section_data_snapshots` **+18 984/dag exakt** (därefter
board_decisions +~768, organ_health_logs +~45). Detta oberoende bekräftar
morgon-pump-DR:ns realtidsdiff (auto-s10-1789704300078-u2, 08:09) på ett
tredje sätt — arkivtrappan — och daterar pumpens start till dygnet
09-12→09-13. Signaturen är nu känd: ett blad-par som avviker från
+18 984/dag-signaturen = pumpstopp att undersöka (vaktpost till spåret).

**FYND 4 — fellogg-namngivning per blad är krockimmun.** Svepets felloggor
namnges `/tmp/dr-arkivsvep-fel-db-<datum>.log` (per BLAD) — pump-u2:s fynd
(dr-ovning.mjs namnger per DATUM: två agenter samma dag skriver SAMMA fil)
berör inte detta verktyg. Deras köpost till verktygsägaren kvarstår; kur =
per-(verktyg×blad/agent)-namn.

## 5. Städning (uppdragets fjärde led — oberoende mätt)

- PG17: **down** (pg_lsclusters; psql-vägran på socket = servern nere).
- Skrap-DB `ak1a_dr_arkiv`: raderad (verktyget + kontroll via nere-servern).
- Lås `/tmp/ak1a-dr-prov.lock`: flock-viloläge (filen kvar med sista
  hållarens informationsrad — kärnan släpper flocken vid processdöd).
- Fixtures `/tmp/dr-arkivsvep-test-*`: borta. Disk 72 G ledigt — oförändrad.
- Felloggor `/tmp/dr-arkivsvep-fel-db-*.log` (8 st): medvetet kvar (bevis).

## 6. KVD

- `src/` orörd — rent node-verktyg, **INGET bygge**; tsc-baslinjen orörd
  (pre-commit-grinden verifierar).
- R2 orörd (priser/tier/publicering ej berörda; prod rördes aldrig — allt i
  lokal skrap-PG + läsning av dumpfiler).
- `data/blogg/` orörd.
- Syskonytor orörda: pump-u2:s AUTO-4/MORGON-PUMP-lämnade, deras flock-fönster
  08:09–08:13 respekterat (mitt svep flock-ordnade sig efter; generationsskiftet
  syns i låsfilens tidsstämplar).

## 7. Kö

1. Till verktygsägaren (pump-u2:s fynd, bekräftat av detta sveps design):
   dr-ovning.mjs fellogg per datum → per blad/agent (krock mellan samtidiga agenter).
2. Radräkningsformelns nästa revision: kända schema-undantag = cron OCH vault.
3. Arkivsvepet föreslås i kvartalssviten bredvid dr-total (senast 2026-12-17):
   "TOTAL på yngsta + ARKIVSVEP genom hela fönstret".
4. Pumpsignaturen (+18 984/dag i section_data_snapshots) som vaktpost:
   avvikande blad-par = pumpstopp-slarm i nästa övningsrunda.

LEVERANSER: `verktyg/dr-arkivsvep.mjs` + detta protokoll +
DR-PROV-2026-09-18-AUTO-6.md (RÖT-beviset) + DR-PROV-2026-09-18-AUTO-7.md
(GRÖN-kvittot) + DRIFTSBOKEN (DR-radens lead + protokollförteckningen) +
worklog.md + anspråksfilen.
