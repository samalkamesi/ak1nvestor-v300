#!/usr/bin/env node
/** F3-VACCINET ELDPROV v4 (FYNN nr 4, 2026-09-21) — belastningsgrinden:
 *  fall 1: DÖD ROT + VUXEN APP (ålder 60, frisk last) ⇒ 18 MEDEL "rot nere —
 *          miljöfönster", 0 HÖG (miljöfönster eskalerar ALDRIG — 14:59Z-kur)
 *  fall 2: LEVANDE ROT + DÖDA API:ER + VUXEN APP + FRISK LAST ⇒ HÖG "rot
 *          LEVER" — äkta API-fel eskaleras fortfarande (vakten tappar inget)
 *  fall 3: LEVANDE ROT + DÖDA API:ER + UNG APP (ålder 10) ⇒ 18 MEDEL
 *          "efterdyning", 0 HÖG (18:44Z — FYNN nr 3 åldergrinden)
 *  fall 4: LEVANDE ROT + DÖDA API:ER + VARM APP (87 min) + MÄTTAD SERVER
 *          (1129 MB, 1 zcode-barn) ⇒ 18 MEDEL "server mättad — transport-RPC
 *          svält", 0 HÖG — 06:44Z-signaturen reproducerad: varm app + rot 200
 *          + omtesttimeout under syskonlast (FYNN nr 4-grinden)
 *  Ålder styrs via AK1A_APP_ALDER_MIN, last via AK1A_TEST_SERVERLAST (endast
 *  detta eldprov sätter dem — cron gör det aldrig). Isolering:
 *  AK1A_FYND_SOKVAG till tmp. v4: fall 1–3 bär FRISK last-hook — utan den
 *  skulle eldprovet bero av serverns verkliga minne (mättad prod ⇒ fall 2:s
 *  HÖGkontroll vore ett lotteri). */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const jag = process.argv[2];
if (jag === "--fall1" || jag === "--fall2" || jag === "--fall3" || jag === "--fall4") {
  const { jagaApi } = await import("./feljagaren.mjs");
  await jagaApi("testpass");
  process.exit(0);
}

const FRISK = JSON.stringify({ ramMB: 8000, zcodeBarn: 0 });
const MATTAD = JSON.stringify({ ramMB: 1129, zcodeBarn: 1 });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "f3vaccin4-"));
const fynd1 = path.join(tmp, "fall1.jsonl");
const fynd2 = path.join(tmp, "fall2.jsonl");
const fynd3 = path.join(tmp, "fall3.jsonl");
const fynd4 = path.join(tmp, "fall4.jsonl");
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

// fall 1: död rot (connection refused på port 9), app vuxen, frisk last
const r1 = spawnSync(process.execPath, [self, "--fall1"], {
  env: { ...process.env, AK1A_BAS_URL: "http://127.0.0.1:9", AK1A_FYND_SOKVAG: fynd1, AK1A_APP_ALDER_MIN: "60", AK1A_TEST_SERVERLAST: FRISK },
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
const korAsync = (arg, fynd, alder, last) => new Promise((res) => {
  const b = spawn(process.execPath, [self, arg], {
    env: { ...process.env, AK1A_BAS_URL: `http://127.0.0.1:${port}`, AK1A_FYND_SOKVAG: fynd, AK1A_APP_ALDER_MIN: alder, AK1A_TEST_SERVERLAST: last },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let fe = "";
  b.stderr.on("data", (d) => { fe += d; });
  const drap = setTimeout(() => { fe += "(eldprovets 360 s-dräpare)"; try { b.kill("SIGKILL"); } catch {} }, 360_000);
  b.on("close", (kod) => { clearTimeout(drap); res({ status: kod, stderr: fe }); });
});
const r2 = await korAsync("--fall2", fynd2, "60", FRISK);
if (r2.status !== 0) console.log(`  (fall2-barn: status=${r2.status} fel=${String(r2.stderr || "").slice(0, 200)})`);
const r3 = await korAsync("--fall3", fynd3, "10", FRISK);
if (r3.status !== 0) console.log(`  (fall3-barn: status=${r3.status} fel=${String(r3.stderr || "").slice(0, 200)})`);
const r4 = await korAsync("--fall4", fynd4, "87", MATTAD);
if (r4.status !== 0) console.log(`  (fall4-barn: status=${r4.status} fel=${String(r4.stderr || "").slice(0, 200)})`);
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
kontroll("V3 levande rot + vuxen app + FRISK LAST ⇒ HÖG bevarad med rot-LEVER-bevis", f2hog.length >= 1 && /rot LEVER/.test(f2hog[0].bevis || ""), `${f2hog.length} HÖG, bevis: "${((f2hog[0] || {}).bevis || "").slice(0, 60)}"`);
const f2miljo = f2.filter((r) => /rot nere|efterdyning|server mättad/.test(r.fynd || ""));
kontroll("V4 vuxen app + frisk last ⇒ inga miljö/efterdyning/mättad-rader", f2miljo.length === 0, `${f2miljo.length} miljö-rader av ${f2.length}`);

const f3 = las(fynd3);
const f3hog = f3.filter((r) => r.allvar === "HÖG");
kontroll("V5 levande rot + UNG app (10 min) ⇒ 0 HÖG — 18:44-klassen kurad", f3hog.length === 0, `${f3.length} rader, ${f3hog.length} HÖG`);
kontroll("V6 ung app ⇒ MEDEL efterdyning-rader med åldern i fyndet", f3.length >= 18 && f3.every((r) => r.allvar === "MEDEL" && /efterdyning — appen \d+ min/.test(r.fynd)), `första: "${(f3[0] || {}).fynd || "(tom)"}"`);

const f4 = las(fynd4);
const f4hog = f4.filter((r) => r.allvar === "HÖG");
kontroll("V7 levande rot + VARM app (87) + MÄTTAD SERVER (1129 MB) ⇒ 0 HÖG — 06:44-klassen kurad", f4hog.length === 0, `${f4.length} rader, ${f4hog.length} HÖG`);
kontroll("V8 mättad server ⇒ 18 MEDEL server-mättad-rader med mätvärden i beviset", f4.length >= 18 && f4.every((r) => r.allvar === "MEDEL" && /server mättad — transport-RPC svält/.test(r.fynd) && /1129 MB tillgängligt/.test(r.bevis || "")), `första: "${(f4[0] || {}).fynd || "(tom)"}"`);
kontroll("V9 mätta-raden bär varm ålder + FYNN nr 4-provenans", f4.length >= 1 && /87 min/.test((f4[0] || {}).bevis || "") && /FYNN nr 4/.test((f4[0] || {}).bevis || ""), `bevis: "${((f4[0] || {}).bevis || "").slice(0, 90)}"`);

fs.rmSync(tmp, { recursive: true, force: true });
const pass = R.filter(Boolean).length;
console.log(`SAMMANFATTNING: ${pass === R.length ? "PASS" : "FAIL"} (${pass}/${R.length} kontroller — F3-vaccinet v4: åldergrind + belastningsgrind, FYNN nr 3+4)`);
process.exit(pass === R.length ? 0 : 1);
