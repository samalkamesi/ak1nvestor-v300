# AK1A Research Lab — DNA Design System

> Syfte: Definiera AK1A:s **visuella identitet** så att varje ruta, kort och sektion
> *direct* känns igen som AK1A. Detta dokument är komplement till `voice.md` (språkdräkt),
> `research.md` (strategi), `personas.md` (publik) och `blue-ocean-purity.md` (ton) —
> det specificerar den **formspråk-purity** som gör oss visuellt unika.
>
> **Princip:** Varje visuellt element måste referera till ett av AK1A:s DNA-ord. Inget
> dekoration för dekorationens skull. Form följer metod.

---

## 0. DNA-ord → Visuell signatur (matris)

Innan vi går in på de 7 signaturerna — här är hur varje DNA-ord översätts till en visuell
metod. Denna matris är design-systemets grundlag.

| DNA-ord                          | Visuell metod                                           | Signatur som bär det    |
| -------------------------------- | ------------------------------------------------------- | ----------------------- |
| **Verifierbarhet**               | Varje siffra har källa, varje badge har datum           | Verify-Stamp, Source-Link |
| **Kognitiv suveränitet**         | Kunden väljer nivå, kunden scrollar, kunden verifierar | Confidence-Meter, Cell-Grid |
| **MÄTT / METODMÅL**              | Status-badges med tydlig färg- och form-kod            | Verify-Stamp, Confidence-Meter |
| **20 AKM1-variabler**            | V01–V20 formaterade som institutionella tickers         | Variable-Tag            |
| **25 våg-celler**                | 5×5 rutnät i guld-linjer                               | Cell-Grid, Gold-Divider |
| **"Metoden institutionerna använder"** | Pappersstruktur, serif-rubriker, monospace-siffror | Paper-Texture, Gold-Divider |
| **Pedagogisk finansanalys**      | Layered depth, fotnoter, klickbara källor              | Source-Link, Confidence-Meter |

**Test:** Kan du se elementet och direkt associera till ett DNA-ord? Om nej → ta bort.

---

## DEL 1: AK1A:s 7 visuella signaturer

> Inspirerat av: **Stripe** (gradient meshes, polished micro-interactions), **Linear**
> (minimalistiska men karaktärsfulla kort), **Vercel** (geometriska mönster, mono-typografi),
> **Apple** (depth, materials, hierarki), **Bloomberg Terminal** (data density,
> institutional feel), **Financial Times** (serif-typografi, pappers-känsla), **Notion**
> (block-baserat, rent). Vi lånar *tekniker*, vi äger *identitet*.

### 1.1 Verify-Stamp — "MÄTT verifierad"

**Vad det är:** En stämpel-liknande badge (hexagonal eller rektangulär med rundade hörn)
som visas vid varje verifierad slutsats, rekommendation eller data-punkt. Innehåller
tre fält: status (MÄTT / METODMÅL / PRELIMINÄR), datum (ISO 8601), och en mikro-ikon.

**DNA-ord den bär:** Verifierbarhet, MÄTT/METODMÅL.

**Visuell signatur — vad gör den unik:**
- **Form:** Hexagon (refererar till institutionella sigill) ELLER rektangel med asymmetriskt
  klippt hörn (refererar till "stämpel-avklippt-papper").
