# DESK-U11 — Appens egna responsiva krafter: kan ZCode visa mobil layout?

**Fabrikuppdrag:** v203-u1 (BYGGARE, Forskning A) · **Datum:** 2026-09-28
**Kundfrågan bakom:** kunden jämförde telefonen ("allt ser litet ut" i strömmen)
mot ZCode nativt ("helt annorlunda", stort och läsbart). Skrivbordet körs nu
960×540 i telefonläsbar skala. **Fråga:** kan APPEN GÖRA MER själv vid smal
bredd — finns responsive breakpoints, compact/mobile-läge, sidebar-kollaps,
anpassningsbara tätheter? **Ärlighetsregel:** ej belagt = ej påstått.

## Sammanfattning

JA — ZCode 3.14.3 har en egen responsiv v4-UI med **två bevisade
breddtrösklar i huvudfönstret: 640 px och 768/1024 px (CSS-px)**, plus en
telefon-gate på 767 px som kräver pekskärm. Under 640 px blir dialoger
nästan helskärm ("sheet"-mönster) och kolumnlayouter staplas. Sidopanelen
kollapsar INTE automatiskt vid smal bredd — men är manuellt fällbar
(Ctrl/Cmd+B) och storleksändringsbar. Det starkaste reglaget är
`desktopZoomLevel`: zoomen bestämmer **hur många CSS-px fönstret "ser"**,
och därmed vilken brytpunkt som triggar. Optimal mobil-likt läge utan
extrem zoom: **720 px fönsterbredd vid zoomLevel 1 ⇒ 600 effektiv bredd**
— slår både 640- och 768-trösklarna. Ingen "compact-mode"/densitetsinställning
finns.

## Källor och metod (källtripp: källa · mönster · bevis)

| # | Källa | Metod | Bevis |
|---|---|---|---|
| K1 | `/tmp/.mount_ZCode-ej3JV2/resources/app.asar` (levande montering av körande `/home/ak1a/ZCode-3.14.3-linux-x64.AppImage`, appens zygote-process kör därifrån) · 326 913 762 byte · **sha256 `fa5e1c09…4963bf`** · produkt `@zcode/desktop` "ZCode" **version 3.14.3** (utläst ur asar-headerns package.json) | `strings -n 6` → 4 231 925 strängar (298 MB, sparad i `/tmp/u11/asar-strings.txt`); kontext via node-indexOf (`/tmp/u11/ctx.mjs`) | citat nedan med strängfilens byte-offset `@n` |
| K2 | `~/.zcode/v2/setting.json` (1790 byte, **ENDAST läst**) | Read | citat nedan |
| K3 | Monteringskatalogen `/tmp/.mount_ZCode-*` (7 st, 5 döda FUSE-ändpunkter vid sondtillfället — monteringar är kortlivade; nästa läsare måste hitta levande montering) | ls/ps | se K1 |

Census-första steget (K1): `@media` 163 · `max-width` 289 · `min-width` 244 ·
`matchMedia` 111 · `isMobile` 201 · `sidebar` 581 · `collapse` 1 937 ·
`compact` 816 · `narrow` 764 · `zoomLevel` 67. Merparten är biblioteksbrus
(se källkritik) — nedan redovisas endast **appens egna** mekanismer.

## F1–F10: Appens EGNA responsiva krafter (belagda)

### F1 — Dialoger blir mobila "sheets" under 640 px (Tailwind `max-sm`)
**Bevis (K1 @285850179):** appens kompilerade Tailwind-v4-CSS:
`@media not all and (width>=40rem){.max-sm\:flex{display:flex}
.max-sm\:h-\[calc\(100vh-1rem\)\]{height:calc(100vh - 1rem)}
.max-sm\:w-\[calc\(100vw-1rem\)\]{width:calc(100vw - 1rem)}.max-sm\:w-full{width:100%}
.max-sm\:basis-full{flex-basis:100%}.max-sm\:grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
.max-sm\:flex-col{flex…`
**Tolkning:** under 40 rem (=640 px vid rotfont 16 px; ingen
html-åsidosättning av rotfonten påträffad i app-CSS) blir paneler/dialoger
kant-till-kant med 1 rem marginal, kolumner staplas till en, flex-riktning
blir vertikal — ett äkta mobil-"sheet"-mönster i appens egen UI.

