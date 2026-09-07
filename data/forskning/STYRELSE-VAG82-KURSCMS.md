# STYRELSE VÅG 82 — KURS-CMS + SIFFROR LIVE: FÖRSTUDIE (agent V81-KURSCMS, 2026-09-07)

Underlag: STYRELSE-ADMIN-MEGA §3 steg 4 + gemensam krita, STYRELSE-VAG81 del B2,
verktyg/rakna-siffror.mjs, verktyg/kvalitetsvakt.mjs sektion 9, src/lib/{siffror,
variabler,variabler-lagring,content,kurs-access,kurs-speglar}.ts, src/app/kurser/*,
src/app/{en,ar}/kurser/*, public/deep-courses.json (16,0 MB, 333 kurser). Mätning:
tool-results/v82-matning.mjs (5 omgångar, node, gitignorad). Forskat, inget byggt.

## 1. NULÄGE — två avgörande fynd

**F1 — Rendering: sv-kurssidorna är build-frusna, speglarna ISR.** /kurser +
/kurser/[slug] (sv): `dynamic="force-static"`, INGEN revalidate ⇒ live-ändringar
syns först vid deploy. /{en,ar}/kurser + /[slug]: `force-static` + `revalidate=3600`
+ `dynamicParams=true` ⇒ live inom 1 h (bevisar att kombon funkar i kodbasen).
/api/kurs-spegel läser request-time. Metadata-live har alltså redan en ISR-yta —
men den svenska originalsidan saknar den.

**F2 — kurs.xp är dött fält, XP är beräknad.** [slug]/page.tsx våg 78 B4a:
visad intjänbar XP = quiz-antal × 10 + 50 (kurs.xp "stämmer inte för 333/333").
Att redigera xp ändrar INGET synligt — bara förorenar data. quizXp = quiz×10 i
siffror speglar samma ekonomi.

## 2. VITLISTA — redigerbara kursmetadata-fält (del 1 i uppdraget)

| Fält | Bedömning | Konsument-ytor |
|---|---|---|
| **title** | REK (vitlista) | H1, brödsmula, courseMetadata (SEO-title där genererad meta saknar), speglarnas fallback (översättning vinner), relaterade-kort |
| **summary** | REK (vitlista) | kortbeskrivning, JSON-LD-utdrag |
| **learn** | REK (vitlista) | korttext + SEO-description (där genererad meta saknar), Kakudax-frågecopy |
| **why** | REK (vitlista) | sidans "Varför"-prosa |
| minutes/totalMinutes | AVSLÅ — DERIVAT av chapters (TOC-summan visas intill; live-override skapar permanent dubbelsanning; fel i filen = agentfix, inte panelfix) | "⏱ X min", TOC-fot |
| xp | AVSLÅ — dött fält (F2), XP-ekonomin våg 78 är beräknad | ingen synlig (intjanbarXp ersatt) |
| category | AVSLÅ — RÄKNEDIMENSION: bokmaster-räknaren i rakna-siffror/sektion 9, sitemap-prio (BOKMASTER 0.9), "Relaterade kurser"-grupp, AKM1-etikett | räknare, sitemap, gruppering |
| weight | AVSLÅ — AKM1-modellcopy (pedagogiskt känslig) | "väger X % i AKM1" |
| level | avvakta (lågvärde chip; ordlista-känsla) — ej minimal | chip, SEO-description |
| slug | ALDRIG — URL, sitemap 1 684, kurs-access-Sets, MÖS-nycklar "{slug}:…" — ren ASCII helig | allt |
| chapters/blocks/quiz/history/perspektiv | se §4 AVSLAG | struktur + översättningslager |

**Minimal säker uppsättning våg 82: title, summary, learn, why** — ren prosa,
kontrolleraText-bar, inga strukturella konsumenter (sitemap/access/XP orörda).
Valideringsgränser: title ≤ 120, summary/learn ≤ 300, why ≤ 900 tecken; 0 FEL i
kontrolleraText (publicerad copy, våg 66-grinden). Nuans: title-edit påverkar
INTE speglarnas titel (MÖS-lagret vinner; svensk title är fallback) — ändring
syns på sv-ytor (med ISR enl. §5) och oställd spegel visar gammal översättning
tills omöversatt — dokumenteras i panelen, är ingen bug.

## 3. lasSiffror() — SIFFROR LIVE (del 2)

**Kostnadsmätning (node, kall):** disk-läsning 78–93 ms · JSON.parse 41–63 ms ·
räkneloop (333 kurser, quiz+bokmaster) **0,7–1,1 ms** · TOTALT 122–157 ms
(median 140 ms). Men: src/lib/content.ts getCourses() MEMOARSER redan hela
parse:en i modul-scope — lasSiffror() som räknar ur getCourses() kostar ~1 ms
varm och 0 kr extra kall (kurssidorna betalar redan parse:n per lambda-instans).
Metadata-änden av filen (exkl chapters) är 1,1 MB av 16 MB.

**Design:** ny `src/lib/siffror-live.ts` (server-only):
`export async function lasSiffror(): Promise<Siffror>` — kurser/bokmaster/quiz
ur getCourses() (memo), kanonBocker/kanonSomKurs ur getBokkanon(), fas2Kurser/
fas3Kurser ur `FAS2_KURSER.size`/`FAS3_KURSER.size` ( importerade Sets —
read-only, kurs-access.ts RÖRS EJ; rakna-siffrors fil-regex behövs bara till
seed-genereringen), quizXp = quiz×10. Kastar ALDRIG: try/catch ⇒ fallback till
statiska SIFFROR (data/siffror.json = seed/cache, exactly steg 4-definitionen).

**Konsumtion utan tsc-brott:** `SIFFROR`-konstanten + `tal()` i src/lib/siffror.ts
förblir ORÖRDA (33 konsumerande filer, varav 8+ klientkomponenter — de kan inte
await:a). lasSiffror() konsumeras ENDAST av server-komponenter på ISR-ytor
(förslag §5: speglarnas kurssidor + sv /kurser-ytor om revalidate landar) via
`const s = await lasSiffror()` + befintlig tal(). Värde = arkitektur: glömd
rakna-siffror-omkörning kan aldrig längre visa föråldrade tal publikt; siffror
ändras ändå bara vid kurs-deploy.

**Kvalitetsvakten sektion 9: OFÖRÄNDRAD, komplementär.** Vakten polerar
(a) seed vs verklighet (FAIL tvingar fram rakna-siffror-omkörning — repo-hygien
kvarstår) och (b) hårdkodade föråldrade tal i src-copy (orörd av live-tal, som
aldrig lever i src). Live-tal botar symptomet (fel tal renderat), vakten botar
roten (filen). Ingen vaktförändring krävs eller önskas i våg 82.

## 4. KURSBLOCK-LIVE-REDIGERING — AVSLAG TILLS VIDARE (del 3)

2,06 M ord / 16 MB / 333 kurser är en annan beast än 55 bloggposter:
1. **Översättningslagret:** varje block är en MÖS-enhet positionellt nycklad
   ("{slug}:kap{n}:block{i}") — live-redigerad svensk text ogiltigförklarar
   TYST lagrade en/ar-översättningar (ingen diff-detektor finns); speglarna
   visar då gammal översättning mot ny källa = språkdrift utan larm.
2. **Fas-gating (våg 78 B1):** kap 3+ på fas-kurser får ALDRIG serialiseras i
   statiskt HTML — en CMS-skrivväg måste respektera smakprovsgräns + gate, en
   bugg läcker betalt innehåll.
3. **XP-ekonomi:** quiz-antal per kapitel driver intjänbar XP — live-redigerat
   quiz ändrar ekonomin under medlemmars fötter.
4. **Payload/skal:** ~50 kB struktur per kurs i system_events-details är
   olämpligt; senaste-vinner per block = radexplosion; expand-courses-cron äger
   strukturen. Blogg-mönstret (Läge A-paketexport) skalas inte hit.
Återkom när B1:s Läge A/B-beslut landat + lagret har ogiltigförklarings-detektor.

## 5. KONTRAKTUTSKAST VÅG 82 (del 4 — för styrelsens beslut)

**Data (ingen DDL, steg 1/2/3-mönstret):** system_events
type="kurs_metadata" details={slug, falt, varde, gammalt, av, kalla} — SENASTE-
VINNER per "{slug}.{falt}"; varde=null = tombstone ⇒ filen gäller igen
(rollback). type="kurs_metadata-andring" = revisionslogg (v79-dualmönstret).

**Ny lib `src/lib/kurs-metadata-live.ts`:** `lasKursOverrides(): Promise<Map<
string,string>>` modul-cache 5 min (variabler-lagring-mönstret, paginat Range,
Supabase-fel ⇒ tom karta = filen gäller) + `medKursOverrides(kurs: Course):
Course` (ren merge av vitliste-fält). Fas-räknare läser .size — kurs-access.ts
ändras EN RAD aldrig.

**API `src/app/api/admin/kurser/route.ts`** (ENDAST admin): GET → requireAdmin →
{kurser: 333 st med filvärde+gällande+källa+ändrad, logg: senaste 20 andringar};
POST → requireAdmin (prod utan ADMIN_PASSWORD = 500, v79-regeln), body
{slug, falt, varde|null} → validerar: slug ∈ deep-courses, falt ∈
{title,summary,learn,why}, längdtak §2, kontrolleraText 0 FEL, slug/category/
weight/xp/minuter AVVISAS HÅRT (vitlås) → skriver båda event-typerna.

**Panel:** admin-flik "Kurser 🎓" — sök bland 333, inline-edit av 4 fält,
diff-preview (fil grått vs gällande), rollback-knapp, spårhistorik. Svensk yta.

**ISR-tal:** speglar kvar 3600 (befintligt). FÖRSLAG (styrelsebeslut krävs —
force-static-DNA, §4.4a): lägg `export const revalidate = 3600` på sv /kurser +
/kurser/[slug] (samma bevisade combo som speglarna) ⇒ metadata-ändringar live
inom 1 h ÄVEN på svenska originalet. Alternativ: sv frusna till deploy (F1) —
panelen visar då ärligt "syns på speglar ≤ 1 h, svenska sidor vid deploy".
lasSiffror-konsumenter samma ytor; medlemskap kvar 300.

**Krita (hårda):** 1. kurs-access.ts orörd i grunden — Fas 2/3 kvar bakom
ansökningsflödet, gratis-Fas-1 heligt (P3). 2. Vitlås: slug/category/weight/xp/
chapters ALDRIG skrivbara. 3. SIFFROR-export + tal() orörda — tsc-baslinje
0 nya fel. 4. Kvalitetsvakten + rakna-siffror.mjs orörda (sektion 9 oförändrad).
5. kontrolleraText = hård grind på varje skrivning. 6. Inga nya spår (P6).
7. Deploy-flödet orubbat (Supabase skriver aldrig git). 8. Motorer gröna +
next build exit 0. Tester: verktyg/testa-kurs-metadata.mjs (validering ren,
stubbade nät — v79-mönstret, ≥ 10 PASS).

**Rekommendation:** REK: (a) SIFFROR-live (lasSiffror, i princip gratis via
getCourses-memot), (b) metadata-vitlista title/summary/learn/why + panel + API,
(c) sv-kurssidornas revalidate=3600 som villkorat beslut; AVSLAG (d) block-
redigering tills vidare, (e) minuter/xp/category/weight/slug/level permanently
låsta. Omfattning ≈ 1 våg med 4–5 agenter (LIB/API/PANEL/SIFFROR-ISR/TEST).

— V81-KURSCMS, forskaragent (mätningar: tool-results/v82-matning.mjs)

---

## ORDFÖRANDEBESLUT (2026-09-07, våg 81 efterspel)

Förstudien GODKÄNNS som underlag för våg 82:s byggkontrakt: vitlista
title/summary/learn/why, lasSiffror-liveström med SIFFROR-fallback,
kurs-access.ts orörd, block-live-redigering AVSLAGET tills vidare (bekräftat
— MÖS-positionering + Fas-gating + 16 MB payload gör det till en egen
forskning). Villkorat beslut (c) sv-kurssidornas revalidate=3600 UPPFYLLES
FÖRST I VÅG 82 SAMTIDIGT som metadata-lagret landar (aldrig före). Omfattning
4–5 agenter enligt förstudien. Våg 82 planeras med B2-publicera-knappen
(STYRELSE-BLOGG-LAGE-B.md) i samma våg.

— Ordföranden, AI-styrelsen AK1A
