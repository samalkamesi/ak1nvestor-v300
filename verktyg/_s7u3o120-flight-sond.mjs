#!/usr/bin/env node
/**
 * o118 — flight-sond för spegel-blogglistorna (o45-mönstret):
 * avescapar den inline RSC-flighten ur live-HTML och letar död/duplicerad
 * vikt (not-found-läckor, repeterade objektfamiljer, stora props).
 *
 * Utdata: data/forskning/OPTIMERING/lighthouse/o118-flight-sond.json
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const KAT = "data/forskning/OPTIMERING/lighthouse";
const SIDOR = [
  ["en_blogg", "http://localhost:3000/en/blogg"],
  ["ar_blogg", "http://localhost:3000/ar/blogg"],
  ["blogg_sv", "http://localhost:3000/blogg"],
];

function hamta(url) {
  return execFileSync("curl", ["-s", "--max-time", "20", url], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

const rapport = {};
for (const [namn, url] of SIDOR) {
  const html = hamta(url);
  const pushes = [...html.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g)].map((m) => m[1]);
  const flight = pushes.map((s) => JSON.parse(`"${s}"`)).join("");
  const analys = {
    htmlBytes: Buffer.byteLength(html),
    flightBytes: Buffer.byteLength(flight),
    pushes: pushes.length,
    fynd: {},
  };
  // kända läckmönster + familjeräknare
  const monster = {
    notFoundKurser: /"kurser":\[\{"slug"/g,
    slugObjekt: /\{"slug":"/g,
    bloggTitlar: /"titel":"/g,
    title: /"title":"/g,
    description: /"description":"/g,
    losningar: /"losning"/g,
    kapitel: /"kapitel"/g,
    monsterRef: /"m":"/g,
    kortStart: /\$L\d+/g,
  };
  for (const [k, re] of Object.entries(monster)) {
    const n = (flight.match(re) ?? []).length;
    if (n) analys.fynd[k] = n;
  }
  // största enskilda strängar i flighten (grovsplitting på ),( )
  const delar = flight.split('","').join(",").slice(0, 2_000_000);
  // hitta de 8 längsta "ord" (>200 tecken) som innehåller struktur
  const langa = (flight.match(/[\{"][^"]{300,}/g) ?? []).sort((a, b) => b.length - a.length).slice(0, 5)
    .map((s) => ({ langd: s.length, snutt: s.slice(0, 120) }));
  analys.langstaStrangar = langa;
  // dokumentets riktiga text-andel: de 110 kortens beskrivningar — räkna "Read the"
  analys.readThe = (flight.match(/Read the /g) ?? []).length;
  rapport[namn] = analys;
  console.log(`\n=== ${namn} · HTML ${analys.htmlBytes} B · flight ${analys.flightBytes} B (${analys.pushes} pushes) ===`);
  console.log("fynd:", JSON.stringify(analys.fynd));
  console.log("Read the-fraser (extra CTA-rad per kort i flight):", analys.readThe);
  for (const l of langa) console.log(`  lång sträng ${l.langd}B: ${l.snutt}`);
}

writeFileSync(`${KAT}/o118-flight-sond.json`, JSON.stringify(rapport, null, 1));
console.log(`\nSkriven: ${KAT}/o118-flight-sond.json`);
