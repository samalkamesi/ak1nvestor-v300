# AK1A-kvantmetoder — Monte Carlo, scenarier, Bayes, Kelly, risk

Alla metoder nedan är implementerade i `scripts/` — kör skripten, återanvänd utdata. Detta dokument definierar *hur de ska tolkas och parameteriseras*.

## Monte Carlo — GBM + tvåtillstånds-jump-diffusion

**Modell:** S(t+dt) = S(t)·exp[(μ−σ²/2)dt + σ√dt·Z], Z ~ N(0,1), dagliga steg (252/år), N = 10 000 pathar, seed låst (= analysesdag YYYYMMDD) → reproducerbar.

**Parameterisering:**
- S₀ = senaste stängning. σ = *realiserad* volatilitet i aktuellt regime (t.ex. 21 dagar × √252), inte bara 12-månadsgenomsnitt — dokumentera vilken och varför.
- μ kalibreras mot det viktade scenarioväntevärdet: μ = ln(EV/S₀)/T. E[S_T] = EV per konstruktion — skriv det, MC är ingen oberoende prognos.

**Rapportera alltid:**
- Percentiler P5/P10/P25/**P50**/P75/P90/P95 + E[S_T].
- **Variance drag:** median = S₀·exp[(μ−σ²/2)T] < medel vid hög σ. Vid σ ≈ 99% äter σ²/2 ≈ 49 pp av driften — "rätt riktning, fel median" är den matematiska kärnan.
- **Terminal- OCH touch-sannolikheter** per nivå (P(max > X) ≫ P(S_T > X)) — touch driver trappade exiter.
- P(min under perioden < stoppnivå) — avgör stoppdesign (veckostängning vs intradag).

**Jump-diffusion (Merton):** lägg diskreta hopp vid kända binära händelser (emissionsutfall, rapport), driftkompenserade så E[S_T] bevaras: hopp i = {storlek, sannolikhet} per utfallsgren. Lärdomen att dokumentera: i händelsedrivna regimer är det *σ-regimen*, inte hoppen, som dominerar svanssannolikheterna.

**Tolkning:** GBM är referensfördelning, inte prognos. Verkliga utfall i händelsedrivna aktier är klustervis diskreta (magnetnivåer eller rekyl), inte lognormalt utsmetade. Scenariomodellen bär sannolikhetsmassan; MC kvantifierar bruset kring den. GBM falsifieras vid varje händelsehopp — därav jump-lagret.

## Scenariobygge — Bull / Base / Bear

Varje scenario levereras med:

1. **Kedja** — steg-för-steg (✓ för realiserade steg), mot bakgrund av händelsekalendern.
2. **Kedjematematik** — P(scenario) = produkten av dellänkar, varje länk motiverad (t.ex. 0,45 × 0,60 × 0,80 ≈ 21% → håll 20%, inte högre). Base är per konstruktion ~P(intet går sönder): om två oberoende delar kräver ~70–75% var → ~0,72² ≈ 50%.
3. **Värderingsmatematik** — intäkt → EBITDA/marginal → multipel (mot peer/prejudikat, motivera) → motiverat börsvärde (inkl. kassa) → SEK/aktie på *fullt utspädd* aktiestock. Prismålet knyts till teknisk referensnivå (GANN/fib-konfluens) där möjligt.
4. **Ogiltigförklaring** — vilket utfall som dödar scenariot (t.ex. "Bull ogiltig vid utfall < 91% eller synergier < 32 M").

**Väntevärdesraden (öppen redovisning):** E[mål] = p_bull·bull + p_base·base + p_bear·bear. Räkna också bryt-jämn: vid vilket p(bear) blir E[mål] = spot? Samtliga mål över spot = antingen asymmetri eller felkalibrerade odds — väck alltid den frågan (Kelly-sektionen nedan).

## Bayes — prior → posterior

P(Hᵢ|E) = P(E|Hᵢ)·P(Hᵢ) / Σⱼ P(E|Hⱼ)·P(Hⱼ)

