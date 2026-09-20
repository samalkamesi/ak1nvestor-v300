#!/usr/bin/env node
// kontraktssvit: dynamic-catalog (kursexpansionen) — V213B u10
//
// ÄRLIG LÄGESBESKRIVNING (läs detta före ändring):
// Motorfilen src/lib/ak1a/dynamic-catalog.ts FINNS INTE LÄNGRE. Den gallrades
// 2026-09-20 i OPTIMERING o108 (commit e36facda) som bevisat förlustfri DÖD
// EXPORT: en engångsgenererad katalogkopia av public/deep-courses.json utan
// generator och utan konsumenter (enda importeraren = sin egen testsvit), som
// hade driftit från källan (8 titlar + 13 summaries). Även den gamla sviten
// verktyg/testa-dynamic-catalog.mjs gallrades "med sin moder", och
// motorregistrets regen-kur gallrar poster vars fil saknas på disk.
//
// Denna svit testar därför motorns FAKTISKA kontrakt i läget som råder:
//  A) GALLRINGSKONTRAKTET (o108): motorn förblir borta, ingen konsument
//     återföder den, registret bär ingen spökpost och gallringen är
//     transparent bokförd i regen.gallradeUrRegistret.
//  B) KÄLLANS KONTRAKT: public/deep-courses.json är kursexpansionens levande
//     källa (de multikonsumenter som gjorde kopian redundant) — dictionary-
//     form, unika URL-säkra slug, typrena kärnfält, kapitelparitet,
//     nivåvokabulär och sektionskohortens konsistens (underlaget för den
//     projiceringsregel o108 bevisade: hasLynch/hasGraham/hasAk1/hasHistory =
//     sanningsvärde av källsektionerna).
//
// Deterministisk: Ingen server, inget nätverk, ingen prod, ENBART läsning
// (data/ skrivs aldrig). Körning: node verktyg/testa-motor-dynamic-catalog.mjs
// (ren node räcker — sviten importerar ingen .ts-modul.)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MOTOR_SOKVAG = path.join(REPO, "src", "lib", "ak1a", "dynamic-catalog.ts");
const GAMLA_SVITEN = path.join(REPO, "verktyg", "testa-dynamic-catalog.mjs");
const KALLA_SOKVAG = path.join(REPO, "public", "deep-courses.json");
const REGISTER_SOKVAG = path.join(REPO, "data", "motorregister.json");
const KATALOGVOLYM_VID_GALLRING = 205; // o108: katalogen projicerade 205 poster

let passade = 0;
let totalt = 0;
const felen = [];

function kontroll(id, beskrivning, fn) {
  totalt += 1;
  try {
    fn();
    passade += 1;
    console.log(`PASS ${id} — ${beskrivning}`);
  } catch (e) {
    felen.push(`${id}: ${e && e.message ? e.message : String(e)}`);
    console.log(`FAIL ${id} — ${beskrivning}`);
    console.log(`     Orsak: ${e && e.message ? e.message : String(e)}`);
  }
}

function krav(påstående, meddelande) {
  if (!påstående) throw new Error(meddelande);
}

function arStrang(v) {
  return typeof v === "string";
}

