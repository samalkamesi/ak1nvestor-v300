// _v222-commit.mjs — rondecommit för våg 222 via node-kanalen (skal-skydd).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const MEDD = '/tmp/v222-msg.txt';
fs.writeFileSync(MEDD, `studio: [organ:Φ] v222 rundleverans — kvalitetsvakten GRÖN 13/13 + byggutfallet bokfört + v221-verktygen arkiverade

- KVALITETSVAKTEN GRÖN (0 fel · 0 manuella, omkörning 03:19): rapportens enda fel
  (/zcode "saknas i sitemap") hade fel klass — /zcode är v216:s en-trycks-ingång
  till agentchatten och dess layout sätter MEDVETET robots noindex/nofollow
  ("privat chatsida — ALDRIG indexerad"); rätten var vaktens uteslutningslista
  bredvid syskonet /studio (VÅG 81), INTE sitemap-tillägg som muzzle:t
  "Submitted URL marked noindex"-fällan (samma skäl som /pro-spärren V86).
- BYGGUTFALLET VÅG 221 BOKFÖRT: v221-byggscriptet (start 02:04:27) fullföljde
  aldrig sin egen logg; en byggkedja löpte 02:25→02:50 (byggvaktens vittne,
  BUILD_ID OOds…) men en parallell session parkerade den som .next-bak-0304
  och återställde känd-goda .next (32w…, 00:13) med pm2-omstart 02:52 —
  prod serverar KÄND-GOOD + datan på disk (HEAD 91bf24c5, 507-unionen lever).
- PROD-HÄLSA MÄTT: / 200 · zcode-rutten 401 (LEVANDE — r359:s 404 läkt) ·
  ud-10 200 (dev-trådens sex serveras) · am-10 404 (fabrikens sex väntar på
  nästa deploy-bygge — käll-JSON + register lever i HEAD, ingen förlust) ·
  last 10–11 förklarad (parallell sessions ssr500-test + fabrik auto-s8-retry).
- deep-courses.json = 21,3 MB (41–45 s serveringstid under lasten) — bokförd
  för prestandaspåret; INTE en v221-regression (växer med kurstillväxten).
- Verktyg: _v221-* (bygg/bevakare/diagnos/vakt/läka/merge/verifiering) +
  _v222-* (lagesond/nextkoll/prodsond/lastkoll/commit) arkiverade som
  vaccinationsbevis; nästa deploy-bygge (prod-synkens ägo) tar med
  sitemap-vaktkorrigeringen via verktygsfilen (ingen src-ändring krävs).`);

function ko(kommando, takSek = 60) {
  try {
    const ut = execFileSync('bash', ['-c', kommando], { encoding: 'utf8', timeout: takSek * 1000, cwd: '/home/ak1a/agent/ak1' });
    return ut.trim();
  } catch (e) {
    return 'FEL: ' + String(e.stdout || e.message).split('\n').slice(-6).join('\n');
  }
}

console.log('== STATUS FÖRE ==');
console.log(ko('git status --short'));
console.log('\n== ADD ==');
console.log(ko('git add worklog.md verktyg/kvalitetsvakt.mjs verktyg/_v221-*.mjs verktyg/_v222-*.mjs verktyg/_v221-*.txt data/rapporter/kvalitetsrapport-SENASTE.md 2>&1; git add -u data/rapporter 2>/dev/null; git status --short | head -25'));
console.log('\n== COMMIT ==');
console.log(ko('git commit -F /tmp/v222-msg.txt 2>&1 | tail -6', 300));
console.log('\n== EFTER ==');
console.log(ko('git log --oneline -1 && git status --short | head -5'));
