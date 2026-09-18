# o70 — Cache-header ROND 4: nginx-lagerstädning (spår 7)

**Ägare:** s7-u2 (byggare 2/3, manifest auto-s7-1789729524) · **Datum:** 2026-09-18
**Status:** PÅGÅENDE (FÖRE-mätt, kur designad — EFTER bokförs i detta protokoll)
**Anspråk disk-först:** `auto-s7-1789729524-s7-u2-ansprak-o70-nginx.md` (rot).
**Föregångare:** o66 (rond 3 — Next-lagret, LEVERERAT: 4d5dd5e1 + EFTER 7e885512).

## §0 Driftkontext — ronden kördes mitt i ett OOM-återhämtningsfönster

Prod låg NERE 16:30:33Z–(läkning pågår) då Två på varandra följande
prod-synk-byggen OOM-dödades (16:20:02Z och 16:30:33Z, data/vakten/prod-synk.log)
— varje dödat bygge lämnar .next halvraderad och pm2 boot-loopar ("Could not
find a production build"). Sannolik rot: fabrikens tre s7-barn (spawnade
16:25Z, ~0,8 GB/st) + next-bygget över 8 GB-taket. Jag byggde ALDRIG självt
(våg 100-regeln) utan väntade ut prod-synkens egna återhämtning (poll
16:37:01Z, RAM-vakt 4 035 ≥ 2 200 MB grön). nginx-ronden kördes först efter
prod 200 — cache-mätningen blandas aldrig med ett nere-fönster.

## §1 Valet + duplikatkontroll

o66 §6 dokumenterade resten: nginx (våg 96 D1-rader i
/etc/nginx/sites-available/ak1a) bär ett EGET cache-lager som på prod
UNDERTRYCKER Next-lagrets värden HELT (mätning 16:2xZ: /ak1a/ + /og/ visar
endast nginx `max-age=2592000` + `public`; llms-full nginx `max-age=86400` +
`public`) — o66:s swr-hybrider var döda bokstäver på prod-nivå. Konkurrenter
till objektvalet: bildoptimering (SKRIVEN AV, o66 §7.2), koddelning
(chunk-paret = huvudagentens §5.1-rest), mobil läsbarhet (STÄNGT, o62),
Lighthouse-jakt (mättad, o66 §7.1). Rond 4 = spårets sista öppna cache-yta.

## §2 FÖRE-mätning

Full sweep mot prod-HTTPS EFTER läkning, FÖRE nginx-edit (identisk metod som
o66 §4: curl -sI, Cache-Control-rader ordagrant). Rådata:
`o70-cache-headers-fore-efter-2026-09-18.json`. Pre-outage-snapshot (16:2xZ,
prod 200): /ak1a/favicon.svg + /og/blogg/vad-ar-roe.png = `max-age=2592000` +
`public` (2 rader, ingen swr); /llms-full.txt = `max-age=86400` + `public`;
/manifest.json = Next-raden `public, max-age=3600, stale-while-revalidate=86400`
(ENDA sökvägen utan nginx-location — beviset för mekanismen: utan nginx-lager
flödar Next-raden oskadd).

## §3 Kur — nginx våg-96-D1-block renodlas (Next äger värdena)

| location | FÖRE (nginx) | EFTER |
|---|---|---|
| `/og/` | expires 30d + add_header "public" (undertrycker Next) | enbar proxy_pass — Next: `public, max-age=604800, stale-while-revalidate=86400` |
| `/ak1a/` | expires 30d + add_header "public" (undertrycker Next) | enbar proxy_pass — Next: `public, max-age=86400, stale-while-revalidate=604800` |
| `^/llms(-full)?[.]txt$` | expires 24h + public på BÅDA | delas: `= /llms.txt` behaller nginx 24h (Next saknar regel); llms-full.txt faller till `location /` — Next: `public, max-age=3600, stale-while-revalidate=86400` |
| `(sok-index|speglar-slugar).json` | expires 1h + public | ORÖRD — Next saknar headers()-regel; borttagning = max-age=0-regression (flytt = framtida rond, kraver koordinerad deployordning) |
| `/_next/static/` | expires 365d + add_header "public, immutable" | beslut efter FÖRE-mätning (Next skickar sjalv `public, max-age=31536000, immutable` — identiskt varde; rening endast om dubbelrad påvisas) |

Sakerhet: `sudo cp` config → tidsstamplat backup; `sudo nginx -t`; `sudo
systemctl reload nginx` (reload, ej restart — aktiva anslutningar oroas ej).
Rollback: `sudo cp` tillbaka + reload (< 10 s). letsencrypt-inkluden bar 0
add_header (arv riskfritt).

