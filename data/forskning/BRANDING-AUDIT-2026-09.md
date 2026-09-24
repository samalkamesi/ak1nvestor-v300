# BRANDING-AUDIT 2026-09 — alla publika sidor (steg 1: kartan)

**Uppdrag:** Kundprioritet "branding-finslipning av ALLA publika sidor — konsekvent
design, CTA-optimering, professionell känsla". Detta dokument är KARTAN: nuläge per
sida + prioriterad åtgärdslista. **Inga kodändringar i src/ har gjorts i detta steg** —
 åtgärderna är underlag för nästa våg.

**Omfattning:** Svenska originalsidor i `src/app/(huvud)/` (speglarna /en + /ar ärvs
via samma komponenter och påverkas automatiskt). Interna/olyckta ytor (admin, studio,
min-sida, min-portfolj, pro/admin, labb/[id]-inloggat läge) är exkluderade ur
designbedömningen men nämns i kartan.

**Metod:** Varje page.tsx + dess huvudkomponenter har lästs (sond + manuellt):
h1-klasser, CTA-länkar (text, href, knappklass), hexvärden, sektionsskal, 52px-
tryckytor, mobilklasser. Källor: globals.css, seo-page-shell.tsx, typografi.ts,
header.tsx, footer.tsx, home-section.tsx, social-proof.tsx samtliga relevanta page.tsx.

---

## 1. Designgrunden (det konsekventa system som redan finns)

### 1.1 Färg-tokens (globals.css :root)

| Token | Värde | Roll |
|---|---|---|
| `--paper` | #f5f1e8 | Bakgrund (cream-papper) |
| `--ink` | #0a0b0d | Text |
| `--gold` | #785c13 | Brons-guld, WCAG 5.6:1 på paper |
| `--gold-soft` | #c9a84c | Dekor/linjer — ej löptext |
| `--djup-marin` | #0E1B2E | Marin panel-botten |
| `--djup-marin-morkare` | #081120 | Gradientdjup |
| `--koppar` | #8C5A2B | Data-accent |
| `--bull` / `--bear` | #047857 / #b91c1c | Positiv/negativ signal |

**Marin-hero-familjens raw-färger** (hårdkodade i JSX, finns INTE som tokens):
`#E8C766` (ljusguld), `#EDE6D6` (beige-text), `#0A1422` (mörkast marin), `#16263D`
(marin-chip i mörkt läge). Används på: startsidans hero, fas2, fas3, medlemskap
(partiellt), konfluens (block), kurser (Ny-chip), pro. **Notera palett-dubbeln:**
knappklassen `.btn-guld-signatur` och `.btn-marin` i globals.css använder samma
#E8C766 — men JSX-färgen saknar token, så hero-familjen och token-familjen kan glida
isär vid framtida färgjusteringar.

### 1.2 Knappsystem

| Klass | Utseende | Används av |
|---|---|---|
| `.btn-guld-signatur` | Ljusguld-botten #E8C766 + mörk text, bold | Start-hero, footer-banner, pro "Kom igång", sektioner |
| `.btn-marin` | Marin botten + guldkant/text | pro, forskningsbiblioteket, tier-sidor, verktyg |
| Ghost (token) | `border-gold/50 bg-gold/10 text-gold` | SEO-sidors sekundär-CTA (analyser, kurser, portfolj-forskning) |
| Ghost (outline, token) | `border-gold/50 text-gold hover:bg-gold/10` | manifest, prenumeration, fas3 ljus-knappar |
| Hero-marine (raw) | `border-[#E8C766]/50 text-[#E8C766]` | fas2, fas3, start-hero sekundär |
| **Avvikare:** `bg-gold` | Mörkbrons #785c13 + ljus text | **fas2, fas3, manifest primärknappar** |

### 1.3 Typografi

- Inter (UI) · Source Serif 4 (rubriker, `font-serif`) · JetBrains Mono (siffror).
- **H1-standard SEO-sidor:** `font-serif text-4xl font-bold` (ca 25 sidor).
- Marin-hero-familjen: `text-3xl sm:text-5xl` + `text-[#EDE6D6]`.
- Kundens mobilstandard (kf2): tryckyta `min-h-[52px]` + `max-md:`-anpassningar.

### 1.4 Referensstandarden ("mest konsekventa sidan")

