# MARKNADS-BESLUT — syntes av M6–M8 (normativt för byggagenter)
Skrivet av AI-styrelsens ordförande 2026-09-04 efter M6 (varumärke), M7
(konvertering), M8 (social distribution) + kodgranskning. DETTA dokument är
vad byggagenterna följer. Full evidens i respektive rapport. Inget committat.

## 0. Oföränderliga principer (värderingar — gäller varje våg nedan)
P1 "Håll know-how, redovisa generöst": öppen delning vinner. ALDRIG share-walls,
aldrig mejl-väggar på blogg/analyser, aldrig "betala med en delning".
P2 2007:528-gränsen: marknad får ALDRIG bli rådgivning. Marknadsytor marknadar
metodik och pedagogisk analys — aldrig handelsuppmaning i specifik aktie.
P3 Gratis Fas 1 är heligt: "kostnadsfritt, för alltid. Ingen kortuppgift."
Ingen eskalerande CTA får degradera gratis-upplevelsen.
P4 Äkthet: varumärket = institutionell metodik BYGGD FÖR PRIVATPERSONER.
Inga påhittade citat, inga skattningar presenterade som sanning, mätfel skrivs ut.
P5 "Tipsa, tvinga aldrig": delning och prenumeration är erbjudanden, aldrig krav.
P6 GDPR-by-design: INGA nya spår, pixels eller retargeting. Konverteringsvyn
bygger ENBART på befintliga datapunkter (m7 §3a).
P7 Tal ur SIFFROR (siffror.ts), copy-variabler ur VARUMARKE (våg 2 nedan) —
aldrig hårdkodade tal i nya marknadsytor.

## 1. Avslag (rond 1 — föreslaget och avsagt)
| # | Förslag (källa) | Dom | Skäl |
|---|---|---|---|
| A1 | Share-to-unlock/gating av innehåll (m8 §2.2 redan avvisat; Passionfruits +40 % leads) | AVSLAG permanent | Bryter P1: dödar reach, förtroende, SEO, AI-synlighet. Siffran får aldrig åberopas som skäl i detta repo |
| A2 | Knapphets-/FOMO-mekanik i kampanjkalender ("ansökan stänger…", countdown, platser kvar) | AVSLAG | P4/P5. Äkta selectivitet ("vi kan avböja") är tillåten — den är sann; påhittad knapphet är lögn |
| A3 | "Veckans research-bolag" som riktad aktie-kampanj | AVSLAG i den formen; VILLKORAD variant se våg 4 | P2: kampanjcopy får lyfta metodiken + länka den pedagogiska analysen med disclaimer-token; ALDRIG "köpvärt nu"-ramning |
| A4 | m7 rek 2: posta intentionen ALLTID till email-kön | KORRIGERAD | Kön (system_events type=email_kö) är för mejl — kräver mottagare. Utan e-post skrivs i stället ett ANONYMISERAT system_event (type=prenumerationsintention, details = nivaId/period/prisband, INGEN persondata) för aggregerad räkning. Ingen ny personuppgift lagras |
| A5 | Open-rate som KPI/optimeringsmål (m7 §2, 35 % öppna) | AVSLAG som mål | Apple MPP blåser upp öppningar; KPI = klick och konvertering |
| A6 | CTA-klickmätning (m7 lucka 4) | AVSLAG — luckan förblir stängd | P6: ingen ny spårning; tratten mäts aggregerat per steg |
| A7 | fas2nudge-mejl på proxy-XP-tröskel | AVSLAG tills vidare | P4: proxy-XP är skattning; mejl till fel person = oäkthet. Kräver server-sannings-XP eller elevens explicita opt-in |
| A8 | "kunder"/"användare" i elevytor och marknadsytor | AVSLAG | Lexikon: "elev". (Internt admin/verktyg = teknisk yta, utanför lexikonet) |
| A9 | Prenumerations-CTA i forskningsbiblioteket som låsteaser ("uppgradera för att se") | AVSLAG | P1+P3. Tillåten form: textlänk-nivå (CTA_HIERARKI nivå 4) "Djupare forskning finns i prenumerationen →" |
| A10 | m6 tonvakt utan citerings-undantag | KORRIGERAD | finansiell-policy citerar själv förbjudna fraser i sitt löfte; ordlista/kurser lär ut kritiken. Vakten kräver citerings-undantag (se våg 2 AC4) annars RÖD dag ett |

## 2. Byggordning (rond 2 — omedelbar kundnytta × liten risk)

