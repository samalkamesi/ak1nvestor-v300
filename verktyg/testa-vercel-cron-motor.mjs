#!/usr/bin/env node
/**
 * SVIT för verktyg/vercel-cron-motor.mjs (G9-steg 1, r299) — kontraktet:
 * steg-1-säkerhet (inaktiva rutter röras ALDRIG), catch-up-fönster,
 * claim-först-dedup, månadsfönster, self-heal, sekret-hygien.
 * Körning: node verktyg/testa-vercel-cron-motor.mjs
 */
import { korVercelCronMotor } from "./vercel-cron-motor.mjs";

let pass = 0;
const fel = [];

function kontroll(namn, villkor, detalj = "") {
  if (villkor) { pass++; console.log(`PASS ${namn}`); }
  else { fel.push(namn); console.log(`FAIL ${namn} ${detalj}`); }
}

function fixture({
  rutter = [],
  state = {},
  nu = new Date("2026-09-28T12:00:00Z"),
  secret = null,
} = {}) {
  const filer = {};
  const loggar = [];
  const curlade = [];
  const konfig = JSON.stringify({ rutter });
  const resultat = { filer, loggar, curlade };
  const kor = () => korVercelCronMotor({
    nu,
    lasKonfig: (p) => { if (filer[p] !== undefined && p.endsWith(".json")) return filer[p]; return konfig; },
    lasState: (p) => { if (filer[p] !== undefined) return filer[p]; return JSON.stringify(state); },
    skrivState: (p, s) => { filer[p] = s; },
    flyttaState: (fran, till) => { filer[till] = filer[fran]; delete filer[fran]; },
    curl: async (url, t) => { curlade.push({ url, t }); return 200; },
    konfigSokvag: "KONFIG.json",
    stateSokvag: "STATE.json",
    loggFn: (r) => loggar.push(r),
    secret,
  });
  return { kor, filer, loggar, curlade, lasState: () => JSON.parse(filer["STATE.json"] ?? "{}") };
}

const DAG = { id: "vagscan", sokvag: "/api/cron/vagscan", tim: 5, min: 0, fonster: "dag", aktiv: true, timeoutS: 300 };
const DAG_AV = { ...DAG, aktiv: false };
const MANAD = { id: "portfolj", sokvag: "/api/cron/portfolj-uppfoljning", tim: 7, min: 0, dagIManad: 1, fonster: "manad", aktiv: true };

