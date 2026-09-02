# BLUE OCEAN ERRC-AUDIT — alla offentliga sidor
**Datum:** 2026-09-02 · **Metod:** länkkarta (alla `href`/`lank` i src/), sitemap.ts, robots.ts, komponentgranskning · **Filter:** Zero to One (10x eller platshållare?) + Hedgehog (pedagogisk finansutbildning × deterministisk motor)

**Rutinventarie:** 35 publika rutter i `src/app/` + 12 SPA-sektioner (`src/components/ak1a/sections/`, 9 829 rader). Sitemap (`src/app/sitemap.ts:11-35`) deklarerar 23 topprutter + 225 kurser + 201 case + blogg.

---

## ELIMINERA (6)

### E1. `/mina-analyser` — föräldralös sida + integritetsläcka
- **Filer:** `src/app/mina-analyser/page.tsx` (35 r) + `src/components/ak1a/my-analyses.tsx` (117 r)
- **Orsak 1 — Noll inkommande länkar:** Linkkartan visar 0 externa referenser i hela src/. Förekommer inte i `huvudmeny.tsx`, `mobilmeny.tsx`, `sidfooter.tsx`, `header.tsx`, `sokindex.ts`, `navigationsminne.ts`, chatboten eller sitemap. Enda träffen är sidans egen `pageMetadata` (page.tsx:10). En sida ingen kan nå = existens utan syfte.
- **Orsak 2 — Autentiseringslös datahämtning:** `my-analyses.tsx:46-53` slår upp medlem via `GET /api/member/register?email=...` och hämtar sedan `GET /api/member/analysis?memberId=...` — `src/app/api/member/analysis/route.ts:7-33` kräver ingen auth, returnerar alla publicerade klientanalyser för godtyckligt memberId. Vem som helst som gissar/känner en e-post kan läsa den medlemmens analys. Obemannad ingång till klientdata.
- **Orsak 3 — Dubblett i koncept:** funktionen ("analyser din analytiker publicerat till dig") lever redan i ClientPortal (`src/components/ak1a/client-portal.tsx:2157`, monterad i SPA-sektion `portal` via `sections/portal-section.tsx`) där hela klientflödet (inlämning → analys → bokning) bor.
- **Varningsrisk:** Kontrollera att `/api/admin/kundbild` och admin-flödet inte länkar sidan (de refererar `/analyser`, inte `/mina-analyser` — verifierat). Ta även ställning till `/api/member/analysis`-endpointen: den bör auth-skyddas eller dö samma dag som sidan.

### E2. `src/shared/**` — hel död parallellstruktur
- **Filer:** hela katalogen (`shared/shell/ui/Header.tsx`, `shared/shell/ui/Overlays.tsx`, `shared/shell/ui/Footer.tsx`, `shared/store/ak1a-store.ts`, `shared/types/index.ts`, `shared/design-system/ui/Primitives.tsx`, `shared/providers/ThemeProvider.tsx`, `shared/ui/*` …)
- **Orsak:** Noll importer av `@/shared` utanför katalogen själv (verifierat med grep). Detta är en övergiven migrationsskugga av skalet — och det är här Share2/ScrollText-resterna lever kvar (`shared/shell/ui/Header.tsx:6,9,169,179`, `shared/shell/ui/Overlays.tsx:21,207`) plus en tredje SectionId-kopia med `"styrelse"` kvar (`shared/store/ak1a-store.ts:6`, `shared/types/index.ts:2`).
- **Varningsrisk:** Ingen — ingen live-kod berör den. Dubbelkolla bara att inget skript/tests refererar `@/shared` (tests/-katalogen bör grep:as före borttag).

### E3. `src/features/**` — UI-kopior av sektioner (stale)
- **Filer:** `features/kurser/ui/KurserSection.tsx` (2 256 r), `features/labb/ui/LabbSection.tsx` (1 735 r), `features/styrelse/ui/StyrelseSection.tsx`, `features/home/ui/HomeSection.tsx`, `features/aktier/ui/AktierSection.tsx`, `features/analyser/ui/AnalyserSection.tsx`, `features/admin/ui/AdminPage.tsx`, `features/legal/ui/*`, `features/mega-tasks/*`, `features/indicators/models/indicator-data.ts` (innehåller egen `LEVELS`-kopia, rad 31)
- **Orsak:** Ingen enda fil importerar `@/features` utanför features/ (verifierat). Kopiorna har redan divergerat: `features/kurser/ui/KurserSection.tsx:545` skriver "AKM1:s **19** variabler" medan canonical `components/ak1a/sections/kurser-section.tsx:546` skriver **20**. Död vikt som aktivt förvirrar.
- **Varningsrisk — UNDANTAG:** `src/features/deep-courses/data/deep-courses.json` är skarpt läst via filsökväg av `src/app/api/cron/expand-courses/route.ts:20` och `src/app/api/system/status/route.ts:68`. Flytta JSON:en (t.ex. till `data/`) och uppdatera de två sökvägarna INNAN katalogen raderas.

