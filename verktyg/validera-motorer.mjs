#!/usr/bin/env node
/**
 * AK1A — Verifieringssvit för motorerna (användarkrav: "1000x garanterat —
 * inga fel vad gäller riktiga siffror och riktiga beräkningar").
 *
 * Skriptet gör så här (node kan inte importera TS direkt):
 *   1. Genererar tmp_motor_koll.ts i repots rot — en fil som importerar
 *      motorerna (src/lib/*.ts) och kör strukturella + matematiska kontroller.
 *   2. Kör den med: npx --yes tsx tmp_motor_koll.ts  (under en hård
 *      Promise.race-tidsbudget på 90 sekunder — robusthet krav E).
 *   3. Läser JSON-utdata mellan två ASCII-markörer, skriver/apenderar
 *      Markdown-rapport till data/rapporter/motorervalidering-2026-09-02.md.
 *   4. Städar tmp-filen (även vid fel/timeout).
 *
 * Kontroller (per motor: vagfundament, analys, netnet + netnets NCAV-matematik):
 *   a) STRUKTUR   — 2 tickers (VOLV-B.ST, SAAB-B.ST): Number.isFinite i alla
 *                   kärnfält, matrisdimensioner (vagfundament 20×5; analys 5×5
 *                   = 25 celler), inga null där tal förväntas, tickers återspeglas.
 *   b) MATEMATIK  — NCAV räknas OM för hand ur balanskomponenterna; kategorier/
 *                   total/fib/pos/sammanfattning räknas om oberoende; konfluens-
 *                   fält kontrolleras i [0,100] OM en konfluens-motor finns
 *                   (hoppas över med motivering om den saknas).
 *   c) DETERMINISM— vagfundament körs 2× på samma ticker; JSON måste vara
 *                   identisk (närmarknad = frusen data).
 *   d) GRÄNSER    — ogiltig ticker ("XXXX.ST" + formatogiltig) => snyggt fel,
 *                   ALDRIG krasch; tomma listor => tomt svar.
 *   e) ROBUSTHET  — 90 s total budget (Promise.race + process-träd-död).
 *
 * Användning:  node verktyg/validera-motorer.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, "tmp_motor_koll.ts");
const RAPPORT_SOK = path.join(REPO, "data", "rapporter", "motorervalidering-2026-09-02.md");
const TIMEOUT_MS = 90_000; // krav E: 90 s totalbudget
const MARK_START = "===MOTORKOLL_JSON_START===";
const MARK_END = "===MOTORKOLL_JSON_END===";

// ── 1) Genererad tmp-valideringsfil (TS — körs via npx tsx, raderas efteråt) ──
const TS_KOD = String.raw`// tmp_motor_koll.ts — GENERERAD av verktyg/validera-motorer.mjs. Raderas efter körning.
// Importerar motorerna och kör strukturella + matematiska kontroller; skriver
// ett JSON-block mellan två ASCII-markörer på stdout.
import { körVagfundament, hamtaBalansPoster } from "./src/lib/vagfundament-motor";
import { körAnalysMotor, HORIZONTER as HZ, TEORIER } from "./src/lib/analys-motor";
import { skannaNetnet, GRAHAM_TROSKEL } from "./src/lib/netnet-motor";

type Status = "PASS" | "FAIL" | "SKIP";
type Rad = { motor: string; kontroll: string; status: Status; detalj: string; varden: string; tid_ms: number };

const T0 = Date.now();
const START_ISO = new Date().toISOString();
const RADER: Rad[] = [];
function rad(motor: string, kontroll: string, status: Status, detalj: string, varden: string): void {
  RADER.push({ motor: motor, kontroll: kontroll, status: status, detalj: detalj, varden: varden, tid_ms: Date.now() - T0 });
}
function isFin(x: unknown): boolean {
  return typeof x === "number" && Number.isFinite(x);
}
function felText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

const TICKERS = ["VOLV-B.ST", "SAAB-B.ST"];
const VARS = [
  "V01", "V02", "V03", "V04", "V05", "V06", "V07", "V08", "V09", "V10",
  "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20",
];
const VAR_KAT: Record<string, string> = {
  V01: "tillvaxt", V02: "tillvaxt", V03: "tillvaxt",
  V04: "vardering", V05: "vardering", V06: "vardering",
  V07: "lonsamhet", V08: "lonsamhet", V09: "lonsamhet",
  V10: "stabilitet", V11: "stabilitet", V12: "stabilitet",
  V13: "moat", V14: "moat", V15: "moat",
  V16: "katalysator", V17: "katalysator", V18: "katalysator",
  V19: "risk", V20: "risk",
};
const KATVIKT: Record<string, number> = {
  tillvaxt: 0.15, vardering: 0.20, lonsamhet: 0.20, "stabilitet": 0.15,
  moat: 0.15, katalysator: 0.05, risk: 0.10,
};
const KATEGORIER = ["tillvaxt", "vardering", "lonsamhet", "stabilitet", "moat", "katalysator", "risk"];
const VAGKLASSER = ["impulsvåg", "korrigering", "basbygge", "osatt"];

// Fas 1-produkter som senare faser behöver
let vag1: Awaited<ReturnType<typeof körVagfundament>> | null = null;
let ana1: Awaited<ReturnType<typeof körAnalysMotor>> | null = null;
let net1: Awaited<ReturnType<typeof skannaNetnet>> | null = null;

// ── A+B) STRUKTUR + MATEMATIK på riktiga tickers ─────────────────────────────
async function fas1(): Promise<void> {
  const [vag, ana, net, poster] = await Promise.all([
    körVagfundament({ tickers: TICKERS, vikter: { "VOLV-B.ST": 1, "SAAB-B.ST": 1 } }),
    körAnalysMotor({ tickers: TICKERS }),
    skannaNetnet(TICKERS),
    Promise.all(TICKERS.map((t) => hamtaBalansPoster(t))),
  ]);
  vag1 = vag; ana1 = ana; net1 = net;

  // ── vagfundament: STRUKTUR per ticker (20×5-matris) ──
  for (let i = 0; i < TICKERS.length; i++) {
    const t = TICKERS[i];
    const r = vag.tickers[i];
    const problem: string[] = [];
    if (!r || r.ticker !== t) problem.push("ticker återspeglas ej");
    if (r && r.fel) problem.push("fel: " + String(r.fel));
    if (r && !r.fel) {
      const m = r.matris;
      if (!m) problem.push("matris saknas");
      else {
        const rader = Object.keys(m);
        if (rader.length !== 20 || !VARS.every((v) => rader.indexOf(v) >= 0)) {
          problem.push("matrisrader=" + rader.length + " (förväntat 20 rader V01-V20)");
        }
        for (const v of VARS) {
          const kol = m[v] ? Object.keys(m[v]) : [];
          if (kol.length !== 5 || !HZ.every((h) => kol.indexOf(h) >= 0)) {
            problem.push(v + " har " + kol.length + " kolumner (förväntat 5)");
            break;
          }
          for (const h of HZ) {
            const c = m[v][h];
            if (c === null || c === undefined) continue;
            if (!isFin(c) || !Number.isInteger(c) || c < -1 || c > 1) {
              problem.push("cell " + v + "." + h + "=" + String(c) + " (ej finit heltal i [-1,1])");
            }
          }
        }
      }
      const ind = r.indikatorer;
      if (!ind || Object.keys(ind).length !== 20) problem.push("indikatorer=" + (ind ? Object.keys(ind).length : "saknas"));
      else {
        for (const v of VARS) {
          const it = ind[v];
          if (!it) { problem.push("indikator " + v + " saknas"); continue; }
          for (const h of HZ) {
            const mo = it.momentum ? it.momentum[h] : undefined;
            if (mo !== null && mo !== undefined && !isFin(mo)) problem.push("momentum " + v + "." + h + "=" + String(mo));
            const vg = it.vager ? it.vager[h] : undefined;
            if (vg !== undefined && VAGKLASSER.indexOf(vg) < 0) problem.push("vagklass " + v + "." + h + "=" + String(vg));
          }
          if (it.niva !== null && it.niva !== undefined && (!isFin(it.niva) || it.niva < 0 || it.niva > 5)) {
            problem.push("niva " + v + "=" + String(it.niva) + " (ej i [0,5])");
          }
        }
      }
      // sammanfattning: summa 100 + exakt omräkning ur matrisen
      if (m) {
        let imp = 0, kor = 0, bas = 0, osa = 0;
        for (const v of VARS) for (const h of HZ) {
          const c = m[v][h];
          if (c === null || c === undefined) osa += 1; else if (c > 0) imp += 1; else if (c < 0) kor += 1; else bas += 1;
        }
        const sf = r.sammanfattning;
        if (!sf) problem.push("sammanfattning saknas");
        else if (sf.impulsvag !== imp || sf.korrigering !== kor || sf.basbygge !== bas || sf.osatt !== osa) {
          problem.push("sammanfattning avviker: motor " + JSON.stringify(sf) + " vs omräknad {" + imp + "," + kor + "," + bas + "," + osa + "}");
        } else if (imp + kor + bas + osa !== 100) {
          problem.push("sammanfattningssumma=" + (imp + kor + bas + osa) + " (ej 100 = 20x5)");
        }
      }
      if (r.valuta !== null && r.valuta !== undefined && typeof r.valuta !== "string") problem.push("valuta ej sträng");
      if (r.dataPer !== null && r.dataPer !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(r.dataPer))) problem.push("dataPer=" + String(r.dataPer));
    }
    rad(
      "vagfundament",
      "STRUKTUR 20×5-matris + indikatorer (" + t + ")",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0 ? "matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt" : problem.slice(0, 6).join("; "),
      "total=" + JSON.stringify(r && r.total) + " sammanfattning=" + JSON.stringify(r && r.sammanfattning) + " valuta=" + String(r && r.valuta) + " dataPer=" + String(r && r.dataPer),
    );
  }

  // ── vagfundament: STRUKTUR portföljaggregering (kräver vikter) ──
  {
    const p = vag.portfolj;
    const problem: string[] = [];
    if (!p) problem.push("portfölj saknas trots angivna vikter");
    else {
      const rader = Object.keys(p.matris);
      if (rader.length !== 20 || !VARS.every((v) => rader.indexOf(v) >= 0)) problem.push("portföljmatris rader=" + rader.length);
      for (const v of VARS) {
        const kol = p.matris[v] ? Object.keys(p.matris[v]) : [];
        if (kol.length !== 5) { problem.push("portföljmatris " + v + " kolumner=" + kol.length); break; }
        for (const h of HZ) {
          const c = p.matris[v][h];
          if (c !== null && c !== undefined && (!isFin(c) || c < -1 || c > 1)) problem.push("portföljcell " + v + "." + h + "=" + String(c));
        }
      }
      if (Object.keys(p.kategorier).length !== 7) problem.push("portföljkategorier=" + Object.keys(p.kategorier).length + " (förväntat 7)");
      if (Object.keys(p.total).length !== 5) problem.push("portföljtotal kolumner=" + Object.keys(p.total).length);
      if (!Array.isArray(p.radTexter) || p.radTexter.length !== 7 || p.radTexter.some((s) => typeof s !== "string")) {
        problem.push("radTexter=" + (p.radTexter ? p.radTexter.length : "saknas"));
      }
      if (typeof p.totalText !== "string" || p.totalText.length === 0) problem.push("totalText saknas");
      if (!isFin(p.tackningProcent) || p.tackningProcent < 0 || p.tackningProcent > 100) {
        problem.push("tackningProcent=" + String(p.tackningProcent) + " (ej i [0,100])");
      }
    }
    rad(
      "vagfundament/portfölj",
      "STRUKTUR portföljaggregering + procentfält",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0 ? "matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100]" : problem.slice(0, 6).join("; "),
      "tackningProcent=" + String(p && p.tackningProcent) + " totalText=" + String(p && p.totalText),
    );
  }

  // ── vagfundament: MATEMATIK — kategorier + total omräknade för hand ──
  for (let i = 0; i < TICKERS.length; i++) {
    const t = TICKERS[i];
    const r = vag.tickers[i];
    const problem: string[] = [];
    let maxKat = 0, maxTot = 0, katN = 0, totN = 0;
    if (!r || r.fel || !r.matris || !r.kategorier || !r.total) problem.push("data saknas för omräkning");
    else {
      for (const kat of KATEGORIER) {
        for (const h of HZ) {
          const celler = VARS
            .filter((v) => VAR_KAT[v] === kat)
            .map((v) => r.matris![v][h])
            .filter((c): c is number => c !== null && c !== undefined);
          const motor = r.kategorier![kat] ? r.kategorier![kat][h] : undefined;
          if (celler.length === 0) {
            if (motor !== null && motor !== undefined) problem.push("kategori " + kat + "." + h + "=" + String(motor) + " men inga celler");
            continue;
          }
          if (motor === null || motor === undefined) { problem.push("kategori " + kat + "." + h + " null men " + celler.length + " celler"); continue; }
          const expected = celler.reduce((a, b) => a + b, 0) / celler.length;
          const avv = Math.abs(motor - expected);
          if (avv > maxKat) maxKat = avv;
          katN += 1;
          if (avv > 0.0006) problem.push("kategori " + kat + "." + h + ": motor=" + motor + " omräknad=" + expected.toFixed(6));
        }
      }
      for (const h of HZ) {
        let tal = 0, vik = 0;
        for (const kat of KATEGORIER) {
          const k = r.kategorier![kat] ? r.kategorier![kat][h] : null;
          if (k !== null && k !== undefined) { tal += k * KATVIKT[kat]; vik += KATVIKT[kat]; }
        }
        const motor = r.total![h];
        if (vik === 0) { if (motor !== null) problem.push("total." + h + " != null trots tomma kategorier"); continue; }
        if (motor === null || motor === undefined) { problem.push("total." + h + " null men kategorier finns"); continue; }
        const expected = tal / vik;
        const avv = Math.abs(motor - expected);
        if (avv > maxTot) maxTot = avv;
        totN += 1;
        if (avv > 0.0006) problem.push("total." + h + ": motor=" + motor + " omräknad=" + expected.toFixed(6));
      }
    }
    rad(
      "vagfundament",
      "MATEMATIK kategorier+total omräknade (" + t + ")",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? katN + " kategoriceller + " + totN + " totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=" + maxKat.toFixed(6) + " total=" + maxTot.toFixed(6)
        : problem.slice(0, 6).join("; "),
      "total=" + JSON.stringify(r && r.total),
    );
  }

  // ── analys-motor: STRUKTUR per ticker (5×5 = 25 celler) ──
  for (let i = 0; i < TICKERS.length; i++) {
    const t = TICKERS[i];
    const a = ana.tickers[i];
    const problem: string[] = [];
    if (!a || a.ticker !== t) problem.push("ticker återspeglas ej");
    if (a && a.fel) problem.push("fel: " + String(a.fel));
    if (a && !a.fel) {
      const mat = a.matris25;
      if (!mat) problem.push("matris25 saknas");
      else {
        const nycklar = Object.keys(mat);
        if (nycklar.length !== 25) problem.push("matris25 nycklar=" + nycklar.length + " (förväntat 25 = 5 teorier × 5 horisonter)");
        for (const te of TEORIER) for (const h of HZ) {
          const c = mat[te + "." + h];
          if (!isFin(c) || !Number.isInteger(c) || c < -1 || c > 1) problem.push("cell " + te + "." + h + "=" + String(c));
        }
      }
      const sf = a.sammanfattning;
      if (mat) {
        let bull = 0, bear = 0;
        for (const te of TEORIER) for (const h of HZ) {
          const c = mat[te + "." + h];
          if (isFin(c) && c > 0) bull += 1; else if (isFin(c) && c < 0) bear += 1;
        }
        if (!sf) problem.push("sammanfattning saknas");
        else if (sf.bull !== bull || sf.bear !== bear || sf.neutral !== 25 - bull - bear) {
          problem.push("sammanfattning: motor " + JSON.stringify(sf) + " vs omräknad {" + bull + "," + bear + "," + (25 - bull - bear) + "}");
        }
      }
      const d = a.data;
      if (!d) problem.push("data saknas");
      else {
        if (!isFin(d.pris) || d.pris <= 0) problem.push("pris=" + String(d.pris));
        if (!isFin(d.hojd52) || !isFin(d.lag52) || d.hojd52 < d.lag52) problem.push("52v-spann ogiltigt");
        if (!isFin(d.pos52) || d.pos52 < -0.001 || d.pos52 > 1.001) problem.push("pos52=" + String(d.pos52));
        if (!isFin(d.fib38) || !isFin(d.fib62)) problem.push("fib38/fib62 ej finita");
        const valfria = ["sigma_ar", "atr14", "ma50", "ma200", "vol20", "voltrend"] as const;
        for (const f of valfria) {
          const x = d[f];
          if (x !== null && x !== undefined && !isFin(x)) problem.push("data." + f + "=" + String(x));
        }
      }
      if (!a.momentum || Object.keys(a.momentum).length !== 5) problem.push("momentum kolumner=" + (a.momentum ? Object.keys(a.momentum).length : "saknas"));
      else for (const h of HZ) {
        const mo = a.momentum[h];
        if (mo !== null && mo !== undefined && !isFin(mo)) problem.push("momentum." + h + "=" + String(mo));
      }
      if (!a.vager || Object.keys(a.vager).length !== 5) problem.push("vager kolumner=" + (a.vager ? Object.keys(a.vager).length : "saknas"));
      else for (const h of HZ) if (VAGKLASSER.indexOf(a.vager[h]) < 0) problem.push("vager." + h + "=" + String(a.vager[h]));
      if (typeof a.namn !== "string" || a.namn.length === 0) problem.push("namn saknas");
    }
    rad(
      "analys",
      "STRUKTUR 5×5-matris (25 celler) + data (" + t + ")",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0 ? "matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter" : problem.slice(0, 6).join("; "),
      "pris=" + String(a && a.data && a.data.pris) + " pos52=" + String(a && a.data && a.data.pos52) + " sammanfattning=" + JSON.stringify(a && a.sammanfattning) + " kallor=" + String(a && a.kallor),
    );
  }

  // ── analys-motor: MATEMATIK — fib/pos52/sammanfattning/vager omräknade ──
  for (let i = 0; i < TICKERS.length; i++) {
    const t = TICKERS[i];
    const a = ana.tickers[i];
    const problem: string[] = [];
    let vagerOk = 0, vagerSkip = 0;
    if (!a || a.fel || !a.data || !a.matris25 || !a.momentum) problem.push("data saknas för omräkning");
    else {
      const d = a.data;
      const span = d.hojd52 - d.lag52;
      if (span > 0) {
        const fib38e = d.hojd52 - 0.382 * span;
        const fib62e = d.hojd52 - 0.618 * span;
        const pos52e = (d.pris - d.lag52) / span;
        if (Math.abs(d.fib38 - fib38e) > 0.001) problem.push("fib38: motor=" + d.fib38 + " omräknad=" + fib38e.toFixed(6));
        if (Math.abs(d.fib62 - fib62e) > 0.001) problem.push("fib62: motor=" + d.fib62 + " omräknad=" + fib62e.toFixed(6));
        if (Math.abs(d.pos52 - pos52e) > 0.002) problem.push("pos52: motor=" + d.pos52 + " omräknad=" + pos52e.toFixed(6));
      }
      let bull = 0, bear = 0;
      for (const te of TEORIER) for (const h of HZ) {
        const c = a.matris25![te + "." + h];
        if (isFin(c) && c > 0) bull += 1; else if (isFin(c) && c < 0) bear += 1;
      }
      const sf = a.sammanfattning;
      if (!sf || sf.bull !== bull || sf.bear !== bear || sf.neutral !== 25 - bull - bear) {
        problem.push("sammanfattning avviker från omräkning ur matris25");
      }
      // vager omräknad enligt motorns regelverk (6%-gräns + medel-bekräftelse;
      // utan bekräftelse gäller momentumriktningen)
      for (const h of HZ) {
        const mom = a.momentum![h];
        const f = a.vager ? a.vager[h] : undefined;
        if (f === undefined) { problem.push("vager." + h + " saknas"); continue; }
        if (mom === null || mom === undefined) {
          if (f !== "osatt") problem.push("vager." + h + "=" + f + " men momentum=null (väntat osatt)");
          else vagerOk += 1;
          continue;
        }
        const maRef = (h === "mikro" || h === "kort") ? d.ma50 : d.ma200;
        const narPos = Math.abs(mom - 0.06) < 0.0005;
        const narNeg = Math.abs(mom + 0.06) < 0.0005;
        const narMa = maRef !== null && maRef !== undefined && Math.abs(d.pris - maRef) < 0.01;
        if (narPos || narNeg || narMa) { vagerSkip += 1; continue; }
        let expected: string;
        if (mom > 0.06 && (maRef === null || maRef === undefined || d.pris >= maRef)) expected = "impulsvåg";
        else if (mom < -0.06 && (maRef === null || maRef === undefined || d.pris < maRef)) expected = "korrigering";
        else if (Math.abs(mom) <= 0.06) expected = "basbygge";
        else expected = mom > 0 ? "impulsvåg" : "korrigering";
        if (f !== expected) problem.push("vager." + h + ": motor=" + f + " omräknad=" + expected + " (momentum=" + mom + ")");
        else vagerOk += 1;
      }
    }
    rad(
      "analys",
      "MATEMATIK fib/pos52/vager omräknade (" + t + ")",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; " + vagerOk + " vågklasser omräknade (" + vagerSkip + " gränsfall hoppade)"
        : problem.slice(0, 6).join("; "),
      "fib38=" + String(a && a.data && a.data.fib38) + " fib62=" + String(a && a.data && a.data.fib62) + " momentum=" + JSON.stringify(a && a.momentum),
    );
  }

  // ── netnet: STRUKTUR per ticker ──
  for (let i = 0; i < TICKERS.length; i++) {
    const t = TICKERS[i];
    const n = net[i];
    const problem: string[] = [];
    if (!n || n.ticker !== t) problem.push("ticker återspeglas ej");
    if (n && n.fel) problem.push("fel: " + String(n.fel));
    if (n && !n.fel) {
      if (!isFin(n.kurs) || n.kurs <= 0) problem.push("kurs=" + String(n.kurs));
      if (!isFin(n.ncavPerAktie)) problem.push("ncavPerAktie=" + String(n.ncavPerAktie));
      if (n.ncavPerAktie !== null && n.ncavPerAktie > 0 && (!isFin(n.forhallande) || n.forhallande <= 0)) {
        problem.push("forhallande=" + String(n.forhallande));
      }
      if (n.ncavPerAktie !== null && n.ncavPerAktie <= 0 && n.forhallande !== null) {
        problem.push("forhallande=" + String(n.forhallande) + " trots NCAV<=0 (väntat null)");
      }
      if (["net-net", "nära", "ej"].indexOf(String(n.klass)) < 0) problem.push("klass=" + String(n.klass));
      if (n.pe !== null && n.pe !== undefined && !isFin(n.pe)) problem.push("pe=" + String(n.pe));
      if (n.pb !== null && n.pb !== undefined && !isFin(n.pb)) problem.push("pb=" + String(n.pb));
    }
    rad(
      "netnet",
      "STRUKTUR screeningsrad (" + t + ")",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0 ? "kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej}" : problem.slice(0, 6).join("; "),
      "kurs=" + String(n && n.kurs) + " ncavPerAktie=" + String(n && n.ncavPerAktie) + " forhallande=" + String(n && n.forhallande) + " klass=" + String(n && n.klass) + " pe=" + String(n && n.pe) + " pb=" + String(n && n.pb),
    );
  }

  // ── netnet: MATEMATIK — NCAV räknas OM för hand ur balanskomponenter ──
  for (let i = 0; i < TICKERS.length; i++) {
    const t = TICKERS[i];
    const po = poster[i];
    const n = net[i];
    if (!po || po.currentAssets === null || po.currentLiabilities === null || !po.shareIssued || po.shareIssued <= 0) {
      rad(
        "netnet/NCAV",
        "NCAV omräknad för hand (" + t + ")",
        "SKIP",
        "ofullständig OBEROENDE balansdata (motor kan ha använt quoteSummary-fallback) — omräkning ej möjlig",
        JSON.stringify(po),
      );
      continue;
    }
    const totalSkuld = po.currentLiabilities + (po.longTermDebt !== null && po.longTermDebt !== undefined ? po.longTermDebt : 0);
    const ncavVantat = (po.currentAssets - totalSkuld) / po.shareIssued;
    const problem: string[] = [];
    if (!n || !isFin(n.ncavPerAktie)) {
      problem.push("motorns ncavPerAktie ej finit: " + String(n && n.ncavPerAktie));
    } else {
      const avv = Math.abs(n.ncavPerAktie - ncavVantat);
      if (avv > 0.001 + 1e-6 * Math.abs(ncavVantat)) {
        problem.push("NCAV/aktie: motor=" + n.ncavPerAktie + " omräknad=" + ncavVantat.toFixed(6) + " (avvikelse " + avv.toFixed(6) + ")");
      }
      // förhållande + klass omräknade ur radens EGNA komponenter
      if (n.kurs !== null && n.kurs !== undefined && n.ncavPerAktie > 0) {
        const fhVantat = n.kurs / n.ncavPerAktie;
        if (n.forhallande === null || !isFin(n.forhallande) || Math.abs(n.forhallande - fhVantat) > 0.001 + 0.0005 * Math.abs(fhVantat)) {
          problem.push("forhallande: motor=" + String(n.forhallande) + " omräknad=" + fhVantat.toFixed(6));
        }
        const klassVantat = n.forhallande !== null && n.forhallande !== undefined
          ? (n.forhallande < GRAHAM_TROSKEL ? "net-net" : n.forhallande < 1.0 ? "nära" : "ej")
          : null;
        if (klassVantat !== n.klass) problem.push("klass: motor=" + String(n.klass) + " omräknad=" + String(klassVantat));
      } else if (n.ncavPerAktie <= 0) {
        if (n.klass !== "ej") problem.push("klass=" + String(n.klass) + " trots NCAV<=0 (väntat 'ej')");
        if (n.forhallande !== null) problem.push("forhallande=" + String(n.forhallande) + " trots NCAV<=0 (väntat null)");
      }
    }
    rad(
      "netnet/NCAV",
      "NCAV omräknad för hand (" + t + ")",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "(omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = " + ncavVantat.toFixed(6) + " ≈ motorns " + String(n && n.ncavPerAktie) + "; förhållande=kurs÷NCAV och Grahams klass stämmer"
        : problem.slice(0, 6).join("; "),
      "CA=" + String(po.currentAssets) + " CL=" + String(po.currentLiabilities) + " LTD=" + String(po.longTermDebt) + " aktier=" + String(po.shareIssued) + " valuta=" + String(po.valuta),
    );
  }

  // Graham-konstanten
  rad(
    "netnet/NCAV",
    "GRAHAM_TROSKEL-konstant",
    GRAHAM_TROSKEL === 0.667 ? "PASS" : "FAIL",
    "exporterad konstant=" + String(GRAHAM_TROSKEL) + " (förväntat 0.667 = 2/3)",
    String(GRAHAM_TROSKEL),
  );
}

// ── B) KONFLUENS — kontrolleras ENDAST om fält/motor finns ───────────────────
function samlaKonfluens(v: unknown, vag: string, ut: Array<{ vag: string; varde: number }>): void {
  if (v === null || v === undefined) return;
  if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) samlaKonfluens(v[i], vag + "[]", ut); return; }
  if (typeof v === "object") {
    for (const nyckel of Object.keys(v as Record<string, unknown>)) {
      const varde = (v as Record<string, unknown>)[nyckel];
      if (nyckel.toLowerCase().indexOf("konfluens") >= 0 && typeof varde === "number") {
        ut.push({ vag: vag + "." + nyckel, varde: varde });
      } else {
        samlaKonfluens(varde, vag + "." + nyckel, ut);
      }
    }
  }
}

async function fas2(): Promise<void> {
  const traffar: Array<{ vag: string; varde: number }> = [];
  samlaKonfluens([vag1, ana1, net1], "output", traffar);
  if (traffar.length === 0) {
    rad(
      "konfluens",
      "konfluens-fält i [0,100]",
      "SKIP",
      "ingen konfluens-motor i src/lib (vagfundament/analys/netnet saknar konfluens-fält i output — verifierat programmatiskt) — kontroll hoppas över enligt instruktion",
      "0 konfluens-fält hittade i motorernas output",
    );
  } else {
    const utanfor = traffar.filter((x) => !isFin(x.varde) || x.varde < 0 || x.varde > 100);
    rad(
      "konfluens",
      "konfluens-fält i [0,100]",
      utanfor.length === 0 ? "PASS" : "FAIL",
      traffar.length + " konfluens-fält hittade; " + (utanfor.length === 0 ? "alla i [0,100]" : utanfor.length + " utanför intervallet"),
      traffar.slice(0, 5).map((x) => x.vag + "=" + x.varde).join(", "),
    );
  }
}

// ── C) DETERMINISM — vagfundament 2× på samma ticker ─────────────────────────
function firstDiff(a: unknown, b: unknown, vag: string): string | null {
  if (a === b) return null;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
    return vag + ": " + JSON.stringify(a) + " != " + JSON.stringify(b);
  }
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return vag + ": nyckelantal " + ka.length + " vs " + kb.length;
  for (const k of ka) {
    const d = firstDiff((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], vag + "." + k);
    if (d) return d;
  }
  return null;
}

async function fas3(): Promise<void> {
  const v2 = await körVagfundament({ tickers: ["VOLV-B.ST"] });
  const r1 = vag1 && vag1.tickers[0];
  const r2 = v2.tickers[0];
  const s1 = JSON.stringify(r1);
  const s2 = JSON.stringify(r2);
  if (s1 === s2) {
    rad(
      "vagfundament",
      "DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt)",
      "PASS",
      "två separata körningar gav byte-identisk JSON (" + s1.length + " tecken) — konsistent med frusen marknadsdata",
      "hash-lik längd=" + s1.length,
    );
  } else {
    const diff = firstDiff(r1, r2, "rot");
    rad(
      "vagfundament",
      "DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt)",
      "FAIL",
      "utdata skiljer mellan körningar (ofrusen data eller icke-determinism). Första skillnad: " + String(diff),
      "längd " + s1.length + " vs " + s2.length,
    );
  }
}

// ── D) GRÄNSER — ogiltiga indata ska ge snyggt fel, ALDRIG krasch ────────────
async function fas4(): Promise<void> {
  const [vagX, anaX, netX] = await Promise.all([
    körVagfundament({ tickers: ["XXXX.ST"] }),
    körAnalysMotor({ tickers: ["XXXX.ST"] }),
    skannaNetnet(["XXXX.ST", "BAD TICKER!"]),
  ]);

  const vx = vagX.tickers[0];
  rad(
    "gränser",
    "vagfundament okänd ticker XXXX.ST → fel-rad utan krasch",
    vx && vx.ticker === "XXXX.ST" && typeof vx.fel === "string" && vx.fel.length > 0 ? "PASS" : "FAIL",
    vx && vx.fel ? "snyggt fel: '" + vx.fel + "'" : "väntat fel-fält på raden, fick: " + JSON.stringify(vx).slice(0, 200),
    JSON.stringify(vx && { ticker: vx.ticker, fel: vx.fel || null }),
  );

  const ax = anaX.tickers[0];
  rad(
    "gränser",
    "analys okänd ticker XXXX.ST → fel-rad utan krasch",
    ax && ax.ticker === "XXXX.ST" && typeof ax.fel === "string" && ax.fel.length > 0 ? "PASS" : "FAIL",
    ax && ax.fel ? "snyggt fel: '" + ax.fel + "'" : "väntat fel-fält på raden, fick: " + JSON.stringify(ax).slice(0, 200),
    JSON.stringify(ax && { ticker: ax.ticker, fel: ax.fel || null }),
  );

  const n1 = netX[0];
  rad(
    "gränser",
    "netnet okänd ticker XXXX.ST → fel-rad utan krasch",
    n1 && n1.ticker === "XXXX.ST" && typeof n1.fel === "string" && n1.fel.length > 0 ? "PASS" : "FAIL",
    n1 && n1.fel ? "snyggt fel: '" + n1.fel + "'" : "väntat fel-fält på raden, fick: " + JSON.stringify(n1).slice(0, 200),
    JSON.stringify(n1 && { ticker: n1.ticker, fel: n1.fel || null, klass: n1.klass }),
  );

  const n2 = netX[1];
  rad(
    "gränser",
    "netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel",
    n2 && n2.fel === "ogiltig ticker" ? "PASS" : "FAIL",
    n2 && n2.fel ? "fel-text: '" + n2.fel + "'" : "väntat valideringsfel, fick: " + JSON.stringify(n2).slice(0, 200),
    JSON.stringify(n2),
  );

  const [vagT, anaT, netT] = await Promise.all([
    körVagfundament({ tickers: [] }),
    körAnalysMotor({ tickers: [] }),
    skannaNetnet([]),
  ]);
  const tomtOk = vagT.tickers.length === 0 && anaT.tickers.length === 0 && netT.length === 0;
  rad(
    "gränser",
    "tomma tickerlistor → tomma svar (alla motorer)",
    tomtOk ? "PASS" : "FAIL",
    tomtOk ? "vagfundament/analys/netnet returnerade alla [] utan krasch" : "väntat [] från alla: vag=" + vagT.tickers.length + " analys=" + anaT.tickers.length + " netnet=" + netT.length,
    "0 rader",
  );
}

// ── Kör allt med intern tidsgräns (88 s; yttre budget 90 s hanteras av .mjs) ──
const MARK_START = "===MOTORKOLL_JSON_START===";
const MARK_END = "===MOTORKOLL_JSON_END===";
const FASER: Array<[string, () => Promise<void>]> = [
  ["STRUKTUR+MATEMATIK", fas1],
  ["KONFLUENS", fas2],
  ["DETERMINISM", fas3],
  ["GRÄNSER", fas4],
];

function skriv(timeout: boolean): void {
  if (timeout) {
    rad("system", "intern tidsgräns", "FAIL", "avbröts efter 88 s — kontrollerna ofullständiga", "-");
  }
  process.stdout.write(MARK_START + "\n");
  process.stdout.write(JSON.stringify({ startad: START_ISO, klar: new Date().toISOString(), total_ms: Date.now() - T0, radrader: RADER }));
  process.stdout.write("\n" + MARK_END + "\n");
}

let fardig = false;
(async () => {
  for (const [namn, f] of FASER) {
    if (Date.now() - T0 > 86000) { rad("system", "fas " + namn, "SKIP", "tiden rann ut innan fasen startades", "-"); continue; }
    try {
      await f();
    } catch (e) {
      rad("system", "fas " + namn, "FAIL", "oväntat fel: " + felText(e), "-");
    }
  }
  fardig = true;
  skriv(false);
  process.exit(0);
})().catch((e) => {
  rad("system", "oväntat fel", "FAIL", felText(e), "-");
  fardig = true;
  skriv(false);
  process.exit(0);
});
setTimeout(() => {
  if (!fardig) {
    skriv(true);
    process.exit(0);
  }
}, 88000).unref();
`;

// ── 2) Kör tmp-filen med tsx under 90 s-budget ────────────────────────────────
function doda(barn) {
  if (barn.killed || barn.exitCode !== null) return;
  if (process.platform === "win32" && typeof barn.pid === "number") {
    spawnSync("taskkill", ["/pid", String(barn.pid), "/T", "/F"]);
  } else {
    try { barn.kill("SIGKILL"); } catch { /* ignorera */ }
  }
}

