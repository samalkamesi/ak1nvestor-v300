#!/usr/bin/env node
/**
 * KÖR-ALLA-TESTER — testaggregatorn (VÅG 212, E35:s gap 1: "aggregatorn
 * 123 sviter utan kör-alla = provtagningen fördjupas per dygn").
 * =====================================================================
 * Behov (SYSTEMKARTAN E35, dokvåg 2026-09-19): verktyg/ bär 124 testa-*.mjs
 * sviter men INGEN mekanism kör dem alla — varje svit är provtagning som
 * bara mäts när någon råkar köra den. Aggregatorn gör HELA bältet mekaniskt:
 *
 *   · upptäcker ALLA verktyg/testa-*.mjs (sorterat, deterministiskt)
 *   · kör SEKVENTIELLT (ingen parallellism — 8 GB-servern delar minne med
 *     pm2, fabrikens zcode-barn och chrome-cronen; sekvens = förutsägbar topp)
 *   · RAM-VAKT före varje svit (fabrikens mönster): < 900 MB tillgängligt ⇒
 *     vänta i 60 s-steg, tak 20 min/svit; frigörs det aldrig ⇒ ärlig stopp
 *     "avbruten-ram" — utförda sviter bevaras, --fortsatt återupptar
 *   · timeout per svit (default 900 s, --tak=S): SIGTERM ⇒ 5 s ⇒ SIGKILL —
 *     ett hängande barn kan aldrig frysa hela svepet
 *   · klassificering: exit 0 = GRÖN · exit ≠0 = RÖD · timeout = RÖD(timeout)
 *     · spawn-fel = RÖD — ofullständig mätning är ALDRIG grönt (vakt-doktrin)
 *   · tsx-återfall (R107): svit som dör med ERR_MODULE_NOT_FOUND under ren
 *     node (ändelselösa TS-imports) körs om via `npx --yes tsx` — grönt
 *     kräver fortfarande att SVITEN själv passerar
 *   · dev-serverfönster (R107): sviter som mäter mot dev+mock-transport
 *     (testa-studio-ttfb/tabbar/rewind) får en EGNA dev-server på port
 *     AK1A_TEST_DEV_PORT (default 3117, STUDIO_TRANSPORT=mock) med värmnings-
 *     POST före första mätningen — port 3000 (prod) rörs ALDRIG av fönstret
 *   · MILJÖKLASSER (V213a, R109 — styrelsens fasordning R107/R108): varje
 *     svit klassas efter BEVISAT beroende och körs billigast/mest isolerat
 *     först → dyrast/mest delat tillstånd sist:
 *       DETERMINISTISK (fas 0) — offline/lokal data, default-klassen
 *       DEV-FÖNSTER   (fas 2) — mäter mot dev-instans (aggregatorns fönster)
 *       PROD-NÄRA     (fas 3) — mäter live prod/externa ytor (loopback 3000
 *                       eller externa URL:er, bevisade markörer i sviten)
 *       TUNG-TILLSTÅND(fas 4) — skriver verkligt tillstånd (protokoll/PIPELINE),
 *                       körs SIST och ensam; styrelse-sviten får dev-fönstrets
 *                       port+mock — aldrig prod (R107-fyndet: sond mot 3000
 *                       kunde verkställa ett äkta möte i prod)
 *     Klassning = ordning + rapportering + --klass-filter — ALDRIG
 *     nivåsänkande: rött förblir rött i varje klass.
 *   · kvitto-rad: sista stdout-rad som ser ut som ett resultat (PASS/FAIL/
 *     RESULTAT/GRÖN…) — sviternas egna utdata är sanningen, aggregatorn
 *     hittar bara på INGA tal
 *   · RESULTAT_JSON-summa på sista raden (kvalitetsvaktens konvention —
 *     cron/ronder parsar den)
 *
 * Utdata (runtime, gitignorerade vägar — SENASTE-konventionen):
 *   data/vakten/testaggregator-SENASTE.md   — läsbar rapport (tabell + summa)
 *   data/vakten/testaggregator-SENASTE.json — rådata + återupptagningsläge
 *
 * Användning:
 *   node verktyg/kor-alla-tester.mjs [--fortsatt] [--mönster=regex] [--klass=delsträng] [--tak=sek]
 * Avslutskod: 0 = komplett svep med 0 RÖDA · 1 = RÖDA/avbrutet · 2 = argumentfel
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hamtaPortagare, lasCmdline, lasPpid, hittaOrtRot, dodaDeltrad } from "./process-trad.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAPPORT_MD = path.join(REPO, "data", "vakten", "testaggregator-SENASTE.md");
const RAPPORT_JSON = path.join(REPO, "data", "vakten", "testaggregator-SENASTE.json");
const VERKTYG = path.join(REPO, "verktyg");

const RAM_TRSKEL_MB = 900;     // fabrikens princip: aldrig starta tungt barn under detta
const RAM_VANTA_TAK_S = 20 * 60; // per svit: vänta högst 20 min på minne
const RAM_KRIT_MB = Number(process.env.AK1A_RAM_KRIT_MB || 250); // V217: mitt-i-svit; överskridbar för beviskörningar
const TERM_TOLERANS_S = 5;     // SIGTERM ⇒ 5 s ⇒ SIGKILL

// ── miljöklasser (V213a) + dev-serverfönstret (ROND 107) ────────────────────
// Klasserna åtskiljer sviternas miljöberoenden ÄRLIGT (bevisade markörer —
// localhost:3000/externa URL:er i PROD-NÄRA; dev-transport-i-svit för
// DEV-FÖNSTER; tillståndsskrivande API-båg för TUNG-TILLSTÅND). Allt annat
// är DETERMINISTISK (default). Ordningen följer styrelsens fasbeslut.
const KLASS_REGLER = [
  { namn: "DETERMINISTISK", ordning: 0, monster: null },
  { namn: "DEV-FÖNSTER", ordning: 1, monster: /^(testa-studio-(ttfb|tabbar|rewind))\.mjs$/ },
  { namn: "PROD-NÄRA", ordning: 2, monster: /^(testa-(studio-scenarion|tradspermanens|doda-lankar-externa-cron|granssnitt-(drift|konsol)|prestanda-v96))\.mjs$/ },
  { namn: "TUNG-TILLSTÅND", ordning: 3, monster: /^testa-styrelse\.mjs$/ },
];
function miljoKlass(fil) {
  for (const r of KLASS_REGLER) if (r.monster?.test(fil)) return r;
  return KLASS_REGLER[0];
}
// Sviter som mäter/kör MOT en dev-instans med mock-transport (våg 95/144:s
// dev-baslinjer: mockens permission-dialoger besvaras direkt). Port 3000 är
// PROD på servern och får aldrig mixas in i dev-mätningen — aggregatorn
// föder en egen dev-server på egen port medan dessa sviter kör. Sedan V213a
// ingår styrelse-sviten (tung tillståndsskrivning) i fönstret: dess PROBE
// får dev-porten, aldrig prod.
const DEV_SVITER = /^(testa-studio-(ttfb|tabbar|rewind)|testa-styrelse)\.mjs$/;
const DEV_PORT = process.env.AK1A_TEST_DEV_PORT || "3117";

// ── argument ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FORTSATT = args.includes("--fortsatt");
const TAK_STANDARD = 900;
let takSek = TAK_STANDARD;
let monster = null;
let klassFilter = null;
for (const a of args) {
  if (a.startsWith("--tak=")) {
    const n = Number(a.slice(6));
    if (!Number.isFinite(n) || n < 30 || n > 7200) {
      console.error(`ogiltigt --tak (30–7200 s): ${a}`);
      process.exit(2);
    }
    takSek = Math.round(n);
  } else if (a.startsWith("--mönster=") || a.startsWith("--monster=")) {
    try {
      monster = new RegExp(a.slice(a.indexOf("=") + 1), "u");
    } catch (e) {
      console.error(`ogiltigt mönster: ${e.message}`);
      process.exit(2);
    }
  } else if (a.startsWith("--klass=")) {
    klassFilter = a.slice(8).toLowerCase();
    if (!KLASS_REGLER.some((r) => r.namn.toLowerCase().includes(klassFilter))) {
      console.error(`ogiltig --klass (delsträng av: ${KLASS_REGLER.map((r) => r.namn).join(" · ")}): ${a}`);
      process.exit(2);
    }
  } else if (a !== "--fortsatt") {
    console.error(`okänt argument: ${a}`);
    process.exit(2);
  }
}

/** Tillgängligt RAM i MB ur /proc/meminfo — null vid fel (fail-open). */
function ramTillgangligtMB() {
  try {
    const m = readFileSync("/proc/meminfo", "utf8").match(/^MemAvailable:\s+(\d+) kB/m);
    return m ? Math.round(Number(m[1]) / 1024) : null;
  } catch {
    return null;
  }
}

