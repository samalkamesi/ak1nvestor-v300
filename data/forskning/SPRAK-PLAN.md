# SPRAK-PLAN — svenska | english | العربية

**Kunddirektiv (ordagrant):** "Vi behöver ha språk ersättning till engelska och arabiska med exakt samma avancering."

**Upprättad:** 2026-09-01, våg 50 agent 4 (språkgrund). Status-uppdateras vid varje fas.

---

## 1. Verklighetens förutsättningar (läs detta först)

Sajten har **333 kurser** med **2 916 kapitel**, **8 211 quizfrågor** och sammanlagt
**~2,06 miljoner ord** kursinnehåll (public/deep-courses.json, 14,4 MB). "Exakt samma
avancering" på tre språk betyder därför entydigt:

1. **Gränssnittet** (menyer, knappar, notifieringar, kurs-UI) kan och SKA översättas
   nu — det är ~120 återanvända ord.
2. **Kursinnehållet** kan INTE maskinöversättas blint i en våg. Pedagogiskt
   finansspråk (fundamental analys, AKM1-termer, metaforer) förtjänar samma
   kvalitet på alla tre språken — annars bryts kundens eget krav om "exakt samma
   avancering". Därför: fasad pipeline med kvalitetsgrind, aldrig blind
   autoöversättning.

**Arkitekturprincipen:** klientsidig språkväxling utan routing-omläggning. Alla
700+ SSG-sidor förblir svenska i server-renderingen (SEO intakt, SSG intakt);
komponenter som konsumerar `t()` byter textnoder efter hydrering. Ingen URL-
struktur ändras i fas 1–2. (Ev. `/en/...`-sökvägar för SEO är ett separat,
senare beslut — se fas 3.)

---

## 2. FAAS 1 — Gränssnittet (LEVERERAD denna våg, 2026-09-01)

### Levererat

| Del | Fil | Innehåll |
|---|---|---|
| Språkregister | `src/lib/sprak.ts` | `SprakId = 'sv'\|'en'\|'ar'`, SPRAK-register (kod/namn/flagga/dir), localStorage `ak1a-sprak-v1`, navigator-detektering (ENDAST sv/en/ar — annars svenska), `dirForSprak` (ar ⇒ rtl), `oversatt()` = typsäker t med `{param}`-interpolation + sv-fallback, `skapaT()`, `oversattText()` = best-effort fritextmatchning |
| Ordbok | `src/lib/ordlista.ts` | ~125 nycklar × 3 språk: huvudmeny (Lär/Analysera/Träna + alla menypunkter), inloggning, kurs-UI, notiser, CTA:er, footer/juridik, generella UI-ord. Arabiska: formell men tillgänglig finansiell stil; latinska förkortningar behålls (AKM1, AK1TS, ROE, NCAV, XP) |
| Rot-context | `src/components/ak1a/sprak-leverantor.tsx` | `SprakLeverantor` monterad i `src/app/layout.tsx` (ytterst i ThemeProvider). Sätter `<html lang>` + `<html dir>` (ar ⇒ `dir="rtl"`). SSR = svenska ⇒ ingen hydration-mismatch ⇒ ingen blink; bara textnoder byts (MGTM) |
| Väljare | `src/components/ak1a/sprak-vaxlare.tsx` | Diskret SV/EN/AR-knapp i TemaVäxlarens stil. **Monterad i seo-page-shell-headern.** Montering i SPA-header + mobilmeny = main (se §5) |
| Brödsmulor | `src/components/ak1a/brodkrumma.tsx` | Klientversion: brödsmulenamn matchas mot ordlistan ("Kurser", "Läroplanen", "Biblioteket"… ⇒ en/ar); sidunika namn förblir svenska tills fas 2 |
| Inloggad knapp | `src/components/ak1a/inloggad-knapp.tsx` | Logga in / Logga ut / "{namn} · Min Sida" / "du" |
| Kurs-UI | `src/components/ak1a/kurs-steg.tsx` | Nästa/Föregående (pilar speglas i RTL), Testa dig själv, Kapitel X av Y, Masterquiz, Rätt!, kapitel behärskat, Kursen klar, Grattis, 10x-insikt, Utmaning, nivå-upp-banner, tips-fallback — ALLT utom själva kursinnehållet |
| Notiser | `src/components/ak1a/notis-center.tsx` | Notiser, nya/olästa, Alla lästa, Rensa, Markera läst, Gå dit, Från signalbussen, "Allt lugnt", relativ tid (just nu/min/h/d), typ-etiketter (Varning/Möjlighet/Beslut), systemnotis-titel |

