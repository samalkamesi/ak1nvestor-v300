# DESK-U24 — BERÖRINGSGAP: exakt vad som ej fungerar nativt i dagens lösning, och varför (ur källan)

**Fabrikuppdrag:** v210-u2 (VÅG 210 DESK STORSKRIDA, roll GRANSKARE) ·
**Datum:** 2026-09-29 (skrivet ~03:50–04:20 UTC) · **Ägarskap:** ENDAST detta
protokoll — inga främmande filer har rörts.

**Kundens upplevelse (ordagrant, ur v210-manifestet):** "100 % flexibilitet…
exakt samma som riktiga z code… **kan ej förstora bilder, ej röra som riktigt**".

**Granskade källor (primärkällor, lästa ej ändrade):**
`/home/ak1a/desk-web/` (ak1a-ägd webbrot, utanför git enligt D3-rätten i
DESK-U23-VYZOOM-ORIENTERING): `core/rfb.js` (122 KB, noVNC-kärna),
`core/input/gesturehandler.js`, `core/display.js`, `app/ui.js` (74 KB, AK1A-
anpassat), `vnc.html` (AK1A-skal). Alla radreferenser nedan gäller exakt de
filer som låg i trädet 2026-09-29 (rfb.js mtime 2026-09-28 15:04, ui.js
2026-09-29 01:31 = efter U23-leveransen).

