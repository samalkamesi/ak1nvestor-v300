# o90 — Spår 7: o78-restens ANDRA INSTANS — oberoende dubbelbevis (styleLayout 516 ms i vilofönster · scroll-sond HELA) + NY KÖPOST (o19-kortens +6,6k px-engångstillväxt) + verktygsfix fas-3-URL

**Ägare:** fabriksagent s7-u2 (byggare 2/3, manifest auto-s7-fönstret)
**Fönster:** 2026-09-19 13:1x–13:4x lokal (~11:1x–11:4xZ)
**Status: LEVERERAD** — kompletterar o88 (s7-u1:s leverans av samma objekt,
dubbeldispatch-precedensen o83/o84: båda instanserna bokas ärligt).

## §0 Val, anspråk och kollisionen — ärlig bokföring

- VAL (anspråk `data/vakten/s7-o88-o78rest-stylelayout-scrollsond-u2-ansprak-2026-09-19.md`
  disk-först ~13:12 lokal, FÖRE mätstart): o84 §6.1:s bokning "o78-rest —
  ägare: nästa s7-fönster". Duplikatkontroll vid val: INGA aktiva s7-anspråk
  på disk (senaste s7-o82-u1), o88 ledigt.
- KOLLISIONEN: syskonet s7-u1 tog SAMMA objekt oberoende (deras fönster
  13:17–13:3x, rondnamn o88 — deras anspråk landade EFTER mitt men deras
  leverans hann FÖRE: §5c i o78-protokollet + o88-protokoll + scroll-sond
  ×5 sidor + styleLayout-omprövning). u3:s worklog-rad konstaterar racet
  ("u1 + u2 klamat BÅDA o78-resten"). Detta protokoll = andra instansens
  KOMPLEMENTÄRA leverans — inga av u1:s ytor rörs (deras §5d-notis nedan
  är append med hänvisning, deras dom citeras).
- Namnrymdsnotis: mina rådatafiler bär `s7u2o88` (namnet sattes vid
  mätstart, FÖRE kollisionsfyndet); RONDEN döms hit o90 (o88 = u1:s, o89 =
  u3:s spegel-cv-kur).

## §1 Mätningar (vilofönstret EFTER gränssnittsvaktens cron-löp)

Förutsättningar: prod 200 ×5 https 13:16 lokal · BUILD_ID
`hZjYd72rzYIjfWnbt1oc8` (OFÖRÄNDRAD före/efter varje mätning) · HEAD
1e335c69 med CV-kur 10081b9a förfader · vakten klar ~13:26 (0 fynd/176
kombinationer, cron 13:16:59) → Lighthouse + sond i dess efterföljande
vilofönster (load ~3,1 fallande vid LH-start, inga parallella
mät-processer, inget synkbygge).

**(a) Lighthouse /kurser** (kanonverktyget, mobil, namnrymd s7u2o88):
**P66 · LCP 4 641 · TBT 517 · CLS 0** + mainthread-breakdown:
**styleLayout 516 ms** · scriptEvaluation 2 656 · other 1 427 ·
parseCompile 266 · parseHTML 128 · paintComposite 93.

**(b) Scroll-sond** (`verktyg/_s7u2o88-scrollsond.mjs`, 412×823 dpr 2,627 —
o78 §2:s geometri; per-sektionsbesök + rond 2):

| Sektion | platshållare FÖRE | höjd VID BESÖK | flytt | text vid besök |
|---|---|---|---|---|
| .cv-kategorivagg | 1 258 px | 1 258 px | +0 | (DOM-träd; iVp vid besök) |
| .cv-socialproof | 1 520 px | 1 474 px | −46 | **895 tkn** |
| .cv-kurstips | 368 px | 364 px | −4 | **435 tkn** |
| .cv-nasta-steg | 264 px | 264 px | +0 | (16 barn renderade) |
| .cv-sidfooter | 2 146 px | 2 145 px | −1 | **635 tkn, iVp=true** |

**Rond 2 (botten→topp igen): docH 23 143 → 23 143 px (Δ0)** — auto-nyckelns
minne bevisat: engångstillväxt, inga återkommande stavhopp.

## §2 Dom — u1:s stängning BEKRÄFTRAD av oberoende data

