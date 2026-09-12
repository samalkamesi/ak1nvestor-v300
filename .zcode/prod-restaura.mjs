import { execSync } from "node:child_process";
const kör = (cmd, cwd = "/home/ak1a/AK1") => {
  try {
    const ut = execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    console.log(`OK> ${cmd}\n${ut.trim().slice(0, 300)}`);
    return ut;
  } catch (e) {
    console.log(`FEL> ${cmd}\n${String(e.stdout || "")}${String(e.stderr || "")}`.slice(0, 800));
    process.exit(1);
  }
};
// Cachefiler är appar-genererade och regenereras vid nästa förfrågan — säkra att återställa
kör("git checkout -- data/cache/analys-nyh_e406a84d.json data/cache/vagfundament-VOLV_B_ST.json");
console.log(kör("git status --short") || "(rent träd)");
// Pusha från arbetsytan
kör("git push prod develop", "/home/ak1a/agent/ak1");
