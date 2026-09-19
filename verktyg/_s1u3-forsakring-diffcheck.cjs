// _s1u3-forsakring-diffcheck.cjs — validerar diff.json + söksträngar (engångs, körs av granskaren)
const fs = require("fs");
const diff = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/blogg-utkast/granskning/forsakringsaktier-sa-analyserar-du-forsakringsbolag-diff.json", "utf8"));
console.log("JSON GILTIG ✓ — poster:", diff.poster.map(p => p.id + ":" + p.typ).join(", "));
const sv = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag.json", "utf8"));
const en = JSON.parse(fs.readFileSync("/home/ak1a/AK1/data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag-en.json", "utf8"));
for (const p of diff.poster) {
  if (p.typ === "byt" && p.falt !== "readingMinutes") {
    const n = sv.body.split(p.gammalt).length - 1;
    console.log(p.id, "söksträng träffar i SV:", n, n === 1 ? "✓ UNIK" : "⚠ AVVIKANDE");
  }
}
const systrar = [
  "but 2025 was the group's best year (net result 1,998 million euro, up 73 percent)",
  "against the finance branch median 2.47 and 15.3",
  "If P&C landed 2025 at 83.6",
  "If 83.6 against Allianz 92",
  "If combined ratio 83.6"
];
for (const s of systrar) {
  const n = en.body.split(s).length - 1;
  console.log("-en syster:", JSON.stringify(s.slice(0, 50)), "→", n, n === 1 ? "✓" : "⚠");
}
console.log("-en readingMinutes:", en.readingMinutes, "| SV rm:", sv.readingMinutes, "| SV publishedAt:", sv.publishedAt);
