// wrapper: kör AI-mentor-kedjetestet och fånga utdata till fil (skal-fönstret kan tappa stdout)
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
try {
  const ut = execSync('node /home/ak1a/agent/ak1/verktyg/testa-ai-mentor-kedja.mjs 2>&1', { timeout: 240000, cwd: '/home/ak1a/agent/ak1' }).toString();
  writeFileSync('/tmp/v168-kedja.txt', ut);
  console.log('körkt — se /tmp/v168-kedja.txt');
} catch (e) {
  const ut = (e.stdout || '') + '\n[FEL] ' + (e.stderr || e.message);
  writeFileSync('/tmp/v168-kedja.txt', ut);
  console.log('fel — se /tmp/v168-kedja.txt');
}
