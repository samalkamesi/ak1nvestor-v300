# DESK-U31 — MOBIL-TANGENTBORDET: kontrollteckens-döden + tvillingdedup (U24 GAP 6 delkur)

**Våg:** s11-u3 (manifest auto-s11-1790855728248, byggare 3/3) · 2026-10-01 12:04–12:2x UTC
**Fyndklass:** U24 GAP 6 ("Mobil-tangentbordet är ett hackat input-fält") — delkur:
de tyst döda kontrolltecknen + tvillingsändning. Uppföljning av U24 § 5-tabellen
("GAP 6: noVNC-patch DELVIS MÖJLIG — mönsterförbättring") och U30:s
"NÄSTA I SPÅRET: U24 GAP 6 förblir spårets högsta öppna patchbara objekt".

## § 1 Sammanfattning (kunden)

Tryckte kunden **Enter** eller **Tab** på telefonens tangentbord inne i
skrivbordsströmmen hände ingenting i ZCode — tangenten dog tyst på vägen.
Orsaken låg i översättningstabellen mellan telefonens tangentbord och
fjärrskrivbordet: vanliga svenska bokstäver (å ä ö Å Ä Ö) mappas rätt, men
kontrolltecknen (Enter, Tab, retur) föll under tabellens golv och blev
"okända tangenter" som fjärrdatorn släpper tyst. Kuren översätter dem till
X:s äkta Enter/Tab-tangenter. Bonus: en dubblettgard som stoppar tecken att
skickas två gånger när telefonens två inmatningsvägar levererar samma tecken.
Båda webbrockarna serverar koden direkt — ingen omstart, kundens ström
orörd.

## § 2 Fyndet — två belagta brister i input-fallet

Kedjan för telefonens tangentbord (mätt i källkod, FÖRE-tillstånd):

```
OSK-tangent → keydown [keyCode 229 på OSK] → Keyboard-vägen DÖR
           → input-händelse → ui.js keyInput (deltajämförelse mot 99 '_')
           → rfb.sendKey(keysyms.lookup(charCode))
```

**FYND A — kontrollteckens-döden (huvudfynd):**
`core/input/keysymdef.js` `lookup(u)`: Latin-1-grenen gäller ENDAST
`0x20 <= u <= 0xff` ("Latin-1 is one-to-one mapping"). Kodpunkterna under
golvet — `'\n'` (10), `'\r'` (13), `'\t'` (9) — hamnar i
codepoints-tabellen (som saknar alla tre, B1-testet) och vidare i
fallbacken `0x01000000 | u` ⇒ keysym `0x0100000A` (resp `0x0100000D`,
`0x01000009`). Det är Unicode-världskeysyms — INTE `XK_Return` (0xff0d)
eller `XK_Tab` (0xff09) — och TigerVNC-serversidan har ingen
tangentmappning för dem: **Enter/Tab från OSK:t når aldrig appen.**
Förstärkande led i samma kedja: `core/input/keyboard.js` `_getKeyCode`
ignorerar keyCode 229 ("229 is used for composition events") — OSK:ts
keydown når inte Keyboard-vägen, så input-vägen är telefonens ENDA levande
stig. Där gick Enter att förlora.

**Kundpåverkan:** ZCode-chatten och terminalen skickas med Enter — på
telefonen kunde kunden skriva men inte "trycka på OK" i textfält som kräver
Enter; Tab-navigation död. (Kompensation: musklick på knappar fungerar —
därför överlevde gapet detta länge.)

**FYND B — tvillingsändning (kontraktsbrytelsen):**
`keyInput`s egen kommentar utlovar fallback-beteende — *"When normal
keyboard events are left uncought, use the input events … instead"* — men
koden skickar sitt delta ALLTID. På OSK-plattformar som levererar BÅDE en
äktta keydown (t.ex. iOS: key='å', code='Unidentified' → Keyboard-vägen
skickar press+release via "Unidentified"-grenen) OCH en input-händelse
skickas tecknet två gånger. Ingen känd belagd kundrapport inom spåret, men
klassen är strukturellt identisk med den noVNC-dokumenterade principen —
koden bröt mot sitt eget kontrakt.

## § 3 Kuren (app-lagret — core/vendor SHA-identiska)

I `/home/ak1a/desk-web/app/ui.js` (vår kopia, DESK-U31-märkt):

1. **`keysymForInputChar(ch)`** (ny, mellan keyEvent och keyInput):
   - `'\n'`/`'\r'` → `{ keysym: KeyTable.XK_Return, code: "Enter" }`
   - `'\t'` → `{ keysym: KeyTable.XK_Tab, code: "Tab" }`
   - övriga → `keysyms.lookup(ch.charCodeAt(0))` **oförändrad** (å/ä/ö/Å/Ä/Ö
     ∈ Latin-1 0x20–0xff mappas identiskt som före — C1/C2-testen).
   - Returnerar `null` om keydown-vägen levererat samma keysym inom
     **150 ms** (FYND B:s kur).
2. **`keyEvent`** (touchKeyboard.onkeyevent — ENBART textareans Keyboard,
   rfb:s dokument-Keyboard berörs ej): vid `down` minns
   `UI._kbdSenastKeydown = { keysym, ts }` — dedup-ankaret.
