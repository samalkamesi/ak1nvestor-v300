# O159 — BOLAGSFAMILJENS PRESTANDAJUNGFRUMARK: första baslinjen + cv-kur av /bolag:s tabellmonster (Spår 7, s7-u2)

Datum: 2026-09-24 ~12:3x–14:3x lokal · Fabriksagent s7-u2 (byggare 2/3,
manifest auto-s7-1790249713381). Anspråk disk-först FÖRE all mätning
(`data/vakten/auto-s7-1790249713381-s7-u2-ansprak.md` 13:42 lokal);
nummerreservation o159 i protokollnummer.json under flock (klaim-mtime
respekterad av syskonet u3:o160 — deras vik bokförd i deras protokoll).

## §0 VAL (duplikatkontroll klar)

- Klassiska ytor stängda sedan länge: bildoptimering (o66 §7.2/o101) ·
  cache-headers (o10/o13/o66/o70) · koddelning (o27/o119/o121) · 52px-
  läsbarhet (o8 ×4 + o123 + o126/o127/o128 + o131/o137) · CV-kalibrering
  (o129/o138/o150 + o150-EFTER) · cv-widget (o139/o144) · natt-TBT-metrologi
  = u1:s PÅGÅENDE o158 (deras anspråk lästes FÖRE valet; deras yta).
- u3:o160 (deploy-kvittret av dagens 41-commits-bygge): /superanalys,
  /kalkylator, /konfluens, /kurser — disjunkt mot mina ytor.
