#!/usr/bin/env node
// testa-doda-lankar.mjs — svit för döda-länkar-vaktens mätfönster-grindar
// (o55, 2026-09-17). Fixturer lever i OS-temp (mkdtemp) med en lokal
// fejk-server: sviten kan aldrig skriva i repot eller mäta riktiga prod —
// den verifierar VERKTYGSKONTRAKTET, inte sajten.
//
// Körning: node verktyg/testa-doda-lankar.mjs  (från repots rot)
// Kontrakt som testas (o47 §2 inbyggt):
//   A bas ej frisk        → avbrott vid hälsogrind, INGEN rapportfil
//   B driftfönster > tak  → rapport kasseras (exit 2), INGEN fyndfil
//   C friskt läge         → mätvärde levererat, död länk med källor
//   D filskydd            → befintlig rapport skrivs ALDRIG över
//   E byggprocess pågår   → avbrott vid pgrep-grind
//   F deploylås ägs       → avbrott vid lås-ägandegrinden (/proc-fd, ÄGANDE, ej existens)

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const kora = promisify(execFile);
const VERKTYG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "doda-lankar.mjs");
const REPO = path.resolve(path.dirname(VERKTYG), "..");

let pass = 0;
let fail = 0;
let skip = 0;
function rapport(nr, namn, ok, detalj) {
  if (ok) {
    pass++;
    console.log(`PASS ${nr} ${namn}${detalj ? ` — ${detalj}` : ""}`);
  } else {
    fail++;
    console.log(`FAIL ${nr} ${namn}${detalj ? ` — ${detalj}` : ""}`);
  }
}
function rapporteraSkip(nr, namn, detalj) {
  skip++;
  console.log(`SKIP ${nr} ${namn}${detalj ? ` — ${detalj}` : ""}`);
}

function textSida(kropp) {
  return `<!doctype html><html><body>${kropp}</body></html>`;
}

// Fejk-server med router: (reqPath) → { status, kropp } | undefined (404)
function startaServer(router) {
  return new Promise((losa) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, "http://x");
      const svar = router ? router(u.pathname) : undefined;
      res.writeHead(svar?.status || 404, { "content-type": "text/html" });
      res.end(svar?.kropp ?? "");
    });
    server.listen(0, "127.0.0.1", () => losa({ server, port: server.address().port }));
  });
}

function stang(server) {
  // closeAllConnections tar INGEN callback och stänger inte lyssnaren —
  // close() måste alltid köras (annars hänger await på en öppen keep-alive).
  return new Promise((losa) => {
    if (server.closeAllConnections) server.closeAllConnections();
    server.close(losa);
  });
}

function sitemap(locs) {
  return `<?xml version="1.0"?><urlset>${locs.map((l) => `<url><loc>http://x${l}</loc></url>`).join("")}</urlset>`;
}

// Kör verktyget i isolerad cwd (rapportfilen landar i tmp). Miljön pekar
// grindarna på testets egna låsfil/mönster — skarpt läge (riktiga
// /tmp/ak1a-deploy.lock + next build) berörs aldrig av sviten.
function korVerktyg({ bas, cwd, miljo = {} }) {
  return new Promise((losa) => {
    const barn = execFile(
      "node",
      [VERKTYG, "--bas", bas],
      {
        cwd,
        timeout: 60_000,
        env: {
          ...process.env,
          AK1A_DEPLOY_LAS: miljo.las || egenLas,
          AK1A_BYGG_MONSTER: miljo.monster || "akt1a-testbyggare-som-aldrig-finns",
        },
      },
      (fel, stdout, stderr) => losa({ kod: fel ? fel.code : 0, stdout, stderr })
    );
    barn.on("error", () => {}); // timeout/spawn-fel hanteras via callbackens fel
  });
}

function rapportFiler(cwd) {
  const dir = path.join(cwd, "data", "vakten");
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort() : [];
}

