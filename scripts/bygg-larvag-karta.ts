#!/usr/bin/env node
/**
 * BYGG LÄRVÄGSKARTAN (våg 88 — B1-LARVAG, FRONT B rekommendationsmaskinen).
 *
 * Genererar src/lib/larvag-karta.ts — en DETERMINISTISK vy över hela
 * kursuniversumet ur public/deep-courses.json (333 kurser):
 *   slug · titel · kategori (rå ur kursdata) · niva (level-tolkning
 *   0=allmän/1=Nybörjare/2=Intermediär/3=Avancerad) · kraverFas (ur
 *   src/lib/kurs-access.ts — oförändrade mängderna) · vIndex (0–19 i
 *   kurstips.ts V-spårets ordning, -1 = utanför spåret) · minuter.
 *
 * PARITETSVAKTER (skriptet vägrar generera vid avvikelse):
 *   - exakt 333 kurser i deep-courses.json
 *   - V-spårets 20 slugs läses ur kurstips.ts KÄLLKOD (regex i ordning) —
 *     samma källa som raknaKurstips/raknaLarvag läser vid runtime
 *   - alla 20 V-slugs finns i kursdata
 *
 * Kör:     node scripts/bygg-larvag-karta.ts     (node ≥ 22.18, typstrippring)
 * Utdata:  src/lib/larvag-karta.ts — GENERERAD FIL, rörs ej för hand.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { kraverFas } from "../src/lib/kurs-access.ts";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KURSJSON = path.join(REPO, "public", "deep-courses.json");
const KURSTIPS = path.join(REPO, "src", "lib", "kurstips.ts");
const UTFIL = path.join(REPO, "src", "lib", "larvag-karta.ts");

const VANTAT_ANTAL = 333;

/** Level-tolkning: 0 = allmän ("Alla"/tom/okänd), 1–3 = stigande nivå. */
function tolkaNiva(rå: unknown): number {
  const s = typeof rå === "string" ? rå.trim().toLowerCase() : "";
  if (s === "nybörjare") return 1;
  if (s === "intermediär") return 2;
  if (s === "avancerad") return 3;
  return 0;
}

/** V-spårets slugs i ordning — ur kurstips.ts källkod (paritet med runtime). */
function lasVSparSlugs(): string[] {
  const kalla = readFileSync(KURSTIPS, "utf8");
  const start = kalla.indexOf("export const V_SPÅR");
  const slut = kalla.indexOf("];", start);
  if (start < 0 || slut < 0) throw new Error("Hittade inte V_SPÅR-blocket i kurstips.ts");
  const block = kalla.slice(start, slut);
  const slugs = [...block.matchAll(/slug:\s*"(v\d{2}-[^"]+)"/g)].map((m) => m[1]);
  if (slugs.length !== 20) {
    throw new Error(`V_SPÅR-pariteten bruten: väntade 20 slugs, fand ${String(slugs.length)}.`);
  }
  return slugs;
}

type Rad = {
  slug: string;
  titel: string;
  kategori: string;
  niva: number;
  kraverFas: number;
  vIndex: number;
  minuter: number;
};

