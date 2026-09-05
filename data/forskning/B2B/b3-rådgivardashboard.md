# B3 — RÅDGIVARENS COCKPIT: dashboard-forskning för AK1A PRO

**Datum:** 2026-09-04 · **Uppdrag:** Kundvisionen "dashboard som är exceptionell för RÅDGIVARE m.m." ·
**Metod:** Webbresearch (advisor-tech 2026, NN/g dashboard-UX, screening-workflows, GDPR/EDPB) syntesad
mot repo-läsning: `akm2-dashboard.tsx`, `korstabell.tsx`, `/api/portfolj-forskning`,
`trafik-sakerhet-panel.tsx`, `/pro/admin` (ProAdminPanel), `/rapporter` (Rapportbyggaren),
Supabase-inventory (362 tabeller) samt `data/rapporter/forskning-b2b.md` (B1-grunden).
**Föregångare:** forskning-b2b.md (affären) → detta dokument (produktens informationsarkitektur).

**Kärnslutsats:** AK1A har redan 80 % av råvaran för en exceptionell rådgivardashboard —
radarn, korstabellen (100 bolag × AKM1/AKM2/peer/våglägen), vågvalideringens träff-%, regimen
och rapportbyggaren. Det som saknas är inte motorer utan **en cockpit som sammanfogar dem i
rådgivarens arbetsordning**: morgonronden → screening → klientmötet → rapporten. Bygg den som
fyra vyer ovanpå befintliga API:er, med klientregistret (och därmed GDPR-rollen som
personuppgiftsbiträde) som en medvetet sen fas — MVP:n klarar sig på helt personuppgiftsfri data.

---

## DEL 1 — Webbresearch: vad som gäller för advisor-dashboards 2026

### 1.1 Mönstret hos vinnarna (Morningstar/Koyfin-klassen)

- **Morningstar Direct Advisory Suite** (fd Advisor Workstation) är referensen: klientöverblick
  med risk-score + allokering + prestanda på en skärm, 15+ "FINRA-reviewed" klientrapporter,
  och portfolio-X-ray (drift/diversifiering) som eget rapportflöde. Viktigt: Morningstar är
  **inte** en handelsplattform — rådgivaren researchar och rapporterar där, genomför elsewhere
  (morningstar.com 2024 IR-Q&A). Det är exakt AK1A:s positionering: beslutsstöd, inte execution.
- **Koyfin Advisor-spåret** (B1 §1.2): importera prospektets depå → analysera → klientfärdig
  rapport; rapportvolym som pristrapp (10→200/mån). "Centralized wealth dashboard" som förenar
  portföljer, planering, rapport och kommunikation i EN vy är den mest citerade 2026-trenden i
  advisor-stacken (Nextvestment, Deelo, StockAlarm-genomgångar).
- **Screening-workflowens kanon** (TradesViz/Simply Wall St/ScreenerHub): bygg filter →
  **spara som namngiven screening** → befordra träffar till bevakningslista → automatisk
  övervakning/alerts. En engångsfiltrering är inte en workflow; det återanvändbara spåret är.
- **Dashboard-IA (NN/g + praktiker):** börja med frågorna instrumentet måste svara på, inte
  mätvärdena; längd/2D-position är de preattentiva attribut dashboards ska utnyttja
  (NN/g "Dashboards: preattentive"); progressive disclosure — det avancerade på sekundär nivå
  (NN/g); 5-sekunderstestet som grynpärm: vad förstår en ny användare på 5 s? Pod → detail
  (översikt → klient → bolag) är den dominerande navigationen i GoodData/Pencil&Paper-mönstren.
  AK1A-DNA:t ligger redan rätt: text bär alltid betydelsen, färg är stöd (färgblint-mönstret).

### 1.2 Översättning till AK1A (tre nyckelinsikter)

1. **Rådgivarens dag har en sekvens** (morgonrond → screening → klientmöte → rapport).
   Dashboarden som speglar sekvensen slår dashboarden som bara visar data — det är skillnaden
   mellan "exceptionell" och "fullspäckad".
2. **Rapporten är produkten, dashboards är produktionen.** Morningstar lägger hela
   Presentation Studio som egen modul; Koyfin prissätter rapportvolym. Cockpitens
   rapportknappar är därför primär-UI, inte bonus.
3. **Ingen konkurrent har en metodik-aggregerad klientvy** (våglägen × AKM2-profil ×
   träff-% × regimen per klient) — det är samma blå hav som B1 identifierade för rapporter,
   nu i dashboard-format.

---

## DEL 2 — ARKITEKTURFÖRSLAG: "RÅDGIVARENS COCKPIT" (/pro/cockpit)

