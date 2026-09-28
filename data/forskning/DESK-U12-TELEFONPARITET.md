# DESK-U12 — Telefonparitet: alla arkitekturer för "ZCode-nativt" i telefonen

**Våg:** v203-u2 (agentfabrik, BYGGARE, Forskning B) · **Datum:** 2026-09-28
**Uppdrag:** kartlägga ur källorna på burken alla arkitekturer som kan ge
telefonen ZCode-nativ känsla (stort, läsbart, enkelt): (1) RANDR/remote-resize,
(2) dubbelt skrivbord med egen user-data-dir, (3) /chat-bryggan som komplement,
(4) rankning, (5) rekommendation huvudväg + reserv.
**Föräldradokument:** desk-kedjan — DESK-r311 (960x540-geometrin, telefonläsbar
skala), DESK-D3/r289 (ak1a-ägd webrot i desk-web), v202 (vy-zoom + hjälpsida),
DESK-U11-APPRESPONSIVITET (parallell rapport: appens egna responsiva krafter).
**Ägarskap detta uppdrag:** ENDAST denna rapport. Läs-ytor: systemd-filer,
nginx-konfig, desk-web-källan, processlistan, asar-strängar, hjälp-/man-sidor.
INGA /etc-ändringar, INGEN processpåverkan, INGET skrivande i ~/.zcode.

---

## 1. Nuläge — den levande kedjan (allt källbelagt)

Kedjan som telefonen möter idag, tjänste för tjänste (alla fyra
systemd-filer lästa i fulltext, orörda):

| Led | Tjänst | Innehåll | Källa |
|---|---|---|---|
| Skärm | `zdesk-xvnc.service` | `Xvnc :10 -geometry 960x540 -depth 24 -localhost -SecurityTypes None`; r311-kommentar: 960x540 = telefonens logiska bredd (~0,8x skala i liggande = läslig text) + 4x färre pixlar än full HD = snabbare ström | /etc/systemd/system/zdesk-xvnc.service |
| Fönster | `zdesk-wm.service` | `openbox` på DISPLAY=:10 | /etc/systemd/system/zdesk-wm.service |
| App | `zdesk-zcode.service` | AppImage `--no-sandbox --disable-gpu` + bakgrundspaket (r307: appen ska jobba även när fönstret överges); `desk-startzoom` (r308-309: robot-handen zoomar ett steg vid start); `Restart=always` | /etc/systemd/system/zdesk-zcode.service |
| Ström | `zdesk-novnc.service` | `websockify --web /home/ak1a/desk-web --heartbeat 30 6080 localhost:5910` (D3/r289: web-rot = ak1a-ägd kopia av noVNC) | /etc/systemd/system/zdesk-novnc.service |
| Väg in | nginx | `location /desk/` → proxy 127.0.0.1:6080 med basic auth (`.htdesk`); `location /chat/` → proxy 127.0.0.1:7681 | /etc/nginx/sites-enabled/ak1a:10,21-29 (läst) |

**Resize-läget idag:** `/home/ak1a/desk-web/defaults.json` = `{"resize":
"scale", "quality": 2, "show_dot": true, "reconnect": true, "compression": 2}`
— alltså **scale** (lokal skalning): serverns 960x540 skalas till telefonens
viewport i webbläsaren. Appens default är egentligen `off`
(app/ui.js:194 `UI.initSetting('resize', 'off')`) men defaults.json överridar.

**Pågående processer (passiv `ps`-mätning 2026-09-28):** Xvnc :10 (960x540,
RSS ~38 MB), openbox (~30 MB), ZCode-Electron-trädet ~**387 MB** (216+58+54+54
zcode-processer + crashpad 3 MB + startstub 2 MB), ttyd-chatbryggan ~1 MB,
fabriksagenter (node zcode -p) ~50 MB st. Server: 12 kärnor/60 GiB.

---

## 2. Arkitektur A — RANDR/remote-resize: telefonen ber om SIN upplösning

### 2.1 Stödjer Xvnc runtime-upplösningsändring? JA — bevisat på två vägar

