#!/usr/bin/env node
/**
 * SOND — s5-u1 (manifest auto-s5-1789837501089, omgång 20): nästa fria kursplats.
 * Söker kandidat-ämnen mot HELA registret (446 kurser): vilka ämnen har 0 ägare?
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const reg = JSON.parse(readFileSync(ROT + "/public/deep-courses.json", "utf8"));
const slugs = Object.keys(reg);

// Samla all text per kurs (slug → text) för ägarskapssökning
const textPerKurs = {};
for (const [slug, k] of Object.entries(reg)) {
  const texter = [];
  (function samla(o) { if (typeof o === "string") texter.push(o); else if (Array.isArray(o)) o.forEach(samla); else if (o && typeof o === "object") Object.values(o).forEach(samla); })(k);
  textPerKurs[slug] = texter.join("\n").toLowerCase();
}

const sond = (ämne, termer) => {
  const ägare = slugs.filter((s) => termer.some((t) => textPerKurs[s].includes(t)));
  const iFamilj = ägare.filter((s) => /^(ln|ib|ma|se|bk|od|am|kt|vr|st|pe|ek|sj|tx|rp)-/.test(s));
  console.log(`${ägare.length === 0 ? "FRI " : "uppt"} ${ämne.padEnd(42)} ägare ${String(ägare.length).padStart(3)} (varav familj ${iFamilj.length})${ägare.length ? " → " + ägare.slice(0, 8).join(", ") + (ägare.length > 8 ? " …" : "") : ""}`);
  return ägare;
};

console.log("─ KANDIDATER (fri yta = 0 ägare i målserien, lågt utanför):");
sond("ln-06 kapitalomsättningshastighet", ["kapitalomsättningshastighet", "omsättningshastighet på kapital", "asset turnover"]);
sond("ln-06 kapitalbindning-djup", ["kapitalbindning"]);
sond("ib-05 substansräkningen rad för rad", ["substansräkning", "att räkna substansvärde", "nav-modell", "bygga nav"]);
sond("ib-05 rabattens mekanik", ["rabatt mot substansvärde", "nav-rabatt", "rabatt till substans"]);
sond("ma-08 kreditcykeln makro", ["kreditcykeln", "utlåningsstandard", "kredittillväxt", "private debt/gdp", "skuldsättning i ekonomin"]);
sond("ma-08 bostadsmarknadens mekanik", ["bostadsmarknadens mekanik", "bostadspriser och ränta", "bolånequivalent"]);
sond("se-19 försäkringsbranschen", ["försäkringsbransch", "försäkringsbolag", "livförsäkring", "skadeåtgång", "combined ratio", "försäkringsteknisk"]);
sond("se-19 stål och metallverk", ["stålindustr", "stålverk", "stålmarknad", "järnmalmspris"]);
sond("se-19 bygg och entreprenad", ["byggbransch", "entreprenadbranschen", "bygg- och anläggnings"]);
sond("bk-07 lagret och lagervärderingen", ["lagervärdering", "lagret och lagervärde", "nrv", "nedskrivning av lager", "lagerbedömning"]);
sond("od-08 ränteswap och ränteskydd", ["ränteswap", "räntederivat", "ränteskydd"]);
sond("am-08 belåning och marginal", ["marginalhandel", "belåning av aktier", "aktielån egen", "hävstång på kontot"]);
sond("vr-08 likvidations- och konkursvärde", ["likvidationsvärde", "konkursvärde", "rekonstruktionsvärde"]);
sond("kt-06 utfallsanalys", ["utfallsanalys"]);
sond("rp-05 korrelationsbudgeten", ["korrelationsbudget"]);
sond("ek-07 faktormodellen i motorn", ["faktormodell i motorn", "faktorbygge"]);
