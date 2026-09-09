import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/uppladdning — fil-/mappuppladdning för /studio-webchatten
 * (VÅG 81 WEBCHAT-STUDIO, STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 81" §3).
 *
 * POST multipart/form-data:
 *   · fält "fil" (EN ELLER FLER File-poster) — bilderna/filerna
 *   · fält "sokvag" (frivilligt, parallellt med filerna) — relativ
 *     mappsökväg per fil (webkitRelativePath från mappknappen). Servern
 *     rekonstruerar mappstrukturen och skyddar med path-sanering.
 *   Svar 201 {sokvagar:[{sokvag,typ,storlek}]} | 400 {fel}.
 *
 * GET → {filer:[{sokvag,typ,storlek,andrad}]} — senaste 50 (nyast först).
 *
 * LAGRING: uploads/<datum>/<namn> under STUDIO_UPLOAD_ROT (default
 * <repo>/uploads — samma workspace som agenten jobbar i på Contabo, så
 * sökvägen "uploads/..." i prompten är agentens egen relativa sökväg).
 * Filnamn saneras (a-z0-9 + . - _ + space, ASCII-fiering av åäö m.m.).
 *
 * TAK (kunddirektiv "max kapacitet" + säkerhetsbeslut §3):
 *   · 30 MB per fil · vitlista png/jpg/jpeg/webp/gif/pdf/zip/txt/md/json/csv
 *   · max 200 filer och 200 MB totalt per anrop (mappuppladdning)
 *   · inga körbara filer, inga dubbla ändelser efter punkt-sanering
 *
 * RENSNING: >7 dagar gamla filer raderas (best effort) vid varje POST —
 * uploads är ett arbetsutrymme, inte ett arkiv (mediabiblioteket är
 * arkivet). Tomma datumkataloger sopas med.
 *
 * SKYDD: requireAdmin på båda metoderna. Filinnehåll valideras ALDRIG som
 * bilder i prod-pipeline (agenten läser dem) — men ENDAST vitlistade
 * ändelser sparas och inget exekveras någonsin.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** 30 MB per fil (§3: "30 MB-filtak"). */
const MAX_FIL_BYTE = 30 * 1024 * 1024;
/** Högst 200 filer / 200 MB per anrop (mappuppladdning i block). */
const MAX_FILER = 200;
const MAX_TOTAL_BYTE = 200 * 1024 * 1024;
/** Rensa filer äldre än 7 dagar (§3). */
const MAX_ÅLDER_MS = 7 * 24 * 60 * 60 * 1000;
/** Max djup i rekonstruerade mappsökvägar. */
const MAX_DJUP = 6;

/** Vitlista (§3) — ändelse → typ-etikett för UI-chipsen. */
const TYP_AV_ANDELSE: Record<string, string> = {
  png: "bild",
  jpg: "bild",
  jpeg: "bild",
  webp: "bild",
  gif: "bild",
  pdf: "pdf",
  zip: "zip",
  txt: "text",
  md: "text",
  json: "text",
  csv: "text",
};

/** Uploads-rot — prod: agentens workspace (Contabo). */
function uploadRot(): string {
  return process.env.STUDIO_UPLOAD_ROT || path.join(process.cwd(), "uploads");
}

/** Sanera ett filnamn: ASCII-säkert, ändelse vitlistas separat. */
function saneraNamn(namn: string): string {
  const bas = namn.replace(/\.[^.]+$/, ""); // ändelsen hanteras separat
  const renad = bas
    .normalize("NFKD")
    .replace(/[^\w\-. ]+/g, "_")
    .replace(/\s+/g, " ")
    .replace(/_{2,}/g, "_")
    .trim()
    .slice(0, 80);
  return renad || "fil";
}

/**
 * Sanera en relativ mappsökväg ("docs/kapitel 2/bild.png") → säkra segment.
 * Avvisar (null): "..", absoluta sökvägar, backslash-trick, för djupt.
 */
function saneraRelativ(sokvag: string): string[] | null {
  const delar = sokvag.split("/").filter((d) => d.length > 0);
  if (delar.length === 0) return [];
  if (delar.some((d) => d === "." || d === ".." || d.includes("\\") || d.includes("\0"))) return null;
  if (delar.length > MAX_DJUP) return null;
  return delar.map((d) => saneraNamn(d));
}

/** Typ ur ändelsen — null när ej vitlistad. */
function typAv(filnamn: string): string | null {
  const andelse = filnamn.toLowerCase().split(".").pop() ?? "";
  return Object.prototype.hasOwnProperty.call(TYP_AV_ANDELSE, andelse) ? TYP_AV_ANDELSE[andelse] : null;
}

/** Best-effort-rensning: >7 dgr gamla filer + tomma kataloger. */
async function rensaGamla(rot: string): Promise<number> {
  let raderade = 0;
  const oppna = async (dir: string, djup: number): Promise<void> => {
    if (djup > 8) return; // skydd mot onaturligt djupa träd
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
          const info = await stat(hel);
          if (Date.now() - info.mtimeMs > MAX_ÅLDER_MS) {
            await rm(hel, { force: true });
            raderade += 1;
          }
        } catch {
          // best effort
        }
      }
    }
  };
  await oppna(rot, 0);
  return raderade;
}

