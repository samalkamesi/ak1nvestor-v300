# o565 — BOLAGSSIDORNAS SYSKONLÄNKS-KONTRAKT (spår 8, s8-u2, manifest auto-s8-1790679320397)

**Datum:** 2026-09-29 · **Agent:** s8-u2 (vakt) · **Status:** LEVERERAD
**Relaterade:** o146 (publiceringskontraktet) · o147 (byggdSidaFinns) ·
o148 (bolagsmetadata) · o157 (språkdom) · o559 (dataset-byggsanning — namngav grannposten)

## §0 — PIVOT (ärligt bokförd)

Första valet var döda-länkar-externa (3 nätters FYND-larm utan dom: tsmc DÖD,
nasdaq OUPP ×2, eur-lex OUPP, holmen 500). Under utredningen reserverade
syskonet s8-u1 o570 ("externavaktens 429-mörker — Adlibris+Bokus") = SAMMA
instrumentfil (verktyg/doda-lankar-externa.mjs). Enligt våg 104 (exklusivt
filägarskap; o159/o162-kollisionsprecedensen) vek jag på filen och tog i stället
spårets namngivna grannpost från o559: "grannen /bolag/[slug]:s egna syskonlänkar
(syskonBolag o146) — obevakad samma klass, ej kartlagd denna våg".

Min döda-länkar-domkedja (bevisad, tabell i notisen
data/vakten/auto-s8-1790679320397-s8-u1-notis-doda-lankar-domkedja.md):
tsmc-DÖDEN var sann men REDAN KURAD av r260 (f235d817); kurens nya
nasdaq-URL lever (301→200 browser-UA) men Akamai blockerar crawlerns UA ⇒
TIMEOUT ⇒ OUPPNABAR ⇒ FYND-larm varje natt = instrumentbrus; eur-lex 202
(lever, långsam); holmen 500→200 (transient). Slutsatsen (FYND-klassen idag
≈ 100 % brus, 0 äkta öppna döda) + svitfyndet (testa-doda-lankar-externa.mjs
FINNS — utöka, inte dubblett) lämnades som notis till u1:s våg.

## §1 — KARTLÄGGNING: /bolag/[slug]:s samtliga länkytor

Källor: src/app/(huvud)/bolag/[slug]/page.tsx + src/components/ak1a/bolag-sidor.tsx
(BolagDetaljVy) + målrutternas byggnatur (.next/server/app/).

| Yta | Mål | Byggnatur | Dom |
|---|---|---|---|
| Syskonlistan (syskonBolag) | /bolag/<slug> | force-static + dynamicParams=false | o146-filterrad mot publiceringscachEN — MEN fallbacken (saknad/ogiltig cache) lovar HELA universumet ⇒ **W3-fönster** |
| "Läs vidare"-datasetkortet | /dataset/<bransch> | force-static + dynamicParams=false | **W2: säker genom enkelkälla** — lasBranschMedianer läser bolagsunivers.json DIREKT (samma fil som universumet) ⇒ branscherna kan ej glida isär i ett och samma bygge. Ingen kur; sviten bevakar enkelkällan (R1h) |
| Djupanalyskortet (harDjupanalys) | /analyser/<ticker> | force-static + dynamicParams=false | **W1 ÄKTA**: villkoret läser getAnalyses() LIVE vid ISR-revalidate (24 h) — data-doktrinen levererar analysfiler UTAN deploy ⇒ revalidaterad sida länkade obyggt mål (o146-klassen från bolagssidan) |
| Forskningsöversiktskortet | /forskningsbiblioteket/<ticker> | force-static + dynamicParams=false | **W1 ÄKTA** (samma klass, lasAnalyser()) |
| Statiska (/, /bolag, /kurser, /portfolj-forskning) | — | — | säkra |

FÄRSKT LÄGE VID MÄTNING (deploy df331ae2 byggd 09:37Z, data symmetriska):
322 bolag · 11 branscher · 11/11 dataset byggda · 11 analyser = 11 byggda ·
22 forskningsöversikter = 22 byggda · 0 ticker-missmatchar (fuzzy tickerNyckel
≡ exakt href-mål) ⇒ 0 döda länkmål — kurens aktiveras ENDAST i gap-fönstret
(o559:s definition av en vakt).

## §2 — KUREN (src via Write/Edit, fail-open-doktrin o147/o559)

**W1** — page.tsx: harDjupanalys/harForskningsanalys förlängs med
`&& byggdSidaFinns(\`analyser/${encodeURIComponent(sida.ticker)}\`)` respektive
`forskningsbiblioteket/…`. Utan .next (dev) eller vid sondfel lovar vi som
förut; endast KONSTATERAT obyggt mål håller kortet tillbaka — nästa gröna
bygge släpper in det automatiskt. Fail-open riktning är alltid underlöfte,
aldrig dött löfte.

