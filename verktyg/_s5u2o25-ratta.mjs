#!/usr/bin/env node
/**
 * s5-u2 omgång 25 — TEXTRÄTTNINGAR bk-08-intaktredovisningen (före KVD):
 *   R1 «Avtaret» → «Avtalet» (kap 1-titel, chapters + chapters_list)
 *   R2 «tolv återkommande månadslöften … 24 månader» → tjugufyra (kap 2,
 *      konsistens med kap 5:s «6 av 24 månader» och utmaningens 24-månadersserie)
 *   R3 690-derivation i kap 6 (540 + 100 + 50) — knyter samman summary:ns
 *      «670,5 mot 690 fakturerade» med kapitlen; avtalsskulden 19,5 blir härledd
 *   R4 «TVO POSTER» → «TVÅ POSTER» (kap 6 definition)
 *   R5 «den tolfte per månad» → «en tolftedel per månad» (history.modern)
 *
 * Idempotent: varje ersättning söks exakt; redan rättad fil → 0 ändringar.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "/home/ak1a/AK1/data/kurser-tillagg/bk-08-intaktredovisningen.json";
const j = JSON.parse(readFileSync(FIL, "utf8"));

const byt = (str, fran, till, etikett) => {
  const n = str.split(fran).length - 1;
  if (n === 0) throw new Error("RÄTTNINGSFEL: hittar inte: " + etikett);
  return str.split(fran).join(till);
};

let antal = 0;

// R1 — kapiteltitel i båda listorna
for (const lista of [j.chapters, j.chapters_list]) {
  lista[0].title = byt(lista[0].title, "Avtaret — intäktens födelseplats", "Avtalet — intäktens födelseplats", "R1 " + lista[0].title);
  antal++;
}

// R2 — seriens längd konsistent med 24 månader
j.chapters[1].blocks[0].content = byt(
  j.chapters[1].blocks[0].content,
  "Supporten är en serie: tolv återkommande månadslöften som är identifierbart samma tjänst, vilka enligt serieregeln räknas som EN prestationsplikt som löper över 24 månader.",
  "Supporten är en serie: tjugufyra återkommande månadslöften under två år, identifierbart samma tjänst med samma rytm, vilka enligt serieregeln räknas som EN prestationsplikt som löper över 24 månader.",
  "R2 seriens längd",
);
antal++;

// R3 — 690-derivation före spegelfallet (kap 6 textblock)
j.chapters[5].blocks[0].content = byt(
  j.chapters[5].blocks[0].content,
  "Avtalstillgången är spegeln: presterat arbete som ännu inte fått sin faktura, en fordran på intäkt som redan är förtjänad. I spegelfallet hade fakturan i stället varit 640 kronor",
  "Avtalstillgången är spegeln: presterat arbete som ännu inte fått sin faktura, en fordran på intäkt som redan är förtjänad. Exempelårets fakturor summerar 690 kronor — licensen 540 vid leveransen, en implementeringsmilesten 100 och supportabonnemanget 50 i förskott — och 690 minus 670,5 lika med 19,5 blir avtalsskulden: betald men opresterad del av backlogen. I spegelfallet hade fakturan i stället varit 640 kronor",
  "R3 690-derivation",
);
antal++;

// R4 — å:et i definitionen
j.chapters[5].blocks[1].content = byt(j.chapters[5].blocks[1].content, "TVO POSTER, EN FRÅGA", "TVÅ POSTER, EN FRÅGA", "R4 TVÅ");
antal++;

// R5 — korrekt svenska i history
j.history.modern = byt(j.history.modern, "men får röra den tolfte per månad", "men får röra en tolftedel per månad", "R5 tolftedel");
antal++;

writeFileSync(FIL, JSON.stringify(j, null, 2) + "\n", "utf8");
console.log("RÄTTAD: " + antal + " ingrepp i bk-08-intaktredovisningen — filen om-skriptad (JSON.stringify null 2 + newline)");
