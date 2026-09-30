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
//   F deploylås ägs       → avbrott vid lås-ägandegrinden (/proc-fd, ÄGANDE, ej existens)
//   G hela mönster        → "next build"-sekvensen ger inget falsklarm
//   H --tvinga            → diagnostikläget levererar märkt data, aldrig mätvärde
//   J driftfönster slut   → fönstervakt + EN återmätning räddar mätomgången
//                           (kod 0, andra mellanlagret grönt, atermatAntal=1)
//   K fönstret stänger ej → väntetak → exit 2, ENDA insamlingen bevaras,
//                           aldrig ändlös omkring-crawl
//   L kanin-429 ⇒ klipp    → första målets 429 (HEAD+GET) klipper domänen:
//                           övriga mål BLOCKERAD-rate med NOLL förfrågningar,
//                           vilofil skriven (o570)
//   M viloperiod           → förseedad vilofil ⇒ NOLL förfrågningar, typ vila
//   N domäntakt            → minst AK1A_DOMAN_TAKT_MS mellan samma domäns
//                           förfrågningar
//   R retry-after-läkning  → kanin 429 + retry-after: 0 ⇒ GET-omprovning läker
//                           ⇒ ingen klipp, hela domänen OK
//   S UA-vägg läks (o571)  → 503 för vakt-UA men 200 för läsare ⇒ OK, aldrig
//                           DOD (amazon.com-fallet 2026-09-30)
//   T bot-motstånd klipper → 405 för ALLA identiteter ⇒ kanin-klipp, övriga
//                           mål BLOCKERAD-vagg utan förfrågningar, vila

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

// Fejk-server med router: (reqPath) → { status, kropp, headers? } | undefined (404)
function startaServer(router) {
  return new Promise((losa) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, "http://x");
      const svar = router ? router(u.pathname, req) : undefined;
      res.writeHead(svar?.status || 404, { "content-type": "text/html", ...(svar?.headers || {}) });
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
          ...(miljo.takt ? { AK1A_DOMAN_TAKT_MS: miljo.takt } : {}),
          ...(miljo.retry429 ? { AK1A_429_RETRY_MS: miljo.retry429 } : {}),
          ...(miljo.vilaFil ? { AK1A_VILA_FIL: miljo.vilaFil } : {}),
          ...(miljo.vilaMs ? { AK1A_DOMAN_VILA_MS: miljo.vilaMs } : {}),
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

// --- F: deploylåset ÄGS — lås-ägandegrinden stoppar (existens räcker ej) -----
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
// V222-timingkuri (rond 114): originalflippen (fil-poll à 100 ms) kapplöpte
// alltid verktyget — fönstervakten ser gröna prober och startar återmätningen
// ~20–50 ms efter mellanlagret skrevs, FÖRE fixturens nästa poll ⇒ crawl #2
// såg 500 igen (deterministiskt RÖT från födelsen, aldrig flagning). Ny
// signal: flip vid crawl #2:s EGEN sitemap-förfrågan — den kommer före dess
// sidförfrågningar men efter crawl #1 (deterministiskt mellan lagren).
{
  const locs = Array.from({ length: 20 }, (_, i) => `/sida-${i}`);
  let lagetGront = false;
  let sitemapHits = 0;
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") {
      sitemapHits += 1;
      if (sitemapHits >= 2) lagetGront = true; // crawl #2 börjar — dess sidor ska vara gröna
      return { status: 200, kropp: sitemap(locs) };
    }
    if (p === "/" || p === "/kurser" || p === "/ok") return { status: 200, kropp: textSida("") };
    if (!lagetGront) return { status: 500, kropp: "" };
    if (p === "/sida-0") return { status: 200, kropp: textSida(`<a href="http://127.0.0.1:${port}/ok">extern ok</a>`) };
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "j-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { retryVanta: "30000", retryPoll: "200" } });
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

// --- L: KANIN-429 ⇒ DOMÄNKLIPP (o570 lager 2) — kaninmålet (första målet i
//        domänen) svarar 429 två gånger (HEAD + GET-omprovning) ⇒ övriga mål
//        klassas BLOCKERAD-rate UTAN en enda förfrågan, domänen skrivs in i
//        vilofilen. Levande motstycke: Adlibris/Bokus 102-målsdomäner.
//        Isolering: målen på EN EGEN PORT (annat ursprung) — crawlen följer
//        aldrig dit, räknarna ser enbart valideringssonder. -----------------
{
  const traff = {}; // sökväg → antal valideringsträffar
  const malServer = await startaServer((p) => {
    if (p.startsWith("/l-")) {
      traff[p] = (traff[p] || 0) + 1;
      return p === "/l-rate" ? { status: 429, kropp: "" } : { status: 200, kropp: "" };
    }
    return { status: 404, kropp: "" };
  });
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/l"]) };
    if (p === "/l") {
      // DOM-ordning styr kaninen: rate-målet först
      return {
        status: 200,
        kropp: textSida(
          `<a href="http://127.0.0.1:${malServer.port}/l-rate">r</a><a href="http://127.0.0.1:${malServer.port}/l-ok1">o1</a><a href="http://127.0.0.1:${malServer.port}/l-ok2">o2</a>`,
        ),
      };
    }
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "l-"));
  const vilaFil = path.join(cwd, "vila-test.json");
  const r = await korVerktyg({
    bas: `http://127.0.0.1:${port}`,
    cwd,
    miljo: { retry429: "300", vilaFil, vilaMs: "604800000" },
  });
  rapport("L1", "mätvärde levererat (kod 0) trots klippt domän", r.kod === 0, `kod=${r.kod}`);
  const f = vaktenFiler(cwd);
  const j = lasJson(cwd, f.fynd[0]);
  rapport("L2", "alla 3 mål BLOCKERADE, inget OK (kanin 429 + 2 klippta)", j?.perKlass?.BLOCKERAD === 3 && (j?.perKlass?.OK || 0) === 0, JSON.stringify(j?.perKlass));
  const blockerade = j?.fynd?.blockerade || [];
  rapport(
    "L3",
    "klippta mål bärs rate-typ + förklaring, utan förfrågningar",
    blockerade.filter((b) => b.blockeradTyp === "rate").length === 3 && blockerade.some((b) => /domänklippt/.test(b.fel || "")),
    JSON.stringify((j?.fynd?.blockerade || []).map((b) => b.blockeradTyp)),
  );
  rapport("L4", "kaninen fick EXAKT 2 förfrågningar (HEAD + GET-omprovning)", traff["/l-rate"] === 2, JSON.stringify(traff));
  rapport("L5", "klippta mål fick NOLL förfrågningar", (traff["/l-ok1"] || 0) === 0 && (traff["/l-ok2"] || 0) === 0, JSON.stringify(traff));
  const vila = JSON.parse(fs.readFileSync(vilaFil, "utf8"));
  rapport("L6", "domänen skrevs in i vilofilen (7-dagars-vila)", vila["127.0.0.1"]?.tills > Date.now(), JSON.stringify(vila["127.0.0.1"] || null));
  rapport("L7", "stdout redovisar rate-typ + domäner i vila", /rate 3/.test(r.stdout || "") && /domäner i vila: 127\.0\.0\.1/.test(r.stdout || ""), "");
  await stang(malServer.server);
  await stang(server);
}