**Parallellitet-notis:** u1:s djuputredning `DESK-U23-KASMVNC.md` var EJ
färdig vid mitt skrivande (vi körs samtidigt). KasmVNC-kolumnen nedan bygger
på egna källkontroller (README raw på GitHub, kasm.com-produktsida,
GitHub-issue #329) — installations- och migreringsdetaljer hänvisas till u1.

---

## § 0 Sammanfattning för kunden (icke-teknisk)

Dagens lösning översätter allt finger-tryck till **musrörelser i fjärr-
datorn**. Nyp med två fingrar blir inte "förstora" — det blir
**Ctrl+mus-hjul inne i programmet på servern**. Om programmet därinne (som
Z-Code-fönstret) inte lyssnar på Ctrl+hjul, händer det kunden upplever:
**ingenting alls**. Förstoringen som FUNGERAR i dag är våra egna +/−-knappar
(DESK-U8/U22) — de förstorar *bilden av* skrivbordet, och den vägen är helt
frånskild från nyp-gesten i koden. "Röra som riktigt" fungerar inte heller:
ett tryck blir ett musklick först när fingret släpps, rörelser under ~50 px
ignoreras, och fjärrdatorn ser aldrig en pekare — bara en mus. Detta är
medveten design i noVNC (musemuleringsfilosofin), inte ett fel vi råkat göra:
VNC-protokollet som TigerVNC talar har bara mus och tangentbord, ingen touch.

---

## § 1 Kedjan: finger → händelse → RFB-paket → fjärrapp

```
Finger på canvas
  → gesturehandler.js (touchstart/move/end, detekterar gest-typ)   [lag 1]
  → CustomEvent 'gesturestart/move/end' med detail.type            [lag 2]
  → rfb.js _handleGesture(ev) — översätter till mus/tangent        [lag 3]
  → RFB PointerEvent/KeyEvent över websocket                       [lag 4]
  → TigerVNC :10/:11 → X-servern → Electron-appen (Z-Code)         [lag 5]
```

Nyckelraderna: gesturehandler kopplas på canvas i `rfb.js:579`
(`this._gestures.attach(this._canvas)`), instansieras `rfb.js:274`, och rfb.js
lyssnar på de syntetiska gest-händelserna `rfb.js:604-607`. Viktigt: råa
touch-händelser konsumeras redan i lager 1 — `gesturehandler.js:90-91` kör
`e.stopPropagation(); e.preventDefault();` på ALLA touchstart/move/end —
webbläsarens egna gest-tolkningar (rubrik-drag, dubbeltap-zoom) kommer aldvis
fram. Detta är ingen bugg utan förutsättningen för att gesterna ska kunna
 översättas; men det betyder också att webbläsarens nativa pinch-zoom är
ett fjärir som bara kan återinföras med medveten kod.

## § 2 Den exakta översättningstabellen (radreferenser ur källan)

### 2.1 Detektering — `core/input/gesturehandler.js` (state-maskin)

| Gest | Hur den känns igen | Rader |
|---|---|---|
| onetap | 1 finger, släpp < 1000 ms, rörelse < 50 px; känns igen först vid **release** | konst. rad 11, 28 (`GH_TAP_TIMEOUT`), 21 (`GH_MOVE_THRESHOLD`); release-logik 252–327 |
| twotap | 2 fingrar, båda släppta inom 250 ms-fönstret (`GH_MULTITOUCH_TIMEOUT`), övrigt som onetap | rad 25, 288–296 |
| threetap | 3 fingrar, samma mönster | rad 288–296 (case 3 nollställer onetap/twotap-krav) |
| drag | 1 finger, rörelse ≥ 50 px | rad 188–196 (rörelsetröskel), staten GH_DRAG rad 14 |
| longpress | 1 finger stilla ≥ 1000 ms (`GH_LONGPRESS_TIMEOUT`), timer → `gesturestart` | rad 31, 373–391 |
| twodrag | 2 fingrar som rör sig **parallellt** (vinkelskillnad ≤ 90°) eller där gemensam rörelse > avståndsändring | rad 22 (`GH_ANGLE_THRESHOLD`), 207–240, 408–433 (50 ms `GH_TWOTOUCH_TIMEOUT`, rad 34) |
| pinch | 2 fingrar där **avståndsändringen** dominerar över gemensam rörelse | rad 421–429 (`_twoTouchTimeout`: `deltaTouchDistance` > avgMove ⇒ PINCH) |
| ≥4 fingrar | **Ignoreras helt** (`GH_NOGESTURE`) | rad 162–163 |

Ytterligare detekteringsfakta ur källan: nya fingrar under pågående gest
kastas i `_ignored` (rad 115–118, 131–135); alla kvarvarande fingrar efter en
frisläppt gest ignoreras tills alla släppts (rad 330–335); tap-koordinater
för "samma ställe"-dubbeltryck justeras inom 50 px (`rfb.js:55-56`
`DOUBLE_TAP_*`, logik `rfb.js:1299-1316`).

### 2.2 Översättning — `rfb.js _handleGesture` (rad 1323–1488)

RFB-knappmask (ur `_convertButtonMask`, `rfb.js:1057-1075` + de fasta
literalerna i `_handleWheel`): 0x1 = vänster, 0x2 = mitten, 0x4 = höger,
0x8 = hjul upp, 0x10 = hjul ned, 0x20/0x40 = hjul vänster/höger.

| Gest | Beteende i fjärrdatorn | Rader i rfb.js |
|---|---|---|
| onetap | Vänsterklick (0x1) + släpp | 1331–1333 → `_handleTapEvent(ev, 0x1)` 1292–1321 |
| twotap | **Höger**klick (0x4) + släpp | 1334–1336 |
| threetap | **Mitten**klick (0x2) + släpp | 1337–1339 |
| drag | A) `dragViewport=true`: panorerar noVNC-vyn (`viewportChangePos`) — B) normalt: musdrag med vänster knapp ned (0x1 ned vid start 1340–1348, move 1381–1397, släpp 1457–1463) | 1340–1349, 1381–1398, 1457–1463 |
| longpress | Högerklick (0x4); i dragViewport-läge fördröjt till gestens slut | 1350–1361, 1465–1484 |
| twodrag (2-fingerswipe) | Mus-hjul i steg om `GESTURE_SCRLSENS=50` px (rad 54): 0x10/0x8 lodrätt, 0x40/0x20 vågrätt — kvantiserat, aldrig kontinuerligt | 1399–1424 |
| **pinch (nyp)** | **Ctrl NED → hjul-steg (0x10/0x8) per `GESTURE_ZOOMSENS=75` px avståndsändring → Ctrl UPP** — dvs Ctrl+mus-hjul *inne i fjärrappen*, på positionen där gesten startade | 1425–1445 (Ctrl-tangenter 1432/1444, tröskel 1431, steg-loopar 1433–1442) |

