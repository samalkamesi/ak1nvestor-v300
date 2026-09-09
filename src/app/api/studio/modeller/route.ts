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
 * GET  → {modeller:[{id,namn}], standard?, vald?, live} — listan HÄRLEDDS
 *        UR zcode-config.json (provider.zai.models + model.main), ALDRIG
 *        hårdkodad (KVD). Bevisad källa på Contabo:
 *        /home/ak1a/.zcode/cli/config.json → 5 zai-modeller (glm-5.3,
 *        glm-5.3-flash, glm-5.2, glm-5.1, glm-5-turbo). "vald" kommer
 *        från transportens levande session (session/read) när den finns.
 * POST → {modell: "glm-5.2"} → transport.bytModell (kassera + create med
 *        model-param, BEVISAT v82 — sessionen föds med modellen och
 *        sessionId BYTER) → {sessionId, väg, modell}. modell-id MÅSTE
 *        finnas i config-listan (validering mot samma källa — ingen
 *        injektion av godtyckliga id:n mot protokollet).
 *
 * I dev utan zade-config (Windows-arbetsstationen har tom zai-lista i
 * ~/.zcode/cli/config.json) svarar GET ärligt med tom lista — UI:t visar
 * "—" och modellbytet är avstängt (mock-transporten behöver ingen modell).
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

  const { modeller, standard } = lasConfigModeller();
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

  // Validering MOT CONFIG-LISTAN (sanna källan) — aldrig godtyckliga id:n.
  const { modeller } = lasConfigModeller();
  const hittad = modeller.find((m) => m.id === modell);
  if (!hittad) {
    return jsonSvar(
      { fel: `Okänd modell "${modell.slice(0, 60)}" — listan hämtas ur config.json.`, modeller },
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
