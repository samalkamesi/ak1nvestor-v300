#!/usr/bin/env node
// _s8u2o135-grav-fonster.mjs — spår 8 s8-u2 (o135): fönstergrävning i prod-synk.log
// kring klass A:s byggmisslyckanden: vad hände FÖRE/EFTER (OOM? revert? DEPLOYAD? läke?).
import fs from "node:fs";

const synkLogg = fs.readFileSync("/home/ak1a/AK1/data/vakten/prod-synk.log", "utf8").split("\n");

const fonster = [
  { namn: "09-18 17:32 mål-återarmning FEL 502", fran: "2026-09-18T17:20", till: "2026-09-18T18:10" },
  { namn: "09-19 06:58-07:05 byggmisslyckanden + manifest-offer", fran: "2026-09-19T06:50", till: "2026-09-19T08:30" },
  { namn: "09-20 02:18-02:32 byggmisslyckanden", fran: "2026-09-20T02:10", till: "2026-09-20T04:00" },
];

for (const f of fonster) {
  console.log(`\n================ FÖNSTER: ${f.namn} (${f.fran} .. ${f.till}) ================`);
  for (const rad of synkLogg) {
    if (rad.length < 20) continue;
    const ts = rad.slice(0, 20);
    if (ts >= f.fran && ts <= f.till) {
      // Prioritera nyckelrader; tysta repetitiva VÄNTAR-RAM om inte första/sista i fönstret
      console.log(rad.slice(0, 260));
    }
  }
}
