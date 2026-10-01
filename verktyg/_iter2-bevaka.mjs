// Bevakar iterationens två väntelägen: byggstågets landning + prod-ytans rensning.
// Pollar var 60 s i max 12 min; allt till /tmp/iter2-bevak.log (node-kanal).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const LOGG = "/tmp/iter2-bevak.log";
fs.writeFileSync(LOGG, `bevakning start ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + "\n"); console.log(s); };

const GAMLAL_BUILD = "ZG-84L6-upvHIt0jR7VUf";
let byggtLandat = false;
let ytaRen = false;

for (let min = 0; min < 12; min++) {
  // 1) deploy-lås + BUILD_ID
  const lasFinns = fs.existsSync("/tmp/ak1a-deploy.lock");
  let buildId = "(saknas)";
  try { buildId = fs.readFileSync("/home/ak1a/AK1/.next/BUILD_ID", "utf8").trim(); } catch { /* behåll */ }
  const bytt = buildId !== GAMLAL_BUILD && buildId !== "(saknas)";
  if (!lasFinns && bytt && !byggtLandat) {
    byggtLandat = true;
    logga(`[${min} min] BYGGSTÅGET LANDAT — lås borta, BUILD_ID=${buildId} (ny)`);
  }

  // 2) prod-ytans renhet (git status --porcelain i prod-trädet)
  let smuts = "?";
  try {
    const ut = execFileSync("git", ["-C", "/home/ak1a/AK1", "status", "--porcelain"], {
      encoding: "utf8", timeout: 30_000,
    });
    const rader = ut.trim().split("\n").filter(Boolean);
    smuts = rader.length + " smutsiga";
    if (rader.length === 0 && !ytaRen) {
      ytaRen = true;
      logga(`[${min} min] PROD-YTAN REN — push-fönstret öppet`);
    } else if (min === 0 || rader.length <= 5) {
      logga(`[${min} min] yta: ${rader.slice(0, 5).join(" ; ").slice(0, 300) || "ren"}`);
    }
  } catch (e) {
    logga(`[${min} min] git-status FEL ${String(e.message).slice(0, 80)}`);
  }

  // 3) fabrikstatus + sajten
  try {
    const j = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/vakten/agentfabrik/status/auto-s5-1790811909094.json", "utf8"));
    if (j.status !== "pågår") logga(`[${min} min] FABRIKEN s5: ${j.status} (${j.klara?.length ?? 0}/${j.totalt} klara)`);
  } catch { /* fil kan komma/skevas */ }
  if (byggtLandat) {
    try {
      const r = await fetch(new URL("/zcode", "https://lab.ak1nvestor.com"), { redirect: "manual", signal: AbortSignal.timeout(10_000) });
      logga(`[${min} min] GET /zcode: ${r.status}`);
      const r2 = await fetch(new URL("/", "https://lab.ak1nvestor.com"), { redirect: "manual", signal: AbortSignal.timeout(10_000) });
      logga(`[${min} min] GET /: ${r2.status}`);
      break;
    } catch (e) {
      logga(`[${min} min] GET-fel ${String(e).slice(0, 60)}`);
    }
  }

  if (byggtLandat && ytaRen) break;
  if (min < 11) await new Promise((r) => setTimeout(r, 60_000));
}
logga(`bevakning slut ${new Date().toISOString()} — bygg landat=${byggtLandat} yta ren=${ytaRen}`);
