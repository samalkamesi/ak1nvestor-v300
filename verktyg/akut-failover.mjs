#!/usr/bin/env node
/**
 * AKUT-FAILOVER: SSDNodes → Vercel via one.com DNS (arbetsstation 2, 2026-10-03)
 * =====================================================================
 * Kundens direktdirektiv: "låt den aldrig sova — full autonomi utan väntan."
 *
 * Systemet:
 *   1. Server-vakten pingar lab.ak1nvestor.com var 60:e sekund
 *   2. Vid serverdöd → logga in på one.com → byt A-record till Vercel
 *   3. Vid återhämtning → byt A-record tillbaka till SSDNodes
 *
 * Allt automatiskt. Ingen människa. Allt loggat i Boost.space.
 *
 * Användning: node verktyg/akut-failover.mjs (kombineras med server-vakten)
 * Krav: ONECOM_USER + ONECOM_PASS + SSDNODES_API_KEY i miljön
 */

// ── Konfiguration ────────────────────────────────────────────────────────────
const ONECOM_USER = process.env.ONECOM_USER || "";
const ONECOM_PASS = process.env.ONECOM_PASS || "";
const DOMAIN = "ak1nvestor.com";
const SUBDOMAIN = "lab";

// DNS-post-ID:n (från one.com API — verifierade 2026-10-03)
const DNS_A_RECORD_ID = "36511130";      // lab → A → 208.87.129.108
const SSDNODES_IP = "208.87.129.108";
const VERCEL_IP = "76.76.21.21";         // Vercel anycast

// Tillstånd
let cookieJar = new Map();
let currentTarget = "ssdnodes"; // eller "vercel"

// ── one.com session-hantering ───────────────────────────────────────────────
function extractCookies(res) {
  for (const c of (res.headers.getSetCookie?.() || [])) {
    const [kv] = c.split(";");
    const eq = kv.indexOf("=");
    if (eq > 0) cookieJar.set(kv.slice(0, eq).trim(), kv.slice(eq + 1).trim());
  }
}

function cookieString() {
  return [...cookieJar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function oneFetch(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      Cookie: cookieString(),
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    signal: AbortSignal.timeout(20000),
  });
  extractCookies(res);
  return res;
}

// ── Steg 1: Logga in på one.com ──────────────────────────────────────────────
async function loggaIn() {
  cookieJar.clear();
  console.log("  Loggar in på one.com...");

  // Navigera till login-sidan
  let url = "https://www.one.com/admin/";
  let res;
  for (let i = 0; i < 15; i++) {
    res = await oneFetch(url, { redirect: "manual" });
    const loc = res.headers.get("location");
    if (!loc) break;
    url = new URL(loc, url).href;
  }
  const html = await res.text();
  const formMatch = html.match(/action="([^"]+)"/);
  if (!formMatch) throw new Error("kunde ej hitta login-formulär");
  const actionUrl = formMatch[1].replace(/&amp;/g, "&");

  // POST inloggning
  res = await oneFetch(actionUrl, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: ONECOM_USER, password: ONECOM_PASS, credentialId: "" }),
  });

  // Följ OIDC-callbacks
  let loc = res.headers.get("location");
  let count = 0;
  while (loc && count < 15) {
    count++;
    const fullUrl = new URL(loc, url).href;
    res = await oneFetch(fullUrl, { redirect: "manual" });
    loc = res.headers.get("location");
    if (!loc && res.status === 200) break;
  }

  if (res.status !== 200) throw new Error(`inloggning misslyckades (sista status: ${res.status})`);

  // Välj domän
  await oneFetch(`https://www.one.com/admin/select-admin-domain.do?domain=${DOMAIN}`);
  console.log("  ✅ Inloggad på one.com");
}

// ── Steg 2: Byt A-record ────────────────────────────────────────────────────
async function bytARecord(ip) {
  console.log(`  Byter A-record till ${ip}...`);
  const res = await oneFetch(
    `https://www.one.com/admin/api/domains/${DOMAIN}/dns/custom_records/${DNS_A_RECORD_ID}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        type: "dns_custom_records",
        id: DNS_A_RECORD_ID,
        attributes: { type: "A", prefix: SUBDOMAIN, content: ip, ttl: 600 },
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`A-record-byte misslyckades: HTTP ${res.status} ${text.slice(0, 100)}`);
  }
  console.log(`  ✅ A-record bytt till ${ip}`);
}

// ── Steg 3: Pinga sajten ────────────────────────────────────────────────────
async function pinga() {
  try {
    const r = await fetch("https://lab.ak1nvestor.com/", { method: "HEAD", signal: AbortSignal.timeout(8000) });
    return r.status;
  } catch { return 0; }
}

// ── Huvudlogik ───────────────────────────────────────────────────────────────
export async function aktiveraVercel() {
  await loggaIn();
  await bytARecord(VERCEL_IP);
  currentTarget = "vercel";
}

export async function atergardSSDNodes() {
  await loggaIn();
  await bytARecord(SSDNODES_IP);
  currentTarget = "ssdnodes";
}

export async function failoverCykel() {
  const status = await pinga();
  const lever = status === 200;

  if (!lever && currentTarget === "ssdnodes") {
    console.log(`🚨 Servern NERE (HTTP ${status}) — bytar till Vercel`);
    try {
      await aktiveraVercel();
      console.log("✅ DNS pekar nu mot Vercel — sajten lever!");
    } catch (e) {
      console.error("❌ Failover misslyckades:", e.message);
    }
  } else if (lever && currentTarget === "vercel") {
    console.log("✅ Servern tillbaka — bytar tillbaka till SSDNodes");
    try {
      await atergardSSDNodes();
      console.log("✅ DNS pekar nu mot SSDNodes igen");
    } catch (e) {
      console.error("❌ Återgång misslyckades:", e.message);
    }
  }

  return { lever, status, target: currentTarget };
}

// ── CLI-körning ──────────────────────────────────────────────────────────────
if (process.argv[1]?.includes("akut-failover")) {
  const args = process.argv.slice(2);

  if (args.includes("--vercel")) {
    console.log("── Tvinga failover till Vercel ──");
    await aktiveraVercel();
  } else if (args.includes("--ssdnodes")) {
    console.log("── Tvinga tillbaka till SSDNodes ──");
    await atergardSSDNodes();
  } else if (args.includes("--status")) {
    const s = await pinga();
    console.log(`Sajt: HTTP ${s} | DNS pekar mot: ${currentTarget}`);
  } else {
    console.log("── AKUT-FAILOVER TEST ──");
    const s = await pinga();
    console.log(`Sajt-status: HTTP ${s}`);
    console.log(`Läge: ${currentTarget}`);
    console.log("\nAnvändning:");
    console.log("  --vercel    : byt till Vercel (akut)");
    console.log("  --ssdnodes  : byt tillbaka (återhämtning)");
    console.log("  --status    : visa aktuell status");
  }
}
