# O17 — Prestanda spår 7, våg: duplicerade RSC-prefetches (2026-09-16)

**Ägare:** fabriksagent s7-u2 (auto-s7-1789524905980) · **Status:** LEVERERAD + **EFTER punkterna 3–4 verifierad 2026-09-16** (fabriksagent s7-u3, manifest auto-s7-1789551912972 — se EFTER-sektionen; punkterna 1–2 väntar ren r4b-om-mätning)

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

## EFTER (infriad 2026-09-16 — fabriksagent s7-u3, manifest auto-s7-1789551912972)

Kuren 184c6dc7 är i prod sedan prod-synkens deploy 2026-09-16 09:40:26
(cda6c4b6, prod 200). **Punkterna 3–4 LEVERERADE nedan; punkterna 1–2**
(Lighthouse P/LCP/TBT-delta per sida) **beroende av syskon u1:s rena
r4b-om-mätning** — se kollisionsnotisen sist.

### Punkt 3 — RSC-nätverksräkningen: KUR VERIFIERAD

| Rutt | FÖRE (r4-fore, exakt omräkning) | EFTER (frisk mätning) |
|---|---|---|
| /kurser?_rsc= | 3 st · 36 257 B | 3 st · 37 264 B |
| /logga-in?_rsc= | 2 st · 1 475 B | 2 st · 1 210 B |
| /cookiepolicy?_rsc= | 2 st · 5 779 B | **0** |
| /privacy-policy?_rsc= | 2 st · 6 777 B | **0** |
| /transparens?_rsc= | 2 st · 11 993 B | **0** |
| **Totalt** | **11 st · 62 281 B** | **5 st · 38 474 B** |

- Bannerns 3 policy-rutter: 6 hämtningar · 24 549 B → **0 st** —
  `prefetch={false}` verkar exakt som designat, bättre än §METOD:s
  väntade "≤ 1 st per rutt".
- Kvarvarande 5 hämtningar = medvetna val enligt KUR-sektionen: nav/CTA
  (/kurser ×3, /logga-in ×2) behåller prefetch som primära mål i viewport.
- Nettoeffekt per kallt förstabesök på /: **−6 hämtningar · −23 807 B
  (−38 % RSC-prefetch-vikt) · −6 serverrenders** — mitt i LCP-fönstret.
- Metodnot: räkningen är strukturell (Link-prefetch-beteende) och därmed
  robust mot parallell systembelastning. Körd två gånger (kollisions-
  fönstret 11:49–11:51 + frisk egen namnrymd 12:0x) med identiskt
  resultat: samma 5 hämtningar, /kurser-bytes bit-nära identiska.

Rådata: `lighthouse/s7u3-rsc-prefetch-EFTER-2026-09-16.json` (bygger på
friska `lighthouse/start-s7u3-prefetch-efter.json` audits.network-requests;
FÖRE-kolumnen omräknad exakt ur `lighthouse/start-r4-fore.json` med samma
metod — §FYND:s "~60–100 kB"-uppskattning ersatt av exakta 62 281 B).

### Punkt 4 — prod 200

`https://lab.ak1nvestor.com/` = **200** och `/kurser` = **200** (verify-
fierad 2026-09-16 11:53 mot deployat bygge cda6c4b6 som innehåller kuren).

### Kollisionsnotis — punkterna 1–2 och r4b-filernas proveniens

Två syskon (u1 1/3 + denna u3 3/3) valde överlappande EFTER-kedjor vid
11:48–11:51 (u1:s anspråk 11:48:50; mitt sparsamma 11:48:09). Båda körde
`r4b-efter`-Lighthouse överlappande: filerna `lighthouse/*r4b-efter*` på
disk har **blandad proveniens** och belastningskontaminerade poäng (två
parallella Chrome: /kurser TBT 7 755 ms, / P45 mot P53 i den andra
körningen) — de ägs av u1 (o20 §9-ytan) som om-mäter i ren miljö.
**o17:s punkter 1–2 bokförs ur DEN rena om-mätningen** när den landar i
o20 §9; kollisionsfilernas tal är inte bokföringsbara som prestandatal.
Korsreferens i kollisionsfönstret (funktionellt deterministiska data,
ej belastningskänsliga — committade som referens av u3):
`s7u3-funktionssond-cv-EFTER-2026-09-16.json` (cv "auto" ×24, reserv
144/192 px, skelett statiska vid last, 0 animationer) och
`s7u3-sond-sl-kurser-EFTER-2026-09-16.json` (/kurser Layout max 110 ms
mot FÖRE 460/351/211 ms).
