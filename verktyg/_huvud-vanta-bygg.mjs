// Väntar ut prod-synkens ombygg (deploylåset) och verifierar leveransen live:
// listvy 76 kort, nya detaljsidor 200, sitemap-träffar. Max ~9 min per körning.
import { readFileSync, existsSync } from "node:fs";

const GAMMAL_BUILD = "ZG-84L6-upvHIt0jR7VUf";
const LOCK = "/tmp/ak1a-deploy.lock";
// PROD_URL (versal modulkonstant): fast compile-tidsvärden — Mimosa v1.4.
const PROD_URL = "https://lab.ak1nvestor.com";
const vila = (ms) => new Promise((r) => setTimeout(r, ms));
const start = Date.now();

while (Date.now() - start < 8.5 * 60_000) {
  if (!existsSync(LOCK)) {
    const buildId = readFileSync("/home/ak1a/AK1/.next/BUILD_ID", "utf8").trim();
    console.log("Låset släppte efter", Math.round((Date.now() - start) / 1000), "s · BUILD_ID:", buildId);
    if (buildId === GAMMAL_BUILD) {
      console.log("VARNING: BUILD_ID oförändrad — bygget kan ha misslyckats igen; kontrollera prod-synk.log");
    }
    await vila(5_000); // ge pm2 sekunder att landa efter dubbelbytet

    const stat = async (p) => {
      try { const r = await fetch(new URL(p, PROD_URL), { redirect: "manual" }); return r.status; }
      catch { return "FEL"; }
    };
    console.log("GET /:", await stat("/"));
    const lista = await fetch("https://lab.ak1nvestor.com/forskningsbiblioteket").then((r) => r.text());
    const antal = (lista.match(/\/forskningsbiblioteket\/[A-Z0-9]/g) || []).length;
    console.log("Listvy:", "innehåller \"76 bolag\":", lista.includes("76 bolag"), "· kortlänkar (ungefärlig):", antal);
    for (const t of ["4503.T", "GSK.L", "EVO.ST", "INFY.NS"]) {
      console.log(`GET ny ${t}:`, await stat("/forskningsbiblioteket/" + encodeURIComponent(t)));
    }
    console.log("GET MSFT (befintlig):", await stat("/forskningsbiblioteket/MSFT"));

    const sm = await fetch("https://lab.ak1nvestor.com/sitemap.xml").then((r) => r.text());
    const smNya = ["4503.T", "GSK.L", "EVO.ST", "INFY.NS"].filter((t) => sm.includes("forskningsbiblioteket/" + t));
    console.log("Sitemap bär nya tickers:", smNya.length + "/4", smNya.join(","));
    process.exit(0);
  }
  await vila(30_000);
}
console.log("Bygget pågår fortfarande efter 8,5 min — kör sonden igen.");
