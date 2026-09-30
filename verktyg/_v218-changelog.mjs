// v218: hämta npm-packumentet för zcode-app-cli — repository + readme-changelog
import fs from "node:fs";

const LOGG = "/tmp/v218-changelog.log";
const skriv = (s) => { fs.appendFileSync(LOGG, s + "\n"); console.log(s); };
fs.writeFileSync(LOGG, `v218 changelog-sond ${new Date().toISOString()}\n`);

const r = await fetch("https://registry.npmjs.org/zcode-app-cli", {
  signal: AbortSignal.timeout(45_000),
});
skriv(`HTTP ${r.status}`);
const pack = await r.json();

skriv("repository: " + JSON.stringify(pack.repository ?? "(saknas)"));
skriv("homepage: " + (pack.homepage ?? "(saknas)"));
skriv("beskrivning: " + (pack.description ?? "(saknas)"));
skriv("senaste: " + pack["dist-tags"].latest);

// Readme — sök changelog-liknande sektioner + versionsnummer
const readme = pack.readme ?? "";
skriv(`readme-längd: ${readme.length} tecken`);
let n = 0;
for (const rad of readme.split("\n")) {
  if (/3\.(11|12|14)\.\d+/.test(rad) || /^#+.*(changelog|changes)/i.test(rad)) {
    skriv("  | " + rad.slice(0, 150));
    if (++n > 60) break;
  }
}
skriv("readme-träffar: " + n);
skriv("\nKLAR");
