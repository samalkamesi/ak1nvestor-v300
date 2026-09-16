#!/usr/bin/env node
/**
 * FRONT B-BEVIS s5-u3 (manifest auto-s5-1789592726665) — 2026-09-16, omgång 8.
 *
 * Bevisar med MOTORN SJÄLV (src/lib/larvag.ts raknaNastaSteg) att de tre nya
 * kurserna bf-15 / ek-01 / ln-05 nomineras med GENERERADE varför-rader när
 * läsaren fulläst sina familjer UTAN den nya kursen (den enda oklara kvar).
 * Importbro enligt testa-kurs-metadata-mönstret: källorna kopieras till
 * tool-results/ (gitignorat) med importer omskrivna till file://-URL:er;
 * member-local stubbas (motorns kurstips läser webbläsarlagret — här ren
 * logik). Städas bort i finally.
 *
 * Scenarier (kategori-fortsättning, BAS 86 + nivåmatch +4 = 90):
 *   A: BETEENDEFINANS fulläst utan bf-15 → bf-15 nomineras (lästillstånd avancerad)
 *   B: EKOSYSTEM fulläst (fyra flaggskepp) → ek-01 nomineras (avancerad) —
 *      familjens FÖRSTA nivåmatchningsbara kurs (flaggskeppen är nivålösa)
 *   C: LÖNSAMHET fulläst utan ln-05 → ln-05 nomineras (lästillstånd nybörjare)
 * Klara-kurser listas DYNAMISKT ur registret per kategori (minus den väntade)
 * — robust mot syskons parallella registerändringar.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRO = path.join(ROT, "tool-results", "frontb-s5u3o8");
mkdirSync(BRO, { recursive: true });

const register = JSON.parse(readFileSync(path.join(ROT, "public", "deep-courses.json"), "utf8"));
const kurserIKat = (kat) => Object.entries(register).filter(([, k]) => k.category === kat).map(([s]) => s);

const scenarier = [
  {
    namn: "A BETEENDEFINANS",
    kategori: "BETEENDEFINANS",
    klara: kurserIKat("BETEENDEFINANS").filter((s) => s !== "bf-15-bubblans-anatomi"),
    vantad: "bf-15-bubblans-anatomi",
    lasTillstand: "avancerad",
  },
  {
    namn: "B EKOSYSTEM",
    kategori: "EKOSYSTEM",
    klara: kurserIKat("EKOSYSTEM").filter((s) => s !== "ek-01-sam-viktningen"),
    vantad: "ek-01-sam-viktningen",
    lasTillstand: "avancerad",
  },
  {
    namn: "C LÖNSAMHET",
    kategori: "LÖNSAMHET",
    klara: kurserIKat("LÖNSAMHET").filter((s) => s !== "ln-05-vad-ar-lonsamhet"),
    vantad: "ln-05-vad-ar-lonsamhet",
    lasTillstand: "nybörjare",
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
    console.log(`\n== Scenario ${sc.namn} — ${String(sc.klara.length)} klara (familjen utan den nya), väntar ${sc.vantad} ==`);
    kontroll(sc.klara.length >= 4, `${sc.namn}: familjen har minst fyra lästa kurser (${String(sc.klara.length)})`);
    const rek = larvag.raknaNastaSteg({
      xp: 5000,
      klaraKurser: sc.klara,
    }, {
      lasTillstand: sc.lasTillstand,
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
        `poäng 90 (kategori-fortsättning 86 + nivåmatch 4, lästillstånd ${sc.lasTillstand}) — fick ${String(nominerad.poäng)}`,
      );
      kontroll(
        nominerad.regel === "kategori-fortsattning",
        `regel kategori-fortsattning — fick ${String(nominerad.regel)}`,
      );
      kontroll(
        typeof nominerad.varför === "string" &&
          nominerad.varför.includes("Du är igång i") &&
          nominerad.varför.includes(sc.kategori.toLowerCase()) &&
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
