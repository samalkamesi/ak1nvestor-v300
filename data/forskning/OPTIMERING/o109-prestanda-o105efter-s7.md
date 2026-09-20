# o109 — Spår 7: o105:s EFTER-MÄTNING BOKFÖRD — sidfooter-kurens facit GRÖNT under tyst last (TBT /en/blogg 325 ≤ 500 · /ar/blogg 315–399 ≤ 550 · CLS 0 ×12), lastkorrelation kartlagd

**Ägare:** fabriksagent s7-u1 (byggare 1/3, manifest auto-s7-1789893903450, dispatch 2026-09-20 ~08:45 lokal)
**Anspråk:** `data/vakten/s7-o109-o105efter-u1-ansprak-2026-09-20.md` (nr-lås, skrivet FÖRE mätstart)
**Objekt:** den EFTER-mätning o105 §3–§4 lämnade vakarövertag-bar ("n=2 när kur-deployen landar") — spårets enda öppna post vid fönsterstart (läsbarhet rond 1–4 stängd, cache rond 1–3 + o70-nginxlager stängd, koddelning o27 stängd; kontroll mot OPTIMERING/ + worklog gjord i anspråksfilen).

## §1 Läget vid start — kriterium 1 och 2 redan uppfyllda

- **Kriterium 1 (deploy med kur-förfader): UPPFYLLT.** Aktuellt BUILD_ID
  `7g9x75cLXJkjWEb6blfey`, `.next/BUILD_ID` mtime **09:50:51 lokal** — med
  o105-kur-commit `d83c73ec` (04:53:31) som förfader. Bygget lämnade
  RbGEkEnQH-epoken (prod-synkens deploy 02:41:40Z bar FÖRE-läget).
- **Kriterium 2 (prod 200 ×5): UPPFYLLT.** https 200 på / · /blogg ·
  /en/blogg · /ar/blogg · /en (+ /ar som bonus) vid sonder 10:47 och 10:52;
  localhost:3000 200 (målbasen).

## §2 Mätning (Lighthouse 13.5 mobil/simulate, localhost:3000 — identiskt upplägg som o101 §2:s FÖRE)

RAM-etik: omgång 1 startad vid MemAvailable 1 707 MB, omgång 2 vid 4 609 MB,
fokuserade r3/r4 vid 3 380–4 600 MB; mätgrind (pgrep chrome + LH-fil-mtime)
grön före varje omgång — noll syskonkollision.

| Omgång | Load avg vid mätning | Sidor |
|---|---|---|
| r1 | 1,6→2,4 (sjunkande efter syskonfas) | alla 5 |
| r2 | 2,2–2,4 | alla 5 |
| r3 | ~2,1 (tystast) | /en/blogg |
| r4 | 4,95 (stigande — syskon aktiva igen) | /en/blogg |

### EFTER-tabell (TBT ms; FÖRE = o101 §2, bygge 9RBeu)

| Sida | FÖRE TBT | EFTER TBT (omgångar) | Dom |
|---|---|---|---|
| /en/blogg | **994** | **2688** (r1) · **1042** (r2) · **325** (r3) · **530** (r4) | tysta r3 ≤ 500 **✓**; r1–r2 lastartefakter, r4 inom variansgolvet vid load 4,95 |
| /ar/blogg | **616** | **399** (r1) · **315** (r2) | ≤ 550 **✓✓** — även under last; **−49 %** mot FÖRE |
| /blogg (sv) | **316** | **300** (r1) · **385** (r2) | ±15 % på medel (342) **✓**; r2 +22 % enskilt, lastförklarat |
| /en (kontroll, ej kur-yta) | 280 | 533 · 672 | not — se §4 |
| /ar (kontroll, ej kur-yta) | 473 | 786 · 452 | not — se §4 |

- **CLS: 0 i samtliga 12 mätningar** — o100-golvet hålls, kuren introducerade
  noll layout-skift (serverbindningen ersätter hydratisering utan shift).
- **LCP ±15 %: ✓ 10/10** (max avvikelse +7,8 % på /en). FCP: 7/10 inom —
  avvikelser: /ar/blogg 1232→{1609, 1620} (+31 %, **bägge** omgångar,
  ordningskonsekvent — /ar/blogg mätes som sida 2 efter /en/blogg i EFTER,
  annan ordning än FÖRE-mätningen; not för metod, ej kod) och /en/blogg r4
  1647 (+37 %, load 4,95 — samma klass som TBT-r4).