async function kørTsx() {
  return new Promise((res) => {
    const barn = spawn("npx", ["--yes", "tsx", "tmp_motor_koll.ts"], {
      cwd: REPO,
      shell: true,
      env: { ...process.env, NO_COLOR: "1" },
    });
    let ut = "";
    let fel = "";
    if (barn.stdout) { barn.stdout.setEncoding("utf8"); barn.stdout.on("data", (d) => { ut += d; }); }
    if (barn.stderr) { barn.stderr.setEncoding("utf8"); barn.stderr.on("data", (d) => { fel += d; }); }
    const stop = setTimeout(() => {
      doda(barn);
      setTimeout(() => res({ utdata: ut, felutdata: fel, kod: null, timeout: true }), 2500);
    }, TIMEOUT_MS);
    barn.on("error", (e) => { clearTimeout(stop); res({ utdata: ut, felutdata: fel + "\nspawn-fel: " + e.message, kod: null, timeout: false }); });
    barn.on("close", (kod) => { clearTimeout(stop); res({ utdata: ut, felutdata: fel, kod, timeout: false }); });
  });
}

function parsaMarkorer(utdata) {
  const i = utdata.indexOf(MARK_START);
  const j = utdata.lastIndexOf(MARK_END);
  if (i < 0 || j <= i) return null;
  const blob = utdata.slice(i + MARK_START.length, j).trim();
  try {
    return JSON.parse(blob);
  } catch {
    return null;
  }
}

