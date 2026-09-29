# SÄLJKARTA 2026-09-29 — komplett route-audit × tre språk med gap-matris

**Uppdrag**: Plattformens ALLA ytor före försäljning — kartläggas, mätas
mot prod, granskas mot juridik (2007:528, GDPR art 13) och säljberedskap.
**Roll**: GRANSKARE (fabriksagent) — detta dokument är kartan + diff-förslagen;
inga andras filer har rörts.
**Mätobjekt**: https://lab.ak1nvestor.com (prod, Contabo). Mätning 2026-09-29.
**Priser = R2**: kartlagt endast att ytorna lever; siffror orörs.

---

## 1. Ruttinventering ur src/app (sanning ur kodbasen)

| Grupp | Antal | Notering |
|---|---|---|
| Svenska sidor `(huvud)`+`(vaxthus)` | 69 | varav 5 växthus (`/bygg`-flödet) |
| EN-speglar `(en)` | 18 | 15 statiska + `/en/blogg/[slug]` + `/en/dataset/[bransch]` + `/en/kurser/[slug]` |
| AR-speglar `(ar)` | 18 | samma uppsättning som EN |
| **Sidrutter totalt** | **105** | `page.tsx`-filer |
| API-rutter | 162 | `route.ts`-filer (admin/studio/cron/medlem/pro/publika) |
| Redirects (next.config.ts) | 5 | `/mina-analyser`→`/min-sida`, `/diagnos`→`/profil`, `/terms`→`/villkor`, `/pris`→`/medlemskap`, `/kontakt`→`/om-oss#kontakt` |

**Kategorisering (svenska ytor, 69):**
- **Produkt – utbildning (28)**: `/`, `/kurser`(+slug), `/laroplan`, `/fas2`,
  `/fas3`, `/fas2-ansok`, `/certifikat`, `/rapportakademin`, `/dagens-pass`,
  `/manifest`, `/bibliotek`, `/dataset`(+bransch+aspekt), `/data/nyckeltalsguide`,
  `/analyser`(+ticker+variabel), `/bolag`(+slug), `/forskningsbiblioteket`(+ticker),
  `/topplista`, `/netnet`, `/konfluens`, `/vagfundament`, `/kalkylator`,
  `/superanalys`, `/portfoljbyggare`, `/portfolj-grund/-hyra/-plus/-forskning`,
  `/min-portfolj`, `/rapporter`, `/nyheter`, `/blogg`(+slug)
- **Medlem/verktyg (9)**: `/logga-in`, `/min-sida`, `/profil`, `/badges`,
  `/studio`, `/labb`(+id), `/bygg`-flödet (5 rutter i växthus)
- **Förtroende/stöd (6)**: `/om-oss` (med `#kontakt`-sektion:
  info@ak1nvestor.com), `/kallor`, `/transparens`, `/ansvar`, `/prenumeration`,
  `/medlemskap`
- **Juridik (5)**: `/villkor`, `/privacy-policy`, `/cookiepolicy`,
  `/finansiell-policy`, `/upphovsratt`
- **B2B /pro (6)**: `/pro`, `/pro/analys`, `/pro/klienter`, `/pro/priser`,
  `/pro/rapporter`, `/pro/admin`

**Speglingsläge EN/AR**: 15 av 69 svenska ytorna speglas (product core:
kurser, läroplan, fas2-ansök, fas3, dataset, blogg, certifikat, medlemskap,
om-oss, transparens, prenumeration, manifest, dagens-pass, logga-in).
Kursspeglar serveras via `/api/kurs-spegel/[lang]/[slug]` — deep-courses.json
bär inga språkprefix i slug (ren sv-bas).

---

## 2. Prod-hälsosvep (95 mätta rutter, 2026-09-29)

Metod: node-fetch, redirect=manual (308 = redirect visas explicit), 20 s
timeout. **Tio rutter mitt i svepet svarade 429 (hastighetsgräns från svepets
egna tempo) — samtliga om-mätta 200 med 1,5 s mellanrum → transienta, EJ gap.**

