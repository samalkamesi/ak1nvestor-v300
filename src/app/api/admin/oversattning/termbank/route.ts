import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { TERMBANK, TERMBANK_STORLEK, kanoniskTermForSv, type TermKategori, type TermRad } from "@/lib/oversattning/termbank";
import {
  lasTermbankTillagg,
  lasTermbankTillaggSupabase,
  skrivTermbankEventSupabase,
  sparaTermbankTillagg,
  taBortTermbankTillagg,
  upsertTermbankTillagg,
  type TermbankTillagg,
} from "@/lib/oversattning-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/oversattning/termbank — termbankens admin-vy (Våg 52 agent C → våg 79 prod-fix).
 *
 * Kunddirektiv: termbanken är LEVANDE — nya termer ska in i pipelinen direkt.
 * Den kanoniska banken (src/lib/oversattning/termbank.ts, ≥ 200 rader) är
 * källfakta i kod och ägs av pipelinen; nya/admin-uppdaterade termer persistas
 * (våg 79: STYRELSE-ADMIN-MEGA steg 1 "TERMBANK-PROD-FIX") i SUPABASE först —
 * en system_events-rad med type="termbank_tillagg", details={sv,en,ar,kat,
 * notering?,av:"admin"} — som är SANNINGEN och fungerar på Vercel. Filen
 * data/termbank-tillagg.json skrivs endast som DEV-FÖRSÖK (read-only-filsystem
 * på Vercel ger ok=false — accepterat svar; verktyg/synka-termbank.mjs drar
 * Supabase → filen före lokala pipeline-runs). Admin kan ALDRIG tyst åsidosätta
 * den kanoniska garantin: en sv-nyckel som redan finns i banken avvisas (409)
 * med instruktion att ändra i källkoden istället.
 *
 * GET  → { statiska, tillagg (merged vy), kategorier, lage: {supabase, fil,
 *         synkaLokalt}, antal … }
 * POST { action: "laggTill"|"uppdatera"|"taBort", sv, en, ar, kat?, notering? }
 *     → { ok:true, lage: "supabase"|"fil"|"bada", varning? } — varning då en
 *        av lagren misslyckades (den andra är sanningen), 503 om BÅDA misslyckades.
 *
 * SKYDD: requireAdmin (src/lib/admin-auth.ts — delad vakt, skärpt våg 79):
 * ADMIN_PASSWORD (x-admin-password | Bearer | body.adminPassword), timing-
 * säker, misslyckade försök rate-limitas 10/min; i produktion utan
 * ADMIN_PASSWORD satt vägras anropet (ingen dev-fallback i prod). Supabase-
 * nycklar läses via supabase-rest.ts (SSRF-skydd) och loggas ALDRIG.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Admin-skydd ──────────────────────────────────────────────────────────────
// VÅG 79: den egna kopian av kontrollen är BORTKOPPLAD — rutten använder den
// delade requireAdmin (src/lib/admin-auth.ts), som är skärpt: dev-fallback
// "AK1A-2026" gäller ENBAST i development; i produktion utan ADMIN_PASSWORD
// satt vägras anropet (500) istället för att låsa med ett publicerat lösenord
// (STYRELSE-ADMIN-MEGA §4.2 + BYGGKONTRAKT STEG 1:s säkerhetskrav).

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

// ── Merged vy: fil-rader + Supabase-vinnare (Supabase vinner per sv) ─────────

type TillaggVy = TermbankTillagg & { kalla: "fil" | "supabase" | "bada" };

function mergeTillagg(filPoster: TermbankTillagg[], sbPoster: TermbankTillagg[]): TillaggVy[] {
  const perSv = new Map<string, TillaggVy>();
  for (const p of filPoster) perSv.set(p.sv, { ...p, kalla: "fil" });
  for (const p of sbPoster) {
    const befintlig = perSv.get(p.sv);
    perSv.set(p.sv, befintlig ? { ...p, kalla: "bada" } : { ...p, kalla: "supabase" });
  }
  return [...perSv.values()];
}

/**
 * "Synka lokalt"-signal: filens sv-mängd skiljer sig från Supabases vinnare
 * (antal eller innehåll) ⇒ den lokala pipelinen ser inte allt som admin skrivit
 * — kör verktyg/synka-termbank.mjs.
 */
function skillnadMellanLager(filPoster: TermbankTillagg[], sbPoster: TermbankTillagg[]): boolean {
  if (filPoster.length !== sbPoster.length) return true;
  const sbKarta = new Map(sbPoster.map((p) => [p.sv, p]));
  for (const f of filPoster) {
    const s = sbKarta.get(f.sv);
    if (!s || s.en !== f.en || s.ar !== f.ar || s.kat !== f.kat) return true;
  }
  return false;
}

// ── GET — banken + tilläggen (Supabase-läge + fil-läge) ─────────────────────

