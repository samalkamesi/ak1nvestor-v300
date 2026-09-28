# DESK-U8 — Vy-zoom-knappar (+ / −) i noVNC-panelen

**Fabrikuppdrag:** v202-u1 (manifest auto-s8, BYGGARE) · **Datum:** 2026-09-28
**Rot:** telefonen skalar ner skrivbordet (1024×576 → ~0,5× på mobil) — små
knappar i strömmen blir svårtryckta (kundrapport: "kunde ej klicka vidare").
Detta är KUREN: ett tryck på **Förstora (+)** gör ALLT i strömmen större i
fasta steg; **Förminska (−)** stegar tillbaka. Bygger vidare på u199:s
knapp-mönster (DESK-U2B) och u4:s defaults (DESK-U4) — samma kod-ytor.

## Leveransyta (ak1a-ägd kopia, ej git-repo — spårbarhet via sha256)

| Fil | sha256 (efter) |
|---|---|
| `/home/ak1a/desk-web/vnc.html` | `1536e5860e8a5eb82acd356240466666a34ee3978906630ea3729f5d0d423459` |
| `/home/ak1a/desk-web/app/ui.js` | `33cae489cd33e9d27cde946e741d0e295f7afd2768fabe9563d7b6efedb49b9f` |

`core/**`, `vendor/**`, `defaults.json`, `mandatory.json` orörda (KO-regeln +
u4:s yta). Ingen ny fil i `app/images/` — ikonerna är inline-SVG i vnc.html.

## Mekanismval — varken body.zoom eller transform:scale (bevisat)

Uppdraget erbjöd två vägar (`document.body.style.zoom` eller containerns
`transform:scale`) men krävde att valet **bevisas funka med
view-dragscrollen i källan**. Källanalysen visar att BÅDA förslagen bryter
noVNC:s klickmatematik:

- Klickinstrumentet är `clientToElement` (element.js:13-31):
  `pos.x = clientX − canvas.getBoundingClientRect().left`, följt av
  `absX(x) = x / display.scale + vp.x` (display.js:175-180).
- Invarianten som håller klick korrekt: **canvasens synliga bredd ==
  display.scale × vp.w**. `_rescale` (display.js:456-472) upprätthåller den
  genom att sätta canvasens `style.width/height` i px.
