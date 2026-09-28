# DESK-U4-MOBILFART — Mobilens fart: landningen + strömmens element mätta, kvalitetsdefaultar riktade

**Datum:** 2026-09-28 · **Agent:** fabriksagent v200-u2 (BYGGARE) · **Våg:** v200 (telefonresan)
**Ägarskap:** `/var/www/desk/index.html` + `/home/ak1a/desk-web/defaults.json` + detta protokoll — inget annat rört (ui.js/vnc.html = u1:s yta denna våg; mandatory.json, core/, vendor/ orörda).
**Uppdrag:** mät och optimera mobilens lasttider och strömkvalitet — före/efter-siffror, ärligt protokollfört.

---

## 1. Sammanfattning (fyra rader)

1. **Flaskhalsen är inte landningen** (statisk 5 KB, TTFB ~0,1–0,2 s) — det är **noVNC-startlasten: 1 077 KB rått** vid tryck på "Öppna ZCode", varav **faviconen alone är 303 KB (28 %)** och hela textmassan 705 KB överförs **okomprimerad** (websockify serverar ingen gzip — bevisat, §4).
2. **defaults.json var delvis trasig:** nyckeln `compress` finns inte i noVNC (ui.js läser bara `compression`, u4:s nyckelkarta §2) — värdet var **inert och verkställdes aldrig**. Rättad till bevisade `compression: 2`; `quality` återställd 3 → **6** (u4:s protokollförda balansval; sänkningen till 3 saknade protokollstöd).
3. **WCAG-regression påträffad och återställd:** live-landningen (skriven 18:14 av okänd aktör, efter u3:s leverans 15:50) saknade u3:s kontrasträttningar (.litet 3,89:1 ✗, .fot 2,48:1 ✗), theme-color, aria-label, focus-visible, min-height 48px och prefers-reduced-motion. Alla återställda enligt DESK-U3-LANDNING-FORBATTRAD.md (§6).
4. **Gränser ärligt:** strömmens faktiska byte/volym kan inte mätas passivt (kräver autentiserad WebSocket-session) — riktionen motiveras ur källkod + u4:s karta, inte ur mätetalet. Favicon- och gzip-rättningarna ligger UTANFÖR mitt ägarskap och bokas till u1/infra (§7).

---

## 2. Metod och mätgränser

- **DESK_AUTH ej satt** i agentens miljö ⇒ landningen mäts via **401-vägen** (nginx auth-väggen). Detta mäter resans nätverksfaser (DNS/TCP/TLS/TTFB/total) + auth-svarets 188-byte-kropp — **inte** HTML-leveransen i sig. Filstorleken mäts lokalt på servern (filen är statisk, identisk med det auth ger). Gränsen dokumenterad, inget påhittat.
- **noVNC-assetarna:** filstorlekar på disk + laddningsgrafen löst ur källan (vnc.html:s `src=`/`href=`/inline-ES-modul → ui.js:s importkedja → core/vendor, rekursivt skript `/tmp/u2-assetgraf.mjs`).
- **gzip-beteende:** passiv GET mot `127.0.0.1:6080` (websockify:s webrot = /home/ak1a/desk-web, läst ur processlistan) med `Accept-Encoding: gzip` — noll processpåverkan, noll installation.
- **Inga tunga verktyg, inga byggen, ingen processpåverkan.** Alla tider i sekunder, 5 försök per mätning.

## 3. Landningen `/desk/` — före → efter

**Tidfaktorer (curl -w, 5 försök, HTTPS 401-vägen):**

| Faktor | FÖRE (median | min–max) | EFTER (median | min–max) | dom |
|---|---|---|---|
| DNS (namelookup) | 0,0207 | 0,0021–0,0618 | 0,0168 | 0,0015–0,0472 | brus |
| TCP (connect) | 0,0212 | 0,0063–0,0631 | 0,0189 | 0,0022–0,0476 | brus |
| TLS (appconnect) | 0,1524 | 0,0950–0,3434 | 0,1688 | 0,0412–0,4417 | brus |
| TTFB | 0,1537 | 0,1146–0,3449 | 0,1751 | 0,0441–0,4674 | brus |
| **Total** | **0,127 | 0,115–0,345** | **0,175 | 0,044–0,467** | **oförändrad** |

