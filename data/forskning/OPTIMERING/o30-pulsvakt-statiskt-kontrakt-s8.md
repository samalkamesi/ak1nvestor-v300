# o30 — Pulsvaktens fjärde sinne: statiskt kontraktstest — blindheten som dolde 10:02-incidenten stängd I DRIFT

**Spår:** 8 (KVALITET & SÄKERHET — VAKT) · **Enhet:** s8-u2 · **Datum:** 2026-09-16 · **Status:** LEVERERAD OCH AKTIVERAD I PROD (pm2 pulsvakt)

## §0 Syfte och duplikatkontroll

Svar på **o29 §6 bokning 2** (pulsvakten/larmvägen — "trasig-bygg är precis det
tillstånd som förtjänar utåtsignal"). Duplikatkontroll före start: spårets 15+
objekt + gårdagens ronder (o14-f7 → o29); syskonet s8-u4 äger gränsnittsvaktens
deployklassning (0526db9e) och prod-synk-pipelineverifikationen (5419b688),
s8-u1 sonden själv (804aa36c) — pulsvaktens (d)-steg var olöst. Kraschvaktens
resurssond är bokad till huvudagenten (s8-u4:s kö-punkt) — RÖRD EJ. Våg 178
Mimosa full-scan = huvudagentens bokning — orörd.

## §1 Rotorsaken

Incidenten 2026-09-16 10:02–10:2x (o29 §2): OOM-dödat bygg tömde
`.next/static` medan pm2 levererade cachad HTML → ALLA `_next/static` = 500,
kundsynligt ostylat i 20+ min, och pulsvakten var **GRÖN hela vägen** — dess
tre steg ser bara HTML/API-svar: (a) GET / = 200 ✓, (b) /api/sok = 200 ✓,
(c) extern 200 ✓. Ingen hälsokontroll i hela stacken hämtar de TILLGÅNGAR
HTML:en själv refererar. Pulsvakten är den ENDA kontinuerliga (60 s) vakten —
den var rätt steg att ge det nya sinnet.

## §2 Kuren — (d) STATISKT KONTRAKTSTEST i pulsvakten

**Princip (statisk-sondens §4): HTML:en är kontraktet** — varje
`_next/static`-ref den bär SKA svara 200. Varje varv (60 s): hämta / på
nytt, extrahera ALLA refs, HEAD:a varje (GET-fallback vid 405/501, tak 80
refs/varv, dedupe i extraheringen — incidenten bar 25).

Tre leveranser:
1. **`verktyg/pulsvakt-statisk.mjs`** — REN beslutsmodul (granssnitt-konsol-
   mönstret: pulsvakt.mjs är toppnivåskript vars entré startar eviga loopen —
   beslutet måste vara importbart utan att vakten startar). `statisktBeslut()`
   klassar gron/sida-nere/trasig-bygg + deploy-undertryckning; `begransaRefs()`
   + tak-konstanter; återexport av `extraheraStatiskaRefs` (ett importställe).
2. **`verktyg/pulsvakt.mjs`** — (d) trådat i kontrollvarv: hämtning
   (`kollaStatiska` + `tillgangsStatus`), beslut, larmkadens, statusfält
   (`statiskStatus`/`statiskSenasteFel`/`statiskFelvarv` — additiva, rondens
   läsare opåverkad), `--test` visar (d) och exitar 1 vid fynd.
3. **`verktyg/testa-pulsvakt-statisk.mjs`** — 17/17 PASS (S1–S13), ingen IO.

**Doktrinbeslut (skrivna i kod + testade):**
- **ALDRIG pm2-omstart på trasig-bygg.** Omstart förlorar den cachade HTML:en
  (det sista som fungerar) och lagar inget — tillgångarna är BORTA från
  disken. Läkning = ombygge under deploylåset (prod-synk/kraschvakt äger).
  Vakten SIGNALERAR: hogprio.
- **Deploy-undertryckning med eskaleringstak** (våg 142 + o29 §3:s fail-safe):
  under aktivt deploylås är transienta 500 VÄNTADE (.next skrivs om medan
  gamla pm2 serverar) → info-transient, räknas ej. Men efter **30 varv
  (≈ 30 min)** eskaleras till hogprio ändå — ett fastlåst/svältande bygg är
  självt ett incidenttillstånd (RAM-grynnan 10:17–10:47 bevisade klassen).
- **Larmkadens:** fynd varv 1 = hogprio; därefter "fel"-nivå; var 10:e varv
  hogprio-påminnelse; grön-övergång = info-återställning (loggen ska inte
  drunkna, men aldrig tystna).
- **Låset frigjort + tillgångar fortfarande borta ⇒ OMEDELBART hogprio**
  (S9 = 10:02-fallet: OOM:at bygg släpper låset, skadan kvarstår).
- **sida-nere ägs av (a)** — (d) duplicerar aldrig (a):s omstartslarm.
- **Lös `deployPagar`**: flock-proben (en process-spawn) anropas ENDAST när
  fyndbilden är trasig-bygg — friska varv betalar den aldrig (S10/S11).

## §3 Live-bevisningen — mot PÅGÅENDE incident, båda faserna

Fas 1 (före min omstart, 10:44–10:51): `--test` mot den LEVANDE 10:02-skadan:
**(a) OK · (b) OK · (c) OK · (d) FEL trasig-bygg 22/25** (chunks/woff 500,
ordagranna incident-URL:er) — gamla pulsvaktens hela värld grön, det nya
sinnet ser kundskadan. Exit 1. Det är blindhetsbeviset i EN utskrift.

**AKTIVERING 10:52:** `pm2 restart pulsvakt` (användarnivå, ingen sudo, inget
bygge — pulsvakt-start.sh:s eget uppgraderingsrecept). Första varvet
10:52:28, **12 s efter prod-synkens deploy** — och fångade incidentens
FAS 2 (se §4): `statiskStatus: "trasig-bygg"` i statusfilen + hogprio-larmrad
i pulsvakt-larm.log (ronden läser dess 3 senaste rader → incidenten ytar sig
nu automatiskt varje styrelserond). Varv 2: fel-nivå enligt kadensen.
Kontroll: daemonen lever, felIRad 0 (korrekt — (d) triggar ALDRIG omstart).

## §4 NYTT FYND under fönstret: ISR-föråldring efter deploy (fas 2)

Prod-synken fick RAM 10:47:13, byggde och deployade **10:51:58** ("DEPLOYAD
automatiskt: 19 commits — prod 200"). `.next/static/chunks` återföddes
(97 filer) — men sonden + pulsvakten (d) såg fortfarande trasigt, ny felbild:
**12/25 tillgångar 404** (ej 500). Mekanismen bevisad:
`x-nextjs-cache: HIT` + `Cache-Control: s-maxage=3600, stale-while-revalidate`
— startsidan serveras ur **ISR-cachen som överlever bygget** (`.next/cache`
bevaras av next build), HTML:n refererar 12 i nya bygget omdöpta chunk-hashar
(13 refs oförändrade innehålls-hashar lever kvar — därav blandbilden).
**Konsekvens: varje deploy har ett post-deploy-fönster (upp till ~1 h,
s-maxage) där cachade sidor bär borta hashar = kundsynligt delvis ostylat.**
~6 min efter deploy: fortfarande trasig (10:56).

**Beviskedjans värde:** prod-synkens deploy-verifikation "prod 200" passerade
10:51:58 medan sajten var trasig — **o29 §6.1 (statisk-sond SIST i
deploy-kedjan) bevisad levande igen**, nu med larmlogg som vittne. 10:02-fallet
dog i tysthet; 10:52-fallet larmade inom 12 sekunder.

**Bokningar (ägare):**
1. **Prod-synk/kraschvakt (daemonägare):** post-deploy-steg — statisk-sond
   SIST i deploy-verifikationen (o29 §6.1, nu dubbelt bevisad) + överväg
   revalidate/ISR-varmning av de tunga ISR-sidorna direkt efter pm2-restart
   (ISR-varmaren 03:10 finns redan som mönster) — stänger fas-2-fönstret.
2. **Pulsvaktens (d) + rundens läs-yta: klar** — statusfält + larmlogg räcker;
   ev. studio-kick vid hogprio är huvudagentens larmvägsbeslut.

## §5 Läkning + After-bevis

Läkning av fas 2 ägs av ISR-omvalidieringen (SWR, begäranstyrd) eller
ev. nästa deploy — INTE av mig (byggen förbjudna; korrekt ägarskap hölls
andra dagen i rad). **Frikopplad läkningsvakare** (s7-u2-mönstret,
`setsid node /tmp/s8u2-lakningsvakare.mjs`, pid bevisad): sonder var 3:e
min, vid GRÖN körs `pulsvakt --test` som fullständigt facit; logg:
`data/vakten/statisk-lakning-2026-09-16-s8u2.log`. Max 2 h, därefter ärlig
"ej läkt inom fönstret"-rad.

## §6 Bevis

- `node --check` × 3 (pulsvakt.mjs, pulsvakt-statisk.mjs,
  testa-pulsvakt-statisk.mjs) + vakaren — GRÖNA.
- `node verktyg/testa-pulsvakt-statisk.mjs` → **17/17 PASS**.
- `node verktyg/testa-statisk-sond.mjs` → **10/10 PASS orörd** (s8-u1:s
  svit — återexporten bryter inget).
- `node verktyg/pulsvakt.mjs --test` mot levande incident: (a)(b)(c) OK +
  **(d) FEL 22/25**, exit 1.
- `node node_modules/typescript/bin/tsc --noEmit` = **0** (src/ orörd).
- **Drift:** pm2 pulsvakt omstartad 10:52, första varv fångade fas 2
  (statusfil + hogprio-larm 10:52:28, fel-varv 10:53:29) — blindheten stängd
  I PROD, inte bara på papper.
- INGET bygge från denna våg; pm2 restart pulsvakt är användarnivå-daemon-
  omstart (pulsvakt-start.sh:s dokumenterade uppgraderingsväg), R2 orörd
  (inga priser/tier/publicering, data/blogg orörd, .env/nycklar orörda).

## §7 Arv

- (d)-steget läser ALDRIG .next från disk — det mäter det ENDA som spelar
  roll för kunden: det som HTML:en faktiskt bär. Följaktligen fångar det
  ALLA felklasser som rör tillgångar (tom .next, hashrotation vid deploy,
  ISR-föråldring) utan ett enda specialfall.
- Kadens + undertryckningstak är generaliserbara för framtunda vaktsteg:
  signalera direkt, tysta endast under bevisat transienta fönster, eskalera
  när transienten överskrider sitt tak.
