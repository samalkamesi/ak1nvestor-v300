# o113 — Döda-länkar-EXTERNAS första organiska cron: driftfönstrets rotorsaka + verktygets återmätningskur (Spår 8)

Datum: 2026-09-20 · Agent: s8-u2 (manifest auto-s8-1789896901533) · Före detta: o87 (instrument), o95 (cron), o47/o55 (doktrin)

## 1. FYND — bevakningsposten infriad

o95 lämnade öppet: "första organiska cron-körningen 2026-09-20 04:17 bevakas av
nästa vaktvåg". Resultatet fanns på disk: `data/vakten/doda-lankar-externa-cron.log`
→ `2026-09-20T0417 DRIFTFÖNSTER — verktygets tak kasserade rapporten (o47 §2),
ingen larm; mellanlagret märkt för diagnostik, nästa cron mäter`.

- Crawl 02:16:35–02:28:35Z: 2 503 sidor, **202 driftfel (8,1 % > tak 5 %)** —
  kassation korrekt, ingen falsk fyndfil, ingen falsk larm (systemet ärligt).
- Stickprovet: `/kurser/km-026…028` + `/analyser/ABB.ST` + `abb-st/v01–v20` +
  `/analyser/ATCO-A.ST` — alla 500.

## 2. ROTORSAKA (beviskedjan)

prod-synk.loggen 02:07–02:41Z: **byggfelsnatt** — fyra NEXT-LÄKEBACKUP-cykler
(`.next` mv:s till `.next-laeke` medan pm2 lever), OOM 02:10Z, byggfel 02:18Z,
"KRITISKT good-HEAD failar" 02:21+02:35Z, läkt först **02:41:40Z deploy 20957e51
prod 200**. Cronens 11-minuters-crawl 02:16–02:28Z träffade mitt i serien:

- pm2:s VARMA ISR-sidor (toppnivåerna `/`, `/kurser`) svarade 200 — hälsogrinden
  vid crawlstart såg grönt.
- pm2:s KALLA djupsidor (analyser/vyer, km-kurser) behövde rendera → chunkar
  saknades under mv-fönstrena → 500. 202 kalla sidor = 8,1 %.
- pm2-loggen bärt samma klass: `NoFallbackError` 01:33–01:38Z.

Klass: **transient-design** (känd deploy-fönsterklass, o47/o55-doktrinerna) —
INGA döda länkar, ingen dataåtgärd. Prod läkt: **16 sonder 2026-09-20 ~09:5xZ,
alla 200** (km-026/027/028, ABB.ST, abb-st v01/v05/v20 gemenstavar, ATCO-A.ST,
atco-a-st v01; versal-stavarna 404 = korrekt, finns ej i grafen).

## 3. INSTRUMENTBLADSGLASET — grunden är en snapshot

Mätfönster-grinden (o87) kontrollerar FÖRE crawl: ingen låsägare, ingen
byggprocess, bas frisk. Ett fönster som ÖPPNAR **under** crawlen (fallet ovan:
grind grön 02:16Z, läkebackup-cykel 2 startade 02:17:21Z) syns först i
drift-taket — och då är hela mätomgången förlorad: nästa mätvärde först 04:17
nästa dygn. Faktiskt missade även en "aktivitet vid takträff"-kontroll fallet:
sista fönstret stängde 02:28:33Z, takträffen var 02:28:35Z.

## 4. KUR — återmätning ur driftfönster (verktyg/doda-lankar-externa.mjs)

Vid takträff: **fönstervakt** (polla samma tre grunder — ingen låsägare, ingen
byggprocess, bas frisk — varje `AK1A_RETRY_POLL_MS`, standard 30 s, väntetak
`AK1A_RETRY_VANTA_MS` standard 8 min) → vid gröna grunder mät OM EN gång.
Består felen träffas taket igen → exit 2 exakt som förr: **ommätningen
kasserar sig själv, okända fel maskeras aldrig** (artefaktdoktrinen hel —
drift-mellanlagren bevaras märkta, fyndfil skrivs bara för grönt mätvärde,
`--validera-fran`-bakdörren förblir stängd). Rapporten bär `atermatAntal`;
stdout redovisar "(efter 1 återmätning ur driftfönster, o113)" — cron-wrapperns
(o95, u1:s yta — orörd) exitkodsklassläsning opåverkad.

## 5. BEVIS

- Svit `verktyg/testa-doda-lankar-externa.mjs`: **42 PASS · 0 FAIL · 1 SKIP**
  (G = äkta byggfönster på servern under svitfönstret — skip-semantiken är
  kontraktet). Nytt/utökat: B4/B5/B5b (bestående fel → återmätning kasserar
  sig själv, två märkta mellanlager, ingen maskering) · J1–J6 (driftfönster
  stänger → mätomgången RÄDDAD: kod 0, drift-mellanlager + grönt mellanlager,
  fyndfil atermatAntal=1 driftAndel=0, 21 sidor inkl. absolut egen-URL enligt
  C3-precedensen) · K1–K4 (fönstret stänger aldrig → väntetak loggas, EN
  insamling, exit 2 — aldrig ändlös crawl).
- `node --check` ×2 · `node node_modules/typescript/bin/tsc --noEmit` = 0
  (projektbinär; src/ orörd = INGET bygge) · prod 200.
- Skal-läxa tillämpad: prod-synkens rent-träd raderade en gång verktygseditsen
  (o83-klassen) → omskrivning + OMEDELBART `git add` (staged överlever).

## 6. KÖPOSTER (öppna, ägarlösa)

1. Full crawl med kurat verktyg i stilla fönster (~13 min) — mätvärdet efter
   nattens driftfönster levererades som VALIDERINGSVÄG-alternativ ej denna våg;
   cronen 04:17 imorgon blir första organiska kvittot på kuren (skulle idag
   ha räddat 02:28Z-fallet: fönster stängt 02:41Z → poll → grönt ~02:41–02:49Z
   inom 8-min-väntetaket).
2. pm2:s kalla-sidor-500 under byggfönster är en KUND-vågsklass (djupklick
   under deployfönster): evolutionsposten "hela bygg→artefakt→restart under
   ETT flock" (o50/o55) ägs av prod-synk-ytan — berörd EJ här (u1 bevakar
   aktivt omgång 4-bygget i samma yta).
3. Svit-G omkörning i stilla fönster (ej nödvändigt för kontraktet).

## 7. KVD

src/ orörd (ENDAST verktyg/ + data/) · INGET bygge (prod-synken äger) ·
ALDRIG `--no-verify` · R2 orörd (priser/tier/publicering) · data/blogg/ orörd ·
syskonytor orörda (u1: cron-wrapper + byggbevakning; u3: patch-ko + hälsorapport).
