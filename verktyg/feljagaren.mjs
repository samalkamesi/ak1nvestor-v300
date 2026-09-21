#!/usr/bin/env node
/**
 * FELJÄGAREN (våg 167 — MEGA-systemet som söker fel i ALLT)
 * =====================================================================
 * Kunddirektiv: "Mega system som söker efter fel i olika system och
 * processer rättar utvecklar gör R&D — super seriöst med naturlagar."
 *
 * Sju jaktspår (varje spår: letar → hittar → bokför → flaggar för verkställning):
 *   F1 KOD:        tsc-fel, syntax-fel i verktyg (node --check)
 *   F2 PROCESSER:  pm2-status (online? restarts > tröskel?), zombie-barn
 *   F3 API:        alla /api/studio/* ändpunkter — HTTP-kod != 200
 *   F4 DATA:       register-konsistens (huvudtrad, mal-state, automations,
 *                  borta-banner: JSON giltigt? sessioner = sess_* prefix?)
 *   F5 LOGGAR:     senaste raderna i hjärtat/kraschvakten/evighetsmotorn —
 *                  FEL/krasch/tidsgräns-mönster
 *   F6 DRIFT:      prod 200? RAM? disk? (MemAvailable, df)
 *   F7 SECURITY:   .env-filer i git? nycklar i loggar? (grep-mönster)
 *
 * Körs: pumpor var 15:e minut (min % 15 === 12).
 * FYND ⇒ data/vakten/feljakt-fynd.jsonl + stdout [FELJÄGT ...].
 * Ren jakt ⇒ EN grön rad. Exit 0 alltid.
 * DEPLOYFÖNSTER (rond 44): medan flock /tmp/ak1a-deploy.lock hålls (prodbygg
 * pågår) klassas F3/F6-fel som MEDEL "väntat fönster" — appen är av deployen
 * väntat nere/omstartande (npm ci bygger om node_modules under levande pm2);
 * äkta fel utan aktivt bygg förblir HÖG. Fjärde falsklarmet i familjen
 * (rond 33/39/40/44) kurat i roten.
 * OMTESTFÖNSTER (rond 50, sjätte familjeobservationen): nätverksfel UTAN
 * aktivt bygg kan vara ett omstart-/lastspikfönster (09:13 UTC: /session
 * timeout 3 min efter pm2-omstart under RAM-svält 503 MB — självläkt på 41 ms
 * minuter senare). F3:nätverksfel omtestas ETT gången efter 20 s: svarar
 * endpointen då → MEDEL "övergående, självläkt vid omtest"; fortfarande död
 * → HÖG och resterande nätverksfel passeras utan omtest (snabbt genomlopp
 * vid äkta haveri). F3-vaccinet 2026-09-20: kaskadrader (passerade utan
 * eget omtest) taggas "(kaskad — ej egenmätt)" i fyndsträngen — FYNN:s
 * /andringar-eskalering 09-20 avvisad med återmätning 36/36 GRÖN.
 * ROT-SONDEN (FYNN nr 2, sjunde familjeobservationen 09-20 14:59Z): jakten
 * bokade HÖG i deployens EFTERDYNING — låset släppt men appen kall under
 * chrome-last; 20 s-omtestet räcker inte för kallstart. Nu: nätverksfel
 * bokförs HÖG endast när GET / svarar 200 inom 5 s (differentiell diagnos);
 * död rot ⇒ MEDEL "rot nere — miljöfönster", aldrig HÖG-eskalering.
 * Sondhärdning (eldprovets lärdom): endast framgång cachas + 1 omprövning —
 * keep-alive-racen får aldrig förfalska "rot nere" för en levande rot.
 * UPPVARMNINGSGRINDEN (FYNN nr 3, åttonde observationen 09-20 18:44Z): rot-
 * sonden har en beroendeblindfläck — GET / är en ren Next-yta medan
 * /api/studio/* går via transport-barnet (zcode-app-server-RPC). En app som
 * är minuter gammal (pm2-omstart vid deploy) grönar GET / medan den kalla
 * transporten under syskonlast timeout:ar — exakt 18:44Z-signaturen (11 min
 * efter deploy, rot 200, /andringar timeout ×2, frisk vid återmätning).
 * Kur: pm2 pm_uptime yngre än UPPVARMNING_MIN ⇒ MEDEL "efterdyning",
 * aldrig HÖG. Cron sätter ALDRIG AK1A_APP_ALDER_MIN — hooken finns endast
 * för eldprovet (_f3-vaccin-test.mjs) att styra åldern deterministiskt.
 * LAGAR: Lag 1 (bevis i varje rad), Lag 3 (bokför), Lag 6 (fel = lärdom).
 */
import { execSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");
const FYND = process.env.AK1A_FYND_SOKVAG || path.join(VAKT, "feljakt-fynd.jsonl");
const NYCKELN = "ADMIN" + "_PASSWORD";
const BAS = process.env.AK1A_BAS_URL || "http://localhost:3000";

function lasPass() {
  try {
    const rad = fs
      .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
      .split("\n")
      .find((r) => r.startsWith(NYCKELN + "="));
    return rad ? rad.slice(NYCKELN.length + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch { return ""; }
}

function bokfor(spår, allvar, fynd, bevis) {
  const rad = JSON.stringify({ ts: new Date().toISOString(), spår, allvar, fynd, bevis });
  try {
    fs.mkdirSync(VAKT, { recursive: true });
    fs.appendFileSync(FYND, rad + "\n");
  } catch { /* */ }
  console.log(`[FELJÄGT ${allvar}] ${spår}: ${fynd} — ${bevis}`);
}

function gron(spår, not) { console.log(`[FELJÄGT GRÖN] ${spår}: ${not}`); }

// Deploybyggen (prod-synk.mjs "flock -w 900", deploya-contabo.sh "flock -n")
// håller låset under hela npm ci + build + pm2 restart — i det fönstret är
// appen väntat osvarande. Feljägten ska larma HÖG endast utan aktivt bygg.
function deployPagar() {
  try {
    execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"], { timeout: 5000 });
    return false;                          // låset togs → inget bygg pågår
  } catch (e) { return e.status === 1; }   // exit 1 = hålls av bygg; övrigt = ej deploy
}

// UPPVARMNINGSGRINDEN (FYNN nr 3): appens ålder i minuter sedan senaste
// pm2-omstart (pm_uptime, samma jlist-källa som F2). null = pm2 ej läsbar
// ⇒ grinden inaktiveras och rot-sonden ensam gäller (försiktigt fallback).
// AK1A_APP_ALDER_MIN sätts ENDAST av eldprovet — cron-miljön bär den aldrig.
const UPPVARMNING_MIN = 25;
export function hamtaAppAlderMin() {
  const over = process.env.AK1A_APP_ALDER_MIN;
  if (over !== undefined && over !== "" && Number.isFinite(Number(over))) return Number(over);
  try {
    const lista = JSON.parse(execFileSync("pm2", ["jlist"], { timeout: 15_000, encoding: "utf8" }));
    const ak1a = lista.find((p) => p.name === "ak1a");
    const upp = ak1a?.pm2_env?.pm_uptime;
    return typeof upp === "number" && upp > 0 ? (Date.now() - upp) / 60_000 : null;
  } catch { return null; }
}

// BELASTNINGSGRINDEN (FYNN nr 4, 2026-09-21 06:44:23Z): åldergrinden täcker
// KALL transport — men 06:44Z-signaturen bevisade att en VARM app (87 min
// efter deploy 05:17) timeout:ar när SERVERN är mättad: /api/studio/* går
// via transport-barnets RPC vars node-process svälvs när minnet tar slut
// (fabrikens zcode-barn ~0,8–1,1 GB/styck + chrome-cron). Beviskedjan:
// rot 200 + omtest dött + 1129–1351 MB tillgängligt (prod-synk.log 06:37/
// 06:47) + 36/36 äkta 200 vid återmätning när barnet dog. Diagnos: MEDEL
// "server mättad — transport-RPC svält", aldrig HÖG, när (a) MemAvailable
// < MATTAD_MB eller (b) ≥ 2 zcode-barn (fabriksomgång). Hooken
// AK1A_TEST_SERVERLAST bär JSON {"ramMB":…, "zcodeBarn":…} — ENDAST
// eldprovet sätter den (cron-miljön bär den aldrig, samma doktrin som
// AK1A_APP_ALDER_MIN).
const MATTAD_MB = 1500;
export function hamtaServerLast() {
  const over = process.env.AK1A_TEST_SERVERLAST;
  if (over) {
    try { return JSON.parse(over); } catch { /* ogiltig hook — fall igenom på riktiga mätningen */ }
  }
  let ramMB = null;
  try {
    const m = fs.readFileSync("/proc/meminfo", "utf8").match(/^MemAvailable:\s+(\d+) kB/m);
    if (m) ramMB = Math.round(Number(m[1]) / 1024);
  } catch { /* null = omätbart */ }
  let zcodeBarn = null;
  try {
    const rader = execFileSync("ps", ["-eo", "args="], { encoding: "utf8", timeout: 10_000 }).split("\n");
    zcodeBarn = rader.filter((r) => r.includes(".zcode")).length;
  } catch { /* null = omätbart */ }
  return { ramMB, zcodeBarn };
}
export function arMattaServer(last) {
  if (!last || typeof last !== "object") return { mattad: false, detalj: "last obestämbär" };
  const delar = [];
  if (typeof last.ramMB === "number" && last.ramMB < MATTAD_MB) delar.push(`${last.ramMB} MB tillgängligt (< ${MATTAD_MB})`);
  if (typeof last.zcodeBarn === "number" && last.zcodeBarn >= 2) delar.push(`${last.zcodeBarn} zcode-barn (fabriksomgång)`);
  return { mattad: delar.length > 0, detalj: delar.join(" + ") || "luftigt minne, ingen fabriksomgång" };
}

// ── F1: KOD ─────────────────────────────────────────────────────────────────
// Loopkärnan exporterad (o80, kraschvaktens planeraAtguard-mönster) — ren och
// testbar via injicerade beroenden: kontroll(fil) kastar vid fel, sov()
// väntar vid fynd, bokför/grön är rapportvägarna. Returnerar antal BESTÅENDE
// syntaxfel.
// AKTIVT-SKRIVFÖNSTER-KLASSEN (o80): repot är en levande fabrik — syskon
// skriver om verktygsfiler medan jakten provar, och en halvskriven fil ger
// ett KORREKT node --check-fel just då men ett FALSKT fynd på träd-nivån.
// Bevis: 25-fyndssalvan mot testa-ai-mentor-*.mjs 2026-09-18T10:12Z exakt
// under spår 6:s svitharmonisering av samma svit (samtliga 25 gröna vid
// ommätning, fynden aldrig återkomna) + _s2u2o16-append 19:57Z mitt i
// s2-u2:s skrivfönster. Kur = filens egna precedenser tillämpade på syntax:
// F3:s omtest (rond 50) och tsc:s andra chans (r39-vaccinet) — vid fel
// återmäts filen EN gång efter vänta; bestående fel bokförs, självläkt fil
// tigger (stdout-not, ingen journalrad — halvskriven fil har ingen
// kundpåverkan att bokföra, till skillnad från F3:s nere-endpoint).
export async function jagaVerktygSyntax(filer, beroenden) {
  const {
    kontroll,
    sov,
    bokfor: rapportera = bokfor,
    gron: gronRapport = gron,
  } = beroenden;
  let trasiga = 0;
  for (const f of filer) {
    let fel = null;
    try { await kontroll(f); } catch (e) { fel = e; }
    if (!fel) continue;
    // Diagnosåtskillnad (o21): timeout vid systemlast är INTE syntaxfel —
    // första alltid-på-körningen felmärkte en lasttimeout som syntaxfel
    // (filen ren vid omkolla, fyndet aldrig reproducerat).
    const timeout = Boolean(fel && (fel.killed || fel.signal === "SIGTERM" || fel.code === "ETIMEDOUT"));
    if (timeout) {
      rapportera("F1-kod", "MEDEL", `okontrollerad (timeout): ${f}`, "node --check hann inte inom 10 s — lastrelaterat, omkollas nästa jakt");
      continue;
    }
    await sov();
    let kvarstar = true;
    try { await kontroll(f); kvarstar = false; } catch { kvarstar = true; }
    if (kvarstar) {
      trasiga++;
      rapportera("F1-kod", "MEDEL", `syntaxfel: ${f}`, "node --check misslyckades även vid återmätning");
    } else {
      gronRapport("F1-kod", `${f}: transient syntax — återhämtad vid återmätning (aktivt skrivfönster, inget fynd)`);
    }
  }
  if (trasiga === 0) gronRapport("F1-kod", `${filer.length} verktyg syntax-OK`);
  return trasiga;
}

async function jagaKod() {
  // tsc är tungt (2+ min) — kör ENDAST om src/ ändrats sedan senaste jakt
  const tscMarkor = path.join(VAKT, ".feljakt-tsc-stamp");
  const senaste = fs.existsSync(tscMarkor) ? fs.readFileSync(tscMarkor, "utf8").trim() : "";
  let srcAndrad = false;
  let gitTopp = "";
  try {
    gitTopp = execFileSync("git", ["log", "-1", "--format=%H", "--", "src/"], { cwd: ROT, timeout: 15_000, encoding: "utf8" }).trim();
    srcAndrad = gitTopp !== senaste;
  } catch { srcAndrad = true; }
  // Verktyg: node --check på samtliga — skalfri arrayform (o21); körs ALLTID:
  // blocket låg tidigare EFTER src-hoppar-returnen = tyst död (krävde att
  // src/ samtidigt ändrats); head-40-taket borttaget samtidigt — verktyg/
  // har 117 filer, taket lämnade 77 okontrollerade medan gröna raden
  // lurade "40 syntax-OK".
  try {
    const filer = execFileSync("find", ["verktyg", "-name", "*.mjs"], { cwd: ROT, timeout: 15_000, encoding: "utf8" }).trim().split("\n").filter(Boolean);
    await jagaVerktygSyntax(filer, {
      kontroll: (f) => execFileSync(process.execPath, ["--check", f], { cwd: ROT, timeout: 10_000, stdio: "pipe" }),
      sov: () => new Promise((uppl) => setTimeout(uppl, 15_000)),
    });
  } catch { /* finder misslyckades */}
  if (!srcAndrad) { gron("F1-kod", "src/ oändrad sedan senaste tsc — hoppar"); return; }
  // r39-vaccin (2026-09-15): mät ALDRIG tsc under deployfönstret — npm ci
  // river node_modules partiellt och transitiva @types (recharts d3-paket)
  // försvinner minutvis ⇒ falska TS2688 (bevis: F1 20:27:21Z, bygg slut
  // 20:39:22Z, grönt vid ommätning). Alla byggvägar håller deploylåset.
  try {
    execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "-c", "true"], { timeout: 5_000, stdio: "pipe" });
  } catch {
    gron("F1-kod", "hoppar — deployfönster aktivt (npm ci river node_modules)");
    return;
  }
  try {
    // s8-determinism (2026-09-15, syskonmönstret ur pre-commit): projektets
    // EGEN tsc-binär, ALDRIG npx — mitt i ett deployfönster (npm ci river
    // node_modules) kan npx lösa "tsc" till cachens dummy tsc@2.0.4 som
    // alltid svarar grönt (falsk F1-grön). Saknad binär ⇒ "Cannot find
    // module" blir F1-fynd i stället för tystnad.
    // Skalforms-ekvivalens (o133): "tsc … 2>&1 | head -5" omgjord i node —
    // pipe:ns exit-0-bevarande (head slukade tsc:s felkod) ersätts av en
    // try/catch som returnerar stdout+stderr kapat till 5 rader, så feltexten
    // når TS2688/2307-grenen och "kraschade"-yttercatchen som förr.
    const korTsc = () => {
      const topp5 = (t) => String(t ?? "").split("\n").slice(0, 5).join("\n").trim();
      try {
        return topp5(execFileSync(process.execPath, ["node_modules/typescript/bin/tsc", "--noEmit"], { cwd: ROT, timeout: 300_000, encoding: "utf8" }));
      } catch (e) { return topp5((e.stdout ?? "") + (e.stderr ? "\n" + e.stderr : "")); }
    };
    let fel = korTsc();
    if (fel && !fel.includes("0") && /^error TS(2688|2307)/m.test(fel)) {
      // TS2688/TS2307 = race-signatur för partiell node_modules (npm ci hann
      // mitt i trots låsproben): en andra chans efter väntan — kvarstår
      // felet är det äkta och bokförs HÖG nedan som vanligt.
      execFileSync("sleep", ["75"], { timeout: 90_000 });
      fel = korTsc();
    }
    if (fel && !fel.includes("0")) {
      bokfor("F1-kod", "HÖG", `tsc: ${fel.split("\n").length} fel`, fel.slice(0, 200));
    } else {
      gron("F1-kod", `tsc 0 fel (commit ${senaste.slice(0, 8)}→${gitTopp?.slice(0, 8) || "?"})`);
      try { fs.writeFileSync(tscMarkor, gitTopp || ""); } catch {}
    }
  } catch (e) {
    bokfor("F1-kod", "HÖG", "tsc kraschade", String(e).slice(0, 120));
  }
}

// ── F2: PROCESSER ────────────────────────────────────────────────────────────
function jagaProcesser() {
  try {
    const lista = JSON.parse(execFileSync("pm2", ["jlist"], { timeout: 15_000, encoding: "utf8" }));
    for (const p of lista) {
      if (p.pm2_env?.status !== "online") {
        bokfor("F2-process", "HÖG", `${p.name} = ${p.pm2_env?.status}`, `restarts: ${p.pm2_env?.restart_time}`);
      }
    }
    const onlines = lista.filter((p) => p.pm2_env?.status === "online").length;
    if (onlines === lista.length) gron("F2-process", `${onlines}/${lista.length} pm2-processer online`);
    // Zombie-zcode (mv. många barn = RAM-risk)
    // Zombie-zcode (mv. många barn = RAM-risk) — "pgrep -c zcode || echo 0"
    // omgjord (o133): pgrep exit 1 = noll träffar (stdout "0"), övrigt fel
    // kastas vidare till F2-catchen som förr.
    const zcode = (() => {
      try {
        return execFileSync("pgrep", ["-c", "zcode"], { timeout: 10_000, encoding: "utf8" }).trim();
      } catch (e) {
        if (e && e.status === 1) return String(e.stdout ?? "").trim() || "0";
        throw e;
      }
    })();
    if (parseInt(zcode) > 40) {
      bokfor("F2-process", "MEDEL", `${zcode} zcode-barn (RAM-risk)`, `pgrep -c zcode`);
    }
  } catch (e) { bokfor("F2-process", "MEDEL", "pm2 jlist misslyckades", String(e).slice(0, 80)); }
}

// ── F3: API ──────────────────────────────────────────────────────────────────
export async function jagaApi(pass) {
  const andpunkter = [
    "puls", "halsa", "modeller", "fardigheter", "filer", "minne",
    "anvandning", "andringar", "interaktion", "subagenter", "audit",
    "godkannande", "maskin", "mal/status", "session", "uppladdning",
    "tjanster/automation", "tjanster/bakgrund",
  ];
  let fel = 0;
  const deploy = deployPagar();
  const alderMin = hamtaAppAlderMin();
  const matta = arMattaServer(hamtaServerLast());
  // Rond 50: server som nätverksfelar utan bygg omtestas en gång — svarar den
  // efter 20 s var fyndet övergående (MEDEL), annars HÖG utan fler omtest.
  let serverDodVidOmtest = false;
  // FYNN nr 2-VACCINET 2026-09-20 (differentiell diagnos): nätverksfel FÅR
  // bokföras HÖG endast när appens ROT lever (GET / 200 inom 5 s). Beviset
  // som födde regeln: 14:59Z-jakten bokade HÖG "/andringar TimeoutError +
  // omtest misslyckades" i deployens EFTERDYNING — låset var släppt (rond
  // 44-grinden passerd) men pm2-omstarten lämnat appen kall under s7:s
  // chrome-last; rond 50-omtestet (20 s) räcker inte för kallstart. Äkta
  // mätning 36/18×2 GRÖN både före och efter. Död rot = miljöfönster ⇒
  // MEDEL (aldrig HÖG-eskalering), oavsett orsak (deploy-efterdyning,
  // OOM-omstart, överlast).
  let rotLevande = null;
  const rotLev = async () => {
    // Endast FRAMGÅNG cachas: ett sondmisslyckande får aldrig klistra "rot
    // nere" för hela jakten (eldprovets fall 2: keep-alive-race — undici
    // tilldelar sondens GET / en socket som servern just förstörde efter
    // API-felet ⇒ falsk negativ som utan omprövning degraderade 18 äkta
    // fel till miljöfönster). Misslyckande omprövas vid nästa sondanrop.
    if (rotLevande === true) return true;
    for (let forsok = 0; forsok < 2; forsok++) {
      try {
        const r = await fetch(`${BAS}/`, { signal: AbortSignal.timeout(5_000) });
        if (r.status === 200) { rotLevande = true; return true; }
      } catch {}
      await new Promise((sov) => setTimeout(sov, 250));
    }
    rotLevande = false;
    return false;
  };
  const omtest = async (v) => {
    await new Promise((sov) => setTimeout(sov, 20_000));
    try {
      const r = await fetch(`${BAS}/api/studio/${v}`, {
        headers: { "x-admin-password": pass },
        signal: AbortSignal.timeout(15_000),
      });
      return r.status === 200;
    } catch { return false; }
  };
  for (const v of andpunkter) {
    try {
      const r = await fetch(`${BAS}/api/studio/${v}`, {
        headers: { "x-admin-password": pass },
        signal: AbortSignal.timeout(15_000),
      });
      if (r.status !== 200) {
        fel++;
        if (deploy) bokfor("F3-api", "MEDEL", `/${v} → ${r.status} (deploybygg pågår)`, "väntat fönster: /tmp/ak1a-deploy.lock hålls");
        else bokfor("F3-api", "HÖG", `/${v} → ${r.status}`, `HTTP-kod != 200`);
      }
    } catch (e) {
      fel++;
      if (deploy) {
        bokfor("F3-api", "MEDEL", `/${v} ej mätbar (deploybygg pågår)`, "väntat fönster: /tmp/ak1a-deploy.lock hålls");
      } else if (alderMin !== null && alderMin < UPPVARMNING_MIN) {
        bokfor("F3-api", "MEDEL", `/${v} nätverksfel (efterdyning — appen ${Math.round(alderMin)} min gammal)`, `pm2-omstart < ${UPPVARMNING_MIN} min: kall transport under syskonlast (18:44Z-klassen, FYNN nr 3-grinden 2026-09-20); första felet: ${String(e).slice(0, 40)}`);
      } else if (serverDodVidOmtest) {
        bokfor("F3-api", "HÖG", `/${v} nätverksfel (kaskad — ej egenmätt)`, `${String(e).slice(0, 60)} (server död vid omtest — inget nytt; f3-vaccinet 2026-09-20: kaskadrader taggas så eskaleringar skiljer mätta från kaskadbokförda)`);
      } else {
        const rotOK = await rotLev();
        if (!rotOK) {
          bokfor("F3-api", "MEDEL", `/${v} nätverksfel (rot nere — miljöfönster)`, `GET / svarar ej 200 inom 5 s: appen nere/kall (deploy-efterdyning · omstart · överlast) — ej API-specifikt, FYNN nr 2-vaccinet 2026-09-20; första felet: ${String(e).slice(0, 40)}`);
        } else if (matta.mattad) {
          // FYNN nr 4-BELASTNINGSGRINDEN: rot lever men servern är mättad —
          // transport-barnets RPC svälvs under syskonlast (06:44Z-klassen).
          // MEDEL utan omtest (20 s × 18 ändpunkter = 6 min onödig väntan på
          // en redan dominerad miljödiagnos); dom-kön återmäter när lasten
          // släppt — 06:44-fallet var 36/36 grönt ~10 min senare.
          bokfor("F3-api", "MEDEL", `/${v} nätverksfel (server mättad — transport-RPC svält)`, `${matta.detalj}: varm app${alderMin !== null ? ` (${Math.round(alderMin)} min)` : ""} men transport-barnet svälvs under syskonlast (06:44Z-klassen, FYNN nr 4-grinden 2026-09-21); första felet: ${String(e).slice(0, 40)} — dom: miljö, återmät när lasten släppt`);
        } else {
          const levde = await omtest(v);
          if (levde) bokfor("F3-api", "MEDEL", `/${v} övergående nätverksfel — självläkt`, `omtest OK efter 20 s (första: ${String(e).slice(0, 40)})`);
          else {
            serverDodVidOmtest = true;
            bokfor("F3-api", "HÖG", `/${v} nätverksfel`, `${String(e).slice(0, 60)} + omtest misslyckades (rot LEVER — äkta API-fel, ej miljö)`);
          }
        }
      }
    }
  }
  if (fel === 0) gron("F3-api", `${andpunkter.length}/${andpunkter.length} ändpunkter 200`);
}

// ── F4: DATA ─────────────────────────────────────────────────────────────────
function jagaData() {
  const filer = [
    ["huvudtrad.json", (j) => Array.isArray(j.sessioner)],
    ["mal-state.json", (j) => typeof j.mal === "string" || j === null],
    ["automations.json", (j) => Array.isArray(j.automationer)],
  ];
  let ok = 0;
  for (const [namn, validd] of filer) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(VAKT, namn), "utf8"));
      if (validd(j)) ok++;
      else bokfor("F4-data", "MEDEL", `${namn}: ogiltig struktur`, "valideringsfunktion false");
    } catch (e) {
      if (e.code === "ENOENT") ok++; // filen får saknas
      else bokfor("F4-data", "MEDEL", `${namn}: JSON-parse fel`, String(e).slice(0, 60));
    }
  }
  if (ok === filer.length) gron("F4-data", `${ok}/${filer.length} register giltiga`);
}

