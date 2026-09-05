# B2 — Personaväxling Privatperson | Företag (dual-audience IA)

Datum: 2026-09-04 · Våg 61 B2 · Status: förslag, ej implementerat
Kundvision: *"Intelligenta sidor frågar eller har en knapp 'Privatperson', och där
får man allt för privatpersoner; en knapp 'B2B' leder till företagssidan."*
Granskade ytor: `src/lib/meny-register.ts`, `src/components/ak1a/header.tsx`,
`mobilmeny.tsx`, `huvudmeny.tsx`, `seo-page-shell.tsx`, `src/app/pro/*`.

---

## 0. Tre rekommendationer (TL;DR)

| # | Rekommendation | Kostnad | SEO |
|---|----------------|---------|-----|
| R1 | **Toppväxel "Privatperson | Företag" som ren länk-separation** (URL = läge, ingen cookie). Växeln bor i utility-raden på ALLA privatsidor + speglas i PRO-skalet. "AK1A PRO" flyttas ur menypanelen via `yttor: ["footer","sok"]`. | Låg — 3 komponenter + 1 registerrad | Neutral→positiv |
| R2 | **Bygg ut PRO-skalet till egen B2B-nav med rutter** (/pro = Översikt, /pro/klienter, /pro/analys, /pro/rapporter, /pro/priser) — ingen privat-meny, marina väggar kvar. Fixa dödlänken `/terms` → `/villkor`. | Medel | Positiv (mer indexbar B2B-yta) |
| R3 | **CTA-flöde privat→B2B**: "Är du rådgivare?"-block på /fas3, Superanalysen och Dina rapporter + blogg förblir delad med publik-medvetna CTA:n. Kurser/lära/aldrig delade. | Låg | Positiv (interna länkar → /pro) |

---

## 1. Webbforskning: bästa mönster för dual-audience-sajter

### 1.1 NN/g om audience-based navigation — och hur R9 förblir intakt
NN/g ("Audience-Based Navigation: 5 Reasons to Avoid It") varnar för
publikbaserad *huvud*-navigation: användare tillhör ofta flera publiker,
självidentifierar sig fel och innehåll dupliceras. Men artikeln ger också
undantaget: publikgruppering är försvarbar **när uppgifterna är ömsesidigt
uteslutande** mellan grupperna — och det är AK1A:s fall (elevens utbildnings-
flöde vs rådgivarens rapportverkstad: olika verktyg, olika priser, olika juridik).

**Kombination med vår task-baserade struktur (R9 i MENYFORSKNING):**
växeln är inte audience-navigation som *ersätter* task-strukturen — den är en
**områdesväxel (scope switch) ovanför två var för sig task-baserade världar**:

```
[Privatperson | Företag]        ← EN växel, utility-nivå (beständig överallt)
   ├─ Privat:  LÄRA·ANALYSERA·PRAKTIK·OM   (registret, task-baserat — oförändrat)
   └─ Företag: Översikt·Klienter·Analys·Rapporter·Priser (task-baserat B2B-flöde)
```

### 1.2 Persistent topbar-switch vs separata domäner vs path-separation

| Mönster | Exempel | Passar AK1A? |
|---------|---------|--------------|
| **Persistent toppväxel, samma domän** | Svenska storbanker: Nordea ("Privat · Företag · Private Banking"), SEB, Swedbank, Handelsbanken; Swish ("Privat / Företag") | **JA** — branschstandard för finans, matchar kundvisionen exakt |
| **Path-separation (subroot)** | `/pro` som eget subroot med eget skal | **JA** — redan valt (Fas D); bekräftas av SEO-läget (§4) |
| **Separat domän/subdomän** | pro.ak1a.se / nytt varumärke | NEJ — delar länkekvitet, startar från noll (§4.3) |
| **Dual-audience SaaS** | Slack (Free/Pro/Business+ = self-serve; Enterprise Grid = "Contact sales" på egen sida), Notion (personlig → team-bottom-up) | Delvis — bekräftar mönstret "self-serve-publik + säljledd företagssida med egen CTA", men AK1A vill ha hårdare vägg än PLG-jättarna |

