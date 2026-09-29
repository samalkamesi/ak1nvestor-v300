// ROND 344 — klock- och pm2-sond via node-kanalen (skal-kanalen hänger).
import { execFileSync } from "node:child_process";

const ut = {};

ut.lokalTid = new Date().toString();
ut.iso = new Date().toISOString();
ut.tidszon = Intl.DateTimeFormat().resolvedOptions().timeZone;

try {
  ut.timedatectl = execFileSync("timedatectl", { encoding: "utf8", timeout: 10_000 })
    .split("\n")
    .filter((r) => /Local time|Universal time|Time zone|synchronized|NTP/.test(r));
} catch (e) {
  ut.timedatectl = "FEL: " + String(e).slice(0, 120);
}

// timesyncd-journal: har klockan stegats? (step = hopp, slew = gradvis)
try {
  ut.timesync = execFileSync(
    "journalctl",
    ["-u", "systemd-timesyncd", "--since", "8 hours ago", "--no-pager", "-n", "30"],
    { encoding: "utf8", timeout: 10_000 }
  ).trim().split("\n").slice(-12);
} catch (e) {
  ut.timesync = "FEL: " + String(e).slice(0, 120);
}

// pm2-lista via daemon-socket (pm2 ls kan hänga i skalet; node-kanalen är stabil)
try {
  ut.pm2 = execFileSync("pm2", ["ls", "--no-color"], {
    encoding: "utf8",
    timeout: 20_000,
  }).trim();
} catch (e) {
  ut.pm2 = "FEL: " + String(e).slice(0, 200);
}

// last — reboot-spår
try {
  ut.last = execFileSync("last", ["-n", "8", "--time-format", "short"], {
    encoding: "utf8",
    timeout: 10_000,
  }).trim();
} catch (e) {
  ut.last = "FEL: " + String(e).slice(0, 120);
}

console.log(JSON.stringify(ut, null, 2));
