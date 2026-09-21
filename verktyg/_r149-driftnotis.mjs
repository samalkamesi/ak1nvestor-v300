// Rond 149-driftnotis: .next-saknad + fyra mördade byggen — DRIFTSBOKEN + worklog + beslutsminne + commit + push
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 250); } };
const blockerare = () => S(P, 'git', ['status', '--porcelain'], 30000).trim().split('\n').filter(r => r && !r.startsWith('??'));
const ut = { nu: new Date().toISOString() };

// idempotens: redan bokförd?
if (/drift-notis/.test(S(A, 'git', ['log', '--oneline', '-3'], 30000))) { ut.hoppa = 'redan bokförd'; console.log(JSON.stringify(ut, null, 1)); process.exit(0); }

fs.appendFileSync(A + '/data/DRIFTSBOKEN.md', `
## ROND 149 drift-notis [organ:Δ] — .next SAKNAS sedan 18:46Z: fyra mördade byggen, prod lever på pm2-minnet (2026-09-21, ÖPPEN — synken äger avslutet)

- **Symptom:** .next/BUILD_ID saknas (avbrutet bygge 18:46Z rev den); fyra
  byggförsök dödade med "Killed" i Turbopacks optimeringsfas (18:37Z huvudagent,
  19:27Z synk, 19:37Z huvudagent, 19:41Z huvudagent med ren .next + heap-tak
  3072 MB) — samtliga under fabrikens aktiva omgång auto-s2 (3 barn ≈ 2,4 GB)
  med gott RAM före/efter mätning (5,7–6,5 GB). Före 18:46Z byggde samma kedja
  GRÖNT (17:52Z deploy 27a582a0) vid lägre systemtryck.
- **Bevisläge (omördarutrett):** kernel-OOM-loggen ej läsbar utan root (dmesg
  Operation not permitted · sudo förbjudet auto-policy · journalctl hänger);
  fabrikens kills gäller dess egna barn (kodgranskad); kraschvaktens
  räddningslogg är från 09-14 (ej aktiv). Kvar som mest sannolik rot:
  bygg×fabrik-kapplöpning om minnet — byggtoppen + 3 fabrikens barn + 4,3 GB
  swap-användning överskrider taket momentant.
- **Risk:** pm2 startar om ak1a (t.ex. vaccin-taket 2500M) INNAN grönt bygg ⇒
  sajten kan ej starta. Kraschvakt + synkens läkebackup-vägar kvarstår som skydd.
- **Beslut (vaccin):** huvudagenten bygger ALDRIG manuellt medan fabriken har
  aktiva manifest — fyra mördade bygg varav tre våra; synkens poll+sekvensering
  (V235) äger byggloopen och lyckas när fabriktrycket sjunker. DoD-bevakare
  (r148) pollar API-formen och kör riktad vakt autonomt vid grönt bygg.

SLUT — sektion inlagd av huvudagenten (rond 149) 2026-09-21.
`);

const rad = JSON.stringify({
  ts: ut.nu, rond: 149,
  beslut: 'Drift-notis: .next saknas sedan 18:46Z, fyra bygg mördade (Killed i optimeringsfasen, fabriktryck); prod lever på pm2-minnet; beslut+vaccin: huvudagenten bygger aldrig manuellt under aktiv fabrik — synken (V235) äger byggloopen; kernel-logg kräver root (nekad); DoD-bevakare kvar som autonom stängning',
  landat: 'DRIFTSBOKEN-sektion + worklog'
}) + '\n';
for (const t of [A + '/data/vakten/beslutsminne.jsonl', P + '/data/vakten/beslutsminne.jsonl']) { try { fs.appendFileSync(t, rad); } catch (e) { ut.minneFEL = e.message.slice(0, 60); } }

fs.appendFileSync(A + '/worklog.md', '\n## ROND 149 drift-notis [organ:Δ] — .next-saknad + fyra mördade byggen dokumenterade i DRIFTSBOKEN; beslut: manuella bygg FÖRBJUDNA under aktiv fabrik (synken äger, V235); DoD-bevakare kvar; kernel-OOM-bevis kräver root (nekad auto-policy)\n');

S(A, 'git', ['add', '-A'], 60000);
ut.commit = S(A, 'git', ['commit', '-m', 'studio: rond 149 drift-notis [organ:Δ] — .next saknas sedan 18:46Z: fyra mördade byggen (Killed i optimeringsfas under fabriktryck) dokumenterade; prod lever på pm2-minnet; VACCIN: huvudagenten bygger aldrig manuellt under aktiv fabrik — synkens V235-sekvensering äger byggloopen; DoD-bevakare pollar autonomt'], 300000).split('\n').find(r => /files changed|develop/i.test(r)) || 'OK';
for (let i = 1; i <= 4; i++) {
  if ((blockerare() || []).length === 0) {
    S(A, 'git', ['fetch', 'prod', 'develop'], 60000);
    const bakom = +(S(A, 'git', ['rev-list', '--count', 'HEAD..prod/develop'], 30000).trim() || '0');
    if (bakom > 0) S(A, 'git', ['merge', 'prod/develop', '--no-edit', '-m', 'studio: merge prod → develop (rond 149 drift-notis)'], 120000);
    const push = S(A, 'git', ['push', 'prod', 'develop'], 120000);
    if (!/FEL/.test(push)) { ut.pushad = true; break; }
    ut['retry' + i] = push.slice(0, 90);
  } else { ut['vantar' + i] = blockerare().slice(0, 2); }
  if (i < 4) await new Promise(r => setTimeout(r, 50000));
}
ut.head = S(A, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 80);
console.log(JSON.stringify(ut, null, 1));