1. **`Xvnc -help`** listar RANDR bland extensions som kan runtime aktiveras/
   avaktiveras ("Only the following extensions can be run-time enabled/
   disabled: … RANDR …").
2. **`DISPLAY=:10 xrandr --query`** (passiv fråga mot den levande displayn)
   svarar: `Screen 0: minimum 32 x 32, current 960 x 540, maximum 32768 x
   32768` + `VNC-0 connected 960x540+0+0` med fördefinierade moder
   960x540 (aktuell), 1920x1200, 1920x1080 … ner till 640x480. RANDR är
   alltså PÅ och svarar på den skärm kunden använder just nu.
3. **Paket:** tigervnc-standalone-server 1.15.0+dfsg-2build1, novnc
   1:1.6.0-2 (`dpkg -l`) — TigerVNC-generationen med ExtendedDesktopSize-stöd.

### 2.2 noVNC resize-lägen — "remote" gör telefonen till härskare över storleken

- **vnc.html:283-290** (desk-web-kopian): rullgardinen "Scaling mode" har
  exakt tre värden: `off` (None), `scale` (Local scaling), **`remote`
  (Remote resizing)**. Ingen "dynamic" i noVNC 1.6.0.
- **app/ui.js:1118-1119:** `UI.rfb.scaleViewport = getSetting('resize') ===
  'scale'; UI.rfb.resizeSession = getSetting('resize') === 'remote';` —
  samma klient-inställning slår om mellan lokal skalning och fjärrresize.
- **core/rfb.js:838-842** `_screenSize()`: hämtar `this._screen.
  getBoundingClientRect()` — dvs **klientens faktiska vy-storlek** (telefonens
  viewport, med eller utan webbläsarzoom).
- **core/rfb.js:819-829:** `RFB.messages.setDesktopSize(this._sock,
  Math.floor(size.w), Math.floor(size.h), this._screenID,
  this._screenFlags)` — klienten SKICKAR sin önskade pixelstorlek till
  servern. Rate-limit: en pågående resize i taget + minst 100 ms mellan
  försök (rfb.js:800-814).
- **core/rfb.js:2900-2908 + 2962-2968:** vid anslutningen annonserar servern
  ExtendedDesktopSize; första uppdateringen sätter `_supportsSetDesktopSize
  = true` och triggar direkt `_requestRemoteResize()` — **telefonen ber om
  sin upplösning automatiskt vid varje anslutning**, och igen vid
  rotation/fönsterändring (window-resize → applyResizeMode).

### 2.3 Kan displayen anpassa sig PER KLIENT? — ja i tid, nej samtidigt

RFB-protokollet är en session = en framebuffer. `setDesktopSize` ändrar
**serverns** display (den enda, "VNC-0") — den senaste klienten som ber vinner.
Två samtidiga klienter (datorn med stort fönster + telefonen med litet) skulle
dra adressbordet mellan varandra vid varje resize-event. Per-klient-rendering
finns INTE i protokollet; det är arkitektur B:s uppgift (se §3).

### 2.4 Konsekvenser för pågående session

- RANDR-resize är runtime — ingen omstart av Xvnc, openbox eller appen krävs
  (xrandr-query visar levande moder; -help bekräftar runtime-RANDR).
- Om servern AVBORJA den begärda storleken loggar klienten "Server did not
  accept the resize request" (rfb.js:2957-2959) och följer då serverns storlek
  istället — inbyggd reserv, inget kraschläge.
- App-fönstret har en lagrad egen storlek (`desktopWindowSize` finns i
  ~/.zcode/v2/setting.json, nyckel-listad) — vid skärmbytes-storlek får
  fönstret ConfigureNotify och openbox fäller om; exakt beteende vid krymp
  till t.ex. 405x720 är **ej live-verifierat** (processpåverkan förbjuden i
  detta uppdrag) och ska provas i en demonstration innan kunden får läget.
- Telefonens exakta viewport (t.ex. 390x844 porträtt, 844x390 liggande) skickas
  som exakta pixlar — xrandr-listan har inga fördefinierade porträttmoder, och
  huruvida TigerVNC accepterar godtycklig geometri dynamiskt är inte
  live-verifierat här; protokollvägen (setDesktopSize + avboj-reserv) är dock
  belagd rad för rad i rfb.js.

### 2.5 Kostnad/komplexitet

- **Noll nya processer, noll extra RAM.** Leveransen = byta `"resize":
  "scale"` → `"remote"` i `/home/ak1a/desk-web/defaults.json` (ak1a-ägd fil,
  D3-rätten gäller) + ev. uppdatera hjälpsidans mening "Skrivbordets egen
  storlek är förinställd av oss" (hjalp.html:91) till att beskriva
  auto-anpassning. Kunden kan dessutom REDAN i dag välja "Remote resizing"
  själv i noVNC-panelen (rullgardinen finns, vnc.html:285-289) — läget är
  one-liner från driftsättning.
- Risk: medel — delad display med datorn (se 2.3), porträttmodo-ej-verifierat.

---

## 3. Arkitektur B — dubbelt skrivbord: :10 dator + :11 telefongeometri

### 3.1 Kan en andra AppImage-instans köras? — alla bitar belagda

- **Singleton-låset finns och är per profil:** `ls ~/.config/ZCode` visar
  `SingletonLock`, `SingletonSocket`, `SingletonCookie` — Electron låser
  EN instans per user-data-dir. En andra instans med SAMMA profil nekas/
  aktiverar befintligt fönster; med **egen** user-data-dir får den eget lås.
- **`--user-data-dir` är en levande mekanism i appen:** asar-strängarna
  (app.asar, lästa via /tmp/.mount_ZCode-ej3JV2) innehåller både flagg-dok
  (`--user-data-dir <directory>`, "use the specified user data directory")
  och aktiv kod (`chromeArguments.push(\`--user-data-dir=${userDataDir}\`)`)
  i appens Playwright-launcher; Electron-huvudprocessen ärver Chromiums
  kommandoradshantering ⇒ `--user-data-dir=~/.config/ZCode-mobil` är den
  bevisade vägen till profil nr 2. Att starta instans 2 är dock **ej
  live-provat** här (processpåverkan förbjuden) — styrka: starkt belagt i
  källkod, ej demonstrerat.
- **Precedens:** `~/.config/ZCode.backup-r306` finns — profilen har bytits
  en gång förr (r306), mekanismen att leva med två profilkataloger är känd i
  kedjan.

### 3.2 Auth: delas API-nyckeln i ~/.zcode? JA — om ZCODE_HOME inte överridas

Asar-koden (tvära funktioner, identisk logik):
`e.ZCODE_HOME?.trim()||(e.HOME?.trim()?lt(e.HOME.trim(),".zcode"):null)`
— resolver: **ZCODE_HOME först, annars HOME/.zcode**. En andra instans utan
ZCODE_HOME-override läser alltså SAMMA `~/.zcode`-träd: autentiserings- och
leverantörskonfiguration (v2/provider_config.json, v2/certs/ med nätverks-CA,
filnamn ls-belagda) + inställningar + sessionsdata. **Ingen ny inloggning,
ingen nyckeldubblett** — telefon-skrivbordet är samma konto. (Vill man tvärtom
SPLITTRA konton gör ZCODE_HOME det möjligt — inte aktuellt för paritet.)

### 3.3 Risken: två motorer mot samma SQLite

`~/.zcode/cli/db/` (db.sqlite — trådens sanningsägare enligt våg 148) och
`~/.zcode/v2/tasks-index.sqlite` med levande `-wal`/`-shm`-filer (WAL-läge
på, ls-belagt). Två app-instanser = två skrivande motorer mot samma WAL —
SQLite tillåter en skrivare åt gången; den andra väntar (busy) vid kollision.
Konkurrensen är möjlig men ej mätt här; Studio-läsningen av db.sqlite sker
redan flerprocess och fungerar (trådens sanningsägare GET /api/studio/stream),
så risken bedöms medel, inte blockerande — men den ska provas i demonstration.

### 3.4 Kostnad — mätt ur nuvarande processer

| Komponent | Mätt RSS | Källa |
|---|---|---|
| Xvnc :11 (motsvarande :10) | ~38 MB | ps, :10 |
| openbox nr 2 | ~30 MB | ps, :10 |
| AppImage-instans nr 2 (hela trädet) | ~390 MB | ps: 216+58+54+54+3+2 MB |
| **Summa extra** | **~460 MB ≈ 0,76 % av 60 GiB** | 12 kärnor/60 GiB |

Utrymme finns gott (uppdragets egen kontext + AGENTS.md). Portplanen är enkel:
Xvnc :11 lyssnar automatiskt på 5911; websockify nr 2 på t.ex. 6081 → 5911;
nginx-rutt `/desk-mobil/` med egen .htdesk. **Allt detta är framtida
/etc-arbete som INTE genomförts i detta uppdrag** (ägarskap: endast rapporten).

### 3.5 Nativ-närhet: HÖGST

Telefon-displayen får en PERMANENT telefongeometri (t.ex. 720x405 eller den
bredd DESK-U11 beläger som optimal), oberoende av datorns :10; ingen
resize-dragkamp; appens vy-zoom (desk-startzoom r308-309) kan styras per
display; U11:s eventella mobil-layout-krafter utnyttjas fullt ut. Kostnaden
är komplexitet: fyra nya systemd-tjänster + rutt + profil + dokumentation.

---

## 4. Arkitektur C — /chat-bryggan: redan live, text-nativ på telefonnivå

`/etc/systemd/system/zcode-chat.service` (läst i fulltext) + ps-rad (PID
19567, levande):

```
ExecStart=/usr/local/bin/ttyd -c ak1a:*** -W -i 127.0.0.1 -p 7681 \
          -t fontSize=14 tmux new -A -s zcode -c /home/ak1a/agent/ak1 zcode
```

- **Vad den ger telefonen idag:** webbläsar-terminal (ttyd 1.6-liknande,
  via nginx `/chat/` → 127.0.0.1:7681, WebSocket-upgrade, läs-timeout 86400 s)
  in i tmux-sessionen "zcode" som kör **zcode-CLI:n i kundens arbetsyta**.
  `-W` = writable (input fungerar), `-t fontSize=14` = läslig text.
  `tmux new -A` = attach-eller-skapa: sessionen lever kvar mellan
  telefonbesök — samma pågående samtal, precis som skrivbordets tråd.
- **Varför det är telefonvänligt:** text flödar om efter telefonens bredd —
  ingen zoom, ingen panorering, ingen skala. Det är den mest "nativa"
  typografin (ren terminal-UI), och `$HOME=/home/ak1a` ⇒ samma ~/.zcode
  (ZCODE_HOME-resolvern §3.2) = **samma konto och tråd som skrivbordet**.
- **Gräns:** det är CLI-upplevelsen (text, tangenter), inte skrivbordsappens
  fönster/menyer — kompletterar, ersätter inte /desk. Kostnad: redan betald
  (~1 MB). Roll i paritetsmålet: KOMPLEMENT som ger full chatt + agentdrift
  på telefonen NU, medan A/B finslipar skrivbordsbilden.

---

## 5. Rankning

| Arkitektur | Komplexitet | Kostnad | Risk | Nativ-närhet | Notering |
|---|---|---|---|---|---|
| **A: remote-resize på :10** | LÅG (1 rad i defaults.json + hjälptext; knappen finns redan i panelen) | ~0 MB | Medel: delad display med datorn (sista klienten vinner); porträttmodo ej live-verifierat | **4/5** — telefonens exakta pixlar, ingen uppskalningssuddighet; men appen renderar fortfarande skrivbords-layout i telefonens storlek | Snabbast till kundvärde; kombinerar fritt med U11:s bredd-fynd |
| **B: dubbelt skrivbord :11 + --user-data-dir** | MEDEL-HÖG (4 tjänster + port + rutt + profil + dokumentation; framtida /etc-ändringar) | ~460 MB (0,76 % av RAM) | Medel: SQLite-WAL med två skrivare (§3.3); två profiler att underhålla | **5/5** — permanent telefongeometri + per-display-zoom + U11-layout fullt ut; per-klient-lösning utan dragkamp | Reserv/utveckling när samtidig dator+telefon blir vardag |
| **C: /chat-bryggan** | NOLL (lever sedan förr) | ~1 MB | Låg | 3/5 för chatt (text-nativ, omflödar) men 0/5 för skrivbordskänsla | Komplement — ska marknadsföras i hjälpsidan (framtida arbete) |

Viktiga kombinationsegenskaper: A och B kan kombineras (remote-resize på
mobil-displayen, scale/off på datorns); C lägger sig under alla som textläge.

## 6. Rekommendation

- **Huvudväg: A — RANDR/remote-resize.** Minsta ingrepp, noll nya processer,
  levererar direkt "telefonens egna pixlar": telefonen ber om sin faktiska
  viewport vid varje anslutning (rfb.js firstUpdate-mekaniken §2.2) och vid
  rotation. Leverans: defaults.json `"resize": "remote"` i ak1a-ägda
  desk-web + hjälpsidens mening uppdateras + en kort demonstration som
  verifierar TigerVNC:s accept av telefonens exakta geometri (den enda
  ej-live-belagda biten) innan kunden möter läget.
- **Reserv: B — dubbelt skrivbord.** Triggrarna: kunden använder dator och
  telefon SAMTIDIGT (dragkampen i §2.3 slår till), eller U11 belägger en
  optimal telefonbredd som ska vara permanent oavsett vilken klient som
  ansluter. Alla bitar är källbelagda möjliga (egen user-data-dir, delad
  ~/.zcode-auth via ZCODE_HOME-resolvern, ~460 MB på 60 GiB) — men det är
  /etc-arbete som ägs av huvudsessionen, utanför detta uppdrag.
- **Alltid på: C** — /chat-bryggan är redan telefonens text-nativa ansikte
  mot samma konto och tråd; närmaste "ZCode-nativt" som finns i produktion
  just nu, gratis.

## 7. Källförteckning (källtripp per påstående)

1. /etc/systemd/system/zdesk-xvnc.service, zdesk-wm.service,
   zdesk-zcode.service, zdesk-novnc.service — fulltext lästa 2026-09-28.
2. /etc/systemd/system/zcode-chat.service — fulltext läst; ps-rad PID 19567.
3. /etc/nginx/sites-enabled/ak1a:10-16 (/chat/ → 7681), :21-29 (/desk/ → 6080,
   .htdesk) — lästa.
4. `Xvnc -help` — extensions-lista med RANDR; `dpkg -l`: tigervnc-
   standalone-server 1.15.0+dfsg-2build1, novnc 1:1.6.0-2.
5. `DISPLAY=:10 xrandr --query` — min 32x32, max 32768x32768, VNC-0,
   modolista.
6. /home/ak1a/desk-web/vnc.html:283-290 (resize-alternativ off/scale/remote);
   app/ui.js:194,1118-1119; core/rfb.js:149,300,363-367,743,792-831
   (_requestRemoteResize + _screenSize + setDesktopSize), 2900-2908
   (ExtendedDesktopSize→support), 2955-2974 (avboj + firstUpdate-resize).
7. /home/ak1a/desk-web/defaults.json — resize:"scale" idag (nulägets bevis).
8. `ps` (passiv): Xvnc 38 MB, openbox 30 MB, ZCode-träd 216+58+54+54+3+2 MB,
   ttyd ~1 MB, fabriksagenter ~50 MB st — RAM-siffrorna i §1, §3.4.
9. `ls ~/.config/ZCode` — SingletonLock/SingletonSocket/Cookie,
   ZCode.backup-r306, session, rum-electron-store.
10. app.asar-strängar (/tmp/.mount_ZCode-ej3JV2/resources/app.asar, strings):
    `--user-data-dir` flaggdok + `chromeArguments.push(\`--user-data-dir=
    ${userDataDir}\`)`; ZCODE_HOME-resolver `e.ZCODE_HOME?.trim()||(e.HOME?.
    trim()?lt(e.HOME.trim(),".zcode"):null)` (två funktioner).
11. `ls ~/.zcode/v2` — provider_config.json, certs/, setting.json,
    tasks-index.sqlite(-wal/-shm); ~/.zcode/cli/db — db.sqlite;
    setting.json-nycklar (node -e Object.keys): desktopWindowSize,
    desktopZoomLevel, embeddedBrowserViewportPreference m.fl.
12. /home/ak1a/desk-web/hjalp.html:90-91,107-108,132-133 — nuvarande
    zoom-råd ("förinställd av oss" — ska omformuleras om A driftsätts).

Ej live-verifierat (ärlighetsrad): TigerVNC:s accept av telefonens exakta
porträttgeometri via setDesktopSize (protokollvägen belagd, beteendet ska
demonstreras); andra AppImage-instansens start med --user-data-dir (källbelagt,
ej startad); Electron-fönstrets exakta omfallning vid krympande display.

RESULTAT: huvudväg A (RANDR/remote-resize på :10), reserv B (dubbel skrivbord :11 med --user-data-dir och delad ~/.zcode)
