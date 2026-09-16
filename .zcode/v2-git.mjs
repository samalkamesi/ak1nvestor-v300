// V2: generell git-wrapper (bash-blocker: "git"-kommandon fastnar intermittent)
// kör: node .zcode/v2-git.mjs "<git-argument>" [sökväg]
// Skriver ALLTID även till .zcode/v2-git.log så resultat kan verifieras
// även när studio-klienten tappar svaret.
// V3-härdning (o21): skalfri arrayform — argumentsträngen tokeniseras
// citationstecksmedvetet i JS och execFileSync kör git UTAN skal;
// metatecken i argument kan aldrig exekveras, värsta fall ger git ett
// synligt felmeddelande.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const args = process.argv[2];
if (!args) {
  console.error('användning: node .zcode/v2-git.mjs "<git-args>"');
  process.exit(1);
}

function tokenisera(s) {
  const ut = [];
  let nu = '';
  let citat = null;
  for (const tecken of s) {
    if (citat) {
      if (tecken === citat) citat = null;
      else nu += tecken;
    } else if (tecken === '"' || tecken === "'") {
      citat = tecken;
    } else if (/\s/.test(tecken)) {
      if (nu) { ut.push(nu); nu = ''; }
    } else nu += tecken;
  }
  if (nu) ut.push(nu);
  return ut;
}

const logg = '/home/ak1a/agent/ak1/.zcode/v2-git.log';
let ut = '';
try {
  ut = execFileSync('git', tokenisera(args), {
    cwd: '/home/ak1a/agent/ak1',
    encoding: 'utf8',
    timeout: 60 * 1000,
    maxBuffer: 16 * 1024 * 1024,
  });
} catch (e) {
  ut = 'EXIT ' + (e.status ?? '?') + '\n' + (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
}
appendFileSync(logg, `=== ${new Date().toISOString()} :: git ${args}\n${ut}\n`);
console.log(ut);
