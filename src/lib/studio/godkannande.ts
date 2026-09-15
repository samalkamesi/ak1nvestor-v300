/**
 * GODKÄNNANDE-LIB (mega g1 — styrelsens beslut punkt 1) — studions
 * "väntar-på-dig"-lista: FLYTTKLART innehåll som granskningsleden
 * bedömt klart, men som INTE publiceras förrän KUNDEN trycker (R2).
 * ====================================================================
 *
 * KÄLLOR (sanningsordning — protokollen är färska verdicts, de två
 * forskningsdokumenten är kontext/samlingsytor):
 *   1. data/blogg-utkast/granskning/*.md — ETT protokoll per dokument med
 *      "Bedömning: FLYTTKLAR [EFTER RÄTTNING]" + sökvägen till utkastet.
 *      Aggregatfiler (SAMMANSTALLNING-*) läses i stället via tabellparsern.
 *   2. data/blogg-utkast/granskning/SAMMANSTALLNING-*.md +
 *      data/forskning/M9-GRANSKNING-2026-09.md +
 *      data/forskning/SEO-GUIDER-2026-09.md — tabellrader där slug +
 *      "flyttklar" står på samma rad (fallback; protokollen vinner).
 *
 * REGILER:
 *   · Slug redan live i data/blogg/<slug>.json listas ALDRIG som väntande
 *     (den rapporteras i `redanLive` i stället) — publicering är en
 *     engångsoperation.
 *   · Maskinen kan ALDRIG sätta FLYTTKLAR via denna lib — läsning endast.
 *   · Kundens val (behåll i utkast / publicerad) bärs av
 *     data/vakten/godkannande-val.json — EN fil, atomärt skriven
 *     (temp + rename), defensivt tolkad.
 *
 * Sökvägar följer content.ts-mönstret: process.cwd() = repot (prod-pm2
 * kör i repot; dev kör i klonen). Pedagogisk plattform — inte
 * investeringsråd.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Repot — samma rot som src/lib/content.ts (ROOT = process.cwd()). */
const ROTT = process.cwd();

/** Utkastens hem + granskningsprotokollens hem + live-mappen + vaktdata. */
const UTKAST_DIR = path.join(ROTT, "data", "blogg-utkast");
const GRANSKNING_DIR = path.join(UTKAST_DIR, "granskning");
const M9_KO_DIR = path.join(UTKAST_DIR, "m9-ko");
const LIVE_DIR = path.join(ROTT, "data", "blogg");
const VAL_SOKVAG = path.join(ROTT, "data", "vakten", "godkannande-val.json");

/** FLYTTKLAR i samtliga kända protokollstavningar (se granskning/*.md). */
const FLYTTKLAR_RE = /BEDÖMNING:?\s*\**\s*FLYTTKLAR(\s+EFTER\s+RÄTTNING)?/i;

/** Slug-formatet — kontraktet: ^[a-z0-9-]+$ (URL- och filnamnssäkert). */
const SLUG_RE = /^[a-z0-9-]+$/;

/**
 * Tabell-parserns slug-heuristik: första cell som SLUG-matchar med minst
 * ett bindestreck. Slugar står först i samtliga kända tabeller
 * (SAMMANSTALLNING, M9 §2/§7, SEO-GUIDER "Granskningskö") — ord som
 * "träffprocent" (inget bindestreck) och sökordsfraser (mellanslag)
 * faller bort naturligt.
 */
const TABELL_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;

export type GodkannandeTyp = "seo-guide" | "m9-serie";
export type GodkannandeStatus = "FLYTTKLAR" | "FLYTTKLAR EFTER RÄTTNING";

/** Kundens registrerade val för en post (bärs av godkannande-val.json). */
export interface GodkannandeVal {
  val: "behall" | "publicerad";
  ts: string;
  slug: string;
  /** Satt endast vid publicering — den levande filen i data/blogg/. */
  liveSokvag?: string;
}

/** Filkontraktet för data/vakten/godkannande-val.json. */
export interface GodkannandeValFil {
  uppdaterad: string;
  val: Record<string, GodkannandeVal>;
}

/** En väntande post i godkännandelistan. */
export interface GodkannandePost {
  /** Relativ sökväg till utkastet (data/blogg-utkast/…). */
  sokvag: string;
  slug: string;
  titel: string;
  typ: GodkannandeTyp;
  status: GodkannandeStatus;
  /** Utkastfilens md5 — kundens enkelt jämförbara fingeravtryck. */
  md5: string;
  /** En förhandsvisningsrad (beskrivning/ingress/första stycket, ≤ 300 tkn). */
  forhandsvisning: string;
  /** Kundens registrerade val, om något — null = obeslutat. */
  val: GodkannandeVal | null;
}

// ── Val-filen (kundens markeringar) ──────────────────────────────────────────

