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
 *
 * Utdata (data/forskning/OPTIMERING/lighthouse/):
 *   o151-natt[-sond]-sammanfattning.json + per-sidfiler (LH-verktyget)
 *   dom-o151-natt[-sond].json (dom + stegfakta)
 * Exit: 0 = dom GRÖN (eller sond komplett) · 1 = dom med rött kriterium
 *       · 2 = avbruten (RAM/200) · 3 = pipelinefel.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROD = process.cwd();
const LH_KAT = join(ROD, "data/forskning/OPTIMERING/lighthouse");
const SOND = process.argv.includes("--sond");
const NAMN = SOND ? "o151-natt-sond" : "o151-natt";
const RAM_TAK_MB = 1500;
const POANG_BAND_SUPER = 8; // §7.2 "oförändrad ±" — dokumenterad tolkning
const TBT_TAK_KALKYLATOR = 450; // §7.2:s uttryckliga tak

const rap = { ts: new Date().toISOString(), lage: SOND ? "sond" : "natt", steg: [] };

function ramMB() {
  const m = /MemAvailable:\s+(\d+) kB/.exec(readFileSync("/proc/meminfo", "utf8"));
  return Math.round(Number(m[1]) / 1024);
}
function skriv(dom) {
  if (dom !== undefined) rap.dom = dom;
  writeFileSync(join(LH_KAT, `dom-${NAMN}.json`), JSON.stringify(rap, null, 2));
}

// ── Steg 0: RAM-vakt ────────────────────────────────────────────────────────
const ram = ramMB();
rap.steg.push({ steg: "0-ram", ramMB: ram, tak: RAM_TAK_MB, pass: ram >= RAM_TAK_MB });
if (ram < RAM_TAK_MB) { skriv("avbruten-ram"); console.error(`AVBRUTEN: RAM ${ram} < ${RAM_TAK_MB} MB`); process.exit(2); }

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
if (!rap.steg[1].pass) { skriv("avbruten-prod"); console.error("AVBRUTEN: prod ej 200", status200); process.exit(2); }

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
writeFileSync(join(LH_KAT, `dom-${NAMN}.json`),
  JSON.stringify({ ...rap, dom, sammanfattning: NAMN + "-sammanfattning.json" }, null, 2));

const gron = dom.every((d) => !d.kriterier || Object.values(d.kriterier).every((v) => v === true));
console.log(JSON.stringify({ lage: rap.lage, gron, dom }, null, 2));
process.exit(gron ? 0 : 1);
