#!/usr/bin/env node
/** F3-VACCINETS ELDPROV (FYNN nr 2, 2026-09-20) — differentiell diagnos:
 *  fall 1: DÖD ROT (connection refused) ⇒ 18 MEDEL "rot nere — miljöfönster",
 *          0 HÖG (miljöfönster eskalerar ALDRIG — 14:59Z-klassens kur)
 *  fall 2: LEVANDE ROT + DÖDA API:ER (socket-död) ⇒ HÖG "rot LEVER" —
 *          äkta API-fel eskaleras fortfarande (vakten tappar inget)
 *  Isolering: AK1A_FYND_SOKVAG till tmp — den äkta ledgern rörs aldrig. */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const jag = process.argv[2];
if (jag === "--fall1" || jag === "--fall2") {
  const { jagaApi } = await import("./feljagaren.mjs");
  await jagaApi("testpass");
  process.exit(0);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "f3vaccin-"));
const fynd1 = path.join(tmp, "fall1.jsonl");
const fynd2 = path.join(tmp, "fall2.jsonl");
const self = process.argv[1];
const R = [];
const kontroll = (id, ok, detalj) => { R.push(!!ok); console.log(`  ${ok ? "PASS" : "FAIL"} ${id} — ${detalj}`); };

// eldprovet mäter ROT-grinden — vänta ut ev. deploylås (rond 44-grenen är
// äldre, redan bevisad, och skulle maskera fallen; ~5 min tålamod räcker
// för ett vanligt prodbygg)
for (let v = 0; v < 10; v++) {
  const l = spawnSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"], { encoding: "utf8" });
  if (l.status === 0) break;
  if (v === 0) console.log("  deploybygg pågår — eldprovet väntar ut låset (rond 44-grenen ska inte maskera fallen)");
  await new Promise((r) => setTimeout(r, 30_000));
}

// fall 1: död rot
const r1 = spawnSync(process.execPath, [self, "--fall1"], {
  env: { ...process.env, AK1A_BAS_URL: "http://127.0.0.1:9", AK1A_FYND_SOKVAG: fynd1 },
  encoding: "utf8", timeout: 360_000,
});
if (r1.status !== 0) console.log(`  (fall1-barn: status=${r1.status} fel=${String(r1.stderr || "").slice(0, 200)})`);
// fall 2: levande rot + döda api:er — OBS: mocken lever I DENNA process,
// därför asynk spawn (eldprovets första version använde spawnSync som fryser
// händelseloopen ⇒ mocken kunde aldrig svara ⇒ alla tider gick på timeout
// och sonden såg felaktigt "rot nere"; jagaApi själv var oskyldig)
const server = http.createServer((req, res) => {
  if (req.url === "/") { res.writeHead(200); res.end("ok"); return; }
  req.socket.destroy();
});
await new Promise((res) => server.listen(0, "127.0.0.1", res));
const port = server.address().port;
const r2 = await new Promise((res) => {
  const b = spawn(process.execPath, [self, "--fall2"], {
    env: { ...process.env, AK1A_BAS_URL: `http://127.0.0.1:${port}`, AK1A_FYND_SOKVAG: fynd2 },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let fe = "";
  b.stderr.on("data", (d) => { fe += d; });
  const drap = setTimeout(() => { fe += "(eldprovets 360 s-dräpare)"; try { b.kill("SIGKILL"); } catch {} }, 360_000);
  b.on("close", (kod) => { clearTimeout(drap); res({ status: kod, stderr: fe }); });
});
if (r2.status !== 0) console.log(`  (fall2-barn: status=${r2.status} fel=${String(r2.stderr || "").slice(0, 200)})`);
server.close();

const las = (p) => { try { return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map((r) => JSON.parse(r)); } catch { return []; } };
const f1 = las(fynd1);
const f1hog = f1.filter((r) => r.allvar === "HÖG");
kontroll("V1 död rot ⇒ 0 HÖG-rader (miljö eskalerar aldrig)", f1hog.length === 0, `${f1.length} rader, ${f1hog.length} HÖG`);
kontroll("V2 död rot ⇒ MEDEL rot-nere-rader", f1.length >= 18 && f1.every((r) => r.allvar === "MEDEL" && /rot nere — miljöfönster/.test(r.fynd)), `första: "${(f1[0] || {}).fynd || "(tom)"}"`);

const f2 = las(fynd2);
const f2hog = f2.filter((r) => r.allvar === "HÖG");
kontroll("V3 levande rot + döda api ⇒ HÖG bevarad med rot-LEVER-bevis", f2hog.length >= 1 && /rot LEVER/.test(f2hog[0].bevis || ""), `${f2hog.length} HÖG, bevis: "${(f2hog[0] || {}).bevis || "".slice(0, 60)}"`);
const f2miljo = f2.filter((r) => /rot nere/.test(r.fynd || ""));
kontroll("V4 levande rot ⇒ inga miljöfönster-rader", f2miljo.length === 0, `${f2miljo.length} miljö-rader av ${f2.length}`);

fs.rmSync(tmp, { recursive: true, force: true });
const pass = R.filter(Boolean).length;
console.log(`SAMMANFATTNING: ${pass === R.length ? "PASS" : "FAIL"} (${pass}/${R.length} kontroller — F3-vaccinet rot-sond, FYNN nr 2)`);
process.exit(pass === R.length ? 0 : 1);
