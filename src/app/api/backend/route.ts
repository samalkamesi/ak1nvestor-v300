import { NextResponse } from "next/server";
import { getBackendStatus } from "@/lib/data-access";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getBackendStatus());
}
