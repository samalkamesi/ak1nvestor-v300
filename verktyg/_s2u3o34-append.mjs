#!/usr/bin/env node
/**
 * s2-u3 omg34 append — idempotent + mutex + läs-tillbaka ×2 (OMG32/33-mönstret).
 * Låser mot syskonens parallella appendar; hittar redan appendade tickers =
 * ingen ny skrivning (idempotens); verifierar efter skrivning att GAMLA rader
 * är värde-identiska (0 kollateralskada).
 */
import { readFileSync, writeFileSync, openSync, closeSync, unlinkSync } from "node:fs";
import { RADER } from "./_s2u3o34-rader.mjs";

const FIL = "data/portfolj-system/bolagsunivers.json";
const LÅS = "/tmp/s2u3o34-append.lock";

// mutex (wx-lås: existerar = vänta)
let fd;
for (let i = 0; i < 60; i++) {
  try { fd = openSync(LÅS, "wx"); break; } catch { 
    if (i === 0) console.log("lås upptaget — väntar ut syskonets appendfönster…");
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }
}
if (fd === undefined) { console.log("ABORT: låset friades ej på 60 s"); process.exit(1); }
try {
  const före = JSON.parse(readFileSync(FIL, "utf8"));
  console.log("disk före: " + före.length + " rader");

  // idempotens
  const nya = RADER.filter((r) => !före.some((x) => x.ticker === r.ticker));
  const redan = RADER.length - nya.length;
  if (nya.length === 0) {
    console.log("IDEMPOTENT: samtliga " + RADER.length + " tickers redan på disk — ingen skrivning");
  } else {
    // syskon-före-skrivning: deras rader som inte är mina
    const syskonFöre = före.map((r) => JSON.stringify(r));
    const efter = [...före, ...nya];
    writeFileSync(FIL, JSON.stringify(efter, null, 1) + "\n");
    console.log("skrev " + nya.length + " rader (" + nya.map((r) => r.ticker).join(", ") + ")" + (redan ? " · " + redan + " redan på disk" : ""));

    // läs-tillbaka ×2
    for (let v = 1; v <= 2; v++) {
      const tb = JSON.parse(readFileSync(FIL, "utf8"));
      const saknas = nya.filter((r) => !tb.some((x) => x.ticker === r.ticker && JSON.stringify(x) === JSON.stringify(r)));
      if (saknas.length) { console.log("ABORT: läs-tillbaka " + v + " saknar/avviker: " + saknas.map((r) => r.ticker)); process.exit(1); }
      console.log("läs-tillbaka " + v + ": " + tb.length + " rader, mina " + nya.length + " värde-identiska ✓");
    }
    // kollateral: gamla rader orörda
    const slut = JSON.parse(readFileSync(FIL, "utf8"));
    const gamla = slut.slice(0, före.length);
    const förändrade = gamla.filter((r, i) => JSON.stringify(r) !== syskonFöre[i]).length;
    console.log("kollateralkontroll: " + förändrade + " gamla rader förändrade (skall vara 0)");
    if (förändrade > 0) process.exit(1);
    console.log("SLUTLÄGE: " + slut.length + " rader");
  }
} finally {
  closeSync(fd);
  try { unlinkSync(LÅS); } catch {}
}
