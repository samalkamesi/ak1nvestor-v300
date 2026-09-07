# STYRELSEBESLUT VÅG 81 — ADMIN-MEGA STEG 3: MEDIEBIBLIOTEK (ordföranden 2026-09-07)

Kundens lagar (2026-09-07): max parallella agenter, AI-styrelsen sankar allt,
kundärenden påminns löpande, full autonomt mandat. Styrelsens stegplan
(STYRELSE-ADMIN-MEGA.md §3) säger: steg 3 = MEDIEBIBLIOTEK efter varje godkänd
leverans — steg 1 (våg 79) och steg 2 (våg 80b) är levererade och gröna.

**VÅG 81 SANKAS: del A mediebibliotek (steg 3) + del B forskning (Läge B-
benchmark, kurs-CMS-förstudie) + del C prodverifiering av våg 80b.**

## DEL A — MEDIEBIBLIOTEKET (ADMIN-MEGA STEG 3)

Syfte: kunden laddar egna bilder (omslag, loggor) utan deploy — WordPress-
kärnan steg 3. Publikt VIP-yte: bild-URL:er i exporterat innehåll (Läge A:
baktas i JSON-paketet vid commit, INTE hot-path).

### A1 — Lagring (SUPABASE STORAGE, ingen kund-DDL)
- Bucket `media`, PUBLIC-read (bilder ska läsas direkt av <img>/next/image
  utan nyckel). Bootstrap SERVER-side vid första anrop: Storage REST
  POST /storage/v1/bucket {"name":"media","public":true} med
  SUPABASE_SERVICE_ROLE_KEY (ENDAST server — nyckeln läcker aldrig).
  409 "already exists" = OK. Fel (403/nätverk) ⇒ funktionen returnerar
  konfigurerat:false + ärligt felmeddelande i panelen — sajten opåverkad
  (MÖS-lärdomen: ALDRIG kräva kund-SQL/DDL; auto-detekterad fallback).
- Objektnyckel: SERVER-genererad `{uuidv4}.{ext}` — kundens filnamn får
  ALDRIG bli nyckel (path-traversal dött vid födseln; filnamn = metadata).
- Validering (hård): endast jpg/jpeg/png/webp/avif — **SVG FÖRBJUDEN**
  (script-inuti-SVG = XSS-vektor). Max 2 MB (Vercel Hobby body-tak
  4,5 MB — säker marginal). Magic-byte-kontroll server-side
  (JPEG FF D8, PNG 89 50 4E 47, WEBP "RIFF…WEBP", AVIF "….ftyp").

### A2 — Kärnmodul src/lib/mediabibliotek.ts (server-only, ny fil)
```
export type MediaFil = { id: string; filnaman: string; url: string;
                         bytes: number; mime: string; skapad: string }
export function mediaKonfigurerat(): boolean
export async function listaMedia(): Promise<{ poster: MediaFil[]; fel?: string }>
export async function laddaUppMedia(fil: File, av: string): Promise<{ post?: MediaFil; fel?: string }>
export async function raderaMedia(id: string, av: string): Promise<{ ok: boolean; fel?: string }>
export function mediaUrl(id: string): string
```
- Revision (P6 — inga nya spår): system_events type="media_fil"
  details={id, filnaman, url, bytes, mime, av} vid uppladdning;
  type="media_fil_raderad" (tombstone) vid radering. ALDRIG IP-adress
  i detaljerna. Lista läser STORAGE-API:t som sanningskälla (namn/storlek/
  skapad), events = revisionsloggen.
- NEXT_PHASE-hermetiskt (våg 79-korsfyndet): modulen FÅR ALDRIG fetcha
  under next build — lazy init, allt nät i funktionerna.
- Mimosa-SSRF-recept (våg 54): fast host-STRÄNG-konkat ur
  NEXT_PUBLIC_SUPABASE_URL + kontrolleraHost()-mönstret (eller
  getSupabaseRest()-återanvändning), redirect:"error",
  AbortSignal.timeout — ALDRIG fetch(new URL(borrowedString)).

### A3 — API src/app/api/admin/media/route.ts (ENDAST admin — ingen publik route)
- GET  → requireAdmin → { poster: MediaFil[], konfigurerat: boolean, fel?: string }
- POST → requireAdmin, multipart formData-fält "fil" → validerar →
  laddaUppMedia → 201 { post } | 400 { fel }
- DELETE → requireAdmin, body { id } → raderaMedia → { ok }
- Inga andra metoder; feltexter sanerade (ingen rå felstack läcker).

### A4 — Panel: admin-flik "Media 🖼️" (src/app/admin/page.tsx)
- Befintligt flik-mönster (Variabler 📊/Blogg ✍️): upload-knapp (file-input,
  accept=jpg/png/webp/avif), rutnät med tumnaglar (next/image), filnamn +
  storlek + datum, "Kopiera URL"-knapp, Ta bort (bekräftelsedialog).
