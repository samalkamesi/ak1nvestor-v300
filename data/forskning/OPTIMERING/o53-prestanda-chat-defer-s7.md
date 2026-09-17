# o53 — Prestanda: chat-defer-kuren (AI-Mentorn-chunken ur TBT-fönstret)

**Spår 7 · s7-u3 (manifest auto-s7-1789661728938, byggare 3/3) · 2026-09-17**
**Status: KLAR — kuren + rättningen mekaniskt bevisade (§5 struktur, §5b
beteende, båda hållen); deployad på J87oNXS1k5w1NAMDS1rpJ; prod 200 ×3.**

## §0 Sammandrag (o53)

AI-Mentorn-chatten var sidornas **tyngsta klientchunk: 106,4 K transfer**
(större än react-chunken, 70,3 K) och hämtades **2 025–2 385 ms efter
navigation** — mitt i FCP–TTI-fönstret — på samtliga mätsidor, därför att
`LasyGlobal` monterade den vid idle med 2 s-tak (tvingad körning på drosslad
mobil medan huvudtråden arbetade). Kuren: `LasyChatWidget` blev en egen
event-vakt (PalettVakt-mönstret i samma fil) — montering vid **första
interaktion**, **yttre "ak1a:oppna-mentor"-event** (med bevarad förhandsfråga)
eller **8 s + äkta idle** (requestIdleCallback UTAN tvångs-timeout). Resultat
(§5): chatten hämtas **ej alls** under Lighthouse-mätningen (0 ms i
TBT-fönstret, −106 K transfer per sidvisning i mätning) medan samtliga
öppningsvägar bevaras.

## §1 FÖRE-mätning (deployat bygge)

- Bygge: BUILD_ID `qDivc0Sh4ivSLwQVFSLot` (deployad kod 408f9e20) · mätning
  2026-09-17 ~16:15–16:20Z · lastkontext load ≈ 1,0–1,5 · 0 chrome-processer
  före start (solo i startögonblicket; syskonfabrikens omgång pågick parallellt
  — CPU-tal deklareras med det bandet).
- Rådata: `lighthouse/{start,kurser,blogg}-s7u3e-chatfore.json` +
  `s7u3e-chatfore-sammanfattning.json` (namnrymd s7u3e).

| Sida | Poäng | LCP ms | TBT ms | TTI ms | CLS |
|---|---|---|---|---|---|
| `/` | P45 | 5 543 | 2 412 | — | 0 |
| `/kurser` | P40 | 5 967 | 3 787 | — | 0 |
| `/blogg` | P54 | 4 484 | 2 802 | — | 0,0002 |

