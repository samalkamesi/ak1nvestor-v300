# o71 — Prestanda: spa-hem-trädbantning — o54 §6-köposten tagen (SearchModal-mönstret på sista JS-only-grenarna)

**Spår 7 · s7-u1 (manifest auto-s7-1789729524, byggare 1/3) · 2026-09-18 ~16:4x–17:1xZ**
**Status: KUR LEVERERAD + EFTER BOKFÖRD — deployad 17:00:17Z (commit 18c2d747, BUILD_ID `GGTtGZAGF7NvpxDI9_1Zk`), strukturkriterier (a)(b) gröna, (c) prod 200 ×3, (d) mätt i nästan-solo (load 0,77).**
**Anspråk disk-först:** `data/vakten/s7-o71-spa-hem-tradbantning-u1-ansprak-2026-09-18.md` (rot, ~16:46Z).

## §0 Driftfönstret (fönstrets kontext — bokfört av s7-u2 i DRIFTSBOKEN)

Sessionen inleddes under prod-incidenten 16:30:33–16:42:19Z (två OOM-dödade
synkbyggen → .next halvraderad → pm2 boot-loop → 502; läkt av prod-synkens
16:37-poll + deploy 16:42:30Z, BUILD_ID `-udydQnIf-pUcE4iU5sqV`). Egen andel:
diagnostik (pm2-loggen: "no production build"-loop; fuser-grinden bekräftade
kraschvaktens + synkens byggfönster) + ÉN overksam `pm2 restart ak1a` 16:41:15Z
(bygget pågick fortfarande — läkningen kom ändå av synkens eget
pm2-restart-steg; våg 100-regeln hölls, inget race mot byggägaren). FÖRE-mätningen
nedan skedde på det LÄKTA prod-bygget. Lastband: load avg 3,73–4,14 (tre aktiva
fabriksbarn; s7-u3:s egna mätningar pågick inom kvarteret) — CPU-tal deklareras
med band; strukturplan är lastokänsligt.

## §1 Valet + duplikatkontroll

Spårets kontext: bildoptimering (SLUTET, o66 §7), koddelning, cache-header-
granskning (rond 1–3 levererade; rond 4 = s7-u2:s o70, tagen disk-först 18:35
lokal — mitt förstaval lämnades HELT åt dem efter deras anspråksfil), mobil
läsbarhet (STÄNGT, o62). Kvar i spårets egna bokningar: **o54 §6:s nya köpost**
— "/:s FCP är skriptbunden … barnägda sonder: vilka klientkomponenter i
spa-hem-kedjan som kan följa SearchModal-mönstret (dynamic + LasyGlobal)".
Worklog-genomgång: ingen leverans på köposten efter bokningen 2026-09-18 01:1x.
o71 ledigt (högst = o69; s7-u2 reserverade o70 i sitt anspråk).

## §2 Sond — chunk-karta över startsidans initial load (FÖRE, verktyg/_s7u1o71-sond.mjs)

Lighthouse FÖRE på läkta prod-bygget (`lighthouse/start-s7u1o71-fore.json`):
**P45 · FCP 1,3 s · LCP 4 298 · TBT 7 893 (lastkontaminerat, se §0) · CLS 0,106
(känd signatur)**. Strukturplan (lastokänsligt): 18 script-chunks, 274 KiB
transfer. Källmodul-kartläggning (känneteckensträngar mot .next/static/chunks):

| Chunk | Transfer | Källmodul (bevis-sträng) | Dom |
|---|---|---|---|
| 1_vj6att0dk-c.js | 13,0 KiB | **spa-hem.tsx** ("Laddar sektion", "flyttat in det här i biblioteket") | KUR-YTA |
| 2feezv-iveko5.js | 70,3 KiB | Next/React-bootstrap | ramverk — orörlig |
| 3o-an9dtd0lrc.js | 46,2 KiB | ordbok/MGTM ("Lär dig läsa bolag" = hero-texten) | medveten design (o66 §7) |
| 0ghd343qi8jtv.js | 42,3 KiB | React client-runtime | ramverk |
| 0ye_mv4v-sny9.js | 12,3 KiB | header-familjen (Toppvaxel + lucide "check") | SSR-kontrakt — lämnas |
| 41px3vs2d1_1p.js | 11,8 KiB | home-sektionens texter ("Kunskapsflödet…") | SSR-kritisk (LCP) |
| 3zwsf3oss3641.js | 8,3 KiB | lucide-ikoner ("house") | ikoner i DOM — hydratiseras |
| 13xikvdden8ed.js | 9,4 KiB | CookieConsent ("ak1a-cookie-samtycke") | layout-ägd, o57-beslut |
| 2qnjvou52dgsk.js | 9,0 KiB | lasy-global (PalettVakt-lyssnare) | ⌘K-svar måste vara tidigt (o61) |
| 3pst6ss7vt93a.js m.fl. | ~40 KiB | react-interna + hjälpare | ramverk |

