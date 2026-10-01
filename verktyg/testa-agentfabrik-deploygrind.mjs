// testa-agentfabrik-deploygrind.mjs — V225 kontraktstest (o575 PUMP-GRIND).
// Hermetiskt: EGET lås- och status-filspace under /tmp — rör aldrig skarpa
// /tmp/ak1a-deploy.lock eller data/vakten/agentfabrik/status.
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { deployFonsterOppet } from "./agentfabrik.mjs";
import { lasAktivaFabriksManifest } from "./prod-synk.mjs";

let pass = 0;
let fail = 0;
const kontroll = (namn, villkor) => {
  if (villkor) { pass++; console.log(`  PASS — ${namn}`); }
  else { fail++; console.log(`  FAIL — ${namn}`); }
};

// ── A. deployFonsterOppet: fritt lås ⇒ true ─────────────────────────────────
{
  const lasFil = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "v225-")), "test.lock");
  kontroll("A1: fritt lås ⇒ fönster öppet (true)", deployFonsterOppet(lasFil) === true);
}

// ── B. deployFonsterOppet: hållet lås ⇒ false (äkta flock, egen barnprocess) ─
{
  const lasFil = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "v225-")), "test.lock");
  const hallare = spawn("flock", [lasFil, "-c", "sleep 8"], { stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 700)); // låset hunnit tas
  kontroll("B1: hållet lås ⇒ fönster stängt (false)", deployFonsterOppet(lasFil) === false);
  kontroll("B2: probe släpper INTE främmande lås (barnet lever fortfarande)", hallare.exitCode === null);
  hallare.kill("SIGKILL");
}

// ── C. lasAktivaFabriksManifest: vantar-deploy räknas EJ aktiv ──────────────
{
  const statusKatalog = fs.mkdtempSync(path.join(os.tmpdir(), "v225-status-"));
  fs.writeFileSync(path.join(statusKatalog, "m1.json"), JSON.stringify({ id: "m1", status: "pågår" }));
  fs.writeFileSync(path.join(statusKatalog, "m2.json"), JSON.stringify({ id: "m2", status: "klar" }));
  fs.writeFileSync(path.join(statusKatalog, "m3.json"), JSON.stringify({ id: "m3", status: "vantar-deploy" }));
  fs.writeFileSync(path.join(statusKatalog, "m4.json"), JSON.stringify({ id: "m4", status: "vantar-ram" }));
  const dom = lasAktivaFabriksManifest(statusKatalog);
  kontroll("C1: endast 'pågår' och 'vantar-ram' räknas aktiva (2)", dom.aktiva === 2);
  kontroll("C2: ids exkluderar klar + vantar-deploy", dom.ids.join(",") === "m1,m4");
  const tomt = lasAktivaFabriksManifest(path.join(statusKatalog, "finns-ej"));
  kontroll("C3: saknad katalog = fabriken vilar (0)", tomt.aktiva === 0);
}

// ── D. regresionsskydd: skarp låsfil berörs ALDRIG av testet ────────────────
{
  // Testerna A–C använder egna tmp-sökvägar; skarp fil läses-endast om den finns.
  const skarp = "/tmp/ak1a-deploy.lock";
  kontroll("D1: skarp låsfil existerar (deploy-maskineri lever)", fs.existsSync(skarp));
}

console.log(`\nRESULTAT: ${pass} PASS / ${fail} FAIL / 0 SKIP`);
process.exit(fail > 0 ? 1 : 0);
