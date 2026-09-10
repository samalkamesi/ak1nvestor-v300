import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaStudioTransport,
  StudioMetodSaknasError,
  StudioTransport,
  StudioAutomation,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/automation — AUTOMATIONS-HANTERING, FULL CRUD
 * (VÅG 92 B2; v91 A1d var läsvy — våg 92 öppnar skapa/pausa/radera).
 *
 * GET    → {poster:[{id,namn,schema,status,napstaKorning?,aktiverad?,
 *          prompt?}]} — automation/list via transport.lasAutomationer
 *          (lifecycleStatus-union active|completed|failed|paused).
 *          Alias "automationer" (v91-form) behålls under integrationen.
 *          "napstaKorning" = våg-92-kontraktets stavning; "nastaKorning"
 *          (transportens stavning) bärs som alias — samma värde.
 * POST   {namn, schema, prompt} → automation/create via transport.
 *          automationSkapa. namn 1–80 tkn; schema cron-liknande 5–7 fält
 *          ELLER naturligt språk max 120 tkn; prompt 1–2 000 tkn.
 * DELETE ?id=… → automation/delete via transport.automationRadera.
 * Pausa/aktivera: POST /api/studio/tjanster/automation/pausa (egen rutt).
 *
 * B1-KONTRAKT VÅG 92 (landat): automationSkapa({namn, schema, prompt}) /
 * automationUppdatera(id, {pausad}) / automationRadera(id) — anropen är
 * TYPADE mot B1:s signaturer. typeof-vakten skyddar runtime-fallet
 * "transportINSTANSEN saknar metoden" (t.ex. dev-mock under uppbyggnad)
 * ⇒ 501 {saknas:true}; protokollserverns -32601 fångas av catchen (samma
 * 501 via StudioMetodSaknasError).
 *
 * ÄRLIG 501: metod saknas (typeof-kontroll eller -32601) ⇒ {saknas:true}.
 *
 * SKYDD: requireAdmin. Pedagogisk plattform — inte investeringsråd.
 */

