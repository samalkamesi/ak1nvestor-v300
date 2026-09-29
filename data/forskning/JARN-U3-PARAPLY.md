# JÄRN-U3 — PARAPLYVAKTEN: oberoende vakt över vaktarna

**Kundorder:** "oberoende system" — vem vakar vaktarna?
**Leverans:** `verktyg/paraplyvakt.mjs` (cron var 10:e minut) + läkekällan
`/home/ak1a/crontab-v332-mall` + detta protokoll.
**Datum:** 2026-09-29 (fabriksagent JÄRN-U3, byggare).

---

## 1. Roten — risken är ingen hypotes, den inträffade UNDER byggget

Paraplyets motiv är bevisat i drift samma dag som det byggdes. Händelsekedjan
(alla tider UTC, alla mått egenhändiga 2026-09-29):

| Tid | Händelse | Bevis |
|---|---|---|
| 13:12:10 | Okänd aktör resettade develop till 22df62aa mitt i prod-synkens byggfönster | reflog `22df62aa HEAD@{13:12:10}: reset`; träd-incidentrapporten i aa2f35eb |
| ~14:35–14:39 | Huvudagenten byggde vakttornet (r332) — filen blev **untracked**, aldrig committad | crontab-kommentar r332; vakttornet-larm.log:s fyra tätare debutrader 14:39–14:42 |
| 14:39 → 21:55 | Vakttornet lever och kör var 5:e minut via crontab; larmar direkt att `verktyg/desk-halsa.mjs` saknas (raderad tidigare — levande senast 09-28 16:30 enligt desk-halsa.log) | vakttornet-larm.log 15:00→21:55 oavbruten; vakttornet-cron.log 91 OK/ALARM-rader |
| 21:55:18 | Vakttornets SISTA körning — skriver vakttornet.json + BÅDA larm.json + larm-loggen samma millisekund | stat: alla fyra filer 21:55:18.406167770 |
| 21:55:42 | Trädåterställning (kraschvaktens klass — pågående räddningsbygg sedan 21:49) raderar untracked `verktyg/vakttornet.mjs` | reflog `reset: moving to HEAD` 21:55:42; minnesnotis "osparade agentändringar raderas som kollateral" |
| 22:00 → | Crontab-raden lever vidare som **zombie**: `Cannot find module .../vakttornet.mjs` var 5:e minut, utan att NÅGON reagerar | vakttornet-cron.log:s slutfel; crontab -l visar raden kvar |

**Lärdomen (kundens ord var profetiska):** ett vaktskikt dog TYST. Cron-raden
lever, filen är borta, larm-banner-raden om desk-hälsan upprepades 7 timmar
utan att någon vaktade vakttornet självt. Sitvakten klarade sig endast för att
den bor UTANFÖR repot (`/home/ak1a/sitvakt`) — resetten kan inte nå den.

## 2. Kontraktet — tre kontrollklasser + läkning + självbevis

Varje körning (cron var 10:e minut) kontrollerar:

**(a) Crontab-raderna lever** — `crontab -l` mönstermatchas mot tre bevakade
rader: SITVAKTEN (`*/2` + `/home/ak1a/sitvakt`), VAKTTORNET (`*/5` +
`vakttornet.mjs`), DESK-LÄKAREN (`*/30` + `/home/ak1a/desk-lakare`).
Kommentarsrader matchar inte — raden skall stå AKTIV.

**(b) Pulsen lever** — `data/vakten/vakttornet.json` skall vara färskare än
**12 min** (vakttornet skriver var 5:e; tröskeln tål ett missat varv).
`~/sitvakt.log` rapporteras som **info-kontroll utan larmtröskel** — se § 3.

**(c) Filerna finns** — `verktyg/kraschvakt.mjs`, `/home/ak1a/sitvakt`,
`verktyg/vakttornet.mjs`, `verktyg/desk-halsa.mjs`. Saknad fil LARMAR men
återskapas ALDRIG automatiskt: paraplyet skriver ingen vaktkod — det är
ägarens bord (idag: vakttornet.mjs + desk-halsa.mjs saknas, se § 5).

**Läkning** — enda mekaniska åtgärden: saknade cron-rader återinstalleras ur
mallen `/home/ak1a/crontab-v332-mall`. Design:

