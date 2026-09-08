import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { getCourseList } from "@/lib/content";
import { getSupabaseRest } from "@/lib/supabase-rest";
import {
  lasKursOverrides,
  skrivKursMetadata,
  type KursMetadataFalt,
} from "@/lib/kurs-metadata-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/kurser — KURSPANELENS data-rutt (VÅG 82 del A2, ADMIN-MEGA
 * steg 4 — STYRELSE-VAG82-BYGG.md §A2).
 *
 * GET  → { kurser: [{slug, fil: {title,summary,learn,why}, gallande: {…},
 *          kalla: "fil"|"panel", andrad}], logg: [senaste 20 rader av
 *          type="kurs_metadata-andring"] } — 333 poster ur getCourses()
 *          (getCourseList = samma källa, slugsorterad) sammanslagna med
 *          lasKursOverrides() (nyckel "{slug}.{falt}", senaste-vinner,
 *          tombstone = nyckeln borta = filvärdet gäller). gallande är
 *          mergeat per fält; kalla är "panel" när NÅGOT av de fyra
 *          vitlistefälten har en live-override, annars "fil" (oförändrade
 *          fält syns genom att gallande === fil där). andrad = senaste
 *          ändrings-tiden för sluge (ur ändringsloggen, nyast-först) |
 *          null när kursen aldrig rörts i panelen.
 * POST { slug, falt, varde|null } → skrivKursMetadata (kärnan validerar
 *          HÅRT: slug i deep-courses, falt i vitlistan, längdtak,
 *          kontrolleraText 0 FEL; varde=null = tombstone/rollback) →
 *          200 {ok: true} | 400 {fel: sanerad svensk feltext — kärnans
 *          text vidarebefordras, den är redan sanerad+svensk}.
 *
 * SKYDD: requireAdmin på ALLA metoder (samma vakt som variabler/blogg/
 * media — dev-fallback ENBAST i development; prod utan ADMIN_PASSWORD ⇒
 * 500, våg 79-regeln; rate-limit 10 fel/min). ENDAST GET/POST — inga
 * publika kursrutter rörs, och vitlåset (slug/category/weight/xp/
 * minutes/chapters) bor i kärnan (§A1) — rutten vidarebefordrar aldrig
 * sådana fält.
 *
 * LÄS-REGLER (variabler-lagringens mönster): ändringsloggen läses direkt
 * via getSupabaseRest (type="kurs_metadata-andring", order senaste-vinner,
 * Range-paginering, NEXT_PHASE-hermetik, kastar ALDRIG — fel/tomt ⇒ tom
 * lista). INGEN caching på admin-svar (force-dynamic + Cache-Control:
 * no-store).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** De fyra vitlistade metadata-fälten (§A1 — rutten speglar kärnans lista). */
const FALT_VITLISTA: readonly KursMetadataFalt[] = ["title", "summary", "learn", "why"];

/** Ändringslogg-typen (§A1: skrivKursMetadata postar revisionsraden). */
const KURS_ANDRING_EVENT_TYP = "kurs_metadata-andring";

/** Admin-identiteten i requireAdmin-mönstret (delad lösenordsroll). */
const AV = "admin";

