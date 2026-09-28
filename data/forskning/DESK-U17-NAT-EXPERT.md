# DESK-U17 — Expertgranskning LAGER 2: nät/klient (ström- och webblagret)

**Fabrikuppdrag:** v205-u2 (GRANSKARE — befintligt material mot källor, juridik 2007:528
och kvalitet; rapport + diff-förslag som förslag, andras filer orörda) ·
**Datum:** 2026-09-28 ~23:25–23:45 UTC · **Ägarskap hållet:** ENDAST detta protokoll.

Granskningsytor: `/home/ak1a/desk-web` (noVNC 1.6.0-fork, package.json), dess
`defaults.json` + `mandatory.json` + `vnc.html` + `app/ui.js`, nginx
`/desk/`-blocket, websockify-läget, samt hela latenskedjan telefon → TLS →
nginx → websockify → Xvnc. Passiva mätningar endast (diff, curl, ss, ps, stat,
sha256); inga filer ändrade, ingen process påverkad.

---

## 1. Kopia-integritet: desk-web mot paketoriginal — HEL kärna, BEVISAD

`diff -r /usr/share/novnc /home/ak1a/desk-web` (M1, fullständig utdata läst)
lämnar exakt **fem** skillnadsposter; allt annat är tyst = byte-identiskt:

| Skiljepost | Typ | Dom |
|---|---|---|
| `app/ui.js` | ändrad (AK1A-tillägg U3/U8/U2B) | avsiktlig, granskas §3 |
| `defaults.json` | ändrad (5 nycklar) | avsiktlig, granskas §2 |
| `hjalp.html` | NY fil (finns ej i paketet) | avsiktlig (v202-u2), granskas §2/§7 |
| `vnc.html` | ändrad (svenska + 3 knappar + tipsrad) | avsiktlig, granskas §2 |
| `vnc_auto.html` | symlink → vnc.html (M1: ls) | följer vnc.htmls innehåll |

**Kärnintegritet:** `core/`, `vendor/`, `include/`, `utils/`, `package.json`,
`mandatory.json` (båda `{}`, 3 byte) och `vnc_lite.html` nämns INTE av diffen ⇒
**HELA mot paketoriginalet**. Uppdragets krav "core/vendor FÅR EJ skilja —
bevisa" är därmed exporterat: de skiljer inte en byte. Alla kodbeteenden i
§3–§6 (rfb.js, display.js, element.js, decoders/) är alltså uppströms noVNC
1.6.0-sanning, inte våra.

## 2. Konfig- och HTML-ytorna rad för rad

### 2.1 defaults.json (109 byte, mtime 22:01:25 — M2)

Paketoriginal: `{}`. Våra fem nycklar mot noVNC:s initiering (ui.js:194–203,
M3):

| Nyckel | Värde | initSetting-rad | Dom |
|---|---|---|---|
| `resize` | `"remote"` | ui.js:195 (`'resize','off'`) | **LEVANDE** — remote-kontraktets bärare (U13V2 §1.1) |
| `quality` | `3` | ui.js:196 (`'quality',6`) | **LEVANDE** — JPEG-kvalitet 0–9, sänkt 6→3 av v202-u3 |
| `show_dot` | `true` | ui.js:200 (`'show_dot',false`) | **LEVANDE** — synlig pekprick på pekskärm |
| `reconnect` | `true` | ui.js:203 (`'reconnect',false`) | **LEVANDE** — slår på U3:s tysta återanslutning |
| `compress` | `2` | saknas — initSetting heter **`'compression'`** (ui.js:197) | **DÖD NYCKEL** — se fynd B2 |

Inställningsordningen (källbevisad M3+M4: ui.js:771–789 `initSetting`,
webutil.js:61–70 `getConfigVar`, webutil.js:153–171 `readSetting`):
**mandatory.json → hash/query → localStorage → defaults.json → hårdkodat.**
Query vinner ALLTID över defaults.json — det är mekanismen bakom fynd A1.

### 2.2 vnc.html — samtliga avsiktliga avvikelser (M1, diff i fulltext)

1. `lang="en"` → `lang="sv"` (rad 2): styr noVNC:s ordboksval till svenska —
   korrekt för kunden, och förutsättning för att U3:s språkval inte skall
   blanda (se §3.1).
