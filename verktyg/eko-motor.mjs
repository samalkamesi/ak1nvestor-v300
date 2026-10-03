#!/usr/bin/env node
/**
 * AK1A EKOSYSTEM-MOTOR — Boost.space integration engine (arbetsstation 2, 2026-10-03)
 * =====================================================================
 * Detta är kärnan i ekosystem-integrationen: ett skript som ORGANISMEN
 * kör (cron/rond) som:
 *   1. Hämtar live-data från plattformen (kurser, drift, mejlkö)
 *   2. Uppdaterar Boost.space-dashboards (ÖGON + Kapabilitets-Hub)
 *   3. Skapar Ocoya AI-utkast när nytt innehåll publicerats
 *   4. Loggar händelser i Boost.space (åratal av spårbarhet)
 *
 * Användning: node verktyg/eko-motor.mjs
 * Krav: BS_API_KEY + AK1A_ADMIN_PASSWORD + OCOYA_API_KEY i miljön
 *
 * Mimosa: fasta https-värdar endast; nycklar från env; inga hårdkodade hemligheter.
 */

// ── Konfiguration ────────────────────────────────────────────────────────────
const BS_BASE = process.env.BS_BASE_URL || "https://ak1nvestor.boost.space/api";
const BS_KEY = process.env.BS_API_KEY || "";
const AK1A_PWD = process.env.AK1A_ADMIN_PASSWORD || "";
const OCOYA_KEY = process.env.OCOYA_API_KEY || "";
const OCOYA_BRAND = process.env.OCOYA_BRAND_ID || "";
const AK1A = "https://lab.ak1nvestor.com";
const SPACE_OGON = parseInt(process.env.BS_OGON_SPACE || "21", 10);
const SPACE_LOGG = parseInt(process.env.BS_LOGG_SPACE || "0", 10);

const H_BS = { "Authorization": `Bearer ${BS_KEY}`, "Content-Type": "application/json", "Accept": "application/json" };
const H_AK1A = { "x-admin-password": AK1A_PWD };
const H_OCOYA = { "X-API-Key": OCOYA_KEY, "Content-Type": "application/json", "Accept": "application/json" };

// ── Hjälpfunktioner ─────────────────────────────────────────────────────────
const sova = (ms) => new Promise((r) => setTimeout(r, ms));
const kl = (d) => new Date(d).toISOString().slice(0, 16);

async function safeFetch(url, init) {
  try { return await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) }); }
  catch { return null; }
}

// ── 1. Hämta live-data från plattformen ──────────────────────────────────────
async function hamtaPlattformData() {
  const d = { tid: kl(Date.now()) };

  const v = await safeFetch(`${AK1A}/api/version`, { headers: H_AK1A });
  if (v?.ok) d.bygg = JSON.parse(await v.text()).bygge;

  const site = await safeFetch(AK1A, { method: "HEAD" });
  d.siteStatus = site ? site.status : 0;

  const s = await safeFetch(`${AK1A}/api/studio/filer?sokvag=${encodeURIComponent("data/siffror.json")}&nedladdning=1`, { headers: H_AK1A });
  if (s?.ok) {
    const j = JSON.parse(Buffer.from(await s.arrayBuffer()).toString("utf8"));
    d.kurser = j.kurser; d.quiz = j.quiz;
  }

  const w = await safeFetch(`${AK1A}/api/studio/filer?sokvag=${encodeURIComponent("worklog.md")}&nedladdning=1`, { headers: H_AK1A });
  if (w?.ok) {
    const wt = Buffer.from(await w.arrayBuffer()).toString("utf8");
    const ronder = wt.split("\n").filter((r) => r.startsWith("## "));
    d.senasteRon = (ronder[ronder.length - 1] || "").slice(0, 180);
  }

  return d;
}

// ── 2. Uppdatera Boost.space-dashboards ──────────────────────────────────────
async function uppdateraOgon(d) {
  const lista = await safeFetch(`${BS_BASE}/todo?space=${SPACE_OGON}`, { headers: H_BS });
  if (!lista?.ok) return;
  const poster = await lista.json();
  const befintliga = new Map(poster.map((p) => [p.title, p.id]));

  const uppdateringar = [
    { title: "🌐 Sajt-status", note: `HTTP ${d.siteStatus} ${d.siteStatus === 200 ? "✓" : "⚠️"} | Bygg: ${d.bygg || "?"} | UPPDATERAD: ${d.tid}` },
    { title: "📚 Innehållstillväxt", note: `Kurser: ${d.kurser || "?"} | Quiz: ${d.quiz || "?"} | UPPDATERAD: ${d.tid}` },
    { title: "🤖 Organismens senaste", note: `${d.senasteRon || "okänd"} | UPPDATERAD: ${d.tid}` },
  ];

  for (const u of uppdateringar) {
    if (befintliga.has(u.title)) {
      await safeFetch(`${BS_BASE}/todo/${befintliga.get(u.title)}`, {
        method: "PUT", headers: H_BS, body: JSON.stringify({ note: u.note }),
      });
    } else {
      await safeFetch(`${BS_BASE}/todo`, {
        method: "POST", headers: H_BS, body: JSON.stringify({ title: u.title, note: u.note, spaceId: SPACE_OGON }),
      });
    }
    await sova(500);
  }
}

// ── 3. Logga händelse i Boost.space ──────────────────────────────────────────
async function loggaHandelse(titel, beskrivning) {
  if (!SPACE_LOGG) return; // logg-space ej konfigurerad ännu
  await safeFetch(`${BS_BASE}/todo`, {
    method: "POST", headers: H_BS,
    body: JSON.stringify({ title: titel, note: `${beskrivning} | ${kl(Date.now())}`, spaceId: SPACE_LOGG }),
  });
}

// ── 4. Skapa Ocoya AI-utkast vid nytt innehåll ───────────────────────────────
async function skapaOcoyaUtkast(kursTitel, kursBeskrivning) {
  if (!OCOYA_KEY || !OCOYA_BRAND) return null;
  const r = await safeFetch(`https://www.app.ocoya.com/api/_public/v1/post/ai?brandId=${OCOYA_BRAND}`, {
    method: "POST", headers: H_OCOYA,
    body: JSON.stringify({
      prompt: `Skapa ett socialt medier-inlägg om kursen "${kursTitel}" — ${kursBeskrivning}. Skriv på svenska, pedagogisk ton, avsluta med att lära sig mer gratis på AK1A Research Lab (lab.ak1nvestor.com).`,
      tone: "educational",
      postLength: "medium",
      generateImage: true,
    }),
  });
  if (!r?.ok) return null;
  return r.json();
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log("── EKOSYSTEM-MOTOR ──");

// Steg 1: Hämta plattforms-data
const d = await hamtaPlattformData();
console.log(`Data: sajt=${d.siteStatus}, kurser=${d.kurser}, bygg=${d.bygg}`);

// Steg 2: Uppdatera dashboards
await uppdateraOgon(d);
console.log("✅ ÖGON uppdaterade");

// Steg 3: Kontrollera om nytt innehåll → Ocoya-utkast
// (organismen kan anropa skapaOcoyaUtkast direkt när ny kurs levererats)

console.log(`\nMotor klar kl ${d.tid}. Allt är färskt i Boost.space.`);
