# M6 — VARUMÄRKESBIBELN SOM KOD: levande röst-system för AK1A

**Uppdrag:** Systematisera kundens varumärke (marin #0E1B2E + guld #E8C766 + serif +
trådglasskulptur-logo + "institutionell metodik för privatpersoner" + pedagogik.ts:s
5 principer + "håll know-how, redovisa generöst") till ett LEVANDE system i koden.
**Status:** Forskning + design + implementeringsskiss. BYGGT EJ — main beslutar.
**Datum:** 2026-09-04. **Källor i repo:** src/lib/pedagogik.ts, src/lib/siffror.ts,
src/lib/kurstips.ts, src/components/ak1a/social-proof.tsx, varumarkes-logo.tsx,
src/app/{manifest,om-oss,finansiell-policy,fas3}/page.tsx, ordlista.ts,
globals.css, verktyg/kvalitetsvakt.mjs, docs/BRAND.md.

---

## A. FYND I BEFINTLIGT COPY-DNA (granskningen)

Hur talar AK1A idag? Återkommande mönster, med riktiga exemplen ur kodbasen:

1. **Staccato-tripletter.** "Djupare än en blogg. Tydligare än en bank. Snabbare än
   en utbildning." (om-oss, manifest-signatur) · "Hela biblioteket. Noll kronor.
   Byggt för att du faktiskt ska förstå." (social-proof h2) · "Inte världens största.
   Inte världens flashigaste. Bäst — mätt i vad en elev faktiskt kan efteråt."
   (manifest-hero). Rytmen är gravör, inte reklam.
2. **Mätetal i stället för adjektiv.** Tal interpoleras UR `SIFFROR` (siffror.ts:
   "ALDRIG hårdkoda tal i copy"). Manifest: "ett manifest utan siffror är bara humör."
3. **Elev-perspektiv, aldrig bristperspektiv.** pedagogik.ts `varforText()`:
   "Eftersom du [X] väntar [Y]" — ALDRIG "du saknar Y". kurstips.ts: aldrig
   "borde/missade/brister", alltid "din/du har/välkommen".
4. **Ärlighet som signaturfras.** Disclaimern citeras framåt, inte göms:
   manifest "Ärlighetens verkliga test" lyfter ur egen disclaimer: "Teorierna saknar
   vetenskapligt belagt prediktiv förmåga". "Vi lär ut kritiken mot oss själva bättre
   än kritikerna gör." Disclaimern "Pedagogisk analys — inte investeringsråd" finns
   redan på 103 ställen i src/ — den ÄR en token, bara oformaliserad.
5. **Gratis utan asterisk.** "kostnadsfritt, för alltid" + avlastare i microradan:
   "Ingen kortuppgift. Ingen försäljning." (social-proof) · "Inget kort krävs"
   (ordlista heroMikro3).
6. **Anti-casino, anti-FOMO.** finansiell-policy rad 42 LOVAR redan: "Ord som
   'garanterad avkastning', 'riskfritt' eller 'slå index varje år' förekommer aldrig
   i vårt material — se vårt varumärkes-system där de är förbjudna fraser."
   **IOU: systemet som refereras existerar ej än** — m6 är infriandet.
7. **Meta-ärlighet om affären.** "Vi tjänar inte på att du lär dig; vi tjänar på det
   du väljer att göra med kunskapen." (manifest löfte 06) — generositet som affärsidé.
8. **Institutionellt lexikon.** "deterministisk", "reproducerbar", "trösklar",
   "poängsatt 0–5", "20 variabler … maxpoäng 100" — Carnegie-nivå på svenska.
9. **Du-form + resa-metafor.** "välkommen — vi går bredvid dig hela vägen"
   (pedagogik.ts), "nästa stapel på din resa", läroplan i "fem nivåer" (om-oss).
10. **Tacksamhet tvåsidig.** "tack för att du investerar i dig själv" — eleven ska
    känna sig uppskattad, inte skyldig (pedagogik.ts princip 5).

**Drift-varningar (varför "levande" behövs):** docs/BRAND.md (2026-08-24) säger guld
`#a8862a` + slogan "Djupare än en blogg. Ärligare än en bank." — koden säger idag
`--gold: #785c13` (WCAG-justerat 2026-09-02) med `#E8C766` som marin-yte-guld, och
slogansen är en tripplett ("Tydligare… Snabbare…"). Dokumentet har drivit från
koden. Slutsats: sanningskällan måste ligga I koden; dokumentet härleds.

## B. 10 TON-REGLER (ur DNA:t — ska bli `TON_REGLER` i kod)

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

## C. ORDLISTA — vi säger / vi undviker

