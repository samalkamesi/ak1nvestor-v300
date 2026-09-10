import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaStudioTransport,
  StudioMetodSaknasError,
  StudioTransport,
  StudioWebblasare,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/webblasare — WEBBLÄSAR-PANEL, FULL FORM (VÅG 92 B2;
 * v91 A1d-grunden).
 *
 * GET  → {sidor:[{id,titel,url}]} — interaction/browserList via transport.
 *        lasWebblasare (transporten bär den fulla kontext kartan kräver:
 *        requestId+sessionId+workspace+clientMode+sessionContext). Alias
 *        "blasare" behålls för v91-UI:t under integrationen.
 * POST {url}            → navigering: strikt validerad URL (http/https
 *        ENDAST, tak 2 048 tecken, inga kontrolltecken) → deterministiskt
 *        open-kommando → transport.korWebblasare (interaction/browserExecute
 *        — transportmetoden sköter protokollformen + full kontext).
 * POST {kommando, browserId?, browserGeneration?} → execute-åtgärd (v91-
 *        formen kvar, t.ex. "klicka Logga in").
 *
 * SVAR NORMALISERAS: {sidor:[{id,titel,url}], resultat?:{titel,url,utdrag}}
 * — protokollets _Z-svar är opakt; fälten sonderas defensivt (titel/url/
 * utdrag ur kända namn) och utdragen trunkeras (300 tecken). Sidlistan i
 * svaret tas ur svarets egna pages/tabs/browsers-fält när det bär en sådan
 * — annars tom (UI:t laddar om via GET).
 *
 * ÄRLIG 501: -32601 ⇒ {saknas:true} — UI:t DÖLJER panelen (zcode-versionen
 * saknar interaktionsdomänens webbläsarmetoder).
 *
 * SKYDD: requireAdmin. Pedagogisk plattform — inte investeringsråd.
 */

/** URL-tak (tecken) — navigeringen får aldrig bli en trojansk häst. */
const MAX_URL_TEEKEN = 2_048;

/** Kommandotak (tecken) — samma budget som transportens execute-kapning. */
const MAX_KOMMANDO_TEEKEN = 4_000;

/** Kontrolltecken (C0 + DEL) + alla vita — ALDRIG tillåtna i en URL. */
const OTILLATNA_URL_TECKEN = /[\u0000-\u001F\u007F\s]/;

/** En normaliserad webbläsarsida (sidlistan + panelens huvudrad). */
interface StudioSida {
  id: string;
  titel: string;
  url: string;
}

/** Normaliserat körresultat — panelens titel+url+utdrag-kort. */
interface StudioResultat {
  titel: string;
  url: string;
  utdrag: string;
}

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Objekt-sond: okänd protokollkropp som nyckelkarta (ALDRIG "as any"). */
function somKalla(väste: unknown): Record<string, unknown> {
  return väste !== null && typeof väste === "object" ? (väste as Record<string, unknown>) : {};
}

