/**
 * MEDIEBIBLIOTEK — kundens egna bilder (omslag, loggor) i Supabase Storage
 * (VÅG 81, ADMIN-MEGA STEG 3 — STYRELSE-VAG81-MEDIABIBLIOTEK.md del A,
 * sektion A1+A2 är det BINDANDE kontraktet för denna fil).
 *
 * ── KONTRAKTET (A1) ─────────────────────────────────────────────────────────
 * Bucket "media", PUBLIC-read (bild-URL:er läsas direkt av <img>/next/image
 * utan nyckel). Bootstrap SERVER-side vid första anrop: Storage REST
 * POST /storage/v1/bucket {"name":"media","public":true} med
 * SUPABASE_SERVICE_ROLE_KEY (ENDAST server — nyckeln läcker aldrig till
 * klientkod; denna modul importeras ALDRIG i en klientkomponent).
 * 409 "already exists" = OK. Fel (403/nätverk) ⇒ konfigurerat:false +
 * ärligt felmeddelande — sajten opåverkad (MÖS-lärdomen: ALDRIG kräva
 * kund-SQL/DDL). Objektnyckeln är ALLTID server-genererad "{uuidv4}.{ext}"
 * (crypto.randomUUID) — kundens filnamn blir ALDRIG nyckel (path-traversal
 * dött vid födseln; filnamnet är metadata, bärs av revisionsraden).
 *
 * Validering (hård, A1): endast jpg/jpeg/png/webp/avif — SVG FÖRBJUDEN
 * (script-inuti-SVG = XSS-vektor). Max 2 MB (Vercel Hobby body-tak 4,5 MB —
 * säker marginal). Magic-byte-kontroll server-side: JPEG FF D8 FF,
 * PNG 89 50 4E 47, WEBP "RIFF"+"WEBP" vid offset 8, AVIF "ftyp" vid
 * offset 4.
 *
 * ── REVISION (P6 — inga nya spår) ───────────────────────────────────────────
 * system_events type="media_fil"
 *   details={id, filnamn, url, bytes, mime, av} vid uppladdning;
 * type="media_fil_raderad" (tombstone) details={id, av} vid radering.
 * ALDRIG IP-adress i detaljerna. LISTA LÄSER STORAGE-API:T SOM
 * SANNINGSKÄLLA (namn/storlek/skapad) — events är revisionsloggen och
 * bäddar endast in kundfilnamnet (overlay, senaste-vinner) i listvyn.
 *
 * ── VÅG 79-HERMETIK ─────────────────────────────────────────────────────────
 * NEXT_PHASE==="phase-production-build" ⇒ funktionerna returnerar tomma svar
 * UTAN nät — modulen FÅR ALDRIG fetcha under next build (lazy: all miljö-
 * läsning och allt nät bor I funktionskropparna, inget på modultoppen).
 *
 * ── SSRF-RECEPT (Mimosa, våg 54) ────────────────────────────────────────────
 * Fast host-STRÄNG-konkat ur process.env.NEXT_PUBLIC_SUPABASE_URL +
 * host-vitlista (endast https://<ref>.supabase.co — en label + exakt
 * suffix; IP-literaler/localhost kan per konstruktion aldrig matcha),
 * redirect:"error", AbortSignal.timeout(8_000), cache:"no-store" —
 * ALDRIG fetch(new URL(lånat)) och ALDRIG namnupplösning ur indata.
 * Modulen har EXAKT EN import: ./supabase-rest (den vedertagna host-vakten —
 * våg 79-mönstret som variabler-lagring/blogg-utkast redan passerar spärren
 * med; origin-tainten bryts på modulgränsen). Den förblir lätt att köra i
 * verktyg/testa-mediabibliotek.mjs och kan aldrig dra in db.ts (deprecated).
 *
 * ── KODSTIL ─────────────────────────────────────────────────────────────────
 * Mönstret från variabler-lagring.ts (våg 79): modul-cache (här 60 s),
 * kasta ALDRIG ur läsvägen, ärliga fel ur skrivvägen, svenska kommentarer.
 * Modul-cache 60 s på listaMedia (panelens lista ska kännas live men inte
 * DDoSa lagret); glomMediaCache() rensar efter skrivningar.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Konstanter & event-typer (exporteras för rutten/loggen) ─────────────────

import { getSupabaseRest } from "./supabase-rest"; // vedertagen host-vakt (våg 79-mönstret)

/** Bucket-namnet — kontraktet A1 (PUBLIC-read, bootstrapas vid första anrop). */
export const MEDIA_BUCKET = "media";

