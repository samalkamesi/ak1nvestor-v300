// _v223-commit.mjs — hjärtslagsrondens dataleverans-commit.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
function ko(c, t = 60) { try { return execFileSync('bash', ['-c', c], { encoding: 'utf8', timeout: t * 1000, cwd: '/home/ak1a/agent/ak1' }).trim(); } catch (e) { return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-4).join('\n'); } }

fs.writeFileSync('/tmp/v223-msg.txt', `studio: [organ:Φ] v223 hjärtslagsrond — buntslagsrace-analysen (o575) + kön omrokaderad: v224 R-lösningen före v219

UTLÖSARE: prod-synkens abort-rad 04:19:55Z — fabrikens s8-u2-commit mittemot
det hungriga deploy-bygget; hela 52-minutersbygget på ombyggskö (tredje
race-händelsen på ett dygn: v221-ko-incidenten, zcode-dubbelleveransen,
buntslagsracet — alla samma rot: prod-trädets tre skrivare utan gemensam
byggfönster-semafor; kollisionerna fångas av git-spärrarna EFTERÅT, säkert
men dyrt).

LEVERANS: data/forskning/OPTIMERING/o575-buntslagsrace-analys.md —
händelsetabell, nulägets tre skydd (updateInstead, buntslagskontroll, V235),
riskbild (hungrig deploy + aktiv fabrik = race-ruta; 12-manifest + hungrig
deploy = flera race i rad), tre lösningar: R (fabrik-tyst-väntan efter
abort — rekommenderad, egen fil prod-synk.mjs), K (generaliserad v21-regel:
INTENT-fil före commit), NI (avstå — motargumenterat). Bokning: v224 =
R-lösningen → därefter v219 (fortsatt gated på fabrik-tyst + lås + G1–G4).
Dataleverans: ingen kod i maskineriet rörd (fabrik + synk aktiva i sina
filer). Worklog v223 + PIPELINE-KO omrokaderad. Verktyg: _v223-läge.mjs.`);

console.log(ko('git add data/forskning/OPTIMERING/o575-buntslagsrace-analys.md data/forskning/PIPELINE-KO.md worklog.md verktyg/_v223-lage.mjs verktyg/_v222-slutcommit.mjs 2>&1 | tail -2'));
console.log(ko('git commit -F /tmp/v223-msg.txt 2>&1 | tail -3', 300));
console.log('\n' + ko('git log --oneline -2'));
console.log('yta: ' + (ko('git status --short | head -3') || '(ren)'));
