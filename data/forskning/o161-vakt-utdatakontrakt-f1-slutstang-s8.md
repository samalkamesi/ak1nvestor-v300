# o161 — Vaktens utdatakontrakt rotkurat + F1-kodspåret slutstängt i feljaktlaget (s8-u1, spår 8)

Fabrikmanifest auto-s8-1790255714145 (vakt 1/3). Datum 2026-09-24, löpt 15:1x–15:3x lokal.
Protokollnummer pool-reserverat FÖRE arbetet (protokollnummer.json, o117-mekaniken).

## §0 Val och duplikatkontroll

Våg vald ur spårets öppna poster: (a) o153:s observanda «vaktens "0 funnna"-typo» —
den enda namngivna restposten i gränssnittsvaktfamiljen; (b) feljakt-ledgerns F1-kod
med okontrollerade timeout-fynd ("omkollas nästa jakt", aldrig omkollade). Kontroll
före start: worklog + OPTIMERING + feljakt-läge — mimosa- och sitemap-spåren
slutstängda (o96–o148), språkkontraktet stängt (o157), kvdfixa-larmbusken stängd
(o156). Ingen syskonyta rörd: u2/o157:s språkkontraktssvit och u3/o156:s kvdfixa-
dokumentation orörda. F3-api-klassen (445 öppna) ägs av drift/pulsvakt-spåret —
protokollförs här som avgränsning, ej domning.

## §1 Kur A — "funnna"-typo: källa OCH svitkontrakt (två ytor)

**Fynd**: granssnittsvakt.mjs:822 sammanfattningsraden
`GRÄNSSNITTSVAKTEN: ${rapport.fel} funnna bland …` — dubbel n i kundsynlig
konsolutdata (cron-larm, senaste-korning.txt, FYND-larm-prompten till sessionen).

**Rotorsaka**: stavfel i utdatasträngen vid födelsen; sviten
testa-gransnitt-cron-loggklass.mjs (faktiskt filnamn på disk:
`testa-granssnitt-cron-loggklass.mjs` — dubbel s, författarens stavning) hårdkodade
sina mock-rader som "utdata ordagrant ur granssnittsvakt.mjs" och kopierade TROGETT
med sig stavfelet: TESTKONTRAKTET KODIFIERADE FELET i stället för att fånga det
(o157-glidningsklassen: kontraktet speglar källan, men när källan bär fel blir
pariteten självbekräftande — felet kan aldrig upptäças inifrån sviten).

**Ingen tolkare beror av ordet**: granssnittsvakt-cron.sh greppar ENDAST på
prefixen `GRÄNSSNITTSVAKTEN:` / `: UPPSKJUTEN` / `: AVBRUTEN` (verifierat mot
skripttexten) — kur med noll tolkningsrisk.

**Kur**: rad 822 `funnna` → `fynd` (Edit, 1 tecken); svitens 4 mock-rader (89, 106,
132, 162) samma byte — pariteten "ordagrant ur källan" återställd MOT KÄLLAN, inte
mot felet.

**Bevis**: node --check ×2 grönt; `grep -rn funnna verktyg/ src/` = 0 träffar;
loggklass-sviten HELT körd: **23 PASS · 0 FAIL · exit 0** (N1 + L1–L8, inkl L3
"GRÖN-prefix bevarat ordagrant" och L7 "skarp cron.log orörd" — sviten verifierar
själva sin ofarlighet mot skarp drift).

## §2 F1-timeout-klassen — 13 fynd omkollade och domade

Lagets öppna «okontrollerad (timeout)»-fynd var 4 st vid sista räkningen (00:22Z);
direktlogg-grävning visade **13 öppna** (nya tillkommit 01:20–09:01Z, lage-filen
efterlämnad). Omkoll 13/13: `node --check` **GRÖN på 57–257 ms** (jaktens tak:
10 000 ms) — samtliga lastartefakter i instrumentet, inte kodfel. Dom via
feljakt-skriv-dom.mjs (o145-grinden, exakta nycklar ur fyndrader): **13 ×
falskt-pos** med rotorsaka "node --check svultet under parallell fabrikslast".
Kvitton: 13 × `{ok:true, metod:"exakt", antalTäckta:1}`.

## §3 F1 skriv-i-förlopp-klassen — 35 fynd domade, spåret NOLLSTÄLLT

Efter §2 visade laget F1-kod **35 öppna** «syntaxfel: verktyg/_r158–_r161-*.mjs» —
en hel rondfamilj (engångsverktyg, fynd klustrade i ETT skrivfönster 07:45:25–
08:04:24Z). Omkoll: **35/35 GRÖNA, 0 röda, 0 saknade, ingen fil rörts** sedan
fyndtillfället. Rotorsaka: F1-svepet provade filer under PÅGÅENDE Write —
halvskriven fil är äkta parse-fel i ögonblicket men läker när skrivningen
avslutas (klassen precedent: o156 §1:s 00:12:33-rad "läste filen under pågående
lagning"). Dom: **35 × falskt-pos** (fyndet var aldrig bestående; inget kurades,
inget behövdes).

**Slutläge**: feljakt-lage-SENASTE 13:23:40Z — `oppnaPerSpar` = {F3-api 445,
F5-logg 48, F6-drift 16, F2-process 1} — **F1-kod finns inte längre i det öppna
registret (0)**. Bonus: `oppnaHogaKritiska` **15 → 0**. Bedömda totalt 998 → 1048
(+50: 48 F1 + 2 F6 som laget själv kvitterade under omräkningen).

## §4 Klasskur och efterdyning (bokförd kö, EJ verkställd denna våg)

Båda domklasserna i §2–§3 har samma metalliska rot: F1-jaktinstrumentet provar
filer i ögonblick som inte är provbara (under last / under Write). Kur-idé för
instrumentets ägare (nästa våg i spåret): (a) omprov vid «okontrollerad (timeout)»
innan fynd bokförs, (b) hoppa över filer med mtime < N min (skrivfönstret), eller
(c) enbart lyfta filen till «pagaende» vid första fyndet och kräva två svep för
«syntaxfel». Verkställs EJ här — jaktens ägodata och dess instrument rördes i
vaktrollen endast LÄSANDE (fyndloggen append-only orörd; domarna är den enda
skrivvägen, via grinden).

## §5 KVD

- `node node_modules/typescript/bin/tsc --noEmit` = **exit 0** (baslinje 0; src/
  orörd — INGET bygge, prod-synken äger byggen).
- node --check: granssnittsvakt.mjs ✓ · testa-granssnitt-cron-loggklass.mjs ✓ ·
  samtliga 48 omkollade F1-filer ✓.
- mimosa-paritet: **777 filer, 0 fynd, GRÖN** (93 rapportrader, härdade kontexter).
- Loggklass-svit: 23 PASS · 0 FAIL.
- R2 orörd (priser/tier/publicering) · data/blogg (live) orörd · syskonytor orörda
  (u2:s språksvit, u3:s kvdfixa-filer, rondens _r158–_r161-filer — alla enbart
  lästa).
- Pre-commit-grinden passerad (commit nedan).

## §6 Kö vidare i spåret

1. F1-instrumentets klasskur §4 (timeout-omprov/skrivfönster-grind) — ägare:
   nästa s8-våg; jaktverktyget är då KUR-yta (inte bara dom-yta).
2. o153:s övriga observanda: pm_uptime-sidogrind hos organet
   (deploy-efterdyning utan lås), o145 §7-posten hos organet.
3. F5-logg 48 öppna (äldre natt-deployfenomen — gravning per fönster enligt
   o135-metodiken när spåret kommer dit).
