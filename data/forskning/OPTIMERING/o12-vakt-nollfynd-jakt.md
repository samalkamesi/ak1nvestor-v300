# o11 — Vaktens 0-fynd-jakt: färsk GRÖN på aktuell prod + 13:17-vaktkraschens rotorsak

**Spår:** 8 KVALITET & SÄKERHET (vakt) · **Agent:** s8-u2 omgång 2 (manifest
auto-s8-1789488907284) · **Datum:** 2026-09-15 · **Status:** LEVERERAD

## Objekt och valmotivering

Spårets kontextord "vakten 0-fynd-jakt" — det fjärde och sista olevererade
objektet. Generation 1 av samma manifest (identiska uppgiftstexter, DR-kollisionens
kända fabrikssituation S10-U3) hade redan levererat: tsc-grindens mekaniska bevis
(s8-u1), beroendehälsan (s8-u2), döda länkar (s8-u3). Detta protokoll tar det
fjärde — duplikat undveks genom worklog-kontroll före start.

## Leverans 1 — FÄRSK GRÖN på aktuell prod (efter dagens deploylavin)

**Problemet:** senaste HEL-gröna vaktrapporten var 05:24 (176 kombinationer,
0 fynd). Sedan dess landade minst fem deploys med src-ändringar (läsbarhetsrond
2+3, kaskadkuringen globals.css, SearchModal-koddelning 11:29, 17:40:51) —
"vakten grön" var alltså INTE bevisat för aktuell prod. Dessutom stod ett öppet
larm i cron.loggen: **13:17 LARMAT molnagenten** utan efterföljande GRÖN.

**Mätning:** full körning, exakt cron-kommando (`--bas=http://localhost:3000
--tema=bada --skarmvagnar=390x844,1280x800`), efter RAM-grind (min 1100 MB).
Prod körde exakt HEAD `ccbadca7` (senaste-deployad.txt verifierad, pm2 online).

**Bevis:** `GRÄNSSNITTSVAKTEN: 0 funnna bland 176 kombinationer` —
rapport `data/vakten/granssnitt-2026-09-15T1627.json` (på disk, otrackad).
Oberoende omräkning ur JSON:en (ej verktygets egen sammanfattning):

- 176 kombinationer = 88 publika "ok" + 88 "admin-flik", `fel: 0`
- 0 kontrastfynd, 0 utanför-viewport, 0 klippt text, 0 konsolfel
- Horisontell överflöd: max 2 px, 44 kombinationer, SAMTLIGA på /admin-flikar
  i 390px — under verktygets 6 px-tolerans (avrundnings-/scrollbar-brus) och
  på admin-yta som kunden aldrig ser. Alla publika sidor: 0 px.
- Journalföringen (våg 157) levde: vakt-sidjournal.json uppdaterad 18:27.

**Slutsats:** dagens fem src-deployer (läsbarhetsronderna + koddelningen)
höll nollfyndslinjen — kundens ögon har varit skyddade hela vägen.

## Leverans 2 — ROTORSAKA: 13:17 VAKTKRASCHEN (falskt larm, förlorad mätning)

**Fynd:** cron.logg `2026-09-15T1317 LARMAT molnagenten`. Körningens utdata
(senaste-korning.txt) = rå Node-krasch: `ERR_MODULE_NOT_FOUND: Cannot find
package '.../node_modules/puppeteer-core/index.js'`. Våg 168:s KRASCHAD-gren
klassade larmet RÄTT (verktygsfel, ej sidfel) — men roten fanns kvar.

**Rotorsakediagram (bevisat i kod):**

1. `import puppeteer from "puppeteer-core"` var en STATISK toppnivå-import —
   ESM laddar den vid node-start, FÖRE någon annan kodrad.
2. Verktygets egen deploy-medvetenhet (`vantaPaFriskBas`: pollar
   `/tmp/ak1a-deploy.lock` + basens hälsa var 30:e s i upp till 12 min) ligger
   EFTER importerna i exekveringsordningen — den hann aldrig köras.
3. 13:17 sammanföll med en deploys `npm ci`, som tömmer/ersätter node_modules
   inkrementellt → paketet saknades i millisekfönstret → krasch vid import.
4. Resultat: falskt VAKTKRASCH-larm + MÄTNINGEN FÖRLORAD (cron ropar igen
   först 19:17). 06:00-rapportens "avbruten — deploy pågår" (fel:21) är ett
   ANNAT, designat avbrott (transienta 5xx, s8-u1 dokumenterat) — det här
   var det enda ODESIGNADE.

**KUR (verktyg/granssnittsvakt.mjs, Write/Edit enligt Mimosa):** puppeteer-core
importeras nu DYNAMISKT (`await import`) PLACERAT EFTER deployvänt-logiken.
Väntar npm ci-fönstret ut i stället för att dö. Misslyckas importen på en
FRISK bas (lås ledigt + basen 200) = äkta verktygsfel → tydlig VAKTFEL-rad
med trolig rot (korrupt node_modules efter avbruten deploy) + reparationsväg
+ exit 2 (cronens KRASCHAD-gren fångar som tidigare).

**Bevis (tre test):**

| Test | Arrangemang | Resultat |
|---|---|---|
| A — normalfallet | kurat verktyg mot localhost, `--snabb --sidor=/` | `0 funnna bland 12 kombinationer`, GRÖN, rapport skriven |
| B — deployväntan | verktygsKOPIA i /tmp (INGEN node_modules = npm ci-tillstånd) + deploylåset hållet 75 s | processen LEVDE 90 s: ingen startkrasch, låset respekterat (poll-cykler), import först efter låssläpp |
| C — importfelgrenen | samma kopia, efter låssläpp (basen frisk, paketet saknas) | ren `VAKTFEL — puppeteer-core kan inte importeras på en frisk bas` + rot + reparationsinstruktion, exit 2 |

Före kur skulle test B ha dött på 0,0 s med rå stacktrace (exakt 13:17-symptomet);
efter kur väntar verktyget och levererar antingen mätning (A) eller diagnos (C).

## KVD

- `node_modules/.bin/tsc --noEmit` = **0 fel** (projektbinär — syskonet s8-u1
  omgång 1:s fynd tillämpat: npx kan träffa dummy-tsc i deployfönster; inga
  deploy pågick, men principen följs).
- Ingen src/** berörd → inget bygge krävs (verktyg/*.mjs körs av cron/agent,
  ingår inte i prod-bundeln); prod orörd, inga R2-ytor.
- Testspår städade (/tmp-kopia + testutdata); rapportfiler kvar på disk enligt
  etablerat mönster (otrackade, 30 dagars retention i cron).

## Noteringar till kommande ronder

- Prod-synken står i VÄNTAR-RAM med odistribuerad kod (16:27: ec9f8a1e väntar
  på ≥2200 MB) — mina 176/0 mätte ccbadca7-prod; nästa cron 19:17 mäter
  bygget därefter. Ingen åtgärd krävs (RAM-vakten är designad).
- Manifestprompts med identiska uppgiftstexter ger omgångs-dubbelarbete när
  fabriken kör om (tredje bevisade fallet) — kur kvarstår hos huvudagenten:
  unika objekt per uppgiftsid.
