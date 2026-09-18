#!/usr/bin/env node
/**
 * KVD — s5-u2 omgång 16 (manifest auto-s5-1789743901668):
 * vr-06-jamforelsebolagen + st-06-likviditetsreserven.
 *
 * Faser:
 *   fore  — kursfilerna mot gällande register (struktur, aritmetik med
 *           OBEROENDE omräkning och räkneledsnärvaro, korslänkar registeräkta,
 *           juridikgrind, språkgrind, R2). KÖRS FÖRE INSERT.
 *   efter — registerparitet (round-trip register↔kursfil), insertläge
 *           (serieordning), kart rader (niva-mappning, kraverFas 0),
 *           llms-tal, larvag-synk-läge. KÖRS EFTER SYNKKEDJAN.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const kurs = (slug) => JSON.parse(readFileSync(`${ROT}/data/kurser-tillagg/${slug}.json`, "utf8"));
const register = JSON.parse(readFileSync(`${ROT}/public/deep-courses.json`, "utf8"));
const regSlugs = Object.keys(register);
const NYA = ["vr-06-jamforelsebolagen", "st-06-likviditetsreserven"];
const fas = process.argv[2] ?? "fore";
const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);
const narvaro = (text, tal, tolerans = 0, label = "") => {
  // räkneledsnärvaro: talet (eller avrundat) ska finnas i texten
  const alt = [tal, Math.round(tal * 10) / 10, Math.round(tal * 100) / 100];
  return alt.some((a) => text.includes(String(a))) || (label && text.includes(label));
};

// ═══════════════════════════ FAS: FÖRE ═══════════════════════════
if (fas === "fore") {
  const SCHEMA = ["slug","category","weight","chapterCount","totalMinutes","title","summary","minutes","xp","level","learn","why","history","chapters_list","chapters","lynchSection","grahamSection","ak1Section"];
  const BLOCKTYP = new Set(["text","definition","insight","tabell","utmaning"]);

  for (const slug of NYA) {
    const j = kurs(slug);
    const t = JSON.stringify(j);
    const KAT = slug.startsWith("vr-") ? "VÄRDERING" : "STABILITET";

    // A. Struktur
    testa(`${slug} A1 schemafält (17 st)`, SCHEMA.every((k) => k in j), SCHEMA.filter((k) => !(k in j)).join(","));
    testa(`${slug} A2 slug ren ASCII`, /^[a-z0-9][a-z0-9-]*$/.test(j.slug));
    testa(`${slug} A3 kategori ${KAT}`, j.category === KAT);
    testa(`${slug} A4 nivå giltig`, ["Nybörjare","Intermediär","Avancerad"].includes(j.level), j.level);
    testa(`${slug} A5 kapitelantal 6 = chapters = chapters_list`, j.chapterCount === 6 && j.chapters.length === 6 && j.chapters_list.length === 6);
    testa(`${slug} A6 minuter 6×4 = totalMinutes = minutes = 24`, j.chapters.every((c) => c.minutes === 4) && j.totalMinutes === 24 && j.minutes === 24);
    testa(`${slug} A7 xp 50, weight—`, j.xp === 50 && j.weight === "—");
    testa(`${slug} A8 chapters_list↔chapters paritet (num+titel+minuter)`, j.chapters_list.every((c, i) => c.num === j.chapters[i].num && c.title === j.chapters[i].title && c.minutes === j.chapters[i].minutes));
    testa(`${slug} A9 blocktyper giltiga + ≥2 per kapitel + intro närvarande`, j.chapters.every((c) => c.intro && c.blocks.length >= 2 && c.blocks.every((b) => BLOCKTYP.has(b.type) && typeof b.content === "string" && b.content.length > 20)));
    testa(`${slug} A10 history origin/evolution/modern ≥200 tkn vardera`, ["origin","evolution","modern"].every((k) => typeof j.history[k] === "string" && j.history[k].length >= 200));
    testa(`${slug} A11 sektioner lynch/graham/ak1 ≥300 tkn`, ["lynchSection","grahamSection","ak1Section"].every((k) => typeof j[k] === "string" && j[k].length >= 300));
    testa(`${slug} A12 learn och why ≥500 tkn`, j.learn.length >= 500 && j.why.length >= 500, `learn=${j.learn.length} why=${j.why.length}`);
    testa(`${slug} A13 tabell-block i mätningskapitlet (kap 4)`, j.chapters[3].blocks.some((b) => b.type === "tabell"));
    testa(`${slug} A14 utmaning-block i mästerskapskapitlet (kap 6)`, j.chapters[5].blocks.some((b) => b.type === "utmaning"));

    // B. Språkgrind (maskinell)
    const CJK = t.match(/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g);
    const mjukbin = t.match(/\u00AD/g);
    const typograv = t.match(/[\u201C\u201D\u2018\u2019]/g);
    const tabbar = t.match(/\t/g);
    const kyrill = t.match(/[\u0400-\u04FF]/g);
    const dubbel = t.match(/[a-zåäö]  +[a-zåäö]/gi);
    testa(`${slug} B1 språkgrind: 0 CJK/0 mjuka bindestreck/0 typografiska citattecken/0 tabbar/0 kyrilliska/0 dubbla mellanslag`, !CJK && !mjukbin && !typograv && !tabbar && !kyrill && !dubbel, [CJK && "CJK:" + CJK.join(""), mjukbin && "mjukbin", typograv && "citat", tabbar && "tabbar", kyrill && "kyrill", dubbel && "dubbelmellanslag"].filter(Boolean).join(" "));
    const engelska = t.match(/\b(the|with|regardless|possible|because|triggered|both feet|margin of safety|structure|Exit|something|answer|solvent|fracking|supply|peer)\b/gi);
    testa(`${slug} B2 engelskaläckor 0`, !engelska, engelska ? [...new Set(engelska.map((x) => x.toLowerCase()))].join(",") : "");
    const tyska = t.match(/\b(deren|ist|und|nicht|über|für)\b/g);
    testa(`${slug} B3 tyska läckor 0`, !tyska, tyska ? tyska.join(",") : "");

    // C. Korslänkar registeräkta (prefixmatch + omnämnda i text)
    const prefix = [...new Set([...t.matchAll(/\b((?:vr|st|km|ks|rk|rs|se|vm|v1[0-9]|v[1-9]|bk|ln|pe|ib)-\d{1,3})\b/g)].map((m) => m[1]))].filter((p) => !NYA.some((s) => s.startsWith(p + "-")));
    const saknade = prefix.filter((p) => !regSlugs.some((s) => s === p || s.startsWith(p + "-")));
    testa(`${slug} C1 korslänkar registeräkta (${prefix.length} prefix)`, saknade.length === 0, saknade.join(","));

    // D. Juridikgrind
    const rad = t.match(/\b(köp denna|sälj denna|investera i (denna|den här)|rekommenderar att du köper|min rekommendation är att köpa)\b/gi);
    testa(`${slug} D1 juridikgrind 0 rådsfraser`, !rad, rad ? rad.join(",") : "");
    const lagrum = t.match(/\b\d kap\.? \d+ §|\d+\s*§\s*\b/g);
    testa(`${slug} D2 0 lagrum i kurstext`, !lagrum, lagrum ? lagrum.join(",") : "");
    const framings = (t.match(/utbildning|inte uppmaning|läsarens eget/gi) || []).length;
    testa(`${slug} D3 utbildningsframing närvarande (≥2 träffar)`, framings >= 2, `${framings} träffar`);

    // E. R2 — ingen pris-/tier-/publiceringsyta
    const r2 = t.match(/\b(Fas [23]|premium|prenumerationspris|9 999|13 999|249|449|799)\b/g);
    testa(`${slug} E1 R2: 0 pris-/tier-/publiceringsytor`, !r2, r2 ? r2.join(",") : "");
  }

  // F. Aritmetik — OBEROENDE omräkning (vr-06)
  {
    const j = kurs("vr-06-jamforelsebolagen");
    const t = JSON.stringify(j);
    const pe = [14, 16, 15, 22, 17, 15, 48];
    const sum = pe.reduce((a, b) => a + b, 0);
    const sorterat = [...pe].sort((a, b) => a - b);
    const median = sorterat[3];
    const medel = sum / 7;
    const trimmat = (sum - 48) / 6;
    testa("vr-06 F1 median 16 (oberoende)", median === 16, String(median));
    testa("vr-06 F2 medel 21,0 (147/7)", Math.abs(medel - 21) < 0.001, String(medel));
    testa("vr-06 F3 trimmat 16,5 (99/6)", Math.abs(trimmat - 16.5) < 0.001, String(trimmat));
    testa("vr-06 F4 värden 80 och 105 vid vinst 5 (5×16, 5×21)", 5 * 16 === 80 && 5 * 21 === 105);
    testa("vr-06 F5 höjning 31,3 procent (105/80)", Math.abs(105 / 80 - 1.3125) < 0.0001 && t.includes("31,3"), `${((105 / 80 - 1) * 100).toFixed(2)} %`);
    testa("vr-06 F6 trimmat värde 82,5 (5×16,5)", Math.abs(5 * 16.5 - 82.5) < 0.001);
    testa("vr-06 F7 räkneledsnärvaro: medianen 16 i text", t.includes("medianen 16"));
    testa("vr-06 F8 räkneledsnärvaro: medel 21,0 i text", t.includes("21,0"));
    testa("vr-06 F9 räkneledsnärvaro: 147 och 99 (täljarna) i text", t.includes("147") && t.includes("99"));
    testa("vr-06 F10 storleksled 90 000 mot 800 i text", t.includes("90 000") && t.includes("800"));
  }

  // G. Aritmetik — OBEROENDE omräkning (st-06)
  {
    const j = kurs("st-06-likviditetsreserven");
    const t = JSON.stringify(j);
    const netto = 260 * (1 - 0.206);
    testa("st-06 G1 obeskattat netto 206,4 (260×0,794)", Math.abs(netto - 206.44) < 0.01 && t.includes("206,4"), String(netto.toFixed(2)));
    testa("st-06 G2 smal reserv 1 470,0 (840+630)", 840 + 630 === 1470 && t.includes("1 470,0"));
    testa("st-06 G3 bred reserv 1 676,4 (1 470+206,4)", Math.abs(1470 + 206.4 - 1676.4) < 0.001 && t.includes("1 676,4"));
    testa("st-06 G4 överlevnad smal 7,0 (1 470/210)", Math.abs(1470 / 210 - 7) < 0.001 && t.includes("7,0 månader"));
    testa("st-06 G5 överlevnad bred 8,0 (1 676,4/210 ≈ 7,98)", Math.abs(1676.4 / 210 - 7.98) < 0.01 && t.includes("8,0 månader"));
    testa("st-06 G6 spegel 1,2 (95/80)", Math.abs(95 / 80 - 1.1875) < 0.001 && t.includes("1,2 månader"));
    testa("st-06 G7 kvartal 630,0 (210×3)", 210 * 3 === 630 && t.includes("630,0"));
    testa("st-06 G8 räkneledsnärvaro: 210,0 i text (förbrukning)", t.includes("210,0"));
    testa("st-06 G9 skattdel 0,794 och sats 0,206 i text", t.includes("0,794") && t.includes("0,206"));
    testa("st-06 G10 räntedel 42,0 av 210,0 i text", t.includes("42,0"));
  }

  console.log(pass.join("\n"));
  if (fail.length) { console.log("\n" + fail.join("\n")); console.error(`\nKVD fore: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
  console.log(`\nKVD fore: ${pass.length} PASS 0 FEL — insert kan ske.`);
  process.exit(0);
}

// ═══════════════════════════ FAS: EFTER ═══════════════════════════
if (fas === "efter") {
  for (const slug of NYA) {
    const j = kurs(slug);
    const regPost = register[slug];
    testa(`${slug} H1 round-trip register↔kursfil djupt identisk`, JSON.stringify(regPost) === JSON.stringify(j));
  }
  const ix = (s) => regSlugs.indexOf(s);
  testa("I1 insertläge vr-06: direkt efter vr-05", ix("vr-06-jamforelsebolagen") === ix("vr-05-pris-och-varde") + 1, `idx vr-05=${ix("vr-05-pris-och-varde")} vr-06=${ix("vr-06-jamforelsebolagen")}`);
  testa("I2 insertläge st-06: direkt efter st-05", ix("st-06-likviditetsreserven") === ix("st-05-refinansieringsmuren") + 1, `idx st-05=${ix("st-05-refinansieringsmuren")} st-06=${ix("st-06-likviditetsreserven")}`);

  const kartaText = readFileSync(`${ROT}/src/lib/larvag-karta.ts`, "utf8");
  const nivaMap = { Nybörjare: 1, Intermediär: 2, Avancerad: 3 };
  for (const slug of NYA) {
    const j = kurs(slug);
    const rad = kartaText.match(new RegExp(`\\{ slug: "${slug}", titel: "[^"]+", kategori: "${j.category}", niva: (\\d+), kraverFas: (\\d+), vIndex: (-?\\d+), minuter: (\\d+) \\}`));
    testa(`${slug} J1 karta rad: niva ${nivaMap[j.level]}, kraverFas 0`, rad !== null && Number(rad[1]) === nivaMap[j.level] && Number(rad[2]) === 0, rad ? rad[0].slice(0, 110) : "rad saknas");
  }
  const konstant = kartaText.match(/LARVAG_ANTAL_KURSER = (\d+)/);
  testa("J2 LARVAG_ANTAL_KURSER = registerantal", Number(konstant?.[1]) === regSlugs.length, `karta=${konstant?.[1]} register=${regSlugs.length}`);

  const llms = readFileSync(`${ROT}/public/llms.txt`, "utf8");
  const llmsFull = readFileSync(`${ROT}/public/llms-full.txt`, "utf8");
  const n = regSlugs.length;
  testa("K1 llms.txt bär registerantalet (6 ställen)", (llms.split(`${n} kurser`).length - 1) === 6, `${llms.split(`${n} kurser`).length - 1} träffar`);
  testa("K2 llms-full.txt bär registerantalet (4 ställen)", (llmsFull.split(`${n} kurser`).length - 1) === 4, `${llmsFull.split(`${n} kurser`).length - 1} träffar`);

  const mentor = readFileSync(`${ROT}/src/lib/ai-mentor-register.ts`, "utf8");
  const mentorRader = [...mentor.matchAll(/^  \{ slug: "/gm)].length;
  testa("L1 ai-mentor-register bär registerantalet rader", mentorRader === n, `${mentorRader} mot ${n}`);

  console.log(pass.join("\n"));
  if (fail.length) { console.log("\n" + fail.join("\n")); console.error(`\nKVD efter: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
  console.log(`\nKVD efter: ${pass.length} PASS 0 FEL 0 VARNING — register ${n} kurser, hela kedjan grön.`);
  process.exit(0);
}

console.error("Användning: node verktyg/_s5u2o16-kvd.mjs [fore|efter]");
process.exit(1);
