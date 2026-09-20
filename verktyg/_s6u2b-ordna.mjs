/**
 * ORDNINGSHARMONISERING v2 (s6-u2 försök 2, 2026-09-20) — idempotent.
 *
 * Marknadsrytm-lagrets SIST-deklaration (deras widget-kommentar + testfall
 * L01 kräver SISTA ledet) betyder att multipel-komponenten ska ligga FÖRE
 * dem i KOMPONENTER-listorna — inte sist. Radbaserad flytt av det
 * skriptgenererade multipel-blocket (2 kommentarrader + komponentrad) till
 * före "svaraLokaltMarknadsrytm"-raden, med rättad kommentar och korrekt
 * ];-flytt när multipelraden bar listans slut. Idempotent: rätt läge ⇒ 0.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const VERKTYG = "/home/ak1a/AK1/verktyg";
const filer = readdirSync(VERKTYG).filter((f) => /^testa-ai-mentor-.*\.mjs$/.test(f) && f !== "testa-ai-mentor-kedja.mjs");
let andrade = 0;
const rapport = [];

for (const fil of filer) {
  const sokVag = join(VERKTYG, fil);
  const src0 = readFileSync(sokVag, "utf8");
  if (!src0.includes('"svaraLokaltMultipel"')) continue;
  const rader = src0.split("\n");

  const iMul = rader.findIndex((r) => r.includes('"svaraLokaltMultipel"'));
  const iMar = rader.findIndex((r) => r.includes('"svaraLokaltMarknadsrytm"'));
  if (iMul === -1 || iMar === -1) { rapport.push(fil + ": VARNING — saknar någon av raderna"); continue; }
  if (iMul < iMar) continue; // redan rätt läge (multipel före marknadsrytm)

  // Block = kommentarraderna ovanför + multipelraden (harmoniseringens 2 rader)
  let bStart = iMul;
  if (bStart - 1 >= 0 && rader[bStart - 1].includes("62:a motorn, efter marknadsrytm")) bStart--;
  if (bStart - 1 >= 0 && rader[bStart - 1].includes("Omgång 25-tillägg")) bStart--;
  const block = rader.slice(bStart, iMul + 1);

  const stangdePaMul = rader[iMul].includes("];");
  if (stangdePaMul) rader[iMul] = rader[iMul].replace("];", "");

  rader.splice(bStart, block.length);
  const jMar = rader.findIndex((r) => r.includes('"svaraLokaltMarknadsrytm"'));
  const rattat = block.map((r) =>
    r.replace("62:a motorn, efter marknadsrytm (v04 P/S + v05 P/B).", "61:a motorn, FÖRE marknadsrytm (deras SIST-deklaration; v04 P/S + v05 P/B).")
  );
  if (stangdePaMul) {
    // marknadsrytm blir ny sista rad i listan — den bär ]; nu
    rader[jMar] = rader[jMar].replace(/",?\s*$/, '",];').replace(/",\];$/, '",];');
  }
  rader.splice(jMar, 0, ...rattat);

  const src = rader.join("\n");
  if (src !== src0) { writeFileSync(sokVag, src); andrade++; rapport.push(fil + ": flyttat FÖRE marknadsrytm" + (stangdePaMul ? " (];-flytt)" : "")); }
}

console.log("ordnade filer:", andrade);
for (const r of rapport) console.log("  " + r);
