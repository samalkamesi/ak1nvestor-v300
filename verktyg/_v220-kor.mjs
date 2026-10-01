// v220-körare: syntaxkontroll + testsvit + skarp verifiering av patch-kö-kuren.
// Allt till /tmp/v220-kor.log (node-kanalen — skalets 30 s-gräns runnes).
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const LOGG = "/tmp/v220-kor.log";
fs.writeFileSync(LOGG, `v220 körning ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + "\n"); };

// 1) syntax
for (const f of ["verktyg/prod-synk.mjs", "verktyg/testa-prod-synk-patchko.mjs"]) {
  try {
    execFileSync("node", ["--check", f], { cwd: "/home/ak1a/agent/ak1", encoding: "utf8", timeout: 30_000 });
    logga(`SYNTAX OK: ${f}`);
  } catch (e) {
    logga(`SYNTAX FEL: ${f}: ${String(e.stderr || e.message).slice(0, 400)}`);
    process.exit(1);
  }
}

// 2) testsviten
try {
  const ut = execFileSync("node", ["verktyg/testa-prod-synk-patchko.mjs"], {
    cwd: "/home/ak1a/agent/ak1", encoding: "utf8", timeout: 120_000,
  });
  logga("--- TESTSVIT ---\n" + ut);
} catch (e) {
  logga("--- TESTSVIT FEL ---\n" + String(e.stdout || "") + String(e.stderr || e.message));
  process.exit(1);
}

// 3) skarp verifiering: PROD-trädets köfil + kvitton genom de nya funktionerna
const { lasPatchKo, lasPatchKvitton, aktivPatchPlan, kapAktivPatchPlan } = await import("/home/ak1a/agent/ak1/verktyg/prod-synk.mjs");
const kanda = new Set([
  ...Object.keys(JSON.parse(fs.readFileSync("/home/ak1a/AK1/package.json", "utf8")).dependencies || {}),
  ...Object.keys(JSON.parse(fs.readFileSync("/home/ak1a/AK1/package.json", "utf8")).devDependencies || {}),
]);
const ko = lasPatchKo("/home/ak1a/AK1/data/infra/patch-ko.json", kanda);
const kapad = kapAktivPatchPlan(aktivPatchPlan(ko, lasPatchKvitton("/home/ak1a/AK1/data/vakten/patch-kvitton.jsonl")));
logga("--- SKARP KÖ (prod-trädet) ---");
logga(`unika filposter: ${ko.poster.length} · fel: ${JSON.stringify(ko.fel)}`);
logga(`AKTIV plan efter kur: ${kapad.poster.map((p) => `${p.paket}@${p.version}`).join(", ") || "(tom)"} · takfel: ${kapad.fel.length}`);

// jämförelse: vad GAMLA koden (unikt-tak före kvitton) skulle haft
const gammalKapad = ko.poster.slice(0, 15);
const gammalPlan = aktivPatchPlan({ poster: gammalKapad }, lasPatchKvitton("/home/ak1a/AK1/data/vakten/patch-kvitton.jsonl"));
logga(`gamla kodens plan (referens): ${gammalPlan.map((p) => `${p.paket}@${p.version}`).join(", ") || "(tom)"}`);
logga("v220 KLAR");
