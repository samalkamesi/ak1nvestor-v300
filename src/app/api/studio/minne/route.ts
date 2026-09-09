import { copyFile, mkdir, readdir, readFile, realpath, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { studioArbetsyta } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/minne — AGENTENS MINNE SYNGLIGT OCH REDIGERBART (VÅG 84
 * STUDIO 100x byggblock D, STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 84" §D:
 * arbetsminne + kunskapsbas).
 *
 * Agenten (zcode på Contabo) har sina minnesfiler i
 * /home/ak1a/.zcode/cli/memories/projects/default-d3164043df3fd3bb/memory/
 * — MEMORY.md-index + enskilda faktafiler med frontmatter (name/
 * description/metadata.type). Kunden ser VAD agenten kommer ihåg och kan
 * rätta rader utan att chatta.
 *
 * GET (inga params)
 *   → {rot, filer:[{namn, storlek, uppdaterad, beskrivning, typ,
 *      innehåll, trunkerad}]} — alla minnesfiler + AGENTS.md (arbetsytans
 *      stående instruktioner) OM den finns. innehåll i listan är en
 *      förhandsvisning (≤ 8 kB) — full text via GET ?namn=.
 *
 * GET ?namn=minnesfil.md → full post {namn, storlek, uppdaterad,
 *      beskrivning, typ, innehåll} (lästak 1 MB).
 *
 * PUT {namn, innehåll} → skriver filen (skapar OM den inte finns —
 *      "Ny minnesfil"). Befintligt innehåll backas upp i .minnes-backup/
 *      FÖRE överskrivning. Svar {namn, storlek, uppdaterad, skapad, backup}.
 *
 * DELETE {namn} → backup-kopia i .minnes-backup/ först, SEDAN radering.
 *      MEMORY.md-indexet får ALDRIG raderas (agenten bygger om det
 *      automatiskt) — 400 med svensk klartext.
 *
 * VIKTIGT (KVD): rutten skriver CONTABO-LOKALA filer med node:fs — Next
 * kör på SAMMA maskin som agentens minneskatalog (fs funkar; inget nätverk,
 * inga hemligheter lämnar servern). DEV på arbetsstationen faller tillbaka
 * på spegeln under ~/.zcode/cli/memories/... när Contabo-sökvägen saknas.
 *
 * NAMNVALIDERING (flera lager — sökvägsinmatning är FÖRBJUDEN):
 *   1. ENDAST blotta filnamn: ^[a-z0-9][a-z0-9\-]*\.md$ (gemener, siffror,
 *      bindestreck) + specialnamnen MEMORY.md/AGENTS.md. "../x.md",
 *      ".env", "a/b.md", backslash-trick, versaler — ALLT avvisas av
 *      mönstret innan någon sökväg byggs.
 *   2. Max 80 tecken; namnet sätts ALDRIG ihop av klientens sökväg.
 *   3. path.resolve + prefixkontroll mot respektive rot (minnesroten /
 *      arbetsytan) — FÖRSVAR PÅ DJUPET även om lagren ovan brister.
 *   4. .minnes-backup/ listas ALDRIG och kan ALDRIG vara mål (dot-prefix
 *      matchar inte mönstret).
 *
 * SKYDD: requireAdmin på ALLA metoder (samma mönster som /api/studio/
 * uppladdning). Miljövariabel STUDIO_MINNE_ROT kan flytta roten (dev/test).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Konstanter ───────────────────────────────────────────────────────────────

/** Minnesroten på Contabo (agentens zcode-minne för AK1A-workspacet). */
const CONTABO_MINNE_ROT = "/home/ak1a/.zcode/cli/memories/projects/default-d3164043df3fd3bb/memory";

/** Listans förhandsvisningstak (8 kB — full text hämtas via ?namn=). */
const MAX_FORHANDSVISNING_TEEKEN = 8 * 1024;
/** Lästak för en hel fil (1 MB — minnesfilerna är normalt ≤ 250 kB). */
const MAX_LAS_BYTE = 1024 * 1024;
/** Skrivtak (1 MB — klienten ska aldrig kunna skriva ännu större). */
const MAX_SKRIV_TEEKEN = 1024 * 1024;
/** Max antal säkerhetskopior i .minnes-backup/ (äldsta sopas först). */
const MAX_BACKUPER = 40;

/** Minnesfilnamn: gemener + siffror + bindestreck + .md — INGET annat. */
const MINNES_NAMN_RE = /^[a-z0-9][a-z0-9\-]*\.md$/;

/** Index-filen — listas och läsbar, men radering är BLOCKERAD (§D). */
const INDEX_NAMN = "MEMORY.md";
/** Arbetsytans stående instruktioner — egen post i listan (§D:3). */
const AGENTS_NAMN = "AGENTS.md";

// ── Rot + namnvalidering ─────────────────────────────────────────────────────

/**
 * Minnesroten — miljöstyrd (STUDIO_MINNE_ROT) med Contabo-sökvägen som
 * default och spegeln under hemkatalogen som dev-fallback. Returneras
 * ALDRIG rå till klienten (endast sista katalogledet + projekt-id).
 */
function minnesRot(): string {
  if (process.env.STUDIO_MINNE_ROT) return path.resolve(process.env.STUDIO_MINNE_ROT);
  if (existsSync(CONTABO_MINNE_ROT)) return CONTABO_MINNE_ROT;
  return path.join(os.homedir(), ".zcode", "cli", "memories", "projects", "default-d3164043df3fd3bb", "memory");
}

/**
 * Validera ett filnamn — blotta namnet, ALDRIG en sökväg. Godkänner:
 * minnesmönstret ^[a-z0-9\-]+\.md$ + specialnamnen MEMORY.md/AGENTS.md.
 * "../", ".env", versaler, snedstreck och backslash faller ALLA på
 * mönstret (de innehåller tecken utanför klassen eller saknar .md-ändelse).
 */
function giltigtNamn(namn: unknown): namn is string {
  if (typeof namn !== "string" || namn.length === 0 || namn.length > 80) return false;
  if (namn === INDEX_NAMN || namn === AGENTS_NAMN) return true;
  return MINNES_NAMN_RE.test(namn);
}

/** Postens sort i UI:t: index / agents / vanlig minnesfakta. */
function typFor(namn: string): "index" | "agents" | "minne" {
  if (namn === INDEX_NAMN) return "index";
  if (namn === AGENTS_NAMN) return "agents";
  return "minne";
}

/**
 * Hel sökväg för ett giltigt namn + PREFIXKONTROLL (försvar på djupet):
 * AGENTS.md lever i arbetsytans rot, övriga i minnesroten. Resolve + kontroll
 * att resultatet ligger under rätt rot — och att målet inte redan är en
 * katalog. Kastar Error med svensk klartext (fångas → 400).
 */
function sokvagFor(namn: string): string {
  const arAgents = namn === AGENTS_NAMN;
  const rot = arAgents ? path.resolve(studioArbetsyta()) : path.resolve(minnesRot());
  const hel = path.resolve(rot, namn);
  const jamfor = process.platform === "win32" ? (p: string) => p.toLowerCase() : (p: string) => p;
  if (jamfor(hel) === jamfor(rot) || !jamfor(hel).startsWith(jamfor(rot) + path.sep)) {
    throw new Error("Sökvägen lämnar minnesroten — avvisad.");
  }
  return hel;
}

// ── Frontmatter + backup ─────────────────────────────────────────────────────

/**
 * Plocka description ur frontmatter (--- … ---): "description: …" + yaml-
 * vikta indenterade fortsättningsrader. Kollapsad vitrymd, tak 200 tecken.
 */
function lasBeskrivning(innehåll: string): string | undefined {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(innehåll);
  if (!fm) return undefined;
  const rader = fm[1].split(/\r?\n/);
  for (let i = 0; i < rader.length; i += 1) {
    const träff = /^description:\s*(.*)$/.exec(rader[i]);
    if (!träff) continue;
    let text = träff[1].trim();
    for (let j = i + 1; j < rader.length; j += 1) {
      if (/^\s+\S/.test(rader[j])) text += ` ${rader[j].trim()}`;
      else break;
    }
    text = text.replace(/\s+/g, " ").trim();
    return text ? text.slice(0, 200) : undefined;
  }
  return undefined;
}

/**
 * Backup-kopia i .minnes-backup/ (under minnesroten) — körs FÖRE varje
 * överskrivning (PUT) och varje radering (DELETE). Filnamn:
 * <årtal><mån><dag>-<tim><min><sek>-<origialnamn>. Håller max 40 kopior
 * (äldsta sopas) så katalogen aldrig växer okontrollerat. Returnerar
 * backup-filnamnet — eller null när källan inte fanns/backup misslyckades
 * (DELETE vägrar då fortsätta; PUT får inte blockeras av en gammal kopia).
 */
async function backupa(hel: string): Promise<string | null> {
  try {
    const info = await stat(hel);
    if (!info.isFile()) return null;
  } catch {
    return null; // fanns inte — inget att backa upp
  }
  const backupKat = path.join(path.resolve(minnesRot()), ".minnes-backup");
  await mkdir(backupKat, { recursive: true });
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stämpel = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const backupFil = path.join(backupKat, `${stämpel}-${path.basename(hel)}`);
  await copyFile(hel, backupFil);
  // Beskär till de 40 nyaste (best effort — backupen lever oavsett).
  try {
    const poster = await readdir(backupKat);
    const medTid: { namn: string; tid: number }[] = [];
    for (const p of poster) medTid.push({ namn: p, tid: (await stat(path.join(backupKat, p))).mtimeMs });
    medTid.sort((a, b) => b.tid - a.tid);
    for (const gammal of medTid.slice(MAX_BACKUPER)) {
      await rm(path.join(backupKat, gammal.namn), { force: true });
    }
  } catch {
    // best effort
  }
  return path.basename(backupFil);
}

// ── Hjälpare ─────────────────────────────────────────────────────────────────

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** En post i listan/detaljvyn — kontraktet mot UI:t (Minne 🧠-panelen). */
interface MinnePost {
  namn: string;
  storlek: number;
  uppdaterad: number;
  beskrivning?: string;
  typ: "index" | "agents" | "minne";
  innehåll: string;
  trunkerad?: boolean;
}

/** Läs EN fil till en MinnePost (full text, lästak 1 MB). */
async function lasFil(namn: string, hel: string): Promise<MinnePost> {
  const info = await stat(hel);
  if (!info.isFile()) throw new Error("Minnesfilen kunde ej läsas.");
  if (info.size > MAX_LAS_BYTE) {
    throw new Error("Minnesfilen är större än 1 MB — för stor för studion.");
  }
  const innehåll = await readFile(hel, "utf8");
  return {
    namn,
    storlek: info.size,
    uppdaterad: info.mtimeMs,
    beskrivning: lasBeskrivning(innehåll),
    typ: typFor(namn),
    innehåll,
  };
}

// ── GET — listan + detalj ────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const namn = (req.nextUrl.searchParams.get("namn") ?? "").trim();

  // ── Gren 1: EN hel fil (fullt innehåll för visning/redigering) ──
  if (namn) {
    if (!giltigtNamn(namn)) {
      return jsonSvar({ fel: "Ogiltigt namn — endast minnesfilnamn (a-z, 0-9, bindestreck, .md)." }, 400);
    }
    let hel: string;
    try {
      hel = sokvagFor(namn);
    } catch (fel) {
      return jsonSvar({ fel: fel instanceof Error ? fel.message : "Ogiltigt namn." }, 400);
    }
    let verklig: string;
    try {
      verklig = await realpath(hel);
    } catch {
      return jsonSvar({ fel: "Minnesfilen finns inte." }, 404);
    }
    try {
      // Prefixkontroll på REALPATH:erna (symlanksvägar räknas upp först).
      const rot = namn === AGENTS_NAMN ? path.resolve(studioArbetsyta()) : path.resolve(minnesRot());
      const jamfor = process.platform === "win32" ? (p: string) => p.toLowerCase() : (p: string) => p;
      if (!jamfor(verklig).startsWith(jamfor(await realpath(rot)) + path.sep)) {
        return jsonSvar({ fel: "Sökvägen lämnar minnesroten — avvisad." }, 400);
      }
      const post = await lasFil(namn, verklig);
      return jsonSvar(post);
    } catch (fel) {
      return jsonSvar({ fel: fel instanceof Error ? fel.message.slice(0, 200) : "Minnesfilen kunde ej läsas." }, 500);
    }
  }

  // ── Gren 2: listan (förhandsvisning ≤ 8 kB per fil + AGENTS.md) ──
  const rot = minnesRot();
  const ut: MinnePost[] = [];
  try {
    const poster = await readdir(rot, { withFileTypes: true });
    for (const post of poster) {
      // Bara .md-filer; .minnes-backup och övriga dot-kataloger/filer listas ALDRIG.
      if (!post.isFile() || !post.name.endsWith(".md") || post.name.startsWith(".")) continue;
      if (post.name.startsWith("._")) continue; // macOS-metadata
      try {
        const hel = path.join(rot, post.name);
        const info = await stat(hel);
        if (info.size > MAX_LAS_BYTE) {
          ut.push({
            namn: post.name,
            storlek: info.size,
            uppdaterad: info.mtimeMs,
            typ: typFor(post.name),
            innehåll: "",
            trunkerad: true,
          });
          continue;
        }
        const innehåll = await readFile(hel, "utf8");
        ut.push({
          namn: post.name,
          storlek: info.size,
          uppdaterad: info.mtimeMs,
          beskrivning: lasBeskrivning(innehåll),
          typ: typFor(post.name),
          innehåll: innehåll.slice(0, MAX_FORHANDSVISNING_TEEKEN),
          trunkerad: innehåll.length > MAX_FORHANDSVISNING_TEEKEN,
        });
      } catch {
        // fil försvann mellan listan och läsningen — hoppa över
      }
    }
  } catch {
    // Roten saknas (dev utan spegel) — tom lista + path-led för UI:t.
  }

  // AGENTS.md — arbetsytans stående instruktioner som EGEN post (§D:3),
  // ENDAST när filen finns (den kan skapas via PUT).
  const agentsHel = path.join(path.resolve(studioArbetsyta()), AGENTS_NAMN);
  if (existsSync(agentsHel)) {
    try {
      const info = await stat(agentsHel);
      if (info.isFile() && info.size <= MAX_LAS_BYTE) {
        const innehåll = await readFile(agentsHel, "utf8");
        ut.push({
          namn: AGENTS_NAMN,
          storlek: info.size,
          uppdaterad: info.mtimeMs,
          beskrivning: lasBeskrivning(innehåll),
          typ: "agents",
          innehåll: innehåll.slice(0, MAX_FORHANDSVISNING_TEEKEN),
          trunkerad: innehåll.length > MAX_FORHANDSVISNING_TEEKEN,
        });
      }
    } catch {
      // best effort — posten dyker upp nästa gång
    }
  }

  const jamforSv = new Intl.Collator("sv", { sensitivity: "base" }).compare;
  ut.sort((a, b) => {
    // MEMORY.md först, AGENTS.md sist (instruktionerna = eget avsnitt), övriga alfabetiskt.
    if (a.typ === "index" && b.typ !== "index") return -1;
    if (b.typ === "index" && a.typ !== "index") return 1;
    if (a.typ === "agents" && b.typ !== "agents") return 1;
    if (b.typ === "agents" && a.typ !== "agents") return -1;
    return jamforSv(a.namn, b.namn);
  });

  const rotVisning = rot.split(/[\\/]/).filter(Boolean).slice(-2).join("/");
  return jsonSvar({
    rot: rotVisning,
    antal: ut.length,
    filer: ut,
    agentsFinns: ut.some((f) => f.typ === "agents"),
  });
}

