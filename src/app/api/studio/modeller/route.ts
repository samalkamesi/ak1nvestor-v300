import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/modeller — MODELLRULLISTAN för /studio (VÅG 82 STUDIO V2,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 82").
 *
 * GET  → {modeller:[{id,namn,kontextFonster?,maxSvar?,modaliteter?,
 *        tankeNivaer?,standardTankeNiva?}], standard?, vald?, live} —
 *        listan HÄRLEDDS ur zcode-config.json (provider.zai.models +
 *        model.main), ALDRIG hårdkodad (KVD), och BERIKAS ur zcode:s
 *        egen modellkatalog ~/.zcode/cli/model-catalog.json
 *        (retirementSafe — 10X p8): kontextfönster, svarstak, input-
 *        modaliteter OCH tankestyrka-nivåer per modell (reasoning.levels
 *        + defaultLevel). Katalogmodeller som saknas i config läggs
 *        TILL (id i zai-form = gemener) — panelen listar ALLA
 *        tillgängliga modeller. "vald" kommer från transportens levande
 *        session (session/read) när den finns.
 * POST → {modell: "glm-5.2"} → transport.bytModell (kassera + create med
 *        model-param, BEVISAT v82 — sessionen föds med modellen och
 *        sessionId BYTER; gamla sessioner lever kvar i session/list =
 *        INGEN sessionsförlust) → {sessionId, väg, modell}. modell-id
 *        MÅSTE finnas i den sammanslagna listan (validering mot samma
 *        källor — ingen injektion av godtyckliga id:n mot protokollet).
 *
 * I dev utan zcode-config (Windows-arbetsstationen har tom zai-lista i
 * ~/.zcode/cli/config.json) svarar GET med katalogens modeller när
 * model-catalog.json finns — annars tom lista (UI:t visar "—").
 *
 * SKYDD: requireAdmin på båda metoderna. ALDRIG någon nyckel i svaret —
 * config.json läses endast för id/namn/model.main-fälten.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

interface ModellPost {
  id: string;
  namn: string;
  /** Katalog-metadata (model-catalog.json) — osatt när modellen saknas där. */
  kontextFonster?: number;
  maxSvar?: number;
  /** Input-modaliteter utöver text ("bild" = text+image) — katalogens form. */
  modaliteter?: string[];
  /**
   * Tankestyrka-nivåer ur katalogens reasoning.levels — [] = modellen
   * stödjer INGEN nivå; osatt = katalogen vet ej (UI faller tillbaka).
   */
  tankeNivaer?: string[];
  /** Katalogens defaultLevel ("max" för GLM-5.3-familjen 2026-09). */
  standardTankeNiva?: string;
}

/** Katalogpost (model-catalog.json builtinModels) — normerad läsform. */
interface KatalogPost {
  modellId: string;
  kontextFonster?: number;
  maxSvar?: number;
  modaliteter?: string[];
  tankeNivaer?: string[];
  standardTankeNiva?: string;
}

/**
 * Läs zcode:s modellkatalog — Map med LITE modellId som nyckel (config:n
 * id:n är gemener, katalogens "GLM-5.3"). Tom Map när filen saknas/är
 * ogiltig — listan från config lever vidare oberikad (graceful).
 */
function lasKatalog(): Map<string, KatalogPost> {
  const kandidater = [
    process.env.STUDIO_ZCODE_KATALOG,
    path.join(os.homedir(), ".zcode", "cli", "model-catalog.json"), // prod + dev
    "/home/ak1a/.zcode/cli/model-catalog.json", // Contabo-hem (reserve)
  ].filter((p): p is string => typeof p === "string" && p.length > 0);

  for (const sokvag of kandidater) {
    if (!existsSync(sokvag)) continue;
    try {
      const katalog = JSON.parse(readFileSync(sokvag, "utf8")) as {
        builtinModels?: unknown;
      };
      if (!Array.isArray(katalog.builtinModels)) continue;
      const karta = new Map<string, KatalogPost>();
      for (const m of katalog.builtinModels) {
        if (!m || typeof m !== "object") continue;
        const r = m as Record<string, unknown>;
        const modellId = typeof r.modelId === "string" ? r.modelId.trim() : "";
        if (!modellId) continue;
        const resonemang =
          r.reasoning && typeof r.reasoning === "object"
            ? (r.reasoning as Record<string, unknown>)
            : null;
        const nivaObjekt =
          resonemang && resonemang.levels && typeof resonemang.levels === "object"
            ? (resonemang.levels as Record<string, unknown>)
            : null;
        const modaliteter =
          r.modalities && typeof r.modalities === "object"
            ? (r.modalities as { input?: unknown }).input
            : undefined;
        karta.set(modellId.toLowerCase(), {
          modellId,
          ...(typeof r.contextWindow === "number" && r.contextWindow > 0
            ? { kontextFonster: r.contextWindow }
            : {}),
          ...(typeof r.maxCompletionTokens === "number" && r.maxCompletionTokens > 0
            ? { maxSvar: r.maxCompletionTokens }
            : {}),
          ...(Array.isArray(modaliteter)
            ? {
                modaliteter: modaliteter
                  .filter((x): x is string => typeof x === "string" && x !== "text")
                  .map((x) => (x === "image" ? "bild" : x === "video" ? "video" : x)),
              }
            : {}),
          ...(nivaObjekt ? { tankeNivaer: Object.keys(nivaObjekt) } : {}),
          ...(resonemang && typeof resonemang.defaultLevel === "string" && resonemang.defaultLevel.trim()
            ? { standardTankeNiva: resonemang.defaultLevel.trim() }
            : {}),
        });
      }
      if (karta.size > 0) return karta;
    } catch {
      // nästa kandidat
    }
  }
  return new Map();
}

/** Berika en config-modell med katalog-metadata (osatt lämnas osatt). */
function berikaModell(m: ModellPost, katalog: Map<string, KatalogPost>): ModellPost {
  const post = katalog.get(m.id.toLowerCase());
  if (!post) return m;
  return {
    ...m,
    ...(m.namn === m.id ? { namn: post.modellId } : {}),
    ...(post.kontextFonster !== undefined ? { kontextFonster: post.kontextFonster } : {}),
    ...(post.maxSvar !== undefined ? { maxSvar: post.maxSvar } : {}),
    ...(post.modaliteter !== undefined ? { modaliteter: post.modaliteter } : {}),
    ...(post.tankeNivaer !== undefined ? { tankeNivaer: post.tankeNivaer } : {}),
    ...(post.standardTankeNiva !== undefined
      ? { standardTankeNiva: post.standardTankeNiva }
      : {}),
  };
}

/**
 * Config-listan + katalogberikning + katalogens egna modeller (zai-form,
 * gemener) — ALLA tillgängliga modeller i EN lista. standard följer
 * config (model.main) oförändrat.
 */
function lasModeller(): { modeller: ModellPost[]; standard?: string } {
  const { modeller, standard } = lasConfigModeller();
  const katalog = lasKatalog();
  if (katalog.size === 0) return { modeller, standard };
  const sammanslagna = modeller.map((m) => berikaModell(m, katalog));
  const kanda = new Set(modeller.map((m) => m.id.toLowerCase()));
  for (const [nyckel, post] of katalog) {
    if (kanda.has(nyckel)) continue;
    sammanslagna.push(berikaModell({ id: nyckel, namn: post.modellId }, katalog));
  }
  return { modeller: sammanslagna, standard };
}

/** Läs modellistan ur zcode:s config.json — endast id/namn/main, ALDRIG nycklar. */
function lasConfigModeller(): { modeller: ModellPost[]; standard?: string } {
  const kandidater = [
    process.env.STUDIO_ZCODE_CONFIG,
    path.join(os.homedir(), ".zcode", "cli", "config.json"), // prod + dev
    "/home/ak1a/.zcode/cli/config.json", // Contabo-hem (reserve)
  ].filter((p): p is string => typeof p === "string" && p.length > 0);

  for (const sokvag of kandidater) {
    if (!existsSync(sokvag)) continue;
    try {
      const config = JSON.parse(readFileSync(sokvag, "utf8")) as {
        provider?: Record<string, { models?: Record<string, { name?: string }> | unknown[] }>;
        model?: { main?: string };
      };
      const raw = config.provider?.zai?.models;
      const modeller: ModellPost[] = [];
      if (Array.isArray(raw)) {
        for (const m of raw) {
          const id = typeof (m as { id?: unknown })?.id === "string" ? (m as { id: string }).id : null;
          if (id) modeller.push({ id, namn: (m as { name?: string }).name ?? id });
        }
      } else if (raw && typeof raw === "object") {
        for (const [id, m] of Object.entries(raw)) {
          modeller.push({ id, namn: (m as { name?: string } | null)?.name ?? id });
        }
      }
      if (modeller.length > 0) {
        const main = config.model?.main; // "zai/glm-5.3"
        const standard = typeof main === "string" && main.includes("/") ? main.split("/").slice(1).join("/") : undefined;
        return { modeller, standard: standard && modeller.some((m) => m.id === standard) ? standard : modeller[0]?.id };
      }
    } catch {
      // nästa kandidat
    }
  }
  return { modeller: [] };
}

// ── GET — modellista ur config ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const { modeller, standard } = lasModeller();
  let vald: string | undefined;
  try {
    const kontext = await hamtaStudioTransport().lasKontext();
    if (kontext?.modell?.includes("/")) vald = kontext.modell.split("/").slice(1).join("/");
  } catch {
    // transporten kan vara nere — listan lever ändå
  }
  return jsonSvar({
    modeller,
    standard,
    vald: vald && modeller.some((m) => m.id === vald) ? vald : undefined,
    live: modeller.length > 0,
  });
}

// ── POST — modellbyte → ny session med vald modell ─────────────────────────

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let modell = "";
  try {
    const kropp = (await req.json()) as { modell?: unknown };
    if (typeof kropp.modell === "string") modell = kropp.modell.trim();
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }

  // Validering MOT DEN SAMMANSLAGNA LISTAN (sanna källorna) — aldrig godtyckliga id:n.
  const { modeller } = lasModeller();
  const hittad = modeller.find((m) => m.id === modell);
  if (!hittad) {
    return jsonSvar(
      { fel: `Okänd modell "${modell.slice(0, 60)}" — listan hämtas ur config.json + modellkatalogen.`, modeller },
      400,
    );
  }

  try {
    const transport = hamtaStudioTransport();
    const svar = await transport.bytModell(hittad.id);
    return jsonSvar({ ...svar, namn: hittad.namn });
  } catch (fel) {
    return jsonSvar(
      { fel: `Modellbytet misslyckades: ${fel instanceof Error ? fel.message.slice(0, 300) : "okänt fel"}` },
      502,
    );
  }
}
