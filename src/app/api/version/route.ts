import { NextResponse } from "next/server";

/**
 * /api/version (VÅG 105) — byggestämpeln för Versionsvakten.
 *
 * Klientbunten bär NEXT_PUBLIC_BYGGE inlinad vid byggstart; denna rutt bär
 * SERVERNS stämpel (satt i next.config env vid samma byggstart, men lever
 * vid körning). En flik som överlevt en deploy har gammal klientstämpel —
 * skillnaden = "det finns en ny version, erbjud uppdatering".
 *
 * Varken SW eller CDN:n får cacha svaret (API-anrop cachas aldrig av sw.js;
 * no-store för säkerhets skull).
 */
export async function GET() {
  return NextResponse.json(
    { bygge: process.env.NEXT_PUBLIC_BYGGE ?? "okand" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