### Begränsningar (medvetna, fas 2)
- Sidrubriker/brödtext i page.tsx = svenska tills fas 2.
- Huvudmenyns (huvudmeny.tsx) och mobilmenyns egna ord kopplas av main till
  samma `t()` — orden finns redan i ordlistan (nav.*).
- Sidfooter (serverkomponent) visas på svenska tills fas 2 (orden finns i
  ordlistan: footer.*).

---

## 3. FAAS 2 — Nyckelsidor (ej påbörjad)

**Omfattning:** startsidan (SPA-hem + sektioner), /medlemskap, /kurser-översikt,
/logga-in, /laroplan-landning + de ~15–20 mest trafikerade SEO-sidorna. Uppskattad
volym: **20 000–35 000 ord** (rubriker, CTA-texter, landningstexter, footer).

**Metod:** extrahera strängar till ordlistan per sida (mekaniskt arbete,
1–2 dagor utveckling) + **professionell översättning av textmassan**.
LLM-assisterat första utkast är acceptabelt för löpande brödtext, men ALL
marknadsförings- och juridiknära text (medlemskapsvillkor, disclaimer) granskas
av kvalificerad översättare EN→AR särskilt.

**Ärlig tidsuppskattning:**
- Strängextraktion + komponentkoppling (utveckling): **2–3 arbetsdagar**.
- Översättning 30k ord: professionellt ~2 500 ord/dag ⇒ **~12 dagar**
  (en översättare) eller LLM-utkast + mänsklig granskning ~6 000 ord/dag ⇒ ~5–6
  dagar granskning per målspråk.
- RTL-granskning av nyckelsidor (layout, pilar, ikonpositioner): **1 dag**.
- **Totalt: ~2–3 veckor sammanlagd insats** med en översättare + en utvecklare.

**Krav som måste köpas in:** översättare med finansiell kompetens (sv→en,
sv→ar), eller LLM-pipeline med **mänsklig granskningsgrind** — kundens krav
"exakt samma avancering" gäller också fas 2.

---

## 4. FAAS 3 — Kursinnehållet, 333 kurser (ej påbörjad)

**Skala (märt 2026-09):** 333 kurser · 2 916 kapitel · 8 211 quizfrågor ·
**~2,06 miljoner ord** (14,4 MB JSON).

### 4.1 Pipeline (batch med kvalitetsgrind — ALDRIG blind maskinöversättning)

1. **Extraktion:** kurs-JSON ⇒ översättningspaket per kurs (titel, summary,
   learn/why, kapiteltext, intro, quiz-frågor+alternativ+tips). Struktur
   bevaras — inga fritt flytande texter.
2. **Termbank först (förrätt):** dokumentera kanoniska översättningar av
   AKM1/AK1TS-terminologi (sv→en→ar) — t.ex. fundamental analys =
   التحليل الأساسي, ROE behålls ROE, vågfundament = أساس الموجات. Termbanken
   granskas och godkänns INNAN batcherna körs. Uppskattning: **3–5 dagar**
   (~300–500 termer + definitioner).
3. **Batch-översättning:** LLM-assisterat utkast kurs för kurs (batchar om
   ~10 kurser) med termbanken påtvingad i prompten. ALDRIG publicerat direkt.
4. **Kvalitetsgrind per batch (obligatorisk):**
   a. **Maskinella kontroller** (automatiserbara, ~1 dag utveckling):
      - termöverensstämmelse mot termbanken (0 avvikelser),
      - sifferintegritet: alla tal/nyckeltal identiska med svenska källan
        (2 916 kapitel innehåller räkneexempel — en felaktig siffra är en
        faktafel, inte en språkfel),
      - quiz-integritet: rätt svar-index (ratt) oförändrat, alternativ-antal
        lika, inga tomma strängar,
      - längdsanitet (arabiska ~ +15–25 % tecken vs svenska; kraftigt avvikande
        längd ⇒ flagga för granskning).
   b. **Mänsklig granskning:** stickprov 100 % av kapitelrubriker + 10 % av
      brödtext per batch + 100 % av ekonomiska resonemang med tal. Granskare
      med finansiell kompetens.
5. **Lansering per batch:** 10 kurser i taget, EN först eller EN+AR parallellt.
   Beteckning i UI: språkbadge "maskingranskad" saknas — inget publiceras
   som inte passerat grinden.