### F2 — Layout ovanför 640 px (`sm:`-klasser, app-författade i JSX)
**Bevis (K1 @291611831, onboarding-ytan):** `mt-8 grid grid-cols-1 gap-3
sm:grid-cols-2 [@media(max-height:740px)]:mt-5 …` — knapprader är 1 kolumn
på mobil, 2 kolumner ≥640 px.
**Bevis (K1 @285851349, genererad CSS):** `.sm\:hidden{display:none}` —
element som bara syns UNDER 640 px (mobil-endast) finns i appen.
**Bevis (K1 @285850800):** `@media (width>=40rem){.sm\:inset-4{…}.sm\:top-20{…}
.sm\:right-4{…}.sm\:bottom-4{…}}` + `.container`-taket 40/48/64/80/96 rem
(@285616835) — ovanför 640 px flyter paneler in med marginaler.

### F3 — Telefon-gate 767 px: Enter-tangent + inmatningsdirigering (KRÄVER touch)
**Bevis (K1 @287628367–@287629136):** konstant
`Aet="(max-width: 767px) and (hover: none) and (pointer: coarse)"` med
hookarna `Net()/Pet()/PR()` (React-state `isMobileTextInputViewport`), och:
`Fet({isMobileTextInputViewport:e,preferEnterNewline:t}){return !(t&&e)}`
(Enter = radbryt i stället för skicka i mobilvy),
`x1e({inputRoutingMode:e,isMobileTextInputViewport:t,isWebRemoteControl:n})
{return e!=="reject"&&!(n&&t)}` (inmatningsdirigering avstängd i mobilvy vid
webb-fjärrstyrning; `isWebRemoteControlV4AppVersion` @250237201 bekräftar att
webb-fjärrfunktionen finns), samt `FR({avoidIosInputFocusZoom:e}){return e?
"text-mobile-input-safe leading-6":"text-ui-base leading-5"}` (iOS-zoom-vid-
fokus-undvikande via särskild textklass).
**Viktig begränsning:** gallen kräver `pointer:coarse` + `hover:none` —
musdrivet Contabo-skrivbord triggar den ALDRIG, oavsett hur smalt fönstret
görs. Endast från riktig telefon (t.ex. via appens webb-fjärrstyrning).

### F4 — Chattens markdown-tabeller anpassar täthet efter bredd (768/1024)
**Bevis (K1 @287236567 + @253...-regionens bundle):** appens EGEN chatt-vy
(`[data-testid="chat-view"]`, `[data-markdown-table-layout-root="true"]`,
`[data-v4-composer-dock="true"]`):
`function LJe(){return typeof window>"u"?TJe:window.innerWidth<768?DJe:
window.innerWidth<1024?EJe:TJe}` med `TJe=32, EJe=16, DJe=8` —
klistriga rullistens insetter för tabeller: 32 px brett (>1024), 16 px
(768–1024), 8 px (<768). Smal fönsterbredd ⇒ kompaktare tabellayout.

### F5 — WebGL-animationen är breddstyrd (1024 px)
**Bevis (K1 @291605626):** `f=window.matchMedia("(min-width: 1024px)")` …
`if(…||document.hidden||!f.matches)return;` i animationsloopen (WebGL-mesh,
`t.TRIANGLES`, tema `meshBase/meshLight`) — den animerade bakgrunden ritar
ENDAST ≥1024 px bred vy (plus ej `prefers-reduced-motion`, sidan synlig).
Under 1024 px hålls den av automatiskt.

### F6 — Höjdkompaktering under 740 px
**Bevis (K1 @291601899–@291612169):** app-författade klasser
`[@media(max-height:740px)]:h-10` (rubrikrad 56→40 px), `[@media(max-height:
740px)]:mt-5/gap-2/min-h-11/py-2` — ytor kompakterar vertikalt när
VYN är lägre än 740 CSS-px. Relevant direkt för telefonström (låg vy).

### F7 — Sidopanel: manuell kollaps + storleksändring (INTE automatisk)
**Bevis (K1 @271646527-regionen):** kommandot `toggleSidebar` med
`defaultBindings:["CmdOrCtrl+B"]` (@253...: `{id:"toggleSidebar",
channel:"window",defaultBindings:["CmdOrCtrl+B"]}`), quickPick-rad
`"quickPick.command.toggleSidebar":"Toggle sidebar"` med ikon
`sidebarClose`/`sidebarOpen` och nyckelord "left sidebar"; i18n-nycklarna
`workspaceSidebar.hideSidebar/toggleSidebar/resizeSidebar`;
splitter-komponent med `sidebarSize/sidebarHidden/minSidebarSize`
(devtools-panel: `sidebarSize:500,minSidebarSize:300`;
källkodsvy: `sidebarSize:200`).
**Ärligt:** noll belägg för AUTO-kollaps vid smal bredd — panelen fälls
manuellt (Ctrl/Cmd+B eller kommandopaletten) och dras i bredd.

