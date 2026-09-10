import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaStudioTransport,
  StudioMetodSaknasError,
  StudioTransport,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/installningar — WORKSPACE-STANDARDVÄRDEN (VÅG 93 C2,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 93" + V93-P1-UNDERLAG kluster a):
 * kundens val av modell/tankestyrka/läge skall GÄLLA NäSTA SAMTAL —
 * inställningarna persistas i WORKSPACE via protokollets egna metoder
 * (workspace/setDefault{Model,ThoughtLevel,Mode} bakom transportens
 * sattStandard*-bryggor, C1).
 *
 * GET  → {modell?, tankestyrka?, lage?} ur transport.lasWorkspaceInstallningar
 *        (workspace/readState:s settings-sida). TOMT OBJEKT + {saknas:true}
 *        när protokollet/transporten saknar metoden — panelen döljer sektionen
 *        graciöst (aldrig 500 för en lyxläsning).
 * POST {modell?, tankestyrka?, lage?} → PATCH-semantik: ENDAST medföljande
 *        fält sparas via respektive spara-metod. Validering: modell = icke-tom
 *        sträng ≤100 tkn ELLER {providerId, modelId}-objekt; tankestyrka =
 *        fri sträng ≤20 tkn (nothink|low|medium|high|max-liknande —
 *        protokollet är sanningsägaren); lage = "build"|"plan" + fri sträng
 *        ≤20 tkn. Svar {ok, sparade:[…], installningar:{…}} med eko ur
 *        återläsningen.
 *
 * TIMING-VAKT (våg 92 B2:s typeof-mönster): C1 bygger transportmetoderna
 * PARALLELLT — om transport.metod saknas på instansen ⇒ ärlig 501 {saknas:
 * true} (POST) / tomt objekt (GET); protokollserverns -32601 fångas av
 * StudioMetodSaknasError (samma 501). Metodnamn sondas i dokumenterad
 * prioritetsordning: sattStandard* (underlagets C1-namn) före spara*.
 *
 * HELIG GRÄNS: rutten skriver ALDRIG config.json och rör ALDRIG
 * API-nycklar — endast preferensfälten ovan, via protokollets egna metoder.
 *
 * SKYDD: requireAdmin på båda metoderna.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** modell-fältets teckentak (sträng-formen och providerId/modelId-formen). */
const MAX_MODELL_TEEKEN = 100;
/** tankestyrka/läge-fältens teckentak (protokollets nivåer är korta ord). */
const MAX_NIVA_TEEKEN = 20;

/** Kontraktets tre preferensfält — endast utsatta värden bärs i svaret. */
interface StudioInstallningar {
  modell?: string;
  tankestyrka?: string;
  lage?: string;
}

/**
 * Viddad vy över transporten för C1:s våg-93-metoder — typeof-vakten gör
 * rutten oberoende av C1:s landningstid (sonder, aldrig någon `as any`-tro).
 */
type TransportSonder = Record<string, unknown>;

/** Sondera transporten på ett metodnamn (eller namnfamilj) — null = saknas. */
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

/** Feltext, truncat — aldrig hela stackspår till klienten. */
function felText(fel: unknown): string {
  return fel instanceof Error ? fel.message.slice(0, 300) : "okänt fel";
}

/** -32601-vägen (StudioMetodSaknasError) eller transportens egen markör. */
function arSaknas(fel: unknown): boolean {
  return (
    fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true
  );
}

/** Ärlig 501 — transportmetoden finns ej på instansen ännu. */
function svarMetodSaknas(metod: string): Response {
  return jsonSvar(
    { saknas: true, fel: `Transportmetoden "${metod}" finns ej på instansen (protokollmetoden stöds ej ännu).` },
    501,
  );
}

/**
 * modell: icke-tom sträng ≤100 tkn ELLER {providerId, modelId}-objekt —
 * godkänd råform passeras vidare OFÖRÄNDRAD (protokollet äter sin egen form).
 */
function valideraModell(v: unknown): string | null {
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return "modell: får ej vara tom sträng (uteslut fältet för att behålla värdet).";
    if (s.length > MAX_MODELL_TEEKEN) return `modell: max ${MAX_MODELL_TEEKEN} tecken.`;
    return null;
  }
  if (v && typeof v === "object") {
    const o = v as { providerId?: unknown; modelId?: unknown };
    const p = typeof o.providerId === "string" ? o.providerId.trim() : "";
    const m = typeof o.modelId === "string" ? o.modelId.trim() : "";
    if (!p || !m) return "modell: {providerId, modelId} kräver båda som icke-tomma strängar.";
    if (p.length > MAX_MODELL_TEEKEN || m.length > MAX_MODELL_TEEKEN) {
      return `modell: max ${MAX_MODELL_TEEKEN} tecken per fält.`;
    }
    return null;
  }
  return "modell: sträng eller {providerId, modelId}-objekt krävs.";
}

/**
 * Fri sträng med tak — används för tankestyrka (nothink|low|medium|high|max-
 * liknande) och lage ("build"|"plan" + framtida nivåer). Semantiken äger
 * transporten/protokollet; rutten avvisar bara det uppenbart trasiga.
 */
function valideraFriStrang(falt: string, v: unknown): string | null {
  if (typeof v !== "string") return `${falt}: sträng krävs.`;
  const s = v.trim();
  if (!s) return `${falt}: får ej vara tom sträng (uteslut fältet för att behålla värdet).`;
  if (s.length > MAX_NIVA_TEEKEN) return `${falt}: max ${MAX_NIVA_TEEKEN} tecken.`;
  return null;
}

