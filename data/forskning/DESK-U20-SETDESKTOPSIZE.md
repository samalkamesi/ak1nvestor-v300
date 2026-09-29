# DESK-U20 — Rot-utredning: varför nådde aldrig SetDesktopSize X-servern?

Datum: 2026-09-29 · Agent: fabriksbarn u20 (BYGGARE) · Ägarskap: ENDAST protokollet
Uppdrag: r322:s loopback-acceptansprov (headless Chrome 900x500 öppnade
`vnc.html?resize=remote` i 16 s mot 127.0.0.1:6080; xrandr current förblev
412x915) — vilken länk i kedjan klient → websockify → Xvnc bröt?

## Sammanfattning (TL;DR)

**Begäran nådde aldrig X-servern eftersom den aldrig skickades — klienten
anslöt aldrig.** r322:s prov-URL saknade `autoconnect`; utan den visar noVNC
bara connect-panelen och `UI.connect()` anropas aldrig (belagt i ui.js:149-157).
defaults.json har ingen autoconnect-nyckel som täcker hålet. ALLA andra länkar
är i denna utredning **direkt bevisade fungerande** med egna RFB-sonder: genom
websockify 6080 skickade sonden SetDesktopSize 900x500 och xrandr svarade
`current 900 x 500`; återställning till 412x915 verifierad. Kedjan
kod → tunnel → Xvnc är hel — provköran från r322 startade den aldrig.

## Kedjan som undersöktes

```
[Chrome vnc.html?resize=remote] → ws → [websockify 127.0.0.1:6080] → TCP → [Xvnc :10 = 127.0.0.1:5910]
```

Källor till kedjefakta: systemd `zdesk-novnc.service`
(`/usr/bin/websockify --web /home/ak1a/desk-web --heartbeat 30 127.0.0.1:6080
localhost:5910`) och `zdesk-xvnc.service` (`/usr/bin/Xvnc :10 -geometry 412x915
-depth 24 -localhost -SecurityTypes None`); körande processer bekräftade med
`ps aux` (PID 573627/578788). Versioner: websockify 0.13.0, TigerVNC
standalone-server 1.15.0, noVNC-paket 1.6.0 (desk-web = anpassad kopia av
samma generation) — alla tre ur `dpkg -l`.

## Metod

1. **Passiv kodläsning** av hela klientledet: desk-web/core/rfb.js,
   core/encodings.js, app/ui.js, app/webutil.js, vnc.html, defaults.json,
   mandatory.json.
2. **Aktiva RFB-sonder** (skript i /tmp, utanför repot): en minimal
   RFB 003.008-klient som själv genomför handskakning, SetEncodings med
   pseudo-encoding -223 och -308, full framebuffer-begäran, läsning av
   serverns svar, samt slutligt SetDesktopSize 900x500 → xrandr-kontroll →
   återställning 412x915. Kördes (a) direkt mot TCP 5910 och (b) genom
   websockify ws://127.0.0.1:6080/websockify — hela prod-kedjan utom webbläsaren.

## Fynd 1 — Klientkoden är hel (resize-vägen finns och är korrekt)

Varje steg i noVNC:s resize-flöde är på plats i desk-web:

| Steg | Belägg (fil:rad) |
|---|---|
| Pseudo-encodings finns och sänds | `core/encodings.js:23` `pseudoEncodingDesktopSize: -223`, `:29` `pseudoEncodingExtendedDesktopSize: -308`; `core/rfb.js:2256+2260` pushar båda i SetEncodings |
| SetDesktopSize-meddelandet (msg 251) | `core/rfb.js:3266-3287` — korrekt wireformat: u8 251, pad, w, h, 1 skärm, id/x/y/w/h/flags |
| Sändningsvillkor | `core/rfb.js:792-832` `_requestRemoteResize`: kräver `resizeSession` + ej viewOnly + `_supportsSetDesktopSize` + ny storlek ≠ fb-storlek |
| Stödet aktiveras av SERVERN | `core/rfb.js:2907-2908` — `_supportsSetDesktopSize` sätts `true` först när en ExtendedDesktopSize-rect (-308) mottagits; rad 2967-2968: vid första -308 körs `_requestRemoteResize()` automatiskt |
| remote-läge sätts vid anslutning | `app/ui.js:1119` `UI.rfb.resizeSession = UI.getSetting('resize') === 'remote'` |
| `?resize=remote` läses | `app/webutil.js:32-43` `getQueryVar` (regex på location.href), används av `app/ui.js:771-786` `initSetting` → `WebUtil.getConfigVar(name)` (webutil.js:61-70, hash före query) |
| defaults.json lastas | `vnc.html:64-73+97-98` fetch `./defaults.json` → `UI.start({settings:{defaults}})`; filen (efter u21:s C2) innehåller `"resize": "remote"` |
| mandatory.json | finns, innehåller `{}` — ingen tvingning |

