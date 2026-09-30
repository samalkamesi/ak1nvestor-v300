# VAKTTORNET-ÅTERSKAPANDE r350 — vakttornet.mjs återfött ur sina egna spår

**Uppdrag:** JÄRN-U3-PARAPLY.md §8 + r348 (5) — vakttornet.mjs (r332) blev
untracked och raderades 2026-09-29 21:55:42 av kraschvaktens trädåterställning
medan cron-raden levde kvar som zombie (`Cannot find module … vakttornet.mjs`
var 5:e minut). Återskapandet lades på ÄGARENS bord med källkontrakt i
JÄRN-U3 §3+§7: "en gissad kopia vore en vit fläck". Denna leverans är därför
byggd på BEVIS, inte gissning — varje designval härleder ur originalets egna
artefakter.

## Rekonstruktionskällorna (fem, alla självständigt verifierbara)

1. **data/vakten/vakttornet.json** (originalets SISTA rapport,
   2026-09-29T21:55:18.407Z): exakt 15 kontroller = A–O, med namn och
   detaljformat: `app-framsida|app-kurser|app-blogg|app-logga-in|
   app-integritetspolicy` (detalj "HTTP 502") · `desk-halsa` ("inget
   RESULTAT; stderr: …") · `pm2-ak1a|pm2-ak1a-pumpor|pm2-pulsvakt` ("online")
   · `fabriks-puls` ("80 min sedan", ok:true) · `disk-ledigt` ("97% ledigt")
   · `ram` ("50790 MB") · `supabase-dump` ("15 h") · `login-backup`
   ("18 h — varning ej larm", ok:true) · `cert` ("88 dagar kvar").
   Rapportformat: `{t, lag, kontroller:[{namn, ok, detalj}]}` — inget
   lakningar-fält (det är paraplyets tillägg i sitt eget format).
2. **data/vakten/vakttornet-cron.log**: stdout-format
   `VAKTTORNET: OK (15/15 kontroller OK)` / `VAKTTORNET: ALARM (n/15 …)`.
3. **data/vakten/vakttornet-larm.log**: journalformat
   `<iso> ALARM <kontrollnamn,kontrollnamn>` — endast vid ALARM.
4. **/desk/larm.json (båda ytorna)**: originalets rader är PREFIXLÖSA
   ("app-framsida: HTTP 502") — paraplyet prefixar sina ("paraplyvakt: "),
   originalet gjorde inte det. Merge+dedupe = skrivMorkerVagLarm (JÄRN-U1).
5. **JARN-U3-PARAPLY.md §2**: "grönskrivning av larm.json ägs av vakttornet"
   — vakttornet skriver larm.json GRÖN när alla kontroller står; paraplyet
   skriver endast vid egna fynd och återinför sina pågående rader vid nästa
   varv (10-min cykeln), så ett levande larm kan aldrig kvävas mer än en cykel.

## Tröskelval (dokumenterade — originalets rapport bevisar inte dessa)

JÄRN-U3 §3:s princip: "en vakt som larmar falskt avinstalleras av trötthet" —
tröskeleden valles därför generösa:

| Kontroll | Tröskel | Grund |
|---|---|---|
| HTTP ×5 | status < 400 | originalets "HTTP 502"-detalj (>=400 = fel) |
| desk-halsa | "RESULTAT"-rad i stdout | originalets detaljtext — RADEN, inte exit-koden (se kur nedan) |
| pm2 ×3 | status "online" | originalets detalj "online" |
| fabriks-puls | ≤ 24 h | originalet OK vid 80 min; fabriken kan vara idle utan manifest |
| disk-ledigt | ≥ 10 % | originalet "97% ledigt"; 10 % = beprövad klassgräns |
| ram | ≥ 1 500 MB | agentfabrikens egen RAM-vakt-tröskel (AGENTS.md) |
| supabase-dump | ≤ 48 h | nattlig cron (02:30/02:50); 48 h = två missade nätter |
| login-backup | larm > 72 h; varningstext > 12 h | originalets klass "varning ej larm" (ok vid 18 h); larmtröskeln är en dokumenterad förstärkning (3 missade nätter) |
| cert | ≥ 14 dagar | originalet "88 dagar kvar"; certbot förnyar ~30 dagar före utlöpp |

## Kurer under verifieringen (tre rundor i agent-trädet)

1. **Runda 1 (4/15):** `process.exit(0)` på toppnivå dödade processen före
   async-kontrollerna — kur: top-level `await huvud()` före exit.
2. **Runda 2 (12/15):** (a) pm2-kontrollen sökte processen "pm2-ak1a" men
   pm2-processen heter "ak1a" — kur: separata parametrar (kontrollnamn,
   pm2-namn). (b) HTTP-kontroller startades före SYNKRONA execFileSync-anrop
   som blockerade event-loopen 120 s → svaren kunde aldrig hanteras →
   "timeout" — kur: async-kontrollerna (HTTP ×5 + cert) await:as parallellt
   FÖRE alla synkrona subprocess-anrop.
3. **Runda 3 (13/15):** desk-halsa skriver "RESULTAT: 7/8 PASS" men avslutar
   exit 1 (1 del-FAIL) — execFileSync kastar och stdout följer med i
   e.stdout — kur: RESULTAT-kontraktet läses ur stdout i båda vägarna.

Kvarvarande 2 fel i AGENT-trädet är trädspecifika och försvinner i prod:
fabriks-puls 3 153 min (fabriken lever i PROD-trädets katalog — manifest
skrivet 19:28 samma kväll) och supabase-dump ENOENT (backupskatalogen finns
bara i prod-trädet).

## Deploy + debutbevis (STÄNGT — verkställt samma kväll)

1. Commit ad5a4490 till develop (tsc-grinden passerad — verktygsfil, src orörd).
2. `git push prod develop`: första försöket köade bakom agentfabrikens Spår
   11-omgång (smutsigt prod-träd), andra avvisades non-fast-forward när deras
   leveranser landat — r348-mönstret följt: fetch + merge --no-ff (ba09474b,
   fabrikens DESK-U27/U28/U29 + ombyggda desk-halsa.mjs 8/8 PASS mergades in)
   + push GRÖN.
3. **CRON-DEBUT BEVISAD 19:55:02Z: vakttornets rapport GRÖN 15/15** — första
   helgröna sedan originalet dog; cron-loggen visar övergången
   ALARM (9/15) × 2 → GRON (15/15) och INGEN MODULE_NOT_FOUND-rad mer;
   trädspecifika felen läktes i prod exakt som förutspått (fabriks-puls
   20 min · supabase-dump 17 h · desk-halsa RESULTAT-rad).
4. **Larm.json GRÖNSKRIVEN på BÅDA desk-ytorna** (0 fel-rader) — zombiens
   sex gamla rader + paraplyets utdöda fynd rensade av tornets ägande.

## BONUSFYND + KUR: paraplyets cron-rad var ALDRIG installerad

Debut-verifieringen avslöjade att paraplyvakt.json:s senaste rapport var
2026-09-29T23:02 — paraplyet hade ALDRIG körts via cron (paraplyvakt-cron.log
fanns inte alls). Roten: JÄRN-U3 §6 markerade installationen "SESSIONENS
BORD (görs INTE av fabriksagenten)" — och det steget blev aldrig verkställt
av sessionen som tog emot leveransen. Verkställt nu (r350, 2026-09-30 ~19:58Z):
append-installation enligt §6:s exakta rader (1 aktiv rad, verifierad med
omläsning; mallen /home/ak1a/crontab-v332-mall bär raden och återinstallerar
den vid framtida läkningar). **Paraplyets cron-debut 20:00:03Z: GRÖN 9/9**
(cron-rader ×3 OK · pulsen 4 min · filerna ×4 OK) — kedjan
vakttornet → paraplyet → mallen är nu den självläkande slutenhet JÄRN-U3
designade, äntligen med ALLA tre lager i drift.

## Öppna beroenden

- **desk-halsa.mjs**: fabrikens Spår 11 (DESK-U27/U28/U29) byggde om den —
  mergad i ba09474b, 8/8 PASS enligt deras kvitto; vakttornets kontroll F
  kör den versionen (RESULTAT-kontraktet OK i debuten).
- **Läxa protokollförd**: "SESSIONENS BORD"-poster i fabriksprotokoll MÅSTE
  bokföras som pipeline-post omedelbart — annars dör installationssteg tyst
  (paraplyet levde 21 h oinstallerat; ingen vakt hade upptäckt det —
  meta-paradoxen vakade bara tack vare vakttornets debut-verifikation).

*Källa: r350, 2026-09-30 19:1x–19:4x UTC, huvudagenten (ägarrond enligt
JÄRN-U3 §8 + r348 (5)). Verktyg: vakttornet.mjs med full headers dokumentation.*