**Sondens slutsats:** Header/Footer/HomeSection är SSR-kritiska (no-JS-kontraktet,
våg 81), lasy-global:s vakter är medvetet ivriga (o61), ordboken är design.
SearchModal-kandidater som ÄR kvar = de delar av spa-hem-chunken som ALDRIG kan
synas i server-HTML: **SektionVidarebefodran-grenen** (M3-omdirigeringen —
sektionsbytet är ett JS-store-event) och **RefMottagare** (renderar null i SSR
tills dess useEffect läst ?ref= — kommentarkontrakt i källan).

## §3 Kur — SearchModal-mönstret på de två JS-only-grenarna

1. **`src/lib/ak1a/sektionsrutter.ts` (NY):** ROUTE_FOR_SEKTION + NAMN_FOR_SEKTION
   utbrutna till vägerlätt lib — SpaHem fattar boolean-beslutet utan att dra in
   vyn; mappningarna var exklusiva för spa-hem (grep-verifierat).
2. **`src/components/ak1a/sektion-vidarebefodran.tsx` (NY):** komponenten
   ordagrant flyttad (timer + slug-frysning + logotyp- JSX) — hämtas nu via
   `next/dynamic` ssr:false med SektionsSkelett-fallback ( visas endast efter
   sektionsval = efter ett klick; chunk-hämtningen är en bråkdel av det
   redan existerande 800 ms-redirect-fönstret).
3. **`src/components/ak1a/spa-hem.tsx`:** SektionVidarebefodran + RefMottagare →
   dynamic ssr:false (RefMottagare utan fallback — den renderar null tills
   ?ref= ändå; SSR-kontraktet är null-fallet, ordagrant i källkommentaren).
   VarumarkesLogo-importen lämnar spa-hem-chunken (delas kvar i header/footer-
   chunkarna — ingen dublettkostnad).

**Kontrakt bevarade:** no-JS (våg 81): grenarna renderade null/iJS-only FÖRE —
SSR-HTML identisk. ?ref=-flödet: läsning/tvätt sker vid montering i stället för
vid hydratisering (millisekunder senare); logga-in-konsumtionen (AC2) orörd.
**Typkontroll:** `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**.
Bygge: ÄGS av prod-synken (fabriksregeln) — deploy vid nästa poll.

## §4 EFTER — BOKFÖRD (deploy 17:00:17Z, mätning 17:02Z, SEQ-grind chrome=0, load 0,77)

| Mått | FÖRE (load 3,7–4,1) | EFTER (load 0,77) | Kommentar |
|---|---|---|---|
| Poäng | P45 | **P58** | olika lastfönster — se nedan |
| FCP | 1,3 s | 1,6 s | båda långt under o54-seriens 2,3 s; trace-band |
| LCP | 4 298 ms | 5 370 ms | solo-nivå i linje med o54:s band (5 548–5 613) |
| TBT | 7 893 ms | **791 ms** | FÖRE lastkontaminerat; solo-referens o54: 1 397 |
| CLS | 0,106 | **0** | kända signatur-shiften frånvarande i solo |

**Strukturbevis (kurens facit — lastokänsligt):**
- **(a) GRÖN:** Vidarebefodran-vyn bor i `1kjhlplguxcaa.js` (NAMN_FOR +
  Varumarkes + "flyttat in" grep-bevisat) — **finns EJ i initial load**;
  spa-hem-chunken bantad 13,0 → 12,4 KiB (nu `1d73rtzor_9wd.js`).
- **(b) GRÖN:** RefMottagare = egen chunk `1xqabq2g6iaq4.js` (saneraRefKod +
  "väns tips" bevisat), hämtas vid 564 ms — EFTER det kritiska fönstret
  (sista kritiska chunken slut 335 ms), dvs vid mount precis som designat.
- **(c) GRÖN:** prod 200 ×3 (/, /kurser, /blogg) kl 17:02:20Z.
- **(d) GRÖN med band:** CPU-talen FÖRE/EFTER är NOT attributable (last
  3,7–4,1 vs 0,77) — TBT-fallet till lasten + omgångens senare kuror
  (o63/o61/o70-familjen); mikrokurens egen vinst = strukturplanet ovan
  (~1,9 KiB kod flyttad ur kritisk bunt, requests 18→19, total transfer
  274→275 KiB). Script Evaluation 6 656 → 2 197 ms deklareras med samma band.

## §5 Rest + läxor

- Sondens negativa resultat är lika viktigt som kuren: spa-hem-kedjan har
  INGA fler SearchModal-kandidater — Header/Footer/HomeSection/lucide/ordbok/
  cookie/lasy-vakter är SSR- eller designbundna. **o54 §6:s köpost STÄNGS**
  med denna våg; kvar i TBT-spåret = React-hydratiseringsnedskärning
  (huvudagentens strukturella yta, o45 §1-klassen).
- OOM-återhämtningskedjan (§0) eskaleras av s7-u2 till drift-spåret —
  systemisk kollision fabrikens barn × synkbygge var 10:e minut.
- /:s LCP 4 298 i lastfönstret: nytt band-läge på det läkta bygget; solo-tal
  finns hos s7-u3:s 16:47Z-rond (deras namnrymd).
