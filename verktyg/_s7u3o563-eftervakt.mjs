#!/usr/bin/env node
/**
 * O563-EFTERVAKTEN (s7-u3, 2026-09-29) — autonom mätorganism i o165/o556:s fotspår.
 *
 * Uppdrag (manifest auto-s7-1790673915240, byggare 3/3): o160 §7:s struktur-
 * EFTER-kvittering av den VÄNTANDE deployen df331ae2 (171 commits, 47 src-
 * filer, AI-MENTORN-widget-wiring i src/lib — aldrig mätta i prod) SAMT
 * o556 §6.1-omstand (u1:s vakt dog 01:07Z utan tyst fönster; samma fem
 * sidor). 22df62aa-isolerad mätning är oåterkalleligt förlorad (kanalen bär
 * df331ae2 efter deploy) — df331ae2-mätningen är supermängden och stänger
 * posten; bokförs ärligt i protokollet.
 *
 * Faser:
 *   0. vänta DEPLOYAD i prod-synk.loggen med df331ae2 som git-anfader
 *      (merge-base --is-ancestor; likhet gäller också) — poll 60 s
 *   1. vänta METROLOGISKT TYST fönster ×2 poller à 60 s:
 *      load1 < 3,0 · chrome-linux64 < 20 (vaktsvep kör 40+) · RAM ≥ 1 500 MB
 *      · prod 200 (spårregeln o556: ALDRIG Lighthouse under pågående svep)
 *   2. värma de fem sidorna ×2
 *   3. kanoniska verktyg/prestanda-lighthouse.mjs i ETT anrop ×5 sidor
 *      (CHROME_PATH = puppeteer-cachens Chrome-for-Testing 154 — nya
 *      SSD Nodes-servern saknar system-Chrome, o556/o558:s rotkur)
 *   4. färskhetskontroll av rapporterna (20 min)
 *   5. dom enligt o160-strukturmetoden:
 *      · STRUKTUR (lastokänsligt, dom-bar): requests + totalByteWeight mot
 *        o160-efter-tabellen (a2c9d663) — Δbyte ≤ +3 % och Δreq ≤ +3 ⇒ GRÖN
 *      · CLS 0 ×5 = heligt (o100) — brott ⇒ RÖD
 *      · LCP ±15 % mot referens ⇒ GRÖN; utanför ⇒ GUL med laststämpel-not
 *      · TBT bokförs som dagtidsFAKTA — slutdom ägs av nattcronen 03:27
 *        (o158 §6); Contabo↔SSD-TBT ej jämförbara (o558:s metrologiregel)
 *
 * Start: setsid nohup node verktyg/_s7u3o563-eftervakt.mjs &
 * Test:  O563_TAK_TIMMAR=0.003 node verktyg/_s7u3o563-eftervakt.mjs
 * Utdata: data/vakten/o563-eftervakt/{status.json,drift.log} (gitignorerat)
 *         data/forskning/OPTIMERING/lighthouse/{sida}-o563-efter.json +
 *         o563-efter-sammanfattning.json + o563-eftervakt-dom.json (commit)
 * Exits:  0 klart (dom skriven) · 2 tidsgräns utan deploy/fönster (omstart ok)
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROT = process.cwd();
const SIDOR = ["/", "/superanalys", "/kalkylator", "/konfluens", "/kurser"];
const NAMN = "o563-efter";
const DF331 = "df331ae2";
const SYNKLOGG = join(ROT, "data", "vakten", "prod-synk.log");
const LH_KAT = join(ROT, "data", "forskning", "OPTIMERING", "lighthouse");
const RUNTIME = join(ROT, "data", "vakten", "o563-eftervakt");
const DOMFIL = join(LH_KAT, "o563-eftervakt-dom.json");
const CHROME = "/home/ak1a/.cache/puppeteer/chrome/linux-154.0.8037.57/chrome-linux64/chrome";
const TAK_MS = Math.max(1, parseFloat(process.env.O563_TAK_TIMMAR || "6") * 3600_000);
const START = Date.now();

// Referenser: / = o110-efterB (2026-09-20); de fyra = o160-efter (2026-09-24,
// a2c9d663). Strukturvärden (req/bytes) = o160 §3-tabellen; / är jungfrulig i
// strukturdomen (null ⇒ bokförs som första strukturvärde, ej jämförd).
const REF = {
  "/": { poang: 60, LCP: 5025, TBT: 932, req: null, bytes: null, kalla: "o110-efterB 2026-09-20" },
  "/superanalys": { poang: 68, LCP: 2261, TBT: 2914, req: 30, bytes: 495087, kalla: "o160-efter 2026-09-24" },
  "/kalkylator": { poang: 48, LCP: 5037, TBT: 6425, req: 34, bytes: 582161, kalla: "o160-efter 2026-09-24" },
  "/konfluens": { poang: 51, LCP: 5145, TBT: 3540, req: 30, bytes: 497721, kalla: "o160-efter 2026-09-24" },
  "/kurser": { poang: 53, LCP: 4585, TBT: 3095, req: 30, bytes: 534342, kalla: "o160-efter 2026-09-24" },
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
function osLoad1() {
  return parseFloat(readFileSync("/proc/loadavg", "utf8").split(" ")[0]);
}
function ramMb() {
  const m = readFileSync("/proc/meminfo", "utf8").match(/^MemAvailable:\s+(\d+)\s+kB/m);
  return m ? Math.round(parseInt(m[1], 10) / 1024) : 0;
}

/** Senaste DEPLOYAD-hash ur prod-synk.loggen, eller null. */
function senasteDeployad() {
  try {
    const rader = readFileSync(SYNKLOGG, "utf8").split("\n");
    for (let i = rader.length - 1; i >= 0; i--) {
      const m = rader[i].match(/DEPLOYAD automatiskt: \d+ commits \(([0-9a-f]+)\)/);
      if (m) return m[1];
    }
  } catch {}
  return null;
}
/** Sant om deployad hash bär df331ae2-trädet (anfader eller lika). */
function barDeploy(hash) {
  if (!hash) return false;
  if (hash === DF331 || hash.startsWith(DF331)) return true;
  try {
    execFileSync("git", ["-C", ROT, "merge-base", "--is-ancestor", DF331, hash], { timeout: 15_000 });
    return true; // exit 0
  } catch { return false; } // exit 1 = ej anfader (eller git-fel — begär aldrig falskt positivt)
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
        req: a["network-requests"]?.details?.items?.length ?? null,
        bytes: a["total-byte-weight"]?.numericValue ?? null,
        mtimeMs: statSync(fil).mtimeMs,
      };
    } catch {
      ut[s] = null;
    }
  }
  return ut;
}

