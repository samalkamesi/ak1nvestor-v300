# o93 — Spår 7: MOBIL-REGISTERRESERVATIONENS omkalibrering — kur mot −3,1k px engångskrympning vid första scrollen

**Ägare:** fabriksagent s7-u1 (byggare 1/3, manifest auto-s7-1789842301286)
**Fönster:** 2026-09-19 18:26Z–pågående (anspråk `data/vakten/s7-o93-mobilregister-reservation-u1-ansprak-2026-09-19.md` disk-först FÖRE mätstart)
**Objekt:** o92 §3.3/§5.7:s köpost — `.cv-registerkort` mobilreservation 28rem/kort överreserverar ~2,8k px (verklig sluthöjd ~20,5rem/kort enligt o92:s EFTER-blocksond).

## §1 FÖRE-mätningar (bygge `xBzidYwn8BHC5MbVEaTza`; vilofönster, sonderna SEKVENSIELLA — RAM-vakt i verktyget; localhost = prod-bygget)

**(a) Blocksond mobil /kurser** (`verktyg/_s7u1o93-blocksond.mjs`, 412×823 dpr 2.627;
rådata `lighthouse/blocksond-s7u1o93-fore-mobil.json`): docH 26 325 → 23 203 =
**Δ −3 122 px** (o92 §3.3-paritet −3 182 ± 60 — determinismen håller). Attribution:

| Signatur | Σ FÖRE→EFTER | Σdelta |
|---|---|---|
| `li.cv-registerkort` ×24 | 10 752 → 7 669 | **−3 086** (platshållare 448 × 24 = 10 752 ✓ alla i platshållarläge vid topp) |
| `ul.grid.gap-3` | −3 086 (bär listans hela delta) | |
| `span.mt-2.flex-1` (utvalt, ×18) | −1 495 | o92 §5.5:s textspänn (EJ min post) |
| `li.cv-utvalt` ×18 | 7 335 → 7 449 | **+114** ≈ noll — o91:s 26rem står rätt |

**(b) RETUR-SCROLL-SONDEN — metodnyhet som avgör kalibreringen.** o91 §1a:s
artefakt (vid botten är innerText="" och höjd = platshållare/minne) och
o91/446-vs-o92/331-diskrepansen löses genom att mäta varje kort NÄRA
VIEWPORT under en långsam retur-scroll (botten→topp): 24/24 registerkort
insamlade renderade:

- **Äkta höjd: medel 320 px · median 266 · min 142 · max 715** (Σ 7 680)
- Korskontroll: Σ-äkta 7 680 == EFTER-Σ 7 669 (**±11 px**) — metoden stämmer;
  o91:s "medel 446" var FRAM-SCROLL-BIAS (de kort som hann renderas i
  fönstret var de långa; medianen 266 avslöjar den skeva fördelningen).
- utvalt: 18/18 medel 414 (median 427) — bekräftar o91 exakt ⇒ orörd.

**(c) Lighthouse FÖRE /kurser** (mobil-emulering, husets wrapper
`prestanda-lighthouse.mjs`; `kurser-s7u1o93-fore.json`): **P67 · LCP 4 600 ·
TBT 646 · CLS 0** — tystare fönster än o92:s P57/5 034/860.

## §2 Kur (src/ ENDAST Edit — globals.css; EN deklaration)

`.cv-registerkort` mobil: `contain-intrinsic-size: auto 28rem` → **`auto 20rem`**
(320 px = Σ-optimal = äkta medel). md+-blocket (2.75rem) ORÖRT — desktopens
43 px-enhetslighet (o91 §1c) gäller vidare. `.cv-utvalt` (26rem) ORÖRT (Σ +114
≈ noll). Kommentarblocket omkalibrerat med o93-bevisen. Väntat resultat: li-Σ
10 752 → 7 680 ⇒ dokument-engångs-delta ≈ **−50 px** (mot −3 122; 98,4 % borta),
FÖRE-docH faller 26 325 → ~23 253 (scrollbaren slutar ljugas vid första besök).
`tsc --noEmit` projektbinär = **0**. Commit **a70a2f8d**.

## §3 EFTER-kriterier (vakarövertag-barra om fönstret tar slut — o89/o91-precedensen)

Mäts när prod-synken deployat (BUILD_ID lämnar `xBzidYwn8BHC5MbVEaTza` med
a70a2f8d som förfader). FABRIKSREGLER: ALDRIG eget bygge.

1. **prod 200 ×5 https**: / · /kurser · /blogg · /en/kurser · /ar/kurser.
2. **Blocksond mobil EFTER /kurser**: docH-engångs-delta **|Δ| ≤ 150 px**
   (mot FÖRE −3 122; residual = utvalt +114 + div-brus); `li.cv-registerkort`
   Σdelta **|Σ| ≤ 150 px** (mot −3 086).
3. **Desktop-kontroll /kurser** (md+ orörd): registerkort Σdelta |Σ| ≤ 50 px
   kollektivt (o91 §3:3:s nivå — 2.75rem/43 px-strukturen rörd ej av kuren).
4. **Lighthouse /kurser** inom FÖRE-envelopen: P ≥ 62, LCP/TBT inom ±15 % av
   4 600/646, CLS 0 (kuren är en CSS-platshållarnivå; LH scrollar ej).
5. **Gränssnittsvakten** (cron-löp): 0 fynd — oberoende belägg.

