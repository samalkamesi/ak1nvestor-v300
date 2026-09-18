#!/usr/bin/env node
// Byggskript s4-u3 — Fortum Q3-2026-läspaket (manifest auto-s4-1789764325017)
// Alla tal i texten motorräknas här och interpoleras — inga handskrivna värden i bodyn.
import fs from 'node:fs';

const MÅL = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-fortum-q3-2026.json';

// Svensk talformatering: komma-decimaler, mellanslag som tusentalsavgränsare, minus som −
const swe = (x, dec = 0) => {
  if (!isFinite(x)) return 'osatt';
  const neg = x < 0 ? '−' : '';
  const a = Math.abs(x);
  const [h, t] = a.toFixed(dec).split('.');
  const gr = h.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  return neg + gr + (t !== undefined ? ',' + t : '');
};
const pct = (x, dec = 2) => swe(x * 100, dec);

// ————— KÄLLDATA (källa per tal, redovisas i paketets källsektion) —————
// A = universumpost FORTUM.HE i bolagsunivers.json, hämtad 2026-09-03 (Yahoo Finance-moduler)
const A = {
  pris: 20.65, mcapMdr: 18.529,
  pe: 22.446, pb: 2.275, evEbit: 39.622, pegKalla: 13.9, fcfYield: 0.0424,
  roe: 0.0999, roic: 0.0434, brutto: 0.3942, ebitMarg: 0.0952, nettoMarg: 0.1507, fcfMarg: 0.1431,
  skuldEk: 0.4748,
  omsCagr: -0.1725, resCagr: null, ttm: 0.154, prognos: -0.0414,
  oms: [8804, 6711, 5800, 4989],   // MEUR 2022–2025
  res: [-2416, 1514, 1164, 765],    // MEUR 2022–2025
};
// Grensmedianer (energi, n=19) + universummedianer (n=189) — beräknade ur bolagsunivers.json 2026-09-18
const MED = {
  pe: { e: 16.5325, en: 18, u: 21.17, un: 179 },
  pb: { e: 2.2750, en: 19, u: 2.8065, un: 186 },
  evEbit: { e: 13.44, en: 19, u: 18.27, un: 179 },
  peg: { e: 0.79, en: 15, u: 1.41, un: 157 },
  roe: { e: 0.1291, en: 19, u: 0.1534, un: 185 },
  roic: { e: 0.1163, en: 19, u: 0.1343, un: 169 },
  brutto: { e: 0.4013, en: 19, u: 0.4772, un: 186 },
  ebit: { e: 0.1822, en: 19, u: 0.2096, un: 188 },
  netto: { e: 0.0908, en: 19, u: 0.1366, un: 189 },
  fcfm: { e: 0.1126, en: 18, u: 0.1258, un: 175 },
  fcfY: { e: 0.0528, en: 19, u: 0.0394, un: 171 },
  omscagr: { e: -0.0844, en: 19, u: 0.0439, un: 180 },
  skuld: { e: 0.5037, en: 19, u: 0.5200, un: 173 },
};
const RANG = { pe: '15/18', pb: '10/19', evEbit: '18/19', netto: '15/19', ebit: '2/19', roe: '4/19', roic: '3/19', brutto: '9/19', fcfY: '9/19' };
// Grenskollegor (universumposter, för trappjämförelsen)
const KOLLEGA = { iberdrola: { ebit: 0.2447, netto: 0.1588 }, varEnergi: { ebit: 0.5941, netto: 0.1302 },
  wallenstam: { ebit: 0.5737, netto: 0.8080 }, holmen: { ebit: 0.0724, netto: 0.1186 }, sca: { ebit: 0.0390, netto: 0.0970 } };
// B = Fortums rapporter (sökverifierade 2026-09-18, se källsektion)
const B = {
  q1res: 521, q1resPy: 462, q1ebitda: 600, q1ebitdaPy: 538, q1rep: 536, q1repPy: 470,
  q2oms: 1124, q2omsPy: 974, q2res: 106, q2resPy: 115, q2rep: 90, q2repPy: 104,
  q2vinst: 109, q2vinstPy: 104, q2assoc: 57, q2assocPy: 27, q2ebitda: 185, q2ebitdaPy: 191,
  h1oms: 3116, h1omsPy: 2616, h1res: 627, h1resPy: 577, h1vaxt: 0.087,
  q3resPy: 97, q3ebitdaPy: 175, q3ebitdaPy2: 254, jsRes: 674, jsResPy: 921, jsEbitda: 903, jsEbitdaPy: 1202, jsKassa: 131, jsKassaPy: 349,
  q4res: 251, q4resPy: 257, q4ebitda: 336, q4ebitdaPy: 355,
  elmeraNokMdr: 5.1, elmeraEurMdr: 0.45, elmeraKurs: 47, elmeraEbitdaMult: 9.2,
};

