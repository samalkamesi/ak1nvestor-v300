#!/usr/bin/env node
/** F3-eldprov v5.1 — FYNN nr 5: TIMEOUT-DOmen (2026-09-21).
 * Fall A (08:59Z-signaturen): TimeoutError + rot 200 + omtest dött + last
 *   UNDER nr 4-trösklarna (ramMB 1802, 1 zcode-barn) ⇒ MEDEL svältklass,
 *   ALDRIG HÖG — inklusive kaskad-syskonen (endpoint 2+).
 * Fall B (äkta API-död bevaras): icke-timeout-fel (socket förstörd) + rot
 *   200 + omtest dött ⇒ HÖG kvar (även kaskaden).
 * Fall C (regression, rond 50): första anropet dör, omtestet svarar ⇒
 *   MEDEL självläkt.
 * Arkitektur: varje fall körs i BARNPROCESS — feljagarens BAS fryses vid
 * modul-import, så AK1A_BAS_URL måste stå klart FÖRE importen (v5:0:s
 * miss: env sattes efter import ⇒ anropen gick mot skarpa servern).
 */
import http from "node:http";
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const EGEN = process.argv[1];
const FYNDTMP = "/tmp/f3nr5-fynd.jsonl";

// ── barnläge: egen mock + env FÖRE import, kör en jakt ───────────────────
if (process.argv[2] === "--barn") {
  const typ = process.argv[3];
  const server = http.createServer((req, res) => {
    if (req.url === "/") { res.writeHead(200); res.end("ok"); return; }
    if (typ === "hang") return;                 // A: tyst tills klientens abort
    if (typ === "dod") { req.socket.destroy(); return; }  // B: icke-timeout
    if (typ === "rate") { res.writeHead(429, { "Retry-After": "60" }); res.end("{}"); return; } // D
    if (typ === "lakta") {                      // C: dör en gång, sedan 200
      if (!globalThis.lakt) { globalThis.lakt = true; req.socket.destroy(); return; }
      res.writeHead(200); res.end("{}"); return;
    }
    res.writeHead(500); res.end();
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  process.env.AK1A_BAS_URL = `http://127.0.0.1:${server.address().port}`;
  // v5:0-läxan (2026-09-21): eldprovet fick ALDRIG slå mot skarp yta —
  // miscall med fel lösenord triggade admin-authens 429-lås som avvisade
  // FYNN:s jakt 15 endpoints (09:13:13Z). Strukturellt neka skarp port/localhost.
  if (process.env.AK1A_BAS_URL.includes("localhost") || /:3000$/.test(process.env.AK1A_BAS_URL)) {
    console.error("VÄGRAR: BAS pekar på skarp yta — eldprovet kör endast mot egen mock");
    process.exit(4);
  }
  process.env.AK1A_FYND_SOKVAG = FYNDTMP;
  process.env.AK1A_TEST_SERVERLAST = JSON.stringify({ ramMB: 1802, zcodeBarn: 1 });
  process.env.AK1A_APP_ALDER_MIN = "90";
  const { jagaApi } = await import("./feljagaren.mjs");
  await jagaApi("x");
  server.close();
  process.exit(0);
}

// ── huvudläge ─────────────────────────────────────────────────────────────
try {
  execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"], { timeout: 5000 });
} catch (e) {
  if (e.status === 1) { console.log("AVBRYTER: deploy-bygg pågår (låset hålls)"); process.exit(3); }
}

let pass = 0, fail = 0;
const kontroll = (namn, villkor, detalj) => {
  if (villkor) { pass++; console.log(`PASS ${namn}`); }
  else { fail++; console.log(`FAIL ${namn} — ${detalj}`); }
};
const lasFynd = () => {
  try { return fs.readFileSync(FYNDTMP, "utf8").trim().split("\n").filter(Boolean).map(r => JSON.parse(r)); }
  catch { return []; }
};
function korFall(namn, typ, forvantat) {
  fs.rmSync(FYNDTMP, { force: true });
  const r = spawnSync(process.execPath, [EGEN, "--barn", typ], {
    cwd: fileURLToPath(new URL(".", import.meta.url)),
    encoding: "utf8", timeout: 420_000, maxBuffer: 32 * 1024 * 1024
  });
  const rader = lasFynd();
  console.log(`\n=== ${namn} (barn-exit ${r.status}, ${rader.length} fyndrader) ===`);
  for (const rad of rader) console.log(`  [${rad.allvar}] ${rad.fynd}`);
  forvantat(rader, r);
}

korFall("A: timeout + rot 200 + luftig last ⇒ MEDEL svältklass",
  "hang",
  (rader) => {
    const hog = rader.filter(r => r.allvar === "HÖG");
    const svalt = rader.filter(r => r.allvar === "MEDEL" && /svältklass/.test(r.fynd));
    kontroll("A1: 0 HÖG", hog.length === 0, `${hog.length} HÖG-rader`);
    kontroll("A2: mätt MEDEL svältklass", svalt.some(r => !/kaskad/.test(r.fynd)), "ingen mätt svältklass-rad");
    kontroll("A3: kaskad-syskon också MEDEL svältklass", rader.every(r => r.allvar !== "HÖG"), "HÖG i kaskad");
  });

korFall("B: icke-timeout + rot 200 + omtest dött ⇒ HÖG bevarat",
  "dod",
  (rader) => {
    const hog = rader.filter(r => r.allvar === "HÖG");
    kontroll("B1: HÖG kvar för äkta felklass", hog.some(r => !/kaskad/.test(r.fynd)), "ingen mätt HÖG-rad");
    kontroll("B2: äkta-API-signaturen lever", hog.some(r => /äkta API-fel/.test(r.bevis)), "signatur saknas");
    kontroll("B3: kaskad HÖG (icke-timeout-syskon)", hog.some(r => /kaskad/.test(r.fynd)), "kaskad ej HÖG");
  });

korFall("C: självläkt vid omtest ⇒ MEDEL övergående",
  "lakta",
  (rader) => {
    kontroll("C1: MEDEL självläkt (rond 50-regression)", rader.some(r => r.allvar === "MEDEL" && /självläkt/.test(r.fynd)), "ingen självläkt-rad");
    kontroll("C2: 0 HÖG i regressionen", rader.every(r => r.allvar !== "HÖG"), "HÖG bokförd");
  });

korFall("D: 429 ⇒ MEDEL skyddsmekanism (FYNN nr 6)",
  "rate",
  (rader) => {
    kontroll("D1: MEDEL rate-limit domer bokförda", rader.some(r => r.allvar === "MEDEL" && /rate-limit/.test(r.fynd)), "ingen rate-limit-rad");
    kontroll("D2: 0 HÖG vid 429", rader.every(r => r.allvar !== "HÖG"), "HÖG bokförd");
  });

console.log(`\nSVIT: ${pass} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
