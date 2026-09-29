# DESK-U23 — KasmVNC-utredning: kompatibilitet, prestanda, migrering

**Datum:** 2026-09-29 · **Agent:** fabriksagent d1-u23 (BYGGARE) · **Ägarskap:** endast detta protokoll
**Kundkrav som driver utredningen (2026-09-29):** "100 % flexibilitet… exakt samma som riktiga z code… kan ej förstora bilder eller röra något" — dagens TigerVNC+noVNC översätter touch till MUS (nyp = ctrl+scroll i appen, ej nativ vy-zoom).

**Beslutsfråga:** Ska vi pilottesta KasmVNC som alternativ webb-VNC-server på display :12, vid sidan av TigerVNC :10/:11, för att ge kundens telefon en bättre upplevelse — och i så fall hur, med vilka risker?

---

## 0. Sammanfattning (TL;DR)

**Rekommendation: PILOT JA — men med omformulerat löfte.** KasmVNC 1.5.0 är tekniskt bärbar till vår Ubuntu 26.04 (noble-debets beroenden verifierade mot systemet: alla 30 binärbibliotek finns, 6 perl-moduler installeras från universum), kolliderar INTE med TigerVNC (namngivna binärer `Xkasmvnc`/`kasmvncserver`, user-systemd-unit, port 8443+display ⇒ :12 → 8455) och är en full X-server där vår Electron-app kan köras oförändrad med `DISPLAY=:12`.

**Men utredningens viktigaste fynd är en premisskorrigering:** uppdragets centrala påstående — "KasmVNC [är] BYGGT för web+touch: nativ pinch-zoom av vyn" — saknar **helt källstöd**. Ingen version av KasmVNC:s officiella dokumentation (1.0.0 → 1.5.0) nämner pinch-zoom, gesturer eller ens ordet "touch"; webbklientens README säger endast "Better mobile support" utan detaljer. Det som ÄR källbelagt: inbyggt mobil-tangentbord, Remote Resizing (servern anpassar upplösningen efter telefonens fönster = skärpa), modern WebP/WebRTC-klient. Om pinch-zoom fungerar i telefonens webbläsare avgörs av det fysiska telefonprovet — INTE av dokumenten. Telefontestet blir därför pilotens DEFINIERANDE moment, och inget löfte till kunden får ske i förväg (läxan r318/r327).

---

## 1. Nuläge — lokalt verifierat 2026-09-29

| Komponent | Status | Bevis |
|---|---|---|
| OS | Ubuntu 26.04 LTS "Resolute Raccoon", kärna 7.0.0-30-generic | `/etc/os-release` |
| TigerVNC | 1.15.0+dfsg-2build1 (`tigervnc-standalone-server`) | `dpkg -l` |
| noVNC | 1:1.6.0-2 (websockify på 127.0.0.1:6080/6081) | `dpkg -l`, `ss -tlnp` |
| Skrivbord :10 | `Xvnc :10 -geometry 412x915 -depth 24 -localhost -SecurityTypes None` — porträtt 412x915 enligt kundorder r321 ("använda som TELEFON"), port 5910 | `systemctl cat zdesk-xvnc.service` |
| Landskap :11 | `Xvnc :11` 800x360, port 5911, websockify 6081 | `ss -tlnp`, `systemctl` |
| nginx | sites-enabled innehåller `ak1a` + `ak1a-test`; **inga** 6080/6081/5910/5911-referenser — VNC-strömmarna nås via loopback (tunnel), inte via publika nginx-path:er | `ls` + grep i `/etc/nginx/sites-enabled/` |
| Resurser | 62 GB RAM (53 tillgängligt), 1,1 TB ledigt på / | `free -m`, `df -h` |

Notera: systemd-enhetsfilen för :10 bär kommentaren "DESK r321 (kundorder 'jag vill nyttja den som TELEFON')" — telefonanvändning är kundens uttalade mål, och 412x915 är en GISSNING av telefonformat. KasmVNC:s Remote Resizing skulle ersätta gissningen med telefonens faktiska fönsterstorlek (se § 4.3).

## 2. Vad KasmVNC är — källbelagt