**VI SAGER:** forskningsunderlag · pedagogisk analys · deterministisk · reproducerbar
· tröskel · poängsatt · forsknings- och utbildningsplattform · elev (aldrig "kund",
aldrig "användare" i elevytor) · resa, nästa steg, stapel · oberoende analytiker ·
gratis i Fas 1 — för alltid · metodiken (AKM1/AK1TS med versaler och siffror: "20
variabler", "5×5×4") · källa redovisas per analys · [est.] för uppskattningar.

**VI UNDVIKER (allvar FEL = juridiskt/löfte, VARNING = tonalt):**
- FEL: "garanterad avkastning" → säg "forskningsunderlag" · "riskfritt"/"riskfri" →
  "riskmätt" · "slå index varje år" · "obegränsad avkastning" · "passiv inkomst utan
  risk" · "säker vinst" · "aktietips"/"köp"/"sälj"-rekommendation (MAR!) ·
  "investeringsråd" om eget innehåll.
- VARNING: "hemliga strategier" (vi har inga — det är poängen) · "sista chansen"/
  "bli inte lämnad bakom"/annan FOMO · "enkelt!" (det är ärligt arbete) · "proffstips"
  · "superkreativ nyckel till framgång"-tomma superlativer · "kunder" om elever ·
  "cashflow-hack"-lånord · utropstecken i rubriker · "revolutionerande".

## D. FORSKNING — varför voice-tokens i kod är rätt (2026)

- **Voice är design-system-innehåll som tokens är kod:** DesignSystems.one-glossariet
  slår fast att "voice and tone is design system content the same way buttons and
  tokens are design system code". PatternFly dokumenterar style/voice/tone som
  first-class UX-writing-lager; Design Systems Collective (Mailchimp = masterclass)
  och Magic Patterns rekommenderar voice-regler FLYTTADE in i designsystemet.
- **Prose-linting är etablerat:** Vale.sh ger "code-like linting for your writing"
  med förbjudna ordlistor i CI — Elastic (vale-rules på GitHub) och GitLab kör det i
  produktion. Vår kvalitetsvakt-sektion 2 är samma mönster, hembyggt.
- **AI-epokens äkthet (2026):** Comprend: publiken kräver "real, intentional and
  accountable communication" — robot-auto och performativ activism avvisas.
  Forskning (systematisk review): AI-disclosure aktiverar "persuasion knowledge" och
  urholkar förtroende; konsekvens: rösten måste vara mätbart konsekvent, inte bara
  "kännas rätt". Averi: "AI can generate unlimited content, but only authentic
  customer voices build trust" — bekräftar social-proofs princip "aldrig påhittade
  citat när verkligheten finns".
- **E-E-A-T/YMYL:** Google (helpful content) håller finansiellt innehåll till
  högre E-E-A-T-standard; första "E" (first-hand experience) och verifierbar
  ärlighet är rankningsvaluta — och E-E-A-T blir portvakt för AI-sök-citat 2026.
  Vår "redovisa generöst + alla fel loggas öppet"-ton ÄR maskinläsbar E-E-A-T.

## E. DESIGN — `src/lib/varumarke.ts` (kod-sanningskälla; BYGGS EJ Här)

```ts
// src/lib/varumarke.ts — varumärket som kod. Importeras av: komponenter,
// email-mallar, nyhets-motor, AI-prompter, kvalitetsvakt (via JSON-spegling).
export const VARUMARKE_VERSION = "1.0.0";
export const TON_REGLER = [ { id, regel, exempel, antiexempel } /* ×10, se §B */ ];
export const LEXIKON = { viSager: string[], undviker: ForbjudenFras[] };
export type ForbjudenFras = { fran: RegExp; istallet: string;
  allvar: "FEL" | "VARNING"; motiv: string };
export const FORBJUDNA_FRASER: ForbjudenFras[] = [ /* §C-listan, ~18 rader */ ];
export type Persona = "nyborjare" | "avancerad" | "b2b";
export const HUVUDBUDSKAP: Record<Persona, { rubrik: string; underrubrik: string;
  bevis: string[]; cta: string }> = { /* se tabell nedan */ };
export const CTA_HIERARKI = [ { niva: "signatur", klass: "btn-guld-signatur",
  regel: "max EN per vy; huvudhandling; verb först" }, { niva: "primar",
  klass: "btn-marin" }, { niva: "sekundar", klass: "border-gold/50 outline" },
  { niva: "textlank", klass: "text-gold underline decoration-gold/40" } ];
export function kontrolleraText(text: string): Traff[];
// Traff = { fras, index, allvar, ersattning } — körs av vakten OCH som
// sista grind i AI-publiceringspipelines (nyhets-motor, analysfabrik).
export const SIGNATUR = { disclaimer: "Pedagogisk analys — inte investeringsråd",
  slogan: "Djupare än en blogg. Tydligare än en bank. Snabbare än en utbildning." };
```

**Huvudbudskap per persona (grundat i befintlig copy):**

| Persona | Rubrik | Bevis | CTA signatur |
|---|---|---|---|
| nyborjare | "Bli analytikern som ser vad andra missar." (hero, ordlista) | från första årsredovisningen till certifikatet; quiz; "Ingen kortuppgift" | "Bli medlem — gratis" |
| avancerad | "Väg ihop nyckeltal som en institutionell analytiker." (FAQ, page.tsx) | AKM1 V01–V20, AK1TS 5×5×4, deterministiska motorer, 201 case studies | "Utforska kurserna" → Superanalysen |
| b2b | "Certifierad = klar för /pro-plattformen." (fas3 §B2B) | certifiering A–F, etik-del, analytikerkod, "pedagogisk kompetensprövning — aldrig rådgivningslicens" | "Ansök — vi kan avböja, du kan avbryta" |

**Speglingsmekanik (siffror-mönstret):** data är single source i
`data/varumarke.json` (skrivs av litet skript eller hand-editas) → importeras av
både src/lib/varumarke.ts (app) och verktyg/kvalitetsvakt.mjs (vakt) — exakt som
siffror.json/siffror.ts. Ingen dubbelpost, ingen drift.

## F. KVALITETSVAKTEN — sektion 2b "Förbjudna fraser" (skiss)

Kvalitetsvakten (verktyg/kvalitetsvakt.mjs, daglig 07:00 via /api/cron/kvalitet)
har redan allt behövt infrastruktur: `extraheraUiStrangar()` plockar JSX-text,
attribut-strängar och UI-objekttext ur src/components/ak1a/*.tsx + alla
src/app/**/page.tsx; `kontext()` ger ±60 tecken; rapport + RESULTAT_JSON finns.
Skiss: ny funktion `sektionForbjudnaFras(er)` som återanvänder extraktionen men
matchar mot FORBJUDNA_FRASER (ordgränser, skiftlägesokänsligt, "avkastning" även
i sammansättningar) och:
- allvar FEL → räknas i `fel` (påverkar RÖD/GUL direkt — juridiska fraser SKA stoppa),
- allvar VARNING → `manuella` (syns i rapporten, mänsklig granskning).
- Utöka filunderlaget med src/lib/email-mallar.ts + nyhets-motor.ts + seo.tsx
  (copy utanför komponenter täcks ej idag — luckan finns).
- Inga ändringar i cron-rutten behövs — den parsar redan RESULTAT_JSON generiskt.

## G. IMPLEMENTERINGSORDNING (för main) + 3 REKOMMENDATIONER

**Rekommendation 1 — Bygg varumarke.ts + data/varumarke.json som sanningskälla.**
Koden blir bibeln; docs/BRAND.md härleds (genereras eller granskas mot den) vid
varje revidering. Fixa samtidigt den upptäckta driften: BRAND.md:s guld #a8862a →
kodens #785c13/#E8C766, slogan 2-led → 3-led. Mönster finns: siffror.ts.

**Rekommendation 2 — Sektion 2b i kvalitetsvakten (FEL-nivå).**
Ful-fyllelse av finansiell-policy:s redan publicerade löfte ("se vårt varumärkes-
system där de är förbjudna fraser"). Hård dragning: juridiska fraser = fel som
styrt status RÖD; tonala = manuella. Utökad täckning av lib-copy.

**Rekommendation 3 — Rösten som import i AI-organen.**
kontrolleraText() som sista grind i nyhets-motor, email-mallar, analysfabrik och
systemprompter (bounded engines follow BRAND — idag bara ett löfte i text);
HUVUDBUDSKAP/CTA_HIERARKI som enda källa för nya marknadsytor. Därmed är rösten
versionshanterad, testbar och identisk på sv/en/ar-ordlistans väg.

**Förslag på vågordning:** v1: varumarke.json+ts+exporter (§E) → v2: vakten 2b
(§F) → v3: AI-organ-import → v4: BRAND.md-regenerering. Committa inget från denna
forskningsrapport — den är underlag.

## KÄLLOR (forskning 2026-09-04)

- [DesignSystems.one — Glossary (voice/tone som tokens)](https://www.designsystems.one/glossary)
- [PatternFly — Brand voice and tone](https://www.patternfly.org/ux-writing/brand-voice-and-tone)
- [Design Systems Collective — Your Design System Is Missing a Voice](https://www.designsystemscollective.com/your-design-system-is-missing-a-voice-why-tone-matters-793df70dad53)
- [Magic Patterns — Design system documentation](https://www.magicpatterns.com/blog/design-system-documentation)
- [Vale.sh — prose-linter](https://vale.sh/) · [docs](https://docs.vale.sh/) · [Elastic vale-rules](https://github.com/elastic/vale-rules) · [GitLab Vale-tests](https://docs.gitlab.com/development/documentation/testing/vale/)
- [Comprend — Authenticity in the Age of AI (2026)](https://www.comprend.com/news-and-insights/insights/2026/authenticity-in-the-age-of-ai-why-trust-and-brand-discipline-matter-more-than-ever/)
- [Systematisk review — Consumer Trust in AI-Generated Marketing Content](https://americanimpactreview.com/article/e2026024)
- [Averi — UGC & authenticity in the age of AI](https://www.averi.ai/blog/user-generated-content-authenticity-in-the-age-of-ai)
- [Google — Creating Helpful, People-First Content (E-E-A-T)](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Semrush — E-E-A-T och YMYL](https://www.semrush.com/blog/eeat/) · [RankMax — E-E-A-T för AI-sök](https://www.rankmax.com.au/articles/eeat)