// ── F5: LOGGAR ───────────────────────────────────────────────────────────────
// ROTORSAKSFIX (spår 8 2026-09-15, bevis i data/forskning/OPTIMERING/
// o11-feljakt-f5-rotorsaksfix.md). Tre felklasser i gamla F5:
//   (1) ÅTERLEVERANS: sista 5 raderna om-skannades var 15:e minut utan
//       minne — samma gamla felrad bokfördes som nytt fynd tills 5 nya
//       rader trängde undan den (kraschvaktens KRASCHLOOP-rad 14:24
//       återlevererades 14:27+14:42+14:57; ROND 34:s manuell sondering).
//   (2) BLINT BEVIS: svans.slice(-80) visade svansens SLUT oavsett vilken
//       rad som matchat — beviset kunde visa frisk text ("svarar=true").
//   (3) SKIFTLÄGES-FP: /FEL[: ]/i matchade information ("tsc 0 fel (",
//       "ej kodfel:") — äkta felmarkörer i dessa loggar är VERSALA
//       (FEL:, FEL 502, STATUS-FEL, KRASCHLOOP).
// Dessutom dödades ett falskt negativ: tail-5 missade fel i loggar som
// växer >5 rader per intervall (agentfabrik/logg.jsonl växer på sekunder).
const LOGG_MONSTER = [
  /FEL[: ]/,        // versal felmarkör — skiftlägeskänslig mot "0 fel (", "kodfel:"
  /KRASCH/,         // kraschvaktens KRASCHLOOP-MISSTANKE-rader
  /tidsgräns.*nåddes/i,
  /Cannot access.*before initialization/i,
  /ENOENT.*route/i,
  /misslyckades/i,  // prod-synkens "…-SYNK MISSLYCKADES (smutsigt träd?…)" — live-bevisad 2026-09-15
];
// "evighetsmotor.log" — inte "evighetsmotor-logg": verktyget skriver till
// .log (evighetsmotor.mjs:27); gamla F5 bevakade ett namn som aldrig funnits
// ⇒ evighetsmotorns logg var tyst obevakad sedan våg 167.
const LOGG_FILER = ["hjartslag.log", "kraschvakt.log", "evighetsmotor.log", "prod-synk.log", "agentfabrik/logg.jsonl"];
const LOGG_STAMP = path.join(VAKT, ".feljakt-logg-positioner.json");

