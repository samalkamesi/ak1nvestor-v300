// rond 185: git-leverans via node-kanalen
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const REPO = "/home/ak1a/agent/ak1";
const MSG = "/tmp/v185-msg.txt";
const meddelande = `studio: [organ:Φ] v170 KVD-LÄXOR LEVERERADE — emottaget _v182-emottag.mjs kurerat på tre punkter (KVD-läxorna rond 180/182): (1) ERSÄTTNINGS-IDEMPOTENS — KURSBLOCK-sektionen byggs om från grunden varje körning (senaste mätningen gäller; gamla skip-på-marker-logiken lämnade block från mätningar FÖRE mätkurkarna kvar, dokumenterat i v167-stängningen); (2) VÄNTAR-LISTA VID LEVERANS förstärkt — varje block bär "levererad <tidsstämpel>" ur fragmentets mtime + LÄGE-raden speglar disk-läget (dubbelarbetets rot d13/d19/d22); (3) STÄNGDVAKT — status/integrera vägrar röra en STÄNGD vågs granskningsfil (bevisbevarande + dubbelappend-skydd). SJÄLVTEST _v170-sjalvtest.mjs i sandbox (riktiga trädet orört): 7 PASS · 0 FEL — RÖT pre-kurka-block ersattes av GRÖN 13/0 · ✗-rad borta · LÄGE "1 levererade · 19 väntar" · levererad-ts synlig · ett block per kurs · DUBBELKÖRNING bitidentisk (sha256 58341c347ba7e094) · stängdvakt fil-orörd. EMOTTAG-MONSTER.md (data/forskning/KURS-FAS2/) databuret som mall för nästa vågs emottag: fem bindande regler (fragmentmönstret · väntar-lista vid leverans med status-rop-som-sista-steg i manifestprompten · ombyggnad-idempotens · stängdvakt · integrationens måttkedja: formatvakt rondtrip + append mot läget-före-append + chapters_list orörd + vägran vid RÖDA) + vågstartschecklista + de två mindre v166-läxorna hanterade med beslut (fem historiska d-KVD-verktygs sköra HEAD-mått + d16:s /tmp-beroende: engångsverktyg kureras ej — emottaget bär rätt mönster). PIPELINE-KO omrotad: v171 SEO NÄSTA VÅG · v172 kvartalsrapporter bokad (Q3 2026 slutar 09-30) · v173 dataset-djup bokad = 3 kommande vågar (evighetsmotorn § 8). Worklog rond 185 + beslutsminne bokförda (_r185-bokfor.mjs). Ren dataleverans (verktyg + docs) — src orörd, inget bygge.
`;

const ut = [];
function steg(namn, args, tak) {
  try {
    const r = execFileSync("git", args, { cwd: REPO, encoding: "utf8", timeout: tak ?? 60000 });
    ut.push(`${namn}: OK ${String(r).trim().slice(0, 300)}`);
    return true;
  } catch (e) {
    ut.push(`${namn}: FEL ${String(e.stderr || e.message).slice(0, 800)}`);
    return false;
  }
}

writeFileSync(MSG, meddelande);
if (!steg("ADD", ["add", "verktyg/_v182-emottag.mjs", "verktyg/_v170-sjalvtest.mjs", "verktyg/_r185-bokfor.mjs", "verktyg/_r185-git.mjs", "data/forskning/KURS-FAS2/EMOTTAG-MONSTER.md", "PIPELINE-KO.md", "worklog.md"])) {
  writeFileSync("/tmp/v185-git.txt", ut.join("\n") + "\n"); console.log("FEL-VID-ADD"); process.exitCode = 1;
} else if (!steg("COMMIT", ["commit", "-F", MSG], 300000)) {
  writeFileSync("/tmp/v185-git.txt", ut.join("\n") + "\n"); console.log("FEL-VID-COMMIT"); process.exitCode = 1;
} else if (!steg("PUSH", ["push", "prod", "develop"], 120000)) {
  writeFileSync("/tmp/v185-git.txt", ut.join("\n") + "\n"); console.log("FEL-VID-PUSH"); process.exitCode = 1;
} else {
  steg("HASH", ["rev-parse", "--short", "HEAD"]);
  writeFileSync("/tmp/v185-git.txt", ut.join("\n") + "\n"); console.log("LEVERERAD");
}