### F8 — Zoom: `desktopZoomLevel` — det kopplade läsbarhets-/breddreglaget
**Bevis (K1 @253933458 ff):** `updateDesktopZoomLevel(e,t)`: steg
`t==="in"?+1:-1`, `reset → 0`, appliceras med
`webContents.setZoomFactor(Ft(o))` + IPC `DesktopZoomLevelChanged`;
kommandona `ZoomIn/ZoomOut/ResetZoom` persist-ar via
`settingService.update({desktopZoomLevel:…})` (loggtag `[desktop-zoom]`);
fönstret startas med `pt(e.initialDesktopZoomLevel??0)` (@253987465).
**Bevis (K2):** `"desktopZoomLevel": 1` (nuvarande värde; default i kod 0).
**Gränser:** `setZoomLevelLimits`/`zoomLevelMin` har 0 träffar — appen sätter
EGNA gränser ej i strängarna; Electron/Chromiums dokumenterade standard
(25 %–500 % zoom-faktor) gäller som plattform — markerat som
plattformsdokumentation, ej asar-bevis. Level-steg = ×1,2 (Electron-semantik).

### F9 — Fönstrets gränser och persistens
**Bevis (K1 @253987465):** huvudfönstret skapas
`new uN({width,height, minWidth:480, minHeight:640, …})` med initial storlek
klamrad till arbetsytan (`Qv(e.initialWindowSize, workAreaSize)`) och initial
zoom från inställningen. Separat fönster (devtools-typ, bakgrund `#1e1e1e`):
`width:900,height:600,minWidth:640,minHeight:420` (@253926826).
**Bevis (K1 @250199098):** settingsschema för `desktopWindowSize`:
`{minWidth:320,maxWidth:3840,minHeight:320,maxHeight:2160}` med default
`{width:1280,height:720}`. **Bevis (K1 @253933480):**
`attachDesktopWindowSizePersistence` — resize persist-as med 250 ms
debounce + vid maximize/unmaximize.
**Bevis (K2):** `"desktopWindowSize":{"width":960,"height":640,"maximized":
true}` — fönstret är 960×640 (maximerat); notera att 540 är den VIRTUELLA
skärmens höjd, inte appfönstrets (`minHeight:640` förbjuder 540 högt
appfönster).

### F10 — Inbäddad webbläsare har EGEN mobilvy — men ENDAST den
**Bevis (K2):** `"embeddedBrowserViewportPreference":{"mode":"normal",
"viewport":{"width":393,"height":852},"zoom":"fit"}`.
**Bevis (K1 @250243555):** `sanitizeEmbeddedBrowserViewportPreference`
(schema-validering av nyckeln). 393/852 finns INTE som literal i app.asar —
värdena är kundens/miljöns val, inte påvisad koddefault.
**Svar på frågan "finns motsvarande för HUVUDfönstret?": NEJ — ingen
viewport-emuleringsinställning för huvudfönstret påträffad; där är
`desktopZoomLevel` + `desktopWindowSize` de enda reglagen (F8/F9).

## Källkritik — träffar som INTE är huvudappen (avräknade)

| Träff | Verklig ägare | Bevis |
|---|---|---|
| `isMobile` (201 träffar), `max-width: 600px` (`.htmlreport`, `.subnav-item`, `.test-case-column`) | **Playwright-biblioteket** (contextOptions.isMobile, HTML-rapport-CSS) | @… `contextOptions.isMobile = void 0`, `.htmlreport{padding:0!important}` |
| `NARROW_BREAKPOINT=760`, `.page--mobile`, orbs/hint-pill, `--sidebar-width:239px` (180–632 px), `isCompactOcclusionChrome` | **Medföljande demo-sida/interna testytor** (sidan bjuder HTML `<p class="hint-pill">Everything laid out in JS…click the logos.`; sidebar-CSS:n ligger i csstools/Playwright-regionen) | @1674xxxx–1681xxxx, @202792202 |
| `isNarrow`-träffar om `/Narrow/g.test(name)` | xterm fontdetektering | @… `this.remeasure=(!isStandardFont||isNarrow)` |
| `MIN_ZOOM_SCALE=10/MAX_ZOOM_SCALE=400` | inbäddat kalkylbladsverktyg (`DEFAULT_ZOOM_TAB_KEY`, worksheet) | @23390xxx |
| `Density`-träffar | Babel/Mathematica-liknande stränglistor (bibliotek) | @7198xxxx ff |
| `.max-w-[640px]` | Tailwind-klass för elementbredd — INTE media query | @285655350 |

