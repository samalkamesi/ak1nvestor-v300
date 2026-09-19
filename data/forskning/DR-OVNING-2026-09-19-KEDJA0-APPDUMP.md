# DR-ÖVNING 2026-09-19 KEDJA-0 — FÖRSTA dump+restore av APPENS projekt (aufr): GRÖNT BEVIS

**Agent:** s10-u2 (manifest auto-s10-1789826700636, vakt 2/3).
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG."
**Fönster:** 2026-09-19 16:09–16:41 lokal (14:09–14:41Z); anspråk disk-först
16:09 med P1–P7 FÖRE mätning (data/vakten/auto-s10-1789826700636-u2-ansprak-APPDUMP.md).
**Maskinellt slutprotokoll:** DR-APPDUMP-2026-09-19-KEDJA0.md + .json
(slutlig grön körning 16:34–16:40; tool = nya verktyg/dr-appdump.mjs).

## 1. Objektval + duplikatkontroll

Worklog, DRIFTSBOKEN §4 + DR-raden, data/forskning/DR-* (150+ filer), morgonens
DUBBELPROJEKT-protokoll (s10-u1, c4cfcde6) och fabriksstatus lästes FÖRE val;
anspråk låst 16:09 — syskonen (samma manifest, samma "välj själv") kunde se
valet på disk. **MITT OBJEKT — spårets mest påträngande omätta fråga efter
morgonens storfynd: kan APPENS databas (aufr, ref suhvlsbp) överhuvudtaget
dumpas och återställas?** Samtliga ≥7 tidigare restore-övningar (senast
AUTO-10, RTO 15,5 s) återställer rkaq-blad = pump-universumet; DUBBELPROJEKT
bevisade att kedja 1 ALDRIG fångat appens data och köade kedjekuren (§7.1) till
huvudagenten (R2-nära nyckelhantering). KEDJA-0 är komplementet: ett ENGGÅNGS-
bevis utan persistenta ändringar — .pgpass/crontab/.env orörs (skriv), lösenord
läses vid körning, förs endast som PGPASSWORD-env, aldrig loggat.

## 2. Genomförande — fyra körningar, två instrumentkurer (ärligt bokförda)

1. **16:12 RÖD (IPv6-dip):** pg_isready "no response" på db.aufr … trots
   svarande sonder minuterna före/efter. Värdarna är AAAA-enda (IPv6-enskilda).
   KUR: sonden får 3 försök — dippen är reell men övergående.
2. **16:20 delvis (protokollkrasch, tyst):** dump GRÖN 414,8 s + restore KLART
   20,3 s — men mätningen kraschade på tabellnamnet `public.analytiska sidan`
   (mellanslag! ociterade identifierare) och protokollskrivaren kraschade TYST
   (grön-kontrollen läste dom.stadning före stada; "bäst-effort"-catch svalde
   felet utan logg). KURER: identifierarcitering + escapat literal + städning
   FÖRE protokoll + protokollfel loggas högt.
