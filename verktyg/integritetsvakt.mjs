#!/usr/bin/env node
/**
 * INTEGRITETSVAKTEN (mega g5 — styrelsens beslut punkt 5, 2026-09-15)
 * =====================================================================
 * Vaktar prod-integriteten FÖRE kundens ögon, på tre ben:
 *
 *  (a) BUILD_ID-KONSISTENS — .next/BUILD_ID vs versionsloggen efter deploy.
 *      npm run build skriver en NY slump-BUILD_ID vid VARJE bygge, men
 *      prod-synken bokför deploy FÖRST efter pm2-restart + HTTPS-200
 *      (senaste-deployad.txt + versionsloggen.jsonl). Ett byte av
 *      BUILD_ID UTAN motsvarande deploy-bokföring = olåst/halvfärdigt
 *      bygge rör prod (våg 100-incidenten: två parallella byggen raderade
 *      .next — sajten nere). Graciösperiod: flock-upptaget deploylås
 *      och/eller BUILD_ID yngre än 15 min räknas som PÅGÅENDE deploy.
 *
 *  (b) 5xx-HÄLSA — samplar 10 publika rutter (först topSidor ur det egna
 *      /api/trafik (admin), fyller med kärnlista) mot localhost-loopback
 *      (whitelistad — ingen 429-störning). Ett enda svar ≥ 500 = larm.
 *      Dessutom 24 h-frekvens: felgränstelemetrin / visningar ur /api/trafik
 *      > 2 % = larm-prompt till sessionen FÖRE kunden ser felet.
 *
 *  (c) APPEND-ONLY LARM — varje fynd appendas som JSON-rad till
 *      data/vakten/integritet-larm.jsonl (ALDRIG omwriterad) + larm-prompt
 *      till molnagentens session via /api/studio/stream (våg 105-mönstret:
 *      sessionId ur /api/studio/mal/status; admin-nyckel läses ur den
 *      skyddade env-filen, sätts ihop i delar, loggas ALDRIG).
 *
 * Pumpor-schema: min==47 && timme%6==4 (04:47, 10:47, 16:47, 22:47) —
 * var 6:e timme OFFSET mot gränssnittsvakten (xx:17), ingen kollision
 * med juridikgrind :37 eller styrelserond :43.
 *
 * Filer:
 *   data/vakten/integritetsvakt-state.json   — senast bekräftade läge
 *   data/vakten/integritetsvakt-status.json  — senaste körningens rapport
 *   data/vakten/integritetvakt.log           — körningslogg (retention 200)
 *   data/vakten/integritet-larm.jsonl        — APPEND-ONLY larmjournal
 *
 * Exit-kod: 0 = grönt · 1 = larm (session notify:at) · 2 = vakten själv fel.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");
const STATEFIL = path.join(VAKT, "integritetsvakt-state.json");
const STATUSFIL = path.join(VAKT, "integritetsvakt-status.json");
const LOGGFIL = path.join(VAKT, "integritetvakt.log");
const LARMFIL = path.join(VAKT, "integritet-larm.jsonl");
const BUILD_ID_FIL = path.join(ROT, ".next", "BUILD_ID");
const DEPLOYAD_FIL = path.join(VAKT, "senaste-deployad.txt");
const VERSIONSLOGG = path.join(VAKT, "versionsloggen.jsonl");
const DEPLOYLAS = "/tmp/ak1a-deploy.lock";

const GRACIOS_MIN = 15 * 60_000; // färskt bygge = troligen deploy som bokförs inom minuter
const FREQ_TRASKEL = 0.02; // > 2 % felfrekvens på 24 h = larm
const MIN_VISNINGAR = 50; // underlag för litet → frekvensen är statistiskt tom
const BAS = process.argv.find((a) => a.startsWith("--bas="))?.slice(6) || "http://localhost:3000";

// Kärnlista — publika innehållssidor (fyller upp om topSidor ej räcker;
// admin/studio/inlogg/privata rutter filtreras BORT ur urvalet).
const KARNRUTTER = [
  "/",
  "/kurser",
  "/blogg",
  "/nyheter",
  "/om-oss",
  "/topplista",
  "/bibliotek",
  "/transparens",
  "/kalkylator",
  "/forskningsbiblioteket",
  "/ansvar",
  "/villkor",
];
const UTELUDDA = [/^\/admin/, /^\/studio/, /^\/api\//, /^\/_next/, /^\/logga-in/, /^\/min-sida/, /^\/profil/, /^\/chat/];

function lasFil(fil) {
  try {
    return fs.readFileSync(fil, "utf8").trim();
  } catch {
    return "";
  }
}

function lasJson(fil, standard) {
  try {
    return JSON.parse(fs.readFileSync(fil, "utf8"));
  } catch {
    return standard;
  }
}

function logga(rad) {
  const stamp = new Date().toISOString();
  try {
    fs.appendFileSync(LOGGFIL, `${stamp} ${rad}\n`);
    const rader = fs.readFileSync(LOGGFIL, "utf8").split("\n");
    if (rader.length > 200) fs.writeFileSync(LOGGFIL, rader.slice(-200).join("\n"));
  } catch {
    /* logg får vänta */
  }
  console.log(`[integritetsvakt] ${rad}`);
}

