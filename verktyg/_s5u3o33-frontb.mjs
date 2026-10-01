#!/usr/bin/env node
/**
 * FRONT B för s5-u3 omgång 33 — kt-12 + mt-10 + bk-10.
 * Läsreplik som IMPORTERAR den äkta motorn (raknaLarvag) och kartan —
 * samma kod kunden möter, inget eget återimplementation.
 * Node-ESM: larvag.ts importeras via en TMP-kopia med omskrivna sökvägar
 * (src/ lämnas orörd).
 * Kör: node verktyg/_s5u3o33-frontb.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const TMP = "/tmp/s5u3o33-frontb";
mkdirSync(TMP, { recursive: true });
let src = readFileSync("/home/ak1a/AK1/src/lib/larvag.ts", "utf8");
src = src.replace(/from "\.\/([a-z0-9-]+)"/g, 'from "' + TMP + '/$1.ts"');
writeFileSync(TMP + "/larvag.ts", src);

let kt = readFileSync("/home/ak1a/AK1/src/lib/kurstips.ts", "utf8");
kt = kt.replace(/import \{[^}]*\} from "\.\/member-local";/,
  "const lasKlaraKurser = () => [] as string[]; const lasStreak = () => ({ antal: 0 }); const lasXP = () => 0;");
writeFileSync(TMP + "/kurstips.ts", kt);

let lk = readFileSync("/home/ak1a/AK1/src/lib/larvag-karta.ts", "utf8");
writeFileSync(TMP + "/larvag-karta.ts", lk);

const { raknaLarvag } = await import(TMP + "/larvag.ts");
const { LARVAG_KARTA } = await import(TMP + "/larvag-karta.ts");

let pass = 0, fel = 0;
const t = (b, m) => { if (b) pass++; else { fel++; console.log("FEL:", m); } };

const lasare = (klara, lasTillstand = "växande", fas = 1) => ({
  progress: { xp: klara.length * 50, klaraKurser: klara },
  lasande: { lasTillstand, fas, streak: 0, svagheter: {} },
});

// A/B/C — fulllästa familjeläsare nominerar respektive ny kurs 90p (86+4)
const familjer = [
  { kat: "KATALYSATOR", slug: "kt-12-vd-bytet", titelOrd: "VD-bytet" },
  { kat: "MOAT", slug: "mt-10-erfarenhetskurvan", titelOrd: "Erfarenhetskurvan" },
  { kat: "BOKFÖRING & ÅRSREDOVISNING", slug: "bk-10-verkligt-varde-hierarkin", titelOrd: "hierarkin" },
];
for (const f of familjer) {
  const klara = LARVAG_KARTA.filter((k) => k.kategori === f.kat && k.slug !== f.slug).map((k) => k.slug);
  const { progress, lasande } = lasare(klara, "växande");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const ny = rek.find((r) => r.slug === f.slug);
  t(!!ny, `${f.slug}: nominerad för fulläst ${f.kat}-läsare`);
  t(ny?.poäng === 90, `${f.slug}: poäng 90 (86 BAS + 4 nivåmatch) — fick ${ny?.poäng}`);
  t(ny?.regel === "kategori-fortsattning", `${f.slug}: regeln = kategori-fortsattning`);
  t(ny?.varför.toLowerCase().includes(f.kat.toLowerCase()), `${f.slug}: varför-rad bär kategorin`);
  console.log(`  ${f.kat}-läsare (${klara.length} steg bakom sig) → ${ny ? ny.poäng + "p" : "EJ NOMINERAD"} — ${ny?.varför.slice(0, 80)}…`);
}

// D — omvänd riktning: avancerad läsare (målnivå 3) ger 86 (ingen match mot Intermediär)
{
  const klara = LARVAG_KARTA.filter((k) => k.kategori === "KATALYSATOR" && k.slug !== "kt-12-vd-bytet").map((k) => k.slug);
  const { progress, lasande } = lasare(klara, "avancerad");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const ny = rek.find((r) => r.slug === "kt-12-vd-bytet");
  t(!!ny && ny.poäng === 86, `D: avancerad läsare → 86 (ingen nivåmatch) — fick ${ny?.poäng}`);
}

// E — D1-skydd: delvis-läsare (halva familjen) får INTE 90p-nominering av ny kurs
{
  const alla = LARVAG_KARTA.filter((k) => k.kategori === "MOAT" && k.slug !== "mt-10-erfarenhetskurvan").map((k) => k.slug);
  const halva = alla.slice(0, Math.floor(alla.length / 2));
  const { progress, lasande } = lasare(halva, "växande");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const ny = rek.find((r) => r.slug === "mt-10-erfarenhetskurvan");
  t(!ny || ny.poäng < 90, `E: delvis-läsare (${halva.length}/${alla.length}) → max 86p — fick ${ny?.poäng ?? "ej nominerad"}`);
}

// F — determinism: två körningar, identiskt resultat
{
  const klara = LARVAG_KARTA.filter((k) => k.kategori === "BOKFÖRING & ÅRSREDOVISNING" && k.slug !== "bk-10-verkligt-varde-hierarkin").map((k) => k.slug);
  const { progress, lasande } = lasare(klara, "växande");
  const a = JSON.stringify(raknaLarvag(progress, lasande, { antal: 8 }));
  const b = JSON.stringify(raknaLarvag(progress, lasande, { antal: 8 }));
  t(a === b, "F: determinism — två körningar bitidentiska");
}

// G — syskonkurserna oskadda: u1:s am-10 och u2:s vm-12/st-09 nomineras fortfarande
{
  const klara = LARVAG_KARTA.filter((k) => k.kategori === "AKTIEMARKNADEN I PRAKTIKEN" && k.slug !== "am-10-insynslistan").map((k) => k.slug);
  const { progress, lasande } = lasare(klara, "växande");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  t(!!rek.find((r) => r.slug === "am-10-insynslistan"), "G: u1:s am-10 fortfarande nominerad");
  const klara2 = LARVAG_KARTA.filter((k) => k.kategori === "STABILITET" && k.slug !== "st-09-konkursordningen").map((k) => k.slug);
  const { progress: p2, lasande: l2 } = lasare(klara2, "växande");
  const rek2 = raknaLarvag(p2, l2, { antal: 8 });
  t(!!rek2.find((r) => r.slug === "st-09-konkursordningen"), "G: u2:s st-09 fortfarande nominerad");
}

console.log(`\nFRONT B: ${pass} PASS · ${fel} FEL`);
process.exit(fel > 0 ? 1 : 0);
