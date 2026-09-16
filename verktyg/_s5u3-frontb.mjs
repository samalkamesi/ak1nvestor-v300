#!/usr/bin/env node
/**
 * FRONT B-BEVIS s5-u3 (manifest auto-s5-1789569318697) — 2026-09-16
 *
 * Bevisar med MOTORN SJÄLV (src/lib/larvag.ts raknaNastaSteg) att de tre
 * nya kurserna rs-05 / kt-03 / ma-01 nomineras med GENERERADE varför-rader
 * när läsaren fulläst sina familjer. Importbro enligt testa-kurs-metadata-
 * mönstret: källorna kopieras till tool-results/ (gitignorat) med importer
 * omskrivna till file://-URL:er; member-local stubbas (motorns kurstips
 * läser webbläsarlagret — här ren logik). Städas bort i finally.
 *
 * Scenarier (kategori-fortsättning, BAS 86 + nivåmatch +4 = 90):
 *   A: RISK fulläst (v19 + rs-01..rs-04)  → rs-05 nomineras
 *   B: KATALYSATOR fulläst (v16..v18 + kt-01/kt-02) → kt-03 nomineras
 *   C: MAKROEKONOMI & RÄNTA fulläst (km-054..km-058) → ma-01 nomineras
 * Lästillstånd "avancerad" + fas 1: kraverFas 0 passerar, nivåmatch nivå 3.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRO = path.join(ROT, "tool-results", "frontb-s5u3");
mkdirSync(BRO, { recursive: true });

const scenarier = [
  {
    namn: "A RISK",
    klara: [
      "v19-kapitalforbranning",
      "rs-01-volatilitet-och-risk",
      "rs-02-kundkoncentration",
      "rs-03-dold-samvariation",
      "rs-04-riskmatrisen",
    ],
    vantad: "rs-05-riskavsnittet-mellan-raderna",
    vantadKategori: "RISK",
  },
  {
    namn: "B KATALYSATOR",
    klara: [
      "v16-produktlanseringar",
      "v17-avtal-partnerskap",
      "v18-regulatoriska",
      "kt-01-vad-ar-en-katalysator",
      "kt-02-forvantningsanalys-och-kalibrering",
    ],
    vantad: "kt-03-katalysatorkedjor",
    vantadKategori: "KATALYSATOR",
  },
  {
    namn: "C MAKROEKONOMI & RÄNTA",
    klara: [
      "km-054-ranta",
      "km-055-inflation",
      "km-056-centralbanker",
      "km-057-konjunkturcykler",
      "km-058-valutor",
    ],
    vantad: "ma-01-transmissionsmekaniken",
    vantadKategori: "MAKROEKONOMI & RÄNTA",
  },
];

try {
  // ── Bron: larvag.ts + kurstips.ts med file://-importer; member-local stubbas ──
  const larvagKalla = readFileSync(path.join(ROT, "src/lib/larvag.ts"), "utf8");
  const kurstipsKalla = readFileSync(path.join(ROT, "src/lib/kurstips.ts"), "utf8");

  const kurstipsBro = kurstipsKalla.replace(
    /from\s+"\.\/member-local"/g,
    `from "${path.join(BRO, "member-local-stub.ts").replaceAll("\\", "/")}"`,
  );
  writeFileSync(path.join(BRO, "kurstips.ts"), kurstipsBro);
  writeFileSync(
    path.join(BRO, "member-local-stub.ts"),
    [
      "// Stub för Front B-bron — member-local läser webbläsarlagret; här ren logik.",
      "export function lasKlaraKurser(): string[] { return []; }",
      "export function lasStreak(): number { return 0; }",
      "export function lasXP(): number { return 0; }",
      "",
    ].join("\n"),
  );

  const kartaUrl = path.join(ROT, "src/lib/larvag-karta.ts").replaceAll("\\", "/");
  const kurstipsUrl = path.join(BRO, "kurstips.ts").replaceAll("\\", "/");
  const larvagBro = larvagKalla
    .replace(/from\s+"\.\/larvag-karta"/g, `from "${kartaUrl}"`)
    .replace(/from\s+"\.\/kurstips"/g, `from "${kurstipsUrl}"`);
  writeFileSync(path.join(BRO, "larvag.ts"), larvagBro);

  const larvag = await import(
    path.join(BRO, "larvag.ts").replaceAll("\\", "/")
  );

  let pass = 0;
  let fail = 0;
  const kontroll = (villkor, text) => {
    if (villkor) { pass += 1; console.log(`  PASS ${text}`); }
    else { fail += 1; console.log(`  FAIL ${text}`); }
  };

  for (const sc of scenarier) {
    console.log(`\n== Scenario ${sc.namn} — ${sc.klara.length} klara, väntar ${sc.vantad} ==`);
    const rek = larvag.raknaNastaSteg({
      xp: 5000,
      klaraKurser: sc.klara,
    }, {
      lasTillstand: "avancerad",
      fas: 1,
      streak: 0,
      svagheter: {},
    });
    const tydliga = (rek?.tips ?? rek ?? []);
    const nominerad = tydliga.find((t) => t.slug === sc.vantad);
    kontroll(Array.isArray(tydliga) && tydliga.length > 0, "motorn lämnar en icke-tom lista");
    kontroll(!!nominerad, `${sc.vantad} nomineras`);
    if (nominerad) {
      kontroll(
        nominerad.poäng === 90,
        `poäng 90 (kategori-fortsättning 86 + nivåmatch 4) — fick ${String(nominerad.poäng)}`,
      );
      kontroll(
        nominerad.regel === "kategori-fortsattning",
        `regel kategori-fortsattning — fick ${String(nominerad.regel)}`,
      );
      kontroll(
        typeof nominerad.varför === "string" &&
          nominerad.varför.includes("Du är igång i") &&
          nominerad.varför.includes(sc.vantadKategori.toLowerCase()) &&
          nominerad.varför.includes(nominerad.titel),
        `varför-rad genererad: "${nominerad.varför}"`,
      );
      console.log(`  → ${nominerad.slug} | ${String(nominerad.poäng)}p | ${nominerad.regel}`);
      console.log(`  → "${nominerad.varför}"`);
    }
  }

  console.log(`\nFRONT B: ${String(pass)} PASS, ${String(fail)} FAIL`);
  if (fail > 0) process.exit(1);
} finally {
  rmSync(BRO, { recursive: true, force: true });
}
