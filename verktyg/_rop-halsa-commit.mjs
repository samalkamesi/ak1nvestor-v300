// Committa + pusha rop-hälsa-bokföringen via node-kanalen (skalkvot kur 1).
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MEDDELANDE =
  "studio: rop-halsa FYND eftersläppt — 6 omstarter 09-24 förklarade " +
  "(nattkluster 00:21-02:08Z + 15:23Z i bygg-OOM-klassen med aktivt " +
  "fabriksmanifest 'kritiska-fixar'; 19:02Z planerad v169-restart enligt " +
  "b78e5c7d, ra-gallring-schemat syns först i den startloggen), 0 " +
  "tystnadsgap/0 organ-gap = rop-täckningen höll; sido-fynd: prod-synk " +
  "stoppad ~26 polls på RÖD kvalitetsrapport (E35 gap 3 sista halvan) " +
  "sedan 20:53Z; 0 faktisk ropförlust; ingen pm2-omstart (R2); utredning " +
  "bokförd i worklog";

function kör(kommando) {
  console.log(`$ ${kommando}`);
  const ut = execSync(kommando, { cwd: ROT, encoding: "utf8", timeout: 240_000, stdio: ["ignore", "pipe", "pipe"] });
  console.log(ut.trim());
}

kör("git add worklog.md");
kör(`git commit -m ${JSON.stringify(MEDDELANDE)}`);
kör("git push prod develop");
kör("git log --oneline -2");
console.log("KLART: rop-hälsa-bokföring committad + pushad");
