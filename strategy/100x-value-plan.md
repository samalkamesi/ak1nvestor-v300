# AK1A Research Lab — 100x Value Plan

> MÅL: bygga 100x mer värde för AK1A Research Lab.
> Mätbart: 100x organisk trafik, 100x konvertering, 100x medlemmar, 100x kundnöjdhet (NPS).
> Tidsram: 12 månader i 4 faser. Allt mätbart via /api/admin och Google Search Console.

---

## Nuläge (känt från worklog + AUTONOMOUS_SYSTEM.md + kodgranskning)

| Område | Idag | Smärta |
|---|---|---|
| SEO | 1 URL i sitemap, ingen JSON-LD, SPA-routing | Google kan inte indexera kurser/analyser |
| AI-SEO | Saknas | Manuellt underhåll av meta-tags |
| Konvertering | Free → Premium → Pro, ingen funnel-spårning | Läckage okänt |
| Content | 225 kurser, 198 case studies, 0 blogg-inlägg | Ingen publik innehållsstrategi |
| Admin | 7 flikar (översikt, aktivitet, portföljer, uppladdning, events, statistik, AI-organ) | Inte WordPress-lik — ingen innehållsredigering |
| Medlemskap | free/premium/pro i Supabase, ingen betalning | Ingen Stripe, ingen paywall |
| Automatisering | 2 cron (autonom + expand-courses) | Manuella delar kvar |
| Kundupplevelse | Vacker DNA-design, 1-sidig app | Ingen personalisering, ingen AI-tutor |

---

## 1. SEO-optimering — ranka #1 på Google

### 1.1 Teknisk SEO (kritiskt, vecka 1-2)
- **Multipage-routing**: Konvertera från SPA-section-state till Next.js App Router routes:
  - `/` (hem), `/analyser`, `/analyser/[ticker]`, `/kurser`, `/kurser/[slug]`
  - `/labb`, `/labb/[case-id]`, `/utbildning`, `/fas3`, `/om-oss`, `/strategi`
  - Behåll klient-state för sektionsbyte inom en route, men varje route blir crawl-bar
- **Dynamisk sitemap** (`src/app/sitemap.ts`): Generera från `deep-courses.json` (225) + `analyses/` (2+) + `case-studies.json` (198) + statiska sidor → ~430 URL:er
- **Dynamisk robots.txt** (`src/app/robots.ts`): Tillåt alla + sitemap-referens
- **JSON-LD på varje sida** (se avsnitt 2)
- **Canonical URLs** + hreflang (svenska primär, engelska sekundär för Q3 2026)
- **Core Web Vitals**: <1.8s LCP, <200ms CLS, <200ms INP (mät via Vercel Analytics)

### 1.2 On-page SEO per sökord

| Sökord | Landningssida | Strategy |
|---|---|---|
| "svensk aktieanalys" | `/analyser` + blogg-pelare | 5-7 analyser publicerade, varje med "svensk aktieanalys" i H1, intro, alt-text |
| "institutionell metodik" | `/strategi` + blogg-pelare | Pelar-artikel 3000 ord, länkad från 20 sub-artiklar |
| "AKM1" | `/kurser` + dedikerad `/akm1` | 20 sub-sidor (V01-V20), intern länkning cirkulär |
| "pedagogisk finansanalys" | `/utbildning` + `/om-oss` | "Pedagogisk"-orden i metadata + H2 på utbildning |

### 1.3 Off-page SEO (månad 1-6)
- **Backlinks**: 10 svenska investerings-forum (Placera, Aktieinvest, Nordnet community, Reddit r/aktier, Shareville-profiler)
- **Gästbloggar**: Carnegie Insights, MFN, Affärsvärlden — 1 inlägg/månad med länk tillbaka
- **LinkedIn**: 2 inlägg/vecka från grundarens profil (B2B-reach)
- **Podcasts**: 3 svenska finanspoddar gästas under året
- **Press**: Q1 — "Sveriges enda institutionella metodik för privatpersoner" press-release
- **HARO / Swedish equivalent**: Svara på finans-journalistfrågor

### 1.4 Mätetal (månadsvision)
- Search Console: 0 → 10 000 klick/mån på 12 mån
- "svensk aktieanalys" position 50+ → #1-3
- Domain Authority (Moz): 5 → 35+
- Backlinks: 0 → 200 referring domains

---

## 2. AI SEO — automatiserad SEO-pipeline

