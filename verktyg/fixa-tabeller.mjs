#!/usr/bin/env node
/**
 * Reparera ogiltiga tabell-block i data/bokmaster/*.json.
 * Återkommande agentbug: komma-bortfall mellan rader ("...]["...").
 * Strategi: ENDAST ogiltiga tabeller röras — radgränsen "][" får ett komma
 * (giltiga tabeller innehåller aldrig "][" eftersom rader är 2 nivåer djupa).
 *
 *   node verktyg/fixa-tabeller.mjs [fil...]   → reparera (alla filer om inget anges)
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const KALLA = join(process.cwd(), "data", "bokmaster");
const filer = process.argv.length > 2 ? process.argv.slice(2) : readdirSync(KALLA).filter((f) => f.endsWith(".json"));

let totaltFixade = 0;

for (const fil of filer) {
  const sokvag = fil.includes("\\") || fil.includes("/") ? fil : join(KALLA, fil);
  let kurs;
  try {
    kurs = JSON.parse(readFileSync(sokvag, "utf8"));
  } catch (e) {
    console.log(`⏸ ${fil}: filen ogiltig JSON — agent skriver kanske (${e.message.slice(0, 40)})`);
    continue;
  }

  let fixade = 0;
  for (const kap of kurs.chapters || []) {
    for (const b of kap.blocks || []) {
      if (b.type !== "tabell") continue;
      let giltig = false;
      try {
        JSON.parse(b.content);
        giltig = true;
      } catch {
        giltig = false;
      }
      if (giltig) continue;

      // Reparation: sätt komma vid radgränser som saknar det
      const lagad = b.content.replaceAll("][", "],[");
      try {
        const test = JSON.parse(lagad);
        if (test.rubrik && Array.isArray(test.rader)) {
          b.content = lagad;
          fixade++;
          console.log(`✓ ${fil} kap ${kap.num}: tabell reparerad`);
        } else {
          console.log(`✗ ${fil} kap ${kap.num}: strukturen fel även efter komma-fix`);
        }
      } catch (e) {
        console.log(`✗ ${fil} kap ${kap.num}: kan inte repareras automatiskt (${e.message.slice(0, 50)})`);
      }
    }
  }

  if (fixade > 0) {
    writeFileSync(sokvag, JSON.stringify(kurs, null, 2), "utf8");
    totaltFixade += fixade;
  }
}

console.log(`\nTotalt reparerade tabeller: ${totaltFixade}`);