- crontaben lever → **append** av det saknade blocket (raden + sina
  kommentarsrader) märkt `# paraplyvakt-läkning <iso>` — okända/nya rader i
  crontaben röras ALDRIG (full överskrivning hade kunnat riva rader som
  ägaren lagt till sedan mallen; därför aldrig den vägen när crontaben lever)
- crontaben borten/tom → mallen installeras HEL (`crontab <mall>`)
- läkningen **verifieras** med omläsning av crontab; misslyckad läkning är
  egen larm-rad
- mallen saknas → larm-rad med pekare till detta protokolls bilaga (§ 7)

**Larm** — ALARM-rader till `/var/www/desk/larm.json` +
`/home/ak1a/desk-web/larm.json` (BÅDA desk-ytorna), exakt
skrivMorkerVagLarm-kontraktet (JÄRN-U1): merglar och dedupe:ar befintliga
rader, prefix `paraplyvakt: `, skrivfel sväljs ALDRIG dödande. Paraplyet
skriver ENDAST vid egna fynd — grönskrivning av larm.json ägs av vakttornet
(ett grönskrivande paraply skulle kunna kväva vakttornets pågående larm).

**Självbevis** — varje körning skriver `data/vakten/paraplyvakt.json`
(t, lag, kontroller, lakningar — vakttornet.json-formatet) + journalför
ALARM till `data/vakten/paraplyvakt-larm.log` (vakttornet-larm.log-formatet)
+ stdout-rad `PARAPLYVAKT: <lag> (x/y kontroller OK)` för cron-loggen.

**Exit-kod är ALLTID 0** — läget bärs av stdout + rapportens `lag`-fält.
Ett cron-rop som ropar fel var 10:e minut skapar bara spårbrus i crond:s
felspår; framtida läkar-kopplingar läser json-fältet, inte exit-koden.

## 3. Avvikelse från order-SPECEN — sitvakt.log-tröskeln (medveten, bevisad)

Uppdraget löd: "~/sitvakt.log + vakttornet.json färskare än 12 min". Den
halvan är **omöjlig att följa utan falsklarm**: sitvakten loggar ENBART vid
åtgärd (R331:s kontrakt "Logg: ~/sitvakt.log" = åtgärdsjournal, ej puls).
Bevis från dagens logg under AKTIV drift: åtgärdsgap 50 min (19:58→20:48),
42 min (20:48→21:30); en lugn dag = noll rader = "stale" hela dygnet.
En 12-min-tröskel hade låtit paraplyet skrika varg inom en timme — och ett
paraply som larmar falskt avinstalleras av trötthet.

Kur: sitvakt.log = info-kontroll i rapporten (ok:true, ålder i detalj).
Sitvaktens LIV vaktas i stället av (a) cron-raden + (c) filen. Känd kvar-
varande gräns: ett sitvaktskript som kraschar VID VARJE anrop (rad + fil
finns, exekveringen dör) fångas inte — kameran är pulsmärket. Framtida kur
(ägarens bord, en rad i /home/ak1a/sitvakt): pulsrad per varv, t.ex.
`st PULS` sist i varje gren, sedan kan paraplyet få en äkta 12-min-tröskel.

## 4. Mallen — varför utanför repot

`/home/ak1a/crontab-v332-mall` ligger i hemkatalogen, inte i repot — av
samma skäl som sitvakten överlevde dagens reset: trädkatastrofer (reset,
clean, kraschvaktens kollateralradering) når inte hemkatalogen. Mallen är
samtidigt fullständigt bilagad i § 7 (återskapbar ur detta protokoll, som
LEVÄR i repot + GitHub-spegeln). Vid medvetna cron-ändringar: uppdatera
MALLEN först, sedan crontaben — annars "läker" paraplyet tillbaka gamla
läget vid nästa avvikelse.

## 5. Driftläget vid leverans (ärlig rapport)

- Paraplyet DEBUTERADE SKARPT kl 22:22:59 med **ALARM 6/9** — tre sanna
  fynd: vakttornet.json STALE 28 min, fil saknas ×2 (vakttornet.mjs,
  desk-halsa.mjs). Inga falska fynd. larm.json bär nu vakttornets sex rader
  (5× HTTP 502 + desk-halsa-modulfelet) + paraplyets tre — merge verifierad,
  båda desk-ytorna diff-identiska.
