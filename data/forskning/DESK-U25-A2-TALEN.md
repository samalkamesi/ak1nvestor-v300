# DESK-U25 — A2-TALEN: app-min 480×640 mot telefonviewports, mätt i drift + mätsonden född

**Fabrikuppdrag:** auto-s11-1790645110002 s11-u1 omkörning 2 (BYGGARE, spår 11
DESK A-Ö) · **Datum:** 2026-09-29 02:02–02:50 UTC · **Ägarskap:** verktyg/
desk-a2-matning.mjs (NY) + data/vakten/desk-a2-matning.jsonl (NY) + detta
protokoll + anspråksfil (u1r2, 02:13) + worklog-rad. Syskonkoordination:
u2:s anspråk 02:10 äger desk-halsa.mjs + DESK-U24 — **respekterat: desk-halsa
rördes aldrig, kördes endast som bevis** (körning = läsning).

**Valgrund (duplikatkontroll):** worklog r313–r317 + DESK-U19–U23 + data/:
dokumentpaketet LANDAT (u1-vågen), strömmätaren LEVERERAD (desk-strommatare +
pumpor r316), U22-implementationen LEVERERAD (u3), steg 6b-sviten pågår (u2,
anspråk 02:10), rot-kö R1–R9 = root-rond. **Öppet och fabrikens yta: U16 A2 +
U19 steg 4a** — px-talen per orientering saknades fortfarande ("app-min är
leverantörens yta, men skadan skall beläggas i drift innan någon
förhandlingsväg öppnas", U19 §2.4). U20 bevisade sondmetoden (syntetisk
geometribyte + mätning + återställning, ingen kund krävs).

---

## 1. Leverans: mätsonden verktyg/desk-a2-matning.mjs

Tre kontrakt inbyggda från protokollens belagda klasser:

- **Kundvakten** (U20:s försiktighet + U15 §0:s socket-vittne): vägrar ändra
  framebuffer (exit 2) om websockifys upstream 5910 är öppEN ELLER 6080
  bestående > 1,5 s. **Skärpad under denna våg** efter två gripna
  false positives: hälsans/gränssnittsvaktens kortlivade curl-sonder mot
  6080 (DESK-U25-fynd 3 nedan) — 5910 är den äkta signalen (websockify
  öppnar upstream ENDAST för riktiga klienter, U15 §0).
- **Fönstermålning** (U16 B2-kuren): `xdotool search --onlyvisible --name
  "ZCode"` — exakt 1 träff (0x600003/6291459) i varje mätning denna våg.
- **Settle-grinden** (U16 A1/B3-lärdomen): mätvärde bokförs först efter två
  på varandra följande IDENTISKA fönsteravläsningar (~400 ms stabilitet);
  om-maximering efter geometribyte är asynkron utan completion-signal.

Geometrisättning i två vägar: `xrandr -s` för listade modes (rent lokalt),
annars **RFB SetDesktopSize-sond** — exakt kundens klientmekanism (noVNC
skickar denna vid varje anslutning/rotation, U12:819-829), U20:s bevisade
väg. Sonden skickar ENDAST geometri, aldrig input (U16 C1:s hållning).

## 2. MÄTDATA (råa värden ur data/vakten/desk-a2-matning.jsonl)

### 2.1 Porträtt — kundens verkliga telefon: 412×915 (MÄTT I DRIFT)

| Fält | Värde (02:18:11 + 02:22:28, två passiva mätningar identiska) |
|---|---|
| skärm (xrandr current) | 412×915 (VNC-0 connected — kundens senaste SetDesktopSize) |
| fönster (app) | **480×915** +0+0, _NET_WM_STATE maximerat VERT+HORZ |
| min-hints | 480×640 — **KLAMPAR: fönstret = min-bredd** |
| workarea | 0,0,412,915 |
| **överflöd höger** | **68 px** (480 − 412, NorthWest-gravity ⇒ klipps i högerkanten) |
| överflöd botten | 0 px (915 ≥ 640 — porträttets höjd räcker) |

**Dom:** U16 A2:s förutsägelse är belagd i drift: i porträtt klipps appen i
HÖGERkanten med exakt (minBredd − skärmBredd) px. För kundens 412-breda
telefon = **68 px osynliga hela vägen fram tills app-min breddas**. (U16:s
citat räknade på 390-bred referens: 90 px — samma lag, kundens telefon är
bredare.) U19 §2.3:s synergy står: porträtt är överlevbart (höjd 915 ≫ 640).

### 2.2 Liggande + U16-referenspar — MÄTTA I DRIFT (02:35:15–02:35:36, tomt fönster efter kundens ~90 s-besök)

| Läge | Skärm | Fönster (app) | Utanför | U16 A2:s förutsägelse |
|---|---|---|---|---|
| **Kundens liggande 915×412** | 915×412 | 915×**640** (klampar min-höjd) | **botten 228 px** | — (U16 räknade på referensen) |
| Referens liggande 844×390 | 844×390 | 844×640 | **botten 250 px** | "250 px av botten" — **EXAKT** |
| Referens porträtt 390×844 | 390×844 | **480**×844 (klampar min-bredd) | **höger 90 px** | "90 px klippt i höger" — **EXAKT** |