2. `<title>noVNC</title>` → `AK1A — Skrivbord` (rad 16; U2 F14-kur).
3. Tre knappar i kontrollpanelens extrasektion (rad 159–211):
   Ctrl+0-knappen (U2B), vy-zoom +/− (U8) — svenska etiketter, SVG-ikoner,
   tryckytor 44+ px, aria-hidden på dekoration. Syften dokumenterade i
   respektive protokoll; logikgranskning i §3.
4. Svensk tipsrad i connect-dialogen (rad 398, `translate="no"`): U2 F11-kuren
   (porträtt-vägledning; DESK-U2:102–113, U2C:59). Korrekt och medvetet
   svensk (lokaliseraren skall EJ översätta vår text — u4:s i18n-princip).
5. `vnc_auto.html` är symlink till vnc.html — paketets auto-variant följer
   därmed samma svenska yta. Medvetet (M1).

### 2.3 hjalp.html (NY fil i desk-web, 7491 byte, mtime 20:43:53 — M2)

Skapad av v202-u2 som "serverande kopia" med byte-identisk tvilling i
`/var/www/desk/hjalp.html` (logg M5: båda sha `1df68231048f2c9a…` vid
leverans). **Idag divergerade:** desk-web-kopian har fortfarande
leveranshashen `1df68231048f2c9a…` (M6), medan `/var/www`-kopian (7492 byte,
mtime 22:22:06, hash `fbb5459250178857…`) rättats till `resize=remote`.
Skillnaden är exakt en rad (M7: diff rad 137: `resize=scale` vs
`resize=remote`). **Den som serveras är desk-web-kopian** — bevis M8:
`curl http://127.0.0.1:6080/hjalp.html` → `resize=scale`. Rotanalys i fynd
A1/B1.

## 3. app/ui.js — logikgranskning av alla AK1A-ändringar

### 3.1 U3 tyst auto-återanslutning (ui.js diff-poster vid ~1135–1265)

- Räknare `reconnectAttempts` nollställs vid användarinitierad connect och
  avbruten väntan (ui.js:1135–1138, 1161–1164) — avbrottstypen skiljs från
  nätverksdöd via noVNC:s `inhibitReconnect` vid egen Koppla-från. **Korrekt.**
- Första försöket efter 2 s, därefter `reconnect_delay` (default 5000 ms —
  nyckeln saknas i defaults.json, hårdkodat gäller; M3). Oändligt antal försök;
  varje miss landar i disconnect-eventet igen. **Korrekt**, och hjälpsidans
  "det försöker så länge det behövs" (hjalp:123) överensstämmer.
- Statusraden `"(försök N)"` väljer ordet efter webbläsarens språk
  (isSwedishLang, ui.js:1171+), basen lokaliseras av ordboken — aldrig
  blandspråk i samma rad. Koherent med `lang="sv"` (§2.2.1). **Korrekt.**
- Lyckad återkomst: "Uppkopplad igen" i 5 s (första connect behåller
  källans 1,5 s-rad). Mänskligt rätt. **Korrekt.**
- `defaults.json "reconnect": true` gör loopen till default för alla
  inträden — inklusive hjälp-knappens (query:n där saknar reconnect-param,
  påverkar ej).

### 3.2 U8 vy-zoom — klick-matematiken är KÄLLBEVISAD korrekt (u202:s bevis verifierat)

U202 (v202-u1-loggen, M9) valde bort yttre skalning med invarianten
"canvasens synliga bredd måste vara `display.scale × vp.w`". Jag har
återvänt invarianten i källan, rad för rad (M10):

1. `clientToElement` (core/util/element.js:13–36): klick → CSS-pixlar relativt
   canvasens `getBoundingClientRect()` — okänslig för innehållets skalning.
2. `Display.absX/absY` (core/display.js:175–186): `x / this._scale +
   viewportLoc` — ALL skalning som skall gälla MÅSTE sitta i
   `display._scale`.
3. `_rescale` (core/display.js:456–473): sätter `style.width =
   factor × vp.w + 'px'` — exakt ekvationen ovan. Yttre skalning
   (`body.style.zoom`/`transform:scale`) bryter den: bounds.width blir
   `scale × yttre × vp.w` medan absX bara dividerar med `scale` ⇒ tryck
   landar zoomfaktorn snett. **u202:s bevis håller i källan.**
4. Vår mekanism (`applyViewZoom`, ui.js:1844–1862): `scaleViewport=false`
   (stoppar fit-autoskalen) → `clipViewport=true` (rfb.js:344–346 setter →
   `_updateClip` → `viewportChangeSize`) → `_display.scale = viewZoom`
   (display.js:69–70 settern kör `_rescale`) → `updateViewDrag()`.
   Ordningen är korrekt och varje steg är noVNC:s egen primitiv.
