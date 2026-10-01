// _v225-paus.mjs — sätt AUTO-PAUS-kretsbrytaren i PROD (runtime, gitignorerad)
// + bokför skälet i pausfilen själv. Tas bort när pump-grinden deployats grönt.
import fs from 'node:fs';
const PAUS = '/home/ak1a/AK1/data/vakten/agentfabrik/AUTO-PAUS';
fs.writeFileSync(PAUS, `AUTO-PAUS — DRIFTBRYTARE mot buntslagsrace-loopen (satt av studio-sessionen [organ:Φ], ${new Date().toISOString()})

SKÄL: fyra buntslagsrace på ett dygn (01:54 ko-incident · 03:0x dubbelleverans ·
04:19:55 abort #1 · 05:24:30 abort #2) — evighetsmotorns auto-manifest (s8/s9/s10)
committar i prod-trädet medan prod-synkens HUNGRIGA deploy-byggen löper; varje
abort kostar ~50 min ombygg och loopen riskerar upprepas i evighet (o575-analysen:
"flera race i rad"). KUREN (pump-grinden v225) är IMPLEMENTERAD och committad i
utvecklingsträden — men kan inte landa förrän ETT deploy-bygge överlever.

DENNA PAUS: stoppar ENDAST ny AUTO-generering (evighetsmotorns auto-manifest).
Pågående s10-barn får slutföras i fred; köade/manuella manifest påverkas ej;
huvudagentens sessioner påverkas ej. BORTTAGNING: så snart pump-grinden
deployats GRÖNT (DEPLOYAD-rad + prod 200) — av sessionsägaren eller nästa
styrelserond. Se data/forskning/OPTIMERING/o575-buntslagsrace-analys.md.
`);
console.log('AUTO-PAUS satt i prod med motivering');
try { console.log('befintlig yta:', fs.readdirSync('/home/ak1a/AK1/data/vakten/agentfabrik').filter(f => f === 'AUTO-PAUS' || f.startsWith('ko') || f === 'status').join(', ')); } catch {}
