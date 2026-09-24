# AK1A — Varumärkesarkiv (icke publik)

Detta är varumärkesmaterialets **arkivplats utanför den publika webbytan**
(`public/` serveras rakt av på lab.ak1nvestor.com — allt här är offline).

Flyttat hit i **o111** (spår 7, fabriksagent s7-u3, 2026-09-20) ur
`public/ak1a/logo/` + `public/ak1a/`: lagret var o101:s bokförda fynd
"public/-hyllerågor" — 1,5 MB varumärkesmaterial låg publikt exponerat men
referenserades av noll sidor, noll manifest, noll service worker, noll verktyg
(bevis: o111 §2 användningsmatrisen).

## Platsens regel

Regeln i varumärkesregistret (`public/ak1a/logo/README.md` §Regler pkt 5)
gäller OFÖRÄNDRAT här: **originalen raderas aldrig — de är källan till
framtida varianter.** Arkivet är permanent; inget här ska städas bort,
endast flyttas TILLBAKA till `public/` om en framtida variant behöver bli
publik (då: bearbeta till egen fil, publicera BEARBETAD version — aldrig
råoriginalen).

## original/ — skulptur-originalen (arkiv, orörda)

| Fil | Beskrivning (ur varumärkesregistret) | Faktisk typ |
|---|---|---|
| `skulptur-1.jpg` | Vinkel 1 — gråskuggig bakgrund (ej lämplig som märke) | JPEG 1536×1024, 85 KB |
| `skulptur-2.jpg` | Vinkel 2 — ren vit bakgrund, KÄLLAN till mark + transparent | JPEG 1536×1024, 65 KB |
| `skulptur-3.jpg` | Vinkel 3 — hel skulptur med krona, porträtt (källa till hero) | JPEG 1440×3200, **1 218 KB** — o101:s tyngsta fynd; Android-foto, EXIF 2026-09-03 |

## ikoner/ — oreferenserade ikon/logovarianter

| Fil | Faktisk typ | Not |
|---|---|---|
| `ikon-192.png` (logo-variant, 13 KB) | PNG | Oreferenserad dublett av PWA-ikonen — manifestet använder `/ak1a/ikon-192.png` (roten) |
| `ikon-512.png` (logo-variant, 80 KB) | PNG | Oreferenseradvariant — manifestet använder `/ak1a/ikon-512.png` (roten, 21 KB) |
| `logo-transparent.png` (67 KB) | **JPEG (JFIF) med .png-ändelse** | o101:s felmärkningsfynd: innehållet är JPEG 1024×1024, ändelsen ljuger. Ligger arkiverad SOM DEN ÄR (transkodning = bearbetning, ägarens beslut); superseded av registrets `skulptur-utan-bakgrund.png` (äkta transparent PNG) |

## Provens

Användningsmatris + beslutslogg: `data/forskning/OPTIMERING/o111-publicstad-skulptur-s7.md` (o111, spår 7).
Aktiva standarder kvar på sin plats: skulptur-mark.jpg (primär, använd av
`VarumarkesLogo`), skulptur-utan-bakgrund.png + skulptur-hero.jpg (deklarerad
aktiv standard i registret — kvar i `public/ak1a/logo/` även om hero än inte
referenserats; registret är sanningen, ej aktuellt bruk).