### VÅG 1a — OG-bilder + openGraph.url-buggen (m8 §1.1, §3a) — HÖGST PRIORITET
Varje delning är idag naken textlänk; sajten deklarerar `summary_large_image`
utan att leverera bild. Bugg verifierad: layout.tsx `url: "https://ak1nvestor.com"`
avviker från SITE_URL (`lab.ak1nvestor.com`, seo.tsx rad 12).
- `bun add satori` (sharp ^0.34.3 finns redan)
- `scripts/og-generate.mjs` i seo-generate-mönstret: mallar start/kurs/blogg/
  analys (marin #0E1B2E, guld #E8C766, crème #EDE6D6, serif; titel-clamp ~70
  tecken, 2-raders brytning) → `public/og/` 1200×630 PNG: start.png,
  default.png + en per bloggpost (40), analys (11), kurs
- `src/lib/seo.tsx`: pageMetadata() + openGraph.images + twitter.images med
  alt per sidtyp; articleJsonLd/analysisJsonLd + image-fält
- `src/app/layout.tsx`: openGraph.url → SITE_URL, images → /og/start.png
- `src/lib/qr.ts`: extrahera DelaKort-QR-kodern (ren TS) — analys-OG får QR
  till analys-URL
- `package.json`: "og": "node scripts/og-generate.mjs" i befintlig build-kedja

**Acceptanskriterier VÅG 1a:**
1. AC1: Varje sida med pageMetadata() returnerar openGraph.images med
   url/width:1200/height:630/alt; twitter.images detsamma.
2. AC2: layout.tsx innehåller INGEN hårdkodad "https://ak1nvestor.com"-URL
   (SITE_URL importeras); root-OG pekar på /og/start.png.
3. AC3: og-generate är deterministisk (två körningar = bitidentiska PNG:er)
   och validerar att ingen genererad bild saknas för existerande slugs
   (utskrift av antal + diff vid 0).
4. AC4: inga runtime-endpoints (/api/og tillåts ej — force-static-DNA).
5. AC5: `npx tsc --noEmit` = 0 nya fel; OG-malltext följer lexikon (våg 2:s
   data konsumeras när den finns; tills dess DelaKort-DNA).

### VÅG 1b — Konverteringsvyn (m7 §3a) — parallell med 1a (olika filer)
- `src/app/api/admin/konvertering/route.ts`: x-admin-password, modulmemo
  5 min, force-dynamic; sex steg ur BEFINTLIGA data: trafik-sessioner 30 d,
  members (totalt + 30 d), aktiva (user_activities, action ≠ page_view,
  unika session_id 30 d), fas2_ansokan (totalt + 30 d),
  prenumerationsintentioner, betalande (member_type ∉ free, märks "manuell").
- `src/components/ak1a/admin/konverterings-panel.tsx` + admin-tab "Konvertering"
  i src/app/admin/page.tsx: tratt-staplar (StatTabell-mönstret), %-grad mellan
  steg, notering per steg om mätfel (MÄTT/SKATTAD/MANUELL — P4).
- Patch `src/components/ak1a/prenumeration/aktivera-panel.tsx`: när nyhetsbrev
  EJ är ikryssat postas anonymiserat system_event (se A4) — aldrig email_kö
  utan e-post.

**Acceptanskriterier VÅG 1b:**
1. AC1: Vyn gör NOLL skrivningar förutom A4-eventet; inga nya tabeller,
   inga nya spår, inga nya fält i befintliga POSTer.
2. AC2: A4-eventet innehåller INGEN personuppgift (test: fältlistan
   = [nivaId, period, prisBand, skapad]).
