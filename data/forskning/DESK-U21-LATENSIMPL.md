# DESK-U21 — LATENSIMPL: U16:s ak1a-ägda lågrisk-reglage verkställda

**Fabrikuppdrag:** v208-u2 (BYGGARE — implementera U16:s ak1a-ägda
lågrisk-låglatensreglage) · **Datum:** 2026-09-29 ~01:05–01:20 UTC ·
**Ägarskap:** ENDAST detta protokoll + desk-web/defaults.json (D3-rätten;
web-roten ägs av ak1a och serveras av websockify `--web /home/ak1a/desk-web`,
U16:226-228).

**Kontext:** U15:s dom — flaskhalsen är LATENS+AVKODNING, ej bandbredd
(U15:76-79). U16 levererade fyndlista + 8 evolutionära steg; detta uppdrag
verkställer raderna med ägare **ak1a** OCH risk **LÅG** i desk-web-klientens
ytor (defaults/vnc.html/ui.js/hjalp.html — ALDRIG core/vendor).

---

## 0. Metod, ärlighet, ägarskap

- Passiva läsningar + ETT skriftligt ingrepp (defaults.json-nyckeldöpning,
  C2-kuren) + curl-kvitton mot websockify (127.0.0.1:6080 — loopback, M1-M5).
- desk-web ligger UTANFÖR git (M6) — leverans där = redigering på plats i
  web-roten med före/efter-hash (U19 steg 2:s metod; U17:s M6-mönster).
  Ingen omstart krävs: websockify serverar filerna från disk och vnc.html
  fetchar `./defaults.json` vid varje sidladdning (vnc.html:57-70, M7) —
  nästa kundsidladdning plockar ändringen; pågående sessioner opåverkade.
- REDAN-IMPLEMENTERAT markeras med bevis och TILLSKRIVS INTE mig (§3-§4).
- ROT-ägda förslag (systemd/Xvnc-flaggor) är INTE rörda — färdig tabell i §6.

## 1. Filtreringen — U16:s samtliga rader mot (ak1a-ägd, LÅG risk)

| U16-rad | Innehåll | Ägare enligt U16 | Risk/grad | Dom för detta uppdrag |
|---|---|---|---|---|
| §6 A1 (rad 305) | Robot-klick-race | Huvudsessionen (cert) | A | Ej desk-web-yta — lämnas |
| §6 A2 (rad 306) | App-min 480×640 | Huvudsessionen (bevis); app-min = leverantören | A | Ej desk-web-yta — lämnas |
| §6 B1 (rad 307) | websockify som root | Root-rond (/etc) | B | **ROT-KÖ §6 R1** |
| §6 B2 (rad 308) | Fönstermålning tvetydig | Huvudsessionen (cert) | B | Ej desk-web-yta — lämnas |
| §6 B3 (rad 309) | Startzoom-race | Root-rond (/usr/local/bin + /etc) | B | **ROT-KÖ §6 R2** |
| §6 B4 (rad 310) | Sömn i stället för poll | Root-rond | B | **ROT-KÖ §6 R3** |
| §6 C1 (rad 311) | SecurityTypes None | Root-rond (beslut) | C | **ROT-KÖ §6 R4** |
| **§6 C2 (rad 312)** | **Död nyckel "compress" — klienten läser "compression"** | **Huvudsessionen (D3-rätten); "nyckeln ägs av desk-web/D3"** | **C = LÅG ("noll funktionell skillnad … förvirringskälla", U16:290-292)** | **VERKSTÄLLD §2** |
| **§6 C3 (rad 313)** | **hjalp.html:137 `resize=scale` kringgår remote-kontraktet** | **Huvudsessionen (D3-rätten)** | **C = LÅG** | **REDAN RÄTTAD §3 (bevis)** |
| §6 C4 (rad 314) | After=network.target kosmetik | — (ingen åtgärd) | C | Inget att göra |
| §7 steg 1 (rad 324) | Instrumentera först; "ev. noVNC-stats-panel i D3-forken" | FABRIK-YTA verktyg/ (U19 steg 4) | Låg | **Landat av annan (§4.1); stats-panelen ej reglage — lämnas som not** |
| §7 steg 2 (rad 325) | Robot-cert v2 | Huvudsessionen | Låg | Ej desk-web — lämnas |
| §7 steg 3 (rad 326) | Acceptansprov remote-resize | Väntar kundbesök | Låg | Ej verkställbart nu |
| §7 steg 4 (rad 327) | Readiness-gated starts | Root-rond | Låg | **ROT-KÖ §6 R3** (samma som B4) |
| **§7 steg 5 (rad 328)** | **quality 3→6 i defaults.json** | defaults = D3-yta, kostnad Låg | Låg MEN **villkorad: "EFTER steg 1:s tal"** | **VILANDE §4.2 (villkoret ej uppfyllt — bevis)** |
| §7 steg 6 (rad 329) | -depth 16 (+ -pixelformat) | Xvnc = root; risk Medel | Medel | **ROT-KÖ §6 R5** |
| §7 steg 7 (rad 330) | B1+B3-kur + omstartsräkning i hälsan | Root + huvudsession | Låg | **ROT-KÖ §6 R6** |
| §7 steg 8 (rad 331) | WebRTC-transport | Arkitekturrond | Hög | **ROT-KÖ §6 R8** (långsiktigt) |

