#!/usr/bin/env node
/**
 * FRONT B för s5-u1 omgång 34 — ma-10-jamviktsrantan (Avancerad).
 * Läsreplik som IMPORTERAR den äkta motorn (raknaLarvag) och kartan —
 * samma kod kunden möter, inget eget återimplementation.
 * Node-ESM: larvag.ts importeras via en TMP-kopia med omskrivna sökvägar
 * (src/ lämnas orörd).
 * Kör: node verktyg/_s5u1o34-frontb.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const TMP = "/tmp/s5u1o34-frontb";
mkdirSync(TMP, { recursive: true });
let src = readFileSync("/home/ak1a/AK1/src/lib/larvag.ts", "utf8");
src = src.replace(/from "\.\/([a-z0-9-]+)"/g, 'from "' + TMP + '/$1.ts"');
writeFileSync(TMP + "/larvag.ts", src);

let kt = readFileSync("/home/ak1a/AK1/src/lib/kurstips.ts", "utf8");
kt = kt.replace(/import \{[^}]*\} from "\.\/member-local";/,
  "const lasKlaraKurser = () => [] as string[]; const lasStreak = () => ({ antal: 0 }); const lasXP = () => 0;");
writeFileSync(TMP + "/kurstips.ts", kt);

let lk = readFileSync("/home/ak1a/AK1/src/lib/larvag-karta.ts", "utf8");
writeFileSync(TMP + "/larvag-karta.ts", lk);

const { raknaLarvag } = await import(TMP + "/larvag.ts");
const { LARVAG_KARTA } = await import(TMP + "/larvag-karta.ts");

let pass = 0, fel = 0;
const t = (b, m) => { if (b) pass++; else { fel++; console.log("FEL:", m); } };

const lasare = (klara, lasTillstand = "avancerad", fas = 1) => ({
  progress: { xp: klara.length * 50, klaraKurser: klara },
  lasande: { lasTillstand, fas, streak: 0, svagheter: {} },
});

// A — fulläst MAKROEKONOMI & RÄNTA-läsare (avancerad läsare, målnivå 3) nominerar ma-10 90p (86+4)
{
  const klara = LARVAG_KARTA.filter((k) => k.kategori === "MAKROEKONOMI & RÄNTA" && k.slug !== "ma-10-jamviktsrantan").map((k) => k.slug);
  const { progress, lasande } = lasare(klara, "avancerad");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const ny = rek.find((r) => r.slug === "ma-10-jamviktsrantan");
  t(!!ny, "A1: ma-10 nominerad för fulläst MAKROEKONOMI & RÄNTA-läsare");
  t(ny?.poäng === 90, `A2: poäng 90 (86 BAS + 4 nivåmatch Avancerad) — fick ${ny?.poäng}`);
  t(ny?.regel === "kategori-fortsattning", "A3: regeln = kategori-fortsattning");
  t(ny?.varför.toLowerCase().includes("makroekonomi"), "A4: varför-rad bär kategorin");
  console.log(`  MAKRO-läsare (${klara.length} steg bakom sig) → ${ny ? ny.poäng + "p" : "EJ NOMINERAD"} — ${ny?.varför.slice(0, 80)}…`);
}

// B — omvänd riktning: växande läsare (målnivå 2) ger 86 (ingen match mot Avancerad)
{
  const klara = LARVAG_KARTA.filter((k) => k.kategori === "MAKROEKONOMI & RÄNTA" && k.slug !== "ma-10-jamviktsrantan").map((k) => k.slug);
  const { progress, lasande } = lasare(klara, "växande");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const ny = rek.find((r) => r.slug === "ma-10-jamviktsrantan");
  t(!!ny && ny.poäng === 86, `B: växande läsare → 86 (ingen nivåmatch mot Avancerad) — fick ${ny?.poäng}`);
}

// C — nybörjare-läsaren (målnivå 1): också 86 (matchning bara vid exakt nivå)
{
  const klara = LARVAG_KARTA.filter((k) => k.kategori === "MAKROEKONOMI & RÄNTA" && k.slug !== "ma-10-jamviktsrantan").map((k) => k.slug);
  const { progress, lasande } = lasare(klara, "nybörjare");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const ny = rek.find((r) => r.slug === "ma-10-jamviktsrantan");
  t(!!ny && ny.poäng === 86, `C: nybörjare-läsare → 86 — fick ${ny?.poäng}`);
}

// D — D1-skydd: delvis-läsare (halva familjen) får INTE 90p-nominering av ma-10
{
  const alla = LARVAG_KARTA.filter((k) => k.kategori === "MAKROEKONOMI & RÄNTA" && k.slug !== "ma-10-jamviktsrantan").map((k) => k.slug);
  const halva = alla.slice(0, Math.floor(alla.length / 2));
  const { progress, lasande } = lasare(halva, "avancerad");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const ny = rek.find((r) => r.slug === "ma-10-jamviktsrantan");
  t(!ny || ny.poäng < 90, `D: delvis-läsare (${halva.length}/${alla.length}) → max 86p — fick ${ny?.poäng ?? "ej nominerad"}`);
}

// E — determinism: två körningar, identiskt resultat
{
  const klara = LARVAG_KARTA.filter((k) => k.kategori === "MAKROEKONOMI & RÄNTA" && k.slug !== "ma-10-jamviktsrantan").map((k) => k.slug);
  const { progress, lasande } = lasare(klara, "avancerad");
  const a = JSON.stringify(raknaLarvag(progress, lasande, { antal: 8 }));
  const b = JSON.stringify(raknaLarvag(progress, lasande, { antal: 8 }));
  t(a === b, "E: determinism — två körningar bitidentiska");
}

// F — ma-09 (förra omgångens granne + systerna) oskadda: nomineras fortfarande för sina läsare
{
  const syskon = [
    { kat: "MAKROEKONOMI & RÄNTA", slug: "ma-09-produktionsgapet" },
    { kat: "KATALYSATOR", slug: "kt-12-vd-bytet" },
    { kat: "MOAT", slug: "mt-10-erfarenhetskurvan" },
  ];
  for (const s of syskon) {
    const klara = LARVAG_KARTA.filter((k) => k.kategori === s.kat && k.slug !== s.slug).map((k) => k.slug);
    const { progress, lasande } = lasare(klara, "växande");
    const rek = raknaLarvag(progress, lasande, { antal: 8 });
    t(!!rek.find((r) => r.slug === s.slug), `F: ${s.slug} fortfarande nominerad (ny kurs stjäl ingen plats)`);
  }
}

// G — kartfakta: niva 3 (Avancerad), kraverFas 0 (R2: gratis), vIndex −1 (ej V-spåret), serieordning ma-09 < ma-10
{
  const k10 = LARVAG_KARTA.find((k) => k.slug === "ma-10-jamviktsrantan");
  const k09 = LARVAG_KARTA.find((k) => k.slug === "ma-09-produktionsgapet");
  t(!!k10, "G1: ma-10 finns i kartan");
  t(k10?.niva === 3, `G2: niva 3 (Avancerad) — fick ${k10?.niva}`);
  t(k10?.kraverFas === 0, `G3: kraverFas 0 (R2: gratis, ingen pris-/tieryta) — fick ${k10?.kraverFas}`);
  t(k10?.vIndex === -1, `G4: vIndex −1 (ej V-spåret) — fick ${k10?.vIndex}`);
  const i09 = LARVAG_KARTA.findIndex((k) => k.slug === "ma-09-produktionsgapet");
  const i10 = LARVAG_KARTA.findIndex((k) => k.slug === "ma-10-jamviktsrantan");
  t(i09 >= 0 && i10 >= 0 && i09 < i10, `G5: kartordning ma-09 (${i09}) < ma-10 (${i10}) — serieordningen bevarad`);
  t(k10?.minuter === 24, `G6: minuter 24 — fick ${k10?.minuter}`);
}

// H — WHY-PARITET: kartans titel ≡ kursfilens titel; registrets post ≡ kursfilen (round-trip)
{
  const kurs = JSON.parse(readFileSync("/home/ak1a/AK1/data/kurser-tillagg/ma-10-jamviktsrantan.json", "utf8"));
  const reg = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
  const k10 = LARVAG_KARTA.find((k) => k.slug === "ma-10-jamviktsrantan");
  t(k10?.titel === kurs.title, "H1: kartans titel ≡ kursfilens");
  t(JSON.stringify(reg["ma-10-jamviktsrantan"]) === JSON.stringify(kurs), "H2: registerposten ≡ kursfilen bitidentisk");
  t(typeof kurs.why === "string" && kurs.why.length > 800, "H3: varför-raden (why) är en bärande varför-rad (> 800 tkn)");
}

console.log(`\nFRONT B: ${pass} PASS · ${fel} FEL`);
process.exit(fel > 0 ? 1 : 0);