- Blogg-editorn (steg 2) kopplas: fält "Omslagsbild (valfritt)" med
  URL-klistring + väljare ur biblioteket → omslagUrl följer med
  EXPORT-PAKETET (se A5). Panelen är svensk (admin-yta, ej ordlista).

### A5 — next.config.ts + seo-koppling (AC4: ingen runtime-OG)
- images.remotePatterns += ENDAST exakt
  { protocol:"https", hostname:"<projektref>.supabase.co",
    pathname:"/storage/v1/object/public/media/**" } — inga wildcards.
- seo.tsx: pageMetadata(opts.ogBild)-vägen finns redan — exporterad
  bloggpost med omslagUrl ⇒ blogMetadata använder den som ogBild;
  ogBildForPath-default (npm run og-bilderna) är OROÄRD fallback.
  OG-genereringen vid build förblir enda generatören — media = override.

### A6 — Kritor (hårda)
1. Gratis-Fas-1-löftet orört. 2. Kvalitetsvakten berörs ej (admin-skrivningar
går ej via src-copy). 3. Deploy-flödet orubbat (Supabase-skrivningar ändrar
aldrig git; Läge A-paket droppas av main). 4. Ingen runtime-OG (AC4).
5. Inga nya spår (P6). 6. tsc-baslinje 35 — 0 NYA fel. 7. Motorer 107/0/0,
vakten GRÖN, next build exit 0.

### A7 — Tester
- verktyg/testa-mediabibliotek.mjs (v79-bloggmönstret): valideringslogik
  REN (filändelse/mime/magic-byte/2 MB-gräns/uuid-nyckel-svg-förbud) utan
  nät; Storage-anrop stubbade. >= 10 test PASS krav.

## DEL B — FORSKNING (2 agenter → data/forskning/)

### B1 — BLOGG LÄGE B-BENCHMARK → STYRELSE-BLOGG-LAGE-B.md
Mät/dokumentera: lasPubliceradeForSpegel + blogg-speglars Range-paginering
(55 poster, lasBloggPosts-källan), event-radernas storlek per post, TTFB-
budget för /blogg-hot-path, ISR-alternativ (revalidate vs on-demand vs
force-static+Läge A). Leverera: rekommendation Läge A (paketexport kvar)
ELLER Läge B (lasBloggLive) med SIFFROR + risklista. Produktbeslut fattas
av styrelsen — agenten forskar, bygger ej.

### B2 — KURS-CMS STEG 4-FÖRSTUDIE → STYRELSE-VAG82-KURSCMS.md (utkast)
SIFFROR-live-läsare (rakna-siffror-motsvarighet som las-funktion,
siffror.json = genererad cache/seed), kursmetadata-redigerbar VITLISTA
(titel/intro/eta/minuter — ALDRIG access-logik), krita: kurs-access.ts
rörs ej i grunden, Fas 2/3 bakom ansökningsflödet. Kritisk fråga:
kursblock-live-redigering AVSLÅS tills vidare (2,06 M ord — blogg-mönstret
skalas inte dit utan eget beslut). Kontraktutkast för våg 82.

## DEL C — PRODVERIFIERING VÅG 80B (1 agent → tool-results/v81-prodverifiering.md)
- lab.ak1nvestor.com/en/kurser + /ar/kurser: listade kurstitlar på
  engelska/arabiska (inte svenska H1:er).
- /en/kurser/the-intelligent-investor: spegel-H1 engelsk titel.
- Speglarnas ISR 1 h (headers/ålder), sitemap 1 684 URLer oförändrad,
  404-sida + Fas-låsvy fortfarande rätt (våg 78-80a-fixarna lever).
- Node fetch (ALDRIG curl — åäö-mangling), innehållsvalidera (prod
  svarar 200 på allt — soft-404-fällan).

## AGENTDISPATCH (7 + main = vågplan enligt lag 1)
KARNA (A2+A7) · API (A3) · PANEL (A4) · SEO (A5) — gränssnitten ovan är
BINDANDE, ingen agent äger en annans fil. BENCH (B1) · KURSCMS (B2) ·
PRODVERIF (C). Main: kontrakt, integration, svit+vakten+build, commits.

Standardregler: src/ endast via Write/Edit (Mimosa), inga tmp_*-filer,
ingen python-patch på src (CRLF-trap), node fetch i tester, arbetsfiler i
tool-results/ (gitignorad), tester lämnas som verktyg/testa-*.mjs.

— Ordföranden, AI-styrelsen AK1A (autonom mandat 2026-09-07)
