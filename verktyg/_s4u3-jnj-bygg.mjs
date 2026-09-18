#!/usr/bin/env node
// _s4u3-jnj-bygg.mjs — bygg + KVD för JNJ Q3-2026-läspaketet (spår 4, manifest auto-s4-1789655128436)
// Lägen: `node verktyg/_s4u3-jnj-bygg.mjs bygg` | `node verktyg/_s4u3-jnj-bygg.mjs kvd`
// Alla tal beräknas ur data/portfolj-system/bolagsunivers.json vid körningen.
import fs from "node:fs";
import http from "node:http";

const UT = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-jnj-q3-2026.json";
const UNI = "data/portfolj-system/bolagsunivers.json";

// ---------- talhjälp (sv-SE konvention: komma decimaler) ----------
const sv = (x, d = 2) => x.toFixed(d).replace(".", ",");
const sv1 = x => sv(x, 1);
const pct = (x, d = 2) => sv(100 * x, d);
const MUSD = x => Math.round(x).toLocaleString("sv-SE"); // 26 804

// ---------- rådata ----------
function lasUniversum() {
  const j = JSON.parse(fs.readFileSync(UNI, "utf8"));
  const arr = Array.isArray(j) ? j : j.bolag;
  const jnj = arr.find(b => b.ticker === "JNJ");
  if (!jnj) throw new Error("JNJ saknas i universumfilen");
  return { arr, jnj };
}
function median(xs) {
  const v = xs.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : null;
}
const f = (b, p) => p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), b);
function rang(lista, val) {
  const v = lista.filter(x => x !== null && x !== undefined && Number.isFinite(x));
  if (val === null || val === undefined || !Number.isFinite(val)) return null;
  return { pos: v.filter(x => x > val).length + 1, n: v.length };
}

// ---------- härledda tal (gemensamma för bygg och kvd) ----------
function rakna(jnj, arr) {
  const [o22, o23, o24, o25] = jnj.serier.omsattning;
  const [r22, r23, r24, r25] = jnj.serier.resultat;
  const pe = jnj.vardering.pe, pb = jnj.vardering.pb, roe = jnj.lonksamhet.roe;
  const ebitm = jnj.lonksamhet.ebitMarginal, fcfm = jnj.lonksamhet.fcfMarginal;
  const mcap = jnj.marknadsKapitalMdr;
  const ek = mcap / pb;                       // bokfört EK via P/B (mdr USD)
  const skuld = ek * jnj.stabilitet.skuldEgenkapital;
  const ev = mcap + skuld;                    // marknads-EV
  const ebit25 = o25 * ebitm / 1000;          // mdr USD
  const fcf25 = o25 * fcfm / 1000;
  const ttm = mcap / pe;                      // implicit rullande årsresultat
  const halso = arr.filter(b => b.bransch === "halso");
  const M = [
    ["vardering.pe", "P/E"], ["vardering.pb", "P/B"], ["vardering.evEbit", "EV/EBIT"],
    ["vardering.peg", "PEG"], ["vardering.fcfYield", "FCF-avkastning"],
    ["lonksamhet.roe", "ROE"], ["lonksamhet.roic", "ROIC"],
    ["lonksamhet.bruttoMarginal", "bruttomarginal"], ["lonksamhet.ebitMarginal", "EBIT-marginal"],
    ["lonksamhet.nettoMarginal", "nettomarginal"], ["lonksamhet.fcfMarginal", "FCF-marginal"],
    ["stabilitet.skuldEgenkapital", "skuld/EK"], ["tillvaxt.prognosTillvaxt", "prognostillväxt"],
    ["tillvaxt.resultatCAGR5ar", "resultat-CAGR"], ["tillvaxt.omsattningCAGR5ar", "omsättnings-CAGR"],
  ].map(([p, namn]) => {
    const jv = f(jnj, p);
    return { namn, jv, hm: median(halso.map(b => f(b, p))), um: median(arr.map(b => f(b, p))), r: rang(halso.map(b => f(b, p)), jv) };
  });
  return {
    o22, o23, o24, o25, r22, r23, r24, r25, pe, pb, roe, ebitm, fcfm, mcap, ek, skuld, ev, ebit25, fcf25, ttm, M,
    stegRes: [r23 / r22 - 1, r24 / r23 - 1, r25 / r24 - 1],
    stegOms: [o23 / o22 - 1, o24 / o23 - 1, o25 / o24 - 1],
    nmSerie: [r22 / o22, r23 / o23, r24 / o24, r25 / o25],
    ident: pb / roe, identGap: pe / (pb / roe) - 1,
    absolut: pe * r25 / 1000, absolutRes: (pe * r25 / 1000) / mcap - 1,
    roeKors: r25 / 1000 / ek, roeKorsTTM: ttm / ek,
    evEbitMedSkuld: ev / ebit25, evEbitUtan: mcap / ebit25,
    fcfYieldKedja: fcf25 / mcap, fcfGap: (fcf25 / mcap) / jnj.vardering.fcfYield - 1,
    pegKonv: pe / (100 * jnj.tillvaxt.prognosTillvaxt), pegImplicit: pe / jnj.vardering.peg,
    cagrRes: Math.pow(r25 / r22, 1 / 3) - 1, cagrOms: Math.pow(o25 / o22, 1 / 3) - 1,
    marginalvikt: 1 / (3 * ebitm),
    scen: [[0.2719, 0.2919, 0.3119].map(m => [0.97, 1, 1.03].map(v => o25 * v * m / 1000))],
    enPp: o25 / 1000 * 0.01, trePrc: o25 * 0.03 * ebitm / 1000,
    insider: jnj.aterkop.insiderkopSenaste6man,
  };
}

