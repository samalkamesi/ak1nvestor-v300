import { NextRequest, NextResponse } from "next/server";

import { lasSessionFranCookie, requireAdmin } from "@/lib/admin-auth";
import {
  banAnvandare,
  epostHash,
  epostMaskerad,
  hamtaAnvandare,
  hamtaAnvandarSida,
  hamtaEpost,
  lasMedlemProfiler,
  rensaAuthCache,
  sattAppMetadata,
  skrivSystemEvents,
  type AuthAnvandare,
  type EventRad,
  type MedlemProfil,
} from "@/lib/medlem-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/medlemmar — Medlemmar-admin-panelens API (FAS L3 våg 88,
 * STYRELSE-V86-L3-ADMIN.md §A).
 *
 * GET  ?sida=N&sok=            → auth-användare (Supabase Auth Admin-API,
 *      per_page 50, sidvandring på nextPage) mergeade med members-profiler ur
 *      system_events (type=medlem, senaste per authId) — SANERADE:
 *      epostMaskerad = hashPrefix(8)+"@"+domän, ALDRIG klartext i list-payloaden.
 * GET  ?authId=…&visaEpost=1   → {epost} för EN rad (admin-only per-rad-läs,
 *      §A-GDPR: klartext visas OK men loggas ALDRIG och lämnar aldrig listan).
 * POST {authId, action}        → ban | unban | fas2-grant | fas3-grant | role
 *      (service-nyckel mot /auth/v1/admin/users/{id}; självlåsningsskydd:
 *      ban vägras för roll ∈ {admin, redaktor}; admin-rollen sätts ENBART via
 *      bootstrap — inte utbytbar här). Fas-grants skriver profil-event
 *      type=medlem_andring + uppdaterar members-profil; VARJE lyckad POST
 *      skriver ETT audit-event type=admin-andring (P6: klartext utan e-post).
 *
 * SKYDD: requireAdmin(req) — DEFAULT tillat=["admin"] (redaktören nekas; våg
 * 83:s säkraste default gäller automatiskt, ingen tillat-parameter behövs).
 * Rate: GET/POST delar requireAdmin-fel-taket 10/min + cache 60 s mot
 * /auth/v1 (KRITA: inga loops — EN sida per anrop).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** authId-validering — mönstret MEMBER_ID_RE i fas2-access (aldrig fritext). */
const AUTH_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

const ACTIONS = ["ban", "unban", "fas2-grant", "fas3-grant", "role"] as const;
type Action = (typeof ACTIONS)[number];

/** Rollbärare som ALDRIG får banneas (kontrakt r2 — självlåsningsskydd). */
const SKYDDAD_ROLL: ReadonlySet<string> = new Set(["admin", "redaktor"]);

/** Sanerad list-rad (§A-GDPR regel 1: ingen klartext-epost här — NÅGONSIN). */
type MedlemRad = {
  authId: string;
  epostMaskerad: string;
  epostHash: string | null;
  namn: string | null;
  xp: number | null;
  niva: number | null;
  fas: string | null;
  roll: string | null;
  banned: boolean;
  skapad: string | null;
  senasteInloggning: string | null;
  harProfil: boolean;
};

/** Merge EN auth-användare + ev. profil till en SANERAD rad (klartext borta). */
function tillMedlemRad(anv: AuthAnvandare, profil: MedlemProfil | undefined): MedlemRad {
  return {
    authId: anv.authId,
    epostMaskerad: epostMaskerad(anv.epost),
    epostHash: anv.epost ? epostHash(anv.epost) : (profil?.epostHash ?? null),
    namn: profil?.namn ?? null,
    xp: profil?.xp ?? null,
    niva: profil?.niva ?? null,
    // app_metadata.fas är sanningen efter grants; profilen är fallback (L1).
    fas: anv.fas ?? profil?.fas ?? null,
    roll: anv.roll,
    banned: anv.banned,
    skapad: anv.skapad,
    senasteInloggning: anv.senasteInloggning,
    harProfil: profil !== undefined,
  };
}