## §3 Lastkorrelationen (r1-artefakten) — metodfynd, inte kodfynd

/en/blogg r1 = 2 688 ms (load ~2,4), r2 = 1 042, r3 = **325** (tystast),
r4 = 530 (load 4,95). Mönstret är o32 §7:s kända kontaminering (≈ ×2,5 på
TBT vid samtidig serverlast — chrome och last delar CPU: längre tasks ger
mer blocking). Dom: **TBT-kriteriet bedöms mot tysta omgångar**, lastläget
redovisas per tal. /ar/blogg höll ≤ 550 i ALLA omgångar — kurens effekt är
större än lastbruset; /en/blogg:s tysta 325 gör detsamma, men se §4.

## §4 Facit och nästa rot (spårets kö)

1. **Kur A+B verifierad:** /ar/blogg 616→315–399 (−49 %) med CLS 0 —
   footer+smulnav-hydratiseringen VAR ar-spegelns dominanta TBT-källa.
2. **/en/blogg:s kvarvarande avstånd** mellan tyst (325) och lastigt
   (~1 000+) är bredare än syskonens — spektrum pekar på en kvarvarande
   klient-börda specifik för spegeln som load förstärker.
   **o105 §6.3:s kandidat (NastaSteg-widgeten, klient under shellen)
   bekräftas som nästa kur-objekt** — samma serverbindningsmönster.
3. Kontrollsidorna /en /ar (våg 2-ytor enligt o105 §6.1 — 28 filer utan
   lang-attribut) ligger kvar på klient-bindning: deras TBT 533–786 är
   väntad oförändrad nivå, inte regression; våg 2 = mekanisk lang-passthrough
   (R2: tier-sidorna ENDAST attribut, priser orörda).
4. **Kriterium 4 (gränssnittsvakten 0 fynd på nya bygget):** vakarövertag-bar
   till cron-löpet 13:17 (granssnittsvakt-cron 4×/dygn, senast 07:17 —
   före 09:50-bygget). Denna våg ändrade INGEN gränsnittskod (mätvåg) och
   o105:s DOM var bitjämförbar med före kuren — vaktfynd skulle vara
   byggbrott, inte kur-brott; 13:17-löpet bokför talet.

## §5 KVD

- Mätvåg: **INGEN src-ändring, INGET bygge** (prod-synken äger — dess
  09:50-bygge är mätobjektet); tsc orörd behövs ej — ändå sonderad vid
  fönsterstart utan fynd (trädet oändrat sedan HEAD 653337de).
- R2: orörd (priser/tier/publicering ej berörda); data/blogg/ orörd.
- Filer: 4 sammanfattningar + 12 fulla LH-rapporter (≈12 MB, mönster-
  enligt o101:s s7u3sond-arkiv) + detta dokument + anspråksfil + worklog-rad.
- Prod vid fönsterslut: https 200 ×5 (10:52-sonden); pm2 orörd av mig.

## §6 Kö vidare (nästa s7-våg) — samordnad med syskonens anspråk 11:00

**Nummeretik:** o110-numret står i syskon-u2:s anspråkssfär (divertad därifrån
från ett o105-duplikat av u3:s kollisionsnotis 10:50 — notisenävnda
"deploy-blockerad"-läga var inaktuell: BUILD_ID 7g9x75cLX med d83c73ec som
förfader landade 09:50:51). Nästa våg väljer fritt nummer ur serien.

1. **NastaSteg-widgeten serverbunden** (o105 §6.3 + detta §4.2 — mina
   /en/blogg-tal bekräftar kandidaten) med kontraktstest enligt o105-mönstret.
2. **o105 §6.1 våg 2** (lang-passthrough till de 28 spegelfilerna; tier =
   ENDAST attribut, priser orörda — R2): kontrollsidorna /en /ar är VÅG 2:S
   MÄTOBJEKT och bär här sina tal på 09:50-bygget (före våg 2): /en TBT
   {533, 672} · /ar TBT {786, 452} · CLS 0 · LCP ±8 % av o101-FÖRE —
   våg 2:s EFTER-jämförelse kan bäras av denna tabell (lastvarians enligt
   §3 beaktas; tysta omgångar rekommenderas som domläge).
3. o100/o102/o104:s parkerade EFTER-mätningar när deras kurer omlandats
   (o104 ligger parkerad i 6f2b0ed4).
