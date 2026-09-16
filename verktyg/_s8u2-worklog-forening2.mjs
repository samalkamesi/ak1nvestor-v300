// s8-u2 o39 steg 2: M2-förening — AK1:s completa svans (theirs) + rond 53:s
// sektion (ours) insatt kronologiskt före "## SPÅR 5 s5-u2" (första
// sektionen committad efter rond 53:s 22:47). Vägrar vid oväntad form.
import { readFileSync, writeFileSync } from "node:fs";

const fil = "/home/ak1a/agent/ak1/worklog.md";
const rader = readFileSync(fil, "utf8").split("\n");

const start = rader.findIndex(r => /^<<<<<<< HEAD$/.test(r));
const mitt = rader.findIndex(r => /^=======$/.test(r));
const slut = rader.findIndex(r => /^>>>>>>> [0-9a-f]{40}$/.test(r));
if (start < 0 || mitt < 0 || slut < 0 || !(start < mitt && mitt < slut)) {
  console.error("VÄGRAR: konfliktmarkörer saknas/fel ordning"); process.exit(1);
}
const vasa = rader.slice(start + 1, mitt).filter(r => r !== "");
if (vasa.length !== 2 || !vasa[0].startsWith("## ROND 53") || !vasa[1].startsWith("Leverans:")) {
  console.error(`VÄGRAR: ourssidan är inte rond 53-sektionen (${vasa.length} rader: ${vasa.map(r => r.slice(0, 30)).join(" | ")})`); process.exit(1);
}
const theirsa = rader.slice(mitt + 1, slut);
const ankror = theirsa.map((r, i) => r.startsWith("## SPÅR 5 s5-u2") ? i : -1).filter(i => i >= 0);
if (ankror.length !== 1) {
  console.error(`VÄGRAR: ankaret '## SPÅR 5 s5-u2' finns ${ankror.length} gånger på deras sida`); process.exit(1);
}
const insatt = [...theirsa.slice(0, ankror[0]), ...vasa, "", ...theirsa.slice(ankror[0])];
const ny = [...rader.slice(0, start), ...insatt, ...rader.slice(slut + 1)];
if (ny.some(r => /^<<<<<<< HEAD$/.test(r) || /^=======$/.test(r) || /^>>>>>>> /.test(r))) {
  console.error("VÄGRAR: markörer kvar i resultatet"); process.exit(1);
}
writeFileSync(fil, ny.join("\n"));
console.log(`OK: M2-förening — deras ${theirsa.length} rader behållna, rond 53 (${vasa.length} rader) insatt vid rad ${ankror[0]}; filen ${rader.length} → ${ny.length} rader`);