| # | Grupp | Rutt | Kod |
|---|---|---|---|
| 1 | SV | / | 200 |
| 2 | SV | /analyser | 200 |
| 3 | SV | /ansvar | 200 |
| 4 | SV | /badges | 200 |
| 5 | SV | /bibliotek | 200 |
| 6 | SV | /blogg | 200 |
| 7 | SV | /bolag | 200 |
| 8 | SV | /certifikat | 200 |
| 9 | SV | /cookiepolicy | 200 |
| 10 | SV | /dagens-pass | 200 |
| 11 | SV | /data/nyckeltalsguide | 200 |
| 12 | SV | /dataset | 200 |
| 13 | SV | /fas2 | 200 |
| 14 | SV | /fas2-ansok | 200 |
| 15 | SV | /fas3 | 200 |
| 16 | SV | /finansiell-policy | 200 |
| 17 | SV | /forskningsbiblioteket | 200 |
| 18 | SV | /kalkylator | 200 |
| 19 | SV | /kallor | 200 |
| 20 | SV | /konfluens | 200 |
| 21 | SV | /kurser | 200 |
| 22 | SV | /labb | 200 |
| 23 | SV | /laroplan | 200 |
| 24 | SV | /logga-in | 200 |
| 25 | SV | /manifest | 200 |
| 26 | SV | /medlemskap | 200 |
| 27 | SV | /min-portfolj | 200 |
| 28 | SV | /min-sida | 200 |
| 29 | SV | /netnet | 200 |
| 30 | SV | /nyheter | 200 |
| 31 | SV | /om-oss | 200 |
| 32 | SV | /portfolj-forskning | 200 |
| 33 | SV | /portfolj-grund | 200 |
| 34 | SV | /portfolj-hyra | 200 |
| 35 | SV | /portfolj-plus | 200 |
| 36 | SV | /portfoljbyggare | 200 |
| 37 | SV | /prenumeration | 200 |
| 38 | SV | /privacy-policy | 200 |
| 39 | SV | /pro | 200 |
| 40 | SV | /pro/analys | 200 |
| 41 | SV | /pro/klienter | 200 |
| 42 | SV | /pro/priser | 200 |
| 43 | SV | /pro/rapporter | 200 |
| 44 | SV | /profil | 200 |
| 45 | SV | /rapportakademin | 200 |
| 46 | SV | /rapporter | 200 |
| 47 | SV | /studio | 200 |
| 48 | SV | /superanalys | 200 |
| 49 | SV | /topplista | 200 |
| 50 | SV | /transparens | 200 |
| 51 | SV | /upphovsratt | 200 |
| 52 | SV | /vagfundament | 200 |
| 53 | SV | /villkor | 200 |
| 54 | SV | /bygg | 200 |
| 55 | EN | /en | 200 |
| 56 | EN | /en/blogg | 200 |
| 57 | EN | /en/certifikat | 200 |
| 58 | EN | /en/dagens-pass | 200 |
| 59 | EN | /en/dataset | 200 |
| 60 | EN | /en/fas2-ansok | 200 |
| 61 | EN | /en/fas3 | 200 |
| 62 | EN | /en/kurser | 200 |
| 63 | EN | /en/laroplan | 429→om 200 |
| 64 | EN | /en/logga-in | 429→om 200 |
| 65 | EN | /en/manifest | 429→om 200 |
| 66 | EN | /en/medlemskap | 429→om 200 |
| 67 | EN | /en/om-oss | 429→om 200 |
| 68 | EN | /en/prenumeration | 429→om 200 |
| 69 | EN | /en/transparens | 429→om 200 |
| 70 | AR | /ar | 429→om 200 |
| 71 | AR | /ar/blogg | 200 |
| 72 | AR | /ar/certifikat | 200 |
| 73 | AR | /ar/dagens-pass | 200 |
| 74 | AR | /ar/dataset | 200 |
| 75 | AR | /ar/fas2-ansok | 200 |
| 76 | AR | /ar/fas3 | 200 |
| 77 | AR | /ar/kurser | 200 |
| 78 | AR | /ar/laroplan | 200 |
| 79 | AR | /ar/logga-in | 200 |
| 80 | AR | /ar/manifest | 200 |
| 81 | AR | /ar/medlemskap | 200 |
| 82 | AR | /ar/om-oss | 200 |
| 83 | AR | /ar/prenumeration | 200 |
| 84 | AR | /ar/transparens | 200 |
| 85 | REDIR | /pris | 308 → /medlemskap |
| 86 | REDIR | /kontakt | 308 → /om-oss#kontakt |
| 87 | REDIR | /terms | 308 → /villkor |
| 88 | REDIR | /mina-analyser | 308 → /min-sida |
| 89 | REDIR | /diagnos | 308 → /profil |
| 90 | GAP | **/integritetspolicy** | **404** |
| 91 | GAP | **/bli-medlem** | **404** |
| 92 | EXEMPEL | /kurser/v01-forsaljningstillvaxt | 200 |
| 93 | EXEMPEL | /blogg/veckans-marknad-2026-w34 | 200 |
| 94 | EXEMPEL | /dataset/teknik | 200 |
| 95 | EXEMPEL | /en/kurser/v01-forsaljningstillvaxt | 200 |