### 2.1 AI-meta-tag generator (`scripts/seo-generate.ts`)
- Läs alla `deep-courses.json`, `analyses/*.json`, `case-studies.json`
- Använd z-ai-web-dev-sdk LLM för att generera per-objekt:
  - `title` (50-60 tecken, sökord först)
  - `description` (150-160 tecken, CTA-impuls)
  - `keywords` (5-7, lång-svans + kort-svans)
  - `og:title`, `og:description`, `og:image` (AI-genererad via image-generation skill)
- Skriv till `data/seo/[slug].json` — Next.js `generateMetadata` läser vid build
- Kör varje `git push` via GitHub Action (eller vid `/api/cron/seo-refresh`)

### 2.2 Structured data automation
- **Organization** schema på alla sidor (logo, founded, address, sameAs → LinkedIn)
- **WebSite** schema med SearchAction (site-links search box)
- **Course** schema per `/kurser/[slug]` (name, description, provider, timeRequired, educationalLevel)
- **Article** schema per `/blogg/[slug]` (headline, datePublished, author, image)
- **FAQPage** schema: AI genererar 3-5 FAQ per kurs från innehållet
- **BreadcrumbList** schema på alla undersidor
- **HowTo** schema på utbildnings-steg
- **Review/AggregateRating** schema när vi har medlemsomdömen (Q3)
- Validera med schema.org validator i CI — bygget failar om ogiltig

### 2.3 Sitemap automation
- `/api/cron/seo-refresh` (var 6h): regenerera `sitemap.xml` från data-mapp
- Push till `public/sitemap.xml` + pinga Google (`/ping?sitemap=...`)
- Sitemap-index: dela i `sitemap-courses.xml`, `sitemap-analyses.xml`, `sitemap-blog.xml`, `sitemap-static.xml` (50 000 URL:er per fil)

### 2.4 Programmatic SEO
- Auto-generera landningssidor för kombinationer: `/[ticker]/[variabel]` (t.ex. `/volcar-b/v09-roe`)
- = 2 tickers × 20 variabler = 40 landningssidor (vid 10 tickers: 200 sidor)
- Varje sida: unik H1, intro från analys-JSON, kurs-länk, relaterade analyser
- Mål: 200 långsvans-sökord ("volvo cars roe analys", "precise biometrics bruttomarginal")

### 2.5 AI-driven innehålls-gap
- Månadlig körning: hämta topp-100 sökord från Search Console
- LLM-analys: vilka sökord har vi inte sida för?
- Generera automatiskt content briefs (inte innehåll — det skriver mänsklig redaktör)
- Skriv till `/admin/seo/content-briefs.json`

---

## 3. Conversion optimization — besökare → Fas 2/3

### 3.1 Tratt-mätning (månad 1)
```
Besökare → Registrerad (free) → Premium → Pro
   100%         3% → 8% (mål)    8% → 20% (mål)   20% → 5% (mål)
```
- Installera PostHog (free tier) eller Vercel Analytics + custom events
- Spårning på: section_view, course_open, analysis_open, register_click, register_complete, booking_click, booking_complete, upgrade_click, upgrade_complete

### 3.2 Lead magnets
- **Gratis mini-analys**: "Skicka din portfölj, få 1 innehav analyserat gratis" (i utbyte mot e-post)
- **5-dagars e-postkurs**: "AKM1 på 5 dagar" — daglig e-post med 1 variabel/dag
- **PDF-checklista**: "20 frågor innan du köper en svensk aktie"
- **Webinar-monthly**: "AK1A Live — marknadsöversikt" första onsdagen/månad
- **Newsletter**: veckovis (gratis) med marknadskommentar + länk till ny analys

### 3.3 CTA-strategi per sektion
| Sektion | CTA | Konverteringsmål |
|---|---|---|
| Hem | "Starta gratis mini-analys" | E-post |
| Analyser | "Lås upp alla analyser" | Premium |
| Kurser | "Prova Premium 7 dagar gratis" | Premium-trial |
| Labbet | "Skicka in case" | Free → engagemang |
| Utbildning | "Börja läroplanen" | Free → engagemang |
| Fas3 | "Bli Pro-medlem" | Pro |
| Strategi | "Boka samtal" | Lead |

