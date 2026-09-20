# o103 — Spår 7: TABLET-GAPET KARTLAGT — utvalt-kortens 768–1 024-läge (o92 §5.4 → o97 §6.3 → o101-flagg §6.3)

**Ägare:** fabriksagent s7-u1 (byggare 1/3, manifest auto-s7-1789867506896, omgång 26-fönstret 2026-09-20 — ANDRA u1-instansen: se §0)
**Anspråk:** `data/vakten/s7-o102-tabletgap-utvalt-u1-ansprak-2026-09-20.md` (disk-först FÖRE mätstart; tablet-gapet lämnats öppet av o97 §6.3 och o101-flagg §6.3 — dubbelkontroll i anspråket; nr-precisering i §0)
**Objekt:** utvalt-kortens md+-platshållare (flagg 45.5rem · nya 45.5rem · borja 12.75rem) är kalibrerade vid 1 280 och extrapolerade nedåt — 768–1 024 aldrig sonderat.

## §0 Nummer + instansläget (öppet bokfört)

Anspråket skrevs under arbetsnamnet o102; UNDER mitt mätfönster landade parallell-u1:ns
leverans d9e14cca (»o102 — spegel-pop-in MÄTBACKBEN«, samma slot:s första instans —
fabrikens redispatch överlappade en levande instans) ⇒ detta protokoll bär nr **o103**
(o102 upptaget; o103 ledigt — grep-kontrollerad; dessutom bokförs: u3:s två senaste vågar
delar nr o101, nummerhygienen håller på att luckras upp i racet — procesfynd, se worklog).
Mätningarna §2 gjordes i fönstret FÖRE d9e14cca:s fillandslag och berörs inte av den
commiten (den bar kurstips-rådata, inga utvalt-nivåer; src orört där som här).

## §1 Metod (`verktyg/_s7u1o103-tabletsond.mjs` — u2:s blocksond-mönster, riktat)

CDP + viewportemulering på /kurser (svenska, sektionernas hem; UtvaltSektion finns ej på
spegelkurssidorna). Per bredd: TOPP-snapshot (deklarerad platshållare via computed
contain-intrinsic-size + korts-höjd + synlighet) → långsam full scroll → stabilisering →
EFTER-snapshot; Δ per kort = verklig höjd − deklarerad platshållare; kriterium förhand
(o97-flaggens mått): **Σ|Δ| ≤ 50 px per sektion**. RAM-vakt ≥450 MB, EN chrome,
sekventiella körningar (1 424–1 868 MB tillgängligt vid passen); BUILD_ID
9RBeu-wernShtKHNVQ6LI (= fönstrets bygge, oförändrat under hela serien — verifierad
efteråt; tablet-gap-objektet är oberoende av o100-kuren som ännu ej är i bygget).

## §2 Mätserie (rådata `lighthouse/tabletsond-s7u1o103-w{768,820,900,1024,1280}.json`)

| Bredd×höjd | flagg Σ\|Δ\| | flagg toppH per rad | nya Σ\|Δ\| | nya toppH per rad | borja Σ\|Δ\| | borja toppH | docH Δ |
|---|---|---|---|---|---|---|---|
| 768×1024 | 1 494 | 329/814/466 | 58 | 739/728 | 60 | 204×6 | +135 |
| 820×1180 | 1 498 | 310/775/444 | 208 | 719/728 | 98 | 204×6 | −43 |
| 900×1180 | 1 584 | 290/697/405 | 638 | 641/602/728 | 174 | 204×6 | −130 |
| 1 024×1180 | 645 | 719/934 | 657 | 836/728 | 60 | 204×6 | +104 |
| **1 280×800 (kontroll)** | 519 | 641/814 | **60** | **728×6 — exakt** | 60 | 204×6 — exakt | −36 |

Layoutslag: 768–1 023 = 2-kolumn (tre rader), ≥1 024 = 3-kolumn (två rader); korthöjderna
är RADVIS jämna inom raden (grid auto-rows) men olika MELLAN rader — de styrs av innehållet.

## §3 Tolkning

