// Sond: E36 Mediebiblioteket — dokvåg s9-u1-omstart (anspråk2 på disk FÖRE mätning).
// Allt lokal offline-mätning; Supabase-nycklar läses ALDRIG. Rådata till
// data/vakten/ (gitignorerad väg).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const rad = (k, v) => console.log(`${k}: ${v}`);

// 1. Backup-cadansen: alla media-filer-*.json med mtime + storlek
const bDir = 'data/backups';
const bFiler = readdirSync(bDir).filter(f => /^media-filer-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
rad('backup_antal', bFiler.length);
for (const f of bFiler) {
  const s = statSync(`${bDir}/${f}`);
  rad('backup_fil', `${f} · ${s.size.toLocaleString('sv')} B · mtime ${s.mtime.toISOString().slice(0, 19)}`);
}

// 2. Innehåll: antal objekt + total storlek + format, de två senaste + den första
for (const f of [bFiler[0], ...bFiler.slice(-2)]) {
  try {
    const j = JSON.parse(readFileSync(`${bDir}/${f}`, 'utf8'));
    const arr = Array.isArray(j) ? j : (j.filer ?? j.objekt ?? j.items ?? null);
    if (!arr) { rad('backup_innehall', `${f}: okänd form — topnycklar ${Object.keys(j).slice(0,6).join(',')}`); continue; }
    const storlekSumma = arr.reduce((a, o) => a + (o.storlek ?? o.size ?? o.bytes ?? 0), 0);
    const format = {};
    for (const o of arr) {
      const n = (o.namn ?? o.name ?? o.path ?? '').toLowerCase();
      const ext = n.includes('.') ? n.split('.').pop() : '(ingen)';
      format[ext] = (format[ext] ?? 0) + 1;
    }
    rad('backup_innehall', `${f}: ${arr.length} objekt · ${Math.round(storlekSumma / 1024).toLocaleString('sv')} KiB summa · format ${JSON.stringify(format)}`);
    const sokVag = arr[0] ? Object.keys(arr[0]).join(',') : '-';
    rad('backup_falt', `${f}: ${sokVag}`);
  } catch (e) { rad('backup_fel', `${f}: ${e.message}`); }
}

// 3. Tillväxt diff: nyckelmängd sista vs föregående
if (bFiler.length >= 2) {
  const las = f => { const j = JSON.parse(readFileSync(`${bDir}/${f}`, 'utf8')); const arr = Array.isArray(j) ? j : (j.filer ?? j.objekt ?? j.items); return new Set(arr.map(o => o.namn ?? o.name ?? o.path ?? JSON.stringify(o))); };
  const a = las(bFiler[bFiler.length - 2]), b = las(bFiler[bFiler.length - 1]);
  const nya = [...b].filter(x => !a.has(x));
  const borta = [...a].filter(x => !b.has(x));
  rad('backup_diff', `${bFiler[bFiler.length-2]}→${bFiler[bFiler.length-1]}: +${nya.length} nya · -${borta.length} borta`);
}

// 4. Drivningen: vem skriver media-filer-*.json?
const grepI = (fil, mönster) => { try { return execFileSync('grep', ['-c', mönster, fil], { encoding: 'utf8' }).trim(); } catch { return '0'; } };
const verktyg = readdirSync('verktyg');
const trafIVerktyg = verktyg.filter(f => f.endsWith('.mjs') || f.endsWith('.sh')).filter(f => grepI(`verktyg/${f}`, 'media-filer') !== '0');
rad('drivning_verktyg', trafIVerktyg.join(', ') || '0 träffar i verktyg/');
try { rad('drivning_crontab_anv', execFileSync('bash', ['-c', 'crontab -l 2>/dev/null | grep -c media || true'], { encoding: 'utf8' }).trim() + ' media-rader'); } catch { rad('drivning_crontab_anv', 'okänd'); }
try { rad('drivning_etc_crontab', execFileSync('bash', ['-c', 'grep -c media /etc/crontab 2>/dev/null || echo 0'], { encoding: 'utf8' }).trim() + ' media-rader'); } catch { rad('drivning_etc_crontab', '0/oläsbar'); }
try { const infra = execFileSync('bash', ['-c', 'grep -rl "media-filer" data/infra/ 2>/dev/null | head -5'], { encoding: 'utf8' }).trim(); rad('drivning_data_infra', infra || '0 träffar'); } catch { rad('drivning_data_infra', '0'); }

// 5. Sviten med SANN exitkod (pipe-fällan: execFileSync ger verklig kod som undantag)
try {
  const ut = execFileSync('node', ['verktyg/testa-mediabibliotek.mjs'], { encoding: 'utf8', timeout: 120000 });
  rad('svit_exit', '0');
  rad('svit_sista', ut.trim().split('\n').slice(-3).join(' | ').slice(0, 300));
} catch (e) {
  rad('svit_exit', String(e.status ?? 'okänd'));
  rad('svit_sista', String(e.stdout ?? '').trim().split('\n').slice(-3).join(' | ').slice(0, 300));
}

// 6. OG-koppling: deploy-skriptet + public/og
rad('og_deployaskript_träffar', grepI('verktyg/deploya-contabo.sh', 'og-generate'));
try {
  const ogFiler = readdirSync('public/og');
  rad('og_public_antal', ogFiler.length);
  const ogGit = execFileSync('bash', ['-c', 'git log --oneline -1 --format="%h %ad %s" --date=short -- public/og 2>/dev/null'], { encoding: 'utf8' }).trim();
  rad('og_git_senast', ogGit || 'aldrig');
} catch (e) { rad('og_public', `fel: ${e.message.slice(0, 80)}`); }

// 7. Kärnfilens stillastående: radtal + senaste commit
try {
  const src = readFileSync('src/lib/mediabibliotek.ts', 'utf8');
  rad('karnfil_rader', src.split('\n').length);
  const senast = execFileSync('bash', ['-c', 'git log -1 --format="%h %ad" --date=short -- src/lib/mediabibliotek.ts'], { encoding: 'utf8' }).trim();
  rad('karnfil_git_senast', senast);
} catch (e) { rad('karnfil_fel', e.message.slice(0, 80)); }

rad('matt_nu', new Date().toISOString());
