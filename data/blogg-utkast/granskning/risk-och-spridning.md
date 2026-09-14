# Granskning v152 — SEO-guide: risk-och-spridning

- **Objekt:** `data/blogg-utkast/risk-och-spridning.json` (SEO-guiderna våg 95, #4 av 8, status UTKAST)
- **Granskare:** granskningsagent (agentfabriksomgång v152), 2026-09-14 — oberoende omkörning av v151
- **Bedömning: FLYTTKLAR** — 0 nya rättningar denna omgång; v151:s 2 rättningar (2026-09-14, commit 741a8fc7) verifierade och kvarstående

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` (live-mappen). "Flyttklar" betyder: innehållet håller för export
som `data/blogg/risk-och-spridning.json` när kunden beslutar.

**Bakgrund:** v151 granskade guiden tidigare samma dag (bedömning FLYTTKLAR
EFTER RÄTTNING, 2 rättningar, committad i 741a8fc7). Denna omgång (v152) har
verifierat ALLT på nytt med egna mätningar — inklusive att diff-kedjan
spec → v1 → v151 → nuläge är hel: `git show 741a8fc7` bekräftar exakt två
ändrade fraser i body (se Diff-verifiering nedan), och arbetsytan är ren för
filen (HEAD = granskat tillstånd, inga mutationer därefter).

---

## 1. SPEC — kontroll mot SEO-GUIDER-2026-09.md §4 (egna mätvärden)

| Krav (specen) | Faktiskt värde (v152-mätning) | Utfall |
|---|---|---|
| Form: exakt BlogPost (9 fält) | author, body, description, pillar, publishedAt, readingMinutes, slug, tags, title — exakt 9, inga extra | ✅ |
| Slug `risk-och-spridning`, ^[a-z0-9-]+$ | matchar | ✅ |
| Title ≤ 60 tkn (spec: 58) | 58 tkn | ✅ |
| OG-description ≤ 155 tkn (spec: 149) | 149 tkn | ✅ |
| Ord i body 800–1 400 (spec: 820) | 822 (whitespace-räkning) — +2 mot spec är v151:s rättade premiss "lika stora"; avvikelsen är dokumenterad i v151 fynd 5 | ✅ |
| readingMinutes 1 | beräknat 1 (systemmetric 853 ord ÷ 600, kontrolleratextRad-port) | ✅ |
| Pillar / Author | Grunderna / AK1A Research Lab — exakt specen | ✅ |
| Tags (5) | risk, spridning, diversifiering, koncentrationsrisk, portfölj — exakt specens lista | ✅ |
| Strukturgrind | body 5 592 tkn (≥ 800) · 5 st "## "-rubriker (≥ 2) · disclaimer-sista-rad OK | ✅ |
| Primärt sökord i H1 + ingress + 1 H2 | title (H1) ✓ · ingressens första mening ✓ · H2 "Risk och spridning i praktiken — hur många bolag räcker?" ✓ | ✅ |
| Sekundära naturligt (2–4) | diversifiering 4 träffar · systematisk risk 8 · koncentrationsrisk 3 — samtliga i bodyn | ✅ |
| publishedAt 2026-09-09 | stämmer med specens "UTKAST v1 (2026-09-09)" | ✅ |
| Korslänkar endast till publicerat | 7 länkar, samtliga kurser som finns i `public/deep-courses.json`; ingen länk till andra utkast | ✅ |

## 2. FAKTA — risk- och spridningsmekanik (räkneexempel rad för rad, omräknade)

| Påstående i utkastet | v152-omräkning | Utfall |
|---|---|---|
| Osystematisk (bolagsspecifik) vs systematisk (marknads) risk; spridning angriper bara den förra | korrekt definition och avgränsning (Markowitz-ramverket) | ✅ |
| "femton bolag, ett i konkurs → skadan en femtondedel" | 1/15 = 6,67 % vid underförstådd likavikt — konkret scenario, konventionell pedagogik (v151 fynd 3, orörd) | ✅ |
| Korrelationer → +1 i kriser; exemplen 2008, 2020, 2022 | samtliga verifierade systematiska nedgångar; korrelationsökning i kriser välbelagt | ✅ |
| "De första 10–20 gör mest; efter 25–30 försumbar" | konsistent med klassisk diversifieringsempiri (Evans & Archer-traditionen; Statman ~30) | ✅ |
| 20 positioner, tak 10 %/position | aritmetiskt konsistent (medelvikt 5 %); uttryckligen avfokuserad ("pedagogisk hantverksnorm, inte en regel för just din situation") | ✅ |
| Två tillgångar σ = 20 %, r = +1 → "exakt 20 procent" | √(0,25·400 + 0,25·400 + 2·0,5·0,5·1·400) = 20,0000 — exakt | ✅ |
| r = 0 → "cirka 14 procent" | √200 = 14,1421 ≈ 14 — korrekt avrundat med "cirka" | ✅ |
| Branschtak: 20 **lika stora** positioner, max 2 per bransch → minst 10 branscher, max 10 % per bransch | ⌈20/2⌉ = 10 · 100/20 = 5 %/position · 2×5 % = 10 % = en tiondel — allt exakt med likaviktspremissen (v151 rättning 1) | ✅ |
| "åtta av 20 positioner = 40 procent koncentration" | 8/20 = 40 % (antal = vikt vid lika stora positioner) | ✅ |
| "En väl spridd portfölj föll 2008 … med marknaden" | korrekt: systematisk risk kan inte spridas bort — diversifierade portföljer föll med marknaden 2008 | ✅ |

## 3. LÄNKAR — 7/7 levande (200) + driftobservation

| Länk | Status (slutlig) | Källa finns |
|---|---|---|
| `/kurser/pf-01-portfoljbyggande` | 200 | deep-courses.json ✓ |
| `/kurser/km-014-korrelation-diversifiering` | 200 | deep-courses.json ✓ |
| `/kurser/km-013-volatilitet-standardavvikelse` | 200 | deep-courses.json ✓ |
| `/kurser/pf-11-koncentrerad-portfolj` | 200 | deep-courses.json ✓ |
| `/kurser/pf-03-diversifiering` | 200 | deep-courses.json ✓ |
| `/kurser/rk-09-koncentrationsrisk` | 200 | deep-courses.json ✓ |
| `/kurser/rk-10-korrelationsrisk` | 200 | deep-courses.json ✓ |

**Driftobservation (INFO — inte utkastets fel):** Vid v152:s första mätning
svarade samtliga 7 kurslänkar 500 (medan `/`, `/kurser`, `/blogg` svarade 200).
Diagnos: ett deploy-bygge pågick samtidigt (`/tmp/ak1a-deploy.lock` upptaget;
pm2 `ak1a` omstartad mitt i bygget; loggen full av "client reference manifest
… does not exist" — pm2 serverade ur ett halvfärdigt `.next`). Förfarande enligt
AGENTS.md: vänta på låset, bygg aldrig parallellt. Efter att bygget slutförts
(låset ledigt, ny pm2-omstart) svarar **alla 7 länkar 200**. Slutsats: länkarna
är levande; 500-fönstret var övergående och orsakat av deployen, inte av
guiden. Driftfyndet är bokfört här — ingen åtgärd krävs i utkastet, men
granskningsdirectivets "döda länkar = MEDEL" skulle ha fällt fel dom utan
diagnos; vänta alltid ut pågående deploybygge innan länkdom döms.

## 4. JURISTEN — grönt

- **Varumärkesgrind:** omkörd med systemets egna regexer (data/varumarke.json
  `forbjudnaFraser`, kompilerade "giu" — exakt `kontrolleraText`-logiken i
  src/lib/varumarke.ts, körd på title + description + body): **0 FEL,
  0 VARNINGAR**.
- **Disclaimer sist:** sista raden är `_Detta är pedagogisk finansanalys, inte
  investeringsråd._` — uppfyller grunden (regex /investeringsråd/i på sista
  raden) och är teckenidentisk med de publicerade posterna.
- **Inga råd:** titelns "så minskar du risken" är metoddiskussion; texten
  beskriver mekanik utan målaktie, köp-/säljimperativ eller portfölj-
  rekommendation; tumregeln avfokuseras uttryckligen i texten.
- **Inga lagrum** förekomster (skannat efter mönstret ÅÅÅÅ:N) → inga blandade
  lagrum är möjliga.

## 5. SPRÅK — grönt

Svenska, rak och varm ton, jämn stil med de publicerade posterna. Terminologin
(osystematisk/systematisk risk, korrelation, koncentrationsrisk) definieras
eller förklaras vid första användning. Inga tonala anmärkningar.

## Fyndlista (v152)

| # | Allvarlighetsgrad | Fynd | Åtgärd |
|---|---|---|---|
| 1 | INFO (drift) | 500-fönster på alla 7 kurslänkar under pågående deploy-bygge vid granskningens start (diagnos + beviskedja i sektion 3); slutlig status 7/7 = 200 | Ingen i utkastet — dokumenterad; riktlinje: döm inte länkar under pågående deploybygge |

**HÖG: 0 · MEDEL: 0 · LÅG: 0 · INFO: 1 (drift).** Inget fynd berör utkastet.

### Arv från v151 (fortfarande gällande, verifierade denna omgång)

v151:s fyndlista (1 MEDEL rättat + 2 LÅG orörda + 1 INFO metodnot) gäller
oförändrad; de två rättningarna är committade och omvärderade gröna ovan:

1. MEDEL → RÄTTAT: branschtaket saknade likaviktspremiss — "20 positioner" →
   "20 **lika stora** positioner" (gör tiondelspåståendet exakt).
2. LÅG → RÄTTAT: "Tjugo svenska **storbanker**" → "Tjugo svenska **bankaktier**"
   (Sverige har fyra storbanker; exemplaret var overkligt).
3. LÅG (orörd): konkursexempelens underförstådda 1/15-vikt — konventionell
   pedagogik, lämnad.
4. LÅG (orörd): textlig hänvisning "från portföljteorin" till grannutkastet
   — ingen länk, korslänksregeln uppfylld, fungerar fristående.
5. INFO (metodnot): bodyord 822 mot specens 820 (+2 från rättning 1) —
   målintervallet 800–1 400 uppfyllt.

## Diff-rapport

**0 rättningar i v152** — utkast-JSON lämnad byte-identisk. Diff-kedjan
verifierad: `git show 741a8fc7` visar exakt de två v151-fraserna som enda
ändring i body sedan specens v1, och `git status` visar filen ren (HEAD =
granskat tillstånd).

Eftertillstånd (v152-mätning): JSON giltig · 822 ord (800–1 400 ✅) ·
title 58 tkn · description 149 tkn · 5 H2-rubriker · disclaimer sist ·
varumärkesgrind 0 FEL/0 VARNINGAR · primärt sökord i H1 + ingress + H2 ·
7/7 internlänkar 200.

LEVERANS: risk-och-spridning bedömning=FLYTTKLAR fynd=1 rättningar=0
