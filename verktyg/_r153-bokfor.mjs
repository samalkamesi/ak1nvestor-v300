// Rond 153 — bokföring + commit + push (node-kanalen hela vägen, skal-säkert)
import fs from 'node:fs';
import { execFileSync, execFile } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';

// 1. Worklog-rad (kronologiskt sist)
const worklogRad = `
## Rond 153 [organ:Ψ] — 2026-09-21 23:5xZ: KUNDUPPDRAGET RAPPORTAKADEMIN FORMELLT STÄNGT (uppdrag-klart.json skriven)
DoD-verifierad mekaniskt före domen (r153-dod-sond): ABB-passet 200 https+localhost · gästGET 200+kod "inloggning" + POST-utan-auth 401 (bedöm-först-grindens båda halvor, r148-kuren live i prod-bygget 20:43Z) · laggrundade kur-commits anfäder prod-HEAD (citat-validator 8abf541e, GET-kur 141c7e77, nav-entré 443e6a2b) · RIKTAD gränssnittsvakt EFTER deploy: 0 fynd bland 4 kombinationer (granssnitt-2026-09-21T234820.json, båda teman × mobil/dator — sista DoD-punkten). Sondfyndet "sidan saknas i 23:25-svepet" var ROTENLÖST: sitemap bär sidan + vakt-sidjournalen journalförde den 22:27 — rotationen (äldst-först) är sund, ingen kodändring krävd; riktad körning gav EFTER-beviset istället. Motorer 107/0/0. R2-VÄNTAR-KUND-listan står orörd enligt beslutet (minimeringsfältlista, gallringsjobb, art 13-yta, export/radering, backup-gallring, beslutsminne-lagrumstvång, FLYTTKLARA publiceringar) — kunden påmind. PIPELINE-KO: ≥3 vågor bokade (v232 villkorat fullsvep, v233 prestanda, s8 m-kapitel+Docs-Offline) — evighetsmotorn matad. [studio]
`;
fs.appendFileSync(ROT + '/worklog.md', worklogRad);

// 2. Beslutsminne-rad
const beslut = {
  ts: new Date().toISOString(),
  rond: 153,
  beslut: "Kunduppdraget RAPPORTAKADEMIN stängt på komplett DoD-kedja ( LIVE 200 + bedöm-först 200/401 + vakt 0/4 EFTER deploy + laggrundade commits anfäder prod-HEAD + motorer 107/0/0); R2-resterna förblir kundens; vaktjournalens rotation dömd sund på sitemap+journal-bevis",
  landat: "data/vakten/uppdrag-klart.json + r153-sonder + worklog",
};
fs.appendFileSync(ROT + '/data/vakten/beslutsminne.jsonl', JSON.stringify(beslut) + '\n');

// 3. Commit med explicit pathspec
const medd = `studio: rond 153 [organ:Ψ] — kunduppdraget RAPPORTAKADEMIN stängt: DoD mekaniskt verifierad (sond 200/401/0-fynd-EFTER-deploy + 3 kur-anfäder i prod-HEAD) + uppdrag-klart.json + R2-påminnelse`; 
fs.writeFileSync('/tmp/r153-msg.txt', medd);
const filer = [
  'data/vakten/uppdrag-klart.json',
  'data/vakten/r153-dod-sond.json',
  'data/vakten/r153-vaktsond.json',
  'data/vakten/r153-riktad-vakt.json',
  'verktyg/_r153-dod-sond.mjs',
  'verktyg/_r153-vaktsond.mjs',
  'verktyg/_r153-riktad-vakt.mjs',
  'verktyg/_r153-bokfor.mjs',
  'worklog.md',
  'data/vakten/beslutsminne.jsonl',
];
execFileSync('git', ['add', ...filer], { cwd: ROT, stdio: 'pipe' });
execFileSync('git', ['commit', '-F', '/tmp/r153-msg.txt'], { cwd: ROT, stdio: 'pipe' });
const hash = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROT }).toString().trim();
console.log('COMMIT:', hash);

// 4. Push med fetch-first + upp till 3 försök (fabrikens träd kan vara upptaget)
const pusha = () => new Promise((res) => {
  execFile('git', ['push', 'prod', 'develop'], { cwd: ROT, timeout: 60000 }, (fel, ut) => {
    res({ fel: fel ? String(fel).slice(0, 200) : null, ut: String(ut).slice(0, 300) });
  });
});
let resultat = null;
for (let i = 1; i <= 3; i++) {
  try { execFileSync('git', ['fetch', 'prod', 'develop'], { cwd: ROT, stdio: 'pipe' }); } catch {}
  resultat = await pusha();
  console.log(`push-försök ${i}:`, resultat.fel ?? resultat.ut);
  if (!resultat.fel) break;
  // merge om prod gått framåt, försök igen
  try {
    execFileSync('git', ['merge', '-X', 'theirs', '--no-edit', 'prod/develop'], { cwd: ROT, stdio: 'pipe' });
  } catch (e) { console.log('merge:', String(e).slice(0, 150)); }
  await new Promise(r => setTimeout(r, 20000));
}
console.log(resultat?.fel ? 'PUSH VÄNTAR (träd upptaget) — commit landad lokalt' : 'PUSH GRÖN');