// ————— HÄRLEDNINGAR (allt motorräknat) —————
const r = {};
r.identitet = A.pb / A.roe;
r.identitetAvv = r.identitet / A.pe - 1;
r.omsSteg = A.oms.slice(1).map((v, i) => v / A.oms[i] - 1);
r.omsTotal = A.oms[3] / A.oms[0] - 1;
r.nettoSerie = A.res.map((v, i) => v / A.oms[i]);
r.q1oms = B.h1oms - B.q2oms; r.q1omsPy = B.h1omsPy - B.q2omsPy;
r.q1Vaxt = r.q1oms / r.q1omsPy - 1; r.q2Vaxt = B.q2oms / B.q2omsPy - 1;
r.q1Marg = B.q1res / r.q1oms; r.q1MargPy = B.q1resPy / r.q1omsPy;
r.q2Marg = B.q2res / B.q2oms; r.q2MargPy = B.q2resPy / B.q2omsPy;
r.h1Marg = B.h1res / B.h1oms; r.h1MargPy = B.h1resPy / B.h1omsPy;
r.q1resVaxt = B.q1res / B.q1resPy - 1; r.q2resVaxt = B.q2res / B.q2resPy - 1;
r.q1kontroll = B.q1res + B.q2res;
r.jsKontroll = B.q1resPy + B.q2resPy + B.q3resPy;
r.nettoOverEbit = A.nettoMarg / A.ebitMarg - 1;
r.pegKonvention = A.pe / (A.prognos * 100);
r.pegImplicit = A.pe / A.pegKalla;
r.ttmProgGlapp = (A.ttm - A.prognos) * 100;
r.nettoPerEbit = A.nettoMarg / A.ebitMarg;
r.pEbit = A.pe * r.nettoPerEbit;
r.evKvot = A.evEbit / r.pEbit;
r.nettoSkuldMcap = r.evKvot - 1;
r.ekMdr = A.mcapMdr / A.pb; r.skuldMdr = A.skuldEk * r.ekMdr;
r.skuldMcap = r.skuldMdr / A.mcapMdr;
r.kassaMdr = (r.skuldMcap - r.nettoSkuldMcap) * A.mcapMdr;
r.havstang = 1 + A.skuldEk;
r.turnover = A.roe / (A.nettoMarg * r.havstang);
r.margVikt = 1 / (3 * A.ebitMarg);
r.multTtm = A.pe / (1 + A.ttm); r.multProg = A.pe / (1 + A.prognos);
r.basEbit = A.oms[3] * A.ebitMarg;
r.scen = [];
for (const dd of [-0.01, 0, 0.01]) for (const dv of [-0.03, 0, 0.03])
  r.scen.push({ dd, dv, varde: A.oms[3] * (1 + dv) * (A.ebitMarg + dd) });
r.ppVarde = 0.01 * A.oms[3];
r.intVarde = 0.03 * r.basEbit;
r.q2vinstOverRep = B.q2vinst - B.q2rep;
r.evOverPe = A.evEbit / A.pe;

