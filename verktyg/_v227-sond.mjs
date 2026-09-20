/** V227-sond: slutcykelns + byggprocessernas status + RAM. */
import { execFileSync } from "node:child_process";

const kolla = (pid, namn) => {
  try {
    const ut = execFileSync("ps", ["-p", String(pid), "-o", "pid,etime,rss", "--no-headers"], { encoding: "utf8", timeout: 10_000 });
    console.log(namn + " LEVER:", ut.trim());
  } catch {
    console.log(namn + " (" + pid + ") BORTA");
  }
};
kolla(3660716, "v226-slutcykel");
kolla(3661694, "flock-bygg");

try {
  const ps = execFileSync("ps", ["aux"], { encoding: "utf8", timeout: 15_000 });
  const byggn = ps.split("\n").filter((r) => /next build|next-server|npm ci|turbopack/.test(r) && !/grep/.test(r));
  console.log("--- byggrelaterade processer (" + byggn.length + ") ---");
  for (const r of byggn) console.log(r.slice(0, 150));
} catch (e) { console.log("ps fel:", String(e.message).slice(0, 80)); }

try {
  const fria = execFileSync("free", ["-m"], { encoding: "utf8", timeout: 10_000 });
  console.log("--- free ---\n" + fria.split("\n").slice(0, 2).join("\n"));
} catch {}
