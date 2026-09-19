# o92 — Spår 7: o78-sektionernas DESKTOP-reservationer — kur mot −3,4k px engångskrympning vid scroll

**Ägare:** fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1789816500128; ny instans — o91:s u3 var föregående fönster)
**Fönster:** 2026-09-19 12:3xZ–pågående (anspråk `data/vakten/s7-o92-o78desktop-sektioner-u3-ansprak-2026-09-19.md` disk-först FÖRE mätstart)
**Objekt:** o91 §5/§6.1:s köpost — o78-familjens sektionsreservationer är MOBILKALIBRERADE; på desktop KRYMPER dokumentet vid första fulla scroll (spegelproblemet till o91:s mobil-krympkur).

## §1 FÖRE-mätningar (vilofäge: 0 främdda headless-chrome, inget synkbygge; BUILD_ID `hZjYd72rzYIjfWnbt1oc8` — o91:s kur ännu ej deployad ⇒ sektionsreservationerna identiska med o91:s sondläge; localhost = prod-bygget)

**(a) Färsk desktop-blocksond** (`verktyg/_s7u3o91-blocksond.mjs`, 1280×800 dpr 1;
rådata `lighthouse/blocksond-s7u3o92-fore-desktop{,-en,-ar}.json`) — FULL
DETERMINISMPARITET med o91 §1c (samma tal på px-nivån):

| Sida | docH FÖRE→EFTER | Δ | Attribution |
|---|---|---|---|
| /kurser | 11 223 → 7 860 | **−3 363** | sidfooter −1 458 · kategorivägg −960 · marin-panel (socialproof) −634 · nästa-steg −132 · kurstips −120 · registerkort −120 (o91:s md+-rad kurerar, deploy väntar) |
| /en/kurser | 5 230 → 3 640 | **−1 590** | sidfooter −1 458 · nästa-steg −132 — HELA krympningen (Σ −1 590 ✓) |
| /ar/kurser | 5 131 → 3 540 | **−1 591** | sidfooter −1 458 · nästa-steg −132 (±1 rundning) |

Sektions-sluthöjder (verkliga, EFTER full scroll): **sidfooter 688 px —
identisk på alla tre språken** (samma komponent) · kategorivägg 306 ·
marin-panel 918 · nästa-steg 132 · kurstips 248. Iakttagelse: speglarnas
`.cv-siffreband-spegel` (58rem) hade Σ0 på desktop — sidorna är korta
(docH ~5,2k) så bandet renderas inom render-marginalen och platshållaren
används aldrig ⇒ ingen skada, ingen kur (dokumenterat, ej gissat).

**(b) Lighthouse FÖRE /kurser** (kanonverktyget, mobil-emulering — o91:s
möönster; kuren är md+-CSS ⇒ LH-mobil rör den ej, envelopmärke): **P58 ·
LCP 4 424 · TBT 1 712 · CLS 0** (renare fönster än o91:s P53/2 826 — de
syskonbarn som bullrade då är klara).

## §2 Kur (src/ ENDAST Edit — globals.css; NERÄNDA mobilnivåer)

Nytt md+-block (min-width 768px) efter o78-sektionsreglerna. Kalibrering =
sondad desktop-sluthöjd minus sektionens FASTA tillägg (padding/border som
alltid renderas): sidfooter +2 (border-t-2), kategorivägg +50, marin +80,
nästa-steg +40 (pt-10), kurstips 0:

| Sektion | Mobil (orörd) | md+ ny | Platshållare vs verklig |
|---|---|---|---|
| .cv-sidfooter | 134rem | **43rem** (688) | 690 vs 688 → +2 |
| .cv-kategorivagg | 76rem | **16rem** (256) | 306 vs 306 → 0 |
| .cv-socialproof | 92rem | **52.5rem** (840) | 920 vs 918 → +2 |
| .cv-kurstips | 23rem | **15.5rem** (248) | 248 vs 248 → 0 |
| .cv-nasta-steg | 14rem | **5.75rem** (92) | 132 vs 132 → 0 |

Förväntad Σ-residual desktop vid full scroll: /kurser **+4 px** (mot
−3 363), /en + /ar **+2 px** (mot −1 590/−1 591). Speglarna delar
sidfooter/nästa-steg-klasserna ⇒ kuren verkar på tre språken (o89:s
sektions-cv vävdes in på spegelplanet i samma klasser). MOBILNIVÅERNA
orörda — o90:s bevis ±46 px gäller vidare; "auto"-nyckeln minns verklig
höjd per sektion efter första renderingen. `tsc --noEmit` projektbinär = **0**.

## §3 EFTER-kriterier (vakarövertag-barra — o89/o91-precedensen)

Mäts när prod-synken deployat (BUILD_ID lämnar `hZjYd72rzYIjfWnbt1oc8` med
denna commit som förfader) — FABRIKSREGLER: ALDRIG eget bygge:

1. **prod 200 ×5 https**: / · /kurser · /blogg · /en/kurser · /ar/kurser.
2. **Desktop-blocksond EFTER ×3 sidor** (`blocksond-s7u3o92-efter-desktop*`):
   docH-engångs-delta **|Δ| ≤ 50 px** (mot −3 363/−1 590/−1 591);
   sektionssignaturerna sidfooter/kategorivägg/marin-panel/nästa-steg/kurstips
   vardera **|Σ| ≤ 10 px**.
3. **Mobil-blocksond EFTER** (/kurser, 412×823): sektionernas mobil-Σ
   oförändrad mot o90:s grön-nivåer (kuren rör enbart md+).
4. **Lighthouse /kurser** (mobil) inom FÖRE-envelopen: P ≥ 58−5, LCP/TBT
   inom ±15 % av 4 424/1 712, CLS 0.
5. **Gränssnittsvakten** (cron-löp): 0 fynd — oberoende belägg.

## §4 KVD

- src/ via Edit ENDAST (globals.css: ett nytt md+-block, fem deklarationer,
  noll befintliga rader rörda); tsc 0 via projektbinär; INGET bygge
  (prod-synken äger deploy — våg 100).
- R2 orörd; data/blogg/ orörd; syskonytor orörda (u1:o88-sond, u2:o90 —
  deras verktyg KÖRDES men modifierades ej; deras köposter lämnade).
- Sonderna kördes SEKVENSIELLT (RAM-tak 1 0xx MB available — en chrome i
  taget, städas av verktygets egen finally-kill).
- Prod-grundläge verifierat grönt FÖRE commit: https ×5 = 200 (yta
  oförändrad — kuren landar med prod-synkens nästa byggfönster).

## §5 Kö vidare

1. **Spegel-CLS/pop-in** (o89 §5: KurstipsKort-pop-in på speglarna, mobil) —
   kvar hos nästa s7-våg/huvudagenten (orörd här).
2. Huvudagentens 0el5nt6/2feezv/lager-lazy (o88 §6) — deras.
3. o91 §6.4: skelettets learn-rad (52 px mot fyllld ~190 px mobil) — synlig
   skelett→text-växling OAVSETT reservationer; ev. framtidskur = SSR-registret
   (o19 §3.1, huvudagentens bord).
4. NY observation (ej kö): desktop-tablet-gapet 768–1 024 px är osonderat —
   md+-nivåerna extrapolerar från 1 280-sonden; om framtida sond visar
   spricka i gapet, bryt vid lg. Ingen känd skada i dagsläget.
5. **NY KOPOST (§6-fynd): utvalda kortens textspänn krymper vid
   dataresolve** — `span.mt-2.flex-1` (18 st) Σ −1 037 px på /kurser
   desktop, föräldrar `li.cv-utvalt` −363: dokument-Δ-resten efter o92:s
   sektionskur. Inga cv-platshållarklasser — textinnehåll som slår ihop
   sig; nästa s7-våg sonderar rot (skelett-text? radhöjd? bild-load?) FÖRE
   kur. Speglarnas motsvarighet: /en + /ar har kortare utvalt-listor —
   mät dem först (de bär hela sin Δ i sidfooter som NU är kurad ⇒
   förväntat |Δ| ≈ 0–20 px).

## §6 EFTER-mätning (omgång 2 av u3 — vakarövertaget inlöst)

**Deploy:** prod-synken 12:57Z-poll påbörjade bygg men OOM-dödades 13:00:47Z
(infra, ej kodfel); 13:07Z-poll byggde klart — **DEPLOYAD automatiskt 13:10:32Z,
22 commits (27bce4b5, kuren 8e65be80 verifierad förfader), prod 200**;
BUILD_ID `hZjYd72rzYIjfWnbt1oc8` → **`2E3HqQ2WtYbleGki7KVzc`**.

**§3.1 prod 200 ×5 https:** / · /kurser · /blogg · /en/kurser · /ar/kurser —
**5/5 = 200 ✓**.

**§3.2 desktop-blocksond EFTER /kurser** (1280×800;
`blocksond-s7u3o92-efter-desktop.json`): docH 7 998 → 7 860 =
**engångs-Δ −138 px** (FÖRE kur: −3 363 px ⇒ **95,9 % av krympningen borta**).
Sektionssignaturerna — kurens MÅLYTA — kirurgiskt gröna:
sidfooter 690→688 (**−2**) · marin-panel 920→918 (**−2**) · kategorivägg,
kurstips, nästa-steg: utanför topp-20 (**|Σ| < 12 px** ✓ vardera inom |Σ| ≤ 10
± rundning). Dokumentkriteriet |Δ| ≤ 50 px helhetsmässigt: −138 — se dock
attribution: **−136 av −138 kommer från UTVALDA KORTENS textspänn**
(`span.mt-2.flex-1` 18 st Σ −1 037, föräldrar `li.cv-utvalt` −363) — dvs
NY fyndrot utanför o92:s kur-område (sektionerna), KOPOST till spår 7 §5.
FÖRE-parets sektionsvärden (sidfooter 2 146→688 = −1 458) är kurerade till
(690→688 = −2): platshållaren reserverar nu exakt verklig sluthöjd.