**Extra bevismätning (framtidsläckage, se gap A2)**:
`/blogg/sa-laser-du-holm-q3-2026` → 200, `/blogg/sa-laser-du-ericsson-q3-2026`
→ 200 — båda publikt läsbara 2026-09-21 trots `publishedAt` 2026-10-21/10-13.

---

## 3. Content-läge

### Blogg (`data/blogg/` + prod `/blogg`)
- 94 JSON-filer i live-mappen — men endast **86 är äkta publicerade**
  (`publishedAt` ≤ 2026-09-29). **8 är framtidsdaterade** (2026-10-05 →
  2026-10-21, samtliga Q3-granskningar: Industrivärden, Ericsson, Goldman
  Sachs, Nordea, Sandvik, SKF B, Evolution, Holm) — och prod listar dem
  REDAN (bevis: `/blogg`-HTML innehåller slug + datum 2026-10-21/10-05).
- Senaste ÄKTA publicering: **2026-09-24** (boerspsykologi-fallstugor).
- Granskningskön `data/blogg-utkast/`: **119 filer**, varav ~115
  artikelutkast (resterande är kö-metadata: GRANSKNING-r146-*.json +
  GRANSKNINGSKO-SAMMANSTALLNING.md) → **kö:publicerat ≈ 115:94**.

### Kurser (`public/deep-courses.json` — källan /api/kurs/[slug] läser)
- **495 kursobjekt** (sv-bas; EN/AR via spegel-API). Toppkategorier:
  BOKMASTER 103, SEKTORANALYS 35, AK1TS FÖRDJUPNING 25, BETEENDEFINANS 24,
  PRAKTISKA CASE 23, VÄRDERINGSMETODER 21, BOKFÖRING & ÅRSREDOVISNING 20 …
- NOTERING: AGENTS.md uppger "333 kurser" — källfilen säger 495; talet i
  AGENTS.md behöver förankras (troligen passerat av expand-courses-cron).

### Dataset (`data/portfolj-system/bolagsunivers.json`)
- **316 bolag i 11 branscher**: konsument 42, finans 41, teknik 32, hälsa 32,
  material 32, energi 32, kommunikation 32, industri 30, tillväxt 19,
  fastighet 19, nyttovalt 5. Publika ytor: `/dataset`, `/dataset/[bransch]`
  (aspekt-djup finns i svensk struktur), speglad i EN/AR.

### Fas 2 (`/fas2` — rubriker ur källan)
- H1: "Fas 2 — Fördjupning inom aktieanalys" · "Vad du lär dig" ·
  "De 20 fundamentala indikatorerna" (AKM1 V01–V20, sju kategorier).
- Ansökningsresa: `/fas2-ansok` (200, speglad EN/AR, DPA-mall finns för B2B).

### Fas 3 (`/fas3` — rubriker ur källan)
- H1: "Fas 3 — där fundamentalanalysen börjar röra sig" · "Vad Fas 3 ger
  dig" · "De N kurserna i Fas 3" (tre ekosystem-flaggskepp + 17 kanonverk) ·
  "Under utveckling — och du är med från början" · "Kravmatrisen — sex
  kriterier, betyg A–F" · "Praktikportföljen — tio kompletta analyser" ·
  "Etik-modulen — ärlighet som examinerbar kärna" · "Certifierad = klar
  för /pro-plattformen".

### Förtroende/Juridik (försäljningskritiskt)
- `/om-oss#kontakt` med **info@ak1nvestor.com** (redirect `/kontakt` ✓).
- `/privacy-policy` är SVENSK text ("Integritetspolicy — GDPR", IMY-hänvisning)
  — innehållet finns, bara svenska URL:en saknas (se A1). Footern länkar
  `/privacy-policy` (200) på alla tre språk → inget brutet flöde internt.
- Kakbanner: `cookie-consent.tsx` finns (LEK 2022:482-täckning i koden;
  synlighet okulärbesiktigas i B3).
- Rådgivningsgränsen: utbildningsformuleringar genomgående i fas-sidorna
  ("så fungerar metoden"), finansiell-policy + ansvarssidor lever — inga
  2007:528-brott funna i de granskade ytorna.

---

## 4. GAP-MATRIS före försäljning

