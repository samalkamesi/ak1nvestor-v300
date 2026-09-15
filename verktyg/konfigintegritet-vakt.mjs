#!/usr/bin/env node
/**
 * KONFIGINTEGRITETSVAKTEN (fullmaktssammanträdet 2026-09-15 — beslut punkt 6)
 * =====================================================================
 * Vaktar serverns driftkritiska konfiguration mot de git-versionerade
 * referensfilerna i data/infra/konfig-referens/:
 *
 *  (a) CRONTAB — `crontab -l` jämförs rad-för-rad mot crontab.reference.
 *      Hemliga värden är maskade som <DATABASE_URL> i referensen; vakten
 *      jämför RADFORMEN (platshållare = joker), aldrig hemliga värden.
 *
 *  (b) PM2 — `pm2 jlist` kontrolleras mot pm2-processer.reference: varje
 *      namn måste FINNAS och ha status "online".
 *
 *  (c) LARM — saknad rad / saknad eller ej online process ⇒ larmrad
 *      (append-only) i data/vakten/konfig-larm.jsonl + [KONFIG-DRIFT]-rad
 *      på stdout. Allt grönt ⇒ EN grön rad i samma journal. Okända extra
 *      crontab-rader noteras som INFO på stdout — aldrig larmnivå (beslut
 *      6 omfattar SAKNADE rader/processer).
 *
 * Säkerhet: verktyget läser ENBART systemkommandon (crontab -l, pm2 jlist)
 * + referensfilerna — inga nycklar, ingen .env-production.local. Faktiskt
 * serverinnehåll maskeras (connsträngar, password=… → <HEMLIG>) innan det
 * någonsin skrivs till logg/stdout — riktiga hemligheter läcker ALDRIG.
 *
 * Pumpor-schema: min%10==9 (xx:09, :19, :29, :39, :49, :59) via
 * pumpor-daemonens korEnGang("konfigintegritet", …) — fritt från :x1/:x4/
 * :x5/:x7/:x8 och minuterna :17/:23/:37/:43/:47.
 *
 * Filer:
 *   data/infra/konfig-referens/crontab.reference     — normen (maskerad)
 *   data/infra/konfig-referens/pm2-processer.reference
 *   data/vakten/konfig-larm.jsonl                    — APPEND-ONLY journal
 *   data/vakten/konfigintegritetvakt.log             — körningslogg (ret 200)
 *
 * Exit-kod: ALLTID 0 — larm ska synas i journal/stdout, aldrig bli en
 * krasch som daemonen måste hantera.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REFERENSDIR = path.join(ROT, "data", "infra", "konfig-referens");
const CRONTAB_REF = path.join(REFERENSDIR, "crontab.reference");
const PM2_REF = path.join(REFERENSDIR, "pm2-processer.reference");
const VAKTDIR = path.join(ROT, "data", "vakten");
const LARMFIL = path.join(VAKTDIR, "konfig-larm.jsonl");
const LOGGFIL = path.join(VAKTDIR, "konfigintegritetvakt.log");
const TIMEOUT_MS = 30_000;

function logga(rad) {
  const stamp = new Date().toISOString();
  try {
    fs.appendFileSync(LOGGFIL, `${stamp} ${rad}\n`);
    const rader = fs.readFileSync(LOGGFIL, "utf8").split("\n");
    if (rader.length > 200) fs.writeFileSync(LOGGFIL, rader.slice(-200).join("\n"));
  } catch {
    /* logg får vänta */
  }
  console.log(`[konfigintegritetsvakt] ${rad}`);
}

function appendLarm(larm) {
  try {
    fs.appendFileSync(LARMFIL, JSON.stringify({ ts: new Date().toISOString(), ...larm }) + "\n");
  } catch {
    /* append får vänta — men aldrig kasta vakten */
  }
}

