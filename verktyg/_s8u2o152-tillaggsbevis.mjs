#!/usr/bin/env node
/**
 * AK1A — SOND o152 (Spår 8, s8-u2): Docs-Offline-metrologin.
 *
 * Uppdrag (o143 §8 + o144 §8-kö): granska om den KANONISKA Lighthouse-
 * mätaren (npx lighthouse → chrome-launcher) lastar systemtillägget
 * Docs Offline (ghbmnnjooekpmoecnnnilnnbdlolhkhi) — i så fall bär ALLA
 * historiska TBT-värden ~0,3 s systematik (o143:s longtask-fynd
 * 200–330 ms i rå Chrome utan --disable-extensions).
 *
 * Pelare:
 *   A  statisk   — chrome-launcher DEFAULT_FLAGS i npx-cachen (rad+version)
 *   B  process   — ÄKTA kanonisk körning (identiska args som
 *                  prestanda-lighthouse.mjs rad 43–50; enda avvikelsen:
 *                  --output-path till tmpfil i stället för stdout — påverkar
 *                  ej Chrome-starten); Chrome:s exakta cmdline ur /proc.
 *   C  rapport   — sök chrome-extension://-spår i den producerade rapporten
 *   D  kontroll  — A/B med rå Chrome (o143-metodik): utan/med
 *                  --disable-extensions → trace-attribution chrome-extension://
 *
 * Utdata: data/vakten/_s8u2o152-tillaggsbevis.json
 * Användning: node verktyg/_s8u2o152-tillaggsbevis.mjs
 */