- **Ingen läkning triggades** vid debuten (alla tre cron-raderna lever —
  zombies Included; fil-läkning finns inte, se § 2).
- **Pågående driftincident (inte detta uppdragets bord):** pm2 ak1a stoppad
  efter kraschvaktens misslyckade räddningsbygg 21:58 (artefakt trasig,
  kooldown); sitvakten kämpar som designat (20 åtgärder 13:38→21:58);
  kraschvakten bygger om. Paraplyets larm bidrar med sanningen att
  övervakningsskiktet SJÄLVT är skadat.
- **Protokollnotis till daemon-ägaren:** den körande pumpor-processen
  (start 02:02) ropar varje minut `vercel-cron-motor.mjs` som INTE finns på
  disk (exit 1 varje gång) — disk-filen pumpor-daemon.mjs (19:28) har ett
  annat schema än processens minne. Detta är daemon-friskhet-vaktens domän
  (glapp > 5 min ⇒ LARM enligt v195); noterat här eftersom sonden påträffade
  det under JÄRN-U3.

## 6. Installation — SESSIONENS BORD (görs INTE av fabriksagenten)

Exakta rader (append — övrig crontab orörd):

```bash
( crontab -l; \
  echo '# JÄRN-U3 PARAPLYVAKTEN: oberoende vakt över vaktarna — crontab-raderna + pulsen (vakttornet.json) + vaktfilerna; läker cron-rader ur /home/ak1a/crontab-v332-mall; rapport data/vakten/paraplyvakt.json + larm /desk/larm.json'; \
  echo '*/10 * * * * cd /home/ak1a/AK1 && /usr/bin/node verktyg/paraplyvakt.mjs >> data/vakten/paraplyvakt-cron.log 2>&1' ) | crontab -
crontab -l | grep -c paraplyvakt.mjs   # förväntat svar: 1
```

Mallen innehåller redan paraplyvaktens rad — en framtida HEL-återinstallation
ur mallen återför ALLTID även paraplyet självt (den självläkande slutenheten:
paraplyet läker vakterna, mallen läker paraplyet).

Manuell körning: `node verktyg/paraplyvakt.mjs` (skarpt) / `--torr`
(kontroller utan skrivningar). Rapport: `data/vakten/paraplyvakt.json`.

## 7. Bilaga — mallens fulla innehåll (återskapningsbar källa)