/** Läs godkannande-val.json defensivt — saknas/trasig ⇒ tom fil (audit bär spåret). */
export function lasGodkannandeVal(): GodkannandeValFil {
  try {
    const j = JSON.parse(readFileSync(VAL_SOKVAG, "utf8")) as Partial<GodkannandeValFil> | null;
    if (j && typeof j === "object" && j.val && typeof j.val === "object") {
      const val: Record<string, GodkannandeVal> = {};
      for (const [nyckel, v] of Object.entries(j.val)) {
        if (
          v &&
          typeof v === "object" &&
          (v.val === "behall" || v.val === "publicerad") &&
          typeof v.ts === "string" &&
          typeof v.slug === "string"
        ) {
          val[nyckel] =
            typeof v.liveSokvag === "string" ? { ...v, liveSokvag: v.liveSokvag } : { ...v };
        }
      }
      return {
        uppdaterad: typeof j.uppdaterad === "string" ? j.uppdaterad : new Date().toISOString(),
        val,
      };
    }
  } catch {
    /* saknas eller trasig — börja från tomt (append-only spår finns i audit) */
  }
  return { uppdaterad: new Date().toISOString(), val: {} };
}

/**
 * Registrera kundens val för en sökväg — läs-modifiera-skriv med temp +
 * rename (atomärt; ingen halv fil synlig för samtidiga läsare).
 */
export function skrivGodkannandeVal(sokvag: string, v: GodkannandeVal): GodkannandeValFil {
  const fil = lasGodkannandeVal();
  fil.val[sokvag] = v;
  fil.uppdaterad = new Date().toISOString();
  mkdirSync(path.dirname(VAL_SOKVAG), { recursive: true });
  const temp = `${VAL_SOKVAG}.tmp-${Date.now()}`;
  writeFileSync(temp, `${JSON.stringify(fil, null, 2)}\n`, "utf8");
  renameSync(temp, VAL_SOKVAG);
  return fil;
}

// ── Källparserna ─────────────────────────────────────────────────────────────

/** Internt: en slug + dess FLYTTKLAR-status + protokollets utkast-sökväg. */
interface RåPost {
  slug: string;
  status: GodkannandeStatus;
  /** Explicit sökväg ur protokollet (null för tabellrader — löses via lookup). */
  sokvag: string | null;
}

/** Tolka en bedömningsrad → status, eller null (ej FLYTTKLAR). */
function tolkaStatus(text: string): GodkannandeStatus | null {
  const m = FLYTTKLAR_RE.exec(text);
  if (!m) return null;
  return m[1] ? "FLYTTKLAR EFTER RÄTTNING" : "FLYTTKLAR";
}

/**
 * Granskningsprotokollen (per dokument): första "Bedömning: FLYTTKLAR"-raden
 * + första data/blogg-utkast-sökvägen. Aggregat (SAMMANSTALLNING-*) hoppas
 * över här — deras tabellrader täcks av lasTabellRader().
 */
function lasProtokoll(): Map<string, RåPost> {
  const karta = new Map<string, RåPost>();
  let filer: string[];
  try {
    filer = readdirSync(GRANSKNING_DIR);
  } catch {
    return karta; // katalogen saknas ⇒ inga protokoll ⇒ tabellkällorna gäller
  }
  for (const fil of filer) {
    if (!fil.toLowerCase().endsWith(".md")) continue;
    if (fil.toUpperCase().startsWith("SAMMANSTALLNING")) continue;
    let text = "";
    try {
      text = readFileSync(path.join(GRANSKNING_DIR, fil), "utf8");
    } catch {
      continue;
    }
    const status = tolkaStatus(text);
    if (!status) continue;
    const pathMatch = /data\/blogg-utkast\/[A-Za-z0-9._/-]+\.json/.exec(text);
    let slug = "";
    if (pathMatch) {
      slug = path.basename(pathMatch[0], ".json").replace(/-v\d+$/, "");
    } else {
      // Fallback: protokollen är namngivna efter slugar (nyemission-…-det.md).
      slug = fil.replace(/\.md$/i, "").replace(/-v\d+$/, "");
    }
    if (!SLUG_RE.test(slug)) continue;
    if (!karta.has(slug)) {
      karta.set(slug, { slug, status, sokvag: pathMatch ? pathMatch[0] : null });
    }
  }
  return karta;
}

/**
 * Tabellrader med slug + "flyttklar" på samma rad (aggregat + de två
 * forskningsdokumenten). Fyller ENDAST slugar som saknar protokoll —
 * protokollens verdict är färskast och vinner.
 */
function lasTabellRader(helSokvag: string, karta: Map<string, RåPost>): void {
  let text = "";
  try {
    text = readFileSync(helSokvag, "utf8");
  } catch {
    return;
  }
  for (const rad of text.split("\n")) {
    if (!rad.includes("|") || !/flyttklar/i.test(rad)) continue;
    const status: GodkannandeStatus = /efter\s+rättning/i.test(rad)
      ? "FLYTTKLAR EFTER RÄTTNING"
      : "FLYTTKLAR";
    for (const cell of rad.split("|")) {
      const slug = cell.trim().replace(/^`+|`+$/g, "");
      if (TABELL_SLUG_RE.test(slug)) {
        if (!karta.has(slug)) karta.set(slug, { slug, status, sokvag: null });
        break;
      }
    }
  }
}