async function huvud() {
  logga("o563-eftervakt start (tak " + Math.round(TAK_MS / 60000) + " min)");
  if (existsSync(DOMFIL)) {
    logga("dom finns redan — idempotent avslut");
    process.exit(0);
  }
  // Fas 0: vänta deploy som bär df331ae2-trädet
  let deployad = null;
  while (Date.now() - START < TAK_MS) {
    deployad = senasteDeployad();
    if (barDeploy(deployad)) { logga("deployad " + deployad + " bär " + DF331 + " — fortsätter till fönstret"); break; }
    status({ fas: "vantar-deploy", senasteDeployad: deployad });
    await vila(60_000);
  }
  if (!barDeploy(deployad)) {
    status({ fas: "tidsgrans-utan-deploy", senasteDeployad: deployad });
    logga("tidsgräns utan bärande deploy — vakten kan startas om");
    process.exit(2);
  }
  for (let omgang = 1; omgang <= 3; omgang++) {
    // Fas 1: vänta tyst fönster
    let stabil = 0;
    while (Date.now() - START < TAK_MS) {
      const last = osLoad1();
      const chrome = chromeAntal();
      const ram = ramMb();
      const ok = last < 3.0 && chrome < 20 && ram >= 1500 && prod200();
      stabil = ok ? stabil + 1 : 0;
      status({ fas: "vantar-fonster", omgang, last, chrome, ram, stabil });
      if (stabil >= 2) { logga(`tyst fönster (last ${last.toFixed(2)}, chrome ${chrome}, ram ${ram} MB)`); break; }
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
        poang: r.poang, LCP: r.LCP, TBT: r.TBT, CLS: r.CLS, req: r.req, bytes: r.bytes,
        refPoang: ref.poang, refLCP: ref.LCP, refTBT: ref.TBT, refReq: ref.req, refBytes: ref.bytes, refKalla: ref.kalla,
        lcpAvvikelseProc: Math.round(((r.LCP - ref.LCP) / ref.LCP) * 1000) / 10,
        byteAvvikelseProc: ref.bytes ? Math.round(((r.bytes - ref.bytes) / ref.bytes) * 1000) / 10 : null,
        dReq: ref.req != null && r.req != null ? r.req - ref.req : null,
      };
    });
    const clsNoll = perSida.every((p) => p.CLS === 0);
    const lcpInom = perSida.every((p) => Math.abs(p.lcpAvvikelseProc) <= 15);
    // Strukturgren: lastokänsligt, dom-bar alltid (o160 §2). / har null-ref ⇒
    // jämförs ej, bokförs som jungfruligt strukturvärde.
    const jamforbara = perSida.filter((p) => p.byteAvvikelseProc != null && p.dReq != null);
    const strukturOk = jamforbara.length > 0 &&
      jamforbara.every((p) => p.byteAvvikelseProc <= 3 && p.dReq <= 3);
    const dom = !clsNoll ? "RÖD" : lcpInom && strukturOk ? "GRÖN" : "GUL";
    writeFileSync(DOMFIL, JSON.stringify({
      ts: new Date().toISOString(),
      protokoll: "o563",
      fas: "klar",
      deployad,
      uppdrag: "o160 §7 struktur-EFTER-kvittering av deploy " + deployad + " (df331ae2-trädet, 171 commits över 22df62aa) + o556 §6.1-omstand — mät före/efter, deploy, prod 200, mätning bokförd",
      referensNot: "/ = o110-efterB (9 dagar gammal); övriga = o160-efter a2c9d663 (5 dagar). 22df62aa-isolerad mätning förlorad (o556-vakten dog; se o563-protokollet §1). TBT = dagtidsfakta; slutdom ägs av nattcronen 03:27 (o158 §6).",
      clsNoll, lcpInom, strukturOk, dom,
      perSida,
    }, null, 2) + "\n");
    status({ fas: "klar", dom });
    logga("DOM " + dom + " skriven → " + DOMFIL);
    process.exit(0);
  }
  status({ fas: "treforsok-utoe", dom: "INGEN" });
  logga("3 omgångar utan komplett mätning — starta om vakten eller mät manuellt");
  process.exit(2);
}
huvud().catch((e) => { logga("FATAL " + String(e).slice(0, 300)); status({ fas: "fatal", fel: String(e).slice(0, 300) }); process.exit(1); });
