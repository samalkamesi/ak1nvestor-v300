// Rond 160: boka kf-granskningens fynd (v160-underlag) + commit analys-skript + push.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const ws = '/home/ak1a/agent/ak1';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: ws, encoding: 'utf8', ...opts });
}

const rad =
  '\n## ITERATION kf-granskning [organ:Φ] — 2026-09-24: kf2/kf3 LEVERERADE på riktigt (djupsond, inte commitmeddelanden): /fas2 renderar ALLA 20 indikatorer live (V01-V20 + namn stickprovade: Försäljningstillväxt/ROE/Skuldsättningsgrad/Intäktsdiversifiering) — kf3 grönt. Startsida (kf2): CTA:er och rubriker STARKA ("Börja gratis →", "Bli medlem — gratis →", "Se kurserna"; hero "Bli analylikern som ser vad andra missar"; differentiering "inte en ström av tips") — men SOCIAL PROOF SAKNAR SIFFROR: inga "333 kurser"/"tre språk"/"94 blogginlägg" i sidtexten (bara 1 betyg + 1 år-träff) ⇒ konkret v160-förslag: statistikband under hero (333 kurser · tre språk sv/en/ar · 100 % översatt · 94 blogginlägg — ur data/siffror.json, guldkällan). Driftnotis: df74a530-bygget artefakt-stopp 06:15 (.next återställd ur läkebackup — kraschvakten skyddade; synken försöker igen 06:25, 3fa731d8 köar i samma sekvens; /fas2 i live-sitemap = restpost tills grönt bygg). Verktyg: _r160-{kfgranska,startsida2,status,boka}.mjs.\n';
appendFileSync(`${ws}/worklog.md`, rad);

git(['add', 'worklog.md', 'verktyg/_r160-kfgranska.mjs', 'verktyg/_r160-startsida2.mjs', 'verktyg/_r160-status.mjs', 'verktyg/_r160-boka.mjs']);
console.log('commit:', git(['commit', '-m', 'studio: iteration [organ:Φ] — kf2/kf3 verifierade live (20/20 indikatorer + CTA-karta; social proof saknar siffror = v160-underlag)'], { timeout: 240000 }).trim().slice(0, 80));
try {
  git(['push', 'prod', 'develop'], { timeout: 120000 });
  console.log('push: GRÖN');
} catch (e) {
  console.log('push avvisad:', String(e.stderr || e.message).slice(0, 150));
}
console.log('HEAD:', git(['log', '-1', '--format=%h %s']).slice(0, 90));
console.log('yta:', git(['status', '--porcelain']).trim() || '(ren)');