### E4. Död admin-gren i SPA-footern
- **Fil:** `src/components/ak1a/footer.tsx:61-68` — grenen `item.section === "admin" as any ? <a href="/admin">` kan aldrig rendera: `FOOTER_NAV` i `src/lib/ak1a/data.ts:19-33` innehåller inget objekt med section "admin". Död kod som dessutom blir en publik /admin-länk dagen någon råkar lägga till den.
- **Varningsrisk:** Ingen. `/admin` i sig är korrekt stängd: ej i sitemap, `robots.ts:11` disallowar, `page.tsx:207-249` lösenordsskyddar mot `/api/admin/auth` (ADMIN_PASSWORD).

### E5. `NAV_SECTIONS`-poster för döda sektioner + deras ikon-/beskrivningskartor
- **Filer:** `src/lib/ak1a/data.ts:4-15` (raderna `fas3`, `styrelse`, `strategi` i NAV_SECTIONS), `src/components/ak1a/header.tsx:56-68` (SEKTIONS_IKONER: `fas3: Bot`, `styrelse: Crown`, `strategi: Compass`), `header.tsx:71-83` (SEKTIONS_BESKRIVNINGAR: "AI-driven analys (Fas 3)", "Styrelsens interna vy", "Strategi (#1 i världen)"), `data.ts:23` (FOOTER_NAV "Strategi (#1 i världen)")
- **Orsak:** `spa-hem.tsx:28-36` renderar inte fas3/styrelse/strategi — men NAV_SECTIONS matar mobil-drawern (`header.tsx:480`) där **fas3 och strategi fortfarande visas för alla besökare** (endast styrelse filtreras bort för icke-admin, `header.tsx:152`). Tryck = tom vy. Internt språk ("#1 i världen") läcks publikt.
- **Varningsrisk:** Tar du bort sektionerna ur NAV_SECTIONS samtidigt som sektionsfilerna (se E6-karta nedan) går det rent; glöm inte `SectionId`-typerna `src/lib/ak1a-store.ts:6` (`"styrelse" | "portal" | "strategi" | "fas3"`).

### E6. Share2/ScrollText/LEVELS i SPA-headern — resterna efter SPA-epoken
- **Filer:** `src/components/ak1a/header.tsx:6,10` (import Share2, ScrollText), `header.tsx:388-396` ("Dela"-knapp → setShareOpen), `header.tsx:398-406` ("Sammanfattning"-knapp → setSummaryOpen), `src/components/ak1a/overlays.tsx:111` (SummaryDrawer), `overlays.tsx:189` (ShareDialog — delar SPA-sektionsläge, men sektionerna håller på att dö), `src/lib/ak1a-store.ts:35-40,93-97` (shareOpen/summaryOpen-state)
- **Orsak:** Delning/sammanfattning av SPA-sektioner förlorar sitt objekt när sektionerna ersätts av riktiga, SEO-indexerbara routes (där delning = ren URL). Samma gäller headerns manuella LEVELS-växlare (`header.tsx:335-351` + `data.ts:35-39`): den krockar med min-sidas XP-baserade nivåsystem (`min-sida.tsx:136` `nivaFranXP`, nivå 1-100) — två konkurrerande nivåsystem är exakt den sorts internt som Blue Ocean reder ut.
- **Varningsrisk:** SummaryDrawer används som "Sammanfattning" av SPA-progress — om SPA behålls interimistiskt, flytta knappen till Mobilmenyn istället för att behålla två ikoner i headern.

---

## MERGE (3)

### M1. `/diagnos` + `/profil` → en profilsida (behåll `/profil`, 301 från `/diagnos`)
- **Filer:** `src/app/diagnos/page.tsx` + `src/components/ak1a/kognitiv-profil.tsx` (226 r) ⊕ `src/app/profil/page.tsx` + `src/components/ak1a/kognitiv-profiler.tsx` (218 r)
- **Orsak:** Samma produkt två gånger: båda är "interaktivt textäventyr, N scenarier, 3 minuter, ingen rätt/fel → personlig profil + rekommenderad startnivå". /diagnos mäter inlärningsstil/drivkraft, /profil mäter riskaptit/bias — för eleven är det ETT test, och nav talar bara om ett: huvudmenyn länkar "AI-Diagnos" (`huvudmeny.tsx:42`), sidfootern dito (`sidfooter.tsx:31`), medan /profil endast nås via sitemap, chat-widget, manifest- och medlemskapssidor. Filnamnen skiljer en bokstav — copy-paste-arv; `kognitiv-profiler.tsx:57` bär fortfarande kopieringsbuggen `titler: "",` före `titel:`.
- **Vart:** En sida med två moduler (inlärningsprofil + riskprofil) → samlad LearnerProfile som sätter nivå och stylar kursflödet. `/diagnos` blir 301 till `/profil` (behåll söktrafik).

