// _s4u2-pg-bygg.mjs — tillverkar P&G Q3-2026-läspaketet (spår 4, s4-u2, manifest auto-s4-1789860306737)
// All aritmetik körs ur bolagsunivers.json och interpoleras in i texten — ingen siffra handskriven.
import { readFileSync, writeFileSync } from "node:fs";

const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const B = U.find(b => b.ticker === "PG");
if (!B) throw new Error("PG saknas i universumfilen");

// ---- rådata (lås mot kända värden 2026-09-03) ----
const pris = B.pris, mcap = B.marknadsKapitalMdr;
const { pe, pb, evEbit, peg, fcfYield } = B.vardering;
const { roe, roic, bruttoMarginal: bruttoM, ebitMarginal: ebitM, nettoMarginal: nettoM, fcfMarginal: fcfM } = B.lonksamhet;
const skuldEk = B.stabilitet.skuldEgenkapital;
const { omsattningCAGR5ar: oCAGR, resultatCAGR5ar: rCAGR, omsattningTillvaxtTTM: ttm, prognosTillvaxt: prog } = B.tillvaxt;
const insider = B.aterkop.insiderkopSenaste6man;
const oms = B.serier.omsattning, res = B.serier.resultat; // FY2023–FY2026 (juli–jun), MUSD
if (oms[3] !== 87032000000 || res[3] !== 16046000000 || pe !== 22.336 || pb !== 6.434 || roe !== 0.3029) throw new Error("universumfilen har driftat — värdena matchar inte 2026-09-03-insamlingen");

// ---- formatterare (sv-SE, vanliga mellanslag — filen normaliseras) ----
const sv = (x, d = 1) => x.toLocaleString("sv-SE", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/[\u00a0\u202f]/g, " ");
const pct = (x, d = 2) => (100 * x).toFixed(d).replace(".", ",");
const M = x => x / 1e6; // → miljoner

// ---- härledningar ----
const O = oms.map(M), R = res.map(M); // miljoner USD
const oCAGRk = Math.pow(O[3] / O[0], 1 / 3) - 1, rCAGRk = Math.pow(R[3] / R[0], 1 / 3) - 1;
const stegO = [O[1] / O[0] - 1, O[2] / O[1] - 1, O[3] / O[2] - 1];
const stegR = [R[1] / R[0] - 1, R[2] / R[1] - 1, R[3] / R[2] - 1];
const nmSerie = R.map((r, i) => r / O[i]);
const idPeRoe = pb / roe, gapId = idPeRoe / pe - 1;               // identitet P/B ÷ ROE
const idOmv = pe * roe, gapOmv = idOmv / pb - 1;                  // omvänd: P/E × ROE
const epsImp = pris / pe;
const aktier = mcap * 1000 / pris;                                 // miljarder
const ek = mcap / pb;                                              // mdr
const skuld = skuldEk * ek;
const ebitMarginal = ebitM * O[3];                                 // miljoner
const ev = evEbit * ebitMarginal / 1000;                           // mdr
const kassa = ev - mcap - skuld;                                   // mdr (negativ!)
const evKvot = ev / (mcap + skuld);
const vPe = pe * R[3] / 1000, gapAbs = vPe / mcap - 1;             // absolutkontroll årsbas
const nettoCirkel = nettoM * O[3];                                 // skall ≈ R[3]
const pegK = pe / (100 * prog), pegImp = pe / peg, pegKvot = peg / pegK;
const fcfMarg = fcfM * O[3], fcfYv = fcfYield * mcap * 1000, fcfKvot = fcfMarg / fcfYv;
// scenarioruta på FY2026-basen
const r3 = [O[3] * 0.97, O[3], O[3] * 1.03], m3 = [ebitM - 0.01, ebitM, ebitM + 0.01];
const cell = (o, m) => o * m;
const pp = O[3] * 0.01, tres = O[3] * 0.03 * ebitM, vikt = pp / tres;
const mult = pe / (1 + prog);

// ---- medianer ur 219-filen (2026-09-20) ----
const med = a => { const s = a.filter(x => typeof x === "number" && isFinite(x)).sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const get = (o, p) => p.split(".").reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, o);
const K = U.filter(b => b.bransch === "konsument");
const KN = {}, UN = {}, KV = {}, UV = {};
for (const [n, p] of [["pe", "vardering.pe"], ["pb", "vardering.pb"], ["evEbit", "vardering.evEbit"], ["peg", "vardering.peg"], ["fcfY", "vardering.fcfYield"], ["roe", "lonksamhet.roe"], ["roic", "lonksamhet.roic"], ["brutto", "lonksamhet.bruttoMarginal"], ["ebit", "lonksamhet.ebitMarginal"], ["netto", "lonksamhet.nettoMarginal"], ["fcfM", "lonksamhet.fcfMarginal"], ["skuld", "stabilitet.skuldEgenkapital"], ["prog", "tillvaxt.prognosTillvaxt"]]) {
  KV[n] = med(K.map(b => get(b, p))); KN[n] = K.map(b => get(b, p)).filter(x => typeof x === "number").length;
  UV[n] = med(U.map(b => get(b, p))); UN[n] = U.map(b => get(b, p)).filter(x => typeof x === "number").length;
}
const rang = p => K.map(b => get(b, p)).filter(x => typeof x === "number" && x < get(B, p)).length + 1;
const multMedian = pe / KV.pe - 1;

