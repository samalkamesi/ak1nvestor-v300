#!/usr/bin/env node
// testa-doda-lankar-externa.mjs — svit för döda-länkar-EXTERNAS instrumentkur
// (o87, 2026-09-19: o55 §2-doktrinen bärd till det externa verktyget).
// Fixturer lever i OS-temp (mkdtemp) med en lokal fejk-server: sviten kan
// aldrig skriva i repot eller mäta riktiga prod — externa "mål" pekas på
// 127.0.0.1 (hostname passerar verktygets externa filter men lämnar aldrig
// maskinen). SvitEN verifierar VERKTYGSKONTRAKTET, inte sajten.
//
// Körning: node verktyg/testa-doda-lankar-externa.mjs  (från repots rot)
// Kontrakt som testas (o47 §2 / o55 §2, bärt till externa av o87; o113
// tillför driftfönster-återmätningen):
//   A bas ej frisk        → avbrott vid hälsogrind, INGEN fil alls
//   B driftfönster > tak  → fyndfil kasseras (exit 2), mellanlager märks,
//                           återupptagning till mätvärde VÄGRAS (bakdörren);
//                           o113: återmätning väcks men kasserar sig själv
//                           när felen består (okända fel maskeras ALDRIG)
//   C friskt läge         → mätvärde levererat, DOD-mål med källor
//   D filskydd            → befintliga filer skrivs ALDRIG över
//   E byggprocess pågår   → avbrott vid pgrep-grind
//   F deploylås ägs       → avbrott vid fuser-grind (ÄGANDE, ej existens)
//   G hela mönster        → "next build"-sekvensen ger inget falsklarm
//   H --tvinga            → diagnostikläget levererar märkt data, aldrig mätvärde
//   J driftfönster slut   → fönstervakt + EN återmätning räddar mätomgången
//                           (kod 0, andra mellanlagret grönt, atermatAntal=1)
//   K fönstret stänger ej → väntetak → exit 2, ENDA insamlingen bevaras,
//                           aldrig ändlös omkring-crawl

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { execFile, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const VERKTYG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "doda-lankar-externa.mjs");

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
  // close() måste alltid köras (o55:s svitläxa).
  return new Promise((losa) => {
    if (server.closeAllConnections) server.closeAllConnections();
    server.close(losa);
  });
}

function sitemap(locs) {
  return `<?xml version="1.0"?><urlset>${locs.map((l) => `<url><loc>http://x${l}</loc></url>`).join("")}</urlset>`;
}

// Kör verktyget i isolerad cwd (alla filer landar i tmp). Miljön pekar
// grindarna på testets egna låsfil/mönster — skarpt läge berörs aldrig.
function korVerktyg({ bas, cwd, extra = [], miljo = {} }) {
  return new Promise((losa) => {
    const barn = execFile(
      "node",
      [VERKTYG, "--bas", bas, ...extra],
      {
        cwd,
        timeout: 60_000,
        env: {
          ...process.env,
          AK1A_DEPLOY_LAS: miljo.las || `${cwd}-deploy-las-som-inte-finns.lock`,
          AK1A_BYGG_MONSTER: miljo.monster || "akt1a-testbyggare-som-aldrig-finns",
          ...(miljo.retryVanta ? { AK1A_RETRY_VANTA_MS: miljo.retryVanta } : {}),
          ...(miljo.retryPoll ? { AK1A_RETRY_POLL_MS: miljo.retryPoll } : {}),
        },
      },
      (fel, stdout, stderr) => losa({ kod: fel ? fel.code : 0, stdout, stderr })
    );
    barn.on("error", () => {}); // timeout/spawn-fel hanteras via callbackens fel
  });
}

function vaktenFiler(cwd) {
  const dir = path.join(cwd, "data", "vakten");
  if (!fs.existsSync(dir)) return { fynd: [], insamling: [] };
  const alla = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  return {
    fynd: alla.filter((f) => !f.includes("-insamling")),
    insamling: alla.filter((f) => f.includes("-insamling")),
  };
}
function lasJson(cwd, namn) {
  try {
    return JSON.parse(fs.readFileSync(path.join(cwd, "data", "vakten", namn), "utf8"));
  } catch {
    return null;
  }
}

const arbete = fs.mkdtempSync(path.join(os.tmpdir(), "testa-doda-externa-"));
console.log(`Fixtures: ${arbete}`);