Kritiska lärdomar från forskningen (Optum-fallet + NN/g "Killing Off the Global
Navigation" + Baymard):
- Växeln måste vara **persistent på varje sida** — tappar man kontexten mitt i
  resan är det ett dokumenterat misslyckande (Optum: "audience context does not
  persist").
- **Aktivt läge måste vara uppenbart** (segmented control: tydligt valt till-
  stånd, korta etiketter, konsekvent namngivning på alla nivåer).
- Växeln ska speglas i mobil (utility-rad/meny-top), aldrig bara desktop.
- Privatsidor och B2B-sidor ser ofta lika ut → visuellt läges-tecken krävs
  (AK1A har det redan: papper vs marin vägg).

### 1.3 Cookies-baserad lägesflagga — eller ren länk-separation?

| Aspekt | Cookie-läge (menyn byts på plats) | Ren länk-separation (URL = läget) |
|--------|-----------------------------------|-----------------------------------|
| SSG (`force-static` på /pro) | Kräver klienthydration före rätt meny → **blixt av fel meny** | Fungerar ur lådan — rätt skal renderas av rutten |
| Delbarhet/bokmärke | Läge följer inte URL:n | `/pro` är per definition delbart |
| Sökdelning, interna länkar | Ambiguitet: samma URL, två världar | Entydig URL per värld |
| GDPR | UI-tillståndscookies är undantagna från samtycke, men ändå en param att förvalta | Noll ny cookie-komplexitet |
| Krypning | Googlebot ser alltid default (privat) — risk för att B2B-innehåll upplevs som cookie-gömt | Allt crawlbart som statisk HTML |
| Kod | Kräver kontext i `MenyKontext` + hydrering i 5 ytor | Ingen ny mekanism alls |

**Slutsats: ren länk-separation.** Den är enklare, SSG-säker och mer SEO-vänlig.
En session-remember ("kom ihåg att jag är företagare") kan läggas till senare
som förbättring (localStorage → förslags-visning av PRO i palette), men ska
ALDRIG styra vilket skal som renderas.

---

## 2. AK1A:s nuläge — var världarna läcker in i varandra

### 2.1 B2B läcker in i privatnavigationen (5 ytor)
`meny-register.ts` rad ~394–403: punkten **"AK1A PRO"** (`lank: "/pro"`) ligger i
sektionen **OM AK1A** — bekräftat: samma nav-träd som Manifestet/Bloggen, med
`publik: "gast"` och **ingen `yttor`-begränsning** ⇒ den syns överallt:

1. **Huvudmeny (desktop megamenu)** — alla SEO-sidor via `seo-page-shell.tsx` → `Huvudmeny`.
2. **SPA-header (`header.tsx`)** — startsidans megamenu OCH fullmeny-drawern.
3. **Mobilmeny (`mobilmeny.tsx`)** — OM AK1A-accordion i varje mobilvy.
4. **Sidfooter** — `sidfooter.tsx` kör `registerFor(GAST_KONTEXT, "footer")`;
   AK1A PRO saknar `yttor` ⇒ B2B-länk i footern på VARE privat sida.
5. **Kommandopaletten (⌘K)** — `sokindex.ts` `STATISKA` plattar ut hela
   registret utan yta-filter ⇒ "AK1A PRO" är sökbar i den privata paletten.

Även: `chat-widget.tsx` känner igen `/pro` som sidtyp (ok — kontext, inte länk);
`/fas3/page.tsx` rad ~521 nämner "/pro-plattformen" i text (avsett CTA-spår).

### 2.2 Privat läcker in i B2B-skalet (3 ytor)
`pro/layout.tsx` är ett eget skal (gott: ingen megameny, ingen drawer, marin
vägg, dolda AI-Mentor/Short-Seller via style-tagg). Men:

1. **Dödlänk**: footern länkar `href="/terms"` — rutten finns inte (endast
   `/villkor` och `/privacy-policy` existerar i `src/app`). B2B-besökare → 404.
2. **Världshopp via juridik**: "Integritetspolicy" → `/privacy-policy` som
   renderas med `SeoPageShell` = full privat megameny + Sidfooter (hela privata
   sitemapen) + NastaSteg-tracking. Ett klick från B2B-rapportvy till folkhavet.
3. **Footer-rot**: "← Till den publika plattformen" → `/` (avsedd och bra —
   B2B-kunden ska inte känna sig instängd; ~1 klick tillbaka är rätt dos).

### 2.3 Saknad B2B-navigation
PRO-naven är 3 ankare på landningssidan (`#plattformen/#kom-igang/#priser`) +
"Boka demo". Önskade B2B-destinationerna Klienter/Rapporter finns som
koncept/endpoint (`/api/pro/analys`) men inte som rutter. Notera också krocken:
privata `/rapporter` ("Dina rapporter", fas2-verktyg i registret) heter samma
sak som PRO:s framtida Rapporter — namnkonflikt att hantera i B2B-naven
(förslag: PRO-sidorna namnges "Rapportverkstan").

---

## 3. Designförslag (byggfärdigt)

### 3a. Toppväxel "Privatperson | Företag"
- **Placering privatsidor**: `seo-page-shell.tsx` + `header.tsx` — utility-raden
  (brevid InloggadKnapp), segmented control: `[Privatperson | Företag]`.
  - Privatperson = icke-länk med `aria-current="true"` (man är redan där);
    Företag = `<Link href="/pro">`. På /pro: spegelvänt ("Privatperson" → `/`).
  - Etiketter via ordlistan (`nav.privatperson`, `nav.foretag`) — våg 51-mönstret.
- **Mobil**: överst i `mobilmeny.tsx`-drawern (egen rad under logotypen) +
  i PRO-skalets mobil-header.
- **Registerändring** (bevarar R4 "exakt en destination per vy"): AK1A PRO-raden
  får `yttor: ["footer", "sok"]` — kvar i sidfotens sitemap (SEO-internlänk) och
  sökbar i ⌘K, men **ur menypanelerna** där växeln äger B2B-ingången.
- **Ingen cookie** (§1.3): URL:n är läget. Växeln är persistent per definition —
  den finns i båda skalens header på varje sida.

### 3b. PRO-skalets egen B2B-nav (utbyggnad av `pro/layout.tsx`)
```
AK1A [PRO]   Översikt · Klienter · Analys · Rapportverkst. · Priser   [Boka demo]
```
- Rutter: `/pro` (Översikt, befintlig landing), `/pro/klienter` (CSV+portföljer),
  `/pro/analys` (kör mot `/api/pro/analys`), `/pro/rapporter` (mallar/export),
  `/pro/priser` (lyft ur `#priser`-ankaret — indexbar långsida).
- Skalet behåller: marin vägg, guldbadge, INGA privata menyer, style-taggen som
  döljer AI-Mentor/Short-Seller. `force-static` på alla publika PRO-sidor.
- Footerfix: `/terms` → `/villkor`; juridiksidor förblir delade (se 3c).

### 3c. Avgränsning — vilka sidor förblir delade?
| Sida | Delad? | Motiv |
|------|--------|-------|
| /blogg | **JA** | Tankeledarskap når båda; auktoritet samlas på en domän. CTA-block väljs efter postens publik ("Är du rådgivare? → /pro"). |
| /villkor, /privacy-policy, /transparens | **JA** | En juridisk sanningskälla; B2B-villkor läggs som PRO-sektion på sidan, inte som kopia. Acceptera skalbytes-gränsen. |
| /om-oss, /manifest | **JA** | Samma labb, samma berättelse; dubbel CTA i botten. |
| /kurser, /laroplan, ALLA LÄRA/PRAKTIK | **NEJ** | Elevens värld — B2B-naven länkar aldrig hit (idag gör den inte det heller). |
| /kalkylator … /profil (ANALYSERA) | **NEJ** | Pedagogiska verktyg; PRO har motsvarande ingång via metodbeskrivning, inte direktlänk. |
| /fas3 | Gräns-sida | Privat ägo, men med explicit PRO-CTA (se 3d). |

### 3d. CTA-flöde privat→B2B ("Är du rådgivare?")
Tre placeringar (diskreta, guldknapps-logik — aldrig blinkande banner):
1. **/fas3** (avslutningen): "Certifierad analytiker? Din nästa verkstad är
   PRO — rabatten (299 kr) väntar." → `/pro` (ersätter dagens-text Omnämnande).
2. **Superanalysen + Dina rapporter** (verktygs-utgång): "Bygger du rapporter
   för klienter? Se PRO-varianten." → `/pro/rapporter`.
3. **Sidfotens OM-kolumn** behåller AK1A PRO-länken (sitemap + SEO).
Alla CTA:s copy genom `kontrolleraText` (varumärke-våg 3).

---

## 4. SEO-konsekvenser per alternativ

### 4.1 Alternativ A — toppväxel + path-separation på samma domän (REK)
- All länkekvitet samlas på rotdomänen; `/pro/*` ärver auktoritet från privata
  sidors trafik (Semrush/Ahrefs/Windmill-konsensus: subfolders rankar snabbare,
  ärv(er) auktoritet). Interna länkar: växeln på varje sida + footer ⇒ stark
  internal linking till /pro utan footer-spam.
- `force-static` + `robots: index:true` (redan satt) ⇒ ren crawlbar B2B-yta.
- Risk: keywords kan kanibalisera ("portföljrapport") — motverkas av distinkta
  B2B-intent-ord (white-label, metodik-licens, seat) som redan finns i metan.

### 4.2 Alternativ B — cookie-styrd växel (inte rek)
Googlebot ser alltid default-vyn; cookie-gömt B2B-innehåll crawlas aldrig som
renderat ⇒ B2B-intents förlorar rankingspotential. Ingen delbar URL, ingen
cache-ren SSG. Enda vinsten ("kommer ihåg mig") kan senareeras via localStorage
utan att påverka crawlning.

### 4.3 Alternativ C — separat domän/subdomän
Google (Mueller): subdomän bara när den erbjuder "något annat"; tekniskt kan de
ranka lika, men praktiskt startar auktoriteten från noll och delar varumärkes-
signalerna (Benson SEO, Pace, Cloudflare). För ett ungt varumärke som AK1A:
direkt förlust av den privata sajtens tjusande länkar. Endast aktuellt om PRO
senare blir egen juridisk enhet med eget säljteam.

---

## 5. Källor
- NN/g — Audience-Based Navigation: 5 Reasons to Avoid It: https://www.nngroup.com/articles/audience-based-navigation/
- NN/g — Killing Off the Global Navigation: https://www.nngroup.com/articles/killing-global-navigation-one-trend-avoid/
- NN/g — IA Study Guide (topic/task/audience): https://www.nngroup.com/articles/ia-study-guide/
- Optum global navigation-fallstudie (persistent context): tmelo.com/work/optum-navigation
- Corporate Insight — Mobile Navigation for Financial Services: corporateinsight.com/mobile-navigation-report-ux-best-practices-for-financial-services-firms/
- Nordea toppväxel "Privat · Företag · Private Banking": nordea.se
- Swish "Privat / Företag": swish.nu
- Slack prissidor (self-serve vs Enterprise "Contact sales"): slack.com/pricing
- Notion bottom-up-tillväxt: howtheygrow.co/p/how-notion-grows
- Ahrefs subdomain vs subfolder: ahrefs.com/blog/subdomain-vs-subfolder/
- SEJ — Mueller om subdomäner: searchenginejournal.com/google-treats-subdomains-subdirectories-john-mueller-says/254687/
- Windmill Strategy — industrial B2B subdirs: windmillstrategy.com/subdomains-vs-subdirectories-for-industrial-b2b-seo/
- Semrush: semrush.com/blog/subdomain-vs-subdirectory/
- Baymard — context-signaling: baymard.com (OneDrive Personal/Business-fallet)