```
# crontab-v332-mall — PARAPLYVAKTENS LÄKEKÄLLA (JÄRN-U3, 2026-09-29)
# Denna fil är SANNINGEN om AK1A:s crontab. Paraplyvakten (verktyg/paraplyvakt.mjs,
# cron */10) återinstallerar saknade cron-rader HÄRIFRÅN — aldrig eget påhitt.
# Vid medveten cron-ändring: uppdatera DENNA fil först, sedan crontab.
# Källa: crontab -l 2026-09-29 ~22:00 UTC (r331-sitvakten + r332-vakttornet-läget)
# + JÄRN-U3 paraply vaktens egna rad. Fullständig bilaga: data/forskning/JARN-U3-PARAPLY.md
*/30 * * * * /home/ak1a/desk-lakare >> /home/ak1a/desk-halsa.log 2>&1
47 3 * * * /home/ak1a/desk-login-backup/spara-login.sh >> /home/ak1a/desk-login-backup/cron.log 2>&1
17 1,7,13,19 * * * /home/ak1a/AK1/data/infra/contabo/granssnittsvakt-cron.sh
40 2 * * * cd /home/ak1a/AK1 && /usr/bin/node /home/ak1a/AK1/verktyg/backup-fran-molnet.mjs >> /tmp/moln-backup.log 2>&1
20 3 * * 0 cd /home/ak1a/AK1 && /usr/bin/node /home/ak1a/AK1/verktyg/arkivera-server.mjs >> /tmp/server-arkiv.log 2>&1
17 4 * * * /home/ak1a/AK1/data/infra/contabo/doda-lankar-externa-cron.sh
50 2 * * * /bin/bash /home/ak1a/AK1/verktyg/dumpa-app-db.sh >> /tmp/supabase-appdump.log 2>&1
27 6 * * * /home/ak1a/AK1/data/infra/contabo/rop-halsa-cron.sh
27 3 * * * /home/ak1a/AK1/data/infra/contabo/natt-tbt-cron.sh
37 5 * * * /home/ak1a/AK1/data/infra/contabo/beroende-vakt-cron.sh
30 2 * * * cd /home/ak1a/AK1 && mkdir -p data/backups/supabase && PGPASSFILE=/home/ak1a/.pgpass /usr/lib/postgresql/18/bin/pg_dump "host=db.rkaqmulgoubvewwnwxrw.supabase.co port=5432 dbname=postgres user=postgres sslmode=require" 2>>/tmp/supabase-backup.log | gzip > data/backups/supabase/db-$(date +\%Y-\%m-\%d).sql.gz && /usr/bin/node /home/ak1a/AK1/verktyg/kolla-dump-markorer.mjs --natt >> /tmp/supabase-backup.log 2>&1 && find data/backups/supabase -name "db-*.sql.gz" -mtime +30 -delete
*/10 * * * * cd /home/ak1a/AK1 && node verktyg/marke-framtids-404.mjs >> data/vakten/marke-framtids-404.log 2>&1
# r331 SITVAKTEN: byggdods-vakt + app-vakt — sidan skall aldrig ligga nere lange (log: ~/sitvakt.log)
*/2 * * * * /home/ak1a/sitvakt
# r332 VAKTTORNET: A-O-ekosystemovervakning var 5:e minut (rapport data/vakten/vakttornet.json + larmbanner /desk/larm.json; logg vid alarm)
*/5 * * * * cd /home/ak1a/AK1 && /usr/bin/node verktyg/vakttornet.mjs >> data/vakten/vakttornet-cron.log 2>&1
# JÄRN-U3 PARAPLYVAKTEN: oberoende vakt över vaktarna — crontab-raderna + pulsen (vakttornet.json) + vaktfilerna; läker cron-rader ur denna mall; rapport data/vakten/paraplyvakt.json + larm /desk/larm.json
*/10 * * * * cd /home/ak1a/AK1 && /usr/bin/node verktyg/paraplyvakt.mjs >> data/vakten/paraplyvakt-cron.log 2>&1
```

## 8. Beviskedjan (KVD)

1. `node --check verktyg/paraplyvakt.mjs` → OK (efter en kur: `*/` i en
   blockkommentar avslutade kommentaren i förtid — notationen i kommentarer
   byttes till "var 10:e minut"-form; strängar med `*/2` oskadda).
2. Torrkörning `--torr` → `PARAPLYVAKT: ALARM (6/9 kontroller OK)
   [TORR — inget skrivs]`; verifierat att INGA filer skapats.
3. Skarp debutkörning 22:22:59 → `ALARM (6/9)`, exit 0;
   `data/vakten/paraplyvakt.json` skriven (9 kontroller, 3 sanna fynd,
   0 falska); `data/vakten/paraplyvakt-larm.log` journalförd.
4. Larm-merge: `/var/www/desk/larm.json` + `/home/ak1a/desk-web/larm.json`
   bär vakttornets 6 rader + paraplyets 3; `diff` = IDENTISKA.
5. Mallens matchningskontrakt: alla 4 bevakade block (sitvakt, vakttornet,
   desk-läkare, paraplyvakt) PASSAR mot läkningsmönstret (4/4).
6. Läkningsvägen är kodgranskad men har ännu ingen skarp debut (den triggar
   endast när en cron-rad saknas — alla tre lever idag); mallen på plats +
   4/4-matchning + verifieringssteg ingår i kedjan.

**Kvar på ägarens bord:** återskapande av `verktyg/vakttornet.mjs` (koden
finns ej i git — reflog saknar den; r332-vågens ägare måste skriva om den
eller återföra från arbetsminne) och `verktyg/desk-halsa.mjs` (r315-fil,
levande senast 09-28 16:30 enligt desk-halsa.log); därefter skriver vakttornet
grönt och paraplyets fynd tystnar av sig självt vid nästa varv.
