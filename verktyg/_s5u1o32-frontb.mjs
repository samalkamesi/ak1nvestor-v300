#!/usr/bin/env node
/**
 * FRONT B för s5-u1 omgång 32 — am-10-insynslistan + vm-12 (läkebärning).
 * Läsreplik som IMPORTERAR den äkta motorn (raknaLarvag) och kartan —
 * samma kod kunden möter, inget eget återimplementation.
 * Node-ESM kräver explicita suffix: larvag.ts importeras via en TMP-kopia
 * med omskrivna sökvägar (src/ lämnas orörd).
 * Kör: node verktyg/_s5u1o32-frontb.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const TMP = "/tmp/s5u1o32-frontb";
mkdirSync(TMP, { recursive: true });
// Kedjan larvag → larvag-karta/kurstips → member-local (klient-localStorage)
// skrivs om till tmp-kopior med absoluta .ts-suffix; member-local stubbas
// (lasarna i FRONT B bär progress själva — localStorage behövs ej i node).
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
const idx = (s) => LARVAG_KARTA.findIndex((k) => k.slug === s);
const kart = (s) => LARVAG_KARTA[idx(s)];

const lasare = (klara, lasTillstand = "växande", fas = 1) => ({
  progress: { xp: klara.length * 50, klaraKurser: klara },
  lasande: { lasTillstand, fas, streak: 0, svagheter: {} },
});

// A — fulläst AKTIEMARKNADEN I PRAKTIKEN-läsare nominerar am-10 90p (86+4)
{
  const amKlara = LARVAG_KARTA.filter((k) => k.kategori === "AKTIEMARKNADEN I PRAKTIKEN" && k.slug !== "am-10-insynslistan").map((k) => k.slug);
  const { progress, lasande } = lasare(amKlara, "växande");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const am10 = rek.find((r) => r.slug === "am-10-insynslistan");
  t(!!am10, "A1: am-10 nominerad för fulläst am-läsare");
  t(am10?.poäng === 90, `A2: poäng 90 (86 BAS + 4 nivåmatch) — fick ${am10?.poäng}`);
  t(am10?.regel === "kategori-fortsattning", "A3: regeln = kategori-fortsattning");
  t(am10?.varför.includes("aktiemarknaden i praktiken"), "A4: varför-rad bär kategorin");
  t(am10?.varför.includes("Insynslistan"), "A5: varför-rad bär titeln");
  console.log("A: am-läsare (", amKlara.length, "steg bakom sig) →", am10 ? am10.poäng + "p" : "EJ NOMINERAD", "—", am10?.varför.slice(0, 90) + "…");
}

// B — omvänd riktning: avancerad läsare (målnivå 3) ger 86 (ingen nivåmatch mot niva 2)
{
  const amKlara = LARVAG_KARTA.filter((k) => k.kategori === "AKTIEMARKNADEN I PRAKTIKEN" && k.slug !== "am-10-insynslistan").map((k) => k.slug);
  const { progress, lasande } = lasare(amKlara, "avancerad");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const am10 = rek.find((r) => r.slug === "am-10-insynslistan");
  t(am10?.poäng === 86, `B1: utan nivåmatch = 86 — fick ${am10?.poäng}`);
}

// C — D1: delvis km-läsaren behåller sin fortsättning (am-10 stjäl ingen plats)
{
  const { progress, lasande } = lasare(["km-001-bokforingens-grunder"], "växande");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const fort = rek.find((r) => r.regel === "kategori-fortsattning");
  t(fort?.slug === "km-002-forvaltningsberattelsen", `C1: km-delvis-läsarens fortsättning = km-002 — fick ${fort?.slug}`);
  const am10rek = rek.find((r) => r.slug === "am-10-insynslistan");
  t(!am10rek || am10rek.poäng < 90, "C2: am-10 stjäl inte km-läsarens plats");
}

// D — vIndex −1 + kraverFas 0 (R2: ingen tiervägg)
{
  const k = kart("am-10-insynslistan");
  t(k?.vIndex === -1, "D1: vIndex −1 (utanför V-spåret)");
  t(k?.kraverFas === 0, `D2: kraverFas 0 (R2) — fick ${k?.kraverFas}`);
}

// E — determinism: två körningar bitidentiska
{
  const amKlara = LARVAG_KARTA.filter((k) => k.kategori === "AKTIEMARKNADEN I PRAKTIKEN" && k.slug !== "am-10-insynslistan").map((k) => k.slug);
  const { progress, lasande } = lasare(amKlara, "växande");
  const a = JSON.stringify(raknaLarvag(progress, lasande, { antal: 8 }));
  const b = JSON.stringify(raknaLarvag(progress, lasande, { antal: 8 }));
  t(a === b, "E1: determinism bitidentisk");
}

// F — serieordning: am-09 < am-10 i kartan
t(idx("am-09-marginalhandeln") < idx("am-10-insynslistan") && idx("am-09-marginalhandeln") >= 0, "F1: serieordning am-09 < am-10");

// G — syskonkursen oskadd: vm-12 i kartan med VÄRDERINGSMETODER-fortsättning
{
  t(idx("vm-12-reverserad-dcf") >= 0, "G1: vm-12 i kartan (läkebäringen oskadd)");
  const vmKlara = LARVAG_KARTA.filter((k) => k.kategori === "VÄRDERINGSMETODER" && k.slug !== "vm-12-reverserad-dcf").map((k) => k.slug);
  const { progress, lasande } = lasare(vmKlara, "växande");
  const rek = raknaLarvag(progress, lasande, { antal: 8 });
  const vm12 = rek.find((r) => r.slug === "vm-12-reverserad-dcf");
  t(vm12?.poäng === 90 || vm12?.poäng === 86 || vm12?.poäng === 88, `G2: vm-12 nominerbar (${vm12?.poäng ?? "ej"}p — 86+4 med Intermediär-match)`);
}

// H — register↔karta-konsistens (dynamiskt: syskonens parallella insert levererar
//     löpande — H1 mäter KONSISTENS, inte ett fruset total) + am-familjens ordning
{
  const dc = JSON.parse(readFileSync("/home/ak1a/AK1/public/deep-courses.json", "utf8"));
  t(LARVAG_KARTA.length === Object.keys(dc).length, `H1: karta ${LARVAG_KARTA.length} = register ${Object.keys(dc).length} (konsistens)`);
  t("am-10-insynslistan" in dc && idx("am-10-insynslistan") >= 0, "H1b: am-10 i register OCH karta");
}
{
  const amOrd = LARVAG_KARTA.filter((k) => k.kategori === "AKTIEMARKNADEN I PRAKTIKEN").map((k) => k.slug);
  t(amOrd[amOrd.length - 1] === "am-10-insynslistan", "H2: am-10 sist i familjen (kartordning)");
}

console.log(`\nFRONT B: ${pass} PASS ${fel} FEL`);
process.exit(fel ? 1 : 0);
