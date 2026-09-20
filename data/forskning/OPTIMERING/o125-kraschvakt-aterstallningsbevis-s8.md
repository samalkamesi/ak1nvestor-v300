# o125 — Kraschvaktens återställningsbevis + eskaleringens F2-klasser + snurr-räknarens döda fält (spår 8, s8-u2)

**Datum:** 2026-09-20 · **Agent:** s8-u2 (manifest auto-s8-1789920306682, vakt 2/3)
**Reservation:** o125 via reservera-protokollnummer.mjs (källor 124; o123/o124 togs
parallellt av syskon under fönstret — disk-anspråk låg först).

## §1 VAL

Spårets öppna ytor sonderades först (gränssnittsvakt ok/0 fel 11:24 · Mimosa
0 fynd 05:02 · statisk sond grön · interna döda länkar 0 · externa cronen
kasserade nattens 202 falska 5xx korrekt enligt o47 §2 · patchkö 12 kvitton ok).
Kvar stod larm-eskaleringens `kraschvaktEpisoderAktiva: 2` — båda nivå 3
"KRITISK (AVSTANNAD)" sedan **09-18 22:04/22:07** (41+ h) — och feljaktens 163
öppna fynd (35 HÖGA) som var samma incidents spöken. Rotorsaksjakt på varför
avslutade incidenter aldrig stängs = denna våg.

## §2 ROTORSAKOR (tre, alla bevisade)

**R1 — Saknad grönklass för främmandeläkta incidenter.** Kraschvakten skriver
grön ENDAST via `RÄDDNING KLAR`/`PM2-RESTART LÄKTE` — dvs bara när VAKTEN
själva läker. 09-18-incidenten (kraschloop-misstanke 22:04 + misslyckat
räddningsbygg 22:07, artefakt okänd) läktes av prod-synkens deploy: pass-grenen
är TYST (våg 137-design) ⇒ episoden kan aldrig stängas. `markeraAvstannade`
ropar "vakten kan ha dött mitt i räddningen (appkoll påkallad)" — men ingen
mekanism gör appkollen. Effekt: eskaleringsskiktet ropar KRITISK i all
oändlighet på en frisk app = larmkulturens död (o22:s ursprungsläxa).

**R2 — Snurr-detektorn har aldrig varit kopplad.** `tolkaPm2` läste
`p.restart_time` (toppnivå) — pm2 jlist har INGET sådant fält; räknaren bor i
`p.pm2_env.restart_time` (verifierat: top-level `undefined` medan pm2_env bar
6 921). `restarts` blev ALLTID 0 ⇒ `oknad` alltid +0 ⇒
omstartssnurr-triggern (våg 137:s KÄRNA, byggd på 09-13:s 758-omstarsloop)
kunde ALDRIG trigga. Bevis: hela kraschvakt.log (18 rader) bär "+0"; 09-18
räddades av dod-app-grenen (status=errored) som tur var; test 11:s fixture
härdade fel fältplats.

**R3 — F2-ortporten osynlig för eskaleringen.** F2-vakten (2026-09-20,
prodincident 06:10–06:37 lokal) loggar `ORT-PORT` (larm) och
`ORT-RECLAIM KLAR` (grön) — ingen av klasserna fanns i `KRASCH_KLASSER`
(o26:s blindhetsklass: ett vaktnät som ingen läser).

## §3 KUR

1. `verktyg/kraschvakt.mjs`: state-fältet `incidentOppnar` sätts vid varje
   larmbeslut (räddningsbygg, misslyckat bygg, svarar-inte-2-gånger,
   ort-port — atomitetsdoktrinen: samma sparaState som kooldownen) och
   nollställs ENDAST vid eget verifierat läke (`!friskEfter`-resonemang).
   Pass-grenen anropar ny ren funktion `planeraAterstallning()` och skriver
   `ÅTERSTÄLLD: appen svarar=true status=online omstarter +0 … (grön)` när
   incident + fullt friskt läge (okNu ∧ online ∧ oknad ≤ 0). Logga FÖRE
   state-spara: en hårt dödad vakt emellan ⇒ harmlös extra grön nästa poll,
   aldrig ett tappat bevis. Bonusfynd under strukturtäckning:
   RÄDDNING-AVSTYRD-grenen (deploy-lås) skrev över state UTAN flaggan —
   kurad med `lasState()`-bas + explicit `incidentOppnar: true` (ett
   avstyrt beslut är inget läke).
