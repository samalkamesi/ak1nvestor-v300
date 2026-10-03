#!/usr/bin/env node
/**
 * SERVER-VAKTEN 24/7 — garanterar att sajten ALDRIG dör (arbetsstation 2, 2026-10-03)
 * =====================================================================
 * Kundens direktdirektiv: "låt den aldrig sova — det är ditt ansvar att
 * garantera 24/7 online server — använd full autonomi utan att ens vänta."
 *
 * Denna vakt körs av organismens pumpor (var 60:e sekund) och:
 *   1. Pingar sajten (https://lab.ak1nvestor.com/)
 *   2. Vid 502/000/timeout → omedelbar omstart via SSDNodes API
 *   3. Loggar varje incident i Boost.space (händelseloggen)
 *   4. Efter 3 omstarter inom 30 min → larm-notis (via mejlkedjan när aktiv)
 *
 * Omstart-policy: INGEN VÄNTAN. Vid död = omstart direkt.
 * "Another action in progress" = vänta 60s → försök igen (max 5 försök).
 *
 * Användning: node verktyg/server-vakten.mjs (eller --test för torrkörning)
 * Krav: SSDNODES_API_KEY + BS_API_KEY + BS_LOGG_SPACE i miljön
 *
 * Mimosa: fasta https-värdar; nycklar från env; aldrig logga nycklar.
 */

const SSD_API = "https://api.ssdnodes.com";
const SSD_KEY = process.env.SSDNODES_API_KEY || "";
const VM_ID = parseInt(process.env.SSDNODES_VM_ID || "51100", 10);
const SAJT = "https://lab.ak1nvestor.com/";
const BS_BASE = process.env.BS_BASE_URL || "https://ak1nvestor.boost.space/api";
const BS_KEY = process.env.BS_API_KEY || "";
const BS_LOGG = parseInt(process.env.BS_LOGG_SPACE || "25", 10);
const H_BS = { "Authorization": `Bearer ${BS_KEY}`, "Content-Type": "application/json", "Accept": "application/json" };

// Tillstånd
const state = {
  omstarterSenaste30Min: [],
  senasteKoll: null,
  serverLev: false,
};

// ── 1. Pinga sajten ─────────────────────────────────────────────────────────
async function pinga() {
  try {
    const r = await fetch(SAJT, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    return r.status;
  } catch {
    return 0; // nätverksfel/timeout
  }
}

// ── 2. Starta om via SSDNodes API ────────────────────────────────────────────
async function startaOm(forsok = 1) {
  if (forsok > 5) {
    console.error("VAKT: 5 misslyckade omstartsförsök — ger upp (kontakta kund)");
    await logga("🔴 VAKT: 5 omstartsförsök misslyckades — manuell åtgärd krävs");
    return false;
  }

  const r = await fetch(`${SSD_API}/servers/${VM_ID}/action/restart`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${SSD_KEY}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(30000),
  }).catch(() => null);

  if (!r) {
    console.log(`VAKT: omstart-försök ${forsok}: nätverksfel — försök igen om 60s`);
    await new Promise((s) => setTimeout(s, 60000));
    return startaOm(forsok + 1);
  }

  const j = await r.json().catch(() => ({}));

  if (j.status === "error" && j.msg?.includes("Another action")) {
    console.log(`VAKT: annan åtgärd pågår — väntar 60s (försök ${forsok})`);
    await new Promise((s) => setTimeout(s, 60000));
    return startaOm(forsok + 1);
  }

  if (j.status === "success" || r.status === 200) {
    console.log(`VAKT: ✅ omstart beordrad (försök ${forsok})`);
    state.omstarterSenaste30Min.push(Date.now());
    // Rensa gamla (>30 min)
    state.omstarterSenaste30Min = state.omstarterSenaste30Min.filter(
      (t) => Date.now() - t < 30 * 60 * 1000
    );
    return true;
  }

  console.log(`VAKT: oväntat svar: HTTP ${r.status} — försök igen om 60s`);
  await new Promise((s) => setTimeout(s, 60000));
  return startaOm(forsok + 1);
}

