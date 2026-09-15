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
| 9 | Diff-bläddring /diff med radnummer+CJK | Gutter (dual, absolut+relativ) + ordnivå-diff + /diff-bläddringsdialog | 4 | 2 | STÄNGD (v164-nav, byggagent; tsc 0 + 26/26; deploy df882dbf) | — |
| 10 | Mermaid-förhandsvisning | 509-rad komponent (flowchart/sequence/pie, tsc 0) | 2 | 3 | STÄNGD (byggagent v168) | Rendera mermaid-block i chatt-svar (klientbibliotek) |
| 11 | Agentträd per iteration — barn syns + klickbara | 2-4 | 1-3 | STÄNGD (register-2, fabrik) | — |
| 12 | session/fork äkta (M5) | rewindTillTurn = ÄKTA session/fork (transport rad ~196) | 4 | 2 | STÄNGD (verifierad mot kod 2026-09-15) |
| 13 | TUI-scenariotest (deras testinfrastruktur) | E2E-skript finns | 2 | 3 | STÄNGD (våg 174) | node/fetch-svit (ingen playwright): verktyg/scenariotest/scenariotest.mjs, 7 scenarier + journal jsonl |
| 14 | Prompt-historik-sökning (↑ + sök) | /sök-kommando med alias sok — förifyller panelens filter (bibliotek+historik, klick infogar) | 3 | 1 | STÄNGD (v164-nav, byggagent) | — |
| 15 | Teman (config theme) | Fast mörkt (v90-beslut) | 1 | 3 | STÄNGD (designbeslut: kunden valde mörkt) | — |
| 16 | Transkriptsökning (Ctrl+Shift+F) — navigationsrond n1 | 3-4 | 1-2 | STÄNGD (navigationsronden, fabrik) | — |
| 17 | @-fil-autocomplete — fuzzy + piltangenter | 2-4 | 1-3 | STÄNGD (register-2, fabrik) | — |
| 18 | Turmarkörer + hopp — navigationsrond n1 | 3-4 | 1-2 | STÄNGD (navigationsronden, fabrik) | — |
| 19 | Hopp-till-slut — navigationsrond n2 | 3-4 | 1-2 | STÄNGD (navigationsronden, fabrik) | — |
| 20 | Paste-markörer — navigationsrond n2 | 3-4 | 1-2 | STÄNGD (navigationsronden, fabrik) | — |
| 21 | Toast-stack — staplande, självförsvinnande | 2-4 | 1-3 | STÄNGD (register-2, fabrik) | — |
| 22 | Genvägsmanager — remappbara + Inställningspanel | 2-4 | 1-3 | STÄNGD (register-2, fabrik) | — |
| 23 | LaTeX — Unicode-approximation i svar | Unicode-approx: renderInline-grenar + blockformel-extraktion (×5 i prod-trädet) | 2 | 2 | STÄNGD (r2d, 45f1a9d4) | — |
| 24 | Usage-observabilitet — v4/conversation/usage + v4/usage/stats (V4-LAGRET §2 #12-13) | lasUsage() sedan våg 85 F3 + lasV4Anvandning() våg 169 (a77bb1a3); 3 UI-konsumenter | 8 | 2 | STÄNGD (våg 169 + 85 F3; live-bevis rond 38) | Kostnads-/tokenpanel utan egna mätare |
| 25 | v4/conversation/resync (V4-LAGRET) | LEVERERAD — våg 172 (2cf13fe5): lasV4Resync + stale-utmattning→resync→sista försök + unsubscribe-hygien + /api/studio/tjanster/resync-v4 | 9 | 3 | STÄNGD (våg 172) |  Hållbart fileChanges-spår |
| 26 | sessions-index topic (V4-LAGRET) | Saknas — realtime-index | 7 | 3 | ÖPPEN → VÅG 173 | Tränger undan poll-lagret |
| 27 | v4/command + commands/query (V4-LAGRET) | Saknas — inbox/kö | 10 | 6 | ÖPPEN (etapp 2) | Högst råvärde men komplex |

## Redan stängda denna evolution (bevisade i prod)
Trådspermanens (v148) · modellsminne (v150) · målpermanens (v152) · fyra lägen (v153)
· varm-GET (v154) · uppdragsmotor (v156) · komprimering 3-tier (v160) · audit (g3)
· juridikgrind GRÖN (g2) · integritetsvakt (g5) · generateText (m7) · Mentor 2.1 ·
SessionStart-telemetri · puls 5 s · auto-compact 80 % · tri-state modellstatus ·
agent-träd (11, r2e) · transkriptsök+tur-hopp (16+18, n1) · hopp-till-slut+paste (19+20, n2) ·
keybinding (22, r2c) · LaTeX (23, r2d) — rond 30 stängde 7 gap; rond 38 stängde
10 (Mermaid, våg 168 `48e14864`) + 24 (usage, våg 169 `a77bb1a3` på våg 85 F3:s
stats-ground; live-bevis: 401-härdade rutter, bygg 17:29 efter commit, 3 UI-paneler)
och reparerade registrets korrumperade tabellrader (23/24/27). Återstår ÖPPNA: 26 (sessions-index → våg 173) · 27 (v4/command, etapp 2). Rond 41 stängde 13 (scenariotest, våg 174: 7/7 PASS mot körande prod — 10 skyddade rutter rena 401, SSE-läckage 0, publik hälsorutt 200 med 0 hemlighetsmarkörer, resync POST 405; sviten kalibrerad mot requireAdmin:s delade fel-bucket 10 fel/min med 7 s-pacing + 429-tolerans; journal data/vakten/scenariotest/journal.jsonl). Rond 40 stängde 25 (resync, våg 172 `2cf13fe5`: transport-metod + interface + mock + stale-utmattningsintegrering + unsubscribe-hygien i stangHelt + observabilitetsrutt; live-bevis: rutter GET 401 + POST 405 live på localhost (monterad+härdad), bygg 21:08 efter commit 2cf13fe5 20:57, 2cf13fe5 ancestor till prod HEAD 91a1a52b, prod HTTPS 200).

## Evolutionära regler
1. Ronden läser registret FÖRRE verkställning (styrelse-rond punkt 9) — högsta ÖPPNA V/A-kvot först.
2. Ett gap stängs ENDAST med live-bevis (E2E/prod-svar) — annars förblir ÖPPEN.
3. Ny forskning (releasenoteringar vid `npm view zcode-app-cli version`, nya kapitel,
   kundrapporter) tillför/omrankar poster — registret är levande.
4. Kundens designbeslut (t.ex. fast mörkt tema) är STÄNGDA-som-beslut, ej gap.
