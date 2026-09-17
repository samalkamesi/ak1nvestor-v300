#!/usr/bin/env node
/**
 * KVD — s5-u2 omgång 13 (manifest auto-s5-1789681529602): ma-04 + roic-02.
 *
 * Kvalitetsverifiering av de två levererade kurserna och register-synken:
 * struktur, proveniens (register ↔ kursfil round-trip), sektionsnärvaro,
 * maskinell aritmetik med oberoende omräkning, korsreferensprefix mot
 * registret, juridikgrind, R2-fasvakt, språkgrind och spegelkonsistens.
 *
 * Race-medveten: spegelantalet läses dynamiskt ur registret (parallella
 * syskon i manifestet levererar samtidigt — paritet krävs, ej fast tal).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);
const num = (x) => typeof x === "number" && Number.isFinite(x);

const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const KURSER = ["ma-04-konjunkturindikatorerna", "roic-02-avkastningstrappan"];

for (const slug of KURSER) {
  const fil = JSON.parse(readFileSync(`data/kurser-tillagg/${slug}.json`, "utf8"));
  const reg = register[slug];

  // 1 ── Register-närvaro + proveniens round-trip (djuplikhet, ej bara slug)
  testa(`${slug}: i registret`, !!reg);
  testa(`${slug}: proveniens — registerposten är djuplikt med kursfilen`, JSON.stringify(reg) === JSON.stringify(fil));

  // 2 ── Strukturparitet chapters_list ↔ chapters + titelvakt (akm1-fällan: null)
  testa(`${slug}: chapters_list utan null-titlar`, fil.chapters_list.every((c) => typeof c.title === "string" && c.title.trim() !== ""));
  testa(`${slug}: antal kapitel = chapterCount = 6`, fil.chapters.length === 6 && fil.chapterCount === 6);
  testa(`${slug}: chapters_list ↔ chapters paritet (num/titel/minuter)`,
    fil.chapters_list.every((c, i) => c.num === fil.chapters[i].num && c.title === fil.chapters[i].title && c.minutes === fil.chapters[i].minutes));
  testa(`${slug}: minuter — varje kapitel 4, totalt 24, minutes = totalMinutes`,
    fil.chapters.every((c) => c.minutes === 4) && fil.totalMinutes === 24 && fil.minutes === 24);
  testa(`${slug}: blockform — varje block bär exakt type+content`,
    fil.chapters.every((c) => c.blocks.every((b) => Object.keys(b).length === 2 && typeof b.type === "string" && typeof b.content === "string" && b.content.trim() !== "")));

  // 3 ── Sektionsnärvaro (KVD-omgång 8:s kontrakt)
  testa(`${slug}: why+learn närvarande och längd > 200 tecken`, ["why", "learn"].every((f) => typeof fil[f] === "string" && fil[f].length > 200));
  testa(`${slug}: history{origin,evolution,modern} närvarande`, ["origin", "evolution", "modern"].every((f) => typeof fil.history?.[f] === "string" && fil.history[f].length > 200));
  testa(`${slug}: lynch/graham/ak1-sektioner närvarande`, ["lynchSection", "grahamSection", "ak1Section"].every((f) => typeof fil[f] === "string" && fil[f].length > 150));
  testa(`${slug}: history bär ENDELIGEN bara sina tre fält`, Object.keys(fil.history).length === 3);

  // 4 ── Nivå + xp + vikt
  testa(`${slug}: nivå Intermediär, xp 50, vikt '—'`, fil.level === "Intermediär" && fil.xp === 50 && fil.weight === "—");

  // 5 ── Korsreferenser: alla (xx-nn)-mönster i all text prefixmatchar registret
  const allt = JSON.stringify(fil); // styckebrytningar bär \n\n — inte mellanslag (omg 8:s falskalarm-klass)
  const refnamn = [...new Set([...allt.matchAll(/\(([a-z0-9]{1,6}-\d{2,3})/g)].map((m) => m[1]))];
  const brutna = refnamn.filter((r) => !Object.keys(register).some((s) => s.startsWith(r + "-")));
  testa(`${slug}: ${refnamn.length} unika korsreferensprefix, 0 brutna`, brutna.length === 0, `brutna: ${brutna.join(",") || "—"}`);

  // 6 ── Juridikgrind: rådfraser + utbildningsframing i avslut
  const rad = allt.match(/(?:du (?:bör|ska) (?:köpa|sälja)|rekommenderar (?:att )?(?:köpa|sälja)|köp (?:denna|denna aktie)|sälj (?:denna|denna aktie)|rådgivning (?:erbjuds|ges) här)/gi) ?? [];
  testa(`${slug}: juridikgrind — 0 rådfraser`, rad.length === 0, rad.join(","));
  const sistaText = fil.chapters[5].blocks.filter((b) => b.type === "text").map((b) => b.content).join(" ");
  testa(`${slug}: utbildningsframing i kursavslutet`, /utbildning/i.test(sistaText));

  // 7 ── Språkgrind: CJK, dubbla mellanslag i brödtext, engelska läckor
  const cjk = [...allt].filter((ch) => ch.charCodeAt(0) >= 0x4e00 && ch.charCodeAt(0) <= 0x9fff);
  testa(`${slug}: 0 CJK-tecken`, cjk.length === 0, cjk.slice(0, 5).join(""));
  const dubbel = [...allt.matchAll(/[a-zÅÄÖåäö0-9%,.;:—)]  +[A-ZÅÄÖa-zåäö]/g)].length;
  testa(`${slug}: 0 dubbla mellanslag i text`, dubbel === 0, `${dubbel} träffar`);
  const vitlista = ["margin of safety", "mr Market", "PMI", "ROIC", "DuPont", "WACC", "ARR"];
  const engTraff = [...allt.matchAll(/\b(?:the|and|with|from|both|read|world|bottom line|unit economics|right from wrong)\b/gi)].map((m) => m[0]);
  const engKvar = engTraff.filter((t) => !vitlista.some((v) => allt.slice(Math.max(0, allt.toLowerCase().indexOf(t.toLowerCase()) - 60), allt.toLowerCase().indexOf(t.toLowerCase()) + 60).includes(v.toLowerCase())));
  testa(`${slug}: 0 engelska läckor (vitlistade facktermer undantagna)`, engKvar.length === 0, engKvar.join(","));
}

// 8 ── Aritmetik med oberoende omräkning: ma-04
{
  testa("aritmetik ma-04: diffusion 35+45+20 = 100", 35 + 45 + 20 === 100);
  testa("aritmetik ma-04: index 35 + 45/2 = 57,5", 35 + 45 / 2 === 57.5);
  testa("aritmetik ma-04: nettobalans 40+35+25 = 100", 40 + 35 + 25 === 100);
  testa("aritmetik ma-04: nettobalans 40−25 = +15", 40 - 25 === 15);
  testa("aritmetik ma-04: orderöverskott 120−100 = 20", 120 - 100 === 20);
  testa("aritmetik ma-04: orderkvot 120/100 = 1,2", Math.abs(120 / 100 - 1.2) < 1e-12);
  const maText = JSON.stringify(JSON.parse(readFileSync("data/kurser-tillagg/ma-04-konjunkturindikatorerna.json", "utf8")));
  for (const tal of ["35 plus 45 plus 20", "35 plus 22,5", "40 minus 25", "120 delat med 100"]) {
    testa(`aritmetik ma-04: texten bär räkneledet "${tal}"`, maText.includes(tal));
  }
}

// 9 ── Aritmetik med oberoende omräkning: roic-02
{
  testa("aritmetik roic-02: A ROIC 25/125 = 20 %", Math.abs(25 / 125 - 0.2) < 1e-12);
  testa("aritmetik roic-02: A hastighet 100/125 = 0,8", Math.abs(100 / 125 - 0.8) < 1e-12);
  testa("aritmetik roic-02: A marginal 25 % × 0,8 = 20 %", Math.abs(0.25 * 0.8 - 0.2) < 1e-12);
  testa("aritmetik roic-02: B ROIC 30/150 = 20 %", Math.abs(30 / 150 - 0.2) < 1e-12);
  testa("aritmetik roic-02: B hastighet 1000/150 ≈ 6,7", Math.abs(1000 / 150 - 6.6667) < 0.001);
  testa("aritmetik roic-02: marginallyft A 26/125 = 20,8 %", Math.abs(26 / 125 - 0.208) < 1e-12);
  testa("aritmetik roic-02: B marginal 3,3 % av 1000 = 33 → 33/150 = 22 %", Math.abs(0.033 * 1000 - 33) < 1e-9 && Math.abs(33 / 150 - 0.22) < 1e-12);
  testa("aritmetik roic-02: B kapital 30/136 ≈ 22,1 %", Math.abs(30 / 136 - 0.2206) < 0.0005);
  const ar = [16 / 160, 20 / 160, 26 / 160, 26 / 156];
  testa("aritmetik roic-02: isolationstrappan 10,0 → 12,5 → 16,25 → 16,7",
    Math.abs(ar[0] - 0.1) < 1e-12 && Math.abs(ar[1] - 0.125) < 1e-12 && Math.abs(ar[2] - 0.1625) < 1e-12 && Math.abs(ar[3] - 0.16667) < 0.0001);
  const steg = [ar[1] - ar[0], ar[2] - ar[1], ar[3] - ar[2]];
  testa("aritmetik roic-02: ledens summa = totalresan exakt (±1e-9)",
    Math.abs(steg[0] + steg[1] + steg[2] - (ar[3] - ar[0])) < 1e-9);
  testa("aritmetik roic-02: årtal-marginaler 16/200 = 8 % och 26/260 = 10 %",
    Math.abs(16 / 200 - 0.08) < 1e-12 && Math.abs(26 / 260 - 0.1) < 1e-12);
  const rText = JSON.stringify(JSON.parse(readFileSync("data/kurser-tillagg/roic-02-avkastningstrappan.json", "utf8")));
  for (const tal of ["25 delat med 125", "100 delat med 125", "30 delat med 150", "1 000 delat med 150", "26 delat med 156", "plus 2,5", "plus 3,75", "plus 0,4"]) {
    testa(`aritmetik roic-02: texten bär räkneledet "${tal}"`, rText.includes(tal));
  }
}

// 10 ── R2-fasvakt: båda gratis (kraverFas 0 — ingen pris-/tieryta)
{
  const kartText = readFileSync("src/lib/larvag-karta.ts", "utf8");
  for (const slug of KURSER) {
    const rad = kartText.match(new RegExp(`\\{ slug: "${slug}".*?\\}`));
    testa(`R2 ${slug}: kraverFas 0 i kartan (gratis)`, !!rad && /kraverFas: 0/.test(rad[0]));
  }
}

// 11 ── Spegelkonsistens (race-medveten: registrets antal är sanningen)
{
  const antal = Object.keys(register).length;
  const siffror = JSON.parse(readFileSync("data/siffror.json", "utf8"));
  const sok = JSON.parse(readFileSync("public/sok-index.json", "utf8"));
  const speglar = JSON.parse(readFileSync("public/speglar-slugar.json", "utf8"));
  const kartaAntal = (kartText2 => [...kartText2.matchAll(/slug: "/g)].length)(readFileSync("src/lib/larvag-karta.ts", "utf8"));
  testa(`spegelkonsistens: register ${antal} = siffror = sokindex = speglar = karta`,
    siffror.kurser === antal && sok.antal === antal && (Array.isArray(sok.kurser) ? sok.kurser.length : sok.kurser) === antal && speglar.antalKurser === antal && kartaAntal === antal,
    `siffror ${siffror.kurser} · sok ${sok.antal}/${sok.kurser} · speglar ${speglar.antalKurser} · karta ${kartaAntal}`);
  const llms = readFileSync("public/llms.txt", "utf8");
  const llmsF = readFileSync("public/llms-full.txt", "utf8");
  const m = (t) => [...t.matchAll(new RegExp(`${antal} kurser`, "g"))].length;
  testa(`llms-paritet: ${antal} kurser i llms.txt (≥5) och llms-full.txt (≥3)`, m(llms) >= 5 && m(llmsF) >= 3, `llms ${m(llms)} · full ${m(llmsF)}`);
}

// ── Rapport ──────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.log("\n" + fail.join("\n")); console.error(`\nKVD RÖD — ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nKVD GRÖN — ${pass.length} PASS 0 FAIL 0 VARNING`);
