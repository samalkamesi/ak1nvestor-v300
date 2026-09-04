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
//
// Typ-scopade tak (VÅG 50): trafikmätningen (type=trafik) och säkerhets-
// loggen (type=sakerhet) behöver ÖVERLEVA 30 dagar för admin-panelens
// 7/30-d-aggregat — tidigare kunde det globala 500-radstaket radera
// dagens trafik samma natt. Filosofin från 2026-08-kollapsen (17,7M rader)
// består: varje scope har fortfarande ett HÅRT radtak + ålderstak, bara
// nivåerna differentieras per syfte:
//   övrigt    : 500 rader / 30 dagar  (oförändrat — organ/autonomi/styrelse)
//   trafik    : 12 000 rader / 35 dagar (stickprov 30 % + bot-dedupe)
//   sakerhet  : 3 000 rader / 35 dagar (en rad per blockering)
//   oversattning (VÅG 55 L1): 45 000 rader / INGET ålderstak — MÖS-lagrets
//     system_events-backend (src/lib/oversattning/lager.ts) sparar
//     översättningar här när tabellen oversattningar saknas. Publicerade
//     översättningar ska BESTÅ tills de ersätts, därför gäller i stället:
//     (a) äldsta DUBLETTRADER (samma details->>scope_nyckel + sprak —
//         behåll SENASTE raden) raderas FÖRST, (b) därefter stympas vid
//         överkott äldsta rader med status != 'publicerad', (c) sist äldsta
//         publicerade. 17,7M-kollapsen får ALDRIG upprepas: hårt tak + ingen
//         okontrollerad tillväxt (cron-ronden skriver batchvis, dedupe i
//         lasSpara + denna städrunda håller raderna ≈ registrets storlek).

const MAX_ANTAL_TRAFIK = 12_000;
const MAX_ANTAL_SAKERHET = 3_000;
const MAX_ANTAL_OVERSATTNING = 45_000;
const MAX_ALDER_TYP_DAGAR = 35;
/** Tak för MÖS-städningen per körning: 50 sidor à 1 000 rader + 5 000 raderade. */
const MOS_STAD_MAX_Sidor = 50;
const MOS_STAD_MAX_RADERA = 5_000;

