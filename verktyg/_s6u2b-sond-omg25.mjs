#!/usr/bin/env node
// SOND — s6-u2 försök 2 (redispatch), manifest auto-s6-1789864506792, omgång 25.
// Val: v04 P/S + v05 P/B (VÄRDERING-kategorins mentorväglösa grundmultiplar).
// Tre ronder, allt LIVE-läst från disk — disk-först-konventionen.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROT = "/home/ak1a/AK1";
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);

// Kedjans samtliga motorer ur widgetens faktiska komposition (fall G-källan).
const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
const fns = [...widget.matchAll(/svaraLokalt\w+\(/g)].map((m) => m[0].slice(0, -1));
const unikaFns = [...new Set(fns)];
const libFiler = readdirSync(join(ROT, "src/lib")).filter((f) => /^ai-mentor-.*-fragor\.ts$/.test(f));
const fnTillFil = {};
for (const f of libFiler) {
  const src = readFileSync(join(ROT, "src/lib", f), "utf8");
  for (const m of src.matchAll(/export function (svaraLokalt\w+)\(/g)) fnTillFil[m[1]] = f;
}
fnTillFil["svaraLokalt"] = "ai-mentor-svar.ts";
fnTillFil["svaraLokaltExtra"] = "ai-mentor-extra-fragor.ts";
const MOTORER = [];
for (const fn of unikaFns) {
  const fil = fnTillFil[fn];
  if (!fil) { console.log("VARNING: fn utan fil:", fn); continue; }
  const modul = await import(pathToFileURL(join(ROT, "src/lib", fil)).href);
  MOTORER.push({ fn, fil, fnk: modul[fn] });
}
console.log(`Kedjan: ${MOTORER.length} motorer live-lästa.`);

// ── ROND 1: kandidatfrågorna genom hela kedjan (förväntat NULL = mentorväglösa) ──
const KANDIDATER = {
  "PS": ["vad är ps-tal?", "vad är ps talet?", "vad är ps?", "hur räknar man pris per omsättning?",
         "vad betyder price to sales?", "vad är en omsättningsmultipel?", "vad är omsättningstalet för ett bolag?",
         "varför har lågmarginalbolag låg p/s?"],
  "PB": ["vad är pb-tal?", "vad är pb talet?", "vad är pb?", "hur räknar man pris per bokfört värde?",
         "vad betyder price to book?", "vad är p/b för en bank?", "vad är substansvärde?",
         "vad är bokfört värde?", "varför har apple så högt pb?"],
};
console.log("\n── ROND 1: kandidater genom kedjan (NULL = ledigt) ──");
for (const [amne, fragor] of Object.entries(KANDIDATER)) {
  for (const q of fragor) {
    const träffar = MOTORER.map((m) => ({ m, s: m.fnk(q, KURSREGISTER) })).filter((x) => x.s);
    if (träffar.length) {
      for (const t of träffar) console.log(`  TRÄFF ${amne} «${q}» → ${t.m.fn} (${t.m.fil}) [ämne: ${t.s.amne}]`);
    } else {
      console.log(`  NULL ${amne} «${q}»`);
    }
  }
}

// ── ROND 2: kärnordsdisjunktion (fall K-logik) mot samtliga lager + bas ──
const MINA = {
  "ps-tal": ["ps", "price to sales", "pris per omsättning", "pris/omsättning", "omsättningsmultipel", "omsättningstal"],
  "pb-tal": ["pb", "price to book", "pris per bokfört värde", "pris/bokfört värde", "pris per eget kapital"],
};
const dist = (a, b) => {
  const n = a.length, m = b.length; if (!n) return m; if (!m) return n;
  let f = Array.from({ length: m + 1 }, (_, j) => j), nu = new Array(m + 1);
  for (let i = 1; i <= n; i++) { nu[0] = i; for (let j = 1; j <= m; j++) nu[j] = Math.min(nu[j - 1] + 1, f[j] + 1, f[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); f = [...nu]; }
  return f[m];
};
console.log("\n── ROND 2: kärnordsdisjunktion (mina kärnord vs samtliga) ──");
const minaFlat = Object.values(MINA).flat().map((k) => k.toLowerCase());
let kollisioner = 0;
const allaFiler = libFiler.concat(["ai-mentor-svar.ts"]);
for (const f of allaFiler) {
  const txt = readFileSync(join(ROT, "src/lib", f), "utf8");
  for (const m of txt.matchAll(/karnord:\s*\[([\s\S]*?)\]/g)) {
    for (const o of [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1].toLowerCase())) {
      for (const mk of minaFlat) {
        if (o.includes(" ") || mk.includes(" ")) {
          if (o === mk) { kollisioner++; console.log(`  KOLLISION ${f}:"${o}" == min:"${mk}"`); }
          continue;
        }
        const kort = Math.min(o.length, mk.length) <= 3;
        if (kort ? o === mk : dist(o, mk) <= (Math.min(o.length, mk.length) <= 7 ? 1 : 2) && Math.abs(o.length - mk.length) <= 2) {
          kollisioner++; console.log(`  NÄRA ${f}:"${o}" ≈ min:"${mk}" (tav ${dist(o, mk)})`);
        }
      }
    }
  }
}
console.log(kollisioner === 0 ? "  0 kollisioner — kärnorden RENTA." : `  ${kollisioner} kollisioner — STRIK/OMDESIGN krävs.`);

// ── ROND 3: "p s"/"p b"-farlighet (varför rå «p/s»/«p/b» ej får vara kärnord) ──
console.log("\n── ROND 3: substring-faranalys «p s»/«p b» mot kanoniska frågor ──");
const kedjeSrc = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
const kanBlock = kedjeSrc.slice(kedjeSrc.indexOf("const KANONISKA = ["), kedjeSrc.indexOf("];", kedjeSrc.indexOf("const KANONISKA = [")));
const KANONISKA = [...kanBlock.matchAll(/\{ fraga: "([^"]+)"/g)].map((m) => m[1]);
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim()
  .normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
const farliga = KANONISKA.filter((q) => {
  const n = norm(q);
  return /\bp s\b/.test(n) || /p s( |$)/.test(n) && /^p s/.test(n) || n.includes("p s ") || n.includes(" p s") || /\bp b\b/.test(n) || n.includes("p b ") || n.includes(" p b");
});
console.log(`  Kanoniska frågor totalt: ${KANONISKA.length}`);
console.log(`  Innehåller «p s»/«p b»-sekvens: ${farliga.length}${farliga.length ? " → " + farliga.join(" · ") : " (0 — men kundfrågor i naturen kan: se rapport)"}`);
const demoFarlig = ["köp svenska aktier", "help sparkar min aktie", "topp säljläge nu"].filter((q) => norm(q).includes("p s") || norm(q).includes("p b"));
console.log(`  Demonstration av falsk positiv («köp svenska aktier» etc.): ${demoFarlig.length ? norm(demoFarlig[0]) + " innehåller sekvensen" : "—"}`);

// ── ROND 4: mentorväglöshet + registerbevis för v04/v05 ──
console.log("\n── ROND 4: v04/v05 i registret ──");
for (const slug of ["v04-ps", "v05-pb"]) {
  const r = KURSREGISTER.find((x) => x.slug === slug);
  console.log(`  ${slug}: ${r ? `${r.titel} · ${r.kategori} · ${r.kapitel} kap · ${r.minuter} min · ${r.niva}` : "SAKNAS!"}`);
}
const vardering = KURSREGISTER.filter((r) => r.kategori === "VÄRDERING").length;
console.log(`  VÄRDERING-kategorin: ${vardering} kurser (registerdrivet tal för svaren).`);
console.log("\nSOND KLAR.");
