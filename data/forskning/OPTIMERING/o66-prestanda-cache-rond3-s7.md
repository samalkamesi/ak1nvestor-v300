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

## §4 EFTER — DEPLOYAD 11:41:07Z (prod-synken, 6 commits varav denna vågs 4d5dd5e1, build HEAD dcd3e279), prod 200 ×3

**Curl-grind GRÖN (localhost:3000 = nya bygget, 11:4xZ):**

| Resurs | Cache-Control EFTER | Dom |
|---|---|---|
| /ak1a/favicon.svg | `public, max-age=86400, stale-while-revalidate=604800` | ✓ |
| /ak1a/logo/ikon-192.png | `public, max-age=86400, stale-while-revalidate=604800` | ✓ |
| /ak1a/logo/skulptur-mark.jpg | `public, max-age=86400, stale-while-revalidate=604800` | ✓ |
| /og/blogg/vad-ar-roe.png | `public, max-age=604800, stale-while-revalidate=86400` | ✓ |
| /manifest.json | `public, max-age=3600, stale-while-revalidate=86400` | ✓ |
| /llms-full.txt | `public, max-age=3600, stale-while-revalidate=86400` | ✓ |

**Lighthouse EFTER (s7u2-o66efter, ~11:45Z):** / P42 · LCP 5 115 · TBT 3 548 ·
CLS 0,106 (känd signatur) · /kurser P46 · 5 867 · 1 560 · 0 · /blogg P56 ·
5 321 · 1 190 · 0. **OBRUKBAR som kur-facit** — mätningen landade ~4 min
efter deploy med syskon-barn fortfarande aktiva (RAM-loggen: 795–1 031 MB
tillgängligt under hela fönstret) = o54-precedensens kontamineringsmönster
(identiskt med o63:s EFTER-fönster). Kurens mekanism (cache-headrar på
favicon/manifest/ikoner) kan per konstruktion inte påverka kallstartens
LCP/TBT — FÖRE-tabellen i §2 är vågens poängbevis och kvarstår.

## §5 UPPDAGAT UNDER EFTER-KONTROLLEN: nginx har ett EGET cache-lager — prod-bilden är sammansatt

`/etc/nginx/sites-available/ak1a` (r 36–39) bär redan:
`/og/` + `/ak1a/` → `expires 30d` + `add_header Cache-Control "public"`;
`/llms(-full)?.txt` → `expires 24h` + public; `sok-index|speglar-slugar.json` → 1 h.

Konsekvenser, ärligt bokförda:
1. **§2:s FÖRE-sond mätte Next-lagret (localhost), inte prod-kedjan.** På
   prod-HTTPS bar /ak1a/ + /og/ + llms redan nginx-expires FÖRE kuren — min
   FÖRE-tabells "max-age=0" gällde Next-svaret, som nginx-proxyn supplerade.
2. **Enda HELT öppna prod-hålet var /manifest.json** (ingen nginx-location +
   Next-default max-age=0) — numera `3600 + swr 86400` på prod-nivån
   (verifierat: curl -sI https://lab.ak1nvestor.com/manifest.json).
3. **Kuren är fortfarande rätt:** Next-lagret är nu konfliktfritt designat
   per innehållsklass, och manifest-hålet är igenstängt i lagret som äger
   värdena. MEN prod-svaret för /ak1a/ + /og/ + llms bär nu DUBBELA
   Cache-Control-rader (nginx: max-age=2592000 + public; proxat Next:
   max-age=86400/604800/3600 + swr) — motstridiga max-age i kombinerad
   lista, tolkas olika av klienter. Orent, ej skadligt (alla värden ≥ 1 h).

## §6 Rest (nästa våg / drift-ytan — ej min anspråkade yta)

Städa nginx-lagret: antingen `proxy_hide_header Cache-Control` i
location /og/ + /ak1a/ + llms (Next äger värdena nu) eller ta bort dess
`expires`/`add_header` — då försvinner dubbelrubriceringen. Kräver
nginx-reload = DRIFT-yta (drift-ops-färdigheten), bokas som egen rond.

## §7 Läxor från denna våg (till spåret)

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