export async function GET(req: NextRequest) {
  const skyddSvar = requireAdmin(req);
  if (skyddSvar) return skyddSvar;

  const { poster: filPoster } = lasTermbankTillagg();
  const sb = await lasTermbankTillaggSupabase();

  const tillagg = mergeTillagg(filPoster, sb.ok ? sb.poster : []);
  const synkaLokalt = sb.ok ? skillnadMellanLager(filPoster, sb.poster) : false;

  return NextResponse.json({
    ok: true,
    genererad: new Date().toISOString(),
    antalStatiska: TERMBANK_STORLEK,
    antalTillagg: tillagg.length,
    lage: {
      supabase: { ok: sb.ok, antal: sb.ok ? sb.poster.length : null, fel: sb.ok ? null : sb.fel },
      fil: { antal: filPoster.length },
      synkaLokalt,
      instruktion: synkaLokalt
        ? "Fil och Supabase skiljer sig — kör node verktyg/synka-termbank.mjs lokalt innan pipeline-runs."
        : null,
    },
    kategorier: KATEGORIER,
    statiska: TERMBANK,
    tillagg,
    notering:
      "Tillägg persistas i Supabase (system_events type=termbank_tillagg — sanningen, fungerar på Vercel) " +
      "och speglas i data/termbank-tillagg.json (dev); verktyg/synka-termbank.mjs synkar filen före lokala runs. " +
      "Kontrollgarantin (termKonsistens) gäller termen när raden slagits samman in i TERMBANK " +
      "(src/lib/oversattning/termbank.ts) eller via bankens tilläggs-overlay.",
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

  const skyddSvar = requireAdmin(req, body);
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

  // Lägesunderlag: filen (dev-spegling) + Supabase-vinnare (sanningen). En
  // Supabase-koll som misslyckas blockerar INTE skrivningen — filen bär då
  // dev-läget och varningen dokumenterar det (aldrig tyst).
  const { poster: filPosterFore } = lasTermbankTillagg();
  const sbFore = await lasTermbankTillaggSupabase();
  const fannsIFil = filPosterFore.some((p) => p.sv === sv);
  const fannsISupabase = sbFore.ok && sbFore.poster.some((p) => p.sv === sv);

  // ── taBort: endast tilläggsrader — den kanoniska banken är källfakta ──
  if (action === "taBort") {
    const befintlig = kanoniskTermForSv(sv);
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
    if (!fannsIFil && !fannsISupabase) {
      return NextResponse.json({ error: "Tillägget '" + sv + "' hittades inte." }, { status: 404 });
    }

    // (1) SUPABASE: tombstone-event — senaste raden per sv vinner, termen är
    //     alltså borta ur GET/synka direkt (prod-sanningen).
    const sbSkriv = await skrivTermbankEventSupabase({ sv, raderad: true, av: "admin" }, action);
    // (2) FIL: dev-försök (read-only på Vercel är accepterat).
    const resultat = taBortTermbankTillagg(sv);
    const spar = sparaTermbankTillagg(resultat.poster);

    const lage = sbSkriv.ok && spar.ok ? "bada" : sbSkriv.ok ? "supabase" : spar.ok ? "fil" : null;
    if (!lage) {
      return NextResponse.json(
        {
          error:
            "Både Supabase (" + (sbSkriv.fel ?? "?") + ") och filen (" + (spar.fel ?? "?") +
            ") misslyckades — tillägget raderades INTE.",
          posterOforandrade: true,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({
      ok: true,
      action,
      sv,
      lage,
      varning:
        lage === "supabase"
          ? "Raderad i Supabase — filen kunde inte skrivas (" + (spar.fel ?? "?") + "); kör verktyg/synka-termbank.mjs lokalt."
          : lage === "fil"
            ? "Raderad endast i filen — Supabase misslyckades (" + (sbSkriv.fel ?? "?") + "): tillägget kan återkomma vid nästa synka."
            : undefined,
      antalTillagg: resultat.poster.length,
      tillagg: resultat.poster,
    });
  }

  // ── laggTill / uppdatera (upsert på sv) ──
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

  const befintlig = kanoniskTermForSv(sv);
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

  // (1) SUPABASE-FÖRST (sanningen — fungerar på Vercel).
  const sbSkriv = await skrivTermbankEventSupabase(
    { sv, en: rad.en, ar: rad.ar, kat: rad.kat, notering: rad.notering, av: "admin" },
    action,
  );

  // (2) FIL: dev-försök — ok=false på read-only filsystem är accepterat.
  const upsert = upsertTermbankTillagg(rad);
  const spar = sparaTermbankTillagg(upsert.poster);

  const lage = sbSkriv.ok && spar.ok ? "bada" : sbSkriv.ok ? "supabase" : spar.ok ? "fil" : null;
  if (!lage) {
    return NextResponse.json(
      {
        error:
          "Både Supabase (" + (sbSkriv.fel ?? "?") + ") och filen (" + (spar.fel ?? "?") +
          ") misslyckades — tillägget genomfördes INTE.",
        posterOforandrade: true,
      },
      { status: 503 },
    );
  }

  // varNy = nyckeln fanns varken i filen eller Supabase innan skrivningen.
  const varNy = !fannsIFil && !fannsISupabase;

  return NextResponse.json({
    ok: true,
    action,
    sv,
    varNy,
    lage,
    varning:
      lage === "supabase"
        ? "Sparad i Supabase — filen kunde inte skrivas (" + (spar.fel ?? "?") + "); kör verktyg/synka-termbank.mjs lokalt innan pipeline-runs."
        : lage === "fil"
          ? "Sparad endast i filen — Supabase misslyckades (" + (sbSkriv.fel ?? "?") + "): tillägget består inte i prod och skrivs över vid nästa synka."
          : undefined,
    status: "vantar-sammanslagning",
    antalTillagg: upsert.poster.length,
    tillagg: upsert.poster,
    meddelande:
      (varNy ? "Termen tillagd" : "Termen uppdaterad") +
      " (lage: " + lage + ") — den garanteras av kontrollerna via termbankens tilläggs-overlay och fullt när raden slagits samman in i TERMBANK (src/lib/oversattning/termbank.ts).",
    disclaimer: "Pedagogisk analys — inte investeringsråd",
  });
}
