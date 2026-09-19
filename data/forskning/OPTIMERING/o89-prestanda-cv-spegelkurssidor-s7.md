# o89 — PRESTANDA: CV-täckningen på spegelkurssidorna (/en/kurser + /ar/kurser) — spår 7, s7-u3 3/3 [fabrik]

Datum: 2026-09-19 (11:24–11:5xZ). Anspråk disk-först:
`data/vakten/s7-o89-cv-spegel-kurstips-u3-ansprak-2026-09-19.md`
(11:24:30Z — gitignorerad väg, på disk).

## §0 Val + duplikatkontroll + race

- OBJEKT: o78 §6:s explicit lämnade rest — "(en)/(ar)-kursernas KurstipsKort
  saknar wrapper-klass". Genomgång av spegelfilerna visade dessutom att
  siffrebandet (SocialProof-ekvivalenten, ~7 100–7 300 px under vecket)
  saknade cv helt medan svenska /kurser fått `.cv-socialproof` — samma
  gapklass på samma sidor, större vinst. Båda delarna tas här (anspråkets
  formulering "samma under-vecks-skydd som (huvud)/kurser" täcker helheten).
- RACE-KONTEXT (ärligt bokförd): syskonen u1 (11:17Z, "o78-rest") och u2
  ("o88 stylelayout-scrollsond") klamat BÅDA spårets andra öppna post
  (o78-resten = /kurser-mätningen) — deras kollision, ej min; mina ytor
  (spegelfilerna + o89-namnrymden) är disjunkta från båda. Chromekullen
  11:20–11:25Z = syskonmätning; mitt FÖRE-fönster togs EFTER den (se §1).
- LÄMNAT: 2feezv/0el5nt6/lager-lazy/react-trädbantning (huvudagentens);
  bildoptimering/koddelning/läsbarhet/cache/prefetch/CLS-rot//blogg
  (stängta ytor); verktygs-URL-fixen (bokad åt verktygsägaren).

## §1 FÖRE-mätning (rent fönster)

Fönster: pollare `_s7u3o89-fonster.mjs` (chrome 11 → 0 kl 11:25:48Z, inget
synkbygge, BUILD_ID **hZjYd72rzYIjfWnbt1oc8** = 7d690be6-trädet — innehåller
o75–o84-kurerna men EJ s5-u3/s6-innehållet i HEAD). Prod 200. Last
1,29–1,67 fallande under mätningen. Lighthouse via kanonverktyget
(`prestanda-lighthouse.mjs s7u3o89-fore /en/kurser /ar/kurser`):

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| /en/kurser | P50 | 4 688 ms | 1 694 ms | **0,1212** |
| /ar/kurser | P50 | 4 451 ms | 1 920 ms | **0,1518** |

(LCP/TBT inom den friska envelopen P50–57/LCP 4,2–5,1 s — CLS se §5.)

Spegelsond (`prestanda-o89-spegelsond.mjs fore`, mobil 412×844,
spegelsond-o89-fore.json):

| Yta | /en/kurser | /ar/kurser |
|---|---|---|
| kurstips-wrapper (klass) | mt-6 — ingen cv | mt-6 — ingen cv |
| kurstips top/höjd | 596 / 364 px | 524 / 344 px |
| kurstips under vecket? | **NEJ** (synlig vid last) | **NEJ** |
| siffreband klass | ingen cv | ingen cv |
| siffreband top/höjd/barn | 7 282 / **958** px / 25 | 7 096 / **909** px / 25 |
| dokumenthöjd / höjddrift vid scroll | 10 682 / 217 px | 10 447 / 100 px |

## §2 Läsning av läget

- Kurstips på speglarna sitter HÖGT (top 524–596 px < 844 px vy) — cv där
  ger marginell lastvinst (elementet är synligt = renderas ändå); värdet
  är paritet med /kurser + skip vid scroll-förbi. Ärligt bokfört.
- Siffrebandet är den riktiga ytan: ~7 100–7 300 px under vecket, 958/909
  px, 25 element — oskyddat på båda speglarna.
- Svenska `.cv-socialproof` reservation (92rem = 1 472 px) passar INTE
  speglarna: deras band är kortare (958/909 px mot svenskans 1 474 px) —
  92rem vore +500 px platshållaröverskott = stavhopp när bandet renderar
  vid scroll (strider mot o78:s "reservation ≈ mätt höjd"-garanti).

## §3 Kur (5 filer, Write/Edit)

1. `(en)/en/kurser/page.tsx` — kurstips-wrappern + `cv-kurstips`;
   siffrebandets section + `cv-siffreband-spegel` (spegelkalibrerad).
