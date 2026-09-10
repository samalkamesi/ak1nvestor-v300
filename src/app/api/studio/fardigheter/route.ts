import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaStudioTransport,
  StudioMetodSaknasError,
  StudioPlugin,
  StudioTransport,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/fardigheter — SKILLS/PLUGINS/TOOLS-panelens datakälla (VÅG 85
 * F2) + VÅG 93 C2-UPPGRADERING (STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 93" +
 * V93-P1-UNDERLAG kluster c: plugins-drift — enable/disable infrias).
 *
 * GET → {skills:[…], plugins:[…], mcp:[…], transport, live, mcpVerktyg} via
 *       transportens protokollvägar (LIVE-testade, kartan §2):
 *         skills/referenceCatalog  → skills (namn + beskrivning per kort)
 *         plugins/list             → plugins (aktiva först)
 *         mcp/list                 → anslutna MCP-servrar (toolCount)
 *
 *       VÅG 93: varje plugin-post bär NU även "aktiverad: boolean"
 *       (samma sanning som "aktiv" — v93-kontraktets fältnamn) + version.
 *       Listan hämtas ur lasPluginsFull (C1:s drift-lista med aktiverad/
 *       version) när transporten bär den, ANNARS ur lasPlugins (befintlig).
 *       Båda namnen sonderas med typeof-vakt (våg 92 B2-mönstret) — gamla
 *       fält (id/namn/beskrivning/version/aktiv/skillAntal/kalla) BESTÅR
 *       (bakåtkompatibelt).
 *
 * POST {plugin, aktiverad} → transport.pluginSattAktiverad (plugins/
 *       setEnabled bakom C1:s brygga) → {ok:true, plugin, aktiverad}.
 *       plugin = icke-tom sträng ≤200 tkn; aktiverad = boolean (krävs).
 *       Transportmetoden saknas ⇒ ärlig 501 {saknas:true} (typeof-vakt
 *       eller -32601 via StudioMetodSaknasError) — panelen döljer
 *       brytarna graciöst. ALDRIG någon config-skrivning: aktivering går
 *       ENDAST via protokollets egna metod.
 *
 * SKYDD: requireAdmin på båda metoderna. Svaret bär ALDRIG hemligheter —
 * katalogposterna är protokollets egna namn/beskrivningar.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** plugin-id-tak (tecken) — protokoll-id är korta namn/GUID:er. */
const MAX_PLUGIN_ID_TEEKEN = 200;

/**
 * V93-kontraktets plugin-post: gamla fält BESTÅR + "aktiverad" (kontraktets
 * namn på samma sanning som "aktiv").
 */
interface PluginPost {
  id: string;
  namn: string;
  beskrivning?: string;
  version?: string;
  aktiv: boolean;
  /** VÅG 93: kontraktets fältnamn — alltid samma värde som "aktiv". */
  aktiverad: boolean;
  skillAntal?: number;
  kalla?: string;
}

/**
 * Viddad vy för C1:s våg-93-metoder (lasPluginsFull/pluginSattAktiverad) —
 * de landar parallellt med denna rutt; typeof-vakten skyddar timingen.
 */
type TransportSonder = Record<string, unknown>;

/** Första fungerande metod-kandidaten — null när ingen finns (501-vägen). */
function sondMetod(
  transport: StudioTransport,
  namn: string[],
): ((...arg: unknown[]) => Promise<unknown>) | null {
  const t = transport as unknown as TransportSonder;
  for (const n of namn) {
    const fn = t[n];
    if (typeof fn === "function") {
      return (fn as (...arg: unknown[]) => Promise<unknown>).bind(transport);
    }
  }
  return null;
}

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** -32601-vägen (StudioMetodSaknasError) eller transportens egen markör. */
function arSaknas(fel: unknown): boolean {
  return (
    fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true
  );
}

/** 501/502-vakt: metod saknas (typeof/-32601) ⇒ ärlig {saknas:true}. */
function svarVidTransportFel(fel: unknown, standard: string): Response {
  if (arSaknas(fel)) {
    return jsonSvar(
      { saknas: true, fel: fel instanceof Error ? fel.message : "Metoden stöds ej." },
      501,
    );
  }
  return jsonSvar(
    { fel: fel instanceof Error ? fel.message.slice(0, 300) : standard },
    502,
  );
}

