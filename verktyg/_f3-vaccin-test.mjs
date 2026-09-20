#!/usr/bin/env node
/** F3-VACCINET ELDPROV v2 (FYNN nr 3, 2026-09-20) — åldergrinden:
 *  fall 1: DÖD ROT + VUXEN APP (ålder 60) ⇒ 18 MEDEL "rot nere — miljöfönster",
 *          0 HÖG (miljöfönster eskalerar ALDRIG — 14:59Z-klassens kur)
 *  fall 2: LEVANDE ROT + DÖDA API:ER + VUXEN APP (ålder 60) ⇒ HÖG "rot LEVER"
 *          — äkta API-fel eskaleras fortfarande (vakten tappar inget)
 *  fall 3: LEVANDE ROT + DÖDA API:ER + UNG APP (ålder 10) ⇒ 18 MEDEL
 *          "efterdyning", 0 HÖG — 18:44Z-signaturen reproducerad: GET / (ren
 *          Next-yta) grönar medan transport-barnet timeout:ar; ungt pm_uptime
 *          ⇒ efterdyning, aldrig HÖG (FYNN nr 3-grinden)
 *  Åldern styrs via AK1A_APP_ALDER_MIN (endast detta eldprov sätter den —
 *  cron gör det aldrig). Isolering: AK1A_FYND_SOKVAG till tmp. */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const jag = process.argv[2];
if (jag === "--fall1" || jag === "--fall2" || jag === "--fall3") {
  const { jagaApi } = await import("./feljagaren.mjs");
  await jagaApi("testpass");
  process.exit(0);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "f3vaccin3-"));
const fynd1 = path.join(tmp, "fall1.jsonl");
const fynd2 = path.join(tmp, "fall2.jsonl");
const fynd3 = path.join(tmp, "fall3.jsonl");
const self = process.argv[1];
const R = [];
const kontroll = (id, ok, detalj) => { R.push(!!ok); console.log(`  ${ok ? "PASS" : "FAIL"} ${id} — ${detalj}`); };

// eldprovet mäter grindläget — vänta ut ev. deploylås (rond 44-grenen är
// äldre, redan bevisad, och skulle maskera fallen; ~5 min tålamod räcker
// för ett vanligt prodbygg)
for (let v = 0; v < 10; v++) {
  const l = spawnSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"], { encoding: "utf8" });
  if (l.status === 0) break;
  if (v === 0) console.log("  deploybygg pågår — eldprovet väntar ut låset (rond 44-grenen ska inte maskera fallen)");
  await new Promise((r) => setTimeout(r, 30_000));
}

// fall 1: död rot (connection refused på port 9), app vuxen — rot-grenen isoleras
const r1 = spawnSync(process.execPath, [self, "--fall1"], {
  env: { ...process.env, AK1A_BAS_URL: "http://127.0.0.1:9", AK1A_FYND_SOKVAG: fynd1, AK1A_APP_ALDER_MIN: "60" },
  encoding: "utf8", timeout: 360_000,
});
if (r1.status !== 0) console.log(`  (fall1-barn: status=${r1.status} fel=${String(r1.stderr || "").slice(0, 200)})`);