const arbete = fs.mkdtempSync(path.join(os.tmpdir(), "testa-doda-lankar-"));
// Egen låsfil-skillnad (o570): tidigare refererades miljo.egenLas som ALDRIG
// definierades ⇒ AK1A_DEPLOY_LAS blev undefined ⇒ verktyget föll tillbaka på
// SKARPA /tmp/ak1a-deploy.lock — sviten var inte isolerad från riktiga
// deployer (maskerad av fuser-blindheten tills /proc-sonden o570 gjorde
// grinden ärlig). Nu: svit-egen låsfil som aldrig finns/ägs = fritt fönster.
const egenLas = path.join(arbete, "svit-egen-deploy-las-som-aldrig-finns.lock");
console.log(`Fixtures: ${arbete}`);

// --- A: bas ej frisk — hälsogrinden stoppar innan mätvärde ------------------
{
  const { server, port } = await startaServer(() => ({ status: 500, kropp: "" }));
  const cwd = fs.mkdtempSync(path.join(arbete, "a-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd });
  rapport("A1", "avbrott med kod 1", r.kod === 1, `kod=${r.kod}`);
  rapport("A2", "hälsogrindens förklaring syns", /basen ej frisk/.test(r.stderr || r.stdout), "");
  rapport("A3", "ingen rapportfil skriven", rapportFiler(cwd).length === 0, JSON.stringify(rapportFiler(cwd)));
  await stang(server);
}

// --- B: driftfönster — > 5 % serverfel kasserar rapporten -------------------
{
  const locs = Array.from({ length: 20 }, (_, i) => `/sida-${i}`);
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(locs) };
    if (p === "/" || p === "/kurser") return { status: 200, kropp: textSida("") };
    return { status: 500, kropp: "" };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "b-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd });
  rapport("B1", "avbrott med kod 2 (driftfönster)", r.kod === 2, `kod=${r.kod}`);
  rapport("B2", "artefaktdoktrinens förklaring syns", /DRIFTFÖNSTER/.test(r.stderr || r.stdout), "");
  rapport("B3", "ingen fyndfil skriven", rapportFiler(cwd).length === 0, JSON.stringify(rapportFiler(cwd)));
  await stang(server);
}

// --- C: friskt läge — mätvärde levererat med död länk + källa ---------------
{
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/", "/a", "/b"]) };
    if (p === "/") return { status: 200, kropp: textSida('<a href="/a">a</a><a href="/b">b</a>') };
    if (p === "/kurser") return { status: 200, kropp: textSida("") };
    if (p === "/a") return { status: 200, kropp: textSida('<a href="/saknad">saknad</a>') };
    if (p === "/b") return { status: 200, kropp: textSida("") };
    return undefined; // /saknad → 404 = äkta död länk
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "c-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd });
  const filer = rapportFiler(cwd);
  rapport("C1", "kod 0 (mätvärde levererat)", r.kod === 0, `kod=${r.kod}`);
  rapport("C2", "exakt en rapportfil", filer.length === 1, JSON.stringify(filer));
  let j = null;
  try {
    j = JSON.parse(fs.readFileSync(path.join(cwd, "data", "vakten", filer[0]), "utf8"));
  } catch {}
  rapport("C3", "4 sidor kontrollerade", j?.kontrolleradeSidor === 4, `=${j?.kontrolleradeSidor}`);
  rapport("C4", "1 död länk hittad", j?.dodaLankar === 1 && j?.doda?.[0]?.mal === "/saknad", JSON.stringify(j?.doda));
  rapport("C5", "källsidan pekas ut (rotorsak)", j?.doda?.[0]?.kallor?.includes("/a"), JSON.stringify(j?.doda?.[0]?.kallor));
  rapport("C6", "rapporten märks ej tvingad", j?.tvingad === false, "");

  // --- D: filskydd — andra mätningen samma dag skriver ALDRIG över ----------
  const forstaFornamn = filer[0];
  const forstaInne = fs.readFileSync(path.join(cwd, "data", "vakten", forstaFornamn), "utf8");
  const r2 = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd });
  const filer2 = rapportFiler(cwd);
  const forstaInne2 = fs.readFileSync(path.join(cwd, "data", "vakten", forstaFornamn), "utf8");
  rapport("D1", "andra mätningen levererar också kod 0", r2.kod === 0, `kod=${r2.kod}`);
  rapport("D2", "två rapportfiler (klockslagssuffix)", filer2.length === 2, JSON.stringify(filer2));
  rapport("D3", "första rapporten byte-identisk", forstaInne === forstaInne2, "");
  await stang(server);
}

