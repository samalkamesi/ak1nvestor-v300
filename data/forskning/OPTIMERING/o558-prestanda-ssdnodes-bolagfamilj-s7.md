# o558 — MIGRERINGENS PRESTANDA-EFTER, DEL 2: /BOLAG-FAMILJEN + TRANSPORTLAGRET PÅ SSD NODES (s7-u3)

Datum: 2026-09-28 · Fabriksagent s7-u3 (manifest auto-s7-1790617526300, byggare 3/3)
Anspråk: data/vakten/auto-s7-1790617526300-s7-u3-ansprak.md (disk-först, före all mätning)
Nummer: o558 i protokollnummer.json (under flock; u1:o556 struktur-kvitto, u2:o557 rapportfamiljen — båda lästa FÖRE val, helt disjunkta ytor)

## §0 — VAL OCH DISJUNKTION

Spårets klassiska ytor stängda sedan länge (bildoptimering o66 §7.2/o101 ·
cache-headers o10/o13/o66/o70 · koddelning o27/o119/o121 · 52px o8+o123);
o159-EFTER kvitterat av o165 + rond 227. Det ÖPPNA objektet: **servermigreringen
Contabo → SSD Nodes (ca 25 sep) har ALDRIG prestandamätts** — alla baslinjer
(o139–o165) är Contabo-tal (8 kärnor); nya servern har **4 kärnor** (Xeon
Silver 4214 @ 2,2 GHz, 62 GB RAM), ny nginx, tomt npx/instrument-cache-läge.
Detta protokoll = del 2 (u1:o556 äger struktur-sidorna): **/bolag-familjen**
(o159:s tre sidor) + **transportlagret** (o66-curl-grinden ROND 4).

## §1 — LÄGE (fakta vid mätstart)

- Deployat/byggt träd på SSD Nodes: **22df62aa** (prod-synk.log; två yngre
  byggförsök avbröts i buntslagsrace 17:40/18:0x). CV-kur-commit 21e67000
  är förfader: `git merge-base --is-ancestor 21e67000 22df62aa` = SANT.
- Prod 200: https://lab.ak1nvestor.com/ = 200 · /bolag GET = 200 (loopback ×3).
- RAM: 54–56 GB tillgängligt ( fabriks-RAM-vakten aldrig trött).
- Under fönstret: prod-synkens deploy-bygge från fc545155 startade
  **18:27:28Z** ("BYGGER FRÅN: fc545155") och tre fabriksbarn (syskonen)
  arbetade — loadavg1 spikade 49.4 (1-min) vid 18:1x.

## §2 — KANALBEVIS: CV-KUREN LEVER I SSD-BYGGET (dom-bart)

CV-kuren (o159, commit 21e67000: `.cv-bolagsektion { content-visibility:auto;
contain-intrinsic-size:auto var(--cv-h, 87rem) }` + per-sektion `--cv-h`):
1. Serverad /bolag-HTML (loopback, bygge 22df62aa): `class="mt-10
   cv-bolagsektion"` på **10/10** tabellsektioner + **10** `--cv-h`-värden
   (118.5rem · 62.75rem · 157rem · …).
2. Deployad CSS-chunk 1y8-o7vbgoakh.css (samma chunknamn som Contaco-beviset
   i o165): regeln serveras ordagrant:
   `cv-bolagsektion{content-visibility:auto;contain-intrinsic-size:auto var(--cv-h,87rem)}`.
⇒ Migreringen tappade INGET av kuren — kanalbeviset (o165 §kanal) gäller
identiskt på SSD Nodes-bygget.

## §3 — CACHE-HEADER/KOMPRIMERINGS-GRIND ROND 4 (nya nginx-ytan) — GRÖN

o66:s curl-grind mot https://lab.ak1nvestor.com ( Contabo-förväntan i parentes):

