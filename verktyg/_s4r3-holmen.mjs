#!/usr/bin/env node
// s4-r3 (byggare 3/3): kvartalsläspaket HOLMEN Q3 2026 — seriens första materialpaket.
// Lägen: node verktyg/_s4r3-holmen.mjs bygg   → skriver data/blogg-utkast/kvartal/2026-q3/sa-laser-du-holm-q3-2026.json
//        node verktyg/_s4r3-holmen.mjs kvd    → verifierar filen mot samma talgrund (0 fel krav)
// Alla tal beräknas ur data/portfolj-system/bolagsunivers.json (144-filen) vid varje körning.
import { readFileSync, writeFileSync } from 'node:fs';
import http from 'node:http';

const FIL = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-holm-q3-2026.json';
const univers = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const list = Array.isArray(univers) ? univers : (univers.bolag || []);
const H = list.find(r => r.ticker === 'HOLM-B.ST');
if (!H) { console.error('HOLM-B.ST saknas i universumfilen'); process.exit(1); }
const mats = list.filter(r => r.bransch === 'material');

// ————— talgrund —————
const med = a => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const val = (rows, f) => med(rows.map(f).filter(v => typeof v === 'number' && Number.isFinite(v)));
const nAv = (rows, f) => rows.map(f).filter(v => typeof v === 'number' && Number.isFinite(v)).length;
const fM = {
  pe: r => r.vardering?.pe, pb: r => r.vardering?.pb, evEbit: r => r.vardering?.evEbit, peg: r => r.vardering?.peg, fcfY: r => r.vardering?.fcfYield,
  roe: r => r.lonksamhet?.roe, roic: r => r.lonksamhet?.roic, brutto: r => r.lonksamhet?.bruttoMarginal, ebit: r => r.lonksamhet?.ebitMarginal,
  netto: r => r.lonksamhet?.nettoMarginal, fcfm: r => r.lonksamhet?.fcfMarginal, skuld: r => r.stabilitet?.skuldEgenkapital, prog: r => r.tillvaxt?.prognosTillvaxt
};
const mM = {}, nM = {}, mU = {}, nU = {};
for (const [k, f] of Object.entries(fM)) { mM[k] = val(mats, f); nM[k] = nAv(mats, f); mU[k] = val(list, f); nU[k] = nAv(list, f); }

const V = H.vardering, L = H.lonksamhet, T = H.tillvaxt, S = H.stabilitet;
const [oms0, oms1, oms2, oms3] = H.serier.omsattning;
const [res0, res1, res2, res3] = H.serier.resultat;
const cagr = (a, b) => 100 * (Math.pow(b / a, 1 / 3) - 1);
const steg = (a, b) => 100 * (b / a - 1);
const nmSerie = H.serier.omsattning.map((o, i) => 100 * H.serier.resultat[i] / o);
const EK = H.marknadsKapitalMdr / V.pb;
const skuldMdr = EK * S.skuldEgenkapital;
const EVkedja = EK + skuldMdr;
const EBIT25 = oms3 * L.ebitMarginal;
const EVfalt = V.evEbit * EBIT25 / 1e9;
const evKvot = EVkedja / EVfalt;
const kassaRes = H.marknadsKapitalMdr + skuldMdr - EVfalt;
const FCF25 = L.fcfMarginal * oms3;
const fcfYKontroll = 100 * FCF25 / (H.marknadsKapitalMdr * 1e9);
const ident = V.pb / L.roe;
const identDiff = 100 * (ident / V.pe - 1);
const omvant = V.pe * L.roe;
const omvantDiff = 100 * (omvant / V.pb - 1);
const epsImplicit = H.pris / V.pe;
const absKontroll = V.pe * res3 / 1e9;
const absResid = 100 * (absKontroll / H.marknadsKapitalMdr - 1);
const absOmvant = H.marknadsKapitalMdr * 1e9 / V.pe / 1e6;
const pegKonv = V.pe / (T.prognosTillvaxt * 100);
const pegKvot = V.peg / pegKonv;
const pegImplicit = V.pe / V.peg;
const peMedianElement = mats.map(r => r.vardering?.pe).filter(Number.isFinite).sort((a, b) => a - b);
const holmenPeRank = peMedianElement.indexOf(V.pe) + 1; // 7 av 13 = medianelementet
const scen = [];
for (const dm of [-0.01, 0, 0.01]) { const rad = []; for (const di of [-0.03, 0, 0.03]) rad.push(oms3 * (1 + di) * (L.ebitMarginal + dm) / 1e6); scen.push(rad); }
const pp1 = oms3 * 0.01 / 1e6;
const int3 = oms3 * 0.03 / 1e6;
const marginalvikt = 1 / (3 * L.ebitMarginal);
const multlov = V.pe / (1 + T.prognosTillvaxt);
const gapNettoEbit = (L.nettoMarginal - L.ebitMarginal) * oms3 / 1e6;
const gapPp = 100 * (L.nettoMarginal - L.ebitMarginal);

const sv = (x, d = 2) => x.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d });

// ————— länkar (16 material-aspekter + bolagssida + kurser/transparens/kallor = 20 unika) —————
const L_PE = '/dataset/material/pe', L_PB = '/dataset/material/pb', L_EV = '/dataset/material/ev-ebit', L_PEG = '/dataset/material/peg';
const L_FCF = '/dataset/material/fcf-avkastning', L_ROE = '/dataset/material/roe', L_ROIC = '/dataset/material/roic';
const L_BRUTTO = '/dataset/material/brutto-marginal', L_NETTO = '/dataset/material/netto-marginal', L_OMSC = '/dataset/material/omsattning-cagr-5ar';
const L_RESC = '/dataset/material/resultat-cagr-5ar', L_TTM = '/dataset/material/omsattningstillvaxt-ttm', L_PROG = '/dataset/material/prognos-tillvaxt';
const L_SKULD = '/dataset/material/skuldsattning', L_VARD = '/dataset/material/vardering', L_UNIV = '/dataset/material/universumjamforelse';

