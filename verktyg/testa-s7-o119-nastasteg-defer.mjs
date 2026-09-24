#!/usr/bin/env node
/**
 * Kontraktstest s7-o118 — NastaSteg ur kritisk hydratisering (o118, spår 7).
 *
 * Verifierar mekaniskt:
 *  A. wrapper-modulen nasta-steg-latad.tsx (use client + dynamic ssr:false)
 *  B. seo-page-shell.tsx (konsument-byte, serverkomponent, o105-grenar orörda)
 *  C. nasta-steg.tsx kontrakt orört (SSR=null, usePathname, useEffect)
 *  D. exklusivitet: inga andra direktkonsumenter av nasta-steg i src/
 *
 * Körning: node verktyg/testa-s7-o118-nastasteg-defer.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rot = join(dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0;
let fail = 0;

function kolla(namn, villkor, detalj = "") {
  if (villkor) {
    pass += 1;
    console.log(`  PASS ${namn}${detalj ? " — " + detalj : ""}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${namn}${detalj ? " — " + detalj : ""}`);
  }
}

function las(rel) {
  return readFileSync(join(rot, rel), "utf8");
}

// Rekursiv filsamling under src/ (endast .tsx/.ts)
function samlaSrc() {
  const ut = [];
  const stack = [join(rot, "src")];
  while (stack.length > 0) {
    const mapp = stack.pop();
    for (const namn of readdirSync(mapp)) {
      const vag = join(mapp, namn);
      const st = statSync(vag);
      if (st.isDirectory()) stack.push(vag);
      else if (/\.(tsx|ts)$/.test(namn)) ut.push(vag);
    }
  }
  return ut;
}

console.log("A — wrapper-modulen nasta-steg-latad.tsx");
const wrapper = las("src/components/ak1a/nasta-steg-latad.tsx");
const wrapperDirektiv = wrapper.match(/^["']use client["'];?/m);
kolla(
  "A1 'use client'-direktiv",
  wrapperDirektiv !== null,
  "App Router kräver klientkontext för ssr:false",
);
kolla("A2 dynamic med ssr: false", /dynamic\(/.test(wrapper) && /ssr:\s*false/.test(wrapper));
kolla(
  "A3 importerar NastaSteg från @/components/ak1a/nasta-steg",
  wrapper.includes('import("@/components/ak1a/nasta-steg")') && wrapper.includes("m.NastaSteg"),
);
kolla(
  "A4 exporterar NastaStegLatad",
  /export const NastaStegLatad\s*=\s*dynamic/.test(wrapper),
);

console.log("B — seo-page-shell.tsx (konsument-byte)");
const shell = las("src/components/ak1a/seo-page-shell.tsx");
kolla(
  "B1 importerar NastaStegLatad från wrappern",
  shell.includes('import { NastaStegLatad } from "@/components/ak1a/nasta-steg-latad"'),
);
kolla(
  "B2 direktimport av nasta-steg borta",
  !shell.includes('from "@/components/ak1a/nasta-steg"'),
  "shell-filen får inte längre dra widget-modulen i chunkgrafen",
);
kolla(
  "B3 <NastaStegLatad /> i cv-nasta-steg-containern",
  /cv-nasta-steg[^<]*>\s*<NastaStegLatad\s*\/>/.test(shell.replace(/"/g, '"').replace(/\n/g, " ").replace(/\s+/g, " ")) ||
    (shell.includes("cv-nasta-steg") && shell.includes("<NastaStegLatad />")),
);
kolla(
  "B4 shell förblir serverkomponent (inget use client)",
  !/^["']use client["'];?/m.test(shell),
  "o105:s serverbindningar kräver serverkontext",
);
kolla(
  "B5 o105-spegelgrenar orörda (SidfooterServer + BrodkrummaServer med lang)",
  shell.includes("<SidfooterServer lang={lang} />") && shell.includes("<BrodkrummaServer breadcrumb={breadcrumb} lang={lang} />"),
  "o110:s kontrakt",
);
kolla(
  "B6 o118-precedensnot i shellens dokumentationsblock",
  shell.includes("o118") && shell.includes("nasta-steg-latad"),
);

console.log("C — widgetens kontrakt orört (nasta-steg.tsx)");
const widget = las("src/components/ak1a/nasta-steg.tsx");
kolla("C1 'use client'-direktiv kvar", /^["']use client["'];?/m.test(widget));
kolla("C2 usePathname + useEffect kvar", widget.includes("usePathname") && widget.includes("useEffect"));
kolla("C3 SSR=null-kontraktet kvar (första passt tomt)", widget.includes("if (forlag.length === 0) return null;"));
kolla("C4 rubrik-kännetecken kvar", widget.includes("Ditt nästa steg"));

console.log("D — exklusivitet (inga andra direktkonsumenter)");
const tillatna = ["nasta-steg.tsx", "nasta-steg-latad.tsx"];
const brott = [];
for (const vag of samlaSrc()) {
  const fil = vag.split("/").pop();
  if (tillatna.includes(fil)) continue;
  const text = readFileSync(vag, "utf8");
  if (text.includes('from "@/components/ak1a/nasta-steg"') || text.includes('import("@/components/ak1a/nasta-steg")')) {
    if (fil !== "nasta-steg-latad.tsx") brott.push(vag.replace(rot + "/", ""));
  }
}
kolla("D1 nasta-steg importeras ENDAST av wrappern", brott.length === 0, brott.length ? brott.join(", ") : "exklusiv ägarskap = kurens koddelning håller");

console.log(`\nRESULTAT: ${pass} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
