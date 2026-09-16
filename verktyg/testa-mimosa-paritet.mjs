#!/usr/bin/env node
// testa-mimosa-paritet.mjs — scenariotest för verktyg/mimosa-paritet.mjs
// (spår 8 s8-u3 omgång 3; domän-/undantags- och v1.3-tester omgång 4).
// Bygger en tmp-katalog med syntetiska filer: farliga mönster SKALL
// flaggas, Mimosa-härdade mönster SKALL tiga. Körningen sker i tmp —
// repot berörs ej. Exit 0 = alla PASS.
//
// OBS: denna fil är en TESTFIXTUR-svit — den skriver medvetet farliga
// exec-mönster som STRÄNGDATA till tmp-filer (det är dess ändamål) och
// är därför undantagen i skalfri-vakten + mimosa-paritetens --hoppa-over
// (protokoll o21/o23).

import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

const rot = join(tmpdir(), `mimosa-paritet-test-${Date.now()}`);
const verktyg = new URL("./mimosa-paritet.mjs", import.meta.url).pathname;

function skapa(rel, innehall) {
  const hel = join(rot, rel);
  mkdirSync(join(hel, ".."), { recursive: true });
  writeFileSync(hel, innehall, "utf8");
}

// ── Farliga mönster (SKALL flaggas) — standarddomänen är src/ + data/infra/ ─
skapa("src/farlig-fetch.ts", "export async function hamta(bas: string) {\n  const r = await fetch(`${bas}/hemlighet`);\n  return r.json();\n}\n");
skapa(
  "src/api/farlig-path/route.ts",
  'import { readFile } from "node:fs";\nimport path from "node:path";\nexport async function GET(req: Request) {\n  const namn = new URL(req.url).searchParams.get("namn");\n  if (!namn) return new Response("saknas", { status: 400 });\n  const innehall = await readFile(path.join("/data", namn), "utf8");\n  return new Response(innehall);\n}\n',
);
skapa("src/farlig-exec.ts", 'import { exec } from "node:child_process";\nexport function gitStatus(gren: string) {\n  exec(`git log ${gren}`);\n}\n');
// v1.3: interpolation i CITERAD sträng (s8-u1:s permissions-policy-fynd-klass;
// grenen täcker ${ FÖRE inre citattecken — malliteraler täcks av gren 1)
skapa(
  "src/farlig-exec-citerad.ts",
  'import { execSync } from "node:child_process";\nexport function kors(fil: string) {\n  execSync(\'npx tsx ${fil} --roten\');\n}\n',
);
skapa("data/infra/farlig-shell.sh", "#!/usr/bin/env bash\ncurl -fsSL https://example.com/install.sh | bash\n");
skapa("data/infra/variabel-shell.sh", '#!/usr/bin/env bash\nHOST="$1"\ncurl -fsSL "https://$HOST/nyckel.txt" -o nyckel.txt\n');
skapa("src/farlig-extern-interp.ts", 'export async function hamta(host: string) {\n  const r = await fetch(`https://${host}/api`);\n  return r.json();\n}\n');