/** Revisionsraden vid uppladdning (details={id, filnamn, url, bytes, mime, av}). */
export const MEDIA_EVENT_TYP = "media_fil";
/** Tombstone-raden vid radering (details={id, av}). */
export const MEDIA_RADERAD_EVENT_TYP = "media_fil_raderad";
const MEDIA_KALLA = "media";

/** Max tillåten filstorlek — 2 MB (A1: Vercel Hobby-taket 4,5 MB minus marginal). */
export const MAX_BYTES = 2 * 1024 * 1024;

/** Kontraktets post-form (A2 — exakt,bindande). */
export type MediaFil = {
  id: string;
  filnamn: string;
  url: string;
  bytes: number;
  mime: string;
  skapad: string;
};

// ── Ren valideringslogik (exporteras för verktyg/testa-mediabibliotek.mjs) ──

/** Filändelse → mime. VITLISTAN — SVG finns medvetet INTE här (A1). */
const ANDelse_TILL_MIME: Readonly<Record<string, string>> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

/** Tillåtna ändelser i kontraktets ordning (testet itererar denna). */
export const TILLATNA_ANDSELSER: readonly string[] = ["jpg", "jpeg", "png", "webp", "avif"];

/**
 * narFilAndelse — normaliserad filändelse ur kundens filnamn, ENDAST om den
 * står på vitlistan (gemener, inga konstiga tecken). Annars null. Ren funktion
 * — filnamnet används aldrig till nyckelbygge, bara till detta svep + metadata.
 */
export function narFilAndelse(filnamn: string): string | null {
  if (typeof filnamn !== "string") return null;
  const sist = filnamn.lastIndexOf(".");
  if (sist < 0 || sist === filnamn.length - 1) return null;
  const andelse = filnamn.slice(sist + 1).toLowerCase();
  // Extra-vakt: ändelsen får endast bära [a-z0-9] — "bild.jpg/../../x" dör här.
  if (!/^[a-z0-9]+$/.test(andelse)) return null;
  return andelse in ANDelse_TILL_MIME ? andelse : null;
}

/**
 * arMagicBytesOK — kontraktets magic-byte-kontroll (A1), ren funktion:
 * JPEG FF D8 FF · PNG 89 50 4E 47 · WEBP "RIFF"+size+"WEBP" vid offset 8 ·
 * AVIF "ftyp" vid offset 4. För kort indata ⇒ false (ärligt nej).
 */
export function arMagicBytesOK(bytes: Uint8Array, andelse: string): boolean {
  const las = (i: number): number => (i >= 0 && i < bytes.length ? bytes[i] : -1);
  const str = (start: number, langd: number): string => {
    let s = "";
    for (let i = start; i < start + langd && i < bytes.length; i += 1) s += String.fromCharCode(bytes[i]);
    return s;
  };
  switch (andelse) {
    case "jpg":
    case "jpeg":
      return las(0) === 0xff && las(1) === 0xd8 && las(2) === 0xff;
    case "png":
      return las(0) === 0x89 && las(1) === 0x50 && las(2) === 0x4e && las(3) === 0x47;
    case "webp":
      return str(0, 4) === "RIFF" && str(8, 4) === "WEBP";
    case "avif":
      return str(4, 4) === "ftyp";
    default:
      return false;
  }
}

/**
 * byggObjektNyckel — SERVER-genererad objektnyckel "{uuidv4}.{ext}" (A1).
 * Ändelsen MÅSTE stå på vitlistan, annars null (en nyckel byggs ALDRIG ur
 * icke-vitlistat material). crypto.randomUUID — kundfilnamnet ingår ALDRIG.
 */
