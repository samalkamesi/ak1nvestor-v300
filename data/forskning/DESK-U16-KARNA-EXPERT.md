# DESK-U16 — Kärnexpert-granskning: grafik-/start-lagret (LAGER 1) rad för rad

**Fabrikuppdrag:** v205-u1 (GRANSKARE — granskar befintligt material mot källor,
juridik och kvalitet; levererar rapport som NY fil, skriver ej om andras filer)
· **Datum:** 2026-09-28 ~23:25–23:35 UTC · **Ägarskap:** ENDAST detta protokoll.

**Kontext:** U15:s dom — flaskhalsen är LATENS+AVKODNING, ej bandbredd
(U15:76-79) — kärnlagret äger större delen av latensbudgeten. U13V2:s dom —
remote-resize låser upp appens egen mobil-layout (U13V2:157-161), viloläge
960x540 kvar. Uppdraget: varje rad i (1) zdesk-xvnc.service, (2) zdesk-wm +
rc.xml, (3) zdesk-zcode.service, (4) zdesk-novnc.service — mot körläge, U6:s
flaggkarta och kända race-symptom — samt (5) U15:s latensspår med källbelägg.

---

## 0. Metod, ärlighet, ägarskap

- **Passiva mätningar endast** (M1–M21, §9): läsning av filer, systemd-show,
  ps, xrandr --query, xdpyinfo, xprop (läsning), xdotool FRÅGEKOMMANDON
  (search/getwindowname/getwindowgeometry — samma passiva klass som U14 §9
  använde), help-utskrifter. **INGA** inputs skickades, inga lägesbyten, inga
  omstarter, inga processpåverkan, inga skrivningar utanför detta protokoll.
- **Journalen blockad** för fabriksagenten (M15: endast grupp ak1a; samma
  gräns som U13V2 M4 och U15 §0) — inga loggcitat hävdas, inga fabriceras.
- Ms-tal för om-maximering efter lägesbyte kan **inte** mätas passivt (skulle
  kräva ett verkligt lägsbyte = processpåverkan); racingen bevisas som klass
  ur beteende (§2.1), vilket uppdraget explicit begärde.

---

## 1. zdesk-xvnc.service rad för rad + körlägesjämförelse

