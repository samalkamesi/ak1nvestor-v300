# o570 — Externavaktens 429-mörker: egenförvållat IP-block + fuser-blindhet (spår 8, s8-u1)

**Manifest:** auto-s8-1790679320397 (uppgift s8-u1, roll vakt) · **Datum:** 2026-09-29
**Reservation:** o570 under flock (verktyg/reservera-protokollnummer.mjs; första lediga
hak efter o564 — o565–o569 lämnades som buffert mot samtidiga syskons vågval).
**Filer:** verktyg/doda-lankar-externa.mjs · verktyg/doda-lankar.mjs ·
verktyg/testa-doda-lankar-externa.mjs · verktyg/testa-doda-lankar.mjs ·
data/vakten/doda-lankar-externa-doman-vila.json (föds vid första klipp) · detta protokoll.

## 1. FYND 1 — 59 % av externa ytan mörktäckt, EGENFÖRVÅLLAT

Alla tio mätrapporter 2026-09-15 → 09-27 visar samma bild: 204 av 343 unika externa
mål (59,5 %) klassas BLOCKERAD — Adlibris 102/102 och Bokus 102/102, samtliga 429,
samt sex äkta botväggar (403: goldmansachs ×2, mcdonalds, nvidia, gartner, strategy).
Målen är kurs- och källsidornas bokköpslänkar (`/sok?q=<titel>`).

**Rotorsakediagnos (live 2026-09-29 ~11:0x lokal):**

1. Enstaka förfrågningar får 429 — HEAD som GET, sök-endpoint som startsida som
   produktsida: blocket är DOMÄNBRETT mot vår IP, inte endpoint-specifikt.
2. Webbläsar-UA får också 429: inte UA-policy — IP-nivå (datacenter-IP eller
   ackumulerat rate-rykte).
3. Blocket kvarstår 36+ h efter senaste fulla körning (09-27 02:51) — långlivat.
4. **Instrumentet underhöll det självt:** korDom avlossade 102 back-to-back-
   förfrågningar per domän varje natt (en i taget per domän men NOLL mellanrum)
   sedan 09-15 — en värd som sagt stopp fick 101 nya förfrågningar nästa natt.
   Att första rapporten (09-15) redan visar 102/429 tyder på att begränsningen
   trädde i kraft inom första salvan och sedan hållits vid liv nattligen.

**Konsekvenser före kuren:** (a) 59 % av utgående länkar overifierbara för alltid,
(b) 204 impolitiska förfrågningar/natt mot värdar som svarat 429 (skonsamhets-
kontraktet brutet i praktiken), (c) rapportens BLOCKERAD-klass dolde att orsaken
var vår egen IP, inte länkarnas hälsa.

## 2. KUR 1 — DOMÄNVETTET i verktyg/doda-lankar-externa.mjs (tre lager)

1. **Domäntakt** (`AK1A_DOMAN_TAKT_MS`, standard 1200 ms): minst ett mellanrum
   mellan förfrågningar till samma domän — främst skydd för domäner som TÅL oss
   (amazon 102 OK idag — skall inte tröttna imorgon).
2. **Kanin + domänklipp:** domänens första mål är kanin. Svarar det 429 väntas
   (Retry-After i mån, tak 2 min; annans `AK1A_429_RETRY_MS` = 15 s) och omprovas
   EN gång med GET (imy-precedensen: GET är besökarens sanning). Läker det ⇒
   domänen fortsätter normalt. Består 429 ⇒ **domänklipp**: övriga mål klassas
   BLOCKERAD med `blockeradTyp: "rate"` UTAN en enda förfrågan (bevisat svitfall
   L: kaninen 2 förfrågningar, klippta 0).
3. **Viloperiod** (`AK1A_DOMAN_VILA_MS`, standard 7 dygn; fil
   `data/vakten/doda-lankar-externa-doman-vila.json`, atomisk temp+rename):
   klippt domän får NOLL förfrågningar till vilen löper ut — värdarna får vila
   så ett avklingande block kan läka; kaninen provar igen efter vilen. Svitfall
   M: förseedad vila ⇒ 0 förfrågningar, `blockeradTyp: "vila"`.

**Ärlighetsredovisning:** BLOCKERAD delas per post i `blockeradTyp` — "rate"
(429: vår IP begränsad, länken overifierbar), "vagg" (401/403: vägrade oss — inte
länkens fel), "vila". Rapporten bär `blockeradeTyper` + `domanVila`; stdout får
EN NY rad `Blockerade-typ: …` — cron-wrapperns parsningsrader (`DÖDA (4xx):`,
`OUPPNÅBARA`, `SERVERFEL … BLOCKERADE`) är byte-kompatibelt oförändrade.
`--tvinga` respekterar ALDRIG vila och skriver ALDRIG vila (diagnostik ändrar
inget tillstånd). Effekt mot Adlibris+Bokus: 204 förfrågningar/natt → 2 kaniner
vid klipp, därefter 0/natt under vilon; total runtime påverkas marginellt
(+~2–3 min på ~16-min-cronen, 04:17-fönstret ryms).

## 3. FYND 2 — fuser/psmisc SAKNAS: länkvaktarnas deploylås-öga blint