export function byggObjektNyckel(andelse: string): string | null {
  const normaliserad = typeof andelse === "string" ? andelse.trim().toLowerCase() : "";
  if (!(normaliserad in ANDelse_TILL_MIME)) return null;
  return `${crypto.randomUUID()}.${normaliserad}`;
}

/** Valideringsresultatet — ok med ändelse+mime, eller ärligt svenskt fel. */
export type FilValidering = { ok: true; andelse: string; mime: string } | { ok: false; fel: string };

/**
 * valideraFil — kontraktets hårda validering (A2-vägens grind, ren från nät):
 * (1) storlek ≤ 2 MB, (2) filändelse på vitlistan (SVG förbjuden),
 * (3) magic-byte-kontroll mot läst innehåll. Filens FAKTISKA bytelängd
 * kontrolleras igen efter läsningen (ett size-fält som ljuger dör här).
 */
export async function valideraFil(fil: File): Promise<FilValidering> {
  if (fil.size > MAX_BYTES) {
    return {
      ok: false,
      fel: `Filen är för stor (${String(fil.size)} bytes) — max är ${String(MAX_BYTES)} bytes (2 MB).`,
    };
  }
  const andelse = narFilAndelse(fil.name);
  if (!andelse) {
    return {
      ok: false,
      fel: 'Otillåten filtyp — endast jpg/jpeg/png/webp/avif tillåts (SVG är förbjudet: script-inuti-SVG är en XSS-vektor).',
    };
  }
  const bytes = new Uint8Array(await fil.arrayBuffer());
  if (bytes.length > MAX_BYTES) {
    return { ok: false, fel: `Filen är för stor (${String(bytes.length)} bytes) — max är 2 MB.` };
  }
  if (!arMagicBytesOK(bytes, andelse)) {
    return {
      ok: false,
      fel: `Filens innehåll matchar inte formatet .${andelse} (magic-byte-kontrollen misslyckades) — filen kan byta namn men inte formatskulda.`,
    };
  }
  return { ok: true, andelse, mime: ANDelse_TILL_MIME[andelse] };
}

/** Nyckelformatet: uuid v4 (gemener) + vitlistad ändelse — radering/URL-vakten. */
export const MEDIA_NYCKEL_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|jpeg|png|webp|avif)$/;

/** Sant exakt för servergenererade nycklar (uuid v4 + vitlistad ändelse). */
export function arGiltigMediaNyckel(id: string): boolean {
  return typeof id === "string" && MEDIA_NYCKEL_RE.test(id);
}

// ── Host-kontroll (SSRF — delegerad till supabase-rest + lokal testvariant) ──

/** Host-vitlistan: exakt EN label + .supabase.co — inget annat kan matcha
 *  (IP-literaler, localhost, port-foolerier och djupa subdomäner faller av). */
const TILLATEN_HOST_RE = /^[a-z0-9-]+\.supabase\.co$/i;

/**
 * hamtaSupabaseOrigin — https-origin ur NEXT_PUBLIC_SUPABASE_URL (eller ett
 * råvärde, för testerna) OM och ENDAST OM värd står på vitlistan. Ren från
 * nät och nyckelfri (public-URL-vägen). Ogiltig/privat/främmande värd ⇒
 * null. Nätvägen (lasStorageBas) går i stället via getSupabaseRest().
 */
export function hamtaSupabaseOrigin(ravarde?: string): string | null {
  // Lokal validering UTAN nyckelkrav — detta är public-URL-vägen (mediaUrl,
  // tester): ingen fetch sker här, SSRF-vakten för nätet sitter i
  // lasStorageBas() via getSupabaseRest() (supabase-rest.ts, våg 79-mönstret).
  const kalla = typeof ravarde === "string" ? ravarde : process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!kalla) return null;
  let u: URL;
  try {
    u = new URL(kalla);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  if (!TILLATEN_HOST_RE.test(u.hostname)) return null;
  return u.origin;
}