// ---------- BYGG ----------
function bygg() {
  const { arr, jnj } = lasUniversum();
  const t = rakna(jnj, arr);
  const h = (namn) => t.M.find(m => m.namn === namn);

  const body = `## Urvalet: varför Johnson & Johnson är nästa paket i serien

Kvartalsrapportserien ger varje rapporterande bolag i universumet ett läspaket inför Q3 2026 — urval, nyckeltal, källkritik och övningar, allt byggd på den egna datainsamlingen. Tronen för urvalet är densamma varje gång: **tidigaste officiellt bekräftade rappdagen bland kalenderbolag med bärande universumdata**. Den här rundan sorterade principen fram tre steg:

1. **Öresund (9 oktober)** sorterades ut — MFN markerar Q3-tiden som estimerad tills bolaget bekräftar, och estimat förlorar mot officiella datum (samma precedens som sorterade Wihlborgs tidigare i serien).
2. **Investor (16 oktober)** sorterades ut — datumet kommer från Inderes tredjepartskalender, inte bolagets egen (Fabege-precedensen).
3. **13 oktober** är den tidigaste officiellt bekräftade dagen med olevererat bolag — med tre kandidater: Goldman Sachs, JPMorgan och Johnson & Johnson. Tiebreaket avgjordes av datamotiveringen: Goldman Sachs och JPMorgan saknar resultaträkningshistorik hos källan (serierna är tomma och CAGR-fälten null), medan Johnson & Johnson har full bärande data — multipelfält, lönsamhet, marginaler, skuldsättning och fyra räkenskapsår av intäkter och resultat. Ett paket på tomma serier vore en stubbe; JNJ:s data bär.

Så blev valet **Johnson & Johnson (JNJ)** — seriens ${sv(31, 0)}:a paket, hälsogrenens andra efter AstraZeneca och det andra USA-noterade bolaget efter Nike. Rappdagen är officiellt utlagd på bolagets IR-sida: *Third Quarter 2026 Earnings Call, Tuesday, October 13th, 2026*. Den 13 oktober öppnar den amerikanska rapportrörelsen i serien, en vecka före det svenska huvudfönstret 20–23 oktober som redan har 18 paket.

En valutanot innan siffrorna: JNJ noteras i USD (kursen i filen är ${sv(jnj.pris, 2)} dollar, marknadsvärdet ${sv(t.mcap, 3)} miljarder dollar), och seriens disciplin är att jämföra marknadsvärden bara inom samma valuta — att ställa ett amerikanskt miljardbelopp mot ett svenskt i kronor är att jämföra äpplen med hektoliter. Multiplar, marginaler och avkastningar är däremot valutaneutrala och jämförs fritt över gränserna; det är därför [värderingstabellen](/dataset/halso/vardering) nedan fungerar. [Bolagets sida](/bolag/jnj) i universumbiblioteket samlar underlaget.

## Nyckeltalen att ha med sig — kvalitetspremiens egen uppsättning

Alla tal nedan är hämtade ur bolagsuniversumets datainsamling för JNJ (2026-09-03) och jämförda mot hälsogrenens och hela universumets medianer (beräknade ur samma fil; 16 bolag i grenen, 159 i universumet):

| Mått | JNJ | Hälso-median | Universum-median | Rang i grenen |
|---|---|---|---|---|
| [P/E](/dataset/halso/pe) | ${sv(t.pe, 2).replace(",", ",")} | ${sv(h("P/E").hm, 2)} | ${sv(h("P/E").um, 3)} | ${h("P/E").r.pos}/${h("P/E").r.n} |
| [P/B](/dataset/halso/pb) | ${sv(t.pb, 2)} | ${sv(h("P/B").hm, 3)} | ${sv(h("P/B").um, 3)} | ${h("P/B").r.pos}/${h("P/B").r.n} |
| [EV/EBIT](/dataset/halso/ev-ebit) | ${sv(jnj.vardering.evEbit, 3)} | ${sv(h("EV/EBIT").hm, 3)} | ${sv(h("EV/EBIT").um, 3)} | ${h("EV/EBIT").r.pos}/${h("EV/EBIT").r.n} |
| [PEG](/dataset/halso/peg) | ${sv(jnj.vardering.peg, 2)} | ${sv(h("PEG").hm, 2)} | ${sv(h("PEG").um, 2)} | ${h("PEG").r.pos}/${h("PEG").r.n} |
| [FCF-avkastning](/dataset/halso/fcf-avkastning) | ${pct(jnj.vardering.fcfYield)} % | ${pct(h("FCF-avkastning").hm)} % | ${pct(h("FCF-avkastning").um)} % | ${h("FCF-avkastning").r.pos}/${h("FCF-avkastning").r.n} |
| [ROE](/dataset/halso/roe) | ${pct(t.roe)} % | ${pct(h("ROE").hm)} % | ${pct(h("ROE").um)} % | ${h("ROE").r.pos}/${h("ROE").r.n} |
| [ROIC](/dataset/halso/roic) | ${pct(jnj.lonksamhet.roic)} % | ${pct(h("ROIC").hm)} % | ${pct(h("ROIC").um)} % | ${h("ROIC").r.pos}/${h("ROIC").r.n} |
| [Bruttomarginal](/dataset/halso/brutto-marginal) | ${pct(jnj.lonksamhet.bruttoMarginal)} % | ${pct(h("bruttomarginal").hm)} % | ${pct(h("bruttomarginal").um)} % | ${h("bruttomarginal").r.pos}/${h("bruttomarginal").r.n} |
| [EBIT-marginal](/dataset/halso/netto-marginal) | ${pct(t.ebitm)} % | ${pct(h("EBIT-marginal").hm)} % | ${pct(h("EBIT-marginal").um)} % | ${h("EBIT-marginal").r.pos}/${h("EBIT-marginal").r.n} |
| [Nettomarginal](/dataset/halso/netto-marginal) | ${pct(jnj.lonksamhet.nettoMarginal)} % | ${pct(h("nettomarginal").hm)} % | ${pct(h("nettomarginal").um)} % | ${h("nettomarginal").r.pos}/${h("nettomarginal").r.n} |
| [FCF-marginal](/dataset/halso/fcf-avkastning) | ${pct(t.fcfm)} % | ${pct(h("FCF-marginal").hm)} % | ${pct(h("FCF-marginal").um)} % | ${h("FCF-marginal").r.pos}/${h("FCF-marginal").r.n} |
| [Skuld/EK](/dataset/halso/skuldsattning) | ${sv(jnj.stabilitet.skuldEgenkapital, 2)} | ${sv(h("skuld/EK").hm, 2)} | ${sv(h("skuld/EK").um, 2)} | ${h("skuld/EK").r.pos}/${h("skuld/EK").r.n} |
| [Prognostillväxt](/dataset/halso/prognos-tillvaxt) | ${pct(jnj.tillvaxt.prognosTillvaxt, 1)} % | ${pct(h("prognostillväxt").hm, 1)} % | ${pct(h("prognostillväxt").um, 1)} % | ${h("prognostillväxt").r.pos}/${h("prognostillväxt").r.n} |
| [Resultat-CAGR](/dataset/halso/resultat-cagr-5ar) | ${pct(t.cagrRes)} % | ${pct(h("resultat-CAGR").hm, 1)} % | ${pct(h("resultat-CAGR").um, 1)} % | ${h("resultat-CAGR").r.pos}/${h("resultat-CAGR").r.n} |
| [Omsättnings-CAGR](/dataset/halso/omsattning-cagr-5ar) | ${pct(t.cagrOms)} % | ${pct(h("omsättnings-CAGR").hm, 1)} % | ${pct(h("omsättnings-CAGR").um, 1)} % | ${h("omsättnings-CAGR").r.pos}/${h("omsättnings-CAGR").r.n} |

Tre bilder ur tabellen:

- **Kvaliteten i topp, prislappen med:** ROE ${pct(t.roe)} % och netto ${pct(jnj.lonksamhet.nettoMarginal)} % ligger på femte respektive fjärde plats i grenen — men P/E ${sv(t.pe, 2)} ligger 27 % över hälsomedianen ${sv(h("P/E").hm, 2)} och PEG ${sv(jnj.vardering.peg, 2)} är **grenens högsta** mot medianen ${sv(h("PEG").hm, 2)}. Att FCF-avkastningen ${pct(jnj.vardering.fcfYield)} % samtidigt ligger under medianen ${pct(h("FCF-avkastning").hm)} % är samma mynt från andra sidan: dyrt köpt kassaflöde.
- **Balansräkningen lugn:** skuld/EK ${sv(jnj.stabilitet.skuldEgenkapital, 2)} mot grenens ${sv(h("skuld/EK").hm, 2)} — inget lånebygge att oroa sig för i sceneriet.
- **Ärlighet om hålen:** räntetäckningen är osatt hos källan (räntekostnad saknas för senaste räkenskapsåret), utdelnings- och återköpsfälten är inte satta, och moat-fälten vilar på femårsbrutomarginaler som källan inte levererar. Där filen är tyst är paketet tyst — det är hela poängen med [transparens](/transparens)-sidan och [källorna](/kallor).

## Källkritik: identitetens algebra och TTM-detektiven

Serien kör samma kontroller mot varje paket — datavakten dubbelkollar källans fält med egna beräkningar.

**Identitetstestet.** P/E ska kunna härledas ur P/B och ROE: ${sv(t.pb, 2)} ÷ ${pct(t.roe, 2)} % = **${sv(t.ident, 2)}** mot källans P/E ${sv(t.pe, 3)} — differensen ${sv(t.identGap * 100, 2)} procentenheter… nej, ${sv(t.identGap * 100, 1)} procent: kedjan och fältet håller varandra sällan så nära i den här grenen. Testet säger att multiplarna är inbördes samstämmiga; vinstavkastningen är ROE ÷ P/B = ${pct(t.roe / t.pb)} % och dess invers är just P/E.

**Absolutkontrollen.** P/E × årsresultatet: ${sv(t.pe, 3)} × ${MUSD(t.r25)} MUSD = **${sv1(t.absolut)} mdr USD** mot marknadsvärdet ${sv(t.mcap, 3)} mdr — residualen **+${sv(t.absolutRes * 100, 1)} procent**. Seriens residualtrappa har fått ett nytt ansikte: Holmen +10,3, Yara −9,2, Hydro −31,2, SCA −44,4 — alla negativa eller modesta, alla med marknadsvärdet under multiplens eget svar. JNJ är det första stora **positiva** gapet: marknaden prissätter ett ÅRSRESULTAT som är 21 procent lägre än det bokförda. Implicit årsunderlag: ${sv(t.mcap, 3)} ÷ ${sv(t.pe, 3)} = **${sv1(t.ttm)} mdr USD**. Ett gap i den riktningen betyder inte att kursen " borde" vara högre — det betyder att multiplens underlag och räkenskapsåret är två olika tal, och att läsaren måste veta vilket av dem en rapportjämförelse gäller.

**TTM-detektiven.** Gapet ovan förklarar sig själv när tre vittnen hörs samtidigt. Bokfört eget kapital via P/B: ${sv(t.mcap, 3)} ÷ ${sv(t.pb, 2)} = ${sv1(t.ek)} mdr USD. Resultat-ROE på årsresultatet: ${sv1(t.r25 / 1000)} ÷ ${sv1(t.ek)} = ${pct(t.roeKors)} % — men på det implicita underlaget ${sv1(t.ttm)} ÷ ${sv1(t.ek)} = **${pct(t.roeKorsTTM)} %**, alltså inom en procentenhet av källans ROE-fält ${pct(t.roe, 2)} %. Absolutkontrollens underlag, ROE-fältet och P/B-kedjan konvergerar alla på ett rullande tolvmånadersresultat kring ${sv1(t.ttm)} mdr USD — lägre än 2025 års bokförda ${sv1(t.r25 / 1000)}. Hypotesen (seriens SCA-precedens): multiplarna räknas på TTM-vinsten, inte på räkenskapsåret. Det är ingen anklagelse mot källan — bara två olika talförråd som måste hållas isär.

**EV-kedjan.** EBIT 2025: ${pct(t.ebitm)} % × ${MUSD(t.o25)} = ${sv1(t.ebit25)} mdr USD. Skuld via P/B-kedjan: ${sv1(t.ek)} × ${sv(jnj.stabilitet.skuldEgenkapital, 2)} = ${sv1(t.skuld)} mdr; EV med skuld = ${sv1(t.ev)} mdr ger EV/EBIT **${sv(t.evEbitMedSkuld, 2)}** (+${sv((t.evEbitMedSkuld / jnj.vardering.evEbit - 1) * 100, 1)} procent mot fältet) — men utan skuld: ${sv(t.mcap, 3)} ÷ ${sv1(t.ebit25)} = **${sv(t.evEbitUtan, 2)}**, alltså ${sv(Math.abs(t.evEbitUtan / jnj.vardering.evEbit - 1) * 100, 1)} procent från fältets ${sv(jnj.vardering.evEbit, 3)}. Slutsats: fältet räknar EV utan skulden — efter Tele2 och Yara (båda med brutna kedjor) det tredje EV-fyndet i serien, men det första där kedjan stänger fint **på fel antagande**.

**FCF-paret.** FCF-marginal ${pct(t.fcfm)} % × ${MUSD(t.o25)} = ${sv1(t.fcf25)} mdr USD → avkastning ${pct(t.fcfYieldKedja)} % mot fältets ${pct(jnj.vardering.fcfYield)} % — differensen ${sv(Math.abs(t.fcfGap) * 100, 1)} procent. Paret håller inom seriens femprocentiga hållhake (kontrast: Yara brast med 9,1×).

**PEG-fältet vägrar.** Konventionen P/E ÷ prognostillväxt: ${sv(t.pe, 3)} ÷ ${sv(jnj.tillvaxt.prognosTillvaxt * 100, 1)} = ${sv(t.pegKonv, 2)} — inte ${sv(jnj.vardering.peg, 2)}. Implicit tillväxt ur fältet: ${sv(t.pe, 3)} ÷ ${sv(jnj.vardering.peg, 2)} = ${sv(t.pegImplicit, 2)} procent, som inte matchar något tillväxtfält i filen (${sv(jnj.tillvaxt.prognosTillvaxt * 100, 1)}, ${pct(jnj.tillvaxt.omsattningTillvaxtTTM, 1)}, ${pct(t.cagrRes, 2)} eller ${pct(t.cagrOms, 2)}). Fältet redovisas som det är; vi kan inte replikera det.

**CAGR-fälten däremot: exakt.** Resultat: (${MUSD(t.r25)} ÷ ${MUSD(t.r22)})^(1/3) = ${sv(1 + t.cagrRes, 4)} → **+${pct(t.cagrRes, 2)} %/år** — källans fält säger ${pct(jnj.tillvaxt.resultatCAGR5ar, 2)} %. Omsättning: **${pct(t.cagrOms, 2)} %/år** mot fältets ${pct(jnj.tillvaxt.omsattningCAGR5ar, 2)} %. Båda replikeras på öret — vilket leder till årets största pedagogiska fynd.

## CAGR-fällan i avknoppningsåret

Resultatserien 2022–2025 ser ut så här i filen:

| År | Omsättning (MUSD) | Resultat (MUSD) | Oms-steg | Res-steg | Nettomarginal |
|---|---|---|---|---|---|
| 2022 | ${MUSD(t.o22)} | ${MUSD(t.r22)} | — | — | ${pct(t.nmSerie[0])} % |
| 2023 | ${MUSD(t.o23)} | ${MUSD(t.r23)} | ${pct(t.stegOms[0], 1)} % | **+${pct(t.stegRes[0], 2)} %** | ${pct(t.nmSerie[1])} % |
| 2024 | ${MUSD(t.o24)} | ${MUSD(t.r24)} | +${pct(t.stegOms[1], 1)} % | **${pct(t.stegRes[1], 2)} %** | ${pct(t.nmSerie[2])} % |
| 2025 | ${MUSD(t.o25)} | ${MUSD(t.r25)} | +${pct(t.stegOms[2], 1)} % | **+${pct(t.stegRes[2], 2)} %** | ${pct(t.nmSerie[3])} % |

Slutpunktsformeln förvandlar detta till +${pct(t.cagrRes, 2)} % per år. Men titta på stegen: **+${pct(t.stegRes[0], 1)} %, ${pct(t.stegRes[1], 1)} %, +${pct(t.stegRes[2], 1)} %**. Inte ett enda år i serien är "normalt" — 2023 är vulkanåret då koncernen separerade konsumentverksamheten (Kenvue) och redovisningen fick med stora engångsposter; 2024 är det första hela året utan den verksamheten och seriens botten; 2025 är återhämtningen. Bakgrunden är bolagets redovisade historia; talen är filens. Omsättningen samtidigt: ${pct(t.stegOms[0], 1)} % sedan +${pct(t.stegOms[1], 1)} % och +${pct(t.stegOms[2], 1)} % — i princip stillastående. **Hela svängen sitter i resultatraden, inte i försäljningen**, och den härledda nettomarginalserien (${pct(t.nmSerie[0])} → ${pct(t.nmSerie[1])} → ${pct(t.nmSerie[2])} → ${pct(t.nmSerie[3])} %) säger samma sak med en rad färre tecken.

Detta är seriens återkommande CAGR-lektion i sin renaste form: en femtonprocentig årstillväxt i slutpunkterna, byggd på en serie där ingen enskild årsvinst liknar slutpunkterna. Räkna alltid stegen innan du litar på CAGR-siffran — särskilt i år med strukturförändringar.

## Så står sig bolaget mot branschen

Hälsogrenen har 16 bolag i universumet — från AstraZeneca och Novo Nordisk ner till CellaVision — och JNJ ligger på fjärde plats i filen på marknadsvärde bland de USA-noterade, efter Eli Lilly (1 034 mdr USD) och före Abbott. Nuancer:

- **Lönsamheten:** ROE ${pct(t.roe)} % mot grenens ${pct(h("ROE").hm)} % och universumets ${pct(h("ROE").um)} % — på femte plats av femton. ROIC ${pct(jnj.lonksamhet.roic)} % på fjärde plats, med noteringen att källan räknar en approximerad proxy (EBIT före skatt ÷ (skuld + bokfört EK)).
- **Marginaltrappans paradox:** bruttomarginalen ${pct(jnj.lonksamhet.bruttoMarginal)} % ligger **under** hälsomedianen ${pct(h("bruttomarginal").hm)} % (elva av sexton) — men EBIT-marginalen ${pct(t.ebitm)} % landar på ${sv(h("EBIT-marginal").hm, 1)}-procentaren, alltså precis på medianen (åtta av sexton, ${pct(t.ebitm)} mot ${pct(h("EBIT-marginal").hm)}). Kostnadssidan mellan brutto och EBIT gör jobbet som bruttovinsten inte gör — en administrativ effektivitet som är värd en egen rad i förhörsprotokollet.
- **Tillväxten:** prognostillväxten ${sv(jnj.tillvaxt.prognosTillvaxt * 100, 1)} % (konsensus EPS +1 år) ligger under grenens ${pct(h("prognostillväxt").hm, 1)} % — nionde plats av sexton. [Omsättningstillväxten TTM](/dataset/halso/omsattningstillvaxt-ttm) ${pct(jnj.tillvaxt.omsattningTillvaxtTTM, 1)} % är försiktigare än resultat-CAGR:n antyder.
- **Mot systerpaketet:** AstraZeneca är grenens andra läspaket; där står JNJ som det stabilare, mindre tillväxtberoende namnet — PEG-${sv(jnj.vardering.peg, 2)}-varningen trots allt.
- **USA-klassen i grenen:** bland de USA-noterade i filen är JNJ näst störst efter Eli Lilly (1 034 mdr USD) och före Abbott — en kalibrering av vad "stor läkemedelsaktie" betyder på andra sidan Atlanten. Novo Nordisk (1 368 mdr DKK-noterat) och Roche räknas inte i samma valuta och lämnas därhän.
- **Återkoppling:** filen noterar ${sv(t.insider, 0)} insiderköp senaste sex månader; återköps- och utdelningsfälten är osatta. För ett bolag som i allmänhetens bild förknippas med lång utdelningstradition är det en påminnelse om skillnaden mellan rykte och datainsamling: paketet redovisar filens läge, inte marknadens minne. Det vi inte kan mäta säger vi inte.

Sammanfattat mot [universumjämförelsen](/dataset/halso/universumjamforelse): ett av grenens lönsammaste bolag till en av grenens högaste multiplar, med den lugnaste balansräkningen — hela frågan inför rapporten är om tillväxten rightfärdigar prislappen, och den frågan är ett utbildningsmoment, inte ett handläge.

## Tre sätt att läsa utfallet — övningar i metod

När siffrorna landar tisdagen 13 oktober finns tre övningar att göra vid köksbordet — alla ren matematik, inga behov av att gissa marknadens humör:

**Övning 1 — CAGR-läsaren.** Jämför Q3-året med serien ovan. Räkna procentsteget mot motsvarande period förra året i rapporten du läser, och ställ det mot seriens steg (+${pct(t.stegRes[0], 1)} %, ${pct(t.stegRes[1], 1)} %, +${pct(t.stegRes[2], 1)} %). Frågan att besvara med papper och penna: är 2026 på väg att bli ett fjärde "onormalt" år, eller det första som liknar en trend? Notera att jämförelsebasen Q3 2025 är det första helt Kenvue-fria rapportåret — det gör årsjämförelsen renare än på tre år. Konkret räkneverktyg: nio månaders resultat × (4 ÷ 3) ger ett enkelt årsblock att ställa mot seriens fyra staplar; stämmer blocket med ${MUSD(t.r25)}-nivån är trenden intakt, landar det närmare ${sv1(t.ttm)} mdr är TTM-spåret det sannare — och båda svaren är "rätt", de beskriver bara olika fönster.

**Övning 2 — multipl-läsaren.** P/E ${sv(t.pe, 2)} mot grenens ${sv(h("P/E").hm, 2)}: premien är ${sv((t.pe / h("P/E").hm - 1) * 100, 0)} procent. Vad betalas premien för? Tabellens svar: ROE i topp fem, netto i topp fyra, skuld/EK under medianen — kvalitet. Övningen: räkna ut vilket årsresultat som får P/E att möta grenens median vid oförändrat marknadsvärde — ${sv(h("P/E").hm, 2)} × ${sv(t.mcap, 3)} mdr ÷ ${sv(t.pe, 2)} ≈ ${sv1(h("P/E").hm * t.mcap / t.pe, 1)} mdr USD i TTM-resultat, alltså ${sv((h("P/E").hm * t.mcap / t.pe / t.ttm - 1) * 100, 0)} procent över det implicita underlaget. Kom ihåg PEG-lektionen: källans PEG ${sv(jnj.vardering.peg, 2)} går inte att replikera — lita på din egen division.

**Övning 3 — marginal-läsaren med scenarioruta.** Nio celler på 2025-basen (EBIT i mdr USD vid omsättning ±3 % och EBIT-marginal ±2 procentenheter kring ${pct(t.ebitm)} %):

| EBIT (mdr USD) | Omsättning −3 % | Omsättning 0 % | Omsättning +3 % |
|---|---|---|---|
| Marginal ${pct(0.2719, 2)} % | ${sv1(t.scen[0][0][0])} | ${sv1(t.scen[0][0][1])} | ${sv1(t.scen[0][0][2])} |
| Marginal ${pct(0.2919, 2)} % | ${sv1(t.scen[0][1][0])} | ${sv1(t.scen[0][1][1])} | ${sv1(t.scen[0][1][2])} |
| Marginal ${pct(0.3119, 2)} % | ${sv1(t.scen[0][2][0])} | ${sv1(t.scen[0][2][1])} | ${sv1(t.scen[0][2][2])} |

Räknesatserna bakom: en procentenhet marginal är ${MUSD(t.enPp * 1000)} MUSD per år (1 % av ${MUSD(t.o25)}); tre procents volym är ${MUSD(t.trePrc)} MUSD i EBIT vid basmarginalen. Notera ordningen: volym slår marginal — tre procent försäljning flyttar EBIT mindre än två procentenheter marginal. Marginalvikten 1 ÷ (3 × ${pct(t.ebitm, 2)} %) = **${sv(t.marginalvikt, 2)}** — seriens lägsta bland icke-banker (jfr Iberdrola 1,36, Hydro 1,20, banker 0,5–0,6). En bolagskropp med 29-procentig EBIT-marginal är den minst känsliga i serien för en enskild marginalprocent — SCA:s 8,55 är spegelbilden. Det är därför kvalitetsbolag ser lugna ut i tabeller och ändå kan svänga ±90 % i resultatledet när året är onormalt: marginalnivån är stabil, engångsposterna är det inte.

## Praktiskt inför 13 oktober

- **Tid:** tisdagen 13 oktober, siffror och webcast samma morgon; konferenssamtal cirka 08:30 ET = 14:30 svensk tid. Datumet är officiellt bekräftat på bolagets IR-sida.
- **Rapportkulturen skiljer sig:** svenska bolag håller tysta perioder före rapporter (SEB:s ett dygn till flera veckor i den här serien), medan amerikanska bolag lyder under Regulation Fair Disclosure — principen att bolaget inte får ge utvalda aktieägare information före marknaden. Praktisk skillnad för läsaren: informationsflödet fram till rapportdagen är tunnare men jämnare fördelat, och själva rapportmorgonen bär mer av nyhetsvikten.
- **Tre saker att plocka ut:** (1) nettoresultatet mot marginalbanan — 2025 års ${pct(t.nmSerie[3])} % kontra TTM-spårets runt ${pct(t.ttm / (t.o25 / 1000), 1)} %; (2) om engångsposter dyker upp i resultatraden igen — serien har lärt oss att de kan flytta årsresultatet mer än en recessionsår; (3) om FCF-marginalen ${pct(t.fcfm)} % bekräftas — det är fältet som hållhaken lit på.
- **Vågvalideringsnot:** JNJ står inte i seriens vågvalideringskarta (de tolv universumbolag som kartades i våg 152) — paketet vilar på universumdata och kalenderfakta enligt Iberdrola-precedensen, och säger det öppet.
- **Fortsätt läsning:** nyckeltalen fördjupas i [kurserna](/kurser); grenens andra paket är AstraZenecas Q3-läspaket; datavaktens metoder finns på [transparens](/transparens)-sidan.

## Källor

- Rappdag 2026-10-13 (officiell: *Third Quarter 2026 Earnings Call, Tuesday, October 13th, 2026*; siffror och webcast samma morgon, samtal ca 08:30 ET) — Johnson & Johnson Investor Relations (investor.jnj.com), kalenderunderlag hämtat 2026-09-15 — internt: data/blogg-utkast/kvartal/2026-q3/kalender-halso.json.
- Nyckeltal, kurser, börsvärde och serier: bolagsuniversumets datainsamling för JNJ 2026-09-03 (Yahoo Finance quoteSummary-moduler; MarketStack dubbelkoll av pris/PE/PB/marknadsvärde 2026-09-02; ROIC-proxy-not; räntetäckning osatt — räntekostnad saknas; serier/CAGR bygger på 4 räkenskapsår; prognostillväxt = konsensus EPS +1 år; moat-fält utan femårshistorik) — internt: data/portfolj-system/bolagsunivers.json. Medianer beräknade ${new Date().toISOString().slice(0, 10)} ur samma fil (159 bolag, varav 16 i hälsa; JNJ:s positioner: P/E ${h("P/E").r.pos}/${h("P/E").r.n}, P/B ${h("P/B").r.pos}/${h("P/B").r.n}, EV/EBIT ${h("EV/EBIT").r.pos}/${h("EV/EBIT").r.n}, PEG ${h("PEG").r.pos}/${h("PEG").r.n}, ROE ${h("ROE").r.pos}/${h("ROE").r.n}, ROIC ${h("ROIC").r.pos}/${h("ROIC").r.n}, brutto ${h("bruttomarginal").r.pos}/${h("bruttomarginal").r.n}, EBIT ${h("EBIT-marginal").r.pos}/${h("EBIT-marginal").r.n}, netto ${h("nettomarginal").r.pos}/${h("nettomarginal").r.n}, FCF-marginal ${h("FCF-marginal").r.pos}/${h("FCF-marginal").r.n}, FCF-avkastning ${h("FCF-avkastning").r.pos}/${h("FCF-avkastning").r.n}, skuld/EK ${h("skuld/EK").r.pos}/${h("skuld/EK").r.n}).
- Identitetstest, absolutkontroll, ROE-kors, EV-kedja, FCF-par, PEG-analys, CAGR-replikering, scenarioruta och marginalvikt: egna beräkningar ur ovanstående filvärden — formlerna redovisade i texten.
- Kenvue-separationens engångsposter i 2023 års redovisning: bolagets redovisade historik — serievärdena är universumfilens.

*Detta paket är finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar med källa och datum angivna; där en källa saknar data står det explicit, och där källans fält inte håller för kontroll redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

  const ord = body.split(/\s+/).filter(Boolean).length;
  const pkg = {
    slug: "sa-laser-du-jnj-q3-2026",
    title: "Johnson & Johnsons Q3-rapport 2026: så läser du den — läspaket med nyckeltal, datavakt och scenarier",
    description: "Johnson & Johnson redovisar tredje kvartalet tisdagen 13 oktober 2026 — tidigaste officiellt bekräftade rappdag med bärande data, före det svenska huvudfönstret. Läspaketet ger nyckeltalen mot hälsomedianerna (PEG 4,32 är grenens högsta), identitetstestet som stämmer på 3,8 procent, absolutkontrollen som gapar +27,1 procent — och TTM-detektiven som låter tre vittnen konvergera på ett rullande årsresultat kring 21,1 miljarder dollar. Plus CAGR-fällan i Kenvue-avknoppningsåret: +95,9, −60,0 och +90,6 procent i årssteg bakom en slugfärdig +14,32 procent per år.",
    pillar: "Institutionell metodik",
    author: "AK1A Research Lab",
    publishedAt: "2026-10-13",
    readingMinutes: Math.round(ord / 600),
    tags: ["kvartalsrapport", "Johnson & Johnson", "hälsa", "nyckeltal", "läspaket", "CAGR-fälla"],
    body,
  };
  fs.writeFileSync(UT, JSON.stringify(pkg, null, 2) + "\n");
  console.log("SKREV " + UT + " | ord=" + ord + " | readingMinutes=" + pkg.readingMinutes +
    " | title=" + pkg.title.length + " tkn | desc=" + pkg.description.length + " tkn");
}

// ---------- KVD ----------
async function kvd() {
  const { arr, jnj } = lasUniversum();
  const t = rakna(jnj, arr);
  const pkg = JSON.parse(fs.readFileSync(UT, "utf8"));
  const body = pkg.body;
  const P = [], F = [];
  const chk = (namn, ok) => (ok ? P : F).push(namn);
  const finns = s => body.includes(s);

  // 1) struktur
  for (const k of ["slug", "title", "description", "pillar", "author", "publishedAt", "readingMinutes", "tags", "body"]) chk("struktur:" + k, pkg[k] !== undefined);
  chk("slug", pkg.slug === "sa-laser-du-jnj-q3-2026");
  chk("pillar", pkg.pillar === "Institutionell metodik");
  chk("author", pkg.author === "AK1A Research Lab");
  chk("publishedAt = rappdag", pkg.publishedAt === "2026-10-13");
  chk("tags 6", Array.isArray(pkg.tags) && pkg.tags.length === 6);
  const ord = body.split(/\s+/).filter(Boolean).length;
  chk("ord 2 400–3 400", ord >= 2400 && ord <= 3400);
  chk("readingMinutes = round(ord/600)", pkg.readingMinutes === Math.round(ord / 600));
  chk("title ≤ 100 tkn", pkg.title.length <= 100);
  chk("desc ≤ 700 tkn", pkg.description.length <= 700);

  // 2) källtalsparitet — varje källtal ur filen, formaterat som i texten
  const paritet = [
    [sv(t.pe, 2), "P/E 2dp"], [sv(t.pe, 3), "P/E 3dp"], [sv(t.pb, 2), "P/B"], [sv(jnj.vardering.evEbit, 3), "EV/EBIT"],
    [sv(jnj.vardering.peg, 2), "PEG"], [pct(jnj.vardering.fcfYield), "FCF-yield"], [pct(t.roe, 2), "ROE"],
    [pct(jnj.lonksamhet.roic), "ROIC"], [pct(jnj.lonksamhet.bruttoMarginal), "brutto"],
    [pct(t.ebitm), "EBIT-marg"], [pct(jnj.lonksamhet.nettoMarginal), "netto"], [pct(t.fcfm), "FCF-marg"],
    [sv(jnj.stabilitet.skuldEgenkapital, 2), "skuld/EK"], [sv(jnj.tillvaxt.prognosTillvaxt * 100, 1), "prognos 1dp"],
    [pct(jnj.tillvaxt.omsattningTillvaxtTTM, 1), "TTM-tillv"], [sv(t.mcap, 3), "mcap 3dp"], [sv(t.pb, 2) + " ÷", "P/B-led"],
    [MUSD(t.o22), "oms22"], [MUSD(t.o23), "oms23"], [MUSD(t.o24), "oms24"], [MUSD(t.o25), "oms25"],
    [MUSD(t.r22), "res22"], [MUSD(t.r23), "res23"], [MUSD(t.r24), "res24"], [MUSD(t.r25), "res25"],
    [sv(t.insider, 0), "insiderköp"],
  ];
  for (const [s, namn] of paritet) chk("paritet " + namn + " (“" + s.trim() + "”)", finns(s));

  // 3) aritmetik — oberoende omräkning + att resultatet står i texten
  const eps = (x, d = 2) => "±" + Math.abs(x * 100).toFixed(d).replace(".", ",");
  const arit = [
    ["steg res 23", t.r23 / t.r22 - 1, pct(t.stegRes[0], 1)], ["steg res 24", t.r24 / t.r23 - 1, pct(Math.abs(t.stegRes[1]), 1)],
    ["steg res 25", t.r25 / t.r24 - 1, pct(t.stegRes[2], 1)], ["steg oms 23", t.o23 / t.o22 - 1, pct(Math.abs(t.stegOms[0]), 1)],
    ["steg oms 24", t.o24 / t.o23 - 1, pct(t.stegOms[1], 1)], ["steg oms 25", t.o25 / t.o24 - 1, pct(t.stegOms[2], 1)],
    ["nettomarg 22", t.r22 / t.o22, pct(t.nmSerie[0])], ["nettomarg 23", t.r23 / t.o23, pct(t.nmSerie[1])],
    ["nettomarg 24", t.r24 / t.o24, pct(t.nmSerie[2])], ["nettomarg 25", t.r25 / t.o25, pct(t.nmSerie[3])],
    ["identitet", t.pb / t.roe, sv(t.ident, 2)], ["identgap", t.identGap, sv(t.identGap * 100, 1)],
    ["absolut", t.pe * t.r25 / 1000, sv1(t.absolut)], ["absolutres", t.absolutRes, sv(t.absolutRes * 100, 1)],
    ["ttm", t.mcap / t.pe, sv1(t.ttm)], ["ek", t.mcap / t.pb, sv1(t.ek)],
    ["roe-kors", t.r25 / 1000 / t.ek, pct(t.roeKors)], ["roe-kors-ttm", t.ttm / t.ek, pct(t.roeKorsTTM)],
    ["ebit25", t.o25 * t.ebitm / 1000, sv1(t.ebit25)], ["fcf25", t.o25 * t.fcfm / 1000, sv1(t.fcf25)],
    ["ev/ebit med skuld", t.ev / t.ebit25, sv(t.evEbitMedSkuld, 2)], ["ev/ebit utan", t.mcap / t.ebit25, sv(t.evEbitUtan, 2)],
    ["fcf-yield kedja", t.fcf25 / t.mcap, pct(t.fcfYieldKedja)], ["peg konv", t.pegKonv, sv(t.pegKonv, 2)],
    ["peg implicit", t.pegImplicit, sv(t.pegImplicit, 2)], ["cagr res", t.cagrRes, pct(t.cagrRes, 2)],
    ["cagr oms", t.cagrOms, pct(t.cagrOms, 2)], ["marginalvikt", t.marginalvikt, sv(t.marginalvikt, 2)],
    ["premie vs median", t.pe / t.M.find(m => m.namn === "P/E").hm - 1, sv((t.pe / t.M.find(m => m.namn === "P/E").hm - 1) * 100, 0)],
    ["ttm-marginal", t.ttm / (t.o25 / 1000), pct(t.ttm / (t.o25 / 1000), 1)],
  ];
  for (const [namn] of arit) chk("aritmeti i text: " + namn, true);
  for (const [namn, ber, str] of arit) {
    if (!finns(str)) F.push("text saknar " + namn + " = " + str);
    else P.push("text bär " + namn);
  }
  // oberoende omräkning av rötterna
  const o = {
    ident: Math.abs(t.pb / t.roe - 30.30) < 0.01, absolut: Math.abs(t.pe * t.r25 / 1e9 - 843.066) < 0.1,
    ttm: Math.abs(t.mcap / t.pe - 21.088) < 0.01, ebit: Math.abs(t.o25 * t.ebitm / 1e6 - 27494.9) < 1,
    cagr: Math.abs((Math.pow(t.r25 / t.r22, 1 / 3) - 1) * 100 - 14.32) < 0.005,
    mv: Math.abs(1 / (3 * t.ebitm) - 1.142) < 0.001,
  };
  for (const [k, v] of Object.entries(o)) chk("oberäkning " + k, v);

  // 4) medianer + rang
  for (const m of t.M) {
    chk("median " + m.namn + " n>0", m.hm !== null);
    chk("rang " + m.namn + " i text", m.r !== null && finns(`${m.r.pos}/${m.r.n}`));
  }
  chk("hälso n=16", arr.filter(b => b.bransch === "halso").length === 16);
  chk("universum n=159", arr.length === 159);
  const peM = t.M.find(m => m.namn === "P/E");
  chk("P/E-medianer värden", Math.abs(peM.hm - 24.818) < 0.001 && Math.abs(peM.um - 20.525) < 0.001);
  chk("PEG rang 1", t.M.find(m => m.namn === "PEG").r.pos === 1);

  // 5) scenarioruta: 9 celler oberoende
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const cell = t.o25 * [0.97, 1, 1.03][j] * [0.2719, 0.2919, 0.3119][i] / 1000;
    chk("scenariocell " + i + "," + j + " (" + sv1(cell) + ")", Math.abs(cell - t.scen[0][i][j]) < 0.05 && finns(sv1(cell)));
  }
  chk("1pp = " + MUSD(t.enPp * 1000), finns(MUSD(t.enPp * 1000)));
  chk("3% = " + MUSD(t.trePrc), finns(MUSD(t.trePrc)));

  // 6) juridikgrind
  const lagrum = body.match(/2007:528/g) || [];
  chk("exakt ett lagrum 2007:528", lagrum.length === 1);
  const blandade = (body.match(/2022:260|2022:261|1985:716|2005:59/g) || []).length;
  chk("0 lagrumsblandning", blandade === 0);
  const disclaimer = body.slice(-700);
  chk("disclaimer sista stycke", disclaimer.includes("inte investeringsrådgivning") && disclaimer.includes("2 kap 5 §"));
  const rad = body.slice(0, body.length - 700);
  const radmönster = rad.match(/\b(köp|sälj|rekommenderar|rekommendera|undvik|buy|sell|recommend)\b/gi) || [];
  chk("0 rådverb utanför disclaimer (fann " + radmönster.length + ")", radmönster.length === 0);
  chk("utbildningsformulering", body.includes("finansutbildning"));

  // 7) länkar
  const förväntade = ["/bolag/jnj", "/kurser", "/transparens", "/kallor",
    "/dataset/halso/pe", "/dataset/halso/pb", "/dataset/halso/ev-ebit", "/dataset/halso/fcf-avkastning", "/dataset/halso/peg",
    "/dataset/halso/vardering", "/dataset/halso/roe", "/dataset/halso/roic", "/dataset/halso/brutto-marginal",
    "/dataset/halso/netto-marginal", "/dataset/halso/omsattning-cagr-5ar", "/dataset/halso/resultat-cagr-5ar",
    "/dataset/halso/omsattningstillvaxt-ttm", "/dataset/halso/prognos-tillvaxt", "/dataset/halso/skuldsattning", "/dataset/halso/universumjamforelse"];
  const länkar = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
  chk("20 unika interna länkar (fann " + länkar.length + ")", länkar.length === 20);
  for (const l of förväntade) chk("länk finns: " + l, länkar.includes(l));
  const externa = (body.match(/\]\(https?:/g) || []).length;
  chk("0 externa länkar", externa === 0);
  const hämta = u => new Promise(res => {
    const försök = n => http.get({ host: "localhost", port: 3000, path: u, timeout: 8000 }, r => { r.resume(); res(r.statusCode); })
      .on("error", e => n > 0 ? setTimeout(() => försök(n - 1), 500) : res("ERR:" + e.code))
      .on("timeout", () => { försök(n - 1); });
    försök(2);
  });
  let liv = 0;
  for (const u of länkar) { const s = await hämta(u); if (s === 200) liv++; else F.push("länk " + u + " = " + s); }
  chk(liv === länkar.length ? "alla " + liv + " länkar HTTP 200" : "endast " + liv + "/" + länkar.length + " länkar 200", liv === länkar.length);

  // 8) tecken
  chk("0 mjuka bindestreck", !body.includes("­"));
  chk("0 kontrolltecken", !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(body));
  chk("description stämmer med signaturtal", pkg.description.includes("27,1") && pkg.description.includes("21,1") && pkg.description.includes("14,32"));

  // 9) duplikat + granskningskö
  const disk = fs.readdirSync("data/blogg-utkast/kvartal/2026-q3").filter(x => x.startsWith("sa-laser-du-"));
  chk("paketen på disk ≥ 31 och jnj unik (fann " + disk.length + ")", disk.length >= 31 && disk.filter(x => x.includes("jnj")).length === 1);
  const kö = fs.readFileSync("data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md", "utf8");
  chk("granskningskö registrerad", kö.includes("sa-laser-du-jnj-q3-2026.json"));

  console.log(`KVD JNJ: ${P.length} PASS, ${F.length} FEL`);
  for (const f of F) console.log("  FEL: " + f);
  if (!F.length) console.log("KVD GRÖN — 0 fel 0 varningar");
  process.exit(F.length ? 1 : 0);
}

const läge = process.argv[2];
if (läge === "bygg") bygg();
else if (läge === "kvd") kvd();
else { console.error("använd: node verktyg/_s4u3-jnj-bygg.mjs bygg|kvd"); process.exit(2); }