3. AC3: Varje steg visar sin mätkvalitet ärligt ("aktiva = skattning ur
   aktivitetsspåret"; "betalande = manuellt underhållen").
4. AC4: Respekt mot GDPR-kopplingsregeln: ingen vy försöker koppla hashad
   session till member-id (aggregat per period, aldrig per individ).
5. AC5: Admin-lås: routen svarar 401 utan x-admin-password (mönster
   /api/trafik admin).

### VÅG 2 — varumarke.ts + tonvakt sektion 2b (m6 §E–F)
- `data/varumarke.json` (single source) + `src/lib/varumarke.ts`: VARUMARKE_
  VERSION, TON_REGLER (10), LEXIKON, FORBJUDNA_FRASER (FEL = juridiska:
  "garanterad avkastning", "riskfritt/riskfri", "slå index varje år",
  "säker vinst", "aktietips", "köp/sälj"-rekommendation, "investeringsråd"
  om eget innehåll; VARNING = tonala: FOMO-fraser, "enkelt!", "proffstips",
  "revolutionerande", "kunder", "hemliga strategier"), HUVUDBUDSKAP per
  persona, CTA_HIERARKI, SIGNATIR (disclaimer + slogan 3-led),
  kontrolleraText(text) → Traff[].
- `verktyg/kvalitetsvakt.mjs`: sektion 2b — FEL-nivå räknas i fel (RÖD/GUL),
  VARNING i manuella; filunderlag utökas med src/lib/email-mallar.ts,
  nyhets-motor.ts, seo.tsx.
- BRAND.md härleds/regenereras (fixar drift: guld #a8862a → #785c13/#E8C766,
  slogan 2-led → 3-led).

**Acceptanskriterier VÅG 2:**
1. AC1: finansiell-policy och ordlista (som citerar förbjudna frasar i
   pedagogiskt syfte) ger 0 FEL — citerings-undantag via filallowlist
   ELLER sidmarkerare; undantagen dokumenteras i vaktrapporten.
2. AC2: kontrolleraText("SISTA CHANSEN att gå med gratis!") ger minst en
   VARNING; kontrolleraText("garanterad avkastning") ger FEL.
3. AC3: Inga FEL-träffar i befintlig src/ vid införandet (åtgärda träffar
   eller klassa om — vakten sänker ALDRIG nivå för att bli grön).
4. AC4: data/varumarke.json saknar åäö i JSON-nycklar (repo-regeln).
5. AC5: kontrolleraText är ren, beroendefri funktion (användbar som sista
   grind i AI-publiceringspipelines senare — våg 4).

### VÅG 3 — Del-raden + analyskort + CTA-luckor (m8 §3b, m7 §3c)
- `src/components/ak1a/del-rad.tsx` ("use client"): EN Dela-knapp (Web Share
  API) + Kopiera länk (clipboard + toast) + subtil "Hittade du detta
  värdfullt? Dela gärna." — ingen belöning, inget lås, inga tredjepartsskript.
  Monteras på blogg/[slug] och analyser/[ticker] före nästa-steg-blocket.
- `dela-kort.tsx`: byggKortSvg generaliseras (typ "elev"|"analys") — analyskort
  visar bolag/ticker/rekommendation/AKM1-poäng + QR till analys-URL.
- CTA-patcher: kurs-steg.tsx fas2Porten-text → länk /fas2-ansok;
  forskningsbiblioteket → textlänk-nivå till /prenumeration (A9:s form).

**Acceptanskriterier VÅG 3:**
1. AC1: Del-raden fungerar utan inloggning, utan dialog-tvång och med
   clipboard-fallback; share-text innehåller disclaimer-token när den
   bär analys-innehåll.
2. AC2: Noll belöning-/låsmekanik i DOM (inget "delas för att låsa upp").
3. AC3: Analyskortets QR avkodas till analys-URL (inte startsidan).
4. AC4: Ny copy passerar kontrolleraText utan FEL (våg 2 får vara byggd).
5. AC5: CTA-patcherna bryter ingen befintlig count-/event-logik
   (tsc --noEmit + befintliga verktyg-tester gröna).

### VÅG 4 — Kampanjkalender + mejl + Vbout (KUNDGATED — se §4)
- `data/kampanjer.json` + `src/app/api/kampanjer/route.ts` (m7 §3b: publik
  läsning, ?status=aktiv, memo-cache + max-age=3600, JSON-nycklar utan åäö).
- Kampanjcopy-regel (A3): rubriken marknadar METODIKEN ("Så räknar våra
  analytiker på [bolag] — 20 variabler, öppet redovisade"), länkar analysen,
  bär SIGNATUR.disclaimer, innehåller ALDRIG riktad handelsuppmaning.
  AI-genererade texter MÅSTE passera kontrolleraText + mänskligt godkännande.
- Vbout-utskick (m8 §3c): kräver VBOUT_API_KEY. Interim utan nyckel:
  lead-formatat event kalla="analys-publicerad" på befintlig webhook —
  kundens Vbout-automation triggar utskick kundsida. Byggs FÖRST efter
  kund-OK (se §4 K4).
- Mejl-aktivering: EMAIL_LEVERANTOR + EMAIL_API_KEY (koden färdig i
  email-sandare.ts; kön töms av cron 06:30). Kalenderns mejl-yta + welcome-
  serie aktiveras först då. fas2nudge förblir avslag (A7).

**Acceptanskriterier VÅG 4:**
1. AC1: GET /api/kampanjer svarar utan admin-nyckel, cachar 1 h, filtrerar
   på status; tom kalender = tomt array-svar (inget fel).
2. AC2: Ingen kampanjtext med FEL-träff i kontrolleraText kan publiceras
   (status "aktiv" kräver godkänd copy — validering i samma rout eller i
   publiceringssteget).
3. AC3: VBOUT_API_KEY/EMAIL_API_KEY läses ENDAST server-side; aldrig i kod,
   exempel, loggar eller klient-payloader (samma policy som VBOUT_WEBHOOK_URL).
4. AC4: Vänteläget är ärligt: utan leverantör svarar systemet "köad
   (leverantör saknas)" — inget låtsas-skickande.

## 3. Förbjudna mönster (maskinläsbar tabell — speglas i FORBJUDNA_FRASER)
| Mönster | Exempel | Allvar |
|---|---|---|
| FOMO/knapphet | "SISTA CHANSEN", countdown, "platser kvar", "bli inte lämnad bakom" | VARNING (i CTA:er mot elev = FEL enligt praxis) |
| Share-walls | "Dela för att låsa upp", "betala med en tweet", mejl-vägg på öppna ytor | FEL (P1-brott) |
| Rådgivarformuleringar | "köp/sälj [aktie]", "aktietips", "guaranterad avkastning", "riskfritt", "slå index varje år", "investeringsråd" om eget innehåll | FEL (P2/lag) |
| "kunder" i elev/marknadsytor | "våra kunder älskar…" | VARNING — säg "elever" |
| Gratis-asterisk | "gratis*" + småstil | FEL (P3-brott) |
| Låsteaser | "uppgradera för att se resten" | VARNING→FEL om den döljer Fas 1-innehåll |
| Öppningsgrad-optimering | KPI "öppningsfrekvens" i paneler/rapporter | VARNING — KPI = klick/konvertering |
| Ny spårning | Meta-pixel, CTA-klick-event, retargeting-skript i marknadsvågor | FEL (P6-brott) |

## 4. Krav på KUNDEN (blockerande input — ärligt markerade)
| ID | Krav | Leverans | Låser upp |
|---|---|---|---|
| K1 | Sociala profil-URL:er (LinkedIn, YouTube, X, Instagram) | URL-lista; tom/inte levererad = renderas ej (aldrig döda länkar) | sameAs i organizationJsonLd + footer-ikonrad (våg 1a kan delvis vänta: sociala.ts med null-värden byggs utan krav) |
| K2 | Mejl-leverantör för utskick: Resend ELLER SendGrid-konto + verifierad avsändardomän (ak1nvestor.com) + EMAIL_LEVERANTOR + EMAIL_API_KEY i Vercel/.env.local | Miljövariabler | Kön-tömning, welcome-serie, kalenderns mejl-yta (våg 4) |
| K3 | VBOUT_API_KEY (Vbout → Settings → API) om utskick ska ske via Vbout | Nyckel via hemlighetshantering (som VBOUT_WEBHOOK_URL) | Vbout-utskick vid publicerad analys (våg 4) |
| K4 | Skriftligt OK: "veckans research-bolag" får användas i marknadskampanj med metodik-ramning (A3) | Bekräftelse | Kalenderns återkommande veckokampanj |
| K5 | Trådglasskulptur-logo i hög upplösning (valfritt) om den ska in i OG-mallarna | Bildfil | Finare OG-start-mall (utan den: typografisk mall) |

## 5. Byggregler (fil-domäner — INGEN agent rör en annans filer)
- OG: scripts/og-generate.mjs + public/og/ + src/lib/qr.ts
- SEO-kärna: src/lib/seo.tsx + src/app/layout.tsx
- Konvertering: src/app/api/admin/konvertering/ + src/components/ak1a/admin/
  konverterings-panel.tsx + admin-tabben i src/app/admin/page.tsx
- Intention-patch: src/components/ak1a/prenumeration/aktivera-panel.tsx
- Varumärke: data/varumarke.json + src/lib/varumarke.ts
- Tonvakt: verktyg/kvalitetsvakt.mjs (ENDAST ny sektion 2b + filunderlagslista)
- Delning: src/components/ak1a/del-rad.tsx + dela-kort.tsx + qr-importer
- Kalender: data/kampanjer.json + src/app/api/kampanjer/route.ts
- Sociala: src/lib/sociala.ts + footer.tsx-ikonrad
- Importera endast via befintliga moduler (siffror.ts, seo.tsx);
  `npx tsc --noEmit` = 0 nya fel per våg. ALLT på svenska med korrekta åäö
  (JSON-nycklar utantill). ALDRIG investeringsråd-formuleringar. Committa
  inget utan moderagentens godkännande.