**Negativa fynd (ärlighet):** ingen "compact mode"/densitetsinställning i
app-UI (inga `Density`/`compactMode`-etiketter); ingen
`useMediaQuery`-lib; inga breddbaserade `matchMedia` i app-JS utöver F3/F5
(övriga är `prefers-reduced-motion`/`prefers-color-scheme`/`forced-colors`/
`display-mode`/`pointer`); ingen auto-kollaps av sidopanelen.

## Resonemang: bredd × zoom = effektiv CSS-px

Chromium: zoom-faktor = 1,2^zoomLevel; vyns CSS-px = fysisk fönsterbredd ÷
faktor. BÅDA huvudtrösklarna (640 Tailwind-rem, 768/1024 app-JS via
`window.innerWidth`) utvärderas mot den effektiva bredden — högre zoom
gör alltså UI:t större OCH "smalare" för layouten, samtidigt.

| Fönster (px) | zoomLevel (faktor) | Effektiv bredd | Triggat (appens egna grenar) |
|---|---|---|---|
| 960 (dagens) | 1 (1,20) | 800 | tabell-inset 16 (768–1024); VARKEN max-sm eller <768 |
| 960 | 2 (1,44) | 667 | <768-tabeller (inset 8) — men ej <640 |
| 960 | 3 (1,73) | 555 | <640-sheet + allt ovan — men 1,73× = mycket stort UI |
| **720** | **1 (1,20)** | **600** | **<640-sheet + <768-tabeller + <1024** med bibehållen 1,2×-läsbarhet |
| 640 | 1 (1,20) | 533 | samma som 720, djupare marginal under 640 |
| 480 | 1 (1,20) | 400 | samma; 480 = fönstrets hårda golv (F9) |

Höjdledden: vid 640 px fönsterhöjd och 1,2× blir effektiva höjden 533 px —
under 740 ⇒ F6:s höjdkompaktering aktiveras också den. Höjden är den trånga
dimensionen i telefonströmmen; `minHeight:640` sätter taket för hur litet
det kan bli (fysiskt).

## Slutsats

1. **JA, appen kan rendera mera mobil-likt själv** — men styrt av
   EFFECTIV bredd (fönster ÷ zoom), inte av fysisk: 640 px är appens
   mobila tröskel (sheet-dialoger, enkolumn, mobil-endast-element, F1/F2),
   768/1024 stegar tabelltäthet (F4), 1024 slår av bakgrundsanimationen
   (F5), 740 px högd kompakterar (F6).
2. **960×540-skrivbordet ligger IDAG mellan trösklarna** (800 effektiv
   bredd vid zoomLevel 1) — därav "allt ser likadant ut bara mindre".
3. **Bästa åtgärd utan att röra inställningar i ~/.zcode** (skrivregeln):
   sätt VIRTUELLT skrivbord/fönster till ~**720 px bredd** och behåll
   zoomLevel 1 ⇒ 600 px effektiv bredd slår 640+768+740-trösklarna på en
   gång. Alternativ på fasta 960: zoomLevel 2 når <768 men aldrig <640 —
   640-sheet-läget kräver level 3 som blir förstorat. 767-pekgaten (F3)
   kan INTE triggas på musdrivet skrivbord.
4. **Optimal bredd: 720 px fönster (600 px effektiv)** — mekanismerna är
   starkt belagda i kod; att just 600 px är "optimalt" är resonemang
   (render-test mot körande app var förbjudet i uppdraget — ingen
   processpåverkan), därav svagt belagt som optimum.

**KVD-källa:** samtliga påståenden ovan bär källtripp (K1/K2/K3 + mönster +
citat med offset) i F1–F10 och källkritik-tabellen; negativa fynd är
sökta och explicit redovisade.

RESULTAT: 10 belagda responsiva krafter, optimal bredd 720px (svagt belagt optimum; trösklarna 640/768/1024/740 starkt belagta)
