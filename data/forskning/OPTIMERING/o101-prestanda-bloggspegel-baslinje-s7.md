# o101 — Spår 7: BLOGGSPEGEL-BASLINJE — speglarnas hydrat-omskrivningsbörda kartlagd (sv 316 ms → en 994 ms TBT på identiskt träd)

**Ägare:** fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1789867506896, fönster 2026-09-20)
**Objekttyp:** MÄTNINGS- OCH KARTLÄGGNINGSVÅG (o19-sond-precedensen: mätvåg före kurvåg)
**Kontext:** u1 äger kurstips/kurser-spegel-ytan (o99), u2 levererade o100 (kurstips-golvet,
CLS 0 på /en+/ar/kurser).globals.css + (ar|en)/kurser/page.tsx + kurstips = RESERVERADE
ytor hela fönstret — denna våg mätte därför på FRE sidor och rörde INGEN kod.

## §1 Vad som valdes och varför

Spårets kontextlista ("bildoptimering, koddelning, cache-header-granskning, mobil läsbarhet")
gångräknades mot leveransregistret FÖRE mätstart:

- **Bildoptimering** — STÄNGD som objekt: sajten renderar bilder via next/image med
  width/height/sizes (varumarkes-logo.tsx:67–75), Lighthouse bildauditer gröna
  (total-byte-weight score 1, 507–514 KiB; inga modern-image-formats/uses-optimized-images/
  offscreen-fynd i rapporterna). public/ innehåller OANVÄNDA tunga råbilder
  (skulptur-3.jpg 1 218 KiB, skulptur-hero.jpg 275 KiB — noll src-referenser) — repo-vikt,
  ej sidlast-vikt; logotypfilen logo-transparent.png är en JPEG med .png-ändelse men är
  oanvänd i src (endast url-scan-2026-09-03). Bokförs som fynd, kuras ej här.