Under svitkörningen föll F-gruppen (deploylås-ägande) — rot: `fuser` finns inte
på servern (psmisc "un", aldrig installerad på SSD Nodes; verktygen föddes på
Contabo). `lasHollare`s catch-gren ("verktyg saknas = ingen hållare") gjorde
lås-ägandekontrollen till en konstant noll — TYST. Grinden hade kvar pgrep-
byggmonster + drift-tak, men låsögat var blint sedan serverbytet.

**Kur: /proc-fd-läsning i båda verktygen** (doda-lankar-externa.mjs +
doda-lankar.mjs): en flock-hållare bär ALLTID en öppen fd mot låsfilen — läs
`/proc/*/fd/*`-symlänkar mot realpath(låsfilen), exakt den sanning fuser gav.
**Ratat alternativ (dokumenterat i koden): egen `flock -n`-probe** — den skulle
själva ta låset en mikrosekund och kan få en ÄKT deploys non-blocking acquire
att fela; /proc-läsningen lockar aldrig.

**Levande bevis:** under pågående prod-synk (pid 866092 flock + barn) stoppade
grinden: `GRIND: deployfönster aktivt — låset ägs av PID 866092,866093,870062`.

**Kollateral-rotorsaka: intern-sviten var INTE låsisolerad.** korVerktyg i
verktyg/testa-doda-lankar.mjs refererade `miljo.egenLas` som aldrig definierades
⇒ AK1A_DEPLOY_LAS=undefined ⇒ verktyget föll tillbaka på SKARPA
/tmp/ak1a-deploy.lock. Maskerad av fuser-blindheten (blind ⇒ såg aldrig det
äkta låset ⇒ sviten "grön"); på Contabo skulle den ha failat slumpvis vid
samtidig deploy. Kurad: svit-egen låsfil som aldrig finns/ägs.

**ÖPPEN POST (bokas, ägs av kommande s8-våg):** ytterligare fyra verktyg bär
samma fuser-lasHollare och är fortfarande blinda på låsögat:
verktyg/kvalitetsvakt.mjs · verktyg/rapport-intag-karantan.mjs ·
verktyg/ssr-livssond.mjs · verktyg/_r325-synkpal.mjs (deras sviter ännu ej
granskade för egenLas-fel). Mönstret: kopiera /proc-sonden ur o570.

## 4. BEVIS

- `node --check` × 4 filer: grönt.
- Verktygets `--sjalvtest`: 6/6 (klassificeringskontraktet oförändrat).
- **Externasvit: 61 PASS, 0 FAIL, 1 SKIP** (G-SKIP = äkta byggfönster pågår på
  servern under sviten — designat ärligt skepp, ej fel). Nya fall: L1–L7
  (kanin-429 ⇒ klipp: 2 kaninförfrågningar, 0 klippta, vilofil, rate-typ),
  M1–M4 (vila ⇒ 0 förfrågningar), N1–N3 (takt 350 ms ⇒ mellanrum 462/627 ms),
  R1–R5 (retry-after: 0 ⇒ GET-läkt kanin ⇒ ingen klipp, hela domänen OK).
  Fixturer byggs nu med MÅL på egen port (annat ursprung) — crawlen följer
  aldrig dit och räknarna ser enbart valideringssonder (C3-precedensens
  "absoluta egna URL:er"-fälla kringgås).
- **Intern svit: 22 PASS, 0 FAIL, 1 SKIP** (samma ärliga G-SKIP) efter
  egenLas-kuren.
- **tsc `node node_modules/typescript/bin/tsc --noEmit`: 0 fel** (baslinjen
  hel; .mjs-verktyg omfattas ej av tsconfig men src/ orörd — INGET bygge körs
  av vakt-agenten, byggen ägs av prod-synken under deploylåset).
- **Live kanin-dom:** se §5 (kördes när fönstret friade).

## 5. LIVE-KANIN-DOM (efterverkställning i vågen)

`--validera-fran data/vakten/doda-lankar-externa-2026-09-27-insamling.json`
(grönt mellanlager, 343 mål): Adlibris+Bokus kanin-429 ×2 ⇒ klipp ⇒ vila
skriven; amazon m.m. validerade med takt; färsk mätrapport med 0 DOD/0 OUPPNÅBAR
förväntas (09-27-fynden holmen/eur-lex/nasdaq verifierades 200/202/200 live
manuellt denna rond — transienta, inga döda). Siffror bokförs i worklog-raden.

## 6. JURIDIK/R2-KONTROLL

R2 orörd: inga priser, ingen publicering (data/blogg orörd), inga nycklar.
ExternA-länkarnas INNEHÅLL ändras ej — vakten mäter bara. Utbildnings-
innehållet påverkas inte.

## 7. KÖ-EFTERLÄMNING

1. Nästa s8-våg: fuser-kuren i de fyra blinda verktygen (§3 öppen post).
2. 7-dagarsvilot för Adlibris/Bokus löper ut 2026-10-06 — nattcronen 04:17
   provar kaninen igen automatiskt; om 429 kvarstår ⇒ ny 7-dagarsvila (värdarna
   får fortfarande exakt 2 förfrågningar per vecka, inte 204 per natt).
3. Om vilon aldrig läker: ärligt slutläge — bokhandelssök-länkarna är
   maskinoverifierbara från datacenter-IP; BLOCKERAD-rate/vila är sanningen.