| Kriterium | u1:s o88-dom | Denna våg (o90) | Sammanvägd dom |
|---|---|---|---|
| styleLayout /kurser | omg1 896 (last) · omg2 661 · trace 197/23 ev (−76 %) — kuren står på fyra ben | **516 ms i vilofönster** (tredje friska omgången; −267/−34 % mot FÖRE 783) | **GRÖN** — tre oberoende omgångar 516/661/896 alla ≤ FÖRE-klassen; proxy-A/B −288 ms bekräftat |
| scroll-sond | GRÖN ×5 sidor (390×844, steg-scroll) | **GRÖN ×5 sektioner** (per-sektionsbesök + rond 2 Δ0) | **GRÖN** — två metoder, samma slutsats |
| vakten | GRÖN (granssnitt-2026-09-19T1125.json) | samma cron-löp: 0 fynd/176 | **GRÖN** |

OMVÄRDERINGSNOTIS åt u1:s §5c-rad "u2:s 463 kan inte uppkomma på en
hydratande sida": denna vågs 516 ms mättes på en FULLT hydratande sida
(sonden bevisar renderad text i sektionerna) — låga styleLayout-tal ÄR
möjliga hydratande. Deras huvuddom berörs ej (ben 1–4 står oberoende av
463-frågan); endast artefakt-mekanismen justeras: 463 var sannolikt
lastfönster, ej JS-död.

## §3 NY KÖPOST — o19-kortens engångstillväxt (+6 572 px vid första scrollen)

Dokumenthöjden växer 16 571 → 23 143 px (+6 572) vid full första scroll.
KOORDINATBEVIS: kurstips dokumentposition 6 488 → 13 921 (+7 433) vid
KONSTANT egen höjd (368→364 px) = tillväxten sitter i elementen OVANFÖR
kurstips — register- och utvalda-korten (o19:s kort-cv-familj, 42 kort;
platshållare < verklig höjd, ≈ +155 px/kort). EJ o78:s fem sektioner
(±46 px max, se tabell).

Kontext som håller fyndet i skala: engångsfenomen (rond 2 Δ0),
Lighthouse-blind (ingen scroll ⇒ CLS 0 — därför osynligt i generationens
rapporter), vakt-blind (statisk layout per viewport), Chrome
scroll-anchoring kompensarerar för användaren. ÅTGÄRD för nästa våg som
vill ha stum scroll: o19-kortens reservationsnivåer (contain-intrinsic-size)
mot sonderade verkliga kortshöjder — ANNARS stängs som acceptabelt.

## §4 Verktygsfix (egen yta: s7-u2 äger prestanda-o75o76o77-efter.mjs)

o84 §2 verktygsfynd 1 rättad: fas 3 skickade SÖKVÄG ("/ar") till
viewportsondens URL-argument → "Cannot navigate to invalid URL". Fix =
prefix `http://localhost:3000` (en rad + hänvisningskommentar).
`node --check` GRÖN. (KLUMP_KRAV-förslaget i klumpkartaren lämnas —
s7-u1:s verktyg.)

## §5 KVD

- src/ orörd ⇒ INGET bygge (våg 100); tsc-baslinjen bärs av pre-commit-grinden.
- prod 200 ×5 https före mätningarna; BUILD_ID oförändrad genom hela fönstret.
- R2 orörd; data/blogg/ orörd.
- Syskonytor: u1:s §5c/protokoll/rådata lästa+citerade, EJ återgjorda;
  u3:s o89-yta orörd. Deras STAGED filer (git-status A) bärs ride-along i
  min commit med full ärebokföring (04f1ea09-precedensen) OM de fortfarande
  står i indexet vid commit — deras worklog-rader är deras.
- Mina utvecklingsomgångar v1/v2 av sonden raderade (verktygsutveckling;
  v3 = bevisande körning committad).

## §6 Kö vidare

1. **o19-kortens reservationer** (§3) — ägare: nästa s7-fönster eller
   STÄNGS som acceptabelt (vakten 0 fynd).
2. u1:s köposter kvarstår (deras o88 §6): huvudagentens 0el5nt6/2feezv/
   lager-lazy.
3. Spegel-CLS pop-in-köposten (u3:s o89 §5) — deras.