### 3.4 E-post nurture (5 e-post för free → Premium)
1. Dag 0: Välkommen + gratis mini-analys (innehåller analys av 1 innehav)
2. Dag 2: "Här är V09 (ROE) — varför Carnegie bryr sig"
3. Dag 4: Case study — "Hur vi analyserade Volvo Cars"
4. Dag 7: "Vad du saknar som free-medlem" ( jämförelsetabell)
5. Dag 10: "7 dagar Premium gratis — ingen kortkrav"

### 3.5 Premium → Pro-uppgradering
- Visa "Pro-exklusivt" badges på Fas 3-innehåll när användare är Premium
- Årlig metodik-audit-certificate (autentisk NYCKEL per `reproducibility-honesty.md`)
- 1 gång/månad: "Pro-medlem fördjupnings-call" exklusivt
- Waitlist-modell: "Pro-medlem 2026 — ansök nu" (skapar scarcity)

### 3.6 Social proof
- testimonials-carousel på Hem (5 omdömen)
- "X medlemmar analyserar med AK1A idag" (levande räknare)
- Case study: "Hur [medlem X] gick från nybörjare till Pro på 6 mån"
- Medlemsvittnesmål på LinkedIn (delning opt-in)

### 3.7 Retention
- Avboknings-survey: "Varför avslutar du?" → auto-erbjudande (rabatt, paus, nedgradering)
- Win-back: e-post 7 dagar efter avslut med "Vi saknar dig — 50% rabatt i 1 månad"
- Års-överlevnad: mät cohort-retention månad för månad

---

## 4. Content strategy — vad ska bloggas om

### 4.1 Pelare/kluster-modell (4 pelare)

**Pelare 1: "Svensk aktieanalys"** (huvudord)
- Pelar-artikel: "Komplett guide till svensk aktieanalys 2026" (3000+ ord)
- Kluster (15 artiklar): "Analysera Volvo Cars", "Analysera H&M", "Analysera AstraZeneca"...
- Intern länkning: kluster → pelare, kluster ↔ kluster

**Pelare 2: "Institutionell metodik"** (differentiator)
- Pelar-artikel: "Vad är institutionell aktieanalys — och hur privatpersoner kan använda den"
- Kluster (10): "Skillnaden mellan retail och institutionell", "Varför banker inte visar sin metod"...

**Pelare 3: "AKM1"** (20 sub-artiklar)
- En artikel per variabel V01-V20
- Varje artikel: definition, formel, tolkning, exempel från riktig analys, "hur AK1A använder"

**Pelare 4: "Pedagogisk finansanalys"**
- Pelar-artikel: "Varför pedagogisk finansanalys slår investeringsråd"
- Kluster (10): "Förstå bokföring", "Läs en årsredovisning", "Räkna ROE själv"...

### 4.2 Publicerings-cadence
- **Måndag**: Djup analys (1500 ord) — ny svensk aktie
- **Onsdag**: Variabel-fördjupning (800 ord) — V01-V20 serie
- **Fredag**: Marknadskommentar (600 ord) — veckans händelser
- **Månad 1:a**: Pelar-artikel (3000+ ord) —SEO-motor
- = 4 inlägg/vecka × 52 veckor = 208 inlägg/år

### 4.3 Ämnen som attraherar kunder
- "Så läser du en svensk årsredovisning — steg för steg" (Q1 rapportperiod)
- "Volvo Cars Q4 2025 — institutionell genomgång"
- "Hur man undviker 5 vanliga nybörjarmisstag med svenska aktier"
- "AKM1 vs Graham & Dodd — vad skiljer?"
- "Elliott Wave för skeptiker — fungerar det?"
- "Så räknar Carnegie — och varför du kan också"
- "Reproducerbarhet i finansanalys — vetenskaplig standard"
- "AI och aktieanalys — fara eller möjlighet?"
- "Konfluens: när fundamental och teknisk analys säger samma sak"
- "Den svenska replikationskrisen i finans — och hur AK1A löser den"

### 4.4 Multi-kanal & mix
- Blogg → LinkedIn (kortare) + Twitter-tråd + YouTube (8-12 min) + Newsletter + Podcast (20 min)
- Varje inlägg = 5 kanaler. 208 inlägg × 5 = 1040 innehålls-enheter/år
- 70% evergreen (SEO-motor), 30% nyhets-aktuellt (Q-rapporter, börs-händelser) — engagemang

---

## 5. Admin system — till WordPress-nivå

### 5.1 Befintliga 7 flikar (behåll)
Översikt, Aktivitetslogg, Klientportföljer, Analys-uppladdning, Systemevents, Statistik, AI-organ styrelse