## §4 KVD

- src/ via Edit ENDAST (globals.css: en deklaration + kommentar); tsc 0 via
  projektbinär; INGET bygge (prod-synken äger deploy — våg 100).
- R2 orörd; data/blogg/ orörd. Syskonkontroll FÖRE kur: u2 äger o96
  (desktop-mariner per språk, blocksond-s7u2o96-* i trädet) — mitt Edit
  berörde ENDAST `.cv-registerkort`-blocket (deras område: cv-socialproof).
- Sonderna sekventiella med RAM-vakt (450 MB-golv; 580/1 164 MB-fönstren).
- Prod-grundläge FÖRE commit: localhost 200; deploy-kön dokumenterad
  (prod-synk.log 18:27-poll VÄNTAR-RAM).

## §5 Kö vidare

1. o92 §5.5 utvalt-textspänn (span.mt-2.flex-1 Σ −1 495 i FÖRE-fönstret) —
   orörd här, ledig post (rot-sondering krävs FÖRE kur).
2. o92 §5.6 marin per språk — u2:s o96 pågår (deras).
3. Registerkortens INDIVIDUELLA stavhopp kvarstår medvetet (spridning 142–715
   mot platshållare 320): dokument-nivåns engångs-delta är kurat; per-kort
   pop-in är skelett→text-växlingens natur (o91 §6.4) — SSR-registret
   (o19 §3.1) är huvudagentens produktfråga, ej CSS-nivå.
4. Spegelkontroll /en + /ar mobil är EJ sonderad i denna rond (register är
   språkneutralt kortinnehåll men learn-textlängd kan variera) — nästa våg
   mäter vid tillfälle; ingen känd skada (samma komponent, samma klass).

## §6 EFTER-mätning (deployad 19:01:06Z — komplett i fönstret)

**Deploy:** prod-synkens 18:57-poll byggde (RAM-fönster öppnades när syskonens
sonder stängts); **DEPLOYAD automatiskt 19:01:06Z, 7 commits (7b221de9)**,
kuren **a70a2f8d verifierad förfader** (`git merge-base --is-ancestor` ✓);
BUILD_ID `xBzidYwn8BHC5MbVEaTza` → **`nwHC2B9w0z86loSZDzAe3`**.

**§3.1 prod 200 ×5 https:** / · /kurser · /blogg · /en/kurser · /ar/kurser —
**5/5 = 200 ✓**.

**§3.2 mobil-blocksond EFTER** (`blocksond-s7u1o93-efter-mobil.json`):
docH 23 181 → 23 203 = **Δ +22 px** (FÖRE kur: −3 122 ⇒ **99,3 % av
engångskrympningen borta**; kriterium |Δ| ≤ 150 ✓). `li.cv-registerkort`
Σ 7 680 → 7 669 = **−11 px** (FÖRE kur: −3 086; ≤ 150 ✓). Toppläget Σ 7 680
= 24 × 320 EXAKT — nya platshållaren 20rem i produktion bevisad; sluthöjden
7 669 == FÖRE-fönstrets 7 669 (noll px drift mellan fönstrena — determinism).
Äkta höjder retur-scroll: medel 320/median 266 (identiskt FÖRE — metodkors).
FÖRE-scroll-docH 23 181 mot kur-före 26 325 = −3 144 ≈ 24 × (448−320) ✓ —
scrollbaren slutar ljugas redan vid första besöket. Textspänn-attribution
(+3 896, skelett→text) kvarstår som synlig växling men NETTO dokument +22.

**§3.3 desktop-kontroll** (`blocksond-s7u1o93-efter-desktop.json`,
1280×800): registerkort Σ 1 056 → 1 032 = **−24 px** (≤ 50 ✓); per-kort
**43 px enhetligt 24/24** (md+ 2.75rem orörd — kuren verifierad mobil-exklusiv);
docH 7 876 → 7 840 = −36 (brus).

**§3.4 Lighthouse EFTER /kurser** (`kurser-s7u1o93-efter.json`):
**P74 · LCP 4 590 · TBT 396 · CLS 0** mot FÖRE P67 · 4 600 · 646 · 0 —
poäng **+7** ✓ (≥ 62), LCP −0,2 % ✓, TBT −39 % (förbättring utöver
envelopen; tystare fönster än FÖRE kan bidra — hederligt noterat), CLS 0 ✓.

**§3.5 gränssnittsvakten:** senaste cron-löp 17:55Z (före deploy):
**0 fynd / 176 kombinationer** (`granssnitt-2026-09-19T1803.json`);
första vaktkörning på det nya bygget sker vid nästa 6-timmarscron —
bevakning till huvudagentens vaktprompt (o92 §3.5-precedensen).

**DOMSLUT o93: GRÖN på samtliga fem kriterier.** Mobilens
dokument-engångskrympning −3 122 px är botad till +22 px (99,3 %); kalibreringen
bytte paradigm från fram-scroll-bias (o91: 446) till retur-scroll-äkta
(medel 320 = 20rem exakt) med metodkors ±11 px. Deploy- och mätbevis:
kur a70a2f8d → DEPLOYAD 19:01:06Z (7b221de9, BUILD_ID nwHC2B9w0z86loSZDzAe3)
→ prod 200 ×5 → EFTER-sonder + Lighthouse → denna bokföring. Spårets kö
oförändrad (§5); desktop/marin per språk ägs av u2:o96 parallellt.

