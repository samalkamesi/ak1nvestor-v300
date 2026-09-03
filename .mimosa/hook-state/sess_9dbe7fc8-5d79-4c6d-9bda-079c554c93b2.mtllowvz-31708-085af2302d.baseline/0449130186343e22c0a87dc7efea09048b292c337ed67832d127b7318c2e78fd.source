import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/indicators — return AKM1 indicators (static data) */
export async function GET() {
  const indicators = [
    { id: "V01", num: 1, name: "Försäljningstillväxt", category: "Tillväxt", weight: "KRITISK" },
    { id: "V02", num: 2, name: "ARR-tillväxt", category: "Tillväxt", weight: "8%" },
    { id: "V03", num: 3, name: "Intäktsdiversifiering", category: "Tillväxt", weight: "6%" },
    { id: "V04", num: 4, name: "P/S", category: "Värdering", weight: "8%" },
    { id: "V05", num: 5, name: "P/B", category: "Värdering", weight: "6%" },
    { id: "V06", num: 6, name: "EV/EBITDA", category: "Värdering", weight: "8%" },
    { id: "V07", num: 7, name: "Bruttomarginal", category: "Lönsamhet", weight: "KRITISK" },
    { id: "V08", num: 8, name: "EBITDA-marginal", category: "Lönsamhet", weight: "8%" },
    { id: "V09", num: 9, name: "ROE", category: "Lönsamhet", weight: "8%" },
    { id: "V10", num: 10, name: "Skuldsättningsgrad", category: "Kapitalstruktur", weight: "6%" },
    { id: "V11", num: 11, name: "Likviditet", category: "Stabilitet", weight: "6%" },
    { id: "V12", num: 12, name: "Intäktsstabilitet", category: "Stabilitet", weight: "6%" },
    { id: "V13", num: 13, name: "Patent & IP", category: "Moat", weight: "6%" },
    { id: "V14", num: 14, name: "Varumärke", category: "Moat", weight: "6%" },
    { id: "V15", num: 15, name: "Nätverkseffekter", category: "Moat", weight: "6%" },
    { id: "V16", num: 16, name: "Produktlanseringar", category: "Katalysator", weight: "6%" },
    { id: "V17", num: 17, name: "Avtal & Partnerskap", category: "Katalysator", weight: "6%" },
    { id: "V18", num: 18, name: "Regulatoriska", category: "Katalysator", weight: "6%" },
    { id: "V19", num: 19, name: "Kassatäckning — nyemissionsrisk", category: "Risk", weight: "KRITISK" },
    { id: "V20", num: 20, name: "Återköp av egna aktier", category: "Kapitalstruktur", weight: "6%" },
  ];
  return NextResponse.json({ indicators });
}
