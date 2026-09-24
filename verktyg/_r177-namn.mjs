// Byt namn på studions _f13-verktyg (krockar med prod-trädets untracked
// filer med samma namn) + commit + push — hela kedjan i node-kanalen.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const steg = [];
const kör = (args, vad) => {
  try {
    const ut = execFileSync('git', args, { encoding: 'utf8', stderr: 'pipe' });
    steg.push(`${vad}: OK`);
    return ut;
  } catch (e) {
    steg.push(`${vad}: FEL — ${((e.stdout || '') + (e.stderr || '')).slice(0, 300)}`);
    throw new Error(steg.join('\n'));
  }
};

try {
  if (fs.existsSync('verktyg/_f13-v166d13-append.mjs')) {
    kör(['mv', 'verktyg/_f13-v166d13-append.mjs', 'verktyg/_f13-v166d13-studio-append.mjs'], 'mv append');
  }
  if (fs.existsSync('verktyg/_f13-v166d13-kvd.mjs')) {
    kör(['mv', 'verktyg/_f13-v166d13-kvd.mjs', 'verktyg/_f13-v166d13-studio-kvd.mjs'], 'mv kvd');
  }
  kör(['commit', '-m', 'studio: [organ:Φ] d13-verktyg omdöpta till studio-namn (_f13-v166d13-studio-{append,kvd}.mjs) — krockar med prod-trädets untracked _f13-filer med samma namn (parallell d13-session); historian af742a0c hänvisar till gamla namnen, innehållet oförändrat'], 'commit');
  const ut = kör(['push', 'prod', 'develop'], 'push');
  console.log(steg.join('\n'));
  console.log(ut.slice(0, 400));
} catch (e) {
  console.log('AVBRUTEN:\n' + e.message);
  process.exit(1);
}