function jagaLoggar(vaktDir, rapportera, gronRapport) {
  const dir = vaktDir || VAKT;
  const stampSokvag = vaktDir ? path.join(dir, ".feljakt-logg-positioner.json") : LOGG_STAMP;
  const bokf = rapportera || bokfor;
  const gronF = gronRapport || gron;
  let pos = {};
  try { pos = JSON.parse(fs.readFileSync(stampSokvag, "utf8")); } catch { /* första körningen */ }
  let fynd = 0, skanadeRader = 0;
  for (const lf of LOGG_FILER) {
    try {
      const rader = fs.readFileSync(path.join(dir, lf), "utf8").split("\n");
      if (rader.length && rader[rader.length - 1].trim() === "") rader.pop();
      const senast = typeof pos[lf] === "number" ? pos[lf] : -1;
      // Ingen position (första körningen) eller truncering/rotation (färre
      // rader än minnet): sista 5 raderna EN gång — gamla F5:s enda pass,
      // därefter skannas enbart nya rader och varje rad exakt en gång.
      let start = senast;
      if (senast < 0 || senast > rader.length) start = Math.max(0, rader.length - 5);
      for (const rad of rader.slice(start)) {
        skanadeRader++;
        for (const m of LOGG_MONSTER) {
          if (m.test(rad)) {
            fynd++;
            bokf("F5-logg", "MEDEL", `${lf}: felmönster på ny rad`, `${m} → ${rad.slice(0, 120)}`);
            break;
          }
        }
      }
      pos[lf] = rader.length;
    } catch { /* loggen får saknas */ }
  }
  try {
    const tmp = stampSokvag + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(pos));
    fs.renameSync(tmp, stampSokvag);
  } catch { /* positionsminnet är en optimering, ej ett krav */ }
  if (fynd === 0) gronF("F5-logg", `${LOGG_FILER.length} loggar — ${skanadeRader} nya rader skannade, 0 fynd`);
}

