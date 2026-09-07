# STYRELSEDOKUMENT — BLOGG LÄGE B vs LÄGE A (V81-BENCH, 2026-09-07)

Uppdrag (STYRELSE-VAG81 §B1): prestationsbenchmark för "Läge B" (/blogg läser
Supabase live i stället för statiska filer). Agenten har mätt — inget byggts.
Källor: src/lib/blogg-speglar.ts, blogg-utkast.ts, oversattning/lager.ts,
app/blogg/*, variabler-lagring.ts, scripts/og-generate.mjs, data/blogg/,
prod (lab.ak1nvestor.com, node fetch). Råskript: tool-results/v81-bench-*.

## A. MÄTTABELL (alla siffror uppmätta 2026-09-07)

| Mätning | Värde |
|---|---|
| Poster i data/blogg/ | **55 JSON-filer** (9 fält/post, alla) |
| Total datavolym | **320,3 KiB** (328 012 B) |
| Snitt / max / min per post | 5,8 / 10,0 / 3,2 KiB |
| Body-text totalt | 270 KiB / 40 634 ord |
| Prod /blogg TTFB, varm (force-static) | **61–76 ms** (x-vercel-cache HIT) |
| Prod /blogg TTFB, kall (DNS+TLS+CDN-miss) | 1 759 ms (M1) / 608–692 ms med varm anslutning (PRERENDER) |
| Prod /blogg HTML-storlek | 218 KiB (55 kort) |
| Prod /en/blogg (ISR 1 h + 4 Supabase-anrop) | 608 ms kall — den verkliga "Läge B-kostnaden" syns här |
| PostgREST tom/fråga, varm | 47–97 ms; kall 220–370 ms |
| PostgREST 55 event-rader (~30 KiB) | **176 ms** varm |
| PostgREST ~330 KiB payload (= 55 live-poster) | **261 ms** varm, 1 Range-sida |
| HTTP-anrop: lasPubliceradeForSpegel (1 slug) | ceil(rader/1000) = **1** för blogg |
| HTTP-anrop: spegel-listläsning (hamtaLager) | **4 st**: 1 alltid kastad 404 (tabellen finns ej, mätt) + 3 Range-sidor (2 582 blogg-event, 364 KiB/sida) |
| Uppskattad TTFB Läge B, ingen cache | 60 ms → **~240–630 ms per request** (4–10×) |
| Läge B med ISR 60 s | Varm ~60 ms oförändrad; kall efter deploy ~600–900 ms (förste besökare) |
| Läge B med on-demand revalidate | Varm ~60 ms; kall endast vid deploy (= dagens beteende) |
| Event-rader vid live-lagring | 55 gällande men läsningen drar ALLA versioner: 55 rader = 1 sida (~330 KiB); 10 v/post = 550 rader (~3,2 MiB, fortfarande 1 sida); pagineringstak 10 000 rader nås vid ~180 poster × 10 versioner |
| OG-generering (npm run og) | Läser data/blogg på DISK (readdirSync, og-generate.mjs r.80/316) — **utan filer: 0 nya OG-bilder** |
| Sitemap | getBlogPosts() = filer; utan filer tappas **165 blogg-URL:er** (55×3) av 1 684 |

## B. TRE ALTERNATIV

**A — Nuvarande paketexport (Läge A).** Utkast i Supabase → exportpaket-JSON →
agent droppar i data/blogg/ + git-push → force-static-SSR. Kostnad: 0 kr, 0
nya anrop. Publiceringslatens: en agent-commit (minuter). Komplexitet: redan
levererad (våg 80b). Risk: noll hot-path-beroende — Supabase-utfall påverkar
ALDRIG den publika sajten.

**B — Full hot-path (Läge B).** /blogg + /blogg/[slug] läser system_events
live (senaste-vinner per slug, Range 1 000/sida). Kostnad: +176–261 ms varm
Supabase-fetch per kall sida (mätt), 4–10× sämre TTFB utan cache; kall cache
vid varje deploy förste besökare. Komplexitet: HÖG — kräver samtidigt: live-
läsning med fil-fallback i 2 rutter, ISR-inställningar, att speglarna
(/en|ar/blogg, egna sidor som bygger på filerna) hanteras, sitemap-lösning,
NEXT_PHASE-hermeticitet i build (generateStaticParams FÅR INTE fetcha —
params måste komma ur filerna). Risk: SUPABASE PÅ HOT-PATHEN — utfall ⇒ tom
blogglista eller 500 i prod; system_events sväller med varje utkastversion
(inga raderingar i bloggflödet); OG-bilderna slutar genereras (AC4: ingen
runtime-OG finns som ersättning); **dödfött: Vercel prod-fs är read-only och
OG + sitemap kräver filerna på disk ändå** — Läge B tvingar till dubbellagring
(Supabase-rad + fil) utan att filvägen kan tas bort.

**B2 — Hybrid: statiska listor + publiceringsknapp med dubbelwrite.**
Publikt: OFÖRÄNDRAT force-static ur filerna (60 ms kvar). Panelen får knappen
"Publicera" (i stället för bara "Exportera klar post") som skriver BÅDE: (1)
status=publicerad-rad i Supabase (revision + sanningskälla för status) och
(2) en agent-påminnelse (type=blogg_publicerad, details=paketet) som main-
agenten plockar och fullföljer med fil-drop + git-push (dagens flöde).
Kostnad: 1 liten API-rutt + panelknapp; 0 ms på publika sidor. Komplexitet:
låg. Risk: minimal — samma hot-path som idag (ingen).

## C. REKOMMENDATION

**BEHÅLL LÄGE A som publiceringsväg och AVSLÅ full hot-path (B). BYGG B2:knappen
vid nästa admin-våg — den ger panelens "Publicera"-UX utan att röra hot-pathen.**

Motivering: (1) Siffrorna — 61 ms varm statisk vs 240–630 ms per request utan
cache; den enda verkliga Läge B-proxy som finns i prod (/en/blogg, ISR +
Supabase) ligger på 608 ms kall. (2) B är dödfött i sin "rena" form: OG-
genereringen (AC4, enda generatören) och sitemap läser data/blogg från disk,
och Vercel prod-fs är read-only — filerna kan aldrig tas bort, så B kostar
dubbellagring utan vinst. (3) B2 ger hela UX-vinsten (ett klick till
publicerad + revisionsrad) till nästan noll kostnad och behåller "git-push =
live"-modellen intakt. Bloggen är SEO-bärare (1 684 URL:er) — den ska inte
få ett runtimeberoende som priser.json-mönstret uttryckligen designades för
att undvika på publika ytor.

## D. KONTRAKTUTKAST B2 (våg 82-förslag — ej byggt)

- src/lib/blogg-utkast.ts: `export async function publiceraMedPaket(post,
  tags): Promise<{ paket: BloggExportPost; }> ` — exporterarKlarPost (0-FEL-
  grinden) + markeraPublicerad + POSTAR agent-påminnelseraden:
  `type="blogg_publicerad"` severity="info" source="blogg",
  message="[blogg] PUBLICERA <slug> v<n>", details={paket:<BloggExportPost>,
  av}. P6: inga nya spår utöver events; inga IP:n.
- src/app/api/admin/blogg/publicera/route.ts: requireAdmin, POST {slug, tags}
  → publiceraMedPaket → 200 {paket} | 400/503 {fel}. Inga andra metoder.
- Panel (src/app/admin/page.tsx): knapp "Publicera (skickar till agent)" på
  granskade utkast + vy "Väntar på agent" (lasUtkast filtrerad på
  status=publicerad utan fil) + det befintliga paketet visas för hand-drop.
- Main-agentens sida (ingen kod): lasUtkast hittar blogg_publicerad-rader →
  drop data/blogg/<slug>.json → commit → prod (oförändrat force-static,
  generateStaticParams, OG, sitemap, speglar — 0 rader i src/app/blogg/).
- ISR-tal: inga nya — /blogg förblir force-static; ingen revalidate på
  publika bloggrutter (endast admin-ytan är dynamisk, som idag).

## Risklista B (skäl till avslag)
1. Supabase-utfall på hot-pathen ⇒ tom/trasig publikt lista (idag: omöjligt).
2. Kall cache vid deploy: förste besökare ~600–900 ms (mätt proxy 608 ms).
3. OG (npm run og) + sitemap bygger ur filer på disk ⇒ B kräver filerna ändå.
4. system_events-svällning: inga raderingar i bloggflödet; tak 10 000 rader.
5. NEXT_PHASE-hermeticitet: generateStaticParams får inte fetcha i build.
6. Speglarna /en|ar/blogg + hreflang-klustret bygger på filerna (dubbelrisk).

— V81-BENCH, AK1A Research Lab (mätdata: tool-results/v81-bench-*)

---

## ORDFÖRANDEBESLUT (2026-09-07, våg 81 efterspel)

**LÄGE A BESTÅR som publiceringsväg** — mätningarna (61–76 ms varm statisk
mot 240–630 ms per hot-path-request; OG-generering + sitemap bygger 100 % på
filerna på disk som prod-fs ändå kräver kvar) gör full Läge B till ren
kostnad utan vinst. **B2-HYBRIDEN SANKAS** (dubbelwrite: Supabase-rad +
agent-påminnelse via "Publicera"-knapp) som en del av NÄSTA admin-våg —
den ger kunden hela UX-vinsten ("publicera" känns live) utan att röra
hot-pathen. Implementation enligt detta dokuments B2-kontraktutkast.

— Ordföranden, AI-styrelsen AK1A