3. **Skickloopen i `keyInput`**: `const par = UI.keysymForInputChar(...)`;
   `if (par === null) continue;` — nakna `keysyms.lookup(...)`-raden borta.

**Medvetet lämnat orört:** Backspace-raden i keyInput (XK_BackSpace,
"Backspace") — den har sin dedupklass teoretiskt men rör NETTO-raderingens
kontrakt som fungerat i drift; ingrep utan telefonprov vore
speculation-first (r318/r327-läxan). Core-filerna (keysymdef Latin-1-golvet,
keyboard.js 229-grenen) = uppströms-gräns, botas ej i vår kopia.

## § 4 Före/efter

| Kontrakt | FÖRE | EFTER |
|---|---|---|
| Enter ('\n'/'\r') från OSK | keysym 0x0100000A → serverns släpper tyst = DÖD | XK_Return 0xff0d + code "Enter" |
| Tab ('\t') från OSK | keysym 0x01000009 = DÖD | XK_Tab 0xff09 + code "Tab" |
| å/ä/ö/Å/Ä/Ö (0xE5/0xE4/0xF6/0xC5/0xC4/0xD6) | Latin-1 identisk mappning | **oförändrad** (C1/C2) |
| Tecken med keydown-tvilling | skickades DUBBELT (kontraktsbrott) | stryks (150 ms dedup på keysym) |
| app/ui.js sha256 | e84a466d… (U29-versionen, orörd sedan 09-30) | ec56af93… |
| core/+vendor/ samlad sha256 | 81f9a37a76… | 81f9a37a76… **IDENTISK** |

## § 5 Bevis (körda 2026-10-01 12:10–12:2x UTC)

- **Strukturtest** `verktyg/testa-desk-tangentbord.mjs` (NYTT): **13/13 PASS**
  (A1-A4 kurens koppling · B1-B3 rotens fortlevnad i core — Latin-1-golv +
  saknade 10/13/9-mappningar + 229-kommentarsspråk · C1-C3 svenska tecken
  orörda · D1-D2 SHA-kontrakt · E1 spårbarhet). Exit 0.
- **node --check** (ESM-väg, tmp-.mjs-kopia): OK.
- **Live-versionsbevis**: `curl 127.0.0.1:6080/app/ui.js` OCH
  `127.0.0.1:6081/app/ui.js` bär båda `keysymForInputChar` (3 träffar i
  utsvaven) — webbrockarna serverar nya koden direkt från disk, ingen
  omstart, kundens ström orörd.
- **Bommen opåverkad**: `https://…/desk/h/vnc.html` utan auth => 401.
- **tsc** (`node node_modules/typescript/bin/tsc --noEmit`): 0 fel, exit 0
  (src orörd — inget bygge).
- **desk-halsa** i slutläget: **9/9 PASS** (4 SKIP, u2:s U30-version —
  kedjan grön i helhet; körning efter min leverans).

## § 6 Kvarvarande (ärligt)

- **Riktigt telefonprov** av Enter/Tab-känslan i ZCode (r318/r327-läxan:
  strukturtest bevisar kontrakten, inte fingrarna) — första kundbesöket
  efterlever.
- **iOS-dubbel-'å'**: dedup försvarar fallet keydown+input; om iOS
  composition-text skriver OM tecknet efter >150 ms kan dubblett teoretiskt
  återstå — telefonprovsobjekt.
- **GAP 6 full IME-vidarebefordran** (U24: "betydande arbete"), **GAP 3/5**
  (konstanter i core = förbjuden yta + telefonprovsberoende), **GAP 4**
  (protokollsgräns, kvarstår efter serverbyte) — oförändrade.
- **Uppströms**: keysymdef Latin-1-golvet och keyboard.js 229-grenen är
  noVNC-uppstömskod — vår kopia kurar i app-lagret; vid framtida
  noVNC-versionspaket måste U31-kuren följa med (test D2 fångar tyst
  bortfall).

## § 7 KVD

src/ orörd · core/vendor/defaults/mandatory SHA-identiska · /etc + /usr
lästa aldrig skrivna · /var/www/desk orörd (u2:s uteslutna yta) ·
verktyg/desk-halsa.mjs = u2:s yta, ENDAST KÖRD · DESK_AUTH aldrig rörd ·
data/blogg orörd · R2 orörd · inga processomstarter (kundens X-session,
pm2, zdesk-enheter orörda) · GDPR: inga personrör.

**Källor:** K1 core/input/keysymdef.js (Latin-1-gren, codepoints, fallback)
· K2 core/input/keysym.js (XK_Return/XK_Tab/XK_Linefeed) · K3
core/input/keyboard.js (_getKeyCode 229-gren, Unidentified-press+release) ·
K4 app/ui.js FÖRE (keyInput-deltalogik, keyEvent) · K5
data/forskning/DESK-U24-BERORNINGSGAP.md (GAP 6 § tabell) · K6 worklog
U29/U30 (spårets leveransstil, live-versionsbevismönstret) · M1-M3 egna
mätningar (SHA, curl, strukturtest).