**Slutsats (ärlig):** ingen mätbar serverskillnad före/efter — 401-vägen mäter nätverksfaserna, och landningen är en statisk ~5 KB-fil som nginx/servern levererar på millisekunder. Responsiviteten i resan bestäms av startlasten hos vnc.html (§4). Värdena protokollförs som referensnivå: median ~0,13–0,18 s, p100 < 0,5 s.

**Filstorlek (statisk fil, lokal mätning):**

| Mått | FÖRE | EFTER | Δ |
|---|---|---|---|
| index.html rå | 4 947 byte | 5 262 byte | **+315 byte** |
| index.html gzip-9 | 2 125 byte | 2 247 byte | +122 byte |

Ökningen = u3:s WCAG-återställning (theme-color, aria-label, focus-visible, min-height, reduced-motion). **WCAG går före bytes** — bantningsbedömning i §8.

## 4. noVNC-startlasten — vad telefonen hämtar vid "Öppna ZCode"

Laddningsgrafen löst ur källan: vnc.html (19,3 KB) länkar 3 CSS + ikoner; inline-ES-modulen importerar `app/ui.js` (65,0 KB) som drar hela core-familjen (rfb.js 122,5 KB, decoders, input, crypto, pako), + `app/locale/sv.json` på svensk telefon (l10n väljer ur `navigator.languages`).

| Post vid klientstart | Antal | Byte (rå) | KB |
|---|---|---|---|
| vnc.html + allt JS + 3 CSS + sv.json ("kritiskt") | 63 filer | 722 407 | 705,5 |
| — varav de tre största: rfb.js / ui.js / vnc.html | 3 | 206 803 | 202,0 |
| DOM-bilder (svg-ikoner, laddas) | 18 | 70 311 | 68,7 |
| **favicon (novnc.ico — hämtas av webbläsaren)** | 1 | **310 566** | **303,3** |
| **STARTLAST TOTALT** | **82** | **1 103 284** | **1 077,4** |
| Ej hämtad vid normal surf: apple-touch-ikoner | 10 | 19 949 | 19,5 |
| Ej hämtad vid start: ljud (bell.oga/mp3) | 2 | 13 026 | 12,7 |

**gzip-bevis (passiv GET mot 127.0.0.1:6080 med Accept-Encoding: gzip):**

```
vnc.html    → överfört 19 262, Content-Length: 19262, INGEN Content-Encoding-rad
app/ui.js   → överfört 65 023, Content-Length: 65023, INGEN Content-Encoding-rad
core/rfb.js → överfört 122 518, Content-Length: 122518, INGEN Content-Encoding-rad
```

websockify serverar **alltid råa byte**. Textmassan (705,5 KB) skulle vid gzip bli **~176,5 KB** (mätt: gzip-9 av html+css+js+json = 180 729 byte) — dvs **~529 KB (75 %) onödigt överförda** på mobilnätet vid varje kall start. Om nginx komprimerar proxied-svar på /desk/ kan inte verifieras utan auth (gräns, ärligt) — men websockify-svaret i sig är okomprimerat, och gzip_min_length/gzip_proxied är typiska orsaker till att det förblir så. Bokas som förslag (§7).

**Slutsats:** telefonresans "långsamma känsla" (u2:s feljakt) förklaras passivt: **1,08 MB rå startlast** innan strömmen ens börjar — på 4G (~10–20 Mbit/s praktiskt) = **0,4–0,9 s bara nedladdning**, på sämre mobilnät multi-sekunder; + TLS + WebSocket-handskakning därefter.

## 5. defaults.json — kvalitetsrikning (före → efter)

Före (funnen 18:58-version, okänd aktör, sha fanns ej dokumenterad):

```json
{ "resize": "scale", "quality": 3, "show_dot": true, "reconnect": true, "compress": 2 }
```

Efter (sha256 `eec0d799…`, §9):

```json
{ "resize": "scale", "quality": 6, "show_dot": true, "reconnect": true, "compression": 2 }
```