- Yttre skalning (zoom/transform på body eller #noVNC_container) lägger en
  ANDRA faktor ovanpå: `_screenSize()` (rfb.js:835-838) läser
  getBoundingClientRect i dokumentkoordinater medan canvasens style-px tolkas
  i det zoomade barnets lokala domän ⇒ canvasen renderas fit×z men
  display.scale motsvarar fit ⇒ **tryck landar z× för långt höger/ned**.
  Vid z = 1,3 hamnar klick 30 % snett — exakt det fel vi botar ("kunde ej
  klicka"), förvärrat. FÖRKASTAT (båda varianterna, genomräknat i protokoll-
  processen; samma slutsats för transform på `_screen`).
- VALD väg = källans EGNA primitiver för "större än vyn + panorering":
  **clipViewport-läge + `Display.scale = stegfaktor`** — samma mekanik som
  view-drag-scrollen (rfb.js:1381-1394 `viewportChangePos` via dragViewport,
  ui.js:1466-1498 updateViewDrag). Invarianten håller för godtycklig faktor
  (bounds och scale i samma system), och vid fönsterändring bevaras faktorn:
  `_handleResize → _updateClip → viewportChangeSize → _rescale(this._scale)`
  (rfb.js:735-738 + display.js:171) — ingen autoscale i clip-läget, ingen
  kapplöpning, inget återapplicerings-hack behövs.
- Panorering vid f > 1: `_screen` har `overflow:auto` (rfb.js:223) ⇒
  scrollbars på dator; på mobil visas noVNC:s view-drag-knapp
  (clippingviewport-eventet kedjar updateViewDrag, ui.js:1096) — fingerdrag
  flyttar vyn. Allt enligt källans bevisade mönster.
- Känd avvägning (dokumenterad, ärlighet): i clip-läge är canvasens buffer =
  skärmstorlek, så f > 1 ger mjuk uppskalning (lägre skärpa än
  fit×f-alternativet) — men fit×f saknar mobil-panorering helt och vore
  oanvändbart på kundens telefon. Läsbarhet/tryckbarhet väger tyngst här.

Åtkomsten `UI.rfb._display.scale` använder Display-klassens publika setter
(display.js:68-71) på RFB-instansens display-referens — ingen core-FIL
ändras, inga internal-tillstånd skrivs förbi.

## Steglogik + localStorage

- Steg (fasta, 15 %-poäng): `VIEW_ZOOM_STEPS = [0.85, 1.0, 1.15, 1.3, 1.45, 1.6]`
  (ui.js:27). Tak 1,6 (klienten försvinner aldrig ur vyn — clap i
  viewZoomIn), golv 0,85.
- **'+'** = ett steg upp (ui.js:1864-1871), **'−'** = ett steg ned
  (ui.js:1873-1880). 1,0 = nolläge = kundens nuvarande skalning: då lämnas
  rfb-läget tillbaka till Inställningarnas resize-läge via
  `applyResizeMode()` + `updateViewClip()` (ui.js:1847-1852).
- **Sparas i localStorage, nyckel exakt `zdesk-vyzoom`** (ui.js:28, rå
  localStorage — inte WebUtil:s settings-prefix, enligt uppdraget). Skrivs i
  `saveViewZoom()` (ui.js:1837-1842), läses+klamras till närmaste steg i
  `loadViewZoom()` (ui.js:1817-1833; skräpvärden kan inte återuppstå),
  try/catch för privatläge. **Återställs vid nästa besök**: `UI.start` kör
  `loadViewZoom()` (ui.js:88) och varje `connectFinished` applicerar
  `applyViewZoom()` (ui.js:1214) efter `updateVisualState('connected')`.

## Före/efter — vnc.html (knapparna, u199:s mönster exakt)

FÖRE: `#noVNC_modifiers` slutade efter Ctrl+0-knappens `</button>` (rad 176).
EFTER — **nya rader 177-213**, två knappar efter Ctrl+0-knappen:

```html
<!-- AK1A: view zoom (DESK-U8) — make everything in the
     stream larger/easier to tap, one tap per step -->
<button type="button" id="noVNC_view_zoom_in_button"
    class="noVNC_button"
    title="Förstora vyn (ett steg per tryck, tak 160 %)"
    style="display:flex; align-items:center; justify-content:center;
        gap:8px; width:100%; padding:8px 10px;
        color:var(--novnc-lightgrey, rgb(192,192,192));
        font:14px/1.2 system-ui, sans-serif; cursor:pointer;">
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
        fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <circle cx="10" cy="10" r="7"></circle>
        <line x1="15.5" y1="15.5" x2="21" y2="21"></line>
        <line x1="7" y1="10" x2="13" y2="10"></line>
        <line x1="10" y1="7" x2="10" y2="13"></line>
    </svg>
    <span>Förstora (+)</span>
</button>
<button type="button" id="noVNC_view_zoom_out_button"
    class="noVNC_button"
    title="Förminska vyn (ett steg per tryck, golv 85 %)"
    style="…samma stil…>
    <svg …>…förstoringsglas med bara minustecknet…</svg>
    <span>Förminska (−)</span>
</button>
```

Svenska etiketter + title-attribut (krav); syns i mobilvy precis som
Ctrl+0-knappen (u199:s rationelle). Panelen visas endast när ansluten
(base.css:577) — samma livscykel som övriga extraknappar.

## Före/efter — ui.js (fyra ytor)

1. **Konstanter** (nya rader 25-28, efter LINGUAS): `VIEW_ZOOM_STEPS` +
   `VIEW_ZOOM_KEY = 'zdesk-vyzoom'`.
2. **Tillstånd** (ny rad 56): `viewZoom: 1.0,` + UI.start-läsning
   `UI.loadViewZoom()` (rad 88, efter initSettings).
3. **Handlers** (nya rader 324-327 i `addExtraKeysHandlers`, direkt efter
   u199:s ctrl_zero-rad): click → `UI.viewZoomIn` / `UI.viewZoomOut`.
4. **connectFinished** (ny rad 1214): `UI.applyViewZoom()` efter
   updateVisualState('connected') — återställer sparad zoom vid varje ny
   anslutning/återanslutning.
5. **Funktionsblock** (nya rader ~1786-1890, efter sendCtrlZero):
   loadViewZoom / saveViewZoom / applyViewZoom / viewZoomIn / viewZoomOut /
   showViewZoomStatus. Kärnan:

```js
applyViewZoom() {
    if (!UI.rfb) return;
    if (UI.viewZoom === 1.0) {
        UI.applyResizeMode();      // nolläge = kundens egna val
        UI.updateViewClip();
        return;
    }
    // Ordning viktig: stoppa autoscale (återställer fit) → klipp → förstora
    UI.rfb.scaleViewport = false;
    UI.rfb.clipViewport = true;
    UI.rfb._display.scale = UI.viewZoom;
    UI.updateViewDrag();
},
```

Statusrad efter varje tryck: "Vy: 130 %" (svensk) / "View: 130%"
(annan webbläsare) — u3:s isSwedishLang-mönster, aldrig blandat språk.

## Kodväg (granskbar utan live-anslutning)

```
vnc.html:179  <button id="noVNC_view_zoom_in_button">  (+ rad 196 för '−')
   │ click (vanlig DOM-knapp)
   ▼
ui.js:324-327 addExtraKeysHandlers → viewZoomIn/viewZoomOut
   ▼
ui.js:1864+   stega i VIEW_ZOOM_STEPS (tak 1,6 / golv 0,85)
              → saveViewZoom()  ⇒ localStorage['zdesk-vyzoom']
              → applyViewZoom()
   ▼
ui.js:1844+   rfb.scaleViewport=false → rfb.clipViewport=true
              → rfb._display.scale = f    [Display:s publika setter]
   ▼
display.js:456 _rescale(f): canvas style.width/height = f×vp  [ORÖRD KÄLLA]
   ▼
Klick inuti vyn: element.js:22 pos = clientX−rect.left
                 display.js:175 absX = pos/f + vp.x  ⇒ exakt rätt remote-px
Panorering:     rfb.js:1383 dragViewport → viewportChangePos (mobil,
                view-drag-knappen) / _screen overflow:auto (dator)
```

## KVD-bevis (körda 2026-09-28)

**(a) Syntaxparse av ui.js** (ESM, u199:s mönster):
- `node --check /home/ak1a/desk-web/app/ui.js` → exit 0 → `PARSE-OK-direkt` ✓
- temporär `.mjs`-kopia + `node --check` → `ESM-PARSE-OK` ✓

**(b) Ytan lever:** `curl https://lab.ak1nvestor.com/desk/vnc.html` → **401**
(väntat utan auth) ✓ och `…/desk/app/ui.js` → **401** ✓ — auth-väggen hel.

**(c) Grep-radbevis:** ui.js:27-28 (steg+nyckel), ui.js:88 (loadViewZoom),
ui.js:1214 (applyViewZoom i connectFinished), ui.js:324-327 (handlers),
ui.js:1844-1862 (applyViewZoom), vnc.html:179/196 (knapparna).

**(d) Ärlighetsrad:** visuell zoom kan INTE bevisas live från fabriken
(processpåverkan är förbjuden i uppdraget). Beviset är kodvägen ovan +
följande manuella test. websockify serverar desk-web som statiska filer —
ändringarna är LIVE utan omstart (u4:s leveranssätt).

## Manuell test-procedur för kunden (~1 minut)

1. Öppna skrivbordet (https://lab.ak1nvestor.com/desk/) på telefonen och
   anslut.
2. Öppna kontrollpanelen (strecket i vänsterkant) → tryck på
   extratangents-knappen (⌨-ikonen).
3. Tryck **Förstora (+)** en gång → statusraden visar "Vy: 115 %" och
   ALLT i strömmen blir större. Tryck igen → 130 %, ännu större.
4. Panorera: på mobil — tryck view-drag-knappen (hand-ikonen) och dra med
   fingret; på dator — dra i scrollbars/kant.
5. Tryck **Förminska (−)** tills statusraden visar "Vy: 100 %" — vyn är
   tillbaka i normalläge.
6. Stäng fliken, öppna skrivbordet igen och anslut → senaste zoomtalet
   återkommer av sig självt (sparat i webbläsaren, nyckel 'zdesk-vyzoom').
7. KONTROLL av klickprecision: i förstorat läge, tryck på en liten knapp
   i strömmen — den som ligger under fingret ska reagera (mekanismen håller
   klickmatematiken; om något landar snett är det ett fel att rapportera).

## Juridik

Ren verktygsfunktion i klientens egna gränssnitt — ingen finansiell text,
inga råd (2007:528 berörs ej). localStorage används för en UI-inställning
(skalningsfaktor) — ingen personuppgift, ingen kaka (u4:s GDPR-linje).

## Registrering

Commit i /home/ak1a/AK1 (desk-web ligger utanför repot): detta protokoll +
`studio: v202-u1 vy-zoom-knappar [fabrik]`.
