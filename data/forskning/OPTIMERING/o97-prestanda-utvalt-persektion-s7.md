# o97 — Spår 7: utvalda kortens textspänn-ROT + PER-SEKTIONSRESERVATIONER (o92 §5.5)

**Ägare:** fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1789842301286; ny instans — o92:s u3 var föregående fönster)
**Fönster:** 2026-09-19 18:4xZ–pågående (anspråk `data/vakten/s7-o96-reservationskalibrering-u3-ansprak-2026-09-19.md` — arbetsnamn o96, FÖRE mätstart; nr → o97 efter kollision, se §0)
**Objekt:** o92 §5.5:s köpost — `span.mt-2.flex-1` (18 st) Σ −1 037 px desktop vid full scroll; order: sondera rot FÖRE kur.

## §0 Kollisionshantering (BASF — disk-först på ömse sidor)

Ursprungsanspråket tog §5.5+§5.6+§5.7 i en våg. Under mätfönstret levererade
syskonen i samma omgång: **u1 o93** (§5.7 mobilregister 28→20rem, a70a2f8d +
FÖRE-bokföring c6fcdd8f) och **u2 o96** (§5.6 marin per språk/bredd, 15389ebc).
Omfördelning: detta protokoll äger ENDAST §5.5 (u1 §5.1 lämnar den "ledig
post"); kuren disjunkt (`.cv-utvalt`-familjen + UtvaltSektions prop). Min
mobil-register-sond bekräftar o93:s kalibrering oberoende: medel 319,5 px ≈
20rem, Σ 7 669 == u1:s Σ-äkta 7 680 (± 11). Verktygsfilerna bär arbetsnamnet
`_s7u3o96-*` (skrivna FÖRE nr-flytten) — protokollet är o97.

## §1 FÖRE-mätningar (bygge `xBzidYwn8BHC5MbVEaTza` = deploy 18:21Z f641481a; vilofönster: 0 främdda chrome vid starterna, last 0,50 fallande; sonder SEKVENSIELLA)

Instrument: `verktyg/_s7u3o96-sond.mjs` (CDP; snapshot före/efter progressiv
scroll + IO-stabilisering; per kort: sektion, li-höjd, span-höjd, textlängd,
font, radhöjd, radantal). Rådata: `o96sond-o96-fore-{kurser,en,ar}-{mobil,desktop}.json`.

**(a) ROT-BEVISET (svaret på o92:s tre hypoteser).** `textLength` och computed
font (`-apple-system`, line-height 20) är IDENTISKA FÖRE/EFTER på SAMTLIGA
18 kort — ingen skelett-text, ingen radhöjdsbyte, ingen bild-load. Exempel
"Börja här" mobil: textLen 82,130,93,116,86,116 i BÅDA snapshotten; span
FÖRE 278 (contained) → EFTER 39/59/39/39/39/59 (2–3 rader). **Mekanism:
platshållar-flex** — i cv-contained läge sträcker flex-1-spännet sig till
platshållarboxens rest (26rem-box 416 − 138 fasta = 278 px); vid rendering
tar texten sin verkliga höjd. Krympen är platshållarens storlek, inte
innehållets. KUR ⇒ träffa li-platshållaren per sektion.

**(b) Sektionsmått (verkliga höjder, FÖRE-kur).**

| Sektion | mobil (6 kort) | desktop (2 rader à 3) |
|---|---|---|
| flaggskeppen | 196,313,586,739,427,313 → medel 429 | 641 + 814 → 727 |
| nya-i-biblioteket | 586,703,664,586,683,547 → medel 628 | 739 + 719 → 729 |
| borja-har | 178,197,178,178,178,197 → medel 184 | 214 + 194 → 204 |

Spridningen mellan sektioner (mobil 184–628, desktop 194–739) gör att EN
gemensam nivå (26rem) inte kan träffa — därför per-sektionsreservationer.
Σspan FÖRE: desktop 8 353 → 7 316 (−1 037) · mobil 6 278 → 4 780 (−1 498).

**(c) Tvärsnitt (syskonens ytor, redovisade ej dömda här):** register mobil
medel 319,5 px = 20rem på SAMTLIGA tre språken (Σ 7 669 identisk — speglarna
delar KursSok); marin desktop /en 1 008→484 och /ar 484→484 (båda språkens
sluthöjd 484 på ≥1024) — u1:s o93 och u2:s o96 kalibreringar bärs av samma
fönster. u1:s "nya rad2" desktop 719 och "borja" 214/194 bekräftas exakt av
min sond (o92-paritet).

**(d) Lighthouse FÖRE /kurser** (mobil-emulering, `kurser-s7u3o96-fore.json`):
**P68 · LCP 4 636 · TBT 613 · CLS 0** — rent fönster; P68 = generationens
bästa /kurser-poäng i spårets mäthistorik (förra rekordet P68 o88).

## §2 Kur (src ENDAST Edit; commit f45e216c)

1. `src/app/(huvud)/kurser/page.tsx`: UtvaltSektion får valfri `sektionsKlass`-prop
   appand på `<section>`; tre anrop bär `cv-utvalt-flagg` / `cv-utvalt-nya` /
   `cv-utvalt-borja`. (Bas `mt-14` + trimmad mallsträng — ingen syntaxrisk.)
2. `src/app/globals.css`: nytt o97-block efter `.cv-utvalt`-basen —

```css
.cv-utvalt-flagg .cv-utvalt { contain-intrinsic-size: auto 27rem; }
.cv-utvalt-nya  .cv-utvalt { contain-intrinsic-size: auto 39.25rem; }
.cv-utvalt-borja .cv-utvalt { contain-intrinsic-size: auto 11.5rem; }
@media (min-width: 768px) {
  .cv-utvalt-flagg .cv-utvalt { contain-intrinsic-size: auto 45.5rem; }
  .cv-utvalt-nya  .cv-utvalt { contain-intrinsic-size: auto 45.5rem; }
  .cv-utvalt-borja .cv-utvalt { contain-intrinsic-size: auto 12.75rem; }
}
```

   Nivåer = sondade sektionsgenomsnitt (§1b). Basregeln 26rem står kvar som
   fallback. Syskonytor orörda (.cv-registerkort = u1, .cv-siffreband-spegel/
   .cv-socialproof = u2). `tsc --noEmit` projektbinär = **0**.

## §3 EFTER-kriterier (vakarövertag-barra — o89/o91/o92-precedensen)

Mäts när prod-synken deployat (BUILD_ID lämnar `xBzidYwn` med f45e216c som
förfader — deployen bär sannolikt u1+u2:kurerna samtidigt; attribution enligt
o92 §3.4-klassen: gemensamma deployar, separata målytor). FABRIKSREGLER:
ALDRIG eget bygge.

1. **prod 200 ×5 https**: / · /kurser · /blogg · /en/kurser · /ar/kurser.
2. **Sond EFTER mobil /kurser** (`o96sond-s7u3o97-efter-kurser-mobil.json`):
   sektionsspecifika platshållare aktiva (FÖRE-läget flagg 416→432/628/184);
   li.cv-utvalt Σdelta **|Σ| ≤ 150 px** (mobil FÖRE +114 mot bakgrund);
   span.mt-2.flex-1 Σdelta **|Σ| ≤ 250 px** (mot −1 498) — residualen är
   inom-sektionsspridningen (nya 547–703 mot 628-medel), dokumenteras per
   sektion.
3. **Sond EFTER desktop /kurser**: span Σdelta **|Σ| ≤ 150 px** (mot −1 037);
   borja-sektionen är den tydligaste enkelposten (FÖRE −834 px).
4. **Lighthouse EFTER /kurser** inom FÖRE-envelopen: P ≥ 63, LCP/TBT inom
   ±15 % av 4 636/613, CLS 0 (kuren är CSS-platshållarnivåer; LH scrollar ej).
5. **Gränssnittsvakten** (cron-löp): 0 fynd — oberoende belägg.

## §4 KVD

- src/ via Edit ENDAST (page.tsx + globals.css); tsc 0 via projektbinär;
  INGET bygge (prod-synken äger deploy); pre-commit-grinden passerad.
- R2 orörd; data/blogg/ orörd. Syskonens ytor orörda (u1:s staged o93-protokoll
  commit:ades av dem själva i c6fcdd8f; min commit med explicita pathspecs).
- Push: ROT-trädet saknar prod-remote (fabriksvillkor) — commit i ROT +
  deploy via arbetsstationens GitHub-spegling + prod-synk (u1/u2-mönstret);
  deploy-kön dokumenteras i §5.

## §5 EFTER-mätning (fylls vid deploy)

VÄNTAR — deploy-kön vid commit: prod-synk.log 18:27Z VÄNTAR-RAM (391 MB <
2 200) för 95ddaa2a-generationen; min commit + u1/u2:s landar i nästa
fönster. (uppdateras av vakarövertag eller denna instans om fönstret räcker)

## §6 Kö vidare

1. Registerkortens INDIVIDUELLA stavhopp (spridning 142–715 mot platshållare
   320) — skelett→text-växlingens natur; SSR-registret (o19 §3.1) är
   huvudagentens produktfråga (samma post som o93 §5.3 — kvarstår).
2. Spegel-CLS/pop-in (o89 §5) — nu LH-kvantifierad av u2 (P46/CLS 0.204);
   mobilklass, nästa s7-vågs territorium.
3. Desktop-tablet-gapet — u2 sonderade 768/1024 för bandet; utvalt-kortens
   768–1 024-läge (md+-nivåerna extrapolerar från 1 280) förblir osonderat
   (o92 §5.4 vidare).