/** Vänta på minne — true när tillgängligt, false när taket nåddes. */
async function vantaRam() {
  const start = Date.now();
  for (;;) {
    const ram = ramTillgangligtMB();
    if (ram === null || ram >= RAM_TRSKEL_MB) return true;
    if (Date.now() - start >= RAM_VANTA_TAK_S * 1000) return false;
    console.log(`  väntar-ram: ${ram} MB < ${RAM_TRSKEL_MB} MB (fabriksbarn/chrome?) — 60 s …`);
    await new Promise((r) => setTimeout(r, 60_000));
  }
}

// ── dev-servern (ROND 107): föds på behov, dödas efter sista dev-sviten ─────
let devServer = null; // { pid } | null
let devMisslyckades = false;

async function startaDevServer() {
  const logg = [];
  // F2-VACCINET (2026-09-20): en tidigare körning kan ha läckt sin
  // dev-server (bevis: 5 h gammal "next dev -p 3000 -p 3117" med PPid 1 —
  // en SIGKILL-död aggregator hinner aldrig städa). En läckt instans är
  // TVÅ fel: portkollision vid start — och värre: svarar den först mäter
  // sviterna mot GAMLAL kod i god tro. Därför svep före start: en
  // next-process på DEV_PORT med ort-rot (förälder död, PPid-kedjan
  // slutar vid init) dödas; en process med LEVANDE förälder (någon annans
  // pågående fönster) lämnas och fönstret avstår ärligt.
  const agare = hamtaPortagare(Number(DEV_PORT));
  if (!agare.okand && agare.finnas && agare.pid != null) {
    const cmd = lasCmdline(agare.pid);
    if (/next/.test(cmd)) {
      const rot = hittaOrtRot(agare.pid);
      if (lasPpid(rot) === 1) {
        console.log(`  F2-svep: dödar läckt dev-server på :${DEV_PORT} (ort-rot pid ${rot}, ${cmd.slice(0, 60)}…)`);
        await dodaDeltrad(rot);
      } else {
        console.log(`  VARNING: port ${DEV_PORT} hålls av levande next-process (pid ${agare.pid}) — dev-fönstret startar ej, dev-sviterna mäter INGET`);
        devMisslyckades = true;
        return null;
      }
    } else {
      console.log(`  VARNING: port ${DEV_PORT} hålls av icke-next-process (pid ${agare.pid}: ${cmd.slice(0, 60)}) — dev-fönstret startar ej`);
      devMisslyckades = true;
      return null;
    }
  }
  // Test-instansens lösenord sätts EXPLICIT till dev-värdet: ärvt ADMIN_PASSWORD
  // (OS-env eller .env.local) slår annars AV dev-fallbacken och trion (hårdkodad
  // AK1A-2026) dör i 401 (R107-fynd). Instansen binds ENDAST till loopback och
  // kör mock-transport — inga riktiga hemligheter, ingen extern yta.
  // F2: next-binären spawnas DIREKT (tidigare "npm run dev -- -p …" arityade
  // package.json:s "next dev -p 3000" till dubbla -p-flaggor — sista vann av
  // ren tur); enkel -p + loopback, samma miljö som tidigare.
  const barn = spawn(process.execPath, [path.join(REPO, "node_modules", ".bin", "next"), "dev", "-p", DEV_PORT, "-H", "127.0.0.1"], {
    cwd: REPO,
    detached: true, // egen processgrupp ⇒ gruppdöd nedan får hela trädet
    env: { ...process.env, NO_COLOR: "1", STUDIO_TRANSPORT: "mock", ADMIN_PASSWORD: "AK1A-2026" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  barn.stdout?.on("data", (d) => logg.push(String(d)));
  barn.stderr?.on("data", (d) => logg.push(String(d)));
  const BAS = `http://127.0.0.1:${DEV_PORT}`;
  const svarar = async () => {
    try {
      const r = await fetch(`${BAS}/api/studio/halsa`, { signal: AbortSignal.timeout(3_000) });
      return r.ok;
    } catch {
      return false;
    }
  };
  console.log(`  dev-server startar (port ${DEV_PORT}, STUDIO_TRANSPORT=mock) …`);
  let uppe = false;
  for (let t = 0; t < 90 && !uppe; t++) {
    await new Promise((r) => setTimeout(r, 2_000));
    uppe = await svarar();
  }
  if (!uppe) {
    console.log(`  dev-server kom ej upp inom 180 s — senaste logg: ${logg.join("").slice(-400)}`);
    await dodaDevServer(barn);
    return null;
  }
  // Värm studio-rutten: första POST triggar kompilering (10–60 s) som annars
  // äter trions egna 30 s-tidsgränser. Läs till första händelsen, avbryt sedan.
  try {
    const ac = new AbortController();
    const res = await fetch(`${BAS}/api/studio/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": "AK1A-2026" }, // dev-fallback (NODE_ENV=development)
      body: JSON.stringify({ prompt: " aggregatorvärmning — svara inte" }),
      signal: ac.signal,
    });
    const lasare = res.body?.getReader();
    if (lasare) await lasare.read(); // första SSE-chunken = rutten kompilerad + svarar
    ac.abort();
  } catch {
    /* värmningen är bästa-ansträngning — sviten får visa sitt eget svar */
  }
  console.log(`  dev-server uppe + värmnings-POST klar (${BAS})`);
  return { pid: barn.pid };
}

async function dodaDevServer(barn) {
  try {
    process.kill(-barn.pid, "SIGTERM"); // gruppen: npm + next-dev-trädet
  } catch {
    /* redan borta */
  }
  setTimeout(() => {
    try {
      process.kill(-barn.pid, "SIGKILL");
    } catch {
      /* redan borta */
    }
  }, 5_000);
}

/** Kör EN svit med timeout + gradvis avlivning.
 * viaTsx: kör genom `npx --yes tsx` — återfall när sviten importerar TS-moduler
 * med ändelselösa imports (node-ESM löser dem ej; tsx gör det).
 * VÅG 217 — MITT-I-SVIT-RAM-VAKT: startvakten (vantaRam) skyddar svitSTART,
 * men bevisen 2026-09-20 (r112-fullsvepet dog 2× vid styrelsemötet, 127 MB
 * fritt) visar att SVITENS EGEN tillväxt mitt i löpet dödar aggregATORN —
 * OOM-offret blir fel process. Väktaren pollar var 10:e s; < 250 MB två
 * poller i rad ⇒ svitTRÄDET avlivas (barnet dör, aldrig servern) och sviten
 * markeras RÖD(ram-vakt) — ärligt synligt, aldrig tyst, aldrig grönt
 * (ofullständig mätning är ALDRIG grönt, vakt-doktrinen). */
function korSvit(fil, takS, args = [], viaTsx = false) {
  return new Promise((res) => {
    const cmd = viaTsx ? "npx" : process.execPath;
    const argv = viaTsx ? ["--yes", "tsx", fil, ...args] : [fil, ...args];
    const barn = spawn(cmd, argv, {
      cwd: REPO,
      env: { ...process.env, NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let ut = "";
    let fel = "";
    if (barn.stdout) {
      barn.stdout.setEncoding("utf8");
      barn.stdout.on("data", (d) => { ut += d; });
    }
    if (barn.stderr) {
      barn.stderr.setEncoding("utf8");
      barn.stderr.on("data", (d) => { fel += d; });
    }
    const t0 = Date.now();
    const klar = (status) => {
      clearTimeout(tid);
      clearInterval(ramVaktare);
      res({ ...status, sekunder: Math.round((Date.now() - t0) / 1000) });
    };
    const doda = (efter) => {
      try { barn.kill("SIGTERM"); } catch { /* redan borta */ }
      setTimeout(() => {
        try { barn.kill("SIGKILL"); } catch { /* redan borta */ }
      }, efter * 1000);
    };
    let dodadAvTimeout = false;
    let dodadAvRamvakt = false;
    let ramTryck = 0;
    const tid = setTimeout(() => {
      dodadAvTimeout = true;
      doda(TERM_TOLERANS_S);
    }, takS * 1000);
    const ramVaktare = setInterval(() => {
      const ram = ramTillgangligtMB();
      if (ram === null) return; // fail-open: mäter vi ej, vakar vi ej
      if (ram >= RAM_KRIT_MB) {
        ramTryck = 0;
        return;
      }
      ramTryck++;
      console.log(`  ram-vakt: ${ram} MB kvar (${ramTryck}:a poll) under ${fil} — gräns ${RAM_KRIT_MB} MB`);
      if (ramTryck >= 2) {
        dodadAvRamvakt = true;
        // Hela trädet (svitens egna barn äter minnet): dodadeltrad är asynk-
        // ron eldglömskning, doda() är synkron backstop på roten.
        dodaDeltrad(barn.pid).catch(() => { /* backstopen täcker */ });
        doda(TERM_TOLERANS_S);
      }
    }, 10_000);
    barn.on("error", (e) => klar({ status: "RÖD", orsak: `spawn-fel: ${String(e.message).slice(0, 120)}`, ut, fel }));
    barn.on("close", (kod) =>
      klar(
        dodadAvRamvakt
          ? { status: "RÖD", orsak: `ram-vakt: svitträdet avlivat vid ${ramTillgangligtMB()} MB fritt — serverns skydd går före mätningen (omkör vid ledigare minne)`, ut, fel }
          : dodadAvTimeout
            ? { status: "RÖD", orsak: `timeout efter ${takS} s (SIGTERM⇒SIGKILL)`, ut, fel }
            : kod === 0
              ? { status: "GRÖN", orsak: null, ut, fel }
              : { status: "RÖD", orsak: `exit ${kod}`, ut, fel },
      ),
    );
  });
}

/** Sista resultatliknande raden ur stdout — svitens egna tal, aldrig påhittade. */
function kvittoRad(resultat) {
  const rader = String(resultat.ut || "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  for (let i = rader.length - 1; i >= 0; i--) {
    if (/(PASS|FAIL|GRÖN|RÖD|GUL|RESULTAT|KLAR|OK\b)/i.test(rader[i])) {
      return rader[i].slice(0, 160);
    }
  }
  return (rader[rader.length - 1] ?? "(tyst utdata)").slice(0, 160);
}

/** Sista stderr-raden — RÖDA sviters rotorsak ska synas i rapporten. */
function sistaFelRad(resultat) {
  const rader = String(resultat.fel || "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  return rader.length > 0 ? rader[rader.length - 1].slice(0, 160) : null;
}

// ── huvud ───────────────────────────────────────────────────────────────────
const t0 = Date.now();
let sviter = readdirSync(VERKTYG)
  .filter((f) => f.startsWith("testa-") && f.endsWith(".mjs"));
if (monster) sviter = sviter.filter((f) => monster.test(f));
if (klassFilter) sviter = sviter.filter((f) => miljoKlass(f).namn.toLowerCase().includes(klassFilter));
// KLASORDNINGEN (styrelsens fasbeslut): deterministiskt → dev-fönster →
// prod-nära → tungt tillstånd; alfabetiskt inom klassen (deterministiskt).
sviter.sort((a, b) => miljoKlass(a).ordning - miljoKlass(b).ordning || a.localeCompare(b));

// återupptagning: färdigmätta sviter hoppas över (idempotens som fabriken)
let tidigare = {};
if (FORTSATT && existsSync(RAPPORT_JSON)) {
  try {
    const gammal = JSON.parse(readFileSync(RAPPORT_JSON, "utf8"));
    if (gammal && Array.isArray(gammal.sviter)) {
      for (const s of gammal.sviter) tidigare[s.fil] = s;
    }
  } catch { /* trasig rådata ⇒ färskt svep */ }
}

const resultatLista = [];
let avbrutenRam = false;
console.log(`[kör-alla-tester] ${sviter.length} sviter (${FORTSATT ? "återupptagning" : "färskt svep"}, tak ${takSek} s/svit, RAM-tröskel ${RAM_TRSKEL_MB} MB)`);

for (const fil of sviter) {
  if (tidigare[fil]) {
    resultatLista.push(tidigare[fil]);
    continue;
  }
  if (!(await vantaRam())) {
    avbrutenRam = true;
    console.log(`AVBRYTER-RAM före ${fil} — ${resultatLista.length}/${sviter.length} mätta; kör om med --fortsatt`);
    break;
  }
  // dev-serverfönstret: föds före första dev-sviten, lever till sista
  if (DEV_SVITER.test(fil) && !devServer && !devMisslyckades) {
    if (!(await vantaRam())) {
      avbrutenRam = true;
      console.log(`AVBRYTER-RAM före dev-servern (${fil}) — kör om med --fortsatt`);
      break;
    }
    devServer = await startaDevServer();
    if (!devServer) devMisslyckades = true;
  }
  process.stdout.write(`  [${miljoKlass(fil).namn}] ${fil} … `);
  let post;
  if (DEV_SVITER.test(fil) && !devServer) {
    post = { fil, miljo: miljoKlass(fil).namn, status: "RÖD", orsak: "dev-server kom ej upp (mock-baslinjen omöjlig)", sekunder: 0, kvitto: "(tyst utdata)", sistaFel: null };
  } else {
    const args = DEV_SVITER.test(fil) ? [DEV_PORT] : [];
    let r = await korSvit(path.join(VERKTYG, fil), takSek, args);
    // tsx-återfall (ROND 107, breddat R110): sviter som importerar TS-moduler
    // dör under ren node — ändelselösa imports (ERR_MODULE_NOT_FOUND) eller
    // syntax som strip-only-läget ej stödjer (ERR_UNSUPPORTED_TYPESCRIPT_
    // SYNTAX, t.ex. parameter properties i transitiva moduler) — sviten
    // förblir sanningen: grönt kräver att den PASSERAR under tsx.
    if (r.status === "RÖD" && /(ERR_MODULE_NOT_FOUND|ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX)/.test(String(r.fel))) {
      process.stdout.write("(tsx-återfall) ");
      r = await korSvit(path.join(VERKTYG, fil), takSek, args, true);
    }
    post = {
      fil,
      miljo: miljoKlass(fil).namn,
      status: r.status,
      orsak: r.orsak,
      sekunder: r.sekunder,
      kvitto: kvittoRad(r),
      sistaFel: r.status === "RÖD" ? sistaFelRad(r) : null,
    };
  }
  resultatLista.push(post);
  console.log(`${post.status} (${post.sekunder} s) — ${post.kvitto}`);
}

// dev-servern dör ALWAYS — även efter avbrott (aldrig läckande next-dev)
if (devServer) {
  console.log("  dev-servern stängs …");
  const dodare = devServer;
  await new Promise((r) => setTimeout(r, 500));
  try {
    process.kill(-dodare.pid, "SIGTERM");
    setTimeout(() => {
      try { process.kill(-dodare.pid, "SIGKILL"); } catch { /* borta */ }
    }, 5_000);
  } catch {
    /* redan borta */
  }
}

// ── summering + rapport ─────────────────────────────────────────────────────
const Grona = resultatLista.filter((s) => s.status === "GRÖN");
const Roda = resultatLista.filter((s) => s.status === "RÖD");
const omatta = sviter.length - resultatLista.length;
const status = omatta > 0 || avbrutenRam ? "AVBRUTEN" : Roda.length === 0 ? "GRÖN" : "RÖD";
const korTidSek = Math.round((Date.now() - t0) / 1000);
const startIso = new Date().toISOString();

const md = [];
md.push(`# KÖR-ALLA-TESTER — testaggregatorn (VÅG 212 / E35 gap 1)`);
md.push("");
md.push(`- **Genererad:** ${startIso} · körtid ${Math.floor(korTidSek / 60)} min ${korTidSek % 60} s`);
md.push(`- **Sviter:** ${sviter.length} upptäckta · ${resultatLista.length} mätta · ${Grona.length} GRÖNA · ${Roda.length} RÖDA · ${omatta} omätta`);
md.push(`- **Läge:** ${FORTSATT ? "återupptagning" : "färskt svep"} · tak ${takSek} s/svit · sekventiellt (RAM-delning med pm2/fabrik/chrome-cron)`);
md.push(`- **Klassregler:** exit 0 = GRÖN · exit ≠0 = RÖD · timeout = RÖD — ofullständig mätning är ALDRIG grönt`);
md.push(`- **Miljöklasser (V213a):** körs i fasordning DETERMINISTISK → DEV-FÖNSTER → PROD-NÄRA → TUNG-TILLSTÅND — ordning/rapport/filter, aldrig nivåsänkande`);
md.push("");
// klasssammanfattning först — en rad per klass med grönt/rött (miljöberoende
// fel ska synas som sin egen kategori, R107-lärdomen)
md.push(`## Miljöklasser`);
md.push("");
md.push(`| Klass | GRÖNA | RÖDA | Omätta |`);
md.push(`|---|---:|---:|---:|`);
for (const r of KLASS_REGLER) {
  const iKlass = sviter.filter((f) => miljoKlass(f).namn === r.namn);
  const matta = resultatLista.filter((s) => s.miljo === r.namn);
  const omattaKlass = iKlass.length - matta.length;
  if (iKlass.length === 0) continue;
  md.push(`| ${r.namn} | ${matta.filter((s) => s.status === "GRÖN").length} | ${matta.filter((s) => s.status === "RÖD").length} | ${omattaKlass} |`);
}
md.push("");
md.push(`## RÖDA sviter (${Roda.length})`);
md.push("");
if (Roda.length === 0) {
  md.push("Inga.");
} else {
  md.push(`| Svit | Klass | Orsak | Kvitto/sista utdata |`);
  md.push(`|---|---|---|---|`);
  for (const s of Roda) {
    md.push(`| ${s.fil} | ${s.miljo ?? "-"} | ${s.orsak ?? "-"} | ${((s.sistaFel ?? s.kvitto) ?? "-").replaceAll("|", "\\|")} |`);
  }
}
md.push("");
md.push(`## Alla sviter (${resultatLista.length})`);
md.push("");
md.push(`| Svit | Klass | Status | Sek | Kvitto |`);
md.push(`|---|---|---|---:|---|`);
for (const s of resultatLista) {
  md.push(`| ${s.fil} | ${s.miljo ?? "-"} | **${s.status}** | ${s.sekunder} | ${s.kvitto.replaceAll("|", "\\|")} |`);
}
md.push("");
md.push(`## SUMMA: ${Grona.length} GRÖNA | ${Roda.length} RÖDA | ${omatta} OMÄTTA | STATUS: ${status}`);
md.push("");

mkdirSync(path.dirname(RAPPORT_MD), { recursive: true });
writeFileSync(RAPPORT_MD, md.join("\n") + "\n", "utf8");
writeFileSync(
  RAPPORT_JSON,
  JSON.stringify(
    {
      genererad: startIso,
      korTidSek,
      takSek,
      lage: FORTSATT ? "fortsatt" : "farsk",
      avbrutenRam,
      upptackta: sviter.length,
      matta: resultatLista.length,
      grona: Grona.length,
      roda: Roda.length,
      omatta,
      status,
      klassSumma: Object.fromEntries(
        KLASS_REGLER.map((r) => [
          r.namn,
          {
            upptackta: sviter.filter((f) => miljoKlass(f).namn === r.namn).length,
            grona: resultatLista.filter((s) => s.miljo === r.namn && s.status === "GRÖN").length,
            roda: resultatLista.filter((s) => s.miljo === r.namn && s.status === "RÖD").length,
          },
        ]),
      ),
      sviter: resultatLista,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

console.log(`rapport: ${path.relative(REPO, RAPPORT_MD)}`);
const resultat = { grona: Grona.length, roda: Roda.length, omatta, matta: resultatLista.length, status };
console.log("RESULTAT_JSON=" + JSON.stringify(resultat));
process.exit(status === "GRÖN" ? 0 : 1);