Enhetens alla rader (M1; ingen drop-in finns — `ls …service.d` → "No such
file", utgångskod 2 på alla fyra enheter):

| Rad | Innehåll | Dom |
|---|---|---|
| After= | `network.target` | **C4** — Xvnc lyssnar endast på loopback (`-localhost`, samma rad); nätverksmål är kosmetik. Harmlöst. |
| User= | `ak1a` | Korrekt (X-ägande = skrivbordets användare). |
| Kommentar | r311: 960x540-rationalet (läsbar text, 4× färre pixlar) | Stämmer mot worklog:18608 ("r311 telefon-först 960x540") och U13V2 §3. |
| ExecStart | `Xvnc :10 -geometry 960x540 -depth 24 -localhost -SecurityTypes None` | Se flaggorna nedan. |
| Restart/Sec | `always` / `3` | Rimligt (kedjan återhämtar sig; se B4 om startberedskap). |
| WantedBy | `multi-user.target` | Standard. |

**Flaggorna rad för rad mot körläge (M2, `ps` + `/proc`-cmdline via pgrep):**
körande cmdline är **ORDAGRANNT IDENTISK** med ExecStart — `/usr/bin/Xvnc :10
-geometry 960x540 -depth 24 -localhost -SecurityTypes None`, PID 478952, ägare
ak1a, startad 20:58:21 (= r311-epoken), NRestarts=0 (M3). **Avvikelse: INGEN.**
Cmdline är dock *starttillstånd*: runtime-sanningen är xrandr — current
960x540 59.63\* med modolista 640x480–1920x1200 (M4), dvs. ingen
SetDesktopSize≠960x540 har landat än (konsistent med U13V2 §2: remote-resize
väntar fortfarande kundbesök). Att hälsokontrollen sedan r313 jämför mot
xrandr-current i stället för cmdline är LANDAT och korrekt (M18:
desk-halsa.mjs:192-212, "workarea == xrandr current == … resize-medveten
invariant").

- `:10` — displaykontraktet; port 5910 härleds (59**10**), matchar websockify:
  mål `localhost:5910` (M1, novnc-raden) — koherent.
- `-geometry 960x540` — viloläget enligt U13V2 §3 dom (kvar; 720x405 reserv).
- `-depth 24` — pixeldjup; latensaspekt i §5.
- `-localhost` — endast loopback-lyssnande: nätvärlden når VNC endast via
  nginx→websockify (M14) med basic auth. Korrekt design.
- `-SecurityTypes None` — **C1**: ingen VNC-autentisering alls, även på
  loopback: varje lokal process (t.ex. vilken som helst av fabriksagenterna)
  kan ansluta till :10 och läsa/injicera i skrivbordssessionen, som bär
  appens inloggning. Bedömning: accepterad risk på enävärdarmaskin där
  processerna är betrodda (AGENTS.md-paradigmet), och alternativet (VncAuth)
  kräver lösenord i klientkedjan = sämre för en icke-teknisk kund. Rapporterad
  för medveten hållning, ej som akut åtgärd.

Version och tillägg (M5/M13): **TigerVNC 1.15.0** (byggd 2025-12-28);
tilläggslista inkluderar DAMAGE, Composite, RANDR, MIT-SHM, XTEST, TIGERVNC —
relevant för §5.

---

## 2. zdesk-wm.service + openbox rc.xml — maximeringskontraktet

Enhetsrader (M1): After+Requires xvnc (kedja: X-död ⇒ wm stoppas ⇒ app
stoppas; alla med Restart=always — beteendet bevisat av starttider: Xvnc
20:58:21 → openbox 20:58:25 = RestartSec 3 + sleep 1, M2), `DISPLAY=:10`,
`ExecStartPre=/bin/sleep 1` (**B4**: heuristisk väntan, ingen beredskapsgrind),
openbox **3.6.1** (M16), Restart=always/3.

**rc.xml i sin helhet (M16):** `<application class="*"><maximized>yes</maximized>
<decor>no</decor></application>` — ALLT maximeras, ALLT dekorationsfritt.

**Kontraktet är LIVE bevisat (M6):** huvudfönstret 0x400003 ("ZCode", class
"zcode","ZCode") har `_NET_WM_STATE = _NET_WM_STATE_MAXIMIZED_VERT,
_NET_WM_STATE_MAXIMIZED_HORZ, _OB_WM_STATE_UNDECORATED`, _NET_WORKAREA
(0,0,960,540) == skärm (M4). Kontraktets GRÄNS är också belagd: fönstret är
**960×640 på en 960×540-skärm** — maximeringen klampar mot appens
WM_NORMAL_HINTS minimum **480×640** (M6 på 0x400003; U14:102-104; U11 F9:
`minWidth:480, minHeight:640` ur app.asar) ⇒ 100 px av fönstret, inklusive den
botten-dockade kompositorn (U11 F4 `[data-v4-composer-dock="true"]`), ligger
utanför synfältet i viloläget. Detta är U14:§3:s strukturella fynd, FORTFARANDE
levande i nuet — och blir fynd A2 i remote-resize-eran (nedan).

### 2.1 FYND A1 — robot-handens klick-race: geometri-timing ur beteende

**Påstående:** vid xrandr-lägesbyte hinner fönstret ej maximeras om (och
appens layout ej omfallas) FÖRE robot-handens klick — klicket träffar en
övergångsgeometri. **Beviskedja ur beteende (fyra oberoende stöd):**

1. **Infrastrukturens egna skript kodar empiriska settle-tider.**
   desk-startzoom (M8, root-ägd 637 B) pollar fönstret i **40 varv × 2 s =
   upp till 80 s** innan det ens försöker, och **sover 1 s mellan ctrl+0 och
   ctrl+plus** — författarna vet av erfarenhet att fönster och zoom behöver
   settle-tid. Services sover heuristiskt (wm 1 s, zcode 2 s, M1) av samma
   skäl.
2. **Omstartsfönstrets EWMH-timing har redan slagit fel en gång.** U14:163-166:
   `windowactivate` gav `XGetWindowProperty[_NET_ACTIVE_WINDOW] failed` —
   rotens EWMH-lager fanns inte än när kommandot kördes. Samma osynkroniserade
   händelsekedja driver om-maximeringen efter ett lägesbyte.
3. **Robot-certet som gick ut saknar just den settle-grinden.** U14:222-234:s
   sekvens kör `xrandr --mode …` och därefter direkt `mousemove … click` —
   `windowactivate --sync` synkar AKTIVERING, inte geometri eller
   DOM-omfallning. Kontrasten mot punkt 1 är beviset: där settle-tider
   behövdes byggdes de in; i klicksekvensen finns ingen.
4. **Historiska felleveranser i exakt denna timingklass:** 6 typing-försök
   över två epoker gav aldrig text (U14:7-8; worklog:18515-18516 ROND 310);
   1080-epokens klickavvikelse är redan belagd av v202-u1 (U14:28-31). Att
   fönster-ID dessutom är epokbundna (0x600001 → 0x400003, U14:167-170;
   nuvarande instans M6) förvärrar certets hårdkodningskänslighet.

**Mekaniken (källbelagd):** lägesbyte ⇒ RRScreenChangeNotify till openbox ⇒
omkonfiguration av maximerat fönster (asynkron, ingen completion-signal till
tredjepart) ⇒ Chromium ConfigureNotify ⇒ React-breakpoints (U11 F1/F2: 640 px,
F4: 768/1024 px) ⇒ nytt DOM-läge. Ett klick däremellan träffar antingen gamla
koordinater eller ett halvomfallat DOM — och med min-hints 480×640 klampas
geometrin dessutom (A2). **Ärlighet:** exakta millisekunder kan inte mätas
utan att själv byta läge (förbjudet här); racingen är därmed bevisad som
KLASS (asynkron kedja utan signal + historiska felleveranser + egna skripts
settle-tider), inte som ms-kurva.

**Rättning (robot-cert v2):** mellan `xrandr --mode` och klick: polla
`xdotool getwindowgeometry --shell <W>` tills WIDTH×HEIGHT == nya skärmens
workarea (eller den min-hints-klampade storleken), därefter fast settle ≥300
ms; mål fönstret med `search --onlyvisible --name "ZCode"` (se B2). **Ägare:**
huvudsessionen (robot-handens cert); verktygssida ev. root-rond.

### 2.2 FYND B2 — fönstermålningens tvetydighet (mätt i nuet)

`xdotool search --class zcode` returnerar **två** fönster — och i ordningen
**6291457 FÖRST**, 4194307 sist (M7). 6291457 är appens dolda hjälpfönster:
"zcode", class "zcode","**Zcode**", 10×10 på +10+10, WM_NORMAL_HINTS = endast
"program specified size: 10 by 10" (M6). Även `search --name "^ZCode$"` träffar
BÅDA (xdotools regex är skriftlägesokänslig — "zcode" matchar, M7). Ett skript
som gör `search --class zcode | head -1` (mitt eget förstasonderande gjorde
exakt det) målmar alltså ett 10×10-hjälpfönster i stället för 960×640-fönstret;
U14:224-certet (`W=$(xdotool search --class zcode)`) ger W = två ID:n ->
geometriparsning sönder, windowactivate på båda. **Motbevis som pekar ut
kuren:** `search --onlyvisible --name "ZCode"` returnerar ENDAST 4194307 (M7) —
och desk-startzoom använder redan exakt det mönstret (M8), vars målbild är
korrekt. **Rättning:** cert och framtida robot-skript använder
`--onlyvisible --name "ZCode"` (+ ev. WIDTH>100-filter). **Ägare:**
huvudsessionen (certet); B2 är också indata till A1:s kur.

---

## 3. zdesk-zcode.service — alla flaggor rad för rad mot U6:s karta

Enhetsrader (M1): After+Requires wm; DISPLAY=:10; WorkingDirectory=/home/ak1a;
`ExecStartPre=/bin/sleep 2` (**B4**); ExecStart =
`ZCode-3.14.3-linux-x64.AppImage --no-sandbox --disable-gpu
--disable-backgrounding-occluded-windows --disable-renderer-backgrounding
--disable-background-timer-throttling`; ExecStartPost = `-/bin/su …
desk-startzoom` (minustecken = feltolerant); Restart=always/5.

**Flaggkollen mot U6:s karta — fortfarande korrekta, rad för rad:**

| Flagga | U6-källa | Dom i nuet |
|---|---|---|
| `--no-sandbox` | U6:7 (originalraden i K7) + r307-kommentarens STOPPREGEL | Kvar korrekt; återställningsraden i enhetskommentaren är protokollförd skötsel. |
| `--disable-gpu` | U6:68 (kandidat 2, appens vitlista A1 + utvecklarmönstret A4) | **LEVER, nyeffektivt verifierad (M20):** `pgrep -af 'type=gpu-process'` visar INGEN gpu-process under AppImage/mounten — de enda gpu-processerna på maskinen tillhör gränssnittsvaktens puppeteer-chrome. U6:s förutsagda effekt (GPU-processen borta) är alltså fortfarande sann i drift. |
| `--disable-backgrounding-occluded-windows` | U6:69 (kandidat 3, binärens switch-tabell K3) | Kvar korrekt — syftet (agenten jobbar när fönstret övergs) är permanent för en streaming-desktop. |
| `--disable-renderer-backgrounding` | U6:69 | D:o. |
| `--disable-background-timer-throttling` | U6:69 | D:o. |
| `--disable-software-rasterizer` (U6:s FALSKA VÄN, ⚠-raden U6:72) | — | **EJ närvarande — korrekt undviken.** |
| `--use-angle=…`, `--in-process-gpu` (U6 kandidat 4-5) | U6:70-71 | Ej tagna — rimligt (MEDEL/OKLART-risk i U6:s rankning). |

**Inställningsvägen (U6 kandidat 1):** setting.json har fortfarande
`"desktopChromiumHardwareAccelerationEnabled": true` (M9) — dvs. exakt EN av
U6:s två kurvägar är vald (U6:68: "välj EN av dem först"): kommandoraden.
Koherent, ingen redundant dubbelverkning.

### 3.1 FYND B3 — ExecStartPost-startzoomens race-läge vid mode-byte

Skriptet rad för rad (M8): polla synligt "ZCode"-fönster 40×2 s → `windowactivate
--sync` → `ctrl+0` → `sleep 1` → `ctrl+plus` → exit 0. Två öppna timing-hål:

1. **Mode-byte under poll-fönstret:** ExecStartPost körs vid VARJE app-start
   (även omstarter mitt i kundens session). Om en kunds remote-resize
   (SetDesktopSize, U12:819-829 — skickas vid varje anslutning/rotation) landar
   medan startzoom väntar eller ligger mellan ctrl+0 och ctrl+plus, appliceras
   zoomstegen mot en **övergångs-viewport** — effektiv CSS-bredd landar annorlunda
   (zoomLevel 1 = faktor 1,2; 960 px fönster ⇒ 800 effektiv CSS-px, U13V2:137-139)
   och därmed annan breakpoint-layout än avsett. Detta är uppdragets "sett fel
   tidigare vid mode-byte": worklog:18523 dokumenterar dessutom att
   ExecStartPost en gång **fällda enheten** (control process error) — `-`-prefixet
   kurerade fallet-enhet, men inte timingen.
2. **Redundans utan geometri-medvetenhet:** appen persisterar själv
   `"desktopZoomLevel": 1` (M9; worklog:18522: "överlever omstarter utan
   ExecStartPost"). ExecStartPost:s enda kvarvarande funktion är determinism
   (ctrl+0 återställer ev. kundzoom) — men den utgör samtidigt den enda
   komponent som aktivt trycker tangenter i start-/lägesbytesfönstret.

**Rättning:** gör startzoom geometri-medveten — kräv två på varandra följande
IDENTISKA `_NET_WORKAREA`-avläsningar (t.ex. 2×100 ms) före ctrl+0 — eller
degradera den till no-op när `desktopZoomLevel` redan är 1. **Ägare:**
root-rond (skriptet är root-ägt i /usr/local/bin, M8; enheten i /etc).

---

## 4. zdesk-novnc.service — websockify-flaggorna ur help-texten

Enhetsrader (M1): D3-kommentaren (ak1a-ägd web-rot, paketoriginal orört);
ExecStart = `websockify --web /home/ak1a/desk-web --heartbeat 30 6080
localhost:5910`; Restart=always/3. **Ingen User=-rad ⇒ FYND B1.**

**Flaggorna ur help-texten (M12, ordagrant):**

- `--web DIR` — *"run webserver on same port. Serve files from DIR."* Serverar
  noVNC-gränssnittet på 6080 från ak1a-ägd kopia (D3-rätten; fabriksagenter
  får förbättra UI utan root).
- `--heartbeat 30` — *"send a ping to the client every INTERVAL seconds"* —
  keepalive-ping var 30:e sekund som håller websocketen levande genom
  proxies/nginx; **INTE ett latensreglage** (påverkar ej strömmens
  fördröjning, endast livslängd i vila).
- **Latensreglage i websockify: FINNS EJ.** Hela option-listan (M12, 40+ rader)
  är ssl/auth/token/log/daemon/ipv6/wrap — websockify är en transparent pipe;
  strömreglagen bor hos klienten (§5c) och nät-RTT:n.

**FYND B1 — tjänsten kör som ROOT.** M2 (ps): PID 351439 USER **root**, uppe
sedan 15:05:31 (överlevde Xvnc-omstarten 20:58 — korrekt, ty After= utan
Requires är medveten åtskillnad). En tjänst som serverar ak1a-ägd webrot och
bridge:ar till en loopback-port har inget behov av root; port 6080 är
oprivilegierad. **Rättning:** `User=ak1a` (+ ev. `Group=ak1a`) i enheten —
samma mönster som de tre övriga zdesk-enheterna redan har. **Ägare:** root-rond
(/etc). **Observation (ej fynd):** NRestarts=7 (M3) — websockify har
auto-omstartat sju gånger sedan 15:05 (D3-erans web-rot-arbeten) utan att
skada Xvnc-sessionen; Restart=always/3 återhämtar sig självläkande som designat.

`--idle-timeout`/`--timeout` är EJ satta (M12 visar att de finns) — korrekt
för en tjänst som skall stå uppe i väntan på kund.

---

## 5. U15:s latensspår — vilka KÄRNREGLAGE sänker latens (med källbelägg)

U15:76-79:s dom: bandbredd är inte flaskhalsen; **nätverks-RTT** och
**klientens avkodning** är huvudfaktorer, skärpa (quality 3) medfaktor.
Kärnans reglage, led för led:

**a) Xvnc-sidan (TigerVNC 1.15.0, M13 — help-citat ordagrant):**
- **FrameRate** — *"The maximum number of updates per second sent to each
  client (default=60)"*. Redan 60 — **inget glapp**; detta är taket för hur
  ofta servern alls skickar uppdateringar per klient.
- **CompareFB** — *"Perform pixel comparison on framebuffer to reduce
  unnecessary updates (0: never, 1: always, 2: auto) (default=2)"*. Auto
  redan aktivt — **inget glapp**; =1 är det enda spänningsrummet (mer CPU för
  ännu färre onödiga uppdateringar) och skall vänta på mätdata.
- **ZlibLevel** — *"[DEPRECATED] (default=-1)"*: kompressionsnivån styrs av
  klienten; serverreglaget är avskaffat — inget att trimma här.
- **-depth 24 → 16** (försöksvärd): halverar framebuffer-byten (12,4 → 6,2
  Mbit/helbild med U15:67:s metodik) och en del kodningsarbete, men
  tight/JPEG-kedjan konverterar ändå mot RGB och färgdjupet kan ge banding i
  text — **testbart och reversibelt; rankat evolution-steg 6, ej akut.**
- **-pixelformat fmt (rgbNNN/bgrNNN)** (M13) — finreggle för pixelformatet;
  endast relevant om depth-spåret provas.
- **X DAMAGE-ext?** — ja, och redan aktiv Väg: xdpyinfo listar DAMAGE,
  Composite och TIGERVNC bland 24 tillägg (M5). Xvnc ÄR X-servern och spårar
  skärmändringar internt (därför TIGERVNC-tillägget) — x11vnc-stilens externa
  DAMAGE-pollning är inte denna arkitektur. Slutsats: DAMAGE är inte ett
  otillgängligt reglage utan den redan körda mekanismen; inget nytt att slå på.
- **AcceptSetDesktopSize (default=on)** (M13) — remote-resize-vägen öppen;
  U12:2900-2908 dokumenterade protokollsidan. **IdleTimeout (default=0)** —
  inga nedkopplingar i vila: korrekt.
- Serverns vila-CPU ~1,0 % (U15 §2) — serverkodning är inte flaskhals i vila;
  underlast saknas fortfarande mätetal (U15:84 rek 1: instrument först).

**b) Transportledet:** nginx /desk/ är rent — http/1.1, Upgrade/Connection-
headers, proxy_read/send_timeout 3600 s (M14) — inget som buffrar eller
klipper websocketen. websockify saknar latensreglage (§4). Kvar: RTT
kund↔Contabo (ej passivt mätbar — U15:78 konstaterade samma).

**c) Klientsidan (desk-web/defaults.json, M10):** `resize:remote, quality:3,
compress:2, show_dot, reconnect`. U15:85:s rekrytering **quality 3→6 EFTER
instrument** står kvar som korrekt nästa steg (skärpa = läsbarhet på 960×540).
**C2 (dokumenterad kvarstående fälla):** nyckeln `"compress"` är DÖD — klienten
läser `compression` (U13V2:73-77); noll funktionell skillnad (hårdkodad
default är 2 ändå) men en förvirringskälla som överlevt sedan U13V2.