Notera uppdragsformuleringens "-22": korrekt värde för pseudo-encoding
DesktopSize är **-223** (0xFFFFFF21) och ExtendedDesktopSize är **-308**
(0xFFFFFECC) — det senare var också söktermen som avgjorde sonden (se fynd 3).

## Fynd 2 — websockify 0.13 är transparent (bevisat, inte antaget)

`websockify --help` visar ren tunnelverksamhet (websocket→TCP, token-plugin,
heartbeat — ingen RFB-parsning). Beviset är dock empiriskt: sonden genom
`ws://127.0.0.1:6080/websockify` erhöll **identiska** serversvar som direkt-TCP
mot 5910: samma handskakning, samma -308-rect (fynd 3), och — avgörande —
SetDesktopSize 900x500 genom tunneln verkställdes av Xvnc (xrandr ändrades).
Pseudo-encodings och meddelande 251 passerar obehindrat.

## Fynd 3 — Xvnc 1.15 stödjer och VERKSTÄLLER SetDesktopSize (r322-frågan vänd)

Sondens rådump av Xvnc:s svar på `SetEncodings [raw, -223, -308]` +
full framebuffer-begäran (direkt mot 5910, identiskt via 6080):

```
00 00 00 01                          ← FramebufferUpdate, 1 rect
00 00 00 00 01 9c 03 93              ← rect x=0 y=0 w=412 h=915
ff ff fe cc                          ← encoding 0xFFFFFECC = -308 ExtendedDesktopSize ✓
01 00 00 00                          ← 1 skärm + pad
6b 8b 45 67                          ← screen-id 0x6B8B4567 (Xvnc:s RANDR-id)
00 00 00 00 01 9c 03 93 00 00 00 00  ← x=0 y=0 412x915, flags=0
```

Servern annonserar alltså tillägget PÅ EGEN HAND vid första uppdatering —
exakt det som sätter `_supportsSetDesktopSize=true` hos klienten.

**Slutprovet (hela kedjan genom websockify 6080):**

```
>> fb 00 03 84 01 f4 …               ← SetDesktopSize 900x500 (msg 251, screen-id ovan)
xrandr EFTER 900x500-begäran: Screen 0: minimum 32 x 32, current 900 x 500 …  ✓✓
>> fb 00 01 9c 03 93 …               ← återställning 412x915
xrandr EFTER ÅTERSTÄLLNING: Screen 0: … current 412 x 915 …                  ✓✓
```

RANDR är aktivt på :10 (`DISPLAY=:10 xrandr --current` visar moder 412x915,
1920x1200, 1920x1080 …). Sekundära observationer, redovisade för ärligheten:

- **flags=0 i serverns -308-rect.** Spec-texten säger bit 0 = klienten får
  begära layoutändring; Xvnc 1.15 rapporterar 0 men **verkställer ändå** —
  direktbevisat av xrandr ovan. Ej blockerare, men värt minne vid framtida
  feltolkning av flags.
- **Ingen bekräftande -308-rect (x=1 "this client") observerades inom sondens
  4-s-fönster**, trots att verkställigheten skedde omedelbart. TigerVNC skickar
  troligen bekräftelsen först i samband med nästa framebuffer-begäran (noVNC
  pollar kontinuerligt i skarp drift, så klienten får den). Icke-blockerande.

## Fynd 4 — BRYTLÄNKEN: r322:s provskript anslöt aldrig (autoconnect saknades)

`app/ui.js:149-157` (UI.start-slutet):

```js
let autoconnect = UI.getSetting('autoconnect');
if (autoconnect === 'true' || autoconnect == '1') {
    autoconnect = true;
    UI.connect();
} else {
    autoconnect = false;
    // Show the connect panel on first load unless autoconnecting
    UI.openConnectPanel();
}
```

- Default är `false` (`app/ui.js:192` `UI.initSetting('autoconnect', false)`).
- `defaults.json` (inläst i fulltext) innehåller INGEN autoconnect-nyckel —
  det finns ingen server-side låsning som täcker hålet.
- r322:s URL var `vnc.html?resize=remote` — **utan** `autoconnect=1`.

Följd: headless-Chrome renderade connect-panelen i 16 s; `UI.connect()`
anropades aldrig; inget RFB-sessionsinitiative → inga SetEncodings → serverns
-308 togs aldrig emot → `_supportsSetDesktopSize` förblev false →
`_requestRemoteResize` returnerar tidigt (rfb.js:799-801) → **SetDesktopSize
skickades aldrig**. xrandr orörd — fullt förenligt med r322:s observation
("begäran nådde aldrig/förkastades"; svaret är: den första).

## Kedjedom och kur

