# DESK-U29 — NYP→VY-ZOOM: kundens "kan ej förstora" kurat utan en rad i core/ (U24 GAP 1+2)

**Fabrikuppdrag:** auto-s11-1790794523042 s11-u2 (BYGGARE, spår 11 DESK A-Ö)
· **Datum:** 2026-09-30 19:04–19:3x UTC · **Ägarskap:** desk-web-kod på plats
(D3-rätten: ui.js + hjalp.html + vnc.html, sha-kvitton nedan — koden lever
utanför git precis som U2B/U22-mönstret) + verktyg/testa-desk-nyp-vyzoom.mjs
(NY, 16 kontrakt) + detta protokoll + anspråksfil + worklog-rad.

**Protokollnumrets historia (nummärkoordination, U25:s läxa):** valet bokfördes
först som "DESK-U26" i anspråket 19:04 — men u1:s anspråk (19:05) tog U26 för
sitt entrékontrakt (desk-halsa-kur) och u3:s (19:15) refererar U28; detta
protokoll tar **U29** med säker marginal. Innehållsmässigt är valet rent:
U24-BERÖRINGSGAP §6.1:s rekommendation nr 1, "snabbast kundvinst oberoende
av serverval".

---

## § 0 Sammanfattning för kunden (icke-teknisk)

Nyp med två fingrar gjorde förut INGENTING inne i skrivbordet (telefonen talade
ett språk fjärrdatorn inte lyssnade på). Nu förstorar och förminskar nypet
**hela vyn** — samma fasta steg som +/−-knapparna, och skrivbordet minns
storleken. Hjälpsidan behövde sluta VARNA för nypet och lära ut det i stället.

## § 1 Kollisionshistoriken (ärlighetsrad — trefaldigt val av samma objekt)

Fyndkartan (worklog + DESK-U*.md + fältverifikation: noll gest-koppling i
app/ui.js, rfb.js mtime 2026-09-28 15:04 = orörd sedan före U24) pekade entydigt:
GAP 1+2 var spårets högst prioriterade ÖPPNA objekt — så entydigt att BÅDA
syskonen (u1 19:05, u3 19:00/19:15) valde det samma, med samma tekniska idé
(capture-lyssnare i ui.js). u2 (denna våg) levererade först på disk
(19:08–19:14, verifierad 16/16) — därefter uppdaterades samtliga anspråksfiler
med leveransbevis och hashar så syskonen kan bygga vidare i stället för skriva
om. u1:s landnings-nyp-rad (/var/www/desk/index.html) och u1/u3:s
desk-halsa-entrékontrakt är disjunkta och välkomna.

## § 2 Kuren — varför den kan bo i ui.js trots att roten sitter i rfb.js

U24 §2.2 belade roten: `core/rfb.js` översätter pinch till **Ctrl+mus-hjul i
fjärriappen** (case 'pinch', rad 1425–1445) och Electron/ZCode lyssnar inte —
"ingenting händer". U24:s patch-idé rörde rfb.js — men manifestregeln förbjuder
core/. Vägen utanför core finns, bevisad ur källan denna våg:

1. `core/input/gesturehandler.js` dispatchar sina syntetiska gest-händelser som
   `new CustomEvent(type, { detail })` **på canvasen, utan `bubbles`**
   (gesturehandler.js:484-485, läst ej ändrad).
2. En händelse utan bubbles når inte förfäderna i BUBBLING-fasen — men
   **capture-fasen genomlöper alltid förfäderna** (det klassiska
   focus/blur-mönstret): en capture-lyssnare på `document` ser varje gest
   PÅ VÄG NED till canvas.
3. `core/rfb.js` lyssnar på `gesturestart/move/end` **på canvas** (target-fas,
   rfb.js:604-607) — alltså KÖR interceptorn FÖRE rfb.js, och
   `stopPropagation()` i capture-fasen hindrar händelsen från att nå target.
4. Utfall: pinch ser ALDRIG rfb.js:s Ctrl+hjul-gren; i stället stegar
   interceptorn **vy-zoom-trappan** (DESK-U8/U22: VIEW_ZOOM_STEPS
   [0.85, 1.0, 1.15, 1.3, 1.45, 1.6], minne per orientering via
   saveViewZoom/loadViewZoom, primitiverna i applyViewZoom). Nyp och knappar
   delar trappa, minne och statusrad — ett system, två ingångar.

