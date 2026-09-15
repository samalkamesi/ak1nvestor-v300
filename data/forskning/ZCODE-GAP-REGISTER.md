# ZCODE-GAP-REGISTRET — den evolutionära motorn (kundvision: EXAKT samma som z code)

> Kunddirektiv 2026-09-15: "utveckla studio mot vision exakt samma som Z code, se allt
> z code har, forska på nätet, läs böcker, utveckla evolutionärt."
> Metod: varje rond väljer registrets högst rankade ÖPPNA gap, stänger det, bevisar
> det, och sänker posten till STÄNGD. Registret växer av forskning (kapitel,
> releasenoteringar, dokumentation, nätet). Evolutionsloopen: mät → välj → stäng → mät.

## Källor (underhålls löpande)
- 13 kapitel i `zcode-kallkod/` (protokoll, motorer, vakter) · källklon `/home/ak1a/forskning/zcode-cli`
- Releasenoteringar (npm latest = 3.11.2-24 — vi KÖR senaste; nyheter nedan)
- docs/CONFIGURATION.md + HOST_INTEGRATION.md + README

## Registret (rankat; V = kundvärde 1-5, A = ansträngning 1-5, steg = nästa evolutionära steg)

| # | Gap (z code har) | Studio idag | V | A | Status | Evolutionärt steg |
|---|---|---|---|---|---|---|
| 1 | Helskärmsläge (3.10.1) | Fullscreen API + panel-döljning | 3 | 2 | STÄNGD (732c870e, deploy 02:02) | Studio: helskärmsknapp (Fullscreen API) + dolda paneler + en-tangent |
| 2 | Nummertangs-snabbval i dialoger (3.11.2-23) | Siffertangentar 1-9 | 3 | 2 | STÄNGD (732c870e) | Interaktionsdialoger: siffertangenter 1-9 = alternativ |
| 3 | Ctrl+C rensar utkast (3.10.2-19) | Esc rensar fältet | 3 | 1 | STÄNGD (732c870e) | Esc/Ctrl+C rensar inmatningsfältet (utkastet är ändå persistat) |
| 4 | Notiser vid tur-avslut (notifications unfocused) | Web Notification API vid klart + aktiveringsknapp | 4 | 2 | STÄNGD (evolution V1, e2) | Web Notification API vid klart när fliken ej fokuserad |
| 5 | Bakgrundssynk modellkatalog (3.11.2-22) | 8 s efter init, ej blockande + auditrad | 3 | 2 | STÄNGD (d81bacfe) | Bakgrundsuppdatering av /api/studio/modeller vid uppstart |
| 6 | Serialiserade permission-dialoger (3.11.2-24) | KONTROLL-DOM: STÄMD — starkare än källan (30 s-timeout + fulla avvisningsvägar; serverside FIFO) | 3 | 1 | STÄNGD (KONTROLL-6-PERMISSION.md) | Kantnotering: klient-multi-pending — fix-skiss i domen |
| 7 | Isolerade subagent-events (3.11.2-21) | KONTROLL-DOM: STÄMD — tre oberoende lager (sessions-prenumeration, sessionId-vakt, tyst fallthrough); frivillig härdning: 5-nivå-sessionId | 3 | 2 | STÄNGD (KONTROLL-7-SUBAGENT-ISOLERING.md) | — |
| 8 | Kopiera-vid-markering (copy-on-select, 3.10.2-18) | Webb nativ ✓ | 4 | 1 | STÄNGD | — |
| 9 | Diff-bläddring /diff med radnummer+CJK | KONTROLL-DOM (2026-09-15): CJK ✓ budget ✓ — GAP: radnummer-gutter, ordnivå-diff, /diff-bläddrare (skissa i KONTROLL-9-DIFF.md) | 4 | 2 | ÖPPEN (3 delgap) | Verkställ KONTROLL-9:s fix-skiss (AndringsPanel ~2838, DiffForhandsvisning ~2885 + nytt /diff-kommando) |
| 10 | Mermaid-förhandsvisning | Saknas | 2 | 3 | ÖPPEN | Rendera mermaid-block i chatt-svar (klientbibliotek) |
| 11 | Agent-träd förälder/barn med resume | Subagentlista+avbryt finns; TRÄD saknas | 4 | 3 | ÖPPEN | Trädvy per iteration (barn klickbara → öppna session) |
| 12 | session/fork äkta (M5) | rewindTillTurn = ÄKTA session/fork (transport rad ~196) | 4 | 2 | STÄNGD (verifierad mot kod 2026-09-15) |
| 13 | TUI-scenariotest (deras testinfrastruktur) | E2E-skript finns | 2 | 3 | ÖPPEN | Scenariotest-suite för studions flöden (playwright?) |
| 14 | Prompt-historik-sökning (↑ + sök) | ↑ finns; sök i historiken saknas | 3 | 1 | ÖPPEN | Sök i promptbiblioteket/historiken |
| 15 | Teman (config theme) | Fast mörkt (v90-beslut) | 1 | 3 | STÄNGD (designbeslut: kunden valde mörkt) | — |

## Redan stängda denna evolution (bevisade i prod)
Trådspermanens (v148) · modellsminne (v150) · målpermanens (v152) · fyra lägen (v153)
· varm-GET (v154) · uppdragsmotor (v156) · komprimering 3-tier (v160) · audit (g3)
· juridikgrind GRÖN (g2) · integritetsvakt (g5) · generateText (m7) · Mentor 2.1 ·
SessionStart-telemetri · puls 5 s · auto-compact 80 % · tri-state modellstatus.

## Evolutionära regler
1. Ronden läser registret FÖRRE verkställning (styrelse-rond punkt 9) — högsta ÖPPNA V/A-kvot först.
2. Ett gap stängs ENDAST med live-bevis (E2E/prod-svar) — annars förblir ÖPPEN.
3. Ny forskning (releasenoteringar vid `npm view zcode-app-cli version`, nya kapitel,
   kundrapporter) tillför/omrankar poster — registret är levande.
4. Kundens designbeslut (t.ex. fast mörkt tema) är STÄNGDA-som-beslut, ej gap.
