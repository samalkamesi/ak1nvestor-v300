// Rond 96 — sond 2: o155 §7-kön ur prod-trädet + natt 3-fönstrets mätning + fabrikstatus-ålder
import fs from "node:fs";
import { execSync } from "node:child_process";

console.log("=== o155 §7 KÖN (prod-trädet) ===");
try {
  const t = fs.readFileSync("/home/ak1a/AK1/data/forskning/OPTIMERING/o155-prestanda-nattfonster-lastvakt-s7.md", "utf8");
  const m = t.match(/^## 7[^\n]*$/m);
  if (m) {
    const start = m.index;
    const next = t.slice(start + 1).search(/^## /m);
    console.log(next >= 0 ? t.slice(start, start + 1 + next) : t.slice(start, start + 2500));
  } else console.log("(ingen ## 7 — visar sista 800 tecknen)\n" + t.slice(-800));
} catch (e) { console.log("FEL:", e.message); }

console.log("\n=== NATT 3-FÖNSTER (03:27 lokal 2026-09-24) — mätfiler ===");
// Lighthouse-nattmätare skriver vanligen under data/forskning/OPTIMERING/lighthouse/ eller data/vakten/
for (const dir of ["/home/ak1a/AK1/data/forskning/OPTIMERING/lighthouse", "/home/ak1a/AK1/data/vakten"]) {
  try {
    const fs_ = fs.readdirSync(dir).filter(f => /natt|o155|o151/i.test(f));
    for (const f of fs_) {
      const p = dir + "/" + f;
      const st = fs.statSync(p);
      console.log(`- ${p} mtime=${st.mtime.toISOString()} ${st.size}B`);
    }
  } catch {}
}

console.log("\n=== LJUS-HUS-SONDER: senaste natt-cron-fakta ===");
try {
  const d = "/home/ak1a/AK1/data/forskning/OPTIMERING";
  const nyaste = fs.readdirSync(d).filter(f => f.endsWith(".md") || f.endsWith(".json"))
    .map(f => ({ f, m: fs.statSync(d + "/" + f).mtimeMs }))
    .sort((a, b) => b.m - a.m).slice(0, 8);
  for (const n of nyaste) console.log(`- ${n.f} ${new Date(n.m).toISOString()}`);
} catch (e) { console.log("FEL:", e.message); }

console.log("\n=== FABRIKSTATUS auto-s7-1790205302748 (ålder + detalj) ===");
try {
  const p = "/home/ak1a/AK1/data/vakten/agentfabrik/status/auto-s7-1790205302748.json";
  const st = fs.statSync(p);
  console.log("status-mtime:", st.mtime.toISOString(), "(nu:", new Date().toISOString() + ")");
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  console.log(JSON.stringify(j).slice(0, 900));
} catch (e) { console.log("FEL:", e.message); }

console.log("\n=== PROD-SYNK-LOGG (svans 12 rader) ===");
try {
  const t = fs.readFileSync("/home/ak1a/AK1/data/vakten/prod-synk.log", "utf8").trim().split("\n");
  console.log(t.slice(-12).join("\n"));
} catch (e) {
  try {
    const t = execSync("tail -12 /tmp/ak1a-prod-synk.log", { encoding: "utf8" });
    console.log(t);
  } catch { console.log("(hittade ingen prod-synk-logg på kända ställen)"); }
}

console.log("\n=== KLOCKA ===");
console.log("nu:", new Date().toISOString());
