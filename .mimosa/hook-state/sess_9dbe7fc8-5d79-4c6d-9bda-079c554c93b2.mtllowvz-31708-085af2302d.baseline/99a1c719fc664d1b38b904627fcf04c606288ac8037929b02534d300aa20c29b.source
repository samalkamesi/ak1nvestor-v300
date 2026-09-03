/**
 * AK1A Autonom Organ-motor — BOUNDED edition.
 *
 * Designregler (lärda av 2026-08-kollapsen då ett obegränsat organsystem
 * skrev 17,7M rader och slog ut databasen):
 *
 * 1. KILL SWITCH   — AUTONOM_DISABLED=1 → hela motorn gör ingenting.
 * 2. HÅRT TAK      — max 500 loggrader totalt, raderas automatiskt vid varje körning.
 * 3. ÅLDERSTAKT    — loggrader äldre än 30 dagar raderas vid varje körning.
 * 4. EN SKRIVNING  — högst EN loggrad per körning (cron 1×/dag ⇒ ≤365 rader/år).
 * 5. TILLSTÅNDSLÖS — varje organ är idempotent och beräknas från grunden; inga loopar
 *                    som ackumulerar, ingen obegränsad tillväxt någonstans.
 * 6. FAIL-SAFE     — Supabase är VALFRITT: utan konfig körs organen ändå (ren rapport).
 */

import { getSupabaseRest } from "@/lib/supabase-rest";

export type OrganFinding = {
  organ: string;
  status: "ok" | "warning" | "error";
  message: string;
  metric?: string;
};

export type OrganReport = {
  timestamp: string;
  overall: "healthy" | "needs_attention" | "critical";
  findings: OrganFinding[];
  decisions: string[];
  retention: { deletedOld: number; cappedRows: number } | null;
  killSwitch: boolean;
};

const MAX_LOG_ROWS = 500;
const MAX_LOG_AGE_DAYS = 30;
const LOG_TABLE = "system_events";
const ACTIVITY_MAX_AGE_DAYS = 90;

// ── Organ 1: HÄLSA — integritet i statiskt innehåll ────────────────────────

function organHealth(readJson: (p: string) => string | null): OrganFinding[] {
  const out: OrganFinding[] = [];
  try {
    const tasks = JSON.parse(readJson("data/export/mega-tasks.json") || "[]");
    out.push({
      organ: "Hälsa",
      status: tasks.length === 198 ? "ok" : "warning",
      message: `Mega Tasks: ${tasks.length} uppgifter`,
      metric: `${tasks.length}/198`,
    });
  } catch {
    out.push({ organ: "Hälsa", status: "error", message: "mega-tasks.json oläslig" });
  }
  try {
    const courses = JSON.parse(readJson("public/deep-courses.json") || "{}");
    const total = Object.keys(courses).length;
    let shallow = 0;
    for (const c of Object.values(courses) as any[]) {
      const chars =
        c.chapters?.reduce(
          (s: number, ch: any) => s + (ch.blocks?.reduce((s2: number, b: any) => s2 + (b.content?.length || 0), 0) || 0),
          0
        ) || 0;
      if (chars < 5000) shallow++;
    }
    out.push({
      organ: "Hälsa",
      status: shallow > 0 ? "warning" : "ok",
      message: `${total} kurser, ${shallow} grunda (<5000 tecken)`,
      metric: `${total - shallow}/${total} djupa`,
    });
  } catch {
    out.push({ organ: "Hälsa", status: "error", message: "deep-courses.json oläslig" });
  }
  return out;
}

// ── Organ 2: SEO — sökbarhet och färskhet ──────────────────────────────────