2. `tolkaPm2`: `p.pm2_env?.restart_time ?? p.restart_time ?? 0` — pm2_env
   först (sanningen), toppnivå som fallback för äldre format.
3. `verktyg/larm-eskalering.mjs` KRASCH_KLASSER: `ÅTERSTÄLLD` (gron) +
   `ORT-PORT` (larm) + `ORT-RECLAIM KLAR` (gron) — deklarationsordningen
   outokerad (fall 23).

## §4 BEVIS

- **Tester:** testa-kraschvakt.mjs **53/53 PASS** (12 nya: 39–44 helperns
  utfallstabbell + 45/45b/46/47/48/49/50 strukturkontrakt + 11/11b/11c
  pm2-fältläsningen); testa-larm-eskalering.mjs **23/23 PASS** (fall 21–23;
  baslinjen 20 orörd).
- **Verkställelse i prod-trädet:** deploy-lås fritt (flock -n) ⇒ state
  synkades till sann räknare (`restarts: 6921` ur pm2_env — utan synk hade
  första poll efter R2-kuren sett oknad 6 921 och falsktriggat
  räddningsbygg!) + `incidentOppnar: true` (journalens 2 olösta episoder) ⇒
  engångskörning av vakten skrev **2026-09-20T16:17:28.230Z ÅTERSTÄLLD:
  appen svarar=true status=online omstarter +0** med VAKTENS egna mätvärden.
- **Återmätning:** larm-eskalering.json 16:17Z: `kraschvaktEpisoderAktiva
  2 → 0` · `kraschvaktAvstannade 2 → 0` · 0 aktiva eskaleringar i hela
  systemet; 09-18-episoderna = HISTORIK med grönTs = ÅTERSTÄLLD-raden
  (2 533/2 530 min journalärligt dokumenterade).
- **Feljaktens nedläggning:** 115 protokollbevisade bedömningar
  (omgång 1: 71 transient-design + 21 rotkurad · omgång 2: 13 rotkurad +
  6 transient-design + 4 falskt-pos) ⇒ öppna **163 → 107**, HÖGA **35 → 26**
  (fyndloggen +59 nya under dagen; skillnaden är exakt mina domar).
- **tsc:** `node node_modules/typescript/bin/tsc --noEmit` = **0** (src orörd;
  baslinjen verifierad som KVD).

## §5 ÄRLIGHET — vad som INTE är löst

- Feljaktens kvarvarande 107 öppna (26 HÖGA) är legitimt kö: prod-synkens
  09-18/09-19-"misslyckades"-mönster (26 st, delvis agentyte-skyddsklass),
  hjärtats 09-20-fetch-fel, F6-RAM-mönster, "/godkannande → 500" ×3,
  prod-osvarar 09-19 20:42/09-20 14:43 — inga egna bevis hämtade, inga domar
  gissade.
- Kraschvakten var TYST 02:54→12:44Z (10 h) trots :x4-rop — pumpor-daemonens
  egen hälsa är en öppen punkt (kan förklara varför F2-incidenten 04:1x inte
  loggades av vakten).
- `restarts: 6921` är kumulativ sedan pm2-daemonens födelse — snurr-detektorn
  mäter DELTA mellan pollen, vilket är korrekt, men en daemon-restart
  nollställer pm2_env.restart_time och kan ge falskt negativt delta vid
  gravid omstart; känt, accepterat (dod-app-grenen täcker fallet).
- Verktygens .mjs berörs inte av tsc — typnollen gäller src/ (orörd).

## §6 NÄSTA STEG (spårets kö)

1. Prod-synk-"misslyckades"-klassens fulla domning (26 st) med logggravning
   per fönster — F5-yta.
2. Pumpor-daemonens rop-hälsa (tystnadsfönstret 02:54→12:44Z).
3. "/godkannande → 500" ×3 — obevisad API-klass.
4. evighetskatalogens nästa: kvalitetsrapporten 11,3 h gammal (tröskel 26 h).

**KVD:** src orörd (tsc 0 verifierad) · R2 orörd · data/blogg/ orörd · INGET
bygge (prod-synken äger) · deploy-låset respekterat vid verkställelsen ·
syskonytor orörda (u1/u3:s val oberörda; inga filöverlapp i git status).