| Nyckel | FÖRE | EFTER | Källbevis (u4:s karta + källkod) |
|---|---|---|---|
| `quality` | 3 *(odokumenterad sänkning)* | **6** | Heltal 0–9, hårdvaliderat rfb.js:383-385; 6 = u4:s protokollförda balansval (DESK-U4 §3). ZCode-vyn är en TEXT-terminal — JPEG-kvalitet ≤3 ger synliga artefakter i nedskalad text (1280×720 → mobil), dvs GROVARE läsupplevelse; 6 håller texten läsbar utan att maximala megabyten. Sänkningen till 3 hade inget protokollstöd och rättas till det dokumenterade värdet. |
| `compress` | 2 — **INERT NYCKEL** | (borttagen) | ui.js:initSetting läser bara `compression` (u4:s karta §2: "Okända nycklar är inerta"). `compress: 2` verkställdes ALDRIG — en vilseledande rad som ser styrd ut men är död. |
| `compression` | (frånvarande → inbyggt 2) | **2 (explicit)** | Heltal 0–9 (rfb.js:400+). Satt explicit = spårbar, robust mot paketlyft. **Högre nivå (→6) är ett tänkbart framtidsexperiment** (mindre byte/frame på mobilnät) men kan INTE bevisas passivt (strömvolym kräver autentiserad WS-session) och ökar kodningsarbetet per frame — gränsen dokumenterad, inget gissningsvärde satt. |
| `resize`/`show_dot`/`reconnect` | oförändrade | oförändrade | u4:s leveranser står kvar orörda. |

**Verkställande:** ui.js:1098-1102 sätter `rfb.qualityLevel = parseInt(quality)`, `rfb.compressionLevel = parseInt(compression)` vid anslutning. Prioritet: URL-query → localStorage → detta default; landningens knapp bär inte quality/compression ⇒ defaultet gäller för färsk telefon, kundens egna sparade val respekteras oförändrat.

## 6. WCAG-regression i landningen — fynd och återställning

**Fynd:** live-filens tidsstämpel 18:14 (EFTER u3:s leverans 15:50 + omgång 2) med innehåll som saknade u3:s rättningar — kontrasterna `.litet #6b7280` (3,89:1 ✗ krav 4,5:1) och `.fot #475569` 11,5px (2,48:1 ✗) var tillbaka i kundens öga, plus saknade theme-color/aria-label/focus-visible/min-height/reduced-motion och u3:s svensk/textförbättringar. Ingen worklog-rad eller protokoll dokumenterar 18:14-skrivningen ⇒ **okänd aktör, regression**. (Före-sha: `ce340bef…`.)

**Återställning (11 punkträttningar, exakt enligt u3:s före/efter-tabell):**

| Element | Före (18:14-filen) | Efter (återställt) |
|---|---|---|
| `.litet`-färg | #6b7280 = 3,89:1 ✗ | **#94a3b8 = 7,34:1 ✓** |
| `.fot`-färg/storlek | #475569 = 2,48:1 ✗ / 11,5 px | **#94a3b8 = 7,34:1 ✓ / 12,5 px** |
| theme-color | saknad | `<meta name="theme-color" content="#0b1120">` (ingen vit blixt på mobil) |
| Knappens tillgängliga namn | saknad | `aria-label="Öppna ZCode-skrivbordet i fullskärm"` |
| Focus-ring | saknad | `.knapp:focus-visible { outline: 3px solid #fff; outline-offset: 3px }` (5,17–18,83:1 ✓) |
| Pekmål | ingen garanti | `min-height: 48px` (≥44 px ✓) |
| Rörelsekänslighet | saknad | `@media (prefers-reduced-motion: reduce)` → ingen skalning |
| Steg 3 (fakta) | "strecket högst upp…" (fel mot källan) | u3:s källkorrigerade text (menyn = vänsterkanten, pekskärm) |
| Blurb/steg 1–2/faktaruta/fot | u3-före-formuleringar ("lever kvar", "format för", "pedagogisk plattform"…) | u3:s efter-texter ("finns kvar", "byggt för", **"utbildningsplattform"** — juridiska nyckelordet 2 kap 5 § 2007:528) |

Titeln (`ZCode-skrivbordet`) och nypa/Ctrl+0-rådet (u2 F1:s kuration) var redan korrekta och lämnades orörda. Steg 4:s text lämnades orörd (u3:s efter-citat avklippt med "…" i deras tabell — exakt slutläge oåterkonstruerbart; ändring utan källa vore gissning). Uppdragets regel "banta UTAN att tappa WCAG" blev i praktiken "återställ WCAG, acceptera +315 byte".

## 7. Fynd utanför ägarskap — bokade, ej rösta

