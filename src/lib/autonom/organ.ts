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
//   oversattning (VÅG 55 L1; tak höjt våg 67): 200 000 rader / INGET ålderstak — MÖS-lagrets
//     system_events-backend (src/lib/oversattning/lager.ts) sparar
//     översättningar här när tabellen oversattningar saknas. Publicerade
//     översättningar ska BESTÅ tills de ersätts, därför gäller i stället:
//     (a) äldsta DUBLETTRADER (samma details->>scope_nyckel + sprak —
//         behåll SENASTE raden) raderas FÖRST, (b) därefter stympas vid
//         överkott äldsta rader med status != 'publicerad', (c) sist äldsta
//         publicerade. 17,7M-kollapsen får ALDRIG upprepas: hårt tak + ingen
//         okontrollerad tillväxt (cron-ronden skriver batchvis, dedupe i
//         lasSpara + denna städrunda håller raderna ≈ registrets storlek).
//   termbank_tillagg (VÅG 79, STYRELSE-ADMIN-MEGA steg 1): INGET ålderstak
//     och INGET allmänt radtak — varje rad är en admin-term-händelse där
//     SENASTE per details->>sv är SANNINGEN ("Supabase-raden är sanningen");
//     30-dagarsregeln/500-taket skulle äta upp termbanken. Tillväxten hålls
//     i stället av deduplicering (äldsta kopior per sv raderas, senaste
//     behålls) — raderna begränsas av antalet distinkta termer admin rört.
//   medlem-typerna (VÅG 86 — retention-flaggan ur STYRELSE-V86-L3 §KRITA):
//     type=medlem (L1-profiler), medlem_progress (L2) samt ändrings-
//     historiken medlem_andring/admin-andring (L3-audit) förs ALDRIG under
//     övrigt-regeln (500 rader/30d) och har INGET ålderstak — senaste raden
//     per details->>authId är medlemns profil/progress (senaste-vinner,
//     samma semantik som MÖS- och termbank-lagren); tappas den försvinner
//     profilen och ev. Fas-grants (L3-beroende). I stället egna hårda tak
//     per typ (se raknaTakMedlem): medlem 50 000, medlem_progress 500 000;
//     andrings-typerna får INGET tak (audit-spår, en rad per admin-åtgärd —
//     termbank-precedensen).

const MAX_ANTAL_TRAFIK = 12_000;
const MAX_ANTAL_SAKERHET = 3_000;
/** Våg 67: 45 000 → 200 000. Korpusen passerade 59k råa rader (full korpus
 *  ≈ 139 164 unika språknycklar) — vid 45k hade stympning (c) börjat radera
 *  ÄLDSTA PUBLICERADE = äkta dataförlust av v66-block/flaggskepp. 200k ligger
 *  fortfarande ~100× under 17,7M-kollapsen och avgränsar fortfarande tillväxten. */
const MAX_ANTAL_OVERSATTNING = 200_000;
const MAX_ALDER_TYP_DAGAR = 35;
/** Tak för MÖS-städningen per körning: 200 sidor à 1 000 rader + 20 000 raderade. */
const MOS_STAD_MAX_Sidor = 200;
const MOS_STAD_MAX_RADERA = 20_000;
/** Våg 86 (STYRELSE-V86-L3 §KRITA): medlemsprofilerna får ALDRIG åldras
 *  bort — i stället egna hårta radtak. 50 000 medlemmar / 500 000 progress-
 *  rader ligger långt över realistiska medlemsantal och ~350×/~35× under
 *  17,7M-kollapsen: tillväxten förblir avgränsad, profilerna består. */
const MAX_ANTAL_MEDLEM = 50_000;
const MAX_ANTAL_MEDLEM_PROGRESS = 500_000;
/** Tak för medlem-städningen per körning: 200 sidor à 1 000 rader + 20 000
 *  raderade (samma budget som MÖS-städningen — våg 67 mätte 16 s för 200 sidor). */
