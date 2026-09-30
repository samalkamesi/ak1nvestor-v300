// v218: GitHub-releaser för kingsword09/zcode-cli — body per release sedan 3.11.2-24
import fs from "node:fs";

const LOGG = "/tmp/v218-releaser.log";
const skriv = (s) => { fs.appendFileSync(LOGG, s + "\n"); console.log(s); };
fs.writeFileSync(LOGG, `v218 releasserond ${new Date().toISOString()}\n`);

const r = await fetch("https://api.github.com/repos/kingsword09/zcode-cli/releases?per_page=40", {
  headers: { "User-Agent": "ak1a-research", Accept: "application/vnd.github+json" },
  signal: AbortSignal.timeout(45_000),
});
skriv(`HTTP ${r.status}`);
if (r.status !== 200) {
  skriv("FEL — avbryter");
  process.exit(1);
}
const releaser = await r.json();
skriv(`antal releaser: ${releaser.length}\n`);

for (const rel of releaser) {
  skriv(`══ ${rel.tag_name} · ${rel.name ?? ""} · ${rel.published_at}`);
  const body = (rel.body ?? "").trim();
  if (body) {
    // klipp ner: max 60 rader per release
    const rader = body.split("\n").slice(0, 60);
    for (const rad of rader) skriv("  " + rad.slice(0, 160));
    if (body.split("\n").length > 60) skriv("  …(trunkerad)");
  } else {
    skriv("  (tom body)");
  }
  skriv("");
}
skriv("KLAR");