// ── F6: DRIFT ────────────────────────────────────────────────────────────────
async function jagaDrift(pass) {
  try {
    const r = await fetch(`${BAS}/`, { signal: AbortSignal.timeout(15_000) });
    if (r.status !== 200) {
      if (deployPagar()) bokfor("F6-drift", "MEDEL", `prod → ${r.status} (deploybygg pågår)`, "väntat fönster: /tmp/ak1a-deploy.lock hålls");
      else bokfor("F6-drift", "HÖG", `prod → ${r.status}`, "HTTP-kod != 200");
    } else gron("F6-drift", `prod ${r.status}`);
  } catch (e) {
    if (deployPagar()) bokfor("F6-drift", "MEDEL", "prod osvarar — deploybygg pågår", "väntat fönster: /tmp/ak1a-deploy.lock hålls");
    else bokfor("F6-drift", "HÖG", "prod osvarar", String(e).slice(0, 60));
  }
  try {
    const mem = fs.readFileSync("/proc/meminfo", "utf8").match(/MemAvailable:\s+(\d+)/);
    const mb = mem ? Math.round(parseInt(mem[1]) / 1024) : 0;
    if (mb < 300) bokfor("F6-drift", "HÖG", `RAM ${mb} MB`, "MemAvailable < 300 MB");
    else if (mb < 800) bokfor("F6-drift", "MEDEL", `RAM ${mb} MB`, "MemAvailable < 800 MB");
    else gron("F6-drift", `RAM ${mb} MB`);
  } catch { /* */}
  try {
    // "df / | tail -1 | awk '{print $5}'" omgjord (o133): sista raden,
    // femte whitespace-kolumnen = Use%-fältet.
    const dfRader = execFileSync("df", ["/"], { timeout: 10_000, encoding: "utf8" }).trim().split("\n");
    const disk = ((dfRader[dfRader.length - 1] ?? "").split(/\s+/)[4] ?? "");
    const procent = parseInt(disk);
    if (procent > 85) bokfor("F6-drift", "MEDEL", `disk ${procent}%`, "df / > 85%");
    else gron("F6-drift", `disk ${procent}%`);
  } catch { /* */}
}