### 5.2 Saknade 12 flikar (bygg)

| # | Flik | Funktion |
|---|---|---|
| 8 | **Innehållsredigerare** | CRUD för kurser, case studies, analyser, blogg-inlägg. Markdown-WYSIWYG. Auto-save. Preview. |
| 9 | **Medlemmar** | Lista, sök, filtrera. Ändra tier, status, lösenord. Se aktivitetshistorik. |
| 10 | **Bokningar** | Kalender-vy, bekräfta/avboka, skicka reminder-email, blockera tider |
| 11 | **E-postkampanjer** | Skapa nyhetsbrev, välj segment, schemalägg, se open/click-rate |
| 12 | **SEO-panel** | Redigera meta-tags per sida. Se rankings. Sökords-gap. Sitemap-status. |
| 13 | **Statistik + konvertering** | Funnel: besökare → free → premium → pro. Cohort-retention. A/B-test resultat. |
| 14 | **Media-bibliotek** | Ladda upp, organisera, sök bilder. Auto-generera alt-text med AI. |
| 15 | **Sidor & navigering** | Skapa egna sidor (om-oss, kontakt). Ändra meny-ordning. |
| 16 | **Betalningar** | Stripe-integration. Se transaktioner, återbetalningar, MRR, churn. |
| 17 | **Användarroller** | Admin / Redaktör / Analytiker / Viewer. Behörighetsmatris. |
| 18 | **Audit-log** | Vem ändrade vad, när. Oföränderlig logg i Supabase. |
| 19 | **Inställningar** | Site-titel, logo, brand-färger, SMTP, API-nycklar, feature-flags. |

### 5.3 Implementations-principer
- Varje flik = egen React-komponent i `src/components/ak1a/admin/tabs/`
- Gemensam `<AdminShell>` wrapper (sidebar + topbar)
- Real-time-uppdateringar via SWR (polling var 30s)
- Inline-editing där möjligt (klicka på text → redigera)
- Bulk-åtgärder (markera 50 medlemmar → bulk-email)
- Keyboard-shortcuts (⌘K command palette)
- Dark mode i admin (kvälls-arbetande analytiker)

### 5.4 WordPress-paritet-checklist
- [ ] Skapa ny sida utan kod
- [ ] Skapa nytt blogg-inlägg utan kod
- [ ] Ladda upp bild utan kod
- [ ] Ändra meny utan kod
- [ ] Schemalägg publicering
- [ ] Hantera kommentarer (när bloggen har)
- [ ] Installera/avinstallera feature (toggle i inställningar)
- [ ] Backup/restore
- [ ] Multi-user med roller
- [ ] SEO-inställningar per sida
- [ ] Analytics på en skärm
- [ ] E-post utan extern tjänst

---

## 6. Medlemskapssystem — Fas 1/2/3 funktioner som saknas

### 6.1 Nuvarande tier-struktur
- **Fas 1 (Free)**: Läs analyser, kurser
- **Fas 2 (Premium)**: Alla kurser + Labbet + bokning av genomgång
- **Fas 3 (Pro)**: AI-analyser + metodik-licens

### 6.2 Saknade funktioner per tier

**Fas 1 (Free) — ska ha:**
- Bokmärken (spara kurser/analyser)
- "Fortsätt där du slutade"
- Personaliserad startsida (senaste sett)
- E-post-notiser på nytt innehåll (opt-in)
- Tillgång till gratis lead magnets
- Begränsad sökning (5 sökningar/dag)
- Kommentera på blogg-inlägg (med moderation)

**Fas 2 (Premium) — ska ha:**
- Allt i Free +
- Obegränsad sökning
- Alla 225 kurser + 198 case studies
- 1 gratis bokning/månad (15 min)
- Spara egna anteckningar per kurs
- Download PDF-version av analyser
- Premium-nyhetsbrev (veckovis djupdykning)
- Medlemsforum (read + post)
- AI-tutor chatbot (begränsad till 20 frågor/dag)
- Custom watchlist (max 5 aktier)
- E-post-notiser när analyser uppdateras
- Tidig tillgång till nytt innehåll (24h före Free)

