# V166-KONFIG — KONFIGINTEGRITETS-GLAPPKATALOGEN (full konfigjämförelse)

**Rond 297 [organ:Φ] · 2026-09-28 · underlag (LÄSANDE) — crontab-ytan orörd autonomt (r290-stoppregeln)**

Uppdrag (PIPELINE-KO r296-bokning): r294:s fynd — crontab.reference saknade
natt-TBT-raden trots levande drift — byggs ut till FULL konfigjämförelse:
crontab vs reference vs faktiska cron-spår, glappkatalog med allvarsklass.

Metod: läsande sondering (subagent + sessionens egna verifieringar) mot
faktiska ytorna: `crontab -l` (9 rader), båda referenskopiorna av
crontab.reference + pm2-processer.reference, driftspåren i /home/ak1a/AK1
(crontab och pm2 kör i PROD-trädet — arbetsytan och AK1 är två separata
träd, se S0), `pm2 jlist` + ~/.pm2/dump.pm2, /etc/crontab + /etc/cron.d,
~/.config/systemd/user (finns ej).

---

## S0 — FÖRFÖRSTÅELSE (två träd + tidszon — påverkar all tolkning)

- **Två träd**: `/home/ak1a/AK1` = prod-trädet (crontab-rader, pm2 och
  cron-skript kör här); `/home/ak1a/agent/ak1` = arbetsyta/repo. Driftspår
  skall läsas i AK1-trädet. Referensfilerna synkas dit av prod-synken.
- **Tidszon**: nya servern (SSD Nodes, 208.87.129.108) kör **Etc/UTC**
  (timedatectl). Crontab-kommentarernas "lokal tid" skrevs på Contabo
  (Europe/Stockholm, CEST=UTC+2). All schemaläggningsSEMANTIK gluffade
  +2 h vid serverbytet v190 (cutover ~02:52 UTC i natt) — se G3.
- **Cutovern i natt**: db-cutover-test.sql.gz 02:52; pm2 dump.pm2 savad
  05:14; gränssnittsvakt-cron bevisad 07:17 UTC (cron.log GRÖN) ⇒
  crontaben installerades på nya servern nån gång 05:14–07:17 UTC,
  dvs. EFTER alla morgontider (02:30–06:27) — förklaringen till G2.

## FAKTISK CRONTAB (9 rader, `crontab -l` 2026-09-28 ~13:0x UTC)

| # | Rad | Referens före r297 | Spår i prod-trädet | Tolkning |
|---|-----|--------------------|--------------------|----------|
| 1 | `30 2 …pg_dump rkaq…` | JA (med `<DATABASE_URL>`-joker) | INGA db-*.sql.gz efter cutovern (endast manuella cutover-dumpen 02:52); /tmp/supabase-backup.log finns ej | Körde nattligt på Contabo; första UTC-epoch-körning väntas i natt 02:30 UTC |
| 2 | `17 1,7,13,19 …granssnittsvakt-cron.sh` | JA | cron.log: 0117 + 0717 GRÖN idag; granssnitt-2026-09-28T074038.json | **LEVER** — enda raden med dagens spår |
| 3 | `40 2 …backup-fran-molnet.mjs` | JA | /tmp/moln-backup.log finns ej på nya servern | Första UTC-körning i natt |
| 4 | `20 3 * * 0 …arkivera-server.mjs` | JA | /tmp/server-arkiv.log finns ej (söndag = igår, på Contabo) | Nästa söndag 03:20 UTC |
| 5 | `17 4 …doda-lankar-externa-cron.sh` | **NEJ → r297 JA** | data/vakten/doda-lankar-externa-*.json SENAST 19–21 sep | **G5**: tyst sedan 21 sep ÄVEN på Contabo |
| 6 | `50 2 …dumpa-app-db.sh` | **NEJ → r297 JA** | /tmp/supabase-appdump.log finns ej | Första UTC-körning i natt |
| 7 | `27 6 …rop-halsa-cron.sh` | **NEJ → r297 JA** | rop-halsa-cron.log mtime 27 sep 04:31 UTC (= 06:31 CEST — Contabo-epokens kadens levde) | Första UTC-körning i natt 06:27 UTC |
| 8 | `27 3 …natt-tbt-cron.sh` | **NEJ → r297 JA** | o151-natt-cron.log sista rad 28 sep 01:28 UTC: "AVBRUTEN: last ej tyst (busy 28.4 %)" = Contabo-epokens sista försök under cutover-lasten; ts i dom-filerna 27 sep 01:27Z | Kontinuiteten bröts i natt; första UTC-körning 03:27 UTC |
| 9 | `37 5 …beroende-vakt-cron.sh` | **NEJ → r297 JA** | beroende-vakt-*.json 27 sep 03:37 UTC (= 05:37 CEST ✓) | Första UTC-körning i natt 05:37 UTC |

