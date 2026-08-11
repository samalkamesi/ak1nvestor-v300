import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json({ data: [] }); }
export async function POST() { return NextResponse.json({ error: "Use main API" }, { status: 501 }); }