// ── PUT — skriv/skapa en minnesfil ──────────────────────────────────────────

export async function PUT(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let kropp: Record<string, unknown>;
  try {
    kropp = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }

  const namn = kropp.namn;
  const innehåll = kropp.innehåll;
  if (!giltigtNamn(namn)) {
    return jsonSvar(
      { fel: "Ogiltigt namn — endast gemener, siffror, bindestreck och .md (inga sökvägar, ingen .env)." },
      400,
    );
  }
  if (typeof innehåll !== "string") {
    return jsonSvar({ fel: "Fältet innehåll krävs (text)." }, 400);
  }
  if (innehåll.length > MAX_SKRIV_TEEKEN) {
    return jsonSvar({ fel: "Innehållet överstiger 1 MB — för stort för en minnesfil." }, 413);
  }
  if (innehåll.includes("\0")) {
    return jsonSvar({ fel: "Ogiltiga tecken i innehållet." }, 400);
  }

  let hel: string;
  let fanns = false;
  try {
    hel = sokvagFor(namn);
    fanns = existsSync(hel);
    if (fanns && !(await stat(hel)).isFile()) {
      return jsonSvar({ fel: "Namnet är upptaget av en katalog." }, 400);
    }
  } catch (fel) {
    return jsonSvar({ fel: fel instanceof Error ? fel.message : "Ogiltigt namn." }, 400);
  }

  // Backup FÖRE överskrivning (ändrad kunskap ska vara ånbar). Skapande av
  // ny fil backas ej upp (det finns inget att backa).
  let backup: string | null = null;
  if (fanns) {
    try {
      backup = await backupa(hel);
    } catch {
      // Radera-inte-principen gäller DELETE; en misslyckad PUT-backup får
      // inte blockera en ljusrättning — men flaggas i svaret.
      backup = null;
    }
  }

  try {
    await mkdir(path.dirname(hel), { recursive: true });
    await writeFile(hel, innehåll, "utf8");
  } catch (fel) {
    return jsonSvar(
      { fel: `Kunde ej spara "${namn}": ${fel instanceof Error ? fel.message.slice(0, 200) : "okänt fel"}.` },
      500,
    );
  }

  const info = await stat(hel);
  return jsonSvar({
    namn,
    storlek: info.size,
    uppdaterad: info.mtimeMs,
    skapad: !fanns,
    typ: typFor(namn),
    backup: backup ?? undefined,
  });
}

