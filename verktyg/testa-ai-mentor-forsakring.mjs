/**
 * TESTA AI-MENTORN — FÖRSÄKRING/KRYPTO-LAGRET (spår 6 omgång 24, s6-u1), 0 beroenden.
 *
 * Kör:  node verktyg/testa-ai-mentor-forsakring.mjs
 * Krav: Node >= 22.18 (type stripping default; annars
 *       --experimental-strip-types på Node 22.6–22.17).
 *
 * Vakar detta lagers två monsters (combined ratio/floaten, krypto):
 *   A  kanoniska   — 2 frågor: lokalt svar, rätt ämne, flerkällsrad
 *                    (📖 Källor (), ≥3 källor), ≥2 registeräkta kurslänkar
 *   A2 wiring     — importen + kedjeraden i chat-widget.tsx bär detta lager
 *                    EFTER realekonomin (lager 54, SIST i omgång 24:s fönster)
 *   B  felstavning — varierade/dia-fria/böjda formuleringar → samma monster
 *   C  determinism — alla frågor × 2 körningar bitidentiska
 *   D01 källaäkthet — källor + kurslänkar FINNS i registret (0 fantomslugar)
 *   D01b knappar   — fragor:-knappar levande mot HELA kedjan (55 motorer;
 *                    däribland "vad är en moat?" → extra och "vad är
 *                    volatilitet?" → basens risk-monster, deras dokumenterade
 *                    ägande)
 *   D02 register   — kategoriantal + kursminuter i texterna ur registret
 *   D03 aritmetik  — exempelens 16 tal oberoende omräknade + nämnda i text
 *   E  genomström  — omatchade frågor → null (API-flödet)
 *   F  juridik     — inga köp/sälj-rådfraser (lagen 2007:528 — utbildning)
 *   G  antistöld   — tidigare kanoniska → null i detta lager (däribland
 *                    naket "vad är försäkring?" = BETEENDEDJUPETS via
 *                    «förankring» tav 2, "vad är en moat?" = extras,
 *                    "vad är en termin?" = nästas, "vad är volatilitet?" =
 *                    basens — sondens dokumenterade gränser)
 *   G2 syskonkärnord — ALLA tidigare lagers kärnord LIVE som frågor → 0
 *   H  kedja       — SIST-lager-invarianten: gamla svar bitidentiska
 *                    med/utan detta lager + ämneskontroller + nya rätt
 *   I  omkastad    — de 2 nya kanoniska → null i kedjan UTAN detta lager
 *   J  disjunktion — kärnorden överlappar inget tidigare lagers (mekaniskt)
 *   L  widget-synk — kedjeraden i chat-widget.tsx bär alla 55 kända lager
 *                    i ordning; OKÄNDA komponenter tillåts ENDAST efter
 *                    detta lagrets position (syskon i samma fönster som
 *                    wiras senare — framåtkompatibel dokumentationsplikt)
 *
 * Syskonimporter är TOLERANTA (syskon skriver just nu): hela kedjans 54
 * tidigare lager (omgång ≤ 23) läses; omgång 24:s syskonlager (u2/u3) är
 * ännu inte kända — deras tester äger sin egen anmälan.
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * Fall F vaktar ren utbildningsformulering — inga placeringstips, inga
 * omdömen om enskilda bolag eller mynt (alla exempel bär påhittade tal).
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
      "Kör med: node --experimental-strip-types verktyg/testa-ai-mentor-forsakring.mjs (eller uppgradera Node >= 22.18).",
  );
  process.exit(1);
}

// Den RIKTIGA koden ur src/ (ingen duplikation i testet).
const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { MONSTER, svaraLokalt } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
const { svaraLokaltForsakring, FORSKRING_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-forsakring-fragor.ts")).href);

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
const { svaraLokaltMarknadsmekanik, MARKNADSMEKANIK_MONSTER } = await T("marknadsmekanik", { namn: "Marknadsmekanik", arr: "MARKNADSMEKANIK_MONSTER" });
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
const { svaraLokaltSektorlasning, SEKTORLASNING_MONSTER } = await T("sektorlasning", { namn: "Sektorlasning", arr: "SEKTORLASNING_MONSTER" });
const { svaraLokaltVardegrund, VARDEGRUND_MONSTER } = await T("vardegrund", { namn: "Vardegrund", arr: "VARDEGRUND_MONSTER" });
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

// ── FALL A: de två nya kanoniska med flerkällskrav ──────────────────────────
const NYA = [
  { fraga: "Vad är combined ratio?", amne: "forsakring", slug: "se-19-forsakringssektorn" },
  { fraga: "Vad är krypto?", amne: "krypto", slug: "se-11-krypto" },
];

NYA.forEach((f, i) => {
  const nr = "A" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltForsakring(f.fraga, KURSREGISTER);
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

// ── FALL A2: wiring — import + kedjerad i chat-widget.tsx, lager 55 ─────────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importOk = widget.includes('from "@/lib/ai-mentor-forsakring-fragor"');
  const rad = widget.split("\n").find((r) => r.includes("svaraLokaltMakro(q, KURSREGISTER)")) ?? "";
  const minPos = rad.indexOf("svaraLokaltForsakring(");
  const fore = ["svaraLokaltRealekonomi("];
  const ordningOk = fore.every((k) => rad.indexOf(k) !== -1 && rad.indexOf(k) < minPos);
  kontroll(
    "A2 wiring — import + kedjerad i chat-widget.tsx (försäkring lager 55, efter realekonomin)",
    importOk && minPos !== -1 && ordningOk,
    importOk && minPos !== -1
      ? ordningOk ? "import ✓ · efter omgång 23:s realekonomi ✓" : "import ✓ men ordning fel"
      : "import/kedjerad saknas — kopplingen bruten",
  );
}

// ── FALL B: felstavade varianter → samma träff ──────────────────────────────
const FELSTAVADE = [
  { fraga: "vad ar combined ratio?", amne: "forsakring" }, // diafri
  { fraga: "vad är en combined ratio?", amne: "forsakring" }, // artikelformen
  { fraga: "hur räknar man ut combined ratio?", amne: "forsakring" }, // räkneformen
  { fraga: "vad är floaten?", amne: "forsakring" }, // beständig form
  { fraga: "vad ar floaten?", amne: "forsakring" }, // diafri
  { fraga: "vad är float?", amne: "forsakring" }, // naken engelska (moat-gränsen)
  { fraga: "vad är försäkringssektorn?", amne: "forsakring" }, // sektorsammansättning
  { fraga: "hur analyserar jag försäkringsbolag?", amne: "forsakring" }, // hur-formen
  { fraga: "vad är premieinkomster?", amne: "forsakring" }, // delmåttet
  { fraga: "vad är underwriting?", amne: "forsakring" }, // engelska professionen
  { fraga: "vad ar krypto?", amne: "krypto" }, // diafri
  { fraga: "vad är kryptovalutor?", amne: "krypto" }, // plural
  { fraga: "vad är bitcoin?", amne: "krypto" }, // myntet
  { fraga: "vad är blockchain?", amne: "krypto" }, // engelska kedjan
  { fraga: "vad är blockkedjan?", amne: "krypto" }, // svenska kedjan
  { fraga: "vad är ethereum?", amne: "krypto" }, // det andra myntet
];
FELSTAVADE.forEach((f, i) => {
  const nr = "B" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltForsakring(f.fraga, KURSREGISTER);
  const ok = svar !== null && svar.amne === f.amne;
  kontroll(nr + " " + f.amne + " — '" + f.fraga + "'", ok, svar ? "ämne=" + svar.amne : "inget svar");
});

// ── FALL C: determinism — alla frågor × 2 körningar bitidentiska ────────────
{
  const alla = [...NYA.map((f) => f.fraga), ...FELSTAVADE.map((f) => f.fraga)];
  const forsta = alla.map((f) => JSON.stringify(svaraLokaltForsakring(f, KURSREGISTER)));
  const andra = alla.map((f) => JSON.stringify(svaraLokaltForsakring(f, KURSREGISTER)));
  const identiska = forsta.every((s, i) => s === andra[i]);
  kontroll("C01 determinism — " + alla.length + " frågor × 2 körningar bitidentiska", identiska,
    identiska ? "" : "avvikelse upptäckt");
}

// Hela kedjan exakt som chat-widget.tsx komponerar den (55 motorer).
const LED = [
  ["makro", svaraLokaltMakro], ["extra", svaraLokaltExtra], ["bas", svaraLokalt],
  ["nästa", svaraLokaltNasta], ["kapitalmekanik", svaraLokaltKapitalmekanik],
  ["sektor", svaraLokaltSektor], ["case", svaraLokaltCase],
  ["marknadsmekanik", svaraLokaltMarknadsmekanik],
  ["praktik", svaraLokaltPraktik],
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
  ["försäkring", svaraLokaltForsakring],
];
const helakedjan = (fraga) => {
  for (const [, f] of LED) {
    if (!f) continue;
    const s = f(fraga, KURSREGISTER);
    if (s) return s;
  }
  return null;
};
// Kedjan UTAN detta lager (SIST-i-fönstret-invarianten gäller försäkring:
// kedjan utan försäkring = 54 motorer, realekonomin sist).
const UTAN_FORSKRING = LED.filter(([namn]) => namn !== "försäkring");
const kedjaUtan = (fraga) => {
  for (const [, f] of UTAN_FORSKRING) {
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
    const svar = svaraLokaltForsakring(f.fraga, KURSREGISTER);
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
  // medvetet ÖVER lagergränserna (moat → extra, volatilitet → basens
  // risk-monster, combined ratio → detta lagers syskon-monster) enligt
  // konventionen "knappen landar aldrig null".
  for (const f of NYA) {
    const svar = svaraLokaltForsakring(f.fraga, KURSREGISTER);
    if (!svar) continue;
    for (const h of svar.handlings) {
      if (!h.lank.startsWith("fragor:")) continue;
      const q = decodeURIComponent(h.lank.slice("fragor:".length));
      const mal = helakedjan(q);
      if (!mal) FEL.push("fragor:-knapp '" + q + "' (" + f.amne + ") landar null i HELA kedjan — död knapp");
    }
  }
  kontroll("D01b fragor:-knappar — levande mot HELA kedjan (55 motorer)", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "0 döda knappar");

  // Registerdrivna räknekontroller: kategorins antal och kursminuter i
  // texterna ska komma ur registret (klippskydd vid registerändring —
  // spår 5:s rebake).
  const seAntal = KURSREGISTER.filter((r) => r.kategori === "SEKTORANALYS").length;
  const se19 = KURSREGISTER.find((r) => r.slug === "se-19-forsakringssektorn");
  const se11 = KURSREGISTER.find((r) => r.slug === "se-11-krypto");
  const s1 = svaraLokaltForsakring(NYA[0].fraga, KURSREGISTER);
  const s2 = svaraLokaltForsakring(NYA[1].fraga, KURSREGISTER);
  kontroll(
    "D02 registerdrivna tal — SEKTORANALYS=" + seAntal +
      " · se-19/se-11 " + (se19 ? se19.minuter : "?") + "/" + (se11 ? se11.minuter : "?") + " min",
    !!s1 && !!s2 &&
      s1.text.includes("I sektoranalys finns " + seAntal + " kurser") &&
      s2.text.includes("I sektoranalys finns " + seAntal + " kurser") &&
      (se19 ? s1.text.includes(se19.minuter + " min") : false) &&
      (se11 ? s2.text.includes(se11.minuter + " min") : false),
    "texterna ska bära registrets egna tal",
  );

  // Aritmetik — oberoende omräkning av exempelens alla tal.
  const r1 = (x) => Math.round(x * 100) / 100;
  const crBra = (690 + 260) / 1000;
  const tvinBra = 1000 - 690 - 260;
  const crStorm = (790 + 260) / 1000;
  const tvinStorm = 1000 - 790 - 260;
  const float = 1000 * 4;
  const kapMotor = float * 0.04;
  const braAr = tvinBra + kapMotor;
  const stormAr = tvinStorm + kapMotor;
  const effRanta = tvinBra / float;
  const ARIT = [
    ["CR bra år (690 + 260) ÷ 1 000 = 0,95 = 95 procent", /\(690 \+ 260\) ÷ 1 000 = 0,95 — combined ratio 95 procent/.test(s1.text) && r1(crBra) === 0.95],
    ["teckningsvinst 1 000 − 690 − 260 = 50 miljoner", /1 000 − 690 − 260 = 50 miljoner/.test(s1.text) && tvinBra === 50],
    ["CR stormår (790 + 260) ÷ 1 000 = 1,05 = 105 procent", /\(790 \+ 260\) ÷ 1 000 = 1,05 = 105 procent/.test(s1.text) && r1(crStorm) === 1.05],
    ["float 1 000 × 4 = 4 000 miljoner", /1 000 × 4 = 4 000 miljoner/.test(s1.text) && float === 4000],
    ["kapitalmotor 4 000 × 0,04 = 160 miljoner per år", /4 000 × 0,04 = 160 miljoner per år/.test(s1.text) && kapMotor === 160],
    ["bra år 50 + 160 = 210 miljoner", /50 \+ 160 = 210 miljoner/.test(s1.text) && braAr === 210],
    ["stormår −50 + 160 = 110 miljoner", /−50 \+ 160 = 110 miljoner/.test(s1.text) && stormAr === 110],
    ["effektiv ränta 50 ÷ 4 000 = 1,25 procent", /50 ÷ 4 000 = 1,25 procent/.test(s1.text) && r1(effRanta * 100) === 1.25],
    ["krypto −75 %: 10 000 → 2 500", /10 000 till 2 500 kronor har fallit 75 procent/.test(s2.text) && Math.round((1 - 2500 / 10000) * 100) === 75],
    ["återhämtning 10 000 ÷ 2 500 = 4,0 ggr = +300 %", /10 000 ÷ 2 500 = 4,0 ggr, alltså \+300 procent/.test(s2.text) && 10000 / 2500 === 4],
    ["spegel −50 % kräver +100 %", /−50 procent kräver \+100 procent/.test(s2.text) && Math.round((10000 / 5000 - 1) * 100) === 100],
    ["spegel −90 % kräver +900 %", /−90 procent kräver \+900 procent/.test(s2.text) && Math.round((10000 / 1000 - 1) * 100) === 900],
  ];
  const aritFel = ARIT.filter(([, ok]) => !ok).map(([n]) => n);
  kontroll("D03 aritmetik — exempelens 12 kontrollposter exakta och nämnda", aritFel.length === 0,
    aritFel.length ? "saknas/fel: " + aritFel.join(", ") : "CR-kedjan · float-motorn · svängningstabellen ✓");
}

// ── FALL E: omatchade frågor → null (API-flödet) ────────────────────────────
const OMATCHADE = [
  "Vad blir vädret i Ystad imorgon?",
  "Vem skrev Pippi Långstrump?",
  "Hur många strängar har en gitarr?",
];
OMATCHADE.forEach((fraga, i) => {
  const nr = "E" + String(i + 1).padStart(2, "0");
  const svar = svaraLokaltForsakring(fraga, KURSREGISTER);
  kontroll(nr + " omatchad — '" + fraga + "'", svar === null,
    svar ? "fick lokalt svar (ämne=" + svar.amne + ") — skulle gått vidare i kedjan" : "null ✓");
});

// ── FALL F: juridikgrind-lint — inga rådfraser i de nya svaren ──────────────
{
  const RADCITAT = /\b(köp|sälj|rekommenderar att du köper|teckna)\b[^.]{0,30}\b(aktie|bolag|portfölj|mynt)\b/i;
  const VARDERAD = /\b(välj|byt till|satsa på)\b[^.]{0,40}\b(aktie|bolag|portfölj|mynt)\b/i;
  const FEL = [];
  for (const f of NYA) {
    const svar = svaraLokaltForsakring(f.fraga, KURSREGISTER);
    if (!svar) continue;
    if (RADCITAT.test(svar.text)) FEL.push(f.amne + ": rådfras i text");
    if (VARDERAD.test(svar.text)) FEL.push(f.amne + ": värderings-rådfras i text");
    for (const h of svar.handlings) if (RADCITAT.test(h.text)) FEL.push(f.amne + ": rådfras i handling '" + h.text + "'");
    // Utdrag ur 2007:528-utbildningskontraktet ska finnas i varje svar.
    if (!/detta är utbildning/.test(svar.text)) {
      FEL.push(f.amne + ": saknar utbildningsdisclaimer");
    }
  }
  kontroll("F01 juridikgrind — inga köp/sälj-rådfraser, utbildningsdisclaimer i försäkring/krypto-svaren", FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "ren utbildningsformulering");
}

// ── FALL G: ANTISTÖLD — tidigare kanoniska ger null i detta lager ───────────
const GAMLA = [
  // Sondens dokumenterade gränser — ägarnas frågor får ALDRIG stjälas här:
  { fraga: "Vad är en moat?", amne: null }, // EXTRAS moat-familj (float↔moat tav 2)
  { fraga: "Vad är en vallgrav?", amne: null }, // extras
  { fraga: "Vad är förankring?", amne: null }, // BETEENDEDJUPETS (försäkring-gränsen)
  { fraga: "Vad är försäkring?", amne: null }, // naket — beteendedjupets via förankring
  { fraga: "Vad är en termin?", amne: null }, // NÄSTAS termins-familj (od-07 bärs ej)
  { fraga: "Vad är terminer?", amne: null }, // nästas
  { fraga: "Vad är warranter och teckningsoptioner?", amne: null }, // WARRANTS tecknings-familj
  { fraga: "Vad är volatilitet?", amne: null }, // BASENS risk-monster (rs-01 är KÄLLA enl. V19)
  { fraga: "Vad är risk?", amne: null }, // basens
  { fraga: "Vad är price to sales?", amne: null }, // BASENS nyckeltal (v04 bärs ej)
  { fraga: "Vad är price to book?", amne: null }, // basens (v05 bärs ej)
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
  { fraga: "Hur analyserar jag ett energibolag?", amne: null }, // u2 sektorlasning
  { fraga: "Hur analyserar jag ett telekombolag?", amne: null }, // u2 sektorlasning
  { fraga: "Vad är motiverat värde?", amne: null }, // u3 vardegrund
  { fraga: "Vad är realekonomin?", amne: null }, // u1 realekonomi (föregångaren)
];
{
  const stulna = GAMLA.filter((f) => svaraLokaltForsakring(f.fraga, KURSREGISTER) !== null);
  kontroll(
    "G01 antistöld — " + GAMLA.length + " tidigare kanoniska ger null i försäkring/krypto-lagret",
    stulna.length === 0,
    stulna.length ? stulna.map((f) => "'" + f.fraga + "' ⇒ " + svaraLokaltForsakring(f.fraga, KURSREGISTER).amne).join(" | ") : "0 stölder ✓",
  );
}

// ── FALL G2: SYSKONKÄRNORD — ALLA tidigare kärnord LIVE som frågor ──────────
{
  const FEL = [];
  const SYSKON = [
    [MONSTER, "bas"], [MAKRO_MONSTER, "makro"], [EXTRA_MONSTER, "extra"], [NASTA_MONSTER, "nästa"],
    [KAPITALMEKANIK_MONSTER, "kapitalmekanik"], [SEKTOR_MONSTER, "sektor"], [CASE_MONSTER, "case"],
    [MARKNADSMEKANIK_MONSTER, "marknadsmekanik"],
    [PRAKTIK_MONSTER, "praktik"], [PORTFOLJGRUND_MONSTER, "portföljgrund"], [AGANDE_MONSTER, "ägande"],
    [REDOVISNINGSDJUP_MONSTER, "redovisningsdjup"], [DJUP_MONSTER, "djup"], [HISTORIA_MONSTER, "historia"],
    [LONSAMHETSDJUP_MONSTER, "lönsamhet"], [TSDJUP_MONSTER, "tsdjup"], [SKATTEDJUP_MONSTER, "skatt"],
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
    [VARDEGRUND_MONSTER, "vardegrund"], [REALEKONOMI_MONSTER, "realekonomi"],
  ];
  let antal = 0;
  for (const [monster, namn] of SYSKON) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) {
      for (const k of m.karnord ?? []) {
        antal++;
        const svar = svaraLokaltForsakring("vad är " + k + "?", KURSREGISTER);
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
    if (med.amne === "forsakring" || med.amne === "krypto") {
      fel.push("'" + f.fraga + "' fångades av SIST-lagret (ämne=" + med.amne + ")");
    }
  }
  // …och de två nya kanoniska når rätt lager genom HELA kedjan.
  for (const f of NYA) {
    const med = helakedjan(f.fraga);
    if (!med) fel.push("'" + f.fraga + "' null i hela kedjan");
    else if (med.amne !== f.amne) fel.push("'" + f.fraga + "' ⇒ " + med.amne + " (väntat " + f.amne + ")");
  }
  kontroll(
    "H01 kedja — " + GAMLA.length + " gamla oförändrade (SIST-invarianten) + " + NYA.length + " nya når rätt lager (55 motorer, som chat-widget.tsx)",
    fel.length === 0,
    fel.length ? fel.join(" | ") : (GAMLA.length + 2) + "/" + (GAMLA.length + 2) + " rätt",
  );
}

// ── FALL I: OMKASTAD ANTISTÖLD — mina kanoniska ger null UTAN detta ───────
{
  const tjuvade = NYA.filter((f) => kedjaUtan(f.fraga) !== null);
  kontroll(
    "I01 omkastad antistöld — 2 nya kanoniska ger null i kedjan UTAN försäkring/krypto-lagret",
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
    SEKTOR_MONSTER, CASE_MONSTER, MARKNADSMEKANIK_MONSTER, PRAKTIK_MONSTER, PORTFOLJGRUND_MONSTER, AGANDE_MONSTER,
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
    KONVERTIBEL_MONSTER, SEKTORLASNING_MONSTER, VARDEGRUND_MONSTER, REALEKONOMI_MONSTER,
  ];
  for (const monster of ALLA) {
    if (!Array.isArray(monster)) continue;
    for (const m of monster) for (const k of m.karnord ?? []) tidigare.add(dia(k));
  }
  const krock = [];
  for (const m of FORSKRING_MONSTER) {
    for (const k of m.karnord ?? []) {
      if (tidigare.has(dia(k))) krock.push("'" + k + "' (" + m.id + ") finns redan i tidigare lager");
    }
  }
  kontroll(
    "J01 kärnordsdisjunktion — FORSKRING_MONSTER vs " + (tidigare.size > 0 ? "alla tidigare lager" : "0 lager") + " (" + tidigare.size + " kärnord)",
    krock.length === 0,
    krock.length ? krock.join(" | ") : "0 överlapp ✓",
  );
}

// ── FALL L: WIDGET-SYNK — kedjeraden i chat-widget.tsx bär alla lager ──────
{
  const widget = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const KOMPONENTER = [
    "svaraLokaltMakro", "svaraLokaltExtra", "svaraLokaltModernaRisker", "svaraLokalt", "svaraLokaltNasta",
    "svaraLokaltKapitalmekanik", "svaraLokaltSektor", "svaraLokaltCase",
    "svaraLokaltMarknadsmekanik",
    "svaraLokaltPraktik", "svaraLokaltValutamekanik", "svaraLokaltPortfoljgrund", "svaraLokaltAgande",
    "svaraLokaltRedovisningsdjup", "svaraLokaltDjup", "svaraLokaltHistoria",
    "svaraLokaltLonsamhetsdjup", "svaraLokaltTsdjup", "svaraLokaltSkattedjup",
    "svaraLokaltBeteendedjup", "svaraLokaltRiskdjup", "svaraLokaltRiskmattsdjup",
    "svaraLokaltUtdelningsdjup", "svaraLokaltForvantningsdjup",
    "svaraLokaltPortfoljbalans", "svaraLokaltStabilitetsdjup",
    "svaraLokaltGrahamgolv", "svaraLokaltVarderjustering",
    "svaraLokaltOptionsdjup", "svaraLokaltRisklasningsdjup",
    "svaraLokaltAvkastningskurva", "svaraLokaltAvkastningsdjup",
    "svaraLokaltVarderingsverktyg", "svaraLokaltWarrant",
    "svaraLokaltTidsaxel", "svaraLokaltKapitalbindning",
    "svaraLokaltEkosystemdjup", "svaraLokaltHandelsdag",
    "svaraLokaltPortfoljpraktik", "svaraLokaltUtdelningskalender",
    "svaraLokaltKreditdjup", "svaraLokaltSektordjup", "svaraLokaltSektorskola2",
    "svaraLokaltBeteendemekanik", "svaraLokaltPeMekanik", "svaraLokaltRiskpremie",
    "svaraLokaltOverlevnadsdjup", "svaraLokaltKoncernlasning", "svaraLokaltTillvaxtdjup",
    "svaraLokaltFaktordjup", "svaraLokaltBokmastar", "svaraLokaltRiskbudget",
    "svaraLokaltKonvertibel", "svaraLokaltSektorlasning", "svaraLokaltVardegrund",
    "svaraLokaltRealekonomi",
    // Omgång 24 (s6-u1): försäkring — 55:e motorn i fönstrets ordning.
    // Syskon som wiras EFTER detta lager tillåts som okända komponenter
    // ENDAST på senare positioner — framåtkompatibel dokumentationsplikt
    // (deras tester äger sin anmälan).
    "svaraLokaltForsakring",
    // Omgång 24 (s6-u3-harmonisering): fönstrets tre sista komponenter i
    // wireningsordning — u1 försäkring (55) · u2 moatdjup (56) · u3 nya
    // territorier (57). Idempotent: körs igen ⇒ 0 ändringar.
    "svaraLokaltMoatdjup",
    "svaraLokaltNyaTerritorier",
  
    // Omgång 25-harmonisering (s6-u2, 2026-09-20): fönstrets tre nya komponenter i
    // kedjeordning (u1 etfmekanik 59 · s6-u2 kontrahent 60 · u3 marknadsrytm 61).
    "svaraLokaltEtfmekanik",
    "svaraLokaltKontrahent",
    // Omgång 25-tillägg (s6-u2 försök 2, 2026-09-20): grundmultiplarna —
    // 61:a motorn, FÖRE marknadsrytm (deras SIST-deklaration; v04 P/S + v05 P/B).
    "svaraLokaltMultipel",
      // Omgång 26 (manifest auto-s6-1789890903364 — ordningspasset efter två
      // krockade harmoniseringsvågor): fönstrets tre i KEDJEORDNING — riskadress
      // (s6-u1, 62:a) · balansdjup (s6-u2, 63:e) · optionshantverk (s6-u3, 64:e)
      // — FÖRE marknadsrytm (deras SIST-deklaration).
      "svaraLokaltRiskadress",
      "svaraLokaltBalansdjup",
      "svaraLokaltOptionshantverk",
      "svaraLokaltPengarstid",
  // V219-harmonisering (rond 114): pengarstid wireades i widgeten utan svitharmonisering
  // (föregångare: 54e7a59e studio: auto s6-u2 AI-MENTORN +2 FÖRHANDSFRÅGOR — PENGARNAS TID OCH ORD) — mellan optionshantverk och marknadsrytm.
  "svaraLokaltVolatilitetsmekanik",
    // Omgång 27 (auto-s6-1789912510460, s6-u2): volatilitetsmekanik — slutsvepet.
    "svaraLokaltCoinvest", "svaraLokaltTvangsmekanik", "svaraLokaltHandelsemotor", "svaraLokaltLonsamhetsgrund", "svaraLokaltMarknadsrytm",];
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
  if (!widget.includes('from "@/lib/ai-mentor-forsakring-fragor"')) {
    FEL.push("importen av ai-mentor-forsakring-fragor saknas");
  }
  // Okända kedjekomponenter: tillåtna ENDAST efter detta lagrets position
  // (syskon som wiras senare i samma fönster); okända FÖRE underkänns —
  // de skulle kunna ändra SIST-invarianten (fall H).
  const minPos = rad.indexOf("svaraLokaltForsakring(");
    // Fönstret efter omgång 27 (s6-u2, _s6u2o28-): ModernaRisker + Coinvest+Tvangsmekanik i widgetordning — läkning av omgång 27:s öppna harmoniseringsskuld
  // (ModernaRisker/Coinvest wireades utan familjepass; dokumentationsplikten, rond 114-läxan).
    // Fönster 29 (s6-u2, _s6u2o29-): Handelsemotor i widgetordning FÖRE marknadsrytm —
  // svitharmoniseringens dokumentationsplikt (rond 114-läxan: widget-wire ⇒ harmonisering i samma leverans).
    // Fönster 29 (s6-u1, _s6u1o29-): kemisektor i widgetordning (efter lonsamhetsgrund,
  // före marknadsrytm) — svitharmoniseringens dokumentationsplikt (V219-läxan).
  const kanda = new Set([...KOMPONENTER, "svaraLokaltKemisektor"]);
  for (const match of rad.matchAll(/svaraLokalt\w*\(/g)) {
    const namn = match[0].slice(0, -1);
    if (kanda.has(namn)) continue;
    if (match.index < minPos) FEL.push("okänd kedjekomponent FÖRE försäkring: " + namn);
  }
  kontroll(
    "L01 widget-synk — kedjan i chat-widget.tsx bär alla 55 lager i ordning + import (okända komponenter endast efter försäkring)",
    FEL.length === 0,
    FEL.length ? FEL.join(" | ") : "realekonomi före försäkring, inga okända före",
  );
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("");
console.log("AI-MENTORN FÖRSÄKRING/KRYPTO (s6-u1 omgång 24): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