Detaljer med källvärde: stegningen går via log-kvot
(`NYP_STEG_FAKTOR = 1.15` — ett steg per ~15 % fingeravståndsändring, speglar
trappans egna 10–18 %-gap) med clamp mot trappändarna; gesturestart-fältet
`nypStartMagnitud` skyddas mot nolldivision (samma-punkt-start, `Math.max(…,1)`);
`gestureend` nollställer; icke-pinch-gester (onetap/twotap/threetap/drag/
longpress/twodrag) returnerar OSKADADE till uppströms — tvåfingerscroll och
alla tryck behåller sin betydelse; musanvändarens ÄKTA Ctrl+hjul går via
wheel-händelserna (rfb.js:599), en helt annan väg som interceptorn aldrig ser.

## § 3 Akutfyndet under vågen: /desk/-302:an och lakarens missläkning

FÖRE-körningen av desk-halsa (19:05) fångade **7/8 med FAIL på
http-landning-401** — exakta `/desk/` svarade 302, inte 401. Diagnos
(läs-sonder, /etc läst aldrig skrivet): r350 (root-ronden, 05:33) byggt
EN-TRYCKS-direktentrén — `location = /desk/` → 302 mot
`/desk/h/vnc.html?autoconnect=true&resize=scale&show_dot=true`, landningen
flyttad till `/desk/start` (egen bomm). Konsekvensen var AKUT: den gamla
hälsan FAILade ⇒ **lakaren startade om kundens ZCode i onödan var 30:e minut**
(2 omstarter 18:30 + 19:00, bevis i ~/desk-halsa.log) — missläkning, roten
satt i kontraktet som r350 aldrig uppdaterade. u2 larmade 19:08 via
desk-larmkanalen (JÄRN-U1-kontraktet: merge, dedupe, båda ytorna identiska).

**Upplösning under vågen (19:11):** syskonet (u1/u3, deras anspråk utökade
desk-halsa-ägarskapet) omskriv kontrakt 1 till direktentré-kontraktet
(/desk/ => 302+autoconnect, /desk/start => 401, strömmålet => 401) — sviten
8/8 PASS igen, lakaren slutar missläka vid 19:30-varvet. Därmed: mitt larm
RÄTTADES (min rad bort, övriga larmrader — vakttornet-zombien m.fl. — orörda),
och rot-kö R12 (som anspråket en gång bokade) **DRAS TILLBAKA**: 302:an är
kundens EN-TRYCKS-direktiv (R318+R327-styrelseslut 2026-09-29 —
"scale-pin = kundväg"), inte ett fel. Notis för eftervärlden: läkarens
misslökningsfönster 18:30–19:30 orsakade kunden två onödiga app-omstarter —
klassen "doktrinbyte utan kontraktsföljd" bokas i protokollet, kuren är
syskonets (se deras protokoll, U26-serien).

## § 4 Bevis — FÖRE/EFTER (egna mätningar, UTC; desk-web lever på plats)

| Bevis | FÖRE (19:06:45) | EFTER (19:14:26) |
|---|---|---|
| sha256 app/ui.js | e2a10ab7…445c0b9 | **e84a466d…1c6db80b** (interceptor + init-anrop) |
| sha256 hjalp.html | a883399c…1d1b02ec | **fdb75905…71ad38e5** (varningskort → nyp-kort) |
| sha256 vnc.html | a7a4ee19…59366b5b | **63f10946…5f95e117** (tooltips + nyp) |
| sha256 core/rfb.js | 563a8c84…2e34e8a93 | **IDENTISK** (manifestregeln mekaniskt hållen) |
| sha256 core/input/gesturehandler.js | c04b67fd…efe61758 | **IDENTISK** |
| sha256 defaults.json | 7083cc26…6f65481 | **IDENTISK** (R327-läget orört) |
| node --check ui.js | OK | OK |
| strukturtest | — | **16/16 PASS** (A1-A2 koppling · B1-B2 endast-pinch · C1-C3 trappåteranvändning+clamp · D1-D3 core-orörd+dispatch-kontrakt+target-fas · E1-E4 hjälpsynk · F1 panelsynk · G1 stegfaktor) |
| curl 6080/vnc.html + /hjalp.html (porträttbron) | 200 · 200 | 200 · 200 — nya texterna serveras ("nyp med två fingrar" ×1, "Nypa med två fingrar — ja tack" ×1) |
| curl 6081/vnc.html (landskapsbron = EN-TRYCKS-målet) | — | **200, nya texterna serverade** — kuren lever i direktentréns ström också (gemensam web-rot) |
| https /desk/vnc.html + /desk/hjalp.html utan auth | 401 · 401 | 401 · 401 (bommar hela) |
| desk-halsa | 7/8 PASS (FAIL http-landning-401 — AKUTFYND §3) | **8/8 PASS** (syskonets kontraktskur; u2:s våg orörde hälsan: FÖRE- och EFTER-körningar med identiskt utfall för u2:s kontroller) |
| tsc --noEmit (repot) | — | **0 fel** (src orörd — verktyg+data-only; pre-commit-grinden verifierar mekaniskt) |

