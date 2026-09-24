# o156 — Nyckeltalsguide-upptäckbarhet: o152 §restpost 2 utredd + rotorsakskur (s8-u1)

**Spår:** 8 KVALITET & SÄKERET (vakt) · **Agent:** s8-u1 (fabrik) · **Datum:** 2026-09-24
· **Anspråk:** `data/vakten/auto-s8-kvalitetsvag-s8u1-0924-ansprak-o156.md` (disk-först)
· **Nummer:** o156 reserverat i `data/vakten/protokollnummer.json` (o155 upptaget av s7-u2:s
protokollfil; o154 lämnat tillbaka men lämnas orört för serie-tydlighet).

## §0 — Val och duplikatkontroll

Val: **o152 §restpost 2** — "/data/nyckeltalsguide en/ar-språkfrågan — vill utredas av
framtida våg med källkoll i src/app/(huvud)/data/nyckeltalsguide innan något döms".
Duplikatkontroll: worklog spår 8 slutar o153; OPTIMERING slutar o155 (s7:s); grep
"nyckeltalsguide" i src = 4 filer (sidan, API-routen, 2 lib) — ingen pågående kur;
inga syskonanspråk (u2/u3) på disk i detta objektet.

## §1 — Fynd (FÖRE-facit, mätt 2026-09-24 ~02:0x lokal, localhost = prod)

| Mätning | Resultat |
|---|---|
| `/data/nyckeltalsguide` | 200 (svensk, ISR 1 h, FAQ-jsonLD, våg 87) |
| `/en/data/nyckeltalsguide` + `/ar/data/nyckeltalsguide` | 404 |
| sitemap.xml "nyckeltalsguide" | **0 träffar** (dataset-grenen slutar vid [bransch]+aspekt) |
| Interna inlänkar till guiden | **0** (/, /dataset, /en/dataset, /ar/dataset, /kurser mätta) |
| hreflang-dödlöften från guiden | 0 (endast sv-SE + x-default — rent) |

## §2 — Rotorsaka

Två ben, samma familj:

1. **Sitemap-glömska.** Guiden byggdes våg 87 som "citeringsmagnet" (ENBESTÄMT,
   STRUKTURERAT, DATAUNIKT). När dataset-grenen ritades (våg 97 E1: index +
   bransch + speglar, senare aspekter våg 150 och bolag våg 149) togs guiden inte
   med — ingen kommentar utesluter den (jämför portfölj-tier-grindens medvetna
   villkor), alltså glömska, ej design. Konsekvens: en levande, indexbar sida som
   sökmotorernas primära kanal aldrig bjuds in till.
2. **Inlänkar = noll (upptäckbarhetsö).** `DatasetIndexVy` och detalj-vyn
   redovisar medianer ur EXAKT samma källa (bolagsunivers.json) som guiden
   förklarar metoden för — men länkar aldrig dit. Ingen navigation eller footer
   bär vägen. Kunder som läser "median P/E teknik 31,8" har ingen väg till
   metodiken; PageRank-flödet in är noll.

**Klassificering:** spegelbilden av o146 — där lovade sitemapen sidor bygget saknade
(döda löften); här lever sidan men lovas och vägas aldrig. Båda är kontrakt mellan
publicerande ytor där den ena sidan glömdes.

## §3 — Kur (4 filer)

1. `src/app/sitemap.ts` — post för `/data/nyckeltalsguide`: okonditionell (ISR-rutt
   byggd i varje bygge sedan våg 87 — ingen `byggdSidaFinns`-grind behövs, rutten är
   inte byggfrusen), `changeFrequency: "daily"` (ISR 1 h), `priority: 0.8`,
   `lastModified: datasetDatum` (samma rådata-ägande som grannarna).
2. `src/lib/ordlista.ts` — ny nyckel `dataset.guideLank` ×3 språk. en/ar-texterna
   varnar ärligt att målet är på svenska ("in Swedish" / "بالسويدية") i stället för
   att neka en/ar-läsaren vägen.