- **Prior** byggs från kedjematematiken (ovan), dokumenterad med byggprocess.
- **Bevis E** = iakttagna händelser sedan prior: TERP-zon-brott, TR-kollaps, volymklimax, kurs vid scenariomål. Varje bevis explicit med likelihood-motivering per hypotes (LR-kvoter).
- **Framåtmatris:** för varje kommande trigger (emissionsutfall, rapport) definieras likelihood-rader per utfallsgren → färdiga posteriors *före* nyheten landar. Rutan "om X → posterior Y → åtgärd Z" förskrivs — inget beslut improviseras.
- **Trösklar (förskrivna):** t.ex. Bear-posterior > 70% → avveckla mekaniskt; uppgradering först vid definierat starkt utfall + kursbekräftelse med volym.
- **Disciplinregel:** uppdatera aldrig på känsla — endast på fördefinierade bevis. Ordningen vid varje trigger: uppdatera Bayes först, agera sedan — aldrig omvänt.

## Kelly — när formeln ljuger

- **Diskret Kelly** från scenarios: f* maximerar E[ln(1+f·R)]. Om alla scenariomål ligger över spot → q = 0 → f* divergerar. Diagnos: *en modell utan förlustgren i en aktie som just fallit kraftigt är inte kalibrerad — den är fel.* Marknadspriset är själv evidens (informationsasymmetri, inaktuella mål, icke-kalibrerade sannolikheter).
- **Kontinuerlig (Merton):** f* = μ/σ². Med scenario-kalibrerad μ = +37% och σ² = 0,98 → ~38%; med marknadens implicita drift μ ≈ 0 → 0. Spannet 0–38% *är* modellosäkerheten i ett tal.
- **Verklighetsfilter (dokumentera kedjan):** modellosäkerhetsrabatt ~1/10 av full Kelly → volatilitetsbudget (storlek ∝ 1/σ; σ 99% vs index 15–20% ger faktor ~1/6) → halvering före binärt utfall → likviditetstak och riskbudget.
- **Slutlig storlek sätts av riskbudgeten:** storlek = acceptabel portföljförlust (0,5–1%) / avstånd till stopp. Exempel: 0,5%/5–10% → ~0,5–2% position. Kelly-talet är tak och diagnos, inte orderstorlek.

## Riskmatris

6–7 identifierade risker. Varje risk: sannolikhet (LÅG/MEDEL/HÖG) × påverkan (LÅG/MEDEL/HÖG) + poäng 0–10 + vikt. Standardvikter: strukturella risker (volatilitet, utspädning) 20–25% var, operativa 15–20%, andra ordningen 5%.

Vägd total 0–10 → riskklass. **Korrelationsvarningen är obligatorisk:** kedjerisker (royaltymiss → svagt utfall → garantiöverhäng → bruten nivå → likviditetsuttorkning) är *en* risk med fyra masker — sannolikheten för "någon allvarlig händelse" överstiger varje enskild risks. Riskpoängen matar rekommendationstabellen och storleksramen.

## TERP- och utspädningsmatematik (emissioner)

- TERP = (aktier_före × kurs_före + nya_aktier × teckningskurs) / total_aktier_efter. Ex-rätt-dagen justerar kursen mekaniskt — jämför faktisk stängning mot teoretisk nivå (över = absorptionstöd, under = svaghet).
- Utspädningsgrad = nya/total. Post-emission värderas ALLTID på fullt utspädd aktiestock + nettolikvid (brutto − kostnader − garantiersättning).
- TR-värde (teoretiskt) = kurs − teckningskursjusterat värde; kollaps mot noll = marknaden prissätter aktien under emissionsmatematiken.
- Emissionsmagnet: teckningskursen fungerar som ankare/"magnet" tills utfallet är klart (dokumenterat prejudikat: kursen konvergerar mot teckningskursen i svaga utfall).

## DCF + känslighet + multipel

- DCF som *golv*-diskussion med känslighetsmatris (WACC × tillväxt, eller diskonteringsränta × terminalmultiplar) — visa var modellen brister först.
- Multipelvärdering som band (bear-multipel → base → bull) mot peer och eget historiskt prejudikat; motivera varje multipel med regimen (bevisad vändning > obevisad).
- Alla värden: vilken del av värdekedjan som är kassa vs verksamhet (EV vs mcap), och P/X på post-händelseaktiestock.

## Brier-score (valideringsloggen)

Brier = Σᵢ(pᵢ − oᵢ)², där p = prognosticerad scenariofördelning och o = indikatorvektor för realiserad zon (Bull/Base/Bear). Lägre = bättre; 0,67 ≈ slumpprognos på tre utfall vid okalibrerade lika sannolika. Redovisa per prognos och som glidande medelvärde — trenden avslöjar om sannolikhetsbedömningen förbättras.