- v160-brandingspårets ytor (huvudagenten, idag 09:2x–10:5x): analyser/,
  fas2/fas3, kalkylator, konfluens, kurser, labb/, logga-in, medlemskap,
  manifest, netnet, om-oss, portfoljbyggare, prenumeration, privacy,
  cookiepolicy, pro/*, profil, vagfundament — mina ytor orörda (kontrollerat
  mot v160:s pathspec).
- **Objektet**: de publika ytor som tillkommit/ändrats sedan o137 (21 sep)
  utan att NÅGONSIN mätas: /data/nyckeltalsguide (våg 87:s guide, live 200)
  + /bolag + /bolag/eqnr-ol (våg 149:s bolagsfamilj). Grep i OPTIMERING =
  0 LH-filer för alla tre (endast s8:s SEO-arbeten rört dem).

## §1 FÖRE-baslinje (kanoniska verktyget, mobil-4G)

`verktyg/prestanda-lighthouse.mjs o159-fore` — alla tre jungfruliga,
bygge a2c9d663 (deployat 09:41:47Z enligt u3:o160 — aktuellt träd),
RAM ≥ 1 809 MB vid varje körning:

| sida | poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| /data/nyckeltalsguide | 56 | 4 434 | 1 424 | **0** |
| /bolag | **42** | **6 105** | **4 324** | **0** |
| /bolag/eqnr-ol | 55 | 4 691 | 1 231 | **0** |

CLS 0 ×3 — den heliga nivån (o100) hålls av jungfruliga ytor. /bolag är
ANOMALIN: 3× syskonens TBT i SAMMA lastfönster (o139:s argumentation för
parad sond inom samma lastläge).

## §2 52px-tappyte-sonden (o126-mönstret, mobil 390×844)

`verktyg/_s7u2o159-tapsond.mjs` → `tapsond-o159-bolagsfamiljen-mobil.json`:
- /data/nyckeltalsguide: 55 interaktiva · 1 under 52×52 ("Villkor" 32×14)
- /bolag: 322 · 8 (Villkor + 7 smala bolagsnamn 40–51×16)
- /bolag/eqnr-ol: 79 · 1 (Villkor)

DOM: **0 KONTROLLFYND** — pill:ar/tabbar/knappar håller 52px-policyn.
Resterna är inline-textlänkar: footer-länkar (rad med ·-separatorer) och
tabellnamnslänkar — WCAG 2.5.8:s inline-undantag gäller, radavstånd
py-2.5 ≈ 44 px mellan rader ≥ 24 px-kravet. Ingen läsbarhetskur — policy
grön, undantagen bokförda (o92-andan: mäta först, justera vid brott).

## §3 Rotanalys av /bolag:TBT 4 324 (LH-auditerna)

- DOM 2 166 element (dom-size-insight); 13 sektioner varav 10 bransch-
  tabeller à 17–38 rader (256 bolagslänkar totalt).
- Long tasks 20 st, topp 747/726/672 ms. Attribuering: "bolag"-chunken
  (sidans egen) 672+329+295+282+267 ≈ 1 845 ms + ramverkschunk 2feezv
  726 ms + appchunk 095w8h 747+380 ms. Bootup 5,1 s; Script Eval 4 565 ·
  Style & Layout 2 710 ms.
- **Klass = o139:s monster-layout**: hydratiserings-layout av stora
  tabellträd. Payload oskyldig (596 KiB total, unused-JS 22 KiB).
  Ramverksdelen är basal (o139: framework-eval, koddelning stängt) —
  den KURBARA delen är Style & Layout.

## §4 Geometri-sond + kalibrering (o129/o139-disciplinen)

`verktyg/_s7u2o159-geometri.mjs` → `geometri-o159-bolag-mobil-desktop.json`:
mobil 390: sidhöjd 18 974 px, 13 sektioner, median 1 392 px; desktop 1280:
14 260 px, median 1 065 px. Linjär anpassning höjd≈A+B·rader ger residualer
±250 px (radhöjd beror på namn-wrapning, inte bara rader) ⇒ per-sektion
EXAKTA platshållare är omöjliga i förväg — lösningen är auto-ledet
(§5) + estimerad reservation per sektion.

## §5 Kuren — .cv-bolagsektion (o139-precedensen, mobil ≤640 px)

- `src/app/globals.css`: `@media (max-width: 640px) { .cv-bolagsektion
  { content-visibility: auto; contain-intrinsic-size: auto var(--cv-h,
  87rem); } }` — 87rem = median-fallback 1 392 px.
- `src/components/ak1a/bolag-sidor.tsx` (BolagIndexVy): tabellsektionerna
  bär klassen + per-sektion `--cv-h` ur radantalet (höjd ≈ 68,6·rader −
  300 px, 0,25rem-rutnät, klamp 320 px) — sondkalibrerad; textsektionerna
  (läsguide/disclaimer/CTA) förs utan cv.
- tsc 0 (projektbinär). INGET bygge — prod-synken äger deployen.

## §6 Bevis: verkan + A/B-par (o129 §4-metodiken, inget bygge)

**Verkansdetalj** (`_s7u2o159-cvdetalj.mjs` → `cvdetalj-o159-bolag.json`):
med kur-CSS (injicerad på prod-DOM via section:has(> div.overflow-x-auto))
fick alla 10 tabellsektionerna computed cv=auto; sektion 2–9 bär EXAKT
1 392 px-platshållaren; sidhöjd 18 922→17 438 px; textsektionerna orörda —
selektorn kirurgisk.

**A/B-par** (`_s7u2o159-ab.mjs` → `ab-o159-bolag-cv.json`; CPU 4x + NET
150 ms, alternerande, ny target per omgång — B:s injektion kan aldrig
läcka in i nästa A; varje B-omgång SJÄLVVERIFIERAR cvAuto=10 +
platshållare 8/10):

| par | A fönster-TBT | B fönster-TBT | Δ |
|---|---|---|---|
| 1 (a3/b3) | 526 ms | 277 ms | **−47 %** |
| 2 (a4/b4) | 693 ms | 133 ms | **−81 %** |

FCP opåverkad (±8 ms) — LCP-kandidaten (H1/headern) ligger ovanför
sektionerna. Medianvinst −64 % — i nivå med o139:s cv-widget (−51 %).

## §7 Metrologi-läxor (bokförda för spåret)

1. **CDP Target.*-domäner kräver BROWSER-ws** (/json/version) — page-ws
   (/json) avfärdar sessioner TYST (alla svar nollhöjder). o143-sonden
   (som fungerar) ansluter via /json/version.
2. **Page.addScriptToEvaluateOnNewDocument kan köra FÖRE documentElement
   finns** i Chrome 153 — appendChild misslyckas då tyst (try/catch-svall);
   robust mönster = pollningsfallback-skript (min INJEKTION) ELLER
   post-load-injektion när initial-layout inte mäts.
3. o143-sondens SOND_INJECT_CSS-körningar b1/b2 (sond-o143-o159-ab-b1/b2)
   = verkan EJ verifierbar i deras rapportstruktur — deras tal redovisas
   som laststämplade referenser; bevisbördan bärs av §6:s självverifierande
   par. (o139:s original-bevis hade A/B-separation −51 % = deras injektion
   verkade då; läxa 2 är en möjlig förklaring till dagens svaga separation.)

## §8 KVD

- src/ RÖRD via Edit/Write endast (2 filer) · tsc 0 projektbinär · INGET
  bygge (deploy = prod-synkens ropkedja; HEAD-committen är kanalbeviset).
- R2 orörd · data/blogg/ (live) orörd · data/blogg-utkast/ orörd.
- Syskonytor orörda: u1:s o158 (natt-TBT-instrumentet), u3:s o160-filer,
  u3:s o159→o160-vik läst och respekterad; främmande smutsighet
  (data/rapporter/motorervalidering-2026-09-02.md) lämnad orörd.
- Mätningar: RAM ≥ 1 509 MB vid varje Chrome-start; sekventiella körningar;
  kanoniska verktyget KÖRT endast (o143-sonden omodifierad).

## §9 EFTER-vakarövertaget (när DEPLOYAD med denna commit som anfader)

1. `grep DEPLOYAD data/vakten/prod-synk.log | tail -1` + `git merge-base
   --is-ancestor <denna-commit> <deployad>` = SANT.
2. Kanalbevis: deployad CSS-chunk innehåller `.cv-bolagsektion` och
   serverad /bolag-HTML bär klassen + --cv-h per sektion.
3. `node verktyg/prestanda-lighthouse.mjs o159-efter /data/nyckeltalsguide
   /bolag /bolag/eqnr-ol` — dom: CLS 0 ×3 (heligt) · /bolag TBT väsentligt
   under 4 324 (A/B-span −47…−81 % ger väntat ~900–2 300) · LCP ±15 %
   · poäng ≥ baslinje.
4. Skroll-CLS-sond på /bolag (o144:s mönster) — platshållar-reservationerna
   FÅR INTE ge synliga stavhopp vid bottenrullning.
5. Bokför facit här + i worklog; vid brott: justera --cv-h-formeln
   (68,6·rader−300) mot uppmätt median (o150-andan).

## §10 Kö vidare i spåret

- o120 /blogg kall-TBT-arkitekturpost (produktnivå, ej fabriksautonom).
- u1:o158:s steg 2b + natt-cronens första tysta dom äger TBT-slutet.
- o138 §6.1 villkorad ar-mikrojustering — STÄNGD av o150-EFTER (PASS).
- Desktop-cv för /bolag (mediana 1 065 px) — utvidgning först om
  desktop-LH nånsin mäts (o139:s mobil-avgränsning gäller).