5. **Överlever fönsterändring:** `viewportChangeSize` (display.js:165–172)
   anropar `this._rescale(this._scale)` — nuvarande zoomfaktor återanvänds.
   U8-kommentaren (ui.js:1810+) bevisad sann. Samma väg skyddar vid F11/
   fullscreen (containerns storlek ändras → _updateClip → bevarad zoom).
6. `loadViewZoom` snap-till-nearest-step + try/catch kring localStorage
   (ui.js:1817–1838): förorenade värden kan aldrig återuppstå som friktion.
   **Korrekt.**

**Kvarvarande avvikerisk — endast en, och den kräver fynd A1 för att uppstå**
(fynd C2): om klienten kommit in i `resize=scale` (t.ex. via hjälp-knappens
query, A1) och därefter vy-zoomar: nästa `updateViewClip`/`applyResizeMode`
(ui.js:1429–1479) återinsätter scale-fit och stänger clipViewport — zoomen
visuellt borta medan `viewZoom`+localStorage lever kvar ("Vy: 130 %" vid nästa
tryck trots neutral vy). I driftläget remote (vårt default) är scaleViewport
redan false och clip redan true på mobil (brokenScrollbars-grenen, ui.js:1459+)
— vy-zoom och remote är FULLT kompatibla. **Slutsats: inget kodfel; A1:s
scale-query är den enda dörren in i desyn-läget.**

### 3.3 Ctrl+0-knappen — koherens bevisad mot gestmappningen

Nypning inne i bilden mappas av noVNC (core/rfb.js:1425–1446, M11) till
**Ctrl-ned + scrollknappar + Ctrl-upp inuti fjärrsessionen** — dvs det är
APPENS (Electron/Z-Code:s) text-zoom som nypningen rör, exakt som
hjälpsidans varningskort säger ("zoomar appens text, inte vyn", hjalp:131–133).
`sendCtrlZero` (ui.js:1793–1802) sänder samma tangentprimitiver som källans
`sendCtrlAltDel` (modifier down → key down/up → modifier up) och återställer
därmed.app-zoomen på ett tryck. Landningens rad (index.html:96) beskriver
den ÄLDRE vägen (tangentpanelens Ctrl + 0) — fungerar, men menyns dedikerade
knapp är den kur hjälpsidan lär ut; dokumentationspaket i fynd B4.

### 3.4 F11

F11 i desk-sammanhanget är U2:s fynd nr 11 (porträttlägets oläsliga ~30 %-skala,
DESK-U2:102–113) — kurerad via tipsraden (§2.2.4). Ingen AK1A-F11-kod finns i
ui.js/vnc.html (M12: grep tom); fullskärmsknappen i panelen är noVNC-egen
uppströmskod (orörd bevisad §1). Inget att rättätta.

## 4. nginx /desk/-blocket (sites-available/ak1a rad 19–29, M13)

- `location = /desk` → 302 /desk/ — kanonisk adress. **OK.**
- `location = /desk/` (rad 22–27): `auth_basic` + `.htdesk` + `root /var/www` +
  `try_files /desk/index.html =404` — landningen är auth-skyddad, serveras
  från /var/www. **OK.** (Endast exakta /desk/ hamnar här — resten av
  "hjälpfiler i /var/www" nås EJ härav; se A1/B1.)
- `location /desk/` (rad 29, allt annat inkl. vnc.html + websockify-tillgångar
  + hjalp.html): `auth_basic` + `.htdesk`; `proxy_pass http://127.0.0.1:6080/`
  (trailing slash korrekt); `proxy_http_version 1.1` + `Upgrade`/`Connection:
  "upgrade"` — WS-handskakning korrekt; `proxy_read/send_timeout 3600s` —
  med websockify `--heartbeat 30` (ping/pong var 30 s räknas som läsning)
  hålls WS vid liv obegränsat; vid nät-tystnad stängs efter 1 h och U3:s
  reconnect tar över. **Koherent helhet.**
- **Buffering:** `proxy_buffering` ej satt (default on) — efter 101-upgrade
  flödar frames rakt igenom (buffring gäller bara vanliga svar); statiska
  noVNC-filer från websockify buffras, vilket är snabbare. **Ingen
  latensåtgärd behövs.**
- `proxy_set_header Host` saknas i detta block (finns i /chat/, rad 15) —
  websockify bryr sig inte om Host (statisk webbrot + relay). Kosmetisk
  paritetsskillnad, fynd C3.
