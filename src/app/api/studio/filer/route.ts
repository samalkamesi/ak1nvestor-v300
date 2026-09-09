import { readFile, readdir, realpath, rm, stat } from "node:fs/promises";
import path from "node:path";

import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { studioArbetsyta } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/filer — FILTRÄD + FILVISNING för /studio (VÅG 83 MEGA
 * byggblock B4, STUDIO=Z — "Z-portaLens fysiska yta").
 *
 * GET (inga params)
 *   → {arbetsyta, trad, antalNoder, trunkerad} — rekursivt träd ur
 *     agentens arbetsyta (samma rot som studio-transporten: STUDIO_WORKSPACE
 *     → /home/ak1a/agent/ak1 → cwd). EXKLUDERADE kataloger: node_modules,
 *     .next, .git, uploads (uploads har egen sektion i UI:t). Maxdjup 3,
 *     max 500 noder, varje nod {namn, typ:"mapp"|"fil", storlek, sokvag,
 *     barn?}. Symlinks följs ALDRIG (inneslutning).
 *
 * GET ?sokvag=relativ/fil.ext
 *   → JSON {namn, sokvag, typ, storlek, andrad, forhandsgranskning} där
 *     forhandsgranskning är:
 *       {slag:"text", innehåll}          — text/markdown/kod ≤ 20 kB (monospace i UI)
 *       {slag:"bild", url}               — bildvisning via &bild=1 (img-taggen)
 *       {slag:"nedladdning", url, orsak} — övrigt (pdf/zip/stor fil) via &nedladdning=1
 *       {slag:"blockerad", meddelande}   — miljöfiler/nycklar/pem: ALDRIG innehåll
 *
 * GET ?sokvag=…&bild=1        → binära bildbyten (png/jpg/jpeg/webp/gif)
 *   med rätt Content-Type — säker serving för <img> i chatten (admin-
 *   sessionens cookie åker med automatiskt; no-store + nosniff).
 * GET ?sokvag=…&nedladdning=1 → valfri icke-blockerad fil ≤ 30 MB som
 *   attachment (application/octet-stream — aldrig gissad typ).
 * DELETE → töm uploads-roten (samma rot som /api/studio/uppladdning) →
 *   {raderade} — knappen "Töm uploads" i filträdsdrawern.
 *
 * PROTOKOLLKARTAN (tool-results/v83-protokollkarta.md §6): det FINNS ingen
 * filläsningsmetod i session/*-protokollet (fil-diffar finns endast i
 * v4-grenen) → läsning sker med node:fs — men ALDRIG utanför arbetsytan:
 *
 * INNESLUTNINGSVAKT (KVD, flera lager):
 *   1. Segment-validering: inga absoluta sökvägar, "..", ".", backslash
 *      eller NUL; max 10 segment.
 *   2. path.resolve + REALPATH på både rot och fil — symlinks räknas upp
 *      till sitt riktiga mål FÖRE kontrollen.
 *   3. Den verkliga sökvägen MÅSTE ligga under den verkliga roten.
 *   4. Känsliga filer (.env*, *.pem, *.key, *.p12/pfx, id_rsa*) blockerar
 *      BOTH förhandsgranskning OCH nedladdning — inga hemligheter lämnar
 *      servern via denna rutt.
 *
 * SKYDD: requireAdmin på ALLA metoder. Svaret bär ALDRIG sökvägar utanför
 * arbetsytan eller filinnehåll ur blockerade filer.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Konstanter ───────────────────────────────────────────────────────────────

/** Trädets maxdjup (rotens barn = djup 1). */
const MAX_DJUP = 3;
/** Trädets maxantal noder (mapp+fil) — kundspec B4 §1. */
const MAX_NODER = 500;
/** Text-förhandsgranskningens tak (20 kB — kundspec B4 §1). */
const MAX_TEXT_BYTE = 20 * 1024;
/** Binär serving-tak (samma som uppladdningens per-fil-tak). */
const MAX_BINAR_BYTE = 30 * 1024 * 1024;
/** Max segment i en begärd sökväg. */
const MAX_SEGMENT = 10;

/** Kataloger som ALDRIG tas med i trädet (tunga/hemliga/egen sektion). */
const EXKLUDERADE_KATALOGER = new Set(["node_modules", ".next", ".git", "uploads"]);

/** Bildändelser → Content-Type (img-taggen räknar på denna). */
const BILD_TYPER: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

