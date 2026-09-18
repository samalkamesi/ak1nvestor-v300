// Bygger GS Q3-läspaketet — kvartalsrapportseriens 40:e, finansgrenens femte.
// Alla bärande tal motorräknas här och trädas in i texten, så KVD:n
// (verktyg/_s4u2-gs-kvd.mjs) kan validera dem oberoende.
import fs from 'node:fs';

const UTDATA = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-goldman-sachs-q3-2026.json';

// — universumposten (bolagsunivers.json, hämtad 2026-09-03) —
const GS = { pe: 15.479, pb: 2.774, evEbit: 2.061, peg: 1.24,
  roe: 0.169, brutto: 0.8208, ebit: 0.4218, netto: 0.3104,
  ttm: 0.425, prognos: 0.0468, insider: 7,
  pris: 1004.42, mcap: 292.458 }; // mdr USD

// — officiella rapporterade tal (GS pressroom/SEC 8-K, sök-/läsverifierade 2026-09-18) —
const Q1_26 = { rev: 17227, ne: 5630, eps: 17.55 };        // 2026-04-13
const Q2_26 = { rev: 20338, ne: 6628, eps: 20.98, roe: 23.5 }; // 2026-07-14
const H1_26_rev = 37565;                                    // rapporterat
const FY25 = { rev: 58280, ne: 17180, eps: 51.32, roe: 15.0 };// 2026-01-15
const Q4_25 = { rev: 13450, ne: 4620, eps: 14.01, roe: 16.0 };
const Q2_25 = { rev: 14580, ne: 3720 };                     // 2025-07-16
const Q3_25 = { eps: 12.25, roe: 14.2 };                    // 2025-10-14 (rubrik-tal)

// — härledda tal (metod redovisas i texten) —
const aktierFY25 = FY25.ne / FY25.eps;          // 334,76 M
const aktierQ2 = Q2_26.ne / Q2_26.eps;          // 315,92 M
const aktierQ1 = Q1_26.ne / Q1_26.eps;          // 320,80 M
const aktierQ3_25 = 328;                        // interpolerat, redovisas som härledning
const q3_25_ne = Q3_25.eps * aktierQ3_25;       // ~4 018 M
const q1_25_ne = FY25.ne - Q2_25.ne - q3_25_ne - Q4_25.ne; // restpost ~4 782 M
const ttmNe = q3_25_ne + Q4_25.ne + Q1_26.ne + Q2_26.ne;   // ~20,9 mdr
const q1_25_rev = Q1_26.rev / 1.14;             // ur "+14 % YoY" i Q1-rapporten
const q3_25_rev = FY25.rev - q1_25_rev - Q2_25.rev - Q4_25.rev;
const ttmRev = q3_25_rev + Q4_25.rev + Q1_26.rev + Q2_26.rev;
const h1_26_ne = Q1_26.ne + Q2_26.ne;

// — datavaktens test —
const idFram = GS.pb / GS.roe;                  // 16,41
const idGap = (idFram - GS.pe) / GS.pe;         // +6,0 %
const idTillbaka = GS.pe * GS.roe;              // 2,616
const idGap2 = (GS.pb - idTillbaka) / GS.pb;    // −5,7 %
const implicitPE = GS.mcap / GS.pe;             // 18,90 mdr
const ek = GS.mcap / GS.pb;                     // 105,41 mdr
const implicitROE = GS.roe * ek;                // 17,82 mdr
const absFY = GS.pe * FY25.ne / 1000;           // 265,9 mdr
const absFYres = (GS.mcap - absFY) / absFY;     // +10,0 %
const absTTM = GS.pe * ttmNe / 1000;            // 323,5 mdr
const absTTMres = (GS.mcap - absTTM) / absTTM;  // −9,7 %
const pegKonv = GS.pe / (GS.prognos * 100);     // 3,31
const pegImplicit = GS.pe / GS.peg;             // 12,48 % tillväxt
const yoyQ2 = Q2_26.rev / Q2_25.rev - 1;        // +39,5 %
const mNetFY = FY25.ne / FY25.rev;              // 29,5 %
const mNetQ1 = Q1_26.ne / Q1_26.rev;            // 32,7 %
const mNetQ2 = Q2_26.ne / Q2_26.rev;            // 32,6 %
const mNetH1 = h1_26_ne / H1_26_rev;            // 32,6 %