// --- E: byggprocess pågår — pgrep-grinden stoppar ---------------------------
{
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/"]) };
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "e-"));
  // argv0 lurar pgrep -f: cmdline börjar på mönstret, deterministiskt isolerat
  // från skarpt läge via AK1A_BYGG_MONSTER (sviten matchar aldrig "next build").
  const sabotör = spawn("sleep", ["30"], { argv0: "akt1a-testbyggare-paggår", stdio: "ignore" });
  await new Promise((losa) => setTimeout(losa, 300)); // cmdline synlig i /proc
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { monster: "akt1a-testbyggare" } });
  sabotör.kill("SIGKILL");
  rapport("E1", "avbrott med kod 1", r.kod === 1, `kod=${r.kod}`);
  rapport("E2", "bygggrindens förklaring syns", /bygg\/install-process pågår/.test(r.stderr || r.stdout), "");
  rapport("E3", "ingen rapportfil skriven", rapportFiler(cwd).length === 0, JSON.stringify(rapportFiler(cwd)));
  await stang(server);
}

// --- F: deploylåset ÄGS — lås-ägandegrinden stoppar (existens räcker ej) -----
{
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/"]) };
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "f-"));
  const lasFil = path.join(arbete, "test-deploy-las.lock");
  fs.writeFileSync(lasFil, ""); // flock lämnar filen kvar — existens är INTE indikator
  const fd = fs.openSync(lasFil, "r+"); // VÅR process äger den = "deploy pågår"
  const r1 = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { las: lasFil } });
  rapport("F1", "avbrott med kod 1 när låset ägs", r1.kod === 1, `kod=${r1.kod}`);
  rapport("F2", "deploygrindens förklaring syns", /deployfönster aktivt/.test(r1.stderr || r1.stdout), "");
  rapport("F3", "ingen rapportfil skriven", rapportFiler(cwd).length === 0, JSON.stringify(rapportFiler(cwd)));
  fs.closeSync(fd); // låset släppt — samma fil, ny ägarelöshet: mätning ska NU gå
  const r2 = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { las: lasFil } });
  rapport("F4", "samma fil utan ägare = mätvärdet går (existens-alarm)", r2.kod === 0, `kod=${r2.kod}`);
  await stang(server);
}

// --- G: HELA mönster — "next" i server-cmdline får ALDRIG bli falsklarm ----
// (verklighetsbeviset: pm2 'ak1a' bär "next" varje dag; sekvensen "next build"
// förekommer ENDAST under ett pågående bygg — kommaseparerat hela mönster är
// kontraktet. Ett ÄKT deployfönster under testfönstret → SKIP, aldrig falskt
// rött.)
{
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/"]) };
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "g-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { monster: "next build,npm ci --no-audit" } });
  if (/bygg\/install-process pågår/.test(r.stderr || r.stdout)) {
    rapporteraSkip("G", "äkta byggfönster på servern just nu", "verktyget avbröt korrekt; kör om i stilla fönster");
  } else {
    rapport("G1", "hela mönster ger inget falsklarm (kod 0)", r.kod === 0, `kod=${r.kod}`);
    rapport("G2", "rapportfil skriven", rapportFiler(cwd).length === 1, JSON.stringify(rapportFiler(cwd)));
  }
  await stang(server);
}

console.log(`\nSVIT: ${pass} PASS, ${fail} FAIL, ${skip} SKIP`);
fs.rmSync(arbete, { recursive: true, force: true });
process.exit(fail === 0 ? 0 : 1);
