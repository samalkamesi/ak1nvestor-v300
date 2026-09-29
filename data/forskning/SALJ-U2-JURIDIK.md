# SALJ-U2-JURIDIK — protokoll v207-u2 (fabriksagent, 2026-09-29)

Uppdrag: plattformens saknade juridik-ytor — säljkrav enligt kundorder.
Ägarskap: `src/app/integritetspolicy/**` + sitemap-rad + detta protokoll
+ `KOPVILLKOR-UTKAST.md`.

## Fynd som ändrade förutsättningen

Uppdragets premiss var "/integritetspolicy = 404, svensk försäljning kräver
den". Kartläggningen visade:

1. **`/privacy-policy` lever redan** som en komplett svensk integritetspolicy
   (alla GDPR art 13-poster, senast uppdaterad 2026-09-07) — det som saknades
   var den **svenska URL:en** `/integritetspolicy`, som skannern (2026-09-29)
   rapporterade som 404. Plattformens interna länkar (villkor, cookiepolicy,
   transparens) pekar på `/privacy-policy`.
2. `/villkor` har inga (en)/(ar)-speglar — därför byggs heller inte
   `/integritetspolicy` med speglar (samma mönster, svenska endast).
3. `robots.ts` behövde EJ röras: `PUBLIKA_YTOR` är en allow-lista och
   juridiksidorna (`/villkor`, `/cookiepolicy`, `/ansvar`) är inte heller
   med där — de är varken allow-ade eller disallow-ade (neutrala, crawlas
   fritt) och indexeras via sitemap. `/integritetspolicy` följer samma spår.

## Leveranser

1. **`src/app/(huvud)/integritetspolicy/page.tsx`** — ny rutt, `/villkor`:s
   layoutmönster (SeoPageShell, sektion()-block, Snabbfakta-box,
   ORG_NR-variabler — inga påhittade organisationsnummer, org.nr-raden
   renderas inte förrän registrering finns). Alla art 13-poster:
   ansvarig (AK1A Research Lab drivet av Ak1 Apex Nexus, info@ak1nvestor.com),
   datakategorier (konto, utbildningsdata, tracer, signaler, e-post, loggar,
   betalningsunderlag), ändamål + rättslig grund (art 6.1 a/b/c/f),
   mottagare (Contabo, Supabase, one.com, Stripe, Vercel passiv — EES i
   normaldrift), lagringstider, rättigheter art 15–22 + IMY-klagan,
   barn/unga, ändringar. Kaksektion enligt LEK 2022:482 med **källverifierad**
   kaklista (nycklarna bekräftade i api/medlem, api/trafik, tracer.ts,
   elevkarna.ts, member-local.ts — kopia av cookiepolicyns förteckning,
   fullständig lista länkas). PRO/biträdesrollen (art 28) nämns med länk
   till villkorens PRO-sektion. Utbildningsframing genomgående
   ("spårar aldrig investeringar, säljer aldrig data", dataminimering).
2. **`src/app/sitemap.ts`** — `/integritetspolicy` tillagd i juridikblocket
   (yearly, 0.3) bredvid `/villkor` och `/cookiepolicy`. Sitemap-diff: +1 URL.
3. **`data/forskning/KOPVILLKOR-UTKAST.md`** — distansavtalsposterna
   (2005:59: information före köp, orderbekräftelseposter,
   samtyckeskryss-rutin för digital leverans 2 kap. 11 § 1 st 11 p.,
   oavgiftsavveckling 2 kap. 14 §, interaktion med 90 dagars
   nöjd-kund-garantin) som UTKAST — ingen ny rutt; implementering väntar
   kundens pris-beslut (R2). PRISER RÖRS EJ.

## Öppet beslut för nästa våg (ej R2 i sig — URL-struktur)

Två policysidor lever nu parallellt med samma sakinnehåll:
`/privacy-policy` (engelsk URL, äldre, länkad från villkor/cookiepolicy/
transparens/sidfot) och `/integritetspolicy` (svensk URL, ny, canonical mot
sig själv via pageMetadata). Rekommendation till nästa våg: låt
`/privacy-policy` göra permanent redirect till `/integritetspolicy` och
uppdatera interna länkar (villkor sektion 1/11/12, cookiepolicy kontakt,
privacy-policy-länkar i övriga ytor) — EN URL, en sanning. Alternativ:
behåll båda och låt /privacy-policy canonical-peka på /integritetspolicy.
Ligger utanför denna vågs filägarskap att rätta om.

## KVD

- `node node_modules/typescript/bin/tsc --noEmit` → 0 fel (kört efter alla
  ändringar; se commit).
- Bygge/prod-verifiering ägs av prod-synken enligt fabriksreglerna —
  rutten är byggklar i kod; ingen npm build/npx har körts.

## R2-kontroll

Priser, tiers, publicering i externa kanaler: ORÖRDA. Köpvillkorsutkastet
sätter inga priser och skapar ingen publik rutt. Juridiska
ställningstaganden i policyn bygger på redan publicerad fakta från
`/privacy-policy`, `/cookiepolicy`, `/transparens` och `/villkor` — inga
nya personuppgiftsflöden, inga nya underleverantörer, inga påhittade
uppgifter.
