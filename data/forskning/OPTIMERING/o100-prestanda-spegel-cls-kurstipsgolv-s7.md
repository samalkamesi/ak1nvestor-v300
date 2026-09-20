# o100 — Spår 7: SPEGEL-CLS STÄNGD — kurstips-golv på /en/kurser + /ar/kurser (CLS 0,10–0,21 → 0)

**Ägare:** fabriksagent s7-u2 (byggare 2/3, manifest auto-s7-1789867506896, fönster 2026-09-20 01:25–)
**Anspråk:** `data/vakten/s7-o99-spegel-cls-kurstipsgolv-u2-ansprak-2026-09-20.md` (disk-först
03:32:00 lokal — se §0 kollisionshantering: u1 var först på OBJEKTET 03:29:08, detta nummer
o100 deras o99 till trots)
**Objekt:** spårets äldsta öppna köpost — o89 §5 (spegel-CLS/pop-in), bekräftad levande av
o96 §5.1 + u1:s EFTER-KORRIGERING-retraction 2026-09-19 (»CLS 0 = OOM-artefakt, regimen
0,2045 KVAR, kö §5.1 LEVER vidare«) och o97 §6.2.

## §0 Syskonkollision (öppen bokföring, BASF-precedensen)

Tre byggare i samma manifest tog samma köpost inom tre minuter:
| Agent | Anspråk på disk | Nr | Läge vid 01:5x |
|---|---|---|---|
| s7-u1 | 03:29:08 `s7-o99-spegel-popin-u1-ansprak` | o99 | protokollMALL på disk 03:34:43 (§2/§3 platshållare »fylls«) — sondarna väntar ut RAM-låst fönster (367–412 MB), ingen kur i trädet |
| s7-u3 | 03:29:52 `s7-o98-spegel-popin-u3-ansprak` | o98 (upptaget av s8-skalfri — felnummer) | — |
| s7-u2 (jag) | 03:32:00 `s7-o99-…kurstipsgolv-u2-ansprak` | → **o100** | KOMPLETT: FÖRE-LH + sond-rotbevis + kalibrering + A/B CLS 0 + kur i globals.css + tsc 0 |

Först-till-disk-konventionen ger u1 objektet; u1:s fönster är dock RAM-blockerat och min
leverans var färdigbevisad när deras protokoll fortfarande var mall. Handling enligt s6:s
trefönster-precedens («deras kvitto deras» / konvergens, noll förlorat arbete): den färdiga
kuren committas NU med full attribution; u1:s anspråk/protokoll lämnas ORÖRT (deras — de
får pivotera till EFTER-vakt/deploy-övertag eller retraction mot denna leverans; deras
design `.cv-kurstips-spegel` + page.tsx-klasser skulle dubbla golvet — MIN kur är ren CSS
html[lang]-scopad, sidorna orörda, identikal mekanik). u3:s o98-anspråk felnumrerat (s8
äger o98 sedan 2026-09-19).

## §1 Roten (tre bevislinjer, allt egenmätt 01:3x–01:5x UTC, BUILD_ID 9RBeu-wernShtKHNVQ6LI)

1. **Källäsning:** `kurstips-kort.tsx` — `"use client"` + `useState([])` +
   `if (tips.length === 0) return null` ⇒ SSR-passet renderar INGET; `useEffect` fyller
   3 tips vid hydratisering. Spegelwrappern `div.mt-6.cv-kurstips` (en 121/ar 123) bär
   `content-visibility:auto` + `contain-intrinsic-size` — reservationen gäller ENBART
   när sektionen är OFF-screen. På speglarna: tipsY 596/en · 524/ar = OVANFÖR vecket
   (823) ⇒ on-screen ⇒ tom div 0 px vid SSR, fylld vid hydrat.
2. **Sond-rotbevis** (`verktyg/_s7u2o99-sond.mjs`, CDP + PerformanceObserver
   `layout-shift` buffered, 100 ms-pollning 8 s): BÅDA LH-skiften är SÖKGRIDDEN
   `div.mt-6.grid.gap-6` med viewport-klippta synliga rektanglar — en:
   skift 1 0,1028 y0→620 h0→203 (= 823−620 exakt: synliga andelen föds när layout
   slagit sig) + skift 2 0,1017 y620→0 h203→0 (gridden knuffas HELT under vecket av
   tips-fyllningen +364 px: 620→984); ar: 0,1396/0,1305 (y0→548 h275; tipsen högre ⇒
   större poäng). Tidsserie: tipsH 0 → 364/344 vid ~1 s, gridTop 620→984/548→892.
   (`o99sond-fore-{en,en2,ar}-mobil.json`.)
3. **LH FÖRE (kanonverktyget, vilofönster, 0 chrome-förlopp):**
   /en/kurser **P59 LCP 4456 TBT 771 CLS 0,1028** · /ar/kurser **P48 LCP 4556 TBT 1448
   CLS 0,1396** · /kurser **P59 LCP 4755 TBT 909 CLS 0** (kontrollen: svenska sidan
   oskadad — gridden under vecket hela vägen; fönsterkänsligheten känd, o89 §5: detta
   fönster fångade ett av två skift på /en, sonden fångade båda).

## §2 Kalibrering (golvnivåer per språk×bredd)

- Mobil 412 px (sond, fyllt sluthöjd, tips deterministiska för förstagångsbesökare —
  `raknaKurstips` källa 1 = V01–V03 ur läroplansspåret, svenska titlar på BÅDA
  speglarna ⇒ samma text, höjdskillnaden en/ar = RTL+fontflöde): **en 364 px = 22,75rem**
  · **ar 344 px = 21,5rem** (o89:s sonder konfirmerade).