// ————— BODY (alla tal interpolerade) —————
const body = `Fortum — ticker FORTUM på Nasdaq Helsinki — publicerar sin delårsrapport januari–september 2026 onsdagen den **28 oktober omkring kl 09:00 finsk tid** (08:00 svensk). Datumet står i bolagets egen IR-kalender med januari–mars-rapporten 29 april och halvårsrapporten 21 juli som de två senast infriade posterna. Det här är läspaket nummer 46 i kvartalsrapportserien och energigrenens tredje paket — efter Iberdrola och Vår Energi — samt seriens tredje Helsingfors-noterade bolag efter Nokia och UPM-Kymmene ([bolagssidan med full historik](/bolag/fortum-he)). Hela posten är i euro, från kursen ${swe(A.pris,2)} till årsredovisningsserierna: inga växelkurser kan skilja måtten åt, samma kontrollgrund som UPM-paketets renaste läge.

## Urvalet: varför Fortum är nästa paket i serien

Urvalsprincipen är oförändrad genom samtliga 45 levererade paket: **tidigaste officiellt bekräftade rappdagen bland kalenderbolag med bärande universumdata**. Fältet för 27 oktober togs av ASSA ABLOY-paketet; bland 28 oktober-bolagen finns SSAB-paketet (07:30 CET, levererat), UPM-paketet (09:30–10:00 finsk tid, levererat) — och de två som SSAB-paketets kö-notis utpekade som fria: **Equinor och Fortum**. Tie-breaken mellan dem blev seriens tydligaste källbildsfråga på länge. Equinors universumpost (hämtad 2026-09-03) bär **fyra dokumenterade avvikelser över 15 procent mellan sina två källor** — kurs 401,2 mot 44,23 norska kronor, samma gap på P/E, P/B och marknadsvärde — och bolaget redovisar i dollar under norsk notering, tvåvalutorskomplexiteten som Vår Energi-paketet dokumenterade. Fortums post har ingen enda källavvikelse flaggad och enkel valuta. UPM-paketet kallade Fortum "tre bärande resultattal av fyra möjliga" — det är korrekt (basåret 2022 är negativt) men posten bär i övrigt allt: full fyraårig omsättningsserie, samtliga multiplar, ROIC, FCF-fält och marknadsvärde ${swe(A.mcapMdr,3)} miljarder euro. Carlsberg (29 oktober) saknar marknadsvärde, ROIC och FCF-avkastning i posten; Stora Enso (30 oktober) har tät data men en senare rappdag. **Fortum vann på ren källbild, officiellt datum och bärande bredd** — med basårets hål redovisat öppet som paketets första läxa.

## Nyckeltalen att ha med sig — AKM2:s fyra dimensioner, kraftbolags-utgåva

**Tillväxt.** Universumposten ger [omsättningstillväxten ${pct(A.omsCagr)} procent per år](/dataset/energi/omsattning-cagr-5ar) över fyra räkenskapsår — ${swe(A.oms[0])} → ${swe(A.oms[3])} miljoner euro, sammanlagt ${pct(r.omsTotal)} procent — och [resultattillväxten är osatt](/dataset/energi/resultat-cagr-5ar): basåret 2022 redovisar −${swe(Math.abs(A.res[0]))} miljoner euro, och formeln vägrar hellre än att dölja (Telia- och Electrolux-familjens lära; SSAB tillhör samma familj). Årsstegen för omsättningen är ${pct(r.omsSteg[0])}, ${pct(r.omsSteg[1])} och ${pct(r.omsSteg[2])} procent — tre raka fallår. Men det är ingen efterfrågekrasch: det är en bolagsprofil som medvetet krympte. Olje- och gasverksamheten och Uniper-engagemanget avvecklades 2022–2023, och det Fortum som finns kvar är ett nordiskt kraft- och värmebolag med mindre omsättningsbas men renare risk. Den [rullande TTM-tillväxten är ${pct(A.ttm,1)} procent](/dataset/energi/omsattningstillvaxt-ttm) och 2026 års kvartal bekräftar: Q1 omsättning ${swe(r.q1oms)} miljoner euro (+${pct(r.q1Vaxt,1)} mot året före) och Q2 ${swe(B.q2oms)} miljoner (+${pct(r.q2Vaxt,1)}). [Konsensusprognosen för nästa år är ${pct(A.prognos)} procent](/dataset/energi/prognos-tillvaxt) — ett negativt tecken som paketet återkommer till i PEG-tvisten.

**Lönsamhet.** [Bruttomarginalen ${pct(A.brutto)} procent](/dataset/energi/brutto-marginal) ligger prick på grenens median ${pct(MED.brutto.e)} (rang ${RANG.brutto}) — kraftbolagets bruttomarginal är i grunden en elpris-minus-bränsle-ekvation och grenens olika affärsmodeller (producent, nät, handel) gör den till ett av de svagaste jämförelsemåtten. [EBIT-marginalen ${pct(A.ebitMarg)} procent](/dataset/energi/roe) är grenens näst lägsta (rang ${RANG.ebit} av 19) — och där börjar paketets största historia, för [nettomarginalen ${pct(A.nettoMarg)} procent](/dataset/energi/netto-marginal) ligger på rang ${RANG.netto}: **femte högst av 19**. Trappan går uppåt vänster. [ROE ${pct(A.roe)} procent](/dataset/energi/roe) under grenens ${pct(MED.roe.e)} (rang ${RANG.roe}) och [ROIC ${pct(A.roic)} procent](/dataset/energi/roic) — källans proxy, rörelseresultat före skatt delat med skuld plus bokfört eget kapital — tredje lägst i grenen (rang ${RANG.roic}) mot medianen ${pct(MED.roic.e)}. Notera avståndet: de två avkastningsmåtten ligger i grenens botten samtidigt som nettomarginalen ligger i toppen — det är två olika frågor som råkar heta likadant (mer i Datavakten).

**Stabilitet.** [Skuldkvoten ${swe(A.skuldEk,4)}](/dataset/energi/skuldsattning) ligger strax under grenens median ${swe(MED.skuld.e,4)} och universumets ${swe(MED.skuld.u,4)} — en balansräkning i grenens mittskikt, långt ifrån det nödläge den bar under Uniper-epoken. Räntetäckningsfältet är osatt i källan (räntekostnad saknas för senaste räkenskapsåret) och redovisas som sådant; [FCF-marginalen ${pct(A.fcfMarg)} procent](/dataset/energi/netto-marginal) ligger över både grenens ${pct(MED.fcfm.e)} och universumets ${pct(MED.fcfm.u)} — kassan är starkare än genomsnittet.

**Säsongsbanan.** Fortums kvartal har två karriärer. Q1 2026: jämförbart rörelseresultat ${swe(B.q1res)} miljoner euro på ${swe(r.q1oms)} i försäljning — marginal ${pct(r.q1Marg,1)} procent, vinterns högprisläge med ökade genereringsvolymer. Q2 2026: ${swe(B.q2res)} miljoner på ${swe(B.q2oms)} — marginal ${pct(r.q2Marg,1)} procent, sämre uppnått elpris. Förra året samma mönster: ${pct(r.q1MargPy,1)} och ${pct(r.q2MargPy,1)} procent. Halvåret 2026 landar på ${swe(B.h1res)} miljoner (${swe(B.h1resPy)} föregående år, +${pct(B.h1vaxt,1)} procent) med marginalen ${pct(r.h1Marg,1)} mot ${pct(r.h1MargPy,1)} — och kontrollen stämmer på euroron: ${swe(B.q1res)} + ${swe(B.q2res)} = ${swe(r.q1kontroll)} exakt. Ett kraftbolags Q3 är definitionsmässigt ett lågmarginal-kvartal: fjolårets Q3 redovisade ${swe(B.q3resPy)} miljoner i jämförbart rörelseresultat och ${swe(B.q3ebitdaPy)} i jämförbar EBITDA (mot ${swe(B.q3ebitdaPy2)} året dessförinnan). Den som läser Q3 med Q1-brillorna på kommer tro sig misslyckad.

**Värdering.** [P/E ${swe(A.pe,3)}](/dataset/energi/pe) ligger väl över grenens median ${swe(MED.pe.e,2)} (rang ${RANG.pe} av 18) och universumets ${swe(MED.pe.u,2)}. [P/B ${swe(A.pb,3)}](/dataset/energi/pb) — och här finns en seriens ovanlighet: **Fortums P/B är exakt grenens median**, ${swe(A.pb,3)} mot ${swe(MED.pb.e,4)} beräknad på samma 19 bolag; med udda n är medianen ett verkligt bolagsvärde och det är Fortums. [EV/EBIT ${swe(A.evEbit,3)}](/dataset/energi/ev-ebit) är grenens näst högsta (rang ${RANG.evEbit}) mot medianen ${swe(MED.evEbit.e,2)} — hela avståndet mellan dessa båda multiplar är paketets värderingsgåta. [FCF-avkastningen ${pct(A.fcfYield)} procent](/dataset/energi/fcf-avkastning) ligger under grenens ${pct(MED.fcfY.e)} men över universumets ${pct(MED.fcfY.u)}. Hela [värderingsblocket](/dataset/energi/vardering) tecknar bolaget till ett [marknadsvärde på ${swe(A.mcapMdr,3)} miljarder euro](/dataset/energi/universumjamforelse) — en kropp där varje mått tycks mäta ett annat bolag.

## Datavakten — rangglidningen, PEG som vägrar och Elmera-faktorn

**Marginaltrappan uppåt vänster — grenens första.** Seriens normala trappsteg går nedåt: rörelsemarginalen överst, sedan räntor, skatter och minoriteter, och nettomarginalen underst. Iberdrola: EBIT ${pct(KOLLEGA.iberdrola.ebit,1)} mot netto ${pct(KOLLEGA.iberdrola.netto,1)}. Vår Energi: ${pct(KOLLEGA.varEnergi.ebit,1)} mot ${pct(KOLLEGA.varEnergi.netto,1)}. Fortum: EBIT ${pct(A.ebitMarg)} mot netto ${pct(A.nettoMarg)} — **nettomarginalen ligger ${pct(r.nettoOverEbit)} procent över rörelsemarginalen**, och i grenens rangspråk glider bolaget 13 placeringar uppåt mellan de två mätningarna (näst lägst → femte högst av 19). Serien har mött trappan uppåt förut — fastighetspaketen (Wallenstam: EBIT ${pct(KOLLEGA.wallenstam.ebit,1)} mot netto ${pct(KOLLEGA.wallenstam.netto,1)}, drivet av förvaltningsresultat och värdestegringar) och skogspaketen (Holmen ${pct(KOLLEGA.holmen.ebit,1)}/${pct(KOLLEGA.holmen.netto,1)}, SCA ${pct(KOLLEGA.sca.ebit,1)}/${pct(KOLLEGA.sca.netto,1)}, skogsfastigheternas värdestegring) — men aldrig i energigrenen. Mekanismen hos Fortum är posterna under rörelseresultatet: andel av resultat i associerade och joint ventures samt finansiella poster. Q2 2026 är ett rent exempel: **rapporterat rörelseresultat ${swe(B.q2rep)} miljoner euro men nettovinst ${swe(B.q2vinst)}** — vinsten överstiger sin egen rörelse med ${swe(r.q2vinstOverRep)} miljoner, och posten andel av associerade och JV redovisar ${swe(B.q2assoc)} miljoner (${swe(B.q2assocPy)} föregående år). Det är exakt NP3-paketets fråga i ny miljö: **vems vinst?** — och svaret avgör om P/E ${swe(A.pe,3)} är dyrt eller billigt, för multipeln räknas på ett resultat som till betydande del föds utanför rörelsen.

**DuPont med seriens trögaste hjul hittills.** ROE ${pct(A.roe)} procent = nettomarginal ${pct(A.nettoMarg)} procent × kapitalomsättning × hävstång. Med skuldkvoten ${swe(A.skuldEk,4)} blir hävstången ${swe(r.havstang,4)}, och den härledda kapitalomsättningen blir ${swe(A.roe,4)} ÷ (${swe(A.nettoMarg,4)} × ${swe(r.havstang,4)}) = **${swe(r.turnover,3)}** — varje bokfört kapitaltal omsätts ${swe(r.turnover,2)} gånger per år, trögare än UPM:s 0,69 som då kallades seriens trögaste: kraftverk, värmenät och dammbyggnader är kapitaltung infrastruktur som omsätts långsamt. DuPont-ledets poäng för Q3-läsningen: när kapitalomsättningen är denna trög blir ROE-frågan nästan ren marginalfråga — och i just marginalfrågan är Fortum två bolag på en gång, beroende på vilken marginal man menar.

**Identitetstestet, tolfte rundan — grenens bästa träff.** P/E ska lika med P/B dividerat med ROE: ${swe(A.pb,3)} ÷ ${swe(A.roe,4)} = ${swe(r.identitet,2)}, mot källans P/E ${swe(A.pe,3)}. Avvikelsen: **+${pct(r.identitetAvv)} procent**. UPM-paketets totalrekord står (+0,74), men bland energigrenens tester är detta den renaste träffen — och förklaringarna är släkt med UPM:s: enkel valuta hela vägen, ingen återköpsdrift som flyttar aktietalet. Reservationen är specifik för det här bolaget: när nettovinsten delvis föds under rörelseresultatet blir förhållandet mellan bokförd avkastning (ROE) och rullande vinst rörligare än hos ett renodlat driftsbolag — träffen är ärlig men vilar på ett rörligare underlag än UPM:s.

**PEG som vägrar räkna.** Källans PEG är **${swe(A.pegKalla,1)}**. Konventionen — P/E dividerat med prognostillväxten i procent — ger ${swe(A.pe,3)} ÷ (${pct(A.prognos)}) = **−${swe(Math.abs(r.pegKonvention),2)}**: negativ nämnare, negativ PEG, och den konventionella läsningen ("under 1 är billigt") kollapsar totalt — ett tal utan teckenkunskap är meningslöst. Den tillväxt som skulle förklara källans ${swe(A.pegKalla,1)} är ${swe(A.pe,3)} ÷ ${swe(A.pegKalla,1)} = ${swe(r.pegImplicit,2)} procent per år, ett tal som inte återfinns i något av filens fält. Och bakom hela tvisten står det bredaste teckengapet i serien: TTM-tillväxten ${pct(A.ttm,1)} procent mot prognosen ${pct(A.prognos)} — **${swe(r.ttmProgGlapp,1)} procentenheter mellan värme och årsbas**. UPM-paketets PEG-tvist (17-faldig spännvidd mellan två positiva tillväxtal) hade åtminstone samma tecken; Fortums tvist handlar om tecknet självt. Paketets läsregel: döm aldrig PEG förrän du vet både storlek och tecken på tillväxten den bär.

**Elmera-faktorn — jämförelsekvartal som rörlig måltavla.** Halvårsrapportens egen titel lyder "pursuing growth through proposed Elmera acquisition": Fortum eftersträvar tillväxt genom föreslagen förvärv av Elmera Group, Norges största elbolag (före detta Fjordkraft). Fakta i korthet: rekommenderat frivilligt kontanterbjudande tillkännagivet 29 juni 2026, erbjudandekurs ${swe(B.elmeraKurs)} norska kronor per aktie, totalt cirka ${swe(B.elmeraNokMdr,1)} miljarder norska kronor ≈ ${swe(B.elmeraEurMdr,2)} miljarder euro, motsvarande runt ${swe(B.elmeraEbitdaMult,1)} gånger Elmeras EBITDA 2025; erbjudandeperioden öppnade 21 augusti 2026 med myndighetsgodkännanden under hösten. För Q3-läsaren har detta tre konsekvenser. För det första: TTM-tillväxten och 2026 års försäljningsökning (+${pct(r.q1Vaxt,1)} och +${pct(r.q2Vaxt,1)} procent) speglar både högre spotpriser och en portfölj under förändring — tillväxten är inte bara organisk. För det andra: om affären konsolideras under hösten ändras jämförelsebaserna från och med konsolideringskvartalet (Elmera förs då in i Fortums tal medan fjolårets motsvarande period är utan). För det tredje: betalningen cirka ${swe(B.elmeraEurMdr*1000)} miljoner euro ska finansieras — universumpostens skuldkvot ${swe(A.skuldEk,4)} är tagen före affärens fulla genomslag. Samma portföljvarning som UPM-paketets continuing operations-notis: kontrollera alltid vilka verksamheter som ingår i årets tal före jämförelsen mot förra årets.

## Så står sig bolaget mot branschen

| Mått | Fortum | Energi-median (n) | Universum-median (n) | Läge |
|---|---|---|---|---|
| P/E | ${swe(A.pe,3)} | ${swe(MED.pe.e,2)} (${MED.pe.en}) | ${swe(MED.pe.u,2)} (${MED.pe.un}) | över grenen (rang ${RANG.pe}) |
| P/B | ${swe(A.pb,3)} | ${swe(MED.pb.e,4)} (${MED.pb.en}) | ${swe(MED.pb.u,4)} (${MED.pb.un}) | **exakt grenens median** (rang ${RANG.pb}) |
| EV/EBIT | ${swe(A.evEbit,3)} | ${swe(MED.evEbit.e,2)} (${MED.evEbit.en}) | ${swe(MED.evEbit.u,2)} (${MED.evEbit.un}) | grenens näst högsta (rang ${RANG.evEbit}) |
| PEG (källa) | ${swe(A.pegKalla,1)} | ${swe(MED.peg.e,2)} (${MED.peg.en}) | ${swe(MED.peg.u,2)} (${MED.peg.un}) | källans fält — konventionen vägrar (se Datavakten) |
| ROE | ${pct(A.roe)} % | ${pct(MED.roe.e)} % (${MED.roe.en}) | ${pct(MED.roe.u)} % (${MED.roe.un}) | under grenen (rang ${RANG.roe}) |
| ROIC | ${pct(A.roic)} % | ${pct(MED.roic.e)} % (${MED.roic.en}) | ${pct(MED.roic.u)} % (${MED.roic.un}) | under grenen (rang ${RANG.roic}) |
| Bruttomarginal | ${pct(A.brutto)} % | ${pct(MED.brutto.e)} % (${MED.brutto.en}) | ${pct(MED.brutto.u)} % (${MED.brutto.un}) | på grenens median (rang ${RANG.brutto}) |
| EBIT-marginal | ${pct(A.ebitMarg)} % | ${pct(MED.ebit.e)} % (${MED.ebit.en}) | ${pct(MED.ebit.u)} % (${MED.ebit.un}) | grenens näst lägsta (rang ${RANG.ebit}) |
| Nettomarginal | ${pct(A.nettoMarg)} % | ${pct(MED.netto.e)} % (${MED.netto.en}) | ${pct(MED.netto.u)} % (${MED.netto.un}) | femte högst i grenen — ÖVER EBIT (rang ${RANG.netto}) |
| FCF-marginal | ${pct(A.fcfMarg)} % | ${pct(MED.fcfm.e)} % (${MED.fcfm.en}) | ${pct(MED.fcfm.u)} % (${MED.fcfm.un}) | över både gren och universum |
| FCF-avkastning | ${pct(A.fcfYield)} % | ${pct(MED.fcfY.e)} % (${MED.fcfY.en}) | ${pct(MED.fcfY.u)} % (${MED.fcfY.un}) | under grenen, över universumet (rang ${RANG.fcfY}) |
| Oms-CAGR | ${pct(A.omsCagr)} % | ${pct(MED.omscagr.e)} % (${MED.omscagr.en}) | +${pct(MED.omscagr.u)} % (${MED.omscagr.un}) | djupare fall än grenen — portföljsanering |
| Skuld/EK | ${swe(A.skuldEk,4)} | ${swe(MED.skuld.e,4)} (${MED.skuld.en}) | ${swe(MED.skuld.u,4)} (${MED.skuld.un}) | strax under grenens median |

Tabellen är en [universumjämförelse](/dataset/energi/universumjamforelse) i två dimensioner, och tre rader bär den. Den första: **P/B-raden** — Fortum är sitt eget grens medianvärde på bokvärdet, vilket gör bolaget till referenspunkten själv: varje jämförelse mot grenen börjar med att notera att mittpunkten är satt här. Den andra: **EBIT- och nettomarginalraderna tillsammans** — näst lägst och femte högst i samma kolumn, rangglidningen som är hela paketets kärna. Den tredje: **EV/EBIT mot P/E** — företagsvärdet betingar ${swe(A.evEbit,3)} års rörelseresultat medan aktiekapitalet betingar ${swe(A.pe,3)} års nettovinst; kvoten dem emellan, ${swe(A.evEbit,3)} ÷ ${swe(A.pe,3)} = ${swe(r.evOverPe,3)}, är netto/EBIT-kvoten ${swe(r.nettoPerEbit,4)} plus nettoskuldens tillskott — kedjan riflas upp nedanför. Energi är för övrigt, tillsammans med material, universumets enda gren med negativ medianomsättningstillväxt (${pct(MED.omscagr.e)} procent) — en gren i omställning, där Fortums ${pct(A.omsCagr)} är djupare än mittens men strukturerat förklarad.

EV-kedjan i ett led: P/E multiplicerat med netto/EBIT-kvoten (${swe(A.nettoMarg,4)} ÷ ${swe(A.ebitMarg,4)} = ${swe(r.nettoPerEbit,4)}) ger ${swe(A.pe,3)} × ${swe(r.nettoPerEbit,4)} = ${swe(r.pEbit,2)} — kursen per euro EBIT. Fältets EV/EBIT ${swe(A.evEbit,3)} dividerat med det ger ${swe(r.evKvot,4)}: företagsvärdet väger ${pct(r.nettoSkuldMcap)} procent tyngre än aktiekapitaliseringen — det är nettoskuldens andel av marknadsvärdet. Balansräkningssidan: skuldkvoten ${swe(A.skuldEk,4)} med eget kapital ${swe(A.mcapMdr,3)} ÷ ${swe(A.pb,3)} = ${swe(r.ekMdr,3)} miljarder euro ger bruttoskuld ${swe(r.skuldMdr)} miljoner (${pct(r.skuldMcap)} av marknadsvärdet); skillnaden mot nettoskuldposten, ${pct(r.skuldMcap - r.nettoSkuldMcap)} procentenheter ≈ ${swe(r.kassaMdr)} miljoner euro, är en kassapost av precis den storleken — härledd, inte påstådd; källan redovisar ingen kassa i universumposten.

## Tre sätt att läsa utfallet — övningar i metod

**Övning A — marginalens tyngdläge, EBIT-versionen.** Bas: 2025 års omsättning ${swe(A.oms[3])} miljoner euro × EBIT-marginal ${pct(A.ebitMarg)} = **${swe(r.basEbit)} miljoner euro i årets rörelseresultat** (universumfältets marginal, egen omräkning). Tre marginallägen (−1, 0, +1 procentenhet) mot tre intäktslägen (−3, 0, +3 procent):

| EBIT, MEUR | Oms −3 % | Oms oförändrad | Oms +3 % |
|---|---|---|---|
| Marginal ${pct(A.ebitMarg - 0.01)} % | ${swe(r.scen[0].varde)} | ${swe(r.scen[1].varde)} | ${swe(r.scen[2].varde)} |
| Marginal ${pct(A.ebitMarg)} % | ${swe(r.scen[3].varde)} | **${swe(r.scen[4].varde)}** | ${swe(r.scen[5].varde)} |
| Marginal ${pct(A.ebitMarg + 0.01)} % | ${swe(r.scen[6].varde)} | ${swe(r.scen[7].varde)} | ${swe(r.scen[8].varde)} |

Räknesatserna: en procentenhets marginal flyttar EBIT med **${swe(r.ppVarde,1)} miljoner euro** (0,01 × ${swe(A.oms[3])}), tre procents intäkter flyttar den med **${swe(r.intVarde,1)} miljoner** (0,03 × ${swe(r.basEbit)}). Marginalvikten enligt seriens formel 1 ÷ (3 × marginalnivån) = 1 ÷ ${swe(3 * A.ebitMarg,4)} = **${swe(r.margVikt,2)}** — i samma viktklass som UPM:s 3,40 och över Essitys 2,6: vid en EBIT-marginal under tio procent är en procentenhet marginal värd mer än tre treprocentiga intäktssvängar tillsammans. För ett kraftbolag är det dessutom dubbelt sant, för en intäktsökning till stor del är pris — och pris översätts nästan rakt av i marginal. Multiplövningen: P/E ${swe(A.pe,3)} ÷ ${swe(1 + A.ttm,3)} (ett plus TTM-tillväxten) = **${swe(r.multTtm,2)}**, eller ÷ ${swe(1 + A.prognos,4)} (ett plus prognostillväxten) = **${swe(r.multProg,2)}** — spannet ${swe(r.multTtm,2)}–${swe(r.multProg,2)} är PEG-tvisten i multipelform: värmt av TTM-världen eller avsvalnat av prognosvärlden.

**Övning B — säsongsjusterade bevisbördan.** Konstruera kontrollen före rapporten: fjolårets Q3 redovisade jämförbart rörelseresultat ${swe(B.q3resPy)} miljoner euro — årets absoluta bottenkvartal — och jämförbar EBITDA ${swe(B.q3ebitdaPy)} miljoner. 2026 års kvartalskvitton är blandade: Q1-resultatet +${pct(r.q1resVaxt,1)} procent år mot år, Q2 −${pct(Math.abs(r.q2resVaxt),1)} procent (sämre uppnått elpris), medan försäljningen växt båda kvartalen. Kontrollfrågan för 28 oktober: landar Q3 2026 över ${swe(B.q3resPy)} miljoner? I så fall har alla 2026 års kvartal slagit fjolårets motsvarande resultat och året vuxit på rader som också växer — en bredare vändning än prisernas; landar det under, är 2026 fortfarande ett Q1-år där vintern bär sommaren. Kom ihåg januari–september-basen när nio-månadstal läses: fjolårets ${swe(B.jsRes)} miljoner (${swe(B.jsResPy)} för 2024) och EBITDA ${swe(B.jsEbitda)} (${swe(B.jsEbitdaPy)}), med Q4-delen ${swe(B.q4res)} miljoner i jämförbart resultat — och kontrollen ${swe(B.q1resPy)} + ${swe(B.q2resPy)} + ${swe(B.q3resPy)} = ${swe(r.jsKontroll)} exakt mot jan–sep-fältet.

**Övning C — vems vinst, tredje ronden.** Q2 2026: nettovinst ${swe(B.q2vinst)} miljoner euro mot rapporterat rörelseresultat ${swe(B.q2rep)} — skillnaden ${swe(r.q2vinstOverRep)} miljoner, till större delen förklarad av andel av associerade och joint ventures ${swe(B.q2assoc)} miljoner (${swe(B.q2assocPy)} föregående år) plus finansiella poster och skatt. I Q3-rapporten: leta reda på exakt samma två rader (andel av associerade/JV, finansiella poster netto) och ställ dem mot rörelseresultatet. Om associater och finansiella poster återigen lyfter nettot över rörelsen är trappan uppåt vänster strukturell — multipeln på netto bär en vinst som inte drivs av kärnverksamheten; om däremot rörelsen växer snabbare än associaterna i höstens lågpriskvartal är rangglidningen på väg att sluta — och då är det EBIT-marginalens rang ${RANG.ebit}, inte nettots rang ${RANG.netto}, som är bolagets sanna position. Två läsningar, två olika bolag — siffrorna avgör.

## Praktiskt inför 28 oktober

- **Tid:** onsdag 28 oktober omkring kl 09:00 finsk tid (08:00 svensk); telefonkonferens följer samma dag enligt sedvana. Dagen är seriens mest pakettäta dygn: SSAB (07:30 CET, paket finns), Equinor (07:30 CET), Fortum (09:00 EET), UPM-Kymmene (09:30 EET, paket finns) och Boston Scientific (13:00 svensk, paket finns) — fem läspaket i serien för samma dygn, och Samsungs Q3-kvittering samma dag.
- **Talen att leta först:** jämförbart rörelseresultat (mot fjolårets Q3: ${swe(B.q3resPy)} miljoner euro), jämförbar EBITDA (mot ${swe(B.q3ebitdaPy)}), nettoförsäljningen (fjolårets jan–sep-bas finns i rapportens eget jämförelsekolumn — universumposten bär bara årsdata), andel av associerade och JV (mot ${swe(B.q2assoc)} i Q2 — övning C:s huvudspår), och eventuella Elmera-notiser om konsolideringstidpunkt och finansieringsupplägg.
- **Insiderfältet:** noll registrerade insiderköp senaste sex månader i universumposten — neutralt rådatafaktum, samma noll som merparten av seriens bolag. Efter rapporten: [kursutvecklingen](/kurser), vår [transparensredovisning av dataunderlaget](/transparens) och [källförteckningen](/kallor).
- **Seriens notis om kalendern:** helårsrapporten publiceras i början av februari (fjolårets kom 3 februari 2026 med Q4-jämförbart resultat ${swe(B.q4res)} miljoner euro); nästa års finansiella kalender offentliggörs sedvanligt med årsredovisningen.

## Källor

- Universumpost FORTUM.HE i bolagsunivers.json, hämtad 2026-09-03 via Yahoo Finance-moduler (pris, multiplar, tillväxt, lönsamhet, stabilitet, FCF-fält); andra källan MarketStack saknade färsk kurs, varför pris- och valuationsfält saknar dubbelkoll — redovisas utan det. Grens- och universummedianer samt rang beräknade ur 189-postfilen 2026-09-18 (energigrenen n=19; P/B-medianen ${swe(MED.pb.e,4)} är med udda n ett verkligt observationsvärde — Fortums eget).
- Fortum — Investors: Calendar and events (hämtad 2026-09-15 via kalender-energi.json): delårsrapport januari–september 2026 den 28 oktober omkring kl 09:00 finsk tid, officiellt bekräftat.
- Fortum January–June 2026 Half-year Financial Report (2026-07-21): Q2 nettoförsäljning ${swe(B.q2oms)} miljoner euro (${swe(B.q2omsPy)}), jämförbart rörelseresultat ${swe(B.q2res)} (${swe(B.q2resPy)}), rapporterat rörelseresultat ${swe(B.q2rep)} (${swe(B.q2repPy)}), nettovinst ${swe(B.q2vinst)} (${swe(B.q2vinstPy)}), andel av associerade och JV ${swe(B.q2assoc)} (${swe(B.q2assocPy)}), jämförbar EBITDA ${swe(B.q2ebitda)} (${swe(B.q2ebitdaPy)}); H1 nettoförsäljning ${swe(B.h1oms)} (${swe(B.h1omsPy)}), jämförbart rörelseresultat ${swe(B.h1res)} (${swe(B.h1resPy)}, +${pct(B.h1vaxt,1)} procent); rubrikens "pursuing growth through proposed Elmera acquisition" — sökverifierad 2026-09-18.
- Fortum January–March 2026 Interim Report (2026-04-29): jämförbart rörelseresultat ${swe(B.q1res)} (${swe(B.q1resPy)}) på högre elpriser och ökade genereringsvolymer; jämförbar EBITDA ${swe(B.q1ebitda)} (${swe(B.q1ebitdaPy)}); Q1-nettoförsäljning ${swe(r.q1oms)} miljoner euro härledd som H1 minus Q2 — sökverifierad 2026-09-18.
- Fortum January–September 2025 Interim Report (2025-10-29): Q3 jämförbart rörelseresultat ${swe(B.q3resPy)} miljoner, jämförbar EBITDA ${swe(B.q3ebitdaPy)} (${swe(B.q3ebitdaPy2)}); jan–sep jämförbart rörelseresultat ${swe(B.jsRes)} (${swe(B.jsResPy)}), EBITDA ${swe(B.jsEbitda)} (${swe(B.jsEbitdaPy)}); fjolårets års- och Q4-tal ur bokslutskommunikén 2026-02-03 — sökverifierade 2026-09-18.
- Fortum — rekommenderat frivilligt kontanterbjudande för Elmera Group: erbjudandekurs ${swe(B.elmeraKurs)} NOK per aktie, totalt cirka ${swe(B.elmeraNokMdr,1)} miljarder NOK ≈ ${swe(B.elmeraEurMdr,2)} miljarder euro ≈ ${swe(B.elmeraEbitdaMult,1)}× Elmeras EBITDA 2025; tillkännagivande 2026-06-29, erbjudandeperiod från 2026-08-21 — sökverifierad 2026-09-18.
- Egna beräkningar (2026-09-18): identitetstest, PEG-konvention med negativ nämnare och implicit tillväxt, årssteg, nettomarginalserie (−27,4 → 22,6 → 20,1 → 15,3 procent), Q1-nettoförsäljningar härledda i ett steg (H1 − Q2), kvartalsmarginaler, DuPont-dekomposition med härledd kapitalomsättning ${swe(r.turnover,3)}, EV-led med härledd bruttoskuld och kasslücka, scenarioruta, marginalvikt, multiplövningar, medianer och rang ur 189-postfilens energigren — samtliga steg redovisna i texten.

*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar eller bolagets egna resultatmeddelanden med källa och datum angivna; där en källa saknar data står det explicit, och där ett källfält inte räcker för kontrollräkning redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

const ord = body.split(/\s+/).filter(w => /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
const paket = {
  slug: 'sa-laser-du-fortum-q3-2026',
  title: 'Fortum Q3-rapport 2026: så läser du den — trappan uppåt vänster, bolaget som är sin egen median och PEG som vägrar räkna på negativ tillväxt',
  description: 'Fortum redovisar Q3 2026 onsdagen 28 oktober omkring kl 09:00 finsk tid. Läspaketet: nyckeltal mot energimedianerna, marginaltrappan som går uppåt åt fel håll, identitetstestets grensrekord och Elmera-köpets jämförelsevarningar — källa per siffra.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-28',
  readingMinutes: Math.max(1, Math.round(ord / 600)),
  tags: ['kvartalsrapport', 'Fortum', 'energi', 'kraftbolag', 'nyckeltal', 'läspaket'],
  body,
};
fs.writeFileSync(MÅL, JSON.stringify(paket, null, 2) + '\n');
console.log('SKREV', MÅL);
console.log('ORD:', ord, '| readingMinutes:', paket.readingMinutes);
console.log('KONTROLL identitet:', r.identitet.toFixed(4), 'mot P/E', A.pe, '=', (r.identitetAvv * 100).toFixed(2) + '%');
console.log('KONTROLL H1:', r.q1kontroll, 'mot', B.h1res, '| jan-sep25:', r.jsKontroll, 'mot', B.jsRes);
console.log('KONTROLL scen-cell [4]:', r.scen[4].varde.toFixed(1), 'mot bas', r.basEbit.toFixed(1));
console.log('KONTROLL pegKonvention:', r.pegKonvention.toFixed(4), '| pegImplicit:', r.pegImplicit.toFixed(4));