- **Säkerhet, port 6080:** websockify binder **0.0.0.0:6080** (M14: ss) och har
  INGEN egen auth; Xvnc kör `-SecurityTypes None -localhost` (M15: ps) ⇒ bakom
  websockify finns inget lösenord alls — nginx Basic är hela vaktmuren.
  Extern sond mot publik IP på 6080: **timeout/stängd** (M16: curl 000, 6 s;
  även 3000 stängd). Brandväggsreglerna är ej läsbara för fabriksagenten
  (ufw/iptables kräver root) — skyddet är alltså verkligt men OBEVISAT inom
  min behörighet, och en framtida öppning av 6080 vore full åtkomst utan
  lösenord. Fynd B3: bind websockify till 127.0.0.1:6080 i zdesk-novnc.service
  (root-ägd enhet; kärnlagrets U16 granskar samma tjänst).
- Landningens `title` har stavfelet "ZCode-**skiv**bordet" (index.html:7;
  rad 69 i samma fil stavar rätt) — B4.

## 5. websockify-läget vs alternativ (M15, M17)

Kört läge: `/usr/bin/python3 /usr/bin/websockify --web /home/ak1a/desk-web
--heartbeat 30 6080 localhost:5910`, root, Deb-paket 0.13.0+dfsg1
(python3-websockify), multiprocessing **forkserver** (ett barn per klient).

- **"C-accelererat?"** Paketet innehåller ENDAST .py-filer (M17: ls — ingen
  .so, ingen Cython-tillägg): relän är **ren Python 0.13**; något C-läge finns
  ej i Debian-paketet att slå på. Jämförphotometri saknas (ingen klient inne —
  U15 §0/§1), så byte till C/Go-brygga är ett MÄTNINGSVILLKORAT evolutionärt
  steg (§8.7), inget fynd.
- `--heartbeat 30`: WS-ping var 30 s — håller NAT/nginx vid liv (se §4);
  bandbreddskostnad försumbar. Finjustering (t.ex. 20 s för tuffare mobilnät)
  är root-reglage utan praktisk vinst idag.
- `--web`-roten ÄR vår fork: därav dubbleringen hjalp.html (B1) — websockify
  serverar ALLT under /desk/ utom själva landningssidan.

## 6. Latenskedjan — hop för hop (U15:s mätetal + egna verifieringar)

| Hop | Kostnad (belagt) | Reglage i mitt lager |
|---|---|---|
| Telefon → TLS/nginx | U15 M-C: median 0,112 s till auth-beslut varav TLS-påslag 0,057 s (från servern; RTT kund↔Contabo dominerar U15 §6) | TLS 1.2+1.3, session cache 10m/timeout 1440m ON, tickets off (M18: certbot-konf) ⇒ U3-reconnect får session resumption — redan optimalt |
| nginx → websockify | loopback, sub-ms; buffering irrelevant efter upgrade (§4) | inga ytterligare |
| websockify relay | ren Python forkserver, ~ms-klass per frame vid låg last (U15 §3: statisk leverans 0,27–0,92 s kall) | heartbeat; byte till binär brygga = §8.7 |
| Xvnc-kodning | quality 3/compress 2 (U15-dom: bandbredd INTE flaskhals) | `quality`/`compression` via defaults/query —活了 via §2.1 |
| **Klientens avkodning** | U15:s medfaktor. Källbevis M19: Tight-JPEG går `tight.js:91 → display.imageRect → new Image() + base64-data-URL` (display.js:364–380) — dekodningen är webbläsar-native, MEN per rektangel körs JS-base64-encodning (+33 % transient minne) innan Image-laddning | evolutionärt §8.5 (createImageBitmap-väg) |

Vy-zoom påverkar INTE bandbredd/avkodning (CSS-skalning av canvas, GPU-tungt
billig) — den är en läsbarhets- och träffsäkerhetsfunktion med intakt
klickmatematik (§3.2).

## 7. Fyndlista (A/B/C + bevis + rättning + ägare)

