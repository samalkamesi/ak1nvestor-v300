# AK1A Brand System — röst, ton och regelverk

> **Härlett ur `data/varumarke.json` (VARUMARKE_VERSION 1.0.0, 2026-09-04) — koden
> är sanningen.** Appen speglar via `src/lib/varumarke.ts`, vakten via
> `verktyg/kvalitetsvakt.mjs` sektion 2b (mönstret siffror.json/siffror.ts).
> Ändra i JSON:en — ALDRIG hand-edita detta dokument; det regenereras/granskas
> mot källan vid varje revidering. Upprättat enligt MARKNADS-BESLUT våg 2 +
> m6-varumarke.md.
>
> **Drift-rättad 2026-09-04:** föregående BRAND.md (2026-08-24) sa guld `#a8862a`
> och slogan i två led — koden säger `#785c13`/`#E8C766` (WCAG-justerat
> 2026-09-02) och trippel-slogan. Dokumentet hade drivit från koden; därför är
> sanningskällan nu koden och dokumentet härleds.

## Kärnvärden (prioriterade)

1. **Kunskap är en rättighet** — fundamentalanalys gratis som luft och vatten (Fas 1, för alltid, utan asterisk — P3)
2. **Äkthet** — inga påhittade citat, osäkerhet skrivs ut, mätfel redovisas (P4)
3. **Reproducerbarhet** — varje slutsats har källa, varje analys granskas steg för steg
4. **Håll know-how, redovisa generöst** — aldrig share-walls, aldrig mejl-väggar på öppna ytor (P1)
5. **Tipsa, tvinga aldrig** — delning och prenumeration är erbjudanden (P5)
6. **GDPR-by-design** — inga nya spår, pixels eller retargeting (P6)

## Röst och ton — TON_REGLER (tio, ur `varumarke.json.tonRegler`)

| # | Regel | Exempel ✓ | Antiexempel ✗ |
|---|---|---|---|
| 1 | Du-form alltid; "vi" bakom, aldrig ovan | "Välkommen — vi går bredvid dig" | "Man bör lära sig aktier" |
| 2 | Hjälp, döm aldrig | "nästa steg", "din resa" | "du borde", "du missade" |
| 3 | Siffror ur SIFFROR, aldrig hårdkodade | "{SIFFROR.kurser} kurser" | "över 300 kurser!" |
| 4 | Påståenden kontrollerbara | "Sex löften… håll oss ansvariga" | "bäst på marknaden" |
| 5 | Osäkerhet skrivs ut | "saknar vetenskapligt belagt prediktiv förmåga" | "beprövad vinnarstrategi" |
| 6 | Gratis utan asterisk | "kostnadsfritt, för alltid. Ingen kortuppgift." | "gratis*" + småstil |
| 7 | Gravör, aldrig casino | serif, guld, mätetal | "SISTA CHANSEN!", 🔥-emojis, countdown |
| 8 | Välfärd är målet | "trygghet, sömn, frihet, stolthet" | "sluta lura dig själv" |
| 9 | Tipsa, tvinga aldrig — varför alltid med | "Eftersom du klarat X väntar Y" | "måste du ta den här kursen" |
| 10 | Tacksamhet tvåsidig | "Tack för att du investerar i dig själv" | "grattis till smarta valet att välja oss" |

## Ordlista — vi säger

forskningsunderlag · pedagogisk analys · deterministisk · reproducerbar · tröskel
· poängsatt · forsknings- och utbildningsplattform · **elev** (aldrig
"kund"/"användare" i elevytor — A8) · resa, nästa steg, stapel · oberoende
analytiker · gratis i Fas 1 — för alltid · metodiken (AKM1/AK1TS med versaler
och siffror: "20 variabler", "5×5×4") · källa redovisas per analys · [est.] för
uppskattningar.

## Förbjudna fraser (`forbjudnaFraser` — 26 mönster)

**FEL = juridiskt/löftesbrott (stoppar publicering; kvalitetsvakten räknar dem i
RÖD/GUL):**

| Fras | Säg i stället | Motiv |
|---|---|---|
| garanterad avkastning | forskningsunderlag | P2 — löfte om avkastning är rådgivning |
| riskfri / riskfritt / riskfria | riskmätt | P2 |
| slå index varje år | redovisad, reproducerbar metodik | P2 |
| obegränsad avkastning | riskmätt forskningsunderlag | P2 |
| passiv inkomst utan risk | aktiv, redovisad metodik | P2 |
| säker vinst | forskningsunderlag med redovisad risk | P2 |
| aktietips | pedagogisk analys | P2/MAR |
| köp/sälj-rekommendation | pedagogisk analys med redovisad metodik | P2/MAR |
| investeringsråd (om eget innehåll) | pedagogisk analys | P2 — endast NEGERAT är tillåtet ("inte investeringsråd" = disclaimer) |
| dela för att låsa upp / lås upp genom att dela | "Dela gärna — om du vill" | P1 — share-walls (A1, permanent avslag) |
| betala med en tweet/delning | kostnadsfritt, för alltid | P1 |
| gratis* | kostnadsfritt, för alltid | P3 — gratis-asterisk |
| meta-pixel / retargeting | ingen spårning | P6 — GDPR-by-design |