**Ärlighetsrad för framtida mätningar:** gränssnittsvaktens lighthouse-svep
kör puppeteer-chrome med egna swiftshader-GPU-processer på servern (M20) —
aktiva latensmätningar bör undvika vaktens fönster (cron var 6:e timme) för
att inte snedvrida talen.

---

## 6. Fyndlista — allvarlighetsgrad, bevis, rättning, ägare

| ID | Grad | Fynd | Bevis (källtripp) | Rättning | Ägare |
|---|---|---|---|---|---|
| A1 | **A** | Robot-handens klick-race vid mode-byte: ingen geometri-settle-grind mellan xrandr-byte och klick; om-maximering + React-omfallning är asynkrona utan completion-signal | §2.1 pkt 1-4: M8 (startzoomens 80 s-poll + 1 s-settle), M1 (services söver heuristiskt), U14:163-166 (EWMH-timing-felet), U14:222-234 (certet saknar vänt), U14:7-8 + worklog:18515-18516 (6 felleveranser) | Robot-cert v2: polla getwindowgeometry till workarea-match + settle ≥300 ms före klick; `--onlyvisible`-mönstret | Huvudsessionen (cert); root vid verktygsstöd |
| A2 | **A** | Appens min-hints 480×640 är inkompatibla med telefonviewports i remote-resize-eran: liggande (~844×390) ⇒ 250 px av botten (kompositorn!) utanför; porträtt (~390×844) ⇒ 90 px klippt i höger — overflow går från vilolägets 100 px till certainty per orientering | M6 (min 480×640 på 0x400003; fönster 960×640 på 540-skärm LEVER), U11 F9 (asar: minWidth:480/minHeight:640), U12:100-104 (telefonens exakta pixlar sänds; porträttacceptans overifierad), U13V2:125-131 (risklistan öppen) | Acceptansprov vid kundens nästa remote-besök (xrandr + skärmdump); robotlägen ≥640 höga (U14 Kur A); porträtt = överlevbar (844>640), liggande = dokumenterad risk tills app-sidan ändras (ej kärnlagrets fil) | Huvudsessionen (bevis + dokumentation); app-min är leverantörens yta |
| B1 | **B** | zdesk-novnc.service saknar User= ⇒ websockify kör som ROOT | M2 (ps USER root), M1 (enhetsraderna: tre syskon har User=ak1a, denna saknar) | `User=ak1a` i enheten + omstart | Root-rond (/etc) |
| B2 | **B** | Fönstermålningens tvetydighet: `search --class zcode` ger 2 träffar med 10×10-hjälpfönstret FÖRST; namnmatchning skriftlägesokänslig | M7 ( båda sökningarna + --onlyvisible-varianten), M6 (hjälpfönstrets namn/class/10×10) | Cert/skript skall använda `--onlyvisible --name "ZCode"` (+ ev. WIDTH-filter) | Huvudsessionen |
| B3 | **B** | ExecStartPost-startzoom race: ctrl+0/ctrl+plus kan appliceras i övergångs-viewport vid mode-byte under 80 s-pollen; har en gång fällt enheten; redundant mot desktopZoomLevel:1 | M8 (skriptets tider), worklog:18523 (fallet-enhet + `-`-kuren), M9 (desktopZoomLevel:1 persisterad), worklog:18522, U12:819-829 (SetDesktopSize timing), U13V2:137-139 (zoom-faktorns layoutverkan) | Geometri-medveten startzoom (2 identiska workarea-avläsningar före tryck) ELLER no-op när zoom redan persisterad | Root-rond (/usr/local/bin + /etc) |
| B4 | **B** | Startkedjan sover i stället för att polla beredskap (wm sleep 1, zcode sleep 2; inga readiness-grindar) — symptomklassen är EWMH-timingfelet U14:163-166 | M1 (ExecStartPre-rader), U14:163-166 | Ersätt sömnarna med poll: X-socket resp. `_NET_SUPPORTING_WM_CHECK` finns (U14:71-74) | Root-rond |
| C1 | **C** | `-SecurityTypes None` på loopback: lokal process kan läsa/injicera i sessionen (bär appens inloggning) | M1 (raden), M14 (enda externa väg = nginx basic auth) | Medveten hållning dokumenterad; alternativ VncAuth försämrar kundkedjan | Root-rond (beslut) |
| C2 | **C** | Död nyckel `"compress"` i defaults.json (klienten läser `compression`) | M10, U13V2:73-77 | Radera/ändra nyckelnamn vid nästa defaults-rörelse (nyckeln ägs av desk-web/D3) | Huvudsessionen |
| C3 | **C** | Kedjeskuld (ej kärnlager): hjalp.html:137 pinar fortfarande `resize=scale` — U13V2 fynd A ÖPPET, huvudingången kringgår remote | M11 (grep rad 137 + mtime 20:43:53 < defaults 22:01), U13V2:45-69 | U13V2 §6.1:s diff (ändra till remote el. stryk parametern) | Huvudsessionen (D3-rätten) |
| C4 | **C** | Kosmetik: `After=network.target` på Xvnc utan nätberoende; novnc After-utan-Requires är medveten åtskillnad (NRestarts=7 utan X-skada) | M1, M2 (starttider), M3 (NRestarts) | Ingen åtgärd; bokförd för rutinens skull | — |

