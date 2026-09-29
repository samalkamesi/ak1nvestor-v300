# DESK-U22 — Liggande-läge smidigare UTAN serverbyte (möjlighetsutredning)

**Fabrikuppdrag:** v207-u4 (manifest [fabrik], BYGGARE) · **Datum:** 2026-09-29
**Typ:** MÖJLIGHETSUTREDNING — **INGEN kod implementerad**. Detta dokument är
underlaget; huvudsessionen beslutar **rot-fritt direkt efter leverans**
(ytan är ak1a-ägd: `/home/ak1a/desk-web/` ligger utanför repot, ingen
R2-yta — priser/domän/juridik berörs ej). Före denna rapport fanns inga
DESK-U20/U21-protokoll i mappen; numret kommer från manifestet.

## Utgångsläge (källbelagt)

- **Skrivbordet är porträtt**: `systemctl cat zdesk-xvnc.service` →
  `ExecStart=/usr/bin/Xvnc :10 -geometry 412x915 …` (live-koll 2026-09-29;
  r311:s äldre 960x510-liknande 960x540-geometri är historia, se DESK-U12).
- Telefonen porträtt ≈ 412x915 → strömmen ligger ~1:1 (läsbar).
- Telefonen **liggande ≈ 915x412** → fit-skalning av det porträtta blivet
  = `412/915 ≈ 0,45×` (source: `autoscale` display.js:432-452 väljer
  höjdleden) — alldeles för liten text. Kuren idag = **Förstora (+)**
  (DESK-U8, LEVER): `VIEW_ZOOM_STEPS` 0,85–1,6, clip-läge +
  `Display.scale` (ui.js:1844-1862). Kunden trycker MANUELLT efter varje
  rotation — fungerar, men är ett extra steg varje gång.
- vnc.html:22 låser sidzoom (`user-scalable=no, maximum-scale=1.0`) —
  noVNC:s standardval (pinch ska gå till strömmen, inte sidan) ⇒ +/− är
  den ENDA zoomen kunden har. Desto mer värde i att den självgår.

## Källanalys — vad finns, vad saknas, vad gör källan vid rotation

**(1) Ingen orienteringshantering finns i källan.** Grep `matchMedia |
orientationchange | orientation` över `app/`, `core/`, `vendor/`,
`include/`, `utils/`, `vnc.html` → **0 träffar**. Allt vi behöver lägga
till är nytt — men det hamnar i VÅR yta (ui.js), inte i core/vendor.

**(2) Vår vy-zoom-yta (DESK-U8, komplett karta):**

| Yta | Rader (lästa 2026-09-29) |
|---|---|
| Steg + nyckel `zdesk-vyzoom` | ui.js:27-28 |
| Tillstånd `viewZoom` | ui.js:56, läsning i start ui.js:88 |
| Knappar (svenska etiketter) | vnc.html:179 (+), vnc.html:196 (−) |
| Handlers | ui.js:324-327 |
| Återapplicering per anslutning | ui.js:1211-1214 (`connectFinished`) |
| loadViewZoom (klamp till steg) | ui.js:1817-1834 |
| saveViewZoom → localStorage | ui.js:1836-1842 |
| applyViewZoom (ordning kritisk) | ui.js:1844-1862 |
| Statusrad + isSwedishLang | ui.js:1884-1890, ui.js:1175-1179 |

**(3) NYCKELFYND — rotation nollställer redan idag zoomen (källbevis):**
Källans egen resize-kedja vid storleksändring (rotation ingår —
`ResizeObserver` på `_screen`, rfb.js:284+585):

```
rotation → _screen ändrar storlek → _handleResize (rfb.js:727-744)
  vakten _clientHasExpectedSize (rfb.js:721-725) passerar (storleken ÄR ny)
  → rAF: _updateClip()  → viewportChangeSize → _rescale(this._scale)
                          (display.js:134-173, rad 171 — BEVARAR faktorn ✓)
          _updateScale() → !scaleViewport ⇒ display.scale = 1.0
                          (rfb.js:780-788, rad 782 — NOLLSTÄLLER faktorn ✗)
```

