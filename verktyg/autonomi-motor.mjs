#!/usr/bin/env node
// AUTONOMI-MOTOR v2 — Ren JavaScript (arbetsstation 2, 2026-10-03)

const SSD_IP = "208.87.129.108";
const SAJT = "https://lab.ak1nvestor.com/";
const DNS_TIDSLIMIT = 2 * 60 * 1000;
const ONECOM_USER = process.env.ONECOM_USER || "";
const ONECOM_PASS = process.env.ONECOM_PASS || "";
const BS_KEY = process.env.BS_API_KEY || "";
const BS_LOGG = 25;
const SSD_API = "https://api.ssdnodes.com";
const SSD_KEY = process.env.SSDNODES_API_KEY || "";
const VM_ID = 51100;
const DNS_A_ID = "36511130";
const VERCEL_IP = "76.76.21.21";
const DOMAIN = "ak1nvestor.com";

const state = {
  pingHistorik: [],
  nuvarandeMal: "ssdnodes",
  nedbordjup: 0,
  omstarter: 0,
  dnsByten: 0,
};

async function pingSajt() {
  try {
    const r = await fetch(SAJT, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    return r.status;
  } catch { return 0; }
}

let cookieJar = new Map();

function extractCookies(res) {
  for (const c of (res.headers.getSetCookie?.() || [])) {
    const [kv] = c.split(";");
    const eq = kv.indexOf("=");
    if (eq > 0) cookieJar.set(kv.slice(0, eq).trim(), kv.slice(eq + 1).trim());
  }
}

function cookieString() {
  return [...cookieJar.entries()].map(([k, v]) => k + "=" + v).join("; ");
}

async function oneFetch(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { ...init.headers, Cookie: cookieString() },
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
  });
  extractCookies(res);
  return res;
}

async function bytDNS(mal) {
  const ip = mal === "ssdnodes" ? SSD_IP : VERCEL_IP;
  try {
    cookieJar.clear();
    let url = "https://www.one.com/admin/";
    let res;
    for (let i = 0; i < 15; i++) {
      res = await oneFetch(url);
      const loc = res.headers.get("location");
      if (!loc) break;
      url = new URL(loc, url).href;
    }
    const html = await res.text();
    const formMatch = html.match(/action="([^"]+)"/);
    if (!formMatch) throw new Error("login ej hittat");
    res = await oneFetch(formMatch[1].replace(/&amp;/g, "&"), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: ONECOM_USER, password: ONECOM_PASS, credentialId: "" }),
    });
    let loc = res.headers.get("location");
    let count = 0;
    while (loc && count < 15) {
      res = await oneFetch(new URL(loc, url).href);
      loc = res.headers.get("location");
      if (!loc && res.status === 200) break;
      count++;
    }
    await oneFetch("https://www.one.com/admin/select-admin-domain.do?domain=" + DOMAIN);
    await oneFetch(
      "https://www.one.com/admin/api/domains/" + DOMAIN + "/dns/custom_records/" + DNS_A_ID,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "dns_custom_records",
          id: DNS_A_ID,
          attributes: { type: "A", prefix: "lab", content: ip, ttl: 300 },
        }),
      }
    );
    state.nuvarandeMal = mal;
    state.dnsByten++;
    console.log("✅ DNS bytt till " + mal + " (" + ip + ")");
  } catch (e) {
    console.error("❌ DNS fel:", e.message);
  }
}

async function startaOmSSD() {
  try {
    const r = await fetch(SSD_API + "/servers/" + VM_ID + "/action/restart", {
      method: "POST",
      headers: { Authorization: "Bearer " + SSD_KEY, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
    });
    state.omstarter++;
    console.log("  → Omstart #" + state.omstarter);
  } catch (e) {
    console.error("  → Omstart fel:", e.message);
  }
}

async function logga(med) {
  try {
    await fetch("https://ak1nvestor.boost.space/api/todo", {
      method: "POST",
      headers: { Authorization: "Bearer " + BS_KEY, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ title: "🖥️ " + new Date().toISOString().slice(11, 16) + " " + med, note: med + " | v2", spaceId: BS_LOGG }),
    });
  } catch {}
}

async function vaktCykel() {
  const status = await pingSajt();
  const lever = status === 200;
  state.pingHistorik.push({ tid: Date.now(), ok: lever });
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  state.pingHistorik = state.pingHistorik.filter((p) => p.tid > cutoff);
  if (lever) {
    state.nedbordjup = 0;
    if (state.nuvarandeMal === "vercel") {
      console.log("\n✅ Tillbaka → SSDNodes");
      await bytDNS("ssdnodes");
      await logga("✅ Server tillbaka — DNS till SSDNodes");
    }
    process.stdout.write(".");
  } else {
    state.nedbordjup += 60000;
    console.log("\n🚨 NERE (" + Math.round(state.nedbordjup / 1000) + "s)");
    if (state.nedbordjup === 60000) {
      await startaOmSSD();
      await logga("🚨 Omstart #" + state.omstarter);
    }
    if (state.nedbordjup >= DNS_TIDSLIMIT && state.nuvarandeMal === "ssdnodes") {
      await bytDNS("vercel");
      await logga("🔄 DNS → VERCEL");
    }
  }
}

async function rapport() {
  if (state.pingHistorik.length < 10) return;
  const ok = state.pingHistorik.filter((p) => p.ok).length;
  const pct = Math.round((ok / state.pingHistorik.length) * 100);
  console.log("\n📊 Uptime: " + pct + "% | " + state.omstarter + " omstarter | " + state.dnsByten + " växlingar");
}

console.log("═══ AUTONOMI-MOTOR v2 ═══");
console.log("Vakt: 60s | DNS-gräns: " + DNS_TIDSLIMIT / 1000 + "s | Mål: " + state.nuvarandeMal + "\n");

setInterval(async () => { try { await vaktCykel(); } catch (e) { console.error("Fel:", e.message); } }, 60000);
setInterval(async () => { try { await rapport(); } catch {} }, 15 * 60 * 1000);
setInterval(() => {
  const ok = state.pingHistorik.filter((p) => p.ok).length;
  const pct = state.pingHistorik.length > 0 ? Math.round((ok / state.pingHistorik.length) * 100) : 0;
  console.log("\n📊 " + pct + "% | " + state.omstarter + " omstart | " + state.dnsByten + " växl | " + state.nuvarandeMal);
}, 5 * 60 * 1000);

await vaktCykel();
