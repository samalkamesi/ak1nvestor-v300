#!/usr/bin/env node
/** _r197-v173u3-tmussond.mjs — inspektera befintliga TMUS-raden (node-kanal). */
import { readFileSync } from "node:fs";
const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const t = u.find((b) => b.ticker === "TMUS");
console.log(JSON.stringify({
  ticker: t.ticker, namn: t.namn, bransch: t.bransch, land: t.land, valuta: t.valuta,
  hamtat: t.hamtat, kallor: t.kallor?.map((k) => k.namn + " " + k.hamtat + " " + (k.url ?? "").slice(0, 60)),
  pe: t.vardering?.pe, pb: t.vardering?.pb, prognos: t.tillvaxt?.prognosTillvaxt,
  notering: (t.notering ?? "").slice(0, 220),
}, null, 1));
console.log("total:", u.length, "| kommunikation:", u.filter((b) => b.bransch === "kommunikation").length);
