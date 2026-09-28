# DESK-U10 — Strömfart: ak1a-ägda reglage implementerade (2026-09-28)

**Våg:** v202-u3 (agentfabrik, BYGGARE) · **Uppdrag:** implementera u1:s
reglagekarta (DESK-U5-STREAMFART.md, v201) — ENDAST ägare "ak1a-yta" +
risk LÅG. Root-ägda reglage lämnas som förslag-tabell (RÖR ALDRIG).
**Ägarskap:** `/home/ak1a/desk-web/defaults.json` (ak1a-ägd web-yta) +
detta protokoll. Core/vendor/oro ägor orörda.

---

## 1. Sammanfattning (tre rader)

1. **ETT reglage implementerat:** `defaults.json` `"quality": 6` → `2` —
   u1:s enda HÖG-vinst/låg-risk/ak1a-ägda ändring med exakt rad given
   (u1 §5 reglage 1). Live direkt — websockify serverar statiskt utan omstart.
2. **TVÅ ak1a-reglage medvetet LÄMNADE orörda** med protokollstöd:
   `resize:"remote"` (u1: risk MEDEL + eget råd "defaults.json orörd för
   datorn") och `compression` 2→5 (u1: "osäker, mät" + v200-u2: "inget
   gissningsvärde satt" — två oberoende protokoll förbjuder gissning).
   Båda har noll-risk-bokmärken i stället (§4).
3. **Konflikt mot äldre våg redovisad och löst:** v198-u4 satte quality 6
   ("balanserat"), v200-u2 höjde 3→6 av läsbarhetsskäl UTAN källstod —
   v201-u1 (nyast) belägger att text inte ritas via JPEG-vägen alls
   (tight.js filterswitch) ⇒ u5 övertrumpar. Ärlighetsbokföring i §3.

## 2. Före/efter — genomförd ändring

| Fil | FÖRE | EFTER | Källhänvisning (u1:s bevis) |
|---|---|---|---|
| `/home/ak1a/desk-web/defaults.json` rad 3 | `"quality": 6` | `"quality": 2` | u1 §5 reglage 1: quality skickas som pseudo-encoding som styr serverns JPEG-komprimering (`core/rfb.js:2253`); Tight-JPEG-rects är hela JPEG-filer (`core/decoders/tight.js:85-91`) — kvalitetssiffran är protokollets enda bitrate-brytare. 6/9 = nära max. Exakt ändring given av u1: "defaults.json rad 3 `"quality": 6` → `2`". |

Före-sha `eec0d799…` = identisk med v200-u2:s bokförda sha ⇒ inget annat
har rört filen mellan vågorna. Övriga fyra nycklar orörda
(`resize:"scale"`, `show_dot:true`, `reconnect:true`, `compression:2`).

**Verkställandekedja (u4 §2, verifierad karta):** defaults.json →
`ui.js:752-770 initSetting` → vid anslutning `ui.js:1098-1102`:
`rfb.qualityLevel = parseInt(quality)` → pseudo-encoding
`pseudoEncodingQualityLevel0 + 2` till Xvnc (u1 §2). Giltigt intervall
0-9 heltal, hårdvaliderat (`rfb.js:383-413`).

**När defaultet börjar gälla:** första besöket/färsk telefon (tomt
localStorage). Har kunden tidigare rört kvalitets-slidern står deras
sparade värde kvar — då krävs bokmärke `?quality=2` (query vinner
ALLTID, u1 §1: ui.js initSetting + webutil.js:59-67). Reglaget finns
också i panelen: Kvalitet-slider 0-9 (vnc.html:261-262, sparas i
localStorage via writeSetting). Webbläsarens cache: filen hämtas med
Last-Modified-validering — kraft-omladdning garanterar färsk fil.

## 3. Ärlighetsbokföring — konflikten quality 6-mot-2

| Våg | Ställning | Skäl | Status idag |
|---|---|---|---|
| v198-u4 (DESK-U4-NOVNC-DEFAULTS §3) | quality 6 | "uppströms balanserat läge" — dokumentationsval, inget fartmått | övertrumfad |
| v200-u2 (DESK-U4-MOBILFART §90) | 3 → 6 | "JPEG-kvalitet ≤3 ger synliga artefakter i nedskalad text" — UTAN källhänvisning; sänkningen till 3 "saknade protokollstöd" | övertrumfad |
| v201-u1 (DESK-U5 §5:1) | 6 → 2 | KÄLLBELAGT: text går inte via JPEG-filtervägen — Tight:s filterswitch använder JPEG endast för fotoliknande rektanglar (`core/decoders/tight.js:44-137`); text/solida ytor går Tight:s övriga filter. Risk suddighet begränsad till foto-/gradient-ytor. | **IMPLEMENTERAD här** |

v200-u2:s textartefakt-invändning saknade alltså källbelägg och
motbevisas av u1:s filterswitch-läsning. Kunden har dessutom två
noll-kostnadsåtervägar om 2 känns för suddigt: slidern i panelen eller
bokmärke `?quality=3` (u1:s spektrum var 2-3).

## 4. Medvetet LÄMNADE ak1a-reglage (med skäl och bevis)

| Reglage (u1 nr) | Förslag | Varför lämnat | Noll-risk-alternativ åt kunden |
|---|---|---|---|
| 2. `resize: "scale"` → `"remote"` | HÖG vinst på mobil | u1: risk **MEDEL** (WM-layout flyttas när framebuffer ändras) + u1:s eget råd: "bäst per-enhet: bokmärke `?resize=remote` på telefonen, defaults.json orörd för datorn". Uppdraget gav mandat ENDAST risk LÅG. | Bokmärke på telefonen: `…?resize=remote` — färre pixlar i framebuffer (~2,6× färre än 1024 px bred, u1 §5:2), datorn orörd |
| 4. `compression: 2` → 5 | MEDEL (osäker) | u1: "Netto-vinsten är omdömesfråga som INTE kan avgöras ur källorna → mät" + mer dekomprimerings-CPU i telefonens pako (`vendor/pako`, `core/inflator.js`). v200-u2 (§92): "kan INTE bevisas passivt… inget gissningsvärde satt". Två protokoll = inget värde hittas på. Mätverktyget (u1 reglage 6) kräver root. | A/B-bokmärke `…?compression=5` när kunden vill testa; slided i panelen |

## 5. Root-ägda förslag — RÖRDA EJ denna våg (tabell åt root-ronden)

| u1 nr | Reglage | Exakt åtgärd (root) | u1:s vinst/risk |
|---|---|---|---|
| 3 | FrameRate 60 → 30 | `/etc/systemd/system/zdesk-xvnc.service` ExecStart += `-FrameRate=30`; daemon-reload + restart | HÖG-MEDEL vid rörelse / låg |
| 5 | gzip + cache-header framför :6080 | nginx-plats som proxyar :6080 med `gzip on` + `Cache-Control` + wss→ws-upgrade (~580 KB råa assets per första laddning, u1 §4) | MEDEL (endast laddningsfas) |
| 6 | Mätbarhet | zdesk-novnc.service ExecStart += `--log-file=/var/log/zdesk-websockify.log`; tillfälligt `--traffic` | MEDEL (krävs för att ranka vidare) |
| 7 | CompareFB 2 → 1 | `-CompareFB=1` i zdesk-xvnc.service | LÅG (kan ej motiveras ur help-texten) |
| 8 | -schedInterval | help ger ingen koppling till genomströmning | LÅG — avvakta |
| 9 | websockify --libserver | noll prestandaanspråk i help; byter bara motor utan bevis | LÅG — avvakta |

Fällor som u1 avskrev (gäller även här): minska ALDRIG depth till
16/rgb565 (`rfb.js:2237-2249` slår av ALL komprimering vid fbDepth≠24);
TurboVNC-flaggorna finns inte på burken; heartbeat 30 är keepalive.

## 6. KVD — utdata (klistrad)

```
FÖRE:
$ sha256sum /home/ak1a/desk-web/defaults.json
eec0d7997a5777c7da2905b58f2fc7ca3e00f529e0af9b16cad771d5942190d2
$ node -e 'JSON.parse(…)' → GILTIG — quality: 6 compression: 2
$ curl http://localhost:6080/defaults.json → HTTP 200, quality: 6
$ curl https://lab.ak1nvestor.com/desk/defaults.json → HTTP 401 (auth-väggen)

EFTER:
$ node -e 'const d=JSON.parse(…); …'
GILTIG — nycklar: resize,quality,show_dot,reconnect,compression | quality: 2 | compression: 2 | resize: scale
$ sha256sum /home/ak1a/desk-web/defaults.json
431adf9a58ac137fb6d230df3ebed8b1737b990f436b002926ab3afdd65cedfa
$ curl -w '…' http://localhost:6080/defaults.json → HTTP 200
  svar innehåller: "quality": 2 (live direkt — statisk servering)
$ curl https://lab.ak1nvestor.com/desk/defaults.json → HTTP 401 (auth-väggen hel)
$ curl http://localhost:6080/vnc.html → HTTP 200 (klienten lever)

Processpåverkan: NOLL — ingen omstart, ingen tjänst rörd (statiska filer).
src/** i AK1-repot: orört ⇒ tsc baslinje oförändrad (pre-commit-grinden
körd mekaniskt vid commit).
```

**Ärlighetsnotering om processen:** ett skrivfel under verkställelsen
(sammanslagen rad `"resize": "quality": 2,` = ogiltig JSON) fångades
OMEDELBART av KVD:s JSON-parse-steg och rättades i samma omgång —
efter-kvittona ovan gäller den korrekta filen. Bokförs som bevis för
att valideringssteget gör jobbet.

## 7. Juridik

Ren klientkonfiguration för strömkomprimering — inget finansiellt
innehåll, inga råd, inga texter mot kund (2007:528 berörs ej). GDPR/
kakor: oförändrat — noVNC lagrar endast lokala inställningar i
webbläsarens localStorage (webutil.js:142-151); denna våg sätter ingen
kaka och ändrar ingen insamling.

## 8. Rollback

`/home/ak1a/desk-web/defaults.json` rad 3 tillbaka till
`"quality": 6` (före-sha `eec0d799…`, efter-sha `431adf9a…`). Statiskt
serverad — effektiv direkt vid nästa laddning, ingen omstart. Också
mjukare variant: kunden höjer själva via Kvalitet-slidern (sparas i
localStorage och vinner över defaults).