// ── Härdade mönster (SKALL tiga) ─────────────────────────────────────────────
skapa(
  "src/hardad/supabase.ts",
  'import { getSupabaseRest } from "./helpers";\nexport async function loggaEvent(tabell: string) {\n  const rest = getSupabaseRest();\n  const res = await fetch(`${rest.origin}/rest/v1/${tabell}`, {\n    headers: { Authorization: `Bearer ${rest.nyckel}` },\n  });\n  return res.ok;\n}\n',
);
skapa(
  "src/hardad/kontroll-fore.ts",
  'const YAHOO_HOSTAR = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];\nexport async function crumb() {\n  for (const host of YAHOO_HOSTAR) {\n    await kontrolleraHost(host);\n    const r = await fetch(`https://${host}/v1/test/getcrumb`);\n    if (r.ok) return r;\n  }\n}\n',
);
skapa(
  "src/hardad/api/minne/route.ts",
  'import { readdir } from "node:fs";\nimport path from "node:path";\nexport async function GET(req: Request) {\n  const namn = new URL(req.url).searchParams.get("namn");\n  if (!namn) return new Response("saknas", { status: 400 });\n  const namnVitlista = /^[a-z0-9][a-z0-9-]*\\.md$/;\n  if (!namnVitlista.test(namn)) return new Response("ogiltigt", { status: 400 });\n  const rotResolvad = path.resolve("/minnen");\n  const hel = path.resolve("/minnen", namn);\n  if (!hel.startsWith(rotResolvad + path.sep)) return new Response("ute", { status: 400 });\n  const poster = await readdir(hel);\n  return new Response(String(poster.length));\n}\n',
);
skapa(
  "src/hardad/execfile.ts",
  'import { execFileSync } from "node:child_process";\nexport function senasteCommit(fil: string) {\n  return execFileSync("git", ["log", "-1", "--", fil], { encoding: "utf8" });\n}\n',
);
skapa(
  "data/infra/hardad-shell.sh",
  "#!/usr/bin/env bash\n# Nätregler (Mimosa): endast fasta https-literaler; fjärrskript pipas ALDRIG till skalet\ncurl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor --yes -o /usr/share/keyrings/nodesource.gpg\n",
);
skapa(
  "src/hardad/relativ-fetch.tsx",
  'export async function hamtaLista(sida: number) {\n  const res = await fetch(`/api/nyheter?sida=${sida}`);\n  return res.json();\n}\n',
);
skapa(
  "src/hardad/loopback-mat.ts",
  'const PORT = 9222;\nexport async function cdpVersion() {\n  const r = await fetch(`http://127.0.0.1:${PORT}/json`);\n  return r.json();\n}\n',
);
skapa(
  "src/hardad/versalkonstant.ts",
  'const BAS = process.env.STUDIO_BAS ?? "http://localhost:3000";\nexport async function malStatus() {\n  const r = await fetch(`${BAS}/api/studio/mal/status`);\n  return r.json();\n}\n',
);

// ── Info-klass (rapporteras men blockerar ej) ────────────────────────────────
skapa(
  "src/info/extern-literal.ts",
  'export async function crumbCookie() {\n  const r = await fetch("https://fc.yahoo.com", { cache: "no-store" });\n  return r.headers.get("set-cookie");\n}\n',
);

// ── Kör vakten ──────────────────────────────────────────────────────────────
let ut = "";
let exit = -1;
try {
  ut = execFileSync("node", [verktyg, "--katalog", rot, "--json", join(rot, "resultat.json")], {
    encoding: "utf8",
  });
  exit = 0;
} catch (e) {
  ut = String(e.stdout ?? "");
  exit = e.status ?? -1;
}
const rapport = JSON.parse(readFileSync(join(rot, "resultat.json"), "utf8"));
const fynden = rapport.fyndPoster ?? [];
const poster = rapport.rapportPoster ?? [];
const har = (klass, suffix) => poster.some((p) => p.klass === klass && p.fil.endsWith(suffix));