| Länk | Status | Bevis |
|---|---|---|
| rfb.js resize-flöde | HEL | fynd 1 (kodrader) |
| ?resize=remote-param + defaults | HEL | fynd 1 (webutil/ui/vnc.html/defaults.json) |
| websockify 6080 | HEL, transparent | fynd 2 (identiska svar via 6080) |
| Xvnc -308-annonsering | FUNGERAR | fynd 3 (rådump) |
| Xvnc SetDesktopSize-verkställighet | FUNGERAR | fynd 3 (xrandr 900x500 → 412x915) |
| **r322 provköra: autoconnect** | **BRUTEN — begäran skickades aldrig** | fynd 4 (ui.js:149-157 + URL + defaults.json) |

**KUR (exakt):** nästa acceptansprov kör

```
http://127.0.0.1:6080/vnc.html?autoconnect=1&resize=remote
```

i headless Chrome 900x500, vänta ≥5 s, kontrollera `DISPLAY=:10 xrandr
--current` → förväntat `current 900 x 500` (därefter återställ genom att
stänga fliken och köra landskaps-/porträtttjänst som idag). Samtliga
protokollförutsättningar är i denna utredning bevisade uppfyllda, så ett misslyckande
med denna URL vore ett NYTT fynd (t.ex. Chrome headless viewport=0x0 → sondens
`_screenSize()`-hypotes, se nedan) — inte samma rot.

**Kontra-hypoteser som EJ behövs för förklaringen men dokumenteras för nästa prov:**
om autoconnect-URL:en ändå inte resize:ar: (a) headless viewport — om
`--window-size` ej nått `#noVNC_container`-elementets layout blir `_screenSize()`
0x0 och villkoret "ny storlek ≠ fb" (rfb.js:820) kan ge ogiltig begäran;
kontrollera med `?logging=debug` (noVNC-loggen skriver "Requested new desktop
size"); (b) viewOnly param borta i URL (ui.js:1124 `updateViewOnly`).

**Beslutsnotering (ej mitt att besluta):** en permanent `"autoconnect": true`
i defaults.json skulle ta bort Connect-knappen för kundens telefonflöde — det
är en upplevelseändring (r322-protokollets domäner), inte protokollfixen, och
lämnas till rådet/kunden. Hjälpsidans länkar (U19:s scale-pin-ärende) bör när
de rättas få `autoconnect=1&resize=remote` för att vara testbara.

## Protokoll-loggningsförslag (nästa steg om tvivel kvarstår)

Passiv bevisning är nu utförd; om nästa prov ändå behöver vattenfasta spår:
`socat TCP-LISTEN:5912,reuseaddr,fork TCP:127.0.0.1:5910` + peka websockify
på 5912 och kör `tcpdump -i lo -w /tmp/rfb.pcap port 5912` under provet
(filter `rfb` i wireshark visar msg 251 och -308-rectar direkt), eller
`websockify --log-file` (0.13 loggar dock bara ws/http-liv, ej RFB-innehåll —
därav socat/tcpdump-vägen). Loopback = ingen GDPR-yta.

## Sondernas spår

Skript: `/tmp/sond-rfb-u20.mjs`, `/tmp/sond-raw.mjs`, `/tmp/sond-raw2.mjs`,
`/tmp/sond-raw3.mjs` (utanför repot, engångs). Xvnc :10 lämnades i
`current 412 x 915` (återställningsbelägg ovan); Xvnc :11 (landskap) rördes
aldrig; inga filer i repot ändrades av sonderingarna — endast denna
utredningsfil committas.

## Källförteckning

- Kod: desk-web/core/rfb.js (rader 149-153, 363-367, 792-832, 2250-2273,
  2689-2694, 2895-2969, 3266-3287), core/encodings.js:23+29,
  app/ui.js (149-157, 192-194, 771-786, 1117-1119), app/webutil.js (32-70),
  vnc.html (49-99), defaults.json, mandatory.json
- System: systemctl cat zdesk-xvnc/zdesk-novnc(-land).service; ps aux;
  dpkg -l (tigervnc 1.15.0, websockify 0.13.0, novnc 1.6.0);
  DISPLAY=:10 xrandr --current (före/under/efter)
- Sondbelägg: utskrifter i fynd 2-3 (råa hex-dumpar + xrandr-rader, ovan)
- Bakgrund: data/forskning/DESK-U19-RADSDOM.md (rader 39-50, 336: dubbelförvaring
  + död nyckel `compress`→`compression`, nu rättad av u21 enligt commit eed9a1b1)

RESULTAT: brytlänk KLIENTSTART (belagd: r322:s URL saknade autoconnect → UI.connect() anropades aldrig → SetDesktopSize skickades aldrig; ui.js:149-157 + defaults.json utan nyckel) + kur vnc.html?autoconnect=1&resize=remote i 900x500-headless-Chrome med xrandr-kontroll (förväntat current 900x500; hela websockify+Xvnc-kedjan i denna utredning direkt bevisad fungerande, skrivbordet återställt 412x915)