// mock: levande rot, döda api:er — OBS: mocken lever I DENNA process, därför
// asynk spawn (första eldprovsversionens spawnSync frös händelseloopen ⇒
// mocken kunde aldrig svara; jagaApi själv var oskyldig)
const server = http.createServer((req, res) => {
  if (req.url === "/") { res.writeHead(200); res.end("ok"); return; }
  req.socket.destroy();
});
await new Promise((res) => server.listen(0, "127.0.0.1", res));
const port = server.address().port;
const korAsync = (arg, fynd, alder) => new Promise((res) => {
  const b = spawn(process.execPath, [self, arg], {
    env: { ...process.env, AK1A_BAS_URL: `http://127.0.0.1:${port}`, AK1A_FYND_SOKVAG: fynd, AK1A_APP_ALDER_MIN: alder },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let fe = "";
  b.stderr.on("data", (d) => { fe += d; });
  const drap = setTimeout(() => { fe += "(eldprovets 360 s-dräpare)"; try { b.kill("SIGKILL"); } catch {} }, 360_000);
  b.on("close", (kod) => { clearTimeout(drap); res({ status: kod, stderr: fe }); });
});
const r2 = await korAsync("--fall2", fynd2, "60");
if (r2.status !== 0) console.log(`  (fall2-barn: status=${r2.status} fel=${String(r2.stderr || "").slice(0, 200)})`);
const r3 = await korAsync("--fall3", fynd3, "10");
if (r3.status !== 0) console.log(`  (fall3-barn: status=${r3.status} fel=${String(r3.stderr || "").slice(0, 200)})`);
server.close();

// levande pm2-läsning: utan override ska hamtaAppAlderMin ge tal (eller null)
const r0 = await new Promise((res) => {
  const b = spawn(process.execPath, ["--input-type=module", "-e",
    'const m = await import("./verktyg/feljagaren.mjs"); const a = m.hamtaAppAlderMin(); console.log(a === null ? "null" : String(Math.round(a)));'],
    { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
  let ut = "";
  b.stdout.on("data", (d) => { ut += d; });
  b.on("close", () => res(ut.trim()));
});

const las = (p) => { try { return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map((r) => JSON.parse(r)); } catch { return []; } };
const f1 = las(fynd1);
const f1hog = f1.filter((r) => r.allvar === "HÖG");
kontroll("V0 levande pm2-läsning: ålder = tal eller null", r0 === "null" || (/^\d+$/.test(r0) && Number(r0) >= 0), `hamtaAppAlderMin() = ${r0}`);
kontroll("V1 död rot + vuxen app ⇒ 0 HÖG-rader (miljö eskalerar aldrig)", f1hog.length === 0, `${f1.length} rader, ${f1hog.length} HÖG`);
kontroll("V2 död rot + vuxen app ⇒ MEDEL rot-nere-rader", f1.length >= 18 && f1.every((r) => r.allvar === "MEDEL" && /rot nere — miljöfönster/.test(r.fynd)), `första: "${(f1[0] || {}).fynd || "(tom)"}"`);

const f2 = las(fynd2);
const f2hog = f2.filter((r) => r.allvar === "HÖG");
kontroll("V3 levande rot + vuxen app ⇒ HÖG bevarad med rot-LEVER-bevis", f2hog.length >= 1 && /rot LEVER/.test(f2hog[0].bevis || ""), `${f2hog.length} HÖG, bevis: "${(f2hog[0] || {}).bevis || "".slice(0, 60)}"`);
const f2miljo = f2.filter((r) => /rot nere|efterdyning/.test(r.fynd || ""));
kontroll("V4 vuxen app ⇒ inga miljö/efterdyning-rader", f2miljo.length === 0, `${f2miljo.length} miljö-rader av ${f2.length}`);

const f3 = las(fynd3);
const f3hog = f3.filter((r) => r.allvar === "HÖG");
kontroll("V5 levande rot + UNG app (10 min) ⇒ 0 HÖG — 18:44-klassen kurad", f3hog.length === 0, `${f3.length} rader, ${f3hog.length} HÖG`);
kontroll("V6 ung app ⇒ MEDEL efterdyning-rader med åldern i beviset", f3.length >= 18 && f3.every((r) => r.allvar === "MEDEL" && /efterdyning — appen \d+ min/.test(r.fynd)), `första: "${(f3[0] || {}).fynd || "(tom)"}"`);

fs.rmSync(tmp, { recursive: true, force: true });
const pass = R.filter(Boolean).length;
console.log(`SAMMANFATTNING: ${pass === R.length ? "PASS" : "FAIL"} (${pass}/${R.length} kontroller — F3-vaccinet v3 åldergrind, FYNN nr 3)`);
process.exit(pass === R.length ? 0 : 1);
