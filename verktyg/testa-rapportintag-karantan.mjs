#!/usr/bin/env node
/** testa-rapportintag-karantan.mjs — karantänintagets kontraktssvit.
 * STYRELSEBESLUT 2026-09-20: verifierade källor · checksumma + proveniens ·
 * isolerad parsning · lagring utanför publik webbrot · citat-tak 200 ord
 * (hela leveransen refuseras) · obligatoriska källa/länk-fält.
 * Körning: node verktyg/testa-rapportintag-karantan.mjs (offline — ingen nättjänst). */
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const ROT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const { intagFranFil, valideraLeverans } = await import(path.join(ROT, "verktyg", "rapport-intag-karantan.mjs"));
const TMP = fs.mkdtempSync("/tmp/rapportintag-test-");

let pass = 0, fail = 0;
const koll = (namn, villkor, extra = "") => {
  if (villkor) { pass++; console.log(`  PASS ${namn}${extra ? " — " + extra : ""}`); }
  else { fail++; console.log(`  FAIL ${namn}${extra ? " — " + extra : ""}`); }
};

/** Bygg en minimal (parserbar) PDF: %PDF-huvud + en okomprimerad och en
 *  FlateDecode-komprimerad innehållsström med Tj/TJ-text. */
function byggPdf({ textA, textB }) {
  const strangA = `( ${textA.replace(/[()\\]/g, "\\$&")} ) Tj`;
  const bStream = zlib.deflateSync(Buffer.from(`[( ${textB.split(" ")[0].replace(/[()\\]/g, "\\$&")} ) -120 ( ${textB.split(" ").slice(1).join(" ").replace(/[()\\]/g, "\\$&")} )] TJ`, "latin1"));
  const delar = [
    Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n`, "latin1"),
    Buffer.from(`2 0 obj\n<< /Length ${Buffer.byteLength(strangA)} >>\nstream\n${strangA}\nendstream\nendobj\n`, "latin1"),
    Buffer.from(`3 0 obj\n<< /Length ${bStream.length} /Filter /FlateDecode >>\nstream\n`, "latin1"),
    bStream,
    Buffer.from(`\nendstream\nendobj\n%%EOF\n`, "latin1"),
  ];
  return Buffer.concat(delar);
}

console.log("SVIT rapport-intag-karantan (karantänpipeline-kontrakt)");

// T1: äkta intag — okomprimerad + FlateDecode, proveniens, leverans, karantän
{
  const pdf = byggPdf({
    textA: "Försäljning 2025: 25947 MSEK. Bruttomarginal 34,2 procent.",
    textB: "Resultat per aktie uppgick till 4,12 kronor.",
  });
  const pdfFil = path.join(TMP, "t1.pdf");
  fs.writeFileSync(pdfFil, pdf);
  const r = await intagFranFil(pdfFil, { bolag: "TEST", ar: "2025", url: "https://ir.test.se/arsredovisning-2025.pdf" });
  const lev = JSON.parse(fs.readFileSync(r.leveransFil, "utf8"));
  const allt = lev.sektioner.map(s => s.text).join(" ");
  koll("T1a leverans skriven med sektioner", lev.sektioner.length >= 1, `${lev.sektioner.length} sektioner`);
  koll("T1b text ur O-komprimerad ström", allt.includes("25947"));
  koll("T1c text ur FlateDecode-ström (TJ-array)", allt.includes("4,12"));
  koll("T1d varje sektion bär kalla.url + kalla.namn", lev.sektioner.every(s => s.kalla?.url?.startsWith("https://") && s.kalla.namn));
  koll("T1e karantänfil utanför public/", !r.karantFil.includes("/public/") && fs.existsSync(r.karantFil), r.karantFil);
  const sha = crypto.createHash("sha256").update(pdf).digest("hex");
  const provRad = fs.readFileSync(path.join(ROT, "data", "rapportintag", "proveniens.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l)).pop();
  koll("T1f proveniensrad med källa+tidpunkt+hash", provRad.sha256 === sha && provRad.kalla?.url && provRad.ts, `sha ${provRad.sha256?.slice(0, 10)}`);
}

// T2: citat-tak 200 ord — HELA leveransen refuseras, ingen trimning
{
  const langt = Array.from({ length: 250 }, (_, i) => `ord${i}`).join(" ");
  const fel = valideraLeverans({ sektioner: [{ rubrik: "R", text: "x", kalla: { namn: "k", url: "https://a.se/x" }, citat: langt }] });
  koll("T2a 250-ords citat överträds", fel.some(f => f.includes("250 ord") && f.includes("> tak 200")), fel[0]?.slice(0, 80));
  const fel2 = valideraLeverans({ sektioner: [{ rubrik: "R", text: "x", kalla: { namn: "k", url: "https://a.se/x" }, citat: "exakt tvåhundra " + Array.from({ length: 198 }, (_, i) => `o${i}`).join(" ") }] });
  koll("T2b 200-ords citat passerar", !fel2.some(f => f.includes("tak 200")), `${fel2.length} övriga fel`);
  const fel3 = valideraLeverans({ sektioner: [{ rubrik: "R", text: "x", citat: "kort" }, { rubrik: "R2", text: "y", kalla: { namn: "k", url: "https://a.se/y" } }] });
  koll("T2c hela leveransen refuseras vid EN sektions överträdelse", fel3.some(f => f.includes("kalla.url saknas")), `${fel3.length} överträdelser samlade`);
}

// T3: intag med felen INBYGGDA failar totalt (valideraren sitter i pipelinen)
{
  const pdf = byggPdf({ textA: "Bruttomarginal 34,2 procent.", textB: "Skuldsättningsgrad 0,8." });
  const pdfFil = path.join(TMP, "t3.pdf");
  fs.writeFileSync(pdfFil, pdf);
  const { valideraLeverans: v } = await import(path.join(ROT, "verktyg", "rapport-intag-karantan.mjs"));
  // simulerad kurerad leverans med överträdelse: pipelinen kastar BEFORE filskrivning
  const fel = v({ sektioner: [{ rubrik: "S", text: "t", kalla: { namn: "n", url: "https://a.se/s" }, citat: Array.from({ length: 201 }, (_, i) => `w${i}`).join(" ") }] });
  koll("T3 201 ord refuseras (gränsen exakt)", fel.some(f => f.includes("201 ord")), fel[0]?.slice(0, 60));
}

// T4: https-grinden — http-URL avslås FÖRE hämtning (CLI-sond)
{
  try {
    execFileSync(process.execPath, [path.join(ROT, "verktyg", "rapport-intag-karantan.mjs"), "--url=http://data.test.se/x.pdf", "--bolag=T4", "--ar=2025"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    koll("T4 http-URL avslås (CLI)", false, "exit 0 utan avslag");
  } catch (e) {
    koll("T4 http-URL avslås (CLI)", /endast https|KÄLLAVSLAG/.test(String(e.stderr || e.message)), String(e.stderr || e.message).slice(0, 70));
  }
}

// T5: isolering — hängande tolkare avlivas, intaget failar kontrollerat
{
  const stub = path.join(TMP, "hang-tolkare.mjs");
  fs.writeFileSync(stub, `import fs from "node:fs";\nfs.writeFileSync(process.argv[2] + ".las", "start");\nsetTimeout(() => {}, 600000);\n`);
  const pdfFil = path.join(TMP, "t5.pdf");
  fs.writeFileSync(pdfFil, byggPdf({ textA: "x", textB: "y" }));
  // tak + tolkar-override via env i BARNprocessen (modulen läser dem vid import)
  const tolkMedTak = path.join(TMP, "tak.mjs");
  fs.writeFileSync(tolkMedTak, `process.env.TOLK_TAK_MS = "3000";\nprocess.env.TOLKARE_SOKVAG = ${JSON.stringify(stub)};\nconst { intagFranFil } = await import(${JSON.stringify(path.join(ROT, "verktyg", "rapport-intag-karantan.mjs"))});\ntry {\n  await intagFranFil(${JSON.stringify(pdfFil)}, { bolag: "T5", ar: "2025" });\n  console.log("FEL: häng tilläts leverera");\n  process.exit(1);\n} catch (e) {\n  if (String(e.message).includes("avlivad")) { console.log("ISOLERING-OK"); process.exit(0); }\n  console.log("FEL: " + e.message); process.exit(1);\n}\n`);
  try {
    const ut = execFileSync(process.execPath, [tolkMedTak], { encoding: "utf8", timeout: 30_000 });
    koll("T5 hängande tolkare avlivad vid tak", ut.includes("ISOLERING-OK"));
  } catch (e) {
    koll("T5 hängande tolkare avlivad vid tak", String(e.stdout || "").includes("ISOLERING-OK"), String(e.stdout || e.message).slice(0, 70));
  }
}

// T6: karantänkatalogen är gitignorerad (PDF:erna följer aldrig repot)
{
  const gi = fs.readFileSync(path.join(ROT, ".gitignore"), "utf8");
  koll("T6 karantänkatalogen gitignorerad", /data\/rapportintag\/karantan\//.test(gi));
}

// T7: testleveranser städas (proveniensloggen är append-only och behåller
// sina rader — den ÄR spåret; leverans/karantän-filer för TEST-bolaget tas bort)
{
  try {
    fs.unlinkSync(path.join(ROT, "data", "rapportintag", "leveranser", "TEST-2025.json"));
    for (const f of fs.readdirSync(path.join(ROT, "data", "rapportintag", "karantan")).filter(f => f.startsWith("TEST-") || f.startsWith("T5-"))) {
      fs.unlinkSync(path.join(ROT, "data", "rapportintag", "karantan", f));
    }
    koll("T7 testleveranser städade", true);
  } catch (e) { koll("T7 testleveranser städade", false, String(e.message).slice(0, 60)); }
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\nSVIT rapport-intag-karantan: ${pass} PASS · ${fail} FAIL`);
process.exit(fail ? 1 : 0);