### M2. `/portfoljbyggare` + `/min-portfolj` → ett "Portföljlabb" (två lägen)
- **Filer:** `src/app/portfoljbyggare/page.tsx` + `src/components/ak1a/portfoljbyggare.tsx` ⊕ `src/app/min-portfolj/page.tsx` + `src/components/ak1a/portfolio-system.tsx`
- **Orsak:** Överlappande kärna: lägg till bolag → AKM1-poäng per position → vågklass-gissning → risk/koncentration/varningar. Skillnaden är endast läge: hypotetisk övning (localStorage, färdscener) vs verkliga innehav (Supabase, djupanalys). /portfoljbyggare är svagast länkad (3 ref-filer: header, huvudmeny, sokindex — **saknas i sidfootern och sitemap**) medan /min-portfolj är välintegrerad (13 ref-filer). Två halvverktyg slår inte ett helt.
- **Vart:** `/min-portrolj`-URL blir R1: "Övningsläge"/"Mina innehav" i samma komponent; portföljbyggarens visualiseringar (sektorsdonut, färdscener) blir övningslägets kapitel. `/portfoljbyggare` 301:as och plockas in i Analysera-panelen som läge, inte sida.

### M3. SPA-sektioner → befintliga rutter (pågående migrering, fullfölj)
- **Filer:** `src/components/ak1a/sections/kurser-section.tsx` (2 256 r) duplicerar `/kurser`; `labb-section.tsx` (1 735 r) duplicerar `/labb`; `analyser-section.tsx` (993 r) duplicerar `/analyser`; `om-oss-section.tsx` (658 r) duplicerar `/om-oss`; `utbildning-section.tsx` (841 r) duplicerar `/medlemskap`+`/fas2-ansok`
- **Orsak:** Samma innehåll i två skepnader — SPA-versionen (ingen URL, ingen indexering, 6 700+ rader underhåll) och route-versionen (SEO, sitemap, delbar). Varje kvarvarande SPA-sektion är en dubblett som tvingar redan tunn dataredaktion på två ställen.
- **Vart:** `spa-hem.tsx` behåller endast sektioner utan route-motsvarighet tills vidare (`hem`, `portal`); övriga ersätts av `<Link>`-programmatik till rutterna. Kartlagda beroenden att hänga med: `home-section.tsx:59` ("Se hur vi tänker" → `setSection("strategi")` — **redan nu en död knapp**), `admin/page.tsx:679,686,704` (`setSection("styrelse")/("strategi")` — döda knappar), `api/styrelse/*` (9 routes) och `lib/autonom/styrelse.ts` som backend-stöd att avveckla i takt med sektionerna.

---

## BEHÅLL (och varför — kärnan talar)

| Route | Dom | Bevis |
|---|---|---|
| `/kurser` + `/kurser/[slug]` | Kärnan själv | 280 kurser, 29 ref-filer, sitemap-stomme (`sitemap.ts:13,38-45`) |
| `/labb` + `/labb/[id]` | **Används och länkas** — utredningens svar på kandidatfrågan | 201 case i `data/export/case-studies.json` (191 riktiga + 10 illustrativa), statiskt genererade (`labb/[id]/page.tsx:8-10`), i sitemap (`sitemap.ts:68-75`), länkade från huvudmenyn "Labbar" (`huvudmeny.tsx:43`), chatbot, sökindex, `lib/seo.tsx`. Long-tail-SEO + "case → lärdom" är Hedgehog-rakt av. Eliminera = nej. |
| `/dagens-pass` | **Ej merge med /min-sida** —unik ritual, inte en dashboard | Egen deterministisk motor `/api/dagens-pass` (12-tickers rotation, `api/dagens-pass/route.ts:14-30`), quiz+XP+streak, sitemap prio 0.9. /min-sida är lägesbild, /dagens-pass är handling. Kompletterar, överlappar ej. |
| `/min-sida` | Nav för medlem; starkt "ej inloggad"-säljstate (`min-sida.tsx:166-232`) | 7 ref-filer + huvudmeny. Sänk dock sitemap-prioritet 0.8→0.3: det är en personlig localStorage-dashboard, inte dagsfärskt offentligt innehåll. |
| `/superanalys` | Flaggskepp: 24 guidade steg → delbart kort, +100 XP | 9 ref-filer, sitemap prio 0.9 |
| `/kalkylator`, `/vagfundament`, `/netnet` | Tre distinkta verktyg på samma motor: 20 variabler / 20×5 vågmatris / NCAV-screen. Ej övertäckande. | `/netnet` har dessutom unik Graham-nisch och metadata redo för SEO — men **saknas i sitemap.ts** (lägg till). |
| `/analyser`, `/blogg`, `/bibliotek`, `/laroplan`, `/manifest`, `/certifikat`, `/badges`, `/topplista`, `/medlemskap`, `/fas2-ansok`, `/om-oss`, `/logga-in`, `/privacy-policy`, `/terms`, `/finansiell-policy` | Var och en har unikt syfte, inkommande länkar och (utom logga-in) sitemapplats | se länkkartan ovan |
| `/admin` | Behåll som intern sida | Ej i sitemap, `robots.ts:11` disallow, lösenord. Enda resten är E4/E5. |