// ── F7: SECURITY ─────────────────────────────────────────────────────────────
// s8-härdning (2026-09-15) — tre konstruktionsbrister kurade:
// (1) BEVIS får ALDRIG bära träffraden: gamla bokfor skrev grep-resultatet
//     (med nyckelns 12 första tecken) in i feljakt-fynd.jsonl — som F7:s
//     EGEN sökning skannar varje jakt ⇒ en äkta träff hade blivit en
//     självreplikerande nyckelläcka som aldrig kan gröna. Nu: endast fil:rad.
// (2) Täckning: gamla globben data/vakten/*.log *.jsonl såg ENBART
//     toppnivåfilerna — agentfabrikens underkataloger (ko/status/utdata med
//     barnens fulla svar!) och .json/.txt var blinda fläckar. Nu: rekursivt,
//     alla filtyper.
// (3) Skal-frihet: prefixet interpolerades i ett execSync-kommando — citation
//     i lösenordet hade brutit sökningen. Nu: in-process-sökning, värdet lämnar
//     aldrig processen förrän matchat som radnummer.
function sokNyckel(katalog, prefix) {
  const traff = [];
  let filer = 0;
  (function vand(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { vand(p); continue; }
      filer++;
      let txt = "";
      try { txt = fs.readFileSync(p, "utf8"); } catch { continue; }
      const rader = [];
      txt.split("\n").forEach((rad, i) => { if (rad.includes(prefix)) rader.push(i + 1); });
      if (rader.length) traff.push({ fil: path.relative(ROT, p), rader: rader.slice(0, 3), antal: rader.length });
    }
  })(katalog);
  return { traff, filer };
}

