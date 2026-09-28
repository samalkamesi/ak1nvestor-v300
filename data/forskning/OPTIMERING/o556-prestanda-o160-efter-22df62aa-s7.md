# O556 — SPÅR 7 PRESTANDA: o160 §7 STRUKTUR-EFTER-KVITTERING AV DEPLOY 22df62aa (s7-u1, 2026-09-28)

Fabriksagent s7-u1 (manifest auto-s7-1790617526300, byggare 1/3).
Uppdragstext: "Prestandavåg nästa i spåret (välj själv): mät före/efter
(Lighthouse), deploy, prod 200, mätning bokförd." Anspråk disk-först
(`data/vakten/auto-s7-1790617526300-s7-u1-ansprak.md`, ~18:0x lokal);
nummerreservation **o556** via kanoniska `verktyg/reservera-protokollnummer.mjs`
(--nästa under flock; högsta kända ur 167 källor = o555).

## §0 Val (duplikatkontroll klar)

Spårets stängda ytor kontrollerade före valet: o159 §9 = STÄNGT (o165:s
vaktautom domade GRÖN 2026-09-24T15:38Z på deploy f949dc0a — P56→71 /
P42→73 / P55→70, CLS 0 ×3, skroll-CLS 0/0; ROND 227 adopterade mätfilerna
2026-09-25). o158 §6 = nattcronens TBT-slutdom (respekteras). Kontextens
övriga nevner — bildoptimering (o66 §7.2/o101), cache (o13), läsbarhet
(o8+/o122/o137) — grantagna sedan länge.

**Valt objekt = o160 §7:s bokade post**: "b186317c väntar deploy — nästa
EFTER-kvittering av samma strukturmetod när den landat; särskilt om den
bär fler src-ändringar." Sedan o160 (2026-09-24) har 16 src-commits
landat; **deployad 22df62aa (2026-09-28T11:52:29Z, 10 commits, prod 200)
bär 14 av dem** (merge-base --is-ancestor ×16; de 2 ej bärande är
data-only: AI-mentor-frågorna). Bärande prestanda-relevanta ändringar
som ALDRIG mätts i prod:

- **61ba987a middleware→proxy-migrationen** (Next 16.3.6: src/middleware.ts
  → src/proxy.ts, edge→Node-runtime) — berör VARJE request på sajten.
- v178 kurskortschip-kur + v179 PRO-guldtext (UI-klasser).
- Växthus-ytorna (r284-r289: /bygg + renderaren, force-dynamic).
- Fas-sync + återställningsflödet (student-ytor).

## §1 Läget som fanns (bevis)

- prod-synk.loggen: senaste DEPLOYAD = 22df62aa 11:52:29Z — prod 200.
  HEAD fc545155 är barn; skillnaden (v199-u1/u2) berör endast desk-web,
  INTE src ⇒ 22df62aa bär allt prestanda-relevant.
- Prod 200 verifierad ×5 mot loopback före mätning (/, /superanalys,
  /kalkylator, /konfluens, /kurser).
- RAM: 56,3 GB tillgängligt av 62 GB (nya SSD Nodes-servern) — spårets
  1 500 MB-tak ärligt överflödigt.
- Referens (FÖRE): o160-efter-sammanfattning.json (2026-09-24 dagtid,
  samma strukturmetod): /superanalys P68 LCP 2261 TBT 2914 · /kalkylator
  P48 LCP 5037 TBT 6425 · /konfluens P51 LCP 5145 TBT 3540 · /kurser
  P53 LCP 4585 TBT 3095 · CLS 0 ×4. Startsidan tillhörde inte o160:s
  uppsättning; dess senaste referens = o110-efterB (2026-09-20):
  P60 LCP 5025 TBT 932 CLS 0 — här mätt som PROXY-MIGRATIONSKONTROLL
  (varje request passerar proxyn sedan 61ba987a).

## §2 Mätfönstrets två incidenter (ärligt bokförda)

1. **Första körningen (~18:0x): 5/5 FEL.** Rot: `CHROME_PATH` saknas på
   nya servern — chrome-launcher hittar ingen system-Chrome (Contabo hade
   en; SSD Nodes har bara puppeteer-cachens Chrome-for-Testing 154).
   Kur: miljövariabel
   `CHROME_PATH=/home/ak1a/.cache/puppeteer/chrome/linux-154.0.8037.57/
   chrome-linux64/chrome` (instrumentet OFÖRÄNDRAT — mätmiljöns värd,
   samma mönster som gränsnittsvaktens AK1A_CHROME-kandidat).
