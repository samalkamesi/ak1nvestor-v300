// rond 184: git-leverans via node-kanalen (Write-verktyget + skal hängde på msg-filen)
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const REPO = "/home/ak1a/agent/ak1";
const MSG = `/tmp/v184-msg.txt`;
const meddelande = `studio: [organ:Φ] v169 RAPPORTAKADEMIN STÄNGT — kunduppdraget 09-21 formellt avslutat med komplett DoD-beviskedja: kontraktssviten verktyg/testa-rapportakademin-kontrakt.mjs körd mot prod-appen EFTER deployen — 6 PASS · 0 FEL (A gäst-GET 200 + kod-inloggning + 0 läckta facit-nycklar · B gäst-POST 401 utan expert i kropp · C elev-yta 401 · D gallringsrutten 200 med kanoniskt svar och idempotens bevisad över två körningar gallrade=0 fel=0 · E publikt skal 200 utan facit i SSR · F daemon-radens driftsbevis i källträdet). Driftsbevis: BUILD_ID 20:04:27 (v169-bygget under flock-lås, subagent) · pm2 ak1a omstartad 20:05:57 online · ak1a-pumpor omstartad 21:02:56 restarts 26 via node-kanalen _v184-pm2.mjs (skal-pm2 hängde och verkställde ej första gången — skal-kvotens kur bevisad igen) — daemonprocessen bär nu 04:41-ra-gallring-raden, första automatiska gallringen 2026-09-25 04:41. DoD-stängningsunderlaget data/forskning/RAPPORTAKADEMIN/dod-stangning-2026-09-24.md: fem komponenter UPPFYLLDA (vertikalt snitt LIVE med ABB-passet · bedöm-först mekaniskt via passSkal-stripping + 502-grind · gröna sviter · prod 200 · laggrundad konfiguration committad: LAGBESLUTets sex leveranser + v169:s gallringsmotor) + tio-åtgärdslistans lägesredovisning + stängningskvitto. Dokumenterad gräns: testelev-e2e kräver kundens Supabase-konto-material (R2-yta) — bokförd frivillig fördjupning sedan rond 131. UPPDRAG KLART markerat enligt kunduppdragsprotokollet punkt 4 (data/vakten/uppdrag-klart.json + raden UPPDRAG KLART i sessionen). Worklog rond 184 + beslutsminne bokförda (_r184-stang.mjs). Ren dataleverans — src orörd sedan b78e5c7d, inget bygge.
`;

const ut = [];
function steg(namn, args, tak) {
  try {
    const r = execFileSync("git", args, { cwd: REPO, encoding: "utf8", timeout: tak ?? 60000, input: undefined });
    ut.push(`${namn}: OK ${String(r).trim().slice(0, 400)}`);
    return true;
  } catch (e) {
    ut.push(`${namn}: FEL ${String(e.stderr || e.message).slice(0, 800)}`);
    return false;
  }
}

writeFileSync(MSG, meddelande);
ut.push("MSG: skriven " + meddelande.length + " tecken");

if (!steg("ADD", ["add", "data/forskning/RAPPORTAKADEMIN/dod-stangning-2026-09-24.md", "verktyg/_r183-beslut.mjs", "verktyg/_v184-pm2.mjs", "verktyg/_r184-stang.mjs", "verktyg/_r184-git.mjs", "worklog.md"])) {
  writeFileSync("/tmp/v184-git.txt", ut.join("\n") + "\n");
  console.log("FEL-VID-ADD");
  process.exitCode = 1;
} else if (!steg("COMMIT", ["commit", "-F", MSG], 300000)) {
  writeFileSync("/tmp/v184-git.txt", ut.join("\n") + "\n");
  console.log("FEL-VID-COMMIT");
  process.exitCode = 1;
} else if (!steg("PUSH", ["push", "prod", "develop"], 120000)) {
  writeFileSync("/tmp/v184-git.txt", ut.join("\n") + "\n");
  console.log("FEL-VID-PUSH");
  process.exitCode = 1;
} else {
  steg("HASH", ["rev-parse", "--short", "HEAD"]);
  writeFileSync("/tmp/v184-git.txt", ut.join("\n") + "\n");
  console.log("LEVERERAD");
}
