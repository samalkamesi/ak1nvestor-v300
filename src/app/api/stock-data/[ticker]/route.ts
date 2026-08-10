import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const STOCKS_DIR = join(process.cwd(), "data", "stocks");

/**
 * Per-aktie datalagring — separata mappar per ticker.
 * 
 * Struktur:
 *   data/stocks/VOLCAR-B/
 *     metadata.json      — bolagsinfo (namn, ISIN, sektor, börs)
 *     fundamentals.json  — AKM1-variabler V01-V20 + nyckeltal
 *     technicals.json    — teknisk analys (RSI, MACD, MA, trend)
 *     waves.json         — Elliott Wave per tidshorizont (Mikro, Kort, Medellångsikt, Långsikt, Mega)
 *     scenarios.json     — Bull/Base/Bear
 *     risks.json         — riskbedömning
 *     updatedAt.txt      — senaste uppdatering
 * 
 * Fördel: analytiker kan uppdatera EN fil för EN aktie utan att röra andra.
 * Data återanvänds mellan klienter — ingen omhämtning krävs.
 */

/** GET /api/stock-data/[ticker]?file=fundamentals — hämta specifik fil för en aktie. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const url = new URL(req.url);
  const file = url.searchParams.get("file") || "metadata";

  const allowedFiles = ["metadata", "fundamentals", "technicals", "waves", "scenarios", "risks"];
  if (!allowedFiles.includes(file)) {
    return NextResponse.json({ error: `Ogiltig fil: ${file}` }, { status: 400 });
  }

  const tickerDir = join(STOCKS_DIR, ticker.toUpperCase());
  const filePath = join(tickerDir, `${file}.json`);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    return NextResponse.json({ ticker: ticker.toUpperCase(), file, data, cached: true });
  } catch {
    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      file,
      data: null,
      cached: false,
      message: "Ingen sparad data för denna aktie. Analytiker måste fylla i.",
    });
  }
}

/** PUT /api/stock-data/[ticker] — spara/uppdatera en fil för en aktie. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const body = await req.json();
  const { file, data } = body;

  const allowedFiles = ["metadata", "fundamentals", "technicals", "waves", "scenarios", "risks"];
  if (!allowedFiles.includes(file)) {
    return NextResponse.json({ error: `Ogiltig fil: ${file}` }, { status: 400 });
  }

  const tickerNorm = ticker.toUpperCase();
  const tickerDir = join(STOCKS_DIR, tickerNorm);

  try {
    await fs.mkdir(tickerDir, { recursive: true });
    const filePath = join(tickerDir, `${file}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    const updatedAt = new Date().toISOString();
    await fs.writeFile(join(tickerDir, "updatedAt.txt"), updatedAt, "utf-8");

    try {
      await db.systemEvent.create({
        data: {
          type: "stock_data_updated",
          severity: "info",
          message: `Aktiedata uppdaterad: ${tickerNorm} / ${file}`,
          details: JSON.stringify({ ticker: tickerNorm, file }),
          source: "admin",
        },
      });
    } catch {}

    return NextResponse.json({ ok: true, ticker: tickerNorm, file, updatedAt });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