function huvud() {
  const kurser = JSON.parse(readFileSync(KURSJSON, "utf8")) as Record<
    string,
    { slug?: unknown; title?: unknown; category?: unknown; level?: unknown; totalMinutes?: unknown; minutes?: unknown }
  >;
  const slugs = Object.keys(kurser);
  if (slugs.length !== VANTAT_ANTAL) {
    throw new Error(`Väntade ${String(VANTAT_ANTAL)} kurser i deep-courses.json, fand ${String(slugs.length)}.`);
  }

  const vSlugs = lasVSparSlugs();
  const vIndex = new Map<string, number>(vSlugs.map((s, i) => [s, i]));
  for (const s of vSlugs) {
    if (!kurser[s]) throw new Error(`V-spårets ${s} saknas i deep-courses.json — pariteten bruten.`);
  }

  const rader: Rad[] = slugs.map((slug) => {
    const k = kurser[slug];
    const titel = typeof k.title === "string" && k.title.trim() !== "" ? k.title : slug;
    const kategori = typeof k.category === "string" && k.category.trim() !== "" ? k.category.trim() : "OKÄND";
    const minuter =
      typeof k.totalMinutes === "number" && k.totalMinutes > 0
        ? k.totalMinutes
        : typeof k.minutes === "number" && k.minutes > 0
          ? k.minutes
          : 0;
    return {
      slug,
      titel,
      kategori,
      niva: tolkaNiva(k.level),
      kraverFas: kraverFas(slug),
      vIndex: vIndex.get(slug) ?? -1,
      minuter,
    };
  });

  const antalFas = (fas: number) => rader.filter((r) => r.kraverFas === fas).length;
  const ut =
    `/**\n` +
    ` * LÄRVÄGSKARTAN — GENERERAD FIL (våg 88): RÖR EJ FÖR HAND.\n` +
    ` * Genererad av scripts/bygg-larvag-karta.ts ur public/deep-courses.json\n` +
    ` * (${String(rader.length)} kurser) + kurs-access.ts (kraverFas) + kurstips.ts\n` +
    ` * V-spåret (vIndex 0–19, -1 = utanför). Deterministisk: samma indata ⇒\n` +
    ` * samma fil. niva = level-tolkning (0=allmän, 1=Nybörjare,\n` +
    ` * 2=Intermediär, 3=Avancerad). Fas-fördelningen: ${String(antalFas(0))} gratis,\n` +
    ` * ${String(antalFas(2))} Fas 2, ${String(antalFas(3))} Fas 3.\n` +
    ` *\n` +
    ` * Pedagogisk plattform — inte investeringsråd.\n` +
    ` */\n\n` +
    `/** En kurs i lärvägskartan — den vy raknaLarvag (larvag.ts) rankar mot. */\n` +
    `export type LarvagKurs = {\n` +
    `  slug: string;\n` +
    `  titel: string;\n` +
    `  /** Rå kategori ur kursdata (versal, t.ex. "TILLVÄXT"). */\n` +
    `  kategori: string;\n` +
    `  /** Level-tolkning: 0 = allmän, 1 = Nybörjare, 2 = Intermediär, 3 = Avancerad. */\n` +
    `  niva: number;\n` +
    `  /** Kravd fas (kurs-access): 0 = gratis, 2 eller 3. */\n` +
    `  kraverFas: number;\n` +
    `  /** Index i kurstips V-spåret (0–19), -1 = utanför spåret. */\n` +
    `  vIndex: number;\n` +
    `  /** Total speltid i minuter. */\n` +
    `  minuter: number;\n` +
    `};\n\n` +
    `/** Hela kursuniversumet i deep-courses.json-ordning (deterministisk brytning). */\n` +
    `export const LARVAG_KARTA: readonly LarvagKurs[] = [\n` +
    rader
      .map(
        (r) =>
          `  { slug: ${JSON.stringify(r.slug)}, titel: ${JSON.stringify(r.titel)}, kategori: ${JSON.stringify(
            r.kategori,
          )}, niva: ${String(r.niva)}, kraverFas: ${String(r.kraverFas)}, vIndex: ${String(
            r.vIndex,
          )}, minuter: ${String(r.minuter)} },`,
      )
      .join("\n") +
    `\n];\n\n` +
    `/** slug → index i LARVAG_KARTA (O(1)-uppslag; deterministisk brytningsnyckel). */\n` +
    `export const LARVAG_KARTA_INDEX: ReadonlyMap<string, number> = new Map(\n` +
    `  LARVAG_KARTA.map((k, i) => [k.slug, i] as const),\n` +
    `);\n\n` +
    `/** Antal kurser i kartan — paritetsvakt mot deep-courses.json. */\n` +
    `export const LARVAG_ANTAL_KURSER = ${String(rader.length)};\n`;

  writeFileSync(UTFIL, ut, "utf8");
  console.log(
    `[bygg-larvag-karta] ${String(rader.length)} kurser → src/lib/larvag-karta.ts ` +
      `(gratis ${String(antalFas(0))} · Fas 2 ${String(antalFas(2))} · Fas 3 ${String(antalFas(3))} · V-spår 20/20)`,
  );
}

huvud();