---

## UPPGRADERA (10x-gapet)

1. **`/labb` 201 → lärande loop:** idag lista + kort + related (`labb/[id]/page.tsx:34-36`). 10x = varje case kopplas till sina avgörande AKM1-variabler (kurser) + "reproducera i Superanalysen"-djuplänk med case-förifylldt bolag. Case-samlingen blir då praktikrum till teorin, inte arkiv.
2. **`/min-sida` + `/dagens-pass` → en rad handling:** VeckoPlan + KurstipsKort + VagkartaKort finns redan på dashboarden — nästa steg är en "dagens rad" som samlar dagens pass, förfallna flashcards och nästa kurs i ETT svep (och ersätter Spread2-andan). Fixa dessutom `min-sida.tsx:64-67`: Verktygskortet "Dagens Pass" länkar till `/kurser` — ska vara `/dagens-pass`.
3. **M1-merget profiltest → motorn som ställer om allt:** testresultatet bör sätta nivån (`LEVELS`) i hela UI:t — idag är headerns nivåväljare manuell (`header.tsx:335-351`) och skiljer sig från XP-nivåerna (`min-sida.tsx:136`). Ett test som styr nivå, kursordning ochverktygstips = personlig pedagogik 10x.
4. **Sitemap-trohet:** `/netnet`, `/portfoljbyggare`, `/diagnos`, `/min-portfolj` saknas i `sitemap.ts` trots full metadata. Antingen in (indexera) eller noindex — status quo är SEO-läckage av egna verktygssidor.

---

## KVARVARANDE REFERENSER — styrelse/strategi/fas3 (karta efter andra agentens städning)

| Referens | Fil:rad | Typ |
|---|---|---|
| NAV_SECTIONS-rader fas3/styrelse/strategi | `src/lib/ak1a/data.ts:10-12` | nav-data |
| FOOTER_NAV "Strategi (#1 i världen)" | `src/lib/ak1a/data.ts:23` | nav-data |
| SectionId-typer | `src/lib/ak1a-store.ts:6`, `src/shared/store/ak1a-store.ts:6`, `src/shared/types/index.ts:2` | typer |
| SEKTIONS_IKONER/BESKRIVNINGAR | `src/components/ak1a/header.tsx:63-65,78-80` | UI-kartor |
| Död knapp "Se hur vi tänker" | `src/components/ak1a/sections/home-section.tsx:56-63` | död knapp |
| Döda admin-knappar | `src/app/admin/page.tsx:679,686,704` | döda knappar |
| Sektionsfiler (orphaner) | `sections/styrelse-section.tsx` (714 r), `sections/strategi-section.tsx` (848 r), `sections/fas3-section.tsx` (522 r) | ej importerade av spa-hem |
| Backend-stöd | `src/app/api/styrelse/*` (9 routes), `src/features/styrelse/api/*`, `src/lib/autonom/styrelse.ts`, `src/lib/autonom/organ-bus.ts`, `components/ak1a/autonom-organ-panel.tsx` (admin-flik "AI-organ styrelse", `admin/page.tsx:665-694`) | API/lib |
| Chatbotreferens | `src/app/api/chatbot/route.ts` (nämnt i grep) | kontext |

*(Kursinnehåll som råkar innehålla orden — "Utdelningsstrategi", "Förvaltningsberättelsen", "Styrelse-gäst"-badge i `kurser-section.tsx:505` — är pedagogiskt material, inte systemrester.)*

---

**Konto:** 6 ELIMINERA · 3 MERGE · 0-länkade sidor funna: 1 (`/mina-analyser`) · Döda knappar: 3 ("Se hur vi tänker", admin ×2, plus mobil-drawerns fas3/strategi) · Kritisk biverkan att hantera: `features/deep-courses/data/deep-courses.json` är live-läst av 2 API-routes.