**Startsidan** (`src/components/ak1a/sections/home-section.tsx`) för CTA-system:
primär `btn-guld-signatur` "Börja gratis →" + sekundär ghost "Se kurserna" +
mikrostrip ("Fas 1 för alltid 0 kr · Inget kort krävs") + social proof-rad med
mätta tal + 52 px tryckytor. **/kurser + SeoPageShell-familjen** för sidstruktur:
`font-serif text-4xl`-h1, eyebrow i guld, brödsmulor, smal (max-w-3xl) eller
wide (max-w-6xl) Container.

---

## 2. KARTA — per publik sida

Förkortningar: **4xl** = `font-serif text-4xl font-bold` (standard-h1) ·
**CTA-p/s/t** = primär/sekundär/tertiär knapp · **52px** = mobiltryckyta finns ·
**shell** = SeoPageShell · **raw** = hårdkodade hexvärden i JSX.

### 2.1 Flaggskepp + konvertering

| URL | Filväg (src/app/(huvud)/…) | Nuvarande läge | Avvikelse från referens |
|---|---|---|---|
| `/` | page.tsx → `components/ak1a/sections/home-section.tsx` | Marin-hero med raw-färger, btn-guld-signatur "Börja gratis →" + ghost "Se kurserna", mikrostrip, social proof-rad, sifferband, 52px | **Referens.** Endast lucka: hero-färger raw (ej token) |
| `/kurser` | kurser/page.tsx | 4xl, shell wide, UtvaltSektioner, "Ny"-chip med raw #0E1B2E/#E8C766, SocialProof-montering, 2×52px | Chip-färger raw; inga fler tryckytor än 2 |
| `/laroplan` | laroplan/page.tsx → `components/ak1a/laroplan.tsx` | h1 4xl (rad 184), shell wide | Saknar egen CTA-knapp i topp (endast nivå-länkar) |
| `/manifest` | manifest/page.tsx | 4xl→5xl hero, ljus kortstil, primär `bg-gold` 44px "Börja gratis — öppna läroplanen", SocialProof | **Primärknapp avviker** (bg-guld-token + 44px, ej signaturklass + 52px); CTA-text längre än kanon |
| `/konfluens` | konfluens/page.tsx | 4xl, shell wide, marin-block med raw #E8C766/#EDE6D6 | **Ingen konverterings-CTA alls** (ren förklaringssida); raw-färger i block |
| `/vagfundament` | vagfundament/page.tsx | 4xl, shell wide | Saknar CTA-knapp |
| `/fas2` | fas2/page.tsx | Marin-hero 3xl→5xl #EDE6D6, primär `bg-gold` "Ansök…" + hero-marine ghost, raw-färger | **Primärknapp avviker** (bg-gold, ej signatur); **0×52px**; ingen SocialProof |
| `/fas2-ansok` | fas2-ansok/page.tsx | 4xl tracking-tight, shell, formulär, SocialProof | Referenskonsekvent |
| `/fas3` | fas3/page.tsx | Marin-hero 3xl→5xl, primär `bg-gold` 2 st + ghosts, raw-färger, kravmatris | **Primärknappar avviker; 0×52px**; ingen SocialProof |
| `/medlemskap` | medlemskap/page.tsx | 4xl ljus h1 "Vår vision…", marin-paneler inuti med raw #E8C766/#0A1422/#EDE6D6, GarantiRuta, primär "Börja lära dig nu — kostnadsfritt" + ghost "Ansök om Fas 2" | **Ljus h1 men marin kropp = familjebrott mot fas2/fas3; 0×52px; CTA-text ej kanon;** SocialProof finns |
| `/prenumeration` | prenumeration/page.tsx | Två h1 (4xl "Prenumeration" + 4xl hero-rad), shell wide, endast ghost-juridik-länkar btn-liknande, btn-marin i `prenum-cta.tsx` | **Ingen tydlig primär handlings-CTA på sidkroppen** (portföljmotor = väntar kundbeslut — R2!); 0×52px; SocialProof saknas |
| `/logga-in` | logga-in/page.tsx | h1 4xl **centrerad**, MedlemInloggning + gäst-fallback | H1-centrering avviker (övriga vänster); säljer inte värdet i CTA (komponentägt) |

### 2.2 Innehållsnav + verktyg