/** Lista senaste filerna (nyast först, tak 50). */
async function listaFiler(rot: string): Promise<{ sokvag: string; typ: string; storlek: number; andrad: number }[]> {
  const ut: { sokvag: string; typ: string; storlek: number; andrad: number }[] = [];
  const oppna = async (dir: string, djup: number): Promise<void> => {
    if (djup > 8 || ut.length >= 400) return;
    let poster: import("node:fs").Dirent[];
    try {
      poster = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const post of poster) {
      if (!post.isFile()) {
        if (post.isDirectory()) await oppna(path.join(dir, post.name), djup + 1);
        continue;
      }
      const hel = path.join(dir, post.name);
      try {
        const info = await stat(hel);
        if (Date.now() - info.mtimeMs > MAX_ÅLDER_MS) continue; // snart rensad — visa ej
        ut.push({
          sokvag: path.relative(rot, hel).split(path.sep).join("/"),
          typ: typAv(post.name) ?? "annan",
          storlek: info.size,
          andrad: info.mtimeMs,
        });
      } catch {
        // fil försvann mellan listan och stat — hoppa över
      }
    }
  };
  await oppna(rot, 0);
  return ut.sort((a, b) => b.andrad - a.andrad).slice(0, 50);
}

// ── POST — multipart-uppladdning ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  // Tidig storlekskontroll på content-length (snällt 413 innan parsning).
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_TOTAL_BYTE + 1024 * 512) {
    return Response.json(
      { fel: `För stort uppladdningspaket (max ${Math.round(MAX_TOTAL_BYTE / 1024 / 1024)} MB totalt).` },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ fel: "Ogiltig multipart-formdata." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const filer = form.getAll("fil").filter((f): f is File => f instanceof File);
  if (filer.length === 0) {
    return Response.json({ fel: "Inga filer hittades (fältet 'fil' saknas)." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  if (filer.length > MAX_FILER) {
    return Response.json({ fel: `För många filer (${filer.length} > ${MAX_FILER}) — dela upp uppladdningen.` }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  // Parallella relativa sökvägar från mappknappen (webkitdirectory).
  const sokvagar = form.getAll("sokvag").filter((s): s is string => typeof s === "string");
  const rot = uploadRot();
  const datum = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const sparade: { sokvag: string; typ: string; storlek: number }[] = [];
  let totalt = 0;

  for (let i = 0; i < filer.length; i += 1) {
    const fil = filer[i];

    if (fil.size > MAX_FIL_BYTE) {
      return Response.json(
        { fel: `"${fil.name}" är ${Math.round(fil.size / 1024 / 1024)} MB — taket är 30 MB per fil.` },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    totalt += fil.size;
    if (totalt > MAX_TOTAL_BYTE) {
      return Response.json(
        { fel: `Uppladdningen överstiger ${Math.round(MAX_TOTAL_BYTE / 1024 / 1024)} MB totalt — dela upp den.` },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Ändelse + typ (vitlista) — dubbelkontroll efter sanering (ingen
    // "bild.php.png"-väg in: ändelsen är det SISTA segmentet, punktsanering
    // i namnet behåller den).
    const andelse = (fil.name.toLowerCase().split(".").pop() ?? "").replace(/[^a-z0-9]/g, "");
    const typ = typAv(`x.${andelse}`);
    if (!typ) {
      return Response.json(
        { fel: `"${fil.name}" har ej tillåten filtyp (png/jpg/jpeg/webp/gif/pdf/zip/txt/md/json/csv).` },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Mappstruktur: parallell sokvag i tur och ordning, annars bara namnet.
    let mapp: string[] = [];
    if (sokvagar[i]) {
      const sanerad = saneraRelativ(sokvagar[i]);
      if (sanerad === null) {
        return Response.json(
          { fel: "Ogiltig mappsökväg i uppladdningen (för djup eller otillåtna tecken)." },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }
      mapp = sanerad.slice(0, -1); // sista segmentet är själva filnamnet
    }

    const namn = `${saneraNamn(fil.name)}.${andelse}`;
    const relativ = ["uploads", datum, ...mapp, namn].join("/");
    const hel = path.join(rot, datum, ...mapp, namn);
    // Inneslutningsvakt: den färdiga sökvägen MÅSTE ligga under rot —
    // även om alla segment sanerats, dubbelkontrolleras det ÄNLDA resultatet
    // (försvar på djupet: saneraRelativ + path-normalisering + detta).
    const rotResolvad = path.resolve(rot);
    if (!path.resolve(hel).startsWith(rotResolvad + path.sep)) {
      return Response.json(
        { fel: "Sökvägen lämnar uppladdningsroten — avvisad." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    try {
      await mkdir(path.dirname(hel), { recursive: true });
      await writeFile(hel, Buffer.from(await fil.arrayBuffer()));
    } catch (fel) {
      return Response.json(
        { fel: `Kunde ej spara "${fil.name}": ${fel instanceof Error ? fel.message.slice(0, 200) : "okänt fel"}.` },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }
    sparade.push({ sokvag: relativ, typ, storlek: fil.size });
  }

  // Rensning >7 dagar — best effort, efter sparandet (kunden ser alltid
  // sina nya filer även om rensningen krånglar).
  let rensade = 0;
  try {
    rensade = await rensaGamla(rot);
  } catch {
    // best effort
  }

  return Response.json(
    { sokvagar: sparade, rensade },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}

// ── GET — lista senaste ──────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  try {
    const filer = await listaFiler(uploadRot());
    return Response.json({ filer }, { headers: { "Cache-Control": "no-store" } });
  } catch (fel) {
    return Response.json(
      { filer: [], fel: fel instanceof Error ? fel.message.slice(0, 200) : "Kunde ej lista uploads." },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
