// Byggskript s4-u2: JPMorgan Chase Q3-2026-läspaket — alla bärande tal motorräknade här.
// Källor: bolagsuniversumets JPM-post (2026-09-03) + sökverifierade officiella kvartal
// (Q2-26/Q1-26/FY25/Q4-25/Q3-25/Q2-25, sök 2026-09-18) + rappdag Business Wire 2026-09-17.
import fs from 'node:fs';

const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const UT = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-jpmorgan-q3-2026.json';
const uni = JSON.parse(fs.readFileSync(UNI, 'utf8'));
const jpm = uni.find(r => r.ticker === 'JPM');
if (!jpm) throw new Error('JPM saknas i universumfilen');

// sv-SE-formatterare (samma kontrakt som syskonpaketen: komma decimal, mellanslag tusental)
const f3 = x => x.toLocaleString('sv-SE', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const f2 = x => x.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const f1 = x => x.toLocaleString('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const f0 = x => Math.round(x).toLocaleString('sv-SE');

// — universumfält (källtalsparitet) —
const PE = jpm.vardering.pe, PB = jpm.vardering.pb, EV = jpm.vardering.evEbit, PEGK = jpm.vardering.peg;
const ROE = jpm.lonksamhet.roe, EBITM = jpm.lonksamhet.ebitMarginal, NETTO = jpm.lonksamhet.nettoMarginal;
const TTMF = jpm.tillvaxt.omsattningTillvaxtTTM, PROG = jpm.tillvaxt.prognosTillvaxt;
const PRIS = jpm.pris, MCAP = jpm.marknadsKapitalMdr, INSIDER = jpm.aterkop.insiderkopSenaste6man;

// — officiella rapporterade tal (sökverifierade 2026-09-18) —
const FY25_NE = 57.0, FY25_EPS = 20.02, FY25_ROE = 17, FY25_ROTCE = 20, BVPS_Q425 = 126.99, EK_2025 = 362;
const Q3_25_NE = 14.4, Q3_25_EPS = 5.07, Q3_25_REV = 47.1;
const Q4_25_NE = 13.0, Q4_25_EPS = 4.63, Q4_25_ADJ_EPS = 5.23, Q4_25_REV_REP = 45.8, Q4_25_REV_MAN = 46.8;
const Q1_26_NE = 16.5, Q1_26_EPS = 5.94, Q1_26_REV = 50.5, Q1_25_EPS = 5.08, ROTCE_26 = 23;
const Q2_26_NE = 21.2, Q2_26_EPS = 7.71, Q2_26_REV = 57.3, VISA = 4.6;
const Q2_25_NE = 15.0, Q2_25_EPS = 5.25, Q2_25_REV = 45.7, Q2_25_NII = 23.3;
const BVPS_TIDIGARE = [124.96, 116.07];

// — datavaktens motorräkningar —
const idFram = PB / ROE;                       // P/B ÷ ROE
const idFramGap = (PE / idFram - 1) * 100;
const idTill = PE * ROE;                       // P/E × ROE
const idTillGap = (PB / idTill - 1) * 100;
const implicitPEvinst = MCAP / PE;             // mcap ÷ P/E
const ekFalt = MCAP / PB;                      // mcap ÷ P/B
const implicitROEvinst = ROE * ekFalt;
const ekBalansGap = (ekFalt / EK_2025 - 1) * 100;
const absFY = PE * FY25_NE;                    // P/E × bokförd FY25-vinst
const resFY = (MCAP / absFY - 1) * 100;
const ttmNe = Q3_25_NE + Q4_25_NE + Q1_26_NE + Q2_26_NE;   // rapporterade kvartal
const ttmNeEx = ttmNe - Q4_25_NE + 14.7;                    // Q4 ex-notable-variant
const absTTM = PE * ttmNe;
const resTTM = (MCAP / absTTM - 1) * 100;
const pegKonv = PE / (PROG * 100);
const pegFaktor = PEGK / pegKonv;
const pegImplTillv = PE / PEGK;
const gapKvot = (TTMF * 100) / (PROG * 100);   // konsensusgapet TTM/prognos
const yoyQ2ne = (Q2_26_NE / Q2_25_NE - 1) * 100;
const yoyQ2eps = (Q2_26_EPS / Q2_25_EPS - 1) * 100;
const yoyQ1eps = (Q1_26_EPS / Q1_25_EPS - 1) * 100;
const aktFY = FY25_NE / FY25_EPS;              // medelaktietal FY25
const aktQ4 = Q4_25_NE / Q4_25_EPS;
const aktQ2 = Q2_26_NE / Q2_26_EPS;
const aktNu = MCAP / PRIS;                     // kurs-implierat
const aktMinskTotal = (1 - aktNu / aktFY) * 100;
const pbMotBVPS = PRIS / BVPS_Q425;            // P/B mot rapporterat bokvärde
const bvpImpl = PRIS / PB;                     // fältimplierat bokvärde per aktie
const bvpSteg = (bvpImpl / BVPS_Q425 - 1) * 100;
const bvpsAr = (BVPS_Q425 / BVPS_TIDIGARE[1] - 1) * 100;
const nettoQ1man = Q1_26_NE / Q1_26_REV * 100;
const nettoQ1rep = Q1_26_NE / 47.3 * 100;      // rapporterad intäktsbas 47,3 enligt källa
const nettoQ2 = Q2_26_NE / Q2_26_REV * 100;
const nettoQ3 = Q3_25_NE / Q3_25_REV * 100;
const nettoQ225 = Q2_25_NE / Q2_25_REV * 100;
const jpmGsNe = Q2_26_NE / 6.628;              // tvillingförhållande net earnings Q2-26
const jpmGsRev = Q2_26_REV / 20.338;

// scenarioruta på TTM-intäktsbasen
const bas = Q3_25_REV + Q4_25_REV_MAN + Q1_26_REV + Q2_26_REV;   // 47,1+46,8+50,5+57,3
const basEbit = bas * EBITM;
const rutor = [bas * 0.97, bas, bas * 1.03], marg = [EBITM - 0.01, EBITM, EBITM + 0.01];
const cell = (r, m) => Math.round(r * m);
const marginalsteg = bas * 0.01;
const intaktssteg = bas * 0.03 * EBITM;
const viktKvot = intaktssteg / marginalsteg;
const marginalvikt = 1 / (3 * EBITM);
const multProg = PE / (1 + PROG);
const multTTM = MCAP / ttmNe;

// medianer/rang ur filen
const med = a => { a = a.filter(v => v != null).sort((x, y) => x - y); const m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const rang = (v, arr) => { const a = arr.filter(x => x != null).sort((x, y) => x - y); const i = a.findIndex(x => x >= v); return (i < 0 ? a.length : i + 1) + '/' + a.length; };
const fin = uni.filter(r => r.bransch === 'finans');
const pick = { pe: r => r.vardering?.pe, pb: r => r.vardering?.pb, roe: r => r.lonksamhet?.roe, ebit: r => r.lonksamhet?.ebitMarginal, netto: r => r.lonksamhet?.nettoMarginal, prog: r => r.tillvaxt?.prognosTillvaxt, ttm: r => r.tillvaxt?.omsattningTillvaxtTTM };
const M = {};
for (const k of Object.keys(pick)) {
  M[k] = {
    fm: med(fin.map(pick[k])), um: med(uni.map(pick[k])),
    rg: rang(pick[k](jpm), fin.map(pick[k])),
    nf: fin.map(pick[k]).filter(v => v != null).length, nu: uni.map(pick[k]).filter(v => v != null).length
  };
}

const body = `JPMorgan Chase — ticker JPM på New York Stock Exchange — redovisar tredje kvartalet 2026 tisdagen den **13 oktober**. Datumet är officiellt två gånger om: bolagens egen eventsida listar "Third-Quarter 2026 Earnings Conference Call Oct 13, 2026 8:30 AM ET", och kungörelsen om samtalet gick ut via nyhetsbyrå redan 17 september. Resultaten publiceras samma morgon — fjärde kvartalet 2025 släpptes cirka 06:45 amerikansk östtid — och samtalet 08:30 östtid strömmas som webcast via [investor relations-sidorna](https://www.jpmorganchase.com/ir/events). Det här är ett utbildningspaket i AK1A:s kvartalsrapportserie, och det fullbordar seriens enda tvillingdatum: Goldman Sachs-paketet läste den 13 oktober från den ena sidan av gatan — det här paketet läser samma dag från den andra, större sidan. Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

## Urvalet: varför JPMorgan är nästa paket i serien

Kvartalsrapportserien ger varje rapporterande bolag i universumet ett läspaket inför Q3 2026 — urval, nyckeltal, källkritik och övningar, allt byggt på den egna datainsamlingen. Urvalet följer seriens princip: tidigaste officiellt bekräftade rappdagen bland kalenderbolag med bärande data. Med 45 paket på disk gallrades bland kalenderbolag utan paket Prologis (tomma årsserier — datan måste bära) och Investment AB Investor (börsvärde null hos källan, rappdatum ej lyfta av bolaget självt). Kvar stod JPMorgan som tidigaste återstående officiellt bekräftade rappdag: den 13 oktober, utlyst med exakta klockslag, och sedan länge påpekad som tvillingdag. Bärande data finns på plats: dubbelkollad kurs, fulla multiplar och — för andra gången i bankfamiljen — en svit officiellt rapporterade kvartal att läsa direkt. Syskonen i omgången klaimade Fortum (28 oktober) och Carlsberg (29 oktober) — ingen kollision.

## Nyckeltalen att ha med sig — AKM2:s fyra dimensioner, tvillingdagsutgåva

Värdena nedan är senaste mätte tal ur bolagsuniversumets datainsamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom finansbranschen.

**Lönsamhet** — hur mycket värde skapas per insatt dollar?

- Avkastning på eget kapital (ROE): **${f1(ROE * 100)} procent** — [så räknas ROE](/dataset/finans/roe). För banker är ROE huvudmåttet, och JPMorgan ligger över finansgrenens median på ${f2(M.roe.fm * 100)} procent. Men bolaget själv redovisar med två mått: helåret 2025 gav ROE ${FY25_ROE} procent och ROTCE ${FY25_ROTCE} procent — avkastning på hela respektive rörligt eget kapital — och 2026 års kvartal bär ROTCE ${ROTCE_26} procent. Tre avkastningsbegrepp, tre fönster, samma bank: lär skillnaden innan talen jämförs.
- Avkastning på investerat kapital (ROIC): **osatt** — branschegenskap som i samtliga bankpaket: när insättningarna och finansieringen är verksamheten finns inget meningsfullt avgränsat investerat kapital. Universumet skriver null för finansbolag.
- Rörelsemarginal (EBIT): **${f2(EBITM * 100)} procent** och nettomarginal: **${f2(NETTO * 100)} procent** — [så läses nettomarginalen](/dataset/finans/netto-marginal). Universelltjänstbankens intäktsrad är av nettotyp — räntenetto plus avgifter — och marginalerna ligger i grenens eget span. Kvartalen bakom fälten: nettomarginalen var ${f1(nettoQ225)} procent i Q2 2025, ${f1(nettoQ3)} i Q3 2025, ${f1(nettoQ1man)} i Q1 2026 (mot rapporterad intäktsbas ${f2(nettoQ1rep)}) och ${f1(nettoQ2)} i Q2 2026 — universumfältets ${f2(NETTO * 100)} procent ligger mitt i raden.
- Fri kassaflödesavkastning: **osatt** — för banker är kassaflödet kärnverksamheten; universumet nullställer måttet med motivering.

**Tillväxt** — vilket håll går rörelsen?

- Intäktstillväxt senaste tolvmånadersperioden: källans fält anger **plus ${f0(TTMF * 100)} procent** — men — precis som i syskonpaketen håller inte det talet för en äkta TTM-läsning utan är kvartalsvärme; se Datavaktens femte test. [så läses TTM-tillväxten](/dataset/finans/omsattningstillvaxt-ttm)
- Universumets seriefält är tomma för JPMorgan — källan saknar resultaträkningshistorik, vilket redovisas öppet som lucka. Men bankfamiljens andra världspaket har en egen svit rapporterade kvartal: Q3 2025 net income ${f1(Q3_25_NE)} miljarder dollar, Q4 2025 ${f1(Q4_25_NE)} rapporterat, Q1 2026 ${f1(Q1_26_NE)} och Q2 2026 ${f1(Q2_26_NE)} — historiens största kvartalsvinst för en amerikansk bank, med vinst per aktie ${f2(Q2_26_EPS)} dollar. Helåret 2025: net income ${f1(FY25_NE)} miljarder, vinst per aktie ${f2(FY25_EPS)} dollar.
- Prognostillväxt (källans fältnamn): **plus ${f2(PROG * 100)} procent** — källans konsensussiffra för vinsttillväxt ett år framåt, ett pedagogiskt begrepp för samlad marknadsuppskattning: inte en sanning och inte vår skattning. [Om prognostillväxt](/dataset/finans/prognos-tillvaxt)

**Värdering** — vad kostar rörelsen på börsen?

- Pris per vinst (P/E): **${f3(PE)}** — [P/E inom finans](/dataset/finans/pe). Strax över finansgrenens median ${f3(M.pe.fm)} och betydligt under universumets ${f3(M.pe.um)}.
- Pris per bokfört eget kapital (P/B): **${f3(PB)}** — grenens median är ${f3(M.pb.fm)} — [så räknas P/B](/dataset/finans/pb)
- Enterprise value per rörelseresultat (EV/EBIT): **${f3(EV)}** — samma artefaktvarning som i samtliga bankpaket: räntebärande skulder är verksamheten, inte en avgränsningsbar finansieringsstock. Talet redovisas eftersom källan bär det, och läses bara som artefakt. [EV/EBIT inom finans](/dataset/finans/ev-ebit)
- Vid insamlingen var kursen **${f2(PRIS)} dollar** och börsvärdet **${f3(MCAP)} miljarder dollar** — seriens största paket på börsvärde, före Samsung och Johnson & Johnson, och mer än tre gånger tvillingen Goldman Sachs.
- PEG-talet: källan anger **${f2(PEGK)}** — och för andra amerikanska banken i raden ligger källans fält UNDER konventionen. Se Datavakten. [Värderingsöversikten](/dataset/finans/vardering)

**Stabilitet och ägaraktivitet** — hur belånat är huset, och vem köper?

- Skulder per eget kapital och räntetäckning: **osatta** — branschegenskaper enligt filens egen notering; balansstyrningen läses i kapitaltäckning och CET1-kvot, som rapportens balansräkningsavdelning bär. Balansräkningen själv är dokumenterad: ${f0(EK_2025)} miljarder dollar i eget kapital och 4,4 biljoner i tillgångar vid årsskiftet.
- Källans registrering av insiderköp senaste sex månader: **${INSIDER}** observationer — fler än något annat paket i serien hittills; tvillingen Goldman Sachs redovisade 7, de fyra nordiska bankpaketen samtliga noll.
- Återköp: aktietalet härleds ur vinst och vinst per aktie — ${f3(aktFY)} miljarder medelaktier under 2025, ${f3(aktQ2)} miljarder vid Q2 2026, och kursimplierat ${f3(aktNu)} miljarder vid insamlingen: en trappa nedåt med ${f1(aktMinskTotal)} procent sammanlagt. Det är därför vinsten per aktie växer snabbare än totalvinsten: nämnaren krymper.
- Utdelning: kvartalspaketen i serien redovisar utdelningspolicy där källan bär den; JPM-postens utdelningsfält är null och paketet lämnar måttet där — en lucka som säger sig själv, inte en bedömning.

## Datavakten — tajtaste identiteten, teckenväxlaren och bokvärdesdetektiven

Paketets bärande övning, med samma verktygslåda som i bankfamiljens sex tidigare paket: pröva källans tal mot identiteter och konventioner innan de används.

**Test 1 — identiteten P/E = P/B ÷ ROE, bankfamiljens tajtaste träff sedan Sverige.** Ta källans egna siffror: P/B ${f3(PB)} delat med ROE 0,1779 ger **${f3(idFram)}** — mot det redovisade P/E-talet ${f3(PE)}, en skillnad på ${f1(idFramGap)} procent. Vänd på steken: P/E ${f3(PE)} gånger ROE 0,1779 ger **${f3(idTill)}** — mot det redovisade P/B ${f3(PB)}, speglegapet ${f1(idTillGap)} procent. Trappan i quaderns bankfamilj: Swedbank höll på tre promille, JPMorgan ${f1(idFramGap)} procent, SEB fyra procent — och tvillingen Goldman Sachs gapade sex procent. Tvillingdagen levererar alltså både familiens vidaste och en av dess tajtaste identiteter — och skillnaden är lärorik: i GS-paketet pekade TTM-detektiven ut rekordkvartal som orsak; här pekar den på motsatsen, se nästa test.

**Test 2 — TTM-detektiven med fyra officiella ankare.** P/E-talets implicita vinstunderlag är börsvärdet delat med P/E: ${f1(MCAP)} ÷ ${f3(PE)} = **${f1(implicitPEvinst)} miljarder dollar**. ROE-fältets implicita underlag: bokfört kapital ${f1(ekFalt)} miljarder (börsvärdet ÷ P/B) gånger 0,1779 = **${f1(implicitROEvinst)} miljarder**. Och bokföringen? Fyra rapporterade kvartal finns: Q3 2025 net income ${Q3_25_NE} miljarder, Q4 2025 ${Q4_25_NE} rapporterat (cirka 14,7 utan kvartalets engångspost), Q1 2026 ${Q1_26_NE} och Q2 2026 ${Q2_26_NE} — summerat en rullande tolvmånadersvinst på **${f1(ttmNe)} miljarder dollar**, eller ${f1(ttmNeEx)} med Q4 utan engångsposten. Helåret 2025 bokförde ${f1(FY25_NE)} miljarder. Lägg de fyra vittnena på rad: bokförd ${f1(FY25_NE)}, ROE-fältets implicita ${f1(implicitROEvinst)}, P/E-fältets implicita ${f1(implicitPEvinst)}, rullande ${f1(ttmNe)}. Fältens underlag ligger mittemellan ankaren — och närmare det rullande än vad tvillingens gjorde: fönstret har hunnit mer än halvt ikapp rekordkvartalen. Notera också balansräkningens eget vittne: det egna kapitalet var ${EK_2025} miljarder vid årsskiftet mot fältvägens ${f1(ekFalt)} — ${f1(ekBalansGap)} procent, bokföringen växer sig ur fältens fönster i realtid.

**Test 3 — absolutkontrollen, och teckenväxlarens smalare gap.** P/E gånger bokförd årsvinst: ${f3(PE)} × ${f1(FY25_NE)} = **${f1(absFY)} miljarder dollar** mot börsvärdet ${f1(MCAP)} — residualen **plus ${f1(resFY)} procent**. Kör samma kontroll mot den rullande vinsten: ${f3(PE)} × ${f1(ttmNe)} = **${f1(absTTM)} miljarder** — residualen **minus ${f1(Math.abs(resTTM))} procent**. Residualen byter tecken när nämnaren byter fönster — teckenväxlaren igen, men med smalare gap än tvillingens (som vände på +10,0 mot −9,6): JPMorgans fält-vinst ligger närmare det rullande underlaget, så avståndet mellan fönstren är kortare. Slutsatsen oförändrad: värderingen beror på nämnaren, inte bara på kursen.

**Test 4 — PEG-konventionen, sjätte rakbladet, andra nedåt.** Källan anger PEG till ${f2(PEGK)}. Konventionen är P/E delat med tillväxttalet i procentenheter: ${f3(PE)} delat med ${f2(PROG * 100)} ger **${f2(pegKonv)}**. Bankfamiljens tabell: fyra nordiska paket fann källans PEG-fält ÖVER konventionen (Nordea 8,87 mot 2,19, Handelsbanken 18,54 mot 2,33, Swedbank 6,99 mot 1,57, SEB 2,12 mot 1,27) — sedan bröt Goldman Sachs mönstret nedåt (1,24 mot 3,31), och JPMorgan följer efter: ${f2(PEGK)} mot ${f2(pegKonv)}, en faktor ${f2(pegFaktor)}. Den implicita tillväxten i källans PEG — ${f3(PE)} ÷ ${f2(PEGK)} = ${f2(pegImplTillv)} procent — matchar inget tillväxtfält i filen (varken konsensusfältets ${f2(PROG * 100)} eller tillväxtfältets ${f0(TTMF * 100)}). Sex banker, sex fall: en multipel ur en källa är ett påstående tills den prövats. Här används PEG-värdet ${f2(pegKonv)} som räknestorhet — inte som skattning.

**Test 5 — tillväxtfältet mot kvartalen, och bokvärdesdetektiven.** Källans TTM-fält säger plus ${f1(TTMF * 100)} procent. Räkna i stället på rapporterade kvartal: Q2 2026 års jämförelse i vinst är ${f1(Q2_26_NE)} mot ${f1(Q2_25_NE)} miljarder — plus ${f0(yoyQ2ne)} procent — och i vinst per aktie ${f2(Q2_26_EPS)} mot ${f2(Q2_25_EPS)} — plus ${f0(yoyQ2eps)} procent (Q1: ${f2(Q1_26_EPS)} mot ${f2(Q1_25_EPS)}, plus ${f0(yoyQ1eps)}). Fältets värde ligger närmast kvartalsjämförelserna än något rullande heltårsfönster — kvartalsvärme, inte årstakt, exakt som tvillingen. Sedan paketets eget tillägg, bokvärdesdetektiven: priset ${f2(PRIS)} delat med rapporterat bokvärde per aktie ${f2(BVPS_Q425)} (Q4 2025) ger P/B **${f3(pbMotBVPS)}** — men källans fält säger ${f3(PB)}. Vänd det: fältets implicita bokvärde per aktie är ${f2(PRIS)} ÷ ${f3(PB)} = **${f1(bvpImpl)} dollar** — ${f1(bvpSteg)} procent över det rapporterade. Förklaringen är inte mystik utan fönster: bokvärdet växer (kvartalsrapporten räknar upp ${BVPS_TIDIGARE[0].toLocaleString('sv-SE')} och ${BVPS_TIDIGARE[1].toLocaleString('sv-SE')} som tidigare referenspunkter, årssteget ${f1(bvpsAr)} procent), och källans fält har rullat in i 2026 års böcker. Ett P/B-fält är en hastighetsmätare på ett tåg som ökar farten — läs vilket år mätningen gjordes.

## Så står sig bolaget mot branschen

Finansgrenen i universumfilen mäter ${fin.length} bolag — de fyra nordiska storbankerna, investmentbolagen, försäkrare och globala namn som Berkshire Hathaway, Visa, Mastercard och Royal Bank of Canada. Medianerna nedan är omräknade 2026-09-18 ur filens aktuella poster, kolumnvis där tal finns; notera att grenen växt sedan GS-paketet räknade (då 19 bolag — Goldman Sachs egen post tillkom i filen efteråt, och medianen rörde sig).

| Nyckeltal | JPMorgan | Median finans (${fin.length} bolag) | Median universumet | Rang i grenen |
|---|---|---|---|---|
| P/E | ${f3(PE)} | ${f3(M.pe.fm)} | ${f3(M.pe.um)} | ${M.pe.rg} |
| P/B | ${f3(PB)} | ${f3(M.pb.fm)} | ${f3(M.pb.um)} | ${M.pb.rg} |
| Räntabilitet på eget kapital (ROE) | ${f1(ROE * 100)} % | ${f2(M.roe.fm * 100)} % | ${f2(M.roe.um * 100)} % | ${M.roe.rg} |
| Rörelsemarginal (EBIT) | ${f2(EBITM * 100)} % | ${f2(M.ebit.fm * 100)} % | ${f2(M.ebit.um * 100)} % | ${M.ebit.rg} |
| Nettomarginal | ${f2(NETTO * 100)} % | ${f2(M.netto.fm * 100)} % | ${f2(M.netto.um * 100)} % | ${M.netto.rg} |
| Prognostillväxt (konsensus) | ${f2(PROG * 100)} % | ${f2(M.prog.fm * 100)} % | ${f2(M.prog.um * 100)} % | ${M.prog.rg} |
| TTM-tillväxt (källans fält) | ${f0(TTMF * 100)} % | ${f2(M.ttm.fm * 100)} % | ${f2(M.ttm.um * 100)} % | ${M.ttm.rg} |

Läsningen — medianbanken med extrema ändpunkter: på värderingen är JPMorgan i princip exakt medianbanken (P/E och P/B båda rang ${M.pe.rg.split('/')[0]} av ${M.pe.rg.split('/')[1]}), på avkastningen strax över medianen (ROE ${M.roe.rg}), på marginalerna vid medianen. Det som inte är median alls är rörelsens ändpunkter, och de pekar åt varsitt håll: källans tillväxtfält ${f0(TTMF * 100)} procent är grenens tredje högsta (${M.ttm.rg}), medan konsensusfältets ${f2(PROG * 100)} procent är grenens tredje lägsta (${M.prog.rg}). Kvoten mellan historia och uppskattning — ${f1(gapKvot)} gånger — är seriens största bland bankerna och slår tvillingens 9,1: samma dag, samma mönster, världens två största investmentbanksvolymer. Tvillingläsningen fullbordas: Goldman Sachs bär i samma datainsamling P/E 15,479 och P/B 2,774 vid ROE 16,9 procent — JPMorgan något högre avkastning, något lägre multiplar, spegelstegen igen. I rapporterade kvartal är JPMorgan den större tvillingen: Q2 2026 net income ${f1(Q2_26_NE)} mot ${f1(6.628)} miljarder (${f1(jpmGsNe)} gånger) och intäkter ${f1(Q2_26_REV)} mot 20,3 (${f1(jpmGsRev)} gånger) — men vinst per aktie 7,71 mot 20,98 dollar, för att aktietalet är nio gånger större. Jämförelsen mot samtliga kollegor finns i [universumjämförelsen](/dataset/finans/universumjamforelse), och bolagets sida i biblioteket finns [här](/bolag/jpm).

## Tre sätt att läsa utfallet — övningar i metod

Tre övningar i vad en rapportläsare vanligtvis tittar på för en världsbank — träning i metod och ren aritmetik, aldrig bedömningar av den 13 oktober.

**Övning A — läs rekordet, sedan engångsposten.** Q2 2026: net income ${f1(Q2_26_NE)} miljarder dollar — historiens största kvartalsvinst för en amerikansk bank — men rapporten bär samtidigt en engångspost: en vinst på ${f1(VISA)} miljarder dollar på Visa-aktierna. Räkna båda läsningarna: med posten ${f1(Q2_26_NE)} miljarder, utan den ${f1(Q2_26_NE - VISA)} — och notera att en källa redovisar kvartalet som 16,9 miljarder vid EPS 6,14, samma kvartal på justerad bas: rekordet är en sanningsfråga om fönster. Övningen när rapporten ligger framför dig: identifiera engångsposterna innan årsjämförelsen räknas, och skilj på hur fort bolaget växer och hur länge kvartal av denna storlek fortsätter att vara jämförelsetal. Baseffekten är aritmetik: när Q2 2027 jämförs mot Q2 2026 blir även ett starkt kvartal ett lägre tal i procent. Konsensusfältets ${f2(PROG * 100)} procent är marknadens samlade uppskattning av nästa års vinsttillväxt — ett begrepp att förstå, inte en måttstock att döma utfallet med, och skillnaden mellan utfall och uppskattning är ett pedagogiskt verktyg, aldrig en handssignal.

**Övning B — scenariorutan i ren aritmetik.** Universumets seriefält är tomma, men kvartalen ger en räknebas: de fyra senaste rapporterade kvartalens intäkter — ${f1(Q3_25_REV)}, ${f1(Q4_25_REV_MAN)}, ${f1(Q1_26_REV)} och ${f1(Q2_26_REV)} miljoner dollar på de baser källorna anger (managed där källan ger managed, rapporterad annars — en dokumenterad blandbas, inte en redovisningspost) — summerar till ${f1(bas)} miljoner dollar rullande. Universumets rörelsemarginal ${f2(EBITM * 100)} procent ger ett rörelseresultat på cirka ${f0(basEbit)} miljoner dollar. Med tre hypotetiska intäktsnivåer (±3 procent) och tre marginaler (±1 procentenhet) blir rutan, i miljoner dollar:

| Rörelseresultat, miljoner dollar | Marginal ${f2((EBITM - 0.01) * 100)} % | Marginal ${f2(EBITM * 100)} % | Marginal ${f2((EBITM + 0.01) * 100)} % |
|---|---|---|---|
| Intäkter ${f1(rutor[0])} | ${f0(cell(rutor[0], marg[0]))} | ${f0(cell(rutor[0], marg[1]))} | ${f0(cell(rutor[0], marg[2]))} |
| Intäkter ${f1(rutor[1])} | ${f0(cell(rutor[1], marg[0]))} | ${f0(cell(rutor[1], marg[1]))} | ${f0(cell(rutor[1], marg[2]))} |
| Intäkter ${f1(rutor[2])} | ${f0(cell(rutor[2], marg[0]))} | ${f0(cell(rutor[2], marg[1]))} | ${f0(cell(rutor[2], marg[2]))} |

Två räknesatser: en procentenhet marginal flyttar resultatet med cirka ${f1(marginalsteg)} miljoner dollar vid oförändrade intäkter, medan tre procent mer intäkter vid oförändrad marginal flyttar det med cirka ${f1(intaktssteg)} miljoner — intäktsratten väger cirka ${f1(viktKvot)} gånger tyngst. Marginalvikten, seriens mått på känslighetsbalansen, blir 1 ÷ (3 × 0,5039) = **${f2(marginalvikt)}** — strax över bankfamiljens nordiska spann 0,5–0,6 och under tvillingens 0,79: en balanserad bankkropp där intäkter och marginaler väger nästan lika, och där båda ändå väger lätt än i industrin. Alla nio celler är aritmetik på kvartalens bas och universumets marginalfält — inga skattningar.

**Övning C — multipelövningen med tre nämnare.** Ren räkneövning med källans egna tal: P/E ${f3(PE)} delat med 1,0328 (konsensustalet för vinsttillväxt, använt som räknestorhet, inte som skattning) blir **${f2(multProg)}** — om vinsten rör sig i den takten och kursen står stilla, sjunker P/E under finansmedianen ${f3(M.pe.fm)}. Teckenväxlarens andra sida: börsvärdet delat med den rullande vinsten från Datavaktens test 2 — ${f1(MCAP)} miljarder mot ${f1(ttmNe)} miljarder — ger **${f1(multTTM)}**. Samma bank, samma kurs, tre multipeler — ${f3(PE)} i källans fönster, ${f2(multProg)} i konsensusfönstret, ${f1(multTTM)} i kvartalsfönstret. Det är multipelns dubbla natur, nu i trippel: via kursen, via vinsten — och via vilket vinstfönster läsaren räknar på.

## Praktiskt inför 13 oktober

- Rapportdagen tisdagen 13 oktober 2026 är officiell: [bolagets eventsida](https://www.jpmorganchase.com/ir/events) listar samtalet kl 08:30 amerikansk östtid — svensk tid 14:30 samma dag under sommartid — och resultaten publiceras på morgonen enligt samma mönster som tidigare kvartal (cirka 06:45 östtid, 12:45 svensk tid). Kungörelsen om samtalet gick ut via nyhetsbyrå den 17 september — kalenderfakta att lita på, i klass med tvillingens ett år långa utlysning.
- En valuta hela vägen: amerikansk redovisning i dollar, amerikansk notering i dollar — samma renhet som tvillingen, och motsatsen Nordea, där euro-tal mötte kronor-kurs. Tvillingdagen är därmed den renaste kontrollgrunden i serien: två banker, en börs, en valuta, samma datainsamlingsdatum.
- Insiderköpens ${INSIDER} observationer och aktietalstrappan ${f3(aktFY)} → ${f3(aktQ4)} → ${f3(aktQ2)} → ${f3(aktNu)} miljarder är ägaraktivitet rapporten inte ropar om — men vinst per aktie bär den. Övningen: räkna nämnaren för hand när rapporten ligger framme.
- Tre avkastningsbegrepp att hålla isär i rapporten: ROE (hela egna kapitalet), ROTCE (rörligt eget kapital) och universumfältets rullande ROE — helåret 2025 gav 17 respektive 20 procent, 2026 års kvartal ROTCE 23, och fältet ${f1(ROE * 100)} mitt emellan. Fråga alltid vilket fönster ett avkastningstal mäter.
- Vågvalideringsnot: JPMorgan står inte i seriens vågvalideringskarta (de tolv universumbolag som kartades i våg 152) — paketet vilar på universumdata och kalenderfakta enligt Iberdrola-precedensen, och säger det öppet.
- Ordlista för alla begrepp finns i [kurserna](/kurser) — bankdelen går igenom räntenetto, kreditförluster och kapitaltäckning, och börspsykologidelen går igenom konsensusbegreppet. Metodtransparensen finns på [transparensidan](/transparens) och [källsidan](/kallor).
- Efter rapporten uppdateras bolagsuniversumets nyckeltal vid nästa insamling, aspektsidorna speglar nya medianer — och med tvillingdagen fullbordad läser serien vidare bland grenens återstående rappdagar.

## Källor

- Rappdag 2026-10-13 (resultat på morgonen, konferenssamtal 08:30 ET som webcast): JPMorganChase eventsida — "Third-Quarter 2026 Earnings Conference Call Oct 13, 2026 8:30 AM ET" — och bolagets kungörelse via nyhetsbyrå 2026-09-17, båda live-verifierade 2026-09-18; publiceringstid cirka 06:45 ET enligt fjärde kvartalets kungörelsemönster — internt underlag: data/blogg-utkast/kvartal/2026-q3/kalender-finans.json (hämtat 2026-09-15).
- Nyckeltal, kurser, börsvärde och fältvärden: bolagsuniversumets datainsamling för JPM 2026-09-03 (Yahoo Finance quoteSummary-moduler; källa B, MarketStack, dubbelkoll av pris och valuation med slutkurs 2026-09-02 — bankfamiljens andra paket med dubbelkollad kurs, efter tvillingen) — internt: data/portfolj-system/bolagsunivers.json. Medianer och rangplatser omräknade 2026-09-18 ur samma fil (${uni.length} poster; finansgrenen ${fin.length} bolag, universummedianerna ${M.pe.nu}–${uni.length} poster per mått, kolumnvis där tal finns).
- Rapporterade kvartalssiffror: JPMorgan Chase resultatmeddelanden — Q2 2026 (net income 21,2 miljarder dollar, EPS 7,71, intäkter 57,3 miljarder rapporterat, inklusive 4,6 miljarder engångsvinst på Visa-innehavet; en källa redovisar justerat 16,9/6,14 — källdivergensen dokumenteras), Q1 2026 (16,5 / EPS 5,94, intäkter 50,5 managed, ROTCE 23 procent; Q1 2025 EPS 5,08), helåret 2025 (57,0 / EPS 20,02, ROE 17, ROTCE 20, bokvärde per aktie 126,99, eget kapital 362 miljarder, tillgångar 4,4 biljoner), Q4 2025 (rapporterat cirka 13,0 / EPS 4,63 med engångspost, justerat EPS 5,23 och cirka 14,7 utan; intäkter 45,8 rapporterat / 46,8 managed), Q3 2025 (14,4 / EPS 5,07, intäkter 47,1 managed) och Q2 2025 (15,0 / EPS cirka 5,25, intäkter 45,7, räntenetto 23,3) — samtliga hämtade via bolagets pressrum och SEC-filingar, sökverifierade 2026-09-18.
- Datavaktens fem test: egna beräkningar — identiteten (${f3(PB)} ÷ 0,1779 = ${f3(idFram)} mot ${f3(PE)}, ${f1(idFramGap)} procent; omvänt ${f3(PE)} × 0,1779 = ${f3(idTill)} mot ${f3(PB)}, ${f1(idTillGap)} procent), TTM-detektiven (implicita underlag ${f1(implicitPEvinst)} och ${f1(implicitROEvinst)} miljarder mot bokförda ${f1(FY25_NE)} och rullande ${f1(ttmNe)}; balansräkningens 362 mot fältvägens ${f1(ekFalt)} = ${f1(ekBalansGap)} procent), absolutkontrollen i två fönster (${f3(PE)} × ${f1(FY25_NE)} = ${f1(absFY)} mot ${f1(MCAP)} = plus ${f1(resFY)} procent; × ${f1(ttmNe)} = ${f1(absTTM)} = minus ${f1(Math.abs(resTTM))} procent), PEG-konventionen (${f3(PE)} ÷ ${f2(PROG * 100)} = ${f2(pegKonv)} mot källans ${f2(PEGK)}; implicit tillväxt ${f2(pegImplTillv)} procent) och tillväxtfältsprövningen med bokvärdesdetektiven (kvartalsjämförelser plus ${f0(yoyQ2ne)} och ${f0(yoyQ2eps)} procent; fältimplierat bokvärde ${f1(bvpImpl)} dollar mot rapporterat 126,99 = ${f1(bvpSteg)} procent) — samtliga steg redovisade i texten.
- Scenarioruta, räknesatser och multipelövningar: aritmetik på den rullande intäktsbasen ${f1(bas)} miljoner dollar (fyra rapporterade kvartal, dokumenterad blandbas) med rörelsemarginal ${f2(EBITM * 100)} procent ur universumfältet; samtliga nio celler och båda räknesatserna dubbeltkontrollerade vid tillverkningen 2026-09-18.

*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar eller bolagets egna resultatmeddelanden med källa och datum angivna; där en källa saknar data står det explicit, och där ett källfält håller inte för kontrollräkning redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

const paket = {
  slug: 'sa-laser-du-jpmorgan-q3-2026',
  title: 'JPMorgan Q3-rapport 2026: så läser du den — tvillingdagen fullbordas: rekordvinstens bank med seriens tajtaste bankidentitet och största konsensusgap',
  description: 'JPMorgan Chase redovisar tredje kvartalet 2026 tisdagen den 13 oktober — samma dag som Goldman Sachs, och med historiens största amerikanska bankkvartal i bakspåret. Läspaketet: nyckeltalen mot finansgrenens medianer, identitetstestets tajtaste träff i bankfamiljen, teckenväxlaren i två fönster, bokvärdesdetektiven och konsensusgapet på 9,3 gånger. Scenariorutan är ren aritmetik i dollar, och varje siffra har sin källa.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-13',
  readingMinutes: 5,
  tags: ['kvartalsrapport', 'JPMorgan', 'finans', 'bankaktier', 'nyckeltal', 'läspaket'],
  body
};
fs.writeFileSync(UT, JSON.stringify(paket, null, 2) + '\n');
const ord = body.replace(/\|/g, ' ').replace(/[#*[\]()>/-]/g, ' ').split(/\s+/).filter(Boolean).length;
console.log('skrev', UT, '| ord:', ord, '| readingMinutes borde vara', Math.round(ord / 600));
console.log('kontroll: idFram', f3(idFram), 'absFY', f1(absFY), 'resFY', f1(resFY), 'absTTM', f1(absTTM), 'resTTM', f1(resTTM), 'TTM', f1(ttmNe), 'PEGkonv', f2(pegKonv), 'scenbas', f1(bas), 'vikt', f2(marginalvikt));
