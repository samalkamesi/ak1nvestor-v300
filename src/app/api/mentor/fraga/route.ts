import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { NextRequest, NextResponse } from "next/server";

import { KURSREGISTER } from "@/lib/ai-mentor-register";
import { narmasteKurser } from "@/lib/ai-mentor-svar";
import { epostHash, lasMedlemSession } from "@/lib/medlem-auth";
import {
  MENTOR_MAX_FRAGOR_PER_DAG,
  MENTOR_MODELL_KALLA,
  aterstallSekTillMidnatt,
  kontrolleraFraga,
  hamtaMentorModellSvar,
  mentorBrukSokvag,
  mentorDag,
  visaMentorBruk,
  type MentorBruk,
} from "@/lib/mentor-svar";
import { hamtaStudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/mentor/fraga — AI-MENTORN 2.1: modellsvar för MEDLEMMAR (våg 159,
 * styrelsens beslut — generateText-levern m7 används kundvänligt men KOSTNADS-
 * SÄKERT). AI-Mentorn är publik; modellen får ALDRIG kosta okontrollerat:
 *
 *   1. MEDLEMSVAKT — ENDAST inloggad medlem (httpOnly-kakan ak1a_medlem
 *      verifieras mot Supabase/GoTrue via lasMedlemSession, mönstret ur
 *      src/app/api/medlem/route.ts). Gäst ⇒ 401 FÖRE någon modellkostnad —
 *      gäster får alltid regel-motorn (ai-mentor-svar + /api/chatbot).
 *   2. DAGSTAK — 10 frågor/dag per medlem, JSON-räknare under
 *      data/vakten/mentor-bruk/<UTC-dag>/<epostHash>.json (GDPR: hash, aldrig
 *      e-post i klartext). Taket nått ⇒ 429 + återställningstid (UTC-midnatt).
 *      Räknaren ökas FÖRE anropet (kostnaden uppstår där) och RULLAS TILLBAKA
 *      vid transportfel — fel ska aldrig äta upp medlemmens dagskvot.
 *   3. TOKEN-TAK — fråga ≤ 500 tkn, svar ≤ 2 000 tkn (konservativ skattning,
 *      se src/lib/mentor-svar.ts). Taket överskridet ⇒ 400 med tydlig text.
 *   4. JURIDIKGRINDEN (lagen 2007:528) — systemprompten förbjuder rådgivning
 *      och varje svar märks "AI-Mentorn modell" + pedagogisk disclaimer.
 *
 * Ingen admin-nyckel behövs: vakt SKER I RUTTEN (medlem + tak + caps), och
 * transportens generateText körs server-side mot workspace-providern.
 *
 * Felkontrakt (klienten faller tillbaka på regel-motorn vid allt utom 200):
 *   401 { fel: "ej_inloggad" } · 400 { fel: "tom" | "for_lang" }
 *   429 { fel: "fragor_slut", aterstallSek } · 503 { fel: "modell_otillganglig" }
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Räknarkatalog på servern (data/vakten är gitignore:ad runtime-state). */
const BRUK_KATALOG = `${process.cwd()}/data/vakten/mentor-bruk`;

/** Läs medlemmens dagsräknare — saknad/ogiltig fil ⇒ null (ingen kostnad). */
function lasBruk(sokvag: string): MentorBruk | null {
  try {
    if (!existsSync(sokvag)) return null;
    const rå = JSON.parse(readFileSync(sokvag, "utf8")) as { antal?: unknown };
    return typeof rå.antal === "number" && Number.isFinite(rå.antal) && rå.antal >= 0
      ? { antal: Math.floor(rå.antal) }
      : null;
  } catch {
    return null;
  }
}

/** Skriv räknaren (skapar katalog) — best-effort: skrivfel nekar ALDRIG svaret. */
function skrivBruk(sokvag: string, bruk: MentorBruk): void {
  try {
    const katalog = sokvag.slice(0, sokvag.lastIndexOf("/"));
    mkdirSync(katalog, { recursive: true });
    writeFileSync(sokvag, JSON.stringify(bruk), "utf8");
  } catch {
    // Räknaren är en kostnadsvakt, inte en transaktion — vid skrivfel
    // fortsätter svaret (nästa läsning ser det gamla värdet; taket kan
    // som värst underskattas med denna ena fråga).
  }
}

export async function POST(req: NextRequest) {
  // ── 1. Medlemsvakt: gäster når ALDRIG modellen ──────────────────────────────
  const session = await lasMedlemSession(req);
  if (!session) {
    return NextResponse.json({ ok: false, fel: "ej_inloggad" }, { status: 401 });
  }

  // ── 2. Frågekontroll: icke-tom, ≤ 500 tkn ───────────────────────────────────
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body = kropp && typeof kropp === "object" && !Array.isArray(kropp) ? (kropp as Record<string, unknown>) : {};
  const fraga = typeof body.fraga === "string" ? body.fraga : "";
  const kontext = typeof body.kontext === "string" ? body.kontext : undefined;
  const kontroll = kontrolleraFraga(fraga);
  if (!kontroll.ok) {
    return NextResponse.json({ ok: false, fel: kontroll.fel }, { status: 400 });
  }

  // ── 3. Dagstaket: 10 modellfrågor per medlem och dag ────────────────────────
  const nu = new Date();
  const dag = mentorDag(nu);
  const nyckel = epostHash(session.epost);
  const sokvag = mentorBrukSokvag(BRUK_KATALOG, dag, nyckel);
  const bruk = lasBruk(sokvag);
  if (!visaMentorBruk(bruk)) {
    return NextResponse.json(
      { ok: false, fel: "fragor_slut", aterstallSek: aterstallSekTillMidnatt(nu) },
      { status: 429 },
    );
  }

  // Öka FÖRE anropet (kostnaden uppstår i anropet) — rullas tillbaka vid fel.
  const nytt = { antal: (bruk?.antal ?? 0) + 1 };
  skrivBruk(sokvag, nytt);

  // ── 4. Modellen: generateText via studio-transporten (vakt redan skedd) ─────
  try {
    // Närmaste kurser ur registret DI-as in (mentor-svar.ts är import-fri
    // för Node-testbarhet — våg 106 H2-mönstret) och blir svarets länkar.
    const nara = narmasteKurser(fraga, KURSREGISTER, 2);
    const svar = await hamtaMentorModellSvar(fraga, hamtaStudioTransport(), nara, kontext);
    if (!svar) {
      // Tom modelltext är ett ärligt misslyckande: rulla tillbaka + 503.
      skrivBruk(sokvag, { antal: Math.max(0, nytt.antal - 1) });
      return NextResponse.json({ ok: false, fel: "modell_otillganglig" }, { status: 503 });
    }
    return NextResponse.json({
      ok: true,
      kalla: MENTOR_MODELL_KALLA,
      svar,
      kvarvarande: Math.max(0, MENTOR_MAX_FRAGOR_PER_DAG - nytt.antal),
    });
  } catch {
    // Transportfel (modellen nere/timeout): kvot rullas tillbaka, klienten
    // faller tillbaka på regel-motorn — eleven märker bara liten kvalitetsskillnad.
    skrivBruk(sokvag, { antal: Math.max(0, nytt.antal - 1) });
    return NextResponse.json({ ok: false, fel: "modell_otillganglig" }, { status: 503 });
  }
}