// ── S1: inaktiva rutter körs ALDRIG (steg 1:s kärnsäkerhet) ────────────────
{
  const f = fixture({ rutter: [DAG_AV], nu: new Date("2026-09-28T05:00:30Z") });
  const r = await f.kor();
  kontroll("S1 inaktiva röras aldrig", r.körda.length === 0 && f.curlade.length === 0);
}
// ── S2: schematid nådd exakt ⇒ körs ────────────────────────────────────────
{
  const f = fixture({ rutter: [DAG], nu: new Date("2026-09-28T05:00:00Z") });
  const r = await f.kor();
  kontroll("S2 exakt schemaminut körs", r.körda.length === 1 && f.curlade[0]?.url.includes("/api/cron/vagscan"));
}
// ── S3: catch-up — 3 h efter schema, ej körd idag ⇒ körs ──────────────────
{
  const f = fixture({ rutter: [DAG], nu: new Date("2026-09-28T08:14:00Z") });
  const r = await f.kor();
  kontroll("S3 catch-up efter omstart", r.körda.length === 1);
}
// ── S4: före schemat ⇒ körs ej ────────────────────────────────────────────
{
  const f = fixture({ rutter: [DAG], nu: new Date("2026-09-28T04:59:59Z") });
  const r = await f.kor();
  kontroll("S4 före schema körs ej", r.körda.length === 0);
}
// ── S5: samma fönster igen ⇒ dedup ─────────────────────────────────────────
{
  const f = fixture({ rutter: [DAG], nu: new Date("2026-09-28T08:00:00Z") });
  await f.kor();
  const f2 = fixture({ rutter: [DAG], nu: new Date("2026-09-28T09:00:00Z"), state: f.lasState() });
  const r2 = await f2.kor();
  kontroll("S5 fönsterdedup", r2.körda.length === 0 && f2.curlade.length === 0);
}
// ── S6: ny dag = nytt fönster ──────────────────────────────────────────────
{
  const f = fixture({ rutter: [DAG], nu: new Date("2026-09-28T08:00:00Z") });
  await f.kor();
  const f2 = fixture({ rutter: [DAG], nu: new Date("2026-09-29T05:01:00Z"), state: f.lasState() });
  const r2 = await f2.kor();
  kontroll("S6 nytt fönster kör igen", r2.körda.length === 1);
}
// ── S7: månadsfönster — catch-up inom månaden, claim blockerar omkörning ──
{
  const fRatt = fixture({ rutter: [MANAD], nu: new Date("2026-10-01T07:30:00Z") });
  const rRatt = await fRatt.kor();
  // 2 oktober, INTE körd denna månad ⇒ catch-up körs (designen: missad
  // slot läker — månadsfönstret är kalendermånaden)
  const fCatch = fixture({ rutter: [MANAD], nu: new Date("2026-10-02T07:30:00Z") });
  const rCatch = await fCatch.kor();
  // 2 oktober, REDAN körd denna månad ⇒ claim blockerar
  const f2 = fixture({ rutter: [MANAD], nu: new Date("2026-10-02T08:30:00Z"), state: fRatt.lasState() });
  const r2 = await f2.kor();
  // november = nytt fönster ⇒ kör igen
  const fNov = fixture({ rutter: [MANAD], nu: new Date("2026-11-01T07:30:00Z"), state: fRatt.lasState() });
  const rNov = await fNov.kor();
  kontroll("S7 månadsfönster", rRatt.körda.length === 1 && rCatch.körda.length === 1 && r2.körda.length === 0 && rNov.körda.length === 1);
}
// ── S8: claim-först — curl-fel lämnar claimen (ingen omkörning samma fönster) ──
{
  const f = fixture({ rutter: [DAG], nu: new Date("2026-09-28T08:00:00Z") });
  // Override: curl kastar — känns via kor med trasig curl
  const r = await korVercelCronMotor({
    nu: new Date("2026-09-28T08:00:00Z"),
    lasKonfig: () => JSON.stringify({ rutter: [DAG] }),
    lasState: () => "{}",
    skrivState: (p, s) => { f.filer[p] = s; },
    flyttaState: (fran, till) => { f.filer[till] = f.filer[fran]; delete f.filer[fran]; },
    curl: async () => { throw new Error("curl död"); },
    konfigSokvag: "KONFIG.json", stateSokvag: "STATE.json",
    loggFn: () => {}, secret: null,
  });
  const stateEfter = JSON.parse(f.filer["STATE.json"] ?? "{}");
  const claimFinns = stateEfter.vagscan?.fonster === "2026-09-28";
  const f2 = fixture({ rutter: [DAG], nu: new Date("2026-09-28T09:00:00Z"), state: stateEfter });
  const r2 = await f2.kor();
  kontroll("S8 claim överlever curl-död", claimFinns && r2.körda.length === 0, JSON.stringify(stateEfter));
  kontroll("S8b fel rapporteras men motorn lever", r.körda.length === 1 && r.fel === null);
}
// ── S9: korrupt state ⇒ self-heal + kör ────────────────────────────────────
{
  const f = fixture({ rutter: [DAG], nu: new Date("2026-09-28T08:00:00Z") });
  f.filer["STATE.json"] = "{korrupt json";
  const r = await f.kor();
  kontroll("S9 self-heal korrupt state", r.körda.length === 1 && f.loggar.some(l => l.includes("STATE-FEL")));
}
// ── S10: sekret — ?secret= addingas, sekreten aldrig i logg ────────────────
{
  const f = fixture({ rutter: [DAG], nu: new Date("2026-09-28T08:00:00Z"), secret: "HEMLIG-123" });
  const r = await f.kor();
  const urlOk = f.curlade[0]?.url.includes("?secret=HEMLIG-123");
  const logRen = !f.loggar.some(l => l.includes("HEMLIG-123"));
  kontroll("S10 sekret på url + aldrig i logg", urlOk && logRen);
}
// ── S11: ogiltig konfig ⇒ inga körningar, fel rapporterat ──────────────────
{
  const f = fixture({ rutter: [DAG] });
  const r = await korVercelCronMotor({
    nu: new Date("2026-09-28T08:00:00Z"),
    lasKonfig: () => "{inte json",
    lasState: () => "{}",
    skrivState: (p, s) => { f.filer[p] = s; },
    flyttaState: (fran, till) => { f.filer[till] = f.filer[fran]; delete f.filer[fran]; },
    curl: async () => 200,
    konfigSokvag: "KONFIG.json", stateSokvag: "STATE.json",
    loggFn: (l) => f.loggar.push(l), secret: null,
  });
  kontroll("S11 ogiltig konfig säker", r.körda.length === 0 && r.fel === "konfig" && f.loggar.some(l => l.includes("KONFIGFEL")));
}
// ── S12: http-kod + status fångas i state ──────────────────────────────────
{
  const f = fixture({ rutter: [DAG], nu: new Date("2026-09-28T08:00:00Z") });
  await korVercelCronMotor({
    nu: new Date("2026-09-28T08:00:00Z"),
    lasKonfig: () => JSON.stringify({ rutter: [DAG] }),
    lasState: () => "{}",
    skrivState: (p, s) => { f.filer[p] = s; },
    flyttaState: (fran, till) => { f.filer[till] = f.filer[fran]; delete f.filer[fran]; },
    curl: async () => 500,
    konfigSokvag: "KONFIG.json", stateSokvag: "STATE.json",
    loggFn: (l) => f.loggar.push(l), secret: null,
  });
  const st = JSON.parse(f.filer["STATE.json"]);
  kontroll("S12 http-kod/status i state", st.vagscan?.httpKod === 500 && st.vagscan?.status === "fel" && f.loggar.some(l => l.includes("FYND")));
}

console.log(`\n${"-".repeat(50)}`);
if (fel.length === 0) {
  console.log(`SVIT vercel-cron-motor: ${pass}/${pass} PASS — GRÖN`);
  process.exit(0);
}
console.log(`SVIT vercel-cron-motor: ${fel.length} FAIL av ${fel.length + pass}`);
process.exit(1);
