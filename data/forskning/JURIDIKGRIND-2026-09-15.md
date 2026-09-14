# JURIDIKGRINDEN — mekanisk rådsförbudsscanner + retroscan (2026-09-15)

**Styrelsens beslut punkt 2 (megasammanträdet, rond 23) · Verkställt av
fabriksagent (mega g2) · Verktyg: `verktyg/juridikgrind-vakt.mjs`**

## Sammanfattning

**Retroscan på de 14 väntande FLYTTKLARA utkasten: GRÖN — 0 FEL, 0 VARNING.**
Alla 14 dokument bär utbildnings-grunden (pedagogisk disclaimer respektive
negerat investeringsråd), innehåller INGA kända rådgivningsformuleringar och
triggar inga tväfallsgrunder utan lagrum. Grindens dom: **inget dokument
spärras — flyttbeslutet förblir kundens (R2).**

## Vad vakten gör (mekaniskt, varje timme :37 — före ronderingen :43)

Tre kontroller per dokument i `data/blogg-utkast/`:

1. **RÅDSFÖRBUD** (lagen 2007:528) — 15 FEL-mönster (direkt rådgivning:
   "köp denna aktie", "rekommenderar köp", "sälj nu", "min rekommendation",
   "du bör köpa", aktietips, köp/sälj-rekommendation, garanterad avkastning,
   riskfri, säker vinst m.fl. — källor: AGENTS.md, STYRELSE-REGELVERKET § 9,
   juridikgrind-skillingen, varumärkets P2-fraser) + 7 VARNING-mönster
   (värdeökning-prediktioner: "kommer att stiga", "förväntas öka", kursmål,
   under/övervärderad, "aktien är ett köp", rating-kolon). Negeringsvakt:
   "inte investeringsråd", "aldrig rådgivning", "kan stiga eller falla" är
   tillåten utbildnings/osäkerhetsform — ALDRIG fynd.
2. **GRUND** — varje FLYTTKLAR-utdrag MÅSTE bära utbildnings-grunden; saknas
   den = FEL-larm "flyttklar-utan-grund".
3. **TVÄRFALL** — nämns ångerrätt (2005:59), konsumentköp (2022:260),
   digitalt innehåll (2022:261), konsumenttjänst (1985:716), GDPR-insamling
   (art 13) eller kakor (LEK 2022:482) måste lagrummet finnas i samma
   dokument; fel parning 260/261 flaggas som misstänkt lagrumsblandning.

Larm skrivs till `data/vakten/juridik-larm.json` (dedup — förstaGången
bevaras mellan körningar; status GRÖN/GUL/RÖD; FEL ⇒ exit-kod 1).
Granskningsposter (`granskning/*.md` + sammanställningar) scannas som
**citatytor**: fynd demotas ett steg (interna dokument publiceras aldrig).
Vakten skriver ALDRIG i `data/blogg/` — publicering förblir kundens beslut.

## Retroscan-resultat per dokument (2026-09-15, 14 FLYTTKLARA)

| Dokument | Typ | Grund | Rådsförbud | Tvärfall | Dom |
|---|---|---|---|---|---|
| aktieanalys-steg-for-steg | seo-json | ✓ | 0 | 0 | REN |
| boerspsykologi-fallstugor | m9-json | ✓ | 0 | 0 | REN |
| branschmedianer-akm2 | m9-json (v2) | ✓ | 0 | 0 | REN |
| forskningslaget-grona-av-100 | m9-json | ✓ | 0 | 0 | REN |
| hur-fungerar-aktier | seo-json | ✓ | 0 | 0 | REN |
| jamforelseindex-relativ-styrka | seo-json | ✓ | 0 | 0 | REN |
| kassaflodesanalys-101 | m9-json | ✓ | 0 | 0 | REN |
| nyemission-sa-fungerar-det | seo-json | ✓ | 0 | 0 | REN |
| pe-talet-sa-raknar-du-och-tolkar | seo-json | ✓ | 0 | 0 | REN |
| portfoljteori-for-nyborjare | seo-json | ✓ | 0 | 0 | REN |
| risk-och-spridning | seo-json | ✓ | 0 | 0 | REN |
| sa-laser-du-en-kvartalsrapport | seo-json | ✓ | 0 | 0 | REN |
| utdelningar-101 | m9-json | ✓ | 0 | 0 | REN |
| vagkartan-traffprocent | m9-json | ✓ | 0 | 0 | REN |

Grunden bärs av SEO-guidernas signaturrad "_Detta är pedagogisk
finansanalys, inte investeringsråd._" och m9-seriens "Pedagogisk forskning —
aldrig investeringsrådgivning (lagen 2007:528).".

Även scannade utan anmärkning: kvartalsrapport-2026-Q3.md (utkast, inte
flyttklar — väntar fortfarande granskningspost), samtliga 15
granskningsposter + GRANSKNINGSKO-SAMMANSTALLNINGEN (citatytor, 0 fynd).

## Bevis

- Självtest: `node verktyg/juridikgrind-vakt.mjs --sjalvtest` → **9/9**
  (fångar "köp denna aktie", "rekommenderar köp", "sälj nu", prediktion,
  "garanterad avkastning"; släpper igenom negerad disclaimer, osäkerhetsform
  och pedagogiskt räkneexempel; grund-detektering verified mot båda
  verkliga disclaimrarna).
- Retroscan: status GRÖN i `data/vakten/juridik-larm.json`
  (senasteKorning-blocket), exit-kod 0.
- `node --check` → 0 fel.
- Pumpor: ny rad i `verktyg/pumpor-daemon.mjs` — `min==37` varje timme,
  dvs. alltid före styrelserondens :43-gräns (ronden läser larmfilen).

## Rondens nästa steg

- Rond som finner juridik-larm.json RÖD: spärra flytt för berörda slugs,
  dispatcher rättning (omformulering till metod-/exempel-/utbildningsform),
  kör vakten tills GRÖN.
- Nya utkast som läggs i `data/blogg-utkast/` scannas automatiskt nästa
  :37 — FLYTTKLAR-bedömning utan grönt juridiklarm ska inte godtas.