function organSeo(readJson: (p: string) => string | null, listDir: (p: string) => string[]): OrganFinding[] {
  const out: OrganFinding[] = [];
  try {
    const posts = listDir("data/blogg").filter((f) => f.endsWith(".json"));
    let latest = "";
    for (const f of posts) {
      try {
        const p = JSON.parse(readJson(`data/blogg/${f}`) || "{}");
        if (p.publishedAt && p.publishedAt > latest) latest = p.publishedAt;
      } catch {}
    }
    const days = latest ? Math.floor((Date.now() - Date.parse(latest)) / 86400_000) : 999;
    out.push({
      organ: "SEO",
      status: days <= 7 ? "ok" : days <= 30 ? "warning" : "error",
      message: `${posts.length} blogginlägg, senaste ${days} dagar sedan`,
      metric: `${posts.length} inlägg`,
    });
  } catch {
    out.push({ organ: "SEO", status: "warning", message: "Bloggdata ej läsbar" });
  }
  try {
    const analyses = listDir("data/analyses").filter((f) => f.endsWith(".json"));
    let stale = 0;
    for (const f of analyses) {
      try {
        const a = JSON.parse(readJson(`data/analyses/${f}`) || "{}");
        const d = a.analysisDate ? Date.parse(a.analysisDate) : 0;
        if (Date.now() - d > 183 * 86400_000) stale++;
      } catch {}
    }
    out.push({
      organ: "SEO",
      status: stale === 0 ? "ok" : "warning",
      message: `${analyses.length} analyser, ${stale} äldre än 6 månader`,
      metric: `${stale} föråldrade`,
    });
  } catch {
    out.push({ organ: "SEO", status: "warning", message: "Analysdata ej läsbar" });
  }
  return out;
}

// ── Organ 3: INNEHÅLL — nästa förbättring ─────────────────────────────────

function organContent(readJson: (p: string) => string | null): OrganFinding[] {
  const out: OrganFinding[] = [];
  try {
    const courses = JSON.parse(readJson("public/deep-courses.json") || "{}");
    let worst: { slug: string; chars: number } | null = null;
    for (const [slug, c] of Object.entries(courses) as [string, any][]) {
      const chars =
        c.chapters?.reduce(
          (s: number, ch: any) => s + (ch.blocks?.reduce((s2: number, b: any) => s2 + (b.content?.length || 0), 0) || 0),
          0
        ) || 0;
      if (!worst || chars < worst.chars) worst = { slug, chars };
    }
    if (worst) {
      out.push({
        organ: "Innehåll",
        status: worst.chars < 5000 ? "warning" : "ok",
        message: `Grundaste kurs: ${worst.slug} (${worst.chars} tecken) — nästa expansionskandidat`,
        metric: `${worst.chars} tecken`,
      });
    }
  } catch {
    out.push({ organ: "Innehåll", status: "error", message: "Kursdata oläslig" });
  }
  return out;
}

// ── Organ 4: RETENTION — den självrengörande vakten ────────────────────────

async function organRetention(
  sb: { origin: string; headers: Record<string, string> } | null
): Promise<{ deletedOld: number; cappedRows: number } | null> {
  if (!sb) return null;
  let deletedOld = 0;
  let cappedRows = 0;
  const cutoff = new Date(Date.now() - MAX_LOG_AGE_DAYS * 86400_000).toISOString();

  const tryFetch = async (url: string, init?: RequestInit) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    try {
      return await fetch(url, { ...init, signal: ctrl.signal });
    } finally {
      clearTimeout(t);
    }
  };

  // 0. Sidvisningsloggen: radera äldre än 90 dagar (bounded tracking)
  try {
    const cut90 = new Date(Date.now() - ACTIVITY_MAX_AGE_DAYS * 86400_000).toISOString();
    await tryFetch(`${sb.origin}/rest/v1/user_activities?created_at=lt.${cut90}&select=id`, {
      headers: { ...sb.headers, Prefer: "return=representation" },
    }).then(async (res) => {
      if (res.ok) {
        const rows = await res.json();
        if (rows?.length) {
          const ids = rows.map((r: any) => r.id).join(",");
          await tryFetch(`${sb.origin}/rest/v1/user_activities?id=in.(${ids})`, {
            method: "DELETE",
            headers: { ...sb.headers, Prefer: "return=minimal" },
          });
        }
      }
    });
  } catch {}

  // 1. Radera äldre än åldertaket (ignorera fel — tabellen kanske inte finns ännu)
  try {
    const res = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?created_at=lt.${cutoff}&select=id`, {
      headers: { ...sb.headers, Prefer: "return=representation" },
    });
    if (res.ok) {
      const rows = await res.json();
      if (rows?.length) {
        const ids = rows.map((r: any) => r.id).join(",");
        const del = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?id=in.(${ids})`, {
          method: "DELETE",
          headers: { ...sb.headers, Prefer: "return=minimal" },
        });
        if (del.ok) deletedOld = rows.length;
      }
    }
  } catch {}

  // 2. Hårt tak: om fler än MAX_LOG_ROWS — radera äldsta överskottet
  try {
    const res = await tryFetch(
      `${sb.origin}/rest/v1/${LOG_TABLE}?select=id&order=created_at.desc&limit=${MAX_LOG_ROWS}`,
      { headers: sb.headers }
    );
    if (res.ok) {
      const keep = await res.json();
      if (keep?.length >= MAX_LOG_ROWS) {
        const keepIds = new Set(keep.map((r: any) => String(r.id)));
        const allRes = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?select=id&order=created_at.asc&limit=1000`, {
          headers: sb.headers,
        });
        if (allRes.ok) {
          const all = await allRes.json();
          const excess = (all || []).filter((r: any) => !keepIds.has(String(r.id)));
          if (excess.length) {
            const ids = excess.map((r: any) => r.id).join(",");
            const del = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?id=in.(${ids})`, {
              method: "DELETE",
              headers: { ...sb.headers, Prefer: "return=minimal" },
            });
            if (del.ok) cappedRows = excess.length;
          }
        }
      }
    }
  } catch {}

  return { deletedOld, cappedRows };
}

