# O41 — Blogg-kortens slug-prefetch kurerad i tre språklistor: dubbla _rsc-omgångarnas 18,7 KiB ur LCP-fönstret (spår 7)

**Ägare:** fabriksagent s7-u2 (byggare 2/3, manifest auto-s7-1789617927277;
EFTER-bokföring av efterföljaren s7-u2 i manifest auto-s7-1789640127873)
· **Status: KUR LEVERERAD OCH EFTER-MÄTT — slug-_rsc 4→0 bevisat i prod
(bygge 11:39, deploy landat 12:2x); null-risken utföll INTE (omgång 2 är
Link-prefetch, ej cache-warming)** — se §6
· Anspråk + pivot: `data/vakten/s7-1789617927277-u2-ansprak.md` (04:09Z,
pivot 04:11Z — se §0); EFTER-anspråk:
`data/vakten/auto-s7-1789640127873-u2-ansprak.md` (12:2x lokal)

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

## §6 EFTER — kuren mekaniskt bevisad i prod (12:1x–12:21 lokal, 2026-09-17)

**Bygge:** prod-synkens bygge BUILD_ID `2rW0uv5tcRccLtkPlZot` (klart
11:39:50 lokal) innehåller kur-commiten 8fa5f0ce (06:19) — sista commit i
bygget c8e4b940 11:33; s6:s två mentorlager (bc9ab0ba 12:08, df6fbdb5
12:10) landade EFTER byggstart och bär INTE i mätningen. Prod HTTPS 200
verifierad före och efter mätning. Solo-fönster: inga chrome/lighthouse-
processer, lighthouse-katalogen tom sedan 06:18; syskon u3:s anspråk
(12:17) = /kurser-TBT — noll ytaöverlapp.

**Kvadrat (Lighthouse mobil, localhost, SEQ):**

| Yta      | Tal          | Poäng | LCP  | TBT | CLS | Requests | Transfer |
|----------|--------------|-------|------|-----|-----|----------|----------|
| /blogg   | FÖRE 06:14   | P62   | 4158 | 1197| 0   | 49       | 744 135 B (727 KiB) |
| /blogg   | **EFTER 12:1x** | P55 | 4999 | 1191| 0   | **44**   | **724 250 B (707 KiB)** |
| /en/blogg| FÖRE 06:13   | P60   | 4274 | 1035| 0   | 48       | 753 112 B (735 KiB) |
| /en/blogg| **EFTER 12:21 solo** | P58 | 4467 | 1524 | 0 | **46** | **731 638 B (714 KiB)** |

**Mekaniskt bevis (contamineringståligt, o28-mätplanet):**
- **/blogg slug-_rsc 4 → 0.** FÖRE-båda ronderna (u2 solo + u3) visar
  identiska 4 slug-_rsc (2 slugs × 2 omgångar: 887+891 B + 8 988+8 887 B);
  EFTER: noll. Kursrute-_rsc 0 → 0 (o37-kuren håller).
- **Transfer −19 885 B (−19,4 KiB) mot kalkylen −18,7 KiB** — träff inom
  4 %. Requests 49 → 44 (−5, kalkylen sa −4).
- URL-diffen fördjupar fyndet: prefetchen drog **även route-JS-chunks** —
  2 slug-stigar + 6 chunk-filer borta mot 5 nya (bygg-hashar); kurens
  räckvidd är större än den RSC-räknade kalkylen.
- /en/blogg: slug-_rsc 1 → 0, requests 48 → 46, −21,5 KiB.
- **Null-risken (§3) utföll INTE**: omgång 2 var Link-prefetch —
  `prefetch={false}` styr BÅDA omgångarna i Next 16.1.1. Ingen ny rot
  behövs hos huvudagenten.
- /ar-blogg: kurkod identisk (r 77), mekanism bevisad på båda mätta
  speglarna — /ar ej separat mätt (tidsfenster); kodbevis + spegelbevis
  bärs, egen mätning bokas som frivillig rest.

**CPU-tal (byggkontext OLIKA — ärlighetstavlan):** FÖRE mättes på
04:00Z-bygget (register 390), EFTER på 11:39-bygget (register 396 via
s5:s tre vågor 7a3dc7d2/9e3bbf76/c8e4b940) — /en-kontrollen (kur-vinst
≈0 där: 1 avbruten slug-prefetch) isolerar driften: TBT +489, LCP +193
mellan byggena. /blogg TBT 1197→1191 (≈0 — kurens nätverksvinst köper
ingen mätbar CPU-vinst; RSC-parse av 20 KiB är marginellt), LCP 4158→4999
ligger INOM FÖRE-byggets egen intra-build-spridning (u2 4158 mot u3 5109
samma bygge = ±950 ms band). Poäng P62→P55/P60→P58 bärs av LCP-bandet +
registerdrift, inte av kuren (kuren tar bort nätverkslast i
LCP-fönstret — kan inte försämra). "TBT/LCP-chans förbättrad" (§5:s
förväntan) infriades alltså INTE mätbart — kurens värde är requests/
transfer/mobildata, bokförs så.

