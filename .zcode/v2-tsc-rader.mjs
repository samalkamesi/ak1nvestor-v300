// V2-P1: räkna ALLA tsc-utdatarader (ej bara fel) för att verifiera SYSTEMKARTANs
// "36 rader = 34 fel + 2 fortsättningsrader"-förklaring
import { execSync } from 'node:child_process';

try {
  const ut = execSync('npx tsc --noEmit', {
    cwd: '/home/ak1a/agent/ak1',
    encoding: 'utf8',
    timeout: 5 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const rader = ut.split('\n');
  const ickeTomma = rader.filter(Boolean);
  const fel = ickeTomma.filter((l) => /error TS/.test(l));
  console.log(`kördatum-UTC: ${new Date().toISOString()}`);
  console.log(`totala rader (ej tomma): ${ickeTomma.length}`);
  console.log(`rader med "error TS": ${fel.length}`);
  console.log(`rader UTAN "error TS": ${ickeTomma.length - fel.length}`);
  console.log('--- rader utan error TS ---');
  console.log(ickeTomma.filter((l) => !/error TS/.test(l)).join('\n'));
} catch (e) {
  const ut = (e.stdout || '').toString();
  const rader = ut.split('\n').filter(Boolean);
  const fel = rader.filter((l) => /error TS/.test(l));
  console.log(`kördatum-UTC: ${new Date().toISOString()} (exit ${e.status})`);
  console.log(`totala rader (ej tomma): ${rader.length}`);
  console.log(`rader med "error TS": ${fel.length}`);
  console.log(`rader UTAN "error TS": ${rader.length - fel.length}`);
  console.log('--- rader utan error TS ---');
  console.log(rader.filter((l) => !/error TS/.test(l)).join('\n'));
}
