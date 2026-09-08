# STYRELSEBESLUT VÅG 85 — HTML-LANG-MASSFLYTTET (ordföranden 2026-09-08)

Underlag: STYRELSE-VAG84-PLAN.md §a + V84-METADATA-KARTA.md (sanningen om
rutterna) + spike 12a1bbc (GlobaltSkal + typografi = DÖD kod, klar att aktivera).
Kundens lagar gäller; massflyttet får EXAKT EN ägare (EN flytt-agent — våg 84:s
villkor). URL:er FÅR ALDRIG förändras (route-grupper är rent organisatoriska).

## MÅL
<{en,ar}-sidor serveras med korrekt <html lang="en|ar"> i SSR-HTML (Google-
språksignalen; idag lang="sv" överallt eftersom rot-layouten äger <html>).

## A · FLYTT-AGENTENS UPPDRAG (EN agent, alla filer)

1. **Tre rotgrupper** enligt spike-designen: aktivera GlobaltSkal
   (src/components/ak1a/globalt-skal.tsx — redan skriven, död kod) +
   typografi-singletoner (src/lib/typografi.ts):
   - `src/app/(huvud)/layout.tsx` — GlobaltSkal lang="sv" + dagens rot-
     metadata (huvudMetadata()); tar emot ALLA svenska sidor.
   - `src/app/(en)/layout.tsx` — GlobaltSkal lang="en" + spegelRotMetadata("en").
   - `src/app/(ar)/layout.tsx` — GlobaltSkal lang="ar" + dir="rtl" +
     spegelRotMetadata("ar").
   - ROT-layouten `src/app/layout.tsx` TAS BORT (Next kräver ingen gemensam
     rot-layout när varje grupp har sin egen). CONVENTIONS-filer som MÅSTE
     ligga kvar på app-roten (Next-regler): manifest, robots.ts, sitemap,
     favicon-bilder, api/**, proxy/middleware — KOLLA KARTAN.
2. **Flytta sidorna enligt V84-METADATA-KARTA.md** (78 page.tsx: 52→(huvud),
   13→(en), 13→(ar)) — git mv (bevara historik!), INGA innehållsändringar i
   sidorna (importer som bryts rättas ENDAST till samma mål).
3. **not-found per grupp:** (huvud) = dagens app/not-found.tsx flyttad;
   (en)/(ar) = översatta kopior (GlobaltSkal-stil, länkar till /en|/ar/kurser
   + roten). app/not-found.tsx på roten BORT.
4. **error/loading om de finns** — kopior per grupp (kolla vad som finns).
5. **SKULD med i vågen:** kurs-forslag.tsx regex `^/kurser/` → stöd också
   `/^\/(en|ar)\/kurser\//` (fånggrupp) — not-for-spegelns förslag på speglar.
6. **GlobaltSkal/typografi justeras** där spike och verklighet skiljer (t.ex.
   StagingBanner/PageViewBeacon — KOLLA att allt i dagens rot-layout kommer
   med i GlobaltSkal; inget får tappa).
7. **Förbjudet:** ändra URL:er, metadata-innehåll (utom canonical-rot-defaults
   enligt spike), ISR-tal, dynamicParams, kurs-access, innehåll.

## B · VERIFIERING (agenten kör; grunder för godkännande)
1. `npx tsc --noEmit` = 35 baslinje, 0 nya.
2. `npm run build` exit 0 LOKALT (snabb iteration) — **SSG-PARITETSGRINDEN:
   antal förhandsrenderade sidor FÖRE = EFTER (räkna HTML i .next/server/app
   förra bygget jmf nya; godkännande-tal enligt kartans 906=906-mönster —
   mät och redovisa exakta tal).**
3. SSR-lang-grep: `.next/server/app/en/**.html` innehåller `<html lang="en"`;
   /ar → lang="ar" dir="rtl"; svenska → lang="sv" (stickprov 3+3+3).
4. Swagger-rutter orörda: /api/** lever (build-listan).

## C · MAIN (efter agenten)
tsc + build om-koll → deploya-contabo.sh (BYGGER PÅ SERVERN — kunddirektiv
"servern är datorn") → prodverifiering: lang-attribut på prod /en|/ar + hela
standardsviten (startsida/kurser/404/speglar/variabler) → commits/push →
worklog + minne. ROLLBACK = revert av flytt-committen (EN commit).

— Ordföranden, AI-styrelsen AK1A