/** namn-tak (tecken). */
const MAX_NAMN_TEEKEN = 80;
/** naturligt-språk-tak för schema (tecken) — cron-formen har fälträkning. */
const MAX_SCHEMA_TEEKEN = 120;
/** prompt-tak (tecken). */
const MAX_PROMPT_TEEKEN = 2_000;
/** id-tak (tecken) — protokoll-id är korta GUID:er. */
const MAX_ID_TEEKEN = 200;
/** Cron-liknande fält: siffror/bokstäver (MON-jan-namn), * , - / ? #. */
const CRON_FALT = /^[\w*,\-\/?#]+$/;

/** Normaliserad automationspost — v92-kontraktets fält + alias. */
interface AutomationPost {
  id: string;
  namn: string;
  schema: string;
  status: string;
  napstaKorning?: string;
  nastaKorning?: string;
  aktiverad?: boolean;
  prompt?: string;
  korningar?: number;
  senasteKorning?: string;
}

/**
 * VÅG 92 B1-KONTRAKT (landat): automationSkapa({namn, schema, prompt}) /
 * automationUppdatera(id, {pausad}) / automationRadera(id) finns på
 * transportstypen — anropen är TYPADE mot B1:s signaturer. typeof-vakten
 * nedan skyddar RUNTIME-fallet "transportinstansen saknar metoden" (t.ex.
 * en dev-mock under uppbyggnad) ⇒ ärlig 501 {saknas:true}; protokollserverns
 * -32601 fångas av StudioMetodSaknasError i catchen (samma 501).
 */

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** 501/502-vakt: transportmetoden saknas (-32601) ⇒ ärlig {saknas:true}. */
function svarVidTransportFel(fel: unknown, standard: string): Response {
  if (fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true) {
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

/**
 * Schema-validering: cron-liknande form = 5–7 vita fältrad där varje fält
 * håller cron-teckenuppsättningen; ANNARS naturligt språk med tak 120 tkn.
 * Lättvikt: vi avvisar det uppenbart trasiga — protokollservern är
 * sanningsägaren för cron-semantiken (t.ex. ogiltiga timmar).
 */
function valideraSchema(schema: string): string | null {
  if (!schema) {
    return `schema krävs (cron med 5–7 fält eller naturligt språk, max ${MAX_SCHEMA_TEEKEN} tecken).`;
  }
  const falt = schema.trim().split(/\s+/);
  if (
    falt.length >= 5 &&
    falt.length <= 7 &&
    falt.every((f) => f.length > 0 && CRON_FALT.test(f))
  ) {
    return null;
  }
  if (schema.length <= MAX_SCHEMA_TEEKEN) return null;
  return `schema: cron-form skall ha 5–7 fält, annars naturligt språk max ${MAX_SCHEMA_TEEKEN} tecken.`;
}

/** Transportens svenska fält → v92-kontraktets fält (alias behålls). */
function normaliseraAutomation(a: StudioAutomation): AutomationPost {
  const nasta = typeof a.nastaKorning === "string" && a.nastaKorning.trim() ? a.nastaKorning.trim() : undefined;
  return {
    id: a.id,
    namn: (typeof a.titel === "string" && a.titel.trim()) || a.id,
    schema: (typeof a.cron === "string" && a.cron.trim()) || "",
    status: (typeof a.status === "string" && a.status.trim()) || "okänd",
    ...(nasta ? { napstaKorning: nasta, nastaKorning: nasta } : {}),
    ...(typeof a.aktiverad === "boolean" ? { aktiverad: a.aktiverad } : {}),
    ...(typeof a.prompt === "string" && a.prompt ? { prompt: a.prompt } : {}),
    ...(typeof a.korningar === "number" ? { korningar: a.korningar } : {}),
    ...(typeof a.senasteKorning === "string" && a.senasteKorning ? { senasteKorning: a.senasteKorning } : {}),
  };
}

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const transport: StudioTransport = hamtaStudioTransport();
  try {
    const automationer = await transport.lasAutomationer();
    return jsonSvar({ poster: automationer.map(normaliseraAutomation), automationer });
  } catch (fel) {
    return svarVidTransportFel(fel, "Automationerna kunde ej listas.");
  }
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let namn = "";
  let schema = "";
  let prompt = "";
  try {
    const kropp = (await req.json()) as { namn?: unknown; schema?: unknown; prompt?: unknown };
    if (typeof kropp.namn === "string") namn = kropp.namn;
    if (typeof kropp.schema === "string") schema = kropp.schema;
    if (typeof kropp.prompt === "string") prompt = kropp.prompt;
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  namn = namn.trim();
  schema = schema.trim();
  prompt = prompt.trim();
  if (!namn || namn.length > MAX_NAMN_TEEKEN) {
    return jsonSvar({ fel: `namn krävs (1–${MAX_NAMN_TEEKEN} tecken).` }, 400);
  }
  const schemaFel = valideraSchema(schema);
  if (schemaFel) return jsonSvar({ fel: schemaFel }, 400);
  if (!prompt || prompt.length > MAX_PROMPT_TEEKEN) {
    return jsonSvar({ fel: `prompt krävs (1–${MAX_PROMPT_TEEKEN} tecken).` }, 400);
  }

  const transport: StudioTransport = hamtaStudioTransport();
  const automationSkapa = transport.automationSkapa;
  if (typeof automationSkapa !== "function") {
    return jsonSvar(
      { saknas: true, fel: "automationSkapa finns ej på transportinstansen." },
      501,
    );
  }
  try {
    const skapad = await automationSkapa({ namn, schema, prompt });
    return jsonSvar({
      ok: true,
      ...(skapad ? { id: skapad.id, post: normaliseraAutomation(skapad) } : {}),
    });
  } catch (fel) {
    return svarVidTransportFel(fel, "Automationen kunde ej skapas.");
  }
}

export async function DELETE(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const id = new URL(req.url).searchParams.get("id")?.trim() || "";
  if (!id) return jsonSvar({ fel: "id krävs (?id=…)." }, 400);
  if (id.length > MAX_ID_TEEKEN) return jsonSvar({ fel: "id är för långt." }, 400);

  const transport: StudioTransport = hamtaStudioTransport();
  const automationRadera = transport.automationRadera;
  if (typeof automationRadera !== "function") {
    return jsonSvar(
      { saknas: true, fel: "automationRadera finns ej på transportinstansen." },
      501,
    );
  }
  try {
    const svar = await automationRadera(id);
    return jsonSvar({ ok: true, raderad: svar.raderad, meddelande: svar.meddelande, id });
  } catch (fel) {
    return svarVidTransportFel(fel, "Automationen kunde ej raderas.");
  }
}
