# S6 — Index-inventering: indexerbara URL:er idag vs. imorgon (våg 138)

**Uppdrag:** Kartlägga vad som är INDEXERBART idag: sitemap-generering,
URL-mönster, hreflang/canonical, samt strukturella glapp (innehåll i data/
utan indexbar sida). Underlag för våg 138:s sökordsinventering.

**Källor (faktiskt läsda):** `src/app/sitemap.ts`, `src/app/robots.ts`,
`src/lib/seo.tsx`, `src/lib/spegel-metadata.ts`, `src/lib/kurs-speglar.ts`,
`src/lib/blogg-speglar.ts`, `src/lib/sprak.ts`, `src/lib/content.ts`,
`src/lib/dataset-medianer.ts`, `src/lib/b2b-status.ts`, hela ruttträdet
under `src/app/(huvud)`, `src/app/(en)`, `src/app/(ar)` + räkning mot
`public/deep-courses.json`, `data/analyses/`, `data/export/analyses/`,
`data/blogg/`, `data/forskningsbiblioteket/`, `data/export/case-studies.json`,
`data/portfolj-system/bolagsuniversum.json`, `data/bokkanon.json`.
**Datum:** 2026-09-14.

---

## 1. Sitemap-genereringen (src/app/sitemap.ts)

`/sitemap.xml` är `force-dynamic` och bygger ALLT ifrån statiskt innehåll vid
varje anrop. Mönstret "maximal indexering — varje kurs, varje labb-case,
varje bloggpost, varje analys + variabelsida" (kommentar rad 21–24).
`lastModified` för dataset-sidorna ägs av rådatans hämtdatum
(`bolagsunivers.json → hamtat`), övriga av "nu" eller publiceringsdatum.

### 1.1 Räkning — vad sitemap innehåller idag

| URL-typ | Mönster | Antal | Prioritet |
|---|---|---|---|
| Statiska svenska sidor | `/`, `/kurser`, `/laroplan`, … | 40 | 0.3–1.0 |
| Dataset index sv | `/dataset` | 1 | 0.9 |
| Dataset bransch sv | `/dataset/{bransch}` | 10 | 0.8 |
| Dataset index en+ar | `/{en,ar}/dataset` | 2 | 0.7 |
| Dataset bransch en+ar | `/{en,ar}/dataset/{bransch}` | 20 | 0.6 |
| Språkrot | `/en`, `/ar` | 2 | 0.9 |
| Statiska speglar | `/{en,ar}/{9 sidor}` | 18 | 0.7 |
| Blogglist-speglar | `/{en,ar}/blogg` | 2 | 0.7 |
| Kurser sv | `/kurser/{slug}` | 333 | BOKMASTER 0.9, övriga 0.8 |
| Kursspeglar | `/{en,ar}/kurser/{slug}` | 666 | 0.7 |
| Analyser sv | `/analyser/{ticker}` | 11 | 0.8 |
| Variabelsidor | `/analyser/{t}/v{01-20}-…` | 220 (11 × 20) | 0.6 |
| Forskningsbiblioteket | `/forskningsbiblioteket/{ticker}` | 22 | 0.7 |
| Labb-case | `/labb/{id}` | 201 | 0.7 |
| Blogg sv | `/blogg/{slug}` | 55 | 0.8 |
| Bloggspeglar | `/{en,ar}/blogg/{slug}` | 110 | 0.7 |
| **SUMMA** | | **1 712** | |

Villkorade block (avstängda idag, default i `b2b-status.ts`/`tier-status.ts`):
`/pro` + 4 undersidor (5 URL:er, kräver `NEXT_PUBLIC_B2B_AKTIV=1`) och
`/portfolj-grund|plus|hyra` (3 URL:er, kräver `NEXT_PUBLIC_TIER_AKTIV=1`).
Med båda på: **1 720 URL:er**.

Verifierade datamängder: kurser 333 (varav 103 BOKMASTER, 20 variabelkurser
`v01–v20`) i `public/deep-courses.json`; analyser 11 i `data/analyses/`
(plus 2 duplikat i `data/export/analyses/` — dedupe på ticker i
`getAnalyses()`); blogg 55 i `data/blogg/`; forsknings-MD 22 i
`data/forskningsbiblioteket/`; labb 201 i `data/export/case-studies.json`;
10 unika branscher ur 100 bolagsrader i
`data/portfolj-system/bolagsuniversum.json` (via `branschSlugs()`).