// — scenarioruta på FY2025-basen —
const bas = FY25.rev, m0 = GS.ebit;
const dInt = bas * 0.03;
const rutor = [bas - dInt, bas, bas + dInt];
const marg = [m0 - 0.01, m0, m0 + 0.01];
const cell = (r, m) => Math.round(r * m);
const margSteg = bas * 0.01;                    // 1 pp marginal
const intSteg = dInt * m0;                      // 3 % intäkter
const viktKvot = intSteg / margSteg;            // ~1,27
const marginalvikt = 1 / (3 * m0);              // 0,79

// — multiplövningar —
const multProg = GS.pe / (1 + GS.prognos);      // 14,79
const multTTM = GS.mcap * 1000 / ttmNe;         // ~14,0

// — medianer/rang (omräknade 2026-09-18 ur 177-postfilen) —
const MED = { pe: 15.269, pb: 2.678, roe: 0.1534, ebit: 0.47895, netto: 0.3519,
  prog: 0.09495, ttm: 0.100 };
const RANG = { pe: '11/19', pb: '12/19', roe: '13/19', ebit: '7/18', netto: '7/19',
  prog: '4/16', ttm: '18/19' };
const U_MED = { pe: 21.153, pb: 2.8065, roe: 0.1534, ebit: 0.21165, netto: 0.1409 };

// svensk talformattering: komma decimal, mellanslag tusentals
const f = (x, d = 3) => x.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d });
const f0 = (x) => Math.round(x).toLocaleString('sv-SE');
const pct = (x, d = 1) => (x * 100).toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d });