/** Första icke-tomma strängen bland kandidatnamnen (protokollet är opakt). */
function strangfalt(kalla: Record<string, unknown>, namn: readonly string[]): string {
  for (const n of namn) {
    const v = kalla[n];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/**
 * Strikt URL-validering: http/https-prefix KRAVS, tak 2 048 tecken, inga
 * kontroll-/vitatecken, new URL()-rundtur som normaliserar (dubbel-
 * skrivningar, port, path). Anropet går via stdio-transporten — INTE fetch
 * — men valideringen är ändå hård. encodeURIComponent ändamålsenligt EJ
 * använt på HELA URL:en (den skall förbli navigerbar); hårdheten ligger i
 * prefix+teckentak+C0-avvisning.
 */
function valideraUrl(rå: string): { url: string } | { fel: string } {
  const url = rå.trim();
  if (!url) return { fel: "url krävs." };
  if (url.length > MAX_URL_TEEKEN) return { fel: `url är för lång (max ${MAX_URL_TEEKEN} tecken).` };
  if (OTILLATNA_URL_TECKEN.test(url)) return { fel: "url innehåller otillåtna tecken." };
  if (!/^https?:\/\//i.test(url)) return { fel: "url måste börja med http:// eller https://." };
  let tolkad: URL;
  try {
    tolkad = new URL(url);
  } catch {
    return { fel: "url kunde ej tolkas." };
  }
  if (tolkad.protocol !== "http:" && tolkad.protocol !== "https:") {
    return { fel: "Endast http/https stöds." };
  }
  return { url: tolkad.href };
}

/** GET-listan: transportens webbläsarrad → sida (url kan saknas i v91-form). */
function normaliseraWebblasareRad(b: StudioWebblasare): StudioSida {
  const kalla = somKalla(b);
  return {
    id: b.id,
    titel: (typeof b.namn === "string" && b.namn.trim()) || b.id,
    url: strangfalt(kalla, ["url", "href", "address", "finalUrl"]),
  };
}

/** Sidlista ur execute-svaret — sonderar kända nycklar, annars tom lista. */
function normaliseraSidor(rå: unknown): StudioSida[] {
  const kalla = somKalla(rå);
  for (const nyckel of ["pages", "tabs", "sidor", "browsers", "results"]) {
    const lista = kalla[nyckel];
    if (!Array.isArray(lista)) continue;
    const ut: StudioSida[] = [];
    for (const post of lista) {
      const p = somKalla(post);
      const id = strangfalt(p, ["id", "tabId", "pageId", "browserId"]);
      if (!id) continue;
      ut.push({
        id,
        titel: strangfalt(p, ["titel", "title", "name", "namn"]) || id,
        url: strangfalt(p, ["url", "href", "address", "finalUrl"]),
      });
    }
    if (ut.length > 0) return ut;
  }
  return [];
}

/** Körresultat: titel/url/utdrag ur opakt _Z-svar; utdrag max 300 tecken. */
function normaliseraResultat(rå: unknown): StudioResultat | undefined {
  if (rå === null || rå === undefined) return undefined;
  if (typeof rå !== "object") {
    const text = typeof rå === "string" ? rå.trim() : String(rå);
    return text ? { titel: "", url: "", utdrag: text.slice(0, 300) } : undefined;
  }
  const kalla = somKalla(rå);
  const titel = strangfalt(kalla, ["titel", "title", "name", "namn"]);
  const url = strangfalt(kalla, ["url", "href", "address", "finalUrl"]);
  let utdrag = strangfalt(kalla, [
    "utdrag",
    "excerpt",
    "text",
    "content",
    "description",
    "summary",
    "result",
  ]);
  if (!utdrag) {
    // Ärlig reserv: korta JSON-formen — panelen får alltid något att visa.
    try {
      utdrag = JSON.stringify(rå).slice(0, 300);
    } catch {
      utdrag = "";
    }
  } else {
    utdrag = utdrag.slice(0, 300);
  }
  if (!titel && !url && !utdrag) return undefined;
  return { titel, url, utdrag };
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

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const transport: StudioTransport = hamtaStudioTransport();
  try {
    const blasare = await transport.lasWebblasare();
    return jsonSvar({ sidor: blasare.map(normaliseraWebblasareRad), blasare });
  } catch (fel) {
    return svarVidTransportFel(fel, "Webbläsarna kunde ej listas.");
  }
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let url = "";
  let kommando = "";
  let browserId = "";
  let browserGeneration: number | undefined;
  try {
    const kropp = (await req.json()) as {
      url?: unknown;
      kommando?: unknown;
      browserId?: unknown;
      browserGeneration?: unknown;
    };
    if (typeof kropp.url === "string") url = kropp.url.trim();
    if (typeof kropp.kommando === "string") kommando = kropp.kommando;
    if (typeof kropp.browserId === "string") browserId = kropp.browserId.trim();
    if (
      typeof kropp.browserGeneration === "number" &&
      Number.isInteger(kropp.browserGeneration) &&
      kropp.browserGeneration >= 0
    ) {
      browserGeneration = kropp.browserGeneration;
    }
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }

  if (url && kommando.trim()) {
    return jsonSvar({ fel: "Ange antingen url ELLER kommando — inte båda." }, 400);
  }

  let effektivtKommando = "";
  if (url) {
    const kontroll = valideraUrl(url);
    if ("fel" in kontroll) return jsonSvar({ fel: kontroll.fel }, 400);
    // Navigering: deterministiskt open-kommando — transporten bär den fulla
    // kontexten (requestId/sessionId/workspace/clientMode/sessionContext)
    // och protokollformen i korWebblasare.
    effektivtKommando = `open ${kontroll.url}`;
  } else if (kommando.trim()) {
    effektivtKommando = kommando.trim().slice(0, MAX_KOMMANDO_TEEKEN);
  } else {
    return jsonSvar({ fel: "url eller kommando krävs." }, 400);
  }

  const transport: StudioTransport = hamtaStudioTransport();
  try {
    const rå = await transport.korWebblasare({
      kommando: effektivtKommando,
      ...(browserId ? { browserId } : {}),
      ...(browserGeneration !== undefined ? { browserGeneration } : {}),
    });
    const sidor = normaliseraSidor(rå);
    const resultat = normaliseraResultat(rå);
    return jsonSvar(resultat ? { sidor, resultat } : { sidor });
  } catch (fel) {
    return svarVidTransportFel(fel, "Kommandot kunde ej köras.");
  }
}
