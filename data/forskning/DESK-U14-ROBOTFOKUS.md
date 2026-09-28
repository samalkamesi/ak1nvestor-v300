# DESK-U14 — ROBOT-Handens fokusrot: varför når xdotool-typing inte kompositorn?

- **Datum:** 2026-09-28 22:17 lokal (server UTC)
- **Agent:** fabriksagent v204-u1 (byggare), manifest v204
- **Uppdrag:** passiv rotutredning — sessionens robot-hand (xdotool) når inte
  ZCode-appens chattfält. 6 typförsök (råa + zoomkompenserade koordinater,
  både 1920x1080- och 960x540-epoken) gav ALDRIG text i sessionen (grep på
  egna teststrängar i `~/.zcode/cli/rollout` + v2 = tomma).
- **Metod:** passiv läsning ENDAST. xdotool FRÅGEKOMMANDON (getactivewindow,
  getwindowfocus, getwindowgeometry, search), xprop, xwininfo, xdpyinfo,
  xrandr (läge), xmodmap (läsning), /proc/*/environ, app.asar-strängar,
  worklog + sessionsloggar. **INGA inputs har skickats** (aldrig
  type/click/key/mousemove — inte heller windowmove/lägesväxling), ingen
  `~/.zcode`-skrivning. En skärmdump togs (pixelavläsning, se § 8).

---

## 1. SAMMANFATTAD SLUTSATS

**X-fokuskedjan är HEL — roten ligger i klickleveransen, inte i fokus.**
Både `getactivewindow` och `getwindowfocus` pekar på ZCode-fönstret just nu,
openbox EWMH lever, och fokusmodellen (ingen WM_TAKE_FOCUS) gör att XTEST-
tangenter levereras till fönstret. Roten är tvådelad:

1. **1920x1080-epoken: bevisad klickavvikelse** (v202-u1:s klickmatematik —
   yttre zoom/transform ger avvikelse ⇒ klicket missade kompositorn ⇒
   kompositorn fick aldrig DOM-fokus ⇒ `type`-texten konsumerades av appen
   utan mål). Belagt via worklog ROND 310 + DESK-U8.
2. **960x540-epoken: strukturell översvämning** — appfönstret är 960x640
   (WM_NORMAL_HINTS minimum 480x640) på en 960x540-skärm ⇒ de nedersta
   **100 px ligger utanför skärmen** (xwininfo: `-0--100`). Kompositorn är
   dockad i chattvyns botten (`[data-v4-composer-dock="true"]`, DESK-U11 F4)
   och ligger i den översvämmade zonen ⇒ klickkoordinater som träffar
   kompositorn ligger utanför det klickbara fältet.

Sekundära risker dokumenterade: `type --window` (XSendEvent) ignoreras av
Chromium; svenska tecken saknar keysyms i server-tangentkartan; hårdkodade
fönster-ID:n dör vid app-omstart (0x600001 → 0x400003 bevisat).

---

## 2. KEDJAN JUST NU (passiva frågekommandon, 22:1x)

```
$ ps aux | grep -E 'Xvnc|openbox'
ak1a 478952 /usr/bin/Xvnc :10 -geometry 960x540 -depth 24 -localhost -SecurityTypes None
ak1a 479035 /usr/bin/openbox
ak1a 504337 /home/ak1a/ZCode-3.14.3-linux-x64.AppImage --no-sandbox --disable-gpu \
       --disable-backgrounding-occluded-windows --disable-renderer-backgrounding \
       --disable-background-timer-throttling

$ DISPLAY=:10 xdotool getactivewindow
4194307
$ DISPLAY=:10 xdotool getwindowfocus
4194307                      # = 0x400003 — X-fokus OCH EWMH-aktiv = samma fönster

$ DISPLAY=:10 xprop -id 0x400003 WM_HINTS WM_TAKE_FOCUS WM_TRANSIENT_FOR WM_NAME WM_CLASS _NET_WM_PID
WM_HINTS:  not found.
WM_TAKE_FOCUS:  not found.
WM_TRANSIENT_FOR:  not found.
WM_NAME(UTF8_STRING) = "ZCode"
WM_CLASS(STRING) = "zcode", "ZCode"
_NET_WM_PID(CARDINAL) = 504331       # = AppImage-huvudprocessen

$ tr '\0' '\n' < /proc/504337/environ | grep DISPLAY
DISPLAY=:10                          # appen sitter på rätt display

$ DISPLAY=:10 xprop -id 0x400003 WM_PROTOCOLS
WM_PROTOCOLS(ATOM): protocols  WM_DELETE_WINDOW, _NET_WM_PING, _NET_WM_SYNC_REQUEST

$ DISPLAY=:10 xprop -root _NET_ACTIVE_WINDOW _NET_SUPPORTING_WM_CHECK _NET_CLIENT_LIST
_NET_ACTIVE_WINDOW(WINDOW): window id # 0x400003
_NET_SUPPORTING_WM_CHECK(WINDOW): window id # 0x20011f   # openbox EWMH lever
_NET_CLIENT_LIST(WINDOW): window id # 0x400003           # ENDA hanterade klienten
```

**Tolkning:** fönstret deklarerar INTE WM_TAKE_FOCUS och saknar WM_HINTS ⇒
ICCCM aktiv-modell: openbox sätter tangentbordsfokus direkt (XSetInputFocus)
— och det sitter rätt (XGetInputFocus = 0x400003). XTEST-tangenter till
fokusfönstret levereras alltså fram till appens toplevel. Fokuslagret är
inte roten (just nu).

Synliga fönster (`xdotool search --onlyvisible --name ''`): 556, 0x20011f
(WM-stöd, tom WM_CLASS), 0x2002a7–a9 (openbox-interna, namnlösa), 0x400003.
Endast 0x400003 är en klient.

## 3. GEOMETRIN — ÖVERSVÄMNINGEN (belagt)

```
$ DISPLAY=:10 xdotool getwindowgeometry --shell 0x400003
WINDOW=4194307
X=0
Y=0
WIDTH=960
HEIGHT=640          # skärmen är 960x540 (xdpyinfo) ⇒ 100 px under botten
SCREEN=0

$ DISPLAY=:10 xwininfo -id 0x400003 | grep -E 'Corners|geometry'
  Corners:  +0+0  -0+0  -0--100  +0--100     # -0--100 = nederkant 100 px utanför
  -geometry 960x640+0+0

$ DISPLAY=:10 xprop -id 0x400003 WM_NORMAL_HINTS
		program specified location: 0, 0
		program specified minimum size: 480 by 640    # APPENS MINIMI-HÖJD = 640
		window gravity: Static
```

openbox-användarkonfigurationen maximerar ALLT (`~/.config/openbox/rc.xml`):

```xml
<application class="*">
  <maximized>yes</maximized>
  <decor>no</decor>
</application>
```

**Slutsats:** maximeringen kan INTE krympa fönstret under appens minimum
640 px. Så länge skärmhöjden < 640 (960x540, och även 800x600!) ligger de
nedersta pixlarna — inklusive den dockade kompositorns zon — utanför
skärmen, och XTEST-klick utanför skärmen clampas/kastas. Detta är
strukturellt, inget race.

## 4. APPENS EGEN FOKUSHANTERING (app.asar, 327 MB, monterad /tmp/.mount_ZCode-PYHRW6)

| Söksträng | Träffar | Tolkning |
|---|---|---|
| `webContents.focus` | **0** | main-processen styr INTE fokus programmatiskt |
| `setFocusable` | 6 | samtliga = React-a11y-räknare (`setFocusableItemsCount`) — inte Electron-setFocusable |
| `openDevTools` | 1 | UI-knapp bakom `isReady`-vakt (`Pe(()=>F.openDevTools())`) — ingen devtools-block |
| `focusInput` | 33 | generell listnavigering (roving focus) — INGEN kompositor-genväg |
| `"id":"…focus…"` (defaultBindings) | 0 | ingen global fokus-genväg |

`blur`-träffar är CodeMirror-redigerarinterna. **Appen litar på normal
Chromium-fokusroutning**: X-tangentbordsevent → toplevel → den DOM-nod som
har fokus. Utebliven text betyder att kompositorns textarea aldrig fick
DOM-fokus (klicket miss) — inte att appen aktivt släpper/fångar fokus.
IMF/Electron-fokus-teorin från uppdraget står alltså **utan belägg** i
appens kod.

Mobilgaten (DESK-U11 F3: `inputRoutingMode!=="reject" && !(isWebRemoteControl
&& isMobileTextInputViewport)`) kräver `(pointer:coarse) and (hover:none)` —
XTEST-mus är en riktig mus ⇒ gallen kan ALDRIG trigga på detta skrivbord.

## 5. LEVERANSLAGER — teckenvägen

- `xdotool version` → **3.20160805.1**. Beteende: `type`/`key` **utan**
  `--window` = XTEST-fake-event (ser ut som hårdvara — Chromium tar emot).
  **Med** `--window` = XSendEvent (märks syntetiska) — **Chromium släpper
  dem** (xdotools egen dokumentation varnar för att appar vägrar syntetiska
  event). Om något av de 6 försöken använde `--window` är DET ensamt nog
  som rot för det försöket.
- XTEST finns på servern (`xdpyinfo`: 24 tillägg, XTEST med).
- Tangentkarta: ASCII komplett (`xmodmap -pke`: keycode 9 = Escape,
  10 = 1/exclam …). **Svenska tecken saknas** (aring/adiaeresis/odiaeresis
  = 0 träffar) ⇒ `type 'åäö'` kan inte mappas — teststrängar MÅSTE vara ASCII.
- Tangentkarta-rädslan var en falsk alarm i sonden: "0 keysyms" berodde på
  att utdataformatet säger `keycode`, inte `keysym` (dokumenterat för
  ärlighetens skull).

## 6. HISTORISKA FELSYMPTOM

- `windowactivate` gav en gång `XGetWindowProperty[_NET_ACTIVE_WINDOW]
  failed` — läsning av rotens EWMH-egenskap innan den fanns: symptom på
  timing i omstartsfönster (Xvnc+openbox startade 20:58; app-omstart 22:02).
  Ej en egen rot, men bevisar att minst ett försök körde i instabil
  EWMH-fas.
- Fönster-ID är epokbundna: ett annat sessionsprotokoll refererar
  **0x600001** (förra instansen); nuvarande instans = **0x400003**. Hård-
  kodat ID i ett skript dör vid app-omstart → `windowfocus <gammalt-id>`
  gör inget vettigt.
- **Gräns (ärlighet):** de EXAKTA kommandona för de 6 försöken kunde ej
  passivt återvinnas — db.sqlite-ytorna som bundna greps returnerar domineras
  av denna utrednings egna sessionstext; worklog ROND 310 ger mönstret
  "3 försök: rå klick + zoomkompenserade" per epok. XSendEvent-spåret kan
  därför varken bevisas eller avskrivas för historiska försök.

## 7. ROT-SYNTES — FYRA LAGER

| Lager | Status | Dom |
|---|---|---|
| 1. X-fokus (server→fönster) | HEL just nu; historiska timing symptom | **Inte roten** (men aktiv vid framtida försök: verifiera alltid) |
| 2. Klick→DOM-fokus (kompositorn) | (a) 1080-epoken: klickavvikelse belagd av v202-u1; (b) 540-epoken: 100 px-översvämning belagt, kompositorns exakta pixeläge OPASSIVT BELAGGBAR (se § 8) | **PRIMÄR ROT** |
| 3. Teckenleverans (XTEST vs XSendEvent, keymap) | mekanism klar; historisk --window-användning okänd | **Sekundär risk** — eliminera i nästa försök genom att ALDRIG använda --window |
| 4. Appens egen fokusmanipulation | ingen påvisad i app.asar | **Friad** (passivt) |

## 8. BEVISGRÄNSER

1. **Bildinput saknas i denna agentkonfiguration** — skärmdumpen
   `/tmp/u14-skarm.png` (960x540, 55 548 B, tagen 22:11 med
   `DISPLAY=:10 import -window root`, PASSIV pixelavläsning) kunde inte
   visas av modellen ("media omitted — model does not support image
   input"). Huvudsessionen med bildinput KAN läsa den och därmed belägga
   kompositorns exakta pixeläge (finns kvar i /tmp tills omstart; ALDRIG
   committad — kan innehålla kundens chatt).
2. Kompositorns position "i den översvämmade zonen" är därför **stark
   hypotes** (dockad i botten + 640-fönster + 540-skärm), inte ögonbelagt.
3. Historiska försökskommandon ej återvunna (§ 6).
4. AT-SPI/a11y-bussen ej aktiv (`busctl --user list` → inga a11y-namn) ⇒
   ingen alternativ körväg idag; ej heller testad (skulle kräva anslutning
   = aktivitet).

## 9. NÄSTA SEKVENS FÖR SESSIONEN (exakta kommandon, i ordning)

> OBS: detta är REKOMMENDATION — utredningsagenten har (rättigt) inte
> kört dem. Kur A ändrar kundens skärmgeometri (desk-infra-yta, E42:s
> ägande) — vid tvekan: konkalla rond.

**Kur A (rekommenderad rotkur — gör kompositorn nåbar):** växla skärmen
till ett läge som rymmer appens 640-minimum, i drift utan omstart:

```
xrandr -d :10 --output VNC-0 --mode 1024x768     # ALDRIG 800x600/640x480 (<640!)
# alternativ 16:9: --mode 1280x720
```

openbox maximerar om ZCode-fönstret automatiskt ⇒ hela fönstret syns.
(RandR-lägen verifierade passivt: 1024x768, 1280x720, 1280x800, 1360x768 …
 alla ≥640. Observera bandbredds-kostnaden: 1024x768 = +52 % pixlar mot
 960x540 — telefon-först-kompromiss.)

**Sedan körningen (alltid färska ID:n, aldrig hårdkoda):**

```bash
W=$(DISPLAY=:10 xdotool search --class zcode)          # dynamiskt ID
DISPLAY=:10 xdotool windowactivate --sync "$W"          # vid "XGetWindowProperty failed":
                                                        # sleep 5 och kör igen (EWMH-uppstart)
DISPLAY=:10 xdotool getactivewindow                    # verifiera = "$W"
DISPLAY=:10 xdotool getwindowfocus                     # verifiera = "$W"
DISPLAY=:10 xdotool getwindowgeometry --shell "$W"     # notera WIDTH/HEIGHT
# kompositorns centrum ≈ (WIDTH/2, HEIGHT-60); vid 1024x768 → (512, ~708)
DISPLAY=:10 xdotool mousemove 512 708 click 1           # DOM-fokus i textfältet
sleep 0.4
DISPLAY=:10 xdotool type --delay 150 'robotfocus-u14-test-ascii'   # UTAN --window! ENDAST ASCII
DISPLAY=:10 xdotool key Return                          # Enter = skicka i musdrivet läge (F3 kräver touch)
```

**Bevis:** grep `robotfocus-u14-test-ascii` i `~/.zcode/cli/rollout/` + db,
eller skärmdump före/efter. **Fallback** om texten ändå uteblir:
Tab-navigering (`xdotool key Tab`, UTAN `--window`, ett i taget med
dumpkontroll mellan) — ALDRIG `key --window`/`type --window` (Chromium
släpper syntetiska event).

**Kur B (utan geometribyte, mindr robust):** flytta upp fönstret
`xdotool windowmove "$W" 0 -100` — openbox maximering kan dock sätta
tillbaka det; Kur A är sanningen.

## 10. KVD

- Passiv endast: inga type/click/key/mousemove kördes av denna agent; inga
  processer startades/stoppades; ~/.zcode endast läst (db-greps).
- Skärmdump i /tmp, ALDRIG committad (kundens chatt kan synas).
- src/ orörd · R2 orörd · data/blogg orörd · desk-halsa.mjs:s ocommittade
  ändringar RÖRDA EJ (annan agents yta) · commit med explicit pathspec.

RESULTAT: rot hypotes-belagd (lager 2: 1080-epoken klickavvikelse belagd av v202-u1 + 540-epokens 100 px-översvämning belagd; kompositorns exakta pixeläge obelagt pga saknad bildinput) + nästa sekvens: Kur A `xrandr -d :10 --output VNC-0 --mode 1024x768` + `search --class zcode` + `windowactivate --sync` + `mousemove 512 708 click 1` + `type --delay 150 'robotfocus-u14-test-ascii'` (UTAN --window) + `key Return`
