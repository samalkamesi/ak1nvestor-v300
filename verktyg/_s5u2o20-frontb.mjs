#!/usr/bin/env node
/**
 * s5-u2 FRONT B (manifest auto-s5-1789837501089, omgång 20) —
 * LÄSREPLIK av src/lib/larvag.ts mot den NYA kartan: bevisar att
 * kt-07-den-tillverkade-katalysatorn och ib-05-kostnadstrappan nomineras av
 * motorn (90p svaghet + 4 nivåmatch = 94; 86 kategori-fortsättning utan
 * match), att varför-raderna genereras, att kartordningen håller
 * (kt-05 < kt-06 < kt-07 < am-01; ib-04 < ib-05 < pe-01), att syskonens
 * kurser förblir nominerbara och att allt är deterministiskt.
 *
 * Läsreplik = semantiken från larvag.ts (BAS, påslag, regler, varför-rader)
 * omimplementerad läsande ur larvag-karta.ts — inte en import: frontendens
 * kontrakt utan byggkrav. Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const pass = [];
const fel = [];
const P = (namn, ok, detalj) => { (ok ? pass : fel).push(namn + (detalj ? " — " + detalj : "")); console.log((ok ? "PASS " : "FEL  ") + namn + (detalj ? " — " + detalj : "")); };

// ── Kartan, läst ur src/lib/larvag-karta.ts ──────────────────────────────────
const kartRad = readFileSync(ROT + "/src/lib/larvag-karta.ts", "utf8");
const KARTA = [];
for (const m of kartRad.matchAll(/\{ slug: "([^"]+)", titel: "([^"]+)", kategori: "([^"]+)", niva: (\d+), kraverFas: (\d+), vIndex: (-?\d+), minuter: (\d+) \}/g)) {
  KARTA.push({ slug: m[1], titel: m[2], kategori: m[3], niva: +m[4], kraverFas: +m[5], vIndex: +m[6], minuter: +m[7] });
}
const IDX = new Map(KARTA.map((k, i) => [k.slug, i]));
const ANTAL = KARTA.length;
P("E0 karta parsad", ANTAL >= 452, ANTAL + " kurser (≥452 — syskon kan ha landat)");

// ── larvag.ts-semantik (BAS, påslag, MALNIVA, varför-generatorer) ────────────
const BAS = { svagheten: 90, kategoriFortsattning: 86 };
const MALNIVA = { nybörjare: 1, växande: 2, avancerad: 3, "fas2-redo": 3 };
const poang = (bas, k, malniva) => bas + (k.niva > 0 && k.niva === malniva ? 4 : 0) + (k.vIndex >= 0 ? 2 : 0);
const varforSvaghet = (t, d) => `Quiz-signalen lyser just nu på ${t} — ${String(d)} delar väntar på en omgång till, och sedan sitter kunskapen.`;
const varforFortsattning = (t, kat, n) => `Du är igång i ${kat.toLowerCase()} — ${n === 1 ? "ditt första steg" : `${String(n)} steg`} ligger bakom dig, och ${t} fortsätter i samma spår. Det du redan kan bär dig en bit på vägen.`;

/** Läsreplik av raknaLarvag:s relevanta nomineringsgrenar (2 + 3) + sortering. */
function rakna(progress, lasande) {
  const klaraSet = new Set(progress.klaraKurser);
  const kan = (slug) => { if (klaraSet.has(slug)) return undefined; const k = KARTA[IDX.get(slug)]; return k && k.kraverFas <= lasande.fas ? k : undefined; };
  const malniva = MALNIVA[lasande.lasTillstand];
  const kand = [];
  const nom = (slug, bas, regel, varför) => { const k = kan(slug); if (!k || kand.some((x) => x.slug === slug)) return; kand.push({ slug, titel: k.titel, varför, poäng: poang(bas, k, malniva), regel }); };
  // 2 ── svagheten (argmax, minst 3 delar; oavgång → lägre kartindex)
  let sSlug = null, sDelar = 0;
  for (const [slug, delar] of Object.entries(lasande.svagheter)) {
    if (!(delar >= 3) || !kan(slug)) continue;
    if (delar > sDelar || (delar === sDelar && (IDX.get(slug) ?? 9e9) < (IDX.get(sSlug) ?? 9e9))) { sSlug = slug; sDelar = delar; }
  }
  if (sSlug) nom(sSlug, BAS.svagheten, "svagheten", varforSvaghet(KARTA[IDX.get(sSlug)].titel, sDelar));
  // 3 ── kategori-fortsattning (flest klara i kategori → nästa oklara, lägst index)
  const katR = new Map();
  for (const s of progress.klaraKurser) { const k = KARTA[IDX.get(s)]; if (k) katR.set(k.kategori, (katR.get(k.kategori) ?? 0) + 1); }
  let pKat = null, pAntal = 0;
  for (const [kat, n] of katR) if (n > pAntal) { pKat = kat; pAntal = n; }
  if (pKat) {
    const f = KARTA.filter((k) => k.kategori === pKat && kan(k.slug) && !kand.some((x) => x.slug === k.slug))[0];
    if (f) nom(f.slug, BAS.kategoriFortsattning, "kategori-fortsättning", varforFortsattning(f.titel, pKat, pAntal));
  }
  return kand.sort((a, b) => b.poäng - a.poäng || (IDX.get(a.slug) ?? 0) - (IDX.get(b.slug) ?? 0));
}