/** Icke-hemlig utskrift av faktiskt serverinnehåll (försvar på djupet). */
function maskera(rad) {
  return String(rad)
    .replace(/postgres(?:ql)?:\/\/[^\s"]+/gi, "<HEMLIG>")
    .replace(/"host=[^"]*"/gi, '"<HEMLIG>"')
    .replace(/password=\S+/gi, "password=<HEMLIG>");
}

/** Rader ur en referensfil: blankstegstrimmade, kommentar/ tomma rader bort. */
function lasReferensRader(fil) {
  const text = fs.readFileSync(fil, "utf8");
  return text
    .split("\n")
    .map((r) => r.replace(/\r$/, "").trim())
    .filter((r) => r.length > 0 && !r.startsWith("#"));
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Referensrad → regex: platshållare <NAMN> blir joker, resten ordagrant. */
function referensTillRegex(rad) {
  return new RegExp("^" + escapeRegExp(rad).replace(/<[^>]+>/g, ".+?") + "$");
}

/** Systemkommando med PATH-fallback via login-skal (daemonens PATH är smal). */
function körKommando(kommando, args) {
  let r = spawnSync(kommando, args, { timeout: TIMEOUT_MS, encoding: "utf8" });
  if (r.error && r.error.code === "ENOENT") {
    r = spawnSync("bash", ["-lc", `${kommando} ${args.join(" ")}`], { timeout: TIMEOUT_MS, encoding: "utf8" });
  }
  return r;
}

// ── (a) crontab mot crontab.reference ──────────────────────────────────────

function kontrolleraCrontab() {
  const forvantade = lasReferensRader(CRONTAB_REF);
  const regexar = forvantade.map(referensTillRegex);
  const r = körKommando("crontab", ["-l"]);
  const kommandoFel = r.error ? String(r.error.code ?? r.error.message) : r.status !== 0 ? `exit=${r.status}` : null;
  const faktiska = String(r.stdout ?? "")
    .split("\n")
    .map((rad) => rad.replace(/\r$/, "").trim())
    .filter((rad) => rad.length > 0 && !rad.startsWith("#"));

  const saknade = forvantade.filter((rad) => !faktiska.some((f) => referensTillRegex(rad).test(f)));
  const extra = faktiska.filter((f) => !regexar.some((re) => re.test(f)));
  return { forvantade, hittade: forvantade.length - saknade.length, saknade, extra, kommandoFel };
}

// ── (b) pm2 mot pm2-processer.reference ────────────────────────────────────

function kontrolleraPm2() {
  const forvantade = lasReferensRader(PM2_REF).map((rad) => rad.split(/\s+/)[0]);
  const r = körKommando("pm2", ["jlist"]);
  const kommandoFel = r.error ? String(r.error.code ?? r.error.message) : r.status !== 0 ? `exit=${r.status}` : null;
  let parseFel = null;
  let processer = [];
  if (!kommandoFel) {
    try {
      processer = JSON.parse(String(r.stdout ?? "[]"));
      if (!Array.isArray(processer)) parseFel = "jlist ej array";
    } catch (e) {
      parseFel = `json-fel: ${String(e?.message ?? e).slice(0, 80)}`;
    }
  }
  const statusPerNamn = new Map();
  for (const p of processer) {
    const namn = p?.name;
    const status = p?.pm2_env?.status ?? "okänd";
    if (typeof namn === "string" && status === "online") statusPerNamn.set(namn, status);
    else if (typeof namn === "string" && !statusPerNamn.has(namn)) statusPerNamn.set(namn, status);
  }
  const avvikelser = [];
  for (const namn of forvantade) {
    const status = statusPerNamn.get(namn);
    if (!status) avvikelser.push({ namn, status: "SAKNAS" });
    else if (status !== "online") avvikelser.push({ namn, status });
  }
  return { forvantade, avvikelser, kommandoFel, parseFel };
}

// ── HUVUDFLÖDE ─────────────────────────────────────────────────────────────

(() => {
  try {
    fs.mkdirSync(VAKTDIR, { recursive: true });
  } catch {
    /* finns normalt */
  }
  logga("körning start");
  const larm = [];

  let c = null;
  try {
    c = kontrolleraCrontab();
  } catch (e) {
    larm.push({ niva: "larm", typ: "konfig-drift", omrade: "crontab", medd: `Referensfilen kan ej läsas (${String(e?.message ?? e).slice(0, 120)}) — verifiering OMÖJLIG. data/infra/konfig-referens/crontab.reference` });
  }
  if (c) {
    if (c.kommandoFel) larm.push({ niva: "larm", typ: "konfig-drift", omrade: "crontab", medd: `crontab -l misslyckades (${c.kommandoFel}) — kan inte verifiera ${c.forvantade.length} referensrader.` });
    for (const rad of c.saknade) larm.push({ niva: "larm", typ: "konfig-drift", omrade: "crontab", medd: `SAKNAD crontab-rad: ${rad}` });
    if (c.extra.length > 0) logga(`INFO ${c.extra.length} okänd(a) crontab-rad(er) utanför referensen (okritiskt): ${c.extra.map(maskera).join(" | ").slice(0, 300)}`);
    logga(`(a) crontab: ${c.hittade}/${c.forvantade.length} referensrader på plats${c.saknade.length ? ` — SAKNADE ${c.saknade.length}` : ""}${c.extra.length ? ` · ${c.extra.length} okända (INFO)` : ""}`);
  }

  let p = null;
  try {
    p = kontrolleraPm2();
  } catch (e) {
    larm.push({ niva: "larm", typ: "konfig-drift", omrade: "pm2", medd: `Referensfilen kan ej läsas (${String(e?.message ?? e).slice(0, 120)}) — verifiering OMÖJLIG. data/infra/konfig-referens/pm2-processer.reference` });
  }
  if (p) {
    const oanvandbar = p.kommandoFel || p.parseFel;
    if (oanvandbar) larm.push({ niva: "larm", typ: "konfig-drift", omrade: "pm2", medd: `pm2 jlist oanvändbar (${p.kommandoFel ?? p.parseFel}) — kan inte verifiera ${p.forvantade.length} processer.` });
    for (const a of p.avvikelser) {
      larm.push({
        niva: "larm",
        typ: "konfig-drift",
        omrade: "pm2",
        medd: a.status === "SAKNAS" ? `pm2-processen ${a.namn} SAKNAS i pm2 jlist.` : `pm2-processen ${a.namn} EJ ONLINE (status=${a.status}).`,
      });
    }
    logga(`(b) pm2: ${p.forvantade.length - p.avvikelser.length}/${p.forvantade.length} online${p.avvikelser.length ? ` — AVVIKELSER: ${p.avvikelser.map((a) => `${a.namn}=${a.status}`).join(", ")}` : ` (${p.forvantade.join(", ")})`}`);
  }

  if (larm.length > 0) {
    for (const l of larm) {
      appendLarm(l);
      console.log(`[KONFIG-DRIFT] ${l.omrade}: ${l.medd}`);
      logga(`LARM ${l.omrade}: ${l.medd}`);
    }
    logga(`körning slut — ${larm.length} larm`);
  } else {
    const gron = `GRÖN — crontab ${c.hittade}/${c.forvantade.length} referensrader på plats · pm2 ${p.forvantade.length}/${p.forvantade.length} online (${p.forvantade.join(", ")})`;
    appendLarm({ niva: "gron", typ: "konfig-gron", medd: gron });
    console.log(`GRÖN konfigintegritet ${gron}`);
    logga(`(c) ${gron}`);
  }
  process.exit(0); // ALLTID 0 — även vid larm (journalen bär signalen)
})();
