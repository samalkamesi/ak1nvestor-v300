// Kurateringsson(d) för analysfabriksutvidgningen (r352:s köpost):
// torrkör kandidatregeln v1 mot dagens korstabell — INGET SKRIVS.
// Frågor: hur många passerar, saknas akm1-cacher, faller de 22 befintliga ur?
import { readFileSync, existsSync, readdirSync } from "node:fs";

const REPO = "/home/ak1a/agent/ak1";
const korstabell = JSON.parse(
  readFileSync(REPO + "/data/portfolj-system/korstabell-grund.json", "utf8"),
);
const rader = korstabell.rader || [];

const bibliotek = new Set(
  readdirSync(REPO + "/data/forskningsbiblioteket")
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, "")),
);

const tickerFil = (t) => t.replace(/[^A-Za-z0-9._-]/g, "_").replace(/\./g, "_");

// Kandidatregeln v1 — identisk med verktyg/kor-analysfabrik.mjs
const TACKNING_GUL = 0.7;
const TACKNING_GRON_MIN = 0.6;
const REL_GUL = 0.65;

const pass = [];
const orsaker = { portV19: 0, status: 0, tackning: 0, relGul: 0 };
for (const rad of rader) {
  if (!rad.ticker || !rad.akm1MaxMojligt) continue;
  if (rad.portV19 !== false) { orsaker.portV19++; continue; }
  const rel = rad.akm1Totalt / rad.akm1MaxMojligt;
  if (rad.status === "gron") {
    if (rad.datatackning >= TACKNING_GRON_MIN) pass.push(rad);
    else orsaker.tackning++;
  } else if (rad.status === "gul") {
    if (rad.datatackning >= TACKNING_GUL && rel >= REL_GUL) pass.push(rad);
    else if (rad.datatackning < TACKNING_GUL) orsaker.tackning++;
    else orsaker.relGul++;
  } else {
    orsaker.status++;
  }
}

let harCache = 0;
const saknarCache = [];
for (const rad of pass) {
  const fil = tickerFil(rad.ticker);
  if (existsSync(`${REPO}/data/cache/akm1-${fil}.json`)) harCache++;
  else saknarCache.push(rad.ticker);
}

const statusFardelning = {};
for (const rad of rader) statusFardelning[rad.status] = (statusFardelning[rad.status] || 0) + 1;

const passSet = new Set(pass.map((r) => tickerFil(r.ticker)));
const urfallna = [...bibliotek].filter((f) => !passSet.has(f));
const nya = pass.filter((r) => !bibliotek.has(tickerFil(r.ticker)));

console.log("KORSTABELL:", rader.length, "rader · status:", JSON.stringify(statusFardelning));
console.log("PASSERAR kandidatregeln v1:", pass.length, "· avslag:", JSON.stringify(orsaker));
console.log("AKM1-CACHE: har", harCache, "· saknar", saknarCache.length, saknarCache.length ? "→ " + saknarCache.join(",") : "");
console.log("BIBLIOTEKET idag:", bibliotek.size, "filer · fortfarande kandidater:", bibliotek.size - urfallna.length, "· URFALLNA:", urfallna.join(",") || "(inga)");
console.log("NYA ANALYSER som skulle födas:", nya.length);
console.log("  varav grön/gul:", nya.filter((r) => r.status === "gron").length, "/", nya.filter((r) => r.status === "gul").length);
const lag = pass.filter((r) => r.status === "gron" && r.datatackning < 0.7).length;
console.log("  varningsetikett (grön < 70 % täckning) bland alla pass:", lag);