Slutsats filtreringen: exakt **TVÅ ak1a-ägda lågrisk-reglage** finns i U16 —
C2 (nyckeldöpning) och C3 (scale-pinen) — plus ETT villkorat (steg 5
quality). Allt övrigt är rot-, huvudsession- eller leverantöryta.

## 2. C2 VERKSTÄLLD — död nyckel "compress" döpt till "compression"

**Beviskedja att nyckeln var död (M7-M8):**
- Klienten fetchar defaults.json i vnc.html:57-70 och vänder det till
  `UI.start({settings:{defaults}})` (vnc.html:97).
- app/ui.js initierar/ läser ENDAST namnet `'compression'`:
  ui.js:196 `UI.initSetting('compression', 2)` · ui.js:773-774
  (`if (name in UI.customSettings.defaults) defVal = …`) · ui.js:1121+1542
  `UI.rfb.compressionLevel = parseInt(UI.getSetting('compression'))` ·
  core/rfb.js:403-413 (setter 0-9) + rfb.js:2254 (pseudo-encoding mot
  servern). Default är hårdkodad 2 i ui.js:196 — därför "noll funktionell
  skillnad" (U16:291), nyckeln var ren förvirringskälla.
- `grep "'compress'"|"\"compress\""` i app/ + vendor/: **0 träffar** (M9) —
  inget läser någonsin den gamla nyckeln.

**Före/efter-diff (fil: /home/ak1a/desk-web/defaults.json, rad 6):**

| | Innehåll |
|---|---|
| FÖRE (md5 67c59df8b99179a04f8b5ecdc1ba76fe) | `"reconnect": true,` + `"compress": 2` |
| EFTER (md5 7b66b9d90d26407f7e7c6d8a6d39cf57, 2026-09-29 01:14:34 UTC) | `"reconnect": true,` + `"compression": 2` |

**KVD-kvitton (M1-M5):**
- FÖRE: `curl -s http://127.0.0.1:6080/defaults.json` → `"compress": 2`
  serveras i drift (C2 levande vid uppdragsstart).
- Parse-kontroll FÖRE: python3 json.load OK, nycklar
  `['compress','quality','reconnect','resize','show_dot']`.
- EFTER: parse OK + assertion
  `{'resize':'remote','quality':3,'show_dot':True,'reconnect':True,'compression':2}`
  passerar — värdena identiska utom nyckelnamnet (rekommenderad variant i
  U19 steg 7: "döp den döda nyckeln compress→compression").
- EFTER: `curl -s http://127.0.0.1:6080/defaults.json` → `"compression": 2`
  serveras DIREKT (websockify läser från disk; inga omstarter, inga byggen).

**U16-radreferens:** C2 (rad 312) + §5c (rad 290-292). U19 steg 7 (rad
267-268). Kurform "ändra nyckelnamnet" — U16:312.

