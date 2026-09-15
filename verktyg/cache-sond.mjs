#!/usr/bin/env node
// cache-sond.mjs — s7-u3 (spår 7, 2026-09-15): Cache-Control-kartering av
// publika rutter. Skrivet för årslås-jakten (o10 §2-protokollet, o13).
//
// Användning:
//   node verktyg/cache-sond.mjs <bas> <utfil>            — hel körning
//   node verktyg/cache-sond.mjs <bas> <utfil> <v1,v2,…>  — omkörning av vägar
//
// Lärdom från våg 7:rond 2: 6 parallella HEAD räcker för prodens
// rate-limit (429) — HELA körningen är sekventiell med 900 ms mellanrum
// och 3 omförsök vid 429 (backoff 4/8 s). Rådata skrivs som JSON med
// grupperad sammanfattning på stdout.
import fs from "node:fs";

const [bas, utfil, vagArg] = process.argv.slice(2);
if (!bas || !utfil) {
  console.error("användning: node cache-sond.mjs <bas> <utfil> [vagar,komma,separerade]");
  process.exit(2);
}

const ALLA_VAGAR = [
  "/", "/analyser", "/ansvar", "/bibliotek", "/blogg",
  "/blogg/5-vanliga-nyborjarmisstag-svenska-aktier", "/bolag/nda-se-st",
  "/certifikat", "/cookiepolicy", "/dagens-pass", "/dataset",
  "/dataset/finans", "/fas2-ansok", "/fas3", "/finansiell-policy",
  "/forskningsbiblioteket", "/kalkylator", "/kallor", "/konfluens",
  "/kurser", "/kurser/100-baggers", "/labb", "/laroplan", "/logga-in",
  "/manifest", "/medlemskap", "/min-portfolj", "/min-sida", "/netnet",
  "/nyheter", "/om-oss", "/portfolj-forskning", "/portfolj-grund",
  "/portfolj-hyra", "/portfolj-plus", "/portfoljbyggare", "/prenumeration",
  "/privacy-policy", "/pro", "/profil", "/rapporter", "/studio",
  "/superanalys", "/topplista", "/transparens", "/upphovsratt",
  "/vagfundament", "/villkor",
  "/en", "/en/blogg", "/en/kurser", "/en/dataset",
  "/ar", "/ar/blogg", "/ar/kurser",
];
const vagar = vagArg ? vagArg.split(",").map(v => v.trim()).filter(Boolean) : ALLA_VAGAR;
const sov = ms => new Promise(r => setTimeout(r, ms));

async function mata(vag, forsok = 1) {
  const url = new URL(vag, bas).href;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(12000), redirect: "manual" });
    if (res.status === 429 && forsok < 3) { await sov(4000 * forsok); return mata(vag, forsok + 1); }
    return { vag, status: res.status, cacheControl: res.headers.get("cache-control") ?? null };
  } catch (e) {
    if (forsok < 3) { await sov(4000 * forsok); return mata(vag, forsok + 1); }
    return { vag, status: 0, fel: String(e?.cause?.code ?? e?.message ?? e) };
  }
}

const rader = [];
if (!vagArg) {
  for (const v of vagar) { rader.push(await mata(v)); await sov(900); }
} else {
  for (const v of vagar) { rader.push(await mata(v)); await sov(900); }
}

const arslas = rader.filter(r => (r.cacheControl ?? "").includes("s-maxage=31536000"));
const gamla = fs.existsSync(utfil) && vagArg ? JSON.parse(fs.readFileSync(utfil, "utf8")) : null;
const ut = {
  bas, matt: new Date().toISOString(),
  kombineradMed: gamla?.matt ?? null,
  antalVagar: vagar.length + (gamla?.rader?.length ?? 0),
  arslasSamman: [...new Set([...(gamla?.arslasSamman ?? []), ...arslas.map(r => r.vag)])],
  rader: [...(gamla?.rader ?? []), ...rader],
};
fs.writeFileSync(utfil, JSON.stringify(ut, null, 2) + "\n");
console.log(`${vagar.length} vägar mot ${bas} → ${utfil}`);
console.log(`årslås denna körning: ${arslas.length}${gamla ? " (kombinerat: " + ut.arslasSamman.length + ")" : ""}`);
for (const r of arslas) console.log(`  ÅRSLÅS ${r.vag}`);
for (const r of rader) if (r.status !== 200) console.log(`  ${r.status} ${r.vag} ${r.fel ?? ""}`);
