# o111 — Spår 7: PUBLIC/-STÄD — skulptur-råmaterial + oreferenserade ikonvarianter ur den publika ytan (o101 §6 köpost 2)

**Ägare:** fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1789893903450)
**Anspråk:** `data/vakten/s7-o111-publicstad-råmaterial-u3-ansprak-2026-09-20.md` (nr-lås, disk-först FÖRE allt arbete)
**Sidofångst:** kollisionsnotis `data/vakten/s7-o110-KOLLISION-notis-u3-till-u2.md` — syskonet u2:s o110-anspråk valde ett objekt som redan var levererat (o105, commit d83c73ec); deras worklog-grep sökte fel ordform ("server-bindning" mot o105:s "SERVERBINDNA"). Notisen pekar ut beviset + de tre verkliga återstående objekten i familjen (o105 §6).

## §1 Vad som valdes och varför

o101 bokförde två "public/-hyllerågor" som fynd: skulptur-3.jpg 1 218 KiB
oanvänd + logo-transparent.png = JPEG med .png-ändelse; o101 §6 köpost 2
("public/-städ — skulptur-råmaterial") + syskonet u2:s o110-anspråks
lämna-lista bekräftar objektet ledigt. Valet föll också på att spårets övriga
köposter var blockerade just nu: o105:s EFTER-mätning kräver deploy av
d83c73ec (prod-synken står i VÄNTAR-RAM, ~1,0–1,2 GB mot 2 200 MB-kravet;
senaste deployad = adfa846e) och NastaSteg-widgeten är gated på samma
EFTER-data (o105 §6.3).

## §2 Användningsmatrisen (beviset — varje rad mätt, inte tippat)

Källor: grep i `src/**` + `next.config.ts` + `public/sw.js` + `src/app/manifest.ts` + `verktyg/**` + `data/**` (runtime-lästa ytor; vakten/OPTIMERING/backups exkluderade som dokumentation/backup) + `file` (magic bytes, aldrig enbart ändelse) + `public/ak1a/logo/README.md` (varumärkesregistret = deklarationskällan).

| Tillgång | Faktisk typ | Referenser i körbar yta | Registrets roll | Dom |
|---|---|---|---|---|
| `logo/skulptur-mark.jpg` (29 KB) | JPEG 640×640 | **2 st** (`varumarkes-logo.tsx:68`, `kommandopalett.tsx:235`) | Primärmärke | KVAR (orörd) |
| `logo/skulptur-utan-bakgrund.png` (79 KB) | PNG RGBA 640×640 | 0 | **Deklarerad aktiv standard** (sekundärmärke) | KVAR — registret är sanningen, ej aktuellt bruk |
| `logo/skulptur-hero.jpg` (276 KB) | JPEG 1440×3200 | 0 | **Deklarerad aktiv standard** (hero/dekor, landningssidor) | KVAR — samma princip (observation §5) |
| `logo/skulptur-1.jpg` (85 KB) | JPEG | 0 | Original, "arkiverad" | **ARKIV** → `data/varumarke/original/` |
| `logo/skulptur-2.jpg` (65 KB) | JPEG | 0 | Original (källan till mark+transparent) | **ARKIV** |
| `logo/skulptur-3.jpg` (1 218 KB) | JPEG 1440×3200, Android-EXIF 2026-09-03 | 0 | Original (källan till hero) — o101:s tyngsta fynd | **ARKIV** |
| `logo/ikon-192.png` (13 KB) | PNG | 0 | Ej i registret; PWA-manifestet använder `/ak1a/ikon-192.png` (roten) | **ARKIV** → `data/varumarke/ikoner/` |
| `logo/ikon-512.png` (80 KB) | PNG | 0 | Ej i registret; manifestet använder roten (21 KB) | **ARKIV** |
| `ak1a/logo-transparent.png` (67 KB) | **JPEG (JFIF) 1024×1024 med .png-ändelse** | 0 | Ej i registret — o101:s felmärkningsfynd | **ARKIV** oförändrad (transkodning = bearbetning = ägarens beslut) |
| `ak1a/ikon-{192,512,maskable-512}.png`, `apple-touch-icon.png`, `favicon.svg` | PNG/SVG | manifest.ts ×3 + konvention | PWA-kit | KVAR (orörda) |

Efterflytts-verifiering: grep på samtliga sex flyttade namn i `src/` +
`verktyg/` + `next.config.ts` + `public/sw.js` = **noll träffar**.