/** Sträng ur opak post — första icke-tomma kandidatnyckeln. */
function lasStrang(p: Record<string, unknown>, nycklar: string[]): string | undefined {
  for (const n of nycklar) {
    const v = p[n];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

/** Boolesk ur opak post (aktiv/aktiverad/enabled — default false). */
function lasBoolesk(p: Record<string, unknown>, nycklar: string[]): boolean {
  for (const n of nycklar) {
    if (typeof p[n] === "boolean") return p[n] as boolean;
  }
  return false;
}

/** Tal ur opak post (skillAntal/skillCount) — undefined när protokollet tiger. */
function lasTal(p: Record<string, unknown>, nycklar: string[]): number | undefined {
  for (const n of nycklar) {
    if (typeof p[n] === "number") return p[n] as number;
  }
  return undefined;
}

/**
 * Normalisera en plugin-post ur VALFRRI källa (StudioPlugin från lasPlugins
 * ELLER C1:s drift-lista) till v93-kontraktet + gamla fält. Defensiv:
 * okända nyckelformer ⇒ namn faller på id:t, aktiverad default false.
 */
function normaliseraPlugin(raa: unknown): PluginPost {
  const p = (raa ?? {}) as Record<string, unknown>;
  const id = lasStrang(p, ["id", "pluginId"]) ?? "";
  const namn = lasStrang(p, ["namn", "name"]) ?? id;
  const aktiv = lasBoolesk(p, ["aktiv", "aktiverad", "enabled"]);
  const skillAntal = lasTal(p, ["skillAntal", "skillCount"]);
  return {
    id,
    namn,
    ...(lasStrang(p, ["beskrivning", "description"]) !== undefined
      ? { beskrivning: lasStrang(p, ["beskrivning", "description"]) }
      : {}),
    ...(lasStrang(p, ["version"]) !== undefined ? { version: lasStrang(p, ["version"]) } : {}),
    aktiv,
    aktiverad: aktiv,
    ...(skillAntal !== undefined ? { skillAntal } : {}),
    ...(lasStrang(p, ["kalla", "source", "marketplace"]) !== undefined
      ? { kalla: lasStrang(p, ["kalla", "source", "marketplace"]) }
      : {}),
  };
}

/**
 * Pluginlistan: lasPluginsFull (C1:s drift-lista, aktiverad/version) sonderas
 * först; faller den (saknas/kastar/icke-array) backar rutten på befintliga
 * lasPlugins — panelen får ALDRIG tom lista bara för att en metod saknas.
 */
async function lasPluginLista(transport: StudioTransport): Promise<PluginPost[]> {
  const full = sondMetod(transport, ["lasPluginsFull"]);
  if (full) {
    try {
      const r = await full();
      if (Array.isArray(r)) return r.map(normaliseraPlugin);
    } catch {
      // vidare till lasPlugins (samma källa, mindre rik)
    }
  }
  const lista: StudioPlugin[] = await transport.lasPlugins();
  return lista.map(normaliseraPlugin);
}

// ── GET — panelens tre kataloger, parallellt + feletolerant ──────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const transport = hamtaStudioTransport();

  // Parallellt + feletolerant: varje sektion lever för sig själv.
  const [skills, plugins, mcp] = await Promise.all([
    transport.lasSkills().catch(() => []),
    lasPluginLista(transport).catch(() => [] as PluginPost[]),
    transport.lasMcp().catch(() => []),
  ]);

  return jsonSvar({
    skills,
    plugins,
    mcp,
    transport: transport.namn,
    live: skills.length > 0 || plugins.length > 0 || mcp.length > 0,
    /** Summerad verktygsräkning — E2E-kravets ">0 mcp-verktyg". */
    mcpVerktyg: mcp.reduce((summa, server) => summa + server.verktygAntal, 0),
  });
}

// ── POST — plugin på/av via protokollets setEnabled (VÅG 93 kluster c) ──────

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let plugin = "";
  let aktiverad: boolean | null = null;
  try {
    const kropp = (await req.json()) as { plugin?: unknown; aktiverad?: unknown };
    if (typeof kropp.plugin === "string") plugin = kropp.plugin.trim();
    if (typeof kropp.aktiverad === "boolean") aktiverad = kropp.aktiverad;
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  if (!plugin || plugin.length > MAX_PLUGIN_ID_TEEKEN) {
    return jsonSvar({ fel: `plugin krävs (1–${MAX_PLUGIN_ID_TEEKEN} tecken).` }, 400);
  }
  if (aktiverad === null) {
    return jsonSvar({ fel: "aktiverad krävs (boolean: true = på, false = av)." }, 400);
  }

  const transport = hamtaStudioTransport();
  const metod = sondMetod(transport, ["pluginSattAktiverad", "sattPluginAktig"]);
  if (!metod) {
    return jsonSvar(
      { saknas: true, fel: "Transportmetoden \"pluginSattAktiverad\" finns ej på instansen (protokollmetoden stöds ej ännu)." },
      501,
    );
  }

  try {
    await metod(plugin, aktiverad);
    return jsonSvar({ ok: true, plugin, aktiverad });
  } catch (fel) {
    return svarVidTransportFel(fel, "Plugin-aktiveringen misslyckades.");
  }
}