| URL | Filväg | Nuvarande läge | Avvikelse |
|---|---|---|---|
| `/analyser` | analyser/page.tsx | 4xl, shell wide | Saknar CTA-knapp |
| `/analyser/[ticker]` | analyser/[ticker]/page.tsx | 4xl, ghost "Alla analyser", "Öppna labbet" | Tertiär-länk utan knappklass ("Öppna labbet" → /) |
| `/analyser/[ticker]/[variabel]` | …/[variabel]/page.tsx | 4xl, shell | Saknar CTA |
| `/forskningsbiblioteket` | forskningsbiblioteket/page.tsx | 4xl, `btn-marin` "Forskning Plus…" → /prenumeration | Referenskonsekvent |
| `/forskningsbiblioteket/[ticker]` | …/[ticker]/page.tsx | 4xl, shell wide, 36 semibold-element | Rik sida — inga fynd i kartläggningen |
| `/blogg` | blogg/page.tsx | 4xl, shell wide, btn-guld-signatur, 2×52px | Referenskonsekvent |
| `/blogg/[slug]` | blogg/[slug]/page.tsx | 4xl, shell | 0×52px på ev. delaknappar |
| `/bibliotek` | bibliotek/page.tsx → `components/ak1a/bibliotek.tsx` | **h1 3xl** (rad 113), shell wide | **H1-storlek avviker (3xl vs 4xl)** |
| `/topplista` | topplista/page.tsx → `components/ak1a/topplista.tsx` | **h1 3xl** (rad 59), shell wide | **H1-storlek avviker** |
| `/badges` | badges/page.tsx | 4xl mt-3, shell | Referenskonsekvent |
| `/dagens-pass` | dagens-pass/page.tsx → `components/ak1a/dagens-pass.tsx` | **h1 4xl→5xl** (rad 269), btn-marin i kroppen | H1-storlek avviker uppåt (medvetet energisk? — besluta) |
| `/nyheter` | nyheter/page.tsx | 4xl, shell wide | Referenskonsekvent |
| `/kalkylator` | kalkylator/page.tsx | 4xl, shell wide | Saknar CTA-knapp |
| `/portfoljbyggare` | portfoljbyggare/page.tsx | 4xl, shell wide | Saknar CTA-knapp |
| `/portfolj-forskning` | portfolj-forskning/page.tsx | 4xl, ghosts (kalkylator, byggare, medlemskap) | Referenskonsekvent |
| `/netnet` | netnet/page.tsx | 4xl, shell wide | Saknar CTA-knapp |
| `/superanalys` | superanalys/page.tsx | 4xl, btn-klasser i komponent | Referenskonsekvent |
| `/profil` | profil/page.tsx | 4xl, shell | Saknar CTA-knapp |
| `/certifikat` | certifikat/page.tsx | 4xl "Ditt Certifikat", shell | Referenskonsekvent |
| `/rapporter` | rapporter/page.tsx | 4xl, shell wide | Referenskonsekvent |
| `/rapportakademin` | rapportakademin/page.tsx | 4xl, shell wide (byggfryst) | Referenskonsekvent |
| `/labb` | labb/page.tsx | 4xl, shell wide | Referenskonsekvent |
| `/labb/[id]` | labb/[id]/page.tsx | **h1 3xl**, shell | **H1-storlek avviker** |

### 2.3 Data-navet

| URL | Filväg | Nuvarande läge | Avvikelse |
|---|---|---|---|
| `/dataset` | dataset/page.tsx → `components/ak1a/dataset-sidor.tsx` | h1 4xl (rad 365), shell wide (i komponenten), brandgenomgången P2 | Referenskonsekvent |
| `/dataset/[bransch]` | …/[bransch]/page.tsx → dataset-sidor.tsx (rad 541) | 4xl, shell | Referenskonsekvent |
| `/dataset/[bransch]/[aspekt]` | …/[aspekt]/page.tsx | shell via komponent | Referenskonsekvent |
| `/data/nyckeltalsguide` | data/nyckeltalsguide/page.tsx | 4xl, shell | Referenskonsekvent |
| `/bolag` | bolag/page.tsx → `components/ak1a/bolag-sidor.tsx` | h1 4xl (rad 307) + eyebrow `text-xs uppercase tracking-widest text-gold` — **bra eyebrow-mönster** | Referenskonsekvent (eyebrow förebild) |
| `/bolag/[slug]` | bolag/[slug]/page.tsx → bolag-sidor.tsx (rad 212) | 4xl, shell | Referenskonsekvent |

