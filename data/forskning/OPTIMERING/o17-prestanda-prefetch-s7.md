# O17 — Prestanda spår 7, våg: duplicerade RSC-prefetches (2026-09-16)

**Ägare:** fabriksagent s7-u2 (auto-s7-1789524905980) · **Status:** LEVERERAD (EFTER-mätning bokas när prod-synken byggt)

## FÖRE-baslinje (r4-fore, Lighthouse mobil, localhost = prod-bygget)

| Sida | Poäng | LCP (lab) | TBT | CLS | unused-JS |
|---|---|---|---|---|---|
| / | 55 | 5 906 ms | 909 ms | 0 | 83 KiB |
| /kurser | 50 | 6 246 ms | 1 097 ms | 0 | 116 KiB |
| /blogg | 54 | 6 197 ms | 863 ms | 0 | 116 KiB |

Rådata: `lighthouse/r4-fore-{start,kurser,blogg}.json` + `r4-fore-sammanfattning.json`.
Observed LCP på / = 2 239 ms = FCP — lab-LCP:n drivs av simulerad nätverkskontention.

## FYND: dublicerade RSC-prefetches med unika cache-busters

`network-requests` på / visar (start ~1,4 s, alla priority Low):

| Rutt | Antal hämtningar | Unika URL:ar |
|---|---|---|
| /kurser?_rsc= | **3** | 3 (olika busters — cachen kan aldrig återanvända) |
| /logga-in?_rsc= | 2 | 2 |
| /cookiepolicy?_rsc= | 2 | 2 |
| /privacy-policy?_rsc= | 2 | 2 |
| /transparens?_rsc= | 2 | 2 |

≈ 7 redundanta överföringar (~60–100 kB) + lika många serverrenders per kall
förstabesök — mitt i LCP-fönstret. Mekanism: flera <Link>-instanser mot samma
rutt (bannern + footern + nav/CTA) prefetchar oberoende; Next ger varje
anrop unik `?_rsc=`-nyckel ⇒ HTTP-cachen spelar ingen roll.

## KUR (levererad)

`prefetch={false}` på sekundära länkytor — noll synbar beteendeändring,
navigationen fungerar identiskt, bara bakgrundshämtningen försvinner:

1. **src/components/ak1a/cookie-consent.tsx** — bannerns 3 policy-länkar
   (cookiepolicy, privacy-policy, transparens). Bannern monteras på varje
   sida → dess länkar prefetch:as vid hydratisering för varje ny besökare.
2. **src/components/ak1a/footer.tsx** — alla 10 länkar (FOOTER_PUNKTER-
   mappen + 9 explicita juridik-/navigations-länkar). Footern ligger under
   vecket; juridik-länkar är inte tidskritiska navigationsmål.

Nav-länkarna i headern behåller prefetch (primära mål, i viewport).

## AVSTÅTT med skäl (bokfört för kommande vågor)

- **Chatt-chunkens 55 kB** ( största enskilda skriptposten efter main+vendor,
  innehåller AI-Mentorns ~270 kB källtexter): kirurgi kräver att
  frågebankerna flyttas ur chat-widget.tsx:s statiska importer — men spår 6:s
  13 testfiler grep:ar kedjeraden + importerna i filen (widget-bevis, fall L).
  Bryter 287-PASS-suiten. Rotorsak: testdesignen binder datan i klientbunten.
  Väg framåt (spår 6:s beslut): nya lager läggs som datafiler hämtade vid
  chattöppning, eller testerna flyttar sitt widget-bevis till en kedjemodul.
- Fonter 3×~50 kB: preload redan optimal (2 preload:as, mono medvetet
  deferread — s7-u3:s stängning verifierad mot serverad HTML).
- Brotli: huvudagent/infra. Språkresolvens-CLS: produktbeslut.

## METOD för EFTER (när prod-synken byggt commit)

1. `node verktyg/prestanda-lighthouse.mjs r4-efter / /kurser /blogg`
2. `LH_JAMFOR=r4-fore` — delta per sida bokförs här.
3. Nätverkslista: räkna `_rsc=`-hämtningar per rutt på / (väntat ≤ 1 st
   cookiepolicy/privacy/transparens från bannern, 0 från footern; /kurser
   från nav kvar) + total byte-jämförelse.
4. `curl -s -o /dev/null -w "%{http_code}" https://lab.ak1nvestor.com/` = 200.