/** Aktörsrollen för audit-spåret: session om finnes, annars admin (lösenordsväg
 *  är admin-only med default tillat). */
function aktorRoll(req: NextRequest): string {
  return lasSessionFranCookie(req) ?? "admin";
}

// ── GET — LISTA (sanerad) + visaEpost (EN rad) ───────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req); // default tillat=["admin"]
  if (skydd) return skydd;

  // (a) Per-rad-klartext: ?authId=…&visaEpost=1 → {epost} för EN rad.
  //     KRITA: klartext-loggas ALDRIG — värdet förs ENBART till svaret.
  const authId = (req.nextUrl.searchParams.get("authId") || "").trim();
  if (req.nextUrl.searchParams.get("visaEpost") === "1") {
    if (!AUTH_ID_RE.test(authId)) {
      return NextResponse.json({ error: "Ogiltig authId." }, { status: 400 });
    }
    const epost = await hamtaEpost(authId);
    if (epost === null) {
      return NextResponse.json({ error: "Användaren kunde inte läsas." }, { status: 404 });
    }
    return NextResponse.json({ authId, epost });
  }

  // (b) Listan — EN sida, cache 60 s i medlem-admin (inga /auth/v1-loops).
  const sidaRaw = (req.nextUrl.searchParams.get("sida") || "1").trim();
  let sida = Number.parseInt(sidaRaw, 10);
  if (!Number.isFinite(sida) || sida < 1) sida = 1;
  if (sida > 1000) sida = 1000;

  const sok = (req.nextUrl.searchParams.get("sok") || "").trim().toLowerCase().slice(0, 100);

  const sidaSvar = await hamtaAnvandarSida(sida);
  if ("fel" in sidaSvar) {
    return NextResponse.json({ error: sidaSvar.fel }, { status: 502 });
  }

  // Members-profiler: EN enda system_events-fråga (senaste per authId vinner).
  const profiler = await lasMedlemProfiler();

  let medlemmar = sidaSvar.anvandare.map((a) => tillMedlemRad(a, profiler.get(a.authId)));

  // Sök: i minnet på aktuella sidan (GoTrue v1-listan saknar server-sökning;
  // träffar mot mask, namn, hash och authId-prefix — aldrig klartext behövs).
  if (sok !== "") {
    medlemmar = medlemmar.filter(
      (m) =>
        m.epostMaskerad.toLowerCase().includes(sok) ||
        (m.namn ?? "").toLowerCase().includes(sok) ||
        (m.epostHash ?? "").toLowerCase().startsWith(sok) ||
        m.authId.toLowerCase().startsWith(sok),
    );
  }

  return NextResponse.json({
    medlemmar,
    sida,
    nastaSida: sidaSvar.nastaSida,
    total: sidaSvar.totalApprox, // approx enligt kontraktet (GoTrue-rapporterad)
  });
}

