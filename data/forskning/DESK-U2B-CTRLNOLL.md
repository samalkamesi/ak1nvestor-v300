# DESK-U2B — Återställ zoom-knapp (Ctrl+0) i noVNC-panelen

**Fabrikuppdrag:** F1-b (omgång auto-s6-u2, byggare) · **Datum:** 2026-09-28
**Rot:** u2:s feljakt `DESK-U2B-MOBILFELJAKT.md` fynd F1, allvarlighet A —
nyp-gest på mobil håller ner Ctrl + scrollhjul via core/rfb.js ⇒ användaren
zoomar ZCode-appens text (Chromium-zoom) utan enkel väg tillbaka (Ctrl+0
kräver tre steg på mobil). Detta är KUREN: ett knapptryck = Ctrl+0 till
servern.

## Leveransyta (ak1a-ägd kopia, ej git-repo — spårbarhet via sha256)

| Fil | sha256 (efter) |
|---|---|
| `/home/ak1a/desk-web/app/ui.js` | `2deb7d1ebbc9b31623db525f0030a3e41b35aeb98c433d5ae1c822c36d40ef50` |
| `/home/ak1a/desk-web/vnc.html` | `ef618d22a2093796bc6d4eb921ff4e76765159889f4b69c933167379746cc86a` |

`core/**` och `vendor/**` orörda (paketcopyright + KO-regel). Ingen ny fil i
`app/images/` — ikonen är inline-SVG i vnc.html (ägarskapsregeln hålls).

## Ändring 1 — ui.js: handler-registrering (`addExtraKeysHandlers`)

FÖRE (ui.js:307-309):
```js
        document.getElementById("noVNC_send_ctrl_alt_del_button")
            .addEventListener('click', UI.sendCtrlAltDel);
    },
```

EFTER (ui.js:307-311) — **nya rader 309-310**:
```js
        document.getElementById("noVNC_send_ctrl_alt_del_button")
            .addEventListener('click', UI.sendCtrlAltDel);
        document.getElementById("noVNC_send_ctrl_zero_button")
            .addEventListener('click', UI.sendCtrlZero);
    },
```

## Ändring 2 — ui.js: ny funktion `sendCtrlZero` efter `sendCtrlAltDel`

FÖRE (ui.js:1702-1707, oförändrat kvar):
```js
    sendCtrlAltDel() {
        UI.rfb.sendCtrlAltDel();
        // See below
        UI.rfb.focus();
        UI.idleControlbar();
    },
```

EFTER (ui.js:1714-1726) — **nya rader**: funktionen följer källans eget
mönster i core/rfb.js `sendCtrlAltDel()` (rad 447-452): modifierare ned →
tangent ned → tangent upp → modifierare upp:
```js
    // AK1A: one-tap Ctrl+0 — resets accidental pinch-zoom ( Chromium
    // page zoom ) inside the remote session. Same key-primitives as
    // sendCtrlAltDel() in core/rfb.js: modifier down, key down, key
    // up, modifier up.
    sendCtrlZero() {
        UI.rfb.sendKey(KeyTable.XK_Control_L, "ControlLeft", true);
        UI.rfb.sendKey(KeyTable.XK_0, "Digit0", true);
        UI.rfb.sendKey(KeyTable.XK_0, "Digit0", false);
        UI.rfb.sendKey(KeyTable.XK_Control_L, "ControlLeft", false);
        // See below
        UI.rfb.focus();
        UI.idleControlbar();
    },
```

Konstanter: `KeyTable.XK_Control_L = 0xffe3` (keysym.js:193) och
`KeyTable.XK_0 = 0x0030` (keysym.js:242) — båda redan importerade i ui.js
(import rad 15). `"Digit0"` = KeyboardEvent.code för tangenten 0, samma
kod-namnstil som källans "ControlLeft"/"AltLeft"/"Delete".

## Ändring 3 — vnc.html: knappen i modifiers-panelen, bredvid Ctrl+Alt+Del

FÖRE (vnc.html:156-158):
```html
                <input type="image" alt="Ctrl+Alt+Del" src="app/images/ctrlaltdel.svg"
                    id="noVNC_send_ctrl_alt_del_button" class="noVNC_button"
                    title="Send Ctrl-Alt-Del">
```

EFTER (vnc.html:156-175) — **ny knapp på rad 160-175**, direkt efter
Ctrl+Alt+Del-knappen i `#noVNC_modifiers`-panelen:
```html
                <!-- AK1A: one-tap zoom reset (F1-cure, DESK-U2B) -->
                <button type="button" id="noVNC_send_ctrl_zero_button"
                    class="noVNC_button" title="Återställ zoom (Ctrl+0)"
                    style="display:flex; align-items:center; justify-content:center;
                        gap:8px; width:100%; padding:8px 10px;
                        color:var(--novnc-lightgrey, rgb(192,192,192));
                        font:14px/1.2 system-ui, sans-serif; cursor:pointer;">
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
                        fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="10" cy="10" r="7"></circle>
                        <line x1="15.5" y1="15.5" x2="21" y2="21"></line>
                        <text x="10" y="13.5" text-anchor="middle" font-size="8.5"
                            font-family="sans-serif" font-weight="bold"
                            fill="currentColor" stroke="none">0</text>
                    </svg>
                    <span>Återställ zoom (Ctrl+0)</span>
                </button>
```