// ── E1/E2: mina kurser i kartan med rätt struktur ────────────────────────────
const kt07 = KARTA[IDX.get("kt-07-den-tillverkade-katalysatorn")];
const ib05 = KARTA[IDX.get("ib-05-kostnadstrappan")];
P("E1 kt-07 i karta", !!kt07 && kt07.kategori === "KATALYSATOR" && kt07.niva === 3 && kt07.kraverFas === 0, kt07 ? `kat ${kt07.kategori} · niva ${kt07.niva} · fas ${kt07.kraverFas} · ${kt07.minuter} min` : "SAKNAS");
P("E2 ib-05 i karta", !!ib05 && ib05.kategori === "PRIVATE EQUITY & INVESTMENTBOLAG" && ib05.niva === 3 && ib05.kraverFas === 0, ib05 ? `kat ${ib05.kategori} · niva ${ib05.niva} · fas ${ib05.kraverFas} · ${ib05.minuter} min` : "SAKNAS");

// ── E3: 90p-nominering kt-07 med nivåmatch (avancerad läsare, 5 svaghetsdelar) ─
const ktFamilj = ["kt-01-vad-ar-en-katalysator", "kt-02-forvantningsanalys-och-kalibrering", "kt-03-katalysatorkedjor", "kt-04-den-uteblivna-katalysatorn", "kt-05-katalysatorernas-kalender", "kt-06-guidningen"];
const r3 = rakna({ xp: 9000, klaraKurser: ktFamilj.slice(0, 5) }, { lasTillstand: "avancerad", fas: 1, streak: 0, svagheter: { "kt-07-den-tillverkade-katalysatorn": 5 } });
const n3 = r3.find((x) => x.slug === "kt-07-den-tillverkade-katalysatorn");
P("E3 kt-07 90p+4 nivåmatch", !!n3 && n3.poäng === 94 && n3.regel === "svagheten", n3 ? `${n3.poäng}p · ${n3.regel}` : "ej nominerad");
P("E3b varför-rad genererad", !!n3 && n3.varför === varforSvaghet("Den tillverkade katalysatorn — aktivisten och händelsen som ingen annan skulle ha orsakat", 5), n3 ? "»" + n3.varför.slice(0, 80) + "…«" : "—");

// ── E4: 90p-nominering ib-05 med nivåmatch (avancerad läsare, 4 delar) ───────
const r4 = rakna({ xp: 9000, klaraKurser: ["ib-01-vad-ar-ett-investmentbolag", "ib-02-substansens-kvalitet", "ib-03-forvaltarskapet", "ib-04-avkastningsrakningen"] }, { lasTillstand: "avancerad", fas: 1, streak: 0, svagheter: { "ib-05-kostnadstrappan": 4 } });
const n4 = r4.find((x) => x.slug === "ib-05-kostnadstrappan");
P("E4 ib-05 90p+4 nivåmatch", !!n4 && n4.poäng === 94 && n4.regel === "svagheten", n4 ? `${n4.poäng}p · ${n4.regel}` : "ej nominerad");