/** JSON-svar utan caching — admin-ytan får aldrig cachas av några lager. */
function svar(kropp: unknown, status = 200): NextResponse {
  return NextResponse.json(kropp, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** Sanera kärnans feltext till panel-safe svenska — aldrig rå stack.
 *  Tom/icke-sträng ⇒ tydlig fallback; längd takas för boundade svar. */
function renFelText(fel: unknown, fallback: string): string {
  const text = typeof fel === "string" ? fel.trim() : "";
  return text ? text.slice(0, 300) : fallback;
}

function plockaObjekt(rå: unknown): Record<string, unknown> {
  return rå && typeof rå === "object" && !Array.isArray(rå) ? (rå as Record<string, unknown>) : {};
}

// ── Ändringsloggen (type=kurs_metadata-andring) — lasAndringsLogg-mönstret ──

/** En loggrad såsom PostgREST returnerar den (details läses hel+tolerant). */
type KursAndringRad = {
  created_at?: string | null;
  details?: Record<string, unknown>;
};

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Senaste-vinner-ordningen — id.desc som tiebreaker (lager.ts våg 67). */
const SENASTE = "order=created_at.desc,id.desc";

/** Max rader per sid-begäran — PostgREST default-sida är 1 000 rader. */
const SIDSTORLEK = 1000;
/** Tak: 10 sidor = 10 000 loggrader (variabler-lagringens mönster). */
const MAX_Sidor = 10;

/** Läs ändringsloggs-rader (nyast först, paginerat) — kastar ALDRIG;
 *  fel/tomt ⇒ tom array (panelen visar då inga rader, aldrig krasch). */
async function lasKursAndringRader(): Promise<KursAndringRad[]> {
  // NEXT_PHASE-hermetik (våg 79): under `next build` ska nätverksläsningen
  // aldrig köras — admin-rutten är force-dynamic men vakten kostar inget.
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  const rest = getSupabaseRest();
  if (!rest) return [];
  const rader: KursAndringRad[] = [];
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    try {
      const res = await fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.${fv(KURS_ANDRING_EVENT_TYP)}` +
          `&select=created_at,details&${SENASTE}`,
        {
          headers: { ...rest.headers, Range: `${fran}-${String(fran + SIDSTORLEK - 1)}` },
          signal: AbortSignal.timeout(10_000),
          cache: "no-store",
        },
      );
      if (!res.ok) return []; // tyst fall-back — panelen visar inga rader
      const sidRader = (await res.json()) as KursAndringRad[];
      if (!Array.isArray(sidRader)) return [];
      rader.push(...sidRader);
      if (sidRader.length < SIDSTORLEK) break; // sista sidan — allt är läst
    } catch {
      return []; // nätverksfel/timeout — tyst fall-back
    }
  }
  return rader;
}

/** En loggrad som panelen får se (varde är text — kärnans termtologi). */
type KursAndring = {
  andrad: string;
  slug: string | null;
  falt: string | null;
  gammalt: string | null;
  varde: string | null;
  av: string | null;
  kalla: string | null;
};

/** Tolerant tolkning av en loggrad — okända/saknade fält ⇒ null, aldrig kast
 *  (kärnans revisionsrad bär details={slug, falt, varde, gammalt, av,
 *  kalla} enligt §A1; "nytt" accepteras också — variabel-mönstrets namn). */
function tolkKursAndring(rad: KursAndringRad): KursAndring {
  const d = rad.details ?? {};
  const text = (v: unknown): string | null => (typeof v === "string" ? v : null);
  return {
    andrad: typeof rad.created_at === "string" ? rad.created_at : "",
    slug: text(d.slug),
    falt: text(d.falt),
    gammalt: text(d.gammalt),
    varde: text(d.varde) ?? text(d.nytt),
    av: text(d.av),
    kalla: text(d.kalla),
  };
}

// ── GET — panelens vy: filvärde + gällande per kurs + ändringsloggen ────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  // Kärnan kastar aldrig (kontraktet §A1): Supabase-fel ⇒ tom override-karta.
  const overrides = await lasKursOverrides();
  const andringar = await lasKursAndringRader(); // nyast först

  // Senaste ändrings-tid per slug — FÖREKOMST vinner (listan är nyast-först).
  const senastAndrad = new Map<string, string>();
  for (const rad of andringar) {
    const slug = typeof rad.details?.slug === "string" ? rad.details.slug : "";
    if (!slug || senastAndrad.has(slug)) continue;
    if (typeof rad.created_at === "string" && rad.created_at) {
      senastAndrad.set(slug, rad.created_at);
    }
  }

  const kurser = getCourseList().map((kurs) => {
    // getCourseList() = getCourses() slugsorterad (content.ts) — 333 poster.
    const fil: Record<KursMetadataFalt, string> = {
      title: kurs.title,
      summary: kurs.summary,
      learn: kurs.learn,
      why: kurs.why,
    };
    // Merge: överrid-nyckeln "{slug}.{falt}" ger gallande; tombstone ⇒ borta
    // ur kartan ⇒ filvärdet består (rollback). Endast ändrade fält kommer
    // från panelen — kalla blir "panel" först när något fält har en override.
    const gallande: Record<KursMetadataFalt, string> = { ...fil };
    let franPanel = false;
    for (const falt of FALT_VITLISTA) {
      const override = overrides.get(`${kurs.slug}.${falt}`);
      if (override !== undefined) {
        gallande[falt] = override;
        franPanel = true;
      }
    }
    return {
      slug: kurs.slug,
      fil,
      gallande,
      kalla: franPanel ? ("panel" as const) : ("fil" as const),
      andrad: senastAndrad.get(kurs.slug) ?? null,
    };
  });

  const logg = andringar.slice(0, 20).map(tolkKursAndring);
  return svar({ kurser, logg });
}

// ── POST — { slug, falt, varde|null }: kärnan validerar och skriver ─────────

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body = plockaObjekt(kropp);

  const skydd = requireAdmin(req, body);
  if (skydd) return skydd;

  // Formkontroll i rutten (variabler-mönstret) — DJUP validering (slug i
  // deep-courses, längdtak, kontrolleraText 0 FEL, vitlås) bor i kärnan.
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug) {
    return svar({ fel: "slug måste vara en icke-tom sträng." }, 400);
  }

  const falt = typeof body.falt === "string" ? body.falt.trim() : "";
  if (!(FALT_VITLISTA as readonly string[]).includes(falt)) {
    return svar(
      {
        fel:
          'falt måste vara ett av de vitlistade metadatafälten "title", "summary", "learn" eller "why" — övriga kursfält är vitlåsta (våg 82).',
      },
      400,
    );
  }

  // varde: sträng (nytt värde) ELLER null (tombstone = rollback till
  // filvärdet). Varken undefined eller andra typer släpps igenom.
  if (body.varde !== null && typeof body.varde !== "string") {
    return svar(
      { fel: "varde måste vara en sträng eller null (null = återställ filvärdet)." },
      400,
    );
  }
  const varde = body.varde;

  try {
    const resultat = await skrivKursMetadata({
      slug,
      falt: falt as KursMetadataFalt,
      varde,
      av: AV,
    });
    if (!resultat.ok) {
      // Kärnans feltext är redan sanerad+svensk (§A1) — vidarebefordras.
      return svar(
        { fel: renFelText(resultat.fel, "Kursmetadatan kunde inte sparas — värdet sparades INTE.") },
        400,
      );
    }
    return svar({ ok: true });
  } catch {
    // skrivKursMetadata ska enbart svara {ok:false, fel} (kontraktet) —
    // detta är den sista skyddsnätet mot råa undantag i svaret.
    return svar({ fel: "Okänt fel vid sparandet — kursmetadatan sparades INTE." }, 400);
  }
}