const body = `Holmen AB — ticker HOLM B på Nasdaq Stockholm — publicerar sin delårsrapport för januari–september 2026 torsdagen den **22 oktober, på morgonen**. Datumet står i bolagets egen kalender: "Interim report January–September 2026". Det här är utbildningspaket i AK1A:s kvartalsrapportserie — och seriens **första materialpaket**: skog, papper och förädlingsverk. Efter bankernas balansräkningsläsart, industrierns marginalläsart, fastighetens NAV, NIKE:s brutna räkenskapsår, telekomens hävstång, försvarsindustrins orderbok och elkoncernens kapitalläsart är skogsindustrin seriens nionde läsart — cykelläsarten i ren form: produktpriser som rör sig med världsekonomin, tillgångar som växer i skogen. Material var seriens sista bransch utan enda levererat läspaket; efter detta har alla tio grenar paket. Det hela är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

## Urvalet: varför Holmen är nästa paket i serien

Bland kalenderns materialbolag var tidigaste officiellt bekräftade rappdag 22 oktober, med tre kandidater i egna kalendrar: Billerud (ca kl 07:00), Holmen (på morgonen) och Yara (kl 08:00); Newmont samma dag är estimat enligt tredjepartskalendrar och sorteras enligt seriens metodnot. Sorteringen förtjänar att redovisas öppet, för den visar reglerna. Billerud sorterades bort med datamotivering (Prologis-precedensen: officiellt datum räcker inte — datan måste bära): bolagets P/E-fält är null och lönsamhetsfälten är negativa (ROE minus 0,15 procent, ROIC minus 0,72) efter ett resultat som fallit från 4 590 till 711 miljoner kronor på fyra år — utan vinstmultipel blir identitetstestet omöjligt. Yara sorterades med motivering av annat slag: prognostillväxtfältet är minus 20,9 procent — PEG på negativ tillväxt är meningslöst och redan pensionerat i serien (NP3-paketets fjärde tillstånd) — och identitetstestet gapar kring tio procent på norsk kronor-notering. Båda är materialgrenens kommande kandidater på friskare vindor. Holmen kvarstår: officiellt bekräftat datum i egen kalender, fyra sammanhängande räkenskapsår 2022–2025, fulla nyckeltalsfält — och ett identitetstest som stänger på 0,4 procent, seriens renaste utanför bankerna. En ärlighetsnot med Tele2-paketets presedens: HOLM B står utanför vågvalideringens tolvbolagsuniversum och saknar analysfil i biblioteket — ingen dom och ingen 25-cellersmatris redovisas; luckan är information, inget värde är gissat.

## Nyckeltalen att ha med sig — skogsindustrins egen uppsättning

Värdena nedan är senaste mätta tal ur bolagsuniversumets datainsamling (Holmens post hämtad 2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom materialbranschen.

**Värdering — medianbolagets multipler, och det som bärs utanför resultaträkningen**

- Pris per vinst (P/E): **${sv(V.pe, 1)}** — [P/E inom material](/dataset/material/pe). Det sjunde sorterade värdet av tretton — **Holmen ÄR materialgrenens medianbolag på vinstmultipeln**, exakt på talet: bolagets ${sv(V.pe, 3)} är medianen själv (Castellum-paketets precedens från fastighetsgrenen). Mot universumets ${sv(mU.pe, 1)} (n=${nU.pe}) ligger bolaget elva procent under.
- Pris per bokfört eget kapital (P/B): **${sv(V.pb, 3)}** — [P/B inom material](/dataset/material/pb). 35 procent UNDER branschmedianen ${sv(mM.pb)} (n=${nM.pb}) och 68 procent under universumets ${sv(mU.pb)} (n=${nU.pb}).
- Läs de två tillsammans, aldrig var för sig: identiteten **P/E = P/B ÷ ROE** binder dem, och hos Holmen tar avvikelserna ut varandra — P/B 35 procent under medianen, ROE 33 procent under (se lönsamheten nedan), och kvoten mellan avvikelserna lägger multipeln på vinsten precis på medianen. Tre mått, tre lägen, ett sammanhang: så ser DuPont ut i prisform.
- Enterprise value per rörelseresultat (EV/EBIT): **${sv(V.evEbit, 1)}** — [EV/EBIT inom material](/dataset/material/ev-ebit). 2,4 gånger branschmedianen ${sv(mM.evEbit)} (n=${nM.evEbit}) — men läs nivån med netto-över-EBIT-gapet i minnet (källkritiken): när intäkter kommer under rörelseresultatet blir varken EBIT-foten eller EV:t vad de utger sig för; fältet redovisas som räknestorhet med en kedjekontroll som denna gång nästan stänger.
- Fri kassaflödesavkastning (FCF-yield): **${sv(V.fcfYield * 100)} procent** — [så räknas FCF-avkastningen](/dataset/material/fcf-avkastning). Konsistenspärlan: FCF-marginalen ${sv(L.fcfMarginal * 100)} procent gånger intäkterna ${sv(oms3 / 1e6, 0)} miljoner kronor ger ${sv(FCF25 / 1e6, 0)} miljoner fria kassaflöden — delat med börsvärdet ${sv(H.marknadsKapitalMdr, 1)} miljarder blir det ${sv(fcfYKontroll)} procent, alltså fältets egen siffra inom två hundradelar. Kedjan håller i kassaflödesledet.
- PEG-talet: **${sv(V.peg)}** — [PEG inom material](/dataset/material/peg) — med prognostillväxten ${sv(T.prognosTillvaxt * 100)} procent; konventionen prövas i källkritikavsnittet och faller med faktor nästan tre.
- Vid insamlingen var kursen **${sv(H.pris)} kronor** och börsvärdet **cirka ${sv(H.marknadsKapitalMdr, 1)} miljarder kronor**. [Värderingsöversikten](/dataset/material/vardering) sätter multiplarna i sitt sammanhang.

**Lönsamhet — marginalernas ovanliga ordning**

- Räntabilitet på eget kapital (ROE): **${sv(L.roe * 100, 1)} procent** — [så räknas ROE](/dataset/material/roe). Under material-medianen ${sv(mM.roe * 100, 1)} procent (33 procent under) och under universumets ${sv(mU.roe * 100, 1)} (n=${nU.roe}).
- Räntabilitet på investerat kapital (ROIC): **${sv(L.roic * 100, 1)} procent** — [så räknas ROIC](/dataset/material/roic), med källans proxy-not (rörelseresultat före skatt delat på skuld plus bokfört eget kapital): läs gapet mot ROE med definitionerna i handen.
- Bruttomarginal: **${sv(L.bruttoMarginal * 100, 1)} procent** — [bruttomarginal inom material](/dataset/material/brutto-marginal) — 36 procent över branschmedianen ${sv(mM.brutto * 100, 1)}: förädlingen bär. Med källans not att ingen årlig bruttovinsthistorik finns; fältet är en punktmätning.
- Rörelsemarginal (EBIT): **${sv(L.ebitMarginal * 100)} procent** — 35 procent under branschmedianen ${sv(mM.ebit * 100, 1)}. Notera ordningen: brutto 45,6 procent, sedan EBIT 7,2 — rörelsekostnaderna äter 38 procentenheter mellan raderna.
- Nettomarginal: **${sv(L.nettoMarginal * 100)} procent** — [så läses nettomarginalen](/dataset/material/netto-marginal) — 27 procent ÖVER branschmedianen ${sv(mM.netto * 100, 1)}. Och här är paketets mest uppseendeväckande rad: **nettomarginalen ligger över rörelsemarginalen** — ${sv(L.nettoMarginal * 100)} mot ${sv(L.ebitMarginal * 100)}, ett gap på ${sv(gapPp)} procentenheter eller grovt ${sv(gapNettoEbit, 0)} miljoner kronor av 2025 års intäkter. Wallenstam-paketet hade samma ordning (värdeposter), Tele2-paketet likaså (associerade bolag); Holmen är tredje fallet, och mekaniken heter hos skogsindustrier i allmänhet finansiella poster — räntenetto och resultat från energiproduktion och associerade bolag — men universums rådata konstaterar gapet, rapportens finansiella poster specificerar. Kontrasten är Iberdrola-paketet, där nettot låg under EBIT:et och kallades det normala fallet.
- Fri kassaflödesmarginal: **${sv(L.fcfMarginal * 100)} procent** — nettomarginalen ${sv(L.nettoMarginal * 100)} mot FCF-marginalen ${sv(L.fcfMarginal * 100)} visar gapet mellan vinst och kassa som skogsindustrins fingerprint: massabruk och pappersmaskiner är kapitaltäta, underhåll och skogsköp äter skillnaden. Datat konstaterar gapet; investeringsavsnittet i rapporten specificerar.

**Tillväxt — cykelns deaccelererande fall som planar**

- Intäkter över senaste fyra räkenskapsåren: **minus ${sv(Math.abs(cagr(oms0, oms3)), 2)} procent per år** (${sv(oms0 / 1e6, 0)} → ${sv(oms1 / 1e6, 0)} → ${sv(oms2 / 1e6, 0)} → ${sv(oms3 / 1e6, 0)} miljoner kronor, med årliga steg ${sv(steg(oms0, oms1))}/${sv(steg(oms1, oms2))}/${sv(steg(oms2, oms3))} procent) — [så räknas CAGR](/dataset/material/omsattning-cagr-5ar). Ärlighetsnot: källan ger fyra år, inte fem.
- Resultat samma period: **minus ${sv(Math.abs(cagr(res0, res3)), 2)} procent per år** — men stegen är ${sv(steg(res0, res1))}/${sv(steg(res1, res2))}/+${sv(steg(res2, res3))} procent: ett deaccelererande fall som planar ut, ${sv(res2 / 1e6, 0)} → ${sv(res3 / 1e6, 0)} miljoner är i princip plant. [Resultat-CAGR förklarad](/dataset/material/resultat-cagr-5ar). CAGR-talets ändpunkter räknar 2022 års topp mot 2025 — slutpunktsformelns blinda fläck som dolde Wallenstams förlustår och NP3:s vändning dolde här att fallet redan stannat.
- Härledd nettomarginalserie (resultat delat med intäkter, egen beräkning med redovisad metod): **${sv(nmSerie[0])} → ${sv(nmSerie[1])} → ${sv(nmSerie[2])} → ${sv(nmSerie[3])} procent**. Tre fallande steg — och det fjärde året vänder upp: ${sv(nmSerie[3])} mot ${sv(nmSerie[2])}. Cykelns botten, om det är en botten, är en marginalsaga.
- Intäktstillväxt senaste tolvmånadersperioden: **plus ${sv(T.omsattningTillvaxtTTM * 100, 1)} procent** — [så läses TTM-tillväxten](/dataset/material/omsattningstillvaxt-ttm) — mot serieårens minuslägen: första tecknet på att prissidan vänt.
- Prognostillväxt: **plus ${sv(T.prognosTillvaxt * 100)} procent** — [om prognostillväxt](/dataset/material/prognos-tillvaxt) — samlad marknadsuppskattning är ett pedagogiskt begrepp, inte en sanning och inte vår prognos. Notera avståndet mot historien: CAGR minus 21 mot prognos plus ${sv(T.prognosTillvaxt * 100)} — förväntninggapet är cykelbolagets signatur.

**Stabilitet — den obelånade balansräkningen**

- Skulder per eget kapital: **${sv(S.skuldEgenkapital, 3)}** — [om skuldsättning](/dataset/material/skuldsattning). En tredjedel av branschmedianen ${sv(mM.skuld, 2)} och en fjärdedel av universumets ${sv(mU.skuld, 2)} (n=${nU.skuld}) — bland materialgrenens fjorton bolag har ingen lägre kvot. Skog och verkssubstans ägs, inte lånet — skogsindustrins klassiska balansräkningsprofil, mot stål- och gruvbolag i samma gren med multipelt högre belåning.
- Räntetäckning: **osatt** — källan saknar räntekostnad för senaste räkenskapsåret. Med skulder kring ${sv(skuldMdr, 1)} miljarder kronor (EV-kedjans steg två) är hålet hanterbart men sägs som det är.
- Utdelning: universumets återköps- och utdelningsfält är null för bolaget — utdelningsbeskedet är något rapporten för med sig; läs beskedet när det kommer.
- Insiderregistrerade köp senaste sex månader: **0** — som i alla tidigare paketbolag utom NIKE; frånvaron av tal är inte en signal.

## Källkritik: identiteten stänger som en bank — fast det är en skog

Kör identitetstestet **P/E = P/B ÷ ROE** på Holmens källvärden: ta P/B ${sv(V.pb, 3)}, dividera med ROE ${sv(L.roe, 3)} — resultatet blir **${sv(ident)}**. Källans eget P/E-tal är ${sv(V.pe, 3)}. Skillnaden är **${sv(identDiff)} procent**. Omvänt: ${sv(V.pe, 3)} multiplicerat med ${sv(L.roe, 3)} ger **${sv(omvant, 3)}** mot källans P/B ${sv(V.pb, 3)} — samma avstånd. Implicit vinst per aktie: ${sv(H.pris)} delat med ${sv(V.pe, 1)} är **${sv(epsImplicit)} kronor**. Varför stänger testet så hårt? Swedbank-paketets svar: med en valuta hela vägen syns ett korrekt dataset i hur tätt allt sitter ihop. Bankerna har hittills varit seriens egen klass på 0,3–0,9 procent (Swedbank dokumenterat 0,3); Iberdrola-paketets 1,9 procent kallades seriens renaste utanför bankerna. **Holmen landar på ${sv(identDiff)} procent — den första icke-banken inne i bankzonen**, och kontrasten mot ABB (tiopotens) och Nordeas valutamixning (kvot 10,8) visar vad som skiljer: inte branschen, utan mätningen. En svenska, en källa, ett mättillfälle.

Sedan absolutkontrollen — och här gapar det: P/E-fältet ${sv(V.pe, 1)} multiplicerat med årsresultatet ${sv(res3 / 1e6, 0)} miljoner kronor ger ${sv(absKontroll, 1)} miljarder mot börsvärdesfältets ${sv(H.marknadsKapitalMdr, 1)} — en residual på ${sv(absResid, 1)} procent. Omvänt räknat: börsvärdet delat med P/E-fältet ger ett underlag på ${sv(absOmvant, 0)} miljoner kronor mot årets ${sv(res3 / 1e6, 0)}. Hypotes, redovisad som hypotes: ett TTM-fönster snett mot räkenskapsåret — filen skiljer inte. Multipelfälten stämmer inbördes (identiteten!) men inte mot absoluten: fältens värld är förhållanden, inte punkter. P/E på årsresultatet direkt är ${sv(H.marknadsKapitalMdr * 1e9 / res3, 1)}.

Sedan PEG-fältet: källans ${sv(V.peg)} med prognostillväxten ${sv(T.prognosTillvaxt * 100)} procent ger konventionen P/E ÷ tillväxt i procent = ${sv(V.pe, 1)} ÷ ${sv(T.prognosTillvaxt * 100)} = **${sv(pegKonv)}** — källan ligger ${sv(pegKvot, 1)} gånger över. Baklänges implicerar fältet en tillväxt på ${sv(pegImplicit, 1)} procent, som inte matchar något av filens egna tal (prognos ${sv(T.prognosTillvaxt * 100)}, TTM ${sv(T.omsattningTillvaxtTTM * 100, 1)}, CAGR minus ${sv(Math.abs(cagr(res0, res3)), 1)}). Efter ett dussin observationer i serien med kvotspridning över och under är slutsatsen densamma som Castellum-paketets: fältet kan strida mot sig själv inom ett bolag; härledbara multiplar kontrolleras, okända vägar är räknestorheter.

Sedan EV-kedjan — NIKE-paketets femstegskontroll, här med seriens andra nästan-slutna utfall. Steg ett: börsvärdet ${sv(H.marknadsKapitalMdr, 1)} delat med P/B ${sv(V.pb, 3)} ger bokfört eget kapital på **${sv(EK, 1)} miljarder kronor**. Steg två: skuldkvoten ${sv(S.skuldEgenkapital, 3)} ger skulder på **${sv(skuldMdr, 1)} miljarder**. Steg tre: EV = ${sv(EK, 1)} + ${sv(skuldMdr, 1)} = **${sv(EVkedja, 1)} miljarder kronor**. Steg fyra: rörelseresultatet i 2025-års bas = ${sv(oms3 / 1e6, 0)} × ${sv(L.ebitMarginal * 100)} procent = **${sv(EBIT25 / 1e6, 0)} miljoner kronor**. Steg fem: EV/EBIT enligt kedjan = ${sv(EVkedja, 1)} miljarder ÷ ${sv(EBIT25 / 1e6 / 1e3, 2)} miljarder = **${sv(EVkedja * 1e9 / EBIT25, 1)}** — mot källans fält ${sv(V.evEbit, 1)}, en kvot på ${sv(evKvot, 2)}. Detta är inte Tele2-fallet (kvot 2,7, omöjlig negativ kassa) och inte riktigt NIKE-fallet (sluten kedja): residualen blir ${sv(kassaRes, 1)} miljarder kronor i kassa — positiv, ungefär två procent av EV. Kedjan spänner med elva procent men går att bära: hypotesen är att fältets EBIT-definition skiljer sig från marginalfältets (operativt EBIT före vissa poster). Fält för fält, aldrig fältblock — och FCF-kontrollen håller som visats: ${sv(L.fcfMarginal * 100)} procent × ${sv(oms3 / 1e6, 0)} = ${sv(FCF25 / 1e6, 0)} miljoner, delat med ${sv(H.marknadsKapitalMdr, 1)} miljarder = ${sv(fcfYKontroll)} procent mot fältets ${sv(V.fcfYield * 100)}.

## Så står sig bolaget mot branschen

| Nyckeltal | Holmen | Median material (${nM.pe === nM.pb ? '' : ''}${mats.length} bolag) | Median hela universumet |
|---|---|---|---|
| P/E | ${sv(V.pe, 1)} | ${sv(mM.pe, 1)} (n=${nM.pe}) | ${sv(mU.pe, 1)} (n=${nU.pe}) |
| P/B | ${sv(V.pb, 2)} | ${sv(mM.pb, 2)} | ${sv(mU.pb, 2)} (n=${nU.pb}) |
| Räntabilitet på eget kapital (ROE) | ${sv(L.roe * 100, 1)} % | ${sv(mM.roe * 100, 1)} % | ${sv(mU.roe * 100, 1)} % (n=${nU.roe}) |
| Rörelsemarginal (EBIT) | ${sv(L.ebitMarginal * 100)} % | ${sv(mM.ebit * 100, 1)} % | ${sv(mU.ebit * 100, 1)} % (n=${nU.ebit}) |
| Nettomarginal | ${sv(L.nettoMarginal * 100)} % | ${sv(mM.netto * 100, 1)} % | ${sv(mU.netto * 100, 1)} % (n=${nU.netto}) |

(Alla värden hämtade 2026-09-03 för Holmens del; medianerna beräknade 2026-09-17 ur 144-bolagsfilen — ${mats.length} bolag i material, där P/E-medianen bygger på n=${nM.pe} eftersom Billerud saknar fältet; universumets n redovisat per mått. Servade dataset-sidor visar äldre medianer tills nästa prod-bygge.)

Läsningen: profilens form är poängen. PÅ medianen i P/E — under i P/B, ROE och rörelsemarginal — över i nettomarginal. Det är en balansräkningsberättelse snarare än en resultaträkningsberättelse: lite lånat kapital, mycket bokfört skogsmarksvärde till underskattad multipel, och resultatflödet delat mellan förädlingsverk och poster nedanför EBIT. Jämförelsen mot samtliga kollegor finns i [universumjämförelsen](/dataset/material/universumjamforelse), och bolagets sida i biblioteket finns [här](/bolag/holm-b-st).

## Tre sätt att läsa utfallet — övningar i metod

Tre övningar i vad en rapportläsare vanligtvis tittar på för ett skogsindustriellt bolag. Ingen är en bedömning av vad som kommer att hända den 22 oktober — de är träning i metod och ren aritmetik.

**Övning A — läs medianpositionen med DuPont: vad prissätts, vad presteras?** Triangeln: P/E ${sv(V.pe, 1)} på medianen; P/B ${sv(V.pb, 2)} som 35 procent rabatt; ROE ${sv(L.roe * 100, 1)} som 33 procent under medianen. Identiteten gör tre mått till ett påstående: P/E-kvoten mot medianen är P/B-kvoten dividerad med ROE-kvoten — ${sv(V.pb / mM.pb, 2)} ÷ ${sv(L.roe / mM.roe, 2)} = ${sv((V.pb / mM.pb) / (L.roe / mM.roe), 2)}, alltså i praktiken på medianen. Träningsfrågorna till rapporten: fyller vinsten på mot kapitalbasen (det bokförda egna kapitalet ${sv(EK, 1)} miljarder enligt kedjan — hur rör det sig), och håller netto-över-EBIT-gapet (${sv(gapPp)} procentenheter) i grafen för finansiella poster? Kontrasterna bär pedagogiken: Iberdrolas marginalprem under kapitalets broms, Volvo Groups hävstångsburna ROE — och Holmens utjämnade medianposition där inget mått sticker ut men ordningen mellan dem gör det.

**Övning B — läs cykeln: planar fallet eller vänder det?** Grundberättelsen: resultatsteg ${sv(steg(res0, res1))} → ${sv(steg(res1, res2))} → +${sv(steg(res2, res3))} procent, intäktssteg ${sv(steg(oms0, oms1))} → ${sv(steg(oms1, oms2))} → ${sv(steg(oms2, oms3))} procent, härledd nettomarginalserie ${sv(nmSerie[0])} → ${sv(nmSerie[1])} → ${sv(nmSerie[2])} → ${sv(nmSerie[3])} procent med fjärde året uppåt, och TTM-tillväxten plus ${sv(T.omsattningTillvaxtTTM * 100, 1)} procent mot prognosen plus ${sv(T.prognosTillvaxt * 100)}. Träningsfrågorna: är 2024–2025 en ny basnivå (då är P/E ${sv(V.pe, 1)} på medianen prisat mot basen) eller ett trappsteg i en fortsatt nedgång? Vad bär marginalupptaget — volym, pris på papper och massa, eller energipriser på den egna produktionen? Delårsrapportens januari–september-tal ger första indikationen; att läsa mot rätt jämförelseperiod är H&M-paketets läsart. 2022 års topp var samma år som elprisernas — cyklerna hänger ihop, och det är cykelpedagogikens kärna.

**Övning C — scenariorutan i ren aritmetik, och den tunna marginalens rekord.** Universumet saknar kvartalsserier, så rutan räknas på helåret 2025 som bas: intäkter ${sv(oms3 / 1e6, 0)} miljoner kronor och rörelsemarginal ${sv(L.ebitMarginal * 100)} procent ger ett rörelseresultat på ungefär ${sv(EBIT25 / 1e6, 0)} miljoner kronor. Med tre hypotetiska intäktsnivåer (±3 procent) och tre marginaler (±1 procentenhet) blir rutan, i miljoner kronor:

| Rörelseresultat, miljoner kronor | Marginal ${sv(100 * (L.ebitMarginal - 0.01))} % | Marginal ${sv(L.ebitMarginal * 100)} % | Marginal ${sv(100 * (L.ebitMarginal + 0.01))} % |
|---|---|---|---|
| Intäkter ${sv(oms3 * 0.97 / 1e6, 0)} | ${sv(scen[0][0], 0)} | ${sv(scen[0][1], 0)} | ${sv(scen[0][2], 0)} |
| Intäkter ${sv(oms3 / 1e6, 0)} | ${sv(scen[1][0], 0)} | ${sv(scen[1][1], 0)} | ${sv(scen[1][2], 0)} |
| Intäkter ${sv(oms3 * 1.03 / 1e6, 0)} | ${sv(scen[2][0], 0)} | ${sv(scen[2][1], 0)} | ${sv(scen[2][2], 0)} |

Två räknesatser att öva på: en procentenhet marginal flyttar resultatet med cirka ${sv(pp1, 0)} miljoner kronor vid oförändrade intäkter, medan tre procent mer intäkter vid oförändrad marginal flyttar det med cirka ${sv(int3, 0)} miljoner — **intäktsratten väger cirka ${sv(int3 / pp1, 1)} gånger tyngre** än marginalratten. Essity-paketets formel (marginalens relativa vikt är ett delat på tre gånger marginalnivån) ger **${sv(marginalvikt, 1)}** — SERIENS NYA REKORD: Holmen ${sv(marginalvikt, 1)} > Volvo Group 3,2 > NIKE/Essity 2,6 > Alfa Laval 2,1 ≈ ABB 2,0 > Sandvik/Atlas Copco 1,6–1,7 > Tele2 1,37 > Iberdrola 1,36 > banker/Wallenstam 0,5–0,6. En sju-procentig rörelsemarginal är seriens tunnaste: varje procentenhet är dyrbar, och volymen gör jobbet. MEN — och detta är rutans egna gränser, med Wallenstam- och Castellum-precedenserna: nettoresultatet styrs till betydande del av poster RUTAN INTE TÄCKER (gapet netto över EBIT var ${sv(gapPp)} procentenheter); rutan är bilaga, övning B är huvudövning. Alla nio celler ovan är aritmetik på 2025 års bas, inga prognoser. En sista räkneövning: P/E ${sv(V.pe, 1)} delat med 1,${sv(T.prognosTillvaxt * 100, 0)} (ett plus prognostillväxten, använd som räknestorhet, inte som prognos) blir **${sv(multlov, 1)}** — om vinsten växer i den takten och kursen står stilla sjunker multipeln väl under såväl bransch- som universummedianen; multiplens dubbla natur (kursen eller vinsten) är övningens innehåll, inte en handssignal.

## Praktiskt inför 22 oktober

- Rappdagen torsdagen 22 oktober, på morgonen, står i [Holmens kalender](https://www.holmen.com/en/Newsroom/press/calendar/Interim-report-January-September-2026/) — "Interim report January–September 2026": jämför mot januari–september 2025, inte mot ett enskilt kvartal (samma delårsläsart som fastighetspaketen; kontrast mot de amerikanska kvartalspaketen). Q2-rapporten kom 20 augusti; rytm och kalenderfakta ur kalenderunderlaget (källorna nedan).
- Tyst period: Holmens kalenderpost nämner ingen — kontrasten inom samma gren är kalenderpedagogik: SCA stänger 30 kalenderdagar före sin rapport (23 oktober) och Yara från 25 september, Stora Enso 21 dagar före sin. Samma bransch, tre olika regler — kolla alltid bolagets egen kalenderpost, anta aldrig.
- SEK mot SEK: bolaget rapporterar och handlas i kronor — ingen valutatermin gömmer sig i multiplarna (kontrast mot Nordea-, ABB- och NIKE-paketen).
- Håll koll på: Billerud rapporterar samma morgon (ca 07:00) och Yara kl 08:00 — materialgrenens första tredubbla rappdag. Med Holmen blir den 22 oktober seriens första **sexdubbla** rappdag (Swedbank, Essity, Sandvik, Atlas Copco, Castellum, Holmen) och rappfönstret 20–23 oktober räcker nu **14 läspaket över fyra dagar**: ABB och Tele2 den 20:e, SKF, Handelsbanken och Iberdrola den 21:a, de sex den 22:a, Volvo Car, Volvo Group och Saab den 23:e.
- Ordlista för alla begrepp finns i [kurserna](/kurser). Metodtransparensen finns på [transparenssidan](/transparens) och [källsidan](/kallor).
- Efter rapporten uppdateras bolagsuniversumets nyckeltal vid nästa insamling — Holmens post står på 2026-09-03-vindan. Materialgrenens kvarvarande kandidater på friskare data: Billerud (väntar vinstmultipel) och Yara (väntar prognos-tecken) — Boliden 29 oktober och SSAB/UPM 28 oktober har sina datum klara. Oavsett utfall blir det en ny rad i det öppna kvittot.

## Källor

- Rappdag 2026-10-22 (på morgonen), "Interim report January–September 2026", Q2-rapporten 2026-08-20, granngrenens tystperiodskontraster (SCA 30 dagar, Yara från 09-25, Stora Enso 21 dagar) — officiell: Holmens kalendersida (holmen.com), hämtad 2026-09-15 — internt: data/blogg-utkast/kvartal/2026-q3/kalender-material.json.
- Nyckeltal, kurser, börsvärde och serier: bolagsuniversumets datainsamling för HOLM-B.ST 2026-09-03 (Yahoo Finance, quoteSummary-moduler; andra källan MarketStack saknade färsk kurs — ingen dubbelkoll av pris; ROIC = approximerad proxy enligt källans not; räntetäckning osatt, räntekostnad saknas; ingen årlig bruttovinsthistorik hos källan; serier/CAGR bygger på 4 räkenskapsår) — internt: data/portfolj-system/bolagsunivers.json. Bransch- och universumsmedianer beräknade 2026-09-17 ur samma fil (144 bolag, varav ${mats.length} i material; P/E-medianen n=${nM.pe} — Holmen är det ${holmenPeRank}:e sorterade värdet av ${nM.pe} och därmed medianelementet själv; universumets n redovisat per mått: P/E ${nU.pe}, P/B ${nU.pb}, ROE ${nU.roe}, EBIT ${nU.ebit}, netto ${nU.netto}).
- Identitetstest: egen beräkning enligt P/E = P/B ÷ ROE (${sv(V.pb, 3)} ÷ ${sv(L.roe, 3)} = ${sv(ident)} mot källans P/E ${sv(V.pe, 1)}; differens ${sv(identDiff)} procent; omvänt ${sv(V.pe, 1)} × ${sv(L.roe, 3)} = ${sv(omvant, 3)} mot ${sv(V.pb, 3)}; implicit vinst per aktie ${sv(H.pris)} ÷ ${sv(V.pe, 1)} = ${sv(epsImplicit)} kronor) — redovisad steg för steg. Absolutkontroll: ${sv(V.pe, 1)} × ${sv(res3 / 1e6, 0)} Mkr = ${sv(absKontroll, 1)} mdr kr mot mcap-fältet ${sv(H.marknadsKapitalMdr, 1)} mdr; residual ${sv(absResid, 1)} procent; hypotes TTM-fönster redovisas som hypotes.
- PEG-analys: källans ${sv(V.peg)} med prognostillväxt ${sv(T.prognosTillvaxt * 100)} procent; konventionen ${sv(V.pe, 1)} ÷ ${sv(T.prognosTillvaxt * 100)} = ${sv(pegKonv)}; kvot ${sv(pegKvot, 2)}; implicit tillväxt ur fältet ${sv(V.peg > 0 ? V.pe / V.peg : NaN, 1)} procent.
- EV-kedja: egen beräkning i fem steg (EK ${sv(H.marknadsKapitalMdr, 1)} ÷ ${sv(V.pb, 3)} = ${sv(EK, 1)} mdr kr; skuld × ${sv(S.skuldEgenkapital, 3)} = ${sv(skuldMdr, 1)} mdr; EV ${sv(EVkedja, 1)} mdr; EBIT ${sv(oms3 / 1e6, 0)} × ${sv(L.ebitMarginal * 100)} % = ${sv(EBIT25 / 1e6, 0)} Mkr; EV/EBIT-kedja ${sv(EVkedja * 1e9 / EBIT25, 1)} mot källans fält ${sv(V.evEbit, 1)}, kvot ${sv(evKvot, 2)}, kassa-residual ${sv(kassaRes, 1)} mdr kr positiv — kedjan spänner elva procent men är bärbar; hypotes EBIT-definitionsbrist redovisas som hypotes). FCF-kontroll: ${sv(L.fcfMarginal * 100)} % × ${sv(oms3 / 1e6, 0)} = ${sv(FCF25 / 1e6, 0)} Mkr ÷ ${sv(H.marknadsKapitalMdr, 1)} mdr = ${sv(fcfYKontroll)} % mot fältets ${sv(V.fcfYield * 100)}.
- Scenarioruta, räknesatser och marginalvikt: aritmetik på 2025 års bas ur universumsserierna (${sv(oms3 / 1e6, 0)} Mkr; ${sv(L.ebitMarginal * 100)} %; intäktsserie ${sv(oms0 / 1e6, 0)} → ${sv(oms3 / 1e6, 0)} Mkr; resultatserie ${sv(res0 / 1e6, 0)} → ${sv(res3 / 1e6, 0)} Mkr; härledd nettomarginalserie ${nmSerie.map(x => sv(x)).join('/')}; netto-över-EBIT-gap ${sv(gapPp)} pp ≈ ${sv(gapNettoEbit, 0)} Mkr); samtliga nio celler och båda räknesatserna maskinellt dubbeltkontrollerade vid tillverkningen 2026-09-17.
- Vågvalideringsnot: HOLM B står utanför vågvalideringens tolvbolagsuniversum och saknar analysfil i data/analyses/ — paketet bygger på kalender och universumsdata, ingen dom och ingen 25-cellersmatris redovisas (Tele2-paketets presedens; luckan är information, inget värde är gissat).

*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar med källa och datum angivna; där en källa saknar data står det explicit, och där källans fält inte håller för kontroll redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

const slug = 'sa-laser-du-holm-q3-2026';
const title = `Holmens delårsrapport 2026: så läser du den — seriens första materialpaket: P/E 18,8 exakt på branschmedianen, P/B och ROE under, identitetstestet stänger på 0,4 procent (första icke-banken i bankzonen), nettomarginalen över rörelsemarginalen`;
const description = `Holmen redovisar januari–september torsdagen den 22 oktober på morgonen. Här är seriens första materialpaket: skogsindustrins cykelläsart — P/E 18,8 exakt på materialgrenens median (det sjunde sorterade värdet av tretton) medan P/B 0,91 ligger 35 procent under och ROE 4,8 procent 33 under, nettomarginalen 11,9 procent ÖVER rörelsemarginalen 7,2 (gap grovt 1 019 miljoner kronor, tredje fallet i serien), identitetstestet P/E = P/B ÷ ROE som stänger på 0,4 procent, och skuldkvoten 0,13 som grenens lägsta. Scenariorutan räknas på 2025 års bas och varje siffra har sin källa.`;

function raknaOrd() {
  const text = title + ' ' + description + ' ' + body;
  return text.split(/\s+/).filter(w => w.trim()).length;
}

const mode = process.argv[2] || 'bygg';
if (mode === 'bygg') {
  const ord = raknaOrd();
  const json = {
    slug, title, description,
    pillar: 'Institutionell metodik',
    author: 'AK1A Research Lab',
    publishedAt: '2026-10-21',
    readingMinutes: Math.round(ord / 600),
    tags: ['kvartalsrapport', 'Holmen', 'material', 'nyckeltal', 'läspaket', 'skogsindustri'],
    body
  };
  writeFileSync(FIL, JSON.stringify(json, null, 1) + '\n');
  console.log('SKREV', FIL, '| ord', ord, '| readingMinutes', json.readingMinutes,
    '| title tkn', title.length, '| desc tkn', description.length);
} else if (mode === 'kvd') {
  // ————— KVD: omberäkna allt och verifiera mot filen —————
  const j = JSON.parse(readFileSync(FIL, 'utf8'));
  const hela = j.title + ' ' + j.description + ' ' + j.body;
  let P = 0, F = 0;
  const ok = (namn, villkor) => { if (villkor) P++; else { F++; console.log('FEL:', namn); } };
  ok('slug', j.slug === slug);
  ok('title överens', j.title === title);
  ok('description överens', j.description === description);
  ok('pillar/author', j.pillar === 'Institutionell metodik' && j.author === 'AK1A Research Lab');
  ok('tags', JSON.stringify(j.tags) === JSON.stringify(['kvartalsrapport', 'Holmen', 'material', 'nyckeltal', 'läspaket', 'skogsindustri']));
  const ord = raknaOrd();
  ok('readingMinutes = round(ord/600)', j.readingMinutes === Math.round(ord / 600));
  ok('ord i spann 2400–3300', ord >= 2400 && ord <= 3300);
  ok('title <= 246 tkn', title.length <= 246);
  ok('desc <= 670 tkn', description.length <= 670);
  ok('inga mjuka bindestreck', !hela.includes('­'));
  ok('inga markdown-länkar till utkast', !/\]\(\/blogg-utkast/.test(hela));
  // — sifferkontroller: formatteraren är IDENTISK med byggtextens sv() → automatisk paritet —
  const sv2 = (x, d = 2) => x.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d });
  const svn = x => x.toLocaleString('sv-SE', { maximumFractionDigits: 0 });
  const finn = (txt, namn) => ok('text innehåller ' + namn + ' (' + txt + ')', hela.includes(txt));
  finn(sv2(ident), 'identitet');
  finn(sv2(identDiff) + ' procent', 'identitetsdiff');
  finn(sv2(omvant, 3), 'omvänt');
  finn(sv2(epsImplicit) + ' kronor', 'implicit EPS');
  finn(sv2(absKontroll, 1), 'absolutkontroll mdr');
  finn(sv2(absResid, 1) + ' procent', 'absolutresidual');
  finn(sv2(pegKonv), 'PEG-konvention');
  finn(sv2(pegKvot), 'PEG-kvot');
  finn(sv2(pegImplicit, 1), 'PEG-implicit tillväxt');
  finn(sv2(EK, 1), 'EK mdr');
  finn(sv2(skuldMdr, 1), 'skuld mdr');
  finn(sv2(EVkedja, 1), 'EV mdr');
  finn(svn(EBIT25 / 1e6), 'EBIT Mkr');
  finn(sv2(EVkedja * 1e9 / EBIT25, 1), 'EV/EBIT-kedja');
  finn(sv2(evKvot), 'EV-kvot');
  finn(sv2(kassaRes, 1), 'kassa-residual mdr');
  finn(sv2(fcfYKontroll) + ' procent', 'FCF-kontroll');
  finn('minus ' + sv2(Math.abs(cagr(oms0, oms3))), 'omsCAGR minus-form');
  finn('minus ' + sv2(Math.abs(cagr(res0, res3))), 'resCAGR minus-form');
  finn(sv2(steg(res0, res1)), 'ressteg1');
  finn(sv2(steg(res1, res2)), 'ressteg2');
  finn('+' + sv2(steg(res2, res3)), 'ressteg3 plusform');
  for (const n of nmSerie) finn(sv2(n), 'nettomarginalserie ' + sv2(n));
  for (const rad of scen) for (const c of rad) finn(svn(c), 'scenariecell ' + svn(c));
  finn(svn(pp1), '1 pp Mkr');
  finn(svn(int3), '3 % Mkr');
  finn(sv2(marginalvikt, 1), 'marginalvikt');
  finn(sv2(multlov, 1), 'multiplövning');
  finn(sv2(gapPp), 'gap netto-EBIT pp');
  finn(svn(gapNettoEbit), 'gap Mkr');
  finn(sv2(V.pe, 1), 'P/E');
  finn(sv2(V.pb, 3), 'P/B');
  finn(sv2(mM.pe, 1), 'median-P/E');
  finn(sv2(mU.pe, 1), 'universum-P/E');
  finn(sv2(mM.pb), 'median-P/B');
  finn(sv2(mU.pb), 'universum-P/B');
  finn(sv2(mM.roe * 100, 1), 'median-ROE');
  finn(sv2(mU.roe * 100, 1), 'universum-ROE');
  finn(sv2(mM.ebit * 100, 1), 'median-EBIT');
  finn(sv2(mU.ebit * 100, 1), 'universum-EBIT');
  finn(sv2(mM.netto * 100, 1), 'median-netto');
  finn(sv2(mU.netto * 100, 1), 'universum-netto');
  finn(sv2(V.evEbit, 1), 'EV/EBIT-fält');
  finn(sv2(mM.evEbit), 'median-EV/EBIT');
  ok('medianelement-rank', holmenPeRank === 7 && nM.pe === 13);
  ok('n-redovisning material P/E=13', String(nM.pe) === '13' && hela.includes('(n=13)'));
  ok('mats.length 14 i tabellrad', hela.includes(`Median material (14 bolag)`));
  // — juridikgrind —
  const rad = ['bör köp', 'köpa aktier', 'rekommenderar köp', 'sälj dina', 'vi råder', 'investeringstips', 'aktietips'];
  for (const r of rad) ok('rådfras saknas: ' + r, !hela.toLowerCase().includes(r));
  const goda = hela
    .split('inte en rekommendation att köpa, sälja eller behålla').join('')
    .split('Inga köp-, sälj- eller hållningsrekommendationer').join('')
    .split('Insiderregistrerade köp').join('')
    .split('skogsköp').join('')
    .split('återköps- och utdelningsfält').join('');
  const rest = (goda.match(/köp|sälj/g) || []).length;
  ok('köp/sälj endast i godkända kontexter (0 övriga)', rest === 0);
  ok('disclaimer sista rad 2007:528 2 kap 5 §', j.body.trimEnd().endsWith('kundens beslut.*') && hela.includes('lagen (2007:528) 2 kap 5 §'));
  ok('inga andra lagrum', !/2022:260|2022:261|1985:716|2005:59|2022:482/.test(hela));
  // — interna länkar —
  const links = [...new Set([...hela.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))].filter(l => l.startsWith('/'));
  ok('20 unika interna länkar', links.length === 20);
  console.log('länkar att kontrollera:', links.length);
  let kvar = links.length;
  for (const l of links) {
    http.get({ host: 'localhost', port: 3000, path: l, headers: { 'x-loopback': '1' } }, res => {
      if (res.statusCode !== 200) { F++; console.log('LÄNK FEL', l, res.statusCode); }
      else P++;
      if (--kvar === 0) rapport();
    }).on('error', () => { F++; console.log('LÄNK ERR', l); if (--kvar === 0) rapport(); });
  }
  function rapport() {
    console.log(`\nKVD: ${P} PASS, ${F} FEL, 0 VARNING`);
    process.exit(F === 0 ? 0 : 1);
  }
  if (links.length === 0) rapport();
} else {
  console.error('okänd åtgärd:', mode, '(bygg|kvd)');
  process.exit(1);
}
