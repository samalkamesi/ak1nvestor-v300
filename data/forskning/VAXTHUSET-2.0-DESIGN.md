# VÄXTHUSET 2.0 — plattformen där vem som helst bygger sin sida med AK1A-systemet

Rond 283 (2026-09-28) · kunddirektiv: "system som vem som helst ska kunna nyttja
såsom jag gör för att bygga egna sidor precis som jag gör med min sida —
exceptionellt system, kombo av allt" · fortsättning på växthuset-utredningen
(V111) med Kundens NU-varande beställning: BYGG.

## VISION

Kunden byggde lab.ak1nvestor.com genom att prata med en agent (studion) som
arbetar autonomt i en arbetsyta med regelverk, minne och kvalitetsgrindar.
Växthuset 2.0 gör samma upplevelse till en produkt: en hyresgäst registrerar
sig, pratar med SIN agent, och agenten bygger hyresgästens egen sida — med
samma disciplin (grindar, bokföring, versionshistorik) som kundens eget bygge.

## ARKITEKTUR (fem lager)

1. **PORTALEN** (studio-evolutionen): /bygg — registrering + inloggning per
   hyresgäst (Supabase auth, ny schema-grupp `vaxthus`), dashboard: min sida,
   min agent-chatt, publiceringsstatus. Admin-vy (kungen) ser alla hyresgäster.
2. **ARBETSYTAN** (per hyresgäst): `/home/tenants/<slug>/` — eget git-repo från
   `mallar/grund-mall` (Next.js-skal med innehållsstruktur), TENANT-AGENTS.md
   (hyresgästens varumärksregler + juridiska grindar), eget minne, sessions-
  historik. Isolering = separata processer + kataloger (v146-mönstret skalerat).
3. **BYGGAREN** (agenten): hyresgästen chattar i portalen → app-server-session
   i hyresgästens yta (samma protokoll som studion idag) → agenten bygger
   sidan iterativt. KVALITETSGRINDAR per yta: tsc-0, förhandsvisning, ALDRIG
   publicera utan hyresgästens godkännande (= hyresgästens R2).
4. **PUBLICERINGEN**: `<slug>.ak1nvestor.com` (wildcard-DNS → R2-kundsteg hos
   one.com) — nginx wildcard vhost + per-yta-bygg (`.next` per hyresgäst ELLER
   statisk export i Fas 1 = enklare + billigare). Custom-domäner = Fas 3 (R2).
5. **EKONOMIN**: API-kostnad per hyresgäst mäts (v112-kostnadsfitness-mönstret:
   tokens per landad ändring), kvot/tak per nivå, rate-limit. PRISER = R2.

## FASER

- **FAS 1 — MVP (autonomt byggbar, målbild ~v191-v196)**: grundmallen +
  /bygg-portalen (registrering stängd: ENDAST kunden som testhyresgäst) +
  agent-chatt som bygger i en test-yta + förhandsvisning på
  `<slug>.test.ak1nvestor.com` via hosts/match-test tills wildcard-DNS:n finns
  + bokföring. Bevis: kunden bygger en testsida via portalen själv.
- **FAS 2 — SELFSERVICE**: öppen registrering, kvoter + metering,
  betalnings-hookar (Stripe etc. = R2), villkor/GDPR-flöden (R2-juridik).
- **FAS 3 — EKOSYSTEM**: custom-domäner, mallbibliotek (branschmoduler —
 SEO-spårets guide-mönster), ev. marketplace.

## R2-BESLUT SOM VÄNTAR KUNDEN (publicerat i sessionen)

1. Wildcard-DNS: `*.ak1nvestor.com` → 208.87.129.108 hos one.com (behövs till
   Fas 1:s publika test — kan byggas och testas internt innan).
2. Prissättning hyresgäster (månadsavgift/tiers + vad som ingår).
3. API-kostnadsbudget per hyresgäst (tak där agenten pausar).
4. Villkor + juridik (GDPR/DPA för hyresgästernas besöksdata) — Fas 2, men
   tidig kundsyn önskas.

## KÄLLOR OCH ÄRVDA MÖNSTER

- V111/V112-utredningarna (hinder: API-villkor, kostnad, multi-tenancy) —
  Fas 1 kringgår published-blockeringarna (stängd registrering = ingen extern
  försäljning ännu, kundens egen server + kundens eget konto).
- v146 agentfabrik (RAM-vakt, omgångar) — skalerat per-yta.
- v156 kunduppdragsprotokollet ("en order jobbas KLART") — hyresgästens order
  får samma definition-of-done.
- Kvalitetsgrind-kulturen (tsc-0, pre-commit, förhandsvisning före publicering).
