import { NextResponse, NextRequest } from "next/server";
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { publiceraOrganEvent } from "@/lib/organ-event";
import { publiceraSignal } from "@/lib/signal-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const execFileAsync = promisify(execFile);

/**
 * GET /api/cron/kvalitet — KVALITETSVAKTEN (daglig 07:00 UTC, se vercel.json).
 * Användarens direktiv: "vi måste ha system som ständigt söker efter fel och
 * rättar". Rutten kör verktyg/kvalitetsvakt.mjs som subprocess (7 kontroller:
 * åäö-bortfall, UI-strängar, JSON-giltighet, länk-validitet, kursdata-
 * konsistens, sitemap-täckning, motorvalidering) och rapporterar via
 * publiceraOrganEvent. Rapporten skrivs till data/rapporter/kvalitetsrapport-
 * SENASTE.md av skriptet självt.
 *
 * Fallback-kedja om subprocessen inte kan köras (t.ex. smal bundel): läs
 * senaste rapportfil och tolka sammanfattningsraden.
 */

type Sammanfattning = { fel: number; manuella: number; status: "RÖD" | "GUL" | "GRÖN" | string };

export async function GET(req: NextRequest) {
  // samma skydd som övriga cron-rutter: om CRON_SECRET är satt krävs matchning
  // via ?secret= (query) eller Authorization: Bearer (Vercel Cron).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const qs = req.nextUrl.searchParams.get("secret");
    const auth = req.headers.get("authorization");
    if (qs !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // 1) kör vakten som subprocess (50 s budget — under ruttens maxDuration).
  //    OBS: skriptet avslutar med kod 1 när status är RÖD — det är ett giltigt
  //    scanresultat, inte ett körningsfel, så stdout tolkas även vid reject.
  let sammanfattning: Sammanfattning | null = null;
  let kalla = "";
  let feltext = "";
  const tolkaStdout = (stdout: string): boolean => {
    const rad = stdout
      .split("\n")
      .map((r) => r.trim())
      .reverse()
      .find((r) => r.startsWith("RESULTAT_JSON="));
    if (!rad) return false;
    const parsad = JSON.parse(rad.slice("RESULTAT_JSON=".length)) as Sammanfattning;
    sammanfattning = { fel: parsad.fel, manuella: parsad.manuella, status: parsad.status };
    return true;
  };
  try {
    const { stdout } = await execFileAsync(process.execPath, ["verktyg/kvalitetsvakt.mjs"], {
      cwd: process.cwd(),
      timeout: 50_000,
      maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, NO_COLOR: "1" },
    });
    if (tolkaStdout(stdout)) kalla = "subprocess";
  } catch (e) {
    const ut = (e as { stdout?: string }).stdout;
    if (typeof ut === "string" && tolkaStdout(ut)) {
      kalla = "subprocess (exit " + String((e as { code?: number }).code ?? "?") + ")";
    } else {
      // Sanera feltexten innan den förs vidare till organ-event/500-svar:
      // inteckna aldrig lokala absoluta sökvägar (kan finnas i spawn-fel).
      const raa = e instanceof Error ? e.message.slice(0, 300) : String(e);
      feltext = raa
        .replace(/[A-Za-z]:\\[^\s"'`]*/g, "[sökväg]")
        .replace(/(?:\/(?:home|Users|root)\/[^\s"'`]+)/g, "[sökväg]");
    }
  }

  // 2) fallback: läs senaste rapportfil (skriptet skriver den vid varje körning)
  if (!sammanfattning) {
    try {
      const md = readFileSync(
        path.join(process.cwd(), "data", "rapporter", "kvalitetsrapport-SENASTE.md"),
        "utf8",
      );
      const m = md.match(/ANTAL FEL:\s*(\d+)\s*\|\s*MANUELLA:\s*(\d+)\s*\|\s*STATUS:\s*(RÖD|GUL|GRÖN)/);
      if (m) {
        sammanfattning = { fel: Number(m[1]), manuella: Number(m[2]), status: m[3] };
        kalla = "rapportfil";
      }
    } catch {
      // ingen rapport heller — hanteras nedan
    }
  }

  // 3) publicera OrganEvent — nervsystemet ska aldrig döda vakten (fail-safe),
  //    men en vakt som inte kan köras är i sig ett fel → RÖD-puls.
  //    Feltexten stannar i serverloggen — utåt går enbart statisk text
  //    (ingen dataflöde från fil/subprocess till svar eller databas).
  const resultat: Sammanfattning | null = sammanfattning;
  if (!resultat) {
    console.error("[cron/kvalitet] kunde inte köras:", feltext);
    await publiceraOrganEvent({
      source: "organ/kvalitetsvakt",
      verb: "rapport",
      matt: { fel: -1, manuella: -1, status: "RÖD", notering: "kvalitetsvakten kunde inte köras — se serverloggen" },
    });
    return NextResponse.json(
      { error: "kvalitetsvakten kunde inte köras och ingen rapport finns" },
      { status: 500 },
    );
  }

  // Kanonisering vid systemgränsen: endast literalaccepterade värden passerar
  // (resultat kommer från rapportfil/subprocess och renas här till fast domän).
  const statusKanon =
    resultat.status === "RÖD" ? "RÖD" : resultat.status === "GUL" ? "GUL" : "GRÖN";
  const felKanon = Number.isFinite(resultat.fel) ? resultat.fel : -1;
  const manuellaKanon = Number.isFinite(resultat.manuella) ? resultat.manuella : -1;
  const kallaKanon =
    kalla === "subprocess" ? "subprocess" : kalla === "rapportfil" ? "rapportfil" : "tolkningen";

  await publiceraOrganEvent({
    source: "organ/kvalitetsvakt",
    verb: "rapport",
    matt: { fel: felKanon, manuella: manuellaKanon, status: statusKanon, kalla: kallaKanon },
  });

  // 4) signal-bussen — RÖD status (> 9 fel) är en varning till admin: se
  //    rapporten och rätta (fail-safe: publiceraSignal kastar aldrig).
  if (felKanon > 9) {
    await publiceraSignal({
      kalla: "kvalitetsvakt",
      typ: "varning",
      rubrik: "Kvalitetsstatus RÖD",
      text: `${felKanon} fel hittade — se rapport`,
      ikon: "⚠️",
      mottagare: "admin",
      lank: "/admin?kvalitet=true",
    });
  }

  return NextResponse.json({
    ok: true,
    fel: felKanon,
    manuella: manuellaKanon,
    status: statusKanon,
    kalla: kallaKanon,
    disclaimer: "Pedagogisk analys — inte investeringsråd",
  });
}
