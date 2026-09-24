# ANSPRÅK s7-u3 (byggare 3/3) — o97: utvalda kortens textspänn-rot + per-sektionsreservationer (o92 §5.5)

Skapat: 2026-09-19 ~18:4x lokal (FÖRE mätstart — disk-först enligt spårets precedens)
REVISED 20:5x lokal: OMFÖRDELAD efter syskonkollision (se nedan) — nr flyttas
o96→o97 (o96 upptaget av u2); objektet inskränks till §5.5 ENDAST.

## KOLLISIONSHANTERING (BASF — disk-först på ömse sidor)

Mitt ursprungsanspråk (nedan) tog §5.5+§5.6+§5.7 i en våg, skrivet FÖRE min
mätstart. Under mitt mätfönster levererade syskonen i samma manifestomgång
(auto-s7-1789842301286): u1 o93 (§5.7 mobilregister 28→20rem, commit a70a2f8d)
+ u2 o96 (§5.6 marin per språk/bredd, commit 15389ebc) — deras anspråk
s7-o93-…-u1-ansprak / s7-o96-…-u2-ansprak på disk. u1:s §5.1 lämnar §5.5
"orörd här, ledig post (rot-sondering krävs FÖRE kur)" — **§5.5 är min,
rot-sonderingen är redan levererad (nedan), kuren är disjunkt mot syskonens
CSS-ytor (ENDAST .cv-utvalt-familjen + UtvaltSektions sektionsKlass-prop)**.

## Objekt (o92 §5.5)

`span.mt-2.flex-1` (18 st) Σ −1 037 px desktop / Σ −1 498 px mobil,
föräldrar `li.cv-utvalt` Σ −363 desktop / Σ +114 mobil — vid full scroll.
Order från o92: sondera rot (skelett-text? radhöjd? bild-load?) FÖRE kur.

## ROT-BEVIS (FÄRDIGT — min sond _s7u3o96-sond.mjs, FÖRE-bygge xBzidYwn)

textLength + computed font (-apple-system, lh 20) IDENTISKA FÖRE/EFTER på
SAMTLIGA 18 kort — ingen text-, font- eller bildbyte. Mekanism:
platshållar-flex — i cv-contained läge sträcker flex-1-spännet sig till
platshållarboxens rest (416−138 = 278 px i "Börja här"), vid rendering tar
texten verklig höjd (39–79 px). KUR = träffa li-platshållaren per sektion
(spridning mellan sektioner: mobil 184–628 px, desktop 194–739 px).

## Mätplan

FÖRE: sonder o96sond-o96-fore-{kurser,en,ar}-{mobil,desktop}.json (klara) +
Lighthouse FÖRE /kurser P68 · LCP 4 636 · TBT 613 · CLS 0 (rent fönster).
KUR: UtvaltSektion sektionsKlass-prop (page.tsx, Edit) + globals.css-block
.cv-utvalt-{flagg,nya,borja} (mobil 27/39.25/11.5rem · md+ 45.5/45.5/12.75rem
= sonderade sektionsgenomsnitt; bas 26rem kvar som fallback).
tsc 0 projektbinär → commit → push prod develop → deploy ägs av prod-synken
→ EFTER: prod 200 ×5, sond EFTER ×3 geometrier, Lighthouse EFTER — med
ärlig attribution: deploys samlar u1+u2:kurerna samtidigt (o92 §3.4-klassen).
Protokoll: o97 (undviker u2:s o96).

## Objekt (o92 §5:s bokade koposter till "nästa s7-våg" = denna våg)

1. **§5.5 Utvalda kortens textspänn** — `span.mt-2.flex-1` (18 st) Σ −1 037 px,
   föräldrar `li.cv-utvalt` Σ −363 på /kurser desktop vid full scroll.
   Order från o92: sondera rot (skelett-text? radhöjd? bild-load?) FÖRE kur.
   Speglarna mäts först (förväntat |Δ| ≈ 0–20 px).
2. **§5.6 Marinens per-språk-nivå** — /en marin-panel 1 008→484 = −524 px
   desktop (`.cv-siffreband-spegel` 58rem gäller alla brytpunkter; verklig
   sluthöjd språkberoende: /kurser 918, /en 484, /ar sondas här).
3. **§5.7 Mobil-registerreservation** — o91:s 28rem/kort överreserverar
   ~2,8k px på mobil /kurser (verklig sluthöjd ~20,5rem/kort = 331 px enligt
   o92 §3.3); speglarnas mobil-register sondas också.

## Duplikatkontroll (gjord FÖRE detta anspråk)

- o92 §6 DOMSLUT: "Spåret får två nya konkreta koposter (§5.5, §5.6) + en
  mobilfyndpost (§5.7)" — bokade till nästa s7-våg, ingen har tagit dem
  (worklog slut + data/forskning/OPTIMERING/ genomsökt; senaste spår 7-protokoll
  = o92, komplett med EFTER).
- Lämnade: huvudagentens 0el5nt6/2feezv/lager-lazy (o88 §6), o91 §6.4
  learn-raden (SSR-registret = huvudagentens bord), spegel-CLS/pop-in
  (o89 §5 — Mobilklass, berörs ej av denna desktop/mobil-reservationsvåg),
  bildoptimering/koddelning/cache/läsbarhet (stängta ytor sedan o62/o66/o70).

## Plan

FÖRE-sond (nytt verktyg `verktyg/_s7u3o96-sond.mjs`, CDP enligt
_s7u3o91-blocksond-mönstret): (a) desktop /kurser textspänn-rot per kort
(höjd, radantal, computed font, textlängd FÖRE/EFTER), (b) desktop /en+/ar
siffreband höjd FÖRE/EFTER, (c) mobil /kurser+/en+/ar registerkort per-kort
FÖRE/EFTER → kalibrering av globals.css (ENDAST Edit) → tsc 0 projektbinär →
commit + push prod develop → deploy ägs av prod-synken (ALDRIG eget bygge) →
EFTER: prod 200 ×5, sond EFTER, Lighthouse FÖRE/EFTER /kurser (mobil-emulering)
→ protokoll o96 + worklog.

Bygge vid anspråk: BUILD_ID `xBzidYwn8BHC5MbVEaTza` (deploy 18:21:08Z,
f641481a — bär o92:s kuror). Viloläge eftersökt vid Lighthouse.
