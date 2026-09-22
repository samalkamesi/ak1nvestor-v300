#!/usr/bin/env node
// s9-u2 kartdiff 2026-09-22 — B10 Konfluensradarn + B11 Net-net-skannern.
// Read-only mot loopback (whitelistad) + prod-HTTPS status; skriver
// bevisrapport till data/vakten/_s9u2-kartdiff-0922.json.
// OBS: GET /api/netnet anropar internt lasEllerHamta ⇒ data/cache/netnet-*.json
// refreshas som sidoeffekt (samma mönster som s9-u3-sonden 09-20).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOOPBACK = "http://localhost:3000";
const PROD = "https://lab.ak1nvestor.com";

async function hamta(bas, sokvag) {
  const startt = Date.now();
  const res = await fetch(bas + sokvag, { redirect: "manual" });
  const ms = Date.now() - startt;
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { sokvag, status: res.status, ms, bytes: text.length, json };
}

const rapport = { sond: "verktyg/_s9u2-kartdiff-0922.mjs", ts: new Date().toISOString(), konfluens: {}, netnet: {}, sidor: {}, prod: {}, fel: [] };

// ── B10: /api/konfluens ──────────────────────────────────────────────────────
try {
  const r = await hamta(LOOPBACK, "/api/konfluens");
  const j = r.json ?? {};
  const rader = j.rader ?? [];
  const medKallor = rader.filter((x) => (x.datakallor ?? 0) >= 3);
  const klassade = rader.filter((x) => x.klass !== null && x.klass !== undefined);
  const topp = rader.slice().sort((a, b) => (b.konfluens ?? 0) - (a.konfluens ?? 0))[0];
  rapport.konfluens = {
    status: r.status, ms: r.ms, genererad: j.genererad ?? null,
    universum: j.universum ?? null, antalRader: rader.length,
    medDatakallorMinst3: medKallor.length,
    klassade: klassade.map((x) => `${x.ticker}:${x.klass}`),
    topp: topp ? `${topp.ticker} ${topp.konfluens}` : null,
  };
} catch (e) { rapport.fel.push("konfluens-api: " + e.message); }

// ── B11: /api/netnet ─────────────────────────────────────────────────────────
try {
  const r = await hamta(LOOPBACK, "/api/netnet");
  const j = r.json ?? {};
  const rader = j.rader ?? [];
  const klassRakning = {};
  for (const x of rader) klassRakning[x.klass ?? "null"] = (klassRakning[x.klass ?? "null"] ?? 0) + 1;
  const volv = rader.find((x) => x.ticker === "VOLV-B.ST");
  const nullKurs = rader.filter((x) => x.kurs === null).map((x) => x.ticker);
  rapport.netnet = {
    status: r.status, ms: r.ms, genererad: j.genererad ?? null,
    antalRader: rader.length, klassRakning,
    volvBKurs: volv?.kurs ?? null,
    raderMedKursNull: nullKurs,
    nastNarmast: rader
      .filter((x) => typeof x.forhallande === "number")
      .sort((a, b) => a.forhallande - b.forhallande)
      .slice(0, 3)
      .map((x) => `${x.ticker} ${x.forhallande.toFixed(2)}`),
  };
} catch (e) { rapport.fel.push("netnet-api: " + e.message); }

// ── Sidorna (loopback) ───────────────────────────────────────────────────────
for (const s of ["/konfluens", "/netnet"]) {
  try {
    const r = await hamta(LOOPBACK, s);
    rapport.sidor[s] = { status: r.status, ms: r.ms, kb: Math.round(r.bytes / 1024) };
  } catch (e) { rapport.fel.push(`sida ${s}: ` + e.message); }
}

// ── Prod-sond (read-only status + färskhet) ─────────────────────────────────
for (const s of ["/api/konfluens", "/api/netnet"]) {
  try {
    const r = await hamta(PROD, s);
    rapport.prod[s] = {
      status: r.status, ms: r.ms,
      genererad: r.json?.genererad ?? null,
      antalRader: Array.isArray(r.json?.rader) ? r.json.rader.length : null,
    };
  } catch (e) { rapport.fel.push(`prod ${s}: ` + e.message); }
}

// ── Cache-före/för netnet-lasEllerHamta-sidoeffekten ─────────────────────────
const cacheDir = path.join(REPO, "data", "cache");
function cacheStat(prefix) {
  try {
    const filer = fs.readdirSync(cacheDir).filter((f) => f.startsWith(prefix + "-"));
    const mtimes = filer.map((f) => fs.statSync(path.join(cacheDir, f)).mtimeMs);
    return { antal: filer.length, FarrskMtime: mtimes.length ? new Date(Math.max(...mtimes)).toISOString() : null };
  } catch (e) { return { antal: 0, fel: e.message }; }
}
rapport.cache = {
  netnet: cacheStat("netnet"),
  konfluens: cacheStat("konfluens"),
  vagfundament: cacheStat("vagfundament"),
  notis: "netnet-mtimes EFTER denna sonds GET = lasEllerHamta-sidoeffekten lever",
};

fs.writeFileSync(path.join(REPO, "data", "vakten", "_s9u2-kartdiff-0922.json"), JSON.stringify(rapport, null, 2));
console.log(JSON.stringify(rapport, null, 2));