/**
 * Lös en slugs utkastfil på disk: direkt i data/blogg-utkast/ först, sedan
 * högsta version i m9-kön (m9-ko/<slug>-v<n>.json, index.json räknas ej).
 * Returnerar relativ sökväg eller null.
 */
function resolveraUtkastFil(slug: string): string | null {
  const direkt = path.join(UTKAST_DIR, `${slug}.json`);
  if (existsSync(direkt)) return path.relative(ROTT, direkt);
  let hogsta: { fil: string; version: number } | null = null;
  try {
    for (const fil of readdirSync(M9_KO_DIR)) {
      if (!fil.startsWith(`${slug}-v`) || !fil.endsWith(".json")) continue;
      const version = Number.parseInt(fil.slice(slug.length + 2, -".json".length), 10);
      if (!Number.isFinite(version)) continue;
      if (!hogsta || version > hogsta.version) hogsta = { fil, version };
    }
  } catch {
    /* katalogen saknas — inget att lösa */
  }
  if (hogsta) return path.relative(ROTT, path.join(M9_KO_DIR, hogsta.fil));
  return null;
}

/** Förhandsvisningsraden: description/ingress i första hand, annars bodyns
 *  första löpande stycke — ihopplattad och trunkerad till 300 tecken. */
function lasForhandsvisning(j: Record<string, unknown>): string {
  const kandidater: string[] = [];
  for (const falt of ["description", "ingress"]) {
    const v = j[falt];
    if (typeof v === "string" && v.trim() !== "") kandidater.push(v);
  }
  if (kandidater.length === 0) {
    const body = typeof j.body === "string" ? j.body : typeof j.bodyMarkdown === "string" ? j.bodyMarkdown : "";
    const paragraf = body
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .find((s) => s !== "" && !s.startsWith("#"));
    if (paragraf) kandidater.push(paragraf);
  }
  return kandidater[0].replace(/\s+/g, " ").trim().slice(0, 300);
}

// ── Listbyggaren ─────────────────────────────────────────────────────────────

/**
 * Bygg väntelistan: FLYTTKLAR-poster som INTE redan är live. Kastar ALDRIG
 * — en oläsbar källa hopas tyst (graceful nedbrytning, mönster från
 * blogg-utkast.ts). `redanLive` bär slugarna som granskats FLYTTKLAR men
 * redan står i data/blogg/ (transparens, inte väntande).
 */
export function lasGodkannandePoster(): { poster: GodkannandePost[]; redanLive: string[] } {
  const karta = lasProtokoll();
  // Aggregat + de två forskningsdokumenten (tabellfallback).
  let aggregat: string[] = [];
  try {
    aggregat = readdirSync(GRANSKNING_DIR)
      .filter((f) => f.toUpperCase().startsWith("SAMMANSTALLNING") && f.toLowerCase().endsWith(".md"))
      .map((f) => path.join(GRANSKNING_DIR, f));
  } catch {
    /* ingen aggregatkatalog ⇒ ingen fallback */
  }
  for (const fil of [
    ...aggregat,
    path.join(ROTT, "data", "forskning", "M9-GRANSKNING-2026-09.md"),
    path.join(ROTT, "data", "forskning", "SEO-GUIDER-2026-09.md"),
  ]) {
    lasTabellRader(fil, karta);
  }

  const valFil = lasGodkannandeVal();
  const redanLive: string[] = [];
  const poster: GodkannandePost[] = [];

  for (const rå of karta.values()) {
    // Live-check först — publicerade slugar är klara oavsett källa.
    if (existsSync(path.join(LIVE_DIR, `${rå.slug}.json`))) {
      redanLive.push(rå.slug);
      continue;
    }
    const sokvag =
      rå.sokvag && existsSync(path.join(ROTT, rå.sokvag)) ? rå.sokvag : resolveraUtkastFil(rå.slug);
    if (!sokvag) continue;
    let bytes: Buffer;
    let j: Record<string, unknown>;
    try {
      bytes = readFileSync(path.join(ROTT, sokvag));
      j = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
    } catch {
      continue; // oläsbart/ogiltigt utkast kan inte publiceras — hoppa tyst
    }
    const titel =
      typeof j.title === "string" && j.title.trim() !== ""
        ? j.title.trim()
        : typeof j.titel === "string" && j.titel.trim() !== ""
          ? j.titel.trim()
          : rå.slug;
    poster.push({
      sokvag,
      slug: rå.slug,
      titel,
      typ: sokvag.includes("/m9-ko/") ? "m9-serie" : "seo-guide",
      status: rå.status,
      md5: createHash("md5").update(bytes).digest("hex"),
      forhandsvisning: lasForhandsvisning(j),
      val: valFil.val[sokvag] ?? null,
    });
  }

  const jamforSv = new Intl.Collator("sv").compare;
  poster.sort((a, b) => jamforSv(a.titel, b.titel));
  redanLive.sort(jamforSv);
  return { poster, redanLive };
}