## §3 Kuren — arkivflytt, ALDRIG radering

Varumärkesregistrets regel 5 ("**originalen raderas aldrig — de är källan
till framtida varianter**) är kundens varumärkesstandard och styrd av
registret, inte av en städvåg. Därför: `git mv` (historik bevarad) av sex
filer till ny icke-publik arkivplats `data/varumarke/` med eget register
(`data/varumarke/README.md`: provenans, typfakta, aldrig-radera-regeln
omformulerad för platsen). Publika ytan `public/ak1a/` minskar 1 980 → 464 KB
(−1,5 MB, varav skulptur-3 ensam 1,2 MB); `public/ak1a/logo/` innehåller
nu EXAKT registrets aktiva standard + registret självt.

- `public/ak1a/logo/README.md` — Original-tabellen omskriven: pekar på
  arkivet, flytten noterad med objektnummer.
- Cache-reglerna i `next.config.ts` (`/ak1a/:path*` 1 d + swr 1 v) berörs
  ej — de täcker sökvägsmönstret, inte enskilda filer.
- `public/sw.js` (cache-först för statiskt): precache-listar INTE logotyper;
  de sex filerna hämtades aldrig ⇒ noll SW-påverkan.

## §4 Vad som medvetet LÄMNAS (icke-fynd, dokumenterade)

- `deep-courses.json` 20 MB — avsiktlig LLM-dataset (egen cache-regel sedan
  o66). Ej städobjekt.
- `reports/*.html` (~1,8 MB) + `llms.txt`/`llms-full.txt` (0,5 MB) +
  `sok-index.json` (116 KB) — sökbara publikationer/AI-ytor med egna
  cache-regler (o66/o70). Referenserade av sajtens system.
- `og/`-biblioteket (8,1 MB) — build-genererade socialbilder, kontrakt
  AC4 per next.config-kommentar. Orört.
- Felmärkningen i `logo-transparent.png` KURAS EJ (transkodning ändrar
  kundmaterial; filen är arkiverad som den är, fyndet dokumenterat).

## §5 Residualer + observationer (ärlig lista)

1. **Hero-observation:** `skulptur-hero.jpg` (276 KB) är deklarerad aktiv
   standard men har 0 aktuella referenser. LÄMNAS (registret äger beslutet);
   om huvudagenten vill stryka den ur standarden = registerändring, då kan
   den arkiveras på samma sätt (+276 KB ytterligare vinst).
2. **Teoretisk Supabase-referens:** `data/backups/db-snapshot.sqlite`
   (1,5 GB backup) innehåller strängarna "skulptur-1/2", "utan-bakgrund" —
   ursprunget kunde ej grävas ut (sqlite3-CLI saknas på servern); körbar
   yta (src + runtime-lästa data/**) är noll-verifierad. Skyddsnät:
   döda-länkar-cronen (6 h) fångar upp eventuella publika 404:or om en gammal
   databasrad mot förmodan bär en URL. Arkivplatsen gör dessutom filerna
   återställbara på sekunder (git mv tillbaka).
3. **u2:o110 — dependens:** kollisionsnotisen pekar syskonet mot o105 §6.1
   (våg 2, lang-passthrough) som närmsta fria kodobjekt; OM syskonet ändå
   kör sin plan A (ombyggnad av footer-bindning) blir det ett duplikat av
   d83c73ec — mitt ansvar slutar vid notisen (disk-först-principen).

## §6 KVD

- `src/` ORÖRT (noll Write/Edit) ⇒ **tsc ej krävt enligt leveranskriterierna**;
  pre-commit-grindens träd-kontroll bärs av HEAD-grön bas (syskonens parallella
  src-redigeringar är deras leveransansvar, o106-tillägg 2:s pathspec-läxa
  tillämpas: commit med `git commit -F <fil> -- <egna sökvägar>`).
- INGET bygge · inga npm-kommandon · public/-flytt via git mv = dataklassens
  bash-rättigheter.
- R2 orörd (priser/tier/publicering ej berörda — arkivflytt av varumärkesmaterial
  är ej extern publicering: ytan minskar, inget publiceras).
- `data/blogg/` orörd · syskonytor orörda (u2:o110-familjen, u1 osv).
- Flyttade kundtilgångar: arkiverade med register + regel-bevarande, ALDRIG
  raderade — git-historiken intakt (R-status i statusmatrisen).