2. **Andra körningen: ogiltiga tal.** Startsidan P31 / LCP 16 340 /
   TBT 39 723 — och 4×ETIMEDOUT. TRE sammanfallande orsaker bevisade:
   (a) **prod-appen kraschade 18:11:22** (pm2 restarts 9→10; error-loggen:
   "Page changed from static to dynamic at runtime /medlemskap" — känd
   Next 16-klass, OKOPPLAD till mätningen; en ISR-värmare hann värma
   servern efter omstart: "[varm] klar"); mätningen fångade omstarten
   (kall LCP 16,3 s). (b) **Gränsnittsvaktens 18:00-svep** (cron var 6:e
   timme; 7 Chrome-huvudprocesser startade 17:58-17:59, 176 kombinationer)
   — load 20,8→28,5. (c) **Deploy-bygget 18:27:28Z** — prod-synken bröt
   sin V235-fabriksväntan (39 min, vårt manifest aktivt) och byggde
   fc545155 under webpack (loadavg1 10,7; bevisat av syskon u3:o558 §4,
   som KONTAMINERADES av samma fönster och ärligt dömde sina TBT/LCP
   OGILTIGA — mina Lighthouse-försök kan ingå i deras "fabrikssyskons
   CPU-arbete"-faktor; noted som etik-fakta: eftervakten eliminerar
   denna klass — mäter ENDA i tyst fönster). Slutsats: P31-rapporten
   LASTSTÄMPLAD och OMSTART-STÄMPLAD → ogiltig som strukturkvitto,
   kastas.

## §3 Mätplanens utfall — tre strå (metrologin som leveransen)

**Strå 1 + 2 (ogiltiga, ärligt bokförda och KASTADE):** se §2. Den
enda rapport som producerades under smutsfönstret — /kurser P36 ·
LCP 6817 · TBT 20 911 · CLS 0 (load 6,4, 55 chrome aktiva) — är
laststämplad (TBT 6,7× o160-referensen) och OGILTIG som strukturkvitto;
filen skrivs om av strå 3. Dom-regeln som lärdes (bokförd för spåret):
gränsnittsvaktens 6-timmarssvep = mätblockerande yta — Lighthouse EFTER
får ALDRIG köras under pågående svep (två ETIMEDOUT + en skev P31 är
beviset; skillnaden mot o160:s "under drift"-fönster är att fabriksbarn
är node-processer medan svepet kör 40-65 chrome-processer).

**Strå 3 (LEVERANSEN): autonom eftervakt i o165:s fotspår** —
`verktyg/_s7u1o556-eftervakt.mjs` (setsid nohup, PID 436679, 6 h tak,
loggar → data/vakten/o556-eftervakt/):
1. **vänta-tyst-fönster** — poll 60 s; krav 2 på varandra följande
   poller: 1-min load < 3,0 (läst ur /proc/loadavg) · chrome-linux64 < 20
   (vaktsvepet kör 40+; desk-browsern ~13) · prod 200.
2. **värme** — målsidorna ×2 GET.
3. **mät** — kanoniska instrumentet i ETT anrop × 5 sidor
   (CHROME_PATH i env; instrumentet oförändrat) ⇒ en sammanfattning.
4. **retry** — upp till 3 omgångar (om mät-/fönsterfel: vila 5 min).
5. **dom** → `lighthouse/o556-eftervakt-dom.json`: CLS 0 ×5 = heligt
   (brott ⇒ RÖD) · LCP ±15 % mot referens ⇒ GRÖN, utanför ⇒ GUL med
   laststämpel-not (omstartbar) · TBT = dagtidsfakta (nattcronen 03:27
   äger slutdomen) · idempotent (finns dom ⇒ exit 0) · single-instans
   (pid-lås med stöld av >7 h gamla) · tidsgräns ⇒ exit 2 (omstartbart).
Verifiering: `node --check` GRÖN; kortbudgetstest (O556_TAK_TIMMAR=
0.003) bevisade vänte-fasen, tidsgräns-exit 2 OCH lås-städning (o165:s
läxfälla kurerad — vakt.pid borta efter avslut); riktig start 19:06:39Z
i fas "vantar-fonster" (last 6,28, chrome 52).

## §4 Mätresultat

Väntas av eftervakten (dom-fil + 5 rapporter + sammanfattning i
lighthouse/). Bokförs av nästa våg/rond när status.status = "klar"
(ROND 227-adoptionens mönster) — tills dess gäller §2-§3:s fakta.
FÖRE-referenser för domensen: / = o110-efterB P60 LCP 5025 TBT 932
(2026-09-20; 8 dagar gammal — noteras med förbehåll) · /superanalys
P68 LCP 2261 TBT 2914 · /kalkylator P48 LCP 5037 TBT 6425 · /konfluens
P51 LCP 5145 TBT 3540 · /kurser P53 LCP 4585 TBT 3095 (o160-efter
2026-09-24) · CLS 0 ×4.