/** Text/kod-ändelser som förhandsgranskas monospace. */
const TEXT_ANDANDER = new Set([
  "txt", "md", "json", "csv", "ts", "tsx", "js", "jsx", "mjs", "cjs", "cts", "mts",
  "css", "scss", "less", "html", "htm", "sh", "bash", "zsh", "py", "rb", "go",
  "rs", "java", "kt", "c", "h", "cpp", "hpp", "cs", "php", "sql", "yml", "yaml",
  "toml", "ini", "xml", "svg", "graphql", "prisma", "tf",
]);

/** Ändelselösa filer som ändå är text (och haraktäristiskt oskyldiga). */
const TEXT_NAMN = new Set(["dockerfile", "makefile", "caddyfile", "license", "changelog", "readme"]);

/**
 * Känsliga filer — förhandsgranskning OCH nedladdning blockerade (KVD:
 * inga hemligheter renderas/lämnar servern). Matchar basnamnet.
 */
function arKanslig(basnamn: string): boolean {
  const lag = basnamn.toLowerCase();
  if (lag.startsWith(".env")) return true;
  if (/(^|[-_.])id_rsa($|\.)/.test(lag) || /^id_ed25519/.test(lag) || lag === "credentials.json") return true;
  const andelse = lag.split(".").pop() ?? "";
  return ["pem", "key", "p12", "pfx", "kdbx"].includes(andelse);
}

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Uploads-rot — IDENTISK logik med /api/studio/uppladdning (delat kontrakt). */
function uploadRot(): string {
  return process.env.STUDIO_UPLOAD_ROT || path.join(process.cwd(), "uploads");
}

/** Ändelse ur filnamn (gemener, tom när ingen punkt). */
function andelse(namn: string): string {
  const delar = namn.toLowerCase().split(".");
  return delar.length > 1 ? (delar.pop() ?? "") : "";
}

// ── Inneslutningsvakt ────────────────────────────────────────────────────────

/** Rot och rot-realpath (cachas per anrop — realpath är en diskoperation). */
interface Rot {
  hel: string;
  verklig: string;
}

async function lasRot(): Promise<Rot> {
  const hel = path.resolve(studioArbetsyta());
  try {
    return { hel, verklig: await realpath(hel) };
  } catch {
    throw new Error("Arbetsytan kunde ej läsas.");
  }
}

/**
 * Validera + resolve en relativ sökväg mot arbetsytans rot — lagren:
 * segmentkontroll → resolve → realpath → prefixkontroll. Kastar Error med
 * svensk klartext vid varje brott (fångas av rutten → 400). Returnerar den
 * HELA sökvägen ( läsning/ärenden görs mot denna — den ligger garanterat
 * under roten eftersom kontrollen gjordes mot realpath).
 */
async function vaktaSokvag(sokvag: string, rot: Rot): Promise<string> {
  if (!sokvag || sokvag.length > 400) throw new Error("Ogiltig sökväg.");
  if (sokvag.includes("\0") || sokvag.includes("\\")) throw new Error("Ogiltiga tecken i sökvägen.");
  if (sokvag.startsWith("/") || /^[a-zA-Z]:/.test(sokvag)) {
    throw new Error("Absoluta sökvägar är inte tillåtna — använd arbetsytans relativa sökväg.");
  }
  const segment = sokvag.split("/").filter((s) => s.length > 0);
  if (segment.length === 0 || segment.length > MAX_SEGMENT) {
    throw new Error("Sökvägen är tom eller för djup.");
  }
  for (const s of segment) {
    if (s === "." || s === "..") throw new Error("Sökvägen får inte gå uppåt i trädet.");
    if (/[\u0000-\u001f]/.test(s)) throw new Error("Ogiltiga tecken i sökvägen.");
  }
  const hel = path.resolve(rot.hel, ...segment);
  let verklig: string;
  try {
    verklig = await realpath(hel);
  } catch {
    throw new Error("Filen finns inte i arbetsytan.");
  }
  // Prefixkontroll på REALPATH:erna (win32 är okänslig för skiftläge).
  const jamfor = process.platform === "win32" ? (p: string) => p.toLowerCase() : (p: string) => p;
  const under =
    jamfor(verklig) === jamfor(rot.verklig) ||
    jamfor(verklig).startsWith(jamfor(rot.verklig) + path.sep);
  if (!under) throw new Error("Sökvägen lämnar arbetsytan — avvisad.");
  return hel;
}

// ── Trädet ───────────────────────────────────────────────────────────────────

/** Nod i filträdet — kundspec B4 §1: {namn, typ, storlek} + sokvag/barn. */
interface TradNod {
  namn: string;
  typ: "mapp" | "fil";
  storlek: number;
  sokvag: string;
  barn?: TradNod[];
}