### 1.2 Statiska svenska sidor (40) — fullständig lista ur sitemap.ts

Flaggskepp (1.0/0.9): `/`, `/kurser`, `/laroplan`, `/konfluens`,
`/vagfundament`, `/manifest`.
Innehållsnav: `/analyser`, `/forskningsbiblioteket`, `/labb`, `/blogg`,
`/bibliotek`, `/topplista`, `/badges`, `/dagens-pass`.
Verktyg: `/nyheter` (hourly), `/kalkylator`, `/portfoljbyggare`,
`/portfolj-forskning`, `/netnet`, `/superanalys`, `/profil`, `/certifikat`,
`/rapporter`.
Medlem/konvertering: `/medlemskap`, `/prenumeration`, `/fas2-ansok`,
`/fas3`, `/min-sida`, `/min-portfolj`, `/logga-in`.
Om & juridik: `/om-oss`, `/privacy-policy`, `/transparens`, `/villkor`,
`/cookiepolicy`, `/ansvar`, `/upphovsratt`, `/kallor`,
`/finansiell-policy`, `/dataset`.

---

## 2. URL-mönster per innehållsklass (rutter som faktiskt finns)

Dynamiska rutter (route-trädet):

| Rutt | Källa | Not |
|---|---|---|
| `(huvud)/kurser/[slug]` | `public/deep-courses.json` | 333 sidor, courseJsonLd |
| `(en)/en/kurser/[slug]` + `(ar)/ar/kurser/[slug]` | samma + Supabase-översättningslager | 666 speglar (se § 3.2) |
| `(huvud)/blogg/[slug]` | `data/blogg/*.json` | 55 |
| `{en,ar}/blogg/[slug]` | samma + lager | 110 speglar |
| `(huvud)/analyser/[ticker]` | `data/analyses/` + `data/export/analyses/` | 11 |
| `(huvud)/analyser/[ticker]/[variabel]` | v-slugs ur kursfilen | 220 |
| `(huvud)/forskningsbiblioteket/[ticker]` | `lasAnalyser()` (`data/forskningsbiblioteket/`) | 22 |
| `(huvud)/labb/[id]` | `data/export/case-studies.json` | 201 |
| `{huvud,en,ar}/dataset/[bransch]` | `data/portfolj-system/bolagsunivers.json` | 10 × 3 språk |

Stängda ytor (`robots.ts` `STANGDA_YTOR`): `/admin`, `/pro/admin`,
`/studio`, `/api/studio` — korrekt icke-indexbara. `robots.ts` bjuder
explicit in sök- OCH AI-crawlers (GPTBot, ClaudeBot, PerplexityBot,
Google-Extended, Applebot-Extended, meta-externalagent, Amazonbot, CCBot)
plus `/llms.txt` + `/api/llms-txt`.

---

## 3. hreflang- och canonical-status

### 3.1 Svenska original — `pageMetadata()` i `src/lib/seo.tsx`

- Canonical på ALLT (`SITE_URL + path`).
- `harSpeglar: true` ⇒ fullt ömsesidigt kluster: `sv-SE` → egen URL,
  `en` → `/en{path}`, `ar` → `/ar{path}`, `x-default` → originalet.
- Utan speglar (rond H, våg 129): endast `sv-SE` + `x-default`, båda
  självhänvisande — medvetet för att undvika "falsk engelsk version".
- Registret `OVERSATTA_ROUTES` (`src/lib/sprak.ts`) = 12 basvägar
  (`/`, medlemskap, manifest, logga-in, om-oss, kurser, blogg, fas2-ansok,
  fas3, prenumeration, transparens, dataset) + mönster `/kurser/`,
  `/blogg/`, `/dataset/` per detaljslug.

### 3.2 Språkspeglar — `spegelMetadata()` i `src/lib/spegel-metadata.ts`

- Egen canonical (spegelns egen URL — speglarna är fullvärdiga sidor,
  inte dubbletter), hreflang-kluster mot sv-original, `x-default` = sv,
  `index: true`.