// ── DELETE — radera (med backup först) ───────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let kropp: Record<string, unknown>;
  try {
    kropp = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }

  const namn = kropp.namn;
  if (!giltigtNamn(namn)) {
    return jsonSvar({ fel: "Ogiltigt namn — endast minnesfilnamn (a-z, 0-9, bindestreck, .md)." }, 400);
  }
  if (namn === INDEX_NAMN) {
    return jsonSvar(
      { fel: "MEMORY.md-indexet kan inte raderas — agenten bygger om det automatiskt ur de enskilda minnesfilerna." },
      400,
    );
  }

  let hel: string;
  try {
    hel = sokvagFor(namn);
  } catch (fel) {
    return jsonSvar({ fel: fel instanceof Error ? fel.message : "Ogiltigt namn." }, 400);
  }
  if (!existsSync(hel)) {
    return jsonSvar({ fel: "Minnesfilen finns inte." }, 404);
  }
  try {
    if (!(await stat(hel)).isFile()) {
      return jsonSvar({ fel: "Namnet är ingen fil." }, 400);
    }
  } catch {
    return jsonSvar({ fel: "Minnesfilen kunde ej läsas." }, 500);
  }

  // Backup-kopia först — radering vägrar fortsätta om backuppen misslyckas
  // (kunden ska ALDRIG förlora agentkunskap utan att en kopia finns).
  let backup: string;
  try {
    const kopierad = await backupa(hel);
    if (!kopierad) throw new Error("backup misslyckades");
    backup = kopierad;
  } catch (fel) {
    return jsonSvar(
      { fel: `Säkerhetskopian misslyckades — "${namn}" raderades INTE: ${fel instanceof Error ? fel.message.slice(0, 160) : "okänt fel"}.` },
      500,
    );
  }

  try {
    await rm(hel, { force: true });
  } catch (fel) {
    return jsonSvar(
      { fel: `Kunde ej radera "${namn}" (backuppen ${backup} finns kvar): ${fel instanceof Error ? fel.message.slice(0, 160) : "okänt fel"}.` },
      500,
    );
  }
  return jsonSvar({ raderad: true, namn, backup });
}