async function organRetention(
  sb: { origin: string; headers: Record<string, string> } | null
): Promise<{ deletedOld: number; cappedRows: number } | null> {
  if (!sb) return null;
  let deletedOld = 0;
  let cappedRows = 0;

  const tryFetch = async (url: string, init?: RequestInit) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    try {
      return await fetch(url, { ...init, signal: ctrl.signal });
    } finally {
      clearTimeout(t);
    }
  };

  /** Raderar inom ett typfilter som är äldre än `dagar` — returnerar antal. */
  const rakraAldring = async (typFilter: string, dagar: number): Promise<number> => {
    try {
      const cut = new Date(Date.now() - dagar * 86400_000).toISOString();
      const res = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?created_at=lt.${cut}&${typFilter}&select=id`, {
        headers: { ...sb.headers, Prefer: "return=representation" },
      });
      if (!res.ok) return 0;
      const rows = await res.json();
      if (!rows?.length) return 0;
      const ids = rows.map((r: any) => r.id).join(",");
      const del = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?id=in.(${ids})`, {
        method: "DELETE",
        headers: { ...sb.headers, Prefer: "return=minimal" },
      });
      return del.ok ? rows.length : 0;
    } catch {
      return 0;
    }
  };

  /** Hårt radtak inom ett typfilter — raderar äldsta överskottet. */
  const raknaTak = async (typFilter: string, tak: number): Promise<number> => {
    try {
      const countRes = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?${typFilter}&select=id`, {
        method: "HEAD",
        headers: { ...sb.headers, Prefer: "count=planned" },
      });
      if (!countRes.ok) return 0;
      const antal = Number(countRes.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
      if (antal <= tak) return 0;
      const overskott = antal - tak;
      const res = await tryFetch(
        `${sb.origin}/rest/v1/${LOG_TABLE}?${typFilter}&select=id&order=created_at.asc&limit=${overskott}`,
        { headers: sb.headers }
      );
      if (!res.ok) return 0;
      const rows = await res.json();
      if (!rows?.length) return 0;
      const ids = rows.map((r: any) => r.id).join(",");
      const del = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?id=in.(${ids})`, {
        method: "DELETE",
        headers: { ...sb.headers, Prefer: "return=minimal" },
      });
      return del.ok ? rows.length : 0;
    } catch {
      return 0;
    }
  };

  /** Radera id-lista i bitar à 300 (URL-längd) — returnerar antal raderade. */
  const raderaIdn = async (ids: string[]): Promise<number> => {
    let antal = 0;
    for (let i = 0; i < ids.length; i += 300) {
      const bit = ids.slice(i, i + 300).join(",");
      try {
        const del = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?id=in.(${bit})`, {
          method: "DELETE",
          headers: { ...sb.headers, Prefer: "return=minimal" },
        });
        if (del.ok) antal += Math.min(300, ids.length - i);
      } catch { /* nästa bit */ }
    }
    return antal;
  };

  /**
   * MÖS-dubbeltröjning (VÅG 55 L1): event-lagret är append-only — läsningarna
   * låter SENASTE raden per (scope_nyckel, sprak) vinna, så äldre kopior är
   * ren vikt. Skanna nyast-först (created_at.desc — id är uuid-text, ej
   * kronologiskt!), behåll första förekomsten per nyckel, radera resten.
   * Begränsat per körning (MOS_STAD_MAX_Sidor/MAX_RADERA) — bounded, alltid.
   * OBS: råa filtervärden (aldrig citerade — se lager.ts våg 55-verifieringen).
   */
  const rensaMosDubletter = async (): Promise<number> => {
    try {
      const sedda = new Set<string>();
      const radera: string[] = [];
      for (let sida = 0; sida < MOS_STAD_MAX_Sidor; sida++) {
        const fran = sida * 1000;
        const res = await tryFetch(
          `${sb.origin}/rest/v1/${LOG_TABLE}?type=eq.oversattning` +
            `&select=id,details->>scope_nyckel,details->>sprak&order=created_at.desc`,
          { headers: { ...sb.headers, Range: `${fran}-${fran + 999}` } }
        );
        if (!res.ok) return 0;
        const rows = await res.json();
        if (!Array.isArray(rows) || rows.length === 0) break;
        for (const r of rows) {
          const nyckel = r?.scope_nyckel;
          const sprak = r?.sprak;
          const id = r?.id;
          if (typeof nyckel !== "string" || typeof sprak !== "string" || typeof id !== "string") continue;
          const k = nyckel + "\u0000" + sprak;
          if (sedda.has(k)) radera.push(id);
          else sedda.add(k);
        }
        if (rows.length < 1000) break;
        if (radera.length >= MOS_STAD_MAX_RADERA) break;
      }
      if (radera.length === 0) return 0;
      return await raderaIdn(radera);
    } catch {
      return 0;
    }
  };

  /**
   * MÖS-antalsstympning (VÅG 55 L1): överstiger type=oversattning 45 000
   * rader raderas först äldsta icke-publicerade (details->>status=neq.
   * publicerad — utkast/vantar/inaktuell är återvinningsbara via cron),
   * därefter — om överkott kvarstår — äldsta rader totalt. Körs EFTER
   * dubbeltröjningen (ersatta publicerade har då redan rensats som dubbletter).
   */
  const raknaTakMos = async (): Promise<number> => {
    try {
      const countRes = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?type=eq.oversattning&select=id`, {
        method: "HEAD",
        headers: { ...sb.headers, Prefer: "count=planned" },
      });
      if (!countRes.ok) return 0;
      const antal = Number(countRes.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
      if (antal <= MAX_ANTAL_OVERSATTNING) return 0;
      let overskott = antal - MAX_ANTAL_OVERSATTNING;
      let raderade = 0;
      // (b) äldsta icke-publicerade först
      const bRes = await tryFetch(
        `${sb.origin}/rest/v1/${LOG_TABLE}?type=eq.oversattning&details->>status=neq.publicerad` +
          `&select=id&order=created_at.asc&limit=${overskott}`,
        { headers: sb.headers }
      );
      if (bRes.ok) {
        const rows = await bRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const n = await raderaIdn(rows.map((r: any) => String(r?.id ?? "")).filter(Boolean));
          raderade += n;
          overskott -= n;
        }
      }
      // (c) återstår överkott: äldsta totalt (publicerade som följt med åldern)
      if (overskott > 0) {
        const cRes = await tryFetch(
          `${sb.origin}/rest/v1/${LOG_TABLE}?type=eq.oversattning&select=id&order=created_at.asc&limit=${overskott}`,
          { headers: sb.headers }
        );
        if (cRes.ok) {
          const rows = await cRes.json();
          if (Array.isArray(rows) && rows.length > 0) {
            raderade += await raderaIdn(rows.map((r: any) => String(r?.id ?? "")).filter(Boolean));
          }
        }
      }
      return raderade;
    } catch {
      return 0;
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

  // 1. Ålderstak, per scope. Ignorera fel — tabellen kanske inte finns ännu.
  //    OBS (våg 55 L1): oversattning-typerna har INGET ålderstak (publicerade
  //    översättningar består tills de ersätts) — de får sina egna regler i
  //    steg 3 och får alldrig träffas av övrigt-regeln.
  deletedOld += await rakraAldring("type=not.in.(trafik,sakerhet,oversattning)", MAX_LOG_AGE_DAYS);
  deletedOld += await rakraAldring("type=eq.trafik", MAX_ALDER_TYP_DAGAR);
  deletedOld += await rakraAldring("type=eq.sakerhet", MAX_ALDER_TYP_DAGAR);

  // 2. Hårta radtak, per scope (500 / 12 000 / 3 000)
  cappedRows += await raknaTak("type=not.in.(trafik,sakerhet,oversattning)", MAX_LOG_ROWS);
  cappedRows += await raknaTak("type=eq.trafik", MAX_ANTAL_TRAFIK);
  cappedRows += await raknaTak("type=eq.sakerhet", MAX_ANTAL_SAKERHET);

  // 3. MÖS-event-lagret (våg 55 L1): dublettrader FÖRST (senaste vinner),
  //    därefter antalsstympning 45 000 (icke-publicerade äldst först).
  cappedRows += await rensaMosDubletter();
  cappedRows += await raknaTakMos();

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