Alla fyra mätningar med KLAMPAR-signal sann, +0+0-läge, maximerat — två
identiska avläsningar var (settle-grinden). Återställning till 412×915
verkställd och verifierad (VNC-0 connected; desk-halsa 8/8 PASS efteråt).

### 2.3 Dom — vad talen betyder

1. **Lagen är bevisad, inte bara förutsagd:** överflöd = min-hints − skärm,
   per axel. Både U16:s referenssiffror (250/90) och kundens verkliga
   (68/228) följer den exakt — A2 är certainty i drift, inte prognos.
2. **Porträtt = överlevbart** (U19 §2.3 bekräftat): 68 px högerkanten borta
   på kundens telefon, men kompositorn (botten, U11 F4) är SYNLIG i
   porträtt — kunden kan skriva.
3. **Liggande = dokumenterad risk** (U16:s dom eko): 228 px av botten —
   just kompositorn — osynlig. Landningens råd "håll telefonen upprätt"
   (index.html steg-kort 2) har nu siffrorna som motiverar det. U22:s
   auto-zoom-per-orientering (u3:s leverans) ändrar INTE denna geometri
   (zoom ≠ fönstermin) — talen gäller oavsett zoomläge.
4. **Vidare väg (leverantörens yta):** app-min 480×640 är Electron-appens
   WM_NORMAL_HINTS (U11 F9: minWidth/minHeight i app.asar). Talen är
   förhandlingunderlaget U19 begärde — inte fabrikens att ändra.

## 3. FYND under utvecklingen (bokförda för eftervärlden)

