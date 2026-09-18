#!/usr/bin/env node
/**
 * KVD — s5-u2 omgång 14 (manifest auto-s5-1789701930027): bk-04 + rp-03.
 *
 * Kvalitetsverifiering av de två levererade kurserna och register-synken:
 * struktur, proveniens (register ↔ kursfil round-trip), sektionsnärvaro,
 * maskinell aritmetik med oberoende omräkning, korsreferensprefix mot
 * registret, juridikgrind, R2-fasvakt, språkgrind och spegelkonsistens.
 *
 * Race-medveten: spegelantalet läses dynamiskt ur registret (u1:s tx-04 och
 * u3:s kommande kurser levererar parallellt — paritet krävs, ej fast tal).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
const KURSER = ["bk-04-koncernredovisningens-grunder", "rp-03-riskparitet"];

for (const slug of KURSER) {
  const fil = JSON.parse(readFileSync(`data/kurser-tillagg/${slug}.json`, "utf8"));
  const reg = register[slug];

  // 1 ── Register-närvaro + proveniens round-trip (djuplikhet, ej bara slug)
  testa(`${slug}: i registret`, !!reg);
  testa(`${slug}: proveniens — registerposten är djuplikt med kursfilen`, JSON.stringify(reg) === JSON.stringify(fil));

  // 2 ── Strukturparitet chapters_list ↔ chapters + titelvakt
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

  // 4 ── Nivå + xp + vikt (bk-04 Intermediär, rp-03 Avancerad — xp 50 konventionen)
  testa(`${slug}: nivå ${fil.level} enligt anspråk, xp 50, vikt '—'`,
    (slug.startsWith("bk-") ? fil.level === "Intermediär" : fil.level === "Avancerad") && fil.xp === 50 && fil.weight === "—");

  // 5 ── Korsreferenser: alla (xx-nn)-mönster i all text prefixmatchar registret
  const allt = JSON.stringify(fil);
  const refnamn = [...new Set([...allt.matchAll(/\(([a-z0-9]{1,6}-\d{2,3})/g)].map((m) => m[1]))];
  const brutna = refnamn.filter((r) => !Object.keys(register).some((s) => s.startsWith(r + "-")));
  testa(`${slug}: ${refnamn.length} unika korsreferensprefix, 0 brutna`, brutna.length === 0, `brutna: ${brutna.join(",") || "—"}`);

  // 6 ── Juridikgrind: rådfraser + utbildningsframing i avslut
  const rad = allt.match(/(?:du (?:bör|ska) (?:köpa|sälja)|rekommenderar (?:att )?(?:köpa|sälja)|köp (?:denna|denna aktie)|sälj (?:denna|denna aktie)|rådgivning (?:erbjuds|ges) här)/gi) ?? [];
  testa(`${slug}: juridikgrind — 0 rådfraser`, rad.length === 0, rad.join(","));
  const sistaText = fil.chapters[5].blocks.filter((b) => b.type === "text").map((b) => b.content).join(" ");
  testa(`${slug}: utbildningsframing i kursavslutet`, /utbildning|aldrig|råd/i.test(sistaText));

  // 7 ── Språkgrind: CJK/kyrilliska, dubbla mellanslag, engelska läckor, mjuka bindestreck
  const cjk = [...allt].filter((ch) => ch.charCodeAt(0) >= 0x4e00 && ch.charCodeAt(0) <= 0x9fff);
  testa(`${slug}: 0 CJK-tecken`, cjk.length === 0, cjk.slice(0, 5).join(""));
  const kyr = [...allt].filter((ch) => ch.charCodeAt(0) >= 0x400 && ch.charCodeAt(0) <= 0x4ff);
  testa(`${slug}: 0 kyrilliska tecken (u2-läxan)`, kyr.length === 0, kyr.slice(0, 5).join(""));
  testa(`${slug}: 0 mjuka bindestreck`, !allt.includes("­"));
  const dubbel = [...allt.matchAll(/[a-zÅÄÖåäö0-9%,.;:—)]  +[A-ZÅÄÖa-zåäö]/g)].length;
  testa(`${slug}: 0 dubbla mellanslag i text`, dubbel === 0, `${dubbel} träffar`);
  const vitlista = ["margin of safety", "mr Market", "All Weather", "ROIC", "WACC", "IFRS", "Bridgewater"];
  const engTraff = [...allt.matchAll(/\b(?:the|and|with|from|both|read|world|bottom line|regardless|triggered)\b/gi)].map((m) => m[0]);
  const engKvar = engTraff.filter((t) => !vitlista.some((v) => allt.slice(Math.max(0, allt.toLowerCase().indexOf(t.toLowerCase()) - 60), allt.toLowerCase().indexOf(t.toLowerCase()) + 60).includes(v.toLowerCase())));
  testa(`${slug}: 0 engelska läckor (vitlistade facktermer undantagna)`, engKvar.length === 0, engKvar.join(","));
}

// 8 ── Aritmetik med oberoende omräkning: bk-04 (eliminering · minoritet · goodwill)
{
  testa("aritmetik bk-04: omsättning utan eliminering 100+130 = 230", 100 + 130 === 230);
  testa("aritmetik bk-04: kostnader utan eliminering 80+100 = 180", 80 + 100 === 180);
  testa("aritmetik bk-04: resultat 20+30 = 50 = 130−80", 20 + 30 === 50 && 130 - 80 === 50);
  testa("aritmetik bk-04: bruttomarginal utan 50/230 ≈ 22 %", Math.abs(50 / 230 - 0.2174) < 0.0005);
  testa("aritmetik bk-04: bruttomarginal med 50/130 ≈ 38 %", Math.abs(50 / 130 - 0.3846) < 0.0005);
  testa("aritmetik bk-04: minoritet resultat 100×0,2 = 20, moder 100×0,8 = 80", Math.abs(100 * 0.2 - 20) < 1e-12 && Math.abs(100 * 0.8 - 80) < 1e-12);
  testa("aritmetik bk-04: minoritet EK 500×0,2 = 100, moder 500×0,8 = 400", Math.abs(500 * 0.2 - 100) < 1e-12 && Math.abs(500 * 0.8 - 400) < 1e-12);
  testa("aritmetik bk-04: baklänges 25/0,2 = 125 (minoritetsrad 20 %)", Math.abs(25 / 0.2 - 125) < 1e-12);
  testa("aritmetik bk-04: goodwill 700−520 = 180", 700 - 520 === 180);
  const bText = JSON.stringify(JSON.parse(readFileSync("data/kurser-tillagg/bk-04-koncernredovisningens-grunder.json", "utf8")));
  for (const tal of ["100 plus 130", "80 plus 100", "20 plus 30", "700", "520", "180 Mkr", "22 procent", "38 procent", "400 i koncern-EK", "100 i minoritetspost"]) {
    testa(`aritmetik bk-04: texten bär räkneledet "${tal}"`, bText.includes(tal));
  }
}

// 9 ── Aritmetik med oberoende omräkning: rp-03 (60/40 · riskbidrag · 25/75 · hävstång)
{
  // 60/40: varians 81 + 4 + 7,2 = 92,2 → σ 9,60; bidrag 8,81/0,79; andelar 91,8/8,2
  const v6040 = 0.36 * 225 + 0.16 * 25 + 2 * 0.6 * 0.4 * 0.2 * 75;
  testa("aritmetik rp-03: 60/40-varians 81+4+7,2 = 92,2", Math.abs(v6040 - 92.2) < 1e-9);
  testa("aritmetik rp-03: σ = roten ur 92,2 ≈ 9,60", Math.abs(Math.sqrt(v6040) - 9.6021) < 0.0005);
  const mrc1 = (0.6 * 225 + 0.4 * 0.2 * 75) / Math.sqrt(v6040);
  const mrc2 = (0.4 * 25 + 0.6 * 0.2 * 75) / Math.sqrt(v6040);
  const bidr1 = 0.6 * mrc1, bidr2 = 0.4 * mrc2;
  testa("aritmetik rp-03: marginell risk aktier ≈ 14,68, obligationer ≈ 1,98", Math.abs(mrc1 - 14.684) < 0.001 && Math.abs(mrc2 - 1.979) < 0.001);
  testa("aritmetik rp-03: bidrag 8,81 + 0,79 = 9,60 (identiteten)", Math.abs(bidr1 - 8.81) < 0.005 && Math.abs(bidr2 - 0.79) < 0.005 && Math.abs(bidr1 + bidr2 - Math.sqrt(v6040)) < 1e-9);
  testa("aritmetik rp-03: riskandelar 91,8 % / 8,2 %", Math.abs(bidr1 / Math.sqrt(v6040) - 0.918) < 0.001 && Math.abs(bidr2 / Math.sqrt(v6040) - 0.082) < 0.001);
  // 25/75: varians 14,0625+14,0625+5,625 = 33,75 → σ 5,81; bidrag 2,90 + 2,90 (50/50)
  const v2575 = 0.0625 * 225 + 0.5625 * 25 + 2 * 0.25 * 0.75 * 0.2 * 75;
  testa("aritmetik rp-03: 25/75-varians 14,06+14,06+5,63 = 33,75", Math.abs(v2575 - 33.75) < 1e-9);
  testa("aritmetik rp-03: σ = roten ur 33,75 ≈ 5,81", Math.abs(Math.sqrt(v2575) - 5.8095) < 0.0005);
  const mrcA = (0.25 * 225 + 0.75 * 0.2 * 75) / Math.sqrt(v2575);
  const mrcO = (0.75 * 25 + 0.25 * 0.2 * 75) / Math.sqrt(v2575);
  testa("aritmetik rp-03: riskparitetsbidrag 2,90 + 2,90 (lika — 50/50)", Math.abs(0.25 * mrcA - 2.905) < 0.005 && Math.abs(0.75 * mrcO - 2.905) < 0.005 && Math.abs(0.25 * mrcA - 0.75 * mrcO) < 1e-9);
  testa("aritmetik rp-03: bidragens summa = σ exakt", Math.abs(0.25 * mrcA + 0.75 * mrcO - Math.sqrt(v2575)) < 1e-9);
  // Hävstång: 9,6/5,8 ≈ 1,65; 1,65 × 5,8 ≈ 9,6
  testa("aritmetik rp-03: hävstång 9,6/5,8 ≈ 1,65", Math.abs(9.6 / 5.8 - 1.6552) < 0.001);
  testa("aritmetik rp-03: 1,65 × 5,8 ≈ 9,6 (skalan återställer volatiliteten)", Math.abs(1.65 * 5.8 - 9.57) < 0.005 && Math.abs(Math.round(1.65 * 5.8) - 10) < 1);
  const rText = JSON.stringify(JSON.parse(readFileSync("data/kurser-tillagg/rp-03-riskparitet.json", "utf8")));
  for (const tal of ["81 plus 4 plus 7,2", "92,2", "8,81", "0,79", "91,8", "14,06 plus 14,06 plus 5,63", "33,75", "2,90", "9,6 delat med 5,8", "1,65 gånger 5,8"]) {
    testa(`aritmetik rp-03: texten bär räkneledet "${tal}"`, rText.includes(tal));
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
