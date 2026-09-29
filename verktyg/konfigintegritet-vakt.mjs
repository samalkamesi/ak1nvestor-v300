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
 * Säkerhet: verktyget läser systemkommandon (crontab -l, pm2 jlist)
 * + referensfilerna. Undantag (v212 r329): vid KRITISKT crontab-larm läses
 * ADMIN_PASSWORD ur .env-production.local för sessionnotis-POSTen —
 * automation-motorns mönster och hygien (värdet används endast i
 * anropshuvudet, loggas ALDRIG). Faktiskt
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
 * Exit-kod (v212 r329 — tyst-larm-kurens läxa ur crontab-massförlusten
 * 2026-09-29: 9 SAKNADE-larm med exit 0 väckte aldrig någon, och nattens
 * DR-kedja dog tyst i sex timmar):
 *   0 = GRÖN, eller endast icke-kritiska fynd (okända extra rader = INFO,
 *       pm2-larm — pm2-kanalen ägs av pulsvakten och pm2 självt).
 *   1 = SAKNAD crontab-rad eller crontab-verifiering omöjlig — drifts-
 *       avvikelse som skall synas i pumpor-loggens "slut kod="-rad.
 * Vid exit-1-klassen postas dessutom EN sessionnotis till
 * /api/studio/stream (automation-motorns kanal och nyckelhygien),
 * deduperad per unik larmbild + max en påminnelse per timme medan felet
 * lever (statusfil konfig-notis-senaste.json i vakt-katalogen).
 * Test-yta (ALDRIG mot äkta crontab eller äkta journaler):
 *   AK1A_CRONTAB_REF=<fil>  — jämför mot testreferens i stället
 *   AK1A_LARM_DIR=<dir>     — journal/logg/notisstatus i testkatalog
 *   AK1A_KONFIG_NOTIS=av    — blockerar POST:en (exit-koden kvarstår)
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REFERENSDIR = path.join(ROT, "data", "infra", "konfig-referens");
// Test-yta (v212 r329): override-pekring utan att äkta referens/journaler rörs.
const CRONTAB_REF = process.env.AK1A_CRONTAB_REF || path.join(REFERENSDIR, "crontab.reference");
const PM2_REF = path.join(REFERENSDIR, "pm2-processer.reference");
const VAKTDIR = process.env.AK1A_LARM_DIR || path.join(ROT, "data", "vakten");
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

// ── v212 (r329): sessionnotis vid kritiska crontab-avvikelser ──────────────
// Natten 2026-09-29 skrev vakten 9 SAKNADE-larm till journalen med exit 0 —
// journalen saknade konsument och sessionen sov genom hela DR-kedjans död.
// Härmed väcks den: EN notis per unik larmbild, max en påminnelse/timme.

const NYCKELN = "ADMIN" + "_PASSWORD";
const NOTIS_BAS = process.env.AK1A_BAS_URL || "http://localhost:3000";
const NOTIS_STATUS = path.join(VAKTDIR, "konfig-notis-senaste.json");

/** ADMIN_PASSWORD ur .env-production.local — automation-motorns mönster:
 *  värdet används ENDAST i anropshuvudet, ALDRIG i logg/journal/status. */
function lasAdminPass() {
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

/** EN notis till studionsessionen per unik larmbild (hash), påminnelse
 *  tidigast efter en timme medan samma bild lever. POST får ALDRIG kasta
 *  vakten — notissvaret cancellas direkt (automation-motorns mönster). */
async function skickaSessionnotis(kritiska) {
  const bild = kritiska.map((l) => l.medd).join(" | ").slice(0, 400);
  let hash = 7;
  for (const ch of bild) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  let status = {};
  try {
    status = JSON.parse(fs.readFileSync(NOTIS_STATUS, "utf8"));
  } catch {
    /* första notisen */
  }
  const nu = Date.now();
  if (status.hash === hash && nu - (status.ts ?? 0) < 3_600_000) {
    logga("sessionnotis DEDUP — samma larmbild nyligen notifierad");
    return;
  }
  const pass = lasAdminPass();
  if (!pass) {
    logga("sessionnotis SKIPPAD — inget admin-lösenord kunde läsas");
    return;
  }
  const prompt =
    `KONFIG-LARM (konfigintegritetsvakten): ${kritiska.length} kritisk(a) crontab-avvikelse(r). ` +
    `${bild}. Uppdrag enligt AGENTS.md: verifiera med 'crontab -l' mot ` +
    `data/infra/konfig-referens/crontab.reference, återställ enligt normen ` +
    `(append-aldrig-ersätt), följ referensens ändringsprotokoll i samma ändring, ` +
    `verifiera med 'node verktyg/konfigintegritet-vakt.mjs' och bokför i worklogen.`;
  try {
    const r = await fetch(`${NOTIS_BAS}/api/studio/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pass },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(10_000),
    });
    try {
      const rd = r.body?.getReader();
      if (rd) await rd.cancel().catch(() => {});
    } catch {
      /* body får stängas hur den vill */
    }
    fs.writeFileSync(NOTIS_STATUS, JSON.stringify({ ts: nu, hash, ok: r.ok ? 1 : 0, status: r.status }));
    logga(`sessionnotis ${r.ok ? "OK" : "FEL " + r.status} (bild ${hash})`);
  } catch (e) {
    logga(`sessionnotis FEL: ${String(e?.message ?? e).slice(0, 80)}`);
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

(async () => {
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
  // v212 (r329): klassad exit + sessionnotis — SAKNADE crontab-rad är den
  // klass som dog tyst (9 larm, exit 0, sovande session). pm2-larm förblir
  // exit 0: pulsvakten och pm2 självt äger den kanalen.
  const crontabKritiska = larm.filter((l) => l.omrade === "crontab");
  if (crontabKritiska.length > 0) {
    if (process.env.AK1A_KONFIG_NOTIS === "av") {
      logga("sessionnotis BLOCKERAD (AK1A_KONFIG_NOTIS=av — testläge)");
    } else {
      await skickaSessionnotis(crontabKritiska);
    }
    process.exit(1);
  }
  process.exit(0);
})();
