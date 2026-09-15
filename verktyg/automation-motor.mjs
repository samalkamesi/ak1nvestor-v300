#!/usr/bin/env node
/**
 * AUTOMATION-MOTORN (våg 166 — verktygsauditen: automation 100 % ÄKTA)
 * =====================================================================
 * Bakgrund: runtinens automation/* är inte exponerad på app-server-kanalen
 * (-32601) — studions automationstjänst var en 501-stubb. Denna motor är
 * den NATIVA motorn: läser data/vakten/automations.json, eldar varje aktiv
 * automation vars 5-fälts-cron matchar aktuell minut (idempotent via
 * senasteSlot), POSTar prompten via /api/studio/stream och bokför.
 *
 * Körs: pumpor-daemonen varje tick (30 s) — motorbiten är mikrosekunder
 * när inget förfaller. Logg: data/vakten/automation-logg.jsonl.
 * Nyckel ur .env.production.local — ALDRIG i loggen. Exit 0 alltid.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");
const REGISTER = path.join(VAKT, "automations.json");
const LOGG = path.join(VAKT, "automation-logg.jsonl");
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

function logga(händelse, automation, detalj) {
  const rad = JSON.stringify({ ts: new Date().toISOString(), händelse, automation, detalj });
  try {
    fs.mkdirSync(VAKT, { recursive: true });
    fs.appendFileSync(LOGG, rad + "\n");
  } catch {
    /* logg är lyx */
  }
  console.log(`[automation-motor] ${händelse} ${automation ?? ""} ${detalj ?? ""}`.trim());
}

/** Fält-matchare: * , - / för exakt 5 fält (min tim dom mån dag). */
function faltMatchar(falt, varde) {
  for (const del of falt.split(",")) {
    const [bas, steg] = del.split("/");
    const stegTal = steg ? parseInt(steg, 10) : 1;
    if (!stegTal || stegTal < 1) continue;
    let match = false;
    if (bas === "*") match = true;
    else if (bas.includes("-")) {
      const [a, b] = bas.split("-").map((x) => parseInt(x, 10));
      match = varde >= a && varde <= b;
    } else {
      const a = parseInt(bas, 10);
      match = a === varde;
    }
    if (match) {
      if (bas === "*" && steg) return (varde % stegTal) === 0;
      if (steg && bas !== "*") {
        const a = parseInt(bas, 10);
        return varde >= a && (varde - a) % stegTal === 0;
      }
      return true;
    }
  }
  return false;
}

function cronMatchar(schema, d) {
  const [mi, ti, doM, ma, da] = schema.trim().split(/\s+/);
  return (
    faltMatchar(mi, d.getMinutes()) &&
    faltMatchar(ti, d.getHours()) &&
    faltMatchar(doM, d.getDate()) &&
    faltMatchar(ma, d.getMonth() + 1) &&
    faltMatchar(da, d.getDay())
  );
}

async function main() {
  let register = [];
  try {
    register = JSON.parse(fs.readFileSync(REGISTER, "utf8")).automationer || [];
  } catch {
    return; // inga automations = mikrosekunder-tystnad
  }
  const pass = lasPass();
  if (!pass) return;
  const nu = new Date();
  const slot = Math.floor(nu.getTime() / 60_000);
  let andrad = false;

  for (const a of register) {
    if (!a || a.aktiv === false || typeof a.schema !== "string") continue;
    if (a.senasteSlot === slot) continue; // redan eldad denna minut
    if (!cronMatchar(a.schema, nu)) continue;
    try {
      const r = await fetch(`${BAS}/api/studio/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pass },
        body: JSON.stringify({
          prompt: `AUTOMATION "${a.namn}" (schema ${a.schema}) — automatisk körning: ${a.prompt}`,
        }),
        signal: AbortSignal.timeout(90_000),
      });
      try { const l = r.body?.getReader(); if (l) await l.cancel().catch(() => {}); } catch {}
      a.senasteSlot = slot;
      a.senasteKorning = new Date().toISOString();
      a.korningar = (a.korningar || 0) + 1;
      andrad = true;
      logga("eldenad", a.id, `${a.namn} — ${r.ok ? "OK" : "FEL " + r.status}`);
    } catch (e) {
      logga("fel", a.id, String(e).slice(0, 100));
    }
  }
  if (andrad) {
    try {
      fs.writeFileSync(REGISTER, JSON.stringify({ automationer: register, uppdaterad: Date.now() }, null, 2));
    } catch {
      /* nästa tick försöker igen */
    }
  }
}

main().catch((fel) => logga("krasch", null, String(fel).slice(0, 150)));
