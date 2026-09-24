// Rond 172 verkställning: kassera B-f21 (registrets dom) + rapport omkörning efter f19-kur
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const WS = '/home/ak1a/agent/ak1';
// 1) kassera dubletten som INTE är fabrikens leverans (registret: trading-in-the-zone.md är kanon)
execFileSync('git', ['rm', '-q', 'data/forskning/KURS-FAS3/underlag-f21-trading-in-zone.md'], { cwd: WS, encoding: 'utf8', timeout: 60000 });
console.log('B-f21 kasserad (fabrikens leveransrad = trading-in-the-zone.md, kod 0)');
// 2) f19-kur: "riskfria kapital" → kvalitetsvaktsren formulering
const p19 = WS + '/data/forskning/KURS-FAS3/underlag-f19-complete-turtletrader.md';
let t19 = fs.readFileSync(p19, 'utf8');
const fore = t19;
t19 = t19.replace('pappersexemplen är riskfria kapital', 'pappersexemplen riskerar inget kapital');
if (t19 === fore) { console.log('F19-KUR FÖLL: frasen hittades ej'); process.exit(1); }
fs.writeFileSync(p19, t19);
console.log('f19 kurad: riskfri-frasen omformulerad (varumärkesgrinden ren)');
