import { execSync } from "node:child_process";

// Bygg under deploylåset (våg 100-regeln: ALDRIG bygga olåst på prod).
// npm ci + build + pm2-restart enligt AGENTS.md §MOLNUTVECKLING.
const BYGG = "flock -n /tmp/ak1a-deploy.lock bash -c 'cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a'";

const start = Date.now();
try {
  const ut = execSync(BYGG, {
    cwd: "/home/ak1a/AK1",
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
    timeout: 9 * 60 * 1000,
  });
  const sek = Math.round((Date.now() - start) / 1000);
  console.log(`BYGG OK på ${sek} s`);
  console.log(ut.slice(-2500));
} catch (e) {
  const sek = Math.round((Date.now() - start) / 1000);
  console.log(`BYGG FEL efter ${sek} s`);
  console.log(String(e.stdout || "").slice(-3000));
  console.log(String(e.stderr || "").slice(-1500));
  process.exit(1);
}