/**
 * Bygg trädet rekursivt — mappar före filer, svensk sortering, cap 500
 * noder som räknas VID INSAMLING (trunkerad-flaggan talar om för UI:t).
 * Symlinks följs ALDRIG — de kan peka utanför arbetsytan.
 */
async function byggTrad(
  dir: string,
  relativ: string,
  djup: number,
  raknare: { n: number },
): Promise<{ barn: TradNod[]; trunkerad: boolean }> {
  let poster: import("node:fs").Dirent[];
  try {
    poster = await readdir(dir, { withFileTypes: true });
  } catch {
    return { barn: [], trunkerad: false };
  }
  const mappar: TradNod[] = [];
  const filer: TradNod[] = [];
  let trunkerad = false;

  for (const post of poster) {
    if (raknare.n >= MAX_NODER) {
      trunkerad = true;
      break;
    }
    // Symlinks följs ALDRIG — de kan peka utanför arbetsytan.
    if (post.isSymbolicLink()) continue;
    const namn = post.name;
    if (post.isDirectory()) {
      if (EXKLUDERADE_KATALOGER.has(namn)) continue;
      raknare.n += 1;
      mappar.push({ namn, typ: "mapp", storlek: 0, sokvag: relativ ? `${relativ}/${namn}` : namn });
    } else if (post.isFile()) {
      let storlek = 0;
      try {
        storlek = (await stat(path.join(dir, namn))).size;
      } catch {
        // fil försvann mellan listan och stat — visas med storlek 0
      }
      raknare.n += 1;
      filer.push({ namn, typ: "fil", storlek, sokvag: relativ ? `${relativ}/${namn}` : namn });
    }
  }

  const jamforSv = new Intl.Collator("sv").compare;
  mappar.sort((a, b) => jamforSv(a.namn, b.namn));
  filer.sort((a, b) => jamforSv(a.namn, b.namn));

  const barn: TradNod[] = [];
  for (const mapp of mappar) {
    if (djup + 1 > MAX_DJUP) {
      // Maxdjup nått — mappen visas utan barn (djupare nivåer når agenten).
      barn.push(mapp);
      continue;
    }
    const under = await byggTrad(path.join(dir, mapp.namn), mapp.sokvag, djup + 1, raknare);
    if (under.trunkerad) trunkerad = true;
    mapp.barn = under.barn;
    barn.push(mapp);
  }
  for (const fil of filer) {
    barn.push(fil);
  }
  return { barn, trunkerad };
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const sokvag = (req.nextUrl.searchParams.get("sokvag") ?? "").trim();
  const villBild = req.nextUrl.searchParams.get("bild") === "1";
  const villNedladdning = req.nextUrl.searchParams.get("nedladdning") === "1";

  // ── Gren 1: trädet (inga parametrar) ──
  if (!sokvag && !villBild && !villNedladdning) {
    try {
      const rot = await lasRot();
      const raknare = { n: 0 };
      const { barn, trunkerad } = await byggTrad(rot.hel, "", 1, raknare);
      return jsonSvar({
        arbetsyta: rot.hel,
        trad: barn,
        antalNoder: raknare.n,
        trunkerad,
      });
    } catch (fel) {
      return jsonSvar(
        { fel: fel instanceof Error ? fel.message.slice(0, 200) : "Filträdet kunde ej byggas." },
        500,
      );
    }
  }

  if (!sokvag) {
    return jsonSvar({ fel: "Parameter sokvag krävs för filvisning." }, 400);
  }

  // ── Inneslutningsvakten (alla filgrener) ──
  let rot: Rot;
  let hel: string;
  try {
    rot = await lasRot();
    hel = await vaktaSokvag(sokvag, rot);
  } catch (fel) {
    return jsonSvar({ fel: fel instanceof Error ? fel.message : "Ogiltig sökväg." }, 400);
  }

  let info: import("node:fs").Stats;
  try {
    info = await stat(hel);
  } catch {
    return jsonSvar({ fel: "Filen kunde ej läsas." }, 404);
  }
  const namn = path.basename(hel);
  const ande = andelse(namn);

  if (info.isDirectory()) {
    return jsonSvar({ namn, sokvag, typ: "mapp", storlek: 0, forhandsgranskning: { slag: "mapp" } });
  }
  if (!info.isFile()) {
    return jsonSvar({ fel: "Sökvägen är varken fil eller mapp." }, 400);
  }

  // ── Gren 2: binär bild-serving (img-taggen) ──
  if (villBild) {
    const contentType = BILD_TYPER[ande];
    if (!contentType) return jsonSvar({ fel: "Filen är inte en tillåten bildtyp (png/jpg/jpeg/webp/gif)." }, 400);
    if (info.size > MAX_BINAR_BYTE) return jsonSvar({ fel: "Bilden är större än 30 MB." }, 413);
    try {
      const byten = await readFile(hel);
      return new Response(new Uint8Array(byten), {
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(byten.byteLength),
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      return jsonSvar({ fel: "Bilden kunde ej läsas." }, 500);
    }
  }

  // Känsliga filer: ALLA vägar utom namn/storlek blockerade.
  if (arKanslig(namn)) {
    return jsonSvar({
      namn,
      sokvag,
      typ: ande || "annan",
      storlek: info.size,
      forhandsgranskning: {
        slag: "blockerad",
        meddelande: "Känslig fil (miljö/nyckel) — förhandsgranskning och nedladdning är blockerade i studion.",
      },
    });
  }

  // ── Gren 3: nedladdning ──
  if (villNedladdning) {
    if (info.size > MAX_BINAR_BYTE) return jsonSvar({ fel: "Filen är större än 30 MB." }, 413);
    try {
      const byten = await readFile(hel);
      return new Response(new Uint8Array(byten), {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": String(byten.byteLength),
          "Content-Disposition": `attachment; filename="${namn.replace(/[^\w\-. ]+/g, "_")}"; filename*=UTF-8''${encodeURIComponent(namn)}`,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      return jsonSvar({ fel: "Filen kunde ej läsas." }, 500);
    }
  }

  // ── Gren 4: JSON-förhandsgranskning ──
  const arBild = Boolean(BILD_TYPER[ande]);
  const arText =
    TEXT_ANDANDER.has(ande) || (!ande && TEXT_NAMN.has(namn.toLowerCase()));

  if (arBild) {
    return jsonSvar({
      namn,
      sokvag,
      typ: "bild",
      storlek: info.size,
      andrad: info.mtimeMs,
      forhandsgranskning: { slag: "bild", url: `/api/studio/filer?sokvag=${encodeURIComponent(sokvag)}&bild=1` },
    });
  }

  if (arText && info.size <= MAX_TEXT_BYTE && info.size > 0) {
    try {
      const innehall = await readFile(hel, "utf8");
      return jsonSvar({
        namn,
        sokvag,
        typ: ande || "text",
        storlek: info.size,
        andrad: info.mtimeMs,
        forhandsgranskning: { slag: "text", innehåll: innehall.slice(0, MAX_TEXT_BYTE) },
      });
    } catch {
      return jsonSvar({ fel: "Filen kunde ej läsas." }, 500);
    }
  }

  // Övrigt: binära format eller text > 20 kB → nedladdningslänk.
  return jsonSvar({
    namn,
    sokvag,
    typ: ande || "annan",
    storlek: info.size,
    andrad: info.mtimeMs,
    forhandsgranskning: {
      slag: "nedladdning",
      url: `/api/studio/filer?sokvag=${encodeURIComponent(sokvag)}&nedladdning=1`,
      orsak: arText ? "Filen är större än 20 kB — förhandsgranskning finns bara för mindre textfiler." : "Binärt/okänt format — ladda ner för att öppna.",
    },
  });
}

// ── DELETE — töm uploads ─────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const rot = uploadRot();
  let raderade = 0;
  const oppna = async (dir: string, djup: number): Promise<void> => {
    if (djup > 8) return;
    // Inneslutningsvakt (försvar på djupet — rot är redan realpath:ad):
    // varje katalog som öppnas MÅSTE ligga under uploads-roten.
    const rotResolvad = path.resolve(rot);
    if (!path.resolve(dir).startsWith(rotResolvad + path.sep)) return;
    let poster: import("node:fs").Dirent[];
    try {
      poster = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const post of poster) {
      const hel = path.join(dir, post.name);
      if (post.isDirectory()) {
        await oppna(hel, djup + 1);
        try {
          const kvar = await readdir(hel);
          if (kvar.length === 0) await rm(hel, { recursive: true });
        } catch {
          // best effort
        }
      } else if (post.isFile()) {
        try {
          await rm(hel, { force: true });
          raderade += 1;
        } catch {
          // best effort
        }
      }
    }
  };
  try {
    await oppna(rot, 0);
  } catch (fel) {
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 200) : "Kunde ej tömma uploads." },
      500,
    );
  }
  return jsonSvar({ raderade });
}
