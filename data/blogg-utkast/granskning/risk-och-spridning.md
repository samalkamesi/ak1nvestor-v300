# Granskning v151 — SEO-guide: risk-och-spridning

- **Objekt:** `data/blogg-utkast/risk-och-spridning.json` (SEO-guiderna våg 95, #4 av 8, status UTKAST)
- **Granskare:** granskningsagent (agentfabriksomgång v151), 2026-09-14
- **Bedömning: FLYTTKLAR EFTER RÄTTNING** — 2 rättningar i utkast-JSON:en (se diff-rapporten).

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` (live-mappen). "Flyttklar" betyder: innehållet håller för export
som `data/blogg/risk-och-spridning.json` när kunden beslutar.

---

## 1. SPEC — kontroll mot SEO-GUIDER-2026-09.md §4

| Krav (specen) | Faktiskt värde | Utfall |
|---|---|---|
| Form: exakt BlogPost (9 fält) | slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body — exakt 9, inga extra | ✅ |
| Slug `risk-och-spridning`, ^[a-z0-9-]+$ | matchar | ✅ |
| Title ≤ 60 tkn (spec: 58) | 58 tkn — stämmer med specen | ✅ |
| OG-description ≤ 155 tkn (spec: 149) | 149 tkn — stämmer med specen | ✅ |
| Ord i body 800–1 400 (spec: 820) | 820 före granskning (whitespace-räkning, systemets metric); 822 efter rättning 1 — se fynd 5 | ✅ |
| readingMinutes 1 | 1 (grundens formel: 851 ord ÷ 600 → 1) | ✅ |
| Pillar / Author | Grunderna / AK1A Research Lab — exakt specen | ✅ |
| Tags | risk, spridning, diversifiering, koncentrationsrisk, portfölj — exakt specens lista | ✅ |
| Strukturgrind (kontrolleratextRad-port) | body 5 500+ tkn (≥ 800), 5 st "## "-rubriker (≥ 2) | ✅ |
| Primärt sökord i H1 + ingress + 1 H2 | title "Risk och spridning: …" (H1), ingressens första mening "Risk och spridning är aktiesparandets viktigaste par.", H2 "Risk och spridning i praktiken — hur många bolag räcker?" | ✅ |
| Sekundära naturligt (2–4) | diversifiering (4 träffar), systematisk risk (8), koncentrationsrisk (3) — samtliga i bodyn utöver metadata | ✅ |
| Body ordagrant enligt spec | diff spec↔JSON före granskning: IDENTISK — samtliga avvikelser härstammar från denna gransknings rättningar | ✅ |
| publishedAt 2026-09-09 | stämmer med specens "UTKAST v1 (2026-09-09)" | ✅ |

## 2. FAKTA — risk och spridningsmekanik (räkneexempel rad för rad)

| Påstående i utkastet | Verifiering | Utfall |
|---|---|---|
| Osystematisk (bolagsspecifik) vs systematisk (marknads) risk; spridning angriper bara den förra | etablerad finanslära (t.ex. Markowitz-ramverket) — korrekt definition och korrekt avgränsning | ✅ |
| "Äger du femton bolag och ett går i konkurs är skadan en femtondedel" | 1/15 vid konventionellt likaviktsantagande — se fynd 3 | ✅ med premiss |
| Korrelationerna söker sig mot +1 i kriser; exemplen 2008, 2020, 2022 | finanskrisen, covid-kraschen, räntechocken — samtliga verifierade systematiska nedgångar; korrelationsökning i kriser är välbelagt | ✅ |
| "De första 10–20 gör mest; efter 25–30 är ytterligare vinst liten" | konsistent med klassisk diversifieringsempiri (Evans & Archer-traditionen; Statman ~30) — inga överdrivna precisionsanspråk | ✅ |
| 20 positioner, tak 10 % per position = hantverksnorm | uttryckligen avfokuserad i texten ("pedagogisk hantverksnorm, inte en regel för just din situation") — 20 × ≤10 % är aritmetiskt konsistent (medelvikt 5 %) | ✅ |
| Två tillgångar σ = 20 %, r = +1 → portfölj-σ "exakt 20 procent" | √(0,25·400 + 0,25·400 + 2·0,5·0,5·1·400) = √400 = 20,00 — exakt | ✅ |
| r = 0 → "faller den till cirka 14 procent" | √200 = 14,14 ≈ 14 — korrekt avrundat med "cirka" | ✅ |
| Branschtak: 20 (lika stora) positioner, max 2 per bransch → minst 10 branscher | duvslagsprincipen: ⌈20/2⌉ = 10 — korrekt; tiondelspåståendet krävde rättning, se fynd 1 | ✅ efter rättning |
| "åtta av 20 positioner = 40 procent koncentration" | 8/20 = 40 % (antal = vikt vid lika stora positioner, som rättning 1 etablerar) | ✅ |
| "En väl spridd portfölj föll 2008 … med marknaden, inte på grund av ett enda bolags sammanbrott" | korrekt: systematisk risk kan inte spridas bort — diversifierade portföljer föll med marknaden 2008 | ✅ |
| "Tjugo svenska bankaktier är i praktiken en enda satsning på svensk kreditmarknad" | branschkoncentrationens poäng korrekt; exemplaret rättat från "storbanker" (fyra stycks i Sverige), se fynd 2 | ✅ efter rättning |

## 3. LÄNKAR — 7/7 levande (200)

| Länk | Status | Källa finns |
|---|---|---|
| `/kurser/pf-01-portfoljbyggande` | 200 | deep-courses.json ✓ |
| `/kurser/km-014-korrelation-diversifiering` | 200 | deep-courses.json ✓ |
| `/kurser/km-013-volatilitet-standardavvikelse` | 200 | deep-courses.json ✓ |
| `/kurser/pf-11-koncentrerad-portfolj` | 200 | deep-courses.json ✓ |
| `/kurser/pf-03-diversifiering` | 200 | deep-courses.json ✓ |
| `/kurser/rk-09-koncentrationsrisk` | 200 | deep-courses.json ✓ |
| `/kurser/rk-10-korrelationsrisk` | 200 | deep-courses.json ✓ |

Korslänksregeln (specen: endast publicerade kurser/poster, inga
utkast-till-utkast-länkar) är uppfylld — guiden länkar enbart till de sju
kurserna, ingen länk pekar på de andra utkasten eller obefintliga bloggposter.
Döda länkar (MEDEL enligt granskningsdirectivet): 0.

## 4. JURISTEN — grönt

- **Varumärkesgrind:** kontrolleraText-portad mot `data/varumarke.json` (samma
  regexer, flaggor "giu", körd på title + description + body): **0 FEL,
  0 VARNINGAR** — omkörd även efter rättningarna: fortfarande 0 träffar.
- **Disclaimer sist:** sista raden är `_Detta är pedagogisk finansanalys, inte
  investeringsråd._` — teckenidentisk med de publicerade posterna (40/55 i
  `data/blogg/` bär exakt denna rad) och uppfyller grunden.
- **Inga råd:** texten beskriver mekanik ("så minskar du risken" i titeln är
  metoddiskussion, inte portföljrekommendation); tumregeln 10 %-tak avfokuseras
  uttryckligen; bransch-/positionsexemplen är räkneövningar utan målaktie eller
  köp-/säljimperativ. Formuleringen "det är inte 40 procent spridning utan
  40 procent koncentration" beskriver mekanik, inte placeringsråd.
- **Inga lagrum** förekommer i texten → inga blandade lagrum är möjliga.

## 5. SPRÅK — grönt

Svenska, rak och varm ton, jämn stil med de publicerade posterna. Inga tonala
anmärkningar från varumärkesgrinden. Terminologin (osystematisk/systematisk
risk, korrelation, koncentrationsrisk) definieras vid första användning.

## Fyndlista

| # | Allvarlighetsgrad | Fynd | Åtgärd |
|---|---|---|---|
| 1 | MEDEL | Branschtaks-räkneexemplet saknade likaviktspremiss: "20 positioner med högst två per bransch ger automatiskt minst tio branscher — och inget enskilt branschbeslut kan väga mer än en tiondel av portföljen". Duvslagsdelen är sant, men tiondelspåståendet gäller bara när positionerna är lika stora — med ojämna vikter (guidens eget 10 %-positionstak tillåter 2 × 10 % = 20 % i en bransch) är det falskt, och "automatiskt" förstärker fel läsning | RÄTTAT: "20 **lika stora** positioner …" — med 5 % per position blir allt exakt: ≥10 branscher, max 10 % per bransch, och grannmeningen 8/20 = 40 % blir exakt kapitalvikt |
| 2 | LÅG | "Tjugo svenska storbanker är i praktiken en enda satsning…" — Sverige har fyra storbanker; exemplaret är overkligt och kan läsas som slarv av en kunnig läsare | RÄTTAT: "Tjugo svenska **bankaktier** …" — samma poäng (många innehav i samma bransch = koncentration), realiserbart exempel, ordantalet opåverkat |
| 3 | LÅG (observation) | "Äger du femton bolag och ett av dem går i konkurs är skadan en femtondedel av portföljen" — gäller vid 1/15-vikt; likavikten är underförstådd. Konkret scenario (inte generaliserande påstående med "automatiskt" som fynd 1) och konventionell pedagogik | Ingen — lämnad orörd; rättning 1 etablerar likaviktspremissen för guidens räkneexempel |
| 4 | LÅG (observation) | "Räkneexemplet från portföljteorin gör det synligt" — textuell hänvisning till grannutkastet #3 (portfoljteori-for-nyborjare), dock INTE en länk. Exemplet förklaras fullständigt i denna guide, korslänksregeln uppfylld, ingen 404 vid partiell publicering | Ingen — formuleringen fungerar fristående ("portföljteorin" som begrepp) |
| 5 | INFO (metodnot) | Ordantalet avvek från specens 820 efter rättning 1: nu 822 (whitespace-räkning, systemets eget metric — samma som kontrolleratextRad/readingMinutes). Målintervallet 800–1 400 är uppfyllt | Ingen — dokumenterad avvikelse, +2 ord ("lika stora") |

**HÖG: 0 · MEDEL: 1 · LÅG: 3 · INFO: 1** — MEDEL-fyndet är rättat; inget
kvarvarande fynd blockerar export.

## Diff-rapport

2 rättningar, båda i `data/blogg-utkast/risk-och-spridning.json` (fältet
`body`); i övrigt är filen byte-identisk med granskat tillstånd (verifierat via
`git diff` — exakt två ändrade fraser):

```diff
- Tjugo svenska storbanker är i praktiken en enda satsning på svensk kreditmarknad
+ Tjugo svenska bankaktier är i praktiken en enda satsning på svensk kreditmarknad

- Räkneexempel på branschtak: 20 positioner med högst två per bransch ger automatiskt minst tio branscher representerade
+ Räkneexempel på branschtak: 20 lika stora positioner med högst två per bransch ger automatiskt minst tio branscher representerade
```

Eftertillstånd verifierat: JSON giltig · 822 ord (800–1 400 ✅) · title 58 tkn ·
description 149 tkn · 5 H2-rubriker · disclaimer sist teckenidentisk ·
varumärkesgrind 0 träffar · primärt sökord kvar i H1 + ingress + H2.

LEVERANS: risk-och-spridning bedömning=FLYTTKLAR EFTER RÄTTNING fynd=5 rättningar=2