---

## 7. Evolutionära möjligheter — rankade mot "exceptionell nivå"

Målbilden från uppdraget: **<100 ms känsla · per-skärm-native · självläkande**.

| # | Steg | Mål-tag | Kostnad | Källbelägg |
|---|---|---|---|---|
| 1 | **Instrumentera först**: passiv Mbit/s + socket-sond som loggar vid kundens nästa besök (U15 rek 1); ev. noVNC-stats-panel i D3-forken | mätning (alla andras förutsättning) | Låg | U15:84, U15 §4 (panel saknas) |
| 2 | **A1+A2-kur: robot-cert v2** med geometri-settle-grind + `--onlyvisible` + lägen ≥640 | självläkande | Låg | §2.1-2.2, U14:217-219 |
| 3 | **Acceptansprovet remote-resize** vid kundens nästa besök (xrandr + orientering + skärmdump) — stänger U13V2 §2.4 OCH mäter A2:s realitet | per-skärm-native | Låg (väntar besök) | U13V2:118-131 |
| 4 | **Readiness-gated starts** (B4): poll i stället för sömn — kedjan blir deterministiskt själv-läkande vid omstarter | självläkande | Låg | §2 pkt 1, U14:163-166 |
| 5 | **quality 3→6** i defaults.json EFTER steg 1:s tal | <100 ms-känsla (skärpa→läsupplevelse) | Låg | U15:85 (marginal 4-20×) |
| 6 | **-depth 16-försök** (ev. med -pixelformat): halverar framebuffer-byten; mät CPU+bandbredd+skärpa; fullt reversibel | <100 ms-känsla | Medel | M13 (flaggorna), U15:67 (beräkningsbas) |
| 7 | **B1+B3-kur** (User=ak1a; geometri-medveten startzoom) + novnc-omstartsräkning i desk-halsa | självläkande | Låg | §3.1, §4 |
| 8 | **WebRTC-transport** (selvläkande reconnect under roten, sub-100 ms-klass) — ersätter websocket-pipen långsiktigt | <100 ms + självläkande | Hög (ny infrastruktur, R2-beröring möjlig) | U15:76-79 (RTT = huvudfaktorn), §4 (inga websockify-reglage) |

