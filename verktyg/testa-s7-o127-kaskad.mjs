#!/usr/bin/env node
/**
 * o127-kontrakt (s7-u1): kaskadkuren .flex-barn och .grid-barn → @layer base.
 * K1  källreglerna finns INOM ett @layer base-block (kaskadordningen base<utilities)
 * K2  exakt EN förekomst av vardera selektor (inga dubbletter utanför blocket)
 * K3  omgivande projekt-regler orörda (h1-h6, break-all, golv-media)
 * K4  syskonet s7-u2:o128:s slider-tum-kur orörd (deras yta —Verifiering, ej ändring)
 * K5  o123:s pill-klasser (max-md:min-w-[52px]) orörda i dataset-sortering
 * K6  sonden bär metrologin: scrollIntoView+CDP-musklick + Network.setCacheDisabled
 * K7  FÖRE-data finns: 20/20 sliders under 52 dokumenterade i JSON
 */
import { readFileSync } from "node:fs";

const las = (p) => readFileSync(p, "utf8");
let pass = 0, fail = 0;
const koll = (id, villkor, detalj = "") => {
  if (villkor) { pass++; console.log(`PASS ${id}`); }
  else { fail++; console.log(`FAIL ${id} ${detalj}`); }
};

const g = las("src/app/globals.css");
// K1: båda selektorerna inuti @layer base
const baseStart = g.indexOf("@layer base {");
koll("K1", baseStart >= 0 && g.indexOf(".flex > *") > baseStart
  && g.indexOf(".grid > *") > baseStart
  && g.indexOf(".grid > *") < g.indexOf("}", g.indexOf(".grid > *")) // innan blocket stängs
  , "selektorerna måste ligga inom @layer base-blocket");
// K2: exakt en av varje
koll("K2", (g.match(/\.flex > \*/g) || []).length === 1 && (g.match(/\.grid > \*/g) || []).length === 1,
  "dubbletter av selektorerna");
// K3: omgivning orörd
koll("K3", g.includes("overflow-wrap: break-word") && g.includes(".break-all") && g.includes("word-break: break-all"),
  "omgivande projektregler");
// K4: o128 slider-kur orörd
const s = las("src/components/ui/slider.tsx");
koll("K4", s.includes("max-md:size-[52px]") && s.includes("hidden max-md:block size-4 rounded-full"),
  "s7-u2:o128:s tum-kur ska vara orörd");
// K5: o123 pill-klasser orörda
const d = las("src/components/ak1a/dataset-sortering.tsx");
koll("K5", d.includes("max-md:min-w-[52px]"), "o123:s pill-breddsklass orörd");
// K6: sondens metrologi
const sond = las("verktyg/o127-slidersond.mjs");
koll("K6", sond.includes("scrollIntoView") && sond.includes("Input.dispatchMouseEvent")
  && sond.includes("setCacheDisabled"), "sondens klick+cache-metrologi");
// K7: FÖRE-data
const fore = JSON.parse(las("data/forskning/OPTIMERING/lighthouse/o127-slider-fore.json"));
koll("K7", fore.aktivFlik?.antalSliders >= 20 && fore.aktivFlik?.slidersUnder52 === fore.aktivFlik?.antalSliders,
  "FÖRE-bevis 20/20 under 52");

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
