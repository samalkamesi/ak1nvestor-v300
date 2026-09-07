import { NextRequest, NextResponse } from "next/server";
import { getCourse } from "@/lib/content";
import { byggKursSpegel, hamtaKursLager, type KursSpegelSprak } from "@/lib/kurs-speglar";

export const runtime = "nodejs";

/**
 * GET /api/kurs-spegel/[lang]/[slug] — en översatt kursspegel som JSON.
 *
 * Våg 78 B1: /en/kurser/[slug] och /ar/kurser/[slug] renderar numera SMAKPROV
 * (kapitel 1–2) + låst vy i SSR-passet; behöriga Fas 2/3-medlemmar hämtar
 * fullkursen hit (översatt via samma lager som sidrenderingen — svensk
 * originaltext där översättning saknas). Kapitel 3+ skickas aldrig i statiskt
 * HTML för fas-kurser.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lang: string; slug: string }> }
) {
  const { lang, slug } = await params;
  if (lang !== "en" && lang !== "ar") {
    return NextResponse.json({ error: "Okänt språk" }, { status: 404 });
  }
  const kurs = getCourse(slug);
  if (!kurs) {
    return NextResponse.json({ error: "Kurs hittades inte" }, { status: 404 });
  }
  const lager = await hamtaKursLager(slug, lang as KursSpegelSprak);
  const spegel = byggKursSpegel(kurs, lager);
  return NextResponse.json(spegel.kurs);
}