Rankningslogik: steg 1 utan siffror är allt gissning; steg 2-4 tar de
BEVISADE felen (A1, B2, B4) till självläkande för nästan noll kostnad; steg 5-6
är de enda kvarvarande kärnreglagen med belagd marginal; steg 8 är exceptionell
nivå men ägs av en större arkitekturrond.

---

## 8. Juridik

Ren infrastrukturgranskning: inget finansiellt innehåll, inga kundriktade
texter, inga råd (2007:528 berörs ej). Priser/tier/publicering: orörda
(R2-respekt — detta protokoll föreslår ENDRAST drifttekniska ändringar i
kärnlager och cert, alla ägda av sessionen/root-ronden enligt §6). GDPR/kakor:
inga nya datainsamlningar; mätförslagen läser serverns egna räknare
(/proc/net/dev, xrandr) — ingen persondata. Skärmdump togs INTE i detta
uppdrag (U14:s avstånd-regler för kundchatt-ytor respekteras).

---

## 9. Källförteckning (källtripp per påstående)

**Källdokument (lästa i fulltext):**
- K1 = AGENTS.md (arbetsytedoktrinen) · K2 = DESK-U6-ELEKTRONFART.md
  (flaggkartan) · K3 = DESK-U13V2-PARITETSSYNTES.md · K4 =
  DESK-U14-ROBOTFOKUS.md · K5 = DESK-U15-STROMFARTSMATNING.md ·
  K6 = DESK-U11-APPRESPONSIVITET.md (F1-F10) · K7 =
  DESK-U12-TELEFONPARITET.md · K8 = worklog.md (radreferenser 18515-18523,
  18608) · K9 = ~/.config/openbox/rc.xml · K10 = verktyg/desk-halsa.mjs.

