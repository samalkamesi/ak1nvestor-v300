#!/usr/bin/env node
/**
 * O556-EFTERVAKTEN (s7-u1, 2026-09-28) — autonom mätorganism i o165:s fotspår.
 *
 * Uppgift: vänta ut ett METROLOGISKT TYST fönster (gränsnittsvaktens 18:00-
 * svep + /medlemskap-omstarten ogiltigförklarade dagens två första försök),
 * värma de fem målsidorna och köra kanoniska prestanda-lighthouse.mjs i
 * ETT anrop (≈ en sammanfattning), sen doma enligt o160-strukturmetoden.
 *
 * Fönsterkriterier (2 på varandra följande poller à 60 s):
 *   · os.loadavg()[0] < 3,0
 *   · chrome-linux64-processer < 20 (vaktsvepet kör 40+; desk-browsern ~13)
 *   · GET / mot localhost:3000 = 200
 *
 * Dom: CLS 0 ×5 = heligt (o100) — brott ⇒ RÖD. LCP ±15 % mot referens ⇒
 * GRÖN; utanför ⇒ GUL med laststämpel-not (omdom vid nästa tysta fönster).
 * TBT bokförs som FAKTA — slutdom ägs av nattcronen 03:27 (o158 §6).
 *
 * Start: setsid nohup node verktyg/_s7u1o556-eftervakt.mjs &
 * Test:  O556_TAK_TIMMAR=0.003 node verktyg/_s7u1o556-eftervakt.mjs
 * Utdata: data/vakten/o556-eftervakt/{status.json,drift.log} (gitignorerat)
 *         data/forskning/OPTIMERING/lighthouse/*-o556-efter.json +
 *         o556-efter-sammanfattning.json + o556-eftervakt-dom.json (commit)
 * Exits:  0 klart (dom skriven) · 2 tidsgräns utan tyst fönster (omstart ok)
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROT = process.cwd();
const SIDOR = ["/", "/superanalys", "/kalkylator", "/konfluens", "/kurser"];
const NAMN = "o556-efter";
const LH_KAT = join(ROT, "data/forskning/OPTIMERING/lighthouse");
const RUNTIME = join(ROT, "data/vakten/o556-eftervakt");
const DOMFIL = join(LH_KAT, "o556-eftervakt-dom.json");
const CHROME = "/home/ak1a/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome";
const TAK_MS = Math.max(1, parseFloat(process.env.O556_TAK_TIMMAR || "6") * 3600_000);
const START = Date.now();

// Referenser: /start = o110-efterB (2026-09-20); de fyra = o160-efter (2026-09-24).
const REF = {
  "/": { poang: 60, LCP: 5025, TBT: 932, kalla: "o110-efterB 2026-09-20" },
  "/superanalys": { poang: 68, LCP: 2261, TBT: 2914, kalla: "o160-efter 2026-09-24" },
  "/kalkylator": { poang: 48, LCP: 5037, TBT: 6425, kalla: "o160-efter 2026-09-24" },
  "/konfluens": { poang: 51, LCP: 5145, TBT: 3540, kalla: "o160-efter 2026-09-24" },
  "/kurser": { poang: 53, LCP: 4585, TBT: 3095, kalla: "o160-efter 2026-09-24" },
};

mkdirSync(RUNTIME, { recursive: true });
const LÅS = join(RUNTIME, "vakt.pid");
if (existsSync(LÅS)) {
  const gammal = parseInt(readFileSync(LÅS, "utf8") || "0", 10);
  if (gammal && Date.now() - gammal > 7 * 3600_000) {
    logga("stjäl >7 h gammalt lås " + gammal);
  } else {
    logga("annan instans lever (lås " + gammal + ") — avslutar tyst");
    process.exit(0);
  }
}
writeFileSync(LÅS, String(Date.now()));
process.on("exit", () => { try { unlinkSync(LÅS); } catch {} });

function logga(rad) {
  const s = new Date().toISOString() + " " + rad;
  appendFileSync(join(RUNTIME, "drift.log"), s + "\n");
  process.stdout.write(s + "\n");
}
function status(obj) {
  writeFileSync(join(RUNTIME, "status.json"), JSON.stringify({ ...obj, ts: new Date().toISOString() }, null, 2));
}

function chromeAntal() {
  try {
    const ut = execFileSync("pgrep", ["-c", "-f", "chrome-linux64"], { encoding: "utf8", timeout: 10_000 });
    return parseInt(ut.trim(), 10) || 0;
  } catch { return 0; } // pgrep exit 1 = inga träffar
}
function prod200() {
  try {
    const ut = execFileSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "http://localhost:3000/"], { encoding: "utf8", timeout: 15_000 });
    return ut.trim() === "200";
  } catch { return false; }
}
const vila = (ms) => new Promise((r) => setTimeout(r, ms));

function maet() {
  logga("mätning: ett anrop × " + SIDOR.length + " sidor");
  execFileSync("node", ["verktyg/prestanda-lighthouse.mjs", NAMN, ...SIDOR], {
    cwd: ROT,
    stdio: "inherit",
    timeout: 15 * 60_000,
    env: { ...process.env, CHROME_PATH: CHROME },
  });
}
function lasRapporter() {
  const ut = {};
  for (const s of SIDOR) {
    const slug = s.replace(/^\//, "").replace(/\//g, "_") || "start";
    const fil = join(LH_KAT, `${slug}-${NAMN}.json`);
    try {
      const r = JSON.parse(readFileSync(fil, "utf8"));
      const a = r.audits ?? {};
      ut[s] = {
        poang: Math.round((r.categories?.performance?.score ?? 0) * 100),
        LCP: Math.round(a["largest-contentful-paint"]?.numericValue ?? -1),
        TBT: Math.round(a["total-blocking-time"]?.numericValue ?? -1),
        CLS: a["cumulative-layout-shift"]?.numericValue ?? -1,
        mtimeMs: statSync(fil).mtimeMs,
      };
    } catch {
      ut[s] = null;
    }
  }
  return ut;
}

async function huvud() {
  logga("o556-eftervakt start (tak " + Math.round(TAK_MS / 60000) + " min)");
  if (existsSync(DOMFIL)) {
    logga("dom finns redan — idempotent avslut");
    process.exit(0);
  }
  for (let omgang = 1; omgang <= 3; omgang++) {
    // Fas 1: vänta tyst fönster
    let stabil = 0;
    while (Date.now() - START < TAK_MS) {
      const last = osLoad1();
      const chrome = chromeAntal();
      const ok = last < 3.0 && chrome < 20 && prod200();
      stabil = ok ? stabil + 1 : 0;
      status({ fas: "vantar-fonster", omgang, last, chrome, stabil });
      if (stabil >= 2) { logga(`tyst fönster (last ${last.toFixed(2)}, chrome ${chrome})`); break; }
      await vila(60_000);
    }
    if (stabil < 2) {
      status({ fas: "tidsgrans-utan-fonster", omgang });
      logga("tidsgräns utan tyst fönster — vakten kan startas om");
      process.exit(2);
    }
    // Fas 2: värme
    for (let v = 1; v <= 2; v++) for (const s of SIDOR) {
      try { execFileSync("curl", ["-s", "-o", "/dev/null", "http://localhost:3000" + s], { timeout: 20_000 }); } catch {}
    }
    logga("sidor värmda ×2");
    // Fas 3: mät
    try {
      maet();
    } catch (e) {
      logga("mätfel omgång " + omgang + ": " + String(e).slice(0, 200));
      status({ fas: "matfel", omgang });
      await vila(300_000);
      continue;
    }
    // Fas 4: utvärdera — alla rapporter färska?
    const nu = Date.now();
    const rapp = lasRapporter();
    const saknade = SIDOR.filter((s) => !rapp[s] || rapp[s].mtimeMs < nu - 20 * 60_000);
    if (saknade.length) {
      logga("ofärska rapporter omgång " + omgang + ": " + saknade.join(" "));
      status({ fas: "ofarska", omgang, saknade });
      await vila(300_000);
      continue;
    }
    // Fas 5: dom
    const perSida = SIDOR.map((s) => {
      const r = rapp[s];
      const ref = REF[s];
      return {
        sokvag: s,
        poang: r.poang, LCP: r.LCP, TBT: r.TBT, CLS: r.CLS,
        refPoang: ref.poang, refLCP: ref.LCP, refTBT: ref.TBT, refKalla: ref.kalla,
        lcpAvvikelseProc: Math.round(((r.LCP - ref.LCP) / ref.LCP) * 1000) / 10,
      };
    });
    const clsNoll = perSida.every((p) => p.CLS === 0);
    const lcpInom = perSida.every((p) => Math.abs(p.lcpAvvikelseProc) <= 15);
    const dom = !clsNoll ? "RÖD" : lcpInom ? "GRÖN" : "GUL";
    writeFileSync(DOMFIL, JSON.stringify({
      ts: new Date().toISOString(),
      protokoll: "o556",
      fas: "klar",
      uppdrag: "o160 §7 struktur-EFTER-kvittering av deploy 22df62aa — mät före/efter, deploy, prod 200, mätning bokförd",
      referensNot: "/ = o110-efterB (8 dagar gammal); övriga = o160-efter (4 dagar). TBT = dagtidsfakta; slutdom ägs av nattcronen 03:27 (o158 §6).",
      clsNoll, lcpInom, dom,
      perSida,
    }, null, 2) + "\n");
    status({ fas: "klar", dom });
    logga("DOM " + dom + " skriven → " + DOMFIL);
    process.exit(0);
  }
  status({ fas: "trettioforsok-utoe", dom: "INGEN" });
  logga("3 omgångar utan komplett mätning — starta om vakten eller mät manuellt");
  process.exit(2);
}
function osLoad1() {
  // os.loadavg utan att ladda hela os-modulen i toppskiktet är onödigt krångel —
  // läs /proc/loadavg direkt (Linux, serverns plattform).
  const r = readFileSync("/proc/loadavg", "utf8");
  return parseFloat(r.split(" ")[0]);
}
huvud().catch((e) => { logga("FATAL " + String(e).slice(0, 300)); status({ fas: "fatal", fel: String(e).slice(0, 300) }); process.exit(1); });