// ── POST — ÅTGÄRDER (ban | unban | fas2-grant | fas3-grant | role) ───────────

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body =
    kropp && typeof kropp === "object" && !Array.isArray(kropp)
      ? (kropp as Record<string, unknown>)
      : {};

  const skydd = requireAdmin(req, body); // default tillat=["admin"]
  if (skydd) return skydd;

  const authId = typeof body.authId === "string" ? body.authId.trim() : "";
  const action = typeof body.action === "string" ? body.action.trim() : "";
  const nyRoll = typeof body.roll === "string" ? body.roll.trim() : "";

  if (!AUTH_ID_RE.test(authId)) {
    return NextResponse.json(
      { error: "authId krävs (1–64 tecken: a-z, 0-9, -, _)." },
      { status: 400 },
    );
  }
  if (!(ACTIONS as readonly string[]).includes(action)) {
    return NextResponse.json(
      { error: "action måste vara ban, unban, fas2-grant, fas3-grant eller role." },
      { status: 400 },
    );
  }
  if (action === "role" && nyRoll !== "redaktor" && nyRoll !== "medlem") {
    return NextResponse.json(
      { error: 'role kräver roll="redaktor" eller "medlem" (admin sätts enbart via bootstrap).' },
      { status: 400 },
    );
  }

  // Läs först (KRITA: MERGA app_metadata — annars raderas grannfält) + skydd.
  const mal = await hamtaAnvandare(authId);
  if (!mal) {
    return NextResponse.json({ error: "Användaren hittades inte." }, { status: 404 });
  }
  if (action === "ban" && SKYDDAD_ROLL.has(mal.roll ?? "")) {
    return NextResponse.json(
      { error: "Rollbärare (admin/redaktör) kan inte stängas av — självlåsningsskydd." },
      { status: 403 },
    );
  }
  if (action === "role" && mal.roll === "admin") {
    return NextResponse.json(
      { error: "Admin-rollen sätts enbart via bootstrap och kan inte ändras från panelen." },
      { status: 403 },
    );
  }

  // Verkställ (service-nyckel-PUT).
  let resultat: AuthAnvandare;
  if (action === "ban" || action === "unban") {
    const svar = await banAnvandare(authId, action === "ban");
    if ("fel" in svar) return NextResponse.json({ error: svar.fel }, { status: 502 });
    resultat = svar;
  } else if (action === "fas2-grant" || action === "fas3-grant") {
    const fas = action === "fas3-grant" ? "fas3" : "fas2";
    const svar = await sattAppMetadata(authId, { ...mal.appMetadata, fas });
    if ("fel" in svar) return NextResponse.json({ error: svar.fel }, { status: 502 });
    resultat = svar;
  } else {
    const svar = await sattAppMetadata(authId, { ...mal.appMetadata, roll: nyRoll });
    if ("fel" in svar) return NextResponse.json({ error: svar.fel }, { status: 502 });
    resultat = svar;
  }

  // ── Audit-spår (P6: klartext-e-post/fel-orsak loggas ALDRIG — HASH-ar) ────
  const aktor = aktorRoll(req);
  const hash = mal.epost ? epostHash(mal.epost) : null;
  const rader: EventRad[] = [];
  const hashText = hash ?? epostMaskerad(mal.epost);

  if (action === "fas2-grant" || action === "fas3-grant") {
    const fas = action === "fas3-grant" ? "fas3" : "fas2";
    // Profil-event (ändringshistoriken — retention-organets vitlista våg 86).
    rader.push({
      type: "medlem_andring",
      severity: "info",
      message: "[medlem_andring] fas=" + fas + " för " + hashText,
      details: { actor: aktor, authId, action, fas },
      source: "admin-panel",
    });
    // Uppdatera members-profilen (type=medlem, senaste raden vinner) — befintliga
    // profilfält (namn/xp/nivå) bärs framåt så de inte skewas bort.
    const profiler = await lasMedlemProfiler();
    const befintlig = profiler.get(authId)?.rå ?? {};
    rader.push({
      type: "medlem",
      severity: "info",
      message: "[medlem] fas uppdaterad " + hashText,
      details: {
        ...befintlig,
        authId,
        ...(hash !== null ? { epostHash: hash } : {}),
        fas,
        uppdaterad: new Date().toISOString(),
      },
      source: "admin-panel",
    });
  }

  // VARJE lyckad POST: ETT audit-event (kontrakt §A).
  rader.push({
    type: "admin-andring",
    severity: "info",
    message:
      "[admin-andring] " +
      action +
      (action === "role" ? " → " + nyRoll : "") +
      " authId=" +
      authId.slice(0, 8) +
      " (" +
      hashText +
      ")",
    details: {
      actor: aktor,
      authId,
      action,
      ...(action === "role" ? { roll: nyRoll } : {}),
      ...(hash !== null ? { epostHash: hash } : {}),
    },
    source: "admin-panel",
  });

  const sparat = await skrivSystemEvents(rader, true);
  rensaAuthCache(); // nästa list-läsning ser ändringen direkt (kräver färska data)

  return NextResponse.json({
    ok: true,
    action,
    authId,
    banned: resultat.banned,
    fas: resultat.fas,
    roll: resultat.roll,
    auditSparat: sparat,
    ...(sparat ? {} : { varning: "Åtgärden verkställd men audit-loggning misslyckades." }),
  });
}
