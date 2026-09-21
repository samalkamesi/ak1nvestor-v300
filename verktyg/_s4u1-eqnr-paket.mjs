// _s4u1-eqnr-paket.mjs — paketbyggare för EQNR Q3-2026-läspaketet (spår 4, s4-u1).
// Läser verktyg/_s4u1-eqnr-tal.json (talbanken) + data/portfolj-system/bolagsunivers.json (medianer/rang LIVE)
// och skriver data/blogg-utkast/kvartal/2026-q3/sa-laser-du-eqnr-q3-2026.json
// ALDRIG data/blogg/ (live) — utkast only. Publicering = kundens beslut (R2).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const T = JSON.parse(readFileSync('/home/ak1a/AK1/verktyg/_s4u1-eqnr-tal.json', 'utf8'));
const { F, P, BER } = T;

// — medianer/rang LIVE ur universumfilen (energigrenen), med md5-lås —
const UNIV_SOKVAG = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const univRaw = readFileSync(UNIV_SOKVAG, 'utf8');
const univMd5 = createHash('md5').update(univRaw).digest('hex');
const U = JSON.parse(univRaw);
const arr = Array.isArray(U) ? U : (U.bolag || U.poster || Object.values(U).find(Array.isArray));
const E = arr.filter(b => b.bransch === 'energi');
const eq = E.find(b => b.ticker === 'EQNR.OL');
const median = a => { const s = a.filter(v => v != null).sort((x, y) => x - y); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const FALT = [
  ['pe', b => b.vardering?.pe, 'lag'],
  ['pb', b => b.vardering?.pb, 'lag'],
  ['evEbit', b => b.vardering?.evEbit, 'lag'],
  ['peg', b => b.vardering?.peg, 'lag'],
  ['fcfYield', b => b.vardering?.fcfYield, 'hog'],
  ['roe', b => b.lonksamhet?.roe, 'hog'],
  ['roic', b => b.lonksamhet?.roic, 'hog'],
  ['brutto', b => b.lonksamhet?.bruttoMarginal, 'hog'],
  ['netto', b => b.lonksamhet?.nettoMarginal, 'hog'],
  ['ebit', b => b.lonksamhet?.ebitMarginal, 'hog'],
  ['skuldEk', b => b.stabilitet?.skuldEgenkapital, 'lag'],
  ['ttm', b => b.tillvaxt?.omsattningTillvaxtTTM, 'hog'],
  ['omsCagr', b => b.tillvaxt?.omsattningCAGR5ar, 'hog'],
  ['resCagr', b => b.tillvaxt?.resultatCAGR5ar, 'hog'],
];
const M = {};
for (const [namn, fn, dir] of FALT) {
  const vals = E.map(fn);
  const n = vals.filter(v => v != null).length;
  const med = median(vals);
  const eqv = fn(eq);
  let rang = null;
  if (eqv != null) {
    const s = [...vals.filter(v => v != null)].sort((a, b) => dir === 'lag' ? a - b : b - a);
    rang = s.indexOf(eqv) + 1;
  }
  M[namn] = { eq: eqv, med, n, rang, dir };
}

// serieordinal — räknas från disk vid byggtillfället (exklusive denna fil om den redan finns)
const KATALOG = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3';
const antalPaket = readdirSync(KATALOG).filter(f => f.startsWith('sa-laser-du-') && f !== 'sa-laser-du-eqnr-q3-2026.json').length;
const ordinal = antalPaket + 1;

const pct = (x, dec = 2) => (x * 100).toFixed(dec).replace('.', ',');
const num = (x, dec = 2) => Number(x).toFixed(dec).replace('.', ',');
const minus = (x, dec = 2) => num(Math.abs(x), dec).replace(/^/, x < 0 ? '−' : '+');

const slug = 'sa-laser-du-eqnr-q3-2026';
const title = 'Equinors kvartalsrapport 2026: så läser du den — energigrenens nionde paket: återköpsvippan 5,0 → 1,5 → 3,0 miljarder dollar på fem månader, nettoskuldtrappan 17,8 → 10,4 procent och seriens första paket byggt på helt ny primärinsamling efter två gallringar';
const description = `Equinor (EQNR, Oslo, ADR på NYSE) redovisar tredje kvartalet onsdagen 28 oktober 2026 (Public.com och Investing.com bokar dagen; fjolårets Q3 kom 28 oktober 2025). Läspaketet är energigrenens nionde och seriens ${ordinal}:e — och det första i serien som byggs på en helt ny primärinsamling: universumraden gallrades två gånger för fyra dokumenterade källavvikelser över 15 procent och USD/NOK-mixning, och här redovisas varje bärande tal sökverifierat mot bolagets egna rapporter med datavaktens fem prov: identitetstestet (gap 2,1 procent), seriernas exakthet (0,0 procent mot årsredovisningen), valutaläxan där EV/EBIT-fältet faller med över 87 procent på kedjekontrollen medan P/E och P/B håller, teckenkollisionen TTM +37,4 mot prognos −21,8 med ett förlustbasår (Q3-2025: minus 0,20 miljarder) som gör procentjämförelser meningslösa, och aktieantalsmekaniken: 2,439 miljarder aktier, minus 7,2 procent på ett år = återköpsmotorn synlig i ett enda tal. Därtill återköpsvippan 5,0 → 1,5 → 3,0 miljarder dollar på fem månader, utdelningen 0,39 dollar per kvartal (3,52 procent direktavkastning i NOK-mått) och tre räkneövningar. Allt som utbildning, aldrig råd.`;

const body = `Equinor ASA redovisar tredje kvartalet onsdagen den 28 oktober 2026 — Public.com och Investing.com bokar dagen, MarketBeat estimerar samma datum på historisk rytm, och fjolårets Q3 kom tisdagen 28 oktober 2025. Här är energigrenens nionde läspaket, seriens ${ordinal}:e på disk — och det första som byggs på en helt ny primärinsamling. Universumraden för Equinor gallrades i två tidigare pakets urval för fyra dokumenterade källavvikelser över 15 procent och USD-rapportering mot NOK-notering; enligt seriens regel ägs återöppnandet av den som gör den nya insamlingen. Detta paket är den insamlingen: varje bärande tal nedan är sökverifierat mot bolagets egna rapportmeddelanden, och datavakten visar öppet vilka av radens fält som håller och vilka som faller.

Signaturnumren tre: **återköpsvippan** — programmet 5,0 miljarder dollar 2025, nedsatt 70 procent till 1,5 miljarder i februari, fördubblat till 3,0 miljarder vid juni månads kapitalmarknadsdag, med vägledning 2–4 miljarder per år 2027–2030; **nettoskuldtrappan** — 17,8 procent av sysselsatt kapital i fjolårets Q4, 10,4 procent i årets Q2, med bolagets egen förväntan under 10 procent till årsskiftet; och **förlustbasåret** — Q3-2025 redovisade minus 0,20 miljarder dollar i IFRS-netto, vilket gör varje procentjämförelse mot fjolåret meningslös och skickar läsaren till de justerade talen (0,93 miljarder, 0,37 per aktie). Oljepriset skrev 2026 års kapitalhistoria åt bolaget; rappdagen visar vad bolaget gör med den.

## Urvalet: varför Equinor är nästa paket i serien

Könoten från Shell-paketet listar tre kvarvarande kandidater: Equinor 28/10 (ny källinsamling krävs), MTG 5/11 och Nvidia 17/11. Verizon togs av syskonbygge i samma omgång som detta paket byggs i (deras klaim på disk 20:46, deras leverans landad på disk före denna byggnad — deras yta orörd här). Equinor är tidigaste återstående rappdagen och objektet vars hinder seriens urvalsregel beskriver exakt: i Eli Lilly-paketet dokumenterades gallringen — universumposten bär fyra dokumenterade avvikelser över 15 procent mellan källorna, och USD-rapportering mot NOK-notering förstorar mätosäkerheten — och i Shell-paketet formulerades ägandet: den som gör den nya primärinsamlingen äger objektet. Detta paket gör den insamlingen: fyra kvartalsrapporter (Q3-2025 till Q2-2026), årsredovisningen 2025, kapitalmarknadsdagen juni 2026, återköps- och utdelningsmeddelanden, aktieantalet och NOK-fixingen — samtliga sökverifierade 2026-09-21 med källor och datum i källförteckningen.

Datumklassen redovisas ärligt, som alltid: bolagets egen utlysning av Q3-2026 fanns inte publicerad vid paketets byggtid; tyngden ligger på tredjepartskonfirmans (Public.com och Investing.com bokar onsdagen 28 oktober; MarketBeat estimerar samma dag på historisk rytm; fjolårets Q3 kom 28 oktober 2025) och bolagets IR-sida som vid septemberhämtningen bar sidan för årets Q3-analystkonferens; grenkalendern (2026-09-15) bokar fönstret med noten estimerat. Klassen är konfirmerat-tredjepart — kommer bolagets utlysning med annat datum är det nya rader i det öppna kvittot, inget annat. Det blir energigrenens nionde paket, efter Fortum, Iberdrola, RWE, Vår Energi, Aker BP, Norsk Hydro, Yara och Shell — och grenens största norska bolag: statlig majoritetsägare, hela kedjan från reserv till kund på kontinentalsockeln, och rapportvaluta som inte är noteringsvaluta. Precis den sista spänningen är paketets källkritiska hjärta.

## Nyckeltalen att ha med sig — AKM2:s fyra dimensioner, energiutgåvan

**Tillväxt.** Omsättningsserien 2022–2025 löper 150,806 → 107,174 → 103,774 → 106,462 miljarder dollar — normaliseringen efter 2022 års energitopp, exakt de fyra talen i årsredovisningen (se datavaktens prov 2). [Femårskurvan](/dataset/energi/omsattning-cagr-5ar) säger −10,96 procent per år (grenens median ${minus(M.omsCagr.med * 100, 2)}) och [resultatkurvan](/dataset/energi/resultat-cagr-5ar) −44,02 (median ${minus(M.resCagr.med * 100, 2)}) — medan [rullande tolvmånader](/dataset/energi/omsattningstillvaxt-ttm) står i plus 37,4 mot medianen +11,6 och [prognosfältet](/dataset/energi/prognos-tillvaxt) säger −21,81. Tre fält, tre tecken — Shell-paketets teckenkollision i norsk utgåva, och samma läxa: i en cykelbransch mäter varje fönster en annan värld. Den fysiska sidan av tillväxten är produktionen: 2 072 (Q4-2024) → 2 130 (Q3-2025) → 2 198 (Q4-2025) → 2 313 (Q1-2026, rekord) → 2 165 mboe per dag (Q2-2026), med årets guide på plus 3 procent. Volymen består, priset svänger — det är tillväxtens två olika djur.

**Lönsamhet.** [Räntabilitet på eget kapital](/dataset/energi/roe) ${pct(F.roe)} procent — femte högsta av ${M.roe.n} i grenen, väl över medianen ${pct(M.roe.med)}. Men [räntabiliteten på investerat kapital](/dataset/energi/roic) ${pct(F.roic)} procent ligger under medianen ${pct(M.roic.med)} — fjortonde av ${M.roic.n}. Ordningen är signaturen: ROE över medianen, ROIC under — en balansräkning med skuldkomponent som förvandlar medelgod kapitalräntabilitet till hög ägarräntabilitet (skuldsättningen nedan stänger kedjan). [Bruttomarginalen](/dataset/energi/brutto-marginal) ${pct(F.brutto)} procent ligger praktiskt exakt på grenens median ${pct(M.brutto.med)} — vare sig supermajornas inköpskostnadstyg (Shells 26) eller nätbolagens tjocka marginal; [nettomarginalen](/dataset/energi/netto-marginal) ${pct(F.netto)} procent under medianen ${pct(M.netto.med)}. EBIT-marginalfältet ${pct(F.ebit)} procent (${M.ebit.rang} av ${M.ebit.n} i grenen) håller inte för kedjekontroll och redovisas öppet som sådant i datavaktens prov 3.

**Stabilitet.** [Skuld per eget kapital](/dataset/energi/skuldsattning) ${num(F.skuldEk, 4)} mot medianen ${num(M.skuldEk.med, 4)} — över medianen, alltså tungre balansräkning än grenens mitt, och exakt den mekanism som förklarar ROE/ROIC-ordningen ovan. Nettoskulden mätt som andel sysselsatt kapital har trappan: 12,2 procent (Q3-2025) → 17,8 (Q4-2025) → 15,3 (Q1-2026) → 10,4 (Q2-2026) — fjolårets höjdpunkt på 17,8 följt av två kvartal med fall på sammanlagt 7,4 procentenheter, och bolagets egen förväntan redovisad i Q2-rapporten: under 10 procent vid årsskiftet vid oförändrade terminspriser. Räntetäckningsfältet är null hos källan och redovisas öppet som sådant.

**Återkoppling.** Utdelningen höjdes i februari från 0,37 till 0,39 dollar per kvartal — plus ${pct(BER.hojningProcent, 1)} procent, beslutad med Q4-rapporten och bibehållen i Q1 och Q2. I NOK omräknas den med Norges Banks fixing: 0,39 dollar = 3,6882 norska kronor (USD/NOK 9,4568, augusti 2026), årsraden 14,75 kronor — på kursen 419 kronor (18 september) blir direktavkastningen ${pct(BER.direktavkastning)} procent. Därtill återköpsvippan: 5,0 miljarder dollar 2025 (sammanlagt 9 miljarder distribuerat under året), nedsatt till 1,5 miljarder för 2026 vid Q4-rapporten (4 februari), sedan fördubblad till 3,0 miljarder vid kapitalmarknadsdagen 16 juni — med vägledning 2–4 miljarder per år 2027–2030. Programmet löper till 15 januari 2027, tredje tranchen beslutades med Q2-rapporten. Aktieantalet 2,439 miljarder (30 juni) är nere ${pct(Math.abs(P.aktier.deltaAr), 1)} procent på ett år — återköpsmotorn synlig i ett enda tal.

**Värdering.** [P/E](/dataset/energi/pe) ${num(F.pe, 3)} — femte lägsta av ${M.pe.n} mot medianen ${num(M.pe.med)}, billig sidan men ej supermajornas botten (Shell 10,3). [Pris per bokfört kapital](/dataset/energi/pb) ${num(F.pb, 3)} — trettonde av ${M.pb.n}, strax ÖVER medianen ${num(M.pb.med, 4)}: Shells spegel, där P/B låg i botten. [EV/EBIT-fältet](/dataset/energi/ev-ebit) ${num(F.evEbit)} redovisas som icke-bärande — nittonde av ${M.evEbit.n} (fjärde högsta i grenen), och datavaktens prov 3 visar varför. [PEG](/dataset/energi/peg): källans 1,13 mot konventionens ${num(BER.pegKonvention, 3)} (P/E delat med prognostillväxtens belopp) — kvot ${num(BER.pegKvot)}, och skillnaden är prognosfältets minustecken: PEG på negativ tillväxt är avstängt territorium (Chevron- och Yara-klassens konvention). [Fri kassaflödesavkastning](/dataset/energi/fcf-avkastning) fältets ${pct(F.fcfYield)} procent håller inte heller — Q2 ensamt genererade 5,5 miljarder dollar i kassaflöde före distributioner, en årsfart av 22 miljarder mot ett börsvärde kring 100,7: fältet redovisas, tolkningen läggs i datvakten.

Och läsarten: ett E&P-kvartal läses i tre komponenter — volym, pris, kostnad. Volymen står i produktionsraden (2 165 mboe/d i Q2, plus 4 procent år mot år) och består mellan kvartal; priset står i gas- och oljesegmenten och mean-reverterar; kostnaden står i driftskostnad och kapex (organisk kapex 3,35 miljarder i Q2, helårsguide 13). Q3:s första läsning är därför alltid produktionsraden mot fjolårets 2 130 och guidens plus 3 — först sedan pris och engångsposter sorteras bort kan resultatet tolkas.

## Datavakten — fem prov på en rad som gallrats två gånger

**Prov 1: identitetstestet.** P/B dividerat med ROE ska ge P/E: ${num(F.pb, 3)} ÷ ${num(F.roe, 4)} = ${num(BER.identPbRoe, 3)} mot fältets ${num(F.pe, 3)} — gap ${pct(BER.identGap, 1)} procent. Radens inre kedja håller: kurs, bokfört kapital och räntabilitet är samma värld.

**Prov 2: seriernas exakthet.** Universumradens fyra intäktsår — 150,806, 107,174, 103,774 och 106,462 miljarder dollar — överensstämmer siffra för siffra med årsredovisningens rad för totala intäkter: avvikelse 0,0 procent. Resultatseriens 5,043 för 2025 mot årsredovisningens IFRS-netto 5,058: gap 0,3 procent (minoritetsandelen förklarar resten). Radens ryggrad — historiken som alla CAGR-fält bygger på — håller alltså fullt ut. Det är inte raden som är felaktig; det är vissa härledda fält.

**Prov 3: valutaläxan — två fält faller, tre håller.** Bolaget rapporterar i dollar, noteringen sker i kronor, och utdelningskonverteringen visar bryggan: 0,39 dollar blir 3,6882 kronor till kursen 9,4568. Blanda sidorna i en härledning så sprängs multiplarna. Fallet först: EV/EBIT-fältet ${num(F.evEbit)} implicerar — även om nettoskulden vore noll och företagsvärdet lika med börsvärdet 100,7 miljarder dollar — en EBIT på högst ${num(BER.ebitImplodedMax)} miljarder dollar; bolagets faktiska rullande rörelseresultat de fyra senaste kvartalen är 5,27 + 5,49 + 8,78 + 12,99 = ${num(BER.ttmNettoOp)} miljarder. Fältet faller med över ${pct(BER.evEbitGap, 0)} procent på kedjekontrollen; den kedjade nedre gränsen är ${num(BER.evEbitNedreGrans)}. Samma klass: FCF-avkastningsfältet ${pct(F.fcfYield)} procent, när Q2-kassaflödet före distributioner ensamt var 5,5 miljarder och årsfarten 22 miljarder mot börsvärdets 100,7 — källans fält och bolagets kassarealitet är två olika världar. Mot detta håller: P/E via identitetstestet (prov 1), P/B ${num(F.pb, 3)} mot Morningstars ${num(2.44, 2)} (18 september) — gap 0,7 procent — och aktieantalet: börsvärde 952,194 miljarder kronor ÷ kurs 401,20 = ${num(BER.aktierUrMcap, 4)} miljarder aktier mot det oberoende räknade 2,439 miljarder (30 juni) — gap 2,7 procent, sommarens återköp förklarar skillnaden (en enda dag, 15 juli, köptes 451 747 aktier). Slutsatsen är seriens källkritiska huvudläxa: en datakälla är inte fel eller rätt — den är ett knippe fält, och varje fält bär eller faller på sin egen kedjekontroll.

**Prov 4: teckenkollisionen och förlustbasåret.** Samma rad levererar TTM +37,4 och prognos −21,81 procent — olika fönster i en cykel som svänger (Shell-paketets klass). Men Equinor bär en extra fallgrop: Q3-2025 redovisade minus 0,20 miljarder dollar i IFRS-netto. Varje procentuell jämförelse mot ett förlustbasår är meningslös (Newmont-klassens nollårsläxa) — Q3-2026 läses mot de justerade fjolårstalen 0,93 miljarder och 0,37 per aktie, och mot kvartalets eget pris- och volymsinnehåll.

**Prov 5: aktieantalsmekaniken.** Aktieantalet 2,439 miljarder (30 juni) är ${pct(Math.abs(P.aktier.deltaAr), 1)} procent lägre än för ett år sedan. Mekaniken: en minskning med 7,2 procent ger EPS-lyft 1 ÷ (1 − 0,0723) − 1 = ${pct(BER.aktieEpsLiftAr, 2)} procent per år, utan att verksamheten gjort något. Räkna samma övning på återköpsprogrammets 3,0 miljarder: 3,0 ÷ 100,7 = ${pct(BER.aterkopAndel, 2)} procent av bolaget, EPS-lyft ${pct(BER.aterkopEpsLift, 2)} procent om programmet fullföljs. Två taktometer — det långsamma (aktieantalet år mot år) och det snabba (pågående program) — och båda ska läsas i Q3-rapportens aktieantalstabell.

## Så står sig bolaget mot branschen

| Mått | Equinor | Energigrenens median | Rang |
|---|---|---|---|
| P/E | ${num(F.pe, 3)} | ${num(M.pe.med)} | ${M.pe.rang} av ${M.pe.n} (lägre är billigare) |
| P/B | ${num(F.pb, 3)} | ${num(M.pb.med, 4)} | ${M.pb.rang} av ${M.pb.n} (lägre är billigare) |
| EV/EBIT (källfält, icke-bärande) | ${num(F.evEbit)} | ${num(M.evEbit.med, 3)} | ${M.evEbit.rang} av ${M.evEbit.n} |
| PEG (källfält mot konvention ${num(BER.pegKonvention, 3)}) | ${num(F.peg, 2)} | ${num(M.peg.med, 2)} | ${M.peg.rang} av ${M.peg.n} |
| Fri kassaflödesavkastning (källfält, icke-bärande) | ${pct(F.fcfYield)} % | ${pct(M.fcfYield.med)} % | ${M.fcfYield.rang} av ${M.fcfYield.n} |
| ROE | ${pct(F.roe)} % | ${pct(M.roe.med)} % | ${M.roe.rang} av ${M.roe.n} (högre är bättre) |
| ROIC | ${pct(F.roic)} % | ${pct(M.roic.med)} % | ${M.roic.rang} av ${M.roic.n} (högre är bättre) |
| Bruttomarginal | ${pct(F.brutto)} % | ${pct(M.brutto.med)} % | ${M.brutto.rang} av ${M.brutto.n} |
| Skuld/EK | ${num(F.skuldEk, 4)} | ${num(M.skuldEk.med, 4)} | ${M.skuldEk.rang} av ${M.skuldEk.n} (lägre är lägre risk) |
| Omsättningstillväxt TTM | +${pct(F.ttm, 1)} % | +${pct(M.ttm.med, 1)} % | ${M.ttm.rang} av ${M.ttm.n} (högre är bättre) |

Medianer och rang omräknade 2026-09-21 ur bolagsuniversumet: energigrenen ${E.length} bolag, n ${M.peg.n}–${M.pb.n} per mått där fält saknas — den fulla [universumjämförelsen](/dataset/energi/universumjamforelse) visar varje måtts fält. Jämförelseklassen: olje- och gaskollegorna Shell, Chevron, ExxonMobil, TotalEnergies, BP, ConocoPhillips, Aker BP och Vår Energi; el- och förnybartsidan Iberdrola, RWE, Fortum, Enel, Ørsted, Vestas och Neste; servicesidan SLB och Subsea; samt DNO, Petrobras, Canadian Natural och Reliance. Profil i en rad: vinstmultipeln på billig sidan, bokvalörsmultipeln strax över median, ägarräntabiliteten i toppskiktet medan kapitalräntabiliteten ligger under medianen — och två källfält (EV/EBIT, FCF-avkastning) som bär varningens flagg från prov 3 och ska läsas med det.

## Tre sätt att läsa utfallet — övningar i metod

**Övning 1: återköpsvippan som fördelningsekvation.** Årsraden till aktieägarna: utdelning 4 × 0,39 × 2,439 = ${num(BER.utdelningArMdr, 3)} miljarder plus återköp 3,0 miljarder = ${num(BER.distributionerArMdr, 3)} miljarder — ${pct(BER.distributionAndelAvKapex, 1)} procent av kapexguiden på 13 miljarder. Q2-kassaflödets årsfart 22 miljarder täcker kapex och distributioner sammanlagt ${num(BER.kapexPlusDistributioner, 1)} med marginal. Övningen: räkna om raden på halverat kassaflöde (11 miljarder) och finn brytpunkten — vilken av de tre raderna (kapex, utdelning, återköp) ger med sig först? Samma ekvation bolagets styrelse räknar när vippans nästa läge bestäms; metoden är att ställa och kvantifiera frågan, inte att besvara den åt någon.

**Övning 2: nettoskuldtrappan mot tröskeln.** Trappan 17,8 → 15,3 → 10,4 procent på tre kvartal, och tröskeln under 10 vid årsskiftet (vid oförändrade terminspriser — bolagets eget förbehåll). Övningen: läs Q3-siffran mot trappans två drivkrafter — kassaflöde och kapex — och skilj den som kommer från pris (mean-reverterar) från den som kommer från beslut (består). En trappa som faller på beslut är värd mer än en som faller på pris, och tvärtom för risken när den vänder.

**Övning 3: förlustbasårets procentläxa.** Om Q3-2026 redovisar IFRS-netto på, säg, 2,0 miljarder dollar — vilken "tillväxt" visar jämförelsen mot fjolårets minus 0,20? Ingen alls: procent mot förlustbas är avstängd aritmetik. Jämförelsetalen är de justerade 0,93 miljarder och 0,37 per aktie (Q2:s justerade 1,33 per aktie visar nivån under 2026), och produktions- och prisraderna visar varför. Samma läxa i multipln: PEG-fältet 1,13 implicerar tillväxt ${num(F.pe / F.peg, 1)} procent per år, prognosfältet säger −21,81 — fönstrets val avgör svaret, och därför redovisas båda öppet.

## Praktiskt inför 28 oktober

Publiceringen väntas med beslut om tredje interim utdelningen för 2026; datumklassen tredjepartskonfirmerad (egen utlysning ej publicerad vid byggtid). Fem saker på checklistan: (1) återköpsprogrammets tredje tranch — 3,0-miljardersprogrammet löper till 15 januari 2027, och tranchutfall per landnotering redovisas löpande; (2) organisk kapex — guiden 13 miljarder för 2026, oförändrad eller justerad; (3) nettoskuldtrappan mot tröskeln under 10 procent; (4) produktionen mot guidens plus 3 procent och fjolårets 2 130 mboe per dag; (5) utdelningen — 0,39 dollar vore fjärde kvartalet i rad på nivån, och frågan är oförändrad eller nästa steg. Allt i detta paket är utbildning om hur en delårsrapport läses — inte investeringsrådgivning; enligt lagen (2007:528) om värdepappersrörelse 2 kap 5 § är utbildning tillåtet, rådgivning kräver tillstånd.

## Källor

- Rappdag: Public.com och Investing.com bokar onsdagen 28 oktober 2026; MarketBeat estimerar samma dag på historisk rytm; fjolårets Q3 redovisades 28 oktober 2025; bolagets IR-sida bar Q3-analystkonferens-sidan vid septemberhämtningen (sökverifierad 2026-09-21; internt: grenkalender kalender-energi.json, 2026-09-15, noten estimerat).
- Universumraden: bolagsuniversumets datainsamling för EQNR.OL 2026-09-03 (Yahoo Finance quoteSummary-moduler; MarketStack eod/latest dubbelkoll, slutkurs 2026-09-02) — internt: data/portfolj-system/bolagsunivers.json. Gallringsdokumentation: Eli Lilly-paketets urvalssektion (fyra dokumenterade avvikelser över 15 procent mellan källorna; USD-rapportering mot NOK-notering) och Shell-paketets könot (ägandet av den nya primärinsamlingen). Medianer och rang omräknade 2026-09-21 ur samma fil: energigrenen ${E.length} bolag.
- Ny primärinsamling sökverifierad 2026-09-21 mot bolagets egna rapportmeddelanden och nyhetsförmedling: Q2-2026 (2026-07-22): justerat rörelseresultat 11,48 mdr USD (fjolåret 6,53), justerad vinst 3,22 mdr, justerad EPS 1,33 mot konsensus 1,39, IFRS-netto 4,84 mdr (+267 % år mot år; baskvartalet härlett 1,32 ur förhållandet), rörelseresultat 12,993 mdr, kassaflöde före distributioner 5,5 mdr, organisk kapex 3,35, produktion 2 165 mboe/d (+4 %), nettoskuld 10,4 % mot 15,3 %, utdelning 0,39, tredje återköpstranchen. Q1-2026 (2026-05-05): rörelseresultat 8,78, netto 3,10, justerat 3,70, rekordproduktion 2 313 (+9 % mot 2 123). Q4-2025 (2026-02-03): rörelseresultat 5,49, netto 1,31, justerat 2,04, produktion 2 198 (+6 % mot 2 072), nettoskuld 17,8 % mot 12,2 %. Q3-2025 (2025-10-28): rörelseresultat 5,27, IFRS-netto −0,20, justerat 0,93 (EPS 0,37), justerat rörelseresultat 6,21, produktion 2 130 (+7 %), nettoskuld 12,2 %.
- Årsredovisning 2025 (2026-03-19): totala intäkter 106 462 MUSD (2024: 103 774; 2023: 107 174; 2022: 150 806), rörelseresultat 25 352, IFRS-netto 5 058, justerat rörelseresultat 27,6 mdr, justerad vinst 6,43 mdr, 9 mdr USD distribuerat under 2025.
- Kapitalåterföring: Q4-rapporten (2026-02-04): utdelning höjd 0,37 → 0,39 (+5,4 %), återköp 2026 upp till 1,5 mdr USD (programfönster 2026-02-13 → 2027-01-15; 2025 års program upp till 5,0 mdr); tranch 2 upp till 375 MUSD efter stämman 2026-05-12; kapitalmarknadsdagen (2026-06-16): återköp upp till 3,0 mdr USD 2026, vägledning 2–4 mdr/år 2027–2030, ~30 % av kapex till internationell E&P; dagligt återköp (SEC 6-K, 2026-07-15): 451 747 aktier à 351,9662 NOK.
- Aktieantal och kurs: Macrotrends 2,439 mdr aktier (2026-06-30, −7,23 % år mot år; Macroaxis senare ~2,37); Morningstar NOK 419,00 och P/B 2,44 (2026-09-18); NOK-fixing: Q1-utdelningen 0,39 USD = 3,6882 NOK till USD/NOK 9,4568 (Norges Banks medelfixing, 2026-08-20).
- Korsreferenser i serien: Shell-paketet (supermajor-spegeln och teckenkollisionens klass), Aker BP- och Vår Energi-paketen (Nordsjö-grannarna), Eli Lilly-paketet (gallringsdokumentationen), Alphabet-paketet (källdivergensens huvudläxa), Newmont-paketet (förlustbasårets nollårsklass).
- Datavakt och aritmetikmotor: verktyg/_s4u1-eqnr-kvd.mjs — samtliga beräkningar i paketet omräknade maskinellt vid leverans.

*Detta läspaket är utbildningsmaterial i hur en delårsrapport läses och räknas — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar eller bolagets egna resultatmeddelanden med källa och datum angivna; där en källa saknar data står det explicit, och där ett källfält håller inte för kontrollräkning redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

const paket = {
  slug,
  title,
  description,
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: P.rappdag,
  readingMinutes: 5,
  tags: ['kvartalsrapport', 'Equinor', 'energi', 'olja', 'återköp', 'källkritik', 'läspaket'],
  body
};

writeFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-eqnr-q3-2026.json', JSON.stringify(paket, null, 1) + '\n');
const ord = (body.match(/[A-Za-zÅÄÖåäö]+/g) || []).length;
console.log(`PAKET SKRIVET: ${slug}.json`);
console.log(`Ord (body): ${ord} · tecken: ${body.length}`);
console.log(`Serieordinal: ${ordinal} · grenens nionde · energigrenen ${E.length} bolag`);
console.log(`Universum-md5: ${univMd5}`);
console.log(`Medianer: pe ${num(M.pe.med, 4)} pb ${num(M.pb.med, 4)} evEbit ${num(M.evEbit.med, 3)} peg ${num(M.peg.med, 3)} roe ${pct(M.roe.med)} roic ${pct(M.roic.med)} brutto ${pct(M.brutto.med)} netto ${pct(M.netto.med)} skuldEk ${num(M.skuldEk.med, 4)} ttm ${pct(M.ttm.med, 1)} fcf ${pct(M.fcfYield.med)}`);