1. **`xrandr --fb` verkställer DELVIS vid BadValue (02:21):** försöket att
   krympa 412×915 → 915×412 returnerade RANDR BadValue ("not large enough
   for output") MEN X-servern hade redan satt screen-storleken: current
   915×412 + VNC-0 **disconnected**. Lärdom: felkod ≠ inget ändrat på
   Xvnc — därför verifierar sonden varje sökväg mot xrandr current i
   polling-loop och avbryter högljudd. (Kurerad inom 90 s: `--fb 412×915`
   accepteras med frånkopplad CRTC + `--output VNC-0 --mode 412x915`
   återansluter — därefter desk-halsa **8/8 PASS**, invarianten hel.)
2. **`xrandr -s` accepterar ENDAST listade modes** på Xvnc (nya storlekar
   kräver RFB-vägen) — probed med dämpad stderr, fail-fast intakt.
3. **Kundvaktens false positive-klass:** hälsans webrot-kontroller och
   gränssnittsvakten curl:ar 6080 kortlivat — en naiv "established på 6080"-
   vakt blockerar mätningar som inget kundbesök. Skärpning: 5910 (websockifys
   upstream, ENDAST riktiga klienter) ELLER bestående 6080 i två avläsningar
   1,5 s isär. **Verktyget vägrade RÄTT vid båda verkliga tillfällena**
   (02:18:xx kort sond; 02:26 bestående nginx-proxad websocket = levande
   klient, troligen kunden — framebuffer orörd hela tiden).
4. **Duplikatkontrollens fångst:** U17 B1/U19 steg 2-rest (dubbelförvaringen
   av hjalp.html) var REDAN städad — /var/www/desk innehåller ENDAST
   index.html (5 791 B, mtime 02:00). Ingen ny leverans gjordes (duplikat =
   förlorat arbete); verifieringen i §4.
5. **RFB-sondens två wire-lärdomar** (för alla framtida sonder mot :10):
   (a) SetDesktopSize (msg 251) kräver PAD8 efter antal skärmar — exakt
   layout i noVNC rfb.js:3266-3286 (24 byte); (b) Xvnc verkställer först
   när klienten deklarerat pseudokodningarna -223/-308 via SetEncodings
   (rfb.js:2256/2260 — U20:s "-308-rect mottagen" var samma krav). Utan
   dessa tyst ignoreras begäran (ingen felkod!). Med dem: omedelbar
   verkställse, bevisad fyra gånger denna våg.

## 4. Verifiering: dubbelförvaringen LANDAD + serveringsvägarnas rotfakta

- `/var/www/desk/`: **endast index.html** — den döda hjalp-kopian (som en
  gång fångade U13V2 fynd A:s felriktade rättning) är borta; enda hem =
  desk-web (sha256 cbe8f0832eacec3511198033c7aff2235cd3b4c1e62e7f1c1fb071ba005c6828).
- Nginx-konfen (LÄST, orörd — /etc ägs av root-ronden) bevisar
  serveringslogiken: `location = /desk/` try_files ENDAST /desk/index.html;
  alla andra /desk/*-sökvägar proxys till 6080 → desk-web-kopian. Rådets
  preferens (U19 steg 2: "desk-web som enda hem") är därmed i fas med
  verkligheten — kvitto på att städningen är komplett, inte delvis.
- ROT-KÖ R9 lever (oförändrad, bekräftad i konfen rad 30): `location =
  /desk/h` 302 bär `resize=scale` — /etc-yta, root-rondens ägo.

## 5. Bevis — FÖRE/EFTER (egna mätningar, UTC)

| Bevis | FÖRE (02:14–02:18) | EFTER (02:24–02:37) |
|---|---|---|
| xrandr current | 412×915, VNC-0 connected | 412×915, VNC-0 connected (samma — incidenten §3.1 kurerad; mätserien körde 02:35 och lämnade tillbaka exakt utgångsläget) |
| desk-halsa | (8/8 PASS vid 02:24, EFTER incident-kuren) | **8/8 PASS · 4 auth-SKIP** (DESK_AUTH ej satt — svitens kontrakt; invarianten workarea == current hel) |
| fönster | 480×915+0+0, klampar 480 | d:o (sex mätningar i jsonl, alla +0+0 maximerade, klamp=true ×6) |
| kundvakten | TRUE-block 02:18:5x (kort sond) + TRUE-block 02:26–02:27 (bestående, kund ~90 s) | verktyget exit 2 båda gångerna, framebuffer orörd; mätserien körde först i tomt fönster (poll-fångst 02:27:33 + väntan till 02:35) |
| node --check desk-a2-matning.mjs | OK | OK (efter alla ändringar) |
| node …/tsc --noEmit | — | **exit 0** (src orörd — procedurens kvitto) |
| curl 127.0.0.1:6080/hjalp.html · /vnc.html | 200 · 200 | 200 · 200 (serverade hemmet opåverkat) |
| GET https://…/desk/ + /desk/hjalp.html utan auth | 401 · 401 | 401 · 401 (bommarna hela) |

## 6. KVD

- **Kod:** verktyg/desk-a2-matning.mjs — `node --check` OK; src/ orörd;
  `node node_modules/typescript/bin/tsc --noEmit` kört vid commit (kvitto i
  commit-meddelandet) — ingen bygge (verktyg + data = ingen prod-påverkan).
- **R2:** priser/tier/publicering orörda; data/blogg orörd; inget
  finansiellt innehåll; GDPR: mätningen läser geometri/räknare på serverns
  eget skrivbord — ingen persondata, ingen kaka, ingen insamling.
- **Ytor:** /etc + /usr orörda (R9 endast återmärkt); desk-halsa.mjs orörd
  (u2:s ägo — kördes endast som bevis); core/vendor/mandatory/defaults
  orörda; kundens session: framebuffer ALDRIG rört under upptaget fönster
  (kunden kan ha varit inne 02:26 — inget ändrades, hälsan grön omkring).

## 7. Källförteckning

- K1 = DESK-U16-KARNA-EXPERT.md A2 (rad 306 — min-hints-fyndet + px-förutsägelserna),
  A1/B2/B3 (settle-grind, --onlyvisible, timing-klasserna), §5 (reglagen).
- K2 = DESK-U19-RADSDOM.md §2.4 (A2 = planens A-post: "skadan skall beläggas
  i drift"), steg 4 (A2-px-tal per orientering = beviskravet denna våg bär).
- K3 = DESK-U20-SETDESKTOPSIZE.md (sondmetoden bevisad; RFB-kedjan hel).
- K4 = DESK-U15-STROMFARTSMATNING.md §0 (websockify upstream 5910 ENDAST vid
  riktig klient — kundvaktens signalgrund), §7.1 (instrument-principen).
- K5 = DESK-U17-NAT-EXPERT.md B1 + U19 steg 2 (dubbelförvaringens dom) —
  verifierad LANDAD denna våg.
- K6 = DESK-U23-LANDNINGEN.md (nummerkollisionen: U24 togs av u2 — detta
  protokoll = U25; efterordets lost-update-läxa: hash-kvitton på allt).
- M1–M9 = mätdatan ovan + jsonl-raderna + ss-utdragen + desk-halsa-körningen.

## RESULTAT

A2-TALEN LEVERERADE — U16 A2/U19 steg 4a stängt utan att vänta på
kundbesök: lagen "överflöd = min-hints − skärm per axel" bevisad i drift
med FYRA mätningar (kundens telefon 412×915/915×412: **68 px höger i
porträtt, 228 px botten i liggande**; U16-referenserna 844×390/390×844:
**250/90 px — förutsägelserna EXAKTA**). Porträtt = överlevbart
(kompositorn synlig), liggande = 228 px av just kompositorn osynlig —
landningens "håll telefonen upprätt" har nu sina siffror. Mätsonden
verktyg/desk-a2-matning.mjs levererad med tre protokollkontrakt (kundvakt
med 5910-signalen, --onlyvisible-målning, settle-grind) + RFB-sond med
noVNC:s exakta wire-format (fynd 5: PAD8 + -223/-308-deklaration krävs).
Biverifierat: dubbelförvaringen REDAN städad (endast index.html i
/var/www/desk), nginx serveringsvägar belagda, ROT-KÖ R9 lever. Skrivbordet
lämnat i exakt utgångsläge (412×915, connected, 8/8 PASS).