**Egna passiva mätningar (alla 2026-09-28 ~23:25-23:35 UTC, råa värden i
transkript ovan):**
- M1 = cat/systemctl cat av alla fyra enheterna + drop-in-ls (saknas, exit 2).
- M2 = ps -o user,pid,lstart,etime + pgrep -a (Xvnc ak1a 20:58:21; openbox
  ak1a 20:58:25; AppImage ak1a 23:00:18 — cmdline ordagrant = ExecStart;
  websockify ROOT 15:05:31).
- M3 = systemctl show NRestarts (xvnc 0, wm 0, zcode 0, novnc 7) +
  ActiveEnterTimestamp.
- M4 = xrandr --query (current 960x540 59.63\*, modolista) + xprop -root
  _NET_WORKAREA (0,0,960,540).
- M5 = xdpyinfo (dimensions 960x540, depth 24; 24 tillägg bl.a. DAMAGE,
  Composite, RANDR, MIT-SHM, XTEST, TIGERVNC).
- M6 = fönsteruppräkning: 0x400003 "ZCode" 960×640+0+0, _NET_WM_STATE
  MAXIMIZED_VERT+HORZ+_OB_WM_STATE_UNDECORATED, WM_NORMAL_HINTS min 480×640;
  0x600001 "zcode" class "zcode","Zcode" 10×10+10+10, hints endast 10×10.