- **Tröskelmekanism (viktigt):** kurs- och bloggspeglar är `noindex` +
  canonical mot sv-original tills publicerad andel ≥ **80 %**
  (`INDEX_TRASKEL = 80` i `src/lib/kurs-speglar.ts`; samma i
  `src/lib/blogg-speglar.ts`). Översättningslagret lever i Supabase —
  exakt antal speglar över tröskeln är runtime-data, inte fildata.
- Dataset-speglar och de 12 statiska speglarna har INGEN tröskel — alltid
  indexerbara.

### 3.3robots-tillstånd

`robots.ts`: allow-listan är inte exklusiv (disallow = endast admin/studio),
dvs. alla publika rutter är crawlningsbara; `/pro` + tier-sidor hålls borta
tills flaggorna slås på — samma grind som i sitemap (V86/V99-kommentarerna
i `sitemap.ts` rad 69–95: sitemap får aldrig lista URL:er som är
noindex/404).

---

## 4. STRUKTURELLA GLAPP — innehåll som finns men saknar indexbar sida

### GLAPP 1 (störst): 100 bolag i bolagsuniversumet — 0 bolagssidor

`data/portfolj-system/bolagsunivers.json` har 100 bolagsrader (namn, bransch,
nyckeltal). Idag exponeras datan endast som aggregerat på 10
branschmedian-sidor. Endast 11 bolag har analysida + 22 har
forskningsöversikt. **≈ 70–90 bolag har ingen egen URL alls.**
Potentiell våg: `/bolag/{slug}` (nyckeltal + avvikelse mot branschmedian +
länkar till relaterad kurs/analys) ⇒ **+100 longtail-sidor** på sökningar
som "ABB nyckeltal", "Ericsson ROE", "Volvo Cars skuldsättningsgrad".
Datan är redan leveransklar — ren routt+render-fråga.

### GLAPP 2: Ingen begreppsordlista / nyckeltalslexikon

Termbanken (`termbank-tillagg.json` + översättningsordlistan i
`src/lib/dataset-medianer.ts`) är INTERN (översättningsmotor) — ingen publik
sida. Bloggen täcker en handfull nyckeltalsförfrågningar
(`vad-ar-roe`, `vad-ar-ev-ebitda`, `vad-ar-skuldsattningsgrad`,
`hur-raknar-man-roe` — se `data/seo/blogg/`) men det finns inget systematiskt
`/lexikon` eller `/begrepp/{term}`. De 20 variablerna (v01–v20) har KURSER
(`/kurser/v09-roe-…`) men ingen definitions-yta utan inloggnings-/kurskontext.
Potentiellt: en sida per nyckeltal/begrepp med formel + tolkning + räkneexempel
⇒ **+30–60 sidor** ("vad är PEG", "hur räknar man EV/EBITDA" etc. — klassiskt
utbildnings-longtail, perfekt mot juridikramen "så fungerar metoden").

### GLAPP 3: 6 indexbara speglar saknas i sitemap (gratisvinst)

Rutterna `/{en,ar}/laroplan`, `/{en,ar}/certifikat`, `/{en,ar}/dagens-pass`
FINNS (våg 113-vågor, `spegelMetadata` = indexbara med egen canonical +
hreflang — verifierad i `src/app/(en)/en/laroplan/page.tsx`) men listas
INTE i `sitemap.ts` (endast 9 statiska + blogg-list + dataset har speglar
där). **6 URL:er som redan är byggda men aldrig deklareras.** Fix = 6 rader
i sitemap.

### GLAPP 4: Språkglapp för stora innehållsklasser

100 %-målet gäller bara: kurser, blogg, dataset + 12 statiska sidor. Helt
utan speglar: **analyser (11), variabelsidor (220), forskningsbiblioteket
(22), labb (201), topplista, nyheter, kalkylator, bibliotek, vagfundament,
konfluens** m.fl. Av 1 712 URL:er har ~820 (48 %) speglar; 220 variabelsidor
+ 201 labb-cases + 22 forskningsöversikter = 443 sidor som endast finns på
svenska. (Prioritering mot sökvolym: variabelsidorna är teoretiskt-matematiska
och söks sällan på arabiska — labb-cases är berättelser som BÖR fungera
mångspråkigt.)

### GLAPP 5: Sitemap listar noindex:ade speglar (känd SEO-spänning)