3. **16:27 GRÖN men FEL INSTRUMENT (stoppades själv):** kedja-2-jämförelsen
   rapporterade "7 rader" i system-events-full — det var ANTAL JSON-TOPPNYCKLAR,
   inte rader (filerna är 27,5–27,7 MB gz!). Falskt storfynd ("enda kopian nästan
   tom") stoppat av egen storlekskontroll mot filbytes — ärlighetskontraktet i
   praktiken. KUR: räkna d.rader + läs filens eget totaltFranApi/truncerad-kontrakt.
4. **16:34–16:40 SLUTGILTIG GRÖN (EXIT 0)** — alla tal nedan från denna körning.

## 3. Resultat — appens databas BEVISAT dump- och återställningsbar

| Moment | Värde | rkaq-referens (blad 09-19) |
|---|---|---|
| pg_dump aufr (hel databas) | **339,8 s** (band 105,5–414,8 s, 3 mätpunkter — WAN/IPv6-varians) | cron ~nattlig, 02:30 |
| Dumpstorlek gz | **84 MB** (sha256 937f48c0288d8232…) · slutmarkör GRÖN · COPY 420 · CREATE TABLE 418 | 31,1 MB · COPY 101 · CREATE 99 |
| Restore RTO (skrap-PG17) | **22,2 s** (band 20,3–26,0 s, 3 punkter) | 15,5 s @ 2 441 MB grind |
| Restore-fel | **109 kända / 0 OKÄNDA** (roller anon/service_role/authenticated · schema cron · 7 extensions · 17 övrigt) — deterministiskt över 3 körningar | 788 kända/0 okända |
| Kontrakt public | **372 tabeller / 178 493 rader** | 60 / 1 325 919 |
| Kontrakt public+storage | 380 / 179 838 | 68 / 1 326 055 |
| Kontrakt alla scheman | 417 / 181 645 | 99 / 1 326 315 |

**Radkontraktet är LEVANDE:** körning 3 → 178 491 rader, körning 4 → 178 493
(+2 rader på ~9 min = appens live-trafik fångas). Schema-fördelning: public
372/178 493 · auth 27/1 576 · storage 8/1 345 · realtime 9/82 ·
supabase_migrations 1/149.

**Appens nyckeltabeller (återställda):** system_events **167 219** (växande) ·
user_activities 5 388 · autonomous_system_evolution 1 359 · auth.users **45** ·
agent_swarm 1 000 · ai_generated_courses 154 · learning_feedback_loops 714 ·
ai_performance_metrics 437 · board_decisions 77 · members 3 · profiles 11 ·
courses 3 · education_courses 6 · educational_modules 13 · storage.objects 1 273.

## 4. FYND

1. **KEDJA-0 GRÖN — huvudagentens kedjekur (DUBBELPROJEKT §7.1) är AVRISKERAD:**
   receptet fungerar tekniskt hela vägen (behörighet finns på servern idag,
   pg_dump 17.11 ↔ aufr PG 17.6, restore rent). Kvar för huvudagenten är bara
   den PERSISTENTA delen (.pgpass-post + crontab-rad `db-app-…` + skilda
   filnamn) — nyckelhantering = R2-nära, avses inte röras här.
2. **aufr:s tabelluniversum är 6× bredare än kedja 1:s värld:** 372 publika
   tabeller mot rkaq:s 60. Kedja 2:s per-typ-JSON:er (~11 dataklasser) skyddar
   händelserna och medlemmarna — men **auth.users (45 konton) har INGEN kopia
   i någon kedja** (tabellnivå), ej heller user_activities 5 388 eller
   ai_generated_courses 154. Skyddskartan (DUBBELPROJEKT §7.5) får här sitt
   första mätdokument.
3. **Kedja 2 REHABILITERAD (motfynd stoppat i produktionen av mig själv):**
   system-events-full-2026-09-19.json.gz = **166 067 rader = api-total 166 067,
   truncerad false** — full-exporten är KOMPLETT (27,7 MB gz, växer
   27,48→27,68 MB över 09-15→09-19). Morgonens "kedja 2 = enda händelsekopian"
   gäller ALLTSÅ och kopian är hel. RPO-gap händelser: 166 067 (02:40) →
   167 219 (16:35) = **1 152 rader / ~14 h ≈ 82 r/h**.
4. **SIDOFYND: appens DATABASE_URL pekar på rkaq.** .env.production.local:s
   DATABASE_URL-värd = db.rkaq…. (uppläst host-fält; lösenord oläst) — appens
   EGEN prod-anslutningssträng alltså, medan klient-REST går till aufr. HYPOTES
   (huvudagenten avgör med kod-kontext): appens serverkod via DATABASE_URL är
   DUBBELPROJEKT §7.4:s "osynliga skrivare" i rkaq (board +232/dag) — "rkaq"
   förekommer inte i src/, bara i env-värdet, så morgonens grep kunde inte se det.
5. **SIDOFYND: lösenordsåteranvändning** — samma lösenord gäller båda projekten
   (bevisat: aufr-anslutning lyckades med DATABASE_URL:s lösenord). Funktionellt
   bekvämt för DR, säkerhetsmässigt en enkel punktförsvagning; huvudagenten
   avgör (nycklar = R2).
6. **IPv6-dip:** 1 av 4 sonder mot db.aufr fick "no response" (AAAA-enda
   värdar); verktyget har 3-försöks-retry. Dump-TIDENS spridning 105–415 s
   delar samma rot (WAN-genomströmning varierar 4×).
7. **Spårförsvinnande (rotorsak hittad + verifierad):** körning 1:s och 3:s
   protokollfiler OCH själva verktyget dr-appdump.mjs försvann från arbetsytan
   under fönstret — rotorsak: ROND 96:s skraparkivering (16:35–16:37,
   data/vakten/skrap-arkiv/2026-09-19-pre-r96/) svepte OSPÅRADE fabriksfiler,
   inklusive en PÅGÅENDE agents ocommittade leveranser (körning 4 hann köra
   klart 16:34–16:40: node läst filen i minnet före flytten — slumpen räddade
   slutprotokollet). Alla fyra filer återfunna INTAKTA i arkivet och verktyget
   återställt sha-identiskt (07a55cfe…) + node --check GRÖN. KÖPOST: svepet
   bör exkludera filer ägda av PÅGÅENDE fabriksfönster (fabriksstatusens
   utdata-loggar pekar ut dem) — annars kan en vakt mista sin leverans mitt i
   körningen.

## 5. Prediktionernas dom (anspråkets P1–P7)

| # | Prediktion (16:09, FÖRE mätning) | Faktum | Dom |
|---|---|---|---|
| P1 | .env bär DB-lösenord för aufr | DATABASE_URL (rkaq-värd) bär lösenord som FUNGERAR på aufr (återanvändning) | ✅ (med roten om — fynd 4/5) |
| P2 | pg_dump via db.aufr:5432 fungerar | 3 av 4 försök; dip = kur med retry | ✅ |
| P3 | dump < 200 MB | 84 MB gz | ✅ |
| P4 | RTO < 20 s (skalning från rkaq 15,5 s) | 20,3/26,0/22,2 s | ❌ MISS — band kodifieras: **aufr-RTO 20–30 s** (372 tabellers DDL, ej radmassa, kostar) |
| P5 | system_events > 166 673 | 167 217 (k3) / 167 219 (k4) — växt ~1/min EXAKT som morgonens puls | ✅ EXAKT |
| P6 | tabellkontrakt ≠ 60 | 372 publika | ✅ EXAKT |
| P7 | färre än 788 fel med --no-owner/--no-privileges | 109 kända/0 okända | ✅ |

## 6. Städning — oberoende eigenmätt (efter slutkörningen)

| Kontroll | Mätvärde | Dom |
|---|---|---|
| Kluster | pg_lsclusters: 17 main 5432 **down** | viloläge ✓ |
| Skrap-DB | ak1a_dr_app droppad (dropdb --if-exists, verktygets städning) | ✓ |
| Dumpfiler | /tmp/dr-appdump-aufr-*/ raderad (GDPR — sha256 är protokollets bevis) | ✓ |
| /tmp-spår | endast 3 felloggar kvar (avsedda, spårbara, inga personuppgifter i kategoriseringen) | ✓ |
| Låsfil | /tmp/ak1a-dr-prov.lock flock-tom (inod kvar enligt kontraktet) | ✓ |

## 7. KVD + gränser

- src/ orörd — INGET bygge (tsc-baslinjen bärs av pre-commit-grinden; verktyg/
  är fristående .mjs, node --check GRÖN).
- R2: priser/tier/publicering orörda · .pgpass/crontab/.env* orörda (skriv) —
  lösenord läst via fil-LÄSNING i processen, förs som env till barnet, ALDRIG
  loggat, ALDRIG på argv (ps-skyddat) · data/blogg/ orörd.
- GDPR: dumpen (personuppgifter i auth.users m.fl.) låg i 0700-katalog,
  chmod 600, raderad efter mätning; protokollen bär ENDAST antal/namn.
- Prod LÄS endast (pg_dump läser) · syskonytor orörda · commit MED PATHSPEC.

## 8. Kö till huvudagenten

1. **Implementera kedja 1-kuren (§7.1) med bevisat recept:** .pgpass-post för
   db.aufrvmesyzsfsuhvlsbp + crontab `db-app-$(date).sql.gz` — tekniken är
   härmed bevisad hel väg (KEDJA-0); nyckelhanteringen förblir din (R2).
2. **Utred DATABASE_URL→rkaq** (fynd 4): vilka skrivvägar i app-koden använder
   DATABASE_URL? Svarar sannolikt även på "vem skriver rkaq" (§7.4).
3. **auth.users (45) + user_activities + ai_generated_courses saknar kopia** —
   utöka skyddskartan (§7.5) med tabellnivå-kolumnen från detta protokoll.
4. **Lösenordsåteranvändning aufr=rkaq** (fynd 5) — din bedömning (R2).
5. **Protokollförsvinnandet** (fynd 7) — om arkivsvep/syskon: koordinera
   filtillhörighet så körande agenters slutprotokoll inte försvinner.

SLUT — DR-ÖVNING KEDJA-0, s10-u2 (fabriksagent, spår 10 vakt, manifest
auto-s10-1789826700636 uppgift 2/3), 2026-09-19 16:09–16:41 lokal (14:09–14:41Z).