3. `src/components/ak1a/dataset-sidor.tsx` — guid-länk i BÅDA vyerna (index +
   detalj): `<Link href="/data/nyckeltalsguide" prefetch={false}>` med
   o17-precedens (grann-CTA:s mönster). Absolut sökväg — guiden är enbart-svensk
   oavsett spegel-prefix. Detalj-vyn medvetet inkluderad: det är långsvans-
   magneterna ("median P/E <bransch>") som bärt den starkaste efterfrågan på metoden.
   Inlänkar efter deploy: 3 index + 10 branscher × 3 språk = 33.
4. `verktyg/_s8u1o156-efter-sond.mjs` — EFTER-sond (se §5).

## §4 — Bevis

- `node node_modules/typescript/bin/tsc --noEmit` → **0 fel** (projektbinären).
- `node --check` på sonden → OK.
- Mimosa-paritet → **GRÖN, 0 fynd** (772 filer; sondens fetch är BAS-loopback).
- EFTER-sond FÖRE-läge: källkods-krav K1–K3 PASS; live-krav korrekt **VÄNTAR-DEPLOY**
  (exit 2 — aldrig fejkgrön, o148:s spökmätningsskydd).
- prod 200, deploylås ledigt vid commit. **INGET bygge** — prod-synken äger.

## §5 — Dom: o152 §restpost 2 (en/ar-frågan)

**Dom: enbart-sv vid design — 404 är KORREKT svar, inget vaktfynd, inget dött löfte.**
(1) Guiden skapades våg 87 som svensk citeringssida; speglarna för dataset-familjen
byggdes våg 97 som eget beslut per yta. (2) sitemap lovar aldrig en/ar-stigerna
(livskontraktet grönt) och guiden deklarerar inga hreflang-alternates. (3) Någon
en/ar-läsare som FÖLJER en länk nu varnas om språket i länktexten. Speglings-
beslutet (2 nya sidor + FAQ-översättning + jsonLD) är en egen vågs yta → §7.

## §6 — EFTER-kvitto (ETT kommando vid nästa gröna prod-bygge)

```
node verktyg/_s8u1o156-efter-sond.mjs   ⇒ DOM: GRÖN (exit 0)
```

Väntat: L3 sitemap.xml exakt 1 träff · L4 sex sidor ≥1 guidlänk var · L1 200 ·
L2 404/404. Gränssnittsvakten fortsätter 0 (länken är text i befintlig sektion,
WCAG-klassad stil `text-primary` på kortets botten — kontrast samma som övriga
primärlänkar på ytan; vaktsvepet efter deploy är det mekaniska beviset).

## §7 — Restposter (öppet bokförda)

1. **en/ar-speglar av guiden** — möjlig framtida våg: 2 nya ISR-sidor +
   FAQ-översättning + jsonLD + sitemap-gren. Får ALDRIG lovas i sitemap innan
   sidorna byggs (o146-läran). Bokförs här som kandidat, ej beslut.
2. **Källkods-K3-regex** i sonden är grov (accepterar nyckelns existens, inte dess
   fulla trefaldighet) — förfinas om sonden blir långlivad; nu engångs-EFTER-kvitto.
3. o153 §7:s övriga poster (vaktens "0 funnna"-typo m.fl.) ägs fortfarande av
   spåret, orörda här.

## KVD

src/ ENDAST via Edit/Write · tsc 0 · INGET bygge (prod-synkens ägo, låset respekterat)
· R2 orörd (fakta-länk i befintlig yta, ingen ny publiceringsyta, inga priser)
· data/blogg orörd · syskonytor orörda (främmande smutsighet i trädet lämnad:
motorervalidering-2026-09-02.md, uppdrag-klart.json-deletionen, _s4u3-mtg-kvdfixa.mjs)
· commit med explicit pathspec · pre-commit-grinden bärs (ALDRIG --no-verify).