// --- A: bas ej frisk — hälsogrinden stoppar innan något mätvärde ------------
{
  const { server, port } = await startaServer(() => ({ status: 500, kropp: "" }));
  const cwd = fs.mkdtempSync(path.join(arbete, "a-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd });
  rapport("A1", "avbrott med kod 1", r.kod === 1, `kod=${r.kod}`);
  rapport("A2", "hälsogrindens förklaring syns", /basen ej frisk/.test(r.stderr || r.stdout), "");
  const f = vaktenFiler(cwd);
  rapport("A3", "ingen fil alls skriven", f.fynd.length === 0 && f.insamling.length === 0, JSON.stringify(f));
  await stang(server);
}

// --- B: driftfönster — > 5 % LOKALA sidfel kasserar fyndfilen, mellanlagret
//        märks, o113-återmätningen kasserar sig själv när felen består (ingen
//        maskering), och återupptagning till mätvärde VÄGRAS (bakdörren) ---
{
  const locs = Array.from({ length: 20 }, (_, i) => `/sida-${i}`);
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(locs) };
    if (p === "/" || p === "/kurser") return { status: 200, kropp: textSida("") };
    return { status: 500, kropp: "" };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "b-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { retryPoll: "200" } });
  rapport("B1", "avbrott med kod 2 (driftfönster)", r.kod === 2, `kod=${r.kod}`);
  rapport("B2", "artefaktdoktrinens förklaring syns", /DRIFTFÖNSTER/.test(r.stderr || r.stdout), "");
  const f = vaktenFiler(cwd);
  rapport("B3", "ingen fyndfil skriven", f.fynd.length === 0, JSON.stringify(f.fynd));
  // o113: fönstret var fritt (okänd felorska) → EN återmätning väcktes och
  // kasserade sig själv — felet rapporteras fortfarande, aldrig maskerat.
  rapport("B4", "båda insamlingarna bevaras som diagnostikunderlag", f.insamling.length === 2, JSON.stringify(f.insamling));
  const mellan1 = lasJson(cwd, f.insamling[0]);
  const mellan2 = lasJson(cwd, f.insamling[1]);
  rapport("B5", "båda mellanlagren märkta driftfonster=true + driftAndel 1", mellan1?.driftfonster === true && mellan1?.driftAndel === 1 && mellan2?.driftfonster === true && mellan2?.driftAndel === 1, `andel1=${mellan1?.driftAndel} andel2=${mellan2?.driftAndel}`);
  rapport("B5b", "återmätningen väcktes (loggad) men kasserade sig själv", /driftfonster-atermat/.test(r.stderr || ""), "");
  const r2 = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd: fs.mkdtempSync(path.join(arbete, "b5-")), extra: ["--validera-fran", path.join(cwd, "data", "vakten", f.insamling[0])] });
  rapport("B6", "återupptagning till mätvärde VÄGRAS (kod 1)", r2.kod === 1, `kod=${r2.kod}`);
  rapport("B7", "vägransförklaringen syns", /driftfönster/.test(r2.stderr || r2.stdout) && /--tvinga/.test(r2.stderr || r2.stdout), "");
  await stang(server);
}

// --- C: friskt läge — mätvärde levererat med DOD-mål + källa -----------------
// Externa "mål" = 127.0.0.1-fejkdomäner: hela kedjan (extraktion → validering
// → klassificering) körs offline mot fixture-servern.
{
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/", "/a"]) };
    if (p === "/" ) return { status: 200, kropp: textSida(`<a href="http://127.0.0.1:${port}/ok">extern ok</a><a href="/a">a</a>`) };
    if (p === "/kurser") return { status: 200, kropp: textSida("") };
    if (p === "/a") return { status: 200, kropp: textSida(`<a href="http://127.0.0.1:${port}/dod">extern dod</a>`) };
    if (p === "/ok") return { status: 200, kropp: textSida("") };
    return undefined; // /dod → 404 = bevisat dött externt mål
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "c-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd });
  const f = vaktenFiler(cwd);
  rapport("C1", "kod 0 (mätvärde levererat)", r.kod === 0, `kod=${r.kod}`);
  rapport("C2", "exakt en fyndfil + ett mellanlager", f.fynd.length === 1 && f.insamling.length === 1, JSON.stringify(f));
  const j = lasJson(cwd, f.fynd[0]);
  rapport("C3", "4 sidor crawlide (/, /a + absoluta egna URL:er /ok,/dod)", j?.crawlideSidor === 4, `=${j?.crawlideSidor}`);
  rapport("C4", "2 unika externa mål validerade (OK + DOD)", j?.unikaExternaMal === 2 && j?.perKlass?.DOD === 1 && j?.perKlass?.OK === 1, JSON.stringify(j?.perKlass));
  rapport("C5", "DOD-målet pekas ut med källsidan (rotorsak)", j?.fynd?.doda?.[0]?.mal === `http://127.0.0.1:${port}/dod` && j?.fynd?.doda?.[0]?.kallor?.includes("/a"), JSON.stringify(j?.fynd?.doda?.[0]?.kallor));
  rapport("C6", "rapporten bär mätvärdes-märkena", j?.tvingad === false && j?.matfonster === "grönt" && j?.driftAndel === 0, `tvingad=${j?.tvingad} fonster=${j?.matfonster} drift=${j?.driftAndel}`);

  // --- D: filskydd — andra mätningen samma dag skriver ALDRIG över ----------
  const forstaFynd = f.fynd[0];
  const forstaMellan = f.insamling[0];
  const fyndInne = fs.readFileSync(path.join(cwd, "data", "vakten", forstaFynd), "utf8");
  const mellanInne = fs.readFileSync(path.join(cwd, "data", "vakten", forstaMellan), "utf8");
  const r2 = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd });
  const f2 = vaktenFiler(cwd);
  rapport("D1", "andra mätningen levererar också kod 0", r2.kod === 0, `kod=${r2.kod}`);
  rapport("D2", "fyra filer totalt (klockslagssuffix på båda typerna)", f2.fynd.length === 2 && f2.insamling.length === 2, JSON.stringify(f2));
  rapport(
    "D3",
    "första fyndfilen + mellanlagret byte-identiska",
    fs.readFileSync(path.join(cwd, "data", "vakten", forstaFynd), "utf8") === fyndInne &&
      fs.readFileSync(path.join(cwd, "data", "vakten", forstaMellan), "utf8") === mellanInne,
    "",
  );
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
  const f = vaktenFiler(cwd);
  rapport("E3", "ingen fil alls skriven", f.fynd.length === 0 && f.insamling.length === 0, JSON.stringify(f));
  await stang(server);
}

