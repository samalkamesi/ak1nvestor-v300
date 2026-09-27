import { readFileSync } from "node:fs";
const t = readFileSync("public/llms.txt", "utf8");
const i = t.indexOf("fasta universumet");
console.log("kontext:", JSON.stringify(t.slice(Math.max(0, i - 15), i + 70)));
let j = -1; const hits = [];
while ((j = t.indexOf("309", j + 1)) !== -1) hits.push(JSON.stringify(t.slice(j - 25, j + 12)));
console.log("alla 309-förekomster (" + hits.length + "):");
hits.forEach((h) => console.log(" ", h));
