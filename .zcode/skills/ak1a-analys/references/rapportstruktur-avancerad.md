# Rapportstruktur — Avancerad-nivån (mikrocap / special situation)

Standard: 99 sidor (skalas vid behov — behåll Del-numreringen). HTML med klasser från `assets/rapport.css`. Sidhuvud varje sida: `AK1A <TICKER>` + del/beteckning; sidfot: nivå + `Sida X av N`. Omslag (mörk `page-dark`), innehåll, ansvar — alltid först.

## Sidkarta

| Del | Sid | Innehåll |
|---|---|---|
| Omslag | 1 | Mörk cover: varumärke, bolag+ticker, rekommendationsbadge, pris/KPI-tabell, meta-rutnät (målgrupp, sidor, verifierad, datakälla) |
| Innehåll | 2 | Del-för-del med sidnummer |
| Ansvar | 3 | Riskdeklaration: inte investeringsråd (MAR), instrument-specifik varning (penny stock-varning med σ, drawdown, händelser), modell-/dataansvar (källor, t.o.m.-datum, kända luckor), kapacitetskrav, 4D-panel |
| I — Ekosystem-ramverket | 4–12 | Ramverk/formalism · horisonter (kalibrerade) · teorier+SAM (viktmatris deklarerad) · 4D-definitioner · Tillgångens DNA (processkaraktär, regimhistorik) · kontext-sida (fusion/emission om tillämpligt — transaktionsmatematik) · konfluensmatris · poängsättning (översättningstabell deklarerad) · Del I-slutsats (3 bärande insikter + KPI-rad) |
| II — Mikro | 13–19 | Översikt (statusrad, kalender) · EW · FIB · GANN · LUC · VOL · SAM |
| III — Kort | 20–26 | Samma mönster |
| IV — Medellång | 27–33 | Samma mönster |
| V — Lång | 34–40 | Samma mönster |
| VI — Mega | 41–47 | Samma mönster |
| VII — Fundamenta & konfluens | 48–59 | Fundamenta per horisont · konfluens per horisont · DCF + känslighetsmatris · multipelband · sensitivitet ("var modellen brister först") · fundamental slutsats |
| VIII — Scenarier & sannolikheter | 60–67 | Monte Carlo (GBM + jump) · Bull · Base · Bear · prismål-/emissionsmatris · Bayes (prior→posterior + framåtmatris) · Kelly · trigger-matris ("om X så Y") |
| IX — Riskinventering | 68–74 | Risk 1–6 (en sida var: kvantifiering, historik, motmedel) + risk 7 sammanvägd matris med korrelationsvarning |
| X — Beslut & exekvering | 75–82 | Konsensus-rekommendation (rösträkning) · portföljallokering (riskbudget, profiler) · entry-trappa · exit-strategi · hedging · skatteaspekter (ISK/KF/AF-konto, svensk kontext) · bevakningsplan · slutsats på en sida |
| XI — FAQ & ordlista | 83–87 | FAQ (bolag + metodik) · ordlista A–Z |
| XII — Källor & appendix | 88–90 | Källförteckning (per data-serie) · appendix (MC-kod/-parametrar, datatabeller) · avslutning + ansvarsfriskrivning |
| VIIIb — Special situation-tillägg | 91–99 | Vid fusion/emission: det sammanslagna bolaget · emissionsvillkor · garantistruktur · TERP-matematik · TR-arbitrage-mekanik · integration/synergier · konkurrensläge · datumprognoser · integrationsrisk + vågomprövning |

## Sidmallar (nyckelelement)

**Horisont-översikt:** ingress (händelsestatus) → statusrad-tabell (indikator/värde/läsning) → kalender (avverkat ✓ + återstående med datum) → modellram → 4D-panel.

**Teorisida:** ingress → teori-specifikt element (vågdiagram `wave-diagram`, fib-retracement-spår, gann-square, lucas-spiral, volymtabell) → teori-box (`elliott-box`/`fibonacci-box`/`gann-box`/`lucas-box`/`volume-box`) med nivåer och falsifieringsvillkor → `advanced-box` med metodreflektion → 4D-panel.

**SAM-sida:** rösträkningstabell (teori, utslag −1…+1, vikt, motivering) → operativ plan (nummerlista med nivåer/datum) → AK1A-dom-box ("domen i en mening") → 4D-panel.

**Scenariosida:** kedja (nummerlista, ✓ på realiserade steg) → matematiktabell (antagande → värde) → `scenario-grid`-kort (Bull grön/Base guld/Bear röd; prismål + sannolikhet) → dekonstruerad sannolikhet (`advanced-box`) → 4D-panel.

**MC-sida:** parametrar (S₀, σ med källa, μ-kalibrering, seed) → percentiltabell med tolkningar → variance drag-box → jump-diffusion-box → KPI-rad → 4D-panel.

**Bayes-sida:** bevisen E₁…Eₙ → likelihood-tabell med motivering → räkneexempel (nämnare, varje term) → framåtmatris (utfall → posterior → åtgärd) → disciplinregel-box → 4D-panel.

**Risksida:** kvantifieringstabell (mått, instrumentet, typisk aktie) → historik/prejudikat → motmedel/plan → 4D-panel.

**Konsensussida:** rösträkning (komponent, dom, röst −1…+1, vikt 30/30/20/20) → stor rekommendations-box → motivering i 5 punkter (varför inte högre/lägre, ärlighetsbox för tidigare fel) → 4D-panel.

## Omslagskonventioner

Badge-färg efter rekommendation: köp-toner guld/grön, sälj röd, villkorad med kvalificerare. KPI-tabell: stängning + not, MC-median, vägt mål, risknivå. Meta-rutnät: målgrupp "Avancerad", sidantal, "Verifierad" (= analysesdag), datakällor. Underrad: pris, mcap, σ, nyckelhändelser med datum.

## Formateringsregler

- Decimaler med komma (svenskt): "0,86 SEK". Procent med utrymme: "+4,9 %".
- Beräknade värderingsstorheter i kursiv/markera "[est.]" för uppskattningar.
- Gamla analysers nivåer som ogiltigförklarats märks "historik" — aldrig radera spåren.
- Varje händelseord "TR", "TERP", "BTA" förklaras i ordlistan.
- Mobilresponsiv CSS ingår i `assets/rapport.css`; ändra inte designprofilen utan användarens medgivande.
