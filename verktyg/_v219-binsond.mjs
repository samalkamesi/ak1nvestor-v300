// v219-binsond: var bor zcode-app-cli? (G4:s versionsläsning behöver rätt miljö)
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const LOGG = "/tmp/v219-binsond.log";
fs.writeFileSync(LOGG, `binsond ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + "\n"); console.log(s); };
const kör = (namn, cmd, args, t = 30_000) => {
  try {
    logga(`${namn}: ${execFileSync(cmd, args, { encoding: "utf8", timeout: t }).trim().slice(0, 500)}`);
  } catch (e) {
    logga(`${namn}: FEL ${String(e.message).slice(0, 120)}`);
  }
};

kör("which zcode", "which", ["zcode"]);
kör("which zcode-app-cli", "which", ["zcode-app-cli"]);
kör("npm prefix -g", "npm", ["prefix", "-g"]);
kör("npm ls -g", "npm", ["ls", "-g", "--depth=0"]);

// pm2:s processinfo för ak1a-pumpor (app-server-barnens födelseplats)
kör("pm2 describe", "pm2", ["describe", "ak1a-pumpor"], 60_000);

// Kända installationsställen på disk
for (const p of [
  "/home/ak1a/.nvm/versions/node",
  "/usr/lib/node_modules",
  "/usr/local/lib/node_modules",
]) {
  try {
    const found = fs.readdirSync(p);
    logga(`${p}: ${found.join(", ").slice(0, 200)}`);
  } catch {
    logga(`${p}: (finns ej)`);
  }
}

// Sök efter paketkatalogen zcode-app-cli begränsat
kör("find .nvm", "find", ["/home/ak1a/.nvm", "-maxdepth", "5", "-name", "zcode-app-cli", "-type", "d"], 60_000);
logga("KLAR");