/** Strängfält ur ett opakt läs-svar — första icke-tomma kandidatnyckeln. */
function lasStrangfalt(r: Record<string, unknown>, nycklar: string[]): string | undefined {
  for (const n of nycklar) {
    const v = r[n];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

/** modell ur läs-svar: sträng ELLER {providerId, modelId} → "provider/modell". */
function tolkModellVarde(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (v && typeof v === "object") {
    const o = v as { providerId?: unknown; modelId?: unknown };
    if (
      typeof o.providerId === "string" && o.providerId.trim() &&
      typeof o.modelId === "string" && o.modelId.trim()
    ) {
      return `${o.providerId.trim()}/${o.modelId.trim()}`;
    }
  }
  return undefined;
}

/** Opakt läs-svar → kontraktets tre fält (defensiv — nyckelformen är C1:s). */
function mapInstallningar(raa: unknown): StudioInstallningar {
  if (!raa || typeof raa !== "object") return {};
  const r = raa as Record<string, unknown>;
  const modell = tolkModellVarde(r.modell ?? r.model);
  const tankestyrka = lasStrangfalt(r, ["tankestyrka", "tankeNiva", "thoughtLevel"]);
  const lage = lasStrangfalt(r, ["lage", "mode"]);
  return {
    ...(modell !== undefined ? { modell } : {}),
    ...(tankestyrka !== undefined ? { tankestyrka } : {}),
    ...(lage !== undefined ? { lage } : {}),
  };
}

// ── GET — aktuella workspace-standardvärden ──────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const transport = hamtaStudioTransport();
  const las = sondMetod(transport, ["lasWorkspaceInstallningar"]);
  if (!las) {
    // Protokollet saknar läsningen ⇒ tomt objekt (kontraktet) + saknas-markör
    // så panelen kan dölja sektionen i stället för att visa fel.
    return jsonSvar({ saknas: true });
  }
  try {
    return jsonSvar(mapInstallningar(await las()));
  } catch (fel) {
    if (arSaknas(fel)) return jsonSvar({ saknas: true });
    return jsonSvar({ fel: `Inställningarna kunde ej läsas: ${felText(fel)}` }, 502);
  }
}

// ── POST — PATCH-semantik: endast medföljande fält sparas ────────────────────

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let kropp: Record<string, unknown>;
  try {
    kropp = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }

  const transport = hamtaStudioTransport();

  // Validera + SONDERA metod per medföljande fält — ALDRIG någon partial
  // skrivning: om något fälts transportmetod saknas avvisas HELA begäran 501
  // innan ett enda värde hunnit sparas.
  interface Atgard {
    falt: string;
    metod: (...arg: unknown[]) => Promise<unknown>;
    varde: unknown;
  }
  const atgarder: Atgard[] = [];

  if (kropp.modell !== undefined) {
    const fel = valideraModell(kropp.modell);
    if (fel) return jsonSvar({ fel }, 400);
    const metod = sondMetod(transport, ["sattStandardModell", "sparaModell"]);
    if (!metod) return svarMetodSaknas("sattStandardModell");
    atgarder.push({ falt: "modell", metod, varde: kropp.modell });
  }
  if (kropp.tankestyrka !== undefined) {
    const fel = valideraFriStrang("tankestyrka", kropp.tankestyrka);
    if (fel) return jsonSvar({ fel }, 400);
    const metod = sondMetod(transport, [
      "sattStandardTankeNiva",
      "sparaTankestyrka",
      "sattStandardTankestyrka",
    ]);
    if (!metod) return svarMetodSaknas("sattStandardTankeNiva");
    atgarder.push({ falt: "tankestyrka", metod, varde: (kropp.tankestyrka as string).trim() });
  }
  if (kropp.lage !== undefined) {
    const fel = valideraFriStrang("lage", kropp.lage);
    if (fel) return jsonSvar({ fel }, 400);
    const metod = sondMetod(transport, ["sattStandardLage", "sparaLage"]);
    if (!metod) return svarMetodSaknas("sattStandardLage");
    atgarder.push({ falt: "lage", metod, varde: (kropp.lage as string).trim() });
  }

  if (atgarder.length === 0) {
    return jsonSvar(
      { fel: "Inget att spara — skicka minst ett av fälten modell/tankestyrka/lage." },
      400,
    );
  }

  const sparade: string[] = [];
  try {
    for (const a of atgarder) {
      await a.metod(a.varde);
      sparade.push(a.falt);
    }
  } catch (fel) {
    if (arSaknas(fel)) return svarMetodSaknas("sattStandard* (workspace-sparning)");
    return jsonSvar(
      { fel: `Sparningen misslyckades: ${felText(fel)}`, sparade },
      502,
    );
  }

  // Ärligt eko: återläs protokollens sanning när läsningen finns — annars
  // tomma inställningar (sparade-listan är garanten för vad som sattes).
  let installningar: StudioInstallningar = {};
  const las = sondMetod(transport, ["lasWorkspaceInstallningar"]);
  if (las) {
    try {
      installningar = mapInstallningar(await las());
    } catch {
      // ekot är lyx — sparade-listan räcker
    }
  }

  return jsonSvar({ ok: true, sparade, installningar });
}
