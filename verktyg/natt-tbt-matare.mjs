#!/usr/bin/env node
/**
 * AK1A — o151 (Spår 7, s7-u3): NATT-TBT-MÄTAREN — o144 §5 / o139 §7.2:s
 * enda öppna post: TBT /kalkylator ≤ ~450 kan endast domas i nattfönster
 * (metrologiregeln o143 §3: TBT jämförbar ENDAST inom samma lastfönster;
 * FÖRE-basen o139-fore är nattmätt 2026-09-21T06:03Z; o144-efter 17:53Z
 * var dagmätt i fabrikstrafik = ogiltig jämförelse).
 *
 * Kontrakt (o144-väntarmönstret — JSON-fakta endast, bokföring av levande
 * våg, ALDRIG från bakgrundsprocess):
 *   Steg 0  RAM-vakt: MemAvailable ≥ 1 500 MB (annars avbrott, exit 2)
 *   Steg 0b LASTVAKT (o155 vakarövertag): nattfönstrets tysthet MÄTS
 *           (CPU-beläggning ur /proc/stat-delta + loadavg + cpuKalibMs-
 *           kalibreringsprob + antal zcode-barn). NATT-läge VÄNTAR upp till
 *           12 min på en tyst slice (busy < 30 % OCH loadavg1 < 1,5) —
 *           annars "avbruten-last" exit 2. SOND-läge bokför endast fakta.
 *           BAKGRUND: o151-natt (2026-09-23) domade RÖD TBT 8 779/5 669 i
 *           ett lastat fönster — ALLA main-thread-kategorier skalade
 *           enhetligt ~3x mot o139-fore utan ett enda nytt script =
 *           mätmiljö, ej kod (o155 §2). Organismen kör 24/7 sedan kundens
 *           direktiv — "natt = tyst"-premissen (o143 §3) hålls bara med
 *           lastvakt. Återprob efter värmningen (1b) — natt avbryter om
 *           lasten återvänt. STEG 2B (o158, s7-u1 vakarövertag): slutprob
 *           EFTER Lighthouse-körningen — det bevisade hålet: efter-vaktens
 *           dom 2026-09-24T00:52Z bar lastOK=true men TBT 16 413 (värre än
 *           98 %-lastfönstret) med kalib-drift 64,5→109,5 ms UNDER fönstret
 *           = lasten återkom efter sista proben (1b). 2b provar tysthet +
 *           kalib-drift-kvot vid mätningens slut; natt ogiltigförklarar
 *           domen vid smyglast (exit 2 — ALDRIG röd dom på ogiltigt
 *           fönster). Sond bokför endast fakta. REST (ärligt): pulserande
 *           last avslutad före slutproben syns ej — post-hoc-kvotdiagnos
 *           (o155 §5.3) täcker när tyst kalib-referens etablerats.
 *   Steg 1  prod 200-preflight: /superanalys + /kalkylator på localhost
 *   Steg 2  kanoniska prestanda-lighthouse.mjs med LH_JAMFOR=o139-fore
 *           (värmning sköts av verktygets egen körning)
 *   Steg 3  maskinell dom mot o139 §7.2: CLS 0 ×2 (heligt) · LCP ±15 %
 *           per sida · TBT /kalkylator ≤ 450 (ENDAST natt-läge) ·
 *           /superanalys poäng-band ±8 av 73 (tolkning av §7.2:s
 *           "oförändrad ±" — brusband, dokumenterat i o151-protokollet)
 *
 * Lägen:
 *   node verktyg/_s7u3o151-natt-tbt.mjs           — NATT-läge (cron 03:2x)
 *   node verktyg/_s7u3o151-natt-tbt.mjs --sond    — dagkörning: verifierar
 *                   pipelinen; TBT-kriteriet märs "sond — ej dom" (dagen
 *                   rättfärdigar ingen TBT-dom enligt metrologiregeln)
 *   --namn=<x>  — kör under eget namn (utdata <x>-* / dom-<x>.json) för
 *                 separata vaktade körningar utan att röra natt-cronens
 *                 kanoniska filer (o155)
 *
 * Utdata (data/forskning/OPTIMERING/lighthouse/):
 *   o151-natt[-sond]-sammanfattning.json + per-sidfiler (LH-verktyget)
 *   dom-o151-natt[-sond].json (dom + stegfakta)
 * Exit: 0 = dom GRÖN (eller sond komplett) · 1 = dom med rött kriterium
 *       · 2 = avbruten (RAM/200/last — o155) · 3 = pipelinefel.
 */