**VARNING = tonalt (manuell granskning i kvalitetsvakten):** hemliga
strategier · sista chansen (FOMO; i CTA mot elev = FEL enligt praxis) · bli
inte lämnad bakom · platser kvar · countdown/nedräkning · "enkelt!" ·
proffstips · revolutionerande · kunder (om elever — säg elever; A8) ·
cashflow-hack · superkreativ-tomsuperlativer.

Citerande text (finansiell-policy, ansvar, villkor, ordlista — som citerar
förbudet för att negera/undervisa om det) hanteras av kvalitetsvaktens
dokumenterade citerings-undantag (A10) — undantagen sänker aldrig nivån för ny
text.

## Huvudbudskap per persona (`huvudbudskap`)

| Persona | Rubrik | Bevis | CTA |
|---|---|---|---|
| nyborjare | "Bli analytikern som ser vad andra missar." | från första årsredovisningen till certifikatet; quiz; "Ingen kortuppgift" | "Bli medlem — gratis" |
| avancerad | "Väg ihop nyckeltal som en institutionell analytiker." | AKM1 V01–V20; AK1TS 5×5×4; deterministiska motorer; 201 case studies | "Utforska kurserna" |
| b2b | "Certifierad = klar för /pro-plattformen." | certifiering A–F; etik-del; analytikerkod; "pedagogisk kompetensprövning — aldrig rådgivningslicens" | "Ansök — vi kan avböja, du kan avbryta" |

## CTA-hierarki (`ctaHierarki`)

1. **signatur** `btn-guld-signatur` — max EN per vy; huvudhandling; verb först
2. **primär** `btn-marin` — högst en per vy; stödjer signatur-CTA:n; aldrig FOMO-kopplad
3. **sekundär** `border-gold/50 outline` — flera tillåtna; lågtryck; alltid med varför
4. **textlänk** `text-gold underline decoration-gold/40` — t.ex. "Djupare forskning finns i prenumerationen →" (A9: aldrig låsteaser)

## Signatur

- **Disclaimer** (citeras framåt, aldrig göms): "Pedagogisk analys — inte investeringsråd"
- **Slogan** (tripplett): "Djupare än en blogg. Tydligare än en bank. Snabbare än en utbildning."

## Färger & form (`design` — ärvd ur src/app/globals.css, WCAG AA 2026-09-02)

- **Paper** `#f5f1e8` — grund, värme, papper
- **Guld (brons, löptext/token)** `#785c13` — 5.6:1 mot paper; löptext-token `#7A5E14`
- **Guld på marin-yta** `#E8C766` — marin-panelernas guld (13.9:1-textparen `#EDE6D6` på `#0E1B2E`)
- **Gold-soft** `#c9a84c` — linjer, dekor — INTE löptext på paper
- **Marin** `#0E1B2E` / marin-natt `#081120` — institutionellt ankare
- **Koppar** `#8C5A2B` · kort `#fffdf7` · sekundär `#efe9da` · text `#0a0b0d`
- Serif för rubriker (institutionell tyngd), Inter för löptext, JetBrains Mono för siffror/kod
- Kontrast ≥7:1 eftersträvas på löptext; guld används aldrig som textfärg på paper i brödtext

## Fas-strukturens språk

- **Fas 1** = rättigheten. Kostnadsfri, för alltid, utan asterisker
- **Fas 2** = sällskapet. Ansökan + vilja; "vi kan avböja, du kan avbryta"
- **Fas 3** = representeras (kommer)

## Användning

- Nytt innehåll: kör `kontrolleraText(text)` ur `src/lib/varumarke.ts` (ren,
  beroendefri sista grind — även för AI-publiceringspipelines); FEL = stopp,
  VARNING = granska
- Ny komponent: färger ur tokens ovan, CTA:n ur hierarkin, budskap ur
  HUVUDBUDSKAP — aldrig hardcode
- Kvalitetsvakten (sektion 2b, daglig 07:00) sveper komponenter, sidor och
  lib-copy (email-mallar, nyhets-motor, seo) mot samma FORBJUDNA_FRASER ur
  JSON-guldkällan
