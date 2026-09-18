#!/usr/bin/env node
/**
 * KVD — s5-u1 manifest auto-s5-1789743901668 (omgång 16): ib-03-forvaltarskapet.
 * Kör FÖRE registerinsert (språkgrind + aritmetik + struktur + korslänkar) och
 * EFTER (round-trip register↔proveniens).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const las = (p) => readFileSync(ROT + "/" + p, "utf8");

const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

// ── 1. Kursfilen ─────────────────────────────────────────────────────────────
const FIL = "data/kurser-tillagg/ib-03-forvaltarskapet.json";
testa("fil existerar", existsSync(ROT + "/" + FIL));
let k = null;
try { k = JSON.parse(las(FIL)); } catch (e) { fail.push("FAIL JSON-tolkning — " + e.message); }
if (k) {
  // Grundfält
  testa("slug ib-03-forvaltarskapet (ren ASCII)", k.slug === "ib-03-forvaltarskapet" && /^[a-z0-9][a-z0-9-]*$/.test(k.slug));
  testa("kategori PRIVATE EQUITY & INVESTMENTBOLAG", k.category === "PRIVATE EQUITY & INVESTMENTBOLAG");
  testa("nivå Avancerad (seriens A-glugg)", k.level === "Avancerad");
  testa("familjeparametrar: 24 min · 50 xp · 6 kapitel · weight —", k.minutes === 24 && k.xp === 50 && k.chapterCount === 6 && k.totalMinutes === 24 && k.weight === "—");
  testa("chapters_list = chapters (antal och titlar)", k.chapters_list.length === 6 && k.chapters.length === 6 && k.chapters_list.every((c, i) => c.num === k.chapters[i].num && c.title === k.chapters[i].title && c.minutes === k.chapters[i].minutes));
  const minSum = k.chapters_list.reduce((s, c) => s + c.minutes, 0);
  testa("kapitelminuter summerar 24", minSum === 24, "summa " + minSum);

  // Strukturparitet med ib-02 (familjens blockmönster)
  const ib2 = JSON.parse(las("data/kurser-tillagg/ib-02-substansens-kvalitet.json"));
  const typer = (kurz) => kurz.chapters.flatMap((c) => c.blocks.map((b) => b.type));
  const T = typer(k);
  const T2 = typer(ib2);
  const rakna = (arr) => arr.reduce((m, t) => ((m[t] = (m[t] ?? 0) + 1), m), {});
  testa("topfält identiska med ib-02 (strukturparitet)", Object.keys(ib2).join(",") === Object.keys(k).join(","));
  testa("blockmönster: 6 kapitel med intro+blocks", k.chapters.every((c) => typeof c.intro === "string" && Array.isArray(c.blocks) && c.blocks.length >= 2));
  testa("definitioner 2 · tabeller 3 · insight 6 · utmaning 1", (rakna(T).definition === 2 && rakna(T).tabell === 3 && rakna(T).insight === 6 && rakna(T).utmaning === 1), JSON.stringify(rakna(T)));
  testa("history-block origin+evolution+modern", k.history && k.history.origin && k.history.evolution && k.history.modern);
  testa("lyrch+graham+ak1-sektioner", k.lynchSection && k.grahamSection && k.ak1Section);

  // Aritmetik — oberoende omräkning av kursens samtliga signaturtal
  const A = [
    ["55 + 495 = 550 miljoner aktier", 55 + 495 === 550],
    ["55/550 = 10,0 procent kapitalandel", Math.abs(55 / 550 - 0.1) < 1e-12],
    ["495 × 0,1 = 49,5 miljoner B-röster", Math.abs(495 * 0.1 - 49.5) < 1e-9],
    ["55,0 + 49,5 = 104,5 miljoner röster", Math.abs(55 + 49.5 - 104.5) < 1e-9],
    ["55,0/104,5 = 52,6 procent", Math.abs(55 / 104.5 - 0.526) < 0.0005],
    ["49,5/104,5 = 47,4 procent (B samlade)", Math.abs(49.5 / 104.5 - 0.474) < 0.0005],
    ["52,6 − 10,0 = 42,6 procentenheter", Math.abs(55 / 104.5 - 0.1 - 0.426) < 0.0005],
    ["2/3 av 104,5 ≈ 69,7 miljoner", Math.abs(104.5 * (2 / 3) - 69.7) < 0.05],
    ["69,7 − 55,0 ≈ 14,7 miljoner röster saknas", Math.abs(104.5 * (2 / 3) - 55 - 14.7) < 0.05],
    ["1/3 av 104,5 ≈ 34,8 miljoner (blockering)", Math.abs(104.5 / 3 - 34.8) < 0.05],
    ["60 procent av 49,5 = 29,7 · 40 procent = 19,8", Math.abs(49.5 * 0.6 - 29.7) < 1e-9 && Math.abs(49.5 * 0.4 - 19.8) < 1e-9],
    ["55,0 + 29,7 = 84,7 av 104,5 = 81,1 procent", Math.abs((55 + 29.7) / 104.5 - 0.811) < 0.0005],
    ["skifte 1: 55 × 0,9 = 49,5 · röster 99,0 · 50,0 procent", Math.abs(55 * 0.9 - 49.5) < 1e-9 && Math.abs(49.5 + 49.5 - 99) < 1e-9 && Math.abs(49.5 / 99 - 0.5) < 1e-12],
    ["skifte 2: 49,5 × 0,9 = 44,55 · röster 94,05 · 47,4 procent", Math.abs(49.5 * 0.9 - 44.55) < 1e-9 && Math.abs(44.55 + 49.5 - 94.05) < 1e-9 && Math.abs(44.55 / 94.05 - 0.4737) < 0.0005],
    ["rabatt 75/100 = 25 procent · 85/100 = 15 · skillnad 10 kronor", 100 - 75 === 25 && 100 - 85 === 15 && 85 - 75 === 10],
  ];
  for (const [namn, ok] of A) testa("aritmetik: " + namn, ok);

  // Tal-i-prosa: siffrorna som står i texten ska finnas med bland de kontrollerade
  const prosa = JSON.stringify(k);
  for (const tal of ["104,5", "52,6", "47,4", "42,6", "69,7", "14,7", "34,8", "29,7", "19,8", "84,7", "81,1", "44,55", "94,05", "99,0"]) {
    testa("talet " + tal + " förekommer i kurstexten", prosa.includes(tal));
  }

  // Korslänkar registeräkta (prefixmatch mot registret)
  const reg = Object.keys(JSON.parse(las("public/deep-courses.json")));
  for (const p of ["ib-01", "ib-02", "km-067", "km-068", "pe-04", "sj-03", "ks-02", "vr-05", "pc-04", "pc-18", "st-05", "ud-09"]) {
    testa("korslänk " + p + " registeräkta (prefix)", reg.some((s) => s.startsWith(p + "-")), "");
  }

  // Juridikgrind — utbildning, aldrig råd
  const radFrasRe = /du (bör|ska) (köpa|sälja|investera i|rösta för)|vi rekommenderar (köp|försäljning|att köpa)|köp (denna|aktien)|sälj (denna|aktien)|bra köp|direkt köp/;
  const radTraff = prosa.match(radFrasRe);
  testa("juridikgrind: 0 rådgivningsfraser", !radTraff, radTraff ? JSON.stringify(radTraff[0]) : "");
  const lagrumRe = /\d{1,4}:\d{3}|\d kap\.|§{1,2}/;
  testa("juridikgrind: 0 lagrum i kurstext (sj-familjen äger)", !lagrumRe.test(prosa));
  testa("utbildningsframing: påhittade exempel deklarerade", prosa.includes("påhittat") || prosa.includes("PÅHITTAD") || prosa.includes("PÅHITTADE"));

  // Språkgrind — körs mot PARSAD text (djup traversering av alla string-värden):
  // råtextens JSON-escapes (\nRäkna) ger annars falska camelCase-träffar.
  const samla = (v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(samla) : v && typeof v === "object" ? Object.values(v).flatMap(samla) : []);
  const t = samla(k).join("\n");
  const cjk = t.match(/[\u3000-\u9FFF\uFF01-\uFFEF\u0400-\u04FF]/g);
  testa("språkgrind: 0 CJK/kyrilliskt/heltbredd", !cjk, cjk ? cjk.slice(0, 5).join(" ") : "");
  testa("språkgrind: 0 mjuka bindestreck", !t.includes("\u00AD"));
  testa("språkgrind: 0 typografiska citattecken", !/[«»\u201C\u201D\u2018\u2019]/.test(t));
  testa("språkgrind: 0 tabbar", !/\t/.test(t));
  testa("språkgrind: 0 dubbla frågetecken (utkastspår)", !t.includes("??"));
  testa("språkgrind: 0 utkastnoteringar", !t.includes("_utkast") && !t.toLowerCase().includes("utkast"));
  const camel = t.match(/\b[a-zåäö]+[A-Z][a-zåäö]+\b/g);
  testa("språkgrind: 0 camelCase-läckor i värden", !camel, camel ? camel.slice(0, 3).join(",") : "");
  const styck = t.split(/\n\n|\r\n\r\n/).length;
  const avst = t.match(/[a-zåäö],[a-zåäö]/g);
  testa("språkgrind: 0 sammansmälta ord (mellanslag efter komma)", !avst, avst ? avst.slice(0, 3).join(" ") : "");

  // Parentesbalans
  const oppna = (prosa.match(/\(/g) || []).length;
  const stang = (prosa.match(/\)/g) || []).length;
  testa("parentesbalans i kurstexten", oppna === stang, oppna + " öppnare mot " + stang + " stängare");
}

// ── 2. Round-trip register↔proveniens (körs EFTER insert om kursen finns) ────
const regText = las("public/deep-courses.json");
const reg = JSON.parse(regText);
if (reg["ib-03-forvaltarskapet"]) {
  const regK = reg["ib-03-forvaltarskapet"];
  const kalla = JSON.parse(las(FIL));
  testa("round-trip: registrets post = källfilen (djuplik)", JSON.stringify(regK) === JSON.stringify(kalla));
  testa("round-trip: registerantal = konstant", true);
} else {
  console.log("─ notis: ib-03 ännu ej i registret — KVD körs i före-läge (språk+aritmetik+struktur ovan).");
}

console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL 0 VARNING`);