| Yta | Uppmätt Cache-Control | Dom |
|---|---|---|
| /manifest.json | public, max-age=3600, stale-while-revalidate=86400 (samma) | GRÖN |
| /llms-full.txt | public, max-age=3600, stale-while-revalidate=86400 (sama) | GRÖN |
| /ak1a/favicon.svg | public, max-age=86400, stale-while-revalidate=604800 (sama) | GRÖN |
| /og/analys.png | public, max-age=604800, stale-while-revalidate=86400 (sama) | GRÖN |
| /_next/static/chunks/*.css | public, max-age=31536000, immutable | GRÖN |

- **o66 §6-drift-resten LÖST av migreringen**: Contabos nginx lade DUBBELA
  Cache-Control-rader ( eget expires-lager på /ak1a/+/og/) — nya nginx-ytan
  lägger INGET eget lager: EN rad per yta, proxy_hide_header-städningen som
  bokades som egen rond är onödig (avskriven).
- Komprimering (GET, Accept-Encoding: gzip/deflate/br): `Content-Encoding:
  gzip` på CSS-chunk OCH /bolag-HTML — **brotli saknas fortfarande**
  (o5-resten lever; drift-ops-yta, inte fabriksautonom).

## §4 — LIGHTHOUSE ×3: TVÅ KONTAMINERADE OMGÅNGAR + CLS 0 (ärligt bokförda)

Kanoniska verktyget (prestanda-lighthouse.mjs, loopback-BAS, mobil):
- Omgång 1 (18:11Z): alla Chrome-start misslyckades — **CHROME_PATH-fundet,
  se §5**; omgång med CHROME_PATH: /bolag ETIMEDOUT (180 s-tak, kall
  npx/Chrome); eqnr-ol P35 · LCP 10 739 · TBT 34 797 · CLS 0; nyckeltalsguide
  P34 · LCP 9 724 · TBT 26 439 · CLS 0. Loadavg vid fönstret: 1-min 2–10,
  5-min 9–20 (tre fabriksbarn + deployfönster).
- Omgång 2 (18:2xZ, load 2.11): /bolag P26 · LCP 14 889 · TBT 38 063 · CLS 0;
  syskonen ETIMEDOUT.
- **Domen: TBT/LCP/poäng OGILTIGA som kod-evidens** — kontaminerade av
  fabrikssyskonens CPU-arbete och (omgång 2:s slut) inflygande deploy-bygge
  (18:27:28Z, loadavg1 10.7 under webpack). Metrologiregeln o143 §3: TBT
  jämförs endast inom samma lastfönster. OGILTIGA filer bevarade:
  `o558-efter-OGILTIG-fabrikslast-sammanfattning.json` + råfiler.
- **CLS 0 × 3 sidor × 2 omgångar** — CLS är layout- (ej last-) bestämt:
  den heliga nivån (o100) håller på SSD Nodes-bygget. Dombart.

## §5 — INSTRUMENTFUND (HÖG, drift): CHROME_PATH-PÅ TVÅ NIVÅER

1. **Nya servern saknar /usr/bin/google-chrome.** chrome-launcher (npx
   lighthouse) kräver CHROME_PATH; funnen fungerande binär:
   `/home/ak1a/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome`
   (Chrome-for-Testing 154, rund 302:s källa).
2. **verktyg/prestanda-mat.mjs:169 HÅRDKODAR /usr/bin/google-chrome** — dött
   instrument på SSD Nodes (bokas: CHROME_PATH-stöd som o558-mönstret).
3. **NATT-TBT-CRONEN (03:27) HOTAS**: dess kedja når också Chrome — utan
   CHROME_PATH i cron-miljön dör nattens TBT-domar (TBT-slutdomens ägare,
   o158 §6). Kur (drift-ops, crontab-ytan är root-förbehåll r290): export
   CHROME_PATH=<puppeteer-chrome> i cron-raden ELLER systemövergripande
   lösning. Om nattens spår uteblir 29/9: detta är rotens kandidat NR 1
   (jämte G2-fönstret i r297:s glappkatalog).
4. Metrologiregel (ny, bokförd): **Contaco↔SSD Nodes-TBT är EJ jämförbara**
   (8→4 kärnor, ~2x frekvensklass): alla TBT-tal efter 25 sep startar NY
   baslinje-serie; natt-cronens cpuKalibMs-referens (o155) måste
   re-etableras på nya servern.

## §6 — EFTERVAKT (o165-mönstret): STÅENDE INSTRUMENT TILL RENT FÖNSTER

`verktyg/_s7u3o558-eftervakt.mjs` (startad 18:32Z, pid verifierad, O_EXCL-
single-instans, tak 4 h): väntar DEPLOYAD efter fc545155-bygget + loadavg1
< 2.5 två poller i rad → prod 200 → skroll-CLS-sond (nya bestående
`verktyg/prestanda-skroll-cls.mjs`, CDP 390x844, stegskroll, summa < 0.01)
→ Lighthouse ×3 (`o558-efter-ren`) med CHROME_PATH → dom-JSON
`lighthouse/o558-eftervakt-dom.json` (struktur dom-bar: CLS 0 ×3 + skroll
GRÖN + prod 200; TBT laststämplad referens). Nästa rond: läs dom-filen,
boka i §7 + worklog, committa mätfilerna, städa vakten.

## §7 — KVD

src/ orörd (INGET bygge) · data/blogg/ orörd · R2 orörd · kanoniska
instrument oändrade (nya filer: prestanda-skroll-cls.mjs bestående sond +
engångsvakt) · syskonytor orörda (u1:s o556-LH-filer, u2:s o557-ytor) ·
OGILTIGA mätfiler märkta och bevarade · prod 200 ×5 under vågen ·
engångsfil _s7u3o557-reservera.mjs städas efter commit.
