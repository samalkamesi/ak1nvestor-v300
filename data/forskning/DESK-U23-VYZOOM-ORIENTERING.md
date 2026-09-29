# DESK-U23 — VYZOOM-ORIENTERING: U22:s rekommendation a+b+c IMPLEMENTERAD

**Fabrikuppdrag:** s11-u3 (BYGGARE, spår 11 DESK A-Ö, "nästa i spåret — rätta
fynd ur DESK-protokollen") · **Datum:** 2026-09-29 01:25–01:35 UTC ·
**Ägarskap:** desk-web/app/ui.js + desk-web/hjalp.html (ak1a-ägd web-rot,
D3-rätten — utanför git, redigerad på plats med före/efter-sha256 enligt
U8/U21:s mönster) + detta protokoll (repot).

**Fynd som rättas:** U22 nyckelfynd 3 ("rotation nollställer tyst zoomen —
rfb.js:782 rensar display-skalan i scaleViewport=false-läget; tillstånd och
display glider isär; kundens arbetsmönster 'rotera, tryck +'") + U22 §a/§c
(minne per orientering, engångs-hint) + U20:s beslutsnotering ("hjälpsidans
länkar bör få autoconnect=1&resize=remote för att vara testbara").

**Val-motivering (uppdraget bad mig välja själv):** worklog + mtime bevisar
att U22-implementation INTE var levererad (ui.js orörd sedan U8-leveransen
2026-09-28 20:46; U22 är möjlighetsutredning med "INGEN kod implementerad").
U19-steg 1 (port 6080) är rot-ägt och redan delvis landat (U20:s
systemd-utdrag visar 127.0.0.1-bindning); steg 3/5 är huvudsessionens; steg 7
vilande på strömmätartal (U21 §4.2). U22 a+b+c är det enda fullständigt
förberedda ak1a-ägda byggarobjektet — genomförbarhet hög, ~60–80 rader,
testplan färdig.

---

## 1. Vad som levererats (tre delar, EN orientation-lyssnare — U22 §"en leverans")

### (a) Zoom-minne PER ORIENTERING (U22 §a)

- Två localStorage-nycklar: `zdesk-vyzoom-staende` (porträtt) och
  `zdesk-vyzoom-liggande` (liggande) — ASCII-nyckelnamn exakt enligt U22.
- **Migration:** första läsningen i en riktning saknar ny nyckel ⇒ sås från
  gamla `zdesk-vyzoom` (loadViewZoom: `raw === null` ⇒ läs legacy). Kundens
  sparade 1.3 tappas aldrig; klampen till närmaste steg (U8) oförändrad.
- `saveViewZoom` (anropad ur viewZoomIn/viewZoomOut) skriver till DAGENS
  riktning — den andra riktningens värde lämnas orört.
- Nyckelval: `UI.viewZoomKey()` = `UI.isLandscape() ? LIGGANDE : STAENDE`;
  `isLandscape()` = rent LÄS av `matchMedia('(orientation: landscape)')`
  med geometri-fallback (`innerWidth > innerHeight`) om matchMeta kastar.

### (b) Auto-zoom vid rotation (U22 §b — botar nollställningsbuggen)

- `UI.addOrientationHandlers()` installeras i UI.start:s handler-sektion:
  `matchMedia('(orientation: landscape)')` + `change`; Safari < 14-parering
  med `addListener`-gren (U22:s två rader).
- `UI.onOrientationChange()`:
  - `!UI.rfb` ⇒ `loadViewZoom()` in i minnet och return — nästa
    connectFinished (U8:s rad) applicerar RÄTT riktningens värde; testplan
    punkt 6 (rotation utan uppkoppling kraschar ej) är täckt av samma gren.
  - Upkopplad ⇒ 250 ms-pass: `loadViewZoom + applyViewZoom +
    showViewZoomStatus + maybeShowLandscapeHint` (landar EFTER källans rAF-
    resize-kedja — U22:s timing-regel), + 700 ms-säkerhetspass (idempotent
    par, samma par som connectFinished — "bälte och hängsren").
- **Buggbotemedlet:** U22:s nyckelfynd 3 — rfb.js:780-788 `_updateScale`
  rensar display-skalan till 1.0 vid varje genuin storleksändring i vårt
  `scaleViewport=false`-läge, medan `UI.viewZoom` säger t.ex. 1,3 (isär-
  glidning + nästa + hoppade förbi ett steg). Återappliceringen synkar dem
  igen; kundens "rotera, tryck +" blir "rotera — klart".

### (c) Svensk engångs-hint vid första liggande (U22 §c)

- `UI.maybeShowLandscapeHint()`: liggande + flaggnyckel `zdesk-vyzoom-
  hint-liggande` osatt ⇒ `showStatus(msg, 'normal', 8000)` med svensk rad
  (isSwedishLang-grenen, aldrig blandat språk): "Liggande läge: vyn
  anpassas nu automatiskt — ändra med Förstora (+) / Förminska (−) i
  panelen." Engelsk gren för icke-svenska webbläsare.
- **Ärlighetsavvikelse från U22:s exempeltext (medveten):** "förstoras"
  → "anpassas" (auto-zoomen applicerar den SPARADE faktorn — kan vara 1,0,
  då ljuger "förstoras"); "(⌨)"-glyfen utelämnad (variation i rendering;
  knapparnas synliga etiketter "Förstora (+)/Förminska (−)" citeras i
  stället).
- showStatus:s egen vägran (skriver ej över synligt fel/varning) är
  REPLIKERAD som vakt före anropet ⇒ flaggan sätts ENDAST när raden
  faktiskt visades — ett samtidigt fel stjäl inte engångschansen (U22 §c
  ärlighetsnot, "vid nästa rotation kommer hon igen").

### Bilaga-rättning: hjalp.html entrélänk (U20:s notering)

`hjalp.html:140`: `vnc.html?autoconnect=true&show_dot=true` →
`…&resize=remote`. Motivering: U20:s testbarhetsdom + regressionsskydd —
worklog r314 bevisade defaults-återfallet (fabriksbarn skrev resize="scale"
23:56); explicit param gör kundens entré från hjälpsidan oberoende av
defaults.json och identisk med U20:s acceptansprovs-URL. (U21 §3:s
"parametern struken"-läge var korrekt mot dåvarande kontrakt; U20:s
notering kompletterar med explicit låsning — samma remote-kontrakt, starkare
garanti.)

## 2. Före/efter-bevisning

| Fil | FÖRE (sha256) | EFTER (sha256, 2026-09-29 ~01:31 UTC) |
|---|---|---|
| desk-web/app/ui.js | 33cae489cd33e9d27cde946e741d0e295f7afd2768fabe9563d7b6efedb49b9f | e2a10ab73e5e2dbb7a3d1b700b24634909ce3bfab02b652ab85f3e2cd445c0b9 |
| desk-web/hjalp.html | ee48585bd3a0178e22bb61590030b1baa47d0f0b14323c292552a2dc7dfb1510 | cbe8f0832eacec3511198033c7aff2235cd3b4c1e62e7f1c1fb071ba005c6828 |

- ui.js 69 436 → 74 329 byte (2 097 rader); hjalp.html 7 531 → 7 757 byte.
- **LIVE utan omstart** (U21 §0:s mekanism: websockify serverar från disk):
  `curl 127.0.0.1:6080/app/ui.js` innehåller 7 "DESK-U22"-märken;
  serverade rader bevisade: `:34 VIEW_ZOOM_KEY_LIGGANDE`, `:145
  UI.addOrientationHandlers()` (i start), `:1933 addOrientationHandlers()`,
  `:1963 maybeShowLandscapeHint()` (i 250 ms-passet), `:1976
  maybeShowLandscapeHint()`. `curl 6080/hjalp.html` rad 140 = länken med
  `resize=remote`.
- **Syntax:** `node --check` på modulkopia (/tmp/u23-ui-check.mjs — ui.js är
  ES-modul) ⇒ OK, 0 fel.
- **curl-kvitton:** ui.js=200, vnc.html=200, hjalp.html=200 (6080) ·
  `https://lab.ak1nvestor.com/desk/` utan auth = **401** (bommen lever).
- **desk-halsa.mjs: RESULTAT: 6/6 PASS FÖRE (01:29:34) OCH EFTER (01:32:35)**
  — http-landning-401, fyra systemd-enheter, x-geometri (workarea == xrandr
  current == 412x915, resize-medveten invariant), fönstermaximering,
  webrot-vnc-html, defaults-kontrakt (resize=remote, compression-nyckeln).
  3 auth-SKIP enligt kontrakt (DESK_AUTH ej satt i fabriksbarnet).

## 3. Ytor som ej rörts (KO-reglerna)

core/** och vendor/** = 0 rör. defaults.json orörd (hälsans kontraktskontroll
bevisar innehållet). mandatory.json orörd. vnc.html orörd (knapp-elementen
lämnade som U22 rekommenderar — 21 529 byte oförändrad i hälsans kvitto).
Inga omstarter, inga byggen, inga /etc- eller /usr-ytor.

## 4. Kvarvarande — ärligt

- **Live-telefonprov återstår** (U22:s manuella testplan, 6 punkter, ~2 min
  på kundens telefon): per-riktningsminne, auto-zoomens 0,5 s, localStorage
  över flikomstart, hint exakt en gång, klickprecision i auto-zoomat läge,
  rotation utan nät. Kodläsning + syntax + serveringsbevis bär leveransen;
  webbläsarbeteende på riktig telefon är prognos tills kundens nästa besök
  (samma bevisgrad som U8 levererade med).
- 250/700 ms-timingen är U22:s avverkade bedömning (iOS före-layout +
  källans rAF) — inte mätt på enhet; säkerhetspassen är idempotenta så en
  sen settle fångas ändå.
- Strömmätarens kundbesökstal (U21 §4.2) berörs ej av denna leverans —
  quality 3→6 förblir vilande.

## 5. Juridik

Ren klient-UI-funktionalitet (zoom-minne + statusrad): inget finansiellt
innehåll, inga råd — lagen (2007:528) berörs ej. Priser/tier/domän/
publicering orörda (R2). GDPR/kakor: localStorage-nycklarna är UI-inställ-
ningar i kundens egen webbläsare (u4/U8-linjen) — inte personuppgifter, ej
kakor (LEK 2022:482 berörs ej); ingen data lämnar klienten. Skärmdump togs ej.

## 6. Källförteckning

- K1 = DESK-U22-LIGGANDE.md (§a/§b/§c, nyckelfynd 3, timing-regeln,
  testplanen, nyckelnamnen) · K2 = DESK-U8-VYZOOM.md via ui.js:s U8-rader
  25-28/88/324-327/1211-1214/1817-1890 (lästa i fulltext denna omgång) ·
  K3 = DESK-U20-SETDESKTOPSIZE.md (beslutsnoteringen om hjälplänkar) ·
  K4 = DESK-U21-LATENSIMPL.md (§0 leveransmekanismen utan omstart, §3
  hjalp-länkens läge) · K5 = DESK-U19-RADSDOM.md (steg 7:s villkor — ej
  berört) · K6 = worklog.md (r314 defaults-återfallet 23:56; ROND 315-316).
- Egna mätningar: M1 = sha256 före/efter (tabell §2) · M2 = node --check
  modulkopia OK · M3 = curl-serveringsgrep (7 DESK-U22-markers + rader) ·
  M4 = curl 200/200/200 + 401 · M5 = desk-halsa 6/6 före (01:29:34) och
  efter (01:32:35) · M6 = stat byte/rader före(69 436)/efter(74 329) ·
  M7 = worklog-grep: ingen U22-implementation levererad före detta uppdrag
  (ui.js mtime 2026-09-28 20:46:24 < U22:s födelse 2026-09-29 01:15).

RESULTAT: U22 a+b+c IMPLEMENTERAT OCH SERVERAT (zoom-minne per orientering med migration, auto-zoom vid rotation som botar nollställningsbuggen, svensk engångs-hint) + hjalp-länken låst till autoconnect+resize=remote (U20-notering) — desk-hälsa 6/6 före som efter, curl 200/401, node --check 0 fel; live-telefonprov återstår enligt U22:s testplan