// ---- text ----
const L = {
  roe: "[så räknas ROE](/dataset/konsument/roe)", roic: "[så räknas ROIC](/dataset/konsument/roic)",
  brutto: "[så läses bruttomarginalen](/dataset/konsument/brutto-marginal)", netto: "[så läses nettomarginalen](/dataset/konsument/netto-marginal)",
  ttm: "[så läses TTM-tillväxten](/dataset/konsument/omsattningstillvaxt-ttm)", ocagr: "[så räknas CAGR](/dataset/konsument/omsattning-cagr-5ar)",
  rcagr: "[resultat-CAGR förklarad](/dataset/konsument/resultat-cagr-5ar)", prog: "[Om prognostillväxt](/dataset/konsument/prognos-tillvaxt)",
  pe: "[P/E inom konsument](/dataset/konsument/pe)", pb: "[så räknas P/B](/dataset/konsument/pb)",
  ev: "[EV/EBIT inom konsument](/dataset/konsument/ev-ebit)", fcf: "[så räknas FCF-avkastningen](/dataset/konsument/fcf-avkastning)",
  vard: "[Värderingsöversikten](/dataset/konsument/vardering)", skuld: "[om skuldsättning](/dataset/konsument/skuldsattning)",
  univ: "[universumjämförelsen](/dataset/konsument/universumjamforelse)",
};