- **Modern VNC-server, GPL-2.0**, produkt av Kasm Technologies. Repo: github.com/kasmtech/KasmVNC ("Modern VNC Server and client, web based and secure") — README.
- **Det är en X-server**: paketet levererar `Xvnc`-härstammande server (docs länkar `unix/xserver/hw/vnc/Xvnc.man`); i 1.5.0-paketet heter binären `/usr/bin/Xkasmvnc` (5,5 MB) — verifierat i deb-innehållslistan. X-apper (fönster, Electron) kör alltså precis som mot TigerVNC.
- **Bryter med RFB-specen** medvetet: "KasmVNC has broken from the RFB specification which defines VNC, in order to support modern technologies and increase security… does not support legacy VNC viewer applications" — paketbeskrivning i deb + kasmtech/noVNC README. (Konsekvens: klienten är KasmVNC:s egen noVNC-fork; TigerVNC-klienter kan INTE ansluta till KasmVNC och vice versa.)
- **Inbyggd webbserver + webbklient**: "KasmVNC has a built in web server and the web code is baked into KasmVNC" — kasmtech/noVNC README. Inget separat websockify-steg som idag.
- **Webbklienten** = fork av noVNC (kasmtech/noVNC, "Forked from novnc/noVNC").

Källor: [github.com/kasmtech/KasmVNC](https://github.com/kasmtech/KasmVNC), [github.com/kasmtech/noVNC](https://github.com/kasmtech/noVNC), [kasm.com/kasmvnc](https://kasm.com/kasmvnc), deb-metadata (`dpkg-deb -I`, 2026-09-29).

## 3. Versioner och paketläge

- **Senaste stabila: 1.5.0**, publicerad **2026-07-29** (GitHub releases, tag v1.5.0).
- **Deb-tillgång per serie (1.5.0-assets, via GitHub API):** Ubuntu focal 20.04 / jammy 22.04 / noble 24.04; Debian bullseye 11 / bookworm 12 / trixie 13; Kali rolling — **plus** apk (Alpine 3.21–3.23) och rpm (Fedora 42/43, openSUSE 15/16, Oracle 8/9). **Inget Ubuntu 26.04-paket finns i 1.5.0.**
- **1.5.1 (opublicerad, docs-preview) lägger till:** "Added build and package support for Ubuntu 26.04 (Resolute Raccoon)" — det officiella 26.04-stödet är alltså på väg men ännu ej släppt. 1.5.1 innehåller även reconnect-förbättringar, inga säkerhetsfixar.
- **1.6.0 (pre-release docs):** 120 fps-max (från 60), end-to-end input-to-screen-latens-statistik, samt ett STORT säkerhetsblock: två buffer-overflow i WebSocket-handshake, SCTP/OOM/clipboard-heap-fel m.fl. — indicates aktiv audit; vänta in stabil 1.6 för produktionsbyte, pilotera på 1.5.x.

Källor: [releases/latest](https://github.com/kasmtech/KasmVNC/releases/latest), [api.github.com/…/releases/latest](https://api.github.com/repos/kasmtech/KasmVNC/releases/latest), [release notes 1.5.1](https://docs.kasmvnc.com/docs/developer/release_notes/1.5.1/index.html), [release notes 1.6.0](https://docs.kasmvnc.com/docs/developer/release_notes/1.6.0/index.html).

## 4. Kompatibilitet — djupgranskning

### 4.1 Bärbarhet noble-deb → Ubuntu 26.04 (EMPIRISKT VERIFIERAD, passiv granskning)

Jag hämtade `kasmvncserver_noble_1.5.0_amd64.deb` (2,6 MB) till /tmp och jämförde dess `Depends` mot det faktiska 26.04-systemet — **ingen installation har gjorts** (root/sessionen äger den):

- **Alla 30 binära/verktygsberoenden finns redan installerade**: libc6 (≥ 2.38 ✓), libssl3t64 (≥ 3.0.0 ✓), libstdc++6 (≥ 13 ✓), libpng16-16t64, libxfont2, libxrandr2, libgl1, ssl-cert, xauth, xkb-data m.fl. — `dpkg-query` mot samtliga.
- **6 perl-moduler saknas** (libswitch-perl, libyaml-tiny-perl, libhash-merge-simple-perl, liblist-moreutils-perl, libdatetime-perl, libdatetime-timezone-perl) — alla har kandidatversioner i 26.04:s universum (`apt-cache policy`, t.ex. libswitch-perl 2.17-3) och dras in automatiskt av `apt-get install ./deb`. De används av `kasmvncserver`-wrapper-skriptet (sessionshantering), inte av X-servern själv.
- **Video-stöd (H.264/H.265/AV1) är INTE ett hårt beroende** — inga ffmpeg-/x264-lib i Depends. Rekommenderar endast intel-media-va-driver (VAAPI). På vår KVM-Contabo-box utan GPU blir det ändå software-kodning, se § 5.
- Installerad storlek: 8 726 kB — försumbar mot 1,1 TB ledigt.

**Slutsats 4.1:** noble-debet är tekniskt installerbart på 26.04; kantfallen är (a) att det är en främmande serie = ingen garanti mot subtila bibliotekskillnader (b) Kasm's egna QA har inte testat 26.04 förrän 1.5.1. Risk åtgärdas av att piloten är isolerad på :12 och av att 1.5.1:s officiella 26.04-paket kan bytas in när det släpps.

### 4.2 Samexistens med TigerVNC :10/:11 — FILKOLLISIONSFRI (verifierad)

- KasmVNC-paketets binärer är **namngivna**: `/usr/bin/Xkasmvnc`, `/usr/bin/kasmvncserver`, `/usr/bin/kasmvncconfig`, `/usr/bin/kasmvncpasswd` (deb-innehållslista). TigerVNC äger `/usr/bin/Xvnc`, `/usr/bin/vncserver` m.fl. — **kom -12 mellan paketens fillistor ger noll kollisioner**.
- Systemd: KasmVNC levererar user-uniten `/usr/lib/systemd/user/kasmvncserver@.service` — instansierad per display (`kasmvncserver@:12`), kör som användaren, vid sidan av våra system-enheter `zdesk-xvnc.service`/`zdesk-xvnc-land.service` som förblir orörda. 1.5.0-release notes bekräftar: "Optional systemd auto-start for deb/rpm packages, supporting multiple KasmVNC instances per user".
- **Port-schema:** `network.websocket_port: auto` ⇒ **8443 + displaynummer** (configuration docs). Display :12 ⇒ TCP **8455** (UDP samma vid WebRTC). Krockar inte med 5910/5911/6080/6081 eller appens 3000. Vid behov kan porten sättas explicit i yaml.
- Konfiguration: `/etc/kasmvnc/kasmvnc.yaml` (globalt) + `~/.vnc/kasmvnc.yaml` (per användare). Katalogen `~/.vnc` DELAS med TigerVNC (dess xstartup/passwd/loggar ligger där) men filnamnen är åtskilda — Kasm läser bara `kasmvnc.yaml`, TigerVNC läser sina egna. Låg kollisionsrisk; piloten bör ändå ta backup av `~/.vnc` först (billig försäkring, se § 6 steg 3).

### 4.3 X-apper, Electron och upplösning

- **X-server = X-apper rå**: samma körmodell som idag. Backup-appen startas med `DISPLAY=:12` i stället för `:10`; fönsterhanteraren/sessionen väljs via KasmVNC:s egen `vncserver -select-de`-mekanism (serverside docs). Elektron/WebKit-rendering påverkas inte av VNC-lagret — det är pixlar ut.
- **Grafik:** `desktop.gpu.hw3d: false` är default (software-DRI). På vår GPU-lösa server = oförändrat läge mot idag (software GL). Paketet drar `libgl1` — standard Mesa, inget extra.
- **Upplösning — KasmVNC:s trumf:** `desktop.resolution` (default 1024x768) + `desktop.allow_resize: true` (default) ger **Remote Resizing**: "Automatically resize the server-side resolution to fit the client's window size" (clientside docs). Klienten kan också välja **Local Scaling** ("Scale the image to fit the client's resolution") eller **Static 720p**. För kundens telefon betyder Remote Resizing att serverupplösningen SÄTTS efter telefonens faktiska viewport — 412x915-gissningen ersätts av verkliga mått, skarp 1:1-pixelåtergivning utan omskalning. (Dynamisk resize sker när klientfönstret ändrar storlek; exakta RandR-anrop är inte dokumenterade på configuration-sidan — litet hål, se § 8.)

### 4.4 Konkreta kompat-risker

1. **Safari stöds INTE vid direktanslutning**: "Safari browsers do not support passing Basic Auth credentials through web socket connections, therefore, Safari is currently not supported when the client connects directly to KasmVNC" (serverside docs). Kunden använder iPhone-okänt — om telefonen har Safari måste vi köra via vår nginx-proxy-path (där Basic Auth hanteras annorlunda) ELLER testa Chrome/Safari-beteende i telefonprovet. **Öppen fråga tills telefonprov.**
2. **Autentisering är KasmVNC-egen**: HTTPS Basic Auth mot KasmVNC-användare (`vncpasswd -u <namn> -w -r`), separata från OS-användare (serverside docs). Nya inloggningssteg för kunden — eller så bakas inloggning i proxy-lösningen.
3. Firefox/icc: "Firefox is supported, but some features do not work" (äldre clientside docs); Chromium-baserade "support all features" — mobil-Chrome rekommenderas.

## 5. Prestanda & latensfilosofi (mot U15:s dom "latens > bandbredd")

- **Protokollstack:** "KasmVNC has a built in web server. The desktop rendering is transmitted via a web socket connection by default. KasmVNC also supports WebRTC UDP under certain circumstances" (serverside docs). codecs: JPEG (libjpeg-turbo), **WebP** ("approximately 30 % lower bandwidth", automatisk jpeg/webp-mix efter server-CPU), QOI (lossless LAN), samt 1.5.0:ens **video-streaming-mode med H.264/H.265/AV1** (WebCodecs i klienten, VAAPI/NVENC om GPU fanns — vi har ej).
- **Uppdragspremissen "KasmVNC har ej webrtc" är FÖRÅLDRAD:** 1.5.0 har "WebRTC UDP Transit" — men **experimentellt och villkorligt**: stödjer STUN, **inte TURN** ("does not support TURN servers, which is required if the server is behind NAT"); default `network.udp.public_ip: 127.0.0.1` "effectively disables WebRTC". Bakom vår nginx reverse proxy (§ 6) får klienten i praktiken WebSocket-transit ändå — WebRTC-vinsten förblir teoretisk för piloten; den kan aktiveras senare genom att exponera UDP + sätta public_ip till 5.189.162.162 (brandväggs-/säkerhetsbeslut, styrelse).
- **Latensfilosofin** matchar U15:s dom på rätt sätt: KasmVNC optimerar för interaktivitet — frames skickas endast vid skärmändring ("Frames are only sent on screen change", clientside docs), kvalitetsmixen anpassas dynamiskt efter förändringstakt, max_frame_rate 60 (1.6.0 → 120). Video encoding mode (rect-baserad jpeg/webp "video") triggas efter 5 s rörelse över >45 % av ytan och avslutas 3 s efter stillastående — dvs snabb lägesväxling latens↔kvalitet. 1.6.0 till och med mäter "end-to-end input-to-screen latency" som statistik.
- **Ärlighet om siffror:** "30 % bättre komprimering" är Kasm's EGET marknadsföringspåstående (kasm.com); vi har inget eget mätetal. KasmVNC har inbyggt benchmark-verktyg (repo-wiki "Performance Testing") — piloten kan köra det för lokala tal.

## 6. Migreringsplan — pilot på :12, fyra faser, DEFAULT-BYTE FÖRST EFTER GRÖNT TELEFONPROV

**Princip (läxa r318/r327): TigerVNC :10/:11 rörs inte alls; huvudvägen byts ALDRIG förrän kunden själv provat i telefon och sagt ja.**

### Fas 0 — förberedelse (agent, passivt)
1. Bevaka 1.5.1-släppet (officiellt 26.04-paket) — om släppt före pilot: använd det; annars noble-deb (bärbarhet § 4.1 verifierad).
2. Backup: `cp -a ~/.vnc ~/.vnc.backup-desk-u23` + dokumentera att tre nya nginx-rader är allt som tillkommer publikt.

### Fas 1 — installation (ROOT-sessionen äger; fabriksagenten installerar EJ)
```bash
# i root-session (t.ex. via kundens Termius eller styrelsens driftsprompt):
wget https://github.com/kasmtech/KasmVNC/releases/download/v1.5.0/kasmvncserver_noble_1.5.0_amd64.deb
apt-get install ./kasmvncserver_noble_1.5.0_amd64.deb   # drar 6 perl-moduler från universum
sudo adduser ak1a ssl-cert                                # cert-åtkomst; KRÄVER ny inloggning
```
TigerVNC-paketen lämnas installerade — konfliktlös (§ 4.2).

### Fas 2 — pilot-instans på :12 (agent/rot)
`~/.vnc/kasmvnc.yaml` (pilot, loopback + proxymönster enligt Kasm's egna reverse proxy-guide):
```yaml
network:
  interface: 127.0.0.1        # aldrig publikt
  websocket_port: auto        # :12 → 8455
  ssl:
    require_ssl: false        # nginx terminerar TLS (guidens mönster)
  udp:
    public_ip: 127.0.0.1      # WebRTC av (pilot)
desktop:
  resolution:
    width: 412                # porträtt-startvärde tills Remote Resizing tar över
    height: 915
  allow_resize: true          # Remote Resizing = telefonens verkliga viewport
encoding:
  max_frame_rate: 60
```
Start: `systemctl --user enable --now kasmvncserver@:12` (eller `kasmvncserver :12` interaktivt första gången: skapar KasmVNC-användare + väljer DE — kör samma minimala WM/session som :10 använder). Kontroll: `ss -tlnp | grep 8455` + `curl -I http://127.0.0.1:8455`.

**Publik ingång (telefonprov):** egen nginx-path t.ex. `https://lab.ak1nvestor.com/desk-pilot/` → `proxy_pass http://127.0.0.1:8455` med guidens obligatoriska websocket-rader (`proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_http_version 1.1; proxy_buffering off;` timeouts 1800 s) — exakt mönstret i [reverse proxy-guiden](https://docs.kasmvnc.com/how-to/reverse_proxy/index.html). OBS: Kasm-webbklienten förväntar sig root-path (guide lyssnar på `/`) — om subpath-problematik uppstår (okänt, hål § 8): använd en egen subdomän (t.ex. `desk.lab.ak1nvestor.com` + Let's Encrypt) i stället; sistnämnda är det bevisat fungerande mönstret i guiden.

### Fas 3 — app-test utan telefon (agent)
- Starta backup-appen/Elektron-sessionen med `DISPLAY=:12` (COPY av nuvarande start — inget i appen ändras).
- Verifiera: fönster renderar, mobil-layouten (412-viewport) syns, mobil-tangentbordet dyker upp i klientens Keys-panel, Remote Resizing ändrar serverupplösning när webbläsarfönstret storleksändras.
- Kör inbyggda benchmark + notera FPS/statistikpanelen.

### Fas 4 — kundens telefonprov (DEFINIERANDE momentet)
Kunden öppnar pilot-URL:en i telefonens webbläsare (Chromium-baserad rekommenderas; Safari = riskpunkt § 4.4) och provar: (a) se och läsa text, (b) skriva via mobil-tangentbord, (c) **nyp-gesten — fungerar vy-zoom?** Detta är det okända (§ 8) — dokumentera resultatet ödmjukt, (d) scroll/drag-känsla, (e) latens-känsla.
**ENDAST vid grönt kundprov:** beslut om huvudvägsbyte (ny styrelserond; zdesk- :10-tjänsten kan då migreras eller parallell-drivas). Tills dess: piloten är en extraningång.

### Fallback (alltid)
TigerVNC-läget :10/:11 är orört och förblir huvudväg. Piloten rivs med `systemctl --user disable kasmvncserver@:12` + `apt-get remove kasmvncserver` + nginx-block bort — noll spår i prod-appen. Om noble-debet visar biblioteksproblem på 26.04: vänta på 1.5.1 (officiellt 26.04-stöd) eller källbygge (repo har byggdocs; ~30–60 min på denna maskin, RAM räcker gott).

## 7. Riskregister

| # | Risk | Grad | Åtgärd |
|---|---|---|---|
| R1 | **Pinch-zoom fungerar ej som kunden hoppas** — det centrala kundbehovet är EJ källbelagt (§ 8) | HÖG osäkerhet | Telefonprov FÖRE alla löften; sälj in det belagda (tangentbord, Remote Resizing, skärpa) |
| R2 | noble-deb på 26.04 = icke-QA:ad seriekombination | Medel | Isolerad pilot :12; 1.5.1:s 26.04-paket byts in; fallback avinstall |
| R3 | Safari/direktanslutning stöds ej (Basic Auth + WS) | Medel | Chromium-mobil för provet; ev. subdomän+proxy-lösning; koll i telefonprov |
| R4 | Säkerhet: 1.6.0:s pre-release avslöjar flera buffer-overflow (2 i WS-handshake) — aktiv angrippsyta för en exponerad webbtjänst | Medel | Loopback-only + nginx framför; Basic Auth på; håll 1.5.x aktuell; aldrig 0.0.0.0-listen |
| R5 | `~/.vnc` delas med TigerVNC (loggar/xstartup samsas) | Låg | Backup före start; åtskilda filnamn verifierade |
| R6 | 6 perl-moduler + främmande deb = root-installation krävs | Låg | Root-sessionen äger install (best practice ändå); dependencies verifierade installerbara |
| R7 | Subpath-bakom-nginx kan strula (klient antar root) | Okänd | Subdomän-alternativ i planen (§ 6 fas 2) |
| R8 | Resurser: dokumentationen rekommenderar 2 kärnor/2 GB (klient 4/4) — servern har 62 GB | EJ risk | — |

## 8. Ärlighetsregister — belagt vs obelagt

**Källbelagt (URL i § 9):** mobil-tangentbord + Keys-panel; Remote Resizing/Local Scaling/Static; WebP ~30 % (Kasm's eget påstående); WebRTC UDP Transit med STUN men utan TURN, default av; port 8443+display; systemd `kasmvncserver@:N`; GPL-2.0; deb-serier och 1.5.1:s planerade 26.04-stöd; Safari-dirjektanslutningsbegränsning; videos kodek-lista; 1.6.0:s säkerhetsfixar. **Lokalt belagt:** allt i § 1 + beroendejämförelsen (§ 4.1) + filkollisionsfriheten (§ 4.2) — egna passiva mätningar 2026-09-29.

**EJ belagt (hål — markeras öppet):**
1. **Pinch-zoom/nypgest och touch-beteende i detalj** — nämns i INGEN dokumentation 1.0.0→1.5.0; README säger bara "Better mobile support". Uppdragets premiss är alltså obekräftad. ENDAST telefonprov kan besvara det.
2. **Subpath-bakom-nginx** — guiden visar bara root/subdomän; beteende under `/desk-pilot/` okänt.
3. **Noble-debets faktiska körbarhet på 26.04** — beroendena uppfyller kraven (§ 4.1) men kombinationen är otestad av Kasm t.o.m. 1.5.0.
4. **Elektron-appens könskänsla på :12** — teoretiskt identiskt (X-server), praktiskt overifierat tills fas 3.
5. **Latens i millisekunder på vår Contabo-länk** — inga egna mätetal ännu; benchmark finns i verktyget (§ 5).

## 9. Källförteckning

1. KasmVNC produktsida: https://kasm.com/kasmvnc (redirect från kasmweb.com/kasmvnc, 2026-09-29)
2. KasmVNC-repo/README: https://github.com/kasmtech/KasmVNC
3. Release 1.5.0 + assets: https://github.com/kasmtech/KasmVNC/releases/latest och https://api.github.com/repos/kasmtech/KasmVNC/releases/latest
4. Install (1.5.0): https://docs.kasmvnc.com/docs/install/index.html
5. FAQ (1.5.0): https://docs.kasmvnc.com/docs/FAQ/index.html
6. Client Side (1.5.0): https://docs.kasmvnc.com/docs/clientside/index.html
7. Server Side (1.5.0): https://docs.kasmvnc.com/docs/serverside/index.html
8. Configuration (1.5.0): https://docs.kasmvnc.com/docs/configuration/index.html
9. Reverse proxy how-to: https://docs.kasmvnc.com/how-to/reverse_proxy/index.html
10. Release notes 1.5.1 (opublicerad): https://docs.kasmvnc.com/docs/developer/release_notes/1.5.1/index.html
11. Release notes 1.6.0 (pre-release): https://docs.kasmvnc.com/docs/developer/release_notes/1.6.0/index.html
12. Kasm-webbklient (noVNC-fork): https://github.com/kasmtech/noVNC
13. Äldre clientside-dokumentation (1.0.0/1.3.2): https://kasmweb.com/kasmvnc/docs/1.3.2/clientside.html
14. Lokala passiva belägg 2026-09-29: dpkg -l, systemctl cat/list-units, ss -tlnp, /etc/os-release, dpkg-deb -I/-c på kasmvncserver_noble_1.5.0_amd64.deb, dpkg-query-beroendejämförelse, apt-cache policy

---

RESULTAT: rekommendation **pilot JA** på display :12 (KasmVNC 1.5.0, noble-deb — bärbarhet empiriskt verifierad, 1.5.1:s 26.04-paket byts in vid släpp) + installationsväg **root-install av deb → user-unit `kasmvncserver@:12` på loopback:8455 bakom egen nginx-path/subdomän med websocket-upgrade → app-test med DISPLAY=:12 → kundens telefonprov** (default-byte av huvudväg ENDAST efter grönt kundprov; TigerVNC :10/:11 lämnas orört som reserv-ingång) + risker **främst att "nativ pinch-zoom" SAKNAR källstöd i all KasmVNC-dokumentation (telefonprovet avgör kärnbehovet), noble-deb-o-QA på 26.04, Safari-stöd saknas vid direktanslutning, och 1.6.0:s avslöjade WS-buffer-overflows kräver loopback+nginx+auth-disciplin**.