// --- M: VILOPERIOD RESPEKTERAS (o570 lager 3) — förseedad vilofil ⇒ noll
//        förfrågningar mot vilande domän, BLOCKERAD-vila, kod 0 --------------
{
  const traff = {};
  const malServer = await startaServer((p) => {
    if (p.startsWith("/m-")) {
      traff[p] = (traff[p] || 0) + 1;
      return { status: 200, kropp: "" };
    }
    return { status: 404, kropp: "" };
  });
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/m"]) };
    if (p === "/m") return { status: 200, kropp: textSida(`<a href="http://127.0.0.1:${malServer.port}/m-ok">ok</a>`) };
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "m-"));
  const vilaFil = path.join(cwd, "vila-test.json");
  fs.writeFileSync(vilaFil, JSON.stringify({ "127.0.0.1": { tills: Date.now() + 3_600_000, orsak: "kanin 429 ×2 (HEAD+GET)", sedan: "2026-09-29T00:00:00.000Z" } }));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { vilaFil } });
  rapport("M1", "mätvärde levererat (kod 0) med vilande domän", r.kod === 0, `kod=${r.kod}`);
  const f = vaktenFiler(cwd);
  const j = lasJson(cwd, f.fynd[0]);
  rapport("M2", "målet klassas BLOCKERAD med typ vila", j?.perKlass?.BLOCKERAD === 1 && j?.fynd?.blockerade?.[0]?.blockeradTyp === "vila", JSON.stringify(j?.perKlass));
  rapport("M3", "vilande mål fick NOLL förfrågningar", (traff["/m-ok"] || 0) === 0, JSON.stringify(traff));
  rapport("M4", "rapporten förklarar vila-till-tid i fel-fältet", /429-vila till/.test(j?.fynd?.blockerade?.[0]?.fel || ""), j?.fynd?.blockerade?.[0]?.fel || "");
  await stang(malServer.server);
  await stang(server);
}

