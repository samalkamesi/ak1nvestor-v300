#!/usr/bin/env node
/**
 * o118 steg 3 — normaliserad trace-attribution ur rå-tracerna i
 * verktyg/_o118-trace-tmp/ (sondens råmaterial).
 *
 * Filter mot sond-artefakter: tasks vars barn domineras av
 * _lighthouse-eval.js / LocalWindowProxy::Initialize / ScriptCatchup är
 * Lighthouse-gathererns EGET arbete — de räknas aldrig i TBT (rapportens
 * long-tasks-audit är sanningen för TBT; tracen ger DJUPET).
 *
 * Tidsaxel: normaliseras mot navigationStart (dokumentets riktiga noll),
 * inte trace-start — då kan tasks matchas mot rapportens FCP/TBT-fönster.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TMP = join(process.cwd(), "verktyg", "_o118-trace-tmp");
const KAT = join(process.cwd(), "data", "forskning", "OPTIMERING", "lighthouse");
const PASS = [
  ["en_blogg", 1],
  ["en_blogg", 2],
  ["ar_blogg", 1],
];

const ARTEFAKT = /_lighthouse|LocalWindowProxy|ScriptCatchup|V8.DeserializeContext|ContextCreatedNotification/;

const resultat = {};
for (const [sida, n] of PASS) {
  const kat = join(TMP, `${sida}-${n}`);
  const traceFil = readdirSync(kat).find((f) => f.endsWith(".trace.json"));
  const rapport = JSON.parse(readFileSync(join(kat, "rapport.json"), "utf8"));
  const events = JSON.parse(readFileSync(join(kat, traceFil), "utf8")).traceEvents;

  const tbt = Math.round(rapport.audits["total-blocking-time"].numericValue);
  const fcp = Math.round(rapport.audits["first-contentful-paint"].numericValue);
  const rapportTasks = (rapport.audits["long-tasks"]?.details?.items ?? []).map((t) => ({
    start: Math.round(t.startTime),
    dur: Math.round(t.duration),
    url: (t.url ?? "Unattributable").split("/").pop(),
  }));

  // main thread
  const perTrad = new Map();
  for (const e of events) {
    if (e.name === "RunTask" && e.ph === "X") {
      const k = `${e.pid}:${e.tid}`;
      perTrad.set(k, (perTrad.get(k) ?? 0) + (e.dur ?? 0));
    }
  }
  const [pid, tid] = [...perTrad.entries()].sort((a, b) => b[1] - a[1])[0][0].split(":").map(Number);
  const main = events.filter((e) => e.pid === pid && e.tid === tid && e.ph === "X");

  // navigationStart = nollpunkt (dokumentets)
  const nav = main.find((e) => e.name === "navigationStart") ?? events.find((e) => e.name === "navigationStart");
  const noll = nav?.ts ?? main[0]?.ts ?? 0;

  const tasks = main.filter((e) => e.name === "RunTask" && (e.dur ?? 0) > 60_000).sort((a, b) => a.ts - b.ts);
  const barnAlla = main.filter((e) => e.name !== "RunTask" && (e.dur ?? 0) > 2_000);

  const analyserade = [];
  for (const t of tasks) {
    const start = Math.round((t.ts - noll) / 1000);
    const slutTs = t.ts + t.dur;
    const barn = barnAlla
      .filter((b) => b.ts >= t.ts && b.ts < slutTs)
      .sort((a, b) => (b.dur ?? 0) - (a.dur ?? 0));
    // artefakt-test: domineras tasken av sondens eget arbete?
    const summa = barn.reduce((s, b) => s + (b.dur ?? 0), 0) || 1;
    const artefaktDur = barn
      .filter((b) => ARTEFAKT.test(b.name) || String(b.args?.data?.url ?? "").includes("_lighthouse"))
      .reduce((s, b) => s + (b.dur ?? 0), 0);
    const ärArtefakt = artefaktDur / summa > 0.5;
    if (ärArtefakt) continue;
    analyserade.push({
      start,
      durMs: Math.round(t.dur / 1000),
      iFonstret: start >= fcp,
      toppBarn: barn.slice(0, 8).map((b) => {
        const d = b.args?.data ?? {};
        let url = d.url ?? d.styleSheetUrl ?? "";
        if (!url && d.stackTrace?.[0]?.url) url = d.stackTrace[0].url;
        return {
          namn: b.name,
          dur: Math.round((b.dur ?? 0) / 1000),
          url: String(url).replace(/^https?:\/\/[^/]+/, "").slice(0, 80),
          fn: d.functionName ?? d.stackTrace?.[0]?.functionName ?? "",
          rad: (d.lineNumber ?? d.stackTrace?.[0]?.lineNumber) + 1 || null,
        };
      }),
    });
  }

  resultat[`${sida}-${n}`] = { tbt, fcp, rapportTasks, tasks: analyserade };
  console.log(`\n═══ ${sida}-${n} · TBT ${tbt} · FCP ${fcp} ═══`);
  console.log("rapportens TBT-longtasks:", rapportTasks.map((t) => `@${t.start}/${t.dur}ms(${t.url})`).join(" "));
  console.log("trace-tasks >60ms (sondartefakter rensade):");
  for (const t of analyserade) {
    const mark = t.iFonstret ? "▸TBT" : "  ";
    console.log(` ${mark} @${String(t.start).padStart(5)} ${String(t.durMs).padStart(5)}ms`);
    for (const b of t.toppBarn.slice(0, 5)) {
      if (b.dur < 8) continue;
      console.log(`        ${b.namn.padEnd(42)} ${String(b.dur).padStart(5)}ms ${b.url} ${b.fn ? `ƒ${b.fn}` : ""}${b.rad ? `:${b.rad}` : ""}`);
    }
  }
}

writeFileSync(join(KAT, "o118-trace-attribution.json"), JSON.stringify(resultat, null, 1));
console.log("\nSkriven: o118-trace-attribution.json");
