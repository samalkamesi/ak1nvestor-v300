#!/usr/bin/env node
/**
 * AK1A — 100%-VÄKTAREN för motorerna (våg 49, kunddirektiv: "inga slappheter
 * är tillåtna och kontroller för att allt ska få 100% är obligatoriska").
 *
 * VARJE deterministisk motor i src/lib har minst ett deterministiskt test.
 * SKIP är FÖRBJUDET: en kontroll som inte kan köras är ett FEL, aldrig en
 * förbiarelse. Resultat under 100% PASS (dvs FAIL>0 eller SKIP>0) ger
 * avslutskod 1 — Kvalitetsvakten (sektion 7) stoppar då med GUL/RÖD.
 *
 * Skriptet gör så här (node kan inte importera TS direkt):
 *   1. Genererar tmp_motor_koll.ts i repots rot — en fil som sätter upp en
 *      localStorage-shim (klientmotorernas kontrakt) och DÄREFTER importerar
 *      motorerna via await import(...) och kör alla kontroller.
 *   2. Kör den med: npx --yes tsx tmp_motor_koll.ts  (under en hård
 *      Promise.race-tidsbudget på 90 sekunder — robusthetskrav E).
 *   3. Läser JSON-utdata mellan två ASCII-markörer, skriver/apenderar
 *      Markdown-rapport till data/rapporter/motorervalidering-2026-09-02.md.
 *   4. Städar tmp-filen (även vid fel/timeout).
 *
 * FEM FASER:
 *   A) STRUKTUR+MATEMATIK (frusen marknadsdata): vagfundament (20×5-matris,
 *      kategorier/total omräknade för hand), analys (5×5-matris, fib/pos52/
 *      vager), netnet (NCAV omräknad ur oberoende balansposter), konfluens
 *      (skannaKonfluens + motorns EGEN sjalvkontroll), portfolj-vagor
 *      (viktat medel omräknat ur perAktie-profilerna).
 *   B) DETERMINISM: vagfundament, analys, netnet OCH konfluens körs 2× på
 *      samma ticker — JSON måste vara identisk (närmarknad = frusen data).
 *   C) GRÄNSER: ogiltig ticker => snyggt fel, ALDRIG krasch; tomma listor
 *      => tomt svar (även konfluens).
 *   D) FIXTURTEST (rena beräkningskärnor, INGET nät): chatbot-nlu, omtanke-,
 *      kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-,
 *      briefing-, badges-, analysbank-, assistent-motorerna + forsknings-
 *      motorerna akm2/karna, riskportfolj, fundamental-vagmotor, uppfoljning,
 *      forskningslaget (våg 56 M3), vagvalidering (våg 56 bygg-A: dom-
 *      protokoll klass×momentum, enighetsscore 40/30/30, rullande träff-%,
 *      rapportbyggaren) + konfluens-motorns sjalvkontroll på
 *      handgjorda rader.
 *   MÖS) ÖVERSÄTTNINGSSYSTEMET (våg 52 + våg 54): termbankens garanti-kontrakt,
 *      termKonsistens/siffer-/struktur-/lateral-kontroller (pass+fail),
 *      AR-normalisering av östra siffror, versionshash-determinism,
 *      källregistret ur deep-courses.json + ordlistan, motorstatusflödet
 *      (vantar-motor/vantar-kvot utan nycklar — deterministisk ärlighet),
 *      poängsummeringen SAMT (våg 54) den externa motor-kedjans rena kärnor:
 *      termbanks-ersättning POST (fel term → rättad), MyMemory-payload/byt-
 *      delning/kvot-vakter, kedjeordning DeepL→Google→MyMemory och SSRF-
 *      valideringen. Inget nät: motorn testas endast i avstängt läge
 *      (OVERSATTNING_EXTERN_AVSTANGD=1) — externa anrop verifieras LIVE
 *      separat (se worklog våg 54).
 *   TEN) WHITE-LABEL/TENANT (våg 61 bygg-2, B2B-BESLUT steg 2): pro/tenant.ts
 *      — mal-låst disclaimer-kärna (metod+ansvar+data-t.o.m.) kan ALDRIG
 *      renderas bort (negativt test med fientligt tenant-tillägg), P1-prefix-
 *      determinism, ansvarsvakt mot ansvarsskjutande tillägg (b4 lager 2)
 *      + pro-admin-v1 → TenantConfig-mappning med URL-vakt.
 *   E) ROBUSTHET: 90 s total budget (intern 88 s-väktare + process-träd-död).
 *
 * Nätverksberoende delar mockas ALDRIG med riktiga anrop: alla fixturtest
 * kör rena beräkningskärnor; dashfraga:s enda nätberoende (vågkarta-fetch)
 * testas via sin dokumenterade graceful-degradering (relativ URL i Node =>
 * fallback-svar). Kvartetti vagfundament/analys/netnet/konfluens körs på
 * frusen närmarknadsdata (VOLV-B.ST, SAAB-B.ST) — samma villkor som tidigare
 * vågor; deras matematik verifieras oberoende för hand.
 *
 * Användning:  node verktyg/validera-motorer.mjs [--kör-motorer]
 * Avslutskod:  0 OM OCH ENDAST OM 0 FAIL och 0 SKIP. Annars 1.
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
// OBS: ingen backtick och inga ${} i koden nedan (den ligger i en template-literal).
const TS_KOD = String.raw`// tmp_motor_koll.ts — GENERERAD av verktyg/validera-motorer.mjs. Raderas efter körning.
// 100%-väktaren: varje deterministisk motor har minst ett deterministiskt test. SKIP är förbjudet.

import { createHash } from "crypto";

// ── 0) localStorage-shim — körs FÖR modulimporterna (klientmotorernas kontrakt) ──
const LS_DATA = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (LS_DATA.has(k) ? (LS_DATA.get(k) as string) : null),
  setItem: (k: string, v: string) => void LS_DATA.set(k, String(v)),
  removeItem: (k: string) => void LS_DATA.delete(k),
  clear: () => void LS_DATA.clear(),
  key: (i: number) => Array.from(LS_DATA.keys())[i] ?? null,
  get length() { return LS_DATA.size; },
};
(globalThis as any).window = globalThis;
function lsRensa(): void { LS_DATA.clear(); }
function lsSatt(k: string, v: string): void { LS_DATA.set(k, v); }

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
function jamhorJSON(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
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
const KLASSER_JSON = ["impulsvag", "korrigering", "basbygge", "osatt"];

// ── Modulreferenser — fylls i det asynkrona huvudet EFTER shimen (CJS:tåligt:
//    top-level await stöds ej av tsx:i CJS-läge, därför dynamiska importer inuti IIFE:n) ──
let VFM: any, ANA: any, NET: any, KON: any, PVA: any, NLU: any, OMT: any, KUR: any, DAS: any;
let VKN: any, SRP: any, VPL: any, BRE: any, BDG: any, ABK: any, AST: any, KAR: any, RSK: any;
let FVG: any, UPP: any, VVAL: any;
// ENS (våg 59 bygg-1): akm3/ensemble.ts — likaviktat medel av tre profiler.
let ENS: any;
// AK2 (våg 57 D2): akm2-koppling.ts — portföljforskningens bro till AKM2-kärnan.
let AK2: any;
// VÅG 59 (AKM3 steg 3+4): osakerhet.ts (deterministiskt intervall ur poäng×täckning)
// + peer.ts (branschjämförelse på rank/median-basis — läslager, aldrig poäng).
let OSK: any, PER: any;
// REG (våg 60 bygg-A, AKM3 steg 5): akm3/regim.ts — deterministisk regime-
// beskrivning ur G/R/N/Σu med hysteres + 2-snapshots-bekräftelse (deskriptiv).
let REG: any;
// TEN (våg 61 bygg-2, B2B-BESLUT steg 2): pro/tenant.ts — white-label-
// kontraktet + MAL-LÅST disclaimer-kärna (K5) med ansvarsvakt (b4 lager 2).
let TEN: any;
// MÖS (våg 52): översättningssystemets deterministiska kärnor — termbank,
// källregister, kvalitetskontroller + motorstatus (ren kärna, inget nät).
// LGR (våg 55 L1): lager.ts RENA funktioner (event-format + dedupe — nätverks-
// delarna testas LIVE mot Supabase, se worklog våg 55 L1; sviten kör aldrig nät).
let OVS: any, KLL: any, KTR: any, MOT: any, ORD: any, LGR: any;
// FLS (våg 56 M3): forskningslaget.ts — korstabellens läge + veckourval (ren kärna).
let FLS: any;
let körVagfundament: (o: { tickers: string[]; vikter?: Record<string, number> }) => Promise<any>;
let hamtaBalansPoster: (t: string) => Promise<any>;
let körAnalysMotor: (o: { tickers: string[] }) => Promise<any>;
let HZ: string[];
let TEORIER: string[];
let skannaNetnet: (t: string[]) => Promise<any[]>;
let GRAHAM_TROSKEL: number;
let MAX_TICKER_PER_ANROP: number;
let skannaKonfluens: (t: string[]) => Promise<any[]>;
let sjalvkontroll: (r: any[], t?: string[]) => { ok: boolean; fel: string[] };
let valideraKonfluens: any;
let MAX_TICKER_KONFLUENS: number;

// Fas A-produkter som senare faser behöver
let vag1: any = null;
let ana1: any = null;
let net1: any[] = [];
let poster: any[] = [];
let kon1: any[] = [];
let pva1: any = null;

// ══ FAS A: STRUKTUR + MATEMATIK på frusen marknadsdata ═══════════════════════
async function fasA(): Promise<void> {
  const [vag, ana, net, po, kon, pva] = await Promise.all([
    körVagfundament({ tickers: TICKERS, vikter: { "VOLV-B.ST": 1, "SAAB-B.ST": 1 } }),
    körAnalysMotor({ tickers: TICKERS }),
    skannaNetnet(TICKERS),
    Promise.all(TICKERS.map((t) => hamtaBalansPoster(t))),
    skannaKonfluens(TICKERS),
    PVA.raknaPortfoljVagor(TICKERS, { "VOLV-B.ST": 1, "SAAB-B.ST": 1 }),
  ]);
  vag1 = vag; ana1 = ana; net1 = net; poster = po; kon1 = kon; pva1 = pva;

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
      if (!Array.isArray(p.radTexter) || p.radTexter.length !== 7 || p.radTexter.some((s: unknown) => typeof s !== "string")) {
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
        ? "fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; " + vagerOk + " vågklasser omräknade (" + vagerSkip + " gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig)"
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

  // ── netnet: MATEMATIK — NCAV omräknas OM för hand ur balanskomponenter ──
  // SKIP är förbjudet (våg 49): saknas oberoende balansdata verifieras i stället
  // radens EGNA interna konsekvens (forhallande=kurs/NCAV, Grahams klass) —
  // fortfarande en verklig kontroll, aldrig en förbiarelse.
  for (let i = 0; i < TICKERS.length; i++) {
    const t = TICKERS[i];
    const po = poster[i];
    const n = net[i];
    const balansKomplett = po && po.currentAssets !== null && po.currentLiabilities !== null && po.shareIssued && po.shareIssued > 0;
    if (!balansKomplett) {
      const problem: string[] = [];
      if (!n || !isFin(n.ncavPerAktie)) problem.push("ncavPerAktie ej finit");
      if (n && n.kurs !== null && n.kurs !== undefined && isFin(n.ncavPerAktie) && n.ncavPerAktie > 0) {
        const fhVantat = n.kurs / n.ncavPerAktie;
        if (n.forhallande === null || !isFin(n.forhallande) || Math.abs(n.forhallande - fhVantat) > 0.001 + 0.0005 * Math.abs(fhVantat)) {
          problem.push("forhallande: motor=" + String(n.forhallande) + " omräknad=" + fhVantat.toFixed(6));
        }
        const klassVantat = n.forhallande !== null && n.forhallande !== undefined
          ? (n.forhallande < GRAHAM_TROSKEL ? "net-net" : n.forhallande < 1.0 ? "nära" : "ej")
          : null;
        if (klassVantat !== n.klass) problem.push("klass: motor=" + String(n.klass) + " omräknad=" + String(klassVantat));
      } else if (n && n.ncavPerAktie <= 0) {
        if (n.klass !== "ej") problem.push("klass=" + String(n.klass) + " trots NCAV<=0 (väntat 'ej')");
        if (n.forhallande !== null) problem.push("forhallande=" + String(n.forhallande) + " trots NCAV<=0 (väntat null)");
      }
      rad(
        "netnet/NCAV",
        "NCAV internkonsistens (" + t + "; oberoende balansdata ofullständig)",
        problem.length === 0 ? "PASS" : "FAIL",
        problem.length === 0
          ? "oberoende balansposter ofullständiga (motor kan ha använt quoteSummary-fallback) — radens egna fält verifierade: forhallande=kurs÷NCAV, klass enligt GRAHAM_TROSKEL, NCAV<=0 => klass 'ej' + forhallande null"
          : problem.slice(0, 6).join("; "),
        JSON.stringify(po).slice(0, 200),
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

  // ── Graham-konstanter + anropsgränser ──
  rad(
    "netnet/NCAV",
    "GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter",
    GRAHAM_TROSKEL === 0.667 && MAX_TICKER_PER_ANROP === 15 ? "PASS" : "FAIL",
    "GRAHAM_TROSKEL=" + String(GRAHAM_TROSKEL) + " (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=" + String(MAX_TICKER_PER_ANROP) + " (förväntat 15)",
    String(GRAHAM_TROSKEL) + "/" + String(MAX_TICKER_PER_ANROP),
  );

  // ── konfluens: STRUKTUR+MATEMATIK end-to-end via motorns EGNA sjalvkontroll ──
  {
    const problem: string[] = [];
    if (!Array.isArray(kon) || kon.length !== 2) problem.push("rader=" + (Array.isArray(kon) ? kon.length : "ej array") + " (förväntat 2)");
    const sj = Array.isArray(kon) ? sjalvkontroll(kon, TICKERS) : { ok: false, fel: ["inga rader"] };
    if (!sj.ok) problem.push("sjalvkontroll: " + sj.fel.slice(0, 4).join("; "));
    if (Array.isArray(kon)) {
      for (const r of kon) {
        for (const f of ["vardgolv", "kvalitet", "fundamentalVagstart", "prisVaglage", "konfluens"]) {
          const v = r[f];
          if (v === null || v === undefined) continue;
          if (!isFin(v) || !Number.isInteger(v) || v < 0 || v > 100) problem.push(r.ticker + "." + f + "=" + String(v) + " (ej heltal i [0,100])");
        }
        if (!Number.isInteger(r.datakallor) || r.datakallor < 0 || r.datakallor > 3) problem.push(r.ticker + ".datakallor=" + String(r.datakallor));
      }
    }
    rad(
      "konfluens",
      "STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika)"
        : problem.slice(0, 6).join("; "),
      Array.isArray(kon) ? kon.map((r) => r.ticker + ": konfluens=" + String(r.konfluens) + " vg=" + String(r.vardgolv) + " klass=" + String(r.klass)).join(" | ") : "-",
    );
  }

  // ── portfolj-vagor: STRUKTUR + MATEMATIK (viktat medel omräknat ur perAktie) ──
  {
    const problem: string[] = [];
    const KLASSNYCKLAR = ["impulsvag", "korrigering", "basbygge", "osatt"];
    if (!pva || typeof pva !== "object") problem.push("svar saknas");
    else {
      const tickersMedData = Object.keys(pva.perAktie || {});
      if (tickersMedData.length !== 2) problem.push("perAktie=" + tickersMedData.length + " nycklar (förväntat 2)");
      const viktTab: Record<string, number> = { "VOLV-B.ST": 0.5, "SAAB-B.ST": 0.5 };
      for (const h of HZ) {
        for (const t of tickersMedData) {
          const profil = pva.perAktie[t][h];
          if (!profil) { problem.push("perAktie." + t + "." + h + " saknas"); continue; }
          const sum = KLASSNYCKLAR.reduce((s, k) => s + (profil[k] ?? 0), 0);
          if (Math.abs(sum - 1) > 0.0011) problem.push("perAktie." + t + "." + h + " summa=" + sum + " (ej 1 — profilen ska vara en-hot)");
        }
        for (const k of KLASSNYCKLAR) {
          let expected = 0;
          let vikt = 0;
          for (const t of tickersMedData) {
            const osatt = pva.perAktie[t][h] ? pva.perAktie[t][h].osatt === 1 : true;
            if (osatt) continue;
            expected += (viktTab[t] ?? 0) * (pva.perAktie[t][h][k] ?? 0);
            vikt += viktTab[t] ?? 0;
          }
          const motor = pva.portfolj[h] ? pva.portfolj[h][k] : undefined;
          const expectedViktat = vikt > 0 ? expected / vikt : 0;
          if (!isFin(motor)) { problem.push("portfolj." + h + "." + k + " ej finit"); continue; }
          if (Math.abs(motor - expectedViktat) > 0.0011) {
            problem.push("portfolj." + h + "." + k + ": motor=" + motor + " omräknad=" + expectedVigtatBuild(expectedViktat) + " (ur perAktie + likavikter)");
          }
          if (motor < 0 || motor > 1) problem.push("portfolj." + h + "." + k + "=" + String(motor) + " (ej andel 0–1)");
        }
      }
      const samSumma = KLASSNYCKLAR.reduce((s, k) => s + (pva.sammanfattning ? pva.sammanfattning[k] ?? 0 : 0), 0);
      if (Math.abs(samSumma - 5) > 0.11) problem.push("sammanfattningssumma=" + samSumma + " (≈5 = 5 horisonter × 1)");
      if (typeof pva.totalText !== "string" || pva.totalText.length === 0) problem.push("totalText saknas");
    }
    rad(
      "portfolj-vagor",
      "STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5"
        : problem.slice(0, 6).join("; "),
      "sammanfattning=" + JSON.stringify(pva && pva.sammanfattning),
    );
  }
}
function expectedVigtatBuild(x: number): string { return x.toFixed(6); }

// ══ FAS B: DETERMINISM — varje motor 2× på samma ticker (frusen data) ════════
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

async function fasB(): Promise<void> {
  // vagfundament
  {
    const v2 = await körVagfundament({ tickers: ["VOLV-B.ST"] });
    const r1 = vag1 && vag1.tickers[0];
    const r2 = v2.tickers[0];
    const s1 = JSON.stringify(r1);
    const s2 = JSON.stringify(r2);
    if (s1 === s2) {
      rad("vagfundament", "DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt)", "PASS",
        "två separata körningar gav byte-identisk JSON (" + s1.length + " tecken) — konsistent med frusen marknadsdata", "längd=" + s1.length);
    } else {
      rad("vagfundament", "DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt)", "FAIL",
        "utdata skiljer mellan körningar. Första skillnad: " + String(firstDiff(r1, r2, "rot")), "längd " + s1.length + " vs " + s2.length);
    }
  }
  // analys
  {
    const a2 = await körAnalysMotor({ tickers: ["VOLV-B.ST"] });
    const r1 = ana1 && ana1.tickers[0];
    const r2 = a2.tickers[0];
    const s1 = JSON.stringify(r1);
    const s2 = JSON.stringify(r2);
    if (s1 === s2) {
      rad("analys", "DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt)", "PASS",
        "två separata körningar gav byte-identisk JSON (" + s1.length + " tecken)", "längd=" + s1.length);
    } else {
      rad("analys", "DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt)", "FAIL",
        "utdata skiljer mellan körningar. Första skillnad: " + String(firstDiff(r1, r2, "rot")), "längd " + s1.length + " vs " + s2.length);
    }
  }
  // netnet
  {
    const n2 = await skannaNetnet(["VOLV-B.ST"]);
    const s1 = JSON.stringify(net1 && net1[0]);
    const s2 = JSON.stringify(n2 && n2[0]);
    if (s1 === s2) {
      rad("netnet", "DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt)", "PASS",
        "två separata körningar gav byte-identisk JSON (" + s1.length + " tecken)", "längd=" + s1.length);
    } else {
      rad("netnet", "DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt)", "FAIL",
        "utdata skiljer mellan körningar. Första skillnad: " + String(firstDiff(net1 && net1[0], n2 && n2[0], "rot")), "längd " + s1.length + " vs " + s2.length);
    }
  }
  // konfluens
  {
    const k2 = await skannaKonfluens(["VOLV-B.ST"]);
    const s1 = JSON.stringify(kon1 && kon1[0]);
    const s2 = JSON.stringify(k2 && k2[0]);
    if (s1 === s2) {
      rad("konfluens", "DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt)", "PASS",
        "två separata körningar gav byte-identisk JSON (" + s1.length + " tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna", "längd=" + s1.length);
    } else {
      rad("konfluens", "DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt)", "FAIL",
        "utdata skiljer mellan körningar. Första skillnad: " + String(firstDiff(kon1 && kon1[0], k2 && k2[0], "rot")), "längd " + s1.length + " vs " + s2.length);
    }
  }
}

// ══ FAS C: GRÄNSER — ogiltiga indata ger snyggt fel, ALDRIG krasch ═══════════
async function fasC(): Promise<void> {
  const [vagX, anaX, netX, konX] = await Promise.all([
    körVagfundament({ tickers: ["XXXX.ST"] }),
    körAnalysMotor({ tickers: ["XXXX.ST"] }),
    skannaNetnet(["XXXX.ST", "BAD TICKER!"]),
    skannaKonfluens([]),
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

  rad(
    "gränser",
    "konfluens tom tickerlista → tomt svar utan krasch",
    Array.isArray(konX) && konX.length === 0 ? "PASS" : "FAIL",
    Array.isArray(konX) && konX.length === 0 ? "skannaKonfluens([]) returnerade []" : "väntat [], fick: " + JSON.stringify(konX).slice(0, 200),
    "0 rader",
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

  // portfolj-vagor: tom lista + maximalt 10 tickers (ren normalisering, inget nät)
  const pvaTom = await PVA.raknaPortfoljVagor([]);
  const tomOk2 = pvaTom && Object.keys(pvaTom.perAktie || {}).length === 0 && typeof pvaTom.totalText === "string" && pvaTom.totalText.length > 0;
  rad(
    "gränser",
    "portfolj-vagor tom lista → tom struktur + pedagogisk text",
    tomOk2 ? "PASS" : "FAIL",
    tomOk2 ? "perAktie={}, portföljprofil nollställd, totalText närvarande" : "fick: " + JSON.stringify(pvaTom).slice(0, 200),
    JSON.stringify(pvaTom && pvaTom.sammanfattning),
  );
}

// ══ FAS D: FIXTURTEST — rena beräkningskärnor, INGET nätverk ═════════════════

// ── Bolagsnyckeltals-fixturer (samma bounding som testa-akm2-karna.mjs) ─────
const KALLOR = [
  { namn: "Yahoo Finance", hamtat: "2026-09-01" },
  { namn: "MarketStack", hamtat: "2026-09-01" },
];
const NUL_FIX: any = {
  ticker: "NUL.ST", namn: "Nolla AB", bransch: "teknik", land: "Sverige", valuta: "SEK",
  kallor: [], hamtat: "2026-09-01", pris: null, marknadsKapitalMdr: null,
  tillvaxt: { omsattningCAGR5ar: null, resultatCAGR5ar: null, omsattningTillvaxtTTM: null, prognosTillvaxt: null },
  lonksamhet: { roe: null, roic: null, bruttoMarginal: null, ebitMarginal: null, nettoMarginal: null, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: null },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: null, bruttoMarginalSpread5ar: null, roeMedel5ar: null },
  vardering: { pe: null, pb: null, evEbit: null, peg: null, fcfYield: null, egenKapitalMultipl: null },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
};
const HEL_FIX: any = {
  ...NUL_FIX,
  ticker: "HEL.ST", namn: "Hellas fabrik", bransch: "industri",
  kallor: KALLOR, pris: 100, marknadsKapitalMdr: 10,
  tillvaxt: { omsattningCAGR5ar: 0.18, resultatCAGR5ar: 0.15, omsattningTillvaxtTTM: 0.32, prognosTillvaxt: 0.2 },
  lonksamhet: { roe: 0.28, roic: 0.18, bruttoMarginal: 0.42, ebitMarginal: 0.16, nettoMarginal: 0.12, fcfMarginal: 0.1 },
  stabilitet: { skuldEgenkapital: 0.7, rantaTackning: 8, fcfPositivaSenaste5: 5, kassaManaderBurnRate: 80, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: 0.5, andelUtestande: 0.025, insiderkopSenaste6man: 2 },
  moat: { bruttoMarginalMedel5ar: 0.41, bruttoMarginalSpread5ar: 0.02, roeMedel5ar: 0.26 },
  vardering: { pe: 18, pb: 1.8, evEbit: 12, peg: 1.2, fcfYield: 0.05, egenKapitalMultipl: 1.8 },
  golv: { typ: "reim", vardePerAktie: 80, marginal: -0.25 },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [1000, 1050, 1100, 1150, 1200], resultat: [80, 90, 100, 110, 120], egetKapital: [700, 750, 800, 850, 900], fcf: [60, 65, 70, 75, 80] },
};
const NEG_FIX: any = {
  ...NUL_FIX,
  ticker: "NEG.ST", namn: "Negativa AB", bransch: "konsument",
  kallor: KALLOR,
  tillvaxt: { omsattningCAGR5ar: -0.08, resultatCAGR5ar: -0.1, omsattningTillvaxtTTM: -0.12, prognosTillvaxt: null },
  lonksamhet: { roe: 0.04, roic: -0.02, bruttoMarginal: 0.08, ebitMarginal: -0.02, nettoMarginal: -0.05, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: 4.2, rantaTackning: 0.8, fcfPositivaSenaste5: 1, kassaManaderBurnRate: 10, nyemissionerSenaste5ar: 3 },
  vardering: { pe: null, pb: -0.5, evEbit: null, peg: null, fcfYield: null, egenKapitalMultipl: -0.5 },
  serier: { ar: ["2021", "2022", "2023", "2024", "2025"], omsattning: [100, 220, 70, 250, 90], resultat: [5, 8, 2, 9, 1], egetKapital: [50, 55, 40, 45, 30], fcf: [-5, -8, -10, -6, -9] },
};

// Konfluensrads-fixturer (klassenligt klassBestam-reglerna: 70/50/3)
function konRad(ticker: string, vg: number | null, vs: number | null, kf: number | null, klass: any, datakallor: number): any {
  return {
    ticker: ticker, vardgolv: vg, kvalitet: null, fundamentalVagstart: vs,
    prisVaglage: null, divergens: null, konfluens: kf, klass: klass, datakallor: datakallor,
  };
}

// KorstabbellRad-fixturer (riskportfolj + uppfoljning)
function korstadRad(ticker: string, bransch: string, akm1: number, status: string, datum: string): any {
  const per: Record<string, string> = {};
  for (const h of ["mikro", "kort", "medellang", "lang", "mega"]) per[h] = "basbygge";
  return {
    ticker: ticker, namn: "Bolag " + ticker, bransch: bransch, akm1Totalt: akm1,
    akm1PerKategori: {}, fvagPerHorisont: { ...per }, fvagDynamik: "stabilt",
    tvagPerHorisont: { ...per }, golvMarginal: 0.3, senastKontrollerad: datum, status: status,
  };
}

async function fasD(): Promise<void> {
  // ── chatbot-nlu: normalisering + ämnesigenkänning ──────────────────────────
  {
    const problem: string[] = [];
    const n1 = NLU.normaliseraFraga("Vadd är P/E?");
    if (n1.ren !== "vad ar pe") problem.push("'Vadd är P/E?' → ren='" + n1.ren + "' (förväntat 'vad ar pe')");
    if (NLU.hamtaAmne(n1) !== "pe") problem.push("ämne=" + String(NLU.hamtaAmne(n1)) + " (förväntat pe)");
    const n2 = NLU.normaliseraFraga("brasken");
    if (n2.ren !== "borsen") problem.push("'brasken' → ren='" + n2.ren + "' (förväntat 'borsen')");
    if (NLU.hamtaAmne(n2) !== "borsen") problem.push("ämne=" + String(NLU.hamtaAmne(n2)) + " (förväntat borsen)");
    const n3 = NLU.normaliseraFraga("hur räknar man bruttomarginal ju liksom");
    if (NLU.hamtaAmne(n3) !== "v07") problem.push("'bruttomarginal' → ämne=" + String(NLU.hamtaAmne(n3)) + " (förväntat v07)");
    const n4 = NLU.normaliseraFraga("mr market är dum");
    if (NLU.hamtaAmne(n4) !== "mrmarket") problem.push("'mr market' → ämne=" + String(NLU.hamtaAmne(n4)) + " (förväntat mrmarket)");
    if (NLU.levenshtein("katt", "katt") !== 0) problem.push("levenshtein(katt,katt) != 0");
    if (NLU.levenshtein("fond", "bond") !== 1) problem.push("levenshtein(fond,bond) != 1");
    if (NLU.levenshtein("abc", "abcde") !== 2) problem.push("levenshtein(abc,abcde) != 2 (snabbavvisning)");
    if (!NLU.arFoljdfraga(NLU.normaliseraFraga("och P/E?"))) problem.push("'och P/E?' ska vara följdfråga");
    if (NLU.arFoljdfraga(NLU.normaliseraFraga("Vad är P/E?"))) problem.push("'Vad är P/E?' ska INTE vara följdfråga");
    rad(
      "chatbot-nlu",
      "FIXTUR normalisering + ämne + levenshtein + följdfråga",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej"
        : problem.slice(0, 6).join("; "),
      "ren1='" + n1.ren + "' ren2='" + n2.ren + "'",
    );
  }
  // ── chatbot-nlu: determinism ───────────────────────────────────────────────
  {
    const fragor = ["Vadd är P/E?", "brasken", "hur räknar man bruttomarginal ju liksom", "och ps?", "vad är vallgrav"];
    const a = fragor.map((f) => { const n = NLU.normaliseraFraga(f); return { ren: n.ren, amne: NLU.hamtaAmne(n) }; });
    const b = fragor.map((f) => { const n = NLU.normaliseraFraga(f); return { ren: n.ren, amne: NLU.hamtaAmne(n) }; });
    const lika = jamhorJSON(a, b);
    rad(
      "chatbot-nlu",
      "DETERMINISM 5 frågor 2× (JSON identiskt)",
      lika ? "PASS" : "FAIL",
      lika ? JSON.stringify(a) : "normalisering/ämne skiljer mellan körningar",
      JSON.stringify(a.map((x) => x.amne)),
    );
  }

  // ── omtanke-motor: lasOmtanke på fixture-signaler ──────────────────────────
  {
    const problem: string[] = [];
    const basSignal = { tracerSidor: [], xp: null as number | null, niva: null as number | null, streak: null as number | null, mentorFragor: 0, senasteMentorFraga: null as string | null, senastAktiv: null as string | null, inteForstaBesok: false, profilSvarad: false };
    const oro = OMT.lasOmtanke({ ...basSignal, senasteMentorFraga: "jag förstår inte P/E" });
    if (!oro || oro.tillstand !== "radslOro" || oro.prioritet !== 1 || oro.lank !== "/dagens-pass") {
      problem.push("rädslo-oro: " + JSON.stringify(oro && { t: oro.tillstand, p: oro.prioritet, l: oro.lank }));
    }
    const borta = OMT.lasOmtanke({ ...basSignal, senastAktiv: new Date(Date.now() - 40 * 86400000).toISOString() });
    if (!borta || borta.tillstand !== "aterkomsten" || borta.prioritet !== 2) {
      problem.push("återkomst: " + JSON.stringify(borta && { t: borta.tillstand, p: borta.prioritet }));
    }
    const harmoni = OMT.lasOmtanke({ ...basSignal, tracerSidor: ["/kurser/a", "/kurser/b"], mentorFragor: 1, xp: 500 });
    if (harmoni !== null) problem.push("harmoni-fixture skulle ge null, fick " + JSON.stringify(harmoni && harmoni.tillstand));
    const d1 = JSON.stringify(OMT.lasOmtanke({ ...basSignal, senasteMentorFraga: "det känns svårt" }));
    const d2 = JSON.stringify(OMT.lasOmtanke({ ...basSignal, senasteMentorFraga: "det känns svårt" }));
    if (d1 !== d2) problem.push("lasOmtanke ej deterministisk");
    rad(
      "omtanke-motor",
      "FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2×"
        : problem.slice(0, 6).join("; "),
      "oro=" + String(oro && oro.tillstand) + " aterkomsten=" + String(borta && borta.tillstand) + " harmoni=" + String(harmoni),
    );
  }
  // ── omtanke-motor: lasSignaler läser localStorage-kontraktet ───────────────
  {
    lsRensa();
    lsSatt("ak1a-tracer-v1", JSON.stringify([{ sida: "/kurser/a", ts: "2026-08-01T10:00:00.000Z" }, { sida: "/kurser/b", ts: "2026-08-02T10:00:00.000Z" }]));
    lsSatt("ak1a-member", JSON.stringify({ xp: 120, niva: 1, streak: 2 }));
    lsSatt("ak1a-chat-minne-v1", JSON.stringify([{ roll: "du", text: "vad är pe?" }, { roll: "mentor", text: "svar" }, { roll: "du", text: "hur räknar man" }]));
    lsSatt("ak1a-cookie-samtycke", "1");
    lsSatt("ak1a-kognitiv-profil", "1");
    const s = OMT.lasSignaler();
    const problem: string[] = [];
    if (!jamhorJSON(s.tracerSidor, ["/kurser/a", "/kurser/b"])) problem.push("tracerSidor=" + JSON.stringify(s.tracerSidor));
    if (s.xp !== 120) problem.push("xp=" + String(s.xp));
    if (s.mentorFragor !== 2) problem.push("mentorFragor=" + String(s.mentorFragor));
    if (s.senasteMentorFraga !== "hur räknar man") problem.push("senasteMentorFraga=" + String(s.senasteMentorFraga));
    if (s.senastAktiv !== "2026-08-02T10:00:00.000Z") problem.push("senastAktiv=" + String(s.senastAktiv));
    if (s.inteForstaBesok !== true) problem.push("inteForstaBesok=" + String(s.inteForstaBesok));
    if (s.profilSvarad !== true) problem.push("profilSvarad=" + String(s.profilSvarad));
    lsRensa();
    rad(
      "omtanke-motor",
      "FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true"
        : problem.slice(0, 6).join("; "),
      "tracer=" + String(s.tracerSidor.length) + " xp=" + String(s.xp) + " fragor=" + String(s.mentorFragor),
    );
  }

  // ── kurstips: struktur + exkludering (SSR-väg: ny elev) ────────────────────
  {
    lsRensa();
    const problem: string[] = [];
    const tips = KUR.raknaKurstips();
    if (!Array.isArray(tips) || tips.length < 1 || tips.length > 3) problem.push("antal=" + (Array.isArray(tips) ? tips.length : "ej array"));
    if (Array.isArray(tips) && tips.length > 0) {
      const f = tips[0];
      if (f.slug !== "v01-forsaljningstillvaxt" || (f as any).poäng !== 100) problem.push("första=" + f.slug + " poäng=" + String((f as any).poäng) + " (förväntat v01, 100)");
      for (const t of tips) {
        if (typeof t.slug !== "string" || typeof t.titel !== "string" || typeof (t as any).varför !== "string" || typeof t.ikon !== "string") problem.push("falttyper fel på " + String(t.slug));
        if (!isFin((t as any).poäng)) problem.push("poäng ej finit på " + String(t.slug));
      }
      const exkl = KUR.raknaKurstips({ antal: 3, exkluderaSlug: f.slug });
      if (exkl.some((x: any) => x.slug === f.slug)) problem.push("exkluderaSlug respekteras ej");
    }
    rad(
      "kurstips",
      "FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter"
        : problem.slice(0, 6).join("; "),
      "antal=" + String(Array.isArray(tips) ? tips.length : "-") + " första=" + String(Array.isArray(tips) && tips[0] ? tips[0].slug : "-"),
    );
  }
  // ── kurstips: determinism ──────────────────────────────────────────────────
  {
    lsRensa();
    const a = JSON.stringify(KUR.raknaKurstips({ antal: 3 }));
    const b = JSON.stringify(KUR.raknaKurstips({ antal: 3 }));
    rad("kurstips", "DETERMINISM raknaKurstips 2× (JSON identiskt)", a === b ? "PASS" : "FAIL",
      a === b ? "samma shim-tillstånd → byte-identiska tips" : "tips skiljer mellan körningar", "längd=" + String(a.length));
    lsRensa();
  }

  // ── dashfraga: intents (streak/fallback/hej) ───────────────────────────────
  {
    lsRensa();
    const problem: string[] = [];
    const streakSvar = await DAS.svaraDashFraga("hur går min streak?");
    if (typeof streakSvar.svar !== "string" || streakSvar.svar.toLowerCase().indexOf("streak") < 0) problem.push("streak-svar: " + String(streakSvar.svar).slice(0, 80));
    if (streakSvar.lank !== "/dagens-pass") problem.push("streak-länk=" + String(streakSvar.lank));
    const fb = await DAS.svaraDashFraga("zzz qqq vvv");
    if (String(fb.svar).indexOf("Jag svarar på frågor om din utveckling") !== 0) problem.push("fallback: " + String(fb.svar).slice(0, 80));
    const hej = await DAS.svaraDashFraga("hej du där");
    if (String(hej.svar).indexOf("Hej, och tack") !== 0) problem.push("hej: " + String(hej.svar).slice(0, 80));
    const d1 = JSON.stringify(await DAS.svaraDashFraga("hur går min streak?"));
    const d2 = JSON.stringify(await DAS.svaraDashFraga("hur går min streak?"));
    if (d1 !== d2) problem.push("ej deterministisk");
    rad(
      "dashfraga",
      "FIXTUR intents: streak → /dagens-pass, fallback, hälsning",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2×"
        : problem.slice(0, 6).join("; "),
      "streakLank=" + String(streakSvar.lank),
    );
  }
  // ── dashfraga: vågkarta-intentens graceful-degradering (inget nät i Node) ──
  {
    lsRensa();
    const v = await DAS.svaraDashFraga("vad säger vågkartan?");
    const ok = String(v.svar).indexOf("Ingen vågkarta har sparats ännu") === 0 && v.ikon === "🌊";
    rad(
      "dashfraga",
      "FIXTUR vågkarta-intent degraderar gracefult när nät saknas",
      ok ? "PASS" : "FAIL",
      ok
        ? "fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel"
        : "väntat fallback-svar, fick: " + JSON.stringify(v).slice(0, 160),
      "ikon=" + String(v.ikon),
    );
  }

  // ── vagkon: σ + bandmatematik omräknad för hand ────────────────────────────
  {
    const H = [100, 110, 105, 120, 115, 130];
    const vk = VKN.raknaVagkon(H);
    const problem: string[] = [];
    if (vk.senaste !== 130 || vk.n !== 6) problem.push("senaste/n=" + String(vk.senaste) + "/" + String(vk.n));
    if (vk.nRetur !== 5) problem.push("nRetur=" + String(vk.nRetur));
    if (vk.otillracklig !== false) problem.push("otillracklig=true trots 6 punkter");
    // oberoende σ-uträkning (egen kodväg: reduce + explicit avvikelser)
    const ret: number[] = [];
    for (let i = 1; i < H.length; i++) ret.push(Math.log(H[i] / H[i - 1]));
    const medel = ret.reduce((s, x) => s + x, 0) / ret.length;
    let kvad = 0;
    for (const r of ret) kvad += (r - medel) * (r - medel);
    const sigmaVantat = Math.sqrt(kvad / (ret.length - 1));
    if (!isFin(vk.sigma) || Math.abs((vk.sigma as number) - sigmaVantat) > 1e-12) {
      problem.push("sigma: motor=" + String(vk.sigma) + " omräknad=" + sigmaVantat.toFixed(12));
    }
    const mega = vk.horisonter["mega"];
    if (!mega) problem.push("mega saknas");
    else {
      if (mega.steg !== 48 || mega.median.length !== 48) problem.push("mega steg=" + String(mega.steg));
      for (let t = 1; t <= 48; t++) {
        if (mega.median[t - 1] !== 130) { problem.push("median[" + t + "]=" + String(mega.median[t - 1]) + " (μ=0 ⇒ platt på S0)"); break; }
        const p10v = 130 * Math.exp((VKN.VAGKON_Z.p10 as number) * (sigmaVantat as number) * Math.sqrt(t));
        const p90v = 130 * Math.exp((VKN.VAGKON_Z.p90 as number) * (sigmaVantat as number) * Math.sqrt(t));
        if (Math.abs(mega.p10[t - 1] - p10v) > 1e-9 || Math.abs(mega.p90[t - 1] - p90v) > 1e-9) {
          problem.push("band t=" + t + ": p10 " + String(mega.p10[t - 1]) + "/" + p10v.toFixed(9) + " p90 " + String(mega.p90[t - 1]) + "/" + p90v.toFixed(9));
          break;
        }
      }
      if (!(mega.p10[47] < mega.p10[0] && mega.p90[47] > mega.p90[0])) problem.push("bandet breddar ej med √t");
      if (mega.medianSlut !== 130) problem.push("medianSlut=" + String(mega.medianSlut));
    }
    rad(
      "vagkon",
      "MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t))",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton"
        : problem.slice(0, 6).join("; "),
      "sigma=" + String(vk.sigma) + " medianSlut(mega)=" + String(vk.horisonter["mega"] && vk.horisonter["mega"].medianSlut),
    );
  }
  // ── vagkon: horisontval + rensning + otillräcklig + determinism ────────────
  {
    const problem: string[] = [];
    const baraMega = VKN.raknaVagkon([10, 11, 12, 13, 14], ["mega"]);
    if (!jamhorJSON(baraMega.ordning, ["mega"]) || Object.keys(baraMega.horisonter).length !== 1) {
      problem.push("horisontval: ordning=" + JSON.stringify(baraMega.ordning));
    }
    if (VKN.raknaVagkon([10, 11], ["mega"]).otillracklig !== true) problem.push("2 punkter ska vara otillräcklig");
    const kort = VKN.raknaVagkon([100]);
    if (kort.otillracklig !== true || kort.sigma !== null || Object.keys(kort.horisonter).length !== 0) {
      problem.push("1 punkt: " + JSON.stringify({ o: kort.otillracklig, s: kort.sigma, h: Object.keys(kort.horisonter).length }));
    }
    const ren = VKN.raknaVagkon([100, -5, 110, NaN, 0, 120] as unknown as number[]);
    if (ren.n !== 5 || ren.senaste !== 120) problem.push("rensning: n=" + String(ren.n) + " senaste=" + String(ren.senaste) + " (förväntat 5 — endast icke-tal (NaN) rensas; negativa/0 är äkta tal enligt dokumentationen)");
    const a = JSON.stringify(VKN.raknaVagkon(H2()));
    const b = JSON.stringify(VKN.raknaVagkon(H2()));
    if (a !== b) problem.push("ej deterministisk");
    rad(
      "vagkon",
      "FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk"
        : problem.slice(0, 6).join("; "),
      "n(ren)=" + String(ren.n),
    );
  }

  // ── spaced-repetition: SM-2 sekvens ────────────────────────────────────────
  {
    lsRennaSR();
    const problem: string[] = [];
    const s1 = SRP.bedomKort("sr-fix-1", 5);
    if (s1.facit !== 2.2 || s1.intervall !== 1 || s1.repetitioner !== 1) problem.push("q5: " + JSON.stringify(s1));
    const s2 = SRP.bedomKort("sr-fix-1", 4);
    if (s2.facit !== 1.9 || s2.intervall !== 6 || s2.repetitioner !== 2) problem.push("q4: " + JSON.stringify(s2));
    const s3 = SRP.bedomKort("sr-fix-1", 2);
    if (s3.repetitioner !== 0 || s3.intervall !== 1) problem.push("q2: " + JSON.stringify(s3));
    const s4 = SRP.bedomKort("sr-fix-1", 5);
    if (s4.repetitioner !== 1 || s4.intervall !== 1) problem.push("efter q5 igen: " + JSON.stringify(s4));
    rad(
      "spaced-repetition",
      "FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1"
        : problem.slice(0, 6).join("; "),
      JSON.stringify([s1, s2, s3, s4]).slice(0, 300),
    );
  }
  // ── spaced-repetition: förinställt läge, tak 365, kortunderlag, nästa-datum ─
  {
    lsRennaSR();
    lsSatt("ak1a-sr-v1", JSON.stringify({
      "sr-fix-a": { facit: 1.3, intervall: 100, repetitioner: 5, nastRepetition: "2026-01-01" },
      "sr-fix-b": { facit: 2.5, intervall: 400, repetitioner: 9, nastRepetition: "2026-01-01" },
    }));
    const problem: string[] = [];
    const a = SRP.bedomKort("sr-fix-a", 5);
    if (a.facit !== 1.3 || a.intervall !== 130 || a.repetitioner !== 6) problem.push("facitgolv/×EF: " + JSON.stringify(a) + " (facit 1.3 med q5: 1.3+(0.1−0.4)=1.0 < golvet 1.3 ⇒ 1.3; intervall round(100×1.3)=130)");
    const b = SRP.bedomKort("sr-fix-b", 5);
    if (b.intervall !== 365) problem.push("tak 365: intervall=" + String(b.intervall));
    const def = SRP.statusFor("sr-finns-ej");
    if (def.facit !== 2.5 || def.intervall !== 0 || def.repetitioner !== 0 || def.nastRepetition !== null) {
      problem.push("statusFor default: " + JSON.stringify(def));
    }
    if (!Array.isArray(SRP.ALLA_KORT) || SRP.ALLA_KORT.length < 100) problem.push("ALLA_KORT=" + String(SRP.ALLA_KORT.length));
    const idn = new Set(SRP.ALLA_KORT.map((k: any) => k.id));
    if (idn.size !== SRP.ALLA_KORT.length) problem.push("kort-id ej unika");
    if (!Array.isArray(SRP.SR_KATEGORIER) || SRP.SR_KATEGORIER.length < 5) problem.push("kategorier=" + String(SRP.SR_KATEGORIER.length));
    // nästa repetitionsdatum ≈ idag + intervall (tidszons-robust fönsterkontroll)
    const nastMs = Date.parse(a.nastRepetition as string);
    if (!isFin(nastMs) || Math.abs(nastMs - (Date.now() + a.intervall * 86400000)) > 86400000 * 1.5) {
      problem.push("nastRepetition=" + String(a.nastRepetition) + " (≈" + a.intervall + " dagar fram)");
    }
    const d1 = JSON.stringify(SRP.bedomKort("sr-fix-c", 4));
    lsRennaSR();
    lsSatt("ak1a-sr-v1", JSON.stringify({}));
    const d2 = JSON.stringify(SRP.bedomKort("sr-fix-c", 4));
    if (d1 !== d2) problem.push("ej deterministisk från samma starttillstånd");
    lsRensa();
    rad(
      "spaced-repetition",
      "FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; " + String(SRP.ALLA_KORT.length) + " kort med unika id:n i " + String(SRP.SR_KATEGORIER.length) + " kategorier; nastRepetition ≈ idag+intervall"
        : problem.slice(0, 6).join("; "),
      "kort=" + String(SRP.ALLA_KORT.length) + " kategorier=" + String(SRP.SR_KATEGORIER.length),
    );
  }

  // ── veckoplan: veckoNummer på kända ISO-datum ──────────────────────────────
  {
    const problem: string[] = [];
    if (VPL.veckoNummer(new Date(2026, 0, 1)) !== 1) problem.push("2026-01-01 → " + String(VPL.veckoNummer(new Date(2026, 0, 1))) + " (förväntat 1)");
    if (VPL.veckoNummer(new Date(2026, 0, 5)) !== 2) problem.push("2026-01-05 → " + String(VPL.veckoNummer(new Date(2026, 0, 5))) + " (förväntat 2)");
    if (VPL.veckoNummer(new Date(2027, 0, 1)) !== 53) problem.push("2027-01-01 → " + String(VPL.veckoNummer(new Date(2027, 0, 1))) + " (förväntat 53)");
    const d = new Date(2026, 5, 15);
    if (VPL.veckoNummer(d) !== VPL.veckoNummer(d)) problem.push("ej deterministisk");
    rad(
      "veckoplan",
      "FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53"
        : problem.slice(0, 6).join("; "),
      "v1/v2/v53",
    );
  }
  // ── veckoplan: planstruktur + kryss-toggle + determinism ───────────────────
  {
    lsRensa();
    const problem: string[] = [];
    const p75 = VPL.raknaVeckoPlan({ tidPerVecka: 75 });
    const pass75 = p75.filter((r: any) => r.typ === "pass");
    if (pass75.length !== 5) problem.push("pass-rader=" + String(pass75.length) + " (förväntat 5, mån–fre)");
    const sum75 = p75.reduce((s: number, r: any) => s + r.minut, 0);
    if (sum75 > 75 || sum75 < 25) problem.push("summa minuter=" + String(sum75) + " utanför [25,75]");
    for (const r of p75) {
      if (["pass", "kurs", "rep", "analys"].indexOf(r.typ) < 0) problem.push("typ=" + String(r.typ));
      if (!isFin(r.minut) || r.minut <= 0) problem.push("minut=" + String(r.minut));
      if (typeof r.lank !== "string" || r.lank.charAt(0) !== "/") problem.push("lank=" + String(r.lank));
    }
    const p25 = VPL.raknaVeckoPlan({ tidPerVecka: 25 });
    if (p25.length !== 5) problem.push("25-min plan=" + String(p25.length) + " rader (förväntat exakt 5 pass)");
    // kryss-kontraktet via shim
    const vn = VPL.veckoNummer();
    lsSatt(VPL.VECKOPLAN_NYCKEL, JSON.stringify({ [String(vn)]: [0, 2] }));
    if (!jamhorJSON(VPL.lasKlara(), [0, 2])) problem.push("lasKlara=" + JSON.stringify(VPL.lasKlara()) + " (förväntat [0,2])");
    const m1 = VPL.markeraKlar(1);
    if (!jamhorJSON(m1, [0, 1, 2])) problem.push("markeraKlar(1)=" + JSON.stringify(m1) + " (förväntat [0,1,2])");
    const m2 = VPL.markeraKlar(0);
    if (!jamhorJSON(m2, [1, 2])) problem.push("toggle markeraKlar(0)=" + JSON.stringify(m2) + " (förväntat [1,2])");
    const a = JSON.stringify(VPL.raknaVeckoPlan({ tidPerVecka: 75 }));
    const b = JSON.stringify(VPL.raknaVeckoPlan({ tidPerVecka: 75 }));
    if (a !== b) problem.push("plan ej deterministisk");
    lsRensa();
    rad(
      "veckoplan",
      "FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan"
        : problem.slice(0, 6).join("; "),
      "rader75=" + String(p75.length) + " summa=" + String(sum75) + " rader25=" + String(p25.length),
    );
  }

  // ── briefing: rena textfunktioner ──────────────────────────────────────────
  {
    const problem: string[] = [];
    if (BRE.halsningFranTimme(6) !== "God morgon") problem.push("timme 6");
    if (BRE.halsningFranTimme(12) !== "God dag") problem.push("timme 12");
    if (BRE.halsningFranTimme(18) !== "God kväll") problem.push("timme 18");
    if (BRE.vagLageFranVagdata({ universumSammanfattning: { impulsvag: 3, korrigering: 5, basbygge: 2 } } as any) !== "utvilande korrigeringar") problem.push("dominerande korrigeringar");
    if (BRE.vagLageFranVagdata({ universumSammanfattning: { impulsvag: 5, korrigering: 1, basbygge: 2 } } as any) !== "stigande impulser") problem.push("dominerande impulser");
    if (BRE.vagLageFranVagdata({ universumSammanfattning: { impulsvag: 1, korrigering: 1, basbygge: 4 } } as any) !== "tålmodigt basbygge") problem.push("dominerande basbygge");
    if (BRE.vagLageFranVagdata(null) !== null) problem.push("null-data");
    if (BRE.vagLageFranVagdata({ universumSammanfattning: { impulsvag: 0, korrigering: 0, basbygge: 0 } } as any) !== null) problem.push("tom summa");
    const m1 = BRE.morgonMening({ halsning: "God morgon", niva: 3, vagLage: "stigande impulser", nastaText: "Försäljningstillväxt (10 min, måndag)", streak: 7 });
    const e1 = "God morgon, Nivå 3 — vågkartan andas stigande impulser och din vecka väntar med Försäljningstillväxt (10 min, måndag). Vanan sitter — kedjan bär dig idag.";
    if (m1 !== e1) problem.push("morgonMening streak7: " + m1);
    const m2 = BRE.morgonMening({ halsning: "God dag", niva: 1, vagLage: null, nastaText: null, streak: 1 });
    const e2 = "God dag, Nivå 1 — vågkartan vilar tills dagens mätning och din dag väntar med ett färskt pass. En dag i taget — kedjan växer med dig.";
    if (m2 !== e2) problem.push("morgonMening streak1: " + m2);
    const m3 = BRE.morgonMening({ halsning: "God kväll", niva: 2, vagLage: null, nastaText: null, streak: 0 });
    const e3 = "God kväll, Nivå 2 — vågkartan vilar tills dagens mätning och din dag väntar med ett färskt pass.";
    if (m3 !== e3) problem.push("morgonMening streak0: " + m3);
    rad(
      "briefing",
      "FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0)"
        : problem.slice(0, 6).join("; "),
      "m1='" + m1.slice(0, 60) + "…'",
    );
  }
  // ── briefing: raknaBriefing struktur + determinism ─────────────────────────
  {
    lsRensa();
    const problem: string[] = [];
    const br = await BRE.raknaBriefing();
    if (!isFin(br.niva) || br.niva < 1) problem.push("niva=" + String(br.niva));
    if (!isFin(br.xp) || br.xp < 0) problem.push("xp=" + String(br.xp));
    if (!isFin(br.klaraKurser) || br.klaraKurser < 0) problem.push("klaraKurser=" + String(br.klaraKurser));
    if (typeof br.mening !== "string" || br.mening.length === 0) problem.push("mening saknas");
    if (br.vagdata !== null) problem.push("vagdata ska vara null från raknaBriefing (fylls av komponenten)");
    const nt = BRE.nastaTextFranBriefing(br);
    if (nt !== null && typeof nt !== "string") problem.push("nastaText-typ");
    const br2 = await BRE.raknaBriefing();
    if (JSON.stringify({ ...br, mening: "" }) !== JSON.stringify({ ...br2, mening: "" })) problem.push("ej deterministisk (mening jämförs separat — den följer klocktimmen)");
    if (typeof br2.mening !== "string" || br2.mening.length === 0) problem.push("mening saknas i 2:a körningen");
    rad(
      "briefing",
      "FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2×"
        : problem.slice(0, 6).join("; "),
      "niva=" + String(br.niva) + " xp=" + String(br.xp) + " klara=" + String(br.klaraKurser),
    );
  }

  // ── badges: BADGER-struktur + badgeStatus på tom shim ──────────────────────
  {
    lsRensa();
    const problem: string[] = [];
    if (!Array.isArray(BDG.BADGER) || BDG.BADGER.length < 28) problem.push("BADGER=" + String(BDG.BADGER.length));
    const idn = new Set(BDG.BADGER.map((b: any) => b.id));
    if (idn.size !== BDG.BADGER.length) problem.push("badge-id ej unika");
    for (const b of BDG.BADGER) {
      if (["start", "kurser", "streak", "xp", "ekosystem"].indexOf(b.kategori) < 0) problem.push("kategori=" + String(b.kategori));
      if (!BDG.BADGE_MAP[b.id]) problem.push("BADGE_MAP saknar " + String(b.id));
      if (typeof b.namn !== "string" || typeof b.krav !== "string" || typeof b.beskrivning !== "string") problem.push("fält saknas på " + String(b.id));
    }
    const st = BDG.badgeStatus();
    if (st.length !== BDG.BADGER.length) problem.push("badgeStatus=" + String(st.length) + " (förväntat " + String(BDG.BADGER.length) + ")");
    for (const s of st) {
      if (s.upplast !== false) problem.push("upplast=true på tom shim: " + String(s.badge.id));
      if (!isFin(s.procent) || s.procent < 0 || s.procent > 100) problem.push("procent=" + String(s.procent));
      if (typeof s.framsteg !== "string" || s.framsteg.length === 0) problem.push("framsteg saknas: " + String(s.badge.id));
    }
    rad(
      "badges",
      "FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? String(BDG.BADGER.length) + " meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text"
        : problem.slice(0, 6).join("; "),
      "badger=" + String(BDG.BADGER.length),
    );
  }
  // ── badges: nivå-trösklar + upplåsningskontrakt via shim ───────────────────
  {
    lsRensa();
    const problem: string[] = [];
    lsSatt("ak1a-xp", "550");
    lsSatt("ak1a-klara-kurser", JSON.stringify(["a", "b", "c"]));
    lsSatt("ak1a-streak", JSON.stringify({ antal: 3, basta: 3, senast: "2026-09-01" }));
    lsSatt("ak1a-quiz-k1", "1");
    lsSatt("ak1a-quiz-k2", "1");
    const st = BDG.badgeStatus();
    const map: Record<string, any> = {};
    for (const s of st) map[s.badge.id] = s;
    if (map["niva-5"].procent !== 100) problem.push("xp 550 → nivå 6: niva-5 procent=" + String(map["niva-5"].procent) + " (förväntat 100)");
    if (map["kurser-5"].procent !== 60) problem.push("3 kurser: kurser-5 procent=" + String(map["kurser-5"].procent) + " (förväntat 60)");
    if (map["kurser-5"].framsteg.indexOf("0/5") >= 0) problem.push("kurser-5 framsteg räknar fel: " + map["kurser-5"].framsteg);
    if (map["streak-3"].procent !== 100) problem.push("streak 3: procent=" + String(map["streak-3"].procent));
    if (map["forsta-quiz-ratt"].procent !== 100) problem.push("2 quiz-rätt: procent=" + String(map["forsta-quiz-ratt"].procent));
    if (BDG.geBadge("finns-ej") !== false) problem.push("okänd badge ska ge false");
    if (BDG.geBadge("kurser-5") !== true) problem.push("ny badge ska ge true");
    if (BDG.geBadge("kurser-5") !== false) problem.push("redan upplåst ska ge false");
    if (BDG.harBadge("kurser-5") !== true) problem.push("harBadge efter upplåsning");
    const st2 = BDG.badgeStatus();
    const m2: Record<string, any> = {};
    for (const s of st2) m2[s.badge.id] = s;
    if (m2["kurser-5"].upplast !== true) problem.push("kurser-5 ej upplast i status");
    lsRensa();
    rad(
      "badges",
      "FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false"
        : problem.slice(0, 6).join("; "),
      "niva-5=" + String(map["niva-5"].procent) + "% kurser-5=" + String(map["kurser-5"].procent) + "%",
    );
  }

  // ── analysbank: spara/läsa/uppdatera/tak ───────────────────────────────────
  {
    lsRensa();
    const problem: string[] = [];
    const rad1 = { id: "ab-1", typ: "netnet", ticker: "VOLV-B.ST", titel: "Netnet VOLV", datum: "2026-09-01", sammanfattning: "test", dataJson: "{}" };
    if (ABK.sparaIAnalysbank(rad1 as any) !== true) problem.push("ny rad skulle ge true");
    if (ABK.sparaIAnalysbank(rad1 as any) !== false) problem.push("samma id skulle ge false (uppdatering)");
    const lista1 = ABK.lasAnalysbank();
    if (lista1.length !== 1 || lista1[0].id !== "ab-1") problem.push("lasAnalysbank=" + JSON.stringify(lista1.map((r: any) => r.id)));
    const rad2 = { id: "ab-2", typ: "konfluens", titel: "Konfluens X", datum: "2026-08-01", sammanfattning: "äldre", dataJson: "{}" };
    ABK.sparaIAnalysbank(rad2 as any);
    const lista2 = ABK.lasAnalysbank();
    if (lista2.length !== 2 || lista2[0].id !== "ab-1") problem.push("sortering nyast först: " + JSON.stringify(lista2.map((r: any) => r.id)));
    if (ABK.sparaIAnalysbank({ titel: "saknar id" } as any) !== false) problem.push("ogiltig rad skulle ge false");
    for (let i = 0; i < 55; i++) {
      ABK.sparaIAnalysbank({ id: "ab-m-" + i, typ: "vagfundament", titel: "M" + i, datum: "2026-09-01", sammanfattning: "", dataJson: "{}" } as any);
    }
    const lista3 = ABK.lasAnalysbank();
    if (lista3.length > 50) problem.push("tak 50: " + String(lista3.length));
    lsRensa();
    rad(
      "analysbank",
      "FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id"
        : problem.slice(0, 6).join("; "),
      "rader efter 57 sparningar=" + String(ABK.lasAnalysbank().length),
    );
  }

  // ── assistent: proaktiva förslag + frustration + optimal tid ────────────────
  {
    lsRensa();
    const problem: string[] = [];
    const ctx = { namn: null, niva: 1, xp: 0, streak: 0, klaraKurser: [], mal: null, intresseProfil: {}, aktivTid: 0, typiskaTimmar: [], quizTraff: 0, verktygsVanor: {}, senasteSida: "/", lasTillstand: "nybörjare" } as any;
    const fs = AST.raknaProaktivaForslag(ctx);
    if (!Array.isArray(fs) || fs.length < 1) problem.push("föreslår " + String(Array.isArray(fs) ? fs.length : "ej array") + " (minst 1 krävs)");
    if (Array.isArray(fs) && fs.length > 0 && (fs[0].lank !== "/dagens-pass" || fs[0].prioritet !== 100)) {
      problem.push("första=" + JSON.stringify(fs[0] && { l: fs[0].lank, p: fs[0].prioritet }));
    }
    if (AST.raknaProaktivaForslag(ctx, 1).length > 1) problem.push("maxAntal=1 respekteras ej");
    const lankar = new Set(fs.map((f: any) => f.lank));
    if (lankar.size !== fs.length) problem.push("dublettlänkar i förslagen");
    if (AST.detekteraFrustration({ ...ctx, aktivTid: 30, quizTraff: 30 } as any) !== true) problem.push("frustration: kedjan bruten+30 min+30% skulle vara true");
    if (AST.detekteraFrustration({ ...ctx, aktivTid: 30, quizTraff: 0 } as any) !== false) problem.push("quizTraff 0 → aldrig frustrerad");
    if (AST.detekteraFrustration({ ...ctx, streak: 2, aktivTid: 30, quizTraff: 30 } as any) !== false) problem.push("streak 2 → ej frustrerad");
    if (AST.raknaOptimalTid(ctx) !== "Din dygnsrytm är ännu okänd — varje besök ritar den tydligare.") problem.push("tom rytm");
    if (AST.raknaOptimalTid({ ...ctx, typiskaTimmar: [20, 21, 22] } as any) !== "Dina kvällar — lugnet efter dagen är din finaste studietimma.") problem.push("kvällsrytm");
    if (AST.raknaOptimalTid({ ...ctx, typiskaTimmar: [12, 13] } as any) !== "Dina dagtimmar — en jämn och klar rytm för djupläsning.") problem.push("dagrytm");
    if (AST.raknaOptimalTid({ ...ctx, typiskaTimmar: [20, 8] } as any) !== "Din nyfikenhet kommer både morgon och kväll — välj den stund som känns lättast.") problem.push("blandad rytm");
    rad(
      "assistent",
      "FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter"
        : problem.slice(0, 6).join("; "),
      "forslag=" + String(fs.length) + " forsta=" + String(fs.length > 0 ? fs[0].lank : "-"),
    );
  }
  // ── assistent: hälsning + determinism ──────────────────────────────────────
  {
    lsRensa();
    const ctx = { namn: "Elev", niva: 2, xp: 150, streak: 1, klaraKurser: ["a"], mal: null, intresseProfil: {}, aktivTid: 10, typiskaTimmar: [9], quizTraff: 60, verktygsVanor: {}, senasteSida: "/", lasTillstand: "växande" } as any;
    const h = AST.genereraHalsning(ctx);
    const prefixOk = h.indexOf("God morgon") === 0 || h.indexOf("God dag") === 0 || h.indexOf("God kväll") === 0;
    const innehallOk = h.indexOf(", Elev") > 0 && h.indexOf("kurs") > 0;
    const d1 = JSON.stringify(AST.raknaProaktivaForslag(ctx));
    const d2 = JSON.stringify(AST.raknaProaktivaForslag(ctx));
    rad(
      "assistent",
      "FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism",
      prefixOk && innehallOk && d1 === d2 ? "PASS" : "FAIL",
      prefixOk && innehallOk && d1 === d2
        ? "hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2×"
        : "prefix=" + String(prefixOk) + " innehåll=" + String(innehallOk) + " determinism=" + String(d1 === d2),
      String(h.slice(0, 50)),
    );
  }

  // ── akm2/karna: raknaAKM1 på fixturer ──────────────────────────────────────
  {
    const problem: string[] = [];
    const a1 = KAR.raknaAKM1(HEL_FIX);
    if (!isFin(a1.totalt) || a1.totalt < 0 || a1.totalt > 100) problem.push("totalt=" + String(a1.totalt));
    let sum = 0;
    for (const v of VARS) {
      const p = a1.poang[v];
      if (!isFin(p) || p < 0 || p > 5) problem.push(v + "=" + String(p) + " (ej i [0,5])");
      sum += isFin(p) ? p : 0;
    }
    if (Math.abs(sum - a1.totalt) > 1e-9) problem.push("totalt=" + String(a1.totalt) + " men Σpoang=" + String(sum));
    if (Object.keys(a1.perKategori).length !== KAR.KATEGORIER.length) problem.push("perKategori=" + String(Object.keys(a1.perKategori).length) + " (förväntat " + String(KAR.KATEGORIER.length) + " enligt kärnans KATEGORIER)");
    if (a1.ticker !== "HEL.ST") problem.push("ticker=" + String(a1.ticker));
    const nul = KAR.raknaAKM1(NUL_FIX);
    if (nul.totalt !== 0) problem.push("NUL totalt=" + String(nul.totalt) + " (osatta räknas aldrig)");
    for (const v of VARS) if (nul.poang[v] !== 0) problem.push("NUL " + v + "=" + String(nul.poang[v]));
    if (nul.datum !== "2026-09-01") problem.push("datum=" + String(nul.datum) + " (ska vara k.hamtat — aldrig klocka)");
    rad(
      "akm2/kärna",
      "FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "HEL-fixtur: " + String(a1.totalt) + "/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat"
        : problem.slice(0, 6).join("; "),
      "HEL totalt=" + String(a1.totalt) + " NUL totalt=" + String(nul.totalt),
    );
  }
  // ── akm2/karna: projektionsinvarianten + hård port + determinism ───────────
  {
    const problem: string[] = [];
    const proj = KAR.projiceraAKM1(KAR.raknaAKM2(HEL_FIX, { moduler: [], viktprofil: "akm1-klassisk" }));
    const rak = KAR.raknaAKM1(HEL_FIX);
    if (!jamhorJSON(proj, rak)) problem.push("projektionen avviker från raknaAKM1 (golden test)");
    const neg2 = KAR.raknaAKM2(NEG_FIX);
    if (!isFin(neg2.komposit) || neg2.komposit > KAR.KASSA_PORT_MAX_KOMPOSIT) {
      problem.push("NEG komposit=" + String(neg2.komposit) + " > hård port " + String(KAR.KASSA_PORT_MAX_KOMPOSIT) + " (kassa 10 mån < 12)");
    }
    if (neg2.lager1.totalt !== KAR.raknaAKM1(NEG_FIX).totalt) problem.push("lager1 SKA vara oförändrad AKM1");
    const hel2 = KAR.raknaAKM2(HEL_FIX);
    if (!isFin(hel2.komposit) || hel2.komposit < 0 || hel2.komposit > 100) problem.push("HEL komposit=" + String(hel2.komposit));
    if (hel2.modellVersion !== KAR.MODELL_VERSION) problem.push("modellVersion=" + String(hel2.modellVersion));
    const d1 = JSON.stringify(KAR.raknaAKM2(HEL_FIX));
    const d2 = JSON.stringify(KAR.raknaAKM2(HEL_FIX));
    if (d1 !== d2) problem.push("raknaAKM2 ej deterministisk");
    rad(
      "akm2/kärna",
      "FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit " + String(neg2.komposit) + " ≤ " + String(KAR.KASSA_PORT_MAX_KOMPOSIT) + "; lager1 o modifierad; 2× JSON-identisk"
        : problem.slice(0, 6).join("; "),
      "NEG komposit=" + String(neg2.komposit) + " HEL komposit=" + String(hel2.komposit),
    );
  }

  // ── riskportfolj: profilernas struktur ────────────────────────────────────
  {
    const problem: string[] = [];
    const nycklar = Object.keys(RSK.RISKNIVAER);
    if (nycklar.length !== 9) problem.push("RISKNIVAER=" + String(nycklar.length) + " nycklar (förväntat 9 = 3 nivåer × 3 takter)");
    for (const nk of nycklar) {
      const p = RSK.RISKNIVAER[nk];
      const vsum = ["mikro", "kort", "medellang", "lang", "mega"].reduce((s, h) => s + (p.horisontVikter[h] ?? 0), 0);
      if (Math.abs(vsum - 1) > 1e-9) problem.push(nk + ": horisontvikter summerar " + vsum);
      if (!(p.maxPerAktie > 0 && p.maxPerAktie <= 1)) problem.push(nk + ": maxPerAktie=" + String(p.maxPerAktie));
      if (!(p.maxPerBransch >= p.maxPerAktie)) problem.push(nk + ": maxPerBransch < maxPerAktie");
    }
    const kons = RSK.hamtaRiskProfil("konservativ", "lugn");
    const tillv = RSK.hamtaRiskProfil("tillvaxt", "aggressiv");
    if (!(kons.maxPerAktie <= tillv.maxPerAktie)) problem.push("konservativ maxPerAktie > tillväxt");
    if (RSK.MIN_INNEHAV !== 8 || RSK.MAX_INNEHAV !== 15) problem.push("MIN/MAX_INNEHAV=" + String(RSK.MIN_INNEHAV) + "/" + String(RSK.MAX_INNEHAV));
    rad(
      "riskportfolj",
      "FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav"
        : problem.slice(0, 6).join("; "),
      "konservativ maxPerAktie=" + String(kons.maxPerAktie) + " tillväxt=" + String(tillv.maxPerAktie),
    );
  }
  // ── riskportfolj: byggPortfolj på syntetisk pool ───────────────────────────
  {
    const branscher = ["teknik", "industri", "halso", "konsument", "finans"];
    const pool: any[] = [];
    let n = 0;
    for (const br of branscher) {
      for (let j = 0; j < 3; j++) {
        pool.push(korstadRad("P" + String(n) + ".ST", br, 72 + ((n * 7) % 21), "gron", "2026-08-0" + String((n % 9) + 1)));
        n += 1;
      }
    }
    const problem: string[] = [];
    const profil = RSK.hamtaRiskProfil("balanserad", "stadig");
    const f1 = RSK.byggPortfolj(profil, pool);
    if (!Array.isArray(f1.innehav) || f1.innehav.length < RSK.MIN_INNEHAV || f1.innehav.length > RSK.MAX_INNEHAV) {
      problem.push("innehav=" + String(Array.isArray(f1.innehav) ? f1.innehav.length : "ej array") + " (förväntat 8–15 av 15 kandidater)");
    }
    let vsum = 0;
    const perBransch: Record<string, number> = {};
    for (const ih of f1.innehav) {
      if (!isFin(ih.vikt) || ih.vikt < 0 || ih.vikt > profil.maxPerAktie + 1e-9) problem.push("vikt=" + String(ih.vikt) + " > tak " + String(profil.maxPerAktie));
      vsum += isFin(ih.vikt) ? ih.vikt : 0;
      const b = String((ih as any).bransch || "");
      const br = b || branscher.find((x) => pool.some((p) => p.ticker === ih.ticker && p.bransch === x)) || "?";
      perBransch[br] = (perBransch[br] ?? 0) + (isFin(ih.vikt) ? ih.vikt : 0);
    }
    if (Math.abs(vsum - 1) > 0.001) problem.push("Σvikt=" + String(vsum) + " (förväntat 1)");
    for (const [br, v] of Object.entries(perBransch)) {
      if (v > profil.maxPerBransch + 0.001) problem.push("bransch " + br + " vikt " + String(v) + " > tak " + String(profil.maxPerBransch));
    }
    for (const ih of f1.innehav) {
      const brott = (ih.krav || []).filter((k: any) => k.status === "BROTT");
      if (brott.length > 0) problem.push(String(ih.ticker) + " har BROTT: " + brott.map((k: any) => k.namn).join(","));
    }
    const f2 = RSK.byggPortfolj(profil, pool);
    if (!jamhorJSON(f1, f2)) problem.push("byggPortfolj ej deterministisk");
    rad(
      "riskportfolj",
      "FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? String(f1.innehav.length) + " innehav; vikter inom maxPerAktie=" + String(profil.maxPerAktie) + "; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=" + String(profil.maxPerBransch) + "; inga strikta krav brutna; 2× JSON-identisk"
        : problem.slice(0, 6).join("; "),
      "innehav=" + String(f1.innehav.length) + " viktsumma=" + String(vsum),
    );
  }
  // ── akm2-koppling (våg 57 D2): berikaRadMedAkm2 — akm2Skillnad-formeln ────
  {
    const problem: string[] = [];
    const grundRad = korstadRad("HEL.ST", "industri", 66.5, "gron", "2026-09-01");
    const b1 = AK2.berikaRadMedAkm2(grundRad, HEL_FIX);
    const b2 = AK2.berikaRadMedAkm2(grundRad, HEL_FIX);
    if (!isFin(b1.akm2) || b1.akm2 < 0 || b1.akm2 > 100) problem.push("akm2=" + String(b1.akm2));
    // FORMELN dubbelräknad: akm2Skillnad = akm2 − akm1Totalt (1 decimal).
    const vanta = Math.round((b1.akm2 - grundRad.akm1Totalt) * 10) / 10;
    if (b1.akm2Skillnad !== vanta) {
      problem.push("akm2Skillnad=" + String(b1.akm2Skillnad) + " (förväntat " + String(vanta) + " = akm2 " + String(b1.akm2) + " − akm1Totalt " + String(grundRad.akm1Totalt) + ")");
    }
    // Främmande/saknat nyckeltal ⇒ null + tom modullista (aldrig gissa).
    const fel = AK2.berikaRadMedAkm2(grundRad, { ...HEL_FIX, ticker: "ANNAT.ST" });
    if (fel.akm2 !== null || fel.akm2Skillnad !== null || (fel.akm2Moduler ?? []).length !== 0) problem.push("främmande nyckeltal skulle ge null/[]");
    const tom = AK2.berikaRadMedAkm2(grundRad, null);
    if (tom.akm2 !== null || tom.akm2Skillnad !== null) problem.push("saknat nyckeltal skulle ge null");
    // Industri matchar CYKLISK + TILLGÅNGSTUNG i modulregistret.
    if (!Array.isArray(b1.akm2Moduler) || b1.akm2Moduler.length < 1) problem.push("akm2Moduler=" + JSON.stringify(b1.akm2Moduler));
    // Befintliga fält orörda + determinism (2× JSON-identisk).
    for (const nyckel of ["ticker", "namn", "akm1Totalt", "status", "golvMarginal", "senastKontrollerad"]) {
      if (JSON.stringify((b1 as any)[nyckel]) !== JSON.stringify((grundRad as any)[nyckel])) problem.push(nyckel + " rördes av berikningen");
    }
    if (JSON.stringify(b1) !== JSON.stringify(b2)) problem.push("berikaRadMedAkm2 ej deterministisk");
    rad(
      "akm2-koppling",
      "FIXTUR berikaRadMedAkm2: formeln akm2Skillnad = akm2 − akm1Totalt (1 dec) + moduler + determinism",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "HEL-fixtur (industri): akm2 " + String(b1.akm2) + "/100 med automatiska moduler (" + String(b1.akm2Moduler.length) + " st) och viktprofil akm2-2026; skillnad " + String(b1.akm2Skillnad) + " dubbelräknad mot akm1Totalt " + String(grundRad.akm1Totalt) + "; främmande/saknat nyckeltal → null + tom modullista; befintliga fält orörda; 2× JSON-identisk"
        : problem.slice(0, 6).join("; "),
      "akm2=" + String(b1.akm2) + " skillnad=" + String(b1.akm2Skillnad) + " moduler=" + String(b1.akm2Moduler.length),
    );
  }
  // ── riskportfolj (våg 57 D2): poängbas AKM2 — formel + determinism ────────
  {
    const problem: string[] = [];
    const profil = RSK.hamtaRiskProfil("balanserad", "stadig");
    // Två rader där AKM1- och AKM2-ordningen är INVERTERAD: A vinner på AKM1,
    // B vinner på AKM2 — poängbasen måste byta rankning mellan lägena.
    const a = { ...korstadRad("AK2-A.ST", "teknik", 90, "gron", "2026-09-01"), akm2: 40, akm2Skillnad: -50 };
    const b = { ...korstadRad("AK2-B.ST", "teknik", 40, "gron", "2026-09-01"), akm2: 90, akm2Skillnad: 50 };
    if (!(RSK.raknaPoang(a, profil, "akm1") > RSK.raknaPoang(b, profil, "akm1"))) problem.push("AKM1-läget skulle ranka A före B");
    if (!(RSK.raknaPoang(b, profil, "akm2") > RSK.raknaPoang(a, profil, "akm2"))) problem.push("AKM2-läget skulle ranka B före A");
    // Formel-invariant: poängbasen är ENDA skillnaden — Δpoäng = 0,50 × Δ(bas/100).
    for (const r of [a, b]) {
      const p1 = RSK.raknaPoang(r, profil, "akm1");
      const p2 = RSK.raknaPoang(r, profil, "akm2");
      const vanta = 0.5 * ((r.akm2 - r.akm1Totalt) / 100);
      if (Math.abs(p2 - p1 - vanta) > 1e-12) problem.push(r.ticker + ": Δpoäng " + String(p2 - p1) + " ≠ 0,5×Δbas " + String(vanta));
    }
    // Saknad AKM2 bidrar 0 (motorn gissar aldrig) — samma som akm2 = 0.
    const nolla = { ...a, akm2: null as any, akm2Skillnad: null as any };
    if (Math.abs(RSK.raknaPoang(nolla, profil, "akm2") - RSK.raknaPoang({ ...a, akm2: 0 }, profil, "akm2")) > 1e-12) problem.push("null-akm2 skulle bidra 0");
    // Determinism + kontrakt: poängbas följer med förslaget, id:t skiljer lägena.
    const branscher = ["teknik", "industri", "halso", "konsument", "finans"];
    const pool: any[] = [];
    let n = 0;
    for (const br of branscher) {
      for (let j = 0; j < 3; j++) {
        const p = korstadRad("Q" + String(n) + ".ST", br, 72 + ((n * 7) % 21), "gron", "2026-08-0" + String((n % 9) + 1));
        p.akm2 = 60 + ((n * 11) % 31);
        p.akm2Skillnad = Math.round((p.akm2 - p.akm1Totalt) * 10) / 10;
        p.akm2Moduler = ["Allmän — test"];
        pool.push(p);
        n += 1;
      }
    }
    const f1 = RSK.byggPortfolj(profil, pool, { poangbas: "akm2" });
    const f2 = RSK.byggPortfolj(profil, pool, { poangbas: "akm2" });
    if (!jamhorJSON(f1, f2)) problem.push("byggPortfolj(akm2) ej deterministisk");
    if (f1.poangbas !== "akm2") problem.push("poangbas=" + String(f1.poangbas));
    if (String(f1.id).indexOf("-akm2-") < 0) problem.push("id saknar akm2-stämpel: " + String(f1.id));
    const fAkm1 = RSK.byggPortfolj(profil, pool);
    if (fAkm1.poangbas !== "akm1") problem.push("default-poängbas=" + String(fAkm1.poangbas));
    if (fAkm1.id === f1.id) problem.push("akm1- och akm2-läget får inte dela id");
    if (f1.innehav.length === 0 || !f1.innehav.every((ih: any) => String(ih.motiv).indexOf("AKM2-komposit") >= 0)) problem.push("motiven redovisar inte AKM2-poängbasen");
    if (String(f1.ak1aNot).indexOf("AKM2") < 0) problem.push("ak1aNot nämner inte AKM2-läget");
    let vsum = 0;
    for (const ih of f1.innehav) vsum += isFin(ih.vikt) ? ih.vikt : 0;
    if (Math.abs(vsum - 1) > 0.001) problem.push("Σvikt=" + String(vsum));
    rad(
      "riskportfolj",
      "FIXTUR poängbas AKM2 (våg 57 D2): Δpoäng = 0,50×Δbas, rankning vänder, determinism + kontrakt",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "AKM2-läget byter ENDELIGT poängformelns första led (0,50 × bas/100): två inverterade rader byter rankning mellan lägena, saknad AKM2 bidrar 0; byggPortfolj(akm2) 2× JSON-identisk, poängbas + '-akm2-'-stämpel i id:t, motiv och ak1aNot redovisar läget, Σvikt=1; AKM1-läget opåverkat som default"
        : problem.slice(0, 6).join("; "),
      "innehav=" + String(f1.innehav.length) + " poangbas=" + String(f1.poangbas) + " id=" + String(f1.id),
    );
  }

  // ── fundamental-vagmotor: klassaVag + trippelrostning ──────────────────────
  {
    const problem: string[] = [];
    const stig = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const fal = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    const flat = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
    for (const h of ["mikro", "kort", "medellang", "lang", "mega"]) {
      if (FVG.klassaVag(stig, h as any) !== "impulsvag") problem.push("stigande " + h + "=" + String(FVG.klassaVag(stig, h as any)));
      if (FVG.klassaVag(fal, h as any) !== "korrigering") problem.push("fallande " + h + "=" + String(FVG.klassaVag(fal, h as any)));
      if (FVG.klassaVag(flat, h as any) !== "basbygge") problem.push("flat " + h + "=" + String(FVG.klassaVag(flat, h as any)));
    }
    if (FVG.klassaVag([1, 2], "mega" as any) !== "osatt") problem.push("för kort serie ska vara osatt");
    const tr = FVG.trippelrostning(stig);
    if (tr.klass !== "impulsvag" || tr.a.klass !== "impulsvag" || tr.b.klass !== "impulsvag") problem.push("trippelrostning: " + JSON.stringify({ k: tr.klass, a: tr.a.klass, b: tr.b.klass, c: tr.c.klass }));
    const osatt = FVG.trippelrostning([1, 2]);
    if (osatt.klass !== "osatt") problem.push("trippelrostning kort: " + String(osatt.klass));
    rad(
      "fundamental-vagmotor",
      "FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig)"
        : problem.slice(0, 6).join("; "),
      "rost a/b/c på stigande: " + tr.a.klass + "/" + tr.b.klass + "/" + tr.c.klass,
    );
  }
  // ── fundamental-vagmotor: raknaFVag struktur + determinism ─────────────────
  {
    const problem: string[] = [];
    const f = FVG.raknaFVag(HEL_FIX);
    const per = f.perVariabel || {};
    const nycklar = Object.keys(per);
    if (nycklar.length !== 20 || !VARS.every((v) => nycklar.indexOf(v) >= 0)) problem.push("perVariabel=" + String(nycklar.length) + " nycklar");
    for (const v of VARS) {
      const vs = per[v];
      if (!vs) { problem.push(v + " saknas"); continue; }
      if (KLASSER_JSON.indexOf(String(vs.klass)) < 0) problem.push(v + ".klass=" + String(vs.klass));
      if (["forbattras", "stabilt", "forsvamras", "osatt"].indexOf(String(vs.dynamik)) < 0) problem.push(v + ".dynamik=" + String(vs.dynamik));
      if (typeof vs.anteckning !== "string" || vs.anteckning.length === 0) problem.push(v + ".anteckning saknas");
    }
    if (typeof f.totalText !== "string" || f.totalText.length === 0) problem.push("totalText saknas");
    const fNul = FVG.raknaFVag(NUL_FIX);
    for (const v of VARS) {
      if (String((fNul.perVariabel || {})[v]?.klass) !== "osatt") { problem.push("NUL " + v + " ska vara osatt"); break; }
    }
    const d1 = JSON.stringify(FVG.raknaFVag(HEL_FIX));
    const d2 = JSON.stringify(FVG.raknaFVag(HEL_FIX));
    if (d1 !== d2) problem.push("raknaFVag ej deterministisk");
    rad(
      "fundamental-vagmotor",
      "FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk"
        : problem.slice(0, 6).join("; "),
      "variabler=" + String(nycklar.length),
    );
  }

  // ── uppfoljning: skapaSnapshot ────────────────────────────────────────────
  {
    const problem: string[] = [];
    const radDa = korstadRad("U1.ST", "teknik", 70, "gron", "2026-01-31");
    const s1 = UPP.skapaSnapshot(radDa, 100);
    if (s1.ticker !== "U1.ST" || s1.akm1Totalt !== 70 || s1.pris !== 100) problem.push("basfält: " + JSON.stringify({ t: s1.ticker, a: s1.akm1Totalt, p: s1.pris }));
    if (s1.forandringAkm1 !== null) problem.push("första snapshoten ska sakna forandringAkm1, fick " + String(s1.forandringAkm1));
    if (s1.forandringPris !== null) problem.push("första snapshoten ska sakna forandringPris, fick " + String(s1.forandringPris));
    if (s1.datum !== "2026-01-31") problem.push("datum=" + String(s1.datum) + " (ska härledas ur senastKontrollerad)");
    const radNu = korstadRad("U1.ST", "teknik", 82, "gron", "2026-02-28");
    radNu.fvagPerHorisont["lang"] = "impulsvag";
    const s2 = UPP.skapaSnapshot(radNu, 125, s1);
    if (s2.forandringAkm1 !== 12) problem.push("forandringAkm1=" + String(s2.forandringAkm1) + " (förväntat 12)");
    if (Math.abs((s2.forandringPris as number) - 0.25) > 1e-12) problem.push("forandringPris=" + String(s2.forandringPris) + " (förväntat 0.25)");
    const radOgiltig = korstadRad("U2.ST", "teknik", 50, "gron", "2026-02-28");
    radOgiltig.tvagPerHorisont["mikro"] = "spökvalue";
    const s3 = UPP.skapaSnapshot(radOgiltig, null);
    if (s3.fvagPerHorisont["mikro"] !== "basbygge" || s3.tvagPerHorisont["mikro"] !== "osatt") problem.push("sanering: fv=" + String(s3.fvagPerHorisont["mikro"]) + " tv=" + String(s3.tvagPerHorisont["mikro"]));
    rad(
      "uppfoljning",
      "FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad"
        : problem.slice(0, 6).join("; "),
      "dAKM1=" + String(s2.forandringAkm1) + " dpris=" + String(s2.forandringPris),
    );
  }
  // ── uppfoljning: jamforDåNu ────────────────────────────────────────────────
  {
    const problem: string[] = [];
    const radDa1 = korstadRad("J1.ST", "teknik", 70, "gron", "2026-01-31");
    const da1 = UPP.skapaSnapshot(radDa1, 100);
    const radNu1 = korstadRad("J1.ST", "teknik", 82, "gron", "2026-02-28");
    radNu1.fvagPerHorisont["lang"] = "impulsvag";
    const nu1 = UPP.skapaSnapshot(radNu1, 125, da1);
    const radDa2 = korstadRad("J2.ST", "industri", 60, "gron", "2026-01-31");
    const da2 = UPP.skapaSnapshot(radDa2, 200);
    const radNu2 = korstadRad("J2.ST", "industri", 62, "gron", "2026-02-28");
    const nu2 = UPP.skapaSnapshot(radNu2, 205, da2);
    const radDa3 = korstadRad("J3.ST", "halso", 50, "gron", "2026-01-31");
    const da3 = UPP.skapaSnapshot(radDa3, 100);
    const radNu3 = korstadRad("J3.ST", "halso", 54, "gron", "2026-02-28");
    const nu3 = UPP.skapaSnapshot(radNu3, 130, da3);
    const jfr = UPP.jamforDåNu([nu1, nu2, nu3], [da1, da2, da3]);
    if (jfr.length !== 3) problem.push("längd=" + String(jfr.length));
    const j1 = jfr.find((x: any) => x.ticker === "J1.ST");
    if (!j1) problem.push("J1 saknas");
    else {
      if (j1.akm1Delta !== 12) problem.push("J1 akm1Delta=" + String(j1.akm1Delta));
      if (Math.abs((j1.prisForandring as number) - 0.25) > 1e-12) problem.push("J1 prisForandring=" + String(j1.prisForandring));
      if (j1.betydelse !== "stor") problem.push("J1 betydelse=" + String(j1.betydelse) + " (AKM1-delta 12 ≥ 10 + lång vågbytes ⇒ stor)");
      const langByte = (j1.vagbytes || []).find((b: any) => b.horisont === "lang" && b.typ === "fundamental");
      if (!langByte || langByte.fran !== "basbygge" || langByte.till !== "impulsvag") problem.push("J1 vågbytes: " + JSON.stringify(j1.vagbytes));
    }
    const j2 = jfr.find((x: any) => x.ticker === "J2.ST");
    if (!j2 || j2.betydelse !== "liten") problem.push("J2 betydelse=" + String(j2 && j2.betydelse) + " (delta 2, pris +2,5%, inga bytes ⇒ liten)");
    const j3 = jfr.find((x: any) => x.ticker === "J3.ST");
    if (!j3 || j3.betydelse !== "man") problem.push("J3 betydelse=" + String(j3 && j3.betydelse) + " (pris +30% ≥ 20% ⇒ man)");
    const nyTan = UPP.jamforDåNu([nu1], []);
    if (nyTan.length !== 1 || nyTan[0].akm1Delta !== null) problem.push("ny utan då: " + JSON.stringify(nyTan.map((x: any) => x.akm1Delta)));
    rad(
      "uppfoljning",
      "FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null"
        : problem.slice(0, 6).join("; "),
      "betydelser=" + JSON.stringify(jfr.map((x: any) => x.betydelse)),
    );
  }

  // ── forskningslaget (våg 56 M3): rikt-fixtur — antal, andel, topp-3, datering ──
  {
    const problem: string[] = [];
    const rader: any[] = [];
    // 4 gröna (tie på toppen: lika akm1 ⇒ ticker stigande avgör), 10 gula, 6 röda
    rader.push(korstadRad("G-B.ST", "teknik", 80, "gron", "2026-08-31"));
    const tie = korstadRad("G-A.ST", "teknik", 80, "gron", "2026-09-02");
    tie.akm1MaxMojligt = 100; // andelAvMax = 80/100 = 0.8 (poäng/max aldrig dolt)
    rader.push(tie);
    rader.push(korstadRad("G-C.ST", "industri", 70, "gron", "2026-09-03"));
    rader.push(korstadRad("G-D.ST", "halso", 65, "gron", "2026-08-30"));
    for (let i = 0; i < 10; i++) rader.push(korstadRad("Y" + String(i) + ".ST", "finans", 55, "gul", "2026-09-01"));
    for (let i = 0; i < 6; i++) rader.push(korstadRad("R" + String(i) + ".ST", "energi", 30, "rod", "2026-09-01"));
    const l = FLS.raknaForskningslage(rader, 36);
    if (l.antal !== 20 || l.grona !== 4 || l.gula !== 10 || l.roda !== 6 || l.osatta !== 0) {
      problem.push("antal=" + String(l.antal) + " grona=" + String(l.grona) + " gula=" + String(l.gula) + " roda=" + String(l.roda) + " osatta=" + String(l.osatta));
    }
    if (Math.abs(l.andelGrona - 0.2) > 1e-9 || l.andelGronaProcent !== 20) problem.push("andelGrona=" + String(l.andelGrona) + " procent=" + String(l.andelGronaProcent));
    if (l.typ !== "rikt") problem.push("typ=" + String(l.typ) + " (andel gröna 0.2 ≥ 0.10 och andel röda 0.3 ≤ 0.30 ⇒ rikt)");
    if (String(l.marknadslage).indexOf("rikt") < 0 || String(l.marknadslage).indexOf("4 av 20") < 0) {
      problem.push("marknadslage=" + String(l.marknadslage));
    }
    if (!Array.isArray(l.topp) || l.topp.length !== 3) problem.push("topp=" + String(Array.isArray(l.topp) ? l.topp.length : "ej array"));
    else {
      if (l.topp[0].ticker !== "G-A.ST" || l.topp[1].ticker !== "G-B.ST" || l.topp[2].ticker !== "G-C.ST") {
        problem.push("topp-ordning=" + JSON.stringify(l.topp.map((b: any) => b.ticker)) + " (tie 80/80 ⇒ G-A före G-B)");
      }
      if (Math.abs((l.topp[0].andelAvMax as number) - 0.8) > 1e-9) problem.push("andelAvMax=" + String(l.topp[0].andelAvMax) + " (förväntat 0.8)");
      for (const b of l.topp) {
        if (["G-A.ST", "G-B.ST", "G-C.ST", "G-D.ST"].indexOf(b.ticker) < 0) problem.push("icke-grön i topp: " + String(b.ticker));
      }
    }
    if (l.senastKontrollerad !== "2026-09-03") problem.push("senastKontrollerad=" + String(l.senastKontrollerad));
    if (l.veckansBolag.veckonr !== 36 || String(l.veckansBolag.text).indexOf("Vecka 36:") !== 0) {
      problem.push("veckansBolag.veckonr/text=" + String(l.veckansBolag.veckonr) + "/" + String(l.veckansBolag.text));
    }
    if (!l.veckansBolag.bolag || ["G-A.ST", "G-B.ST", "G-C.ST", "G-D.ST"].indexOf(l.veckansBolag.bolag.ticker) < 0) {
      problem.push("veckansBolag utanför grönapoolen: " + JSON.stringify(l.veckansBolag.bolag && l.veckansBolag.bolag.ticker));
    }
    rad(
      "forskningslaget",
      "FIXTUR rikt (4 grön/10 gul/6 röd av 20): antal+andel+text+topp-3 med tie-break+datering",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "andel gröna 0.2 ≥ tröskel 0.10 med andel röda 0.3 ≤ 0.30 ⇒ 'rikt — 4 av 20 bolag klarar de strikta kraven'; topp-3 = gröna med högst akm1Totalt (lika poäng ⇒ ticker stigande); andelAvMax 80/100=0.8; senastKontrollerad = senaste rad-datumet"
        : problem.slice(0, 6).join("; "),
      "typ=" + String(l.typ) + " topp=" + JSON.stringify(Array.isArray(l.topp) ? l.topp.map((b: any) => b.ticker) : null),
    );
  }
  // ── forskningslaget: magert (båda trösklarna) + tomt underlag (osatt) ──────
  {
    const problem: string[] = [];
    const tom = FLS.raknaForskningslage([], 36);
    if (tom.typ !== "osatt" || tom.antal !== 0 || (tom.topp && tom.topp.length !== 0)) problem.push("tom: typ=" + String(tom.typ) + " antal=" + String(tom.antal));
    if (String(tom.marknadslage).indexOf("levererat") < 0) problem.push("tom text=" + String(tom.marknadslage));
    if (tom.senastKontrollerad !== "") problem.push("tom senastKontrollerad=" + String(tom.senastKontrollerad));
    if (tom.veckansBolag.bolag !== null || String(tom.veckansBolag.text).indexOf("inget bolag") < 0) {
      problem.push("tom veckansBolag=" + JSON.stringify(tom.veckansBolag));
    }
    const fattig: any[] = [korstadRad("E-EN.ST", "material", 72, "gron", "2026-09-03")];
    for (let i = 0; i < 29; i++) fattig.push(korstadRad("M" + String(i) + ".ST", "teknik", 45, "gul", "2026-09-01"));
    const lFat = FLS.raknaForskningslage(fattig, 36);
    if (lFat.typ !== "magert" || String(lFat.marknadslage).indexOf("selektion avgör") < 0 || String(lFat.marknadslage).indexOf("1 av 30") < 0) {
      problem.push("fattig: typ=" + String(lFat.typ) + " text=" + String(lFat.marknadslage) + " (andel gröna 0.033 < 0.08)");
    }
    const rodaTung: any[] = [];
    for (let i = 0; i < 2; i++) rodaTung.push(korstadRad("G" + String(i) + ".ST", "teknik", 72, "gron", "2026-09-01"));
    for (let i = 0; i < 8; i++) rodaTung.push(korstadRad("R" + String(i) + ".ST", "energi", 30, "rod", "2026-09-01"));
    const lRod = FLS.raknaForskningslage(rodaTung, 36);
    if (lRod.typ !== "magert") problem.push("röda-tung: typ=" + String(lRod.typ) + " (andel gröna 0.2 men andel röda 0.8 > 0.35 ⇒ magert)");
    rad(
      "forskningslaget",
      "FIXTUR gränser: tomt underlag ⇒ osatt (gissar aldrig), få gröna och många röda ⇒ magert",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "[] ⇒ osatt + 'inte levererat' + veckansBolag null ('inget bolag klarar de strikta kraven ännu'); 1 grön av 30 (0.033 < 0.08) ⇒ 'magert — selektion avgör'; 2 gröna men 8 röda av 10 (0.8 > 0.35) ⇒ magert via röda-tröskeln"
        : problem.slice(0, 6).join("; "),
      "tom=" + String(tom.typ) + " fattig=" + String(lFat.typ) + " rodaTung=" + String(lRod.typ),
    );
  }
  // ── forskningslaget: determinism + ISO-veckorum ────────────────────────────
  {
    const problem: string[] = [];
    if (FLS.veckoNummer(new Date("2026-09-03T12:00:00Z")) !== 36 || FLS.veckoNummer(new Date("2026-01-01T12:00:00Z")) !== 1) {
      problem.push("veckoNummer(2026-09-03)=" + String(FLS.veckoNummer(new Date("2026-09-03T12:00:00Z"))) + " (förväntat 36); veckoNummer(2026-01-01)=" + String(FLS.veckoNummer(new Date("2026-01-01T12:00:00Z"))) + " (förväntat 1)");
    }
    const gronaPool: any[] = [
      korstadRad("G-A.ST", "teknik", 80, "gron", "2026-09-03"),
      korstadRad("G-B.ST", "teknik", 75, "gron", "2026-09-03"),
      korstadRad("G-C.ST", "industri", 70, "gron", "2026-09-03"),
      korstadRad("G-D.ST", "halso", 65, "gron", "2026-09-03"),
    ];
    const d1 = JSON.stringify(FLS.raknaForskningslage(gronaPool, 36));
    const d2 = JSON.stringify(FLS.raknaForskningslage(gronaPool, 36));
    if (d1 !== d2) problem.push("raknaForskningslage ej deterministisk (2× JSON skiljer)");
    const v36a = FLS.raknaForskningslage(gronaPool, 36).veckansBolag.bolag.ticker;
    const v36b = FLS.raknaForskningslage(gronaPool, 36).veckansBolag.bolag.ticker;
    if (v36a !== v36b) problem.push("samma vecka skiljer: " + String(v36a) + " vs " + String(v36b));
    const fanga = new Set<string>();
    for (let v = 36; v <= 43; v++) {
      const b = FLS.raknaForskningslage(gronaPool, v).veckansBolag.bolag;
      if (!b || gronaPool.map((r) => r.ticker).indexOf(b.ticker) < 0) { problem.push("v" + String(v) + " utanför poolen"); break; }
      fanga.add(b.ticker);
    }
    if (fanga.size < 2) problem.push("veckourotering träffar bara " + String(fanga.size) + " bolag (hashen roterar ej)");
    rad(
      "forskningslaget",
      "DETERMINISM: 2× JSON-identisk, ISO-veckonummer, veckourval ur grönapoolen roterar utanför prognospilar",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "2026-09-03 ⇒ vecka 36 och 2026-01-01 ⇒ vecka 1 (torsdagsregeln); samma (rader, veckonr) ⇒ byte-vis identiskt svar inklusive veckans bolag; veckorna 36–43 plockar endast ur den sorterade grönapoolen och träffar ≥2 olika bolag — deterministiskt, aldrig slump"
        : problem.slice(0, 6).join("; "),
      "v36=" + String(v36a) + " fangat=" + String(fanga.size),
    );
  }

  // ── konfluens: sjalvkontroll på giltiga fixture-rader ──────────────────────
  {
    const giltiga = [
      konRad("AAA.ST", 80, 75, 75, "Konfluens — värde möter vändande vågor", 3),
      konRad("BBB.ST", 80, 30, 60, "Värde men vågor sover", 3),
      konRad("CCC.ST", 30, 80, 60, "Vågor utan värdegolv", 3),
      konRad("DDD.ST", 80, 75, 60, null, 3),
      konRad("EEE.ST", null, null, null, "Ingen bild", 2),
      konRad("FFF.ST", null, null, null, null, 3),
    ];
    const tickers = giltiga.map((r) => r.ticker);
    const sj = sjalvkontroll(giltiga, tickers);
    rad(
      "konfluens",
      "FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen)",
      sj.ok ? "PASS" : "FAIL",
      sj.ok
        ? "Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning"
        : "sjalvkontroll underkänner giltiga rader: " + sj.fel.slice(0, 4).join("; "),
      "ok=" + String(sj.ok) + " fel=" + String(sj.fel.length),
    );
  }
  // ── konfluens: sjalvkontroll avvisar korrupta rader ────────────────────────
  {
    const problem: string[] = [];
    const forStor = konRad("X1.ST", 80, 75, 101, null, 3);
    const sj1 = sjalvkontroll([forStor], ["X1.ST"]);
    if (sj1.ok || !sj1.fel.some((f) => f.indexOf("utanför 0–100") >= 0)) problem.push("konfluens 101: " + JSON.stringify(sj1.fel));
    const negativ = konRad("X2.ST", -5, 75, 70, null, 3);
    const sj2 = sjalvkontroll([negativ], ["X2.ST"]);
    if (sj2.ok || !sj2.fel.some((f) => f.indexOf("vardgolv") >= 0)) problem.push("vardgolv -5: " + JSON.stringify(sj2.fel));
    const felKlass = konRad("X3.ST", 80, 75, 75, "Värde men vågor sover", 3);
    const sj3 = sjalvkontroll([felKlass], ["X3.ST"]);
    if (sj3.ok || !sj3.fel.some((f) => f.indexOf("stämmer inte med fälten") >= 0)) problem.push("klassfel: " + JSON.stringify(sj3.fel));
    const dup = [konRad("X4.ST", null, null, null, null, 0), konRad("X4.ST", null, null, null, null, 0)];
    const sj4 = sjalvkontroll(dup, ["X4.ST", "X4.ST"]);
    if (sj4.ok || !sj4.fel.some((f) => f.indexOf("inte unika") >= 0)) problem.push("dubletticker: " + JSON.stringify(sj4.fel));
    const många: any[] = [];
    for (let i = 0; i < 11; i++) många.push(konRad("Y" + String(i) + ".ST", null, null, null, null, 0));
    const sj5 = sjalvkontroll(många, många.map((r) => r.ticker));
    if (sj5.ok || !sj5.fel.some((f) => f.indexOf("för många tickers") >= 0 || f.indexOf(String(MAX_TICKER_KONFLUENS)) >= 0)) problem.push("11 tickers: " + JSON.stringify(sj5.fel));
    const dk = konRad("X5.ST", null, null, null, null, 4);
    const sj6 = sjalvkontroll([dk], ["X5.ST"]);
    if (sj6.ok || !sj6.fel.some((f) => f.indexOf("datakallor") >= 0)) problem.push("datakallor 4: " + JSON.stringify(sj6.fel));
    const alias = valideraKonfluens([forStor], ["X1.ST"]);
    if (JSON.stringify(alias) !== JSON.stringify(sj1)) problem.push("valideraKonfluens !== sjalvkontroll (alias-kontraktet)");
    rad(
      "konfluens",
      "FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll"
        : problem.slice(0, 6).join("; "),
      "7 fall verifierade",
    );
  }

  // ── vagvalidering (våg 56 bygg-A): DOM-PROTOKOLLET klass×momentum → dom ────
  {
    const problem: string[] = [];
    const D = VVAL.domVagvalidering;
    // riktning: teckenprotokollet (impulsvåg>0, korrigering<0 — gränsfall 0 dömer ej)
    if (D("impulsvåg", 12.5) !== "traff") problem.push("impulsvåg +12,5%");
    if (D("impulsvåg", 0.4) !== "traff") problem.push("impulsvåg svagt positiv (+0,4)");
    if (D("impulsvåg", -0.4) !== "miss") problem.push("impulsvåg svagt negativ (−0,4)");
    if (D("impulsvåg", 0) !== "osatt") problem.push("impulsvåg exakt 0 (skulle dömas)");
    if (D("korrigering", -7) !== "traff") problem.push("korrigering −7");
    if (D("korrigering", -0.1) !== "traff") problem.push("korrigering svagt negativ");
    if (D("korrigering", 3) !== "miss") problem.push("korrigering +3");
    if (D("korrigering", 0) !== "osatt") problem.push("korrigering exakt 0");
    // basbygge: motorns EGEN tröskel ±6 % inklusivt (hedervändig symmetri)
    if (D("basbygge", 6) !== "traff") problem.push("basbygge +6 exakt på tröskeln (skulle vara träff — ≤ som motorn)");
    if (D("basbygge", -6) !== "traff") problem.push("basbygge −6 exakt på tröskeln");
    if (D("basbygge", 6.1) !== "miss") problem.push("basbygge +6,1");
    if (D("basbygge", -12) !== "miss") problem.push("basbygge −12");
    // osatt döms ALDRIG — saknad klass, saknat/ogiltigt momentum
    if (D("osatt", 99) !== "osatt") problem.push("osatt klass med momentum");
    if (D("impulsvåg", null) !== "osatt") problem.push("impulsvåg momentum=null");
    if (D("impulsvåg", Number.NaN) !== "osatt") problem.push("impulsvåg momentum=NaN");
    if (D("spökvalue", 5) !== "osatt") problem.push("okänd klass-sträng");
    if (D(null, 5) !== "osatt") problem.push("klass=null");
    // klassFranTal — spegling av motorns ±0,50-gränser
    if (VVAL.klassFranTal(0.5) !== "impulsvåg") problem.push("klassFranTal(0,5)");
    if (VVAL.klassFranTal(-0.5) !== "korrigering") problem.push("klassFranTal(−0,5)");
    if (VVAL.klassFranTal(0.49) !== "basbygge") problem.push("klassFranTal(0,49)");
    if (VVAL.klassFranTal(null) !== "osatt") problem.push("klassFranTal(null)");
    rad(
      "vagvalidering",
      "DOM-PROTOKOLL v1: klass×momentum → traff/miss/osatt (17 fall + gränser)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "impulsvåg→träff vid positivt momentum (även +0,4), miss vid negativt; korrigering spegelvät; exakt 0 dömer inte riktning → osatt; basbygge träff vid |mom| ≤ 6 % (tröskeln inklusiv, motorns egen gräns — hedervändig symmetri), miss vid 6,1; osatt klass/null/NaN → osatt (ALDRIG dömt); klassFranTal speglar ±0,50 exakt"
        : problem.slice(0, 6).join("; "),
      "basbygge gräns 6/6,1 + riktning 0,4/−0,4",
    );
  }
  // ── vagvalidering: ENIGHETSSCORE 40/30/30 omräknad för hand + determinism ──
  {
    const problem: string[] = [];
    const celler = [
      { medelBekraftad: true, momentum: 12 },
      { medelBekraftad: false, momentum: 3 },
      { medelBekraftad: null, momentum: null },
    ];
    // för hand: 40·(1/2) + 30·((1+0,5)/2) + 30·(2/5) = 20+22,5+12 = 54,5 → 55
    const s1 = VVAL.raknaEnighetsscore(celler, 5);
    if (s1 !== 55) problem.push("score=" + String(s1) + " (förväntat 55 ur 40·0,5 + 30·0,75 + 30·0,4)");
    const s2 = VVAL.raknaEnighetsscore(celler, 5);
    if (s1 !== s2) problem.push("ej deterministisk");
    if (VVAL.raknaEnighetsscore([], 5) !== null) problem.push("tom lista skulle ge null");
    if (VVAL.raknaEnighetsscore([{ medelBekraftad: true, momentum: null }], 5) !== null) problem.push("helt osatt skulle ge null");
    // fulltäckande allt-bekräftad stark mätning → 100 (tak)
    const max = VVAL.raknaEnighetsscore([{ medelBekraftad: true, momentum: 9 }, { medelBekraftad: true, momentum: 7 }], 2);
    if (max !== 100) problem.push("max=" + String(max) + " (förväntat 100)");
    // utan bekräftelser (ren basbygge: alla null) maxas axeln på 0 — hederligt
    const bas = VVAL.raknaEnighetsscore([{ medelBekraftad: null, momentum: 1 }, { medelBekraftad: null, momentum: -1 }], 2);
    if (bas !== Math.round(30 * (1 / 6 + 1 / 6) / 2 + 30)) problem.push("basbygge-score=" + String(bas));
    rad(
      "vagvalidering",
      "ENIGHETSSCORE 40/30/30 omräknad för hand (55/100) + tak 100 + determinism",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "rådets formel: 40·andel medel-bekräftade + 30·medel tröskelmarginal min(1,|mom|/6) + 30·täckning (bedömda/totalt); fixture 2 bedömda av 5 med 1 av 2 bekräftade → 55; komplett bekräftad stark mätning → 100; helt osatt → null (aldrig påhittad); heltalsavrundning deterministisk 2×"
        : problem.slice(0, 6).join("; "),
      "fixture=55/100 max=100/100",
    );
  }
  // ── vagvalidering: DOMBYGGE ur två ronder + rullande räknare (ren funktion) ─
  {
    const problem: string[] = [];
    const klasser: any = {
      "AAA.ST": { mikro: "impulsvåg", kort: "korrigering", medellang: "basbygge", lang: "osatt", mega: "spökvalue" },
    };
    const momenter: any = {
      "AAA.ST": { mikro: 3.1, kort: -2, medellang: 6, lang: null, mega: -8 },
    };
    const domar = VVAL.byggaDomar(["AAA.ST", "BBB.ST"], klasser, momenter);
    if (domar.length !== 10) problem.push("antal=" + String(domar.length) + " (förväntat 2 tickers × 5 horisonter)");
    const d0 = domar[0];
    if (!d0 || d0.ticker !== "AAA.ST" || d0.horisont !== "mikro" || d0.klassForrigeRond !== "impulsvåg" || d0.utfallMomentum !== 3.1 || d0.dom !== "traff") {
      problem.push("första dom: " + JSON.stringify(d0));
    }
    const hitta = (t: string, h: string) => domar.find((d: any) => d.ticker === t && d.horisont === h);
    if (hitta("AAA.ST", "kort").dom !== "traff") problem.push("korrigering −2 → skulle vara träff");
    if (hitta("AAA.ST", "medellang").dom !== "traff") problem.push("basbygge +6 (på tröskeln) → skulle vara träff");
    if (hitta("AAA.ST", "lang").dom !== "osatt") problem.push("osatt klass → skulle vara osatt");
    if (hitta("AAA.ST", "mega").klassForrigeRond !== "osatt" || hitta("AAA.ST", "mega").dom !== "osatt") problem.push("okänd klass-sträng saneras ej till osatt");
    if (hitta("BBB.ST", "mikro").dom !== "osatt") problem.push("ticker utan momentum → skulle vara osatt");
    // invariant: varje dom är återskapbar ur sina EGNA fält (spårbarhet).
    // VÅG 59: v2 dömer med horisonttröskel — återskapning SKER med horisonten.
    for (const d of domar) {
      if (VVAL.domVagvalidering(d.klassForrigeRond, d.utfallMomentum, d.horisont) !== d.dom) { problem.push("dom ej återskapbar: " + JSON.stringify(d)); break; }
    }
    rad(
      "vagvalidering",
      "DOMBYGGE ur två ronder (klass@T vs momentum@T+1) + dom-återskapning",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "kanonisk ordning (universum × horisont): AAA mikro impulsvåg+3,1→träff, kort korrigering−2→träff, medellång basbygge+6→träff, lång osatt→osatt, okänd klass saneras till osatt; BBB utan momentum→osatt; varje rads dom = domVagvalidering(klassForrigeRond, utfallMomentum) — granskningsbar rad för rad"
        : problem.slice(0, 6).join("; "),
      "10 domar varav 3 dömda träff + 7 osatta",
    );
  }
  // ── vagvalidering: RULLANDE räknare + träff-% + rapporttext ────────────────
  {
    const problem: string[] = [];
    const r0 = VVAL.tomRullande();
    if (Object.keys(r0).length !== 5) problem.push("horisonter=" + String(Object.keys(r0).length));
    if (JSON.stringify(r0.mikro["impulsvåg"]) !== JSON.stringify({ traff: 0, miss: 0, osatt: 0 })) problem.push("nollräknare saknas");
    const domLista = [
      { ticker: "A", horisont: "mikro", klassForrigeRond: "impulsvåg", utfallMomentum: 3, dom: "traff" },
      { ticker: "A", horisont: "mikro", klassForrigeRond: "impulsvåg", utfallMomentum: -3, dom: "miss" },
      { ticker: "A", horisont: "mikro", klassForrigeRond: "osatt", utfallMomentum: null, dom: "osatt" },
      { ticker: "A", horisont: "kort", klassForrigeRond: "basbygge", utfallMomentum: 1, dom: "traff" },
      { ticker: "A", horisont: "spök", klassForrigeRond: "impulsvåg", utfallMomentum: 1, dom: "traff" },
    ];
    const r1 = VVAL.rullaFram(r0, domLista);
    if (JSON.stringify(r1.mikro["impulsvåg"]) !== JSON.stringify({ traff: 1, miss: 1, osatt: 0 })) problem.push("mikro/impulsvåg: " + JSON.stringify(r1.mikro["impulsvåg"]));
    if (r1.mikro["osatt"].osatt !== 1) problem.push("osatt-klass räknas ej i eget fack");
    if (r1.kort["basbygge"].traff !== 1) problem.push("kort/basbygge");
    if (JSON.stringify(r1.mikro["basbygge"]) !== JSON.stringify({ traff: 0, miss: 0, osatt: 0 })) problem.push("orörda fack nollställda");
    if (r1["spök"] !== undefined) problem.push("okänd horisont skapar eget fack");
    if (VVAL.traffProcent(r1.mikro["impulsvåg"]) !== 50) problem.push("traffProcent=50");
    if (VVAL.antalDomda(r1.mikro["impulsvåg"]) !== 2) problem.push("antalDomda=2");
    if (VVAL.osattAndelProcent(r1.mikro["osatt"]) !== 100) problem.push("osattAndel=100");
    if (VVAL.traffProcent({ traff: 0, miss: 0, osatt: 5 }) !== null) problem.push("n=0 → null");
    const r2 = VVAL.rullaFram(r1, domLista);
    if (r2.mikro["impulsvåg"].traff !== 2 || r2.mikro["impulsvåg"].miss !== 2) problem.push("andra ronden dubblerar ej");
    if (r1.mikro["impulsvåg"].traff !== 1) problem.push("PURE brutet: r1 muterades av rullaFram");
    // rapporten — träff-%-tabell per horisont+klass, n, osatt-andel, protokoll
    const rapport = VVAL.byggVagvalideringRapport({
      genererad: "2026-09-04T05:30:00.000Z", datum: "2026-09-04", universum: ["A"],
      kallaKlasser: "vagscan-event", kallaMomentum: "vagscan-event",
      domar: domLista, rullande: r1, rullandeSedan: "2026-09-04",
    });
    if (rapport.indexOf("# Vågvalidering") !== 0) problem.push("rubrik");
    if (rapport.indexOf("vagvalidering/1") < 0) problem.push("protokollversion saknas");
    if (rapport.indexOf("50 % (n=2)") < 0) problem.push("träff-%-cell '50 % (n=2)' saknas");
    if (rapport.indexOf("Dom-protokoll") < 0) problem.push("protokolltext saknas");
    if (rapport.indexOf("osatta") < 0) problem.push("osatt-andel saknas");
    const rapport2 = VVAL.byggVagvalideringRapport({
      genererad: "2026-09-04T05:30:00.000Z", datum: "2026-09-04", universum: ["A"],
      kallaKlasser: "vagscan-event", kallaMomentum: "vagscan-event",
      domar: domLista, rullande: r1, rullandeSedan: "2026-09-04",
    });
    if (rapport !== rapport2) problem.push("rapport ej deterministisk");
    rad(
      "vagvalidering",
      "RULLANDE träff% per (horisont,klass) + rapport (tabell, n, osatt-andel)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "räknare per (horisont,klass): träff 1+miss 1 → 50 % (n=2); osatt-klass hamnar i eget fack (osatt-andel 100 %, aldrig fel); okänd horisont avvisas; rullaFram är PURE (r1 orörd); träff-%-rapporten innehåller rubrik, protokollversion vagvalidering/1, tabellcell '50 % (n=2)', protokolltext och osatta — byte-identisk 2×"
        : problem.slice(0, 6).join("; "),
      "rond1=1/1 rond2=2/2 traff=50%",
    );
  }

  // ── vagvalidering: DOM-PROTOKOLL v2 (våg 59 bygg-1) — horisontskalat band ──
  {
    const problem: string[] = [];
    const D = VVAL.domVagvalidering;
    // v2 (AKM3-BESLUT §7): basbygge-band per horisont, gränserna INKLUSIVA
    if (D("basbygge", 6, "mikro") !== "traff") problem.push("mikro +6 exakt på tröskeln");
    if (D("basbygge", -6, "kort") !== "traff") problem.push("kort −6 exakt på tröskeln");
    if (D("basbygge", 6.1, "mikro") !== "miss") problem.push("mikro +6,1");
    if (D("basbygge", -6.1, "kort") !== "miss") problem.push("kort −6,1");
    if (D("basbygge", 10, "medellang") !== "traff") problem.push("medellång +10 (v1 gav miss — rond-1-fyndet fixat)");
    if (D("basbygge", 15, "medellang") !== "traff") problem.push("medellång +15 gränsen inklusiv");
    if (D("basbygge", 15.1, "medellang") !== "miss") problem.push("medellång +15,1");
    if (D("basbygge", 24.9, "lang") !== "traff") problem.push("lång +24,9");
    if (D("basbygge", 25, "mega") !== "traff") problem.push("mega +25 gränsen inklusiv");
    if (D("basbygge", 25.1, "lang") !== "miss") problem.push("lång +25,1");
    if (D("basbygge", 30, "mega") !== "miss") problem.push("mega +30");
    // teckenreglerna OFÖRÄNDRADE i v2 (EN ändring per protokollversion, FORBUD §10.6)
    if (D("impulsvåg", 0.4, "medellang") !== "traff") problem.push("impulsvåg svagt positiv (v1-regel kvar)");
    if (D("impulsvåg", -0.4, "mega") !== "miss") problem.push("impulsvåg svagt negativ");
    if (D("korrigering", -0.4, "lang") !== "traff") problem.push("korrigering svagt negativ");
    if (D("korrigering", 3, "medellang") !== "miss") problem.push("korrigering +3");
    if (D("impulsvåg", 0, "kort") !== "osatt") problem.push("exakt noll dömer ej");
    // v1-kompatibilitet: UTAN horisont gäller ±6 (gamla v1-rader återskapbara)
    if (D("basbygge", 10) !== "miss") problem.push("2-arg (v1-default): +10 → miss");
    if (D("basbygge", 6) !== "traff") problem.push("2-arg: +6 → träff");
    if (D("basbygge", 10, "spök") !== "miss") problem.push("okänd horisont → v1-default");
    // protokollkonstanterna är beslutade, daterade och motiverade (BESLUT §7)
    if (VVAL.VAGVALIDERING_PROTOKOLL_VERSION !== 2) problem.push("protokollversion != 2");
    if (VVAL.TROSKEL_PROCENT_PER_HORIZONT.mikro !== 6 || VVAL.TROSKEL_PROCENT_PER_HORIZONT.kort !== 6) problem.push("mikro/kort != 6");
    if (VVAL.TROSKEL_PROCENT_PER_HORIZONT.medellang !== 15) problem.push("medellång != 15");
    if (VVAL.TROSKEL_PROCENT_PER_HORIZONT.lang !== 25 || VVAL.TROSKEL_PROCENT_PER_HORIZONT.mega !== 25) problem.push("lang/mega != 25");
    if (VVAL.TROSKEL_V2_BESLUTAD !== "2026-09-04") problem.push("v2-datum");
    if (String(VVAL.TROSKEL_V2_ORSAK).indexOf("basbygge") < 0 || String(VVAL.TROSKEL_V2_ORSAK).indexOf("nollst") < 0) {
      problem.push("orsak ej deklarerad (räknare nollställs + fyndet redovisat)");
    }
    rad(
      "vagvalidering",
      "DOM-PROTOKOLL v2: horisontskalat basbygge-band + v1-teckenreglar + v1-kompatibilitet",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "basbygge döms med tröskel per horisont (mikro/kort 6 · medellång 15 · lång/mega 25, inklusiva gränser) — medellång +10 är nu träff där v1 dömde miss (rond-1-fyndet: momentum skalar med horisonten); impulsvåg/korrigering behåller v1:s teckenregel (en ändring per protokollversion, FORBUD §10.6); utan horisont-argument gäller fortfarande ±6 så v1-rader i loggen förblir återskapbara; TROSKEL_V2_ORSAK deklarerar fyndet och nollställningen"
        : problem.slice(0, 6).join("; "),
      "medellång 10→träff · gränser 6/15/25 inklusiva",
    );
  }

  // ── vagvalidering BANA B (våg 59 bygg-1): per-variabel-dom + episodkedja ────
  {
    const problem: string[] = [];
    const klasser: any = {
      "AAA.ST": { V01: { mikro: "impulsvåg", kort: "korrigering", medellang: "basbygge", lang: "osatt", mega: "spök" } },
      "BBB.ST": { V09: { mikro: "basbygge" } },
    };
    const momenter: any = {
      "AAA.ST": { V01: { mikro: 3.1, kort: -2, medellang: 10, lang: null, mega: -30 }, V07: { mikro: 1 } },
      "BBB.ST": {},
    };
    const rader = VVAL.byggaVariabelDomar(["AAA.ST", "BBB.ST"], klasser, momenter, [], "2026-09-03", "2026-09-04");
    // antal: variabel-UNIONEN (AAA: V01+V07, BBB: V09) × 5 horisonter = 15
    if (rader.length !== 15) problem.push("antal=" + String(rader.length) + " (väntat 15)");
    const hitta = (t: string, v: string, h: string) => rader.find((r: any) => r.ticker === t && r.variabel === v && r.horisont === h);
    if (!hitta("AAA.ST", "V01", "mikro") || hitta("AAA.ST", "V01", "mikro").traff !== true) problem.push("impulsvåg +3,1 → träff");
    if (hitta("AAA.ST", "V01", "kort").traff !== true) problem.push("korrigering −2 → träff");
    if (hitta("AAA.ST", "V01", "medellang").traff !== true) problem.push("basbygge +10 medellång → träff under v2 (±15)");
    if (hitta("AAA.ST", "V01", "lang").traff !== false) problem.push("osatt klass → osatt (traff=false)");
    if (hitta("AAA.ST", "V01", "mega").klass !== "osatt" || hitta("AAA.ST", "V01", "mega").traff !== false) problem.push("okänd klass saneras ej");
    if (!hitta("AAA.ST", "V07", "mikro")) problem.push("variabel bara i momenter saknar rad (union)");
    else if (hitta("AAA.ST", "V07", "mikro").klass !== "osatt") problem.push("klass-lös variabel ska vara osatt");
    if (rader.some((r: any) => r.domat_datum !== "2026-09-03" || r.traff_datum !== "2026-09-04")) problem.push("domat/traff-datum");
    if (rader.some((r: any) => r.protokoll_version !== 2)) problem.push("protokoll_version != 2");
    if (rader.some((r: any) => typeof r.episod_id !== "string" || r.episod_id === "")) problem.push("episod_id-form");
    // determinism 2×
    const rader2 = VVAL.byggaVariabelDomar(["AAA.ST", "BBB.ST"], klasser, momenter, [], "2026-09-03", "2026-09-04");
    if (JSON.stringify(rader) !== JSON.stringify(rader2)) problem.push("ej deterministisk");

    // EPISODKEDJA: oförändrad klass ÄRVER, klassbyte startar ny, osatt avgränsar
    const runda2 = VVAL.byggaVariabelDomar(["AAA.ST"], klasser, momenter, rader, "2026-09-04", "2026-09-05");
    const idR1 = hitta("AAA.ST", "V01", "mikro").episod_id;
    const idR2 = runda2.find((r: any) => r.variabel === "V01" && r.horisont === "mikro").episod_id;
    if (idR1 !== idR2) problem.push("oförändrad klass skulle ärva episod_id");
    const klasserByte: any = { "AAA.ST": { V01: { mikro: "korrigering" } } };
    const runda3 = VVAL.byggaVariabelDomar(["AAA.ST"], klasserByte, momenter, runda2, "2026-09-05", "2026-09-06");
    const idR3 = runda3.find((r: any) => r.variabel === "V01" && r.horisont === "mikro").episod_id;
    if (idR3 === idR2) problem.push("klassbyte startar ej ny episod");
    if (idR3.indexOf("2026-09-06") < 0) problem.push("ny episod-id bär startdatum");
    const klasserOsatt: any = { "AAA.ST": { V01: { mikro: "osatt" } } };
    const runda4 = VVAL.byggaVariabelDomar(["AAA.ST"], klasserOsatt, momenter, runda3, "2026-09-06", "2026-09-07");
    const idR4 = runda4.find((r: any) => r.variabel === "V01" && r.horisont === "mikro").episod_id;
    if (idR4 === idR3) problem.push("osatt avgränsar ej (SKA ny episod)");
    const runda5 = VVAL.byggaVariabelDomar(["AAA.ST"], klasserOsatt, momenter, runda4, "2026-09-07", "2026-09-08");
    const idR5 = runda5.find((r: any) => r.variabel === "V01" && r.horisont === "mikro").episod_id;
    if (idR5 !== idR4) problem.push("osatt-osatt SKA ärva samma episod");

    // episodräknare-valideringen (acceptans §11.2.iv): n_episoder ≤ n_dagar
    const sekvens = ["impulsvåg", "impulsvåg", "basbygge", "basbygge", "osatt", "osatt", "impulsvåg"];
    const dagar = ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07", "2026-09-08"];
    let historik: any[] = [];
    for (let i = 0; i < sekvens.length; i++) {
      const r = VVAL.byggaVariabelDomar(
        ["AAA.ST"],
        { "AAA.ST": { V01: { mikro: sekvens[i] } } },
        { "AAA.ST": { V01: { mikro: 1.0 } } },
        historik,
        dagar[i],
        dagar[i + 1],
      );
      historik = historik.concat(r);
    }
    const nEpisoder = VVAL.raknaEpisoder(historik, { ticker: "AAA.ST", variabel: "V01", horisont: "mikro" });
    if (nEpisoder !== 4) problem.push("episoder=" + String(nEpisoder) + " (väntat 4: A·A | B·B | osatt·osatt | A)");
    if (nEpisoder > sekvens.length) problem.push("INVARIANT bruten: n_episoder > n_dagar");

    // per-variabel-räknare (STYRELSE §3.2 fas 2: traffPerVariabel)
    const rakn = VVAL.raknaVariabelRaknare(rader);
    if (JSON.stringify(rakn.V01) !== JSON.stringify({ traff: 3, miss: 0, osatt: 2 })) problem.push("V01-räknare: " + JSON.stringify(rakn.V01));
    if (JSON.stringify(rakn.V07) !== JSON.stringify({ traff: 0, miss: 0, osatt: 5 })) problem.push("V07-räknare");
    if (JSON.stringify(rakn.V09) !== JSON.stringify({ traff: 0, miss: 0, osatt: 5 })) problem.push("V09-räknare");

    // kvartalsnyckel + snapshot-rader (vagklass_snapshot, dedupe-underlag)
    if (VVAL.kvartalsNyckel("2026-09-04") !== "2026Q3") problem.push("kvartal sep");
    if (VVAL.kvartalsNyckel("2026-01-01") !== "2026Q1" || VVAL.kvartalsNyckel("2026-05-15") !== "2026Q2") problem.push("kvartal q1/q2");
    if (VVAL.kvartalsNyckel("2026-12-31") !== "2026Q4") problem.push("kvartal q4");
    if (VVAL.kvartalsNyckel("ogiltigt") !== "" || VVAL.kvartalsNyckel("2026-13-01") !== "") problem.push("ogiltigt datum ska ge tom nyckel");
    const scanFixture = [
      { ticker: "AAA.ST", indikatorer: { V01: { vager: { mikro: "impulsvåg" } }, V07: { vager: { kort: "spök" } } } },
      { ticker: "ZZZ.ST", fel: "nätfel", indikatorer: { V01: { vager: { mikro: "impulsvåg" } } } },
    ];
    const snap = VVAL.byggVagklassSnapshotRader(scanFixture, "2026-09-04");
    if (snap.length !== 10) problem.push("snapshot-antal=" + String(snap.length) + " (väntat 10: AAA V01+V07 × 5, fel-ticker exkluderad)");
    if (snap.some((r: any) => r.ticker === "ZZZ.ST")) problem.push("fel-ticker ska exkluderas");
    const hzSeq = snap.filter((r: any) => r.ticker === "AAA.ST" && r.variabel === "V01").map((r: any) => r.horisont);
    if (JSON.stringify(hzSeq) !== JSON.stringify(["mikro", "kort", "medellang", "lang", "mega"])) problem.push("horisontordning");
    const s7 = snap.find((r: any) => r.variabel === "V07" && r.horisont === "kort");
    if (s7.klass !== "osatt") problem.push("ogiltig klass i snapshot saneras ej");
    if (snap.some((r: any) => r.snapshot_datum !== "2026-09-04" || r.protokoll_version !== 2)) problem.push("snapshot-stämplar");
    rad(
      "vagvalidering",
      "BANA B: per-variabel-dom (vagvalidering_dom) + episodkedja + kvartalssnapshot",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "rader per (ticker×variabel×horisont) i STYRELSE §3.2:s schema exakt: v2-tröskeln verkar per horisont (basbygge +10 medellång → träff), klass-lösa variabler blir osatta (aldrig dömda), domat/traff-datum + protokoll_version 2 på varje rad; episod_id ärvs vid oförändrad klass, klassbyte OCH osatt startar ny episod (osatt-osatt ärver); sekvens A·A·B·B·osatt·osatt·A ⇒ 4 episoder ≤ 7 dagar (dagar räknas aldrig som observationer); variabelräknare V01=3 träff/2 osatta; kvartalsnyckel 2026-09-04→2026Q3 och snapshot-rader exkluderar fel-tickers, sanerar klasser, kanonisk ordning"
        : problem.slice(0, 6).join("; "),
      "15 rader · 4 episoder på 7 dagar · Q3-nyckel",
    );
  }

  // ── akm3-ensemble (våg 59 bygg-1): kontrakt, determinism, låst α ────────────
  {
    const problem: string[] = [];
    const e1 = ENS.raknaEnsemble(HEL_FIX);
    const e2 = ENS.raknaEnsemble(HEL_FIX);
    if (JSON.stringify(e1) !== JSON.stringify(e2)) problem.push("ej deterministisk (2× JSON-identiskt krav)");
    if (JSON.stringify(e1.perProfil.map((p: any) => p.profil)) !== JSON.stringify(["akm1-klassisk", "akm2-2026", "superanalys-2026"])) {
      problem.push("medlemmarna är ej exakt de tre kanoniska profilerna");
    }
    const K = e1.perProfil.map((p: any) => p.komposit);
    const vantaTotal = Math.round((K[0] + K[1] + K[2]) / 3);
    if (e1.total !== vantaTotal) problem.push("total=" + String(e1.total) + " väntat round((K1+K2+K3)/3)=" + String(vantaTotal));
    const minK = Math.min(K[0], K[1], K[2]);
    const maxK = Math.max(K[0], K[1], K[2]);
    if (e1.band.min !== minK || e1.band.max !== maxK) problem.push("band [min,max]");
    if (e1.band.median !== K[0] + K[1] + K[2] - minK - maxK) problem.push("median = mittenvärdet");
    if (e1.spridning !== maxK - minK) problem.push("spridning = max − min");
    if (e1.enighet !== ENS.enighetFranSpridning(e1.spridning)) problem.push("enighet följer ej trappan");
    if (e1.modellVersion !== "AKM3.2026.09") problem.push("modellVersion");
    if (e1.datum !== HEL_FIX.hamtat) problem.push("datum ska härledas ur k.hamtat (aldrig klocka)");
    // α = 1/3 LÅST: fältet dokumenterar, custom-α i opts påverkar INGET (finns ej)
    if (e1.alfa["akm1-klassisk"] !== 1 / 3 || e1.alfa["akm2-2026"] !== 1 / 3 || e1.alfa["superanalys-2026"] !== 1 / 3) problem.push("alfa != 1/3");
    if (Math.abs(Object.values(e1.alfa).reduce((s: number, x: number) => s + x, 0) - 1) > 1e-12) problem.push("alfa summa != 1");
    const eFusk = ENS.raknaEnsemble(HEL_FIX, { alfa: { "akm2-2026": 0.9 } });
    if (JSON.stringify(eFusk) !== JSON.stringify(e1)) problem.push("custom-α påverkar utdata (SKA ignoreras — α=1/3 låst i 2026.09)");
    // projektionsinvariant-kopplingen: akm1Totalt === raknaAKM1(k).totalt
    if (e1.akm1Totalt !== KAR.raknaAKM1(HEL_FIX).totalt) problem.push("akm1Totalt != raknaAKM1 (projektionen)");
    if (e1.akm2Komposit !== K[1]) problem.push("akm2Komposit != akm2-2026-medlemmens komposit");
    if (e1.diagnostik.omfordelningseffekt !== K[1] - K[0] || e1.diagnostik.kategoriMotVariabel !== K[2] - K[1]) problem.push("diagnostik-differenser");
    rad(
      "akm3-ensemble",
      "KONTRAKT: α=1/3 låst, total=round(Σ α·K), band/median/spridning, determinism",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "raknaEnsemble(HEL_FIX) 2× JSON-identisk; perProfil = exakt de tre kanoniska profilerna i fast ordning; total = round((K1+K2+K3)/3); band [min,max] + median (mittenvärdet) + spridning max−min ⇒ enighet enligt trappan 0–3/4–7/≥8; alfa-fältet 1/3 × 3 (summa 1) och custom-α i opts påverkar INGET (parametern finns ej — LÅST); akm1Totalt === raknaAKM1(k).totalt (projektionen orörd); akm2Komposit bär jämförelsespåret; datum ur k.hamtat"
        : problem.slice(0, 6).join("; "),
      "K=[" + String(K[0]) + "," + String(K[1]) + "," + String(K[2]) + "] total=" + String(e1.total),
    );
  }

  // ── akm3-ensemble: tre identiska profiler ⇒ total = profilens komposit ─────
  {
    const problem: string[] = [];
    const e = ENS.raknaEnsemble(NUL_FIX);
    const K = e.perProfil.map((p: any) => p.komposit);
    if (!(K[0] === K[1] && K[1] === K[2])) problem.push("NUL_FIX (allt osatt) gav ej identiska kompositer: " + JSON.stringify(K));
    if (e.total !== K[0]) problem.push("identiska profiler ⇒ total=" + String(e.total) + " men K=" + String(K[0]));
    if (e.spridning !== 0) problem.push("spridning != 0 vid identiska");
    if (e.enighet !== "enig") problem.push("enighet != enig vid spridning 0");
    // hård port följer DATA per profil (BESLUT §4) — NEG_FIX: kassa 10 mån
    const en = ENS.raknaEnsemble(NEG_FIX);
    if (!en.perProfil.every((p: any) => p.portAktiv === true)) problem.push("hård port syns ej per profil (följer DATA)");
    if (!en.perProfil.every((p: any) => p.komposit <= 45)) problem.push("port-tak 45 bruten i någon profil");
    rad(
      "akm3-ensemble",
      "GRÄNSFALL: identiska profiler ⇒ total = K · spridning 0 = ENIG · port per profil",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "NUL_FIX (inget underlag): alla tre profilerna degraderar till komposit 0 ⇒ total 0 = profilens komposit (acceptans §11.1.i), spridning 0 ⇒ 'enig'; NEG_FIX (kassatäckning 10 mån): hård port slår igenom i ALLA tre profilernas körningar (porten följer DATA, inte profilen) och varje K_p ≤ 45 — osatta andelar ärvs per profil och visas"
        : problem.slice(0, 6).join("; "),
      "NUL total=0 · NEG port i 3/3",
    );
  }

  // ── akm3-ensemble: enighetstrappan 0–3 / 4–7 / ≥8 (ren funktion) ───────────
  {
    const problem: string[] = [];
    for (const s of [0, 1, 2, 3]) {
      if (ENS.enighetFranSpridning(s) !== "enig") problem.push("spridning " + String(s) + " ska vara enig");
    }
    for (const s of [4, 5, 6, 7]) {
      if (ENS.enighetFranSpridning(s) !== "delad") problem.push("spridning " + String(s) + " ska vara delad");
    }
    for (const s of [8, 9, 20, 100]) {
      if (ENS.enighetFranSpridning(s) !== "profilspanning") problem.push("spridning " + String(s) + " ska vara profilspanning");
    }
    if (ENS.enighetFranSpridning(Number.NaN) !== "delad") problem.push("NaN → mittfacket (inget omdöme)");
    rad(
      "akm3-ensemble",
      "ENIGHETSTRAPPAN: 0–3 enig · 4–7 delad · ≥8 profilspanning",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "r5 §3.2 exakt: spridning 0/1/2/3 ⇒ 'enig', 4/5/6/7 ⇒ 'delad', 8/9/20/100 ⇒ 'profilspanning'; ogiltigt tal ⇒ mittfacket 'delad' (etiketten gissar aldrig men vägrar krascha)"
        : problem.slice(0, 6).join("; "),
      "3 + 4 + 4 gränsvärden",
    );
  }

  // ── akm3-prediktionsloggen: radbygge + hash-kedja (append-only, tamper) ────
  {
    const problem: string[] = [];
    const e = ENS.raknaEnsemble(HEL_FIX);
    const r0 = UPP.byggAkm3Prediktionsrad(e, 123.5, "2026-09-04");
    if (r0.spar !== "akm3-ensemble") problem.push("spar-typnamn");
    if (r0.modellVersion !== "AKM3.2026.09") problem.push("versionsstämpel");
    if (r0.datum !== "2026-09-04") problem.push("datum_override (mätningens datum)");
    if (r0.ensembleTotal !== e.total || r0.akm2Komposit !== e.akm2Komposit || r0.akm1Totalt !== e.akm1Totalt) problem.push("jämförelsespåren (ensemble vs akm2 + akm1)");
    if (r0.bandMin !== e.band.min || r0.bandMedian !== e.band.median || r0.bandMax !== e.band.max) problem.push("band-fält");
    if (r0.pris !== 123.5) problem.push("pris");
    const utan = UPP.byggAkm3Prediktionsrad(e, null);
    if (utan.pris !== null) problem.push("pris saknas ska ge null (aldrig 0)");
    if (utan.datum !== e.datum) problem.push("datum default = ensemble.datum (k.hamtat)");
    const sha = (t: string) => createHash("sha256").update(t, "utf8").digest("hex");
    const r1 = UPP.stemplaPrediktionsrad(r0, UPP.PREDIKTIONSLOGG_GENESIS, sha);
    const r2 = UPP.stemplaPrediktionsrad(UPP.byggAkm3Prediktionsrad(e, 99, "2026-10-01"), String(r1.hash), sha);
    const r3 = UPP.stemplaPrediktionsrad(UPP.byggAkm3Prediktionsrad(e, 101, "2026-11-01"), String(r2.hash), sha);
    if (!UPP.verifieraPrediktionskedja([r1, r2, r3], sha)) problem.push("äkta kedja verifierar ej");
    const r1b = UPP.stemplaPrediktionsrad(r0, UPP.PREDIKTIONSLOGG_GENESIS, sha);
    if (r1.hash !== r1b.hash) problem.push("hashen ej deterministisk (samma rad + prev)");
    const fusk = { ...r2, ensembleTotal: 99 };
    if (UPP.verifieraPrediktionskedja([r1, fusk, r3], sha)) problem.push("manipulerad rad (ändrat värde, behållen hash) accepterades");
    const r2annan = UPP.stemplaPrediktionsrad(UPP.byggAkm3Prediktionsrad(e, 987, "2026-10-02"), String(r1.hash), sha);
    if (UPP.verifieraPrediktionskedja([r1, r2annan, r3], sha)) problem.push("bruten länk (r3 pekar på gammal hash) accepterades");
    if (!UPP.verifieraPrediktionskedja([], sha)) problem.push("tom kedja ska vara giltig");
    if (UPP.verifieraPrediktionskedja(null, sha)) problem.push("null-kedja ska vara ogiltig");
    rad(
      "akm3-prediktionslogg",
      "RADBYGGE (spår akm3-ensemble, AKM3.2026.09) + HASH-KEDJA tamper-vakt",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "byggAkm3Prediktionsrad: spår 'akm3-ensemble', versionsstämpel AKM3.2026.09, ensemble sida vid sida med akm2Komposit + akm1Totalt, band + enighet, pris null när det saknas (aldrig påhittat); datum styrs av mätningstillfället (default k.hamtat); hash-kedjan sha256(prev + '\\n' + kanonisk rad-utan-hash) verifierar för äkta kedja, är deterministisk 2×, och avslöjar BÅDE värdemanipulation med behållen hash och brutna länkar (r3:s prev pekar fel); tom kedja giltig, null ogiltig — append-only-kontraktet vaktas av rent lib + injicerad sha256 (klientsäkert)"
        : problem.slice(0, 6).join("; "),
      "3 rador + 2 fuskgill",
    );
  }

  // ── akm3/osakerhet (VÅG 59, AKM3 steg 3): GOLDEN intervallformel + porttak ──
  {
    const problem: string[] = [];
    const nara = (fanns: number, vantat: number): boolean => Math.abs(fanns - vantat) <= 1e-9;
    // INDU-C (r4 §2 worked example): K=58,1 t=0,67 ⇒ [58,1 ; 91,1], ±16,5
    const g1 = OSK.raknaIntervall(58.1, 0.67, false);
    if (!g1) problem.push("INDU-C: null");
    else {
      if (!nara(g1.nedre, 58.1)) problem.push("INDU-C nedre=" + String(g1.nedre));
      if (!nara(g1.ovre, 91.1)) problem.push("INDU-C ovre=" + String(g1.ovre) + " (väntat 58,1+100·(1−0,67)=91,1)");
      if (!nara(g1.halvbredd, 16.5)) problem.push("INDU-C halvbredd=" + String(g1.halvbredd) + " (formeln ger ±16,5 — inte direktivets illustrativa ±12)");
      if (g1.portTakad) problem.push("INDU-C portTakad utan aktiv port");
      if (!nara(g1.tackning, 0.67)) problem.push("INDU-C konfidens != t");
    }
    // PSNY: K=6,6 t=0,412 ⇒ övre 65,4
    const g2 = OSK.raknaIntervall(6.6, 0.412, false);
    if (!g2 || !nara(g2.ovre, 65.4)) problem.push("PSNY ovre=" + String(g2 && g2.ovre) + " (väntat 6,6+58,8=65,4)");
    // VPLAY: K=18,6 t=0,67, HÅRD PORT ⇒ naiv övre 52 men takas till 45
    const g3 = OSK.raknaIntervall(18.6, 0.67, true);
    if (!g3) problem.push("VPLAY: null");
    else {
      if (!nara(g3.ovre, 45)) problem.push("VPLAY ovre=" + String(g3.ovre) + " (porttak 45 genomslaget)");
      if (!g3.portTakad) problem.push("VPLAY portTakad=false trots kapning 52→45");
      if (!nara(g3.nedre, 18.6)) problem.push("VPLAY nedre=" + String(g3.nedre));
    }
    // t=1 ⇒ spannet kollapsar [K,K]
    const g4 = OSK.raknaIntervall(72, 1, false);
    if (!g4 || !nara(g4.nedre, 72) || !nara(g4.ovre, 72) || !nara(g4.halvbredd, 0)) {
      problem.push("t=1: " + JSON.stringify(g4) + " (väntat [72;72], ±0)");
    }
    // tak 100: K=80 t=0,5 ⇒ övre min(100,130)=100
    const g5 = OSK.raknaIntervall(80, 0.5, false);
    if (!g5 || !nara(g5.ovre, 100)) problem.push("tak100: ovre=" + String(g5 && g5.ovre));
    // port som inte biter: naiv övre exakt 45 ⇒ portTakad=false (min(45,45)=45)
    const g6 = OSK.raknaIntervall(20, 0.75, true);
    if (!g6 || g6.portTakad || !nara(g6.ovre, 45)) problem.push("port-gränsfall: " + JSON.stringify(g6));
    // strängare fullviktsrad [K·t, K·t+100(1−t)]: 58,1·0,67=38,927 … 71,927
    const fw = OSK.raknaFullviktsIntervall(58.1, 0.67);
    if (!fw || !nara(fw.nedre, 38.927) || !nara(fw.ovre, 71.927)) {
      problem.push("fullviktsrad: " + JSON.stringify(fw) + " (väntat [38,927; 71,927])");
    }
    // visningsformat: spannet + ± (svenska komma, inga lokaler)
    if (OSK.intervallText(g1) !== "58 [58–91] (täckning 67 %)") problem.push("intervallText=" + String(OSK.intervallText(g1)));
    if (OSK.intervallPlusText(g1) !== "58 ± 16,5 (täckning 67 %)") problem.push("intervallPlusText=" + String(OSK.intervallPlusText(g1)));
    if (OSK.spannText(g4) !== "[72–72]") problem.push("spannText(t=1)=" + String(OSK.spannText(g4)));
    rad(
      "akm3/osakerhet",
      "GOLDEN intervallformel [K, min(100,K+100(1−t))] + porttak 45 + fullviktsrad",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "INDU-C 58,1/67 % ⇒ [58–91] ±16,5 · PSNY 6,6/41,2 % ⇒ övre 65,4 · VPLAY 18,6 med hård port ⇒ övre takad 52→45 (portTakad) · t=1 ⇒ [K,K] ±0 · K=80 t=0,5 ⇒ övre 100 · fullviktsrad [K·t, K·t+100(1−t)] = [38,927; 71,927] · format '58 [58–91] (täckning 67 %)' och '± 16,5' exakta"
        : problem.slice(0, 6).join("; "),
      "INDU-C=[58,1;91,1] VPLAY ovre=45 PSNY ovre=65,4",
    );
  }
  // ── akm3/osakerhet: determinism + osatt-gränser (null in ⇒ null ut) ────────
  {
    const problem: string[] = [];
    const indata: Array<[number | null, number | null, boolean]> = [
      [58.1, 0.67, false], [6.6, 0.412, false], [18.6, 0.67, true],
      [72, 1, false], [0, 0, false], [45, 0.5, true], [null, 0.5, false], [50, null, false],
    ];
    const a = JSON.stringify(indata.map((x) => OSK.raknaIntervall(x[0], x[1], x[2])));
    const b = JSON.stringify(indata.map((x) => OSK.raknaIntervall(x[0], x[1], x[2])));
    if (a !== b) problem.push("ej deterministisk (2 körningar skiljer)");
    if (OSK.raknaIntervall(null, 0.67, false) !== null) problem.push("K=null ⇒ ej null (osatt=osatt brutet)");
    if (OSK.raknaIntervall(58.1, null, false) !== null) problem.push("t=null ⇒ ej null");
    if (OSK.raknaIntervall(undefined, undefined, true) !== null) problem.push("undefined ⇒ ej null");
    if (OSK.raknaIntervall(Number.NaN, 0.5, false) !== null) problem.push("NaN ⇒ ej null");
    const fwX = OSK.raknaFullviktsIntervall(null, 0.5);
    if (fwX !== null) problem.push("fullviktsrad null-in ⇒ ej null");
    rad(
      "akm3/osakerhet",
      "DETERMINISM 2× + gränser (K/t saknad ⇒ null, aldrig gissning)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "8 indatakombinationer (inkl. port, t=1, K=0) körda 2× — byte-identisk JSON; K/t null/undefined/NaN ⇒ null (P3: osatt är standardutdata); fullviktsraden likaså"
        : problem.slice(0, 6).join("; "),
      "indata=8 langd=" + String(a.length),
    );
  }
  // ── akm3/osakerhet (VÅG 66 r6): KALKYLATORREGLAGET "Vad händer vid full
  //    data?" — geometri-svep 0→100 % låtsas-täckning (r4 §3.3 + r6 §6 AC) ──
  {
    const problem: string[] = [];
    const nara = (fanns: number, vantat: number): boolean => Math.abs(fanns - vantat) <= 1e-9;
    const K = 62; // kalkylatorns komposit är alltid heltal (kärnan roundar)
    let forraOvre = Infinity;
    const varden: string[] = [];
    for (let p = 0; p <= 100; p += 5) {
      const i = OSK.raknaIntervall(K, p / 100, false);
      if (!i) { problem.push("p=" + p + ": null"); continue; }
      if (!nara(i.nedre, K)) problem.push("p=" + p + ": nedre=" + String(i.nedre) + " != K (golvet orubbligt brutet)");
      const vantatOvre = Math.min(100, K + 100 * (1 - p / 100));
      if (!nara(i.ovre, vantatOvre)) problem.push("p=" + p + ": ovre=" + String(i.ovre) + " != " + String(vantatOvre));
      if (i.ovre > forraOvre + 1e-9) problem.push("p=" + p + ": ovre ökar när t växer (ej monoton)");
      if (i.portTakad) problem.push("p=" + p + ": portTakad utan aktiv port");
      forraOvre = i.ovre;
      varden.push(p + "%=[" + String(i.nedre) + ";" + String(i.ovre) + "]");
    }
    // snabbknappens slutläge: t=100 % ⇒ "vid full data fastnar totalen vid K"
    const full = OSK.raknaIntervall(K, 1, false);
    if (!full || !nara(full.nedre, K) || !nara(full.ovre, K) || !nara(full.halvbredd, 0)) {
      problem.push("t=1: " + JSON.stringify(full) + " (väntat [62;62] ±0 — totalen fastnar vid K)");
    }
    rad(
      "akm3/osakerhet",
      "REGLAGE-SVEP låtsas-t 0→100 % (golvet K orubbligt, övre monoton)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "21 låtsas-lägen (0, 5, …, 100 %) på kalkylator-K 62: nedre = K i SAMTLIGA (saknad data vägs aldrig in poängmässigt), övre = min(100, 62+100·(1−t)) monotont icke-ökande 100→62, ingen portklippning utan port; t=100 % ⇒ [62;62] ±0 — vid full data fastnar totalen vid K"
        : problem.slice(0, 6).join("; "),
      "svep=" + varden.slice(0, 4).join(" ") + " … " + varden[varden.length - 1],
    );
  }
  // ── akm3/osakerhet (VÅG 66 r6): REGLAGE-KONTRAKT — låtsas-t utanför [0,1]
  //    kläms + ärlighetsnoten återges (reglaget kan aldrig ljuga om spann) ──
  {
    const problem: string[] = [];
    const K = 62;
    const over = OSK.raknaIntervall(K, 1.37, false); // låtsas-t över 100 % (omöjligt i UI:t — kontraktet ändå)
    if (!over) problem.push("t=1,37: null");
    else {
      if (Math.abs(over.tackning - 1) > 1e-9) problem.push("t=1,37 kläms ej till 1 (läst " + String(over.tackning) + ")");
      if (Math.abs(over.ovre - K) > 1e-9) problem.push("t=1,37: ovre=" + String(over.ovre) + " != K");
    }
    const under = OSK.raknaIntervall(K, -0.25, false); // under 0 %
    if (!under) problem.push("t=-0,25: null");
    else {
      if (Math.abs(under.tackning) > 1e-9) problem.push("t=-0,25 kläms ej till 0 (läst " + String(under.tackning) + ")");
      if (Math.abs(under.ovre - 100) > 1e-9) problem.push("t=-0,25: ovre=" + String(under.ovre) + " != 100");
      if (Math.abs(under.nedre - K) > 1e-9) problem.push("t=-0,25: nedre=" + String(under.nedre) + " != K");
    }
    // note-kontraktet (källkonsistens med korstabellens chip): spannet + täckning
    // + 0 p/5 p-fyllningen + 'Modellen gissar aldrig' återges i reglagets not.
    const i67 = OSK.raknaIntervall(K, 0.67, false);
    if (!i67) problem.push("t=0,67: null");
    else {
      if (i67.note.indexOf("[62") < 0) problem.push("note utan spann: " + i67.note);
      if (i67.note.indexOf("67 %") < 0) problem.push("note utan täckning: " + i67.note);
      if (i67.note.indexOf("0 p") < 0 || i67.note.indexOf("5 p") < 0) problem.push("note utan 0 p/5 p-fyllning: " + i67.note);
      if (i67.note.indexOf("Modellen gissar aldrig") < 0) problem.push("note utan ärlighetsfras: " + i67.note);
    }
    rad(
      "akm3/osakerhet",
      "REGLAGE-KONTRAKT klämning av låtsas-t + ärlighetsnot (note)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "låtsas-t 1,37 ⇒ kläms till 1 ⇒ [62;62]; −0,25 ⇒ kläms till 0 ⇒ [62;100] (reglaget kan aldrig producera ett spann utanför formeln ens med felaktigt UI-tal); note = 'Spann [62–95]: osatt vikt poängsatt 0 p (värsta) till 5 p (bästa) vid täckning 67 %. Modellen gissar aldrig.' — samma not som korstabellens chip"
        : problem.slice(0, 6).join("; "),
      "t=1,37 ⇒ [62;62] · t=−0,25 ⇒ [62;100] · note=äkta",
    );
  }

  // ── akm3/regim (VÅG 60 bygg-A, AKM3 steg 5): trösklar + genesis + n-vakt ──
  {
    const problem: string[] = [];
    const T = REG.REGIME_TROSKLAR;
    // G/R-trösklarna ÅTERANVÄNDER forskningslaget.ts:s kanoniska tal (r2 §2.2)
    if (T.gronIntrade !== FLS.TROSKEL_RIKT_ANDEL_GRONA) problem.push("gronIntrade != forskningslagets 0,10");
    if (T.gronUttrade !== FLS.TROSKEL_MAGERT_ANDEL_GRONA) problem.push("gronUttrade != forskningslagets 0,08");
    if (T.rodIntrade !== FLS.TROSKEL_MAGERT_ANDEL_RODA) problem.push("rodIntrade != forskningslagets 0,35");
    if (T.rodUttrade !== FLS.TROSKEL_RIKT_ANDEL_RODA) problem.push("rodUttrade != forskningslagets 0,30");
    if (T.minVagbolagForN !== 30) problem.push("n-vakt != 30");
    if (T.sigmaArsGate !== 0.25) problem.push("Σu-gate != 0,25");
    if (T.snapshotsNormal !== 2 || T.snapshotsHogVol !== 3) problem.push("snapshots 2/3");
    // Genesis mot BESLUT §8:s verifierade data: 2026-09-03 G=0,07 R=0,17 ⇒ magert
    const g = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2026-09-03" });
    if (g.regime !== "magert") problem.push("genesis 0,07/0,17 => " + String(g.regime) + " (väntat magert)");
    if (g.byte !== true) problem.push("genesis ska sätta byte=true (första loggraden)");
    if (g.indikatorer.nettoVagbredd !== null) problem.push("N utan scan ska vara null");
    if (String(g.nOsattOrsak).indexOf("vagscan") < 0) problem.push("nOsattOrsak=" + String(g.nOsattOrsak));
    if (g.senastKontrollerad !== "2026-09-03") problem.push("datering " + String(g.senastKontrollerad));
    // N-VAKTEN (BESLUT §9.1): 12 < 30 ⇒ N degraderas till osatt ÄVEN med råvärde
    // +0,9 ⇒ expansiv/korrigering är onåbara — regimen är G/R-only (test vaktar)
    const u = REG.raknaRegime({ gronAndel: 0.12, rodAndel: 0.17, nettoVagbredd: 0.9, antalVagbolag: 12, senastKontrollerad: "2026-09-03" });
    if (u.regime !== "balanserad") problem.push("12<30 + N=+0,9 => " + String(u.regime) + " (n-vakten ska degradera N till osatt)");
    if (u.indikatorer.nettoVagbredd !== null) problem.push("12<30: nettoVagbredd ska redovisas null");
    if (String(u.nOsattOrsak).indexOf("12") < 0) problem.push("nOsattOrsak ska nämna antalet: " + String(u.nOsattOrsak));
    // N mätt (≥ 30): expansiv (G ≥ 0,10 OCH N ≥ +0,20) och korrigering (N ≤ −0,20)
    const e = REG.raknaRegime({ gronAndel: 0.12, rodAndel: 0.1, nettoVagbredd: 0.25, antalVagbolag: 30, senastKontrollerad: "2026-09-03" });
    if (e.regime !== "expansiv") problem.push("30st N=+0,25 G=0,12 => " + String(e.regime));
    const ko = REG.raknaRegime({ gronAndel: 0.5, rodAndel: 0.1, nettoVagbredd: -0.25, antalVagbolag: 40, senastKontrollerad: "2026-09-03" });
    if (ko.regime !== "korrigering") problem.push("N=−0,25 => " + String(ko.regime));
    // G/R osatt ⇒ osatt (P3) + magert-entry via R-sidan (R > 0,35)
    if (REG.raknaRegime({ gronAndel: null, rodAndel: 0.17 }).regime !== "osatt") problem.push("G=null => ej osatt");
    if (REG.raknaRegime({ gronAndel: 0.2, rodAndel: 0.36, senastKontrollerad: "2026-09-03" }).regime !== "magert") problem.push("R=0,36 => ej magert");
    rad(
      "akm3/regim",
      "TRÖSKLAR (forskningslagets kanoniska 0,10/0,08/0,35/0,30) + genesis + N-VAKT (12<30 ⇒ osatt)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "G/R-trösklarna är forskningslaget.ts:s egna konstanter (en källa till sanning); genesis 2026-09-03 G=0,07 R=0,17 ⇒ magert med byte=true; N degraderas till osatt vid <30 mätta vågbolag ÄVEN med högt råvärde ⇒ expansiv/korrigering onåbara (BESLUT §9.1 — dagens 12 bolag vaktas av testet); N mätt vid ≥30: N=+0,25 G=0,12 ⇒ expansiv, N=−0,25 ⇒ korrigering; G=null ⇒ osatt; R=0,36 ⇒ magert"
        : problem.slice(0, 6).join("; "),
      "7fall + 4 tröskelkonstanter",
    );
  }

  // ── akm3/regim: HYSTERES — G 0,07↔0,08 byter ALDRIG (BESLUT §11 steg 5.ii) ─
  {
    const problem: string[] = [];
    const genesis = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2026-09-03" });
    const rad1 = REG.byggRegimeLoggrad(genesis);
    if (!rad1 || rad1.regime !== "magert") problem.push("genesis-rad");
    // Vippning 0,07↔0,08 över SEX nya kvartalssnapshots — regimen lämnar aldrig magert
    const DATUM = ["2026-12-01", "2027-03-01", "2027-06-01", "2027-09-01", "2027-12-01", "2028-03-01"];
    let forra = rad1;
    DATUM.forEach((d, i) => {
      const gron = i % 2 === 0 ? 0.07 : 0.08;
      const res = REG.raknaRegime({ gronAndel: gron, rodAndel: 0.17, senastKontrollerad: d }, forra);
      if (res.regime !== "magert") problem.push("vippning G=" + String(gron) + " (" + String(d) + ") => " + String(res.regime));
      if (res.byte) problem.push("vippning (" + String(d) + ") gav byte — hysteresen bruten");
      const nyRad = REG.byggRegimeLoggrad(res);
      if (nyRad) forra = nyRad;
    });
    // Inom bandet stå kvar: G=0,09 (≥ 0,08 men < 0,10) ⇒ magert utan kandidat
    const band = REG.raknaRegime({ gronAndel: 0.09, rodAndel: 0.17, senastKontrollerad: "2026-12-01" }, rad1);
    if (band.regime !== "magert" || band.kandidat !== null) problem.push("G=0,09 i bandet: " + String(band.regime) + " kandidat=" + JSON.stringify(band.kandidat));
    // R-sidan av utträdet: G=0,10 men R=0,31 (> 0,30) ⇒ fortfarande magert
    const rSida = REG.raknaRegime({ gronAndel: 0.1, rodAndel: 0.31, senastKontrollerad: "2026-12-01" }, rad1);
    if (rSida.regime !== "magert") problem.push("G=0,10 R=0,31 ska stanna magert (utträde kräver R ≤ 0,30)");
    // Fullt utträde startar kandidat (1 snapshot) — INTE omedelbart byte
    const ut1 = REG.raknaRegime({ gronAndel: 0.1, rodAndel: 0.3, senastKontrollerad: "2026-12-01" }, rad1);
    if (ut1.regime !== "magert" || ut1.byte || !ut1.kandidat || ut1.kandidat.regime !== "balanserad" || ut1.kandidat.snapshots !== 1) {
      problem.push("utträdesstart: " + JSON.stringify({ regime: ut1.regime, byte: ut1.byte, kandidat: ut1.kandidat }));
    }
    const ut2 = REG.raknaRegime({ gronAndel: 0.1, rodAndel: 0.3, senastKontrollerad: "2027-03-01" }, REG.byggRegimeLoggrad(ut1));
    if (ut2.regime !== "balanserad" || !ut2.byte) problem.push("utträde efter 2 snapshots => " + String(ut2.regime) + " byte=" + String(ut2.byte));
    rad(
      "akm3/regim",
      "HYSTERES: G 0,07↔0,08 byter ALDRIG · band 0,08–0,10 · utträde först vid G ≥ 0,10 OCH R ≤ 0,30",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "sex nya kvartalssnapshots som vippar G mellan 0,07 och 0,08 lämnar aldrig magert (kandidat aldrig ens startad — 0,08 uppfyller inte inträdet strikt-under-0,08); G=0,09 i hysteresbandet står kvar; G=0,10 med R=0,31 står kvar (R-sidan kräver ≤ 0,30); fullt utträde: kandidat balanserad vid snapshot 1, bekräftat byte först vid snapshot 2 — in-/ut-trösklarna är åtskilda (r2 §2.2)"
        : problem.slice(0, 6).join("; "),
      "6 vippningar + 4 bandfall",
    );
  }

  // ── akm3/regim: 2-SNAPSHOT-BEKRÄFTELSE + Σu-gate + reset + frysningskontrakt ─
  {
    const problem: string[] = [];
    const genesis = REG.byggRegimeLoggrad(
      REG.raknaRegime({ gronAndel: 0.09, rodAndel: 0.17, senastKontrollerad: "2026-09-03" }),
    );
    // Inträde magert från balanserad: snapshot 1 startar kandidat, snapshot 2 bekräftar
    const s1 = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2026-12-01" }, genesis);
    if (s1.regime !== "balanserad" || s1.byte || !s1.kandidat || s1.kandidat.regime !== "magert" || s1.kandidat.snapshots !== 1) {
      problem.push("snapshot 1: " + JSON.stringify({ regime: s1.regime, byte: s1.byte, kandidat: s1.kandidat }));
    }
    const s2 = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2027-03-01" }, REG.byggRegimeLoggrad(s1));
    if (s2.regime !== "magert" || !s2.byte) problem.push("snapshot 2: " + String(s2.regime) + " byte=" + String(s2.byte));
    // Målet tillbaka på sittande ⇒ kandidaten NOLLSTÄLLS (och regimen står kvar)
    const r1 = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2026-12-01" }, genesis);
    const r2 = REG.raknaRegime({ gronAndel: 0.09, rodAndel: 0.17, senastKontrollerad: "2027-03-01" }, REG.byggRegimeLoggrad(r1));
    if (r2.regime !== "balanserad" || r2.kandidat !== null) problem.push("kandidatreset: " + JSON.stringify({ regime: r2.regime, kandidat: r2.kandidat }));
    // Σu-GATE (r2 §2.2): års-Σu 30 % > 25 % ⇒ 3 snapshots krävs för bytet
    const q1 = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, sigmaArs: 0.3, senastKontrollerad: "2026-12-01" }, genesis);
    if (q1.kravdaSnapshots !== 3) problem.push("Σu=30 %: kravda=" + String(q1.kravdaSnapshots));
    const q2 = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, sigmaArs: 0.3, senastKontrollerad: "2027-03-01" }, REG.byggRegimeLoggrad(q1));
    if (q2.regime !== "balanserad" || q2.byte || !q2.kandidat || q2.kandidat.snapshots !== 2) {
      problem.push("Σu-gate snapshot 2: " + JSON.stringify({ regime: q2.regime, byte: q2.byte, kandidat: q2.kandidat }));
    }
    const q3 = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, sigmaArs: 0.3, senastKontrollerad: "2027-06-01" }, REG.byggRegimeLoggrad(q2));
    if (q3.regime !== "magert" || !q3.byte) problem.push("Σu-gate snapshot 3 => " + String(q3.regime) + " byte=" + String(q3.byte));
    // Låg Σu (15 %) ⇒ standard 2 snapshots
    if (REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, sigmaArs: 0.15, senastKontrollerad: "2026-12-01" }, genesis).kravdaSnapshots !== 2) {
      problem.push("Σu=15 % ska ge kravda=2");
    }
    if (REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2026-12-01" }, genesis).kravdaSnapshots !== 2) {
      problem.push("Σu osatt ska ge kravda=2");
    }
    // FRYSNINGSKONTRAKTET: samma/äldre snapshot-datum ⇒ tillståndet orörd
    // (dagar räknas ALDRIG som observationer — kvartalskadens via senastKontrollerad)
    const f1 = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2026-12-01" }, genesis);
    const f2 = REG.raknaRegime({ gronAndel: 0.03, rodAndel: 0.5, senastKontrollerad: "2026-12-01" }, REG.byggRegimeLoggrad(f1));
    if (f2.nySnapshot || f2.byte || f2.regime !== "balanserad" || !f2.kandidat || f2.kandidat.regime !== "magert" || f2.kandidat.snapshots !== 1) {
      problem.push("samma snapshot ska frysa: " + JSON.stringify({ ny: f2.nySnapshot, regime: f2.regime, kandidat: f2.kandidat }));
    }
    const f3 = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2026-09-03" }, REG.byggRegimeLoggrad(f1));
    if (f3.nySnapshot || f3.byte) problem.push("äldre snapshot ska också frysa (ny=" + String(f3.nySnapshot) + ")");
    rad(
      "akm3/regim",
      "2-SNAPSHOT-BEKRÄFTELSE + Σu-gate (3 vid >25 %) + kandidatreset + frysningskontrakt",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "inträde: kandidat magert (1) vid snapshot 1, bekräftat byte först vid snapshot 2; målet tillbaka på sittande nollställer kandidaten; års-Σu 30 % höjer kravet till 3 snapshots (byte först vid snapshot 3), Σu 15 %/osatt ⇒ 2; samma ELLER äldre senastKontrollerad fryser tillståndet helt (nySnapshot=false, byte=false, kandidat orörd) — dagliga cron-ronder kan aldrig räknas som observationer"
        : problem.slice(0, 6).join("; "),
      "inträde 2 + Σu 3 + reset + 2 frysningar",
    );
  }

  // ── akm3/regim: determinism + loggrad + HASH-KEDJA (append-only, tamper) ────
  {
    const problem: string[] = [];
    const sha = (t: string) => createHash("sha256").update(t, "utf8").digest("hex");
    const fallen = [
      { gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2026-09-03" },
      { gronAndel: 0.12, rodAndel: 0.1, nettoVagbredd: 0.25, antalVagbolag: 30, senastKontrollerad: "2026-12-01" },
      { gronAndel: null, rodAndel: null },
      { gronAndel: 0.5, rodAndel: 0.02, sigmaArs: 0.4, senastKontrollerad: "2027-03-01" },
      { gronAndel: 0.09, rodAndel: 0.31, nettoVagbredd: -0.3, antalVagbolag: 12, senastKontrollerad: "2027-06-01" },
    ];
    const forsta = JSON.stringify(fallen.map((f) => REG.raknaRegime(f)));
    const andra = JSON.stringify(fallen.map((f) => REG.raknaRegime(f)));
    if (forsta !== andra) problem.push("ej deterministisk (2 körningar skiljer)");
    // Loggradens kontrakt: spår + version + null vid saknat underlag
    const g = REG.raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2026-09-03" });
    const r0 = REG.byggRegimeLoggrad(g);
    if (!r0 || r0.spar !== "akm3-regim") problem.push("spar-typnamn");
    if (r0.modellVersion !== "AKM3.2026.09") problem.push("modellVersion=" + String(r0 && r0.modellVersion));
    if (REG.byggRegimeLoggrad(REG.raknaRegime({ gronAndel: null, rodAndel: 0.17 })) !== null) problem.push("G=null ska ge null-rad (loggen tiger)");
    if (REG.byggRegimeLoggrad(REG.raknaRegime({ gronAndel: 0.5, rodAndel: 0.1 })) !== null) problem.push("ogiltig datering ska ge null-rad");
    // HASH-KEDJAN: genesis → kandidatrad →byterad; verifiering + tamper-vakter
    const rad1 = REG.stemplaRegimeRad(r0, REG.REGIMELOGG_GENESIS, sha);
    const m1 = REG.raknaRegime({ gronAndel: 0.1, rodAndel: 0.3, senastKontrollerad: "2026-12-01" }, rad1);
    const rad2 = REG.stemplaRegimeRad(REG.byggRegimeLoggrad(m1), String(rad1.hash), sha);
    const m2 = REG.raknaRegime({ gronAndel: 0.1, rodAndel: 0.3, senastKontrollerad: "2027-03-01" }, rad2);
    const rad3 = REG.stemplaRegimeRad(REG.byggRegimeLoggrad(m2), String(rad2.hash), sha);
    if (!REG.verifieraRegimekedja([rad1, rad2, rad3], sha)) problem.push("äkta kedja verifierar ej");
    const rad1b = REG.stemplaRegimeRad(r0, REG.REGIMELOGG_GENESIS, sha);
    if (rad1.hash !== rad1b.hash) problem.push("hashen ej deterministisk (samma rad + prev)");
    const fusk = { ...rad2, regime: "expansiv" };
    if (REG.verifieraRegimekedja([rad1, fusk, rad3], sha)) problem.push("manipulerad rad (ändrad etikett, behållen hash) accepterades");
    const rad2annan = REG.stemplaRegimeRad(REG.byggRegimeLoggrad(m1), "fel-prev-hash", sha);
    if (REG.verifieraRegimekedja([rad1, rad2annan, rad3], sha)) problem.push("bruten länk (prev pekar fel) accepterades");
    if (!REG.verifieraRegimekedja([], sha)) problem.push("tom kedja ska vara giltig");
    if (REG.verifieraRegimekedja(null, sha)) problem.push("null-kedja ska vara ogiltig");
    rad(
      "akm3/regim",
      "DETERMINISM 2× + loggrad (spar akm3-regim) + HASH-KEDJA tamper-vakt",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "5 indatakombinationer (genesis, N mätt, G/R null, Σu 40 %, N under n-vakten) körda 2× — byte-identisk JSON; loggraden bär spår 'akm3-regim' + AKM3.2026.09 och blir null när underlag saknas (ogiltig datering/G osatt — loggen tiger); kedjan sha256(prev + '\\n' + kanonisk rad-utan-hash) verifierar för äkta kedja (genesis→kandidat→byte), är deterministisk 2×, och avslöjar BÅDE etikettmanipulation med behållen hash och brutna länkar; tom kedja giltig, null ogiltig — append-only-kontraktet vaktas av rent lib + injicerad sha256 (klientsäkert)"
        : problem.slice(0, 6).join("; "),
      "5 fall ×2 + 3 rador + 2 fuskgill",
    );
  }

  // ── peer (VÅG 59, AKM3 steg 4): midrank med delade + median (jämnt/udda) ──
  function peerRad(ticker: string, bransch: string, akm2: number | null): any {
    return { ...korstadRad(ticker, bransch, 50, "gron", "2026-09-03"), akm2: akm2 };
  }
  {
    const problem: string[] = [];
    // 5 bolag (grupp=5 ⇒ satt) med DELADE akm2-värden: 30, 33, 33, 55, 80
    const rader = [
      peerRad("P-A.ST", "finans", 30), peerRad("P-B.ST", "finans", 33),
      peerRad("P-C.ST", "finans", 33), peerRad("P-D.ST", "finans", 55),
      peerRad("P-E.ST", "finans", 80),
    ];
    const m = PER.raknaPeer(rader, { referensDatum: "2026-09-03" });
    const b = m.get("P-B.ST"), c = m.get("P-C.ST"), d = m.get("P-D.ST"), e = m.get("P-E.ST");
    if (!b || !c || !d || !e) problem.push("peer-saknas: " + JSON.stringify([...m.keys()]));
    else {
      // B och C delar 33: sämre=1 (A), lika=1 (varandra) ⇒ 100·(1+0,5)/4 = 37,5 — midrank
      if (b.peerPercentil !== 37.5) problem.push("B percentil=" + String(b.peerPercentil) + " (väntat 37,5)");
      if (c.peerPercentil !== 37.5) problem.push("C percentil=" + String(c.peerPercentil) + " (väntat 37,5 — delade värden)");
      if (b.rank !== 3 || c.rank !== 3) problem.push("delad rank: B=" + String(b.rank) + " C=" + String(c.rank) + " (väntat 3/3 — namnbrytning ALDRIG)");
      if (b.peerDrag !== 0) problem.push("B drag=" + String(b.peerDrag) + " (33 − median 33)");
      if (d.peerPercentil !== 75 || d.rank !== 2) problem.push("D: " + JSON.stringify({ p: d.peerPercentil, r: d.rank }) + " (väntat 75, rank 2)");
      if (e.peerPercentil !== 100 || e.rank !== 1) problem.push("E: " + JSON.stringify({ p: e.peerPercentil, r: e.rank }));
      if (d.peerDrag !== 22) problem.push("D drag=" + String(d.peerDrag) + " (55 − 33, udda median)");
    }
    // 6 bolag ⇒ jämn median = medel av de två mittersta: [41,43,45,47,55,80] ⇒ 46
    const rader2 = [
      peerRad("Q-A.ST", "teknik", 41), peerRad("Q-B.ST", "teknik", 43),
      peerRad("Q-C.ST", "teknik", 45), peerRad("Q-D.ST", "teknik", 47),
      peerRad("Q-E.ST", "teknik", 55), peerRad("Q-F.ST", "teknik", 80),
    ];
    const m2 = PER.raknaPeer(rader2, {});
    const qe = m2.get("Q-E.ST"), qa = m2.get("Q-A.ST");
    if (!qe || qe.branschMedian !== 46) problem.push("jämn median=" + String(qe && qe.branschMedian) + " (väntat (45+47)/2=46)");
    if (!qe || qe.peerDrag !== 9) problem.push("Q-E drag=" + String(qe && qe.peerDrag) + " (55 − 46)");
    if (!qa || qa.rank !== 6 || qa.peerPercentil !== 0) problem.push("Q-A (sämst): " + JSON.stringify(qa && { r: qa.rank, p: qa.peerPercentil }));
    rad(
      "peer",
      "MIDRANK percentil + delade värden + rank utan namnbrytning + median",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "grupp 5 (30/33/33/55/80): delade 33:or ⇒ percentil 37,5 för BÅDA och rank 3/3 (midrank, ingen namnbrytning); D ⇒ 75/rank 2, E ⇒ 100/rank 1; drag mot udda median 33; grupp 6 ⇒ jämn median (45+47)/2=46 och drag 55−46=+9; sämsta bolaget rank 6/percentil 0"
        : problem.slice(0, 6).join("; "),
      "B=C: p37,5 rank 3 · median(6)=46",
    );
  }
  // ── peer: osatt-regler — grupp 4, saknad akm2, variabel osatt hos bolaget ──
  {
    const problem: string[] = [];
    // grupp på 4 (< 5) ⇒ samtliga osatta, ALDRIG gissning
    const fyra = [
      peerRad("R-A.ST", "material", 50), peerRad("R-B.ST", "material", 60),
      peerRad("R-C.ST", "material", 70), peerRad("R-D.ST", "material", 80),
    ];
    const mFyra = PER.raknaPeer(fyra, {});
    const ra = mFyra.get("R-A.ST");
    if (!ra || ra.osatt !== true || ra.osattOrsak !== "liten-grupp") {
      problem.push("grupp=4: " + JSON.stringify(ra && { o: ra.osatt, orsak: ra.osattOrsak }));
    }
    if (ra && ra.peerPercentil !== null) problem.push("grupp=4 ändå percentil=" + String(ra.peerPercentil));
    // grupp 5 där E saknar akm2 ⇒ E osatt (saknad-akm2), de fyra andra satta över n=4
    const fem = [
      peerRad("S-A.ST", "energi", 30), peerRad("S-B.ST", "energi", 40),
      peerRad("S-C.ST", "energi", 50), peerRad("S-D.ST", "energi", 60),
      peerRad("S-E.ST", "energi", null),
    ];
    const mFem = PER.raknaPeer(fem, {});
    const se = mFem.get("S-E.ST"), sa = mFem.get("S-A.ST");
    if (!se || se.osatt !== true || se.osattOrsak !== "saknad-akm2") problem.push("E: " + JSON.stringify(se && { o: se.osatt, orsak: se.osattOrsak }));
    if (!sa || sa.osatt !== false || sa.peerPercentil !== 0 || sa.rank !== 4) {
      problem.push("A i grupp med null-komposit: " + JSON.stringify(sa && { o: sa.osatt, p: sa.peerPercentil, r: sa.rank }));
    }
    // variabel osatt hos bolaget (poang null) ⇒ hallning osatt; medianen över de icke-osatta
    const poang = {
      "S-A.ST": { V07: 5 }, "S-B.ST": { V07: 4 }, "S-C.ST": { V07: 3 },
      "S-D.ST": { V07: 2 }, "S-E.ST": { V07: null },
    };
    const mPoang = PER.raknaPeer(fem, { poangPerBolag: poang });
    const vA = mPoang.get("S-A.ST").variabler.find((v: any) => v.id === "V07");
    const vE = mPoang.get("S-E.ST").variabler.find((v: any) => v.id === "V07");
    if (!vA || vA.poang !== 5 || vA.hallning !== "over") problem.push("V07 A: " + JSON.stringify(vA) + " (median [2,3,4,5]=3,5; 5−3,5=1,5 ⇒ över)");
    if (!vE || vE.poang !== null || vE.hallning !== "osatt") problem.push("V07 E: " + JSON.stringify(vE) + " (osatt hos bolaget ⇒ osatt)");
    rad(
      "peer",
      "OSATT-REGLER (grupp 4 < 5 · saknad akm2 · variabel osatt hos bolaget)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "grupp på 4 ⇒ samtliga fält osatt med orsak 'liten-grupp' och percentil null; grupp 5 med en null-komposit ⇒ det bolaget osatt ('saknad-akm2') medan de jämförbara rankas över n=4; V07 med poäng null hos bolaget ⇒ hallning osatt och medianen räknad över gruppens icke-osatta ([2,3,4,5] ⇒ 3,5; 5−3,5 ⇒ ÖVER)"
        : problem.slice(0, 6).join("; "),
      "grupp4=osatt E=saknad-akm2 V07(E)=osatt",
    );
  }
  // ── peer: per-variabel hållning (±0,5-trösklarna) + referens + struktur ────
  {
    const problem: string[] = [];
    const rader = [
      peerRad("T-A.ST", "halso", 50), peerRad("T-B.ST", "halso", 55),
      peerRad("T-C.ST", "halso", 60), peerRad("T-D.ST", "halso", 65),
      peerRad("T-E.ST", "halso", 70),
    ];
    const poang: Record<string, Record<string, number | null>> = {
      "T-A.ST": { V01: 5, V07: 4 }, "T-B.ST": { V01: 4, V07: 4 },
      "T-C.ST": { V01: 3, V07: 3 }, "T-D.ST": { V01: 2, V07: 2 },
      "T-E.ST": { V01: 1, V07: null },
    };
    const m = PER.raknaPeer(rader, { referensDatum: "2026-09-03", poangPerBolag: poang });
    const tA = m.get("T-A.ST");
    if (!tA) problem.push("T-A saknas");
    else {
      if (tA.referens !== "2026-09-03 · 5-bolagsunivers") problem.push("referens=" + String(tA.referens) + " (skapad + universets storlek)");
      if (tA.antalIGruppen !== 5) problem.push("antalIGruppen=" + String(tA.antalIGruppen));
      if (!Array.isArray(tA.variabler) || tA.variabler.length !== 20) problem.push("variabler=" + String(tA.variabler.length) + " (väntat 20, V01–V20)");
      else {
        const v07 = tA.variabler.find((v: any) => v.id === "V07");
        // V07-pool [4,4,3,2] ⇒ median 3,5; 4−3,5=+0,5 ⇒ |·|≤0,5 ⇒ I NIVÅ
        if (!v07 || v07.branschmedian !== 3.5 || v07.hallning !== "iNiva") {
          problem.push("V07 A: " + JSON.stringify(v07) + " (median 3,5, diff +0,5 ⇒ i nivå)");
        }
        const v01 = tA.variabler.find((v: any) => v.id === "V01");
        // V01-pool [5,4,3,2,1] ⇒ median 3; 5−3=+2 ⇒ ÖVER
        if (!v01 || v01.hallning !== "over") problem.push("V01 A: " + JSON.stringify(v01) + " (5 − median 3 ⇒ över)");
      }
      // räkningar: A har V01 över + V07 i nivå — övriga 18 variabler osatta (ej poäng)
      if (tA.overMedian !== 1 || tA.iNiva !== 1 || tA.underMedian !== 0) {
        problem.push("räkning A: " + JSON.stringify({ o: tA.overMedian, n: tA.iNiva, u: tA.underMedian }));
      }
      const tD = m.get("T-D.ST");
      if (!tD || tD.underMedian !== 2) problem.push("räkning D: under=" + String(tD && tD.underMedian) + " (V01 2−3 och V07 2−3,5 ⇒ under)");
    }
    if (PER.peerRankText(tA) !== "5/5") problem.push("peerRankText(T-A)=" + String(PER.peerRankText(tA)) + " (väntat 5/5)");
    if (PER.peerDragText(-3.5) !== "−3,5" || PER.peerDragText(14) !== "+14" || PER.peerDragText(0) !== "±0" || PER.peerDragText(null) !== "—") {
      problem.push("peerDragText: " + String(PER.peerDragText(-3.5)) + "/" + String(PER.peerDragText(14)));
    }
    rad(
      "peer",
      "PER-VARIABEL hållning (±0,5) + referensfält + rank/drag-format",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "20 variabelrader i kanonisk ordning; V07-median [4,4,3,2] ⇒ 3,5 med diff +0,5 ⇒ I NIVÅ (tröskeln inkluderad), V01 5−3=+2 ⇒ ÖVER; osatta variabler räknas ej i över/i nivå/under; referens '2026-09-03 · 5-bolagsunivers'; rank '5/5'; drag +14/−3,5/±0/— (svenska tecken, inga lokaler)"
        : problem.slice(0, 6).join("; "),
      "V07(A)=iNiva V01(A)=over referens=2026-09-03 · 5-bolagsunivers",
    );
  }
  // ── peer: determinism 2× + kompositen OFÖRÄNDRAD med/utan peer ─────────────
  {
    const problem: string[] = [];
    const rader = [
      peerRad("U-A.ST", "industri", 51), peerRad("U-B.ST", "industri", 52),
      peerRad("U-C.ST", "industri", 53), peerRad("U-D.ST", "industri", 54),
      peerRad("U-E.ST", "industri", 55), peerRad("U-F.ST", "konsument", 30),
      peerRad("U-G.ST", "konsument", 40), peerRad("U-H.ST", "konsument", null),
      peerRad("U-I.ST", "konsument", 60), peerRad("U-J.ST", "konsument", 70),
    ];
    const poang = { "U-A.ST": { V07: 4 }, "U-B.ST": { V07: 3 } };
    const a = JSON.stringify([...PER.raknaPeer(rader, { referensDatum: "2026-09-03", poangPerBolag: poang }).entries()]);
    const b = JSON.stringify([...PER.raknaPeer(rader, { referensDatum: "2026-09-03", poangPerBolag: poang }).entries()]);
    if (a !== b) problem.push("ej deterministisk (2 körningar skiljer)");
    if (PER.raknaPeer([], {}).size !== 0) problem.push("tomma rader ⇒ ej tom karta");
    // lässkiktsgaranti: poängfälten byte-identiska med och utan peer-information
    const karna = (rs: any[]) => JSON.stringify(rs.map((r) => ({ t: r.ticker, a1: r.akm1Totalt, a2: r.akm2, s: r.akm2Skillnad })));
    const medPeer = rader.map((r) => ({ ...r, peer: PER.raknaPeer(rader, { poangPerBolag: poang }).get(r.ticker) }));
    if (karna(rader) !== karna(medPeer)) problem.push("poängfälten påverkade av peer (lässlager-kontrakt brutet)");
    if (!medPeer.every((r) => r.peer && r.peer.variabler.length === 20)) problem.push("berikade rader saknar peer.variabler");
    rad(
      "peer",
      "DETERMINISM 2× + kompositen OFÖRÄNDRAD med/utan peer + tomma rader",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "10 rader (2 branscher, en null-komposit) med poängfixture ⇒ 2× byte-identisk JSON; {ticker, akm1Totalt, akm2, akm2Skillnad} identiska med och utan peer-fält — peer är ett läslager som aldrig blir indata i poängen; raknaPeer([]) ⇒ tom karta"
        : problem.slice(0, 6).join("; "),
      "langd=" + String(a.length) + " rader=10",
    );
  }
}
// ══ FAS MÖS: ÖVERSÄTTNINGSYSTEMET (våg 52) — deterministisk kärna, inget nät ══
// Termbankens rätt-översättningsgaranti, siffer-/struktur-/lateral-kontroller,
// AR-normalisering av östra siffror, versionshash samt källregistret ur
// public/deep-courses.json + ordlistan. Motorstatusflödet testas med nyckeln
// borttagen (deterministisk ärlighet: "vantar-motor", aldrig låtsasöversättning).
async function fasOversattning(): Promise<void> {
  // ── MÖS 1: termbankens struktur och garanti-kontrakt ───────────────────────
  {
    const problem: string[] = [];
    const storlek: number = OVS.TERMBANK_STORLEK;
    if (!(storlek >= 200)) problem.push("termbank " + String(storlek) + " termer (< 200 — kundkravet bruten)");
    const tomma = OVS.TERMBANK.filter((r: any) => !r.sv || !r.en || !r.ar);
    if (tomma.length > 0) problem.push(String(tomma.length) + " rader med tomt fält");
    const svLista: string[] = OVS.TERMBANK.map((r: any) => r.sv);
    const dubletter = svLista.filter((s: string, i: number) => svLista.indexOf(s) !== i);
    if (dubletter.length > 0) problem.push("dubbla sv-termer: " + dubletter.slice(0, 4).join(","));
    if (OVS.arVitlista().length !== 0) problem.push("arVitlista ej tom — termbanken läcker åäö i ar-fält");
    if (!(OVS.latinskaTermer().length >= 20)) problem.push("latinska termer " + String(OVS.latinskaTermer().length) + " (< 20)");
    const samman = OVS.termForSv("sammanvägningen");
    if (!samman || samman.en !== "the Synthesis" || samman.ar !== "الموازنة الشاملة") {
      problem.push("kundterminologi saknar rad: sammanvägningen → the Synthesis/الموازنة الشاملة");
    }
    const moat = OVS.termForSv("moat");
    const vallgrav = OVS.termForSv("vallgrav");
    if (!moat || moat.ar !== "الخندق التنافسي") problem.push("moat-ar ≠ الخندق التنافسي");
    if (!vallgrav || vallgrav.en !== "moat" || vallgrav.ar !== "الخندق التنافسي") problem.push("vallgrav → moat/الخندق التنافسي saknas");
    rad(
      "mos-oversattning",
      "TERMBANK struktur + kundtermer (≥200 rader)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? storlek + " termer sv→en→ar i 11 kategorier; inga tomma fält, inga dubletter; latinska termer (" + String(OVS.latinskaTermer().length) + ") behålls i AR; kundtermerna sammanvägningen/moat/vallgrav kanoniska"
        : problem.slice(0, 6).join("; "),
      "storlek=" + String(storlek) + " latinska=" + String(OVS.latinskaTermer().length),
    );
  }

  // ── MÖS 2: termKonsistens — rätt-översättningsgarantin (pass + fail) ──────
  {
    const problem: string[] = [];
    const kalla = "Bruttomarginalen förbättrades och skuldsättningsgraden sjönk efter nyemissionen. ROE blev 23%.";
    const bra = "The gross margin improved and the debt-to-equity ratio fell after the new share issue. ROE became 23%.";
    const dalig = "The profit improved and the debt fell after the issue of shares. ROE became 23%.";
    const okRes = KTR.termKonsistens(kalla, bra, "en");
    const felRes = KTR.termKonsistens(kalla, dalig, "en");
    if (!okRes.pass) problem.push("korrekt översättning underkänns: " + okRes.detaljer);
    if (!(okRes.varden.traffade === 4)) problem.push("träffar=" + String(okRes.varden.traffade) + " (förväntat 4: bruttomarginal, skuldsättningsgrad, nyemission, ROE)");
    if (felRes.pass) problem.push("felaktig översättning godkänns — garantin tät");
    if (!(felRes.varden.missar >= 2)) problem.push("missar=" + String(felRes.varden.missar) + " (förväntat ≥2)");
    rad(
      "mos-oversattning",
      "KONTROLL termKonsistens (pass + fail-case)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "4 termbankstermer i källan kräver exakt målterm; korrekt översättning pass, felaktig (gross margin + debt-to-equity saknas) fångas med " + String(felRes.varden.missar) + " missar"
        : problem.slice(0, 6).join("; "),
      "traffade=" + String(okRes.varden.traffade) + " missar(dålig)=" + String(felRes.varden.missar),
    );
  }

  // ── MÖS 3: sifferIntegritet — ett ändrat tal är ett faktafel ───────────────
  {
    const problem: string[] = [];
    const kalla = "Vinsten steg 12,5 % till 258 Mkr och marginalen blev 8,2 %. Året 2026 börjar bra.";
    const bra = "Profit rose 12,5 % to 258 Mkr and the margin became 8,2 %. The year 2026 starts well.";
    const dalig = "Profit rose 12.5% to 259 Mkr and the margin became 8,2 %. The year 2026 starts well.";
    const okRes = KTR.sifferIntegritet(kalla, bra);
    const felRes = KTR.sifferIntegritet(kalla, dalig);
    if (!okRes.pass) problem.push("identiska tal underkänns: " + okRes.detaljer);
    if (felRes.pass) problem.push("ändrade tal (12,5→12.5, 258→259) godkänns");
    if (!(felRes.varden.saknade >= 2) || !(felRes.varden.extra >= 2)) problem.push("multiset-räkning avviker: " + JSON.stringify(felRes.varden));
    rad(
      "mos-oversattning",
      "KONTROLL sifferIntegritet (tal ändrat ⇒ fail)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "decimalteckenbyte (12,5→12.5) och sifferväxling (258→259) fångas som multiset-avvikelse; identisk översättning pass"
        : problem.slice(0, 6).join("; "),
      "saknade=" + String(felRes.varden.saknade) + " extra=" + String(felRes.varden.extra),
    );
  }

  // ── MÖS 4: strukturIntegritet — stycken/listor/markdown + JSON-block ───────
  {
    const problem: string[] = [];
    const kalla = "Rubrik om moat\n\nFörsta stycket med genomgång.\n\n- punkt ett\n- punkt två\n\nAndra stycket.";
    const bra = "Heading on moat\n\nFirst paragraph of the review.\n\n- point one\n- point two\n\nSecond paragraph.";
    const dalig = "Heading on moat\n\nFirst paragraph and more text merged.";
    const okRes = KTR.strukturIntegritet(kalla, bra);
    const felRes = KTR.strukturIntegritet(kalla, dalig);
    if (!okRes.pass) problem.push("identisk struktur underkänns: " + okRes.detaljer);
    if (felRes.pass) problem.push("3 stycken/2 punkter → 1 stycke/0 punkter godkänns");
    const jsonKalla = "{\"rubrik\":\"Investerare vs Spekulant\",\"rader\":[[\"Aspekt\",\"Investerare\"],[\"Grund\",\"Analys av värde\"]]}";
    const jsonBra = "{\"rubrik\":\"Investor vs Speculator\",\"rader\":[[\"Aspect\",\"Investor\"],[\"Basis\",\"Value analysis\"]]}";
    const jsonFel = "{\"rubrik\":\"Investor vs Speculator\",\"rader\":[[\"Aspect\",\"Investor\"]]}";
    const jOk = KTR.strukturIntegritet(jsonKalla, jsonBra);
    const jFel = KTR.strukturIntegritet(jsonKalla, jsonFel);
    if (!jOk.pass) problem.push("JSON-block med bevarade nycklar/arraylängder underkänns: " + jOk.detaljer);
    if (jFel.pass) problem.push("ändrad arraylängd i JSON-block godkänns");
    rad(
      "mos-oversattning",
      "KONTROLL strukturIntegritet (stycken/listor/JSON)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "stycken, rader, markdown-listor och rubriker jämförs; JSON-block (tabell/tidslinje) kräver identiska toppnycklar + arraylängder — kapad struktur fångas"
        : problem.slice(0, 6).join("; "),
      "prosa-fail=" + String(felRes.pass === false) + " json-pass=" + String(jOk.pass) + " json-fail=" + String(jFel.pass === false),
    );
  }

  // ── MÖS 5: lateralKolla — längdförhållande 0,5–2,5× + AR åäö-läcka ────────
  {
    const problem: string[] = [];
    const kalla = "Detta är en tillräckligt lång svensk text om bruttomarginal och moat så att längdförhållandet kan beräknas på ett meningsfullt sätt.";
    const lagom = "This is a sufficiently long English text about gross margin and moat so that the length ratio can be calculated in a meaningful way.";
    const avkapad = "Gross margin.";
    const okRes = KTR.lateralKolla(kalla, lagom, "en");
    const kortRes = KTR.lateralKolla(kalla, avkapad, "en");
    if (!okRes.pass) problem.push("lagom längd underkänns: " + okRes.detaljer);
    if (kortRes.pass) problem.push("avkapad översättning (förhållande " + String(kortRes.varden.langdForhallande) + ") godkänns");
    const arKalla = "Fundamental analys handlar om att läsa ett bolags räkenskaper noggrant och utan stress.";
    const arRen = "التحليل الأساسي يعني قراءة القوائم المالية للشركة بعناية ودون تسرع في كل جانب من جوانبها.";
    const arLacka = "التحليل الأساسي يعني قراءة القوائم المالية للشركة بعناية och utan stress åäö varje dag.";
    const arOk = KTR.lateralKolla(arKalla, arRen, "ar");
    const arFel = KTR.lateralKolla(arKalla, arLacka, "ar");
    if (!arOk.pass) problem.push("ren arabiska underkänns: " + arOk.detaljer);
    if (arFel.pass) problem.push("åäö-läcka i AR godkänns");
    const enArLacka = KTR.lateralKolla(kalla, lagom + " التحليل", "en");
    if (enArLacka.pass) problem.push("arabisk läcka i EN godkänns");
    rad(
      "mos-oversattning",
      "KONTROLL lateralKolla (längd 0,5–2,5×, åäö/ar-läckor)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "förhållande " + String(okRes.varden.langdForhallande) + " inom intervall pass; avkapad (" + String(kortRes.varden.langdForhallande) + ") fail; AR åäö-läcka fail; EN arabiskläcka fail"
        : problem.slice(0, 6).join("; "),
      "okFörhållande=" + String(okRes.varden.langdForhallande) + " avkapad=" + String(kortRes.varden.langdForhallande),
    );
  }

  // ── MÖS 6: AR-siffernormalisering ٠-٩ (vectorer + integrerat pass) ─────────
  {
    const problem: string[] = [];
    if (KTR.normaliseraSiffror("٠١٢٣٤٥٦٧٨٩") !== "0123456789") problem.push("siffrorna ٠-٩ normaliseras ej");
    if (KTR.normaliseraSiffror("٢٣٫٤") !== "23.4") problem.push("decimalseparatorn ٫ normaliseras ej");
    if (KTR.normaliseraSiffror("١٢٬٣٤٥") !== "12,345") problem.push("tusentalsseparatorn ٬ normaliseras ej");
    if (KTR.normaliseraSiffror(" redistribute 12,5 ") !== " redistribute 12,5 ") problem.push("redan latinsk text påverkas (ej idempotent)");
    const kalla = "ROE blev 23,4 % och NCAV togs till 12 kronor per aktie i grundtestet.";
    const arBra = "أصبح ROE ٢٣,٤٪ وتم احتساب NCAV بقيمة ١٢ كرونًا لكل سهم في الاختبار الأساسي.";
    const arFel = "أصبح ROE ٢٤,٤٪ وتم احتساب NCAV بقيمة ١٢ كرونًا لكل سهم في الاختبار الأساسي.";
    const okRes = KTR.sifferIntegritet(kalla, arBra);
    const felRes = KTR.sifferIntegritet(kalla, arFel);
    if (!okRes.pass) problem.push("östra siffror godkänns ej trots normalisering: " + okRes.detaljer);
    if (felRes.pass) problem.push("٢٣,٤→٢٤,٤ (sifferväxling på östra siffror) godkänns");
    rad(
      "mos-oversattning",
      "KONTROLL AR-normalisering (٠-٩٫٬ → 0-9.,)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "östra siffror/separatatorer normaliseras före multiset-jämförelsen: ٢٣,٤≡23,4 pass, ٢٤,٤ fail; redan latinska tal rörs ej"
        : problem.slice(0, 6).join("; "),
      "normaliserad='0123456789' ar-pass=" + String(okRes.pass) + " ar-fail=" + String(felRes.pass === false),
    );
  }

  // ── MÖS 7: raknaHash — SHA-256 12 hex, deterministisk (testvector) ─────────
  {
    const problem: string[] = [];
    const h1 = KLL.raknaHash("a");
    const h2a = KLL.raknaHash("Bruttomarginalen steg.");
    const h2b = KLL.raknaHash("Bruttomarginalen steg.");
    const h3 = KLL.raknaHash("Bruttomarginalen steg!");
    if (!/^[0-9a-f]{12}$/.test(h1)) problem.push("format ej 12 gemener hex: " + h1);
    if (h1 !== "ca978112ca1b") problem.push("testvector sha256('a')='ca978112ca1b…' stämmer ej: " + h1);
    if (h2a !== h2b) problem.push("samma indata ⇒ olika hash (indeterminism)");
    if (h2a === h3) problem.push("olika indata ⇒ samma hash (kollision i test)");
    const hUniA = KLL.raknaHash("åäö ÅÄÖ 100%");
    const hUniB = KLL.raknaHash("åäö ÅÄÖ 100%");
    if (hUniA !== hUniB || !/^[0-9a-f]{12}$/.test(hUniA)) problem.push("unicode-indata hashas ej deterministiskt");
    rad(
      "mos-oversattning",
      "VERSIONSHASH determinism (SHA-256 12 hex)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "sha256('a')=ca978112ca1b (fast testvector); samma text ⇒ samma hash, annan text ⇒ annan hash; unicode utf-8-stabilt"
        : problem.slice(0, 6).join("; "),
      "hash('a')=" + h1 + " unicode=" + hUniA,
    );
  }

  // ── MÖS 8: listaKallor — registret ur deep-courses.json + ordlistan ────────
  {
    const problem: string[] = [];
    const kallor: any[] = KLL.listaKallor();
    const ui = kallor.filter((k) => k.scope.typ === "ui");
    const block = kallor.filter((k) => k.scope.typ === "kursblock");
    if (!(block.length >= 15000)) problem.push("kursblock=" + String(block.length) + " (< 15000 — registret läser ej deep-courses.json)");
    const ordAntal = Object.keys(ORD.ORDLISTA).length;
    if (ui.length !== ordAntal) problem.push("ui=" + String(ui.length) + " ≠ ordlistans " + String(ordAntal) + " nycklar");
    const identer = kallor.map((k) => KLL.kallaIdent(k.scope));
    const unika = new Set(identer);
    if (unika.size !== kallor.length) problem.push("dubbla källidenter: " + String(kallor.length - unika.size));
    const allaHash = kallor.every((k) => /^[0-9a-f]{12}$/.test(k.hash) && k.hash === KLL.raknaHash(k.text));
    if (!allaHash) problem.push("någon källas hash avviker från raknaHash(text)");
    // Våg 54: registret omfattar nu block + titel + intro + quiz (q/a0-3/tips)
    const blockNycklar = block.filter((k) => /:block\d+$/.test(k.scope.nyckel));
    const blockFormat = blockNycklar.every((k) => /^[^:]+:kap\d+:block\d+$/.test(k.scope.nyckel));
    if (!blockFormat) problem.push("block-nycklar följer ej <slug>:kap<n>:block<n>");
    // Våg 80b del A: kursens EGEN titel — nyckel "<slug>:titel" (en per kurs;
    // kollisionssäker i kursblock-domänen eftersom övriga nycklar har :kapN:).
    const kursTitlar = block.filter((k) => /^[^:]+:titel$/.test(k.scope.nyckel));
    const kursTitelFormat = kursTitlar.every((k) => k.scope.nyckel === k.scope.nyckel.split(":")[0] + ":titel" && typeof k.text === "string" && k.text.length > 0);
    if (!kursTitelFormat) problem.push("kurs-titelnycklar följer ej <slug>:titel eller saknar text");
    const kapSlugs = new Set(block.filter((k) => /:kap\d+:/.test(k.scope.nyckel)).map((k) => k.scope.nyckel.split(":")[0]));
    const titelSlugs = new Set(kursTitlar.map((k) => k.scope.nyckel.split(":")[0]));
    if (titelSlugs.size !== kapSlugs.size) problem.push("kurs-titlar=" + String(kursTitlar.length) + " för " + String(titelSlugs.size) + " slugs ≠ " + String(kapSlugs.size) + " kurser med kapitel");
    const ovrigaFormat = block
      .filter((k) => !/:block\d+$/.test(k.scope.nyckel) && !/^[^:]+:titel$/.test(k.scope.nyckel))
      .every((k) => /^[^:]+:(kap\d+:(titel|intro|quiz\d+:(q|a\d+|tips))|learn|varfor|perspektiv:(lynch|graham|ak1))$/.test(k.scope.nyckel));
    if (!ovrigaFormat) problem.push("titel/intro/quiz-nycklar följer ej registrets konvention");
    const igen: any[] = KLL.listaKallor();
    if (igen.length !== kallor.length) problem.push("andra anropet ger annat antal (" + String(igen.length) + ")");
    rad(
      "mos-oversattning",
      "KÄLLREGISTER listaKallor (ui + kursblock: block/titel/intro/quiz + kurs-titel)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? String(kallor.length) + " källor: " + String(ui.length) + " ui-nycklar (= ordlistan) + " + String(block.length) + " kursblock (varav " + String(kursTitlar.length) + " kurs-titlar <slug>:titel, en per kurs); alla hashar = raknaHash(text), identer unika, nyckelformat <slug>:kap<n>:block<n> + <slug>:titel, deterministiskt vid upprepat anrop"
        : problem.slice(0, 6).join("; "),
      "totalt=" + String(kallor.length) + " ui=" + String(ui.length) + " kursblock=" + String(block.length) + " kurstitlar=" + String(kursTitlar.length),
    );
  }

  // ── MÖS 9: motorstatusflödet — trösklar + vantar-motor (testläge, inget nät) ─
  {
    const problem: string[] = [];
    if (MOT.bestamStatus(100) !== "publicerad") problem.push("100 ⇒ " + String(MOT.bestamStatus(100)) + " (förväntat publicerad)");
    if (MOT.bestamStatus(99) !== "utkast") problem.push("99 ⇒ " + String(MOT.bestamStatus(99)));
    if (MOT.bestamStatus(90) !== "utkast") problem.push("90 ⇒ " + String(MOT.bestamStatus(90)) + " (förväntat utkast)");
    if (MOT.bestamStatus(89) !== "maskinutkast-behovar-granskning") problem.push("89 ⇒ " + String(MOT.bestamStatus(89)));
    if (MOT.bestamStatus(Number.NaN) !== "maskinutkast-behovar-granskning") problem.push("NaN-gränsfall hanteras ej");
    // Våg 54: ZAI-nyckeln tas bort OCH hela externa kedjan stängs av
    // (OVERSATTNING_EXTERN_AVSTANGD=1) — sviten kör ALDRIG riktiga nätanrop.
    const sparadNyckel = process.env.ZAI_API_KEY;
    const sparadDeepl = process.env.DEEPL_API_KEY;
    const sparadGoogle = process.env.GOOGLE_TRANSLATE_KEY;
    const sparadAv = process.env.OVERSATTNING_EXTERN_AVSTANGD;
    delete process.env.ZAI_API_KEY;
    delete process.env.DEEPL_API_KEY;
    delete process.env.GOOGLE_TRANSLATE_KEY;
    process.env.OVERSATTNING_EXTERN_AVSTANGD = "1";
    try {
      if (MOT.motorAktiv() !== false) problem.push("motorAktiv() true utan nyckel");
      if (MOT.externKedja().length !== 0) problem.push("externKedja() ej tom i avstängt läge");
      const r = await MOT.oversatt("Bruttomarginalen förbättrades.", "en");
      if (r.status !== "vantar-motor") problem.push("status=" + String(r.status) + " (förväntat vantar-motor)");
      if (r.text !== null) problem.push("text producerad utan motor — låtsasöversättning!");
      if (r.motor !== "ingen") problem.push("motor=" + String(r.motor));
      const prompt = MOT.byggSystemPrompt("Bruttomarginalen och moat.", "en");
      if (typeof prompt !== "string" || prompt.indexOf("TERMBANK") < 0 || prompt.indexOf("bruttomarginal") < 0) {
        problem.push("systemprompt saknar TERMBANK-block/detekterade termer");
      }
      if (prompt.indexOf("الخندق التنافسي") < 0) problem.push("prompten visar ej ar-kolumnen för vallgrav/moat");
      const t1 = MOT.raknaMaxTokens(200);
      const t2 = MOT.raknaMaxTokens(4000);
      if (!(t1 >= 800) || !(t2 > t1) || MOT.raknaMaxTokens(100000) > 8000) problem.push("maxTokens-intervall [800,8000] brutet");
    } finally {
      if (sparadNyckel !== undefined) process.env.ZAI_API_KEY = sparadNyckel;
      if (sparadDeepl !== undefined) process.env.DEEPL_API_KEY = sparadDeepl;
      if (sparadGoogle !== undefined) process.env.GOOGLE_TRANSLATE_KEY = sparadGoogle;
      if (sparadAv !== undefined) process.env.OVERSATTNING_EXTERN_AVSTANGD = sparadAv;
      else delete process.env.OVERSATTNING_EXTERN_AVSTANGD;
    }
    rad(
      "mos-oversattning",
      "MOTOR statusflöde + vantar-motor (ZAI + extern kedja avstängd — inget nät)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "100→publicerad, 90–99→utkast, <90→maskinutkast-behovar-granskning; utan nycklar och med kedjan avstängd: status vantar-motor, text=null (deterministisk ärlighet — ingen låtsasöversättning); prompten bär termbanken; maxTokens ∈ [800,8000]"
        : problem.slice(0, 6).join("; "),
      "trösklar=100/90/89 motorAktiv=false kedja=0",
    );
  }

  // ── MÖS 10: kontrollrapportens poängsummering (0–100, viktad) ──────────────
  {
    const problem: string[] = [];
    const kalla = "Bruttomarginalen blev 12,5 % och ROE steg till 21.\n\n- punkt ett\n- punkt två";
    const perfekt = "The gross margin became 12,5 % and ROE rose to 21.\n\n- point one\n- point two";
    const brand = KTR.korKontroller(kalla, perfekt, "en");
    if (brand.poang !== 100) problem.push("perfekt översättning ⇒ " + String(brand.poang) + " poäng (förväntat 100)");
    if (brand.resultat.length !== 4) problem.push("antal kontroller=" + String(brand.resultat.length));
    const halv = KTR.korKontroller(kalla, "The margin became 99 %.", "en");
    if (halv.poang >= 90) problem.push("undermålig översättning ⇒ " + String(halv.poang) + " (skedevägran över tröskel)");
    if (KTR.KVALITETSTRASKEL !== 90) problem.push("KVALITETSTRASKEL=" + String(KTR.KVALITETSTRASKEL));
    rad(
      "mos-oversattning",
      "KONTROLLRAPPORT poäng 0–100 (viktad summa)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "perfekt översättning = 100 (40+25+20+15); sifferfel+strukturavvikelse+termmiss ger " + String(halv.poang) + " poäng — under tröskeln 90, dvs maskinutkast-behovar-granskning"
        : problem.slice(0, 6).join("; "),
      "perfekt=" + String(brand.poang) + " undermalig=" + String(halv.poang) + " traskel=" + String(KTR.KVALITETSTRASKEL),
    );
  }

  // ── MÖS 11 (våg 54): TERMBANK-ERSÄTTNING POST — fel term rättas deterministiskt ──
  {
    const problem: string[] = [];
    // synonym-byte: bruttomarginal översatt till "profit margin" (vinstmarginalens målterm)
    const k1 = "Bruttomarginalen blev 12,5 % och moat breddades under året.";
    const m1 = "The profit margin became 12,5 % and the moat widened during the year.";
    const r1 = MOT.tvingaTermbank(k1, m1, "en");
    if (r1.text.indexOf("gross margin") < 0) problem.push("synonym-byte: rättad='" + r1.text + "'");
    if (r1.text.indexOf("profit margin") >= 0) problem.push("fel term kvar efter byte");
    if (r1.rattade.length !== 1 || r1.rattade[0].via !== "synonym-byte") problem.push("rattade=" + JSON.stringify(r1.rattade));
    const k1k = KTR.termKonsistens(k1, r1.text, "en");
    if (!k1k.pass) problem.push("termKonsistens failar efter rättning: " + k1k.detaljer);
    // svenskt läckage: vallgrav lämnad oöversatt i svaret
    const k2 = "Vallgraven skyddar bolaget.";
    const m2 = "The vallgrav protects the company.";
    const r2 = MOT.tvingaTermbank(k2, m2, "en");
    if (r2.text !== "The moat protects the company.") problem.push("svenskt lackage: '" + r2.text + "'");
    // redan korrekta termer rörds aldrig
    const k3 = "Moat är intimt kopplad till prissättningsmakt.";
    const m3 = "Moat is closely linked to pricing power.";
    const r3 = MOT.tvingaTermbank(k3, m3, "en");
    if (r3.text !== m3 || r3.rattade.length !== 0) problem.push("korrekt svar rördes: " + JSON.stringify(r3.rattade));
    // ofullständig målterm (AR): الخندق utökas till الخندق التنافسي
    const k4 = "Vallgraven skyddar bolaget i bransehen.";
    const m4 = "يحمي الخندق الشركة في القطاع.";
    const r4 = MOT.tvingaTermbank(k4, m4, "ar");
    if (r4.text.indexOf("الخندق التنافسي") < 0) problem.push("ofullstandig malterm (ar): '" + r4.text + "'");
    rad(
      "mos-oversattning",
      "TERMBANK-ERSÄTTNING POST (fel term → rättad, 4 strategier)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "synonym-byte: bruttomarginal→profit margin byts till gross margin (termKonsistens pass efteråt); svenskt lackage: vallgrav→moat; korrekt svar rörds ej (0 rättningar); ofullständig AR-målterm الخندق utökas till الخندق التنافسي"
        : problem.slice(0, 6).join("; "),
      "r1=" + String(r1.rattade.length) + " rattad r2='" + String(r2.text) + "' r3=" + String(r3.rattade.length),
    );
  }

  // ── MÖS 12 (våg 54): MyMemory-payload — URL-kodning, bitdelning, kvot-vakter ──
  {
    const problem: string[] = [];
    const u = MOT.byggMyMemoryUrl("Vad är avkastning på eget kapital?", "en");
    if (u.protocol !== "https:" || u.hostname !== "api.mymemory.translated.net") problem.push("url=" + u.toString());
    if (u.pathname !== "/get") problem.push("path=" + u.pathname);
    if (u.searchParams.get("q") !== "Vad är avkastning på eget kapital?") problem.push("q ej korrekt kodad/rundad: " + String(u.searchParams.get("q")));
    if (u.searchParams.get("langpair") !== "sv|en") problem.push("langpair=" + String(u.searchParams.get("langpair")));
    if (u.toString().indexOf(" ") >= 0) problem.push("mellanslag ej URL-kodat");
    if (u.toString().indexOf("%7C") < 0) problem.push("| ej kodad som %7C");
    const uar = MOT.byggMyMemoryUrl("avkastning", "ar");
    if (uar.searchParams.get("langpair") !== "sv|ar") problem.push("ar-langpair=" + String(uar.searchParams.get("langpair")));
    // bitdelning: varje bit ≤ 500 byte och join("") === original (strukturen bevaras)
    const kort = "Bruttomarginalen steg till 12,5 %.";
    if (MOT.delaMyMemoryBitar(kort).length !== 1) problem.push("kort text delades i fler än 1 bit");
    let langText = "";
    for (let i = 0; i < 120; i++) langText += "ord" + String(i) + " med lite fyllnadstext ";
    const bitar = MOT.delaMyMemoryBitar(langText);
    if (bitar.length < 2) problem.push("lång text delades ej");
    for (const b of bitar) {
      if (new TextEncoder().encode(b).length > MOT.MYMEMORY_MAX_BYTES) problem.push("bit över " + String(MOT.MYMEMORY_MAX_BYTES) + " byte");
    }
    if (bitar.join("") !== langText) problem.push("join återställer ej originaltexten");
    const stycke = "Rad ett om kassa.\n\nRad två om risk.\n\nRad tre om moat.";
    if (MOT.delaMyMemoryBitar(stycke).join("") !== stycke) problem.push("styckesstruktur bevaras ej genom bitdelningen");
    // kvot-predikat: responseStatus/HTTP/varning i texten
    if (!MOT.myMemoryKvot("MYMEMORY WARNING: CAL LIMIT EXCEEDED", 200)) problem.push("varningssträng detekteras ej");
    if (!MOT.myMemoryKvot("200", 429)) problem.push("HTTP 429 detekteras ej");
    if (MOT.myMemoryKvot(200, 200)) problem.push("normal respons flaggas som kvot");
    if (!MOT.myMemoryKvot("ok", 200, "MYMEMORY WARNING: daily limit")) problem.push("varning i translatedText detekteras ej");
    // kvotvakter: 5000 ord/dag + 400 anrop
    if (!MOT.myMemoryFarKora(10, { ord: 0, anrop: 0 })) problem.push("normal körning nekas");
    if (MOT.myMemoryFarKora(10, { ord: 4995, anrop: 0 })) problem.push("ordgräns 5000 respekteras ej");
    if (MOT.myMemoryFarKora(1, { ord: 0, anrop: 400 })) problem.push("anropstak 400 respekteras ej");
    rad(
      "mos-oversattning",
      "MYMEMORY payload (URL-kodning %20/%7C) + bitdelning ≤500B + kvot-vakter",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "GET /get med q (åäö och ? korrekt %-kodade, inga råa mellanslag) + langpair sv|en/sv|ar; lång text delas i bitar ≤ 500 byte vars join är byte-identisk med originalet (radbrytningar bevarade); MYMEMORY WARNING/429/varning-i-text ⇒ kvot; vakter 5000 ord + 400 anrop per dag"
        : problem.slice(0, 6).join("; "),
      "bitar=" + String(bitar.length) + " langd=" + String(langText.length),
    );
  }

  // ── MÖS 13 (våg 54): KEDJEORDNING + SSRF-validering + DeepL-host-val ────────
  {
    const problem: string[] = [];
    const medAlla = MOT.externKedja({ deeplNyckel: "hemlig", googleNyckel: "hemlig" });
    if (JSON.stringify(medAlla) !== JSON.stringify(["deepl", "google", "mymemory"])) problem.push("med nycklar: " + JSON.stringify(medAlla));
    const medDeepl = MOT.externKedja({ deeplNyckel: "hemlig" });
    if (medDeepl[0] !== "deepl") problem.push("DeepL ej först i kedjan");
    const baraMm = MOT.externKedja({});
    if (JSON.stringify(baraMm) !== JSON.stringify(["mymemory"])) problem.push("utan nycklar: " + JSON.stringify(baraMm));
    if (MOT.externKedja({ externAvstangd: true }).length !== 0) problem.push("avstängd kedja ej tom");
    if (MOT.deeplHost("hemlig-nyckel:fx") !== "api-free.deepl.com") problem.push(":fx-suffix → free-host misslyckades");
    if (MOT.deeplHost("hemlig-nyckel") !== "api.deepl.com") problem.push("pro-nyckel → pro-host misslyckades");
    const v: readonly string[] = ["api.deepl.com", "api-free.deepl.com"];
    if (MOT.valideraExternUrl("http://api.deepl.com/v2/translate", v) !== null) problem.push("http tillåts (https-tvång brutet)");
    if (MOT.valideraExternUrl("https://evil.com/v2/translate", v) !== null) problem.push("ej vitlistad host tillåts");
    if (MOT.valideraExternUrl("https://api.deepl.com.evil.com/v2/translate", v) !== null) problem.push("suffix-host-tvärtillåts");
    if (MOT.valideraExternUrl("inte-en-url", v) !== null) problem.push("ogiltig url tillåts");
    const okUrl = MOT.valideraExternUrl("https://api-free.deepl.com/v2/translate", v);
    if (!okUrl || okUrl.hostname !== "api-free.deepl.com") problem.push("vitlistad https-url underkänns");
    if (MOT.valideraExternUrl("https://api.mymemory.translated.net/get", ["api.mymemory.translated.net"]) === null) problem.push("MyMemory-vitlistad url underkänns");
    rad(
      "mos-oversattning",
      "KEDJEORDNING (DeepL först om nyckel → Google → MyMemory) + SSRF-validering",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "med bägge nycklarna: [deepl, google, mymemory]; utan: [mymemory] (nyckelfri standard); avstängd: []; :fx-nyckel → api-free.deepl.com; valideraExternUrl kräver https + exakt vitlistad host (http/evil.com/suffix-host/ogiltig → null)"
        : problem.slice(0, 6).join("; "),
      "kedja=" + JSON.stringify(medAlla),
    );
  }

  // ── MÖS 14 (våg 54): STATUS-UNION vantar-kvot + PRE-termbanksdirekt (noll nät) ──
  {
    const problem: string[] = [];
    const lista: readonly string[] = MOT.OVERSATTNING_STATUS;
    if (lista.indexOf("vantar-kvot") < 0) problem.push("vantar-kvot saknas i OVERSATTNING_STATUS");
    if (lista.indexOf("vantar-motor") < 0) problem.push("vantar-motor försvunnit ur unionen");
    if (new Set(lista).size !== lista.length) problem.push("dubbla statusvärden i unionen");
    const sparadAv = process.env.OVERSATTNING_EXTERN_AVSTANGD;
    const spZ = process.env.ZAI_API_KEY;
    const spD = process.env.DEEPL_API_KEY;
    const spG = process.env.GOOGLE_TRANSLATE_KEY;
    delete process.env.ZAI_API_KEY;
    delete process.env.DEEPL_API_KEY;
    delete process.env.GOOGLE_TRANSLATE_KEY;
    process.env.OVERSATTNING_EXTERN_AVSTANGD = "1";
    try {
      const d1 = MOT.oversattKortTextViaTermbank("aktie portfölj", "en");
      if (d1 !== "stock portfolio") problem.push("direkt en: " + String(d1));
      const d2 = MOT.oversattKortTextViaTermbank("aktie portfölj", "ar");
      if (d2 !== "السهم المحفظة") problem.push("direkt ar: " + String(d2));
      if (MOT.oversattKortTextViaTermbank("Spara inställningar nu", "en") !== null) problem.push("främmande ord ger direktväg (skulle kräva motor)");
      if (MOT.oversattKortTextViaTermbank("eget kapital", "en") !== null) problem.push("flerordsterm ger direktväg (skulle kräva motor)");
      let nioOrd = "";
      for (let i = 0; i < 9; i++) nioOrd += "aktie ";
      if (MOT.oversattKortTextViaTermbank(nioOrd.trim(), "en") !== null) problem.push("9 ord ger direktväg (gränsen är 8)");
      // helrond: oversatt() med kedjan avstängd men kort banktext → termbank + kontroller
      const r = await MOT.oversatt("aktie portfölj", "en");
      if (r.motor !== "termbank") problem.push("motor=" + String(r.motor));
      if (r.status !== "publicerad" || r.poang !== 100) problem.push("status/poang=" + String(r.status) + "/" + String(r.poang));
      if (r.text !== "stock portfolio") problem.push("text=" + String(r.text));
    } finally {
      if (spZ !== undefined) process.env.ZAI_API_KEY = spZ;
      if (spD !== undefined) process.env.DEEPL_API_KEY = spD;
      if (spG !== undefined) process.env.GOOGLE_TRANSLATE_KEY = spG;
      if (sparadAv !== undefined) process.env.OVERSATTNING_EXTERN_AVSTANGD = sparadAv;
      else delete process.env.OVERSATTNING_EXTERN_AVSTANGD;
    }
    rad(
      "mos-oversattning",
      "STATUS-UNION vantar-kvot + PRE-termbanksdirekt (kort text, inget nät)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "unionen innehåller vantar-kvot (vantar-motor kvar); ≤ 8 ord där alla ord är banktermer översätts direkt (aktie portfölj → stock portfolio/السهم المحفظة); främmande ord/flerordsterm/9 ord → motor; oversatt() kör termbanksgrenen + KONTROLLER → 100 poäng publicerad trots avstängd kedja"
        : problem.slice(0, 6).join("; "),
      "status=" + String(MOT.OVERSATTNING_STATUS.length) + " direktMaxOrd=" + String(MOT.DIREKT_MAX_ORD),
    );
  }

  // ── MÖS 15 (våg 54): POST-skyddet → kontroller — poängen höjs deterministiskt ──
  {
    const problem: string[] = [];
    const kalla = "Räntabilitet på eget kapital blev 23,4 % och bruttomarginalen steg.";
    const motorSvar = "Return on equity became 23,4 % and the profit margin rose.";
    const utan = KTR.korKontroller(kalla, motorSvar, "en");
    if (utan.poang >= 90) problem.push("orättat motorsvar ⇒ " + String(utan.poang) + " (termmiss skulle hålla det under 90)");
    const post = MOT.tvingaTermbank(kalla, motorSvar, "en");
    if (post.rattade.length !== 2) problem.push("rattade=" + JSON.stringify(post.rattade.map((x: any) => x.via)));
    const med = KTR.korKontroller(kalla, post.text, "en");
    if (med.poang !== 100) {
      problem.push("rättat svar ⇒ " + String(med.poang) + " — misslyckade kontroller: " + JSON.stringify(med.resultat.filter((x: any) => !x.pass).map((x: any) => x.namn)));
    }
    if (post.text.indexOf("return on equity (ROE)") < 0 || post.text.indexOf("gross margin") < 0) {
      problem.push("rättad text saknar måltermerna: '" + post.text + "'");
    }
    rad(
      "mos-oversattning",
      "POST-SKYDD → KONTROLLER (termmiss 60p → rättat 100p, deterministiskt)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "simulerat motorsvar med två termfel: utan rättning poäng " + String(utan.poang) + " (termKonsistens failar); tvingaTermbank utökar 'return on equity' → 'return on equity (ROE)' (ofullständig målterm) + byter 'profit margin' → 'gross margin' (synonym-byte); kontrollerna ger därefter 100 — kedja motor→termbank→kontroller intakt"
        : problem.slice(0, 6).join("; "),
      "utan=" + String(utan.poang) + " med=" + String(med.poang),
    );
  }

  // ── MÖS 16 (våg 55 L1): SYSTEM_EVENTS-KROPPEN — meddelandeformat + mös/1 ────
  // Lagret sparar översättningar som system_events-rader när tabellen
  // oversattningar saknas (kundens SQL kördes ej). REN formatfunktion — nätet
  // verifieras LIVE mot Supabase (worklog våg 55 L1), sviten kör aldrig nät.
  {
    const problem: string[] = [];
    const medd = LGR.mosMeddelande("publicerad", "the-intelligent-investor:kap5:block3", "en");
    if (medd !== "[mös] publicerad the-intelligent-investor:kap5:block3 en") {
      problem.push("meddelandeformat avviker: '" + medd + "'");
    }
    if (medd.indexOf("[mös] ") !== 0) problem.push("sökbart prefix '[mös] ' saknas i början");
    const medd2 = LGR.mosMeddelande("vantar-motor", "nav.lar", "ar");
    if (medd2 !== "[mös] vantar-motor nav.lar ar") problem.push("ui-nyckel-format: '" + medd2 + "'");
    const kropp = LGR.mosEventKropp({
      scope_typ: "kursblock",
      scope_nyckel: "zero-to-one:kap3:block2",
      sprak: "ar",
      kallhash: "abc123def456",
      text: "الخندق التنافسي",
      status: "publicerad",
      kvalitet: 100,
      kontrollrapport: { tom: true },
    });
    if (kropp.type !== "oversattning") problem.push("type=" + String(kropp.type) + " (förväntat oversattning)");
    if (kropp.severity !== "info") problem.push("severity=" + String(kropp.severity));
    if (kropp.source !== "mos") problem.push("source=" + String(kropp.source));
    if (kropp.message !== LGR.mosMeddelande("publicerad", "zero-to-one:kap3:block2", "ar")) {
      problem.push("message följer ej mosMeddelande");
    }
    const d = kropp.details;
    if (d.schema !== "mös/1") problem.push("schema=" + String(d.schema) + " (förväntat mös/1)");
    if (d.scope_typ !== "kursblock" || d.sprak !== "ar") problem.push("scope_typ/sprak fel i details");
    if (d.kallhash !== "abc123def456" || d.status !== "publicerad" || d.kvalitet !== 100) {
      problem.push("kallhash/status/kvalitet fel i details");
    }
    if (d.text !== "الخندق التنافسي") problem.push("texten följer inte med i details");
    if (!d.kontrollrapport || d.kontrollrapport.tom !== true) problem.push("kontrollrapport följer inte med");
    // determinism 2×
    if (JSON.stringify(LGR.mosEventKropp({ scope_typ: "ui", scope_nyckel: "nav.lar", sprak: "en", kallhash: "h1h1h1h1h1h1", text: "Learn", status: "publicerad", kvalitet: 100, kontrollrapport: null }))
        !== JSON.stringify(LGR.mosEventKropp({ scope_typ: "ui", scope_nyckel: "nav.lar", sprak: "en", kallhash: "h1h1h1h1h1h1", text: "Learn", status: "publicerad", kvalitet: 100, kontrollrapport: null }))) {
      problem.push("mosEventKropp ej deterministisk");
    }
    rad(
      "mos-oversattning",
      "SYSTEM_EVENTS-KROPP meddelandeformat + details (schema mös/1)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "message = '[mös] <status> <scope_nyckel> <sprak>' (sökbart prefix, kurs- och ui-nycklar); kropp: type=oversattning, severity=info, source=mos, details bära schema mös/1 + scope/kallhash/text/status/kvalitet/kontrollrapport; deterministisk 2×"
        : problem.slice(0, 6).join("; "),
      "message='" + String(medd) + "'",
    );
  }

  // ── MÖS 17 (våg 55 L1): SENASTE-VINNER-DEDUPE + statuskarta ur event-rader ──
  {
    const problem: string[] = [];
    const rader = [
      { created_at: "2026-09-04T10:00:00Z", scope_typ: "kursblock", scope_nyckel: "k:kap1:block1", sprak: "en", kallhash: "h2nyare", status: "publicerad", text: "ny text" },
      { created_at: "2026-09-03T10:00:00Z", scope_typ: "kursblock", scope_nyckel: "k:kap1:block1", sprak: "en", kallhash: "h1gamla", status: "utkast", text: "gammal text" },
      { created_at: "2026-09-03T10:00:00Z", scope_typ: "kursblock", scope_nyckel: "k:kap1:block1", sprak: "ar", kallhash: "h1gamla", status: "publicerad", text: "ar-text" },
      { created_at: "2026-09-03T10:00:00Z", scope_typ: "ui", scope_nyckel: "nav.lar", sprak: "en", kallhash: "h3", status: "vantar-motor", text: "" },
      { created_at: "2026-09-02T10:00:00Z", scope_typ: "ui", scope_nyckel: "nav.lar", sprak: "en", kallhash: "h0", status: "inaktuell", text: "" },
    ];
    const dedupe = LGR.dedupeSenasteVinner(rader);
    if (dedupe.length !== 3) problem.push("dedupe-antal=" + String(dedupe.length) + " (förväntat 3: en-nyckeln slås samman, ar + ui är egna nycklar)");
    const vinnare = dedupe.find((r: any) => r.sprak === "en" && r.scope_nyckel === "k:kap1:block1");
    if (!vinnare || vinnare.status !== "publicerad" || vinnare.kallhash !== "h2nyare") {
      problem.push("senaste raden vinner ej för (k:kap1:block1, en): " + JSON.stringify(vinnare));
    }
    const uiVinnare = dedupe.find((r: any) => r.scope_nyckel === "nav.lar");
    if (!uiVinnare || uiVinnare.status !== "vantar-motor") problem.push("senaste ui-rad vinner ej");
    const karta = LGR.mosStatusKartaUrEventRader(rader);
    if (karta.size !== 3) problem.push("karta.size=" + String(karta.size) + " (förväntat 3)");
    const p = karta.get("kursblock:k:kap1:block1:en");
    if (!p || p.kallhash !== "h2nyare" || p.status !== "publicerad") problem.push("kartpost kursblock/en: " + JSON.stringify(p));
    const q = karta.get("ui:nav.lar:en");
    if (!q || q.status !== "vantar-motor" || q.kallhash !== "h3") problem.push("kartpost ui: " + JSON.stringify(q));
    if (LGR.mosStatusKartaUrEventRader([]).size !== 0) problem.push("tom indata ⇒ ej tom karta");
    rad(
      "mos-oversattning",
      "EVENT-DEDUPE senaste-vinner + statuskarta (ren funktion)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "5 rader (2 dubletter) nyast-först ⇒ 3 vinnare: (nyckel,en) håller publicerad/h2nyare, äldre utkast-rad slängs; (nyckel,ar) och (nav.lar,en) är egna nycklar med senaste status; kartan 'typ:nyckel:sprak' → {kallhash,status} samma form som tabell-läsningen; tom indata ⇒ tom karta"
        : problem.slice(0, 6).join("; "),
      "dedupe=" + String(dedupe.length) + " karta=" + String(karta.size),
    );
  }

  // ── MÖS 18 (våg 55 L1): SPEGELKARTAN — inaktuell källa servar ALDRIG gammal text ──
  {
    const problem: string[] = [];
    const rader = [
      { created_at: "2026-09-04T10:00:00Z", scope_nyckel: "k:kap1:block1", sprak: "en", status: "publicerad", text: "servas" },
      { created_at: "2026-09-04T09:00:00Z", scope_nyckel: "k:kap1:block1", sprak: "ar", status: "publicerad", text: "يُقدَّم" },
      { created_at: "2026-09-04T10:00:00Z", scope_nyckel: "k:kap2:block1", sprak: "en", status: "inaktuell", text: "gammal" },
      { created_at: "2026-09-01T10:00:00Z", scope_nyckel: "k:kap2:block1", sprak: "en", status: "publicerad", text: "FARLIG gammal publicerad" },
      { created_at: "2026-09-04T10:00:00Z", scope_nyckel: "annan-kurs:block1", sprak: "en", status: "publicerad", text: "fel kurs" },
      { created_at: "2026-09-04T10:00:00Z", scope_nyckel: "k:kap3:block1", sprak: "en", status: "publicerad", text: "   " },
    ];
    const karta = LGR.mosSpegelKartaUrRader(rader, "k");
    if (karta.size !== 1) problem.push("karta.size=" + String(karta.size) + " (förväntat 1: endast k:kap1:block1)");
    const block1 = karta.get("k:kap1:block1");
    if (!block1 || block1.get("en") !== "servas" || block1.get("ar") !== "يُقدَّم") {
      problem.push("kap1:block1 saknar en/ar-texter: " + JSON.stringify(block1 && Array.from(block1.entries())));
    }
    if (karta.has("k:kap2:block1")) problem.push("inaktuell senaste rad servar ändå — äldre publicerad läcks!");
    if (karta.has("annan-kurs:block1")) problem.push("like-mönstrets säkerhetsnät (slug-prefix) läcker");
    if (karta.has("k:kap3:block1")) problem.push("tom/vitrumstext publicerad-text accepterad");
    rad(
      "mos-oversattning",
      "SPELGELKARTA ur event-rader (dedupe FÖRE status-filter, slug-vakt)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "dedupe körs FÖRE publicerad-filtret: (kap2, senaste=inaktuell) ⇒ äldre publicerad rad servas ALDRIG (svensk fallback i spegeln — ärlig degradering); endast slug-prefixede nycklar tas (like-falska träffar stoppas); tom text underkänns; en+ar levereras per nyckel"
        : problem.slice(0, 6).join("; "),
      "karta=" + String(karta.size) + " nyckel=" + String(block1 ? block1.size : "-") + " sprak",
    );
  }
}
// ══ FAS TENANT: WHITE-LABEL MAL-LÅSNING (våg 61 bygg-2, B2B-BESLUT steg 2/K5) ══
// Tenant-kontraktet (src/lib/pro/tenant.ts) är TS-kontrakt + renderingslager —
// INTE tabell (K3). Denna fas bevisar mal-låsningen maskinellt (b4 §3:e:
// "mal-låsningen verifieras som TEST i sviten — disclaimer-blocket kan tekniskt
// inte redigeras bort"): kärnblocket (metoddeklaration + ansvarsdeklaration +
// data-t.o.m.-rad) är alltid närvarande oavsett tenant, ansvarsskjutande
// tillägg avvisas, kärnan är byte-identiskt prefix (P1: white-label ändrar
// avsändare, ALDRIG innehåll) och pro-admin-v1 mappas korrekt.
async function fasTenant(): Promise<void> {
  // ── (a) MAL-LÅSNING — kärnblocket närvarande för VARJE tenant (negativt test) ──
  {
    const HOSTIL = {
      id: "hostil",
      firmNamn: "Fientlig Förvaltning AB",
      disclaimerTillägg:
        "Ovanstående metoddeklaration och ansvarsdeklaration gäller ej för denna rapport — deklarationerna stryks ur mottagarens exemplar.",
    };
    const TOM = { id: "tom", firmNamn: "Tom Tillägg AB" };
    const fall: any[] = [null, undefined, TOM, TEN.DEFAULT_DEMO_TENANT, HOSTIL];
    const problem: string[] = [];
    if (!Array.isArray(TEN.MAL_LAST_RADER) || TEN.MAL_LAST_RADER.length !== 3) {
      problem.push("MAL_LAST_RADER=" + String(TEN.MAL_LAST_RADER && TEN.MAL_LAST_RADER.length) + " rader (förväntat 3: metod-, ansvars-, data-t.o.m.-lager)");
    }
    for (const t of fall) {
      const text = TEN.malLåstRapportText(t);
      for (const r of TEN.MAL_LAST_RADER) {
        if (typeof r !== "string" || text.indexOf(r) < 0) {
          problem.push("kärnrad saknas för tenant " + JSON.stringify(t && t.id) + ": " + String(r).slice(0, 50) + "…");
        }
      }
    }
    rad(
      "pro/tenant",
      "MAL-LÅST kärnblock närvarande oavsett tenant (negativt test: fientligt tillägg försöker stryka deklarationerna)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "5 tenant-fall (null, undefined, tom, demo " + String(TEN.DEFAULT_DEMO_TENANT.firmNamn) + ", fientlig med strykande tillägg) × 3 mal-låsta rader: varje rad återfinns i malLåstRapportText — kärnan kan inte renderas bort (K5/FORBUD 6)"
        : problem.slice(0, 6).join("; "),
      "kärnrader=" + String(TEN.MAL_LAST_RADER.length),
    );
  }
  // ── (b) P1: kärnan byte-identiskt prefix + determinism + demo-markering ──
  {
    const karna = TEN.MAL_LAST_RADER.join("\n");
    const problem: string[] = [];
    const lagom = { id: "lagom", firmNamn: "Lagom Kapital AB", disclaimerTillägg: "Egna villkor: Lagom Kapital AB:s användarvillkor gäller mellanhavandena kring rapporten." };
    for (const t of [null, TEN.DEFAULT_DEMO_TENANT, lagom]) {
      const text = TEN.malLåstRapportText(t);
      if (typeof text !== "string" || text.indexOf(karna) !== 0) {
        problem.push("kärnan ej byte-identiskt prefix för tenant " + JSON.stringify(t && t.id) + " (P1: white-label ändrar avsändare, aldrig innehåll)");
      }
    }
    const a = JSON.stringify(TEN.byggDisclaimerRader(TEN.DEFAULT_DEMO_TENANT));
    const b = JSON.stringify(TEN.byggDisclaimerRader(TEN.DEFAULT_DEMO_TENANT));
    if (a !== b) problem.push("byggDisclaimerRader ej deterministisk (2 körningar skiljer)");
    if (TEN.DEFAULT_DEMO_TENANT.firmNamn !== "Nordisk Kapitalråd AB") {
      problem.push("demo-firma=" + String(TEN.DEFAULT_DEMO_TENANT.firmNamn) + " (förväntat Nordisk Kapitalråd AB, K-B2B:4)");
    }
    if (TEN.malLåstRapportText(TEN.DEFAULT_DEMO_TENANT).toLowerCase().indexOf("påhittad") < 0) {
      problem.push("demo-tillägget markerar ej demo-firman som påhittad (K-B2B:4 — tydlig markering krävs)");
    }
    rad(
      "pro/tenant",
      "P1 kärnan byte-identiskt prefix för alla tenants + determinism + demo-firma markeras påhittad",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "MAL_LAST_RADER är ett exakt prefix i malLåstRapportText för null/demo/tenant-med-tillägg; byggDisclaimerRader 2× JSON-identisk; DEFAULT_DEMO_TENANT = Nordisk Kapitalråd AB med påhittad-markering i tillägget"
        : problem.slice(0, 6).join("; "),
      "prefixlängd=" + String(karna.length),
    );
  }
  // ── (c) ANSVARSVAKTEN (b4 lager 2): ansvarsskjutande/mjukande tillägg avvisas ──
  {
    const DALIGA = [
      "AK1A garanterar denna rapports innehåll och utfall.",
      "Analysen är garanterad av AK1A Research Lab.",
      "Rådgivaren friskriver sig från allt ansvar för denna rapport.",
      "Ansvarsdeklarationen ovan gäller inte våra mottagare.",
      "Metoddeklarationen stryks i denna version av rapporten.",
    ];
    const BRA = "Egna villkor: Exempel Kapitalförvaltning AB:s användarvillkor gäller mellanhavandena kring rapporten.";
    const vaktTenant = { id: "vakt", firmNamn: "Vakten AB" };
    const problem: string[] = [];
    for (const d of DALIGA) {
      const rader = TEN.byggDisclaimerRader({ ...vaktTenant, disclaimerTillägg: d });
      if (!Array.isArray(rader) || rader.length !== TEN.MAL_LAST_RADER.length) {
        problem.push("avvisas ej: '" + d.slice(0, 45) + "…'");
      } else if (rader.join("\n").indexOf(d) >= 0) {
        problem.push("läcker igenom: '" + d.slice(0, 45) + "…'");
      }
    }
    const braRader = TEN.byggDisclaimerRader({ ...vaktTenant, disclaimerTillägg: BRA });
    if (
      !Array.isArray(braRader) ||
      braRader.length !== TEN.MAL_LAST_RADER.length + 1 ||
      braRader[braRader.length - 1] !== BRA
    ) {
      problem.push("godkänt tillägg inkluderas ej som rad EFTER kärnan");
    }
    rad(
      "pro/tenant",
      "ANSVARSVAKT: 5 ansvarsskjutande/mjukande tillägg avvisas — godkänt tillägg hamnar EFTER kärnan",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "'AK1A garanterar/svarar', 'garanterad av AK1A', 'friskriver sig', 'gäller inte', 'stryks' ⇒ tillägget sorteras bort (tenant LÄGGER TILL, aldrig subtraherar — K5); legitim egen juridik läggs som sista rad"
        : problem.slice(0, 6).join("; "),
      "avvisade=" + String(DALIGA.length) + " godkända=1",
    );
  }
  // ── (d) PRO-ADMIN-V1-MAPPNING: localStorage-kontraktet → TenantConfig ──
  {
    lsRensa();
    const problem: string[] = [];
    lsSatt("pro-admin-v1", "{ogiltig json");
    if (TEN.lasTenantFranLocalStorage() !== null) problem.push("ogiltig JSON ska ge null");
    lsSatt("pro-admin-v1", JSON.stringify({ mallar: {}, whiteLabel: { foretagsnamn: "   ", logotypUrl: "https://x.se/l.svg" } }));
    if (TEN.lasTenantFranLocalStorage() !== null) problem.push("tomt foretagsnamn ska ge null (avsändaren förblir AK1A)");
    lsSatt("pro-admin-v1", JSON.stringify({
      mallar: { portfoljoversikt: true },
      whiteLabel: {
        foretagsnamn: "Kapital & Vågor AB",
        logotypUrl: "https://exempel.se/logo.svg",
        fargtemaPrefix: "kobolt",
        disclaimerTillagg: "Egna villkor: Kapital & Vågor AB:s användarvillkor gäller.",
      },
    }));
    const t = TEN.lasTenantFranLocalStorage();
    if (!t) {
      problem.push("tenant saknas trots komplett whiteLabel-konfiguration");
    } else {
      if (t.id !== TEN.LOKAL_TENANT_ID) problem.push("id=" + String(t.id));
      if (t.firmNamn !== "Kapital & Vågor AB") problem.push("firmNamn=" + String(t.firmNamn));
      if (t.logotypUrl !== "https://exempel.se/logo.svg") problem.push("logotypUrl=" + String(t.logotypUrl));
      if (!t.brandFarger || t.brandFarger.temaPrefix !== "kobolt") problem.push("brandFarger=" + JSON.stringify(t.brandFarger));
      if (typeof t.disclaimerTillägg !== "string" || t.disclaimerTillägg.length === 0) problem.push("disclaimerTillägg mappas ej");
    }
    lsSatt("pro-admin-v1", JSON.stringify({ whiteLabel: { foretagsnamn: "X AB", logotypUrl: "javascript:alert(1)" } }));
    const t2 = TEN.lasTenantFranLocalStorage();
    if (t2 && t2.logotypUrl !== undefined) problem.push("javascript:-URL avvisas ej (endast https:/// rotrelativt tillåts)");
    lsRensa();
    rad(
      "pro/tenant",
      "PRO-ADMIN-V1-MAPPNING: whiteLabel → TenantConfig (fel-tolerant, URL-vaktad)",
      problem.length === 0 ? "PASS" : "FAIL",
      problem.length === 0
        ? "foretagsnamn→firmNamn, logotypUrl→logotypUrl (https:///rotrelativ; javascript: avvisas), fargtemaPrefix→brandFarger.temaPrefix, disclaimerTillagg→disclaimerTillägg; ogiltig JSON/tom firma ⇒ null"
        : problem.slice(0, 6).join("; "),
      "id=" + String(t && t.id),
    );
  }
}

// Hjälpfunktioner till vagkon-fixturerna (historik + SR-rensning)
function H2(): number[] { return [100, 110, 105, 120, 115, 130]; }
function lsRennaSR(): void { LS_DATA.delete("ak1a-sr-v1"); LS_DATA.delete("ak1a-sr-xp-v1"); }

// ── Kör alla faser med intern tidsgräns (88 s; yttre budget 90 s hanteras av .mjs) ──
const MARK_START = "===MOTORKOLL_JSON_START===";
const MARK_END = "===MOTORKOLL_JSON_END===";
const FASER: Array<[string, () => void | Promise<void>]> = [
  ["A: STRUKTUR+MATEMATIK", fasA],
  ["B: DETERMINISM", fasB],
  ["C: GRÄNSER", fasC],
  ["D: FIXTURTEST (rena kärnor)", fasD],
  ["MÖS: ÖVERSÄTTNING (termbank/källor/kontroller/motor)", fasOversattning],
  ["TENANT: WHITE-LABEL MAL-LÅSNING (pro/tenant, K5)", fasTenant],
];

function skriv(timeout: boolean): void {
  if (timeout) {
    rad("system", "intern tidsgräns", "FAIL", "avbröts efter 88 s — kontrollerna ofullständiga (SKIP är förbjudet: ofullständig verifiering är ett FEL)", "-");
  }
  process.stdout.write(MARK_START + "\n");
  process.stdout.write(JSON.stringify({ startad: START_ISO, klar: new Date().toISOString(), total_ms: Date.now() - T0, radrader: RADER }));
  process.stdout.write("\n" + MARK_END + "\n");
}

let fardig = false;
(async () => {
  // Importera FÖRST när shimen är satt — klientmodulerna ser window/localStorage.
  VFM = await import("./src/lib/vagfundament-motor");
  ANA = await import("./src/lib/analys-motor");
  NET = await import("./src/lib/netnet-motor");
  KON = await import("./src/lib/konfluens-motor");
  PVA = await import("./src/lib/portfolj-vagor");
  NLU = await import("./src/lib/chatbot-nlu");
  OMT = await import("./src/lib/omtanke-motor");
  KUR = await import("./src/lib/kurstips");
  DAS = await import("./src/lib/dashfraga");
  VKN = await import("./src/lib/vagkon");
  SRP = await import("./src/lib/spaced-repetition");
  VPL = await import("./src/lib/veckoplan");
  BRE = await import("./src/lib/briefing");
  BDG = await import("./src/lib/badges");
  ABK = await import("./src/lib/analysbank");
  AST = await import("./src/lib/assistent");
  KAR = await import("./src/lib/akm2/karna");
  RSK = await import("./src/lib/portfolj-forskning/riskportfolj");
  AK2 = await import("./src/lib/portfolj-forskning/akm2-koppling");
  OSK = await import("./src/lib/akm3/osakerhet");
  PER = await import("./src/lib/portfolj-forskning/peer");
  FVG = await import("./src/lib/portfolj-forskning/fundamental-vagmotor");
  UPP = await import("./src/lib/portfolj-forskning/uppfoljning");
  VVAL = await import("./src/lib/vagvalidering");
  ENS = await import("./src/lib/akm3/ensemble");
  REG = await import("./src/lib/akm3/regim");
  OVS = await import("./src/lib/oversattning/termbank");
  KLL = await import("./src/lib/oversattning/kalla");
  KTR = await import("./src/lib/oversattning/kontroller");
  MOT = await import("./src/lib/oversattning/motor");
  LGR = await import("./src/lib/oversattning/lager");
  ORD = await import("./src/lib/ordlista");
  FLS = await import("./src/lib/forskningslaget");
  TEN = await import("./src/lib/pro/tenant");
  körVagfundament = VFM.körVagfundament;
  hamtaBalansPoster = VFM.hamtaBalansPoster;
  körAnalysMotor = ANA.körAnalysMotor;
  HZ = ANA.HORIZONTER;
  TEORIER = ANA.TEORIER;
  skannaNetnet = NET.skannaNetnet;
  GRAHAM_TROSKEL = NET.GRAHAM_TROSKEL;
  MAX_TICKER_PER_ANROP = NET.MAX_TICKER_PER_ANROP;
  skannaKonfluens = KON.skannaKonfluens;
  sjalvkontroll = KON.sjalvkontroll;
  valideraKonfluens = KON.valideraKonfluens;
  MAX_TICKER_KONFLUENS = KON.MAX_TICKER_KONFLUENS;
  for (const [namn, f] of FASER) {
    if (Date.now() - T0 > 86000) { rad("system", "fas " + namn, "FAIL", "tiden rann ut innan fasen startades — kontroller saknas (SKIP är förbjudet)", "-"); continue; }
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
        ? "tidsgräns 90 s överskreds — processen dödades, inga kontroller kunde köras (SKIP är förbjudet)"
        : "ingen JSON-utdata att tolka (exitkod=" + String(meta.kod) + ")",
      varden: meta.stderr.slice(0, 200),
    });
  }
  const antal = (s) => rader.filter((r) => r.status === s).length;
  const motorer = [...new Set(rader.map((r) => r.motor))];

  const linjer = [];
  linjer.push("---\n");
  linjer.push("# Motorervalidering — 100%-väktaren — " + ts + "\n");
  linjer.push("- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)");
  linjer.push("- **Miljö:** node " + process.version + " på " + process.platform + "; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)");
  linjer.push("- **Körtid:** " + meta.totalS.toFixed(1) + " s (budget 90 s" + (meta.timeout ? " — **ÖVERSKRIDEN, process dödad**" : ", inom budget") + ")");
  const intern = payload && typeof payload.total_ms === "number" ? payload.total_ms : null;
  if (intern !== null) linjer.push("- **Internt (tsx):** " + (intern / 1000).toFixed(1) + " s; startad " + String(payload.startad) + ", klar " + String(payload.klar));
  linjer.push("- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.");
  linjer.push("");
  linjer.push("**RESULTAT: " + antal("PASS") + " PASS / " + antal("FAIL") + " FAIL / " + antal("SKIP") + " SKIP**\n");
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
  linjer.push("## Täckningsgrad (våg 49 + våg 52 + våg 59 + våg 60)\n");
  linjer.push("Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj (ägen poängbas AKM1|AKM2, våg 57 D2), (våg 57 D2) akm2-koppling (berikaRadMedAkm2 — korstabellens AKM2-berikning), fundamental-vagmotor, uppföljning, (våg 56 M3) forskningslaget samt (våg 56 bygg-A) vagvalidering (dom-protokoll, enighetsscore, rullande träff-%, rapportbyggare) — och (våg 52) MÖS-översättningssystemet: termbank, källregister, 4 kvalitetskontroller och motorstatusflödet. (VÅG 59, AKM3 steg 3+4) akm3/osakerhet (intervallformel [K, min(100,K+100(1−t))] med porttak 45, fullviktsrad, determinism, osatt-gränser; VÅG 66 r6 tillägg: kalkylatorreglagets geometri-svep låtsas-t 0→100 % — golvet K orubbligt, övre monotont icke-ökande, t=100 % ⇒ [K;K] — samt låtsas-t-klämning utanför [0,1] och ärlighetsnot-kontrakt) och portfolj-forskning/peer (midrank-percentil med delade värden, rank utan namnbrytning, median jämnt/udda, osatt vid grupp<5/saknad akm2/osatt variabel, per-variabel hållning ±0,5, lässlager-garanti: kompositen oförändrad). (VÅG 60 bygg-A, AKM3 steg 5) akm3/regim (deskriptiv regimebeskrivning: forskningslagets kanoniska trösklar 0,10/0,08/0,35/0,30, genesis magert mot 2026-09-03-data, N-vakt 12<30 ⇒ osatt-degradering, hysteres G 0,07↔0,08 byter aldrig, 2-snapshots-bekräftelse + Σu-gate 3 vid >25 %, kandidatreset, frysningskontrakt per snapshot-datering, determinism + hash-kedjad append-only regime-logg med tamper-vakter). (VÅG 61 bygg-2, B2B steg 2/K5) pro/tenant — white-label-kontraktets mal-låsta disclaimer-kärna: tre lager (metoddeklaration, ansvarsdeklaration 2007:528, data-t.o.m.-rad+falsifierbarhet) alltid närvarande oavsett tenant (negativt test: fientligt tillägg som försöker stryka dem), kärnan byte-identiskt prefix (P1), ansvarsskjutande tillägg avvisas (b4 lager 2), pro-admin-v1 → TenantConfig-mappning med URL-vakt. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.");
  linjer.push("");
  linjer.push("### Kravlista på main\n");
  linjer.push("- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.");
  linjer.push("");
  if (meta.stderr.trim().length > 0) {
    linjer.push("## stderr från tsx-körningen (trunkerad)\n");
    linjer.push("```");
    linjer.push(meta.stderr.trim().slice(0, 1500));
    linjer.push("```\n");
  }
  linjer.push("_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._");
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
    const rader = payload && Array.isArray(payload.radrader)
      ? payload.radrader
      : [{
          motor: "system",
          kontroll: "körning av tmp_motor_koll.ts via npx tsx",
          status: "FAIL",
          detalj: (r.timeout ? "tidsgräns 90 s överskreds — processen dödades" : "ingen tolkbar JSON-utdata (exitkod=" + String(r.kod) + ")") + " — SKIP är förbjudet, okänd verifiering är ett FEL",
          varden: String(r.felutdata || "").slice(0, 200),
        }];
    const p = rader.filter((x) => x.status === "PASS").length;
    const f = rader.filter((x) => x.status === "FAIL").length;
    const s = rader.filter((x) => x.status === "SKIP").length;
    const timeoutStr = r.timeout ? ", TIMEOUT" : "";
    console.log("");
    console.log("RESULTAT: " + p + " PASS / " + f + " FAIL / " + s + " SKIP (" + totalS.toFixed(1) + " s" + timeoutStr + ")");
    for (const rad of rader.filter((x) => x.status === "FAIL")) {
      console.log("  FAIL [" + rad.motor + "] " + rad.kontroll + " — " + String(rad.detalj).slice(0, 220));
    }
    for (const rad of rader.filter((x) => x.status === "SKIP")) {
      console.log("  SKIP [" + rad.motor + "] " + rad.kontroll + " — SKIP ÄR FÖRBJUDNA (våg 49): räknas som FAIL");
    }
    console.log("Rapport: " + RAPPORT_SOK);
    if (!payload) return 1; // ingen tolkbar utdata = FAIL
    return f > 0 || s > 0 ? 1 : 0;
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
