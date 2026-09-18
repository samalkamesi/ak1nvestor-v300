# o66 — Cache-header-granskning ROND 3: public/-assets (spår 7)

**Ägare:** s7-u2 (byggare 2/3) · **Datum:** 2026-09-18 · **Status: KOD LEVERERAD,
EFTER väntar prod-synkens deploy (den äger bygget — o63-precedensen).**
**Anspråk disk-först:** `auto-s7-1789729524-s7-u2-ansprak-o66.md` (rot, 11:08Z).

## §1 Valet + duplikatkontroll

Spårets kontext: "bildoptimering, koddelning, cache-header-granskning, mobil
läsbarhet". Läge efter genomgång (o5–o65 + worklog):

| Objekt | Status | Källa |
|---|---|---|
| Bildoptimering | **SLUTET** — ingen bildaudit med fynd i någon Lighthouse-mätning; total-byte-weight score 1 (577 KiB, /); varumärket via next/image med sizes+priority; råa `<img>` endast motiverade externa (tenant-logotyper, favicon-tjänst, studio-uppladdningar) | mätning + kodgranskning denna våg |
| Koddelning | kärnan STÄNGD (o27 + o61/o63-familjen); chunk-paret 3o-an9dtd0lrc + 0ghd343qi8jtv = huvudagentens §5.1-rest — LÄMNAD | d920910d |
| Mobil läsbarhet ≥52px | STÄNGT (o62: kön tom, 1 dokumenterat undantag) | o62 |
| Cache-header rond 1–2 | HTML-vägar + data-json (o10: 4 vägar; o13: 56 vägar, 30 årslås kurerade) | o10/o13 |
| **Cache rond 3: public/-assets** | **OKARTLAGT — detta valet** | HEAD-sond denna våg |

## §2 FÖRE-mätning (två spår)

**A. Lighthouse (färsk rond mot aktuellt prod-bygge, verktyg/prestanda-lighthouse.mjs,
mobil-emulering, 4G-drossel — rådata i lighthouse/*-s7u2-o66fore.json):**

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| / | P53 | 4 814 ms | 1 715 ms | 0 |
| /kurser | P57 | 4 668 ms | 1 535 ms | 0 |
| /blogg | P56 | 5 136 ms | 837 ms | 0 |

Enda kvarvarande Lighthouse-opportunity: unused-javascript (24–49 KiB/sida) —
fingerprintad till TRE chunkar: 2feezv-iveko5.js (Next/React-bootstrap, 1 modul,
70 KiB), 0ghd343qi8jtv.js (React client-runtime, 42 KiB), 3o-an9dtd0lrc.js
(språk/ordbok = MGTM-designen, 46 KiB). Samtliga ramverks-/designbundna = ej
kirurgbart utan att röra huvudagentens bokade ytor. TBT-drivare: Script
Evaluation 12,8 s (drosslat) — samma familj.

**B. HEAD-sond (localhost:3000, 11:0xZ) — ROTEN till detta objekt:**

| Resurs | Cache-Control FÖRE |
|---|---|
| /ak1a/favicon.svg (1 KiB, varje sidvisning) | `public, max-age=0` |
| /ak1a/logo/ikon-192.png (13 KiB, PWA) | `public, max-age=0` |
| /ak1a/logo/skulptur-mark.jpg (29 KiB, varumärket) | `public, max-age=0` |
| /ak1a/logo/skulptur-hero.jpg (275 KiB) | `public, max-age=0` |
| /manifest.json (PWA-manifestet) | `public, max-age=0` |
| /og/** (8,1 MB — ~60 sociala delningsbilder) | `public, max-age=0` |
| /llms-full.txt (294 KiB, AI-crawler-text) | `public, max-age=0` |
| /_next/static/chunks/** (referens) | `public, max-age=31536000, immutable` ✓ |

Next.js-default för public/-filer är `public, max-age=0` — dvs. upprepade
besökare och sociala/AI-botar revaliderar (round-trip + i praktiken hela
svarskroppen vid nya deploys) VARJE gång, medan chunkarna bär immutable-år.
o10/o13-granskningarna täckte HTML-vägar och data-json — public/-assets var
spårets sista okartlagda cache-yta.

## §3 Kur — next.config.ts headers() (rond 3)

Fyra regler, försiktigt avstämda per innehållsklass (swr-fönster täcker
övergång vid byte; etag-revalidering kvarstår):

| source | Cache-Control | Motiv |
|---|---|---|
| `/ak1a/:path*` | `public, max-age=86400, stale-while-revalidate=604800` | favicon, PWA-ikoner, varumärkesfiler — byts endast vid designdeploy: 1 d + swr 1 v |
| `/og/:path*` | `public, max-age=604800, stale-while-revalidate=86400` | per-slug innehållsstabila (build-genererade, kontrakt AC4): sociala botar 1 v + swr 1 d |
| `/manifest.json` | `public, max-age=3600, stale-while-revalidate=86400` | PWA-manifest kan evolvera: 1 h-hybrid |
| `/llms-full.txt` | `public, max-age=3600, stale-while-revalidate=86400` | AI-crawler-text, byts vid deploy: 1 h-hybrid |

Typkontroll: `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**.
Bygge: ÄGS av prod-synken under /tmp/ak1a-deploy.lock (fabriksregeln).

## §4 EFTER (bokförs när prod-synken deployat)

Grind (curl mot prod):
`curl -sI https://lab.ak1nvestor.com/ak1a/favicon.svg | grep -i cache-control`
skall svara `public, max-age=86400, stale-while-revalidate=604800` (samma
mönster för övriga tre klasser) + prod 200 på /, /kurser, /blogg.
Lighthouse-EFTER-rond (s7u2-o66efter) bokförs i samma svep — kallstarts-
poängen förväntas i princip oförändrad (headerns vinst sitter i upprepad
besök/bot-trafik, ej första渲染); FÖRE-tabellen ovan är vågens poängbevis.

## §5 Läxor från denna våg (till spåret)

1. **unused-javascript är mättad**: alla tre återstående chunkar är
   ramverks- eller designbundna. Nästa TBT-vinst kräver antingen
   huvudagentens §5.1-kur (routprefetch) eller React-hydratiserings-
   nedskärning — inte mer chunk-jakt.
2. **Bildoptimering kan SKRIVAS AV i spårets kontext**: fyra Lighthouse-
   ronder (denna + o61-familjen) utan ett enda bildfynd; sajtens bilder
   går via next/image (logotyp 29 KiB källa → 2 KiB levererad w=96 q=75).
3. Public/-originalen (skulptur-1/2/3, 1,4 MB) är ARKIV enligt
   public/ak1a/logo/README.md ("originalen raderas aldrig") — de kostar
   inget i drift (oreferenserade) men 1,4 MB i varje klon.
