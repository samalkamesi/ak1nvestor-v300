// r259-bokfor: AR30-leveransens hela bokföringskedja (node-kanalen, KUR 1)
import { execSync } from 'node:child_process';
import { appendFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';

const sh = (cmd, opts = {}) => execSync(cmd, { encoding: 'utf8', timeout: 570000, maxBuffer: 32e6, ...opts }).toString().trim();

// 1) Trädhygien: engångssonder bort (ej bokföringsytor)
for (const f of ['verktyg/_r259-sond.mjs', 'verktyg/_r259-sond2.mjs', 'verktyg/_r259-sond3.mjs']) {
  try { unlinkSync(f); console.log('bort:', f); } catch (e) { console.log(e.code, f); }
}

// 2) Worklog rond 259
appendFileSync('worklog.md', `
## ROND 259 [organ:Φ] — v171 AR30: investmentbolag-ar LEVERERAD ⇒ TRESPRÅKSSPEGELNINGEN KOMPLETT — 2026-09-26
- B28-ar: förra trådpunktens bakgrundsdispatch dog tyst med klippningen (agents-katalogen bar inget spår) ⇒ omstart som förgrunds-subagent enligt B28-en-precedensen; klaimfil disk-först (PÅGÅR→KLAR med kvitto).
- Leverans: data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag-ar.json (1 299 ord, originalet 1 214) + KVD-skript verktyg/_r259-b28-ar-kvd.mjs + klaimfil data/vakten/s3-b28-ar-investmentbolag-ansprak-2026-09-26.md.
- KVD: 31/31 GRÖN i subagentens körning + OBEROENDE OMKÖRNING GRÖN av huvudsessionen (doktrinen: agentrapporter verifieras, antas inte) — sökord شركات الاستثمار i title+H1+ingress+2 H2 · korslänkar 18/18 multiset · externa 4/4 (industrivärden/investor/kinnevik/latour) · talparitet 66/66 språkmedveten (SV komma-decimal ↔ AR punktdecimal) · varumärkesgrind 26×3 ytor 0/0 · rådverb SV+EN+AR 0 · aritmetik 11/11 motorräknad · H2 5=5, H1 1=1 · läckor 0 (subagenten fångade egen svensk "eller"-läcka och kurerade till أو FÖRE leverans) · publishedAt = leveransdagen 2026-09-26 (AR24–AR29-konventionen).
- MILEPÅLE: med AR30 är branschguidefamiljen FULLSTÄNDIG i tre språk — 30 original (B1–B28 + energi + material) × sv/en/ar (30+30+30). Översättningsspåret SLUT; v171 kvarstår fyra nya svenska original (se-18 rederi, se-20 gruv/metall, se-21 kemi, se-23 stål — kursankare i data/kurser-tillagg/, universumbärning sonderad: gruv VALE/FCX/FMG/NST/S32 · stål NUE/MT/3382.T · kemi SHW/4063.T · rederi MAERSK-B/DSV).
- PIPELINE-KO: v174 bokförd LEVERERAD (ff2d4d76), v175 spår 10 DR-prov Q3 BOKAD (rotation 9→10 — krisdagens läxa); tre vågor börsda: v171 PÅGÅR · v172 utlösare 10-20 · v175 bokad.
KVD: ren dataleverans (utkast publiceras ej — granskningskön äger data/blogg-utkast/), src orörd, tsc via grinden vid commit, inget bygge. Kö: v171 fyra original (dispatch i omgångar) → v172 rappdagar 10-20→11-04 · v175 DR-prov Q3.
`);

// 3) Commit-meddelande + huvudcommit
writeFileSync('data/vakten/.r259-commitmsg.txt', `studio: [organ:Φ] r259 v171 AR30 — investmentbolag-AR levererad (B28-ar, -ar-spårets SISTA lucka): TRESPRÅKSSPEGELNINGEN KOMPLETT, 30 original × sv/en/ar (B1–B28 + energi + material) · subagent i förgrund efter att bakgrundsdispatchen dog tyst med trådklippningen · KVD 31/31 GRÖN + oberoende omkörning grön (talparitet 66/66, korslänkar 18/18, externa 4/4, aritmetik 11/11, rådverb 0, läckor 0, ord 1299/1150–1400) · PIPELINE: v174 bokförd LEVERERAD + v175 spår 10 DR-prov Q3 bokad (krisens läxa); v171 kvarstår fyra nya original se-18/20/21/23 (kursankare + universumbärning sonderade)`);
console.log('--- huvudcommit ---');
console.log(sh('git add data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag-ar.json verktyg/_r259-b28-ar-kvd.mjs data/forskning/SEO-GUIDER-2026-09.md worklog.md PIPELINE-KO.md'));
console.log(sh('git commit -F data/vakten/.r259-commitmsg.txt'));
const hash = sh('git rev-parse --short HEAD');
console.log('huvudhash:', hash);

// 4) Pyttecommit: bokföringsskriptet självt (trädhygien, r257-precedensen)
sh('git add verktyg/_r259-bokfor.mjs');
console.log(sh('git commit -m "studio: [organ:Φ] r259 tillägg — bokföringsskriptet självt (utenför sin egen fillista, trädhygien)"'));

// 5) Push prod (en push för båda)
console.log('--- push prod ---');
console.log(sh('git push prod develop'));

// 6) Beslutsminne (kördata, gitignorad)
appendFileSync('data/vakten/beslutsminne.jsonl', JSON.stringify({ ts: new Date().toISOString(), rond: 259, beslut: 'AR30 investmentbolag-ar levererad — trespråksspeglingen komplett (30×sv/en/ar); v174 bokförd LEVERERAD; v175 spår 10 DR-prov Q3 bokad', landat: hash }) + '\n');

// 7) Trädstatus + prod-puls
console.log('--- status ---');
console.log(sh('git status --short'));
console.log('git HEAD:', sh('git log --oneline -1'));
try {
  const r = await fetch('https://lab.ak1nvestor.com/', { signal: AbortSignal.timeout(8000) });
  console.log('prod puls:', r.status);
} catch (e) { console.log('prod puls: kunde inte hämtas (', e.message, ') — dataonly-leverans kräver inget bygge'); }
try { unlinkSync('data/vakten/.r259-commitmsg.txt'); } catch {}
console.log('KLAR r259');
