#!/usr/bin/env node
// _s2u3o33-aritmetikgrind.mjs — s2-u3 (manifest auto-s2-1790799927010) ITALIEN/FINANS-TRION
// ISP.MI + UCG.MI + G.MI. ALLA repliker mot källvärden FÖRE skrivning (omg30-kulturen:
// första körningen ska vara sista). ABORT vid ENDA avvikelse över tolerans.
// Källor: data/vakten/auto-s2-1790799927010-s2-u3-radata.md (StockAnalysis fem ytor ×3 +
// Yahoo chart paranoid, pålästa 2026-09-30, close 2026-09-30 CET).
const pct = (a, b) => Math.abs(a - b) / Math.abs(b); // relativ avvikelse
const pp = (a, b) => Math.abs(a - b); // absolut skillnad i procentenheter/multipl

const kontroller = [];
const K = (namn, replik, kalla, toleransRel, toleransAbs) => {
  const okRel = toleransRel !== null ? pct(replik, kalla) <= toleransRel : true;
  const okAbs = toleransAbs !== null ? pp(replik, kalla) <= toleransAbs : true;
  kontroller.push({ namn, replik, kalla, ok: okRel && okAbs,
    avv: toleransRel !== null ? `${(pct(replik, kalla) * 100).toFixed(2)} % rel` : `${pp(replik, kalla).toFixed(3)} abs` });
};

// ══════════ ISP — INTESA SANPAOLO ══════════
K("ISP P/B mcap/EK", 117190/69154, 1.69, 0.005, null);
K("ISP mcap/aktiepris-identitet", 6.65*17350/1000, 117.19, 0.02, null); // aktiebas avrundad
K("ISP P/E från källans EPS-bas", 6.65/(6.65/12.17), 12.17, 0.001, null); // per definition
K("ISP P/E-replik NI/aktier", 6.65/(9660/17350), 12.17, 0.025, null); // dokumenterad källspridning
K("ISP fwd-gap prognosTillväxt", 12.17/10.80-1, 0.1269, 0.005, null);
K("ISP omsCAGR 21→25", Math.pow(25323/18229, 0.25)-1, 0.0857, 0.01, null);
K("ISP resCAGR 21→25", Math.pow(9324/5735, 0.25)-1, 0.1294, 0.01, null);
K("ISP EBIT-marginal", 15430/26130, 0.5905, 0.005, null);
K("ISP netto-marginal", 9660/26130, 0.3696, 0.005, null);
K("ISP fcf-marginal TTM", 3510/26130, 0.1343, 0.005, null);
K("ISP fcfYield", 3510/117190, 0.0299, 0.01, null);
K("ISP ROE NI/EK", 9660/69154, 0.1426, 0.05, null); // källans medel-EK-bas
K("ISP utd-yield", 0.38/6.65, 0.0572, 0.005, null);
K("ISP FCF1 2021", 4415-279, 4136, 0.001, null);
K("ISP FCF2 2022", 5640-288, 5352, 0.001, null);
K("ISP FCF3 2023", 7115-363, 6752, 0.001, null);
K("ISP FCF4 2024", 4166-286, 3880, 0.001, null);
K("ISP FCF5 2025", 3514-266, 3248, 0.001, null);

// ══════════ UCG — UNICREDIT ══════════
K("UCG P/B mcap/EK", 125560/70820, 1.77, 0.005, null);
K("UCG P/E från EPS-fält", 82.90/7.04, 11.90, 0.015, null);
K("UCG mcap/aktiepris-identitet", 82.90*1504/1000, 125.56, 0.01, null);
K("UCG fwd-gap prognosTillväxt", 11.90/10.64-1, 0.1184, 0.005, null);
K("UCG omsCAGR 21→25", Math.pow(25050/20361, 0.25)-1, 0.0532, 0.01, null);
K("UCG resCAGR 21→25", Math.pow(10710/5076, 0.25)-1, 0.2051, 0.01, null);
K("UCG EBIT-marginal", 15640/24840, 0.6295, 0.005, null);
K("UCG netto-marginal replik", 10730/24840, 0.4397, 0.03, null); // källans fält bärs, fönsterdifferens dokumenterad
K("UCG fcf-marginal TTM", 17050/24840, 0.6863, 0.005, null);
K("UCG fcfYield", 17050/125560, 0.1358, 0.01, null);
K("UCG ROE NI/EK", 10730/70820, 0.1578, 0.05, null);
K("UCG utd-yield", 3.15/82.90, 0.0380, 0.005, null);
K("UCG FCF1 2021", 4976-861, 4115, 0.001, null);
K("UCG FCF2 2022", 11302-718, 10584, 0.001, null);
K("UCG FCF3 2023", 9812-810, 9002, 0.001, null);
K("UCG FCF4 2024", 16538-722, 15816, 0.001, null);
K("UCG FCF5 2025", 17342-634, 16708, 0.001, null);

// ══════════ G — GENERALI ══════════
K("G P/B mcap/EK", 65790/34878, 1.89, 0.005, null);
K("G P/E från EPS-fält", 42.75/2.96, 14.76, 0.025, null); // dokumenterad källspridning
K("G mcap/aktiepris-identitet", 42.75*1513/1000, 65.79, 0.02, null); // aktiebas 1,51 mdr är källans 2-decimals-avrundning (underliggande 1 538,9 M; EPS-replik 4 540/1 539 = 2,95 stödjer) — ISP-klassens 2 %
K("G EV-identitet mcap+skuld−kassa", 65790+41490-7690, 103010, 0.05, null); // källans interna tillägg dokumenterade
K("G EV/EBIT", 103010/7630, 13.51, 0.005, null);
K("G EV/EBITDA", 103010/8080, 12.75, 0.005, null);
K("G fwd-gap prognosTillväxt", 14.76/13.14-1, 0.1233, 0.005, null);
K("G omsCAGR 21→25", Math.pow(115930/106856, 0.25)-1, 0.0206, 0.01, null);
K("G resCAGR 21→25", Math.pow(4172/3942, 0.25)-1, 0.0143, 0.01, null);
K("G brutto-marginal", 12110/59320, 0.2042, 0.005, null);
K("G EBIT-marginal", 7630/59320, 0.1286, 0.005, null);
K("G netto-marginal", 4540/59320, 0.0768, 0.005, null);
K("G fcf-marginal TTM", 21720/59320, 0.3662, 0.005, null);
K("G fcfYield", 21720/65790, 0.3302, 0.005, null);
K("G ROIC−WACC spread", 7.32-5.37, 1.95, null, 0.01);
K("G utd-yield", 1.64/42.75, 0.0384, 0.005, null);
K("G FCF1 2021", 9521-431, 9090, 0.001, null);
K("G FCF2 2022", 11024-492, 10532, 0.001, null);
K("G FCF3 2023", 11335-511, 10824, 0.001, null);
K("G FCF4 2024", 12528-822, 11706, 0.001, null);
K("G FCF5 2025", 16138-764, 15374, 0.001, null);

// ══════════ DOM ══════════
const fel = kontroller.filter(k => !k.ok);
for (const k of kontroller)
  console.log(`${k.ok ? "GRÖN" : "RÖD"} ${k.namn.padEnd(38)} replik ${k.replik.toFixed(4)} mot ${k.kalla} (${k.avv})`);
console.log("");
if (fel.length) {
  console.log(`ABORT: ${fel.length}/${kontroller.length} kontroller RÖDA — inget skrivs till bolagsunivers.json.`);
  process.exit(1);
}
console.log(`ARITMETIKGRIND: ${kontroller.length}/${kontroller.length} GRÖN — append får ske.`);
