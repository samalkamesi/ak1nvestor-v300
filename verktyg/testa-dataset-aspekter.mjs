#!/usr/bin/env node
/**
 * VIT-TEST — dataset-aspekternas kontrakts- + juridikgrind (våg 150 u5)
 * ====================================================================
 * Permanent regression för modulerna i src/lib/dataset-aspekter/*.ts
 * (sidorna bakom kommande rutten /dataset/[bransch]/[aspekt]). Vaktar:
 *
 *  - KONTRAKTET (src/lib/dataset-aspekter-kontrakt.ts): gränsregel-ärlighet
 *    (matta >= 5 ELLER median === null — en sida publiceras aldrig med
 *    påhittad median), minimiinnehåll (kurslänkar ≥ 3, såRäknas ≥ 3,
 *    såLäserDu ≥ 3, fällor ≥ 2) samt branschens svenska namn i titeln.
 *  - JURIDIKGRINDEN (bransch-teman §6, KVD §7 punkt 2 — "vitt test"):
 *    PREC-ST-fälten recommendation/priceTarget ("FÖRSIKTIGT KÖP" m.fl.)
 *    får ALDRIG syndikeras; kursmål och AKM hör inte hemma på dataset-ytan.
 *  - GRÄNSDRAGNINGEN (A2-DATASET-KONTRAKT §1): INGA bolagsnamn eller
 *    tickers ur bolagsunivers.json (100 st) i utdata — exakt token-
 *    matchning (kasuskänslig, ordgränser), aldrig delord.
 *
 * VARNINGAR (failar ej): 'köp ', 'sälj ', 'billig' i textfälten — troliga
 * rådformuleringar som skall överskådas manuellt (omskrivningstabell §6).
 *
 * Modulerna upptäcks dynamiskt (fs.readdirSync + import per fil); saknar en
 * fil 'aspekter'-exporten rapporteras det utan att faila. ALLT körs i
 * try/catch per modul — ett importfel dödar aldrig hela testet.
 *
 * Körs:  npx tsx verktyg/testa-dataset-aspekter.mjs   (från repo-roten)
 * Exit:  0 = grönt · 1 = minst ett fel.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROTT = process.cwd();
const MODULKATALOG = path.join(ROTT, "src", "lib", "dataset-aspekter");

// De 10 branscherna i 100-bolagsuniversumet (bransch-teman §2).
const BRANSCHER = [
  "teknik",
  "konsument",
  "industri",
  "kommunikation",
  "energi",
  "halso",
  "fastighet",
  "tillvaxt",
  "material",
  "finans",
];

// Förbjudna strängar i JSON-utdata (juridik §6 flagga 1 + kontraktets
// gränsdragning). Jämförelsen är skiftlägesokänslig — 'Akm' är lika förbjudet.
const FORBJUDNA_STRANGAR = ["FÖRSIKTIGT KÖP", "priceTarget", "recommendation", "kursmål", "AKM"];

// Varningsord (skrivs ut men failar ej) — råddoftande formuleringar.
const VARNINGSORD = ["köp ", "sälj ", "billig"];

// ── Bolagsvakten: exakt token-matchning, inte delord ────────────────────────
// Kortaste tickern i universumet är "T" (AT&T) — rå includes() skulle trigga
// på vartenda versalt T i löptexten. Gränser: alfanum + åäö (versal/gemen),
// kasuskänsligt; punkt och bindestreck runt om tillåts ("Apple Inc." i en
// mening, "ERIC-B.ST," skall fortsatt fångas).
function escapeRegex(st) {
  return st.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function tokenRegex(strang) {
  return new RegExp(
    "(?<![A-Za-z0-9ÅÄÖåäö])" + escapeRegex(strang) + "(?![A-Za-z0-9ÅÄÖåäö])",
  );
}

// ── Hjälp: en fel-/varningsrad ───────────────────────────────────────────────
function fejruta(modulFil, slug, bransch, meddelande) {
  return `[${modulFil} · ${slug} · ${bransch}] ${meddelande}`;
}

// ── Läs bolagsuniversumet (källa: kontraktet — EN källa, publika fält) ──────
function lasUniversum() {
  const fil = path.join(ROTT, "data", "portfolj-system", "bolagsunivers.json");
  const radata = JSON.parse(readFileSync(fil, "utf8"));
  if (!Array.isArray(radata)) throw new Error("bolagsunivers.json är inte en lista");
  return radata
    .filter((r) => r && typeof r.namn === "string" && typeof r.ticker === "string")
    .map((r) => ({ namn: r.namn, ticker: r.ticker, namnRe: tokenRegex(r.namn), tickerRe: tokenRegex(r.ticker) }));
}

// ── Kontrollera EN genererad sida ────────────────────────────────────────────
// Returnerar { fel: string[], varningar: string[] }.
function kontrolleraSida(modulFil, aspekt, branschSlug, namnSv, sida, universum) {
  const fel = [];
  const varningar = [];
  const json = JSON.stringify(sida);
  const jsonGemener = json.toLowerCase();

  // 1. Gränsregel-ärlighet: under 5 mätta bolag får ingen median redovisas.
  if (!(sida.matta >= 5 || sida.median === null)) {
    fel.push(
      fejruta(
        modulFil,
        aspekt.slug,
        branschSlug,
        `gränsregel bruten: matta=${sida.matta} < 5 men median=${sida.median} ≠ null (MIN_MATTA gäller)`,
      ),
    );
  }

  // 2. Juridikgrinden: PREC-ST-fälten + kursmål + AKM når aldrig utdata.
  for (const forbjuden of FORBJUDNA_STRANGAR) {
    if (jsonGemener.includes(forbjuden.toLowerCase())) {
      fel.push(
        fejruta(
          modulFil,
          aspekt.slug,
          branschSlug,
          `förbjuden sträng i JSON-utdata: '${forbjuden}' (juridikgrinden §6 / kontraktet)`,
        ),
      );
    }
  }

  // 3. Gränsdragningen: inga bolagsnamn eller tickers (alla 100, exakt token).
  for (const b of universum) {
    const traff = b.namnRe.test(json) ? b.namn : b.tickerRe.test(json) ? b.ticker : null;
    if (traff !== null) {
      fel.push(
        fejruta(
          modulFil,
          aspekt.slug,
          branschSlug,
          `bolagsläcka i JSON-utdata: '${traff}' (gränsdragningen — aldrig namn/ticker)`,
        ),
      );
    }
  }

  // 4. Minimiinnehåll enligt kontraktet.
  if (!(Array.isArray(sida.kurslankar) && sida.kurslankar.length >= 3)) {
    fel.push(
      fejruta(
        modulFil,
        aspekt.slug,
        branschSlug,
        `kurslankar=${Array.isArray(sida.kurslankar) ? sida.kurslankar.length : "saknas"} (krav ≥ 3)`,
      ),
    );
  }
  if (!(Array.isArray(sida.saRaknas) && sida.saRaknas.length >= 3)) {
    fel.push(
      fejruta(
        modulFil,
        aspekt.slug,
        branschSlug,
        `saRaknas=${Array.isArray(sida.saRaknas) ? sida.saRaknas.length : "saknas"} (krav ≥ 3)`,
      ),
    );
  }
  if (!(Array.isArray(sida.saLaserDu) && sida.saLaserDu.length >= 3)) {
    fel.push(
      fejruta(
        modulFil,
        aspekt.slug,
        branschSlug,
        `saLaserDu=${Array.isArray(sida.saLaserDu) ? sida.saLaserDu.length : "saknas"} (krav ≥ 3)`,
      ),
    );
  }
  if (!(Array.isArray(sida.fellerAttUndvika) && sida.fellerAttUndvika.length >= 2)) {
    fel.push(
      fejruta(
        modulFil,
        aspekt.slug,
        branschSlug,
        `fellerAttUndvika=${Array.isArray(sida.fellerAttUndvika) ? sida.fellerAttUndvika.length : "saknas"} (krav ≥ 2)`,
      ),
    );
  }

  // 5. Titeln skall bära branschens svenska namn (branschNamn ur dataset-medianer).
  const titel = String(sida.titel ?? "");
  if (!titel.toLowerCase().includes(namnSv.toLowerCase())) {
    fel.push(
      fejruta(
        modulFil,
        aspekt.slug,
        branschSlug,
        `titeln '${titel}' innehåller inte branschens svenska namn '${namnSv}'`,
      ),
    );
  }

  // VARNINGAR (failar ej): råddoftande ord i textfälten.
  for (const ord of VARNINGSORD) {
    if (jsonGemener.includes(ord)) {
      varningar.push(fejruta(modulFil, aspekt.slug, branschSlug, `varning: ordet '${ord}' i textfälten`));
    }
  }

  return { fel, varningar };
}

// ── Huvudprogram ─────────────────────────────────────────────────────────────
async function huvud() {
  console.log("VIT-TEST dataset-aspekter — kontrakt + juridikgrind (våg 150 u5)");
  console.log("=".repeat(72));

  // Modulerna upptäcks dynamiskt — nya filer testas automatiskt.
  let filer = [];
  try {
    filer = readdirSync(MODULKATALOG)
      .filter((f) => f.endsWith(".ts") && !f.startsWith("_") && !f.startsWith("."))
      .sort();
  } catch (e) {
    console.error(`FEL: kunde inte läsa ${MODULKATALOG} (${e.message}) — kör från repo-roten.`);
    process.exit(1);
  }
  if (filer.length === 0) {
    console.error("FEL: inga .ts-moduler hittades i src/lib/dataset-aspekter/.");
    process.exit(1);
  }

  // Branschernas svenska namn — EN namnkälla (dataset-medianer.ts).
  const medianerUrl = pathToFileURL(path.join(ROTT, "src", "lib", "dataset-medianer.ts")).href;
  const { branschNamn } = await import(medianerUrl);

  const universum = lasUniversum();
  console.log(`Universum: ${universum.length} bolag · Branscher: ${BRANSCHER.length} · Moduler: ${filer.length}`);
  console.log("=".repeat(72));

  const allaFel = [];
  const allaVarningar = [];
  const modulerUtanAspekter = [];
  let modulerTestade = 0;
  let aspekterTotalt = 0;
  let sidkontroller = 0;
  let ejGenererade = 0;
  const modulNamn = [];

  for (const fil of filer) {
    const modulFil = fil;
    modulNamn.push(fil);
    console.log(`\n── ${fil} ──`);

    let mod = null;
    try {
      mod = await import(pathToFileURL(path.join(MODULKATALOG, fil)).href);
    } catch (e) {
      allaFel.push(`[${modulFil}] import misslyckades: ${e.message}`);
      console.log(`   IMPORTFEL: ${e.message}`);
      continue;
    }

    if (!Array.isArray(mod.aspekter)) {
      modulerUtanAspekter.push(modulFil);
      console.log(`   Rapport (ej fel): exporterar ingen 'aspekter'-lista — hoppas över.`);
      continue;
    }

    modulerTestade += 1;
    aspekterTotalt += mod.aspekter.length;
    console.log(`   ${mod.aspekter.length} aspekter: ${mod.aspekter.map((a) => a.slug).join(", ")}`);

    for (const aspekt of mod.aspekter) {
      let okRaknare = 0;
      for (const branschSlug of BRANSCHER) {
        const namnSv = branschNamn("sv", branschSlug);
        let sida = null;
        let kastade = null;
        try {
          sida = aspekt.generera(branschSlug);
        } catch (e) {
          kastade = e;
        }
        if (kastade !== null) {
          allaFel.push(
            fejruta(modulFil, aspekt.slug, branschSlug, `generera kastade: ${kastade.message}`),
          );
          continue;
        }
        if (sida === null) {
          // Tillåtet utfall: okänd bransch eller opublicerad enligt gränsregeln
          // (SLUTLED-registret fattar det beslutet) — rapporteras, failar ej.
          ejGenererade += 1;
          continue;
        }
        sidkontroller += 1;
        const { fel, varningar } = kontrolleraSida(
          modulFil,
          aspekt,
          branschSlug,
          namnSv,
          sida,
          universum,
        );
        if (fel.length === 0) okRaknare += 1;
        allaFel.push(...fel);
        allaVarningar.push(...varningar);
      }
      console.log(
      `   ${allaFel.some((f) => f.startsWith(`[${modulFil} · ${aspekt.slug} ·`)) ? "✗" : "✓"} ${aspekt.slug}: ${okRaknare}/${BRANSCHER.length} branscher gröna`,
      );
    }
  }

  // ── Rapport ────────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(72));
  if (allaVarningar.length > 0) {
    console.log(`VARNINGAR (${allaVarningar.length}) — failar ej, överskådas manuellt:`);
    for (const v of allaVarningar) console.log(`  ⚠ ${v}`);
  }
  if (modulerUtanAspekter.length > 0) {
    console.log(`\nRAPPORTERAT (ej fel) — moduler utan 'aspekter'-export:`);
    for (const m of modulerUtanAspekter) console.log(`  · ${m}`);
  }
  if (allaFel.length > 0) {
    console.log(`\nFEL (${allaFel.length}):`);
    for (const f of allaFel) console.log(`  ✗ ${f}`);
  }

  console.log("\n" + "=".repeat(72));
  console.log("SAMMANFATTNING");
  console.log(`  Moduler hittade:        ${filer.length} (${modulNamn.join(", ")})`);
  console.log(`  Moduler testade:        ${modulerTestade} (med aspekter-export)`);
  console.log(`  Aspekter totalt:        ${aspekterTotalt}`);
  console.log(`  Sidkontroller körda:    ${sidkontroller}`);
  console.log(`  Ej genererade (null):   ${ejGenererade} — gränsregel/okänd bransch, ej fel`);
  console.log(`  Varningar:              ${allaVarningar.length}`);
  console.log(`  FEL:                    ${allaFel.length}`);

  if (allaFel.length === 0) {
    console.log("\nRESULTAT: GRÖNT — kontrakt + juridikgrind håller för alla testade moduler.");
    process.exit(0);
  }
  console.log(`\nRESULTAT: RÖTT — ${allaFel.length} fel skall åtgärdas innan modulerna får nå rutten.`);
  process.exit(1);
}

huvud().catch((e) => {
  console.error(`OFÅNGAT FEL (testet självt): ${e && e.stack ? e.stack : e}`);
  process.exit(1);
});