### 4.2 Ärlig tidsuppskattning fas 3

| Spår | Antagande | Tid |
|---|---|---|
| Enbart professionell översättning (2 språk) | ~2 500 ord/dag/översättare × 2 M ord × 2 språk | **~1 650 översättardagar** — orealistiskt för en liten styrka |
| **Rekommenderat: LLM-utkast + granskning** | granskning/korrigering ~6 000–8 000 ord/dag/person | ~260–340 granskningsdagar per språk; 2 språk med 2 granskare parallellt ⇒ **~4–6 kalendermånader** |
| Utveckling av pipeline + kontroller | extraktor, termbanksverktyg, valideringsskript, batch-UI | **~5–8 arbetsdagar** |
| Termbank | se ovan | 3–5 dagar |

**Rekommendation till kunden:** börja med EN+AR för **15–20 flaggskepps-
kurserna** (ORIGINAL_BOKMASTER + FLAGGSKEPP i src/lib/badges.ts) — det ger
~10 % av volymen men täcker majoriteten av elevens första 3 månader. Tid:
**~3–4 veckor**. Resten i batcher efter trafik/efterfrågan.

### 4.3 ARABISKA/RTL-specifika krav (gäller alla faser)

- `dir="rtl"` sätts på `<html>` (klart sedan fas 1). Testa per sida:
  sticky headers, breadcrumb-ordning, marginaler (border-l ⇒ border-r i
  RTL där strukturella), pil-ikoner (→/←) — kurs-steg speglar redan logiskt.
- **Typografi:** Inter/Source Serif saknar arabiska glyfer ⇒ webbläsarens
  fallback-teckensnitt används (sevärt men inkonsekvent). Rekommendation:
  lägg ett arabiskt typsnitt i next/font (t.ex. Noto Naskh Arabic för brödtext,
  Cairo för UI) med `[dir="rtl"]`-väljare. ~0,5–1 dag.
- **Blandad riktning:** tickers, nyckeltal (P/E, ROE) och belopp i latinska
  tecken mitt i arabisk text — använd Unicode-isolerade värden där siffror
  visas (t.ex. `<bdi>` runt tickers) så att bidi-algoritmen inte flyttar
  tal.
- **Numeraler:** arabiska läsare på finanssajter förväntar sig västerländska
  siffror (0–9) — behåll latinska siffror (gäller även quiz).
- **Quiz-alternativ:** `{alternativ}` i RIGHT-to-left kontext måste behålla
  bokstavsindex (A/B/C) latinskt eller bytas till أ/ب/ج — beslut i termbanken.

---

## 5. Monteringspunkter för main (språkväxlaren)

`<SprakVaxlare />` (import: `@/components/ak1a/sprak-vaxlare`) är monterad i:

1. **KLART:** `src/components/ak1a/seo-page-shell.tsx` — huvudraden, mellan
   `<InloggadKnapp />` och `<TemaVaxlare />` (alla ~700 SEO-sidor).

Återstående montering (menyagenten äger filerna just nu — main monterar):

2. `src/components/ak1a/header.tsx` (SPA-headern) — i verktygsraden bredvid
   tema-knappen: lägg `<SprakVaxlare />` på samma rad som TemaVaxlare-motsvarigheten.
3. `src/components/ak1a/mobilmeny.tsx` — i lådan, på egen rad under
   inloggnings-/temaknapparna.
4. Samtidigt: koppla menyorden i huvudmeny.tsx/mobilmeny.tsx/header.tsx till
   `t("nav.*")` — orden finns redan i ordlistan (Lär/Analysera/Träna + alla
   punkter), se `nav.*` i `src/lib/ordlista.ts`.

---

## 6. Beslut som krävs av kunden (inte tekniska)

1. **Översättningsresurs fas 2:** professionell översättare ELLER LLM-pipeline
   med mänsklig granskning — budget för ~12–18 dagar arbete.
2. **Fas 3-spår:** flaggskepps-kurser först (rekommenderat) eller allt-i-ett;
   EN före AR eller parallellt.
3. **SEO-strategi för flerspråkighet:** dagens lösning är klientsidig (en URL,
   svenska i crawlen). Vill kunden ranka på EN/AR krävs separata sökvägar
   (`/en/`, `/ar/`) i fas 3 — det är en SSG-utbyggnad på ~2–4 dagar per
   språk + dubbel build-tid, och beslutet påverkar sitemap/canonical.