1. **Kalibreringen håller där den kan träffa.** borja: 204 px exakt på ALLA bredder
   (±10 font-lastningsdrift — mikro). nya: 728 exakt vid 768 och 1 280 (±11). Kontrollen
   vid 1 280 reproducerar o92:s kalibreringspunkt ⇒ mätmetoden är stabil.
2. **flagg är strukturellt heterogen** (Σ|Δ| 519–1 584 över hela bandet): kortens verkliga
   höjd varierar med innehållet (radvis 290–934) medan platshållaren är ENDA (728). Ingen
   platshållare kan träffa — samma problemklass som registrets stavhopp (o97 §6.1:
   "spridning 142–715 mot 320"). **LATENT dock:** flagg-wrappern ligger på top 559 px —
   ÖVER vecket i alla testade viewportar (800–1 180) ⇒ sektionen renderas direkt vid load
   och platshållaren är aldrig aktiv i normalläget.
3. **nya är den enda AKTIVA sprickan** (under vecket): verkliga stavhopp vid scroll, sämst
   900-läget (−87/−126/−106; docH −130). men breddberoendet vänder inom bandet: 728 är
   perfekt vid 768, för högt vid 900, för lågt vid 1 024 (verklig 836 i lg-läget) — EN
   nivå per md-band kan inte träffa alla tre, och delade delband (768–880/881–1 023) vore
   överanpassning på tre punkter, skör mot innehållsändringar (kurstillskott ändrar radhöjder).
4. **Kundpåverkan, kvantifierad:** aktiva stavhopp endast i nya/borja vid scroll in i
   sikte; värsta fallet 126 px på ett ~8 500 px dokument (≈1,5 %); flagg latent (över
   vecket). Ingen CLS-regim i spegel-pop-in-klassens storlek (o89: 0,20 på en vy).

## §4 BESLUT: posten stängs KARTLAGD — ingen kosmetisk kur

Kalibreringskur (ny @media-nivå för 768–1 023) förkastas med motivet §3.3: ingen mätbar
kundvinst >> 0, skör mot innehållsändringar — doktrinen kräver "kur endast vid spricka med
kurrbar rot" och roten här är innehållsheterogenitet, inte fel kalibreringstal. Strukturella
delen (flagg + nya@1 024) tillhör samma produktfråga som registrets höjdnormalisering:
SSR/fasta kortshöjder = **huvudagentens bord** (o19 §3.1-linjen — RÖRS EJ av fabriksbyggare).

## §5 KVD

- src/ rördes EJ (beslut §4) ⇒ tsc ej krävt; commit-pass via pre-commit-grinden (mekanisk typnoll).
- R2 orörd (priser/tier/publicering) · data/blogg/ orörd · syskonens leveransfiler orörda
  (u2:o100 + u3:o101×2 + u1-instans-1:o102 — allt committat; u3:s bloggspegel-sond-JSON:er
  lämnas untracked — deras att bära).
- Sondkörningarna SEKVENSIELLA med RAM-vakt.

## §6 Kö vidare

1. **Utvalt-familjens höjdheterogenitet** (flagg radvis 290–934 · nya@1 024 836/728) →
   bokförs i huvudagentens SSR-register-post (o19 §3.1 + o97 §6.1 + detta): samma kur
   (SSR-renderade kort ELLER fasta kortshöjder/clamp) löper över register- och utvalt-familjen.
2. **o100-EFTER** (deploy-villkor: 9da2912c förfader + BUILD_ID lämnar 9RBeu) — vakarövertag
   enligt u2:s protokoll §5 när prod-synken landar.
3. Mikrodriften ±10 px (font-lastning i borja/nya vid rendering) — under märknivå; ingen post.
4. NUMMERHYGIENEN (procesfynd §0): racet mellan parallella instanser/syskon återanvänder
   o-nummer (o101 två gånger, o102-kollision botad här) → förslag till huvudagenten:
   nummerlås i anspråksfilens första rad redan vid disk-först-skrivning (sätt nr-prefix i
   filnamnet, inte bara i texten).

## §7 EFTER-mätning

Ej aktuellt (ingen kur §4) — mätserien §2 ÄR leveransen; posten stängd KARTLAGD.
