# Domänstrategi — AK1nvestor.com ↔ lab.AK1nvestor.com

> Beslutsunderlag framtaget av AI-organ-styrelsen 2026-08-24.
> Rekommendation: **Två roller, ett varumärke** (Alternativ B nedan).

## Nuläge

| Domän | Roll idag | Innehåll |
|---|---|---|
| `lab.ak1nvestor.com` | Hela plattformen | Kurser, analyser, labb, blogg, kalkylator, admin, medlemmar |
| `ak1nvestor.com` | Oanvänd (parkerad?) | Oklart — ägs av samma person |

## Alternativ

### A) Slå ihop allt på en domän
Flytta plattformen till `ak1nvestor.com` och avveckla subdomänen.
- ✅ En URL att marknadsföra, all SEO-länkkraft samlas
- ❌ 502 indexerade URL:er på lab- måste 301-dirigeras (riskmoment om det görs fel)
- ❌ Jobs-omdirigering under övergång
- **Bedömning: korrekt långsiktigt, men inte värt risken nu**

### B) Två roller, ett varumärke ⭐ REKOMMENDERAS
`ak1nvestor.com` = **frontdörren** (företagssida): vision, Fas 2-ansökan,
representantprogram, kontakt. `lab.ak1nvestor.com` = **plattformen**: allt innehåll,
utbildningen, verktygen.
- ✅ Separation: säljer (front) vs utbildar (lab) — tydligt för besökare OCH Google
- ✅ SEO-mognad på lab fortsätter ostört
- ✅ "Fas 2: boka möte" och företagsärenden landar på fronten — proffsigt
- 🔧 Kräver: en enkel landningssida på ak1nvestor.com + länkar till lab

### C) Dirigera om ak1nvestor.com → lab (tillfällig lösning)
- ✅ 10 minuter att genomföra (DNS/redirect)
- ❌ Wastar en stark varumärksdomän på en redirect
- **Bedömning: bra akutlösning om fronten inte ska byggas än**

## Rekommenderad väg (stegvis)

1. **Nu (10 min):** sätt redirect `ak1nvestor.com` → `lab.ak1nvestor.com` (Alternativ C
   som interims) — så slipper besökare en död sida
   - Vercel → ak-1 → Settings → Domains → Add `ak1nvestor.com` (+ www) → följ
     DNS-instruktionerna → därefter sätter Vercel automatisk redirect om den pekas
     som alias, ELLER sätt redirect hos domänregistratorn
2. **Inom 2 veckor:** bygg front-sida på ak1nvestor.com (1 landningssida: vision,
   Fas 1-länk, Fas 2-ansökan, "boka möte", kontakt) — styrelsen har lagt detta i backlog
3. **Långsiktigt:** behåll tvådomän-strukturen; all SEO-kraft till lab, varumärkeskraft till front

## SEO-notering

Google behandlar `ak1nvestor.com` och `lab.ak1nvestor.com` som **separata sajter**.
Länka mellan dem (front → lab med tydlig länktext som "gå till utbildningen") ger
båda domänerna legitimitet. Sitemap: lab registreras i Search Console;
front registreras separat när den finns.