## GLAPPKATALOG (allvarsklassat)

### G1 — HÖG · Vaktdesignglapp: 5 rader utanför referensen (KURAD denna våg)
Konfigintegritetsvakten larmar ENDAST på SAKNADE referensrader; crontab-rader
utanför referensen noteras som INFO "okritiskt" (beslut 6:s design). Fem
rader (o94 döda länkar, s10-u3 app-dump, o136 rop-hälsa, o151 natt-TBT,
o164 beroendevakt) bokfördes ALDRIG i crontab.reference — hade någon
plockats bort hade vakten förblivit GRÖN. **KUR (verkställd r297, före
detta dokuments push)**: samtliga 5 rader tillagda ordagrant i
crontab.reference med dokumentation + tidszon-varningar; vakt-körning i
arbetsytan: **GRÖN 9/9 referensrader + 4/4 pm2 — och INFO-raden om okända
rader är BORTA** (0 extra). Radernas försvinnande larmar nu inom 10 min.

### G2 — HÖG (bevakas) · 7 av 9 jobb saknar dagens spår på nya servern
Förklaring (högst sannolik, se S0): crontaben installerades 05:14–07:17 UTC,
efter dagens 02:30–06:27-fönster. **Diskriminerande test = natten till
2026-09-29**: förväntade nya spår 02:30 (db-*.sql.gz), 02:40
(moln-backup.log), 02:50 (supabase-appdump.log), 03:27 (o151-natt-cron.log),
04:17 (döda-länkar), 05:37 (beroende-vakt), 06:27 (rop-hälsa) — allt UTC.
Bevakas av nästa rond(er); uteblivna spår ⇒ escalation per DRIFTSBOKEN.
INTE en kodändring — driftsänkan är serverbytets eftersläpning.

### G3 — MEDEL (VÄNTAR KUND) · Tidszonsförskjutningen UTC
Designade fönster är ankrade i Contabo-CEST: "tystaste lastfönstret" för
natt-TBT var 03:27 lokal = 01:27 UTC (kontinuerligt bevisat i
o151-natt-cron.log); på SSD Nodes avfyras raden 03:27 UTC = 05:27
stockholm — och prod-synkens nattbyggen löper 20:57–02:45 UTC, dvs.
03:27 UTC ligger ofta i EFTERMIDDAGSHÖGTRYCK (svensk förmiddag) medan
mätarens design vill ha natt-stilla. Samma +2 h gäller alla
"lokal"-kommentarer. **Omankring = crontab-ytan = VÄNTAR KUND (R2-lik
stoppregel r290).** Underlag föreslår (vid kundbeslut): natt-TBT →
`27 1 * * *` UTC (bevarar 03:27-stockholm-designen), övriga rader granskas
vartefter. Referensens rad 8 bär varningen tills beslut finns.

### G4 — STÄNGD r298 · crontab-korrekt.txt märkt HISTORISKT
data/infra/contabo/crontab-korrekt.txt (Contabos /etc/crontab-norm, våg
122A) är märkt HISTORISKT med fullständig ödes-tabell: vagscan→Vercel Cron
(lever), kvalitetsvakten→daemon 07:02, ak1a-halsa→död med Contabo men
täckt av pm2-väktarna, övriga pumpar→Vercel Cron. Filen kan aldrig
appliceras på SSD Nodes (sudo förbjudet) — källbild behållen oförändrad.