Navigation: vänsterrad med fyra fasta vyval + klientväljare. Skal-Pod → Detail. Allt i
PRO-skalet (marin vägg, PRO-badge — återanvänd `pro/layout.tsx`). Samma auth-rad som
/pro/admin (ADMIN_PASSWORD → `/api/admin/auth` tills riktiga seats finns i fas 2).
Lås-rad på samtliga fyra vyer: "Pedagogisk forskning — inte investeringsrådgivning (2007:528)."

### (a) KLIENTVYN — `/pro/cockpit/klienter`

**Syfte:** allting om en klient inför mötet, på en rullning.

| Zon | Innehåll | Källa i repo (idag) |
|---|---|---|
| Korthuvud | alias, risknivå/takt, nästa uppföljning, senaste rapport | ny (fas 2) |
| Portföljöversikt | innehav × vikt + aggregerad vågprofil per horisont | `client_portfolios`-mönstret + `byggPortfolj` (`riskportfolj.ts`) |
| AKM1/AKM2-profil | radar + profiljämförelse **på portföljns tunga innehav** | `Akm2Radar`, `ProfilJamforelse` i `akm2-dashboard.tsx` (ren import — komponenterna är redan prop-drivna) |
| Våglägen | fundamental+teknisk vågklass 5 horisonter per innehav (VagCell-rader) | `korstabell.tsx` cell-mönster |
| Nästa uppföljning | datum + vad som ändrats sedan sist (differens-chip) | ny (fas 2) |

Datamodell-mappning: se DEL 3. I **MVP visas "demoklienten"** = rådgivarens egen CSV-portfölj
(ingen personuppgift!) så att vyn är byggd och testad innan klientregistret finns.

### (b) SCREENING-VYN — `/pro/cockpit/screening`

**Utgångspunkt: korstabellen är redan screeningverktyget** — 100 bolag, sök, sortering på
AKM1/AKM2/peer, gruppering per bransch, intervall-chips. Cockpiten bygger PÅ detta, ersätter ej:

