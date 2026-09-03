import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";

export const runtime = "nodejs";

const REPORTS_DIR = join(process.cwd(), "data", "reports");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  // Try PDF first, then HTML
  const pdfPath = join(REPORTS_DIR, `${slug}.pdf`);
  const htmlPath = join(REPORTS_DIR, `${slug}.html`);

  try {
    // Try PDF
    const pdfData = await fs.readFile(pdfPath);
    return new NextResponse(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    // Try HTML
    try {
      const html = await fs.readFile(htmlPath, "utf-8");
      const antiDownload = `<style>*{user-select:none!important}img{-webkit-user-drag:none!important}@media print{body{display:none}}</style><script>document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('copy',e=>e.preventDefault());document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&(e.key==='s'||e.key==='p'||e.key==='u'))e.preventDefault()})</script>`;
      const protectedHtml = html.replace("</body>", antiDownload + "</body>");
      return new NextResponse(protectedHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": "inline",
          "X-Frame-Options": "SAMEORIGIN",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    } catch {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
  }
}
