/**
 * Testunderhåll omgång 13 (s6-u2): syskontestfilernas widget-synk-vakter
 * får de två nya kedjekomponenterna (syskon u1:s svaraLokaltPortfoljbalans
 * + detta lagers svaraLokaltStabilitetsdjup) — 23bfd63f-precedensen.
 * Kör: node verktyg/_s6u2-testunderhall-omg13.mjs
 */
import fs from "node:fs";

const NYA = ["svaraLokaltPortfoljbalans", "svaraLokaltStabilitetsdjup"];

// fil → mekanism: "komponenter" (appenda i KOMPONENTER/kedjekomponenter),
// "pagarnde" (appenda i PAGAENDE_KANDA)
const FILER = {
  "verktyg/testa-ai-mentor-agande.mjs": "komponenter",
  "verktyg/testa-ai-mentor-beteendedjup.mjs": "pagarnde",
  "verktyg/testa-ai-mentor-case.mjs": "komponenter",
  "verktyg/testa-ai-mentor-djup.mjs": "komponenter",
  "verktyg/testa-ai-mentor-forvantningsdjup.mjs": "komponenter",
  "verktyg/testa-ai-mentor-historia.mjs": "komponenter",
  "verktyg/testa-ai-mentor-lonsamhetsdjup.mjs": "komponenter",
  "verktyg/testa-ai-mentor-portfoljgrund.mjs": "komponenter",
  "verktyg/testa-ai-mentor-redovisningsdjup.mjs": "komponenter",
  "verktyg/testa-ai-mentor-riskdjup.mjs": "komponenter",
  "verktyg/testa-ai-mentor-riskmattsdjup.mjs": "komponenter",
  "verktyg/testa-ai-mentor-skattedjup.mjs": "pagarnde",
  "verktyg/testa-ai-mentor-utdelningsdjup.mjs": "komponenter",
  "verktyg/testa-ai-mentor-portfoljbalans.mjs": "komponenter",
};

for (const [fil, mekanism] of Object.entries(FILER)) {
  let t = fs.readFileSync(fil, "utf8");
  const fore = t;

  if (mekanism === "komponenter") {
    // case-filen använder fulla former "svaraLokaltX(q, KURSREGISTER)"
    const fulla = t.includes('"svaraLokaltCase(q, KURSREGISTER)"');
    const namn = (n) => (fulla ? n + "(q, KURSREGISTER)" : n);
    const arrNamn = t.includes("const KOMPONENTER") ? "const KOMPONENTER" : "const kedjekomponenter";
    const start = t.indexOf(arrNamn);
    const slut = t.indexOf("];", start);
    if (start === -1 || slut === -1) throw new Error(fil + ": array ej hittad");
    const block = t.slice(start, slut);
    const saknade = NYA.filter((n) => !block.includes('"' + namn(n) + '"'));
    if (saknade.length) {
      // indrag från senaste postrad i blocket
      const rader = block.split("\n");
      let indrag = "    ";
      for (let i = rader.length - 1; i >= 0; i--) {
        if (rader[i].trim().startsWith('"')) { indrag = rader[i].match(/^\s*/)[0]; break; }
      }
      const tillagg = saknade.map((n) => `${indrag}"${namn(n)}",`).join("\n");
      // );-radens eget indrag bevaras ur blockets svans
      const fore = t.slice(0, slut);
      const efter = t.slice(slut);
      const slutIndrag = (fore.match(/[ \t]*$/) || [""])[0];
      t = fore.replace(/[ \t]*$/, "") + "\n" + tillagg + "\n" + slutIndrag + efter;
    }
  } else {
    const mark = "const PAGAENDE_KANDA = [";
    const start = t.indexOf(mark);
    const slut = t.indexOf("];", start);
    if (start === -1 || slut === -1) throw new Error(fil + ": PAGAENDE_KANDA ej hittad");
    const block = t.slice(start + mark.length, slut);
    const saknade = NYA.filter((n) => !block.includes('"' + n + '"'));
    if (saknade.length) {
      const nyInre = block.replace(/\s*$/, "").replace(/,\s*$/, "") + ", " + saknade.map((n) => '"' + n + '"').join(", ");
      t = t.slice(0, start) + mark + nyInre + "];" + t.slice(slut + 2);
    }
  }

  // Antals-strängar: aktuellt antal är 23 (21 lager + syskonets 1 + detta
  // lagers 1; portfoljbalans-filen skrev 22 samtidigt som den redan bar
  // stabilitetsdjup i KOMPONENTER).
  t = t.replaceAll("bär alla 21 lager", "bär alla 23 lager");
  t = t.replaceAll("bär alla 22 lager", "bär alla 23 lager");
  t = t.replaceAll("bär 21 lager i ordning", "bär 23 lager i ordning");
  t = t.replaceAll("21 lager i ordning (", "23 lager i ordning (");
  t = t.replaceAll("förväntningsdjup SIST)", "förväntningsdjup + portfoljbalans + stabilitetsdjup SIST)");

  if (t !== fore) {
    fs.writeFileSync(fil, t);
    console.log("PATCHAT " + fil);
  } else {
    console.log("OFÖRÄNDRAT " + fil);
  }
}
console.log("KLAR");
