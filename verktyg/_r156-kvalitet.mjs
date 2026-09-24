// Rond 96 — sond 3: kvalitetsrapportens 10 fel + ommätningslåset
import fs from "node:fs";
import { execSync } from "node:child_process";

const ko = (cmd) => { try { return execSync(cmd, { encoding: "utf8", timeout: 15000 }).trim(); } catch (e) { return "FEL: " + (e.stderr || e.message).toString().slice(0, 200); } };

console.log("=== HITTA KVALITETSRAPPORTEN ===");
for (const dir of ["/home/ak1a/AK1/data/rapporter", "/home/ak1a/AK1/data/vakten", "/home/ak1a/AK1/data/rapporter/kvalitet"]) {
  try {
    for (const f of fs.readdirSync(dir)) {
      if (/kvalitet/i.test(f)) {
        const p = dir + "/" + f;
        const st = fs.statSync(p);
        console.log(`- ${p} mtime=${st.mtime.toISOString()} ${st.size}B`);
      }
    }
  } catch {}
}

// Läs den färska rapporten (sök i rapporter + vakten)
console.log("\n=== RAPPORTINNEHÅLL (senaste kvalitetsrapport) ===");
let kand = [];
for (const dir of ["/home/ak1a/AK1/data/rapporter", "/home/ak1a/AK1/data/vakten"]) {
  try {
    kand.push(...fs.readdirSync(dir).filter(f => /kvalitet/i.test(f)).map(f => dir + "/" + f));
  } catch {}
}
if (kand.length) {
  kand.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  const p = kand[0];
  console.log("läser:", p);
  const t = fs.readFileSync(p, "utf8");
  try {
    const j = JSON.parse(t);
    // skriv ut fel-listan komprimerat
    const fel = j.fel || j.fynd || j.resultat?.fel || [];
    console.log("status:", j.status, "| genererad:", j.genererad || j.ts);
    console.log("fel-antal:", Array.isArray(fel) ? fel.length : typeof fel);
    for (const f of (Array.isArray(fel) ? fel : []).slice(0, 12)) {
      console.log("FEL:", JSON.stringify(f).slice(0, 300));
    }
    if (!Array.isArray(fel) || !fel.length) console.log(t.slice(0, 2000));
  } catch { console.log(t.slice(0, 2500)); }
} else console.log("(ingen kvalitetsrapport hittad)");

console.log("\n=== OMMÄTNINGSLÅS ===");
for (const tmpf of fs.readdirSync("/tmp")) {
  if (/kvalitet|ommät|ommatt|vakt.*lås|vakt.*lock/i.test(tmpf)) {
    const p = "/tmp/" + tmpf;
    const st = fs.statSync(p);
    let innehall = "";
    try { innehall = fs.readFileSync(p, "utf8").slice(0, 120); } catch {}
    console.log(`- ${p} mtime=${st.mtime.toISOString()} innehåll="${innehall}"`);
  }
}

console.log("\n=== KÖRANDE MÄTNINGSPROCESSER? ===");
console.log(ko("ps aux | grep -iE 'kvalitetsvakt|kvalitet-vakt|omm' | grep -v grep") || "(inga)");

console.log("\n=== KVALITETSVAKTENS CRON + SKRIPT ===");
console.log(ko("crontab -l 2>/dev/null | grep -i kvalitet") || "(ej i crontab)");
try {
  for (const f of fs.readdirSync("/home/ak1a/AK1/verktyg").filter(f => /kvalitet/i.test(f))) console.log("verktyg:", f);
} catch {}

console.log("\n=== PROD-BYGG-LÄGE ===");
console.log("BUILD_ID:", ko("cat /home/ak1a/AK1/.next/BUILD_ID 2>/dev/null") || "(saknas)");
console.log("prod-HEAD:", ko("git -C /home/ak1a/AK1 log --oneline -1"));