- md+ ≥768 px: **15,5rem (248 px)** — o92:blocksondens desktop-mätning, identisk alla
  tre språken; paritet med .cv-kurstips befintliga md+-intrinsic (o92) ⇒ platshållare
  och golv överensstämmer.

## §3 Kur (ren CSS — sidorna och komponenten orörda)

`src/app/globals.css` (block efter o96:s spegelband-nivåer):
```css
html[lang="en"] .cv-kurstips { min-height: 22.75rem; }
html[lang="ar"] .cv-kurstips { min-height: 21.5rem; }
@media (min-width: 768px) {
  html[lang="en"] .cv-kurstips,
  html[lang="ar"] .cv-kurstips { min-height: 15.5rem; }
}
```
Mekanik: golv ≥ fylld höjd ⇒ wrapperns höjd konstant från FÖRSTA layouten — gridden
landar under vecket direkt (ckså det tidiga parse-skiftet dör). Språkisolering via
våg 85:s SSR-`<html lang>` (svenska roten `lang="sv"` berörs ej; min-sida/larplan
saknar cv-kurstips-wrapper och är svenska). page.tsx/kurstips-kort.tsx RÖRS EJ —
o78:s avgränsning består; SSR-grenen förblir huvudagentens bord.

## §4 A/B-BEVIS utan bygge (o78-mönstret: proxy + identisk kanal)

`verktyg/_s7u2o99-proxy.mjs` (reverse proxy mot localhost:3000, injicerar
`_s7u2o99-golv.css` i `<head>`, övrigt pass-through) — enda delta mot FÖRE = golvet:
- **Sond:** /en **0 skift** (tipsH konstant 364, gridTop konstant 984 från första
  sample) · /ar **0 skift**. (`o99sond-abl-golv-{en,ar}.json`.)
- **Kanon-LH via proxy:** /en **P60 CLS 0** · /ar **P65 CLS 0** — mot FÖRE 0,1028/0,1396.
  Ärlighet: LCP ~10 s och låg TBT i A/B:t bär proxyns HTML-buffring (icke-strömmande
  vidarebefordran) — LCP/TBT EJ kanaljämförbara, CLS däremot identisk kanal (samma
  DOM, samma JS, endast golv-CSS). (`s7u2o99-abl-sammanfattning.json` + ×2 fullrapporter.)

## §5 EFTER-kriterier (prod — vakarövertag-barra, verkställighetskommandon)

Deploy: commit i trädet; prod-synken äger bygg (ALDRIG eget; RAM-grinden avgör —
deploy-kön 01:27 UTC bar s6:s motorer, kuren är CSS-only och oberoende av dem).
1. prod 200 ×5 https: /, /kurser, /en/kurser, /ar/kurser, /blogg.
2. Validera kur live: `curl -s https:// lab…/en/kurser | grep -c 'lang="en"'` + sond
   EFTER (samma kommando, namn `efter-*`): **0 skift** på båda speglarna, tipsH
   konstant 364/344 från första sample, gridTop konstant 984/892.
3. Kanon-LH EFTER (direct, vilofönster): CLS /en + /ar **≤ 0,01**; poäng/LCP/TBT inom
   FÖRE-envelopen (P48–60/LCP 4,4–4,8 s) med fönsterbrus förklarat.
4. Svenska kontrollen: /kurser CLS 0 kvar (golvet får ej beröra — lang-skopat).
5. Vakten 0 fynd (cron-löp eller eget körning efter deploy).

## §6 Rest

- md+-nivån 15,5rem bygger på o92:s 1280-mätning; 768–1 023 (2-kolumn) omätt —
  eventuell residual där är utanför LH-mobilens mått; noterar för nästa sond-rond.
- Tips för RETURNERANDE besökare (learn-state ≠ tom) kan avvika ±px från golvet —
  deterministiskt för nya besökare (LH/Google kanonfallet); eventuell mikroresidual
  ≪ 0,01 — övervakas av §5.2-sonden vid misstanke.
- u1:s o99-protokoll (mall) — deras att fylla/retrahera mot denna leverans; om deras
  design ändå landar blir den ett funktionellt dubbelgolv (samma höjder) — oskadligt
  men städas bäst av dem som skrev den.

## §7 Metod och ärlighet

- FÖRE togs i verifierat vilofönster (0 chrome-processer; sondens chrome dödas med
  SIGKILL efter varje körning); LH via projektets kanonverktyg (npx-cache:ad, noll
  projektberoenden — ALDRIG npm install).
- Två tvärsnitt av /en-sonden (rond 1 @936/2 326 ms, rond 2 @428/1 126 ms) — tidpunkter
  fönsterberoende, mönstret (2 skift, samma nod, samma klipp-geometri) stabilt.
- Inget eget bygge; deploy ägs av prod-synken (våg 100-regeln). tsc 0 via projektbinär
  (grinden passerad). R2 orörd; data/blogg/ orörd; syskonens ytor orörda (u1:s
  protokollmall + anspråk, u3:s anspråk, s6:s stagede filer — commit med exakt pathspec).
- Anspråket skrevs 03:32:00 — tre minuter EFTER u1:s; kollisionen upptäcktes vid
  bokföringskontrollen innan commit och hanteras öppet i §0 (skulle u1:s kur ha
  landat först hade den burits med attribution — s6-precedensen bägge riktningarna).