- **Cache-header-granskning** — STÄNGD (o70): /_next/static immutable 1 år,
  /ak1a/* max-age 86400 + SWR 604800, /og/* 604800 + SWR — uses-long-cache-ttl noll fynd.
- **Koddelning** — delvis levererat (o27/o31/o53/o61/o76/o82); den ÅTERSTÅENDE
  koddelnings-skulden visade sig bo i spegelsidornas hydrat (nedan).
- **Mobil läsbarhet ≥52px** — kräver globals.css-klasser (u1:s yta) för nya mönster;
  befintliga ytor bär redan max-md:min-h-[52px] (blogg-CTA, footer-länker).

Kvar som öppet, fritt och OBEVISAT: blogg-listsidornas prestanda — sv/en/ar aldrig
föremål för dedicated mätning i spåret (o28 cv-bloggkort, o37/o41/o52 prefetch berörde
samma sidor men före detta fönstrets prod-bygge).

## §2 FÖRE-mätning (Lighthouse mobil 4G-emulering, localhost:3000, BUILD 9RBeu-wernShtKHNVQ6LI)

| Sida          | Poäng | FCP    | LCP    | TBT      | CLS | SI    |
|---------------|-------|--------|--------|----------|-----|-------|
| /en           | 77    | 1 798* | 4 296  | **280**  | 0   | 4 091*|
| /ar           | 73    | 1 250  | 4 328  | **473**  | 0   | 1 716 |
| /en/blogg     | **62**| 1 202  | 4 529  | **994**  | 0   | 1 700 |
| /ar/blogg     | 67    | 1 232  | 4 345  | **616**  | 0   | 1 727 |
| /blogg (sv)   | 75    | —      | 4 376  | **316**  | 0   | —     |

*ur s7u3o98-föremätningen (försök 1) — samma prod-bygge.
Fulla rapporter: `lighthouse/{en,ar,en_blogg,ar_blogg,blogg}-s7u3sond.json` +
`lighthouse/s7u3sond-komplett-sammanfattning.json`. Försök 1:s kurser-föremätning
`lighthouse/{en,ar}_kurser-s7u3o98-fore.json` bärs med (slot s7u3:s ägarskap).

## §3 Rotanalys — varför speglarna blöder TBT (316 → 994 ms på IDENTISKT träd)

1. **Spegel-deltat är strukturellt, inte innehållsligt.** /blogg och /en/blogg renderar
   samma 55 kort i samma SeoPageShell (samma klientkomponenter: Sidfooter, NastaSteg,
   Brodkrumma, menyer, widgets). Ändå: sv 316 ms mot en 994 / ar 616 ms TBT.
2. **Hydrat-omskrivningen.** Sidfooter är "use client" ENBART för useSprak().t
   (sidfooter.tsx:1, våg 51-kommentaren: "SSR/SSG renderar svenska; hydreringen byter
   till en/ar direkt vid språkval"). På speglar hydratiseras hela footern (81 element,
   4 kolumnnav, policyrad) i svenska → state-svärm → OM-RENDER med t() per element →
   Style & Layout igen (mätdel: 472 ms style/layout på /en/blogg mot 205 ms på /en).
   Samma mönster i Brodkrumma + Huvudmeny/Mobilmeny-etiketter.
3. **Longtask-fördelningen** (/en/blogg): 830 ms Unattributable (hydrat-böljan) +
   241 ms i framework-chunken 2feezv-iveko5.js + 112 ms CSS-parse. Mainthread:
   Script Evaluation 997 ms + Style & Layout 472 ms. Unused-JS 26+24 KiB i
   runtime-chunkar (Turbopack-polyfill-bunt — inte sidseparererbar utan större ingrepp).
4. **Variansvarning (ärlighet):** en-vs-ar-ordningen (994 mot 616) är INTE stabil
   teori — RTL om-layout kan förklara ar-start (+193 mot en-start) men blogg-ordningen
   pekar på mätningsvarians ±200 ms. SPEGELDELTAT (≈ +300…+680 ms mot sv) däremot
   överstiger variansen i båda speglarna. EFTER-mätningar FORDRAR n=2 per sida.

## §4 Kurdesign (nästa s7-vågs objekt — FRIA ytor: sidfooter.tsx, brodkrumma.tsx, meny-register.ts)

**Kur A (huvudspår): server-side språkbindning av Sidfooter + Brodkrumma på speglar.**
Rutten KÄNNER språket ((en)/(ar)-routing) — t() är ett rent lexikonuppslag och kan
köras i server-komponenten via en prop/parameter i stället för useSprak-context.
Sidetiketterna SSR:as då RÄTT från början: hydrat-omskrivningen (point §3.2) försvinner
på alla tre språken. SEO +53 länkar intakta (server-renderade kvar), CRT-intakt.
Risk: Meny-registret delas med Huvudmeny/Mobilmeny (klient) — de FÅR förbli klient;
endast footer/brodkrumma-klasserna binds server-side. Kontraktstest saknas för
footer-etiketter → lägg till vid kuren.

**Kur B (komplement, om A räcker ej): Brodkrumma-passet** — samma t()-bindning,
liten yta (en rad text).

**EFTER-kriterier (vakarövertag-barra, o99 §4-mönstret):**
1. prod-synken deployad med kur-commit som förfader (BUILD_ID lämnar 9RBeu-…).
2. prod 200 ×5: / · /blogg · /en/blogg · /ar/blogg · /en.
3. Lighthouse n=2 per sida: TBT /en/blogg ≤ 500 ms och /ar/blogg ≤ 550 ms
   (mot 994/616; d.v.s. spegel-deltat ≤ ~200 ms = variansgolvet), sv /blogg oförändrad
   ±15 %, CLS 0 kvar på samtliga (u2:s o100-nivå hållen), LCP/FCP inom ±15 %.
4. Gränssnittsvakten: nästa cron-löp 0 fynd på nya bygget.

## §5 Fynd utanför objektet (bokförs till spårets kö)

- public/ak1a/logo/ hyllerågor: skulptur-3.jpg 1 218 KiB + skulptur-hero.jpg 275 KiB +
  skulptur-{1,2}.jpg + skulptur-utan-bakgrund.png — noll src-referenser; kandidater för
  arkiv/städ (repo-vikt, ej Lighthouse) — ägs av nästa våg som vill ha det.
- logo-transparent.png = JPEG-data med .png-ändelse (66 KiB), oanvänd i src — samma våg.
- Framework-chunkens unused-JS (26 KiB av 70) är Turbopack-runtime — hanteras av
  prod-bygges bundler-läge, inte sidkod; parkerat.

## §6 Gränser detta fönster

Ingen kodkur levererades INOM detta fönster — medvetet: rotens beviskedja (§3) krävde
sv-mätningen som tredje ben, och en trodd kur måste vänta på EFTER-mätning med
deployad build; ett halvt fönster räcker ej för både kur och bevis. Valet dokumenterat
FÖRE commit; inga syskonytor rördes (u1:s kurstips/kurser + globals.css orörda;
u2:s o100 i HEAD orörd). tsc opåverkad (endast data/ berörd) — baslinjen 0 bärs av
pre-commit-grinden.

**Bokföring:** mätdata + detta dokument + worklog-rad; push prod develop (datafiler
behöver inget bygge — appen läser från disk; prod 200 verifierad i worklog-raden).
