// ROND 113: commit + push-cykel (node-kanalen — transporten hänger på git
// direkt). tsc-grinden i pre-commit tar minuter; skriptet loggar allt till
// data/vakten/r113-commit.log och pushar med merge-vänteloop (fabriksbarn
 // committar i prod-trädet — updateInstead kräver rent träd).
import { execSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const ROTA = "/home/ak1a/agent/ak1";
const LOGG = `${ROTA}/data/vakten/r113-commit.log`;
const rad = (s) => appendFileSync(LOGG, s + "\n", "utf8");
const kör = (args, tak = 300_000) => {
  try {
    const ut = execSync(`git ${args}`, { cwd: ROTA, encoding: "utf8", timeout: tak, maxBuffer: 16 * 1024 * 1024 });
    rad(`OK: git ${args.split(" ").slice(0, 3).join(" ")}\n${ut.slice(0, 800)}`);
    return { ok: true, ut };
  } catch (e) {
    rad(`FEL: git ${args.split(" ").slice(0, 3).join(" ")} — ${String(e.message ?? e).slice(0, 400)}`);
    return { ok: false, ut: String(e.stdout ?? "") };
  }
};

rad(`─── R113 commit-cykel ${new Date().toISOString()} ───`);
kör("add src/app/api/studio/stream/route.ts verktyg/mal-hjartslag.mjs verktyg/organism-halsa.mjs verktyg/testa-tradspermanens.mjs data/rapporter/motorervalidering-2026-09-02.md verktyg/_r112-beslutsminne2.mjs verktyg/_r112-tillstand.mjs verktyg/_r112-v215-meddelande.txt verktyg/_r112-v215b-meddelande.txt verktyg/_r112-payload-prob.mjs verktyg/_r112-git-diff.mjs verktyg/_r112-v215-tsc.mjs verktyg/_r113-commit.mjs verktyg/_r113-grindtest.mjs", 60_000);
const c = kör(`commit -F ${ROTA}/data/vakten/r113-commitmsg.txt`, 480_000);
if (!c.ok) {
  rad("COMMITTEN MISSLYCKADES — cykel avslutas");
  process.exit(1);
}
rad("Committad: " + c.ut.split("\n").find((r) => r.startsWith(" "))?.trim().slice(0, 60));

// Push med merge-vänteloop: prod kan ha nya commits/spärrat träd (fabriksbarn).
for (let forsok = 1; forsok <= 8; forsok++) {
  const p = kör("push prod develop", 120_000);
  if (p.ok) {
    rad("PUSH GRÖN");
    break;
  }
  rad(`push avvisad (försök ${forsok}/8) — fetch+merge och väntar 75 s`);
  kör("fetch prod develop", 120_000);
  const m = kör("merge prod/develop --no-edit", 180_000);
  if (m.ok && m.ut.includes("Conflict")) {
    rad("MERGEKONFLIKT — manuell hantering krävs, avslutar");
    process.exit(1);
  }
  if (forsok === 8) rad("PUSH VÄNTAR FORTARANDE — nästa iteration tar cykeln");
  else await new Promise((r) => setTimeout(r, 75_000));
}
rad("─── cykel slut ───");