### 2.4 Företagsgruppen (portföljmotor) — R2: VÄNTAR KUNDBESLUT

| URL | Filväg | Nuvarande läge | Avvikelse |
|---|---|---|---|
| `/portfolj-grund` | portfolj-grund/page.tsx → `portfolj-tier/tier-sida.tsx` | h1 4xl (rad 189/217), tier-villkor styrd av tier-status | **Får ej röras** (pris/tier = kundens veto) |
| `/portfolj-plus` | portfolj-plus/page.tsx | samma tier-sida | Som ovan |
| `/portfolj-hyra` | portfolj-hyra/page.tsx | samma tier-sida | Som ovan |

### 2.5 Juridik + förtroende

| URL | Filväg | Nuvarande läge | Avvikelse |
|---|---|---|---|
| `/transparens` | transparens/page.tsx | 4xl, shell | Referenskonsekvent |
| `/ansvar` | ansvar/page.tsx | 4xl, shell | Referenskonsekvent |
| `/kallor` | kallor/page.tsx | 4xl, shell wide, kort med guld-kant | Referenskonsekvent |
| `/om-oss` | om-oss/page.tsx | 4xl, ghosts ("Alla kurser", "Biblioteket") + "Medlemskap" | **Sekundär-text "Alla kurser" ej kanon ("Se kurserna")**; 0×52px |
| `/cookiepolicy` | cookiepolicy/page.tsx | **h1 3xl**, raw #785c13 i text | **H1-storlek avviker inom juridikgruppen** (övriga 4xl) |
| `/privacy-policy` | privacy-policy/page.tsx | **h1 3xl** | **H1-storlek avviker** |
| `/finansiell-policy` | finansiell-policy/page.tsx | 4xl | Referenskonsekvent |
| `/upphovsratt` | upphovsratt/page.tsx | 4xl | Referenskonsekvent |
| `/villkor` | villkor/page.tsx | 4xl | Referenskonsekvent |

### 2.6 B2B — pro (egen layout-grupp)

| URL | Filväg | Nuvarande läge | Avvikelse |
|---|---|---|---|
| `/pro` | pro/page.tsx + pro/layout.tsx | Marin-hero 4xl→5xl #EDE6D6, `btn-guld-signatur` "Kom igång" + `btn-marin` "Boka demo", raw #E8C766/#EDE6D6 | **Intern ojämnhet i gruppen** (pro 4xl→5xl vs undersidor 3xl→4xl); B2B-CTA:er kanon för pro |
| `/pro/priser` | pro/priser/page.tsx | 3xl→4xl, `btn-marin` 44px "Kontakta oss" | 44px (B2B-standard ok, men dokumentera) |
| `/pro/klienter` | pro/klienter/page.tsx | 3xl→4xl, shell | Som ovan |
| `/pro/analys` | pro/analys/page.tsx | 3xl→4xl, eget skal | Som ovan |
| `/pro/rapporter` | pro/rapporter/page.tsx | 3xl→4xl, shell | Som ovan |

---

## 3. PRIORITERAD ÅTGÄRDSLISTA (max 15 — underlag för nästa våg)

> Skala: P1 = konverterings-/kundsynlig effekt, P2 = visuell harmoni, P3 = underhåll.
> **Stopp:** portfolj-tier-sidorna + alla priser (R2 väntar kund). Ingen ändring av
> juridiska texter — endast presentationala klasser.

1. **[P1] Ena primärknappen till `.btn-guld-signatur`.** Idag tre varianter:
   signaturklass (start/footer/pro) vs `bg-gold`-token (fas2:251, fas3:270+465,
   manifest). Byt till `btn-guld-signatur` + `text-primary-foreground`-arv bort.
   Ger samma ljusguld-känsla som starten på sajtens viktigaste säljknappar.
2. **[P1] 52 px tryckyta på ALLA huvud-CTA:er (kf2-standarden).** Komplettera
   `min-h-[52px]` (+ `max-md:`-rad where relevant) på: fas2, fas3, medlemskap,
   manifest (idag 44px — höj), prenumeration, konfluens, om-oss, kallor,
   blogg/[slug]. Startsidan/footer är förebild.
