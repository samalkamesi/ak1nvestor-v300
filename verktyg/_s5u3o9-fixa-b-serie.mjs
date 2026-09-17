import { readFileSync, writeFileSync } from "node:fs";
const p = "data/kurser-tillagg/rp-01-riskmattens-karta.json";
let t = readFileSync(p, "utf8");
const byt = [
  // B-seriens nya tal: −14, +6, +18, +22 (medel 8,0; std √196 = 14,0 exakt)
  ["aktie B (−12, +2, +18, +20) har IDENTISK medelavkastning 8,0 procent men volatilitet 3,16 mot 13,04 procent — B pendlar 4,1 gånger bredare",
   "aktie B (−14, +6, +18, +22) har IDENTISK medelavkastning 8,0 procent men volatilitet 3,16 mot 14,0 procent — B pendlar 4,4 gånger bredare"],
  ["aktie B (−12, +2, +18, +20) har båda medelavkastningen 8,0 procent men A:s volatilitet är √10 = 3,16 procent mot B:s √170 = 13,04 procent — samma medel, 4,1 gånger olika pendling",
   "aktie B (−14, +6, +18, +22) har båda medelavkastningen 8,0 procent men A:s volatilitet är √10 = 3,16 procent mot B:s √196 = 14,0 procent — samma medel, 4,4 gånger olika pendling"],
  ["och B ger (8 − 2)/13,04 = 0,46 — identisk överavkastning, fyra gånger olika avkastning per enhet risk",
   "och B ger (8 − 2)/14,0 = 0,43 — identisk överavkastning, fyra gånger olika avkastning per enhet risk"],
  ["Aktie B: −12, +2, +18 och +20 procent", "Aktie B: −14, +6, +18 och +22 procent"],
  ["och B ger (−12 + 2 + 18 + 20)/4 = 28/4 = 8,0 procent om året", "och B ger (−14 + 6 + 18 + 22)/4 = 32/4 = 8,0 procent om året"],
  ["A:s värsta år var +4, B:s värsta år var −12", "A:s värsta år var +4, B:s värsta år var −14"],
  ["avvikelserna är −20, −6, +10 och +12; kvadraterna 400, 36, 100 och 144; summan 680; delat med 4 ger 170; roten ur 170 är 13,04 procent",
   "avvikelserna är −22, −2, +10 och +14; kvadraterna 484, 4, 100 och 196; summan 784; delat med 4 ger 196; roten ur 196 är 14,0 procent"],
  ["A pendlar typiskt omkring tre procentenheter från sitt medel, B mer än tretton",
   "A pendlar typiskt omkring tre procentenheter från sitt medel, B fjorton"],
  ["Förhållandet: 13,04/3,16 = 4,1 — B pendlar drygt fyra gånger bredare med SAMMA genomsnittliga avkastning",
   "Förhållandet: 14,0/3,16 = 4,4 — B pendlar drygt fyra gånger bredare med SAMMA genomsnittliga avkastning"],
  ["| År 1 | +4 | −12 |", "| År 1 | +4 | −14 |"],
  ["| År 2 | +6 | +2 |", "| År 2 | +6 | +6 |"],
  ["| År 3 | +10 | +18 |", "| År 3 | +10 | +18 |"],
  ["| År 4 | +12 | +20 |", "| År 4 | +12 | +22 |"],
  ["| Avvikelser från medel | −4, −2, +2, +4 | −20, −6, +10, +12 |", "| Avvikelser från medel | −4, −2, +2, +4 | −22, −2, +10, +14 |"],
  ["| Kvadratsumman | 40 | 680 |", "| Kvadratsumman | 40 | 784 |"],
  ["| Standardavvikelse | √10 = 3,16 | √170 = 13,04 |", "| Standardavvikelse | √10 = 3,16 | √196 = 14,0 |"],
  ["| Pendlingskvot B/A | — | 4,1× |", "| Pendlingskvot B/A | — | 4,4× |"],
  ["B:s siffra 13,04 är inte 'sämre' i meningEN mer förlust", "B:s siffra 14,0 är inte 'sämre' i meningen mer förlust"],
  ["B har (8 − 2)/13,04 = 6/13,04 = 0,46", "B har (8 − 2)/14,0 = 6/14,0 = 0,43"],
  ["men A levererar den med en fjärdedel så mycket pendling", "men A levererar den med knappt en fjärdedel av pendlingen"],
  ["| Sharpe-kvot | Hur mycket avkastning per enhet pendling? | 6/3,16 = 1,90 mot 6/13,04 = 0,46 |", "| Sharpe-kvot | Hur mycket avkastning per enhet pendling? | 6/3,16 = 1,90 mot 6/14,0 = 0,43 |"]
];
let n = 0; const sak = [];
for (const [a, b] of byt) {
  if (!t.includes(a)) { sak.push(a.slice(0, 70)); continue; }
  t = t.split(a).join(b); n++;
}
writeFileSync(p, t);
console.log("Rättade " + n + " av " + byt.length);
if (sak.length) console.log("SAKNADE:\n  " + sak.join("\n  "));
console.log("13,04 kvar:", (t.match(/13,04/g) || []).length, "| −12 kvar:", (t.match(/−12 /g) || []).length);
JSON.parse(t); console.log("JSON giltigt");