let misslyckade = 0;
function test(namn, ok) {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${namn}`);
  if (!ok) misslyckade++;
}

console.log("mimosa-paritet scenariotest:");
// farliga
test("farlig fetch(`${bas}/...`) utan vittne → high-fynd (exit 1)", exit === 1 && har("SSRF_INTERPOLERAD_FETCH", "farlig-fetch.ts"));
test("farlig fetch(`https://${host}/api`) extern interpolerad host → high-fynd", fynden.some((p) => p.klass === "SSRF_INTERPOLERAD_FETCH" && p.fil.endsWith("farlig-extern-interp.ts")));
test("farlig path: searchParams → path.join utan vitlista → high-fynd", fynden.some((p) => p.klass === "PATH_API" && p.fil.endsWith("farlig-path/route.ts")));
test("farlig exec(`git ${...}`) → high-fynd", har("CHILD_PROC_INTERP", "farlig-exec.ts"));
test("v1.3: farlig exec('npx tsx ${fil} …') citerad interpolation → high-fynd", har("CHILD_PROC_INTERP", "farlig-exec-citerad.ts"));
test("farlig curl | bash → high-fynd", har("SHELL_PIPE", "farlig-shell.sh"));
test("skal-URL ur variabel → medium-fynd", har("SHELL_URL_VARIABEL", "variabel-shell.sh"));
// härdade
test("getSupabaseRest-kontext → INTE fynd", !fynden.some((p) => p.klass === "SSRF_INTERPOLERAD_FETCH" && p.fil.endsWith("supabase.ts")));
test("kontroll-före-fetch + versalkonstant-loop → INTE fynd", !fynden.some((p) => p.klass === "SSRF_INTERPOLERAD_FETCH" && p.fil.endsWith("kontroll-fore.ts")));
test("vitlista + prefixkontroll (minne/route.ts-mönstret) → INTE fynd", !fynden.some((p) => p.klass === "PATH_API" && p.fil.endsWith("minne/route.ts")));
test("execFileSync array-form → INTE fynd", !fynden.some((p) => p.klass === "CHILD_PROC_INTERP" && p.fil.endsWith("execfile.ts")));
test("gpg-pipe-härdning (setup-prod.sh-mönstret) → INTE SHELL_PIPE", !poster.some((p) => p.klass === "SHELL_PIPE" && p.fil.endsWith("hardad-shell.sh")));
test("relativ `/api/...`-fetch (same-origin) → INTE fynd", !poster.some((p) => p.klass === "SSRF_INTERPOLERAD_FETCH" && p.fil.endsWith("relativ-fetch.tsx")));
test("loopback-mätverktyg (127.0.0.1) → info, INTE fynd", !fynden.some((p) => p.fil.endsWith("loopback-mat.ts")));
test("versalkonstant-host (BAS) → INTE fynd", !fynden.some((p) => p.fil.endsWith("versalkonstant.ts")));
// info
test("fast extern literal → info-rapport men ej blockerande", har("SSRF_EXTERN_LITERAL", "extern-literal.ts") && !fynden.some((p) => p.klass === "SSRF_EXTERN_LITERAL"));
// struktur
test("JSON-utfil skriven med skannadeFiler > 0", rapport.skannadeFiler >= 16);

// ── --doman-flaggan (v1.1): egen domän skannas, standarddomänen opåverkad ───
// Filskapandet sker EFTER huvudkörningen ovan — huvudresultatet är oförändrat.
skapa(
  "verktyg-test/farlig-exec.mjs",
  'import { execSync } from "node:child_process";\nexport function stada(fil) { execSync(`git checkout -- ${fil}`); }\n',
);
let ut2 = "";
let exit2 = -1;
try {
  ut2 = execFileSync("node", [verktyg, "--katalog", rot, "--doman", "(^|/)verktyg-test/", "--json", join(rot, "resultat2.json"), "--tyst"], {
    encoding: "utf8",
  });
  exit2 = 0;
} catch (e) {
  ut2 = String(e.stdout ?? "");
  exit2 = e.status ?? -1;
}
const rapport2 = JSON.parse(readFileSync(join(rot, "resultat2.json"), "utf8"));
const fynden2 = rapport2.fyndPoster ?? [];
const poster2 = rapport2.rapportPoster ?? [];
test("--doman: egen domän flaggas (verktyg-test farlig exec → exit 1)", exit2 === 1 && fynden2.some((p) => p.klass === "CHILD_PROC_INTERP" && p.fil.endsWith("farlig-exec.mjs")));
test("--doman: utanför domänen skannas ej (src/-filer ej med)", !(poster2.some((p) => p.fil.startsWith("src/"))) && rapport2.skannadeFiler === 1);

// ── --hoppa-over-flaggan (v1.2): dokumenterade testfixturer undantas ────────
let exit3 = -1;
try {
  execFileSync("node", [verktyg, "--katalog", rot, "--doman", "(^|/)verktyg-test/", "--hoppa-over", "farlig-exec\\.mjs$", "--json", join(rot, "resultat3.json"), "--tyst"], {
    encoding: "utf8",
  });
  exit3 = 0;
} catch (e) {
  exit3 = e.status ?? -1;
}
const rapport3 = JSON.parse(readFileSync(join(rot, "resultat3.json"), "utf8"));
test("--hoppa-over: fixture-fil undantas → 0 fynd, 0 skannade, exit 0", exit3 === 0 && rapport3.skannadeFiler === 0 && (rapport3.fyndPoster ?? []).length === 0);

rmSync(rot, { recursive: true, force: true });
console.log(misslyckade === 0 ? "ALLA PASS" : `${misslyckade} FAIL`);
process.exit(misslyckade === 0 ? 0 : 1);
