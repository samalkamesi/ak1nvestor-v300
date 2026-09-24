// Rond 96-lägessond — node-kanalen (skalet hänger på git)
import { execSync } from "node:child_process";
import fs from "node:fs";

const ko = (cmd) => { try { return execSync(cmd, { cwd: "/home/ak1a/agent/ak1", encoding: "utf8", timeout: 20000 }).trim(); } catch (e) { return "FEL: " + (e.stderr || e.message).toString().slice(0, 200); } };

console.log("=== GIT STATUS (arbetsyta) ===");
console.log(ko("git status --short") || "(rent)");
console.log("\n=== GIT LOG -8 ===");
console.log(ko("git log --oneline -8"));
console.log("\n=== PROD-HEAD ===");
console.log(ko("git -C /home/ak1a/AK1 log --oneline -3"));

console.log("\n=== RAM ===");
const mem = fs.readFileSync("/proc/meminfo", "utf8");
const avail = /MemAvailable:\s+(\d+)/.exec(mem);
console.log("MemAvailable:", Math.round(Number(avail[1]) / 1024), "MB");

console.log("\n=== FABRIKENS KÖ (prod-trädet) ===");
try {
  const koDir = "/home/ak1a/AK1/data/vakten/agentfabrik/ko";
  const koFiler = fs.readdirSync(koDir).filter(f => f.endsWith(".json"));
  for (const f of koFiler) {
    const j = JSON.parse(fs.readFileSync(koDir + "/" + f, "utf8"));
    let st = "(ingen status)";
    try {
      const s = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/vakten/agentfabrik/status/" + j.id + ".json", "utf8"));
      st = s.status + " · uppgifter: " + (s.uppgifter ? Object.values(s.uppgifter).map(u => u.status || "?").join(",") : "?");
    } catch {}
    console.log(`- ${j.id}: ${st} (skapad ${new Date(j.skapad).toISOString()})`);
  }
  if (!koFiler.length) console.log("(tom)");
} catch (e) { console.log("FEL ko:", e.message); }

console.log("\n=== o155 §7 KÖN ===");
try {
  const t = fs.readFileSync("/home/ak1a/agent/ak1/data/forskning/OPTIMERING/o155-prestanda-nattfonster-lastvakt-s7.md", "utf8");
  const i = t.indexOf("## 7");
  console.log(i >= 0 ? t.slice(i, i + 1200) : "(sektion 7 hittades ej — söker KÖ)");
  if (i < 0) {
    const k = t.toLowerCase().indexOf("kö");
    console.log(t.slice(Math.max(0, k - 100), k + 900));
  }
} catch (e) { console.log("FEL o155:", e.message); }

console.log("\n=== UPPDRAGSLOGG (senaste 2) ===");
try {
  const rader = fs.readFileSync("/home/ak1a/agent/ak1/data/vakten/uppdragslogg.jsonl", "utf8").trim().split("\n");
  console.log(rader.slice(-2).join("\n"));
} catch (e) { console.log("(ingen uppdragslogg:", e.message + ")"); }

console.log("\n=== KUNDUPPDRAG ===");
try { console.log(fs.readFileSync("/home/ak1a/agent/ak1/data/vakten/kunduppdrag.json", "utf8")); } catch { console.log("(inget aktivt)"); }
console.log("\n=== UPPDRAG-KLART ===");
try { console.log(fs.readFileSync("/home/ak1a/agent/ak1/data/vakten/uppdrag-klart.json", "utf8")); } catch { console.log("(inget)"); }
