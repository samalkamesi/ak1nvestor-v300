#!/usr/bin/env node
/**
 * VÅG 91 BLOCK A2 — E2E: STYRELSEMOTORN (mock-transport i dev på Windows,
 * appserver på prod — testet kör mot lokal dev-server och bryr sig ej om
 * vilken transport som ligger under).
 *
 * KUNDVITNET (KVD): "AI styrelse organen träffas som lag varje gång jag
 * frågar ... beslut som ska tillämpas omedelbart förutom saker som kan stöda
 * hela sidans karriär och framgång totalt."
 *
 * Flöde:
 *   1. Startar `npm run dev` i bakgrunden OM :port inte svarar (beredskaps-
 *      sond: öppna GET /api/studio/halsa).
 *   2. POST /api/studio/styrelse {fraga: "Vad bör prioriteras för
 *      mobilupplevelsen?"} (harmlös fråga — inga existentiella domäner i
 *      närheten) → {id}.
 *   3. Pollar GET ?id=&senast=N inkrementellt (mötets händelselogg live).
 *   4. Bevisar:
 *      K1  Mötet slutar status=klart med beslut.
 *      K2  5 ROLLER SVARADE (roll_klar för ORDFORANDE, TEKNIK, SAKERHET,
 *          JURIDIK, TILLVÄXT).
 *      K3  BESLUTET SAKNAR INVESTERINGSRÅD-FORMULERINGAR — kontrolleraText-
 *          mönstret återanvänt: data/varumarke.json forbudnaFraser (FEL-
 *          nivån) kompileras med samma flaggor ("giu") och körs på beslut +
 *          motivering + åtgärder + rollsummeringar. Negerad disclaimer
 *          ("inte investeringsråd") ger INGEN träff — regexarna bär själva
 *          negationsreglerna (varumarke.ts).
 *      K4  existential=false → atgardsStatus="KORS_DIREKT".
 *      K5  PIPELINE-KO.md har fått [STYRELSEN]-rader med mötets id
 *          (huvudagentens dispatchlista).
 *      K6  STYRELSE-BESLUT.md protokollfört mötet (append, daterat).
 *
 * Körs med: node verktyg/testa-styrelse.mjs [port]   (default 3000)
 * Kräver dev-läge (NODE_ENV=development ⇒ admin-devfallback gäller).
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PORT = process.argv[2] || "3000";
const BAS = `http://127.0.0.1:${PORT}`;
const HEADERS = { "x-admin-password": process.env.ADMIN_PASSWORD || "AK1A-2026" }; // dev-fallback (endast development)
const JSON_HEADERS = { ...HEADERS, "Content-Type": "application/json" };

const SKRIPT_SOKVAG = fileURLToPath(import.meta.url);
const ROT = path.resolve(path.dirname(SKRIPT_SOKVAG), "..");
const FRAGA = "Vad bör prioriteras för mobilupplevelsen?";

const kontroll = (namn, ok, detalj) => {
  const ikon = ok ? "PASS" : "FAIL";
  console.log(`  ${ikon}  ${namn}${detalj ? ` — ${detalj}` : ""}`);
  if (!ok) process.exitCode = 1;
};

const sov = (ms) => new Promise((los) => setTimeout(los, ms));

// ── Steg 1: dev-server (starta om :port tiger — sond: /api/studio/halsa) ────

async function svarar() {
  try {
    const res = await fetch(`${BAS}/api/studio/halsa`, { signal: AbortSignal.timeout(3_000) });
    return res.ok;
  } catch {
    return false;
  }
}

let startadDev = null;
if (!(await svarar())) {
  console.log(`▸ Startar npm run dev i bakgrunden (port ${PORT}) …`);
  const logg = [];
  // package.json:dev hårdkodar -p 3000 — annan port skickas som extra -p
  // (testet sondar PORT; default 3000 matchar dev-skriptet).
  const devArg = process.platform === "win32" ? ["/c", "npm run dev"] : ["run", "dev"];
  if (PORT !== "3000") devArg.push("--", "-p", PORT);
  startadDev = spawn(process.platform === "win32" ? "cmd.exe" : "npm", devArg, {
    cwd: ROT,
    env: { ...process.env },
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
  startadDev.stdout?.on("data", (d) => logg.push(String(d)));
  startadDev.stderr?.on("data", (d) => logg.push(String(d)));
  let fardig = false;
  for (let t = 0; t < 90 && !fardig; t++) {
    await sov(2_000);
    fardig = await svarar();
  }
  if (!fardig) {
    console.log("FAIL  dev-servern kom ej upp inom 180 s. Senaste logg:");
    console.log(logg.join("").slice(-2_000));
    if (startadDev.pid && process.platform === "win32") {
      spawn("taskkill", ["/pid", String(startadDev.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      startadDev.kill("SIGTERM");
    }
    process.exit(1);
  }
  console.log("▸ Dev-servern är uppe.");
}

async function stangaDev() {
  if (!startadDev) return;
  if (process.platform === "win32" && startadDev.pid) {
    // Windows: npm -> cmd -> node är en processgrupp — taskkill /T dödar hela trädet.
    spawn("taskkill", ["/pid", String(startadDev.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    startadDev.kill("SIGTERM");
  }
}

// ── Steg 2: starta mötet ─────────────────────────────────────────────────────

console.log(`\n▸ POST /api/studio/styrelse  {"fraga": "${FRAGA}"}`);
const post = await fetch(`${BAS}/api/studio/styrelse`, {
  method: "POST",
  headers: JSON_HEADERS,
  body: JSON.stringify({ fraga: FRAGA }),
});
if (!post.ok) {
  console.log(`FAIL  POST svarade ${String(post.status)}: ${await post.text().catch(() => "")}`);
  await stangaDev();
  process.exit(1);
}
const { id } = await post.json();
console.log(`▸ Mötes-id: ${id}`);

// ── Steg 3: inkrementell poll (händelserna live) ────────────────────────────

let senast = -1;
let mote = null;
const allaHandelser = []; // ackumuleras över poller (svaret bär bara inkrementet)
const deadline = Date.now() + 5 * 60 * 1000; // mötet maxar ~4 min i motorn
while (Date.now() < deadline) {
  await sov(1_500);
  const res = await fetch(`${BAS}/api/studio/styrelse?id=${encodeURIComponent(id)}&senast=${String(senast)}`, {
    headers: HEADERS,
  });
  if (!res.ok) {
    console.log(`FAIL  GET svarade ${String(res.status)}`);
    await stangaDev();
    process.exit(1);
  }
  mote = await res.json();
  for (const h of mote.handelser ?? []) {
    console.log(`    [${h.tid.slice(11, 19)}] #${h.i} ${h.typ}${h.roll ? ` ${h.roll}` : ""}${h.text ? ` — ${h.text.slice(0, 100)}` : ""}`);
    senast = Math.max(senast, h.i);
    allaHandelser.push(h);
  }
  if (mote.status !== "paga") break;
}
mote = { ...mote, handelser: allaHandelser };

// ── Steg 4: bevis ────────────────────────────────────────────────────────────

console.log(`\n▸ Mötet slutade: status=${mote?.status ?? "(timeout)"}`);

// K1 — klart med beslut
kontroll("K1 mötet slutade status=klart med beslut", mote?.status === "klart" && typeof mote?.beslut === "object" && mote.beslut !== null, mote?.fel ?? "");

// K2 — 5 roller svarade (roll_klar per roll)
const svaradeRoller = new Set((mote?.handelser ?? []).filter((h) => h.typ === "roll_klar").map((h) => h.roll));
const fem = ["ORDFORANDE", "TEKNIK", "SAKERHET", "JURIDIK", "TILLVAXT"];
kontroll(
  "K2 fem roller svarade (roll_klar ×5)",
  fem.every((r) => svaradeRoller.has(r)),
  `${String(svaradeRoller.size)}/5: ${[...svaradeRoller].join(", ")}`,
);

// K3 — kontrolleraText-mönstret (data/varumarke.json forbudnaFraser, FEL-nivån)
const varumarke = JSON.parse(readFileSync(path.join(ROT, "data", "varumarke.json"), "utf8"));
const felRegexar = varumarke.forbjudnaFraser.filter((f) => f.allvar === "FEL").map((f) => ({ re: new RegExp(f.fran, "giu"), istallet: f.istallet }));
const beslutTexter = mote?.beslut
  ? [
      mote.beslut.beslut,
      mote.beslut.motivering,
      ...(mote.beslut.atgarder ?? []),
      ...(mote.beslut.rollSammanfattning ?? []).map((r) => r.enRad),
    ].filter((t) => typeof t === "string")
  : [];
const traffar = [];
for (const text of beslutTexter) {
  for (const { re } of felRegexar) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (m) traffar.push(`"${m[0]}" i: ${text.slice(Math.max(0, m.index - 20), m.index + 40).replace(/\s+/g, " ")}`);
  }
}
kontroll("K3 beslutet saknar investeringsråd-formuleringar (varumarke-FEL: 0 träffar)", traffar.length === 0, traffar.length > 0 ? traffar.slice(0, 3).join(" | ") : `${String(felRegexar.length)} FEL-regexar körda`);

// K4 — R2-klassning: harmlös fråga ⇒ existential=false ⇒ KORS_DIREKT
kontroll(
  "K4 existential=false → atgardsStatus=KORS_DIREKT",
  mote?.beslut?.existential === false && mote?.atgardsStatus === "KORS_DIREKT",
  `existential=${String(mote?.beslut?.existential)} · atgardsStatus=${String(mote?.atgardsStatus)}`,
);

// K5 — PIPELINE-KO.md: [STYRELSEN]-rader med mötets id
let pipeline = "";
try {
  pipeline = readFileSync(path.join(ROT, "data", "forskning", "PIPELINE-KO.md"), "utf8");
} catch {
  pipeline = "";
}
const pipelineRader = pipeline.split(/\r?\n/).filter((r) => r.includes(id) && r.includes("[STYRELSEN]"));
kontroll(
  "K5 PIPELINE-KO.md har [STYRELSEN]-rader med mötets id",
  pipelineRader.length > 0 && (mote?.pipelineRader ?? 0) > 0,
  `${String(pipelineRader.length)} rad(er) i filen · motorn rapporterar ${String(mote?.pipelineRader ?? 0)}`,
);
for (const r of pipelineRader.slice(0, 3)) console.log(`      ${r.slice(0, 160)}`);

// K6 — STYRELSE-BESLUT.md protokollfört
let protokoll = "";
try {
  protokoll = readFileSync(path.join(ROT, "data", "forskning", "STYRELSE-BESLUT.md"), "utf8");
} catch {
  protokoll = "";
}
kontroll("K6 STYRELSE-BESLUT.md protokollfört mötet (daterat)", protokoll.includes(id), protokoll ? `filen ${String(protokoll.length)} tecken` : "filen saknas");

// ── Sammanfattning ───────────────────────────────────────────────────────────

console.log("\n▸ Beslutets form:");
if (mote?.beslut) {
  console.log(`    beslut:     ${String(mote.beslut.beslut).slice(0, 140)}`);
  console.log(`    motivering: ${String(mote.beslut.motivering).slice(0, 140)}`);
  console.log(`    åtgärder:   ${String(mote.beslut.atgarder?.length ?? 0)} st`);
}

await stangaDev();
console.log(process.exitCode === 1 ? "\nSAMMANFATTNING: FAIL (minst en kontroll föll)" : "\nSAMMANFATTNING: PASS (styrelsemotorn bevisad E2E)");
process.exit(process.exitCode === 1 ? 1 : 0);