// --- F: deploylåset ÄGS — fuser-grinden stoppar (existens räcker ej) --------
{
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/"]) };
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "f-"));
  const lasFil = path.join(arbete, "test-deploy-las-externa.lock");
  fs.writeFileSync(lasFil, ""); // flock lämnar filen kvar — existens är INTE indikator
  const fd = fs.openSync(lasFil, "r+"); // VÅR process äger den = "deploy pågår"
  const r1 = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { las: lasFil } });
  rapport("F1", "avbrott med kod 1 när låset ägs", r1.kod === 1, `kod=${r1.kod}`);
  rapport("F2", "deploygrindens förklaring syns", /deployfönster aktivt/.test(r1.stderr || r1.stdout), "");
  const f = vaktenFiler(cwd);
  rapport("F3", "ingen fil alls skriven", f.fynd.length === 0 && f.insamling.length === 0, JSON.stringify(f));
  fs.closeSync(fd); // låset släppt — samma fil, ny ägarelöshet: mätning ska NU gå
  const r2 = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { las: lasFil } });
  rapport("F4", "samma fil utan ägare = mätvärdet går (existens-alarm)", r2.kod === 0, `kod=${r2.kod}`);
  await stang(server);
}

// --- G: HELA mönster — pm2:s "next start" får ALDRIG bli falsklarm ----------
// (sekvensen "next build" förekommer ENDAST under ett pågående bygg. Ett ÄKT
// deployfönster under testfönstret → SKIP, aldrig falskt rött.)
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
    rapport("G2", "mätvärdet levererat", vaktenFiler(cwd).fynd.length === 1, "");
  }
  await stang(server);
}

// --- H: --tvinga — diagnostikläget märker ALL utdata, aldrig mätvärde -------
{
  const locs = Array.from({ length: 20 }, (_, i) => `/sida-${i}`);
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(locs) };
    if (p === "/" || p === "/kurser") return { status: 200, kropp: textSida("") };
    return { status: 500, kropp: "" }; // samma driftserver som B — men nu med --tvinga
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "h-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, extra: ["--tvinga"] });
  const f = vaktenFiler(cwd);
  rapport("H1", "diagnostikkörning levererar (kod 0)", r.kod === 0, `kod=${r.kod}`);
  rapport("H2", "båda filerna märkta diagnostik", f.fynd.length === 1 && f.insamling.length === 1 && f.fynd[0].includes("diagnostik") && f.insamling[0].includes("diagnostik"), JSON.stringify(f));
  const j = lasJson(cwd, f.fynd[0]);
  rapport("H3", "rapporten märks tvingad + diagnostik", j?.tvingad === true && j?.matfonster === "diagnostik", `tvingad=${j?.tvingad} fonster=${j?.matfonster}`);
  rapport("H4", "drift-talet bevaras som diagnostikunderlag", j?.driftAndel === 1, `andel=${j?.driftAndel}`);
  rapport("H5", "stdout märks [DIAGNOSTIK — ej mätvärde]", /DIAGNOSTIK/.test(r.stdout || ""), "");
  await stang(server);
}