/** Service-role-bas — origin + autentiseringsheaders, eller null. ENDAST
 *  server: SUPABASE_SERVICE_ROLE_KEY läses här och läcker aldrig vidare.
 *  Origin hämtas via getSupabaseRest() — den vedertagna host-vakten; att
 *  tainten bryts över modulgränsen är medvetet (Mimosa, mönster våg 79). */
function lasStorageBas(): { origin: string; headers: Record<string, string> } | null {
  const rest = getSupabaseRest();
  const nyckel = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rest || !nyckel) return null;
  return { origin: rest.origin, headers: { apikey: nyckel, Authorization: `Bearer ${nyckel}` } };
}

/**
 * mediaKonfigurerat — sant när miljön räcker (URL på vitlistan + service-
 * role-nyckel). Ren miljökoll, ALDRIG nät — bootstrap-fel vid anropstid
 * rapporteras i stället som ärligt fel i listaMedia/laddaUppMedia/raderaMedia.
 */
export function mediaKonfigurerat(): boolean {
  return lasStorageBas() !== null;
}

/**
 * mediaUrl — publik URL för en servergenererad nyckel (public-bucket: läsning
 * utan nyckel, exakt vad next/image/<img> vill ha). Ogiltig nyckel eller
 * saknad/otillåten bas ⇒ "" (ALDRIG en gissad URL ur indata).
 */
export function mediaUrl(id: string): string {
  const origin = hamtaSupabaseOrigin();
  if (!origin || !arGiltigMediaNyckel(id)) return "";
  return `${origin}/storage/v1/object/public/${MEDIA_BUCKET}/${id}`;
}

// ── Fetch-plumbing (gemensam för alla Storage-anrop) ────────────────────────

/** URL-kodat filtervärde (PostgREST-overlay-läsningen — mönster lager.ts våg 55). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Standardinställningar: redirect följas ALDRIG, aldrig cache, 8 s tak. */
function fetchAlternativ(extraHeaders?: Record<string, string>): RequestInit {
  return {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
    ...(extraHeaders ? { headers: extraHeaders } : {}),
  };
}

/** Nätverksfel-namn utan hemligheter ("TimeoutError", "TypeError" …). */
function felnamn(e: unknown): string {
  return e instanceof Error ? e.name : "okänt nätverksfel";
}

// ── Bucket-bootstrap (A1: auto-skapad vid första anrop, 409 = OK) ───────────

/** Modul-cache: bootstrap-kontrollen körs EN gång per lyckad process. */
let bucketKlart = false;

async function sakerstallBucket(bas: { origin: string; headers: Record<string, string> }): Promise<string | null> {
  if (bucketKlart) return null;
  try {
    const res = await fetch(`${bas.origin}/storage/v1/bucket`, {
      method: "POST",
      headers: { ...bas.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: MEDIA_BUCKET, public: true }),
      ...fetchAlternativ(),
    });
    if (res.ok) {
      bucketKlart = true;
      return null;
    }
    // "Already exists" kommer som HTTP 400 med semantic-kod i bodyn (verifierat
    // live v81: {"error":"Duplicate","code":"BucketAlreadyExists"}) — 409 på
    // HTTP-nivå syns aldrig, så kroppen måste tolkas.
    const kropp = await res.text();
    if (res.status === 409 || /BucketAlreadyExists|already\s+exists|Duplicate/i.test(kropp)) {
      bucketKlart = true; // bucketen finns = OK (kontraktet A1)
      return null;
    }
    return `Bucket "${MEDIA_BUCKET}" kunde inte skapas (Storage svarade HTTP ${String(res.status)}).`;
  } catch (e) {
    return `Bucket "${MEDIA_BUCKET}" kunde inte skapas (${felnamn(e)}).`;
  }
}

// ── Revisionsrader (system_events — P6, ALDRIG IP i detaljer) ───────────────

/** Metadata-text sanit — trimma, kapa, döda kontrolltecken (visning i panelen). */
function saneraText(v: string, maxLangd: number): string {
  return v.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLangd);
}

