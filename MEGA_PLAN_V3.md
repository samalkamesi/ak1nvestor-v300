# MEGA PLAN V3 — EKOSYSTEM-ORGANISMEN
**Datum:** 2026-09-02 · **Mandat:** Användarens direktiv: organ/kropp-samverkan, dashboard 1000x, redovisningsplattform med fråga-funktion, nya visuella våggrafer, Fas 2/3-verktyg, B2B-grund. "Super super Mega stort — dagar av forskning först, sedan Mega plan, sedan bygga."

---

## VISION
AK1A Research Lab blir en levande organism: varje del av plattformen är ett organ som känner av de andra. Eleven möter organismen genom **Kommandocentralen** (dashboarden) som svarar på frågor, visar kroppens tillstånd och leder utvecklingen mot Fas 2 → Fas 3 → B2B-verksamhet.

## KROPPENS ORGAN (nuvarande + planerade)

| Organ | Roll | Befintligt | V3-bygge |
|---|---|---|---|
| **HJÄRTAT** — Kommandocentralen (Min Sida) | Pumpar blod till allt eleven gör | Välfärdspanel, veckoplan, kurstips, vågkarta | + Fråga dashboarden, morgon-briefing, kroppsvy, rapport-byggare |
| **HJÄRNAN** — AI-styrelse + AI-Mentor | Beslutar, svarar, lär ut | 8 organ + chatbot + Short-Seller | + Fas 3-certifieringslogik |
| **SINNENA** — Motorerna | Uppfattar marknaden | Vågfundament, analys, konfluens, netnet | + realtime-poll, säsongs-mönster |
| **NERVSYSTEMET** — Event-bussen | Signalerna mellan organ | system_events (partiell), window-events | + ENHETLIG händelsekonvention + organ-hälsa |
| **MINNET** — Elevens kärna | Vet vem eleven är | member-local, elevkärna, navigationsminne | + Fas 2/3-profiler |
| **RÖSTEN** — Dialog-ytorna | Pratar med eleven | chatbot, Short-Seller, dashfraga | + rapport-röst (auto-sammanfattningar) |
| **SKELETTET** — Navigation + DNA | Bär allt | menyer, marin/guld-DNA | klar (v21-22) |
| **IMMUNFÖRSVARET** — Valideringen | Skyddar mot fel | validera-motorer (20 PASS) | + kontinuerlig körning i cron |
| **REPRODUKTIONEN** — Tillväxten | Föder nytt | kursbyggaragenter (313 kurser) | + B2B-organismen (/pro) |

## FASER (byggordning)

### FAS A — ORGANISMEN SAMVERKAR (första vågen, påbörjad)
1. ✅ **Fråga dashboarden** (agent pågår): deterministisk NL-intent-parser → svar ur lokal data + vågkarta. Ingen LLM krävs.
2. **Nervsystemet**: enhetlig händelsekonvention `organ.<namn>.<händelse>` → system_events (server) + window-event (UI); organ-hälsokoll i /api/organ/runda.
3. **Kroppsvy** i dashboarden: alla organs senaste signaler på ett steg (vågkartan, veckoplanens status, styrelsens senaste beslut, motorn-valideringens status).
4. **Morgon-briefing**: samlad vy (vågkarta + dagens pass + nästa kurs + streak) — kan mailas senare.

### FAS B — REDOVISNINGSPLATTFORMEN (Fas 2-elever)
5. **Rapport-byggaren**: eleven väljer (egna superanalyser + konfluensskanningar + vågmatriser + kurser) → formatterad AK1A-rapport (skrivbar PDF-vy, AK1A-DNA, disclaimers automatiskt).
6. **Analys-banken**: alla elevens analyser samlade, jämförbara över tid ("min analys av Volvo september vs december").
7. **Fas 2-tratten**: rapport-byggaren låser upp vid nivå 25 — verktygen är belöningen för utbildningen.