// --- J: driftfönster som STÄNGER — fönstervakten + EN återmätning räddar
//        mätomgången (o113: första organiska cron-körningens klass —
//        grunden var grön vid start, fönstret öppnade under crawlen) ------
// Fixture: crawl #1 drabbad (500 på allt utom bas), läget flippas grönt när
// mellanlager #1 landat på disk (verktyget står då i fönstervakten) —
// saboterad miljö: inget lås, ingen byggprocess, bas frisk ⇒ vakten pollar
// fritt på första kontrollen och ommätningen blir mätvärde.
{
  const locs = Array.from({ length: 20 }, (_, i) => `/sida-${i}`);
  let lagetGront = false;
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(locs) };
    if (p === "/" || p === "/kurser" || p === "/ok") return { status: 200, kropp: textSida("") };
    if (!lagetGront) return { status: 500, kropp: "" };
    if (p === "/sida-0") return { status: 200, kropp: textSida(`<a href="http://127.0.0.1:${port}/ok">extern ok</a>`) };
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "j-"));
  const rPromise = korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { retryVanta: "30000", retryPoll: "200" } });
  const frist = Date.now() + 30_000;
  while (Date.now() < frist && vaktenFiler(cwd).insamling.length < 1) {
    await new Promise((losa) => setTimeout(losa, 100));
  }
  lagetGront = true; // driftfönstret stänger exakt när insamling #1 är bokförd
  const r = await rPromise;
  rapport("J1", "återmätningen räddade mätomgången (kod 0)", r.kod === 0, `kod=${r.kod}`);
  rapport("J2", "återmätningen loggades", /driftfonster-atermat/.test(r.stderr || ""), "");
  const f = vaktenFiler(cwd);
  rapport("J3", "två mellanlager (drift + grön) och EN fyndfil", f.insamling.length === 2 && f.fynd.length === 1, JSON.stringify(f));
  const mellan = f.insamling.map((n) => lasJson(cwd, n));
  const driftMellan = mellan.find((m) => m?.driftfonster === true);
  const gronMellan = mellan.find((m) => m?.driftfonster === false);
  rapport("J4", "ett mellanlager märkt drift + ett grönt (oavsett filordning)", !!driftMellan && !!gronMellan, `${driftMellan?.driftfonster ?? "?"}/${gronMellan?.driftfonster ?? "?"}`);
  const j = lasJson(cwd, f.fynd[0]);
  rapport("J5", "fyndfilen bär mätvärdet: atermatAntal=1, driftAndel=0, 21 sidor (20 + absolut egen-URL /ok, C3-precedensen)", j?.atermatAntal === 1 && j?.driftAndel === 0 && j?.crawlideSidor === 21, `atermat=${j?.atermatAntal} drift=${j?.driftAndel} sidor=${j?.crawlideSidor}`);
  rapport("J6", "stdout redovisar återmätningen", /efter 1 återmätning ur driftfönster/.test(r.stdout || ""), "");
  await stang(server);
}

// --- K: fönstret stänger ALDRIG — väntetaket stoppar, ENDA insamlingen
//        bevaras, exit 2 (aldrig ändlös crawl). Fönstret hålls stängt via
//        basens svar: grindens två hälsosonder är gröna, därefter svarar
//        basen 500 = vakten pollar "inte fritt" tills taket slår till ------
{
  const locs = Array.from({ length: 20 }, (_, i) => `/sida-${i}`);
  let basBesok = 0;
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(locs) };
    if (p === "/" || p === "/kurser") {
      basBesok++;
      return { status: basBesok > 2 ? 500 : 200, kropp: "" };
    }
    return { status: 500, kropp: "" };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "k-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { retryVanta: "1500", retryPoll: "300" } });
  rapport("K1", "avbrott med kod 2 (väntetak, fortfarande drift)", r.kod === 2, `kod=${r.kod}`);
  rapport("K2", "driftfönster-förklaringen syns", /DRIFTFÖNSTER/.test(r.stderr || r.stdout), "");
  rapport("K3", "väntetaket loggades", /driftfonster-vantak/.test(r.stderr || ""), "");
  const f = vaktenFiler(cwd);
  rapport("K4", "EN insamling (ommätning skedde aldrig), ingen fyndfil", f.insamling.length === 1 && f.fynd.length === 0, JSON.stringify(f));
  await stang(server);
}

console.log(`\nSVIT: ${pass} PASS, ${fail} FAIL, ${skip} SKIP`);
fs.rmSync(arbete, { recursive: true, force: true });
process.exit(fail === 0 ? 0 : 1);
