# STYRELSEBESLUT VÅG 82 — KURS-CMS + SIFFROR LIVE + B2-PUBLICERA + SPEGLAR-P2 (ordföranden 2026-09-08)

Underlag: STYRELSE-VAG82-KURSCMS.md (förstudie + godkänt beslut) och
STYRELSE-BLOGG-LAGE-B.md §D (B2-kontraktutkast, sankt). KUNDENS PERMANENTA
LAGAR gäller (max agenter, styrelsen sankar, full autonomi).

**VÅG 82 SANKAS i sex delar med BINANDE filägarskap (ingen agent äger en
annans fil — krockfritt parallellbygge enligt våg 79-mönstret):**

## DEL A — KURS-METADATA LIVE (Admin-Mega steg 4)

**A1 · METALIB-agenten — NYA filer (endast dessa):**
- src/lib/kurs-metadata-live.ts (server-only):
  - `export type KursMetadataFalt = "title" | "summary" | "learn" | "why"`
  - `export async function lasKursOverrides(): Promise<Map<string, string>>`
    — nyckel "{slug}.{falt}", SENASTE-VINNER, Range-paginering (variabler-
    lagring-mönstret), modul-cache 5 min, tombstone (varde null) = nyckeln
    bortfiltrerad = FILVÄRDET gäller (rollback), Supabase-fel ⇒ tom karta.
  - `export async function skrivKursMetadata(p: { slug: string; falt:
    KursMetadataFalt; varde: string | null; av: string }): Promise<{ ok:
    boolean; fel?: string }>` — validerar HÅRT: slug måste finnas i
    deep-courses (getCourses()), falt i vitlistan, längdtak title ≤ 120 /
    summary/learn ≤ 300 / why ≤ 900, kontrolleraText 0 FEL på varde (våg
    66-grinden — publicerad copy), varde=null = tombstone (rollback) OK;
    VITLÅS: slug/category/weight/xp/minutes/chapters AVVISAS ALDRIG-nivå
    (ok:false + tydlig feltext). Skriver BÅDE type="kurs_metadata"
    (details={slug, falt, varde, gammalt, av, kalla:"panel"}) och
    type="kurs_metadata-andring" (revisionsrad). NEXT_PHASE-hermetik +
    Mimosa-recept (getSupabaseRest-origin; URL:er "+"-konkat, regex-intyg —
    våg 81:s hårdlärda mönster; ALDRIG mallsträng med variabel i sökväg).
  - `export async function medKursOverrides(kurs: Course): Promise<Course>`
    — ren merge av vitliste-fält ur lasKursOverrides (import Course från
    @/lib/content; typen åter-returneras).
  - REN valideringslogik exporterad för testerna.
- verktyg/testa-kurs-metadata.mjs — ≥ 10 PASS ren logik (vitlista, vitlås,
  längdtak, tombstone, nyckelformat, merge) — v79-mönstret; om modulen har
  förlösliga importer: importbro-mönstret från testa-mediabibliotek.mjs.

**A2 · API-agenten — NY fil (endast):** src/app/api/admin/kurser/route.ts
- GET → requireAdmin (prod utan ADMIN_PASSWORD = vägran, v79-regeln) →
  { kurser: Array<{ slug, fil: {title,summary,learn,why}, gallande:
  {…}, kalla, andrad }>, logg: senaste 20 kurs_metadata-andring } —
  333 poster ur getCourses() + lasKursOverrides() sammanslaget.
- POST → requireAdmin → body {slug, falt, varde|null} → skrivKursMetadata
  → 200 {ok} | 400 {fel}. Endast GET/POST.

**A3 · PANEL-agenten — NY src/components/ak1a/admin/kurs-panel.tsx + EDIT
src/app/admin/page.tsx (ENBART flik-koppling: TabsTrigger "Kurser 🎓" +
TabsContent med <KursPanel />, exakt Variabler/Blogg/Media-mönstret):**
Sök bland 333 (slug+titel), inline-edit av de 4 vitlistefälten med
diff-preview (filvärde grått, gällande vanligt), Rollback-knapp (skickar
varde:null), spårhistorik (logg-listan), kontrolleraText-fel visas före
spara. Svensk admin-yta, lazy mount (media-panel-mönstret).

