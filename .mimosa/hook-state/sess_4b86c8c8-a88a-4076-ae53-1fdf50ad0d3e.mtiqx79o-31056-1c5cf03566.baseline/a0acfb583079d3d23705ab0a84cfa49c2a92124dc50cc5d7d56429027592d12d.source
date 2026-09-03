import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker: rawTicker } = await params;

  // Normalize ticker: PREC.ST → PREC-ST, VOLCAR-B → VOLCAR-B (dash already there)
  const fileKey = rawTicker.toUpperCase().replace(".", "-");
  const filePath = path.join(process.cwd(), "data", "analyses", `${fileKey}.json`);

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: "analysis_not_found", ticker: rawTicker, message: `Ingen analysdata hittades för ${rawTicker}. Analysen kanske inte är publicerad ännu.` },
      { status: 404 }
    );
  }

  try {
    const data = await readFile(filePath, "utf-8");
    const json = JSON.parse(data);
    return NextResponse.json(json, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "parse_error", ticker: rawTicker },
      { status: 500 }
    );
  }
}
