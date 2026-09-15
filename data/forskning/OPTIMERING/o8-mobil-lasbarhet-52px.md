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

## 6. EFTER rond 1 (s7 våg 4, 2026-09-15) — ROND 1 BEVISAT LIVE

Mätt mot localhost:3000 (= prod-bygget, deploy 50095d0e 11:29:58 byggde
44f977d1). Rådata: `lasbarhet-efter-rond1-2026-09-15.json`.

| Sida | FÖRE under 52 | EFTER rond 1 | Delta |
|---|---|---|---|
| / | 41 | 38 | −3 (headerns kontroller borta; footer kvar dominerar) |
| /kurser | 59 | 55 | −4 + zoomfella select KVAR (se rotorsaken) |
| /blogg | 61 | **9** | −52 — blogglänkarna + headern bevisar deployen |
| /portfolj-forskning | 33 | 29 | −4, zoomfella input BORTA ✓ |
| /forskningsbiblioteket | 13 | 10 | −3 |
| /kurser/the-intelligent-investor | 48 | 45 | −3 |
| **Totalt** | **255** | **186** | **−69** |

**Rotorsaksfynd (varför zoomfällan på /kurser överlevde rond 1):**
`globals.css` bär OLAGRADE override-regler `.text-\[11px\] { font-size: 12px }`
(ovenför 9/10/11 px — kundens +1px-läsbarhetspump). Olagrad CSS slår ALLA
Tailwind-lager i kaskaden ⇒ rond 1:s `max-md:text-base` på selecten kunde
ALDRIG vinna mot `text-[11px]` på samma element (computed 12 px trots
min-h-52 som verkade). **Kur: byt basklass till `text-xs`** (lagenlig
utility, 12 px desktop) — då vinner `max-md:text-base` (16 px mobil).
Lärdom för spåret: aldrig lägga `max-md:text-*` bredvid `text-[9-11px]`.

## 7. Rond 2 (s7 våg 4, 2026-09-15) — footer + widgetknappar + CTA-rader

CDP-sond gav facit på de kvarvarande klustrena; fixarna (alla `max-md:`,
datorvy orörd):

| Fil | Vad |
|---|---|
| `footer.tsx` | kontakt-länkar ×2 + sociala ikoner ×4 + kolumnlänkar ×21 (flex + min-h 52) + till-toppen-knappen |
| `chat-widget.tsx` | AI-Mentor-trigger 44→52² |
| `notis-center.tsx` | klock-knappen 44→52² |
| `tema-vaxlare.tsx` | `shrink-0` — flex-shrink kramade knappen 52→50 px (rotorska, inte storleksklass) |
| `mobilmeny.tsx` | hamburgerknappen 35→52² + shrink-0 (samma shrink-rot) |
| `sidfooter.tsx` | guldknapps-badge (28 px, "Phase 2 Application" på alla sidor) + kolumnlänkar → min-h 52 |
| `kurs-sok.tsx` | rotorsaksfixen: `text-[11px]`→`text-xs` (label + select) — zoomfällan dör |
| `bygg-portfolj-kort.tsx` | Logga in gratis + Se medlemskap 44→52 |
| `kurser/[slug]/page.tsx` | Öppna AK1A + Se medlemskap → inline-flex min-h 52 |
| `portfolj-forskning/page.tsx` | AKM1-kalkylatorn + Portföljbyggaren + Se medlemskap → min-h 52 |

**Medvetna undantag (dokumenterade, inte glömda):**
- ShortSeller-dölj-kryss (44², overlay-badge på 60 px-bärarknappen): 52 px
  skulle täcka bärarknappen helt; 44 px uppfyller Apple HIG 44 pt + WCAG
  2.5.8 med god marginal. Lämnad medvetet.
- Kakbannerns tre knappar (44 px) + kurssidans quiz-svarsknappar (44 px) +
  /kurser filter/pagineringsknappar (40–44 px) + LarvagKort-chips (26–42 px)
  + hero-länken "see the memberships" (30 px) = **rond 3-kö** nedan.

### Kö rond 3 (nästa våg i delspåret)
1. /kurser: filterknappar + paginering (kurs-sok.tsx) — 44→52.
2. Kurssidor: quiz-svarsknappar (kurs-renderare) + relaterade-chips —
   stor yta (343 kurser), mät först.
3. Kakbanner-knapparna 44→52 (kakvakt-komponenten).
4. Hero-länken "see the memberships" (spa-hem) 30 px.

## 8. Rond 3 (s7 våg 5, 2026-09-15 17:30) — KÖN TOM: allt fyran ovan fixat

Alla fyra köposter + LarvagKort-raderna (undantagslistan) i en våg —
samtliga `max-md:`-kirurgi (mobil <768 px, datorvy orörd), tsc 0:

| Fil | Vad |
|---|---|
| `kurs-sok.tsx` | hero-chips ("Alla (343)" + 8 kategorier), kategoriväggens ~30 chips, rensa-filter-knappen, pagineringens föregående/nästa + numrerade knappar (min-h 52; de numrerade även min-w 52) |
| `cookie-consent.tsx` | bannerns 4 knappar (Godkänn alla / Spara mitt val / Inställningar / Endast nödvändiga) 44→52 |
| `kurs-quiz.tsx` | quiz-svarsknapparna (fullbreddsrader) min-h 52 — stor yta: 8 223 quiz över 343 kurser |
| `kurser/[slug]/page.tsx` | relaterade-kursers chips (inline-flex + min-h 52 + py-0) |
| `sections/home-section.tsx` | verktygschipsen ("The AKM1 Calculator/Vave Foundation/Confluence Radar", 26 px) + Fas 2-textlänkarna "Bli certifierad"/"Se medlemskapen" (30 px — köpost 4) |
| `larvag-kort.tsx` | kortraderna min-h 52 (syskonets undantagspost) |

Noterat under vågen: de flesta 44 px-mätvärdena kommer av globals.css:529
globala golvet `min-height: 44px` för knappar <640 px — golvet lämnas
medvetet orört (ett lyft till 52 skulle förstora VARE knapp oglatt,
inklusive ShortSeller-dölj-krysset som bara får 44 av samma golv);
husstandarden nås kirurgiskt per komponent i stället.

**Driftfynd (fabriksoperativ):** prod-synkens "AGENTARBETSYTA synkad"
(15:33:10) återställer trädspårade filer till HEAD — under pågående
våg revs 4 av 6 filers ostagade redigeringar (s2-u2:s strukturfynd i
praxis igen). Kur: skriv → tsc → commit PER filgrupp i ett fönster;
om-applikation från diff kosta 6 min. Del 1 (larvag-kort +
home-section, 3d25e4f5) hann deployas 15:32:53 prod 200 före revningen;
del 2 (3b2aab63) deployas av nästa poll.

### EFTER rond 3 — mätning bokförd nedan efter del 2-deployen