import { spawn, execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROD = process.cwd();
const LH_KAT = join(ROD, "data/forskning/OPTIMERING/lighthouse");
const SOND = process.argv.includes("--sond");
const NAMN_ARG = process.argv.find((a) => a.startsWith("--namn="));
const NAMN = NAMN_ARG ? NAMN_ARG.slice(7) : SOND ? "o151-natt-sond" : "o151-natt";
const RAM_TAK_MB = 1500;
const POANG_BAND_SUPER = 8; // §7.2 "oförändrad ±" — dokumenterad tolkning
const TBT_TAK_KALKYLATOR = 450; // §7.2:s uttryckliga tak
// o155 lastvakt: tyst-slice-kriterier + väntebudget (ENDAST natt-läge)
const LAST_BUSY_MAX_PROC = 30; // < 30 % CPU-beläggning (4 kärnor)
const LAST_L1_MAX = 1.5; // loadavg1 < 1,5 (37 % av 4 kärnor)
const LAST_VANTA_MAX_MS = 12 * 60_000;
const LAST_VANTA_STEG_MS = 30_000;
// o158 steg 2b: kalib-drift-tak — samma arbetsloop får inte avvika > 50 %
// från startprobens kalib vid mätningens slut (bevisfall: efter-vakten
// 64,5→109,5 ms = 1,70x vid TBT 16 413 ⇒ smyglast; > 50 % genomströmning-
// förändring = metallen var ej konstant under fönstret)
const KALIB_DRIFT_MAX_KVOT = 1.5;

const rap = { ts: new Date().toISOString(), lage: SOND ? "sond" : "natt", steg: [] };

function ramMB() {
  const m = /MemAvailable:\s+(\d+) kB/.exec(readFileSync("/proc/meminfo", "utf8"));
  return Math.round(Number(m[1]) / 1024);
}

// ── o155 lastvakt: mätverktyg för mätfönstrets tysthet ─────────────────────
function cpuRaknare() {
  const rad = /^cpu\s+(.*)$/m.exec(readFileSync("/proc/stat", "utf8"))[1].trim().split(/\s+/).map(Number);
  const [user, nice, system, idle, iowait, irq, softirq, steal] = rad;
  const busy = user + nice + system + irq + softirq + steal; // iowait = diskväntan, CPU fri
  const ledig = idle + iowait;
  return { busy, ledig, total: busy + ledig };
}
/** Kalibreringsprob: fast arbetsloop → ms. Normaliserbarhet mellan fönster
 *  (TBT/cpuKalibMs) — instrumentets "mätsticka i metall", o155 §3. */
function cpuKalibMs() {
  const t0 = process.hrtime.bigint();
  let s = 0;
  for (let i = 0; i < 30_000_000; i++) s += i & 7;
  if (s === -1) console.error("omöjlig"); // grenhållare — s aldrig -1
  return Number(process.hrtime.bigint() - t0) / 1e6;
}
async function lasLast() {
  const a = cpuRaknare();
  await new Promise((r) => setTimeout(r, 1200)); // 1,2 s fönster
  const b = cpuRaknare();
  const dt = b.total - a.total || 1;
  const busyProc = Math.round(((b.busy - a.busy) / dt) * 1000) / 10;
  const loadavg = readFileSync("/proc/loadavg", "utf8").trim().split(/\s+/).slice(0, 3).map(Number);
  let zcodeBarn = 0;
  try {
    zcodeBarn = Number(execFileSync("pgrep", ["-c", "-f", "zcode-cli"], { encoding: "utf8" }).trim()) || 0;
  } catch { /* pgrep exit 1 = inga barn = 0 */ }
  const kalib = cpuKalibMs();
  return {
    busyProc, loadavg, cpuKalibMs: Math.round(kalib * 10) / 10, zcodeBarn,
    tyst: busyProc < LAST_BUSY_MAX_PROC && loadavg[0] < LAST_L1_MAX,
  };
}
function skriv(dom) {
  if (dom !== undefined) rap.dom = dom;
  writeFileSync(join(LH_KAT, `dom-${NAMN}.json`), JSON.stringify(rap, null, 2));
}

// ── Steg 0: RAM-vakt ────────────────────────────────────────────────────────
const ram = ramMB();
rap.steg.push({ steg: "0-ram", ramMB: ram, tak: RAM_TAK_MB, pass: ram >= RAM_TAK_MB });
if (ram < RAM_TAK_MB) { skriv("avbruten-ram"); console.error(`AVBRUTEN: RAM ${ram} < ${RAM_TAK_MB} MB`); process.exit(2); }

// ── Steg 0b (o155): LASTVAKT — vänta på tyst slice i natt-läge ──────────────
let last = await lasLast();
const vantaStart = Date.now();
while (!last.tyst && Date.now() - vantaStart < LAST_VANTA_MAX_MS) {
  await new Promise((r) => setTimeout(r, LAST_VANTA_STEG_MS));
  last = await lasLast();
}
rap.steg.push({
  steg: "0b-lastvakt", ...last,
  kriterier: { busyUnder: LAST_BUSY_MAX_PROC, l1Under: LAST_L1_MAX },
  vantadeMs: Date.now() - vantaStart,
  pass: SOND ? true : last.tyst,
});
if (!SOND && !last.tyst) {
  skriv("avbruten-last");
  console.error(`AVBRUTEN: last ej tyst efter ${Math.round((Date.now() - vantaStart) / 1000)} s (busy ${last.busyProc} %, loadavg1 ${last.loadavg[0]}, kalib ${last.cpuKalibMs} ms)`);
  process.exit(2);
}

// ── Steg 1: prod 200-preflight + ISR-värmning (kor-o139-kontraktet) ────────
const status200 = {};
for (const s of ["/superanalys", "/kalkylator"]) {
  try {
    for (let i = 0; i < 3; i++) { // 3 hämtningar/sida: 200-kontroll + ISR-värmning
      const r = await fetch("http://localhost:3000" + s, { redirect: "manual" });
      if (i === 0) status200[s] = r.status;
    }
  } catch { status200[s] = 0; }
}
await new Promise((r) => setTimeout(r, 15_000)); // settle (kor-o139 STEG 3)
rap.steg.push({ steg: "1-prod200-varmning", status: status200, pass: Object.values(status200).every((k) => k === 200) });
if (!rap.steg.find((s) => s.steg === "1-prod200-varmning").pass) { skriv("avbruten-prod"); console.error("AVBRUTEN: prod ej 200", status200); process.exit(2); }

// ── Steg 1b (o155): last-återprob — dom gäller bara om fönstret fortfarande tyst ──
const lastAter = await lasLast();
rap.steg.push({
  steg: "1b-last-ater", busyProc: lastAter.busyProc, loadavg: lastAter.loadavg,
  cpuKalibMs: lastAter.cpuKalibMs, tyst: lastAter.tyst, pass: SOND ? true : lastAter.tyst,
});
if (!SOND && !lastAter.tyst) {
  skriv("avbruten-last-ater");
  console.error(`AVBRUTEN: lasten återvände under värmningen (busy ${lastAter.busyProc} %, loadavg1 ${lastAter.loadavg[0]})`);
  process.exit(2);
}

// ── Steg 2: kanonisk Lighthouse-körning (JAMFOR mot nattbasen) ─────────────
const lh = await new Promise((res) => {
  const p = spawn("node", ["verktyg/prestanda-lighthouse.mjs", NAMN, "/superanalys", "/kalkylator"], {
    cwd: ROD, env: { ...process.env, LH_JAMFOR: "o139-fore" },
  });
  let ut = "";
  p.stdout.on("data", (d) => (ut += d));
  p.stderr.on("data", (d) => (ut += d));
  p.on("close", (kod) => res({ kod, ut: ut.slice(-4000) }));
});
rap.steg.push({ steg: "2-lighthouse", exit: lh.kod, svans: lh.ut.split("\n").slice(-6) });
if (lh.kod !== 0) { skriv("pipelinefel"); console.error("PIPELINEFEL: LH-verktyget exit " + lh.kod); process.exit(3); }

// ── Steg 2b (o158): LAST-SLUTPROB — dom gäller bara om fönstret var tyst
//    hela vägen genom själva Lighthouse-körningen (~2 min). Hålet: o155:s
//    prober (0b/1b) låg FÖRE mätningen; efter-vaktens anomali-dom bar
//    lastOK=true med kalib-drift 1,70x och TBT 16 413 = last återkom
//    EFTER sista proben. Tysthet + kalib-kvot vid slutet; natt-läge
//    ogiltigförklarar (exit 2) — aldrig röd dom på smyglast-fönster. ────
const lastSlut = await lasLast();
const kalibKvot = Math.round((lastSlut.cpuKalibMs / (last.cpuKalibMs || 1)) * 100) / 100;
const kalibDrift = kalibKvot > KALIB_DRIFT_MAX_KVOT || kalibKvot < 1 / KALIB_DRIFT_MAX_KVOT;
const slutTystOK = lastSlut.tyst && !kalibDrift;
rap.steg.push({
  steg: "2b-last-slut", busyProc: lastSlut.busyProc, loadavg: lastSlut.loadavg,
  cpuKalibMs: lastSlut.cpuKalibMs, kalibStart: last.cpuKalibMs, kalibKvot,
  zcodeBarn: lastSlut.zcodeBarn, tyst: lastSlut.tyst, kalibDrift,
  kriterier: { busyUnder: LAST_BUSY_MAX_PROC, l1Under: LAST_L1_MAX, kalibKvotUnder: KALIB_DRIFT_MAX_KVOT },
  pass: SOND ? true : slutTystOK,
});
if (!SOND && !slutTystOK) {
  skriv("avbruten-last-efter");
  console.error(`AVBRUTEN: last ej tyst vid mätningens slut (busy ${lastSlut.busyProc} %, loadavg1 ${lastSlut.loadavg[0]}, kalib ${last.cpuKalibMs}→${lastSlut.cpuKalibMs} ms = ${kalibKvot}x, zcodeBarn ${lastSlut.zcodeBarn})`);
  process.exit(2);
}

// ── Steg 3: maskinell dom (o139 §7.2, nattfönstret) ────────────────────────
const efter = JSON.parse(readFileSync(join(LH_KAT, `${NAMN}-sammanfattning.json`), "utf8"));
const fore = JSON.parse(readFileSync(join(LH_KAT, "o139-fore-sammanfattning.json"), "utf8"));
const foreSida = Object.fromEntries(fore.sidor.map((s) => [s.sokvag, s]));
const dom = [];
for (const e of efter.sidor) {
  const f = foreSida[e.sokvag];
  if (!f || !e.karnmattMs || e.fel) { dom.push({ sida: e.sokvag, fel: e.fel || "föremätning saknas" }); continue; }
  const lcpDelta = ((e.karnmattMs.LCP - f.karnmattMs.LCP) / f.karnmattMs.LCP) * 100;
  dom.push({
    sida: e.sokvag,
    poangFore: Math.round(f.poang.prestanda * 100),
    poangEfter: Math.round(e.poang.prestanda * 100),
    lcpFore: f.karnmattMs.LCP, lcpEfter: e.karnmattMs.LCP, lcpDeltaProc: Math.round(lcpDelta * 10) / 10,
    tbtFore: f.karnmattMs.TBT, tbtEfter: e.karnmattMs.TBT, clsEfter: e.karnmattMs.CLS,
    kriterier: {
      clsNoll: e.karnmattMs.CLS === 0,
      lcpInom15: Math.abs(lcpDelta) <= 15,
      ...(SOND
        ? { tbtKalkylator450: `${e.karnmattMs.TBT} (SOND — dagfönster, ej dom enligt o143 §3)` }
        : e.sokvag === "/kalkylator"
          ? { tbtKalkylator450: e.karnmattMs.TBT <= TBT_TAK_KALKYLATOR }
          : {}),
      ...(SOND || e.sokvag !== "/superanalys"
        ? {}
        : { poangSuperBand: Math.abs(Math.round(e.poang.prestanda * 100) - 73) <= POANG_BAND_SUPER }),
    },
  });
}
skriv("körde-klart");
// o155: dom-barhet — o158 utvidgat med slutprovet (2b): samtliga prober
// tysta (0b, 1b, 2b) OCH kalib driftlös inom taket genom hela fönstret
const lastOK = SOND ? lastAter.tyst : last.tyst && lastAter.tyst && slutTystOK;
writeFileSync(join(LH_KAT, `dom-${NAMN}.json`),
  JSON.stringify({ ...rap, lastOK, dom, sammanfattning: NAMN + "-sammanfattning.json" }, null, 2));

const gron = dom.every((d) => !d.kriterier || Object.values(d.kriterier).every((v) => v === true));
console.log(JSON.stringify({ lage: rap.lage, gron, dom }, null, 2));
process.exit(gron ? 0 : 1);