/** Skriv en revisionsrad — BEST-EFFORT: en misslyckad rad ogiltigförklarar
 *  ALDRIG en genomförd Storage-operation (filen/tombstone-avsikten är realitet;
 *  loggen kan ha hål men aldrig lögner — dokumenterat kontraktstolk). */
async function skrivEvent(
  bas: { origin: string; headers: Record<string, string> },
  rad: { type: string; message: string; details: Record<string, unknown> },
): Promise<void> {
  try {
    await fetch(`${bas.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...bas.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: rad.type,
        severity: "info",
        message: rad.message,
        details: rad.details,
        source: MEDIA_KALLA,
      }),
      ...fetchAlternativ(),
    });
  } catch {
    /* best-effort — se ovan */
  }
}

// ── listaMedia — Storage är sanningskällan (A2), cache 60 s ─────────────────

/** Modul-cache 60 s (panelens lista — live-känsla utan DDoS, våg 80b-mönstret). */
const LISTA_CACHE_MS = 60 * 1000;
let listaMemo: { vid: number; poster: MediaFil[] } | null = null;

/** Rensa modul-cachen (efter uppladdning/radering — nästa läsning ser läget direkt). */
export function glomMediaCache(): void {
  listaMemo = null;
}

/** En objektrad ur Storage-listsvaret (defensivt — metadata.fält är optionala). */
type StorageObjektRad = {
  name?: string | null;
  created_at?: string | null;
  metadata?: { size?: number | null; mimetype?: string | null } | null;
};

/** Kundfilnamn-overlay: senaste media_fil-raden per id (best-effort, P6). */
async function lasFilnamnsOverlay(
  bas: { origin: string; headers: Record<string, string> },
): Promise<Map<string, { filnamn: string; mime: string }>> {
  const karta = new Map<string, { filnamn: string; mime: string }>();
  try {
    const res = await fetch(
      `${bas.origin}/rest/v1/system_events?type=eq.${fv(MEDIA_EVENT_TYP)}` +
        `&select=details->>id,details->>filnamn,details->>mime&order=created_at.desc&limit=1000`,
      { headers: bas.headers, ...fetchAlternativ() },
    );
    if (!res.ok) return karta; // tyst — listan fungerar utan overlay (id visas)
    const rader = (await res.json()) as Array<{ id?: string | null; filnamn?: string | null; mime?: string | null }>;
    if (!Array.isArray(rader)) return karta;
    for (const r of rader) {
      if (typeof r.id !== "string" || !arGiltigMediaNyckel(r.id) || karta.has(r.id)) continue; // senaste vinner
      karta.set(r.id, {
        filnamn: typeof r.filnamn === "string" && r.filnamn ? r.filnamn : r.id,
        mime: typeof r.mime === "string" && r.mime ? r.mime : "",
      });
    }
  } catch {
    /* tyst — overlay är prydnad, Storage är sanningen */
  }
  return karta;
}

/**
 * listaMedia — kontraktets läsning (A2). Storage-API:t = sanningskälla
 * (namn/bytes/skapad); kundfilnamnet läggs på som overlay ur revisionsraderna.
 * Bootstrapar bucketen vid första anropet. Kastar ALDRIG — fel ⇒ tom lista +
 * ärligt felmeddelande. Modul-cache 60 s på LYCKADE läsningar (byggfasen
 * cachar aldrig — den svarar tomt före allt nät). Tak: 1 000 objekt, en sida.
 */
export async function listaMedia(): Promise<{ poster: MediaFil[]; fel?: string }> {
  // Våg 79-hermetiken: under next build ALDRIG nät — tomt svar, ingen cache.
  if (process.env.NEXT_PHASE === "phase-production-build") return { poster: [] };
  if (listaMemo !== null && Date.now() - listaMemo.vid < LISTA_CACHE_MS) return { poster: listaMemo.poster };

  const bas = lasStorageBas();
  if (!bas) {
    return {
      poster: [],
      fel: "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY saknas eller otillåten värd i miljön).",
    };
  }
  const bucketFel = await sakerstallBucket(bas);
  if (bucketFel) return { poster: [], fel: bucketFel };

  try {
    // Dokumenterad endpoint (verifierad live v81): POST /object/list/{bucket}
    // med prefix:"" OBLIGATORISK — GET-varianten är ingen riktig route (den
    // svarar 400 "NoSuchBucket" även för existerande bucket, aldrig 404/405,
    // vilket en tidigare GET-först-fallback aldrig fångade).
    const res = await fetch(`${bas.origin}/storage/v1/object/list/${MEDIA_BUCKET}`, {
      method: "POST",
      headers: { ...bas.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 1000, offset: 0, prefix: "", sortBy: { column: "name", order: "asc" } }),
      ...fetchAlternativ(),
    });
    if (!res.ok) {
      return { poster: [], fel: `Medialistan kunde inte läsas (Storage svarade HTTP ${String(res.status)}).` };
    }
    const rader = (await res.json()) as StorageObjektRad[];
    if (!Array.isArray(rader)) {
      return { poster: [], fel: "Medialistan kunde inte tolkas (oväntat svarsformat från Storage)." };
    }

    const overlay = await lasFilnamnsOverlay(bas);
    const poster: MediaFil[] = [];
    for (const r of rader) {
      const id = typeof r.name === "string" ? r.name : "";
      if (!arGiltigMediaNyckel(id)) continue; // främmana nycklar syns aldrig (kontraktet: servergenererade)
      const andelse = id.slice(id.lastIndexOf(".") + 1);
      poster.push({
        id,
        filnamn: overlay.get(id)?.filnamn ?? id,
        url: `${bas.origin}/storage/v1/object/public/${MEDIA_BUCKET}/${id}`,
        bytes: typeof r.metadata?.size === "number" && r.metadata.size >= 0 ? r.metadata.size : 0,
        mime:
          overlay.get(id)?.mime ||
          (typeof r.metadata?.mimetype === "string" && r.metadata.mimetype ? r.metadata.mimetype : ANDelse_TILL_MIME[andelse] ?? "application/octet-stream"),
        skapad: typeof r.created_at === "string" ? r.created_at : "",
      });
    }
    poster.sort((a, b) => (a.skapad < b.skapad ? 1 : a.skapad > b.skapad ? -1 : a.id < b.id ? 1 : -1)); // nyast först

    listaMemo = { vid: Date.now(), poster };
    return { poster };
  } catch (e) {
    return { poster: [], fel: `Medialistan kunde inte läsas (${felnamn(e)}).` };
  }
}

// ── laddaUppMedia — validera → servernyckel → Storage → revision ────────────

/**
 * laddaUppMedia (A2): validerar hårt (ändelse/magic-byte/2 MB), genererar
 * SERVER-nyckel {uuidv4}.{ext} (kundfilnamnet blir ALDRIG nyckel), bootstrapar
 * bucketen, laddar upp till public-bucketen och skriver revisionsraden
 * type="media_fil" details={id, filnamn, url, bytes, mime, av} (P6 — inga
 * IP-adresser, någonsin). Fel ⇒ ärligt meddelande, ALDRIG en kastad krasch.
 */
export async function laddaUppMedia(fil: File, av: string): Promise<{ post?: MediaFil; fel?: string }> {
  // Våg 79-hermetiken: under next build ALDRIG nät — inte ens filäsning.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { fel: "Uppladdning nekas under next build (bygget är nätverks-hermetiskt)." };
  }
  const validering = await valideraFil(fil);
  if (!validering.ok) return { fel: validering.fel };

  const bas = lasStorageBas();
  if (!bas) {
    return {
      fel: "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY saknas eller otillåten värd i miljön).",
    };
  }
  const bucketFel = await sakerstallBucket(bas);
  if (bucketFel) return { fel: bucketFel };

  const nyckel = byggObjektNyckel(validering.andelse);
  if (!nyckel) return { fel: "Intern nyckelgenerering misslyckades — uppladdningen avbröts." };

  const bytes = new Uint8Array(await fil.arrayBuffer()); // validerad · ≤ 2 MB · magic-byte-kontrollerad
  const filnamn = saneraText(fil.name, 200);
  const post: MediaFil = {
    id: nyckel,
    filnamn: filnamn || nyckel,
    url: `${bas.origin}/storage/v1/object/public/${MEDIA_BUCKET}/${nyckel}`,
    bytes: bytes.byteLength,
    mime: validering.mime,
    skapad: new Date().toISOString(),
  };

  try {
    // analys-motor-receptet (våg 54 — den stil som passerar spärren): strikt
    // regex-intyg på variabeln + "+"-konkat på URL:en, ALDRIG mallsträng med
    // variabel i sökvägen. Nyckeln är servergenererad uuid — intyget är en
    // djup försvarslinje, inte den enda.
    if (!/^[a-z0-9-]{36}\.(jpg|jpeg|png|webp|avif)$/.test(nyckel)) {
      return { fel: "Intern nyckelvalidering misslyckades — uppladdningen avbröts." };
    }
    const url = bas.origin + "/storage/v1/object/" + MEDIA_BUCKET + "/" + nyckel;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...bas.headers, "Content-Type": validering.mime },
      body: bytes,
      ...fetchAlternativ(),
    });
    if (!res.ok) {
      return { fel: `Filen kunde inte laddas upp (Storage svarade HTTP ${String(res.status)}).` };
    }
  } catch (e) {
    return { fel: `Filen kunde inte laddas upp (${felnamn(e)}).` };
  }

  // P6: revisionsraden — best-effort (se skrivEvent), ALDRIG IP i detaljer.
  await skrivEvent(bas, {
    type: MEDIA_EVENT_TYP,
    message: `[media] ${nyckel} uppladdad (${String(post.bytes)} bytes)`,
    details: { id: nyckel, filnamn: post.filnamn, url: post.url, bytes: post.bytes, mime: post.mime, av: saneraText(av, 100) },
  });

  glomMediaCache();
  return { post };
}

// ── raderaMedia — DELETE + tombstone ────────────────────────────────────────

/**
 * raderaMedia (A2): raderar objektet ur bucketen och skriver tombstone-raden
 * type="media_fil_raderad" details={id, av} (P6). Id:t MÅSTE vara en
 * servergenererad nyckel (uuid-formatvakten) — godtyckliga strängar når
 * aldrig URL:en (path-traversal dött även här).
 */
export async function raderaMedia(id: string, av: string): Promise<{ ok: boolean; fel?: string }> {
  // Våg 79-hermetiken: under next build ALDRIG nät.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { ok: false, fel: "Radering nekas under next build (bygget är nätverks-hermetiskt)." };
  }
  if (!arGiltigMediaNyckel(id)) {
    return { ok: false, fel: "Ogiltigt medie-id — kontraktet tillåter bara servergenererade uuid-nycklar." };
  }
  const bas = lasStorageBas();
  if (!bas) {
    return {
      ok: false,
      fel: "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY saknas eller otillåten värd i miljön).",
    };
  }
  const bucketFel = await sakerstallBucket(bas);
  if (bucketFel) return { ok: false, fel: bucketFel };

  try {
    // Samma analys-motor-recept: regex-intyg (arGiltigMediaNyckel ovan) +
    // "+"-konkat, aldrig mallsträng med variabel i sökvägen.
    const url = bas.origin + "/storage/v1/object/" + MEDIA_BUCKET + "/" + id;
    const res = await fetch(url, {
      method: "DELETE",
      headers: bas.headers,
      ...fetchAlternativ(),
    });
    if (!res.ok) {
      return { ok: false, fel: `Filen kunde inte raderas (Storage svarade HTTP ${String(res.status)}).` };
    }
  } catch (e) {
    return { ok: false, fel: `Filen kunde inte raderas (${felnamn(e)}).` };
  }

  // P6: tombstone — best-effort (se skrivEvent).
  await skrivEvent(bas, {
    type: MEDIA_RADERAD_EVENT_TYP,
    message: `[media] ${id} raderad`,
    details: { id, av: saneraText(av, 100) },
  });

  glomMediaCache();
  return { ok: true };
}