// --- N: DOMÄNTAKT (o570 lager 1) — minst AK1A_DOMAN_TAKT_MS mellan förfråg-
//        gningar till samma domän (skydd för domäner som tåler oss idag) ----
{
  const traffTider = {}; // sökväg → ankomsttid (ms)
  const malServer = await startaServer((p) => {
    if (p.startsWith("/n-")) {
      traffTider[p] = Date.now();
      return { status: 200, kropp: "" };
    }
    return { status: 404, kropp: "" };
  });
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/n"]) };
    if (p === "/n") {
      return {
        status: 200,
        kropp: textSida(
          `<a href="http://127.0.0.1:${malServer.port}/n-a">a</a><a href="http://127.0.0.1:${malServer.port}/n-b">b</a><a href="http://127.0.0.1:${malServer.port}/n-c">c</a>`,
        ),
      };
    }
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "n-"));
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { takt: "350" } });
  rapport("N1", "mätvärde levererat (kod 0)", r.kod === 0, `kod=${r.kod}`);
  const f = vaktenFiler(cwd);
  const j = lasJson(cwd, f.fynd[0]);
  rapport("N2", "alla 3 mål OK (ingen klipp/vila i frisk domän)", j?.perKlass?.OK === 3, JSON.stringify(j?.perKlass));
  const a = traffTider["/n-a"], b = traffTider["/n-b"], c = traffTider["/n-c"];
  const gap1 = b - a, gap2 = c - b;
  rapport("N3", "mellanrum ≥ ~takten mellan förfrågningar (350 ms)", gap1 >= 330 && gap2 >= 330, `gap1=${gap1}ms gap2=${gap2}ms`);
  await stang(malServer.server);
  await stang(server);
}

// --- R: RETRY-AFTER-LÄKNING (o570 kaninens förlåtande) — kanin 429 med
//        retry-after: 0 ⇒ omprovning med GET ⇒ 200 ⇒ domänen FORTSÄTTER
//        normalt: ingen klipp, ingen vila, alla mål validerade --------------
{
  const traff = {};
  const malServer = await startaServer((p) => {
    if (p === "/r-a") {
      traff[p] = (traff[p] || 0) + 1;
      // träff 1 (HEAD): 429 med retry-after: 0 — träff 2 (GET-omprovning): läkt
      return traff[p] === 1 ? { status: 429, kropp: "", headers: { "retry-after": "0" } } : { status: 200, kropp: "" };
    }
    if (p === "/r-b") {
      traff[p] = (traff[p] || 0) + 1;
      return { status: 200, kropp: "" };
    }
    return { status: 404, kropp: "" };
  });
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/r"]) };
    if (p === "/r") {
      return {
        status: 200,
        kropp: textSida(`<a href="http://127.0.0.1:${malServer.port}/r-a">a</a><a href="http://127.0.0.1:${malServer.port}/r-b">b</a>`),
      };
    }
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "r-"));
  const vilaFil = path.join(cwd, "vila-test.json");
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { takt: "10", retry429: "5000", vilaFil } });
  rapport("R1", "mätvärde levererat (kod 0)", r.kod === 0, `kod=${r.kod}`);
  const f = vaktenFiler(cwd);
  const j = lasJson(cwd, f.fynd[0]);
  rapport("R2", "läkt kanin ⇒ hela domänen OK (ingen klipp)", j?.perKlass?.OK === 2 && j?.perKlass?.BLOCKERAD === undefined, JSON.stringify(j?.perKlass));
  rapport("R3", "kanin-omprovningen loggades", /kanin-429/.test(r.stderr || ""), "");
  rapport("R4", "retry-after: 0 ⇒ ingen klipplogg, ingen vilofil", !/doman-klipp/.test(r.stderr || "") && !fs.existsSync(vilaFil), "");
  rapport("R5", "kaninen 2 förfrågningar (HEAD+GET), syskonet 1", traff["/r-a"] === 2 && traff["/r-b"] === 1, JSON.stringify(traff));
  await stang(malServer.server);
  await stang(server);
}