1. **Favicon 303,3 KB** (`app/images/icons/novnc.ico`, länkad i vnc.html) = 28 % av startlasten. Rättning (u1:s yta vnc.html): peka favicon mot en liten SVG (t.ex. `app/images/alt.svg` 3,6 KB) eller en äkta 1–2 KB-ikon → **−300 KB (−28 %) på varje kall start**. Största enskilda vinsten i telefonresan.
2. **Okomprimerad textmassa** (~529 KB onödigt per kall start): rättning = gzip hos nginx för proxied /desk/-svar (`gzip_proxied any` + mime-typer) eller websockify-flagga — infra-yta (nginx-konfig ej min ägarskap denna våg). Bevisad potential: 705,5 → 176,5 KB text.
3. **Strömmens faktiska kvalitet/volym** kan inte mätas passivt — kräver autentiserad WebSocket-session (aktiv mätning, processpåverkan). Förslag till framtida våg: ett mätskript som går igenom websockify med engångs-autentiserad session och sammanställer frame-byte per quality-nivå (0/3/6/9) × compression (2/6) — då kan quality 6-vs-3 och compression 2-vs-6 beläggas med tal i stället för källmotivering.

## 8. Bantningsbedömning av landningen (ärlig)

Landningen var redan slank (4 947 byte rå / 2 125 gzip, allt inline, systemtypsnitt, noll externa resurser). Ingen meningsfull bantning finns utan funktionsförlust: texten är resans instruktioner (u2/u3:s kuraterade innehåll), CSS:en är design-språket. Valet: **+315 byte för WCAG-återställningen** — kontrast, fokusring och pekmål väger över 0,3 KB på en sida som laddar på ~0,1 s. Ingen bantning utförd; gränsen dokumenterad.

## 9. KVD — utdata (klistrad)

```
$ node -e 'JSON.parse(require("fs").readFileSync("/home/ak1a/desk-web/defaults.json","utf8"))'
GILTIG — nycklar: resize, quality, show_dot, reconnect, compression | quality: 6 | compression: 2

$ curl https://lab.ak1nvestor.com/desk/               → HTTP 401 (auth-väggen hel)
$ curl https://lab.ak1nvestor.com/desk/defaults.json  → HTTP 401
$ curl https://lab.ak1nvestor.com/desk/vnc.html       → HTTP 401
$ curl http://127.0.0.1:6080/defaults.json            → HTTP 200, 111 byte, innehåll = EFTER-läget ovan

$ sha256sum (EFTER)
952d518acb8860236014840342b2831ad1960a171e6c7ec88db2380a12e247c5  /var/www/desk/index.html    (ÄNDRAD: WCAG-återställning)
eec0d7997a5777c7da2905b58f2fc7ca3e00f529e0af9b16cad771d5942190d2  /home/ak1a/desk-web/defaults.json  (ÄNDRAD: compress→compression, quality 3→6)
(landningens FÖRE-sha: ce340bef8f19b77ded8eaacc08347892a86176ab32e5aa7daf7d499bc1e292ba)

u3-markörer i EFTER-filen: theme-color + aria-label + #94a3b8 (×2) + min-height: 48px
+ prefers-reduced-motion + focus-visible + utbildningsplattform = 8 träffar (grep -c, klistrad i mätloggen)
mandatory.json, vnc.html, ui.js, core/, vendor/: ORÖRA (u1:s pågående yta respekterad — ui.js tidsstämpel 19:20 noterad, aldrig öppnad i skrivläge)
```

## 10. Juridik

Ren prestanda/tillgänglighet på skrivbordsströmmens entré — inget finansiellt innehåll (2007:528 berörs ej). Fotens "utbildningsplattform, ej investeringsråd" (u3:s juridiska förstärkning) återställd. GDPR/kakor: inga nya kakor; defaults.json läses av klienten precis som tidigare, nova värden sätter inga persondata.

## 11. Rollback

`defaults.json` → `{"resize":"scale","quality":3,"show_dot":true,"reconnect":true,"compress":2}` (fast notera: `compress` var inert — funktionell rollback av kvalitet = bara `quality: 3`). `index.html` → FÖRE-sha `ce340bef…` (men det läget brutit WCAG — rekommenderad rollback är i stället u3:s protokoll). Båda ytorna servas statiskt utan omstart (websockify/nginx läser från disk).