// ── Huvudmotor ──────────────────────────────────────────────────────────────

export async function runOrgans(io: {
  readJson: (p: string) => string | null;
  listDir: (p: string) => string[];
}): Promise<OrganReport> {
  if (process.env.AUTONOM_DISABLED === "1") {
    return {
      timestamp: new Date().toISOString(),
      overall: "healthy",
      findings: [{ organ: "Kill-switch", status: "ok", message: "AUTONOM_DISABLED=1 — motorn är avstängd" }],
      decisions: [],
      retention: null,
      killSwitch: true,
    };
  }

  const findings = [
    ...organHealth(io.readJson),
    ...organSeo(io.readJson, io.listDir),
    ...organContent(io.readJson),
  ];

  const errors = findings.filter((f) => f.status === "error").length;
  const warnings = findings.filter((f) => f.status === "warning").length;
  const overall: OrganReport["overall"] = errors > 0 ? "critical" : warnings > 0 ? "needs_attention" : "healthy";

  const decisions: string[] = [];
  for (const f of findings) {
    if (f.status === "warning" && f.organ === "Innehåll") decisions.push("Kör expand-courses för grundaste kursen");
    if (f.status === "warning" && f.organ === "SEO") decisions.push("Publicera nytt blogginlägg / uppdatera analys");
    if (f.status === "error") decisions.push(`Åtgärda: ${f.message}`);
  }
  if (decisions.length === 0) decisions.push("Systemet optimalt — ingen åtgärd krävs");

  const sb = getSupabaseRest();
  const retention = await organRetention(sb);

  // EN loggrad per körning — bounded write (endast om Supabase + tabell finns)
  if (sb) {
    try {
      await fetch(`${sb.origin}/rest/v1/${LOG_TABLE}`, {
        method: "POST",
        headers: { ...sb.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          type: "autonom_report",
          severity: overall === "healthy" ? "info" : overall === "needs_attention" ? "warning" : "error",
          message: `Organrapport: ${overall} (${errors} fel, ${warnings} varningar)`,
          details: { findings, decisions },
          source: "cron/autonom",
        }),
      });
    } catch {}
  }

  return { timestamp: new Date().toISOString(), overall, findings, decisions, retention, killSwitch: false };
}

/** Läser senaste loggraderna (för /api/autonom/status). */
export async function recentOrganLogs(limit = 20) {
  const sb = getSupabaseRest();
  if (!sb) return [];
  try {
    const res = await fetch(
      `${sb.origin}/rest/v1/${LOG_TABLE}?type=eq.autonom_report&select=type,severity,message,created_at&order=created_at.desc&limit=${limit}`,
      { headers: sb.headers, next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