const MEDLEM_STAD_MAX_Sidor = 200;
const MEDLEM_STAD_MAX_RADERA = 20_000;

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
          `&select=id,details->>scope_nyckel,details->>sprak&order=created_at.desc,id.desc`,
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
   * MÖS-antalsstympning (VÅG 55 L1; tak 200 000 sedan våg 67): överstiger
   * type=oversattning MAX_ANTAL_OVERSATTNING
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

  /**
   * TERMBANK-dubbeltröjning (VÅG 79): type=termbank_tillagg är append-only —
   * läsningarna låter SENASTE raden per details->>sv vinna (senaste-vinner,
   * samma semantik som MÖS-lagret), så äldre kopior är ren vikt. Speglar
   * rensaMosDubletter men med sv som nyckel och ett blygsamt tak (typen är
   * liten: en rad per admin-åtgärd). Råa filtervärden, aldrig citerade.
   */
  const rensaTermbankDubletter = async (): Promise<number> => {
    try {
      const sedda = new Set<string>();
      const radera: string[] = [];
      for (let sida = 0; sida < 5; sida++) {
        const fran = sida * 1000;
        const res = await tryFetch(
          `${sb.origin}/rest/v1/${LOG_TABLE}?type=eq.termbank_tillagg` +
            `&select=id,details->>sv&order=created_at.desc,id.desc`,
          { headers: { ...sb.headers, Range: `${fran}-${fran + 999}` } }
        );
        if (!res.ok) return 0;
        const rows = await res.json();
        if (!Array.isArray(rows) || rows.length === 0) break;
        for (const r of rows) {
          const sv = r?.sv;
          const id = r?.id;
          if (typeof sv !== "string" || typeof id !== "string" || !sv) continue;
          if (sedda.has(sv)) radera.push(id);
          else sedda.add(sv);
        }
        if (rows.length < 1000) break;
        if (radera.length >= 2000) break;
      }
      if (radera.length === 0) return 0;
      return await raderaIdn(radera);
    } catch {
      return 0;
    }
  };

  /**
   * MEDLEM-radtak (VÅG 86 — retention-flaggan ur STYRELSE-V86-L3 §KRITA):
   * type=medlem (profiler) och type=medlem_progress har inget ålderstak men
   * ett per-typ-radtak (50 000 / 500 000). SENASTE raden per details->>authId
   * är medlemns profil/progress-sanning — den raderas ALDRIG här. Vid över-
   * skott raderas i stället, i ordning: (a) äldsta DUBLETTRADER per authId
   * (en nyare kopia finns redan — ren vikt, samma semantik som MÖS/termbank),
   * (b) om skannet inte täckte hela typen: äldsta OSYNLIGA rader som har en
   * synlig nyare kopia per authId. Räcker inte det (fler distinkta authId än
   * taket) raderas INGET mer — ärligt: taket är en vaknivå och senaste-
   * raderna består (realistiskt medlemsantal ligger årtionden under 50 000).
   * Skanna nyast-först (id är uuid-text, ej kronologiskt — se MÖS-röjningen),
   * råa filtervärden, bounded per körning (MEDLEM_STAD_MAX_*). Idempotent.
   */
  const raknaTakMedlem = async (typ: string, tak: number): Promise<number> => {
    try {
      const countRes = await tryFetch(`${sb.origin}/rest/v1/${LOG_TABLE}?type=eq.${typ}&select=id`, {
        method: "HEAD",
        headers: { ...sb.headers, Prefer: "count=planned" },
      });
      if (!countRes.ok) return 0;
      const antal = Number(countRes.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
      if (antal <= tak) return 0;
      const overskott = antal - tak;

      // (a) skanna nyast-först: senaste rad per authId + övriga = dubletter
      const seddaAuthId = new Set<string>();
      const dubbletIdn: string[] = []; // ny→gammal ordning (vänds före radering)
      let komplett = false;
      for (let sida = 0; sida < MEDLEM_STAD_MAX_Sidor; sida++) {
        const fran = sida * 1000;
        const res = await tryFetch(
          `${sb.origin}/rest/v1/${LOG_TABLE}?type=eq.${typ}` +
            `&select=id,details->>authId&order=created_at.desc,id.desc`,
          { headers: { ...sb.headers, Range: `${fran}-${fran + 999}` } }
        );
        if (!res.ok) break;
        const rows = await res.json();
        if (!Array.isArray(rows) || rows.length === 0) break;
        for (const r of rows) {
          const id = r?.id;
          if (typeof id !== "string") continue;
          const authId = r?.authId;
          // rad utan authId lämnas orörd (kan vara medlemns enda profil-rad)
          if (typeof authId !== "string" || !authId || seddaAuthId.has(authId)) dubbletIdn.push(id);
          else seddaAuthId.add(authId);
        }
        if (rows.length < 1000) {
          komplett = true;
          break;
        }
        if (dubbletIdn.length >= MEDLEM_STAD_MAX_RADERA) break;
      }

      // äldsta dubletter först — radera högst överskottet (behåll historiken)
      const antalA = Math.min(overskott, dubbletIdn.length, MEDLEM_STAD_MAX_RADERA);
      let raderade = 0;
      if (antalA > 0) {
        raderade += await raderaIdn(dubbletIdn.reverse().slice(0, antalA));
      }
      let kvar = overskott - raderade;
      if (kvar <= 0 || komplett) return raderade;

      // (b) osynliga äldre rader (skannet trunkerat): äldsta först, ENDAST de
      // med synlig nyare kopia — en osynlig rad utan sedd authId kan vara
      // medlemns senaste och lämnas därför alltid orörd
      for (let sida = 0; sida < MEDLEM_STAD_MAX_Sidor && kvar > 0; sida++) {
        const fran = sida * 1000;
        const res = await tryFetch(
          `${sb.origin}/rest/v1/${LOG_TABLE}?type=eq.${typ}` +
            `&select=id,details->>authId&order=created_at.asc,id.asc`,
          { headers: { ...sb.headers, Range: `${fran}-${fran + 999}` } }
        );
        if (!res.ok) break;
        const rows = await res.json();
        if (!Array.isArray(rows) || rows.length === 0) break;
        const tagna: string[] = [];
        for (const r of rows) {
          const id = r?.id;
          const authId = r?.authId;
          if (typeof id !== "string" || typeof authId !== "string" || !seddaAuthId.has(authId)) continue;
          tagna.push(id);
          kvar--;
          if (kvar <= 0 || tagna.length >= MEDLEM_STAD_MAX_RADERA) break;
        }
        if (tagna.length > 0) raderade += await raderaIdn(tagna);
        if (rows.length < 1000 || tagna.length < rows.length) break;
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
  //    OBS (våg 79): termbank_tillagg hör till samma undantag — en admin-
  //    terms SENASTE rad är sanningen och får aldrig åldras bort (se steg 3b).
  //    OBS (våg 86): medlem-typerna (medlem, medlem_progress, medlem_andring,
  //    admin-andring) åldras ALDRIG bort — senaste raden per authId är
  //    medlemns profil/progress/audit-sanning (STYRELSE-V86-L3 §KRITA; se
  //    steg 3c).
  deletedOld += await rakraAldring(
    "type=not.in.(trafik,sakerhet,oversattning,termbank_tillagg,medlem,medlem_progress,medlem_andring,admin-andring,variabel,variabel-andring,blogg_utkast,blogg_publicerad,kurs_metadata,kurs_metadata-andring,media_fil,media_fil_raderad,referral,referral_kod)",
    MAX_LOG_AGE_DAYS
  );
  deletedOld += await rakraAldring("type=eq.trafik", MAX_ALDER_TYP_DAGAR);
  deletedOld += await rakraAldring("type=eq.sakerhet", MAX_ALDER_TYP_DAGAR);

  // 2. Hårta radtak, per scope (500 / 12 000 / 3 000)
  cappedRows += await raknaTak(
    "type=not.in.(trafik,sakerhet,oversattning,termbank_tillagg,medlem,medlem_progress,medlem_andring,admin-andring,variabel,variabel-andring,blogg_utkast,blogg_publicerad,kurs_metadata,kurs_metadata-andring,media_fil,media_fil_raderad,referral,referral_kod)",
    MAX_LOG_ROWS
  );
  cappedRows += await raknaTak("type=eq.trafik", MAX_ANTAL_TRAFIK);
  cappedRows += await raknaTak("type=eq.sakerhet", MAX_ANTAL_SAKERHET);

  // 3. MÖS-event-lagret (våg 55 L1): dublettrader FÖRST (senaste vinner),
  //    därefter antalsstympning MAX_ANTAL_OVERSATTNING (icke-publicerade äldst först).
  cappedRows += await rensaMosDubletter();
  cappedRows += await raknaTakMos();

  // 3b. TERMBANK-tilläggen (våg 79): samma dubbeltröjning men per details->>sv
  //     — varje laggTill/uppdatera/taBort lägger en rad, SENASTE per sv är
  //     sanningen, äldre kopior är ren vikt. Inget ålderstak/radtak behövs:
  //     denna rensning håller typen ≈ antalet distinkta termer.
  cappedRows += await rensaTermbankDubletter();

  // 3c. MEDLEM-typerna (våg 86 — STYRELSE-V86-L3 §KRITA): egna hårda tak
  //     (medlem 50 000, medlem_progress 500 000) i stället för övrigt-regeln;
  //     SENASTE per details->>authId raderas aldrig (profiler/Fas-grants).
  //     medlem_andring/admin-andring (audit-spår) får inget tak alls — de
  //     hanteras enbart av undantagen i steg 1–2 ovan.
  cappedRows += await raknaTakMedlem("medlem", MAX_ANTAL_MEDLEM);
  cappedRows += await raknaTakMedlem("medlem_progress", MAX_ANTAL_MEDLEM_PROGRESS);

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