Vårt zoom-läge är exakt `scaleViewport=false` (ui.js:1858), så rad 782
slår till: **efter varje genuin storleksändring (rotation, fönsterstorlek
på dator) återgår strömmen till 1,0 medan `UI.viewZoom` fortfarande säger
t.ex. 1,3** (tillstånd och display isär — nästa + tryck hoppar dessutom
förbi ett steg). Det förklarar kundens arbetsmönster "rotera, tryck +".
**Ärlighetskorrigering av DESK-U8:** protokollets regel "faktorn bevaras
vid fönsterändring — inget återapplicerings-hack behövs" håller bara
fram till `_updateClip`; `_updateScale` kör EFTER i samma rAF och rensar.
U8:s KVD konstaterade själva att live-bevis saknades — detta är
kodläsningsluckan. Slutsats: **(b) är inte bara bekvämlighet — det är
buggbotemedel.** Auto-applicering vid rotation LÄKER också isär-glidningen
(loadViewZoom+applyViewZoom synkar tillståndet igen — båda idempotenta).

## Bedömning per fråga

### (a) Minnas zoom-per-orientering — GENOMFÖRBARHET HÖG

- Två localStorage-nycklar i stället för en, t.ex. `zdesk-vyzoom-staende`
  och `zdesk-vyzoom-liggande` (ASCII, u8:s rå-localStorage-mönster med
  try/catch, ui.js:1836-1842). **Migrering:** gamla `zdesk-vyzoom` läses
  som startvärde för båda riktningarna om de nya saknas — kundens sparade
  1,3 tappas inte.
- Vilken nyckel som gäller avgörs av `window.matchMedia('(orientation: landscape)').matches`
  — ett rent LÄS-värde, ingen lyssnare behövs för (a) i sig.
  `matchMedia` + orientation-frågan stöds av alla aktuella webbläsare
  (iOS Safari ≥ 9, Android Chrome/WebView, Firefox; kundens telefon är
  modern — samma kravnivå som noVNC själva har: källan kräver t.ex.
  ResizeObserver, rfb.js:284).
- Spar-logiken flyttas in i viewZoomIn/viewZoomOut (ui.js:1864-1880):
  spara till DAGENS riktning. Klampen till närmaste steg (ui.js:1822-1829)
  återanvänds oförändrad per nyckel.
- **Risk: LÅG.** Samma yta som U8 (ui.js + högst obefintliga vnc.html-
  rör), ingen core/vendor, inget nytt API-beroende utöver matchMedia-read.

### (b) Auto-zooma vid orientationchange — GENOMFÖRBARHET HÖG (med en timing-regel)

- Lyssnaren: `matchMedia('(orientation: landscape)')` + `change`-event
  (standardvägen; `window.orientationchange` är depricerad men fungerar
  som fallback). MediaQueryList.`addEventListener` saknas endast i
  Safari < 14 (2020) → paradera med `addListener`-gren, två rader.
- **Timing-regeln (viktig):** både orientationchange och matchMedia-change
  avfyras FÖRE nya layoutmått på iOS, och källans resize-kedja (steg 3
  ovan) avslutar sitt jobb i en requestAnimationFrame. Vår återapplicering
  måste landa EFTER den — enklast: `setTimeout(≈250 ms)` efter
  orienteringsbytet, sedan `UI.loadViewZoom(); UI.applyViewZoom();`
  (båda idempotenta, redan bevisade i connectFinished-vägen ui.js:1214).
  Känns 250 ms som för långt vid felläge: en extra säkerhets-applicering
  vid ~700 ms är gratis (idempotent) — bälte och hängslen.
- Beteende: rotera till liggande → senast valda LIGGANDE-zoom appliceras
  automatiskt + statusrad "Vy: 130 %" (showViewZoomStatus, svensk via
  isSwedishLang). Rotera tillbaka → porträtts-zoomen (ofta 1,0 = kundens
  egna inställningar återfås via applyResizeMode-grenen, ui.js:1847-1852).
- **Risk: LÅG-MEDEL.** Enda osäkerheten är ordningen mot källans rAF —
  motverkad av fördröjningen + idempotens. Inga core/vendor-rör.

### (c) Tydligare svensk hint vid första liggande — GENOMFÖRBARHET HÖG

