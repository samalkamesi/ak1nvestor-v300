// rp-06 + pe-07: alla signaturtal uträknade exakt FÖRE kurstexterna skrivs
const r2 = x => Math.round(x * 100) / 100;
const r3 = x => Math.round(x * 1000) / 1000;
const r4 = x => Math.round(x * 10000) / 10000;

console.log('=== RP-06 VOLATILITETSDRAGET ===');
// spegelparet +20/−20
console.log('+20/−20: 100×1,20×0,80 =', r2(100 * 1.2 * 0.8));
console.log('  geometrisk/år: sqrt(0,96)−1 =', r4(Math.sqrt(0.96) - 1), '=', (Math.round((Math.sqrt(0.96) - 1) * 10000) / 100) + '%');
console.log('  drag: 0 − (−2,0204) = 2,02 pp; approx σ²/2 = 2,00');
// +50/−50
console.log('+50/−50: 100×1,50×0,50 =', r2(100 * 1.5 * 0.5), ' → tillbaka kräver', r2(100 / 75 * 100 - 100) + '%');
// reparationstrappan
for (const f of [0.9, 0.8, 2 / 3, 0.5]) console.log(`  −${r2((1 - f) * 100)}% kräver +${r2((1 / f - 1) * 100)}%`);
// tre portföljer: aritmetiskt 10%, σ = 10/20/30 (tvåpunktsmodell ±σ kring μ)
const rows = [];
for (const s of [0.10, 0.20, 0.30]) {
  const upp = 0.10 + s, ned = 0.10 - s;
  const geo = Math.sqrt((1 + upp) * (1 + ned)) - 1;
  const multi20 = Math.pow(1 + geo, 20);
  rows.push({ s, upp, ned, geo, drag: 0.10 - geo, approx: s * s / 2, multi20 });
  console.log(`σ=${(s * 100).toFixed(0)}%: år ${upp >= 0 ? '+' : ''}${(upp * 100).toFixed(0)}/${(ned * 100).toFixed(0)} · geo ${r2(geo * 100)}% · drag ${r2((0.10 - geo) * 100)} pp (approx ${r2(s * s / 2 * 100)}) · 20 år: ${r2(multi20)}x`);
}
// kontinuitet med rp-05: serien +30/−10
console.log('rp-05-kontinuitet: sqrt(1,30×0,90)−1 =', r4(Math.sqrt(1.3 * 0.9) - 1), '→ 8,17% (rp-05:s tal)');
// fyra år samma bana utan uttag
console.log('20-årsmultiplar insatta ovan; kontroll: 1,0954^20 =', r2(Math.pow(1.095445, 20)), '· 1,0817^20 =', r2(Math.pow(1.081671, 20)), '· 1,0583^20 =', r2(Math.pow(1.058301, 20)));

console.log('=== PE-07 CO-INVESTERINGEN ===');
// samma affär två priser: 2,0x brutto; fond: carry 20% på vinst, avgifter 12 sammanlagt
console.log('Samma affär 2,0x: fond-LP: 200 − 20 − 12 =', 200 - 20 - 12, '; co-invest: 200; gap', 200 - 168);
// urvalsasymmetrin: GP:s helägda 2,10x, erbjudna 1,70x
const keptNet = 210 - 0.20 * (210 - 100) - 12;
console.log('Helägda 2,10x: 210 − carry 22 − avgifter 12 =', keptNet);
console.log('Erbjudna 1,70x: 170 − 0 − 0 = 170');
console.log('Gap till fondens fördel:', r2(keptNet - 170), 'enheter trots 34 enheter avgift+carry');
// avgiftsbesparing på den erbjudna affären om den burits i fonden
const offeredInFund = 170 - 0.20 * (170 - 100) - 12;
console.log('Erbjudna i fonden: 170 − 14 − 12 =', offeredInFund, '→ besparingen =', 170 - offeredInFund, 'enheter');
// koncentration: fond 25 affärer vs en biljett
console.log('Koncentration: fond = 25 affärers utfall; co-invest-biljetten = 1 affär — ett nollresultat i fonden =', r2(100 / 25), '% av portföljen, i co-investet = 100%');