function arIckeTomStrang(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function arTaldeBefintligt(v) {
  return typeof v === "number" && Number.isFinite(v);
}

// Rekursiv fillista under en rot, filtrerad på ändelser.
function samlaFiler(rot, andelser, akta = []) {
  const traf = [];
  if (!fs.existsSync(rot)) return traf;
  const stack = [rot];
  while (stack.length > 0) {
    const nu = stack.pop();
    const stat = fs.statSync(nu);
    if (stat.isDirectory()) {
      for (const barn of fs.readdirSync(nu)) stack.push(path.join(nu, barn));
    } else if (andelser.some((a) => nu.endsWith(a)) && !akta.some((a) => nu.startsWith(a))) {
      traf.push(nu);
    }
  }
  return traf;
}

console.log("=== Kontraktssvit: dynamic-catalog (kursexpansion) — läge: GALLRAD (o108) ===");
console.log(`Ägare: V213B u10 · Källa: ${path.relative(REPO, KALLA_SOKVAG)}`);
console.log("");

// ---------------------------------------------------------------- A-sektion
console.log("--- A. Gallringskontraktet (o108: död export förblir borta) ---");

kontroll(
  "A1",
  "motorfilen src/lib/ak1a/dynamic-catalog.ts saknas på disk (gallringen består)",
  () => {
    krav(!fs.existsSync(MOTOR_SOKVAG), "motorfilen finns på disk igen — gallringsbeslutet (o108) är åsidosatt; återinför endast med dokumenterat beslut + uppdaterad svit");
  }
);

kontroll(
  "A2",
  "gamla sviten verktyg/testa-dynamic-catalog.mjs gallrad med sin moder",
  () => {
    krav(!fs.existsSync(GAMLA_SVITEN), "gamla sviten finns på disk — den vaktade en gallrad modul och ska inte finnas (o108 §2.2)");
  }
);

kontroll(
  "A3",
  "ingen källfil i src/ refererar dynamic-catalog (död export förblir död)",
  () => {
    const filer = samlaFiler(path.join(REPO, "src"), [".ts", ".tsx", ".js", ".jsx", ".mjs"]);
    const traff = filer.filter((f) => fs.readFileSync(f, "utf8").includes("dynamic-catalog"));
    krav(traff.length === 0, `src-referenser till dynamic-catalog hittade: ${traff.map((f) => path.relative(REPO, f)).join(", ")}`);
  }
);

const register = (() => {
  try {
    return JSON.parse(fs.readFileSync(REGISTER_SOKVAG, "utf8"));
  } catch {
    return null;
  }
})();

kontroll(
  "A4",
  "data/motorregister.json: giltigt register utan dynamic-catalog-spökpost",
  () => {
    krav(register !== null, "registret kunde ej läsas/tolkas som JSON");
    krav(Array.isArray(register.motorer), "registret saknar motorer-array");
    const spok = register.motorer.filter((m) =>
      [m.namn, m.fil, m.beskrivning].filter(arStrang).some((v) => v.includes("dynamic-catalog"))
    );
    krav(spok.length === 0, `spökpost(er) i registret: ${JSON.stringify(spok.map((m) => m.namn || m.fil))}`);
  }
);

kontroll(
  "A5",
  "gallringen transparent i regen.gallradeUrRegistret (o108-kurens bokföring)",
  () => {
    krav(register !== null, "registret kunde ej läsas");
    const g = register.regen && register.regen.gallradeUrRegistret;
    krav(Array.isArray(g), "regen.gallradeUrRegistret är ingen array");
    krav(g.some((s) => typeof s === "string" && s.includes("dynamic-catalog")), "dynamic-catalog gallring saknas i regen.gallradeUrRegistret — transparent bokföring borta");
  }
);

console.log("");

// ---------------------------------------------------------------- B-sektion
console.log("--- B. Källans kontrakt (public/deep-courses.json — kursexpansionens levande källa) ---");

const kalla = (() => {
  try {
    return JSON.parse(fs.readFileSync(KALLA_SOKVAG, "utf8"));
  } catch {
    return null;
  }
})();

const poster = kalla !== null && typeof kalla === "object" && !Array.isArray(kalla) ? Object.values(kalla) : [];

kontroll(
  "B1",
  "källan lever: fil, giltig JSON, dictionary-form, icke-tom",
  () => {
    krav(fs.existsSync(KALLA_SOKVAG), "public/deep-courses.json saknas — kursexpansionens källa borta");
    krav(kalla !== null && typeof kalla === "object" && !Array.isArray(kalla), "källan är ej ett JSON-objekt (dictionary)");
    krav(poster.length > 0, "källan är tom");
  }
);

kontroll(
  "B2",
  `volym ≥ ${KATALOGVOLYM_VID_GALLRING} poster (källan minst som projiceringsunderlaget vid gallringsbeviset)`,
  () => {
    krav(poster.length >= KATALOGVOLYM_VID_GALLRING, `endast ${poster.length} poster — under gallringens projicerade volym (${KATALOGVOLYM_VID_GALLRING})`);
  }
);

kontroll(
  "B3",
  "dictionary-kontraktet: varje nyckel === postens slug",
  () => {
    const avvikare = Object.keys(kalla).filter((nyckel) => kalla[nyckel].slug !== nyckel);
    krav(avvikare.length === 0, `nyckel≠slug för ${avvikare.length} poster (exempel: ${avvikare.slice(0, 3).join(", ")})`);
  }
);

kontroll(
  "B4",
  "unika slug (inga dubbelkurser)",
  () => {
    const slugs = poster.map((p) => p.slug);
    krav(new Set(slugs).size === slugs.length, `dubbelslug: totalt ${slugs.length}, unika ${new Set(slugs).size}`);
  }
);

kontroll(
  "B5",
  "slug URL-säkra: pattern [a-z0-9-]",
  () => {
    const fel = poster.filter((p) => !/^[a-z0-9-]+$/.test(p.slug));
    krav(fel.length === 0, `ogiltiga slug (exempel: ${fel.slice(0, 3).map((p) => JSON.stringify(p.slug)).join(", ")})`);
  }
);

kontroll(
  "B6",
  "kärnfält typrena: slug/title/category/summary/learn/why = sträng (titel-kärnan icke-tom)",
  () => {
    const fel = poster.filter(
      (p) =>
        !arStrang(p.slug) ||
        !arIckeTomStrang(p.title) ||
        !arIckeTomStrang(p.category) ||
        !arStrang(p.summary) ||
        !arStrang(p.learn) ||
        !arStrang(p.why)
    );
    krav(fel.length === 0, `${fel.length} poster med felaktiga kärnfält (exempel: ${fel.slice(0, 3).map((p) => p.slug).join(", ")})`);
  }
);

kontroll(
  "B7",
  "minutes/totalMinutes/xp/chapterCount = ändliga tal ≥ 0",
  () => {
    const fel = poster.filter(
      (p) => ![p.minutes, p.totalMinutes, p.xp, p.chapterCount].every((v) => arTaldeBefintligt(v) && v >= 0)
    );
    krav(fel.length === 0, `${fel.length} poster med icke-tal eller negativa värden (exempel: ${fel.slice(0, 3).map((p) => p.slug).join(", ")})`);
  }
);

kontroll(
  "B8",
  "kapitelparitet: chapters = array && chapterCount === chapters.length",
  () => {
    const fel = poster.filter((p) => !Array.isArray(p.chapters) || p.chapterCount !== p.chapters.length);
    krav(fel.length === 0, `${fel.length} poster där chapterCount ≠ chapters.length (exempel: ${fel.slice(0, 3).map((p) => p.slug).join(", ")})`);
  }
);

kontroll(
  "B9",
  "chapters_list = array",
  () => {
    const fel = poster.filter((p) => !Array.isArray(p.chapters_list));
    krav(fel.length === 0, `${fel.length} poster utan chapters_list-array (exempel: ${fel.slice(0, 3).map((p) => p.slug).join(", ")})`);
  }
);

kontroll(
  "B10",
  "nivåvokabulär: level = sträng && kärnan {Nybörjare, Intermediär, Avancerad} representerad",
  () => {
    const fel = poster.filter((p) => !arStrang(p.level));
    krav(fel.length === 0, `${fel.length} poster där level ej är sträng`);
    const nivaer = new Set(poster.map((p) => p.level));
    for (const karna of ["Nybörjare", "Intermediär", "Avancerad"]) {
      krav(nivaer.has(karna), `kärnnivån "${karna}" saknas i källan`);
    }
  }
);

kontroll(
  "B11",
  "sektionskohortens konsistens: history/lynch/graham/ak1 definierade på exakt samma poster",
  () => {
    const FALT = ["history", "lynchSection", "grahamSection", "ak1Section"];
    const blandade = poster.filter((p) => {
      const def = FALT.map((f) => p[f] !== undefined);
      return def.some((x) => x) && def.some((x) => !x);
    });
    krav(blandade.length === 0, `${blandade.length} poster med blandad sektionsdefinition (exempel: ${blandade.slice(0, 3).map((p) => p.slug).join(", ")})`);
  }
);

kontroll(
  "B12",
  "projektionsunderlaget: inom kohorten är lynch/graham/ak1 icke-tomma strängar och history ett objekt",
  () => {
    const fel = poster.filter((p) =>
      p.lynchSection !== undefined &&
      (!arIckeTomStrang(p.lynchSection) ||
        !arIckeTomStrang(p.grahamSection) ||
        !arIckeTomStrang(p.ak1Section) ||
        typeof p.history !== "object" ||
        p.history === null)
    );
    krav(fel.length === 0, `${fel.length} poster med tomma/ogiltiga sektioner (exempel: ${fel.slice(0, 3).map((p) => p.slug).join(", ")})`);
  }
);

// Observationer (rapporteras, låses ej — källan får utvecklas):
if (poster.length > 0) {
  const nivaFordelning = {};
  poster.forEach((p) => {
    nivaFordelning[JSON.stringify(p.level)] = (nivaFordelning[JSON.stringify(p.level)] || 0) + 1;
  });
  const kohort = poster.filter((p) => p.lynchSection !== undefined).length;
  console.log("");
  console.log(`OBS (ej låst): ${poster.length} poster · sektionskohort ${kohort} · levelfördelning ${JSON.stringify(nivaFordelning)}`);
  console.log("OBS (ej låst): documented källformer — level \"Alla\"/\"\" samt totalMinutes≠minutes i sektionslösa poster är kända källegenskaper (protokoll V213B-U10).");
}

console.log("");
if (felen.length > 0) {
  console.log(`FEL (${felen.length}):`);
  for (const f of felen) console.log(`  - ${f}`);
}
console.log(`RESULTAT: ${passade}/${totalt} PASS`);
process.exit(passade === totalt ? 0 : 1);
