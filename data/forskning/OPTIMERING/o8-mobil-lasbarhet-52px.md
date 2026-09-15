# O8 — Mobil läsbarhet ≥52 px: första mätningen + kirurgiska fixar (Spår 7, s7-u2)

Datum: 2026-09-15 · Mätare: `verktyg/mobil-lasbarhet.mjs` (NY — CDP mot
headless Chrome, mobil 390×844, iPhone-UA) · Mål: prod
(https://lab.ak1nvestor.com) · Bevis: `lasbarhet-fore-2026-09-15.json`.

## Varför detta objekt

Spårets fyra ytor: bildoptimering togs av syskonet (Lighthouse-harness +
"före"-mätning i `data/forskning/OPTIMERING/lighthouse/`), koddelning var
redan levererad (lasy-global.tsx, v96-mönstret), cache-headrar granskade
(se §4). **Mobil läsbarhet ≥52 px-target hade ALDRIG mätts** — gränsnitts-
vakten fångar kontrast/överflöd/klippning men inte tryckytor, och
52 px-standarden (våg 93 C3) fanns bara i studio-komponenterna.

## 1. Verktyget

`verktyg/mobil-lasbarhet.mjs` — ingen installation (node ≥22 WebSocket +
/usr/bin/google-chrome), RAM-vakt 700 MB, egen CDP-port 9337. Mäter:
- **Tryckmål**: interaktiva element med min(bredd,höjd) < 52 px.
  Prosa-länkar (`display:inline` i löpande text) räknas som berättigade
  undantag (WCAG 2.5.8-spåret).
- **Input-zoom**: input/select/textarea med font-size < 16 px (iOS
  auto-zoomar vid fokus).
- Kraschtålig: about:blank-mellanlandning per sida (renderer-byte) +
  omförsök vid tom DOM — dokumenterat i verktyget.

## 2. FÖRE-läge (prod, 6 sidor) — 255 tryckmål + 2 zoomfällor

| Sida | Interaktiva | Under 52 px | Zoomfällor |
|---|---|---|---|
| `/` | 59 | 41 | 0 |
| `/kurser` | 109 | 59 | 1 (select 12 px) |
| `/blogg` | 119 | 61 | 0 |
| `/portfolj-forskning` | 42 | 33 | 1 (input 14 px) |
| `/forskningsbiblioteket` | 38 | 13 | 0 |
| `/kurser/the-intelligent-investor` | 77 | 48 | 0 |

Återkommande förbrytare (aggregerat): headerns 6 kontroller på ALLA sidor
(logotyp 32 px, tema 32, meny 36, språk 44, "Sign in" 28, "Phase 2
Application" 28), bloggens "Fortsätt djupare"-länkar (~30 st à 29 px),
footerns kolumnlänkar (20 px), AI-Mentor/ShortSeller-monteringsknappar
(44 px).

## 3. Fixarna (denna commit — max-md-skyddade, desktop orörd)

Alla ändringar är `max-md:`-variant = träder i kraft <768 px, datorvy
oförändrad. `npx tsc --noEmit` = 0.

| Fil | Vad |
|---|---|
| `src/components/ak1a/header.tsx` | sök/tema/meny-knappar 32→52², drawerns stäng-knapp 36→52², meny-rader (MegaRad) får min-h 52 — inkl. "Phase 2 Application"-raden |
| `src/components/ak1a/tema-vaxlare.tsx` | temaknapp 32→52² |
| `src/components/ak1a/sprak-vaxlare.tsx` | språkpill 44→52 (min-h + min-bredd) |
| `src/components/ak1a/inloggad-knapp.tsx` | "Logga in"/"Logga ut" 28→52 (min-h) |
| `src/components/ak1a/varumarkes-logo.tsx` | logotyp-tryckyta min-h 52 |
| `src/app/(huvud)/blogg/page.tsx` | "Fortsätt djupare"-länkar block + min-h 52 (~30 st) |
| `src/components/ak1a/kurs-sok.tsx` | sorterings-select: 12→16 px + min-h 52 (dödar iOS-zoom) |
| `src/components/ak1a/portfolj-forskning/korstabell.tsx` | sök-input: 14→16 px + min-h 52 (dödar iOS-zoom) |

**Medvetet kvar till rond 2** (bokade, inte glömda): footerns kolumnlänkar
(20 px — behöver genomtänkt radhöjd, inte enklassfix), AI-Mentor/-
ShortSeller-monteringsknappar (44 px — nära målet, ägs av widget-filerna),
"Se medlemskap"-länken (38 px).

## 4. Cache-header-granskningen (spårsobjekt 3 — bokas här)

Mätt med curl/HEAD mot prod 2026-09-15:

| Resurs | Cache-Control | Dom |
|---|---|---|
| `/_next/static/*` (JS+fonter) | `public, immutable, max-age=31536000` | GRÖN — hashat innehåll |
| `/sok-index.json` (76 kB) | `max-age=3600` + ETag | GRÖN |
| `/llms.txt` | `max-age=86400` | GRÖN |
| `/og/*` (meta-bilder) | `max-age=2592000` | GRÖN |
| `/kurser` (HTML) | `s-maxage=3600, swr=1 år` | GRÖN — sunt ISR-mönster |
| `/sw.js` | `max-age=0` | GRÖN — korrekt för SW-uppdatering |
| `/`, `/portfolj-forskning` (HTML) | `s-maxage=31536000` utan swr | GUL — latent: ingen delad cache finns i kedjan (nginx = ren reverse-proxy, ingen proxy_cache verifierad i sites-enabled/ak1a), men om CDN läggs framför låses HTML årslånt. Rekommendation: sätt `staleTimes`/revalidate-mönster som /kurser vid tillfälle |
| `/deep-courses.json` (17,5 MB) | `public, max-age=0` | GUL — hämtas bara som fall-back när sok-index.json saknas (sokindex.ts), men om den väl hämtas omvalideras 17,5 MB. Förslag: headers()-regel i next.config med max-age=3600 |
| `/api/notiser` | saknas | ℹ — dynamisk, innehåll dagställt; våg 78-gating håller redan låg frekvens. Marginalvinst |

**Dom:** cache-landskapet är i stort friskt — de två GUL-posterna är
dokumenterade förslag, inga akuta skador. next.config.ts rördes INTE
(kollisionsrisk med syskonens bildoptimering — images-sektionen).

## 5. EFTER-protokoll

Fixarna är kodleverans (fabriksregler: inget bygge här). Nästa prod-bygge
(kraschvakten/prod-synken äger det) gör dem live — kör sedan:

```bash
node verktyg/mobil-lasbarhet.mjs https://lab.ak1nvestor.com \
  data/forskning/OPTIMERING/lasbarhet-efter-<datum>.json
```

Förväntat: headerns 6 kontroller + ~30 blogglänkar + 2 zoomfällor försvinner
ur listan (≈ −50 fynd/sida på tunga sidor, −41 på startsidan); footer +
widgetknappar kvarstår till rond 2. Jämför mot
`lasbarhet-fore-2026-09-15.json` (samma sidordning).