**Fas 3 (Pro) — ska ha:**
- Allt i Premium +
- AI-analyser (våg-detektion, konfluens)
- Metodik-licens (tanke-ramverket)
- Obegränsad AI-tutor
- Obegränsad watchlist
- 4 bokningar/månad (30 min)
- API-åtkomst (rate-limited) — hämta analys-data programmatiskt
- Årlig metodik-audit-certificate (Nivå 2.5 per `reproducibility-honesty.md`)
- Prioriterad kö vid "Request new analysis"
- Q&A-prioritet i forum (märks "Pro-medlem svarar")
- Quarterly 1-1 call med analytiker (30 min)
- Embed-widget för egen hemsida (Power 20 visualization)
- Pro-exklusiv Discord/Slack-kanal

### 6.3 Betalnings-integration
- **Stripe** (eller Reepay för SEK) — abonnemang
- **Månadsvis** Premium 199 kr/mån, Pro 999 kr/mån
- **Årlig** Premium 1990 kr/år (16% rabatt), Pro 9990 kr/år
- **Trial**: 7 dagar Premium gratis (kräver kort)
- **Lifetime** Premium 9 990 kr (engångs, första 100 medlemmarna)
- **Företagslicens**: Pro Team 5 platser 4950 kr/mån (B2B)
- **Betalnings-metoder**: Kort, Swish, Klarna, faktura (företag)
- **Automatiska kvitton** + årlig sammanställning för Skatteverket

### 6.4 Paywall-implementation
- Middleware (`src/middleware.ts`): kontrollera cookie/token → visa innehåll eller paywall
- Paywall-komponent: "Detta är Premium-innehåll" + CTA + preview (första 20%)
- Hard paywall på Fas 3 (AI-analyser, metodik-licens)
- Metered på Fas 2 (3 gratis analyser/mån → paywall)
- Soft på blogg-inlägg (gratis men med "bli Premium för mer"-banner)

### 6.5 Onboarding-sekvens (ny Free)
Dag 0: Välkomstemail + "Kom igång på 5 min" → Dag 1: "Börja med V01" → Dag 3: "Gratis analys — Volvo Cars" → Dag 7: "Du har sett 3 kurser — vad tycker du?" (survey) → Dag 14: "Premium-trial 7 dagar gratis" → Dag 21: "5 dagar kvar" → Dag 28: Trial slut → "Bli Premium 199 kr/mån"

### 6.6 Progression-tracking
- Kurs-slutförande sparas i Supabase (`member_progress`)
- "Din läroplan" dashboard: visar nästa steg
- Certifikat per avslutad modul (auto-genererad PDF)
- Badges: "AKM1-grunderna klar", "Elliott Wave mästare", "Fas 2-maraton"
- XP och levels för gamification

---

## 7. Automatisering — vad mer kan automatiseras

### 7.1 Befintlig automatisering (behåll)
- `/api/cron/autonom` (var 6h) — AI-organ health check
- `/api/cron/expand-courses` (var 12h) — kurs-expansion

### 7.2 Ny automatisering (12 nya cron-jobb)

| # | Jobb | Frekvens | Funktion |
|---|---|---|---|
| 1 | `seo-refresh` | Var 6h | Regenerera sitemap, pinga Google, validera JSON-LD |
| 2 | `quarterly-report-watcher` | Daglig 07:00 | Hämta årsredovisningar från Finansinspektionen → trigger AI-analys |
| 3 | `price-alert-checker` | Varje timme | Yahoo Finance API → om ±5% på watchlist-aktier → email medlem |
| 4 | `email-drip-sender` | Daglig 09:00 | Skicka nästa e-post i nurture-sekvens |
| 5 | `weekly-newsletter` | Måndag 08:00 | Sammanställ veckans innehåll → skicka |
| 6 | `monthly-pro-report` | 1:a varje månad | Generera "AK1A Månadsrapport" PDF för Pro |
| 7 | `social-auto-share` | Vid publicering | LinkedIn + Twitter + Reddit auto-post |
| 8 | `stale-analysis-detector` | Veckovis | Analyser >6 mån → flagga för uppdatering |
| 9 | `supabase-backup` | Daglig 02:00 | Exportera till JSON → commit till GitHub-backup-branch |
| 10 | `uptime-monitor` | Var 5 min | Pinga produktion → Slack/email om nere |
| 11 | `churn-rescue` | Daglig | Medlem avslutad för 7 dagar sedan → win-back-email |
| 12 | `audit-certificate-gen` | Årlig 1 jan | Generera metodik-audit-certifikat för alla Pro-medlemmar |