// ── 3) Rapport (append-läge) ──────────────────────────────────────────────────
function esc(x, max = 260) {
  return String(x ?? "-")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ")
    .replaceAll("\r", "")
    .slice(0, max);
}

function byggRapport(payload, meta) {
  const nu = new Date();
  const ts = nu.toISOString();
  const rader = payload && Array.isArray(payload.radrader) ? payload.radrader : [];
  if (rader.length === 0) {
    rader.push({
      motor: "system",
      kontroll: "körning av tmp_motor_koll.ts via npx tsx",
      status: "FAIL",
      detalj: meta.timeout
        ? "tidsgräns 90 s överskreds — processen dödades, inga kontroller kunde köras"
        : "ingen JSON-utdata att tolka (exitkod=" + String(meta.kod) + ")",
      varden: meta.stderr.slice(0, 200),
    });
  }
  const antal = (s) => rader.filter((r) => r.status === s).length;
  const motorer = [...new Set(rader.map((r) => r.motor))];

  const linjer = [];
  linjer.push("---\n");
  linjer.push("# Motorervalidering — " + ts + "\n");
  linjer.push("- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)");
  linjer.push("- **Miljö:** node " + process.version + " på " + process.platform + "; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)");
  linjer.push("- **Körtid:** " + meta.totalS.toFixed(1) + " s (budget 90 s" + (meta.timeout ? " — **ÖVERSKRIDEN, process dödad**" : ", inom budget") + ")");
  const intern = payload && typeof payload.total_ms === "number" ? payload.total_ms : null;
  if (intern !== null) linjer.push("- **Internt (tsx):** " + (intern / 1000).toFixed(1) + " s; startad " + String(payload.startad) + ", klar " + String(payload.klar));
  linjer.push("");
  linjer.push("## Sammanfattning\n");
  linjer.push("| Motor | PASS | FAIL | SKIP |");
  linjer.push("|---|---:|---:|---:|");
  for (const m of motorer) {
    const p = rader.filter((r) => r.motor === m && r.status === "PASS").length;
    const f = rader.filter((r) => r.motor === m && r.status === "FAIL").length;
    const s = rader.filter((r) => r.motor === m && r.status === "SKIP").length;
    linjer.push("| " + esc(m, 60) + " | " + p + " | " + f + " | " + s + " |");
  }
  linjer.push("| **Totalt** | **" + antal("PASS") + "** | **" + antal("FAIL") + "** | **" + antal("SKIP") + "** |");
  linjer.push("");
  linjer.push("## Kontroller i detalj\n");
  linjer.push("| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |");
  linjer.push("|---|---|---|---|---|---:|");
  for (const r of rader) {
    linjer.push(
      "| " + esc(r.motor, 60) +
      " | " + esc(r.kontroll, 120) +
      " | **" + r.status + "**" +
      " | " + esc(r.varden) +
      " | " + esc(r.detalj, 300) +
      " | " + String(r.tid_ms ?? "-") + " |",
    );
  }
  linjer.push("");
  if (meta.stderr.trim().length > 0) {
    linjer.push("## stderr från tsx-körningen (trunkerad)\n");
    linjer.push("```");
    linjer.push(meta.stderr.trim().slice(0, 1500));
    linjer.push("```\n");
  }
  linjer.push("_Rapport genererad av verktyg/validera-motorer.mjs — kontroller: struktur, matematik (NCAV m.m.), determinism, gränser, robusthet (90 s)._");
  linjer.push("");
  return linjer.join("\n");
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  const t0 = Date.now();
  process.stdout.write("[validera-motorer] genererar tmp_motor_koll.ts ...\n");
  writeFileSync(TMP_TS, TS_KOD, "utf8");
  mkdirSync(path.dirname(RAPPORT_SOK), { recursive: true });
  try {
    process.stdout.write("[validera-motorer] kör npx --yes tsx tmp_motor_koll.ts (budget 90 s) ...\n");
    const r = await kørTsx();
    const totalS = (Date.now() - t0) / 1000;
    const payload = parsaMarkorer(r.utdata);
    const rapport = byggRapport(payload, { totalS, timeout: r.timeout, kod: r.kod, stderr: r.felutdata });
    appendFileSync(RAPPORT_SOK, rapport, "utf8");
    const rader = payload && Array.isArray(payload.radrader) ? payload.radrader : [];
    const p = rader.filter((x) => x.status === "PASS").length;
    const f = rader.filter((x) => x.status === "FAIL").length;
    const s = rader.filter((x) => x.status === "SKIP").length;
    console.log("");
    console.log("RESULTAT: " + p + " PASS / " + f + " FAIL / " + s + " SKIP (" + totalS.toFixed(1) + " s" + (r.timeout ? ", TIMEOUT" : "") + ")");
    for (const rad of rader.filter((x) => x.status === "FAIL")) {
      console.log("  FAIL [" + rad.motor + "] " + rad.kontroll + " — " + String(rad.detalj).slice(0, 220));
    }
    for (const rad of rader.filter((x) => x.status === "SKIP")) {
      console.log("  SKIP [" + rad.motor + "] " + rad.kontroll);
    }
    console.log("Rapport: " + RAPPORT_SOK);
    return f > 0 ? 1 : 0;
  } finally {
    try { unlinkSync(TMP_TS); } catch { /* redan borta */ }
    process.stdout.write("[validera-motorer] tmp_motor_koll.ts raderad — klart.\n");
  }
}

main().then((kod) => process.exit(kod)).catch((e) => {
  console.error("[validera-motorer] FEL: " + (e instanceof Error ? e.stack : String(e)));
  try { unlinkSync(TMP_TS); } catch { /* ignorera */ }
  process.exit(1);
});