666 kurs- + 110 bloggspeglar listas ALLTID i sitemap, men under 80 %-
tröskeln är de noindex:ade (canonical mot originalet). Det är exakt det
mönster sitemap.ts egen B2B-kommentar (rad 69–72) varnar för: Search Console
kan rapportera "Submitted URL marked 'noindex'". Medvetet val ("upptäcks
tidigare via sitemap", rad 148–150) men bör bevakas i Search Console — om
tröskel-PASSERING sker oftare än crawl blir sitemap-bruset större än
nyttan. Åtgärd om det stör: villkora spegel-posterna mot samma
`indexerbar`-flagga som metadatabyggaren använder.

### GLAPP 6 (mindre): Bokkanon 102 böcker — 1 listsida

`/bibliotek` (källa `data/bokkanon.json`, 102 böcker) är en enda listsida
utan detaljsidor. PARITET: BOKMASTER-kurserna (103) ÄR boksidorna
(`/kurser/the-intelligent-investor` etc.), så böckerna HAR sidor — men de
indexeras som kurser, inte som recensioner. ev. framtida
`/bibliotek/{bok}`-vy med "boken i AKM1:s ljus" är nya vinklar, inte nya
behov. Låg prioritet.

### GLAPP 7 (observation): Nyheter utan artikel-URL:er

`/nyheter` (hourly, prio 0.8) listar nyheter ur Supabase (miljontals rader
i `news_articles`) men det finns ingen `/nyheter/[id]`-rutt — ingen
longtail på nyhetssökningar. Kräver kuratering innan det blir meningsfullt
(färskhet > volym); NOTERAS som framtida alternativ, inte rekommendation.

### Icke-glapp (avskrivna med motivering)

- `data/rapporter/` (38 MD) = interna kvalitets-/QA-rapporter; `/rapporter`
  är medlemmens redovisningsverkstad — korrekt inte innehållsmaterial.
- `data/blogg-utkast/` = opublicerat, korrekt ej indexerat.
- `data/seo/{kurser,analyser,blogg}/` = SEO-metadata (keywords) TILL
  existerande sidor (333 kursfiler + 11 analysfiler + 55 bloggfiler) —
  allt är redan knutet. Bekräftar att metadata-lagret är komplett.
- Kunskapsflödet/spaced repetition (`data/kunskapsflode.json`,
  `data/spaced-repetition.json`) = personliga verktyg, inte landningssidor.
- Quiz finns inuti kurserna — ingen egen sida behövs.

---

## 5. Inventering: idag vs. imorgon

| Klass | Idag | Potentiellt | Delta |
|---|---|---|---|
| Kurser (sv+speglar) | 999 | 999 | 0 (mängden klar; vinsten ligger i att speglar passerar 80 %-tröskeln) |
| Blogg (sv+speglar) | 165 | 165 + tillväxt ~1–2/v | kontinuerlig |
| Analyser + variabelsidor | 231 | 231 (+ nya bolag allteftersom) | organisisk |
| Forskningsbiblioteket | 22 | 22 | 0 |
| Labb-cases | 201 | 201 | 0 |
| Dataset (3 språk) | 33 | 33 | 0 |
| Statiskt (sv) | 40 | 40 (+5 B2B, +3 tier när kunden slår på) | +8 vilkorat |
| Statiskt (speglar) | 22 | 28 | **+6 (glapp 3 — gratis)** |
| **Bolagssidor** | 0 | **100** | **+100 (glapp 1)** |
| **Lexikon/begrepp** | 0 | **30–60** | **+30–60 (glapp 2)** |
| **SUMMA** | **1 712** | **≈ 1 850–1 880 (+8 villkorade)** | **+136–166 realistiskt** |

Prioriterad nästa-steg-lista (ur S6:s perspektiv):
1. Sitemap-fix: lägg in 6 saknade speglar (minuter, noll risk).
2. `/bolag/{slug}` — 100 sidor på befintlig data (störst sökvolym-täckning).
3. Nyckeltalslexikon `/begrepp/{term}` — 30–60 sidor, ren utbildnings-
   longtail, juridiskt rent ("så räknar man", aldrig råd).
4. Bevaka Search Console för noindex-spegel-rapporter (glapp 5).
5. Labb-cases på en/ar (berättelseinnehåll, 201 sidor) — större projekt.

---

*S6, våg 138 — omkörning efter rate-limit. Endast denna fil skriven; src/ orörd.*