## 3. C3 REDAN RÄTTAD — bevisad med serverings-kvitto (ärlighet: ej min leverans)

U16 C3 (rad 313) + U19 §1 (rad 39-47): den SERVERADE hjalp.html bar
`?resize=scale` på rad 137 och kringgånde remote-kontraktet. **Läge nu:**

- `curl -s http://127.0.0.1:6080/hjalp.html | grep vnc.html` → rad 137 =
  `<a class="knapp" aria-label="Öppna ZCode-skrivbordet igen"
  href="vnc.html?autoconnect=true&amp;show_dot=true">` (M2) —
  **resize-parametern är STRUKEN** (U16 C3:s variant två: "el. stryk
  parametern"; U17 A1:s båda varianter).
- `grep -n "resize" hjalp.html` → **0 träffar i hela filen** (M10).
- mtime 2026-09-29 00:54 UTC; U19 (23:50 UTC) konstaterade felet ÖPPET i
  drift — rättningen landade alltså mellan 23:50 och 00:54 av huvudsession/
  fabrik UTANFÖR detta uppdrag (desk-web ligger utanför git; enskild agent
  kan inte belägas — mtime + innehåll är beviset). Detsamma gäller U19 steg
  2:s övriga dokumenträttningar som syns i samma fil (rad 99 "vänsterkanten",
  rad 108 "Återställ zoom (Ctrl+0)", WCAG-färg #94a3b8 rad 72-73,
  focus-visible rad 39/68, prefers-reduced-motion rad 70, theme-color rad 6).

**Dom:** C3 är STÄNGT i den serverade kopian; jag vidtog inget dubbelingrepp.
Not: U17 B1:s dubbelförvaring (/var/www/desk-kopian) berör inte
desk-web-klienten och ägs av U19 steg 2:s filhems-beslut — orörd här.

## 4. U16 steg 1 och steg 5 — instrumentläge och quality-vilrå

### 4.1 Steg 1 (instrumentera först): LANDAT av annan — tal SAKNAS än

`verktyg/desk-strommatare.mjs` FINNS (M11; "född r314 [organ:Φ]
2026-09-29", U15 §7.1-metod: /proc/net/dev rx + ss-vittne :6080/:5910,
logg `data/vakten/desk-strommatare.jsonl`) och är bokförd landad via
v206-slutledet (worklog:18726). MEN loggfilen **saknas** (M12: ls → ingen
jsonl) — verktyget är tyst (kod 0) utan uppkopplad klient, dvs **inga
kundbesökstmätetal existerar ännu**. U16 steg 1:s "ev. noVNC-stats-panel i
D3-forken" är ett MÄTINSTRUMENT (ej reglage), i U16 formulerat med "ev." —
lämnas oresonat här; ingrepp i ui.js är per definition inte lågriskklassat.

### 4.2 Steg 5 (quality 3→6): VILANDE — villkoret är ej uppfyllt (bevis)

U16 steg 5 (rad 328) lyder "quality 3→6 i defaults.json **EFTER steg 1:s
tal**"; U15:85 samma; U19 steg 7 (rad 269-276) "VILLKORAT av steg 4:s tal …
beslut i rundan på steg 4:s tal" med beviskrav "mätetal före/efter".
Villkoret: **strömmätarens kundbesökstal** — och den finns inte ännu (§4.1).
Att höja quality NU vore att bryta expertprotokollets egna villkor och
förstöra mätningen (före-tal måste tas på quality 3). **Dom: kvarstående
vilande; verkställs av huvudsessionens rond när desk-strommatare.jsonl
bär ett första kundbesök** — diff är då en rad:
`"quality": 3` → `"quality": 6` (reversibel med en rad, U16 steg 5).
U16:294-297:s försiktighetsregel gäller för mätningen (undvik
gränssnittsvaktens 6-timmars-cronfönster).

## 5. Ytor som medvetet LÄMNAS (ej ak1a-lågrisk-reglage)

- **U17 C4/steg 5 (createImageBitmap i display.imageRect)** — "det största
  identifierade avkodningsreglaget" (U19 steg 7 citerar) — bor i
  **core/display.js: MITT UPPDRAG FÖRBUDER core/vendor**; dessutom villkorat
  av mätetal (U19 steg 7). Rotas till huvudsessionen/leverantörsspåret.
- **U16 A1/A2/B2** (robot-cert, app-min, fönstermålning) — huvudsessionens
  cert-/bevisyta, inte desk-web-klientfiler.
- **mandatory.json-låsning `{"resize":"remote"}`** (U17 steg 2) — dömd till
  STYRELSEFRÅGA (U19 §2.1), trade-off mot rullgardinen; mandatory.json är
  tom `{}` (M13) och lämnas orörd.

## 6. ROT-KÖN — färdiga förslag (systemd/Xvnc — ALDRIG rörda av mig)

Tabellen är komplett att plocka av rot-ronden; U16-radreferens i varje rad.

| # | U16-ref | Förslag (färdig ändring) | Fil/enhet |
|---|---|---|---|
| R1 | B1 (rad 307) | Lägg `User=ak1a` (+ ev `Group=ak1a`) i enheten + `daemon-reload` + restart (klipper strömmen ~5 s; noVNC reconnect:true fångar — U19 steg 1) | /etc/systemd/system/zdesk-novnc.service |
| R1b | U19 steg 1 (rad 159-173; korsref B1) | Samma omstart: bind websockify lokalt — ExecStart `--heartbeat 30 127.0.0.1:6080 localhost:5910` (A-fyndet 0.0.0.0+root+tom brandvägg; se även ufw/fail2ban i U19) | d:o |
| R2 | B3 (rad 309, §3.1 rad 208-211) | desk-startzoom geometri-medveten: kräv 2 på varandra följande IDENTISKA `_NET_WORKAREA`-avläsningar (à ~100 ms) före ctrl+0 — ELLER degradera till no-op när `desktopZoomLevel` redan är 1 (appen persisterar själv) | /usr/local/bin/desk-startzoom (root-ägt) |
| R3 | B4 (rad 310) + steg 4 (rad 327) | Ersätt `ExecStartPre=/bin/sleep` med beredskapspoll: wm väntar på X-socket, zcode på `_NET_SUPPORTING_WM_CHECK` (U14:71-74) — deterministisk startkedja | zdesk-wm.service, zdesk-zcode.service |
| R4 | C1 (rad 311) | Beslut: behåll `-SecurityTypes None` (dokumenterad medveten hållning) el. inför VncAuth — kundkedje-traden-off, dömd till rot-beslut | /etc (zdesk-xvnc.service) |
| R5 | steg 6 (rad 329) + §5a (rad 265-268) | `-depth 16`-försök (ev. `-pixelformat rgb565/bgr565`): halverar framebuffer-byten (12,4→6,2 Mbit/helbild, U15:67), fullt reversibel — mät CPU+bandbredd+skärpa med strömmätaren FÖRE/EFTER; rankat evolution-steg, ej akut | zdesk-xvnc.service ExecStart |
| R6 | steg 7 (rad 330) | R1+R2 ovan + novnc-omstartsräkning (NRestarts, jfr M3=7) som rad i desk-halsa.mjs (AK1A-fil, verktyg/ — men levereras i rot-rondens paket då den hör till B1/B3-kuren) | /etc + verktyg/desk-halsa.mjs |
| R7 | §5a (rad 260-262) | CompareFB = 1 ("always") är enda kvarvarande Xvnc-komprimeringsutrymmet — VÄNTA på strömmätarens tal (mer CPU för färre onödiga uppdateringar) | zdesk-xvnc.service |
| R8 | steg 8 (rad 331) | WebRTC-transport (sub-100 ms-klass, självläkande reconnect) — stor arkitekturändring, R2-beröring möjlig; ägs av större rond, ej akut | ny infrastruktur |

## 7. KVD — kvitto-sammanfattning

1. JSON-giltighet + parse-kontroll: FÖRE och EFTER `python3 json.load` OK;
   EFTER med full värde-assertion (§2). **GRÖN.**
2. curl-kvitton: defaults.json FÖRE (`"compress": 2` serveras) och EFTER
   (`"compression": 2` serveras) via 127.0.0.1:6080; hjalp.html rad 137-kvitto
   (§3). **GRÖN.**
3. Diff-tabell: §2 (C2) + §3 (C3, redan rättad). **GRÖN.**
4. core/vendor: 0 rörda (grep-bevis M9 var läsning). mandatory.json orörd. **GRÖN.**
5. Repot: enbart detta protokoll committat (desk-web utanför git — M6).

## 8. Juridik

Ren infrastrukturleverans: inget finansiellt innehåll, inga kundriktade
texter, inga råd (2007:528 berörs ej). Priser/tier/domän/publicering: orörda
(R2). GDPR/kakor: ändringen sätter ingen kaka och samlar ingenting —
nyckeldöpningen ändrar ett klientlokalt standardvärde (2) som redan gällde
hårdkodat; strömmätaren (annans leverans) mäter byte på loopback, aldrig
innehåll/identitet (U19 §5). Skärmdump: togs ej.

## 9. Källförteckning (källtripp per påstående)

**Källprotokoll (fulltextlästa):** K1 = DESK-U16-KARNA-EXPERT.md (uppdragets
tabell; radciterat) · K2 = DESK-U19-RADSDOM.md (steg 2/4/7:s ägarskap och
villkor) · K3 = DESK-U15-STROMFARTSMATNING.md (flaskhalsdom 76-79, rek 84-85)
· K4 = DESK-U17-NAT-EXPERT.md (A1 serveringsbeviset, compression U17:48) ·
K5 = DESK-U13V2-PARITETSSYNTES.md (73-77: compress död) · K6 = worklog.md
(18515, 18606 v202/u202-leveransen, 18726 strömmätarlandningen).

**Egna mätningar (2026-09-29 ~01:05-01:20 UTC):**
- M1 = curl FÖRE 127.0.0.1:6080/defaults.json → `"compress": 2` serveras.
- M2 = curl 127.0.0.1:6080/hjalp.html rad 137 → autoconnect+show_dot, ingen
  resize-parameter (C3 serverat rättat).
- M3 = curl EFTER 6080/defaults.json → `"compression": 2` serveras.
- M4 = python3 parse+assertion FÖRE/EFTER (§2) · M5 = md5 FÖRE/EFTER
  (67c59df8… → 7b66b9d9…) + mtime 01:14:34 UTC.
- M6 = `git rev-parse` i /home/ak1a/desk-web → ej git-rot.
- M7 = vnc.html:57-97 (fetch ./defaults.json → UI.start defaults).
- M8 = app/ui.js:196/773-774/1121/1542 + core/rfb.js:400-413/2254
  (compression-konsumtionen, läsning ur core — ingrepp NEJ).
- M9 = grep `'compress'`/"\"compress\"" i app/+vendor/ → 0 träffar.
- M10 = grep "resize" i hjalp.html → 0 träffar (hela filen).
- M11 = head verktyg/desk-strommatare.mjs (r314-född, U15 §7.1-metoden).
- M12 = ls data/vakten/desk-strommatare.jsonl → SAKNAS (inga kundtal än).
- M13 = cat mandatory.json → `{}`.
- M14 = fabrik-ko/-status v208-desk-orientering (u1=U20-rotutredning,
  u2=detta uppdrag, u3=U22-utredning).

**Ärlighetsrad:** C3:s och strömmätarens rättare kan inte belägas på
agentnivå (desk-web/verktyg utanför resp. före detta uppdrag; worklog ger
våg-, inte agentnivå) — bevisen är mtime + serverat innehåll + worklog:18726.
quality 3→6 är PROGNOSFRI vilande: villkoret (kundbesökstal) existerar ej
ännu (M12). Påståendet "noll funktionell skillnad" för C2-kuren är belagt av
M8+M9 (hårdkodad default 2) — inte ett antagande.

RESULTAT: 2 ak1a-lågriskreglage funna i U16 (C2, C3) — C2 VERKSTÄLLD med
diff+kvitton (compress→compression), C3 bevisat redan rättad (serverat),
quality 3→6 vilande på strömmätarens kommande tal, 8 rader rot-kö levererade
+ 3 medvetet lämnade ytor dokumenterade
