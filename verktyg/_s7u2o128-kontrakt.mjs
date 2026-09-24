#!/usr/bin/env node
/**
 * o128-kontrakt (s7-u2): källkontrakt för slider-tum-kuren.
 * Verifierar: (1) tummens mobil-mönster komplett (52-tryckyta + visuell
 * cirkel i barn-span), (2) desktop-klasserna intakta, (3) Radix-primitiven
 * oförändrad (Thumb med data-slot + barn), (4) globals.css-golvet orört,
 * (5) inga andra src-filer än ui/slider.tsx bär o128-spåret.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const SLIDER = readFileSync("src/components/ui/slider.tsx", "utf8");
const GLOBALS = readFileSync("src/app/globals.css", "utf8");

let pass = 0, fail = 0;
const kolla = (namn, villkor) => {
  if (villkor) { pass++; console.log(`PASS ${namn}`); }
  else { fail++; console.log(`FAIL ${namn}`); }
};

// 1. Mobil-mönster på tummen
kolla("E1 tummen har max-md:size-[52px] (explicit — golvet når ej span)",
  /SliderPrimitive\.Thumb[^]*?max-md:size-\[52px\]/.test(SLIDER));
kolla("E2 tummen centrerar barnet (max-md:flex + items + justify)",
  /max-md:flex max-md:size-\[52px\] max-md:items-center max-md:justify-center/.test(SLIDER));
kolla("E3 tum-boxen ren på mobil (rounded-none + border/bg/shadow transparent)",
  /max-md:rounded-none max-md:border-transparent max-md:bg-transparent max-md:shadow-none/.test(SLIDER));
kolla("E4 barn-span: visuell cirkel bara på mobil (hidden max-md:block)",
  /<span className="hidden max-md:block size-4 rounded-full border border-primary bg-background shadow-sm"\s*\/>/.test(SLIDER));

// 2. Desktop oförändrad
kolla("D1 desktop-tum-klasser intakta (size-4 cirkel med border+bg)",
  /block size-4 shrink-0 rounded-full border shadow-sm/.test(SLIDER));
kolla("D2 fokus/hover-ringar kvar (hover:ring-4 focus-visible:ring-4)",
  /hover:ring-4 focus-visible:ring-4/.test(SLIDER));
kolla("D3 disabled-kontrakt kvar", /disabled:pointer-events-none disabled:opacity-50/.test(SLIDER));

// 3. Struktur
kolla("S1 Thumb är fortfarande SliderPrimitive.Thumb med data-slot",
  /<SliderPrimitive\.Thumb\s+data-slot="slider-thumb"/.test(SLIDER));
kolla("S2 Track/Range/Root orörda (size-4 finns ENBART på tummen + barnet)",
  (SLIDER.match(/size-4/g) || []).length === 2);

// 4. Golvet orört (o123:s arv)
kolla("G1 golvet kvar: @media 640 + button min-height/min-width 52",
  /@media \(max-width: 640px\)[^]*?button,[^]*?min-height: 52px;[^]*?min-width: 52px;/.test(GLOBALS));

// 5. Ingen annan src-fil rörd av o128
const diffRader = execFileSync("git", ["status", "--porcelain", "src/"], { encoding: "utf8" })
  .split("\n").filter((r) => r.length > 0);
kolla("A1 endast ui/slider.tsx modifierad i src/",
  diffRader.length === 1 && diffRader[0].trim() === "M src/components/ui/slider.tsx");

// 6. Rotbevisets förutsättning: den INSTALLERADE Radix-källan renderar tummen
//    som span role=slider (därav når golvet i globals.css den ej)
const RADIX = readFileSync("node_modules/@radix-ui/react-slider/dist/index.mjs", "utf8");
const PKG = JSON.parse(readFileSync("node_modules/@radix-ui/react-slider/package.json", "utf8"));
kolla("R1 installerad Radix renderar tumme som span role=slider (v" + PKG.version + ")",
  /Primitive\.span,\s*\{[^{}]*role: "slider"/.test(RADIX));

console.log(`\n${pass} PASS · ${fail} FAIL`);
process.exit(fail ? 1 : 0);