Sond (`verktyg/_s7u3e-sond-chatchunk.mjs`): chat-chunken på detta bygge
`3v1r20o-hksum.js` — **106,4 K transfer**, nätverk start **2 303 / 2 385 /
2 025 ms** (//kurser//blogg), dvs. mitt i TBT-fönstret på alla tre. Största
enskilda JS-chunken på varje sida. (o45:s bygge kallade samma chunk
`2ecierimwxqep.js` — chunk-hashen byts per bygge, identiteten är modulen.)

## §2 Rotanalys

`src/components/ak1a/lasy-global.tsx` (o1 #5/våg 68): `LasyChatWidget` lindde
`ChatWidgetLaddad` (next/dynamic, ssr:false) i `LasyGlobal` — idle-montering
med `schemalaggIdle(starta, 2000)`. `requestIdleCallback` med timeout-tak
2 000 ms kan **tvingas köra medan huvudtråden fortfarande arbetar** — på
Lighthouses 4x CPU-drossel eldar taket monteringen (chunk-fetch + moduleval)
mitt i blocking-fönstret. Chatten är en **tjänst, inte innehåll**: 30-lagers
svarsmotorerna (92 monsters) behövs först när en fråga faktiskt skickas —
hela 106 K föds in i varje sidvisnings kritiska fas ändå.

## §3 Kuren (commit d75bf2f8)

`LasyChatWidget` ersatte LasyGlobal-barnet med egen vakt — tre utlösare:

1. **Första interaktionen** (scroll/pointerdown/keydown/touchstart, once) →
   montera direkt (oförändrat mot förr).
2. **Yttre öppning** `"ak1a:oppna-mentor"` (t.ex. Fråga-knappen i Min
   portfölj, våg 78 B7) → montera OCH bevara `detail.fraga`;
   `MentorSignal` återsänder eventet när widgetens egen lyssnare är på
   plats.
3. **Basfall i två steg**: `setTimeout(8 000)` → därefter
   `requestIdleCallback` UTAN timeout = äkta idle. På drosslad mobil landar
   monteringen därmed efter första tysta fönstret; på snabb enhet infaller
   idle tidigt och skillnaden mot förr är försumbar.

**Laddningsmekanik**: widgeten laddas via `React.lazy` + `Suspense` (inte
next/dynamic). Skäl: lazy-suspensionen håller `MentorSignal` i **samma
commit** som widgeten när gränsen resolvar — React kör monteringseffekter i
trädordning, så widgetens eventlyssnare är garanterat registrerade före
signalens återsändning. Med next/dynamic (intern state, ingen
föräldra-suspension) skulle signalen kunna dispatcha innan lyssnaren finns
— race som PalettVakt-mönstret (samma fil) redan löst med Suspense-gränsen.

**Opåverkat**: `chat-widget.tsx` (0 rader — syskonens aktiva yta, 27
widgetläsande testfiler orörda), `ShortSeller`/`NotisCenter`/`LasyGlobal`
(oförändrat 2 s-tak), `globalt-skal.tsx` (export-signaturen `LasyChatWidget`
behållen; används rad 363+380).

## §4 Deploy

- Commit `d75bf2f8` 16:2xZ; prod-synken: 16:27-rop **VÄNTAR-RAM** → 16:30
  bygg OOM-dödat (RAM-tak, infra) → **16:37-rop byggde** → **16:41:37Z
  DEPLOYAD automatiskt: 9 commits (089ded18)** — inkluderar även syskon
  s7-u2:s logotyp-prefetch-kur (o50), som landade efter min commit.
- Bygge: BUILD_ID `6qghn83I3yt--H0fK8g0A`; `d75bf2f8` är förfader till
  bygg-head 089ded18 (git merge-base verifierad).
- Prod: `/` `/kurser` `/blogg` = **200 ×3** (curl, https).
- **Rättningen 7c1fd646 + syskonleveranserna** (90cd7c57 kurskort o51,
  ee18d91d blogg o52, 1c969cf6 väntestatus) deployades i nästa fönster —
  en driftincident på vägen, ärligt bokförd: 17:27- och 17:37-ropens
  byggen OMM-dödades/avbröts (RAM-tak + pågående gränssnittsvaktscron) och
  17:37-bygget skrev BUILD_ID men avbröts FÖRE prerender-manifest.json ⇒
  pm2-restarten startade next-servern mot ofullständigt .next ⇒ kraschloop
  (ENOENT, 3 700+ omstarter) ⇒ **prod 502 ~17:42–17:47Z**. Återställning
  av denna agent (drift-akut, AGENTS.md "ALDRIG lämna prod trasig" väger
  över fabriksbyggförbudet): `pm2 stop` + `npm run build` under
  `/tmp/ak1a-deploy.lock` via node-kanalen (`verktyg/_s7u3e-prodatallning.mjs`)
  — node_modules verifierad HEL före (tsc 0) så npm ci sköt undviket —
  därefter `pm2 restart` + **prod 200 ×3 kl 17:47:02Z**. Slutgiltigt
  bygge: BUILD_ID `J87oNXS1k5w1NAMDS1rpJ` (innehåller 7c1fd646;
  merge-base verifierad i worklog-posten). Incidensen bokförs även i
  DRIFTSBOKEN (vaccin: manifest-grind i deploy-sekvensen).

## §5 EFTER-mätning (deployat bygge 6qghn83I3yt--H0fK8g0A)

**Lighthouse** (solo-fönster: 0 chrome-processer, last 1-min 0,00–0,67;
mätning ~16:5xZ; kod = d75bf2f8 som förfader till bygg-head 089ded18 —
ÄVEN syskon s7-u2:s o50-prefetch-kur i samma bygge, se §7):

| Sida | Poäng | LCP ms | TBT ms | CLS |
|---|---|---|---|---|
| `/` | P52 (från P45) | 5 367 | **1 256** (från 2 412, −48 %) | 0 |
| `/kurser` | P45 (från P40) | 5 903 | 3 744 (från 3 787, −1 %) | 0 |
| `/blogg` | P57 (från P54) | 4 246 | **2 346** (från 2 802, −16 %) | 0,0002 |

CPU-tal deklareras med lastband (FÖRE under pågående fabrikssvärm ~1,0–1,5,
EFTER solo ~0) — TBT-rörelserna bär bandet + kurerna; strukturplanet nedan
är lastokänsligt och bärs beviset av.

**Strukturbevis (mekaniskt, last-/versionsokänsligt)** — sond
`_s7u3e-sond-chatchunk.mjs s7u3e-chatefter`:

- Chat-chunken (FÖRE: största chunk, 106,4 K, start 2 025–2 385 ms) finns
  **INTE längre i nätverkstimingen** — största JS-chunken är nu react-
  chunken 70,3 K; **noll requests efter 6 000 ms** på samtliga tre sidor
  (nätverket tystnar 2 429–2 949 ms). Chatten hämtas ej alls under
  mätningen ⇒ 0 ms i TBT-fönstret.
- Requests: `/` 48→45 · `/kurser` 50→41 · `/blogg` 45→33.
- JS-transfer: 479→355 K (−124) · 499→338 K (−161) · 452→291 K (−161).
  Chat-chunkens andel −106,4 K; resterande −20…−55 K bär o50-kuren.
- Total-byte-weight: 755→632 · 799→632 · 703→528 K.

**Beteendekvitto + rättning (7c1fd646)**: chrome `--virtual-time-budget=
15000 --dump-dom` mot prod/bygge 6qghn83 gav **noll chatt-DOM** — bevis på
att d75bf2f8:s rIC-utan-timeout kan svältas (MDN: utan tak garanteras ej
körning). Rättning: rIC med `{ timeout: 2500 }` på 8-s-steget ⇒ montering
tidigast 8 s, **garanterat** senast ~10,5 s. Strukturen opåverkad (fortfar-
ande efter traceEnd ~8 s vid network-quiet). Kvitto på rättat bygge: §5b.

**§5b Kvitto på rättat bygge (J87oNXS1k5w1NAMDS1rpJ, 7c1fd646 i kedjan —
merge-base verifierad)** — bägge hållen mot http://localhost:3000/:

- `chrome --virtual-time-budget=3000 --dump-dom` → **0** chatt-DOM-fynd
  (monteras INTE eager — defern håller i rättat läge också).
- `chrome --virtual-time-budget=15000 --dump-dom` → chattknappen syns
  (`aria-label="AI-Mentor"`) = monterad via 8-s-steget + rIC-taket ≤10,5 s.

Rättningen därmed båda hållen bevisad: svälten påvisad (0 DOM på 6qghn83
med rIC-utan-timeout) OCH guaranten infriad (DOM på J87oNXS med tak
2 500 ms). Syskonet s7-u1:s o52-EFTER bokfördes på samma bygge J87oNXS
(b84ce6f5) — oberoende mätset på samma deploy.

## §6 Kvarstående observationer

- `react`-chunkens hydratiseringsdominans (o45 §1: 59 % av blocking) —
  strukturell trädbantning, ej taget.
- Chat-chunkens **intern-vektdelning** (30 motorlager som egen lazy-gräns
  bakom första frågan) vore nästa steg i storlek — men ytan
  (chat-widget.tsx + 27 widgetläsande testfiler) ägs aktivt av AI-mentor-
  spåret (omgång 15 levererade 3 lager samma dag); kräver koordinerat ägande,
  bokas som observation.
- `/logga-in`-prefetchen (o41:s kö) olöst.

## §7 Metod och ärlighet

- FÖRE och EFTER spänner över **9 commits** (bland dem s7-u2:s o50-kur som
  berör ALLA sidors prefetch — EFTER-talen bär båda kurerna). Mitt rena
  bevis är **strukturplanet**: chat-chunkens hämtningstidpunkt/avsaknad i
  nätverkstimingen (lastokänsligt, versionsokänsligt).
- CPU-tal (TBT/poäng) deklareras med lastband: mätning skedde under pågående
  fabriksomgång (syskon mätte i svärm strax före).
- Verktyg: `verktyg/prestanda-lighthouse.mjs` (spårets standard, mobil-
  emulering, drossel) + sond `_s7u3e-sond-chatchunk.mjs`.