### 7.3 AI-automatisering (utöver AI-organ)
- **AI-innehålls-författare**:assistans för blogg-inlägg (människa skriver 70%, AI 30%)
- **AI-översättare**: svensk → engelsk version av allt innehåll (Q3 2026)
- **AI-video-skript**: kurser → 3-min YouTube-skript automatiskt
- **AI-samtalssammanfattning**: bokningar med analytiker → auto-anteckningar för medlem
- **AI-fråge-cluster**: vilka frågor ställer Pro-medlemmar mest → content briefs
- **AI-meta-tag optimerare**: A/B-testa title/description → vinnare implementeras
- **AI-bild-alt-text**: varje bild får auto-alt-text för SEO + tillgänglighet

### 7.4 Workflow-automatisering (GitHub Actions)
- `on: push to main` → lint + test + build + deploy (befintligt)
- `on: PR opened` → AI review-kommentar (kodkvalitet + SEO-check)
- `on: new blog-post file` → auto-generera meta + sitemap-ping + social-share
- `on: schedule (daily)` → backup + uptime-check + drip-emails
- `on: issue created` → auto-assign till AI-organ för prioritering

---

## 8. Kundupplevelse — 100x bättre

### 8.1 Personalisering (ny kärna)
- **"Min sida" dashboard**: senaste kurser, bokningar, analyser, rekommendationer, progress — allt på 1 skärm
- **AI-rekommendationer**: "Baserat på vad du läst — här är nästa kurs"
- **Personaliserad nyhetsbrev**: olika innehåll baserat på intresse
- **Sparade sökningar + alerts**: "Pinga mig när ny Volvo Cars-analys"

### 8.2 AI-tutor chatbot (24/7)
- Tränad på AK1A:s 225 kurser + 198 case studies + analyser
- Svarar metod-frågor ("Vad betyder V09?", "Hur räknar jag ROE?")
- Citar källor (kurs-länk, analys-sektion)
- Eskalerar till mänsklig analytiker om oklar
- Premium: 20 frågor/dag, Pro: obegränsat

### 8.3 Interaktiva verktyg
- **AKM1-kalkylator**: dra sliders för 20 variabler → se rekommendation uppdateras live
- **"What if?"-simulator**: ändra en variabel → se scenarier uppdateras
- **Våg-matris interaktiv**: klicka celler → se konfidens uppdateras
- **Portfölj-stress-test**: "Vad händer om marknaden faller 20%?"
- **Jämförelse-verktyg**: jämför 2 aktier sida-vid-sida (AKM1 + AK1TS)

### 8.4 Hastighet & prestanda
- **Sub-1s LCP** på alla sidor (mät via Vercel Analytics)
- **Instant navigation**: pre-fetch alla routes vid hover
- **Offline-mode** (PWA): ladda ner kurser för flyg/tåg
- **Smart caching**: stale-while-revalidate på all statisk data
- **Image optimization**: WebP, lazy-load, responsive srcset

### 8.5 Tillgänglighet (WCAG 2.2 AAA)
- Tangentbordsnavigering på allt
- Skärmläsare-etiketter på alla ikoner
- Kontrast ≥ 7:1 på all text (Guld på Paper är låg — fixa)
- Text-skalning 200% utan breakage
- Reducerad rörelse-respekt (prefers-reduced-motion)
- Video-textning på allt video-innehåll

### 8.6 Multi-kanal-upplevelse
- **PWA**: installera på hemskärm (mobil + desktop)
- **Native app** (Q4 2026): iOS + Android via React Native (samma data, offline)
- **E-post som interface**: svara på e-post → skapar bokning (parse med AI)
- **SMS-alerts** (opt-in): "Din analys är klar"
- **Apple Watch** (Q1 2027): portfölj-pulse

### 8.7 Gemenskap
- **Medlemsforum**: kategorier per ämne, "AK1A analytiker" badges
- **Cohort-learning**: grupper om 10 startar varje månad — "AKM1 på 30 dagar"
- **Månads-Live Q&A**: 60 min med analytiker, inspelning tillgänglig
- **Medlems-spotlight**: varje månad framhäv en medlem + deras resa
- **Discord/Slack** för Pro-exklusiv community

### 8.8 Trygghet
- **30-dagars pengarna-tillbaka-garanti** (Premium + Pro)
- **Transparens-rapport** kvartalsvis: vilka analyser var rätt/fel + varför
- **Metodik-audit-certificate** årligen för Pro (per `reproducibility-honesty.md`)
- **Tydlig prissättning** — inga dolda avgifter, avsluta när som helst
- **Datasäkerhet** — Supabase RLS, GDPR-compliant, data-export på begäran