3. **[P1] Kanoniska CTA-texter** (förslag, svenska):
   - Primär överallt: **"Börja gratis →"** — manifest: "Börja gratis — öppna läroplanen" → "Börja gratis"; medlemskap: "Börja lära dig nu — kostnadsfritt" → "Börja gratis".
   - Sekundär: **"Se kurserna"** — om-oss: "Alla kurser" → "Se kurserna".
   - Tertiär (verktygssidor): **"Öppna {verktygsnamn}"** (t.ex. "Öppna portföljbyggaren" — redan kanon på starten).
   - Behåll: fas-ansök-CTA:er ("Ansök om Fas 2" — affärslogisk avvikare), pro-B2B ("Kom igång", "Boka demo").
   - social-proof.tsx: "Gå med gratis — det tar 30 sekunder." → "Börja gratis — det tar 30 sekunder."
4. **[P1] Konverterings-CTA på konverteringssidor som saknar den:** konfluens,
   vagfundament, analyser, kalkylator, portfoljbyggare, netnet, profil, kurser-
   botten. Återanvänd startSIDANS SektionsCta-mönster (knapp + mikrostrip) —
   lyft `SektionsCta` ur home-section.tsx till delad komponent (t.ex.
   `components/ak1a/sektions-cta.tsx`) och montera i botten.
5. **[P1] Social proof där den saknas:** fas2, fas3, prenumeration (statistik-rad
   ur SocialProof eller sifferband-komprimerad variant). Startsidan bär den via
   sifferband + rad; de fyra eksisterande monteringarna (manifest, medlemskap,
   fas2-ansok, kurser) är förebild. OBS v160-underlag: social proof-SIFFROR ska
   vara mätta tal (SIFFROR-objektet), aldrig påhittade.
6. **[P2] H1-jämställning till 4xl-standard:** cookiepolicy, privacy-policy,
   topplista.tsx:59, bibliotek.tsx:113, labb/[id] (alla 3xl → 4xl). Besluta
   dokumenterat undantag för dagens-pass (4xl→5xl) + marin-hero-familjen
   (3xl→5xl är medvetet sälj-mönster — behåll).
