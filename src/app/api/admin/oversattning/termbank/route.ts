import { NextRequest, NextResponse } from "next/server";

import { TERMBANK, TERMBANK_STORLEK, termForSv, type TermKategori, type TermRad } from "@/lib/oversattning/termbank";
import {
  lasTermbankTillagg,
  sparaTermbankTillagg,
  taBortTermbankTillagg,
  upsertTermbankTillagg,
} from "@/lib/oversattning-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/oversattning/termbank — termbankens admin-vy (Våg 52 agent C).
 *
 * Kunddirektiv: termbanken är LEVANDE — nya termer ska in i pipelinen direkt.
 * Den kanoniska banken (src/lib/oversattning/termbank.ts, ≥ 200 rader) är
 * källfakta i kod och ägs av pipelinen; nya/admin-uppdaterade termer persistas
 * i data/termbank-tillagg.json (src/lib/oversattning-admin.ts) och presenteras
 * med status "vantar-sammanslagning": termKonsistens-kontrollen garanterar
 * termen när raden slagits in i TERMBANK-arrayen (bankens dokumenterade
 * utökningsmodell — inga andra filer ska behöva ändras). Admin kan ALDRIG
 * tyst åsidosätta den kanoniska garantin: en sv-nyckel som redan finns i
 * banken avvisas (409) med instruktion att ändra i källkoden istället.
 *
 * GET  → { statiska, tillagg, kategorier, antal … }
 * POST { action: "laggTill"|"uppdatera"|"taBort", sv, en, ar, kat?, notering? }
 *
 * SKYDD: ADMIN_PASSWORD (x-admin-password | Bearer | body.adminPassword),
 * timing-säker, misslyckade försök rate-limitas 10/min — mönstret från
 * /api/admin/beteende.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Admin-skydd (mönster från /api/admin/beteende) ───────────────────────────

const misslyckade: number[] = [];
const MAX_MISSLYCKADE_PER_MIN = 10;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function utdragLosenord(req: NextRequest, body: Record<string, unknown>): string {
  const urHeader = req.headers.get("x-admin-password");
  if (urHeader) return urHeader;
  const bearer = req.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) return bearer.slice(7);
  const urBody = body.adminPassword;
  return typeof urBody === "string" ? urBody : "";
}

function kontrolleraAdmin(req: NextRequest, body: Record<string, unknown>): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD || "AK1A-2026";
  const provided = utdragLosenord(req, body);

  const now = Date.now();
  while (misslyckade.length && now - misslyckade[0] > 60_000) misslyckade.shift();
  if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
    return NextResponse.json(
      { error: "För många felaktiga försök — vänta en minut." },
      { status: 429 },
    );
  }
  if (!provided || !timingSafeEqual(provided, expected)) {
    misslyckade.push(now);
    return NextResponse.json({ error: "Admin-lösenord krävs (x-admin-password)." }, { status: 401 });
  }
  return null;
}

function plockaObjekt(rå: unknown): Record<string, unknown> {
  return rå && typeof rå === "object" && !Array.isArray(rå) ? (rå as Record<string, unknown>) : {};
}

// ── Valideringshjälpredor ────────────────────────────────────────────────────

/** Kategorierna härleds ur bankens egen data — nya kategorier följer med automatiskt. */
const KATEGORIER: readonly TermKategori[] = [...new Set(TERMBANK.map((r) => r.kat))];

const MAX_TERM_LANGD = 120;

function rensum(v: unknown, falt: string): { varde: string } | { fel: string } {
  if (typeof v !== "string") return { fel: falt + " krävs som text." };
  const trimmad = v.trim();
  if (!trimmad) return { fel: falt + " får inte vara tomt." };
  if (trimmad.length > MAX_TERM_LANGD) {
    return { fel: falt + " är för långt (max " + String(MAX_TERM_LANGD) + " tecken)." };
  }
  // Minst en Unicode-bokstav — fångar felkodade kroppar ("?????") innan de hamnar i banken.
  if (!/\p{L}/u.test(trimmad)) return { fel: falt + " måste innehålla bokstäver (inte bara tecken/siffror-fri text)." };
  return { varde: trimmad };
}

// ── GET — banken + tilläggen ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skyddSvar = kontrolleraAdmin(req, {});
  if (skyddSvar) return skyddSvar;

  const { poster: tillagg } = lasTermbankTillagg();

  return NextResponse.json({
    ok: true,
    genererad: new Date().toISOString(),
    antalStatiska: TERMBANK_STORLEK,
    antalTillagg: tillagg.length,
    kategorier: KATEGORIER,
    statiska: TERMBANK,
    tillagg,
    notering:
      "Tillägg väntar sammanslagning in i TERMBANK (src/lib/oversattning/termbank.ts) — därefter garanteras " +
      "termen av termKonsistens-kontrollen i pipelinen (kontroller + motorprompt härleds ur bankens data).",
    disclaimer: "Pedagogisk analys — inte investeringsråd",
  });
}

