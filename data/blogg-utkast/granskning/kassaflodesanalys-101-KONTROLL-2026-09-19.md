# KONTROLLGRANSKNING m9 #3 — kassaflodesanalys 101 (v1) — 2026-09-19

**Objekt:** `data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json` (version 1, status utkast, m9-fabriken, skapad 2026-09-11, seed `904e0fcc…`)
**Granskad:** 2026-09-19 av huvudagenten (rond 101 [Φ], våg 208 del 1) — OBEROENDE omräkning, inte fabrikens egen KVD.
**Relation till tidigare granskning:** ingen — detta är utkastets första granskning (utdelningar-101 och vagkartan-traffprocent granskades 2026-09-16; se kö-vyn).
**Off-gräns:** publicering = kundens beslut (R2) — filen har INTE flyttats till `data/blogg/`, databasen orörd.

## BEDÖMNING: GRÖN — FLYTTKLAR — 26 maskinella kontroller, 0 FEL

Sonden `verktyg/_r101-kvd-kassaflode.mjs` (rondens leverans, committad): **26 OK · 0 FEL · exit 0**.

## 1. Källor — md5 mot kvitto, original ur git

| Källa | Kvitto-md5 | Status 2026-09-19 |
|---|---|---|
| `data/portfolj-system/bolagsunivers.json` | `f4cee658…` | **SKILJER i dagens träd** (`4afb56e5…`, **207 bolag** — spår 2:s dataset-djup har vuxit 100→207 sedan 09-11). **Original återvunnet ur git (`f3f56268`, 100 bolag): md5 `f4cee658…` EXAKT MATCH** — samma original-commit som utdelnings-KONTROLLEN belyste 09-16. Samtliga tal verifieras mot utkastets eget dokumenterade underlag. |

Utkastet redovisar urvalsberoendet öppet ("universum är 100 bolag i tio branscher, och inget sägs om bolag utanför det"; samtliga rader `hamtat` = 2026-09-03 — **verifierat 100/100**).

## 2. Siffror — oberoende omräkning mot ORIGINAL-underlaget (alla gröna)

- **FCF-marginal** (lonksamhet.fcfMarginal): n=92 mätta av 100 · median **10,8 %** — egna omräknade, exakta.
- **FCF-avkastning** (vardering.fcfYield): n=87 · median **3 %** — exakta.
- **Fördelningen:** >5 %: 26 · 2–5 %: 28 · <2 %: 33 (varav **negativa 9**) · **summakontroll 26+28+33 = 87 = n mätta** ✓.
- **Konverteringsgraden (härledd):** utkastet härleder FCF ÷ nettoresultat som fcfMarginal ÷ nettoMarginal (samma nämnare omsättning — aritmetiskt korrekt, redovisat öppet i texten). Med fabrikens divisionsvakt (nettoMarginal > 0): n=**84** · median **0,78** · **29 över 1,0** — alla tre exakta. NOT utan fel: utan vakten vore n=92/0,73/30 — utkastets vakt är den korrekta tolkningen (negativa nämnare ger meningslös kvot).
- **Globala topp-5 FCF-marginal:** KINV-B.ST 65,6 % (tillväxt) · ORES.ST 63,9 % (finans) · INDU-C.ST 62,4 % (industri) · PLD 56 % (fastighet) · NFLX 52,5 % (kommunikation) — uppsättning, ordning och samtliga tio värden exakta; listan är GLOBAL ("högst och lägst i underlaget"), branschnoteringarna är just noteringar (verifierat mot kroppens lydelse — granskarens första per-bransch-tolkning var en feläsning).
- **Globala botten-5:** AKRBP.OL −3 % · VOLCAR-B.ST −4,5 % · PSNY −30,8 % · RWE.DE −69,6 % · CAST.ST −72,9 % — uppsättning, presenterad ordning (sjunkande) och värden exakta.
- **Första-i-serien:** `data/blogg/kassaflodesanalys-101.json` existerar inte ✓. Inga räkneexempel med påhittade tal (draften bär formler/begrepp, inga talsatta exempel — inget märkningskrav aktuellt).

## 3. Juridik — lagen (2007:528), mekanisk grind

- **kontrolleraText-spegel** (varumarke.json `kontrolleraText.forbjudnaFraser`, husets egna regex-mönster, på titel+ingress+body): **0 träffar**.
- **Rådgivningsglossor** (köp/sälj/rekommendera/bör du/aktietips/kursmål/riskfri/säker vinst/garanterad avkastning/investera i denna): **0 träffar**.
- **Disclaimer:** fabrikens evergreen-disclaimer står exakt sist i bodyn ✓. Formuleringarna är genomgående utbildningsform ("hur metoden fungerar", "sortering av data, inte omdömen").

## 4. Observationer (inga fel — dokumenterade för publiceringssteget)

1. **Titel 86 tkn** inkl. seriens "(utkast)"-suffix och månadsmärket — i linje med samtliga godkända syskon i serien; publiceringssteget kan överväga beskärning när suffixet faller.
2. **omslagUrl null** — utkast bär inget omslag (syskonen likadant vid granskningstillfället); tillkommer vid publiceringssteget.
3. **Determinism-sektionen** (fabrikens kandidatMd5-återbyggnad, som auto-s1-u1 utförde för utdelningar-101) är INTE del av denna kontroll — här är samtliga TAL oberoende omräknade mot md5-exakt original, vilket ger ekvivalent fakta-täckning men inte byte-exakt återbyggnad av filen.

## Konklusion

**kassaflodesanalys-101 (v1): GRÖN — FLYTTKLAR för kundens publiceringsbeslut (R2).** m9-kön står därmed i 3/6 granskade (utdelningar + vagkartan + denna); resterande tre (boerspsykologi-fallstugor · branschmedianer-akm2 v2 · forskningslaget-grona-av-100) = våg 208 del 2.