| # | Grad | Fynd | Bevis (källtripp §10) | Rättning | Ägare |
|---|---|---|---|---|---|
| A1 | **A** | **Live-hjälpen bryter remote-kontraktet:** den serverade kopian `desk-web/hjalp.html:137` bär `?resize=scale`; query vinner över defaults.json (§2.1-ordningen) ⇒ varje entré via "Öppna ZCode"-knappen på hjälpen ger scale-läge och kringgår U13V2:s verkställande — korrigeringskravet (U13V2 §1.2/§4.3) rättades 22:22 i `/var/www/desk/hjalp.html`, som nginx ALDRIG serverar (location = /desk/ → bara index.html; /desk/hjalp.html → proxy 6080 → desk-web-kopian) | M6+M7+M8 (hash/diff/curl) + M13 + M3/M4 | Ändra `resize=scale` → `resize=remote` (eller stryk parametern helt — knappen följer då framtida defaultbyten) i `/home/ak1a/desk-web/hjalp.html`; veriﬁera med M8-curl | Huvudsessionen (ak1a-ägd fil; D3-rätten) — SKA INTE ske i min tur, jag äger bara protokollet |
| B1 | B | Dubbelförvaring av hjalp.html med divergens (rot till A1): två kopior, en död (endast rättad) och en live (orörd sedan v202-u2:s leveranshash) | M5+M6+M7 | En filhem: antingen nginx `location = /desk/hjalp.html` från /var/www (strök då desk-web-kopian) eller behåll desk-web som enda hem och radera /var/www-kopian | Huvudsessionen (nginx-delen: root) |
| B2 | B | defaults.json-nyckeln `compress` är DÖD (initSetting heter `compression`, ui.js:197) — noll effekt idag men vilseledande: framtida reglage i "compress" gör ingenting | M3 + M2 | Döp om nyckeln till `"compression"` i defaults.json (värdet 2 kan ligga kvar — matchar hårdkodat) | Huvudsessionen |
| B3 | B | websockify 0.0.0.0:6080 utan egen auth; enda vakten mot Xvnc `-SecurityTypes None`; externt STÄNGD idag men brandvägg oberövbar/oläsbar för agent — skyddsnet skall inte hänga på ett externt filter | M14+M15+M16 | Bind `127.0.0.1:6080` i zdesk-novnc.service | Root-sessionen (enheten granskas samtidigt av U16) |
| B4 | B | Dokumentationspaket: (i) hjalp:91 "förinställd av oss" orörd i BÅDA kopiorna trots U13V2 §6.2; (ii) landningens Ctrl+0-väg (index:96) lär ut tangentpanels-vägen i stället för menyns knapp; (iii) stavfel "ZCode-skivbordet" i landningens title (index:7) | M7 (diff enbart rad 137) + M20 (index-läsning) | U13V2 §6.2:s förslagstext; peka rad 96 på knappen; rätta titeln | Huvudsessionen (ak1a-ägda filer) |
| C1 | C | `UI.rfb._display.scale` är privat-åtkomst (markerad `_`) i applyViewZoom — korrekt idag men den känsligaste raden vid en framtida noVNC-synk | M10 (display.js:69/456) | Dokumentera i U8:s protokoll vid nästa synk; frusen fork mildrar | Huvudsessionen |
| C2 | C | Vy-zoom × scale-läge kan desynkroniseras (zoom visuellt borta, tillståndet lever) — kräver A1:s scale-dörr för att uppstå; i remote-läge (default) fullt kompatibla | M3+M10 (updateViewClip/applyResizeMode-grenarna) | A1 rättar roten; ev. guard i viewZoomIn/out (avböj om resize-setting='scale') som framtidsförslag | Huvudsessionen |
| C3 | C | /desk/-WS-blocket saknar `proxy_set_header Host` (paritet med /chat/) — ingen funktionell skillnad (websockify bryr sig ej) | M13 | Kosmetisk komplettering vid nästa nginx-rond | Root-sessionen |
| C4 | C | JPEG-vägen base64-kodar varje rektangel i JS före native dekod — ingen fel, men det största identifierade avkodningsreglaget | M19 | Se evolutionärt steg 5 | (förslag) |

**Summa: 9 fynd (A:1 B:4 C:4).**

## 8. Evolutionära steg, rankade (kundvärde/kostnad)

1. **Rätta A1 (en rad i desk-web/hjalp.html)** — låser U13V2 hela kedjan;
   dessutom blir U13V2 §2.4:s acceptanstest meningsfullt (besök via knappen
   bevisar nu remote).
2. **mandatory.json `{"resize":"remote"}`** — strukturell låsning som gör ALLA
   framtida scale-querys/bokmärken harmlösa (mandatory vinner över query,
   ui.js:785–789). Trade-off: rullgardinen "Resize session" låses i panelen
   (forceSetting disablar kontrollen) — kundens eget läge försvinner; styrelse-
   beslut, ej fabrikens.