### FAS C — FRAMTIDA VÅGAR (deterministisk visualisering, forskning pågår)
8. **Vågkonen (fan chart)**: percentilband per horisont ur HISTORIK — "scenarier, inte spådomar" (P8-ärlighet i varje graf).
9. **Säsongs-grid, sparkline-bank (20 V), Sankey-portföljflöde** — rankade i forskningsrapporten.

### FAS D — B2B-ORGANISMEN (Fas 3-grunden, forskning pågår)
10. **/pro-sektionen**: skild värld — analytiker-inloggning, portfölj-import (CSV), rapportmallar med white-label, AKM1/AK1TS/Konfluens som rättighetsstyrda moduler.
11. **Fas 3 = certifierad AK1A-analytiker**: praktikportfölj (10 analyser via verktygen), etikmodul, rapport-kompetens → B2B-behörighet ("arbeta med oss"-vägen).

### FAS E — AI-PARALLELLISERING (15+ agenter)
12. Kursfabriken fortsätter (kanon 79/101 → 101/101), forskningsagenterna permanenta, varje våg = 6 agenter × iterationer över dagen.

## REGLER (oförhandlingsbara)
- **P8-sekretess**: intern know-how (vikter, trösklar, motorregler) läcker aldrig — varje ny komponent granskas.
- **Pedagogik.ts-tonen**: hjälpa, aldrig döma — även i B2B.
- **Determinism**: allt mätbart ger samma svar varje gång (validera-motorer utökas kontinuerligt).
- **Vercel-reglerna**: inga server actions för data, inga python-beroenden, routes + TS-motorer.
- **Bokstavligt korrekt**: åäö-sanering vid varje leverans (v250-lärdomen).

## STATUS-LOGG
- 2026-09-02 #1: Plan skapad. 5 forskningsagenter landade (organ-arkitektur w OrganEvent v1 + fyndet om trasiga Prisma-organ; dashboard w NLQ-linjen; visualisering w vågkon-√t; Fas 3 w certifieringsstrukturen A-F). **Fas A1 LEVERERAD (71da1aa): Fråga din dashboard — 11 intents, 7/7 PASS.**
- 2026-09-02 #2 **KLART (4d5f245, live+verifierad):** organkirurgin (7 Prisma-routes→Supabase — /api/styrelse/autonom 200 igen, kraschen borta!), nervsystemet (/api/kropp + organ-event.ts + KroppsvyKort), morgon-briefingen (överst i Min Sida), VÅGKONEN (8/8 matematiktest, /api/vagkon pris+v01, P8-text fast), RAPPORTBYGGAREN (/rapporter — analysbank+utskriftsbar certifikatsrapport), B2B-forskningen (MVP: CSV+mallar+white-label 499/1499/4999 kr/seat).
- 2026-09-02 #3 **KLART (844451a, live+verifierad):** /pro-MVP (landning+CSV+API+priser), Fas 3 (/fas3 certifiering A-F+etik+portfölj+ÅKU+meny), Vågkon i /vagfundament+/konfluens+per-ticker, Ljusa temat WCAG-AA (guld 5.58:1, marin-flip 7.6:1, focus 5.2:1), AI-Mentor 100% (32 sidtyper, redikering, 5+ intents, SSRF-fri vågkarta-läsning), Datacentralen (datacache.ts + cron 06:00 UTC 12×4=48 rader). **Organismen lever: alla Fas A+B1+C1+D organ samverkar.**
- 2026-09-02 #4 **KLART (8f7221e):** 3 BOKMASTER + datacache-trådat + Sankey/Säsongsgrid + Beteendetracern. 316 kurser · 84/101 kanon.
- 2026-09-02 #5 (pågår): Admin-BÅDA-VÄRLDAR (ekosystem-panel med publik+PRO tabs) + /pro/admin B2B-panel (kunder/mallar/white-label/analys-logg) + 2 kurser (Trading in the Zone, Hour Between Dog and Wolf — neurovetenskap!) + tracer-insikter i Min Sida ("Din spegel") + Sankey i Portföljbyggaren. 34 agenter idag.