- Källans `showStatus(text, 'normal', ms)` (ui.js:486+, visas med
  automatisk döljning — U3 använder redan 5000 ms-vägen ui.js:1205) +
  `isSwedishLang()` (ui.js:1175-1179) + étt localStorage-flaggnyckel
  (t.ex. `zdesk-vyzoom-hint-liggande`, try/catch).
- Hook: samma orientation-lyssnare som (b). Första liggande läget
  (flaggan osatt) → svensk rad, ~8 s, exempel:
  "Liggande läge: vyn förstoras nu automatiskt — ändra med Förstora (+)
  / Förminska (−) i panelen (⌨)." Utan (b) implementerad vore texten
  istället "…tryck på ⌨ och sedan Förstora (+) för större text" — men
  (b) rekommenderas, se nedan.
- Ärlighetsnot: showStatus vägrar skriva över synliga fel/varningar
  (ui.js:493-503) — visas ett rött fel just då uteblir hinten. Acceptabelt:
  hinten är engångs-utbildning, felet är viktigare. Vid nästa rotation
  kommer hon igen (flaggan sätts först när hinten faktiskt visats).

## Rekommendation: a + b + c SOM EN leverans

De tre delar delar **en** orientation-lyssnare och (b) behöver (a):s
per-riktning-data, (c) behöver (b):s event — naturlig enhet, ~60-80 rader
i ui.js (inget alls i vnc.html om knappelementen lämnas orörda). MED (b)
i paketet botas samtidigt dagens tysta nollställning vid rotation (nyckelfynd
3) — den skullen kvarstår annars. Leveranssätt = u4/u8:s mönster:
websockify serverar desk-web som statiska filer, ändringen blir LIVE utan
omstart; spårbarhet via sha256 i protokollet; core/**, vendor/**,
defaults.json, mandatory.json orörda (KO-regeln).

**OBS för beslutande session:** denna utredning är underlaget —implementationen
beslutas rot-fritt (ak1a-ägd yta, ingen kundveto-yta), men den SKA
protokollföras som DESK-U22-implementation med före/efter-sha256 enligt
u8:s mönster och manuell testplan nedan.

## Manuell testplan (vid framtida implementering, ~2 min)

1. Porträtt: tryck + två gånger → "Vy: 130 %". Rotera till liggande →
   inom ~0,5 s: liggande-zoomen appliceras (första gången 1,0/porträttvärdet,
   andra gången det du valt i liggande). Statusraden visar procenttalet.
2. I liggande: tryck + till 145 %. Rotera tillbaka → portrått återfår sitt
   egna värde (t.ex. 130 %), INTE 145 %.
3. Stäng fliken, öppna igen, anslut, rotera → senaste värdena per riktning
   återkommer (localStorage).
4. Första-liggande-hinten visas en gång på svenska, ~8 s, och aldrig mer.
5. Klickprecision i auto-zoomat liggande: tryck på en liten knapp i
   strömmen — den under fingret ska reagera (mekaniken är U8:s bevisade;
   auto-applicering ändrar ingenting i klickmatematiken, samma kodväg).
6. Felväxling: koppla bort nätverket, rotera → inget kraschar (lyssnaren
   skyddar med `if (!UI.rfb) return`-mönstret, samma som applyViewZoom
   ui.js:1845).

## KVD (källbelagd utredning — inga filer ändrade i desk-web)

- Radbevis: ui.js 27-28/56/88/324-327/486/1175-1179/1211-1214/
  1817-1890 · rfb.js 284/585/721-744/748-778/780-788 · display.js
  68-71/134-173/175-187/432-472 · vnc.html 22/179/196 · systemd
  `zdesk-xvnc.service` ExecStart (412x915, live 2026-09-29).
- Nollställningskedjan genomgången rad för rad ovan (nyckelfynd 3).
- `node --check` ej aktuell (inget skrivet); ÄNDRINGAR I DESK-WEB = 0 st.
- Juridik: ren verktygsfunktion i klientens UI — ingen finansiell text
  (2007:528 berörs ej); localStorage = UI-inställning, ej personuppgift,
  ej kaka (u4:s GDPR-linje, samma som U8).

## Registrering

Commit i /home/ak1a/AK1 (desk-web utanför repot): endast detta protokoll.

RESULTAT: rekommendation a+b+c som en leverans (genomförbarhet hög)
