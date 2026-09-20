#!/usr/bin/env node
/** F3-ÅTERMÄTNING (Lag 1) — FYNN:s eskalerade rad "/andringar nätverksfel".
 *  Samma auth + endpoints + timeout som verktyg/feljagaren.mjs jagaApi(),
 *  plus: 2 omgångar (stabilitet), svarstider, och feljägarens eget omtest
 *  (20 s) vid träff. Rapport: data/vakten/f3-atermatning-SENASTE.json. */
import fs from "node:fs";

const NYCKELN = "ADMIN" + "_PASSWORD";
const BAS = process.env.AK1A_BAS_URL || "http://localhost:3000";
const pass = (() => {
  try {
    const rad = fs.readFileSync("/home/ak1a/AK1/.env.production.local", "utf8").split("\n").find((r) => r.startsWith(NYCKELN + "="));
    return rad ? rad.slice(NYCKELN.length + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch { return ""; }
})();

const andpunkter = [
  "puls", "halsa", "modeller", "fardigheter", "filer", "minne",
  "anvandning", "andringar", "interaktion", "subagenter", "audit",
  "godkannande", "maskin", "mal/status", "session", "uppladdning",
  "tjanster/automation", "tjanster/bakgrund",
];

const sov = (ms) => new Promise((r) => setTimeout(r, ms));
async function sond(v) {
  const t0 = Date.now();
  try {
    const r = await fetch(`${BAS}/api/studio/${v}`, { headers: { "x-admin-password": pass }, signal: AbortSignal.timeout(15_000) });
    return { v, kod: r.status, ms: Date.now() - t0, fel: null };
  } catch (e) {
    return { v, kod: null, ms: Date.now() - t0, fel: String(e).slice(0, 80) };
  }
}

const resultat = { startad: new Date().toISOString(), bas: BAS, omganger: [], andringar: null };
let allaOk = true;
for (let omg = 1; omg <= 2; omg++) {
  const rader = [];
  for (const v of andpunkter) {
    const r = await sond(v);
    rader.push(r);
    if (r.kod !== 200) {
      allaOk = false;
      console.log(`[omg ${omg}] ${v}: ${r.kod ?? "NÄTVERKSFEL"} (${r.ms} ms) ${r.fel ?? ""}`);
      // feljägarens eget omtest (rond 50): 20 s + en gång till
      await sov(20_000);
      const r2 = await sond(v);
      r.omtest = r2;
      console.log(`  omtest: ${r2.kod ?? "NÄTVERKSFEL"} (${r2.ms} ms) ${r2.fel ?? ""}`);
    }
  }
  const antal200 = rader.filter((r) => r.kod === 200).length;
  resultat.omganger.push({ omgang: omg, antal200, av: andpunkter.length, rader }); // nyckel: omgangar
  console.log(`omgång ${omg}: ${antal200}/${andpunkter.length} ändpunkter 200`);
  if (omg === 1) await sov(3_000);
}
resultat.andringar = {
  omg1: resultat.omganger[0].rader.find((r) => r.v === "andringar"),
  omg2: resultat.omganger[1].rader.find((r) => r.v === "andringar"),
};
resultat.dom = allaOk ? "GRÖN — samtliga 18 ändpunkter 200 i 2 omgångar" : "FYND — se rader";
resultat.slut = new Date().toISOString();
fs.writeFileSync("/home/ak1a/agent/ak1/data/vakten/f3-atermatning-SENASTE.json", JSON.stringify(resultat, null, 1));
console.log("DOM:", resultat.dom);