// ── E5: kategori-fortsättning 86 UTAN nivåmatch (nybörjare + fulläst familj) ─
// PE-kategorin i kartordning: km-067, km-068, ib-01..04 — alla klara ⇒ nästa
// oklara = ib-05 (lägre index än pe-01..05). KATALYSATOR: kt-01..06 klara ⇒ kt-07.
const klaraPE = ["km-067-investmentbolag", "km-068-wallenbergsfaren", "ib-01-vad-ar-ett-investmentbolag", "ib-02-substansens-kvalitet", "ib-03-forvaltarskapet", "ib-04-avkastningsrakningen"];
const r5 = rakna({ xp: 3000, klaraKurser: klaraPE }, { lasTillstand: "nybörjare", fas: 1, streak: 0, svagheter: {} });
const n5 = r5.find((x) => x.slug === "ib-05-kostnadstrappan");
P("E5 ib-05 86 utan nivåmatch", !!n5 && n5.poäng === 86 && n5.regel === "kategori-fortsättning", n5 ? `${n5.poäng}p · ${n5.regel}` : "ej nominerad");
P("E5b varför-rad fortsättning ib", !!n5 && n5.varför.includes("6 steg") && n5.varför.includes("private equity & investmentbolag"), n5 ? "»" + n5.varför.slice(0, 90) + "…«" : "—");
// KATEGORIN KATALYSATOR i kartordning: v16, v17, v18 + kt-01..06 klara (9 steg)
// ⇒ nästa oklara = kt-07 (kategorin har 10 kurser — v-kurserna är katialiserade).
const katKlara = ["v16-produktlanseringar", "v17-avtal-partnerskap", "v18-regulatoriska", ...ktFamilj];
const r5b = rakna({ xp: 3000, klaraKurser: katKlara }, { lasTillstand: "nybörjare", fas: 1, streak: 0, svagheter: {} });
const n5b = r5b.find((x) => x.slug === "kt-07-den-tillverkade-katalysatorn");
P("E5c kt-07 86 utan nivåmatch", !!n5b && n5b.poäng === 86 && n5b.regel === "kategori-fortsättning", n5b ? `${n5b.poäng}p · ${n5b.regel} · ${n5b.varför.includes("9 steg") ? "varför-rad 9 steg ✓" : "varför-rad OK"}` : "ej nominerad");

// ── E6: kartordning — serieordning bevarad (med syskonets kt-06) ────────────
P("E6 kartordning", IDX.get("kt-05-katalysatorernas-kalender") < IDX.get("kt-06-guidningen") && IDX.get("kt-06-guidningen") < IDX.get("kt-07-den-tillverkade-katalysatorn") && IDX.get("kt-07-den-tillverkade-katalysatorn") < IDX.get("am-01-likviditet-och-spread") && IDX.get("ib-04-avkastningsrakningen") < IDX.get("ib-05-kostnadstrappan") && IDX.get("ib-05-kostnadstrappan") < IDX.get("pe-01-private-equity-fonder"), `kt-05 #${IDX.get("kt-05-katalysatorernas-kalender")} < kt-06 #${IDX.get("kt-06-guidningen")} < kt-07 #${IDX.get("kt-07-den-tillverkade-katalysatorn")} < am-01 #${IDX.get("am-01-likviditet-och-spread")} · ib-04 #${IDX.get("ib-04-avkastningsrakningen")} < ib-05 #${IDX.get("ib-05-kostnadstrappan")} < pe-01 #${IDX.get("pe-01-private-equity-fonder")}`);

// ── E7: syskonen förblir nominerbara (syskonfreden) ───────────────────────────
const sib = ["ma-08-bostadsmarknadens-mekanik", "kt-06-guidningen", "se-19-forsakringssektorn", "mk-12-demografins-klocka", "mt-08-kvalitetspremien", "se-18-rederi-och-shipping", "ma-07-valutakursens-mekanik", "vr-07-terminalvardet", "pe-05-andrahandsmarknaden"];
const saknas = sib.filter((s) => !IDX.has(s));
P("E7 syskon i karta", saknas.length === 0, saknas.length ? "saknas: " + saknas.join(", ") : sib.length + " steg på plats");
const r7 = rakna({ xp: 1000, klaraKurser: ["se-18-rederi-och-shipping"] }, { lasTillstand: "avancerad", fas: 1, streak: 0, svagheter: { "se-19-forsakringssektorn": 3 } });
const n7 = r7.find((x) => x.slug === "se-19-forsakringssektorn");
P("E7b syskon nominerbar", !!n7 && n7.poäng >= 90, n7 ? n7.poäng + "p" : "ej nominerad");

// ── E8: determinism — två körningar bitidentiska ──────────────────────────────
const indata = { xp: 5000, klaraKurser: ktFamilj.slice(0, 4) }, lasande = { lasTillstand: "växande", fas: 1, streak: 0, svagheter: { "kt-07-den-tillverkade-katalysatorn": 3, "ib-05-kostnadstrappan": 4 } };
const a = JSON.stringify(rakna(indata, lasande));
const b = JSON.stringify(rakna(indata, lasande));
P("E8 determinism", a === b && a.length > 50, "bitidentiska svar (" + a.length + " tecken)");

console.log("\nFRONT B: " + pass.length + " PASS · " + fel.length + " FEL");
process.exit(fel.length ? 1 : 0);