const body = `The Goldman Sachs Group — ticker GS på New York Stock Exchange — redovisar tredje kvartalet 2026 tisdagen den **13 oktober**. Datumet är officiellt och lyftes ut av bolaget själv mer än ett år i förväg: i sin pressrumsnotis om konferenssamtal för 2026 års resultatupplysningar anger Goldman Sachs ordalydelsen "Third quarter 2026 – Tuesday, October 13, 2026", med pressrelease cirka 07:30 amerikansk östtid och konferenssamtal 09:30 som öppen webcast. Det är alltid [bolagets egen sida för rapportdatum](https://www.goldmansachs.com/pressroom/press-releases/2025/conference-call-dates-to-announce-4q25-and-2026-earnings-results) som gäller. Det här är ett utbildningspaket i AK1A:s kvartalsrapportserie, och det är seriens femte bankpaket — men det första utanför Norden: efter Nordea, Handelsbanken, Swedbank och SEB öppnar paketet världsbanksepoken med bankfamiljens största börsvärde. Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

## Urvalet: varför Goldman Sachs är nästa paket i serien

Kvartalsrapportserien ger varje rapporterande bolag i universumet ett läspaket inför Q3 2026 — urval, nyckeltal, källkritik och övningar, allt byggt på den egna datainsamlingen. Urvalet följer seriens två principer tillsammans: gren-precedens (bankspåret har kört de fyra nordiska storbankerna i följd) och regeln tidigaste officiellt bekräftade rappdagen bland kalenderbolag med bärande universumdata.

Dagens konkurrenter om platsen sorterades enligt seriens precedenser. Bland kalenderbolag utan paket är LVMH tidigast i oktober — men kalenderns notis är ett månadsfönster utan offentliggjord dag, och osäkra datum förlorar mot officiella (Wihlborgs-precedensen). Investment AB Öresund har kalenderns tidigaste konkreta dag bland de icke levererade, 9 oktober, men MFN-kalendern markerar tiden som estimerad tills bolaget bekräftar — samma osäkerhetsgrad, och med ett serieunderlag hos källan som i praktiken är tomt. Goldman Sachs vinner dagen på det starkaste kalenderunderlag som finns i hela serien: bolaget har lyft ut samtliga fyra rappdatum för 2026 i pressrummet sedan augusti 2025, och två är redan infriade: Q1 den 13 april och Q2 den 14 juli. Bärande universumdata finns på plats: fulla multiplar och lönsamhetsmått i datainsamlingen. Kalenderns 13 oktober är dessutom seriens enda banktvillingdatum: JPMorgan Chase redovisar samma dag, och detta paket läser tvillingens tal som jämförelsepunkter där källan bär dem.

## Nyckeltalen att ha med sig — AKM2:s fyra dimensioner, världsbanksutgåva

Värdena nedan är senaste mätte tal ur bolagsuniversumets datainsamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom finansbranschen.

**Lönsamhet** — hur mycket värde skapas per insatt dollar?

- Avkastning på eget kapital (ROE): **${pct(GS.roe, 1)} procent** — [så räknas ROE](/dataset/finans/roe). För banker är ROE huvudmåttet, och Goldman Sachs ligger över finansgrenens median på 15,34 procent. Men fältet mäter ett rullande fönster — och bolagets egna rapporter visar spänningen i talet: helåret 2025 redovisades ROE 15,0 procent, medan andra kvartalet 2026 redovisade 23,5 procent annualiserat. Samma bolag, två hastigheter.
- Avkastning på investerat kapital (ROIC): **osatt** — branschegenskap, som i syskonpaketen: när insättningarna och finansieringen är verksamheten finns inget meningsfullt avgränsat investerat kapital. Universumet skriver null för finansbolag.
- Rörelsemarginal (EBIT): **${pct(GS.ebit, 2)} procent** och nettomarginal: **${pct(GS.netto, 2)} procent** — [så läses nettomarginalen](/dataset/finans/netto-marginal). Båda ligger under finansgrenens medianer — en investmentbanks intäktsrad domineras av rörelseintäkter som betalar löner och bonusar före resultatet, till skillnad från universelltjänstbankernas räntenetto-liknande nettotyper. Källans bruttomarginal anges till 82,08 procent.
- Fri kassaflödesavkastning: **osatt** — för banker är kassaflödet kärnverksamheten; universumet nullställer måttet med motivering.

**Tillväxt** — vilket håll går rörelsen?

- Intäktstillväxt senaste tolvmånadersperioden: källans fält anger **plus ${f0(GS.ttm * 100)} procent** — men det talet håller inte för en äkta TTM-läsning; se Datavakten, där fältet prövas mot bolagets egna kvartal och visar sig ligga närmast senaste kvartalets årsjämförelse. [så läses TTM-tillväxten](/dataset/finans/omsattningstillvaxt-ttm)
- Universumets seriefält är tomma för Goldman Sachs — källan saknar resultaträkningshistorik, vilket redovisas öppet som lucka. Men för första gången i bankfamiljen finns bolagets egna rapporterade kvartal att läsa direkt: net revenues 17 227 miljoner dollar och net earnings 5 630 miljoner i Q1 2026, sedan 20 338 respektive 6 628 miljoner i Q2 — historiens två högsta kvartal, det andra med vinst per aktie på 20,98 dollar. Helåret 2025: net revenues 58 280 miljoner dollar, net earnings 17 180 miljoner, vinst per aktie 51,32 dollar, ROE 15,0 procent.
- Prognostillväxt (källans fältnamn): **plus ${pct(GS.prognos, 2)} procent** — källans konsensussiffra för vinsttillväxt ett år framåt, ett pedagogiskt begrepp för samlad marknadsuppskattning: inte en sanning och inte vår skattning. [Om prognostillväxt](/dataset/finans/prognos-tillvaxt)

**Värdering** — vad kostar rörelsen på börsen?

- Pris per vinst (P/E): **${f(GS.pe)}** — [P/E inom finans](/dataset/finans/pe). Strax över finansgrenens median 15,269 och betydligt under universumets 21,153.
- Pris per bokfört eget kapital (P/B): **${f(GS.pb)}** — grenens median är 2,678 — [så räknas P/B](/dataset/finans/pb)
- Enterprise value per rörelseresultat (EV/EBIT): **${f(GS.evEbit)}** — ett mått utan bärkraft för banker, som syskonpaketen visat: räntebärande skulder är verksamheten, inte en avgränsningsbar finansieringsstock. Talet redovisas eftersom källan bär det, och läses bara som artefakt. [EV/EBIT inom finans](/dataset/finans/ev-ebit)
- Vid insamlingen var kursen **1 004,42 dollar** och börsvärdet **cirka 292 miljarder dollar** — bankfamiljens första paket över hundra miljarder dollar, seriens tredje största på börsvärde efter Samsung-paketet och Johnson & Johnson.
- PEG-talet: källan anger **${f(GS.peg, 2)}** — och för första gången i bankfamiljen ligger källans fält UNDER konventionens värde. Se Datavakten. [Värderingsöversikten](/dataset/finans/vardering)

**Stabilitet och ägaraktivitet** — hur belånat är huset, och vem köper?

- Skulder per eget kapital och räntetäckning: **osatta** — branschegenskaper enligt filens egen notering; bankens kapitalstyrning läses i kapitaltäckning och CET1-kvot, som står i rapportens balansräkningsavdelning.
- Källans registrering av insiderköp senaste sex månader: **${GS.insider}** observationer — bankfamiljens första paket med insiderköp på räkning; syskonpaketen redovisade samtliga noll.
- Återköp: källans återköpsfält är null för belopp, men nämnaren avslöjar arbetet — aktietalet härles ur vinst och vinst per aktie till omkring 334,8 miljoner aktier i genomsnitt under 2025 och 315,9 miljoner vid Q2 2026, en minskning på ${pct(1 - aktierQ2 / aktierFY25, 1)} procent på drygt ett halvår av återköp. Det är därför vinsten per aktie växer snabbare än totalvinsten: nämnaren krymper.

## Datavakten — teckenväxlaren, konsensusgapet och femte rakbladet

Paketets bärande övning, med samma verktygslåda som i de fyra föregående bankpaketen: pröva källans tal mot identiteter och konventioner innan de används.

**Test 1 — identiteten P/E = P/B ÷ ROE.** Ta källans egna siffror: P/B ${f(GS.pb)} delat med ROE 0,169 ger **${f(idFram)}** — mot det redovisade P/E-talet ${f(GS.pe)}, en skillnad på ${pct(idGap, 1)} procent. Vänd på steken: P/E ${f(GS.pe)} gånger ROE 0,169 ger **${f(idTillbaka)}** — mot det redovisade P/B ${f(GS.pb)}, samma gap spegelvänt, ${pct(-idGap2, 1)} procent. I quaderns trappa håll tätare ju nordiskare banken är (Handelsbanken höll, Swedbank tre promille, SEB fyra procent) — världsbanken öppnar med seriens vidaste bankgap: sex procent båda vägrarna. TTM-detektiven pekar ut var skon trycker, och här finns för en gångs skull två officiella ankare att arbeta mot.

**Test 2 — TTM-detektiven med två officiella ankare.** P/E-talets implicita vinstunderlag är börsvärdet delat med P/E: 292,458 ÷ ${f(GS.pe)} = **${f(implicitPE, 1)} miljarder dollar**. ROE-fältets implicita underlag: det bokförda kapitalet är börsvärdet delat med P/B (292,458 ÷ ${f(GS.pb)} = ${f(ek, 1)} miljarder), multiplicerat med 0,169 = **${f(implicitROE, 1)} miljarder**. Och bokföringen? Helåret 2025 redovisade Goldman Sachs net earnings på **17,18 miljarder dollar** — det ena ankaret. Det andra är den rullande tolvmånadersvinsten, härledd ur bolagets rapporterade kvartal: Q4 2025 (4,62 miljarder) och Q1–Q2 2026 (5,63 + 6,63) är rapporterade; Q3 2025 saknar sökverifierad vinstrad, men rapportrubriken bär vinst per aktie 12,25 dollar — med ett interpolerat aktietal omkring 328 miljoner ger det cirka 4,0 miljarder, och resten av helåret blir omkring 4,8 miljarder för Q1 2025. Summeringen: **cirka ${f(ttmNe / 1000, 1)} miljarder dollar** rullande, med härledningsosäkerheten redovisad. Lägg nu de fyra vittnena på rad: bokförd 17,2, ROE-fältets implicita 17,8, P/E-fältets implicita 18,9, rullande 20,9. Fältens underlag klämmer sig in mellan bokförd och rullande vinst — samma algebra som i syskonpaketen, men här med historiens tydligaste utsikt: källans fält mäter ett rullande fönster som inte hunnit ikapp rekordkvartalen.

**Test 3 — absolutkontrollen, och teckenväxlaren.** P/E gånger bokförd årsvinst: ${f(GS.pe)} × 17,18 = **${f(absFY, 1)} miljarder dollar** mot börsvärdet 292,458 — residualen **plus ${pct(absFYres, 1)} procent**: börsen prissätter banken tio procent över vad helårets bokförda vinst och multipeln motiverar. Kör samma kontroll mot den rullande vinsten i stället: ${f(GS.pe)} × ${f(ttmNe / 1000, 2)} = **${f(absTTM, 1)} miljarder** — residualen **minus ${pct(-absTTMres, 1)} procent**: börsen prissätter banken tio procent UNDER det rullande underlaget. Residualen byter tecken när nämnaren byter fönster — skillnaden mellan att läsa en bank på förra årets bok och på årets takt: värderingen beror på nämnaren, inte bara på kursen. Observera vilken nämnare marknadens multipel faktiskt vilar på: den implicita P/E-vinsten (18,9 miljarder) ligger mittemellan de två officiella ankaren, alltså ett fönster som halvt hunnit ikapp.

**Test 4 — PEG-konventionen, femte rakbladet, ny profil.** Källan anger PEG till ${f(GS.peg, 2)}. Konventionen är P/E delat med tillväxttalet i procentenheter: ${f(GS.pe)} delat med 4,68 ger **${f(pegKonv, 2)}**. De fyra nordiska bankpaketen fann källans PEG-fält över konventionen varenda gång (Nordea 8,87 mot 2,19, Handelsbanken 18,54 mot 2,33, Swedbank 6,99 mot 1,57, SEB 2,12 mot 1,27). Goldman Sachs är den första banken där fältet i stället ligger UNDER konventionen: ${f(GS.peg, 2)} mot ${f(pegKonv, 2)}, en faktor 0,37. Den implicita tillväxten i källans PEG — ${f(GS.pe)} ÷ ${f(GS.peg, 2)} = ${f(pegImplicit, 2)} procent — matchar inget tillväxtfält i filen (varken konsensusfältets 4,68 eller tillväxtfältets 42,5). Fem banker, fem fall — slutsatsen oförändrad: en multipel ur en källa är ett påstående tills den prövats mot en identitet eller konvention. Här används PEG-värdet ${f(pegKonv, 2)} som räknestorhet — inte som skattning.

**Test 5 — tillväxtfältet mot kvartalen.** Källans TTM-fält säger plus 42,5 procent. Räkna på de rapporterade kvartalen i stället: andra kvartalets årsjämförelse är 20 338 mot 14 580 miljoner dollar — plus ${pct(yoyQ2, 1)} procent. Kvartalet före: plus 14 procent mot Q1 2025. En äkta TTM-summering (Q3 2025 genom Q2 2026, där Q3-vinsten är härledd ur helåret) landar på cirka ${f(ttmRev / 1000, 1)} miljarder dollar i intäkter. Fältets 42,5 procent ligger alltså närmast senaste kvartalets årsjämförelse än något rullande heltårsfönster — det är den läsningen som förs vidare i paketet: fältet är kvartalsvärme, inte årstakt. Notera också nettomarginalerna som bokföringen bär: 29,5 procent helåret 2025, 32,6–32,7 procent i årets två kvartal — universumfältets 31,04 procent ligger precis däremellan: ytterligare ett fält vars fönster mitt emellan.

## Så står sig bolaget mot branschen

Finansgrenen i universumfilen mäter 19 bolag — de fyra nordiska storbankerna, investmentbolagen, försäkrare och globala namn som Berkshire Hathaway, Visa, Mastercard och Royal Bank of Canada. Medianerna nedan är omräknade 2026-09-18 ur filens aktuella poster, kolumnvis där tal finns.

| Nyckeltal | Goldman Sachs | Median finans (19 bolag) | Median universumet | Rang i grenen |
|---|---|---|---|---|
| P/E | ${f(GS.pe)} | 15,269 | 21,153 | ${RANG.pe} |
| P/B | ${f(GS.pb)} | 2,678 | 2,807 | ${RANG.pb} |
| Räntabilitet på eget kapital (ROE) | ${pct(GS.roe, 1)} % | 15,34 % | 15,34 % | ${RANG.roe} |
| Rörelsemarginal (EBIT) | ${pct(GS.ebit, 2)} % | 47,90 % | 21,17 % | ${RANG.ebit} |
| Nettomarginal | ${pct(GS.netto, 2)} % | 35,19 % | 14,09 % | ${RANG.netto} |
| Prognostillväxt (konsensus) | ${pct(GS.prognos, 2)} % | 9,50 % | 12,31 % | ${RANG.prog} |
| TTM-tillväxt (källans fält) | ${f0(GS.ttm * 100)} % | 10,00 % | 7,20 % | ${RANG.ttm} |

Läsningen — världsbanksprofilen: på värderingen är Goldman Sachs nästan exakt medianbanken (P/E rang 11 av 19, P/B 12 av 19), på avkastningen strax över (ROE 13 av 19), på marginalerna under (EBIT och netto 7 av 19) — investmentbankens lönekostnadsstruktur mot universelltjänstbankernas räntenetton, som syskonpaketen visat är en intäktsrad av nettotyp. Det som inte är median alls är rörelsens ändpunkter: källans tillväxtfält 42,5 procent är grenens näst högsta (18 av 19), medan konsensusfältets 4,68 procent är grenens fjärde lägsta (4 av 16). Avståndet mellan historia och uppskattning — nästan nio gånger — är seriens största bland bankerna, och det är paketets egentliga ämne: ett rekordår i bakspåret och en konsensus som räknar med stillastående. Tvillingläsningen kompletterar: JPMorgan, som redovisar samma dag, bär i samma datainsamling P/E 15,269 och P/B 2,678 vid ROE 17,79 procent — aningen högre avkastning, aningen lägre multiplar, kvadratiskt spegelvända steg som åter igen bevisar regeln från quadern: P/B läst utan ROE är en halv läsning. Jämförelsen mot samtliga kollegor finns i [universumjämförelsen](/dataset/finans/universumjamforelse), och bolagets sida i biblioteket finns [här](/bolag/gs).

## Tre sätt att läsa utfallet — övningar i metod

Tre övningar i vad en rapportläsare vanligtvis tittar på för en världsbank. Ingen är en bedömning av vad som händer den 13 oktober — de är träning i metod och ren aritmetik.

**Övning A — läs rekordbågen, sedan baseffekten.** Bolagets egna rapporterade svit: helåret 2025 gav ROE 15,0 procent; tredje kvartalet 2025 annualiserat 14,2; fjärde 16,0 — och sedan 2026: Q1 med historiens näst högsta intäkter och vinst, Q2 med de högsta: intäkter +14 respektive +${pct(yoyQ2, 0)} procent mot föregående års kvartal, vinst per aktie 17,55 och sedan 20,98 dollar, ROE annualiserat 23,5 procent. Övningen när rapporten ligger framför dig: räkna årsstegen själv, och skilj på två frågor som lätt blandas ihop: hur fort bolaget växer, och hur länge kvartal av denna storlek fortsätter att vara årsjämförelser. Baseffekten är aritmetik: när Q2 2027 jämförs mot Q2 2026:s 20 338 miljoner dollar blir även ett starkt kvartal ett lägre tal i procent. Konsensusfältets 4,68 procent är marknadens samlade uppskattning av nästa års vinsttillväxt — ett begrepp att förstå, inte en måttstock att döma utfallet med, och skillnaden mellan utfall och uppskattning är ett pedagogiskt verktyg, aldrig en handssignal.

**Övning B — scenariorutan i ren aritmetik.** Universumets seriefält är tomma, men här finns ett officiellt helår att räkna på: intäkter 2025 på 58 280 miljoner dollar och universumets rörelsemarginal ${pct(GS.ebit, 2)} procent ger ett rörelseresultat på ungefär ${f0(bas * m0)} miljoner dollar. Med tre hypotetiska intäktsnivåer (±3 procent) och tre marginaler (±1 procentenhet) blir rutan, i miljoner dollar:

| Rörelseresultat, miljoner dollar | Marginal ${pct(marg[0], 2)} % | Marginal ${pct(m0, 2)} % | Marginal ${pct(marg[2], 2)} % |
|---|---|---|---|
| Intäkter ${f0(rutor[0])} | ${f0(cell(rutor[0], marg[0]))} | ${f0(cell(rutor[0], m0))} | ${f0(cell(rutor[0], marg[2]))} |
| Intäkter ${f0(rutor[1])} | ${f0(cell(rutor[1], marg[0]))} | ${f0(cell(rutor[1], m0))} | ${f0(cell(rutor[1], marg[2]))} |
| Intäkter ${f0(rutor[2])} | ${f0(cell(rutor[2], marg[0]))} | ${f0(cell(rutor[2], m0))} | ${f0(cell(rutor[2], marg[2]))} |

Två räknesatser: en procentenhet marginal flyttar resultatet med cirka ${f0(margSteg)} miljoner dollar vid oförändrade intäkter, medan tre procent mer intäkter vid oförändrad marginal flyttar det med cirka ${f0(intSteg)} miljoner — intäktsratten väger cirka ${f(viktKvot, 1)} gånger tyngst. Marginalvikten, seriens mått på känslighetsbalansen, blir 1 ÷ (3 × 0,4218) = **${f(marginalvikt, 2)}** — mittemellan bankfamiljens 0,5–0,6 och industrins tyngre marginalvågar. En investmentbank är bokstavligen något mitt emellan: dess intäktsrad svämmar över i högkonjunktur som en råvarubits, men kostnadsledet domineras av people, inte av järnmalm. Alla nio celler är aritmetik på 2025 års bas och universumets marginalfält — inga skattningar.

**Övning C — multipelövningen med teckenväxlaren.** Ren räkneövning med källans egna tal: P/E ${f(GS.pe)} delat med 1,0468 (konsensustalet för vinsttillväxt, använt som räknestorhet, inte som skattning) blir **${f(multProg, 2)}** — om vinsten rör sig i den takten och kursen står stilla, sjunker P/E under 15 och vidare under finansmedianen 15,269. Och teckenväxlarens andra sida: börsvärdet delat med den rullande vinsten från Datavaktens test 2 — 292,458 miljarder mot cirka ${f(ttmNe / 1000, 1)} miljarder — ger **${f(multTTM, 1)}**. Samma bank, samma kurs, två multipeler beroende på fönstret i nämnaren. Det är multipelns dubbla natur igen, med tredje vägen: via kursen, via vinsten — och via vilket vinstfönster läsaren räknar på.

## Praktiskt inför 13 oktober

- Rapportdagen tisdagen 13 oktober 2026 är officiell och står i [bolagets pressrumsnotis om 2026 års konferenssamtal](https://www.goldmansachs.com/pressroom/press-releases/2025/conference-call-dates-to-announce-4q25-and-2026-earnings-results); pressrelease kommer cirka 07:30 amerikansk östtid — svensk tid 13:30 samma dag under sommartid — och konferenssamtalet 09:30 östtid strömmas som webcast via [investor relations-sidan](https://www.goldmansachs.com/investor-relations/financials/quarterly-earnings-releases). Fjärde kvartalet 2026 kommer redan tisdagen 19 januari 2027 — hela spelplanen utlyst över ett år i förväg, seriens längsta horisont.
- En valuta hela vägen: amerikansk redovisning i dollar, amerikansk notering i dollar — samma renhet som Handelsbankens och Swedbanks paket, och motsatsen Nordea, där euro-tal mötte kronor-kurs och ett P/B-fält blåstes upp. Den som korsläser de fem bankpaketen har nu hela spannet: fyra nordiska universelltjänstbanker och en amerikansk investmentbank, med och utan valutabro.
- Insiderköpens sju observationer och aktietalets härledda minskning är ägaraktivitet som rapporten inte ropar om sig själv — men som balansräkningen och vinsten per aktie bär. Övningen: räkna nämnaren för hand när rapporten ligger framme.
- Vågvalideringsnot: Goldman Sachs står inte i seriens vågvalideringskarta (de tolv universumbolag som kartades i våg 152) — paketet vilar på universumdata och kalenderfakta enligt Iberdrola-precedensen, och säger det öppet.
- Ordlista för alla begrepp finns i [kurserna](/kurser) — bankdelen går igenom räntenetto, kreditförluster och kapitaltäckning, och börspsykologidelen går igenom konsensusbegreppet. Metodtransparensen finns på [transparensidan](/transparens) och [källsidan](/kallor).
- Efter rapporten uppdateras bolagsuniversumets nyckeltal vid nästa insamling, aspektsidorna speglar nya medianer — och världsbanksepoken fortsätter med nästa paket bland grenens återstående rappdagar, där tvillingdatumet 13 oktober även bär JPMorgan.

## Källor

- Rappdag 2026-10-13 (pressrelease cirka 07:30 ET, konferenssamtal 09:30 ET som öppen webcast) samt Q4 2026-datumet 2027-01-19: Goldman Sachs pressrum, "Conference Call Dates to Announce 4Q25 and 2026 Earnings Results" — live-verifierad 2026-09-18 med ordalydelsen "Third quarter 2026 – Tuesday, October 13, 2026" — internt underlag: data/blogg-utkast/kvartal/2026-q3/kalender-finans.json (hämtat 2026-09-15).
- Nyckeltal, kurser, börsvärde och fältvärden: bolagsuniversumets datainsamling för GS 2026-09-03 (Yahoo Finance quoteSummary-moduler; källa B, MarketStack, dubbelkoll av pris och valuation med slutkurs 2026-09-02 — till skillnad från de fyra nordiska syskonpaketen finns här alltså en dubbelkollad kurs, vilket redovisas som seriens första bankpaket med den styrkan) — internt: data/portfolj-system/bolagsunivers.json. Medianer och rangplatser omräknade 2026-09-18 ur samma fil (177 poster; finansgrenen 19 bolag, universummedianerna 166–177 poster per mått, kolumnvis där tal finns).
- Rapporterade kvartalssiffror: Goldman Sachs resultatmeddelanden — Q2 2026 (2026-07-14: net revenues 20 338 miljoner dollar, net earnings 6 628 miljoner, EPS 20,98, annualiserad ROE 23,5 procent; första halvårets intäkter 37 565 miljoner), Q1 2026 (2026-04-13: 17 227 / 5 630 miljoner, EPS 17,55, intäkter +14 procent mot Q1 2025), helår 2025 och Q4 2025 (2026-01-15: året 58 280 / 17 180 miljoner, EPS 51,32, ROE 15,0 procent; kvartalet 13 450 / 4 620 miljoner, EPS 14,01, annualiserat 16,0 procent), Q3 2025 (2025-10-14: EPS 12,25, annualiserad ROE 14,2 procent) och Q2 2025 (2025-07-16: 14 580 / 3 720 miljoner) — samtliga hämtade via pressrum och SEC-filingar, sökverifierade 2026-09-18.
- Datavaktens fem test: egna beräkningar — identiteten (2,774 ÷ 0,169 = ${f(idFram)} mot ${f(GS.pe)}; omvänt ${f(GS.pe)} × 0,169 = ${f(idTillbaka)} mot ${f(GS.pb)}; ${pct(idGap, 1)} respektive ${pct(-idGap2, 1)} procent), TTM-detektiven (implicita underlag ${f(implicitPE, 1)} och ${f(implicitROE, 1)} miljarder mot bokförda 17,18 och härledd rullande ${f(ttmNe / 1000, 1)} miljarder med Q3 2025 härlett ur EPS 12,25 × interpolerat aktietal 328 miljoner och Q1 2025 som restpost), absolutkontrollen i två fönster (${f(GS.pe)} × 17,18 = ${f(absFY, 1)} mot 292,458 = plus ${pct(absFYres, 1)} procent; ${f(GS.pe)} × ${f(ttmNe / 1000, 2)} = ${f(absTTM, 1)} = minus ${pct(-absTTMres, 1)} procent), PEG-konventionen (${f(GS.pe)} ÷ 4,68 = ${f(pegKonv, 2)} mot källans ${f(GS.peg, 2)}; implicit tillväxt ${f(pegImplicit, 2)} procent) och tillväxtfältsprövningen (kvartalsjämförelser +${f0(0.14 * 100)} och +${pct(yoyQ2, 1)} procent; härledd TTM-intäkt ${f(ttmRev / 1000, 1)} miljarder) — samtliga steg redovisade i texten.
- Scenarioruta, räknesatser och multipelövningar: aritmetik på 2025 års bas (58 280 miljoner dollar; rörelsemarginal ${pct(GS.ebit, 2)} procent ur universumfältet); samtliga nio celler och båda räknesatserna dubbeltkontrollerade vid tillverkningen 2026-09-18.

*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar eller bolagets egna resultatmeddelanden med källa och datum angivna; där en källa saknar data står det explicit, och där ett källfält håller inte för kontrollräkning redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

const paket = {
  slug: 'sa-laser-du-goldman-sachs-q3-2026',
  title: 'Goldman Sachs Q3-rapport 2026: så läser du den — bankpaket nummer fem: världsbanksepoken öppnar med teckenväxlaren och konsensusgapet',
  description: 'Goldman Sachs redovisar tredje kvartalet 2026 tisdagen 13 oktober. Här är läspaketet: nyckeltalen mot finansgrenens medianer, datavaktens teckenväxlare — residualen byter tecken beroende på om nämnaren är bokförd eller rullande vinst — och bankfamiljens första PEG-fält under konventionen. Scenariorutan räknas i ren aritmetik i dollar, och varje siffra har sin källa.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-13',
  readingMinutes: 5,
  tags: ['kvartalsrapport', 'Goldman Sachs', 'finans', 'bankaktier', 'nyckeltal', 'läspaket'],
  body
};

fs.writeFileSync(UTDATA, JSON.stringify(paket, null, 2) + '\n');
const ord = body.replace(/\|/g, ' ').replace(/[#*\[\]()>/-]/g, ' ').split(/\s+/).filter(Boolean).length;
console.log('SKREV', UTDATA, '| ord ≈', ord, '| readingMinutes', paket.readingMinutes);
console.log('kontrolltal: ttmNe', (ttmNe / 1000).toFixed(2), '| absFY', absFY.toFixed(1), '| absTTM', absTTM.toFixed(1),
  '| celler', [cell(rutor[0], marg[0]), cell(rutor[1], m0), cell(rutor[2], marg[2])].join('/'),
  '| idFram', idFram.toFixed(3), '| pegKonv', pegKonv.toFixed(2), '| multTTM', multTTM.toFixed(2));
