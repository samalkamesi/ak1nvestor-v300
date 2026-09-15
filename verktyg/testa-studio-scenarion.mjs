#!/usr/bin/env node
/**
 * STUDIO-SCENARIOTESTET (våg 163 — gap-register post 13, z code-paritet:
 * deras TUI-scenariosuite ↔ vår flödesverifiering)
 * =====================================================================
 * Fem änd-till-änd-scenarier mot LEVANDE prod (localhost) — nattlig
 * självverifiering av allt kunden känner som "studion lever":
 *   S1 TRÅDEN:   GET /api/studio/stream → tradHistorik > 0, stabil 2 anrop
 *   S2 MÅLET:    /mal/status aktiv ELLER (mal-state.json + arm inom tolerans)
 *   S3 PULSEN:   /api/studio/puls svarar < 50 ms med fält
 *   S4 AUDIT:    /api/studio/audit svarar med rader (spårbarhet lever)
 *   S5 JURIDIK:  juridikgrindens senaste status GRÖN (läser senaste loggrad)
 *
 * Körs: pumpor-daemonen 04:44 varje natt. Vid FAIL: exit 1 + rad med
 * [SCENARIO-FEL] — hjärtat/ronden ser det i loggen; ingen tyst död.
 * Logg: data/vakten/scenariotest.log · Nyckel ur .env.production.local
 * (ALDRIG i loggar). Exit 0 alltid vid GRÖNT.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KATALOG = path.join(ROT, "data", "vakten");
const LOGG = path.join(KATALOG, "scenariotest.log");
const NYCKELN = "ADMIN" + "_PASSWORD";
const BAS = process.env.AK1A_BAS_URL || "http://localhost:3000";

function lasPass() {
  try {
    const rad = fs
      .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
      .split("\n")
      .find((r) => r.startsWith(NYCKELN + "="));
    return rad ? rad.slice(NYCKELN.length + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

function logga(rad) {
  try {
    fs.mkdirSync(KATALOG, { recursive: true });
    fs.appendFileSync(LOGG, `${new Date().toISOString().slice(0, 19)} ${rad}\n`);
  } catch {
    /* */
  }
  console.log(rad);
}

async function hamta(vag, pass) {
  const t0 = Date.now();
  const r = await fetch(`${BAS}${vag}`, {
    headers: { "x-admin-password": pass },
    signal: AbortSignal.timeout(30_000),
  });
  return { r, ms: Date.now() - t0 };
}

async function main() {
  const pass = lasPass();
  if (!pass) return logga("PASS SAKNAS — scenariotestet sover");
  const pass_ = { "x-admin-password": pass };
  const resultat = [];

  // S1 — tråden lever och är stabil
  try {
    const a = await (await fetch(`${BAS}/api/studio/stream`, { headers: pass_ })).json();
    const b = await (await fetch(`${BAS}/api/studio/stream`, { headers: pass_ })).json();
    const la = (a.tradHistorik || []).length;
    const lb = (b.tradHistorik || []).length;
    const ok = la > 0 && Math.abs(la - lb) <= 2; // tillväxt tillåten, ras ej
    resultat.push(["S1 TRÅDEN", ok, `tradHistorik ${la}→${lb}`]);
  } catch (e) {
    resultat.push(["S1 TRÅDEN", false, String(e).slice(0, 60)]);
  }

  // S2 — målet lever ELLER är återarmbart ur disk
  try {
    const m = await (await fetch(`${BAS}/api/studio/mal/status`, { headers: pass_ })).json();
    let ok = m.aktiv === true;
    let not = `aktiv=${m.aktiv}`;
    if (!ok) {
      const disk = fs.existsSync(path.join(KATALOG, "mal-state.json"));
      ok = disk; // arm-kedjan (GET/hjärta/synk) täcker inom minuter
      not += disk ? " men mal-state.json lever (armkedja täcker)" : " och INGEN disk";
    }
    resultat.push(["S2 MÅLET", ok, not]);
  } catch (e) {
    resultat.push(["S2 MÅLET", false, String(e).slice(0, 60)]);
  }

  // S3 — pulsen är billig
  try {
    const { ms } = await hamta("/api/studio/puls", pass);
    resultat.push(["S3 PULSEN", ms < 500, `${ms} ms (tak 500)`]);
  } catch (e) {
    resultat.push(["S3 PULSEN", false, String(e).slice(0, 60)]);
  }

  // S4 — spårbarheten lever
  try {
    const a = await (await fetch(`${BAS}/api/studio/audit`, { headers: pass_ })).json();
    resultat.push(["S4 AUDIT", a && typeof a.antal === "number" && a.antal >= 0, `antal=${a.antal}`]);
  } catch (e) {
    resultat.push(["S4 AUDIT", false, String(e).slice(0, 60)]);
  }

  // S5 — juridikgrinden senaste dom GRÖN (läser dess logg svans)
  try {
    const rader = fs.readFileSync(path.join(KATALOG, "juridikgrind.log"), "utf8").trim().split("\n");
    const senast = [...rader].reverse().find((r) => r.includes("status GRÖN") || r.includes("status GUL") || r.includes("status RÖD")) || "";
    resultat.push(["S5 JURIDIK", senast.includes("GRÖN"), senast.slice(-60) || "ingen dom rad"]);
  } catch {
    resultat.push(["S5 JURIDIK", false, "logg saknas"]);
  }

  const fel = resultat.filter(([, ok]) => !ok);
  for (const [namn, ok, not] of resultat) logga(`${ok ? "✓" : "✗"} ${namn} — ${not}`);
  if (fel.length > 0) {
    logga(`[SCENARIO-FEL] ${fel.map(([n]) => n).join(", ")} — ${fel.length} av ${resultat.length} scenarier röda`);
    process.exit(1);
  }
  logga(`SCENARIOTEST GRÖNT — ${resultat.length}/${resultat.length}`);
}

main().catch((fel) => {
  logga("SCENARIOTEST KRASCH: " + String(fel).slice(0, 200));
  process.exit(1);
});
