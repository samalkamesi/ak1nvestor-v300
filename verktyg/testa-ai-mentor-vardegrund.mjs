/**
 * TESTA AI-MENTORN — VÄRDEGRUND-LAGRET (spår 6 omgång 23, s6-u3), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-vardegrund.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers tre monsters (intrinsic value, realoptioner,
 * kassaflödesavkastning):
 *   A  kanoniska   — 3 frågor: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥3 källor), ≥2 registeräkta kurslänkar
 *   A2 wiring     — importen + kedjeraden i chat-widget.tsx bär detta lager
 *                    EFTER konvertibeln (lager 51, SIST i omgång 23:s fönster)
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (51 motorer;
 *                    däribland "vad är DCF?" → nästa och "vad är en
 *                    köpoption?" → optionsdjupet, deras dokumenterade ägande)
 *   D02 register   — kategoriantal + kursminuter i texterna ur registret
 *   D03 aritmetik  — exempelens 17 tal oberoende omräknade + nämnda i text
 *   E  genomström  — omatchade frågor → null (API-flödet)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning)
 *   G  antistöld   — tidigare kanoniska → null i detta lager (däribland
 *                    Nästas "vad är DCF?"/"vad är inre värde?"/"vad är
 *                    substansvärde?", Extras "vad är fcf yield?"/"vad är
 *                    price to cash flow?" och Lönsamhetsdjupets "vad är
 *                    wacc?" — sondens dokumenterade gränser)
 *   G2 syskonkärnord — ALLA tidigare lagers kärnord LIVE som frågor → 0
 *   H  kedja       — SIST-lager-invarianten: gamla svar bitidentiska
 *                    med/utan detta lager + ämneskontroller + nya rätt
 *   I  omkastad    — de 3 nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget tidigare lagers (mekaniskt)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär alla 51 kända lager
 *                    i ordning; OKÄNDA komponenter tillåts ENDAST efter
 *                    detta lagrets position (syskon i samma fönster som
 *                    wiras senare — framåtkompatibel dokumentationsplikt)
 *
 * Syskonimporter är TOLERANTA (syskon skriver just nu): hela kedjans 50
 * tidigare lager + fönstrets u1/u2-lager (om redan på disk).
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — inga placeringstips, inga
 * omdömen om enskilda bolag (alla exempel bär påhittade tal).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error(
    "FEL: Node " + process.versions.node + " saknar type stripping. " +
    "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-vardegrund.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltVardegrund, VARDEGRUND_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-vardegrund-fragor.ts")).href);

// Syskonlager — toleranta importer (syskon kan skriva just nu).
function tolerera(fil, exports) {
  try {
    return import(pathToFileURL(join(ROT, "src/lib", fil)).href);
  } catch {
    console.log("NOT  syskonfil ej importbar just nu: " + fil);
    return Object.fromEntries(exports.map((e) => [e, null]));
  }
}
const T = (namn, arr) => tolerera("ai-mentor-" + namn + "-fragor.ts", ["svaraLokalt" + arr.namn, arr.arr]);
const { svaraLokaltMakro, MAKRO_MONSTER } = await T("makro", { namn: "Makro", arr: "MAKRO_MONSTER" });
const { svaraLokaltExtra, EXTRA_MONSTER } = await T("extra", { namn: "Extra", arr: "EXTRA_MONSTER" });
const { svaraLokaltNasta, NASTA_MONSTER } = await T("nasta", { namn: "Nasta", arr: "NASTA_MONSTER" });
const { svaraLokaltKapitalmekanik, KAPITALMEKANIK_MONSTER } = await T("kapitalmekanik", { namn: "Kapitalmekanik", arr: "KAPITALMEKANIK_MONSTER" });
const { svaraLokaltSektor, SEKTOR_MONSTER } = await T("sektor", { namn: "Sektor", arr: "SEKTOR_MONSTER" });
const { svaraLokaltCase, CASE_MONSTER } = await T("case", { namn: "Case", arr: "CASE_MONSTER" });
const { svaraLokaltPraktik, PRAKTIK_MONSTER } = await T("praktik", { namn: "Praktik", arr: "PRAKTIK_MONSTER" });
const { svaraLokaltPortfoljgrund, PORTFOLJGRUND_MONSTER } = await T("portfoljgrund", { namn: "Portfoljgrund", arr: "PORTFOLJGRUND_MONSTER" });
const { svaraLokaltAgande, AGANDE_MONSTER } = await T("agande", { namn: "Agande", arr: "AGANDE_MONSTER" });
const { svaraLokaltRedovisningsdjup, REDOVISNINGSDJUP_MONSTER } = await T("redovisningsdjup", { namn: "Redovisningsdjup", arr: "REDOVISNINGSDJUP_MONSTER" });
const { svaraLokaltDjup, DJUP_MONSTER } = await T("djup", { namn: "Djup", arr: "DJUP_MONSTER" });
const { svaraLokaltHistoria, HISTORIA_MONSTER } = await T("historia", { namn: "Historia", arr: "HISTORIA_MONSTER" });
const { svaraLokaltLonsamhetsdjup, LONSAMHETSDJUP_MONSTER } = await T("lonsamhetsdjup", { namn: "Lonsamhetsdjup", arr: "LONSAMHETSDJUP_MONSTER" });
const { svaraLokaltTsdjup, TSDJUP_MONSTER } = await T("tsdjup", { namn: "Tsdjup", arr: "TSDJUP_MONSTER" });
const { svaraLokaltSkattedjup, SKATTEDJUP_MONSTER } = await T("skattedjup", { namn: "Skattedjup", arr: "SKATTEDJUP_MONSTER" });
const { svaraLokaltBeteendedjup, BETEENDEDJUP_MONSTER } = await T("beteendedjup", { namn: "Beteendedjup", arr: "BETEENDEDJUP_MONSTER" });
const { svaraLokaltRiskdjup, RISKDJUP_MONSTER } = await T("riskdjup", { namn: "Riskdjup", arr: "RISKDJUP_MONSTER" });
const { svaraLokaltRiskmattsdjup, RISKMATTSDJUP_MONSTER } = await T("riskmattsdjup", { namn: "Riskmattsdjup", arr: "RISKMATTSDJUP_MONSTER" });
const { svaraLokaltUtdelningsdjup, UTDELNINGSDJUP_MONSTER } = await T("utdelningsdjup", { namn: "Utdelningsdjup", arr: "UTDELNINGSDJUP_MONSTER" });
const { svaraLokaltForvantningsdjup, FÖRVÄNTNINGSDJUP_MONSTER } = await T("forvantningsdjup", { namn: "Forvantningsdjup", arr: "FÖRVÄNTNINGSDJUP_MONSTER" });
const { svaraLokaltPortfoljbalans, PORTFOLJBALANS_MONSTER } = await T("portfoljbalans", { namn: "Portfoljbalans", arr: "PORTFOLJBALANS_MONSTER" });
const { svaraLokaltStabilitetsdjup, STABILITETSDJUP_MONSTER } = await T("stabilitetsdjup", { namn: "Stabilitetsdjup", arr: "STABILITETSDJUP_MONSTER" });
const { svaraLokaltGrahamgolv, GRAHAMGOLV_MONSTER } = await T("grahamgolv", { namn: "Grahamgolv", arr: "GRAHAMGOLV_MONSTER" });
const { svaraLokaltVarderjustering, VARDERJUSTERING_MONSTER } = await T("varderjustering", { namn: "Varderjustering", arr: "VARDERJUSTERING_MONSTER" });
const { svaraLokaltOptionsdjup, OPTIONS_DJUP_MONSTER } = await T("optionsdjup", { namn: "Optionsdjup", arr: "OPTIONS_DJUP_MONSTER" });
const { svaraLokaltRisklasningsdjup, RISKLÄSNINGSDJUP_MONSTER } = await T("risklasningsdjup", { namn: "Risklasningsdjup", arr: "RISKLÄSNINGSDJUP_MONSTER" });
const { svaraLokaltAvkastningskurva, AVKASTNINGSKURVA_MONSTER } = await T("avkastningskurva", { namn: "Avkastningskurva", arr: "AVKASTNINGSKURVA_MONSTER" });
const { svaraLokaltAvkastningsdjup, AVKASTNINGSDJUP_MONSTER } = await T("avrakningsdjup", { namn: "Avkastningsdjup", arr: "AVKASTNINGSDJUP_MONSTER" });
const { svaraLokaltVarderingsverktyg, VARDERINGSVERKTYG_MONSTER } = await T("varderingsverktyg", { namn: "Varderingsverktyg", arr: "VARDERINGSVERKTYG_MONSTER" });
const { svaraLokaltWarrant, WARRANT_MONSTER } = await T("warrant", { namn: "Warrant", arr: "WARRANT_MONSTER" });
const { svaraLokaltTidsaxel, TIDSAXEL_MONSTER } = await T("tidsaxel", { namn: "Tidsaxel", arr: "TIDSAXEL_MONSTER" });
const { svaraLokaltKapitalbindning, KAPITALBINDNING_MONSTER } = await T("kapitalbindning", { namn: "Kapitalbindning", arr: "KAPITALBINDNING_MONSTER" });
const { svaraLokaltEkosystemdjup, EKOSYSTEMDJUP_MONSTER } = await T("ekosystemdjup", { namn: "Ekosystemdjup", arr: "EKOSYSTEMDJUP_MONSTER" });
const { svaraLokaltHandelsdag, HANDELSDAG_MONSTER } = await T("handelsdag", { namn: "Handelsdag", arr: "HANDELSDAG_MONSTER" });
const { svaraLokaltPortfoljpraktik, PORTFOLJPRAKTIK_MONSTER } = await T("portfoljpraktik", { namn: "Portfoljpraktik", arr: "PORTFOLJPRAKTIK_MONSTER" });
const { svaraLokaltUtdelningskalender, UTDELNINGSKALENDER_MONSTER } = await T("utdelningskalender", { namn: "Utdelningskalender", arr: "UTDELNINGSKALENDER_MONSTER" });
const { svaraLokaltKreditdjup, KREDITDJUP_MONSTER } = await T("kreditdjup", { namn: "Kreditdjup", arr: "KREDITDJUP_MONSTER" });
const { svaraLokaltSektordjup, SEKTORDJUP_MONSTER } = await T("sektordjup", { namn: "Sektordjup", arr: "SEKTORDJUP_MONSTER" });
const { svaraLokaltSektorskola2, SEKTORSKOLA2_MONSTER } = await T("sektorskola2", { namn: "Sektorskola2", arr: "SEKTORSKOLA2_MONSTER" });
const { svaraLokaltBeteendemekanik, BETEENDEMEKANIK_MONSTER } = await T("beteendemekanik", { namn: "Beteendemekanik", arr: "BETEENDEMEKANIK_MONSTER" });
const { svaraLokaltPeMekanik, PE_MEKANIK_MONSTER } = await T("pe-mekanik", { namn: "PeMekanik", arr: "PE_MEKANIK_MONSTER" });
const { svaraLokaltRiskpremie, RISKPREMIE_MONSTER } = await T("riskpremie", { namn: "Riskpremie", arr: "RISKPREMIE_MONSTER" });
const { svaraLokaltOverlevnadsdjup, OVERLEVNADSDJUP_MONSTER } = await T("overlevnadsdjup", { namn: "Overlevnadsdjup", arr: "OVERLEVNADSDJUP_MONSTER" });
const { svaraLokaltKoncernlasning, KONCERNLASNING_MONSTER } = await T("koncernlasning", { namn: "Koncernlasning", arr: "KONCERNLASNING_MONSTER" });
const { svaraLokaltTillvaxtdjup, TILLVAXTDJUP_MONSTER } = await T("tillvaxtdjup", { namn: "Tillvaxtdjup", arr: "TILLVAXTDJUP_MONSTER" });
const { svaraLokaltFaktordjup, FAKTORDJUP_MONSTER } = await T("faktordjup", { namn: "Faktordjup", arr: "FAKTORDJUP_MONSTER" });
const { svaraLokaltBokmastar, BOKMASTAR_MONSTER } = await T("bokmastar", { namn: "Bokmastar", arr: "BOKMASTAR_MONSTER" });
const { svaraLokaltRiskbudget, RISKBUDGET_MONSTER } = await T("riskbudget", { namn: "Riskbudget", arr: "RISKBUDGET_MONSTER" });
const { svaraLokaltKonvertibel, KONVERTIBEL_MONSTER } = await T("konvertibel", { namn: "Konvertibel", arr: "KONVERTIBEL_MONSTER" });
// Syskonet u2:s omgång 23-lager (samma fönster, disk-läge-presedensen) —
// ligger FÖRE detta lager i kedjan och måste finnas med i alla kedje-,
// syskon- och widgetkontroller.
const { svaraLokaltSektorlasning, SEKTORLASNING_MONSTER } = await T("sektorlasning", { namn: "Sektorlasning", arr: "SEKTORLASNING_MONSTER" });
// Syskonet u1:s omgång 23-lager (samma fönster) — wirat EFTER detta lager
// (53:e motorn enligt fönstrets dokumenterade ordning); medtas här för att
// kedjekontrollerna ska spegla den faktiska kompositionen.
const { svaraLokaltRealekonomi, REALEKONOMI_MONSTER } = await T("realekonomi", { namn: "Realekonomi", arr: "REALEKONOMI_MONSTER" });

// ── Testharness ─────────────────────────────────────────────────────────────
let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) {
    pass++;
    console.log("PASS  " + namn + (detalj ? "  — " + detalj : ""));
  } else {
    fail++;
    console.log("FAIL  " + namn + (detalj ? "  — " + detalj : ""));
  }
}

// ── FALL A: de tre nya kanoniska med flerkällskrav ──────────────────────────
const NYA = [
  { fraga: "Vad är motiverat värde?", amne: "intrinsic", slug: "vm-02-intrinsic-value" },
  { fraga: "Vad är realoptioner?", amne: "realoptioner", slug: "vm-05-realoptioner" },
  { fraga: "Vad är kassaflödesavkastning?", amne: "kassaflodesavkastning", slug: "vm-07-free-cash-flow-yield" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltVardegrund(f.fraga, KURSREGISTER);
  if (!svar) {
    kontroll(nr + " " + f.amne, false, "inget lokalt svar på: '" + f.fraga + "'");
    return;
  }
  const amneOk = svar.amne === f.amne;
  const kallaOk = svar.kalla.slug === f.slug;
  const kallorFinns = Array.isArray(svar.kallor) && svar.kallor.length >= 3;
  const kallradOk = svar.text.includes("📖 Källor (");
  const kurslankar = svar.handlings.filter((h) => h.lank.startsWith("/kurser/"));
  const kurslankarOk = kurslankar.length >= 2;
  kontroll(
    nr + " " + f.amne + " — '" + f.fraga + "'",
    amneOk && kallaOk && kallorFinns && kallradOk && kurslankarOk,
    "ämne=" + svar.amne + " · källa=" + svar.kalla.slug +
      " · källor=" + (svar.kallor ? svar.kallor.length : 0) +
      " · kurslänkar=" + kurslankar.length,
  );
});

// ── FALL A2: wiring — import + kedjerad i chat-widget.tsx, lager 51 ─────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('from "@/lib/ai-mentor-vardegrund-fragor"');
  const rad = widget.split("\n").find((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)")) ?? "";
  const minPos = rad.indexOf("svaraLokaltVardegrund(");
  const fore = ["svaraLokaltKonvertibel("];
  const ordningOk = fore.every((k) => rad.indexOf(k) !== -1 && rad.indexOf(k) < minPos);
  kontroll(
    "A2 wiring — import + kedjerad i chat-widget.tsx (vardegrund lager 51, efter konvertibeln)",
    importOk && minPos !== -1 && ordningOk,
    importOk && minPos !== -1
      ? ordningOk ? "import ✓ · efter omgång 22:s konvertibel ✓" : "import ✓ men ordning fel"
      : "import/kedjerad saknas — kopplingen bruten",
  );
}

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar motiverat varde?", amne: "intrinsic" }, // diafri
  { fraga: "vad är intrinsic value?", amne: "intrinsic" }, // engelska grundformen
  { fraga: "hur räknar man ut motiverat värde?", amne: "intrinsic" }, // räkneformen
  { fraga: "vad menas med verkligt värde?", amne: "intrinsic" }, // svenska paret
  { fraga: "vad är fair value?", amne: "intrinsic" }, // engelska paret
  { fraga: "vad är ett motiverat aktiepris?", amne: "intrinsic" }, // prisformen
  { fraga: "vad ar realoptioner?", amne: "realoptioner" }, // diafri
  { fraga: "berätta om realoption?", amne: "realoptioner" }, // singular
  { fraga: "vad betyder realoptionen?", amne: "realoptioner" }, // bestämmand... böjd form (stav-tolerans)
  { fraga: "vad ar kassaflodesavkastning?", amne: "kassaflodesavkastning" }, // diafri
  { fraga: "hur räknar man ut kassaflödesavkastningen?", amne: "kassaflodesavkastning" }, // böjd form
  { fraga: "vad är asset based valuation?", amne: "kassaflodesavkastning" }, // engelska balansvägen
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltVardegrund(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltVardegrund(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltVardegrund(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// Hela kedjan exakt som chat-widget.tsx komponerar den (51 motorer).
const LED = [
  ["makro", svaraLokaltMakro], ["extra", svaraLokaltExtra], ["bas", svaraLokalt],
  ["nästa", svaraLokaltNasta], ["kapitalmekanik", svaraLokaltKapitalmekanik],
  ["sektor", svaraLokaltSektor], ["case", svaraLokaltCase], ["praktik", svaraLokaltPraktik],
  ["portföljgrund", svaraLokaltPortfoljgrund], ["ägande", svaraLokaltAgande],
  ["redovisningsdjup", svaraLokaltRedovisningsdjup], ["djup", svaraLokaltDjup],
  ["historia", svaraLokaltHistoria], ["lönsamhetsdjup", svaraLokaltLonsamhetsdjup],
  ["tsdjup", svaraLokaltTsdjup], ["skattedjup", svaraLokaltSkattedjup],
  ["beteendedjup", svaraLokaltBeteendedjup], ["riskdjup", svaraLokaltRiskdjup],
  ["riskmåttsdjup", svaraLokaltRiskmattsdjup], ["utdelningsdjup", svaraLokaltUtdelningsdjup],
  ["förväntningsdjup", svaraLokaltForvantningsdjup], ["portföljbalans", svaraLokaltPortfoljbalans],
  ["stabilitetsdjup", svaraLokaltStabilitetsdjup], ["grahamgolv", svaraLokaltGrahamgolv],
  ["värderjustering", svaraLokaltVarderjustering], ["optionsdjup", svaraLokaltOptionsdjup],
  ["riskläsningsdjup", svaraLokaltRisklasningsdjup], ["avkastningskurva", svaraLokaltAvkastningskurva],
  ["avkastningsdjup", svaraLokaltAvkastningsdjup], ["värderingsverktyg", svaraLokaltVarderingsverktyg],
  ["warrant", svaraLokaltWarrant], ["tidsaxel", svaraLokaltTidsaxel],
  ["kapitalbindning", svaraLokaltKapitalbindning], ["ekosystemdjup", svaraLokaltEkosystemdjup],
  ["handelsdag", svaraLokaltHandelsdag], ["portföljpraktik", svaraLokaltPortfoljpraktik],
  ["utdelningskalender", svaraLokaltUtdelningskalender], ["kreditdjup", svaraLokaltKreditdjup],
  ["sektordjup", svaraLokaltSektordjup], ["sektorskola2", svaraLokaltSektorskola2],
  ["beteendemekanik", svaraLokaltBeteendemekanik], ["pe-mekanik", svaraLokaltPeMekanik],
  ["riskpremie", svaraLokaltRiskpremie], ["överlevnadsdjup", svaraLokaltOverlevnadsdjup],
  ["koncernläsning", svaraLokaltKoncernlasning], ["tillväxtdjup", svaraLokaltTillvaxtdjup],
  ["faktordjup", svaraLokaltFaktordjup], ["bokmastar", svaraLokaltBokmastar],
  ["riskbudget", svaraLokaltRiskbudget], ["konvertibel", svaraLokaltKonvertibel],
  ["sektorlasning", svaraLokaltSektorlasning],
  ["vardegrund", svaraLokaltVardegrund],
  ["realekonomi", svaraLokaltRealekonomi],
];
const helakedjan = (fraga) => {
  for (const [, f] of LED) {
    if (!f) continue;
    const s = f(fraga, KURSREGISTER);
    if (s) return s;
  }
  return null;
};
// Kedjan UTAN detta lager (SIST-i-fönstret-invarianten gäller vardegrund:
// kedjan utan vardegrund = 52 motorer, realekonomin sist).
const UTAN_VARDEGRUND = LED.filter(([namn]) => namn !== "vardegrund");
const kedjaUtan = (fraga) => {
  for (const [, f] of UTAN_VARDEGRUND) {
    if (!f) continue;
    const s = f(fraga, KURSREGISTER);
    if (s) return s;
  }
  return null;
};

// ── FALL D: källaäkthet + knappar + register + aritmetik ────────────────────
{
  const slugFinns = new Set(KURSREGISTER.map((r) => r.slug));
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltVardegrund(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const k of svar.kallor ?? []) {
      if (k.slug && !slugFinns.has(k.slug)) FEL.push("källa '" + k.slug + "' (" + f.amne + ") finns ej i registret");
    }
    if ((svar.kallor ?? []).length > 0 && svar.kallor[0].slug !== svar.kalla.slug) {
      FEL.push("kallor[0] (" + svar.kallor[0].slug + ") != kalla (" + svar.kalla.slug + ") i " + f.amne);
    }
    for (const h of svar.handlings) {
      if (h.lank.startsWith("/kurser/")) {
        const s = h.lank.slice("/kurser/".length);
        if (!slugFinns.has(s)) FEL.push("kurslänk '" + s + "' (" + f.amne + ") finns ej i registret");
      } else if (!h.lank.startsWith("fragor:")) {
        FEL.push("oväntad länk '" + h.lank + "' i " + f.amne);
      }
    }
    if (svar.fordjupa && svar.fordjupa.lank.startsWith("/kurser/") && !slugFinns.has(svar.fordjupa.lank.slice("/kurser/".length))) {
      FEL.push("fordjupa '" + svar.fordjupa.lank + "' (" + f.amne + ") finns ej i registret");
    }
  }
  kontroll("D01 källaäkthet — inga fantomslugar i de nya svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : KURSREGISTER.length + " kurser genomsökta");

  // fragor:-knappar skall landa i HELA kedjan — detta lagers knappar länkar
  // medvetet ÖVER lagergränserna (DCF → nästa, köpoption → optionsdjupet,
  // kassaflödesanalys → extra; deras dokumenterade ägande) enligt
  // konventionen "knappen landar aldrig null".
  for (const f of NYA) {
    const svar = svaraLokaltVardegrund(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (53 motorer)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuter i
  // texterna ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const vmAntal = KURSREGISTER.filter((r) => r.kategori === "VÄRDERINGSMETODER").length;
  const vrAntal = KURSREGISTER.filter((r) => r.kategori === "VÄRDERING").length;
  const vm02 = KURSREGISTER.find((r) => r.slug === "vm-02-intrinsic-value");
  const vm05 = KURSREGISTER.find((r) => r.slug === "vm-05-realoptioner");
  const vm07 = KURSREGISTER.find((r) => r.slug === "vm-07-free-cash-flow-yield");
  const s1 = svaraLokaltVardegrund(NYA[0].fraga, KURSREGISTER);
  const s2 = svaraLokaltVardegrund(NYA[1].fraga, KURSREGISTER);
  const s3 = svaraLokaltVardegrund(NYA[2].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — VÄRDERINGSMETODER=" + vmAntal + " · VÄRDERING=" + vrAntal +
      " · vm-02/vm-05/vm-07 " + (vm02 ? vm02.minuter : "?") + "/" + (vm05 ? vm05.minuter : "?") + "/" + (vm07 ? vm07.minuter : "?") + " min",
    !!s1 && !!s2 && !!s3 &&
      s1.text.includes("I värderingsmetoder finns " + vmAntal + " kurser och i värdering " + vrAntal) &&
      s2.text.includes("I värderingsmetoder finns " + vmAntal + " kurser") &&
      s3.text.includes("I värderingsmetoder finns " + vmAntal + " kurser") &&
      (vm02 ? s1.text.includes(vm02.minuter + " min") : false) &&
      (vm05 ? s2.text.includes(vm05.minuter + " min") : false) &&
      (vm07 ? s3.text.includes(vm07.minuter + " min") : false),
    "texterna ska bära registrets egna tal",
  );

  // Aritmetik — oberoende omräkning av exempelens alla tal.
  const r1 = (x) => Math.round(x * 100) / 100;
  const aar1 = 10 * 1.05, aar2 = aar1 * 1.05, aar3 = aar2 * 1.05;
  const nv1 = aar1 / 1.08, nv2 = aar2 / 1.08 ** 2, nv3 = aar3 / 1.08 ** 3;
  const summaNV = nv1 + nv2 + nv3;
  const tv = (aar3 * 1.02) / 0.06;
  const tvN = tv / 1.08 ** 3;
  const totalt = summaNV + tvN;
  const nv1b = aar1 / 1.09, nv2b = aar2 / 1.09 ** 2, nv3b = aar3 / 1.09 ** 3;
  const tvb = (aar3 * 1.02) / 0.07;
  const totaltb = nv1b + nv2b + nv3b + tvb / 1.09 ** 3;
  const ARIT = [
    ["DCF år 1–3 = 10,50 · 11,03 · 11,58", new RegExp("10,50 · 11,03 · 11,58 kronor").test(s1.text) && r1(aar1) === 10.5 && r1(aar2) === 11.03 && r1(aar3) === 11.58],
    ["nuvärden 9,72 + 9,45 + 9,19 = 28,36", /9,72 \+ 9,45 \+ 9,19 = 28,36 kronor/.test(s1.text) && r1(nv1) === 9.72 && r1(nv2) === 9.45 && r1(nv3) === 9.19 && r1(summaNV) === 28.36],
    ["TV 11,58×1,02÷0,06 = 196,80 → 156,22", /11,58 × 1,02 ÷ \(0,08 − 0,02\) = 196,80 kronor/.test(s1.text) && /diskonterat till idag 156,22/.test(s1.text) && r1(tv) === 196.8 && r1(tvN) === 156.22],
    ["totalt 28,36 + 156,22 = 184,58 ≈ 184,6", /28,36 \+ 156,22 = 184,58 ≈ 184,6 kronor/.test(s1.text) && r1(totalt) === 184.59],
    ["terminalandel 156,22÷184,6 = 84,6 %", /156,22 ÷ 184,6 = 84,6 procent/.test(s1.text) && Math.round((tvN / totalt) * 1000) / 10 === 84.6],
    ["kurs 150 ÷ 184,6 = 0,81 (19 % under)", /150 ÷ 184,6 = 0,81/.test(s1.text) && /19 procent under/.test(s1.text) && Math.round((150 / totalt) * 100) / 100 === 0.81],
    ["WACC-läxan 8→9 %: 158,1 = −14 %", /faller till 158,1 kronor = −14 procent/.test(s1.text) && Math.round(totaltb * 10) / 10 === 158.1 && Math.round((1 - totaltb / totalt) * 100) === 14],
    ["gruva idag 100 − 120 = −20", /100 − 120 = −20 miljoner/.test(s2.text) && Math.abs(100 - 120 - -20) < 1e-9],
    ["träd 0,5×30 + 0,5×0 = +15", /0,5 × 30 \+ 0,5 × 0 = \+15 miljoner/.test(s2.text) && Math.abs(0.5 * 30 - 15) < 1e-9],
    ["flexibilitet 15 − (−20) = 35", /15 − \(−20\) = 35 miljoner/.test(s2.text) && Math.abs(15 - -20 - 35) < 1e-9],
    ["nedfart 70 − 120 = −50", /70 − 120 = −50/.test(s2.text) && Math.abs(70 - 120 - -50) < 1e-9],
    ["yield 4 ÷ 100 = 4,0 %", /4 ÷ 100 = 4,0/.test(s3.text) && Math.abs(4 / 100 - 0.04) < 1e-9],
    ["P/FCF 100 ÷ 4 = 25", /100 ÷ 4 = 25/.test(s3.text) && Math.abs(100 / 4 - 25) < 1e-9],
    ["P/CF 100 ÷ 6 = 16,7", /100 ÷ 6 = 16,7/.test(s3.text) && r1(100 / 6) === 16.67],
    ["P/B 100 ÷ 80 = 1,25", /100 ÷ 80 = 1,25/.test(s3.text) && Math.abs(100 / 80 - 1.25) < 1e-9],
  ];
  const aritFel = ARIT.filter(([, ok]) => !ok).map(([n]) => n);
  kontroll("D03 aritmetik — exempelens 15 kontrollposter exakta och nämnda", aritFel.length === 0,
    aritFel.length ? "saknas/fel: " + aritFel.join(", ") : "DCF-kedjan · gruvträdet · yield-familjen ✓");
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Ystad imorgon?",
  "Vem skrev Pippi Långstrump?",
  "Hur många strängar har en gitarr?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltVardegrund(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|rekommenderar att du köper|teckna)\b[^.]{0,30}\b(aktie|bolag|portfölj)\b/i;
  const VARDERAD = /\b(välj|byt till|satsa på)\b[^.]{0,40}\b(aktie|bolag|portfölj)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltVardegrund(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    if (VARDERAD.test(svar.text)) FEL.push(f.amne + ": värderings-rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
    // Utdrag ur 2007:528-utbildningskontraktet ska finnas i varje svar.
    if (!/utbildning i (en metod|hur)/.test(svar.text)) {
      FEL.push(f.amne + ": saknar utbildningsdisclaimer");
    }
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser, utbildningsdisclaimer i vardegrund-svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — tidigare kanoniska ger null i detta lager ───────────
const GAMLA = [
  // Sondens dokumenterade gränser — ägarnas frågor får ALDRIG stjälas här:
  { fraga: "Vad är DCF?", amne: null }, // NÄSTAS DCF-familj (rond 2:s dödare)
  { fraga: "Vad är reverse dcf?", amne: null }, // nästas sammansättning
  { fraga: "Vad är omvänd dcf?", amne: null }, // nästas sammansättning
  { fraga: "Vad är inre värde?", amne: null }, // nästas formulering
  { fraga: "Vad är substansvärde?", amne: null }, // nästas substans-familj
  { fraga: "Vad är substansbaserad värdering?", amne: null }, // nästas
  { fraga: "Vad är tillgångsbaserad värdering?", amne: null }, // nästas (rond 3)
  { fraga: "Vad är fcf yield?", amne: null }, // EXTRAS yield-familj
  { fraga: "Vad är free cash flow yield?", amne: null }, // extras
  { fraga: "Vad är price to cash flow?", amne: null }, // extras
  { fraga: "Vad är wacc?", amne: null }, // LÖNSAMHETSDJUPETS (rond 3)
  { fraga: "Vad är optioner?", amne: null }, // nästas option-familj
  { fraga: "Vad är en köpoption?", amne: null }, // optionsdjupets
  { fraga: "Vad är verkliga optioner?", amne: null }, // nästas (dokumenterad risk, rond 3)
  { fraga: "Vad är terminalvärdet?", amne: null }, // NULL i kedjan men INTE detta lagers (vr-07 är källa)
  // Tidigare lagers kanoniska (ett urval per familj):
  { fraga: "Vad är styrräntan?", amne: null },
  { fraga: "Vad är kassaflödesanalys?", amne: null },
  { fraga: "Vad är AKM1?", amne: null },
  { fraga: "Hur analyserar jag banker?", amne: null },
  { fraga: "Vad är blankning?", amne: null },
  { fraga: "Vad är diversifiering?", amne: null },
  { fraga: "Vad är en värderingsmultipel?", amne: null },
  { fraga: "Vad är normalisering?", amne: null },
  { fraga: "Vad är scenarioanalys?", amne: null },
  { fraga: "Vad är en net-net och NCAV?", amne: null },
  { fraga: "Vad är rörelsekapital?", amne: null },
  { fraga: "Vad är SAM-viktningen?", amne: null },
  { fraga: "Hur analyserar jag SaaS-bolag?", amne: null },
  { fraga: "Vad är ex-dagen?", amne: null },
  { fraga: "Vad är kreditpremien?", amne: null },
  { fraga: "Vad är volatilitetsbudgeten?", amne: null },
  { fraga: "Vad är en konvertibel?", amne: null },
  { fraga: "Hur analyserar jag ett energibolag?", amne: null }, // u2 sektorlasning (samma fönster)
  { fraga: "Hur analyserar jag ett telekombolag?", amne: null }, // u2 sektorlasning
  { fraga: "Vad är realekonomin?", amne: null }, // u1 realekonomi (samma fönster)
];
{
  const stulna = GAMLA.filter((f) => svaraLokaltVardegrund(f.fraga, KURSREGISTER) !== null);
  kontroll(
    "G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i vardegrund-lagret",
    stulna.length === 0,
    stulna.length ? stulna.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltVardegrund(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓",
  );
}

// ── FALL G2: SYSKONKÄRNORD — ALLA tidigare kärnord LIVE som frågor ──────────
{
  const FEL = [];
  const SYSKON = [
    [MONSTER, "bas"], [MAKRO_MONSTER, "makro"], [EXTRA_MONSTER, "extra"], [NASTA_MONSTER, "nästa"],
    [KAPITALMEKANIK_MONSTER, "kapitalmekanik"], [SEKTOR_MONSTER, "sektor"], [CASE_MONSTER, "case"],
    [PRAKTIK_MONSTER, "praktik"], [PORTFOLJGRUND_MONSTER, "portföljgrund"], [AGANDE_MONSTER, "ägande"],
    [REDOVISNINGSDJUP_MONSTER, "redovisningsdjup"], [DJUP_MONSTER, "djup"], [HISTORIA_MONSTER, "historia"],
    [LONSAMHETSDJUP_MONSTER, "lönsamhet"], [TSDJUP_MONSTER, "tsdjup"], [SKATTEDJUP_MONSTER, "skattedjup"],
    [BETEENDEDJUP_MONSTER, "beteendedjup"], [RISKDJUP_MONSTER, "riskdjup"], [RISKMATTSDJUP_MONSTER, "riskmåttsdjup"],
    [UTDELNINGSDJUP_MONSTER, "utdelningsdjup"], [FÖRVÄNTNINGSDJUP_MONSTER, "förväntningsdjup"],
    [PORTFOLJBALANS_MONSTER, "portföljbalans"], [STABILITETSDJUP_MONSTER, "stabilitetsdjup"],
    [GRAHAMGOLV_MONSTER, "grahamgolv"], [VARDERJUSTERING_MONSTER, "värderjustering"],
    [OPTIONS_DJUP_MONSTER, "optionsdjup"], [RISKLÄSNINGSDJUP_MONSTER, "riskläsningsdjup"],
    [AVKASTNINGSKURVA_MONSTER, "avkastningskurva"], [AVKASTNINGSDJUP_MONSTER, "avkastningsdjup"],
    [VARDERINGSVERKTYG_MONSTER, "värderingsverktyg"], [WARRANT_MONSTER, "warrant"],
    [TIDSAXEL_MONSTER, "tidsaxel"], [KAPITALBINDNING_MONSTER, "kapitalbindning"],
    [EKOSYSTEMDJUP_MONSTER, "ekosystemdjup"], [HANDELSDAG_MONSTER, "handelsdag"],
    [PORTFOLJPRAKTIK_MONSTER, "portföljpraktik"], [UTDELNINGSKALENDER_MONSTER, "utdelningskalender"],
    [KREDITDJUP_MONSTER, "kreditdjup"], [SEKTORDJUP_MONSTER, "sektordjup"],
    [SEKTORSKOLA2_MONSTER, "sektorskola2"], [BETEENDEMEKANIK_MONSTER, "beteendemekanik"],
    [PE_MEKANIK_MONSTER, "pe-mekanik"], [RISKPREMIE_MONSTER, "riskpremie"],
    [OVERLEVNADSDJUP_MONSTER, "överlevnadsdjup"], [KONCERNLASNING_MONSTER, "koncernläsning"],
    [TILLVAXTDJUP_MONSTER, "tillväxtdjup"], [FAKTORDJUP_MONSTER, "faktordjup"],
    [BOKMASTAR_MONSTER, "bokmastar"], [RISKBUDGET_MONSTER, "riskbudget"],
    [KONVERTIBEL_MONSTER, "konvertibel"], [SEKTORLASNING_MONSTER, "sektorlasning"],
    [REALEKONOMI_MONSTER, "realekonomi"],
  ];
  let antal = 0;
  for (const [monster, namn] of SYSKON) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) {
      for (const k of m.karnord ?? []) {
        antal++;
        const svar = svaraLokaltVardegrund("vad är " + k + "?", KURSREGISTER);
        if (svar !== null) FEL.push("'" + k + "' (" + namn + ") ⇒ " + svar.amne);
      }
    }
  }
  kontroll(
    "G2 syskonkärnord — " + antal + " kärnord LIVE som frågor → 0 fångster",
    FEL.length === 0,
    FEL.length ? FEL.length + " krockar: " + FEL.slice(0, 5).join(" | ") : "0 krockar mot " + (SYSKON.filter((s) => Array.isArray(s[0])).length) + " lager",
  );
}

// ── FALL H: hela kedjan (som chat-widget.tsx) — SIST-lager-invarianten ──────
{
  // Ett SIST-lager ändrar ALDRIG ett tidigare svar: kedjan med/utan detta
  // lager ger identiska svar på alla GAMLA frågor.
  const fel = [];
  for (const f of GAMLA) {
    const med = helakedjan(f.fraga);
    if (med === null) continue; // API-flödet — oförändrat
    if (med.amne === "intrinsic" || med.amne === "realoptioner" || med.amne === "kassaflodesavkastning") {
      fel.push("'" + f.fraga + "' fångades av SIST-lagret (ämne=" + med.amne + ")");
    }
  }
  // …och de tre nya kanoniska når rätt lager genom HELA kedjan.
  for (const f of NYA) {
    const med = helakedjan(f.fraga);
    if (!med) fel.push("'" + f.fraga + "' null i hela kedjan");
    else if (med.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + med.amne + " (väntat " + f.amne + ")");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (SIST-invarianten) + " + NYA.length + " nya når rätt lager (53 motorer, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + 3) + "/" + (GAMLA.length + 3) + " rätt",
  );
}

// ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN detta ───────
{
  const tjuvade = NYA.filter((f) => kedjaUtan(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 3 nya kanoniska ger null i kedjan UTAN vardegrund-lagret",
    tjuvade.length === 0,
    tjuvade.length ? tjuvade.map((f) => "'" + f.fraga + "' ⇒ " + kedjaUtan(f.fraga).amne + " i tidigare lager").join(" | ") : "0 tidigare fångster ✓",
  );
}

// ── FALL J: kärnordsdisjunktion MEKANISKT — LIVE ur modulerna ───────────────
{
  const dia = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  const tidigare = new Set();
  const ALLA = [
    MONSTER, EXTRA_MONSTER, MAKRO_MONSTER, NASTA_MONSTER, KAPITALMEKANIK_MONSTER,
    SEKTOR_MONSTER, CASE_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER,
    REDOVISNINGSDJUP_MONSTER, DJUP_MONSTER, HISTORIA_MONSTER, LONSAMHETSDJUP_MONSTER,
    TSDJUP_MONSTER, SKATTEDJUP_MONSTER, BETEENDEDJUP_MONSTER, RISKDJUP_MONSTER,
    RISKMATTSDJUP_MONSTER, UTDELNINGSDJUP_MONSTER, FÖRVÄNTNINGSDJUP_MONSTER,
    PORTFOLJBALANS_MONSTER, STABILITETSDJUP_MONSTER, GRAHAMGOLV_MONSTER,
    VARDERJUSTERING_MONSTER, OPTIONS_DJUP_MONSTER, RISKLÄSNINGSDJUP_MONSTER,
    AVKASTNINGSKURVA_MONSTER, AVKASTNINGSDJUP_MONSTER, VARDERINGSVERKTYG_MONSTER,
    WARRANT_MONSTER, TIDSAXEL_MONSTER, KAPITALBINDNING_MONSTER, EKOSYSTEMDJUP_MONSTER,
    HANDELSDAG_MONSTER, PORTFOLJPRAKTIK_MONSTER, UTDELNINGSKALENDER_MONSTER,
    KREDITDJUP_MONSTER, SEKTORDJUP_MONSTER, SEKTORSKOLA2_MONSTER, BETEENDEMEKANIK_MONSTER,
    PE_MEKANIK_MONSTER, RISKPREMIE_MONSTER, OVERLEVNADSDJUP_MONSTER, KONCERNLASNING_MONSTER,
    TILLVAXTDJUP_MONSTER, FAKTORDJUP_MONSTER, BOKMASTAR_MONSTER, RISKBUDGET_MONSTER,
    KONVERTIBEL_MONSTER, SEKTORLASNING_MONSTER, REALEKONOMI_MONSTER,
  ];
  for (const monster of ALLA) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of VARDEGRUND_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — VARDEGRUND_MONSTER vs " + (tidigare.size > 0 ? "alla tidigare lager" : "0 lager") + " (" + tidigare.size + " kärnord)",
    krock.length === 0,
    krock.length ? krock.join(" | ") : "0 överlapp ✓",
  );
}

// ── FALL L: WIDGET-SYNK — kedjeraden i chat-widget.tsx bär alla lager ──────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const KOMPONENTER = [
    // R154-v3 (rond 154, huvudagenten [Φ]): HELA widgetkedjan i exakt ordning —
    // 81 lager. v2:s regex tappade nakna "svaraLokalt" + siffersuffix (grinden
    // fångade det: "okänd kedjekomponent"). Dokumentationsplikten (V219) full-
    // följdas: arrayen speglar hela kedjan, som fönsterharmoniserarna jagade.
    // Provenienskommentarer från V219/o24/o27/o31/v1/v2 bevaras nedan.
    // R154-v2-normalisering (rond 154, huvudagenten [Φ]): arrayen omskriven till
    // WIDGETENS exakta kedjeordning (mängden oförändrad) — v1:s infogning före
    // marknadsrytm-ankaret gav fel ordning för tidigt hörande komponenter.
    // Kommentarsproveniens nedan bevarad i ursprunglig ordning.
    // Omgång 24-harmonisering (s6-u3): våg 189:s marknadsmekanik wireades utan
    // harmonisering — baslinjens röda L01; kedjeordning efter case (kedjetestet G).
    // Omgång 23 (s6-u2, samma fönster): sektorlasning — före vardegrund
    // (fönstrets dokumenterade ordning: … → konvertibel (50) → sektor-
    // lasning (51) → vardegrund (52)).
    // Omgång 23 (s6-u3): vardegrund — 52:a motorn i fönstrets ordning.
    // Syskon som wiras EFTER detta lager tillåts som okända komponenter
    // ENDAST på senare positioner — framåtkompatibel dokumentationsplikt
    // (deras tester äger sin anmälan).
    // Omgång 23 (s6-u1, samma fönster): realekonomi — EFTER vardegrund
    // (53:e motorn), fönstrets dokumenterade ordning.
    // Omgång 24 (s6-u3-harmonisering): fönstrets tre sista komponenter i
    // wireningsordning — u1 försäkring (55) · u2 moatdjup (56) · u3 nya
    // territorier (57). Idempotent: körs igen ⇒ 0 ändringar.
    // Omgång 25-harmonisering (s6-u2, 2026-09-20): fönstrets tre nya komponenter i
    // kedjeordning (u1 etfmekanik 59 · s6-u2 kontrahent 60 · u3 marknadsrytm 61).
    // Omgång 25-tillägg (s6-u2 försök 2, 2026-09-20): grundmultiplarna —
    // 61:a motorn, FÖRE marknadsrytm (deras SIST-deklaration; v04 P/S + v05 P/B).
    // Omgång 26 (manifest auto-s6-1789890903364 — ordningspasset efter två
    // krockade harmoniseringsvågor): fönstrets tre i KEDJEORDNING — riskadress
    // (s6-u1, 62:a) · balansdjup (s6-u2, 63:e) · optionshantverk (s6-u3, 64:e)
    // — FÖRE marknadsrytm (deras SIST-deklaration).
    // V219-harmonisering (rond 114): pengarstid wireades i widgeten utan svitharmonisering
    // (föregångare: 54e7a59e studio: auto s6-u2 AI-MENTORN +2 FÖRHANDSFRÅGOR — PENGARNAS TID OCH ORD) — mellan optionshantverk och marknadsrytm.
    // Omgång 27 (auto-s6-1789912510460, s6-u2): volatilitetsmekanik — slutsvepet.
    // Fönster 31-harmonisering (s6-u3, _s6u3o31-): fönstrets tre nya komponenter i
    // widgetordning — u1 stålsektor (74:e) · u2 casepraktik (75:e) · u3 beteendefallor
    // (76:e) — FÖRE marknadsrytm (deras SIST-deklaration). Idempotent.
    // komponenter wireades i widgeten utan full svitharmonisering (V219-läxan):
    // kategoristangning (1ea8ccb8+932659c9) · banksektorn (a092db0e) · notlasning ·
    // nykull · nyfodda · skuldordning · valideringsfonster — här i widgetordning.
    "svaraLokaltMakro", "svaraLokaltExtra", "svaraLokaltModernaRisker", "svaraLokalt",
    "svaraLokaltNasta", "svaraLokaltKapitalmekanik", "svaraLokaltSektor", "svaraLokaltCase",
    "svaraLokaltMarknadsmekanik", "svaraLokaltPraktik", "svaraLokaltValutamekanik", "svaraLokaltPortfoljgrund",
    "svaraLokaltAgande", "svaraLokaltRedovisningsdjup", "svaraLokaltDjup", "svaraLokaltHistoria",
    "svaraLokaltLonsamhetsdjup", "svaraLokaltTsdjup", "svaraLokaltSkattedjup", "svaraLokaltBeteendedjup",
    "svaraLokaltRiskdjup", "svaraLokaltRiskmattsdjup", "svaraLokaltUtdelningsdjup", "svaraLokaltForvantningsdjup",
    "svaraLokaltPortfoljbalans", "svaraLokaltStabilitetsdjup", "svaraLokaltGrahamgolv", "svaraLokaltVarderjustering",
    "svaraLokaltOptionsdjup", "svaraLokaltRisklasningsdjup", "svaraLokaltAvkastningskurva", "svaraLokaltAvkastningsdjup",
    "svaraLokaltVarderingsverktyg", "svaraLokaltWarrant", "svaraLokaltTidsaxel", "svaraLokaltKapitalbindning",
    "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag", "svaraLokaltPortfoljpraktik", "svaraLokaltUtdelningskalender",
    "svaraLokaltKreditdjup", "svaraLokaltSektordjup", "svaraLokaltSektorskola2", "svaraLokaltBeteendemekanik",
    "svaraLokaltPeMekanik", "svaraLokaltRiskpremie", "svaraLokaltOverlevnadsdjup", "svaraLokaltKoncernlasning",
    "svaraLokaltTillvaxtdjup", "svaraLokaltFaktordjup", "svaraLokaltBokmastar", "svaraLokaltRiskbudget",
    "svaraLokaltKonvertibel", "svaraLokaltSektorlasning", "svaraLokaltVardegrund", "svaraLokaltRealekonomi",
    "svaraLokaltForsakring", "svaraLokaltMoatdjup", "svaraLokaltNyaTerritorier", "svaraLokaltEtfmekanik",
    "svaraLokaltKontrahent", "svaraLokaltMultipel", "svaraLokaltRiskadress", "svaraLokaltBalansdjup",
    "svaraLokaltOptionshantverk", "svaraLokaltPengarstid", "svaraLokaltVolatilitetsmekanik", "svaraLokaltCoinvest",
    "svaraLokaltTvangsmekanik", "svaraLokaltHandelsemotor", "svaraLokaltLonsamhetsgrund", "svaraLokaltKemisektor",
    "svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor", "svaraLokaltKategoristangning",
    "svaraLokaltBanksektorn", "svaraLokaltNotlasning", "svaraLokaltNykull", "svaraLokaltNyfodda",
    "svaraLokaltSkuldordning", "svaraLokaltValideringsfonster", "svaraLokaltEnhetsekonomi", "svaraLokaltNatverkseffekter", "svaraLokaltSlutstenarna", "svaraLokaltMarknadsrytm",
  ];
  const kedjerader = widget.split("\n").filter((rad) => rad.includes("svaraLokaltMakro(q, KURSREGISTER)"));
  const FEL = [];
  if (kedjerader.length !== 1) FEL.push("hittade " + kedjerader.length + " kedjerader (väntat exakt 1)");
  const rad = kedjerader[0] ?? "";
  let senaste = -1;
  for (const komp of KOMPONENTER) {
    const pos = rad.indexOf(komp + "(");
    if (pos === -1) FEL.push(komp + " saknas i kedjeraden");
    else if (pos < senaste) FEL.push(komp + " i fel ordning i kedjeraden");
    else senaste = pos;
  }
  if (!widget.includes('from "@/lib/ai-mentor-vardegrund-fragor"')) {
    FEL.push("importen av ai-mentor-vardegrund-fragor saknas");
  }
  // Okända kedjekomponenter: tillåtna ENDAST efter detta lagrets position
  // (syskon som wiras senare i samma fönster); okända FÖRE underkänns —
  // de skulle kunna ändra SIST-invarianten (fall H).
  const minPos = rad.indexOf("svaraLokaltVardegrund(");
    // Fönstret efter omgång 27 (s6-u2, _s6u2o28-): ModernaRisker + Coinvest+Tvangsmekanik i widgetordning — läkning av omgång 27:s öppna harmoniseringsskuld
  // (ModernaRisker/Coinvest wireades utan familjepass; dokumentationsplikten, rond 114-läxan).
    // Fönster 29 (s6-u2, _s6u2o29-): Handelsemotor i widgetordning FÖRE marknadsrytm —
  // svitharmoniseringens dokumentationsplikt (rond 114-läxan: widget-wire ⇒ harmonisering i samma leverans).
    // Fönster 29 (s6-u1, _s6u1o29-): kemisektor i widgetordning (efter lonsamhetsgrund,
  // före marknadsrytm) — svitharmoniseringens dokumentationsplikt (V219-läxan).
  const kanda = new Set([...KOMPONENTER, "svaraLokaltStalsektor", "svaraLokaltCasepraktik", "svaraLokaltBeteendefallor", "svaraLokaltKemisektor"]);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (kanda.has(namn)) continue;
    if (match.index < minPos) FEL.push("okänd kedjekomponent FÖRE vardegrund: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 53 lager i ordning + import (okända komponenter endast efter vardegrund)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "konvertibel före vardegrund, inga okända före",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN VÄRDEGRUND (s6-u3 omgång 23): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