### 8.9 "Wow"-detaljer (100x-upplevelsen)
- Välkomstvideo från grundaren (personlig, 90 sek)
- Födelsedags-email med "Här är din årskrönika" (auto-genererad)
- "Du har läst 50 kurser"-badge med verkligt värde (Pro-månad gratis)
- Hand-skrivet välkomstbrev till Pro-medlemmar (fysiskt post, första 100)
- Års-överraskning: "Här är vad vi lärt om dig" — auto-insights
- Real-time klocka som visar nästa Live Q&A countdown

---

## Implementations-faserna (12 månader)

### Fas A (Månad 1-3): Teknisk grund
- Multi-page routing + dynamisk sitemap + JSON-LD
- AI SEO-pipeline (meta + structured data automation)
- Admin flik 8-11 (Innehåll, Medlemmar, Bokningar, E-post)
- Stripe-integration + paywall-middleware
- PostHog konverterings-spårning

### Fas B (Månad 4-6): Innehåll & konvertering
- 208 blogg-inlägg / 4 pelare
- Lead magnets + 5-e-post nurture
- Admin flik 12-15 (SEO, Konvertering, Media, Sidor)
- AI-tutor chatbot v1
- AKM1-kalkylator interaktiv

### Fas C (Månad 7-9): Medlemskap & community
- Fas 1/2/3 fullständiga funktioner per §6
- Forum + cohort-learning
- Admin flik 16-19 (Betalningar, Roller, Audit, Inställningar)
- 12 nya cron-jobb
- PWA + offline-mode

### Fas D (Månad 10-12): 100x-polering
- Native app (iOS + Android)
- WCAG 2.2 AAA-certifiering
- Engelsk version (i18n)
- "Wow"-detaljer (§8.9)
- Årlig transparens-rapport + audit-certificate

---

## Mätmål (12 mån)

| Metric | Start | Mål (12 mån) | Mätverktyg |
|---|---|---|---|
| Organisk trafik | ~0 | 50 000/mån | Google Search Console |
| "svensk aktieanalys" ranking | >50 | #1-3 | Search Console |
| Free-medlemmar | ~0 | 5 000 | Supabase |
| Premium-medlemmar | ~0 | 500 | Stripe |
| Pro-medlemmar | ~0 | 50 | Stripe |
| MRR | 0 | 150 000 kr/mån | Stripe |
| NPS | ej mätt | 60+ | PostHog survey |
| Kurs-slutföranden | 0 | 20 000/år | Supabase |
| Blogg-artiklar | 0 | 208 | Content audit |
| Backlinks | 0 | 200 referring domains | Ahrefs/Moz |
| Sitemap-URL:er | 1 | 2 000+ | sitemap.xml |
| Konvertering besökare → free | okänt | 8% | PostHog funnel |
| Konvertering free → premium | okänt | 10% | PostHog funnel |

---

## Konfidens & nästa steg

**Konfidens: HÖG** — planen bygger på AUTONOMOUS_SYSTEM.md-principer (statisk JSON + Supabase + auto-deploy), `reproducibility-honesty.md` (audit-certificate, Fas 3 licens), `dna-design-system.md` (visuell identitet bevaras), befintlig AI-organ-arkitektur (utökas med 12 nya cron-jobb) och Next.js App Router-native (sitemaps, robots, generateMetadata).

**Närmaste 3 uppgifter (i kod):**
1. Skapa `src/app/sitemap.ts` + `src/app/robots.ts` + `src/app/blogg/[slug]/page.tsx`
2. Skapa `scripts/seo-generate.ts` (AI meta + JSON-LD generator)
3. Skapa `src/app/api/cron/seo-refresh/route.ts` + Vercel cron config i `vercel.json`

**Risker:** Multi-page routing kräver stegvis SPA-refactor (en sektion i taget). Stripe i Sverige kräver Swedish company registration (eller Reepay). AI-tutor kan ge fel svar — börja med "jag vet inte" som tillåtet svar. 208 blogg-inlägg = kapacitetsfråga — pool av 3 frilansskribenter + AI-assistans.

**Mantra:** _Ingen besökare ska lämna AK1A utan att ha upplevt institutionell metodik. Ingen medlem ska stanna utan att känna 100x värde. Allt mätbart, allt spårbart, allt MÄTT._