**W3** — bolags-sidor.ts: syskonBolags filter förlängs med
`byggdSidaFinns(\`bolag/${s.slug}\`)`. Friskt läge (ledger ⊆ bygget) = noll
synlig ändring (ledger-posterna är per konstruktion byggda); ledger borta +
.next lever (städning/återställning) = ärligt gallrade syskon i stället för
hela universumet; dev utan .next = fail-open som förut. o146:s mjuka
degradering (fallback → hela universumet) bevaras ordagrant i
publiceradeBolagSlugs — grinden är ett ANDRA led, inte en ersättning.

**W2** — ingen kur: enkelkällan ÄR säkerheten (bokförd dom, bevakad av R1h).
Att duplicera dataset-familjens grind (o559:s yta) här vore dubbelarbete.

## §3 — BEVAKNINGSSVITEN (verktyg/testa-bolag-syskon-byggsanning-s8.mjs)

DETERMINISTISK-klassen (kor-alla-tester plockar automatiskt): **22 PASS · 0 FAIL**.

- **R1 källkontrakt (11)**: grindarna sitter (R1a-e), o146/o148-kärnorna orörda
  (R1f/R1g/R1i — skrivPubliceradeSlugs, mjuk fallback, force-static-natur),
  W2-enkelkällan (R1h), detaljvyns /bolag-länkar endast själv+syskon-prop (R1j).
- **R2 mekanik-eldprov (5)**: spegel av syskonBolag+byggdSidaFinns mot låtsade
  träd — friskt läge oförändrat (R2a), byggt gap gallrar exakt (R2b),
  **ledger borta + .next delvis ⇒ endast byggda syskon = kurens kärna (R2c)**,
  dev fail-open (R2c2), främmande ledger-slugs + självexklusion (R2d).
- **R3 datakontrakt (6)**: universum läsbart med härledd slug (ticker→slug
  exakt som lib rad ~126), cache ⊆ universum, ticker-paritet (fuzzy ⇒ exakt
  länkmål — annars död länk trots sant villkor), branschsymmetri mot .next,
  analysmål byggbara, cache ⊆ .next.
- **HTTP-sond (info-only, aldrig fejkgrönt)**: standing-prob vart 8:e slug
  (≈41 sidor, 337 unika mål, 0 döda vid leverans) + fullsvep bakom
  O565_FULLSOND=1.

## §4 — BEVIS

- **Fullsvep** (O565_FULLSOND-mönstret, kört vid leverans): 314/322 bolagssidor
  hämtade (tidsbudget 150 s i v1 — honest stop; stående sonds budget 300 s),
  364 unika interna länkmål, **0 döda** ⇒ LEVERANS-GRÖN: varje länkmål på
  bolagssidorna svarar 200; grindarna vakar från nästa deploy.
- **tsc 0** (`node node_modules/typescript/bin/tsc --noEmit`, projektbinär) —
  src berörd (page.tsx + bolags-sidor.ts).
- **node --check** ×2 (svit + poolskript).
- **INGET bygge** — prod-synken äger; kurens effekt aktiveras vid nästa gröna
  bygge (friskt läge = noll synlig ändring).
- **KVD-grinden**: pre-commit passerad (tsc-mekaniskt); commit med -F-fil.

## §5 — RESTPOSTER / KÖ

1. **EFTER-deploy-kvitto**: efter nästa gröna bygge, kör
   `O565_FULLSOND=1 node verktyg/testa-bolag-syskon-byggsanning-s8.mjs` —
   fullsvepet skall förbli 0 döda (grindarna aktiva) och sviten grön.
2. o561:s restposter lever (morgondagens första fulla levande cron-dygn).
3. u1:s o570 äger döda-länkar-instrumentets dom-/botväggsklass (min notis bär
   domkedjan + svitfyndet).
4. Bredare klassfråga (bokförd, EJ verkställd): har ANDRA ytor samma
   "villkor läser live-data men målrutten är byggfrusen"-mönster? Kandidater
   att kartlägga nästa våg: /portfolj-forskning-vyer, /superanalys-widgetens
   bolagslänkar, AI-mentor-kortens länkmål. (o559+o565 täcker dataset+bolag.)

## §6 — KVD

src endast via Edit/Write · INGET bygge · R2 orörd (priser/tier/publicering) ·
data/blogg orörd (endast läst) · crontab endast läst · syskonytor orörda
(u1:s o570-instrumentfil+wrapper orörda; döda-länkar-ytan lämnad med notis) ·
o146/o147/o148/o559:s kurer återanvända OFÖRÄNDRADA (inget eget grind-hjul) ·
commit med pathspec + -F-fil · pre-commit-grinden bärs (tsc 0).