3. **En filhem för landning+hjälp** (B1) — eliminerar divergensklassen permanent.
4. **Instrumentering vid kundbesök** (U15 §7.1: /proc/net/dev + ss-fönster när
   5910 är uppkopplad; ev. noVNC Connection Stats-panel i forken) — ger ÄKTA
   aktiva siffror utan ny dispatch.
5. **createImageBitmap-väg i `display.imageRect`** (C4): Blob + async decode,
   undviker base64-omvägen — kodbrytande i frusen fork, vänta på steg 4:s
   mätetal som motivering.
6. **quality 3→6** när steg 4 visar att "långsam" = skärpa snarare än respon
   (U15 §7.2; marginal mot 5G är 4–20×).
7. **websockify → binär brygga ELLER 127.0.0.1-bindning** (B3 härdning kan ske
   direkt; brytbyte först om steg 4 visar relay-CPU som flaskhals) — root äger
   enheten.
8. **HTTP/2 på 443** för de statiska noVNC-tillgångarna — marginell vinst,
   root-ägt, sist.

## 9. Juridik (2007:528 m.fl.)

Ren infrastruktur- och granskningsprotokoll: inget finansiellt innehåll, inga
kundriktade råd, inga pris-/publiceringsytor (R2 orörd). Inställningarna persist-
as enbart i besökarens egna localStorage (webutil.js:142–171, U13V2 §7) —
granskningen sätter ingen kaka och samlar ingenting; GDPR art 13 oberörd.
Hjälpsidans "ej investeringsråd"-fot är intakt i båda kopiorna (M7 visar att
endast rad 137 skiljer).

## 10. Källförteckning (källtripp: källa → verifiering → leverans)

**Källor (lästa i fulltext/delmängd denna omgång):**
K1 diff -r /usr/share/novnc /home/ak1a/desk-web · K2 U13V2-PARITETSSYNTES.md ·
K3 U15-STROMFARTSMATNING.md · K4 U2-MOBILFELJAKT.md (F11-raderna) +
U2C-BCRATTNINGAR.md:59 · K5 v202-u2-leveranslogg (M5) · K6 desk-web-källorna:
ui.js:194–203/771–789/1135–1265/1429–1500/1793–1889, webutil.js:61–70/140–175,
core/rfb.js:343–346/748–758/1287–1450, core/display.js:62–79/150–186/364–380/
440–473, core/util/element.js:13–36, core/decoders/tight.js:54–91 ·
K7 /etc/nginx/sites-available/ak1a:19–29 + /etc/letsencrypt/options-ssl-nginx.conf.

**Verifieringar (passiva, körda 23:25–23:45 UTC):**
M1 diff -r (full utdata) · M2 stat ×6 (§2.3-kronologi) · M3 sed ui.js-initblock ·
M4 webutil-sed · M5 v202-u2-logg · M6 sha256sum (1df68231… desk-web / fbb54592…
/var/www) · M7 diff kopiorna (endast rad 137) · M8 curl 127.0.0.1:6080/hjalp.html
→ resize=scale; /defaults.json → remote · M9 v202-u1-logg (u202:s bevis + sha) ·
M10 display/element/rfb-sed (invariant-kedjan) · M11 rfb.js:1425–1446 (pinch) ·
M12 grep F11 (tom i desk-web) · M13 nginx fulltext · M14 ss -tlnp · M15 ps ·
M16 extern curl-sond 6080/3000 (000, timeout) · M17 ls websockify-paketet ·
M18 certbot-konf · M19 grep imageRect/JPEG-vägen · M20 index.html-läsning.

**Leverans:** detta protokoll + commit (hash i LEVERANS-raden nedan).

**Ärlighetsrad:** journal/websockify-loggar är behörighetslåsta för
fabriksagenten (U13V2 §2.1, U15 §0) — inga loggcitat förekommer; brandväggens
regler kunde ej läsas (M16 dokumenterar SOND-resultatet, inte reglerna);
påståenden om kundens framtida beteende är prognos endast där så markerat.

RESULTAT: 9 fynd (A:1 B:4 C:4 — tyngst: live-hjälpen bär resize=scale och
kringgår remote-kontraktet; rättningen landade i den döda /var/www-kopian) +
8 evolutionära steg rankade + kopia-integritet HEL (core/vendor/include/utils/
package/mandatory byte-identiska med paketoriginal — endast ui.js, defaults.json,
vnc.html+symlink och nya hjalp.html skiljer, alla avsiktliga och dokumenterade)