function jagaSecurity() {
  // .env i git?
  try {
    // "git ls-files … 2>/dev/null || echo NEJ" omgjord (o133): ospårad ⇒
    // exit 1 + tom stdout ⇒ NEJ; spårad ⇒ filnamnet ⇒ KRITISK-grenen.
    const tracked = (() => {
      try {
        return execFileSync("git", ["ls-files", "--error-unmatch", ".env.production.local"], {
          cwd: ROT, timeout: 10_000, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
        }).trim() || "NEJ";
      } catch (e) { return String(e.stdout ?? "").trim() || "NEJ"; }
    })();
    if (tracked !== "NEJ") bokfor("F7-security", "KRITISK", ".env.production.local är git-spårad!", "git ls-files");
    else gron("F7-security", ".env ej i git");
  } catch { /* */}
  // Nycklar i vakt-ytan?
  try {
    const pass = lasPass();
    if (pass && pass.length > 5) {
      const { traff, filer } = sokNyckel(VAKT, pass.slice(0, 12));
      if (traff.length) {
        const bevis = traff.slice(0, 3).map((t) => `${t.fil}:${t.rader.join(",")}`).join(" | ");
        bokfor("F7-security", "KRITISK", `admin-nyckel i vakt-ytan — ${traff.length} fil(er) av ${filer}!`, bevis);
      } else gron("F7-security", `nyckel ej i vakt-ytan (${filer} filer, rekursivt)`);
    }
  } catch { /* */}
}

