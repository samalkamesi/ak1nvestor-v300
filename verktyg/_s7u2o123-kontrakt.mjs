#!/usr/bin/env node
/** o123-kontrakt: statisk verifiering av rond 4-fixarna (s7-u2). */
import { readFileSync } from "node:fs";

let pass = 0;
let fail = 0;
const kolla = (namn, villkor) => {
  if (villkor) { pass++; console.log(`PASS · ${namn}`); }
  else { fail++; console.log(`FAIL · ${namn}`); }
};
const las = (p) => readFileSync(p, "utf8");

// A — globals: husgolvet 52 ( båda riktningarna), 44 borta ur golvet
const css = las("src/app/globals.css");
kolla("A1 globals: knappgolv min-height 52 i mobil-media", /min-height:\s*52px/.test(css) && /@media \(max-width:\s*640px\)/.test(css));
kolla("A2 globals: golvet 44 kvar som historik-namn? nej — inga 44px-golv kvar", !/min-height:\s*44px/.test(css));

// B — kalkylator: summary + inputs + select
const kalc = las("src/components/ak1a/akm1-calculator.tsx");
kolla("B1 kalkylator: summary har max-md:min-h-[52px] + text-base", /<summary className=\{`max-md:flex max-md:min-h-\[52px\] max-md:items-center max-md:text-base/.test(kalc));
kolla("B2 kalkylator: räkne-input max-md 52/16 (o8-mönstret med !)", kalc.includes('className="mt-1 h-9 text-sm max-md:min-h-[52px]! max-md:text-base"'));
kolla("B3 kalkylator: bransch-select max-md 52/16", kalc.includes("max-md:min-h-[52px]! max-md:text-base") && /<select[\s\S]{0,400}max-md:min-h-\[52px\]!/.test(kalc));

// C — superanalys: 2 inputs + 8 knappar
const sup = las("src/components/ak1a/superanalys.tsx");
kolla("C1 superanalys: bolagsnamn-input 52/16", (sup.match(/max-md:min-h-\[52px\]! max-md:text-base/g) || []).length === 2);
kolla("C2 superanalys: 8 explicita knappar min-h-[44px] max-md:min-h-[52px]", (sup.match(/min-h-\[44px\] max-md:min-h-\[52px\]/g) || []).length === 8);

// D — shortseller: ×-knappen = tryckyta med span-cirkel
const ss = las("src/components/ak1a/short-seller.tsx");
kolla("D1 shortseller: knappen bär inte längre visuell cirkel (flex items-start justify-end)", /className="absolute -right-1\.5 -top-1\.5 flex items-start justify-end rounded-full transition-colors"/.test(ss));
kolla("D2 shortseller: span bär 20px-cirkeln med ×", /<span className="flex h-5 w-5 items-center justify-center rounded-full border border-\[#30363D\][^"]*">\s*×\s*<\/span>/.test(ss));

// E — dataset-sortering: pills (sort + bransch), alla språk via samma komponent
const ds = las("src/components/ak1a/dataset-sortering.tsx");
kolla("E1 dataset: sorteringslänkar ×2 varianter 52", (ds.match(/max-md:flex max-md:min-h-\[52px\] max-md:items-center/g) || []).length === 3);
kolla("E2 dataset: branschlänk i mobilkort 52", /font-serif text-base font-bold text-foreground underline decoration-gold\/40 underline-offset-4 max-md:flex max-md:min-h-\[52px\] max-md:items-center/.test(ds));

// F — skanna-knappar
kolla("F1 konfluens: skanna-knapp 52 mobil", las("src/components/ak1a/konfluens-tabell.tsx").includes("btn-marin min-h-[44px] max-md:min-h-[52px] px-5 py-2.5"));
kolla("F2 netnet: skanna-knapp 52 mobil", las("src/components/ak1a/netnet-skanner.tsx").includes("min-h-[44px] max-md:min-h-[52px] rounded-lg bg-gold"));

// G — ingen dubbelläggning
const alla = [kalc, sup, ss, ds].join("");
kolla("G1 inga dubbla max-md:min-h-[52px]-kedjor", !alla.includes("max-md:min-h-[52px] max-md:min-h-[52px]"));

console.log(`\n${pass} PASS · ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