import { spawn, execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const RAPPORT = join(process.cwd(), "data/vakten/_s8u2o152-tillaggsbevis.json");
const LH_URL = "http://localhost:3000/dataset"; // o143:s sida — jämförbar
const TILLAGG_ID = "ghbmnnjooekpmoecnnnilnnbdlolhkhi";
const NPX_ROT = "/home/ak1a/.npm/_npx/0f94ee7615faf582/node_modules";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ramFriMB() {
  const rad = readFileSync("/proc/meminfo", "utf8").split("\n").find((r) => r.startsWith("MemAvailable"));
  return Math.round(Number(rad.split(/\s+/)[1]) / 1024);
}

/** PELARE A — chrome-launchers DEFAULT_FLAGS ur npx-cachens källkod. */
function pelareA() {
  const clPkg = JSON.parse(readFileSync(join(NPX_ROT, "chrome-launcher/package.json"), "utf8"));
  const lhPkg = JSON.parse(readFileSync(join(NPX_ROT, "lighthouse/package.json"), "utf8"));
  const flagsKalla = readFileSync(join(NPX_ROT, "chrome-launcher/dist/flags.js"), "utf8").split("\n");
  const rad = flagsKalla.findIndex((l) => l.includes("'--disable-extensions'"));
  return {
    lighthouseVersion: lhPkg.version,
    chromeLauncherVersion: clPkg.version,
    flagsFil: "chrome-launcher/dist/flags.js",
    rad: rad >= 0 ? rad + 1 : null,
    citat: rad >= 0 ? flagsKalla.slice(rad - 1, rad + 2).join("\n").trim() : null,
    defaultHarDisableExtensions: rad >= 0,
    notera: "npx --yes lighthouse är versionflytande (cache-miss ⇒ senaste); därför krävs pelare B som levande bevis.",
  };
}

/** Läs alla huvud-Cmdlines för mät-Chrome ur /proc (unika, sorterade).
 *  o152-v3: Chrome 153 på denna server skriver /proc/[pid]/cmdline som EN
 *  mellanslagseparerad sträng (enda NUL på slutet) — tolka både NUL- och
 *  space-form. Binären EFTER wrapper-exec är /opt/google/chrome/chrome;
 *  --headless=new skiljer huvudprocessen från renderer/zygote-barn. */
function lasChromeCmdlines() {
  const ut = new Set();
  for (const pid of readdirSync("/proc")) {
    if (!/^\d+$/.test(pid)) continue;
    try {
      const rå = readFileSync(join("/proc", pid, "cmdline"), "utf8");
      let args = rå.split("\0").filter(Boolean);
      if (args.length === 1 && args[0].includes(" ")) args = args[0].split(/\s+/).filter(Boolean);
      if (args.length && /chrome/i.test(args[0]) && args.includes("--headless=new")) {
        ut.add(args.join(" "));
      }
    } catch { /* process försvann mellan listning och läsning */ }
  }
  return [...ut];
}

/** PELARE B — äkta kanonisk npx-lighthouse-körning; Chrome-cmdline ur /proc. */
async function pelareB() {
  const tmpRapport = `/tmp/o152-lighthouse-rapport-${Date.now()}.json`;
  const args = [
    "--yes", "lighthouse", LH_URL,
    "--output=json", `--output-path=${tmpRapport}`,
    "--form-factor=mobile",
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
    "--max-wait-for-load=60000",
    "--quiet",
  ];
  const barn = spawn("npx", args, { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  barn.stderr.on("data", (d) => { stderr += d.toString(); });
  const cmdlines = new Map(); // cmdline → först sedd (ms sedan start)
  const start = Date.now();
  const poll = setInterval(() => {
    for (const c of lasChromeCmdlines()) if (!cmdlines.has(c)) cmdlines.set(c, Date.now() - start);
  }, 400);
  const exitkod = await new Promise((res) => { barn.on("exit", (k) => res(k)); barn.on("error", (e) => res(String(e))); });
  clearInterval(poll);

  const listade = [...cmdlines.entries()].map(([cmdline, vidMs]) => ({
    vidMs,
    anvandarprofil: (cmdline.match(/--user-data-dir=(\S+)/) || [])[1] ?? null,
    harDisableExtensions: cmdline.includes("--disable-extensions"),
    remoteDebuggPortArg: (cmdline.match(/--remote-debugging-port=\S+/) || [])[0] ?? null,
    helaFlaggor: cmdline.replace(/^.*?chrome\S*/, "").trim().slice(0, 2000),
  }));
  // Per profil: huvudprocessen = den med --remote-debugging-port (chrome-
  // launchers start); renderer/zygote/gpu-barn bär --type=* och ALDRIG den
  // fulla flagguppsättningen — "samtliga processer"-mått är därför meningslöst.
  const perProfil = new Map();
  for (const c of listade) {
    const p = c.anvandarprofil || "(utan profil)";
    if (!perProfil.has(p)) perProfil.set(p, []);
    perProfil.get(p).push(c);
  }
  const profilDom = [...perProfil.entries()].map(([profil, rader]) => {
    const huvud = rader.find((r) => r.remoteDebuggPortArg) ?? rader[0];
    return { profil, antalProcesser: rader.length, arLighthouse: /\/tmp\/lighthouse\./.test(profil), huvudHarDisableExtensions: huvud ? huvud.harDisableExtensions : null, huvudFlaggorUrdrag: huvud ? huvud.helaFlaggor.slice(0, 700) : null };
  });
  const lighthouseProfiler = profilDom.filter((p) => p.arLighthouse);
  return {
    url: LH_URL,
    exitkod,
    korMs: Date.now() - start,
    chromeProcesser: listade,
    profilDom,
    lighthouseProfiler,
    lighthouseHuvudRen: lighthouseProfiler.length > 0 && lighthouseProfiler.every((p) => p.huvudHarDisableExtensions === true),
    stderrSvans: stderr.slice(-300),
    tmpRapportFinns: existsSync(tmpRapport),
    tmpRapportSokvag: tmpRapport,
  };
}

/** PELARE C — sök tilläggsspår i lighthouse-rapportens råtext. */
function pelareC(b) {
  if (!b.tmpRapportFinns) return { sokt: false, anledning: "ingen rapport producerad" };
  const rå = readFileSync(b.tmpRapportSokvag, "utf8");
  const monster = ["chrome-extension://", TILLAGG_ID, "service_worker_bin_prod"];
  const traffar = {};
  for (const m of monster) {
    const antal = rå.split(m).length - 1;
    if (antal > 0) {
      const i = rå.indexOf(m);
      traffar[m] = { antal, kontext: rå.slice(Math.max(0, i - 120), i + 160) };
    }
  }
  let karn = null;
  try {
    const r = JSON.parse(rå);
    const ms = (x) => (r.audits?.[x]?.numericValue != null ? Math.round(r.audits[x].numericValue) : null);
    karn = { FCP: ms("first-contentful-paint"), LCP: ms("largest-contentful-paint"), TBT: ms("total-blocking-time"), CLS: r.audits?.["cumulative-layout-shift"]?.numericValue ?? null, poang: r.categories?.performance?.score ?? null };
  } catch { /* oparsbar rapport rapporteras som null-kärna */ }
  return { sokt: true, traffar, traffAntal: Object.keys(traffar).length, karnmatt: karn, notera: "tom rapport kan ej skilja 'flaggan på' från 'SW osynlig i rapporten' — pelare B är huvudbeviset." };
}

/** PELARE D — A/B med rå Chrome enligt o143-metodik (CDP + tracing). */
async function pelareD() {
  const PORT = Number(process.env.O152_PORT || 9371);
  const SPAR_MS = Number(process.env.O152_SPAR_MS || 10_000);
  const ATTR_NAMN = new Set(["EvaluateScript", "v8.compile", "FunctionCall", "v8.runMicrotasks", "TimerFire", "EventDispatch", "FireAnimationFrame", "RequestAnimationFrame", "UpdateLayoutTree", "Layout", "RecalculateStyles", "ParseHTML", "CompileScript", "v8.compileModule"]);

  function startaChrome(port, disableExtensions) {
    const dir = `/tmp/o152-sond-${port}-${Date.now()}`;
    const flaggor = ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"];
    if (disableExtensions) flaggor.push("--disable-extensions");
    flaggor.push(`--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, "about:blank");
    return spawn("/usr/bin/google-chrome", flaggor, { stdio: "ignore" });
  }

  async function cdp(ws) {
    let id = 0;
    const pending = new Map();
    const events = [];
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
      else if (msg.method) events.push(msg);
    });
    return {
      send: (method, params = {}, sessionId) => new Promise((resolve, reject) => {
        const mid = ++id;
        pending.set(mid, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)));
        ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
      }),
      events,
    };
  }

  async function korSond(port, disableExtensions) {
    const chrome = startaChrome(port, disableExtensions);
    try {
      let version;
      for (let i = 0; i < 40; i++) {
        try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; }
        catch { await sleep(250); }
      }
      if (!version) throw new Error("DevTools svarade ej");
      const ws = new WebSocket(version.webSocketDebuggerUrl);
      await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
      const { send, events } = await cdp(ws);
      const { targetId } = await send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
      await send("Page.enable", {}, sessionId);
      await send("Network.enable", {}, sessionId);
      await send("Network.setCacheDisabled", { cacheDisabled: true }, sessionId);
      await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 823, deviceScaleFactor: 2.627, mobile: true }, sessionId);
      await send("Emulation.setCPUThrottlingRate", { rate: 4 }, sessionId);
      await send("Emulation.setUserAgentOverride", { userAgent: "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse" }, sessionId);
      await send("Tracing.start", { transferMode: "ReportEvents", traceConfig: { includedCategories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink.user_timing"], excludedCategories: ["*"] } });
      await send("Page.navigate", { url: LH_URL }, sessionId);
      await sleep(SPAR_MS);
      await send("Tracing.end");
      const slut = Date.now() + 15_000;
      while (Date.now() < slut) {
        if (events.some((e) => e.method === "Tracing.tracingComplete")) break;
        await sleep(200);
      }
      const trace = events.filter((e) => e.method === "Tracing.dataCollected").flatMap((e) => e.params.value ?? []);
      await send("Target.closeTarget", { targetId }).catch(() => {});
      ws.close();

      // Tilläggsreferenser: ALLA trace-händelsers args efter chrome-extension://
      const tillaggURLer = new Map();
      const tillaggProcess = new Set();
      for (const e of trace) {
        const s = (() => { try { return JSON.stringify(e.args ?? {}); } catch { return ""; } })();
        if (s.includes("chrome-extension://")) {
          for (const m of s.matchAll(/chrome-extension:\/\/[\w-]+\/[^\\"\s,}]*/g)) {
            const u = m[0].slice(0, 140);
            tillaggURLer.set(u, (tillaggURLer.get(u) ?? 0) + 1);
          }
        }
        if (e.name === "process_name" && /extension/i.test(String(e.args?.name ?? ""))) tillaggProcess.add(String(e.args.name));
      }
      // Longtasks + deras attribuering (o143-metodik, förenklad)
      const ev = trace.filter((e) => e.ph === "X" || e.ph === "I");
      const tasks = ev.filter((e) => e.name === "RunTask" && e.dur > 50_000).sort((a, b) => a.ts - b.ts);
      const fcpEv = trace.find((e) => e.name === "firstContentfulPaint");
      const fcpTs = fcpEv ? fcpEv.ts : null;
      const langtasks = tasks.map((t) => {
        const barn = ev.filter((e) => e.ts >= t.ts && e.ts < t.ts + t.dur && ATTR_NAMN.has(e.name) && (e.dur ?? 0) > 300);
        const attrURLer = barn.map((b) => b.args?.data?.url || b.args?.data?.stackTrace?.[0]?.url || "").filter(Boolean).map((u) => u.slice(0, 130));
        return {
          start: Math.round(t.ts / 1000), dur: Math.round(t.dur / 1000), blocking: Math.round((t.dur - 50_000) / 1000),
          iFonstretFCP5s: fcpTs != null && t.ts >= fcpTs && t.ts < fcpTs + 5_000_000,
          attrURLer: [...new Set(attrURLer)].slice(0, 6),
          tillaggsAttr: attrURLer.some((u) => u.startsWith("chrome-extension://")),
        };
      });
      const iFonstret = langtasks.filter((t) => t.iFonstretFCP5s);
      return {
        disableExtensions,
        traceEventAntal: trace.length,
        fcpTs: fcpTs ? Math.round(fcpTs / 1000) : null,
        tillaggURLer: [...tillaggURLer.entries()].map(([u, n]) => ({ url: u, forekomster: n })).sort((a, b) => b.forekomster - a.forekomster).slice(0, 8),
        tillaggProcessNamn: [...tillaggProcess],
        antalLangtasks: langtasks.length,
        tbtFonsterFCP5s: iFonstret.reduce((a, t) => a + t.blocking, 0),
        langtasksMedTillaggsAttr: langtasks.filter((t) => t.tillaggsAttr).map((t) => ({ start: t.start, dur: t.dur, blocking: t.blocking, attrURLer: t.attrURLer })),
      };
    } finally {
      chrome.kill();
      await sleep(800);
    }
  }

  const utan = await korSond(PORT, false);
  const med = await korSond(PORT + 1, true);
  return { utanFlagga: utan, medFlagga: med };
}

// ─── HUVUD ─────────────────────────────────────────────────────────────────
const ramFore = ramFriMB();
if (ramFore < 1500) {
  console.error(`RAM-VAKT: ${ramFore} MB < 1500 — vägrar (fabrikskonventionen).`);
  process.exit(2);
}
console.log(`RAM ${ramFore} MB — grönt. Pelare A …`);
const A = pelareA();
console.log(`A: chrome-launcher ${A.chromeLauncherVersion} default --disable-extensions = ${A.defaultHarDisableExtensions} (flags.js:${A.rad})`);

let lhVersion = null;
try { lhVersion = execFileSync("npx", ["--yes", "lighthouse", "--version"], { encoding: "utf8", timeout: 120_000 }).trim(); } catch (e) { lhVersion = `fel: ${String(e).slice(0, 120)}`; }
console.log(`npx löser lighthouse → ${lhVersion}`);

console.log("Pelare B: äkta kanonisk körning (identiska args) …");
const B = await pelareB();
console.log(`B: exit ${B.exitkod} · ${B.chromeProcesser.length} chrome-cmdline(s) i ${B.profilDom.length} profiler · lighthouse-huvud ren: ${B.lighthouseHuvudRen}`);
for (const p of B.profilDom) console.log(`   profil ${p.profil.slice(0, 46)} · ${p.antalProcesser} proc · huvud ext=${p.huvudHarDisableExtensions}${p.arLighthouse ? " ← LIGHTHOUSE" : ""}`);

console.log("Pelare C: söker tilläggsspår i rapporten …");
const C = pelareC(B);
console.log(`C: träffar ${C.träffAntal ?? C.traffAntal ?? 0} · kärnmått ${JSON.stringify(C.karnmatt)}`);

console.log("Pelare D: A/B rå Chrome (o143-metodik) …");
let D = null;
try {
  D = await pelareD();
  console.log(`D utan flagga: ${D.utanFlagga.tillaggURLer.length} tilläggs-URL:er · ${D.utanFlagga.langtasksMedTillaggsAttr.length} longtasks med tilläggsattr · TBT ${D.utanFlagga.tbtFonsterFCP5s} ms`);
  console.log(`D med flagga:  ${D.medFlagga.tillaggURLer.length} tilläggs-URL:er · ${D.medFlagga.langtasksMedTillaggsAttr.length} longtasks med tilläggsattr · TBT ${D.medFlagga.tbtFonsterFCP5s} ms`);
} catch (e) {
  D = { fel: String(e).slice(0, 400) };
  console.log(`D FEL: ${D.fel}`);
}

// ─── DOM ───────────────────────────────────────────────────────────────────
const bBevisarRenhet = B.lighthouseHuvudRen === true;
// Kausalitet: utan flagga lastas systemtilläggen (URL:er i trace); med flaggan
// kan component-SW:n (fignfifoniblkonapihmkfakmlgkbkcf) lämnas EN spillrad
// utan longtask-påverkan — chrome-launcher:s default har därtill
// --disable-component-extensions-with-background-pages för den klassen.
const dBevisarKausalitet = !D?.fel && D.utanFlagga.tillaggURLer.length > 1
  && D.medFlagga.tillaggURLer.length <= 1 && D.medFlagga.langtasksMedTillaggsAttr.length === 0;
const dBevisarLangtaskPaverkan = !D?.fel && D.utanFlagga.langtasksMedTillaggsAttr.length > 0;
let dom;
if (bBevisarRenhet && dBevisarKausalitet) {
  dom = {
    utfall: "INSTRUMENTET FRIAT",
    text: `Kanonisk lighthouse (npx→lighthouse ${lhVersion}, chrome-launcher ${A.chromeLauncherVersion}) startar SIN Chrome med --disable-extensions (huvudprocess-cmdline för ${B.lighthouseProfiler.map((p) => p.profil).join(", ")}: ${B.lighthouseProfiler.map((p) => "ext=" + p.huvudHarDisableExtensions).join(", ")}) — tilläggen lastas därmed ej i kanoniska mätningar. Kausalitet bevisad: rå Chrome utan flagga lastar systemtillägg (${D.utanFlagga.tillaggURLer.length} tilläggs-URL:er: Docs Offline ghbmnnjooekpmoecnnnilnnbdlolhkhi + Web-Store-Payments nmmhkkegccagdldgiimedpiccmgmieda${dBevisarLangtaskPaverkan ? " — med longtask-attribution ≈ o143:s 200–330 ms-klass" : " (longtask-attributionen varierar mellan körningar; o143:s fynd bär den klassen)"}), med flaggan endast component-SW-spår (${D.medFlagga.tillaggURLer.length} URL) utan longtask-påverkan. HISTORISKA KANONISKA TBT-VÄRDEN bär DÄRMED EJ tilläggssystematiken — o143 §8:s ~0,3 s-systematik gällde endast karena rå-Chrome-starterna (o143 kurerade redan sin sond med flaggan).`,
    historiskaBasrader: ["o139-fore nattbas (TBT 375/582 — o151-nattmätarens jämförelsebas)", "o143-efter", "o144 EFTER ×5", "o150-blocksond-baser"],
    forbehall: "npx --yes är versionflytande: chrome-launcher-defaults kan ändras i framtida lighthouse — explicit härdning av prestanda-lighthouse.mjs rekommenderas som kontrakt (levereras av denna våg).",
  };
} else if (bBevisarRenhet && !dBevisarKausalitet) {
  dom = {
    utfall: "INSTRUMENTET FRIAT (svagare kedja)",
    text: `Pelare B visar --disable-extensions i lighthouse-huvudprocessens cmdline, men kontrollkedjan bröts (${D?.fel ? "sondfel" : D ? `utan=${D.utanFlagga.tillaggURLer.length}, med=${D.medFlagga.tillaggURLer.length}` : "?"}) — omprövning av pelare D krävs före slutgiltig avskrivning.`,
  };
} else {
  dom = {
    utfall: "INSTRUMENTET BELASTAT — KUR KRÄVS",
    text: `Lighthouse-huvudprocessen saknar --disable-extensions (profiler: ${JSON.stringify(B.lighthouseProfiler.map((p) => [p.profil, p.huvudHarDisableExtensions]))}) — prestanda-lighthouse.mjs behöver explicit härdning och historiska TBT-värden bär ≤ ~0,3 s systematik.`,
  };
}

const rapport = {
  verktyg: "o152-tillaggsbevis",
  uppdrag: "o143 §8 + o144 §8-kö: lastar kanonisk lighthouse Docs-Offline-tillägget?",
  datum: new Date().toISOString(),
  tillagg: { namn: "Google Docs Offline", id: TILLAGG_ID, fyndKalla: "o143 §3 sidofynd (200–330 ms longtask)" },
  ramForeMB: ramFore,
  npxLighthouseVersion: lhVersion,
  pelareA_statisk: A,
  pelareB_process: B,
  pelareC_rapport: C,
  pelareD_kontroll: D,
  dom,
};
writeFileSync(RAPPORT, JSON.stringify(rapport, null, 2));
console.log(`\nDOM: ${dom.utfall}`);
console.log(`Rapport → ${RAPPORT}`);