## DEL B — SIFFROR LIVE + SV-ISR (SIFFROR-agenten — NY + EDIT endast dessa):
- NY src/lib/siffror-live.ts: `export async function lasSiffror():
  Promise<Siffror>` — kurser/bokmaster/quiz ur memoiserade getCourses()
  (+getBokkanon()), fas2Kurser/fas3Kurser ur FAS2_KURSER.size/
  FAS3_KURSER.size (IMPORTERADE Sets — kurs-access.ts RÖRS ALDRIG),
  quizXp = quiz×10; kastar ALDRIG, fallback till statisk SIFFROR-import.
  SIFFROR-konstanten + tal() i src/lib/siffror.ts ORÖRDA (tsc-baslinje!).
- EDIT src/app/kurser/page.tsx + src/app/kurser/[slug]/page.tsx: lägg
  `export const revalidate = 3600` (samma combo som speglarna — FÖRST NU,
  samtidigt som lagret landar, enligt ordförandebeslutet), tråda
  lasSiffror() på sidans tal-ytor som är await-bar (server-komponent) —
  KLIENТ-komponenter lämnas på statiska tal(). [slug]-sidan använder dess-
  utom medKursOverrides(course) för title/summary/learn/why-renderingen
  (metadata + synlig copy). OBS dynamicParams=false BESTÅR (äkta 404,
  våg 81) — revalidate+dynamicParams=false är kompatibelt (verifiera i
  build-utskriften: kända sidor ISR-○, okända 404).

## DEL C — B2 PUBLICERA-KNAPP (B2-agenten — EDIT + NY endast dessa):
Enligt STYRELSE-BLOGG-LAGE-B.md §D, ordagrant: EDIT src/lib/blogg-utkast.ts
(publiceraMedPaket — exporterarKlarPost 0-FEL-grind + markeraPublicerad +
POSTAR type="blogg_publicerad" details={paket, av}, message="[blogg]
PUBLICERA <slug> v<n>", P6 inga nya spår) · NY src/app/api/admin/blogg/
publicera/route.ts (requireAdmin, POST {slug, tags} → 200 {paket} | 400/503
{fel}) · EDIT src/components/ak1a/admin/blogg-panel.tsx (knapp "Publicera
(skickar till agent)" på granskade utkast + vy "Väntar på agent" (utkast
med status=publicerad) + paketet visas för hand-drop). Publika bloggrutter
ORÖRDA (0 rader i src/app/blogg/). Main-agentens sida (ingen kod): plockar
blogg_publicerad-rader → fil-drop + commit (oförändrat flöde).

## DEL D — SPEGLAR-P2 (SPEGLING-agenten):
- BYGG: oöversatta kategorietiketter i /en|/ar/kurser-listorna (BOKMASTER,
  BETEENDEFINANS m.fl. syns råa) — hitta renderingsytan (kurs-sok/kurs-
  speglar/listsidorna), lägg en kanonisk kategori-mappning sv→en→ar (gärna
  i src/lib/ordlista.ts som kategori.*-nycklar OM det passar mönstret,
  annars en dedikerad map bredvid konsumumenten — följ befintlig stil) —
  ALLA 27 kategorier × 2 språk.
- FORSKNING → data/forskning/STYRELSE-SPEGLAR-P2.md: (1) soft-404 på
  speglar (Next 16 dynamicParams=true = 200-skal, våg 81-fyndet) — alternativ
  A: full generateStaticParams (333×2 extra prerender — mät/estimera
  byggkostnad ur senaste build-utdata) vs B: acceptera + robots/noindex-
  aspekter vs C: middleware-404; rekommendation. (2) html lang="sv" på
  speglarna: rot-layoutens <html> kan bara ändras via route-group-restruktur
  — skissa alternativ (egen root layout för [en|ar]-grupp) med risklista.
  Forskar, bygger INET av dessa två.

## KRITA (hårda, alla agenter)
1. kurs-access.ts ORÖRD. Gratis-Fas-1 heligt. 2. Vitlås (slug/category/
weight/xp/minutes/chapters aldrig skrivbara). 3. tsc-baslinje 35 = 0 nya.
4. Kvalitetsvakten + rakna-siffror.mjs orörda. 5. kontrolleraText = hård
grind på ALLA skrivningar. 6. P6 inga nya spår. 7. Deploy-flödet orubbat.
8. Mimosa-recept: fetch-URL "+"-konkat + regex-intyg (våg 81), src endast
via Write/Edit, inga tmp_*, ingen python på src. 9. Motorer 107/0/0 +
vakten GRÖN + build exit 0 vid integration (main kör).

## AGENTDISPATCH: 6 agenter (METALIB · API · PANEL · SIFFROR · B2 ·
SPEGLING) + main = integration/verifiering/commits/push/prodverifiering.

— Ordföranden, AI-styrelsen AK1A (autonom mandat, "jbba i dagar" 2026-09-08)