7. **[P2] Medlemskapets hero-familj:** antingen marin-hero som fas2/fas3 (h1
   3xl→5xl #EDE6D6) eller ljus 4xl som kurser — idag mitt emellan. Förslag:
   behåll ljus h1 men ge toppen samma eyebrow+mikrostrip-struktur som starten.
8. **[P2] Eyebrow-standard på SEO-sidor:** bolag-sidans mönster
   `text-xs uppercase tracking-widest text-gold` ovanför h1 — inför på
   innehållsnaven (analyser, blogg, bibliotek, topplista, dataset-index) som
   saknar eyebrow idag. Ger "professionell tidningskänsla" kunden efterfrågar.
9. **[P2] `/logga-in`:** behåll centrerad h1 (login-konvention) men lägg
   mikrostrip ("Fas 1 för alltid 0 kr · Inget kort krävs") under
   MedlemInloggning-blocket — samma invändningsnycklar som heron.
10. **[P2] pro-gruppens rubriker:** jämna till 4xl→5xl på marin-hero-pro (/pro)
    och 4xl på shell-undersidor (priser, klienter, analys, rapporter) — idag
    3xl-bas som känns mindre än sajtens övriga nivåer.
11. **[P3] Token för hero-guldet:** inför `--guld-hero: #E8C766;` +
    `--beige-hero: #EDE6D6;` (+ marin-varianterna) i globals.css och ersätt
    raw-hex i: home-section.tsx, fas2, fas3, medlemskap, konfluens, kurser
    (Ny-chip #0E1B2E/#16263D), pro. **Exakt samma rgb-värden** — ren refactor,
    noll visuell förändring, men framtida färgdrift blir en-radig.
12. **[P3] Ena ghost-varianterna:** idag `border-gold/50 bg-gold/10 text-gold`
    (fylld) och `border-gold/50 text-gold` (outline) sida vid sida. Förslag:
    fylld = sidsluts-CTA, outline = in-kropp-länk — dokumentera i globals.css-
    kommentar och städa avvikelser (fas3 har båda).
13. **[P3] "Öppna labbet"-länken** (analyser/[ticker]): utan knappklass idag —
    ge ghost-klass för synlighet.
14. **[P3] Blogg/[slug] delnings-knappar:** 52px + knappklass-konsistens.
15. **[P3] Dokumentera undantagen** i denna fil efter implementering: dagens-pass
    (energisk 5xl), logga-in (centrerad), pro-B2B (egen palett), fas-ansök-CTA:er
    (affärslogik) — så nästa audit skiljer medvetna val från drift.

**Kvantifierad baseline (för mätning efter våg 2):** 3 primärknappsvarianter →
mål 1 · 0×52px på 8 konverteringssidor → mål 8/8 · 5 h1-avvikelser → mål 0 ·
SocialProof på 4 av 8 konverteringssidor → mål 8/8 · ~35 raw-hex-förekomster i
publika JSX → mål 0 (tokens).

---

## 4. Slutsats

Grundsystemet är REDAN starkt: SeoPageShell ger 40+ sidor samma ram,
knappklasserna är WCAG-genomtänkta och startsidans kf2-arbete (CTA + mikrostrip +
social proof + 52px) är en mogen förebild. Finslipningen handlar om att **EXPORTERA
startsidans standard** till säljsidor som växte fram parallellt (fas2/fas3/manifest/
medlemskap har äldre knapp- och tryckytevarianter) och om att ge verktygssidorna
en återkommande nästa-steg-CTA. Inga strukturella ombyggen behövs — punkterna
ovan är kirurgiska och kan levereras utan att röra priser, juridiktexter eller
tier-sidor (R2).

*Kartan satt 2026-09-24 av fabrikens branding-audit-agent (v159-u3). Underlag för
våg 2: kodändringar enligt åtgärdslistan.*

---

## 5. IMPLEMENTERINGSSTATUS + DOKUMENTERADE UNDANTAG (v160, tillagt 2026-09-24)

**Levererat:** P1 (#1 guld-knapp ×5 fb3f125a · #2 52px · #3 kanoniska CTA-texter ·
#5 social proof ×3) · P2 (#6 H1-jämställning ×9 + pro ×4 0b458614 · #7 medlemskap
eyebrow+mikrostrip · #8 eyebrows ×4 · #9 logga-in-mikrostrip) · P2.5 (#4 SektionsCta
delad + 8 monteringar 36e16593) · P3.1 (#11 hero-tokens 90 byten d447087e) · P3.2
(#12 ghost-konvention dokumenterad i globals.css · #13 Öppna labbet → btn-guld-signatur
+ 52px · #14 DelRad 44px/52px mobil). Baseline-målen: 1 primärknappsvariant ✓ ·
8/8 konverteringssidor med CTA ✓ · SocialProof på konverterings_sidorna ✓ ·
raw-hex i auditens sju filer 0 ✓ (övriga filer fortsättningsvis).

**Medvetna undantag (ALDRIG "drift" — beslutade avvikelser från referensstandarden):**

1. **Marin-hero-familjens h1 3xl→5xl** (start, fas2, fas3, pro) — medvetet
   säljmönster; jämställs ALDRIG ned till 4xl-standarden.
2. **/dagens-pass h1 4xl→5xl** — energisk sida, medvetet förhöjd.
3. **/logga-in centrerad h1** — login-konvention; övriga sidor vänsterställer.
4. **Pro-B2B-gruppens egen palett** (font-mono-eyebrow `text-guld-djup`,
   `btn-marin`, 44px på /pro/priser) — B2B-uttryck skiljer sig medvetet från
   konsument-ytorna; dokumenterat i kartan §2.6.
5. **Fas-ansök-CTA:er** ("Ansök om Fas 2" etc.) — affärslogisk text, ALDRIG
   "Börja gratis" (kanon gäller endast Fas 1-konvertering).
6. **DelRad:s delningspiller** (blogg/[slug], forskningsbiblioteket/[ticker]) —
   m8 §3b-kontraktet "ikonrad, inte banner": diskreta 44px-piller (52px endast
   mobil), ALDRIG signatur-guld — delning är sekundär, aldrig huvud-CTA.
7. **Dataset-eyebrow** — parkerad: dataset-sidorna är t()-flerspråkiga och en
   eyebrow kräver nya ordlistenycklar sv/en/ar (kirurgigränsen för P2; eget
   mikropass när ordlistan öppnas nästa gång).
8. **Hero-familjens tokens är temastabila** (P3.1): de flippar INTE i dark och
   ingår INTE i .marin-scope-guld-flippen — de skall bete sig exakt som de
   raw-hex de ersatte. Förväxla dem aldrig med --gold/--djup-marin (som flippar).