Resan för en svensk besökare: (a) förstå erbjudandet → (b) lita på sidan →
(c) prova gratis → (d) bli medlem → (e) köpa.

| ID | Resa | Gap | Allvar | Ägare | Föreslagen våg |
|---|---|---|---|---|---|
| **A1** | (b) lita | **/integritetspolicy = 404.** Svensk URL är det naturliga att skriva för en svensk köpare/granskare (GDPR art 13). Innehållet FINNS på /privacy-policy (svensk text) — saknade är en redirect eller svensk canonical-URL. Kundkrav i vågbokningen. | **A — blockerande för säljstart** | Fabrik (kod: next.config-redirect, ej R2 — ingen pris/juridik-text ändras) | S1: redirect-paket `/integritetspolicy`→`/privacy-policy` (+ `/bli-medlem`, B1, samma commit) — 1 våg, liten |
| **A2** | (b) lita | **Framtidsläckage i bloggen**: 8 Q3-granskningar med `publishedAt` 5–21 okt är publika på prod redan idag (lista + detaljsidor 200, "senaste 2026-10-21" syns). Förlorar trovärdighet (framtidsdatum på sajten) och läcker kommande innehåll före rapportdatum. | **A — ska vara fixat före säljstart** | Fabrik (kod: lista+feed filtrerar `publishedAt <= idag`; post-sidor kan behålla 200 eller nosniff) | S2: datumsfilter i blogg-listning + speglar (EN/AR) + ISR-omrendering — 1 våg |
| B1 | (d) medlem | **/bli-medlem = 404.** Registreringsresan FUNKAR via /logga-in (formulär på sidan + /api/member/register) men den naturliga svenska köpar-URL:en svarar ej. | B | Fabrik (redirect → /logga-in, ingår i S1) | S1 (samma våg som A1) |
| B2 | (a)+(SEO) | **Publiceringspuls**: ~115 färdigranskade utkast i kö vs 94 publicerade; senaste äkta post 2026-09-24. Säljstart med tom bloggpuls = svag första intryck. | B | Fabrik (data: granskningskön är våg 206-u3 FLYTTKLART-paket) | S3: rulla kön (5–10 poster/våg via godkännande-API) |
| B3 | (b) lita | **Kakbanner okulärkontroll** saknas i denna audit (komponent finns i kod; gränssnittsvakten mäter kontrast, ej samtyckeflödet) — verifiera banner på sv/en/ar + avbryt-väg innan säljstart. | B | Fabrik (verifiering; ev. fix) | S4: engångs-kontroll i nästa gränssnittsvaktsrond |
| B4 | (e) köpa | **Köpflödet är ansökningsbaserat** (/fas2-ansok → manuell hantering); ingen självbetjäningsväg. Medvetet väntande kundbeslut (portföljmotorns pris + betalning = R2). Ytorna /medlemskap, /fas2-ansok, /pro/priser lever (200). | B (R2-kant) | **Kund (R2)** — fabrik förbereder inget | Bokas hos kund när säljstart-nivå väljs |
| OBS1 | infra | Rate-limit (429) triggades vid ~1 req/s från en IP under svepet. Okej för människor, men en lanserings-bot-svärm kan få 429 på riktiga besökares vägnar — kalibrera limit_req mot förväntad lanseringstrafik. | Observation | Fabrik/infra | Utreds vid behov (ej blockerande) |

**Frågeställning från vågbokningen, besvarad:**
- "/bli-medlem 404 — registreringsresan går via /logga-in, ok?" → **Ja, OK**
  (formulär + register-API lever); komplettera med redirect (B1/S1) för de
  som skriver /bli-medlem själva.
- "/pris→/medlemskap" → redirect lever (308), /medlemskap lever (200) —
  pris-siffror orörda (R2).

---

## 5. Slutsats

Plattformen är i stort HEL: 95 mätta rutter, 88 st 200 (varav 10 efter
429-om-mätning), 5 redirects korrekta, samtliga tre språk levande, produkt-,
förtroende- och juridik-ytor täckta. Två A-gap står mellan dagens läge och
säljstart: den saknade svenska GDPR-URL:en (A1 — kvick fix) och
framtidsläckaget i bloggen (A2 — trovärdighetsfråga). Båda är fabriks-ytor,
inget kräver kundbeslut utom själva köpflödet (B4, R2).

RESULTAT: 95 rutter (A-gap:2 B-gap:4) — säljklar nej+toppgap=/integritetspolicy-redirect + bloggens framtidsläckage
