#!/usr/bin/env node
/**
 * AK1A ÖGON — Boost.space live-status-uppdaterare (arbetsstation 2, 2026-10-03)
 * =====================================================================
 * Körs av organismen (cron eller vid varje rond) för att hålla kundens
 * Boost.space-dashboard aktuell. Uppdaterar poster i space "AK1A ÖGON".
 *
 * Användning: node verktyg/bs-ogon-uppdatera.mjs
 * Krav: BS_API_KEY + AK1A_ADMIN_PASSWORD i miljön (eller .env)
 *
 * Mimosa-regler: endast fasta https-värdar (boost.space + lab.ak1nvestor.com),
 * nycklar läses ENDAST från miljövariabler, aldrig hårdkodade.
 */

const BS_BASE = process.env.BS_BASE_URL || "https://ak1nvestor.boost.space/api";
const BS_KEY = process.env.BS_API_KEY || "";
const AK1A_PWD = process.env.AK1A_ADMIN_PASSWORD || "";
const SPACE_ID = parseInt(process.env.BS_OGON_SPACE || "21", 10);

if (!BS_KEY || !AK1A_PWD) {
  console.error("FEL: BS_API_KEY och AK1A_ADMIN_PASSWORD måste vara satta i miljön.");
  process.exit(1);
}

const H_BS = { "Authorization": `Bearer ${BS_KEY}`, "Content-Type": "application/json", "Accept": "application/json" };
const H_AK1A = { "x-admin-password": AK1A_PWD };
const AK1A = "https://lab.ak1nvestor.com";
const nu = new Date().toISOString().slice(0, 16);

// ── Hämta live-data ─────────────────────────────────────────────────────────

async function hamtaData() {
  const data = { nu };

  try {
    const v = await fetch(`${AK1A}/api/version`, { headers: H_AK1A });
    data.bygg = JSON.parse(await v.text()).bygge;
  } catch { data.bygg = "okänt"; }

  try {
    const site = await fetch(AK1A, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    data.siteStatus = site.status;
  } catch { data.siteStatus = 0; }

  try {
    const g = await fetch(`${AK1A}/api/studio/filer?sokvag=${encodeURIComponent(".git/refs/heads/develop")}&nedladdning=1`, { headers: H_AK1A });
    data.develop = (await g.text()).trim().slice(0, 12);
  } catch { data.develop = "okänd"; }

  try {
    const w = await fetch(`${AK1A}/api/studio/filer?sokvag=${encodeURIComponent("data/siffror.json")}&nedladdning=1`, { headers: H_AK1A });
    const j = JSON.parse(Buffer.from(await w.arrayBuffer()).toString("utf8"));
    data.kurser = j.kurser || "?";
    data.quiz = j.quiz || "?";
  } catch { data.kurser = "?"; data.quiz = "?"; }

  try {
    const w = await fetch(`${AK1A}/api/studio/filer?sokvag=${encodeURIComponent("worklog.md")}&nedladdning=1`, { headers: H_AK1A });
    const wt = Buffer.from(await w.arrayBuffer()).toString("utf8");
    const ronder = wt.split("\n").filter((r) => r.startsWith("## "));
    data.senasteRon = (ronder[ronder.length - 1] || "").slice(0, 150);
  } catch { data.senasteRon = "okänd"; }

  return data;
}

// ── Uppdatera poster ────────────────────────────────────────────────────────

async function uppdatera(d) {
  // Hämta befintliga poster
  const lista = await fetch(`${BS_BASE}/todo?space=${SPACE_ID}`, { headers: H_BS });
  const poster = await lista.json();
  const befintliga = new Map(poster.map((p) => [p.title, p.id]));

  const NYA = [
    { title: "🌐 Sajt-status", note: `HTTP ${d.siteStatus} ${d.siteStatus === 200 ? "✓" : "⚠️"} | Prod-bygg: ${d.bygg} | develop: ${d.develop} | UPPDATERAD: ${d.nu}` },
    { title: "📚 Innehållstillväxt", note: `Kurser: ${d.kurser} | Quiz: ${d.quiz} | Tre språk: sv/en/ar | UPPDATERAD: ${d.nu}` },
    { title: "🤖 Organismens senaste", note: `${d.senasteRon} | UPPDATERAD: ${d.nu}` },
  ];

  for (const ny of NYA) {
    if (befintliga.has(ny.title)) {
      const id = befintliga.get(ny.title);
      await fetch(`${BS_BASE}/todo/${id}`, {
        method: "PUT", headers: H_BS,
        body: JSON.stringify({ note: ny.note }),
      });
      console.log(`✅ Uppdaterad: ${ny.title}`);
    } else {
      await fetch(`${BS_BASE}/todo`, {
        method: "POST", headers: H_BS,
        body: JSON.stringify({ title: ny.title, note: ny.note, spaceId: SPACE_ID }),
      });
      console.log(`✅ Skapad: ${ny.title}`);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
const d = await hamtaData();
await uppdatera(d);
console.log(`\nÖgon uppdaterade kl ${d.nu}. Kundens dashboard är färsk.`);
