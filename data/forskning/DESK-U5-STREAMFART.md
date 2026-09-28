# DESK-U5 — Strömkedjans fartreglage, rankade (2026-09-28)

**Uppdrag:** Kunden rapporterar "super segt". Kartlägga SAMTLIGA snabbhetsreglag
i kedjan Xvnc → websockify → noVNC, rankade efter förväntad vinst, med varje
påstående belagt ur källorna PÅ BURKEN (help-texter + källkod + processläge).
Protokolluppdrag: endast läsning + help-kommandon + passiva mätningar — inget
har ändrats.

## 1. Kedjan just nu (fakta ur ps + systemd + filer)

| Länk | Version/start | Källa |
|---|---|---|
| Xvnc :10 | TigerVNC **1.15.0** (byggd 2025-12-28), `-geometry 1024x576 -depth 24 -localhost -SecurityTypes None`, User=ak1a | `ps aux` 2026-09-28; `/etc/systemd/system/zdesk-xvnc.service` ExecStart |
| websockify | python3, `--web /home/ak1a/desk-web --heartbeat 30 6080 localhost:5910`, körs som **root** | `ps aux`; `/etc/systemd/system/zdesk-novnc.service` |
| noVNC-klient | **1.6.0**, defaults: **quality 6**, compression 2, resize "scale", reconnect true | `/home/ak1a/desk-web/package.json` (version 1.6.0); `defaults.json`; `core/rfb.js:308-309`; `app/ui.js:183-184` |

**Korrigering av kontexten:** uppdragsbeskrivningen sa "quality 3" — källorna
ger **quality 6** (`defaults.json:3`, `ui.js:183`, `rfb.js:308`,
`vnc.html:262` value=6). 6 av 9 är en hög JPEG-kvalitet, dvs nära taket på
bildmängden Tight-JPEG skickar. Detta är det enskilt viktigaste fyndet.

**Inställningshierarkin i klienten** (`app/ui.js` initSetting + `app/webutil.js`):
URL-query/hashfragment → cookie/localStorage → `defaults.json`. Query vinner
ALLTID (`ui.js` initSetting: "Check Query string followed by cookie";
`webutil.js:59-67` getConfigVar "Fragment takes precedence"). Det betyder:
per-enhet-lösningar (telefonen annorlunda än datorn) går utan filändring —
bara bokmärket skiljer.

## 2. Hur data faktiskt flyter (ur noVNC-källan)

- Klienten förhandlar encodings i preferensordning vid anslutning:
  CopyRect → [H264 om WebCodecs] → **Tight** → TightPNG → ZRLE → JPEG →
  Hextile → RRE → Zlib → Raw (`core/rfb.js:2232-2273`). Tight är alltså
  huvudväg när servern stöder den.
- Kvalitet/compression skickas som **pseudo-encodings** till servern:
  `pseudoEncodingQualityLevel0 + _qualityLevel` och
  `pseudoEncodingCompressLevel0 + _compressionLevel` (`rfb.js:2253-2254`;
  numren i `core/encodings.js:21-22,34-35`). Detta är protokollets ENDA
  fjärrkontroll över JPEG-bitrate — servern komprimerar efter klientens värde.
- Giltiga intervall: quality 0-9, compression 0-9, heltal (`rfb.js:383-413`
  kastar "must be an integer between 0 and 9").