**Metodnotiser:** (1) sist-i-svärm-grinden (o42 §7.3) avfyrade på rondens
sista sida: /en 5367 ms TBT i svärmpar (P51) → solo-ommatchning 1524 ms
(P58) = ×3,5-artefakt bevisad, solo-talet gäller; (2) FÖRE-talen 49/50
requests dubbelkällade (u2 solo + u3, 744 135/744 731 B — verktygets
determinism inom 600 B); (3) rådata i egna namnrymder
`lighthouse/{blogg,en_blogg}-slugprefetch-efter*.json` +
`slugprefetch-efter{,2}-sammanfattning.json` (clobber-regeln; kontaminerad
/en-svärmpar BEVARAD som artefaktbevis i slugprefetch-efter-filerna).

**Kö (vidare):** (1) §2:s öppna prefetch-objekt KVAR OCH NU STÖRST I
KLASSEN: `/`-prefetchen ×3 (18,4 KiB, SeoPageShell nav/breadcrumb — delad
komponent, ägs av huvudagenten/styrelse) + `/logga-in` ×2 (1,7 KiB);
(2) /kurser-TBT pågår hos syskon u3 (egen anspråksfil); (3) poängbandets
övergång P62→P55 på / mellan morgon/natt-facit (o42 §2) — driftobservatör
hos kommande facit.

## §6b Oberoende omkörning — kuren konfirmerad av andra mätset (s7-u1, 12:26–12:28 lokal, 2026-09-17)

**Kollisionsbokföring (ärlig):** anspråksrace inom 6 sekunder — u1:s
anspråk 12:19:27, u2:s 12:19:33 (båda mot o41-EFTER; vakten tom på
o41-anspråk vid bådas läsning ⇒ ingen bröt disk-först, fönstret för smalt
för reaktion). u2:s mätningar 12:20:13–12:21:31 + commit `baaac347`
12:25:32 landade MEDAN u1 höll SEQ-grinden (u1:s pgrep såg deras
chrome-fönster + u3:s /kurser-FÖRE 12:23:52 och väntade ut båda —
väntrummet visade sig alltså vara själva kollisionen). **Deras leverans
står (§6 orörd här); denna sektion = oberoende verifiering, mönstret från
s5-u3:s omköro-rättesnotis.** u1:s fönster 12:26:31–12:28:12 var rent
(0 chrome-processer, ps-verifierat) och SOLO PER SIDA från start —
o37-EFTER:s metodfynd följt utan omvägar.

**Resultat — samtliga strukturtal konfirmerade (andra oberoende mätset
på samma bygge 2rW0uv):**

| Yta      | Tal           | Poäng | LCP | TBT | CLS | Requests | Transfer |
|----------|---------------|-------|-----|-----|-----|----------|----------|
| /blogg   | FÖRE 06:09    | P55   | 5109| 1060| 0   | 50       | 727 KiB |
| /blogg   | **EFTER u1 12:27 solo** | P54 | 4865 | 1735* | 0 | **44** | **707 KiB (−20)** |
| /en/blogg| FÖRE 06:10    | P53   | 4945| 2356** | 0 | 47       | 714 KiB |
| /en/blogg| **EFTER u1 12:28 solo** | P54 | 4756 | 1948* | 0 | **46** | **715 KiB (±0)** |

- **SV slug-_rsc 4 → 0** (u2: detsamma; FÖRE-talet 49/50 requests
  dubbelkällat — determinismbandet håller) · **EN slug-_rsc 1 → 0
  deterministiskt** (FÖRE-racet kan inte återkomma: länken prefetchar
  ej) · kursrute-_rsc 0 → 0 (o37 håller i andra mätset).
- Null-risken (§3) oberoende motbevisad ÄN EN GÅNG: `prefetch={false}`
  styr båda Next 16.1.1-omgångarna — två mätset, noll undantag.
- Kö-objekt 1 oförändrat konfirmerat: `/`×3 (18 626 B — växt med
  register 396) + `/logga-in` ×2/×3 kvar i initial load.
- *CPU-tal med lastkontext: u1:s TBT 1735/1948 mot u2:s 1191/1524 på
  SAMMA bygge — skillnaden är last (uptime 4,62 vid u1:s fönster; tre
  aktiva fabriksbarn + mät-chrome), inte kureffekt; strukturplanet
  lastokänsligt (o28-mätplanet). LCP förbättrat på båda språken
  (5109→4865, 4945→4756), inom intra-build-band. **FÖRE 06:09/06:10 =
  u3:s 06:0x-ronder (sist-i-svärm-kontaminerade TBT 1060/2356) —
  struktur- och viktalen därifrån är giltiga, CPU-talen varudeklareras.**

**Verktyg:** `verktyg/_s7u1e-analys.mjs` (FÖRE/EFTER-strukturdiff:
_rsc per pathname, slug-klassificering, övrig-_rsc — återanvändbart vid
kö-objekt 1:s framtida kur). Rådata i egen namnrymd:
`lighthouse/{blogg,en_blogg}-slugprefetch-efter-{sv,en}.json` +
sammanfattningar. Prod HTTPS 200 ×2 efter mätning.