### G9 — MEDEL (NY, funnen r298) · Vercel Cron är AKTIVT — 12 dagliga jobb lever på Vercels compute
Sond (r298, 2026-09-28 13:13Z, läsande mot system_events): SENASTE vagscan-
rad = **2026-09-28T05:05:22Z** — exakt Vercel Crons `0 5 * * *`-schema
(vercel.json). Slutsats: Vercel-cronlagret eldar trots "Vercel-backup
(passiv)" i AGENTS.md — 12 jobb (autonom 00:00, seo-refresh 03:00,
vagscan 05:00, vagvalidering 05:30, datacache 06:00, email 06:30,
kvalitet 07:00, nyheter/scan 08:00, oversatt 10:00, expand-courses 12:00,
portfolj-uppfoljning mån 1:a 07:00, akm3-kalibrering 2:a 05:20) kör mot
VERCEL-deploymentens egna rutter och skriver till delad Supabase.
Riskbilden: (a) Vercel-deploymenten åldras om GitHub-speglingen från
kundens arbetsstation stannar (cron kör då GAMMAL kod — ingen märks yta);
(b) beroende utanför kundens server = enkel felpunkt utan lokal vaktyta;
(c) portfolj-uppfoljning har 0 rader totalt i system_events (typnamn?
aldrig kört? oktober-rotenen 1/10 diskriminerar). ÅtgärdFörslag (bokas
som egen våg, autonom yta): migrera de 12 ropen till pumpor-daemonen
(curl mot localhost, samma mönster som ra-gallring 04:41) — då äger
servern hela schemaläggningen och Vercel-cron kan stängas av i kundens
Vercel-konto (R2-adjacent: Vercel-ytan är kundens — MIGRERINGEN är
autonom, AVSTÄNGNINGEN är kundens).

### G5 — MEDEL (bevakas i natt) · Döda-länkar-spåren stannade 19–21 sep
data/vakten/doda-lankar-externa-*.json senast 19–21 sep — ÄVEN före
cutovern, på Contabo. Två hypoteser: (a) jobbet dog i ~19–21-sep (övervakning
tyst i 7 dygn); (b) spår-skrev-inte/migrerades-ej. Nattens 04:17 UTC-körning
diskriminerar: ny fil ⇒ (b) eller återuppstånden; fortsatt tystnad ⇒ (a)
och rot-jakt nästa rond (skriptet + loggen då).

### G6 — LÅG (observeras) · Mål-återarmningens kallstarts-timeout ~2 %
(r296-fynd): POST /api/studio/session 30 s-AbortSignal ~38 s efter deploy ⇒
7 timeouts / 336 framgångar sedan 19/9, samtliga strax efter deploy.
Redundant skydd lever (GET återarmar mal=null; hjärtat kvarstår). Retry-gren
byggs ENDAST om fönstret växer (bokningsvillkoret kvarstår).

### G7 — INFO (grönt) · pm2 4/4
ak1a, ak1a-pumpor (taskset -c 0-3), pumpor-hundvakt, pulsvakt — alla
online, matchar pm2-processer.reference och dump.pm2 (savad 05:14).
Daemon-friskhetsvakten (v195) bevakar dessutom kod-på-disk ≠ kod-i-minne.

### G8 — INFO (artefakt) · natt-TBT-filernas ts vs mtime
dom-o151-natt.json + sammanfattning: ts-innehåll 27 sep 01:27Z men mtime
28 sep 02:16 — artefakt av cutover-trädmigreringen (filer kopierade/berörda
under flytten). Ingen åtgärd; nattens mätning skriver färskt ts.

## VERKSTÄLLT Denna våg (r297)

1. crontab.reference: +5 rader (rad 5–9) ordagrant ur `crontab -l`, med
   dokumentation, blindhets-historik och tidszon-varning — ändring ENBART i
   repo-filen (normen), ALDRIG i själva crontab-ytan.
2. Bevis FÖRE push: `node verktyg/konfigintegritet-vakt.mjs` i arbetsytan ⇒
   GRÖN 9/9 + 4/4, INFO-okända-rader borta. Efter push drar prod-synken
   referensen till AK1-trädet; daemonens :x9-rop validerar därnäst.
3. Detta dokument (glappkatalogen) = spårets underlag; G2/G5 har
   nattens diskriminerande test, G3/G4 har konkreta nästa steg.

## NÄSTA STEG (bokas i PIPELINE-KO)

- r298: G4 STÄNGT (historik-märkning + ödestabell); G9 tillagt (Vercel
  Cron aktivt — vagscan-bevis 05:05:22Z).
- r299+: G2/G5-nattbevakning (7 spårkvitton väntas 02:30–06:27 UTC).
- G9: migrationsvåg bokas — 12 Vercel-cron-rop → pumpor-daemonen (autonom);
  Vercel-cronens AVSTÄNGNING i Vercel-kontot = kundens yta (R2-adjacent).
- G3: omankrings-förslag ligger här — VÄNTAR KUND (crontab-ytan).
