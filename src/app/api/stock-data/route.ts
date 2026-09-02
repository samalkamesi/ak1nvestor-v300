import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";

export const runtime = "nodejs";

const STOCKS_DIR = join(process.cwd(), "data", "stocks");

/** GET /api/stock-data — lista alla aktier med sparad data. */
export async function GET() {
  try {
    const entries = await fs.readdir(STOCKS_DIR, { withFileTypes: true });
    const tickers = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    const result: Array<{ ticker: string; updatedAt: string | null; company: string }> = [];
    for (const ticker of tickers) {
      const tickerDir = join(STOCKS_DIR, ticker);
      let updatedAt: string | null = null;
      let company = "?";
      try {
        updatedAt = await fs.readFile(join(tickerDir, "updatedAt.txt"), "utf-8");
      } catch {}
      try {
        const metadata = JSON.parse(await fs.readFile(join(tickerDir, "metadata.json"), "utf-8"));
        company = metadata.company || "?";
      } catch {}
      result.push({ ticker, updatedAt, company });
    }
    return NextResponse.json({ tickers: result });
  } catch {
    return NextResponse.json({ tickers: [] });
  }
}