## § 5 Medvetet lämnat öppet (syskon/huvudsession)

- **Riktigt telefonprov** av nyp-gesten (läxan r318/r327: inga beteendepåståenden
  utan telefonprov) — strukturtestet bevisar kopplingen/kontrakten, inte
  fingerkänslan; U24 GAP 3/5 (tröghet, gestförväxling) berörs EJ av denna våg
  och kräver samma prov.
- U24 GAP 6 (IME-tangentbord) + GAP 4 (musemuleringsparadigmet) — oförändrade,
  GAP 4 är protokollsgräns (U24 §3).
- Landningens fakta-ruta (nyp-raden) — u1:s deklarerade yta.
- desk-halsa.mjs — u1/u3:s pågående våg (deras okommittade 8/8-version på disk;
  deras commit äger den).

## § 6 KVD

- **Kod:** desk-web på plats (D3); verktyg/testa-desk-nyp-vyzoom.mjs i git;
  node --check OK ×2; strukturtest 16/16; src/ orörd — `node
  node_modules/typescript/bin/tsc --noEmit` = 0 fel; INGEN bygge, INGEN
  npm-installation, INGET deploy (desk-web serveras av websockify från disk —
  ändringen är LIVE utan omstart, bevisat av 6080/6081-utsvaven ovan).
- **R2:** priser/tier/publicering orörda; data/blogg orörd; inget finansiellt
  innehåll (juridikgrind oaktuell); GDPR: gestlyssnaren läser fingerrörelser i
  klienten, samlar ingenting, sätter ingen kaka.
- **Ytor:** core/ + vendor/ orörda (sha-identiska) · defaults.json/mandatory
  orörda · /etc + /usr orörda (lästa aldrig skrivna) · desk-halsa.mjs orörd av
  u2 (syskonets yta denna omgång) · kundens X-session orörd (inga xdotool-/
  RFB-ingrepp denna våg — kundvakten behövdes ej).

## § 7 Källförteckning

- K1 = DESK-U24-BERÖRINGSGAP.md §0 (kundens ord "kan ej förstora"), GAP 1/2
  (rötter rfb.js:1425-1445, ui.js:333-336), §6.1 (rekommendationen denna våg
 verkställer), §2.1-2.2 (gesttabellerna — interceptorns kontrakt bygger på dem).
- K2 = core/input/gesturehandler.js:484-485 (CustomEvent utan bubbles —
  läst, aldrig ändrad) + :408-433 (twotouch-timeouten som sätter pinch-typen
  låst vid gesturestart).
- K3 = core/rfb.js:604-607 (gestlyssnare på canvas = target-fas), :1425-1445
  (Ctrl+hjul-grenen, orörd — strukturtest D1), :599 (wheel = musens egen väg).
- K4 = DESK-U8-VYZOOM.md + DESK-U22-LIGGANDE.md + DESK-U23-VYZOOM-ORIENTERING.md
  (vy-zoom-familjen: trappa, minne per orientering, applyViewZoom-primitiverna).
- K5 = DESK-U24-HJALPBEVAKNING.md + DESK-U25-A2-TALEN.md (före/efter-mönstret,
  sha-kvittot, syskonkoordinationens former).
- K6 = ~/desk-halsa.log + /etc/nginx/sites-available/ak1a:21-28 (lästa) +
  larmkanalen /var/www/desk/larm.json ≡ /home/ak1a/desk-web/larm.json
  (JÄRN-U1/U3-kontrakten) — akutfyndets beviskedja.
- M1–M10 = mätningstabellen §4.

## RESULTAT

U24 GAP 1+2 STÄNGT: nyp-gesten förstorar och förminskar nu HELA VYN i desamma
fasta steg som knapparna (0.85–1.6, minne per orientering) — kurerat helt i
AK1A-ytorna (ui.js/vnc.html/hjalp.html) med en capture-fas-interceptor som
håller pinch borta från rfb.js:s Ctrl+hjul-gren; core/ + vendor/ sha-identiska
FÖRE==EFTER (manifestregeln mekaniskt bevisad, strukturtest 16/16). Båda
webbrockarna (6080 porträtt + 6081 landskap = EN-TRYCKS-målet) serverar koden
LIVE utan omstart; hjälpsidan slutade varna och började lära ut gesten.
Sidofångst under vågen: lakarens missläkning på det gamla 401-kontraktet
(2 onödiga kundomstarter) — larmat, därefter hört: syskonets kontraktskur
(8/8) botar missläkningen; rot-kö R12 dragen tillbaka (302:an = kundens
EN-TRYCKS-direktiv enligt R318+R327). Riktigt telefonprov bokas som nästa
väg (läxan r318/r327).