async function main() {
  // Isolerat testläge: `node verktyg/feljagaren.mjs --f5-test <katalog>` kör
  // ENDAST F5-spåret mot katalogen (fynd till stdout, positionsminne i
  // katalogen) — pumpornas anrop har inga argument och berörs ej.
  if (process.argv[2] === "--f5-test") {
    const dir = path.resolve(process.argv[3] || ".");
    let antal = 0;
    jagaLoggar(
      dir,
      (sp, allvar, f, b) => { antal++; console.log(`[TEST-FYND ${allvar}] ${f} — ${b}`); },
      (sp, not) => console.log(`[TEST-GRÖN] ${sp}: ${not}`),
    );
    console.log(`[TEST KLAR] fynd=${antal}`);
    return;
  }
  // Isolerat testläge: `node verktyg/feljagaren.mjs --f7-test <katalog>` kör
  // ENDAST F7:s nyckelsökning mot katalogen med ett fast TEST-prefix (aldrig
  // ett riktigt värde) — fynd till stdout, fyndloggen orörd.
  if (process.argv[2] === "--f7-test") {
    const dir = path.resolve(process.argv[3] || ".");
    const TESTPREFIX = "TESTNYCKEL999";
    const { traff, filer } = sokNyckel(dir, TESTPREFIX);
    for (const t of traff) console.log(`[TEST-FYND F7] ${t.fil} rader=${t.rader.join(",")} antal=${t.antal}`);
    console.log(`[TEST KLAR] filer=${filer} traff=${traff.length}`);
    return;
  }
  const pass = lasPass();
  if (!pass) { console.log("[FELJÄGAREN] PASS SAKNAS — sover"); return; }
  console.log(`[FELJÄGAREN] startar ${new Date().toISOString().slice(11, 19)} — 7 spår`);
  await jagaKod();
  jagaProcesser();
  await jagaApi(pass);
  jagaData();
  jagaLoggar();
  await jagaDrift(pass);
  jagaSecurity();
  console.log("[FELJÄGAREN] klar — fynd i " + FYND);
}

// Huvudmodulvakt (o80): pumporna kör `node verktyg/feljagaren.mjs` (argv[1]
// = denna fil ⇒ main körs); testverktygen importerar kärnorna utan att
// jakten startar.
const arHuvudmodul = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (arHuvudmodul) {
  main().catch((fel) => { bokfor("FELJÄGAREN", "HÖG", "krasch", String(fel).slice(0, 120)); });
}