Källkommentaren på rad 1400–1402/1426–1428 bekräftar filosofin: *"Always
scroll in the same position. We don't know if the mouse was moved…"* — gesten
låses muscentrerat, inte vycentrerat.

### 2.3 Våra egna ytor (AK1A-tillägg i samma träd)

- **Vy-zoom (DESK-U8/U22), `app/ui.js`:** stegen `[0.85, 1.0, 1.15, 1.3,
  1.45, 1.6]` (rad 27), minne per orientering (rad 33–34), knappar
  `noVNC_view_zoom_in/out_button` med **click**-lyssnare (rad 333–336),
  `applyViewZoom` (1862–1880) sätter `rfb.scaleViewport=false`,
  `rfb.clipViewport=true` och därefter `rfb._display.scale = UI.viewZoom`
  (rad 1878) — samma primitiver som noVNC:s egna autoscale använder
  (`display.js:68-71 scale`, `432-451 autoscale`, `456+ _rescale`).
  **Ingen enda rad kopplar gesturehandler/pinch till denna väg.**
- **Mobil-tangentbordet, `app/ui.js:279-286`:** ett dolt `<input>`-fält
  (`noVNC_keyboardinput`) som hålles fokus vid mus-ner på dokumentet (rad
  292–293); OS-tangentbordets tangenter översätts tangent för tangent via
  noVNC:s Keyboard-klass. Ingen IME-sammanhängande text, ingen
  ordprediktion-flöde in i fjärrappen.
- **Skalet `vnc.html` rad 22:** `<meta name="viewport" … maximum-scale=1.0,
  user-scalable=no">` — webbläsarens nativa pinch-zoom av *sidan* är
  medvetet avstängd (noVNC-standard; annars skulle varje nyp förvränga
  canvasen). Vår zoom-UI + Ctrl+0-återställning: rad 159–196, menyflik
  rad 486.
- **`_updateScale`-fallgropen, `rfb.js:780-788`:** när `scaleViewport=false`
  (vårt zoom-läge) nollställer varje resize `display.scale = 1.0` (rad 782) —
  därför krävdes U22/U23:s orientationslyssnare som läker läget efteråt
  (dokumenterat i DESK-U23-VYZOOM-ORIENTERING.md).

## § 3 GAPEN — vad som ej fungerar nativt, rot i källan, KasmVNC-kolumn, patch-läge

Varje gap: **symtom → rot (fil:rad) → löser u1:s KasmVNC-spår det? →
noVNC-läger-på-lapp (vår kopia) eller serverbyte.**

### GAP 1 — Nyp-zoom förstorar inget: den blir Ctrl+hjul *i fjärrappen*
- **Symtom:** kunden nyp-ökande över en bild/kod i Z-Code → ingen ändring
  alls (Electron-appen lyssnar inte på Ctrl+hjul), eller oväntad app-zoom
  (Chrome-läge) — aldrig förstoring av *vyn*.
- **Rot:** `rfb.js:1425-1445` — pinch-grenen avslutar med
  `_handleKeyEvent(XK_Control_L…)` kring hjul-klick; `display.scale` nås
  aldrig från gest-vägen.