- **Filterfält utöver sök:** status (grön/gul/röd), vågklass per horisont (t.ex. "fundamental
  lång = impulsvåg"), täckning ≥ x %, golv-% intervall — allt data som redan finns på
  `KorstabbellRad` (src/lib/portfolj-forskning/typer.ts).
- **Sparade screeningar** (r3-mönster från 1.1): namnge filterkombinationen → `/pro/cockpit`
  startar morgonronden med "dina screeningar + nattens ändringar" (jämför gårdagens snapshot).
- **Peer + intervall är redan B2A:** peer-percentil, branschmedian, ensidigt felstreck —
  rådgivarens "60 i teknik ≠ 60 i finans"-läsning finns färdig (VÅG 59).
- **Befordran:** rad → "lägg till i klient X:s bevakning" (fas 2) / "öppna i djupanalys"
  (länk till forskningsbibliotekets `[ticker]`-sida som redan finns).

### (c) RAPPORTFLÖDET — `/pro/cockpit/rapporter`

**Status i dag:** analysfabrikens server-PDF finns **inte** — package.json har ingen PDF-väg
(ingen react-pdf/puppeteer). Däremot finns Rapportbyggaren på `/rapporter`: klient-side
sammanslagning av analyser till utskriftsklassat HTML (`window.print()` + `@media print`
med marin omslagsband, tabular-rader, auto-disclaimers, localStorage). Tre låsta mallar +
white-label-fält (företagsnamn/logotyp-URL/färgtema) finns redan som UI-kontrakt i
ProAdminPanel (`pro-admin-v1`).

**Byggväg:** MVP = flytta Rapportbyggarens motor bakom inloggning som `/pro/cockpit/rapporter`
med white-label-blocket **i dokumentet, inte bara i admin**: omslagsbandet byter från
AK1A-signatur till `[firmnamn] × AK1A-metodik`, mal-låst metod-/risk-sida följer alltid med
(B1 §5.3: white-label ändrar avsändare, aldrig ansvarsblanketten). Utskrift = window.print
(behöver inget nytt beroende). Server-PDF (@react-pdf/renderer enligt B1 §3) först i fas 3
när volym/klientleverans motiverar. Rapportkvot-räknaren (Koyfin-mönstret) kan redan i MVP
räknas i localStorage → äkta i fas 2.

### (d) MORGONRONDEN — `/pro/cockpit` (startsidan)

Rådgivarens 5-sekundersvy — fyra kort i radial grid, samma layout-DNA som
trafik-sakerhet-panelen (kort-grid + sparklines + 60 s-poll är redan ett beprövat mönster):

1. **Vågvalidering-träff %** — ur `/api/cron/vagvalidering`-loggens träff-% per
   (horisont, klass); "modellens eget kvitto" är en ärlighets-signal ingen konkurrent visar.
2. **Regimen** — AKM3-regim-chippet (hash-kedjade regime-loggen, redan i ForskningslageKort)
   + N-vakt-status; rådgivaren ser MARKNADENS läge före klienternas.
3. **Veckans research** — senaste ur forskningsbiblioteket/kunskapsflödet + kalibreringens
   Φ-status (akm3-kalibrering-SENASTE-mönstret).
4. **Dina screeningar + klient-rörelser** — nattens ändringar mot sparade screeningar
   (b) och klienternas vågläges-skiften sedan förra kontroll (a).

---

## DEL 3 — DATAMODELL I SUPABASE + GDPR-RAMEN

### 3.1 Befintligt att bygga på (inventerat)

- `members` (id, email, namn, member_type free/premium/pro, xp …) — rådgivar-kontot.
- `client_portfolios` (id, member_id, name, analysis_status pending/completed, total_value) —
  **klientportföljer finns redan som begrepp** (används av /api/admin/members + kundbild).
- `system_events` — hash-kedjad händelselogg (Bana B-ronder); återanvänd som cockpitens
  spår: rapport exporterad, screening sparad, klient visad.
- REST-mönstret `getSupabaseRest()` (service key, server-side only) är etablerat i alla
  admin-API:er — cockpit-API:er följer samma lås-rad.

### 3.2 Nya tabeller (fas 2 — INTE i MVP)

```
pro_organisation   (id, namn, logotyp_url, fargtema, rapportkvot_man, skapad)
pro_seat           (id, org_id, member_id fk members, roll, aktiv)
pro_klient         (id, org_id, klientkod EJ namn+pnr, riskniva, takt,
                    nasta_uppfoljning, anteckning, skapad, raderad_vid NULL)
pro_klientinnehav  (id, klient_id, ticker, antal|vikt, hamtad, kalla)
pro_screening      (id, seat_id, namn, filter_json, senast_kord)
```

Designregler: klienten bärs av **kod/alias** (rådgivaren har namnkopplingen i sitt CRM —
dataminimering); innehav = ticker+vikt, aldrig personnummer/skuldlista (B1 §4.2 designregel);
RLS: org_id-scoping per seat; `system_events`-append vid varje läs/extract av klientvy
(tillsynsbarhet). **Fortsätt ALDRIG på de 350+ legacy AI-organ-tabellerna** — nytt namnrymdu
`pro_` (databasens 17,7M-raders-kris 2026-08-23 är skälet nog).

### 3.3 GDPR — den korta juridiska ramen

- **Rollerna:** så länge cockpit lagrar rådgivarens klienter är **rådgivaren
  personuppgiftsansvarig** och **AK1A personuppgiftsbiträde** (EDPB 07/2020; IMY:s
  vägledning). Det kräver **PUB-avtal (art. 28) innan första klientuppgiften** — därför
  fasindelningen: MVP+rapportflödet på personuppgiftsfri data (egen CSV, alias) = ingen
  biträdesroll alls ännu.
- **Dataminimering är produktdesign, inte policybilaga:** klientkod + innehav räcker för
  alla fyra vyerna; ekonomiska uppgifter behandlas restriktivt (IMY lyfter just ekonomi).
- **Underbiträden:** Supabase (databas) + Vercel (körning) ska stå i PUB-avtalets
  underbiträdeslista; EU-region verifieras.
- **Registrerades rättigheter** (radering/utdrag) blir triviala med 3-tabellers registret +
  mjuk radering (`raderad_vid`) — rådgivaren som ansvarig exporterar, AK1A verkställer.
- Precedens i egen kod: trafik-panelens "IP endast som 8-teckens hash" är samma
  privacy-by-design-ton cockpiten ska håva.

---

## DEL 4 — FASNING

| Fas | Innehåll | Nya tabeller | GDPR |
|---|---|---|---|
| **MVP (våg 61+)** | Morgonronden (a−) + Screening-vyn med sparade filter (localStorage) + Rapportflödet = Rapportbyggare-motorn bakom /pro med white-label-block; Klientvyn körs på "demoklient" (egen CSV, alias) | 0 | Ingen personuppgift — ingen PUB needed |
| **Fas 2 — klientregister** | pro_-tabellerna, klientvy på riktiga klienter, bevakning, nästa uppföljning, differens-sedan-sist, system_events-spår, seats | 5 | PUB-avtal + dataminimering GRIND till go-live |
| **Fas 3 — white-label-rapporter** | Server-PDF (@react-pdf/renderer, B1 §3), rapportkvot per seat, Stripe-per-seat, mallbibliotek på sikt | + ev. pro_rapport | Samma; kolofon-logg i system_events |

---

## TRE REKOMENDATIONER

1. **Bygg i rådgivarens sekvens, inte i dataordning** — börja med Morgonronden + Screening
   (allt data finns; 0 nya tabeller; 5-sekundersvägen enligt NN/g). Klientvyn byggs som
   "demoklient" i MVP så att prop-gränssnittet (Akm2Radar/KorstabbellRad) bevisas innan fas 2.
2. **Låt PUB-avtalet vara fas-2-grinden.** Klientdata = personuppgifter; designa med
   klientkod+ticker-vikt (dataminimering som produktbeslut) och undvik därmed hela frågan i
   MVP — det är det billigaste juridiska skyddet som finns: att inte ha data.
3. **Rapportvägen: print först, PDF sen.** Återanvänd /rapporter-motorn + white-label-fält
   (kontrakten finns redan i ProAdminPanel) bakom /pro — noll nya beroenden; server-PDF och
   rapportkvot väntar till fas 3 när betalande volym finns (Koyfin-mönstret: volym = pristrapp).

---

## KÄLLOR

**Advisor-tech 2026:** [Morningstar Direct Advisory Suite](https://www.morningstar.com/business/products/direct-advisory-suite) · [Morningstar Advisor Workstation UK](https://www.morningstar.com/en-gb/products/advisor-workstation) · [Morningstar IR-Q&A 2024 (research/reporting, ej execution)](https://newsroom.morningstar.com/news/news-details/2024/Could-you-explain-the-difference-between-the-Advisor-Workstation-sub-segment-and-the-Morningstar-Wealth-segment-which-both-seem-to-cater-to-advisors/default.aspx) · [Portfolio Report Builder-dokumentation](https://workstation.morningstar.com/support/article/bltee91d015a7b6cf42/PortfolioReportBuilder) · [Nextvestment — Digital and AI tools 2026](https://nextvestment.com/resources/blog/digital-tools-financial-advisors-2026) · [Deelo — advisory software guide 2026](https://deelo.ai/blog/financial-advisory-software-complete-guide-2026) · [StockAlarm — RIA-stack 2026](https://pro.stockalarm.io/blog/financial-advisor-tools-guide) · [Webtonic — advisory dashboard-statistik 2026](https://www.webtonic.io/blog/financial-advisory-dashboards-statistics) · [YCharts — streamline your practice](https://get.ycharts.com/resources/blog/the-ultimate-guide-to-streamlining-your-financial-advisory-practice/)

**Dashboard-UX/IA:** [NN/g — Dashboards: preattentive attributes](https://www.nngroup.com/articles/dashboards-preattentive/) · [NN/g — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) · [NN/g — IA Study Guide](https://www.nngroup.com/articles/ia-study-guide/) · [GoodData — sex principer för dashboard-IA](https://www.gooddata.ai/blog/six-principles-of-dashboard-information-architecture/) · [Pencil & Paper — dashboard UX patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards) · [UX Pilot — 12 principer + 5-sekunderstest](https://uxpilot.ai/blogs/dashboard-design-principles) · [Baymard — IA-vägledning](https://baymard.com/learn/information-architecture-ux)

**Screening-workflows:** [ScreenerHub — screening routine](https://screenerhub.app/learn/how-to-build-a-stock-screening-routine) · [TradesViz — Save Snapshot-mönstret](https://www.tradesviz.com/blog/real-time-stock-screener/) · [Simply Wall St — screener-dokumentation](https://support.simplywall.st/hc/en-us/articles/10543502387727-Stock-Screener-Key-Features-and-How-Tos) · [StockInvestorIQ — screenderbaserad due diligence](https://stockinvestoriq.com/how-to-use-stock-screeners-effectively/)

**GDPR:** [IMY — personuppgiftsbiträdesavtal](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/personuppgiftsansvariga-och-personuppgiftsbitraden/personuppgiftsbitradesavtal/) · [EDPB riktlinjer 07/2020 (SV)](https://www.edpb.europa.eu/documents/guideline/guidelines-072020-on-the-concepts-of-controller-and-processor-in-the-gdpr_sv)

**Internt:** data/rapporter/forskning-b2b.md (B1 — priser, mallar, compliance) ·
src/components/ak1a/akm2-dashboard.tsx · .../portfolj-forskning/korstabell.tsx ·
src/app/api/portfolj-forskning/route.ts · src/components/ak1a/admin/trafik-sakerhet-panel.tsx ·
src/components/ak1a/pro/admin-panel.tsx · src/app/rapporter/page.tsx ·
src/app/api/cron/vagvalidering/route.ts · data/supabase-inventory.json · MORNING_BRIEF.md