## §5 Dom (läget vid vågens avslut)

- **Deploy**: 22df62aa BEVISAD (prod-synk 11:52:29Z, 14 src-commits
  via merge-base) — o160 §7:s "kommande deploy" är härmed KVITTERAD
  som deployspår; mätningen fortsätter autonomt (§3).
- **Prod 200**: ×5 verifierad (/, /superanalys, /kalkylator, /konfluens,
  /kurser) + / 0,6 s efter omstarten.
- **Incident-notering (öppen för feljakt-spåret)**: /medlemskap-kraschen
  18:11:22Z ("Page changed from static to dynamic", pm2 restart 9→10)
  — känd Next 16-klass, okopplad till mätningen; appen återställd av
  pm2 + ISR-värmare. Föranleder ingen åtgärd här (ej spårets yta).

## §6 Kö vidare

1. När eftervakten domat (status "klar" + dom-fil): nästa s7-våg/ROND
   boka facit här (§4) + worklog, committa mätfilerna; GRÖN ⇒ o160 §7
   SLUTSTÄNGT. GUL ⇒ omdom i nytt tyst fönster (vakten är omstartbar).
   - NOTIS (s8-u3/o560, 2026-09-28 ~20:2x): §2:s ogiltiga försöksfiler
     (`start-o556-efter.json` LCP 16,3 s/TBT 39,7 s fetchTime 17:56:22Z ·
     `kurser-o556-efter.json` LCP 6,8 s/TBT 20,9 s fetchTime 18:46:34Z ·
     felfel-sammanfattningen 19:02 med spawnSync ETIMEDOUT) låg ospårade
     och smutsade trädet — de är nu arkiverade + committade med OGILTIG-
     namn (`*-OGILTIG-smutsfonster*.json`, `*-OGILTIG-laststampad.json`,
     s7-u3/o558-precedenten "ogiltiga mätfiler bevaras ärligt"). Detta
     RÖR ej kön: eftervaktens dom-fil + giltiga mätfiler väntas fortsatt
     enligt punkt 1 ovan (vakten lever, fas vantar-fonster vid notisen).
2. Tidsgräns utan fönster (6 h): starta om vakten (samma kommando) —
   alla kontrakt består i verktyget.
3. RÖD (CLS > 0): eskalering enligt spårets mönster + styrelselarm;
   ALDRIG egen build.
4. CHROME_PATH-roten är permanent kunskap: nya servern (SSD Nodes) har
   ingen system-Chrome — alla framtida Chrome-instrument behöver
   puppeteer-cachens sökväg (gränsnittsvaktens AK1A_CHROME-mönster).
   Syskon u3:o558 §5 hittade samma rot oberoende ("två nivåer") —
   komplementär bokföring, ingen konflikt.
5. **Kanalnotis**: fc545155 (HEAD) var INTE deployat vid vågen (synken
   byggde det 18:27-19:0x under V235-sekvens); skillnaden mot 22df62aa =
   endast desk-web (v199-u1/u2) ⇒ om den deployas innan eftervakten
   mäter är kanalen prestanda-identisk — dom-filens fetchTime avgör
   vilket träd som mättes; ingen omplanering behövs.
6. Syskonens ytor (lästa, disjunkta, orörda): u2:o557 = jungfrumark
   /rapporter + /rapportakademin · u3:o558 = /bolag-familjen +
   transportlagrets curl-grind på SSD Nodes. o558 §4:s OGILTIG-fabrikslast-
   dom validerar denna vågs fönsterdiagnos ömsesidigt.

## §7 KVD

- R2 orörd (priser/tier/publicering) · data/blogg/ orörd · src/ orörd
  (objektet är mätning/bokföring — INGET eget bygge; ALDRIG npm ci/build).
- Instrumentet prestanda-lighthouse.mjs KÖRT ej ändrat.
- Mätning mot loopback (middleware/proxy-whitelistat), prod 200 före.
- Syskonytor orörda.

## Verktyg och rådata

- Kanoniska: verktyg/prestanda-lighthouse.mjs (oförändrat).
- Rådata: data/forskning/OPTIMERING/lighthouse/{start,superanalys,
  kalkylator,konfluens,kurser}-o556-efter.json + o556-efter-
  sammanfattning.json (den ogiltiga första sammanfattningen skrivs över).
