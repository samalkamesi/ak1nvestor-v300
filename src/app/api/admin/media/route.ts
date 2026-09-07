import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  listaMedia,
  laddaUppMedia,
  raderaMedia,
  mediaKonfigurerat,
} from "@/lib/mediabibliotek";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/media — MEDIABIBLIOTEKETS data-rutt (VÅG 81 del A, ADMIN-MEGA
 * steg 3 — STYRELSE-VAG81 §A3, "WordPress-kärnan" steg 3).
 *
 * GET    → lista biblioteket: { poster: MediaFil[], konfigurerat, fel? }
 *          (200 även vid fel — panelen visar ärligt meddelande, sajten
 *          opåverkad enligt §A1).
 * POST   → multipart/form-data med fältet "fil" (File) → laddaUppMedia →
 *          201 { post } | 400 { fel } | 503 när medie lagret ej är
 *          konfigurerat (mediaKonfigurerat() === false).
 * DELETE → JSON-body { id: string } → raderaMedia → { ok: true } | 400 { fel }.
 *
 * SKYDD: requireAdmin på ALLA metoder (samma vakt som variabler/blogg —
 * dev-fallback ENBAST i development; prod utan ADMIN_PASSWORD ⇒ 500;
 * rate-limit 10 fel/min). Admin-identiteten "av" är den delade
 * lösenordsmodellens identitet — bokstavligen "admin", exakt som
 * variabler-lagringens `av: "admin"` och bloggens default (requireAdmin
 * autentiserar en roll, inte enskilda användare).
 *
 * BODY-TAK: App Router-rutter saknar egen body-storleks-konfig (next.config:s
 * serverActions.bodySizeLimit gäller ENBAST Server Actions) — platformens
 * tak gäller (Vercel Hobby ~4,5 MB) och KÄRNAN validerar hårt max 2 MB
 * (§A1) med filändelse/mime/magic-byte. Rutten gör en snabb förekontroll
 * på samma 2 MB-gräns för ett tidigt, sanerat 400-svar.
 *
 * FELHANTERING: ALLT fångat och sanerat — svenska feltexter, ALDRIG rå
 * felstack eller råa undantag i svaret (blogg-routens mönster). Inga
 * andra metoder än GET/POST/DELETE (Next svarar 405 automatiskt), och
 * INGEN caching på admin-svar (force-dynamic + Cache-Control: no-store).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** A1: max 2 MB (2_097_152 byte) — kärnans hårdvalidering, speglas här. */
const MAX_BYTES = 2 * 1024 * 1024;

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

// ── GET — panelens lista: poster + konfigurerad-flagga + ärligt fel ─────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const konfigurerat = mediaKonfigurerat();

  // listaMedia returnerar { poster, fel? } och SKA inte kasta (kontraktet),
  // men oväntade fel fångas ändå — panelen får tom lista + sanerat fel,
  // aldrig en rå felstack.
  try {
    const { poster, fel } = await listaMedia();
    return svar({ poster, konfigurerat, fel: fel ?? undefined });
  } catch {
    return svar({
      poster: [],
      konfigurerat,
      fel: "Mediebiblioteket kunde inte läsas — försök igen om en stund.",
    });
  }
}

// ── POST — multipart/form-data, fält "fil": förekontroll → uppladdning ─────

export async function POST(req: NextRequest) {
  // Header-först: obehöriga avvisas innan kroppen läses (admin-auth-mönstret).
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  if (!mediaKonfigurerat()) {
    return svar(
      {
        fel: "Mediebiblioteket är inte konfigurerat — Supabase-miljön saknas (NEXT_PUBLIC_SUPABASE_URL/nyckel). Kontrollera miljövariablerna och försök igen.",
      },
      503,
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return svar(
      {
        fel: 'Kunde inte läsa uppladdningen — begäran måste vara multipart/form-data med bildfilen i fältet "fil".',
      },
      400,
    );
  }

  const kandidat = form.get("fil");
  if (!(kandidat instanceof File) || kandidat.size === 0) {
    return svar(
      {
        fel: 'Fältet "fil" saknas eller innehåller ingen fil — skicka bildfilen som multipart/form-data under fältet "fil".',
      },
      400,
    );
  }

  // Snabb förekontroll på A1-gränsen (kärnan validerar hårt ändå: ändelse,
  // mime, magic-byte — SVG förbjuden, uuid-nyckel server-side).
  if (kandidat.size > MAX_BYTES) {
    return svar(
      {
        fel: `Filen är för stor — ${(kandidat.size / (1024 * 1024)).toFixed(1)} MB mot maxgränsen 2 MB. Minska bilden och försök igen.`,
      },
      400,
    );
  }

  try {
    const { post, fel } = await laddaUppMedia(kandidat, AV);
    if (post) {
      return svar({ post }, 201);
    }
    return svar(
      { fel: renFelText(fel, "Uppladdningen misslyckades — filen sparades inte.") },
      400,
    );
  } catch {
    // ALDRIG rå undantag/stack i svaret — sanerad svensk text.
    return svar(
      { fel: "Okänt fel vid uppladdningen — filen sparades inte. Försök igen." },
      500,
    );
  }
}

// ── DELETE — JSON { id }: radera post (tombstone-logg skrivs av kärnan) ────

export async function DELETE(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body = plockaObjekt(kropp);

  const skydd = requireAdmin(req, body);
  if (skydd) return skydd;

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id || id.length > 200) {
    return svar(
      { fel: 'Ogiltig begäran — bodyn måste vara JSON med fältet "id" (filens id i biblioteket).' },
      400,
    );
  }

  try {
    const { ok, fel } = await raderaMedia(id, AV);
    if (ok) {
      return svar({ ok: true });
    }
    return svar(
      { fel: renFelText(fel, "Raderingen misslyckades — filen togs inte bort.") },
      400,
    );
  } catch {
    return svar(
      { fel: "Okänt fel vid raderingen — filen togs inte bort. Försök igen." },
      500,
    );
  }
}