- **Färg:** Guld-ram (#C5A572) på paper-bakgrund, status-ord i mono-font.
- **Mikro-animering:** Vid hover roterar en subtil guld-glans över ytan (Stripe-inspirerat),
  och datumet blir klickbart → öppnar käll-dokumentet.
- **Kontrast till konkurrenter:** Banker använder "godkänd"-stickers i blått. Bloggar
  har inga alls. AK1A:s stämpel är *guld på papper* — institutionell men inte bank.

**Exempel på användning:**
- Vid rekommendation: `[ MÄTT verifierad · 2026-08-08 · AKM1 62/100 ]`
- Vid källa: `[ Källa: Q2-rapport 2026-07-17, s. 14 · MÄTT ]`
- I kurser: `[ Pedagogiskt verifierad · Robin-nivå · 2026-08-08 ]`

**Inspiration-källor kombinerade:** Apple's verification badge (form) + Bloomberg's
status indicators (density) + Stripe's gradient sheen (polish) + FT's stamped
masthead (institutional authority).

---

### 1.2 Gold-Divider — våg-mönster i guld

**Vad det är:** En horisontell avdelare som består av en subtil guld-linje med ett
våg-mönster i mitten (refererar till AK1TS Elliott Wave-tolkning). Vågen har 5
toppar och 5 dalar (refererar till 5 vågor + 5 korrigerande).

**DNA-ord den bär:** 25 våg-celler, "metoden institutionerna använder".

**Visuell signikel — vad gör den unik:**
- **Linje:** 1px solid guld (#C5A572) med 30% opacitet på ytterkanter, 100% i mitten.
- **Våg-mönster:** SVG-path med 5 cykler, amplitud 4px, i guld-soft (#C9A84C).
- **Längd:** 100% av container-bredden, vågen centrerad.
- **Variant:** Smal (8px höjd) för in-line, bred (24px höjd) för sektions-brytningar.
- **Kontrast:** Stripe använder gradient-lines. Linear använder 1px solid grå. FT
  använder dubbla hårstreck. Ingen använder *vågor*. Vågen är AK1A:s ägda avdelare.

**Exempel på användning:**
- Mellan sektioner i en 99-sidig analys
- Mellan kapitel i en djupkurs
- Mellan rekommendation och motivation
- Som "ground line" under hero-text på startsidan

**Inspiration-källor kombinerade:** FT's double-rule divider (editorial gravitas) +
Stripe's gradient hairline (polish) + Apple's material edges (depth) — men formen
är *våg*, unik för AK1A.

---

### 1.3 Cell-Grid — 5×5 rutnät

**Vad det är:** Ett 5×5 rutnät (25 celler) som refererar direkt till AK1TS 25
våg-celler. Används som: (a) bakgrundsmönster i hero-sektioner, (b) data-visualisering
för våg-position, (c) navigerings-grid för djupkurser (25 celler = 5 teorier × 5
horisonter).

**DNA-ord den bär:** 25 våg-celler, kognitiv suveränitet (kunden navigerar själv).

**Visuell signatur — vad gör den unik:**
- **Struktur:** 5 kolumner × 5 rader, varje cell 1:1 ratio.
- **Linjer:** 1px guld (#C5A572) med 20% opacitet — nästan osynlig tills cell är aktiv.
- **Aktiv cell:** Fylls med guld 15% + guld-ram 100% + Verify-Stamp i mitten.
- **Hover-effekt:** Cell-fyllning animerar från 0 → 15% på 200ms (Linear-inspirerat).
- **Bakgrunds-variant:** 5×5 grid som 4% opacitet över hero-bakgrund — subtilt mönster
  som inte stör text men som syns vid noggrann titt.
- **Kontrast:** Vercel använder 6×6 hex-grid. Bloomberg använder 12-kolumnsrutnät.
  Ingen använder 5×5 med våg-cell-referens. AK1A äger 5×5.

**Exempel på användning:**
- Hero-bakgrund på HEM (subtilt 5×5-mönster bakom manifesto-text)
- Våg-matrix visualisering (1 cell = 1 våg-cykel-position)
- Djupkurs-navigator (5 teorier × 5 horisonter = 25 celler)
- "Var är vi i cykeln?" -indikator på analys-försätt

**Inspiration-källor kombinerade:** Vercel's geometric patterns (grid discipline) +
Bloomberg's data density (25 data points synliga) + Notion's block-grid (klickbar) +
Apple's depth (lager-på-lager med låg opacitet).

---

### 1.4 Variable-Tag — V01–V20 institutionella tags

**Vad det är:** En tagg/badge som visar en AKM1-variabel (V01–V20) i ett strikt
institutionellt format. Formaterad som en börsticker: mono-font, fast bredd,
färg-kodad efter score (bull 4-5, neutral 3, bear 1-2).

**DNA-ord den bär:** 20 AKM1-variabler, verifierbarhet (varje variabel är spårbar).

**Visuell signatur — vad gör den unik:**
- **Format:** `[V07]` i JetBrains Mono, 11px, fast bredd 48px.
- **Färg-kodning:**
  - Bull (score 4-5): grön bakgrund 12%, grön border 100%, grön text
  - Neutral (score 3): grå bakgrund 12%, grå border 100%, grå text
  - Bear (score 1-2): röd bakgrund 12%, röd border 100%, röd text
  - Inaktiv (ej bedömd): guld bakgrund 6%, guld border 50%, guld text
- **Hover:** Visar variabel-namn ("Bruttomarginal") i en tooltip efter 300ms.
- **Klick:** Öppnar djupkursen för variabeln (V07 → djupkurs V07-bruttomarginal).
- **Kontrast:** Bloomberg har ticker-tags i ren mono utan färg. Linear har keyboard
  shortcuts i mono. Ingen kombinerar *institutionell ticker + DNA-färg-kod*.

**Exempel på användning:**
- I analys: `[V07] 4/5 · Bruttomarginal 32,4%`
- I kurs-navigator: klickbar grid med alla 20 variabler
- I sammanfattning: mini-lista med `[V01][V02]...[V20]` färgkodade
- I "Verifiera själv"-flödet: kund markerar sin egen score per variabel

**Inspiration-källor kombinerade:** Bloomberg's ticker format (institutional mono) +
Linear's keyboard-chip (fast bredd, kort) + Vercel's command palette aesthetic +
Apple's color-coded SF Symbols (semantisk färg).

---

### 1.5 Paper-Texture — institutionell pappersstruktur

**Vad det är:** En subtil pappers-struktur overlay på alla ytor med paper-bakgrund.
 Inte en bild-bakgrund — en CSS-genererad brus-textur med 2% opacitet som ger
 taktil institutionell känsla utan att störa läsbarhet.

**DNA-ord den bär:** "Metoden institutionerna använder", pedagogisk finansanalys
(papper = forskning, inte skärm-yta).

**Visuell signatur — vad gör den unik:**
- **Teknik:** CSS `background-image` med SVG-noise filter, 2% opacitet, mix-blend-mode:
  multiply.
- **Färg:** Varmligt brunt brus (#3A2A1A base) — inte grått, inte blått.
- **Skala:** 200×200px tile, repeterar sömlöst.
- **Lager-ordning:** Ligger *under* allt innehåll, *över* paper-bakgrund.
- **Mörkt läge:** Inverteras till varmt vitt brus (#F5E8D0) på mörk paper-bakgrund.
- **Kontrast:** Stripe har gradient-mesh (modern). Apple har frosted glass (tech).
  FT har faktisk pappers-textur (print). AK1A har *digital pappersstruktur* —
  institutionell men renderad, inte bitmap.

**Exempel på användning:**
- På alla sidor som default body-overlay
- Förstärkt (4% opacitet) på PDF-rapport-rendering
- Subtil (1% opacitet) på mobil för att bevara läsbarhet
- Avstängd på charts och grafer (där data-kontrast är kritiskt)

**Inspiration-källor kombinerade:** FT's salmon-paper feel (institutional gravitas) +
Apple's materials (subtactile depth) + Stripe's gradient meshes (computational
elegance) + Notion's clean canvas (låg stimulans).

---

### 1.6 Confidence-Meter — MÄTT/METODMÅL visuell mätare

**Vad det är:** En visuell mätare som visar konfidens-grad på en skala 0–100.
Två varianter: (a) horisontell bar (Bloomberg-style), (b) cirkulär gauge
(Apple Watch-style). Visar också status-ord (PRELIMINÄR / MÄTT / METODMÅL).

**DNA-ord den bär:** MÄTT / METODMÅL, kognitiv suveränitet (kund ser metodens
styrka visuellt).

**Visuell signatur — vad gör den unik:**
- **Horisontell variant:** 100% bredd, 8px höjd, gold-rail, fyllning i status-färg.
  Status-ord i mono ovanför höger kant.
- **Cirkulär variant:** 80×80px, 6px stroke, gold-track, status-färg-progress.
  Siffra i serif i mitten (AKM1-score).
- **Färg-skala:**
  - 0-30 (PRELIMINÄR): neutral grå
  - 31-60 (MÄTT): guld (#C5A572)
  - 61-85 (METODMÅL): bull grön (#047857)
  - 86-100 (METODMÅL STARK): djup grön (#065F46)
- **Mikro-interaktion:** Fyllning animerar från 0 → värde på 600ms ease-out vid mount.
- **Komponent-tillägg:** Visa också "nästa tröskel" — t.ex. vid 58/100, visa en liten
  markör vid 61 ("+3 → METODMÅL").
- **Kontrast:** Bloomberg har statiska conf-indicators. Apple har ring-meters. Linear
  har progress-bars. Ingen har *MÄTT/METODMÅL status-ord integrerat i mätaren*.

**Exempel på användning:**
- På analys-försätt: cirkulär meter med AKM1-score 62/100 (METODMÅL)
- I rekommendations-ruta: horisontell meter med konfidens i HÅLL-beslut
- I labb: kundens egna konfidens per variabel
- I kurser: pedagogisk meter som visar "hur säker är metoden på detta?"

**Inspiration-källor kombinerade:** Bloomberg's confidence indicators (institutional
data) + Apple Watch ring (cirkulär elegance) + Linear's progress polish (animering)
+ Stripe's data-viz color discipline (semantisk färg).

---

### 1.7 Source-Link — klickbara fotnoter

**Vad det är:** Källhänvisningar formaterade som klickbara fotnoter — inte vanliga
länkar, utan institutionella fotnot-markörer `[¹]` som vid klick expandrar en popover
med källa, datum, sida, och länk till originaldokument.

**DNA-ord den bär:** Verifierbarhet, "tro inget, verifiera allt".

**Visuell signatur — vad gör den unik:**
- **Markör:** Superscript siffra i guld mono-font: `¹ ² ³` (inte parentes).
- **Hover:** Markören blir understruken guld + visar preview av källa i 1 rad.
- **Klick:** Popover med full källa: "Q2-rapport 2026-07-17, Volvo Cars AB, s. 14.
  Läs original →"
- **Popover-stil:** Paper-card med gold-divider överst, mono-font, 280px bredd.
- **Auto-numrering:** Markdown-fotnoter (`[^1]`) mappas automatiskt till source-link.
- **Listvy:** Längst ner på sida/sektion, alla källor i en numrerad lista med guld-dividers
  mellan (FT-inspirerat).
- **Kontrast:** Wikipedia har fotnoter i blått. Stripe docs har inline länkar. FT har
  slut-källistor. Ingen har *klickbara guld-fotnoter med popover-preview*.

**Exempel på användning:**
- I varje analys-avsnitt: "Bruttomarginal 32,4%¹" → klicka → se källa
- I kurser: vid påståenden om bolag eller marknad
- I labb: vid metod-förklaringar
- I styrelseprotokoll: vid beslutsunderlag

**Inspiration-källor kombinerade:** FT's footnotes (editorial authority) + Stripe's
documentation hover-preview (interactive) + Linear's inline references (minimal) +
Notion's callout popovers (clean container).

---

## DEL 2: Färgpalett med betydelse

> Varje färg i AK1A:s palett har ett *betydelse-uppdrag*. Ingen färg används
> dekorativt. Färg = signal.

### 2.1 Primära färger

| Färg             | Hex        | RGB              | Betydelse                                       | Användning                                    |
| ---------------- | ---------- | ---------------- | ----------------------------------------------- | --------------------------------------------- |
| **Gold**         | `#C5A572`  | 197, 165, 114    | Verifierbarhet — institutionell signatur        | Ramar, avdelare, badges, markörer             |
| **Bull (grön)**  | `#047857`  | 4, 120, 87       | Positiv konfluens — metodens bekräftelse        | Bull-score, METODMÅL STARK, rek/köp           |
| **Bear (röd)**   | `#B91C1C`  | 185, 28, 28      | Negativ konfluens — metodens varning           | Bear-score, risk, sälj/undvik                 |
| **Neutral (grå)**| `#64748B`  | 100, 116, 139    | Väntar data — metodiskt tålamod                 | Neutral score, PRELIMINÄR, inaktiv            |
| **Paper (cream)**| `#F5F1E8`  | 245, 241, 232    | Institutionell grund — forskningspapper        | Bakgrund, canvas                              |
| **Ink (mörk)**   | `#0A0B0D`  | 10, 11, 13       | Auktoritet — text, rubriker                    | Brödtext, rubriker                            |

### 2.2 Sekundära färger (derivat)

| Färg              | Hex        | Betydelse                                | Användning                         |
| ----------------- | ---------- | ---------------------------------------- | ---------------------------------- |
| **Gold-Soft**     | `#C9A84C`  | Gold vid låg betoning (mönster, bakgrund)| Cell-grid linjer, våg-mönster      |
| **Gold-Deep**     | `#A8862A`  | Gold vid hög betoning (ramar, knappar)   | Verify-Stamp ram, aktiva tillstånd |
| **Bull-Deep**     | `#065F46`  | Starkaste METODMÅL STARK                 | Confidence-Meter 86-100            |
| **Paper-Warm**    | `#EFE9DA`  | Sekundär paper-yta (cards, muted)        | Card-bakgrund, hover-ytor          |
| **Paper-Light**   | `#FFFDF7`  | Lättare card-yta (popover, dialog)       | Popovers, modals                   |
| **Ink-Warm**      | `#2A2520`  | Varm text (rubriker, institutionell)     | H1-H3, viktiga siffror             |
| **Border-Warm**   | `#E0D8C4`  | Varm kantlinje                           | Card-borders, dividers            |
| **Muted-Warm**    | `#5A5045`  | Dämpad text                              | Muted-foreground, captions         |

### 2.3 Färg-regler

1. **Färg får aldrig dekorera.** Om en färg inte förmedlar signal → ta bort.
2. **Guld är den enda "varumärkesfärgen".** Bull/Bear/Neutral är *signal-färger*,
   inte branding. Använd dem bara där metodens output är färg-kodad.
3. **Paper + Ink är fundamentet.** 80% av alla ytor ska vara paper/ink-kontrast.
   Gold tar max 8%, Bull/Bear/Neutral tar max 12% sammanlagt.
4. **Mörkt läge inverterar paper/ink**, behåller guld (guld fungerar på båda), sänker
   saturation på Bull/Bear med 10%.
5. **Inga gradienter i bakgrunder.** Stripe kan ha gradient meshes — vi har pappers-
   struktur + cell-grid. Gradienter endast i micro-interactions (Verify-Stamp sheen).

### 2.4 Färg-kombinationer som är förbjudna

| Kombination                  | Varför förbjuden                               |
| ---------------------------- | ---------------------------------------------- |
| Röd + grön intill varandra   | Colorblind-fälla, casino-jargong               |
| Guld-gradient                | Stripe-look, inte AK1A-look                    |
| Blå som primär               | Bank-färg, bryter DNA                          |
| Neon-versioner               | Casino-jargong, teknologi-jargong              |
| Pastell-versioner            | Leker ned institutionell auktoritet            |

---

## DEL 3: Typografi-regler

> Tre typsnittsfamiljer, var och en med tydligt uppdrag. Aldrig blanda uppdrag.

### 3.1 Tre typsnittsfamiljer

| Familj               | Typsnitt (primary → fallback)                    | Uppdrag                                       | Användning                              |
| -------------------- | ------------------------------------------------ | --------------------------------------------- | --------------------------------------- |
| **Serif**            | Source Serif 4 → GT Sectra → Georgia             | Institutionell auktoritet                     | H1-H3, rekommendationer, METODMÅL-siffror |
| **Mono**             | JetBrains Mono → IBM Plex Mono → SF Mono         | Siffror, tickers, källor, kod                 | V01-V20, priser, datum, source-markörer |
| **Sans**             | Inter → SF Pro Text → system-ui                  | Brödtext, UI, knapp-text                      | Brödtext, captions, navigering, knappar  |

### 3.2 Hierarki och storlekar

| Element               | Familj | Storlek (desktop / mobil) | Vikt      | Radavstånd | Spärrning |
| --------------------- | ------ | ------------------------- | --------- | ---------- | --------- |
| H1 (hero/manifesto)   | Serif  | 56px / 36px               | 600       | 1.05       | -0.02em   |
| H2 (sektionsrubrik)   | Serif  | 36px / 26px               | 600       | 1.1        | -0.01em   |
| H3 (sub-sektion)      | Serif  | 24px / 20px               | 600       | 1.2        | 0         |
| H4 (kort-rubrik)      | Sans   | 18px / 16px               | 600       | 1.3        | 0         |
| Brödtext (body)       | Sans   | 16px / 15px               | 400       | 1.6        | 0         |
| Brödtext (liten)      | Sans   | 14px / 13px               | 400       | 1.5        | 0         |
| Siffra (display)      | Mono   | 32px / 24px               | 500       | 1.0        | -0.01em   |
| Siffra (body)         | Mono   | 16px / 15px               | 500       | 1.4        | 0         |
| Caption/källa         | Mono   | 11px / 11px               | 500       | 1.4        | 0.02em    |
| Variable-tag (V01)    | Mono   | 11px / 11px               | 600       | 1.0        | 0.05em    |

### 3.3 Typografi-regler

1. **Siffror är alltid mono.** Priser, procentsatser, datum, scores — alltid JetBrains
   Mono. Det ger institutionell "Bloomberg-känsla" och ger jämn radlängd i tabeller.

2. **Rubriker är alltid serif.** Sans-rubriker = tech-bolag, inte institutionell
   forskning. Undantag: H4 och lägre (kort-rubriker, UI) kan vara sans.

3. **Brödtext är alltid sans.** Inter — lättast att läsa på skärm i långa löptexter.

4. **Källor och tickers är alltid mono + liten storlek.** 11px, ökad spärrning —
   ger "institutionell fineprint"-känsla.

5. **Stora siffror kan vara serif** endast i signatur-ytor (METODMÅL på hero, AKM1-score
   på försätt) — då kombineras med mono för själva räkne-delen ("62" i serif, "/100" i
   mono).

6. **Inga kapitäler.** Inga ALL-CAPS brödtext. ALL-CAPS endast i etiketter (MÄTT,
   METODMÅL, PRELIMINÄR) — då med 0.05em spärrning.

7. **Line-height aldrig under 1.0.** Siffror i mono kan ha 1.0–1.2. Brödtext alltid 1.5+.

### 3.4 Typografiska signaturer

- **"Institutionellt försätt":** H1 i serif, sub-rubrik i mono småcaps, datum i mono.
  Ex: "VOLCAR-B · HÅLL" (serif H1) / "REKOMMENDATION 2026-08-08" (mono small).
- **"Källa i marginal":** Mono 11px källa i höger marginal vid citat — FT-inspirerat.
- **"Siffra-block":** Stora mono-siffror i grid, varje med etikett under i sans.
- **"Verify-Stamp typografi":** Status-ord i mono ALL-CAPS, datum i mono, score i mono.

---

## DEL 4: Komponent-mönster

> Varje typ av ruta/kort beskriver: vad den representerar (DNA-del), visuell signatur
> (vad gör den unik), och exempel på användning.

### 4.1 Verify-Card — "MÄTT verifierad slutsats"

- **Vad den representerar:** Verifierbarhet — varje slutsats bärs av ett kort med
  stämpel, källa och datum.
- **Visuell signatur:** Paper-card (Paper-Light) + Gold-Divider överst + Verify-Stamp
  i övre högra hörnet + Source-Link-markörer i brödtext + Confidence-Meter i footer.
- **Användning:** Rekommendations-ruta, sammanfattning, slutsats-block.

### 4.2 Variable-Card — "en AKM1-variabel"

- **Vad den representerar:** 20 AKM1-variabler — varje variabel får ett kort med
  score, definition, källa, och klickbar djupkurs-länk.
- **Visuell signatur:** Variable-Tag (V01-V20) i övre vänstra + score i cirkulär
  Confidence-Meter + variabel-namn i serif + definition i sans + källa i mono.
- **Användning:** AKM1-grid i analys, variabel-lista i kurser, "Verifiera själv"-flöde.

### 4.3 Cell-Card — "en våg-cell"

- **Vad den representerar:** 25 våg-celler — varje cell är en klickbar ruta som visar
  cykel-position och konfidens.
- **Visuell signatur:** 1:1-ratio card + Variable-Tag-liknande etikett (W01-W25) +
  våg-ikon i guld + status-färg-ram.
- **Användning:** Våg-matrix, cykel-position-indikator, navigering mellan cykler.

### 4.4 Scenario-Card — "Bull/Base/Bear"

- **Vad den representerar:** Scenarioark — tre möjliga framtider med sannolikhet och
  målpris.
- **Visuell signatur:** Trespalt (mobil: staplad) + varje spalt färgkodad (Bull grön /
  Base guld / Bear röd) + sannolikhet i stor mono + målpris i serif + Confidence-Meter
  i botten. Gold-Divider mellan spalter på desktop.
- **Användning:** Scenario-sektion i analys, risk-belöning-visualisering, kurs-exempel.

### 4.5 Source-Card — "källblock"

- **Vad den representerar:** Verifierbarhet — klickbar lista av källor som backar upp
  en sektion.
- **Visuell signatur:** Numrerad lista i mono + varje källa har Source-Link-markör +
  Gold-Divider mellan källor + klickbar länk till originaldokument.
- **Användning:** Slutet av varje sektion i analys, käll-fact-ruta, fotnot-block.

### 4.6 Manifest-Card — "DNA-manifest"

- **Vad den representerar:** "Vi ger dig metoden institutionerna använder" — stort
  hero-block som sätter tonen.
- **Visuell signatur:** Paper-bakgrund med Paper-Texture + Cell-Grid subtilt i
  bakgrunden (4% opacitet) + H1 i serif + sub-rubrik i mono + Gold-Divider under +
  Verify-Stamp i hörnet.
- **Användning:** HEM-hero, OM OSS-manifest, KURSER-introduktion.

### 4.7 Course-Card — "en djupkurs"

- **Vad den representerar:** Pedagogisk finansanalys — varje kurs är en modul med
  nivå, längd, variabel-koppling.
- **Visuell signatur:** Paper-card + Variable-Tag (t.ex. V07) i hörn + nivå-badge
  (Nybörjare/Intermediär/Avancerad) + längd i mono + kort-rubrik i serif + beskrivning
  i sans + "Starta →" i mono.
- **Användning:** KURSER-grid, relaterade kurser i analys, kurs-navigator.

### 4.8 Lab-Card — "ett experiment"

- **Vad den representerar:** Kognitiv suveränitet — kundens egna experiment, kombinationer,
  fallstudier.
- **Visuell signatur:** Paper-card + Cell-Grid-mönster i bakgrunden (8% opacitet) +
  Variable-Tag-lista + Confidence-Meter för kundens egen konfidens + "Verifiera →" knapp.
- **Användning:** LABB-grid, kombinationer, fallstudier, kundens arbetsyta.

### 4.9 Board-Card — "AI-organ styrelseprotokoll"

- **Vad den representerar:** MÄTT — AI-organens beslut är offentliga och spårbara.
- **Visuell signatur:** Paper-card + organ-symbol (Σ α Δ Ω Φ Θ Μ Ψ) i serif stor +
  datum i mono + beslut i sans + konfidens-score i Confidence-Meter + Gold-Divider
  mellan olika organs viewpoints.
- **Användning:** Styrelseprotokoll, AI-organ-panel, besluts-historik.

### 4.10 Institutional-Frame — "inramning av institutionellt innehåll"

- **Vad den representerar:** "Metoden institutionerna använder" — den yttre ramen som
  omsluter alla signatur-ytor.
- **Visuell signatur:** 1px Gold-ram (#C5A572 30% opacitet) + 8px inre padding + Paper-
  Texture på bakgrund + Gold-Divider i topp + Verify-Stamp positionerad i ramens övre
  högra hörn (halvvägs utanför ramen).
- **Användning:** Analys-försätt, rapport-omslag, institutionella sektioner.

---

## DEL 5: CSS-klasser

> Konkreta CSS-klasser som ska skapas. Alla följer `ak1a-` prefix. Implementeras i
> `src/app/globals.css` och/eller som Tailwind-komponent-klasser. Kompatibelt med
> befintlig palett (`--paper`, `--ink`, `--gold`, `--gold-soft`, `--bull`, `--bear`,
> `--neutral-signal`).

### 5.1 `.ak1a-verify-stamp`

```css
.ak1a-verify-stamp {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.625rem;
  background: var(--paper);
  border: 1px solid var(--gold);
  border-radius: 2px;                    /* institutionell — inte rundad */
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 0 1px var(--paper) inset,        /* "stämpel-avklippt" effekt */
    0 1px 2px rgba(10, 11, 13, 0.08);
}

.ak1a-verify-stamp::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 30%,
    rgba(197, 165, 114, 0.18) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 600ms ease-out;
}

.ak1a-verify-stamp:hover::before { transform: translateX(100%); }

.ak1a-verify-stamp[data-status="MÄTT"]        { border-color: var(--gold); }
.ak1a-verify-stamp[data-status="METODMÅL"]    { border-color: var(--bull); color: var(--bull); }
.ak1a-verify-stamp[data-status="PRELIMINÄR"]  { border-color: var(--neutral-signal); color: var(--neutral-signal); }

.ak1a-verify-stamp__date {
  color: var(--muted-warm, #5a5045);
  font-weight: 500;
}

.ak1a-verify-stamp__icon {
  width: 10px; height: 10px;
  color: var(--gold);
}
```

**Användning i JSX:**
```tsx
<span className="ak1a-verify-stamp" data-status="MÄTT">
  <CheckIcon className="ak1a-verify-stamp__icon" />
  MÄTT verifierad
  <span className="ak1a-verify-stamp__date">· 2026-08-08</span>
</span>
```

---

### 5.2 `.ak1a-gold-divider`

```css
.ak1a-gold-divider {
  display: block;
  width: 100%;
  height: 12px;                          /* smal variant */
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 12' preserveAspectRatio='none'><path d='M0,6 Q10,0 20,6 T40,6 T60,6 T80,6 T100,6 T120,6 T140,6 T160,6 T180,6 T200,6' fill='none' stroke='%23C5A572' stroke-width='1' opacity='0.6'/><line x1='0' y1='6' x2='200' y2='6' stroke='%23C5A572' stroke-width='0.5' opacity='0.2'/></svg>");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  border: none;
  margin: 1.5rem 0;
}

.ak1a-gold-divider--wide {
  height: 24px;                          /* bred variant för sektions-brytningar */
}

.ak1a-gold-divider--vertical {
  width: 12px;
  height: 100%;
  margin: 0 1.5rem;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 200' preserveAspectRatio='none'><path d='M6,0 Q0,10 6,20 T6,40 T6,60 T6,80 T6,100 T6,120 T6,140 T6,160 T6,180 T6,200' fill='none' stroke='%23C5A572' stroke-width='1' opacity='0.6'/></svg>");
  background-size: 100% 100%;
}
```

**Användning:**
```tsx
<div className="ak1a-gold-divider" />
<hr className="ak1a-gold-divider ak1a-gold-divider--wide" />
```

---

### 5.3 `.ak1a-cell-grid`

```css
.ak1a-cell-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 0;
  aspect-ratio: 1 / 1;                   /* alltid kvadratisk */
  width: 100%;
  background: var(--paper);
  border: 1px solid rgba(197, 165, 114, 0.2);
}

.ak1a-cell-grid__cell {
  border: 1px solid rgba(197, 165, 114, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--neutral-signal);
  background: transparent;
  cursor: pointer;
  transition: background-color 200ms ease-out, border-color 200ms ease-out;
  position: relative;
}

.ak1a-cell-grid__cell:hover {
  background-color: rgba(197, 165, 114, 0.08);
  border-color: var(--gold);
}

.ak1a-cell-grid__cell--active {
  background-color: rgba(197, 165, 114, 0.15);
  border: 1px solid var(--gold);
  color: var(--ink);
  font-weight: 600;
}

.ak1a-cell-grid--bg {
  /* subtil bakgrunds-variant för hero-sektioner */
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.04;
  border: none;
}

.ak1a-cell-grid--bg .ak1a-cell-grid__cell {
  border-color: var(--gold-deep, #a8862a);
}
```

**Användning:**
```tsx
<div className="ak1a-cell-grid">
  {Array.from({ length: 25 }).map((_, i) => (
    <button
      key={i}
      className={`ak1a-cell-grid__cell ${i === activeCell ? 'ak1a-cell-grid__cell--active' : ''}`}
      onClick={() => setActiveCell(i)}
    >
      W{String(i + 1).padStart(2, '0')}
    </button>
  ))}
</div>
```

---

### 5.4 `.ak1a-variable-tag`

```css
.ak1a-variable-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding: 0.125rem 0.375rem;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-radius: 2px;
  border: 1px solid currentColor;
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms ease-out;
}

.ak1a-variable-tag--bull {
  color: var(--bull);
  background-color: rgba(4, 120, 87, 0.08);
}
.ak1a-variable-tag--bull:hover { background-color: rgba(4, 120, 87, 0.15); }

.ak1a-variable-tag--neutral {
  color: var(--neutral-signal);
  background-color: rgba(100, 116, 139, 0.08);
}
.ak1a-variable-tag--neutral:hover { background-color: rgba(100, 116, 139, 0.15); }

.ak1a-variable-tag--bear {
  color: var(--bear);
  background-color: rgba(185, 28, 28, 0.08);
}
.ak1a-variable-tag--bear:hover { background-color: rgba(185, 28, 28, 0.15); }

.ak1a-variable-tag--inactive {
  color: var(--gold-soft);
  background-color: rgba(197, 165, 114, 0.04);
  border-color: rgba(197, 165, 114, 0.5);
  cursor: default;
}
```

**Användning:**
```tsx
<span className="ak1a-variable-tag ak1a-variable-tag--bull">V07</span>
<span className="ak1a-variable-tag ak1a-variable-tag--bear">V10</span>
<span className="ak1a-variable-tag ak1a-variable-tag--neutral">V03</span>
```

---

### 5.5 `.ak1a-paper-card`

```css
.ak1a-paper-card {
  position: relative;
  background: var(--paper-light, #fffdf7);
  border: 1px solid var(--border, #e0d8c4);
  border-radius: 4px;                    /* institutionell — subtilt rundad */
  padding: 1.5rem;
  overflow: hidden;
}

.ak1a-paper-card::before {
  /* Paper-Texture overlay */
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.23 0 0 0 0 0.16 0 0 0 0 0.1 0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.02'/></svg>");
  mix-blend-mode: multiply;
  z-index: 0;
}

.ak1a-paper-card > * { position: relative; z-index: 1; }

.ak1a-paper-card--accent {
  /* För Verify-Card, Manifest-Card — extra institutionell betoning */
  border-top: 2px solid var(--gold);
  padding-top: 1.75rem;
}

.ak1a-paper-card--elevated {
  /* För popovers, modals — djupare skugga */
  box-shadow:
    0 1px 2px rgba(10, 11, 13, 0.04),
    0 4px 12px rgba(10, 11, 13, 0.06),
    0 12px 32px rgba(10, 11, 13, 0.08);
}

/* Dark mode */
.dark .ak1a-paper-card {
  background: rgba(245, 241, 232, 0.04);
  border-color: rgba(245, 241, 232, 0.12);
}
.dark .ak1a-paper-card::before {
  mix-blend-mode: screen;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.96 0 0 0 0 0.91 0 0 0 0 0.81 0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.04'/></svg>");
}
```

**Användning:**
```tsx
<div className="ak1a-paper-card ak1a-paper-card--accent">
  <div className="ak1a-gold-divider" />
  <h3 className="font-serif text-2xl">Rekommendation: HÅLL</h3>
  {/* innehåll */}
</div>
```

---

### 5.6 `.ak1a-confidence-meter`

```css
/* Horisontell variant */
.ak1a-confidence-meter {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
}

.ak1a-confidence-meter__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted-warm, #5a5045);
}

.ak1a-confidence-meter__value {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--ink);
}

.ak1a-confidence-meter__track {
  position: relative;
  height: 8px;
  background: rgba(197, 165, 114, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

.ak1a-confidence-meter__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ak1a-confidence-meter[data-status="PRELIMINÄR"]    .ak1a-confidence-meter__fill { background: var(--neutral-signal); }
.ak1a-confidence-meter[data-status="MÄTT"]          .ak1a-confidence-meter__fill { background: var(--gold); }
.ak1a-confidence-meter[data-status="METODMÅL"]      .ak1a-confidence-meter__fill { background: var(--bull); }
.ak1a-confidence-meter[data-status="METODMÅL STARK"].ak1a-confidence-meter__fill { background: var(--bull-deep, #065f46); }

.ak1a-confidence-meter__threshold {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 1px;
  background: var(--gold);
  opacity: 0.5;
}

/* Cirkulär variant */
.ak1a-confidence-meter--circular {
  width: 80px;
  height: 80px;
  position: relative;
  display: inline-block;
}

.ak1a-confidence-meter--circular svg {
  transform: rotate(-90deg);
}

.ak1a-confidence-meter--circular .ak1a-confidence-meter__track {
  fill: none;
  stroke: rgba(197, 165, 114, 0.15);
  stroke-width: 6;
  background: none;
  height: auto;
}

.ak1a-confidence-meter--circular .ak1a-confidence-meter__fill {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  height: auto;
  border-radius: 0;
  transition: stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ak1a-confidence-meter--circular .ak1a-confidence-meter__score {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
}

.ak1a-confidence-meter--circular .ak1a-confidence-meter__score-denominator {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--muted-warm, #5a5045);
  font-weight: 500;
}
```

**Användning:**
```tsx
{/* Horisontell */}
<div className="ak1a-confidence-meter" data-status="METODMÅL">
  <div className="ak1a-confidence-meter__header">
    <span>METODMÅL-konfidens</span>
    <span className="ak1a-confidence-meter__value">78/100</span>
  </div>
  <div className="ak1a-confidence-meter__track">
    <div className="ak1a-confidence-meter__fill" style={{ width: '78%' }} />
    <div className="ak1a-confidence-meter__threshold" style={{ left: '85%' }} title="METODMÅL STARK" />
  </div>
</div>

{/* Cirkulär */}
<div className="ak1a-confidence-meter ak1a-confidence-meter--circular" data-status="METODMÅL">
  <svg viewBox="0 0 80 80">
    <circle className="ak1a-confidence-meter__track" cx="40" cy="40" r="34" />
    <circle
      className="ak1a-confidence-meter__fill"
      cx="40" cy="40" r="34"
      stroke="currentColor"
      strokeDasharray={2 * Math.PI * 34}
      strokeDashoffset={2 * Math.PI * 34 * (1 - 62 / 100)}
    />
  </svg>
  <div className="ak1a-confidence-meter__score">
    62
    <span className="ak1a-confidence-meter__score-denominator">/ 100</span>
  </div>
</div>
```

---

### 5.7 `.ak1a-source-link`

```css
.ak1a-source-link {
  font-family: var(--font-mono);
  font-size: 0.7em;                       /* superscript */
  font-weight: 600;
  color: var(--gold);
  vertical-align: super;
  line-height: 0;
  cursor: pointer;
  text-decoration: none;
  padding: 0 0.1em;
  transition: color 150ms ease-out, text-decoration 150ms ease-out;
}

.ak1a-source-link:hover {
  color: var(--gold-deep, #a8862a);
  text-decoration: underline;
}

.ak1a-source-link__popover {
  position: absolute;
  z-index: 50;
  width: 280px;
  padding: 0.75rem 1rem;
  background: var(--paper-light, #fffdf7);
  border: 1px solid var(--border, #e0d8c4);
  border-radius: 4px;
  box-shadow:
    0 4px 12px rgba(10, 11, 13, 0.08),
    0 12px 32px rgba(10, 11, 13, 0.12);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  color: var(--ink);
}

.ak1a-source-link__popover::before {
  content: "";
  display: block;
  height: 4px;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 4' preserveAspectRatio='none'><path d='M0,2 Q5,0 10,2 T20,2 T30,2 T40,2 T50,2 T60,2 T70,2 T80,2 T90,2 T100,2' fill='none' stroke='%23C5A572' stroke-width='0.5'/></svg>");
  background-size: 100% 100%;
  margin: -0.75rem -1rem 0.5rem;
}

.ak1a-source-link__popover-source {
  color: var(--muted-warm, #5a5045);
  display: block;
  margin-bottom: 0.25rem;
}

.ak1a-source-link__popover-link {
  color: var(--gold);
  text-decoration: underline;
  font-weight: 500;
}

/* Käll-lista i slutet av sektion */
.ak1a-source-list {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border, #e0d8c4);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.6;
  color: var(--muted-warm, #5a5045);
}

.ak1a-source-list__item {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(197, 165, 114, 0.15);
}
.ak1a-source-list__item:last-child { border-bottom: none; }

.ak1a-source-list__number {
  color: var(--gold);
  font-weight: 600;
  min-width: 1.5rem;
}
```

**Användning:**
```tsx
<p>
  Bruttomarginal komprimerade till 32,4%
  <a href="#source-1" className="ak1a-source-link">¹</a>
  från 34,1% föregående kvartal.
</p>

<ol className="ak1a-source-list">
  <li className="ak1a-source-list__item">
    <span className="ak1a-source-list__number">¹</span>
    <span>Q2-rapport 2026-07-17, Volvo Cars AB, s. 14. <a href="...">Läs original →</a></span>
  </li>
</ol>
```

---

### 5.8 `.ak1a-institutional-frame`

```css
.ak1a-institutional-frame {
  position: relative;
  background: var(--paper);
  border: 1px solid rgba(197, 165, 114, 0.3);
  padding: 2rem;
  border-radius: 2px;
}

.ak1a-institutional-frame::before {
  /* Paper texture på hela frame-ytan */
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.23 0 0 0 0 0.16 0 0 0 0 0.1 0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.025'/></svg>");
  mix-blend-mode: multiply;
  z-index: 0;
}

.ak1a-institutional-frame > *:not(.ak1a-verify-stamp) { position: relative; z-index: 1; }

/* Gold-Divider i topp av frame */
.ak1a-institutional-frame::after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 4' preserveAspectRatio='none'><path d='M0,2 Q5,0 10,2 T20,2 T30,2 T40,2 T50,2 T60,2 T70,2 T80,2 T90,2 T100,2' fill='none' stroke='%23C5A572' stroke-width='0.75'/></svg>");
  background-size: 200px 100%;
  background-repeat: repeat-x;
  z-index: 2;
}

/* Verify-Stamp i övre högra hörnet — halvvägs utanför ramen */
.ak1a-institutional-frame > .ak1a-verify-stamp {
  position: absolute;
  top: -0.875rem;
  right: 1.5rem;
  z-index: 3;
  background: var(--paper-light, #fffdf7);
}

/* Hörn-markörer — institutionellt sigill-känsla */
.ak1a-institutional-frame__corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 1px solid var(--gold);
  z-index: 2;
}
.ak1a-institutional-frame__corner--tl { top: 6px; left: 6px; border-right: none; border-bottom: none; }
.ak1a-institutional-frame__corner--tr { top: 6px; right: 6px; border-left: none; border-bottom: none; }
.ak1a-institutional-frame__corner--bl { bottom: 6px; left: 6px; border-right: none; border-top: none; }
.ak1a-institutional-frame__corner--br { bottom: 6px; right: 6px; border-left: none; border-top: none; }

/* Variant: analys-försätt (större padding, djupare känsla) */
.ak1a-institutional-frame--cover {
  padding: 3rem 2.5rem;
}

.ak1a-institutional-frame--cover h1 {
  font-family: var(--font-serif);
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Dark mode */
.dark .ak1a-institutional-frame {
  background: rgba(12, 11, 9, 0.6);
  border-color: rgba(197, 165, 114, 0.4);
}
.dark .ak1a-institutional-frame::before {
  mix-blend-mode: screen;
  opacity: 0.5;
}
```

**Användning:**
```tsx
<div className="ak1a-institutional-frame ak1a-institutional-frame--cover">
  <span className="ak1a-cell-grid__cell ak1a-institutional-frame__corner ak1a-institutional-frame__corner--tl" />
  <span className="ak1a-cell-grid__cell ak1a-institutional-frame__corner ak1a-institutional-frame__corner--tr" />
  <span className="ak1a-cell-grid__cell ak1a-institutional-frame__corner ak1a-institutional-frame__corner--bl" />
  <span className="ak1a-cell-grid__cell ak1a-institutional-frame__corner ak1a-institutional-frame__corner--br" />
  
  <VerifyStamp status="MÄTT" date="2026-08-08" />
  
  <h1>VOLCAR-B · HÅLL</h1>
  <p className="font-mono text-sm uppercase tracking-wide text-muted">
    Rekommendation 2026-08-08
  </p>
  
  {/* innehåll */}
</div>
```

---

## 6. Implementations-ordning

1. **Fas 1 (grund):** Lägg till alla CSS-klasser i `src/app/globals.css`. Kör visuellt
   test på en isolerad test-sida.
2. **Fas 2 (komponenter):** Skapa React-komponenter i `src/components/ak1a/dna/`:
   - `<VerifyStamp />`, `<GoldDivider />`, `<CellGrid />`, `<VariableTag />`,
     `<PaperCard />`, `<ConfidenceMeter />`, `<SourceLink />`, `<InstitutionalFrame />`.
3. **Fas 3 (integration):** Applicera på HEM-hero först (manifest), sedan på
   analys-försätt (StockAnalysisView), sedan på alla sektioner.
4. **Fas 4 (audit):** Verkställ "DNA-test" — ta bort alla element som inte refererar
   till ett DNA-ord. Inga dekorationer.

## 7. Anti-mönster — vad AK1A INTE gör

- ❌ Gradient-bakgrunder (Stripe-look — vi har Paper-Texture)
- ❌ Glassmorphism på alla ytor (Apple-look — vi har Paper-Card)
- ❌ Neon-accenter (Bloomberg-dark-look — vi har institutional palette)
- ❌ Emoji-ikoner (Notion-look — vi har mono-symboler)
- ❌ All-caps brödtext (militär/blogg-look)
- ❌ Blå som primärfärg (bank-look — bryter DNA)
- ❌ Röda fel-badges utanför metod-signal (används bara för bear-score)
- ❌ Skugga som depth på allting (Material-look — vi har institutional flat med hörn-markörer)

---

## 8. Sluttest — 7 frågor före design-publicering

1. **Kan användaren direkt känna igen detta som AK1A?** (om nej → ej tillräckligt DNA)
2. **Refererar varje visuellt element till ett DNA-ord?** (om nej → ta bort)
3. **Är guld den enda varumärkesfärgen?** (Bull/Bear/Neutral = signal, inte branding)
4. **Är siffror i mono, rubriker i serif, brödtext i sans?**
5. **Finns Verify-Stamp på verifierade slutsatser?**
6. **Finns Source-Link på varje påstående med källa?**
7. **Skulle Financial Times-redaktionen godkänna detta?** (institutionell bar)

Sju ja = publicera. Ett nej = omarbeta.

---

**Dokumentägare:** α-organet (positionering/branding) + Φ-organet (design-system)
**Senaste revision:** Task 56-dna-design
**Nästa granskning:** Fas 4-implementering + 90 dagar
**Komplementdokument:** `voice.md` (språkdräkt), `research.md` (strategi),
`personas.md` (publik), `blue-ocean-purity.md` (tonal purity)
