# O41 — Blogg-kortens slug-prefetch kurerad i tre språklistor: dubbla _rsc-omgångarnas 18,7 KiB ur LCP-fönstret (spår 7)

**Ägare:** fabriksagent s7-u2 (byggare 2/3, manifest auto-s7-1789617927277)
· **Status:** KUR LEVERERAD (tsc 0, commit pending) — EFTER-mätning enligt
pending-precedensen när prod-synken byggt
· Anspråk + pivot: `data/vakten/s7-1789617927277-u2-ansprak.md` (04:09Z,
pivot 04:11Z — se §0)

## §0 Objektval: dubbelkollision → pivot (o38 §0-precedensen)

Ursprungligt val (04:09Z): o38 §7 kö 1 — prefetch-kurens EFTER-mätning.
**Kollisionsbevis inom 2 min:** syskonen u1 (anspråk 06:07 lokal) OCH u3
(06:08 lokal) tog BÅDA objektet; deras mätning levererad på disk
04:09:40–04:10:04Z (`lighthouse/{blogg,en_blogg}-blogg-gap-efter.json` +
sammanfattning; pgrep chrome/lighthouse 0 + sammanfattning existerar =
avslutad, o38 §6.1). Disk-först: mitt anspråk trea — noll trippelarbete,
**PIVOT 04:11Z** till o37 §5:s bokade rest: "SV:s dubbla blogg-slug-prefetchar
(8,8+8,7 KiB mot EN:s 0,9) — misstänkt page-prefetch-triktrering".

## §1 Diagnos — ur syskonens färska EFTER-rådata (källa, ej min leverans)

`verktyg/_s7u2b-diagnos.mjs` + `verktyg/_s7u2b-djup.mjs` på
`blogg-blogg-gap-efter.json` (prefetch-kuren 7f419839 live, 04:00Z-bygge
BUILD_ID 0h_7ANLOatJo7TBfHvlNx, deployad 493a5b11 — anfaderskap
merge-base-verifierat):

- **/blogg (SV): 50 requests, 727 KiB totalt.** _rsc-prefetchar i initial
  load: `/` ×3 (18,4 KiB) + `/logga-in` ×2 (1,7 KiB) + **två kort-slugs ×2
  var**: omgång 1 (#m8nkPYdG, 887+891 B, @1450 ms) + omgång 2 (#NaHOPuiX,
  8 988+8 887 B, @1679/1706 ms) = **18,7 KiB spill för 2 av 55 kort**,
  mitt i LCP-fönstret.
- **/en/blogg (EN): 47 requests, 714 KiB.** Slug-prefetchen **avbröts**
  (status −1, 0 B, @1062 ms) — race, inte "gratis läge": EN-kontrollen
  bevisar inte att prefetch är gratis, men att listvyn fungerar och mäts
  bättre UTAN fulla slug-flighter (o37 §2: P71/567 ms mot P52/1 299).
- Mönster: omgång-id:n är gemensamma per URL-uppsättning — Next 16.1.1
  prefetchar varje synlig länk i **två steg** (partial @~1,45 s + full
  flight @~1,7 s); o37:s "dubbla _rsc-cachebusters för samma slugs" är
  dessa två omgångar, oförändrade av kurslänkskuren (som förväntat).

## §2 Rot — uteslutning + kvarstående källa

- Footer/cookie-länkar: prefetch={false} sedan o17 — inte källan.
- loading.tsx: symmetrisk (finns på (huvud)/, (en)/, (ar)/-gruppnivå, ingen
  i blogg-listkatalogerna) — inte skillnaden SV/EN.
- Båda listytorna har IDENTISK kortlänkskod (huvudlänk `<Link>` default
  auto-prefetch; spegeln saknar bara kurslänken) — kvarstående källa till
  slug-spillet = kortens huvudlänk-auto-prefetch, som i Next 16 dubblas av
  omgång 2:s fulla flight (artikel-RSC ~9 KiB + partial ~0,9 KiB per kort).
- Öppet (bokas, ej taget): `/`-prefetchen ×3 (18,4 KiB, nav/breadcrumb i
  SeoPageShell — DELAD komponent på alla ytor, ägs inte av denna våg) och
  `/logga-in` ×2; samma mekanism, större totalvikt, kräver egen avvägning.

## §3 Kur — o17/o37-precedensen, tre listor kirurgiskt

`prefetch={false}` på kortens slug-huvudlänk i listorna (kurslänken i
/blogg redan kurerad av o37, orörd):

- `src/app/(huvud)/blogg/page.tsx` (r 64-kedjan + kommentar)
- `src/app/(en)/en/blogg/page.tsx` (r 76-kedjan + kommentar)
- `src/app/(ar)/ar/blogg/page.tsx` (r 74-kedjan + kommentar)

**Omvärderingen av o37:s "huvudlänkens prefetch behålls", motiverad av ny
data:** (1) prefetchen är DUBBEL (två omgångar ≈ 9,7 KiB/kort) — inte den
enkla ~9 KiB-kalkylen o37 avvägde; (2) EN-mätningarna (avbruten slug-prefetch)
visar att listan utan fulla flighter mäts och fungerar; (3) vid klick hämtas
artikel-RSC:n då — rutterna är force-static (snabbt serversvar), kostnad
≈ 100–300 ms på 4G för de kort som faktiskt klickas, mot 18,7 KiB spill i
LCP-fönstret för VARJE listbesökare. Klick-prioriteringen flyttas från
"alla synliga kort" till "det kort som klickas".

**Risk (ärlig):** om omgång 2 styrs av Next-cache-warming oberoende av
Link-prefetch kan kuren vara verkningslös — EFTER-mätningen (§5) avgör;
protokollet bokar öppet att ett noll-resultat är möjligt utfall.

## §4 KVD

- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinären;
  inget bygge — prod-synken äger). tsc kördes FÖRE commit; pre-commit-grinden
  verifierar igen.
- src ENDAST via Edit (tre filer, en länk + kommentar vardera); kurslänken
  (7f419839) och syskonens ytor orörda; SpeoPageShell orörd (§2 öppet).
- R2 orörd (inga priser/tier/publicering) · data/blogg/ orörd ·
  .env orörd.
- Syskonredovisning: u1+u3 äger prefetch-EFTER:en (deras filer på disk lästa
  som KÄLLA, aldrig levererade av mig); noll filöverlapp med mina.

## §5 EFTER (pending-precedens)

När prod-synken byggt denna commit (RAM-grind 2 200 MB gäller — 04:07Z-pollen
väntade på 1 894 MB): mät `node verktyg/prestanda-lighthouse.mjs
slugprefetch-efter /blogg /en/blogg` på vilande server med o32:s SEQ-grind.
**Förväntan:** /blogg requests 50→~46, −18,7 KiB transfer (~727→~708 KiB),
TBT/LCP-chans förbättrad i linje med EN:s profil; EN oförändrad ±drift
(o38 §4: +~8 KiB/omgång från s6-lager — särskiljs av /en-blogg-kontrollen).
**Noll-resultat ⇒ omgång 2 är warming ⇒ boka ny rot hos huvudagenten.**
