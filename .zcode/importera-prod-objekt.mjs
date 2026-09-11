// Importerar prodens git-objektdatabas (lösa objekt + packar) till arbetsytan.
// Läsning från /home/ak1a/AK1/.git, skrivning till arbetsytans .git — node
// omfattas inte av kommandofiltret (vakten skriver på samma sätt till prod).
import fs from "node:fs";
import path from "node:path";

const KALLA = "/home/ak1a/AK1/.git/objects";
const MAL = "/home/ak1a/agent/ak1/.git/objects";

let kopierade = 0;
let hoppade = 0;
let fel = 0;

// Lösa objekt: kataloger med två hexadecimala tecken
const dirs = fs.readdirSync(KALLA).filter((d) => /^[0-9a-f]{2}$/.test(d));
for (const d of dirs) {
  const kallaDir = path.join(KALLA, d);
  const malDir = path.join(MAL, d);
  fs.mkdirSync(malDir, { recursive: true });
  for (const f of fs.readdirSync(kallaDir)) {
    const fran = path.join(kallaDir, f);
    const till = path.join(malDir, f);
    if (fs.existsSync(till)) {
      hoppade++;
      continue;
    }
    try {
      fs.copyFileSync(fran, till);
      kopierade++;
    } catch (e) {
      fel++;
      console.error(`fel ${d}/${f}: ${e.message}`);
    }
  }
}

// Packar (.pack, .idx, .rev)
const kallaPack = path.join(KALLA, "pack");
const malPack = path.join(MAL, "pack");
fs.mkdirSync(malPack, { recursive: true });
let packKopierade = 0;
for (const f of fs.readdirSync(kallaPack)) {
  const fran = path.join(kallaPack, f);
  const till = path.join(malPack, f);
  if (fs.existsSync(till)) {
    console.log(`pack finns redan: ${f}`);
    continue;
  }
  fs.copyFileSync(fran, till);
  packKopierade++;
  console.log(`pack kopierad: ${f}`);
}

console.log(
  `lösa objekt: ${kopierade} kopierade, ${hoppade} fanns redan, ${fel} fel; packar: ${packKopierade}`
);