// --- S: UA-VÄGG LÄKS AV LÄSAR-GET (o571) — värd nekar robot-identiteten
//        (503) men tjänar besökar-UA (200): mål som skulle dömts DOD/
//        SERVERFEL klassas OK — besökarens sanning. Levande motstycke:
//        amazon.com 2026-09-30 (vakt-HEAD 503, vakt-GET 503, läsar-GET 200).
//        Ingen klipp, ingen vila — domänen är frisk, bara vår UA nekas. ----
{
  const traff = {};
  const malServer = await startaServer((p, req) => {
    if (p.startsWith("/s-")) {
      traff[p] = (traff[p] || 0) + 1;
      const arLasare = (req.headers["user-agent"] || "").includes("Mozilla");
      return { status: arLasare ? 200 : 503, kropp: "" };
    }
    return { status: 404, kropp: "" };
  });
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/s"]) };
    if (p === "/s") {
      return {
        status: 200,
        kropp: textSida(`<a href="http://127.0.0.1:${malServer.port}/s-a">a</a><a href="http://127.0.0.1:${malServer.port}/s-b">b</a>`),
      };
    }
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "s-"));
  const vilaFil = path.join(cwd, "vila-test.json");
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { takt: "10", vilaFil } });
  rapport("S1", "mätvärde levererat (kod 0)", r.kod === 0, `kod=${r.kod}`);
  const f = vaktenFiler(cwd);
  const j = lasJson(cwd, f.fynd[0]);
  rapport("S2", "båda målen OK — ingen DOD trots 503 för vakt-UA", j?.perKlass?.OK === 2 && (j?.perKlass?.DOD || 0) === 0 && (j?.perKlass?.SERVERFEL || 0) === 0, JSON.stringify(j?.perKlass));
  rapport("S3", "varje mål exakt 2 förfrågningar (vakt-HEAD + läsar-GET)", traff["/s-a"] === 2 && traff["/s-b"] === 2, JSON.stringify(traff));
  rapport("S4", "läkt UA-vägg ⇒ ingen klipp, ingen vilofil", !/doman-klipp/.test(r.stderr || "") && !fs.existsSync(vilaFil), "");
  await stang(malServer.server);
  await stang(server);
}

// --- T: BOT-MOTSTÅND BESTÅR ÄVEN FÖR LÄSAREN (o571) — kaninmålet svarar
//        405 för ALLA identiteter (HEAD + vakt-GET + läsar-GET) ⇒ domän-
//        klipp: övriga mål BLOCKERAD-vagg med NOLL förfrågningar, 7-dagars-
//        vila. Kaninen klassas aldrig DOD — ett vägran-svar bevisar inte
//        att resursen saknas. ------------------------------------------------
{
  const traff = {};
  const malServer = await startaServer((p) => {
    if (p.startsWith("/t-")) {
      traff[p] = (traff[p] || 0) + 1;
      return { status: 405, kropp: "" };
    }
    return { status: 404, kropp: "" };
  });
  const { server, port } = await startaServer((p) => {
    if (p === "/sitemap.xml") return { status: 200, kropp: sitemap(["/t"]) };
    if (p === "/t") {
      return {
        status: 200,
        kropp: textSida(`<a href="http://127.0.0.1:${malServer.port}/t-a">a</a><a href="http://127.0.0.1:${malServer.port}/t-b">b</a><a href="http://127.0.0.1:${malServer.port}/t-c">c</a>`),
      };
    }
    return { status: 200, kropp: textSida("") };
  });
  const cwd = fs.mkdtempSync(path.join(arbete, "t-"));
  const vilaFil = path.join(cwd, "vila-test.json");
  const r = await korVerktyg({ bas: `http://127.0.0.1:${port}`, cwd, miljo: { takt: "10", vilaFil, vilaMs: "604800000" } });
  rapport("T1", "mätvärde levererat (kod 0) trots klippt domän", r.kod === 0, `kod=${r.kod}`);
  const f = vaktenFiler(cwd);
  const j = lasJson(cwd, f.fynd[0]);
  rapport("T2", "alla 3 mål BLOCKERAD-vagg, INGEN DOD (vägran ≠ död)", j?.perKlass?.BLOCKERAD === 3 && (j?.perKlass?.DOD || 0) === 0, JSON.stringify(j?.perKlass));
  rapport("T3", "klippta mål bärs bot-motstånds-förklaring", (j?.fynd?.blockerade || []).every((b) => /bot-motstånd|domänklippt/.test(b.fel || "")) && (j?.fynd?.blockerade || []).every((b) => b.blockeradTyp === "vagg"), JSON.stringify((j?.fynd?.blockerade || []).map((b) => b.blockeradTyp)));
  rapport("T4", "kaninen exakt 3 förfrågningar (HEAD + vakt-GET + läsar-GET), klippta 0", traff["/t-a"] === 3 && (traff["/t-b"] || 0) === 0 && (traff["/t-c"] || 0) === 0, JSON.stringify(traff));
  const vila = fs.existsSync(vilaFil) ? JSON.parse(fs.readFileSync(vilaFil, "utf8")) : {};
  rapport("T5", "domänen skrevs in i vilofilen med bot-motstånds-orsak", vila["127.0.0.1"]?.tills > Date.now() && /bot-motstånd/.test(vila["127.0.0.1"]?.orsak || ""), JSON.stringify(vila["127.0.0.1"] || null));
  rapport("T6", "stdout redovisar vägg-typ + domän i vila", /vägg 3/.test(r.stdout || "") && /domäner i vila: 127\.0\.0\.1/.test(r.stdout || ""), "");
  await stang(malServer.server);
  await stang(server);
}

console.log(`\nSVIT: ${pass} PASS, ${fail} FAIL, ${skip} SKIP`);
fs.rmSync(arbete, { recursive: true, force: true });
process.exit(fail === 0 ? 0 : 1);