- Tight-rektanglar av typ JPEG är "hela JPEG-bilder" som ritas direkt
  (`core/decoders/tight.js:44-91`, filter-växel; `decoders/jpeg.js` "A rect
  of JPEG encodings is simply a JPEG file"). Högre quality ⇒ större JPEG-data
  (mekanismen är källbelagd; exakta bytes per steg står INTE i burkens
  källor — det mäts bäst med `--traffic`, se reglage 6).
- **Continuous updates är redan på**: klienten aktiverar automatiskt när
  servern svarar EndOfContinuousUpdates (`rfb.js:2597-2606` "Enabling
  continuous updates"; pseudo skickas `rfb.js:2263`) — eliminerar
  round-trips per frame. Noll åtgärd behövs; bra att veta att det inte
  är flaskhalsen.
- Klientens interna buffertar är fasta, inga användarreglage:
  receive queue 4 MiB (max växt 40 MiB), send queue 10 KiB
  (`core/websock.js:20,54-63` "high-performance buffering wrapper").

## 3. Serverns reglage (Xvnc -help, TigerVNC 1.15.0 — hela listan A-Ö genomläst)

Relevanta parametrar ur help-texten, med dess egna ord:

- **FrameRate** — "The maximum number of updates per second sent to each
  client (default=60)".
- **CompareFB** — "Perform pixel comparison on framebuffer to reduce
  unnecessary updates (0: never, 1: always, 2: auto) (default=2)".
- **ImprovedHextile** — "Use improved compression algorithm for Hextile
  encoding which achieves better compression ratios by the cost of using
  more CPU time (default=on)".
- **ZlibLevel** — "[DEPRECATED] Zlib compression level (default=-1)" —
  dvs serverns zlib-nivå styrs numera av KLENTENS pseudo-encoding, inte här.
- **AcceptSetDesktopSize** — "(default=on)" — krav för remote resize.
- `-geometry WxH` / `-depth D` / `-pixelformat fmt (rgbNNN or bgrNNN)`.
- `-dumbSched` "Disable smart scheduling and threaded input, enable old
  behavior" / `-schedInterval int` "Set scheduler interval in msec".
- `-fakescreenfps #` "fake screen default fps (1-600)".

**SAKNAS i denna version** (ärlighet — kontexten förväntade sig dem):
`-MaxProcessorUsage` och `-rfbwait` finns INTE i TigerVNC 1.15.0:s
parameterlista (det är TurboVNC/TightVNC-flaggor). Det finns heller ingen
serverflagga för encoding-lista — encodings väljs av klientens bud.

## 4. websockifys reglage (--help på burken; ingen --version-flagg finns)

Prestandarelevanta rader i help-texten: `--traffic` ("per frame traffic"),
`--record=FILE`, `--log-file=FILE`, `--heartbeat=INTERVAL` ("send a ping to
the client every INTERVAL seconds"), `--libserver` ("use Python library
SocketServer engine"), `--wrap-mode`. **Inga buffer-flaggor och inget
--prefer-python finns i denna version.** Help-texten ger INGEN prestandaskillnad
mellan motorerna — därför avskrivs --libserver som fartreglage (kan inte
motiveras ur källan; `ps` visar redan multiprocessing/forkserver-barn).

Tilläggsfynd: webbservern i websockify bygger på
`http.server.SimpleHTTPRequestHandler` (`/usr/lib/python3/dist-packages/
websockify/websockifyserver.py:17,44`) och grep på `gzip|deflate|Content-
Encoding` över samtliga websockify-*.py ger **noll träffar** ⇒ klientassets
levereras OKOMPRIMERADE. Total rå storlek: core+app 299 228 byte + vendor/pako
220 K + vnc.html 19 262 + styles ~41 539 ≈ **580 KB per första laddning**.
Påverkar laddningstiden, inte löpande ström.

## 5. RANKADE REGLAGE — 9 st (hög 3, medel 3, låg 3) + 5 avskrivna/fällor

### HÖG VÄNTAD VINST

**1. Klientens JPEG-kvalitet 6 → 2-3** — *vinst: HÖG* · *risk: låg*
- Källa/motivering: quality skickas som pseudo-encoding som styr serverns
  JPEG-komprimering (`rfb.js:2253`); Tight-JPEG-rects är hela JPEG-filer
  (`decoders/tight.js:85-91`) — kvalitetssiffran är protokollets enda
  bitrate-brytare. 6/9 är nära max. Exakt byte-vinst per steg kan inte
  motiveras ur burkens källor → mät med reglage 6. Risk: suddigare
  foto-/gradient-ytor; text går inte via JPEG-filtervägen utan Tight:s
  övriga filter (`decoders/tight.js:44-137` filterswitch).
- Exakt ändring (ak1a-ytan — `/home/ak1a/desk-web` är medvetet ak1a-ägd:
  zdesk-novnc.service-kommentar "web-rot = ak1a-ägd kopia (agentfabriken
  får ändra/förbättra UI-filerna utan root)"): `defaults.json` rad 3
  `"quality": 6` → `2`. Alternativ utan filändring: bokmärke med
  `?quality=2` (query vinner, ui.js initSetting + webutil.js getConfigVar)
  eller reglaget i panelen (vnc.html:261-262 slider 0-9; sparas i
  localStorage via writeSetting).

**2. Telefonen: resize "scale" → "remote"** — *vinst: HÖG på mobil* · *risk: medel*
- Källa/motivering: "remote" sätter `rfb.resizeSession` (`ui.js:1103`),
  klienten skickar SetDesktopSize med **fönstrets** storlek (`rfb.js:795-830`,
  rate-limiter 100 ms inbyggd), servern accepterar (Xvnc-help
  AcceptSetDesktopSize default=on). Färre pixlar i framebuffer = mindre data
  per rektangel — principen är redan bevisad i huset: zdesk-xvnc-kommentaren
  "1024x576 = 44 % av 1280x720s pixlar => klart snabbare ström". Telefonportrait
  ≈ 390 px bred ⇒ ytterligare ~2,6× färre pixlar än 1024. "scale" däremot
  dekodar fortfarande 1024x576 och skalar bara visuellt (`ui.js:1102` →
  `display.js:432-456` autoscale/_rescale är ren visuell skalning).
- Risk: skrivbordets WM-layout flyttas när framebuffer ändras; därför bäst
  per-enhet: bokmärke `?resize=remote` på telefonen, defaults.json orörd för
  datorn.
- Ägare: ak1a-ytan (defaults.json) eller kundens bokmärke — noll kod.

**3. Servern: FrameRate 60 → 30** — *vinst: HÖG-MEDEL vid rörelse* · *risk: låg*
- Källa/motivering: Xvnc-help "maximum number of updates per second sent to
  each client (default=60)". Taket halveras ⇒ mindre CPU-puls och mindre
  datatopp vid scroll/rörelser. Med 12 kärnor är CPU knappast flaskhalsen —
  vinsten ligger främst i bandbreddens toppar.
- Exakt ändring (root-rond — /etc/systemd): i
  `/etc/systemd/system/zdesk-xvnc.service` ExecStart lägg till
  `-FrameRate=30`, sedan `systemctl daemon-reload && systemctl restart
  zdesk-xvnc` (root). Risk: marginellt mindre mjukhet i rörelser.

### MEDEL VÄNTAD VINST

**4. Klientens compression 2 → 5-7 (test)** — *vinst: MEDEL (osäker)* · *risk: låg*
- Källa/motivering: compress-nivån går som pseudo-encoding (`rfb.js:2254`);
  serverns ZlibLevel är DEPRECATED och följer klienten (Xvnc-help). Högre
  nivå = mer server-CPU (finns gott om: 12 kärnor) mot färre bytes på
  länken — MEN mer dekomprimerings-CPU i telefonens pako
  (`vendor/pako`, används av `core/inflator.js`). Netto-vinsten är
  omdömesfråga som INTE kan avgöras ur källorna → mät. OBS: med JPEG-vägen
  aktiv berör zlib främst text/solid-ytor.
- Ändring: `defaults.json:6` `"compression": 2` → test 5, eller `?compression=5`.
  Ägare: ak1a-ytan/kundens URL.

**5. Första-laddningen: gzip + cache-header framför :6080** — *vinst: MEDEL (endast laddningsfas)*
- Källa/motivering: ~580 KB råa assets (wc -c, se §4); websockify-servern
  har noll gzip-stöd (websockifyserver.py:17,44 + grep 0 träffar) och inga
  Cache-Control-rubriker (SimpleHTTPRequestHandler). Löpande ström påverkas
  ej — efter första laddningen cachelagrar browsern (Last-Modified finns i
  SimpleHTTPRequestHandler-basen).
- Förslag (root-rond): nginx-plats som proxyar :6080 med `gzip on` +
  `Cache-Control` + wss→ws-upgrade — ger också krypterad wss till telefonen.
  Inga nginx-referenser till 6080/desk finns idag (grep i sites-enabled = 0
  träffar), telefonen går rakt på porten. AK1A-ytans alternativ (minifera
  ES-moduler) är möjligt men rör leveranskedjan — lägre prio.

**6. Mätbarhet på: --log-file + --traffic** — *vinst: MEDEL (krävs för att ranka vidare)*
- Källa/motivering: help-textens egna rader "--traffic per frame traffic",
  "--log-file=FILE". Idag: journalctl -u zdesk-novnc ger "No entries" för
  ak1a (behörighet adm/systemd-journal) och websockify startar utan loggfil
  — det FINNS ingen mätdata att lära av. Utan den är alla vinstsiffror
  kvalificerade gissningar.
- Förslag (root-rond): zdesk-novnc.service ExecStart +=
  `--log-file=/var/log/zdesk-websockify.log`; vid mättilfälle tillfälligt
  `--traffic`. Passiv avläsning därefter.

### LÅG VÄNTAD VINST (dokumenterade, avvakta)

**7. CompareFB 2 → 1** — help: "Perform pixel comparison on framebuffer to
reduce unnecessary updates (0/1/2 auto, default=2)". Auto-läget är redan
jämförelsevänligt; help-texten specificerar INTE vad auto gör — vinsten av
tvingat "always" kan inte motiveras ur källan. Root-rond om det testas:
`-CompareFB=1` i zdesk-xvnc.service.

**8. -schedInterval (smart scheduling-tuning)** — help ger bara "Set
scheduler interval in msec"; ingen koppling till genomströmning i texten.
TigerVNC:s smart scheduling är CPU-begränsare — med 12 kärnor och
förmodad nätverksflaskhals är vinsten inte motiverbar. Avvakta.

**9. websockify --libserver** — help: "use Python library SocketServer
engine", noll prestandaanspråk i texten; `ps` visar redan
multiprocessing-forkserver-barn. Ingen motiverbar vinst — skulle bara byta
motor utan bevis. Avvakta tills reglage 6 finns och visar websockify-CPU
som flaskhals.

### AVSKRIVNA / FÄLLOR (viktigt för nästa våg)

- **FÄLLA — minska inte depth till 16/rgb565!** `rfb.js:2237-2249`: Tight,
  TightPNG, ZRLE, JPEG, Hextile, RRE och Zlib skickas ENDAST "if
  (this._fbDepth == 24)" — vid annat djup förhandlar klienten bara
  CopyRect+Raw (rfb.js:2236,2250). Det naturliga "halvera pixeldjupet"-
  förslaget skulle alltså slå av ALL komprimering och göra det VÄSENTLIGT
  segare. Depth 24 ska ligga kvar.
- **TurboVNC-flaggorna finns inte**: -MaxProcessorUsage och -rfbwait saknas
  i TigerVNC 1.15.0:s paramlista (help A-Ö genomläst) — kontextens
  förmodade reglage är inte på burken. Ingen åtgärd möjlig.
- **heartbeat 30**: help "send a ping to the client every INTERVAL seconds"
  — keepalive, ingen fartpåverkan. Behåll som det är (styr tyst
  auto-återanslutning, se v200-u1).
- **ImprovedHextile**: gäller Hextile-encoding (help-texten ovan), men
  noVNC:s preferensordning sätter Tight före Hextile (rfb.js:2242-2246)
  ⇒ Hextile används i praktiken inte. Ingen åtgärd.
- **H264-vägen**: klienten bjuder H264 om WebCodecs finns (rfb.js:2239-2241)
  men Xvnc-help tiger om H264 och doc-paketet (tigervnc-standalone-server)
  innehåller bara changelog/copyright — serverstödet kan varken beläggas
  eller styras från burkens källor. Ej ett reglage idag.

## 6. Sammanfattande diagnos

Kedjan är i grunden sund: Tight-förhandling + continuous updates + rätt
dimensionerad framebuffer (1024x576, redan optimerad i DESK D2). Den
uppenbara huvudmisstänkta för "super segt" på telefonen är **quality 6**
(hög JPEG-bitrate) i kombination med att telefonen dekodar och överför
hela 1024x576 trots liten skärm ("scale" skalar bara visuellt). Snabbaste
provordningen, minst risk först: (1) bokmärke `?quality=2&resize=remote`
på telefonen — noll ändringar, omedelbar A/B; (2) defaults.json-quality
om A/B vinner; (3) root-rond för FrameRate + loggning enligt ovan.

RESULTAT: 9 reglagen rankade (hög:3 medel:3 låg:3) + 5 avskrivna/fällor — samtliga påståenden källhänvisade till Xvnc -help (TigerVNC 1.15.0), websockify --help + dist-packages-källa, och noVNC 1.6.0-koden i /home/ak1a/desk-web (fil:rad angiven).