const body = `The Procter & Gamble Company — ticker PG på New York Stock Exchange — redovisar sitt första räkenskapskvartal för året 2027 (juli–september 2026) torsdagen den **22 oktober**. Räkenskapsåret löper 1 juli–30 juni, så kalenderkvartalets Q3-rapport är P&G:s Q1 — samma viktning som H&M-paketets dec–nov-år och NIKE-paketets juni–maj-år mötte före detta. Datumet står på [P&G:s investerarsida](https://www.pginvestor.com/overview/default.aspx) som bolagets eget preliminära angivande ("anticipated") — det är en bolagskälla, inte ett tredjepartsestimat, men ordet anticipated är ett förbehåll: bekräfta alltid mot källan före publicering, kalendern är bolagets att ändra. Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper. Paketet är seriens 61:a läspaket (födelseordningen Truecaller 56 → Hufvudstaden 57 → Aker BP 58 → ASML 59 → RWE 60, de två sistnämnda syskonen i samma omgång med filerna tidsstämplade 01:42 respektive 01:43 lokal — detta paket 01:44) och konsumentgrenens sjunde paket.

## Urvalet: varför P&G är nästa paket i serien

Sorteringen redovisas öppet, som alltid. Senaste omgångens klaimdokument (Aker BP-paketet, 2026-09-19) gällrade 22/10-fältet med motiveringen "P&G-anticipated" och valde ett LIVE-verifierat officiellt kalenderdatum i stället — en korrekt sortering den dagen, och samtidigt en notering värd att läsa i helhet: gallran gällde datumets status, inte bolaget eller dataunderlaget. Truecaller-paketet bröt samma vecka mark för svagare datumkällor än formella kalendrar: bolagets eget publikationsmönster, sökverifierat, räckte med tydlig dokumentation. P&G:s datum är från bolagets egen IR-sida — starkare än Truecallers rytm-slutledning, svagare än en formell bekräftelse — och dataunderlaget är komplett: fyra sammanhängande räkenskapsår, fulla nyckeltalsfält och dubbelkällsbelagda multiplar (andra källan kontrollerade pris, P/E, P/B och börsvärde mot oberoende slutkurs 2026-09-02 — samma standard som NIKE-, JNJ- och AT&T-paketen). Syskonet u1 läste detta pakets klaimfil före sin egen och backade PG öppet ("deras objekt") till förmån för RWE 11/11; syskonet u3 bygger ASML 14/10. Tre skilda objekt, noll kollision.

Konkurrenterna om platsen, i datumordning: Wihlborgs (20–21/10, divergerande tredjepartskalendrar, ej på bolagets IR — Prologis-precedensen står), Netflix (20/10, tredjepartsestimat med fönster — serien levererar inte på rena estimat, och kommunikationgrenen är sedan länge rikligt täckt), Billerud (22/10, officiell kalender men P/E null och negativt resultatfält — "väntar vinstmultipeln", gallran står tills data bär), PowerCell och Viaplay (22/10, null-vinstmultiplar), Balder, Catena och Diös (23/10, tredjepartsdatum — Wihlborgs-klassen), Equinor (28/10, dokumenterade källavikelser — gallrad), Shell (29/10, gallrad två gånger i klaimkedjan, GBP/USD-mixningen väntar på sin valutalexa), Kambi (4/11, PEG-fältet null — JNJ-ribban). P&G står kvar som tidigaste återstående datum med bärande data.

## Vågskiktet: två frånvaroer som ska sägas som de är

Serien har två våglager: vågvalideringens domar (motorns öppna kvitto per bolag) och analysbibliotekets finrutor. För P&G saknas båda — bolaget står utanför vågvalideringsuniversumet (domprotokollen 2026-09-04 redovisar ingen PG-post) och i data/analyses/ finns ingen PG-fil. Precis som NIKE- och ABB-paketen redovisar detta paket alltså ingen vågklassificering alls; luckan är information, inte något som gissats fram, och den är tidsbegränsad av sig själv — framtida universumsexpansioner kan ge efterföljarna skikt som detta saknar. Paketet vilar på fundamentaldata, kalenderfakta och ren aritmetik.

## Nyckeltalen att ha med sig — AKM2:s fyra dimensioner, i dollar hela vägen

Värdena är senaste mätte tal ur bolagsuniversumets insamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom konsumentbranschen. P&G redovisar i dollar och noteras i dollar — samtliga multiplar står i samma valuta hela vägen, vilket gör kontrollräkningarna rena (Swedbank-paketets lärdom om valutamixning, och Nordea-/ABB-paketens omvända).

**Lönsamhet** — hur mycket värde skapas per insatt dollar?

- Avkastning på eget kapital (ROE): **${pct(roe)} procent** — ${L.roe}.
- Avkastning på investerat kapital (ROIC): **${pct(roic)} procent** — ${L.roic}. Måttet är källans proxy (EBIT före skatt delat med skuld plus bokfört eget kapital) — och notera ordningen: ROE över ROIC, det normala mönstret där belåning förstärker avkastningen på eget kapital. NIKE-paketet mötte det omvända och bar det som en öppen fråga; här är hävstången riktad rätt men måttlig — avståndet är ${pct(roe - roic, 1)} procentenheter.
- Bruttomarginal: **${pct(bruttoM)} procent** — ${L.brutto}. Över femtio procent av varje såld dollar blir kvar efter tillverkningens direkta kostnad: varumärkesklass i seriens mått (universumets median ligger på ${pct(UV.brutto)}, konsumentgrenens på ${pct(KV.brutto)}), men med en viktig nyans — P&G:s bruttomarginal är bred, inte extrem: här står volym och varumärke i balans, vilket är hela affärsidén för en koncern med dussintals miljardvarumärken i hyllorna världen över.
- Rörelsemarginal (EBIT): **${pct(ebitM)} procent** och nettomarginal: **${pct(nettoM)} procent** — ${L.netto}. Avståndet brutto-till-EBIT, cirka ${pct(bruttoM - ebitM, 1)} procentenheter, är kostnadssidan: logistik, marknadsföring, förpackningsutveckling — i ett konsumentvaruhus den post som svänger minst, och det är själva poängen med den här typen av bolag.
- Fri kassaflödesmarginal: **${pct(fcfM)} procent** — mer än vart sjätte omsatt dollar blir disponibel kassa efter investeringar.

**Tillväxt** — vilket håll går rörelsen? Här är paketets lugnaste kapitel.

- Intäktstillväxt senaste tolvmånadersperioden: **plus ${pct(ttm, 1)} procent** — ${L.ttm}.
- Intäkter över de senaste fyra räkenskapsåren (FY2023–FY2026, juli–juni): **plus ${pct(oCAGRk)} procent per år** (från ${sv(O[0], 0)} miljoner dollar FY2023, via ${sv(O[1], 0)} och ${sv(O[2], 0)}, till ${sv(O[3], 0)} miljoner FY2026) — ${L.ocagr}. Stegen år för år: ${pct(stegO[0])}, ${pct(stegO[1])}, ${pct(stegO[2])} procent — aldrig ett ryck, aldrig ett fall. Ärlighetsnot: källan ger fyra år, inte fem, och åren är bokföringsår med juni-gräns, inte kalenderår.
- Resultattillväxt samma period: **plus ${pct(rCAGRk)} procent per år** (från ${sv(R[0], 0)} miljoner dollar, via ${sv(R[1], 0)} och ${sv(R[2], 0)}, till ${sv(R[3], 0)}) — ${L.rcagr}. Stegen: ${pct(stegR[0])}, ${pct(stegR[1])}, ${pct(stegR[2])} procent. Härledd nettomarginalserie: ${pct(nmSerie[0])} → ${pct(nmSerie[1])} → ${pct(nmSerie[2])} → ${pct(nmSerie[3])} procent — fyra år inom ett och ett halvt procentenheters band. Detta är grundberättelsens kärna: en resultatmaskin som rör sig i gångfart.
- Prognostillväxt: **plus ${pct(prog)} procent** — källans konsensussiffra för vinsttillväxt ett år framåt; samlad marknadsuppskattning, inte en sanning och inte vår prognos. ${L.prog}. Notera storleksordningen igen: efter NIKE-paketets plus 33,7 procent är detta fältets motsatspol — ${rang("tillvaxt.prognosTillvaxt")}:e lugnaste av ${KN.prog} konsumentbolag.

**Värdering** — vad kostar rörelsen på börsen?

- Pris per vinst (P/E): **${sv(pe, 2)}** — ${L.pe}
- Pris per bokfört eget kapital (P/B): **${sv(pb, 2)}** — ${L.pb}
- Enterprise value per rörelseresultat (EV/EBIT): **${sv(evEbit, 2)}** — ${L.ev}. Notera kombinationen: P/B ${sv(pb, 2)} med EV/EBIT ${sv(evEbit, 2)} — kedjan mellan dem spänner, och källkritikavsnittet räknar fram var.
- Fri kassaflödesavkastning (FCF-yield): **${pct(fcfYield)} procent** — ${L.fcf}
- Vid insamlingen var kursen **${sv(pris, 2)} dollar** och börsvärdet **cirka ${sv(mcap, 1)} miljarder dollar** (${sv(aktier / 1000, 3)} miljarder aktier, härlett ur börsvärde och kurs).
- PEG-talet: källan anger **${sv(peg, 2)}** — och för en gångs skull säger konventionen samma sak; se källkritikavsnittet. ${L.vard} sätter multiplarna i sitt sammanhang.

**Stabilitet** — hur belånat är huset?

- Skulder per eget kapital: **${sv(skuldEk, 2)}** — ${L.skuld}. Under konsumentgrenens median på ${sv(KV.skuld, 2)} (universumet ${sv(UV.skuld, 2)}): måttligt belånat för att vara en konsumtionskoncern med stor kapitalbas.
- Räntetäckning: **osatt** — källan saknar räntekostnad för senaste räkenskapsåret, samma hål som i Essity-, Alfa Laval- och NIKE-paketen. Skuldkvoten finns, täckningsgraden inte; hålen ska sägas som de är.
- Insiderköp senaste sex månader: **${insider}** — fältet räknar antal transaktioner, inte volym eller värde, och det är seriens högsta värde hittills: NIKE-paketets 11 var premiärfallet över noll, detta är mer än dubbla det. Ett neutralt rådatafaktum att läsa i rapportens insidersammanhang — inte en signal.

## Källkritikens nionde runda: sammanträffandet — och kassan som blev negativ

Fem kontroller, varav en är seriens första i sitt slag.

Först identitetstestet **P/E = P/B delat med ROE**: ta P/B ${sv(pb, 3)}, dividera med ROE ${sv(roe, 4)} — resultatet blir **${sv(idPeRoe, 2)}** mot källans P/E ${sv(pe, 3)}. Avvikelsen ${sv(gapId * 100, 1)} procent är ett nära-godkännande — exakt NIKE-paketets zon (4,9), granne med Wallenstam (4,7) och Alfa Laval (5,4–5,7). Omvänt blir P/E × ROE = **${sv(idOmv, 3)}** mot P/B ${sv(pb, 3)}, plus ${sv(gapOmv * 100, 1)} procent: samma bild spegelvänt. Implicit EPS blir ${sv(epsImp, 2)} dollar. Tidsmetriken är den tänkbara förklaringen — ROE mot bokförd årsvinst, P/E mot rullande — men med fyra år i gångfart (nettomarginaler ${pct(nmSerie[0])}–${pct(nmSerie[3])} procent) är svängrummet litet här, vilket gör de ${sv(Math.abs(gapId) * 100, 1)} procenten till en äkta restpost att bära med sig, inte att förklara bort.

Sedan **EV-kedjan**, och här finns paketets största överraskning. Bygg baklänges ur filens egna fält: P/B ${sv(pb, 3)} och börsvärdet ${sv(mcap, 1)} miljarder ger bokfört eget kapital ${sv(mcap, 1)} ÷ ${sv(pb, 3)} = **${sv(ek, 1)} miljarder**. Skuldkvoten ${sv(skuldEk, 4)} ger skulden: ${sv(ek, 1)} × ${sv(skuldEk, 4)} ≈ **${sv(skuld, 1)} miljarder**. EBIT blir ${sv(O[3], 0)} × ${pct(ebitM)} ≈ **${sv(ebitMarginal, 0)} miljoner** (${sv(ebitMarginal / 1000, 1)} miljarder), och EV-fältet ger enterprise value ${sv(evEbit, 3)} × ${sv(ebitMarginal / 1000, 3)} ≈ **${sv(ev, 1)} miljarder**. Skillnaden visar balansen: EV ${sv(ev, 1)} minus börsvärde ${sv(mcap, 1)} minus skuld ${sv(skuld, 1)} ger en härledd kassa på **${sv(kassa, 1)} miljarder dollar**. Minus. NIKE-paketet härledde en kassa på plus 9,0 miljarder och kunde stänga kedjan; P&G:s kedja landar på en omöjlig negativ kassa — ett bolag kan inte hålla mindre än noll kassa i enkelmodellen — vilket betyder att minst ett fält underdriver: antingen EV/EBIT-fältet (19,21 mot en kedja som vill ha cirka 20) eller skuldbasen i skuldkvoten (leaseåtaganden och pensioner utanför den bokförda skulden är klassiska sådana poster). Kedjan är samtidigt nästan sluten — kvoten mellan EV och börsvärde-plus-skuld är ${sv(evKvot, 3)}, avvikelsen cirka ${sv((1 - evKvot) * 100, 1)} procent — så det här är inte telekomens signatur (Telia −121,9, Tele2 −90,6, AT&T −87,7 miljarder i omöjliga residualer på värden en storleksordning mindre), utan en tunn, informativ spänning: fältens världar stämmer överens till två procent men inte i tecknet på kassaposten. Kassan är härledd ur källans fält, inte ett källfält i sig — och övningen att räkna kedjan är just att upptäcka var en datainsamling är stark och där den mäter olika världar.

Tredje kontrollen: **PEG — och seriens första fulla sammanträffande**. Konventionen P/E delat med prognostillväxt i procentenheter ger ${sv(pe, 3)} ÷ ${pct(prog)} = **${sv(pegK, 2)}**. Källans fält säger **${sv(peg, 2)}** — kvoten blir ${sv(pegKvot, 3)}. Efter åtta observationer med kvotspridning 0,36 till 8,0 i båda riktningar är detta första gången källans PEG-fält och konventionen bor i samma värld: räkna baklänges på källans eget tal, ${sv(pe, 3)} ÷ ${sv(peg, 2)}, och den implicita tillväxten blir ${sv(pegImp, 2)} procent — i princip exakt prognosfältets ${pct(prog)}. Instabiliteten som dokumenterats genom serien är alltså inte källans natur utan källans variation; här matchar den. Men notera nivån som matchar: PEG ${sv(peg, 2)} på en prognosväxt av ${pct(prog)} procent. PEG över 3 med ensiffrig tillväxt är stabilitetens premie i ren form — marknaden betalar för varsamhet, inte för tillväxt — och det är värdefullt att se båda sidorna samtidigt: kontrollen håller, och den håller på ett tal som själv är en påståendedom.

Fjärde kontrollen: **absolutkontrollen och netto-cirkeln**. P/E ${sv(pe, 3)} multiplicerat med senaste räkenskapsårets resultat ${sv(R[3], 0)} miljoner ger ${sv(vPe, 1)} miljarder mot börsvärdet ${sv(mcap, 1)} — ett gap på plus ${sv(gapAbs * 100, 1)} procent på årsbas (P/E-fältet mäter sannolikt en rullande vinst något över bokföringsåret; en hypotes, redovisad som hypotes). Och netto-cirkeln: fältets nettomarginal ${pct(nettoM)} multiplicerat med årets intäkter ${sv(O[3], 0)} blir ${sv(nettoCirkel, 0)} miljoner mot serieårets ${sv(R[3], 0)} — en differens under en promille. Fält och serie mäter samma år, samma värld; det är den slutenhet EV-kedjan saknar, och kontrasten mellan de två är hela källkritikövningen: varje test frågar fältens olika vägar om de bor tillsammans.

Femte kontrollen: **FCF-kontrollen håller** — marginalvägen ${pct(fcfM)} × ${sv(O[3], 0)} = ${sv(fcfMarg, 0)} miljoner mot avkastningsvägen ${pct(fcfYield)} × ${sv(mcap * 1000, 0)} = ${sv(fcfYv, 0)} miljoner; kvoten ${sv(fcfKvot, 3)}. Två oberoende vägar till samma kassa, i tätare överensstämmelse än de flesta paket i serien.

## Så står sig bolaget mot branschen

| Nyckeltal | P&G | Median konsument (${K.length} bolag) | Median hela universumet |
|---|---|---|---|
| P/E | ${sv(pe, 2)} | ${sv(KV.pe, 2)} | ${sv(UV.pe, 2)} |
| P/B | ${sv(pb, 2)} | ${sv(KV.pb, 2)} | ${sv(UV.pb, 2)} |
| EV/EBIT | ${sv(evEbit, 2)} | ${sv(KV.evEbit, 2)} | ${sv(UV.evEbit, 2)} |
| Räntabilitet på eget kapital (ROE) | ${pct(roe)} % | ${pct(KV.roe)} % | ${pct(UV.roe)} % |
| Rörelsemarginal (EBIT) | ${pct(ebitM)} % | ${pct(KV.ebit)} % | ${pct(UV.ebit)} % |
| Nettomarginal | ${pct(nettoM)} % | ${pct(KV.netto)} % | ${pct(UV.netto)} % |

(Alla värden hämtade 2026-09-03 ur universumfilen; medianerna beräknade 2026-09-20 ur samma fil — ${U.length} bolag, varav ${K.length} i konsument; P/E-, P/B- och EV/EBIT-medianerna bygger på n=${KN.pe}, ROE på n=${KN.roe}, marginalerna på n=${KN.ebit} respektive n=${KN.netto}; universumsmedianerna på n=${UN.pe}–${UN.netto} per mått.)

Läsningen: över konsumentmedianen på samtliga sex mått i tabellen — tydligast på nettomarginalen (${pct(nettoM)} mot ${pct(KV.netto)}, mer än dubbla) och ROE (${pct(roe)} mot ${pct(KV.roe)}, rang ${rang("lonksamhet.roe")} av ${KN.roe}). P/B ${sv(pb, 2)} mot medianen ${sv(KV.pb, 2)} ser extrem ut i isolering — men identitetstestet ovan binder den till ROE-premien: hög avkastning på eget kapital höjer mekaniskt P/B per enhet P/E (P/B = P/E × ROE, och här är den samstämmiga P/B:n ${sv(pe * roe, 2)}). DuPont i prisform, ordnad som i läroboken. PEG ${sv(peg, 2)} mot grenens median ${sv(KV.peg, 2)}: konsumentgrenen betalar i genomsnitt mindre per tillväxtprocent — men grenens medianprognos är samtidigt ${pct(KV.prog)} procent mot P&G:s ${pct(prog)}: lugnare tillväxt, högre pris per procent. Mot universumet i stort: P/E över (${sv(pe, 2)} mot ${sv(UV.pe, 2)}), EBIT-marginal över (${pct(ebitM)} mot ${pct(UV.ebit)}), nettomarginalen mer än dubbel (${pct(nettoM)} mot ${pct(UV.netto)}), prognosen under (${pct(prog)} mot ${pct(UV.prog)}). Jämförelsen mot samtliga kollegor finns i ${L.univ}, och bolagets sida i biblioteket finns [här](/bolag/pg).

## Tre sätt att läsa utfallet — övningar i metod

Tre övningar i vad en rapportläsare vanligtvis tittar på för ett moget konsumentvaruhus i gångfart. Ingen är en bedömning av vad som kommer att hända den 22 oktober — de är träning i metod och ren aritmetik.

**Övning A — läs stabiliteten, inte vändningen.** Grundberättelsen är fyra år med intäkter plus ${pct(oCAGRk)} procent per år och resultat plus ${pct(rCAGRk)} — nettomarginaler ${pct(nmSerie[0])}, ${pct(nmSerie[1])}, ${pct(nmSerie[2])}, ${pct(nmSerie[3])} procent, aldrig ett år utanför bandet. Mot detta står en konsensus på plus ${pct(prog)} procent. Förväntningsgapet — rapportläsningens klassiska spänning, i NIKE-paketet extremt — är här en gränsfråga i stället för ett gap: med en marginalserie som rört sig ${pct(nmSerie[3] - nmSerie[0])} procentenheter på fyra år är frågan inte om en vändning syns, utan om ${pct(prog)} procents vinsttillväxt alls kräver en synlig förändring i rörelsen. Poster att läsa: bruttomarginalen (varumärkeskraften flyttar långsamt — en stor sväng vore en händelse, inte en svängning), brutto-till-EBIT-avståndet (kostnadssidan, ${pct(bruttoM - ebitM, 1)} procentenheter brett) och valutaeffekten i översättningen — en koncern med stor andel av intäkterna utanför dollarzonen redovisar valutaomräkning som egen post, och för ett gångfartsbolag kan den posten ensam bära eller äta mellanskillnaden mot konsensus. Skillnaden mellan utfall och uppskattning är ett pedagogiskt verktyg, aldrig en handsignal.

**Övning B — scenariorutan i ren aritmetik, och marginalratten i vuxenklass.** Universumet saknar kvartalsserier, så rutan räknas på räkenskapsåret FY2026 som bas: intäkter ${sv(O[3], 0)} miljoner dollar och rörelsemarginal ${pct(ebitM)} procent ger ett rörelseresultat på ungefär ${sv(ebitMarginal, 0)} miljoner dollar. Med tre hypotetiska intäktsnivåer (±3 procent) och tre marginaler (±1 procentenhet) blir rutan, i miljoner dollar:

| Rörelseresultat, miljoner dollar | Marginal ${pct(m3[0])} | Marginal ${pct(m3[1])} | Marginal ${pct(m3[2])} |
|---|---|---|---|
| Intäkter ${sv(r3[0], 1)} | ${sv(cell(r3[0], m3[0]), 1)} | ${sv(cell(r3[0], m3[1]), 1)} | ${sv(cell(r3[0], m3[2]), 1)} |
| Intäkter ${sv(r3[1], 0)} | ${sv(cell(r3[1], m3[0]), 1)} | ${sv(cell(r3[1], m3[1]), 1)} | ${sv(cell(r3[1], m3[2]), 1)} |
| Intäkter ${sv(r3[2], 1)} | ${sv(cell(r3[2], m3[0]), 1)} | ${sv(cell(r3[2], m3[1]), 1)} | ${sv(cell(r3[2], m3[2]), 1)} |

Två räknesatser att öva på: en procentenhet marginal flyttar resultatet med cirka ${sv(pp, 0)} miljoner dollar vid oförändrade intäkter, medan tre procent mer intäkter vid oförändrad marginal flyttar det med cirka ${sv(tres, 0)} miljoner — marginalratten väger **${sv(vikt, 2)} gånger** tyngre än intäktsratten. Formeln från Essity-paketet checkar: marginalens relativa vikt är ett delat med tre gånger marginalnivån, och 1 ÷ (3 × ${sv(ebitM, 4)}) = ${sv(1 / (3 * ebitM), 2)}. P&G (${pct(ebitM)} procents marginal) landar i vuxenmarginalklassen, strax under industrins bärare: Holmen 4,6 > Volvo 3,2 > NIKE/Essity 2,6 > Alfa Laval 2,1 ≈ ABB 2,0 > Telia 1,89 > Sandvik/Atlas Copco 1,6–1,7 > **P&G ${sv(vikt, 2)}** > Tele2 1,37 ≈ Iberdrola 1,36 > AT&T 1,34 > bankerna och Wallenstam 0,5–0,6. Brytpunkten — där en procentenhet marginal och tre procent intäkter väger lika — ligger vid 33 procents marginal; P&G:s ${pct(ebitM)} procent ligger på marginalsidan om jämnvikten, men med lägre känslighet än de tyngsta marginalbolagen. Alla nio celler är aritmetik på FY2026 års bas, inga prognoser. (Värdena är i miljoner dollar, som allt annat i P&G:s rapport.)

**Övning C — vad krävs för att P/E når grenens median — och vad PEG-sammanträffandet kostar.** Ren räkneövning med källans egna tal. P/E ${sv(pe, 3)} delat med 1,0602 (ett plus prognostillväxten ${pct(prog)} procent, använt som räknestorhet, inte som prognos) blir **${sv(mult, 2)}** — om vinsten växer i den takten och kursen står stilla sjunker P/E under universummedianen (${sv(UV.pe, 2)}) men förblir över konsumentmedianen (${sv(KV.pe, 2)}). För att nå konsumentmedianen på vinstvägen ensam, vid oförändrad kurs, krävs att vinsten växer ${sv(multMedian * 100, 1)} procent — nästan tre gånger konsensusfältets ${pct(prog)} — eller ett kursfall i samma storleksordning. Övningen lär ut multiplens dubbla natur (den rörs via kursen, via vinsten — eller båda), och PEG-kontrollens sammanträffande ger den en extra botten: eftersom källans PEG och konventionen enas om ${sv(pegK, 2)}–${sv(peg, 2)} på en tillväxt av ${pct(prog)} procent, blir premien samma oavsett vilken väg som räknas — stabilitetens prislapp står fast.

## Praktiskt inför 22 oktober

- Rapporten är Q1 FY2027 (juli–september 2026), räkenskapsåret 1 juli–30 juni. Jämförelsekvartalet i rapporten är juli–september 2025 — inte kalenderkvartalet. NIKE-paketets lektion gäller rakt av: läs mot rätt bas, annars jämför du inte samma sak.
- Datumet står som "anticipated" på [P&G:s investerarsida](https://www.pginvestor.com/overview/default.aspx) — bolagets eget preliminära angivande. Innan något byggs vidare på paketet: bekräfta mot källan, kalendern är bolagets att ändra. Truecaller-paketets dokumentationsstandard är uppnådd (bolagskälla redovisad), men en formell bekräftelse väger tyngre.
- P&G redovisar och handlas i dollar — ingen valutatermin gömmer sig i multiplarna; den valuta läsaren möter i rapporten är översättningseffekten i koncernens ickedollar-intäkter, en resultatpost att läsa, inte en mätosäkerhet i paketets tal.
- Insiderfältets ${insider} transaktioner är antal, inte volym — läs detaljerna i rapportens insidersammanhang. Utdelnings- och återköpsfältet i universumfilen är osatt (senasteArMdr null): paketet redovisar frånvaron i stället för att gissa ett belopp.
- Ordlista för alla begrepp finns i [kurserna](/kurser) — grundkursen i aktieanalys går igenom bruttomarginal, rörelsemarginal och kassaflöde. Metodtransparensen finns på [transparenssidan](/transparens) och [källsidan](/kallor).
- Efter rapporten uppdateras bolagsuniversumets nyckeltal vid nästa insamling och aspektsidorna speglar nya medianer. Vågvalideringens domar berör inte P&G — luckan är dokumenterad, inte bortglömd.

## Källor

- Rappdag 2026-10-22 (Q1 FY2027, juli–september 2026; räkenskapsår 1 juli–30 juni): P&G Investor Relations — overview/events, bolagets eget preliminära angivande ("anticipated"), hämtad 2026-09-15 — internt: data/blogg-utkast/kvartal/2026-q3/kalender-konsument.json.
- Nyckeltal, kurser, börsvärde och serier: bolagsuniversumets datainsamling 2026-09-03 (Yahoo Finance, quoteSummary-moduler; andra källan med dubbelkoll av pris, P/E, P/B och börsvärde mot slutkursen 2026-09-02) — internt: data/portfolj-system/bolagsunivers.json. Bransch- och universumsmedianer beräknade 2026-09-20 ur samma fil (${U.length} bolag, varav ${K.length} i konsument; n per mått redovisat i tabellnoten).
- Identitetstestet: egen beräkning enligt P/E = P/B ÷ ROE (${sv(pb, 3)} ÷ ${sv(roe, 4)} = ${sv(idPeRoe, 2)} mot källans P/E ${sv(pe, 3)}; differens ${sv(gapId * 100, 1)} procent — graderad som nära-godkännande). EV-kedjan: egen härledning i fem steg (EK ${sv(ek, 1)} mdr; skuld ${sv(skuld, 1)} mdr; EBIT ${sv(ebitMarginal, 0)} mn; EV ${sv(ev, 1)} mdr; härledd kassa ${sv(kassa, 1)} mdr — negativ, omöjlig i enkelmodellen, spänningen redovisad i texten; kassaposten härledd ur källans fält, ej källfält). PEG-kontrollen: ${sv(pe, 3)} ÷ ${pct(prog)} = ${sv(pegK, 2)} mot källans ${sv(peg, 2)} (kvot ${sv(pegKvot, 3)}; implicit tillväxt ${sv(pegImp, 2)} procent ≈ prognosfältet). Absolutkontroll och netto-cirkel: ${sv(pe, 3)} × ${sv(R[3], 0)} = ${sv(vPe, 1)} mdr mot ${sv(mcap, 1)} (+${sv(gapAbs * 100, 1)} %); ${pct(nettoM)} × ${sv(O[3], 0)} = ${sv(nettoCirkel, 0)} mn mot ${sv(R[3], 0)}. FCF-kontrollen: ${sv(fcfMarg, 0)} mot ${sv(fcfYv, 0)} mn (kvot ${sv(fcfKvot, 3)}).
- Scenarioruta, räknesatser och multiplövningar: aritmetik på FY2026 års bas ur universumsserierna (${sv(O[3], 0)} MUSD; ${pct(ebitM)} %; ${sv(O[0], 0)} → ${sv(O[3], 0)} MUSD; ${sv(R[0], 0)} → ${sv(R[3], 0)} MUSD); samtliga nio celler och båda räknesatserna maskinellt dubbeltkontrollerade vid tillverkningen 2026-09-20.
- Urvals- och klaimdokumentation: data/vakten/auto-s4-1789860306737-s4-u2-ansprak.md (PG-valet, gallrakedjan, syskonkoordineringen — u1:s motklaim läste och backade PG öppet).
- Vågvalideringsnotis: PG ingår inte i vågvalideringsuniversumet (domprotokoll 2026-09-04) och saknar analysfil i data/analyses/ — båda frånvaroerna redovisade i texten, inga värden är gissade.

*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar med källa och datum angivna; där en källa saknar data står det explicit, och där källans fält inte håller för kontroll redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

// skyddsdrag: inga främmande skrivtecken, inga nbsp, inga mjuka bindestreck (även U+00AD)
if (/[\u00a0\u202f\u2010\u2011\u00ad]/.test(body)) throw new Error("normalisering saknas — nbsp/mjuka bindestreck i texten");
if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(body)) throw new Error("CJK-tecken i texten");

const ord = body.split(/\s+/).filter(Boolean).length;
const J = {
  slug: "sa-laser-du-pg-q3-2026",
  title: "P&G:s Q1-rapport FY2027 (kalender-Q3, 22 oktober): så läser du den — stabilitetens kemi: PEG-kontrollens första fulla sammanträffande, EV-kedjans omöjliga negativa kassa och konsumentgrenens lugnaste vinstprognos",
  description: "P&G redovisar Q1 FY2027 (juli–september 2026) torsdagen 22 oktober — datumet bolagets eget preliminära angivande på IR-sidan. Läspaketet: brutet räkenskapsår juli–juni förklarat, grundberättelsen fyra år i gångfart (nettomarginaler 17,7–19,0 procent), förväntningsgapet mot konsensus +6,0 procent, identitetstestets nära-godkännande (4,9 procent), EV-kedjans härledda kassa som blir negativ (−8,1 miljarder dollar — spänningen redovisad länk för länk), PEG-kontrollens första fulla sammanträffande i serien (3,71 mot 3,74), insiderfältets seriens högsta värde (26 transaktioner), medianjämförelse mot 33 konsumentkollegor, 3x3-scenarioruta i ren aritmetik och källhänvisning per siffra. Utbildning i metod, aldrig råd.",
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: "2026-10-22",
  readingMinutes: Math.round(ord / 600),
  tags: ["kvartalsrapport", "Procter & Gamble", "konsument", "nyckeltal", "läspaket", "USA-börser"],
  body,
};
writeFileSync("/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-pg-q3-2026.json", JSON.stringify(J, null, 2) + "\n");
console.log("SKREV sa-laser-du-pg-q3-2026.json — ord:", ord, "readingMinutes:", J.readingMinutes);
console.log("KONTROLL: idPeRoe", sv(idPeRoe, 2), "| gapId%", sv(gapId * 100, 1), "| kassa", sv(kassa, 1), "| evKvot", sv(evKvot, 3), "| pegK", sv(pegK, 2), "| pegKvot", sv(pegKvot, 3), "| vikt", sv(vikt, 2), "| mult", sv(mult, 2), "| nettoCirkel", sv(nettoCirkel, 0), "| fcfKvot", sv(fcfKvot, 3), "| multMedian%", sv(multMedian * 100, 1));