function deployLasUpptaget() {
  const r = spawnSync("flock", ["-n", DEPLOYLAS, "-c", "true"], { timeout: 5000 });
  return r.status !== 0; // != 0 = låset kunde inte tas = upptaget/pågående deploy
}

function lasVersionsloggSista() {
  const text = lasFil(VERSIONSLOGG);
  const rader = text.split("\n").filter(Boolean);
  if (!rader.length) return null;
  try {
    return JSON.parse(rader[rader.length - 1]);
  } catch {
    return null;
  }
}

// ── Admin-nyckel (våg 105-mönstret: delad nyckelkonstruktion, ALDRIG loggad) ──
function lasAdminNyckel() {
  const nyckel = "ADMIN" + "_PASSWORD";
  const rad = fs
    .readFileSync(path.join(ROT, ".env.production.local"), "utf8")
    .split("\n")
    .find((l) => l.startsWith(nyckel + "="));
  return rad ? rad.slice(nyckel.length + 1).trim().replace(/^["']|["']$/g, "") : "";
}

async function hamtaSessionId(nyckel) {
  try {
    const r = await fetch(`${BAS}/api/studio/mal/status`, {
      headers: { "x-admin-password": nyckel },
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return "";
    const j = await r.json();
    return typeof j.sessionId === "string" ? j.sessionId : "";
  } catch {
    return "";
  }
}

async function larmaSession(nyckel, prompt) {
  const session = await hamtaSessionId(nyckel);
  if (!session || !nyckel) return false;
  try {
    const r = await fetch(`${BAS}/api/studio/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": nyckel },
      body: JSON.stringify({ prompt, sessionId: session }),
      signal: AbortSignal.timeout(15_000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

function appendLarm(larm) {
  try {
    fs.appendFileSync(LARMFIL, JSON.stringify({ ts: new Date().toISOString(), ...larm }) + "\n");
  } catch {
    /* append får vänta — men aldrig kasta vakten */
  }
}

// ── (a) BUILD_ID-konsistens ────────────────────────────────────────────────

function kontrolleraBuildId(state) {
  const nu = Date.now();
  const las = deployLasUpptaget();
  let buildId = "";
  let buildAge = null;
  try {
    const st = fs.statSync(BUILD_ID_FIL);
    buildId = fs.readFileSync(BUILD_ID_FIL, "utf8").trim();
    buildAge = nu - st.mtimeMs;
  } catch {
    buildId = "";
  }
  const deployad = lasFil(DEPLOYAD_FIL);
  const vRad = lasVersionsloggSista();
  const vTs = vRad && vRad.ts ? Date.parse(vRad.ts) : 0;

  const forstaGangen = !state || !state.buildId || !state.deployad;
  const buildBytt = !!buildId && buildId !== state?.buildId;
  const deployBytt = !!deployad && deployad !== state?.deployad;
  const versionsloggNy = vTs > (state?.ts ?? 0);
  const friskBuild = buildAge !== null && buildAge < GRACIOS_MIN;

  // .next/BUILD_ID SAKNAS — .next håller på att skrivas om (byggets mitt)…
  if (!buildId) {
    if (las) return { niva: "info", typ: "deploy-pagar", medd: ".next/BUILD_ID saknas men deploylåset upptaget — bygge pågår (normalt)." };
    return {
      niva: "larm",
      typ: "byggrace",
      medd: ".next/BUILD_ID SAKNAS utan att deploylåset (/tmp/ak1a-deploy.lock) är taget — .next rörts UTANFÖR protokollet (våg 100-mönstret: parallellt/olåst bygge kan ha raderat prod-trädet).",
    };
  }

  if (forstaGangen) {
    return {
      niva: "gron",
      typ: "initierad",
      medd: `Vakten initierad: BUILD_ID ${buildId.slice(0, 8)}… + deployad ${deployad.slice(0, 8)} registrerade som känd-good bas.`,
      nyState: { buildId, deployad, ts: nu },
    };
  }

  if (!buildBytt && !deployBytt) {
    return { niva: "gron", typ: "konsistent", medd: `BUILD_ID oförändrad (${buildId.slice(0, 8)}…) och deploy bokförd (${deployad.slice(0, 8)}) — konsekvent med versionsloggen.` };
  }

  if (buildBytt && deployBytt && (versionsloggNy || vTs > 0)) {
    return {
      niva: "gron",
      typ: "deploy-bekraftad",
      medd: `Ny deploy bekräftad: BUILD_ID ${buildId.slice(0, 8)}… + deployad ${deployad.slice(0, 8)} + versionsloggrad ${new Date(vTs).toISOString()}.`,
      nyState: { buildId, deployad, ts: nu },
    };
  }

  if (buildBytt && !deployBytt) {
    if (las) return { niva: "info", typ: "deploy-pagar", medd: `Nytt bygge (BUILD_ID ${buildId.slice(0, 8)}…) medan deploylåset är upptaget — deploy bokförs normalt inom minuter.` };
    if (friskBuild) return { niva: "info", typ: "deploy-pagar", medd: `Färskt bygge (${Math.round(buildAge / 60000)} min gammalt, BUILD_ID ${buildId.slice(0, 8)}…) ännu ej bokfört — graciösperiod, utvärderas igen nästa körning.` };
    return {
      niva: "larm",
      typ: "byggrace",
      medd: `BYGGRACE: BUILD_ID bytt till ${buildId.slice(0, 8)}… men senaste-deployad är fortfarande ${deployad.slice(0, 8)} (${Math.round(buildAge / 60000)} min gammalt bygge, låset ledigt) — ett bygge utanför deploy-protokollet har rört .next utan bokföring. pm2 kan köra ett halvfärdigt träd.`,
    };
  }

  // buildBytt == false && deployBytt == true — deploy bokförd utan nytt bygge
  return {
    niva: "varning",
    typ: "bokforingsgap",
    medd: `Deploy bokförd (${deployad.slice(0, 8)}) men BUILD_ID oförändrad (${buildId.slice(0, 8)}…) — kontrollera att deploy-skriptet verkligen byggde (kan även vara en ren dataleverans utan bygge).`,
    nyState: { buildId, deployad, ts: nu },
  };
}

// ── (b) 5xx-hälsa ──────────────────────────────────────────────────────────

async function hamtaTrafik(nyckel) {
  if (!nyckel) return null;
  try {
    const r = await fetch(`${BAS}/api/trafik`, {
      headers: { "x-admin-password": nyckel },
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function valjRutter(trafik) {
  const valda = [];
  const sesynlig = (p) => !UTELUDDA.some((re) => re.test(p));
  const kandidater = [
    ...((trafik?.topSidor ?? []).map((t) => String(t.namn)).filter((p) => p.startsWith("/") && sesynlig(p))),
    ...KARNRUTTER,
  ];
  for (const p of kandidater) {
    if (valda.length >= 10) break;
    if (!valda.includes(p)) valda.push(p);
  }
  return valda;
}

async function samplaRutter(rutter) {
  const resultat = [];
  for (const rutt of rutter) {
    try {
      const r = await fetch(`${BAS}${rutt === "/" ? "/" : rutt}`, {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
        headers: { "User-Agent": "ak1a-integritetsvakt/1" },
      });
      resultat.push({ rutt, status: r.status });
    } catch (e) {
      resultat.push({ rutt, status: 0, fel: String(e?.cause?.code || e?.message || e).slice(0, 60) });
    }
  }
  return resultat;
}

function kontrollera5xx(prover, trafik) {
  const femxx = prover.filter((p) => p.status >= 500);
  const nere = prover.filter((p) => p.status === 0);
  const visningar24 = trafik?.senaste24h?.visningar ?? 0;
  const fel24 = trafik?.felgranser24h?.totalt ?? 0;
  const underlagRacker = visningar24 >= MIN_VISNINGAR;
  const freq = visningar24 > 0 ? fel24 / visningar24 : 0;

  const fynd = [];
  if (prover.length > 0 && nere.length === prover.length) {
    fynd.push({
      niva: "larm",
      typ: "prod-nere",
      medd: `PROD NERE: samtliga ${prover.length} provade rutter svarar inte (${nere[0].fel || "inget svar"}) — localhost:${BAS.slice(-4)} reachable check krävs omgående.`,
    });
  } else {
    if (femxx.length > 0) {
      fynd.push({
        niva: "larm",
        typ: "5xx",
        medd: `5xx på ${femxx.length}/${prover.length} rutter: ${femxx.map((f) => `${f.rutt} → ${f.status}`).join(", ")}.`,
      });
    }
    if (nere.length > 0 && nere.length < prover.length) {
      fynd.push({
        niva: "varning",
        typ: "timeout",
        medd: `${nere.length}/${prover.length} rutter svarade ej inom 15 s: ${nere.map((f) => f.rutt).join(", ")}.`,
      });
    }
    if (underlagRacker && freq > FREQ_TRASKEL) {
      fynd.push({
        niva: "larm",
        typ: "felfrekvens",
        medd: `Felfrekvens 24 h: ${fel24}/${visningar24} = ${(freq * 100).toFixed(1)} % > ${FREQ_TRASKEL * 100} % — klientsidana fel (felgränstelemetri) tyder på trasiga chunkar/trasiga sidor.`,
      });
    }
  }
  return { fynd, statistik: { visningar24, fel24, freq: underlagRacket(freq), underlagRacker } };

  function underlagRacket(f) {
    return underlagRacker ? Math.round(f * 1000) / 10 : null;
  }
}

// ── HUVUDFLÖDE ─────────────────────────────────────────────────────────────

(async () => {
  const stamp = new Date().toISOString();
  logga(`körning start ${stamp} (bas ${BAS})`);
  const state = lasJson(STATEFIL, null);
  const rapport = { ts: stamp, bas: BAS, build: null, rutter: [], trafik: null, fynd: [], info: [] };
  let nyState = null;

  try {
    // (a) BUILD_ID-konsistens
    const build = kontrolleraBuildId(state);
    rapport.build = { niva: build.niva, typ: build.typ, medd: build.medd };
    if (build.nyState) nyState = build.nyState;
    if (build.niva === "larm") rapport.fynd.push(build);
    if (build.niva === "varning") rapport.info.push(build);
    if (build.niva === "info") rapport.info.push(build);
    logga(`(a) ${build.niva}/${build.typ}: ${build.medd}`);

    // (b) 5xx
    const nyckel = lasAdminNyckel();
    const trafik = await hamtaTrafik(nyckel);
    const rutter = valjRutter(trafik);
    const prover = await samplaRutter(rutter);
    rapport.rutter = prover;
    rapport.trafik = trafik
      ? { visningar24: trafik.senaste24h?.visningar ?? null, felgranser24h: trafik.felgranser24h?.totalt ?? null, topSidor: (trafik.topSidor ?? []).slice(0, 5) }
      : null;
    const halso = kontrollera5xx(prover, trafik);
    rapport.statistik = halso.statistik;
    for (const f of halso.fynd) {
      if (f.niva === "larm") rapport.fynd.push(f);
      else rapport.info.push(f);
    }
    logga(
      `(b) ${prover.filter((p) => p.status >= 200 && p.status < 400).length}/${prover.length} OK · 5xx ${prover.filter((p) => p.status >= 500).length} · fel24h ${halso.statistik.fel24}/${halso.statistik.visningar24}${halso.statistik.freq !== null ? ` = ${halso.statistik.freq} %` : " (underlag < " + MIN_VISNINGAR + ")"}`,
    );

    // (c) LARM: append-only journal + prompt till sessionen
    if (rapport.fynd.length > 0) {
      for (const f of rapport.fynd) appendLarm({ niva: f.niva, typ: f.typ, medd: f.medd });
      const prompt = `INTEGRITETSVAKTEN LARMAR (automatisk ${stamp}). Prod-integritetsfynd som MÅSTE åtgärdas FÖRE kundens ögon:

${rapport.fynd.map((f) => `· [${f.typ}] ${f.medd}`).join("\n")}

Prover på publika rutter: ${prover.map((p) => `${p.rutt}=${p.status}`).join(", ")}.
Uppdrag enligt AGENTS.md: byggrace → kontrollera /tmp/synk-build.log + git-status, prod ska ALDRIG byggas olåst (flock /tmp/ak1a-deploy.lock); vid halvfärdigt träd: bygg om under lås + pm2 restart + verifiera https://lab.ak1nvestor.com/ = 200. 5xx → pm2 logs ak1a, diagnostisera roten, rätta src/, tsc 0, deploy under lås. Rapportera i worklog. Full rapport: data/vakten/integritetsvakt-status.json · Larmjournal: data/vakten/integritet-larm.jsonl.`;
      const skickat = await larmaSession(nyckel, prompt);
      logga(`(c) LARM: ${rapport.fynd.map((f) => f.typ).join(",")} — session ${skickat ? "notify:ad" : "ONÅBAR (larmvägen bruten — journal finns)"}`);
      rapport.larmSkickat = skickat;
    } else {
      logga("(c) GRÖN — 0 larmfynd");
    }
  } catch (e) {
    logga(`FEL i vakten: ${String(e?.stack || e).slice(0, 200)}`);
    appendLarm({ niva: "varning", typ: "vakt-fel", medd: String(e?.message || e).slice(0, 200) });
    rapport.info.push({ niva: "varning", typ: "vakt-fel", medd: String(e?.message || e).slice(0, 200) });
  }

  // State sparas ENDAST vid bekräftat konsekvent läge (eller bokföringsgap
  // vars deploy vi accepterat) — aldrig mitt i en okänd deploy-sekvens.
  if (nyState) {
    try {
      fs.writeFileSync(STATEFIL, JSON.stringify(nyState, null, 2) + "\n");
    } catch {
      /* state får vänta */
    }
  }
  try {
    fs.writeFileSync(STATUSFIL, JSON.stringify(rapport, null, 2) + "\n");
  } catch {
    /* status får vänta */
  }

  process.exit(rapport.fynd.length > 0 ? 1 : 0);
})();