- M7 = xdotool search: --class zcode → [6291457, 4194307]; --name "^ZCode$" →
  båda; --onlyvisible --name "ZCode" → endast 4194307.
- M8 = cat /usr/local/bin/desk-startzoom (root-ägd, 637 B, mtime 20:28;
  40×2 s-poll, windowactivate --sync, ctrl+0, sleep 1, ctrl+plus).
- M9 = grep setting.json: desktopChromiumHardwareAccelerationEnabled true;
  desktopZoomLevel 1; desktopWindowSize width 960.
- M10 = cat defaults.json (remote/3/compress 2; mtime 22:01:25).
- M11 = grep hjalp.html:137 (resize=scale kvar; mtime 20:43:53).
- M12 = websockify --help i fulltext (--web, --heartbeat=INTERVAL-lydelserna;
  ingen latensoption i hela listan).
- M13 = Xvnc --help (TigerVNC 1.15.0 byggd 2025-12-28; FrameRate default=60,
  CompareFB 0/1/2 default=2, ZlibLevel DEPRECATED, AcceptSetDesktopSize on,
  IdleTimeout 0, -pixelformat, -depth, -geometry).
- M14 = nginx sites-available/ak1a location /desk/ (auth_basic, proxy_pass
  6080, http/1.1, Upgrade/Connection, timeouts 3600 s).