## §4 EFTER — reload 16:43:16Z, sweep GRÖN (maskinell, 16:43:20Z)

| Resurs | FÖRE (rader ordagrant) | EFTER | Dom |
|---|---|---|---|
| /ak1a/favicon.svg | `max-age=2592000` + `public` | `public, max-age=86400, stale-while-revalidate=604800` | Next-raden lever, EN rad, swr ✓ |
| /ak1a/logo/ikon-192.png | `max-age=2592000` + `public` | `public, max-age=86400, stale-while-revalidate=604800` | ✓ |
| /ak1a/logo/skulptur-mark.jpg | `max-age=2592000` + `public` | `public, max-age=86400, stale-while-revalidate=604800` | ✓ |
| /og/blogg/vad-ar-roe.png | `max-age=2592000` + `public` | `public, max-age=604800, stale-while-revalidate=86400` | ✓ |
| /manifest.json | `public, max-age=3600, stale-while-revalidate=86400` | oförändrad | referensyta ✓ |
| /llms-full.txt | `max-age=86400` + `public` | `public, max-age=3600, stale-while-revalidate=86400` | ✓ |
| /llms.txt | `max-age=86400` + `public` | oförändrad (nginx ensam ägare — korrekt) | ✓ |
| /sok-index.json | `max-age=3600` + `public` | oförändrad | ✓ |
| /speglar-slugar.json | `max-age=3600` + `public` | oförändrad | ✓ |
| /_next/static/chunks/0el5nt6-nk2y3.js | `max-age=31536000` + `public, immutable` (DUBBELRAD påvisad ⇒ rening enligt §3-regeln) | `public, max-age=31536000, immutable` | identiskt värde, EN rad ✓ |

Verifiering: `sudo nginx -t` GRÖN före reload; `systemctl reload nginx`
(graceful) 16:43:16Z; prod 200 ×3 (// /kurser /blogg) + https-kontroll 200;
pm2 ak1a online. Rådata FÖRE+EFTER (tidsstämplade, curl -sI radvis):
`o70-cache-headers-fore-efter-2026-09-18.json`. Rollbackpunkt:
`/etc/nginx/sites-available/ak1a.bak-o70-20260918-164x` (sudo cp + reload
< 10 s om behov). Repo-spegeln `data/backups/server-nginx-ak1a.conf` färskad.

**Mätinstrument-motivering (ärlig):** Lighthouse körs INTE som facit denna
rond — kallstartens LCP/TBT är per konstruktion blinda för svars-cachefält
(o66 §4-precedensen dokumenterade dessutom att deploy-fönstrets EFTER-mätning
kontamineras av syskon-barn); curl-grinden mäter EXAKT det objektet ändrar
(radantal + innehåll per resurs) deterministiskt. Spårets aktuella
Lighthouse-tabeller bärs av o66 §2 (P53/P57/P56 samma dag, samma bygge).

## §5 Rest

- sok-index.json + speglar-slugar.json + llms.txt flyttas till Next-headers()
  i en framtida rond: reglerna committas FIRST (prod-synk bygger), nginx-rader
  tas bort först EFTER deploy — annars max-age=0-fönster mellan. Vid det laget
  kan även llms.txt:s nginx-location (= /llms.txt) bort.
- OOM-kedjan (§0): prod-synkens byggen dödas av minnestaket när fabrikens
  3-barns-fönster + bygget overlappar — systemfråga, ej denna rondes yta;
  dokumenterad i DRIFTSBOKEN-notisen för drift-spåret.

## §6 Läxor

1. **Två lager med cache-direktiv på samma proxy = det undre vinner**: nginx
   `expires` UNDERTRYCKER den proxade Cache-Control-raden helt (ej bara
   "dubbelrad" som o66 trodde — Next-raden syntes ALDRIG). Diagnos-instrument:
   jämför en sökväg UTAN nginx-location (manifest.json var systemets
   kontrollgrupp) mot en MED — skillnaden bevisar mekanismen.
2. **Konfig-i-repo > konfig-på-server**: Next-headers() är git-versionerad
   och deployas med kodflödet; /etc/nginx kräver root + reload + manuell
   spegling (data/backups/server-nginx-ak1a.conf). Så länge båda lagren lever
   ska EN ägare utses per sökväg — annars död konfiguration.
3. **pm2.backoff**: efter boot-loop ( fel :er "no production build") går pm2
   in i `errored` och SJÄLVLÄKNAR aldrig ens när BUILD_ID återkommer —
   återställning kräver prod-synkens explicita restart. Vänta på deployägaren,
   racea aldrig artefaktgrinden.