- **KasmVNC:** **Ja, med iOS-förbehåll** — KasmVNC:s webbklient har zoom
  inbyggd i klienten (inte som app-genväg), men GitHub-issue
  [kasmtech/KasmVNC#329](https://github.com/kasmtech/KasmVNC/issues/329)
  (öppen, svarslös, maj 2025, KasmVNC 1.3.4, iOS 18.4.1, Safari/Chrome/DDG):
  pinch-to-zoom **fungerar ej på iPhone**; enda omvägen där är
  sidomenyns Displays/upplösningsval. På Android/andra plattformar saknar
  mina källor bevis åt båda hållen (README påstår endast "Better mobile
  support").
- **noVNC-patch (vår kopia, ingen serverändring):** **MÖJLIG och punktvis
  billig** — i `rfb.js:1425-1445`, byt ctrl+hjul-blocket mot anrop in i
  vy-zoom-vägen (sätt `_display.scale` kontinuerligt, alternativt stega
  `VIEW_ZOOM_STEPS` via en callback till ui.js). Samma primitiver som
  `applyViewZoom` (ui.js:1862-1880) redan använder. Kostnad: vi grenar
  noVNC-uppströms ytterligare (trädets diff bördas vid framtida
  noVNC-synkar).

### GAP 2 — Vy-zoom finns bara som knappsteg, aldrig som gest
- **Symtom:** "förstora" kräver att kunden hittar +/− i menyn (flik ≡),
  diskreta steg, inget flyt.
- **Rot:** `ui.js:333-336` (click-lyssnare), `ui.js:1882-1898`
  (viewZoomIn/Out stegar `VIEW_ZOOM_STEPS`), ingen gest-koppling någonstans
  (jfr § 2.3).
- **KasmVNC:** **Ja, med samma iOS-förbehåll som GAP 1** (samma klient-
  funktion) — plus att KasmVNC-klientens sidebar har egna zoom-/skal-kontroller.
- **noVNC-patch:** **MÖJLIG** — identisk ingreppspunkt som GAP 1 (gest →
  vy-zoom-steg). Kan göras konfigurerbar ("nyp = vy-zoom" som inställning)
  utan att bryta musanvändares Ctrl+hjul.

### GAP 3 — Touchen känns trög och hackig (trösklar + kvantisering)
- **Symtom:** "rör sig inte som riktigt" — små fingerjusteringar ges ingen
  effekt; scroll hoppar i steg.
- **Rot:** `gesturehandler.js:21` (`GH_MOVE_THRESHOLD=50` px innan gest över
  huvud taget avgörs), `rfb.js:53-54` (`GESTURE_ZOOMSENS=75` px per
  hjulsteg, `GESTURE_SCRLSENS=50` px per hjulsteg), `rfb.js:49`
  (`WHEEL_STEP=50`) samt steg-looparnas while-konstruktion (rad 1404–1423,
  1433–1442) — RFB-hjulet är diskret, inte analogt (källkommentar rad
  1254–1256: *"the VNC protocol can't handle a wheel event with specific
  distance or speed"*).
- **KasmVNC:** **Troligen bättre, EJ källbelagt i mina källor** — klienten
  är touch-först, men README nämner endast "Better mobile support" utan
  mått. Räknas därför **inte** som löst förrän riktigt telefonprov (läxan
  r318/r327 i manifestet: inga default-byten utan telefonprov).
- **noVNC-patch:** **DELVIS MÖJLIG** — trösklarna är rena konstanter
  (bytbara i vår kopia); den underliggande diskret-hjuls-semantiken går ej
  patcha bort i klienten (protokollsäggt), men känslan förbättras av lägre
  trösklar + mjukare steg.

### GAP 4 — Tryck är musemulerat: ingen pekare, ingen hover, klick först vid släpp
- **Symtom:** klick känns försenade (gesten avgörs när fingret lyfts),
  hover-lägen saknas (inga verktygstips/menyer som öppnar vid beröring),
  insättning/precision kräver flera försök.
- **Rot:** hela kedjan § 1–§ 2: `gesturehandler.js:252-327` (tap avgörs vid
  release + `GH_TAP_TIMEOUT` rad 28 + `GH_MULTITOUCH_TIMEOUT` rad 25),
  `rfb.js:1318-1320` (`_fakeMouseMove` + ned/up-par). RFB-protokollet har
  ingen touch-/hover-typ alls — TigerVNC-sern ser en mus.
- **KasmVNC:** **NEJ** — KasmVNC talar samma musemulerande grund (X-server,
  pointer-events), skillnaden är klientens tolkningskvalitet, inte
  protokollsparadigmet. Gapet kvarstår efter serverbyte; endast en klient
  med riktig pointer/touch-semantik (eller appens egna webbläge) tar bort det.
- **noVNC-patch:** **EJ PATCHBART i klienten** (protokollsgräns). Smäktningar
  (kortare tap-timeout, koordinat-koalescing) är marginellt möjliga.

### GAP 5 — Gester förväxlas eller dör tyst
- **Symtom:** nyp tolkas ibland som scroll; snabb tvåfingervridning gör
  ingenting; tredje/fjärde fingret under pågående gest " äts".
- **Rot:** `gesturehandler.js:207-240` (vinkelheuristiken ≤/> 90° skiljer
  twodrag från pinch), `rad 34+408-433` (avgörelse sker först efter 50 ms
  `GH_TWOTOUCH_TIMEOUT`), `rad 115-118/131-135` (nya fingrar under aktiv
  gest ignoreras), `rad 162-163` (≥4 fingrar = ingen gest), `rad 330-335`
  (kvarvarande fingrar ignoreras efter den första release).
- **KasmVNC:** **Troligen bättre, EJ källbelagt** — modernare
  gest-maskin i klienten, men inga publicerade mått i mina källor. Räknas
  inte som löst utan telefonprov.
- **noVNC-patch:** **DELVIS MÖJLIG** — heuristik-konstanter och timeout är
  våra att ändra; att skriva hela maskinen om är större arbete med
  regressionsrisk mot pålitlig bas (musläget).

### GAP 6 — Mobil-tangentbordet är ett hackat input-fält, ingen IME
- **Symtom:** skrivande på telefon känns stelt; ingen ordprediktion/IME-
  flöde in i fjärrappen; fokus-krig mellan tangentbord och meny.
- **Rot:** `ui.js:279-286` (`noVNC_keyboardinput`-inputfältet +
  keepVirtualKeyboard vid mousedown, rad 292–293) — tangent för tangent.
- **KasmVNC:** **JA, källbelagt** — README (raw.githubusercontent.com/
  kasmtech/KasmVNC/master/README.md): *"IME support for languages with
  extended characters"* — inbyggt i webbklienten.
- **noVNC-patch:** **DELVIS MÖJLIG** — input-fält-mönstret kan förbättras
  (autofokus-hantering, compose-händelser), men full IME-vidarebefordran
  till RFB-tangenter är betydande arbete i vår kopia.

### GAP 7 — Två tysta zoom-fällor: sidzoom avstängd + scale-nollställning vid resize
- **Symtom:** kunden försöker nypa för att zooma *sidan* — inget (skalet
  låser); efter rotationsbyte/resize kan vy-zoomen tyst försvinna (kurerat
  av U22/U23 men grundbeteendet kvar).
- **Rot:** `vnc.html:22` (`maximum-scale=1.0, user-scalable=no`) samt
  `rfb.js:780-788` (`_updateScale` nollställer `display.scale=1.0` när
  `scaleViewport=false` — rad 782; se DESK-U23-VYZOOM-ORIENTERING.md för
  kurläget vi redan lagt ovanpå).
- **KasmVNC:** **JA för nollställningsfällan** (annan klientarkitektur,
  vy-tillståndet ägs av klientens egna state) — sidzoomen är även där
  avstängd av design (alla VNC-klienter behöver det), men vy-zoomen är
  integrerad och överlever resize.
- **noVNC-patch:** **MÖJLIG** — vi redan äger vnc.html och ui.js;
  `_updateScale`-beteendet kan grenaas i vår rfb.js-kopia (guard: om
  vy-zoom-läge → bevara `display.scale`), priset är uppströms-diff.

## § 4 KasmVNC-källbeläggen (utvärderade 2026-09-29)

1. [github.com/kasmtech/KasmVNC#329](https://github.com/kasmtech/KasmVNC/issues/329)
   — "Pinch-to-zoom on mobile ios phone not working": öppen, noll
   maintainer-svar, KasmVNC 1.3.4 byggd 2025-04-19, iOS 18.4.1
   (Safari/Chrome/DDG), rapporteraren förespeggar sidebar-Displays som
   enda omväg. **Hårt bevis att "nativ pinch-zoom" inte är universell
   sanning i KasmVNC — iOS-hålet måste räknas in i beslutet.**
2. README (master, raw.githubusercontent.com): "Better mobile support"
   (ospecifik), "IME support for languages with extended characters"
   ( GAP 6), "WebCodecs video streaming with H.264, H.265, and AV1
   support" + "WebRTC UDP Transit" (prestanda, u1:s område).
3. Produktsidan [kasm.com/kasmvnc](https://kasm.com/kasmvnc) (301 från
   kasmweb.com): "connects you to your Linux server's desktop from any
   web browser", "No client software install required" — inga
   touch-påståenden alls; marknadsföringen ger inget extra beläge.

Slutsats av källläget: KasmVNC är *sannolikt* bättre på touch, men de
enda hårt belagda vinsterna i mina källor är IME (GAP 6) och
klient-ägd vy-zoom-arkitektur (GAP 7, med GAP 1/2 sannolika men
iOS-komprometterade). Manifestets förväntan "nativ pinch-zoom av vyn"
måste nyanseras i u1:s beslutsprotokoll med issue #329.

## § 5 Patch- eller serverbyte — sammanfattande tabell

| Gap | KasmVNC löser? | Patcha i vår noVNC-kopia? | Kräver serverbyte? |
|---|---|---|---|
| 1 nyp=Ctrl+hjul | Ja*, med iOS-förbehåll (#329) | Ja — rfb.js:1425-1445 → display.scale | Nej |
| 2 zoom bara knappar | Ja*, samma förbehåll | Ja — koppla gest till VIEW_ZOOM_STEPS | Nej |
| 3 tröghet/kvantisering | Obelagt (telefonprov) | Delvis — konstanter; hjulets diskrethet är protokollets | Delvis (codec/latens är KasmVNC:s bord) |
| 4 musemulerad touch | Nej — paradigm kvar i KasmVNC också | Ej patchbart (protokoll) | Ej ens serverbyte; kräver annan input-modell |
| 5 gestförväxling | Obelagt (telefonprov) | Delvis — heuristik/timouts | Nej |
| 6 mobil-tangentbord | Ja — IME (README) | Delvis — mönsterförbättring | Nej |
| 7 tysta zoom-fällor | Ja — klientägd vy-state | Ja — vnc.html/ui.js är våra; rfb.js-gren för _updateScale | Nej |

\* = sannolik grad, inte full bevisning.

## § 6 Rekommenderad läsordning för beslutet

1. Snabbast kundvinst oberoende av serverval: **GAP 1+2-patch i vår kopia**
   (nyp → vy-zoom, ~20-40 rader i rfb.js/ui.js, testbart på telefon direkt)
   — tar kundens värsta smärta "kan ej förstora" utan driftsrisk på
   TigerVNC-serven.
2. u1:s KasmVNC-protokoll läses med #329 som röd tråd: iOS-ändpunkt är
   kundens telefon → piloten MÅSTE telefonprovas innan byte (läxa r318/r327).
3. GAP 4 är enda gapet som inget serverbyte botar — förväntningsstyra
   kunden därefter ("touch blir alltid muslik, aldrig pekare-ekvivalent").

KVD-radreferenser per gest: se tabellerna § 2.1 (gesturehandler.js) och
§ 2.2 (rfb.js) — varje gest har detekterings- och översättningsrader angivna.

RESULTAT: 7 gaper — KasmVNC löser 4 av 7 (GAP 6+7 källbelagt, GAP 1+2 sannolikt men med öppna iOS-hålet github.com/kasmtech/KasmVNC#329); 3 kvarstår (GAP 3+5 saknar källbelagd förbättring — kräver riktigt telefonprov innan de får bokföras; GAP 4 musemuleringsparadigmet sitter i VNC-protokollets natur och kvarstår även efter serverbyte — endast GAP 3/5:s preterenzdel och GAP 1/2/6/7 är patchbara i vår noVNC-kopia utan serverbyte).