Varför `<button>` + inline-stil: etiketten "Återställ zoom (Ctrl+0)" ska
SYNAS i mobilvy — de befintliga ikonknapparnas text finns bara i
`title`-attribut (syns ej på touch). Inline-stilen bor i vnc.html (ägd fil) —
CSS-filer rördes ej. `noVNC_button`-klassen ger befintlig ram/radie/hover.
`#noVNC_modifiers`-panelen är mörk (base.css:581) ⇒ ljus text via
`--novnc-lightgrey` med fallback. Ikon = förstoringsglas med "0" (inline-SVG,
currentColor följer textfärgen). Panelen visas endast när ansluten
(base.css:577 `:root:not(.noVNC_connected) #noVNC_toggle_extra_keys_button
{ display: none; }`) — samma livscykel som Ctrl+Alt+Del-knappen.

## Kodväg (granskbar utan live-anslutning)

```
vnc.html:160  <button id="noVNC_send_ctrl_zero_button">
   │ click (pekare/finger — vanlig DOM-knapp, ingen tangenthändelse krävs)
   ▼
ui.js:309-310  getElementById("noVNC_send_ctrl_zero_button")
               .addEventListener('click', UI.sendCtrlZero)
   ▼
ui.js:1715    UI.sendCtrlZero()
   │  ui.js:1718  UI.rfb.sendKey(0xffe3, "ControlLeft", true)   ← Ctrl ned
   │  ui.js:1719  UI.rfb.sendKey(0x0030, "Digit0",     true)   ← 0 ned
   │  ui.js:1720  UI.rfb.sendKey(0x0030, "Digit0",     false)  ← 0 upp
   │  ui.js:1721  UI.rfb.sendKey(0xffe3, "ControlLeft", false)  ← Ctrl upp
   │  (sedan focus + idleControlbar — identisk epilog som sendCtrlAltDel)
   ▼
core/rfb.js:469  RFB.sendKey(keysym, code, down)   [ORÖRD KÄLLA]
   │  rad 470: guard — returnerar tyst om !connected || viewOnly
   │  rad 478: scancode = XtScancode[code]
   │  rad 480: QEMU ext key event om stött, annars vanlig KeyEvent
   ▼
VNC-servern → ZCode-appens Chromium: Ctrl+0 = återställ sidzoom (100 %)
```

Ordningen på de fyra sendKey-anropen bevaras av WebSocket-meddelandekön —
samma sekventiella mönster som källans egen sendCtrlAltDel (rfb.js:447-452).

## KVD-bevis (körda 2026-09-28)

**(a) Syntaxparse av ui.js** — filen är ES-modul (import-satser):
- `node --check /home/ak1a/desk-web/app/ui.js` → **exit 0** (node 22 parsar
  ES-modul-syntax direkt) ✓
- Temporär `.mjs`-kopia + `node --check` → **ESM-PARSE-OK** ✓
- KVD-formuleringens `new Function(...)` → `SyntaxError: Cannot use import
  statement outside a module` — olämplig just för ESM-källfil (funktionskropp
  är script-läge); ovanstående två kontroller är starkare och gröna.

**(b) Ytan lever:** `curl -s -o /dev/null -w '%{http_code}' https://lab.ak1nvestor.com/desk/vnc.html` → **401** (väntat utan auth) ✓

**(c) Grep-radbevis:**
- `ui.js:309` + `ui.js:310` — handler-registrering
- `ui.js:1715` — `sendCtrlZero() {`
- `vnc.html:160` — `<button type="button" id="noVNC_send_ctrl_zero_button"`
- `keysym.js:242` — `XK_0: 0x0030`

**(d) Ärlighetsrad:** tangentsekvensen kan INTE bevisas live från fabriken
(processpåverkan är förbjuden i uppdraget). Beviset är kodvägen ovan +
följande manuella test.

## Manuell test-procedur för kunden (~30 sekunder)

1. Öppna skrivbordet (https://lab.ak1nvestor.com/desk/) på telefonen och
   anslut.
2. Nyp-zooma medvetet ett par gånger i ZCode-appens text så att den blir
   förstorad.
3. Öppna kontrollpanelen (handtaget vid kanten) → tryck på
   extratangents-knappen (⌨-ikonen med tangentsymboler).
4. Tryck på **Återställ zoom (Ctrl+0)** — texten i Zcode-appen ska omedelbart
   återgå till normal storlek.

## Juridik

Ren verktygsfunktion i klientens egna gränssnitt — ingen finansiell
text, inga råd (2007:528 berörs ej).

## Registrering

Commit i /home/ak1a/AK1 (desk-web ligger utanför repot): detta protokoll +
`studio: v199-u1 Ctrl+0-knapp i noVNC-panelen [fabrik]`.