2. `(ar)/ar/kurser/page.tsx` — samma två (ar-kommentarer på ar-språk).
3. `globals.css` — ny klass `.cv-siffreband-spegel`
   { content-visibility: auto; contain-intrinsic-size: auto 58rem; }
   med dokumentation. 58rem = 928 px: maxavvikelse 30 px mot sonderade
   höjder (en 958/ar 909) — minsta max-felet för en gemensam klass;
   "auto"-nyckeln lär sig verklig höjd efter första renderingen.
   Kurstips återanvänder `.cv-kurstips` (23rem = 368 px mot 364/344).
- Komponentroten (kurstips-kort.tsx) ORÖRD — o78:s avgränsning mot
  min-sida/larplan respekteras; klasserna vävs på spegelns sidnivå.
- `tsc --noEmit` via projektbinär = **0** (11:4xZ).

## §4 Deploy + EFTER-kriterier (vakarövertag-barra)

Commit i trädet; prod-synken bygger när RAM-grinden öppnar (11:17Z:
VÄNTAR-RAM 1 433 < 2 800 MB, 2 zcode-barn — o63/o75/o77/o78-precedensen).
EFTER mäts när BUILD_ID lämnar hZjYd72rzYIjfWnbt1oc8 med min commit som
förfader; kriterier:

1. prod 200 ×5 https: /, /kurser, /blogg, /en/kurser, /ar/kurser.
2. Sond EFTER: båda wrapperna bär cv-kurstips, båda banden
   cv-siffreband-spegel; computed content-visibility "auto" +
   contain-intrinsicSize satt; bandets platshållare INTE förbränd
   (verklig höjd vid scroll ≈ 958/909 ± 40 px, text ≥ 500 tecken);
   höjddrift ≤ FÖRE-nivån (217/100 px).
3. Lighthouse speglarna i jämförbart fönster (chrome=0, deklarerad last):
   poäng/LCP/TBT inom FÖRE-envelopen med fönsterbrus förklarat. CLS
   förväntas förbli pop-in-betingat (§5) — ATTRUERAS separat, kur-facit
   är de strukturella kriterierna + styleLayout-riktning (bandets 25
   element + underliggande footer-stack hopar renderingspasset).

## §5 FYND: speglarnas CLS 0,12–0,15 = KurstipsKort-pop-in (NY KÖPOST)

Lighthouse layout-shifts pekar ENTYDIGT på KursSok-sökväggen ("443
courses · 27 categories…" / "443 دورة · 27 فئة…") som skjuts ned när
KurstipsKort fylls vid hydratisering (klientkomponent: tomt första passt,
+364 px vid useEffect — högt på sidan på speglarna, allt nedanför knuffas).
Window-känsligt: o75:s FÖRE (load 0,66) och o84:s 06:03-generation såg
CLS 0; detta fönster (load ~1,3, 443-kurs-DOM) fångar fyllningsknuffen.
MIN KUR RÖR DEN EJ (onscreen cv renderas normalt; tom div har ingen
platshållare). Kandidatkur för nästa våg: SSR-renderade tips ELLER
min-höjds-golv på wrappern — rör kurstips-kort.tsx (delad med
min-sida/larplan, o78:s avgränsning) → bokas som köpost, ej scope-kryp här.

## §6 Rest + läxor

- Köpost §5 (spegel-CLS/pop-in) — ägare: nästa s7-våg (eller huvudagenten
  om komponentroten väljs).
- Sondens första körning föll på två egna buggar (template-literal-rymd:
  bandAria ointerpolerad → ReferenceError; utfil hardcodad "en") — böjd
  syntax + undantagsloggning + gemensam utfil; läxa: testa evaluate-uttryck
  med en trivial körning FÖRE mätfönstret förbrukas.
- Desktop-reservationerna följer "auto"-nyckeln (o78 §6 gäller även här).

## §7 Metod och ärlighet

- FÖRE togs i maskinellt verifierat vilofönster (pollare: 0 chrome, inget
  bygge, BUILD_ID vaktad); Lighthouse via projektets kanonverktyg; sonden
  egen (CDP, inga npm-paket), ankarade på rubriktext + aria-label (stabla
  genom kuren eftersom klasser läggs till, ankaren oförändrat).
- Byggfönster-F2-fällan träffad och avvärjd: syskonprocessernas argv
  innehåller "npm ci"-text — pollaren exkluderar zcode-argv (o75 §0:s
  läxa tillämpad).
- Inget eget bygge; deploy ägs av prod-synken (våg 100-regeln).