// ── 3. Logga i Boost.space ──────────────────────────────────────────────────
async function logga(meddelande) {
  if (!BS_KEY) return;
  await fetch(`${BS_BASE}/todo`, {
    method: "POST", headers: H_BS,
    body: JSON.stringify({
      title: `🖥️ ${new Date().toISOString().slice(0, 16)} ${meddelande.slice(0, 60)}`,
      note: `${meddelande} | Vakten: automatisk 24/7 serverbevakning`,
      spaceId: BS_LOGG,
    }),
  }).catch(() => {}); // loggning får ALDRIG krascha vakten
}

// ── 4. Vänta på återhämtning (max 10 min) ───────────────────────────────────
async function vantaAterhamtning() {
  for (let i = 0; i < 20; i++) {
    await new Promise((s) => setTimeout(s, 30000)); // 30 s mellan koll
    const status = await pinga();
    if (status === 200) {
      console.log(`VAKT: ✅ servern tillbaka efter ${(i + 1) * 30}s`);
      await loga("✅ Servern återställd automatiskt av vakten");
      return true;
    }
  }
  console.log("VAKT: servern kom inte tillbaka inom 10 min — försöker igen");
  return false;
}

// ── Main: en vakt-cykel ─────────────────────────────────────────────────────
async function vaktCykel() {
  const status = await pinga();
  state.senasteKoll = new Date().toISOString();
  state.serverLev = status === 200;

  if (state.serverLev) {
    process.stdout.write("."); // lever — tyst signal
    return;
  }

  // Servern död — agera DIRECT utan väntan
  console.log(`\n🚨 VAKT: servern NERE (HTTP ${status}) — startar om DIRECT`);

  // 3+ omstarter inom 30 min = misstänkt mönster
  if (state.omstarterSenaste30Min.length >= 3) {
    console.log("⚠️ VAKT: 3+ omstarter inom 30 min — upprepat problem");
    await loga(`⚠️ Upprepat problem: ${state.omstarterSenaste30Min.length} omstarter inom 30 min. Server kan behöva manuell granskning.`);
  }

  const omstartOk = await startaOm();
  if (omstartOk) {
    await logga(`🚨 Serverdöd upptäckt (HTTP ${status}) → omstart beordrad automatiskt`);
    const tillbaka = await vantaAterhamtning();
    if (!tillbaka) {
      // Försök en gång till
      await startaOm();
      await vantaAterhamtning();
    }
  }
}

// ── Körning ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes("--test")) {
  console.log("── SERVER-VAKTEN: TORRKÖRNING ──");
  const status = await pinga();
  console.log(`Sajt-status: HTTP ${status}`);
  console.log(`Server lever: ${status === 200}`);
  console.log(`SSDNodes API: ${SSD_KEY ? "nyckel satt ✓" : "SAKNAS!"}`);
  console.log(`Boost.space: ${BS_KEY ? "nyckel satt ✓" : "SAKNAS!"}`);
  console.log(`VM-ID: ${VM_ID}`);
  if (status !== 200) {
    console.log("⚠️ Servern är NERE just nu — omstart skulle triggas.");
  }
  process.exit(0);
}

// Kontinuerlig drift (organismen startar denna som bakgrundsprocess)
const INTERVALL_MS = parseInt(process.env.VAKT_INTERVALL_MS || "60000", 10);
console.log(`── SERVER-VAKTEN 24/7 STARTAD (var ${INTERVALL_MS / 1000}s) ──`);
setInterval(async () => {
  try {
    await vaktCykel();
  } catch (e) {
    console.error("VAKT-fel (fortsätter):", e.message?.slice(0, 100));
  }
}, INTERVALL_MS);

// Kör första cykeln direkt
await vaktCykel();
