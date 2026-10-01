#!/usr/bin/env node
// s1-u3 (auto-s1-1790858103968) — PAKETBYGGARE Tesla Q3 2026
// Applicerar granskningens fyra kurer på utkastet och skriver FLYTTKLART-PAKET.
// Varje kur assertar EXAKT EN TRÄFF; utkastet på disk lämnas orört (md5 före==efter).
import fs from "node:fs";
import crypto from "node:crypto";

const KALLA = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-tesla-q3-2026.json";
const MAL = "/home/ak1a/AK1/data/blogg-utkast/granskning/sa-laser-du-tesla-q3-2026-FLYTTKLART-PAKET-2026-10-01-s1u3.json";

const forra = fs.readFileSync(KALLA, "utf8");
const md5Forra = crypto.createHash("md5").update(forra).digest("hex");
const pak = JSON.parse(forra);

const bytEn = (obj, nyckel, fran, till, kurId) => {
  const s = obj[nyckel];
  const antal = s.split(fran).length - 1;
  if (antal !== 1) { console.error("KUR " + kurId + " ABORT: " + antal + " träffar (krav: exakt 1) för: " + fran.slice(0, 60)); process.exit(1); }
  obj[nyckel] = s.replace(fran, till);
  console.log("KUR " + kurId + " OK: exakt en träff utbytt (" + nyckel + ")");
};

const NY_TITLE = "Tesla (TSLA) Q3-rapport 2026: så läser du den — universumets högsta EV/EBIT (946,8) och näst högsta P/E (333,7) på EBIT-marginalen 1,41 procent, EPS-kedjan 0,39+0,23+0,13+0,32 = 1,07 dollar, leveranssvängen 497 099 → 358 023 → 480 126 och skuldkvoten 0,18 — rappdagen 21 oktober efter amerikansk börsstängning";
const NY_DESC = "Tesla, Inc. (TSLA, Nasdaq) — 1 410 miljarder dollar i börsvärde — väntas rapportera tredje kvartalet 2026 onsdagen 21 oktober efter amerikansk stängning enligt konvergerande tredjepartskalendrar (Wall Street Horizon, Public.com, Yahoo; Zacks divergerar med 28/10 — ir.tesla.com äger datumet). Läspaketet: multipelns extrema hörn (EV/EBIT 946,8 universumets högsta, P/E 333,7 näst högst) på EBIT-marginalen 1,41 procent; kvartalskedjan som stänger P/E-fältet exakt på 1,07 dollar; leveranssvängen 497 099 → 358 023 → 480 126; och balansräkningen som det friska hörnet — skuldkvoten mitt i grenen, frågan är vinstnämnaren. Allt som utbildning, aldrig råd.";

// F1: title 461 → ≤ 314 (wihlborgs-taket)
console.log("F1: ny title " + NY_TITLE.length + " tkn (tak 314)");
if (NY_TITLE.length > 314) { console.error("F1 ABORT: title över taket"); process.exit(1); }
if (NY_TITLE === pak.title) { console.error("F1 ABORT: identisk med gamla"); process.exit(1); }
pak.title = NY_TITLE;

// F2: description 905 → 328–654 (seriepraxis)
console.log("F2: ny description " + NY_DESC.length + " tkn (praxis 328–654)");
if (NY_DESC.length < 328 || NY_DESC.length > 654) { console.error("F2 ABORT: utanför fönstret"); process.exit(1); }
if (NY_DESC === pak.description) { console.error("F2 ABORT: identisk med gamla"); process.exit(1); }
pak.description = NY_DESC;

// F3: mjukt bindestreck (U+00AD) — exakt en träff i body
const adAntal = pak.body.split("\u00AD").length - 1;
if (adAntal !== 1) { console.error("F3 ABORT: " + adAntal + " mjuka bindestreck (krav: exakt 1)"); process.exit(1); }
pak.body = pak.body.replace("intäkts\u00ADtillväxten", "intäktstillväxten");
console.log("F3 OK: mjukt bindestreck borta ('TTM-intäktstillväxten')");

// F4: tabellens n-klasser — totalantal 328 → bärande n (P/E 315, EV/EBIT 297)
bytEn(pak, "body", "(universumets näst högsta av 328)", "(universumets näst högsta av 315 bärande)", "F4a");
bytEn(pak, "body", "(universumets högsta av 328)", "(universumets högsta av 297 bärande)", "F4b");

fs.writeFileSync(MAL, JSON.stringify(pak, null, 2) + "\n", "utf8");
console.log("SKRIVEN: " + MAL);

// Efterverifiering
const efter = fs.readFileSync(KALLA, "utf8");
const md5Efter = crypto.createHash("md5").update(efter).digest("hex");
console.log("utkastet orört: " + (md5Forra === md5Efter ? "JA (md5 " + md5Forra.slice(0, 8) + ")" : "NEJ — STÄNG"));
if (md5Forra !== md5Efter) process.exit(1);
const nyPak = JSON.parse(fs.readFileSync(MAL, "utf8"));
const gamla = [pak ? "" : "", "(universumets näst högsta av 328)", "(universumets högsta av 328)"];
for (const g of gamla.slice(1)) if ((nyPak.body || "").includes(g)) { console.error("EFTERVERIFIERING ABORT: gammal sträng kvar: " + g); process.exit(1); }
if ((nyPak.body.match(/\u00AD/g) || []).length !== 0) { console.error("EFTERVERIFIERING ABORT: mjuka bindestreck kvar"); process.exit(1); }
const nycklarForra = Object.keys(JSON.parse(forra)).sort().join(",");
const nycklarNya = Object.keys(nyPak).sort().join(",");
console.log("nycklar intakta: " + (nycklarForra === nycklarNya ? "JA (" + nycklarNya.length + " st)" : "NEJ"));
for (const k of Object.keys(nyPak)) {
  if (["title", "description", "body"].includes(k)) continue;
  if (JSON.stringify(nyPak[k]) !== JSON.stringify(JSON.parse(forra)[k])) { console.error("EFTERVERIFIERING ABORT: nyckel ändrad: " + k); process.exit(1); }
}
console.log("EFTERVERIFIERING GRÖN: 3 kvurade ytor endast (title/description/body), övriga " + (nycklarNya.length - 3) + " nycklar bitidentiska");