- M15 = id (endast ak1a) + journalctl-hint (journal blockad).
- M16 = openbox --version (3.6.1) + cat rc.xml i fulltext.
- M17 = worklog-rader 18515-18523 + 18608 (robot-handshistoriken,
  ExecStartPost-fallet, desktopZoomLevel-persistensen, r311-epoken).
- M18 = desk-halsa.mjs:192-212 (r313-invarianten landad: workarea == xrandr
  current).
- M19 = starttidskedjan (M2-M3): 20:58:21 → 20:58:25 = RestartSec 3 + sleep 1.
- M20 = pgrep -af 'type=gpu-process' (endast puppeteer-chrome från
  gränssnittsvakten + egen grep-skal; INGEN under AppImage/mount) —
  --disable-gpu lever.
- M21 = ls -l /usr/local/bin/desk-startzoom (root root, -rwxr-xr-x).

**Ärlighetsrad:** påståenden om vad som händer vid kundens framtida besök
(A2:s overflow-realitet, remote-resize-acceptans) är PROGNOS med belagd
mekanik — verifierbara först vid besöket (acceptanstest §7 steg 3). ms-tal
för om-maximering efter lägesbyte är ej passivt mätbara (§0). Inga fakta utan
källa ovan.

RESULTAT: 10 fynd (A:2 B:4 C:4) + 8 evolutionära steg rankade