// ── POST — lägg / uppdatera / ta bort term ───────────────────────────────────

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body = plockaObjekt(kropp);

  const skyddSvar = kontrolleraAdmin(req, body);
  if (skyddSvar) return skyddSvar;

  const action = typeof body.action === "string" ? body.action : "";
  if (action !== "laggTill" && action !== "uppdatera" && action !== "taBort") {
    return NextResponse.json(
      { error: 'Ogiltig action — använd "laggTill" | "uppdatera" | "taBort".' },
      { status: 400 },
    );
  }

  const svSvar = rensum(body.sv, "sv");
  if ("fel" in svSvar) return NextResponse.json({ error: svSvar.fel }, { status: 400 });
  const sv = svSvar.varde;

  // ── taBort: endast tilläggsrader — den kanoniska banken är källfakta ──
  if (action === "taBort") {
    const befintlig = termForSv(sv);
    if (befintlig) {
      return NextResponse.json(
        {
          error:
            "'" + sv + "' finns i den kanoniska termbanken (källfakta i src/lib/oversattning/termbank.ts) — " +
            "den kan inte tas bort från admin; ändra i källkoden.",
        },
        { status: 409 },
      );
    }
    const resultat = taBortTermbankTillagg(sv);
    if (!resultat.fanns) {
      return NextResponse.json({ error: "Tillägget '" + sv + "' hittades inte." }, { status: 404 });
    }
    const spar = sparaTermbankTillagg(resultat.poster);
    if (!spar.ok) {
      return NextResponse.json({ error: spar.fel ?? "Kunde inte spara." , posterOforandrade: true }, { status: 503 });
    }
    return NextResponse.json({ ok: true, action, sv, antalTillagg: resultat.poster.length, tillagg: resultat.poster });
  }

  // ── laggTill / uppdatera (upsert på sv i tilläggsfilen) ──
  const enSvar = rensum(body.en, "en");
  if ("fel" in enSvar) return NextResponse.json({ error: enSvar.fel }, { status: 400 });
  const arSvar = rensum(body.ar, "ar");
  if ("fel" in arSvar) return NextResponse.json({ error: arSvar.fel }, { status: 400 });

  let kat: TermKategori = "pedagogik";
  if (body.kat !== undefined && body.kat !== null && body.kat !== "") {
    if (typeof body.kat !== "string" || !(KATEGORIER as readonly string[]).includes(body.kat)) {
      return NextResponse.json(
        { error: "Ogiltig kat — använd en av: " + KATEGORIER.join(", ") + "." },
        { status: 400 },
      );
    }
    kat = body.kat as TermKategori;
  }
  const notering =
    typeof body.notering === "string" && body.notering.trim()
      ? body.notering.trim().slice(0, 300)
      : "admin-tillägg " + new Date().toISOString().slice(0, 10);

  const befintlig = termForSv(sv);
  if (befintlig) {
    // Samma värden ⇒ idempotent ok; andra värden ⇒ garantin kan inte åsidosättas tyst.
    if (befintlig.en === enSvar.varde && befintlig.ar === arSvar.varde && befintlig.kat === kat) {
      return NextResponse.json({
        ok: true,
        action,
        sv,
        status: "finns-redan-i-banken",
        meddelande: "Termen finns redan i den kanoniska termbanken med samma värden — inget tillägg behövs.",
      });
    }
    return NextResponse.json(
      {
        error:
          "'" + sv + "' finns redan i den kanoniska termbanken (" + befintlig.en + " / " + befintlig.ar +
          "). Kontrollgarantin kan inte åsidosättas från admin — ändra raden i src/lib/oversattning/termbank.ts.",
      },
      { status: 409 },
    );
  }

  const rad: TermRad = { sv, en: enSvar.varde, ar: arSvar.varde, kat, notering };
  const upsert = upsertTermbankTillagg(rad);
  const spar = sparaTermbankTillagg(upsert.poster);
  if (!spar.ok) {
    return NextResponse.json(
      { error: spar.fel ?? "Kunde inte spara — tillägget genomfördes INTE.", posterOforandrade: true },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    action,
    sv,
    varNy: upsert.varNy,
    status: "vantar-sammanslagning",
    antalTillagg: upsert.poster.length,
    tillagg: upsert.poster,
    meddelande:
      (upsert.varNy ? "Termen tillagd" : "Termen uppdaterad") +
      " — den garanteras av kontrollerna när raden slagits samman in i TERMBANK (src/lib/oversattning/termbank.ts).",
    disclaimer: "Pedagogisk analys — inte investeringsråd",
  });
}
